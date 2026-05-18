const AppSettings = require("../models/AppSettings");
const fs = require("fs").promises;
const path = require("path");
const { getFile, fileExists } = require("../config/s3");

// @desc    Get app settings
// @route   GET /api/settings/app
// @access  Private
const getAppSettings = async (req, res) => {
  try {
    let settings = await AppSettings.findOne();

    // If no settings exist, create default settings
    if (!settings) {
      settings = await AppSettings.create({
        skuImageFolderPath: "",
      });
    }

    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update app settings
// @route   PUT /api/settings/app
// @access  Private (Owner only)
const updateAppSettings = async (req, res) => {
  try {
    const { skuImageFolderPath } = req.body;

    let settings = await AppSettings.findOne();

    if (!settings) {
      settings = await AppSettings.create({
        skuImageFolderPath: skuImageFolderPath || "",
      });
    } else {
      settings.skuImageFolderPath = skuImageFolderPath || "";
      await settings.save();
    }

    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get SKU image with overlays
// @route   GET /api/settings/sku-image/:skuCode
// @access  Private
const getSkuImage = async (req, res) => {
  try {
    const { skuCode } = req.params;
    const { partyName, size, sets } = req.query; // Get overlay data from query params

    // Check if using S3 or local storage
    const useS3 =
      process.env.AWS_S3_BUCKET_NAME && process.env.AWS_ACCESS_KEY_ID;

    if (useS3) {
      // S3 MODE: Try to find image in S3
      const extensions = [".jpg", ".jpeg", ".png", ".gif", ".webp"];

      let imageBuffer = null;
      let foundExtension = null;

      // Try each extension in S3
      for (const ext of extensions) {
        const s3Key = `sku-images/${skuCode}${ext}`;
        try {
          const exists = await fileExists(s3Key);
          if (exists) {
            imageBuffer = await getFile(s3Key);
            foundExtension = ext;
            break;
          }
        } catch (err) {
          continue;
        }
      }

      if (!imageBuffer) {
        return res.status(404).json({
          message: `Image not found for SKU: ${skuCode}`,
        });
      }

      // Send the image directly
      const contentType =
        foundExtension === ".png" ? "image/png" : "image/jpeg";
      res.set("Content-Type", contentType);
      return res.send(imageBuffer);
    } else {
      // LOCAL MODE: Use local file system
      const settings = await AppSettings.findOne();

      if (!settings || !settings.skuImageFolderPath) {
        return res.status(404).json({
          message:
            "Image folder path not configured. Please set it in Settings.",
        });
      }

      const folderPath = settings.skuImageFolderPath;

      // Common image extensions to check
      const extensions = [
        ".jpg",
        ".jpeg",
        ".png",
        ".gif",
        ".webp",
        ".JPG",
        ".JPEG",
        ".PNG",
        ".GIF",
        ".WEBP",
      ];

      // Try to find the image with any of the extensions
      let imagePath = null;
      for (const ext of extensions) {
        const testPath = path.join(folderPath, `${skuCode}${ext}`);
        try {
          await fs.access(testPath);
          imagePath = testPath;
          break;
        } catch (err) {
          // File doesn't exist with this extension, try next
          continue;
        }
      }

      if (!imagePath) {
        return res.status(404).json({
          message: `Image not found for SKU: ${skuCode}`,
        });
      }

      // If no overlay data provided, send the image as is
      if (!partyName && !size && !sets) {
        return res.sendFile(imagePath);
      }
    }

    // Load the image and add text overlays
    const image = await loadImage(imagePath);
    const canvas = createCanvas(image.width, image.height);
    const ctx = canvas.getContext("2d");

    // Draw the original image
    ctx.drawImage(image, 0, 0);

    // Set text properties for overlays
    ctx.fillStyle = "black";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    // Calculate font size based on image dimensions
    const baseFontSize = Math.floor(image.height / 15);
    const lineHeight = baseFontSize * 1.2;

    // LEFT SIDE: Party Name (split by space and display vertically)
    if (partyName) {
      ctx.font = `bold ${baseFontSize}px Arial`;
      const partyWords = partyName.split(" ");
      const leftX = baseFontSize * 1.5; // Left margin

      partyWords.forEach((word, index) => {
        const y = baseFontSize * 2 + index * lineHeight;
        ctx.fillText(word, leftX, y);
      });
    }

    // RIGHT SIDE: Size - Sets (display vertically)
    if (size || sets) {
      ctx.font = `bold ${baseFontSize}px Arial`;
      const rightX = image.width - baseFontSize * 1.5; // Right margin

      // First line: "size - sets" label
      ctx.fillText("size - sets", rightX, baseFontSize * 2);

      // Second line: actual values (e.g., "2 - 4")
      if (size && sets) {
        const text = `${size} - ${sets}`;
        ctx.fillText(text, rightX, baseFontSize * 2 + lineHeight);
      }

      // If there are multiple size-sets combinations, add them below
      // For now, assuming single combination passed in query params
    }

    // Send the modified image
    const buffer = canvas.toBuffer("image/png");
    res.set("Content-Type", "image/png");
    res.send(buffer);
  } catch (error) {
    console.error("Error generating image with overlay:", error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAppSettings,
  updateAppSettings,
  getSkuImage,
};
