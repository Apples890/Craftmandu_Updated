import { createClient } from '@supabase/supabase-js';

const url = process.env.SUPABASE_URL!;
const anon = process.env.SUPABASE_ANON_KEY!;
const service = process.env.SUPABASE_SERVICE_ROLE_KEY!;

async function main() {
  console.log('Using', { url });

  // 1) anon access (should be able to read public resources like active products)
  const anonDb = createClient(url, anon);
  const { data: p, error: pingErr } = await anonDb.from('products').select('*').eq('status','ACTIVE').limit(1);
  console.log('Anon select products =>', pingErr ? 'ERROR' : 'OK', pingErr?.message || '', p?.length || 0);

  // 2) service role access (should bypass RLS; be careful in prod)
  const srvDb = createClient(url, service);
  const { count, error: srvErr } = await srvDb.from('users').select('*', { count: 'exact', head: true });
  console.log('Service count users =>', srvErr ? 'ERROR' : `OK (count: ${count})`, srvErr?.message || '');

  // 3) storage sanity
  const bucket = process.env.TEST_BUCKET || 'public';
  const blob = typeof Blob !== 'undefined' ? new Blob(['ok']) : (Buffer.from('ok') as any);
  const { data: up, error: upErr } = await srvDb.storage.from(bucket).upload(`health/${Date.now()}.txt`, blob, { upsert: true, contentType: 'text/plain' });
  if (upErr) {
    console.log('Storage upload => ERROR', upErr.message);
  } else {
    console.log('Storage upload => OK', up?.path);
  }
}

main().catch((e) => { console.error('Fatal:', e); process.exit(1); });
