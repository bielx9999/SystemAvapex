const express = require('express');
const router = express.Router();
const {
  getMaintenances,
  getUrgentMaintenances,
  getMaintenance,
  createMaintenance,
  updateMaintenance,
  updateStatus,
  deleteMaintenance
} = require('../controllers/maintenanceController');
const { protect, authorize } = require('../middleware/auth');
const { maintenanceValidation, validate } = require('../middleware/validators');
const upload = require('../middleware/upload');

router.route('/')
  .get(protect, getMaintenances)
  .post(protect, createMaintenance);

router.get('/urgent', protect, getUrgentMaintenances);

router.route('/:id')
  .get(protect, getMaintenance)
  .put(protect, updateMaintenance)
  .delete(protect, authorize('Gerente', 'Assistente'), deleteMaintenance);

router.put('/:id/status', protect, updateStatus);

module.exports = router;
