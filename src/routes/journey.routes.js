const express = require('express');
const router = express.Router();
const Journey = require('../models/Journey');

// Get all journey entries (public endpoint)
router.get('/', async (req, res) => {
  try {
    const journeys = await Journey.find({})
      .sort({ displayOrder: 1 })
      .select('year title description displayOrder createdAt updatedAt')
      .lean(); // Use lean() for better performance since we don't need mongoose document methods
    
    res.json({
      success: true,
      data: journeys
    });
  } catch (error) {
    console.error('❌ Failed to fetch journey entries:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch journey entries',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Get single journey entry by ID (public endpoint)
router.get('/:id', async (req, res) => {
  try {
    const journey = await Journey.findById(req.params.id)
      .select('year title description displayOrder createdAt updatedAt')
      .lean();
    
    if (!journey) {
      return res.status(404).json({
        success: false,
        message: 'Journey entry not found'
      });
    }

    res.json({
      success: true,
      data: journey
    });
  } catch (error) {
    console.error('❌ Failed to fetch journey entry:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch journey entry',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Get journey statistics (public endpoint)
router.get('/stats/overview', async (req, res) => {
  try {
    const [
      totalJourneys,
      yearRange
    ] = await Promise.all([
      Journey.countDocuments(),
      Journey.aggregate([
        {
          $group: {
            _id: null,
            minYear: { $min: '$year' },
            maxYear: { $max: '$year' }
          }
        }
      ])
    ]);

    res.json({
      success: true,
      data: {
        totalJourneys,
        yearRange: yearRange[0] || { minYear: new Date().getFullYear(), maxYear: new Date().getFullYear() }
      }
    });
  } catch (error) {
    console.error('❌ Failed to fetch journey statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch journey statistics',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router; 