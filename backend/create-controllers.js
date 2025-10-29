const fs = require('fs');
const path = require('path');

// Script para criar todos os controllers necessários
console.log('📁 Criando controllers...\n');

const controllersDir = path.join(__dirname, 'controllers');

// Criar pasta controllers se não existir
if (!fs.existsSync(controllersDir)) {
  fs.mkdirSync(controllersDir);
  console.log('✅ Pasta controllers criada');
}

// authController.js
const authController = `const jwt = require('jsonwebtoken');
const { User } = require('../models');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });
};

exports.register = async (req, res, next) => {
  try {
    const { nome, usuario, senha, perfil, telefone, cnh } = req.body;
    const userExists = await User.findOne({ where: { usuario } });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'Usuário já cadastrado'
      });
    }
    const user = await User.create({ nome, usuario, senha, perfil, telefone, cnh });
    const token = generateToken(user.id);
    res.status(201).json({
      success: true,
      message: 'Usuário registrado com sucesso',
      data: { user: user.toJSON(), token }
    });
  } catch (error) {
    console.error('Erro no registro:', error);
    next(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { usuario, senha } = req.body;
    console.log('🔐 Login:', usuario);
    if (!usuario || !senha) {
      return res.status(400).json({
        success: false,
        message: 'Forneça usuário e senha'
      });
    }
    const user = await User.findOne({ 
      where: { usuario },
      attributes: { include: ['senha'] }
    });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Credenciais inválidas'
      });
    }
    if (!user.ativo) {
      return res.status(401).json({
        success: false,
        message: 'Usuário inativo'
      });
    }
    const isPasswordValid = await user.comparePassword(senha);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Credenciais inválidas'
      });
    }
    const token = generateToken(user.id);
    const userData = user.toJSON();
    console.log('✅ Login OK:', usuario);
    res.status(200).json({
      success: true,
      message: 'Login realizado com sucesso',
      data: { user: userData, token }
    });
  } catch (error) {
    console.error('Erro no login:', error);
    next(error);
  }
};

exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.id);
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

exports.changePassword = async (req, res, next) => {
  try {
    const { senhaAtual, novaSenha } = req.body;
    const user = await User.findByPk(req.user.id, {
      attributes: { include: ['senha'] }
    });
    const isPasswordValid = await user.comparePassword(senhaAtual);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Senha atual incorreta'
      });
    }
    user.senha = novaSenha;
    await user.save();
    res.status(200).json({
      success: true,
      message: 'Senha alterada com sucesso'
    });
  } catch (error) {
    next(error);
  }
};

exports.logout = async (req, res, next) => {
  try {
    res.status(200).json({
      success: true,
      message: 'Logout realizado com sucesso'
    });
  } catch (error) {
    next(error);
  }
};
`;

// userController.js
const userController = `const { User } = require('../models');

exports.getUsers = async (req, res, next) => {
  try {
    const users = await User.findAll({
      where: { ativo: true },
      order: [['nome', 'ASC']]
    });
    res.status(200).json({ success: true, count: users.length, data: users });
  } catch (error) {
    next(error);
  }
};

exports.getUser = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Usuário não encontrado' });
    }
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

exports.updateUser = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Usuário não encontrado' });
    }
    delete req.body.senha;
    await user.update(req.body);
    res.status(200).json({ success: true, message: 'Usuário atualizado', data: user });
  } catch (error) {
    next(error);
  }
};

exports.deleteUser = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Usuário não encontrado' });
    }
    await user.update({ ativo: false });
    res.status(200).json({ success: true, message: 'Usuário desativado' });
  } catch (error) {
    next(error);
  }
};
`;

// vehicleController.js - Simplificado
const vehicleController = `const { Vehicle } = require('../models');

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
`;

// maintenanceController.js - Simplificado
const maintenanceController = `const { Maintenance, Vehicle, User } = require('../models');

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
`;

// cteController.js - Simplificado
const cteController = `const { Cte, Vehicle, User } = require('../models');

exports.getCtes = async (req, res, next) => {
  try {
    const ctes = await Cte.findAll({
      include: [
        { model: Vehicle, as: 'veiculo', attributes: ['id', 'placa'] },
        { model: User, as: 'motorista', attributes: ['id', 'nome'] }
      ],
      order: [['data_emissao', 'DESC']]
    });
    res.status(200).json({ success: true, count: ctes.length, data: ctes });
  } catch (error) {
    next(error);
  }
};

exports.getCte = async (req, res, next) => {
  try {
    const cte = await Cte.findByPk(req.params.id, {
      include: [
        { model: Vehicle, as: 'veiculo' },
        { model: User, as: 'motorista' }
      ]
    });
    if (!cte) {
      return res.status(404).json({ success: false, message: 'CT-e não encontrado' });
    }
    res.status(200).json({ success: true, data: cte });
  } catch (error) {
    next(error);
  }
};

exports.createCte = async (req, res, next) => {
  try {
    let arquivo_nome = null;
    let arquivo_path = null;
    if (req.file) {
      arquivo_nome = req.file.originalname;
      arquivo_path = req.file.path;
    }
    const cte = await Cte.create({ ...req.body, arquivo_nome, arquivo_path });
    const data = await Cte.findByPk(cte.id, {
      include: [
        { model: Vehicle, as: 'veiculo' },
        { model: User, as: 'motorista' }
      ]
    });
    res.status(201).json({ success: true, message: 'CT-e cadastrado', data });
  } catch (error) {
    next(error);
  }
};

exports.updateCte = async (req, res, next) => {
  try {
    const cte = await Cte.findByPk(req.params.id);
    if (!cte) {
      return res.status(404).json({ success: false, message: 'CT-e não encontrado' });
    }
    if (req.file) {
      req.body.arquivo_nome = req.file.originalname;
      req.body.arquivo_path = req.file.path;
    }
    await cte.update(req.body);
    res.status(200).json({ success: true, message: 'CT-e atualizado', data: cte });
  } catch (error) {
    next(error);
  }
};

exports.deleteCte = async (req, res, next) => {
  try {
    const cte = await Cte.findByPk(req.params.id);
    if (!cte) {
      return res.status(404).json({ success: false, message: 'CT-e não encontrado' });
    }
    await cte.destroy();
    res.status(200).json({ success: true, message: 'CT-e removido' });
  } catch (error) {
    next(error);
  }
};
`;

// dashboardController.js
const dashboardController = `const { User, Vehicle, Maintenance, Cte } = require('../models');
const { Op } = require('sequelize');

exports.getStats = async (req, res, next) => {
  try {
    const totalVeiculos = await Vehicle.count({ where: { ativo: true } });
    const veiculosDisponiveis = await Vehicle.count({ where: { status: 'Disponível', ativo: true } });
    const totalMotoristas = await User.count({ where: { perfil: 'Motorista', ativo: true } });
    const manutencoesUrgentes = await Maintenance.count({
      where: {
        status: { [Op.in]: ['Pendente', 'Em Andamento'] },
        gravidade: { [Op.in]: ['Alta', 'Crítica'] }
      }
    });
    const dataInicio = new Date();
    dataInicio.setDate(1);
    const cteMesAtual = await Cte.count({
      where: { data_emissao: { [Op.gte]: dataInicio } }
    });
    const cteEmTransito = await Cte.count({ where: { status: 'Em Trânsito' } });
    res.status(200).json({
      success: true,
      data: {
        veiculos: { total: totalVeiculos, disponiveis: veiculosDisponiveis },
        motoristas: { total: totalMotoristas },
        manutencoes: { urgentes: manutencoesUrgentes },
        ctes: { mes_atual: cteMesAtual, em_transito: cteEmTransito }
      }
    });
  } catch (error) {
    next(error);
  }
};
`;

// Escrever arquivos
const files = {
  'authController.js': authController,
  'userController.js': userController,
  'vehicleController.js': vehicleController,
  'maintenanceController.js': maintenanceController,
  'cteController.js': cteController,
  'dashboardController.js': dashboardController
};

Object.keys(files).forEach(filename => {
  const filePath = path.join(controllersDir, filename);
  fs.writeFileSync(filePath, files[filename]);
  console.log(`✅ ${filename} criado`);
});

console.log('\n🎉 Todos os controllers foram criados com sucesso!');
console.log('\n📝 Execute agora: npm run dev');