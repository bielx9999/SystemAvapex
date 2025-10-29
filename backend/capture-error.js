const { spawn } = require('child_process');

console.log('🔍 Executando npm run dev e capturando erro...\n');

const npmProcess = spawn('npm', ['run', 'dev'], {
  cwd: process.cwd(),
  stdio: 'pipe'
});

npmProcess.stdout.on('data', (data) => {
  console.log('STDOUT:', data.toString());
});

npmProcess.stderr.on('data', (data) => {
  console.error('STDERR:', data.toString());
});

npmProcess.on('error', (error) => {
  console.error('ERRO DO PROCESSO:', error);
});

npmProcess.on('close', (code) => {
  console.log(`Processo finalizado com código: ${code}`);
});

// Finalizar após 10 segundos
setTimeout(() => {
  npmProcess.kill();
  console.log('Processo finalizado por timeout');
}, 10000);