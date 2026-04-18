/**
 * auth/guard.js
 * Guardas de navegação para páginas protegidas.
 *
 * Uso: incluir <script type="module"> no topo do <body>
 * de cada página protegida:
 *
 *   import { requireAuth } from '../scripts/auth/guard.js';
 *   requireAuth();
 *
 * Para páginas que só devem ser acessadas por papéis específicos:
 *
 *   requireRole('ADMIN', 'GESTOR');
 */

import { isAuthenticated, getUser, clearSession } from './session.js';

const LOGIN_URL = '/pages/login.html';

/**
 * Redireciona para o login se o usuário não estiver autenticado.
 * Deve ser chamado no início do script de cada página protegida.
 */
export function requireAuth() {
  if (!isAuthenticated()) {
    window.location.replace(LOGIN_URL);
  }
}

/**
 * Verifica se o usuário possui um dos papéis permitidos.
 * Redireciona para login (ou para uma página de acesso negado) se não tiver.
 *
 * @param {...string} papeis - Papéis autorizados para a página.
 */
export function requireRole(...papeis) {
  requireAuth();

  const usuario = getUser();
  if (!usuario || !papeis.includes(usuario.papel)) {
    // Redireciona para o dashboard com mensagem de permissão insuficiente
    window.location.replace('/pages/dashboard.html?erro=permissao');
  }
}

/**
 * Redireciona para o dashboard se o usuário já estiver autenticado.
 * Uso: página de login — evita que usuário logado volte para o login.
 */
export function redirectIfAuthenticated() {
  if (isAuthenticated()) {
    window.location.replace('/pages/dashboard.html');
  }
}

/**
 * Realiza logout: limpa a sessão e redireciona para o login.
 */
export function logout() {
  clearSession();
  window.location.replace(`${LOGIN_URL}?logout=1`);
}
