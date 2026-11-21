# AssistCar — documentação do projeto

## Visão geral

O **AssistCar** é uma aplicação de assistência veicular que conecta uma pessoa com problema no veículo a profissionais próximos. A interface atual demonstra toda a jornada principal em formato mobile: escolha do serviço, confirmação da localização, seleção de um profissional, acompanhamento e conclusão do atendimento.

Neste momento, o repositório contém um **protótipo de frontend**. Os dados são estáticos, a navegação ocorre por estado local e ainda não há autenticação, banco de dados, geolocalização real, pagamentos ou chamadas de API. A pasta `backend/` existe, mas está vazia e será implementada separadamente em TypeScript.

## Funcionalidades existentes

- Tela inicial com acesso rápido a uma solicitação de emergência.
- Seleção entre pneu furado, bateria, combustível, chaveiro, guincho e mecânica.
- Confirmação visual de endereço e localização.
- Listagem simulada de profissionais, com avaliação, distância, previsão e preço.
- Acompanhamento visual do profissional a caminho.
- Ações simuladas de ligação, chat, cancelamento e finalização.
- Resumo do atendimento concluído e opção visual de avaliação.
- Layout responsivo: tela cheia em dispositivos menores e moldura de celular no desktop.

## Fluxo atual da aplicação

```text
Início
  -> escolha do serviço
  -> confirmação da localização
  -> seleção do profissional
  -> acompanhamento do atendimento
  -> conclusão
  -> retorno ao início
```

Esse fluxo é controlado pelo estado `step` em `app/page.tsx`. Não há rotas distintas para as telas e, ao atualizar a página, toda a jornada volta ao início.

## Tecnologias atuais

| Camada | Tecnologia | Uso atual |
| --- | --- | --- |
| Aplicação web | Next.js 16 (App Router) | Renderização e estrutura do frontend |
| Interface | React 19 + TypeScript | Componentes e estado local |
| Estilos | Tailwind CSS 4 + CSS global | Tokens, layout e componentes visuais |
| Componentes | Base UI + shadcn | Base para componentes reutilizáveis |
| Ícones | Lucide React | Dependência instalada, ainda não usada na tela principal |
| Métricas | Vercel Analytics | Carregado somente em produção |
| Pacotes | pnpm | Gerenciador declarado pelo projeto |

O repositório também possui `package-lock.json`, mas o `package.json` declara pnpm. Para evitar instalações inconsistentes, recomenda-se manter apenas um gerenciador e seu respectivo lockfile.

## Estrutura atual

```text
assist-car/
├── app/
│   ├── globals.css       # tema, layout e estilos de todas as telas
│   ├── layout.tsx        # metadados, viewport e Analytics
│   └── page.tsx          # fluxo completo e dados simulados
├── backend/              # reservada para a futura API TypeScript
├── components/
│   └── ui/button.tsx     # botão reutilizável baseado em Base UI
├── lib/
│   └── utils.ts          # helper para composição de classes CSS
├── public/               # ícones e imagens estáticas
├── components.json       # configuração do shadcn
├── next.config.mjs       # configuração do Next.js
├── package.json          # scripts e dependências do frontend
└── tsconfig.json         # configuração TypeScript atual
```

### Arquivos principais

- `app/page.tsx`: concentra tipos, dados mockados e todos os componentes da jornada. É um Client Component por depender de `useState`.
- `app/globals.css`: contém praticamente todo o design system e os estilos das telas.
- `app/layout.tsx`: define idioma `pt-BR`, metadados, ícones, cores de tema e Analytics.
- `components/ui/button.tsx`: componente shadcn disponível, mas a página principal ainda usa botões HTML diretamente.
- `lib/utils.ts`: fornece a função `cn`, usada para combinar classes Tailwind.

## Como executar o frontend

Pré-requisitos:

- Node.js compatível com Next.js 16.
- pnpm, conforme a versão indicada no campo `packageManager`.

```bash
pnpm install
pnpm dev
```

Depois, acesse `http://localhost:3000`.

Outros comandos disponíveis:

```bash
pnpm build
pnpm start
```

Ainda não há scripts de lint ou testes configurados.

## Backend planejado

O backend será uma aplicação TypeScript responsável por regras de negócio, persistência e integração com serviços externos. Recomenda-se que ele tenha seu próprio `package.json`, `tsconfig.json`, arquivo de ambiente e scripts, evitando misturar dependências de servidor com as do Next.js.

Uma organização inicial possível é:

```text
backend/
├── src/
│   ├── config/           # ambiente, banco, logs e serviços externos
│   ├── db/
│   │   ├── schema/       # definição das tabelas e relacionamentos
│   │   ├── migrations/   # histórico versionado de mudanças do banco
│   │   ├── seeds/        # dados iniciais para desenvolvimento
│   │   └── client.ts     # conexão com o banco
│   ├── modules/
│   │   ├── auth/
│   │   ├── users/
│   │   ├── vehicles/
│   │   ├── professionals/
│   │   ├── services/
│   │   ├── requests/
│   │   ├── tracking/
│   │   ├── payments/
│   │   └── reviews/
│   ├── routes/           # registro central das rotas da API
│   ├── middlewares/      # autenticação, autorização e erros
│   ├── shared/           # tipos, erros e utilitários comuns
│   ├── app.ts            # configuração do servidor
│   └── server.ts         # inicialização e porta HTTP
├── tests/
├── .env.example
├── package.json
└── tsconfig.json
```

Cada módulo pode agrupar `route`, `controller`, `service`, `repository` e `schema` de validação. Isso mantém as regras de uma funcionalidade próximas entre si e evita que as pastas globais cresçam sem contexto.

### Entidades sugeridas

| Entidade | Responsabilidade | Campos principais sugeridos |
| --- | --- | --- |
| `users` | Clientes e dados de conta | id, nome, telefone, e-mail, senha hash, status |
| `vehicles` | Veículos de cada cliente | id, userId, placa, marca, modelo, ano, cor |
| `professionals` | Prestadores cadastrados | id, userId, tipo, documento, disponibilidade, localização |
| `service_types` | Catálogo de serviços | id, nome, descrição, preço base, ativo |
| `service_requests` | Solicitação e ciclo do atendimento | id, userId, vehicleId, professionalId, serviceTypeId, status, endereço, latitude, longitude, preço |
| `request_status_history` | Auditoria das mudanças de status | id, requestId, status, data, observação |
| `reviews` | Avaliação após o atendimento | id, requestId, authorId, nota, comentário |
| `payments` | Cobrança do atendimento | id, requestId, valor, método, status, externalId |
| `messages` | Conversa durante o atendimento | id, requestId, senderId, conteúdo, data |

O nome e os tipos exatos devem ser definidos após a escolha do banco e do ORM. Valores monetários devem ser armazenados como inteiro na menor unidade da moeda (centavos) ou em um tipo decimal apropriado, nunca como `float`.

### Estados do atendimento

É importante que o status seja validado no servidor. Uma sequência inicial pode ser:

```text
searching -> accepted -> professional_en_route -> in_progress -> completed
        \-> cancelled
```

O servidor deve impedir transições inválidas e registrar cada mudança em `request_status_history`.

### Rotas iniciais da API

Base sugerida: `/api/v1`.

| Método | Rota | Finalidade |
| --- | --- | --- |
| `POST` | `/auth/register` | Criar conta |
| `POST` | `/auth/login` | Autenticar usuário |
| `GET` | `/me` | Obter usuário autenticado |
| `GET` / `POST` | `/vehicles` | Listar ou cadastrar veículos |
| `GET` | `/service-types` | Listar serviços disponíveis |
| `GET` | `/professionals/nearby` | Buscar profissionais por serviço e coordenadas |
| `POST` | `/service-requests` | Abrir uma solicitação |
| `GET` | `/service-requests/:id` | Consultar solicitação e status |
| `PATCH` | `/service-requests/:id/status` | Alterar status conforme perfil e regra |
| `POST` | `/service-requests/:id/cancel` | Cancelar atendimento |
| `POST` | `/service-requests/:id/review` | Avaliar atendimento concluído |
| `GET` | `/service-requests/:id/messages` | Consultar mensagens |
| `POST` | `/service-requests/:id/messages` | Enviar mensagem |

Filtros, paginação e ordenação devem ser feitos por query string. Respostas de erro devem seguir um formato único, por exemplo:

```json
{
  "error": {
    "code": "INVALID_STATUS_TRANSITION",
    "message": "Não é possível concluir um atendimento que ainda não foi iniciado.",
    "details": null
  }
}
```

### Responsabilidades do backend

- Validar todos os dados de entrada com schemas.
- Autenticar usuários e autorizar ações conforme o papel de cliente, profissional ou administrador.
- Controlar as transições de status do atendimento.
- Buscar profissionais por localização e disponibilidade.
- Calcular ou confirmar preço, distância e previsão; o frontend não deve ser a fonte desses valores.
- Persistir histórico, avaliações, mensagens e pagamentos.
- Proteger dados pessoais, senhas, tokens e credenciais de terceiros.
- Expor documentação de API, preferencialmente OpenAPI/Swagger.
- Fornecer logs estruturados, tratamento central de erros e endpoint de saúde.

### Migrations e schemas

- Toda mudança estrutural do banco deve gerar uma migration versionada.
- Migrations já aplicadas não devem ser editadas; correções devem entrar em uma nova migration.
- O schema do ORM deve ser a referência da estrutura atual do banco.
- Schemas de validação HTTP devem ser separados do schema do banco, mesmo quando compartilham campos.
- Seeds devem conter somente dados seguros para desenvolvimento e teste.
- A aplicação deve executar migrations de forma controlada no deploy, não a cada requisição.

### Variáveis de ambiente previstas

O arquivo real `.env` não deve ser versionado. Um `.env.example` pode começar com:

```dotenv
NODE_ENV=development
PORT=3333
DATABASE_URL=
AUTH_SECRET=
FRONTEND_URL=http://localhost:3000
```

Chaves de mapas, pagamentos, armazenamento e notificações devem ser adicionadas apenas quando os respectivos provedores forem escolhidos.

## Integração entre frontend e backend

O frontend deve receber a URL pública da API por variável de ambiente, por exemplo:

```dotenv
NEXT_PUBLIC_API_URL=http://localhost:3333/api/v1
```

Antes da integração, recomenda-se refatorar `app/page.tsx` em componentes e rotas menores, mover os mocks para arquivos próprios e criar uma camada de cliente HTTP. Tipos compartilhados podem ficar em um pacote comum do workspace, desde que o backend continue validando os dados em tempo de execução.

Para atualizações de localização e status em tempo real, WebSocket ou Server-Sent Events podem ser adotados depois que o fluxo HTTP básico estiver estável. O sistema também deve definir o comportamento para perda de conexão e retomada do acompanhamento.

## Estado atual e próximos passos

1. Escolher framework HTTP, banco de dados, ORM e biblioteca de validação do backend.
2. Inicializar o projeto TypeScript dentro de `backend/` com scripts próprios.
3. Implementar ambiente, conexão com banco, health check e tratamento de erros.
4. Modelar usuários, veículos, profissionais, tipos de serviço e solicitações.
5. Criar migrations e seeds de desenvolvimento.
6. Implementar autenticação e autorização.
7. Entregar primeiro o fluxo de solicitação e consulta de atendimento.
8. Substituir gradualmente os mocks do frontend pelas respostas da API.
9. Adicionar testes unitários, de integração e de contrato.
10. Implementar localização em tempo real, chat, pagamentos e notificações em fases posteriores.

## Limitações e pontos de atenção

- Todos os profissionais, endereços, preços, distâncias e tempos são atualmente fixos.
- Os filtros visuais ainda não alteram a lista.
- Botões de perfil, histórico, veículos, chat, ligação e avaliação ainda não executam funcionalidades reais.
- O preço exibido no acompanhamento e na conclusão está fixo em `R$ 80,00`, independentemente do profissional selecionado.
- O tempo e a distância do acompanhamento também estão fixos.
- O mapa é uma composição CSS, não uma integração com um provedor de mapas.
- A configuração do Next.js atualmente ignora erros TypeScript durante o build; isso deve ser removido antes de produção para que erros de tipo interrompam a entrega.
- O projeto ainda não possui testes, lint, CI, observabilidade de backend nem política documentada de segurança e privacidade.

---

Esta documentação descreve o código existente e uma arquitetura inicial recomendada. As decisões de banco, framework HTTP, autenticação, mapas e pagamentos permanecem em aberto e devem ser registradas quando forem tomadas.
