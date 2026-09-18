const fs          = require('fs');
const multiSort   = require('multisort');
// const mskCFG 			= require('../config/mskCFG');
const mongoCFG 		= require('../../../Config/mongoCFG');
const mongoDB			= require('../../../Class/MongoDB');
const mongodb 	  = new mongoDB(mongoCFG.Medalbank.database);
const UtilDate    = require("../../../Class/utilDate");
const utilDate	  = new UtilDate();

const { Config }	= require('./config');
const Util 				= require('./util');
// const LoadCollections = require('./loadCollections');
//-------------------------------

//-------------------------------------------
//	rank: gender-style-distance
//-------------------------------------------
exports.assignRanks = (times, rankField="rank", diffField="diffs") => {
  // First, let's sort the times array in ascending order of time
  times.sort((a, b) => a.time - b.time);

  // Initialize variables to keep track of rank and previous time
  let rank = 1;
  let prevTime = times[0].time;

  // Loop through the times array and assign ranks
	let before = times[0].time;
  for (let i = 0; i < times.length; i++) {
    if (times[i].time !== prevTime) {
      rank = i + 1;
      prevTime = times[i].time;
    }
		if (times[i].times) {
			times[i][rankField] = rank;
			times[i][diffField] = times[i].time == before ? "0.00" : utilDate.convertTimestamp2string(times[i].time - before);
		}
		before = times[i].time;
		if (times[i].time > 99) {
			times[i].time = 0;
			times[i].time.rank = 0;
		}

		// times[i] = customizing(times[i]);
  }

  return times;
}
//-------------------------------------------
//	groupRank: competitionID-ageGroup-gender-style-distance
//-------------------------------------------
exports.setTimesAgeGroupRank = (timeArr, rankField="rank", diffField="diffs") => {

	// tims to timeOBJ['gender-style-distance']
	const timeOBJ = {};
	for (const time of timeArr) {
		const key = `${time.competitionID}-${time.adult?"masters":"junior"}-${time.individual?"individual":"team"}-${time.ageGroup}-${time.gender}-${time.style}-${time.distance}`;
		// const key = `${time.gender}-${time.style}-${time.distance}`;
		if (!timeOBJ[key]) timeOBJ[key] = [];
		timeOBJ[key].push(time);
	}
	// console.log(timeArr[0].competitionID);
	// console.log(competitionOBJ[timeArr[0].competitionID]);

	let times = [];
	// sort time
	Object.keys(timeOBJ).forEach(key => { // 'gender-style-distance'
		const rankings = this.assignRanks(timeOBJ[key], rankField, diffField);
		times = times.concat(rankings);
	})

	return times;
}

//-------------------------------------------
//	groupRank: competitionID-ageGroup-gender-style-distance
//-------------------------------------------
exports.setTimesStyleRank = (timeArr, rankField="rank", diffField="diffs") => {

	// tims to timeOBJ['gender-style-distance']
	const timeOBJ = {};
	for (const time of timeArr) {
		const key = `${time.competitionID}-${time.adult?"masters":"junior"}-${time.individual?"individual":"team"}-${time.gender}-${time.style}-${time.distance}`;
		// const key = `${time.gender}-${time.style}-${time.distance}`;
		if (!timeOBJ[key]) timeOBJ[key] = [];
		timeOBJ[key].push(time);
	}

	let times = [];
	// sort time
	Object.keys(timeOBJ).forEach(key => { // 'gender-style-distance'
		const rankings = this.assignRanks(timeOBJ[key], rankField, diffField);
		times = times.concat(rankings);
	})

	return times;
}

//===================================================
exports.makeExtraInfo = async (times, extraInfo) => {
	
	const minMaxDate			= Util.getMinMaxDate(times, 'datetime');
	extraInfo.latestDate	= minMaxDate.max;
	extraInfo.firstDate		= minMaxDate.min;

	const { PBs, personalBests, styles, majorStyle } = Util.buildPersonalBestsStylesInfo(times);
	extraInfo.PBs						= PBs;						// { gender, style, distance, distance, times: []  }
	extraInfo.personalBests	= personalBests;	// { gender, style, distance, "50M": {}, "100M": {} }
	extraInfo.styles				= styles;
	extraInfo.majorStyle		= majorStyle;

	const { competition, competitions } = await Util.buildCompetitionsInfo(times);
	extraInfo.competition		= competition;
	extraInfo.competitions	= competitions;

	//-----> teams
	extraInfo.teams = Util.buildTeamsInfo(times);

	//-----> athletes
	extraInfo.athletes = Util.buildAthletesInfo(times);
	extraInfo.athleteCount = extraInfo.athletes.length;
	extraInfo.timeCount = times.length;
	extraInfo.athletes = extraInfo.athletes.slice(0, 10);

	return extraInfo;
}


//===================================================
// 개인정보 활용 동의
//		athleteID
//			update times({ athleteID: athleteID }, { conscent: true } )
//			update rankings({ athleteID: athleteID }, { conscent: true } )
//===================================================
/*
날짜	고유번호(athleteID)	이름	경로	동의서확인	설명확인	희망고유번호
20230804	1696	문성중	카카오톡	O	O	1203
20230804	4941	문성태	카카오톡	O	O	
20230804	2337	권영주	카카오톡	O	O	
20230804	2336	고희경	카카오톡	O	O	
20230804	9615	이혜원	카카오톡	O	O	
20230804	10456	김선혁	카카오톡	O	O	
20230804	10938	주미애	카카오톡	O	O	
20230804	2349	박단비	카카오톡	O	O	
*/
exports.makeConscent = async (athleteID, set=true) => { 	// true: set, false: unset
	let athleteIDs = [];
	if (Array.isArray(athleteID)) {
		athleteIDs = athleteID.map(athlete => Number(athlete));
	} else {
		athleteIDs = athleteID.toString().split(',').map(athlete => Number(athlete));
	}

	const query = { athleteID: { $in: athleteIDs } };
	const value = set ? { $set: { conscent: true } } : { $unset: { conscent: true } };
	console.log(query, value);
	await mongodb.updateManyOP(mongoCFG.Medalbank.athletes, query, value);
	await mongodb.updateManyOP(mongoCFG.Medalbank.times, query, value);
	await mongodb.updateManyOP(mongoCFG.Medalbank.leaderboard, query, value);
	return athleteIDs;
}
//===================================================
exports.makeMajorStyle = (times) => {
	const timeOBJ = {};
	for (const time of times) {
		const key = `${time.style}-${time.distance}`;
		if (!timeOBJ[key]) timeOBJ[key] = [];
		timeOBJ[key].push({
			time			: time.time,
			times			: time.times,
			datetime	: time.datetime,
		});
	}

	const majorStyles = [];
	Object.keys(timeOBJ).forEach(key => {
		const arr = key.split('-');
		const timsSlice = timeOBJ[key].sort((a, b) => a.datetime - b.datetime).slice(0, Config.max_styles)
		majorStyles.push({ style: arr[0], distance: arr[1], times: timsSlice });
	})

	return majorStyles;
}

exports.grouppingRanking = (timeArr, competitionOBJ) => {

	//------------------------------------------------------------------
  // times = multiSort(times, ["competitionID", "category", "style", "ageGroup", "gender", "course", "distance", "time", ]);
	//------------------------------------------------------------------

	//---------------------------------------
	// tims to timeOBJ['gender-style-distance']
	//---------------------------------------
	let timeOBJ = {};
	for (const time of timeArr) {
		const key = `${time.gender}-${time.style}-${time.distance}`;
		if (!timeOBJ[key]) timeOBJ[key] = [];
		if (!timeOBJ[key].find(tm => tm.athleteID==time.athleteID)) timeOBJ[key].push(time);
		// if (!timeOBJ[key].find(tm => tm.norm==time.norm)) timeOBJ[key].push(time);
	}
	// console.log(timeArr[0].competitionID);
	// console.log(competitionOBJ[timeArr[0].competitionID]);

	let timesAll = [];
	// sort time
	Object.keys(timeOBJ).forEach(key => { // 'gender-style-distance'
		const rankings = this.assignRanks(timeOBJ[key], "rank", "diffs");

		timesAll = timesAll.concat(rankings);
	})
	return timesAll;
}

//==================================================
const _styles = [
	{ field: "free", style: "freestyle" },
	{ field: "back", style: "backstroke" },
	{ field: "breast", style: "breaststroke" },
	{ field: "fly", style: "butterfly" },
	{ field: "im", style: "individualMedley" },
	{ field: "freeRelay", style: "freestyleRelay" },
	{ field: "medleyRelay", style: "medleyRelay" },
];
const _distance = ["25", "50", "100", "200", "400", "800", "1500"];
exports.competitionStatics = (times, competition) => {
	const styles = {};
	const timeArr = times.filter(time => time.competitionID==competition.competitionID);
	const athleteOBJ = {};
	const value = { competitionID: competition.competitionID };
	for (const time of timeArr) {
		athleteOBJ[time.athleteID] = 1;
		if (!styles[time.style]) styles[time.style] = {};
		if (!styles[time.style][time.distance]) styles[time.style][time.distance] = true;
	}

	const styleDistances = {};
	_styles.forEach(style => {
		if (!styleDistances[style.style]) styleDistances[style.style] = [];
		_distance.forEach(distance => {
			const dist= styles[style.style] && styles[style.style][distance+"M"] ? true : false;
			styleDistances[style.style].push(dist);
		})
	})
	const stylesArr = [];
	Object.keys(styleDistances).forEach(style => {
		if (styleDistances[style].length > 0) flag = true;
		stylesArr.push({ style: style, distance: styleDistances[style] });
	})
	
	value.timeCount = timeArr.length;
	value.athleteCount = Object.keys(athleteOBJ).length;
	if (value.timeCount > 0) value.upload = true;
	value.styleDistances = stylesArr;

	return value;
}

exports.poolStatics = async (times, competition) => {
	const pool = { poolID: competition.poolID };
	const query = { poolID: competition.poolID };

	const timeArr = await mongodb.distinct(mongoCFG.Medalbank.times, "competitionID", query);
	pool.uploadTimes = timeArr.data.length;

	const competitions = await mongodb.distinct(mongoCFG.Medalbank.competitions, "competitionID", query);
	pool.competitionCount = competitions.data.length;
	
	return pool;
}

const POINT_1 = 10, POINT_2 = 7, POINT_3 = 4, POINT_4 = 2;
exports.teamStatics = (times) => {
	
	const teamOBJ = {};
	const athleteOBJ = {};
	for (const time of times) {
		if (!teamOBJ[time.teamID]) teamOBJ[time.teamID] = {
			teamID: time.teamID,
			name: time.team,
			members: 0,
			timecount: 0,
			rank: [ 0, 0, 0 ],
			rankRatios: [ 0, 0, 0 ],
			style: { freestyle: 0, backstroke: 0, butterfly: 0, breaststroke: 0, individualMedley:0, freestyleRelay:0, medleyRelay:0 },
			ratios: { freestyle: 0, backstroke: 0, butterfly: 0, breaststroke: 0, individualMedley:0, freestyleRelay:0, medleyRelay:0 },
			medals: 0,
			points: 0,
			athleteOBJ: {},
		}
		teamOBJ[time.teamID].timecount++;
		if (time.rank >= 1 && time.rank <= 3) {
			teamOBJ[time.teamID].rank[time.rank-1]++;
			teamOBJ[time.teamID].medals++;
		}
		teamOBJ[time.teamID].style[time.style]++;

		if (!teamOBJ[time.teamID].athleteOBJ[time.athleteID]) teamOBJ[time.teamID].athleteOBJ[time.athleteID] = 0;
	}

	const teamArr = [];
	for (const team of Object.values(teamOBJ)) {
		team.members = Object.keys(team.athleteOBJ).length;
		delete team.athleteOBJ;

		for (let no=0; no<3; no++) {
			if (team.members > 0) {
				team.rankRatios[no] = parseInt(team.rank[no] / team.timecount * 10000) / 100;
			}
		}

		Object.keys(team.style).forEach(key => {
			if (team.members > 0) {
				team.ratios[key] = parseInt(team.style[key] / team.timecount * 100);
			}
		})

		team.points = team.rank[0] * POINT_1 + 
									team.rank[1] * POINT_2 + 
									team.rank[2] * POINT_3 + 
									team.members * POINT_4 ;
		teamArr.push(team);
	}
	return teamArr;
}

//=============================================
exports.setTeamID2Times = async (teams, teamName) => {
	for (const team of teams) {
		// team.name = [ team.name, ...team.names ];
		const query = { names: team.name };
		const value = { teamID: team.teamID };
		const res = await mongodb.updateMany(mongoCFG.Medalbank.times, query, value);
		console.log(query, value, res);
		// break;
	}
}
//=============================================
exports.findTeam = (teams, teamName) => {
	const includeNames = teams.find(el => el.names.includes(teamName));
	return ! includeNames;
}
//=============================================
exports.checkTeams = (teamJSON) => {
	const teams = [];
	for (let no=0; no<teamJSON.length; no++) {
		const team = teamJSON[no];
		team.name = (team.name||"").replace(/ /gi, '').toUpperCase();
		const names = [team.name];
		team.names.push(team.nameKor);
		team.names.push((team.nameEng||"").replace(/ /gi, '').toUpperCase());
		team.names.forEach(name => {
			name = (name||"").replace(/ /gi, '').toUpperCase();
			if (name && !names.includes(name)) names.push(name);
		})
		team.names = names;
		team.namesCust = team.names.map(el => el.replace(/ /gi, '').toUpperCase());
		// const check = teamJSON.find(team => team.names)
		teams.push(team);
	}


	const teamArr = [];
	for (const team of teams) {
		if(team.name == "CK")
			console.log(team);
		let includeNames = teamArr.find(el => el.namesCust.includes(team.name));
		// const check = teams.find(el => el.name == team.name);
		if (!includeNames) {
			// console.log(team, "inserted");
			teamArr.push(team);
			team.namesStr = team.names.join(',');
		}
	}

	return teamArr;
}
