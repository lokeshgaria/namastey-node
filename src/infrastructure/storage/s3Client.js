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
}

module.exports = new S3Client();