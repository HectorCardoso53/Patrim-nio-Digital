/**
 * api/client.js
 * Cliente HTTP base para comunicação com a API REST.
 *
 * Responsabilidades:
 *  - Injetar o token JWT em todas as requisições
 *  - Padronizar o tratamento de erros de rede
 *  - Redirecionar para login quando o token expirar (401)
 */

import { getToken, clearSession } from '../auth/session.js';

const API_BASE_URL = '/api';

/**
 * Realiza uma requisição à API.
 *
 * @param {string} endpoint   - Caminho relativo, ex.: '/patrimonio'
 * @param {RequestInit} opts  - Opções do fetch (method, body, headers extras)
 * @returns {Promise<object>} - Dados da resposta (campo `data` do JSON)
 * @throws {ApiError}         - Erro estruturado com status e mensagem
 */
async function request(endpoint, opts = {}) {
  const token = getToken();

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(opts.headers || {}),
  };

  const config = {
    ...opts,
    headers,
  };

  let response;

  try {
    response = await fetch(`${API_BASE_URL}${endpoint}`, config);
  } catch (networkError) {
    throw new ApiError(0, 'Sem conexão com o servidor. Verifique sua rede.');
  }

  // Sessão expirada ou token inválido
  if (response.status === 401) {
    clearSession();
    window.location.href = '/pages/login.html?sessao=expirada';
    return;
  }

  let body;
  try {
    body = await response.json();
  } catch {
    throw new ApiError(response.status, 'Resposta inválida do servidor.');
  }

  if (!response.ok) {
    throw new ApiError(response.status, body.message || 'Erro desconhecido.', body.errors);
  }

  return body;
}

// ── Métodos de conveniência ────────────────────────────────────────────────

export const api = {
  get(endpoint) {
    return request(endpoint, { method: 'GET' });
  },

  post(endpoint, data) {
    return request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  put(endpoint, data) {
    return request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  patch(endpoint, data) {
    return request(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  delete(endpoint) {
    return request(endpoint, { method: 'DELETE' });
  },
};

// ── Classe de erro estruturado ─────────────────────────────────────────────

export class ApiError extends Error {
  /**
   * @param {number}   status   - HTTP status code
   * @param {string}   message  - Mensagem legível
   * @param {Array}    [errors] - Erros de validação (campo + mensagem)
   */
  constructor(status, message, errors = null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.errors = errors;
  }

  /** Retorna verdadeiro para erros de validação (422) */
  get isValidation() {
    return this.status === 422;
  }

  /** Retorna verdadeiro para recurso não encontrado (404) */
  get isNotFound() {
    return this.status === 404;
  }
}
