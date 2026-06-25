const { escapeHtml } = require('../utils');

function adminLayout({ title = 'LEME Bio', body = '', active = '' }) {
  const nav = [
    ['dashboard', '/admin', 'Dashboard'],
    ['bios', '/admin/bios', 'Páginas'],
    ['new', '/admin/bios/new', 'Nova página']
  ].map(([key, href, label]) => `<a class="${active === key ? 'active' : ''}" href="${href}">${label}</a>`).join('');

  return `<!doctype html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(title)} | LEME Bio</title>
  <link rel="stylesheet" href="/assets/admin.css">
</head>
<body class="admin-body">
  <aside class="sidebar">
    <div class="brand">
      <div class="brand-mark">L</div>
      <div>
        <strong>LEME Bio</strong>
        <span>Painel interno</span>
      </div>
    </div>
    <nav>${nav}</nav>
    <form method="post" action="/admin/logout">
      <button class="logout" type="submit">Sair</button>
    </form>
  </aside>
  <main class="admin-main">${body}</main>
  <script src="/assets/admin.js"></script>
</body>
</html>`;
}

function publicHtml({ title, description, body, head = '' }) {
  return `<!doctype html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  <title>${escapeHtml(title || 'LEME Bio')}</title>
  <meta name="description" content="${escapeHtml(description || '')}">
  <meta property="og:title" content="${escapeHtml(title || 'LEME Bio')}">
  <meta property="og:description" content="${escapeHtml(description || '')}">
  <meta property="og:type" content="website">
  <meta name="theme-color" content="#0B1020">
  <link rel="stylesheet" href="/assets/public.css">
  ${head}
</head>
<body>${body}</body>
</html>`;
}

function loginPage(error = '') {
  return `<!doctype html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Entrar | LEME Bio</title>
  <link rel="stylesheet" href="/assets/admin.css">
</head>
<body class="login-body">
  <section class="login-card">
    <div class="login-logo">L</div>
    <h1>LEME Bio</h1>
    <p>Entre para gerenciar as páginas de link na bio.</p>
    ${error ? `<div class="alert danger">${escapeHtml(error)}</div>` : ''}
    <form method="post" action="/admin/login" class="stack">
      <label>E-mail<input type="email" name="email" required autofocus></label>
      <label>Senha<input type="password" name="password" required></label>
      <button class="btn primary" type="submit">Entrar</button>
    </form>
  </section>
</body>
</html>`;
}

module.exports = { adminLayout, publicHtml, loginPage };
