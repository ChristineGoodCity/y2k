import { readFileSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import assert from 'node:assert/strict';
const env = Object.fromEntries(readFileSync('.env.local', 'utf8').trim().split('\n').map(line => {
  const i = line.indexOf('='); return [line.slice(0, i), line.slice(i + 1)];
}));
const base = new URL('/wp-json/wp/v2/', env.WORDPRESS_GRAPHQL_URL);
const api = (path) => fetch(new URL(path, base));
// Local test fixtures use Docker, never application credentials in Next.js.
function wordpress(code, data) {
  const input = Buffer.from(JSON.stringify(data)).toString('base64');
  const result = execFileSync('docker', ['compose', 'exec', '-T', 'wordpress', 'php', '-r',
    `require "/var/www/html/wp-load.php"; $data=json_decode(base64_decode("${input}"),true); ${code}`], { encoding: 'utf8' });
  return JSON.parse(result);
}
const pages = await (await api('pages?acf_format=standard')).json();
const home = pages.find(page => new URL(page.link).pathname === '/');
const intro = home.acf.page_builder.find(row => row.acf_fc_layout === 'intro');
const collection = home.acf.page_builder.find(row => row.acf_fc_layout === 'collection');
assert.ok(intro.heading);
assert.ok(collection.cards.length);
const homepage = await fetch('http://localhost:3000').then(r => r.text());
assert.ok(homepage.includes(intro.heading));
for (const card of collection.cards) assert.ok(homepage.includes(card.name));
assert.equal((await api(`pages/${home.id}?context=edit`)).status, 401);
for (const type of ['intro', 'collection', 'collection_card']) assert.equal((await api(type)).status, 404);
assert.ok(!('page_sections' in home.acf));
assert.ok(!('use_page_builder' in home.acf));
assert.equal((await fetch('http://localhost:3000/api/preview?id=1')).status, 404);
assert.equal((await fetch('http://localhost:3000/api/exit-preview')).status, 404);
assert.equal((await fetch('http://localhost:3000/this-page-does-not-exist')).status, 404);
const fixtures = [];
async function create(data) {
  const id = wordpress('$id=wp_insert_post(["post_type"=>"page","post_title"=>$data["title"],"post_status"=>$data["status"]],true); if(is_wp_error($id))throw new Exception($id->get_error_message()); update_field("field_page_builder",$data["acf"]["page_builder"],$id); echo json_encode($id);', data);
  fixtures.push(id);
  if (data.status === 'draft') return { id };
  return (await api(`pages/${id}?acf_format=standard`)).json();
}
async function update(id, acf) {
  wordpress('update_field("field_page_builder",$data["acf"]["page_builder"],$data["id"]); echo "true";', { id, acf });
}
try {
  const sections = [
    { acf_fc_layout: 'intro', heading: 'INLINE-FIRST', description: '', collector_enabled: false },
    { acf_fc_layout: 'collection', label: 'INLINE-COLLECTION', cards: [
      { name: 'INLINE-CARD-A', angle: 42, tilt: 64, distance: 120 },
      { name: 'INLINE-CARD-B', angle: 0, tilt: 75, distance: 110 },
    ] },
    { acf_fc_layout: 'intro', heading: 'INLINE-LAST' },
  ];
  const page = await create({ title: 'Inline builder integration test', status: 'publish', acf: { page_builder: sections } });
  const url = `http://localhost:3000${new URL(page.link).pathname}`;
  const response = await fetch(url);
  let html = await response.text();
  if (!response.ok) writeFileSync('/tmp/y2k-builder-error.html', html);
  assert.equal(response.status, 200);
  assert.ok(html.indexOf('INLINE-FIRST') < html.indexOf('INLINE-COLLECTION'));
  assert.ok(html.indexOf('INLINE-COLLECTION') < html.indexOf('INLINE-LAST'));
  assert.ok(html.includes('INLINE-FIRST') && html.includes('INLINE-LAST'));
  assert.ok(html.indexOf('INLINE-CARD-A') < html.indexOf('INLINE-CARD-B'));
  assert.equal(page.acf.page_builder[0].description, '');
  assert.equal(Number(page.acf.page_builder[1].cards[0].angle), 42);
  sections[1].cards.reverse();
  await update(page.id, { page_builder: [sections[2], sections[1], sections[0]] });
  html = await fetch(url).then(r => r.text());
  assert.ok(html.indexOf('INLINE-LAST') < html.indexOf('INLINE-FIRST'));
  assert.ok(html.indexOf('INLINE-CARD-B') < html.indexOf('INLINE-CARD-A'));
  await update(page.id, { page_builder: [{ ...sections[1], cards: [] }] });
  html = await fetch(url).then(r => r.text());
  assert.ok(!html.includes('INLINE-CARD-A'));
  await update(page.id, { page_builder: [] });
  html = await fetch(url).then(r => r.text());
  assert.ok(!html.includes('INLINE-FIRST') && !html.includes('INLINE-COLLECTION'));
  const draft = await create({ title: 'Inline draft integration test', status: 'draft', acf: { page_builder: [sections[0]] } });
  assert.equal((await api(`pages/${draft.id}`)).status, 401);
  assert.equal((await fetch(`http://localhost:3000/?preview_id=${draft.id}&preview=true`)).status, 200);
  const publicHome = await fetch(`http://localhost:3000/?preview_id=${draft.id}&preview=true`).then(r => r.text());
  assert.ok(!publicHome.includes('INLINE-FIRST'));
  console.log('PASS: migrated homepage, removed legacy endpoints, inline sections/cards, ordering, camera settings, empty content, draft protection, removed preview routes and 404s.');
} finally {
  for (const id of fixtures.reverse()) wordpress('wp_delete_post($data,true); echo "true";', id);
}
