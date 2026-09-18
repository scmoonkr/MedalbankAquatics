
const fs        = require('fs');
const excelLibrary= require('../../util/excelLibrary');
const excel	      = new excelLibrary();
const UtilDate    = require("../../util/utilDate");
const utilDate	  = new UtilDate();

const mskCFG 		  = require('../../config/mskCFG');
const mongoDB			= require('../../class/MongoDB');
const mongoCFG 		= require('../../config/mongoCFG');
const mongodb 		= new mongoDB(mongoCFG.Medalbank.database);

(async () => {
	
	const teamIDs = await mongodb.distinct(mongoCFG.Medalbank.times, "teamID");
console.log("teamIDs=", teamIDs.data);
	const query = { teamID: { $nin: teamIDs.data }};
	const context = {
		query: query,
		projection: { _id:0, teamID:1, name:1, },
		limit: 10000,
	}
	// const notUsed = await mongodb.find(mongoCFG.Medalbank.teams, context);
	const notUsed = await mongodb.deleteMany(mongoCFG.Medalbank.teams, query);
	console.log("notUsed=", notUsed.data.length);
})();
