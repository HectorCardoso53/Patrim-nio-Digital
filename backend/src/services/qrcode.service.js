'use strict';

const QRCode = require('qrcode');

/**
 * Gera um QR Code em formato Data URL (base64 PNG).
 * O conteúdo do QR aponta para a URL de detalhe do bem,
 * permitindo leitura com qualquer leitor de QR Code.
 *
 * @param {string} tombamento - Número de tombamento do bem.
 * @param {string} [baseUrl]  - URL base do sistema. Usa variável de ambiente se omitida.
 * @returns {Promise<string>} Data URL da imagem PNG do QR Code.
 */
async function gerarQRCode(tombamento, baseUrl) {
  const url = baseUrl
    ? `${baseUrl}/pages/patrimonio-detalhe.html?tombamento=${tombamento}`
    : `${process.env.APP_URL || 'http://localhost:3000'}/pages/patrimonio-detalhe.html?tombamento=${tombamento}`;

  const dataUrl = await QRCode.toDataURL(url, {
    errorCorrectionLevel: 'H',
    width: 300,
    margin: 2,
    color: {
      dark: '#1a2e4a',
      light: '#ffffff',
    },
  });

  return dataUrl;
}

/**
 * Gera o QR Code como buffer PNG (útil para salvar em disco ou incluir em PDF).
 * @param {string} tombamento
 * @param {string} [baseUrl]
 * @returns {Promise<Buffer>}
 */
async function gerarQRCodeBuffer(tombamento, baseUrl) {
  const url = baseUrl
    ? `${baseUrl}/pages/patrimonio-detalhe.html?tombamento=${tombamento}`
    : `${process.env.APP_URL || 'http://localhost:3000'}/pages/patrimonio-detalhe.html?tombamento=${tombamento}`;

  return QRCode.toBuffer(url, {
    errorCorrectionLevel: 'H',
    width: 300,
    margin: 2,
  });
}

module.exports = { gerarQRCode, gerarQRCodeBuffer };
