
const fs        = require('fs');
const excelLibrary= require('../../util/excelLibrary');
const excel	      = new excelLibrary();
const UtilDate    = require("../../util/utilDate");
const utilDate	  = new UtilDate();

const mongoDB			= require('../../class/MongoDB');
const mongoCFG 		= require('../../config/mongoCFG');
const mongodb 		= new mongoDB(mongoCFG.Medalbank.database);

const MemoryDB 		= require('../../../Class/MemoryDB');
const memoryDB		= new MemoryDB();

const checkDAO = require('../checkDAO');


console.log("node read (competitionID)",);
// if (process.argv.length < 3) return;

const competitionID = 69; // Number(process.argv[2]);

(async () => {
	let result, body


	await memoryDB.initialize();

	body = { competitionID: competitionID };
	// body = {rank: "8" };
	result = await checkDAO.check(body);
	console.log("result.data=", result.data.slice(0, 10));

  for (const time of result.data) {
    console.log(time.rank, time.times, time.name);
  }
	// console.log("length=", result.data.slice(0, 10));
	// console.log("message=", result.message);
	
})();
