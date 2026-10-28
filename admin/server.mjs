// Local-only admin server for config/site-config.json.
// Run with `npm run admin`. Binds to 127.0.0.1, never deployed (not under public/).
import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const CONFIG_PATH = path.join(root, 'config', 'site-config.json');
const REGISTRY_PATH = path.join(root, 'config', 'registry.json');
const PORT = Number(process.env.ADMIN_PORT || 4321);
const HOST = '127.0.0.1';
const PHASES = ['preseason', 'season', 'offseason'];
const STATES = ['on', 'soon', 'hidden'];

const readJson = async p => JSON.parse(await fs.readFile(p, 'utf8'));
const send = (res, code, body, type = 'application/json') => {
  res.writeHead(code, { 'Content-Type': type, 'Cache-Control': 'no-store' });
  res.end(typeof body === 'string' ? body : JSON.stringify(body));
};

function validate(cfg, registry) {
  if (!cfg || typeof cfg !== 'object') return 'Config must be an object';
  if (typeof cfg.season !== 'string' || !cfg.season) return 'season must be a non-empty string';
  if (!PHASES.includes(cfg.phase)) return `phase must be one of ${PHASES.join(', ')}`;
  const out = { season: cfg.season, phase: cfg.phase, sources: {}, sections: {} };
  for (const s of registry.sources) {
    if (typeof cfg.sources?.[s.id] !== 'boolean') return `sources.${s.id} must be true/false`;
    out.sources[s.id] = cfg.sources[s.id];
  }
  for (const s of registry.sections) {
    if (!STATES.includes(cfg.sections?.[s.id])) return `sections.${s.id} must be one of ${STATES.join(', ')}`;
    out.sections[s.id] = cfg.sections[s.id];
  }
  return out;
}

const server = http.createServer(async (req, res) => {
  try {
    // Reject anything not addressed to localhost (DNS-rebinding guard).
    const host = (req.headers.host || '').split(':')[0];
    if (host !== '127.0.0.1' && host !== 'localhost') return send(res, 403, { error: 'forbidden' });

    if (req.method === 'GET' && (req.url === '/' || req.url === '/index.html')) {
      return send(res, 200, await fs.readFile(path.join(root, 'admin', 'index.html'), 'utf8'), 'text/html; charset=utf-8');
    }
    if (req.method === 'GET' && req.url === '/api/state') {
      return send(res, 200, { registry: await readJson(REGISTRY_PATH), config: await readJson(CONFIG_PATH) });
    }
    if (req.method === 'POST' && req.url === '/api/config') {
      if (req.headers['x-admin'] !== '1') return send(res, 403, { error: 'forbidden' });
      let raw = '';
      for await (const chunk of req) raw += chunk;
      const result = validate(JSON.parse(raw), await readJson(REGISTRY_PATH));
      if (typeof result === 'string') return send(res, 400, { error: result });
      await fs.writeFile(CONFIG_PATH, JSON.stringify(result, null, 2) + '\n');
      return send(res, 200, { ok: true, config: result });
    }
    send(res, 404, { error: 'not found' });
  } catch (err) {
    send(res, 500, { error: String(err.message || err) });
  }
});

server.listen(PORT, HOST, () => {
  console.log(`Admin running at http://${HOST}:${PORT}  (Ctrl+C to stop)`);
  console.log('Edits config/site-config.json. Rebuild or restart `npm run dev` to see changes.');
});
