const { Cte, Vehicle, User } = require('../models');
const { createMensagem } = require('./mensagemController');

exports.getCtes = async (req, res, next) => {
  try {
    const whereClause = req.user.perfil === 'Motorista' ? { motorista_id: req.user.id } : {};
    
    const ctes = await Cte.findAll({
      where: whereClause,
      order: [['createdAt', 'DESC']]
    });
    res.status(200).json({ success: true, count: ctes.length, data: ctes });
  } catch (error) {
    next(error);
  }
};

exports.getCte = async (req, res, next) => {
  try {
    const whereClause = req.user.perfil === 'Motorista' ? { id: req.params.id, motorista_id: req.user.id } : { id: req.params.id };
    
    const cte = await Cte.findOne({
      where: whereClause,
      include: [
        { model: Vehicle, as: 'veiculo' },
        { model: User, as: 'motorista' }
      ]
    });
    if (!cte) {
      return res.status(404).json({ success: false, message: 'CT-e não encontrado' });
    }
    res.status(200).json({ success: true, data: cte });
  } catch (error) {
    next(error);
  }
};

exports.createCte = async (req, res, next) => {
  try {
    const cte = await Cte.create({
      numero: req.body.numero,
      data_emissao: req.body.data_emissao || new Date(),
      arquivo_nome: req.file?.originalname || null,
      arquivo_path: req.file?.path || null,
      motorista_id: req.user.id
    });
    
    // Enviar mensagem para Gerentes e Assistentes
    const usuarios = await User.findAll({
      where: { perfil: ['Gerente', 'Assistente'], ativo: true },
      attributes: ['id']
    });
    
    if (usuarios.length > 0) {
      await createMensagem(
        'Novo CT-e Anexado',
        `CT-e ${cte.numero} foi anexado ao sistema por ${req.user.nome}.`,
        'cte',
        usuarios.map(u => u.id)
      );
    }
    
    res.status(201).json({ 
      success: true, 
      message: 'CT-e cadastrado', 
      data: cte 
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

exports.updateCte = async (req, res, next) => {
  try {
    const cte = await Cte.findByPk(req.params.id, {
      include: [{ model: User, as: 'motorista' }]
    });
    if (!cte) {
      return res.status(404).json({ success: false, message: 'CT-e não encontrado' });
    }
    if (req.file) {
      req.body.arquivo_nome = req.file.originalname;
      req.body.arquivo_path = req.file.path;
    }
    
    // Se status mudou para Concluído, enviar mensagem para o motorista
    if (req.body.status === 'Concluído' && cte.status !== 'Concluído') {
      await createMensagem(
        'CT-e Baixado',
        `O CT-e ${cte.numero} foi marcado como baixado/concluído.`,
        'cte_baixado',
        [cte.motorista_id]
      );
    }
    
    await cte.update(req.body);
    res.status(200).json({ success: true, message: 'CT-e atualizado', data: cte });
  } catch (error) {
    next(error);
  }
};

exports.downloadCte = async (req, res, next) => {
  try {
    const cte = await Cte.findByPk(req.params.id);
    if (!cte || !cte.arquivo_path) {
      return res.status(404).json({ success: false, message: 'Arquivo não encontrado' });
    }
    const path = require('path');
    const fs = require('fs');
    const filePath = path.resolve(cte.arquivo_path);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ success: false, message: 'Arquivo não encontrado no servidor' });
    }
    res.download(filePath, cte.arquivo_nome);
  } catch (error) {
    next(error);
  }
};

exports.deleteCte = async (req, res, next) => {
  try {
    const cte = await Cte.findByPk(req.params.id);
    if (!cte) {
      return res.status(404).json({ success: false, message: 'CT-e não encontrado' });
    }
    await cte.destroy();
    res.status(200).json({ success: true, message: 'CT-e removido' });
  } catch (error) {
    next(error);
  }
};
