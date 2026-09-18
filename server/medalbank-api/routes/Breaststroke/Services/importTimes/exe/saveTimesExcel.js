
const fs        = require('fs');
const excelLibrary= require('../../util/excelLibrary');
const excel	      = new excelLibrary();
const UtilDate    = require("../../util/utilDate");
const utilDate	  = new UtilDate();

const mongoDB			= require('../../class/MongoDB');
const mongoCFG 		= require('../../config/mongoCFG');
const mongodb 		= new mongoDB(mongoCFG.Medalbank.database);

const excelDAO = require('../excelDAO');


console.log("node read (competitionID)",);
if (process.argv.length < 3) return;

const competitionID = Number(process.argv[2]);

(async () => {
	let result, body

	const context = {
		query: { rank: { $lte: 100 } },
		projection: {_id:0, timeID:1, name:1, nameHide:1, gender:1, style:1, distance:1, athleteID:1, competitionID:1, poolID:1, teamID:1, times:1, diffs:1, rank:1, },
		limit: 100000,
		skip: 0,
		sort: { gender:1, style:1, distance:1, rank:1 },
	}
	result = await mongodb.find(mongoCFG.Medalbank.leaderboard, context);

	body = { category: 'times', type: 'times', id: '31' };
	// body = {rank: "8" };
	const filename = `./${competitionID}-times.xlsx`;
	result = await excelDAO.writeTimesExcel(filename, times);
	console.log("excelDAO.writeTimesExcel...");
	
})();
