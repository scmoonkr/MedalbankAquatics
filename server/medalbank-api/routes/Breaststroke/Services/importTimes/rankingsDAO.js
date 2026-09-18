const fs          = require('fs');
const mskCFG 		  = require('../../Config/mskCFG');
const mongoCFG 		= require('../../Config/mongoCFG');
const mongoDB			= require('../../Class/MongoDB');
const utilLibrary = require("../../Class/utilLibrary");
const UtilDate    = require("../../Class/utilDate");

const utilDate	  = new UtilDate();
const mongodb 	  = new mongoDB(mongoCFG.Breaststroke.database);
const MemoryDB 		= require('../../Class/MemoryDB');
const memoryDB		= new MemoryDB();

// const { grouppingRanking } = require('../import/extraInfo/buildRankingsDAO');
const buildDAO		= require('./importUTIL/buildTimesDAO');
const { getCompetition } = require('../competitions/competitions.model');
const { Config }  = require('./importUTIL/config');
const Customizing = require('../times/times.custom');


//-------------------------------------------
//	rank: gender-style-distance
//-------------------------------------------
exports.assignRanks = (timeArr) => {
  // First, let's sort the times array in ascending order of time
  // times.sort((a, b) => a.time - b.time);

	const times = [], timesNull = [];
	for (const time of timeArr) {
		if (time.time) {
			times.push(time);
		} else {
			time.rank = 0;
			timesNull.push(time);
		}
	}

  // Initialize variables to keep track of rank and previous time
  let rank = 1;
	if (times.length > 0) {
		let prevTime = times[0].time;

		// Loop through the times array and assign ranks
		let before = times[0].time;
		for (let i = 0; i < times.length; i++) {
			if (times[i].time == 0) continue;
			if (times[i].time !== prevTime) {
				rank = i + 1;
				prevTime = times[i].time;
			}
			if (times[i].times) {
				times[i].rank = times[i].groupRank ? times[i].groupRank : rank;
				times[i].diffs = times[i].time == before ? "0.00" : utilDate.convertTimestamp2string(times[i].time - before);
			}
		}
	}

  return times.concat(timesNull);
}

exports.grouppingRanking = (timeArr) => {

	//------------------------------------------------------------------
  // times = multiSort(times, ["competitionID", "category", "style", "ageGroup", "gender", "course", "distance", "time", ]);
	//------------------------------------------------------------------

	//---------------------------------------
	// tims to timeOBJ['gender-style-distance']
	//---------------------------------------

	// ------------------------------------------------------
	// groupping [gender-style-distance]
	// ------------------------------------------------------
	const timeOBJ = timeArr.reduce((groupedTimes, time) => {
															const key = `${time.gender}-${time.style}-${time.distance}`;
															if (!groupedTimes[key]) {
																groupedTimes[key] = [];
															}
															if (!groupedTimes[key].find(tm => tm.athleteID==time.athleteID)) {
                                const competition = memoryDB.getCompetition(time.competitionID);
																value = {
																	timeID				: time.timeID,
																	athleteID			: time.athleteID,
																	teamID				: time.teamID,
																	name					: time.name,
																	nameHide			: time.nameHide,
																	team					: time.team,
																	times					: time.times,
																	masters				: time.masters,
																	adult					: time.adult,
																	individual		: time.individual,
																	ageGroup			: time.ageGroup,
																	gender				: time.gender,
																	style					: time.style,
																	course				: competition.course,
																	distance			: time.distance,
																	competitionID	: time.competitionID,
																	datetime			: time.datetime,
																	names					: time.names,
																	diffs					: time.diffs,
																	time					: time.time,
																	rankGroup			: time.rank,
																	// lane					: time.lane,
																	poolID				: time.poolID,
																	stemID				: competition.stemID,																																		
																}
																groupedTimes[key].push(value);
															}
															return groupedTimes;
													}, {});	// reduce.groupedTimes: {}



	// let timeOBJ = {};
	// for (const time of timeArr) {
	// 	const key = `${time.gender}-${time.style}-${time.distance}`;
	// 	if (!timeOBJ[key]) timeOBJ[key] = [];
	// 	if (!timeOBJ[key].find(tm => tm.athleteID==time.athleteID)) timeOBJ[key].push(time);
	// }
	// console.log(timeArr[0].competitionID);
	// console.log(competitionOBJ[timeArr[0].competitionID]);

	let timesAll = [];
	// sort time
	Object.keys(timeOBJ).forEach(key => { // 'gender-style-distance'
		let rankings = this.assignRanks(timeOBJ[key]);
		rankings = rankings.filter(el => el.rank <= Config.max_ranking);

		timesAll = timesAll.concat(rankings);
	})
	return timesAll;
}


//=======================================================
//=======================================================
exports.buildRankings = async (timeArr=[]) => {

	// try {
		//--------------------------------------------
		// 1. check rankings
		//--------------------------------------------
		// let result = await mongodb.find(mongoCFG.Breaststroke.leaderboard, { query: {},});
		// if (result.data.length > 0) {
		// 	console.log("rankings를 delete한 후 작업하세요...");
		// 	return timeArr;
		// }

		//--------------------------------------------
		// build group rankings
		//-----------------------------------------------------
		const times = this.grouppingRanking(timeArr);
		if (times.length == 0) {
			console.log(`grouppingRanking times no data...`);
			return;
		}
		if (times.length > 0) {
			//-----------------------------------------------------
			result = await mongodb.deleteMany(mongoCFG.Breaststroke.leaderboard, {});
			result = await mongodb.insertMany(mongoCFG.Breaststroke.leaderboard, times);
			//-----------------------------------------------------
			// console.log(times, `grouppingRanking times.length=, ${times.length}`);
			//-----------------------------------------------------
		}
    await memoryDB.loadRankings();
    console.log("buildRankings:", times.length);
		return times;
}
