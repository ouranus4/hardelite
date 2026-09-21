/* =========================================================
   HARDELITE — приймання заявок у Telegram

   Токен бота НЕ зберігається в коді. Він живе у Vercel:
   Settings → Environment Variables
     TELEGRAM_BOT_TOKEN — токен від @BotFather
     TELEGRAM_CHAT_ID   — куди надсилати заявки
   ========================================================= */

const MAX = 300;

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
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
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

  try {
    const r = await fetch('https://api.telegram.org/bot' + token + '/sendMessage', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: rows.join('\n'),
        parse_mode: 'HTML',
        disable_web_page_preview: true
      })
    });

    const data = await r.json().catch(() => ({}));

    if (!r.ok || !data.ok) {
      console.error('lead: Telegram повернув помилку', r.status, JSON.stringify(data));
      res.status(502).json({ ok: false, error: 'telegram' });
      return;
    }
  } catch (err) {
    console.error('lead: не вдалося достукатися до Telegram', err);
    res.status(502).json({ ok: false, error: 'network' });
    return;
  }

  res.status(200).json({ ok: true });
};
