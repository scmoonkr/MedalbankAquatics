const mongoCFG 		= require('../../Config/mongoCFG');
const mongoDB			= require('../../Class/MongoDB');
const mongodb 	  = new mongoDB(mongoCFG.Medalbank.database);
const UtilDate    = require("../../Class/utilDate");
const utilDate		= new UtilDate();
const Customizing = require('../times/times.custom');

const timesBackup = "times_20230829";

//-------------------------------------------
//	rank: gender-discipline-distance
//-------------------------------------------
exports.customTime = (time) => {
	
	if (time.masters) {
		console.log("time.masters=", time.masters);
		const masters = time.masters.toLowerCase();
		time.isMasters = true;
		if (masters == 'elite' || masters == 'n') time.isMasters = false;
		else if (masters == 'masters' || masters == 'y') time.isMasters = true;
		console.log("time.masters=", time.masters, time.isMasters);
	}
	
	if (time.adult) {
		const adult = time.adult.toLowerCase();
		time.isAdult = true;
		if (adult == 'adult' || adult == 'y') time.isAdult = true;
		else if (adult == 'junior' || adult == 'n') time.isAdult = false;
	}
	if (time.gender) {
		const gender = time.gender.toLowerCase();
		if (gender == 'men' || gender == '남' || gender == '남자') time.gender = 'men';
		if (gender == 'women' || gender == '여' || gender == '여자') time.gender = 'women';
	}
	if (time.discipline) {
		const discipline = time.discipline.toLowerCase();
		switch(discipline) {
			case 'fr': case '자유형': case '자유': case 'freestyle': time.discipline = 'FR'; break;
			case 'ba': case '배영': case 'backstroke': time.discipline = 'BA'; break;
			case 'br': case '평영': case 'breaststroke': time.discipline = 'BR'; break;
			case 'fl': case '접영': case 'butterfly': time.discipline = 'FL'; break;
			case 'im': case '혼영': case 'individual medley': time.discipline = 'IM'; break;
			case 'fr': case '계영': case '혼계영': case 'freestyle relay': time.discipline = 'FR'; break;
		}
	}
	if (time.distance) {
		const distance = time.distance.toUpperCase();
		if ("25M,50M,100M,200M,400M,800M,1500M".includes(distance)) time.distance = distance;
	}
	if (time.course) {
		const course = time.course.toUpperCase();
		if ("SCM,LCM".includes(course)) time.course = course;
	}
	if (time.heat) 			time.heat = time.heat;
	if (time.round) 		time.round = time.round;
	if (time.team) 			time.team = time.team;
	if (time.ageGroup)	time.ageGroup = time.ageGroup;
	if (time.school) 		time.school = time.school;
	if (time.datetime)	time.datetime = time.datetime;
	if (time.pool) 			time.pool = time.pool;
	if (time.sido) 			time.sido = time.sido;
	if (time.age) 			time.age = time.age;
	if (time.dob) 			time.dob = time.dob;

	return time;
}

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
		projection: { _id:0, timeID:1, name:1, athleteID:1, times:1, gender:1, discipline:1, distance:1, ageGroup:1, },
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



exports.setTimesAthleteIDsOLD = async (times, competition) => {

	const context = {
		query			: { competitionID: competition.competitionID },
		projection: { _id:0, timeID:1, name:1, athleteID:1, times:1, gender:1, discipline:1, distance:1, ageGroup:1, },
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
