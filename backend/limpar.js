require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

prisma.movimentacao.deleteMany()
  .then(() => prisma.patrimonio.deleteMany())
  .then(() => { console.log('Banco local limpo!'); return prisma.$disconnect(); })
  .catch(console.error);