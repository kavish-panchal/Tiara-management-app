const AWS = require("aws-sdk");

// Configure AWS
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

// Get bucket name from env
const bucketName = process.env.AWS_S3_BUCKET_NAME;

/**
 * Upload file to S3
 * @param {Buffer} fileBuffer - File buffer
 * @param {string} fileName - File name/key in S3
 * @param {string} contentType - MIME type
 * @returns {Promise<string>} - S3 file URL
 */
const uploadFile = async (fileBuffer, fileName, contentType) => {
  const params = {
    Bucket: bucketName,
    Key: fileName,
    Body: fileBuffer,
    ContentType: contentType,
  };

  try {
    const result = await s3.upload(params).promise();
    return result.Location;
  } catch (error) {
    console.error("S3 upload error:", error);
    throw error;
  }
};

/**
 * Get file from S3
 * @param {string} fileName - File name/key in S3
 * @returns {Promise<Buffer>} - File buffer
 */
const getFile = async (fileName) => {
  const params = {
    Bucket: bucketName,
    Key: fileName,
  };

  try {
    const result = await s3.getObject(params).promise();
    return result.Body;
  } catch (error) {
    console.error("S3 get file error:", error);
    throw error;
  }
};

/**
 * Check if file exists in S3
 * @param {string} fileName - File name/key in S3
 * @returns {Promise<boolean>} - True if exists
 */
const fileExists = async (fileName) => {
  const params = {
    Bucket: bucketName,
    Key: fileName,
  };

  try {
    await s3.headObject(params).promise();
    return true;
  } catch (error) {
    if (error.code === "NotFound") {
      return false;
    }
    throw error;
  }
};

/**
 * Get signed URL for file (temporary access)
 * @param {string} fileName - File name/key in S3
 * @param {number} expiresIn - Expiration time in seconds (default: 1 hour)
 * @returns {string} - Signed URL
 */
const getSignedUrl = (fileName, expiresIn = 3600) => {
  const params = {
    Bucket: bucketName,
    Key: fileName,
    Expires: expiresIn,
  };

  return s3.getSignedUrl("getObject", params);
};

/**
 * Delete file from S3
 * @param {string} fileName - File name/key in S3
 */
const deleteFile = async (fileName) => {
  const params = {
    Bucket: bucketName,
    Key: fileName,
  };

  try {
    await s3.deleteObject(params).promise();
    return true;
  } catch (error) {
    console.error("S3 delete error:", error);
    throw error;
  }
};

/**
 * List all files in S3 bucket (with optional prefix)
 * @param {string} prefix - Optional prefix to filter files
 * @returns {Promise<Array>} - Array of file objects
 */
const listFiles = async (prefix = "") => {
  const params = {
    Bucket: bucketName,
    Prefix: prefix,
  };

  try {
    const result = await s3.listObjectsV2(params).promise();
    return result.Contents || [];
  } catch (error) {
    console.error("S3 list files error:", error);
    throw error;
  }
};

module.exports = {
  s3,
  bucketName,
  uploadFile,
  getFile,
  fileExists,
  getSignedUrl,
  deleteFile,
  listFiles,
};
