import React, { useState, useEffect } from 'react';
import { Truck, FileText, Wrench, Users, Plus, LogOut, AlertTriangle, Clock } from 'lucide-react';
import { API, handleAPIError } from './services/api';
import testConnection from './testConnection';
import './App.css';

// Executar teste de conexão
testConnection();

const SistemaLogistica = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [veiculos, setVeiculos] = useState([]);
  const [motoristas, setMotoristas] = useState([]);
  const [manutencoes, setManutencoes] = useState([]);
  const [ctes, setCtes] = useState([]);
  const [dashboardStats, setDashboardStats] = useState(null);
  const [showModal, setShowModal] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [subTab, setSubTab] = useState({ manutencoes: 'pendentes', ctes: 'ativos' });
  const [filtros, setFiltros] = useState({ dataInicio: '', dataFim: '', pesquisa: '' });

  // Carregar dados ao fazer login
  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    if (token && user) {
      setCurrentUser(JSON.parse(user));
      loadInitialData();
    }
  }, []);

  // Carregar dados iniciais
  const loadInitialData = async () => {
    try {
      await Promise.all([
        loadVehicles(),
        loadDrivers(),
        loadMaintenances(),
        loadCtes(),
        loadDashboardStats()
      ]);
    } catch (err) {
      console.error('Erro ao carregar dados:', err);
    }
  };

  // Carregar veículos
  const loadVehicles = async () => {
    try {
      const response = await API.vehicles.getAll();
      setVeiculos(response.data.data || []);
    } catch (err) {
      console.error('Erro ao carregar veículos:', err);
      setError('Erro ao carregar veículos');
    }
  };

  // Carregar motoristas
  const loadDrivers = async () => {
    try {
      const response = await API.users.getAll();
      const drivers = (response.data.data || []).filter(u => u.perfil === 'Motorista');
      setMotoristas(drivers);
    } catch (err) {
      console.error('Erro ao carregar motoristas:', err);
      setError('Erro ao carregar motoristas');
    }
  };

  // Carregar manutenções
  const loadMaintenances = async () => {
    try {
      const response = await API.maintenances.getAll();
      setManutencoes(response.data.data || []);
    } catch (err) {
      console.error('Erro ao carregar manutenções:', err);
      setError('Erro ao carregar manutenções');
    }
  };

  // Carregar CT-e
  const loadCtes = async () => {
    try {
      const response = await API.ctes.getAll();
      setCtes(response.data.data || []);
    } catch (err) {
      console.error('Erro ao carregar CT-e:', err);
      setError('Erro ao carregar CT-e');
    }
  };

  // Carregar estatísticas do dashboard
  const loadDashboardStats = async () => {
    try {
      const response = await API.dashboard.getStats();
      setDashboardStats(response.data.data);
    } catch (err) {
      console.error('Erro ao carregar estatísticas:', err);
      // Não mostrar erro para estatísticas, pois não é crítico
    }
  };

  // Login
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const matricula = e.target.matricula.value;
      const senha = e.target.senha.value;

      const response = await API.auth.login(matricula, senha);
      
      const { user, token } = response.data.data;

      // Salvar no localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      setCurrentUser(user);
      // Definir aba inicial baseada no perfil
      const initialTab = user.perfil === 'Motorista' ? 'manutencoes' : 'dashboard';
      setActiveTab(initialTab);

      // Carregar dados
      await loadInitialData();

    } catch (err) {
      console.error('Erro completo:', err);
      console.error('Response:', err.response);
      const errorInfo = handleAPIError(err);
      setError(errorInfo.message || 'Erro ao processar requisição');
    } finally {
      setLoading(false);
    }
  };

  // Concluir manutenção
  const concluirManutencao = async (id) => {
    try {
      await API.maintenances.updateStatus(id, 'Concluída');
      await loadMaintenances();
      alert('Manutenção concluída!');
    } catch (err) {
      alert('Erro ao concluir manutenção');
    }
  };

  // Download CT-e
  const downloadCte = async (id, nome) => {
    try {
      const response = await API.ctes.download(id);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', nome);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert('Erro ao baixar arquivo');
    }
  };

  // Marcar CT-e como baixado
  const marcarCteBaixado = async (id) => {
    try {
      await API.ctes.update(id, { status: 'Concluído' });
      await loadCtes();
      alert('CT-e marcado como baixado!');
    } catch (err) {
      alert('Erro ao marcar CT-e como baixado');
    }
  };

  // Logout
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setCurrentUser(null);
    setActiveTab('dashboard');
    setVeiculos([]);
    setMotoristas([]);
    setManutencoes([]);
    setCtes([]);
    setDashboardStats(null);
    setSubTab({ manutencoes: 'pendentes', ctes: 'ativos' });
  };

  // Form Veículo
  const FormVeiculo = () => {
    const handleSubmit = async (e) => {
      e.preventDefault();
      setLoading(true);

      try {
        const data = {
          tipo: e.target.tipo.value,
          frota: e.target.frota.value,
          placa: e.target.placa.value,
          modelo: e.target.modelo.value,
          ano: parseInt(e.target.ano.value),
          km_atual: parseInt(e.target.km.value)
        };

        await API.vehicles.create(data);
        await loadVehicles();
        setShowModal(null);
        alert('Veículo cadastrado com sucesso!');

      } catch (err) {
        const errorInfo = handleAPIError(err);
        alert(errorInfo.message);
      } finally {
        setLoading(false);
      }
    };

    return (
      <form onSubmit={handleSubmit} className="form">
        <div className="form-group">
          <label className="label">Tipo</label>
          <select name="tipo" required className="input">
            <option value="Caminhão">Caminhão</option>
            <option value="Carreta">Carreta</option>
            <option value="Van">Van</option>
            <option value="Utilitário">Utilitário</option>
          </select>
        </div>
        <div className="form-group">
          <label className="label">Número da Frota</label>
          <input name="frota" required className="input" placeholder="S-001" pattern="S-\d+" />
        </div>
        <div className="form-group">
          <label className="label">Placa</label>
          <input name="placa" required className="input" placeholder="ABC-1234" />
        </div>
        <div className="form-group">
          <label className="label">Modelo</label>
          <input name="modelo" required className="input" />
        </div>
        <div className="form-group">
          <label className="label">Ano</label>
          <input name="ano" type="number" required className="input" min="1900" />
        </div>
        <div className="form-group">
          <label className="label">Quilometragem Atual</label>
          <input name="km" type="number" required className="input" min="0" />
        </div>
        <button type="submit" className="button-primary" disabled={loading}>
          {loading ? 'Cadastrando...' : 'Cadastrar Veículo'}
        </button>
      </form>
    );
  };

  // Form Motorista (Registro de usuário)
  const FormMotorista = () => {
    const handleSubmit = async (e) => {
      e.preventDefault();
      setLoading(true);

      try {
        const data = {
          nome: e.target.nome.value,
          matricula: e.target.matricula.value,
          senha: e.target.senha.value,
          perfil: 'Motorista',
          telefone: e.target.telefone.value
        };

        await API.users.create(data);
        await loadDrivers();
        setShowModal(null);
        alert('Motorista cadastrado com sucesso!');

      } catch (err) {
        const errorInfo = handleAPIError(err);
        alert(errorInfo.message);
      } finally {
        setLoading(false);
      }
    };

    return (
      <form onSubmit={handleSubmit} className="form">
        <div className="form-group">
          <label className="label">Nome Completo</label>
          <input name="nome" required className="input" />
        </div>
        <div className="form-group">
          <label className="label">Matrícula</label>
          <input name="matricula" required className="input" minLength="3" placeholder="Ex: 001" />
        </div>
        <div className="form-group">
          <label className="label">Senha</label>
          <input name="senha" type="password" required className="input" minLength="3" />
        </div>
        <div className="form-group">
          <label className="label">Telefone</label>
          <input name="telefone" required className="input" placeholder="31 99999-9999" />
        </div>
        <button type="submit" className="button-primary" disabled={loading}>
          {loading ? 'Cadastrando...' : 'Cadastrar Motorista'}
        </button>
      </form>
    );
  };

  // Form Manutenção
  const FormManutencao = () => {
    const handleSubmit = async (e) => {
      e.preventDefault();
      setLoading(true);

      try {
        const data = {
          veiculo_id: parseInt(e.target.veiculo.value),
          data_programada: e.target.data.value,
          tipo: e.target.tipo.value,
          km_manutencao: parseInt(e.target.km.value),
          descricao: e.target.descricao.value,
          gravidade: e.target.gravidade.value
        };

        await API.maintenances.create(data);
        await loadMaintenances();
        await loadVehicles(); // Atualizar status do veículo
        setShowModal(null);
        alert('Manutenção registrada com sucesso!');

      } catch (err) {
        const errorInfo = handleAPIError(err);
        alert(errorInfo.message);
      } finally {
        setLoading(false);
      }
    };

    return (
      <form onSubmit={handleSubmit} className="form">
        <div className="form-group">
          <label className="label">Veículo</label>
          <select name="veiculo" required className="input">
            {veiculos.filter(v => v.ativo).map(v => (
              <option key={v.id} value={v.id}>{v.placa} - {v.modelo}</option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label className="label">Data Programada</label>
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
          <input name="km" type="number" required className="input" min="0" />
        </div>
        <div className="form-group">
          <label className="label">Descrição do Problema</label>
          <textarea name="descricao" required className="input" rows="3"></textarea>
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
        <button type="submit" className="button-primary" disabled={loading}>
          {loading ? 'Registrando...' : 'Registrar Manutenção'}
        </button>
      </form>
    );
  };

  // Form CT-e
  const FormCTE = () => {
    const handleSubmit = async (e) => {
      e.preventDefault();
      setLoading(true);

      try {
        const formData = new FormData();
        formData.append('numero', e.target.numero.value);
        formData.append('data_emissao', new Date().toISOString().split('T')[0]);
        
        const arquivo = e.target.arquivo.files[0];
        if (arquivo) {
          formData.append('arquivo', arquivo);
        }

        console.log('Enviando FormData:', {
          numero: e.target.numero.value,
          arquivo: arquivo?.name
        });

        const response = await API.ctes.create(formData);
        console.log('Resposta:', response);
        
        await loadCtes();
        setShowModal(null);
        alert('CT-e cadastrado com sucesso!');

      } catch (err) {
        console.error('Erro completo:', err);
        alert('Erro ao cadastrar CT-e: ' + (err.response?.data?.message || err.message));
      } finally {
        setLoading(false);
      }
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
        <button type="submit" className="button-primary" disabled={loading}>
          {loading ? 'Anexando...' : 'Anexar CT-e'}
        </button>
      </form>
    );
  };

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

  if (!currentUser) {
    return (
      <div className="login-container">
        <div className="login-box">
          <div className="login-header">
            <img src="/logo.png" alt="Logo" style={{height: '80px', width: 'auto', marginBottom: '20px', display: 'block', margin: '0 auto 20px auto'}} />
            <h1 className="login-title">Sistema de Logística</h1>
            <p className="login-subtitle">Gestão de Frota e Documentação</p>
          </div>
          <form onSubmit={handleLogin} className="login-form">
            <div className="form-group">
              <label className="label">Matrícula</label>
              <input name="matricula" required className="input" placeholder="Digite sua matrícula" disabled={loading} />
            </div>
            <div className="form-group">
              <label className="label">Senha</label>
              <input name="senha" type="password" required className="input" placeholder="Digite sua senha" disabled={loading} />
            </div>
            {error && (
              <div style={{padding: '12px', backgroundColor: '#FEE2E2', borderRadius: '8px', color: '#991B1B', fontSize: '14px'}}>
                {error}
              </div>
            )}
            <button type="submit" className="button-primary" disabled={loading}>
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>
          <div className="login-info" style={{backgroundColor: 'transparent', border: 'none'}}>
            <p className="info-text" style={{color: 'white', backgroundColor: 'transparent', textAlign: 'center', fontWeight: 'bold'}}>© 2025 AvaSystem - Todos os direitos reservados</p>
          </div>
        </div>
      </div>
    );
  }

  const Dashboard = () => (
    <div className="content">
      <h2 className="page-title">Dashboard</h2>
      <p className="page-subtitle">{currentUser.perfil}</p>
      
      <div className="stats-grid">
        <div className="stat-card border-yellow">
          <Truck size={32} color="#FFCC29" />
          <p className="stat-label">Veículos</p>
          <p className="stat-value">{dashboardStats?.veiculos?.total || veiculos.length}</p>
        </div>
        
        <div className="stat-card border-black">
          <Users size={32} color="#000" />
          <p className="stat-label">Motoristas</p>
          <p className="stat-value">{dashboardStats?.motoristas?.total || motoristas.length}</p>
        </div>
        
        <div className="stat-card border-red">
          <AlertTriangle size={32} color="#FF6B6B" />
          <p className="stat-label">Urgentes</p>
          <p className="stat-value">{dashboardStats?.manutencoes?.urgentes || 0}</p>
        </div>
        
        <div className="stat-card border-gray">
          <FileText size={32} color="#000000ff" />
          <p className="stat-label">CT-e</p>
          <p className="stat-value">{dashboardStats?.ctes?.mes_atual || ctes.length}</p>
        </div>
      </div>

      <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px'}}>
        <div className="card">
          <h3 className="card-title flex items-center">
            <Clock size={20} className="mr-2" />
            Manutenções Recentes
          </h3>
          <div className="list">
            {manutencoes.slice(0, 3).map(m => {
              const badgeClass = m.gravidade === 'Crítica' ? 'badge-critical' :
                                 m.gravidade === 'Alta' ? 'badge-high' :
                                 m.gravidade === 'Média' ? 'badge-medium' : 'badge-low';
              return (
                <div key={m.id} className="list-item">
                  <div className="flex-1">
                    <p className="list-item-title">{m.veiculo?.placa} - {m.tipo}</p>
                    <p className="list-item-text">{m.descricao}</p>
                  </div>
                  <span className={`badge ${badgeClass}`}>
                    {m.gravidade}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="card">
          <h3 className="card-title flex items-center">
            <FileText size={20} className="mr-2" />
            Documentos Anexados
          </h3>
          <div className="list">
            {ctes.slice(0, 3).map(c => (
              <div key={c.id} className="list-item">
                <div className="flex-1">
                  <p className="list-item-title">{c.numero}</p>
                  <p className="list-item-text">
                    Documento: {c.arquivo_nome || 'Sem arquivo'}
                  </p>
                  <p className="list-item-text" style={{fontSize: '12px', color: '#6B7280'}}>
                    {new Date(c.createdAt || c.data_emissao).toLocaleDateString('pt-BR')} - {c.arquivo_nome}
                  </p>
                </div>
                <span className={`badge ${c.status === 'Concluído' ? 'badge-completed' : 'badge-pending'}`}>
                  {c.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const Veiculos = () => (
    <div className="content">
      <div className="page-header">
        <div>
          <h2 className="page-title">Veículos</h2>
          <p className="page-subtitle">Gestão da frota</p>
        </div>
        {['Gerente', 'Assistente'].includes(currentUser.perfil) && (
          <button onClick={() => setShowModal('veiculo')} className="button-primary">
            <Plus size={18} className="mr-2" />
            Novo Veículo
          </button>
        )}
      </div>
      
      <div className="grid">
        {veiculos.filter(v => v.ativo).map(v => (
          <div key={v.id} className="card border-yellow">
            <div className="card-header">
              <Truck size={24} color="#FFCC29" />
              <h3 className="card-title">{v.frota}</h3>
            </div>
            <div className="card-body">
              <p className="info-row"><span className="info-label">Placa:</span> {v.placa}</p>
              <p className="info-row"><span className="info-label">Tipo:</span> {v.tipo}</p>
              <p className="info-row"><span className="info-label">Modelo:</span> {v.modelo}</p>
              <p className="info-row"><span className="info-label">Ano:</span> {v.ano}</p>
              <p className="info-row"><span className="info-label">KM:</span> {v.km_atual?.toLocaleString()}</p>
              <p className="info-row"><span className="info-label">Status:</span> {v.status}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const Motoristas = () => (
    <div className="content">
      <div className="page-header">
        <div>
          <h2 className="page-title">Motoristas</h2>
          <p className="page-subtitle">Equipe cadastrada</p>
        </div>
        {['Gerente', 'Assistente'].includes(currentUser.perfil) && (
          <button onClick={() => setShowModal('motorista')} className="button-primary">
            <Plus size={18} className="mr-2" />
            Novo Motorista
          </button>
        )}
      </div>
      
      <div className="grid">
        {motoristas.filter(m => m.ativo).map(m => (
          <div key={m.id} className="card border-black">
            <div className="card-header">
              <Users size={24} color="#000" />
              <h3 className="card-title">{m.nome}</h3>
            </div>
            <div className="card-body">
              <p className="info-row"><span className="info-label">Matrícula:</span> {m.matricula}</p>
              <p className="info-row"><span className="info-label">Telefone:</span> {m.telefone}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const Manutencoes = () => {
    const filtrarManutencoes = (status) => {
      let dados = manutencoes.filter(m => status === 'pendentes' ? m.status !== 'Concluída' : m.status === 'Concluída');
      
      if (filtros.dataInicio || filtros.dataFim || filtros.pesquisa) {
        dados = dados.filter(item => {
          const dataItem = new Date(item.data_programada);
          const dataInicio = filtros.dataInicio ? new Date(filtros.dataInicio) : null;
          const dataFim = filtros.dataFim ? new Date(filtros.dataFim) : null;
          
          const passaData = (!dataInicio || dataItem >= dataInicio) && (!dataFim || dataItem <= dataFim);
          const passaPesquisa = !filtros.pesquisa || 
            item.veiculo?.placa?.toLowerCase().includes(filtros.pesquisa.toLowerCase()) ||
            item.descricao?.toLowerCase().includes(filtros.pesquisa.toLowerCase());
          
          return passaData && passaPesquisa;
        });
      }
      
      return dados;
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
        
        <div style={{display: 'flex', gap: '10px', marginBottom: '20px'}}>
          <button 
            onClick={() => setSubTab({...subTab, manutencoes: 'pendentes'})} 
            className={subTab.manutencoes === 'pendentes' ? 'nav-button-active' : 'nav-button'}
          >
            Pendentes
          </button>
          <button 
            onClick={() => setSubTab({...subTab, manutencoes: 'concluidas'})} 
            className={subTab.manutencoes === 'concluidas' ? 'nav-button-active' : 'nav-button'}
          >
            Concluídas
          </button>
        </div>

        {subTab.manutencoes === 'concluidas' && (
          <div className="card" style={{marginBottom: '20px'}}>
            <div className="card-body">
              <div style={{display: 'flex', gap: '10px', flexWrap: 'wrap'}}>
                <input 
                  type="date" 
                  placeholder="Data Início" 
                  value={filtros.dataInicio}
                  onChange={(e) => setFiltros({...filtros, dataInicio: e.target.value})}
                  className="input" 
                  style={{flex: '1', minWidth: '150px'}}
                />
                <input 
                  type="date" 
                  placeholder="Data Fim" 
                  value={filtros.dataFim}
                  onChange={(e) => setFiltros({...filtros, dataFim: e.target.value})}
                  className="input" 
                  style={{flex: '1', minWidth: '150px'}}
                />
                <input 
                  type="text" 
                  placeholder="Pesquisar..." 
                  value={filtros.pesquisa}
                  onChange={(e) => setFiltros({...filtros, pesquisa: e.target.value})}
                  className="input" 
                  style={{flex: '2', minWidth: '200px'}}
                />
              </div>
            </div>
          </div>
        )}
        
        <div className="list">
          {filtrarManutencoes(subTab.manutencoes).map(m => {
            const gravidadeClass = m.gravidade === 'Crítica' ? 'badge-critical' :
                                   m.gravidade === 'Alta' ? 'badge-high' :
                                   m.gravidade === 'Média' ? 'badge-medium' : 'badge-low';
            const statusClass = m.status === 'Concluída' ? 'badge-completed' : 'badge-pending';
            
            return (
              <div key={m.id} className="card">
                <div className="flex justify-between">
                  <div className="flex-1">
                    <div className="card-header">
                      <Wrench size={20} color={m.status === 'Concluída' ? "#22C55E" : "#6B7280"} />
                      <h3 className="card-title">{m.veiculo?.placa} - {m.tipo}</h3>
                    </div>
                    <div className="card-body">
                      <p className="info-row"><span className="info-label">Data:</span> {new Date(m.data_programada).toLocaleDateString('pt-BR')}</p>
                      <p className="info-row"><span className="info-label">KM:</span> {m.km_manutencao?.toLocaleString()}</p>
                      <p className="info-row mt-2"><span className="info-label">Descrição:</span> {m.descricao}</p>
                    </div>
                  </div>
                  <div className="flex" style={{flexDirection: 'column', gap: '8px', alignItems: 'flex-end'}}>
                    <span className={`badge ${gravidadeClass}`}>{m.gravidade}</span>
                    <span className={`badge ${statusClass}`}>{m.status}</span>
                    {['Assistente', 'Gerente'].includes(currentUser.perfil) && m.status !== 'Concluída' && (
                      <button 
                        onClick={() => concluirManutencao(m.id)} 
                        className="button-primary" 
                        style={{fontSize: '12px', padding: '4px 8px'}}
                      >
                        Concluir
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const CTes = () => {
    const filtrarCtes = (status) => {
      let dados = ctes.filter(c => status === 'ativos' ? c.status !== 'Concluído' : c.status === 'Concluído');
      
      if (filtros.dataInicio || filtros.dataFim || filtros.pesquisa) {
        dados = dados.filter(item => {
          const dataItem = new Date(item.data_emissao);
          const dataInicio = filtros.dataInicio ? new Date(filtros.dataInicio) : null;
          const dataFim = filtros.dataFim ? new Date(filtros.dataFim) : null;
          
          const passaData = (!dataInicio || dataItem >= dataInicio) && (!dataFim || dataItem <= dataFim);
          const passaPesquisa = !filtros.pesquisa || 
            item.numero?.toLowerCase().includes(filtros.pesquisa.toLowerCase());
          
          return passaData && passaPesquisa;
        });
      }
      
      return dados;
    };

    return (
      <div className="content">
        <div className="page-header">
          <div>
            <h2 className="page-title">CT-e</h2>
            <p className="page-subtitle">Documentos de carga</p>
          </div>
          <button onClick={() => setShowModal('cte')} className="button-primary">
            <Plus size={18} className="mr-2" />
            Novo CT-e
          </button>
        </div>
        
        <div style={{display: 'flex', gap: '10px', marginBottom: '20px'}}>
          <button 
            onClick={() => setSubTab({...subTab, ctes: 'ativos'})} 
            className={subTab.ctes === 'ativos' ? 'nav-button-active' : 'nav-button'}
          >
            Ativos
          </button>
          <button 
            onClick={() => setSubTab({...subTab, ctes: 'concluidos'})} 
            className={subTab.ctes === 'concluidos' ? 'nav-button-active' : 'nav-button'}
          >
            Concluídos
          </button>
        </div>

        {subTab.ctes === 'concluidos' && (
          <div className="card" style={{marginBottom: '20px'}}>
            <div className="card-body">
              <div style={{display: 'flex', gap: '10px', flexWrap: 'wrap'}}>
                <input 
                  type="date" 
                  placeholder="Data Início" 
                  value={filtros.dataInicio}
                  onChange={(e) => setFiltros({...filtros, dataInicio: e.target.value})}
                  className="input" 
                  style={{flex: '1', minWidth: '150px'}}
                />
                <input 
                  type="date" 
                  placeholder="Data Fim" 
                  value={filtros.dataFim}
                  onChange={(e) => setFiltros({...filtros, dataFim: e.target.value})}
                  className="input" 
                  style={{flex: '1', minWidth: '150px'}}
                />
                <input 
                  type="text" 
                  placeholder="Pesquisar..." 
                  value={filtros.pesquisa}
                  onChange={(e) => setFiltros({...filtros, pesquisa: e.target.value})}
                  className="input" 
                  style={{flex: '2', minWidth: '200px'}}
                />
              </div>
            </div>
          </div>
        )}
        
        <div className="list">
          {filtrarCtes(subTab.ctes).map(c => (
            <div key={c.id} className="card">
              <div className="card-header">
                <FileText size={20} color={c.status === 'Concluído' ? "#22C55E" : "#6B7280"} />
                <h3 className="card-title">{c.numero}</h3>
              </div>
              <div className="card-body">
                <p className="info-row"><span className="info-label">Data:</span> {new Date(c.data_emissao).toLocaleDateString('pt-BR')}</p>
                <p className="info-row"><span className="info-label">Arquivo:</span> {c.arquivo_nome}</p>
                <p className="info-row"><span className="info-label">Status:</span> {c.status}</p>
                {['Assistente', 'Gerente'].includes(currentUser.perfil) && (
                  <div style={{display: 'flex', gap: '8px', marginTop: '8px'}}>
                    {c.arquivo_nome && (
                      <button 
                        onClick={() => downloadCte(c.id, c.arquivo_nome)} 
                        className="button-primary" 
                        style={{fontSize: '12px', padding: '4px 8px'}}
                      >
                        Download
                      </button>
                    )}
                    {c.status !== 'Concluído' && (
                      <button 
                        onClick={() => marcarCteBaixado(c.id)} 
                        className="button-primary" 
                        style={{fontSize: '12px', padding: '4px 8px', backgroundColor: '#22C55E'}}
                      >
                        Marcar como Baixado
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };



  return (
    <div className="app">
      <header className="header">
        <div className="header-content">
          <div className="header-left">
            <div className="header-logo">
              <img src="/logoblack-removebg-preview.png" alt="Logo" style={{height: '40px', width: 'auto'}} />
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
          {['Assistente', 'Gerente'].includes(currentUser.perfil) && (
            <button onClick={() => setActiveTab('dashboard')} className={activeTab === 'dashboard' ? 'nav-button-active' : 'nav-button'}>
              Dashboard
            </button>
          )}
          {['Assistente', 'Gerente'].includes(currentUser.perfil) && (
            <button onClick={() => setActiveTab('veiculos')} className={activeTab === 'veiculos' ? 'nav-button-active' : 'nav-button'}>
              Veículos
            </button>
          )}
          {['Assistente', 'Gerente'].includes(currentUser.perfil) && (
            <button onClick={() => setActiveTab('motoristas')} className={activeTab === 'motoristas' ? 'nav-button-active' : 'nav-button'}>
              Motoristas
            </button>
          )}
          <button onClick={() => setActiveTab('manutencoes')} className={activeTab === 'manutencoes' ? 'nav-button-active' : 'nav-button'}>
            Manutenções
          </button>
          <button onClick={() => setActiveTab('ctes')} className={activeTab === 'ctes' ? 'nav-button-active' : 'nav-button'}>
            CT-e
          </button>
        </div>
      </nav>

      <main className="main">
        {activeTab === 'dashboard' && ['Assistente', 'Gerente'].includes(currentUser.perfil) && <Dashboard />}
        {activeTab === 'veiculos' && ['Assistente', 'Gerente'].includes(currentUser.perfil) && <Veiculos />}
        {activeTab === 'motoristas' && ['Assistente', 'Gerente'].includes(currentUser.perfil) && <Motoristas />}
        {activeTab === 'manutencoes' && <Manutencoes />}
        {activeTab === 'ctes' && <CTes />}
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