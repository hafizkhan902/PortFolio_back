const mongoose = require('mongoose');

const skillSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Skill name is required'],
    trim: true,
    maxlength: [100, 'Skill name cannot exceed 100 characters']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: {
      values: ['frontend', 'backend', 'database', 'devops', 'tools', 'languages', 'frameworks', 'cloud', 'mobile', 'uiux', 'other'],
      message: 'Category must be one of: frontend, backend, database, devops, tools, languages, frameworks, cloud, mobile, uiux, other'
    }
  },
  proficiency: {
    type: String,
    required: [true, 'Proficiency level is required'],
    enum: {
      values: ['beginner', 'intermediate', 'advanced', 'expert'],
      message: 'Proficiency must be one of: beginner, intermediate, advanced, expert'
    }
  },
  proficiencyLevel: {
    type: Number,
    required: [true, 'Proficiency level number is required'],
    min: [1, 'Proficiency level must be at least 1'],
    max: [100, 'Proficiency level cannot exceed 100']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  icon: {
    library: {
      type: String,
      trim: true,
      enum: ['react-icons/fa', 'react-icons/si', 'react-icons/di', 'react-icons/ai', 'react-icons/bi', 'react-icons/bs', 'react-icons/fi', 'react-icons/gi', 'react-icons/go', 'react-icons/gr', 'react-icons/hi', 'react-icons/im', 'react-icons/io', 'react-icons/io5', 'react-icons/md', 'react-icons/ri', 'react-icons/tb', 'react-icons/ti', 'react-icons/vsc', 'react-icons/wi'],
      maxlength: [50, 'Icon library cannot exceed 50 characters']
    },
    name: {
      type: String,
      trim: true,
      maxlength: [100, 'Icon name cannot exceed 100 characters']
    },
    size: {
      type: Number,
      min: [12, 'Icon size must be at least 12px'],
      max: [200, 'Icon size cannot exceed 200px'],
      default: 24
    },
    className: {
      type: String,
      trim: true,
      maxlength: [200, 'Icon className cannot exceed 200 characters']
    }
  },
  color: {
    type: String,
    trim: true,
    match: [/^#[0-9A-Fa-f]{6}$/, 'Color must be a valid hex color code']
  },
  displayOrder: {
    type: Number,
    required: [true, 'Display order is required'],
    min: [0, 'Display order must be at least 0']
  },
  isActive: {
    type: Boolean,
    default: true
  },
  yearsOfExperience: {
    type: Number,
    min: [0, 'Years of experience must be at least 0'],
    max: [50, 'Years of experience cannot exceed 50']
  },
  projects: [{
    type: String,
    trim: true,
    maxlength: [200, 'Project name cannot exceed 200 characters']
  }],
  certifications: [{
    name: {
      type: String,
      trim: true,
      maxlength: [200, 'Certification name cannot exceed 200 characters']
    },
    issuer: {
      type: String,
      trim: true,
      maxlength: [100, 'Issuer name cannot exceed 100 characters']
    },
    date: {
      type: Date
    },
    url: {
      type: String,
      trim: true,
      maxlength: [500, 'URL cannot exceed 500 characters']
    }
  }],
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
skillSchema.index({ isActive: 1 });
skillSchema.index({ proficiency: 1 });

// Compound index for unique display order within category
skillSchema.index({ category: 1, displayOrder: 1 }, { unique: true });

// Static method to get skills ordered by category and display order
skillSchema.statics.getOrdered = function() {
  return this.find({ isActive: true })
    .sort({ category: 1, displayOrder: 1 })
    .select('name category proficiency proficiencyLevel description icon color displayOrder yearsOfExperience projects certifications createdAt updatedAt')
    .lean();
};

// Static method to get skills grouped by category
skillSchema.statics.getGroupedByCategory = function() {
  return this.aggregate([
    { $match: { isActive: true } },
    { $sort: { category: 1, displayOrder: 1 } },
    {
      $group: {
        _id: '$category',
        skills: {
          $push: {
            _id: '$_id',
            name: '$name',
            proficiency: '$proficiency',
            proficiencyLevel: '$proficiencyLevel',
            description: '$description',
            icon: '$icon',
            color: '$color',
            displayOrder: '$displayOrder',
            yearsOfExperience: '$yearsOfExperience',
            projects: '$projects',
            certifications: '$certifications'
          }
        },
        count: { $sum: 1 }
      }
    },
    { $sort: { _id: 1 } }
  ]);
};

// Static method to get next available display order for a category
skillSchema.statics.getNextDisplayOrder = async function(category) {
  const lastSkill = await this.findOne({ category })
    .sort({ displayOrder: -1 })
    .select('displayOrder');
  
  return lastSkill ? lastSkill.displayOrder + 1 : 1;
};

// Static method to get skills statistics
skillSchema.statics.getStats = function() {
  return this.aggregate([
    {
      $group: {
        _id: null,
        totalSkills: { $sum: 1 },
        activeSkills: { $sum: { $cond: ['$isActive', 1, 0] } },
        categoryCounts: {
          $push: {
            category: '$category',
            active: '$isActive'
          }
        }
      }
    },
    {
      $project: {
        _id: 0,
        totalSkills: 1,
        activeSkills: 1,
        inactiveSkills: { $subtract: ['$totalSkills', '$activeSkills'] }
      }
    }
  ]);
};

// Method to convert to JSON (remove sensitive fields for public API)
skillSchema.methods.toPublicJSON = function() {
  const obj = this.toObject();
  delete obj.createdBy;
  delete obj.updatedBy;
  delete obj.__v;
  return obj;
};

module.exports = mongoose.model('Skill', skillSchema); 