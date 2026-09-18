const extend 			= require('node.extend');
const mongoCFG 		= require('../../Config/mongoCFG');
const mongoDB			= require('../../Class/MongoDB');
const UtilDate		= require("../../Class/DateLibrary");
const utilLibrary = require("../../Util/utilLibrary");
const utilError		= require("../../Util/utilError");
// const utilDatabase= require('./utilDatabase');
const MemoryDB		= require("../../Class/MemoryDB");
const memoryDB		= new MemoryDB();

const mongodb 		= new mongoDB(mongoCFG.Medalbank.database);
const utilDate		= new UtilDate();

const StatisticsUtil		= require("./statistics.util");
const LeaderboardModel	= require("../leaderboards/leaderboard.model");
const StaticLibrary			= require("../library/statistics.library");
const { newRecords, newRecordsNew }		= require("../newRecords/newRecords.model");
const TimeLibrary 			= require('../../Class/TimeLibrary.js');
const timeLibrary 			= new TimeLibrary();


//-----------------------------------------
//-----------------------------------------
const _statistics = {
	lastMidnightCheck: null,
	lastHourlyCheck: null,
	
	// 통계나 기타 데이터
	athleteID: 0,

	athleteIDs: [],
	top1: [],
	compression: {},

	top3: [],
	newRecord: [],
};
//-----------------------------------------

//-----------------------------------------
// 자정(00:00:00)이 지났는지 체크
//-----------------------------------------
function checkMidnight() {
	if (!_statistics.lastMidnightCheck) { _statistics.lastMidnightCheck = new Date(); return true; }
	const now = new Date();
	const lastCheck = new Date(_statistics.lastMidnightCheck);
	
	// 날짜가 바뀌었는지 확인 (자정을 넘겼는지)
	const nowDateString = now.toISOString().slice(0, 10);
	const lastCheckDateString = lastCheck.toISOString().slice(0, 10);
	const check = nowDateString !== lastCheckDateString;
	
	if (check) {
		_statistics.lastMidnightCheck = now;
		console.log(`🌙 자정을 넘어 새로운 날입니다: ${nowDateString}`);
		return true;
	}
	
	return false;
}

//-----------------------------------------
// 매시간 정시(XX:00:00)가 지났는지 체크
//-----------------------------------------
function checkHourly() {
	if (!_statistics.lastHourlyCheck) { _statistics.lastHourlyCheck = new Date(); return true; }
	const now = new Date();
	const lastCheck = new Date(_statistics.lastHourlyCheck);
	
	// 시간이 바뀌었는지 확인 (정시를 넘겼는지)
	const nowHour = now.getHours();
	const lastCheckHour = lastCheck.getHours();
	const nowDate = now.toISOString().slice(0, 10);
	const lastCheckDate = lastCheck.toISOString().slice(0, 10);
	
	// 시간이 다르거나 날짜가 바뀌었으면 정시를 넘긴 것
	const check = (nowHour !== lastCheckHour) || (nowDate !== lastCheckDate);
	// console.log("now:", now, "lastCheck:", lastCheck, "nowHour=", nowHour, "lastCheckHour:", lastCheckHour, "nowDate:", nowDate, "lastCheckDate=", lastCheckDate, "check:", check);
	
	if (check) {
		_statistics.lastHourlyCheck = now;
		console.log(`⏰ 정시를 넘었습니다: ${now.getHours()}:00 (${nowDate})`);
		return true;
	}
	
	return false;
}
//-----------------------------------------
// set athleteID
//-----------------------------------------
async function setAthleteID() {
	_statistics.athleteIDs = [
		...new Set(_statistics.top1.filter(el => el.athleteID).map(entry => entry.athleteID))
	];
	// console.log(`top1._statistics.athleteIDs:${_statistics.athleteIDs.length}`);

	_statistics.top3.forEach(leaderboard => {
		leaderboard.times.forEach(time => {
			if (!_statistics.athleteIDs.includes(time.athleteID)) _statistics.athleteIDs.push(time.athleteID);
		})
	});
	// console.log(`top3._statistics.athleteIDs:${_statistics.athleteIDs.length}`);
	//----------------------------------------------------------------
	//	set thumbnail
	//----------------------------------------------------------------
	const context = {
		query			: { athleteID: { $in: _statistics.athleteIDs } },
		projection: { _id:0, athleteID:1, thumbnail:1, },
		limit			: 1000,
		sort			: { athleteID:1, },	
	};
	const athletes = await mongodb.find(mongoCFG.Medalbank.athletes, context);
	// console.log("athletes=", athletes.data.length);

	_statistics.top1.forEach((time) => {
		if (time.athleteID) {
			const athlete = athletes.data.find(athlete => athlete.athleteID == time.athleteID);
			time.thumbnail = athlete.thumbnail ?? '';
			// console.log("---->", time.thumbnail);
		}
	})
	_statistics.top3.forEach((leaderboard) => {
		leaderboard.times.forEach((time) => {
			if (time.athleteID) {
				const athlete = athletes.data.find(athlete => athlete.athleteID == time.athleteID);
				time.thumbnail = athlete?.thumbnail ?? '';
				// console.log("---->", time.thumbnail);
			}
		})
	})

}

//-----------------------------------------
// build Top1
//-----------------------------------------
async function loadTop1() {
	const top1 = await timeLibrary.getTimesForLeaderboardTop1();
	// console.log("top1=", top1);
	_statistics.top1 = top1.times;
	_statistics.compression = top1.compression || {};
	console.log("loadTop1...");

	await setAthleteID();
	// memoryDB.setStatistics("top1", statistics.top1);
}
//-----------------------------------------
// build Top3
//-----------------------------------------
async function loadTop3() {
	const query = {
		$and: [
			{ $or				: [
					{ style	: "individualMedley", distance: "200M" }, 
					{ style	: { $in: ["freestyle", "backstroke", "breaststroke", "butterfly"]}, distance: "50M" }
				],
			},
			{ $or 			: [{ status: "" }, { status: { $exists: false } }], }
		],
		timeStamp			: { $gt: 0 },
		isMasters			: true,
		isAdult				: true,
		type					: "time",
		$or						: [ { status: { $exists: false } },{ status: "" }, ],
		fin						: { $exists: false },
	};
	// const top3 = await timeLibrary.getTimesForLeaderboardTopNew(body);
	let top3 = await timeLibrary.getTimesForLeaderboardNew(query, 3);
	
	top3 = top3.leaderboards.reduce((arr,lead) => {
																	// lead.times = timeLibrary.assignRanksMedalbank(lead.times);
																	lead.times = lead.times.reduce((arr, time) => {
																	const value = {
																		athleteID				: time.athleteID,
																		name						: time.name,
																		time						: time.time,
																		// tumbnail				: time.tumbnail,
																		rank						: time.rank,
																	}
																	// if (!athleteIDs.includes(time.athleteID)) athleteIDs.push(time.athleteID);
																	arr.push(value);
																	return arr;
																}, []);
														arr.push(lead);
														return arr;
													}, []);
	// memoryDB.setStatistics("mainNew.top3", statistics.top3);
	_statistics.top3 = top3;
	console.log("loadTop3...", );
}
//-----------------------------------------
// build new record
//-----------------------------------------
async function loadNewRecord() {
	const newRecord = await newRecordsNew({});
	_statistics.newRecord = newRecord.data || [];
	console.log("loadNewRecord...");
}

class StaticModel {

	// labs: new 20250625
	static async mainNew1(body) {
		const enforce = true;
		let statistics = memoryDB.getStatistics();
		//----------------------------------------------------------------
		// get counts
		//----------------------------------------------------------------
		if (!statistics.times) {
			statistics = await memoryDB.loadStatics();
		}
		statistics.realtime = await StaticLibrary.getStatistics(8);

		//----------------------------------------------------------------
		// 이벤트 참여 숫자
		//----------------------------------------------------------------
		const athleteID = await mongodb.max(mongoCFG.Medalbank.athletes, "athleteID", {});
		statistics.athleteID = (athleteID - 1) % 100;
		console.log("statistics.mainNew.athleteID=", statistics.athleteID);

		//----------------------------------------------------------------
		// top1
		//----------------------------------------------------------------
		if (enforce || !statistics.top1) {
			// return@ { times, compression }
			const top1 = await timeLibrary.getTimesForLeaderboardTop1();
			// console.log("top1=", top1);
			statistics.compression = top1.compression ?? {};
			statistics.top1 = top1.times; 
			console.log("mainNew-----> top1", statistics.top1.length, statistics.top1[0]);

			memoryDB.setStatistics("top1", statistics.top1);
		}
		const athleteIDs = [...new Set(statistics.top1.filter(el => el.athleteID).map(entry => entry.athleteID))];
console.log("!!!!!!!!!!!!!!!!!!", athleteIDs.length);
		//----------------------------------------------------------------

		//----------------------------------------------------------------
		// top3
		//----------------------------------------------------------------
		if (enforce || !statistics.top3) {
			// .top3 = await StatisticsUtil.topN({}, 3);
			// return@ { data, count }
			const query = {
				$and: [
					{ $or				: [
							{ style	: "individualMedley", distance: "200M" }, 
							{ style	: { $in: ["freestyle", "backstroke", "breaststroke", "butterfly"]}, distance: "50M" }
						],
					},
					{ $or 			: [{ status: "" }, { status: { $exists: false } }], }
				],
				timeStamp			: { $gt: 0 },
				isMasters			: true,
				isAdult				: true,
				type					: "time",
				$or						: [ { status: { $exists: false } },{ status: "" }, ],
				fin						: { $exists: false },
			};
			// const top3 = await timeLibrary.getTimesForLeaderboardTopNew(body);
			const top3 = await timeLibrary.getTimesForLeaderboardNew(query, 3);
			
			statistics.top3 = top3.leaderboards.reduce((arr,lead) => {
																									// lead.times = timeLibrary.assignRanksMedalbank(lead.times);
																									lead.times = lead.times.reduce((arr, time) => {
																									const value = {
																										athleteID				: time.athleteID,
																										name						: time.name,
																										time						: time.time,
																										// tumbnail				: time.tumbnail,
																										rank						: time.rank,
																									}
																									if (!athleteIDs.includes(time.athleteID)) athleteIDs.push(time.athleteID);
																									arr.push(value);
																									return arr;
																								}, []);
																						arr.push(lead);
																						return arr;
																					}, []);
			memoryDB.setStatistics("mainNew.top3", statistics.top3);
			
			console.log("mainNew.-----> top3", statistics.top3.length, statistics.top3[0]);
		}
		// console.log("!!!!!!!!!!!!!!!", statistics.top3);

		//----------------------------------------------------------------
		//	set thumbnail
		//----------------------------------------------------------------
		const context = {
			query			: { athleteID: { $in: athleteIDs } },
			projection: { _id:0, athleteID:1, thumbnail:1, },
			limit			: 1000,
			sort			: { athleteID:1, },	
		};
		const athletes = await mongodb.find(mongoCFG.Medalbank.athletes, context);
		// console.log("athletes=", athletes.data);
		statistics.top1.forEach((time) => {
			if (time.athleteID) {
				const athlete = athletes.data.find(athlete => athlete.athleteID == time.athleteID);
				time.thumbnail = athlete.thumbnail ?? '';
				// console.log("---->", time.thumbnail);
			}
		})
		statistics.top3.forEach((leaderboard) => {
			leaderboard.times.forEach((time) => {
				if (time.athleteID) {
					const athlete = athletes.data.find(athlete => athlete.athleteID == time.athleteID);
					time.thumbnail = athlete.thumbnail ?? '';
					// console.log("---->", time.thumbnail);
				}
			})
		})
		
		//----------------------------------------------------------------
		// realtime leaderboard
		//----------------------------------------------------------------
		if (enforce || !statistics.leaderboardsToday) {
			// const todays = await LeaderboardModel.getLeaderboardRealtime({ type: "month", limit: 8 });
			const query = {
				style					: { $nin: ["individualMedley", "freestyleRelay", "medleyRelay"] },
				type					: "time",
				timeStamp			: { $gt: 0 },
				isMasters			: true,
				isAdult				: true,
				$or						: [ { status: { $exists: false } },{ status: "" }, ],
				fin						: { $exists: false },
			};
			const todays = await timeLibrary.getTimesForLeaderboardNew(query, 8);
			// const todays = await timeLibrary.getTimesForLeaderboardTopNew({ type: "time", group: "month", limit: 8 });
			statistics.leaderboardsToday = todays.leaderboards;
			// statistics.leaderboardsToday = todays.leaderboards.reduce((arr,lead) => {
			// 																								lead.times = timeLibrary.assignRanksMedalbank(lead.times);
			// 																								arr.push(lead);
			// 																								return arr;
			// 																							}, []);
			// console.log("-----> todays", statistics.leaderboardsToday.length, statistics.leaderboardsToday[0]);

			memoryDB.setStatistics("leaderboardsToday", statistics.leaderboardsToday);
		}
		//----------------------------------------------------------------
		// get upcoming events
		//----------------------------------------------------------------
		if (enforce || !statistics.upcomings) {
			statistics.upcomings = await StatisticsUtil.upcommings();
			memoryDB.setStatistics("mainNew.upcomings", statistics.upcomings);
		}
		//----------------------------------------------------------------


		//----------------------------------------------------------------
		// realtime
		//----------------------------------------------------------------
		statistics.realtime = {
			// 최근 합류한 선수
			joinedRecently: await StatisticsUtil.joinedRecently(),

			// 최근 측정한 선수
			measuredRecently: await StatisticsUtil.newMeasure(),
			// 최다 측정한 선수
			measuredMostly: await StatisticsUtil.newMeasure(),
			
			// 최근 검색어
			searchRecently: [								
			],
			// 최다 검색어
			searchMostly: [								
			],

			// 최근 검색된 대회
			competitionsRecently: [	
			],
			// 최다 검색된 대회
			competitionsMostly: [			
			],
			
			// 최근 검색된 선수
			athleteRecently: [								
			],
			// 최다 검색된 선수
			athleteMostly: [								
			],
		};

		// 신기록
		// const newRecord = await newRecords({});
		// const newRecordOld = await newRecords({});
		// statistics.newRecord = newRecordOld.data || [];

		const newRecord = await newRecordsNew({});
		statistics.newRecord = newRecord.data || [];
		console.log("statistics.newRecord=", statistics.top3[0], statistics.top3[1]);
		return statistics;



		//====================================================================
		//====================================================================
		//	현재 사용안함
		//====================================================================
		// console.log("statistics.leaderboardsToday=", statistics.leaderboardsToday);
		if (enforce || !statistics.leaderboardsMonth) {
			const months = await LeaderboardModel.getLeaderboardRealtime({ type: "month", limit: 8 });
			statistics.leaderboardsMonth = months.data;
			memoryDB.setStatistics("leaderboardsMonth", statistics.leaderboardsMonth);
		}

		if (enforce || !statistics.newMeasure) {
			statistics.newMeasure = await StatisticsUtil.newMeasure();
			memoryDB.setStatistics("newMeasure", statistics.newMeasure);
		}
		// console.log("statistics.newMeasure=", statistics.newMeasure);

		// 이번주 측정 많이한 선수
		if (enforce || !statistics.thisWeekMVP) {
			statistics.thisWeekMVP = await StatisticsUtil.thisWeekMVP();
			memoryDB.setStatistics("thisWeekMVP", statistics.thisWeekMVP);
		}		

		// 이번 달 측정 많이한 선수
		if (enforce || !statistics.thisMonthMVP) {
			statistics.thisMonthMVP = await StatisticsUtil.thisMonthMVP();
			memoryDB.setStatistics("thisMonthMVP", statistics.thisMonthMVP);
		}

		// 이번 시즌 측정 많이한 선수
		if (enforce || !statistics.seasonMVP) {
			statistics.seasonMVP = await StatisticsUtil.seasonMVP();
			memoryDB.setStatistics("seasonMVP", statistics.seasonMVP);
		}	

		// 최근경기에서 개인기록을 세운 선수
		if (enforce || !statistics.newRecord) {
			statistics.newRecord = await StatisticsUtil.newRecord();
			memoryDB.setStatistics("newRecord", statistics.newRecord);
		}

		// 마스터즈 수영 경기결과 최고기록
		if (enforce || !statistics.bestRecord) {
			statistics.bestRecord = await StatisticsUtil.bestRecord();
			memoryDB.setStatistics("bestRecord", statistics.bestRecord);
		}	
		//----------------------------------------------------------------
		// 측정
		// 최근 합류한 선수: { }
		// 최근 검색된 선수
		// 최다 검색된 선수
		// 최다 검색된 팀
		// 최다 검색된 수영장
		// 최다 검색된 대회
		// 최다 측정한 사람
		//----------------------------------------------------------------
		// statistics.realtime = await StaticLibrary.getStatistics(8);

		// const result = {
		// 	ranking		: await this.rankings(body),
		// 	upcomings	: [],	// [{ competitionID, dateStart, sido, fullname }]
		// 	top1			: [],	// [{ timeID, gender, style, distance, times, datetime, name}]
		// };
// console.log("-----> statistics.", statistics);
		return statistics;
	}

	// labs: new 20250625
	static async mainNew(body) {
		console.time("statisticsMain");
		let isChangeHour = checkHourly();
		const isChangeDate = checkMidnight();

		const enforce = true;
		// let statistics = memoryDB.getStatistics();
		let statistics = {};
		//----------------------------------------------------------------
		// get counts
		//----------------------------------------------------------------
		// if (!statistics.times) {
		// 	statistics = await memoryDB.loadStatics();
		// }
		// statistics.realtime = await StaticLibrary.getStatistics(8);

		//----------------------------------------------------------------
		// 이벤트 참여 숫자
		//----------------------------------------------------------------
		if (isChangeDate) {
			const athleteID = await mongodb.max(mongoCFG.Medalbank.athletes, "athleteID", {});
			statistics.athleteID = (athleteID - 1) % 100;
			_statistics.athleteID = statistics.athleteID;
			console.log("statistics.mainNew.athleteID=", statistics.athleteID);
		} else {
			statistics.athleteID = _statistics.athleteID;
		}

		//----------------------------------------------------------------
		// top3
		//----------------------------------------------------------------
		if (isChangeDate) {
			// .top3 = await StatisticsUtil.topN({}, 3);
			// return@ { data, count }
			await loadTop3();

			await loadTop1();

			await loadNewRecord();
			isChangeHour = checkHourly();
		}
		statistics.top3 = _statistics.top3;
		statistics.newRecord = _statistics.newRecord;
		// console.log("!!!!!!!!!!!!!!!", statistics.top3);

		//----------------------------------------------------------------
		// top1
		//----------------------------------------------------------------
		if (isChangeHour) {
			await loadTop1();
		}
		statistics.top1 = _statistics.top1;
		statistics.compression = _statistics.compression;
		//----------------------------------------------------------------


		//----------------------------------------------------------------
		// new record
		//----------------------------------------------------------------
		console.log("statistics.newRecord=", statistics.top1.length, statistics.top3.length, statistics.newRecord.length);

		console.timeEnd("statisticsMain");
		return statistics;
		
		
		//----------------------------------------------------------------
		// realtime leaderboard
		//----------------------------------------------------------------
		if (enforce || !statistics.leaderboardsToday) {
			// const todays = await LeaderboardModel.getLeaderboardRealtime({ type: "month", limit: 8 });
			const query = {
				style					: { $nin: ["individualMedley", "freestyleRelay", "medleyRelay"] },
				type					: "time",
				timeStamp			: { $gt: 0 },
				isMasters			: true,
				isAdult				: true,
				$or						: [ { status: { $exists: false } },{ status: "" }, ],
				fin						: { $exists: false },
			};
			const todays = await timeLibrary.getTimesForLeaderboardNew(query, 8);
			// const todays = await timeLibrary.getTimesForLeaderboardTopNew({ type: "time", group: "month", limit: 8 });
			statistics.leaderboardsToday = todays.leaderboards;
			// statistics.leaderboardsToday = todays.leaderboards.reduce((arr,lead) => {
			// 																								lead.times = timeLibrary.assignRanksMedalbank(lead.times);
			// 																								arr.push(lead);
			// 																								return arr;
			// 																							}, []);
			// console.log("-----> todays", statistics.leaderboardsToday.length, statistics.leaderboardsToday[0]);

			memoryDB.setStatistics("leaderboardsToday", statistics.leaderboardsToday);
		}
		//----------------------------------------------------------------
		// get upcoming events
		//----------------------------------------------------------------
		if (enforce || !statistics.upcomings) {
			statistics.upcomings = await StatisticsUtil.upcommings();
			memoryDB.setStatistics("mainNew.upcomings", statistics.upcomings);
		}
		//----------------------------------------------------------------


		//----------------------------------------------------------------
		// realtime
		//----------------------------------------------------------------
		statistics.realtime = {
			// 최근 합류한 선수
			joinedRecently: await StatisticsUtil.joinedRecently(),

			// 최근 측정한 선수
			measuredRecently: await StatisticsUtil.newMeasure(),
			// 최다 측정한 선수
			measuredMostly: await StatisticsUtil.newMeasure(),
			
			// 최근 검색어
			searchRecently: [								
			],
			// 최다 검색어
			searchMostly: [								
			],

			// 최근 검색된 대회
			competitionsRecently: [	
			],
			// 최다 검색된 대회
			competitionsMostly: [			
			],
			
			// 최근 검색된 선수
			athleteRecently: [								
			],
			// 최다 검색된 선수
			athleteMostly: [								
			],
		};

		// 신기록
		// const newRecord = await newRecords({});
		// const newRecordOld = await newRecords({});
		// statistics.newRecord = newRecordOld.data || [];

		return statistics;
	}
	// labs
	static async main(body) {
		const enforce = true;
		let statistics = memoryDB.getStatistics();
		//----------------------------------------------------------------
		// get counts
		//----------------------------------------------------------------
		if (!statistics.times) {
			statistics = await memoryDB.loadStatics();
		}
		statistics.realtime = await StaticLibrary.getStatistics(8);

		//----------------------------------------------------------------
		// 이벤트 참여 숫자
		//----------------------------------------------------------------
		const athleteID = await mongodb.max(mongoCFG.Medalbank.athletes, "athleteID", {});
		statistics.athleteID = (athleteID - 1) % 100;
		console.log("statistics.mainNew.athleteID=", statistics.athleteID);

		//----------------------------------------------------------------
		// top1
		//----------------------------------------------------------------
		if (enforce || !statistics.top1) {
			// return@ { times, compression }
			const top1 = await timeLibrary.getTimesForLeaderboardTop1();
			// console.log("top1=", top1);
			statistics.compression = top1.compression ?? {};
			statistics.top1 = top1.times; 
			console.log("mainNew-----> top1", statistics.top1.length, statistics.top1[0]);

			memoryDB.setStatistics("top1", statistics.top1);
		}
		const athleteIDs = [...new Set(statistics.top1.filter(el => el.athleteID).map(entry => entry.athleteID))];

		//----------------------------------------------------------------

		//----------------------------------------------------------------
		// top3
		//----------------------------------------------------------------
		if (enforce || !statistics.top3) {
			// .top3 = await StatisticsUtil.topN({}, 3);
			// return@ { data, count }
			const query = {
				$and: [
					{ $or				: [
							{ style	: "individualMedley", distance: "200M" }, 
							{ style	: { $in: ["freestyle", "backstroke", "breaststroke", "butterfly"]}, distance: "50M" }
						],
					},
					{ $or 			: [{ status: "" }, { status: { $exists: false } }], }
				],
				timeStamp			: { $gt: 0 },
				isMasters			: true,
				isAdult				: true,
				type					: "time",
				$or						: [ { status: { $exists: false } },{ status: "" }, ],
				fin						: { $exists: false },
			};
			// const top3 = await timeLibrary.getTimesForLeaderboardTopNew(body);
			const top3 = await timeLibrary.getTimesForLeaderboardNew(query, 3);
			
			statistics.top3 = top3.leaderboards.reduce((arr,lead) => {
																									// lead.times = timeLibrary.assignRanksMedalbank(lead.times);
																									lead.times = lead.times.reduce((arr, time) => {
																									const value = {
																										athleteID				: time.athleteID,
																										name						: time.name,
																										time						: time.time,
																										// tumbnail				: time.tumbnail,
																										rank						: time.rank,
																									}
																									if (!athleteIDs.includes(time.athleteID)) athleteIDs.push(time.athleteID);
																									arr.push(value);
																									return arr;
																								}, []);
																						arr.push(lead);
																						return arr;
																					}, []);
			memoryDB.setStatistics("mainNew.top3", statistics.top3);
			
			console.log("mainNew.-----> top3", statistics.top3.length, statistics.top3[0]);
		}
		// console.log("!!!!!!!!!!!!!!!", statistics.top3);

		//----------------------------------------------------------------
		//	set thumbnail
		//----------------------------------------------------------------
		const context = {
			query			: { athleteID: { $in: athleteIDs } },
			projection: { _id:0, athleteID:1, thumbnail:1, },
			limit			: 1000,
			sort			: { athleteID:1, },	
		};
		const athletes = await mongodb.find(mongoCFG.Medalbank.athletes, context);
		// console.log("athletes=", athletes.data);
		statistics.top1.forEach((time) => {
			if (time.athleteID) {
				const athlete = athletes.data.find(athlete => athlete.athleteID == time.athleteID);
				time.thumbnail = athlete.thumbnail ?? '';
				// console.log("---->", time.thumbnail);
			}
		})
		statistics.top3.forEach((leaderboard) => {
			leaderboard.times.forEach((time) => {
				if (time.athleteID) {
					const athlete = athletes.data.find(athlete => athlete.athleteID == time.athleteID);
					time.thumbnail = athlete.thumbnail ?? '';
					// console.log("---->", time.thumbnail);
				}
			})
		})
		
		//----------------------------------------------------------------
		// realtime leaderboard
		//----------------------------------------------------------------
		if (enforce || !statistics.leaderboardsToday) {
			// const todays = await LeaderboardModel.getLeaderboardRealtime({ type: "month", limit: 8 });
			const query = {
				style					: { $nin: ["individualMedley", "freestyleRelay", "medleyRelay"] },
				type					: "time",
				timeStamp			: { $gt: 0 },
				isMasters			: true,
				isAdult				: true,
				$or						: [ { status: { $exists: false } },{ status: "" }, ],
				fin						: { $exists: false },
			};
			const todays = await timeLibrary.getTimesForLeaderboardNew(query, 8);
			// const todays = await timeLibrary.getTimesForLeaderboardTopNew({ type: "time", group: "month", limit: 8 });
			statistics.leaderboardsToday = todays.leaderboards;
			// statistics.leaderboardsToday = todays.leaderboards.reduce((arr,lead) => {
			// 																								lead.times = timeLibrary.assignRanksMedalbank(lead.times);
			// 																								arr.push(lead);
			// 																								return arr;
			// 																							}, []);
			// console.log("-----> todays", statistics.leaderboardsToday.length, statistics.leaderboardsToday[0]);

			memoryDB.setStatistics("leaderboardsToday", statistics.leaderboardsToday);
		}
		//----------------------------------------------------------------
		// get upcoming events
		//----------------------------------------------------------------
		if (enforce || !statistics.upcomings) {
			statistics.upcomings = await StatisticsUtil.upcommings();
			memoryDB.setStatistics("mainNew.upcomings", statistics.upcomings);
		}
		//----------------------------------------------------------------


		//----------------------------------------------------------------
		// realtime
		//----------------------------------------------------------------
		statistics.realtime = {
			// 최근 합류한 선수
			joinedRecently: await StatisticsUtil.joinedRecently(),

			// 최근 측정한 선수
			measuredRecently: await StatisticsUtil.newMeasure(),
			// 최다 측정한 선수
			measuredMostly: await StatisticsUtil.newMeasure(),
			
			// 최근 검색어
			searchRecently: [								
			],
			// 최다 검색어
			searchMostly: [								
			],

			// 최근 검색된 대회
			competitionsRecently: [	
			],
			// 최다 검색된 대회
			competitionsMostly: [			
			],
			
			// 최근 검색된 선수
			athleteRecently: [								
			],
			// 최다 검색된 선수
			athleteMostly: [								
			],
		};

		// 신기록
		// const newRecord = await newRecords({});
		const newRecord = await newRecords({});
		statistics.newRecord = newRecord.data || [];
		console.log("statistics.newRecord=", statistics.top3[0], statistics.top3[1]);
		return statistics;



		//====================================================================
		//====================================================================
		//	현재 사용안함
		//====================================================================
		// console.log("statistics.leaderboardsToday=", statistics.leaderboardsToday);
		if (enforce || !statistics.leaderboardsMonth) {
			const months = await LeaderboardModel.getLeaderboardRealtime({ type: "month", limit: 8 });
			statistics.leaderboardsMonth = months.data;
			memoryDB.setStatistics("leaderboardsMonth", statistics.leaderboardsMonth);
		}

		if (enforce || !statistics.newMeasure) {
			statistics.newMeasure = await StatisticsUtil.newMeasure();
			memoryDB.setStatistics("newMeasure", statistics.newMeasure);
		}
		// console.log("statistics.newMeasure=", statistics.newMeasure);

		// 이번주 측정 많이한 선수
		if (enforce || !statistics.thisWeekMVP) {
			statistics.thisWeekMVP = await StatisticsUtil.thisWeekMVP();
			memoryDB.setStatistics("thisWeekMVP", statistics.thisWeekMVP);
		}		

		// 이번 달 측정 많이한 선수
		if (enforce || !statistics.thisMonthMVP) {
			statistics.thisMonthMVP = await StatisticsUtil.thisMonthMVP();
			memoryDB.setStatistics("thisMonthMVP", statistics.thisMonthMVP);
		}

		// 이번 시즌 측정 많이한 선수
		if (enforce || !statistics.seasonMVP) {
			statistics.seasonMVP = await StatisticsUtil.seasonMVP();
			memoryDB.setStatistics("seasonMVP", statistics.seasonMVP);
		}	

		// 최근경기에서 개인기록을 세운 선수
		if (enforce || !statistics.newRecord) {
			statistics.newRecord = await StatisticsUtil.newRecord();
			memoryDB.setStatistics("newRecord", statistics.newRecord);
		}

		// 마스터즈 수영 경기결과 최고기록
		if (enforce || !statistics.bestRecord) {
			statistics.bestRecord = await StatisticsUtil.bestRecord();
			memoryDB.setStatistics("bestRecord", statistics.bestRecord);
		}	
		//----------------------------------------------------------------
		// 측정
		// 최근 합류한 선수: { }
		// 최근 검색된 선수
		// 최다 검색된 선수
		// 최다 검색된 팀
		// 최다 검색된 수영장
		// 최다 검색된 대회
		// 최다 측정한 사람
		//----------------------------------------------------------------
		// statistics.realtime = await StaticLibrary.getStatistics(8);

		// const result = {
		// 	ranking		: await this.rankings(body),
		// 	upcomings	: [],	// [{ competitionID, dateStart, sido, fullname }]
		// 	top1			: [],	// [{ timeID, gender, style, distance, times, datetime, name}]
		// };
// console.log("-----> statistics.", statistics);
		return statistics;
	}
	// labs
	static async mainOld(body) {
		const enforce = true;
		let statistics = memoryDB.getStatistics();
		//----------------------------------------------------------------
		// get counts
		//----------------------------------------------------------------
		if (!statistics.times) {
			statistics = await memoryDB.loadStatics();
		}
		statistics.realtime = await StaticLibrary.getStatistics(8);

		//----------------------------------------------------------------
		// 이벤트 참여 숫자
		//----------------------------------------------------------------
		const athleteID = await mongodb.max(mongoCFG.Medalbank.athletes, "athleteID", {});
		statistics.athleteID = (athleteID - 1) % 100;
		console.log("statistics.athleteID=", statistics.athleteID);

		//----------------------------------------------------------------
		// top1
		//----------------------------------------------------------------
		if (enforce || !statistics.top1) {
			// return@ { times, compression }
			const top1 = await timeLibrary.getTimesForLeaderboardTop1();
			// console.log("top1=", top1);
			statistics.compression = top1.compression ?? {};
			statistics.top1 = top1.times; 
			console.log("-----> top1", statistics.top1.length, statistics.top1[0]);

			memoryDB.setStatistics("top1", statistics.top1);
		}
		const athleteIDs = [...new Set(statistics.top1.filter(el => el.athleteID).map(entry => entry.athleteID))];

		//----------------------------------------------------------------

		//----------------------------------------------------------------
		// top3
		//----------------------------------------------------------------
		if (enforce || !statistics.top3) {
			// .top3 = await StatisticsUtil.topN({}, 3);
			// return@ { data, count }
			const query = {
				$and: [
					{ $or				: [
							{ style	: "individualMedley", distance: "200M" }, 
							{ style	: { $in: ["freestyle", "backstroke", "breaststroke", "butterfly"]}, distance: "50M" }
						],
					},
					{ $or 			: [{ status: "" }, { status: { $exists: false } }], }
				],
				timeStamp			: { $gt: 0 },
				isMasters			: true,
				isAdult				: true,
				type					: "time",
				$or						: [ { status: { $exists: false } },{ status: "" }, ],
				fin						: { $exists: false },
			};
			// const top3 = await timeLibrary.getTimesForLeaderboardTopNew(body);
			const top3 = await timeLibrary.getTimesForLeaderboardNew(query, 3);
			
			statistics.top3 = top3.leaderboards.reduce((arr,lead) => {
																									// lead.times = timeLibrary.assignRanksMedalbank(lead.times);
																									lead.times = lead.times.reduce((arr, time) => {
																									const value = {
																										athleteID				: time.athleteID,
																										name						: time.name,
																										time						: time.time,
																										// tumbnail				: time.tumbnail,
																										rank						: time.rank,
																									}
																									if (!athleteIDs.includes(time.athleteID)) athleteIDs.push(time.athleteID);
																									arr.push(value);
																									return arr;
																								}, []);
																						arr.push(lead);
																						return arr;
																					}, []);
			memoryDB.setStatistics("top3", statistics.top3);
			
			console.log("-----> top3", statistics.top3.length, statistics.top3[0]);
		}
		// console.log("!!!!!!!!!!!!!!!", statistics.top3);

		//----------------------------------------------------------------
		//	set thumbnail
		//----------------------------------------------------------------
		const context = {
			query			: { athleteID: { $in: athleteIDs } },
			projection: { _id:0, athleteID:1, thumbnail:1, },
			limit			: 1000,
			sort			: { athleteID:1, },	
		};
		const athletes = await mongodb.find(mongoCFG.Medalbank.athletes, context);
		// console.log("athletes=", athletes.data);
		statistics.top1.forEach((time) => {
			if (time.athleteID) {
				const athlete = athletes.data.find(athlete => athlete.athleteID == time.athleteID);
				time.thumbnail = athlete.thumbnail ?? '';
				// console.log("---->", time.thumbnail);
			}
		})
		statistics.top3.forEach((leaderboard) => {
			leaderboard.times.forEach((time) => {
				if (time.athleteID) {
					const athlete = athletes.data.find(athlete => athlete.athleteID == time.athleteID);
					time.thumbnail = athlete.thumbnail ?? '';
					// console.log("---->", time.thumbnail);
				}
			})
		})


		
		//----------------------------------------------------------------
		// realtime leaderboard
		//----------------------------------------------------------------
		if (enforce || !statistics.leaderboardsToday) {
			// const todays = await LeaderboardModel.getLeaderboardRealtime({ type: "month", limit: 8 });
			const query = {
				style					: { $nin: ["individualMedley", "freestyleRelay", "medleyRelay"] },
				type					: "time",
				timeStamp			: { $gt: 0 },
				isMasters			: true,
				isAdult				: true,
				$or						: [ { status: { $exists: false } },{ status: "" }, ],
				fin						: { $exists: false },
			};
			const todays = await timeLibrary.getTimesForLeaderboardNew(query, 8);
			// const todays = await timeLibrary.getTimesForLeaderboardTopNew({ type: "time", group: "month", limit: 8 });
			statistics.leaderboardsToday = todays.leaderboards;
			// statistics.leaderboardsToday = todays.leaderboards.reduce((arr,lead) => {
			// 																								lead.times = timeLibrary.assignRanksMedalbank(lead.times);
			// 																								arr.push(lead);
			// 																								return arr;
			// 																							}, []);
			// console.log("-----> todays", statistics.leaderboardsToday.length, statistics.leaderboardsToday[0]);

			memoryDB.setStatistics("leaderboardsToday", statistics.leaderboardsToday);
		}
		//----------------------------------------------------------------
		// get upcoming events
		//----------------------------------------------------------------
		if (enforce || !statistics.upcomings) {
			statistics.upcomings = await StatisticsUtil.upcommings();
			memoryDB.setStatistics("upcomings", statistics.upcomings);
		}
		//----------------------------------------------------------------


		//----------------------------------------------------------------
		// realtime
		//----------------------------------------------------------------
		statistics.realtime = {
			// 최근 합류한 선수
			joinedRecently: await StatisticsUtil.joinedRecently(),
			// 최근 측정한 선수
			recentlyAthletes: await StatisticsUtil.newMeasure(),
			// 최근 검색어
			search: [								
			],
			// 최다 검색된 선수
			mostAthletes: [					
			],
			// 최근 검색된 대회
			competitionsRecently: [	
			],
			// 최다 검색된 대회
			competitionsMost: [			
			],

		};
		return statistics;



		//====================================================================
		//====================================================================
		//	현재 사용안함
		//====================================================================
		// console.log("statistics.leaderboardsToday=", statistics.leaderboardsToday);
		if (enforce || !statistics.leaderboardsMonth) {
			const months = await LeaderboardModel.getLeaderboardRealtime({ type: "month", limit: 8 });
			statistics.leaderboardsMonth = months.data;
			memoryDB.setStatistics("leaderboardsMonth", statistics.leaderboardsMonth);
		}

		if (enforce || !statistics.newMeasure) {
			statistics.newMeasure = await StatisticsUtil.newMeasure();
			memoryDB.setStatistics("newMeasure", statistics.newMeasure);
		}
		// console.log("statistics.newMeasure=", statistics.newMeasure);

		// 이번주 측정 많이한 선수
		if (enforce || !statistics.thisWeekMVP) {
			statistics.thisWeekMVP = await StatisticsUtil.thisWeekMVP();
			memoryDB.setStatistics("thisWeekMVP", statistics.thisWeekMVP);
		}		

		// 이번 달 측정 많이한 선수
		if (enforce || !statistics.thisMonthMVP) {
			statistics.thisMonthMVP = await StatisticsUtil.thisMonthMVP();
			memoryDB.setStatistics("thisMonthMVP", statistics.thisMonthMVP);
		}

		// 이번 시즌 측정 많이한 선수
		if (enforce || !statistics.seasonMVP) {
			statistics.seasonMVP = await StatisticsUtil.seasonMVP();
			memoryDB.setStatistics("seasonMVP", statistics.seasonMVP);
		}	

		// 최근경기에서 개인기록을 세운 선수
		if (enforce || !statistics.newRecord) {
			statistics.newRecord = await StatisticsUtil.newRecord();
			memoryDB.setStatistics("newRecord", statistics.newRecord);
		}

		// 마스터즈 수영 경기결과 최고기록
		if (enforce || !statistics.bestRecord) {
			statistics.bestRecord = await StatisticsUtil.bestRecord();
			memoryDB.setStatistics("bestRecord", statistics.bestRecord);
		}	
		//----------------------------------------------------------------
		// 측정
		// 최근 합류한 선수: { }
		// 최근 검색된 선수
		// 최다 검색된 선수
		// 최다 검색된 팀
		// 최다 검색된 수영장
		// 최다 검색된 대회
		// 최다 측정한 사람
		//----------------------------------------------------------------
		// statistics.realtime = await StaticLibrary.getStatistics(8);

		// const result = {
		// 	ranking		: await this.rankings(body),
		// 	upcomings	: [],	// [{ competitionID, dateStart, sido, fullname }]
		// 	top1			: [],	// [{ timeID, gender, style, distance, times, datetime, name}]
		// };
// console.log("-----> statistics.", statistics);
		return statistics;
	}
//####################################################################
//########## Confirm #################################################
//####################################################################

	// find statics
	static async rankings(body) {
		await memoryDB.initialize();
		return await memoryDB.getStatistics(); 
	}

	// labs
	static async top1(body) {
		
		//----------------------------------------------------------------
		// realtime leaderboard
		//----------------------------------------------------------------
		const todays = await LeaderboardModel.getLeaderboardRealtime({ type: "day", limit: 8 });
		return todays
	}

	// clear 전체 statistics
	static clearMemory = (body) => StaticLibrary.clearMemory();
	// load 전체 statistics
	static loadMemory = (body) => StaticLibrary.loadMemory(body.limit ?? 100);
	// get 전체 statistics
	static getStatistics = (body) => StaticLibrary.getStatistics(body.limit);
	// 최다 검색된 시간: [{ timeID, name, count }]
	static getAthletesMemory = (body) => StaticLibrary.getAthletesMemory(body.limit);
	// 최근 검색된 선수: [{ athleteID, name, datetime }]
	static getTimesMemory = (body) => StaticLibrary.getTimesMemory(body.limit);
	// 최다 검색된 팀: [{ teamID, name, count }]
	static getTeamsMemory = (body) => StaticLibrary.getTeamsMemory(body.limit);
	// 최다 검색된 수영장: [{ poolID, name, count }]
	static getPoolsMemory = (body) => StaticLibrary.getPoolsMemory(body.limit);
	// 최다 검색된 대회: [{ competitionID, name, count }]
	static getCompetitionsMemory = (body) => StaticLibrary.getCompetitionsMemory(body.limit);
	// 최근 측정한 선수: [{ athleteID, name, datetime }]
	static getMeasuredRecent = (body) => StaticLibrary.getMeasuredRecent(body.limit);
	// 최다 측정한 선수: [{ athleteID, name, datetime }]
	static getMeasuredMost = (body) => StaticLibrary.getMeasuredMost(body.limit);
	// 최다 검색어
	static getSearchCount = (body) => StaticLibrary.getSearchCount(body.limit);
	// 최근 검색어
	static getSearchRecent = (body) => StaticLibrary.getSearchRecent(body.limit);
	// 최근 합류한 선수
	static getJoined = (body) => StaticLibrary.getJoined(body.limit);

}

module.exports = StaticModel;

