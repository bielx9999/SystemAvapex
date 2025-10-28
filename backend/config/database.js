const mysql = require('mysql2');

const connection = mysql.createConnection({
    host: 'localhost:3306',
    user: 'root',        // Seu usuário MySQL
    password: 'Biel2004??',        // Sua senha MySQL
    database: 'sistema_logistica'
});

connection.connect((err) => {
    if (err) {
        console.error('Erro ao conectar ao MySQL:', err);
        return;
    }
    console.log('✅ Conectado ao MySQL!');
});

module.exports = connection.promise();