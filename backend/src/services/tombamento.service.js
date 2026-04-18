'use strict';

const prisma = require('../config/database');

/**
 * Regra de geração do número de tombamento:
 *
 *   ORX-[ANO]-[SEQUENCIAL 5 DÍGITOS]
 *   Exemplo: ORX-2025-00001
 *
 * O sequencial é baseado na contagem de bens cadastrados no ano corrente,
 * garantindo unicidade via constraint do banco.
 */
class TombamentoService {
  /**
   * Gera o próximo número de tombamento disponível.
   * @returns {Promise<string>}
   */
  async gerar() {
    const ano = new Date().getFullYear();
    const prefixo = `ORX-${ano}-`;

    // Busca o último tombamento do ano para calcular o próximo sequencial
    const ultimo = await prisma.patrimonio.findFirst({
      where: { tombamento: { startsWith: prefixo } },
      orderBy: { tombamento: 'desc' },
      select: { tombamento: true },
    });

    let proximo = 1;
    if (ultimo) {
      const partes = ultimo.tombamento.split('-');
      proximo = parseInt(partes[2], 10) + 1;
    }

    return `${prefixo}${String(proximo).padStart(5, '0')}`;
  }
}

module.exports = new TombamentoService();
