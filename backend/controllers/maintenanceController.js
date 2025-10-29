const { Maintenance, Vehicle, User } = require('../models');

exports.getMaintenances = async (req, res, next) => {
  try {
    const maintenances = await Maintenance.findAll({
      include: [
        { model: Vehicle, as: 'veiculo', attributes: ['id', 'placa', 'modelo'] },
        { model: User, as: 'responsavel', attributes: ['id', 'nome'] }
      ],
      order: [['gravidade', 'DESC'], ['data_programada', 'ASC']]
    });
    res.status(200).json({ success: true, count: maintenances.length, data: maintenances });
  } catch (error) {
    next(error);
  }
};

exports.getMaintenance = async (req, res, next) => {
  try {
    const maintenance = await Maintenance.findByPk(req.params.id, {
      include: [
        { model: Vehicle, as: 'veiculo' },
        { model: User, as: 'responsavel' }
      ]
    });
    if (!maintenance) {
      return res.status(404).json({ success: false, message: 'Manutenção não encontrada' });
    }
    res.status(200).json({ success: true, data: maintenance });
  } catch (error) {
    next(error);
  }
};

exports.createMaintenance = async (req, res, next) => {
  try {
    const maintenance = await Maintenance.create({
      ...req.body,
      responsavel_id: req.user.id
    });
    const data = await Maintenance.findByPk(maintenance.id, {
      include: [
        { model: Vehicle, as: 'veiculo' },
        { model: User, as: 'responsavel' }
      ]
    });
    res.status(201).json({ success: true, message: 'Manutenção registrada', data });
  } catch (error) {
    next(error);
  }
};

exports.updateMaintenance = async (req, res, next) => {
  try {
    const maintenance = await Maintenance.findByPk(req.params.id);
    if (!maintenance) {
      return res.status(404).json({ success: false, message: 'Manutenção não encontrada' });
    }
    await maintenance.update(req.body);
    res.status(200).json({ success: true, message: 'Manutenção atualizada', data: maintenance });
  } catch (error) {
    next(error);
  }
};

exports.getUrgentMaintenances = async (req, res, next) => {
  try {
    const maintenances = await Maintenance.findAll({
      where: {
        gravidade: ['Alta', 'Crítica'],
        status: 'Pendente'
      },
      include: [
        { model: Vehicle, as: 'veiculo', attributes: ['id', 'placa', 'modelo'] }
      ],
      order: [['gravidade', 'DESC'], ['data_programada', 'ASC']]
    });
    res.status(200).json({ success: true, count: maintenances.length, data: maintenances });
  } catch (error) {
    next(error);
  }
};

exports.updateStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const maintenance = await Maintenance.findByPk(req.params.id);
    if (!maintenance) {
      return res.status(404).json({ success: false, message: 'Manutenção não encontrada' });
    }
    await maintenance.update({ status });
    res.status(200).json({ success: true, message: 'Status atualizado', data: maintenance });
  } catch (error) {
    next(error);
  }
};

exports.deleteMaintenance = async (req, res, next) => {
  try {
    const maintenance = await Maintenance.findByPk(req.params.id);
    if (!maintenance) {
      return res.status(404).json({ success: false, message: 'Manutenção não encontrada' });
    }
    await maintenance.destroy();
    res.status(200).json({ success: true, message: 'Manutenção removida' });
  } catch (error) {
    next(error);
  }
};
