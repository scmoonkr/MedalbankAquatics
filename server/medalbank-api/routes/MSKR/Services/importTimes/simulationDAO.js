const fs          = require('fs');
const mskCFG 		  = require('../../Config/mskCFG');
const mongoCFG 		= require('../../Config/mongoCFG');
const mongoDB			= require('../../Class/MongoDB');
const utilLibrary = require("../../Util/utilLibrary");
const UtilDate    = require("../../Util/utilDate");
const readDAO					= require("./readDAO");
const checkDAO				= require("./checkDAO");

const utilDate	  = new UtilDate();
const mongodb 	  = new mongoDB(mongoCFG.Medalbank.database);

// const { grouppingRanking } = require('../import/extraInfo/buildRankingsDAO');
const { grouppingRanking } = require('./importUTIL/buildImportDAO');
const { getCompetition } = require('../competitions/competitions.routes');
const excelDAO		= require("./importUTIL/excelDAO");
const { Config }  = require('./importUTIL/config');
const Customizing = require('../times/times.custom');

const MemoryDB 		= require('../../Class/MemoryDB');
const memoryDB		= new MemoryDB();
const TimeModel    = require("../times/times.model");


/*********************************************************************
 * 
 *	simulation times excel
 *
 *********************************************************************/
exports.simulation = async (body) => {
	
	console.log(`database.importTime.simulation.body=`, body);
	const returnObj = { message: "", data: [] };
	const times = await readDAO.read(body);
	console.log("simulation.times=", times.data.slice(0,3));

	const names = times.data.map(time => time.name);
	let uniqueNames = [...new Set(names)]
	console.log("names=", names.length, uniqueNames.length);

	const timeArr = await TimeModel.searchNames({ name: uniqueNames.join(',') });
	console.log(timeArr.data.slice(0,5), timeArr.data.length);

	const uniqueTimes = [];
	for (const time of times.data) {
		const tm = timeArr.data.find(tm => tm.name==time.name && tm.gender==time.gender && tm.style==time.style && tm.distance==time.distance);
		if (tm) {
			time.simulation = true;
			time.time = tm.time;
			time.timeStamp = tm.timeStamp;
			time.athleteID = tm.athleteID ?? 0;	
			time.rank = tm.rank;
		}
		uniqueTimes.push(time);
	}

	console.log(uniqueTimes.slice(0, 10));
	return { message:'', data: uniqueTimes }
}
