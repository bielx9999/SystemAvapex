const express = require('express');
const cors = require('cors');
const path = require('path');
const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Rotas
app.use('/api/auth', require('./routes/auth'));
app.use('/api/veiculos', require('./routes/veiculos'));
app.use('/api/motoristas', require('./routes/motoristas'));
app.use('/api/manutencoes', require('./routes/manutencoes'));
app.use('/api/ctes', require('./routes/ctes'));

// Rota de teste
app.get('/', (req, res) => {
    res.json({ message: 'API Sistema de Logística funcionando!' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando na porta ${PORT}`);
});