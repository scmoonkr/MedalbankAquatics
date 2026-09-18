const _    				= require('lodash');
const extend 			= require('node.extend');
const utilLibrary = require("../../Util/utilLibrary");
const utilError		= require("../../Util/utilError");

const mongoCFG 		= require('../../Config/mongoCFG');
const mongoDB			= require('../../Class/MongoDB');
const mongodb 		= new mongoDB(mongoCFG.Medalbank.database);

const MemoryDB 		= require('../../Class/MemoryDB');
const memoryDB		= new MemoryDB();

const UtilDate		= require("../../Class/DateLibrary");
const utilDate		= new UtilDate();

const TimeLibrary		= require("./times.library");

//-----------------------------------------------
//	build teams
//-----------------------------------------------
exports.buildAthletes = async (query) => {
	const context = {
		query			: query,
		projection: { _id:0, },
		limit			: 100000,
		skip			: 0,
		sort			: { _id: -1 },
	}
	result = await mongodb.find(mongoCFG.Medalbank.times, context);

	const timeLibrary = new TimeLibrary();
	const times = timeLibrary.setCompetitionTeamPool(result.data);
	
	const teams = await this.buildAthleteStatistics(times);
}

//-----------------------------------------------
//	build teams statistics
//-----------------------------------------------
exports.buildAthleteStatistics = async (times) => {
	const timeLibrary = new TimeLibrary();

	// athleteID로 groupping
	const grouped = _.groupBy(times, (entry) => entry.athleteID);

	const statistics = [];
	for (const athleteID of Object.keys(grouped)) {
		const times = grouped[athleteID];
		const value = {
			athleteID		: Number(athleteID),
			timeCount	: times.length, 
		};

		const eventResult = times.filter(time => time.competitionID > 0);
		console.log("eventResult=", eventResult.length);

		const timeResult = times.filter(time => time.competitionID == undefined || time.competitionID == 0);
		console.log("timeResult=", timeResult.length);

		const statistic = {
			athleteID		: Number(athleteID),

			majorStyles : timeLibrary.getStylesByCount(times),
			competitions: timeLibrary.getCompetitionsByCount(times),
			sido      	: timeLibrary.getSidosByCount(times),  
			pools       : timeLibrary.getPoolsByCount(times),
			teams       : timeLibrary.getTeamsByCount(times),

			eventCount  : eventResult.length,
			medals      : timeLibrary.calculateMedals(eventResult),
			firstEvent  : timeLibrary.findFirstTime(eventResult),
			latestEvent : timeLibrary.findLatestTime(eventResult),
			bestEvent   : timeLibrary.findBestTime(eventResult),

			timeCount   : timeResult.length,
			firstTime   : timeLibrary.findFirstTime(timeResult),
			latestTime  : timeLibrary.findLatestTime(timeResult),
			bestTime    : timeLibrary.findBestTime(timeResult),
		}
		// statistics.seasonAverage = timeLibrary.calculateSeasonAverage(times);
		statistics.push(statistic);
	} // end for
	
	// get unique athleteIDs
	const athleteIDs = [...new Set(times.map((entry) => entry.athleteID))];
	console.log("athleteIDs=", athleteIDs);

	//------------------------------
	let result = await mongodb.deleteMany(mongoCFG.Medalbank.athletesStatistics, { teamID: { $in: athleteIDs } });
	//------------------------------
	console.log("delete=", result);

	//------------------------------
	result = await mongodb.insertMany(mongoCFG.Medalbank.athletesStatistics, statistics );
	//------------------------------
	console.log("insert=", result);

	return statistics;
}	