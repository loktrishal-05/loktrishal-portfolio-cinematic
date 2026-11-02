const OPENING = '/media/hero-poster.webp';
const ENDING = '/media/hero-end.webp';
const SESSION_KEY = 'loktrishal-arrival-seen';

export function shouldAutoplay({ reducedMotion = false, saveData = false, seen = false, mobile = false } = {}) {
  return !reducedMotion && !saveData && !seen && !mobile;
}

export function createFilmController({ video, picture, container, toggle, skip, replay, status, progress, labels, onSeen = () => {}, timeoutMs = 12000 }) {
  let state = 'poster';
  let loadTimer;
  let destroyed = false;
  let request = 0;
  const events = [];
  const listen = (target, event, handler) => {
    target.addEventListener(event, handler);
    events.push(() => target.removeEventListener(event, handler));
  };
  function setState(next) {
    state = next;
    container.dataset.state = next;
    const running = next === 'playing' || next === 'loading';
    toggle.hidden = next === 'ended';
    skip.hidden = !running && next !== 'paused';
    replay.hidden = next !== 'ended';
    progress.hidden = !running && next !== 'paused';
    toggle.querySelector('span').textContent = running ? labels.pause : labels.play;
    toggle.setAttribute('aria-label', running ? labels.pause : labels.play);
    toggle.dataset.icon = running ? 'pause' : 'play';
    const path = toggle.querySelector('path');
    if (path) path.setAttribute('d', running ? 'M9 5v14M16 5v14' : 'm9 5 11 7-11 7Z');
  }
  function stopTimer() {
    clearTimeout(loadTimer);
  }
  function fallback(message = '') {
    request += 1;
    stopTimer();
    video.pause();
    picture.src = ENDING;
    setState('poster');
    status.textContent = message;
  }
  function finish() {
    request += 1;
    stopTimer();
    video.pause();
    picture.src = ENDING;
    progress.value = 1;
    onSeen();
    setState('ended');
    status.textContent = labels.filmFinished;
  }
  async function play() {
    if (destroyed || state === 'playing' || state === 'loading') return;
    const attempt = ++request;
    const resume = state === 'paused';
    status.textContent = '';
    picture.src = OPENING;
    if (!video.getAttribute('src')) {
      video.src = video.canPlayType('video/webm; codecs="vp9"') ? '/media/hero-entry.webm' : '/media/hero-entry.mp4';
      video.load();
    }
    if (!resume) video.currentTime = 0;
    setState('loading');
    loadTimer = setTimeout(() => {
      if (state === 'loading') {
        video.removeAttribute('src');
        video.load();
        fallback(labels.filmUnavailable);
      }
    }, timeoutMs);
    try {
      await video.play();
      if (destroyed || request !== attempt) return;
      stopTimer();
      setState('playing');
      onSeen();
    } catch {
      if (request === attempt && !destroyed) fallback(labels.filmUnavailable);
    }
  }
  function pause() {
    request += 1;
    stopTimer();
    video.pause();
    if (state === 'loading') {
      picture.src = ENDING;
      setState('poster');
    } else if (state === 'playing') {
      setState('paused');
    }
  }
  listen(toggle, 'click', () => state === 'playing' || state === 'loading' ? pause() : play());
  listen(skip, 'click', finish);
  listen(replay, 'click', play);
  listen(video, 'ended', finish);
  listen(video, 'error', () => fallback(labels.filmUnavailable));
  listen(video, 'timeupdate', () => { progress.value = video.duration ? video.currentTime / video.duration : 0; });
  setState('poster');
  return {
    play,
    pause,
    finish,
    fallback,
    getState: () => state,
    destroy() {
      destroyed = true;
      request += 1;
      stopTimer();
      video.pause();
      events.forEach(remove => remove());
    },
  };
}

function element(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text != null) node.textContent = text;
  return node;
}

function arrow() {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', '0 0 24 24');
  svg.setAttribute('aria-hidden', 'true');
  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  path.setAttribute('d', 'M5 19 19 5M5 5h14v14');
  svg.append(path);
  return svg;
}

function externalLink(url, label) {
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== 'https:' || parsed.username || parsed.password) return null;
    const link = element('a', 'inline-link', label);
    link.href = parsed.href;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.append(arrow());
    return link;
  } catch {
    return null;
  }
}

function applyCopy(copy) {
  document.querySelectorAll('[data-copy]').forEach(node => {
    const value = node.dataset.copy.split('.').reduce((data, key) => data?.[key], copy);
    if (typeof value === 'string') node.textContent = value;
  });
  document.title = copy.meta.title;
  document.querySelector('meta[name="description"]').content = copy.meta.description;
  const heading = document.getElementById('hero-title');
  heading.replaceChildren(...copy.hero.titleLines.map(line => element('span', '', line)));
  document.getElementById('hero-poster').alt = copy.hero.avatarAlt;
  document.querySelector('.portrait img').alt = copy.labels.portraitCaption;
  document.getElementById('hero-video').setAttribute('aria-label', copy.hero.videoLabel);
  document.getElementById('film-progress').setAttribute('aria-label', copy.labels.videoProgress);
  const email = document.getElementById('contact-email');
  email.href = `mailto:${copy.profile.email}`;
  document.getElementById('github-link').href = copy.profile.github;
  document.getElementById('linkedin-link').href = copy.profile.linkedin;
}

function setupNavigation(copy) {
  const menu = document.getElementById('mobile-nav');
  const toggle = document.getElementById('menu-toggle');
  const desktop = document.querySelector('[data-nav]');
  const makeLink = item => {
    const link = element('a', '', item.label);
    link.href = item.href;
    return link;
  };
  menu.replaceChildren(...copy.navigation.map(makeLink));
  desktop.replaceChildren(...copy.navigation.filter(item => item.href !== '#contact').map(makeLink));
  function close() {
    menu.hidden = true;
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', copy.labels.menu);
    document.body.classList.remove('menu-open');
  }
  toggle.addEventListener('click', () => {
    if (!menu.hidden) return close();
    menu.hidden = false;
    toggle.setAttribute('aria-expanded', 'true');
    toggle.setAttribute('aria-label', copy.labels.closeMenu);
    document.body.classList.add('menu-open');
    menu.querySelector('a')?.focus();
  });
  menu.addEventListener('click', event => { if (event.target.closest('a')) close(); });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && !menu.hidden) {
      close();
      toggle.focus();
    }
  });
  window.matchMedia('(min-width: 801px)').addEventListener('change', close);
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      desktop.querySelectorAll('a').forEach(link => {
        if (link.hash === `#${entry.target.id}`) link.setAttribute('aria-current', 'location');
        else link.removeAttribute('aria-current');
      });
    });
  }, { rootMargin: '-20% 0px -55% 0px' });
  copy.navigation.forEach(item => { const node = document.querySelector(item.href); if (node) observer.observe(node); });
  return () => observer.disconnect();
}

function renderProjects(copy) {
  const list = document.getElementById('project-list');
  const filterBox = document.getElementById('project-filters');
  const more = document.getElementById('show-projects');
  const groups = [...new Set(copy.projects.map(project => project.filterGroup))];
  let category = '';
  let expanded = false;
  filterBox.setAttribute('aria-label', copy.labels.filterLabel);
  function draw() {
    const filtered = category ? copy.projects.filter(project => project.filterGroup === category) : copy.projects;
    const visible = category || expanded ? filtered : filtered.filter(project => project.featured);
    const nodes = visible.map(project => {
      const article = element('article', `project${project.image ? '' : ' project--compact'}`);
      article.dataset.project = project.id;
      if (project.image) {
        const figure = element('figure', 'project-media');
        const imageBox = element('div', 'project-image');
        const img = element('img');
        img.src = project.image;
        img.alt = project.imageAlt;
        img.width = project.imageWidth || 1440;
        img.height = project.imageHeight || 900;
        img.loading = 'lazy';
        img.decoding = 'async';
        img.addEventListener('error', () => {
          imageBox.replaceChildren(element('p', 'empty-state', copy.labels.projectImageFallback));
          imageBox.classList.add('project-image--unavailable');
        }, { once: true });
        imageBox.append(img);
        figure.append(imageBox, element('figcaption', '', project.imageCaption));
        article.append(figure);
      }
      const content = element('div', 'project-copy');
      const meta = element('div', 'project-meta');
      meta.append(element('span', '', project.category), element('span', '', project.year));
      const title = element('h3', '', project.shortTitle || project.title);
      const description = element('p', 'project-description', project.description);
      const status = element('span', 'project-status', project.status);
      const tech = element('ul', 'project-tech');
      tech.setAttribute('aria-label', copy.labels.technology);
      tech.append(...project.tech.map(item => element('li', '', item)));
      const links = element('div', 'project-links');
      if (project.source) { const link = externalLink(project.source, copy.labels.viewSource); if (link) links.append(link); }
      if (project.demo) { const link = externalLink(project.demo, copy.labels.viewDemo); if (link) links.append(link); }
      content.append(meta, title, description, status, tech, links);
      article.append(content);
      return article;
    });
    list.replaceChildren(...nodes);
    if (!nodes.length) list.append(element('p', 'empty-state', copy.labels.projectsEmpty));
    list.setAttribute('aria-busy', 'false');
    more.hidden = !!category || copy.projects.every(project => project.featured);
    more.querySelector('span').textContent = expanded ? copy.labels.showLess : copy.labels.showMore;
    more.setAttribute('aria-expanded', String(expanded));
    filterBox.querySelectorAll('button').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.filter === category)));
  }
  ['', ...groups].forEach(group => {
    const button = element('button', 'filter', group || copy.labels.allFilter);
    button.type = 'button';
    button.dataset.filter = group;
    button.addEventListener('click', () => { category = group; draw(); });
    filterBox.append(button);
  });
  more.addEventListener('click', () => {
    expanded = !expanded;
    draw();
    if (!expanded) document.getElementById('work').scrollIntoView({ behavior: 'instant' });
  });
  draw();
}

function renderAbout(copy) {
  document.getElementById('about-paragraphs').replaceChildren(...copy.about.paragraphs.map(text => element('p', '', text)));
  const education = copy.profile.education;
  document.getElementById('education').replaceChildren(element('strong', '', education.degree), element('span', '', education.institution), element('span', '', education.graduation));
  document.getElementById('skill-list').replaceChildren(...copy.skills.map(skill => {
    const article = element('article', 'skill');
    const list = element('ul');
    list.append(...skill.items.map(item => element('li', '', item)));
    article.append(element('h3', '', skill.name), element('p', '', skill.description), list);
    return article;
  }));
}

function renderCredentials(copy) {
  const list = document.getElementById('credential-list');
  const formatter = new Intl.DateTimeFormat('en', { month: 'short', year: 'numeric', day: 'numeric', timeZone: 'UTC' });
  const nodes = copy.credentials.map(item => {
    const row = element('article', 'credential');
    const title = element('div');
    title.append(element('span', 'credential-type', item.type), element('h3', '', item.title));
    row.append(title, element('p', '', item.issuer));
    if (item.date && /^\d{4}-\d{2}-\d{2}$/.test(item.date)) {
      const date = new Date(`${item.date}T00:00:00Z`);
      if (!Number.isNaN(date.valueOf())) {
        const time = element('time', '', formatter.format(date));
        time.dateTime = item.date;
        row.append(time);
      }
    }
    return row;
  });
  list.replaceChildren(...nodes);
  if (!nodes.length) list.append(element('p', 'empty-state', copy.labels.credentialsEmpty));
}

function setupMotion(reducedMotion) {
  if (reducedMotion.matches || !window.gsap) return () => {};
  const context = window.gsap.context(() => {
    const timeline = window.gsap.timeline({ defaults: { ease: 'power3.out' } });
    timeline.from('#hero-title span', { y: 22, opacity: .55, duration: .9, stagger: .1, clearProps: 'all' })
      .from('.hero-description,.hero-actions,.hero-person', { y: 12, opacity: .5, duration: .6, stagger: .08, clearProps: 'all' }, '-=.5');
  }, document.body);
  return () => context.revert();
}

async function boot() {
  const error = document.getElementById('content-error');
  const abort = new AbortController();
  const timer = setTimeout(() => abort.abort(), 12000);
  try {
    const response = await fetch('/data/copy.en.json', { signal: abort.signal });
    if (!response.ok) throw new Error('Content unavailable');
    const copy = await response.json();
    if (!copy.profile || !Array.isArray(copy.projects) || !Array.isArray(copy.credentials)) throw new Error('Invalid content');
    applyCopy(copy);
    const cleanNavigation = setupNavigation(copy);
    renderProjects(copy);
    renderAbout(copy);
    renderCredentials(copy);
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const cleanMotion = setupMotion(reducedMotion);
    const film = createFilmController({
      video: document.getElementById('hero-video'),
      picture: document.getElementById('hero-poster'),
      container: document.getElementById('hero-media'),
      toggle: document.getElementById('film-toggle'),
      skip: document.getElementById('film-skip'),
      replay: document.getElementById('film-replay'),
      status: document.getElementById('film-status'),
      progress: document.getElementById('film-progress'),
      labels: copy.labels,
      onSeen() { try { sessionStorage.setItem(SESSION_KEY, '1'); } catch { /* Storage may be disabled. */ } },
    });
    let seen = false;
    try { seen = sessionStorage.getItem(SESSION_KEY) === '1'; } catch { /* The poster still works without storage. */ }
    if (shouldAutoplay({ reducedMotion: reducedMotion.matches, saveData: navigator.connection?.saveData, seen, mobile: window.matchMedia('(max-width: 800px)').matches })) film.play();
    const stopMotion = event => { if (event.matches) { film.finish(); cleanMotion(); } };
    reducedMotion.addEventListener('change', stopMotion);
    const pauseHidden = () => { if (document.hidden) film.pause(); };
    document.addEventListener('visibilitychange', pauseHidden);
    window.addEventListener('pagehide', () => {
      film.destroy();
      cleanMotion();
      cleanNavigation();
      reducedMotion.removeEventListener('change', stopMotion);
      document.removeEventListener('visibilitychange', pauseHidden);
    }, { once: true });
  } catch {
    error.hidden = false;
    document.getElementById('project-list').setAttribute('aria-busy', 'false');
    document.getElementById('film-toggle').hidden = true;
  } finally {
    clearTimeout(timer);
  }
}

if (typeof document !== 'undefined') {
  document.getElementById('content-retry').addEventListener('click', () => window.location.reload());
  boot();
}
