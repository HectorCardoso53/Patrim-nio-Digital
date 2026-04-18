/**
 * pages/dashboard.js
 * Lógica da página de dashboard.
 */

import { requireAuth, logout }   from '../auth/guard.js';
import { getUser }               from '../auth/session.js';
import { patrimonioApi }         from '../api/patrimonio.api.js';
import { formatMoeda, formatData, formatEstadoConservacao,
         formatTipo, formatIniciais }  from '../utils/format.js';

requireAuth();

// ── Inicializar UI com dados do usuário ────────────────────────────────────
const usuario = getUser();
if (usuario) {
  document.getElementById('user-name').textContent    = usuario.nome;
  document.getElementById('user-papel').textContent   = usuario.papel;
  document.getElementById('user-avatar').textContent  = formatIniciais(usuario.nome);
}

document.getElementById('dashboard-date').textContent =
  new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

// ── Sidebar toggle ─────────────────────────────────────────────────────────
document.getElementById('btn-toggle-sidebar').addEventListener('click', () => {
  document.getElementById('app-shell').classList.toggle('sidebar-collapsed');
  document.getElementById('sidebar').classList.toggle('is-collapsed');
});

// ── Logout ─────────────────────────────────────────────────────────────────
document.getElementById('btn-logout').addEventListener('click', () => logout());

// ── Carregar dados ─────────────────────────────────────────────────────────
async function carregarDashboard() {
  await Promise.allSettled([
    carregarIndicadores(),
    carregarRecentes(),
  ]);
}

async function carregarIndicadores() {
  try {
    const dados = await patrimonioApi.indicadores();

    document.getElementById('kpi-total').textContent = dados.total ?? '0';

    // Calcula bens em bom estado (OTIMO + BOM)
    const porEstado = dados.porEstado || [];
    const bom = porEstado
      .filter((e) => ['OTIMO', 'BOM'].includes(e.estadoConservacao))
      .reduce((acc, e) => acc + (e._count || 0), 0);

    const atencao = porEstado
      .filter((e) => ['REGULAR', 'RUIM'].includes(e.estadoConservacao))
      .reduce((acc, e) => acc + (e._count || 0), 0);

    const inservivel = porEstado
      .filter((e) => e.estadoConservacao === 'INSERVIVEL')
      .reduce((acc, e) => acc + (e._count || 0), 0);

    document.getElementById('kpi-bom').textContent       = bom;
    document.getElementById('kpi-atencao').textContent   = atencao;
    document.getElementById('kpi-inservivel').textContent = inservivel;

  } catch {
    ['kpi-total','kpi-bom','kpi-atencao','kpi-inservivel'].forEach((id) => {
      document.getElementById(id).textContent = 'Erro';
    });
  }
}

async function carregarRecentes() {
  const tbody = document.getElementById('tabela-recentes');

  try {
    const resp = await patrimonioApi.listar({ limit: 8, page: 1 });
    const bens = resp.data || [];

    if (!bens.length) {
      tbody.innerHTML = `
        <tr>
          <td colspan="5" class="text-center text-muted" style="padding: var(--space-8);">
            Nenhum bem cadastrado ainda.
          </td>
        </tr>`;
      return;
    }

    tbody.innerHTML = bens.map((bem) => `
      <tr style="cursor:pointer;" onclick="window.location.href='patrimonio-detalhe.html?id=${bem.id}'">
        <td><code style="font-size: var(--font-size-xs); background: var(--color-gray-100); padding: 2px 6px; border-radius: 4px;">${bem.tombamento}</code></td>
        <td class="text-truncate" style="max-width: 260px;" title="${bem.descricao}">${bem.descricao}</td>
        <td>${bem.secretaria?.nome ?? '—'}</td>
        <td><span class="badge badge--${bem.estadoConservacao.toLowerCase()}">${formatEstadoConservacao(bem.estadoConservacao)}</span></td>
        <td class="text-muted">${formatData(bem.createdAt)}</td>
      </tr>
    `).join('');

  } catch {
    tbody.innerHTML = `
      <tr>
        <td colspan="5" class="text-center text-muted" style="padding: var(--space-6);">
          Não foi possível carregar os dados. Tente recarregar a página.
        </td>
      </tr>`;
  }
}

// ── Iniciar ────────────────────────────────────────────────────────────────
carregarDashboard();
