/**
 * pages/login.js
 * Lógica exclusiva da página de login.
 */

import { authApi }               from '../api/auth.api.js';
import { saveSession }           from '../auth/session.js';
import { redirectIfAuthenticated } from '../auth/guard.js';

// Redireciona imediatamente se já estiver autenticado
redirectIfAuthenticated();

// ── Elementos do DOM ───────────────────────────────────────────────────────
const emailInput    = document.getElementById('email');
const senhaInput    = document.getElementById('senha');
const btnLogin      = document.getElementById('btn-login');
const alertError    = document.getElementById('alert-error');
const alertInfo     = document.getElementById('alert-info');

// ── Mensagens contextuais via query string ─────────────────────────────────
const params = new URLSearchParams(window.location.search);

if (params.get('sessao') === 'expirada') {
  mostrarInfo('Sua sessão expirou. Faça login novamente para continuar.');
}
if (params.get('logout') === '1') {
  mostrarInfo('Você saiu do sistema com sucesso.');
}

// ── Handlers ───────────────────────────────────────────────────────────────

btnLogin.addEventListener('click', () => submeterLogin());

// Permite enviar com Enter nos campos
emailInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') senhaInput.focus(); });
senhaInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') submeterLogin(); });

// Limpa o erro ao digitar
emailInput.addEventListener('input', limparErro);
senhaInput.addEventListener('input', limparErro);

// ── Função principal ───────────────────────────────────────────────────────

async function submeterLogin() {
  const email = emailInput.value.trim();
  const senha = senhaInput.value;

  // Validação básica de UX (a validação de negócio ocorre no back-end)
  if (!email || !senha) {
    mostrarErro('Preencha e-mail e senha para continuar.');
    return;
  }

  setCarregando(true);

  try {
    const { token, usuario } = await authApi.login(email, senha);
    saveSession(token, usuario);
    window.location.replace('/pages/dashboard.html');

  } catch (err) {
    if (err.status === 401) {
      mostrarErro('E-mail ou senha incorretos. Verifique suas credenciais.');
    } else if (err.status === 0) {
      mostrarErro('Sem conexão com o servidor. Tente novamente em instantes.');
    } else {
      mostrarErro(err.message || 'Erro inesperado. Tente novamente.');
    }
    senhaInput.value = '';
    senhaInput.focus();
  } finally {
    setCarregando(false);
  }
}

// ── Helpers de UI ──────────────────────────────────────────────────────────

function setCarregando(ativo) {
  btnLogin.disabled = ativo;
  btnLogin.textContent = ativo ? 'Autenticando...' : 'Entrar';
  if (ativo) btnLogin.classList.add('is-loading');
  else       btnLogin.classList.remove('is-loading');
}

function mostrarErro(mensagem) {
  alertError.textContent = mensagem;
  alertError.classList.add('is-visible');
  alertInfo.classList.remove('is-visible');
}

function mostrarInfo(mensagem) {
  alertInfo.textContent = mensagem;
  alertInfo.classList.add('is-visible');
}

function limparErro() {
  alertError.classList.remove('is-visible');
}
