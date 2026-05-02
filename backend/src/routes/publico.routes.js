'use strict';

const { Router } = require('express');
const prisma = require('../config/database');
const { success } = require('../utils/response');

const router = Router();

router.get('/patrimonio/:tombamento', async (req, res, next) => {
  try {
    const bem = await prisma.patrimonio.findFirst({
      where: { tombamento: req.params.tombamento, ativo: true },
      select: {
        tombamento: true,
        descricao: true,
        tipo: true,
        marca: true,
        modelo: true,
        estadoConservacao: true,
        localizacao: true,
        dataAquisicao: true,
        foto: true,
        secretaria: { select: { nome: true } },
      },
    });

    if (!bem) {
      return res.status(404).json({ success: false, message: 'Bem não encontrado.' });
    }

    return success(res, bem);
  } catch (err) {
    next(err);
  }
});

module.exports = router;