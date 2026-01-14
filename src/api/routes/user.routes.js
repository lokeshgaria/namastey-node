const express = require('express');
const router = express.Router();

/**
 * Setup user routes
 * @param {Object} connectionController - Injected controller
 * @param {Function} userAuth - Auth middleware
 */
function setupUserRoutes(connectionController, userAuth) {
  // Get pending requests
  router.get(
    '/requests/received',
    userAuth,
    connectionController.getPendingRequests  // ✅ Just pass the method
  );

  // Get connections
  router.get(
    '/connections',
    userAuth,
    connectionController.getConnections  // ✅ Just pass the method
  );

  return router;
}

module.exports = setupUserRoutes;