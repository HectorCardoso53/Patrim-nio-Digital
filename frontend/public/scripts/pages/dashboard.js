/**
 * pages/dashboard.js
 */
import { requireAuth, logout } from '../auth/guard.js';
import { getUser }             from '../auth/session.js';
import { formatIniciais }      from '../utils/format.js';
import { api }                 from '../api/client.js';

requireAuth();

// ── Usuário ──────────────────────────────────────────────────────
const usuario = getUser();
if (usuario) {
  document.getElementById('user-name').textContent   = usuario.nome;
  document.getElementById('user-papel').textContent  = usuario.papel;
  document.getElementById('user-avatar').textContent = formatIniciais(usuario.nome);
}

// ── Data ─────────────────────────────────────────────────────────
document.getElementById('dashboard-date').textContent =
  new Date().toLocaleDateString('pt-BR', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  });

// ── Sidebar toggle ───────────────────────────────────────────────
const sidebar  = document.getElementById('sidebar');
const wrapper  = document.getElementById('app-wrapper');
const overlay  = document.getElementById('sidebar-overlay');

document.getElementById('btn-toggle-sidebar').addEventListener('click', () => {
  const isMobile = window.innerWidth <= 1024;
  if (isMobile) {
    sidebar.classList.toggle('mobile-open');
    overlay.classList.toggle('visible');
  } else {
    sidebar.classList.toggle('collapsed');
    wrapper.classList.toggle('expanded');
  }
});

overlay.addEventListener('click', () => {
  sidebar.classList.remove('mobile-open');
  overlay.classList.remove('visible');
});

// ── Logout ───────────────────────────────────────────────────────
document.getElementById('btn-logout').addEventListener('click', () => logout());

// ── Badges ───────────────────────────────────────────────────────
function badgeEstado(estado) {
  const map = {
    OTIMO:      ['badge-otimo',     'Ótimo'],
    BOM:        ['badge-bom',       'Bom'],
    REGULAR:    ['badge-regular',   'Regular'],
    RUIM:       ['badge-ruim',      'Ruim'],
    INSERVIVEL: ['badge-inservivel','Inservível'],
  };
  const [cls, label] = map[estado] || ['badge-bom', estado];
  return `<span class="badge-estado ${cls}">${label}</span>`;
}

// ── Carregar dados ────────────────────────────────────────────────
async function carregarDados() {
  try {
    const [indic, lista] = await Promise.all([
      api.get('/patrimonio/dashboard/indicadores'),
      api.get('/patrimonio?limit=8&page=1'),
    ]);

    const porEstado = indic.data?.porEstado || [];
    const total     = indic.data?.total ?? 0;
    const conta     = (e) => porEstado.find(x => x.estadoConservacao === e)?._count ?? 0;

    document.getElementById('kpi-total').textContent     = total;
    document.getElementById('kpi-bom').textContent       = conta('OTIMO') + conta('BOM');
    document.getElementById('kpi-atencao').textContent   = conta('REGULAR') + conta('RUIM');
    document.getElementById('kpi-inservivel').textContent = conta('INSERVIVEL');

    const bens  = lista.data || [];
    const tbody = document.getElementById('tabela-recentes');

    if (!bens.length) {
      tbody.innerHTML = `<tr><td colspan="5" class="text-center py-4 text-muted">Nenhum bem cadastrado ainda.</td></tr>`;
      return;
    }

    tbody.innerHTML = bens.map(b => `
      <tr style="cursor:pointer" onclick="window.location.href='patrimonio-detalhe.html?id=${b.id}'">
        <td><span class="tombamento-code">${b.tombamento}</span></td>
        <td>${b.descricao}</td>
        <td class="text-muted">${b.secretaria?.nome ?? '—'}</td>
        <td>${badgeEstado(b.estadoConservacao)}</td>
        <td class="text-muted">${b.dataAquisicao ? new Date(b.dataAquisicao).toLocaleDateString('pt-BR') : '—'}</td>
      </tr>
    `).join('');

  } catch {
    document.getElementById('tabela-recentes').innerHTML =
      `<tr><td colspan="5" class="text-center py-3 text-danger">Erro ao carregar dados.</td></tr>`;
  }
}

carregarDados();