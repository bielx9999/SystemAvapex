const { User, Vehicle, Maintenance, Cte } = require('../models');
const { Op } = require('sequelize');
const sequelize = require('../config/database');

// @desc    Obter estatísticas do dashboard
// @route   GET /api/dashboard/stats
// @access  Private
exports.getStats = async (req, res, next) => {
  try {
    // Total de veículos
    const totalVeiculos = await Vehicle.count({
      where: { ativo: true }
    });

    // Veículos disponíveis
    const veiculosDisponiveis = await Vehicle.count({
      where: { status: 'Disponível', ativo: true }
    });

    // Veículos em manutenção
    const veiculosManutencao = await Vehicle.count({
      where: { status: 'Em Manutenção', ativo: true }
    });

    // Total de motoristas
    const totalMotoristas = await User.count({
      where: { perfil: 'Motorista', ativo: true }
    });

    // Manutenções urgentes
    const manutencoesUrgentes = await Maintenance.count({
      where: {
        status: {
          [Op.in]: ['Pendente', 'Em Andamento']
        },
        gravidade: {
          [Op.in]: ['Alta', 'Crítica']
        }
      }
    });

    // Total de manutenções pendentes
    const manutencoesPendentes = await Maintenance.count({
      where: { status: 'Pendente' }
    });

    // CT-e do mês atual
    const dataInicio = new Date();
    dataInicio.setDate(1);
    dataInicio.setHours(0, 0, 0, 0);

    const cteMesAtual = await Cte.count({
      where: {
        data_emissao: {
          [Op.gte]: dataInicio
        }
      }
    });

    // CT-e em trânsito
    const cteEmTransito = await Cte.count({
      where: { status: 'Em Trânsito' }
    });

    res.status(200).json({
      success: true,
      data: {
        veiculos: {
          total: totalVeiculos,
          disponiveis: veiculosDisponiveis,
          em_manutencao: veiculosManutencao,
          em_rota: totalVeiculos - veiculosDisponiveis - veiculosManutencao
        },
        motoristas: {
          total: totalMotoristas
        },
        manutencoes: {
          urgentes: manutencoesUrgentes,
          pendentes: manutencoesPendentes
        },
        ctes: {
          mes_atual: cteMesAtual,
          em_transito: cteEmTransito
        }
      }
    });

  } catch (error) {
    next(error);
  }
};

// @desc    Obter manutenções urgentes
// @route   GET /api/dashboard/urgent-maintenances
// @access  Private
exports.getUrgentMaintenances = async (req, res, next) => {
  try {
    const maintenances = await Maintenance.findAll({
      where: {
        status: {
          [Op.in]: ['Pendente', 'Em Andamento']
        },
        gravidade: {
          [Op.in]: ['Alta', 'Crítica']
        }
      },
      include: [
        {
          model: Vehicle,
          as: 'veiculo',
          attributes: ['id', 'placa', 'modelo', 'tipo']
        }
      ],
      order: [
        ['gravidade', 'DESC'],
        ['data_programada', 'ASC']
      ],
      limit: 5
    });

    res.status(200).json({
      success: true,
      data: maintenances
    });

  } catch (error) {
    next(error);
  }
};

// @desc    Obter atividades recentes
// @route   GET /api/dashboard/recent-activities
// @access  Private
exports.getRecentActivities = async (req, res, next) => {
  try {
    // Últimas manutenções (últimos 7 dias)
    const dataLimite = new Date();
    dataLimite.setDate(dataLimite.getDate() - 7);

    const recentMaintenances = await Maintenance.findAll({
      where: {
        created_at: {
          [Op.gte]: dataLimite
        }
      },
      include: [
        {
          model: Vehicle,
          as: 'veiculo',
          attributes: ['placa', 'modelo']
        }
      ],
      order: [['created_at', 'DESC']],
      limit: 10
    });

    // Últimos CT-e
    const recentCtes = await Cte.findAll({
      where: {
        created_at: {
          [Op.gte]: dataLimite
        }
      },
      include: [
        {
          model: Vehicle,
          as: 'veiculo',
          attributes: ['placa']
        },
        {
          model: User,
          as: 'motorista',
          attributes: ['nome']
        }
      ],
      order: [['created_at', 'DESC']],
      limit: 10
    });

    res.status(200).json({
      success: true,
      data: {
        manutencoes: recentMaintenances,
        ctes: recentCtes
      }
    });

  } catch (error) {
    next(error);
  }
};

// @desc    Obter gráfico de manutenções por tipo
// @route   GET /api/dashboard/maintenances-chart
// @access  Private
exports.getMaintenancesChart = async (req, res, next) => {
  try {
    const chart = await Maintenance.findAll({
      attributes: [
        'tipo',
        [sequelize.fn('COUNT', sequelize.col('id')), 'total']
      ],
      group: ['tipo']
    });

    res.status(200).json({
      success: true,
      data: chart
    });

  } catch (error) {
    next(error);
  }
};