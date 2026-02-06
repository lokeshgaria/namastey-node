// controller
const imageService = require('../../core/services/ImageService');
const s3Service = require('../../infrastructure/storage/s3Client');
const logger = require('../../infrastructure/logging/logger');

class UploadController {
    constructor(userService) {
        this.userService = userService;
    }

    uploadProfilePhoto = async (req, res, next) => {
        try {
            // ============================================
            // DEBUGGING: Log what we received
            // ============================================
            console.log('📤 Upload request received');
            console.log('req.file:', req.file);
            console.log('req.files:', req.files);
            console.log('req.body:', req.body);

            // Check if file exists
            if (!req.file) {
                console.log('❌ No file in req.file');
                return res.status(400).json({
                    success: false,
                    message: 'No file uploaded. Please attach an image file.'
                });
            }

            const userId = req.user._id;
            const fileBuffer = req.file.buffer;

            // ============================================
            // DEBUGGING: Log buffer info
            // ============================================
            console.log('File info:', {
                fieldname: req.file.fieldname,
                originalname: req.file.originalname,
                mimetype: req.file.mimetype,
                size: req.file.size,
                bufferLength: fileBuffer ? fileBuffer.length : 0,
                bufferType: typeof fileBuffer,
                isBuffer: Buffer.isBuffer(fileBuffer)
            });

            // Validate buffer exists and has data
            if (!fileBuffer || fileBuffer.length === 0) {
                console.log('❌ Buffer is empty or null');
                return res.status(400).json({
                    success: false,
                    message: 'File buffer is empty. Please try uploading again.'
                });
            }

            logger.info('Profile photo upload started', {
                userId,
                originalName: req.file.originalname,
                size: req.file.size,
                mimetype: req.file.mimetype
            });

            // 1. Validate image
            console.log('✅ Validating image...');
            await imageService.validateImage(fileBuffer);
            console.log('✅ Image validated');

            // 2. Process image (resize + compress)
            console.log('✅ Processing image...');
            const processedImage = await imageService.processProfileImage(fileBuffer);
            console.log('✅ Image processed');

            // 3. Create thumbnail
            console.log('✅ Creating thumbnail...');
            const thumbnail = await imageService.createThumbnail(fileBuffer);
            console.log('✅ Thumbnail created');

            // 4. Delete old images from S3 (if exists)
            if (req.user.photoUrl && req.user.photoUrl !== 'https://via.placeholder.com/150') {
                console.log('🗑️  Deleting old image...');
                await s3Service.deleteProfileImage(req.user.photoUrl);
                console.log('✅ Old image deleted');
            }

            // 5. Upload to S3
            console.log('☁️  Uploading to S3...');
            const uploadedImages = await s3Service.uploadProfileImages(
                {
                    main: processedImage,
                    thumb: thumbnail
                },
                userId.toString()
            );
            console.log('✅ Uploaded to S3:', uploadedImages);

            // 6. Update user profile in database
            console.log('💾 Updating database...');

            req.body = {
                photoUrl: uploadedImages.photoUrl,
                thumbnailUrl: uploadedImages.thumbnailUrl
            };
            await this.userService.updateProfile(req);
            console.log('✅ Database updated');

            logger.info('Profile photo uploaded successfully', {
                userId,
                photoUrl: uploadedImages.photoUrl
            });

            res.json({
                success: true,
                message: 'Profile photo uploaded successfully',
                data: {
                    photoUrl: uploadedImages.mainImageUrl,
                    thumbnailUrl: uploadedImages.thumbnailUrl
                }
            });

        } catch (error) {
            console.error('❌ Upload error:', error);
            logger.error('Profile photo upload failed', {
                userId: req.user?._id,
                error: error.message,
                stack: error.stack
            });

            res.status(500).json({
                success: false,
                message: error.message || 'Failed to upload image'
            });
        }
    };

    deleteProfilePhoto = async (req, res, next) => {
        try {
            const userId = req.user._id;

            // Delete from S3
            if (req.user.photoUrl && req.user.photoUrl !== 'https://via.placeholder.com/150') {
                await s3Service.deleteProfileImage(req.user.photoUrl);
            }

            // Update database (set to default)
            await this.userService.updateProfile(userId, {
                photoUrl: 'https://via.placeholder.com/150',
                thumbnailUrl: null
            });

            logger.info('Profile photo deleted', { userId });

            res.json({
                success: true,
                message: 'Profile photo deleted successfully'
            });

        } catch (error) {
            logger.error('Profile photo deletion failed', {
                userId: req.user._id,
                error: error.message
            });
            next(error);
        }
    };
}

module.exports = UploadController;