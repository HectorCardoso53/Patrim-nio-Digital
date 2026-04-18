'use strict';

const { Router } = require('express');
const PatrimonioController = require('../controllers/patrimonio.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const rbac = require('../middlewares/rbac.middleware');
const validate = require('../middlewares/validate.middleware');
const { z } = require('zod');

const router = Router();

// Todas as rotas de patrimônio exigem autenticação
router.use(authMiddleware);

// ── Schemas de validação ───────────────────────────────────────────────────

const criarSchema = z.object({
  descricao:        z.string().min(3,  'Descrição obrigatória.'),
  tipo:             z.enum(['MOVEL', 'IMOVEL'], { message: 'Tipo inválido.' }),
  marca:            z.string().optional(),
  modelo:           z.string().optional(),
  numeroSerie:      z.string().optional(),
  estadoConservacao: z.enum(
    ['OTIMO', 'BOM', 'REGULAR', 'RUIM', 'INSERVIVEL'],
    { message: 'Estado de conservação inválido.' }
  ),
  valorAquisicao:   z.number().nonnegative('Valor não pode ser negativo.').optional(),
  dataAquisicao:    z.string().datetime({ offset: true }).optional(),
  secretariaId:     z.string().uuid('ID de secretaria inválido.'),
  responsavelId:    z.string().uuid('ID de responsável inválido.').optional(),
  localizacao:      z.string().optional(),
  observacoes:      z.string().optional(),
});

const atualizarSchema = criarSchema.partial();

// ── Rotas ──────────────────────────────────────────────────────────────────

// GET  /api/patrimonio/dashboard/indicadores
router.get(
  '/dashboard/indicadores',
  rbac('ADMIN', 'GESTOR', 'OPERADOR', 'VISUALIZADOR'),
  PatrimonioController.indicadores
);

// GET  /api/patrimonio
router.get(
  '/',
  rbac('ADMIN', 'GESTOR', 'OPERADOR', 'VISUALIZADOR'),
  PatrimonioController.listar
);

// POST /api/patrimonio
router.post(
  '/',
  rbac('ADMIN', 'GESTOR', 'OPERADOR'),
  validate(criarSchema),
  PatrimonioController.criar
);

// GET  /api/patrimonio/:id   (id ou tombamento)
router.get(
  '/:id',
  rbac('ADMIN', 'GESTOR', 'OPERADOR', 'VISUALIZADOR'),
  PatrimonioController.detalhe
);

// PUT  /api/patrimonio/:id
router.put(
  '/:id',
  rbac('ADMIN', 'GESTOR', 'OPERADOR'),
  validate(atualizarSchema),
  PatrimonioController.atualizar
);

module.exports = router;
