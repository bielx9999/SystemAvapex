const { Maintenance, Vehicle, User } = require('../models');
const { Op } = require('sequelize');

// @desc    Listar todas as manutenções
// @route   GET /api/maintenances
// @access  Private
exports.getMaintenances = async (req, res, next) => {
  try {
    const { status, gravidade, veiculo_id } = req.query;
    
    const where = {};
    if (status) where.status = status;
    if (gravidade) where.gravidade = gravidade;
    if (veiculo_id) where.veiculo_id = veiculo_id;

    const maintenances = await Maintenance.findAll({
      where,
      include: [
        {
          model: Vehicle,
          as: 'veiculo',
          attributes: ['id', 'placa', 'modelo', 'tipo']
        },
        {
          model: User,
          as: 'responsavel',
          attributes: ['id', 'nome']
        }
      ],
      order: [
        ['gravidade', 'DESC'],
        ['data_programada', 'ASC']
      ]
    });

    res.status(200).json({
      success: true,
      count: maintenances.length,
      data: maintenances
    });

  } catch (error) {
    next(error);
  }
};

// @desc    Obter manutenções urgentes
// @route   GET /api/maintenances/urgent
// @access  Private
exports.getUrgentMaintenances = async (req, res, next) => {
  try {
    const maintenances = await Maintenance.findAll({
      where: {
        status: {
          [Op.in]: ['Pendente', 'Em Andamento']
        },
        gravidade: {
          [Op.in]: ['Alta', 'Crítica']
        }
      },
      include: [
        {
          model: Vehicle,
          as: 'veiculo',
          attributes: ['id', 'placa', 'modelo']
        }
      ],
      order: [
        ['gravidade', 'DESC'],
        ['data_programada', 'ASC']
      ]
    });

    res.status(200).json({
      success: true,
      count: maintenances.length,
      data: maintenances
    });

  } catch (error) {
    next(error);
  }
};

// @desc    Obter manutenção por ID
// @route   GET /api/maintenances/:id
// @access  Private
exports.getMaintenance = async (req, res, next) => {
  try {
    const maintenance = await Maintenance.findByPk(req.params.id, {
      include: [
        {
          model: Vehicle,
          as: 'veiculo'
        },
        {
          model: User,
          as: 'responsavel'
        }
      ]
    });

    if (!maintenance) {
      return res.status(404).json({
        success: false,
        message: 'Manutenção não encontrada'
      });
    }

    res.status(200).json({
      success: true,
      data: maintenance
    });

  } catch (error) {
    next(error);
  }
};

// @desc    Criar nova manutenção
// @route   POST /api/maintenances
// @access  Private
exports.createMaintenance = async (req, res, next) => {
  try {
    // Verificar se veículo existe
    const vehicle = await Vehicle.findByPk(req.body.veiculo_id);
    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: 'Veículo não encontrado'
      });
    }

    const maintenance = await Maintenance.create({
      ...req.body,
      responsavel_id: req.user.id
    });

    // Se for manutenção crítica ou alta, atualizar status do veículo
    if (['Alta', 'Crítica'].includes(req.body.gravidade)) {
      await vehicle.update({ status: 'Em Manutenção' });
    }

    const maintenanceData = await Maintenance.findByPk(maintenance.id, {
      include: [
        { model: Vehicle, as: 'veiculo' },
        { model: User, as: 'responsavel' }
      ]
    });

    res.status(201).json({
      success: true,
      message: 'Manutenção registrada com sucesso',
      data: maintenanceData
    });

  } catch (error) {
    next(error);
  }
};

// @desc    Atualizar manutenção
// @route   PUT /api/maintenances/:id
// @access  Private
exports.updateMaintenance = async (req, res, next) => {
  try {
    const maintenance = await Maintenance.findByPk(req.params.id);

    if (!maintenance) {
      return res.status(404).json({
        success: false,
        message: 'Manutenção não encontrada'
      });
    }

    await maintenance.update(req.body);

    const maintenanceData = await Maintenance.findByPk(maintenance.id, {
      include: [
        { model: Vehicle, as: 'veiculo' },
        { model: User, as: 'responsavel' }
      ]
    });

    res.status(200).json({
      success: true,
      message: 'Manutenção atualizada com sucesso',
      data: maintenanceData
    });

  } catch (error) {
    next(error);
  }
};

// @desc    Atualizar status da manutenção
// @route   PUT /api/maintenances/:id/status
// @access  Private
exports.updateStatus = async (req, res, next) => {
  try {
    const { status, data_realizada } = req.body;
    const maintenance = await Maintenance.findByPk(req.params.id, {
      include: [{ model: Vehicle, as: 'veiculo' }]
    });

    if (!maintenance) {
      return res.status(404).json({
        success: false,
        message: 'Manutenção não encontrada'
      });
    }

    await maintenance.update({
      status,
      ...(data_realizada && { data_realizada })
    });

    // Se concluir a manutenção, retornar veículo para disponível
    if (status === 'Concluída') {
      await maintenance.veiculo.update({ status: 'Disponível' });
    }

    res.status(200).json({
      success: true,
      message: 'Status atualizado com sucesso',
      data: maintenance
    });

  } catch (error) {
    next(error);
  }
};

// @desc    Deletar manutenção
// @route   DELETE /api/maintenances/:id
// @access  Private (Gerente)
exports.deleteMaintenance = async (req, res, next) => {
  try {
    const maintenance = await Maintenance.findByPk(req.params.id);

    if (!maintenance) {
      return res.status(404).json({
        success: false,
        message: 'Manutenção não encontrada'
      });
    }

    await maintenance.destroy();

    res.status(200).json({
      success: true,
      message: 'Manutenção removida com sucesso'
    });

  } catch (error) {
    next(error);
  }
};