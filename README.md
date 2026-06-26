# LEME Bio

Sistema próprio de link na bio para a LEME Marketing Médico.

## Versão atual

- Editor visual direto no mockup do celular
- Mockup em proporção 9:16
- Foto principal editável pelo próprio mockup
- Textos editáveis diretamente no nome, subtítulo e descrição
- Botões editados por pop-up
- Modelos prontos em mini prévias
- Cores personalizáveis após escolher o modelo
- Limite de 10 botões por página
- Logo/assinatura da LEME fixa no rodapé
- Criação pública sem login
- Painel interno em `/admin`

## Tipos de botão disponíveis

- Agendar horário: link personalizado
- Falar no WhatsApp: usuário digita apenas DDD + número, o sistema adiciona 55
- Conheça nossos serviços: link personalizado
- Ver localização no Google Maps: link personalizado
- Avaliações no Google: link personalizado
- Site oficial: link personalizado
- Instagram: usuário digita o @
- YouTube: link do canal
- Facebook: link da página
- Telefone: usuário digita apenas DDD + número, o sistema cria o link de ligação
- Email: usuário digita apenas o e-mail, o sistema cria o `mailto:`
- Baixar material gratuito: link personalizado

## Estrutura recomendada

- `lememarketingmedico.com.br` continua na HostGator
- `link.lememarketingmedico.com.br` aponta para a VPS
- cada página usa uma URL automática, como `link.lememarketingmedico.com.br/dr-gabriel-jose`

## Variáveis de ambiente

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

## Deploy no EasyPanel

1. Suba o projeto no GitHub
2. No EasyPanel, crie ou atualize o app pelo repositório
3. Use a porta interna `3000`
4. Configure as variáveis de ambiente
5. Adicione o domínio `link.lememarketingmedico.com.br`
6. Ative SSL
7. Garanta volume persistente em `/app/uploads`
8. Garanta que o Postgres tenha volume persistente

## Segurança dos dados

Os textos, cores e links ficam no PostgreSQL. As imagens ficam na pasta `uploads`.

Para não perder nada em redeploy, mantenha:

- volume persistente no Postgres
- volume persistente em `/app/uploads`
- backup periódico do banco
- backup periódico da pasta `uploads`
