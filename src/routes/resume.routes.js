const express = require('express');
const router = express.Router();
const Resume = require('../models/Resume');

// ============ PUBLIC ENDPOINTS ============

// Get active resume (public endpoint)
router.get('/active', async (req, res) => {
  try {
    const resume = await Resume.getActive();
    
    if (!resume) {
      return res.status(404).json({
        success: false,
        message: 'No active resume found'
      });
    }

    res.json({
      success: true,
      data: resume
    });
  } catch (error) {
    console.error('❌ Failed to fetch active resume:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch resume',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Get all public resumes (public endpoint)
router.get('/public', async (req, res) => {
  try {
    const resumes = await Resume.getPublic();
    
    res.json({
      success: true,
      data: resumes
    });
  } catch (error) {
    console.error('❌ Failed to fetch public resumes:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch resumes',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Download resume (public endpoint)
router.get('/download/:id', async (req, res) => {
  try {
    const resume = await Resume.getForDownload(req.params.id);

    if (!resume) {
      return res.status(404).json({
        success: false,
        message: 'Resume not found'
      });
    }

    // Increment download count
    await Resume.findByIdAndUpdate(req.params.id, { $inc: { downloadCount: 1 } });

    // Set headers for file download
    res.setHeader('Content-Type', resume.contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${resume.originalName}"`);
    res.setHeader('Content-Length', resume.fileSize);

    // Send the file data directly from database
    res.send(resume.fileData);

  } catch (error) {
    console.error('❌ Failed to download resume:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to download resume',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router; 