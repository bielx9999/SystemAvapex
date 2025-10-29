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

router.route('/')
  .get(protect, getMaintenances)
  .post(protect, maintenanceValidation, validate, createMaintenance);

router.get('/urgent', protect, getUrgentMaintenances);

router.route('/:id')
  .get(protect, getMaintenance)
  .put(protect, updateMaintenance)
  .delete(protect, authorize('Gerente'), deleteMaintenance);

router.put('/:id/status', protect, updateStatus);

module.exports = router;
