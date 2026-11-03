// Power BI-style dashboard: two slicers (project domain, credential type) cross-filter every visual.
// All figures derive from data/copy.en.json; model results carry their README source.
const count = (items, key) => items.reduce((map, item) => map.set(key(item), (map.get(key(item)) || 0) + 1), new Map());

export function renderDashboard(copy, element, root) {
  const state = { domain: '', credential: '' };
  const month = new Intl.DateTimeFormat('en', { month: 'short', year: '2-digit', timeZone: 'UTC' });
  const domains = [...new Set(copy.projects.map(p => p.filterGroup))];
  const types = [...new Set(copy.credentials.map(c => c.category))];

  function slicer(title, options, key, all) {
    const box = element('div', 'dash-slicer'); box.setAttribute('role', 'group'); box.setAttribute('aria-label', title);
    for (const option of ['', ...options]) {
      const button = element('button', 'filter', option || all); button.type = 'button';
      button.setAttribute('aria-pressed', String(state[key] === option));
      button.addEventListener('click', () => { state[key] = option; draw(); });
      box.append(button);
    }
    return box;
  }
  function bars(title, rows, { active, onPick, max = Math.max(...rows.map(r => r[1]), 1), format = String } = {}) {
    const card = element('section', 'dash-card glass-card'); card.append(element('h3', '', title));
    const list = element('ul', 'dash-bars');
    for (const [label, value, key] of rows) {
      const item = element('li'), row = element(onPick ? 'button' : 'div', 'dash-bar');
      if (onPick) { row.type = 'button'; row.setAttribute('aria-pressed', String(active === key)); row.addEventListener('click', () => onPick(active === key ? '' : key)); }
      const track = element('span', 'dash-track'), fill = element('span', 'dash-fill'); fill.style.width = `${(value / max) * 100}%`; track.append(fill);
      row.append(element('span', 'dash-label', label), track, element('span', 'dash-value', format(value))); item.append(row); list.append(item);
    }
    card.append(list); return card;
  }
  function draw() {
    const projects = copy.projects.filter(p => !state.domain || p.filterGroup === state.domain);
    const credentials = copy.credentials.filter(c => !state.credential || c.category === state.credential);
    const skillTotal = copy.skills.reduce((n, s) => n + s.items.length, 0);
    const kpis = element('div', 'dash-kpis');
    for (const [label, value] of [[copy.labels.dashProjects, projects.length], [copy.labels.dashCredentials, credentials.length], [copy.labels.dashAwards, credentials.filter(c => c.category === 'Award').length], [copy.labels.dashSkills, skillTotal]]) {
      const tile = element('div', 'dash-kpi glass-card'); tile.append(element('strong', '', String(value)), element('span', '', label)); kpis.append(tile);
    }
    const domainCounts = count(copy.projects, p => p.filterGroup);
    const typeCounts = count(copy.credentials, c => c.category);
    const dated = credentials.filter(c => c.date).sort((a, b) => a.date.localeCompare(b.date));
    const months = count(dated, c => c.date.slice(0, 7));
    const peak = Math.max(...months.values(), 1);
    const columns = element('section', 'dash-card glass-card dash-wide'); columns.append(element('h3', '', copy.labels.dashTimeline));
    const strip = element('ul', 'dash-columns');
    for (const [key, value] of months) {
      const item = element('li'), bar = element('span', 'dash-column'); bar.style.height = `${(value / peak) * 100}%`;
      item.append(element('span', 'dash-value', String(value)), bar, element('span', 'dash-label', month.format(new Date(`${key}-01T00:00:00Z`)))); strip.append(item);
    }
    columns.append(strip, element('p', 'dash-note', copy.labels.dashUndated));
    const table = element('section', 'dash-card glass-card dash-wide'); table.append(element('h3', '', copy.labels.dashProjectList));
    const rows = element('ul', 'dash-projects');
    for (const p of projects) { const li = element('li'); li.append(element('strong', '', p.shortTitle || p.title), element('span', '', `${p.category} · ${p.status}`)); rows.append(li); }
    table.append(rows);
    const results = element('section', 'dash-card glass-card dash-wide'); results.append(element('h3', '', copy.labels.dashResults));
    const groups = element('div', 'dash-results');
    for (const group of copy.dashboard.results) {
      const chart = bars(group.title, group.rows.map(([label, value]) => [label, value, label]), { max: group.max, format: v => group.unit === '%' ? `${v}%` : v.toFixed(3) });
      chart.classList.remove('glass-card'); chart.append(element('p', 'dash-note', group.source)); groups.append(chart);
    }
    results.append(groups);
    const grid = element('div', 'dash-grid');
    grid.append(
      bars(copy.labels.dashByDomain, domains.map(d => [d, domainCounts.get(d), d]), { active: state.domain, onPick: v => { state.domain = v; draw(); } }),
      bars(copy.labels.dashByType, types.map(t => [t, typeCounts.get(t), t]), { active: state.credential, onPick: v => { state.credential = v; draw(); } }),
      bars(copy.labels.dashBySkill, copy.skills.map(s => [s.name, s.items.length, s.name])),
      columns, table, results);
    root.replaceChildren(slicer(copy.labels.dashDomain, domains, 'domain', copy.labels.allFilter), slicer(copy.labels.dashType, types, 'credential', copy.labels.dashAllTypes), kpis, grid);
  }
  draw();
}
