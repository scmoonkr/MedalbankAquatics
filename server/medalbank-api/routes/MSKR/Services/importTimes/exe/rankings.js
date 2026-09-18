
const fs        = require('fs');
const excelLibrary= require('../../util/excelLibrary');
const excel	      = new excelLibrary();
const UtilDate    = require("../../util/utilDate");
const utilDate	  = new UtilDate();

const mongoDB			= require('../../class/MongoDB');
const mongoCFG 		= require('../../config/mongoCFG');
const mongodb 		= new mongoDB(mongoCFG.Medalbank.database);

const rankingsDAO = require('../rankingsDAO');



(async () => {
	let result, body

	const times = await loadTimes();
	// body = {rank: "8" };
	result = await rankingsDAO.buildRankings(times);
	// console.log("result.data=", result.data.slice(0, 10));
	// console.log("length=", result.data.slice(0, 10));
	// console.log("message=", result.message);
	
})();
async function loadTimes() {
	context = {
		query: {
			// style:"individualMedley",gender:"women",distance:"200M",
			// competitionID: { $in: uploadedCompetitions },
			// individual: true,
			masters		: true,
			adult			: true,
			athleteID	:{ $exists: true },
			poolID		:{ $exists: true },
			teamID		:{ $exists: true },
			$or: [ {status: ""}, { status: { $exists: false }} ],
			time			: { $gt: 0 }, fin: { $exists: false }
		},
		projection: {_id:0, },		
		limit: 500000,
		skip: 0,
		sort: { gender:1, style:1, distance:1, time:1 },
	}		
	result = await mongodb.find(mongoCFG.Medalbank.times, context);
	return result.data;
}
