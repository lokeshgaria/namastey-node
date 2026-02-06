const express = require('express');
const router = express.Router();
const upload = require('../../middlewares/uploadMiddleware');

function setupUploadRoutes(uploadController, userAuth) {
    console.log('🔧 Setting up upload routes');

    // POST /upload/profile-photo
    router.post(
        '/profile-photo',
        userAuth,                    // 1. Auth first
        upload.single('photo'),      // 2. Then Multer (field name: 'photo')
        uploadController.uploadProfilePhoto  // 3. Finally controller
    );

    // DELETE /upload/profile-photo
    router.delete(
        '/profile-photo',
        userAuth,
        uploadController.deleteProfilePhoto
    );

    return router;
}

module.exports = setupUploadRoutes;