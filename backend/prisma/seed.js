'use strict';

require('dotenv').config();

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

// ── Secretarias da Prefeitura de Oriximiná/PA ────────────────────────────────

const SECRETARIAS = [
  { nome: 'Secretaria Municipal de Administração',              sigla: 'SEMAD'  },
  { nome: 'Secretaria Municipal de Educação',                   sigla: 'SEMED'  },
  { nome: 'Secretaria Municipal de Saúde',                      sigla: 'SEMSA'  },
  { nome: 'Secretaria Municipal de Obras e Infraestrutura',     sigla: 'SEMOB'  },
  { nome: 'Secretaria Municipal de Finanças',                   sigla: 'SEMFIN' },
  { nome: 'Secretaria Municipal de Assistência Social',         sigla: 'SEMAS'  },
  { nome: 'Secretaria Municipal de Meio Ambiente',              sigla: 'SEMMA'  },
  { nome: 'Secretaria Municipal de Agricultura e Pesca',        sigla: 'SEMAGP' },
  { nome: 'Gabinete do Prefeito',                               sigla: 'GAB'    },
  { nome: 'Procuradoria Geral do Município',                    sigla: 'PGM'    },
];

async function main() {
  console.log('🌱  Iniciando seed do banco de dados...\n');

  // ── Secretarias ────────────────────────────────────────────────────────────
  console.log('   → Criando secretarias...');
  const secretarias = {};

  for (const s of SECRETARIAS) {
    const secretaria = await prisma.secretaria.upsert({
      where: { sigla: s.sigla },
      update: {},
      create: s,
    });
    secretarias[s.sigla] = secretaria;
    console.log(`     ✓ ${s.sigla} — ${s.nome}`);
  }

  // ── Usuário Administrador ──────────────────────────────────────────────────
  console.log('\n   → Criando usuário administrador...');

  const senhaAdmin = process.env.SEED_ADMIN_SENHA || 'Admin@2025!';
  const senhaHash  = await bcrypt.hash(senhaAdmin, 12);

  const admin = await prisma.usuario.upsert({
    where: { email: 'admin@oriximina.pa.gov.br' },
    update: {},
    create: {
      nome:        'Administrador do Sistema',
      email:       'admin@oriximina.pa.gov.br',
      senhaHash,
      papel:       'ADMIN',
      secretariaId: secretarias['SEMAD'].id,
    },
  });

  console.log(`     ✓ ${admin.email}  (papel: ${admin.papel})`);
  console.log(`     ℹ  Senha: ${senhaAdmin}`);
  console.log(`     ⚠  Altere a senha no primeiro acesso!\n`);

  // ── Usuário de exemplo — Gestor ────────────────────────────────────────────
  const senhaGestor = await bcrypt.hash('Gestor@2025!', 12);

  const gestor = await prisma.usuario.upsert({
    where: { email: 'gestor.patrimonio@oriximina.pa.gov.br' },
    update: {},
    create: {
      nome:        'Gestor Patrimonial',
      email:       'gestor.patrimonio@oriximina.pa.gov.br',
      senhaHash:   senhaGestor,
      papel:       'GESTOR',
      secretariaId: secretarias['SEMAD'].id,
    },
  });

  console.log(`     ✓ ${gestor.email}  (papel: ${gestor.papel})`);

  console.log('\n✅  Seed concluído com sucesso!\n');
}

main()
  .catch((err) => {
    console.error('❌  Erro no seed:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
