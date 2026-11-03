import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import { motionPolicy } from './motion.js';

gsap.registerPlugin(ScrollTrigger);
const $ = selector => document.querySelector(selector);
function element(tag, className = '', text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text != null) node.textContent = text;
  return node;
}
function arrow() {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', '0 0 24 24'); svg.setAttribute('aria-hidden', 'true');
  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  path.setAttribute('d', 'M5 19 19 5M5 5h14v14'); svg.append(path); return svg;
}
function externalLink(url, label) {
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== 'https:' || parsed.username || parsed.password) return null;
    const a = element('a', 'inline-link', label);
    a.href = parsed.href; a.target = '_blank'; a.rel = 'noopener noreferrer'; a.append(arrow()); return a;
  } catch { return null; }
}
function links(project, copy) {
  const group = element('div', 'project-links');
  for (const [url, label] of [[project.source, copy.labels.viewSource], [project.demo, copy.labels.viewDemo]]) {
    const a = url && externalLink(url, label); if (a) group.append(a);
  }
  return group;
}
function applyCopy(copy) {
  for (const node of document.querySelectorAll('[data-copy]')) {
    const text = node.dataset.copy.split('.').reduce((value, key) => value?.[key], copy);
    if (typeof text === 'string') node.textContent = text;
  }
  document.title = copy.meta.title;
}
function renderWork(copy) {
  const list = $('#project-list');
  list.replaceChildren(...copy.projects.filter(p => p.featured).map((project, index) => {
    const article = element('article', 'project'); article.dataset.project = project.id;
    const figure = element('figure', 'project-media');
    const imageBox = element('div', 'project-image glass-card');
    const image = element('img'); image.src = project.image; image.alt = project.imageAlt;
    image.width = project.imageWidth || 1440; image.height = project.imageHeight || 900;
    image.loading = index < 2 ? 'eager' : 'lazy'; image.decoding = 'async';
    image.addEventListener('error', () => imageBox.replaceChildren(element('p', 'empty-state', copy.labels.projectImageFallback)), { once: true });
    imageBox.append(image); figure.append(imageBox, element('figcaption', '', project.imageCaption));
    const content = element('div', 'project-copy');
    const meta = element('div', 'project-meta'); meta.append(element('span', '', `${String(index + 1).padStart(2, '0')} / ${project.category}`), element('span', '', project.year));
    const tech = element('ul', 'project-tech'); tech.setAttribute('aria-label', copy.labels.technology);
    tech.append(...project.tech.map(item => element('li', '', item)));
    const points = element('ul', 'project-points');
    points.append(...(project.points || [project.description]).map(text => element('li', '', text)));
    const outcome = project.outcome ? element('p', 'project-outcome') : null;
    if (outcome) outcome.append(element('strong', '', `${copy.labels.outcome}: `), project.outcome);
    content.append(meta, element('h3', '', project.shortTitle || project.title), points, ...(outcome ? [outcome] : []), element('span', 'project-status', project.status), tech, links(project, copy));
    article.append(figure, content); return article;
  }));
  list.setAttribute('aria-busy', 'false');
  let category = '';
  const groups = ['', ...new Set(copy.projects.map(p => p.filterGroup))];
  function drawArchive() {
    const projects = category ? copy.projects.filter(p => p.filterGroup === category) : copy.projects;
    $('#archive-list').replaceChildren(...projects.map(project => {
      const row = element('article', 'archive-row');
      const title = element('div'); title.append(element('h3', '', project.shortTitle || project.title), element('p', '', `${project.category} / ${project.year}`));
      row.append(title, element('span', 'project-status', project.status), links(project, copy)); return row;
    }));
    $('#project-filters').querySelectorAll('button').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.filter === category)));
  }
  $('#project-filters').replaceChildren(...groups.map(group => {
    const button = element('button', 'filter', group || copy.labels.allFilter); button.type = 'button'; button.dataset.filter = group;
    button.addEventListener('click', () => { category = group; drawArchive(); }); return button;
  }));
  $('#show-projects').onclick = () => {
    const open = $('#archive-content').hidden;
    $('#archive-content').hidden = !open;
    $('#show-projects').setAttribute('aria-expanded', String(open));
    $('#show-projects span').textContent = open ? copy.labels.showLess : copy.labels.showMore;
    ScrollTrigger.refresh();
  };
  drawArchive();
}
function renderAwards(copy) {
  const formatter = new Intl.DateTimeFormat('en', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' });
  $('#award-list').replaceChildren(...copy.credentials.filter(item => item.category === 'Award').map(item => {
    const card = element('a', 'award glass-card'); card.href = item.asset; card.target = '_blank'; card.rel = 'noopener noreferrer';
    card.append(element('h3', '', item.title), element('p', '', item.issuer));
    if (item.date) { const time = element('time', '', formatter.format(new Date(`${item.date}T00:00:00Z`))); time.dateTime = item.date; card.append(time); }
    card.append(element('span', 'certificate-action', copy.labels.viewCertificate)); return card;
  }));
}
function renderDetails(copy) {
  const points = element('ul', 'about-points');
  points.append(...copy.about.points.map(text => element('li', '', text)));
  $('#about-paragraphs').replaceChildren(points);
  $('#terminal-body').replaceChildren(...copy.hero.terminal.map(([label, value]) => {
    const line = element('div', 'terminal-line'); line.append(element('span', '', label), element('strong', '', value)); return line;
  }));
  const education = copy.profile.education;
  $('#education').replaceChildren(element('strong', '', education.degree), element('span', '', education.institution), element('span', '', education.graduation));
  $('#skill-list').replaceChildren(...copy.skills.map(skill => {
    const article = element('details', 'skill glass-card');
    const summary = element('summary'); summary.append(element('span', '', skill.name), element('span', 'skill-count', String(skill.items.length).padStart(2, '0')), element('span', 'skill-plus', '+'));
    const items = element('ul', 'skill-tags'); items.append(...skill.items.map(item => element('li', '', item)));
    article.append(summary, items); return article;
  }));
  const formatter = new Intl.DateTimeFormat('en', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' });
  $('#credential-list').replaceChildren(...copy.credentials.map(item => {
    const row = element('a', 'credential glass-card'); row.href = item.asset; row.target = '_blank'; row.rel = 'noopener noreferrer';
    const title = element('div');
    title.append(element('span', 'credential-type', item.type), element('h3', '', item.title)); row.append(title, element('p', '', item.issuer));
    if (item.date && /^\d{4}-\d{2}-\d{2}$/.test(item.date)) {
      const date = new Date(`${item.date}T00:00:00Z`);
      if (!Number.isNaN(date.valueOf())) { const time = element('time', '', formatter.format(date)); time.dateTime = item.date; row.append(time); }
    }
    row.append(element('span', 'certificate-action', copy.labels.viewCertificate), arrow());
    return row;
  }));
  const ribbon = $('#credential-list');
  for (const [id, direction] of [['certificate-prev', -1], ['certificate-next', 1]]) {
    $(`#${id}`).addEventListener('click', () => ribbon.scrollBy({ left: direction * ribbon.clientWidth * 0.8, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' }));
  }
  const glow = event => {
    const box = event.currentTarget.getBoundingClientRect();
    event.currentTarget.style.setProperty('--pointer-x', `${event.clientX - box.left}px`);
    event.currentTarget.style.setProperty('--pointer-y', `${event.clientY - box.top}px`);
  };
  document.querySelectorAll('.glass-card').forEach(card => card.addEventListener('pointermove', glow, { passive: true }));
}
function navigation(copy) {
  const toggle = $('#menu-toggle'), nav = $('#mobile-nav');
  const close = () => { nav.hidden = true; toggle.setAttribute('aria-expanded', 'false'); toggle.setAttribute('aria-label', copy.labels.menu); document.body.classList.remove('menu-open'); };
  toggle.addEventListener('click', () => {
    if (!nav.hidden) return close();
    nav.hidden = false; toggle.setAttribute('aria-expanded', 'true'); toggle.setAttribute('aria-label', copy.labels.closeMenu); document.body.classList.add('menu-open');
  });
  nav.querySelectorAll('a').forEach(a => a.addEventListener('click', close));
  const key = event => { if (event.key === 'Escape' && !nav.hidden) { close(); toggle.focus(); } };
  document.addEventListener('keydown', key);
  const header = $('.site-header');
  const updateHeader = () => header.classList.toggle('is-scrolled', scrollY > innerHeight * 1.4);
  window.addEventListener('scroll', updateHeader, { passive: true });
  updateHeader();
  return () => { document.removeEventListener('keydown', key); window.removeEventListener('scroll', updateHeader); };
}
async function setupExperience(copy) {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const desktop = matchMedia('(min-width: 801px)');
  const policy = motionPolicy({ reducedMotion: reduce.matches, saveData: navigator.connection?.saveData, width: innerWidth });
  let sculpture;
  let lenis;
  let manuallyPaused = false;
  const motionButton = $('#scene-toggle');
  const state = $('#scene-wrap');
  if (policy.webgl) {
    try {
      const { mountScene } = await import('./scene.js');
      sculpture = mountScene({ canvas: $('#hero-canvas'), mobile: !desktop.matches,
        onReady() { state.classList.add('scene-ready'); state.dataset.sceneState = 'ready'; },
        onFailure() { state.classList.remove('scene-ready'); state.dataset.sceneState = 'fallback'; motionButton.hidden = true; },
      });
    } catch { state.dataset.sceneState = 'fallback'; }
  } else { state.dataset.sceneState = 'static'; motionButton.hidden = true; }
  motionButton.addEventListener('click', () => {
    manuallyPaused = !manuallyPaused;
    manuallyPaused ? sculpture?.pause() : sculpture?.resume();
    motionButton.setAttribute('aria-pressed', String(manuallyPaused));
    motionButton.textContent = manuallyPaused ? copy.labels.resumeScene : copy.labels.pauseScene;
  });
  if (!sculpture) motionButton.hidden = true;
  if (policy.smooth) {
    lenis = new Lenis({ lerp: 0.085, smoothWheel: true, anchors: true });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.lagSmoothing(0);
  }
  const tick = time => { lenis?.raf(time * 1000); sculpture?.update(time); };
  if (lenis || sculpture) gsap.ticker.add(tick);
  const pointer = event => {
    if (matchMedia('(hover: hover)').matches) sculpture?.setPointer(event.clientX / innerWidth * 2 - 1, event.clientY / innerHeight * 2 - 1);
  };
  window.addEventListener('pointermove', pointer, { passive: true });
  const resize = () => sculpture?.resize();
  window.addEventListener('resize', resize);
  const visibility = () => { if (document.hidden || manuallyPaused || reduce.matches) sculpture?.pause(); else sculpture?.resume(); };
  document.addEventListener('visibilitychange', visibility);
  const observer = new IntersectionObserver(entries => {
    if (entries[0].isIntersecting && !manuallyPaused && !document.hidden && !reduce.matches) sculpture?.resume(); else sculpture?.pause();
  });
  observer.observe($('#top'));
  const media = gsap.matchMedia();
  media.add({ wide: '(min-width: 801px)', reduce: '(prefers-reduced-motion: reduce)' }, context => {
    if (context.conditions.reduce) return;
    let focusGallery;
    const intro = gsap.timeline({ defaults: { ease: 'power3.out' } });
    intro.from('.hero-name', { y: 35, duration: 1.1 })
      .from('.hero-intro,.hero-terminal,.hero-bottom', { y: 20, duration: 0.8, stagger: 0.08 }, '-=.8');
    if (context.conditions.wide) {
      const hero = gsap.timeline({ scrollTrigger: { id: 'hero', trigger: '#top', pin: '.hero-stage', start: 'top top', end: 'bottom bottom', scrub: 0.8, invalidateOnRefresh: true, onUpdate: self => sculpture?.setProgress(self.progress) } });
      hero.to('.hero-name', { yPercent: -95, scale: 0.93, opacity: 0, duration: 0.6, ease: 'none' }, 0)
        .to('.hero-intro,.hero-coordinate,.hero-terminal', { y: -65, autoAlpha: 0, duration: 0.35 }, 0)
        .fromTo('.hero-story', { y: 90, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.45 }, 0.32)
        .to('.hero-story', { y: -65, autoAlpha: 0, duration: 0.25 }, 0.92)
        .to('.hero-progress span', { scaleX: 1, duration: 1.2, ease: 'none' }, 0);
      const track = $('#project-list');
      const distance = () => Math.max(0, track.scrollWidth - innerWidth);
      const gallery = gsap.to(track, { x: () => -distance(), ease: 'none', scrollTrigger: { id: 'gallery', trigger: '#work', pin: '.work-stage', start: 'top top', end: () => `+=${distance() * 0.85}`, scrub: 0.75, invalidateOnRefresh: true,
        onUpdate: self => { $('#gallery-current').textContent = String(Math.min(6, 1 + Math.floor(self.progress * 6))).padStart(2, '0'); gsap.set('.gallery-line span', { scaleX: self.progress }); },
      } });
      gsap.utils.toArray('.project-media').forEach((figure, index) => {
        if (!index) return;
        gsap.from(figure, { rotateY: -13, scale: 0.92, transformOrigin: 'left center', ease: 'none', scrollTrigger: { trigger: figure, containerAnimation: gallery, start: 'left 95%', end: 'left 45%', scrub: true } });
      });
      focusGallery = event => {
        const article = event.target.closest('.project'); if (!article) return;
        const trigger = ScrollTrigger.getById('gallery');
        if (!trigger) return;
        const p = Math.min(1, Math.max(0, (article.offsetLeft - 50) / Math.max(1, distance())));
        lenis ? lenis.scrollTo(trigger.start + (trigger.end - trigger.start) * p, { immediate: true }) : window.scrollTo(0, trigger.start + (trigger.end - trigger.start) * p);
      };
      $('#project-list').addEventListener('focusin', focusGallery);
    }
    const statement = $('#statement');
    statement.replaceChildren(...copy.about.statement.split(' ').flatMap(word => [element('span', 'word', word), document.createTextNode(' ')]));
    gsap.from('.statement .word', { opacity: 0.65, y: 20, stagger: 0.1, ease: 'none', scrollTrigger: { trigger: '.statement-section', start: 'top 75%', end: 'bottom 70%', scrub: 0.6 } });
    gsap.utils.toArray('.skill').forEach((node, i) => gsap.from(node, { y: 35, duration: 0.8, delay: (i % 2) * 0.1, scrollTrigger: { trigger: node, start: 'top 90%', once: true } }));
    gsap.from('.contact-title>span', { yPercent: 20, opacity: 0.7, stagger: 0.1, ease: 'none', scrollTrigger: { trigger: '#contact', start: 'top 85%', end: 'top 30%', scrub: 0.7 } });
    return () => { if (focusGallery) $('#project-list').removeEventListener('focusin', focusGallery); };
  });
  const preference = () => { if (reduce.matches) { lenis?.destroy(); lenis = null; sculpture?.pause(); motionButton.hidden = true; state.classList.remove('scene-ready'); state.dataset.sceneState = 'static'; } };
  reduce.addEventListener('change', preference);
  document.fonts.ready.then(() => ScrollTrigger.refresh());
  const refresh = () => ScrollTrigger.refresh();
  document.querySelectorAll('#project-list img').forEach(img => img.addEventListener('load', refresh, { once: true }));
  window.addEventListener('pagehide', event => {
    if (event.persisted) return;
    media.revert(); observer.disconnect(); lenis?.destroy(); sculpture?.destroy(); gsap.ticker.remove(tick);
    reduce.removeEventListener('change', preference); window.removeEventListener('pointermove', pointer); window.removeEventListener('resize', resize); document.removeEventListener('visibilitychange', visibility);
  });
  window.__portfolio = { get scene() { return state.dataset.sceneState; }, get sculpture() { return sculpture; }, scroll: ScrollTrigger };
}
async function boot() {
  let copy;
  const controller = new AbortController(); const timer = setTimeout(() => controller.abort(), 12000);
  try {
    const response = await fetch('/data/copy.en.json', { signal: controller.signal });
    if (!response.ok) throw new Error('Content unavailable');
    copy = await response.json();
    if (!copy.profile || !Array.isArray(copy.projects) || !Array.isArray(copy.credentials)) throw new Error('Invalid content');
    applyCopy(copy); renderWork(copy); renderAwards(copy); renderDetails(copy);
    $('#content-error').hidden = true;
  } catch {
    $('#content-error').hidden = false; $('#project-list').setAttribute('aria-busy', 'false');
    return;
  } finally { clearTimeout(timer); }
  // Menu and motion failures must not report the already-rendered content as unloaded.
  try {
    const cleanNavigation = navigation(copy);
    window.addEventListener('pagehide', event => { if (!event.persisted) cleanNavigation(); });
    await setupExperience(copy);
  } catch (error) { console.error('Motion setup failed; content is still available.', error); }
  document.body.dataset.ready = 'true';
}
$('#content-retry').addEventListener('click', boot);
boot();
