const express = require('express');
const router = express.Router();
const db = require('../config/database');

// Listar todos os motoristas
router.get('/', async (req, res) => {
    try {
        const [motoristas] = await db.query('SELECT * FROM motoristas ORDER BY id DESC');
        res.json(motoristas);
    } catch (error) {
        console.error('Erro ao listar motoristas:', error);
        res.status(500).json({ error: error.message });
    }
});

// Buscar motorista por ID
router.get('/:id', async (req, res) => {
    try {
        const [motoristas] = await db.query('SELECT * FROM motoristas WHERE id = ?', [req.params.id]);
        if (motoristas.length === 0) {
            return res.status(404).json({ error: 'Motorista não encontrado' });
        }
        res.json(motoristas[0]);
    } catch (error) {
        console.error('Erro ao buscar motorista:', error);
        res.status(500).json({ error: error.message });
    }
});

// Criar novo motorista
router.post('/', async (req, res) => {
    try {
        const { nome, cnh, telefone } = req.body;
        
        if (!nome || !cnh || !telefone) {
            return res.status(400).json({ error: 'Todos os campos são obrigatórios' });
        }
        
        const [result] = await db.query(
            'INSERT INTO motoristas (nome, cnh, telefone) VALUES (?, ?, ?)',
            [nome, cnh, telefone]
        );
        
        res.status(201).json({ 
            id: result.insertId, 
            nome, 
            cnh, 
            telefone,
            message: 'Motorista cadastrado com sucesso!' 
        });
    } catch (error) {
        console.error('Erro ao criar motorista:', error);
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ error: 'CNH já cadastrada' });
        }
        res.status(500).json({ error: error.message });
    }
});

// Atualizar motorista
router.put('/:id', async (req, res) => {
    try {
        const { nome, cnh, telefone } = req.body;
        
        const [result] = await db.query(
            'UPDATE motoristas SET nome=?, cnh=?, telefone=? WHERE id=?',
            [nome, cnh, telefone, req.params.id]
        );
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Motorista não encontrado' });
        }
        
        res.json({ 
            id: parseInt(req.params.id), 
            nome, 
            cnh, 
            telefone,
            message: 'Motorista atualizado com sucesso!' 
        });
    } catch (error) {
        console.error('Erro ao atualizar motorista:', error);
        res.status(500).json({ error: error.message });
    }
});

// Deletar motorista
router.delete('/:id', async (req, res) => {
    try {
        const [result] = await db.query('DELETE FROM motoristas WHERE id=?', [req.params.id]);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Motorista não encontrado' });
        }
        
        res.json({ message: 'Motorista deletado com sucesso' });
    } catch (error) {
        console.error('Erro ao deletar motorista:', error);
        if (error.code === 'ER_ROW_IS_REFERENCED_2') {
            return res.status(400).json({ error: 'Não é possível deletar. Motorista possui registros vinculados.' });
        }
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;