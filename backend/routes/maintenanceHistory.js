const express = require('express');
const router = express.Router();
const { createHistory, getHistory, updateStatus, sendToMaintenance } = require('../controllers/maintenanceHistoryController');
const { protect, authorize } = require('../middleware/auth');
const { testEmailConfig } = require('../services/emailService');

// Criar etapa no histórico
router.post('/', protect, createHistory);

// Listar histórico de uma manutenção
router.get('/:manutencaoId', protect, getHistory);

// Atualizar status de uma etapa
router.put('/:id/status', protect, authorize('Assistente', 'Gerente'), updateStatus);

// Enviar para manutenção
router.post('/send-maintenance', protect, authorize('Assistente', 'Gerente'), sendToMaintenance);

// Testar configuração de email
router.get('/test-email', protect, authorize('Gerente'), async (req, res) => {
  try {
    const isValid = await testEmailConfig();
    res.json({
      success: isValid,
      message: isValid ? 'Configuração de email válida' : 'Erro na configuração de email'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro ao testar email'
    });
  }
});

module.exports = router;