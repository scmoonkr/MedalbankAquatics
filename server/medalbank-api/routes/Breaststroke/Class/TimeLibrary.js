const _    			= require('lodash');
const fs    = require('fs');
const moment    = require('moment');
const mskCFG 		= require('../Config/mskCFG.js');
const mongoCFG 	= require('../Config/mongoCFG.js');
const mongoDB		= require('../Class/MongoDB.js');
const mongodb 	= new mongoDB(mongoCFG.Medalbank.database);
const UtilDate		= require("../Class/DateLibrary.js");
const utilDate		= new UtilDate();

const MemoryDB	= require("./MemoryDB.js");
const memoryDB	= new MemoryDB();

// const {setCompetitionTeamPool}		= require("./leaderboard.library.js");

'use strict';

/*******************************************************
 * 
 * leaderboard library
 * 
 *******************************************************/
class TimeLibrary {
	constructor(times=[]) {
		this._timeArr = times;
		// this._leaderboard = {};
		// this._leaderboardArr= [];
	}
	//-----------------------------
	// getter
	//-----------------------------
	get times() 				{ return this._timeArr; }
	// get leaderboards() 	{ return this._leaderboardOBJ; }

	//-----------------------------
	set times(times)   { this._timeArr = times; }
	//-----------------------------

	// teamID가 없을경우 임의로 teamID부여
	setTimesAthleteIDTeamID = (times) => {
		const names = [];
		const teamNames = [];
		times.forEach(tm => {
			if (tm.team && (tm.teamID == undefined || tm.teamID == 0)) {
				const index = teamNames.findIndex(el => el == tm.team);
				if (index < 0) {
					teamNames.push(tm.team);
					tm.teamID = 900000000000 + teamNames.length;
				} else {
					tm.teamID = 900000000001 + index;
				}
			}
			// if (tm.team && (tm.athleteID == undefined || tm.athleteID == 0)) {
			// 	const index = names.findIndex(el => el == tm.name);
			// 	if (index < 0) {
			// 		names.push(tm.name);
			// 		tm.athleteID = 900000000000 + names.length;
			// 	} else {
			// 		tm.athleteID = 900000000001 + index;
			// 	}
			// }
		})
		// console.log(times.slice(0, 10));
		return times;
	}
	//--------------------------------------
	// times에서 competition, pool, team정보를 별도로 만들고
	// times에는 competitionID, teamID, poolID만 남김
	//--------------------------------------
	getCompetitionsPools = (times) => {
		const pools 				= new Map();
		const competitions 	= new Map();

		const restructuredTimes = times.map(time => {
			// Collect unique pools
			if (time.poolID) {
				const pool = memoryDB.getPool(time.poolID) ?? {};
				// console.log("pool=", memoryDB.poolOBJ, time.poolID);
				pools.set(time.poolID, { poolID: time.poolID, name: pool.fullname ?? pool.name ?? "" });
			}
			
			// Collect unique competitions
			if (time.competitionID) {
				const competition = memoryDB.getCompetition(time.competitionID) ?? {};
				competitions.set(time.competitionID, { 
					competitionID: time.competitionID, 
					name:  competition.fullname ?? '', // time.competitionName,
					// datetime: new Date(competition.dateStart).toISOString().slice(0, 10),
				});
			}
			
			// Remove redundant fields from time object
			const { pool, competitionName, ...cleanTime } = time;
			cleanTime.datetime = cleanTime.datetime ? new Date(cleanTime.datetime).toISOString().slice(0, 10) : "";
			return cleanTime;
		});
		// console.log("restructuredTimes=", restructuredTimes.length);
	
		return {
			times				: restructuredTimes,
			compression	: {
				pools				: Array.from(pools.values()),
				competitions: Array.from(competitions.values())
			}
		};
	}

	getCompetitionsTeamsPools = (times) => {
		const pools 				= new Map();
		const teams 				= new Map();
		const competitions 	= new Map();
		// console.log("memoryDB.teams=", memoryDB.teamOBJ);

		// teamID가 없을경우 임의로 teamID부여
		// const teamNames = [];
		// times.forEach(tm => {
		// 	if (tm.team && !tm.teamID) {
		// 		if (!teamNames.includes(tm.team)) {
		// 			teamNames.push(tm.team);
		// 			tm.teamID = 100000 + teamNames.length;
		// 		}
		// 	}
		// })
		// times = this.setTimesAthleteIDTeamID(times);

		const restructuredTimes = times.map(time => {
			// Collect unique pools
			if (time.poolID) {
				const pool = memoryDB.getPool(time.poolID) ?? {};
				// console.log("pool=", memoryDB.poolOBJ, time.poolID);
				pools.set(time.poolID, { poolID: time.poolID, name: pool.fullname ?? pool.name ?? "" });
			}
			
			// Collect unique teams
			if (time.teamID) {
				if (time.teamID < 10000 && time.team) {
					// const team = { team: time.team, teamID: time.teamID } ; // memoryDB.getTeam(time.teamID) ?? {};
					// console.log("team=", team, time.teamID);
					teams.set(time.teamID, { teamID: time.teamID, name:  time.team ??"" });
				} else {
					teams.set(time.teamID, { teamID: time.teamID, name:  time.team ??"" });
				}
			}
			
			// Collect unique competitions
			if (time.competitionID) {
				const competition = memoryDB.getCompetition(time.competitionID) ?? {};
				competitions.set(time.competitionID, { 
					competitionID: time.competitionID, 
					name:  competition.fullname ?? '', // time.competitionName,
					// datetime: new Date(competition.dateStart).toISOString().slice(0, 10),
				});
			}
			
			// Remove redundant fields from time object
			const { pool, team, competitionName, ...cleanTime } = time;
			cleanTime.datetime = cleanTime.datetime ? new Date(cleanTime.datetime).toISOString().slice(0, 10) : "";
			return cleanTime;
		});
	
		return {
			times				: restructuredTimes,
			compression	: {
				pools				: Array.from(pools.values()),
				teams				: Array.from(teams.values()),
				competitions: Array.from(competitions.values())
			}
		};
	}

	//--------------------------------------
	// times의 competition, pool, team정보를 memoryDB를 이용해 set
	//--------------------------------------
	setCompetitionTeamPool(times) {
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

	getLeaderboard = async (query, limit=8, skip=0) => {	
		query.timeStamp = { $gt: 0 };
		delete query.group;

		query.isAdult = true;
		query.isMasters = true;

		const aggregate = [
			{ $match: query }, // 선수별 최고 기록 추출			
			{ $facet: {
					
				// 전체 row 개수 계산
				totalRowCount: [ { $count: "count" } ],					
				
				data: [
						// 1. timeStamp로 정렬
						{ $sort: { timeStamp: 1 } },
						// 2. 이름별로 첫 번째 레코드(가장 좋은 기록) 선택
						{ $group: {
								_id: "$name",
								bestRecord: { $first: "$$ROOT" }
							}
						},
						// 3. 결과 구조 정리
						{ $project: {
								_id: 0,
								timeID					: "$bestRecord.timeID",
								athleteID				: "$bestRecord.athleteID",
								name						: "$bestRecord.name",
								time						: "$bestRecord.time",
								timeStamp				: "$bestRecord.timeStamp",
								rank						: "$bestRecord.rank",
								datetime				: "$bestRecord.datetime",
								thumbnail				: "$bestRecord.thumbnail",
								sido						: "$bestRecord.sido",
								ageGroup				: "$bestRecord.ageGroup",
								competitionID		: "$bestRecord.competitionID",
								competitionName	: "$bestRecord.competitionName",
								poolID					: "$bestRecord.poolID",
								pool						: "$bestRecord.pool",
								teamID					: "$bestRecord.teamID",
								team						: "$bestRecord.team",
							}
						},
						// 4. 기록 순으로 정렬
						{ $sort	: { timeStamp: 1 } },
						{ $skip	: skip },
						{ $limit: limit }
					]
				}
			},
		
			// 7. totalRowCount 값을 result와 병합
			{ $project: {
					count	: { $arrayElemAt: ["$totalRowCount.count", 0] },
					data	: 1
				}
			}
		];

		const result = await mongodb.aggregate(mongoCFG.Medalbank.times, aggregate);
		if (result.data.length == 0) return { message: "no data", times: [], count: 0 };
		
		// rank 부여
		const assignTimes = this.assignRanksMedalbank(result.data[0].data);

		// 대회명, 팀명, 수영장명 추출
		const { times, compression } = this.getCompetitionsTeamsPools(assignTimes);

		const returnObj = {
			count	: result.data[0].count,
			data	: {
				times				: times,
				compression	: compression,
			},
		};

		return returnObj;
	}



	getTimesForLeaderboardTop1 = async (body) => {
		const query = {
			style					: { $in: ["freestyle", "backstroke", "breaststroke", "butterfly", "individualMedley"] },
			course				: "LCM",
			type					: "event",
			distance			: { $in: ["50M", "100M", "200M", "400M", "800M", "1500M"] },
			gender				: { $in: [ "men", "women" ] }, 
			timeStamp			: { $gt: 0 },
			isMasters			: true,
			isAdult				: true,
			$or						: [ { status: { $exists: false } },{ status: "" }, ],
			fin						: { $exists: false },
		};
		let result = await this.getTimesForLeaderboardNew(query, 1); // { leaderboards, count }
		const timeArr = result.leaderboards.reduce((arr,lead) => {
																	if (lead.times.length > 0) {
																		lead = { ...lead, ...lead.times[0] };
																		delete lead.times;
																		arr.push(lead);
																	}
																	return arr;
																}, []);
		const assignTimes = this.assignRanksMedalbank(timeArr);

		// const comp = LeaderboardUTIL.getCompetitionsTeamsPools(times);
		const { times, compression } = this.getCompetitionsTeamsPools(assignTimes);
		return { times, compression };
	}
	//------------------------------------------
	// times에서 leaderboard를 생성하는 함수
	//		body.startDate, body.endDate: leaderboard의 범위
	//		body.limit: 상위 limit개의 leaderboard만 생성
	//------------------------------------------
	/**
	 * 
	 * @param {*} body : 
	 * 	body.type: time | event | club	
	 * 	body.group: 'all|year|month|week|day|period'
	 * 	body.date: start date
	 * 	body.dateTo: end date
	 * 	body.limit: number
	 * @returns 
	 */
	getTimesForLeaderboardTopNew = async (body) => {
		const query = {
			// $and					: [
			// 	{ $or				: [
			// 			{ style	: "individualMedley", distance: "200M" }, 
			// 			{ style	: { $in: ["freestyle", "backstroke", "breaststroke", "butterfly"]}, distance: "50M" }
			// 		],
			// 	},
			// 	{ $or 			: [{ status: "" }, { status: { $exists: false } }], }
			// ],
			timeStamp			: { $gt: 0 },
			isMasters			: true,
			isAdult				: true,
		}
		
		// time | event | club
		if (body.type	 		) query.type		= body.type;
		if (body['$and']	) query['$and']		= body['$and'];
		if (body['$or']	 	) query['$or']		= body['$or'];

		// all|year|month|week|day|period
		if (body.group	 	) {
			const dateQuery = mongodb.makeDateQuery(body.type, body.date, body.dateTo);
			if (Object.keys(dateQuery).length > 0) query.datetime = dateQuery;
		}

		// style
		if (body.style	 	) query.style			= body.style;
		if (body.gender	 	) query.gender		= body.gender;
		if (body.course	 	) query.course		= body.course;
		if (body.distance	) query.distance	= body.distance;
		if (body.ageGroup	) query.ageGroup 	= body.ageGroup;
		if (body.sido		 	) query.sido			= body.sido;

		const result = await this.getTimesForLeaderboardNew(query, Number(body.limit??8)); // { leaderboards, count }
		const times = result.leaderboards.reduce((arr,lead) => {
																			lead.times = this.assignRanksMedalbank(lead.times);
																			arr.push(lead);
																			return arr;
																		}, []);
		return { leaderboards: result.leaderboards, count: result.count };
	}

	getTimesForLeaderboardNew = async (query, limit=8, skip=0) => {
		limit = Number(limit);
// console.log("getTimesForLeaderboard--------------------->", query, limit, skip);
		const aggregate = [
			{ $match: query },
			// 1단계: timeStamp 기준으로 먼저 정렬 (가장 좋은 기록이 먼저 오도록)
			{
					$sort: { 
							timeStamp: 1,  // 가장 좋은 기록 먼저
							name: 1,       // 동일 timeStamp일 때 이름순
							style: 1,
							gender: 1, 
							distance: 1
					}
			},
			
			{
					$group: {
							_id: {
									name: "$name",
									style: "$style",
									gender: "$gender",
									distance: "$distance"
							},
							bestRecord: { $first: "$$ROOT" }
					}
			},
			
			// 2단계: style, gender, distance별로 그룹화하여 상위 10개 선택
			{
					$group: {
							_id: {
									style: "$bestRecord.style",
									gender: "$bestRecord.gender", 
									distance: "$bestRecord.distance"
							},
							records: { $push: "$bestRecord" }
					}
			},
			
			// 5단계: 각 그룹 내에서 timeStamp 기준으로 정렬하여 상위 10개 선택
			{
					$unwind: "$records"
			},
			
			{
					$sort: {
							"records.timeStamp": 1
					}
			},
			
			// 6단계: 다시 그룹화하여 상위 10개만 선택
			{
					$group: {
							_id: {
									style: "$_id.style",
									gender: "$_id.gender",
									distance: "$_id.distance"
							},
							topRecords: { $push: "$records" }
					}
			},
			
			{
					$project: {
							style: "$_id.style",
							gender: "$_id.gender", 
							distance: "$_id.distance",
							times: { $slice: ["$topRecords", 10] },
							_id: 0
					}
			},
			
			// 7단계: 필요한 필드만 선택
			{
					$project: {
							style: 1,
							gender: 1,
							distance: 1,
							"times.name": 1,
							"times.time": 1,
							"times.timeStamp": 1,
							"times.datetime": 1,
							"times.thumbnail": 1,
							"times.rank": 1,
							"times.sido": 1,
							"times.timeID": 1,
							"times.athleteID": 1,
							"times.ageGroup": 1,
							"times.teamID": 1,
							"times.competitionID": 1,
							"times.poolID": 1,
							"times.pool": 1,
							"times.team": 1,
							"times.competitionName": 1
					}
			},
			
			// 8단계: 결과 정렬 (선택사항)
			{
					$sort: {
							style: 1,
							gender: 1,
							distance: 1
					}
			}
		];
		//----------------------------------------------------------------
		const result 	= await mongodb.aggregate(mongoCFG.Medalbank.times, aggregate)
		const count 	= await mongodb.count(mongoCFG.Medalbank.times, query)
		//----------------------------------------------------------------
		// gender-style-course-distance
		result.data.forEach(leaderboard => {
			leaderboard.times.forEach(el => {
				el.course = "LCM";
			})
		});
		console.log(result.data[0].times);
		console.log(JSON.stringify(aggregate, null, 2));

		result.data = result.data.reduce((arr,lead) => {
																lead.times = this.assignRanksMedalbank(lead.times);
																arr.push(lead);
																return arr;
															}, []);

		return { leaderboards: result.data, count: count };
	}
	//##############################################################
	//######################## confirm #############################
	//##############################################################
	//---------------------------------------------
	//	해당 times에서 athleteID를 가져온다.
	//	times: 
	//	imported: 등록된 athleteID
	// times: [{timeID, name, gender, style, course, distance}]
	// imported: [{timeID, athleteID}]
	//---------------------------------------------
	updateAthleteIDs = (times, imported) => {
		// imported의 timeID를 키로 하는 Map 생성 (검색 효율을 위해)
		// const importedMap = new Map(
		// 	imported.map(item => [item.timeID, item.athleteID])
		// );
		// 또는 더 명확하게 표현하면
		const importedMap = new Map(
			imported.map(item => {
				return [item.timeID, item.athleteID];  // 키-값 쌍을 배열로 반환
			})
		);
	
		// times 배열의 각 항목 업데이트
		return times.map(time => {
			let aid = importedMap.get(time.timeID) ?? 0;
			const tm = {
				...time,
				athleteID: aid == 0 ? (!time.athleteID || time.athleteID > 10000 ? 0 : time.athleteID) : aid,
			}
			return tm;
		});
		
	}
	
	/**
	 * times에서 미등록된 선순,ㄴ athleteID=0
	 * @param {*} times 
	 * @returns 
	 */
	checkRegisteredAthlete = async (times) => {
		const timeIDs = [...new Set(times.map((item) => item.timeID))];
			// console.log("timeIDs=", timeIDs);

			const context = {
				query			: { timeID: { $in: timeIDs }, },
				projection: { _id:0, timeID:1, athleteID:1 },
				limit			: 200000,
				skip			: 0,
				// sort 			: { datetime: 1, }
			}
			const athlete = await mongodb.find(mongoCFG.Medalbank.times, context);
			
			// console.log("----->", athlete.data);
			return await new TimeLibrary().updateAthleteIDs(times, athlete.data);
	}

	/**
	 * times를 읽어서 times_medalbank에 import된 time에 import:true
	 * @param {*} times 
	 * @returns 
	 */
	async checkImported(times) {
		const timeIDs = times.map(el => el.timeID);
		// console.log("imported times:", timeIDs.length);
		const context = {
			query			: { timeID: { $in: timeIDs} },
			projection: { _id:0, timeID:1,},
			limit			: 200000,
			skip			: 0,
			// sort 			: { datetime: 1, }
		}
		const result = await mongodb.find(mongoCFG.Medalbank.times, context);
		const importedIDs = result.data.map(el => el.timeID);

		return times.reduce((arr, time) => {
									if (importedIDs.includes(time.timeID)) {
										time.imported = true;
									}
									arr.push(time);
									return arr;
								},[]);
	}
	/**
	 * times를 이용하여 competition에 통계 정보를 추가합니다.
	 * @param {*} times 
	 * @returns 
	 */
	async makeCompetitionsStatistics(times, timeLimit=32) {
		times = await this.checkImported(times);
		// const context = {
		// 	query			: { competitionID: competitionID },
		// 	projection: { _id:0, timeID:1, athleteID:1, teamID:1, name:1, competitionID:1, style:1, gender:1, times:1, time:1, rank:1, course:1, distance:1, ageGroup:1, datetime:1},
		// 	limit			: 200000,
		// 	skip			: 0,
		// 	// sort 			: { datetime: 1, }
		// }
		// const timeIDs = [];
		// const result = await mongodb.find(mongoCFG.Medalbank.times, context);
		times = times.reduce((arr, time) => {
										// timeIDs.push(time.timeID);
										// const competition = memoryDB.getCompetition(time.competitionID);
										const value = {
											athleteID				: time.athleteID,
											timeID					: time.timeID || 0,
											name						: time.name || "",
											gender					: time.gender || "",
											ageGroup				: time.ageGroup || "",
											// ageGroupCode		: body.ageGroup ?? "",
											sido						: time.sido || "",
											style						: time.style || "",
											course					: time.course || "",
											distance				: time.distance || "",
											time						: time.time || "",
											timeStamp				: time.timeStamp || 0,
											rank						: time.rank,
											isAdult					: time.adult || true,
											isOfficial			: time.competitionID ? true : false,
											// diffs						: time.diffs || "",
											
											teamID					: time.teamID || 0,
											poolID					: time.poolID || 0,
											competitionID		: time.competitionID || 0,

											team						: time.team || "",
											competitionName	: time.competitionName,
											pool						: time.pool || "",
											thumbnail				: time.thumbnail || "",
											datetime				: new Date(time.datetime),

											type						: "event",
										}
										if (time.imported) {
											value.imported = time.imported;
											// console.log("imported:", value.name);
										}
										arr.push(value);
										return arr;
									}, []);
		console.log("1>times=", times.length);
		if (times.length == 0) return {};
		
		const athleteIDs		= [...new Set(times.map((item) => item["athleteID"]).map(entry => entry))]

		const statistics = {
			competitionID	: times[0].competitionID,
			timeCount			: times.length,						// time count
			// eventTimeCount: times.length,						// event time count
			athleteCount	: athleteIDs.length,			// event time count
		};

		// statistics.majorStyles  		= this.getStylesByCount(times);
		statistics.styleDistances		= this.getDistance4GenderStyle(times); // gender-style, 50M, 100M, 200M, ...
		statistics.ageGroups				= this.getAgeGroupByCount(times, 100);
		statistics.bestTimes				= this.findBestTime(times, timeLimit);
		// statistics.records					= this.makeSeriesTop1(times, 8);

		statistics.teams        		= this.getTeamsMedalsPoints(times, 100);
		statistics.medals       		= this.calculateMedals(times);
		
		return statistics;
	}

	/**
	 * times를 이용하여 competition에 통계 정보를 추가합니다.
	 * @param {*} times 
	 * @returns 
	 */
	async makeStemsStatistics(times) {
		times = await this.checkImported(times);
		// const context = {
		// 	query			: { competitionID: competitionID },
		// 	projection: { _id:0, timeID:1, athleteID:1, teamID:1, name:1, competitionID:1, style:1, gender:1, times:1, time:1, rank:1, course:1, distance:1, ageGroup:1, datetime:1},
		// 	limit			: 200000,
		// 	skip			: 0,
		// 	// sort 			: { datetime: 1, }
		// }
		// const timeIDs = [];
		// const result = await mongodb.find(mongoCFG.Medalbank.times, context);
		times = times.reduce((arr, time) => {
										// timeIDs.push(time.timeID);
										const value = {
											athleteID				: time.athleteID,
											timeID					: time.timeID || 0,
											name						: time.name || "",
											gender					: time.gender || "",
											ageGroup				: time.ageGroup,
											// ageGroupCode		: body.ageGroup ?? "",
											style						: time.style || "",
											course					: time.course || "",
											distance				: time.distance || "",
											time						: time.times || "",
											timeStamp				: time.time || 0,
											rank						: time.rank,
											isAdult					: time.adult || true,
											isOfficial			: time.competitionID ? true : false,
											// diffs						: time.diffs || "",
											
											teamID					: time.teamID || 0,
											poolID					: time.poolID || 0,
											competitionID		: time.competitionID || 0,

											team						: time.team || "",
											competitionName	: time.competitionName,
											pool						: time.pool || "",
											thumbnail				: time.thumbnail || "",
											datetime				: new Date(time.datetime),

											type						: "event",
										}
										arr.push(value);
										return arr;
									}, []);
		console.log("times=", times.length);
		if (times.length == 0) return {};
		
		const athleteIDs		= [...new Set(times.map((item) => item["athleteID"]).map(entry => entry))]

		return this.findBestTime(times, 64);
	}

	async makeSeriesTop1(stemIDs) {
		const aggregate = [
			{ $match: { competitionID: { $in: stemIDs } } },
			{ $group: {
					_id: {
						gender	: "$gender",
						style		: "$style",
						course	: "$course",
						distance: "$distance"
					},
					bestRecord: { $min: "$time" }, // 가장 작은 timeStamp를 선택
					record		: { $first: "$$ROOT" } // 가장 작은 record를 저장
				}
			},
			{ $replaceRoot: { newRoot: "$record" } // 선택한 새로운 root입니다.
			},
			{ $sort: { style:1, gender:1, course:1, distance:1 }},
			{ $project: { _id:0, name:1, style:1, gender:1, course:1, distance:1, time:1, times:1, rank:1, ageGroup:1} }
		];
		const result = await mongodb.aggregate(mongoCFG.Medalbank.times, aggregate)
		return result;
	}
	/**
	 * times를 이용하여 athlete에 통계 정보를 추가합니다.
	 * @param {*} times 
	 * @returns 
	 */
	makeAthletesStatistics(times) {
		if (!times || times.length == 0) return {};

		const eventTimes			= times.filter(time => time.competitionID > 0);
		const timeTimes				= times.filter(time => time.competitionID == undefined || time.competitionID == 0);

		// const allAthleteIDs		= [...new Set(times.map((item) => item["athleteID"]).map(entry => entry))]
		// const eventAthleteIDs	= [...new Set(eventTimes.map((item) => item["athleteID"]).map(entry => entry))]
		// const timeAthleteIDs	= [...new Set(timeTimes.map((item) => item["athleteID"]).map(entry => entry))]

		const statistics = {
			athleteID					: times[0].athleteID,
			timeCount					: times.length,						// time count
			// athleteCount			: allAthleteIDs.length,		// athlete count
			timeTimeCount			: timeTimes.length,				// event time count
			// timeAthleteCount	: timeAthleteIDs.length,	// event athlete count
			eventTimeCount		: eventTimes.length,			// event time count
			// eventAthleteCount	: eventAthleteIDs.length,	// event athlete count
		};

		statistics.majorStyles  		= this.getStylesByCount(times);
		statistics.competitions 		= this.getCompetitionsByCount(times, 32);
		statistics.teams        		= this.getTeamsByCount(times, 32);
		statistics.pools        		= this.getPoolsByCount(times, 32);
		statistics.cities       		= this.getSidosByCount(times, 32);  
		// statistics.medals       		= this.countMedalsByStyleAndGender(times);
		statistics.medals       		= this.calculateMedals(times);

		statistics.firstEvent				= this.findFirstTime(eventTimes);
		statistics.latestEvent			= this.findLatestTime(eventTimes);
		statistics.bestEvent				= this.calculateBestTimeWithSeason(eventTimes);

		statistics.firstTime				= this.findFirstTime(timeTimes);
		statistics.latestTime				= this.findLatestTime(timeTimes);
		statistics.bestTime					= this.calculateBestTimeWithSeason(timeTimes);
		statistics.timekeeper				= this.getTimekeepersByCount(timeTimes);

		
		return statistics;
	}
	

	/**
	 * 기록(time)으로 athletesStatisticsMB 업데이트
	 * @param {*} time 
	 * @returns 
	 */
	async updateAthleteStatistics(time) {

		const statistics = {};

		// 현재 연도와 시즌 여부 체크
		const currentYear = new Date().getFullYear();
		const isSeason = currentYear == new Date(time.datetime).getFullYear();

		const datetime = new Date(time.datetime).toISOString().slice(0, 10);


			//--------------------------------------------
			// 9. bestEvent, bestTime
			//--------------------------------------------
			let index;
			let best = time.competitionID > 0 ? statistics.bestEvent : statistics.bestTime;
			index = best.findIndex(item => item.style == time.style && item.course == time.course && item.distance == time.distance);
			if (index < 0) {
				// 새로운 종목 기록 추가
				const obj = {
					style					: time.style,
					course				: time.course,
					distance			: time.distance,
					timeCount			: 1,
					seasonTimeCount: 0,
					average				: time.time,
					// averageSeason	: time.time,
					best: {
						timeID		: time.timeID,
						time			: time.time,
						datetime	: time.datetime,
					},
					bestSeason: {},
				};
				// 시즌 기록인 경우 시즌 최고기록 추가
				if (isSeason) {
					obj.averageSeason = time.time;
					obj.seasonTimeCount = 1;
					obj.bestSeason = {
						timeID		: time.timeID,
						time			: time.time,
						datetime	: time.datetime,
					}
					best.push(obj);
				}
			} else {
				let timeStamp = utilDate.convertString2Timestamp(time.average);

				// 평균 타임 계산
				let sum = utilDate.convertString2Timestamp(best[index].average) * best[index].timeCount
									+ time.timeStamp;
									best[index].timeCount++;
				best[index].average = utilDate.convertTimestamp2string(sum / best[index].timeCount);
				
				// 평균 기록 계산
				if (isSeason) {
					let sum = utilDate.convertString2Timestamp(best[index].averageSeason) * best.seasonTimeCount
																+ time.timeStamp;
					best[index].seasonTimeCount++;
					best[index].average = utilDate.convertTimestamp2string(sum / seasonTimeCount);
					best.seasonTimeCount++;
				}

				// check best updated
				if (best[index].best.time > time.time) {
					best[index].best = {
						timeID: time.timeID,
						time: time.time,
						datetime: new Date(time.datetime).toISOString().slice(0, 10),
					};
				}
				// check season best updated
				if (!best[index].bestSeason.time || best[index].bestSeason.time > time.time) {
					best[index].bestSeason = {
						timeID: time.timeID,
						time: time.time,
						datetime: new Date(time.datetime).toISOString().slice(0, 10),
					};
				}
				if (time.competitionID > 0) {
					statistics.bestEvent = best;
				} else {
					statistics.bestTime = best;
				}
			}

		// 1. timeCount, timeTimeCount, 
		statistics.timeCount++;;
		// check event, time
		if (time.competitionID) { // event
			statistics.eventTimeCount++;;
			
			//--------------------------------------------
			// 3. competition 추가
			//--------------------------------------------
			if (time.competitionID) {
				const competitionID = Number(time.competitionID);
				// ID인 대회의 인덱스 찾기
				index = statistics.competitions.findIndex(item => item.competitionID == competitionID);
				if (index < 0) {
					const medals = { gold: 0, silver: 0, bronze: 0 };
					switch (time.rank) {
						case 1: medals.gold = 1; break;
						case 2: medals.silver = 1; break;
						case 3: medals.bronze = 1; break;
					} 
					statistics.competitions.push({
						competitionID	: competitionID,
						medals				: medals,
						count					: 0,
					});	
				} else {
					statistics.competitions[index].medals = statistics.competitions[index].medals ?? {};
					switch (time.rank) {
						case 1: statistics.competitions[index].medals.gold = 1; break;
						case 2: statistics.competitions[index].medals.silver = 1; break;
						case 3: statistics.competitions[index].medals.bronze = 1; break;
					} 
				}
			}

			//--------------------------------------------
			// 7. first가 없으면 추가
			//--------------------------------------------
			if (!statistics.firstEvent) {
				statistics.firstEvent = {
					competitionID	: time.competitionID,
					poolID				: time.poolID,
					timeID				: time.timeID,
					time					: time.time,
					// timeStamp			: time.timeStamp,
					// rank					: time.rank,
					style					: time.style,
					course				: time.course,
					distance			: time.distance,
				}
				if (time.rank) statistics.firstEvent.rank = time.rank;
				if (time.teamID) statistics.firstEvent.teamID = time.teamID;
			}
			//--------------------------------------------
			// 7. latest
			//--------------------------------------------
			if (!statistics.latestEvent || statistics.latestEvent.datetime < datetime) {
				statistics.latestEvent = {
					competitionID	: time.competitionID,
					poolID				: time.poolID,
					timeID				: time.timeID,
					// teamID				: time.teamID,
					time					: time.time,
					// timeStamp			: time.timeStamp,
					// rank					: time.rank,
					style					: time.style,
					course				: time.course,
					distance			: time.distance,
					datetime			: time.datetime,
					thumbnail			: time.thumbnail,
				}
				if (time.rank) statistics.latestEvent.rank = time.rank;
				if (time.teamID) statistics.latestEvent.teamID = time.teamID;
			}

		} else { // time
			statistics.timeCount++;
			//--------------------------------------------
			// 7. first가 없으면 추가
			//--------------------------------------------
			if (!statistics.firstTime || !statistics.firstTime.timeID) {
				statistics.firstTime = {
					poolID				: time.poolID,
					timeID				: time.timeID,
					time					: time.time,
					// timeStamp			: time.timeStamp,
					// rank					: time.rank,
					style					: time.style,
					course				: time.course,
					distance			: time.distance,
				}
				if (time.rank) statistics.firstTime.rank = time.rank;
				if (time.teamID) statistics.firstTime.teamID = time.teamID;
			}
			//--------------------------------------------
			// 7. latest
			//--------------------------------------------
			if (!statistics.latestTime || !statistics.latestTime.datetime || statistics.latestTime.datetime < datetime) {
				statistics.latestTime = {
					poolID				: time.poolID,
					timeID				: time.timeID,
					time					: time.time,
					// timeStamp			: time.timeStamp,
					// rank					: time.rank,
					style					: time.style,
					course				: time.course,
					distance			: time.distance,
					datetime			: time.datetime,
					thumbnail			: time.thumbnail,
				}
				if (time.rank) statistics.latestTime.rank = time.rank;
				if (time.teamID) statistics.latestTime.teamID = time.teamID;
			}
		}



		
		//--------------------------------------------
		// 2. majorStyles
		//--------------------------------------------	
		// style 인덱스 찾기
		index = statistics.majorStyles.findIndex(item => item.style == time.style);
		if (index < 0) {
			statistics.majorStyles.push({ style: time.style, count: 1, });
		} else {
			statistics.majorStyles[index].count++;
			statistics.majorStyles.sort((a,b)=>b.count-a.count);
		}

		//--------------------------------------------
		// 4. pools
		//--------------------------------------------
		if (time.poolID) {
			const poolID = Number(time.poolID);
			// ID인 pool의 인덱스 찾기
			index = statistics.pools.findIndex(item => item.poolID == poolID);
			if (index < 0) {
				statistics.pools.push({ poolID: poolID, count: 1, });
			} else {
				statistics.pools[index].count++;
			}
			statistics.pools.sort((a,b)=>b.count-a.count);
		}
		//--------------------------------------------
		// 5. teams
		//--------------------------------------------
		if (time.teamID) {
			const teamID = Number(time.teamID);
			// ID인 team의 인덱스 찾기
			index = statistics.teams.findIndex(item => item.teamID == teamID);
			if (index < 0) {
				statistics.teams.push({ teamID: teamID, count: 1, });
			} else {
				statistics.teams[index].count++;
			}
			statistics.teams.sort((a,b)=>b.count-a.count);
		}
		//--------------------------------------------
		// 6. cities
		//--------------------------------------------
		if (time.sido) {
			const sido = time.sido.trim();
			// sido의 인덱스 찾기
			index = statistics.cities.findIndex(item => item == sido);
			if (index < 0) {
				statistics.cities.push({ sido: sido, count: 1, });
			} else {
				statistics.cities[index].count++;
			}
			statistics.cities.sort((a,b)=>b.count-a.count);
		}
		
		//--------------------------------------------
		// 8. timekeeper 추가
		//--------------------------------------------
		if (time.timekeeper && time.timekeeper.athleteID) {
			const timekeeperID = Number(time.timekeeper.athleteID);
			// 같은 athleteID를 가진 객체가 있으면 제거
			statistics.timekeepers = statistics.timekeepers.filter(item => item.athleteID != timekeeperID);
			// athlete 객체를 배열의 0번째에 추가
			statistics.timekeepers.unshift({
				athleteID	: timekeeperID,
				name			: time.timekeeper.name,
				});
		}
		// update athlete
		//--------------------------------------------
		const query = { athleteID: time.athleteID };
		console.log("query=", query, "value=", value);
		//--------------------------------------------
		await mongodb.updateOne(mongoCFG.Medalbank.athletesStatistics, query, value);
		//--------------------------------------------
		return statistics;
	}

	//--------------------------------------
	// style별 count 계산
	//--------------------------------------
	getStylesByCount(times, count=3) {
		if (times.length == 0) return [];
		const counts = _.countBy(times, "style");
    const sorted = Object.entries(counts).map(([data, count]) => ({
																						style: data,
																						count,
																					}))
																					.filter(data => data.style != 'undefined')
																					.sort((a,b) => b.count-a.count)
																					.slice(0, count);

		return sorted;
	}
	getCompetitionsByCount(times, count=3) {
		if (times.length == 0) return [];
		const counts = _.countBy(times, "competitionID");
    const sorted = Object.entries(counts).map(([data, count]) => ({
																						competitionID: Number(data),
																						count,
																						medals: {
																							gold	: times.filter(el => el.competitionID == Number(data) && el.rank == 1).length,
																							silver: times.filter(el => el.competitionID == Number(data) && el.rank == 2).length,
																							bronze: times.filter(el => el.competitionID == Number(data) && el.rank == 3).length,
																						},
																					}))
																					.filter(data => !isNaN(data.competitionID) && data.competitionID != 'undefined')
																					.sort((a,b) => b.count-a.count)
																					.slice(0, count);

		return sorted;
	}

	//--------------------------------------
	// team별 count 계산
	//--------------------------------------
	getTeamsByCount(times, count=3) {
		if (times.length == 0) return [];
		const counts = _.countBy(times, "teamID");
    const sorted = Object.entries(counts).filter(team=> team[0] != 'undefined')
																				 .map(([teamID, count]) => {
																					const tm = times.find(el=>el.teamID==teamID);
																					const t = {
																						teamID: Number(teamID),
																						name: tm?.team || '',
																						count: count,
																					}
																					return t;
																				 })
																					.sort((a,b) => b.count-a.count)
																					.slice(0, count);

		return sorted;
	}
	
	//--------------------------------------
	// team별 gender, medal, point계산 계산
	//--------------------------------------
	getTeamsMedalsPoints(timeArr) {
		timeArr = timeArr.reduce((arr, time) => {
												const value = {
													timeID					: time.timeID || 0,
													athleteID				: time.athleteID || 0,
													name						: time.name || "",
													gender					: time.gender || "",
													ageGroup				: time.ageGroup,
													style						: time.style || "",
													course					: time.course || "",
													distance				: time.distance || "",
													time						: time.times || "",
													timeStamp				: time.time || 0,
													rank						: time.rank,
													teamID					: time.teamID || 0,
													team						: time.team || "",
												}
												arr.push(value);
												return arr;
											}, []);
		const groupedTeam = _.groupBy(timeArr, (entry) => entry.teamID);

		const teamPoints = memoryDB.getTeamPoints();
		// const teamPoints = {
		// 	type: 'teamPoints',
		// 	events: 10,
		// 	season: 10,
		// 	athletes: 10,
		// 	start: 10,
		// 	goldIndividual: 30,
		// 	silverIndividual: 20,
		// 	bronzeIndividual: 10,
		// 	goldTeam: 120,
		// 	silverTeam: 80,
		// 	bronzeTeam: 40
		// };
		// console.log("teamPoints:", teamPoints);
		
		const teams = [];
		//-------------------------
		//-------------------------
		const grouped= Object.entries(groupedTeam).map(([teamID, entries]) => {
			const groupedDiscipline = _.groupBy(entries, (entry) => `${entry.gender}-${entry.ageGroup}-${entry.style}-${entry.distance}`);
			const athleteIDs= [...new Set(entries.map((entry) => entry.athleteID))];
			// const timeCount = entries.length;

			const team = {
				teamID			: Number(teamID),
				name				: groupedTeam[teamID][0].team, // memoryDB.getTeamName(teamID.toString()),
				timeCount		: entries.length,
				athleteCount: athleteIDs.length,
				men					: 0,
				women				: 0,
				mixed				: 0,
				individual	: 0,
				team				: 0,
				FR					: 0,
				BK					: 0,
				BR					: 0,
				BF					: 0,
				IM					: 0,
				gold				: 0,
				silver			: 0,
				bronze			: 0,
				points			: 0,
			}
			//-------------------------
			// discipline(gender-ageGroup-style-distance)별로 그룹화하고, rank별 points 계산
			//-------------------------
			const counts = Object.entries(groupedDiscipline).map(([key, entries1]) => {
															// const [gender, ageGroup, style, distance] = key.split("-");
															const times				= new TimeLibrary().assignRanks(entries1);

															const gold 				= times.filter((entry) => entry.rank === 1).length;
															const silver			= times.filter((entry) => entry.rank === 2).length;
															const bronze			= times.filter((entry) => entry.rank === 3).length;

															const goldTeam 		= times.filter((entry) => entry.style.includes('Relay') && entry.rank === 1).length;
															const silverTeam	= times.filter((entry) => entry.style.includes('Relay') && entry.rank === 2).length;
															const bronzeTeam	= times.filter((entry) => entry.style.includes('Relay') && entry.rank === 3).length;
															
															team.points += goldTeam 		* teamPoints.goldTeam+
																							silverTeam	* teamPoints.silverTeam +
																							bronzeTeam	* teamPoints.bronzeTeam;
															team.points += (gold-goldTeam) 		* teamPoints.goldIndividual+
																							(silver-silverTeam)* teamPoints.silverIndividual +
																							(bronze-bronzeTeam)* teamPoints.bronzeIndividual;
															team.gold 	+= gold;
															team.silver += silver;
															team.bronze += bronze;
														});
			//-------------------------
			team.team					= entries.filter((entry) => entry.style.includes('Relay') ).length;
			team.individual		= team.timeCount - team.team;
			team.FR		= entries.filter((entry) => entry.style == "freestyle" ).length;
			team.BK		= entries.filter((entry) => entry.style == "backstroke" ).length;
			team.BR		= entries.filter((entry) => entry.style == "breaststroke" ).length;
			team.FL		= entries.filter((entry) => entry.style == "butterfly" ).length;
			team.IM		= entries.filter((entry) => entry.style == "individualMedley" ).length;

			// athleteID별 성별 카운트 저장
			const genders = this.countGendersByAthleteID(entries);
			team.men					= genders.men;
			team.women				= genders.women;
			team.mixed				= genders.mixed;
			// team.athleteCount	= genders.total;
			// team.men				= entries.filter((entry) => entry.gender === 'men').length;
			// team.women			= entries.filter((entry) => entry.gender === 'women').length;
			// team.mixed			= entries.filter((entry) => entry.gender === 'mixed').length;

			team.points += team.timeCount * teamPoints.start;
			team.points += team.athleteCount * teamPoints.athletes;
			team.points += teamPoints.events;
			//-------------------------
			teams.push(team);
		});
		//-------------------------

		// sort by points
		teams.sort((a, b) => b.points - a.points);
		
		// rank 부여
		let rank = 1; // Starting rank
		for (let i = 0; i < teams.length; i++) {
			if (i > 0 && teams[i].points !== teams[i - 1].points) {
				rank = i + 1;
			}
			teams[i].rank = rank;
		}	

		return teams;
	}
	// 선수별 성별 등장 횟수 저장
	countGendersByAthleteID(times) {
		// athleteID를 키로 사용하여 선수별 성별 등장 횟수를 저장할 객체
		const athleteGenderCounts = { men:{}, women: {}, mixed: {},};
	
		// 각 기록을 순회하면서 처리
		times.forEach(record => {
			const { athleteID, gender } = record;
			
			// 해당 성별 카운트 증가
			athleteGenderCounts[gender][athleteID] = athleteID;
		});
	
		return {
			men		: Object.keys(athleteGenderCounts.men).length,
			women	: Object.keys(athleteGenderCounts.women).length,
			mixed	: Object.keys(athleteGenderCounts.mixed).length,
		};
	}

	// 선수별 성별 등장 횟수 저장
	countGendersByAthleteID1(times) {
		// athleteID를 키로 사용하여 선수별 성별 등장 횟수를 저장할 객체
		const athleteGenderCounts = {};
	
		// 각 기록을 순회하면서 처리
		times.forEach(record => {
			const { athleteID, gender } = record;
			
			// athleteID가 처음 나온 경우 초기화
			if (!athleteGenderCounts[athleteID]) {
				athleteGenderCounts[athleteID] = {
					men: 0,
					women: 0,
					mixed: 0,
					total: 0,
					athleteName: record.name // 선수 이름도 저장
				};
			}
	
			// 해당 성별 카운트 증가
			athleteGenderCounts[athleteID][gender]++;
			athleteGenderCounts[athleteID].total++;
		});
	
		return athleteGenderCounts;
	}

	//--------------------------------------
	// team별 count 계산
	//--------------------------------------
	getTeamsPoints(times, count=3) {
		if (times.length == 0) return [];
		const counts = _.countBy(times, "teamID");
    const sorted = Object.entries(counts).map(([data, count]) => ({
																						teamID: Number(data),
																						count,
																					}))
																					.filter(data => data.teamID != 'undefined')
																					.sort((a,b) => b.count-a.count)
																					.slice(0, count);

		return sorted;
	}

	//--------------------------------------
	// pool별 count 계산
	//--------------------------------------
	getPoolsByCount(times, count=3) {
		if (times.length == 0) return [];
		const counts = _.countBy(times, "poolID");
    const sorted = Object.entries(counts).map(([data, count]) => ({
																						poolID: Number(data),
																						count,
																					}))
																					.filter(data => data.poolID != 'undefined')
																					.sort((a,b) => b.count-a.count)
																					.slice(0, count);

		return sorted;
	}

	//--------------------------------------
	// sido별 count 계산
	//--------------------------------------
	getSidosByCount(times, count=3) {
		if (times.length == 0) return [];
		const counts = _.countBy(times, "sido");
    const sorted = Object.entries(counts).map(([data, count]) => ({
																						sido: data,
																						count,
																					}))
																					.filter(data => data.sido != 'undefined')
																					.sort((a,b) => b.count-a.count)
																					.slice(0, count);

		return sorted;
	}	

	// 획득 메달 계산(rank : 1,2,3)
	calculateMedals(times) {
		const medals = {
			gold	: 0,
			silver: 0,
			bronze: 0,
		};
		if (times.length == 0) return medals;

		times.forEach((entry) => {
        if (entry.rank === 1) {
					medals.gold++;
        } else if (entry.rank === 2) {
					medals.silver++;
        } else if (entry.rank === 3) {
					medals.bronze++;
        }
    });

		return medals;
	}

	//--------------------------------------
	// 첫번째 가록 가져오기
	//--------------------------------------
	findFirstTime(times) {
		if (times.length == 0) return {};
		const value = _.minBy(times, "datetime");
		const data = {
			timeID    : value.timeID ?? 0,
			time      : value.time,
			timeStamp : value.timeStamp,
			style     : value.style,
			course  	: value.course,
			distance  : value.distance,
			thumbnail  : value.thumbnail ?? '',
			datetime  : utilDate.validateDate(value.datetime)
														? new Date(value.datetime).toISOString().slice(0, 10)
														: "",
		};
		if (value.competitionID > 0) {
			data.competitionID= value.competitionID;
			data.teamID				= value.teamID;
			data.rank					= value.rank;
		} else {
			data.poolID = value.poolID;
		}
		return data;
	}

	//--------------------------------------
	// 최근 기록 가져오기
	//--------------------------------------
	findLatestTime(times) {
		if (times.length == 0) return {};
		const value = _.maxBy(times, "datetime");
		const data = {
			timeID    : value.timeID,
			poolID    : value.poolID,
			time      : value.time,
			timeStamp : value.timeStamp,
			style     : value.style,
			distance  : value.distance,
			datetime  : utilDate.validateDate(value.datetime) ? new Date(value.datetime).toISOString().slice(0, 10) : "",
		};
		if (value.competitionID > 0) {
			data.competitionID= value.competitionID;
			data.rank					= value.rank;
		}
		if (value.teamID > 0) data.teamID = value.teamID;
		return data;
	}

	//--------------------------------------
	// timekeeper별 count 계산
	//--------------------------------------
	getTimekeepersByCount(times, count=3) {
		if (times.length == 0) return [];
		const counts = _.countBy(times, "timekeeperID");
    const sorted = Object.entries(counts).map(([timekeeperID, count]) => ({
																						athleteID: Number(timekeeperID),
																						name: times.find(el => el.timekeeperID == Number(timekeeperID))?.name ?? '',
																						count,
																					}))
																					.filter(data => !isNaN(data.timekeeperID) && data.timekeeperID != 'undefined')
																					.sort((a,b) => b.count-a.count)
																					.slice(0, count);
		return sorted;
	}
	//--------------------------------------
	// gender, style, course, distance별로 가장 좋은 기록 가져오기
	//--------------------------------------
	calculateBestTimeWithSeason(times) {
		if (times.length == 0) return [];
		const bestTimes = {};
		const currentYear = new Date().getFullYear();

		// Group times by style-course-distance
		times.forEach(record => {
			// if (record.timeStamp == 0 || record.time == "" || record.course != "LCM") return;
			const key = `${record.style}-${record.course}-${record.distance}`;
			console.log(key);
			// const key = `${record.style}-${record.course}-${record.distance}`;
				if (!bestTimes[key]) {
						bestTimes[key] = {
								times: [],
								timesSeason: []
						};
				}

				bestTimes[key].times.push({
						timeStamp	: record.timeStamp,
						timeStr		: record.time,
						timeID		: record.timeID,
						datetime	: record.datetime,
				});

				// Check if the record is from current season
				const recordYear = new Date(record.datetime).getFullYear();
				if (recordYear === currentYear) {
						bestTimes[key].timesSeason.push({
								timeStamp	: record.timeStamp,
								timeStr		: record.time,
								timeID		: record.timeID,
								datetime	: record.datetime,
						});
				}
		});

		// Calculate statistics for each category
		const result = {};
		Object.entries(bestTimes).forEach(([key, data]) => {
			const [style, course, distance] = key.split('-');
			const { times, timesSeason } = data;
			if (times.length === 0) return;

			// Sort times by timestamp (ascending)
			times.sort((a, b) => a.timeStamp - b.timeStamp);
			timesSeason.sort((a, b) => a.timeStamp - b.timeStamp);

			// Calculate average using timestamps
			const average = times.reduce((sum, t) => sum + t.timeStamp, 0) / times.length;

			// Calculate season average using timestamps
			const averageSeason = timesSeason.length > 0
															? timesSeason.reduce((sum, t) => sum + t.timeStamp, 0) / timesSeason.length
															: 0.0;						

			// console.log(times[0]);
			console.log("key=", key, "timesSeason=", timesSeason.length);
			// console.log(times[0]);
			console.log("timesSeason[0]=", timesSeason[0]);

			result[key] = {
				style, course, distance,
				average					: utilDate.convertTimestamp2string(average), //formatTimeString(average),
				averageSeason		: timesSeason.length == 0
														? ""
														: utilDate.convertTimestamp2string(averageSeason),
				timeCount				: times.length,              // 전체 기록 수 추가
				seasonTimeCount	: timesSeason.length, 
				best: {
						time		: times[0].timeStr,
						timeID	: times[0].timeID,
						datetime: times[0].datetime ? new Date(times[0].datetime).toISOString().slice(0, 10) : "",
				},
				bestSeason: timesSeason.length > 0
											? {
													time		: timesSeason[0].timeStr,
													timeID	: timesSeason[0].timeID,
													datetime: timesSeason[0].datetime ? new Date(timesSeason[0].datetime).toISOString().slice(0, 10) : "",
												}
											: {}
			};
		});

		return Object.values(result);
	}





	//##########################################################
	//##########################################################
	//##########################################################

	// style-gender별 집계 함수
	countMedalsByStyleAndGender(times) {
		if (times.length == 0) return {};
		// style-gender별로 그룹화
		const grouped = _.groupBy(times, (entry) => `${entry.style}-${entry.gender}`);
		
		const medals = { individual: { gold:0, silver:0, bronze: 0 }, team: { gold:0, silver:0, bronze: 0 }, timeCount: 0, };
		// 각 그룹에서 집계 수행
		const counts = Object.entries(grouped).map(([key, entries]) => {
				const [style, gender] = key.split("-");
				const timeCount = entries.length;
				const gold = entries.filter((entry) => entry.rank === 1).length;
				const silver = entries.filter((entry) => entry.rank === 2).length;
				const bronze = entries.filter((entry) => entry.rank === 3).length;
				const type = style.includes("Relay") ? "team" : "individual";
				medals[type].gold += gold;
				medals[type].silver += silver;
				medals[type].bronze += bronze;
				medals.timeCount += timeCount;
				return {
						style,
						gender,
						timeCount,
						gold,
						silver,
						bronze,
				};
		});
		const athleteIDs = _.countBy(times, "athleteID");
		medals.athleteCount = Object.keys(athleteIDs).filter(athleteID => athleteID != 'null').length;
		// console.log("medals=", medals);
		return counts;
	}






	//-----------------------------	
	// 날짜 기준 필터링
	//-----------------------------	
	filterByDate(times, date) {
		const today 			= moment(date); // 기준 날짜 설정
		const _today 			= today.startOf("day").toDate();
		const _yesterday 	= moment(today).subtract(1, "day").startOf("day").toDate();
		const _lastWeek 	= moment(today).subtract(1, "week").startOf("isoWeek").toDate();
		const _lastMonth 	= moment(today).subtract(1, "month").startOf("month").toDate();
		const _lastYear 	= moment(today).subtract(1, "year").startOf("year").toDate();

		const categorized = _(times).groupBy(item => `${item.poolID}_${item.style}`)
																.map((items, key) => {
																		const [poolID, style] = key.split("_");
																		return {
																				poolID		: parseInt(poolID, 10),
																				style			: style,
																				today			: items.filter(i => i.datetime >= _today && i.datetime < moment(_today).endOf("day").toDate()).length,
																				yesterday	: items.filter(i => i.datetime >= _yesterday && i.datetime < _today).length,
																				lastWeek	: items.filter(i => i.datetime >= _lastWeek && i.datetime < _today).length,
																				lastMonth	: items.filter(i => i.datetime >= _lastMonth && i.datetime < _today).length,
																				lastYear	: items.filter(i => i.datetime >= _lastYear && i.datetime < _today).length,
																				week			: {
																					mon: items.filter(i => moment(i.datetime).isoWeekday() === 1).length,
																					tue: items.filter(i => moment(i.datetime).isoWeekday() === 2).length,
																					wed: items.filter(i => moment(i.datetime).isoWeekday() === 3).length,
																					thu: items.filter(i => moment(i.datetime).isoWeekday() === 4).length,
																					fri: items.filter(i => moment(i.datetime).isoWeekday() === 5).length,
																					sat: items.filter(i => moment(i.datetime).isoWeekday() === 6).length,
																					sun: items.filter(i => moment(i.datetime).isoWeekday() === 7).length
																				}
																		};
																})
																.value();
    // categorized.week = {
		// 	mon: times.filter(i => moment(i.datetime).isoWeekday() === 1).length,
		// 	tue: times.filter(i => moment(i.datetime).isoWeekday() === 2).length,
		// 	wed: times.filter(i => moment(i.datetime).isoWeekday() === 3).length,
		// 	thu: times.filter(i => moment(i.datetime).isoWeekday() === 4).length,
		// 	fri: times.filter(i => moment(i.datetime).isoWeekday() === 5).length,
		// 	sat: times.filter(i => moment(i.datetime).isoWeekday() === 6).length,
		// 	sun: times.filter(i => moment(i.datetime).isoWeekday() === 7).length
		// };
		return categorized;
	}

	async calculateTeamStatistics(timeArr) {
		if (timeArr.length == 0) return [];
		const grouped = _.groupBy(timeArr, (entry) => entry.teamID);

		const teamsStatistics = [];
		for (const teamID of Object.keys(grouped)) {
			const times = grouped[teamID];
			const value = {
				teamID		: Number(teamID),
				timeCount	: times.length, 
			};
			value.athleteCount		= Object.entries(_.countBy(times, "athleteID"))
																		.map(([data, count]) => ({
																					athleteID: Number(data),
																					count,
																				}))
																		.filter(data => !isNaN(data.athleteID) && data.athleteID != 'undefined').length
			value.swimmersEvent 	= this.getAthletesByCount(times, 10);
			value.competitions		= this.getCompetitionsByCountOfTeam(value.teamID, times, 1000); // 처리 필요: athleteCount, medal, pbs
			value.bestTimes				= this.findBestTime(times, 1);
			value.latest					= this.findLatestTime(times, 1);
			value.first						= this.findFirstTime(times, 1);
			value.medals					= this.countMedalsByStyleAndGender(times);

			value.competitionCount= value.competitions.length;

			// calculate points
			let points = 0;
			for (const medal of value.medals) {
				if (medal.style.includes("Relay")) {
					points += medal.gold * teamPoints.goldTeam+
										medal.silver * teamPoints.silverTeam +
										medal.bronze * teamPoints.bronzeTeam;
				} else {
					points += medal.gold * teamPoints.goldIndividual+
										medal.silver * teamPoints.silverIndividual +
										medal.bronze * teamPoints.bronzeIndividual;
				}	
			} // end for
			points += value.timeCount * teamPoints.start;
			points += value.athleteCount * teamPoints.athletes;
			points += value.competitionCount * teamPoints.events;
			// points 계산
			value.points = points;
			teamsStatistics.push(value);

		} // end for

		// console.log("teamPoints:", teamsStatistics.length);
		const teamIDs = [...new Set(timeArr.map((entry) => entry.teamID))];
		console.log("teamIDs=", teamIDs);
		let result = await mongodb.deleteMany(mongoCFG.Medalbank.teamStatics, { teamID: { $in: teamIDs } });
		console.log("delete=", result);
		result = await mongodb.insertMany(mongoCFG.Medalbank.teamStatics, teamsStatistics );
		console.log("insert=", result);

		return teamsStatistics;
	}

	async buildTeamStatistics(timeArr) {

		//------------------------------------
		const {teamIDs, teams } =  await this.calculateTeamStatistics(timeArr);
		//------------------------------------
		// console.log("teamPoints:", teamsStatistics.length);
		console.log("teamIDs=", teamIDs);
		let result = await mongodb.deleteMany(mongoCFG.Medalbank.teamStatics, { teamID: { $in: teamIDs } });
		console.log("delete=", result);
		result = await mongodb.insertMany(mongoCFG.Medalbank.teamStatics, teams );
		console.log("insert=", result);

		return teamsStatistics;
	}

	//--------------------------------------
	// isAdult, gender, style, course, distance별로 가장 좋은 기록 가져오기
	//--------------------------------------
	// 그룹화 및 상위 3명 추출 함수
	findBestTimeAdult(times, count=3) {
		if (times.length == 0) return [];
		// `gender`, `style`, `course`, `distance`별로 그룹화
		const grouped = _.groupBy(times, (entry) => `${entry.isAdult?"adult":"junior"}-${entry.gender}-${entry.style}-${entry.course}-${entry.distance}`);
		

		const utilTime = new TimeLibrary();
		// 그룹을 순회하며 상위 3명의 선수만 추출
		const sorted = [];
		const xxx = Object.entries(grouped).map(([key, entriesAll]) => {

				// name별로 가장 좋은 기록 한개씩만 가져오기
				const entries = _.chain(entriesAll)
													.groupBy('name')
													.map(group => _.minBy(group, 'timeStamp'))
													.value();

				const [adult, gender, style, course, distance] = key.split("-"); // 키에서 style과 distance 추출
				const timeCount = entriesAll.length; // 기록 수
				const athleteCount = _.uniqBy(entries, "name").length; // 고유 선수 수

				const topTimes = _.sortBy(entries, "timeStamp")	// timeStamp 오름차순 정렬
													.slice(0, count)	// 상위 3명의 선수 추출
													.reduce((arr, time) => {
														// console.log("--->", time.timeID, arr.length);
														if (time) {
															const value = {
																timeID		: time.timeID,
																name			: time.name,
																time			: time.time,
																timeStamp	: time.timeStamp,	
																rank			: time.rank ?? 0,
																datetime	: time.datetime,
															};
															if (time.group)  		value.group = time.group;
															if (time.year)  		value.year = time.year;
															if (time.month)  		value.month = time.month;
															if (time.day)  			value.day = time.day;
															if (time.week)  		value.week = time.week;
															if (time.sido)  		value.sido = time.sido;
															if (time.athleteID) value.athleteID = time.athleteID;
															// if (time.gender)  	value.gender = time.gender;
															if (time.ageGroup)  value.ageGroup = time.ageGroup;
															if (time.poolID)  	value.poolID = time.poolID;
															if (time.teamID)  	value.teamID = time.teamID;
															if (time.competitionID) {
																value.competitionID = time.competitionID;
															} else if (time.poolID) {														
																value.poolID = time.poolID;		
															}
															if (time.imported)  value.imported = time.imported;
															arr.push(value);
														}
														return arr;
													}, []);
					const times = utilTime.assignRanks(topTimes);


				// const gold = entries.filter((entry) => entry.rank === 1).length;
				// const silver = entries.filter((entry) => entry.rank === 2).length;
				// const bronze = entries.filter((entry) => entry.rank === 3).length;
				sorted.push({
					isAdult: adult == "adult",
					gender,
					style,
					course,
					distance,
					timeCount,
					athleteCount,
					// medals: { gold, silver, bronze },
					times,
			});
				return {
						isAdult: adult == "adult",
						gender,
						style,
						course,
						distance,
						timeCount,
						athleteCount,
						// medals: { gold, silver, bronze },
						times,
				};
		}).sort((a, b) => b.athleteCount - a.athleteCount);

		return sorted;
	}
	findBestTime(times, count=3) {
		if (times.length == 0) return [];
		// `gender`, `style`, `course`, `distance`별로 그룹화
		const grouped = _.groupBy(times, (entry) => `${entry.gender}-${entry.style}-${entry.course}-${entry.distance}`);

		const utilTime = new TimeLibrary();
		// 그룹을 순회하며 상위 3명의 선수만 추출
		const sorted = [];
		const xxx = Object.entries(grouped).map(([key, entries]) => {
				const [gender, style, course, distance] = key.split("-"); // 키에서 style과 distance 추출
				const timeCount = entries.length; // 기록 수
				const athleteCount = _.uniqBy(entries, "athleteID").length; // 고유 선수 수

				const topTimes = _.sortBy(entries.filter(el=>el.timeStamp>0), "timeStamp")	// timeStamp 오름차순 정렬
													.slice(0, count)	// 상위 3명의 선수 추출
													.reduce((arr, time) => {
														const value = {
															timeID		: time.timeID,
															name			: time.name,
															time			: time.time,
															timeStamp	: time.timeStamp,	
															rank			: time.rank ?? 0,
															datetime	: time.datetime,
															isMasters	: time.isMasters ?? true,
														};
														if (time.thumbnail) value.thumbnail = time.thumbnail;
														if (time.group)  		value.group = time.group;
														if (time.year)  		value.year = time.year;
														if (time.month)  		value.month = time.month;
														if (time.day)  			value.day = time.day;
														if (time.week)  		value.week = time.week;
														if (time.athleteID) value.athleteID = time.athleteID;
														if (time.gender)  	value.gender = time.gender;
														if (time.ageGroup)  value.ageGroup = time.ageGroup;
														if (time.poolID)  	value.poolID = time.poolID;
														if (time.teamID)  	value.teamID = time.teamID;
														if (time.competitionID) {
															value.competitionID = time.competitionID;
														} else if (time.poolID) {														
															value.poolID = time.poolID;		
														}
														if (time.imported)  value.imported = time.imported;
														if (time.timeStamp > 0) {
															arr.push(value);
														}
														return arr;
													}, []);
					const times = utilTime.assignRanks(topTimes);


				// const gold = entries.filter((entry) => entry.rank === 1).length;
				// const silver = entries.filter((entry) => entry.rank === 2).length;
				// const bronze = entries.filter((entry) => entry.rank === 3).length;
				sorted.push({
					gender,
					style,
					course,
					distance,
					timeCount,
					athleteCount,
					// medals: { gold, silver, bronze },
					times,
			});
				return {
						gender,
						style,
						course,
						distance,
						timeCount,
						athleteCount,
						// medals: { gold, silver, bronze },
						times,
				};
		}).sort((a, b) => b.athleteCount - a.athleteCount);

		return sorted;
	}
	findBestTimeJSON(times) {
		if (times.length == 0) return {};
		const best = this.findBestTime(times, 1);
console.log("best=", best[0]);
		const result = best.reduce((acc, curr) => {
													if (curr.timeStapm == 0) return acc;
													const key = `${curr.style}-${curr.course}-${curr.distance}`;
													const timeData = curr.times[0] || {}; // times 배열에서 첫 번째 요소 가져오기
											
													acc[key] = {
															timeID: timeData.timeID || 0,
															name: timeData.name || '',
															time: timeData.time || "",
															thumbnail: timeData.thumbnail || "",
															timeStamp: timeData.timeStamp || 0,
															rank: timeData.rank || 0,
															athleteID: timeData.athleteID || 0,
															competitionID: timeData.competitionID || null,
															timeCount: curr.timeCount ?? 0,
															athleteCount: curr.athleteCount ?? 0,
													};
											
													return acc;
												}, {});
		return result;
	}



	//-----------------------------------------------------------
	//	gender-style별로 거리 존재 여부 확인
	//-----------------------------------------------------------
	checkExistsDistance(times) {
    const distances = ["25M", "50M", "100M", "200M", "400M", "800M", "1500M"];
    const existsMap = {};

    // gender-style별로 거리 존재 여부 확인
    times.forEach((t) => {
        const key = `${t.gender}-${t.style}`;

        if (!existsMap[key]) {
            existsMap[key] = distances.reduce((acc, dist) => {
                acc[dist] = false;
                return acc;
            }, {});
        }

        if (distances.includes(t.distance)) {
            existsMap[key][t.distance] = true;
        }
    });

    return existsMap;
	}

	//--------------------------------------
	// competition별 count 계산
	//--------------------------------------
	getCompetitionsByCountOfTeam(teamID, times, count=3) {
		if (times.length == 0) return [];
		const counts = _.countBy(times, "competitionID");
    const sorted = Object.entries(counts).map(([data, count]) => ({
																						competitionID: Number(data),
																						medals: {
																							gold	: times.filter(el => el.competitionID == Number(data) && el.teamID == teamID && el.rank == 1).length,
																							silver: times.filter(el => el.competitionID == Number(data) && el.teamID == teamID && el.rank == 2).length,
																							bronze: times.filter(el => el.competitionID == Number(data) && el.teamID == teamID && el.rank == 3).length,
																						},
																						timeCount: count,
																						athleteCount: [...new Set(times.filter(el => el.competitionID == Number(data) && el.teamID == teamID).map((entry) => entry.athleteID))].length,
																					}))
																					.filter(data => !isNaN(data.competitionID) && data.competitionID != 'undefined')
																					.sort((a,b) => b.count-a.count)
																					.slice(0, count);

		return sorted;
	}

	//--------------------------------------
	// athlete별 count 계산
	//--------------------------------------
	getAthletesByCount(times, count=3) {
		if (times.length == 0) return [];
		const counts = _.countBy(times, "athleteID");
    const sorted = Object.entries(counts).map(([athleteID, count]) => ({
																						athleteID: Number(athleteID),
																						name: times.find(el => el.athleteID == Number(athleteID))?.name ?? '',
																						count,
																					}))
																					.filter(data => !isNaN(data.athleteID) && data.athleteID != 'undefined')
																					.sort((a,b) => b.count-a.count)
																					.slice(0, count);
		return sorted;
	}

	//--------------------------------------
	// competition별 count 계산
	//--------------------------------------
	getAgeGroupByCount(times, count=3) {
		if (times.length == 0) return [];
		const counts = _.countBy(times, "ageGroup");
    const sorted = Object.entries(counts).map(([data, count]) => ({
																						ageGroup: data,
																						ageGroupName: mskCFG.getAgeGroupNameByAgeGroupCode(data),
																						count,
																					}))
																					.filter(data => data.ageGroup != 'undefined')
																					.sort((a,b) => b.count-a.count)
																					.slice(0, count);

		return sorted;
	}

	//-----------------------------------------------------------
	// 모든 거리와 스타일 조합을 생성하는 함수
	//-----------------------------------------------------------
	getDistance4GenderStyle(times) {
		if (times.length == 0) return {};
		// 모든 가능한 거리 목록
		const distances = ['25M', '50M', '100M', '200M', '400M', '800M', '1500M'];

		// 중복 제거를 위한 Set 생성 (style-gender 조합)
		const uniqueCombinations = new Set(
				times.map(time => `${time.style}-${time.gender}`)
		);

		// 각 style-gender 조합에 대해 거리별 기록 존재 여부 확인
		const styleDistance = Array.from(uniqueCombinations).map(combination => {
				const [style, gender] = combination.split('-');

				// 기본 객체 생성
				const distanceObj = {
						gender,
						style
				};

				// 각 거리에 대해 기록 존재 여부 체크
				distances.forEach(distance => {
						distanceObj[distance] = times.some(time => 
								time.style === style && 
								time.gender === gender && 
								time.distance === distance
						);
				});

				return distanceObj;
		});

		return styleDistance;
	}
	//-----------------------------------------------------------
	//	gender-style-distance별로 가장 좋은 기록을 저장
	//-----------------------------------------------------------
	getBestTimesGenderStyleDistance(times, count=3) {
		if (times.length == 0) return [];
    // 그룹화 객체 생성
    const bestTimesMap = {};

    // 각 항목을 gender-style-distance별로 그룹화하고 가장 좋은 기록을 저장
    times.forEach((t) => {
        const key = `${t.gender}-${t.style}-${t.distance}`;

        if (!bestTimesMap[key] || t.timeStamp < bestTimesMap[key].timeStamp) {
            bestTimesMap[key] = {
                gender					: t.gender,
                style						: t.style,
                distance				: t.distance,
                name						: t.name,
                time						: t.time,
                datetime				: t.datetime,
                thumbnail				: t.thumbnail,
                competitionName	: t.competitionName,
            };
        }
    });

    // 객체를 배열로 변환하여 반환
    const bestTimes = Object.values(bestTimesMap);
    return bestTimes;
}

	//--------------------------------------
	// season 평균 기록 계산
	//--------------------------------------
	calculateSeasonAverage(times) {
		const currentYear = 2019; // new Date().getFullYear();
		// 현재 연도의 기록만 필터링
		const seasonTimes = times.filter(t => {
				const recordYear = new Date(t.datetime).getFullYear();
				return recordYear === currentYear && t.timeStamp > 0;
		});
	
		if (seasonTimes.length === 0) {
				return 0.0;
		}
		// 평균 계산
		const total = seasonTimes.reduce((sum, t) => sum + t.timeStamp, 0);
		return total / seasonTimes.length;
	}
	calculateAverage(times) {
		// 평균 계산
		const total = times.reduce((sum, t) => sum + t.timeStamp, 0);
		const timeStamp = total / times.length;
		return { timeStamp: timeStamp, time: utilDate.convertTimestamp2string(timeStamp) };
	}
	// team별 집계 함수
	countByTeam(times) {
		if (times.length == 0) return [];
		// team별로 그룹화
		const result = {};
		const grouped = _.groupBy(times, (entry) => `${entry.teamID}`);

		const medals = Object.entries(grouped).map(([teamID, entries]) => {
			if (true || teamID != "185") { // 개인 제외
				const team = {};
				team.gold 	= entries.filter((entry) => entry.rank === 1).length;
				team.silver = entries.filter((entry) => entry.rank === 2).length;
				team.bronze = entries.filter((entry) => entry.rank === 3).length;
				team.timeCount = entries.length;
				team.men = entries.filter((entry) => entry.gender === 'men').length;
				team.women = entries.filter((entry) => entry.gender === 'women').length;
				team.individual = entries.filter((entry) => !entry.style.includes("Relay")).length;
				team.team = entries.filter((entry) => entry.style.includes("Relay")).length;
				team.athleteCount = [...new Set(entries.map((item) => item["athleteID"]).map(entry => entry))].length

				const tm = memoryDB.getTeam(teamID);
				return {
					teamID: Number(teamID),
					name: tm.name ?? '',
					...team,
				};
			}
		});
		return medals.sort((a,b)=> b.timeCount-a.timeCount);
	}

	// 데이터를 기반으로 styles 생성
	calculateStyles(medals) {
		const individualStyles = ["freestyle", "backstroke", "breaststroke", "butterfly", "individualMedley"];
		const teamStyles = ["freestyleRelay", "medleyRelay"];

		const result = {
			total: { total: 0 },
			individual: { total: 0 },
			team: {
				men: { total: 0 },
				women: { total: 0 },
				mixed: { total: 0 },
			},
		};

		// 초기화: 각 스타일별 카운트 추가
		[...individualStyles, ...teamStyles].forEach((style) => {
			result.total[style] = 0;
			result.individual[style] = 0;
			result.team.men[style] = 0;
			result.team.women[style] = 0;
			result.team.mixed[style] = 0;
		});

		// 데이터 집계
		medals.forEach(({ style, gender, timeCount }) => {
			// 전체 카운트
			result.total.total += timeCount;

			if (individualStyles.includes(style)) {
				// 개인 종목 처리
				result.individual.total += timeCount;
				result.total[style] += timeCount;
				result.individual[style] += timeCount;
			} else if (teamStyles.includes(style)) {
				// 팀 종목 처리
				result.team[gender].total += timeCount;
				result.team[gender][style] += timeCount;
				result.total[style] += timeCount;
			}
		});

		return result;
	}

	assignRanks(timeArr) {
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
	
//-------------------------------------------
//	rank: gender-style-distance
//-------------------------------------------
assignRanksBreaststroke = (timeArr, startRank=0) => {
  // First, let's sort the times array in ascending order of time
  timeArr = timeArr.sort((a, b) => a.timenum - b.timenum);

	const times = [], timesNull = [];
	for (const time of timeArr) {
		if (time.timenum) {
			times.push(time);
		} else {
			time.rank = 0;
			timesNull.push(time);
		}
	}

  // Initialize variables to keep track of rank and previous time
	if (times.length > 0) {
		let rank = startRank + 1; // Starting rank
		// 2. Assign ranks
		let before = times[0].timenum;
		for (let i = 0; i < times.length; i++) {
			if (i > 0 && times[i].timenum !== times[i - 1].timenum) {
				rank = i + 1 + startRank;
			}
			// times[i].rank = rank;
			times[i].rankGroup = times[i].rank || 0;
			times[i].rank = rank;
			times[i].diffs = times[i].timenum == before ? "00:00.00" : utilDate.convertTimenum2stringBreast(times[i].timenum - before);
		}		
	}

  return times.concat(timesNull);
}
assignRanksMedalbank = (timeArr, startRank=0) => {
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
		let rank = startRank + 1; // Starting rank
		// 2. Assign ranks
		let before = times[0].timeStamp;
		for (let i = 0; i < times.length; i++) {
			if (i > 0 && times[i].timeStamp !== times[i - 1].timeStamp) {
				rank = i + 1 + startRank;
			}
			// times[i].rank = rank;
			times[i].rankGroup = times[i].rank || 0;
			times[i].rank = rank;
			times[i].diffs = times[i].timeStamp == before ? "0.00" : utilDate.convertTimestamp2string(times[i].timeStamp - before);
		}		
	}

  return times.concat(timesNull);
}

	
	//
	//  times를 gender, ageGroup, style, course, distance별로 groupping
	//  
	//  leaderboard: {
	//   gender, ageGroup, style, course, distance,
	//    times: [
	//      { timeID, athleteID, name, timeStamp, rank, datetime, competitionID, teamID, poolID, }
	//    ]
	//  }
	//
	makeLeaderboardAgeGroup(timeArr) {
		const obj = lodash.groupBy(timeArr, (t) => {
			const ageGroup = t.ageGroup ? t.ageGroup : t.ageGroupORG || 'none';
			return `${t.gender || ''}_${ageGroup}_${t.style || ''}_${t.course || ''}_${t.distance || ''}`;
		});


		const ageGroups = [...new Set(
			[
				...timeArr.filter(entry => entry.ageGroup!= undefined).map((item) => item["ageGroup"]).map(entry => entry),
				...timeArr.filter(entry => entry.ageGroupORG!= undefined).map((item) => item["ageGroupORG"]).map(entry => entry),
			]
		)];
	
		const leaderboards = [];
		//----------------------------------
		for (const gender of ["men", "women", "mixed"]) {
			for (const ageGroup of ageGroups) {
				for (const style of ["freestyle", "backstroke", "breaststroke", "butterfly", "individualMedley", "freestyleRelay", "medleyRelay"]) {
					for (const course of ["SCM", "LCM"]) {
						for (const distance of ["25M", "50M", "100M", "200M", "400M", "800M", "1500M"]) {
							const key = `${gender}_${ageGroup}_${style}_${course}_${distance}`;
							if (!obj[key]) continue;
							const timeArr = obj[key].map(({timeID, athleteID, name, time, timeStamp, rank, datetime, competitionID, teamID, poolID}) => ({ timeID, athleteID, name, time, timeStamp, rank, datetime, competitionID, teamID, poolID, }));
							const times = timeArr.map(({timeID, athleteID, name, time, timeStamp, rank, datetime, competitionID, teamID, poolID}) => ({ timeID, athleteID, name, time, timeStamp, rank, datetime, competitionID, teamID, poolID, }));

							const lb = {
								gender        : gender,
								// ageGroup      : ageGroup,
								style         : style,
								course        : course,
								distance      : distance,
								// round         : arr[5],
								medals        : this.calculateMedals(times),
								firstTime     : this.findFirstTime(times),
								latestTime    : this.findLatestTime(times),
								bestTime      : this.findBestTime(times),
								seasonAverage : this.calculateSeasonAverage(times),
								teams         : this.getTeamsByCount(times).sort((a, b) => b.count-a.count),
								// times         : times,
							}
							leaderboards.push(lb);

						} // distance
					} // course
				} // style
			} // ageGroup
		} // gender
		//----------------------------------
		// console.log("----->", leaderboards, leaderboards.length);
		return leaderboards;
	}
	makeLeaderboard(timeArr) {
		const obj = lodash.groupBy(timeArr, (t) => {
			return `${t.gender || ''}_${t.style || ''}_${t.course || ''}_${t.distance || ''}`;
		});
	
		const leaderboards = [];
		//----------------------------------
		for (const gender of ["men", "women", "mixed"]) {
			for (const style of ["freestyle", "backstroke", "breaststroke", "butterfly", "individualMedley", "freestyleRelay", "medleyRelay"]) {
				for (const course of ["SCM", "LCM"]) {
					for (const distance of ["25M", "50M", "100M", "200M", "400M", "800M", "1500M"]) {
						const key = `${gender}_${style}_${course}_${distance}`;
						if (!obj[key]) continue;
						const timeArr = obj[key].map(({timeID, athleteID, name, time, timeStamp, rank, datetime, competitionID, teamID, poolID}) => ({ timeID, athleteID, name, time, timeStamp, rank, datetime, competitionID, teamID, poolID, }));
						const times = timeArr.map(({timeID, athleteID, name, time, timeStamp, rank, datetime, competitionID, teamID, poolID}) => ({ timeID, athleteID, name, time, timeStamp, rank, datetime, competitionID, teamID, poolID, }));

						const lb = {
							gender        : gender,
							style         : style,
							course        : course,
							distance      : distance,
							// round         : arr[5],
							medals        : this.calculateMedals(times),
							firstTime     : this.findFirstTime(times),
							latestTime    : this.findLatestTime(times),
							bestTime      : this.findBestTime(times),
							seasonAverage : this.calculateSeasonAverage(times),
							teams         : this.getTeamsByCount(times).sort((a, b) => b.count-a.count),
							// times         : times,
						}
						leaderboards.push(lb);

					} // distance
				} // course
			} // style
		} // gender
		//----------------------------------
		return leaderboards;
	}
	makeLeaderboardNotSort(timeArr) {
		const obj = lodash.groupBy(timeArr, (t) => {
			const ageGroup = t.ageGroup ? t.ageGroup : t.ageGroupORG || '';
			return `${t.gender || ''}_${ageGroup}_${t.style || ''}_${t.course || ''}_${t.distance || ''}_${t.round || ''}`;
		});

		Object.keys(obj).forEach(key => {
			const times = obj[key].map(({timeID, athleteID, name, time, timeStamp, rank, datetime, competitionID, teamID, poolID}) => ({ timeID, athleteID, name, time, timeStamp, rank, datetime, competitionID, teamID, poolID, }));

			const arr = key.split('_');
			const lb = {
				gender        : arr[0],
				ageGroup      : arr[1],
				style         : arr[2],
				course        : arr[3],
				distance      : arr[4],
				round         : arr[5],
				medals        : this.calculateMedals(times),
				firstTime     : this.findFirstTime(times),
				latestTime    : this.findLatestTime(times),
				bestTime      : this.findBestTime(times),
				seasonAverage : this.calculateSeasonAverage(times),
				teams         : this.getTeamsByCount(times).sort((a, b) => b.count-a.count),
				times         : times,
			}
			// if (lb.teams.length > 1) console.log("lb->", lb.teams);
			// lb.times = obj[key].filter(tm => {tm.timeID, tm.athleteID, tm.name, tm.timeStamp, tm.rank, tm.datetime, tm.competitionID, tm.teamID, tm.poolID,});
		});
		return this._leaderboardOBJ;
	}

}
module.exports = TimeLibrary;