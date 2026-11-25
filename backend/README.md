# SAGE — API de gestão de estágios

Backend Laravel 13 / PHP 8.5 (versão usada na validação e na CI) com autenticação Sanctum por Bearer token. Os endpoints ficam em `/api`. Não é necessário executar npm para usar esta API.

## Instalação local

```bash
composer setup
php artisan sage:criar-diretor diretor@example.com --nome="Diretor"
php artisan serve
```

`composer setup` instala as dependências, cria `.env` se necessário, gera a chave e executa migrations. Em instalações existentes, preserve `APP_KEY`: use `composer install` e `php artisan migrate`, sem executar `composer setup` novamente.

O comando de criação do diretor solicita a senha de forma oculta. Não há senha administrativa padrão. O seeder é opcional (`php artisan db:seed`), idempotente e executa apenas em `local`/`testing`; cria curso, turma e empresa de demonstração, sem contas de acesso. Contas antigas não são removidas: se o antigo `admin@sage.test` já existir, altere sua senha ou desative-o.

Configure `CORS_ALLOWED_ORIGINS` com as origens do front-end separadas por vírgula. A autenticação usa token, sem cookies de sessão cross-origin. Todas as requisições protegidas precisam de `Authorization: Bearer <token>`. O token expira em oito horas; logout revoga o token atual. Alterar senha ou desativar a conta revoga todos os tokens. Usuários inativos são bloqueados mesmo quando ainda possuem um token.

## Convenções da API

Sucesso: `{"success":true,"message":"...","data":{},"errors":[]}`.
Erro: `{"success":false,"message":"...","data":null,"errors":{}}` (sem erros por campo, `errors` é `[]`).

- `200`: consulta/atualização; `201`: criação.
- `401`: falta autenticação; `403`: perfil, vínculo ou conta sem permissão.
- `404`: recurso não encontrado; `409`: conflito de integridade no banco.
- `422`: validação/regra de negócio; `429`: limite de requisições.
- `500`: mensagem genérica; detalhes ficam nos logs do servidor.
- Listagens paginadas: `page` e `per_page` (padrão 20, máximo 100). Metadados ficam em `data`, com registros em `data.data`. Frequências usam `data.frequencias` e `data.horas_cumpridas`.
- Datas: `YYYY-MM-DD`; horários: `HH:mm`; valores monetários/horas aceitam até duas casas decimais.
- `X-Request-ID` identifica requisições. Logs de mutações registram rota, ator e resultado, sem corpo da requisição, senha ou token.

## Autenticação

| Método | Endpoint | Corpo / resultado |
|---|---|---|
| GET | `/status` | Diagnóstico público, sem consultar o banco |
| POST | `/auth/login` | `email`, `password`; retorna `usuario`, `token`, `token_type`, `expires_in` |
| GET | `/auth/me` | Usuário e seus vínculos acadêmicos |
| POST | `/auth/logout` | Revoga token atual |

Login: cinco tentativas por minuto por email/IP e vinte por IP. API autenticada: 120 requisições por minuto por usuário. `/up` é o health check do framework.

## Cadastros administrativos

Somente `DIRETOR`. Para cada recurso abaixo: `GET /recurso`, `GET /recurso/{id}`, `POST /recurso` e `PATCH /recurso/{id}`. PATCH aceita atualização parcial. Dados protegidos não são copiados indiscriminadamente da requisição.

| Recurso | Campos da criação |
|---|---|
| `usuarios` | `nome`, `email` minúsculo, `password` (12+ caracteres, letras e números), `perfil`; `status` opcional |
| `cursos` | `nome`, `carga_horaria_estagio`; `codigo` e `status` opcionais |
| `turmas` | `curso_id`, `nome`, `ano`, `semestre` (1/2); `turno`, `status` opcionais |
| `alunos` | `usuario_id` de perfil ALUNO, `turma_id`, `matricula`, `cpf` (11 dígitos, sem máscara) |
| `empresas` | `cnpj` (14 caracteres, sem máscara, letras maiúsculas quando houver), `razao_social`, `endereco_completo`, `representante_legal`; `status_convenio` opcional |
| `professores` | `usuario_id` de perfil PROFESSOR, `siape_matricula`, `departamento_area`, `max_orientados` |
| `supervisores` | `empresa_concedente_id`, `nome`, `cargo`, `formacao`, `telefone`, `email`; `usuario_id` de perfil EMPRESA opcional |

Perfis: `ALUNO`, `EMPRESA`, `PROFESSOR`, `DIRETOR`. Usuários/cursos: `ativo` ou `inativo`; turmas: `ativa` ou `encerrada`. Convênio: `ATIVO`, `PENDENTE_ANALISE`, `AJUSTES_SOLICITADOS`, `EXPIRADO`, `REJEITADO`.

CPF e CNPJ têm dígitos verificadores validados. Máscaras convencionais são removidas e letras convertidas para maiúsculas antes de salvar; a verificação de duplicidade também considera registros antigos com máscara. O CNPJ aceita formato numérico e alfanumérico, conforme o [algoritmo oficial da Receita Federal](https://www.gov.br/receitafederal/pt-br/centrais-de-conteudo/publicacoes/documentos-tecnicos/cnpj/manual-dv-cnpj.pdf). A validação local não consulta a situação cadastral na Receita.

Contas vinculadas devem estar ativas. Perfis de contas existentes e vínculos já definidos são imutáveis; é possível associar uma conta a um supervisor que ainda não tenha `usuario_id`. A conta do supervisor é necessária para assinar frequências. Não há exclusão física pela API: cursos, turmas e usuários são desativados/encerrados, preservando o histórico. Empresas podem ter seu convênio expirado; demais cadastros históricos são preservados. O diretor não pode desativar a própria conta.

## Estágios e permissões

| Ação | Diretor | Aluno vinculado | Orientador vinculado | Supervisor vinculado |
|---|---|---|---|---|
| Consultar estágio/documentos/frequências | Sim | Sim | Sim | Sim |
| Criar estágio / mudar status | Sim | Não | Não | Não |
| Enviar documentos / lançar frequência / complementos | Sim | Sim | Não | Não |
| Analisar documentos / aprovar relatório | Sim | Não | Sim | Não |
| Assinar frequência | Não | Não | Não | Sim |
| Registrar avaliação | Não | Autoavaliação | Não | Avaliação concedente |

A listagem é filtrada por vínculo. Conhecer o ID de outro estágio não concede acesso. IDs de documentos/frequências também precisam pertencer ao estágio da URL.

- `GET /estagios`: listagem, aceita filtro `status`.
- `POST /estagios`: `aluno_id`, `empresa_concedente_id`, `professor_orientador_id`, `supervisor_empresa_id`, `modalidade`, `data_inicio`, `data_termino`, `carga_horaria_diaria`; `bolsa_auxilio` opcional. `status` é proibido no corpo.
- `GET /estagios/{id}`: estágio, complementos, horas aprovadas e histórico de estados.
- `PATCH /estagios/{id}/status`: `status` e `motivo` quando aplicável.

Modalidades: `ORIENTADO`, `SUPERVISIONADO_CAMPO`. O supervisor deve pertencer à empresa; convênio deve estar ativo; aluno, orientador, turma e curso precisam estar ativos. A data final não pode anteceder a inicial. A carga diária deve ser positiva e não exceder 24 horas (limite técnico; adequar às regras institucionais da modalidade). A API não presume regras jurídicas de jornada.

Estados permitidos:

```text
RASCUNHO -> EM_ANDAMENTO -> CONCLUIDO
    |            |------> ENCERRADO
    |            |------> CANCELADO_DESVIO_FUNCAO
    |------> ENCERRADO
```

- Criação sempre em `RASCUNHO`.
- Ativação exige TCE, plano de atividades e ficha de matrícula deferidos, apólice e plano estruturado cadastrados, período ainda não terminado e vaga de orientação disponível.
- Rascunhos não reservam vagas. O limite é validado novamente na ativação, com transação e bloqueio do orientador. MySQL/PostgreSQL devem ser usados para validar concorrência com bloqueios de linha em produção; SQLite não implementa o mesmo bloqueio de linha.
- Conclusão exige relatório aprovado e a carga horária exigida pelo curso cumprida pelo aluno.
- Encerramento/cancelamento exigem motivo. Estados finais não reabrem e bloqueiam novos documentos, avaliações e edições.
- Histórico registra autor, data, origem, destino e motivo.

## Documentos

- `GET /estagios/{id}/documentos`: lista metadados, sem caminho de armazenamento.
- `POST /estagios/{id}/documentos`: multipart com `tipo` e `arquivo` PDF de até 10 MiB. Entra em `EM_ANALISE`.
- `PATCH /estagios/{id}/documentos/{documento}/analise`: `status` = `DEFERIDO` ou `NECESSITA_AJUSTES`; ajustes exigem `observacoes`.
- `GET /estagios/{id}/documentos/{documento}/download`: download autorizado.
- `GET /estagios/{id}/documentos/{documento}/historico`: histórico paginado de submissão e análise.

Tipos: `TCE`, `PLANO_ATIVIDADES`, `FICHA_MATRICULA`, `RELATORIO_PARCIAL`, `RELATORIO_FINAL`, `FOLHA_FREQUENCIA`.

Arquivos ficam em `storage/app/private/documentos` com nomes gerados pelo servidor. Não há URL pública nem necessidade de `storage:link`. Um documento em análise/deferido bloqueia outro envio do mesmo tipo; após ajustes, envie uma nova versão e preserve a anterior. Aprovações registram autor/data; arquivos aprovados não são substituídos.

## Complementos e avaliações

`PUT /estagios/{id}/complementos/{tipo}` cria ou substitui o registro individual:

| Tipo | Campos |
|---|---|
| `apolice` | `numero_apolice`, `nome_seguradora` |
| `plano` | `objetivos`, `atividades_previstas`, `cronograma` |
| `salubridade` | `local_estagio`, `condicoes_higiene`, `possui_epi`; `riscos_ocupacionais` opcional |
| `relatorio` | `resumo_atividades`, `relacao_teoria_pratica`; `dificuldades` opcional |

Apólice, plano e salubridade são editáveis no rascunho. Relatório é editável antes de sua aprovação e antes da finalização. `POST /estagios/{id}/relatorio/aprovacao` aprova o relatório durante o estágio em andamento e registra autor/data.

`PUT /estagios/{id}/avaliacao`: aluno envia `auto_avaliacao`; supervisor envia `nota_desempenho` (0–10), `conceito_atitude` e `parecer_final`. Uma avaliação por tipo é mantida pelo endpoint, durante o estágio em andamento.

## Frequência e horas

- `GET /estagios/{id}/frequencias`: listagem e horas aprovadas.
- `POST /estagios/{id}/frequencias`: `data`, `hora_entrada`, `hora_saida`.
- `PUT /estagios/{id}/frequencias/{frequencia}`: corrige um lançamento ainda não assinado.
- `POST /estagios/{id}/frequencias/{frequencia}/assinatura`: supervisor vinculado assina.

Um registro por dia, dentro do período, sem data futura. Saída deve ser posterior à entrada no mesmo dia; duração não pode ultrapassar a carga diária. Não são aceitos `horas_diarias` nem `assinado_supervisor` enviados pelo cliente. Horas são calculadas no servidor, com duas casas decimais. O modelo atual considera um intervalo contínuo por dia, sem múltiplos turnos ou intervalos de almoço.

Apenas frequências assinadas contam. O total do aluno é derivado das frequências, inclusive horas parciais, excluindo estágios cancelados por desvio de função. O antigo campo inteiro `alunos.carga_horaria_cumprida` fica preservado no banco por compatibilidade, mas não é fonte do cálculo nem pode ser alterado pela API. Valores antigos sem frequência correspondente precisam de reconciliação antes da adoção do novo cálculo.

## Testes e integração contínua

```bash
composer test
```

Os testes usam SQLite em memória por padrão e armazenamento falso para uploads. Cobrem autenticação, autorização, fluxo completo, validações, integridade, histórico e restauração de backup SQLite. Para outro banco, configure variáveis de ambiente apontando **exclusivamente para um banco de testes descartável** antes da execução; `RefreshDatabase` recria tabelas.

O arquivo `backend-ci.yml` está preparado para executar testes em SQLite/MySQL e validar o Composer em push/pull request. A escrita fora do backend foi recusada nesta sessão: para ativá-lo, coloque-o em `.github/workflows/backend.yml` na raiz do repositório, um nível acima deste diretório, e envie as alterações ao GitHub. O YAML foi validado localmente; o pipeline remoto ainda não foi executado.

## Implantação

1. Configure o servidor com raiz pública em `backend/public`, HTTPS e PHP compatível com o lockfile. Mantenha `.env`, banco e armazenamento fora da raiz pública.
2. Configure `APP_ENV=production`, `APP_DEBUG=false`, `APP_URL`, banco, `CORS_ALLOWED_ORIGINS`, `LOG_STACK=daily`, `LOG_LEVEL=info`. Gere `APP_KEY` apenas na primeira instalação e preserve-a em atualizações.
3. Faça backup e confira duplicidades nas relações individuais antes da nova migration. Ela interrompe se encontrar duplicatas, sem escolher arbitrariamente qual registro excluir.
4. Execute `composer install --no-dev --optimize-autoloader`, `php artisan migrate --force`, `php artisan config:cache` e `php artisan route:cache` na versão preparada para implantação.
5. Crie o diretor interativamente, se ainda não existir. Não há necessidade de seed em produção.
6. Garanta escrita em `storage` e `bootstrap/cache`. Configure o scheduler com `php artisan schedule:run` a cada minuto. Agende em uma única instância ou use cache compartilhado/coordenação do ambiente.
7. Verifique `/up`, `/api/status`, login e um fluxo autorizado. Monitore erros 5xx, falhas de backup e espaço em disco.

Nenhum servidor, domínio, certificado, cron do sistema ou serviço externo é provisionado por estes arquivos. A implantação precisa das configurações do ambiente de destino. Não execute `migrate:fresh` no banco real.

## Backup e restauração

`php artisan sage:backup` cria ZIP privado em `storage/app/backups`, contendo dump do banco, PDFs e manifesto com SHA-256 do dump. Requer extensão PHP `zip`; SQLite usa `VACUUM INTO`; MySQL/MariaDB precisam de `mysqldump`/`mariadb-dump`; PostgreSQL precisa de `pg_dump`, com versão compatível com o servidor. Credenciais são passadas aos clientes por ambiente, não por argumentos de senha.

Com `BACKUP_ENABLED=true`, o scheduler executa diariamente às 02:00 de São Paulo, sem sobreposição. Backups não são excluídos automaticamente: defina retenção no ambiente, monitore espaço e copie para armazenamento externo com acesso restrito e criptografia. O ZIP local contém dados sensíveis e não é criptografado; não deve ser publicado. `APP_KEY` não vai no ZIP: mantenha cópia segura separada.

Restauração deve ser ensaiada em ambiente isolado: extraia o ZIP, compare o SHA-256 do dump com `manifest.json`, restaure `database.sqlite` ou importe `database.sql` no banco correspondente e restaure `documentos/` para o disco privado. Confirme dados e downloads antes de usar o backup em produção. Para uma recuperação com corte temporal estrito, pause escritas durante o backup; a cópia de banco e arquivos não é uma transação conjunta.

Referências: [Sanctum](https://laravel.com/docs/13.x/sanctum), [autorização](https://laravel.com/docs/13.x/authorization), [validação](https://laravel.com/docs/13.x/validation), [scheduler](https://laravel.com/docs/13.x/scheduling) e [implantação](https://laravel.com/docs/13.x/deployment).
