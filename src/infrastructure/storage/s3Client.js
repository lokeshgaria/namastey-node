//s3client

const AWS = require('aws-sdk');

class S3Client {
  constructor() {
    this.s3 = new AWS.S3({
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      region: process.env.AWS_REGION || 'us-east-1'
    });

    this.bucket = process.env.AWS_S3_BUCKET;


  }

  async uploadFile(file, folder = 'uploads') {


    const fileName = `${folder}/${Date.now()}-${file.originalname}`;

    const params = {
      Bucket: this.bucket,
      Key: fileName,
      Body: file.buffer,
      ContentType: file.mimetype,
      ACL: 'public-read'
    };

    const result = await this.s3.upload(params).promise();
    return {
      url: result.Location,
      key: result.Key
    };
  }

  async deleteFile(key) {
    const params = {
      Bucket: this.bucket,
      Key: key
    };

    await this.s3.deleteObject(params).promise();
    return true;
  }


  /**
   * Upload profile images (main and thumbnail) to S3
   * @param {Object} images - Object containing main and thumb buffers
   * @param {string} userId - User ID for file naming
   * @returns {Object} URLs for main image and thumbnail
   */
  async uploadProfileImages(images, userId) {
    const timestamp = Date.now();
    const mainKey = `profiles/${userId}/main-${timestamp}.jpg`;
    const thumbKey = `profiles/${userId}/thumb-${timestamp}.jpg`;


    // Upload main image
    const mainParams = {
      Bucket: this.bucket,
      Key: mainKey,
      Body: images.main,
      ContentType: 'image/jpeg',
      ACL: 'public-read'
    };

    // Upload thumbnail
    const thumbParams = {
      Bucket: this.bucket,
      Key: thumbKey,
      Body: images.thumb,
      ContentType: 'image/jpeg',
      ACL: 'public-read'
    };

    const [mainResult, thumbResult] = await Promise.all([
      this.s3.upload(mainParams).promise(),
      this.s3.upload(thumbParams).promise()
    ]);

    return {
      mainImageUrl: mainResult.Location,
      thumbnailUrl: thumbResult.Location,
      mainKey: mainResult.Key,
      thumbKey: thumbResult.Key
    };
  }

  /**
   * Delete profile image from S3
   * @param {string} imageUrl - Full S3 URL or key of the image to delete
   */
  async deleteProfileImage(imageUrl) {

    if (!imageUrl || imageUrl === 'https://via.placeholder.com/150') {
      return; // Skip deletion for placeholder or empty URLs
    }

    try {
      // Extract key from URL if full URL is provided
      let key = imageUrl;
      if (imageUrl.includes('amazonaws.com/')) {
        // Extract key from URL like: https://bucket.s3.region.amazonaws.com/profiles/userId/main-timestamp.jpg
        const urlParts = imageUrl.split('amazonaws.com/');
        key = urlParts[1];
      }

      const params = {
        Bucket: this.bucket,
        Key: key
      };

      await this.s3.deleteObject(params).promise();

      // Also try to delete the corresponding thumbnail if it's a main image
      if (key.includes('/main-')) {
        const thumbKey = key.replace('/main-', '/thumb-');
        const thumbParams = {
          Bucket: this.bucket,
          Key: thumbKey
        };
        await this.s3.deleteObject(thumbParams).promise().catch(() => {
          // Ignore error if thumbnail doesn't exist
        });
      }

      return true;
    } catch (error) {
      console.error('Error deleting profile image from S3:', error);
      // Don't throw error - continue with the upload even if deletion fails
      return false;
    }
  }
}

module.exports = new S3Client();