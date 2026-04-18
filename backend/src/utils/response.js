'use strict';

/**
 * Resposta de sucesso.
 * @param {object} res - Express response
 * @param {*} data - Dados a retornar
 * @param {string} [message]
 * @param {number} [statusCode=200]
 */
function success(res, data, message = 'OK', statusCode = 200) {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
}

/**
 * Resposta de erro.
 * @param {object} res - Express response
 * @param {string} message
 * @param {number} [statusCode=400]
 * @param {*} [errors=null]
 */
function error(res, message, statusCode = 400, errors = null) {
  const body = { success: false, message };
  if (errors) body.errors = errors;
  return res.status(statusCode).json(body);
}

/**
 * Resposta paginada.
 * @param {object} res
 * @param {Array}  items
 * @param {object} meta  - { page, limit, total }
 */
function paginated(res, items, meta) {
  return res.status(200).json({
    success: true,
    message: 'OK',
    data: items,
    meta: {
      page: meta.page,
      limit: meta.limit,
      total: meta.total,
      totalPages: Math.ceil(meta.total / meta.limit),
    },
  });
}

module.exports = { success, error, paginated };
