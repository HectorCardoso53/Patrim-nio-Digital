'use strict';

const authService = require('../services/auth.service');
const { success } = require('../utils/response');

const AuthController = {
  /**
   * POST /api/auth/login
   * Body: { email, senha }
   */
  async login(req, res, next) {
    try {
      const { email, senha } = req.body;
      const resultado = await authService.login(email, senha);
      return success(res, resultado, 'Login realizado com sucesso.');
    } catch (err) {
      next(err);
    }
  },

  /**
   * GET /api/auth/perfil
   * Requer autenticação.
   */
  async perfil(req, res, next) {
    try {
      const usuario = await authService.perfil(req.user.id);
      return success(res, { usuario });
    } catch (err) {
      next(err);
    }
  },

  /**
   * POST /api/auth/logout
   * JWT é stateless — o logout é feito no front-end removendo o token.
   * Este endpoint serve apenas como contrato formal.
   */
  async logout(req, res) {
    return success(res, null, 'Logout realizado. Remova o token do cliente.');
  },
};

module.exports = AuthController;
