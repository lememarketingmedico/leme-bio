const { adminLayout } = require('./layout');
const { escapeHtml, escapeAttr, formatNumber, formatDateTime } = require('../utils');

const iconOptions = [
  ['link', 'Link'], ['whatsapp', 'WhatsApp'], ['instagram', 'Instagram'], ['site', 'Site'],
  ['agenda', 'Agenda'], ['maps', 'Localização'], ['phone', 'Telefone'], ['email', 'E-mail'],
  ['form', 'Formulário'], ['video', 'Vídeo'], ['download', 'Download'], ['star', 'Destaque'],
  ['clinic', 'Clínica'], ['doctor', 'Médico']
];

function pageHeader(title, subtitle, action = '') {
  return `<div class="page-header"><div><h1>${escapeHtml(title)}</h1><p>${escapeHtml(subtitle || '')}</p></div>${action}</div>`;
}

function statCard(label, value) {
  return `<article class="stat-card"><span>${escapeHtml(label)}</span><strong>${formatNumber(value)}</strong></article>`;
}

function dashboardPage(stats, bios) {
  const rows = bios.slice(0, 8).map(bio => `
    <tr>
      <td><strong>${escapeHtml(bio.title)}</strong><small>/${escapeHtml(bio.slug)}</small></td>
      <td>${bio.published ? '<span class="pill ok">Publicada</span>' : '<span class="pill muted">Rascunho</span>'}</td>
      <td>${formatNumber(bio.visits_30)}</td>
      <td>${formatNumber(bio.clicks_30)}</td>
      <td><a class="btn small" href="/admin/bios/${bio.id}/edit">Editar</a></td>
    </tr>`).join('') || `<tr><td colspan="5">Nenhuma página cadastrada ainda.</td></tr>`;

  const body = `
    ${pageHeader('Dashboard', 'Visão geral das páginas de link na bio.', '<a class="btn primary" href="/admin/bios/new">Criar página</a>')}
    <section class="stats-grid">
      ${statCard('Páginas', stats.bios)}
      ${statCard('Links', stats.links)}
      ${statCard('Visitas em 30 dias', stats.visits_30)}
      ${statCard('Cliques em 30 dias', stats.clicks_30)}
    </section>
    <section class="panel">
      <div class="panel-title"><h2>Páginas recentes</h2><a href="/admin/bios">Ver todas</a></div>
      <div class="table-wrap"><table><thead><tr><th>Página</th><th>Status</th><th>Visitas 30d</th><th>Cliques 30d</th><th></th></tr></thead><tbody>${rows}</tbody></table></div>
    </section>`;
  return adminLayout({ title: 'Dashboard', active: 'dashboard', body });
}

function biosListPage(bios) {
  const cards = bios.map(bio => `
    <article class="bio-card">
      <div class="bio-thumb" style="--p:${escapeAttr(bio.primary_color)};--s:${escapeAttr(bio.secondary_color)}">
        ${bio.avatar_url ? `<img src="${escapeAttr(bio.avatar_url)}" alt="">` : `<span>${escapeHtml((bio.title || 'L').charAt(0))}</span>`}
      </div>
      <div class="bio-info">
        <h3>${escapeHtml(bio.title)}</h3>
        <p>${escapeHtml(bio.subtitle || 'Sem subtítulo')}</p>
        <code>/${escapeHtml(bio.slug)}</code>
        <div class="bio-metrics"><span>${formatNumber(bio.visits_30)} visitas</span><span>${formatNumber(bio.clicks_30)} cliques</span></div>
      </div>
      <div class="bio-actions">
        ${bio.published ? '<span class="pill ok">Publicada</span>' : '<span class="pill muted">Rascunho</span>'}
        <a class="btn small" href="/${escapeAttr(bio.slug)}" target="_blank">Abrir</a>
        <a class="btn small primary" href="/admin/bios/${bio.id}/edit">Editar</a>
      </div>
    </article>`).join('') || `<div class="empty">Nenhuma página cadastrada ainda.</div>`;

  const body = `
    ${pageHeader('Páginas', 'Gerencie os links na bio dos clientes.', '<a class="btn primary" href="/admin/bios/new">Nova página</a>')}
    <section class="bio-list">${cards}</section>`;
  return adminLayout({ title: 'Páginas', active: 'bios', body });
}

function colorInput(name, label, value) {
  return `<label>${escapeHtml(label)}<div class="color-row"><input type="color" name="${name}" value="${escapeAttr(value)}"><input type="text" name="${name}_text" value="${escapeAttr(value)}" data-color-sync="${name}"></div></label>`;
}

function select(name, label, value, options) {
  return `<label>${escapeHtml(label)}<select name="${name}">${options.map(([key, text]) => `<option value="${escapeAttr(key)}" ${value === key ? 'selected' : ''}>${escapeHtml(text)}</option>`).join('')}</select></label>`;
}

function bioFormPage({ mode = 'new', bio = {}, links = [], analytics = null, error = '' }) {
  const isEdit = mode === 'edit';
  const action = isEdit ? `/admin/bios/${bio.id}` : '/admin/bios';
  const publicUrl = isEdit ? `/${bio.slug}` : '';
  const linkRows = links.map(linkForm).join('') || `<div class="empty small-empty">Nenhum link cadastrado ainda.</div>`;
  const analyticsHtml = analytics ? renderAnalytics(analytics) : '';

  const body = `
    ${pageHeader(isEdit ? `Editar ${bio.title}` : 'Nova página', isEdit ? `Página pública: /${bio.slug}` : 'Cadastre uma página de link na bio.', isEdit ? `<a class="btn" href="${publicUrl}" target="_blank">Ver página</a>` : '')}
    ${error ? `<div class="alert danger">${escapeHtml(error)}</div>` : ''}
    <form class="editor-grid" method="post" action="${action}" enctype="multipart/form-data">
      <section class="panel editor-main">
        <h2>Informações principais</h2>
        <div class="grid-2">
          <label>Nome exibido<input name="title" required value="${escapeAttr(bio.title || '')}" placeholder="Dr. Gabriel José"></label>
          <label>Slug da URL<input name="slug" required value="${escapeAttr(bio.slug || '')}" placeholder="gabriel-jose"></label>
        </div>
        <label>Subtítulo<input name="subtitle" value="${escapeAttr(bio.subtitle || '')}" placeholder="Feridas e Estomias"></label>
        <label>Descrição<textarea name="description" rows="4" placeholder="Texto curto de posicionamento">${escapeHtml(bio.description || '')}</textarea></label>
        <div class="grid-2">
          <label>Instagram<input name="instagram" value="${escapeAttr(bio.instagram || '')}" placeholder="https://instagram.com/... ou @usuario"></label>
          <label>WhatsApp<input name="whatsapp" value="${escapeAttr(bio.whatsapp || '')}" placeholder="https://wa.me/55..."></label>
          <label>Site<input name="website" value="${escapeAttr(bio.website || '')}" placeholder="https://..."></label>
          <label>Localização<input name="location" value="${escapeAttr(bio.location || '')}" placeholder="Google Maps"></label>
        </div>
      </section>

      <section class="panel">
        <h2>Visual</h2>
        <div class="grid-2">
          ${select('template', 'Template', bio.template || 'premium', [['premium','Premium'],['clinic','Clínica'],['minimal','Minimalista'],['dark','Dark elegante']])}
          ${select('button_style', 'Estilo dos botões', bio.button_style || 'glass', [['glass','Vidro fosco'],['solid','Sólido'],['outline','Contorno'],['soft','Suave']])}
          ${select('background_type', 'Tipo de fundo', bio.background_type || 'gradient', [['gradient','Degradê'],['solid','Cor sólida'],['image','Imagem']])}
          ${select('font_family', 'Fonte', bio.font_family || 'inter', [['inter','Moderna'],['serif','Editorial'],['rounded','Arredondada']])}
        </div>
        <div class="grid-2">
          ${colorInput('primary_color', 'Cor principal', bio.primary_color || '#1B2E5A')}
          ${colorInput('secondary_color', 'Cor secundária', bio.secondary_color || '#D7B56D')}
          ${colorInput('background_color', 'Fundo 1', bio.background_color || '#0B1020')}
          ${colorInput('background_color_2', 'Fundo 2', bio.background_color_2 || '#1B2E5A')}
          ${colorInput('text_color', 'Cor do texto', bio.text_color || '#FFFFFF')}
        </div>
        <div class="grid-3">
          <label>Foto/avatar<input type="file" name="avatar" accept="image/png,image/jpeg,image/webp,image/svg+xml"></label>
          <label>Logo<input type="file" name="logo" accept="image/png,image/jpeg,image/webp,image/svg+xml"></label>
          <label>Imagem de fundo<input type="file" name="background" accept="image/png,image/jpeg,image/webp,image/svg+xml"></label>
        </div>
        <div class="checks">
          <label><input type="checkbox" name="published" ${bio.published !== false ? 'checked' : ''}> Publicada</label>
          <label><input type="checkbox" name="show_branding" ${bio.show_branding !== false ? 'checked' : ''}> Mostrar “Criado por LEME”</label>
        </div>
      </section>

      <section class="panel">
        <h2>SEO e compartilhamento</h2>
        <div class="grid-2">
          <label>Título SEO<input name="seo_title" value="${escapeAttr(bio.seo_title || '')}" placeholder="Dr. Gabriel José | Links"></label>
          <label>Descrição SEO<input name="seo_description" value="${escapeAttr(bio.seo_description || '')}" placeholder="Acesse os principais canais."></label>
        </div>
      </section>

      <div class="save-bar">
        <button class="btn primary" type="submit">Salvar página</button>
        ${isEdit ? `<a class="btn" href="/${escapeAttr(bio.slug)}" target="_blank">Abrir página</a>` : ''}
      </div>
    </form>

    ${isEdit ? `
      <section class="panel links-panel">
        <div class="panel-title"><h2>Links da página</h2><span>Use a ordem para organizar os botões.</span></div>
        <div class="link-list">${linkRows}</div>
        <form class="add-link-form" method="post" action="/admin/bios/${bio.id}/links">
          <h3>Adicionar novo link</h3>
          <div class="grid-6">
            <label>Texto<input name="label" required placeholder="Agendar consulta"></label>
            <label>URL<input name="url" required placeholder="https://..."></label>
            ${select('icon', 'Ícone', 'link', iconOptions)}
            <label>Descrição<input name="description" placeholder="Opcional"></label>
            <label>Ordem<input type="number" name="sort_order" value="${links.length + 1}"></label>
            <div class="checks inline"><label><input type="checkbox" name="is_highlight"> Destaque</label></div>
          </div>
          <button class="btn primary" type="submit">Adicionar link</button>
        </form>
      </section>
      ${analyticsHtml}
      <section class="danger-zone">
        <form method="post" action="/admin/bios/${bio.id}/delete" onsubmit="return confirm('Tem certeza que deseja excluir esta página?')">
          <button class="btn danger" type="submit">Excluir página</button>
        </form>
      </section>` : ''}`;

  return adminLayout({ title: isEdit ? `Editar ${bio.title}` : 'Nova página', active: isEdit ? 'bios' : 'new', body });
}

function linkForm(link) {
  return `<form class="link-item" method="post" action="/admin/links/${link.id}">
    <div class="link-handle">↕</div>
    <div class="grid-6">
      <label>Texto<input name="label" required value="${escapeAttr(link.label)}"></label>
      <label>URL<input name="url" required value="${escapeAttr(link.url)}"></label>
      ${select('icon', 'Ícone', link.icon || 'link', iconOptions)}
      <label>Descrição<input name="description" value="${escapeAttr(link.description || '')}"></label>
      <label>Ordem<input type="number" name="sort_order" value="${Number(link.sort_order || 0)}"></label>
      <div class="checks inline">
        <label><input type="checkbox" name="is_active" ${link.is_active ? 'checked' : ''}> Ativo</label>
        <label><input type="checkbox" name="is_highlight" ${link.is_highlight ? 'checked' : ''}> Destaque</label>
      </div>
    </div>
    <div class="link-actions">
      <button class="btn small primary" type="submit">Salvar</button>
      <button class="btn small danger" type="submit" formaction="/admin/links/${link.id}/delete" formmethod="post" onclick="return confirm('Excluir este link?')">Excluir</button>
    </div>
  </form>`;
}

function renderAnalytics(analytics) {
  const totals = analytics.totals || {};
  const linkRows = analytics.linkStats.map(item => `<tr><td>${escapeHtml(item.label)}</td><td>${formatNumber(item.clicks)}</td></tr>`).join('') || '<tr><td colspan="2">Nenhum clique ainda.</td></tr>';
  const max = Math.max(...analytics.daily.map(d => Math.max(d.visits, d.clicks)), 1);
  const bars = analytics.daily.map(d => `
    <div class="bar-day">
      <div class="bar-stack">
        <span title="Visitas" style="height:${Math.max((d.visits / max) * 100, d.visits ? 8 : 0)}%"></span>
        <em title="Cliques" style="height:${Math.max((d.clicks / max) * 100, d.clicks ? 8 : 0)}%"></em>
      </div>
      <small>${escapeHtml(d.day)}</small>
    </div>`).join('') || '<p class="muted-text">Sem dados nos últimos 14 dias.</p>';

  return `<section class="panel">
    <div class="panel-title"><h2>Métricas</h2><span>Dados simples de visitas e cliques.</span></div>
    <div class="stats-grid compact">
      ${statCard('Visitas totais', totals.visits_total)}
      ${statCard('Cliques totais', totals.clicks_total)}
      ${statCard('Visitas 30d', totals.visits_30)}
      ${statCard('Cliques 30d', totals.clicks_30)}
    </div>
    <div class="analytics-grid">
      <div><h3>Últimos 14 dias</h3><div class="bar-chart">${bars}</div><p class="legend"><span></span> Visitas <em></em> Cliques</p></div>
      <div><h3>Cliques por link</h3><div class="table-wrap"><table><thead><tr><th>Link</th><th>Cliques</th></tr></thead><tbody>${linkRows}</tbody></table></div></div>
    </div>
  </section>`;
}

function notFoundAdmin(message = 'Não encontrado') {
  return adminLayout({ title: 'Não encontrado', body: `<div class="empty">${escapeHtml(message)}</div>` });
}

module.exports = { dashboardPage, biosListPage, bioFormPage, notFoundAdmin };
