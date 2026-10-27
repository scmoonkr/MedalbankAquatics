// 대한수영연맹 신기록현황(전문체육) 크롤러 + Breaststroke.records 비교/갱신
//   https://www.korswim.co.kr/page/14?cate=006006&cor=021002
//   cate: 종목, cor: 코스(50m LCM / 25m SCM), 표: 성별 > 거리 > 세계/올림픽/아시아/한국 신기록
const axios    = require('axios');
const cheerio  = require('cheerio');
const { toCentis, fromCentis, diffRecords, applyItems } = require('./records.sync');

const BASE = 'https://www.korswim.co.kr/page/14';

const DISCIPLINES = [
	{ cate: '006001', discipline: 'FR',  relay: false },
	{ cate: '006002', discipline: 'BA',  relay: false },
	{ cate: '006003', discipline: 'BR',  relay: false },
	{ cate: '006007', discipline: 'FL',  relay: false },
	{ cate: '006005', discipline: 'IM',  relay: false },
	{ cate: '006004', discipline: 'FRR', relay: true },
	{ cate: '006006', discipline: 'MR',  relay: true },
];
const COURSES = [
	{ cor: '021002', course: 'LCM' },
	{ cor: '021001', course: 'SCM' },
];
// 표의 열 순서: 세계, 올림픽, 아시아, 한국
const TYPES = ['WR', 'OR', 'AR', 'KR'];
const GENDERS = { '남자': 'men', '여자': 'women', '혼성': 'mixed' };

//-------------------------------------------------------------
// 페이지 파싱
//-------------------------------------------------------------
function parsePage(html, { discipline, relay, course }) {
	const $ = cheerio.load(html);
	const records = [];

	$('.s14-la').each((_, block) => {
		const gender = GENDERS[$(block).find('.s14-sbj').first().text().trim()];
		if (!gender) return;

		$(block).find('table tr').each((__, tr) => {
			const cells = $(tr).find('td');
			if (cells.length < 1 + TYPES.length) return;
			const distance = $(cells[0]).text().trim().replace(/m$/i, 'M').toUpperCase();
			if (!/^\d+M$/.test(distance)) return;

			TYPES.forEach((type, i) => {
				const td = $(cells[i + 1]);
				const centis = toCentis(td.find('h3').first().text());
				if (centis === null) return; // 기록 없음

				const h4 = td.find('h4').first();
				const team = h4.find('span').first().text().replace(/[()]/g, '').trim();
				let name = h4.clone().children().remove().end().text().replace(/\s+/g, ' ').trim();
				if (relay) name = name.replace(/[\s,]+/g, ''); // DB 계영/혼계영 이름은 구분자 없이 이어 붙임

				const info = td.find('p').first().text().replace(/\s+/g, ' ').trim();
				const dm = info.match(/(\d{4})\.\s*(\d{1,2})\.\s*(\d{1,2})/);
				const datetime = dm ? `${dm[1]}-${dm[2].padStart(2, '0')}-${dm[3].padStart(2, '0')}` : '';
				const slash = info.indexOf('/');
				const location = slash >= 0 ? info.slice(slash + 1).trim() : '';

				records.push({
					isMasters: false,
					gender, course, distance, type, discipline,
					time: fromCentis(centis),
					name, team, datetime, location,
					timeStamp: centis / 100 / 86400,
				});
			});
		});
	});
	return records;
}

async function fetchPage(url) {
	let lastErr;
	for (let attempt = 0; attempt < 2; attempt++) {
		try {
			const res = await axios.get(url, { timeout: 20000, headers: { 'User-Agent': 'Mozilla/5.0' } });
			return res.data;
		} catch (e) {
			lastErr = e;
		}
	}
	throw lastErr;
}

// 7종목 x 2코스 = 14페이지
async function crawl() {
	const jobs = [];
	for (const d of DISCIPLINES) for (const c of COURSES) jobs.push({ ...d, ...c });

	const records = [];
	const failed = [];
	for (let i = 0; i < jobs.length; i += 4) { // 4개씩 동시에
		await Promise.all(jobs.slice(i, i + 4).map(async (job) => {
			const url = `${BASE}?cate=${job.cate}&cor=${job.cor}`;
			try {
				records.push(...parsePage(await fetchPage(url), job));
			} catch (e) {
				failed.push({ url, error: e.message });
			}
		}));
	}
	return { records, failed };
}

//-------------------------------------------------------------
// DB 와 비교 / 선택한 key 반영 (공통 로직: records.sync.js)
//   반영은 클라이언트가 보낸 내용이 아니라 연맹 페이지를 다시 읽은 값으로 한다.
//-------------------------------------------------------------
async function compare() {
	const { records, failed } = await crawl();
	return { items: await diffRecords(records), failed, crawled: records.length };
}

async function apply(keys) {
	const { items, failed } = await compare();
	return { applied: await applyItems(items, keys), failed };
}

module.exports = { crawl, compare, apply, parsePage };
