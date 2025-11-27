const express = require('express');
const isauth = require('../middleware/isauth');
const isAdmin = require('../middleware/isAdmin');
const cleanupConversations = require('../config/cleanupUtils');

const adminRouter = express.Router();


adminRouter.post('/cleanup-conversations', isauth, isAdmin, async (req, res) => {
  try {
    console.log('🛠️ Admin triggered conversation cleanup');
    
    const result = await cleanupConversations.fullCleanup();
    
    res.status(200).json({
      success: true,
      message: 'Conversation cleanup completed successfully',
      result: result
    });
    
  } catch (error) {
    console.error('Admin cleanup error:', error);
    res.status(500).json({
      success: false,
      error: 'Cleanup failed: ' + error.message
    });
  }
});

module.exports = adminRouter;