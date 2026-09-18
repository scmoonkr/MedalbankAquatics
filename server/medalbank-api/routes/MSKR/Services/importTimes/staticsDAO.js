const fs          = require('fs');
const mskCFG 		  = require('../../Config/mskCFG');
const mongoCFG 		= require('../../Config/mongoCFG');
const mongoDB			= require('../../Class/MongoDB');
const utilLibrary = require("../../Util/utilLibrary");
const UtilDate    = require("../../Util/utilDate");

const utilDate	  = new UtilDate();
const mongodb 	  = new mongoDB(mongoCFG.Medalbank.database);

// const { grouppingRanking } = require('../import/extraInfo/buildRankingsDAO');
const { getCompetition } = require('../competitions/competitions.model');
const Customizing = require('../times/times.custom');
const buildSaticsDAO		= require('./importUTIL/buildStaticsDAO');
const excelDAO		= require("./importUTIL/excelDAO");
const { Config }  = require('./importUTIL/config');

const MemoryDB 		= require('../../Class/MemoryDB');
const memoryDB		= new MemoryDB();

const readDAO					= require("./readDAO");
const checkDAO				= require("./checkDAO");
const mergeDAO				= require("./mergeDAO");
const importDAO				= require("./importDAO");
const setAthleteDAO		= require("./setAthleteDAO");
const staticsDAO			= require("./staticsDAO");
const rankingsDAO			= require("./rankingsDAO");
const uploadTeamsDAO	= require("./uploadTeamsDAO");
const uploadTimesDAO	= require("./uploadTimesDAO");
const modifyDAO				= require("./modifyDAO");
const indexDAO				= require("./indexDAO");
const parsingPDFDAO		=  require("./parsingPDFDAO");
const downloadTimesExcelDAO = require("./downloadTimesExcelDAO");
const athleteDAO	    = require('../athletes/athletes.model');
const timesDAO	      = require('../management/timesDAO');

exports.loadStatics = async (body) => {
	//--------------------------------------------
	// 1. load memory db
	//--------------------------------------------
	await memoryDB.loadMemoryDB();
	//--------------------------------------------
	return "";
}
/*********************************************************************
 * 
 *	statistics athletes
*
*********************************************************************/
exports.staticAthletes = async (body) => {
console.time("staticAthletes");

let result;
//--------------------------------------------
// 1. load memory db
//--------------------------------------------
await memoryDB.initialize();
//--------------------------------------------

console.log("start staticAthletes...\n");
//--------------------------------------------
// 2. load Times
//--------------------------------------------
const timeArr = await loadTimes();
//--------------------------------------------
if (timeArr.length == 0) {
	console.log("buildStatics no data...");
	return;
}
console.log("loadTimes:", timeArr.length);

//--------------------------------------------
// build athletes
//--------------------------------------------
result = await buildSaticsDAO.athleteStaticsAll(timeArr);
//--------------------------------------------
console.log("athleteStaticsAll:", result.length);
console.log("..............................................end\n");

console.timeEnd("staticAthletes");
return result;
}

exports.staticRankings = async (body) => {
	console.time("staticsAll");
	let result;

	await clearStatics();

	//--------------------------------------------
	// 1. load memory db
	//--------------------------------------------
	await memoryDB.initialize();
	//--------------------------------------------

	console.log("start..............................................\n");
	//--------------------------------------------
	// 2. load Times
	//--------------------------------------------
	const timeArr = await loadTimes();
	//--------------------------------------------
	if (timeArr.length == 0) {
		console.log("buildStatics no data...");
		return;
	}
	console.log("loadTimes:", timeArr.length);

	//--------------------------------------------
	// 3. build rankings
	//--------------------------------------------
	result = await rankingsDAO.buildRankings(timeArr);
	await memoryDB.loadRankings();
	console.log("buildRankings:", result.length);

	console.log("..............................................end\n");

	//--------------------------------------------
	await memoryDB.loadMemoryDB();
	//--------------------------------------------

	console.timeEnd("staticsAll");
	return result;
}

exports.staticTeams = async (body) => {
	console.time("staticsAll");
	let result;

	await clearStatics();

	//--------------------------------------------
	// 1. load memory db
	//--------------------------------------------
	await memoryDB.initialize();
	//--------------------------------------------

	console.log("start..............................................\n");
	//--------------------------------------------
	// 2. load Times
	//--------------------------------------------
	const timeArr = await loadTimes();
	//--------------------------------------------
	if (timeArr.length == 0) {
		console.log("buildStatics no data...");
		return;
	}
	console.log("loadTimes:", timeArr.length);

	//--------------------------------------------
	// 3. build rankings
	//--------------------------------------------
	result = await buildSaticsDAO.teamsStaticsAll(timeArr);
	await memoryDB.loadRankings();
	console.log("teamsStaticsAll:", result.length);

	console.log("..............................................end\n");

	//--------------------------------------------
	await memoryDB.loadMemoryDB();
	//--------------------------------------------

	console.timeEnd("staticsAll");
	return result;
}

exports.staticPools = async (body) => {
	console.time("staticsAll");
	let result;

	await clearStatics();

	//--------------------------------------------
	// 1. load memory db
	//--------------------------------------------
	await memoryDB.initialize();
	//--------------------------------------------

	console.log("start..............................................\n");
	//--------------------------------------------
	// 2. load Times
	//--------------------------------------------
	const timeArr = await loadTimes();
	//--------------------------------------------
	if (timeArr.length == 0) {
		console.log("buildStatics no data...");
		return;
	}
	console.log("loadTimes:", timeArr.length);

	//--------------------------------------------
	// 3. build rankings
	//--------------------------------------------
	result = await buildSaticsDAO.poolsStaticsAll(timeArr);
	await memoryDB.loadRankings();
	console.log("poolsStaticsAll:", result.length);

	console.log("..............................................end\n");

	//--------------------------------------------
	await memoryDB.loadMemoryDB();
	//--------------------------------------------

	console.timeEnd("staticsAll");
	return result;
}

exports.staticCompetitions = async (body) => {
	console.time("staticsAll");
	let result;

	await clearStatics();

	//--------------------------------------------
	// 1. load memory db
	//--------------------------------------------
	await memoryDB.initialize();
	//--------------------------------------------

	console.log("start..............................................\n");
	//--------------------------------------------
	// 2. load Times
	//--------------------------------------------
	const timeArr = await loadTimes();
	//--------------------------------------------
	if (timeArr.length == 0) {
		console.log("buildStatics no data...");
		return;
	}
	console.log("loadTimes:", timeArr.length);

	//--------------------------------------------
	// 3. build rankings
	//--------------------------------------------
	result = await buildSaticsDAO.competitionStaticsAll(timeArr);
	await memoryDB.loadRankings();
	console.log("competitionStaticsAll:", result.length);

	console.log("..............................................end\n");

	//--------------------------------------------
	await memoryDB.loadMemoryDB();
	//--------------------------------------------

	console.timeEnd("staticsAll");
	return result;
}

exports.staticStems = async (body) => {
	console.time("staticsAll");
	let result;

	await clearStatics();

	//--------------------------------------------
	// 1. load memory db
	//--------------------------------------------
	await memoryDB.initialize();
	//--------------------------------------------

	console.log("start..............................................\n");
	//--------------------------------------------
	// 2. load Times
	//--------------------------------------------
	const timeArr = await loadTimes();
	//--------------------------------------------
	if (timeArr.length == 0) {
		console.log("buildStatics no data...");
		return;
	}
	console.log("loadTimes:", timeArr.length);

	//--------------------------------------------
	// 3. build rankings
	//--------------------------------------------
	result = await buildSaticsDAO.stemsStatics(timeArr);
	await memoryDB.loadRankings();
	console.log("stemsStatics:", result.length);

	console.log("..............................................end\n");

	//--------------------------------------------
	await memoryDB.loadMemoryDB();
	//--------------------------------------------

	console.timeEnd("staticsAll");
	return result;
}

/*********************************************************************
 * 
 *	statistics rankings, stems, competitions, teams, pools
*
*********************************************************************/
exports.statisticsAll = async (body) => {
	console.log("start statisticsAll...\n");
	console.time("staticsAll");
	let result;

	//--------------------------------------------
	// 1. load memory db
	//--------------------------------------------
	await memoryDB.initialize();
	//--------------------------------------------

	//--------------------------------------------
	// 2. load Times
	//--------------------------------------------
	const timeArr = await loadTimes();
	//--------------------------------------------

	if (timeArr.length == 0) {
		console.log("statisticsAll.times no data...");
		return;
	}
	console.log("loadTimes:", timeArr.length);

	// delete times가 없는 athletes
	result = await athleteDAO.removeAthletesNoTimes({});
	//  delete name이 없는 athletes
	result = await timesDAO.deleteAthletesNoName({});
	// athletes에 athleteID가 없는 times athleteID unset
	result = await timesDAO.unsetTimesAthleteID({});
	//  teams에 teamID가 없는 times teamID unset
	result = await timesDAO.unsetTimesTeamID({});
	//  rebuild times teamID
	result = await timesDAO.rebuildTimesTeamID();

	//--------------------------------------------
	// 3. build rankings
	//--------------------------------------------

	let query;

	//--------------------------------------------
	// 4. build stems
	//--------------------------------------------
	const stemOBJ = await buildSaticsDAO.stemsStatics(timeArr);

	//--------------------------------------------
	// 5. build competitions
	//--------------------------------------------
	result = await buildSaticsDAO.competitionStaticsAll(timeArr, stemOBJ);

	//--------------------------------------------
	// 6. build rankings
	//--------------------------------------------
	result = await rankingsDAO.buildRankings(timeArr);

	//--------------------------------------------
	// 6. build teams
	//--------------------------------------------
	result = await buildSaticsDAO.teamsStaticsAll(timeArr);

	//--------------------------------------------
	// 7. build pools
	//--------------------------------------------
	result = await buildSaticsDAO.poolsStaticsAll(timeArr);

	//--------------------------------------------
	// build athletes
	//--------------------------------------------
	result = await buildSaticsDAO.athleteStaticsAll(timeArr);
	//--------------------------------------------

	console.log("statisticsAll end...\n");

	//--------------------------------------------
	// await memoryDB.loadMemoryDB();
	
	await memoryDB.loadStatics();
	//--------------------------------------------

	console.timeEnd("staticsAll");
	return result;
}

async function clearStatics() {
/*
athletes
	times: [{timeID,style,distance,times,rank,competitionID}]
	Info
competitions
	styleDistances, athleteCount, timeCount, bestTimes
stems
	athleteCount, timeCount, competitionCount, bestTimes
teams
pools
	medals, members, points, rank, style, timeCount
	Info
rankings
history
*/

let result, clear;

//-----> clear athletes
// clear = { $unset: { times:1, athleteCount:1, timeCount:1, bestTimes:1, teams:1, competition:1, competitions:1, majorStyle:1, majorTimes:1, firstDate:1, latestDate:1, latestTimes:1, } };
clear = { $unset: { times:1, athleteIDs:1, competitionIDs:1, styles:1 } };
result = await mongodb.updateManyOP(mongoCFG.Medalbank.athletes, {}, clear);

//-----> clear competitions
clear = { $unset: { styleDistances:1, athleteCount:1, timeCount:1, bestTimes:1, } };
result = await mongodb.updateManyOP(mongoCFG.Medalbank.competitions, {}, clear);

//-----> clear stems
clear = { $unset: { competitionCount:1, athleteCount:1, timeCount:1, bestTimes:1, } };
result = await mongodb.updateManyOP(mongoCFG.Medalbank.stems, {}, clear);

//-----> clear pools
clear = { $unset: { athleteCount:1, timeCount:1, medals:1, members:1, points:1, rank:1, style:1, } };
result = await mongodb.updateManyOP(mongoCFG.Medalbank.pools, {}, clear);

//-----> clear teams
clear = { $unset: { athleteCount:1, timeCount:1, medals:1, members:1, points:1, rank:1, style:1, } };
result = await mongodb.updateManyOP(mongoCFG.Medalbank.teams, {}, clear);

}
//=======================================================
//=======================================================
async function loadTimes() {
	context = {
		query: {
			// competitionID: { $in: uploadedCompetitions },
			// individual: true,
			masters		: true,
			adult			: true,
			athleteID	:{ $exists: true },
			// poolID		:{ $exists: true },
			// teamID		:{ $exists: true },
			$or: [ {status: ""}, { status: { $exists: false }} ],
			time			: { $gt: 0 },
			fin: { $exists: false }
		},
		// projection: {
		// 	_id						:0,
		// 	timeID				:1,
		// 	name					:1,
		// 	nameHide			:1,
		// 	gender				:1,
		// 	style					:1,
		// 	distance			:1,
		// 	teamID				:1,
		// 	athleteID     :1,
		// 	competitionID :1,
		// 	poolID				:1,
		// 	teamID				:1,
		// 	time					:1,
		// 	times					:1,
		// 	diffs					:1,
		// 	rank					:1,
		// 	rankGroup			:1
		// },
		projection: { _id:0, },
		limit: 500000,
		skip: 0,
		sort: { gender:1, style:1, distance:1, time:1 },
	}		
	result = await mongodb.find(mongoCFG.Medalbank.times, context);
	const times = result.data.reduce((arr, time) => {
															time.datetime = memoryDB.getCompetition(time.competitionID).datetime;
															arr.push(time);
															return arr;
														}, [])
	return times;
}
