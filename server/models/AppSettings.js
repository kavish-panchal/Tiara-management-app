const mongoose = require("mongoose");

const appSettingsSchema = new mongoose.Schema(
  {
    skuImageFolderPath: {
      type: String,
      default: "",
      trim: true,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("AppSettings", appSettingsSchema);

