const mongoose = require('mongoose');

const UpdateSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  updateText: {
    type: String,
    required: [true, 'Please add update text']
  },
  sentiment: {
    type: String,
    enum: ['positive', 'neutral', 'negative'],
    default: 'neutral'
  },
  summary: {
    type: String
  },
  hasBlocker: {
    type: Boolean,
    default: false
  },
  blockerText: {
    type: String
  },
  encouragement: {
    type: String
  },
  date: {
    type: Date,
    required: true,
    default: () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return today;
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Compound index to ensure fast queries on user updates sorted by date
UpdateSchema.index({ userId: 1, date: -1 });

module.exports = mongoose.model('Update', UpdateSchema);
