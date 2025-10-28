const express = require('express');
const router = express.Router();
const db = require('../config/database');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Criar pasta uploads se não existir
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configurar o multer para upload de arquivos
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, 'cte-' + uniqueSuffix + ext);
    }
});

const upload = multer({ 
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024 // Limite de 10MB
    },
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Apenas arquivos PDF, JPEG e PNG são permitidos!'), false);
        }
    }
});

// Listar todos os CT-e com dados relacionados
router.get('/', async (req, res) => {
    try {
        const [ctes] = await db.query(`
            SELECT 
                c.*,
                m.nome as motorista_nome,
                m.cnh as motorista_cnh,
                v.placa,
                v.modelo,
                v.tipo as veiculo_tipo
            FROM ctes c
            JOIN motoristas m ON c.motorista_id = m.id
            JOIN veiculos v ON c.veiculo_id = v.id
            ORDER BY c.id DESC
        `);
        res.json(ctes);
    } catch (error) {
        console.error('Erro ao listar CT-e:', error);
        res.status(500).json({ error: error.message });
    }
});

// Buscar CT-e por ID
router.get('/:id', async (req, res) => {
    try {
        const [ctes] = await db.query(`
            SELECT 
                c.*,
                m.nome as motorista_nome,
                v.placa,
                v.modelo
            FROM ctes c
            JOIN motoristas m ON c.motorista_id = m.id
            JOIN veiculos v ON c.veiculo_id = v.id
            WHERE c.id = ?
        `, [req.params.id]);
        
        if (ctes.length === 0) {
            return res.status(404).json({ error: 'CT-e não encontrado' });
        }
        res.json(ctes[0]);
    } catch (error) {
        console.error('Erro ao buscar CT-e:', error);
        res.status(500).json({ error: error.message });
    }
});

// Buscar CT-e por motorista
router.get('/motorista/:motoristaId', async (req, res) => {
    try {
        const [ctes] = await db.query(`
            SELECT c.*, v.placa, v.modelo 
            FROM ctes c
            JOIN veiculos v ON c.veiculo_id = v.id
            WHERE c.motorista_id = ?
            ORDER BY c.data DESC
        `, [req.params.motoristaId]);
        
        res.json(ctes);
    } catch (error) {
        console.error('Erro ao buscar CT-e do motorista:', error);
        res.status(500).json({ error: error.message });
    }
});

// Download de arquivo CT-e
router.get('/download/:id', async (req, res) => {
    try {
        const [ctes] = await db.query('SELECT arquivo, numero FROM ctes WHERE id = ?', [req.params.id]);
        
        if (ctes.length === 0 || !ctes[0].arquivo) {
            return res.status(404).json({ error: 'Arquivo não encontrado' });
        }
        
        const filePath = path.join(uploadsDir, ctes[0].arquivo);
        
        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ error: 'Arquivo não existe no servidor' });
        }
        
        res.download(filePath, `${ctes[0].numero}.pdf`);
    } catch (error) {
        console.error('Erro ao fazer download:', error);
        res.status(500).json({ error: error.message });
    }
});

// Criar novo CT-e com upload de arquivo
router.post('/', upload.single('arquivo'), async (req, res) => {
    try {
        const { numero, motorista_id, veiculo_id, data, origem, destino } = req.body;
        
        if (!numero || !motorista_id || !veiculo_id || !data || !origem || !destino) {
            // Se houver arquivo enviado, deletar
            if (req.file) {
                fs.unlinkSync(req.file.path);
            }
            return res.status(400).json({ error: 'Todos os campos são obrigatórios' });
        }
        
        // Verificar se motorista existe
        const [motoristas] = await db.query('SELECT id FROM motoristas WHERE id = ?', [motorista_id]);
        if (motoristas.length === 0) {
            if (req.file) fs.unlinkSync(req.file.path);
            return res.status(404).json({ error: 'Motorista não encontrado' });
        }
        
        // Verificar se veículo existe
        const [veiculos] = await db.query('SELECT id FROM veiculos WHERE id = ?', [veiculo_id]);
        if (veiculos.length === 0) {
            if (req.file) fs.unlinkSync(req.file.path);
            return res.status(404).json({ error: 'Veículo não encontrado' });
        }
        
        const arquivo = req.file ? req.file.filename : null;
        
        const [result] = await db.query(
            'INSERT INTO ctes (numero, motorista_id, veiculo_id, data, origem, destino, arquivo) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [numero, motorista_id, veiculo_id, data, origem, destino, arquivo]
        );
        
        res.status(201).json({ 
            id: result.insertId, 
            numero, 
            motorista_id, 
            veiculo_id, 
            data, 
            origem, 
            destino, 
            arquivo,
            message: 'CT-e cadastrado com sucesso!' 
        });
    } catch (error) {
        // Se houver erro, deletar o arquivo enviado
        if (req.file) {
            fs.unlinkSync(req.file.path);
        }
        console.error('Erro ao criar CT-e:', error);
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ error: 'Número de CT-e já cadastrado' });
        }
        res.status(500).json({ error: error.message });
    }
});

// Atualizar CT-e
router.put('/:id', async (req, res) => {
    try {
        const { numero, motorista_id, veiculo_id, data, origem, destino } = req.body;
        
        const [result] = await db.query(
            'UPDATE ctes SET numero=?, motorista_id=?, veiculo_id=?, data=?, origem=?, destino=? WHERE id=?',
            [numero, motorista_id, veiculo_id, data, origem, destino, req.params.id]
        );
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'CT-e não encontrado' });
        }
        
        res.json({ 
            id: parseInt(req.params.id), 
            numero, 
            motorista_id, 
            veiculo_id, 
            data, 
            origem, 
            destino,
            message: 'CT-e atualizado com sucesso!' 
        });
    } catch (error) {
        console.error('Erro ao atualizar CT-e:', error);
        res.status(500).json({ error: error.message });
    }
});

// Deletar CT-e e arquivo
router.delete('/:id', async (req, res) => {
    try {
        // Buscar o arquivo antes de deletar
        const [ctes] = await db.query('SELECT arquivo FROM ctes WHERE id=?', [req.params.id]);
        
        if (ctes.length === 0) {
            return res.status(404).json({ error: 'CT-e não encontrado' });
        }
        
        // Deletar arquivo físico se existir
        if (ctes[0].arquivo) {
            const filePath = path.join(uploadsDir, ctes[0].arquivo);
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        }
        
        // Deletar registro do banco
        await db.query('DELETE FROM ctes WHERE id=?', [req.params.id]);
        
        res.json({ message: 'CT-e deletado com sucesso' });
    } catch (error) {
        console.error('Erro ao deletar CT-e:', error);
        res.status(500).json({ error: error.message });
    }
});

// Estatísticas de CT-e
router.get('/stats/dashboard', async (req, res) => {
    try {
        const [stats] = await db.query(`
            SELECT 
                COUNT(*) as total,
                COUNT(DISTINCT motorista_id) as motoristas_ativos,
                COUNT(DISTINCT veiculo_id) as veiculos_utilizados
            FROM ctes
        `);
        
        res.json(stats[0]);
    } catch (error) {
        console.error('Erro ao buscar estatísticas:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;