const { Vehicle } = require('../models');

exports.getVehicles = async (req, res, next) => {
  try {
    const vehicles = await Vehicle.findAll({ order: [['placa', 'ASC']] });
    res.status(200).json({ success: true, count: vehicles.length, data: vehicles });
  } catch (error) {
    next(error);
  }
};

exports.getVehicle = async (req, res, next) => {
  try {
    const vehicle = await Vehicle.findByPk(req.params.id);
    if (!vehicle) {
      return res.status(404).json({ success: false, message: 'Veículo não encontrado' });
    }
    res.status(200).json({ success: true, data: vehicle });
  } catch (error) {
    next(error);
  }
};

exports.createVehicle = async (req, res, next) => {
  try {
    const vehicle = await Vehicle.create(req.body);
    res.status(201).json({ success: true, message: 'Veículo cadastrado', data: vehicle });
  } catch (error) {
    next(error);
  }
};

exports.updateVehicle = async (req, res, next) => {
  try {
    const vehicle = await Vehicle.findByPk(req.params.id);
    if (!vehicle) {
      return res.status(404).json({ success: false, message: 'Veículo não encontrado' });
    }
    await vehicle.update(req.body);
    res.status(200).json({ success: true, message: 'Veículo atualizado', data: vehicle });
  } catch (error) {
    next(error);
  }
};

exports.updateKm = async (req, res, next) => {
  try {
    const vehicle = await Vehicle.findByPk(req.params.id);
    if (!vehicle) {
      return res.status(404).json({ success: false, message: 'Veículo não encontrado' });
    }
    await vehicle.update({ km_atual: req.body.km_atual });
    res.status(200).json({ success: true, message: 'KM atualizado', data: vehicle });
  } catch (error) {
    next(error);
  }
};

exports.deleteVehicle = async (req, res, next) => {
  try {
    const vehicle = await Vehicle.findByPk(req.params.id);
    if (!vehicle) {
      return res.status(404).json({ success: false, message: 'Veículo não encontrado' });
    }
    await vehicle.update({ ativo: false });
    res.status(200).json({ success: true, message: 'Veículo desativado' });
  } catch (error) {
    next(error);
  }
};
