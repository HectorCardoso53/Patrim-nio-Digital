'use strict';

const { Router } = require('express');
const AuthController = require('../controllers/auth.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate.middleware');
const { z } = require('zod');

const router = Router();

const loginSchema = z.object({
  email: z.string().email('E-mail inválido.'),
  senha: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres.'),
});

// POST /api/auth/login
router.post('/login', validate(loginSchema), AuthController.login);

// GET /api/auth/perfil  (protegida)
router.get('/perfil', authMiddleware, AuthController.perfil);

// POST /api/auth/logout (protegida)
router.post('/logout', authMiddleware, AuthController.logout);

module.exports = router;
