
const fs        = require('fs');
const excelLibrary= require('../../util/excelLibrary');
const excel	      = new excelLibrary();
const UtilDate    = require("../../util/utilDate");
const utilDate	  = new UtilDate();

const mongoDB			= require('../../class/MongoDB');
const mongoCFG 		= require('../../config/mongoCFG');
const mongodb 		= new mongoDB(mongoCFG.Medalbank.database);

const staticsDAO = require('../staticsDAO');


console.log("node read (competitionID)",);
// if (process.argv.length < 3) return;

const competitionID = 1347; // Number(process.argv[2]);

(async () => {
	let result, body

	const context = {
		query: {},
		projection: { _id:0, competitionID:1, stemID:1},
		limit: 10000
	}
	result = await mongodb.find(mongoCFG.Medalbank.competitions, context)
	console.log(result.data.length);
	for (const competition of result.data) {
		const query = { competitionID: competition.competitionID };
		const value = { stemID: competition.stemID };
		await mongodb.updateMany(mongoCFG.Medalbank.times, query, value)
		console.log(query, value);
	}
	
})();
