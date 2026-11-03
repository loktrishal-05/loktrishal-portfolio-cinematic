// Simple 3D dashboard: four totals and two column charts, all derived from data/copy.en.json.
const count = (items, key) => items.reduce((map, item) => map.set(key(item), (map.get(key(item)) || 0) + 1), new Map());

export function renderDashboard(copy, element, root) {
  const skillTotal = new Set(copy.skills.flatMap(s => s.items)).size;
  const kpis = element('div', 'dash-kpis');
  for (const [label, value] of [[copy.labels.dashProjects, copy.projects.length], [copy.labels.dashCredentials, copy.credentials.length], [copy.labels.dashAwards, copy.credentials.filter(c => c.category === 'Award').length], [copy.labels.dashSkills, skillTotal]]) {
    const tile = element('div', 'dash-kpi glass-card'); tile.append(element('strong', '', String(value)), element('span', '', label)); kpis.append(tile);
  }
  function columns(title, rows) {
    const card = element('section', 'dash-card glass-card'); card.append(element('h3', '', title));
    const peak = Math.max(...rows.map(r => r[1]), 1), list = element('ul', 'dash-3d');
    rows.forEach(([label, value], i) => {
      const item = element('li'), column = element('span', 'dash-col'); column.style.setProperty('--h', `${Math.max((value / peak) * 100, 8)}%`); column.style.setProperty('--i', i);
      column.append(element('span', 'dash-face dash-top'), element('span', 'dash-face dash-side'), element('span', 'dash-face dash-front'));
      item.append(element('strong', 'dash-value', String(value)), column, element('span', 'dash-label', label)); list.append(item);
    });
    card.append(list); return card;
  }
  // Extruded donut: 12 stacked, darkening SVG rings squashed by CSS; only the top ring takes pointer events.
  function donut(title, counts) {
    const card = element('section', 'dash-card glass-card'), total = [...counts.values()].reduce((a, b) => a + b, 0);
    const stage = element('div', 'dash-donut'), center = element('div', 'dash-donut-center'), legend = element('ul', 'dash-legend');
    const strong = element('strong', '', String(total)), small = element('span', '', title); center.append(strong, small);
    const setActive = i => { stage.dataset.active = i; const row = i === '' ? null : [...counts][Number(i)]; strong.textContent = row ? String(row[1]) : String(total); small.textContent = row ? row[0] : title; };
    const ring = element('div', 'dash-rings');
    for (let layer = 0; layer < 12; layer++) {
      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg'); svg.setAttribute('viewBox', '0 0 100 100'); svg.setAttribute('aria-hidden', 'true');
      svg.style.setProperty('--y', `${(11 - layer) * 1.5}px`); svg.style.setProperty('--b', layer === 11 ? 1 : 0.5 + layer * 0.03);
      if (layer === 11) svg.classList.add('dash-ring-top');
      let start = 0;
      [...counts].forEach(([, value], i) => {
        const pct = (value / total) * 100, c = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        for (const [k, v] of Object.entries({ cx: 50, cy: 50, r: 36, pathLength: 100, 'stroke-dasharray': `${Math.max(pct - 0.8, 0.1)} ${100 - pct + 0.8}`, 'stroke-dashoffset': -start })) c.setAttribute(k, v);
        c.setAttribute('class', `seg seg-${i}`); start += pct;
        if (layer === 11) { c.addEventListener('pointerenter', () => setActive(String(i))); c.addEventListener('pointerleave', () => setActive('')); }
        svg.append(c);
      });
      ring.append(svg);
    }
    stage.append(ring, center);
    [...counts].forEach(([label, value], i) => {
      const li = element('li'), dot = element('span', `dash-dot seg-${i}`); li.append(dot, element('span', '', label), element('strong', '', String(value)));
      li.addEventListener('pointerenter', () => setActive(String(i))); li.addEventListener('pointerleave', () => setActive('')); legend.append(li);
    });
    stage.addEventListener('pointermove', e => { const r = stage.getBoundingClientRect(); stage.style.setProperty('--ry', `${((e.clientX - r.left) / r.width - 0.5) * 24}deg`); });
    stage.addEventListener('pointerleave', () => stage.style.setProperty('--ry', '0deg'));
    setActive(''); card.append(element('h3', '', title), stage, legend); return card;
  }
  const grid = element('div', 'dash-grid');
  grid.append(columns(copy.labels.dashBySkill, copy.skills.map(s => [s.name, s.items.length])), donut(copy.labels.dashByType, count(copy.credentials, c => c.category)));
  root.replaceChildren(kpis, grid);
}
