const mongoose = require('mongoose');

// ─── Offer Schema (for Negotiation Rounds) ──────────────────────────────────────
const offerSchema = new mongoose.Schema(
  {
    round: {
      type: Number,
      required: true,
      min: 1,
      max: 3,
    },

    amount: {
      type: Number,
      required: [true, 'Offer amount is required'],
      min: [0, 'Offer cannot be negative'],
    },

    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected'],
      default: 'pending',
    },
  },
  {
    timestamps: true,
  }
);

// ─── Negotiation Sub-document ───────────────────────────────────────────────────
const negotiationSchema = new mongoose.Schema(
  {
    currentRound: {
      type: Number,
      default: 1,
      min: 1,
      max: 3,
    },

    maxRounds: {
      type: Number,
      default: 3,
    },

    offers: [offerSchema],

    outcome: {
      type: String,
      enum: ['pending', 'accepted', 'rejected', 'expired'],
      default: 'pending',
    },

    agreedPrice: {
      type: Number,
      min: 0,
      default: null,
    },
  },
  {
    _id: false, // No separate ID for embedded sub-document
  }
);

// ─── Message Schema ─────────────────────────────────────────────────────────────
const messageSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Message sender is required'],
    },

    type: {
      type: String,
      enum: {
        values: ['text', 'quick-reply', 'offer', 'system'],
        message: '{VALUE} is not a valid message type',
      },
      required: true,
      default: 'text',
    },

    content: {
      type: String,
      required: [true, 'Message content is required'],
      maxlength: [2000, 'Message cannot exceed 2000 characters'],
    },

    // For offer-type messages, reference the offer round
    offerAmount: {
      type: Number,
      min: 0,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// ─── Quick Reply Presets ────────────────────────────────────────────────────────
const QUICK_REPLIES = {
  buyer: [
    'Is this still available?',
    'Can you share more photos?',
    'What\'s the lowest you\'ll go?',
    'When can we meet?',
    'Is the price negotiable?',
    'How old is this item?',
  ],
  seller: [
    'Yes, still available!',
    'Price is firm',
    'I can do a small discount',
    'Let\'s meet at the canteen',
    'Can you pick it up today?',
    'I\'ll send more photos',
  ],
};

// ─── Chat Schema ────────────────────────────────────────────────────────────────
const chatSchema = new mongoose.Schema(
  {
    listing: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Listing',
      required: [true, 'Listing reference is required'],
    },

    buyer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Buyer is required'],
    },

    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Seller is required'],
    },

    mode: {
      type: String,
      enum: {
        values: ['normal', 'negotiation'],
        message: '{VALUE} is not a valid chat mode',
      },
      default: 'normal',
    },

    // Embedded negotiation state (only active when mode = 'negotiation')
    negotiation: {
      type: negotiationSchema,
      default: null,
    },

    messages: [messageSchema],

    status: {
      type: String,
      enum: {
        values: ['active', 'completed', 'failed'],
        message: '{VALUE} is not a valid chat status',
      },
      default: 'active',
    },

    // Track the last message timestamp for sorting
    lastMessageAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ─── Virtuals ───────────────────────────────────────────────────────────────────

// Cards (rounds) remaining in negotiation
chatSchema.virtual('cardsRemaining').get(function () {
  if (!this.negotiation || this.mode !== 'negotiation') return null;
  return this.negotiation.maxRounds - this.negotiation.offers.length;
});

// Whether negotiation is still active
chatSchema.virtual('isNegotiationActive').get(function () {
  if (!this.negotiation) return false;
  return (
    this.mode === 'negotiation' &&
    this.negotiation.outcome === 'pending' &&
    this.status === 'active'
  );
});

// ─── Instance Methods ───────────────────────────────────────────────────────────

// Add a new message to the chat
chatSchema.methods.addMessage = function (senderId, type, content, offerAmount = null) {
  this.messages.push({
    sender: senderId,
    type,
    content,
    offerAmount,
  });
  this.lastMessageAt = new Date();
  return this;
};

// Start the negotiation mode
chatSchema.methods.startNegotiation = function () {
  if (this.mode === 'negotiation') {
    throw new Error('Negotiation already started');
  }
  this.mode = 'negotiation';
  this.negotiation = {
    currentRound: 1,
    maxRounds: 3,
    offers: [],
    outcome: 'pending',
    agreedPrice: null,
  };

  // Add system message
  this.addMessage(this.buyer, 'system', '🎴 Negotiation started! You have 3 bargaining cards.');
  return this;
};

// Submit a buyer offer (uses one bargaining card)
chatSchema.methods.submitOffer = function (amount) {
  if (!this.negotiation || this.negotiation.outcome !== 'pending') {
    throw new Error('No active negotiation');
  }
  if (this.negotiation.offers.length >= this.negotiation.maxRounds) {
    throw new Error('All bargaining cards have been used');
  }

  const round = this.negotiation.offers.length + 1;
  this.negotiation.offers.push({
    round,
    amount,
    status: 'pending',
  });
  this.negotiation.currentRound = round;

  this.addMessage(
    this.buyer,
    'offer',
    `💰 Offer #${round}: ₹${amount}`,
    amount
  );

  return this;
};

// Seller responds to an offer
chatSchema.methods.respondToOffer = function (accepted) {
  if (!this.negotiation || this.negotiation.outcome !== 'pending') {
    throw new Error('No active negotiation');
  }

  const lastOffer = this.negotiation.offers[this.negotiation.offers.length - 1];
  if (!lastOffer || lastOffer.status !== 'pending') {
    throw new Error('No pending offer to respond to');
  }

  if (accepted) {
    lastOffer.status = 'accepted';
    this.negotiation.outcome = 'accepted';
    this.negotiation.agreedPrice = lastOffer.amount;
    this.status = 'completed';
    this.addMessage(this.seller, 'system', `✅ Offer of ₹${lastOffer.amount} accepted! Deal closed.`);
  } else {
    lastOffer.status = 'rejected';
    const cardsLeft = this.negotiation.maxRounds - this.negotiation.offers.length;

    if (cardsLeft <= 0) {
      this.negotiation.outcome = 'rejected';
      this.status = 'failed';
      this.addMessage(this.seller, 'system', '❌ Offer rejected. No cards remaining — trade failed.');
    } else {
      this.addMessage(
        this.seller,
        'system',
        `❌ Offer rejected. ${cardsLeft} card${cardsLeft > 1 ? 's' : ''} remaining.`
      );
    }
  }

  return this;
};

// ─── Indexes ────────────────────────────────────────────────────────────────────
chatSchema.index({ listing: 1 });
chatSchema.index({ buyer: 1 });
chatSchema.index({ seller: 1 });
chatSchema.index({ lastMessageAt: -1 });
chatSchema.index({ buyer: 1, seller: 1, listing: 1 }, { unique: true }); // One chat per buyer-seller-listing

// ─── Export ─────────────────────────────────────────────────────────────────────
const Chat = mongoose.model('Chat', chatSchema);

module.exports = Chat;
module.exports.QUICK_REPLIES = QUICK_REPLIES;
