const { publicHtml } = require('./layout');
const { escapeHtml, escapeAttr, renderIcon } = require('../utils');

function fontClass(font = 'inter') {
  if (font === 'serif') return 'font-serif';
  if (font === 'rounded') return 'font-rounded';
  return 'font-inter';
}

function backgroundStyle(bio) {
  if (bio.background_type === 'image' && bio.background_image_url) {
    return `background-image: linear-gradient(180deg, rgba(0,0,0,.38), rgba(0,0,0,.68)), url('${escapeAttr(bio.background_image_url)}');`;
  }
  if (bio.background_type === 'solid') {
    return `background:${escapeAttr(bio.background_color)};`;
  }
  return `background: radial-gradient(circle at 20% 0%, ${escapeAttr(bio.secondary_color)}40 0, transparent 28%), linear-gradient(145deg, ${escapeAttr(bio.background_color)}, ${escapeAttr(bio.background_color_2)});`;
}

function normalizeSocial(value, type) {
  const raw = String(value || '').trim();
  if (!raw) return '#';
  if (type === 'instagram' && raw.startsWith('@')) return `https://instagram.com/${raw.replace('@', '')}`;
  if (/^(https?:\/\/|mailto:|tel:|whatsapp:)/i.test(raw)) return raw;
  if (type === 'whatsapp' && /^\+?\d{10,15}$/.test(raw.replace(/\D/g, ''))) return `https://wa.me/${raw.replace(/\D/g, '')}`;
  return `https://${raw}`;
}

function quickLinksHtml(bio) {
  const quickLinks = [
    bio.instagram ? ['instagram', normalizeSocial(bio.instagram, 'instagram')] : null,
    bio.whatsapp ? ['whatsapp', normalizeSocial(bio.whatsapp, 'whatsapp')] : null,
    bio.website ? ['site', normalizeSocial(bio.website, 'site')] : null,
    bio.location ? ['maps', normalizeSocial(bio.location, 'maps')] : null
  ].filter(Boolean);

  if (!quickLinks.length) return '';
  return `<nav class="quick-links">${quickLinks.map(([icon, url]) => `<a href="${escapeAttr(url)}" target="_blank" rel="noopener">${renderIcon(icon)}</a>`).join('')}</nav>`;
}

function publicBranding() {
  return `<a class="powered" href="https://lememarketingmedico.com.br" target="_blank" rel="noopener">
    <img src="/assets/leme-logo.png" alt="LEME Marketing Médico">
    <span>Feito com LEME Bio</span>
  </a>`;
}

function bioCardHtml(bio, links, opts = {}) {
  const linkHtml = links.map(link => {
    const href = opts.preview ? '#' : `/go/${link.id}`;
    return `
      <a class="public-link ${link.is_highlight ? 'highlight' : ''}" href="${href}" ${opts.preview ? 'onclick="return false"' : 'target="_blank" rel="noopener"'}>
        <span class="link-icon">${renderIcon(link.icon)}</span>
        <span class="link-copy"><strong>${escapeHtml(link.label)}</strong>${link.description ? `<small>${escapeHtml(link.description)}</small>` : ''}</span>
        <span class="arrow">${renderIcon('link')}</span>
      </a>`;
  }).join('');

  return `<section class="bio-phone ${opts.preview ? 'is-preview' : ''}">
      ${bio.logo_url ? `<img class="client-logo" src="${escapeAttr(bio.logo_url)}" alt="Logo ${escapeAttr(bio.title)}">` : ''}
      <div class="avatar-wrap">
        ${bio.avatar_url ? `<img class="avatar" src="${escapeAttr(bio.avatar_url)}" alt="${escapeAttr(bio.title)}">` : `<div class="avatar fallback">${escapeHtml((bio.title || 'L').charAt(0))}</div>`}
      </div>
      <h1>${escapeHtml(bio.title || 'Seu nome ou marca')}</h1>
      ${bio.subtitle ? `<p class="subtitle">${escapeHtml(bio.subtitle)}</p>` : '<p class="subtitle">Seu subtítulo aparece aqui</p>'}
      ${bio.description ? `<p class="description">${escapeHtml(bio.description)}</p>` : '<p class="description">Uma descrição curta para apresentar seu trabalho, serviço ou marca.</p>'}
      ${quickLinksHtml(bio)}
      <div class="links-stack">${linkHtml || '<p class="empty-public">Adicione até 10 botões e veja o resultado em tempo real.</p>'}</div>
      ${publicBranding()}
    </section>`;
}

function publicBioPage(bio, links) {
  const title = bio.seo_title || `${bio.title} | Links`;
  const description = bio.seo_description || bio.description || bio.subtitle || 'Links principais.';
  const styleVars = `--primary:${escapeAttr(bio.primary_color)};--secondary:${escapeAttr(bio.secondary_color)};--text:${escapeAttr(bio.text_color)};`;

  const body = `<main class="public-shell ${fontClass(bio.font_family)} template-${escapeAttr(bio.template)} buttons-${escapeAttr(bio.button_style)}" style="${styleVars}${backgroundStyle(bio)}">
    <div class="ambient one"></div>
    <div class="ambient two"></div>
    ${bioCardHtml(bio, links)}
  </main>`;

  return publicHtml({ title, description, body });
}

function defaultBuilderData() {
  return {
    title: '',
    slug: '',
    subtitle: '',
    description: '',
    template: 'premium',
    button_style: 'glass',
    primary_color: '#2E6C96',
    secondary_color: '#5EA4D3',
    background_type: 'gradient',
    background_color: '#081321',
    background_color_2: '#123250',
    text_color: '#FFFFFF',
    links: [
      { label: 'Meu WhatsApp', url: '', icon: 'whatsapp', description: '', is_highlight: true },
      { label: 'Meu Instagram', url: '', icon: 'instagram', description: '', is_highlight: false }
    ]
  };
}

function renderBuilderLinkCard(link = {}, index = 0) {
  const label = link.label || 'Novo botão';
  const url = link.url || 'Clique para configurar';
  return `<div class="builder-link-card" data-link-card data-index="${index}">
    <input type="hidden" name="link_label_${index}" value="${escapeAttr(link.label || '')}" data-field="label">
    <input type="hidden" name="link_url_${index}" value="${escapeAttr(link.url || '')}" data-field="url">
    <input type="hidden" name="link_icon_${index}" value="${escapeAttr(link.icon || 'link')}" data-field="icon">
    <input type="hidden" name="link_description_${index}" value="${escapeAttr(link.description || '')}" data-field="description">
    <input type="hidden" name="link_highlight_${index}" value="${link.is_highlight ? 'on' : ''}" data-field="highlight">
    <button class="builder-link-card-button" type="button" data-edit-link>
      <span class="builder-link-card-icon">${renderIcon(link.icon || 'link')}</span>
      <span class="builder-link-card-copy">
        <strong data-display="label">${escapeHtml(label)}</strong>
        <small data-display="url">${escapeHtml(url)}</small>
      </span>
      <span class="builder-link-card-meta">${link.is_highlight ? 'Destaque' : 'Editar'}</span>
    </button>
  </div>`;
}

function builderPage({ form = {}, error = '', editMode = false, editToken = '' }) {
  const data = { ...defaultBuilderData(), ...form };
  const links = Array.isArray(form.links) && form.links.length ? form.links : data.links;
  const previewBio = {
    ...data,
    avatar_url: form.avatar_preview_url || '',
    logo_url: form.logo_preview_url || ''
  };
  const helpMessage = encodeURIComponent('Olá! Tentei criar meu link na bio na plataforma da LEME, mas não consegui. Vocês podem fazer gratuitamente para mim?');

  const body = `<main class="builder-page builder-two-columns">
    <section class="builder-workspace">
      <div class="builder-column builder-editor-column">
        <div class="builder-editor-scroll">
          <div class="builder-topbar">
            <img class="hero-logo compact" src="/assets/leme-logo.png" alt="LEME Marketing Médico">
            <div class="builder-topbar-copy">
              <span class="home-badge">LEME Bio</span>
              <h1>Crie sua página de link na bio</h1>
              <p>Edite na coluna da esquerda e veja a prévia fixa do lado direito, em um mockup de celular.</p>
            </div>
          </div>

          ${error ? `<div class="alert danger">${escapeHtml(error)}</div>` : ''}

          <form class="builder-form-stacked" method="post" action="${editMode ? `/edit/${escapeAttr(editToken)}` : '/create'}" enctype="multipart/form-data" id="public-builder-form">
            <section class="panel builder-form-card compact-card">
              <div class="section-head">
                <div>
                  <h2>Informações principais</h2>
                  <p>O essencial para sua página ficar bonita e pronta para compartilhar.</p>
                </div>
              </div>
              <div class="grid-2">
                <label>Nome exibido<input name="title" required maxlength="80" value="${escapeAttr(data.title || '')}" placeholder="Seu nome ou marca"></label>
                <label>Endereço da página<input name="slug" required maxlength="80" value="${escapeAttr(data.slug || '')}" placeholder="seu-nome"></label>
              </div>
              <div class="grid-2">
                <label>Subtítulo<input name="subtitle" maxlength="80" value="${escapeAttr(data.subtitle || '')}" placeholder="Especialidade, profissão ou nicho"></label>
                <label>Descrição curta<input name="description" maxlength="180" value="${escapeAttr(data.description || '')}" placeholder="Explique rapidamente o que você faz"></label>
              </div>
              <div class="grid-2">
                <label>Foto ou logo principal<input type="file" name="avatar" accept="image/png,image/jpeg,image/webp,image/svg+xml"></label>
                <label>Logo secundária opcional<input type="file" name="logo" accept="image/png,image/jpeg,image/webp,image/svg+xml"></label>
              </div>
              <p class="hint">As imagens são otimizadas automaticamente para carregar rápido.</p>
            </section>

            <section class="panel builder-form-card compact-card">
              <div class="section-head">
                <div>
                  <h2>Visual</h2>
                  <p>Personalize rápido com os tons de azul da identidade LEME.</p>
                </div>
              </div>
              <div class="grid-2">
                <label>Modelo
                  <select name="template">
                    <option value="premium" ${data.template === 'premium' ? 'selected' : ''}>Premium</option>
                    <option value="clinic" ${data.template === 'clinic' ? 'selected' : ''}>Clínica</option>
                    <option value="minimal" ${data.template === 'minimal' ? 'selected' : ''}>Minimalista</option>
                    <option value="dark" ${data.template === 'dark' ? 'selected' : ''}>Dark elegante</option>
                  </select>
                </label>
                <label>Estilo dos botões
                  <select name="button_style">
                    <option value="glass" ${data.button_style === 'glass' ? 'selected' : ''}>Vidro</option>
                    <option value="solid" ${data.button_style === 'solid' ? 'selected' : ''}>Sólido</option>
                    <option value="outline" ${data.button_style === 'outline' ? 'selected' : ''}>Contorno</option>
                    <option value="soft" ${data.button_style === 'soft' ? 'selected' : ''}>Suave</option>
                  </select>
                </label>
              </div>
              <div class="grid-2 colors-grid simplified-colors">
                ${colorInput('primary_color', 'Azul principal', data.primary_color)}
                ${colorInput('secondary_color', 'Azul de apoio', data.secondary_color)}
                ${colorInput('background_color', 'Fundo 1', data.background_color)}
                ${colorInput('background_color_2', 'Fundo 2', data.background_color_2)}
              </div>
            </section>

            <section class="panel builder-form-card compact-card links-card-panel">
              <div class="section-head">
                <div>
                  <h2>Botões da página</h2>
                  <p>Adicione até 10 botões. Clique em um botão para editar em um pop-up mais simples.</p>
                </div>
                <div class="link-limit-badge"><strong id="link-count">${links.length}</strong>/10</div>
              </div>
              <div id="builder-links-list" class="builder-link-card-list">${links.map((link, index) => renderBuilderLinkCard(link, index)).join('')}</div>
              <div class="builder-link-actions-row">
                <button class="btn primary" type="button" id="add-link-btn">Adicionar novo botão</button>
                <span class="submit-tip">Dica: marque um botão como destaque para chamar mais atenção.</span>
              </div>
              <template id="link-row-template">${renderBuilderLinkCard({}, '__INDEX__')}</template>
            </section>

            <section class="panel builder-form-card compact-card help-card">
              <div class="section-head single">
                <div>
                  <h2>Quer que a gente faça para você?</h2>
                  <p>Se travar em qualquer etapa, a equipe da LEME cria gratuitamente para você.</p>
                </div>
                <a class="btn help-whatsapp" href="https://wa.me/553491003193?text=${helpMessage}" target="_blank" rel="noopener">Falar com a LEME no WhatsApp</a>
              </div>
            </section>

            <div class="builder-submit-row wide">
              <button class="btn primary large" type="submit">${editMode ? 'Salvar alterações' : 'Criar meu link na bio'}</button>
              <a class="btn" href="https://wa.me/553491003193?text=${helpMessage}" target="_blank" rel="noopener">Preciso de ajuda da LEME</a>
            </div>

            <section class="builder-mobile-preview-section">
              <div class="section-head single mobile-head-preview">
                <div>
                  <h2>Prévia da página</h2>
                  <p>No celular, a prévia aparece aqui embaixo.</p>
                </div>
              </div>
              <div class="phone-mockup phone-mockup-mobile">
                <div class="phone-notch"></div>
                <div class="phone-screen preview-surface" id="builder-preview-mobile" data-template="${escapeAttr(previewBio.template)}" data-button-style="${escapeAttr(previewBio.button_style)}" data-font-family="${escapeAttr(previewBio.font_family || 'inter')}" style="--primary:${escapeAttr(previewBio.primary_color)};--secondary:${escapeAttr(previewBio.secondary_color)};--text:${escapeAttr(previewBio.text_color)};${backgroundStyle(previewBio)}">
                  ${bioCardHtml(previewBio, links, { preview: true })}
                </div>
              </div>
            </section>

            <div class="builder-modal-backdrop" id="link-modal-backdrop" hidden>
              <div class="builder-modal" role="dialog" aria-modal="true" aria-labelledby="link-modal-title">
                <div class="builder-modal-head">
                  <h3 id="link-modal-title">Configurar botão</h3>
                  <button type="button" class="modal-close" id="close-link-modal">×</button>
                </div>
                <div class="builder-modal-body">
                  <label>Texto do botão<input type="text" id="modal-link-label" maxlength="50" placeholder="Agende sua consulta"></label>
                  <label>URL do botão<input type="text" id="modal-link-url" maxlength="300" placeholder="https://..."></label>
                  <label>Ícone
                    <select id="modal-link-icon">
                      ${['whatsapp','instagram','site','agenda','maps','phone','email','form','video','download','star','clinic','doctor','link'].map(icon => `<option value="${icon}">${iconLabel(icon)}</option>`).join('')}
                    </select>
                  </label>
                  <label>Descrição curta<input type="text" id="modal-link-description" maxlength="70" placeholder="Opcional"></label>
                  <label class="modal-checkbox"><input type="checkbox" id="modal-link-highlight"> Deixar esse botão em destaque</label>
                </div>
                <div class="builder-modal-actions">
                  <button type="button" class="btn ghost" id="delete-link-btn">Excluir botão</button>
                  <div class="builder-modal-actions-right">
                    <button type="button" class="btn" id="cancel-link-btn">Cancelar</button>
                    <button type="button" class="btn primary" id="save-link-btn">Salvar botão</button>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>

      <aside class="builder-column builder-preview-column">
        <div class="preview-sticky-shell">
          <div class="preview-side-header">
            <span class="home-badge">Prévia fixa</span>
            <p>Role a coluna da esquerda e acompanhe o resultado em tempo real.</p>
          </div>
          <div class="phone-mockup">
            <div class="phone-notch"></div>
            <div class="phone-screen preview-surface" id="builder-preview" data-template="${escapeAttr(previewBio.template)}" data-button-style="${escapeAttr(previewBio.button_style)}" data-font-family="${escapeAttr(previewBio.font_family || 'inter')}" style="--primary:${escapeAttr(previewBio.primary_color)};--secondary:${escapeAttr(previewBio.secondary_color)};--text:${escapeAttr(previewBio.text_color)};${backgroundStyle(previewBio)}">
              ${bioCardHtml(previewBio, links, { preview: true })}
            </div>
          </div>
        </div>
      </aside>
    </section>
  </main>`;

  return publicHtml({
    title: editMode ? 'Editar página | LEME Bio' : 'Criar link na bio | LEME Bio',
    description: 'Crie seu link na bio sem login com a plataforma da LEME Marketing Médico.',
    body,
    head: '<script defer src="/assets/builder.js"></script>'
  });
}

function colorInput(name, label, value) {
  return `<label>${escapeHtml(label)}<div class="color-row"><input type="color" name="${name}" value="${escapeAttr(value || '#000000')}"><input type="text" name="${name}_text" value="${escapeAttr(value || '#000000')}" data-color-sync="${escapeAttr(name)}"></div></label>`;
}

function iconLabel(icon) {
  const labels = {
    whatsapp: 'WhatsApp', instagram: 'Instagram', site: 'Site', agenda: 'Agenda', maps: 'Localização', phone: 'Telefone',
    email: 'E-mail', form: 'Formulário', video: 'Vídeo', download: 'Download', star: 'Destaque', clinic: 'Clínica', doctor: 'Médico', link: 'Link'
  };
  return labels[icon] || icon;
}

function successPage({ bioUrl, editUrl }) {
  const body = `<main class="public-home success-home">
    <section>
      <img class="hero-logo small" src="/assets/leme-logo.png" alt="LEME Marketing Médico">
      <div class="home-badge">Página criada</div>
      <h1>Seu link na bio já está no ar.</h1>
      <p>Guarde os links abaixo para divulgar sua página e, se quiser, fazer alterações depois.</p>
      <div class="success-links">
        <div><span>Link público</span><a href="${escapeAttr(bioUrl)}" target="_blank" rel="noopener">${escapeHtml(bioUrl)}</a></div>
        <div><span>Link de edição</span><a href="${escapeAttr(editUrl)}" target="_blank" rel="noopener">${escapeHtml(editUrl)}</a></div>
      </div>
      <div class="success-actions">
        <a href="${escapeAttr(bioUrl)}" class="home-button" target="_blank" rel="noopener">Abrir minha página</a>
        <a href="${escapeAttr(editUrl)}" class="home-button secondary" target="_blank" rel="noopener">Editar depois</a>
      </div>
    </section>
  </main>`;
  return publicHtml({ title: 'Página criada | LEME Bio', description: 'Sua página foi criada com sucesso.', body });
}

function homePage() {
  return builderPage({});
}

function notFoundPage() {
  const body = `<main class="public-home"><section><img class="hero-logo small" src="/assets/leme-logo.png" alt="LEME Marketing Médico"><div class="home-badge">404</div><h1>Página não encontrada.</h1><p>Verifique se o link está correto.</p><a class="home-button" href="/">Criar meu link na bio</a></section></main>`;
  return publicHtml({ title: 'Página não encontrada', description: '', body });
}

module.exports = { publicBioPage, homePage, notFoundPage, builderPage, successPage };
