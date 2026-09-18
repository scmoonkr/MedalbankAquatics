const extend 			= require('node.extend');
const mskCFG 			= require('../../Config/mskCFG');
const mongoCFG 		= require('../../Config/mongoCFG');
const mongoDB			= require('../../Class/MongoDB');
const UtilDate		= require("../../Class/DateLibrary");
const utilLibrary = require("../../Class/utilLibrary");
const utilError		= require("../../Class/utilError");
// const utilDatabase= require('./utilDatabase');
const MemoryDB		= require("../../Class/MemoryDB");
const memoryDB		= new MemoryDB();

const mongodb 		= new mongoDB(mongoCFG.Breaststroke.database);
const utilDate		= new UtilDate();

const TimeLibrary 			= require('../../Class/TimeLibrary.js');
const timeLibrary 			= new TimeLibrary();

//-----------------------------------------------
let _statisticsCreated = "";
let _statistics = {};
//-----------------------------------------------

class StatisticsModel {
	
	static async buildStatistics(body) {
		_statisticsCreated = "";
		console.log("\n\nbuildStatistics...", body, _statisticsCreated);
		
		return { message: "", data: _statisticsCreated };
	}
	
	static async statistics(body) {
		const record = body.record ? body.record : 'exceptRecord';
	console.log("statistics.body.", body, ",record=", record, _statisticsCreated, new Date().toISOString().slice(0, 10));
		if (_statisticsCreated != new Date().toISOString().slice(0, 10)) {
			await buildStatisticsAll(); // { date: 'yyyy-MM-dd' }
			_statisticsCreated = new Date().toISOString().slice(0, 10)
		}

		//-------------------------------------------
		// random으로 12명 선수 가져오기
		//-------------------------------------------
		_statistics[record].randomAthletes = await randomAthletes();
		console.log("\nfetch statistics.statisticsCreated...", _statisticsCreated);
		return { message: '', data: _statistics[record] }
	}

	//-------------------------------------------
	// hall Of Fame
	//-------------------------------------------
	static async hallOfFame(body) {

		// const query = {
		// 	$or: [
		// 		{ discipline: 'BR', course: 'LCM', distance: { $in: ["50M", "100M", "200M"] }, },
		// 		{ discipline: { $in: ["BRZS", "BROS", "BRMS", "BROW", "BRUW"] }, course: 'SCM', distance: "25M" },
		// 	],			
		// 	athleteID	: { $gt: 0 },
		// 	timeStamp	: { $gt: 0 },
		// 	$or				: [ { status: ""}, { status: { $exists: false }} ],
		// };
		const query = {
			$and: [
				{
					$or: [
						{ discipline: "BR", course: "LCM", distance: { $in: ["50M", "100M", "200M"] } },
						{ discipline: { $in: ["BRZS", "BROS", "BRMS", "BROW", "BRUW", "BRUW"] }, course: "SCM", distance: "25M" }
					]
				},
				{ athleteID: { $gt: 0 } },
				{ timeStamp: { $gt: 0 } },
				{ $or: [{ status: "" }, { status: { $exists: false } }] }
			]
		}
		// if (body.discipline) query.discipline = body.discipline;
console.log("query = ", query);

		 const aggregate = [
				{ $match: query },
				// 1️⃣ 가장 빠른 기록이 위로 오도록 정렬
				{ $sort: { timeStamp: 1 } },
	
				// 2️⃣ 그룹핑 (선수 + 종목 + 코스 + 거리)
				{ $group: {
						_id: {
							athleteID	: "$athleteID",
							discipline: "$discipline",
							course		: "$course",
							distance	: "$distance"
						},
						bestTime: { $first: "$$ROOT" }
					}
				},
	
				// 3️⃣ 결과를 문서 형태로 풀기
				{ $replaceRoot: { newRoot: "$bestTime" } },
				{ $project: { _id:0, timeID:1, athleteID:1, name:1, discipline:1, course:1, distance:1, time:1, timeStamp:1, } },
				{ $sort: { timeStamp:1,  } }
		 ];
		 const result = await mongodb.aggregate(mongoCFG.Breaststroke.times, aggregate);
		//  console.log(JSON.stringify(aggregate, null, 2));

		 const athleteIDs = [...new Set(result.data.map(el => el.athleteID))];
		 const context = {
			// query			: { athleteID: { $in: athleteIDs }, featured: { $exists: true } },
			query			: { athleteID: { $in: athleteIDs }, },
			projection: { _id:0, athleteID:1, name:1, featured:1, },
			limit			: 1000,
			skip			: 0,
			sort			: { name: 1, },
		};
		 const athletes = await mongodb.find(mongoCFG.Breaststroke.athletes, context);

		 result.data = result.data.reduce((arr, time) => {
																const athlete = athletes.data.find(el => el.athleteID == time.athleteID);
																if (athlete) {
																	time.thumbnail = athlete.featured;
																}
																if (time.name=='문주희') console.log("time=", time);
																arr.push(time);
																return arr;
															}, []);
		//  console.log("result.data=", result.data);

		//  return customHallOfFame(result.data)
		 console.log("hall of fame: ", result.data.length);
		 return result;
	}
}

module.exports = StatisticsModel;

async function randomAthletes() {
	const context = {
		// query			: { athleteID: { $in: athleteIDs }, },
		query			: { athleteID: { $gt: 0 }},
		projection: { _id:0, athleteID:1, name:1, featured:1, },
		limit			: 12000,
		skip			: 0,
		sort			: { athleteID: 1, },
	};
	const athletes = await mongodb.find(mongoCFG.Breaststroke.athletes, context);
	
	const athleteIDs = utilLibrary.getRandomNumbers(0, athletes.data.length-1, 24);		
	const randomAthletes = [];
	for (const no of athleteIDs) {
		if (randomAthletes.find(el => el.athleteID == athletes.data[no].athleteID)) continue;
		randomAthletes.push(athletes.data[no])
		if (randomAthletes.length == 12) break;
	}
	return randomAthletes;
}
/********************************************************
 * 
 ********************************************************/	
async function buildStatisticsAll(body) {
	await buildStatisticsMain({ record: 'all' });
	await buildStatisticsMain({ record: '' });
}
async function buildStatisticsMain(body) {
		
	let result, aggregate;
	const statistics = { graph: {} };


	const context = {
		// query			: { athleteID: { $in: athleteIDs }, },
		query			: { athleteID: { $gt: 0 }},
		projection: { _id:0, athleteID:1, name:1, featured:1, record:1, },
		limit			: 12000,
		skip			: 0,
		sort			: { athleteID: 1, },
	};
	const athletes = await mongodb.find(mongoCFG.Breaststroke.athletes, context);

	const recordAthleteIDs = athletes.data.filter(el => el.record).map(el => el.athleteID);		
	// console.log("recordAthleteIDs=", recordAthleteIDs);
	
	//-------------------------------------------
	// 선수 수 가져오기
	//-------------------------------------------
	const query = {
		discipline: { $in: ["BR", "BRZS", "BROS", "BRMS", "BROW", "BRUW"] },
		athleteID	: { $gt: 0 },
		timeStamp	: { $gt: 0, $lt: 0.0416665509259000 },
		$or				: [ { status: ""}, { status: { $exists: false }} ],
	};
	if (!body.record) {
		// query.record = { $exists: false };
		query.athleteID = { $gt: 0, $nin: recordAthleteIDs };
	}
	console.log("query=", query);

	const record = body.record ? body.record : 'exceptRecord';
	result = await mongodb.distinct(mongoCFG.Breaststroke.times, "athleteID", query);
	statistics.athletes = result.data.length;

	// const athleteIDs = utilLibrary.getRandomNumbers(0, athletes.data.length-1, 12);		
	// statistics.randomAthletes = [];
	// for (const no of athleteIDs) {
	// 	statistics.randomAthletes.push(athletes.data[no])
	// }

	//-------------------------------------------
	// course별 Graph data 가져오기
	//-------------------------------------------
	const queryGraph = {
		discipline: "BR",
		athleteID	: { $gt: 0 },
		timeStamp	: { $gt: 0, $lt: 0.0416665509259000 },
		$or				: [ { status: ""}, { status: { $exists: false }} ],
	};
	if (!body.record) {
		// queryGraph.record = { $exists: false };
		queryGraph.athleteID = { $gt: 0, $nin: recordAthleteIDs };
	}
	console.log("queryGraph=", queryGraph);
	// course별 count
	aggregate = [
		{ $match: queryGraph },
		{ $group: { _id: "$course", count: { $sum: 1 } } },
		{ $project: { course: "$_id", count: 1, _id:0 } },
	];
	result = await mongodb.aggregate(mongoCFG.Breaststroke.times, aggregate);
	statistics.graph.course = result.data.reduce((arr, data) => {
		data.course = data.course ?? "LCM";
		data.label = data.course
		arr.push(data);
		return arr;
	},[])
	// console.log("course=", result.data);

	//-------------------------------------------
	// 경기기록, 측정기록 별 Graph data count
	//-------------------------------------------
	aggregate = [
		{ $match: queryGraph },
		{ $group: { _id: "$type", count: { $sum: 1 } } },
		{ $project: { type: "$_id", count: 1, _id:0 } },
	];
	result = await mongodb.aggregate(mongoCFG.Breaststroke.times, aggregate);
	statistics.graph.type = result.data.reduce((arr, data) => {
		data.label = data.type
		arr.push(data);
		return arr;
	},[])
	for (let no=0; no<statistics.graph.type.length; no++) {
		statistics.graph.type[no].label = statistics.graph.type[no].type == 'medalbank' ? "측정기록" : "경기실적";
	}
	const olypiadCount = await mongodb.count(mongoCFG.Breaststroke.times, { discipline: { $in: ["BRZS", "BROS", "BRMS", "BROW", "BRUW"] }})
	statistics.graph.type.push({
		count: olypiadCount,
		type: 'olympiad',
		label: '올림피아드',
	});
	console.log("type=", statistics.graph.type);

	//-------------------------------------------
	// 학생 별 Graph data count
	//-------------------------------------------
	aggregate = [
		{ $match: queryGraph },
		{ $group: { _id: "$isMasters", count: { $sum: 1 } } },
		{ $project: { isMasters: "$_id", count: 1, _id:0 } },
	];
	result = await mongodb.aggregate(mongoCFG.Breaststroke.times, aggregate);
	const masters = { '비등록': { count:0 }, '등록': { count:0 } };
	for (const master of result.data) {
		const key = master.isMasters ? '비등록' : '등록'
		masters[key].count += master.count;
		masters[key].isMasters = master.isMasters;
		masters[key].label = key;
	}
	statistics.graph.isMasters = Object.values(masters)

	//-------------------------------------------
	// 학생 별 Graph data count
	//-------------------------------------------
	aggregate = [
		{ $match: queryGraph },
		{ $group: { _id: "$isJunior", count: { $sum: 1 } } },
		{ $project: { isJunior: "$_id", count: 1, _id:0 } },
	];
	result = await mongodb.aggregate(mongoCFG.Breaststroke.times, aggregate);
	const juniors = { '일반': { count:0 }, '학생': { count:0 } };
	for (const junior of result.data) {
		const key = junior.isJunior ? '학생' : '일반'
		juniors[key].count += junior.count;
		juniors[key].isJunior = junior.isJunior;
		juniors[key].label = key;
	}
	statistics.graph.isJunior = Object.values(juniors)

	//-------------------------------------------
	// gender 별 Graph data count
	//-------------------------------------------
	aggregate = [
		{ $match: queryGraph },
		{ $group: { _id: "$gender", count: { $sum: 1 } } },
		{ $project: { gender: "$_id", count: 1, _id:0 } },
	];
	result = await mongodb.aggregate(mongoCFG.Breaststroke.times, aggregate);
	statistics.graph.gender = result.data.reduce((arr, data) => {
		data.label = data.gender
		if ("men,women".includes(data.gender)) arr.push(data);
		return arr;
	},[])
	for (let no=0; no<statistics.graph.gender.length; no++) {
		statistics.graph.gender[no].label = statistics.graph.gender[no].gender == 'men' ? "남자" : "여자";
	}

	//-------------------------------------------
	// distance 별 Graph data count
	//-------------------------------------------
	aggregate = [
		{ $match: queryGraph },
		{ $group: { _id: "$distance", count: { $sum: 1 } } },
		{ $project: { distance: "$_id", count: 1, _id:0 } },
	];
	result = await mongodb.aggregate(mongoCFG.Breaststroke.times, aggregate);
	statistics.graph.distance = result.data.reduce((arr, data) => {
		data.label = data.distance
		if ("25M,50M,100M,200M".includes(data.distance)) {
			// data.distance = Number(data.distance.replace("M", ""));
			arr.push(data);
		}
		return arr;
	},[])

	//+++++++++++++++++++++++++++++++++++++++++++++++++++++++
	//-------------------------------------------
	// gender 별 Graph data count
	//-------------------------------------------
	const queryGender = {
		gender		: "men",
		discipline: "BR",
		course		: "LCM",
		distance	: "50M",
		athleteID	: { $gt: 0 },
		timeStamp	: { $gt: 0, $lt: 0.0416665509259000 },
		$or				: [ { status: ""}, { status: { $exists: false }} ],
	}
	const aggregateGender =[
		{ $match: queryGender },
		{ $project: {
				baseTime: {
					$arrayElemAt: [
						{ $split: ["$time", "."] },
						0
					]
				}
			}
		},
		{ $group: {
				_id: "$baseTime",
				count: { $sum: 1 }
			}
		},
		{ $project: {
				_id: 0,
				time: "$_id",
				count: 1
			}
		},
		// { $sort: { time: 1 } }
	];
	const resultMen = await mongodb.aggregate(mongoCFG.Breaststroke.times, aggregateGender);

	//-------------------------------------------
	// Event 별 Graph data count
	//-------------------------------------------
	aggregate = [
		{ $match: queryGraph },
		{ $group: { _id: {discipline: "$discipline", course: "$course", distance: "$distance"}, count: { $sum: 1 } } },
		{ $project: { discipline: "$_id.discipline", course: "$_id.course", distance: "$_id.distance", count: 1, _id:0 } },
	];
	result = await mongodb.aggregate(mongoCFG.Breaststroke.times, aggregate);

	const heatLabel = [
		"BR LCM 50M","BR LCM 100M","BR LCM 200M",
		"BR SCM 25M","BR SCM 50M","BR SCM 100M","BR SCM 200M",
	];
	statistics.graph.heat = result.data.reduce((arr, el) => {
		// label, count
		arr.push({ label: `${el.discipline} ${el.course} ${el.distance}`, count: el.count });
		return arr;
	}, [])
	.sort((a, b) => heatLabel.indexOf(a.label) - heatLabel.indexOf(b.label))

	statistics.graph.eventMen = groupTimeDataWithOptions(resultMen.data);

	queryGender.gender = 'women';
	const resultWomen = await mongodb.aggregate(mongoCFG.Breaststroke.times, aggregateGender);

	// time string-> 초로 변환: 1:01 -> 61
	const recordsWomen = [];
	for (const data of resultWomen.data) {
		const minSec = data.time.split(":");
		let time = minSec.length > 1 ? Number(minSec[0])*60+Number(minSec[1]) : Number(minSec[0]);

		recordsWomen.push({ time, label: `${time}초대`, count: data.count });
	}
	statistics.graph.eventWomen = groupTimeDataWithOptions(resultWomen.data);

	//-------------------------------------------
	// top3 data
	//-------------------------------------------
	// course별 count
	const queryTop3 = {
		$and: [
			// 공통 조건
			{ athleteID: { $gt: 0 } },
			{ gender: { $exists: true } },
			// discipline 조건
			{
				$or: [
					{ discipline: "BRUW" },
					{
						discipline: { $in: ["BR", "BRZS", "BROS", "BRMS", "BROW"] },
						timeStamp: { $lt: 0.0416665509259 }
					}
				]
			},
			// status 조건
			{
				$or: [
					{ status: "" },
					{ status: { $exists: false } }
				]
			}
 	 ]
	}
	if (!body.record) {
		queryTop3.athleteID = { $gt: 0, $nin: recordAthleteIDs };
	}
	console.log("queryTop3=", queryTop3);

	aggregate = [
		{ $match: queryTop3 },
		// 2️⃣ athleteID 기준 개인 최고기록(PB)이 위로 오도록 정렬
		{ $sort: {
				gender: 1,
				discipline: 1,
				course: 1,
				distance: 1,
				athleteID: 1,
				timeStamp: 1
			}
		},

		// 3️⃣ athleteID별 가장 빠른 기록 1개만 남김
		{ $group: {
				_id: {
					gender: "$gender",
					discipline: "$discipline",
					course: "$course",
					distance: "$distance",
					athleteID: "$athleteID"
				},
				bestRecord: { $first: "$$ROOT" }
			}
		},

		// 4️⃣ 다시 종목 단위로 묶어서 랭킹용 정렬
		{ $sort: {
				"bestRecord.timeStamp": 1
			}
		},

		// 5️⃣ 종목별 TOP 3 추출
		{ $group: {
				_id: {
					gender: "$_id.gender",
					discipline: "$_id.discipline",
					course: "$_id.course",
					distance: "$_id.distance"
				},
				top3: { $push: "$bestRecord" }
			}
		},

		// 6️⃣ 상위 3명만
		{ $project: {
				_id: 0,
				gender: "$_id.gender",
				discipline: "$_id.discipline",
				course: "$_id.course",
				distance: "$_id.distance",
				top3: { $slice: ["$top3", 30000] }
			}
		},

		// 7️⃣ 보기 좋게 정렬
		{ $sort: {
				gender: 1,
				discipline: 1,
				course: 1,
				distance: 1,
			}
		}
	];
	const times = await mongodb.aggregate(mongoCFG.Breaststroke.times, aggregate);
	statistics.top3 = times.data.reduce((arr, data) => {
																let rank = 1;
																const value = {
																	gender		: data.gender,
																	discipline: data.discipline,
																	course		: data.course,
																	distance	: data.distance,
																	top3			: data.top3.map(el => {
																													const tms = el.time.split(':')
																													if (tms.length > 1 && tms[0].length == 1) {
																														tms[0] = "0" + tms[0]
																														el.time = tms.join(':')
																													}
																													const tm = {
																														athleteID				: el.athleteID,
																														name						: el.name,
																														competitionName	: el.competitionName??'',
																														pool						: el.pool??'',
																														ageGroup				: el.ageGroup ?? el.group??'',
																														time						: el.time,
																														rank						: rank++,
																														datetime				: el.datetime,
																														thumbnail				: (athletes.data.find(ath => ath.athleteID == el.athleteID)??{}).featured ?? '',
																													};
																													if (el.strokes != undefined) {
																														tm.strokes = el.strokes ?? 0;
																													}
																													if (el.meters != undefined) {
																														tm.meters = el.meters ?? 0;
																													}
																													return tm;
																											}).slice(0, 3),
																};
																arr.push(value)
																return arr;
															}, []);

	//-----------------------------------------------
	const queryPercentage = {
		discipline: "BR",
		distance: { $in: ["50M", "100M"]},
		athleteID	: { $gt: 0 },
		timeStamp	: { $gt: 0, $lt: 0.0416665509259000 },
		$or				: [ { status: ""}, { status: { $exists: false }} ],
	}
	const contextPercentage = {
		query: queryPercentage,
		projection: { _id:0, time:1, timeStamp:1, discipline:1, course:1, distance:1, gender:1, },
		limit			: 100000,
		skip			: 0,
		sort			: { course:1, distance:1, timeStamp:1 },
	};
	if (!body.record) {
		contextPercentage.athleteID = { $gt: 0, $nin: recordAthleteIDs };
	}
	// const times1 = await mongodb.find(mongoCFG.Breaststroke.times, contextPercentage);
	// console.log("------->", times.data);
	/*
{
	gender: 'women',
	discipline: 'BR',
	course: 'LCM',
	distance: '100M',
	top3: [
	]
}	
	*/
	function filterTimes(times, gender, discipline, course, distance) {
		if (!times || times.length == 0) return [];
		const selectedTimes = times.filter(el => el.gender == gender
																					&& el.discipline == discipline
																					&& el.course ==	course
																					&& el.distance == distance);
		if (!selectedTimes || selectedTimes.length == 0 || !selectedTimes[0].top3 || selectedTimes[0].top3.length == 0) return [];
		return selectedTimes[0].top3.map(el => ({...el}));
	}

	const summaryTimes = {
		"50M-LCM-men": filterTimes(times.data, "men", "BR", "LCM", "50M"),
		"50M-LCM-women": filterTimes(times.data, "women", "BR", "LCM", "50M"),

		"50M-SCM-men": filterTimes(times.data, "men", "BR", "SCM", "50M"),
		"50M-SCM-women": filterTimes(times.data, "women", "BR", "SCM", "50M"),

		"100M-LCM-men": filterTimes(times.data, "men", "BR", "LCM", "100M"),
		"100M-LCM-women": filterTimes(times.data, "women", "BR", "LCM", "100M"),

		"100M-SCM-men": filterTimes(times.data, "men", "BR", "SCM", "100M"),
		"100M-SCM-women": filterTimes(times.data, "women", "BR", "SCM", "100M"),
	};
	summaryTimes["50M-LCM"] = summaryTimes["50M-LCM-men"].concat(summaryTimes["50M-LCM-women"]);
	summaryTimes["50M-SCM"] = summaryTimes["50M-SCM-men"].concat(summaryTimes["50M-SCM-women"]);
	summaryTimes["100M-LCM"] = summaryTimes["100M-LCM-men"].concat(summaryTimes["100M-LCM-women"]);
	summaryTimes["100M-SCM"] = summaryTimes["100M-SCM-men"].concat(summaryTimes["100M-SCM-women"]);

	function customTime(time) {
		return '00:00.00'.slice(0,8-time.length) + time;
	}
	function getPercentage(times, percentage) {
		if (times.length == 0) return "00:00.00";
		const no = parseInt(times.length * percentage);
		return customTime(times[no].time);
	}
	statistics.averageTimes = {
		"50M-LCM"				: customTime(timeLibrary.calculateAverage(summaryTimes["50M-LCM"]).time),
		"50M-LCM-count"	: `a:${summaryTimes["50M-LCM"].length},m:${summaryTimes["50M-LCM-men"].length},w:${summaryTimes["50M-LCM-women"].length}`,
		"50M-LCM-men"		: customTime(timeLibrary.calculateAverage(summaryTimes["50M-LCM-men"]).time),
		"50M-LCM-women"	: customTime(timeLibrary.calculateAverage(summaryTimes["50M-LCM-women"]).time),

		"50M-SCM"				: customTime(timeLibrary.calculateAverage(summaryTimes["50M-SCM"]).time),
		"50M-SCM-count"	: `a:${summaryTimes["50M-SCM"].length},m:${summaryTimes["50M-SCM-men"].length},w:${summaryTimes["50M-SCM-women"].length}`,
		"50M-SCM-men"		: customTime(timeLibrary.calculateAverage(summaryTimes["50M-SCM-men"]).time),
		"50M-SCM-women"	: customTime(timeLibrary.calculateAverage(summaryTimes["50M-SCM-women"]).time),

		"100M-LCM"			: customTime(timeLibrary.calculateAverage(summaryTimes["100M-LCM"]).time),
		"100M-LCM-count"	: `a:${summaryTimes["100M-LCM"].length},m:${summaryTimes["100M-LCM-men"].length},w:${summaryTimes["100M-LCM-women"].length}`,
		"100M-LCM-men"	: customTime(timeLibrary.calculateAverage(summaryTimes["100M-LCM-men"]).time),
		"100M-LCM-women": customTime(timeLibrary.calculateAverage(summaryTimes["100M-LCM-women"]).time),

		"100M-SCM"			: customTime(timeLibrary.calculateAverage(summaryTimes["100M-SCM"]).time),
		"100M-SCM-count"	: `a:${summaryTimes["100M-SCM"].length},m:${summaryTimes["100M-SCM-men"].length},w:${summaryTimes["100M-SCM-women"].length}`,
		"100M-SCM-men"	: customTime(timeLibrary.calculateAverage(summaryTimes["100M-SCM-men"]).time),
		"100M-SCM-women": customTime(timeLibrary.calculateAverage(summaryTimes["100M-SCM-women"]).time),
	}
	// console.log("_statistics.averageTimes=", statistics.averageTimes);

	statistics.percentageTimes = {
		// LCM 1위
		"50M-LCM-1-rank"			: summaryTimes["50M-LCM"].length 			> 0 ? customTime(summaryTimes["50M-LCM"][0].time) : '00:00.00',
		"50M-LCM-1-rank-men"	: summaryTimes["50M-LCM-men"].length 	> 0 ? customTime(summaryTimes["50M-LCM-men"][0].time) : '00:00.00',
		"50M-LCM-1-rank-women": summaryTimes["50M-LCM-women"].length> 0 ? customTime(summaryTimes["50M-LCM-women"][0].time) : '00:00.00',
		// LCM 0.1%
		"50M-LCM-01"				: getPercentage(summaryTimes["50M-LCM"], 0.001), // 0.1%
		"50M-LCM-01-men"		: getPercentage(summaryTimes["50M-LCM-men"], 0.001), // 0.1%
		"50M-LCM-01-women"	: getPercentage(summaryTimes["50M-LCM-women"], 0.001), // 0.1%
		// LCM 1%
		"50M-LCM-1"				: getPercentage(summaryTimes["50M-LCM"], 0.01), // 1%
		"50M-LCM-1-men"		: getPercentage(summaryTimes["50M-LCM-men"], 0.01), // 1%
		"50M-LCM-1-women"		: getPercentage(summaryTimes["50M-LCM-women"], 0.01), // 1%
		// LCM 5%
		"50M-LCM-5"				: getPercentage(summaryTimes["50M-LCM"], 0.05), // 5%
		"50M-LCM-5-men"		: getPercentage(summaryTimes["50M-LCM-men"], 0.05), // 5%
		"50M-LCM-5-women"	: getPercentage(summaryTimes["50M-LCM-women"], 0.05), // 5%
		// LCM 10%
		"50M-LCM-10"				: getPercentage(summaryTimes["50M-LCM"], 0.1), // 10%
		"50M-LCM-10-men"		: getPercentage(summaryTimes["50M-LCM-men"], 0.1), // 10%
		"50M-LCM-10-women"	: getPercentage(summaryTimes["50M-LCM-women"], 0.1), // 10%
		// LCM 50%
		"50M-LCM-50"				: getPercentage(summaryTimes["50M-LCM"], 0.5), // 50%
		"50M-LCM-50-men"		: getPercentage(summaryTimes["50M-LCM-men"], 0.5), // 50%
		"50M-LCM-50-women"	: getPercentage(summaryTimes["50M-LCM-women"], 0.5), // 50%

		// SCM 1위
		"50M-SCM-1-rank"			: summaryTimes["50M-SCM"].length 			> 0 ? customTime(summaryTimes["50M-SCM"][0].time) : '',
		"50M-SCM-1-rank-men"	: summaryTimes["50M-SCM-men"].length 	> 0 ? customTime(summaryTimes["50M-SCM-men"][0].time) : '',
		"50M-SCM-1-rank-women": summaryTimes["50M-SCM-women"].length> 0 ? customTime(summaryTimes["50M-SCM-women"][0].time) : '',
		// SCM 0.1%
		"50M-SCM-01"				: getPercentage(summaryTimes["50M-SCM"], 0.001), // 0.1%
		"50M-SCM-01-men"		: getPercentage(summaryTimes["50M-SCM-men"], 0.001), // 0.1%
		"50M-SCM-01-women"	: getPercentage(summaryTimes["50M-SCM-women"], 0.001), // 0.1%
		// SCM 1%
		"50M-SCM-1"				: getPercentage(summaryTimes["50M-SCM"], 0.01), // 1%
		"50M-SCM-1-men"		: getPercentage(summaryTimes["50M-SCM-men"], 0.01), // 1%
		"50M-SCM-1-women"	: getPercentage(summaryTimes["50M-SCM-women"], 0.01), // 1%
		// SCM 5%
		"50M-SCM-5"				: getPercentage(summaryTimes["50M-SCM"], 0.05), // 5%
		"50M-SCM-5-men"		: getPercentage(summaryTimes["50M-SCM-men"], 0.05), // 5%
		"50M-SCM-5-women"	: getPercentage(summaryTimes["50M-SCM-women"], 0.05), // 5%
		// SCM 10%
		"50M-SCM-10"				: getPercentage(summaryTimes["50M-SCM"], 0.1), // 10%
		"50M-SCM-10-men"		: getPercentage(summaryTimes["50M-SCM-men"], 0.1), // 10%
		"50M-SCM-10-women"	: getPercentage(summaryTimes["50M-SCM-women"], 0.1), // 10%
		// SCM 50%
		"50M-SCM-50"				: getPercentage(summaryTimes["50M-SCM"], 0.5), // 50%
		"50M-SCM-50-men"		: getPercentage(summaryTimes["50M-SCM-men"], 0.5), // 50%
		"50M-SCM-50-women"	: getPercentage(summaryTimes["50M-SCM-women"], 0.5), // 50%
	}
// console.log("_statistics.percentageTimes=", statistics.percentageTimes);


	//-----------------------------------------------
	_statistics[record] = statistics;
	//-----------------------------------------------

	console.log("\n\nbuildStatistics...", body, "record=", record, _statisticsCreated);
	return { message: "", data: _statistics[record] };
}

/**
 * 시간대별 데이터를 그룹화 (임계값 지정 가능)
 * @param {Array} eventData - 원본 이벤트 데이터
 * @param {Object} options - 옵션
 * @param {number} options.lowerThreshold - 하한 임계값 (기본: 25)
 * @param {number} options.upperThreshold - 상한 임계값 (기본: 60)
 * @param {string} options.lowerLabel - 하한 라벨 (기본: "초-")
 * @param {string} options.upperLabel - 상한 라벨 (기본: "초+")
 * @returns {Array} 그룹화된 데이터
 */
function groupTimeDataWithOptions(eventData, options = {}) {
  const {
    lowerThreshold = 25,
    upperThreshold = 60,
    lowerLabel = "초-",
    upperLabel = "초+"
  } = options

  if (!Array.isArray(eventData) || eventData.length === 0) {
    return []
  }

	eventData = eventData.reduce((arr, el) => {
													const minSec = el.time.split(":");
													let time = minSec.length > 1 ? Number(minSec[0])*60+Number(minSec[1]) : Number(minSec[0]);
													arr.push({ time, label: `${time}초대`, count: el.count });
													return arr;
												}, [])
												.sort((a,b) => a.time-b.time);

  // 하한 이하 합계
  const underLower = eventData
    .filter(item => item.time <= lowerThreshold)
    .reduce((sum, item) => sum + item.count, 0)

  // 중간 범위 데이터
  const middle = eventData.filter(
    item => item.time >= lowerThreshold + 1 && item.time <= upperThreshold - 1
  )

  // 상한 이상 합계
  const overUpper = eventData
    .filter(item => item.time >= upperThreshold)
    .reduce((sum, item) => sum + item.count, 0)

  const result = []

  // 하한 그룹 추가
  if (underLower > 0) {
    result.push({
      time: lowerThreshold,
      label: `${lowerThreshold}${lowerLabel}`,
      count: underLower
    })
  }

  // 중간 데이터 추가
  result.push(...middle)

  // 상한 그룹 추가
  if (overUpper > 0) {
    result.push({
      time: upperThreshold,
      label: `${upperThreshold}${upperLabel}`,
      count: overUpper
    })
  }

  return result
}