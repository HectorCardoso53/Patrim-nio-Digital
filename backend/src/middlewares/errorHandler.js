'use strict';

const { ZodError } = require('zod');
const { JsonWebTokenError, TokenExpiredError } = require('jsonwebtoken');
const { error } = require('../utils/response');
const logger = require('../utils/logger');

/**
 * Middleware de tratamento centralizado de erros.
 * Deve ser registrado APÓS todas as rotas no app.js.
 */
// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  // Erros de validação Zod
  if (err instanceof ZodError) {
    return error(
      res,
      'Dados inválidos na requisição.',
      422,
      err.errors.map((e) => ({ campo: e.path.join('.'), mensagem: e.message }))
    );
  }

  // JWT expirado
  if (err instanceof TokenExpiredError) {
    return error(res, 'Sessão expirada. Faça login novamente.', 401);
  }

  // JWT inválido
  if (err instanceof JsonWebTokenError) {
    return error(res, 'Token de autenticação inválido.', 401);
  }

  // Erros do Prisma — violação de constraint única
  if (err.code === 'P2002') {
    const field = err.meta?.target?.join(', ') || 'campo';
    return error(res, `Já existe um registro com este ${field}.`, 409);
  }

  // Erros do Prisma — registro não encontrado
  if (err.code === 'P2025') {
    return error(res, 'Registro não encontrado.', 404);
  }

  // Erro genérico com statusCode definido (AppError)
  if (err.statusCode) {
    return error(res, err.message, err.statusCode);
  }

  // Erro interno não esperado
  logger.error('Erro interno não tratado', { message: err.message, stack: err.stack });
  return error(res, 'Erro interno do servidor.', 500);
}

module.exports = errorHandler;
