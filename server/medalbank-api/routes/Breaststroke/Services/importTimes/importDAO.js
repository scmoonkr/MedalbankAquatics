const fs          = require('fs');
const mskCFG 		  = require('../../Config/mskCFG');
const mongoCFG 		= require('../../Config/mongoCFG');
const utilLibrary = require("../../Class/utilLibrary");


// const utilTimes    = require("../../Util/utilTimes");
const UtilDate    = require("../../Class/utilDate");
const utilDate	  = new UtilDate();

const mongoDB			= require('../../Class/MongoDB');
const mongodb 	  = new mongoDB(mongoCFG.Breaststroke.database);
const { Config }  = require('./importUTIL/config');

// const timesDAO = require('../medalbank/database/times/customizing');
// const athletesDAO = require('../medalbank/database/athletes/customizing');
const uploadTeamsDAO  = require('./uploadTeamsDAO.js');

const timesDAO = require('../times/times.custom.js');
const athletesDAO = require('../athletes/athletes.custom.js');


/*********************************************************************
 * 
 *	import times
 *
 *********************************************************************/
 exports.importTimes = async (body) => {

	console.log(`database.importTime.importTimes.body=`, body);
	const returnObj = { message: "", data: {} };

	const competitionID = Number(body.competitionID);
	const competition = await mongodb.findOne(mongoCFG.Breaststroke.competitions, { competitionID: competitionID });
	if (!competition.data.competitionName) {
		competition.data = { competitionName: '', datetime: '', }
	}
	const context = {
		query			: { competitionID: competitionID },
		projection: { _id:0, },
		limit			: 5000,
		skip			: 0,
	}
	//----------------------------------------------
	//	find timesImport
	//----------------------------------------------
	result = await mongodb.find(mongoCFG.Breaststroke.timesImport, context);
	if (result.data.length == 0) {
		returnObj.message = "get importTimes.... no timesImport data";
		console.log(returnObj.message);
		return returnObj;
	}
	// const times = result.data.map(data => (timesDAO.field(data)));
	let newTeams = result.data.reduce((arr, data) => {
																			if (data.teamID == 0) arr.push(data.team);
																			return arr;
																		}, []);
	newTeams = [...new Set(newTeams)] // remove duplicate values

	let timeID = await mongodb.max(mongoCFG.Breaststroke.times, "timeID");
	const teams = await uploadTeamsDAO.uploadTeams({teams: newTeams.join('\n')});
	const times = result.data.reduce((arr, data) => {
																		data.timeID = timeID++;
																		if (data.teamID == 0) {
																			const team = teams.data.teams.find(el => el.name==data.team)
																			data.teamID = team.teamID;
																		}
																		data.datetime = data.datetime || competition.data.datetime || competition.data.dateStart;
																		data.competitionName = data.competitionName || competition.data.competitionName || competition.data.fullname;
																		data.norm = utilLibrary.normalizeMSKR(data.name);															data.norm = data.name
																		arr.push(timesDAO.customizing(data));
																		return arr;
																	}, []);

	//------------------------------------------------
  //  check athleteID
	//------------------------------------------------
	const names = [];
	// get unique names
	for (const time of times) {
		if (!time.isMasters || names.includes(time.name)) continue
		names.push(time.name);
		// if (!names.includes) names.push(time.name);
	}

	// get masters athleteID
	const contexta = {
		query: { name: { $in: names }, athleteID: { $lt: 100000} },
		projection: { _id:0, athleteID:1, name:1 },
		limit: 100000,
		skip: 0,
	};

	console.log("bf.athleteID.", times.filter(el => el.athleteID).map(el => el.athleteID));
	const athletes = await mongodb.find(mongoCFG.Breaststroke.athletes, contexta);
	// set athleteID
	let insertedAthletes = "";
	times.forEach(time => {
		const athlete = athletes.data.find(el => el.name == time.name);
		if (athlete) {
			time.athleteID = athlete.athleteID;
			insertedAthletes += `${time.athleteID}-${time.name}\n`;
		}
	});
	console.log("times=", times.length, "names:", names.length);
	console.log("af.athleteID.", times.filter(el => el.athleteID).map(el => el.athleteID));
	console.log("+++++", insertedAthletes);


	//------------------------------------------------
  //  not check merge, delete times by competitionID
	//------------------------------------------------
  if (!body.merge) {
    console.log("delete times.competitionID=", competitionID);
    result = await mongodb.deleteMany(mongoCFG.Breaststroke.times, { competitionID: competitionID });
  }
	//------------------------------------------------
  //------------------------------------------------
	result = await mongodb.insertMany(mongoCFG.Breaststroke.times, times);
  console.log("\n===============================\nimport.times=", times.length, "\n===============================\n");
	//------------------------------------------------

	//----------------------------------------------
	//	find athletesImport
	//----------------------------------------------
	/*
	let athletes = [];
	result = await mongodb.find(mongoCFG.Breaststroke.athletesImport, context);
	if (result.data.length == 0) {
		returnObj.message = "get importTimes.... no timesImport data";
	} else {
		athletes = result.data.map(data => (athletesDAO.customizing(data)));
		console.log("timesImport.length=", athletes.length);

		//------------------------------------------------
		result = await mongodb.insertMany(mongoCFG.Breaststroke.athletes, athletes);
		//------------------------------------------------

		//------------------------------------------------
		result = await teamStatics.buildTimes2TeamStaticStruct(competitionID);
		//------------------------------------------------

	}
	*/

	console.log("import ok....", times.slice(0,1));

	//--------------------------------------------
	//	return first page (100 rows) + total count
	//--------------------------------------------
	const pageSize = Number(body.page_size) || 100;
	const page		 = Number(body.page) || 1;
	return {
		data			: times.slice((page - 1) * pageSize, page * pageSize),
		count			: times.length,
		page			: page,
		page_size	: pageSize,
		message		: insertedAthletes,
	};
}
