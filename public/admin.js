document.querySelectorAll('[data-color-sync]').forEach(input => {
  const colorInput = document.querySelector(`input[type="color"][name="${input.dataset.colorSync}"]`);
  if (!colorInput) return;
  colorInput.addEventListener('input', () => { input.value = colorInput.value; });
  input.addEventListener('input', () => {
    if (/^#[0-9a-f]{6}$/i.test(input.value)) colorInput.value = input.value;
  });
});

const slugInput = document.querySelector('input[name="slug"]');
const titleInput = document.querySelector('input[name="title"]');
if (slugInput && titleInput && !slugInput.value) {
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
  });
  slugInput.addEventListener('input', () => { slugInput.dataset.touched = '1'; });
}

(function () {
  const modal = document.getElementById('admin-link-modal-backdrop');
  const addBtn = document.getElementById('admin-add-link-btn');
  const addForm = document.getElementById('admin-add-link-form');
  if (!modal || !addBtn || !addForm) return;

  const label = document.getElementById('admin-modal-link-label');
  const url = document.getElementById('admin-modal-link-url');
  const icon = document.getElementById('admin-modal-link-icon');
  const description = document.getElementById('admin-modal-link-description');
  const order = document.getElementById('admin-modal-link-order');
  const highlight = document.getElementById('admin-modal-link-highlight');
  const active = document.getElementById('admin-modal-link-active');
  const save = document.getElementById('admin-save-link-btn');
  const cancel = document.getElementById('admin-cancel-link-btn');
  const close = document.getElementById('admin-close-link-modal');
  const del = document.getElementById('admin-delete-link-btn');

  let currentForm = null;

  function getField(form, field) {
    return form.querySelector(`[data-field="${field}"]`) || form.querySelector(`[name="${field}"]`);
  }

  function openForForm(form, isNew) {
    currentForm = form;
    label.value = getField(form, 'label')?.value || '';
    url.value = getField(form, 'url')?.value || '';
    icon.value = getField(form, 'icon')?.value || 'link';
    description.value = getField(form, 'description')?.value || '';
    order.value = getField(form, 'sort_order')?.value || '';
    highlight.checked = (getField(form, 'highlight')?.value || getField(form, 'is_highlight')?.value) === 'on';
    active.checked = isNew ? true : ((getField(form, 'active')?.value || getField(form, 'is_active')?.value) === 'on');
    del.style.display = isNew ? 'none' : '';
    modal.hidden = false;
    document.body.style.overflow = 'hidden';
    setTimeout(() => label.focus(), 20);
  }

  function closeModal() {
    modal.hidden = true;
    document.body.style.overflow = '';
    currentForm = null;
  }

  function setValue(name, value) {
    const input = getField(currentForm, name) || currentForm.querySelector(`[name="${name}"]`);
    if (input) input.value = value;
  }

  function saveAndSubmit() {
    if (!currentForm) return;
    setValue('label', label.value.trim());
    setValue('url', url.value.trim());
    setValue('icon', icon.value);
    setValue('description', description.value.trim());
    setValue('sort_order', order.value || '0');
    setValue('highlight', highlight.checked ? 'on' : '');
    setValue('is_highlight', highlight.checked ? 'on' : '');
    setValue('active', active.checked ? 'on' : '');
    setValue('is_active', active.checked ? 'on' : '');
    currentForm.submit();
  }

  document.querySelectorAll('[data-admin-link-form]').forEach(form => {
    const btn = form.querySelector('[data-admin-edit-link]');
    if (!btn) return;
    btn.addEventListener('click', () => openForForm(form, false));
  });

  addBtn.addEventListener('click', () => openForForm(addForm, true));
  save.addEventListener('click', saveAndSubmit);
  cancel.addEventListener('click', closeModal);
  close.addEventListener('click', closeModal);
  modal.addEventListener('click', event => { if (event.target === modal) closeModal(); });
  document.addEventListener('keydown', event => { if (event.key === 'Escape' && !modal.hidden) closeModal(); });
  del.addEventListener('click', () => {
    if (!currentForm) return;
    const deleteBtn = currentForm.querySelector('[data-admin-delete-link]');
    if (deleteBtn) deleteBtn.click();
  });
})();
