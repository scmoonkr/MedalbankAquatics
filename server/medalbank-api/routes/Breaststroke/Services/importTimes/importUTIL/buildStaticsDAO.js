const extend 			= require('node.extend');
const mskCFG 		  = require('../../../Config/mskCFG');
const mongoCFG 		= require('../../../Config/mongoCFG');
const mongoDB			= require('../../../Class/MongoDB');
const mongodb 	  = new mongoDB(mongoCFG.Medalbank.database);
const MemoryDB 		= require('../../../Class/MemoryDB');
const memoryDB		= new MemoryDB();

const buildImportDAO		= require('./buildImportDAO');
const { Config }				= require('../importUTIL/config');

const Util 				= require('./util');
//==================================================
//==================================================

function custTimeMin(time) {
	return {
		timeID				: time.timeID || 0,
		name					: time.name || "",
		nameHide			: time.nameHide || "",
		times					: time.times || "",
		rank					: time.rank || 0,
		athleteID			: time.athleteID || 0,
		datetime			: time.datetime || "",
	}
}
function custTime(time) {
	return {
		timeID				: time.timeID || 0,
		name					: time.name || "",
		nameHide			: time.nameHide || "",
		times					: time.times || "",
		rank					: time.rank || 0,
		time					: time.time || 0, // time.time == 0 ? 999 : time.time,
		athleteID			: time.athleteID || 0,
		datetime			: time.datetime || "",
	}
}
function custTimeMax(time) {
	return {
		timeID				: time.timeID,
		name					: time.name,
		nameHide			: time.nameHide,
		times					: time.times,
		time					: time.time == undefined || time.time == 0 ? 999 : time.time,
		rank					: time.rank,
		gender				: time.gender,
		style					: time.style,
		distance			: time.distance,
		teamID				: time.teamID,
		athleteID			: time.athleteID,
		datetime			: time.datetime,
	}
}
//==================================================
//==================================================
// competitionCount, timeCount, 
// majorTimes(style,distance,times), 
// latestTimes(competitionName,style,distance,times,rank,medals),
// mdal(gold,silver,bronze)
// teams

exports.athleteStatics = (athleteTimes, athleteID) => {
	// ------------------------------------------------------
	// groupping [gender-style-distance]
	// ------------------------------------------------------
	const compTimesOBJ = athleteTimes.reduce((groupedTimes, time) => {
																			const key = `${time.gender}-${time.style}-${time.distance}`;
																			if (!groupedTimes[key]) {
																				groupedTimes[key] = { gender: time.gender, style: time.style, distance: time.distance, timeCount: 0, times: [], };
																			}
																			groupedTimes[key].times.push(custTimeMax(time));
																			return groupedTimes;
																		}, {});	// reduce.groupedTimes: {}

	const athlete = {};

	//-------------------------------------------------------------------------
	//-----> competitions
	//-------------------------------------------------------------------------
	const competitionIDs = [...new Set(athleteTimes.map((item) => item["competitionID"]).map(entry => entry))]
	athlete.competitionCount = competitionIDs.length;
	athlete.timeCount = athleteTimes.length;
	athlete.medals = {
    count       : athlete.competitionCount,
		timeCount		: athlete.timeCount,
		gold				: athleteTimes.filter(item => item.rank == 1).length,
		silver			: athleteTimes.filter(item => item.rank == 2).length,
		bronze			: athleteTimes.filter(item => item.rank == 3).length,
	}
	athlete.medals.total = athlete.medals.golds + athlete.medals.silvers + athlete.medals.bronzes;

	// athlete.athleteCount			= [...new Set(athleteTimes.map(entry => entry.athleteID))].length;
	//-------------------------------------------------------------------------
	//-----> check major style
	//-------------------------------------------------------------------------
	let styles = [...new Set(athleteTimes.map((item) => item["style"]).map(entry => entry))]
	const styleOBJ = styles.reduce((obj, style) => {
														if (!obj[style]) obj[style] = { style: style, count: 0, times: []};
														obj[style].times = athleteTimes.filter(time => time.style==style);
														obj[style].count = obj[style].times.length;
														return obj;
													}, {})

	styles = Object.values(styleOBJ).sort((a, b) => b.count - a.count);
	athlete.majorStyle = styles[0].style;
	for (let no = 0; no < styles.length; no++) {
		athlete.majorTimes = styles[no].times.reduce((times, time) => {
                                            if (time.times != "") {
                                              times.push({
                                                // name					: time.name,
                                                times					: time.times,
                                                style					: time.style,
                                                distance			: time.distance,
                                                // teamID				: time.teamID,
                                                // athleteID			: time.athleteID,
                                                // datetime			: time.datetime,
                                              });  
                                            }
																						return times;
																					}, []).sort((a, b) => a.time - b.time)[0];
    if (athlete.majorTimes && athlete.majorTimes.times) break;
	}
	
	const sortDatetime = athleteTimes.sort((a, b) => new Date(a.datetime) - new Date(b.datetime));
	athlete.firstDate = sortDatetime[0].datetime;
	athlete.latestDate = sortDatetime[sortDatetime.length-1].datetime;
	for (let no=sortDatetime.length-1; no >= 0; no--) {
		if (sortDatetime[no].style==athlete.majorStyle && sortDatetime[no].time < 1) {
			athlete.latestTimes = {
				// name					: sortDatetime[no].name,
				times					: sortDatetime[no].times,
				style					: sortDatetime[no].style,
				distance			: sortDatetime[no].distance,
				competitionID	: sortDatetime[no].competitionID,
				// teamID				: sortDatetime[no].teamID,
				// athleteID			: sortDatetime[no].athleteID,
				// datetime			: sortDatetime[no].datetime,
			};
			break;
		}
	}
	//-------------------------------------------------------------------------

  // athlete.styles = athleteTimes.reduce((arr, time) => {
  //                               arr.push({timeID: time.timeID, style: time.style});
  //                               return arr;
  //                             }, [])
  // console.log(athlete);
  //-------------------------------------------------------------------------
  // const query = { athleteID: Number(athleteID) };		
  // console.log(`athleteID: ${athleteID}, count: ${athlete.competitionCount}`);
  // await mongodb.updateOne(mongoCFG.Medalbank.athletes, query, athlete);
// console.log(athlete, athlete.bestTimes[0]);
	return athlete;
}

//==================================================
//==================================================
exports.athleteStaticsAll = async (timeArr) => {
  //-----> clear athletes
  // query = { $unset: { times:1, athleteCount:1, timeCount:1, bestTimes:1, teams:1, competition:1, competitions:1, majorStyle:1, majorTimes:1, firstDate:1, latestDate:1, latestTimes:1, } };
  query = { $unset: { times:1, athleteIDs:1, competitionIDs:1, styles:1 } };
  result = await mongodb.updateManyOP(mongoCFG.Medalbank.athletes, {}, query);
  const times = timeArr.filter(time => !time.style.includes('Relay'));
	//--------------------------------------------
	//	athletes
	//--------------------------------------------
	const athleteTimes = {};
	const athleteArr = [];
	console.time("buildAthletes")
	console.log("statics athletes...");
	//--------------------------------------------
	//--------------------------------------------
	//	times을 athleteOBJ[athleteID][gender-style-distance] 별로 분류
	//--------------------------------------------
	const distinctAthleteIDs = [...new Set(times.map(entry => entry.athleteID))];	
	let no = 0;
	for (const athleteID of distinctAthleteIDs) {
		const compTimes = times.filter(time => time.athleteID == athleteID).reduce((timeArr, time) => {
																																					timeArr.push(time);
																																					return timeArr;
																																				}, []);
		const athlete = this.athleteStatics(compTimes, athleteID);
		// athlete.times = compTimes.reduce((arr, time) => {
		// 	arr.push({timeID: time.timeID, style: time.style});
		// 	return arr;
		// }, [])
		// // console.log(athlete);
		// //-------------------------------------------------------------------------
		if (no++ % 100 == 0) console.log(no, "/", distinctAthleteIDs.length, athleteID, athlete.competitionCount, );
		const query = { athleteID: Number(athleteID) };
		await mongodb.updateOne(mongoCFG.Medalbank.athletes, query, athlete);
		//-------------------------------------------------------------------------	
		athleteArr.push(athlete);
	// if (no++ % 100 == 0) console.log(`update.athletes: # ${no} / ${distinctAthleteIDs.length}`);
	} // end for
	// console.log("athleteArr=", athleteArr.length, athleteArr[0]);
	
	//--------------------------------------------
	// await mongodb.deleteMany(mongoCFG.Medalbank.athletesInfo, {});
	// await mongodb.insertMany(mongoCFG.Medalbank.athletesInfo, athleteArr);
	//--------------------------------------------
	console.timeEnd("buildAthletes")

	console.log("statics athletes...end.", athleteArr.length);
	//--------------------------------------------
	return athleteArr;
}

exports.stemsStatics = async (times) => {

  //-----> clear stems
  let query = { $unset: { competitionCount:1, athleteCount:1, timeCount:1, bestTimes:1, } };
  result = await mongodb.updateManyOP(mongoCFG.Medalbank.stems, {}, query);
	const stemOBJ = {};

	//--------------------------------------------
	//	times을 stenOBJ[stemID][gender-style-distance] 별로 분류
	//--------------------------------------------
	const distinctStemIDs = [...new Set(times.map(entry => entry.stemID))];	
	for (const stemID of distinctStemIDs) {
		// stemID: grouppin [gender-style-distance]
		const compTimes = times.filter(time => time.stemID === stemID)
																.reduce((groupedTimes, time) => {
																	const key = `${time.gender}-${time.style}-${time.distance}`;
																	if (!groupedTimes[key]) {
																		groupedTimes[key] = { gender: time.gender, style: time.style, distance: time.distance, timeCount: 0, athleteCount: 0, times: [], };
																	}
																	groupedTimes[key].times.push({
																		timeID				: time.timeID,
																		name					: time.name,
																		nameHide			: time.nameHide,
																		times					: time.times,
																		time					: time.time || 999,
																		gender				: time.gender,
																		style					: time.style,
																		distance			: time.distance,
																		athleteID			: time.athleteID,
																		teamID				: time.teamID,
																		poolID				: time.poolID,
																		stemID				: time.stemID,
																		competitionID	: time.competitionID,
																		datetime			: time.datetime,
																	});
																	return groupedTimes;
																}, {});	// groupedTimes 초기값: {}
		//------------------------------
		//------------------------------
		Object.keys(compTimes).forEach(key => {
			compTimes[key].timeCount		= compTimes[key].times.length;
			compTimes[key].athleteCount	= [...new Set(compTimes[key].times.map(entry => entry.athleteID))].length;
			const tms = buildImportDAO.assignRanks(compTimes[key].times);	// times top3
			compTimes[key].times				= extend(true, tms.slice(0, Config.max_pbs));
		})
		const stem						= {
			timeCount				: times.length,
			athleteCount		: [...new Set(times.map(entry => entry.athleteID))].length,
			competitionCount: [...new Set(times.map(entry => entry.competitionID))].length,
			bestTimes 			: extend(true, Object.values(compTimes)),
		};
		
		//------------------------------														
		//------------------------------														

		query = { stemID: Number(stemID) }
		await mongodb.updateOne(mongoCFG.Medalbank.stems, query, stem);
		// console.log("update.stems:", query, "timeCount=", stem.timeCount, "athleteCount=", stem.athleteCount);
		stem.bestTimeOBJ = stem.bestTimes.reduce((obj, time) => {
			const key = `${time.gender}-${time.style}-${time.distance}`;
			if (!obj[key]) obj[key] ={};
			obj[key] = time;
			return obj;
		}, {})
		stemOBJ[stemID] = stem;
	} // end for
	//--------------------------------------------

	await memoryDB.loadStems();
	console.log("stemsStatics:", Object.keys(stemOBJ).length);

	return stemOBJ;
}
//==================================================
//==================================================
exports.competitionsStatics = async (compTimes, competitionID, stemOBJ) => {
	const stemID = compTimes[0].stemID;
		// ------------------------------------------------------
		// groupping [gender-style-distance]
		// ------------------------------------------------------
		const compTimesOBJ = compTimes.reduce((groupedTimes, time) => {
																		const key = `${time.gender}-${time.style}-${time.distance}`;
																		if (!groupedTimes[key]) {
																			groupedTimes[key] = { gender: time.gender, style: time.style, distance: time.distance, timeCount: 0, athleteCount: 0, times: [], };
																		}
																		groupedTimes[key].times.push(custTimeMax(time));
																		return groupedTimes;
																}, {});	// reduce.groupedTimes: {}


	//-------------------------------------------------------------------------
	//-----> { timeCount, athleteCount, times: [] ]
	//-------------------------------------------------------------------------
	const competition								= {};
	competition.timeCount					= compTimes.length;
	competition.athleteCount			= [...new Set(compTimes.map(entry => entry.athleteID))].length;
	Object.keys(compTimesOBJ).forEach(key => {	// gender-style-distance
		compTimesOBJ[key].timeCount		= compTimesOBJ[key].times.length;
		compTimesOBJ[key].athleteCount= [...new Set(compTimesOBJ[key].times.map(entry => entry.athleteID))].length;
		const tms = buildImportDAO.assignRanks(compTimesOBJ[key].times);	// times top3
		compTimesOBJ[key].times				= extend(true, tms.slice(0, Config.max_pbs));
		compTimesOBJ[key].times				= compTimesOBJ[key].times.reduce((times, time) => {
																															if (time.time > 0 && time.time < 1) {
																																times.push(custTimeMin(time));
																															}
																															return times;
																														}, []);
		// if (competitionID==1146 && key=="women-butterfly-100M")
		// 	console.log(stemOBJ[stemID].bestTimeOBJ[key]);
		// bestTimes니 3개 미만일 경우 처리
		for (let no = compTimesOBJ[key].times.length; no < Config.max_pbs; no++) {
			const time = custTimeMin({ rank: no+1 });
			compTimesOBJ[key].times.push(time);
		}																												
		// 대회신기록 추가
		const time = extend(true, stemOBJ[stemID].bestTimeOBJ[key].times[0]);
		time.rank = 0;
		compTimesOBJ[key].times.push(custTimeMin(time));
		
	})
	competition.bestTimes = extend(true, Object.values(compTimesOBJ));
	//-------------------------------------------------------------------------
		
	//-------------------------------------------------------------------------
	//-----> { freestyle: [ '50M', '100M', '200M' ], ]
	//-------------------------------------------------------------------------
	const distinctStylesAndDistances = {};
	compTimes.forEach(entry => {
		const { style, distance } = entry;
		if (!distinctStylesAndDistances[style]) {
			distinctStylesAndDistances[style] = [];
		}
		if (!distinctStylesAndDistances[style].includes(distance)) {
			distinctStylesAndDistances[style].push(distance);
		}
	})
	//-------------------------------------------------------------------------
	//-----> { freestyle: [ false, true, true,  true, false, false, false ], ]
	//-------------------------------------------------------------------------
	const styleDistances = [];
	Object.keys(distinctStylesAndDistances).forEach(style => {
		const distances = [];
		mskCFG.distances.forEach(distance => {
			distances.push(distinctStylesAndDistances[style].includes(distance));
		})
		// distinctStylesAndDistances[style] = distances;
		styleDistances.push({ style: style, distance: distances });
	})
	// competition.styleDistances = distinctStylesAndDistances;
	competition.styleDistances = styleDistances;
	//-------------------------------------------------------------------------

	if (competition.timeCount > 0) competition.upload = true;

	return competition;
}

//==================================================
//==================================================
exports.competitionStaticsAll = async (times, stemOBJ={}) => {
  //-----> clear competitions
  let query = { $unset: { styleDistances:1, athleteCount:1, timeCount:1, bestTimes:1, } };
  result = await mongodb.updateManyOP(mongoCFG.Medalbank.competitions, {}, query);
	const competitions = [];

	//--------------------------------------------
	if (Object.values(stemOBJ).length == 0) {
		stemOBJ = await this.loadStems();
	}
//--------------------------------------------
	
	//--------------------------------------------
	//	times를 competitionOBJ[competitionID][gender-style-distance] 별로 분류
	//--------------------------------------------
	const distinctCompetitionIDs = [...new Set(times.map(entry => entry.competitionID))];	
	for (const competitionID of distinctCompetitionIDs) {
		// ------------------------------------------------------
		// competitionID: groupping
		// ------------------------------------------------------
		const compTimes = times.filter(time => time.competitionID === competitionID);

		// ------------------------------------------------------
		const competition = await this.competitionsStatics(compTimes, competitionID, stemOBJ);
		// ------------------------------------------------------

		//-------------------------------------------------------------------------
		query = { competitionID: Number(competitionID) };		
		// console.log(`opdate.competitions: competitionID=${competitionID}, timeCount=${competition.timeCount}, athleteCount=${competition.athleteCount}`);
		competition.upload = true;
		await mongodb.updateOne(mongoCFG.Medalbank.competitions, query, competition);
		//-------------------------------------------------------------------------
		competitions.push(competition);
	} // end for
	//--------------------------------------------

	await memoryDB.loadCompetitions();
	console.log("competitionStaticsAll:", competitions.length);
	return competitions;
}

//==================================================
//==================================================
exports.teamsStatics = async (times, teamID) => {
	
	const team = {
		teamID		: teamID,
		members		: [...new Set(times.map(entry => entry.athleteID))].length,
		timeCount	: times.length,
		rank			: [ 0, 0, 0 ],
		// rankRatios: [ 0, 0, 0 ],
		style			: { freestyle: 0, backstroke: 0, butterfly: 0, breaststroke: 0, individualMedley:0, freestyleRelay:0, medleyRelay:0 },
		// ratios		: { freestyle: 0, backstroke: 0, butterfly: 0, breaststroke: 0, individualMedley:0, freestyleRelay:0, medleyRelay:0 },
		medals		: 0,
		points		: 0,
	}
	const minMaxDate			= Util.getMinMaxDate(times, 'datetime');
	team.latestDate	= minMaxDate.max;
	team.firstDate		= minMaxDate.min;

	const competitionIDs = [...new Set(times.map((item) => item["competitionID"]).map(entry => entry))]
	team.competitionCount = competitionIDs.length;

	//---------------------------------------
	//	team별 medal수, 1, 2, 3위 count
	//---------------------------------------
	for (const time of times) {
		if ([1,2,3].includes(time.rank)) {
			team.rank[time.rank-1]++;
			team.medals++;
		}

		//---------------------------------------
		//	style별 times수
		//---------------------------------------
		team.style[time.style]++;
	}

	//---------------------------------------
	//	rankRatio = 1,2,3위 / times.length
	//---------------------------------------
	//-----> teams.view에서 계산
	/*
	for (let no = 0; no < 3; no++) {
		if (team.timeCount > 0) {
			team.rankRatios[no] = parseInt(team.rank[no] / team.timeCount * 10000) / 100;
		}
	}
	for (const style of Object.keys(team.style)) {
		team.ratios[style] = parseInt(team.style[style] / team.timeCount * 100);
	}
	*/

	//---------------------------------------
	//	caculate team points
	//---------------------------------------
	team.points =	team.rank[0] * Config.points.gold + 
								team.rank[1] * Config.points.silver + 
								team.rank[2] * Config.points.bronze + 
								team.members * Config.points.members ;

	return team;
}

//==================================================
//==================================================
exports.teamsStaticsAll = async (times) => {
  //-----> clear teams
  let query = { $unset: { athleteCount:1, timeCount:1, medals:1, members:1, points:1, rank:1, style:1, } };
  result = await mongodb.updateManyOP(mongoCFG.Medalbank.teams, {}, query);
	const teams = [];
	//--------------------------------------------
	//	get distinct teamID
	//--------------------------------------------
	const distinctTeamIDs = [...new Set(times.map(entry => entry.teamID))];	
	//--------------------------------------------
	let no = 0;
	for (const teamID of distinctTeamIDs) {
		const compTimes = times.filter(time => time.teamID == teamID).reduce((timeArr, time) => {
																																					timeArr.push(time);
																																					return timeArr;
																																				}, []);
		//---------------------------------------
		const team = await this.teamsStatics(compTimes, teamID);
		//---------------------------------------

		query = { teamID: teamID };		
		//---------------------------------------
		await mongodb.updateOne(mongoCFG.Medalbank.teams, query, team);
		//---------------------------------------
		teams.push(team);
		if (no++ % 100 == 0) console.log(`update.teams: # ${no} / ${distinctTeamIDs.length}`);

	}
	await memoryDB.loadTeams();
	console.log("teamsStaticsAll:", teams.length);
	return teams;
}

exports.teamsStaticsOld = async (times) => {
	
	const teamOBJ = {};
	//---------------------------------------
	for (const time of times) {
		if (!teamOBJ[time.teamID]) teamOBJ[time.teamID] = {
			teamID: time.teamID,
			name: time.team,
			members: 0,
			timeCount: 0,
			rank: [ 0, 0, 0 ],
			rankRatios: [ 0, 0, 0 ],
			style: { freestyle: 0, backstroke: 0, butterfly: 0, breaststroke: 0, individualMedley:0, freestyleRelay:0, medleyRelay:0 },
			ratios: { freestyle: 0, backstroke: 0, butterfly: 0, breaststroke: 0, individualMedley:0, freestyleRelay:0, medleyRelay:0 },
			medals: 0,
			points: 0,
			athleteOBJ: {},
		}
		teamOBJ[time.teamID].timeCount++;
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
				teamOBJ[teamID].rankRatios[no] = parseInt(teamOBJ[teamID].rank[no] / teamOBJ[teamID].timeCount * 10000) / 100;
			}
		}

		Object.keys(teamOBJ[teamID].style).forEach(key => {
			if (teamOBJ[teamID].members > 0) {
				teamOBJ[teamID].ratios[key] = parseInt(teamOBJ[teamID].style[key] / teamOBJ[teamID].timeCount * 100);
			}
		})

		teamOBJ[teamID].points =	teamOBJ[teamID].rank[0] * Config.points.gold + 
															teamOBJ[teamID].rank[1] * Config.points.silver + 
															teamOBJ[teamID].rank[2] * Config.points.bronze + 
															teamOBJ[teamID].members * Config.points.members ;

		const query = { teamID: teamID };		
		// await mongodb.updateOne(mongoCFG.Medalbank.teams, query, teamOBJ[teamID]);
		teamArr.push(teamOBJ[teamID]);
	}
	//---------------------------------------

	return teamArr;
}

//==================================================
//==================================================
exports.poolsStaticsAll = async (times) => {
  //-----> clear pools
  let query = { $unset: { athleteCount:1, timeCount:1, medals:1, members:1, points:1, rank:1, style:1, } };
  result = await mongodb.updateManyOP(mongoCFG.Medalbank.pools, {}, query);
	const pools = [];

	//--------------------------------------------
	//	get distinct poolID
	//--------------------------------------------
	const distinctPoolIDs = [...new Set(times.map(entry => entry.poolID))];	
	//--------------------------------------------
	for (const poolID of distinctPoolIDs) {
		const compTimes = times.filter(time => time.poolID == poolID).reduce((timeArr, time) => {
																																					timeArr.push(time);
																																					return timeArr;
																																				}, []);
		//---------------------------------------
		const pool = {
			// uploadTimes			: compTimes.length,
			// athleteCount		: [...new Set(compTimes.map(entry => entry.athleteID))].length,
			competitionIDs: [...new Set(compTimes.map(entry => entry.competitionID))],	
		};
		// pool.competitionCount = pool.competitionIDs.length;
		//---------------------------------------

		query = { poolID: poolID };		
		//---------------------------------------
		await mongodb.updateOne(mongoCFG.Medalbank.pools, query, pool);
		//---------------------------------------
		pools.push(pool);

	}
	await memoryDB.loadPools();
	console.log("poolsStaticsAll:", pools.length);
	return pools;
}

//=======================================================
//=======================================================
exports.loadStems = async () => {
	const context = {
		query: {},
		projection: {_id:0, },
		limit: 100000,
		skip: 0,
		sort: { stemID:1 },
	}
	const result = await mongodb.find(mongoCFG.Medalbank.stems, context);
	// 1. stems - stemOBJ
	const stemOBJ = result.data.reduce((entry, stem) => {
		let timeOBJ = {};
		if (stem.bestTimes) {
			timeOBJ = stem.bestTimes.reduce((groupedTimes, time) => {
				const key = `${time.gender}-${time.style}-${time.distance}`;
				if (!groupedTimes[key]) {
					groupedTimes[key] = {};
				}
				groupedTimes[key] = time;
				return groupedTimes;
			}, {});
		}
		stem.bestTimeOBJ = timeOBJ;
		entry[stem.stemID] = stem;
		return entry;
	}, {})
	return stemOBJ;
}
exports.loadStems1 = async () => {
	const context = {
		projection: {_id:0, },
		limit: 100000,
		skip: 0,
		sort: { stemID:1 },
	}
	const result = await mongodb.find(mongoCFG.Medalbank.stems, context);
	// 1. stems - stemOBJ
	const stemOBJ = result.data.reduce((group, data) => {
																if (!group[data.stemID]) {
																	group[data.stemID] = [];
																}
																group[data.stemID].push(data);
																return group;
															}, {});
	return stemOBJ;
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
	const poolOBJ = result.data.reduce((group, data) => {
																if (!group[data.poolID]) group[data.poolID] = [];
																group[data.poolID].push(data);
																return group;
															}, {});
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
			athleteID	: { $exists: true },
			poolID		: { $exists: true },
			teamID		: { $exists: true },
			$or				: [ {status: ""}, { status: { $exists: false }} ],
			time			: { $gt: 0 }, fin: { $exists: false }
		},
		projection: {_id:0, timeID:1, name:1, nameHide:1, gender:1, style:1, distance:1, teamID:1, athleteID:1, competitionID:1, poolID:1, teamID:1, time:1, times:1, diffs:1, rank:1, rankGroup:1 },
		limit: 500000,
		skip: 0,
		sort: { gender:1, style:1, distance:1, time:1 },
	}		
	result = await mongodb.find(mongoCFG.Medalbank.times, context);
	const times = result.data.reduce((arr, time) => {
															time.datetime = memoryDB.getCompetition(time.competitionID).datetime;
															arr.push(time);
															return arr;
														}, [])
	console.log(times[0]);
	process.exit();
	return times;
}
