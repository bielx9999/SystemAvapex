const jwt = require('jsonwebtoken');
const { User } = require('../models');

// Gerar JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });
};

// @desc    Registrar novo usuário
// @route   POST /api/auth/register
// @access  Public (ou protegido dependendo da regra de negócio)
exports.register = async (req, res, next) => {
  try {
    const { nome, usuario, senha, perfil, telefone, cnh } = req.body;

    // Verificar se usuário já existe
    const userExists = await User.findOne({ where: { usuario } });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'Usuário já cadastrado'
      });
    }

    // Criar usuário (senha será hasheada automaticamente pelo hook)
    const user = await User.create({
      nome,
      usuario,
      senha,
      perfil,
      telefone,
      cnh
    });

    // Gerar token
    const token = generateToken(user.id);

    res.status(201).json({
      success: true,
      message: 'Usuário registrado com sucesso',
      data: {
        user: user.toJSON(),
        token
      }
    });

  } catch (error) {
    next(error);
  }
};

// @desc    Login de usuário
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res, next) => {
  try {
    const { usuario, senha } = req.body;

    // Verificar se usuário e senha foram fornecidos
    if (!usuario || !senha) {
      return res.status(400).json({
        success: false,
        message: 'Por favor, forneça usuário e senha'
      });
    }

    // Buscar usuário (incluindo senha para comparação)
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

    // Verificar se usuário está ativo
    if (!user.ativo) {
      return res.status(401).json({
        success: false,
        message: 'Usuário inativo. Contate o administrador.'
      });
    }

    // Comparar senha
    const isPasswordValid = await user.comparePassword(senha);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Credenciais inválidas'
      });
    }

    // Gerar token
    const token = generateToken(user.id);

    // Remover senha do retorno
    const userData = user.toJSON();

    res.status(200).json({
      success: true,
      message: 'Login realizado com sucesso',
      data: {
        user: userData,
        token
      }
    });

  } catch (error) {
    next(error);
  }
};

// @desc    Obter dados do usuário logado
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.id);

    res.status(200).json({
      success: true,
      data: user
    });

  } catch (error) {
    next(error);
  }
};

// @desc    Alterar senha
// @route   PUT /api/auth/change-password
// @access  Private
exports.changePassword = async (req, res, next) => {
  try {
    const { senhaAtual, novaSenha } = req.body;

    // Buscar usuário com senha
    const user = await User.findByPk(req.user.id, {
      attributes: { include: ['senha'] }
    });

    // Verificar senha atual
    const isPasswordValid = await user.comparePassword(senhaAtual);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Senha atual incorreta'
      });
    }

    // Atualizar senha
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

// @desc    Logout (invalida o token no frontend)
// @route   POST /api/auth/logout
// @access  Private
exports.logout = async (req, res, next) => {
  try {
    // Em uma implementação real com Redis/cache, você invalidaria o token aqui
    // Por enquanto, apenas retornamos sucesso pois o frontend removerá o token
    
    res.status(200).json({
      success: true,
      message: 'Logout realizado com sucesso'
    });

  } catch (error) {
    next(error);
  }
};