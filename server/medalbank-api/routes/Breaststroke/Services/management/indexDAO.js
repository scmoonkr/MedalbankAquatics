const extend 			= require('node.extend');
const swimmingCFG = require("../../Config/swimmingCFG");
const mongoCFG 		= require('../../Config/mongoCFG');
const mongoDB			= require('../../Class/MongoDB');
const UtilDate    = require("../../Class/DateLibrary");
const MemoryDB 		= require('../../Class/MemoryDB');
const utilLibrary = require("../../Class/utilLibrary");

const mongodb 	  = new mongoDB(mongoCFG.Breaststroke.database);
const utilDate	  = new UtilDate();
const memoryDB		= new MemoryDB();

const importDAO  	= require('../importTimes/importUTIL/buildImportDAO');


/*********************************************************************
 * 
 *	create
 *
 *********************************************************************/
 exports.statics = async (body) => {
  console.log("\statics.memoryDB loading..");
  await memoryDB.loadMemoryDB();
  
  const statics = await memoryDB.loadStatics();
  // console.log("management.statics.", statics);
  return statics;
 }
/*
 *	times ranking
 */
exports.timesRankings = async (body) => {
	console.log(">database.management.timesRankings~~~~~~~~~~~~~~~", body);
	let returnObj = { message: "", data: [] };
  
  if (!body.competitionID) {
    console.log("competitionID not found");
    return "competitionID not found";
  }
  //-----> 
  const context = {
		query: { competitionID: Number(body.competitionID), $or: [ {status: ""}, { status: { $exists: false }}], times: { $ne: "" }, fin: { $exists: false } },
		projection: { _id:0, timeID:1, name:1,time:1, times:1, gender:1, style:1, distance:1, ageGroup:1 },
		limit: 10000,
	}
  //-------------------------------------------------
  //  times for competitionID
  //-------------------------------------------------
	const result = await mongodb.find(mongoCFG.Breaststroke.times, context);
  //-------------------------------------------------

  //-------------------------------------------------
  //  rank for ageGroup, gender, style, distance
  //-------------------------------------------------
  const times = importDAO.setTimesAgeGroupRank(result.data);
  //-------------------------------------------------
  
  //-------------------------------------------------
  //  update rank
  //-------------------------------------------------
  for (const time of times) {
    const query = { timeID: time.timeID };
    const value = { rank: time.rank };
    await mongodb.updateOne(mongoCFG.Breaststroke.times, query, value);
    console.log(query, value, time.times);
  }
  //-------------------------------------------------
  console.log("ranking OK...");

  return "";
}
