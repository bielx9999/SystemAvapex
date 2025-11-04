const { body, validationResult } = require('express-validator');

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
  body('matricula').trim().notEmpty().withMessage('Matrícula é obrigatória')
    .isLength({ min: 3 }).withMessage('Matrícula deve ter no mínimo 3 caracteres'),
  body('senha').notEmpty().withMessage('Senha é obrigatória')
    .isLength({ min: 3 }).withMessage('Senha deve ter no mínimo 3 caracteres'),
  body('perfil').isIn(['Motorista', 'Assistente', 'Gerente'])
    .withMessage('Perfil inválido'),
  body('telefone').optional().isLength({ min: 8 }).withMessage('Telefone deve ter no mínimo 8 caracteres')
];

// Validações para login
exports.loginValidation = [
  body('matricula').trim().notEmpty().withMessage('Matrícula é obrigatória'),
  body('senha').notEmpty().withMessage('Senha é obrigatória')
];

// Validações para veículo
exports.vehicleValidation = [
  body('tipo').trim().notEmpty().withMessage('Tipo é obrigatório'),
  body('frota').trim().notEmpty().withMessage('Número da frota é obrigatório'),
  body('placa').trim().notEmpty().withMessage('Placa é obrigatória'),
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