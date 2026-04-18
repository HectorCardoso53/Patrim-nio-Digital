/**
 * utils/format.js
 * Funções puras de formatação de dados para exibição.
 * Sem side effects, sem dependência de DOM.
 */

/**
 * Formata um valor monetário em Real brasileiro.
 * @param {number|string|null} valor
 * @returns {string}
 */
export function formatMoeda(valor) {
  if (valor === null || valor === undefined || valor === '') return '—';
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(Number(valor));
}

/**
 * Formata uma data ISO para exibição no padrão brasileiro.
 * @param {string|Date|null} data
 * @param {boolean} [comHora=false]
 * @returns {string}
 */
export function formatData(data, comHora = false) {
  if (!data) return '—';
  const d = new Date(data);
  if (isNaN(d)) return '—';
  const opts = { day: '2-digit', month: '2-digit', year: 'numeric' };
  if (comHora) {
    opts.hour = '2-digit';
    opts.minute = '2-digit';
  }
  return d.toLocaleDateString('pt-BR', opts);
}

/**
 * Formata data relativa (ex.: "há 3 dias").
 * @param {string|Date} data
 * @returns {string}
 */
export function formatDataRelativa(data) {
  if (!data) return '—';
  const rtf = new Intl.RelativeTimeFormat('pt-BR', { numeric: 'auto' });
  const diff = (new Date(data) - new Date()) / 1000;
  const limites = [
    { limite: 60,       divisor: 1,          unidade: 'second' },
    { limite: 3600,     divisor: 60,         unidade: 'minute' },
    { limite: 86400,    divisor: 3600,       unidade: 'hour'   },
    { limite: 2592000,  divisor: 86400,      unidade: 'day'    },
    { limite: 31536000, divisor: 2592000,    unidade: 'month'  },
    { limite: Infinity, divisor: 31536000,   unidade: 'year'   },
  ];
  for (const { limite, divisor, unidade } of limites) {
    if (Math.abs(diff) < limite) {
      return rtf.format(Math.round(diff / divisor), unidade);
    }
  }
  return formatData(data);
}

/**
 * Mapeia estado de conservação para texto legível.
 * @param {string} estado
 * @returns {string}
 */
export function formatEstadoConservacao(estado) {
  const mapa = {
    OTIMO:      'Ótimo',
    BOM:        'Bom',
    REGULAR:    'Regular',
    RUIM:       'Ruim',
    INSERVIVEL: 'Inservível',
  };
  return mapa[estado] ?? estado;
}

/**
 * Mapeia tipo de patrimônio para texto legível.
 * @param {string} tipo
 * @returns {string}
 */
export function formatTipo(tipo) {
  return tipo === 'MOVEL' ? 'Móvel' : tipo === 'IMOVEL' ? 'Imóvel' : tipo;
}

/**
 * Mapeia papel de usuário para texto legível.
 * @param {string} papel
 * @returns {string}
 */
export function formatPapel(papel) {
  const mapa = {
    ADMIN:        'Administrador',
    GESTOR:       'Gestor',
    OPERADOR:     'Operador',
    VISUALIZADOR: 'Visualizador',
  };
  return mapa[papel] ?? papel;
}

/**
 * Mapeia tipo de movimentação para texto legível.
 * @param {string} tipo
 * @returns {string}
 */
export function formatTipoMovimentacao(tipo) {
  const mapa = {
    CADASTRO:      'Cadastro',
    ATUALIZACAO:   'Atualização',
    TRANSFERENCIA: 'Transferência',
    MANUTENCAO:    'Manutenção',
    OCORRENCIA:    'Ocorrência',
    BAIXA:         'Baixa Patrimonial',
    PERMUTA:       'Permuta',
  };
  return mapa[tipo] ?? tipo;
}

/**
 * Retorna as iniciais do nome para exibição em avatars.
 * @param {string} nome
 * @returns {string} Ex.: "João Silva" → "JS"
 */
export function formatIniciais(nome) {
  if (!nome) return '?';
  return nome
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0].toUpperCase())
    .join('');
}
