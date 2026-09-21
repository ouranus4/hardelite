/* =========================================================
   HARDELITE — логіка сайту

   ⬇⬇⬇  ЄДИНЕ МІСЦЕ, ДЕ ТРЕБА ВПИСАТИ СВОЇ КОНТАКТИ  ⬇⬇⬇
   ========================================================= */

const CONTACTS = {
  instagramUser: '',                                  // нік без @ — впишіть свій
  instagram:     '',                                  // https://instagram.com/ваш_нік
  instagramDM:   '',                                  // https://ig.me/m/ваш_нік
  telegram:      'https://t.me/Veronika_logvinenko',
  tiktok:        '',                                  // https://www.tiktok.com/@ваш_нік
  email:         '',                                  // пошта для заявок
  phone:         '+380 66 170 33 03'
};

/* ⬇⬇⬇  ЦІНИ ДЛЯ КАЛЬКУЛЯТОРА — впишіть свої (у гривнях, за місяць)  ⬇⬇⬇
   Цифри нижче — приклад. Поки enabled: false, сума на сайті не показується,
   щоб не вводити клієнтів в оману. */
const PRICES = {
  // поки false — калькулятор показує підбір послуг, але не суму.
  // Впишіть свої ціни нижче й поставте true — зʼявиться розрахунок.
  enabled: false,

  what: {
    smm:     18000,   // ведення Instagram
    content:  9000,   // контент і зйомки
    reels:   12000,   // EXPERT REELS DAY
    ads:      8000,   // Meta Ads (без бюджету)
    pr:       7000,   // PR та колаборації
    product: 15000,   // упаковка продукту
    funnel:  11000,   // автоворонка
    launch:  25000    // супровід запуску
  },
  who:   { expert: 1, blogger: 1, beauty: 0.9, brand: 1.1 }   // поправка на тип проєкту
};

// Куди веде кнопка «Надіслати заявку»: 'telegram' або 'instagramDM'
const PRIMARY_CONTACT = 'telegram';

/* Куди сайт надсилає заявки. '/api/lead' — власний Telegram-бот.
   Якщо лишити порожнім, форма працюватиме по-старому:
   скопіює текст заявки і відкриє месенджер. */
const LEAD_ENDPOINT = '/api/lead';

/* ========================================================= */

document.addEventListener('DOMContentLoaded', () => {
  initLoader();
  initDeck();
  initScopeTabs();
  initTeam();
  initCalc();
  applyContacts();
  initHeader();
  initBurger();
  initScrollAnim();
  initRevealText();
  initSlider();
  initForm();

  const year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();
});

/* ---------- Екран завантаження ---------- */

function initLoader() {
  const loader = document.getElementById('loader');
  const fill = document.getElementById('loaderFill');
  const pct = document.getElementById('loaderPct');
  if (!loader) return;

  const finish = () => {
    document.body.classList.add('is-loaded');
    setTimeout(() => loader.remove(), 700);
  };

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    finish();
    return;
  }

  let value = 0;
  let ready = false;
  const start = performance.now();
  window.addEventListener('load', () => { ready = true; });

  const tick = () => {
    const elapsed = performance.now() - start;
    // рівно біжимо до 92%, а фінішуємо коли сторінка готова або через 1,5 с
    const target = (ready || elapsed > 1500) ? 100 : Math.min(92, elapsed / 1300 * 92);
    value = value + (target - value) * 0.22;

    if (fill) fill.style.width = value.toFixed(1) + '%';
    if (pct) pct.textContent = Math.round(value) + '%';

    if (value >= 99.3) {
      if (fill) fill.style.width = '100%';
      if (pct) pct.textContent = '100%';
      setTimeout(finish, 200);
      return;
    }
    setTimeout(tick, 32);
  };

  tick();
  // запобіжник: якщо щось піде не так, екран усе одно зникне
  setTimeout(finish, 3000);
}

/* ---------- Інтерактивні слайди системи ---------- */

function initDeck() {
  const deck = document.getElementById('deck');
  if (!deck) return;

  const intro = document.getElementById('deckIntro');
  const stage = document.getElementById('deckStage');
  const track = document.getElementById('deckTrack');
  const bar = document.getElementById('deckBar');
  const dots = document.getElementById('deckDots');
  const prev = document.getElementById('deckPrev');
  const next = document.getElementById('deckNext');
  const start = document.getElementById('deckStart');
  const close = document.getElementById('deckClose');
  const now = document.getElementById('deckNow');
  const nextLabel = document.getElementById('deckNextLabel');
  const slides = [...track.querySelectorAll('[data-slide]')];

  let index = 0;
  let opened = false;

  const render = () => {
    track.style.transform = 'translateX(' + (-index * 100) + '%)';
    slides.forEach((s, i) => {
      s.classList.toggle('is-active', i === index);
      s.setAttribute('aria-hidden', i === index ? 'false' : 'true');
    });
    [...dots.children].forEach((d, i) => d.classList.toggle('is-active', i === index));
    bar.style.width = ((index + 1) / slides.length * 100) + '%';

    if (now) now.textContent = String(index + 1).padStart(2, '0');

    prev.disabled = index === 0;
    next.disabled = index === slides.length - 1;
    if (nextLabel) {
      nextLabel.textContent = index === slides.length - 2 ? 'Останній етап'
        : index === slides.length - 1 ? 'Пройдено' : 'Далі';
    }
  };

  const go = i => { index = Math.max(0, Math.min(slides.length - 1, i)); render(); };

  slides.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.type = 'button';
    dot.setAttribute('aria-label', 'Етап ' + (i + 1));
    dot.addEventListener('click', () => go(i));
    dots.appendChild(dot);
  });

  start.addEventListener('click', () => {
    opened = true;
    intro.hidden = true;
    stage.hidden = false;
    render();
    stage.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  });

  if (close) {
    close.addEventListener('click', () => {
      opened = false;
      stage.hidden = true;
      intro.hidden = false;
      index = 0;
    });
  }

  prev.addEventListener('click', () => go(index - 1));
  next.addEventListener('click', () => go(index + 1));

  // стрілки клавіатури працюють, коли блок на екрані
  window.addEventListener('keydown', e => {
    if (!opened) return;
    const box = stage.getBoundingClientRect();
    if (box.bottom < 0 || box.top > window.innerHeight) return;
    if (e.key === 'ArrowRight') go(index + 1);
    if (e.key === 'ArrowLeft') go(index - 1);
  });

  // свайп
  let startX = null;
  track.addEventListener('touchstart', e => { startX = e.touches[0].clientX; }, { passive: true });
  track.addEventListener('touchend', e => {
    if (startX === null) return;
    const dx = e.changedTouches[0].clientX - startX;
    if (Math.abs(dx) > 45) go(index + (dx < 0 ? 1 : -1));
    startX = null;
  });

  render();
}

/* ---------- Вкладки у блоці послуг ---------- */

function initScopeTabs() {
  const tabs = [...document.querySelectorAll('.scope__tab')];
  const panels = [...document.querySelectorAll('.scope__panel')];
  if (!tabs.length) return;

  // черга появи пунктів рахується від їх порядку, тож список може бути будь-якої довжини
  panels.forEach(panel => {
    [...panel.querySelectorAll('li')].forEach((li, i) => li.style.setProperty('--i', i));
  });

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const i = +tab.dataset.tab;

      tabs.forEach((t, n) => {
        t.classList.toggle('is-active', n === i);
        t.setAttribute('aria-selected', n === i ? 'true' : 'false');
      });

      panels.forEach((panel, n) => {
        if (n === i) {
          panel.hidden = false;
          // перезапускаємо анімацію появи пунктів
          panel.classList.remove('is-active');
          void panel.offsetWidth;
          panel.classList.add('is-active');
        } else {
          panel.hidden = true;
          panel.classList.remove('is-active');
        }
      });
    });
  });
}

/* ---------- Ролі команди ---------- */

function initTeam() {
  document.querySelectorAll('[data-team]').forEach(item => {
    const head = item.querySelector('.team__head');
    head.addEventListener('click', () => {
      const open = item.classList.toggle('is-open');
      head.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  });
}

/* ---------- Калькулятор вартості ---------- */

function initCalc() {
  const calc = document.querySelector('.calc');
  if (!calc) return;

  const sumEl = document.getElementById('calcSum');
  const hintEl = document.getElementById('calcHint');
  const pickedEl = document.getElementById('calcPicked');
  const sendBtn = document.getElementById('calcSend');
  const countEl = document.getElementById('calcCount');

  const labels = {};
  calc.querySelectorAll('.calc__chip').forEach(chip => {
    labels[chip.dataset.group + ':' + chip.dataset.value] =
      chip.childNodes[0].textContent.trim();
  });

  const state = { who: null, what: new Set() };
  let shown = 0;

  const money = n => new Intl.NumberFormat('uk-UA').format(Math.round(n / 100) * 100) + ' ₴';

  const animateTo = value => {
    const from = shown;
    const startTime = performance.now();
    const run = now => {
      const t = Math.min(1, (now - startTime) / 500);
      shown = from + (value - from) * (1 - Math.pow(1 - t, 3));
      sumEl.textContent = value ? 'від ' + money(shown) : '—';
      if (t < 1) requestAnimationFrame(run); else shown = value;
    };
    requestAnimationFrame(run);
  };

  const render = () => {
    const base = [...state.what].reduce((acc, key) => acc + (PRICES.what[key] || 0), 0);
    const who = PRICES.who[state.who] || 1;
    const total = base * who;

    if (countEl) countEl.textContent = state.what.size;

    pickedEl.innerHTML = '';
    [...state.what].forEach((key, i) => {
      const li = document.createElement('li');
      li.textContent = labels['what:' + key];
      li.style.animationDelay = (i * 0.05) + 's';
      pickedEl.appendChild(li);
    });

    if (!state.what.size) {
      const li = document.createElement('li');
      li.className = 'calc__empty';
      li.textContent = 'Поки нічого не обрано';
      pickedEl.appendChild(li);
      sumEl.textContent = '—';
      sumEl.style.fontSize = '';
      shown = 0;
      hintEl.textContent = 'Оберіть, що потрібно, — і зберемо ваш набір';
      return;
    }

    if (!PRICES.enabled) {
      sumEl.textContent = 'за запитом';
      sumEl.style.fontSize = '.55em';
      hintEl.textContent = 'Порахуємо під ваш обсяг і надішлемо вартість —'
        + ' зазвичай протягом дня';
      return;
    }

    animateTo(total);
    hintEl.textContent = state.who
      ? 'Розрахунок для профілю: ' + labels['who:' + state.who].toLowerCase()
      : 'Оберіть, хто ви, — і розрахунок уточниться';
  };

  calc.querySelectorAll('.calc__chip').forEach(chip => {
    chip.addEventListener('click', () => {
      const { group, value } = chip.dataset;

      if (group === 'what') {
        chip.classList.toggle('is-on');
        state.what.has(value) ? state.what.delete(value) : state.what.add(value);
      } else {
        const siblings = calc.querySelectorAll('[data-group="' + group + '"]');
        const already = chip.classList.contains('is-on');
        siblings.forEach(s => s.classList.remove('is-on'));
        if (!already) { chip.classList.add('is-on'); state[group] = value; }
        else { state[group] = null; }
      }
      render();
    });
  });

  // переносимо вибір у форму заявки
  sendBtn.addEventListener('click', () => {
    const service = document.getElementById('fService');
    if (service && state.what.size) {
      const first = labels['what:' + [...state.what][0]];
      [...service.options].forEach(o => { if (o.text === first) service.value = o.value; });
    }
    window.__calcSummary = [...state.what].map(k => labels['what:' + k]).join(', ');
  });

  render();
}

/* ---------- Контакти ---------- */

function applyContacts() {
  document.querySelectorAll('[data-link]').forEach(el => {
    const type = el.dataset.link;
    const value = CONTACTS[type];

    // порожній контакт — просто ховаємо посилання, щоб на сайті не було заглушок
    if (!value) {
      el.hidden = true;
      return;
    }

    if (type === 'email') {
      el.href = 'mailto:' + value;
      if (el.textContent.trim() === '—') el.textContent = value;
    } else if (type === 'phone') {
      el.href = 'tel:' + value.replace(/[^+\d]/g, '');
      if (el.textContent.trim() === '—') el.textContent = value;
    } else {
      el.href = value;
      el.target = '_blank';
      el.rel = 'noopener';
    }
  });
}

/* ---------- Хедер ---------- */

function initHeader() {
  const header = document.getElementById('header');
  if (!header) return;

  const onScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 12);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });
}

/* ---------- Бургер-меню ---------- */

function initBurger() {
  const burger = document.getElementById('burger');
  const menu = document.getElementById('mobileMenu');
  if (!burger || !menu) return;

  const close = () => {
    menu.hidden = true;
    burger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  };

  burger.addEventListener('click', () => {
    const open = burger.getAttribute('aria-expanded') === 'true';
    if (open) {
      close();
    } else {
      menu.hidden = false;
      burger.setAttribute('aria-expanded', 'true');
      document.body.style.overflow = 'hidden';
    }
  });

  menu.querySelectorAll('a').forEach(a => a.addEventListener('click', close));
  window.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
  window.addEventListener('resize', () => { if (window.innerWidth > 900) close(); });
}

/* ---------- Поява блоків при скролі ---------- */

function initScrollAnim() {
  const items = document.querySelectorAll('[data-anim]');
  if (!items.length) return;

  if (!('IntersectionObserver' in window)) {
    items.forEach(el => el.classList.add('is-in'));
    return;
  }

  const io = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const siblings = [...entry.target.parentElement.children];
      const delay = Math.min(siblings.indexOf(entry.target), 7) * 70;
      entry.target.style.transitionDelay = delay + 'ms';
      entry.target.classList.add('is-in');
      obs.unobserve(entry.target);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });

  items.forEach(el => io.observe(el));
}

/* ---------- Проявлення тексту по словах ---------- */

function initRevealText() {
  const block = document.querySelector('[data-reveal]');
  if (!block) return;

  const words = block.textContent.trim().split(/\s+/);
  block.textContent = '';
  words.forEach((word, i) => {
    const span = document.createElement('span');
    span.className = 'w';
    span.textContent = word;
    block.appendChild(span);
    if (i < words.length - 1) block.appendChild(document.createTextNode(' '));
  });

  const spans = block.querySelectorAll('.w');
  let ticking = false;

  const update = () => {
    ticking = false;
    const rect = block.getBoundingClientRect();
    const vh = window.innerHeight;

    // 0 — блок ще внизу екрана, 1 — повністю проявлений
    const start = vh * 0.88;
    const end = vh * 0.32;
    const progress = (start - rect.top) / (start - end);
    const clamped = Math.max(0, Math.min(1, progress));
    const lit = Math.round(clamped * spans.length);

    spans.forEach((s, i) => s.classList.toggle('is-on', i < lit));
  };

  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(update);
  };

  update();
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
}

/* ---------- Карусель відгуків ---------- */

function initSlider() {
  const track = document.getElementById('reviewTrack');
  const dotsBox = document.getElementById('reviewDots');
  const prev = document.getElementById('prevBtn');
  const next = document.getElementById('nextBtn');
  if (!track) return;

  const slides = [...track.children];
  let index = 0;

  const perView = () => (window.innerWidth <= 900 ? 1 : 2);
  const maxIndex = () => Math.max(0, slides.length - perView());

  const buildDots = () => {
    if (!dotsBox) return;
    dotsBox.innerHTML = '';
    for (let i = 0; i <= maxIndex(); i++) {
      const b = document.createElement('button');
      b.type = 'button';
      b.setAttribute('aria-label', 'Відгук ' + (i + 1));
      b.addEventListener('click', () => go(i));
      dotsBox.appendChild(b);
    }
  };

  const render = () => {
    const gap = parseFloat(getComputedStyle(track).columnGap || getComputedStyle(track).gap) || 0;
    const step = slides[0].getBoundingClientRect().width + gap;
    track.style.transform = 'translateX(' + (-index * step) + 'px)';

    if (dotsBox) {
      [...dotsBox.children].forEach((d, i) => d.classList.toggle('is-active', i === index));
    }
  };

  const go = i => {
    index = Math.max(0, Math.min(maxIndex(), i));
    render();
  };

  prev && prev.addEventListener('click', () => go(index - 1));
  next && next.addEventListener('click', () => go(index + 1));

  // свайп на тачскрінах
  let startX = null;
  track.addEventListener('touchstart', e => { startX = e.touches[0].clientX; }, { passive: true });
  track.addEventListener('touchend', e => {
    if (startX === null) return;
    const dx = e.changedTouches[0].clientX - startX;
    if (Math.abs(dx) > 45) go(index + (dx < 0 ? 1 : -1));
    startX = null;
  });

  window.addEventListener('resize', () => { buildDots(); go(index); });

  buildDots();
  render();
}

/* ---------- Форма заявки ---------- */

function initForm() {
  const form = document.getElementById('leadForm');
  if (!form) return;

  form.addEventListener('submit', async e => {
    e.preventDefault();

    const fields = {
      name: form.querySelector('#fName'),
      service: form.querySelector('#fService'),
      insta: form.querySelector('#fInsta'),
      phone: form.querySelector('#fPhone')
    };

    let valid = true;
    ['name', 'service', 'insta'].forEach(key => {
      const el = fields[key];
      const empty = !el.value.trim();
      el.closest('.field').classList.toggle('is-error', empty);
      if (empty) valid = false;
    });

    if (!valid) {
      showToast('Заповніть, будь ласка, обов’язкові поля');
      return;
    }

    const insta = fields.insta.value.trim().replace(/^@/, '');
    const lines = [
      'Заявка з сайту HardElite',
      'Ім’я: ' + fields.name.value.trim(),
      'Послуга: ' + fields.service.value,
      'Instagram: @' + insta
    ];
    if (fields.phone.value.trim()) lines.push('Телефон: ' + fields.phone.value.trim());
    if (window.__calcSummary) lines.push('Цікавить: ' + window.__calcSummary);

    const message = lines.join('\n');
    const btn = form.querySelector('button[type="submit"]');
    const sent = LEAD_ENDPOINT ? await sendLead(form, fields, insta, btn) : false;

    const done = () => {
      form.reset();
      form.querySelectorAll('.field').forEach(f => f.classList.remove('is-error'));
    };

    if (sent) {
      showToast('Дякуємо! Заявка вже в нас — відповімо найближчим часом');
      done();
      return;
    }

    // запасний шлях: якщо бот недоступний, копіюємо заявку й відкриваємо месенджер
    const copied = await copyText(message);

    const target = CONTACTS[PRIMARY_CONTACT] || CONTACTS.telegram || CONTACTS.instagramDM;
    const where = PRIMARY_CONTACT === 'telegram' ? 'Telegram' : 'Direct';

    showToast(copied
      ? 'Заявку скопійовано — вставте її в ' + where
      : 'Відкриваємо ' + where + ' — напишіть нам про свій проєкт');

    setTimeout(() => window.open(target, '_blank', 'noopener'), 700);
    done();
  });

  form.querySelectorAll('input, select').forEach(el => {
    el.addEventListener('input', () => el.closest('.field').classList.remove('is-error'));
  });
}

async function sendLead(form, fields, insta, btn) {
  const label = btn ? btn.innerHTML : '';
  if (btn) {
    btn.disabled = true;
    btn.textContent = 'Надсилаємо…';
  }

  try {
    const trap = form.querySelector('[name="company"]');
    const res = await fetch(LEAD_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: fields.name.value.trim(),
        service: fields.service.value,
        instagram: insta,
        phone: fields.phone.value.trim(),
        calc: window.__calcSummary || '',
        company: trap ? trap.value : ''
      })
    });

    const data = await res.json().catch(() => ({}));
    return res.ok && data.ok === true;
  } catch (_) {
    return false;
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = label;
    }
  }
}

async function copyText(text) {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch (_) { /* падаємо у запасний варіант */ }

  try {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.cssText = 'position:fixed;top:-1000px;opacity:0';
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(ta);
    return ok;
  } catch (_) {
    return false;
  }
}

/* ---------- Toast ---------- */

let toastTimer = null;
function showToast(text) {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = text;
  toast.classList.add('is-visible');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('is-visible'), 4200);
}
