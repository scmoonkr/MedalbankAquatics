const _    			= require('lodash');
const extend = require('node.extend');

const utilLibrary = require('../../Util/utilLibrary.js');
const CompetitionModel 	= require('../competitions/competitions.model.js');

//============================================
const mskCFG    	= require('../../Config/mskCFG.js');
const MongoDB     = require('../../Class/MongoDB.js');
const mongoCFG    = require('../../Config/mongoCFG.js');
const mongodb     = new MongoDB(mongoCFG.Medalbank.database);
const MemoryDB		= require("../../Class/MemoryDB.js");
const memoryDB		= new MemoryDB();

const buildLibrary	= require('./build.library.js');
const libraryCompetition	= require('./library.competitions.js');
const libraryStem	= require('./library.stems.js');
const libraryAthlete	= require('./library.athletes.js');
const TimeLibrary = require('../../Class/TimeLibrary.js');

const timeLibrary = new TimeLibrary();


//============================================
(async () => {
let result, body;

await memoryDB.loadCompetitions();
await memoryDB.loadTeams();
await memoryDB.loadPools();
await memoryDB.loadConfig();

//---------------------------------------
//-----> load 대회 times
//---------------------------------------
const times = await buildLibrary.getTimesForCompetitions();

/*
//---------------------------------------
// 1. build leaderboard
//---------------------------------------
//		- 전체
result = await buildLibrary.buildLeaderboardForTimes(times, 500);

//---------------------------------------
//		- year별
//---------------------------------------
result = await buildLibrary.buildLeaderboardForTimesAll(times, 500);
*/


//---------------------------------------
// 2. build competitions
//---------------------------------------
// Filter times for competitionID
// result = await libraryCompetition.buildCompetitionStatisticsAll(times, 32);


//---------------------------------------
// 3. build stems
//---------------------------------------
// Filter times for competitionID
// result = await libraryStem.buildStemStatisticsAll(times, 32);


//-----> OK
//---------------------------------------
// 4. build athletes
//---------------------------------------
await libraryAthlete.buildAthletesStatisticsAll(times, 32);

//---------------------------------------
// 5. build teams
//---------------------------------------

//---------------------------------------
// await this.buildTeamsStatisticsAll(times, 32);


//---------------------------------------
// 6. build pools
//---------------------------------------
// await this.buildPoolsStatisticsAll(times, 32);

	
})();


