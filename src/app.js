import { drinks, categories } from './data.js';

// ── Theme ────────────────────────────────────────────────────────────────
const root = document.documentElement;
const themeBtn = document.getElementById('themeToggle');

function prefersDark() {
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

function applyTheme(dark) {
  root.setAttribute('data-theme', dark ? 'dark' : 'light');
  themeBtn.textContent = dark ? '☀️' : '🌙';
  try { localStorage.setItem('theme', dark ? 'dark' : 'light'); } catch {}
}

(function initTheme() {
  let saved;
  try { saved = localStorage.getItem('theme'); } catch {}
  applyTheme(saved ? saved === 'dark' : prefersDark());
})();

themeBtn.addEventListener('click', () => {
  applyTheme(root.getAttribute('data-theme') !== 'dark');
});

// ── Caffeine colour band ─────────────────────────────────────────────────
function caffeineClass(mg) {
  if (mg < 80)  return 'badge-green';
  if (mg < 150) return 'badge-amber';
  return 'badge-red';
}

// ── DOM helpers (no innerHTML with data — avoids any XSS surface) ────────
function el(tag, cls, text) {
  const e = document.createElement(tag);
  if (cls)  e.className = cls;
  if (text !== undefined) e.textContent = text;
  return e;
}

// ── Build a single drink row ─────────────────────────────────────────────
function buildDrinkItem(drink) {
  const item = el('div', 'drink-item');

  // Summary button
  const summary = el('button', 'drink-summary');
  summary.setAttribute('aria-expanded', 'false');
  summary.setAttribute('type', 'button');

  const name = el('span', 'drink-name', drink.name);

  const right = el('div', 'drink-right');
  const badge = el('span', `caffeine-badge ${caffeineClass(drink.caffeineMg)}`, `${drink.caffeineMg} mg`);
  const chev  = el('span', 'drink-chevron', '▼');
  right.append(badge, chev);

  summary.append(name, right);

  // Recipe panel
  const panel = el('div', 'recipe-panel');
  panel.setAttribute('role', 'region');
  const inner = el('div', 'recipe-inner');

  // Stats grid
  const grid = el('div', 'recipe-grid');
  const r = drink.recipe;

  const shotLabel = r.shots === 1 ? '1 shot' : r.shots % 1 === 0 ? `${r.shots} shots` : `${r.shots} shots`;

  const stats = [
    ['Shots',    shotLabel],
    ['Espresso', `${r.espressoMl} ml`],
    ...(r.milkMl > 0 ? [['Milk', `${r.milkMl} ml`]] : []),
    ['Cup size', `${r.cupSizeMl} ml`],
  ];

  stats.forEach(([label, value]) => {
    const stat = el('div', 'recipe-stat');
    stat.append(el('span', 'recipe-stat-label', label), el('span', 'recipe-stat-value', value));
    grid.appendChild(stat);
  });

  inner.appendChild(grid);

  if (r.milkStyle) {
    inner.appendChild(el('div', 'recipe-milk-style', r.milkStyle));
  }

  if (r.notes) {
    inner.appendChild(el('p', 'recipe-note', r.notes));
  }

  panel.appendChild(inner);
  item.append(summary, panel);

  // Toggle recipe open/close
  summary.addEventListener('click', () => {
    const open = item.classList.toggle('open');
    summary.setAttribute('aria-expanded', String(open));
  });

  return item;
}

// ── Build a category accordion card ─────────────────────────────────────
function buildCategoryCard(cat) {
  const card = el('div', 'category-card');

  // Category header button
  const header = el('button', 'category-header');
  header.setAttribute('aria-expanded', 'false');
  header.setAttribute('type', 'button');

  const labelWrap = el('div', 'category-label');
  labelWrap.append(
    el('span', 'category-name', cat.label),
    el('span', 'category-desc', cat.description),
  );
  header.append(labelWrap, el('span', 'category-chevron', '▼'));

  // Drinks list
  const list = el('div', 'drinks-list');
  list.setAttribute('role', 'list');

  const catDrinks = drinks.filter(d => d.category === cat.id);
  catDrinks.forEach(d => list.appendChild(buildDrinkItem(d)));

  card.append(header, list);

  header.addEventListener('click', () => {
    const open = card.classList.toggle('open');
    header.setAttribute('aria-expanded', String(open));
  });

  return card;
}

// ── Render ───────────────────────────────────────────────────────────────
function render() {
  const app = document.getElementById('app');
  categories.forEach(cat => app.appendChild(buildCategoryCard(cat)));
}

render();
