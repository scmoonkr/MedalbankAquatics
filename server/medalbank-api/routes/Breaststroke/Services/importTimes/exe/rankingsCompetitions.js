

const mskCFG 		  = require('../../config/mskCFG');
const mongoDB			= require('../../class/MongoDB');
const mongoCFG 		= require('../../config/mongoCFG');
const mongodb 		= new mongoDB(mongoCFG.Medalbank.database);

const importDAO  	= require('../../importUTIL/buildImportDAO');

console.log("node rankingsCompetitions (competitionID)",);
if (process.argv.length < 3) return;

const competitionID = Number(process.argv[2]);

(async () => {
	let result, body
	
	const context = {
		query: { competitionID: competitionID, $or: [ {status: ""}, { status: { $exists: false }}], times: { $ne: "" }, fin: { $exists: false } },
		projection: { _id:0, timeID:1, name:1,time:1, times:1, gender:1, style:1, distance:1, ageGroup:1 },
		limit: 10000,
	}
	result = await mongodb.find(mongoCFG.Medalbank.times, context);

  const times = importDAO.setTimesAgeGroupRank(result.data);

  
  for (const time of times) {
    const query = { timeID: time.timeID };
    const value = { rank: time.rank };
    result = await mongodb.updateOne(mongoCFG.Medalbank.times, query, value);
    console.log(query, value, time.times);
  }
	console.log(times.length);
})();
