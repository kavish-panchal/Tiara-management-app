const express = require('express');
const router = express.Router();
const {
  getProductionStages,
  getProductionStageById,
  createProductionStage,
  updateProductionStage,
  deleteProductionStage,
  reorderProductionStages,
} = require('../controllers/productionStageController');

// Reorder route (must be before /:id routes)
router.put('/reorder', reorderProductionStages);

// CRUD routes
router.route('/')
  .get(getProductionStages)
  .post(createProductionStage);

router.route('/:id')
  .get(getProductionStageById)
  .put(updateProductionStage)
  .delete(deleteProductionStage);

module.exports = router;

