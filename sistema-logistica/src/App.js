import React, { useState, useEffect } from 'react';
import { Truck, FileText, Wrench, Users, Plus, LogOut, AlertTriangle, Clock, Bell } from 'lucide-react';
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
  const [filtros, setFiltros] = useState({ dataInicio: '', dataFim: '', placa: '', tipoManutencao: '' });
  const [editando, setEditando] = useState({ tipo: null, id: null, dados: null });
  const [historicoManutencao, setHistoricoManutencao] = useState([]);
  const [manutencaoSelecionada, setManutencaoSelecionada] = useState(null);
  const [mensagens, setMensagens] = useState([]);
  const [showMensagens, setShowMensagens] = useState(false);

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
        loadDashboardStats(),
        loadMensagens()
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

  // Carregar funcionários
  const loadDrivers = async () => {
    try {
      const response = await API.users.getAll();
      const funcionarios = (response.data.data || [])
        .filter(u => ['Motorista', 'Assistente', 'Gerente'].includes(u.perfil))
        .filter((user, index, array) => array.findIndex(u => u.id === user.id) === index); // Remove duplicatas
      setMotoristas(funcionarios);
    } catch (err) {
      console.error('Erro ao carregar funcionários:', err);
      setError('Erro ao carregar funcionários');
    }
  };

  // Carregar manutenções
  const loadMaintenances = async () => {
    try {
      const response = await API.maintenances.getAll();
      const manutencoesDados = response.data.data || [];
      console.log('Manutenções carregadas:', manutencoesDados.map(m => ({ id: m.id, em_andamento: m.em_andamento })));
      setManutencoes(manutencoesDados);
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

  // Carregar mensagens
  const loadMensagens = async () => {
    try {
      const response = await API.mensagens.getAll();
      setMensagens(response.data.data || []);
    } catch (err) {
      console.error('Erro ao carregar mensagens:', err);
    }
  };

  // Marcar mensagem como lida
  const marcarMensagemLida = async (id) => {
    try {
      await API.mensagens.markAsRead(id);
      setMensagens(prev => prev.map(m => m.id === id ? {...m, lida: true} : m));
    } catch (err) {
      console.error('Erro ao marcar mensagem como lida:', err);
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

  // Carregar histórico de manutenção
  const loadMaintenanceHistory = async (manutencaoId) => {
    try {
      const response = await API.maintenanceHistory.getHistory(manutencaoId);
      setHistoricoManutencao(response.data.data || []);
    } catch (err) {
      console.error('Erro ao carregar histórico:', err);
    }
  };

  // Enviar para manutenção
  const enviarParaManutencao = async (manutencaoId, tipoEnvio, contato) => {
    try {
      await API.maintenanceHistory.sendToMaintenance({
        manutencaoId,
        tipo_envio: tipoEnvio,
        contato
      });
      setHistoricoManutencao([]); // Limpar antes de recarregar
      await loadMaintenanceHistory(manutencaoId);
      await loadMaintenances(); // Recarregar lista de manutenções
      alert('Manutenção enviada com sucesso!');
    } catch (err) {
      alert('Erro ao enviar manutenção');
    }
  };

  // Atualizar status de etapa
  const atualizarStatusEtapa = async (etapaId, status, observacoes) => {
    try {
      await API.maintenanceHistory.updateStatus(etapaId, { status, observacoes });
      setHistoricoManutencao([]); // Limpar antes de recarregar
      await loadMaintenanceHistory(manutencaoSelecionada.id);
      alert('Status atualizado!');
    } catch (err) {
      alert('Erro ao atualizar status');
    }
  };

  // Ver detalhes da manutenção
  const verDetalhesManutencao = async (manutencao) => {
    setManutencaoSelecionada(manutencao);
    setHistoricoManutencao([]); // Limpar histórico anterior
    await loadMaintenanceHistory(manutencao.id);
    setShowModal('detalhes-manutencao');
  };

  // Excluir manutenção
  const excluirManutencao = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir esta manutenção?')) {
      try {
        console.log('Tentando excluir manutenção com ID:', id);
        const response = await API.maintenances.delete(id);
        console.log('Resposta da exclusão manutenção:', response);
        await loadMaintenances();
        alert('Manutenção excluída com sucesso!');
      } catch (err) {
        console.error('Erro completo ao excluir manutenção:', err);
        console.error('Response do erro:', err.response);
        const errorInfo = handleAPIError(err);
        alert('Erro ao excluir manutenção: ' + errorInfo.message);
      }
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

  // Excluir CT-e
  const excluirCte = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir este CT-e?')) {
      try {
        console.log('Tentando excluir CT-e com ID:', id);
        const response = await API.ctes.delete(id);
        console.log('Resposta da exclusão CT-e:', response);
        await loadCtes();
        alert('CT-e excluído com sucesso!');
      } catch (err) {
        console.error('Erro completo ao excluir CT-e:', err);
        console.error('Response do erro:', err.response);
        const errorInfo = handleAPIError(err);
        alert('Erro ao excluir CT-e: ' + errorInfo.message);
      }
    }
  };

  // Excluir veículo
  const excluirVeiculo = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir este veículo?')) {
      try {
        console.log('Tentando excluir veículo com ID:', id);
        const response = await API.vehicles.delete(id);
        console.log('Resposta da exclusão veículo:', response);
        await loadVehicles();
        alert('Veículo excluído com sucesso!');
      } catch (err) {
        console.error('Erro completo ao excluir veículo:', err);
        console.error('Response do erro:', err.response);
        const errorInfo = handleAPIError(err);
        alert('Erro ao excluir veículo: ' + errorInfo.message);
      }
    }
  };

  // Excluir funcionário
  const excluirMotorista = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir este funcionário?')) {
      try {
        console.log('Tentando excluir funcionário com ID:', id);
        const response = await API.users.delete(id);
        console.log('Resposta da exclusão:', response);
        await loadDrivers();
        alert('Funcionário excluído com sucesso!');
      } catch (err) {
        console.error('Erro completo ao excluir funcionário:', err);
        console.error('Response do erro:', err.response);
        const errorInfo = handleAPIError(err);
        alert('Erro ao excluir funcionário: ' + errorInfo.message);
      }
    }
  };

  // Editar veículo
  const editarVeiculo = (veiculo) => {
    setEditando({ tipo: 'veiculo', id: veiculo.id, dados: veiculo });
    setShowModal('veiculo');
  };

  // Editar motorista
  const editarMotorista = (motorista) => {
    setEditando({ tipo: 'motorista', id: motorista.id, dados: motorista });
    setShowModal('motorista');
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
    const isEditing = editando.tipo === 'veiculo';
    
    const handleSubmit = async (e) => {
      e.preventDefault();
      setLoading(true);

      try {
        const data = {
          tipo: e.target.tipo.value.trim(),
          frota: e.target.frota.value.trim(),
          placa: e.target.placa.value.trim().toUpperCase(),
          modelo: e.target.modelo.value.trim(),
          ano: parseInt(e.target.ano.value),
          km_atual: parseInt(e.target.km.value) || 0
        };
        
        // Validações básicas no frontend
        if (!data.tipo || !data.frota || !data.placa || !data.modelo || !data.ano) {
          alert('Todos os campos são obrigatórios');
          return;
        }
        
        if (data.ano < 1900 || data.ano > 2030) {
          alert('Ano deve estar entre 1900 e 2030');
          return;
        }
        
        if (data.km_atual < 0) {
          alert('Quilometragem não pode ser negativa');
          return;
        }

        console.log('Dados do veículo:', data);

        if (isEditing) {
          await API.vehicles.update(editando.id, data);
          alert('Veículo atualizado com sucesso!');
        } else {
          await API.vehicles.create(data);
          alert('Veículo cadastrado com sucesso!');
        }
        
        await loadVehicles();
        setShowModal(null);
        setEditando({ tipo: null, id: null, dados: null });

      } catch (err) {
        console.error('Erro completo:', err);
        console.error('Response:', err.response);
        console.error('Response data:', err.response?.data);
        
        let errorMessage = 'Erro ao processar requisição';
        
        if (err.response?.data?.message) {
          errorMessage = err.response.data.message;
        } else if (err.response?.data?.errors && Array.isArray(err.response.data.errors)) {
          errorMessage = err.response.data.errors.map(e => e.msg || e.message || e).join(', ');
        } else if (err.response?.status === 400) {
          errorMessage = 'Dados inválidos. Verifique os campos preenchidos.';
        } else if (err.response?.status === 409) {
          errorMessage = 'Número da frota já existe. Use outro número.';
        } else if (err.message) {
          errorMessage = err.message;
        }
        
        alert(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    return (
      <form onSubmit={handleSubmit} className="form">
        <div className="form-group">
          <label className="label">Tipo</label>
          <select name="tipo" required className="input" defaultValue={editando.dados?.tipo}>
            <option value="Truck">Truck</option>
            <option value="Cavalo">Cavalo</option>
            <option value="Carreta">Carreta</option>
            <option value="Veiculos Leves">Veiculos Leves</option>
          </select>
        </div>
        <div className="form-group">
          <label className="label">Número da Frota</label>
          <input name="frota" required className="input" placeholder="S-001" defaultValue={editando.dados?.frota} />
        </div>
        <div className="form-group">
          <label className="label">Placa</label>
          <input name="placa" required className="input" placeholder="ABC-1234" defaultValue={editando.dados?.placa} />
        </div>
        <div className="form-group">
          <label className="label">Modelo</label>
          <input name="modelo" required className="input" defaultValue={editando.dados?.modelo} />
        </div>
        <div className="form-group">
          <label className="label">Ano</label>
          <input name="ano" type="number" required className="input" min="1900" defaultValue={editando.dados?.ano} />
        </div>
        <div className="form-group">
          <label className="label">Quilometragem Atual</label>
          <input name="km" type="number" required className="input" min="0" defaultValue={editando.dados?.km_atual} />
        </div>
        <button type="submit" className="button-primary" disabled={loading}>
          {loading ? (isEditing ? 'Atualizando...' : 'Cadastrando...') : (isEditing ? 'Atualizar Veículo' : 'Cadastrar Veículo')}
        </button>
      </form>
    );
  };

  // Form Motorista (Registro de usuário)
  const FormMotorista = () => {
    const isEditing = editando.tipo === 'motorista';
    
    const handleSubmit = async (e) => {
      e.preventDefault();
      setLoading(true);

      try {
        const data = {
          nome: e.target.nome.value,
          matricula: e.target.matricula.value,
          perfil: e.target.perfil.value,
          telefone: e.target.telefone.value
        };
        
        if (e.target.senha.value) {
          data.senha = e.target.senha.value;
        }

        if (isEditing) {
          await API.users.update(editando.id, data);
          alert('Funcionário atualizado com sucesso!');
        } else {
          data.senha = e.target.senha.value;
          await API.users.create(data);
          alert('Funcionário cadastrado com sucesso!');
        }
        
        await loadDrivers();
        setShowModal(null);
        setEditando({ tipo: null, id: null, dados: null });

      } catch (err) {
        console.error('Erro completo no cadastro de funcionário:', err);
        console.error('Response:', err.response);
        console.error('Response data:', err.response?.data);
        
        const errorInfo = handleAPIError(err);
        alert('Erro ao cadastrar funcionário: ' + errorInfo.message);
      } finally {
        setLoading(false);
      }
    };

    return (
      <form onSubmit={handleSubmit} className="form">
        <div className="form-group">
          <label className="label">Nome Completo</label>
          <input name="nome" required className="input" defaultValue={editando.dados?.nome} />
        </div>
        <div className="form-group">
          <label className="label">Matrícula</label>
          <input name="matricula" required className="input" minLength="3" placeholder="Ex: 001" defaultValue={editando.dados?.matricula} />
        </div>
        <div className="form-group">
          <label className="label">Função</label>
          <select name="perfil" required className="input" defaultValue={editando.dados?.perfil}>
            <option value="Motorista">Motorista</option>
            <option value="Assistente">Assistente</option>
            <option value="Gerente">Gerente</option>
          </select>
        </div>
        <div className="form-group">
          <label className="label">Senha {isEditing && '(deixe vazio para manter atual)'}</label>
          <input name="senha" type="password" required={!isEditing} className="input" minLength="3" />
        </div>
        <div className="form-group">
          <label className="label">Telefone</label>
          <input name="telefone" required className="input" placeholder="31 99999-9999" defaultValue={editando.dados?.telefone} />
        </div>
        <button type="submit" className="button-primary" disabled={loading}>
          {loading ? (isEditing ? 'Atualizando...' : 'Cadastrando...') : (isEditing ? 'Atualizar Funcionário' : 'Cadastrar Funcionário')}
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
          gravidade: e.target.gravidade.value,
          em_andamento: false
        };

        await API.maintenances.create(data);
        await loadMaintenances();
        await loadVehicles();
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
              <option key={v.id} value={v.id}>{v.placa} - {v.frota}</option>
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

  // Form Enviar para Manutenção
  const FormEnviarManutencao = () => {
    const [tipoEnvio, setTipoEnvio] = useState('Email');
    
    const handleSubmit = async (e) => {
      e.preventDefault();
      let contato;
      
      if (tipoEnvio === 'Email') {
        contato = 'thiagomarcell88@gmail.com'; // Email padrão do setor
      } else {
        contato = e.target.contato.value;
      }
      
      await enviarParaManutencao(manutencaoSelecionada.id, tipoEnvio, contato);
      setShowModal(null);
    };

    return (
      <form onSubmit={handleSubmit} className="form">
        <div className="form-group">
          <label className="label">Tipo de Envio</label>
          <select 
            name="tipo" 
            required 
            className="input" 
            value={tipoEnvio}
            onChange={(e) => setTipoEnvio(e.target.value)}
          >
            <option value="Email">Email (Setor de Manutenção)</option>
            <option value="WhatsApp">WhatsApp</option>
          </select>
        </div>
        {tipoEnvio !== 'Email' && (
          <div className="form-group">
            <label className="label">Contato/Destino</label>
            <input 
              name="contato" 
              required 
              className="input" 
              placeholder="Contato do destinatário"
            />
          </div>
        )}
        {tipoEnvio === 'Email' && (
          <div style={{padding: '10px', backgroundColor: '#e3f2fd', borderRadius: '8px', marginBottom: '15px'}}>
            <p style={{margin: 0, fontSize: '14px'}}>
              📧 Será enviado para: <strong>thiagomarcell88@gmail.com</strong>
            </p>
          </div>
        )}
        <button type="submit" className="button-primary">
          Enviar para Manutenção
        </button>
      </form>
    );
  };

  // Modal Detalhes da Manutenção
  const DetalhesManutencao = () => {
    return (
      <div className="form">
        <div className="card" style={{marginBottom: '1px', backgroundColor: '#f8f9fa', border: '1px solid #dee2e6'}}>
          <h4 style={{color: '#ffcc29', marginBottom: '20px',}}>Informações da Manutenção</h4>
          <p style={{color: 'white', fontSize: '14px'}}><strong style={{color: 'white'}}>Veículo:</strong> {manutencaoSelecionada?.veiculo?.placa}</p>
          <p style={{color: 'white', fontSize: '14px'}}><strong style={{color: 'white'}}>Tipo:</strong> {manutencaoSelecionada?.tipo}</p>
          <p style={{color: 'white', fontSize: '14px'}}><strong style={{color: 'white'}}>Descrição:</strong> {manutencaoSelecionada?.descricao}</p>
          <p style={{color: 'white', fontSize: '14px'}}><strong style={{color: 'white'}}>Gravidade:</strong> 
            <span style={{
              padding: '4px 8px',
              borderRadius: '4px',
              marginLeft: '8px',
              fontWeight: 'bold',
              color: 'white',
              backgroundColor: manutencaoSelecionada?.gravidade === 'Crítica' ? '#dc3545' :
                              manutencaoSelecionada?.gravidade === 'Alta' ? '#fd7e14' :
                              manutencaoSelecionada?.gravidade === 'Média' ? '#ffc107' : '#28a745'
            }}>
              {manutencaoSelecionada?.gravidade}
            </span>
          </p>
        </div>

        {['Assistente', 'Gerente'].includes(currentUser.perfil) && historicoManutencao.length === 0 && (
          <button 
            onClick={() => setShowModal('enviar-manutencao')} 
            className="button-primary" 
            style={{marginBottom: '20px'}}
          >
            Enviar para Manutenção
          </button>
        )}

        <h4 style={{color: '#ffcc29', marginBottom: '15px'}}>Histórico de Etapas</h4>
        {historicoManutencao.length === 0 ? (
          <p style={{color: '#ffcc29', fontStyle: 'italic'}}>Nenhuma etapa registrada ainda.</p>
        ) : (
          <div className="list">
            {historicoManutencao.map((etapa, index) => (
              <div key={etapa.id} style={{
                padding: '12px',
                marginBottom: '8px',
                backgroundColor: etapa.status === 'Concluída' ? '#155724' : '#856404',
                border: `2px solid ${etapa.status === 'Concluída' ? '#28a745' : '#ffc107'}`,
                borderRadius: '6px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div style={{flex: 1}}>
                  <h6 style={{color: 'white', margin: '0 0 4px 0', fontSize: '14px', fontWeight: 'bold'}}>{etapa.etapa}</h6>
                  <p style={{color: 'white', margin: 0, fontSize: '12px'}}>{etapa.descricao}</p>
                </div>
                <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                  <span style={{
                    padding: '4px 8px',
                    borderRadius: '12px',
                    fontSize: '10px',
                    fontWeight: 'bold',
                    color: 'white',
                    backgroundColor: etapa.status === 'Concluída' ? '#28a745' : '#ffc107'
                  }}>
                    {etapa.status === 'Concluída' ? '✓' : '⏳'}
                  </span>
                  {['Assistente', 'Gerente'].includes(currentUser.perfil) && etapa.status === 'Pendente' && (
                    <button 
                      onClick={() => atualizarStatusEtapa(etapa.id, 'Concluída', '')}
                      style={{
                        fontSize: '10px', 
                        padding: '4px 8px', 
                        backgroundColor: '#28a745',
                        border: 'none',
                        borderRadius: '4px',
                        color: 'white',
                        cursor: 'pointer'
                      }}
                    >
                      Concluir
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
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
          <label className="label">Arquivo CT-e</label>
          <input name="arquivo" type="file" accept=".pdf,.jpg,.jpeg,.png" required className="input" />
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

  const ModalMensagens = () => (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h3 className="modal-title">Mensagens</h3>
          <button onClick={() => setShowMensagens(false)} className="close-button">×</button>
        </div>
        <div className="form">
          {mensagens.length === 0 ? (
            <p style={{color: '#9ca3af', textAlign: 'center', padding: '20px'}}>Nenhuma mensagem</p>
          ) : (
            <div style={{maxHeight: '400px', overflowY: 'auto'}}>
              {mensagens.map(msg => (
                <div key={msg.id} style={{
                  padding: '12px',
                  marginBottom: '8px',
                  backgroundColor: msg.lida ? '#1a2332' : '#2a3542',
                  border: `1px solid ${msg.lida ? '#4d4637' : '#FFCC29'}`,
                  borderRadius: '8px'
                }}>
                  <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start'}}>
                    <div style={{flex: 1}}>
                      <h4 style={{color: '#FFCC29', margin: '0 0 4px 0', fontSize: '14px'}}>{msg.titulo}</h4>
                      <p style={{color: '#d1d5db', margin: '0 0 8px 0', fontSize: '13px'}}>{msg.mensagem}</p>
                      <span style={{color: '#9ca3af', fontSize: '11px'}}>
                        {new Date(msg.createdAt).toLocaleString('pt-BR')}
                      </span>
                    </div>
                    {!msg.lida && (
                      <button 
                        onClick={() => marcarMensagemLida(msg.id)}
                        style={{
                          backgroundColor: '#FFCC29',
                          color: '#111822',
                          border: 'none',
                          borderRadius: '4px',
                          padding: '4px 8px',
                          fontSize: '10px',
                          cursor: 'pointer'
                        }}
                      >
                        Marcar como lida
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  if (!currentUser) {
    return (
      <div className="login-container">
        <div className="login-box">
          <div className="login-header">
            <img src="/logo.png" alt="Logo" style={{height: '80px', width: 'auto', marginBottom: '20px', display: 'block', margin: '0 auto 20px auto'}} />
            <h1 className="login-title">Sistema Logistica</h1>
            <p className="login-subtitle">Manutenções e Comprovantes</p>
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

      <div className="stats-grid">
        <div className="stat-card border-yellow">
          <Truck size={32} color="#FFCC29" />
          <p className="stat-label">Veículos Cadastrados</p>
          <p className="stat-value">{dashboardStats?.veiculos?.total || veiculos.length}</p>
        </div>
        
        <div className="stat-card border-black">
          <Users size={32} color="#000" />
          <p className="stat-label">Funcionários Cadastrados</p>
          <p className="stat-value">{dashboardStats?.funcionarios?.total || motoristas.length}</p>
        </div>
        
        <div className="stat-card border-red">
          <AlertTriangle size={32} color="#FF6B6B" />
          <p className="stat-label">Manutenções Urgentes</p>
          <p className="stat-value">{dashboardStats?.manutencoes?.urgentes || 0}</p>
        </div>
        
        <div className="stat-card border-gray">
          <FileText size={32} color="#000000ff" />
          <p className="stat-label">Comprovantes Anexados</p>
          <p className="stat-value">{dashboardStats?.ctes?.mes_atual || ctes.length}</p>
        </div>
      </div>

      <div className="dashboard-cards">
        <div className="dashboard-card">
          <div className="card-header">
            <Clock size={24} color="#FF6B6B" />
            <h3 className="card-title">Manutenções Recentes</h3>
          </div>
          <div className="card-body">
            <div className="maintenance-list">
              {manutencoes.filter(m => m.status !== 'Concluída').slice(0, 5).map(m => (
                <div key={m.id} className="maintenance-item">
                  <div className="maintenance-info">
                    <span className="maintenance-vehicle">{m.veiculo?.placa}</span>
                    <span className="maintenance-type">{m.tipo}</span>
                    <span className="maintenance-date">{new Date(m.data_programada).toLocaleDateString('pt-BR')}</span>
                  </div>
                  <span className={`severity-badge severity-${m.gravidade?.toLowerCase()}`}>
                    {m.gravidade}
                  </span>
                </div>
              ))}
              {manutencoes.filter(m => m.status !== 'Concluída').length === 0 && (
                <div className="empty-state">
                  <p>Nenhuma manutenção pendente</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="dashboard-card">
          <div className="card-header">
            <FileText size={24} color="#22C55E" />
            <h3 className="card-title">Documentos Anexados</h3>
          </div>
          <div className="card-body">
            <div className="documents-list">
              {ctes.filter(c => c.status !== 'Concluído').slice(0, 5).map(c => (
                <div key={c.id} className="document-item">
                  <div className="document-info">
                    <span className="document-number">{c.numero}</span>
                    <span className="document-date">{new Date(c.data_emissao).toLocaleDateString('pt-BR')}</span>
                    <span className="document-file">{c.arquivo_nome}</span>
                  </div>
                  <span className="status-badge status-active">
                    Ativo
                  </span>
                </div>
              ))}
              {ctes.filter(c => c.status !== 'Concluído').length === 0 && (
                <div className="empty-state">
                  <p>Nenhum documento ativo</p>
                </div>
              )}
            </div>
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
          <p className="page-subtitle">Cadastro de Veículos</p>
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
              {['Assistente', 'Gerente'].includes(currentUser.perfil) && (
                <div style={{display: 'flex', gap: '8px', marginTop: '10px'}}>
                  <button 
                    onClick={() => editarVeiculo(v)} 
                    className="button-primary" 
                    style={{backgroundColor: '#3B82F6', fontSize: '12px', padding: '4px 8px'}}
                  >
                    Modificar
                  </button>
                  <button 
                    onClick={() => excluirVeiculo(v.id)} 
                    className="button-primary" 
                    style={{backgroundColor: '#EF4444', fontSize: '12px', padding: '4px 8px'}}
                  >
                    Excluir
                  </button>
                </div>
              )}
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
          <h2 className="page-title">Funcionários</h2>
          <p className="page-subtitle">Cadastro de funcionários</p>
        </div>
        {['Gerente', 'Assistente'].includes(currentUser.perfil) && (
          <button onClick={() => { setEditando({ tipo: null, id: null, dados: null }); setShowModal('motorista'); }} className="button-primary">
            <Plus size={18} className="mr-2" />
            Novo Funcionário
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
              <p className="info-row"><span className="info-label">Função:</span> {m.perfil}</p>
              <p className="info-row"><span className="info-label">Telefone:</span> {m.telefone}</p>
              {['Assistente', 'Gerente'].includes(currentUser.perfil) && (
                <div style={{display: 'flex', gap: '8px', marginTop: '10px'}}>
                  <button 
                    onClick={() => editarMotorista(m)} 
                    className="button-primary" 
                    style={{backgroundColor: '#3B82F6', fontSize: '12px', padding: '4px 8px'}}
                  >
                    Modificar
                  </button>
                  <button 
                    onClick={() => excluirMotorista(m.id)} 
                    className="button-primary" 
                    style={{backgroundColor: '#EF4444', fontSize: '12px', padding: '4px 8px'}}
                  >
                    Excluir
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const Manutencoes = () => {
    const filtrarManutencoes = (status) => {
      let dados;
      
      if (status === 'pendentes') {
        dados = manutencoes.filter(m => m.status !== 'Concluída' && !m.em_andamento);
      } else if (status === 'andamento') {
        dados = manutencoes.filter(m => m.status !== 'Concluída' && m.em_andamento);
      } else {
        dados = manutencoes.filter(m => m.status === 'Concluída');
      }
      
      if (filtros.dataInicio || filtros.dataFim || filtros.placa || filtros.tipoManutencao) {
        dados = dados.filter(item => {
          const dataItem = new Date(item.data_programada);
          const dataInicio = filtros.dataInicio ? new Date(filtros.dataInicio) : null;
          const dataFim = filtros.dataFim ? new Date(filtros.dataFim) : null;
          
          const passaData = (!dataInicio || dataItem >= dataInicio) && (!dataFim || dataItem <= dataFim);
          const passaPlaca = !filtros.placa || item.veiculo?.placa === filtros.placa;
          const passaTipo = !filtros.tipoManutencao || item.tipo === filtros.tipoManutencao;
          
          return passaData && passaPlaca && passaTipo;
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
        
        {['Assistente', 'Gerente'].includes(currentUser.perfil) && (
          <div className="sub-tabs" style={{marginBottom: '20px'}}>
            <button 
              onClick={() => setSubTab({...subTab, manutencoes: 'pendentes'})} 
              className={subTab.manutencoes === 'pendentes' ? 'nav-button-active' : 'nav-button'}
            >
              Pendentes
            </button>
            <button 
              onClick={() => setSubTab({...subTab, manutencoes: 'andamento'})} 
              className={subTab.manutencoes === 'andamento' ? 'nav-button-active' : 'nav-button'}
            >
              Em Andamento
            </button>
            <button 
              onClick={() => setSubTab({...subTab, manutencoes: 'concluidas'})} 
              className={subTab.manutencoes === 'concluidas' ? 'nav-button-active' : 'nav-button'}
            >
              Concluídas
            </button>
          </div>
        )}

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
                <select 
                  value={filtros.placa}
                  onChange={(e) => setFiltros({...filtros, placa: e.target.value})}
                  className="input" 
                  style={{flex: '1', minWidth: '150px'}}
                >
                  <option value="">Todas as placas</option>
                  {veiculos.filter(v => v.ativo).map(v => (
                    <option key={v.id} value={v.placa}>{v.placa} - {v.modelo}</option>
                  ))}
                </select>
                <select 
                  value={filtros.tipoManutencao}
                  onChange={(e) => setFiltros({...filtros, tipoManutencao: e.target.value})}
                  className="input" 
                  style={{flex: '1', minWidth: '150px'}}
                >
                  <option value="">Todos os tipos</option>
                  <option value="Preventiva">Preventiva</option>
                  <option value="Corretiva">Corretiva</option>
                  <option value="Preditiva">Preditiva</option>
                </select>
                <button 
                  onClick={() => setFiltros({ dataInicio: '', dataFim: '', placa: '', tipoManutencao: '' })}
                  className="button-primary" 
                  style={{backgroundColor: '#6B7280', minWidth: '100px'}}
                >
                  Limpar
                </button>
              </div>
            </div>
          </div>
        )}
        
        <div className="list">
          {filtrarManutencoes(currentUser.perfil === 'Motorista' ? 'pendentes' : subTab.manutencoes).map(m => {
            const gravidadeClass = m.gravidade === 'Crítica' ? 'badge-critical' :
                                   m.gravidade === 'Alta' ? 'badge-high' :
                                   m.gravidade === 'Média' ? 'badge-medium' : 'badge-low';
            const statusClass = m.status === 'Concluída' ? 'badge-completed' : 'badge-pending';
            
            return (
              <div key={m.id} className="card">
                {/* Badges no topo */}
                <div style={{display: 'flex', gap: '10px', marginBottom: '15px'}}>
                  <span className={`badge ${gravidadeClass}`}>{m.gravidade}</span>
                  <span className={`badge ${statusClass}`}>{m.status}</span>
                </div>
                
                {/* Conteúdo principal */}
                <div className="card-header">
                  <Wrench size={20} color={m.status === 'Concluída' ? "#22C55E" : "#6B7280"} />
                  <h3 className="card-title">{m.veiculo?.placa} - {m.tipo}</h3>
                </div>
                <div className="card-body">
                  <p className="info-row"><span className="info-label">Data:</span> {new Date(m.data_programada).toLocaleDateString('pt-BR')}</p>
                  <p className="info-row"><span className="info-label">KM:</span> {m.km_manutencao?.toLocaleString()}</p>
                  <p className="info-row mt-2"><span className="info-label">Descrição:</span> {m.descricao}</p>
                </div>
                
                {/* Botões na parte inferior */}
                <div style={{display: 'flex', gap: '8px', marginTop: '15px', justifyContent: 'flex-end'}}>
                  {['Assistente', 'Gerente'].includes(currentUser.perfil) && (
                    <button 
                      onClick={() => excluirManutencao(m.id)} 
                      className="button-primary" 
                      style={{fontSize: '12px', padding: '4px 8px', backgroundColor: '#EF4444'}}
                    >
                      Excluir
                    </button>
                  )}
                  <button 
                    onClick={() => verDetalhesManutencao(m)} 
                    className="button-primary" 
                    style={{fontSize: '12px', padding: '4px 8px', backgroundColor: '#3B82F6'}}
                  >
                    Detalhes
                  </button>
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
            <p className="page-subtitle">Comprovantes de Entrega</p>
          </div>
          <button onClick={() => setShowModal('cte')} className="button-primary">
            <Plus size={18} className="mr-2" />
            Novo CT-e
          </button>
        </div>
        
        {['Assistente', 'Gerente'].includes(currentUser.perfil) && (
          <div className="sub-tabs" style={{marginBottom: '20px'}}>
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
        )}

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
                  placeholder="Buscar Comprovante" 
                  value={filtros.pesquisa}
                  onChange={(e) => setFiltros({...filtros, pesquisa: e.target.value})}
                  className="input" 
                  style={{flex: '1', minWidth: '150px'}}
                />
              </div>
            </div>
          </div>
        )}
        
        <div className="list">
          {filtrarCtes(currentUser.perfil === 'Motorista' ? 'ativos' : subTab.ctes).map(c => (
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
                    <button 
                      onClick={() => excluirCte(c.id)} 
                      className="button-primary" 
                      style={{fontSize: '12px', padding: '4px 8px', backgroundColor: '#EF4444'}}
                    >
                      Excluir
                    </button>
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
            <div className="header-logo" style={{display: 'flex', alignItems: 'center'}}>
              <img src="logoblack-removebg-preview.png" alt="Logo" style={{height: '35px', width: 'auto', display: 'block'}} />
            </div>
            <div>
              <h1 className="header-title">Avapex System</h1>
              <p className="header-subtitle">{currentUser.nome} · {currentUser.matricula}</p>
            </div>
          </div>
          <div style={{display: 'flex', gap: '10px', alignItems: 'center'}}>
            <button onClick={() => setShowMensagens(true)} className="button-logout" style={{position: 'relative'}}>
              <Bell size={18} />
              {mensagens.filter(m => !m.lida).length > 0 && (
                <span style={{
                  position: 'absolute',
                  top: '-5px',
                  right: '-5px',
                  backgroundColor: '#EF4444',
                  color: 'white',
                  borderRadius: '50%',
                  width: '18px',
                  height: '18px',
                  fontSize: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {mensagens.filter(m => !m.lida).length}
                </span>
              )}
            </button>
            <button onClick={handleLogout} className="button-logout">
              <LogOut size={18} className="mr-2" />
              Sair
            </button>
          </div>
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
              Funcionários
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
        <Modal title={editando.tipo === 'veiculo' ? 'Modificar Veículo' : 'Cadastrar Novo Veículo'}>
          <FormVeiculo />
        </Modal>
      )}

      {showModal === 'motorista' && (
        <Modal title={editando.tipo === 'motorista' ? 'Modificar Funcionário' : 'Cadastrar Novo Funcionário'}>
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

      {showModal === 'detalhes-manutencao' && (
        <Modal title="Detalhes da Manutenção">
          <DetalhesManutencao />
        </Modal>
      )}

      {showModal === 'enviar-manutencao' && (
        <Modal title="Enviar para Manutenção">
          <FormEnviarManutencao />
        </Modal>
      )}

      {showMensagens && <ModalMensagens />}
    </div>
  );
};

export default SistemaLogistica;