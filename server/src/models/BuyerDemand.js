const mongoose = require('mongoose');
const { CATEGORIES } = require('./Listing');

// ─── Buyer Demand Statuses ──────────────────────────────────────────────────────
const DEMAND_STATUSES = ['open', 'fulfilled', 'expired'];

// ─── Buyer Demand Schema ────────────────────────────────────────────────────────
// Solves the "asymmetric visibility" problem:
// Buyers can post what they're looking for, not just browse listings.
const buyerDemandSchema = new mongoose.Schema(
  {
    buyer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Buyer is required'],
      index: true,
    },

    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [120, 'Title cannot exceed 120 characters'],
    },

    description: {
      type: String,
      trim: true,
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
      default: '',
    },

    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: {
        values: CATEGORIES,
        message: '{VALUE} is not a valid category',
      },
    },

    budgetMin: {
      type: Number,
      min: [0, 'Minimum budget cannot be negative'],
      default: null,
    },

    budgetMax: {
      type: Number,
      min: [0, 'Maximum budget cannot be negative'],
      validate: {
        validator: function (v) {
          if (v === null || v === undefined) return true;
          if (this.budgetMin !== null && this.budgetMin !== undefined) {
            return v >= this.budgetMin;
          }
          return true;
        },
        message: 'Maximum budget must be greater than or equal to minimum budget',
      },
      default: null,
    },

    status: {
      type: String,
      enum: {
        values: DEMAND_STATUSES,
        message: '{VALUE} is not a valid demand status',
      },
      default: 'open',
    },

    // Auto-expire after 30 days
    expiresAt: {
      type: Date,
      default: function () {
        const now = new Date();
        now.setDate(now.getDate() + 30);
        return now;
      },
      index: true,
    },

    // Track how many sellers have responded
    responseCount: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ─── Virtuals ───────────────────────────────────────────────────────────────────

// Check if the demand has expired
buyerDemandSchema.virtual('isExpired').get(function () {
  return new Date() > this.expiresAt;
});

// Budget range display string
buyerDemandSchema.virtual('budgetRange').get(function () {
  if (this.budgetMin !== null && this.budgetMax !== null) {
    return `₹${this.budgetMin} - ₹${this.budgetMax}`;
  }
  if (this.budgetMin !== null) return `₹${this.budgetMin}+`;
  if (this.budgetMax !== null) return `Up to ₹${this.budgetMax}`;
  return 'Flexible';
});

// ─── Indexes ────────────────────────────────────────────────────────────────────
buyerDemandSchema.index({ category: 1, status: 1 });
buyerDemandSchema.index({ createdAt: -1 });
buyerDemandSchema.index({ title: 'text', description: 'text' });

// ─── Export ─────────────────────────────────────────────────────────────────────
const BuyerDemand = mongoose.model('BuyerDemand', buyerDemandSchema);

module.exports = BuyerDemand;
module.exports.DEMAND_STATUSES = DEMAND_STATUSES;
