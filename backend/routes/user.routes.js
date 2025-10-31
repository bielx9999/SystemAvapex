const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { User } = require('../models');

// Listar todos os usuários (apenas Gerente e Assistente)
router.get('/', protect, authorize('Gerente', 'Assistente'), async (req, res, next) => {
  try {
    const users = await User.findAll({
      where: { ativo: true },
      order: [['nome', 'ASC']]
    });

    res.status(200).json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    next(error);
  }
});

// Obter usuário por ID
router.get('/:id', protect, async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado'
      });
    }

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
});

// Atualizar usuário
router.put('/:id', protect, authorize('Gerente', 'Assistente'), async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado'
      });
    }

    // Não permitir atualização de senha por aqui
    delete req.body.senha;

    await user.update(req.body);

    res.status(200).json({
      success: true,
      message: 'Usuário atualizado com sucesso',
      data: user
    });
  } catch (error) {
    next(error);
  }
});

// Desativar usuário
router.delete('/:id', protect, authorize('Gerente', 'Assistente'), async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado'
      });
    }

    await user.update({ ativo: false });

    res.status(200).json({
      success: true,
      message: 'Usuário desativado com sucesso'
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;