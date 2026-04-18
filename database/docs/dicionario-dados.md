# Dicionário de Dados — Patrimônio Inteligente

**Prefeitura Municipal de Oriximiná/PA**
Última atualização: 2025

---

## Tabela: `secretarias`

| Campo      | Tipo         | Descrição                              |
|------------|--------------|----------------------------------------|
| id         | UUID (PK)    | Identificador único                    |
| nome       | VARCHAR      | Nome completo da secretaria            |
| sigla      | VARCHAR      | Sigla (única)                          |
| ativo      | BOOLEAN      | Secretaria ativa no sistema            |
| createdAt  | TIMESTAMP    | Data de criação                        |
| updatedAt  | TIMESTAMP    | Data da última atualização             |

---

## Tabela: `usuarios`

| Campo        | Tipo      | Descrição                                        |
|--------------|-----------|--------------------------------------------------|
| id           | UUID (PK) | Identificador único                              |
| nome         | VARCHAR   | Nome completo do usuário                         |
| email        | VARCHAR   | E-mail de acesso (único)                         |
| senhaHash    | VARCHAR   | Hash bcrypt da senha                             |
| papel        | ENUM      | ADMIN / GESTOR / OPERADOR / VISUALIZADOR         |
| ativo        | BOOLEAN   | Usuário habilitado no sistema                    |
| secretariaId | UUID (FK) | Secretaria à qual o usuário está vinculado       |
| createdAt    | TIMESTAMP | Data de criação                                  |
| updatedAt    | TIMESTAMP | Data da última atualização                       |

---

## Tabela: `patrimonios`

| Campo             | Tipo           | Descrição                                      |
|-------------------|----------------|------------------------------------------------|
| id                | UUID (PK)      | Identificador único                            |
| tombamento        | VARCHAR        | Número de tombamento (ORX-ANO-NNNNN) — único  |
| descricao         | VARCHAR        | Descrição do bem                               |
| tipo              | ENUM           | MOVEL / IMOVEL                                 |
| marca             | VARCHAR        | Marca do bem (opcional)                        |
| modelo            | VARCHAR        | Modelo do bem (opcional)                       |
| numeroSerie       | VARCHAR        | Número de série (opcional)                     |
| estadoConservacao | ENUM           | OTIMO / BOM / REGULAR / RUIM / INSERVIVEL      |
| valorAquisicao    | DECIMAL(15,2)  | Valor de aquisição em R$                       |
| dataAquisicao     | TIMESTAMP      | Data de aquisição                              |
| localizacao       | VARCHAR        | Localização física do bem                      |
| observacoes       | TEXT           | Observações gerais                             |
| qrCode            | TEXT           | Data URL base64 do QR Code gerado              |
| ativo             | BOOLEAN        | Bem ativo (false = baixado)                    |
| secretariaId      | UUID (FK)      | Secretaria detentora                           |
| responsavelId     | UUID (FK)      | Servidor responsável pelo bem                  |
| createdById       | UUID (FK)      | Usuário que cadastrou o bem                    |
| createdAt         | TIMESTAMP      | Data de tombamento                             |
| updatedAt         | TIMESTAMP      | Data da última atualização                     |

---

## Tabela: `movimentacoes`

| Campo       | Tipo      | Descrição                                               |
|-------------|-----------|----------------------------------------------------------|
| id          | UUID (PK) | Identificador único                                     |
| tipo        | ENUM      | CADASTRO / ATUALIZACAO / TRANSFERENCIA / MANUTENCAO /   |
|             |           | OCORRENCIA / BAIXA / PERMUTA                            |
| descricao   | TEXT      | Descrição do evento                                     |
| patrimonioId| UUID (FK) | Bem patrimonial relacionado                             |
| usuarioId   | UUID (FK) | Usuário que registrou o evento                          |
| createdAt   | TIMESTAMP | Data do evento                                          |

---

## Enumerações

### `Papel`
- `ADMIN` — acesso total ao sistema
- `GESTOR` — gerencia patrimônio e permutas, aprova transferências
- `OPERADOR` — cadastra e edita bens
- `VISUALIZADOR` — somente leitura

### `TipoPatrimonio`
- `MOVEL` — bem móvel (mobiliário, equipamento, veículo)
- `IMOVEL` — bem imóvel (terreno, edificação)

### `EstadoConservacao`
- `OTIMO` — sem avarias, pleno funcionamento
- `BOM` — pequenos desgastes naturais, funcional
- `REGULAR` — desgaste aparente, funcional com restrições
- `RUIM` — necessita manutenção corretiva
- `INSERVIVEL` — sem condições de uso, candidato à baixa

### `TipoMovimentacao`
- `CADASTRO` — inclusão inicial do bem
- `ATUALIZACAO` — alteração de dados
- `TRANSFERENCIA` — mudança de secretaria/responsável
- `MANUTENCAO` — registro de manutenção realizada
- `OCORRENCIA` — registro de ocorrência (perda, roubo, dano)
- `BAIXA` — retirada do inventário ativo
- `PERMUTA` — redistribuição via banco de permutas
