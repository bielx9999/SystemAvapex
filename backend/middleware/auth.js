const jwt = require('jsonwebtoken');
const { User } = require('../models');

// Middleware de autenticação
exports.protect = async (req, res, next) => {
  try {
    let token;

    // Verificar se token existe no header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Acesso não autorizado. Token não fornecido.'
      });
    }

    // Verificar token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Buscar usuário
    const user = await User.findByPk(decoded.id);

    if (!user || !user.ativo) {
      return res.status(401).json({
        success: false,
        message: 'Usuário não encontrado ou inativo'
      });
    }

    // Adicionar usuário à requisição
    req.user = user;
    next();

  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Token inválido ou expirado'
    });
  }
};

// Middleware de autorização por perfil
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.perfil)) {
      return res.status(403).json({
        success: false,
        message: `Perfil ${req.user.perfil} não autorizado para esta ação`
      });
    }
    next();
  };
};