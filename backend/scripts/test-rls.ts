import { createClient } from '@supabase/supabase-js';

const url = process.env.SUPABASE_URL!;
const anon = process.env.SUPABASE_ANON_KEY!;
const token = process.env.ACCESS_TOKEN; // Supabase user access token

async function main() {
  const anonDb = createClient(url, anon);
  const jwtDb = token ? createClient(url, anon, { global: { headers: { Authorization: `Bearer ${token}` } } }) : null;

  // Expect limited or empty without token
  const { data: oAnon, error: eAnon } = await anonDb.from('orders').select('*').limit(3);
  console.log('Orders as anon =>', eAnon ? 'ERROR' : 'OK', eAnon?.message || '', (oAnon || []).length);

  if (jwtDb) {
    const { data: oMe, error: eMe } = await jwtDb.from('orders').select('*').order('placed_at', { ascending: false }).limit(3);
    console.log('Orders as user (JWT) =>', eMe ? 'ERROR' : 'OK', eMe?.message || '', (oMe || []).length);
  } else {
    console.log('Skip user JWT test: set ACCESS_TOKEN to a Supabase access token');
  }
}

main().catch((e) => { console.error('Fatal:', e); process.exit(1); });
