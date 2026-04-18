'use strict';

const { PrismaClient } = require('@prisma/client');
const { NODE_ENV } = require('./env');

const prisma = new PrismaClient({
  log: NODE_ENV === 'development' ? ['query', 'warn', 'error'] : ['error'],
});

// Garante desconexão limpa ao encerrar o processo
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});

module.exports = prisma;
