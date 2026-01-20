const express = require('express');
const router = express.Router();

/**
 * Setup chat routes
 * @param {Object} chatController - Injected controller
 * @param {Function} userAuth - Auth middleware
 */

function setupChatRoutes(chatController, userAuth) {
    router.get('/:targetUserId', userAuth, chatController.getUserChats);
    return router;
}
module.exports = setupChatRoutes;
