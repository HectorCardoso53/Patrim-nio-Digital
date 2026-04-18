/**
 * api/auth.api.js
 * Chamadas HTTP relacionadas à autenticação.
 */

import { api } from './client.js';

export const authApi = {
  /**
   * Realiza login e retorna { token, usuario }.
   * @param {string} email
   * @param {string} senha
   */
  async login(email, senha) {
    const resp = await api.post('/auth/login', { email, senha });
    return resp.data;
  },

  /**
   * Retorna o perfil do usuário autenticado.
   */
  async perfil() {
    const resp = await api.get('/auth/perfil');
    return resp.data.usuario;
  },

  /**
   * Notifica o servidor do logout (token stateless, ação formal).
   */
  async logout() {
    return api.post('/auth/logout', {});
  },
};
