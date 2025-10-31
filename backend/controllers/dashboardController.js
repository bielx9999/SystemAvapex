const { User, Vehicle, Maintenance, Cte } = require('../models');
const { Op } = require('sequelize');

exports.getStats = async (req, res, next) => {
  try {
    const totalVeiculos = await Vehicle.count({ where: { ativo: true } });
    const veiculosDisponiveis = await Vehicle.count({ where: { status: 'Disponível', ativo: true } });
    const totalFuncionarios = await User.count({ where: { perfil: { [Op.in]: ['Motorista', 'Assistente', 'Gerente'] }, ativo: true } });
    const manutencoesUrgentes = await Maintenance.count({
      where: {
        status: { [Op.in]: ['Pendente', 'Em Andamento'] },
        gravidade: { [Op.in]: ['Alta', 'Crítica'] }
      }
    });
    const dataInicio = new Date();
    dataInicio.setDate(1);
    const cteMesAtual = await Cte.count({
      where: { data_emissao: { [Op.gte]: dataInicio } }
    });
    const cteEmTransito = await Cte.count({ where: { status: 'Em Trânsito' } });
    res.status(200).json({
      success: true,
      data: {
        veiculos: { total: totalVeiculos, disponiveis: veiculosDisponiveis },
        funcionarios: { total: totalFuncionarios },
        manutencoes: { urgentes: manutencoesUrgentes },
        ctes: { mes_atual: cteMesAtual, em_transito: cteEmTransito }
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.getUrgentMaintenances = async (req, res, next) => {
  try {
    const maintenances = await Maintenance.findAll({
      where: {
        status: { [Op.in]: ['Pendente', 'Em Andamento'] },
        gravidade: { [Op.in]: ['Alta', 'Crítica'] }
      },
      include: [{ model: Vehicle, as: 'veiculo', attributes: ['placa', 'modelo'] }],
      order: [['gravidade', 'DESC'], ['data_programada', 'ASC']],
      limit: 10
    });
    res.status(200).json({ success: true, data: maintenances });
  } catch (error) {
    next(error);
  }
};

exports.getRecentActivities = async (req, res, next) => {
  try {
    const activities = [];
    res.status(200).json({ success: true, data: activities });
  } catch (error) {
    next(error);
  }
};

exports.getMaintenancesChart = async (req, res, next) => {
  try {
    const chart = {
      preventiva: await Maintenance.count({ where: { tipo: 'Preventiva' } }),
      corretiva: await Maintenance.count({ where: { tipo: 'Corretiva' } }),
      preditiva: await Maintenance.count({ where: { tipo: 'Preditiva' } })
    };
    res.status(200).json({ success: true, data: chart });
  } catch (error) {
    next(error);
  }
};
