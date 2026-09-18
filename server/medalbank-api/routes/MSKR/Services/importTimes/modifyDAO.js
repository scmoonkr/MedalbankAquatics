const fs          = require('fs');
const mskCFG 		  = require('../../Config/mskCFG');
const mongoCFG 		= require('../../Config/mongoCFG');
const mongoDB			= require('../../Class/MongoDB');
const utilLibrary = require("../../Util/utilLibrary");
const UtilDate    = require("../../Util/utilDate");

const utilDate	  = new UtilDate();
const mongodb 	  = new mongoDB(mongoCFG.Medalbank.database);

// const { grouppingRanking } = require('../import/extraInfo/buildRankingsDAO');
const { grouppingRanking } = require('./importUTIL/buildImportDAO');
const { getCompetition } = require('../competitions/competitions.model');
const excelDAO		= require("./importUTIL/excelDAO");
const { Config }  = require('./importUTIL/config');
const Customizing = require('../times/times.custom');

const importDAO  	= require('./importUTIL/buildImportDAO');
const mergeDAO 	= require("./importUTIL/mergeAthletesDAO");
const checkDAO				= require("./checkDAO");


/*********************************************************************
 * 
 *	check times
 *
 *********************************************************************/
exports.modifyImportedTimes = async (body) => {
	const returnObj = { message: "", data: {} };

	console.log(`database.modifyImportedTimes.check.body=`, body);

	const competitionID = Number(body.competitionID);
	let		query = { competitionID: competitionID };
	//----------------------------------------------
	//	find competitions
	//----------------------------------------------
	result = await mongodb.findOne(mongoCFG.Medalbank.competitions, query, { _id:0, });
	if (result.data.length == 0) {
		console.log("check no copetition: competitionID=", competitionID);
		returnObj.message = "check no copetition: competitionID=" + competitionID;
		return returnObj;
	}
	const competition = result.data;

	let context = {
		query			: query,
		projection: { _id:0, },
		limit			: 5000,
		skip			: 0,
	}
	//----------------------------------------------
	//	find timesImport
	//----------------------------------------------tmsimportedTimes
	result = await mongodb.find(mongoCFG.Medalbank.timesImport, context);
	if (result.data.length == 0) {
		console.log("get timesImport....");
		return returnObj;
	}

	context = {
		query			: query,
		projection: { _id:0, timeID:1, name:1, athleteID:1, times:1, timesOld:1, gender:1, style:1, distance:1, ageGroup:1, },
		limit			: 5000,
		skip			: 0,
		sort			: { timeID: 1 },
	}
	//----------------------------------------------
	//	find timesImport
	//----------------------------------------------
	const resTimes = await mongodb.find(mongoCFG.Medalbank.times, context);

	for (let no=0; no<result.data.length; no++) {
		const time = result.data[no];
		const importedTimes = resTimes.data.find(tm => tm.name==time.name && tm.gender==time.gender && tm.style==time.style && tm.distance==time.distance && tm.ageGroup==time.ageGroup );
		time.note = "x";
		if (importedTimes) {
			if (importedTimes.times != time.times) {
				time.note = `${importedTimes.timeID}-${importedTimes.name}-${importedTimes.athleteID}-${importedTimes.times}`;

				//---------------------------------------------------------
				const query = { timeID: importedTimes.timeID };
				const value = {
					times		: time.times,
					time		: time.times ? utilDate.convertString2Timestamp(time.times) : 0,
					timesOld: importedTimes.times,
				}
				// if (!importedTimes.timesOld) importedTimes.timesOld = importedTimes.times;
				//---------------------------------------------------------------
				await mongodb.updateOne(mongoCFG.Medalbank.times, query, value);
				console.log(query, value);
				//---------------------------------------------------------------
			}
		}
	}
	return checkDAO.check(body);
	//-----------------------------------------
}
