'use strict';

const { error } = require('../utils/response');

/**
 * Retorna um middleware que verifica se o usuário autenticado
 * possui um dos papéis permitidos.
 *
 * Hierarquia de papéis:
 *  ADMIN      → acesso total
 *  GESTOR     → gerencia patrimônio e permutas
 *  OPERADOR   → cadastra e edita bens
 *  VISUALIZADOR → somente leitura
 *
 * @param {...string} papeis - Papéis autorizados para a rota.
 */
function rbac(...papeis) {
  return (req, res, next) => {
    if (!req.user) {
      return error(res, 'Usuário não autenticado.', 401);
    }

    if (!papeis.includes(req.user.papel)) {
      return error(res, 'Você não tem permissão para acessar este recurso.', 403);
    }

    next();
  };
}

module.exports = rbac;
