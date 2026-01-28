// TO DO THESE FILE CHANGES

const express = require('express');
const router = express.Router();
const { validateSignupData } = require('../../validators/authValidators');
function setupAuthRoutes(authController) {
  // POST /signup
   router.post('/signup', validateSignupData, authController.signup);

  // POST /login
  router.post('/login', authController.login);

  // POST /logout
  router.post('/logout', authController.logout);

 
  return router;
}

module.exports = setupAuthRoutes;