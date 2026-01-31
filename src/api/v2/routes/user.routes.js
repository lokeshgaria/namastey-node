const express = require('express');
const router = express.Router();
const { validateProfileEditData } = require('../../validators/authValidators');
/**
 * Setup user routes
 * @param {Object} userController - Injected controller
 * @param {Function} userAuth - Auth middleware
 */
function setupUserRoutes(userController, userAuth) {
  // Get user profile
  router.get( 
    '/profile',
    userAuth,
    userController.getUser  // ✅ Just pass the method
  );
// update user profile
router.patch(
    '/profile/edit',
    userAuth,
    validateProfileEditData,
    userController.updateProfile  // ✅ Just pass the method
  );
 

  return router;
}

// read the entities docs and summary created by deep sekk from the dir sturcture
// check the validation file under  src/api/validators try what is the use of connectionValidators , how to implement other validator files
// ALSO CHECK THESE FILESA AS THESE ARE EMPTY 
// MIDDLEWARE/AUTH.JS
// CONFIG/CONSTANT
// infrastructure DIR
//
module.exports = setupUserRoutes;