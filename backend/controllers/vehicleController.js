const { Vehicle, Maintenance } = require('../models');
const { Op } = require('sequelize');

// @desc    Listar todos os veículos
// @route   GET /api/vehicles
// @access  Private
exports.getVehicles = async (req, res, next) => {
  try {
    const { status, tipo, ativo } = req.query;
    
    const where = {};
    if (status) where.status = status;
    if (tipo) where.tipo = tipo;
    if (ativo !== undefined) where.ativo = ativo === 'true';

    const vehicles = await Vehicle.findAll({
      where,
      order: [['placa', 'ASC']]
    });

    res.status(200).json({
      success: true,
      count: vehicles.length,
      data: vehicles
    });

  } catch (error) {
    next(error);
  }
};

// @desc    Obter veículo por ID
// @route   GET /api/vehicles/:id
// @access  Private
exports.getVehicle = async (req, res, next) => {
  try {
    const vehicle = await Vehicle.findByPk(req.params.id, {
      include: [
        {
          model: Maintenance,
          as: 'manutencoes',
          limit: 10,
          order: [['data_programada', 'DESC']]
        }
      ]
    });

    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: 'Veículo não encontrado'
      });
    }

    res.status(200).json({
      success: true,
      data: vehicle
    });

  } catch (error) {
    next(error);
  }
};

// @desc    Criar novo veículo
// @route   POST /api/vehicles
// @access  Private (Gerente, Assistente)
exports.createVehicle = async (req, res, next) => {
  try {
    const vehicle = await Vehicle.create(req.body);

    res.status(201).json({
      success: true,
      message: 'Veículo cadastrado com sucesso',
      data: vehicle
    });

  } catch (error) {
    next(error);
  }
};

// @desc    Atualizar veículo
// @route   PUT /api/vehicles/:id
// @access  Private (Gerente, Assistente)
exports.updateVehicle = async (req, res, next) => {
  try {
    const vehicle = await Vehicle.findByPk(req.params.id);

    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: 'Veículo não encontrado'
      });
    }

    await vehicle.update(req.body);

    res.status(200).json({
      success: true,
      message: 'Veículo atualizado com sucesso',
      data: vehicle
    });

  } catch (error) {
    next(error);
  }
};

// @desc    Atualizar quilometragem do veículo
// @route   PUT /api/vehicles/:id/km
// @access  Private
exports.updateKm = async (req, res, next) => {
  try {
    const { km_atual } = req.body;
    const vehicle = await Vehicle.findByPk(req.params.id);

    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: 'Veículo não encontrado'
      });
    }

    if (km_atual < vehicle.km_atual) {
      return res.status(400).json({
        success: false,
        message: 'A quilometragem não pode ser menor que a atual'
      });
    }

    await vehicle.update({ km_atual });

    res.status(200).json({
      success: true,
      message: 'Quilometragem atualizada com sucesso',
      data: vehicle
    });

  } catch (error) {
    next(error);
  }
};

// @desc    Desativar veículo
// @route   DELETE /api/vehicles/:id
// @access  Private (Gerente)
exports.deleteVehicle = async (req, res, next) => {
  try {
    const vehicle = await Vehicle.findByPk(req.params.id);

    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: 'Veículo não encontrado'
      });
    }

    await vehicle.update({ ativo: false });

    res.status(200).json({
      success: true,
      message: 'Veículo desativado com sucesso'
    });

  } catch (error) {
    next(error);
  }
};
