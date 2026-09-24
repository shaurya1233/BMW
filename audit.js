// Validates data JSON against the model contract and fails on unapproved file extensions.
import { readFileSync, readdirSync, statSync } from 'node:fs'
const OK = new Set(['ts', 'tsx', 'js', 'jsx', 'glsl', 'vert', 'frag', 'html', 'scss', 'css', 'graphql', 'json', 'sql', 'yml', 'md'])
const BIN = new Set(['glb', 'ktx2', 'hdr', 'webp', 'woff2', 'svg', 'wasm']) // client/vendor supplied, list in docs
const NAMES = new Set(['.gitignore', '.env.example', 'package-lock.json'])
const bad = [], fail = (m) => bad.push(m)
for (const f of readdirSync('.', { recursive: true })) {
  const p = String(f).replaceAll('\\', '/')
  if (/(^|\/)(node_modules|dist|\.git)(\/|$)/.test(p) || statSync(p).isDirectory()) continue
  const name = p.split('/').pop(), ext = name.includes('.') ? name.split('.').pop() : ''
  if (!NAMES.has(name) && !OK.has(ext) && !BIN.has(ext)) fail(`Unapproved file: ${p}`)
}
const j = (p) => { try { return JSON.parse(readFileSync(p, 'utf8')) } catch (e) { fail(`${p}: ${e.message}`); return null } }
const map = j('data/model-map.json'), veh = j('data/vehicles.json'); j('data/showroom.json')
if (map) {
  for (const [n, p] of Object.entries(map.parts)) {
    if (!p.label || !['hinge', 'slide', 'spin', 'toggle', 'static'].includes(p.kind)) fail(`part ${n}: bad kind/label`)
    if (['hinge', 'spin'].includes(p.kind) && !(p.axis && typeof p.open === 'number')) fail(`part ${n}: needs axis and open`)
    if (p.kind === 'slide' && typeof p.open !== 'number') fail(`part ${n}: needs open`)
  }
  if (!map.parts[map.driverDoor]) fail('driverDoor is not a part')
  for (const [k, c] of Object.entries(map.cameras)) if (c.pos?.length !== 3 || c.target?.length !== 3) fail(`camera ${k}: needs pos and target`)
  for (const t of map.tour) { if (t.do === 'toggle' && !map.parts[t.id]) fail(`tour: unknown part ${t.id}`); if (t.do === 'view' && !map.cameras[t.id]) fail(`tour: unknown view ${t.id}`) }
}
if (veh) for (const g of ['paints', 'seats', 'wheels']) for (const o of veh[g]) if (!/^#[0-9a-f]{6}$/i.test(o.hex)) fail(`${g}/${o.id}: bad hex`)
if (bad.length) { console.error(bad.join('\n')); process.exit(1) }
console.log('audit ok')
