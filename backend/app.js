'use strict';

const express = require('express');
const cors    = require('cors');
const path    = require('path');

const corsOptions    = require('./src/config/cors');
const routes         = require('./src/routes/index');
const errorHandler   = require('./src/middlewares/errorHandler');
const logger         = require('./src/utils/logger');

const app = express();

// ── Middlewares globais ────────────────────────────────────────────────────

app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Log de requisições em desenvolvimento
if (process.env.NODE_ENV !== 'production') {
  app.use((req, _res, next) => {
    logger.debug(`${req.method} ${req.url}`);
    next();
  });
}

// ── Arquivos estáticos do front-end ────────────────────────────────────────
// O Express serve o front-end a partir de frontend/public/
app.use(express.static(path.join(__dirname, '..', 'frontend', 'public')));

// Uploads (fotos e documentos dos bens) servidos como estáticos
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ── Rotas da API ───────────────────────────────────────────────────────────
app.use('/api', routes);

// ── Fallback de navegação (MPA) ────────────────────────────────────────────
// Qualquer rota não reconhecida que não seja /api retorna o index da pasta public
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) return next();
  res.sendFile(path.join(__dirname, '..', 'frontend', 'public', 'index.html'));
});

// ── Tratamento centralizado de erros ──────────────────────────────────────
// DEVE ser o último middleware registrado
app.use(errorHandler);

module.exports = app;
