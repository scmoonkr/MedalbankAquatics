const _    			= require('lodash');
const extend = require('node.extend');

const utilLibrary = require('../../Util/utilLibrary.js');
const CompetitionModel 	= require('../competitions/competitions.model.js');
const TimeLibrary = require('../../Class/TimeLibrary.js');
const timeLibrary = new TimeLibrary();

//============================================
const mskCFG    	= require('../../Config/mskCFG.js');
const MongoDB     = require('../../Class/MongoDB.js');
const mongoCFG    = require('../../Config/mongoCFG.js');
const mongodb     = new MongoDB(mongoCFG.Medalbank.database);
// const mongodb     = new MongoDB("Test");
const MemoryDB		= require("../../Class/MemoryDB.js");
const memoryDB		= new MemoryDB();

const CompetitionBuild	= require('../competitions/competitions.build.js');
const LeaderboardBuild	= require('../leaderboards/leaderboard.build.js');

const collectionName = mongoCFG.Medalbank.leaderboard;
// const competitionID = process.argv.length > 2 ? Number(process.argv[2]) : 1709;
// console.log("node build_competition #\ncompetitionID:", competitionID);

//---------------------------------------
// Group times by year-month
//---------------------------------------
function groupbyYearForTimes(times) {
	const groupedTimes = times.reduce((acc, record) => {
														const date = new Date(record.datetime);
														const yearMonth = `${date.getFullYear()}`;
														
														// Initialize array for this year-month if it doesn't exist
														if (!acc[yearMonth]) {
															acc[yearMonth] = [];
														}
														
														date.setHours(9,0,0,0);
														record.group = "year";
														record.year = date.getFullYear();
														// Add the record to the appropriate year-month array
														acc[yearMonth].push(record);
														
														return acc;
													}, {});

	return groupedTimes;
}

//---------------------------------------
// Group times by year-month
//---------------------------------------
function groupbyYearMonthForTimes(times) {
	const groupedTimes = times.reduce((acc, record) => {
														const date = new Date(record.datetime);
														const yearMonth = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
														
														// Initialize array for this year-month if it doesn't exist
														if (!acc[yearMonth]) {
															acc[yearMonth] = [];
														}
														
														date.setHours(9,0,0,0);
														record.group = "month";
														record.year = date.getFullYear();
														record.month = date.getMonth() + 1;
														// Add the record to the appropriate year-month array
														acc[yearMonth].push(record);
														
														return acc;
													}, {});

	return groupedTimes;
}

//---------------------------------------
// 주차별로 데이터 그룹화하는 함수
//	yyyy-week(2024-42))
//---------------------------------------
function groupbyWeekForTimesOLD(times) {
	const groupedTimes = times.reduce((acc, record) => {
															const date = new Date(record.datetime);
															
															// 해당 날짜가 속한 연도의 첫날
															const yearStart = new Date(date.getFullYear(), 0, 1);
															
															// 일요일이 한 주의 시작인 경우를 위한 조정
															const days = Math.floor((date - yearStart) / (24 * 60 * 60 * 1000));
															const weekNumber = Math.ceil((days + yearStart.getDay() + 1) / 7);
															
															// YYYY-WW 형식의 키 생성 (예: 2024-01은 2024년 1주차)
															const yearWeek = `${date.getFullYear()}-${String(weekNumber).padStart(2, '0')}`;
															
															// 해당 주차의 시작일과 종료일 계산
															const weekStart = new Date(date);
															weekStart.setDate(date.getDate() - date.getDay());
															const weekEnd = new Date(date);
															weekEnd.setDate(date.getDate() + (6 - date.getDay()));
															
															if (!acc[yearWeek]) {
																acc[yearWeek] = {
																	weekRange: `${weekStart.toISOString().split('T')[0]} ~ ${weekEnd.toISOString().split('T')[0]}`,
																	records: []
																};
															}
															
															acc[yearWeek].records.push(record);
															return acc;
														}, {});

	// 키를 기준으로 정렬
	return Object.keys(groupedTimes)
		.sort()
		.reduce((acc, key) => {
			acc[key] = groupedTimes[key];
			return acc;
		}, {});
}


//---------------------------------------
// 주차별로 데이터 그룹화하는 함수
//	yyyy-month-week(2024-05-01))
//---------------------------------------
function groupbyWeekForTimes(times) {
	const weekGroups = times.reduce((acc, record) => {
														const date = new Date(record.datetime);
														const year = date.getFullYear();
														const month = date.getMonth() + 1;
														
														// 해당 월의 1일
														const monthStart = new Date(year, month - 1, 1);
														// 해당 날짜의 일자
														const dayOfMonth = date.getDate();
														
														// 월별 주차 계산 (1-7일: 1주차, 8-14일: 2주차, ...)
														const weekOfMonth = Math.ceil(dayOfMonth / 7);
														
														// YYYY-MM-WK 형식의 키 생성 (예: 2024-05-01은 2024년 5월 1주차)
														const yearMonthWeek = `${year}-${String(month).padStart(2, '0')}-${String(weekOfMonth).padStart(2, '0')}`;
														
														// 해당 주차의 시작일과 종료일 계산
														const weekStart = new Date(year, month - 1, (weekOfMonth - 1) * 7 + 1);
														const weekEnd = new Date(year, month - 1, Math.min((weekOfMonth * 7), new Date(year, month, 0).getDate()));
														
														if (!acc[yearMonthWeek]) {
															acc[yearMonthWeek] = {
																weekRange: `${weekStart.toISOString().split('T')[0]} ~ ${weekEnd.toISOString().split('T')[0]}`,
																records: []
															};
														}
														
														date.setHours(9,0,0,0);
														record.group = "week";
														record.year = date.getFullYear();
														record.month = date.getMonth() + 1;
														record.week = weekOfMonth;
														
														acc[yearMonthWeek].records.push(record);
														return acc;
													}, {});

  // 키를 기준으로 정렬
  return Object.keys(weekGroups)
    .sort()
    .reduce((acc, key) => {
      acc[key] = weekGroups[key];
      return acc;
    }, {});
}


//---------------------------------------
// 일자별로 데이터 그룹화하는 함수
//	yyyy-mm-dd
//---------------------------------------
function groupbyDayForTimes(times) {
	const groupedTimes = times.reduce((acc, record) => {
															const day = new Date(record.datetime);
															const dayStr = day.toISOString().slice(0, 10);
															
															// Initialize array for this year-month if it doesn't exist
															if (!acc[dayStr]) {
																acc[dayStr] = [];
															}
														
															day.setHours(9,0,0,0);
															record.group 	= "day";
															record.year 	= day.getFullYear();
															record.month 	= day.getMonth() + 1;
															record.day 		= day.getDate();
															
															// Add the record to the appropriate year-month array
															acc[dayStr].push(record);
															
															return acc;
														}, {});

	return groupedTimes;
}

exports.getTimesForCompetitions = async () => {
	let result;

	const competitionIDs = await mongodb.distinct(mongoCFG.Medalbank.competitions, "competitionID", { old: true, timeCount: { $gt: 0 } });
	const competitionMedalbankIDs = await mongodb.distinct(mongoCFG.Medalbank.competitions, "competitionID", { old: { $exists: false}, timeCount: { $gt: 0 } });

	console.log("competitionIDs=", competitionIDs.data);
	console.log("competitionMedalbankIDs=", competitionMedalbankIDs.data);

	// competitionIDs.data = [1709];
	
	let context = {
		query			: {
			competitionID: { $in: competitionIDs.data },
			style: { $in: ["freestyle", "backstroke", "breaststroke", "butterfly", "individualMedley"] },
			$or: [ {status: ""},{ status: { $exists: false }} ],
			time: { $gt: 0 },
			fin: { $exists: false }
		},
		projection: {
			_id: 0,
			isAdult: 1, 
			gender: 1, 
			style: 1, 
			course: 1, 
			distance: 1, 
			timeID: 1, 
			name: 1, 
			time: 1, 
			times: 1, 
			timeStamp: 1, 
			adult: 1, 
			rank: 1, 
			sido: 1, 
			datetime: 1, 
			ageGroup: 1, 
			poolID: 1, 
			teamID: 1, 
			athleteID: 1,
			competitionID: 1, 
		},
		limit			: 2000000,
		skip			: 0,
		// sort 			: { datetime: 1, }
	}
	//---------------------------------
	//	times에서 times 가져옴
	//---------------------------------
	result = await mongodb.find(mongoCFG.Medalbank.timesOLD, context);

	let times = result.data.reduce((arr, time) => {
														time.timeStamp 	= time.time;
														time.time 			= time.times;
														time.isAdult		= time.adult;
														time.datetime 	= new Date(time.datetime);
														delete time.athleteID;
														delete time.adult;
														arr.push(time);
														return arr;
													}, []);
	const timeArr = extend(true, [], times);
	//---------------------------------
	//	times_medalbank에서 times 가져옴
	//---------------------------------
	context.query = {
		$or						: [ {competitionID: { $exists: false } },{ competitionID: { $in: competitionMedalbankIDs.data }} ],
		// competitionID	: { $in: competitionMedalbankIDs.data },
		style					: { $in: ["freestyle", "backstroke", "breaststroke", "butterfly", "individualMedley"] },
		$or						: [ {status: ""},{ status: { $exists: false }} ],
		timeStamp			: { $gt: 0 },
	}
	const timesMedalbank = await mongodb.find(mongoCFG.Medalbank.times, context);
	// const timeArr = [ ...times, ...timesMedalbank.data ];
	
	//---------------------------------
	//---------------------------------
	//	times에서 ageGroup을 설정하기 위해
	//  athletes_medalbank에서 ageGroup을 가져옴
	//---------------------------------
	const athleteIDs = [...new Set(timesMedalbank.data.map(el => el.athleteID).map(athleteID => athleteID))];
	context = {
		query			: { athleteID: { $in: athleteIDs } },
		projection: { _id:0, athleteID:1, ageGroup:1 },
		limit			: 2000000,
		skip			: 0,
		// sort 			: { datetime: 1, }
	}
	const athletes = await mongodb.find(mongoCFG.Medalbank.athletes, context);
	const athleteOBJ = _.groupBy(athletes.data, el => el.athleteID);
	//---------------------------------

	//---------------------------------
	// 	times에 athleteID별로 ageGroup을 설정
	//---------------------------------
	timesMedalbank.data.forEach(time => {
		time.ageGroup = time.ageGroup ? time.ageGroup : mskCFG.getAgeGroupNameByAgeGroupCode(athleteOBJ[time.athleteID][0].ageGroup);
		timeArr.push(time);
	});
	console.log("all----> times.length=", times.length, "times_medalbank=", timesMedalbank.data.length, "all=", timeArr.length, );
	// console.log(timeArr.length,	timeArr[0]);
	// console.log(context.query, "times:", result.data);

	return timeArr;
}

async function copy_collectios() {
	let result, context;

	context = {
		query			: { },
		projection: { _id:0, },
		limit			: 2000000,
		skip			: 0,
		// sort 			: { datetime: 1, }
	}
	result = await mongodb.find(mongoCFG.Medalbank.athletes, context, "MSKR");
	await mongodb.insertMany(mongoCFG.Medalbank.athletes, result.data);

	result = await mongodb.find(mongoCFG.Medalbank.competitions, context, "MSKR");
	await mongodb.insertMany(mongoCFG.Medalbank.competitions, result.data);

	result = await mongodb.find(mongoCFG.Medalbank.pools, context, "MSKR");
	await mongodb.insertMany(mongoCFG.Medalbank.pools, result.data);

	result = await mongodb.find(mongoCFG.Medalbank.teams, context, "MSKR");
	await mongodb.insertMany(mongoCFG.Medalbank.teams, result.data);

	result = await mongodb.find(mongoCFG.Medalbank.times, context, "MSKR");
	await mongodb.insertMany(mongoCFG.Medalbank.times, result.data);

	result = await mongodb.find(mongoCFG.Medalbank.timesOLD, context, "MSKR");
	await mongodb.insertMany(mongoCFG.Medalbank.timesOLD, result.data);
}
//============================================
(async () => {
	let result, body, query, context;

	// await copy_collectios();

	await memoryDB.loadCompetitions();
	await memoryDB.loadConfig();

	//---------------------------------------
	//-----> load 대회 times
	//---------------------------------------
	const times = await this.getTimesForCompetitions();
console.log(times.length, times.slice(0, 2));


/*
	//---------------------------------------
	// 1. build leaderboard all, year, month, week, day
	//---------------------------------------
	await this.buildLeaderboardAll(times);
*/
	//---------------------------------------
	// 2. build competitions
	// Filter times for competitionID
	//---------------------------------------
	// const timesCompetitionID = _.groupBy(times, el => el.competitionID);
	// for (const key of Object.keys(timesCompetitionID)) {
	// 	const competitionTimes = timesCompetitionID[key].filter(time => time.competitionID);
	// 	console.log(key, competitionTimes.length);
	// 	result = await this.buildCompetitionStatistics(Number(key), competitionTimes, 32);
	// }

	//---------------------------------------
	// 3. build stems
	// Filter times for competitionID
	//---------------------------------------
	// const timesStemID = _.groupBy(times, el => el.stemID);
	// for (const key of Object.keys(timesStemID)) {
	// 	const stemTimes = timesStemID[key].filter(time => time.stemID);
	// 	console.log(key, competitionTimes.length);
	// 	console.log(key, stemTimes.length);
	// 	result = await this.buildStemStatistics(Number(key), stemTimes, 32);
	// }


	//---------------------------------------
	// 4. build athletes
	//---------------------------------------
	const timesAthletes = _.groupBy(times.filter(time => time.athleteID), el => el.athleteID);
	// console.log("~~~~~~~~~~~~~~~~~athletes:", Object.keys(timesAthletes));

	for (const athleteID of Object.keys(timesAthletes)) {
		console.log(athleteID, timesAthletes[athleteID].length, timesAthletes[athleteID][0]);
		result = await this.buildAthletesStatistics(Number(athleteID), timesAthletes[athleteID], 32);
		// break;
	}

	//---------------------------------------
	// 5. build teams
	//---------------------------------------
	// const timesTeams = _.groupBy(times, el => el.teamID);
	// for (const key of Object.keys(timesTeams)) {
	// 	console.log(key, timesTeams[key].length, timesTeams[key][0]);
	// 	result = await this.buildStemStatistics(Number(key), timesTeams[key], 32);
	// }

	//---------------------------------------
	// 6. build pools
	//---------------------------------------
	// const timesPools = _.groupBy(times, el => el.poolID);
	// for (const key of Object.keys(timesPools)) {
	// 	console.log(key, timesPools[key].length, timesPools[key][0]);
	// 	result = await this.buildStemStatistics(Number(key), timesPools[key], 32);
	// }


	
})();

exports.makePoolsStatistics = async (timeArr) => {
	if (timeArr.length == 0) return {};

	const grouped = _.groupBy(timeArr, (entry) => entry.poolID);
	

	const teamsStatistics = [];
	for (const poolID of Object.keys(grouped)) {
		const times = grouped[poolID];
		const value = {
			poolID		: Number(poolID),
			timeCount	: times.length, 
		};
		value.athleteCount		= Object.entries(_.countBy(times, "athleteID"))
																	.map(([data, count]) => ({
																				athleteID: Number(data),
																				count,
																			}))
																	.filter(data => !isNaN(data.athleteID) && data.athleteID != 'undefined').length
		value.swimmersEvent 	= timeLibrary.getAthletesByCount(times, 10);
		value.competitions		= timeLibrary.getCompetitionsByCountOfTeam(value.poolID, times, 1000); // 처리 필요: athleteCount, medal, pbs
		// value.teamTimes				= times.filter(time => time.style.includes("Relay"));
		value.bestTimes				= timeLibrary.findBestTime(times, 1);
		value.latest					= timeLibrary.findLatestTime(times, 1);
		value.first						= timeLibrary.findFirstTime(times, 1);
		value.medals					= timeLibrary.countByStyleAndGender(times);
		value.major						= timeLibrary.getStylesByCount(times);

		value.competitionCount= value.competitions.length;

		// calculate points
		let points = 0;
		for (const medal of value.medals) {
			if (medal.style.includes("Relay")) {
				points += medal.gold 	 * teamPoints.goldTeam +
									medal.silver * teamPoints.silverTeam +
									medal.bronze * teamPoints.bronzeTeam;
			} else {
				points += medal.gold 	 * teamPoints.goldIndividual +
									medal.silver * teamPoints.silverIndividual +
									medal.bronze * teamPoints.bronzeIndividual;
			}	
		} // end for
		points += value.timeCount 			 * teamPoints.start;
		points += value.athleteCount 		 * teamPoints.athletes;
		points += value.competitionCount * teamPoints.events;
		// points 계산
		value.points = points;
		teamsStatistics.push(value);
;
	} // end for
	const poolIDs = [...new Set(timeArr.map((entry) => entry.poolID))];
console.log("poolIDs=", poolIDs, );
	return { poolIDs: poolIDs, teams: teamsStatistics };
}

// teams.build.js
exports.makeTeamsStatistics = async (timeArr) => {
	console.log("calculateTeamStatistics.times=", timeArr.length);
	// team point 계산용 배점 정보
	// const config = await mongodb.findOne(mongoCFG.Medalbank.config, { type: "teamPoints" }, { _id:0, type:0, } );
	// const teamPoints = config.data; // team point 계산용 배점 정보
	let teamPoints = memoryDB.getCofig("teamPoints");
	if (!teamPoints.goldTeam) {
		teamPoints = {
			type: 'teamPoints',
			events: 10,
			season: 10,
			athletes: 1,
			start: 1,
			goldIndividual: 3,
			silverIndividual: 2,
			bronzeIndividual: 1,
			goldTeam: 12,
			silverTeam: 8,
			bronzeTeam: 4
		}
	}

	const grouped = _.groupBy(timeArr, (entry) => entry.teamID);
	

	const teamsStatistics = [];
	for (const teamID of Object.keys(grouped)) {
		const times = grouped[teamID];
		const value = {
			teamID		: Number(teamID),
			timeCount	: times.length, 
		};
		value.athleteCount		= Object.entries(_.countBy(times, "athleteID"))
																	.map(([data, count]) => ({
																				athleteID: Number(data),
																				count,
																			}))
																	.filter(data => !isNaN(data.athleteID) && data.athleteID != 'undefined').length
		value.swimmersEvent 	= timeLibrary.getAthletesByCount(times, 10);
		value.competitions		= timeLibrary.getCompetitionsByCountOfTeam(value.teamID, times, 1000); // 처리 필요: athleteCount, medal, pbs
		// value.teamTimes				= times.filter(time => time.style.includes("Relay"));
		value.bestTimes				= timeLibrary.findBestTime(times, 1);
		value.latest					= timeLibrary.findLatestTime(times, 1);
		value.first						= timeLibrary.findFirstTime(times, 1);
		value.medals					= timeLibrary.countByStyleAndGender(times);
		value.major						= timeLibrary.getStylesByCount(times);

		value.competitionCount= value.competitions.length;

		// calculate points
		let points = 0;
		for (const medal of value.medals) {
			if (medal.style.includes("Relay")) {
				points += medal.gold 	 * teamPoints.goldTeam +
									medal.silver * teamPoints.silverTeam +
									medal.bronze * teamPoints.bronzeTeam;
			} else {
				points += medal.gold 	 * teamPoints.goldIndividual +
									medal.silver * teamPoints.silverIndividual +
									medal.bronze * teamPoints.bronzeIndividual;
			}	
		} // end for
		points += value.timeCount 			 * teamPoints.start;
		points += value.athleteCount 		 * teamPoints.athletes;
		points += value.competitionCount * teamPoints.events;
		// points 계산
		value.points = points;
		teamsStatistics.push(value);
	} // end for
	const teamIDs = [...new Set(timeArr.map((entry) => entry.teamID))];
console.log("teamIDs=", teamIDs, );
	return { teamIDs: teamIDs, teams: teamsStatistics };
}

// athletes.build.js
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

// competitions.build.js
exports.buildAthletesStatistics = async (athleteID, times, timeLimit=32) => {
	if (times.length == 0) return {};

	let result;

	console.log("buildStemStatistics.times:", times.length);

	//---------------------------------
	//---------------------------------
	const statistics = await timeLibrary.makeAthletesStatistics(times);
	//---------------------------------
	
	const query = { "athleteID" : athleteID };
	const value = { athleteID: athleteID, ...statistics }
	//---------------------------------
	result = await mongodb.updateOne(mongoCFG.Medalbank.athletesStatistics, query, value);
	console.log("athletesStatisticsMB.", query, );
	const athletesValue = {
		// athleteCount: statistics.athleteCount,
		timeCount		: statistics.timeCount,
	}
	if (statistics.bestEvent && statistics.bestEvent.length > 0) {
			// let bestEvent = statistics.bestEvent.find(tm => tm.style=="freestyle" && tm.course=="LCM" && tm.distance=="50M");	
			// if (bestEvent	&& bestEvent.best) athletesValue.freestyle = bestEvent.best;
			for (const best of statistics.bestEvent) {
				if (best.style.includes("Relay")) continue;
				if (best.style=="individualMedley") {
					if (best.distance=="200M") athletesValue[best.style] = best.best;
				} else {
					if (best.distance=="50M") athletesValue[best.style] = best.best;
				}
			}
	}
	console.log("athletesMB.", query, athletesValue);
	result = await mongodb.updateOne(mongoCFG.Medalbank.athletes, query, athletesValue);
	//---------------------------------
	// console.log(query, value.competitions);

	return statistics;
}

// competitions.build.js
exports.buildStemStatistics = async (stemID, times, timeLimit=32) => {
	if (times.length == 0) return {};

	let result;

	console.log("buildStemStatistics.times:", times.length);

	//---------------------------------
	//---------------------------------
	const statistics = await timeLibrary.makeCompetitionsStatistics(times, timeLimit);
	//---------------------------------
	
	delete statistics.styleDistances;
	delete statistics.teams;
	delete statistics.medals;

	const query = { "stemID" : stemID };
	const value = { stemID: stemID, ...statistics }
	//---------------------------------
	result = await mongodb.updateOne(mongoCFG.Medalbank.stemsStatistics, query, value);
	result = await mongodb.updateOne(mongoCFG.Medalbank.stems, query, { athleteCount: statistics.athleteCount, timeCount: statistics.timeCount });
	//---------------------------------
	// console.log(query, value.competitions);

	return statistics;
}

// competitions.build.js
exports.buildCompetitionStatistics = async (competitionID, times, timeLimit=32) => {
	if (times.length == 0) return {};

	let result;

	console.log("buildCompetitionStatistics.times:", times.length);

	//---------------------------------
	//---------------------------------
	const statistics = await timeLibrary.makeCompetitionsStatistics(times, timeLimit);
	statistics.athleteCount = Object.keys(_.groupBy(times, (time) =>  time.name)).length;

	//---------------------------------
	// console.log("----->statistics: ", statistics);
	const query = { "competitionID" : competitionID };
	const value = { competitionID: competitionID, ...statistics }
	//---------------------------------
	result = await mongodb.updateOne(mongoCFG.Medalbank.competitionsStatistics, query, value);
	result = await mongodb.updateOne(mongoCFG.Medalbank.competitions, query, { athleteCount: statistics.athleteCount, timeCount: statistics.timeCount });
	//---------------------------------
	// console.log(query, value.competitions);

	return statistics;
}

// leaderboard.build.js
exports.buildLeaderboardForTimes = async (query, times, timeLimit) => {
	if (times.length == 0) return [];
	
	const leaderboards = await timeLibrary.findBestTimeAdult(times, timeLimit);
  
	let lid = await mongodb.max(mongoCFG.Medalbank.leaderboard, "lid");
	result = await mongodb.deleteMany(mongoCFG.Medalbank.leaderboard, query);
	// result = await mongodb.insertMany(mongoCFG.Medalbank.leaderboard, leaderboards);

	//---------------------------------
	//---------------------------------
	const timeArr = [];
	for (const leaderboard of leaderboards) {
		// if (leaderboard.style.includes("Relay")) continue;
		const value = {
			// group		: "all",
			...query,	// group, year, month, week, day
			isAdult	: leaderboard.isAdult,
			gender	: leaderboard.gender,
			style		: leaderboard.style,
			course	: leaderboard.course,
			distance: leaderboard.distance,
		};
		//---------------------------------
		for (const time of leaderboard.times) {
			const newTime = { ...value, ...time };
			newTime.lid = lid++;
			timeArr.push(newTime);
			// console.log(newTime.lid, newTime.timeID, timeArr.length);
		}
		console.log(lid, timeArr.length);
		//---------------------------------
		//---------------------------------
		//---------------------------------
	}
  // console.log("result=", timeArr.length, timeArr.slice(0, 10));
	result = await mongodb.insertMany(mongoCFG.Medalbank.leaderboard, timeArr);

	return timeArr;
}



exports.buildLeaderboardAll = async (times) => {
	
	//---------------------------------------
	// 1. build leaderboard
	//---------------------------------------
	//		- 전체
	query = { group: "all" }
	result = await this.buildLeaderboardForTimes(query, times, 500);
	console.log("all=", query);

	//---------------------------------------
	//		- year별
	//---------------------------------------
	// Filter times for May 2024
	const timesYear = groupbyYearForTimes(times);
	for (const year of Object.keys(timesYear)) {
		query = { group: "year", year: Number(year) }
		result = await this.buildLeaderboardForTimes(query, timesYear[year], 500);
		console.log("timesYear=", query);
	}
	console.log("timesYear=", Object.keys(timesYear).length);

	//---------------------------------------
	//		- month별
	//---------------------------------------
	const timesMonth = groupbyYearMonthForTimes(times);
	for (const yearMonth of Object.keys(timesMonth)) {
		const [year, month] = yearMonth.split('-');
		query = { group: "month", year: Number(year), month: Number(month) }
		result = await this.buildLeaderboardForTimes(query, timesMonth[yearMonth], 500);
		console.log("timesMonth=", query);
	}
	console.log("timesMonth=", Object.keys(timesMonth).length);

	//---------------------------------------
	//		- week별
	//---------------------------------------
	
	const timesWeek = groupbyWeekForTimes(times);
	console.log("timesWeek=", timesWeek);
	for (const yearMonthWeek of Object.keys(timesWeek)) {
		const [year, month, week] = yearMonthWeek.split('-');
		query = { group: "week", year: Number(year), month: Number(month), week: Number(week) }
		result = await this.buildLeaderboardForTimes(query, timesWeek[yearMonthWeek].records, 500);
		console.log("timesWeek=", query);
	}
	console.log("timesWeek=", Object.keys(timesWeek).length);

	//---------------------------------------
	//		- 일자별
	//---------------------------------------
	const timesDay = groupbyDayForTimes(times);
	for (const date of Object.keys(timesDay)) {
		const [year, month, day] = date.split('-');
		query = { group: "day", year: Number(year), month: Number(month), day: Number(day) }
		result = await this.buildLeaderboardForTimes(query, timesDay[date], 500);
		console.log("timesDay=", query);
	}
	console.log("timesDay=", Object.keys(timesDay).length);

}