try {
  require('dotenv').config();
} catch (e) {
  if (e.code === 'MODULE_NOT_FOUND') {
    console.error('\n❌ Erro: dependências não instaladas.\n');
    console.error('Execute: npm install');
    console.error('\nOu manualmente instale dotenv:');
    console.error('  npm install dotenv\n');
    process.exit(1);
  }
  throw e;
}

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
