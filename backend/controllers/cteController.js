const { Cte, Vehicle, User } = require('../models');
const path = require('path');
const fs = require('fs');

// @desc    Listar todos os CT-e
// @route   GET /api/ctes
// @access  Private
exports.getCtes = async (req, res, next) => {
  try {
    const { status, motorista_id } = req.query;
    
    const where = {};
    if (status) where.status = status;
    if (motorista_id) where.motorista_id = motorista_id;

    // Se for motorista, mostrar apenas seus CT-e
    if (req.user.perfil === 'Motorista') {
      where.motorista_id = req.user.id;
    }

    const ctes = await Cte.findAll({
      where,
      include: [
        {
          model: Vehicle,
          as: 'veiculo',
          attributes: ['id', 'placa', 'modelo']
        },
        {
          model: User,
          as: 'motorista',
          attributes: ['id', 'nome']
        }
      ],
      order: [['data_emissao', 'DESC']]
    });

    res.status(200).json({
      success: true,
      count: ctes.length,
      data: ctes
    });

  } catch (error) {
    next(error);
  }
};

// @desc    Obter CT-e por ID
// @route   GET /api/ctes/:id
// @access  Private
exports.getCte = async (req, res, next) => {
  try {
    const cte = await Cte.findByPk(req.params.id, {
      include: [
        {
          model: Vehicle,
          as: 'veiculo'
        },
        {
          model: User,
          as: 'motorista'
        }
      ]
    });

    if (!cte) {
      return res.status(404).json({
        success: false,
        message: 'CT-e não encontrado'
      });
    }

    res.status(200).json({
      success: true,
      data: cte
    });

  } catch (error) {
    next(error);
  }
};

// @desc    Criar novo CT-e
// @route   POST /api/ctes
// @access  Private
exports.createCte = async (req, res, next) => {
  try {
    let arquivo_nome = null;
    let arquivo_path = null;

    // Se houver arquivo no upload
    if (req.file) {
      arquivo_nome = req.file.originalname;
      arquivo_path = req.file.path;
    }

    const cte = await Cte.create({
      ...req.body,
      arquivo_nome,
      arquivo_path
    });

    const cteData = await Cte.findByPk(cte.id, {
      include: [
        { model: Vehicle, as: 'veiculo' },
        { model: User, as: 'motorista' }
      ]
    });

    res.status(201).json({
      success: true,
      message: 'CT-e cadastrado com sucesso',
      data: cteData
    });

  } catch (error) {
    // Se houver erro e arquivo foi enviado, remover arquivo
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    next(error);
  }
};

// @desc    Atualizar CT-e
// @route   PUT /api/ctes/:id
// @access  Private
exports.updateCte = async (req, res, next) => {
  try {
    const cte = await Cte.findByPk(req.params.id);

    if (!cte) {
      return res.status(404).json({
        success: false,
        message: 'CT-e não encontrado'
      });
    }

    // Se houver novo arquivo
    if (req.file) {
      // Remover arquivo antigo se existir
      if (cte.arquivo_path && fs.existsSync(cte.arquivo_path)) {
        fs.unlinkSync(cte.arquivo_path);
      }
      
      req.body.arquivo_nome = req.file.originalname;
      req.body.arquivo_path = req.file.path;
    }

    await cte.update(req.body);

    const cteData = await Cte.findByPk(cte.id, {
      include: [
        { model: Vehicle, as: 'veiculo' },
        { model: User, as: 'motorista' }
      ]
    });

    res.status(200).json({
      success: true,
      message: 'CT-e atualizado com sucesso',
      data: cteData
    });

  } catch (error) {
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    next(error);
  }
};

// @desc    Download do arquivo CT-e
// @route   GET /api/ctes/:id/download
// @access  Private
exports.downloadCte = async (req, res, next) => {
  try {
    const cte = await Cte.findByPk(req.params.id);

    if (!cte) {
      return res.status(404).json({
        success: false,
        message: 'CT-e não encontrado'
      });
    }

    if (!cte.arquivo_path || !fs.existsSync(cte.arquivo_path)) {
      return res.status(404).json({
        success: false,
        message: 'Arquivo não encontrado'
      });
    }

    res.download(cte.arquivo_path, cte.arquivo_nome);

  } catch (error) {
    next(error);
  }
};

// @desc    Deletar CT-e
// @route   DELETE /api/ctes/:id
// @access  Private (Gerente)
exports.deleteCte = async (req, res, next) => {
  try {
    const cte = await Cte.findByPk(req.params.id);

    if (!cte) {
      return res.status(404).json({
        success: false,
        message: 'CT-e não encontrado'
      });
    }

    // Remover arquivo se existir
    if (cte.arquivo_path && fs.existsSync(cte.arquivo_path)) {
      fs.unlinkSync(cte.arquivo_path);
    }

    await cte.destroy();

    res.status(200).json({
      success: true,
      message: 'CT-e removido com sucesso'
    });

  } catch (error) {
    next(error);
  }
};
