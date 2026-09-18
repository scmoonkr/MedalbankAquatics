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

//-----------------------------------------------
//  times ranking for competitionID
//-----------------------------------------------
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

//-----------------------------------------------
//  delete name이 없는 athletes
//-----------------------------------------------
exports.deleteAthletesNoName = async (body) => {
	console.log(">database.management.deleteAthletesNoName~~~~~~~~~~~~~~~", body);
  //-----> 
  const query = { $or: [{ name: { $exists: false }, name: "" }] };
  await mongodb.deleteMany(mongoCFG.Breaststroke.athletes, query);
}


//-----------------------------------------------
//  remove times 없는  athletes
//-----------------------------------------------
exports.deleteAthletesNoTimes = async (body) => {
  console.log("deleteAthletesNoTimes");

  const athletes = await mongodb.distinct(mongoCFG.Breaststroke.athletes, "athleteID"); // , { $or: [ {status: ""}, { status: { $exists: false }} ] });	
  console.log("athletes.athleteID=", athletes.data.length);
  
    const times = await mongodb.distinct(mongoCFG.Breaststroke.times, "athleteID");	
    console.log("times.athleteID=", times.data.length);
  
    const athleteIDs = athletes.data.reduce((arr, athleteID) => {
      if (!times.data.includes(athleteID)) arr.push(athleteID);
      return arr;
    }, [])
    console.log(athleteIDs, athleteIDs.length);
  
    if (athleteIDs.length > 0) {
      // console.log(">database.management.deleteAthletesNoTimes.athleteIDs=", athleteIDs);
      result = await mongodb.deleteMany(mongoCFG.Breaststroke.athletes, { athleteID: { $in: athleteIDs } });
    }
  
    return "";
}

//-----------------------------------------------
//  athletes에 athleteID가 없는 times athleteID unset
//-----------------------------------------------
exports.unsetTimesAthleteID = async (body) => {
  console.log("unsetTimesAthleteID");

  const athletes = await mongodb.distinct(mongoCFG.Breaststroke.athletes, "athleteID", { $or: [ {status: ""}, { status: { $exists: false }} ] });	
  console.log("athletes.athleteID=", athletes.data.length);
  
    const times = await mongodb.distinct(mongoCFG.Breaststroke.times, "athleteID");	
    console.log("times.athleteID=", times.data.length);
  
    const athleteIDs = times.data.reduce((arr, athleteID) => {
      if (!athletes.data.includes(athleteID)) arr.push(athleteID);
      return arr;
    }, [])
    console.log(athleteIDs, athleteIDs.length);
  
    if (athleteIDs.length > 0) {
      console.log(">database.management.unsetTimesAthleteID.athleteIDs=", athleteIDs);
      result = await mongodb.updateManyOP(mongoCFG.Breaststroke.times, { athleteID: { $in: athleteIDs } }, { $unset: { athleteID:1}});	
    }
  
    return "";
}

//-----------------------------------------------
//  teams에 teamID가 없는 times teamID가 unset
//-----------------------------------------------
exports.unsetTimesTeamID = async (body) => {
	console.log(">database.management.unsetTimesTeamID~~~~~~~~~~~~~~~");

  const teams = await mongodb.distinct(mongoCFG.Breaststroke.teams, "teamID");	
  console.log("teams.teamID.length=", teams.data.length);
  
    const times = await mongodb.distinct(mongoCFG.Breaststroke.times, "teamID");	
    console.log("times.teamID.length=", times.data.length);
  
    const teamIDs = times.data.reduce((arr, teamID) => {
      if (!teams.data.includes(teamID)) arr.push(teamID);
      return arr;
    }, [])
    console.log("not exists...", teamIDs, teamIDs.length);
  
    if (teamIDs.length > 0) {
      result = await mongodb.updateManyOP(mongoCFG.Breaststroke.times, { teamID: { $in: teamIDs } }, { $unset: { teamID:1}});	
    }
  
    return "";
}

//-----------------------------------------------
//  delete times not exists athleteID
//-----------------------------------------------
exports.deleteTimesNotExistsAthleteID = async (body) => {
	console.log(">database.management.deleteTimesNotExistsAthleteID~~~~~~~~~~~~~~~", body);
}

//-----------------------------------------------
//  rebuild times teamID
//-----------------------------------------------
exports.rebuildTimesTeamID = async (body) => {
	console.log(">database.management.rebuildTimesTeamID~~~~~~~~~~~~~~~", body);
	let returnObj = { message: "", data: [] };
  
  //-----> 
  const query = {fin: { $exists: false }};
  if (body && body.competitionID) query.competitionID = Number(body.competitionID);
  const context = {
		query: query,
		projection: { _id:0, timeID:1, name:1, team:1, teamORG:1, teamID:1 },
		limit: 10000,
	}
  //-------------------------------------------------
  //  times for competitionID
  //-------------------------------------------------
	const result = await mongodb.find(mongoCFG.Breaststroke.times, context);
  //-------------------------------------------------
}

//-----------------------------------------------
//  delete teams times not exists
//-----------------------------------------------
exports.deleteTeamsTimesNotExists = async (body) => {
	console.log(">database.management.deleteTeamsTimesNotExists~~~~~~~~~~~~~~~", body);
}
