import React, { useState, useEffect } from 'react';
import { Truck, FileText, Wrench, Users, Plus, LogOut, AlertTriangle, Clock } from 'lucide-react';
import './App.css';

const SistemaLogistica = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [veiculos, setVeiculos] = useState([]);
  const [motoristas, setMotoristas] = useState([]);
  const [manutencoes, setManutencoes] = useState([]);
  const [ctes, setCtes] = useState([]);
  const [showModal, setShowModal] = useState(null);

  useEffect(() => {
    setVeiculos([
      { id: 1, tipo: 'Caminhão', placa: 'ABC-1234', modelo: 'Volvo FH', ano: 2020, km: 145000 },
      { id: 2, tipo: 'Carreta', placa: 'DEF-5678', modelo: 'Randon', ano: 2019, km: 98000 }
    ]);
    setMotoristas([
      { id: 1, nome: 'João Silva', cnh: '12345678901', telefone: '31 99999-0001' },
      { id: 2, nome: 'Maria Santos', cnh: '98765432109', telefone: '31 99999-0002' }
    ]);
    setManutencoes([
      { id: 1, veiculoId: 1, data: '2025-10-20', tipo: 'Preventiva', km: 145000, descricao: 'Troca de óleo e filtros', gravidade: 'Baixa', status: 'Concluída' },
      { id: 2, veiculoId: 1, data: '2025-10-22', tipo: 'Corretiva', km: 145200, descricao: 'Problema no sistema de freios', gravidade: 'Alta', status: 'Pendente' }
    ]);
    setCtes([
      { id: 1, numero: 'CTE-2025-001', data: '2025-10-21', arquivo: 'cte_001.pdf' }
    ]);
  }, []);

  const usuarios = [
    { id: 1, usuario: 'motorista', senha: '123', nome: 'João Silva', perfil: 'Motorista' },
    { id: 2, usuario: 'assistente', senha: '123', nome: 'Ana Costa', perfil: 'Assistente' },
    { id: 3, usuario: 'gerente', senha: '123', nome: 'Carlos Oliveira', perfil: 'Gerente' }
  ];

  const handleLogin = (e) => {
    e.preventDefault();
    const usuario = e.target.usuario.value;
    const senha = e.target.senha.value;
    const user = usuarios.find(u => u.usuario === usuario && u.senha === senha);
    if (user) {
      setCurrentUser(user);
      setActiveTab('dashboard');
    } else {
      alert('Usuário ou senha incorretos');
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setActiveTab('dashboard');
  };

  const FormVeiculo = () => {
    const handleSubmit = (e) => {
      e.preventDefault();
      const novoVeiculo = {
        id: veiculos.length + 1,
        tipo: e.target.tipo.value,
        placa: e.target.placa.value,
        modelo: e.target.modelo.value,
        ano: e.target.ano.value,
        km: parseInt(e.target.km.value)
      };
      setVeiculos([...veiculos, novoVeiculo]);
      setShowModal(null);
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
          <label className="label">Placa</label>
          <input name="placa" required className="input" placeholder="ABC-1234" />
        </div>
        <div className="form-group">
          <label className="label">Modelo</label>
          <input name="modelo" required className="input" />
        </div>
        <div className="form-group">
          <label className="label">Ano</label>
          <input name="ano" type="number" required className="input" />
        </div>
        <div className="form-group">
          <label className="label">Quilometragem Atual</label>
          <input name="km" type="number" required className="input" />
        </div>
        <button type="submit" className="button-primary">
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
    };

    return (
      <form onSubmit={handleSubmit} className="form">
        <div className="form-group">
          <label className="label">Nome Completo</label>
          <input name="nome" required className="input" />
        </div>
        <div className="form-group">
          <label className="label">CNH</label>
          <input name="cnh" required className="input" maxLength="11" />
        </div>
        <div className="form-group">
          <label className="label">Telefone</label>
          <input name="telefone" required className="input" placeholder="31 99999-9999" />
        </div>
        <button type="submit" className="button-primary">
          Cadastrar Motorista
        </button>
      </form>
    );
  };

  const FormManutencao = () => {
    const handleSubmit = (e) => {
      e.preventDefault();
      const novaManutencao = {
        id: manutencoes.length + 1,
        veiculoId: parseInt(e.target.veiculo.value),
        data: e.target.data.value,
        tipo: e.target.tipo.value,
        km: parseInt(e.target.km.value),
        descricao: e.target.descricao.value,
        gravidade: e.target.gravidade.value,
        status: 'Pendente'
      };
      setManutencoes([...manutencoes, novaManutencao]);
      setShowModal(null);
    };

    return (
      <form onSubmit={handleSubmit} className="form">
        <div className="form-group">
          <label className="label">Veículo</label>
          <select name="veiculo" required className="input">
            {veiculos.map(v => (
              <option key={v.id} value={v.id}>{v.placa} - {v.modelo}</option>
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
          <input name="km" type="number" required className="input" />
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
        <button type="submit" className="button-primary">
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
        arquivo: arquivo ? arquivo.name : 'documento.pdf',
        data: new Date().toISOString().split('T')[0]
      };
      setCtes([...ctes, novoCTE]);
      setShowModal(null);
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
          Anexar CT-e
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
            <div className="logo-circle">
              <Truck size={40} color="#000" />
            </div>
            <h1 className="login-title">Sistema de Logística</h1>
            <p className="login-subtitle">Gestão de Frota e Documentação</p>
          </div>
          <form onSubmit={handleLogin} className="login-form">
            <div className="form-group">
              <label className="label">Usuário</label>
              <input name="usuario" required className="input" placeholder="Digite seu usuário" />
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
            <p className="info-text">Motorista: motorista / 123</p>
            <p className="info-text">Assistente: assistente / 123</p>
            <p className="info-text">Gerente: gerente / 123</p>
          </div>
        </div>
      </div>
    );
  }

  const Dashboard = () => {
    const manutencoesUrgentes = manutencoes.filter(m => m.gravidade === 'Alta' || m.gravidade === 'Crítica').length;
    
    return (
      <div className="content">
        <h2 className="page-title">Dashboard</h2>
        <p className="page-subtitle">{currentUser.perfil}</p>
        
        <div className="stats-grid">
          <div className="stat-card border-yellow">
            <Truck size={32} color="#FFCC29" />
            <p className="stat-label">Veículos</p>
            <p className="stat-value">{veiculos.length}</p>
          </div>
          
          <div className="stat-card border-black">
            <Users size={32} color="#000" />
            <p className="stat-label">Motoristas</p>
            <p className="stat-value">{motoristas.length}</p>
          </div>
          
          <div className="stat-card border-red">
            <AlertTriangle size={32} color="#FF6B6B" />
            <p className="stat-label">Urgentes</p>
            <p className="stat-value">{manutencoesUrgentes}</p>
          </div>
          
          <div className="stat-card border-gray">
            <FileText size={32} color="#000000ff" />
            <p className="stat-label">CT-e</p>
            <p className="stat-value">{ctes.length}</p>
          </div>
        </div>

        <div className="card">
          <h3 className="card-title flex items-center">
            <Clock size={20} className="mr-2" />
            Manutenções Recentes
          </h3>
          <div className="list">
            {manutencoes.slice(-3).reverse().map(m => {
              const veiculo = veiculos.find(v => v.id === m.veiculoId);
              const badgeClass = m.gravidade === 'Crítica' ? 'badge-critical' :
                                 m.gravidade === 'Alta' ? 'badge-high' :
                                 m.gravidade === 'Média' ? 'badge-medium' : 'badge-low';
              return (
                <div key={m.id} className="list-item">
                  <div className="flex-1">
                    <p className="list-item-title">{veiculo?.placa} - {m.tipo}</p>
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
      </div>
    );
  };

  const Veiculos = () => (
    <div className="content">
      <div className="page-header">
        <div>
          <h2 className="page-title">Veículos</h2>
          <p className="page-subtitle">Gestão da frota</p>
        </div>
        {(currentUser.perfil === 'Gerente' || currentUser.perfil === 'Assistente') && (
          <button onClick={() => setShowModal('veiculo')} className="button-primary">
            <Plus size={18} className="mr-2" />
            Novo Veículo
          </button>
        )}
      </div>
      
      <div className="grid">
        {veiculos.map(v => (
          <div key={v.id} className="card border-yellow">
            <div className="card-header">
              <Truck size={24} color="#FFCC29" />
              <h3 className="card-title">{v.placa}</h3>
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

  const Motoristas = () => (
    <div className="content">
      <div className="page-header">
        <div>
          <h2 className="page-title">Motoristas</h2>
          <p className="page-subtitle">Equipe cadastrada</p>
        </div>
        {(currentUser.perfil === 'Gerente' || currentUser.perfil === 'Assistente') && (
          <button onClick={() => setShowModal('motorista')} className="button-primary">
            <Plus size={18} className="mr-2" />
            Novo Motorista
          </button>
        )}
      </div>
      
      <div className="grid">
        {motoristas.map(m => (
          <div key={m.id} className="card border-black">
            <div className="card-header">
              <Users size={24} color="#000" />
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

  const Manutencoes = () => (
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
      
      <div className="list">
        {manutencoes.map(m => {
          const veiculo = veiculos.find(v => v.id === m.veiculoId);
          const gravidadeClass = m.gravidade === 'Crítica' ? 'badge-critical' :
                                 m.gravidade === 'Alta' ? 'badge-high' :
                                 m.gravidade === 'Média' ? 'badge-medium' : 'badge-low';
          const statusClass = m.status === 'Concluída' ? 'badge-completed' : 'badge-pending';
          
          return (
            <div key={m.id} className="card">
              <div className="flex justify-between">
                <div className="flex-1">
                  <div className="card-header">
                    <Wrench size={20} color="#6B7280" />
                    <h3 className="card-title">{veiculo?.placa} - {m.tipo}</h3>
                  </div>
                  <div className="card-body">
                    <p className="info-row"><span className="info-label">Data:</span> {new Date(m.data).toLocaleDateString('pt-BR')}</p>
                    <p className="info-row"><span className="info-label">KM:</span> {m.km.toLocaleString()}</p>
                    <p className="info-row mt-2"><span className="info-label">Descrição:</span> {m.descricao}</p>
                  </div>
                </div>
                <div className="flex" style={{flexDirection: 'column', gap: '8px', alignItems: 'flex-end'}}>
                  <span className={`badge ${gravidadeClass}`}>
                    {m.gravidade}
                  </span>
                  <span className={`badge ${statusClass}`}>
                    {m.status}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  const CTes = () => (
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
      
      <div className="list">
        {ctes.map(c => {
          const motorista = motoristas.find(m => m.id === c.motoristaId);
          const veiculo = veiculos.find(v => v.id === c.veiculoId);
          return (
            <div key={c.id} className="card">
              <div className="card-header">
                <FileText size={20} color="#6B7280" />
                <h3 className="card-title">{c.numero}</h3>
              </div>
              <div className="card-body">
                <p className="info-row"><span className="info-label">Data:</span> {new Date(c.data).toLocaleDateString('pt-BR')}</p>
                <p className="info-row"><span className="info-label">Arquivo:</span> {c.arquivo}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="app">
      <header className="header">
        <div className="header-content">
          <div className="header-left">
            <div className="header-logo">
              <img src="sistema-logistica/src/logo.png" alt="Logo Avapex"></img>
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
          <button onClick={() => setActiveTab('dashboard')} className={activeTab === 'dashboard' ? 'nav-button-active' : 'nav-button'}>
            Dashboard
          </button>
          <button onClick={() => setActiveTab('veiculos')} className={activeTab === 'veiculos' ? 'nav-button-active' : 'nav-button'}>
            Veículos
          </button>
          <button onClick={() => setActiveTab('motoristas')} className={activeTab === 'motoristas' ? 'nav-button-active' : 'nav-button'}>
            Motoristas
          </button>
          <button onClick={() => setActiveTab('manutencoes')} className={activeTab === 'manutencoes' ? 'nav-button-active' : 'nav-button'}>
            Manutenções
          </button>
          <button onClick={() => setActiveTab('ctes')} className={activeTab === 'ctes' ? 'nav-button-active' : 'nav-button'}>
            CT-e
          </button>
        </div>
      </nav>

      <main className="main">
        {activeTab === 'dashboard' && <Dashboard />}
        {activeTab === 'veiculos' && <Veiculos />}
        {activeTab === 'motoristas' && <Motoristas />}
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