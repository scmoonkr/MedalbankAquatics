const fs          = require('fs');
const mskCFG 		  = require('../../Config/mskCFG');
const mongoCFG 		= require('../../Config/mongoCFG');
const mongoDB			= require('../../Class/MongoDB');
const utilLibrary = require("../../Class/utilLibrary");
const UtilDate    = require("../../Class/utilDate");

const utilDate	  = new UtilDate();
const mongodb 	  = new mongoDB(mongoCFG.Breaststroke.database);

// const { grouppingRanking } = require('../import/extraInfo/buildRankingsDAO');
const { grouppingRanking } = require('./importUTIL/buildImportDAO');
const { getCompetition } = require('../competitions/competitions.model');
const { Config }  = require('./importUTIL/config');
const Customizing = require('../times/times.custom');


exports.updateTime = async (body) => {
	console.log(`importTime.updateTime.body=`, body);
	const returnObj = { message: "", data: {} };

	if (!body.seqno || !body.competitionID) {
		returnObj.message = "updateTime competitionID, seqno not found";
		console.log(returnObj.message);
		return returnObj;
	}

	const value = {
    name      		: body.name     	|| "",
    team      		: body.team     	|| "",
    time     		: body.time    		|| "",
    masters   		: body.masters		== false ? false : true,
    adult   		: body.adult   		== false ? false : true,
    individual		: body.individual	== false ? false : true,
    rank	    	: body.rank		   	|| "",
    ageGroup  		: body.ageGroup 	|| "",
    gender    		: body.gender   	|| "",
    style     		: body.style    	|| "",
    course    		: body.course   	|| "",
    distance  		: body.distance 	|| "",
    status    		: body.status   	|| "",
    age    				: body.age   			|| "",
    note	    		: body.note		   	|| "",
	}
	value.nameHide = utilLibrary.nameHide(body.name);
	value.names = value.name.split(',');

	if (body.times) value.time = utilDate.convertString2Timestamp(value.times);

	// returnObj.data = Customizing.customizing(value);

	//-------------------------------------------------
	//	update
	//-------------------------------------------------
	const query = { competitionID: Number(body.competitionID), seqno: Number(body.seqno) };
	const result = await mongodb.updateOne(mongoCFG.Breaststroke.timesImport, query, value);

	return returnObj;
}

exports.deleteTime = async (body) => {
	console.log(`importTime.deleteTime.body=`, body);
	const returnObj = { message: "", data: {} };

	if (!body.seqno || !body.competitionID) {
		returnObj.message = "deleteTime competitionID, seqno not found";
		console.log(returnObj.message);
		return returnObj;
	}

	const query = { competitionID: Number(body.competitionID), seqno: Number(body.seqno) };
	console.log("importTime.deleteTime.query=", query);
	let result = await mongodb.deleteOne(mongoCFG.Breaststroke.timesImport, query);
	return returnObj;
}
