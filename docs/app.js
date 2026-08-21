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

// Shared by the chip (copies HEX) and the variable name (copies the CSS var)
// — each is its own explicit click target instead of one button overloaded
// with a hidden shift-click modifier.
async function copyValue(trigger, value) {
  if (!(await copyText(value))) {
    showToast('copy failed — select the text manually', '');
    return;
  }
  trigger.classList.add('copied');
  clearTimeout(copiedTimers.get(trigger));
  copiedTimers.set(trigger, setTimeout(() => trigger.classList.remove('copied'), 1200));
  showToast(value);
}

function renderSwatch(color) {
  const item = document.createElement('li');
  item.className = 'swatch';
  item.style.setProperty('--c', color.hex);
  item.style.setProperty('--on', onColor(color.hex));

  const chip = document.createElement('button');
  chip.type = 'button';
  chip.className = 'swatch-chip';
  chip.title = color.description ? `${color.description} — click to copy HEX` : 'Click to copy HEX';
  chip.innerHTML = `
    <span class="swatch-hex">${color.hex}</span>
    <span class="swatch-badge">
      <span class="badge-copy">${COPY_ICON}Copy</span>
      <span class="badge-copied">${CHECK_ICON}Copied</span>
    </span>`;
  chip.addEventListener('click', () => copyValue(chip, color.hex));

  const varButton = document.createElement('button');
  varButton.type = 'button';
  varButton.className = 'swatch-var';
  varButton.title = 'Click to copy CSS variable';
  varButton.innerHTML = `
    <span class="swatch-var-icon">
      <span class="icon-copy">${COPY_ICON}</span>
      <span class="icon-copied">${CHECK_ICON}</span>
    </span>
    <span class="swatch-var-text">${color.cssVar}</span>`;
  varButton.addEventListener('click', () => copyValue(varButton, color.cssVar));

  const meta = document.createElement('span');
  meta.className = 'swatch-meta';
  const name = document.createElement('span');
  name.className = 'swatch-name';
  name.textContent = color.name;
  meta.append(name, varButton);
  if (color.reference) {
    const ref = document.createElement('span');
    ref.className = 'swatch-ref';
    ref.textContent = `→ ${color.reference}`;
    meta.appendChild(ref);
  }
  if (color.usedAs?.length) {
    const usage = document.createElement('span');
    usage.className = 'swatch-usage';
    for (const { mode, label } of color.usedAs) {
      const pill = document.createElement('span');
      pill.className = `usage-pill usage-pill--${mode}`;
      pill.textContent = `${label} · ${mode === 'dark' ? 'Dark' : 'Light'}`;
      usage.appendChild(pill);
    }
    meta.appendChild(usage);
  }

  item.append(chip, meta);
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
  if (!paletteRoot) return;
  const fragment = document.createDocumentFragment();
  for (const section of palette.sections) fragment.appendChild(renderSection(section));
  paletteRoot.appendChild(fragment);
}

init().catch(() => {
  if (paletteRoot) {
    paletteRoot.innerHTML = '<p class="palette-error">Could not load <code>palette.json</code>. Run <code>pnpm build:docs</code> and reload.</p>';
  }
});
