const errorHandler = (err, req, res, next) => {
  console.error('❌ Erro:', err);

  // Erro de validação do Sequelize
  if (err.name === 'SequelizeValidationError') {
    const errors = err.errors.map(e => e.message);
    return res.status(400).json({
      success: false,
      message: 'Erro de validação',
      errors
    });
  }

  // Erro de unique constraint
  if (err.name === 'SequelizeUniqueConstraintError') {
    return res.status(400).json({
      success: false,
      message: 'Registro duplicado',
      field: err.errors[0].path
    });
  }

  // Erro de foreign key
  if (err.name === 'SequelizeForeignKeyConstraintError') {
    return res.status(400).json({
      success: false,
      message: 'Referência inválida'
    });
  }

  // Erro do JWT
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Token inválido'
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'Token expirado'
    });
  }

  // Erro do Multer (upload)
  if (err.name === 'MulterError') {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'Arquivo muito grande. Máximo: 5MB'
      });
    }
    return res.status(400).json({
      success: false,
      message: 'Erro no upload do arquivo'
    });
  }

  // Erro genérico
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Erro interno do servidor',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

module.exports = errorHandler;

// ============================================
// backend/middleware/validators.js
// ============================================

const { body, param, query, validationResult } = require('express-validator');

// Middleware para checar erros de validação
exports.validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Erro de validação',
      errors: errors.array()
    });
  }
  next();
};

// Validações para registro de usuário
exports.registerValidation = [
  body('nome').trim().notEmpty().withMessage('Nome é obrigatório'),
  body('usuario').trim().notEmpty().withMessage('Usuário é obrigatório')
    .isLength({ min: 3 }).withMessage('Usuário deve ter no mínimo 3 caracteres'),
  body('senha').notEmpty().withMessage('Senha é obrigatória')
    .isLength({ min: 3 }).withMessage('Senha deve ter no mínimo 3 caracteres'),
  body('perfil').isIn(['Motorista', 'Assistente', 'Gerente'])
    .withMessage('Perfil inválido'),
  body('telefone').optional().isMobilePhone('pt-BR').withMessage('Telefone inválido'),
  body('cnh').optional().isLength({ min: 11, max: 11 }).withMessage('CNH deve ter 11 dígitos')
];

// Validações para login
exports.loginValidation = [
  body('usuario').trim().notEmpty().withMessage('Usuário é obrigatório'),
  body('senha').notEmpty().withMessage('Senha é obrigatória')
];

// Validações para veículo
exports.vehicleValidation = [
  body('tipo').isIn(['Caminhão', 'Carreta', 'Van', 'Utilitário'])
    .withMessage('Tipo de veículo inválido'),
  body('placa').trim().notEmpty().withMessage('Placa é obrigatória')
    .matches(/^[A-Z]{3}-\d{4}$/).withMessage('Formato de placa inválido (ABC-1234)'),
  body('modelo').trim().notEmpty().withMessage('Modelo é obrigatório'),
  body('ano').isInt({ min: 1900, max: new Date().getFullYear() + 1 })
    .withMessage('Ano inválido'),
  body('km_atual').optional().isInt({ min: 0 }).withMessage('Quilometragem inválida')
];

// Validações para manutenção
exports.maintenanceValidation = [
  body('veiculo_id').isInt().withMessage('ID do veículo inválido'),
  body('tipo').isIn(['Preventiva', 'Corretiva', 'Preditiva'])
    .withMessage('Tipo de manutenção inválido'),
  body('data_programada').isDate().withMessage('Data inválida'),
  body('km_manutencao').isInt({ min: 0 }).withMessage('Quilometragem inválida'),
  body('descricao').trim().notEmpty().withMessage('Descrição é obrigatória'),
  body('gravidade').isIn(['Baixa', 'Média', 'Alta', 'Crítica'])
    .withMessage('Gravidade inválida')
];

// Validações para CT-e
exports.cteValidation = [
  body('numero').trim().notEmpty().withMessage('Número do CT-e é obrigatório'),
  body('data_emissao').isDate().withMessage('Data de emissão inválida'),
  body('veiculo_id').optional().isInt().withMessage('ID do veículo inválido'),
  body('motorista_id').optional().isInt().withMessage('ID do motorista inválido')
];