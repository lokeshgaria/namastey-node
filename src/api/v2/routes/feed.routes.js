const express = require('express');
const router = express.Router();


function setupFeedRoutes(feedController, userAuth) {
  router.get('/fresh', userAuth, feedController.getFeed);
  return router;
}

module.exports = setupFeedRoutes;