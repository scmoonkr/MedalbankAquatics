
const mskCFG 		  = require('../../../Config/mskCFG');
const mongoCFG 		= require('../../../Config/mongoCFG');
const mongoDB			= require('../../../Class/MongoDB');
const mongodb 	  = new mongoDB(mongoCFG.Medalbank.database);


//==================================================
//==================================================
exports.competitionStatics = async (times, bestTimes, competitionID) => {
	const value = { bestTimes: bestTimes, };

	const styles = {};
	const athleteOBJ = {};
	for (const time of times) {
		if (!styles[time.style]) styles[time.style] = {};
		if (!styles[time.style][time.distance]) styles[time.style][time.distance] = true;

		if (!athleteOBJ[time.athleteID]) athleteOBJ[time.athleteID] = [];
		athleteOBJ[time.athleteID].push(time);
	}

	//-----> 대회별 gender-style-distance별 경기가 있었는지
	const styleDistances = {};
	mskCFG.stylesEngKor.forEach(style => {	// { eng: "freestyle", 				kor: "자유형" },
		if (!styleDistances[style.eng]) styleDistances[style.eng] = [];
		mskCFG.distances.forEach(distance => {
			const dist= styles[style.eng] && styles[style.eng][distance] ? true : false;
			styleDistances[style.eng].push(dist);
		})
	})
	const stylesArr = [];
	Object.keys(styleDistances).forEach(style => {
		if (styleDistances[style].length > 0) flag = true;
		stylesArr.push({ style: style, distance: styleDistances[style] });
	})
	
	value.timeCount = times.length;
	value.athleteCount = Object.keys(athleteOBJ).length;
	if (value.timeCount > 0) value.upload = true;
	value.styleDistances = stylesArr;

	const query = { competitionID: Number(competitionID) };		
	await mongodb.updateOne(mongoCFG.Medalbank.competitions, query, value);
	console.log(query, value);
	process.exit();

	return value;
}

//==================================================
//==================================================
exports.stemsStatics = async (times) => {

	const stemOBJ = {};
	//--------------------------------------------
	//	stems
	//--------------------------------------------
	for (const time of times) {
		const key = `${time.gender}-${time.style}-${time.distance}`
		const value = {
			timeID				: time.timeID,
			name					: time.name,
			nameHide			: time.nameHide,
			times					: time.times,
			time					: time.time,
			gender				: time.gender,
			style					: time.style,
			distance			: time.distance,
			// stemID				: time.stemID,
			teamID				: time.teamID,
			athleteID			: time.athleteID,
			competitionID	: time.competitionID,
			datetime			: time.datetime,
		}

		// stem best
		if (!stemOBJ[time.stemID]) stemOBJ[time.stemID] = { competitionCount: {}, }
		stemOBJ[time.stemID].competitionCount[time.competitionID] = 1;
		if (!stemOBJ[time.stemID][key]) stemOBJ[time.stemID][key] = { gender: time.gender, style: time.style, distance: time.distance,athlete: {}, times: [] };
		stemOBJ[time.stemID][key].athlete[time.athleteID] = 1;
		stemOBJ[time.stemID][key].times.push(value)
	}

	//--------------------------------------------
	Object.keys(stemOBJ).forEach(stemID => {
		const competitionCount = Object.keys(stemOBJ[stemID].competitionCount).length;
		stemOBJ[stemID].timeCount = 0;
		stemOBJ[stemID].athleteCount = 0;
		delete stemOBJ[stemID].competitionCount;
		Object.keys(stemOBJ[stemID]).forEach(key => {
			const best = {
				gender: stemOBJ[stemID][key].gender,
				style: stemOBJ[stemID][key].style,
				distance: stemOBJ[stemID][key].distance,
			};
			best.times = stemOBJ[stemID][key].times.sort((a,b) => a.time - b.time);
			best.athleteCount = Object.keys(stemOBJ[stemID][key].athlete).length;
			best.timeCount = stemOBJ[stemID][key].times.length;
			const times = [];
			for (let no=0; no<3 && no<best.times.length; no++) {
				const value = {
					timeID				: best.times[no].timeID,
					name					: best.times[no].name,
					nameHide			: best.times[no].nameHide,
					rank					: no+1,
					times					: best.times[no].times,
					teamID				: best.times[no].teamID,
					athleteID			: best.times[no].athleteID,
					competitionID	: best.times[no].competitionID,
					datetime			: best.times[no].datetime,
				}
				
				times.push(value);
			}
			best.times = times
			stemOBJ[stemID].timeCount += best.timeCount;
			stemOBJ[stemID].athleteCount += best.athleteCount;
			stemOBJ[stemID].competitionCount = competitionCount;
			stemOBJ[stemID][key] = best;
		})	
	})

	//--------------------------------------------
	//--------------------------------------------
	//--------------------------------------------
	for (const stemID of Object.keys(stemOBJ)) {
		const stem = stemOBJ[stemID];
		const query = { stemID: Number(stemID) }
		const value = {
			timeCount				: stemOBJ[stemID].timeCount,
			athleteCount		: stemOBJ[stemID].athleteCount,
			competitionCount: stemOBJ[stemID].competitionCount,
			bestTimes				: Object.values(stem)
		}
		// for (const best of value.bestTimes) {
		// 	value.timeCount += best.timeCount;
		// 	value.athleteCount += best.athleteCount;
		// }
		await mongodb.updateOne(mongoCFG.Medalbank.stems, query, value);
		console.log(query, "timeCount=", value.timeCount, "athleteCount=", value.athleteCount);
	}
}

//==================================================
//==================================================
exports.competitionStaticsAll = async (times) => {
	const competitionTimes = {};
	const competitionOBJ = {};
	const stemOBJ = {};
	//--------------------------------------------
	//	competitions
	//--------------------------------------------
	for (const time of times) {
		if (!competitionTimes[time.competitionID]) competitionTimes[time.competitionID] = [];
		competitionTimes[time.competitionID].push(time);

		const key = `${time.gender}-${time.style}-${time.distance}`
		const value = {
			timeID				: time.timeID,
			name					: time.name,
			times					: time.times,
			time					: time.time,
			gender				: time.gender,
			style					: time.style,
			distance			: time.distance,
			stemID				: time.stemID,
			competitionID	: time.competitionID,
			datetime			: time.datetime,
		}

		// competitionID-gender-style-distance best
		if (!competitionOBJ[time.competitionID]) competitionOBJ[time.competitionID] = {}
		if (!competitionOBJ[time.competitionID][key]) competitionOBJ[time.competitionID][key] = { gender: time.gender, style: time.style, distance: time.distance,athlete: {}, times: [] };
		competitionOBJ[time.competitionID][key].athlete[time.athleteID] = 1;
		competitionOBJ[time.competitionID][key].times.push(value)

		// stem best
		if (!stemOBJ[time.stemID]) stemOBJ[time.stemID] = {}
		if (!stemOBJ[time.stemID][key]) stemOBJ[time.stemID][key] = { gender: time.gender, style: time.style, distance: time.distance,athlete: {}, times: [] };
		stemOBJ[time.stemID][key].athlete[time.athleteID] = 1;
		stemOBJ[time.stemID][key].times.push(value)
	}

	//--------------------------------------------
	//--------------------------------------------
	Object.keys(competitionOBJ).forEach(competitionID => {
		Object.keys(competitionOBJ[competitionID]).forEach(key => {
			const best = { gender: competitionOBJ[competitionID][key].gender, style: competitionOBJ[competitionID][key].style, distance: competitionOBJ[competitionID][key].distance,};
			best.times = competitionOBJ[competitionID][key].times.sort((a,b) => a.time - b.time);
			best.athleteCount = Object.keys(competitionOBJ[competitionID][key].athlete).length;
			best.timeCount = competitionOBJ[competitionID][key].times.length;
			best.times = best.times.slice(0, 3)
			competitionOBJ[competitionID][key] = best;
		})	
	})
	//--------------------------------------------
	Object.keys(stemOBJ).forEach(stemID => {
		Object.keys(stemOBJ[stemID]).forEach(key => {
			const best = { gender: stemOBJ[stemID][key].gender, style: stemOBJ[stemID][key].style, distance: stemOBJ[stemID][key].distance,};
			best.times = stemOBJ[stemID][key].times.sort((a,b) => a.time - b.time);
			best.athleteCount = Object.keys(stemOBJ[stemID][key].athlete).length;
			best.timeCount = stemOBJ[stemID][key].times.length;
			best.times = best.times.slice(0, 3)
			stemOBJ[stemID][key] = best;
		})	
	})

	for (const stemID of Object.keys(stemOBJ)) {
		const stem = stemOBJ[stemID];
		const query = { stemID: Number(stemID) }
		const value = { timeCount:0, athleteCount:0, bestTimes: Object.values(stem) }
		for (const best of value.bestTimes) {
			value.timeCount += best.timeCount;
			value.athleteCount += best.athleteCount;
		}
		await mongodb.updateOne(mongoCFG.Medalbank.stems, query, value);
		console.log(query, value.timeCount, value.athleteCount);
	}
	//--------------------------------------------
		const bestTimes = [];
		for (const competitionID of Object.keys(competitionOBJ)) {
	// Object.keys(competitionOBJ).forEach(async (competitionID) => {
		Object.keys(competitionOBJ[competitionID]).forEach(key => {
			const best = competitionOBJ[competitionID][key];
			let rank = 1;
			const times = [];
			for (const time of best.times) {
				const value = {
					timeID 				: time.timeID,
					name 					: time.name,
					times 				: time.times,
					competitionID : time.competitionID,
					datetime			: time.datetime,
					rank 					: rank++
				}
				times.push(value);
			}
			if (stemOBJ[competitionOBJ[competitionID][key].times[0].stemID][key]) {
				const json = JSON.parse(JSON.stringify(stemOBJ[competitionOBJ[competitionID][key].times[0].stemID][key]))
				json.times[0].rank = 0;
				best.times.push(json.times[0]);
				const value = {
					timeID 				: json.times[0].timeID,
					name 					: json.times[0].name,
					times 				: json.times[0].times,
					competitionID : json.times[0].competitionID,
					datetime			: json.times[0].datetime,
					rank 					: 0
				}
				times.push(value);
			}
			best.times = times;
			bestTimes.push(best);
		})	

		const competition = await this.competitionStatics(competitionTimes[competitionID], bestTimes, competitionID);
	}
	//--------------------------------------------
}
exports.competitionStaticsAllOld = async (times) => {
	const competitionTimes = {};
	const competitionOBJ = {};
	const stemOBJ = {};
	//--------------------------------------------
	//	competitions
	//--------------------------------------------
	for (const time of times) {
		if (!competitionTimes[time.competitionID]) competitionTimes[time.competitionID] = [];
		competitionTimes[time.competitionID].push(time);

		const key = `${time.gender}-${time.style}-${time.distance}`
		const value = {
			timeID				: time.timeID,
			name					: time.name,
			times					: time.times,
			time					: time.time,
			style					: time.style,
			distance			: time.distance,
			stemID				: time.stemID,
			competitionID	: time.competitionID,
			datetime			: time.datetime,
		}

		// competitionID-gender-style-distance best
		if (!competitionOBJ[time.competitionID]) competitionOBJ[time.competitionID] = {}
		if (!competitionOBJ[time.competitionID][key]) competitionOBJ[time.competitionID][key] = [];
		competitionOBJ[time.competitionID][key].push(value)

		// stem best
		if (!stemOBJ[time.stemID]) stemOBJ[time.stemID] = {}
		if (!stemOBJ[time.stemID][key]) stemOBJ[time.stemID][key] = [];
		stemOBJ[time.stemID][key].push(value)
	}

	//--------------------------------------------
	//--------------------------------------------
	Object.keys(competitionOBJ).forEach(competitionID => {
		Object.keys(competitionOBJ[competitionID]).forEach(key => {
			const best = competitionOBJ[competitionID][key].sort((a,b) => a.time - b.time);
			competitionOBJ[competitionID][key] = best.slice(0, 3);
		})	
	})
	//--------------------------------------------
	Object.keys(stemOBJ).forEach(stemID => {
		Object.keys(stemOBJ[stemID]).forEach(key => {
			const best = stemOBJ[stemID][key].sort((a,b) => a.time - b.time);
			stemOBJ[stemID][key] = best[0];
		})	
	})

	//--------------------------------------------
		const bestTimes = {};
		for (const competitionID of Object.keys(competitionOBJ)) {
	// Object.keys(competitionOBJ).forEach(async (competitionID) => {
		if (!bestTimes[competitionID]) bestTimes[competitionID] = [];
		Object.keys(competitionOBJ[competitionID]).forEach(key => {
			const arr = key.split('-');
			const best = { gender: arr[0], style: arr[1], distance: arr[2], times: [], };
			let rank = 1;
			for (const time of competitionOBJ[competitionID][key]) {
				time.rank = rank++;
				best.times.push(time);
			}
			if (stemOBJ[competitionOBJ[competitionID][key][0].stemID][key]) {
				const json = JSON.parse(JSON.stringify(stemOBJ[competitionOBJ[competitionID][key][0].stemID][key]))
				json.rank = 0;
				best.times.push(json);
			}
			bestTimes[competitionID].push(best);
		})	

		const competition = await this.competitionStatics(competitionTimes[competitionID], bestTimes[competitionID], competitionID);
	}
	//--------------------------------------------
}

const POINT_1 = 10, POINT_2 = 7, POINT_3 = 4, POINT_4 = 2;
//==================================================
//==================================================
exports.teamStatics = async (times) => {
	
	const teamOBJ = {};
	//---------------------------------------
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
	//---------------------------------------

	const teamArr = [];
	//---------------------------------------
	for (const teamID of Object.values(teamOBJ)) {
		teamOBJ[teamID].members = Object.keys(teamOBJ[teamID].athleteOBJ).length;
		delete teamOBJ[teamID].athleteOBJ;

		for (let no=0; no<3; no++) {
			if (teamOBJ[teamID].members > 0) {
				teamOBJ[teamID].rankRatios[no] = parseInt(teamOBJ[teamID].rank[no] / teamOBJ[teamID].timecount * 10000) / 100;
			}
		}

		Object.keys(teamOBJ[teamID].style).forEach(key => {
			if (teamOBJ[teamID].members > 0) {
				teamOBJ[teamID].ratios[key] = parseInt(teamOBJ[teamID].style[key] / teamOBJ[teamID].timecount * 100);
			}
		})

		teamOBJ[teamID].points =	teamOBJ[teamID].rank[0] * POINT_1 + 
															teamOBJ[teamID].rank[1] * POINT_2 + 
															teamOBJ[teamID].rank[2] * POINT_3 + 
															teamOBJ[teamID].members * POINT_4 ;

		const query = { teamID: teamID };		
		// await mongodb.updateOne(mongoCFG.Medalbank.teams, query, teamOBJ[teamID]);
		teamArr.push(teamOBJ[teamID]);
	}
	//---------------------------------------

	return teamArr;
}

//==================================================
//==================================================
exports.poolStatics = async (times, poolID) => {
	const pool = { poolID: poolID };

	const competitionOBJ = {};
	const athleteOBJ = {};
	//--------------------------------------------
	for (const time of times) {
		athleteOBJ[time.athleteID] = 1;
		competitionOBJ[time.competitionID] = 1;
	}

	const value = {};
	value.uploadTimes = times.length;
	value.athleteCount = Object.keys(athleteOBJ).length;
	value.competitionCount = Object.keys(competitionOBJ).length;
	
	const query = { poolID: poolID };	
	// await mongodb.updateOne(mongoCFG.Medalbank.pools, query, value);
	
	return value;
}

//==================================================
//==================================================
exports.poolStaticsAll = async (timeArr) => {
	//--------------------------------------------
	//	pools
	//--------------------------------------------
	const poolTimes = {};
	//--------------------------------------------
	for (const time of timeArr) {
		if (!poolTimes[time.poolID]) poolTimes[time.poolID] = [];
		poolTimes[time.poolID].push(time);
	}
	
	//--------------------------------------------
	poolTimes.forEach(async (poolID) => {
		const pool = await this.poolStatics(poolTimes[poolID], poolID);
	})	
	//--------------------------------------------
}


//==================================================
//==================================================
exports.athleteStatics = async (times, athleteID) => {
	const athlete = { athleteID: athleteID };

	const competitionOBJ = {};
	const athleteOBJ = {};
	//--------------------------------------------
	for (const time of times) {
		athleteOBJ[time.athleteID] = 1;
		competitionOBJ[time.competitionID] = 1;
	}

	const value = {};
	value.uploadTimes = times.length;
	value.athleteCount = Object.keys(athleteOBJ).length;
	value.competitionCount = Object.keys(competitionOBJ).length;
	
	const query = { athleteID: athleteID };	
	// await mongodb.updateOne(mongoCFG.Medalbank.athletes, query, value);
	
	return value;
}

//==================================================
//==================================================
exports.athleteStaticsAll = async (timeArr) => {
	//--------------------------------------------
	//	athletes
	//--------------------------------------------
	const athleteTimes = {};
	const stemOBJ = {};
	//--------------------------------------------
	for (const time of timeArr) {
		if (!athleteTimes[time.athleteID]) athleteTimes[time.athleteID] = [];
		athleteTimes[time.athleteID].push(time);
		// stem best
		if (!stemOBJ[time.stemID]) stemOBJ[time.stemID] = {}
		const key = `${time.gender}-${time.style}-${time.distance}`
		if (!stemOBJ[time.stemID][key]) stemOBJ[time.stemID][key] = {}
		stemOBJ[time.stemID][key] = {
			timeID				: time.timeID,
			times					: time.times,
			time					: time.time,
			style					: time.style,
			distance			: time.distance,
			competitionID	: time.competitionID,
			datetime			: time.datetime,
		}
	}
	
	//--------------------------------------------
	athleteTimes.forEach(async (athleteID) => {
		const athlete = await this.athleteStatics(athleteTimes[athleteID], athleteID);
	})	
	//--------------------------------------------
}


//=======================================================
//=======================================================
exports.loadCompetitions = async () => {
	const context = {
		// query: { competitionID: { $in: uploadedCompetitions } },
		projection: {_id:0, competitionID:1, fullname:1, order:1, sido:1, stem:1, stemID:1, poolID:1, pool:1, year:1, dateStart:1, },
		limit: 100000,
		skip: 0,
		sort: { competitionID:1 },
	}
	result = await mongodb.find(mongoCFG.Medalbank.competitions, context);
	// 1. competitions - competitionOBJ
	const competitionOBJ = {};
	for (const competition of result.data) {
		competition.dateStart =competition.dateStart ? new Date(competition.dateStart).toISOString().slice(0, 10) : "";
		competitionOBJ[competition.competitionID] = competition;
	}
	return competitionOBJ;
}
//=======================================================
//=======================================================
exports.loadStems = async () => {
	const context = {
		// query: { stemID: { $in: uploadedCompetitions } },
		projection: {_id:0, },
		limit: 100000,
		skip: 0,
		sort: { stemID:1 },
	}
	const result = await mongodb.find(mongoCFG.Medalbank.stems, context);
	// 1. stems - stemOBJ
	const stemOBJ = {};
	for (const stem of result.data) {
		delete stem.stem;
		stemOBJ[stem.stemID] = stem;
	}
	return stemOBJ;
}
//=======================================================
//=======================================================
exports.loadTeams = async () => {
	const context = {
		// query: { teamID: { $in: uploadedCompetitions } },
		projection: {_id:0, },
		limit: 100000,
		skip: 0,
		sort: { teamID:1 },
	}
	const result = await mongodb.find(mongoCFG.Medalbank.teams, context);
	// 1. teams - teamOBJ
	const teamOBJ = {};
	for (const team of result.data) {
		teamOBJ[team.teamID] = team;
	}
	return teamOBJ;
}
//=======================================================
//=======================================================
exports.loadPools = async () => {
	const context = {
		// query: { poolID: { $in: uploadedCompetitions } },
		projection: {_id:0, },
		limit: 100000,
		skip: 0,
		sort: { poolID:1 },
	}
	const result = await mongodb.find(mongoCFG.Medalbank.pools, context);
	// 1. pools - poolOBJ
	const poolOBJ = {};
	for (const pool of result.data) {
		poolOBJ[pool.poolID] = pool;
	}
	return poolOBJ;
}
//=======================================================
//=======================================================
exports.loadTimes = async () => {
	context = {
		query: {
			// competitionID: { $in: uploadedCompetitions },
			masters		: true,
			adult			: true,
			individual: true,
			athleteID	:{ $exists: true },
			poolID		:{ $exists: true },
			teamID		:{ $exists: true },
			$or: [ {status: ""}, { status: { $exists: false }} ],
			time			: { $gt: 0 }, fin: { $exists: false }
		},
		projection: {
			_id:0, timeID:1, masters:1, adult:1, individual:1, athleteID:1, ageGroup:1,
			gender:1, style:1, distance:1, name:1, nameHide:1, time:1, times:1,
			team:1, teamID:1, competitionID:1, competitionName:1, pool:1, poolID:1, datetime:1,
		},		
		limit: 500000,
		skip: 0,
		sort: { gender:1, style:1, distance:1, time:1 },
	}		
	result = await mongodb.find(mongoCFG.Medalbank.times, context);
	return result.data;
}
