'use strict';

const { CORS_ORIGINS, IS_PRODUCTION } = require('./env');

const corsOptions = {
  origin(origin, callback) {
    // Em desenvolvimento permite requisições sem origin (ex.: Insomnia, curl)
    if (!IS_PRODUCTION && !origin) return callback(null, true);

    if (CORS_ORIGINS.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`Origem não permitida pelo CORS: ${origin}`));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
};

module.exports = corsOptions;
