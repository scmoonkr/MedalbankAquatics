const fs          = require('fs');
const mskCFG 		  = require('../../Config/mskCFG');
const mongoCFG 		= require('../../Config/mongoCFG');
const mongoDB			= require('../../Class/MongoDB');
const utilLibrary = require("../../Util/utilLibrary");
const UtilDate    = require("../../Util/utilDate");

const utilDate	  = new UtilDate();
const mongodb 	  = new mongoDB(mongoCFG.Medalbank.database);

// const { grouppingRanking } = require('../import/extraInfo/buildRankingsDAO');
const { grouppingRanking } = require('./importUTIL/buildImportDAO');
const { getCompetition } = require('../competitions/competitions.routes');
const excelDAO		= require("./importUTIL/excelDAO");
const { Config }  = require('./importUTIL/config');
const Customizing = require('../times/times.custom');

const MemoryDB 		= require('../../Class/MemoryDB');
const memoryDB		= new MemoryDB();


/*********************************************************************
 * 
 *	read times excel
 *
 *********************************************************************/
exports.read = async (body) => {
	
	console.log(`database.importTime.read.body=`, body);
	const returnObj = { message: "", data: [] };

	//-------------------------------------------------
	//	get competition
	//-------------------------------------------------
	const competition = memoryDB.getCompetition(body.id);
	//-------------------------------------------------
	if (!competition.competitionID) competition.competitionID = Number(body.id);
	console.log("competition=", competition);

	//-------------------------------------------------
	//	read times.xlsx from media server
	//-------------------------------------------------
	const times = await readTimesExcelFromServer(body, competition);
	//-------------------------------------------------
	if (times.length ==0) {
		console.log("no data");
		return { message: " no data", data: [], };
	}

	//-------------------------------------------------
	//	set athleteID from times backup's athleteID
	//-------------------------------------------------
	//-------------------------------------------------
  const timeArr = [];
  for (let seqno = 0; seqno < times.length; seqno++) {
		// console.log(JSON.stringify(times[seqno]));
    times[seqno].seqno = seqno;
    // times[seqno].timeStamp = times[seqno].time;
    // times[seqno].time = times[seqno].times;
		// delete times[seqno].times;
    timeArr.push(times[seqno]);
  }
	//-------------------------------------------------
	//	update times import
	//-------------------------------------------------
	if (timeArr.length > 0) {
		query = { competitionID: competition.competitionID };
		await mongodb.deleteMany(mongoCFG.Medalbank.timesImport, query);
		await mongodb.insertMany(mongoCFG.Medalbank.timesImport, timeArr);
    console.log("\n===============================\nread.times=", timeArr.length, "\n===============================\n");
	}
	//-------------------------------------------------


	timeArr[0].competitionName = competition.competitionName;
	returnObj.data = timeArr;
	returnObj.message = excelDAO.checkDuplicate(timeArr);

	// console.log("=============================");
	console.log(timeArr.length, returnObj.message);
	// console.log("=============================");

	return returnObj;
}

//====================================================
//	
//====================================================
async function readTimesExcelFromServer(body, competition) {
	const query = {
		category	: body.category,
		type			: body.type,
		id				: body.id.toString()
	}
	console.log("readTimesExcelFromServer.query=", query);
	//----------------------------------------------
	//	find mediaServer
	//----------------------------------------------
	result = await mongodb.findOne(mongoCFG.Medalbank.mediaServer, query);
	console.log("mongoCFG.Medalbank.mediaServer=", result.data);
	const timesExcel = result.data;
	const filename = `${global.uploadPath||'/backup/imageMedalBank'}${timesExcel.path}`;
	console.log("mediaServer.filename=", filename);

	//----------------------------------------------
	//	read times excel file
	//----------------------------------------------
	const times = await excelDAO.readTimesFromExcelORG(competition, filename, `${timesExcel.id}.${timesExcel.ext}`);
console.log("times=", times.length);
	return times;
}

async function setTimesAthleteIDs(times, competition) {

	const context = {
		query			: { competitionID: competition.competitionID },
		projection: { _id:0, timeID:1, name:1, athleteID:1, time:1, gender:1, style:1, distance:1, ageGroup:1, },
		limit			: 5000,
		skip			: 0,
		sort			: { timeID: 1 },
	}
	//----------------------------------------------
	//	find timesImport
	//----------------------------------------------
	const resTimes = await mongodb.find(timesBackup, context);
	console.log("++++++++++++++++++++", resTimes.data.slice(0, 10));

	const timeArr = times.reduce((arr, time, index) => {
		time = Customizing.customizing(time);	
		time.seqno = index + 1;
		//----->
		const importedTimes = resTimes.data.find(tm => tm.name==time.name && tm.gender==time.gender && tm.style==time.style && tm.distance==time.distance && tm.ageGroup==time.ageGroup );
		if (importedTimes) {
			//---------------------------------------------------------
			time.athleteID	= importedTimes.athleteID;
			time.note 			= `${importedTimes.name}-${importedTimes.athleteID}-${importedTimes.ageGroup}`;
		} else {
			time.athleteID	= 0;
		}

		arr.push(time);
		return arr;
	}, []);

	return timeArr;
}



exports.readImportedTimes = async (body) => {
	const returnObj = { message: "", data: {} };

	console.log(`database.readImportedTimes.check.body=`, body);

	//----------------------------------------------
	//	find timesImport
	//----------------------------------------------
	const context = {
		query			: { competitionID: Number(body.competitionID), fin: { $exists: false } },
		projection: { _id:0, },
		limit			: 5000,
		skip			: 0,
	}
	result = await mongodb.find(mongoCFG.Medalbank.times, context);
	if (result.data.length == 0) {
		console.log("get timesImport....");
		return returnObj;
	}
	returnObj.data = result.data.reduce((arr, time) => {
		time.norm = utilLibrary.normalizeMSKR(time.name);
		time.teamORG = time.teamName;
		arr.push(Customizing.customizing(time));
		return arr;
	}, [])

	return returnObj;
}
