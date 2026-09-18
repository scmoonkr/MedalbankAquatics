const fs          = require('fs');
const mskCFG 		  = require('../../Config/mskCFG');
const mongoCFG 		= require('../../Config/mongoCFG');
const mongoDB			= require('../../Class/MongoDB');
const utilLibrary = require("../../Class/utilLibrary");
const UtilDate    = require("../../Class/utilDate");

const utilDate	  = new UtilDate();
const mongodb 	  = new mongoDB(mongoCFG.Breaststroke.database);

// const { grouppingRanking } = require('../import/extraInfo/buildRankingsDAO');
const { grouppingRanking } = require('./importUTIL/buildImportDAO');
const { getCompetition } = require('../competitions/competitions.model');
const excelDAO		= require("./importUTIL/excelDAO");
const { Config }  = require('./importUTIL/config');
const MemoryDB 		= require('../../Class/MemoryDB');
const memoryDB		= new MemoryDB();
const Customizing = require('../times/times.custom');

const teamModel  	= require('../teams/teams.model');
const importDAO  	= require('./importUTIL/buildImportDAO');
const mergeDAO 	= require("./importUTIL/mergeAthletesDAO");


/*********************************************************************
 * 
 *	check times
 *
 *********************************************************************/
exports.check = async (body) => {
	const returnObj = { message: "", data: {} };

	console.log(`database.importTime.check.body=`, body);
  if (!body.competitionID) {
    console.log("check.competitionID not found!!!");
    return returnObj;
  }
  
  const competitionID = Number(body.competitionID);
	//-------------------------------------------------
	//	get competition
	//-------------------------------------------------
	// const competition = memoryDB.getCompetition(competitionID);
	const res = await mongodb.findOne(mongoCFG.Breaststroke.competitions, { competitionID: competitionID }, { _id:0 });
	const competition = res.data || {};
	//-------------------------------------------------

	//----------------------------------------------
	//	find timesImport
	//----------------------------------------------
	const context = {
		// query			: { competitionID: competitionID },
		query			: { 
      // "gender" : "women",
      // "discipline" : "breaststroke",
      // "distance" : "50M","ageGroup" : "일반3부(7G) 40~49세",
      competitionID: competitionID
    },
		projection: { _id:0, },
		limit			: 5000,
		skip			: 0,
	}
	result = await mongodb.find(mongoCFG.Breaststroke.timesImport, context);
	if (result.data.length == 0) {
		console.log("check.get timesImport....");
		return returnObj;
	}

	//--------------------------------------------
	// 3. set rank ageGroup
	//--------------------------------------------
  const timeArr = result.data.reduce((arr,time) => {
																			if (!time.time) time.timeStamp = 0;
																			arr.push(time);
																			return arr;
																		}, [])
	let times = timeArr;
  if (times.find(time => time.groupRank && time.groupRank > 0)) {
    times = importDAO.setTimesAgeGroupRank(timeArr);
  }
	if (times.length == 0) {
		console.log(`setTimesAgeGroupRank ${competitionID}:  file not found`);
		return;
	}

	//--------------------------------------------
	// 3. check teamID, team, pool
	//--------------------------------------------
	const medalbank = await checkTeamPool(times, competition);
  

	//--------------------------------------------
	// 2. get max timeID & set timeID
	//--------------------------------------------
	let timeID = await mongodb.max(mongoCFG.Breaststroke.times, "timeID");
	medalbank.times = medalbank.times.map((time, index) => ({
                                      ...time,
                                      timeID: timeID++
                                    }));
	//--------------------------------------------

	//--------------------------------------------
	// 2. set timeID
	//--------------------------------------------
	// const athleteID = await mongodb.max(mongoCFG.Breaststroke.athletes, "athleteID");
	//--------------------------------------------
	// console.log("start timeID=", timeID, "athleteID=", athleteID);

  medalbank.times = await checkExistsTimes(medalbank.times, competitionID);
  console.log("af checkExistsTimes", times.length);
	//--------------------------------------------
	// 2. get max timeID, athleteID
	//--------------------------------------------
	// const athletes = mergeDAO.mergeTimes2Athletes(medalbank.times, athleteID);
	//--------------------------------------------
	// medalbank.athletes = [];
	// for (const athlete of athletes) {
	// 	athlete.competitionID = competition.competitionID;
	// 	medalbank.athletes.push(athlete);
	// }
	// fs.writeFileSync(`${Config.times_data_path}/json/${competitionID}-athletes.json`, JSON.stringify(athletes, null, '\t'))

	//--------------------------------------------
	// 2. get max timeID, athleteID
	//--------------------------------------------
	// medalbank.times = updateAthleteID2Times(medalbank.times, athletes);
	// console.log("222+++++", medalbank.times.slice(0, 5));
	//--------------------------------------------


	returnObj.data = medalbank.times.map(data => (Customizing.customizing(data)));

	// console.log("111+++++", returnObj.data.slice(0, 5));
	// returnObj.message = "teams:\n" + medalbank.teams.join('\n');
	console.log("~~~~~~~~~~~~~~~~~ message=", returnObj.message);
	console.log("~~~~~~~~~~~~~~~~~ data.length=", returnObj.data.length);


	const teams = [];
	for (const team of medalbank.teams) {
		teams.push(await teamModel.insert({ name: team }));
	}
	console.log("~~~~~~~~~~~~~~~~~ medalbank.teams=", teams.length);



	//----------------------------------------------
	//	update times import
	//-----------------------------------------
	if (returnObj.data.length > 0) {
		query = { competitionID: competition.competitionID };
		result = await mongodb.deleteMany(mongoCFG.Breaststroke.timesImport, query);
		result = await mongodb.insertMany(mongoCFG.Breaststroke.timesImport, returnObj.data);
    console.log("\n===============================\ncheck.times=", returnObj.data.length, "\n===============================\n");
	}
	//-----------------------------------------
	//----------------------------------------------
	//	update athletes import
	//-----------------------------------------
	// if (medalbank.athletes.length > 0) {
	// 	query = { competitionID: competition.competitionID };
	// 	result = await mongodb.deleteMany(mongoCFG.Breaststroke.athletesImport, query);
	// 	result = await mongodb.insertMany(mongoCFG.Breaststroke.athletesImport, medalbank.athletes);
	// }
	//-----------------------------------------

	//--------------------------------------------
	//	return first page (100 rows) + total count
	//--------------------------------------------
	const pageSize = Number(body.page_size) || 100;
	const page		 = Number(body.page) || 1;
	returnObj.count			= returnObj.data.length;
	returnObj.page			= page;
	returnObj.page_size	= pageSize;
	returnObj.data			= returnObj.data.slice((page - 1) * pageSize, page * pageSize);

	return returnObj;
}
//===================================================
async function checkTeamPool(times, competition) {
	const timeArr = [];
	const teamArr = [];
	const teamOrgArr = [];
	let timeID = 1;

  await memoryDB.loadTeams();
  await memoryDB.loadPools();

	for (const time of times) {
		// time.timeID = timeID++;

		// time.team = time.team ? time.team : "개인";
		const teamName = utilLibrary.normalizeString(time.team ? time.team.toUpperCase() : "개인"); // time.team.toUpperCase();
		const team = memoryDB.getTeamByName(teamName);
		if (team && team.length > 0) {
			time.teamID = team[0].teamID;
			time.teamName = team[0].name;
			// console.log(`timeID.${time.timeID}, name.${time.name}, team.${time.team}, teamID.${time.teamID}, `);
		} else {
			if (!teamArr.includes(teamName)) {
        teamArr.push(teamName);
        teamOrgArr.push(time.team);
      }
		}

		time.competitionID = competition.competitionID;
		// time.competitionName = competition.fullname;
		time.stemID = competition.stemID;
		time.sido = competition.sido;
		time.datetime = competition.dateStart ? competition.dateStart : "";

		// time.pool = competition.pool;
		time.poolID = competition.poolID;
		delete time.sheet;
		timeArr.push(time);
	}
	return { times: timeArr, teams: teamOrgArr };	
}

//--------------------------------------------
//	set athleteID to times
//--------------------------------------------
function updateAthleteID2Times(times, athletes) {	
	let tcount = 0;
	const timeArr = [];

	//---------------------------
	for (const time of times) {
		if (time.athleteID == 0) {
			const athlete = athletes.find(athlete => athlete.times.find(tm => tm.timeID==time.timeID));
			if (athlete) {
				time.athleteID = athlete.athleteID;
			}
		}
		timeArr.push(time);
	}

	//---------------------------
	const check = timeArr.find(el => el.athleteID == 0);
	console.log("tcount=", tcount, "check=", check);
// fs.writeFileSync("times.json", JSON.stringify(timeArr, null, '  '));
	return timeArr;
}

async function checkExistsTimes(times, competitionID) {
  const query = { competitionID: competitionID, fin: { $exists: false } }
	context = {
		query			: query,
		projection: { _id:0, timeID:1, name:1, athleteID:1, times:1, gender:1, discipline:1, distance:1, ageGroup:1, },
		limit			: 5000,
		skip			: 0,
		sort			: { timeID: 1 },
	}
	//----------------------------------------------
	//	find times
	//----------------------------------------------
	const resTimes = await mongodb.find(mongoCFG.Breaststroke.times, context);

	//----------------------------------------------
	//	check times athleteID
	//----------------------------------------------
	for (let no=0; no<times.length; no++) {
		const time = times[no];
		const importedTimes = resTimes.data.find(tm => tm.name==time.name && tm.gender==time.gender && tm.discipline==time.discipline && tm.distance==time.distance && tm.ageGroup==time.ageGroup );
		if (importedTimes) {
			//---------------------------------------------------------
			times[no].athleteID = importedTimes.athleteID || 0;
			times[no].note 			= `${importedTimes.name}-${importedTimes.athleteID}-${importedTimes.ageGroup}`;
		} else {
			times[no].athleteID = 0;
		}
	}

  return times;
}
