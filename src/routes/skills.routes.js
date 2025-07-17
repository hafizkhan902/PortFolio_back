const express = require('express');
const router = express.Router();
const Skill = require('../models/Skill');

// Get all skills (public endpoint)
router.get('/', async (req, res) => {
  try {
    const { category, proficiency, limit } = req.query;
    const filter = { isActive: true };
    
    // Filter by category if provided
    if (category) {
      filter.category = category;
    }
    
    // Filter by proficiency if provided
    if (proficiency) {
      filter.proficiency = proficiency;
    }

    let query = Skill.find(filter)
      .sort({ category: 1, displayOrder: 1 })
      .select('name category proficiency proficiencyLevel description icon color displayOrder yearsOfExperience projects certifications createdAt updatedAt')
      .lean();

    // Apply limit if provided
    if (limit) {
      query = query.limit(parseInt(limit));
    }

    const skills = await query;
    
    res.json({
      success: true,
      data: skills
    });
  } catch (error) {
    console.error('❌ Failed to fetch skills:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch skills',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Get skills grouped by category (public endpoint)
router.get('/grouped', async (req, res) => {
  try {
    const groupedSkills = await Skill.getGroupedByCategory();
    
    res.json({
      success: true,
      data: groupedSkills
    });
  } catch (error) {
    console.error('❌ Failed to fetch grouped skills:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch grouped skills',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Get single skill by ID (public endpoint)
router.get('/:id', async (req, res) => {
  try {
    const skill = await Skill.findOne({ _id: req.params.id, isActive: true })
      .select('name category proficiency proficiencyLevel description icon color displayOrder yearsOfExperience projects certifications createdAt updatedAt')
      .lean();
    
    if (!skill) {
      return res.status(404).json({
        success: false,
        message: 'Skill not found'
      });
    }

    res.json({
      success: true,
      data: skill
    });
  } catch (error) {
    console.error('❌ Failed to fetch skill:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch skill',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Get skills by category (public endpoint)
router.get('/category/:category', async (req, res) => {
  try {
    const { category } = req.params;
    const { limit } = req.query;
    
    // Validate category
    const validCategories = ['frontend', 'backend', 'database', 'devops', 'tools', 'languages', 'frameworks', 'cloud', 'mobile', 'other'];
    if (!validCategories.includes(category)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid category',
        validCategories
      });
    }

    let query = Skill.find({ category, isActive: true })
      .sort({ displayOrder: 1 })
      .select('name category proficiency proficiencyLevel description icon color displayOrder yearsOfExperience projects certifications createdAt updatedAt')
      .lean();

    if (limit) {
      query = query.limit(parseInt(limit));
    }

    const skills = await query;
    
    res.json({
      success: true,
      data: skills,
      category: category,
      count: skills.length
    });
  } catch (error) {
    console.error('❌ Failed to fetch skills by category:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch skills by category',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Get skills statistics (public endpoint)
router.get('/stats/overview', async (req, res) => {
  try {
    const [
      totalSkills,
      categoryStats,
      proficiencyStats
    ] = await Promise.all([
      Skill.countDocuments({ isActive: true }),
      Skill.aggregate([
        { $match: { isActive: true } },
        { $group: { _id: '$category', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]),
      Skill.aggregate([
        { $match: { isActive: true } },
        { $group: { _id: '$proficiency', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ])
    ]);

    res.json({
      success: true,
      data: {
        totalSkills,
        categoryStats,
        proficiencyStats
      }
    });
  } catch (error) {
    console.error('❌ Failed to fetch skills statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch skills statistics',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Get available categories (public endpoint)
router.get('/meta/categories', async (req, res) => {
  try {
    const categories = await Skill.distinct('category', { isActive: true });
    
    res.json({
      success: true,
      data: {
        categories: categories.sort(),
        allCategories: ['frontend', 'backend', 'database', 'devops', 'tools', 'languages', 'frameworks', 'cloud', 'mobile', 'other']
      }
    });
  } catch (error) {
    console.error('❌ Failed to fetch categories:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch categories',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router; 