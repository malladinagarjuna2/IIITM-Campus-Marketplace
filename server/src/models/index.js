// ─── Models Index ───────────────────────────────────────────────────────────────
// Central export for all Mongoose models
const User = require('./User');
const Listing = require('./Listing');
const BuyerDemand = require('./BuyerDemand');
const Chat = require('./Chat');
const Transaction = require('./Transaction');
const Rating = require('./Rating');

module.exports = {
  User,
  Listing,
  BuyerDemand,
  Chat,
  Transaction,
  Rating,
};
