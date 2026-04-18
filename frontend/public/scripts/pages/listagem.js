/**
 * pages/listagem.js
 * Lógica da página de listagem de bens patrimoniais.
 */

import { requireAuth, logout }   from '../auth/guard.js';
import { getUser }               from '../auth/session.js';
import { patrimonioApi }         from '../api/patrimonio.api.js';
import { api }                   from '../api/client.js';
import { formatMoeda, formatData, formatEstadoConservacao,
         formatTipo, formatIniciais } from '../utils/format.js';

requireAuth();

// ── Estado da listagem ─────────────────────────────────────────────────────
const estado = {
  page:        1,
  limit:       20,
  total:       0,
  totalPages:  0,
  busca:       '',
  tipo:        '',
  estado:      '',
  secretariaId: '',
};

// ── Elementos do DOM ───────────────────────────────────────────────────────
const tbody         = document.getElementById('tabela-patrimonios');
const totalLabel    = document.getElementById('total-registros');
const paginacaoInfo = document.getElementById('paginacao-info');
const paginacaoCtrl = document.getElementById('paginacao-controles');
const filtroBusca   = document.getElementById('filtro-busca');
const filtroTipo    = document.getElementById('filtro-tipo');
const filtroEstado  = document.getElementById('filtro-estado');
const filtroSec     = document.getElementById('filtro-secretaria');
const btnLimpar     = document.getElementById('btn-limpar-filtros');

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

// ── Carregar secretarias no filtro ─────────────────────────────────────────
async function carregarSecretarias() {
  try {
    const resp = await api.get('/secretarias');
    const secretarias = resp.data || [];
    secretarias.forEach((s) => {
      const opt = document.createElement('option');
      opt.value = s.id;
      opt.textContent = s.sigla;
      filtroSec.appendChild(opt);
    });
  } catch {
    // Secretarias não críticas para a listagem — falha silenciosa
  }
}

// ── Filtros com debounce ───────────────────────────────────────────────────
let debounceTimer;
filtroBusca.addEventListener('input', () => {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    estado.busca = filtroBusca.value.trim();
    estado.page  = 1;
    carregar();
  }, 400);
});

filtroTipo.addEventListener('change',   () => { estado.tipo = filtroTipo.value;   estado.page = 1; carregar(); });
filtroEstado.addEventListener('change', () => { estado.estado = filtroEstado.value; estado.page = 1; carregar(); });
filtroSec.addEventListener('change',    () => { estado.secretariaId = filtroSec.value; estado.page = 1; carregar(); });

btnLimpar.addEventListener('click', () => {
  filtroBusca.value  = '';
  filtroTipo.value   = '';
  filtroEstado.value = '';
  filtroSec.value    = '';
  Object.assign(estado, { busca: '', tipo: '', estado: '', secretariaId: '', page: 1 });
  carregar();
});

// ── Carregar dados ─────────────────────────────────────────────────────────
async function carregar() {
  renderCarregando();

  try {
    const resp = await patrimonioApi.listar({
      page:        estado.page,
      limit:       estado.limit,
      busca:       estado.busca       || undefined,
      tipo:        estado.tipo        || undefined,
      estado:      estado.estado      || undefined,
      secretariaId: estado.secretariaId || undefined,
    });

    const bens = resp.data || [];
    const meta = resp.meta || {};

    estado.total      = meta.total ?? 0;
    estado.totalPages = meta.totalPages ?? 0;

    totalLabel.textContent = estado.total.toLocaleString('pt-BR');

    renderTabela(bens);
    renderPaginacao();

  } catch (err) {
    tbody.innerHTML = `
      <tr>
        <td colspan="8" class="text-center text-muted" style="padding: var(--space-8);">
          Erro ao carregar bens: ${err.message}. Tente recarregar.
        </td>
      </tr>`;
  }
}

function renderCarregando() {
  tbody.innerHTML = `
    <tr>
      <td colspan="8" class="text-center" style="padding: var(--space-8);">
        <span class="spinner" aria-label="Carregando..."></span>
      </td>
    </tr>`;
}

function renderTabela(bens) {
  if (!bens.length) {
    tbody.innerHTML = `
      <tr>
        <td colspan="8" class="text-center text-muted" style="padding: var(--space-8);">
          Nenhum bem encontrado com os filtros aplicados.
        </td>
      </tr>`;
    return;
  }

  tbody.innerHTML = bens.map((bem) => `
    <tr onclick="window.location.href='patrimonio-detalhe.html?id=${bem.id}'" title="Ver detalhes de ${bem.descricao}">
      <td>
        <code style="font-size: var(--font-size-xs); background: var(--color-gray-100); padding: 2px 6px; border-radius: 4px; white-space: nowrap;">
          ${bem.tombamento}
        </code>
      </td>
      <td class="text-truncate" style="max-width: 280px;">${bem.descricao}</td>
      <td><span class="badge badge--${bem.tipo.toLowerCase()}">${formatTipo(bem.tipo)}</span></td>
      <td class="text-muted">${bem.secretaria?.nome ?? '—'}</td>
      <td><span class="badge badge--${bem.estadoConservacao.toLowerCase()}">${formatEstadoConservacao(bem.estadoConservacao)}</span></td>
      <td class="text-muted">${bem.valorAquisicao ? formatMoeda(bem.valorAquisicao) : '—'}</td>
      <td class="text-muted">${formatData(bem.dataAquisicao)}</td>
      <td>
        <a href="patrimonio-detalhe.html?id=${bem.id}" class="btn btn-ghost btn-sm" onclick="event.stopPropagation()" title="Ver detalhe">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
        </a>
      </td>
    </tr>
  `).join('');
}

function renderPaginacao() {
  const inicio = ((estado.page - 1) * estado.limit) + 1;
  const fim    = Math.min(estado.page * estado.limit, estado.total);

  paginacaoInfo.textContent = estado.total > 0
    ? `Exibindo ${inicio}–${fim} de ${estado.total.toLocaleString('pt-BR')} bens`
    : 'Nenhum resultado';

  paginacaoCtrl.innerHTML = '';

  if (estado.totalPages <= 1) return;

  // Botão anterior
  const btnAnterior = criarBtnPagina('‹', estado.page - 1, estado.page <= 1, 'Página anterior');
  paginacaoCtrl.appendChild(btnAnterior);

  // Páginas visíveis
  const paginas = paginasVisiveis(estado.page, estado.totalPages);
  paginas.forEach((p) => {
    if (p === '...') {
      const sep = document.createElement('span');
      sep.textContent = '…';
      sep.style.padding = '0 var(--space-2)';
      sep.style.color = 'var(--color-gray-400)';
      paginacaoCtrl.appendChild(sep);
    } else {
      const btn = criarBtnPagina(p, p, false, `Página ${p}`);
      if (p === estado.page) btn.classList.add('is-active');
      paginacaoCtrl.appendChild(btn);
    }
  });

  // Botão próximo
  const btnProximo = criarBtnPagina('›', estado.page + 1, estado.page >= estado.totalPages, 'Próxima página');
  paginacaoCtrl.appendChild(btnProximo);
}

function criarBtnPagina(label, pagina, desabilitado, ariaLabel) {
  const btn = document.createElement('button');
  btn.className = 'pagination__btn';
  btn.textContent = label;
  btn.setAttribute('aria-label', ariaLabel || label);
  btn.disabled = desabilitado;
  if (!desabilitado) {
    btn.addEventListener('click', () => {
      estado.page = pagina;
      carregar();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }
  return btn;
}

function paginasVisiveis(atual, total) {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  if (atual <= 4) return [1, 2, 3, 4, 5, '...', total];
  if (atual >= total - 3) return [1, '...', total-4, total-3, total-2, total-1, total];
  return [1, '...', atual-1, atual, atual+1, '...', total];
}

// ── Iniciar ────────────────────────────────────────────────────────────────
carregarSecretarias();
carregar();
