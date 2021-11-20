const AWSSimpleStorageService = require('aws-sdk/clients/s3');

const createS3 = (options = {}) => {
  const s3ClientOptions = {
    accessKeyId: options.accessKeyId || process.env.S3_ACCESS_KEY_ID || process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: options.secretAccessKey || process.env.S3_SECRET_ACCESS_KEY || process.env.AWS_SECRET_ACCESS_KEY,
    region: options.region || process.env.S3_REGION || process.env.AWS_REGION || 'sa-east-1',
    endpoint: options.endpoint || process.env.S3_ENDPOINT ? process.env.S3_ENDPOINT : undefined
  };

  return new AWSSimpleStorageService(s3ClientOptions);
}

module.exports = createS3;
