'use strict';

const { Router } = require('express');
const authRoutes       = require('./auth.routes');
const patrimonioRoutes = require('./patrimonio.routes');
const secretariaRoutes = require('./secretaria.routes');
const publicoRoutes    = require('./publico.routes');
const uploadRoutes     = require('./upload.routes');

const router = Router();

router.use('/auth',        authRoutes);
router.use('/patrimonio',  patrimonioRoutes);
router.use('/secretarias', secretariaRoutes);
router.use('/publico',     publicoRoutes);
router.use('/upload',      uploadRoutes);

router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Patrimônio Inteligente API operacional.',
    timestamp: new Date().toISOString(),
  });
});

module.exports = router;