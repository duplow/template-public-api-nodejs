/*
const AWSSimpleStorageService = require('aws-sdk/clients/s3');

const s3Options = {
  accessKeyId: process.env.S3_ACCESS_KEY_ID,
  secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
  region: process.env.S3_REGION || 'sa-east-1',
  endpoint: process.env.S3_ENDPOINT ? process.env.S3_ENDPOINT : undefined
};

const s3 = new AWSSimpleStorageService(s3Options);
module.exports = s3;
*/

module.exports = {

  /**
   * Get storage info
   * @returns {BucketInfo}
   */
  bucket: async () => {
    return Promise.resolve({
      availableSpace: '30GB',
      usedSpace: '1GB',
      encryptationAlgorithm: 'sha1',
      isCloud: true
    });
  },

  /**
   * Get file info
   * @param {String} path 
   * @returns {Object} File info
   * @throws {NotFoundException}
   */
  describe: async (path) => {
    return Promise.resolve({
      filename: 'image-001.jpg',
      sizeInBytes: 256,
      isPublic: true,
      sha1: '....'
    });
  },

  /**
   * Make file public
   * @param {String} path
   * @returns {Boolean} Sucessfull?
   * @throws {NotFoundException}
   * @throws {InvalidOperationException}
   */
  makePublic: async (path) => {
    // TODO: Code here
  },

  /**
   * Get file public URL
   * @param {String} path 
   * @returns {String} Public URL
   * @throws {NotFoundException}
   * @throws {NotPublicException}
   */
  getPublicUrl: async (path) => {
    // TODO: Code here
  },

  /**
   * Upload a file
   * @param {string} path File path
   * @param {stream.ReadStream} readStream
   * @param {object} options
   * @param {boolean} options.isPublic
   * @param {boolean} options.replaceIfExists
   * @throws {FileTooLargeException}
   * @throws {FileAlreadyExistsException}
   * @throws {InvalidOperationException}
   */
  upload: async (path, readStream, options = {}) => {
    // TODO: Code here
  },

  /**
   * Download file
   * @param {String} path Filename
   * @param {stream.WriteStream} writeStream
   * @throws {NotFoundException}
   */
  download: async (path, writeStream) => {
    // TODO: Code here
  },

  /**
   * Delete file
   * @param {String} path Filename
   * @throws {NotFoundException}
   */
  delete: async (path) => {
    // TODO: Code here
  }
}