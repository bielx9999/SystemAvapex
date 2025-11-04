import axios from 'axios';

// Configuração base da API
const api = axios.create({
    baseURL: process.env.REACT_APP_API_URL || 'http://localhost:3001/api',
    timeout: 30000,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Interceptor para adicionar token de autenticação
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Interceptor para tratamento de erros
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response) {
            console.error('Erro na resposta:', error.response.data);
            
            if (error.response.status === 401) {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                window.location.href = '/';
            }
        } else if (error.request) {
            console.error('Erro na requisição:', error.request);
        } else {
            console.error('Erro:', error.message);
        }
        return Promise.reject(error);
    }
);

// ===================== AUTENTICAÇÃO =====================
export const authAPI = {
    // Login
    login: (matricula, senha) => 
        api.post('/auth/login', { matricula, senha }),
    
    // Registrar novo usuário
    register: (dados) => 
        api.post('/auth/register', dados),
    
    // Listar todos os usuários
    getUsers: () => 
        api.get('/users')
};

// ===================== VEÍCULOS =====================
export const vehiclesAPI = {
    // Listar todos os veículos
    getAll: () => 
        api.get('/vehicles'),
    
    // Buscar veículo por ID
    getById: (id) => 
        api.get(`/vehicles/${id}`),
    
    // Criar novo veículo
    create: (dados) => 
        api.post('/vehicles', dados),
    
    // Atualizar veículo
    update: (id, dados) => 
        api.put(`/vehicles/${id}`, dados),
    
    // Deletar veículo
    delete: (id) => 
        api.delete(`/vehicles/${id}`)
};

// ===================== USUÁRIOS/MOTORISTAS =====================
export const usersAPI = {
    // Listar todos os usuários
    getAll: () => 
        api.get('/users'),
    
    // Buscar usuário por ID
    getById: (id) => 
        api.get(`/users/${id}`),
    
    // Criar novo usuário (via auth/register)
    create: (dados) => 
        api.post('/auth/register', dados),
    
    // Atualizar usuário
    update: (id, dados) => 
        api.put(`/users/${id}`, dados),
    
    // Deletar usuário
    delete: (id) => 
        api.delete(`/users/${id}`)
};

// ===================== MANUTENÇÕES =====================
export const maintenancesAPI = {
    // Listar todas as manutenções
    getAll: () => 
        api.get('/maintenances'),
    
    // Buscar manutenção por ID
    getById: (id) => 
        api.get(`/maintenances/${id}`),
    
    // Buscar manutenções por veículo
    getByVehicle: (vehicleId) => 
        api.get(`/maintenances/vehicle/${vehicleId}`),
    
    // Criar nova manutenção
    create: (dados) => {
        if (dados instanceof FormData) {
            return api.post('/maintenances', dados);
        }
        return api.post('/maintenances', dados);
    },
    
    // Atualizar manutenção completa
    update: (id, dados) => 
        api.put(`/maintenances/${id}`, dados),
    
    // Atualizar apenas o status
    updateStatus: (id, status) => 
        api.put(`/maintenances/${id}/status`, { status }),
    
    // Deletar manutenção
    delete: (id) => 
        api.delete(`/maintenances/${id}`)
};

// ===================== CT-e =====================
export const ctesAPI = {
    // Listar todos os CT-e
    getAll: () => 
        api.get('/ctes'),
    
    // Buscar CT-e por ID
    getById: (id) => 
        api.get(`/ctes/${id}`),
    
    // Criar novo CT-e com upload de arquivo
    create: (formData) => 
        api.post('/ctes', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        }),
    
    // Atualizar CT-e
    update: (id, dados) => 
        api.put(`/ctes/${id}`, dados),
    
    // Deletar CT-e
    delete: (id) => 
        api.delete(`/ctes/${id}`),
    
    // Download de arquivo CT-e
    download: (id) => 
        api.get(`/ctes/${id}/download`, { 
            responseType: 'blob' 
        })
};

// ===================== DASHBOARD =====================
export const dashboardAPI = {
    // Estatísticas gerais
    getStats: () => 
        api.get('/dashboard/stats')
};

// ===================== HISTÓRICO DE MANUTENÇÕES =====================
export const maintenanceHistoryAPI = {
    // Listar histórico de uma manutenção
    getHistory: (manutencaoId) => 
        api.get(`/maintenance-history/${manutencaoId}`),
    
    // Criar etapa no histórico
    create: (dados) => 
        api.post('/maintenance-history', dados),
    
    // Atualizar status de uma etapa
    updateStatus: (id, dados) => 
        api.put(`/maintenance-history/${id}/status`, dados),
    
    // Enviar para manutenção
    sendToMaintenance: (dados) => 
        api.post('/maintenance-history/send-maintenance', dados)
};

// ===================== FUNÇÕES AUXILIARES =====================

// Função para tratar erros de forma padronizada
export const handleAPIError = (error) => {
    if (error.response) {
        // Erro retornado pelo servidor
        const errorMessage = error.response.data.message || 
                            error.response.data.error || 
                            (error.response.data.errors ? error.response.data.errors.map(e => e.msg || e.message).join(', ') : '') ||
                            'Erro ao processar requisição';
        return {
            success: false,
            message: errorMessage,
            status: error.response.status
        };
    } else if (error.request) {
        // Erro de conexão
        return {
            success: false,
            message: 'Erro de conexão com o servidor. Verifique sua internet.',
            status: 0
        };
    } else {
        // Erro desconhecido
        return {
            success: false,
            message: 'Erro desconhecido: ' + error.message,
            status: -1
        };
    }
};

// Função para formatar dados de formulário para upload
export const createFormData = (data) => {
    const formData = new FormData();
    
    Object.keys(data).forEach(key => {
        if (data[key] !== null && data[key] !== undefined) {
            formData.append(key, data[key]);
        }
    });
    
    return formData;
};

// Função para download de arquivos
export const downloadFile = async (id, filename) => {
    try {
        const response = await ctesAPI.download(id);
        
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', filename);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
        
        return { success: true };
    } catch (error) {
        return handleAPIError(error);
    }
};

// Função para verificar saúde da API
export const checkHealth = () => api.get('/health', { baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000' });

// ===================== MENSAGENS =====================
export const mensagensAPI = {
    // Listar mensagens do usuário
    getAll: () => 
        api.get('/mensagens'),
    
    // Marcar mensagem como lida
    markAsRead: (id) => 
        api.put(`/mensagens/${id}/read`)
};

// Exportar APIs organizadas
export const API = {
    auth: authAPI,
    vehicles: vehiclesAPI,
    users: usersAPI,
    maintenances: maintenancesAPI,
    maintenanceHistory: maintenanceHistoryAPI,
    ctes: ctesAPI,
    dashboard: dashboardAPI,
    mensagens: mensagensAPI
};

export default api;