
const fs        = require('fs');
const excelLibrary= require('../../../Util/excelLibrary');
const excel	      = new excelLibrary();
const UtilDate    = require("../../../Util/utilDate");
const utilDate	  = new UtilDate();

const mongoDB			= require('../../../Class/MongoDB');
const mongoCFG 		= require('../../../Config/mongoCFG');
const mongodb 		= new mongoDB(mongoCFG.Medalbank.database);

const MemoryDB 		= require('../../../Class/MemoryDB');
const memoryDB		= new MemoryDB();

const simulationDAO = require('../simulationDAO');


// console.log("node read (competitionID)",);
// if (process.argv.length < 3) return;

const competitionID = process.argv.length < 2 ? 1389 : Number(process.argv[2]);

(async () => {
	let result, body

	await memoryDB.initialize();

	body = { category: 'times', type: 'times', id: '1' };
	// body = {rank: "8" };
	result = await simulationDAO.simulation(body);
	// console.log("result.data=", result.data.slice(0, 10));
	// console.log("length=", result.data.slice(0, 10));
	// console.log("message=", result.message);
	
})();
