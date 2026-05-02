/**
 * pages/detalhe.js
 */

import { requireAuth, logout } from '../auth/guard.js';
import { getUser }             from '../auth/session.js';
import { patrimonioApi }       from '../api/patrimonio.api.js';
import {
  formatMoeda, formatData, formatDataRelativa,
  formatEstadoConservacao, formatTipo,
  formatTipoMovimentacao, formatIniciais,
} from '../utils/format.js';

requireAuth();

// ── Usuário ──────────────────────────────────────────────────────────
const usuario = getUser();
if (usuario) {
  document.getElementById('user-name').textContent   = usuario.nome;
  document.getElementById('user-papel').textContent  = usuario.papel;
  document.getElementById('user-avatar').textContent = formatIniciais(usuario.nome);
}

// ── Sidebar toggle ───────────────────────────────────────────────────
const sidebar    = document.getElementById('sidebar');
const appWrapper = document.getElementById('app-wrapper');
const overlay    = document.getElementById('sidebar-overlay');

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

// ── Identificador da URL ─────────────────────────────────────────────
const params        = new URLSearchParams(window.location.search);
const identificador = params.get('id') || params.get('tombamento');

if (!identificador) mostrarErro();

// ── Carregar bem ─────────────────────────────────────────────────────
async function carregarBem() {
  try {
    const bem = await patrimonioApi.buscar(identificador);
    renderBem(bem);
    if (params.get('novo') === '1') {
      mostrarToast(`Bem tombado com sucesso! Número: ${bem.tombamento}`, 'success');
    }
  } catch (err) {
    mostrarErro(err.message);
  }
}

// ── Renderizar bem ───────────────────────────────────────────────────
function renderBem(bem) {
  document.getElementById('estado-carregando').style.display = 'none';
  document.getElementById('conteudo-bem').style.display      = 'block';

  document.getElementById('header-tombamento').textContent = bem.tombamento;
  document.getElementById('breadcrumb-atual').textContent  = bem.tombamento;
  document.title = `${bem.tombamento} — Patrimônio Inteligente`;

  // Badges
  const badgeTipo   = document.getElementById('badge-tipo');
  const badgeEstado = document.getElementById('badge-estado');
  badgeTipo.textContent  = formatTipo(bem.tipo);
  badgeTipo.className    = `badge badge--${bem.tipo.toLowerCase()}`;
  badgeEstado.textContent = formatEstadoConservacao(bem.estadoConservacao);
  badgeEstado.className   = `badge badge--${bem.estadoConservacao.toLowerCase()}`;

  // Identificação
  document.getElementById('dados-identificacao').innerHTML = [
    dado('Número de Tombamento', `<code style="background:#f3f4f6;padding:2px 8px;border-radius:4px;font-size:.85rem">${bem.tombamento}</code>`),
    dado('Descrição', bem.descricao),
    dado('Tipo', formatTipo(bem.tipo)),
    dado('Estado', formatEstadoConservacao(bem.estadoConservacao)),
    dado('Marca', bem.marca || '—'),
    dado('Modelo', bem.modelo || '—'),
    dado('Nº de Série', bem.numeroSerie || '—'),
    dado('Valor de Aquisição', bem.valorAquisicao ? formatMoeda(bem.valorAquisicao) : '—'),
    dado('Data de Aquisição', formatData(bem.dataAquisicao)),
    dado('Tombado em', formatData(bem.createdAt, true)),
  ].join('');

  // Localização
  document.getElementById('dados-localizacao').innerHTML = [
    dado('Secretaria Detentora', bem.secretaria?.nome || '—'),
    dado('Responsável', bem.responsavel?.nome || '—'),
    dado('Localização Física', bem.localizacao || '—'),
    bem.observacoes ? dado('Observações', bem.observacoes) : '',
  ].join('');

  // QR Code
  if (bem.qrCode) {
    document.getElementById('qr-code-img').src     = bem.qrCode;
    document.getElementById('qr-tombamento').textContent = bem.tombamento;
  }

  // Foto
  if (bem.foto) {
    const cardFoto = document.getElementById('card-foto');
    const imgFoto  = document.getElementById('foto-bem');
    imgFoto.src = bem.foto;
    cardFoto.style.display = 'block';
  }

  // Timeline
  renderTimeline(bem.movimentacoes || []);

  // Botões de ação
  const podeEditar = ['ADMIN', 'GESTOR', 'OPERADOR'].includes(usuario?.papel);
  if (podeEditar) {
    const btnEditar = document.getElementById('btn-editar');
    btnEditar.classList.remove('is-hidden');
    btnEditar.addEventListener('click', () => {
      window.location.href = `patrimonio-cadastro.html?editar=${bem.id}`;
    });
    document.getElementById('btn-imprimir-qr').classList.remove('is-hidden');
  }

  ['btn-imprimir-qr', 'btn-imprimir-qr-lateral'].forEach(id => {
    document.getElementById(id)?.addEventListener('click', () => imprimirEtiqueta(bem));
  });
}

function dado(label, valor) {
  return `<div><div class="dado-label">${label}</div><div class="dado-valor">${valor}</div></div>`;
}

// ── Timeline ─────────────────────────────────────────────────────────
function renderTimeline(movimentacoes) {
  const container = document.getElementById('timeline-movimentacoes');
  if (!movimentacoes.length) {
    container.innerHTML = `<p class="text-muted" style="font-size:.85rem">Nenhuma movimentação registrada.</p>`;
    return;
  }
  container.innerHTML = movimentacoes.map(m => `
    <div class="timeline__item">
      <div class="timeline__dot">${iconeMovimentacao(m.tipo)}</div>
      <div class="timeline__body">
        <div class="timeline__tipo">${formatTipoMovimentacao(m.tipo)}</div>
        <div class="timeline__descricao">${m.descricao}</div>
        <div class="timeline__meta">
          ${m.usuario?.nome || '—'} &middot; ${formatData(m.createdAt, true)}
          (${formatDataRelativa(m.createdAt)})
        </div>
      </div>
    </div>
  `).join('');
}

function iconeMovimentacao(tipo) {
  const icones = {
    CADASTRO:      '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/></svg>',
    ATUALIZACAO:   '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>',
    TRANSFERENCIA: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 1l4 4-4 4"/><path d="M3 11V9a4 4 0 014-4h14"/><path d="M7 23l-4-4 4-4"/><path d="M21 13v2a4 4 0 01-4 4H3"/></svg>',
    MANUTENCAO:    '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z"/></svg>',
    OCORRENCIA:    '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',
    BAIXA:         '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>',
    PERMUTA:       '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M7 16V4m0 0L3 8m4-4l4 4"/><path d="M17 8v12m0 0l4-4m-4 4l-4-4"/></svg>',
  };
  return icones[tipo] || '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="4"/></svg>';
}

// ── Imprimir etiqueta ────────────────────────────────────────────────
function imprimirEtiqueta(bem) {
  const janela = window.open('', '_blank', 'width=220,height=260');
  janela.document.write(`<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8"/>
    <title>Etiqueta — ${bem.tombamento}</title>
    <style>
      @page { size: 50mm 50mm; margin: 0; }
      * { box-sizing: border-box; margin: 0; padding: 0; }
      body { width:50mm;height:50mm;font-family:Arial,sans-serif;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:2mm;background:#fff; }
      .prefeitura { font-size:5.5px;color:#444;text-align:center;text-transform:uppercase;letter-spacing:.03em;margin-bottom:1mm; }
      .titulo { font-size:6px;font-weight:bold;text-transform:uppercase;letter-spacing:.05em;color:#000;margin-bottom:1.5mm; }
      .qr { width:28mm;height:28mm;border:.3mm solid #ccc;border-radius:1mm; }
      .tombamento { font-size:8px;font-weight:bold;letter-spacing:.08em;color:#000;margin-top:1.5mm;font-family:'Courier New',monospace; }
      .secretaria { font-size:5px;color:#555;text-align:center;margin-top:.8mm;max-width:46mm;white-space:nowrap;overflow:hidden;text-overflow:ellipsis; }
      @media print { html,body { width:50mm;height:50mm; } }
    </style></head><body>
    <div class="prefeitura">Prefeitura Municipal de Oriximiná/PA</div>
    <div class="titulo">Patrimônio Público</div>
    <img class="qr" src="${bem.qrCode}" alt="QR Code" />
    <div class="tombamento">${bem.tombamento}</div>
    <div class="secretaria">${bem.secretaria?.nome || ''}</div>
    <script>window.onload=()=>{setTimeout(()=>{window.print();window.close();},300);}<\/script>
    </body></html>`);
  janela.document.close();
}

// ── Erro ─────────────────────────────────────────────────────────────
function mostrarErro() {
  document.getElementById('estado-carregando').style.display = 'none';
  document.getElementById('estado-erro').style.display       = 'block';
}

// ── Toast ─────────────────────────────────────────────────────────────
function mostrarToast(mensagem, tipo = 'info') {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = `toast toast--${tipo}`;
  toast.innerHTML = `<span class="toast__message">${mensagem}</span>
    <button class="toast__close" onclick="this.parentElement.remove()">&times;</button>`;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), 5000);
}

// ── Iniciar ───────────────────────────────────────────────────────────
if (identificador) carregarBem();