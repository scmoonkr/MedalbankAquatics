const _    			= require('lodash');
const extend = require('node.extend');
const MongoDB     = require('../../Class/MongoDB.js');
const mongoCFG    = require('../../Config/mongoCFG.js');
const mongodb     = new MongoDB(mongoCFG.Medalbank.database);
const TimeLibrary = require('../../Class/TimeLibrary.js');

const timeLibrary = new TimeLibrary();

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
//============================================
