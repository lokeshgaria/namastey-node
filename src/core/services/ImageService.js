// imgae service
const sharp = require('sharp');

class ImageService {
    /**
     * Process profile image: resize and compress
     * @param {Buffer} buffer - Image buffer
     */
    async processProfileImage(buffer) {
        try {
            // Resize to 800x800, compress to JPEG
            const processed = await sharp(buffer)
                .resize(800, 800, {
                    fit: 'cover',           // Crop to fit
                    position: 'center'       // Center crop
                })
                .jpeg({
                    quality: 85,             // 85% quality (good balance)
                    progressive: true        // Progressive loading
                })
                .toBuffer();

            return processed;
        } catch (error) {
            console.error('Image processing error:', error);
            throw new Error('Failed to process image');
        }
    }

    /**
     * Create thumbnail (small preview)
     * @param {Buffer} buffer 
     */
    async createThumbnail(buffer) {
        try {
            const thumbnail = await sharp(buffer)
                .resize(200, 200, {
                    fit: 'cover',
                    position: 'center'
                })
                .jpeg({ quality: 80 })
                .toBuffer();

            return thumbnail;
        } catch (error) {
            console.error('Thumbnail creation error:', error);
            throw new Error('Failed to create thumbnail');
        }
    }

    /**
     * Validate image
     * @param {Buffer} buffer 
     */
    async validateImage(buffer) {
        try {
            const metadata = await sharp(buffer).metadata();

            // Check file size (5MB max)
            if (buffer.length > 5 * 1024 * 1024) {
                throw new Error('Image too large. Maximum size is 5MB');
            }

            // Check dimensions (200x200 minimum)
            if (metadata.width < 200 || metadata.height < 200) {
                throw new Error('Image too small. Minimum dimensions are 200x200 pixels');
            }

            // Check format
            const allowedFormats = ['jpeg', 'jpg', 'png', 'webp'];
            if (!allowedFormats.includes(metadata.format)) {
                throw new Error('Invalid image format. Use JPEG, PNG, or WebP');
            }

            return true;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Get image info
     * @param {Buffer} buffer 
     */
    async getImageInfo(buffer) {
        const metadata = await sharp(buffer).metadata();
        return {
            width: metadata.width,
            height: metadata.height,
            format: metadata.format,
            size: buffer.length,
            sizeInMB: (buffer.length / (1024 * 1024)).toFixed(2)
        };
    }
}

module.exports = new ImageService();