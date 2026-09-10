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

// Куди веде кнопка «Надіслати заявку»: 'telegram' або 'instagramDM'
const PRIMARY_CONTACT = 'telegram';

/* ========================================================= */

document.addEventListener('DOMContentLoaded', () => {
  initLoader();
  initStepper();
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

/* ---------- Інтерактивна система ---------- */

function initStepper() {
  const stepper = document.getElementById('stepper');
  if (!stepper) return;

  const fill = document.getElementById('stepperFill');
  const steps = [...stepper.querySelectorAll('[data-step]')];

  const paintRail = () => {
    if (!fill) return;
    const open = stepper.querySelector('.step.is-open');
    if (!open) { fill.style.height = '0px'; return; }
    const rail = stepper.querySelector('.stepper__rail').getBoundingClientRect();
    const dot = open.querySelector('.step__dot').getBoundingClientRect();
    fill.style.height = Math.max(0, dot.top + dot.height / 2 - rail.top) + 'px';
  };

  steps.forEach(step => {
    const head = step.querySelector('.step__head');
    head.addEventListener('click', () => {
      const wasOpen = step.classList.contains('is-open');
      steps.forEach(other => {
        other.classList.remove('is-open');
        other.querySelector('.step__head').setAttribute('aria-expanded', 'false');
      });
      if (!wasOpen) {
        step.classList.add('is-open');
        head.setAttribute('aria-expanded', 'true');
      }
      requestAnimationFrame(paintRail);
      setTimeout(paintRail, 460);
    });
  });

  window.addEventListener('resize', paintRail);
  requestAnimationFrame(paintRail);
  setTimeout(paintRail, 400);
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

    const message = lines.join('\n');
    const copied = await copyText(message);

    const target = CONTACTS[PRIMARY_CONTACT] || CONTACTS.telegram || CONTACTS.instagramDM;
    const where = PRIMARY_CONTACT === 'telegram' ? 'Telegram' : 'Direct';

    showToast(copied
      ? 'Заявку скопійовано — вставте її в ' + where
      : 'Відкриваємо ' + where + ' — напишіть нам про свій проєкт');

    setTimeout(() => window.open(target, '_blank', 'noopener'), 700);
    form.reset();
    form.querySelectorAll('.field').forEach(f => f.classList.remove('is-error'));
  });

  form.querySelectorAll('input, select').forEach(el => {
    el.addEventListener('input', () => el.closest('.field').classList.remove('is-error'));
  });
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
