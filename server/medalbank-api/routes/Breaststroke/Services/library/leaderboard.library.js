const mongoCFG 		= require('../../Config/mongoCFG');
const mongoDB			= require('../../Class/MongoDB');
const UtilDate		= require("../../Class/DateLibrary");
const MemoryDB		= require('../../Class/MemoryDB');
const TimeLibrary	= require("../../Class/TimeLibrary");
const timeLibrary = new TimeLibrary();

const mongodb 		= new mongoDB(mongoCFG.Medalbank.database);

const utilDate		= new UtilDate();
const memoryDB		= new MemoryDB();


exports.getCompetitionsTeamsPools = (times) => {
  let result = { competitions: [], pools: [], teams: [] };
	try {
		// get competition info
		const competitionIDs = [...new Set(times.map(time => time.competitionID))];
		if (competitionIDs && competitionIDs[0] != undefined) {
			result.competitions = competitionIDs.map(id => {
																						const competition = memoryDB.competitionOBJ[id];
																						if (competition) {
																							const pool = memoryDB.poolOBJ[competition.poolID];
																							return {
																								competitionID	: competition.competitionID,
																								sido					: competition.sido,
																								fullname			: competition.fullname,
																								pool					: pool ? pool.fullname || "" : "",
																								poolID				: pool ? pool.poolID || 0 : 0,
																								dateStart			: competition.dateStart,
																							};
																						}
																					});
		}																		
		// get team info
		const teamIDs = [...new Set(times.map(time => time.teamID))];
		if (teamIDs && teamIDs[0] != undefined)
			result.teams = teamIDs.map(id => {
														const team = memoryDB.teamOBJ[id];
														if (team) {
															return {
																teamID: team.teamID,
																name	: team.name,
																// course	: team.course || "",
															};
														}
													});

		// get pool info
		const poolIDs = [...new Set(times.map(time => time.poolID))];
		if (poolIDs && poolIDs[0] != undefined)
			result.pools = poolIDs.map(id => {
														const pool = memoryDB.poolOBJ[id];
														if (pool) {
															return {
																poolID: pool.poolID,
																name	: pool.fullname,
																sido	: pool.sido,
															};
														}
													});                          
	} catch (err) {
		console.log("getCompetitionsTeamsPools.catch.", err);;
	}
  return result;
}

exports.setCompetitionTeamPool = (times) => {
	const timeArr = [];
	for (const time of times) {
		if (time.competitionID != undefined) {
			const competition = memoryDB.getCompetition(time.competitionID);
			if (competition) {
				time.competitionName = competition.fullname;
				time.sido			      = competition.sido;
				time.datetime       = competition.dateStart;
				if (competition.sido) time.sido = competition.sido;
			}
		}
		if (time.poolID != undefined) {
			const pool = memoryDB.getPool(time.poolID);
			if (pool) {
				time.pool     = pool.fullname;
				time.sido			= pool.sido;
				if (pool.sido) time.sido = pool.sido;
			}
		}
		if (time.teamID != undefined) {
			const team = memoryDB.getTeam(time.teamID);
			if (team) {
				time.team     = team.name;
			}
		}
		timeArr.push(time);
	}
	return timeArr;
}
exports.getTimesForLeaderboardTop1 = async (body) => {
	body.limit = 1;
	let result = await this.getTimesForLeaderboard(body); // { leaderboards, count }
	const leaderboards = result.leaderboards.reduce((arr,lead) => {
																if (lead.times.length > 0) {
																	lead = { ...lead, ...lead.times[0] };
																	delete lead.times;
																	arr.push(lead);
																}
																return arr;
															}, []);
	const assignTimes = timeLibrary.assignRanksMedalbank(leaderboards);
	// const comp = LeaderboardUTIL.getCompetitionsTeamsPools(times);
	const { times, compression } = new TimeLibrary().getCompetitionsTeamsPools(assignTimes);
	return { times, compression };
}
//------------------------------------------
// times에서 leaderboard를 생성하는 함수
//		body.startDate, body.endDate: leaderboard의 범위
//		body.limit: 상위 limit개의 leaderboard만 생성
//------------------------------------------
exports.getTimesForLeaderboard = async (body) => {
	const limit = body.limit ? Number(body.limit) : 10000;

	let query = {
		$and					: [
			{ $or				: [
					{ style	: "individualMedley", distance: "200M" }, 
					{ style	: { $in: ["freestyle", "backstroke", "breaststroke", "butterfly"]}, distance: "50M" }
				],
			},
			{ $or 			: [{ status: "" }, { status: { $exists: false } }], }
		],
		competitionID	: { $gt: 0 },
		timeStamp			: { $gt: 0 },
		isAdult				: true,
		isMasters			: true,
	}
	const dateQuery = mongodb.makeDateQuery(body.type, body.date);
	if (Object.keys(dateQuery).length > 0) query.datetime = dateQuery;
	
	if (body.gender	 ) query.gender		= body.gender;
	if (body.style	 ) query.style		= body.style;
	if (body.course	 ) query.course		= body.course;
	if (body.distance) query.distance	= body.distance;
	if (body.ageGroup) query.ageGroup = body.ageGroup;
	if (body.sido		 ) query.sido			= body.sido;

	const aggregate = [
		{ $match: query },
		// 1. athleteID별로 그룹화하고, 각 athleteID에서 가장 좋은 기록(timeStamp가 작은) 선택
		{ $sort: { timeStamp: 1 } },
		{ $group: {
				_id: "$name",
				bestRecord: { $first: "$$ROOT" }  // timeStamp가 작은 기록을 선택하기 위해 먼저 정렬
			}
		},
		// 2. gender, style, course, distance 별로 그룹화
		{ $group: {
				_id: {
					gender	: "$bestRecord.gender",
					style		: "$bestRecord.style",
					course	: "$bestRecord.course",
					distance: "$bestRecord.distance"
				},
				records: { $push: "$bestRecord" }  // 각 그룹의 레코드를 배열로 저장
			}
		},
		// 3. timeStamp 기준으로 정렬
		{ $unwind: "$records" },
		{ $sort: { "records.timeStamp": 1, "records.ageGroup": 1 } },
		// 4. 각 그룹에서 상위 10개만 가져옴
		{ $group: {
				_id: {
					gender	: "$_id.gender",
					style		: "$_id.style",
					course	: "$_id.course",
					distance: "$_id.distance"
				},
				topRecords: { $push: "$records" }
			}
		},
		{ $project: {
				times: { $slice: ["$topRecords", limit] }
			}
		},
		// 5. 필요한 필드만 선택
		{ $project: {
				gender								: "$_id.gender",
				style									: "$_id.style",
				course								: "$_id.course",
				distance							: "$_id.distance",
				_id										: 0,
				"times.name"					: 1,
				"times.time"					: 1,
				"times.timeStamp"			: 1,
				"times.datetime"			: 1,
				"times.rank"					: 1,
				"times.sido"					: 1,
				"times.timeID"				: 1,
				"times.athleteID"			: 1,
				"times.ageGroup"			: 1,
				"times.teamID"				: 1,
				"times.competitionID"	: 1,
				"times.poolID"				: 1,
				"times.pool"					: 1,
				"times.team"					: 1,
				"times.competitionName"	: 1,
			}
		},
		{ $sort: { gender:1, style:1, course:1, distance:1, timeStamp:1 } },
	];
	//----------------------------------------------------------------
	const result = await mongodb.aggregate(mongoCFG.Medalbank.times, aggregate)
	const count = await mongodb.count(mongoCFG.Medalbank.times, query)
	//----------------------------------------------------------------
	return { leaderboards: result.data, count: count };
}
	
exports.getLeaderboardFromTimes = async (body) => {
	//----------------------------------------------------------------
	const times = await this.getTimesForLeaderboard(body); // { leaderboards, count }
	//----------------------------------------------------------------
	// console.log("+++++++++++++++++>", result.competitions.slice(0, 2), result.teams.slice(0, 2), result.data.length);

	const utilTime = new TimeLibrary();
	// leaderboard: {"dicipline" : {gender, style, course, distance, times: [ { rank, name, time, timeID, athleteID, poolID, competitionID } ] },
	const leaderboard = times.reduce((arr, leaderboard) => {
															const timeArr = leaderboard.times.reduce((arr, time) => {
																	const value = {
																		athleteID: time.athleteID,
																		name: time.name,
																		time: time.time,
																		timeStamp: time.timeStamp,
																		rank: time.rank,
																		sido: time.sido || "",
																		datetime: time.datetime,
																	}
																	arr.push(value);
																	return arr;
																}, []);
																const times = utilTime.assignRanks(timeArr);
																const discipline = {
																	gender	: leaderboard.discipline.gender,
																	style		: leaderboard.discipline.style,
																	course	: leaderboard.discipline.course,
																	distance: leaderboard.discipline.distance,
																	times		: times.reduce((arr, time) => {
																							const value = {
																								rank: time.rank,
																								athleteID: time.athleteID,
																								name: time.name,
																								time: time.time,
																								timeStamp: time.timeStamp,
																								rank: time.rank,
																								diffs: time.diffs,
																								sido: time.sido || "",
																								datetime: time.datetime.toISOString().slice(0, 10),
																							}
																							arr.push(value);
																							return arr;
																						}, []),
																}
																arr.push(discipline);
																return arr;
															},[]);
	return leaderboard;
}

	
exports.buildLeaderboard = async (body) => {
	//----------------------------------------------------------------
	const times = await this.getTimesForLeaderboard(body); // { leaderboards, count }
	//----------------------------------------------------------------
	// console.log("+++++++++++++++++>", result.competitions.slice(0, 2), result.teams.slice(0, 2), result.data.length);

	// const body = { startDate: "2024-07-07", endDate: "2024-11-10", type: "week", timeEvent: "event"};
	const startDate = new Date(body.startDate);
	const group = body.type;
	const year 	= startDate.getFullYear();
	const month = group == "year" ? 0 : startDate.getMonth() + 1;
	const week 	= group != "week" ? 0 : startDate.g();
	const day 	= group != "day" 	? 0 : startDate.getDate();
	console.log(body, startDate, group, year, month, week, day);
	
	let lid = await mongodb.max(mongoCFG.Medalbank.leaderboard, "lid", {});

	const utilTime = new TimeLibrary();
	// leaderboard: {"dicipline" : {gender, style, course, distance, times: [ { rank, name, time, timeID, athleteID, poolID, competitionID } ] },
	const leaderboard = times.reduce((arr, leaderboard) => {
															const timeArr = leaderboard.times.reduce((arr, time) => {
																	const value = {
																		timeID				: time.timeID,
																		athleteID			: time.athleteID,
																		name					: time.name,
																		time					: time.time,
																		timeStamp			: time.timeStamp,
																		competitionID	: time.competitionID,
																		poolID				: time.poolID,
																		teamID				: time.teamID,
																		ageGroup			: time.ageGroup,
																		rank					: time.rank,
																		isAdult				: time.isAdult ?? true,
																		isOfficial		: time.isOfficial ?? true,
																		datetime			: time.datetime,
																	}
																	arr.push(value);
																	return arr;
																}, []);
																const times = utilTime.assignRanks(timeArr);
																const discipline = {
																	gender	: leaderboard.discipline.gender,
																	style		: leaderboard.discipline.style,
																	course	: leaderboard.discipline.course,
																	distance: leaderboard.discipline.distance,
																	times		: times.reduce((arr, time) => {
																							const value = {
																								lid						: lid++,
																								group					: group,
																								year					: year,
																								month					: month,
																								day						: day,
																								timeID				: time.timeID,
																								athleteID			: time.athleteID,
																								isAdult				: time.isAdult,
																								isOfficial		: time.isOfficial,
																								ageGroup			: time.ageGroup,
																								name					: time.name,
																								time					: time.time,
																								diffs					: time.diffs,
																								timeStamp			: time.timeStamp,
																								rank					: time.rank,
																								rankGroup			: time.rankGroup,

																								competitionID	: time.competitionID,
																								poolID				: time.poolID,
																								teamID				: time.teamID,

																								datetime			: time.datetime.toISOString().slice(0, 10),
																							}
																							arr.push(value);
																							return arr;
																						}, []),
																}
																arr.push(discipline);
																return arr;
															},[]);
	// Transform the data to show all records
const leaderboards = leaderboard.flatMap(entry => {
																	const { gender, style, course, distance, times } = entry;

																	// Add parent fields to each time record
																	return times.map(time => {
																		const value = {
																			lid						: lid++,
																			group					: group,
																			year					: year,
																			month					: month,
																			day						: day,
																			timeID				: time.timeID,
																			athleteID			: time.athleteID,
																			isAdult				: time.isAdult,
																			isOfficial		: time.isOfficial,
																			ageGroup			: time.ageGroup,
																			name					: time.name,
																			gender,
																			style,
																			course,
																			distance,
																			time					: time.time,
																			diffs					: time.diffs,
																			timeStamp			: time.timeStamp,
																			rank					: time.rank,
																			rankGroup			: time.rankGroup,

																			competitionID	: time.competitionID,
																			poolID				: time.poolID,
																			teamID				: time.teamID,

																			datetime			: time.datetime,
																		};
																		if (value.month == 0) delete value.month;
																		if (value.week 	== 0) delete value.week;
																		if (value.day 	== 0) delete value.day;
																		return value;
																	});
																});
	if (leaderboards.length > 0) {
		const query = { group: group, year: year };
		if (month > 0) query.month= month;
		if (week 	> 0) query.week = week;
		if (day 	> 0) query.day 	= day;
		console.log("query=", query);
		await mongodb.deleteMany(mongoCFG.Medalbank.leaderboard, query)
		await mongodb.insertMany(mongoCFG.Medalbank.leaderboard, leaderboards)
	}
	return leaderboards;
}