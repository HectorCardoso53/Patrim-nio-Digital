'use strict';

const jwt = require('jsonwebtoken');
const { JWT_SECRET, JWT_EXPIRES_IN } = require('./env');

/**
 * Gera um JWT para o usuário autenticado.
 * @param {object} payload - Dados a incluir no token (sem dados sensíveis).
 * @returns {string} Token JWT assinado.
 */
function signToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

/**
 * Verifica e decodifica um JWT.
 * @param {string} token
 * @returns {object} Payload decodificado.
 * @throws {JsonWebTokenError|TokenExpiredError}
 */
function verifyToken(token) {
  return jwt.verify(token, JWT_SECRET);
}

module.exports = { signToken, verifyToken };
