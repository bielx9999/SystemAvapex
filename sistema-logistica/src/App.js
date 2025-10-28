import React, { useState, useEffect } from 'react';
import { Truck, FileText, Wrench, Users, Plus, LogOut, AlertTriangle, Clock, Download, CheckCircle, XCircle } from 'lucide-react';
import './App.css';

// ===================== COMPONENTE PRINCIPAL =====================
const SistemaLogistica = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [veiculos, setVeiculos] = useState([]);
  const [motoristas, setMotoristas] = useState([]);
  const [manutencoes, setManutencoes] = useState([]);
  const [ctes, setCtes] = useState([]);
  const [showModal, setShowModal] = useState(null);
  const [loading, setLoading] = useState(false);

  // Carregar dados iniciais (simulado - depois conectar com API)
  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setVeiculos([
      { id: 1, tipo: 'Caminhão', numero_frota: 'S-1', modelo: 'Volvo FH 540', ano: 2020, km: 145000 },
      { id: 2, tipo: 'Carreta', numero_frota: 'S-2', modelo: 'Randon Bitrem', ano: 2019, km: 98000 },
      { id: 3, tipo: 'Caminhão', numero_frota: 'S-3', modelo: 'Scania R450', ano: 2021, km: 89000 }
    ]);
    setMotoristas([
      { id: 1, nome: 'João Silva', cnh: '12345678901', telefone: '31 99999-0001' },
      { id: 2, nome: 'Maria Santos', cnh: '98765432109', telefone: '31 99999-0002' }
    ]);
    setManutencoes([
      { id: 1, veiculo_id: 1, numero_frota: 'S-1', data: '2025-10-20', tipo: 'Preventiva', km: 145000, descricao: 'Troca de óleo e filtros', gravidade: 'Baixa', status: 'Concluída' },
      { id: 2, veiculo_id: 1, numero_frota: 'S-1', data: '2025-10-22', tipo: 'Corretiva', km: 145200, descricao: 'Problema no sistema de freios', gravidade: 'Alta', status: 'Pendente' },
      { id: 3, veiculo_id: 2, numero_frota: 'S-2', data: '2025-10-23', tipo: 'Preventiva', km: 98100, descricao: 'Revisão completa', gravidade: 'Média', status: 'Pendente' }
    ]);
    setCtes([
      { id: 1, numero: 'CTE-2025-001', motorista_nome: 'João Silva', data: '2025-10-21', arquivo: 'cte_001.pdf' },
      { id: 2, numero: 'CTE-2025-002', motorista_nome: 'Maria Santos', data: '2025-10-22', arquivo: 'cte_002.pdf' }
    ]);
  };

  // ===================== AUTENTICAÇÃO =====================
  const handleLogin = (e) => {
    e.preventDefault();
    const matricula = e.target.matricula.value;
    const senha = e.target.senha.value;
    
    // Usuários de teste
    const usuarios = [
      { id: 1, matricula: '1001', senha: '123', nome: 'João Silva', perfil: 'Motorista' },
      { id: 2, matricula: '2001', senha: '123', nome: 'Ana Costa', perfil: 'Assistente' },
      { id: 3, matricula: '3001', senha: '123', nome: 'Carlos Oliveira', perfil: 'Gerente' }
    ];

    const user = usuarios.find(u => u.matricula === matricula && u.senha === senha);
    if (user) {
      setCurrentUser(user);
      
      if (user.perfil === 'Motorista') {
        setActiveTab('manutencoes');
      } else {
        setActiveTab('dashboard');
      }
    } else {
      alert('Matrícula ou senha incorretos');
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setActiveTab('dashboard');
  };

  // ===================== FORMULÁRIOS =====================
  const FormVeiculo = () => {
    const handleSubmit = (e) => {
      e.preventDefault();
      const novoVeiculo = {
        id: veiculos.length + 1,
        tipo: e.target.tipo.value,
        numero_frota: e.target.numero_frota.value.toUpperCase(),
        modelo: e.target.modelo.value,
        ano: parseInt(e.target.ano.value),
        km: parseInt(e.target.km.value)
      };
      setVeiculos([...veiculos, novoVeiculo]);
      setShowModal(null);
      alert('Veículo cadastrado com sucesso!');
    };

    return (
      <form onSubmit={handleSubmit} className="form">
        <div className="form-group">
          <label className="label">Tipo</label>
          <select name="tipo" required className="input">
            <option value="Caminhão">Caminhão</option>
            <option value="Carreta">Carreta</option>
          </select>
        </div>
        <div className="form-group">
          <label className="label">Número da Frota</label>
          <input name="numero_frota" required className="input" placeholder="S-1" />
        </div>
        <div className="form-group">
          <label className="label">Modelo</label>
          <input name="modelo" required className="input" placeholder="Volvo FH 540" />
        </div>
        <div className="form-group">
          <label className="label">Ano</label>
          <input name="ano" type="number" required className="input" placeholder="2024" />
        </div>
        <div className="form-group">
          <label className="label">Quilometragem Atual</label>
          <input name="km" type="number" required className="input" placeholder="100000" />
        </div>
        <button type="submit" className="button-primary">
          <Plus size={18} className="mr-2" />
          Cadastrar Veículo
        </button>
      </form>
    );
  };

  const FormMotorista = () => {
    const handleSubmit = (e) => {
      e.preventDefault();
      const novoMotorista = {
        id: motoristas.length + 1,
        nome: e.target.nome.value,
        cnh: e.target.cnh.value,
        telefone: e.target.telefone.value
      };
      setMotoristas([...motoristas, novoMotorista]);
      setShowModal(null);
      alert('Motorista cadastrado com sucesso!');
    };

    return (
      <form onSubmit={handleSubmit} className="form">
        <div className="form-group">
          <label className="label">Nome Completo</label>
          <input name="nome" required className="input" placeholder="João Silva" />
        </div>
        <div className="form-group">
          <label className="label">CNH</label>
          <input name="cnh" required className="input" maxLength="11" placeholder="12345678901" />
        </div>
        <div className="form-group">
          <label className="label">Telefone</label>
          <input name="telefone" required className="input" placeholder="31 99999-9999" />
        </div>
        <button type="submit" className="button-primary">
          <Plus size={18} className="mr-2" />
          Cadastrar Motorista
        </button>
      </form>
    );
  };

  const FormManutencao = () => {
    const handleSubmit = (e) => {
      e.preventDefault();
      const veiculoId = parseInt(e.target.veiculo.value);
      const veiculo = veiculos.find(v => v.id === veiculoId);
      
      const novaManutencao = {
        id: manutencoes.length + 1,
        veiculo_id: veiculoId,
        numero_frota: veiculo.numero_frota,
        data: e.target.data.value,
        tipo: e.target.tipo.value,
        km: parseInt(e.target.km.value),
        descricao: e.target.descricao.value,
        gravidade: e.target.gravidade.value,
        status: 'Pendente'
      };
      setManutencoes([...manutencoes, novaManutencao]);
      setShowModal(null);
      alert('Manutenção registrada com sucesso!');
    };

    return (
      <form onSubmit={handleSubmit} className="form">
        <div className="form-group">
          <label className="label">Veículo</label>
          <select name="veiculo" required className="input">
            <option value="">Selecione um veículo</option>
            {veiculos.map(v => (
              <option key={v.id} value={v.id}>
                {v.numero_frota} - {v.modelo}
              </option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label className="label">Data</label>
          <input name="data" type="date" required className="input" />
        </div>
        <div className="form-group">
          <label className="label">Tipo de Manutenção</label>
          <select name="tipo" required className="input">
            <option value="Preventiva">Preventiva</option>
            <option value="Corretiva">Corretiva</option>
            <option value="Preditiva">Preditiva</option>
          </select>
        </div>
        <div className="form-group">
          <label className="label">Quilometragem</label>
          <input name="km" type="number" required className="input" placeholder="145000" />
        </div>
        <div className="form-group">
          <label className="label">Descrição do Problema</label>
          <textarea name="descricao" required className="input" rows="3" placeholder="Descreva o problema..."></textarea>
        </div>
        <div className="form-group">
          <label className="label">Gravidade</label>
          <select name="gravidade" required className="input">
            <option value="Baixa">Baixa</option>
            <option value="Média">Média</option>
            <option value="Alta">Alta</option>
            <option value="Crítica">Crítica</option>
          </select>
        </div>
        <button type="submit" className="button-primary">
          <Wrench size={18} className="mr-2" />
          Registrar Manutenção
        </button>
      </form>
    );
  };

  const FormCTE = () => {
    const handleSubmit = (e) => {
      e.preventDefault();
      const arquivo = e.target.arquivo.files[0];
      const novoCTE = {
        id: ctes.length + 1,
        numero: e.target.numero.value,
        motorista_nome: currentUser.nome,
        arquivo: arquivo ? arquivo.name : 'documento.pdf',
        data: new Date().toISOString().split('T')[0]
      };
      setCtes([...ctes, novoCTE]);
      setShowModal(null);
      alert('CT-e anexado com sucesso!');
    };

    return (
      <form onSubmit={handleSubmit} className="form">
        <div className="form-group">
          <label className="label">Número do CT-e</label>
          <input name="numero" required className="input" placeholder="CTE-2025-XXX" />
        </div>
        <div className="form-group">
          <label className="label">Arquivo CT-e (PDF)</label>
          <input name="arquivo" type="file" accept=".pdf" required className="input" />
        </div>
        <button type="submit" className="button-primary">
          <FileText size={18} className="mr-2" />
          Anexar CT-e
        </button>
      </form>
    );
  };

  // ===================== COMPONENTES DE INTERFACE =====================
  const Modal = ({ title, children }) => (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h3 className="modal-title">{title}</h3>
          <button onClick={() => setShowModal(null)} className="close-button">×</button>
        </div>
        {children}
      </div>
    </div>
  );

  // ===================== TELA DE LOGIN =====================
  if (!currentUser) {
    return (
      <div className="login-container">
        <div className="login-box">
          <div className="login-header">
            <div className="login-logo">
              <img src='logo.png' alt='logoowhite' />
            </div>
            <p className="login-subtitle">Manutenções e Comprovantes Eletrônicos</p>
          </div>
          <form onSubmit={handleLogin} className="login-form">
            <div className="form-group">
              <label className="label">Matrícula</label>
              <input name="matricula" required className="input" placeholder="Digite sua matrícula" />
            </div>
            <div className="form-group">
              <label className="label">Senha</label>
              <input name="senha" type="password" required className="input" placeholder="Digite sua senha" />
            </div>
            <button type="submit" className="button-primary">
              Entrar
            </button>
          </form>
          <div className="login-info">
            <p className="info-title">Usuários de teste:</p>
            <p className="info-text">Motorista: 1001 / 123</p>
            <p className="info-text">Assistente: 2001 / 123</p>
            <p className="info-text">Gerente: 3001 / 123</p>
          </div>
        </div>
      </div>
    );
  }

  // ===================== DASHBOARD (Gerente e Assistente) =====================
  const Dashboard = () => {
    const manutencoesUrgentes = manutencoes.filter(m => m.gravidade === 'Alta' || m.gravidade === 'Crítica').length;
    const manutencoesPendentes = manutencoes.filter(m => m.status === 'Pendente');
    
    // Dados para o gráfico de manutenções por tipo
    const manutencoesPorTipo = {
      Preventiva: manutencoes.filter(m => m.tipo === 'Preventiva').length,
      Corretiva: manutencoes.filter(m => m.tipo === 'Corretiva').length,
      Preditiva: manutencoes.filter(m => m.tipo === 'Preditiva').length
    };
    
    return (
      <div className="content">
        <div>
          <h2 className="page-title">Dashboard</h2>
          <p className="page-subtitle">{currentUser.perfil} - {currentUser.nome}</p>
        </div>
        
        <div className="stats-grid">
          <div className="stat-card border-yellow">
            <Truck size={32} color="#FFCC29" />
            <p className="stat-label">Veículos</p>
            <p className="stat-value">{veiculos.length}</p>
          </div>
          
          <div className="stat-card border-brown">
            <Users size={32} color="#4d4637" />
            <p className="stat-label">Motoristas</p>
            <p className="stat-value">{motoristas.length}</p>
          </div>
          
          <div className="stat-card border-red">
            <AlertTriangle size={32} color="#ef4444" />
            <p className="stat-label">Urgentes</p>
            <p className="stat-value">{manutencoesUrgentes}</p>
          </div>
          
          <div className="stat-card border-green">
            <FileText size={32} color="#22c55e" />
            <p className="stat-label">CT-e</p>
            <p className="stat-value">{ctes.length}</p>
          </div>
        </div>

        {/* Gráfico de Manutenções por Tipo */}
        <div className="chart-container">
          <h3 className="chart-title">Manutenções por Tipo</h3>
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
            {Object.entries(manutencoesPorTipo).map(([tipo, quantidade]) => (
              <div key={tipo} style={{ textAlign: 'center', minWidth: '120px' }}>
                <div style={{
                  width: '100px',
                  height: '100px',
                  margin: '0 auto 8px',
                  borderRadius: '50%',
                  background: `conic-gradient(#FFCC29 ${quantidade * 36}deg, #1a2332 0deg)`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '4px solid #4d4637'
                }}>
                  <span style={{ fontSize: '24px', fontWeight: 'bold', color: '#FFCC29' }}>{quantidade}</span>
                </div>
                <p style={{ color: '#9ca3af', fontSize: '14px', margin: 0 }}>{tipo}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Manutenções Pendentes */}
        <div className="card">
          <h3 className="card-title flex items-center">
            <Clock size={20} className="mr-2" />
            Manutenções Pendentes
          </h3>
          <div className="list">
            {manutencoesPendentes.length === 0 ? (
              <div className="empty-state">
                <p className="empty-state-text">Nenhuma manutenção pendente</p>
              </div>
            ) : (
              manutencoesPendentes.map(m => {
                const badgeClass = m.gravidade === 'Crítica' ? 'badge-critical' :
                                   m.gravidade === 'Alta' ? 'badge-high' :
                                   m.gravidade === 'Média' ? 'badge-medium' : 'badge-low';
                return (
                  <div key={m.id} className="list-item">
                    <div className="flex-1">
                      <p className="list-item-title">{m.numero_frota} - {m.tipo}</p>
                      <p className="list-item-text">{m.descricao}</p>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <span className={`badge ${badgeClass}`}>{m.gravidade}</span>
                      <button 
                        onClick={() => {
                          const updatedManutencoes = manutencoes.map(man => 
                            man.id === m.id ? { ...man, status: 'Concluída' } : man
                          );
                          setManutencoes(updatedManutencoes);
                          alert('Manutenção marcada como concluída!');
                        }}
                        className="button-success"
                      >
                        <CheckCircle size={16} />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* CT-e Recebidos */}
        <div className="card">
          <h3 className="card-title flex items-center">
            <FileText size={20} className="mr-2" />
            CT-e Recebidos
          </h3>
          <div className="list">
            {ctes.slice(-5).reverse().map(c => (
              <div key={c.id} className="list-item">
                <div className="flex-1">
                  <p className="list-item-title">{c.numero}</p>
                  <p className="list-item-text">
                    Motorista: {c.motorista_nome} | Data: {new Date(c.data).toLocaleDateString('pt-BR')}
                  </p>
                </div>
                <button className="button-secondary">
                  <Download size={16} className="mr-2" />
                  Download
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // ===================== VEÍCULOS =====================
  const Veiculos = () => (
    <div className="content">
      <div className="page-header">
        <div>
          <h2 className="page-title">Veículos</h2>
          <p className="page-subtitle">Gestão da frota</p>
        </div>
        <button onClick={() => setShowModal('veiculo')} className="button-primary">
          <Plus size={18} className="mr-2" />
          Novo Veículo
        </button>
      </div>
      
      <div className="grid">
        {veiculos.map(v => (
          <div key={v.id} className="card border-yellow">
            <div className="card-header">
              <Truck size={24} color="#FFCC29" />
              <h3 className="card-title">{v.numero_frota}</h3>
            </div>
            <div className="card-body">
              <p className="info-row"><span className="info-label">Tipo:</span> {v.tipo}</p>
              <p className="info-row"><span className="info-label">Modelo:</span> {v.modelo}</p>
              <p className="info-row"><span className="info-label">Ano:</span> {v.ano}</p>
              <p className="info-row"><span className="info-label">KM:</span> {v.km.toLocaleString()}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // ===================== MOTORISTAS =====================
  const Motoristas = () => (
    <div className="content">
      <div className="page-header">
        <div>
          <h2 className="page-title">Motoristas</h2>
          <p className="page-subtitle">Equipe cadastrada</p>
        </div>
        <button onClick={() => setShowModal('motorista')} className="button-primary">
          <Plus size={18} className="mr-2" />
          Novo Motorista
        </button>
      </div>
      
      <div className="grid">
        {motoristas.map(m => (
          <div key={m.id} className="card border-brown">
            <div className="card-header">
              <Users size={24} color="#4d4637" />
              <h3 className="card-title">{m.nome}</h3>
            </div>
            <div className="card-body">
              <p className="info-row"><span className="info-label">CNH:</span> {m.cnh}</p>
              <p className="info-row"><span className="info-label">Telefone:</span> {m.telefone}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // ===================== MANUTENÇÕES =====================
  const Manutencoes = () => {
    const manutencoesPendentes = manutencoes.filter(m => m.status === 'Pendente');
    const manutencoesConcluidas = manutencoes.filter(m => m.status === 'Concluída');
    const [viewMode, setViewMode] = useState('pendentes');

    const ManutencaoCard = ({ m }) => {
      const gravidadeClass = m.gravidade === 'Crítica' ? 'badge-critical' :
                             m.gravidade === 'Alta' ? 'badge-high' :
                             m.gravidade === 'Média' ? 'badge-medium' : 'badge-low';
      const statusClass = m.status === 'Concluída' ? 'badge-completed' : 'badge-pending';
      const canManage = currentUser.perfil === 'Gerente' || currentUser.perfil === 'Assistente';

      return (
        <div className="card">
          <div className="flex justify-between">
            <div className="flex-1">
              <div className="card-header">
                <Wrench size={20} color="#FFCC29" />
                <h3 className="card-title">{m.numero_frota} - {m.tipo}</h3>
              </div>
              <div className="card-body">
                <p className="info-row"><span className="info-label">Data:</span> {new Date(m.data).toLocaleDateString('pt-BR')}</p>
                <p className="info-row"><span className="info-label">KM:</span> {m.km.toLocaleString()}</p>
                <p className="info-row mt-2"><span className="info-label">Descrição:</span> {m.descricao}</p>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'flex-end' }}>
              <span className={`badge ${gravidadeClass}`}>{m.gravidade}</span>
              <span className={`badge ${statusClass}`}>{m.status}</span>
              {canManage && m.status === 'Pendente' && (
                <button 
                  onClick={() => {
                    const updatedManutencoes = manutencoes.map(man => 
                      man.id === m.id ? { ...man, status: 'Concluída' } : man
                    );
                    setManutencoes(updatedManutencoes);
                    alert('Manutenção marcada como concluída!');
                  }}
                  className="button-success"
                  style={{ marginTop: '8px' }}
                >
                  <CheckCircle size={16} className="mr-2" />
                  Concluir
                </button>
              )}
            </div>
          </div>
        </div>
      );
    };

    return (
      <div className="content">
        <div className="page-header">
          <div>
            <h2 className="page-title">Manutenções</h2>
            <p className="page-subtitle">Histórico e pendências</p>
          </div>
          <button onClick={() => setShowModal('manutencao')} className="button-primary">
            <Plus size={18} className="mr-2" />
            Registrar
          </button>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
          <button 
            onClick={() => setViewMode('pendentes')}
            className={viewMode === 'pendentes' ? 'button-primary' : 'button-secondary'}
          >
            Pendentes ({manutencoesPendentes.length})
          </button>
          <button 
            onClick={() => setViewMode('concluidas')}
            className={viewMode === 'concluidas' ? 'button-primary' : 'button-secondary'}
          >
            Concluídas ({manutencoesConcluidas.length})
          </button>
        </div>
        
        <div className="list">
          {viewMode === 'pendentes' ? (
            manutencoesPendentes.length === 0 ? (
              <div className="empty-state">
                <p className="empty-state-text">Nenhuma manutenção pendente</p>
              </div>
            ) : (
              manutencoesPendentes.map(m => <ManutencaoCard key={m.id} m={m} />)
            )
          ) : (
            manutencoesConcluidas.length === 0 ? (
              <div className="empty-state">
                <p className="empty-state-text">Nenhuma manutenção concluída</p>
              </div>
            ) : (
              manutencoesConcluidas.map(m => <ManutencaoCard key={m.id} m={m} />)
            )
          )}
        </div>
      </div>
    );
  };

  // ===================== CT-e =====================
  const CTes = () => (
    <div className="content">
      <div className="page-header">
        <div>
          <h2 className="page-title">CT-e</h2>
          <p className="page-subtitle">Documentos de carga</p>
        </div>
        <button onClick={() => setShowModal('cte')} className="button-primary">
          <Plus size={18} className="mr-2" />
          Anexar CT-e
        </button>
      </div>
      
      <div className="list">
        {ctes.length === 0 ? (
          <div className="empty-state">
            <FileText size={48} color="#9ca3af" style={{ opacity: 0.5 }} />
            <p className="empty-state-text">Nenhum CT-e cadastrado</p>
          </div>
        ) : (
          ctes.map(c => (
            <div key={c.id} className="card">
              <div className="card-header">
                <FileText size={20} color="#FFCC29" />
                <h3 className="card-title">{c.numero}</h3>
              </div>
              <div className="card-body">
                <p className="info-row"><span className="info-label">Data:</span> {new Date(c.data).toLocaleDateString('pt-BR')}</p>
                <p className="info-row"><span className="info-label">Motorista:</span> {c.motorista_nome}</p>
                <p className="info-row"><span className="info-label">Arquivo:</span> {c.arquivo}</p>
              </div>
              <div className="action-buttons">
                <button className="button-secondary">
                  <Download size={16} className="mr-2" />
                  Download
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );

  // ===================== RENDERIZAÇÃO PRINCIPAL =====================
  const renderContent = () => {
    const isMotorista = currentUser.perfil === 'Motorista';
    
    // Motorista não tem acesso ao dashboard
    if (activeTab === 'dashboard' && !isMotorista) return <Dashboard />;
    if (activeTab === 'veiculos' && !isMotorista) return <Veiculos />;
    if (activeTab === 'motoristas' && !isMotorista) return <Motoristas />;
    if (activeTab === 'manutencoes') return <Manutencoes />;
    if (activeTab === 'ctes') return <CTes />;
    
    return <Manutencoes />; // Padrão para motorista
  };

  const canAccessTab = (tab) => {
    if (currentUser.perfil === 'Motorista') {
      return tab === 'manutencoes' || tab === 'ctes';
    }
    return true;
  };

  return (
    <div className="app">
      <header className="header">
        <div className="header-content">
          <div className="header-left">
            <div className="header-logo">
              <img src='logo.png' alt='logo' />
            </div>
            <div>
              <h1 className="header-title">AvaSystem</h1>
              <p className="header-subtitle">{currentUser.nome} · {currentUser.perfil}</p>
            </div>
          </div>
          <button onClick={handleLogout} className="button-logout">
            <LogOut size={18} className="mr-2" />
            Sair
          </button>
        </div>
      </header>

      <nav className="nav">
        <div className="nav-content">
          {canAccessTab('dashboard') && (
            <button 
              onClick={() => setActiveTab('dashboard')} 
              className={activeTab === 'dashboard' ? 'nav-button-active' : 'nav-button'}
            >
              Dashboard
            </button>
          )}
          {canAccessTab('veiculos') && (
            <button 
              onClick={() => setActiveTab('veiculos')} 
              className={activeTab === 'veiculos' ? 'nav-button-active' : 'nav-button'}
            >
              Veículos
            </button>
          )}
          {canAccessTab('motoristas') && (
            <button 
              onClick={() => setActiveTab('motoristas')} 
              className={activeTab === 'motoristas' ? 'nav-button-active' : 'nav-button'}
            >
              Motoristas
            </button>
          )}
          {canAccessTab('manutencoes') && (
            <button 
              onClick={() => setActiveTab('manutencoes')} 
              className={activeTab === 'manutencoes' ? 'nav-button-active' : 'nav-button'}
            >
              Manutenções
            </button>
          )}
          {canAccessTab('ctes') && (
            <button 
              onClick={() => setActiveTab('ctes')} 
              className={activeTab === 'ctes' ? 'nav-button-active' : 'nav-button'}
            >
              CT-e
            </button>
          )}
        </div>
      </nav>

      <main className="main">
        {renderContent()}
      </main>

      {showModal === 'veiculo' && (
        <Modal title="Cadastrar Novo Veículo">
          <FormVeiculo />
        </Modal>
      )}

      {showModal === 'motorista' && (
        <Modal title="Cadastrar Novo Motorista">
          <FormMotorista />
        </Modal>
      )}

      {showModal === 'manutencao' && (
        <Modal title="Registrar Manutenção">
          <FormManutencao />
        </Modal>
      )}

      {showModal === 'cte' && (
        <Modal title="Anexar CT-e">
          <FormCTE />
        </Modal>
      )}
    </div>
  );
};

export default SistemaLogistica;