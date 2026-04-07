const ProductionStage = require('../models/ProductionStage');

// @desc    Get all production stages
// @route   GET /api/settings/production-stages
// @access  Private
const getProductionStages = async (req, res) => {
  try {
    const stages = await ProductionStage.find().sort({ order: 1 });
    res.json(stages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single production stage
// @route   GET /api/settings/production-stages/:id
// @access  Private
const getProductionStageById = async (req, res) => {
  try {
    const stage = await ProductionStage.findById(req.params.id);
    
    if (!stage) {
      return res.status(404).json({ message: 'Production stage not found' });
    }
    
    res.json(stage);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create new production stage
// @route   POST /api/settings/production-stages
// @access  Private (Owner only)
const createProductionStage = async (req, res) => {
  try {
    const { stageName, order, active, description } = req.body;

    // Validation
    if (!stageName) {
      return res.status(400).json({ message: 'Stage name is required' });
    }

    // Check if stage name already exists
    const existingStage = await ProductionStage.findOne({ stageName });
    if (existingStage) {
      return res.status(400).json({ message: 'Stage name already exists' });
    }

    // If order is not provided, set it to the highest order + 1
    let stageOrder = order;
    if (stageOrder === undefined || stageOrder === null) {
      const lastStage = await ProductionStage.findOne().sort({ order: -1 });
      stageOrder = lastStage ? lastStage.order + 1 : 0;
    }

    const stage = await ProductionStage.create({
      stageName,
      order: stageOrder,
      active: active !== undefined ? active : true,
      description: description || '',
    });

    res.status(201).json(stage);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update production stage
// @route   PUT /api/settings/production-stages/:id
// @access  Private (Owner only)
const updateProductionStage = async (req, res) => {
  try {
    const stage = await ProductionStage.findById(req.params.id);

    if (!stage) {
      return res.status(404).json({ message: 'Production stage not found' });
    }

    const { stageName, order, active, description } = req.body;

    // Check if new stage name already exists (excluding current stage)
    if (stageName && stageName !== stage.stageName) {
      const existingStage = await ProductionStage.findOne({ stageName });
      if (existingStage) {
        return res.status(400).json({ message: 'Stage name already exists' });
      }
    }

    stage.stageName = stageName || stage.stageName;
    stage.order = order !== undefined ? order : stage.order;
    stage.active = active !== undefined ? active : stage.active;
    stage.description = description !== undefined ? description : stage.description;

    const updatedStage = await stage.save();
    res.json(updatedStage);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete production stage
// @route   DELETE /api/settings/production-stages/:id
// @access  Private (Owner only)
const deleteProductionStage = async (req, res) => {
  try {
    const stage = await ProductionStage.findById(req.params.id);

    if (!stage) {
      return res.status(404).json({ message: 'Production stage not found' });
    }

    await stage.deleteOne();
    res.json({ message: 'Production stage removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Reorder production stages
// @route   PUT /api/settings/production-stages/reorder
// @access  Private (Owner only)
const reorderProductionStages = async (req, res) => {
  try {
    const { stages } = req.body; // Array of { id, order }

    if (!stages || !Array.isArray(stages)) {
      return res.status(400).json({ message: 'Invalid stages data' });
    }

    // Update each stage's order
    const updatePromises = stages.map(({ id, order }) =>
      ProductionStage.findByIdAndUpdate(id, { order }, { new: true })
    );

    await Promise.all(updatePromises);

    // Return updated list
    const updatedStages = await ProductionStage.find().sort({ order: 1 });
    res.json(updatedStages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getProductionStages,
  getProductionStageById,
  createProductionStage,
  updateProductionStage,
  deleteProductionStage,
  reorderProductionStages,
};

