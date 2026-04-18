'use strict';

const { NODE_ENV } = require('../config/env');

const LEVELS = { error: 0, warn: 1, info: 2, debug: 3 };
const CURRENT_LEVEL = NODE_ENV === 'production' ? LEVELS.warn : LEVELS.debug;

function format(level, message, meta) {
  const ts = new Date().toISOString();
  const base = `[${ts}] [${level.toUpperCase()}] ${message}`;
  return meta ? `${base} ${JSON.stringify(meta)}` : base;
}

const logger = {
  error(message, meta) {
    if (LEVELS.error <= CURRENT_LEVEL) console.error(format('error', message, meta));
  },
  warn(message, meta) {
    if (LEVELS.warn <= CURRENT_LEVEL) console.warn(format('warn', message, meta));
  },
  info(message, meta) {
    if (LEVELS.info <= CURRENT_LEVEL) console.info(format('info', message, meta));
  },
  debug(message, meta) {
    if (LEVELS.debug <= CURRENT_LEVEL) console.debug(format('debug', message, meta));
  },
};

module.exports = logger;
