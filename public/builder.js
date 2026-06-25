(function () {
  const form = document.getElementById('public-builder-form');
  if (!form) return;

  const previewScreen = document.getElementById('builder-preview');
  const hiddenLinks = document.getElementById('builder-links-hidden');
  const avatarInput = document.getElementById('avatar-input');
  const logoInput = document.getElementById('logo-input');
  const logoSelectButton = document.getElementById('logo-select-button');
  const inlineEditor = document.getElementById('inline-text-editor');
  const inlineEditorTitle = document.getElementById('inline-editor-title');
  const inlineEditorInput = document.getElementById('inline-editor-input');
  const closeInlineEditor = document.getElementById('close-inline-editor');

  const modal = document.getElementById('link-modal-backdrop');
  const modalLabel = document.getElementById('modal-link-label');
  const modalKind = document.getElementById('modal-link-kind');
  const modalValueWrap = document.getElementById('modal-link-value-wrap');
  const modalValue = document.getElementById('modal-link-value');
  const modalDescription = document.getElementById('modal-link-description');
  const modalHighlight = document.getElementById('modal-link-highlight');
  const saveLinkBtn = document.getElementById('save-link-btn');
  const cancelLinkBtn = document.getElementById('cancel-link-btn');
  const closeLinkModal = document.getElementById('close-link-modal');
  const deleteLinkBtn = document.getElementById('delete-link-btn');
  const googleBusinessBlock = document.getElementById('google-business-search-block');
  const googleBusinessSearchBtn = document.getElementById('google-business-search-btn');
  const googleBusinessResults = document.getElementById('google-business-results');

  const iconSvg = {
    link: '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M10.6 13.4a3 3 0 0 1 0-4.2l2.6-2.6a3 3 0 0 1 4.2 4.2l-.8.8"/><path d="M13.4 10.6a3 3 0 0 1 0 4.2l-2.6 2.6a3 3 0 1 1-4.2-4.2l.8-.8"/></svg>',
    whatsapp: '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M20 11.2c0 4.8-3.9 8.8-8.8 8.8-1.5 0-3-.4-4.2-1.1L2 20l1.2-4.7A8.7 8.7 0 0 1 2.4 12c0-4.8 3.9-8.8 8.8-8.8s8.8 3.9 8.8 8.8Z"/><path d="M8 7.7c-.2-.5-.4-.5-.7-.5h-.6c-.2 0-.6.1-.8.4-.3.3-1 1-1 2.4s1 2.9 1.2 3.1c.1.2 2 3.1 5 4.2 2.4 1 2.9.8 3.4.8.5-.1 1.7-.7 1.9-1.4.2-.7.2-1.4.1-1.5-.1-.1-.4-.2-.9-.5s-1.7-.8-2-.9c-.2-.1-.4-.1-.6.2l-.8.9c-.2.2-.3.2-.6.1-.3-.2-1.1-.4-2.1-1.4-.8-.7-1.4-1.6-1.5-1.9-.2-.3 0-.4.1-.6l.4-.5.3-.5c.1-.2 0-.4 0-.6l-.8-2Z"/></svg>',
    instagram: '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="4" width="16" height="16" rx="5"/><circle cx="12" cy="12" r="3.6"/><circle cx="17.2" cy="6.8" r="1" fill="currentColor" stroke="none"/></svg>',
    site: '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M3.5 12h17"/><path d="M12 3.2c2 2.1 3.2 5.2 3.2 8.8 0 3.6-1.1 6.7-3.2 8.8-2-2.1-3.2-5.2-3.2-8.8 0-3.6 1.1-6.7 3.2-8.8Z"/></svg>',
    maps: '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20c3.6-4.3 5.4-7.5 5.4-9.7a5.4 5.4 0 1 0-10.8 0c0 2.2 1.8 5.4 5.4 9.7Z"/><circle cx="12" cy="10" r="2.2"/></svg>',
    phone: '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M7.2 4.8c.4-.4 1-.6 1.6-.3l2 1c.6.3.8 1 .6 1.6l-.6 1.5c-.1.3 0 .6.2.9 1 1.6 2.4 3 4 4 .3.2.6.3.9.2l1.5-.6c.6-.2 1.3 0 1.6.6l1 2c.3.6.1 1.2-.3 1.6l-1 1c-.7.7-1.7 1-2.7.8-2.3-.4-5-2-7.3-4.3s-3.9-5-4.3-7.3c-.2-1 .1-2 .8-2.7l1-1Z"/></svg>',
    email: '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3.5" y="5.5" width="17" height="13" rx="2.5"/><path d="m4.5 7 7.5 6 7.5-6"/></svg>',
    form: '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="3.5" width="14" height="17" rx="2.5"/><path d="M8.5 8h7M8.5 11.5h7M8.5 15h4"/></svg>',
    video: '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="5" width="11.5" height="14" rx="2.5"/><path d="m15.5 10 4.5-2.5v9L15.5 14"/></svg>',
    download: '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 4.5v9"/><path d="m8.5 10.5 3.5 3.5 3.5-3.5"/><path d="M5 18.5h14"/></svg>',
    star: '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="m12 3.8 2.5 5 5.5.8-4 3.9 1 5.5-5-2.6-5 2.6 1-5.5-4-3.9 5.5-.8L12 3.8Z"/></svg>',
    plus: '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14M5 12h14"/></svg>',
    edit: '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20h4.8L19 9.8a2.2 2.2 0 0 0-3.1-3.1L5.7 16.9 4 20Z"/><path d="m14.5 8.1 3.4 3.4"/></svg>'
  };

  const linkKindMeta = {
    whatsapp: { label: 'Número do WhatsApp', placeholder: '5534999999999', icon: 'whatsapp' },
    phone: { label: 'Número de telefone', placeholder: '5534999999999', icon: 'phone' },
    email: { label: 'Seu e-mail', placeholder: 'voce@seusite.com', icon: 'email' },
    instagram: { label: 'Usuário do Instagram', placeholder: '@seuusuario', icon: 'instagram' },
    site: { label: 'Link do site', placeholder: 'https://seudominio.com', icon: 'site' },
    maps: { label: 'Endereço ou link do Maps', placeholder: 'Rua..., Cidade ou link', icon: 'maps' },
    google_review: { label: 'Nome da empresa no Google', placeholder: 'Ex.: Gastrocentro Araguari', icon: 'star' },
    form: { label: 'Link do formulário', placeholder: 'https://forms...', icon: 'form' },
    video: { label: 'Link do vídeo', placeholder: 'https://youtube.com/...', icon: 'video' },
    download: { label: 'Link do arquivo', placeholder: 'https://...', icon: 'download' }
  };

  const presetColors = {
    leme: { primary: '#1E5C89', secondary: '#5DA1D1', bg1: '#081321', bg2: '#123250' },
    premium: { primary: '#244F78', secondary: '#9ED4FF', bg1: '#08111E', bg2: '#1B3354' },
    light: { primary: '#2D6E99', secondary: '#72B6E4', bg1: '#D9EBF8', bg2: '#F5FAFF' },
    dark: { primary: '#163B60', secondary: '#5A94C3', bg1: '#040A12', bg2: '#0F2238' }
  };

  const fieldNames = ['title', 'slug', 'subtitle', 'description', 'template', 'button_style', 'primary_color', 'secondary_color', 'background_color', 'background_color_2'];
  const inlineConfig = {
    title: { label: 'Editar nome', max: 80 },
    subtitle: { label: 'Editar subtítulo', max: 80 },
    description: { label: 'Editar descrição', max: 180 }
  };

  let activeCard = null;
  let inlineField = null;
  let avatarPreviewUrl = previewScreen.querySelector('.avatar')?.src || '';
  let logoPreviewUrl = previewScreen.querySelector('.client-logo')?.src || '';
  let slugTouched = Boolean((form.querySelector('[name="slug"]')?.value || '').trim());

  function qs(name) {
    return form.querySelector(`[name="${name}"]`);
  }

  function getCards() {
    return [...hiddenLinks.querySelectorAll('[data-link-card]')];
  }

  function getField(card, field) {
    return card.querySelector(`[data-field="${field}"]`);
  }

  function getCardData(card) {
    return {
      label: getField(card, 'label')?.value || '',
      url: getField(card, 'url')?.value || '',
      icon: getField(card, 'icon')?.value || 'site',
      description: getField(card, 'description')?.value || '',
      is_highlight: getField(card, 'highlight')?.value === 'on',
      kind: getField(card, 'kind')?.value || 'site',
      value: getField(card, 'value')?.value || '',
      place_id: getField(card, 'place_id')?.value || ''
    };
  }

  function getState() {
    return {
      title: qs('title')?.value.trim() || '',
      slug: qs('slug')?.value.trim() || '',
      subtitle: qs('subtitle')?.value.trim() || '',
      description: qs('description')?.value.trim() || '',
      template: qs('template')?.value || 'ocean',
      button_style: qs('button_style')?.value || 'glass',
      primary_color: qs('primary_color_text')?.value || qs('primary_color')?.value || '#1E5C89',
      secondary_color: qs('secondary_color_text')?.value || qs('secondary_color')?.value || '#5DA1D1',
      background_color: qs('background_color_text')?.value || qs('background_color')?.value || '#081321',
      background_color_2: qs('background_color_2_text')?.value || qs('background_color_2')?.value || '#123250',
      text_color: '#FFFFFF',
      avatar_url: avatarPreviewUrl,
      logo_url: logoPreviewUrl,
      links: getCards().map(getCardData).filter(link => link.label || link.value || link.url)
    };
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function buildUrl(kind, value, placeId) {
    const raw = String(value || '').trim();
    if (!raw && kind !== 'google_review') return '';
    switch (kind) {
      case 'whatsapp': return `https://wa.me/${raw.replace(/\D/g, '')}`;
      case 'phone': return `tel:${raw.replace(/[^\d+]/g, '')}`;
      case 'email': return `mailto:${raw}`;
      case 'instagram': return `https://instagram.com/${raw.replace(/^@/, '')}`;
      case 'maps': return /^https?:\/\//i.test(raw) ? raw : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(raw)}`;
      case 'google_review': return placeId ? `https://search.google.com/local/writereview?placeid=${encodeURIComponent(placeId)}` : '';
      default: return /^(https?:\/\/|mailto:|tel:)/i.test(raw) ? raw : `https://${raw.replace(/^https?:\/\//i, '')}`;
    }
  }

  function iconForKind(kind) {
    return linkKindMeta[kind]?.icon || 'site';
  }

  function createHiddenCard(data) {
    const index = getCards().length;
    const html = `
      <div class="builder-hidden-link" data-link-card data-index="${index}">
        <input type="hidden" name="link_label_${index}" value="${escapeHtml(data.label || '')}" data-field="label">
        <input type="hidden" name="link_url_${index}" value="${escapeHtml(data.url || '')}" data-field="url">
        <input type="hidden" name="link_icon_${index}" value="${escapeHtml(data.icon || 'site')}" data-field="icon">
        <input type="hidden" name="link_description_${index}" value="${escapeHtml(data.description || '')}" data-field="description">
        <input type="hidden" name="link_highlight_${index}" value="${data.is_highlight ? 'on' : ''}" data-field="highlight">
        <input type="hidden" name="link_kind_${index}" value="${escapeHtml(data.kind || 'site')}" data-field="kind">
        <input type="hidden" name="link_value_${index}" value="${escapeHtml(data.value || '')}" data-field="value">
        <input type="hidden" name="link_place_id_${index}" value="${escapeHtml(data.place_id || '')}" data-field="place_id">
      </div>`;
    hiddenLinks.insertAdjacentHTML('beforeend', html);
    return getCards()[getCards().length - 1];
  }

  function reindexLinks() {
    getCards().forEach((card, index) => {
      card.dataset.index = String(index);
      ['label', 'url', 'icon', 'description', 'highlight', 'kind', 'value', 'place_id'].forEach((field) => {
        const input = getField(card, field);
        if (input) input.name = `link_${field}_${index}`;
      });
    });
  }

  function setCardData(card, data) {
    getField(card, 'label').value = data.label || '';
    getField(card, 'url').value = data.url || '';
    getField(card, 'icon').value = data.icon || 'site';
    getField(card, 'description').value = data.description || '';
    getField(card, 'highlight').value = data.is_highlight ? 'on' : '';
    getField(card, 'kind').value = data.kind || 'site';
    getField(card, 'value').value = data.value || '';
    getField(card, 'place_id').value = data.place_id || '';
  }

  function buildBioHtml(state) {
    const links = state.links.map((link, index) => `
      <div class="public-link-wrap editable-public-link">
        <a class="public-link ${link.is_highlight ? 'highlight' : ''}" href="#" onclick="return false">
          <span class="link-icon">${iconSvg[link.icon] || iconSvg.site}</span>
          <span class="link-copy"><strong>${escapeHtml(link.label || 'Novo botão')}</strong>${link.description ? `<small>${escapeHtml(link.description)}</small>` : ''}</span>
          <span class="arrow">${iconSvg.link}</span>
        </a>
        <button class="edit-bubble link-edit-bubble" type="button" data-edit-link-index="${index}" aria-label="Editar botão">${iconSvg.edit}</button>
      </div>`).join('');

    const avatarMarkup = state.avatar_url
      ? `<img class="avatar" src="${escapeHtml(state.avatar_url)}" alt="${escapeHtml(state.title || 'Avatar')}">`
      : `<div class="avatar fallback">${escapeHtml((state.title || 'L').charAt(0).toUpperCase())}</div>`;

    return `
      <section class="bio-phone editable-bio-phone">
        ${state.logo_url ? `<img class="client-logo" src="${escapeHtml(state.logo_url)}" alt="Logo">` : ''}
        <div class="editable-block avatar-edit-block" data-edit-section-area="avatar">
          <div class="avatar-wrap">${avatarMarkup}</div>
          <button class="edit-bubble" type="button" data-edit-section="avatar" aria-label="Trocar foto">${iconSvg.edit}</button>
        </div>
        <div class="editable-block text-edit-block" data-edit-section-area="title">
          <h1>${escapeHtml(state.title || 'Seu nome ou marca')}</h1>
          <button class="edit-bubble" type="button" data-edit-section="title" aria-label="Editar nome">${iconSvg.edit}</button>
        </div>
        <div class="editable-block text-edit-block slim" data-edit-section-area="subtitle">
          <p class="subtitle">${escapeHtml(state.subtitle || 'Seu subtítulo aparece aqui')}</p>
          <button class="edit-bubble" type="button" data-edit-section="subtitle" aria-label="Editar subtítulo">${iconSvg.edit}</button>
        </div>
        <div class="editable-block text-edit-block slim" data-edit-section-area="description">
          <p class="description">${escapeHtml(state.description || 'Uma descrição curta para apresentar seu trabalho, serviço ou marca.')}</p>
          <button class="edit-bubble" type="button" data-edit-section="description" aria-label="Editar descrição">${iconSvg.edit}</button>
        </div>
        <div class="links-stack">${links || '<p class="empty-public">Adicione até 10 botões e veja o resultado em tempo real.</p>'}
          <button class="add-link-dashed" type="button" data-add-link>${iconSvg.plus}<span>Adicionar novo botão</span></button>
        </div>
        <a class="powered" href="https://lememarketingmedico.com.br" target="_blank" rel="noopener"><img src="/assets/leme-logo.png" alt="LEME Marketing Médico"><span>Feito com LEME Bio</span></a>
      </section>`;
  }

  function renderPreview() {
    const state = getState();
    previewScreen.className = `phone-screen preview-surface template-${state.template} buttons-${state.button_style}`;
    previewScreen.style.setProperty('--primary', state.primary_color);
    previewScreen.style.setProperty('--secondary', state.secondary_color);
    previewScreen.style.setProperty('--text', '#FFFFFF');
    previewScreen.style.background = `radial-gradient(circle at 20% 0%, ${state.secondary_color}40 0, transparent 28%), linear-gradient(145deg, ${state.background_color}, ${state.background_color_2})`;
    const existingBio = previewScreen.querySelector('.bio-phone');
    if (existingBio) existingBio.outerHTML = buildBioHtml(state);
    else previewScreen.insertAdjacentHTML('afterbegin', buildBioHtml(state));
  }

  function openInlineEditor(field) {
    if (!inlineConfig[field]) return;
    inlineField = field;
    inlineEditorTitle.textContent = inlineConfig[field].label;
    inlineEditorInput.maxLength = inlineConfig[field].max;
    inlineEditorInput.value = qs(field)?.value || '';
    inlineEditor.hidden = false;
    inlineEditorInput.focus();
    inlineEditorInput.select();
  }

  function closeInline() {
    inlineEditor.hidden = true;
    inlineField = null;
  }

  function openModal(card) {
    activeCard = card;
    const data = card ? getCardData(card) : { label: '', kind: 'site', value: '', place_id: '', description: '', is_highlight: false };
    modalLabel.value = data.label || '';
    modalKind.value = data.kind || 'site';
    modalValue.value = data.value || '';
    modalValue.dataset.placeId = data.place_id || '';
    modalDescription.value = data.description || '';
    modalHighlight.checked = Boolean(data.is_highlight);
    googleBusinessResults.innerHTML = '';
    syncKindUI();
    modal.hidden = false;
    document.body.style.overflow = 'hidden';
    setTimeout(() => modalLabel.focus(), 20);
  }

  function closeModal() {
    modal.hidden = true;
    document.body.style.overflow = '';
    activeCard = null;
  }

  function syncKindUI() {
    const meta = linkKindMeta[modalKind.value] || linkKindMeta.site;
    const span = modalValueWrap.querySelector('span'); if (span) span.textContent = meta.label;
    modalValue.placeholder = meta.placeholder;
    const showGoogle = modalKind.value === 'google_review';
    googleBusinessBlock.hidden = !showGoogle;
    if (!showGoogle) {
      modalValue.dataset.placeId = '';
      googleBusinessResults.innerHTML = '';
    }
  }

  async function searchGoogleBusiness() {
    const query = modalValue.value.trim();
    if (!query) return;
    googleBusinessResults.innerHTML = '<div class="google-result-item"><small>Buscando perfil...</small></div>';
    try {
      const response = await fetch(`/api/google-business-search?q=${encodeURIComponent(query)}`);
      const data = await response.json();
      const results = Array.isArray(data.results) ? data.results : [];
      if (!results.length) {
        googleBusinessResults.innerHTML = '<div class="google-result-item"><small>Não encontramos resultados. Você também pode tentar outro nome mais específico.</small></div>';
        return;
      }
      googleBusinessResults.innerHTML = results.map((item) => `
        <button type="button" class="google-result-item" data-place-id="${escapeHtml(item.place_id)}" data-place-name="${escapeHtml(item.name)}">
          <strong>${escapeHtml(item.name)}</strong>
          <small>${escapeHtml(item.address || '')}</small>
        </button>`).join('');
    } catch (error) {
      googleBusinessResults.innerHTML = '<div class="google-result-item"><small>Não foi possível buscar agora.</small></div>';
    }
  }

  function saveModal() {
    const kind = modalKind.value;
    const placeId = modalValue.dataset.placeId || '';
    const value = modalValue.value.trim();
    const url = buildUrl(kind, value, placeId);
    const data = {
      label: modalLabel.value.trim(),
      kind,
      value,
      place_id: placeId,
      url,
      description: modalDescription.value.trim(),
      is_highlight: modalHighlight.checked,
      icon: iconForKind(kind)
    };

    if (!data.label || !data.url) {
      alert('Preencha o texto do botão e o conteúdo principal dele.');
      return;
    }

    if (!activeCard) {
      if (getCards().length >= 10) {
        alert('O limite máximo é de 10 botões.');
        return;
      }
      activeCard = createHiddenCard(data);
    }

    setCardData(activeCard, data);
    reindexLinks();
    renderPreview();
    closeModal();
  }

  function deleteModalCard() {
    if (!activeCard) return closeModal();
    activeCard.remove();
    reindexLinks();
    renderPreview();
    closeModal();
  }

  function applyPreset(preset) {
    const config = presetColors[preset];
    if (!config) return;
    const map = {
      primary_color: config.primary,
      secondary_color: config.secondary,
      background_color: config.bg1,
      background_color_2: config.bg2
    };
    Object.entries(map).forEach(([name, value]) => {
      const colorInput = qs(name);
      const textInput = qs(`${name}_text`);
      if (colorInput) colorInput.value = value;
      if (textInput) textInput.value = value;
    });
    renderPreview();
  }

  function syncColorInputs() {
    form.querySelectorAll('[data-color-sync]').forEach((textInput) => {
      const colorInput = qs(textInput.dataset.colorSync);
      if (!colorInput || colorInput.dataset.bound) return;
      colorInput.dataset.bound = '1';
      colorInput.addEventListener('input', () => {
        textInput.value = colorInput.value;
        renderPreview();
      });
      textInput.addEventListener('input', () => {
        if (/^#[0-9a-f]{6}$/i.test(textInput.value)) colorInput.value = textInput.value;
        renderPreview();
      });
    });
  }

  function bindSlugAutomation() {
    const titleInput = qs('title');
    const slugInput = qs('slug');
    if (!titleInput || !slugInput) return;
    slugInput.addEventListener('input', () => { slugTouched = true; });
    titleInput.addEventListener('input', () => {
      if (!slugTouched) {
        slugInput.value = titleInput.value
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .toLowerCase()
          .trim()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-+|-+$/g, '')
          .slice(0, 80);
      }
      renderPreview();
    });
  }

  function wireImageInput(input, setter) {
    input.addEventListener('change', () => {
      const file = input.files && input.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        setter(String(reader.result));
        renderPreview();
      };
      reader.readAsDataURL(file);
    });
  }

  form.addEventListener('input', (event) => {
    if (fieldNames.includes(event.target.name) || event.target.matches('[data-color-sync]')) renderPreview();
  });
  form.addEventListener('change', (event) => {
    if (fieldNames.includes(event.target.name) || event.target.matches('input[type="color"]')) renderPreview();
  });

  previewScreen.addEventListener('click', (event) => {
    const addButton = event.target.closest('[data-add-link]');
    if (addButton) {
      openModal(null);
      return;
    }

    const editLink = event.target.closest('[data-edit-link-index]');
    if (editLink) {
      const card = getCards()[Number(editLink.dataset.editLinkIndex)];
      openModal(card);
      return;
    }

    const editButton = event.target.closest('[data-edit-section]');
    const editArea = event.target.closest('[data-edit-section-area]');
    const section = editButton?.dataset.editSection || editArea?.dataset.editSectionArea;
    if (!section) return;
    if (section === 'avatar') {
      avatarInput.click();
      return;
    }
    openInlineEditor(section);
  });

  inlineEditorInput.addEventListener('input', () => {
    if (!inlineField) return;
    const target = qs(inlineField);
    if (target) target.value = inlineEditorInput.value;
    renderPreview();
  });
  closeInlineEditor.addEventListener('click', closeInline);

  modalKind.addEventListener('change', syncKindUI);
  googleBusinessSearchBtn.addEventListener('click', searchGoogleBusiness);
  googleBusinessResults.addEventListener('click', (event) => {
    const item = event.target.closest('[data-place-id]');
    if (!item) return;
    googleBusinessResults.querySelectorAll('.google-result-item').forEach((node) => node.classList.remove('selected'));
    item.classList.add('selected');
    modalValue.value = item.dataset.placeName || modalValue.value;
    modalValue.dataset.placeId = item.dataset.placeId || '';
  });
  saveLinkBtn.addEventListener('click', saveModal);
  cancelLinkBtn.addEventListener('click', closeModal);
  closeLinkModal.addEventListener('click', closeModal);
  deleteLinkBtn.addEventListener('click', deleteModalCard);
  modal.addEventListener('click', (event) => { if (event.target === modal) closeModal(); });

  document.querySelectorAll('[data-preset]').forEach((button) => {
    button.addEventListener('click', () => applyPreset(button.dataset.preset));
  });

  if (logoSelectButton) logoSelectButton.addEventListener('click', () => logoInput.click());
  wireImageInput(avatarInput, (url) => { avatarPreviewUrl = url; });
  wireImageInput(logoInput, (url) => { logoPreviewUrl = url; });
  syncColorInputs();
  bindSlugAutomation();
  reindexLinks();
  renderPreview();
})();
