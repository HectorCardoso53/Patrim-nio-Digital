/**
 * api/patrimonio.api.js
 * Chamadas HTTP do módulo de patrimônio.
 */

import { api } from './client.js';

/**
 * Converte um objeto de filtros em query string.
 * @param {object} filtros
 * @returns {string}
 */
function toQueryString(filtros) {
  const params = new URLSearchParams();
  Object.entries(filtros).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      params.append(key, value);
    }
  });
  const qs = params.toString();
  return qs ? `?${qs}` : '';
}

export const patrimonioApi = {
  /**
   * Lista bens com filtros e paginação.
   * @param {object} filtros - { page, limit, secretariaId, tipo, estado, busca }
   */
  async listar(filtros = {}) {
    const qs = toQueryString(filtros);
    const resp = await api.get(`/patrimonio${qs}`);
    return resp; // { data: [], meta: { page, limit, total, totalPages } }
  },

  /**
   * Busca um bem pelo ID (UUID) ou tombamento.
   * @param {string} identificador
   */
  async buscar(identificador) {
    const resp = await api.get(`/patrimonio/${identificador}`);
    return resp.data.patrimonio;
  },

  /**
   * Cria um novo bem patrimonial.
   * @param {object} dados
   */
  async criar(dados) {
    const resp = await api.post('/patrimonio', dados);
    return resp.data.patrimonio;
  },

  /**
   * Atualiza um bem patrimonial.
   * @param {string} id
   * @param {object} dados
   */
  async atualizar(id, dados) {
    const resp = await api.put(`/patrimonio/${id}`, dados);
    return resp.data.patrimonio;
  },

  /**
   * Retorna indicadores para o dashboard.
   */
  async indicadores() {
    const resp = await api.get('/patrimonio/dashboard/indicadores');
    return resp.data;
  },
};
