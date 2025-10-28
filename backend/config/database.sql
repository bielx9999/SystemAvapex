USE sistema_logistica;

-- Alterar tabela de usuários
ALTER TABLE usuarios 
DROP COLUMN usuario,
ADD COLUMN matricula VARCHAR(20) UNIQUE NOT NULL AFTER id,
MODIFY COLUMN perfil ENUM('Motorista', 'Assistente', 'Gerente') NOT NULL;

-- Alterar tabela de veículos
ALTER TABLE veiculos
DROP COLUMN placa,
ADD COLUMN numero_frota VARCHAR(10) UNIQUE NOT NULL AFTER tipo;

-- Limpar dados antigos e inserir novos
TRUNCATE TABLE ctes;
TRUNCATE TABLE manutencoes;
TRUNCATE TABLE usuarios;
TRUNCATE TABLE motoristas;
TRUNCATE TABLE veiculos;

-- Inserir usuários com matrícula
INSERT INTO usuarios (matricula, senha, nome, perfil) VALUES
('1001', '123', 'João Silva', 'Motorista'),
('2001', '123', 'Ana Costa', 'Assistente'),
('3001', '123', 'Carlos Oliveira', 'Gerente');

-- Inserir veículos com número de frota
INSERT INTO veiculos (tipo, numero_frota, modelo, ano, km) VALUES
('Caminhão', 'S-1', 'Volvo FH 540', 2020, 145000),
('Carreta', 'S-2', 'Randon Bitrem', 2019, 98000),
('Caminhão', 'S-3', 'Scania R450', 2021, 89000);

-- Inserir motoristas
INSERT INTO motoristas (nome, cnh, telefone) VALUES
('João Silva', '12345678901', '31 99999-0001'),
('Maria Santos', '98765432109', '31 99999-0002'),
('Pedro Costa', '11122233344', '31 99999-0003');
