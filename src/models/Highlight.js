const mongoose = require('mongoose');

const highlightSchema = new mongoose.Schema({
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
  shortDescription: {
    type: String,
    trim: true,
    maxlength: [300, 'Short description cannot exceed 300 characters']
  },
  imageUrl: {
    type: String,
    required: [true, 'Image URL is required'],
    trim: true
  },
  images: [{
    url: {
      type: String,
      required: true,
      trim: true
    },
    caption: {
      type: String,
      trim: true,
      maxlength: [200, 'Caption cannot exceed 200 characters']
    },
    alt: {
      type: String,
      trim: true,
      maxlength: [200, 'Alt text cannot exceed 200 characters']
    }
  }],
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: {
      values: ['ui-design', 'ux-research', 'mobile-app', 'web-design', 'branding', 'prototype', 'wireframe', 'user-testing', 'other'],
      message: 'Category must be one of: ui-design, ux-research, mobile-app, web-design, branding, prototype, wireframe, user-testing, other'
    }
  },
  tools: [{
    type: String,
    trim: true,
    maxlength: [100, 'Tool name cannot exceed 100 characters']
  }],
  projectUrl: {
    type: String,
    trim: true
  },
  behanceUrl: {
    type: String,
    trim: true
  },
  dribbbleUrl: {
    type: String,
    trim: true
  },
  figmaUrl: {
    type: String,
    trim: true
  },
  tags: [{
    type: String,
    trim: true,
    maxlength: [50, 'Tag cannot exceed 50 characters']
  }],
  featured: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  displayOrder: {
    type: Number,
    required: [true, 'Display order is required'],
    min: [0, 'Display order must be at least 0']
  },
  completionDate: {
    type: Date,
    required: [true, 'Completion date is required']
  },
  clientName: {
    type: String,
    trim: true,
    maxlength: [100, 'Client name cannot exceed 100 characters']
  },
  projectDuration: {
    type: String,
    trim: true,
    maxlength: [100, 'Project duration cannot exceed 100 characters']
  },
  challenges: [{
    type: String,
    trim: true,
    maxlength: [500, 'Challenge description cannot exceed 500 characters']
  }],
  solutions: [{
    type: String,
    trim: true,
    maxlength: [500, 'Solution description cannot exceed 500 characters']
  }],
  keyFeatures: [{
    type: String,
    trim: true,
    maxlength: [200, 'Feature description cannot exceed 200 characters']
  }],
  userFeedback: [{
    feedback: {
      type: String,
      trim: true,
      maxlength: [500, 'Feedback cannot exceed 500 characters']
    },
    rating: {
      type: Number,
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot exceed 5']
    },
    userName: {
      type: String,
      trim: true,
      maxlength: [100, 'User name cannot exceed 100 characters']
    }
  }],
  metrics: {
    views: { type: Number, default: 0 },
    likes: { type: Number, default: 0 },
    shares: { type: Number, default: 0 },
    downloads: { type: Number, default: 0 }
  },
  seoMetadata: {
    metaTitle: {
      type: String,
      trim: true,
      maxlength: [60, 'Meta title cannot exceed 60 characters']
    },
    metaDescription: {
      type: String,
      trim: true,
      maxlength: [160, 'Meta description cannot exceed 160 characters']
    },
    keywords: [{
      type: String,
      trim: true,
      maxlength: [50, 'Keyword cannot exceed 50 characters']
    }]
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    required: true
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin'
  }
}, {
  timestamps: true
});

// Indexes for better performance
highlightSchema.index({ isActive: 1 });
highlightSchema.index({ featured: 1 });
highlightSchema.index({ category: 1 });
highlightSchema.index({ completionDate: -1 });

// Compound index for unique display order
highlightSchema.index({ displayOrder: 1 }, { unique: true });

// Static method to get highlights ordered by display order
highlightSchema.statics.getOrdered = function() {
  return this.find({ isActive: true })
    .sort({ displayOrder: 1 })
    .select('title description shortDescription imageUrl images category tools projectUrl behanceUrl dribbbleUrl figmaUrl tags featured displayOrder completionDate clientName projectDuration keyFeatures metrics createdAt updatedAt')
    .lean();
};

// Static method to get highlights grouped by category
highlightSchema.statics.getGroupedByCategory = function() {
  return this.aggregate([
    { $match: { isActive: true } },
    { $sort: { category: 1, displayOrder: 1 } },
    {
      $group: {
        _id: '$category',
        highlights: {
          $push: {
            _id: '$_id',
            title: '$title',
            description: '$description',
            shortDescription: '$shortDescription',
            imageUrl: '$imageUrl',
            images: '$images',
            tools: '$tools',
            projectUrl: '$projectUrl',
            behanceUrl: '$behanceUrl',
            dribbbleUrl: '$dribbbleUrl',
            figmaUrl: '$figmaUrl',
            tags: '$tags',
            featured: '$featured',
            displayOrder: '$displayOrder',
            completionDate: '$completionDate',
            clientName: '$clientName',
            projectDuration: '$projectDuration',
            keyFeatures: '$keyFeatures',
            metrics: '$metrics'
          }
        },
        count: { $sum: 1 }
      }
    },
    { $sort: { _id: 1 } }
  ]);
};

// Static method to get featured highlights
highlightSchema.statics.getFeatured = function(limit = 6) {
  return this.find({ featured: true, isActive: true })
    .sort({ displayOrder: 1 })
    .limit(limit)
    .lean();
};

// Static method to get next available display order
highlightSchema.statics.getNextDisplayOrder = async function() {
  const lastHighlight = await this.findOne({})
    .sort({ displayOrder: -1 })
    .select('displayOrder');
  
  return lastHighlight ? lastHighlight.displayOrder + 1 : 1;
};

// Static method to get highlights statistics
highlightSchema.statics.getStats = function() {
  return this.aggregate([
    {
      $group: {
        _id: null,
        totalHighlights: { $sum: 1 },
        activeHighlights: { $sum: { $cond: ['$isActive', 1, 0] } },
        featuredHighlights: { $sum: { $cond: ['$featured', 1, 0] } },
        categoryStats: {
          $push: {
            category: '$category',
            active: '$isActive',
            featured: '$featured'
          }
        }
      }
    },
    {
      $project: {
        _id: 0,
        totalHighlights: 1,
        activeHighlights: 1,
        featuredHighlights: 1,
        inactiveHighlights: { $subtract: ['$totalHighlights', '$activeHighlights'] }
      }
    }
  ]);
};

// Static method to get categories
highlightSchema.statics.getCategories = function() {
  return this.schema.path('category').enumValues;
};

// Instance method to toggle featured status
highlightSchema.methods.toggleFeatured = function() {
  this.featured = !this.featured;
  return this.save();
};

// Instance method to toggle active status
highlightSchema.methods.toggleActive = function() {
  this.isActive = !this.isActive;
  return this.save();
};

// Method to convert to JSON (remove sensitive fields for public API)
highlightSchema.methods.toPublicJSON = function() {
  const obj = this.toObject();
  delete obj.createdBy;
  delete obj.updatedBy;
  delete obj.__v;
  return obj;
};

module.exports = mongoose.model('Highlight', highlightSchema); 