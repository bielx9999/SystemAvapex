const { User } = require('../models');

exports.getUsers = async (req, res, next) => {
  try {
    const users = await User.findAll({
      where: { ativo: true },
      order: [['nome', 'ASC']]
    });
    res.status(200).json({ success: true, count: users.length, data: users });
  } catch (error) {
    next(error);
  }
};

exports.getUser = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Usuário não encontrado' });
    }
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

exports.updateUser = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Usuário não encontrado' });
    }
    delete req.body.senha;
    await user.update(req.body);
    res.status(200).json({ success: true, message: 'Usuário atualizado', data: user });
  } catch (error) {
    next(error);
  }
};

exports.deleteUser = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Usuário não encontrado' });
    }
    await user.update({ ativo: false });
    res.status(200).json({ success: true, message: 'Usuário desativado' });
  } catch (error) {
    next(error);
  }
};
