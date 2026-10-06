import { getStore } from '@netlify/blobs';

const ID = /^[0-9a-f]{40}$/;

const json = (data, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' },
  });

// 管理者パスワードは Netlify の環境変数 ADMIN_PASSWORD に設定（コードには書かない）
function isAdmin(pw) {
  const real = process.env.ADMIN_PASSWORD || '';
  if (!real || typeof pw !== 'string' || pw.length !== real.length) return false;
  let diff = 0;
  for (let i = 0; i < real.length; i++) diff |= real.charCodeAt(i) ^ pw.charCodeAt(i);
  return diff === 0;
}
const wait = ms => new Promise(r => setTimeout(r, ms));

export default async (req) => {
  if (req.method !== 'POST') return new Response('Not found', { status: 404 });
  const { pathname } = new URL(req.url);

  let body = {};
  try { body = await req.json(); } catch {}

  // 管理者ログイン確認
  if (pathname === '/api/admin') {
    if (isAdmin(body.pw)) return json({ ok: true });
    await wait(800); // 総当たり対策
    return json({ error: 'パスワードが違います。' }, 401);
  }

  const id = String(body.id || '');
  if (!ID.test(id)) return json({ error: '不正なリクエストです。' }, 400);
  const store = getStore('handoff');

  // 保存（管理者のみ）：中身はブラウザ側で暗号化済み
  if (pathname === '/api/put') {
    if (!isAdmin(body.pw)) return json({ error: '管理者としてログインし直してください。' }, 401);
    const blob = String(body.blob || '');
    if (!blob || blob.length > 8000) return json({ error: '内容が大きすぎます。' }, 400);
    if (await store.get(id)) return json({ error: 'もう一度お試しください。' }, 409);
    await store.setJSON(id, { blob, created: Date.now() });
    return json({ ok: true });
  }

  // 受け取り（誰でも・何度でも・期限なし）
  if (pathname === '/api/take') {
    const d = await store.get(id, { type: 'json' });
    if (!d) return json({ error: 'パスワードが違うか、見つかりません。' }, 404);
    return json({ blob: d.blob });
  }

  return new Response('Not found', { status: 404 });
};

export const config = { path: ['/api/admin', '/api/put', '/api/take'] };
