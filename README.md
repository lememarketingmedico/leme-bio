# LEME Bio

Sistema próprio de link na bio para a LEME Marketing Médico.

A estrutura recomendada é:

- `lememarketingmedico.com.br` continua na HostGator
- `link.lememarketingmedico.com.br` aponta para a VPS
- cada cliente usa uma URL automática, como `link.lememarketingmedico.com.br/dr-gabriel-jose`

## O que esta versão faz

- Página pública para criação sem login
- Prévia mobile em tempo real
- Até 10 links por página
- Ícones em SVG, sem emojis
- Upload de foto e logo com otimização automática
- Página pública final com assinatura fixa da LEME
- Link secreto de edição gerado automaticamente
- Painel administrativo interno em `/admin`
- Métricas simples de visitas e cliques
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
http://localhost:3000/
```

Painel interno:

```txt
http://localhost:3000/admin
```

Página demo:

```txt
http://localhost:3000/demo
```

## 2. Fluxo público

1. A pessoa entra em `link.lememarketingmedico.com.br`
2. Preenche o formulário
3. Vê a prévia mobile em tempo real
4. Cria a página sem login
5. Recebe o link público e o link secreto de edição

Exemplo de links gerados:

```txt
https://link.lememarketingmedico.com.br/gabriel-jose
https://link.lememarketingmedico.com.br/edit/TOKEN_SECRETO
```

## 3. Subir no GitHub

Crie um repositório vazio no GitHub, depois rode:

```bash
git init
git add .
git commit -m "LEME Bio público"
git branch -M main
git remote add origin https://github.com/SEU-USUARIO/leme-bio.git
git push -u origin main
```

## 4. Deploy na VPS com EasyPanel

No EasyPanel:

1. Crie um projeto chamado `leme-bio`
2. Crie um serviço PostgreSQL
3. Crie um app a partir do repositório do GitHub
4. Configure a porta interna como `3000`
5. Configure as variáveis de ambiente
6. Adicione o domínio:

```txt
link.lememarketingmedico.com.br
```

7. Ative SSL/HTTPS
8. Crie um volume persistente apontando para `/app/uploads`

O DNS que você criou na HostGator deve ficar assim:

```txt
Tipo: A
Nome: link
Valor: 147.93.190.210
TTL: 3600
```

## 5. Variáveis de ambiente

```env
DATABASE_URL=postgres://postgres:SUA_SENHA@postgres:5432/sistema_leme
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

## 6. Banco de dados

O sistema cria automaticamente as tabelas:

- `bios`
- `links`
- `events`

Também cria uma página demo na primeira inicialização.

## 7. Uploads e performance

As imagens enviadas pelo usuário são otimizadas automaticamente com `sharp`:

- avatar: redimensionado e convertido para webp
- logo: redimensionado e convertido para webp
- fundo: quando usado no painel admin, também é otimizado

Isso reduz o peso das páginas e melhora a abertura do link na bio.

## 8. Limites desta versão

- máximo de 10 links por página
- branding da LEME é fixo e não pode ser removido
- a edição pública depende do link secreto gerado após a criação

## 9. Próximas melhorias possíveis

- Captura de leads com e-mail antes de publicar
- QR Code automático por página
- Domínio personalizado por cliente
- Integração com n8n
- Pixel Meta por página
- UTM automática por link
- Templates por nicho

## 10. Segurança dos dados e persistência

As páginas ficam salvas no PostgreSQL. As imagens ficam salvas na pasta `uploads`.

Para não perder nada em deploy ou reinicialização, no EasyPanel é obrigatório manter:

- serviço PostgreSQL com volume persistente
- volume/mount do app em `/app/uploads`
- backup periódico do banco PostgreSQL
- backup periódico da pasta de uploads

Sem volume persistente no `/app/uploads`, imagens enviadas podem sumir em um redeploy. Sem backup do PostgreSQL, existe risco de perda se a VPS for apagada, reinstalada ou corrompida.
