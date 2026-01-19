const express = require('express');
const router = express.Router();

/**
 * Setup connection routes
 * @param {Object} connectionController - Injected controller
 * @param {Function} userAuth - Auth middleware
 */
function setupConnectionRoutes(connectionController, userAuth) {
  // Send connection request (swipe)
  
 
  
  router.post(
    '/send/:status/:toUserId',
    userAuth,
    connectionController.sendRequest  // ✅ Just pass the method
  );

  // Review connection request (accept/reject)
  router.post(
    '/review/:status/:requestId',
    userAuth,
    connectionController.reviewRequest  // ✅ Just pass the method
  );

  return router;
}

module.exports = setupConnectionRoutes;