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
const context = {
  // query     : { count: { $exists: false } },
  query     : { athleteID:23 },
  projection: { _id:0, athleteID:1, ageGroup:1 },
  limit			: 2000000,
  skip			: 0,
  // sort 			: { datetime: 1, }
}
const athletes = await mongodb.find(mongoCFG.Medalbank.athletes, context);
const athleteIDs = athletes.data.map(el => el.athleteID)
console.log(athleteIDs);




const query = {
  athleteID : { $in: athleteIDs },
  timeStamp : { $gt: 0 },
  // isMasters	: true,
  // isAdult		: true,
  $or       : [ {status: ""}, { status: { $exists: false }} ],
}
const times = await buildLibrary.getTimes(query);

console.log(times[0], times.length);
// const athleteIDs = [...new Set(times.map(el => el.athleteID).map(athleteID => athleteID))];

// return;

// return;
//-----> OK
//---------------------------------------
// 4. build athletes
//---------------------------------------
const statistics = await libraryAthlete.buildAthletesStatisticsAll(times, 32);
console.log(statistics[0]);
	
})();


