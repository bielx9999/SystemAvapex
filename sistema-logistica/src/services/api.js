import axios from 'axios';

// Configuração base da API
const api = axios.create({
    baseURL: 'http://localhost:5000/api',
    headers: {
        'Content-Type': 'application/json'
    }
});

// Interceptor para adicionar token de autenticação (se implementar JWT futuramente)
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
            // Erro de resposta do servidor
            console.error('Erro na resposta:', error.response.data);
            
            if (error.response.status === 401) {
                // Token inválido ou expirado
                localStorage.removeItem('token');
                window.location.href = '/';
            }
        } else if (error.request) {
            // Erro de requisição (sem resposta do servidor)
            console.error('Erro na requisição:', error.request);
        } else {
            // Erro na configuração da requisição
            console.error('Erro:', error.message);
        }
        return Promise.reject(error);
    }
);

// ===================== AUTENTICAÇÃO =====================
export const authAPI = {
    // Login por matrícula
    login: (matricula, senha) => 
        api.post('/auth/login', { matricula, senha }),
    
    // Registrar novo usuário
    register: (dados) => 
        api.post('/auth/register', dados),
    
    // Listar todos os usuários (apenas para admin)
    getUsers: () => 
        api.get('/auth')
};

// ===================== VEÍCULOS =====================
export const veiculosAPI = {
    // Listar todos os veículos
    getAll: () => 
        api.get('/veiculos'),
    
    // Buscar veículo por ID
    getById: (id) => 
        api.get(`/veiculos/${id}`),
    
    // Criar novo veículo
    create: (dados) => 
        api.post('/veiculos', dados),
    
    // Atualizar veículo
    update: (id, dados) => 
        api.put(`/veiculos/${id}`, dados),
    
    // Deletar veículo
    delete: (id) => 
        api.delete(`/veiculos/${id}`)
};

// ===================== MOTORISTAS =====================
export const motoristasAPI = {
    // Listar todos os motoristas
    getAll: () => 
        api.get('/motoristas'),
    
    // Buscar motorista por ID
    getById: (id) => 
        api.get(`/motoristas/${id}`),
    
    // Criar novo motorista
    create: (dados) => 
        api.post('/motoristas', dados),
    
    // Atualizar motorista
    update: (id, dados) => 
        api.put(`/motoristas/${id}`, dados),
    
    // Deletar motorista
    delete: (id) => 
        api.delete(`/motoristas/${id}`)
};

// ===================== MANUTENÇÕES =====================
export const manutencoesAPI = {
    // Listar todas as manutenções
    getAll: () => 
        api.get('/manutencoes'),
    
    // Buscar manutenção por ID
    getById: (id) => 
        api.get(`/manutencoes/${id}`),
    
    // Buscar manutenções por veículo
    getByVeiculo: (veiculoId) => 
        api.get(`/manutencoes/veiculo/${veiculoId}`),
    
    // Criar nova manutenção
    create: (dados) => 
        api.post('/manutencoes', dados),
    
    // Atualizar manutenção completa
    update: (id, dados) => 
        api.put(`/manutencoes/${id}`, dados),
    
    // Atualizar apenas o status
    updateStatus: (id, status) => 
        api.patch(`/manutencoes/${id}/status`, { status }),
    
    // Deletar manutenção
    delete: (id) => 
        api.delete(`/manutencoes/${id}`),
    
    // Estatísticas para dashboard
    getStats: () => 
        api.get('/manutencoes/stats/dashboard'),
    
    // Estatísticas por tipo (para gráfico)
    getStatsByType: () => 
        api.get('/manutencoes/stats/tipos')
};

// ===================== CT-e =====================
export const ctesAPI = {
    // Listar todos os CT-e
    getAll: () => 
        api.get('/ctes'),
    
    // Buscar CT-e por ID
    getById: (id) => 
        api.get(`/ctes/${id}`),
    
    // Buscar CT-e por motorista
    getByMotorista: (motoristaId) => 
        api.get(`/ctes/motorista/${motoristaId}`),
    
    // Criar novo CT-e com upload de arquivo
    create: (formData) => 
        api.post('/ctes', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        }),
    
    // Atualizar CT-e (sem arquivo)
    update: (id, dados) => 
        api.put(`/ctes/${id}`, dados),
    
    // Deletar CT-e
    delete: (id) => 
        api.delete(`/ctes/${id}`),
    
    // Download de arquivo CT-e
    download: (id) => 
        api.get(`/ctes/download/${id}`, { 
            responseType: 'blob' 
        }),
    
    // Estatísticas de CT-e
    getStats: () => 
        api.get('/ctes/stats/dashboard')
};

// ===================== FUNÇÕES AUXILIARES =====================

// Função para tratar erros de forma padronizada
export const handleAPIError = (error) => {
    if (error.response) {
        // Erro retornado pelo servidor
        return {
            success: false,
            message: error.response.data.error || 'Erro ao processar requisição',
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
        
        // Criar URL temporária para o arquivo
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', filename);
        document.body.appendChild(link);
        link.click();
        link.remove();
        
        return { success: true };
    } catch (error) {
        return handleAPIError(error);
    }
};

// Exportar a instância do axios para uso customizado
export default api;