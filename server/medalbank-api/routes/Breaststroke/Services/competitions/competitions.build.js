const _    			= require('lodash');
const extend = require('node.extend');


//============================================
const mskCFG    = require('../../Config/mskCFG.js');
const MongoDB     = require('../../Class/MongoDB.js');
const mongoCFG    = require('../../Config/mongoCFG.js');
const mongodb     = new MongoDB(mongoCFG.Medalbank.database);
const TimeLibrary = require('../../Class/TimeLibrary.js');

const collectionName = mongoCFG.Medalbank.leaderboard;

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
	
	let context = {
		query			: { competitionID: { $in: competitionIDs.data }, $or: [ {status: ""}, { status: { $exists: false }} ], fin: { $exists: false } },
		projection: { _id:0, timeID:1, athleteID:1, ageGroup:1, teamID:1, name:1, stemID:1, team:1, competitionID:1, style:1, gender:1, times:1, time:1, timeStamp:1, rank:1, course:1, distance:1, ageGroup:1, poolID:1, datetime:1},
		limit			: 2000000,
		skip			: 0,
		// sort 			: { datetime: 1, }
	}
	//---------------------------------
	//	times에서 times 가져옴
	//---------------------------------
	let timeArr = [];
	result = await mongodb.find(mongoCFG.Medalbank.timesOLD, context);

	let times = result.data.reduce((arr, time) => {
														time.timeStamp 	= time.time;
														time.time 			= time.times;
														time.datetime 	= new Date(time.datetime);
														delete time.athleteID;
														arr.push(time);
														return arr;
													}, []);

	timeArr = extend(true, [], times);
console.log("----> times.length=", timeArr.length);

	//---------------------------------
	//	times_medalbank에서 times 가져옴
	//---------------------------------
	context.query.competitionID = { $in: competitionMedalbankIDs };
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
		time.ageGroup = time.ageGroup ? time.ageGroup : mskCFG.getAgeGroupNameByAgeGroupCode(athleteOBJ[time.athleteID][0].ageGroup);
		timeArr.push(time);
	});
	console.log("----> timesMB.length=", timeArr.length);
	// console.log(timeArr.length,	timeArr[0]);
	// console.log(context.query, "times:", result.data);

	return timeArr;
}

exports.buildCompetitionStatistics = async (times, timeLimit=32) => {
	if (times.length == 0) return {};

	let result;

	console.log("times:", times.length);

	//---------------------------------
	//---------------------------------
	const statistics = await new TimeLibrary().makeCompetitionsStatistics(times, timeLimit);
	//---------------------------------

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
					// $unset: { times: 1 }
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
		const statistics = await new TimeLibrary().makeCompetitionsStatistics(timesStemID[key], timeLimit);

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
					// $unset: { times: 1 }
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
	const statistics = await new TimeLibrary().makeCompetitionsStatistics(times, timeLimit);
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
