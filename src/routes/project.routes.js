const express = require('express');
const router = express.Router();
const Project = require('../models/Project');
const { authenticateAdmin } = require('../middleware/auth');

// Get all projects (public)
router.get('/', async (req, res) => {
  try {
    const { category, featured, limit, page } = req.query;
    const filter = {};
    
    if (category) filter.category = category;
    if (featured) filter.featured = featured === 'true';

    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 10;
    const skip = (pageNum - 1) * limitNum;

    const projects = await Project.find(filter)
      .sort({ completionDate: -1 })
      .skip(skip)
      .limit(limitNum);

    const total = await Project.countDocuments(filter);

    res.json({
      success: true,
      data: projects,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch projects',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Get single project (public)
router.get('/:id', async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    res.json({
      success: true,
      data: project
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch project',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Get project categories (public)
router.get('/meta/categories', async (req, res) => {
  try {
    const categories = await Project.distinct('category');
    
    res.json({
      success: true,
      data: categories
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch categories',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Get project statistics (admin only)
router.get('/meta/stats', authenticateAdmin, async (req, res) => {
  try {
    const totalProjects = await Project.countDocuments();
    const featuredProjects = await Project.countDocuments({ featured: true });
    const categoryCounts = await Project.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    res.json({
      success: true,
      data: {
        totalProjects,
        featuredProjects,
        categoryCounts
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch statistics',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Create new project (admin only)
router.post('/', authenticateAdmin, async (req, res) => {
  try {
    const projectData = {
      ...req.body,
      createdBy: req.admin._id
    };

    const project = await Project.create(projectData);
    
    res.status(201).json({
      success: true,
      message: 'Project created successfully',
      data: project
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to create project',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Update project (admin only)
router.put('/:id', authenticateAdmin, async (req, res) => {
  try {
    const updateData = {
      ...req.body,
      updatedBy: req.admin._id,
      updatedAt: new Date()
    };

    const project = await Project.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    res.json({
      success: true,
      message: 'Project updated successfully',
      data: project
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update project',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Toggle featured status (admin only)
router.patch('/:id/featured', authenticateAdmin, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    project.featured = !project.featured;
    project.updatedBy = req.admin._id;
    project.updatedAt = new Date();
    
    await project.save();

    res.json({
      success: true,
      message: `Project ${project.featured ? 'featured' : 'unfeatured'} successfully`,
      data: project
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update featured status',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Delete project (admin only)
router.delete('/:id', authenticateAdmin, async (req, res) => {
  try {
    const project = await Project.findByIdAndDelete(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    res.json({
      success: true,
      message: 'Project deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete project',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Bulk operations (admin only)
router.post('/bulk/featured', authenticateAdmin, async (req, res) => {
  try {
    const { projectIds, featured } = req.body;
    
    const result = await Project.updateMany(
      { _id: { $in: projectIds } },
      { 
        featured,
        updatedBy: req.admin._id,
        updatedAt: new Date()
      }
    );

    res.json({
      success: true,
      message: `${result.modifiedCount} projects updated successfully`,
      data: { modifiedCount: result.modifiedCount }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update projects',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

router.delete('/bulk/delete', authenticateAdmin, async (req, res) => {
  try {
    const { projectIds } = req.body;
    
    const result = await Project.deleteMany({ _id: { $in: projectIds } });

    res.json({
      success: true,
      message: `${result.deletedCount} projects deleted successfully`,
      data: { deletedCount: result.deletedCount }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete projects',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router; 