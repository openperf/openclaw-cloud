const fs = require('fs');
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const requiredForWorker = ['API_BASE_URL', 'BOT_TOKEN'];
const missing = requiredForWorker.filter(k => !process.env[k]);

if (missing.length) {
  console.error('[checkEnv] Variáveis ausentes:', missing.join(', '));
  console.error('[checkEnv] Configure .env a partir de .env.example e tente novamente.');
  process.exit(2);
}

console.log('[checkEnv] OK — variáveis essenciais presentes');
process.exit(0);
