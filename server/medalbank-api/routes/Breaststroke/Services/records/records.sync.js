// 외부(수영연맹, World Aquatics)에서 읽은 신기록을 Breaststroke.records 와 비교/반영하는 공통 로직
const mongoCFG = require('../../Config/mongoCFG');
const mongoDB  = require('../../Class/MongoDB');
const mongodb  = new mongoDB(mongoCFG.Breaststroke.database);

//-------------------------------------------------------------
// 기록 문자열 <-> 1/100초
//   DB 에는 "00:51.86" 과 "1:04.39" 가 섞여 있어 문자열이 아니라 1/100초로 비교한다.
//-------------------------------------------------------------
const toCentis = (time) => {
	const m = String(time || '').trim().match(/^(?:(\d{1,2}):)?(\d{1,2})\.(\d{1,3})$/);
	if (!m) return null;
	return Number(m[1] || 0) * 6000 + Number(m[2]) * 100 + Number((m[3] + '00').slice(0, 2));
};
const fromCentis = (c) => {
	const mm = Math.floor(c / 6000);
	const ss = Math.floor((c % 6000) / 100);
	const hh = c % 100;
	return `${String(mm).padStart(2, '0')}:${String(ss).padStart(2, '0')}.${String(hh).padStart(2, '0')}`;
};

// 전문체육(isMasters:false) 기록의 식별 key
const recordKey = (r) => [r.gender, r.discipline, r.course, r.distance, r.type].join('|');

//-------------------------------------------------------------
// DB 와 비교: new(신규) / faster(더 빠른 기록으로 갱신) / changed(더 느린 기록으로 정정)
//   기록(1/100초)이 같으면 이름 표기가 달라도 같은 기록으로 보고 건너뛴다.
//-------------------------------------------------------------
async function loadExisting(types) {
	const result = await mongodb.find(mongoCFG.Breaststroke.records, {
		query: { isMasters: false, type: { $in: types } },
		projection: { _id: 0 },
		limit: 20000,
		skip: 0,
		sort: {},
	});
	const map = new Map();
	for (const doc of result.data || []) {
		const key = recordKey(doc);
		if (!map.has(key)) map.set(key, []);
		map.get(key).push(doc);
	}
	return map;
}

async function diffRecords(records) {
	const types = [...new Set(records.map((r) => r.type))];
	const existing = await loadExisting(types);
	const items = [];

	for (const record of records) {
		const key = recordKey(record);
		const prev = existing.get(key) || [];
		const centis = toCentis(record.time);
		if (prev.some((p) => toCentis(p.time) === centis)) continue; // 동일 기록

		let status = 'new';
		if (prev.length) {
			const best = Math.min(...prev.map((p) => toCentis(p.time)).filter((c) => c !== null));
			status = centis < best ? 'faster' : 'changed';
		}
		items.push({ key, status, record, previous: prev[0] || null });
	}
	return items;
}

//-------------------------------------------------------------
// 선택한 key 만 반영. 기존 기록(같은 key)은 지우고 새 기록을 넣는다. createdAt 은 유지.
//-------------------------------------------------------------
async function applyItems(items, keys) {
	const wanted = new Set(keys || []);
	const now = new Date().toISOString();
	const applied = [];

	for (const item of items) {
		if (!wanted.has(item.key)) continue;
		const { record, previous } = item;
		if (previous) {
			await mongodb.deleteMany(mongoCFG.Breaststroke.records, {
				isMasters: false, gender: record.gender, discipline: record.discipline,
				course: record.course, distance: record.distance, type: record.type,
			});
		}
		await mongodb.insertOne(mongoCFG.Breaststroke.records, {
			...record,
			createdAt: (previous && previous.createdAt) || now,
			updateTimes: now,
		});
		applied.push(item.key);
	}
	return applied;
}

//-------------------------------------------------------------
// 직접 입력(JSON): 형식 검증 -> 이상 없으면 같은 key 기록을 입력한 내용으로 교체/추가
//-------------------------------------------------------------
const MANUAL = {
	types:       ['WR', 'OR', 'AR', 'KR'],
	genders:     ['men', 'women', 'mixed'],
	disciplines: ['FR', 'BA', 'BR', 'FL', 'IM', 'FRR', 'MR'],
	courses:     ['LCM', 'SCM'],
	distances:   ['25M', '50M', '100M', '200M', '400M', '800M', '1500M'],
	required:    ['type', 'gender', 'discipline', 'course', 'distance', 'time', 'name'],
	optional:    ['team', 'datetime', 'location'],
	maxItems:    500,
};

// input: 기록 객체 배열(또는 객체 1개). 반환: { records(정규화됨), errors:[{ index, field, message }] }
function validateManual(input) {
	const errors = [];
	const list = Array.isArray(input) ? input : (input && typeof input === 'object' ? [input] : null);
	if (!list) return { records: [], errors: [{ index: null, field: null, message: '기록 객체의 배열([ {...}, {...} ])이어야 합니다.' }] };
	if (list.length === 0) return { records: [], errors: [{ index: null, field: null, message: '기록이 하나도 없습니다.' }] };
	if (list.length > MANUAL.maxItems) return { records: [], errors: [{ index: null, field: null, message: `한 번에 최대 ${MANUAL.maxItems}건까지 입력할 수 있습니다.` }] };

	const allowed = new Set([...MANUAL.required, ...MANUAL.optional]);
	const records = [];
	const seen = new Map();

	list.forEach((item, index) => {
		const err = (field, message) => errors.push({ index, field, message });
		if (!item || typeof item !== 'object' || Array.isArray(item)) return err(null, '기록은 객체({ ... })여야 합니다.');

		for (const key of Object.keys(item)) {
			if (!allowed.has(key)) err(key, `알 수 없는 필드입니다. (사용 가능: ${[...allowed].join(', ')})`);
		}
		for (const key of MANUAL.required) {
			if (item[key] === undefined || item[key] === null || String(item[key]).trim() === '') err(key, '필수 항목입니다.');
		}

		const str = (key) => (item[key] === undefined || item[key] === null ? '' : String(item[key]).trim());
		const pick = (key, values, normalize) => {
			const v = normalize(str(key));
			if (str(key) && !values.includes(v)) err(key, `"${str(key)}" 는 사용할 수 없습니다. (${values.join(' | ')})`);
			return v;
		};

		const type       = pick('type', MANUAL.types, (v) => v.toUpperCase());
		const gender     = pick('gender', MANUAL.genders, (v) => v.toLowerCase());
		const discipline = pick('discipline', MANUAL.disciplines, (v) => v.toUpperCase());
		const course     = pick('course', MANUAL.courses, (v) => v.toUpperCase());
		const distance   = pick('distance', MANUAL.distances, (v) => v.toUpperCase());

		let time = '';
		if (str('time')) {
			const centis = toCentis(str('time'));
			if (centis === null || centis <= 0) err('time', `"${str('time')}" 는 기록 형식이 아닙니다. (예: "00:59.28", "1:04.39", "59.28")`);
			else time = fromCentis(centis);
		}

		const datetime = str('datetime');
		if (datetime && (!/^\d{4}-\d{2}-\d{2}$/.test(datetime) || Number.isNaN(Date.parse(datetime)))) {
			err('datetime', `"${datetime}" 는 날짜 형식이 아닙니다. (예: "2026-09-24")`);
		}

		const record = {
			isMasters: false,
			gender, course, distance, type, discipline,
			time,
			name: str('name'),
			team: str('team'),
			datetime,
			location: str('location'),
			timeStamp: time ? toCentis(time) / 100 / 86400 : 0,
		};

		const key = recordKey(record);
		if (type && gender && discipline && course && distance) {
			if (seen.has(key)) err(null, `${seen.get(key) + 1}번째 항목과 종류/성별/종목/코스/거리가 같습니다. (${key})`);
			else seen.set(key, index);
		}
		records.push(record);
	});

	return { records, errors };
}

const sameRecord = (a, b) => toCentis(a.time) === toCentis(b.time)
	&& (a.name || '') === (b.name || '') && (a.team || '') === (b.team || '')
	&& (a.datetime || '') === (b.datetime || '') && (a.location || '') === (b.location || '');

// 직접 입력한 기록을 DB 와 비교한다 (DB 는 변경하지 않음).
//   new: DB 에 없던 기록 / faster: 더 빠른 기록으로 갱신 / changed: 더 느린 기록으로 정정 / info: 기록은 같고 이름·팀·일자·장소만 다름
//   모든 항목이 기존과 같으면 목록에서 빠지고 unchanged 로 센다.
async function diffManual(records) {
	const existing = await loadExisting([...new Set(records.map((r) => r.type))]);
	const items = [];
	let unchanged = 0;
	for (const record of records) {
		const key = recordKey(record);
		const prev = existing.get(key) || [];
		if (prev.length === 0) { items.push({ key, status: 'new', record, previous: null }); continue; }
		if (prev.length === 1 && sameRecord(prev[0], record)) { unchanged++; continue; }

		const centis = toCentis(record.time);
		const best = Math.min(...prev.map((p) => toCentis(p.time)).filter((c) => c !== null));
		const status = centis < best ? 'faster' : centis > best ? 'changed' : 'info';
		items.push({ key, status, record, previous: prev[0] });
	}
	return { items, unchanged };
}

// 입력한 기록을 반영한다. keys 를 주면 그 key 만, 안 주면 달라진 기록 전부. 같은 key 는 입력한 내용으로 교체(createdAt 유지).
async function applyManual(records, keys) {
	const { items, unchanged } = await diffManual(records);
	const wanted = Array.isArray(keys) ? new Set(keys) : null;
	const selected = wanted ? items.filter((i) => wanted.has(i.key)) : items;
	await applyItems(selected, selected.map((i) => i.key));
	return {
		inserted: selected.filter((i) => i.status === 'new').length,
		updated:  selected.filter((i) => i.status !== 'new').length,
		unchanged,
		skipped:  items.length - selected.length,
	};
}

// 표의 행을 눌러 수정: original(수정 전 key 필드)의 기록을 record 내용으로 바꾼다.
//   key(종류/성별/종목/코스/거리)가 바뀌면 원래 기록을 지우고 새 key 로 옮긴다.
//   새 key 에 이미 다른 기록이 있으면 덮어쓰지 않고 오류를 돌려준다.
function validateOriginal(original) {
	const errors = [];
	if (!original || typeof original !== 'object') return { key: null, errors: [{ index: null, field: 'original', message: '수정할 기록 정보가 없습니다.' }] };
	const norm = { isMasters: false };
	const rules = [
		['type', MANUAL.types, (v) => v.toUpperCase()],
		['gender', MANUAL.genders, (v) => v.toLowerCase()],
		['discipline', MANUAL.disciplines, (v) => v.toUpperCase()],
		['course', MANUAL.courses, (v) => v.toUpperCase()],
		['distance', MANUAL.distances, (v) => v.toUpperCase()],
	];
	for (const [field, values, normalize] of rules) {
		const v = normalize(String(original[field] ?? '').trim());
		if (!values.includes(v)) errors.push({ index: null, field: 'original', message: `수정 전 ${field} 값이 올바르지 않습니다. ("${original[field] ?? ''}")` });
		norm[field] = v;
	}
	return { original: norm, key: errors.length ? null : recordKey(norm), errors };
}

async function updateManual(original, record) {
	const origin = validateOriginal(original);
	if (origin.errors.length) return { errors: origin.errors };

	const types = [...new Set([origin.original.type, record.type])];
	const existing = await loadExisting(types);
	const newKey = recordKey(record);
	const prev = existing.get(origin.key) || [];
	if (prev.length === 0) return { errors: [{ index: 0, field: null, message: '수정할 기록을 찾을 수 없습니다. 목록을 새로 조회한 뒤 다시 시도해 주세요.' }] };

	if (newKey !== origin.key) {
		if ((existing.get(newKey) || []).length > 0) {
			return { errors: [{ index: 0, field: null, message: `이미 같은 종류/성별/종목/코스/거리 기록이 있습니다. (${newKey}) 그 기록을 수정하거나 값을 바꿔 주세요.` }] };
		}
		// key 가 바뀌었으니 원래 기록은 지우고, 새 key 로 추가(createdAt 은 원래 기록 것을 유지)
		await mongodb.deleteMany(mongoCFG.Breaststroke.records, {
			isMasters: false, gender: origin.original.gender, discipline: origin.original.discipline,
			course: origin.original.course, distance: origin.original.distance, type: origin.original.type,
		});
		await applyItems([{ key: newKey, status: 'new', record, previous: null }], [newKey]);
		return { inserted: 0, updated: 1, unchanged: 0 };
	}

	if (prev.length === 1 && sameRecord(prev[0], record)) return { inserted: 0, updated: 0, unchanged: 1 };
	await applyItems([{ key: newKey, status: 'updated', record, previous: prev[0] }], [newKey]);
	return { inserted: 0, updated: 1, unchanged: 0 };
}

module.exports = { toCentis, fromCentis, recordKey, diffRecords, applyItems, validateManual, diffManual, applyManual, updateManual, MANUAL };
