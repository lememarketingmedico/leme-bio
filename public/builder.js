(function () {
  const form = document.getElementById('public-builder-form');
  if (!form) return;

  const preview = document.getElementById('builder-preview');
  const linksList = document.getElementById('builder-links-list');
  const addLinkBtn = document.getElementById('add-link-btn');
  const template = document.getElementById('link-row-template');
  const linkCountEl = document.getElementById('link-count');

  const iconSvg = {
    link: '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M10.6 13.4a3 3 0 0 1 0-4.2l2.6-2.6a3 3 0 0 1 4.2 4.2l-.8.8"/><path d="M13.4 10.6a3 3 0 0 1 0 4.2l-2.6 2.6a3 3 0 1 1-4.2-4.2l.8-.8"/></svg>',
    whatsapp: '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M20 11.2c0 4.8-3.9 8.8-8.8 8.8-1.5 0-3-.4-4.2-1.1L2 20l1.2-4.7A8.7 8.7 0 0 1 2.4 12c0-4.8 3.9-8.8 8.8-8.8s8.8 3.9 8.8 8.8Z"/><path d="M8 7.7c-.2-.5-.4-.5-.7-.5h-.6c-.2 0-.6.1-.8.4-.3.3-1 1-1 2.4s1 2.9 1.2 3.1c.1.2 2 3.1 5 4.2 2.4 1 2.9.8 3.4.8.5-.1 1.7-.7 1.9-1.4.2-.7.2-1.4.1-1.5-.1-.1-.4-.2-.9-.5s-1.7-.8-2-.9c-.2-.1-.4-.1-.6.2l-.8.9c-.2.2-.3.2-.6.1-.3-.2-1.1-.4-2.1-1.4-.8-.7-1.4-1.6-1.5-1.9-.2-.3 0-.4.1-.6l.4-.5.3-.5c.1-.2 0-.4 0-.6l-.8-2Z"/></svg>',
    instagram: '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="4" width="16" height="16" rx="5"/><circle cx="12" cy="12" r="3.6"/><circle cx="17.2" cy="6.8" r="1" fill="currentColor" stroke="none"/></svg>',
    site: '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M3.5 12h17"/><path d="M12 3.2c2 2.1 3.2 5.2 3.2 8.8 0 3.6-1.1 6.7-3.2 8.8-2-2.1-3.2-5.2-3.2-8.8 0-3.6 1.1-6.7 3.2-8.8Z"/></svg>',
    agenda: '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="5" width="16" height="15" rx="3"/><path d="M8 3.5v3M16 3.5v3M4 9.5h16"/><path d="M8.5 13h3M8.5 16h6"/></svg>',
    maps: '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20c3.6-4.3 5.4-7.5 5.4-9.7a5.4 5.4 0 1 0-10.8 0c0 2.2 1.8 5.4 5.4 9.7Z"/><circle cx="12" cy="10" r="2.2"/></svg>',
    phone: '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M7.2 4.8c.4-.4 1-.6 1.6-.3l2 1c.6.3.8 1 .6 1.6l-.6 1.5c-.1.3 0 .6.2.9 1 1.6 2.4 3 4 4 .3.2.6.3.9.2l1.5-.6c.6-.2 1.3 0 1.6.6l1 2c.3.6.1 1.2-.3 1.6l-1 1c-.7.7-1.7 1-2.7.8-2.3-.4-5-2-7.3-4.3s-3.9-5-4.3-7.3c-.2-1 .1-2 .8-2.7l1-1Z"/></svg>',
    email: '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3.5" y="5.5" width="17" height="13" rx="2.5"/><path d="m4.5 7 7.5 6 7.5-6"/></svg>',
    form: '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="3.5" width="14" height="17" rx="2.5"/><path d="M8.5 8h7M8.5 11.5h7M8.5 15h4"/></svg>',
    video: '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="5" width="11.5" height="14" rx="2.5"/><path d="m15.5 10 4.5-2.5v9L15.5 14"/></svg>',
    download: '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 4.5v9"/><path d="m8.5 10.5 3.5 3.5 3.5-3.5"/><path d="M5 18.5h14"/></svg>',
    star: '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="m12 3.8 2.5 5 5.5.8-4 3.9 1 5.5-5-2.6-5 2.6 1-5.5-4-3.9 5.5-.8L12 3.8Z"/></svg>',
    clinic: '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M6 19V8.5C6 6 8 4 10.5 4h3C16 4 18 6 18 8.5V19"/><path d="M9 19v-4h6v4"/><path d="M10.5 8h3M12 6.5v3"/></svg>',
    doctor: '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="3"/><path d="M7 18c.7-2.5 2.7-4 5-4s4.3 1.5 5 4"/><path d="M18.5 9.5v4M16.5 11.5h4"/></svg>'
  };

  function qs(name) {
    return form.querySelector(`[name="${name}"]`);
  }

  function updateColorSync() {
    form.querySelectorAll('[data-color-sync]').forEach(input => {
      const colorInput = form.querySelector(`input[type="color"][name="${input.dataset.colorSync}"]`);
      if (!colorInput || colorInput.dataset.bound) return;
      colorInput.dataset.bound = '1';
      colorInput.addEventListener('input', () => { input.value = colorInput.value; renderPreview(); });
      input.addEventListener('input', () => {
        if (/^#[0-9a-f]{6}$/i.test(input.value)) colorInput.value = input.value;
        renderPreview();
      });
    });
  }

  function reindexLinks() {
    const rows = [...linksList.querySelectorAll('[data-link-row]')];
    rows.forEach((row, index) => {
      row.querySelectorAll('input, select').forEach(field => {
        const baseName = field.name
          .replace(/link_label_\d+/, `link_label_${index}`)
          .replace(/link_url_\d+/, `link_url_${index}`)
          .replace(/link_icon_\d+/, `link_icon_${index}`)
          .replace(/link_description_\d+/, `link_description_${index}`)
          .replace(/link_highlight_\d+/, `link_highlight_${index}`);
        field.name = baseName;
      });
    });
    linkCountEl.textContent = String(rows.length);
    addLinkBtn.disabled = rows.length >= 10;
  }

  function addLinkRow(initialRender) {
    const current = linksList.querySelectorAll('[data-link-row]').length;
    if (current >= 10) return;
    const html = template.innerHTML.replaceAll('__INDEX__', String(current));
    linksList.insertAdjacentHTML('beforeend', html);
    if (!initialRender) reindexLinks();
    bindRowActions();
    renderPreview();
  }

  function bindRowActions() {
    linksList.querySelectorAll('[data-remove-link]').forEach(btn => {
      if (btn.dataset.bound) return;
      btn.dataset.bound = '1';
      btn.addEventListener('click', () => {
        btn.closest('[data-link-row]').remove();
        reindexLinks();
        renderPreview();
      });
    });
  }

  function autoSlugify() {
    const slugInput = qs('slug');
    const titleInput = qs('title');
    if (!slugInput || !titleInput) return;
    if (!slugInput.value) {
      titleInput.addEventListener('input', () => {
        if (slugInput.dataset.touched) return;
        slugInput.value = titleInput.value
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .toLowerCase()
          .trim()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-+|-+$/g, '')
          .slice(0, 80);
        renderPreview();
      });
    }
    slugInput.addEventListener('input', () => { slugInput.dataset.touched = '1'; renderPreview(); });
  }

  function attachImagePreview(name, selector, isLogo) {
    const input = qs(name);
    if (!input) return;
    input.addEventListener('change', () => {
      const file = input.files && input.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        let target = preview.querySelector(selector);
        if (!target && !isLogo) {
          const wrap = preview.querySelector('.avatar-wrap');
          wrap.innerHTML = `<img class="avatar" src="${reader.result}" alt="Prévia">`;
        } else if (!target && isLogo) {
          const firstChild = preview.querySelector('.bio-phone').firstElementChild;
          if (!firstChild || !firstChild.classList.contains('client-logo')) {
            preview.querySelector('.bio-phone').insertAdjacentHTML('afterbegin', `<img class="client-logo" src="${reader.result}" alt="Logo">`);
          }
        }
        target = preview.querySelector(selector);
        if (target) target.src = reader.result;
      };
      reader.readAsDataURL(file);
    });
  }

  function buildQuickLinks(state) {
    const links = [];
    if (state.instagram) links.push({ icon: 'instagram' });
    if (state.whatsapp) links.push({ icon: 'whatsapp' });
    if (state.website) links.push({ icon: 'site' });
    if (state.location) links.push({ icon: 'maps' });
    return links.map(item => `<a href="#" onclick="return false">${iconSvg[item.icon] || iconSvg.link}</a>`).join('');
  }

  function getState() {
    const rows = [...linksList.querySelectorAll('[data-link-row]')];
    return {
      title: qs('title')?.value.trim() || '',
      subtitle: qs('subtitle')?.value.trim() || '',
      description: qs('description')?.value.trim() || '',
      instagram: qs('instagram')?.value.trim() || '',
      whatsapp: qs('whatsapp')?.value.trim() || '',
      website: qs('website')?.value.trim() || '',
      location: qs('location')?.value.trim() || '',
      template: qs('template')?.value || 'premium',
      buttonStyle: qs('button_style')?.value || 'glass',
      primary: qs('primary_color_text')?.value || qs('primary_color')?.value || '#1B2E5A',
      secondary: qs('secondary_color_text')?.value || qs('secondary_color')?.value || '#D7B56D',
      background1: qs('background_color_text')?.value || qs('background_color')?.value || '#091121',
      background2: qs('background_color_2_text')?.value || qs('background_color_2')?.value || '#1B2E5A',
      text: qs('text_color_text')?.value || qs('text_color')?.value || '#FFFFFF',
      links: rows.map(row => ({
        label: row.querySelector('[name^="link_label_"]')?.value.trim() || '',
        url: row.querySelector('[name^="link_url_"]')?.value.trim() || '',
        icon: row.querySelector('[name^="link_icon_"]')?.value || 'link',
        description: row.querySelector('[name^="link_description_"]')?.value.trim() || '',
        is_highlight: row.querySelector('[name^="link_highlight_"]')?.checked || false
      })).filter(item => item.label || item.url || item.description)
    };
  }

  function renderPreview() {
    if (!preview) return;
    const state = getState();

    preview.className = `preview-surface template-${state.template} buttons-${state.buttonStyle}`;
    preview.style.setProperty('--primary', state.primary);
    preview.style.setProperty('--secondary', state.secondary);
    preview.style.setProperty('--text', state.text);
    preview.style.background = `radial-gradient(circle at 20% 0%, ${state.secondary}40 0, transparent 28%), linear-gradient(145deg, ${state.background1}, ${state.background2})`;

    const titleEl = preview.querySelector('h1');
    const subtitleEl = preview.querySelector('.subtitle');
    const descriptionEl = preview.querySelector('.description');
    const avatarFallback = preview.querySelector('.avatar.fallback');
    const quickLinks = preview.querySelector('.quick-links');
    const linksStack = preview.querySelector('.links-stack');

    if (titleEl) titleEl.textContent = state.title || 'Seu nome ou marca';
    if (subtitleEl) subtitleEl.textContent = state.subtitle || 'Seu subtítulo aparece aqui';
    if (descriptionEl) descriptionEl.textContent = state.description || 'Uma descrição curta para apresentar seu trabalho, serviço ou marca.';
    if (avatarFallback) avatarFallback.textContent = (state.title || 'L').charAt(0).toUpperCase();

    if (quickLinks) {
      const quick = buildQuickLinks(state);
      quickLinks.innerHTML = quick;
      quickLinks.style.display = quick ? 'flex' : 'none';
    }

    if (linksStack) {
      if (!state.links.length) {
        linksStack.innerHTML = '<p class="empty-public">Adicione até 10 links e veja o resultado em tempo real.</p>';
      } else {
        linksStack.innerHTML = state.links.map(link => `
          <a class="public-link ${link.is_highlight ? 'highlight' : ''}" href="#" onclick="return false">
            <span class="link-icon">${iconSvg[link.icon] || iconSvg.link}</span>
            <span class="link-copy"><strong>${escapeHtml(link.label || 'Novo link')}</strong>${link.description ? `<small>${escapeHtml(link.description)}</small>` : ''}</span>
            <span class="arrow">${iconSvg.link}</span>
          </a>
        `).join('');
      }
    }
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  form.addEventListener('input', renderPreview);
  form.addEventListener('change', renderPreview);

  if (addLinkBtn) {
    addLinkBtn.addEventListener('click', () => addLinkRow(false));
  }

  updateColorSync();
  autoSlugify();
  bindRowActions();
  reindexLinks();
  attachImagePreview('avatar', '.avatar', false);
  attachImagePreview('logo', '.client-logo', true);
  renderPreview();
})();
