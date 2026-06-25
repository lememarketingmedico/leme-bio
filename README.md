# LEME Bio

Sistema próprio de link na bio para a LEME Marketing Médico.

A estrutura recomendada é:

- `lememarketingmedico.com.br` continua na HostGator
- `link.lememarketingmedico.com.br` aponta para a VPS
- cada cliente usa uma URL automática, como `link.lememarketingmedico.com.br/dr-gabriel-jose`

O sistema já vem com:

- Painel administrativo com login
- Cadastro de páginas por cliente
- Slug automático e editável
- Personalização de cores
- Templates visuais
- Upload de foto, logo e fundo
- Links ilimitados
- Ícones por link
- Link em destaque
- Ativar/desativar página
- Ativar/desativar links
- Métricas de visitas e cliques
- Redirecionamento rastreável
- Sitemap e robots.txt
- Dockerfile e docker-compose
- Pronto para VPS e EasyPanel

## 1. Rodar localmente

Copie o arquivo de variáveis:

```bash
cp .env.example .env
```

Edite o `.env` e troque pelo menos:

```env
ADMIN_EMAIL=admin@lememarketingmedico.com.br
ADMIN_PASSWORD=uma-senha-forte
COOKIE_SECRET=uma-chave-grande-e-secreta
APP_URL=https://link.lememarketingmedico.com.br
```

Suba com Docker:

```bash
docker compose up --build
```

Acesse:

```txt
http://localhost:3000/admin
```

Página pública demo:

```txt
http://localhost:3000/demo
```

## 2. Subir no GitHub

Crie um repositório vazio no GitHub, depois rode:

```bash
git init
git add .
git commit -m "Primeira versão do LEME Bio"
git branch -M main
git remote add origin https://github.com/SEU-USUARIO/leme-bio.git
git push -u origin main
```

## 3. Deploy na VPS com EasyPanel

No EasyPanel:

1. Crie um projeto chamado `leme-bio`
2. Crie um serviço PostgreSQL ou use o `docker-compose.yml`
3. Crie um app a partir do repositório do GitHub
4. Configure a porta interna como `3000`
5. Configure as variáveis de ambiente
6. Adicione o domínio:

```txt
link.lememarketingmedico.com.br
```

7. Ative SSL/HTTPS

O DNS que você criou na HostGator deve ficar assim:

```txt
Tipo: A
Nome: link
Valor: 147.93.190.210
```

## 4. Variáveis de ambiente

```env
DATABASE_URL=postgres://leme_bio:leme_bio_password@postgres:5432/leme_bio
ADMIN_EMAIL=admin@lememarketingmedico.com.br
ADMIN_PASSWORD=troque-esta-senha
COOKIE_SECRET=troque-esta-chave-por-uma-chave-grande-e-secreta
COOKIE_SECURE=false
APP_NAME=LEME Bio
APP_URL=https://link.lememarketingmedico.com.br
PORT=3000
NODE_ENV=production
TRUST_PROXY=true
UPLOAD_DIR=uploads
MAX_UPLOAD_MB=4
```

Em produção com HTTPS funcionando, você pode usar:

```env
COOKIE_SECURE=true
```

Se isso impedir o login no primeiro teste, volte para `false`, confirme o proxy/SSL e depois ative novamente.

## 5. Como usar

Entre no painel:

```txt
https://link.lememarketingmedico.com.br/admin
```

Crie uma página para o cliente, por exemplo:

```txt
Slug: gabriel-jose
```

A página será publicada automaticamente em:

```txt
https://link.lememarketingmedico.com.br/gabriel-jose
```

Depois disso, é só adicionar os links:

- WhatsApp
- Instagram
- Site
- Google Maps
- Agenda
- Formulário
- Landing page
- Conteúdo especial

## 6. Uploads

As imagens ficam na pasta `uploads`.

No Docker Compose, essa pasta já está como volume:

```yaml
volumes:
  - ./uploads:/app/uploads
```

No EasyPanel, mantenha essa pasta persistente para não perder imagens ao atualizar o app.

## 7. Banco de dados

O sistema cria as tabelas automaticamente ao iniciar:

- `bios`
- `links`
- `events`

Ele também cria uma página demo na primeira inicialização.

## 8. Próximas melhorias possíveis

- QR Code automático por cliente
- Domínio personalizado por cliente
- Integração com n8n
- Exportação de relatório mensal em PDF
- Pixel Meta por página
- UTM automática por link
- Templates específicos por especialidade médica
