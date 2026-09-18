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
const { Config }  = require('./importUTIL/config');
const Customizing = require('../times/times.custom');


/*********************************************************************
 * 
 *	merge times
 *
 *********************************************************************/
 exports.merge = async (body) => {

	console.log(`database.importTime.merge.body=`, body);
	const returnObj = { message: "", data: {} };


	return returnObj;
}
