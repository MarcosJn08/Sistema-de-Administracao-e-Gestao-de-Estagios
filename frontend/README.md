# SAGE — Landing page

Página de apresentação do portal de estágios do IFNMG — Campus Almenara, desenvolvida com React, Vite, Bootstrap, React Bootstrap e Lucide. Reutiliza o Header, o Button, a logo e as fontes locais do projeto.

## Desenvolvimento

Na pasta `frontend`:

```bash
npm ci
npm run dev
```

## Verificação

```bash
npm run build
npm run lint
```

## Perfil do aluno e correções acadêmicas

O perfil e as candidaturas usam dados locais neste protótipo. Os dados acadêmicos
são somente leitura e vêm de `src/data/aluno.js`; a instituição é fixa como
IFNMG – Campus Almenara. Campos acadêmicos antigos no localStorage são ignorados
ao carregar/salvar o perfil. Inscrições já enviadas preservam seu histórico.
Na integração real, o servidor deve fornecer esses dados e rejeitar alterações
acadêmicas pelo aluno; o bloqueio de interface não substitui autorização no backend.

Para habilitar a abertura de e-mail ao Núcleo de Estágio, configure o contato
oficial em `VITE_NUCLEO_ESTAGIO_EMAIL` no arquivo `.env.local` (veja `.env.example`)
e reinicie o Vite. O aluno revisa e envia a mensagem no aplicativo de e-mail.
Sem contato configurado, o modal permite copiar o texto e informa que nada foi
enviado. Não existe envio de solicitações por backend nesta versão.

Foto (PNG/JPG/WebP de até 500 KB), telefone, endereço, CEP, resumo, habilidades,
experiência e anexos são editáveis. Endereço e CEP não são copiados para novas
candidaturas. Testes de persistência e proteção dos dados acadêmicos:

```bash
node --test tests/perfilAluno.test.mjs
```

## Organização

A aplicação exibe somente a landing page, com Hero, perfis, vagas em destaque, etapas, chamada para conhecer o portal e rodapé. A navegação entre as seções usa âncoras na própria página. Ações de funcionalidades futuras, como Entrar, Cadastrar, Ver vaga e envio de documentos, permanecem visíveis como botões sem navegação ou resposta ao clique, identificados com `aria-disabled`.

- `src/pages/LandingPage.jsx`: composição da página.
- `src/components/landing`: seções reutilizáveis.
- `src/data/vagas.json`: dados demonstrativos das oportunidades.
- `src/hooks/useScrollReveal.js`: entrada gradual dos elementos na rolagem e indicador de progresso.
- `src/App.css` e `src/index.css`: estilos, responsividade e fontes locais.

Perfis e etapas usam o fundo `#f8f9fa` e o grid `col-12 col-lg-4`. A vitrine tem fundo branco e grid `col-12 col-md-6 col-lg-4`.

As animações acontecem uma vez por elemento, com entrada vertical de 64 px, leve escala, desfoque que se dissipa e fade. Os cards entram em sequência com intervalos de 150 ms e transição de até 1,1 s, mantendo a rolagem nativa. A preferência por movimento reduzido desativa os efeitos. O conteúdo permanece acessível por teclado, na impressão e em navegadores sem IntersectionObserver.

Não há telas secundárias, autenticação, formulários ou envio de dados nesta versão.
