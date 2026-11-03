// Simple 3D dashboard: four totals and two column charts, all derived from data/copy.en.json.
const count = (items, key) => items.reduce((map, item) => map.set(key(item), (map.get(key(item)) || 0) + 1), new Map());

export function renderDashboard(copy, element, root) {
  const skillTotal = new Set(copy.skills.flatMap(s => s.items)).size;
  const kpis = element('div', 'dash-kpis');
  for (const [label, value] of [[copy.labels.dashProjects, copy.projects.length], [copy.labels.dashCredentials, copy.credentials.length], [copy.labels.dashAwards, copy.credentials.filter(c => c.category === 'Award').length], [copy.labels.dashSkills, skillTotal]]) {
    const tile = element('div', 'dash-kpi glass-card'); tile.append(element('strong', '', String(value)), element('span', '', label)); kpis.append(tile);
  }
  function columns(title, counts) {
    const card = element('section', 'dash-card glass-card'); card.append(element('h3', '', title));
    const peak = Math.max(...counts.values(), 1), list = element('ul', 'dash-3d');
    for (const [label, value] of counts) {
      const item = element('li'), column = element('span', 'dash-col'); column.style.setProperty('--h', `${Math.max((value / peak) * 100, 8)}%`);
      column.append(element('span', 'dash-face dash-top'), element('span', 'dash-face dash-side'), element('span', 'dash-face dash-front'));
      item.append(element('strong', 'dash-value', String(value)), column, element('span', 'dash-label', label)); list.append(item);
    }
    card.append(list); return card;
  }
  const grid = element('div', 'dash-grid');
  grid.append(columns(copy.labels.dashByDomain, count(copy.projects, p => p.filterGroup)), columns(copy.labels.dashByType, count(copy.credentials, c => c.category)));
  root.replaceChildren(kpis, grid);
}
