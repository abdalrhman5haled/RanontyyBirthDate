import { next } from '@vercel/functions';

// كل الصفحات والصور والملفات محمية، ما عدا صفحة الدخول وطلب الدخول نفسه
export const config = {
  matcher: ['/((?!login.html|api/login|favicon.ico).*)'],
};

const enc = new TextEncoder();

async function sign(value, secret) {
  const key = await crypto.subtle.importKey(
    'raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
  );
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(value));
  return [...new Uint8Array(sig)].map(b => b.toString(16).padStart(2, '0')).join('');
}

export default async function middleware(request) {
  const secret = process.env.AUTH_SECRET;
  const pass = process.env.SITE_PASSWORD;
  const cookie = request.headers.get('cookie') || '';
  const m = cookie.match(/(?:^|;\s*)auth=([^;]+)/);

  if (m && secret && pass) {
    const [exp, sig] = m[1].split('.');
    if (Number(exp) > Date.now() && sig === (await sign('v1.' + exp, secret + pass))) {
      return next(); // الباسورد صح: كمّل وافتح الموقع
    }
  }
  return Response.redirect(new URL('/login.html', request.url), 302);
}
