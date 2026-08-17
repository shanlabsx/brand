const paletteRoot = document.querySelector('[data-palette]');
const toast = document.querySelector('[data-toast]');

const COPY_ICON = '<svg viewBox="0 0 16 16" width="12" height="12" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><rect x="6" y="6" width="7" height="7" rx="1.5"/><path d="M4 10H3.5A1.5 1.5 0 0 1 2 8.5v-5A1.5 1.5 0 0 1 3.5 2h5A1.5 1.5 0 0 1 10 3.5V4"/></svg>';
const CHECK_ICON = '<svg viewBox="0 0 16 16" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="m3 8.5 3.5 3.5L13 5"/></svg>';

const INK = '#0B1020';

function luminance(hex) {
  const channels = hex.match(/[0-9A-F]{2}/g).map((value) => Number.parseInt(value, 16) / 255);
  const linear = channels.map((value) => value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4);
  return 0.2126 * linear[0] + 0.7152 * linear[1] + 0.0722 * linear[2];
}

function contrast(foreground, background) {
  const values = [luminance(foreground), luminance(background)].sort((a, b) => b - a);
  return (values[0] + 0.05) / (values[1] + 0.05);
}

function onColor(hex) {
  return contrast(hex, '#FFFFFF') > contrast(hex, INK) ? '#FFFFFF' : INK;
}

async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const field = document.createElement('textarea');
    field.value = text;
    field.setAttribute('readonly', '');
    field.style.position = 'fixed';
    field.style.opacity = '0';
    document.body.appendChild(field);
    field.select();
    let copied = false;
    try { copied = document.execCommand('copy'); } catch { /* report below */ }
    field.remove();
    return copied;
  }
}

let toastTimer;

function showToast(value, prefix = 'Copied') {
  toast.textContent = prefix ? `${prefix} ` : '';
  const code = document.createElement('code');
  code.textContent = value;
  toast.appendChild(code);
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 1600);
}

const copiedTimers = new WeakMap();

async function onSwatchClick(button, color, event) {
  const value = event.shiftKey ? color.cssVar : color.hex;
  if (!(await copyText(value))) {
    showToast('copy failed — select the text manually', '');
    return;
  }
  button.classList.add('copied');
  clearTimeout(copiedTimers.get(button));
  copiedTimers.set(button, setTimeout(() => button.classList.remove('copied'), 1200));
  showToast(value);
}

function renderSwatch(color) {
  const item = document.createElement('li');
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'swatch';
  if (color.description) button.title = color.description;
  button.style.setProperty('--c', color.hex);
  button.style.setProperty('--on', onColor(color.hex));
  button.innerHTML = `
    <span class="swatch-chip">
      <span class="swatch-hex">${color.hex}</span>
      <span class="swatch-badge">
        <span class="badge-copy">${COPY_ICON}Copy</span>
        <span class="badge-copied">${CHECK_ICON}Copied</span>
      </span>
    </span>
    <span class="swatch-meta">
      <span class="swatch-name">${color.name}</span>
      <span class="swatch-var">${color.cssVar}</span>
      ${color.reference ? `<span class="swatch-ref">→ ${color.reference}</span>` : ''}
    </span>`;
  button.addEventListener('click', (event) => onSwatchClick(button, color, event));
  item.appendChild(button);
  return item;
}

function renderSection(section) {
  const wrap = document.createElement('section');
  wrap.className = 'section';
  const head = document.createElement('header');
  head.className = 'section-head';
  const title = document.createElement('h2');
  title.textContent = section.title;
  const caption = document.createElement('p');
  caption.textContent = section.caption;
  head.append(title, caption);
  const list = document.createElement('ul');
  list.className = `swatches${section.featured ? ' swatches--featured' : ''}`;
  for (const color of section.colors) list.appendChild(renderSwatch(color));
  wrap.append(head, list);
  return wrap;
}

async function init() {
  const response = await fetch('palette.json');
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const palette = await response.json();
  for (const node of document.querySelectorAll('[data-version]')) node.textContent = palette.brand.version;
  const fragment = document.createDocumentFragment();
  for (const section of palette.sections) fragment.appendChild(renderSection(section));
  paletteRoot.appendChild(fragment);
}

init().catch(() => {
  paletteRoot.innerHTML = '<p class="palette-error">Could not load <code>palette.json</code>. Run <code>pnpm build:docs</code> and reload.</p>';
});
