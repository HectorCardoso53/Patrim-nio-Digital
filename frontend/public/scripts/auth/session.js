/**
 * auth/session.js
 * Gerência da sessão do usuário no front-end.
 *
 * Usa sessionStorage — o token é apagado automaticamente
 * ao fechar o navegador/aba, comportamento adequado para
 * computadores compartilhados de repartição pública.
 *
 * NUNCA armazena a senha ou dados sensíveis além do token.
 */

const TOKEN_KEY   = 'pi_token';
const USER_KEY    = 'pi_user';

// ── Token ──────────────────────────────────────────────────────────────────

/**
 * Salva o token JWT.
 * @param {string} token
 */
export function setToken(token) {
  sessionStorage.setItem(TOKEN_KEY, token);
}

/**
 * Retorna o token JWT ou null se não autenticado.
 * @returns {string|null}
 */
export function getToken() {
  return sessionStorage.getItem(TOKEN_KEY);
}

/**
 * Verifica se há um token armazenado (não valida assinatura — feito pelo back-end).
 * @returns {boolean}
 */
export function isAuthenticated() {
  return !!getToken();
}

// ── Usuário ────────────────────────────────────────────────────────────────

/**
 * Salva os dados públicos do usuário autenticado.
 * @param {object} usuario - { id, nome, email, papel }
 */
export function setUser(usuario) {
  sessionStorage.setItem(USER_KEY, JSON.stringify(usuario));
}

/**
 * Retorna os dados do usuário autenticado.
 * @returns {object|null}
 */
export function getUser() {
  const raw = sessionStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

// ── Sessão completa ────────────────────────────────────────────────────────

/**
 * Salva token e dados do usuário após login bem-sucedido.
 * @param {string} token
 * @param {object} usuario
 */
export function saveSession(token, usuario) {
  setToken(token);
  setUser(usuario);
}

/**
 * Remove todos os dados de sessão (logout).
 */
export function clearSession() {
  sessionStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(USER_KEY);
}
