/* =========================================================
   HARDELITE — приймання заявок у Telegram

   Токен бота НЕ зберігається в коді. Він живе у Vercel:
   Settings → Environment Variables
     TELEGRAM_BOT_TOKEN — токен від @BotFather
     TELEGRAM_CHAT_ID   — куди надсилати заявки.
                          Можна кілька чатів через кому, наприклад:
                          6835234366,-1001234567890
   ========================================================= */

const MAX = 300;
const NL = String.fromCharCode(10);

const clean = v => String(v == null ? '' : v)
  .replace(/[\u0000-\u001F\u007F]/g, ' ')
  .trim()
  .slice(0, MAX);

const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).json({ ok: false, error: 'method' });
    return;
  }

  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatIds = String(process.env.TELEGRAM_CHAT_ID || '')
    .split(',')
    .map(v => v.trim())
    .filter(Boolean);

  if (!token || !chatIds.length) {
    console.error('lead: не задані TELEGRAM_BOT_TOKEN або TELEGRAM_CHAT_ID');
    res.status(500).json({ ok: false, error: 'not_configured' });
    return;
  }

  let body = req.body;
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch (_) { body = {}; }
  }
  if (!body || typeof body !== 'object') body = {};

  // пастка для спам-ботів: поле сховане від людей, тож заповнене = робот
  if (clean(body.company)) {
    res.status(200).json({ ok: true });
    return;
  }

  const name = clean(body.name);
  const instagram = clean(body.instagram).replace(/^@+/, '');
  const service = clean(body.service);
  const phone = clean(body.phone);
  const calc = clean(body.calc);

  if (!name || !instagram) {
    res.status(400).json({ ok: false, error: 'required' });
    return;
  }

  const rows = ['<b>Нова заявка з сайту</b>', ''];
  rows.push('Ім’я: ' + esc(name));
  rows.push('Instagram: @' + esc(instagram));
  if (service) rows.push('Послуга: ' + esc(service));
  if (phone) rows.push('Телефон: ' + esc(phone));
  if (calc) rows.push('Калькулятор: ' + esc(calc));
  rows.push('', 'hard-elite.com');

  const text = rows.join(NL);

  const send = async chat_id => {
    const r = await fetch('https://api.telegram.org/bot' + token + '/sendMessage', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id,
        text,
        parse_mode: 'HTML',
        disable_web_page_preview: true
      })
    });
    const data = await r.json().catch(() => ({}));
    if (!r.ok || !data.ok) {
      throw new Error('chat ' + chat_id + ': ' + r.status + ' ' + JSON.stringify(data));
    }
  };

  // Шлемо в усі чати одразу. Заявка вважається доставленою, якщо дійшла
  // хоча б в один — інакше видалена група чи бот, якого викинули з чату,
  // ламали б форму для клієнта.
  const results = await Promise.allSettled(chatIds.map(send));
  const failed = results.filter(x => x.status === 'rejected');

  failed.forEach(x => console.error('lead: Telegram не прийняв —', x.reason && x.reason.message));

  if (failed.length === results.length) {
    res.status(502).json({ ok: false, error: 'telegram' });
    return;
  }

  res.status(200).json({ ok: true });
};
