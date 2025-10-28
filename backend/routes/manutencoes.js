const express = require('express');
const router = express.Router();
const db = require('../config/database');

// Listar todas as manutenções com dados do veículo
router.get('/', async (req, res) => {
    try {
        const [manutencoes] = await db.query(`
            SELECT m.*, v.numero_frota, v.modelo, v.tipo as veiculo_tipo
            FROM manutencoes m
            JOIN veiculos v ON m.veiculo_id = v.id
            ORDER BY m.data DESC, m.id DESC
        `);
        res.json(manutencoes);
    } catch (error) {
        console.error('Erro ao listar manutenções:', error);
        res.status(500).json({ error: error.message });
    }
});

// Estatísticas de manutenções por tipo
router.get('/stats/tipos', async (req, res) => {
    try {
        const [stats] = await db.query(`
            SELECT 
                tipo,
                COUNT(*) as quantidade
            FROM manutencoes
            GROUP BY tipo
        `);
        
        res.json(stats);
    } catch (error) {
        console.error('Erro ao buscar estatísticas por tipo:', error);
        res.status(500).json({ error: error.message });
    }
});

// Estatísticas dashboard
router.get('/stats/dashboard', async (req, res) => {
    try {
        const [stats] = await db.query(`
            SELECT 
                COUNT(*) as total,
                SUM(CASE WHEN status = 'Pendente' THEN 1 ELSE 0 END) as pendentes,
                SUM(CASE WHEN status = 'Concluída' THEN 1 ELSE 0 END) as concluidas,
                SUM(CASE WHEN gravidade = 'Crítica' THEN 1 ELSE 0 END) as criticas,
                SUM(CASE WHEN gravidade = 'Alta' THEN 1 ELSE 0 END) as altas
            FROM manutencoes
        `);
        
        res.json(stats[0]);
    } catch (error) {
        console.error('Erro ao buscar estatísticas:', error);
        res.status(500).json({ error: error.message });
    }
});

// Criar nova manutenção
router.post('/', async (req, res) => {
    try {
        const { veiculo_id, data, tipo, km, descricao, gravidade, status } = req.body;
        
        if (!veiculo_id || !data || !tipo || !km || !descricao || !gravidade) {
            return res.status(400).json({ error: 'Todos os campos são obrigatórios' });
        }
        
        const [veiculos] = await db.query('SELECT id FROM veiculos WHERE id = ?', [veiculo_id]);
        if (veiculos.length === 0) {
            return res.status(404).json({ error: 'Veículo não encontrado' });
        }
        
        const [result] = await db.query(
            'INSERT INTO manutencoes (veiculo_id, data, tipo, km, descricao, gravidade, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [veiculo_id, data, tipo, km, descricao, gravidade, status || 'Pendente']
        );
        
        res.status(201).json({ 
            id: result.insertId, 
            veiculo_id, 
            data, 
            tipo, 
            km, 
            descricao, 
            gravidade, 
            status: status || 'Pendente',
            message: 'Manutenção registrada com sucesso!' 
        });
    } catch (error) {
        console.error('Erro ao criar manutenção:', error);
        res.status(500).json({ error: error.message });
    }
});

// Atualizar status da manutenção
router.patch('/:id/status', async (req, res) => {
    try {
        const { status } = req.body;
        
        if (!status || !['Pendente', 'Concluída'].includes(status)) {
            return res.status(400).json({ error: 'Status inválido. Use: Pendente ou Concluída' });
        }
        
        const [result] = await db.query(
            'UPDATE manutencoes SET status=? WHERE id=?',
            [status, req.params.id]
        );
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Manutenção não encontrada' });
        }
        
        res.json({ 
            id: parseInt(req.params.id), 
            status,
            message: `Status alterado para ${status}` 
        });
    } catch (error) {
        console.error('Erro ao atualizar status:', error);
        res.status(500).json({ error: error.message });
    }
});

// Deletar manutenção
router.delete('/:id', async (req, res) => {
    try {
        const [result] = await db.query('DELETE FROM manutencoes WHERE id=?', [req.params.id]);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Manutenção não encontrada' });
        }
        
        res.json({ message: 'Manutenção deletada com sucesso' });
    } catch (error) {
        console.error('Erro ao deletar manutenção:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;