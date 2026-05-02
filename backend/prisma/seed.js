'use strict';

require('dotenv').config();

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

// ── Secretarias da Prefeitura de Oriximiná/PA ────────────────────────────────

const SECRETARIAS = [
  { nome: 'Assessoria de Controle Interno', sigla: 'ACI' },
  { nome: 'Gabinete do Prefeito', sigla: 'GAB' },
  { nome: 'Procuradoria Geral do Município', sigla: 'PGM' },
  { nome: 'Secretaria de Integração Municipal', sigla: 'SIM' },
  { nome: 'Secretaria Municipal de Agricultura e Abastecimento', sigla: 'SEMAGRI' },
  { nome: 'Secretaria Municipal de Assistência Social', sigla: 'SMAS' },
  { nome: 'Secretaria Municipal de Cultura', sigla: 'SEMC' },
  { nome: 'Secretaria Municipal de Infraestrutura', sigla: 'SEINFRA' },
  { nome: 'Secretaria Municipal de Educação', sigla: 'SEMED' },
  { nome: 'Secretaria Municipal de Finanças e Desenvolvimento Econômico', sigla: 'SEMFIDE' },
  { nome: 'Secretaria Municipal de Meio Ambiente e Mineração', sigla: 'SEMMA' },
  { nome: 'Secretaria Municipal de Planejamento e Administração', sigla: 'SEMPLAD' },
  { nome: 'Secretaria Municipal de Segurança Pública e Defesa Social', sigla: 'SEMUSP' },
  { nome: 'Secretaria Municipal de Saúde', sigla: 'SMS' },
  { nome: 'Secretaria Municipal do Esporte', sigla: 'SEMESP' },
  { nome: 'Secretaria Municipal de Obras Públicas e Habitação', sigla: 'SEMOPH' },
  { nome: 'Secretaria Municipal da Juventude', sigla: 'SEMJU' },
  { nome: 'Secretaria Municipal de Eficiência Governamental', sigla: 'SEMEG' },
  { nome: 'Secretaria Municipal de Comunicação', sigla: 'SEMCO' },
  { nome: 'Secretaria Municipal de Promoção da Igualdade Racial e Direitos Humanos', sigla: 'SEMPIRDH' }
];

async function main() {
  console.log('🌱  Iniciando seed do banco de dados...\n');

  // ── Secretarias ────────────────────────────────────────────────────────────
  console.log('   → Criando secretarias...');
  const secretarias = {};

  for (const s of SECRETARIAS) {

  // tenta achar por sigla
  const existente = await prisma.secretaria.findUnique({
    where: { sigla: s.sigla }
  });

  if (existente) {
    // atualiza o nome se mudou
    await prisma.secretaria.update({
      where: { sigla: s.sigla },
      data: { nome: s.nome }
    });

    secretarias[s.sigla] = existente;
    console.log(`     🔄 Atualizado: ${s.sigla}`);
    continue;
  }

  // evita erro de nome duplicado
  const existentePorNome = await prisma.secretaria.findFirst({
    where: { nome: s.nome }
  });

  if (existentePorNome) {
    console.log(`     ⚠ Já existe (nome): ${s.nome}`);
    secretarias[s.sigla] = existentePorNome;
    continue;
  }

  // cria nova
  const nova = await prisma.secretaria.create({
    data: s
  });

  secretarias[s.sigla] = nova;
  console.log(`     ✓ Criado: ${s.sigla} — ${s.nome}`);
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
      secretariaId: Object.values(secretarias)[0].id,
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
      secretariaId: secretarias['SEMED'].id,
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
