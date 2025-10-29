// Configurações da aplicação
export const config = {
  // URLs da API
  API_BASE_URL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  API_TIMEOUT: parseInt(process.env.REACT_APP_API_TIMEOUT) || 30000,
  
  // Upload
  MAX_FILE_SIZE: parseInt(process.env.REACT_APP_MAX_FILE_SIZE) || 5242880, // 5MB
  ALLOWED_FILE_TYPES: ['.pdf', '.jpg', '.jpeg', '.png'],
  
  // Aplicação
  APP_NAME: 'Sistema de Logística',
  APP_VERSION: '1.0.0',
  
  // Perfis de usuário
  USER_PROFILES: {
    MOTORISTA: 'Motorista',
    ASSISTENTE: 'Assistente',
    GERENTE: 'Gerente'
  },
  
  // Status
  VEHICLE_STATUS: {
    DISPONIVEL: 'Disponível',
    EM_VIAGEM: 'Em Viagem',
    MANUTENCAO: 'Em Manutenção',
    INATIVO: 'Inativo'
  },
  
  MAINTENANCE_STATUS: {
    PENDENTE: 'Pendente',
    EM_ANDAMENTO: 'Em Andamento',
    CONCLUIDA: 'Concluída',
    CANCELADA: 'Cancelada'
  },
  
  MAINTENANCE_SEVERITY: {
    BAIXA: 'Baixa',
    MEDIA: 'Média',
    ALTA: 'Alta',
    CRITICA: 'Crítica'
  },
  
  // Mensagens
  MESSAGES: {
    LOGIN_SUCCESS: 'Login realizado com sucesso!',
    LOGIN_ERROR: 'Erro ao fazer login. Verifique suas credenciais.',
    NETWORK_ERROR: 'Erro de conexão. Verifique sua internet.',
    GENERIC_ERROR: 'Ocorreu um erro inesperado. Tente novamente.',
    SAVE_SUCCESS: 'Dados salvos com sucesso!',
    DELETE_SUCCESS: 'Item removido com sucesso!',
    VALIDATION_ERROR: 'Por favor, verifique os dados informados.'
  }
};

export default config;