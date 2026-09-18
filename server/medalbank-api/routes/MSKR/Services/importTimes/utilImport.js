const mongoCFG 		= require('../../Config/mongoCFG');
const mongoDB			= require('../../Class/MongoDB');
const mongodb 	  = new mongoDB(mongoCFG.Medalbank.database);
const UtilDate    = require("../../Util/utilDate");
const utilDate		= new UtilDate();
const Customizing = require('../times/times.custom');

const timesBackup = "times_20230829";

//-------------------------------------------
//	rank: gender-style-distance
//-------------------------------------------
exports.assignRanksMedalbank = (timeArr) => {
  // First, let's sort the times array in ascending order of time
  timeArr = timeArr.sort((a, b) => a.timeStamp - b.timeStamp);

	const times = [], timesNull = [];
	for (const time of timeArr) {
		if (time.timeStamp) {
			times.push(time);
		} else {
			time.rank = 0;
			timesNull.push(time);
		}
	}

  // Initialize variables to keep track of rank and previous time
	if (times.length > 0) {
		let rank = 1; // Starting rank
		// 2. Assign ranks
		let before = times[0].timeStamp;
		for (let i = 0; i < times.length; i++) {
			if (i > 0 && times[i].timeStamp !== times[i - 1].timeStamp) {
				rank = i + 1;
			}
			// times[i].rank = rank;
			times[i].rankGroup = times[i].rank || 0;
			times[i].rank = rank;
			times[i].diffs = times[i].timeStamp == before ? "0.00" : utilDate.convertTimestamp2string(times[i].timeStamp - before);
		}		
	}

  return times.concat(timesNull);
}
exports.assignRanks = (timeArr) => {
  // First, let's sort the times array in ascending order of time
  timeArr = timeArr.sort((a, b) => a.time - b.time);

	const times = [], timesNull = [];
	for (const time of timeArr) {
		if (time.time) {
			times.push(time);
		} else {
			time.rank = 0;
			timesNull.push(time);
		}
	}

  // Initialize variables to keep track of rank and previous time
	if (times.length > 0) {
		let rank = 1; // Starting rank
		// 2. Assign ranks
		let before = times[0].time;
		for (let i = 0; i < times.length; i++) {
			if (i > 0 && times[i].time !== times[i - 1].time) {
				rank = i + 1;
			}
			// times[i].rank = rank;
			times[i].groupRank = times[i].rank
			times[i].rank = rank;
			times[i].diffs = times[i].time == before ? "0.00" : utilDate.convertTimestamp2string(times[i].time - before);
		}		
	}

  return times.concat(timesNull);
}
//====================================================
//	1. check 
//====================================================
exports.setTimesAthleteIDs = async (times, competition) => {

	const context = {
		query			: { competitionID: competition.competitionID },
		projection: { _id:0, timeID:1, name:1, athleteID:1, times:1, gender:1, style:1, distance:1, ageGroup:1, },
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



exports.setTimesAthleteIDsOLD = async (times, competition) => {

	const context = {
		query			: { competitionID: competition.competitionID },
		projection: { _id:0, timeID:1, name:1, athleteID:1, times:1, gender:1, style:1, distance:1, ageGroup:1, },
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
