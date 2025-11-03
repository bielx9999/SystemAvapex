const { Mensagem } = require('../models');

exports.getMensagens = async (req, res, next) => {
  try {
    const mensagens = await Mensagem.findAll({
      where: { usuario_id: req.user.id },
      order: [['createdAt', 'DESC']]
    });
    res.status(200).json({ success: true, data: mensagens });
  } catch (error) {
    next(error);
  }
};

exports.markAsRead = async (req, res, next) => {
  try {
    const mensagem = await Mensagem.findOne({
      where: { id: req.params.id, usuario_id: req.user.id }
    });
    
    if (!mensagem) {
      return res.status(404).json({ success: false, message: 'Mensagem não encontrada' });
    }
    
    await mensagem.update({ lida: true });
    res.status(200).json({ success: true, message: 'Mensagem marcada como lida' });
  } catch (error) {
    next(error);
  }
};

exports.createMensagem = async (titulo, mensagem, tipo, usuarios) => {
  try {
    const mensagens = usuarios.map(userId => ({
      usuario_id: userId,
      titulo,
      mensagem,
      tipo
    }));
    
    await Mensagem.bulkCreate(mensagens);
  } catch (error) {
    console.error('Erro ao criar mensagens:', error);
  }
};