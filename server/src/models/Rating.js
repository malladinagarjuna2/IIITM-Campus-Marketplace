const mongoose = require('mongoose');

// ─── Rating Schema ──────────────────────────────────────────────────────────────
// Stored separately from User for true anonymity.
// The `rater` field is never exposed in API responses.
const ratingSchema = new mongoose.Schema(
  {
    transaction: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Transaction',
      required: [true, 'Transaction reference is required'],
    },

    rater: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Rater is required'],
    },

    ratee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Ratee is required'],
    },

    score: {
      type: Number,
      required: [true, 'Rating score is required'],
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot exceed 5'],
      validate: {
        validator: Number.isInteger,
        message: 'Rating must be a whole number',
      },
    },

    comment: {
      type: String,
      trim: true,
      maxlength: [500, 'Comment cannot exceed 500 characters'],
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// ─── Unique Constraint ─────────────────────────────────────────────────────────
// One rating per rater per transaction
ratingSchema.index({ transaction: 1, rater: 1 }, { unique: true });
ratingSchema.index({ ratee: 1 });

// ─── Post-Save Hook: Update User Rating Aggregates ──────────────────────────────
ratingSchema.post('save', async function (doc) {
  try {
    const User = mongoose.model('User');
    await User.findByIdAndUpdate(doc.ratee, {
      $inc: {
        ratingSum: doc.score,
        ratingCount: 1,
      },
    });

    // Also mark the transaction as rated by this user
    const Transaction = mongoose.model('Transaction');
    const transaction = await Transaction.findById(doc.transaction);
    if (transaction) {
      const isBuyer = transaction.buyer.toString() === doc.rater.toString();
      if (isBuyer) {
        transaction.buyerRated = true;
      } else {
        transaction.sellerRated = true;
      }
      await transaction.save();
    }
  } catch (err) {
    console.error('Error updating user rating aggregates:', err.message);
  }
});

// ─── Static Methods ─────────────────────────────────────────────────────────────

// Get all ratings for a user (comments only, no rater info — anonymous)
ratingSchema.statics.getAnonymousRatingsForUser = async function (userId) {
  return this.find({ ratee: userId })
    .select('score comment createdAt -_id')
    .sort({ createdAt: -1 });
};

// Check if a user has already rated for a specific transaction
ratingSchema.statics.hasUserRated = async function (transactionId, userId) {
  const existing = await this.findOne({
    transaction: transactionId,
    rater: userId,
  });
  return !!existing;
};

// ─── Export ─────────────────────────────────────────────────────────────────────
const Rating = mongoose.model('Rating', ratingSchema);

module.exports = Rating;
