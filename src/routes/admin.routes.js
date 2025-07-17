const express = require('express');
const router = express.Router();
const Admin = require('../models/Admin');
const Project = require('../models/Project');
const Contact = require('../models/Contact'); // Added Contact model
const Journey = require('../models/Journey'); // Added Journey model
const Skill = require('../models/Skill'); // Added Skill model
const Highlight = require('../models/Highlight'); // Added Highlight model
const { generateToken, authenticateAdmin, requireSuperAdmin } = require('../middleware/auth');

// Admin login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Find admin by username or email
    const admin = await Admin.findOne({
      $or: [{ username }, { email: username }]
    });

    if (!admin || !admin.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials or inactive account'
      });
    }

    // Check password
    const isMatch = await admin.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Update last login
    admin.lastLogin = new Date();
    await admin.save();

    // Generate token
    const token = generateToken(admin._id);

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        admin: admin.toJSON(),
        token
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Login failed',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Get current admin profile
router.get('/profile', authenticateAdmin, async (req, res) => {
  try {
    res.json({
      success: true,
      data: req.admin.toJSON()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch profile',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Create new admin (super admin only)
router.post('/create', authenticateAdmin, requireSuperAdmin, async (req, res) => {
  try {
    const { username, email, password, role } = req.body;

    const admin = await Admin.create({
      username,
      email,
      password,
      role: role || 'admin'
    });

    res.status(201).json({
      success: true,
      message: 'Admin created successfully',
      data: admin.toJSON()
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Username or email already exists'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to create admin',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Get all admins (super admin only)
router.get('/list', authenticateAdmin, requireSuperAdmin, async (req, res) => {
  try {
    const admins = await Admin.find({}).sort({ createdAt: -1 });
    
    res.json({
      success: true,
      data: admins
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch admins',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Update admin status (super admin only)
router.put('/:id/status', authenticateAdmin, requireSuperAdmin, async (req, res) => {
  try {
    const { isActive } = req.body;
    
    const admin = await Admin.findByIdAndUpdate(
      req.params.id,
      { isActive },
      { new: true }
    );

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'Admin not found'
      });
    }

    res.json({
      success: true,
      message: 'Admin status updated successfully',
      data: admin.toJSON()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update admin status',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Change password
router.put('/change-password', authenticateAdmin, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    const admin = await Admin.findById(req.admin._id);
    
    // Verify current password
    const isMatch = await admin.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Update password
    admin.password = newPassword;
    await admin.save();

    res.json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to change password',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Logout (client-side token removal, but we can track this)
router.post('/logout', authenticateAdmin, async (req, res) => {
  try {
    res.json({
      success: true,
      message: 'Logout successful'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Logout failed',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// ============ PROJECT MANAGEMENT ENDPOINTS ============

// Create new project (admin only)
router.post('/projects', authenticateAdmin, async (req, res) => {
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

// Get all projects for admin (with full details)
router.get('/projects', authenticateAdmin, async (req, res) => {
  try {
    const { category, featured, limit, page } = req.query;
    const filter = {};
    
    if (category) filter.category = category;
    if (featured) filter.featured = featured === 'true';

    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 10;
    const skip = (pageNum - 1) * limitNum;

    const projects = await Project.find(filter)
      .populate('createdBy', 'username email')
      .populate('updatedBy', 'username email')
      .sort({ createdAt: -1 })
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

// Update project (admin only)
router.put('/projects/:id', authenticateAdmin, async (req, res) => {
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

// Delete project (admin only)
router.delete('/projects/:id', authenticateAdmin, async (req, res) => {
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

// Toggle featured status (admin only)
router.patch('/projects/:id/featured', authenticateAdmin, async (req, res) => {
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

// Get project statistics (admin only)
router.get('/projects/stats', authenticateAdmin, async (req, res) => {
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

// ============ CONTACT MESSAGE MANAGEMENT ============

// Get message statistics (admin only) - MUST BE BEFORE /messages/:id route
router.get('/messages/stats', authenticateAdmin, async (req, res) => {
  try {
    const [
      totalMessages,
      unreadMessages,
      readMessages,
      repliedMessages,
      recentMessages
    ] = await Promise.all([
      Contact.countDocuments(),
      Contact.countDocuments({ status: 'unread' }),
      Contact.countDocuments({ status: 'read' }),
      Contact.countDocuments({ status: 'replied' }),
      Contact.countDocuments({
        createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
      })
    ]);

    res.json({
      success: true,
      data: {
        totalMessages,
        unreadMessages,
        readMessages,
        repliedMessages,
        recentMessages,
        responseRate: totalMessages > 0 ? Math.round((repliedMessages / totalMessages) * 100) : 0
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch message statistics',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Get all contact messages (admin only)
router.get('/messages', authenticateAdmin, async (req, res) => {
  try {
    const { status, limit, page, search } = req.query;
    const filter = {};
    
    // Filter by status if provided
    if (status && ['unread', 'read', 'replied'].includes(status)) {
      filter.status = status;
    }
    
    // Search functionality
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { subject: { $regex: search, $options: 'i' } },
        { message: { $regex: search, $options: 'i' } }
      ];
    }

    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 10;
    const skip = (pageNum - 1) * limitNum;

    const messages = await Contact.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    const total = await Contact.countDocuments(filter);

    res.json({
      success: true,
      data: messages,
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
      message: 'Failed to fetch messages',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Bulk operations for messages (admin only) - MUST BE BEFORE /messages/:id route
router.post('/messages/bulk', authenticateAdmin, async (req, res) => {
  try {
    const { action, messageIds } = req.body;
    
    if (!action || !messageIds || !Array.isArray(messageIds)) {
      return res.status(400).json({
        success: false,
        message: 'Action and messageIds array are required'
      });
    }

    let result;
    
    switch (action) {
      case 'mark-read':
        result = await Contact.updateMany(
          { _id: { $in: messageIds } },
          { status: 'read' }
        );
        break;
      
      case 'mark-unread':
        result = await Contact.updateMany(
          { _id: { $in: messageIds } },
          { status: 'unread' }
        );
        break;
      
      case 'delete':
        result = await Contact.deleteMany({ _id: { $in: messageIds } });
        break;
      
      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid action. Must be: mark-read, mark-unread, or delete'
        });
    }

    res.json({
      success: true,
      message: `Bulk ${action} completed successfully`,
      data: {
        modifiedCount: result.modifiedCount || result.deletedCount,
        action
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to perform bulk operation',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Get single contact message (admin only)
router.get('/messages/:id', authenticateAdmin, async (req, res) => {
  try {
    const message = await Contact.findById(req.params.id);
    
    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    // Mark as read if it was unread
    if (message.status === 'unread') {
      message.status = 'read';
      await message.save();
    }

    res.json({
      success: true,
      data: message
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch message',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Update message status (admin only)
router.patch('/messages/:id/status', authenticateAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!['unread', 'read', 'replied'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be: unread, read, or replied'
      });
    }

    const message = await Contact.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    res.json({
      success: true,
      message: 'Message status updated successfully',
      data: message
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update message status',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Reply to contact message (admin only)
router.post('/messages/:id/reply', authenticateAdmin, async (req, res) => {
  try {
    const { replyMessage, replySubject } = req.body;
    
    if (!replyMessage) {
      return res.status(400).json({
        success: false,
        message: 'Reply message is required'
      });
    }

    const message = await Contact.findById(req.params.id);
    
    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Original message not found'
      });
    }

    // Set up email transporter (same as in contact routes)
    const nodemailer = require('nodemailer');
    const transporter = nodemailer.createTransporter({
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: process.env.EMAIL_PORT || 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    // Send reply email
    const emailSubject = replySubject || `Re: ${message.subject}`;
    
    await transporter.sendMail({
      from: {
        name: 'Hafiz Al Asad',
        address: process.env.EMAIL_USER || 'hkkhan074@gmail.com'
      },
      to: message.email,
      subject: emailSubject,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h3>Hello ${message.name},</h3>
          <p>Thank you for your message. Here's my response:</p>
          
          <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            ${replyMessage.replace(/\n/g, '<br>')}
          </div>
          
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;">
          
          <h4>Your Original Message:</h4>
          <p><strong>Subject:</strong> ${message.subject}</p>
          <p><strong>Date:</strong> ${new Date(message.createdAt).toLocaleDateString()}</p>
          <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px;">
            ${message.message.replace(/\n/g, '<br>')}
          </div>
          
          <br>
          <p>Best regards,<br>
          <strong>Hafiz Al Asad</strong><br>
          Full Stack Developer</p>
        </div>
      `
    });

    // Update message status to replied
    message.status = 'replied';
    await message.save();

    res.json({
      success: true,
      message: 'Reply sent successfully',
      data: {
        originalMessage: message,
        replySubject: emailSubject,
        replyMessage: replyMessage
      }
    });
  } catch (error) {
    console.error('Reply email error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send reply',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Delete contact message (admin only)
router.delete('/messages/:id', authenticateAdmin, async (req, res) => {
  try {
    const message = await Contact.findByIdAndDelete(req.params.id);

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    res.json({
      success: true,
      message: 'Message deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete message',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// ============ ADMIN STATISTICS ENDPOINT ============

// Get comprehensive admin statistics
router.get('/statistics', authenticateAdmin, async (req, res) => {
  try {
    console.log('📊 Fetching admin statistics...');

    // Initialize GitHub API client
    const axios = require('axios');
    const githubAPI = axios.create({
      baseURL: 'https://api.github.com',
      headers: {
        Authorization: `token ${process.env.GITHUB_TOKEN}`,
        Accept: 'application/vnd.github.v3+json'
      }
    });

    // Run all queries in parallel for better performance
    const [
      totalProjects,
      featuredProjects,
      totalMessages,
      unreadMessages,
      totalJourneys,
      totalSkills,
      activeSkills,
      recentProjects,
      recentJourneys,
      recentSkills,
      categoryStats,
      skillsCategoryStats,
      githubRepos,
      githubUser
    ] = await Promise.allSettled([
      // Project statistics
      Project.countDocuments(),
      Project.countDocuments({ featured: true }),
      
      // Contact/message statistics
      Contact.countDocuments(),
      Contact.countDocuments({ status: 'unread' }),
      
      // Journey statistics
      Journey.countDocuments(),
      
      // Skills statistics
      Skill.countDocuments(),
      Skill.countDocuments({ isActive: true }),
      
      // Recent items (last 30 days)
      Project.countDocuments({
        createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
      }),
      Journey.countDocuments({
        createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
      }),
      Skill.countDocuments({
        createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
      }),
      
      // Category breakdowns
      Project.aggregate([
        { $group: { _id: '$category', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]),
      Skill.aggregate([
        { $group: { _id: '$category', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]),
      
      // GitHub repository count
      githubAPI.get('/users/hafizkhan902/repos', {
        params: { per_page: 1 }
      }).then(response => {
        // Extract total count from Link header or return array length
        const linkHeader = response.headers.link;
        if (linkHeader) {
          const match = linkHeader.match(/page=(\d+)>; rel="last"/);
          return match ? parseInt(match[1]) : response.data.length;
        }
        return response.data.length;
      }).catch(() => 0),
      
      // GitHub user info for additional stats
      githubAPI.get('/users/hafizkhan902').catch(() => null)
    ]);

    // Process results and handle any failures gracefully
    const stats = {
      // Core statistics
      totalProjects: totalProjects.status === 'fulfilled' ? totalProjects.value : 0,
      featuredProjects: featuredProjects.status === 'fulfilled' ? featuredProjects.value : 0,
      totalMessages: totalMessages.status === 'fulfilled' ? totalMessages.value : 0,
      unreadMessages: unreadMessages.status === 'fulfilled' ? unreadMessages.value : 0,
      totalJourneys: totalJourneys.status === 'fulfilled' ? totalJourneys.value : 0,
      totalSkills: totalSkills.status === 'fulfilled' ? totalSkills.value : 0,
      activeSkills: activeSkills.status === 'fulfilled' ? activeSkills.value : 0,
      
      // Recent activity
      recentProjects: recentProjects.status === 'fulfilled' ? recentProjects.value : 0,
      recentJourneys: recentJourneys.status === 'fulfilled' ? recentJourneys.value : 0,
      recentSkills: recentSkills.status === 'fulfilled' ? recentSkills.value : 0,
      
      // GitHub statistics
      githubRepoCount: githubRepos.status === 'fulfilled' ? githubRepos.value : 0,
      githubFollowers: githubUser.status === 'fulfilled' && githubUser.value ? githubUser.value.data.followers : 0,
      githubFollowing: githubUser.status === 'fulfilled' && githubUser.value ? githubUser.value.data.following : 0,
      
      // Category breakdowns
      projectCategoryStats: categoryStats.status === 'fulfilled' ? categoryStats.value : [],
      skillsCategoryStats: skillsCategoryStats.status === 'fulfilled' ? skillsCategoryStats.value : [],
      
      // Portfolio view count (placeholder - you can implement view tracking)
      portfolioViewCount: 0, // TODO: Implement view tracking
      
      // Additional metrics
      projectCompletionRate: totalProjects.status === 'fulfilled' && totalProjects.value > 0 
        ? Math.round((totalProjects.value / (totalProjects.value + 0)) * 100) // Assuming all projects are completed
        : 100,
      
      // Message response rate
      messageResponseRate: totalMessages.status === 'fulfilled' && totalMessages.value > 0
        ? Math.round(((totalMessages.value - (unreadMessages.status === 'fulfilled' ? unreadMessages.value : 0)) / totalMessages.value) * 100)
        : 0,
      
      // Skills completion rate
      skillsActiveRate: totalSkills.status === 'fulfilled' && totalSkills.value > 0
        ? Math.round(((activeSkills.status === 'fulfilled' ? activeSkills.value : 0) / totalSkills.value) * 100)
        : 0,
      
      // Recent activity summary
      recentActivity: {
        newProjects: recentProjects.status === 'fulfilled' ? recentProjects.value : 0,
        newJourneys: recentJourneys.status === 'fulfilled' ? recentJourneys.value : 0,
        newSkills: recentSkills.status === 'fulfilled' ? recentSkills.value : 0,
        newMessages: 0 // TODO: Calculate recent messages
      },
      
      // System info
      lastUpdated: new Date().toISOString(),
      apiStatus: 'operational'
    };

    // Log any failed requests for debugging
    const failedRequests = [
      totalProjects, featuredProjects, totalMessages, unreadMessages,
      totalJourneys, totalSkills, activeSkills, recentProjects, recentJourneys, recentSkills,
      categoryStats, skillsCategoryStats, githubRepos, githubUser
    ].filter(result => result.status === 'rejected');

    if (failedRequests.length > 0) {
      console.warn('⚠️ Some statistics requests failed:', failedRequests.map(r => r.reason?.message));
    }

    console.log('✅ Admin statistics compiled successfully');
    
    res.json({
      success: true,
      message: 'Admin statistics retrieved successfully',
      data: stats
    });

  } catch (error) {
    console.error('❌ Failed to fetch admin statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch admin statistics',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// ============ PORTFOLIO VIEW TRACKING ============

// Track portfolio view (public endpoint)
router.post('/track-view', async (req, res) => {
  try {
    // You can implement view tracking here
    // For now, we'll just return success
    // TODO: Implement view tracking in database
    
    res.json({
      success: true,
      message: 'View tracked successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to track view',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Get portfolio view statistics (admin only)
router.get('/view-stats', authenticateAdmin, async (req, res) => {
  try {
    // TODO: Implement actual view tracking
    // For now, return placeholder data
    const viewStats = {
      totalViews: 0,
      uniqueViews: 0,
      viewsToday: 0,
      viewsThisWeek: 0,
      viewsThisMonth: 0,
      topPages: [],
      recentViews: []
    };

    res.json({
      success: true,
      data: viewStats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch view statistics',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// ============ JOURNEY MANAGEMENT ENDPOINTS ============

// Get journey statistics (admin only) - MUST BE BEFORE /journey/:id route
router.get('/journey/stats', authenticateAdmin, async (req, res) => {
  try {
    const [
      totalJourneys,
      yearRange,
      recentJourneys
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
      ]),
      Journey.countDocuments({
        createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
      })
    ]);

    res.json({
      success: true,
      data: {
        totalJourneys,
        yearRange: yearRange[0] || { minYear: new Date().getFullYear(), maxYear: new Date().getFullYear() },
        recentJourneys
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch journey statistics',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Reorder journey entries (admin only) - MUST BE BEFORE /journey/:id route
router.post('/journey/reorder', authenticateAdmin, async (req, res) => {
  try {
    const { journeyIds } = req.body;
    
    if (!journeyIds || !Array.isArray(journeyIds)) {
      return res.status(400).json({
        success: false,
        message: 'journeyIds array is required'
      });
    }

    // Update display order for each journey
    const updatePromises = journeyIds.map((id, index) => 
      Journey.findByIdAndUpdate(
        id,
        { 
          displayOrder: index + 1,
          updatedBy: req.admin._id,
          updatedAt: new Date()
        },
        { new: true }
      )
    );

    await Promise.all(updatePromises);

    // Get updated journeys
    const updatedJourneys = await Journey.getOrdered();

    res.json({
      success: true,
      message: 'Journey entries reordered successfully',
      data: updatedJourneys
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to reorder journey entries',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Get all journey entries for admin management (admin only)
router.get('/journey', authenticateAdmin, async (req, res) => {
  try {
    const journeys = await Journey.getOrdered();
    
    res.json({
      success: true,
      data: journeys
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch journey entries',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Create new journey entry (admin only)
router.post('/journey', authenticateAdmin, async (req, res) => {
  try {
    const { year, title, description, displayOrder } = req.body;
    
    // If displayOrder is not provided, get next available order
    let finalDisplayOrder = displayOrder;
    if (!finalDisplayOrder) {
      finalDisplayOrder = await Journey.getNextDisplayOrder();
    }
    
    const journeyData = {
      year,
      title,
      description,
      displayOrder: finalDisplayOrder,
      createdBy: req.admin._id
    };

    const journey = await Journey.create(journeyData);
    
    // Populate the created journey with admin details
    await journey.populate('createdBy', 'username email');
    
    res.status(201).json({
      success: true,
      message: 'Journey entry created successfully',
      data: journey
    });
  } catch (error) {
    // Handle duplicate display order error
    if (error.code === 11000 && error.keyPattern?.displayOrder) {
      return res.status(400).json({
        success: false,
        message: 'Display order already exists. Please choose a different order.'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to create journey entry',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Get single journey entry (admin only)
router.get('/journey/:id', authenticateAdmin, async (req, res) => {
  try {
    const journey = await Journey.findById(req.params.id)
      .populate('createdBy', 'username email')
      .populate('updatedBy', 'username email');
    
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
    res.status(500).json({
      success: false,
      message: 'Failed to fetch journey entry',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Update journey entry (admin only)
router.put('/journey/:id', authenticateAdmin, async (req, res) => {
  try {
    const { year, title, description, displayOrder } = req.body;
    
    const updateData = {
      year,
      title,
      description,
      displayOrder,
      updatedBy: req.admin._id,
      updatedAt: new Date()
    };

    const journey = await Journey.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('createdBy', 'username email')
     .populate('updatedBy', 'username email');

    if (!journey) {
      return res.status(404).json({
        success: false,
        message: 'Journey entry not found'
      });
    }

    res.json({
      success: true,
      message: 'Journey entry updated successfully',
      data: journey
    });
  } catch (error) {
    // Handle duplicate display order error
    if (error.code === 11000 && error.keyPattern?.displayOrder) {
      return res.status(400).json({
        success: false,
        message: 'Display order already exists. Please choose a different order.'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to update journey entry',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Delete journey entry (admin only)
router.delete('/journey/:id', authenticateAdmin, async (req, res) => {
  try {
    const journey = await Journey.findByIdAndDelete(req.params.id);

    if (!journey) {
      return res.status(404).json({
        success: false,
        message: 'Journey entry not found'
      });
    }

    res.json({
      success: true,
      message: 'Journey entry deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete journey entry',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// ============ SKILLS MANAGEMENT ENDPOINTS ============

// Get skills statistics (admin only) - MUST BE BEFORE /skills/:id route
router.get('/skills/stats', authenticateAdmin, async (req, res) => {
  try {
    const [
      totalSkills,
      activeSkills,
      inactiveSkills,
      categoryStats,
      proficiencyStats,
      recentSkills
    ] = await Promise.all([
      Skill.countDocuments(),
      Skill.countDocuments({ isActive: true }),
      Skill.countDocuments({ isActive: false }),
      Skill.aggregate([
        { $group: { _id: '$category', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]),
      Skill.aggregate([
        { $group: { _id: '$proficiency', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]),
      Skill.countDocuments({
        createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
      })
    ]);

    res.json({
      success: true,
      data: {
        totalSkills,
        activeSkills,
        inactiveSkills,
        categoryStats,
        proficiencyStats,
        recentSkills
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch skills statistics',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Bulk operations for skills (admin only) - MUST BE BEFORE /skills/:id route
router.post('/skills/bulk', authenticateAdmin, async (req, res) => {
  try {
    const { action, skillIds } = req.body;
    
    if (!action || !skillIds || !Array.isArray(skillIds)) {
      return res.status(400).json({
        success: false,
        message: 'Action and skillIds array are required'
      });
    }

    let result;
    
    switch (action) {
      case 'activate':
        result = await Skill.updateMany(
          { _id: { $in: skillIds } },
          { 
            isActive: true,
            updatedBy: req.admin._id,
            updatedAt: new Date()
          }
        );
        break;
      
      case 'deactivate':
        result = await Skill.updateMany(
          { _id: { $in: skillIds } },
          { 
            isActive: false,
            updatedBy: req.admin._id,
            updatedAt: new Date()
          }
        );
        break;
      
      case 'delete':
        result = await Skill.deleteMany({ _id: { $in: skillIds } });
        break;
      
      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid action. Must be: activate, deactivate, or delete'
        });
    }

    res.json({
      success: true,
      message: `Bulk ${action} completed successfully`,
      data: {
        modifiedCount: result.modifiedCount || result.deletedCount,
        action
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to perform bulk operation',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Reorder skills within category (admin only) - MUST BE BEFORE /skills/:id route
router.post('/skills/reorder', authenticateAdmin, async (req, res) => {
  try {
    const { category, skillIds } = req.body;
    
    if (!category || !skillIds || !Array.isArray(skillIds)) {
      return res.status(400).json({
        success: false,
        message: 'Category and skillIds array are required'
      });
    }

    // Update display order for each skill in the category
    const updatePromises = skillIds.map((id, index) => 
      Skill.findOneAndUpdate(
        { _id: id, category },
        { 
          displayOrder: index + 1,
          updatedBy: req.admin._id,
          updatedAt: new Date()
        },
        { new: true }
      )
    );

    await Promise.all(updatePromises);

    // Get updated skills for the category
    const updatedSkills = await Skill.find({ category })
      .sort({ displayOrder: 1 })
      .populate('createdBy', 'username email')
      .populate('updatedBy', 'username email');

    res.json({
      success: true,
      message: 'Skills reordered successfully',
      data: updatedSkills
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to reorder skills',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Get all skills for admin management (admin only)
router.get('/skills', authenticateAdmin, async (req, res) => {
  try {
    const { category, proficiency, isActive, limit, page, search } = req.query;
    const filter = {};
    
    // Filter by category if provided
    if (category) {
      filter.category = category;
    }
    
    // Filter by proficiency if provided
    if (proficiency) {
      filter.proficiency = proficiency;
    }
    
    // Filter by active status if provided
    if (isActive !== undefined) {
      filter.isActive = isActive === 'true';
    }
    
    // Search functionality
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } }
      ];
    }

    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 20;
    const skip = (pageNum - 1) * limitNum;

    const skills = await Skill.find(filter)
      .populate('createdBy', 'username email')
      .populate('updatedBy', 'username email')
      .sort({ category: 1, displayOrder: 1 })
      .skip(skip)
      .limit(limitNum);

    const total = await Skill.countDocuments(filter);

    res.json({
      success: true,
      data: skills,
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
      message: 'Failed to fetch skills',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Create new skill (admin only)
router.post('/skills', authenticateAdmin, async (req, res) => {
  try {
    console.log('🔍 POST /skills - Request body:', JSON.stringify(req.body, null, 2));
    console.log('🔍 Icon data received:', JSON.stringify(req.body.icon, null, 2));
    console.log('🔍 Icon type:', typeof req.body.icon);
    
    const { 
      name, 
      category, 
      proficiency, 
      proficiencyLevel, 
      description, 
      icon, 
      color, 
      displayOrder,
      yearsOfExperience,
      projects,
      certifications
    } = req.body;
    
    console.log('🔍 Destructured icon:', JSON.stringify(icon, null, 2));
    console.log('🔍 Destructured icon type:', typeof icon);
    
    // If displayOrder is not provided, get next available order for the category
    let finalDisplayOrder = displayOrder;
    if (!finalDisplayOrder) {
      finalDisplayOrder = await Skill.getNextDisplayOrder(category);
    }
    
    const skillData = {
      name,
      category,
      proficiency,
      proficiencyLevel,
      description,
      icon,
      color,
      displayOrder: finalDisplayOrder,
      yearsOfExperience,
      projects: projects || [],
      certifications: certifications || [],
      createdBy: req.admin._id
    };

    console.log('🔍 Skill data icon:', JSON.stringify(skillData.icon, null, 2));

    const skill = await Skill.create(skillData);
    
    console.log('🔍 Created skill icon:', JSON.stringify(skill.icon, null, 2));
    
    // Populate the created skill with admin details
    await skill.populate('createdBy', 'username email');
    
    res.status(201).json({
      success: true,
      message: 'Skill created successfully',
      data: skill
    });
  } catch (error) {
    // Handle duplicate display order error
    if (error.code === 11000 && error.keyPattern?.displayOrder) {
      return res.status(400).json({
        success: false,
        message: 'Display order already exists for this category. Please choose a different order.'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to create skill',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Get single skill (admin only)
router.get('/skills/:id', authenticateAdmin, async (req, res) => {
  try {
    const skill = await Skill.findById(req.params.id)
      .populate('createdBy', 'username email')
      .populate('updatedBy', 'username email');
    
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
    res.status(500).json({
      success: false,
      message: 'Failed to fetch skill',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Update skill (admin only)
router.put('/skills/:id', authenticateAdmin, async (req, res) => {
  try {
    console.log('🔍 PUT /skills/:id - Request body:', JSON.stringify(req.body, null, 2));
    console.log('🔍 Icon data received:', JSON.stringify(req.body.icon, null, 2));
    console.log('🔍 Icon type:', typeof req.body.icon);
    
    const { 
      name, 
      category, 
      proficiency, 
      proficiencyLevel, 
      description, 
      icon, 
      color, 
      displayOrder,
      isActive,
      yearsOfExperience,
      projects,
      certifications
    } = req.body;
    
    console.log('🔍 Destructured icon:', JSON.stringify(icon, null, 2));
    console.log('🔍 Destructured icon type:', typeof icon);
    
    const updateData = {
      name,
      category,
      proficiency,
      proficiencyLevel,
      description,
      icon,
      color,
      displayOrder,
      isActive,
      yearsOfExperience,
      projects,
      certifications,
      updatedBy: req.admin._id,
      updatedAt: new Date()
    };

    console.log('🔍 Update data icon:', JSON.stringify(updateData.icon, null, 2));

    const skill = await Skill.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('createdBy', 'username email')
     .populate('updatedBy', 'username email');

    if (!skill) {
      return res.status(404).json({
        success: false,
        message: 'Skill not found'
      });
    }

    console.log('🔍 Final saved skill icon:', JSON.stringify(skill.icon, null, 2));

    res.json({
      success: true,
      message: 'Skill updated successfully',
      data: skill
    });
  } catch (error) {
    // Handle duplicate display order error
    if (error.code === 11000 && error.keyPattern?.displayOrder) {
      return res.status(400).json({
        success: false,
        message: 'Display order already exists for this category. Please choose a different order.'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to update skill',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Toggle skill active status (admin only)
router.patch('/skills/:id/toggle-active', authenticateAdmin, async (req, res) => {
  try {
    const skill = await Skill.findById(req.params.id);
    
    if (!skill) {
      return res.status(404).json({
        success: false,
        message: 'Skill not found'
      });
    }

    skill.isActive = !skill.isActive;
    skill.updatedBy = req.admin._id;
    skill.updatedAt = new Date();
    
    await skill.save();

    res.json({
      success: true,
      message: `Skill ${skill.isActive ? 'activated' : 'deactivated'} successfully`,
      data: skill
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to toggle skill status',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Delete skill (admin only)
router.delete('/skills/:id', authenticateAdmin, async (req, res) => {
  try {
    const skill = await Skill.findByIdAndDelete(req.params.id);

    if (!skill) {
      return res.status(404).json({
        success: false,
        message: 'Skill not found'
      });
    }

    res.json({
      success: true,
      message: 'Skill deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete skill',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// ============ HIGHLIGHTS MANAGEMENT ============

// Get all highlights (admin only)
router.get('/highlights', authenticateAdmin, async (req, res) => {
  try {
    const { category, featured, isActive, search, page, limit } = req.query;
    const filter = {};
    
    if (category) filter.category = category;
    if (featured !== undefined) filter.featured = featured === 'true';
    if (isActive !== undefined) filter.isActive = isActive === 'true';
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } },
        { tools: { $in: [new RegExp(search, 'i')] } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 20;
    const skip = (pageNum - 1) * limitNum;

    const highlights = await Highlight.find(filter)
      .sort({ displayOrder: 1 })
      .skip(skip)
      .limit(limitNum)
      .populate('createdBy', 'username email')
      .populate('updatedBy', 'username email');

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
    console.error('❌ Failed to fetch admin highlights:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch highlights',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Get single highlight (admin only)
router.get('/highlights/:id', authenticateAdmin, async (req, res) => {
  try {
    const highlight = await Highlight.findById(req.params.id)
      .populate('createdBy', 'username email')
      .populate('updatedBy', 'username email');
    
    if (!highlight) {
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

// Create new highlight (admin only)
router.post('/highlights', authenticateAdmin, async (req, res) => {
  try {
    const {
      title,
      description,
      shortDescription,
      imageUrl,
      images,
      category,
      tools,
      projectUrl,
      behanceUrl,
      dribbbleUrl,
      figmaUrl,
      tags,
      featured,
      displayOrder,
      completionDate,
      clientName,
      projectDuration,
      challenges,
      solutions,
      keyFeatures,
      userFeedback,
      seoMetadata
    } = req.body;
    
    // If displayOrder is not provided, get next available order
    let finalDisplayOrder = displayOrder;
    if (!finalDisplayOrder) {
      finalDisplayOrder = await Highlight.getNextDisplayOrder();
    }
    
    const highlightData = {
      title,
      description,
      shortDescription,
      imageUrl,
      images,
      category,
      tools,
      projectUrl,
      behanceUrl,
      dribbbleUrl,
      figmaUrl,
      tags,
      featured,
      displayOrder: finalDisplayOrder,
      completionDate,
      clientName,
      projectDuration,
      challenges,
      solutions,
      keyFeatures,
      userFeedback,
      seoMetadata,
      createdBy: req.admin._id
    };

    const highlight = await Highlight.create(highlightData);
    
    // Populate the created highlight with admin details
    await highlight.populate('createdBy', 'username email');
    
    res.status(201).json({
      success: true,
      message: 'Highlight created successfully',
      data: highlight
    });
  } catch (error) {
    // Handle duplicate display order error
    if (error.code === 11000 && error.keyPattern?.displayOrder) {
      return res.status(400).json({
        success: false,
        message: 'Display order already exists. Please choose a different order.'
      });
    }
    
    console.error('❌ Failed to create highlight:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create highlight',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Update highlight (admin only)
router.put('/highlights/:id', authenticateAdmin, async (req, res) => {
  try {
    const updateData = { ...req.body };
    updateData.updatedBy = req.admin._id;
    
    const highlight = await Highlight.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    )
    .populate('createdBy', 'username email')
    .populate('updatedBy', 'username email');
    
    if (!highlight) {
      return res.status(404).json({
        success: false,
        message: 'Highlight not found'
      });
    }

    res.json({
      success: true,
      message: 'Highlight updated successfully',
      data: highlight
    });
  } catch (error) {
    // Handle duplicate display order error
    if (error.code === 11000 && error.keyPattern?.displayOrder) {
      return res.status(400).json({
        success: false,
        message: 'Display order already exists. Please choose a different order.'
      });
    }
    
    console.error('❌ Failed to update highlight:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update highlight',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Toggle highlight featured status (admin only)
router.patch('/highlights/:id/toggle-featured', authenticateAdmin, async (req, res) => {
  try {
    const highlight = await Highlight.findById(req.params.id);
    
    if (!highlight) {
      return res.status(404).json({
        success: false,
        message: 'Highlight not found'
      });
    }

    await highlight.toggleFeatured();
    highlight.updatedBy = req.admin._id;
    await highlight.save();

    res.json({
      success: true,
      message: `Highlight ${highlight.featured ? 'featured' : 'unfeatured'} successfully`,
      data: {
        _id: highlight._id,
        title: highlight.title,
        featured: highlight.featured
      }
    });
  } catch (error) {
    console.error('❌ Failed to toggle highlight featured status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to toggle highlight featured status',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Toggle highlight active status (admin only)
router.patch('/highlights/:id/toggle-active', authenticateAdmin, async (req, res) => {
  try {
    const highlight = await Highlight.findById(req.params.id);
    
    if (!highlight) {
      return res.status(404).json({
        success: false,
        message: 'Highlight not found'
      });
    }

    await highlight.toggleActive();
    highlight.updatedBy = req.admin._id;
    await highlight.save();

    res.json({
      success: true,
      message: `Highlight ${highlight.isActive ? 'activated' : 'deactivated'} successfully`,
      data: {
        _id: highlight._id,
        title: highlight.title,
        isActive: highlight.isActive
      }
    });
  } catch (error) {
    console.error('❌ Failed to toggle highlight active status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to toggle highlight active status',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Reorder highlights (admin only)
router.post('/highlights/reorder', authenticateAdmin, async (req, res) => {
  try {
    const { highlightIds } = req.body;
    
    if (!Array.isArray(highlightIds)) {
      return res.status(400).json({
        success: false,
        message: 'highlightIds must be an array'
      });
    }

    // Update display order for each highlight
    const updatePromises = highlightIds.map((id, index) => 
      Highlight.findByIdAndUpdate(
        id,
        { 
          displayOrder: index + 1,
          updatedBy: req.admin._id
        },
        { new: true }
      )
    );

    await Promise.all(updatePromises);

    res.json({
      success: true,
      message: 'Highlights reordered successfully'
    });
  } catch (error) {
    console.error('❌ Failed to reorder highlights:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reorder highlights',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Bulk operations on highlights (admin only)
router.post('/highlights/bulk', authenticateAdmin, async (req, res) => {
  try {
    const { action, highlightIds } = req.body;
    
    if (!Array.isArray(highlightIds) || highlightIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'highlightIds must be a non-empty array'
      });
    }

    let result;
    const updateData = { updatedBy: req.admin._id };

    switch (action) {
      case 'activate':
        updateData.isActive = true;
        result = await Highlight.updateMany(
          { _id: { $in: highlightIds } },
          updateData
        );
        break;
      
      case 'deactivate':
        updateData.isActive = false;
        result = await Highlight.updateMany(
          { _id: { $in: highlightIds } },
          updateData
        );
        break;
      
      case 'feature':
        updateData.featured = true;
        result = await Highlight.updateMany(
          { _id: { $in: highlightIds } },
          updateData
        );
        break;
      
      case 'unfeature':
        updateData.featured = false;
        result = await Highlight.updateMany(
          { _id: { $in: highlightIds } },
          updateData
        );
        break;
      
      case 'delete':
        result = await Highlight.deleteMany({ _id: { $in: highlightIds } });
        break;
      
      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid action. Must be one of: activate, deactivate, feature, unfeature, delete'
        });
    }

    res.json({
      success: true,
      message: `Bulk ${action} completed successfully`,
      data: {
        action,
        affectedCount: result.modifiedCount || result.deletedCount,
        highlightIds
      }
    });
  } catch (error) {
    console.error('❌ Failed to perform bulk operation:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to perform bulk operation',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Get highlights statistics (admin only)
router.get('/highlights/stats', authenticateAdmin, async (req, res) => {
  try {
    const stats = await Highlight.getStats();
    
    // Get category breakdown
    const categoryStats = await Highlight.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          active: { $sum: { $cond: ['$isActive', 1, 0] } },
          featured: { $sum: { $cond: ['$featured', 1, 0] } }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Get recent highlights count
    const recentHighlights = await Highlight.countDocuments({
      createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
    });

    const result = {
      ...stats[0],
      categoryStats,
      recentHighlights
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

// Delete highlight (admin only)
router.delete('/highlights/:id', authenticateAdmin, async (req, res) => {
  try {
    const highlight = await Highlight.findByIdAndDelete(req.params.id);
    
    if (!highlight) {
      return res.status(404).json({
        success: false,
        message: 'Highlight not found'
      });
    }

    res.json({
      success: true,
      message: 'Highlight deleted successfully'
    });
  } catch (error) {
    console.error('❌ Failed to delete highlight:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete highlight',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router; 