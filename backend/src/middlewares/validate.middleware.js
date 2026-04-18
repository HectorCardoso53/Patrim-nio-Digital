'use strict';

/**
 * Retorna um middleware que valida req.body contra um schema Zod.
 * Em caso de erro, lança para o errorHandler centralizado.
 *
 * @param {import('zod').ZodSchema} schema
 */
function validate(schema) {
  return (req, res, next) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (err) {
      next(err); // ZodError tratado pelo errorHandler
    }
  };
}

module.exports = validate;
