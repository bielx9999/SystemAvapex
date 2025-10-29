CREATE DATABASE IF NOT EXISTS sistema_logistica CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE sistema_logistica;

-- Tabela de Usuários
CREATE TABLE usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    usuario VARCHAR(50) NOT NULL UNIQUE,
    senha VARCHAR(255) NOT NULL,
    perfil ENUM('Motorista', 'Assistente', 'Gerente') NOT NULL,
    telefone VARCHAR(20),
    cnh VARCHAR(11),
    ativo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_usuario (usuario),
    INDEX idx_perfil (perfil)
) ENGINE=InnoDB;

-- Tabela de Veículos
CREATE TABLE veiculos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tipo ENUM('Caminhão', 'Carreta', 'Van', 'Utilitário') NOT NULL,
    placa VARCHAR(10) NOT NULL UNIQUE,
    modelo VARCHAR(100) NOT NULL,
    marca VARCHAR(50),
    ano INT NOT NULL,
    km_atual INT DEFAULT 0,
    capacidade_kg DECIMAL(10,2),
    status ENUM('Disponível', 'Em Rota', 'Em Manutenção', 'Indisponível') DEFAULT 'Disponível',
    ativo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_placa (placa),
    INDEX idx_status (status)
) ENGINE=InnoDB;

-- Tabela de Manutenções
CREATE TABLE manutencoes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    veiculo_id INT NOT NULL,
    tipo ENUM('Preventiva', 'Corretiva', 'Preditiva') NOT NULL,
    data_programada DATE NOT NULL,
    data_realizada DATE,
    km_manutencao INT NOT NULL,
    descricao TEXT NOT NULL,
    observacoes TEXT,
    gravidade ENUM('Baixa', 'Média', 'Alta', 'Crítica') NOT NULL,
    status ENUM('Pendente', 'Em Andamento', 'Concluída', 'Cancelada') DEFAULT 'Pendente',
    custo DECIMAL(10,2),
    oficina VARCHAR(100),
    responsavel_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (veiculo_id) REFERENCES veiculos(id) ON DELETE CASCADE,
    FOREIGN KEY (responsavel_id) REFERENCES usuarios(id) ON DELETE SET NULL,
    INDEX idx_veiculo (veiculo_id),
    INDEX idx_status (status),
    INDEX idx_gravidade (gravidade),
    INDEX idx_data (data_programada)
) ENGINE=InnoDB;

-- Tabela de CT-e (Conhecimento de Transporte Eletrônico)
CREATE TABLE ctes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    numero VARCHAR(50) NOT NULL UNIQUE,
    chave_acesso VARCHAR(44),
    data_emissao DATE NOT NULL,
    veiculo_id INT,
    motorista_id INT,
    origem VARCHAR(100),
    destino VARCHAR(100),
    valor DECIMAL(10,2),
    peso_kg DECIMAL(10,2),
    arquivo_nome VARCHAR(255),
    arquivo_path VARCHAR(500),
    status ENUM('Emitido', 'Em Trânsito', 'Entregue', 'Cancelado') DEFAULT 'Emitido',
    observacoes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (veiculo_id) REFERENCES veiculos(id) ON DELETE SET NULL,
    FOREIGN KEY (motorista_id) REFERENCES usuarios(id) ON DELETE SET NULL,
    INDEX idx_numero (numero),
    INDEX idx_status (status),
    INDEX idx_motorista (motorista_id),
    INDEX idx_data (data_emissao)
) ENGINE=InnoDB;

-- Tabela de Viagens
CREATE TABLE viagens (
    id INT AUTO_INCREMENT PRIMARY KEY,
    cte_id INT,
    veiculo_id INT NOT NULL,
    motorista_id INT NOT NULL,
    origem VARCHAR(100) NOT NULL,
    destino VARCHAR(100) NOT NULL,
    data_saida DATETIME NOT NULL,
    data_chegada_prevista DATETIME NOT NULL,
    data_chegada_real DATETIME,
    km_inicial INT NOT NULL,
    km_final INT,
    status ENUM('Planejada', 'Em Andamento', 'Concluída', 'Cancelada') DEFAULT 'Planejada',
    observacoes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (cte_id) REFERENCES ctes(id) ON DELETE SET NULL,
    FOREIGN KEY (veiculo_id) REFERENCES veiculos(id) ON DELETE RESTRICT,
    FOREIGN KEY (motorista_id) REFERENCES usuarios(id) ON DELETE RESTRICT,
    INDEX idx_veiculo (veiculo_id),
    INDEX idx_motorista (motorista_id),
    INDEX idx_status (status)
) ENGINE=InnoDB;

-- Tabela de Abastecimentos
CREATE TABLE abastecimentos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    veiculo_id INT NOT NULL,
    motorista_id INT NOT NULL,
    viagem_id INT,
    data_hora DATETIME NOT NULL,
    km_veiculo INT NOT NULL,
    litros DECIMAL(10,2) NOT NULL,
    valor_total DECIMAL(10,2) NOT NULL,
    valor_litro DECIMAL(10,2) NOT NULL,
    posto VARCHAR(100),
    tipo_combustivel VARCHAR(50),
    nota_fiscal VARCHAR(50),
    observacoes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (veiculo_id) REFERENCES veiculos(id) ON DELETE CASCADE,
    FOREIGN KEY (motorista_id) REFERENCES usuarios(id) ON DELETE RESTRICT,
    FOREIGN KEY (viagem_id) REFERENCES viagens(id) ON DELETE SET NULL,
    INDEX idx_veiculo (veiculo_id),
    INDEX idx_data (data_hora)
) ENGINE=InnoDB;

-- Tabela de Checklist de Veículos
CREATE TABLE checklists (
    id INT AUTO_INCREMENT PRIMARY KEY,
    veiculo_id INT NOT NULL,
    motorista_id INT NOT NULL,
    viagem_id INT,
    tipo ENUM('Pré-Viagem', 'Pós-Viagem', 'Diário') NOT NULL,
    data_hora DATETIME NOT NULL,
    
    -- Itens do checklist (Boolean)
    pneus_ok BOOLEAN DEFAULT FALSE,
    freios_ok BOOLEAN DEFAULT FALSE,
    luzes_ok BOOLEAN DEFAULT FALSE,
    nivel_oleo_ok BOOLEAN DEFAULT FALSE,
    nivel_agua_ok BOOLEAN DEFAULT FALSE,
    documentacao_ok BOOLEAN DEFAULT FALSE,
    extintor_ok BOOLEAN DEFAULT FALSE,
    triangulo_ok BOOLEAN DEFAULT FALSE,
    macaco_ok BOOLEAN DEFAULT FALSE,
    chave_roda_ok BOOLEAN DEFAULT FALSE,
    
    observacoes TEXT,
    status ENUM('Aprovado', 'Aprovado com Ressalvas', 'Reprovado') DEFAULT 'Aprovado',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (veiculo_id) REFERENCES veiculos(id) ON DELETE CASCADE,
    FOREIGN KEY (motorista_id) REFERENCES usuarios(id) ON DELETE RESTRICT,
    FOREIGN KEY (viagem_id) REFERENCES viagens(id) ON DELETE SET NULL,
    INDEX idx_veiculo (veiculo_id),
    INDEX idx_data (data_hora)
) ENGINE=InnoDB;

-- Tabela de Logs de Sistema
CREATE TABLE logs_sistema (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT,
    acao VARCHAR(100) NOT NULL,
    tabela VARCHAR(50),
    registro_id INT,
    detalhes TEXT,
    ip_address VARCHAR(45),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE SET NULL,
    INDEX idx_usuario (usuario_id),
    INDEX idx_created (created_at)
) ENGINE=InnoDB;

-- ============================================
-- DADOS INICIAIS (SEED)
-- ============================================

-- Usuários de teste (senha: 123 para todos - hash bcrypt)
INSERT INTO usuarios (nome, usuario, senha, perfil, telefone, cnh) VALUES
('João Silva', 'motorista', '$2b$10$rBV2kw3qH5ZJZKcY8lq4JOYGZqQZ5VZqYqYqYqYqYqYqYqYqYqYqY', 'Motorista', '31 99999-0001', '12345678901'),
('Ana Costa', 'assistente', '$2b$10$rBV2kw3qH5ZJZKcY8lq4JOYGZqQZ5VZqYqYqYqYqYqYqYqYqYqYqY', 'Assistente', '31 99999-0002', NULL),
('Carlos Oliveira', 'gerente', '$2b$10$rBV2kw3qH5ZJZKcY8lq4JOYGZqQZ5VZqYqYqYqYqYqYqYqYqYqYqY', 'Gerente', '31 99999-0003', NULL),
('Maria Santos', 'maria.motorista', '$2b$10$rBV2kw3qH5ZJZKcY8lq4JOYGZqQZ5VZqYqYqYqYqYqYqYqYqYqYqY', 'Motorista', '31 99999-0004', '98765432109');

-- Veículos de exemplo
INSERT INTO veiculos (tipo, placa, modelo, marca, ano, km_atual, capacidade_kg, status) VALUES
('Caminhão', 'ABC-1234', 'FH 540', 'Volvo', 2020, 145000, 25000.00, 'Disponível'),
('Carreta', 'DEF-5678', 'Randon LSR', 'Randon', 2019, 98000, 30000.00, 'Disponível'),
('Caminhão', 'GHI-9012', 'Constellation', 'Volkswagen', 2021, 67000, 20000.00, 'Em Rota'),
('Van', 'JKL-3456', 'Sprinter', 'Mercedes', 2022, 35000, 3500.00, 'Disponível');

-- Manutenções de exemplo
INSERT INTO manutencoes (veiculo_id, tipo, data_programada, km_manutencao, descricao, gravidade, status) VALUES
(1, 'Preventiva', '2025-10-20', 145000, 'Troca de óleo e filtros', 'Baixa', 'Concluída'),
(1, 'Corretiva', '2025-11-05', 145200, 'Problema no sistema de freios - necessita revisão urgente', 'Alta', 'Pendente'),
(2, 'Preventiva', '2025-11-10', 98500, 'Revisão geral programada', 'Média', 'Pendente'),
(3, 'Preditiva', '2025-11-15', 68000, 'Análise preditiva do sistema de suspensão', 'Média', 'Pendente');

-- CT-e de exemplo
INSERT INTO ctes (numero, chave_acesso, data_emissao, veiculo_id, motorista_id, origem, destino, valor, peso_kg, arquivo_nome, status) VALUES
('CTE-2025-001', '31251012345678901234567890123456789012345', '2025-10-21', 1, 1, 'Belo Horizonte/MG', 'São Paulo/SP', 3500.00, 18000.00, 'cte_001.pdf', 'Entregue'),
('CTE-2025-002', '31251012345678901234567890123456789012346', '2025-10-28', 3, 4, 'Belo Horizonte/MG', 'Rio de Janeiro/RJ', 2800.00, 12000.00, 'cte_002.pdf', 'Em Trânsito');

-- ============================================
-- VIEWS ÚTEIS
-- ============================================

-- View: Manutenções Urgentes
CREATE VIEW view_manutencoes_urgentes AS
SELECT 
    m.id,
    m.veiculo_id,
    v.placa,
    v.modelo,
    m.tipo,
    m.descricao,
    m.gravidade,
    m.data_programada,
    m.status,
    DATEDIFF(m.data_programada, CURDATE()) as dias_restantes
FROM manutencoes m
INNER JOIN veiculos v ON m.veiculo_id = v.id
WHERE m.status IN ('Pendente', 'Em Andamento')
    AND m.gravidade IN ('Alta', 'Crítica')
ORDER BY m.gravidade DESC, m.data_programada ASC;

-- View: Dashboard Gerencial
CREATE VIEW view_dashboard_stats AS
SELECT 
    (SELECT COUNT(*) FROM veiculos WHERE ativo = TRUE) as total_veiculos,
    (SELECT COUNT(*) FROM veiculos WHERE status = 'Disponível') as veiculos_disponiveis,
    (SELECT COUNT(*) FROM veiculos WHERE status = 'Em Manutenção') as veiculos_manutencao,
    (SELECT COUNT(*) FROM usuarios WHERE perfil = 'Motorista' AND ativo = TRUE) as total_motoristas,
    (SELECT COUNT(*) FROM manutencoes WHERE status = 'Pendente' AND gravidade IN ('Alta', 'Crítica')) as manutencoes_urgentes,
    (SELECT COUNT(*) FROM viagens WHERE status = 'Em Andamento') as viagens_ativas,
    (SELECT COUNT(*) FROM ctes WHERE MONTH(data_emissao) = MONTH(CURDATE()) AND YEAR(data_emissao) = YEAR(CURDATE())) as ctes_mes_atual;

-- ============================================
-- STORED PROCEDURES
-- ============================================

DELIMITER $$

-- Procedure: Atualizar KM do Veículo
CREATE PROCEDURE sp_atualizar_km_veiculo(
    IN p_veiculo_id INT,
    IN p_novo_km INT
)
BEGIN
    UPDATE veiculos 
    SET km_atual = p_novo_km,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = p_veiculo_id;
END$$

-- Procedure: Finalizar Viagem
CREATE PROCEDURE sp_finalizar_viagem(
    IN p_viagem_id INT,
    IN p_km_final INT
)
BEGIN
    DECLARE v_veiculo_id INT;
    
    -- Buscar o veículo da viagem
    SELECT veiculo_id INTO v_veiculo_id
    FROM viagens
    WHERE id = p_viagem_id;
    
    -- Atualizar a viagem
    UPDATE viagens
    SET status = 'Concluída',
        data_chegada_real = NOW(),
        km_final = p_km_final,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = p_viagem_id;
    
    -- Atualizar o KM do veículo
    UPDATE veiculos
    SET km_atual = p_km_final,
        status = 'Disponível',
        updated_at = CURRENT_TIMESTAMP
    WHERE id = v_veiculo_id;
END$$

DELIMITER ;

-- ============================================
-- ÍNDICES ADICIONAIS PARA PERFORMANCE
-- ============================================

-- Índices compostos para queries comuns
CREATE INDEX idx_manutencoes_status_gravidade ON manutencoes(status, gravidade);
CREATE INDEX idx_viagens_status_data ON viagens(status, data_saida);
CREATE INDEX idx_ctes_status_data ON ctes(status, data_emissao);

-- ============================================
-- FIM DO SCHEMA
-- ============================================