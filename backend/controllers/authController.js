const jwt = require('jsonwebtoken');
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
