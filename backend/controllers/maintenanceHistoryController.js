const { MaintenanceHistory, User, Maintenance, Vehicle } = require('../models');
const { sendMaintenanceEmail } = require('../services/emailService');

// Criar etapa no histórico
const createHistory = async (req, res) => {
  try {
    const { manutencao_id, etapa, descricao, observacoes } = req.body;
    
    const history = await MaintenanceHistory.create({
      manutencao_id,
      etapa,
      descricao,
      status: 'Pendente',
      data_inicio: new Date(),
      responsavel_id: req.user.id,
      observacoes
    });

    res.status(201).json({
      success: true,
      data: history,
      message: 'Etapa criada com sucesso'
    });
  } catch (error) {
    console.error('Erro ao criar histórico:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// Listar histórico de uma manutenção
const getHistory = async (req, res) => {
  try {
    const { manutencaoId } = req.params;
    
    const history = await MaintenanceHistory.findAll({
      where: { manutencao_id: manutencaoId },
      include: [
        { model: User, as: 'responsavel', attributes: ['nome'] }
      ],
      order: [['createdAt', 'ASC']]
    });

    res.json({
      success: true,
      data: history
    });
  } catch (error) {
    console.error('Erro ao buscar histórico:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// Atualizar status de uma etapa
const updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, observacoes } = req.body;
    
    const updateData = { status };
    if (status === 'Concluída') {
      updateData.data_conclusao = new Date();
    }
    if (observacoes) {
      updateData.observacoes = observacoes;
    }

    await MaintenanceHistory.update(updateData, {
      where: { id }
    });

    res.json({
      success: true,
      message: 'Status atualizado com sucesso'
    });
  } catch (error) {
    console.error('Erro ao atualizar status:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// Enviar para manutenção (criar etapas padrão)
const sendToMaintenance = async (req, res) => {
  try {
    const { manutencaoId, tipo_envio, contato } = req.body;
    
    // Buscar dados da manutenção e veículo
    const manutencao = await Maintenance.findByPk(manutencaoId, {
      include: [{ model: Vehicle, as: 'veiculo' }],
      attributes: ['id', 'veiculo_id', 'responsavel_id', 'tipo', 'data_programada', 'km_manutencao', 'descricao', 'gravidade', 'status', 'em_andamento', 'createdAt', 'updatedAt']
    });

    if (!manutencao) {
      return res.status(404).json({
        success: false,
        message: 'Manutenção não encontrada'
      });
    }

    // Etapas padrão do processo de manutenção
    const etapas = [
      { etapa: 'Solicitação Enviada', descricao: `Enviado via ${tipo_envio} para ${contato}` },
      { etapa: 'Orçamento Solicitado', descricao: 'Aguardando orçamento da oficina' },
      { etapa: 'Aprovação do Orçamento', descricao: 'Orçamento em análise' },
      { etapa: 'Execução da Manutenção', descricao: 'Manutenção em andamento' },
      { etapa: 'Finalização', descricao: 'Manutenção concluída' }
    ];

    // Enviar email se o tipo for Email
    if (tipo_envio === 'Email') {
      const emailDestino = contato || process.env.MAINTENANCE_EMAIL || 'manutencao@empresa.com';
      
      
      const emailResult = await sendMaintenanceEmail(manutencao, manutencao.veiculo, emailDestino);
      if (!emailResult.success) {
        return res.status(500).json({
          success: false,
          message: `Erro ao enviar email: ${emailResult.error}`
        });
      }
    }

    // Marcar manutenção como em andamento
    await Maintenance.update(
      { em_andamento: true },
      { where: { id: manutencaoId } }
    );

    // Criar primeira etapa como concluída
    await MaintenanceHistory.create({
      manutencao_id: manutencaoId,
      etapa: etapas[0].etapa,
      descricao: etapas[0].descricao,
      status: 'Concluída',
      data_inicio: new Date(),
      data_conclusao: new Date(),
      responsavel_id: req.user.id
    });

    // Criar demais etapas como pendentes
    for (let i = 1; i < etapas.length; i++) {
      await MaintenanceHistory.create({
        manutencao_id: manutencaoId,
        etapa: etapas[i].etapa,
        descricao: etapas[i].descricao,
        status: 'Pendente',
        data_inicio: new Date(),
        responsavel_id: req.user.id
      });
    }

    const message = tipo_envio === 'Email' ? 
      'Manutenção enviada por email com sucesso' : 
      `Manutenção enviada via ${tipo_envio} com sucesso`;

    res.json({
      success: true,
      message
    });
  } catch (error) {
    console.error('Erro ao enviar para manutenção:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

module.exports = {
  createHistory,
  getHistory,
  updateStatus,
  sendToMaintenance
};