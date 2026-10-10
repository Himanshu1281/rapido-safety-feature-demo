// Rapido Safety - mock backend: SOS engine, escalation engine, mock ambulance partner APIs.
// Zero dependencies. Run: node index.js  (port 4000)
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 4000;
const SELF = `http://127.0.0.1:${PORT}`;

// Demo timings (production values in comments)
const CFG = {
  ackSlaMs: 20_000,        // P0 human callback SLA: 2 min
  escalateLeadMs: 20_000,  // unacknowledged -> Team Lead: 5 min
  escalateCityMs: 40_000,  // unacknowledged -> City Head: 15 min
  partnerTimeoutMs: 4_000, // ambulance partner must confirm: 60 s
};

// Ambulance partners in priority order. Fallback chain ends at 112 (ERSS), which always accepts.
const PARTNERS = [
  { id: 'blinkit', name: 'Blinkit Ambulance', failRate: 0.4 },
  { id: 'redhealth', name: 'Red Health', failRate: 0.3 },
  { id: 'erss112', name: '112 / 108 Emergency', failRate: 0 },
];

const incidents = new Map();
const captains = new Map(); // captainId -> { status, reason }
let seq = 1000;

const now = () => Date.now();
const log = (inc, actor, text) => inc.timeline.push({ t: now(), actor, text });

// ---------- SOS engine ----------
function createIncident(body) {
  const id = `INC-${++seq}`;
  const inc = {
    id,
    priority: 'P0',
    trigger: body.trigger || 'manual', // manual | crash_auto | crash_confirmed
    status: 'OPEN',                    // OPEN | ACKNOWLEDGED | RESOLVED | CANCELLED
    escalation: 'SAFETY_DESK',         // SAFETY_DESK | TEAM_LEAD | CITY_HEAD
    createdAt: now(),
    ackAt: null,
    agent: null,
    rider: body.rider || { id: 'R-1', name: 'Rider', phone: '+91-90000-00000' },
    captain: body.captain || { id: 'C-1', name: 'Captain', vehicle: 'KA-01-XX-0000' },
    ride: body.ride || { id: 'RIDE-1' },
    location: body.location || { lat: 17.4486, lng: 78.3908 },
    contactsNotified: [],
    ambulance: { status: 'REQUESTING', partner: null, eta: null, attempts: [] },
    timeline: [],
  };
  incidents.set(id, inc);
  log(inc, 'system', `SOS raised (${inc.trigger}). Ride snapshot frozen: ${inc.ride.id}, ${inc.captain.vehicle}`);

  // 1. Emergency contacts (mock SMS + call with live tracking link)
  for (const c of body.emergencyContacts || []) {
    inc.contactsNotified.push(c);
    log(inc, 'system', `SMS + call to ${c.name} (${c.phone}) with live tracking link`);
  }

  // 2. Captain on hold pending review
  captains.set(inc.captain.id, { status: 'ON_HOLD', reason: `Safety incident ${id}` });
  log(inc, 'system', `Captain ${inc.captain.name} placed ON HOLD pending review`);

  // 3. Route straight to P0 queue (bypasses normal support)
  log(inc, 'system', 'Routed to P0 Safety Desk queue (24x7)');

  // 4. Ambulance dispatch, unless rider explicitly said "only help, no ambulance"
  if (body.needAmbulance !== false) dispatchAmbulance(inc);
  else { inc.ambulance.status = 'NOT_REQUESTED'; }

  return inc;
}

async function dispatchAmbulance(inc) {
  for (const p of PARTNERS) {
    if (inc.status === 'CANCELLED') return;
    inc.ambulance.status = 'REQUESTING';
    log(inc, 'system', `Requesting ambulance from ${p.name}...`);
    const attempt = { partner: p.name, at: now(), result: 'pending' };
    inc.ambulance.attempts.push(attempt);
    try {
      const ctrl = new AbortController();
      const timer = setTimeout(() => ctrl.abort(), CFG.partnerTimeoutMs);
      const res = await fetch(`${SELF}/partners/${p.id}/dispatch`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ ref: inc.id, location: inc.location, patient: inc.rider.name }),
        signal: ctrl.signal,
      });
      clearTimeout(timer);
      const data = await res.json();
      if (!res.ok || !data.accepted) throw new Error(data.reason || 'rejected');
      attempt.result = 'accepted';
      Object.assign(inc.ambulance, {
        status: 'DISPATCHED', partner: p.name, bookingId: data.bookingId,
        eta: data.etaMin, vehicle: data.vehicle, hospital: data.hospital,
      });
      log(inc, p.name, `Ambulance ${data.vehicle} dispatched. ETA ${data.etaMin} min -> ${data.hospital}`);
      return;
    } catch (e) {
      attempt.result = e.name === 'AbortError' ? 'timeout' : 'failed';
      log(inc, 'system', `${p.name} ${attempt.result}. Falling back to next partner`);
    }
  }
  inc.ambulance.status = 'FAILED';
  log(inc, 'system', 'All partners failed. Safety desk must call 112 manually');
}

// ---------- Escalation engine ----------
setInterval(() => {
  for (const inc of incidents.values()) {
    if (inc.status !== 'OPEN') continue;
    const age = now() - inc.createdAt;
    if (age > CFG.escalateCityMs && inc.escalation !== 'CITY_HEAD') {
      inc.escalation = 'CITY_HEAD';
      log(inc, 'escalation', 'Unacknowledged. ESCALATED to City Head');
    } else if (age > CFG.escalateLeadMs && inc.escalation === 'SAFETY_DESK') {
      inc.escalation = 'TEAM_LEAD';
      log(inc, 'escalation', 'Ack SLA breached. ESCALATED to Team Lead');
    }
  }
  // Ambulance ETA countdown (1 tick = 1 "minute" in demo)
  for (const inc of incidents.values()) {
    const a = inc.ambulance;
    if (a.status === 'DISPATCHED' && a.eta > 0 && inc.status !== 'CANCELLED') {
      a.eta -= 1;
      if (a.eta === 0) { a.status = 'ARRIVED'; log(inc, a.partner, 'Ambulance arrived at location'); }
    }
  }
}, 3000);

// ---------- Mock ambulance partner API ----------
function partnerDispatch(id, body, res) {
  const p = PARTNERS.find((x) => x.id === id);
  if (!p) return send(res, 404, { accepted: false, reason: 'unknown partner' });
  const latency = 500 + Math.random() * 1500;
  const fail = Math.random() < p.failRate;
  setTimeout(() => {
    if (fail) {
      // Half of failures are silent (no response -> caller timeout), half are explicit rejections
      if (Math.random() < 0.5) return; // hang
      return send(res, 503, { accepted: false, reason: 'no ambulance available nearby' });
    }
    send(res, 200, {
      accepted: true,
      bookingId: `${id.toUpperCase()}-${Math.floor(Math.random() * 1e6)}`,
      etaMin: 6 + Math.floor(Math.random() * 8),
      vehicle: `TS-09-AMB-${Math.floor(1000 + Math.random() * 9000)}`,
      hospital: ['Apollo Jubilee Hills', 'KIMS Gachibowli', 'Care Hospitals Hi-Tech City'][Math.floor(Math.random() * 3)],
    });
  }, latency);
}

// ---------- HTTP ----------
function send(res, code, obj) {
  if (res.writableEnded) return;
  res.writeHead(code, {
    'content-type': 'application/json',
    'access-control-allow-origin': '*',
    'access-control-allow-headers': 'content-type',
    'access-control-allow-methods': 'GET,POST,OPTIONS',
  });
  res.end(JSON.stringify(obj));
}

function readBody(req) {
  return new Promise((resolve) => {
    let d = '';
    req.on('data', (c) => (d += c));
    req.on('end', () => { try { resolve(d ? JSON.parse(d) : {}); } catch { resolve({}); } });
  });
}

const view = (inc) => ({ ...inc, ageMs: now() - inc.createdAt, slaMs: CFG.ackSlaMs, captainState: captains.get(inc.captain.id) });

http.createServer(async (req, res) => {
  const url = new URL(req.url, SELF);
  const parts = url.pathname.split('/').filter(Boolean);
  if (req.method === 'OPTIONS') return send(res, 204, {});

  if (req.method === 'GET' && (url.pathname === '/' || url.pathname === '/dashboard')) {
    res.writeHead(200, { 'content-type': 'text/html' });
    return fs.createReadStream(path.join(__dirname, 'dashboard.html')).pipe(res);
  }

  if (parts[0] === 'partners' && parts[2] === 'dispatch' && req.method === 'POST') {
    return partnerDispatch(parts[1], await readBody(req), res);
  }

  if (parts[0] === 'api') {
    if (parts[1] === 'sos' && req.method === 'POST') {
      const inc = createIncident(await readBody(req));
      console.log(`[SOS] ${inc.id} ${inc.trigger} rider=${inc.rider.name}`);
      return send(res, 201, view(inc));
    }
    if (parts[1] === 'incidents' && !parts[2] && req.method === 'GET') {
      return send(res, 200, [...incidents.values()].reverse().map(view));
    }
    const inc = parts[1] === 'incidents' && incidents.get(parts[2]);
    if (parts[1] === 'incidents' && !inc) return send(res, 404, { error: 'not found' });
    if (inc && !parts[3] && req.method === 'GET') return send(res, 200, view(inc));
    if (inc && req.method === 'POST') {
      const body = await readBody(req);
      if (parts[3] === 'ack' && inc.status === 'OPEN') {
        inc.status = 'ACKNOWLEDGED'; inc.ackAt = now(); inc.agent = body.agent || 'Safety Agent';
        const secs = Math.round((inc.ackAt - inc.createdAt) / 1000);
        log(inc, inc.agent, `Acknowledged in ${secs}s. Calling rider now${secs * 1000 > CFG.ackSlaMs ? ' (SLA BREACHED)' : ''}`);
      } else if (parts[3] === 'location' && typeof body.lat === 'number') {
        inc.location = { lat: body.lat, lng: body.lng };
        log(inc, 'system', 'Precise GPS fix received from rider phone');
      } else if (parts[3] === 'note') {
        log(inc, inc.agent || 'Safety Agent', body.text || '');
      } else if (parts[3] === 'resolve') {
        inc.status = 'RESOLVED';
        log(inc, inc.agent || 'Safety Agent', 'Resolved. Insurance claim pre-filled; 24h follow-up scheduled');
      } else if (parts[3] === 'cancel') {
        inc.status = 'CANCELLED';
        log(inc, 'rider', "Rider tapped \"I'm okay\". Ambulance cancelled; desk will still call back");
      }
      return send(res, 200, view(inc));
    }
  }
  send(res, 404, { error: 'not found' });
}).listen(PORT, '0.0.0.0', () => console.log(`Rapido Safety server: http://localhost:${PORT}  (dashboard at /)`));
