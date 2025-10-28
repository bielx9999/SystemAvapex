const express = require('express');
const router = express.Router();
const db = require('../config/database');

// Listar todos os veículos
router.get('/', async (req, res) => {
    try {
        const [veiculos] = await db.query('SELECT * FROM veiculos ORDER BY numero_frota ASC');
        res.json(veiculos);
    } catch (error) {
        console.error('Erro ao listar veículos:', error);
        res.status(500).json({ error: error.message });
    }
});

// Criar novo veículo
router.post('/', async (req, res) => {
    try {
        const { tipo, numero_frota, modelo, ano, km } = req.body;
        
        if (!tipo || !numero_frota || !modelo || !ano || km === undefined) {
            return res.status(400).json({ error: 'Todos os campos são obrigatórios' });
        }
        
        const [result] = await db.query(
            'INSERT INTO veiculos (tipo, numero_frota, modelo, ano, km) VALUES (?, ?, ?, ?, ?)',
            [tipo, numero_frota.toUpperCase(), modelo, ano, km]
        );
        
        res.status(201).json({ 
            id: result.insertId, 
            tipo, 
            numero_frota: numero_frota.toUpperCase(), 
            modelo, 
            ano, 
            km,
            message: 'Veículo cadastrado com sucesso!' 
        });
    } catch (error) {
        console.error('Erro ao criar veículo:', error);
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ error: 'Número de frota já cadastrado' });
        }
        res.status(500).json({ error: error.message });
    }
});

// Atualizar veículo
router.put('/:id', async (req, res) => {
    try {
        const { tipo, numero_frota, modelo, ano, km } = req.body;
        
        const [result] = await db.query(
            'UPDATE veiculos SET tipo=?, numero_frota=?, modelo=?, ano=?, km=? WHERE id=?',
            [tipo, numero_frota.toUpperCase(), modelo, ano, km, req.params.id]
        );
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Veículo não encontrado' });
        }
        
        res.json({ 
            id: parseInt(req.params.id), 
            tipo, 
            numero_frota: numero_frota.toUpperCase(), 
            modelo, 
            ano, 
            km,
            message: 'Veículo atualizado com sucesso!' 
        });
    } catch (error) {
        console.error('Erro ao atualizar veículo:', error);
        res.status(500).json({ error: error.message });
    }
});

// Deletar veículo
router.delete('/:id', async (req, res) => {
    try {
        const [result] = await db.query('DELETE FROM veiculos WHERE id=?', [req.params.id]);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Veículo não encontrado' });
        }
        
        res.json({ message: 'Veículo deletado com sucesso' });
    } catch (error) {
        console.error('Erro ao deletar veículo:', error);
        if (error.code === 'ER_ROW_IS_REFERENCED_2') {
            return res.status(400).json({ error: 'Não é possível deletar. Veículo possui registros vinculados.' });
        }
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;