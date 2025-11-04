const { body, validationResult } = require('express-validator');

// Middleware para checar erros de validação
exports.validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log('Erros de validação:', errors.array());
    return res.status(400).json({
      success: false,
      message: 'Erro de validação: ' + errors.array().map(e => e.msg).join(', '),
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
  body('telefone').optional().isLength({ min: 10 }).withMessage('Telefone inválido'),
  body('cnh').optional().isLength({ min: 11, max: 11 }).withMessage('CNH deve ter 11 dígitos')
];

// Validações para login
exports.loginValidation = [
  body('usuario').trim().notEmpty().withMessage('Usuário é obrigatório'),
  body('senha').notEmpty().withMessage('Senha é obrigatória')
];

// Validações para veículo
exports.vehicleValidation = [
  body('tipo').trim().notEmpty().withMessage('Tipo é obrigatório')
    .isIn(['Truck', 'Cavalo', 'Carreta', 'Veiculos Leves'])
    .withMessage('Tipo de veículo inválido'),
  body('frota').trim().notEmpty().withMessage('Número da frota é obrigatório')
    .isLength({ min: 1, max: 20 }).withMessage('Número da frota deve ter entre 1 e 20 caracteres'),
  body('placa').trim().notEmpty().withMessage('Placa é obrigatória')
    .isLength({ min: 7, max: 8 }).withMessage('Placa deve ter formato válido'),
  body('modelo').trim().notEmpty().withMessage('Modelo é obrigatório')
    .isLength({ min: 1, max: 100 }).withMessage('Modelo deve ter entre 1 e 100 caracteres'),
  body('ano').isInt({ min: 1900, max: 2030 })
    .withMessage('Ano deve estar entre 1900 e 2030'),
  body('km_atual').optional().isInt({ min: 0 }).withMessage('Quilometragem deve ser um número positivo')
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