const _    			= require('lodash');
const extend = require('node.extend');

//============================================
const mskCFG    	= require('../../Config/mskCFG.js');
const MongoDB     = require('../../Class/MongoDB.js');
const mongoCFG    = require('../../Config/mongoCFG.js');
const mongodb     = new MongoDB(mongoCFG.Medalbank.database);
const MemoryDB		= require("../../Class/MemoryDB.js");
const memoryDB		= new MemoryDB();
const TimeLibrary = require('../../Class/TimeLibrary.js');
const timeLibrary = new TimeLibrary();

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

exports.buildLeaderboardForTimesAll = async (times, timeLimit) => {
  const yearTimes = [];
  // Filter times for May 2024
  const timesYear = groupbyYearForTimes(times);
  for (const key of Object.keys(timesYear)) {
    result = await buildLibrary.buildLeaderboardForTimes(timesYear[key], 500);
  }
  // console.log(Object.keys(timesYear));

  //---------------------------------------
  //		- month별
  //---------------------------------------
  const timesMonth = groupbyYearMonthForTimes(times);
  for (const key of Object.keys(timesMonth)) {
    result = await buildLibrary.buildLeaderboardForTimes(timesMonth[key], 500);
  }
  console.log(Object.keys(timesMonth));

  //---------------------------------------
  //		- week별
  //---------------------------------------
  const timesWeek = groupbyWeekForTimes(times);
  for (const key of Object.keys(timesWeek)) {
    result = await buildLibrary.buildLeaderboardForTimes(timesWeek[key], 500);
  }
  console.log(Object.keys(timesWeek));

  //---------------------------------------
  //		- 일자별
  //---------------------------------------
  const timesDay = groupbyDayForTimes(times);
  for (const key of Object.keys(timesDay)) {
    result = await buildLibrary.buildLeaderboardForTimes(timesDay[key], 500);
  }

}

exports.getTimesForCompetitions = async () => {
  let result;

  const competitionIDs = await mongodb.distinct(mongoCFG.Medalbank.competitionsOLD, "competitionID");
  const medalbankIDs = await mongodb.distinct(mongoCFG.Medalbank.competitions, "competitionID");
  const competitionMedalbankIDs = medalbankIDs.data.filter(id => !competitionIDs.data.includes(id));
  console.log("competitionIDs=", competitionIDs.data.length);
  console.log("medalbankIDs=", medalbankIDs.data.length);
  console.log("competitionMedalbankIDs=", competitionMedalbankIDs);
  // return;


  // competitionIDs.data = [1709];
	const query = {
		timeStamp			: { $gt: 0 },
		isMasters			: true,
		isAdult				: true,
		competitionID	: { $in: competitionIDs.data },
		$or						: [ {status: ""}, { status: { $exists: false }} ],
		fin						: { $exists: false }
	}
  
  let context = {
    query			: query,
    projection: { _id:0, timeID:1, athleteID:1, ageGroup:1, teamID:1, name:1, stemID:1, team:1, competitionID:1, style:1, gender:1, times:1, time:1, timeStamp:1, rank:1, course:1, distance:1, ageGroup:1, poolID:1, datetime:1},
    limit			: 2000000,
    skip			: 0,
    // sort 			: { datetime: 1, }
  }
  //---------------------------------
  //	times에서 times 가져옴
  //---------------------------------
  let timeArr = [];
//   result = await mongodb.find(mongoCFG.Medalbank.times, context);
// 	console.log("++++++", result.data.length);

//   let times = result.data.reduce((arr, time) => {
//                             time.timeStamp 	= time.time;
//                             time.time 			= time.times;
//                             time.datetime 	= new Date(time.datetime);
//                             delete time.athleteID;
//                             arr.push(time);
//                             return arr;
//                           }, []);

//   timeArr = extend(true, [], times);
// console.log("----> times.length=", timeArr.length);

  //---------------------------------
  //	times_medalbank에서 times 가져옴
  //---------------------------------
  context.query.competitionID = { $exists: true }; // 1709; // { $in: competitionMedalbankIDs };

  const timesMedalbank = await mongodb.find(mongoCFG.Medalbank.times, context);
  // timeArr = extend(true, [], result.data);
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
		// console.log(time.athleteID, athleteOBJ[time.athleteID]);
    time.ageGroup = time.ageGroup ? time.ageGroup : (time.athleteID ? mskCFG.getAgeGroupNameByAgeGroupCode(athleteOBJ[time.athleteID][0].ageGroup) : "");
    timeArr.push(time);
  });
  console.log("----> timesMB.length=", timeArr.length);
  // console.log(timeArr.length,	timeArr[0]);
  // console.log(context.query, "times:", result.data);

  return timeArr;
}

exports.getTimes = async (query) => {
  let result;
  
  let context = {
    query			: query,
    projection: { _id:0, timeID:1, athleteID:1, ageGroup:1, teamID:1, name:1, stemID:1, team:1, competitionID:1, style:1, gender:1, times:1, time:1, timeStamp:1, rank:1, course:1, distance:1, ageGroup:1, poolID:1, datetime:1},
    limit			: 2000000,
    skip			: 0,
    // sort 			: { datetime: 1, }
  }
  //---------------------------------
  //	times에서 times 가져옴
  //---------------------------------
  let timeArr = [];
  //---------------------------------
  //	times_medalbank에서 times 가져옴
  //---------------------------------

  const timesMedalbank = await mongodb.find(mongoCFG.Medalbank.times, context);
	// console.log(query, "timesMedalbank=", timesMedalbank.data.length);

  // timeArr = extend(true, [], result.data);
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
		// console.log(time.athleteID, athleteOBJ[time.athleteID]);
    time.ageGroup = time.ageGroup ? time.ageGroup : (time.athleteID ? mskCFG.getAgeGroupNameByAgeGroupCode(athleteOBJ[time.athleteID][0].ageGroup) : "");
    timeArr.push(time);
  });
  // console.log("----> timesMB.length=", timeArr.length);
  // console.log(timeArr.length,	timeArr[0]);
  // console.log(context.query, "times:", result.data);

  return timeArr;
}

exports.buildLeaderboardForTimes = async (times, timeLimit) => {
	if (times.length == 0) return [];
	
	const leaderboards = await timeLibrary.findBestTime(times, timeLimit);
  
	let lid = await mongodb.max(collectionName, "lid");
	console.log("lid=", lid);
	result = await mongodb.deleteMany(collectionName, {});
// 	result = await mongodb.insertMany(collectionName, leaderboards);
// return;
	//---------------------------------
	//---------------------------------
	const timeArr = [];
	for (const leaderboard of leaderboards) {
		if (leaderboard.style.includes("Relay")) continue;
		const value = {
			group		: "all",
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
	result = await mongodb.insertMany(collectionName, timeArr);

	return timeArr;
}

exports.buildCompetitionStatistics = async (times, timeLimit=32) => {
	if (times.length == 0) return {};

	let result;

	console.log("times:", times.length);

	//---------------------------------
	//---------------------------------
	const statistics = await timeLibrary.makeCompetitionsStatistics(times, timeLimit);
	//---------------------------------
	
	// const query = { "competitionID" : competitionID };
	// const value = { competitionID: competitionID, ...statistics }
	// //---------------------------------
	// result = await mongodb.updateOne(mongoCFG.Medalbank.competitionsStatistics, query, value);
	// result = await mongodb.updateOne(mongoCFG.Medalbank.competitions, query, { athleteCount: statistics.athleteCount, timeCount: statistics.timeCount });
	//---------------------------------
	// console.log(query, value.competitions);

	return statistics;
}

exports.buildCompetitionStatisticsAll = async (times, timeLimit=32) => {
	const timesCompetitionID = _.groupBy(times, el => el.competitionID);

	const bulkStatistics = [];
	const bulkCompetitions = [];
	//---------------------------------------
	for (const key of Object.keys(timesCompetitionID)) {
		console.log(key, timesCompetitionID[key].length, timesCompetitionID[key][0]);
		const statistics = await this.buildCompetitionStatistics(timesCompetitionID[key], 32);
		
		const competitionID = Number(key);
		const query = { competitionID : competitionID };
		//---------------------------------
	
		bulkCompetitions.push({
			updateOne: {
				filter: query,
				update: { 
					$set: {
						athleteCount: statistics.athleteCount,
						timeCount		: statistics.timeCount,
					},
					// $unset: { times: 1 },
				}
			}
		});
	
		bulkStatistics.push({
			updateOne: {
				filter: query,
				update: { 
					$set: {
						competitionID: competitionID,
						...statistics,
					},
					// $unset: { times: 1 },
				},
				upsert: true,
			}
		});
	} // end for
	//---------------------------------------
	result = await mongodb.bulkWrite(mongoCFG.Medalbank.competitions, bulkCompetitions);
	result = await mongodb.bulkWrite(mongoCFG.Medalbank.competitionsStatistics, bulkStatistics);
}

exports.buildStemStatisticsAll = async (stemID, times, timeLimit=32) => {
	const timesStemID = _.groupBy(times, el => el.stemID);

	const bulkStatistics = [];
	const bulkStems = [];
	//---------------------------------------
	for (const key of Object.keys(timesStemID)) {
		console.log(key, timesStemID[key].length, timesStemID[key][0]);
		// const statistics = await this.buildStemStatistics(timesStemID[key], 32);
		const statistics = await timeLibrary.makeCompetitionsStatistics(timesStemID[key], timeLimit);

		const stemID = Number(key);
		const query = { "stemID" : stemID };	
		//---------------------------------
	
		bulkStems.push({
			updateOne: {
				filter: query,
				update: { 
					$set: {
						athleteCount: statistics.athleteCount,
						timeCount		: statistics.timeCount,
					},
					// $unset: { times: 1 },
				}
			}
		});
	
		bulkStatistics.push({
			updateOne: {
				filter: query,
				update: { 
					$set: {
						stemID: stemID,
						...statistics,
					},
					// $unset: { times: 1 },
				},
				upsert: true,
			}
		});
	} // end for
	//---------------------------------------
	result = await mongodb.bulkWrite(mongoCFG.Medalbank.stems, bulkStems);
	result = await mongodb.bulkWrite(mongoCFG.Medalbank.stemsStatistics, bulkStatistics);
	//---------------------------------
}

exports.buildStemStatistics = async (stemID, times, timeLimit=32) => {
	if (times.length == 0) return {};

	let result;

	console.log("times:", times.length);

	//---------------------------------
	//---------------------------------
	const statistics = await timeLibrary.makeCompetitionsStatistics(times, timeLimit);
	//---------------------------------
	
	const query = { "stemID" : stemID };
	const value = { stemID: stemID, ...statistics }
	//---------------------------------
	result = await mongodb.updateOne(mongoCFG.Medalbank.stemsStatistics, query, value);
	result = await mongodb.updateOne(mongoCFG.Medalbank.stems, query, { athleteCount: statistics.athleteCount, timeCount: statistics.timeCount });
	//---------------------------------
	// console.log(query, value.competitions);

	return statistics;
}

// athletes.build.js
exports.buildAthletesStatistics = async (athleteID, times) => {
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

// athletes.build.js
exports.buildAthletesStatisticsAll = async (times, timeLimit=32) => {
	const timesAthleteID = _.groupBy(times, el => el.athleteID);
	
	const bulkStatistics = [];
	const bulkAthletes = [];
	//---------------------------------------
	for (const key of Object.keys(timesAthleteID)) {
		console.log(key, timesAthleteID[key].length, timesAthleteID[key][0]);
		// const statistics = await this.buildAthleteStatistics(timesAthleteID[key], 32);
		const statistics = await this.buildAthletesStatistics(timesAthleteID[key], 32);
		//---------------------------------
		
		const athleteID = Number(key);
		const query = { athleteID : athleteID };
		//---------------------------------	
	
		// bulkStatistics.push({
		// 	updateOne: {
		// 		filter: query,
		// 		update: { 
		// 			$set: {
		// 				athleteID: athleteID,
		// 				...statistics,
		// 			},
		// 			// $unset: { times: 1 },
		// 		}
		// 	}
		// });

		const styles = [];
		if (statistics.bestEvent && statistics.bestEvent.length > 0) {
				for (const best of statistics.bestEvent) {
					if (best.style.includes("Relay")) continue;
					const style = {};
					style.style = best.style;
					style.timeCount = best.timeCount;
					if (best.style=="individualMedley") {
						if (best.distance=="200M") style = best.best;
					} else {
						if (best.distance=="50M") style = best.best;
					}
					styles.push(style);
				}
				styles.sort((a, b) => b.timeCount - a.timeCount);
		}

		


		bulkAthletes.push({
			updateOne: {
				filter: query,
				update: { 
					$set: {
						// athleteCount: statistics.athleteCount,
						timeCount		: statistics.timeCount,
						styles			: styles,
					},
					// $unset: { times: 1 },
				},
				upsert: true,
			}
		});
	} // end for
	//---------------------------------------
	// result = await mongodb.bulkWrite(mongoCFG.Medalbank.athletesStatistics, bulkAthletes);
	// result = await mongodb.bulkWrite(mongoCFG.Medalbank.athletes, bulkStatistics);
}


exports.buildPoolsStatistics = async (poolID, times) => {
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

	return teamsStatistics;
}


exports.buildPoolsStatisticsAll = async (timeArr) => {
	if (timeArr.length == 0) return {};

	const grouped = _.groupBy(timeArr, (entry) => entry.poolID);
	

	const bulkStatistics = [];
	const bulkPools = [];
	//------------------------------
	for (const poolID of Object.keys(grouped)) {
		const statistics = await this.buildPoolsStatistics(poolID, grouped[poolID]);
		const query = { poolID : Number(poolID) };
		//---------------------------------	
	
		bulkStatistics.push({
			updateOne: {
				filter: query,
				update: { 
					$set: {
						poolID: poolID,
						...statistics,
					},
					// $unset: { times: 1 },
				}
			}
		});
		
		bulkPools.push({
			updateOne: {
				filter: query,
				update: { 
					$set: {
						athleteCount: statistics.athleteCount,
						timeCount		: statistics.timeCount,
						points			: statistics.points,
					},
					// $unset: { times: 1 },
				},
				upsert: true,
			}
		});
	} // end for
	//---------------------------------------
	result = await mongodb.bulkWrite(mongoCFG.Medalbank.poolsStatistics, bulkStatistics);
	result = await mongodb.bulkWrite(mongoCFG.Medalbank.pools, bulkPools);
	//------------------------------
}

// teams.build.js
exports.buildTeamsStatistics = async (teamID, times, teamPoints) => {
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

		return teamsStatistics;
}

// teams.build.js
exports.buildTeamsStatisticsAll = async (timeArr) => {
	console.log("calculateTeamStatistics.times=", timeArr.length);
	// team point 계산용 배점 정보
	// const config = await mongodb.findOne(mongoCFG.Medalbank.config, { type: "teamPoints" }, { _id:0, type:0, } );
	// const teamPoints = config.data; // team point 계산용 배점 정보
	let teamPoints = memoryDB.getCofig("teamPoints");
	if (!teamPoints.goldTeam) {
		teamPoints = {
			type: 'teamPoints',
			events: 1,
			season: 1,
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

	
	const bulkStatistics = [];
	const bulkTeams = [];
	//---------------------------------------
	for (const teamID of Object.keys(grouped)) {
		const statics = await this.buildTeamsStatistics(teamID, grouped[timeID], teamPoints);
	
		bulkStatistics.push({
			updateOne: {
				filter: query,
				update: { 
					$set: {
						poolID: poolID,
						...statistics,
					},
					// $unset: { times: 1 },
				}
			}
		});
		
		bulkTeams.push({
			updateOne: {
				filter: query,
				update: { 
					$set: {
						athleteCount: statistics.athleteCount,
						timeCount		: statistics.timeCount,
						points			: statistics.points,
					},
					// $unset: { times: 1 },
				},
				upsert: true,
			}
		});
	} // end for
	//---------------------------------------
	result = await mongodb.bulkWrite(mongoCFG.Medalbank.teamsStatistics, bulkStatistics);
	result = await mongodb.bulkWrite(mongoCFG.Medalbank.teams, bulkTeams);
	//---------------------------------------
}