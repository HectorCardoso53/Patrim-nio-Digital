'use strict';

const prisma = require('../config/database');
const tombamentoService = require('./tombamento.service');
const { gerarQRCode } = require('./qrcode.service');
const { parsePagination } = require('../utils/pagination');

class PatrimonioService {
  /**
   * Cria um novo bem patrimonial.
   * Gera automaticamente o tombamento e o QR Code.
   *
   * @param {object} dados
   * @param {string} usuarioId
   */
  async criar(dados, usuarioId) {
    const tombamento = await tombamentoService.gerar();
    const qrCode = await gerarQRCode(tombamento);

    const patrimonio = await prisma.patrimonio.create({
      data: {
        ...dados,
        tombamento,
        qrCode,
        responsavelId: dados.responsavelId || null,
        secretariaId: dados.secretariaId,
        createdById: usuarioId,
      },
      include: {
        secretaria: { select: { id: true, nome: true } },
        responsavel: { select: { id: true, nome: true } },
      },
    });

    // Registra evento de criação no histórico
    await prisma.movimentacao.create({
      data: {
        patrimonioId: patrimonio.id,
        tipo: 'CADASTRO',
        descricao: 'Bem cadastrado no sistema.',
        usuarioId,
      },
    });

    return patrimonio;
  }

  /**
   * Lista bens com filtros e paginação server-side.
   *
   * @param {object} query - req.query com page, limit e filtros
   */
  async listar(query) {
    const { skip, take, page, limit } = parsePagination(query);

    const where = {};

    if (query.secretariaId) where.secretariaId = query.secretariaId;
    if (query.tipo) where.tipo = query.tipo;
    if (query.estado) where.estadoConservacao = query.estado;
    if (query.busca) {
      where.OR = [
        { tombamento: { contains: query.busca, mode: 'insensitive' } },
        { descricao: { contains: query.busca, mode: 'insensitive' } },
        { marca: { contains: query.busca, mode: 'insensitive' } },
      ];
    }

    const [items, total] = await Promise.all([
      prisma.patrimonio.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          tombamento: true,
          descricao: true,
          tipo: true,
          estadoConservacao: true,
          valorAquisicao: true,
          dataAquisicao: true,
          secretaria: { select: { id: true, nome: true } },
          responsavel: { select: { id: true, nome: true } },
        },
      }),
      prisma.patrimonio.count({ where }),
    ]);

    return { items, total, page, limit };
  }

  /**
   * Retorna o detalhe completo de um bem pelo ID ou tombamento.
   * @param {string} identificador - ID (UUID) ou tombamento
   */
  async buscarPorIdentificador(identificador) {
    const where = identificador.startsWith('ORX-')
      ? { tombamento: identificador }
      : { id: identificador };

    const patrimonio = await prisma.patrimonio.findFirst({
      where,
      include: {
        secretaria: { select: { id: true, nome: true } },
        responsavel: { select: { id: true, nome: true } },
        movimentacoes: {
          orderBy: { createdAt: 'desc' },
          take: 20,
          include: {
            usuario: { select: { id: true, nome: true } },
          },
        },
      },
    });

    if (!patrimonio) {
      throw { statusCode: 404, message: 'Bem patrimonial não encontrado.' };
    }

    return patrimonio;
  }

  /**
   * Atualiza dados de um bem patrimonial.
   * @param {string} id
   * @param {object} dados
   * @param {string} usuarioId
   */
  async atualizar(id, dados, usuarioId) {
    const existente = await prisma.patrimonio.findUnique({ where: { id } });
    if (!existente) throw { statusCode: 404, message: 'Bem patrimonial não encontrado.' };

    const atualizado = await prisma.patrimonio.update({
      where: { id },
      data: dados,
      include: {
        secretaria: { select: { id: true, nome: true } },
        responsavel: { select: { id: true, nome: true } },
      },
    });

    await prisma.movimentacao.create({
      data: {
        patrimonioId: id,
        tipo: 'ATUALIZACAO',
        descricao: 'Dados do bem atualizados.',
        usuarioId,
      },
    });

    return atualizado;
  }

  /**
   * Indicadores resumidos para o dashboard.
   */
  async indicadores() {
    const [total, porSecretaria, porEstado] = await Promise.all([
      prisma.patrimonio.count(),
      prisma.patrimonio.groupBy({ by: ['secretariaId'], _count: true }),
      prisma.patrimonio.groupBy({ by: ['estadoConservacao'], _count: true }),
    ]);

    return { total, porSecretaria, porEstado };
  }
}

module.exports = new PatrimonioService();
