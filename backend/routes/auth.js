const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const db = require('../config/database');

// Login por matrícula
router.post('/login', async (req, res) => {
    try {
        const { matricula, senha } = req.body;
        
        const [users] = await db.query(
            'SELECT * FROM usuarios WHERE matricula = ?',
            [matricula]
        );
        
        if (users.length === 0) {
            return res.status(401).json({ error: 'Matrícula ou senha incorretos' });
        }
        
        const user = users[0];
        
        // Para desenvolvimento, aceita senha sem hash se for "123"
        let senhaCorreta = false;
        if (senha === '123') {
            senhaCorreta = true;
        } else {
            senhaCorreta = await bcrypt.compare(senha, user.senha);
        }
        
        if (!senhaCorreta) {
            return res.status(401).json({ error: 'Matrícula ou senha incorretos' });
        }
        
        delete user.senha;
        res.json(user);
    } catch (error) {
        console.error('Erro no login:', error);
        res.status(500).json({ error: error.message });
    }
});

// Registrar novo usuário
router.post('/register', async (req, res) => {
    try {
        const { matricula, senha, nome, perfil } = req.body;
        
        const senhaHash = await bcrypt.hash(senha, 10);
        
        const [result] = await db.query(
            'INSERT INTO usuarios (matricula, senha, nome, perfil) VALUES (?, ?, ?, ?)',
            [matricula, senhaHash, nome, perfil]
        );
        
        res.json({ 
            id: result.insertId, 
            matricula, 
            nome, 
            perfil,
            message: 'Usuário criado com sucesso!' 
        });
    } catch (error) {
        console.error('Erro ao criar usuário:', error);
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ error: 'Matrícula já existe' });
        }
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;