/**
 * pages/listagem.js
 */

import { requireAuth, logout }   from '../auth/guard.js';
import { getUser }               from '../auth/session.js';
import { patrimonioApi }         from '../api/patrimonio.api.js';
import { api }                   from '../api/client.js';
import { formatMoeda, formatData, formatEstadoConservacao,
         formatTipo, formatIniciais } from '../utils/format.js';

requireAuth();

// ── Estado ───────────────────────────────────────────────────────────
const estado = {
  page: 1, limit: 20, total: 0, totalPages: 0,
  busca: '', tipo: '', estado: '', secretariaId: '',
};

// ── DOM ──────────────────────────────────────────────────────────────
const tbody         = document.getElementById('tabela-patrimonios');
const totalLabel    = document.getElementById('total-registros');
const paginacaoInfo = document.getElementById('paginacao-info');
const paginacaoCtrl = document.getElementById('paginacao-controles');
const filtroBusca   = document.getElementById('filtro-busca');
const filtroTipo    = document.getElementById('filtro-tipo');
const filtroEstado  = document.getElementById('filtro-estado');
const filtroSec     = document.getElementById('filtro-secretaria');
const btnLimpar     = document.getElementById('btn-limpar-filtros');
const sidebar       = document.getElementById('sidebar');
const appWrapper    = document.getElementById('app-wrapper');
const overlay       = document.getElementById('sidebar-overlay');

// ── Usuário ──────────────────────────────────────────────────────────
const usuario = getUser();
if (usuario) {
  document.getElementById('user-name').textContent   = usuario.nome;
  document.getElementById('user-papel').textContent  = usuario.papel;
  document.getElementById('user-avatar').textContent = formatIniciais(usuario.nome);
}

// ── Sidebar toggle ───────────────────────────────────────────────────
document.getElementById('btn-toggle-sidebar').addEventListener('click', () => {
  const isMobile = window.innerWidth <= 1024;
  if (isMobile) {
    sidebar.classList.toggle('mobile-open');
    overlay.classList.toggle('visible');
  } else {
    sidebar.classList.toggle('collapsed');
    appWrapper.classList.toggle('expanded');
  }
});

overlay.addEventListener('click', () => {
  sidebar.classList.remove('mobile-open');
  overlay.classList.remove('visible');
});

// ── Logout ───────────────────────────────────────────────────────────
document.getElementById('btn-logout').addEventListener('click', () => logout());

// ── Secretarias ──────────────────────────────────────────────────────
async function carregarSecretarias() {
  try {
    const resp = await api.get('/secretarias');
    (resp.data || []).forEach((s) => {
      const opt = document.createElement('option');
      opt.value = s.id;
      opt.textContent = s.sigla;
      filtroSec.appendChild(opt);
    });
  } catch { /* falha silenciosa */ }
}

// ── Filtros ───────────────────────────────────────────────────────────
let debounceTimer;
filtroBusca.addEventListener('input', () => {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => { estado.busca = filtroBusca.value.trim(); estado.page = 1; carregar(); }, 400);
});

filtroTipo.addEventListener('change',   () => { estado.tipo        = filtroTipo.value;   estado.page = 1; carregar(); });
filtroEstado.addEventListener('change', () => { estado.estado      = filtroEstado.value; estado.page = 1; carregar(); });
filtroSec.addEventListener('change',    () => { estado.secretariaId = filtroSec.value;   estado.page = 1; carregar(); });

btnLimpar.addEventListener('click', () => {
  filtroBusca.value = filtroTipo.value = filtroEstado.value = filtroSec.value = '';
  Object.assign(estado, { busca: '', tipo: '', estado: '', secretariaId: '', page: 1 });
  carregar();
});

// ── Carregar ──────────────────────────────────────────────────────────
async function carregar() {
  tbody.innerHTML = `<tr><td colspan="8" class="text-center py-4 text-muted">
    <div class="spinner-border spinner-border-sm me-2"></div>Carregando...</td></tr>`;

  try {
    const resp = await patrimonioApi.listar({
      page: estado.page, limit: estado.limit,
      busca: estado.busca || undefined,
      tipo: estado.tipo || undefined,
      estado: estado.estado || undefined,
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
    tbody.innerHTML = `<tr><td colspan="8" class="text-center py-4 text-danger">
      Erro ao carregar: ${err.message}</td></tr>`;
  }
}

function renderTabela(bens) {
  if (!bens.length) {
    tbody.innerHTML = `<tr><td colspan="8" class="text-center py-4 text-muted">
      Nenhum bem encontrado.</td></tr>`;
    return;
  }

  tbody.innerHTML = bens.map(b => `
    <tr onclick="window.location.href='patrimonio-detalhe.html?id=${b.id}'" title="${b.descricao}">
      <td><span class="tombamento-code">${b.tombamento}</span></td>
      <td class="text-truncate" style="max-width:260px">${b.descricao}</td>
      <td><span class="badge-estado badge-${b.tipo === 'MOVEL' ? 'movel' : 'imovel'}">${formatTipo(b.tipo)}</span></td>
      <td class="text-muted">${b.secretaria?.nome ?? '—'}</td>
      <td><span class="badge-estado badge-${b.estadoConservacao.toLowerCase()}">${formatEstadoConservacao(b.estadoConservacao)}</span></td>
      <td class="text-muted">${b.valorAquisicao ? formatMoeda(b.valorAquisicao) : '—'}</td>
      <td class="text-muted">${formatData(b.dataAquisicao)}</td>
      <td>
        <a href="patrimonio-detalhe.html?id=${b.id}" class="btn btn-ghost btn-sm" onclick="event.stopPropagation()">
          <i class="bi bi-eye"></i>
        </a>
      </td>
    </tr>
  `).join('');
}

function renderPaginacao() {
  const inicio = ((estado.page - 1) * estado.limit) + 1;
  const fim    = Math.min(estado.page * estado.limit, estado.total);
  paginacaoInfo.textContent = estado.total > 0
    ? `${inicio}–${fim} de ${estado.total.toLocaleString('pt-BR')}`
    : 'Nenhum resultado';

  paginacaoCtrl.innerHTML = '';
  if (estado.totalPages <= 1) return;

  paginacaoCtrl.appendChild(criarBtn('‹', estado.page - 1, estado.page <= 1));

  paginasVisiveis(estado.page, estado.totalPages).forEach(p => {
    if (p === '...') {
      const sep = document.createElement('span');
      sep.textContent = '…';
      sep.style.cssText = 'padding:0 6px;color:#9ca3af;line-height:32px';
      paginacaoCtrl.appendChild(sep);
    } else {
      const btn = criarBtn(p, p, false);
      if (p === estado.page) btn.classList.add('active');
      paginacaoCtrl.appendChild(btn);
    }
  });

  paginacaoCtrl.appendChild(criarBtn('›', estado.page + 1, estado.page >= estado.totalPages));
}

function criarBtn(label, pagina, disabled) {
  const btn = document.createElement('button');
  btn.textContent = label;
  btn.disabled = disabled;
  if (!disabled) btn.addEventListener('click', () => { estado.page = pagina; carregar(); window.scrollTo({top:0,behavior:'smooth'}); });
  return btn;
}

function paginasVisiveis(atual, total) {
  if (total <= 7) return Array.from({length: total}, (_, i) => i + 1);
  if (atual <= 4) return [1,2,3,4,5,'...',total];
  if (atual >= total - 3) return [1,'...',total-4,total-3,total-2,total-1,total];
  return [1,'...',atual-1,atual,atual+1,'...',total];
}

// ── Iniciar ───────────────────────────────────────────────────────────
carregarSecretarias();
carregar();