(() => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  /* Theme toggle (persisted) */
  const root = document.documentElement;
  const themeBtn = $('#theme-toggle');
  const applyTheme = (t) => {
    root.setAttribute('data-theme', t);
    themeBtn.innerHTML = t === 'light' ? '<i class="fa-solid fa-moon"></i>' : '<i class="fa-solid fa-sun"></i>';
    themeBtn.setAttribute('aria-label', t === 'light' ? 'Switch to dark theme' : 'Switch to light theme');
  };
  applyTheme(localStorage.getItem('theme') || 'dark');
  themeBtn.addEventListener('click', () => {
    const next = root.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
    localStorage.setItem('theme', next);
    applyTheme(next);
  });

  /* Mobile menu */
  const menuBtn = $('#menu-toggle');
  const links = $('#nav-links');
  menuBtn.addEventListener('click', () => {
    const open = links.classList.toggle('open');
    menuBtn.setAttribute('aria-expanded', open);
    menuBtn.innerHTML = open ? '<i class="fa-solid fa-xmark"></i>' : '<i class="fa-solid fa-bars"></i>';
  });
  $$('a', links).forEach((a) => a.addEventListener('click', () => {
    links.classList.remove('open');
    menuBtn.setAttribute('aria-expanded', false);
    menuBtn.innerHTML = '<i class="fa-solid fa-bars"></i>';
  }));

  /* Scroll progress, back-to-top */
  const bar = $('.progress');
  const toTop = $('#to-top');
  const onScroll = () => {
    const h = document.documentElement;
    const pct = h.scrollTop / (h.scrollHeight - h.clientHeight || 1);
    bar.style.width = pct * 100 + '%';
    toTop.classList.toggle('show', h.scrollTop > 600);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
  toTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' }));

  /* Scroll-spy */
  const navAnchors = $$('.nav-links a');
  const spy = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        navAnchors.forEach((a) => a.classList.toggle('active', a.getAttribute('href') === '#' + e.target.id));
      }
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  $$('section[id]').forEach((s) => spy.observe(s));

  /* Reveal on scroll */
  const reveals = $$('.reveal');
  if ('IntersectionObserver' in window && !reduceMotion) {
    const io = new IntersectionObserver((entries, obs) => {
      entries.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add('in'); obs.unobserve(e.target); }
      });
    }, { threshold: 0.12 });
    reveals.forEach((el, i) => { el.style.transitionDelay = (i % 4) * 70 + 'ms'; io.observe(el); });
  } else {
    reveals.forEach((el) => el.classList.add('in'));
  }

  /* Typing effect */
  const typed = $('#typed');
  const phrases = ['Embedded Systems Engineer', 'ESP32 / C++ Firmware', 'Power Profiling & IoT', 'Python / FastAPI Backends'];
  if (reduceMotion) {
    typed.textContent = phrases[0];
  } else {
    let p = 0, c = 0, del = false;
    const tick = () => {
      const word = phrases[p];
      typed.textContent = word.slice(0, c);
      if (!del && c === word.length) { del = true; return setTimeout(tick, 1600); }
      if (del && c === 0) { del = false; p = (p + 1) % phrases.length; }
      c += del ? -1 : 1;
      setTimeout(tick, del ? 35 : 70);
    };
    tick();
  }

  /* Count-up stats */
  $$('[data-count]').forEach((el) => {
    const target = +el.dataset.count;
    const suffix = el.dataset.suffix || '';
    if (reduceMotion) { el.textContent = target + suffix; return; }
    const io = new IntersectionObserver(([e], obs) => {
      if (!e.isIntersecting) return;
      obs.disconnect();
      const start = performance.now();
      const step = (t) => {
        const k = Math.min((t - start) / 1200, 1);
        el.textContent = Math.round(target * (1 - Math.pow(1 - k, 3))) + suffix;
        if (k < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    }, { threshold: 0.6 });
    io.observe(el);
  });

  /* Project filters */
  const filterBtns = $$('.filter-btn');
  const cards = $$('#projects .card');
  filterBtns.forEach((btn) => btn.addEventListener('click', () => {
    filterBtns.forEach((b) => { b.classList.remove('active'); b.setAttribute('aria-pressed', false); });
    btn.classList.add('active');
    btn.setAttribute('aria-pressed', true);
    const f = btn.dataset.filter;
    cards.forEach((card) => card.classList.toggle('hidden', f !== 'all' && !card.dataset.cat.split(' ').includes(f)));
  }));

  /* Cursor spotlight on cards */
  $$('.card, .skill-category').forEach((el) => el.addEventListener('pointermove', (e) => {
    const r = el.getBoundingClientRect();
    el.style.setProperty('--mx', e.clientX - r.left + 'px');
    el.style.setProperty('--my', e.clientY - r.top + 'px');
  }));

  /* Copy email */
  const toast = $('#toast');
  $$('[data-copy]').forEach((btn) => btn.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(btn.dataset.copy);
      toast.textContent = 'Email copied to clipboard';
    } catch {
      toast.textContent = btn.dataset.copy;
    }
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2200);
  }));

  $('#year').textContent = new Date().getFullYear();
})();
