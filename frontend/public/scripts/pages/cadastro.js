/**
 * pages/cadastro.js
 * Lógica da página de cadastro de novo bem patrimonial.
 */

import { requireRole, logout }  from '../auth/guard.js';
import { getUser }              from '../auth/session.js';
import { patrimonioApi }        from '../api/patrimonio.api.js';
import { api }                  from '../api/client.js';
import { formatIniciais }       from '../utils/format.js';

// Apenas ADMIN, GESTOR e OPERADOR podem cadastrar
requireRole('ADMIN', 'GESTOR', 'OPERADOR');

// ── Usuário ────────────────────────────────────────────────────────────────
const usuario = getUser();
if (usuario) {
  document.getElementById('user-name').textContent   = usuario.nome;
  document.getElementById('user-papel').textContent  = usuario.papel;
  document.getElementById('user-avatar').textContent = formatIniciais(usuario.nome);
}

// ── Sidebar e logout ───────────────────────────────────────────────────────
document.getElementById('btn-toggle-sidebar').addEventListener('click', () => {
  document.getElementById('app-shell').classList.toggle('sidebar-collapsed');
  document.getElementById('sidebar').classList.toggle('is-collapsed');
});
document.getElementById('btn-logout').addEventListener('click', () => logout());

// ── Carregar secretarias ───────────────────────────────────────────────────
const selectSecretaria = document.getElementById('secretariaId');

async function carregarSecretarias() {
  try {
    const resp = await api.get('/secretarias');
    const secretarias = resp.data || [];
    secretarias.forEach((s) => {
      const opt = document.createElement('option');
      opt.value = s.id;
      opt.textContent = `${s.sigla} — ${s.nome}`;
      selectSecretaria.appendChild(opt);
    });
  } catch {
    mostrarErroBanner('Não foi possível carregar as secretarias. Recarregue a página.');
  }
}

// ── Validação de campo individual ──────────────────────────────────────────
function validarCampo(id, errId, condicao, mensagem) {
  const campo = document.getElementById(id);
  const erro  = document.getElementById(errId);
  if (!condicao) {
    campo.classList.add('has-error');
    if (erro) { erro.textContent = mensagem; erro.classList.remove('is-hidden'); }
    return false;
  }
  campo.classList.remove('has-error');
  if (erro) { erro.textContent = ''; erro.classList.add('is-hidden'); }
  return true;
}

function limparErrosCampo(id, errId) {
  const campo = document.getElementById(id);
  const erro  = document.getElementById(errId);
  if (campo) campo.classList.remove('has-error');
  if (erro)  { erro.textContent = ''; erro.classList.add('is-hidden'); }
}

// ── Limpar erros ao editar ─────────────────────────────────────────────────
['descricao', 'tipo', 'estadoConservacao', 'secretariaId'].forEach((id) => {
  document.getElementById(id)?.addEventListener('input',  () => limparErrosCampo(id, `err-${id}`));
  document.getElementById(id)?.addEventListener('change', () => limparErrosCampo(id, `err-${id}`));
});

// ── Validar formulário completo ────────────────────────────────────────────
function validarFormulario() {
  const descricao = document.getElementById('descricao').value.trim();
  const tipo      = document.getElementById('tipo').value;
  const estado    = document.getElementById('estadoConservacao').value;
  const secId     = document.getElementById('secretariaId').value;

  const v1 = validarCampo('descricao',        'err-descricao',        descricao.length >= 3, 'Descrição deve ter ao menos 3 caracteres.');
  const v2 = validarCampo('tipo',             'err-tipo',             !!tipo,                'Selecione o tipo do bem.');
  const v3 = validarCampo('estadoConservacao','err-estadoConservacao',!!estado,              'Selecione o estado de conservação.');
  const v4 = validarCampo('secretariaId',     'err-secretariaId',     !!secId,               'Selecione a secretaria detentora.');

  return v1 && v2 && v3 && v4;
}

// ── Montar payload ─────────────────────────────────────────────────────────
function montarPayload() {
  const valor = document.getElementById('valorAquisicao').value;
  const data  = document.getElementById('dataAquisicao').value;

  const payload = {
    descricao:         document.getElementById('descricao').value.trim(),
    tipo:              document.getElementById('tipo').value,
    estadoConservacao: document.getElementById('estadoConservacao').value,
    secretariaId:      document.getElementById('secretariaId').value,
  };

  const opcional = {
    marca:       document.getElementById('marca').value.trim(),
    modelo:      document.getElementById('modelo').value.trim(),
    numeroSerie: document.getElementById('numeroSerie').value.trim(),
    localizacao: document.getElementById('localizacao').value.trim(),
    observacoes: document.getElementById('observacoes').value.trim(),
  };

  // Só inclui campos opcionais se preenchidos
  Object.entries(opcional).forEach(([key, val]) => { if (val) payload[key] = val; });

  if (valor) payload.valorAquisicao = parseFloat(valor);
  if (data)  payload.dataAquisicao  = new Date(data).toISOString();

  return payload;
}

// ── Submit ─────────────────────────────────────────────────────────────────
const btnSalvar = document.getElementById('btn-salvar');

btnSalvar.addEventListener('click', async () => {
  limparErroBanner();

  if (!validarFormulario()) {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    return;
  }

  setCarregando(true);

  try {
    const payload  = montarPayload();
    const patrimonio = await patrimonioApi.criar(payload);

    // Redireciona para o detalhe do bem recém-criado
    window.location.replace(`patrimonio-detalhe.html?id=${patrimonio.id}&novo=1`);

  } catch (err) {
    if (err.isValidation && err.errors) {
      const mensagens = err.errors.map((e) => `• ${e.campo}: ${e.mensagem}`).join('\n');
      mostrarErroBanner(`Corrija os campos abaixo:\n${mensagens}`);
    } else {
      mostrarErroBanner(err.message || 'Erro ao salvar o bem. Tente novamente.');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  } finally {
    setCarregando(false);
  }
});

// ── Helpers de UI ──────────────────────────────────────────────────────────
function setCarregando(ativo) {
  btnSalvar.disabled    = ativo;
  btnSalvar.textContent = ativo ? 'Salvando...' : 'Salvar e Tombar Bem';
  if (ativo) btnSalvar.classList.add('is-loading');
  else       btnSalvar.classList.remove('is-loading');
}

function mostrarErroBanner(mensagem) {
  const banner = document.getElementById('form-error-banner');
  banner.style.whiteSpace = 'pre-line';
  banner.textContent = mensagem;
  banner.classList.remove('is-hidden');
}

function limparErroBanner() {
  const banner = document.getElementById('form-error-banner');
  banner.textContent = '';
  banner.classList.add('is-hidden');
}

// ── Iniciar ────────────────────────────────────────────────────────────────
carregarSecretarias();
