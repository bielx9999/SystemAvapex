const { Vehicle, User } = require('../models');
const { createMensagem } = require('./mensagemController');

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
    console.log('Dados recebidos para criar veículo:', req.body);
    
    const vehicle = await Vehicle.create(req.body);
    
    // Enviar mensagem para Gerentes e Assistentes
    const usuarios = await User.findAll({
      where: { perfil: ['Gerente', 'Assistente'], ativo: true },
      attributes: ['id']
    });
    
    if (usuarios.length > 0) {
      await createMensagem(
        'Novo Veículo Cadastrado',
        `Veículo ${vehicle.placa} (${vehicle.frota}) foi cadastrado no sistema.`,
        'veiculo',
        usuarios.map(u => u.id)
      );
    }
    
    res.status(201).json({ success: true, message: 'Veículo cadastrado', data: vehicle });
  } catch (error) {
    console.error('Erro ao criar veículo:', error);
    
    let errorMessage = 'Erro ao criar veículo';
    
    if (error.name === 'SequelizeUniqueConstraintError') {
      errorMessage = 'Número da frota já existe';
    } else if (error.name === 'SequelizeValidationError') {
      errorMessage = error.errors.map(e => e.message).join(', ');
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    res.status(400).json({ 
      success: false, 
      message: errorMessage
    });
  }
};

exports.updateVehicle = async (req, res, next) => {
  try {
    console.log('Dados recebidos para atualizar veículo:', req.body);
    
    const vehicle = await Vehicle.findByPk(req.params.id);
    if (!vehicle) {
      return res.status(404).json({ success: false, message: 'Veículo não encontrado' });
    }
    await vehicle.update(req.body);
    res.status(200).json({ success: true, message: 'Veículo atualizado', data: vehicle });
  } catch (error) {
    console.error('Erro ao atualizar veículo:', error);
    
    let errorMessage = 'Erro ao atualizar veículo';
    
    if (error.name === 'SequelizeUniqueConstraintError') {
      errorMessage = 'Número da frota já existe';
    } else if (error.name === 'SequelizeValidationError') {
      errorMessage = error.errors.map(e => e.message).join(', ');
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    res.status(400).json({ 
      success: false, 
      message: errorMessage
    });
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
