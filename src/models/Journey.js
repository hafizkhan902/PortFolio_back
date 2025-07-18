const mongoose = require('mongoose');

const journeySchema = new mongoose.Schema({
  year: {
    type: Number,
    required: [true, 'Year is required'],
    min: [1900, 'Year must be after 1900'],
    max: [new Date().getFullYear() + 10, 'Year cannot be more than 10 years in the future']
  },
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  displayOrder: {
    type: Number,
    required: [true, 'Display order is required'],
    min: [0, 'Display order must be a positive number']
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin'
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Index for better query performance
journeySchema.index({ year: -1 });
journeySchema.index({ createdAt: -1 });

// Ensure unique display order
journeySchema.index({ displayOrder: 1 }, { unique: true });

// Update the updatedAt field before saving
journeySchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Static method to get all journeys ordered by display order
journeySchema.statics.getOrdered = function() {
  return this.find({})
    .sort({ displayOrder: 1 })
    .populate('createdBy', 'username email')
    .populate('updatedBy', 'username email');
};

// Static method to get next available display order
journeySchema.statics.getNextDisplayOrder = async function() {
  const lastJourney = await this.findOne({}).sort({ displayOrder: -1 });
  return lastJourney ? lastJourney.displayOrder + 1 : 1;
};

module.exports = mongoose.model('Journey', journeySchema); 