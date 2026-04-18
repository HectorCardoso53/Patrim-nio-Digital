/**
 * api/patrimonio.api.js
 */

import { api } from './client.js';
import { getToken } from '../auth/session.js';

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

  async listar(filtros = {}) {
    const qs = toQueryString(filtros);
    return await api.get(`/patrimonio${qs}`);
  },

  async buscar(identificador) {
    const resp = await api.get(`/patrimonio/${identificador}`);
    return resp.data?.patrimonio;
  },

  async criar(dados) {
    const resp = await api.post('/patrimonio', dados);
    return resp.data?.patrimonio;
  },

  async atualizar(id, dados) {
    const resp = await api.put(`/patrimonio/${id}`, dados);
    return resp.data?.patrimonio;
  },

  async indicadores() {
    const resp = await api.get('/patrimonio/dashboard/indicadores');
    return resp.data;
  },

  async uploadFoto(id, file) {
    const formData = new FormData();
    formData.append('foto', file);
    const token = getToken();
    const response = await fetch(`/api/upload/foto/${id}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });
    const body = await response.json();
    if (!response.ok) throw new Error(body.message);
    return body.data;
  },
};