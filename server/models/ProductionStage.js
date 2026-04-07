const mongoose = require('mongoose');

const productionStageSchema = new mongoose.Schema({
  stageName: {
    type: String,
    required: true,
    trim: true,
    unique: true,
  },
  order: {
    type: Number,
    required: true,
    default: 0,
  },
  active: {
    type: Boolean,
    default: true,
  },
  description: {
    type: String,
    default: '',
  },
}, {
  timestamps: true,
});

// Index for sorting by order
productionStageSchema.index({ order: 1 });

module.exports = mongoose.model('ProductionStage', productionStageSchema);

