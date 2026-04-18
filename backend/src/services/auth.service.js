'use strict';

const bcrypt = require('bcryptjs');
const prisma = require('../config/database');
const { signToken } = require('../config/jwt');

class AuthService {
  /**
   * Autentica um usuário com email e senha.
   * Retorna o token JWT e os dados públicos do usuário.
   *
   * @param {string} email
   * @param {string} senha
   * @returns {{ token: string, usuario: object }}
   */
  async login(email, senha) {
    const usuario = await prisma.usuario.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (!usuario || !usuario.ativo) {
      throw { statusCode: 401, message: 'Credenciais inválidas.' };
    }

    const senhaCorreta = await bcrypt.compare(senha, usuario.senhaHash);
    if (!senhaCorreta) {
      throw { statusCode: 401, message: 'Credenciais inválidas.' };
    }

    const payload = {
      id: usuario.id,
      nome: usuario.nome,
      email: usuario.email,
      papel: usuario.papel,
    };

    const token = signToken(payload);

    return {
      token,
      usuario: payload,
    };
  }

  /**
   * Retorna os dados públicos do usuário pelo ID.
   * @param {string} id
   */
  async perfil(id) {
    const usuario = await prisma.usuario.findUnique({
      where: { id },
      select: {
        id: true,
        nome: true,
        email: true,
        papel: true,
        secretaria: { select: { id: true, nome: true } },
        createdAt: true,
      },
    });

    if (!usuario) {
      throw { statusCode: 404, message: 'Usuário não encontrado.' };
    }

    return usuario;
  }
}

module.exports = new AuthService();
