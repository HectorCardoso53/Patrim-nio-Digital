'use strict';

// Valida variáveis de ambiente ANTES de qualquer import que dependa delas
require('./src/config/env');

const app    = require('./app');
const { PORT, NODE_ENV } = require('./src/config/env');
const logger = require('./src/utils/logger');
const prisma = require('./src/config/database');

async function iniciar() {
  try {
    // Verifica conexão com o banco antes de abrir o servidor
    await prisma.$connect();
    logger.info('Conexão com o banco de dados estabelecida.');

    const server = app.listen(PORT, () => {
      logger.info(`Servidor iniciado.`, {
        ambiente: NODE_ENV,
        porta: PORT,
        url: `http://localhost:${PORT}`,
      });
    });

    // Encerramento gracioso
    const encerrar = async (sinal) => {
      logger.info(`Sinal ${sinal} recebido. Encerrando servidor...`);
      server.close(async () => {
        await prisma.$disconnect();
        logger.info('Servidor encerrado.');
        process.exit(0);
      });
    };

    process.on('SIGTERM', () => encerrar('SIGTERM'));
    process.on('SIGINT',  () => encerrar('SIGINT'));

  } catch (err) {
    logger.error('Falha ao iniciar o servidor.', { message: err.message });
    await prisma.$disconnect();
    process.exit(1);
  }
}

iniciar();
