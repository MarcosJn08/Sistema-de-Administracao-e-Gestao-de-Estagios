# SAGE - Sistema de Administração e Gestão de Estágios

## Testar a recuperação de senha

### Teste manual com MySQL e Mailpit

1. Com o MySQL local configurado em `backend/.env` com `DB_CONNECTION=mysql`, ajuste as variáveis abaixo. Escolha uma senha de teste de pelo menos oito caracteres para `AUTH_DEMO_PASSWORD`.

   ```dotenv
   FRONTEND_URL=http://localhost:5173
   QUEUE_CONNECTION=sync
   MAIL_MAILER=smtp
   MAIL_SCHEME=null
   MAIL_HOST=127.0.0.1
   MAIL_PORT=1025
   MAIL_USERNAME=null
   MAIL_PASSWORD=null
   AUTH_DEMO_PASSWORD='substitua-por-uma-senha-de-teste'
   ```

2. Na pasta `backend`, rode `php artisan config:clear`, `php artisan migrate` e `php artisan db:seed --class=AuthDemoSeeder`. O seeder cria as contas de demonstração e preserva as senhas das contas já criadas por padrão.
3. Inicie o Mailpit e mantenha o backend e o frontend rodando nas portas `8000` e `5173`.
4. No [login do SAGE](http://localhost:5173/sage/login), clique em **Esqueceu a senha?** e informe `empresa.demo@example.com`.
5. Na [caixa do Mailpit](http://127.0.0.1:8025), abra o e-mail de recuperação e confirme o layout do SAGE. Clique em **Redefinir senha** e escolha uma nova senha. O link é de uso único e vale 60 minutos.
6. Volte ao login da empresa. Confira que a senha anterior é recusada e que a nova permite entrar.

O Mailpit recebe a mensagem na caixa de testes local.

### Testes automatizados com SQLite em memória

Na pasta `backend`, com a extensão `pdo_sqlite` habilitada, rode:

```bash
php vendor/bin/phpunit --filter 'PasswordResetControllerTest|EnviarEmailRecuperacaoSenhaJobTest'
```

O `phpunit.xml` configura um banco SQLite temporário em memória para essa execução. Os testes simulam o envio e cobrem a solicitação e a redefinição de senha, a validade do token e o conteúdo do e-mail em HTML e texto.
