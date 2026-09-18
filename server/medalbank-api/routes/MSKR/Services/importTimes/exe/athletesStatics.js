const saticsDAO		= require('../staticsDAO');
// const MemoryDB 		= require('../../../Class/MemoryDB');
// const memoryDB		= new MemoryDB();

// const buildSaticsDAO		= require('../../importUTIL/buildStaticsDAO');

(async () => {
	let result, body

	const returnObj = { message: "", data: {} };
	console.time("staticAthletes");
	//--------------------------------------------
	// build athletes
	//--------------------------------------------
	result = await saticsDAO.staticAthletes();
	//--------------------------------------------
	console.timeEnd("staticAthletes");

	// result = await saticsDAO.statisticsAll();
	
})();
