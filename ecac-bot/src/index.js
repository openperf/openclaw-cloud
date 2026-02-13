require('dotenv').config();
const argv = process.argv.slice(2);
// Se chamado diretamente, inicia o worker por padrão
if (argv.includes('--worker') || process.env.WORKER === 'true') {
  require('./worker');
} else {
  const { run } = require('./bot');
  (async () => {
    try {
      await run();
      console.log('Operação finalizada.');
    } catch (err) {
      console.error('Erro:', err);
      process.exitCode = 1;
    }
  })();
}
