const express = require('express');
const router = express.Router();
const Highlight = require('../models/Highlight');

// Get all highlights (public endpoint)
router.get('/', async (req, res) => {
  try {
    const { category, featured, limit, page } = req.query;
    const filter = { isActive: true };
    
    if (category) filter.category = category;
    if (featured !== undefined) filter.featured = featured === 'true';

    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 12;
    const skip = (pageNum - 1) * limitNum;

    const highlights = await Highlight.find(filter)
      .sort({ displayOrder: 1 })
      .skip(skip)
      .limit(limitNum)
      .select('title description shortDescription imageUrl images category tools projectUrl behanceUrl dribbbleUrl figmaUrl tags featured displayOrder completionDate clientName projectDuration keyFeatures metrics createdAt updatedAt')
      .lean();

    const total = await Highlight.countDocuments(filter);

    res.json({
      success: true,
      data: highlights,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    console.error('❌ Failed to fetch highlights:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch highlights',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Get highlights grouped by category (public endpoint)
router.get('/grouped', async (req, res) => {
  try {
    const groupedHighlights = await Highlight.getGroupedByCategory();
    
    res.json({
      success: true,
      data: groupedHighlights
    });
  } catch (error) {
    console.error('❌ Failed to fetch grouped highlights:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch grouped highlights',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Get single highlight by ID (public endpoint)
router.get('/:id', async (req, res) => {
  try {
    const highlight = await Highlight.findById(req.params.id)
      .select('title description shortDescription imageUrl images category tools projectUrl behanceUrl dribbbleUrl figmaUrl tags featured displayOrder completionDate clientName projectDuration challenges solutions keyFeatures userFeedback metrics seoMetadata isActive createdAt updatedAt')
      .lean();
    
    if (!highlight || !highlight.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Highlight not found'
      });
    }

    res.json({
      success: true,
      data: highlight
    });
  } catch (error) {
    console.error('❌ Failed to fetch highlight:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch highlight',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Get highlights by category (public endpoint)
router.get('/category/:category', async (req, res) => {
  try {
    const { category } = req.params;
    const { limit } = req.query;
    
    const validCategories = ['ui-design', 'ux-research', 'mobile-app', 'web-design', 'branding', 'prototype', 'wireframe', 'user-testing', 'other'];
    
    if (!validCategories.includes(category)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid category',
        validCategories
      });
    }

    const limitNum = parseInt(limit) || 0;
    let query = Highlight.find({ category, isActive: true })
      .sort({ displayOrder: 1 })
      .select('title description shortDescription imageUrl images category tools projectUrl behanceUrl dribbbleUrl figmaUrl tags featured displayOrder completionDate clientName projectDuration keyFeatures metrics createdAt updatedAt')
      .lean();

    if (limitNum > 0) {
      query = query.limit(limitNum);
    }

    const highlights = await query;
    const total = await Highlight.countDocuments({ category, isActive: true });

    res.json({
      success: true,
      data: highlights,
      category,
      count: total
    });
  } catch (error) {
    console.error('❌ Failed to fetch highlights by category:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch highlights by category',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Get featured highlights (public endpoint)
router.get('/featured/list', async (req, res) => {
  try {
    const { limit } = req.query;
    const limitNum = parseInt(limit) || 6;
    
    const highlights = await Highlight.getFeatured(limitNum);

    res.json({
      success: true,
      data: highlights,
      count: highlights.length
    });
  } catch (error) {
    console.error('❌ Failed to fetch featured highlights:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch featured highlights',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Get highlights statistics (public endpoint)
router.get('/stats/overview', async (req, res) => {
  try {
    const stats = await Highlight.aggregate([
      {
        $match: { isActive: true }
      },
      {
        $group: {
          _id: null,
          totalHighlights: { $sum: 1 },
          featuredHighlights: { $sum: { $cond: ['$featured', 1, 0] } },
          categoryStats: {
            $push: {
              category: '$category',
              featured: '$featured'
            }
          }
        }
      },
      {
        $project: {
          _id: 0,
          totalHighlights: 1,
          featuredHighlights: 1,
          categoryStats: {
            $reduce: {
              input: '$categoryStats',
              initialValue: {},
              in: {
                $mergeObjects: [
                  '$$value',
                  {
                    $arrayToObject: [
                      [{
                        k: '$$this.category',
                        v: { $add: [{ $ifNull: [{ $getField: { field: '$$this.category', input: '$$value' } }, 0] }, 1] }
                      }]
                    ]
                  }
                ]
              }
            }
          }
        }
      }
    ]);

    const result = stats[0] || {
      totalHighlights: 0,
      featuredHighlights: 0,
      categoryStats: {}
    };

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('❌ Failed to fetch highlights statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch highlights statistics',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Get available categories (public endpoint)
router.get('/meta/categories', async (req, res) => {
  try {
    const categories = await Highlight.distinct('category', { isActive: true });
    const allCategories = Highlight.getCategories();

    res.json({
      success: true,
      data: {
        categories,
        allCategories
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