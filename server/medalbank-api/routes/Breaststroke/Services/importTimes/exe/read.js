
const fs        = require('fs');
const excelLibrary= require('../../../Class/excelLibrary');
const excel	      = new excelLibrary();
const UtilDate    = require("../../../Class/utilDate");
const utilDate	  = new UtilDate();

const mongoDB			= require('../../../Class/MongoDB');
const mongoCFG 		= require('../../../Config/mongoCFG');
const mongodb 		= new mongoDB(mongoCFG.Medalbank.database);

const MemoryDB 		= require('../../../Class/MemoryDB');
const memoryDB		= new MemoryDB();

const readDAO = require('../readDAO');


// console.log("node read (competitionID)",);
// if (process.argv.length < 3) return;

const competitionID = process.argv.length < 2 ? 3616 : Number(process.argv[2]);

(async () => {
	let result, body

	await memoryDB.initialize();

	body = { category: 'times', type: 'times', id: '3616' };
	// body = {rank: "8" };
	result = await readDAO.read(body);
	// console.log("result.data=", result.data.slice(0, 10));
	// console.log("length=", result.data.slice(0, 10));
	console.log("message=", result.message);
	
})();
