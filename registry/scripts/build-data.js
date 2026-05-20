'use strict';

/**
 * KSR build-data.js
 * MongoDB `mergedTimes` → registry/MVP/js/data.js
 *
 * Usage:  node build-data.js
 * Output: ../MVP/js/data.js  (window.KSR_DATA)
 */

require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });

const { MongoClient } = require('mongodb');
const fs   = require('fs');
const path = require('path');

// ── Config ────────────────────────────────────────────────────
const MONGO_ADDR = process.env.MONGODB_ADDR        || '221.143.48.153:4529';
const MONGO_USER = process.env.MONGO_USERNAME      || 'mscadmin';
const MONGO_PASS = process.env.MONGO_PWD           || '~Mscadmin';
const DB_NAME    = process.env.MONGO_DBNAME_BR     || 'Breaststroke';
const COLLECTION = 'mergedTimes';
const OUTPUT        = path.join(__dirname, '../MVP/js/data.js');
const OUTPUT_ERRATA = path.join(__dirname, '../MVP/js/errata.js');
const OUTPUT_JSON        = path.join(__dirname, '../app/public/data.json');
const OUTPUT_ERRATA_JSON = path.join(__dirname, '../app/public/errata.json');

// ── Field maps ────────────────────────────────────────────────
const DISCIPLINE_MAP = {
  BR: 'breast', FR: 'free', BK: 'back', FL: 'fly', IM: 'im',
};
const GROUP_MAP = {
  '일반부': 'adult', '고등부': 'high', '중등부': 'mid',
  '초등부': 'elem',  '유년부': 'youth',
};
const GENDER_MAP = { men: 'm', women: 'f' };

const STROKE_LABEL = {
  breast: '평영', free: '자유형', back: '배영', fly: '접영', im: '개인혼영',
};
const GENDER_LABEL = { m: '남자', f: '여자' };

// ── Time utilities ────────────────────────────────────────────
function timeToMs(t) {
  if (!t || typeof t !== 'string') return Infinity;
  const parts = t.trim().split(':');
  try {
    if (parts.length === 2) {
      // mm:ss.dd
      const mm = parseInt(parts[0], 10);
      const [ss, dd = '00'] = parts[1].split('.');
      return (mm * 60 + parseInt(ss, 10)) * 1000
           + parseInt(dd.padEnd(2, '0').slice(0, 2), 10) * 10;
    }
    if (parts.length === 3) {
      // hh:mm:ss.dd
      const hh = parseInt(parts[0], 10);
      const mm = parseInt(parts[1], 10);
      const [ss, dd = '00'] = parts[2].split('.');
      return (hh * 3600 + mm * 60 + parseInt(ss, 10)) * 1000
           + parseInt(dd.padEnd(2, '0').slice(0, 2), 10) * 10;
    }
  } catch (_) { /* fall through */ }
  return Infinity;
}

// ── Meet short name ───────────────────────────────────────────
function meetShort(name) {
  if (!name) return '—';
  let s = name.trim();
  // "제NN회 ..." → "NN회 ..."
  s = s.replace(/^제(\d+)회\s*/, '$1회 ');
  // "20YY ..." or "YYYY ..." → "YY ..."
  s = s.replace(/^(20)(\d{2})\s*/, '$2 ');
  // truncate
  if (s.length > 16) s = s.slice(0, 15).trimEnd() + '…';
  return s.trim();
}

// ── Event helpers ─────────────────────────────────────────────
function eventId(gender, stroke, distance, course) {
  return `${gender}-${stroke}-${distance}-${course}`;
}
function eventLabel(gender, stroke, distance, course) {
  return `${GENDER_LABEL[gender]} ${STROKE_LABEL[stroke]} ${distance}M ${course.toUpperCase()}`;
}

// ── Rank assignment (ties share rank) ─────────────────────────
function assignRanks(entries) {
  let rank = 1;
  for (let i = 0; i < entries.length; i++) {
    if (i > 0 && entries[i].time_ms !== entries[i - 1].time_ms) rank = i + 1;
    entries[i].rank = rank;
  }
}

// ── Build one event entry ─────────────────────────────────────
function buildEvent(gender, stroke, distance, course, records) {
  // Best time per athlete (name + gender + group as identity)
  const best = new Map();
  for (const r of records) {
    const key = `${r.name}||${r.gender}||${r.group}`;
    if (!best.has(key) || r.time_ms < best.get(key).time_ms) best.set(key, r);
  }

  const sorted = [...best.values()]
    .filter(r => r.time_ms !== Infinity)
    .sort((a, b) => a.time_ms - b.time_ms)
    .slice(0, 100);

  assignRanks(sorted);

  return {
    label:    eventLabel(gender, stroke, distance, course),
    id:       eventId(gender, stroke, distance, course),
    gender, stroke, distance, course,
    ranks: sorted.map(r => ({
      rank:      r.rank,
      name:      r.name    || '—',
      city:      r.sido    || '—',
      team:      r.team    || '—',
      date:      r.datetime ? String(r.datetime).slice(0, 10) : '—',
      time:      r.time    || '—',
      meet:      meetShort(r.competitionName),
      meet_full: r.competitionName || '—',
    })),
  };
}

// ── Build sheet map (sheet key → event array) ─────────────────
function buildSheets(records) {
  // Bucket by every relevant sheet key
  const buckets = {};
  const add = (key, r) => {
    (buckets[key] = buckets[key] || []).push(r);
  };

  for (const r of records) {
    add('all',                        r);  // 전체부문 전연령
    add(r.division,                   r);  // elite | masters (전연령)
    add(r.group,                      r);  // adult|high|mid|elem|youth (전부문)
    add(`${r.division}-${r.group}`,   r);  // elite-adult, elite-high, ...
  }

  const sheets = {};
  for (const [sheetKey, recs] of Object.entries(buckets)) {
    // Group by event (gender+stroke+distance+course)
    const evMap = new Map();
    for (const r of recs) {
      const eid = eventId(r.gender, r.stroke, r.distance, r.course);
      if (!evMap.has(eid)) {
        evMap.set(eid, { gender: r.gender, stroke: r.stroke, distance: r.distance, course: r.course, recs: [] });
      }
      evMap.get(eid).recs.push(r);
    }
    sheets[sheetKey] = [...evMap.values()]
      .map(e => buildEvent(e.gender, e.stroke, e.distance, e.course, e.recs))
      .sort((a, b) => a.label.localeCompare(b.label, 'ko'));
  }
  return sheets;
}

// ── Main ──────────────────────────────────────────────────────
async function main() {
  const uri = `mongodb://${encodeURIComponent(MONGO_USER)}:${encodeURIComponent(MONGO_PASS)}@${MONGO_ADDR}/${DB_NAME}?authSource=admin`;
  const client = new MongoClient(uri);

  console.log(`Connecting to ${MONGO_ADDR} …`);
  await client.connect();

  const db   = client.db(DB_NAME);
  const col  = db.collection(COLLECTION);
  const docs = await col.find({ round: 'finals' }).toArray();
  console.log(`Fetched ${docs.length} finals records`);

  // ── Errata ────────────────────────────────────────────────
  const errataRaw = await db.collection('errata').find({}).sort({ no: 1 }).toArray();
  console.log(`Fetched ${errataRaw.length} errata entries`);

  await client.close();

  // Normalize mergedTimes
  const records = docs
    .map(d => ({
      ...d,
      division: d.isMasters ? 'masters' : 'elite',
      group:    GROUP_MAP[d.group]           || 'adult',
      gender:   GENDER_MAP[d.gender]         || d.gender,
      stroke:   DISCIPLINE_MAP[d.discipline] || null,
      distance: parseInt(d.distance, 10),
      course:   (d.course || '').toLowerCase(),
      time_ms:  timeToMs(d.time),
    }))
    .filter(r => r.stroke && r.gender && r.distance && r.course && r.time_ms !== Infinity);

  console.log(`Valid records: ${records.length}`);

  const sheets = buildSheets(records);

  const js = `window.KSR_DATA = ${JSON.stringify(sheets, null, 1)};\n`;
  fs.writeFileSync(OUTPUT, js, 'utf8');

  const kb = (fs.statSync(OUTPUT).size / 1024).toFixed(1);
  console.log(`\nWritten → ${OUTPUT}  (${kb} KB)\n`);

  fs.mkdirSync(path.dirname(OUTPUT_JSON), { recursive: true });
  fs.writeFileSync(OUTPUT_JSON, JSON.stringify(sheets), 'utf8');
  const jsonKb = (fs.statSync(OUTPUT_JSON).size / 1024).toFixed(1);
  console.log(`Written → ${OUTPUT_JSON}  (${jsonKb} KB)`);

  // Summary
  const ORDER = ['all', 'elite', 'masters', 'adult', 'elite-adult', 'masters-adult',
                  'high', 'elite-high', 'mid', 'elite-mid', 'elem', 'elite-elem',
                  'youth', 'elite-youth'];
  const keys = [...ORDER.filter(k => sheets[k]), ...Object.keys(sheets).filter(k => !ORDER.includes(k))];
  for (const k of keys) {
    const v = sheets[k];
    const totalRanks = v.reduce((s, e) => s + e.ranks.length, 0);
    console.log(`  ${k.padEnd(16)} ${String(v.length).padStart(3)} events  ${String(totalRanks).padStart(6)} ranks`);
  }

  // ── Write errata.js ───────────────────────────────────────
  const errata = errataRaw.map(d => ({
    no:          d.no,
    category:    d.category    || '',
    time:        d.time        || {},
    reporter:    d.reporter    || '—',
    report_date: d.report_date || '—',
    magazine:    d.magazine    || '—',
  }));

  const errataJs = `window.KSR_ERRATA = ${JSON.stringify(errata, null, 1)};\n`;
  fs.writeFileSync(OUTPUT_ERRATA, errataJs, 'utf8');

  const errataKb = (fs.statSync(OUTPUT_ERRATA).size / 1024).toFixed(1);
  console.log(`\nWritten → ${OUTPUT_ERRATA}  (${errataKb} KB)`);
  console.log(`  errata            ${String(errata.length).padStart(3)} entries`);

  fs.writeFileSync(OUTPUT_ERRATA_JSON, JSON.stringify(errata), 'utf8');
  console.log(`Written → ${OUTPUT_ERRATA_JSON}`);
}

main().catch(err => { console.error(err); process.exit(1); });
