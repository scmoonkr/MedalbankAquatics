const saticsDAO		= require('../staticsDAO');
const MemoryDB 		= require('../../../Class/MemoryDB');
const memoryDB		= new MemoryDB();

const mongoDB			= require('../../class/MongoDB');
const mongoCFG 		= require('../../config/mongoCFG');
const mongodb 		= new mongoDB(mongoCFG.Medalbank.database);

const buildSaticsDAO		= require('../../importUTIL/buildStaticsDAO');
// console.log("node read (competitionID)",);
// if (process.argv.length < 3) return;

const competitionID = 1; // Number(process.argv[2]);

(async () => {
	let result, body

	const returnObj = { message: "", data: {} };

	//--------------------------------------------
	// load memory: competitions, stems, teams, rankings
	//--------------------------------------------
	await memoryDB.loadMemoryDB();
	result = await saticsDAO.statisticsAll();
return;
	//--------------------------------------------
	// load Times
	//--------------------------------------------
	// result = await buildSaticsDAO.loadTimes();
	//--------------------------------------------
	// console.log("times.length=", result.length);

	//--------------------------------------------
	// build stems
	//--------------------------------------------
	// result = await buildSaticsDAO.stemsStatics(timeArr);
	//--------------------------------------------
	// console.log("stems.length=", Object.keys(stemOBJ).length);

	//--------------------------------------------
	// build competitions
	//--------------------------------------------
	// result = await buildSaticsDAO.competitionStaticsAll(timeArr,);
	//--------------------------------------------
	
  const athleteID = 23;
  const context = {
		query: {time:{ $gt:0}, $or: [ {status: ""}, { status: { $exists: false }} ], fin: { $exists: false }  },
		projection: {_id:0, timeID:1, name:1, nameHide:1, gender:1, style:1, distance:1, teamID:1, athleteID:1, competitionID:1, poolID:1, teamID:1, time:1, times:1, diffs:1, rank:1, rankGroup:1 },
		limit: 1000000,
		sort: { gender:1, style:1, distance:1, time:1, },
	}
	result = await mongodb.find(mongoCFG.Medalbank.times, context);
	const timeArr = result.data.reduce((arr, time) => {
                                time.datetime = memoryDB.getCompetition(time.competitionID).dateStart; // Date()
                                arr.push(time);
                                return arr;
                              }, [])

console.log(timeArr.length);

	//--------------------------------------------
	// build athletes
	//--------------------------------------------
	result = await buildSaticsDAO.athleteStaticsAll(timeArr,);
	//--------------------------------------------

	
})();
