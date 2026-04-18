'use strict';

const { verifyToken } = require('../config/jwt');
const { error } = require('../utils/response');

/**
 * Extrai o token do header Authorization (Bearer <token>),
 * verifica a assinatura e injeta o payload em req.user.
 */
function authMiddleware(req, res, next) {
  const authHeader = req.headers['authorization'];

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return error(res, 'Token de autenticação não fornecido.', 401);
  }

  const token = authHeader.split(' ')[1];

  try {
    const payload = verifyToken(token);
    req.user = payload; // { id, nome, email, papel }
    next();
  } catch (err) {
    // Delega para o errorHandler centralizado
    next(err);
  }
}

module.exports = authMiddleware;
