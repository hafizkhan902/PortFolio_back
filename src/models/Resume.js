const mongoose = require('mongoose');

const resumeSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Resume title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  originalName: {
    type: String,
    required: [true, 'Original filename is required'],
    trim: true
  },
  fileData: {
    type: Buffer,
    required: [true, 'File data is required']
  },
  contentType: {
    type: String,
    required: [true, 'Content type is required'],
    default: 'application/pdf'
  },
  fileSize: {
    type: Number,
    required: [true, 'File size is required'],
    min: [0, 'File size must be positive']
  },
  version: {
    type: String,
    required: [true, 'Version is required'],
    trim: true,
    default: '1.0'
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isPublic: {
    type: Boolean,
    default: true
  },
  downloadCount: {
    type: Number,
    default: 0
  },
  tags: [{
    type: String,
    trim: true,
    maxlength: [50, 'Tag cannot exceed 50 characters']
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
resumeSchema.index({ isActive: 1 });
resumeSchema.index({ isPublic: 1 });
resumeSchema.index({ version: 1 });
resumeSchema.index({ createdAt: -1 });

// Ensure unique version
resumeSchema.index({ version: 1 }, { unique: true });

// Static method to get active resume
resumeSchema.statics.getActive = function() {
  return this.findOne({ isActive: true, isPublic: true })
    .sort({ createdAt: -1 })
    .populate('createdBy', 'username email')
    .select('-fileData') // Exclude file data for performance
    .lean();
};

// Static method to get all resumes (admin)
resumeSchema.statics.getAll = function() {
  return this.find({})
    .sort({ createdAt: -1 })
    .populate('createdBy', 'username email')
    .populate('updatedBy', 'username email')
    .select('-fileData') // Exclude file data for performance
    .lean();
};

// Static method to get public resumes
resumeSchema.statics.getPublic = function() {
  return this.find({ isActive: true, isPublic: true })
    .sort({ createdAt: -1 })
    .select('title originalName version description tags downloadCount createdAt')
    .lean();
};

// Static method to get resume with file data for download
resumeSchema.statics.getForDownload = function(id) {
  return this.findOne({ 
    _id: id, 
    isActive: true, 
    isPublic: true 
  }).select('fileData contentType originalName fileSize');
};

// Instance method to increment download count
resumeSchema.methods.incrementDownload = function() {
  this.downloadCount += 1;
  return this.save();
};

// Instance method to toggle active status
resumeSchema.methods.toggleActive = function() {
  this.isActive = !this.isActive;
  return this.save();
};

// Instance method to toggle public status
resumeSchema.methods.togglePublic = function() {
  this.isPublic = !this.isPublic;
  return this.save();
};

// Method to convert to JSON (remove sensitive fields for public API)
resumeSchema.methods.toPublicJSON = function() {
  const obj = this.toObject();
  delete obj.fileData; // Remove file data from JSON response
  delete obj.createdBy;
  delete obj.updatedBy;
  delete obj.__v;
  return obj;
};

module.exports = mongoose.model('Resume', resumeSchema); 