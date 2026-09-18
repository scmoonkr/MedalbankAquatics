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
//	build competitions
//-----------------------------------------------
exports.buildCompetitions = async (query) => {
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
	
	const competitions = await this.buildCompetitionStatistics(times);
}

//-----------------------------------------------
//	build competitions statistics
//-----------------------------------------------
exports.buildCompetitionStatistics = async (timeArr) => {
	const grouped = _.groupBy(timeArr, (entry) => entry.competitionID);
	
	const timeLibrary = new TimeLibrary();

	const competitionsStatistics = [];
	for (const competitionID of Object.keys(grouped)) {
		const times = grouped[competitionID];

		const value = {
			competitionID		: Number(competitionID),
			timeCount	: times.length, 
		};
		value.timeCount				= times.length;
		value.athleteCount		= Object.entries(_.countBy(times, "athleteID"))
																	.map(([data, count]) => ({
																				athleteID: Number(data),
																				count,
																			}))
																	.filter(data => !isNaN(data.athleteID) && data.athleteID != 'undefined').length
		value.bestTimes				= timeLibrary.findBestTime(times, 3);
		// value.medals					= timeLibrary.countByStyleAndGender(times);
		value.styleDistances	= timeLibrary.getDistance4GenderStyle(times); // gender-style, 50M, 100M, 200M, ...
		value.ageGroups				= timeLibrary.getAgeGroupByCount(times);

		competitionsStatistics.push(value);

	} // end for

	console.log("competitionPoints:", competitionsStatistics);
	const competitionIDs = [...new Set(timeArr.map((entry) => entry.competitionID))];
	console.log("competitionIDs=", competitionIDs);
	let result = await mongodb.deleteMany(mongoCFG.Medalbank.competitionsStatistics, { competitionID: { $in: competitionIDs } });
	// console.log("delete=", result);
	result = await mongodb.insertMany(mongoCFG.Medalbank.competitionsStatistics, competitionsStatistics );
	// console.log("insert=", result);

	//---------------------------------------------
	for (const competition of competitionsStatistics) {
		const query = { competitionID: competition.competitionID };
		const value = { timeCount: competition.timeCount, athleteCount: competition.athleteCount };
		result = await mongodb.updateOne(mongoCFG.Medalbank.competitions, query, value );
	}
	//---------------------------------------------


	return competitionsStatistics;
}