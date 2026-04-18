'use strict';

const { Router } = require('express');
const authMiddleware = require('../middlewares/auth.middleware');
const prisma = require('../config/database');
const { success } = require('../utils/response');

const router = Router();

router.use(authMiddleware);

// GET /api/secretarias
router.get('/', async (req, res, next) => {
  try {
    const secretarias = await prisma.secretaria.findMany({
      where: { ativo: true },
      orderBy: { nome: 'asc' },
      select: { id: true, nome: true, sigla: true },
    });
    return success(res, secretarias);
  } catch (err) {
    next(err);
  }
});

module.exports = router;