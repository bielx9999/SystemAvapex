const nodemailer = require('nodemailer');

// Configurar transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false, // false para porta 587
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    },
    tls: {
      rejectUnauthorized: false
    }
  });
};

// Enviar email de manutenção
const sendMaintenanceEmail = async (manutencao, veiculo, destinatario) => {
  try {
    
    const transporter = createTransporter();

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
          .content { background: white; padding: 20px; border: 1px solid #ddd; border-radius: 8px; }
          .info-row { margin: 10px 0; }
          .label { font-weight: bold; color: #555; }
          .value { color: #333; }
          .priority { padding: 5px 10px; border-radius: 4px; color: white; font-weight: bold; }
          .critica { background: #dc3545; }
          .alta { background: #fd7e14; }
          .media { background: #ffc107; color: #000; }
          .baixa { background: #28a745; }
          .footer { margin-top: 20px; padding: 15px; background: #f8f9fa; border-radius: 8px; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>🔧 Solicitação de Manutenção</h2>
            <p>Uma nova manutenção foi solicitada e precisa de atenção.</p>
          </div>
          
          <div class="content">
            <h3>Informações do Veículo</h3>
            <div class="info-row">
              <span class="label">Frota:</span> 
              <span class="value">${veiculo.frota}</span>
            </div>
            <div class="info-row">
              <span class="label">Placa:</span> 
              <span class="value">${veiculo.placa}</span>
            </div>
            <div class="info-row">
              <span class="label">Modelo:</span> 
              <span class="value">${veiculo.modelo} (${veiculo.ano})</span>
            </div>


            <h3>Detalhes da Manutenção</h3>
            <div class="info-row">
              <span class="label">Tipo:</span> 
              <span class="value">${manutencao.tipo}</span>
            </div>
            <div class="info-row">
              <span class="label">Data Programada:</span> 
              <span class="value">${new Date(manutencao.data_programada).toLocaleDateString('pt-BR')}</span>
            </div>
            <div class="info-row">
              <span class="label">Quilometragem da Manutenção:</span> 
              <span class="value">${manutencao.km_manutencao?.toLocaleString()} km</span>
            </div>
            <div class="info-row">
              <span class="label">Gravidade:</span> 
              <span class="priority ${(manutencao.gravidade || 'baixa').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')}">${manutencao.gravidade || 'N/A'}</span>
            </div>
            <div class="info-row">
              <span class="label">Status:</span> 
              <span class="value">${manutencao.status || 'Pendente'}</span>
            </div>

            <h3>Descrição do Problema</h3>
            <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin: 10px 0;">
              ${manutencao.descricao}
            </div>

            <div style="margin-top: 20px; padding: 15px; background: #e3f2fd; border-radius: 8px;">
              <h4>📋 Próximos Passos</h4>
              <ol>
                <li>Analisar a solicitação</li>
                <li>Preparar orçamento</li>
                <li>Agendar manutenção</li>
                <li>Executar serviços</li>
                <li>Finalizar e documentar</li>
              </ol>
            </div>
          </div>

          <div class="footer">
            <p><strong>Sistema de Logística - AvaSystem</strong></p>
            <p>Este é um email automático. Para responder, entre em contato através dos canais oficiais.</p>
            <p>Data de envio: ${new Date().toLocaleString('pt-BR')}</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: destinatario,
      subject: `🔧 Manutenção ${manutencao.gravidade} - ${veiculo.frota} (${veiculo.placa})`,
      html: htmlContent
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('Email enviado:', result.messageId);
    return { success: true, messageId: result.messageId };

  } catch (error) {
    console.error('Erro ao enviar email:', error);
    return { success: false, error: error.message };
  }
};

// Testar configuração de email
const testEmailConfig = async () => {
  try {
    const transporter = createTransporter();
    await transporter.verify();
    console.log('✅ Configuração de email válida');
    return true;
  } catch (error) {
    console.error('❌ Erro na configuração de email:', error.message);
    return false;
  }
};

module.exports = {
  sendMaintenanceEmail,
  testEmailConfig
};