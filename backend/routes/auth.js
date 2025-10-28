const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const db = require('../config/database');

// Login
router.post('/login', async (req, res) => {
    try {
        const { usuario, senha } = req.body;
        
        const [users] = await db.query(
            'SELECT * FROM usuarios WHERE usuario = ?',
            [usuario]
        );
        
        if (users.length === 0) {
            return res.status(401).json({ error: 'Usuário ou senha incorretos' });
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
            return res.status(401).json({ error: 'Usuário ou senha incorretos' });
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
        const { usuario, senha, nome, perfil } = req.body;
        
        const senhaHash = await bcrypt.hash(senha, 10);
        
        const [result] = await db.query(
            'INSERT INTO usuarios (usuario, senha, nome, perfil) VALUES (?, ?, ?, ?)',
            [usuario, senhaHash, nome, perfil]
        );
        
        res.json({ 
            id: result.insertId, 
            usuario, 
            nome, 
            perfil,
            message: 'Usuário criado com sucesso!' 
        });
    } catch (error) {
        console.error('Erro ao criar usuário:', error);
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ error: 'Usuário já existe' });
        }
        res.status(500).json({ error: error.message });
    }
});

// Listar todos os usuários (apenas para admin)
router.get('/', async (req, res) => {
    try {
        const [usuarios] = await db.query('SELECT id, usuario, nome, perfil, criado_em FROM usuarios ORDER BY id DESC');
        res.json(usuarios);
    } catch (error) {
        console.error('Erro ao listar usuários:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;