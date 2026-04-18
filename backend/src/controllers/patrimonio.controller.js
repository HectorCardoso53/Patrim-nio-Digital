'use strict';

const patrimonioService = require('../services/patrimonio.service');
const { success, paginated } = require('../utils/response');

const PatrimonioController = {
  /**
   * POST /api/patrimonio
   */
  async criar(req, res, next) {
    try {
      const patrimonio = await patrimonioService.criar(req.body, req.user.id);
      return success(res, { patrimonio }, 'Bem patrimonial cadastrado com sucesso.', 201);
    } catch (err) {
      next(err);
    }
  },

  /**
   * GET /api/patrimonio
   * Query: page, limit, secretariaId, tipo, estado, busca
   */
  async listar(req, res, next) {
    try {
      const { items, total, page, limit } = await patrimonioService.listar(req.query);
      return paginated(res, items, { page, limit, total });
    } catch (err) {
      next(err);
    }
  },

  /**
   * GET /api/patrimonio/:id
   * :id pode ser UUID ou número de tombamento (ORX-YYYY-NNNNN)
   */
  async detalhe(req, res, next) {
    try {
      const patrimonio = await patrimonioService.buscarPorIdentificador(req.params.id);
      return success(res, { patrimonio });
    } catch (err) {
      next(err);
    }
  },

  /**
   * PUT /api/patrimonio/:id
   */
  async atualizar(req, res, next) {
    try {
      const patrimonio = await patrimonioService.atualizar(req.params.id, req.body, req.user.id);
      return success(res, { patrimonio }, 'Bem patrimonial atualizado com sucesso.');
    } catch (err) {
      next(err);
    }
  },

  /**
   * GET /api/patrimonio/dashboard/indicadores
   */
  async indicadores(req, res, next) {
    try {
      const dados = await patrimonioService.indicadores();
      return success(res, dados);
    } catch (err) {
      next(err);
    }
  },
};

module.exports = PatrimonioController;
