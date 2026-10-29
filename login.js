const enc = new TextEncoder();
const DAYS = 7; // الدخول يفضل شغال كام يوم على نفس الجهاز

async function sign(value, secret) {
  const key = await crypto.subtle.importKey(
    'raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
  );
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(value));
  return [...new Uint8Array(sig)].map(b => b.toString(16).padStart(2, '0')).join('');
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const real = process.env.SITE_PASSWORD;
  const secret = process.env.AUTH_SECRET;
  if (!real || !secret) return res.status(500).json({ ok: false });

  let body = req.body;
  if (typeof body === 'string') { try { body = JSON.parse(body); } catch { body = {}; } }
  const given = String(body?.password ?? '');

  // مقارنة ثابتة الزمن عن طريق مقارنة بصمتين
  const a = await sign('cmp', given + secret);
  const b = await sign('cmp', real + secret);
  if (a !== b) {
    await new Promise(r => setTimeout(r, 800)); // تبطيء المحاولات الغلط
    return res.status(401).json({ ok: false });
  }

  const exp = Date.now() + DAYS * 24 * 3600 * 1000;
  const token = exp + '.' + (await sign('v1.' + exp, secret + real));
  res.setHeader(
    'Set-Cookie',
    `auth=${token}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${DAYS * 24 * 3600}`
  );
  return res.status(200).json({ ok: true });
}
