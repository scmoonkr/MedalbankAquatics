const fs          = require('fs');
const extend 			= require('node.extend');
const moment    	= require('moment');
const timezone		= require('moment-timezone');
const momentBD  	= require('moment-business-days');
const holidayKR 	= require('holiday-kr');


const mongoDB			= require('../Class/MongoDB');
const UtilDate    = require("../Class/DateLibrary");
const utilLibrary = require("../Util/utilLibrary");
const {customTimes} = require("../Util/utilTimes");
const swimmingLibrary = require('../Util/swimmingLibrary');

const {swimmingCFG} = require('../Config/swimmingCFG');
const mongoCFG 		= require('../Config/mongoCFG');
const mongodb 	  = new mongoDB(mongoCFG.Medalbank.database);
const utilDate	  = new UtilDate();

'use strict';

const HISTORY_LIMIT = 8;
const HISTORY_TYPE = [ "athlete", "team", "pool", ];


let _competitions = [];
let _competitionOBJ = {};

// let _users = [];
let _userOBJ = {};

let _configOBJ = {
	teamPoints: {
		events: 10,
		season: 10,
		athletes: 1,
		start: 1,
		goldIndividual: 3,
		silverIndividual: 2,
		bronzeIndividual: 1,
		goldTeam: 12,
		silverTeam: 8,
		bronzeTeam: 4,
	}
};

// let _stems = [];
let _stemOBJ = {};

let _rankings = [];
let _rankingOBJ = {};

// let _athletes = [];
// let _athleteOBJ = {};

let _teams = [];
let _teamOBJ = {};

let _pools = [];
let _poolOBJ = {};

let _years = [];
let _historyOBJ = {};
let _statisticsOBJ = {};

const MAX_RANKINGS = 100;
console.log("MSKR.class.start...MemoryDB");

class MemoryDB {
	constructor()  {
		this._historyOBJ = _historyOBJ;
		this._competitions = _competitions;
		if (_competitions.length == 0) {
			// this.initialize();
		}
	}
	//-----------------------------
	// getter
	//-----------------------------
	get competitions() 		{ return _competitions; }
	get years() 			  	{ return _years; }
	get history() 			  { return _historyOBJ; }
	get statistics() 		  { return _statisticsOBJ; }
	get competitionOBJ() 	{ return _competitionOBJ; }
	get stemOBJ() 				{ return _stemOBJ; }
	get poolOBJ() 				{ return _poolOBJ; }
	get userOBJ() 				{ return _userOBJ; }
	get teamOBJ() 				{ return _teamOBJ; }
	get rankings() 			  { return _rankings; }
	get teams() 					{ return _teams; }
	get rankingOBJ() 			{ return _rankingOBJ; }


	//-----------------------------
	// 
	//-----------------------------
	setTime (time={}) {
		if (!time.competitionID) return time;

		const competition = this.getCompetition(time.competitionID);
		time.competitionName = competition.fullname || "";
		time.order = competition.order || 0;
		time.datetime = competition.dateStart || "";
		time.pool = competition.pool || "";
		time.poolID = competition.poolID || 0;
		// time.pool = this.getPoolName(time.teamID);

		time.team = this.getTeamName(time.teamID);
		// const team = this.getTeam(time.teamID);
		// time.team = team.name && team.name ? team.name : "";

		return time;
	}

	//-----------------------------
	// 
	//-----------------------------
	// getUserID = (userID) => userID && _userOBJ[userID] ? _userOBJ[userID].athleteID : Number(userID);
	getUserID = (userID) => {
    return userID && _userOBJ[userID] ? _userOBJ[userID].athleteID : Number(userID)
  };

	//-----------------------------
	// 
	//-----------------------------
	getStem = (stemID) => stemID && _stemOBJ[stemID] ? _stemOBJ[stemID] : {};
	getStemName = (stemID) => stemID && _stemOBJ[stemID] ? _stemOBJ[stemID].name : "";
	getCofig = (type) => _configOBJ[type] || {};
	getTeamPoints = () => _configOBJ.teamPoints || {
																										events: 10,
																										season: 10,
																										athletes: 1,
																										start: 1,
																										goldIndividual: 3,
																										silverIndividual: 2,
																										bronzeIndividual: 1,
																										goldTeam: 12,
																										silverTeam: 8,
																										bronzeTeam: 4,
																									};

	//-----------------------------
	// 
	//-----------------------------
	getTeam = (teamID) => teamID && _teamOBJ[teamID] ? _teamOBJ[teamID] : {};
	getTeamName = (teamID) => teamID && _teamOBJ[teamID] ? _teamOBJ[teamID].name || "" : "";
	getTeamByName = (name) => _teams.filter(el =>  el.indexes && el.indexes.includes(name));
	addTeam = (team) => {
    _teams.push(team)
  };
	//-----------------------------
	// 
	//-----------------------------
	getTeamNames = (name, limit=20) => {
		if (!name) return [];

		const teams = _teams.filter(team => team.indexes.some((index) => new RegExp(name, "i").test(index)))
												.sort((a,b) => a.name.localeCompare(b.name)).slice(0, limit)
												.reduce((arr, team) => {
													const value = {
														teamID	: team.teamID,
														name		: team.name || '',
													}
													arr.push(value);
													return arr;
												}, []);
		return teams;
	}

	//-----------------------------
	// 
	//-----------------------------
	getPool = (poolID) => poolID && _poolOBJ[poolID] ? _poolOBJ[poolID] : {};
	// getPoolName = (poolID) => poolID && _poolOBJ[poolID] ? _poolOBJ[poolID].fullname || "" : "";
	getPoolName = (poolID) => {
		const pl = poolID && _poolOBJ[poolID] ? _poolOBJ[poolID].fullname || "" : "";
		return pl;
	}

	//-----------------------------
	// 
	//-----------------------------
	getPoolNames = (name, limit=20) => {
		if (!name) return [];

		const pools = _pools.filter(pool => pool.fullname.includes(name.trim()))
												.sort((a,b) => a.fullname.localeCompare(b.fullname)).slice(0, limit)
												.reduce((arr, pool) => {
													const value = {
														poolID      			: pool.poolID,
														fullname					: pool.fullname || '',
														sido							: pool.sido || '',
														course						: pool.course || '',
													}
													arr.push(value);
													return arr;
												}, []);
		return pools;
	}
	//-----------------------------
	// 
	//-----------------------------
	getPools = (sido) => {
		if (!sido) return [];

		const pools = _pools.filter(pool => pool.sido == sido)
												.reduce((arr, pool) => {
													const value = {
														poolID      			: pool.poolID,
														fullname					: pool.fullname || '',
														sido							: pool.sido || '',
														addressDRM		    : pool.addressDRM || '',
														competitionCount  : pool.competitionCount || 0,
													}
													arr.push(value);
													return arr;
												}, []);
		return pools;
	}

	//-----------------------------
	// 
	//-----------------------------
	getCompetition = (competitionID) => {
		if (!competitionID) return {};
		competitionID = Number(competitionID);

		let competition = _competitionOBJ[competitionID];
		if (competition) {
			if (!competition.stem) competition.stem = this.getStem(competition.stemID).stem || '';
			if (!competition.pool) competition.pool = this.getPoolName(competition.poolID);
		} else {
			competition = {
				competitionID		: 0,
				fullname				: '',
				sido						: '',
				stem						: '',
				pool						: '',
				course					: '',
				distance				: '',
				dateStart				: '',
			}
		}
		return competition;
	}
	getCompetitionName = (competitionID) => this.getCompetition(competitionID).fullname || "";

	//-----------------------------
	// 
	//-----------------------------
	getCompetitionNames = (name) => {
		if (!name) return [];

		const competitions = _competitions.filter(competition => competition.fullname.includes(name.trim()))
												.reduce((arr, competition) => {
													const value = {
														competitionID	: competition.competitionID,
														fullname			: competition.fullname || '',
														sido					: competition.sido || '',
														dateStart			: competition.dateStart,
													}
													arr.push(value);
													return arr;
												}, []);
		return competitions;
	}
	//-----------------------------
	// 
	//-----------------------------	
	getUpcommingCompetitions = (limit=100) => {
		if (this.competitions.length == 0) return [];
		
		const today = new Date();
		const todaytz = new Date(today.setHours(today.getHours()));

		const todayLocal00 = new Date(
																todaytz.getFullYear(),
																todaytz.getMonth(),
																todaytz.getDate(),
																swimmingCFG.timezone,
																0, 0, 0
															);

		const competitions = this.competitions
															.filter(comp => comp.datetime && comp.datetime > todayLocal00)
															.reduce((arr,comp) => {
																arr.push(comp);
																return arr;
															}, []);
	console.log("getUpcommingCompetitions.competitions=", competitions.length);
		return competitions.slice(0, limit);
	}

	//-----------------------------
	// 
	//-----------------------------
	getCompetitions = (body) => {
		if (_competitions.length == 0) return _competitions;

		let comps = extend(true, _competitions);

		if (body.sido != "전체" && body.sido) comps = comps.filter(comp => comp.sido && comp.sido == body.sido);
		if (body.poolID		) comps = comps.filter(comp => comp.poolID && comp.poolID == Number(body.poolID));
		if (body.stemID		) comps = comps.filter(comp => comp.stemID && comp.stemID == Number(body.stemID));
		if (body.course		) comps = comps.filter(comp => comp.course && comp.course == body.course);
		if (body.measured	) comps = comps.filter(comp => comp.measured && comp.measured);

		if (body.year		) {
			const year = Number(body.year);
			comps = comps.filter(comp => comp.year == year);
			const today = new Date();
			if (year == today.getFullYear()) {
				comps = comps.filter(comp => comp.datetime < today);
			}
		}

		const competitions = comps.reduce((arr, comp) => {
																const value = {
																	competitionID	: comp.competitionID,
																	fullname			: comp.fullname,
																	order					: comp.order,
																	year					: comp.year,
																	// stem					: this.getStem(comp.stemID).stem || "",
																	// stemID				: comp.stemID,
																	// pool					: this.getPoolName(comp.poolID),
																	// poolID				: comp.poolID,
																	sido					: comp.sido,
																	timeCount			: comp.timeCount,
																	athleteCount	: comp.athleteCount,
																	dateStart			: comp.dateStart,
																}
																arr.push(value);
																return arr;
															}, []);

		return competitions;
	}

	//-----------------------------
	// 
	//-----------------------------
	getStemCompetitions = (stemID) => {
		const comps = _competitions.filter(comp => comp.stemID == Number(stemID));
		const stems = comps.reduce((arr, comp) => {
													const value = {
														competitionID	: comp.competitionID,
														fullname			: comp.fullname,
														order					: comp.order,
														year					: comp.year,
														stem					: this.getStem(comp.stemID).fullname || "",
														stemID				: comp.stemID,
														pool					: this.getPoolName(comp.poolID),
														poolID				: comp.poolID,
														sido					: comp.sido,
														timeCount			: comp.timeCount,
														athleteCount	: comp.athleteCount,
														dateStart			: comp.dateStart,
													}
													arr.push(value);
													return arr;
												}, []);
		return stems;
	}

	//-----------------------------
	// 
	//-----------------------------
	getLeaderboard = (limit) => {

		const times = Object.keys(_rankingOBJ).reduce((arr, key) => {
			const disp = (key+"--").split('-');
			const ranking = {
				title: "",
				gender: disp[0] || '',
				style: disp[1] || '',
				distance: disp[2] || '',
				course: '',
			};
			ranking.times = _rankingOBJ[key].slice(0, limit).reduce((arr, time) => {
				const tm = {
					athleteID : time.athleteID,
					name      : time.name,
					times     : time.times,
					rank      : time.rank,
					datetime  : time.datetime,
				}
				arr.push(tm);
				return arr;
			}, [])
			arr.push(ranking);
			return arr;
		}, [])
		return times;
	}

	//-----------------------------
	// 
	//-----------------------------
	getTopN = (rank) => {
		// console.log("_rankings.length=",_rankings.slice(0, 5), _rankings.length);
		return _rankings.filter(ranking => ranking.rank <= rank);
	}

	//-----------------------------
	// 
	//-----------------------------
	getRankings = (body) => {
		let returnObj = { message: "", data: [] };

		if (!body.gender || !body.style || !body.distance) {
			returnObj.message = "memoryDB.loading.body.gender, style, distance not found !!";
			console.log(returnObj.message);
			return returnObj;
		}

		const discipline = `${body.gender}-${body.style}-${body.distance}`;
		if (!_rankingOBJ[discipline]) return [];

		const page = body.page ? Number(body.page) : 0;
		const limit = body.limit ? Number(body.limit) : 100;

		const start = page <= 1 ? 1 : (page - 1) * limit + 1;
		const index = _rankingOBJ[discipline].findIndex(time => time.rank >= start)
		let times = _rankingOBJ[discipline];
		if (index > 0) times = times.slice(index);
		times = times.filter(tm => tm.rank <= (index + limit))
									.reduce((arr, tm) => {
										const value = {
											athleteID				: tm.athleteID,
											name						: tm.name || "",
											competitionName	: tm.competitionName || "",
											times						: tm.times || "",
											diffs						: tm.diffs || "",
											rank						: tm.rank,
											rankGroup				: tm.rankGroup,
											team						: tm.team || "",
											pool						: this.getPoolName(tm.poolID),
										}
										arr.push(value);
										return arr;
									}, []);  

		return times;
	}
	//-----------------------------
	// search athlete, rank, times
	//-----------------------------
	searchRankings = (body) => {
		let returnObj = { message: "", data: [] };

		if (!body.gender || !body.style || !body.distance) {
			returnObj.message = "memoryDB.loading.body.gender, style, distance not found !!";
			console.log(returnObj.message);
			return returnObj;
		}

		const discipline = `${body.gender}-${body.style}-${body.distance}`;
		if (!_rankingOBJ[discipline]) return [];

		const page = body.page ? Number(body.page) : 0;
		const limit = body.limit ? Number(body.limit) : 100;

		let times = [];
		let rank = 0;
		let checkRank = -1;

		if (body.athlete) {
			times = _rankingOBJ[discipline].filter(time => time.name == body.athlete.trim())
		} else if (body.ranking) {
			if (/^\d+$/.test(body.ranking)) {
				console.log(`${body.ranking} is an integer`);
				// ranking 538 -> -50 ~
				checkRank = Number(body.ranking);
				rank = checkRank - parseInt(limit / 2);
				if (rank < 0) rank = 1;
				for (let no=0; no<_rankingOBJ[discipline].length; no++) {
					if (_rankingOBJ[discipline][no].rank >= rank) {
						rank = no;
						break;
					}
				}
				times = _rankingOBJ[discipline].slice(rank, rank+limit);
			} else {
				const timeStr = customTimes(body.ranking);
				const time = utilDate.convertString2Timestamp(timeStr);
				for (let no=0; no<_rankingOBJ[discipline].length; no++) {
					if (_rankingOBJ[discipline][no].time >= time) {
						rank = no;
						checkRank = _rankingOBJ[discipline][no].rank;
						break;
					}
				}
				console.log(body.ranking, timeStr, time, rank);
				rank = rank - parseInt(limit / 2);
				if (rank < 0) rank = 1;
				times = _rankingOBJ[discipline].slice(rank, rank+limit);
			}
		}

		//---------------------------------
		const timeArr = [];
		for (const tm of times) {
			const value = {
				athleteID				: tm.athleteID,
				name						: tm.name || "",
				competitionName	: tm.competitionName || "",
				times						: tm.times || "",
				diffs						: tm.diffs || "",
				rank						: tm.rank,
				rankGroup				: tm.rankGroup,
				team						: tm.team || "",
				pool						: this.getPoolName(tm.poolID),
			}
			if (checkRank >= 0 && tm.rank == checkRank) {
				value.check = true;
			}
			timeArr.push(value);
		}

		return timeArr;
	}
	
	/*
	*
	*/
	loadHistory = async () => {
		const timezone = 9;
		const today = new Date();
		const todaytz = new Date(today.setHours(today.getHours() - timezone));
		const year = todaytz.getFullYear();
		const month = todaytz.getMonth();
		const week = todaytz.getDay();
		const day = todaytz.getDate();
	
		const todayLocal00 = new Date(year, month, day, timezone, 0, 0, 0)
		const yesterday = new Date(year, month, day-1, timezone, 0, 0, 0)
		const thisWeek = new Date(year, month, day-week, timezone, 0, 0, 0)
		const thisMonth = new Date(year, month, 1, timezone, 0, 0, 0)
		const thisYear = new Date(year, 0, 1, timezone, 0, 0, 0)
	
		const lastWeek = new Date(year, month, day-week-7, timezone, 0, 0, 0)
		const lastMonth = new Date(year, month-1, 1, timezone, 0, 0, 0)
		const lastYear = new Date(year-1, 0, 1, timezone, 0, 0, 0);
	
		_historyOBJ = {};
		
		_historyOBJ["searchedNames"] =  await getNames();
		_historyOBJ["today"]     =  await getHistory({ datetime: { $gte: todayLocal00 } });
		_historyOBJ["yesterday"] =  await getHistory({ datetime: { $gte: yesterday, $lt: todayLocal00 } });
		_historyOBJ["thisWeek"]  =  await getHistory({ datetime: { $gte: thisWeek } });
		_historyOBJ["lastWeek"]  =  await getHistory({ datetime: { $gte: lastWeek, $lt: thisWeek } });
		_historyOBJ["thisMonth"] =  await getHistory({ datetime: { $gte: thisMonth } });
		_historyOBJ["lastMonth"] =  await getHistory({ datetime: { $gte: lastMonth, $lt: thisMonth } });
		_historyOBJ["thisYear"]  =  await getHistory({ datetime: { $gte: thisYear } });
		_historyOBJ["lastYear"]  =  await getHistory({ datetime: { $gte: lastYear, $lt: thisYear } });
		console.log("loaded history...");
	}
	//=======================================================
	newHistory = (body) => {
		const value = {
			type		: body.type,
			// id			: body.id,
			name		: body.name,
			datetime: body.datetime,
		}
		if (body.ID) value.ID = body.ID;
		_historyOBJ[type] = [ value, ..._historyOBJ[type].slice(0, 9) ];
	}
	
	//=======================================================
	//	loading...
	//=======================================================	
	//
	async loadStatics() {
		_statisticsOBJ.times 				= await mongodb.count(mongoCFG.Medalbank.times, {})
		_statisticsOBJ.athletes 		= await mongodb.count(mongoCFG.Medalbank.athletes, {})
		_statisticsOBJ.reports			= await mongodb.count(mongoCFG.Medalbank.reports, {})
		_statisticsOBJ.teams				= _teams.length; // await mongodb.count(mongoCFG.Medalbank.teams, {})
		_statisticsOBJ.competitions	= _competitions.filter(comp => comp.timeCount > 0).length;
		_statisticsOBJ.stems 				= await mongodb.count(mongoCFG.Medalbank.stems, {})
		_statisticsOBJ.pools 				= await mongodb.count(mongoCFG.Medalbank.pools, { competitionCount: { $gt: 0 } })
		_statisticsOBJ.pools 				= Object.keys(_poolOBJ).filter(key => _poolOBJ[key].competitionCount && _poolOBJ[key].competitionCount > 0).length;
		_statisticsOBJ.rankings 		= Object.keys(_rankingOBJ).length;
		_statisticsOBJ.users 				= Object.keys(_userOBJ).length;
		_statisticsOBJ.years 				= _competitions.reduce((arr, comp) => {
																									if (comp.timeCount > 0 && !arr.includes(comp.year.toString())) arr.push(comp.year.toString());
																									return arr;
																								}, [])
																								.sort((a,b) => b-a);
		// _statisticsOBJ.history			= _historyOBJ;
		console.log("load statistics..."); //, _statisticsOBJ);
		console.log("load _years...", _statisticsOBJ.years.length); //, _statisticsOBJ);

		return _statisticsOBJ;
	}
	getStatistics() {
		return _statisticsOBJ;
	}
	setStatistics(key, data) {
		_statisticsOBJ[key] = data;
	}

	async loadCompetitions() {
		const context = {
			query			: { fullname: { $exists: true } },
			// projection: {_id:0,  },
			projection: {_id:0, competitionID:1, fullname:1, order:1, sido:1, stemID:1, stem:1, poolID:1, year:1, course:1, distance:1, dateStart:1, },
			limit			: 100000,
			skip			: 0,
			sort			: { competitionID: 1 },
		}
		const result = await mongodb.find(mongoCFG.Medalbank.competitions, context);
		_competitions = result.data.reduce((arr, competition) => {
																	if (!competition.stem) competition.stem = this.getStem(competition.stemID).stem || '';
																	if (!competition.pool) competition.pool = this.getPoolName(competition.poolID);
																	arr.push(competition);
																	return arr;
																}, []);

		_competitionOBJ = _competitions.reduce((obj, comp) => {
																			obj[comp.competitionID] = comp;
																			return obj;
																		}, {});
		return _competitionOBJ;
	}

	//
	async loadStems() {
		const context = {
			// query: { stemID: { $in: uploadedCompetitions } },
			query 		: {},
			projection: {_id:0, stemID:1, stem:1,},
			limit			: 100000,
			skip			: 0,
			sort			: { stemID:1 },
		}
		const result = await mongodb.find(mongoCFG.Medalbank.stems, context);
		// 1. stems - _stemOBJ
		_stemOBJ = {};
		for (const stem of result.data) {
			stem.name = stem.stem;
			delete stem.stem;
			_stemOBJ[stem.stemID] = stem;
		}

		console.log("load stems...", result.data.length,);
		return _stemOBJ;
	}

	//
	async loadConfig() {
		const context = {
			query 		: {},
			projection: {_id:0, },
			// limit			: 100000,
			// skip			: 0,
			// sort			: { _id:1 },
		}
		const result = await mongodb.find(mongoCFG.Medalbank.config, context);
		// 1. stems - _stemOBJ
		_configOBJ = {};
		for (const config of result.data) {
			_configOBJ[config.type] = config;
		}
		return _configOBJ;
	}

	//
	async loadTeams() {
		const context = {
			query			: { name: { $exists: true } }, // teamID: { $gt: 0 }, name: { $nin: ["개인", ""]} },
			projection: {_id:0, teamID:1, name:1, nameEng:1, logo:1, medaals:1, timeCount:1, members:1, latestDate:1, medals:1, points:1, rank:1, indexes:1 },
			limit			: 100000,
			skip			: 0,
			sort			: { points:-1 },
		}
		const result = await mongodb.find(mongoCFG.Medalbank.teams, context);

		_teams = extend(true, [], result.data);

		// 1. teams - _teamOBJ
		_teamOBJ = _teams.reduce((obj, team) => {
												obj[team.teamID] = team;
												return obj;
											}, {});
		console.log("load teams...", _teams.length);
		return _teamOBJ;
	}

	//
	async loadPools() {
		const context = {
			query			: { fullname: {$exists: true } },
			projection: {_id:0, poolID:1, fullname:1, sido:1, course:1, },
			limit			: 100000,
			skip			: 0,
			sort			: { poolID:1 },
		}
		const result = await mongodb.find(mongoCFG.Medalbank.pools, context);

		_pools = result.data.reduce((arr, pool) => {
														const value = { poolID: pool.poolID, fullname: pool.fullname, sido: pool.sido, course: pool.course,};
														// pool.competitionCount = pool.competitionCount || 0;
														// pool.count = pool.competitionCount ? 1 : 0;
														arr.push(value);
														return arr;
													}, []);

		_poolOBJ = _pools.reduce((obj, pool) => {
												obj[pool.poolID] = pool;
												return obj;
											}, {})										
		// console.log("loaded pools...", _pools.slice(0, 5));
		// fs.writeFileSync("./pools.txt", JSON.stringify(_pools, null, '  '));
		return _poolOBJ;
	}

	//
	loadUsers = async () => {
		const context = {
			query 		: {},
			projection: {_id:0, userID:1, name:1, athleteID:1, masters:1, adult:1, gender:1, teamID:1, sido:1, dob:1, avatar:1, phone:1, email:1 },
			limit			: 100000,
			skip			: 0,
			sort			: { poolID:1 },
		}
		const result = await mongodb.find(mongoCFG.Medalbank.users, context);
		// 1. userID - userID
		_userOBJ = {};
		for (const user of result.data) {
			_userOBJ[user.userID] = user;
		}				
		console.log("loaded users...", result.data.length);
		return _userOBJ;
	}
	
	//
	loadRankings = async () => {
		console.log("load rankings...", Object.keys(_rankingOBJ).length);
	
		return _rankingOBJ;
	}	

	//=======================================================
	initialize = async () => {

		if (Object.keys(_configOBJ).length    == 0) await this.loadConfig();
		if (Object.keys(_historyOBJ).length 	== 0) await this.loadHistory();
		if (Object.keys(_stemOBJ).length      == 0) await this.loadStems();
		if (Object.keys(_teamOBJ).length      == 0) await this.loadTeams();
		if (Object.keys(_poolOBJ).length      == 0) await this.loadPools();	
		if (Object.keys(_userOBJ).length      == 0) await this.loadUsers();

		if (_competitions.length  						== 0) await this.loadCompetitions();
		if (Object.keys(_rankingOBJ).length   == 0) await this.loadRankings();
		if (Object.keys(_statisticsOBJ).length== 0) await this.loadStatics();
	
	}

	//=======================================================
	loadMemoryDB = async () => {
		// console.log("load memoryDB...");

		// await this.initialize();
		console.log("-------------------> loadMemoryDB");

		// await this.loadCompetitions();
		// await this.loadHistory();
		// await this.loadStems();
		// await this.loadTeams();
		// await this.loadRankings();	
		// await this.loadPools();	
		// await this.loadStatics();
		// await this.loadUsers();
		
		// console.log("initialize...end");
	}

}

module.exports = MemoryDB;

async function getHistory(query, limit=HISTORY_LIMIT) {

	// console.log("query=", query);
	const aggregate = [
		{ $match: query },
		{
			$group		: { "_id": { "name": "$name" },
			count			: { $sum: 1},
			type			: { $first: "$type" },
			datetime	: { $first: "$datetime" },
			ID				: { $first: "$ID" },
		}
		},
		{ $project	: { name: "$_id.name", _id:0, type:1, ID:1, datetime:1, } }, // count: 1, datetime:1, } },
		{ $limit		: limit },
		{ $sort			: { count: -1 } }
	];
	//---------------------------------
	const result = await mongodb.aggregate(mongoCFG.Medalbank.history, aggregate);
	//---------------------------------
	const history = result.data.reduce((arr, history) => {
																const value = {
																	type		: history.type || "",
																	name		: history.name || "",
																	datetime: history.datetime ? history.datetime.toISOString().slice(0, 10) : '',
																}
																if (history.ID) value.ID = history.ID;
																arr.push(value);
																return arr;
															}, []);
	return history;
}

async function getNames() {
	let returnObj = { message: "", data: [] };
	//-----> get query
	const query = {};

	const aggregate = [
		{ $match: { type: { $in: ["user", "team", "pool"] } },
		},
		{ $group: {
				_id				: "$name",
				count			: { $sum: 1 },
				name			: { $first: "$name" },
				type			: { $first: "$type" },
				datetime	: { $first: "$datetime" },
				ID				: { $first: "$ID" },
			}
		},
		{ $project		: { name: "$_id", _id:0, type:1, ID:1, datetime:1, } },
		{ $sort				: { datetime: -1 } },
		{ $limit			: HISTORY_LIMIT },
	];
	//-----> select comment
	const result = await mongodb.aggregate(mongoCFG.Medalbank.history, aggregate);
	const names = result.data.reduce((arr, name) => {
															const value = {
																type		: name.type || "",
																name		: name.name || "",
																datetime: name.datetime ? name.datetime.toISOString().slice(0, 10) : '',
															}
															if (name.ID) value.ID = name.ID;
															arr.push(value);
															return arr;
														}, []);

	return names;

}


(async () => {
	const memoryDB = new MemoryDB();
	if (memoryDB.competitions.length == 0) {
		// console.log("\nclass.memoryDB loading..", memoryDB.competitions.length);
		// await memoryDB.initialize();
		// console.log("\nmemoryDB inititalized..\n\n");
	}
})();
