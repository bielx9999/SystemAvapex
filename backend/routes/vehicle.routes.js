const express = require('express');
const router = express.Router();
const {
  getVehicles,
  getVehicle,
  createVehicle,
  updateVehicle,
  updateKm,
  deleteVehicle
} = require('../controllers/vehicleController');
const { protect, authorize } = require('../middleware/auth');
const { vehicleValidation, validate } = require('../middleware/validators-clean');

router.route('/')
  .get(protect, getVehicles)
  .post(protect, authorize('Gerente', 'Assistente'), vehicleValidation, validate, createVehicle);

router.route('/:id')
  .get(protect, getVehicle)
  .put(protect, authorize('Gerente', 'Assistente'), vehicleValidation, validate, updateVehicle)
  .delete(protect, authorize('Gerente', 'Assistente'), deleteVehicle);

router.put('/:id/km', protect, updateKm);

module.exports = router;