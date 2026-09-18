const fs          = require('fs');
const mskCFG 		  = require('../../Config/mskCFG');
const mongoCFG 		= require('../../Config/mongoCFG');
const mongoDB			= require('../../Class/MongoDB');
const utilLibrary = require("../../Class/utilLibrary");
const UtilDate    = require("../../Class/utilDate.js");

const utilDate	  = new UtilDate();
const mongodb 	  = new mongoDB(mongoCFG.Breaststroke.database);

// const { grouppingRanking } = require('../import/extraInfo/buildRankingsDAO');
const { grouppingRanking } = require('./importUTIL/buildImportDAO');
const { getCompetition } = require('../competitions/competitions.routes');
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
	const returnObj = { message: "", data: [], count: 0 };

	//-------------------------------------------------
	//	get competition
	//-------------------------------------------------
	// const competition = memoryDB.getCompetition(body.id);
	const res = await mongodb.findOne(mongoCFG.Breaststroke.competitions, { competitionID: Number(body.id) }, { _id:0 });
	const competition = res.data || {};
	//-------------------------------------------------
	// if (!competition.competitionID) competition.competitionID = Number(body.id);
	console.log("competition=", competition);

	//-------------------------------------------------
	//	pagination: 100 rows per page
	//-------------------------------------------------
	const pageSize	= Number(body.page_size) || 100;
	const page			= Number(body.page) || 1;

	//-------------------------------------------------
	//	fetch imported times from timesImport (paged)
	//-------------------------------------------------
	const context = {
		query			: { competitionID: Number(body.id) },
		projection: { _id:0, },
		skip			: (page - 1) * pageSize,
		limit			: pageSize,
		sort			: { seqno: 1 },
	}
	const result = await mongodb.find(mongoCFG.Breaststroke.timesImport, context);
	const timeArr = result.data;
	returnObj.count			= result.count;
	returnObj.page			= page;
	returnObj.page_size	= pageSize;
	//-------------------------------------------------
	if (timeArr.length == 0) {
		console.log("no data");
		return { message: " no data", data: [], count: result.count, page, page_size: pageSize };
	}

	timeArr[0].competitionName = competition.competitionName;
	returnObj.data = timeArr.reduce((arr, time) => {
		time.pool = time.pool || competition.pool || "";
		time.poolID = time.poolID || competition.poolID || 0;
		time.sido = time.sido || competition.sido || "";
		time.course = time.course || competition.course || "";
		arr.push(time); // utilImport.js
		return arr;
	}, []);

	console.log(`read cid=${body.id} page=${page}/${Math.ceil(result.count / pageSize)} count=${result.count} rows=${timeArr.length}`);

	return returnObj;
}

async function setTimesAthleteIDs(times, competition) {

	const context = {
		query			: { competitionID: competition.competitionID },
		projection: { _id:0, timeID:1, name:1, athleteID:1, time:1, gender:1, discipline:1, distance:1, ageGroup:1, },
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
		const importedTimes = resTimes.data.find(tm => tm.name==time.name && tm.gender==time.gender && tm.discipline==time.discipline && tm.distance==time.distance && tm.ageGroup==time.ageGroup );
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
	result = await mongodb.find(mongoCFG.Breaststroke.times, context);
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
