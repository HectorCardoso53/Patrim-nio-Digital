'use strict';

const { Router } = require('express');
const path = require('path');
const authMiddleware = require('../middlewares/auth.middleware');
const upload = require('../services/upload.service');

const router = Router();
router.use(authMiddleware);

router.post('/foto/:id', upload.single('foto'), async (req, res, next) => {
  try {
    const prisma = require('../config/database');
    if (!req.file) return res.status(400).json({ success: false, message: 'Nenhuma foto enviada.' });
    const fotoUrl = `/uploads/patrimonios/${req.file.filename}`;
    await prisma.patrimonio.update({ where: { id: req.params.id }, data: { foto: fotoUrl } });
    res.json({ success: true, data: { foto: fotoUrl } });
  } catch (err) { next(err); }
});

module.exports = router;