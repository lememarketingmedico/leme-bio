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
