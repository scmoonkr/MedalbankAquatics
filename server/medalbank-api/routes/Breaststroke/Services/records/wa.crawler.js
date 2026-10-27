// World Aquatics 수영 기록(세계/올림픽/아시아) 크롤러 + Breaststroke.records 비교/갱신
//   https://www.worldaquatics.com/swimming/records?recordCode=WR&gender=M&pool=LCM
//   페이지는 JS 로 아래 공개 API 를 호출해 표를 그린다 (인증 불필요).
//   GET https://api.worldaquatics.com/fina/records/SW?recordCode=WR&gender=M&pool=LCM
const axios = require('axios');
const { fromCentis, diffRecords, applyItems } = require('./records.sync');

const API = 'https://api.worldaquatics.com/fina/records/SW';

// recordCode: 세계 WR / 올림픽 OR / 아시아 AS  ->  DB type
const RECORD_CODES = [
	{ code: 'WR', type: 'WR' },
	{ code: 'OR', type: 'OR' },
	{ code: 'AS', type: 'AR' },
];
// gender: M 남자 / F 여자 / X 혼성
const GENDERS = { M: 'men', F: 'women', X: 'mixed' };
const POOLS = ['LCM', 'SCM'];

const DISCIPLINE_BY_GROUP = {
	'Freestyle': 'FR',
	'Backstroke': 'BA',
	'Breaststroke': 'BR',
	'Butterfly': 'FL',
	'Medley': 'IM',
	'Freestyle Relay': 'FRR',
	'Medley Relay': 'MR',
};

// "Men's 4x100m Freestyle Relay" -> { distance: '400M' } / "Women's 200m Medley" -> '200M'
const parseDistance = (eventName) => {
	const m = String(eventName || '').match(/(?:(\d+)x)?(\d+)m\b/i);
	if (!m) return null;
	return `${(Number(m[1]) || 1) * Number(m[2])}M`;
};

// "00:00:20.8800000" / "00:01:42" -> 1/100초
const parseCentis = (time) => {
	const m = String(time || '').match(/^(\d+):(\d+):(\d+)(?:\.(\d+))?$/);
	if (!m) return null;
	return (Number(m[1]) * 3600 + Number(m[2]) * 60 + Number(m[3])) * 100 + Number(((m[4] || '') + '00').slice(0, 2));
};

function toRecord(row, { type, gender, course }) {
	const discipline = DISCIPLINE_BY_GROUP[row.disciplineGroup];
	const distance = parseDistance(row.eventDisciplineName);
	const centis = parseCentis(row.time);
	if (!discipline || !distance || centis === null) return null;

	const isRelay = row.isRelay === true || /Relay$/.test(row.disciplineGroup || '');
	const team = row.nationalityCode || '';
	// 개인: "Cameron MCEVOY" / 계영: 국가 코드 (기존 DB 의 WR/OR/AR 표기와 동일)
	const name = isRelay ? team : `${row.preferredFirstName || ''} ${row.preferredLastName || ''}`.trim();
	const place = [row.city, row.countryCode].filter(Boolean).join(', ');

	return {
		isMasters: false,
		gender, course, distance, type, discipline,
		time: fromCentis(centis),
		name, team,
		datetime: String(row.date || '').slice(0, 10),
		location: place,
		timeStamp: centis / 100 / 86400,
	};
}

// World Aquatics API 는 질의 문자열(파라미터 순서 포함)별로 캐시/게이트웨이가 달라서, 같은 질의라도
// 어떤 순서에서는 계속 504 가 난다. 순서를 바꿔 가며 다시 시도한다.
const PARAM_ORDERS = [
	['gender', 'pool', 'recordCode'],
	['recordCode', 'gender', 'pool'],
];
async function fetchRecords(params) {
	let lastErr;
	for (let attempt = 0; attempt < 4; attempt++) {
		const order = PARAM_ORDERS[attempt % PARAM_ORDERS.length];
		const ordered = {};
		for (const key of order) ordered[key] = params[key];
		try {
			const res = await axios.get(API, { params: ordered, timeout: 30000, headers: { 'User-Agent': 'Mozilla/5.0' } });
			return res.data.records || [];
		} catch (e) {
			lastErr = e;
			await new Promise((resolve) => setTimeout(resolve, 500 * (attempt + 1)));
		}
	}
	throw lastErr;
}

// 3종(WR/OR/AS) x 3성별 x 2코스 = 18요청
async function crawl() {
	const jobs = [];
	for (const rc of RECORD_CODES) for (const g of Object.keys(GENDERS)) for (const pool of POOLS) {
		jobs.push({ rc, g, pool });
	}

	const best = new Map(); // 같은 종목에 동기록(=)이 여러 건이면 가장 빠른(같으면 먼저 나온) 기록 하나만
	const failed = [];
	let crawled = 0;
	for (let i = 0; i < jobs.length; i += 3) { // 3개씩 동시에 (많이 보내면 504)
		await Promise.all(jobs.slice(i, i + 3).map(async ({ rc, g, pool }) => {
			try {
				const rows = await fetchRecords({ recordCode: rc.code, gender: g, pool });
				for (const row of rows) {
					const record = toRecord(row, { type: rc.type, gender: GENDERS[g], course: pool });
					if (!record) continue;
					crawled++;
					const key = [record.gender, record.discipline, record.course, record.distance, record.type].join('|');
					const cur = best.get(key);
					if (!cur || record.timeStamp < cur.timeStamp) best.set(key, record);
				}
			} catch (e) {
				failed.push({ recordCode: rc.code, gender: g, pool, error: e.message });
			}
		}));
	}
	return { records: [...best.values()], failed, crawled };
}

async function compare() {
	const { records, failed, crawled } = await crawl();
	return { items: await diffRecords(records), failed, crawled };
}

// 반영은 클라이언트가 보낸 내용이 아니라 API 를 다시 읽은 값으로 한다.
async function apply(keys) {
	const { items, failed } = await compare();
	return { applied: await applyItems(items, keys), failed };
}

module.exports = { crawl, compare, apply, toRecord };
