require("dotenv").config();
const fs = require("fs").promises;
const path = require("path");
const { uploadFile } = require("../config/s3");

// MIME type mapping
const mimeTypes = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".gif": "image/gif",
  ".webp": "image/webp",
};

/**
 * Recursively find all image files in a directory
 */
async function findImageFiles(directory, imageFiles = []) {
  const entries = await fs.readdir(directory, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      // Recursively search subdirectories
      await findImageFiles(fullPath, imageFiles);
    } else if (entry.isFile()) {
      const ext = path.extname(entry.name).toLowerCase();
      if (mimeTypes[ext]) {
        imageFiles.push({
          localPath: fullPath,
          fileName: entry.name,
          extension: ext,
        });
      }
    }
  }

  return imageFiles;
}

/**
 * Upload single file to S3
 */
async function uploadSingleFile(fileInfo, baseDir) {
  try {
    // Read file
    const fileBuffer = await fs.readFile(fileInfo.localPath);

    // Get relative path from base directory to preserve folder structure
    const relativePath = path.relative(baseDir, fileInfo.localPath);
    
    // Use relative path as S3 key (replace backslashes with forward slashes)
    const s3Key = `sku-images/${relativePath.replace(/\\/g, "/")}`;

    // Get MIME type
    const contentType = mimeTypes[fileInfo.extension] || "application/octet-stream";

    // Upload to S3
    const url = await uploadFile(fileBuffer, s3Key, contentType);

    return { success: true, fileName: fileInfo.fileName, s3Key, url };
  } catch (error) {
    return { success: false, fileName: fileInfo.fileName, error: error.message };
  }
}

/**
 * Main upload function
 */
async function uploadImages() {
  try {
    // Check if AWS credentials are set
    if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
      console.error("❌ AWS credentials not set in .env file!");
      console.log("\nPlease add to your .env file:");
      console.log("AWS_ACCESS_KEY_ID=your_access_key");
      console.log("AWS_SECRET_ACCESS_KEY=your_secret_key");
      console.log("AWS_REGION=us-east-1");
      console.log("AWS_S3_BUCKET_NAME=tiara-sku-images");
      process.exit(1);
    }

    // Get the image folder path (you'll need to update this)
    const imageFolderPath = process.argv[2];

    if (!imageFolderPath) {
      console.error("❌ Please provide the image folder path:");
      console.log("\nUsage:");
      console.log("  node scripts/uploadImagesToS3.js C:\\Path\\To\\Images");
      process.exit(1);
    }

    console.log("🔍 Scanning for images in:", imageFolderPath);
    console.log("This may take a while for large folders...\n");

    // Find all image files
    const imageFiles = await findImageFiles(imageFolderPath);

    console.log(`✅ Found ${imageFiles.length} image files\n`);

    if (imageFiles.length === 0) {
      console.log("No images found. Exiting.");
      process.exit(0);
    }

    // Ask for confirmation
    console.log("📤 Ready to upload to S3:");
    console.log(`   Bucket: ${process.env.AWS_S3_BUCKET_NAME}`);
    console.log(`   Region: ${process.env.AWS_REGION}`);
    console.log(`   Files: ${imageFiles.length}`);
    console.log("\nPress Ctrl+C to cancel, or wait 5 seconds to start...\n");

    await new Promise((resolve) => setTimeout(resolve, 5000));

    console.log("🚀 Starting upload...\n");

    let uploaded = 0;
    let failed = 0;

    // Upload files (with progress)
    for (let i = 0; i < imageFiles.length; i++) {
      const fileInfo = imageFiles[i];
      const result = await uploadSingleFile(fileInfo, imageFolderPath);

      if (result.success) {
        uploaded++;
        console.log(`✅ [${i + 1}/${imageFiles.length}] ${result.fileName}`);
      } else {
        failed++;
        console.log(`❌ [${i + 1}/${imageFiles.length}] ${result.fileName} - ${result.error}`);
      }

      // Show progress every 10 files
      if ((i + 1) % 10 === 0) {
        console.log(`\n📊 Progress: ${i + 1}/${imageFiles.length} (${uploaded} success, ${failed} failed)\n`);
      }
    }

    console.log("\n" + "=".repeat(50));
    console.log("✅ Upload Complete!");
    console.log("=".repeat(50));
    console.log(`Total files: ${imageFiles.length}`);
    console.log(`Uploaded: ${uploaded}`);
    console.log(`Failed: ${failed}`);
    console.log("=".repeat(50) + "\n");

  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

uploadImages();
