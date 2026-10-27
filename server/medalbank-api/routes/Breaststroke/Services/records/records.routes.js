// /BR/records — Breaststroke.records (세계/올림픽/아시아/한국 기록) 조회
const router   = require("express").Router();
const mongoCFG = require('../../Config/mongoCFG');
const mongoDB  = require('../../Class/MongoDB');
const mongodb  = new mongoDB(mongoCFG.Breaststroke.database);
const korswim  = require('./korswim.crawler');
const wa       = require('./wa.crawler');
const { validateManual, diffManual, applyManual, updateManual } = require('./records.sync');

const MAX_ROWS = 5000;

const escapeRegExp = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// POST /BR/records  { gender, course, distance, discipline, type, isMasters, name, page, maxRows }
router.post("/", async (req, res) => {
	try {
		const body = req.body || {};
		const query = {};
		for (const key of ['gender', 'course', 'distance', 'discipline', 'type', 'ageGroup', 'sido']) {
			if (body[key]) query[key] = body[key];
		}
		if (typeof body.isMasters === 'boolean') query.isMasters = body.isMasters;
		if (body.name) query.name = new RegExp(escapeRegExp(String(body.name).trim()), 'i');

		const limit = Math.min(Number(body.maxRows) || MAX_ROWS, MAX_ROWS);
		const page  = Math.max(Number(body.page) || 1, 1);
		const context = {
			query,
			projection: { _id: 0 },
			limit,
			skip: (page - 1) * limit,
			sort: { isMasters: 1, gender: 1, discipline: 1, course: 1, distance: 1, type: 1, timeStamp: 1 },
		};
		const result = await mongodb.find(mongoCFG.Breaststroke.records, context);
		res.json({ message: "", count: result.count, data: result.data });
	} catch (err) {
		console.log("records.list.catch.", err);
		res.status(503).json({ message: err.message, count: 0, data: [] });
	}
});

// POST /BR/records/korswim/check — 대한수영연맹 신기록을 읽어 DB 와 비교 (DB 는 변경하지 않음)
router.post("/korswim/check", async (req, res) => {
	try {
		const result = await korswim.compare();
		res.json({ message: "", count: result.items.length, crawled: result.crawled, failed: result.failed, data: result.items });
	} catch (err) {
		console.log("records.korswim.check.catch.", err);
		res.status(503).json({ message: err.message, count: 0, data: [] });
	}
});

// POST /BR/records/korswim/apply  { keys: ["men|BR|LCM|100M|KR", ...] } — 선택한 기록만 반영
router.post("/korswim/apply", async (req, res) => {
	try {
		const keys = Array.isArray(req.body && req.body.keys) ? req.body.keys.filter((k) => typeof k === 'string') : [];
		if (keys.length === 0) return res.json({ message: "선택한 기록이 없습니다.", count: 0, data: [] });
		const result = await korswim.apply(keys);
		res.json({ message: "", count: result.applied.length, failed: result.failed, data: result.applied });
	} catch (err) {
		console.log("records.korswim.apply.catch.", err);
		res.status(503).json({ message: err.message, count: 0, data: [] });
	}
});

// POST /BR/records/wa/check — World Aquatics 세계/올림픽/아시아 기록을 읽어 DB 와 비교 (DB 는 변경하지 않음)
router.post("/wa/check", async (req, res) => {
	try {
		const result = await wa.compare();
		res.json({ message: "", count: result.items.length, crawled: result.crawled, failed: result.failed, data: result.items });
	} catch (err) {
		console.log("records.wa.check.catch.", err);
		res.status(503).json({ message: err.message, count: 0, data: [] });
	}
});

// POST /BR/records/wa/apply  { keys: ["women|BR|LCM|100M|WR", ...] } — 선택한 기록만 반영
router.post("/wa/apply", async (req, res) => {
	try {
		const keys = Array.isArray(req.body && req.body.keys) ? req.body.keys.filter((k) => typeof k === 'string') : [];
		if (keys.length === 0) return res.json({ message: "선택한 기록이 없습니다.", count: 0, data: [] });
		const result = await wa.apply(keys);
		res.json({ message: "", count: result.applied.length, failed: result.failed, data: result.applied });
	} catch (err) {
		console.log("records.wa.apply.catch.", err);
		res.status(503).json({ message: err.message, count: 0, data: [] });
	}
});

// POST /BR/records/manual/check  { records: [...] } — 형식을 검사하고 DB 와 비교해 갱신 여부를 알려준다 (DB 는 변경하지 않음)
router.post("/manual/check", async (req, res) => {
	try {
		const { records, errors } = validateManual(req.body && req.body.records);
		if (errors.length > 0) {
			return res.status(400).json({ message: `형식 오류 ${errors.length}건`, count: 0, errors, data: [] });
		}
		const result = await diffManual(records);
		res.json({ message: "", count: result.items.length, unchanged: result.unchanged, data: result.items });
	} catch (err) {
		console.log("records.manual.check.catch.", err);
		res.status(503).json({ message: err.message, count: 0, data: [] });
	}
});

// POST /BR/records/manual  { records: [ {type, gender, discipline, course, distance, time, name, team?, datetime?, location?} ], original?: { type, gender, discipline, course, distance }, keys?: ["women|BR|LCM|200M|KR"] }
//   형식을 검사해서 오류가 있으면 400 + errors, 이상이 없으면 바로 반영한다.
router.post("/manual", async (req, res) => {
	try {
		const { records, errors } = validateManual(req.body && req.body.records);
		if (errors.length > 0) {
			return res.status(400).json({ message: `형식 오류 ${errors.length}건`, count: 0, errors, data: [] });
		}
		// original 이 있으면 표의 행 수정(1건): 수정 전 key 의 기록을 입력한 내용으로 바꾼다
		if (req.body.original !== undefined) {
			if (records.length !== 1) {
				return res.status(400).json({ message: "형식 오류 1건", count: 0, errors: [{ index: null, field: null, message: '수정은 기록 1건만 입력할 수 있습니다.' }], data: [] });
			}
			const result = await updateManual(req.body.original, records[0]);
			if (result.errors) return res.status(400).json({ message: `형식 오류 ${result.errors.length}건`, count: 0, errors: result.errors, data: [] });
			return res.json({ message: "", count: result.updated, ...result, data: [] });
		}
		const result = await applyManual(records, req.body.keys); // keys 가 있으면 그 기록만 반영
		res.json({ message: "", count: result.inserted + result.updated, ...result, data: [] });
	} catch (err) {
		console.log("records.manual.catch.", err);
		res.status(503).json({ message: err.message, count: 0, data: [] });
	}
});

module.exports = router;
