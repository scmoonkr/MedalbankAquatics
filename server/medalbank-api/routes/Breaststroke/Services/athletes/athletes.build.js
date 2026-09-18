const _    			= require('lodash');
const extend 		= require('node.extend');


//============================================
const mskCFG    	= require('../../Config/mskCFG.js');
const MongoDB     = require('../../Class/MongoDB.js');
const mongoCFG    = require('../../Config/mongoCFG.js');
const mongodb     = new MongoDB(mongoCFG.Medalbank.database);
const UtilDate		= require("../../Class/DateLibrary");
const utilDate		= new UtilDate();

const TimeModel 	= require('../times/times.model.js');
const TimeLibrary = require('../../Class/TimeLibrary.js');

const timeLibrary = new TimeLibrary();

const collectionName = mongoCFG.Medalbank.leaderboard;


/**
 * times를 이용하여 athlete에 통계 정보를 추가합니다.
 * @param {*} times 
 * @returns 
 */
exports.makeAthletesStatistics = async (athleteID, times) => {
	if (times.length == 0) return {};

	const eventTimes			= times.filter(time => time.competitionID > 0);
	const timeTimes				= times.filter(time => time.competitionID == undefined ||
																							 time.competitionID == 0);
	const statistics = {
		athleteID					: athleteID,
		timeCount					: times.length,						// time count
		// athleteCount			: allAthleteIDs.length,		// athlete count
		timeTimeCount			: timeTimes.length,				// event time count
		// timeAthleteCount	: timeAthleteIDs.length,	// event athlete count
		eventTimeCount		: eventTimes.length,			// event time count
		// eventAthleteCount	: eventAthleteIDs.length,	// event athlete count
	};

	statistics.majorStyles  		= timeLibrary.getStylesByCount(times);
	statistics.competitions 		= timeLibrary.getCompetitionsByCount(times);
	statistics.teams        		= timeLibrary.getTeamsByCount(times);
	statistics.pools        		= timeLibrary.getPoolsByCount(times);
	statistics.cities       		= timeLibrary.getSidosByCount(times);  
	// statistics.medals       		= timeLibrary.countMedalsByStyleAndGender(times);
	statistics.medals       		= timeLibrary.calculateMedals(times);

	statistics.firstEvent				= timeLibrary.findFirstTime(eventTimes);
	statistics.latestEvent			= timeLibrary.findLatestTime(eventTimes);
	statistics.bestEvent				= timeLibrary.calculateBestTimeWithSeason(eventTimes);

	statistics.firstTime				= timeLibrary.findFirstTime(timeTimes);
	statistics.latestTime				= timeLibrary.findLatestTime(timeTimes);
	statistics.bestTime					= timeLibrary.calculateBestTimeWithSeason(timeTimes);
	statistics.timekeeper				= timeLibrary.getTimekeepersByCount(timeTimes);

	return statistics;
}
/**
 * create athlete statistics
 * @param {*} time 
 */
async function createStatistics(time, isSeason) {
	const statistics = {
		athleteID	: time.athleteID,
		timeCount		: 1,
		bestEvent		: [],
		firstEvent	: {},
		latestEvent	: {},
		bestTime		: [],
		firstTime		: {},
		latestTime	: {},
		medals		: {},
		majorStyles	: [ { style: time.style, count: 1 } ],
		pools				: [],
		teams					: [],
		timekeeper	: [],
	};
	if (time.poolID) statistics.pools = [ { poolID: time.poolID, count: 1 } ];
	if (time.teamID) statistics.teams = [ { teamID: time.teamID, count: 1 } ];
	
	// update athletes_statistics_medalbank
	// 새로운 종목 기록 추가
	const obj = {
		style					: time.style,
		course				: time.course,
		distance			: time.distance,
		timeCount			: 1,
		seasonTimeCount: 0,
		average				: time.time,
		// averageSeason	: time.time,
		best: {
			timeID		: time.timeID,
			time			: time.time,
			datetime	: time.datetime,
		},
		bestSeason: {},
	};
	// 시즌 기록인 경우 시즌 최고기록 추가
	if (isSeason) {
		obj.averageSeason = time.time;
		obj.seasonTimeCount = 1;
		obj.bestSeason = {
				timeID		: time.timeID,
				time			: time.time,
				datetime	: time.datetime,
			}
	}
	if (time.competitionID > 0) { // 대회기록
		statistics.bestEvent = [ obj ];
		statistics.firstEvent = time;
		statistics.latestEvent = time;	
		statistics.eventTimeCount = 1;
		statistics.timeTimeCount = 0;
	} else { // 훈련기록
		statistics.bestTime = [ obj ];
		statistics.firstTime = time;
		statistics.latestTime = time;
		statistics.timeTimeCount = 1;
		statistics.eventTimeCount = 0;
		if (time.timekeeper) statistics.timekeeper = [ { athleteID: time.timekeeper, count: 1 } ];
	}
	// set medals
	if (time.rank == 1) statistics.medals = { gold	: 1 };
	if (time.rank == 2) statistics.medals = { silver: 1 };
	if (time.rank == 3) statistics.medals = { bronze: 1 };

	//---------------------------------------
	await mongodb.insertOne(collectionName, statistics);
	//---------------------------------------

	return statistics;
}
/**
 * 
 * @param {*} resultType: true - event, false - time 
 * @param {*} time : insert할 기록
 * @param {*} statistics
 */
async function insertEventTime(time, statistics1, isSeason) {

	const statistics = {
		athleteID		: time.athleteID,
		timeCount		: 1,
		bestEvent		: [],
		firstEvent	: {},
		latestEvent	: {},
		bestTime		: [],
		firstTime		: {},
		latestTime	: {},
		medals			: {},
		majorStyles	: [ { style: time.style, count: 1 } ],
		pools				: [],
		teams				: [],
		timekeeper	: [],
	};
	if (time.poolID) statistics.pools = [ { poolID: time.poolID, count: 1 } ];
	if (time.teamID) statistics.teams = [ { teamID: time.teamID, count: 1 } ];

	if (time.competitionID > 0) {

	} else {

	}
}

/**
 * update athletes_medalbank, athletes_statistics_medalbank 
 * @param {*} time 
 * @param {*} statistics 
 */
async function updateAthleteRelated(time, athlete, statistics) {
	// 0. update athletes_statistics_medalbank
	//---------------------------------------
	const query = { athleteID: time.athleteID };
	await mongodb.updateOne(collectionName, query, statistics);

	// 1. update athletes_medalbank
	//	  - timeCount, athleCount
	//	  - 최근 timekeeper
	//	  - 최근 pools
	//	  - 최근 competitions
	const value = {
		timeCount			: statistics.timeCount,
		eventTimeCount: statistics.eventTimeCount,
		timeTimeCount	: statistics.timeTimeCount,
	};
	if (time.timekeeper) {
		value.timekeeper = time.timekeeper;
	}
	if (time.poolID) {
		value.poolID = time.poolID;
	}
	if (time.teamID) {
		value.teamID = time.teamID;
	}
	if (time.competitionID) {
		value.competitionID = time.competitionID;
	}
	await mongodb.updateOne(mongoCFG.Medalbank.athletes, query, value);
	//---------------------------------------
}

/**
 * update competitions, teams, pools, leaderboard
 * @param {*} time 
 * @param {*} statistics 
 */
async function updateTimeRelatedDB(time, statistics) {
	// 2. update competitions
	// 3. update teams
	// 4. update pools
	// 5. update leaderboard
}
/**
 * 
 * @param {*} resultType: true - event, false - time 
 * @param {*} time : update할 기록
 * @param {*} index: bestTime의 index번째 값
 * @param {*} statistics
 */
async function updateEventTime(time, index, statistics, isSeason) {
	const best = statistics.bestEvent[index];
	// 평균 타임 계산
	const sum = utilDate.convertString2Timestamp(best.average) * best.timeCount + time.timeStamp;
	best.timeCount++;
	best.average = utilDate.convertTimestamp2string(sum / best.timeCount);
	
	// 평균 기록 계산
	if (isSeason) {
		const sum = utilDate.convertString2Timestamp(best.averageSeason) * best.seasonTimeCount + time.timeStamp;
		best.seasonTimeCount++;
		best.average = utilDate.convertTimestamp2string(sum / seasonTimeCount);
		best.seasonTimeCount++;
	}

	let isrecordUpdated = false;
	// check best updated
	if (utilDate.convertString2Timestamp(best.best.time) > time.timeStamp) {
		best.best = {
			timeID: time.timeID,
			time: time.time,
			datetime: new Date(time.datetime).toISOString().slice(0, 10),
		};
		isrecordUpdated = true;
	}
	// check season best updated
	if (!best.bestSeason.time ||
			utilDate.convertString2Timestamp(best.bestSeason.time) > time.timeStamp) {
		best.bestSeason = {
			timeID: time.timeID,
			time: time.time,
			datetime: new Date(time.datetime).toISOString().slice(0, 10),
		};
	}
	statistics.bestEvent[index] = best;

	await updateAthleteRelated(time, statistics);

	if (isrecordUpdated) {
		await updateTimeRelatedDB(time, statistics);
	}

	return statistics;
}
/**
 * 
 * @param {*} resultType: true - event, false - time 
 * @param {*} time : insert할 기록
 * @param {*} statistics
 */
async function insertTimeTime(time, statistics, isSeason) {

}
/**
 * 
 * @param {*} resultType: true - event, false - time 
 * @param {*} time : update할 기록
 * @param {*} index: bestTime의 index번째 값
 * @param {*} statistics
 */
async function updateTimeTime(time, index, statistics, isSeason) {
}
/**
 * 기록(time)으로 athletesStatisticsMB 업데이트
 * @param {*} time 
 * @returns 
 */
exports.checkNupdateAthleteStatistics = async (time) => {

	// 현재 연도와 시즌 여부 체크
	const currentYear = new Date().getFullYear();
	const isSeason = currentYear == new Date(time.datetime).getFullYear();

	const datetime = new Date(time.datetime).toISOString().slice(0, 10);

	// 경기기록?, 훈련기록
	const resultType = time.competitionID > 0;

	const timeOBJ = {
		athleteID	: time.athleteID,
		timeID		: time.timeID,
		style			: time.style,
		course		: time.course,
		distance	: time.distance,
		time			: time.time,
		timeStamp	: time.timeStamp,
		rank			: time.rank,
		datetime	: new Date(time.datetime).toISOString().slice(0, 10),
		teamID		: time.teamID,
	};
	if (time.competitionID) timeOBJ.competitionID = time.competitionID;
	if (time.poolID				) timeOBJ.poolID = time.poolID;
	if (time.teamID				) timeOBJ.teamID = time.teamID;
	
	//--------------------------------------------
	// athlete정보 가져오기
	//--------------------------------------------
	const projection = resultType // 훈련기록?
											? { bestEvent:1, firstEvent:1, latestEvent:1, evnetTimeCount:1, competitions:1, }
											: { bestTime:1, firstTime:1, latestTime:1, timeTimeCount:1, };
	const result = await mongodb.findOne(collectionName,
																			 { athleteID: time.athleteID },
																			 { _id:0, ...projection, athleteID:1, cities:1, majorStyles:1, medals:1, pools:1, teams:1, timeCount:1, timekeeper:1, },
																			)
	// result.data.athleteID = 0;
	if (!result.data.athleteID) {
		await createStatistics(timeOBJ, isSeason);
		return;
	}

	let statistics = extend(true, {}, result.data);
console.log("statistics=", statistics);

	//--------------------------------------------
	// 9. check bestEvent, bestTime
	//--------------------------------------------
	let index;
	let best = resultType ? statistics.bestEvent : statistics.bestTime;
	index = best.findIndex(item => item.style == time.style &&
																	item.course == time.course &&
																	item.distance == time.distance);
	if (index < 0) {
		if (resultType) { // event
			await insertEventTime(timeOBJ, statistics, isSeason);
		} else { // time
			await insertTimeTime(timeOBJ, statistics, isSeason);
		}
	} else {
		if (resultType) { // event
			await updateEventTime(timeOBJ, index, statistics, isSeason);
		} else { // time
			await updateTimeTime(timeOBJ, index, statistics, isSeason);
		}
	}

	return;

	// 1. timeCount, timeTimeCount, 
	statistics.timeCount++;;
	// check event, time
	if (time.competitionID) { // event
		statistics.eventTimeCount++;;
		
		//--------------------------------------------
		// 3. competition 추가
		//--------------------------------------------
		if (time.competitionID) {
			const competitionID = Number(time.competitionID);
			// ID인 대회의 인덱스 찾기
			index = statistics.competitions.findIndex(item => item.competitionID == competitionID);
			if (index < 0) {
				const medals = { gold: 0, silver: 0, bronze: 0 };
				switch (time.rank) {
					case 1: medals.gold = 1; break;
					case 2: medals.silver = 1; break;
					case 3: medals.bronze = 1; break;
				} 
				statistics.competitions.push({
					competitionID	: competitionID,
					medals				: medals,
					count					: 0,
				});	
			} else {
				statistics.competitions[index].medals = statistics.competitions[index].medals ?? {};
				switch (time.rank) {
					case 1: statistics.competitions[index].medals.gold = 1; break;
					case 2: statistics.competitions[index].medals.silver = 1; break;
					case 3: statistics.competitions[index].medals.bronze = 1; break;
				} 
			}
		}

		//--------------------------------------------
		// 7. first가 없으면 추가
		//--------------------------------------------
		if (!statistics.firstEvent) {
			statistics.firstEvent = {
				competitionID	: time.competitionID,
				poolID				: time.poolID,
				timeID				: time.timeID,
				time					: time.time,
				// timeStamp			: time.timeStamp,
				// rank					: time.rank,
				style					: time.style,
				course				: time.course,
				distance			: time.distance,
			}
			if (time.rank) statistics.firstEvent.rank = time.rank;
			if (time.teamID) statistics.firstEvent.teamID = time.teamID;
		}
		//--------------------------------------------
		// 7. latest
		//--------------------------------------------
		if (!statistics.latestEvent || statistics.latestEvent.datetime < datetime) {
			statistics.latestEvent = {
				competitionID	: time.competitionID,
				poolID				: time.poolID,
				timeID				: time.timeID,
				// teamID				: time.teamID,
				time					: time.time,
				// timeStamp			: time.timeStamp,
				// rank					: time.rank,
				style					: time.style,
				course				: time.course,
				distance			: time.distance,
				datetime			: time.datetime,
			}
			if (time.rank) statistics.latestEvent.rank = time.rank;
			if (time.teamID) statistics.latestEvent.teamID = time.teamID;
		}

	} else { // time
		statistics.timeCount++;
		//--------------------------------------------
		// 7. first가 없으면 추가
		//--------------------------------------------
		if (!statistics.firstTime || !statistics.firstTime.timeID) {
			statistics.firstTime = {
				poolID				: time.poolID,
				timeID				: time.timeID,
				time					: time.time,
				// timeStamp			: time.timeStamp,
				// rank					: time.rank,
				style					: time.style,
				course				: time.course,
				distance			: time.distance,
			}
			if (time.rank) statistics.firstTime.rank = time.rank;
			if (time.teamID) statistics.firstTime.teamID = time.teamID;
		}
		//--------------------------------------------
		// 7. latest
		//--------------------------------------------
		if (!statistics.latestTime || !statistics.latestTime.datetime || statistics.latestTime.datetime < datetime) {
			statistics.latestTime = {
				poolID				: time.poolID,
				timeID				: time.timeID,
				time					: time.time,
				// timeStamp			: time.timeStamp,
				// rank					: time.rank,
				style					: time.style,
				course				: time.course,
				distance			: time.distance,
				datetime			: time.datetime,
			}
			if (time.rank) statistics.latestTime.rank = time.rank;
			if (time.teamID) statistics.latestTime.teamID = time.teamID;
		}
	}



	
	//--------------------------------------------
	// 2. majorStyles
	//--------------------------------------------	
	// style 인덱스 찾기
	index = statistics.majorStyles.findIndex(item => item.style == time.style);
	if (index < 0) {
		statistics.majorStyles.push({ style: time.style, count: 1, });
	} else {
		statistics.majorStyles[index].count++;
		statistics.majorStyles.sort((a,b)=>b.count-a.count);
	}

	//--------------------------------------------
	// 4. pools
	//--------------------------------------------
	if (time.poolID) {
		const poolID = Number(time.poolID);
		// ID인 pool의 인덱스 찾기
		index = statistics.pools.findIndex(item => item.poolID == poolID);
		if (index < 0) {
			statistics.pools.push({ poolID: poolID, count: 1, });
		} else {
			statistics.pools[index].count++;
		}
		statistics.pools.sort((a,b)=>b.count-a.count);
	}
	//--------------------------------------------
	// 5. teams
	//--------------------------------------------
	if (time.teamID) {
		const teamID = Number(time.teamID);
		// ID인 team의 인덱스 찾기
		index = statistics.teams.findIndex(item => item.teamID == teamID);
		if (index < 0) {
			statistics.teams.push({ teamID: teamID, count: 1, });
		} else {
			statistics.teams[index].count++;
		}
		statistics.teams.sort((a,b)=>b.count-a.count);
	}
	//--------------------------------------------
	// 6. cities
	//--------------------------------------------
	if (time.sido) {
		const sido = time.sido.trim();
		// sido의 인덱스 찾기
		index = statistics.cities.findIndex(item => item == sido);
		if (index < 0) {
			statistics.cities.push({ sido: sido, count: 1, });
		} else {
			statistics.cities[index].count++;
		}
		statistics.cities.sort((a,b)=>b.count-a.count);
	}
	
	//--------------------------------------------
	// 8. timekeeper 추가
	//--------------------------------------------
	if (time.timekeeper && time.timekeeper.athleteID) {
		const timekeeperID = Number(time.timekeeper.athleteID);
		// 같은 athleteID를 가진 객체가 있으면 제거
		statistics.timekeepers = statistics.timekeepers.filter(item => item.athleteID != timekeeperID);
		// athlete 객체를 배열의 0번째에 추가
		statistics.timekeepers.unshift({
			athleteID	: timekeeperID,
			name			: time.timekeeper.name,
			});
	}
	// update athlete
	//--------------------------------------------
	const query = { athleteID: time.athleteID };
	console.log("query=", query, "value=", value);
	//--------------------------------------------
	await mongodb.updateOne(collectionName, query, value);
	//--------------------------------------------
	return statistics;
}

console.log("start...");

// (async () => {
// 	let result, body, query;
// 	query = { athleteID: 5 };
// 	console.log("build athletes query.", query);

// 	//------------------------------------
// 	const context = {
// 		query: {},
// 		projection: { _id:0, name:1, gender:1, athleteID:1, ageGroup:1, dob:1 },
// 		skip: 0,
// 		limit: 100,
// 	};
// 	result = await mongodb.find(mongoCFG.Medalbank.athletes, context);
// 	console.log("result:", result.data.length);

// 	//-----------------------------------------------
// 	for (const athlete of result.data) {
// 		body = { name: athlete.name, gender:athlete.gender, athleteID: athlete.athleteID, ageGroupCode: athlete.ageGroup }
// 		const times = timeLibrary.importTimes(body);

// 		const stat = this.makeAthletesStatistics(times);
// 		query = { athleteID: athlete.athleteID };
// 		const statistics = { athleteID: athlete.athleteID, ...stat };
// 		const res = await mongodb.updateOne(collectionName, query, statistics);
// 		console.log("athlete:", body);
// 	}
// 	//-----------------------------------------------
	

// 	//------------------------------------

// })();

//============================================
