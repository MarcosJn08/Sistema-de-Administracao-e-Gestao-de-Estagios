# SAGE — API de gestão de estágios

Backend Laravel 13 / PHP 8.5 (versão usada na validação e na CI) com autenticação Sanctum por Bearer token. Os endpoints ficam em `/api`. Não é necessário executar npm para usar esta API.

## Instalação local

```bash
composer setup
php artisan sage:criar-diretor diretor@ifnmg.edu.br --nome="Diretor"
php artisan serve
```

`composer setup` instala as dependências, cria `.env` se necessário, gera a chave e executa migrations. Em instalações existentes, preserve `APP_KEY`: use `composer install` e `php artisan migrate`, sem executar `composer setup` novamente.

O comando de criação do diretor solicita a senha de forma oculta. Não há senha administrativa padrão. O seeder é opcional (`php artisan db:seed`), idempotente e executa apenas em `local`/`testing`; cria curso, turma e empresa de demonstração, sem contas de acesso. Contas antigas não são removidas: se o antigo `admin@sage.test` já existir, altere sua senha ou desative-o.

Configure `CORS_ALLOWED_ORIGINS` com as origens do front-end separadas por vírgula. A autenticação usa token, sem cookies de sessão cross-origin. Todas as requisições protegidas precisam de `Authorization: Bearer <token>`. O token expira em 120 minutos por padrão (configurável por `SANCTUM_TOKEN_EXPIRATION`, em minutos); logout revoga o token atual. Alterar senha ou desativar a conta revoga todos os tokens. Usuários inativos são bloqueados mesmo quando ainda possuem um token.

## Convenções da API

URL local: `http://127.0.0.1:8000`. As tabelas abaixo incluem o prefixo `/api`; não existe prefixo `/v1`. Os nomes entre chaves representam IDs, exceto `{recurso}` e `{tipo}`, cujos valores permitidos estão indicados.

Envie `Accept: application/json`. Nas rotas protegidas, use `Authorization: Bearer <token>`. Para corpos JSON, use `Content-Type: application/json`; para uploads, use `multipart/form-data` e deixe o cliente gerar o boundary. Requisições GET usam parâmetros na URL, sem corpo de login.

A maioria das ações retorna `{"success":true,"message":"...","data":{},"errors":[]}`. Erros usam `{"success":false,"message":"...","data":null,"errors":{}}` (`errors` pode ser `[]`). Há diferenças entre os recursos:

- Contratos de estágio usam `EstagioResource`: objeto em `data`; listagens com `data`, `meta` e `links` no nível superior.
- Usuários também usam Resources; suas listagens têm `data`, `meta` e `links` no nível superior.
- Cadastros administrativos e documentos paginados têm registros em `data.data`.
- Frequências retornam o paginador em `data.frequencias` e o total em `data.horas_cumpridas`.
- Downloads retornam o arquivo; logout retorna `204`, sem corpo.

Listagens aceitam `page` e `per_page` (padrão 20, máximo 100), exceto o histórico documental, que usa 20 registros por página. Datas: `YYYY-MM-DD`; horários: `HH:mm`; valores monetários/horas aceitam até duas casas decimais.

| Código | Significado |
|---|---|
| 200 / 201 | Consulta ou atualização / criação |
| 204 | Logout concluído, sem corpo |
| 401 / 403 | Falta de autenticação / acesso negado por perfil, vínculo ou conta |
| 404 / 409 | Recurso não encontrado / conflito de integridade |
| 422 / 429 | Validação ou regra de negócio / limite de requisições |
| 500 | Erro interno; detalhes em `storage/logs/laravel.log` ou no canal de log configurado |

`X-Request-ID` identifica requisições. Logs de mutações registram rota, ator e resultado, sem corpo da requisição, senha ou token.

## Autenticação e diagnóstico

| Método | Endpoint | Acesso | Corpo / resultado |
|---|---|---|---|
| GET | `/api/status` | Público | Diagnóstico sem consultar o banco |
| POST | `/api/auth/login` | Público | `identifier`, `password`; retorna usuário em `data` e `token`, `token_type`, `expires_at` no nível superior |
| POST | `/api/auth/esqueci-senha` | Público | `email`; solicita recuperação, sem revelar se a conta existe |
| POST | `/api/auth/redefinir-senha` | Público | `email`, `token`, `password`, `password_confirmation` |
| GET | `/api/auth/me` | Autenticado e ativo | Dados da conta autenticada |
| POST | `/api/auth/logout` | Autenticado | Revoga o token atual; resposta 204 |

Exemplo de login no Postman: método POST, URL `http://127.0.0.1:8000/api/auth/login`, Body → raw → JSON:

```json
{
  "identifier": "diretor@ifnmg.edu.br",
  "password": "SUA_SENHA"
}
```

Copie `token` da resposta para Authorization → Bearer Token nas próximas requisições. Use credenciais existentes no seu banco. O login também aceita o campo legado `email`; prefira `identifier`, que aceita e-mail, matrícula, SIAPE ou CNPJ. Alunos usam domínio `aluno.ifnmg.edu.br`; professores e diretores, `ifnmg.edu.br`; empresas usam e-mail válido sem essa restrição institucional.

Login: cinco tentativas por minuto por identificador/IP e trinta por IP. Recuperação de senha: dez requisições por minuto por IP. API autenticada de negócio: 120 requisições por minuto por usuário. Redefinir senha exige pelo menos oito caracteres com letras e números e revoga os tokens anteriores. Configure o serviço de e-mail e o processamento de filas para entregar a recuperação.

## Usuários

| Método | Endpoint | Acesso / finalidade |
|---|---|---|
| GET | `/api/usuarios` | Diretor: listar usuários |
| POST | `/api/usuarios` | Diretor: criar usuário |
| GET | `/api/usuarios/{usuario}` | Diretor ou próprio usuário: consultar |
| PUT, PATCH | `/api/usuarios/{usuario}` | Diretor: atualizar |
| DELETE | `/api/usuarios/{usuario}` | Diretor: exclusão lógica; não pode excluir a própria conta |

Listagem: filtros `perfil`, `status`, `curso`, `busca`, além de paginação. Inclui registros excluídos logicamente.

Criação: `nome`, `email`, `password` (mínimo oito caracteres, letras e números), `perfil`. Perfis: `ALUNO`, `EMPRESA`, `PROFESSOR`, `DIRETOR`; status: `ativo` ou `inativo`. Campos opcionais: `cpf`, `matricula`, `siape`, `cnpj`, `status`, `titulacao`, `departamento`, `areaAtuacao`, `regimeTrabalho`, `telefone`, `maximoOrientandos`, `curso`. E-mail é normalizado para minúsculas; identificadores devem respeitar unicidade.

Atualização aceita campos parciais; não permite trocar o perfil existente nem desativar a própria conta. Alteração de senha, inativação e exclusão revogam tokens. Os campos e limites desses endpoints são definidos em `StoreUserRequest` e `UpdateUserRequest`.

## Cadastros administrativos

Todos exigem usuário ativo de perfil `DIRETOR`. `{recurso}` aceita exclusivamente `cursos`, `turmas`, `alunos`, `empresas`, `professores` ou `supervisores`.

| Método | Endpoint | Finalidade |
|---|---|---|
| GET | `/api/{recurso}` | Listagem paginada |
| POST | `/api/{recurso}` | Criar cadastro |
| GET | `/api/{recurso}/{id}` | Consultar cadastro por ID numérico |
| PATCH | `/api/{recurso}/{id}` | Atualização parcial |

Assim, por exemplo, cursos têm `GET /api/cursos`, `POST /api/cursos`, `GET /api/cursos/{id}` e `PATCH /api/cursos/{id}`. O mesmo conjunto existe para os outros cinco recursos; não há PUT nem DELETE para esses cadastros.

| Recurso | Campos da criação |
|---|---|
| `cursos` | `nome`, `carga_horaria_estagio`; `codigo` e `status` opcionais |
| `turmas` | `curso_id`, `nome`, `ano`, `semestre` (1/2); `turno`, `status` opcionais |
| `alunos` | `usuario_id` de perfil ALUNO, `turma_id`, `matricula`, `cpf` |
| `empresas` | `cnpj`, `razao_social`, `endereco_completo`, `representante_legal`; `status_convenio` opcional |
| `professores` | `usuario_id` de perfil PROFESSOR, `siape_matricula`, `departamento_area`, `max_orientados` |
| `supervisores` | `empresa_concedente_id`, `nome`, `cargo`, `formacao`, `telefone`, `email`; `usuario_id` de perfil EMPRESA opcional |

Cursos: `ativo` ou `inativo`; turmas: `ativa` ou `encerrada`. Convênio: `ATIVO`, `PENDENTE_ANALISE`, `AJUSTES_SOLICITADOS`, `EXPIRADO`, `REJEITADO`.

Nos cadastros de alunos e empresas, CPF e CNPJ têm dígitos verificadores validados e máscaras normalizadas. CPF tem 11 dígitos; CNPJ tem 14 caracteres, com suporte ao formato alfanumérico. A validação não consulta a situação cadastral na Receita.

Contas vinculadas devem estar ativas e com o perfil correspondente. Vínculos já definidos não podem ser trocados; é possível associar uma conta a um supervisor que ainda não tenha `usuario_id`. A conta do supervisor é necessária para criar contratos como empresa e assinar frequências. `carga_horaria_cumprida` não pode ser enviada no cadastro do aluno.

## Estágios e contratos (RN05)

| Método | Endpoint | Acesso / finalidade |
|---|---|---|
| GET | `/api/estagios` | Diretor vê todos; demais perfis veem seus vínculos |
| POST | `/api/estagios` | Diretor ou empresa vinculada: criar contrato com termo formalizado |
| GET | `/api/estagios/{estagio}` | Diretor ou participante vinculado: detalhes |
| PUT, PATCH | `/api/estagios/{estagio}` | Diretor: atualizar parâmetros contratuais |
| PATCH | `/api/estagios/{estagio}/status` | Diretor: mudar estado com `status` e, quando exigido, `motivo` |

Não existe DELETE de estágio. Para finalizar o vínculo, use a transição de status adequada.

Listagem aceita `curso_id`, `empresa_concedente_id`, `status`, `page`, `per_page`. Exemplo: `GET /api/estagios?status=EM_ANALISE&curso_id=1&per_page=20`. O detalhe inclui contrato, participantes, curso, apólice, plano, documentos e horas cumpridas/restantes.

### Criar contrato

Use Body → form-data no Postman. Todos os campos abaixo são obrigatórios, exceto `bolsa_auxilio`. IDs devem existir no banco e cumprir os vínculos exigidos.

| Campo | Formato / regra |
|---|---|
| `aluno_id` | ID do aluno |
| `empresa_concedente_id` | ID da empresa com convênio ativo |
| `supervisor_empresa_id` | ID do supervisor pertencente à empresa |
| `professor_orientador_id` | ID do orientador |
| `cargo` | Texto, até 255 caracteres |
| `data_inicio`, `data_termino` | `YYYY-MM-DD`; término igual ou posterior ao início |
| `modalidade` | `ORIENTADO` ou `SUPERVISIONADO_CAMPO` |
| `carga_horaria_diaria` | Número positivo, até 24 horas |
| `carga_horaria_semanal` | Número positivo, até 30 horas |
| `meta_horas_tce` | Teto total positivo previsto no TCE |
| `termo_formalizado` | Campo File: PDF de até 10 MiB |
| `bolsa_auxilio` | Opcional; valor não negativo |

Não envie `curso_id` nem `status`: o curso vem do vínculo acadêmico. Retorna 201 com estágio em `EM_ANALISE` e TCE privado em análise. Apresentar o PDF não aprova o documento nem verifica automaticamente suas assinaturas. A criação por candidatura aprovada ainda não está implementada.

A empresa só cria quando `supervisor_empresa_id` está associado ao usuário autenticado em `supervisores_empresa.usuario_id` e à empresa informada. Perfil EMPRESA sem esse vínculo não pode criar. Aluno, orientador, turma e curso precisam estar ativos.

### Atualizar e controlar horas

PUT/PATCH aceita campos parciais: `cargo`, `data_inicio`, `data_termino`, `carga_horaria_diaria`, `carga_horaria_semanal`, `meta_horas_tce`, `bolsa_auxilio`, `supervisor_empresa_id`. Não permite trocar aluno, empresa, orientador, curso, modalidade ou termo; status usa a rota própria. Estados finais bloqueiam atualização.

Rascunhos, contratos em análise e em andamento reservam capacidade em períodos sobrepostos, com datas inclusivas: aluno pode somar até 30h semanais; supervisor pode ter até dez alunos distintos. O limite de orientação também é verificado nas regras do estágio.

Frequências pendentes e assinadas reservam horas para os limites diário, semanal (segunda a domingo) e total do TCE. Apenas assinadas entram no progresso. Reduzir limites ou mudar datas deve respeitar frequências já existentes. Contratos antigos sem limites precisam ser regularizados pelo diretor antes de ativar, lançar ou assinar frequências; a atualização também preenche o curso ausente a partir do vínculo acadêmico.

### Estados

| Estado atual | Destinos permitidos |
|---|---|
| `RASCUNHO` | `EM_ANALISE`, `EM_ANDAMENTO`, `ENCERRADO` |
| `EM_ANALISE` | `EM_ANDAMENTO`, `ENCERRADO` |
| `EM_ANDAMENTO` | `CONCLUIDO`, `ENCERRADO`, `CANCELADO_DESVIO_FUNCAO` |
| `CONCLUIDO`, `ENCERRADO`, `CANCELADO_DESVIO_FUNCAO` | Nenhum |

Ativar exige TCE, plano de atividades e ficha de matrícula deferidos, apólice e plano estruturado cadastrados, período não terminado, vínculos válidos e capacidade disponível. Concluir exige relatório aprovado e carga horária do curso cumprida pelo aluno. Encerrar/cancelar exige `motivo`; a operação registra autor, data e histórico da transição.

### Permissões dos participantes

| Ação | Diretor | Aluno vinculado | Orientador vinculado | Supervisor vinculado (EMPRESA) |
|---|---|---|---|---|
| Consultar estágio/documentos/frequências | Sim | Sim | Sim | Sim |
| Criar contrato | Sim | Não | Não | Sim, para o próprio vínculo |
| Atualizar contrato / mudar status | Sim | Não | Não | Não |
| Enviar documentos / lançar frequência / salvar complementos | Sim | Sim | Não | Não |
| Analisar documentos / aprovar relatório | Sim | Não | Sim | Não |
| Assinar frequência | Não | Não | Não | Sim |
| Registrar avaliação | Não | Autoavaliação | Não | Avaliação concedente |

Conhecer o ID não concede acesso. Documento e frequência devem pertencer ao estágio da URL. As regras de estado e validação continuam aplicáveis a cada perfil.

## Documentos

| Método | Endpoint | Corpo / resultado |
|---|---|---|
| GET | `/api/estagios/{estagio}/documentos` | Metadados paginados, sem caminho de armazenamento |
| POST | `/api/estagios/{estagio}/documentos` | Multipart: `tipo` e `arquivo` PDF até 10 MiB; retorna 201 |
| PATCH | `/api/estagios/{estagio}/documentos/{documento}/analise` | `status`: `DEFERIDO` ou `NECESSITA_AJUSTES`; ajustes exigem `observacoes` |
| GET | `/api/estagios/{estagio}/documentos/{documento}/historico` | Histórico de submissão/análise; `page`, 20 registros por página |
| GET | `/api/estagios/{estagio}/documentos/{documento}/download` | Download privado autorizado |

Tipos: `TCE`, `PLANO_ATIVIDADES`, `FICHA_MATRICULA`, `RELATORIO_PARCIAL`, `RELATORIO_FINAL`, `FOLHA_FREQUENCIA`.

Uploads entram em `EM_ANALISE`. Um documento em análise/deferido bloqueia outro do mesmo tipo; após ajustes, envie uma nova versão. A análise só é permitida para documento em análise e estágio não finalizado. Arquivos ficam em `storage/app/private/documentos`, sem URL pública ou necessidade de `storage:link`.

## Frequências

| Método | Endpoint | Corpo / resultado |
|---|---|---|
| GET | `/api/estagios/{estagio}/frequencias` | Listagem paginada e horas aprovadas |
| POST | `/api/estagios/{estagio}/frequencias` | `data`, `hora_entrada`, `hora_saida` |
| PUT | `/api/estagios/{estagio}/frequencias/{frequencia}` | Corrige lançamento não assinado: `data`, `hora_entrada`, `hora_saida` |
| POST | `/api/estagios/{estagio}/frequencias/{frequencia}/assinatura` | Supervisor vinculado assina; sem campos obrigatórios no corpo |

Lançamentos e assinaturas exigem estágio em andamento. Um registro por dia, dentro do período contratual, sem data futura. Saída deve ser posterior à entrada no mesmo dia. Horas são calculadas no servidor; não envie `horas_diarias` ou `assinado_supervisor`. Frequências assinadas não podem ser editadas. O modelo considera um intervalo contínuo por dia.

O total do aluno deriva das frequências assinadas, excluindo estágios cancelados por desvio de função. O campo legado `alunos.carga_horaria_cumprida` não é fonte do cálculo; valores antigos sem frequência precisam de reconciliação.

## Complementos, relatório e avaliações

| Método | Endpoint | Finalidade |
|---|---|---|
| PUT | `/api/estagios/{estagio}/complementos/{tipo}` | Criar ou atualizar complemento; diretor ou aluno vinculado |
| POST | `/api/estagios/{estagio}/relatorio/aprovacao` | Aprovar relatório; diretor ou orientador vinculado; sem campos obrigatórios no corpo |
| PUT | `/api/estagios/{estagio}/avaliacao` | Registrar avaliação do aluno ou supervisor vinculado |

`{tipo}` aceita apenas os quatro valores abaixo. Envie todos os campos obrigatórios do tipo, inclusive em atualização.

| Tipo | Campos |
|---|---|
| `apolice` | `numero_apolice`, `nome_seguradora` |
| `plano` | `objetivos`, `atividades_previstas`, `cronograma` |
| `salubridade` | `local_estagio`, `condicoes_higiene`, `possui_epi` (booleano); `riscos_ocupacionais` opcional |
| `relatorio` | `resumo_atividades`, `relacao_teoria_pratica`; `dificuldades` opcional |

Apólice, plano e salubridade são editáveis em `RASCUNHO` e `EM_ANALISE`. Relatório é editável antes de aprovado e antes da finalização. Não envie `aprovado` nem `parecer_orientador` ao salvar complemento. Aprovação exige relatório existente, ainda não aprovado, e estágio em andamento.

Avaliação exige estágio em andamento: aluno envia `auto_avaliacao`; supervisor envia `nota_desempenho` (0–10), `conceito_atitude` e `parecer_final`. O endpoint mantém uma avaliação por tipo (`estagiario` ou `concedente`).

## Outras rotas registradas

Estas rotas ficam fora do prefixo `/api`:

| Método | Endpoint | Finalidade |
|---|---|---|
| GET | `/` | Identificação do backend |
| GET | `/up` | Health check do Laravel |
| GET | `/sanctum/csrf-cookie` | Rota do Sanctum; não necessária no fluxo Bearer Token |
| POST | `/_boost/browser-logs` | Ferramenta de desenvolvimento Laravel Boost, quando instalada; não é endpoint de negócio |

Rotas GET também aceitam HEAD. Para conferir as rotas efetivamente registradas no seu ambiente, execute dentro de `backend`:

```bash
php artisan route:list --path=api
php artisan route:list
```

## Testes e integração contínua

```bash
composer test
```

Os testes usam SQLite em memória por padrão e armazenamento falso para uploads. Cobrem autenticação, autorização, fluxo completo, validações, integridade, histórico e restauração de backup SQLite. `phpunit.xml` força SQLite em memória. Para testar outro banco, ajuste a configuração de testes e use **exclusivamente um banco descartável**; `RefreshDatabase` recria tabelas.

O arquivo `backend-ci.yml` é uma proposta de workflow. Para ativá-lo, coloque-o em `.github/workflows/backend.yml` na raiz do repositório e confira a configuração do PHPUnit: a configuração atual força SQLite, inclusive quando outras variáveis de banco são fornecidas pelo workflow.

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
