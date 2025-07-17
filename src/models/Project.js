const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Project title is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Project description is required'],
    trim: true
  },
  shortDescription: {
    type: String,
    trim: true,
    maxlength: [200, 'Short description cannot exceed 200 characters']
  },
  technologies: [{
    type: String,
    required: true
  }],
  imageUrl: {
    type: String,
    required: [true, 'Project image URL is required']
  },
  images: [{
    url: String,
    caption: String,
    alt: String
  }],
  githubUrl: {
    type: String,
    required: [true, 'GitHub URL is required'],
    trim: true
  },
  liveUrl: {
    type: String,
    trim: true
  },
  demoUrl: {
    type: String,
    trim: true
  },
  category: {
    type: String,
    required: true,
    enum: {
      values: ['Web', 'UI', 'Fullstack', 'Research', 'Mobile', 'Desktop', 'API', 'Other'],
      message: 'Category must be one of: Web, UI, Fullstack, Research, Mobile, Desktop, API, Other'
    }
  },
  featured: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    enum: ['completed', 'in-progress', 'on-hold', 'cancelled'],
    default: 'completed'
  },
  priority: {
    type: Number,
    default: 0,
    min: 0,
    max: 10
  },
  completionDate: {
    type: Date,
    required: true
  },
  startDate: {
    type: Date
  },
  challenges: [{
    type: String,
    trim: true
  }],
  solutions: [{
    type: String,
    trim: true
  }],
  features: [{
    type: String,
    trim: true
  }],
  tags: [{
    type: String,
    trim: true
  }],
  metrics: {
    views: { type: Number, default: 0 },
    likes: { type: Number, default: 0 },
    shares: { type: Number, default: 0 }
  },
  seoMetadata: {
    metaTitle: String,
    metaDescription: String,
    keywords: [String]
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
projectSchema.index({ category: 1, featured: 1 });
projectSchema.index({ completionDate: -1 });
projectSchema.index({ createdAt: -1 });
projectSchema.index({ featured: 1, priority: -1 });

// Virtual for project age
projectSchema.virtual('age').get(function() {
  return Math.floor((new Date() - this.completionDate) / (1000 * 60 * 60 * 24));
});

// Update the updatedAt field before saving
projectSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Static method to get categories
projectSchema.statics.getCategories = function() {
  return this.schema.path('category').enumValues;
};

// Static method to get featured projects
projectSchema.statics.getFeatured = function(limit = 6) {
  return this.find({ featured: true })
    .sort({ priority: -1, completionDate: -1 })
    .limit(limit);
};

// Instance method to toggle featured status
projectSchema.methods.toggleFeatured = function() {
  this.featured = !this.featured;
  return this.save();
};

module.exports = mongoose.model('Project', projectSchema); 