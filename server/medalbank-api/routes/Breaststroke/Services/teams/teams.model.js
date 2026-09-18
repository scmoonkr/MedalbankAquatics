const extend 			= require('node.extend');
const fs 					= require('fs');
const path 				= require('path');
const {swimmingCFG} = require('../../Config/swimmingCFG.js');
const mongoCFG 		= require('../../Config/mongoCFG.js');
const mongoDB			= require('../../Class/MongoDB.js');
const UtilDate		= require("../../Class/DateLibrary.js");
const utilLibrary = require("../../Class/utilLibrary.js");
const utilError		= require("../../Class/utilError.js");
// const utilDatabase= require('../utilDatabase.js');
const imageLibrary= require("../library/images.library.js");
const StaticLibrary	= require("../library/statistics.library");
const MemoryDB 		= require('../../Class/MemoryDB.js');
const memoryDB		= new MemoryDB();

const TimeLibrary		= require("../library/times.library");
const Customizing = require("./teams.custom.js");
const {calculateTeamStatistics}	= require("../library/teams.build.js");

const mongodb	= new mongoDB(mongoCFG.Breaststroke.database);
const utilDate		= new UtilDate();

const PK = "teamID";
const MAX_LIMIT = 100;

const _context = {
	query		 	: {},
	projection: { _id:0, },
	limit		 	: MAX_LIMIT,
	skip			: 0,
	sort			: { _id:-1 },
}

class TeamModel {
  
	/**
	 * static saveTeamWithImage 함수
	 *
	 * 이 함수는 팀 데이터를 데이터베이스에 저장하거나 업데이트합니다.
	 * 팀의 대표 이미지를 처리하고, 주어진 정보를 기반으로 필드를 업데이트합니다.
	 *
	 * @param {Object} body - 팀 데이터를 포함하는 객체
	 * @param {number|string} [body.teamID] - 팀의 고유 ID. 0이거나 제공되지 않은 경우 새로운 ID가 생성됩니다.
	 * @param {string} [body.sourcePath] - 저장할 이미지 파일의 경로
	 * @param {string} [body.name] - 팀 이름
	 * @param {string} [body.teamcode] - 팀 코드
	 * @param {string} [body.sido] - 행정 구역 (예: 부산)
	 * @param {string} [body.memo] - 추가적인 메모 정보
	 * @param {string} [body.category] - 팀 카테고리 ('마스터즈' 또는 기타)
	 * @param {string} [body.type] - 팀 유형 ('성인' 또는 기타)
	 * @param {number|string} [body.athleteID] - 데이터를 업데이트한 사람의 ID
	 * @returns {Promise<Object>} 저장된 팀 ID와 메시지를 포함하는 객체
	 */
	static async saveTeamWithImage(body) {
		console.log("model.saveTeamWithImage.body=", body);

		// 저장할 데이터를 담을 객체 초기화
		const value = {};

		// teamID 확인 및 생성
		if (!body.teamID || body.teamID == 0) {
				// teamID가 0이거나 제공되지 않은 경우, 새로운 ID를 생성
				value.teamID = await mongodb.max(mongoCFG.Breaststroke.teams, "teamID", {});
		} else {
				// 제공된 teamID를 사용
				value.teamID = Number(body.teamID);
		}

		// --------------------------------------------------------------
		// 대표 이미지 처리
		// --------------------------------------------------------------
		if (body.sourcePath) {
				// 이미지 저장 및 경로 설정
				const result = await imageLibrary.saveFile(
																						body.sourcePath,
																						"images",
																						"teams",
																						value.teamID,
																						'f'	// 'f'eatured, 't'humbnail, '0'~'9'
																					);
				// 대표 이미지 경로를 value에 추가
				value.featured = `/cms/images/teams/${value.teamID}/f`;
		}

		// --------------------------------------------------------------
		// 입력받은 필드 업데이트
		// --------------------------------------------------------------
		if (body.name			) value.name 			= body.name.trim(); // 팀 이름 설정
		if (body.teamcode	) value.teamcode 	= body.teamcode.trim(); // 팀 코드 설정
		if (body.sido			) value.sido 			= body.sido.trim(); // 행정 구역 설정
		if (body.memo			) value.memo 			= body.memo.trim(); // 메모 설정
		if (body.masters	) value.masters 	= body.masters.trim(); // 팀 코드 설정
		if (body.adult		) value.adult 		= body.adult.trim(); // 팀 코드 설정

		if (body.athleteID) value.athleteID = Number(body.athleteID); // 업데이트한 사람 ID 설정
		value.updated = new Date(); // 마지막 업데이트 시간 설정

		console.log("end.....", value);

		// --------------------------------------------------------------
		// 데이터베이스에 업데이트
		// --------------------------------------------------------------
		await mongodb.updateOne(mongoCFG.Breaststroke.teams, { teamID: value.teamID }, value);

		// --------------------------------------------------------------
		// 결과 반환
		// --------------------------------------------------------------
		return { message: "", data: { teamID: value.teamID } };
	}
	// view
	static async view(body) {
		const result = await this.searchRealtime({teamID:body.teamID});
		if (result.data.length == 0) return { message: "no data", data: {} };
		const team = result.data[0];
		const times = [];
		//------
		for (const best of team.statistics.bestTimes) {			
			best.team = team.name;
			best.pool = team.pool;
			best.times[0] = best.times[0] ?? {};
			const value = {
				gender			: best.gender,
				style				: best.style,
				course			: best.course,
				distance		: best.distance,
				timeCount		: best.timeCount,
				athleteCount: best.athleteCount ?? 0,
				...best.times[0],
			}
			times.push(value);
		}
		team.statistics.bestTimes = times;
		//------
		team.statistics.competitions = team.statistics.competitions.reduce((acc, cur) => {
																																	const comp = memoryDB.getCompetition(cur.competitionID);
																																	cur.fullname = comp.fullname ?? '';
																																	cur.dateStart = comp.dateStart ?? '';
																																	acc.push(cur);
																																	return acc;
																																}, []);
		//------
		await StaticLibrary.updateViewReactions("teams", body.teamID, team.name, body.userID); // db, id, name, userID
		console.log("~~~~~~", team);

		const timeLibrary = new TimeLibrary();
		const { times:bestTimesComp, compression:bestTimecomp } = timeLibrary.getCompetitionsTeamsPools(team.statistics.bestTimes);
		const { times:teamTimesComp, compression:teamTimeComp } = timeLibrary.getCompetitionsTeamsPools(team.statistics.teamTimes);
		
		team.statistics.teamTimes 	= teamTimesComp;
		team.statistics.bestTimes 	= bestTimesComp;
		// console.log("stemTimes=", stemTimes.length, stemTimes[0]);
		
		// competition, pool, team name 분리하고 통합합
		team.compression = {
			teams: [...new Map([
														...bestTimecomp.teams,
														...teamTimeComp.teams,
													].map(item => [item.teamID, item])
												).values()
							],
			pools: [...new Map([
														...bestTimecomp.pools,
														...teamTimeComp.pools,
													].map(item => [item.poolID, item])
												).values()
							],
			competitions: [...new Map([
														...bestTimecomp.competitions,
														...teamTimeComp.competitions,
													].map(item => [item.competitionID, item])
												).values()
										],
		};


		/*
		team.statistics.teamTimes = team.statistics.teamTimes.reduce((acc, cur) => {
																														const comp = memoryDB.getCompetition(cur.competitionID);
																														const value = {
																															timeID				: cur.timeID,
																															competitionID	: cur.competitionID,
																															gender				: cur.gender,
																															style					: cur.style,
																															course				: cur.course,
																															distance			: cur.distance,
																															names					: cur.names ?? [],
																															time					: cur.times,
																															rank					: cur.rank,
																															datetime			: cur.datetime,
																														}
																														value.names = value.names.join(', ');
																														acc.push(cur);
																														return acc;
																													}, []);
																													*/
		return { message: '', data: team };
		// getCompetitionsTeamsPools(competitionIDs);
	} 

	static listRealtime = async (body) => {
		// -----> get this season
		const year = new Date().getFullYear();
		// -----> get limit, skip
		const limit = body.limit ? Number(body.limit) : MAX_LIMIT;
		let skip = (Number(body.page ?? 1) - 1)	* limit;
		skip = skip < 0 ? 0 : skip;
		// -----> get sort
		const sort = {};
		if (body.sortField) {
			sort[body.sortField] = body.sortDirection == 'asc' ? 1 : -1;
		} else sort.points = -1;

		const query = {
			type: 'event',
			style: { $in: ['freestyle', 'backstroke', 'breaststroke', 'butterfly', 'individualMedley', 'freestyleRelay', 'medleyRelay'] },
			timeStamp: { $gt: 0 },
			teamID: { $ne: 185 }, // 개인 제외
			$or: [ {status: ""}, { status: { $exists: false }} ],
		};
		const aggregate = [
			// 1. freestyle 스타일 & rank가 1,2,3인 문서만 선택
			{ 
				$match: query
			},
			// 2. 팀별 그룹: medalsTemp 배열, 고유 (competitionID, athleteID) 세트, 전체 레코드 수(timeCount),
			//    datetime 연도가 2025인 경우의 고유 (competitionID, athleteID) 세트(pairSetSeason)와 team 필드 추가
			{
				$group: {
					_id: "$teamID",
					team: { $first: "$team" },
					medalsTemp: { $push: { style: "$style", rank: "$rank" } },
					pairsSet: { $addToSet: { competitionID: "$competitionID", athleteID: "$athleteID" } },
					timeCount: { $sum: 1 },
					pairSetSeason: {
						$addToSet: {
							$cond: [
								{ $eq: [ { $year: { $toDate: "$datetime" } }, year ] },
								{ competitionID: "$competitionID", athleteID: "$athleteID" },
								"$$REMOVE"
							]
						}
					}
				}
			},
			// 3. medalsTemp 배열을 unwind하여 개별 메달 데이터로 분리
			{ $unwind: "$medalsTemp" },
			// 4. 팀ID, style, rank 조합별로 그룹하여 해당 조합의 count 산출
			{
				$group: {
					_id: { teamID: "$_id", team: "$team", style: "$medalsTemp.style", rank: "$medalsTemp.rank" },
					count: { $sum: 1 },
					pairsSet: { $first: "$pairsSet" },
					timeCount: { $first: "$timeCount" },
					pairSetSeason: { $first: "$pairSetSeason" }
				}
			},
			// 5. 다시 팀별 그룹화하여 medals 배열 구성 및 pairsSet, timeCount, pairSetSeason 전달
			{
				$group: {
					_id: "$_id.teamID",
					team: { $first: "$_id.team" },
					medals: { $push: { style: "$_id.style", rank: "$_id.rank", count: "$count" } },
					pairsSet: { $first: "$pairsSet" },
					timeCount: { $first: "$timeCount" },
					pairSetSeason: { $first: "$pairSetSeason" }
				}
			},
			// 6. 최종 출력: medals 배열(확실히 rank 1,2,3만), points(메달 가중치 합계에 athleteCount 추가), 
			//    athleteCount, athleteCountSeason, team 필드 및 timeCount 포함
			{
				$project: {
					_id: 0,
					teamID: "$_id",
					team: 1,
					medals: {
						$filter: {
							input: "$medals",
							as: "medal",
							cond: { $in: ["$$medal.rank", [1, 2, 3]] }
						}
					},
					timeCount: 1,
					points: {
						$add: [
							{
								$sum: {
									$map: {
										input: "$medals",
										as: "medal",
										in: {
											$switch: {
												branches: [
													{ case: { $eq: [ "$$medal.rank", 1 ] }, then: { $multiply: [ "$$medal.count", 5 ] } },
													{ case: { $eq: [ "$$medal.rank", 2 ] }, then: { $multiply: [ "$$medal.count", 3 ] } },
													{ case: { $eq: [ "$$medal.rank", 3 ] }, then: { $multiply: [ "$$medal.count", 1 ] } }
												],
												default: 0
											}
										}
									}
								}
							},
							{ $size: "$pairsSet" }
						]
					},
					athleteCount: { $size: "$pairsSet" },
					athleteCountSeason: { $size: "$pairSetSeason" }
				}
			},
			// 7. ratio 계산 (points / athleteCount; athleteCount가 0이면 0 처리)
			{
				$addFields: {
					ratio: {
						$cond: {
							if: { $eq: [ "$athleteCount", 0 ] },
							then: 0,
							else: { $divide: [ "$points", "$athleteCount" ] }
						}
					}
				}
			},
			// 8. teamID 기준 정렬 후 스킵 및 리밋 (페이지네이션)
			{ $sort: sort },
			{ $skip: skip },
			{ $limit: limit }
		];
		const result = await mongodb.aggregate(mongoCFG.Breaststroke.times, aggregate );
// console.log("\nbody:", body, "\nsort:", sort, "\nlimit:", limit, "\nskip:", skip, "\ndata:", result.data[0]);

		const medals = result.data.reduce((arr, team) => {
			const style = { freestyle: 0, backstroke: 0, butterfly: 0, breaststroke: 0, breaststroke: 0, individualMedley: 0, team: 0, };
			team.medals.forEach(medal => {
				if (medal.style.includes('Relay')) {
					style.team += medal.count;
				} else {
					style[medal.style] += medal.count;
				}
			})
			team.medals = style;
			team.name = team.team;
			delete team.team;
			arr.push(team);
			return arr;
		}, []);

		const counts = await mongodb.distinct(mongoCFG.Breaststroke.times, "teamID", query );
		result.count = counts.data.length - 1;

		return result;
	}
	static searchRealtime = (async (body) => {
		let skip = (Number(body.page??1)-1)	* MAX_LIMIT; skip = skip < 0 ? 0 : skip;
		const query = {}; // { $and: [ {name: { $ne: ""} }, { name: {  $ne: "개인" } } ] };
		if (body.name) query.indexes = new RegExp(utilLibrary.normalizeString(body.name), "gi");
		if (body.teamID) query.teamID = Number(body.teamID);
		// relative: relative, absolute
		// sort: asc, desc
		// field
		
		let context = {
			query     : query,
			projection: { _id:0, indexes:0, }, // timeID:1, name:1, gender:1, style:1, distance:1, team:1, athleteID:1, datetime:1, competitionName:1, competitions:1, rank:1, rankGroup:1, },
			limit     : body.limit ? Number(body.limit) : 100,
			skip      : skip,
			sort			: { points: -1 }
		}
		//----------------------------------------------------------------
		const result = await mongodb.find(mongoCFG.Breaststroke.teams, context );
		console.log("query=", query, result.data.length);
		//----------------------------------------------------------------
		if (result.data.length == 0) return { message: "", data: [] };

		const tids = [...new Set(result.data.map((entry) => entry.teamID))];

		context = {
			query     : { teamID: { $in: tids} },
			projection: { _id:0, timeID:1, name:1, gender:1, style:1, course:1, distance:1, teamID:1, time:1, times:1, names:1, athleteID:1, datetime:1, competitionName:1, competitionID:1, poolID:1, rank:1,  },
			limit     : 100000,
			skip      : 0,
		}
		//----------------------------------------------------------------
		const times = await mongodb.find(mongoCFG.Breaststroke.times, context );
		const calcStat = await calculateTeamStatistics(times.data);

		//----------------------------------------------------------------
		context.query.style = { $in: ["freestyleRelay", "medleyRelay"] };
		// const teamTimes = await mongodb.find(mongoCFG.Breaststroke.times, context );
		const teamTimes = times.data.filter(time => time.style.includes("Relay"));
		//----------------------------------------------------------------
		const competitionIDs = [
			...new Set(times.data.map((entry) => entry.competitionID)),
			...new Set(teamTimes.map((entry) => entry.competitionID))
		].filter(item => item !== undefined);;
console.log("competitionIDs=", competitionIDs);

		const teamArr = [];
		for (const team of result.data) {
			let stat = calcStat.teams.find(el => el.teamID == team.teamID);
			stat = stat ?? {};
			team.statistics = {
				teamID					: team.teamID,
				timeCount				: stat.timeCount ?? 0,
				athleteCount		: stat.athleteCount ?? 0,
				competitionCount: stat.competitionCount ?? 0,
				competitions		: stat.competitions ?? [],
				bestTimes				: stat.bestTimes ?? [],
				teamTimes				: teamTimes ?? [],
				swimmersEvent		: stat.swimmersEvent ?? [],
				medals					: stat.medals ?? [],
				major						: stat.major ?? [],
				latest					: stat.latest ?? {},
				first						: stat.first ?? {},
				points					: stat.points ?? 0,
			};
			teamArr.push(team);
		}
		// result.data = result.data.filter(team => {
		// 	if (team.timeCount > 0) {
		// 		team.statistics = team.statistics.length > 0 ? team.statistics[0] : {};
		// 		return team;
		// 	}
		// });
		// console.log("searchRealtime.search.query=", query, result.data[0].statistics.competitions, result.count);
		// console.log("search.query=", query, result.data[1]);
		return { message: '', data: teamArr, count: result.count, };
	});

	// find teams
	static async merge(body) {
		const timeID = Number(body.timeID);
		const query = { timeID: timeID };
		const teamIDs = typeof body.teamIDs == "string" 
													? body.teamIDs.split(',')
																				.map(el=> Number(el.trim()))
																				.filter(el => el => timeID)
													: body.teamIDs;
		console.log("merge.query=", query, "teamIDs=", teamIDs);
		//----------------------------------------------------------------
		// return await mongodb.updateMany(mongoCFG.Breaststroke.times, query, value);
		//----------------------------------------------------------------
	};

	// find teams
	static async list(body) {
		const limit = body.limit ? Number(body.limit) : MAX_LIMIT;
		let skip = (Number(body.page??1)-1)	* limit;
		skip = skip < 0 ? 0 : skip;
		
		const query = {};
		query.teamID = { $ne: 0 };
		if (body.name) {
			if (body.name.slice(-1) == "%") {
				const table = swimmingCFG.charTable.find(el => el.gte == body.name.slice(0, -1).trim());
				query.name = {
					$gte: table.gte,
					$lt: table.lt,
				};
			} else {
				query.indexes = new RegExp(utilLibrary.normalizeString(body.name), "i");
			}
		} else if (!body.mongo) query.points = { $gt: 0 };
		const sort = {};
		if (body.sortField) {
			sort[body.sortField] = body.sortDirection == 'asc' ? 1 : -1;
		} else sort.name = 1;

		const context = {
			query			: query,
			projection: { _id:0, teamID:1, name:1, teamCode:1, nameKor:1, names:1, sido:1, masters:1, logo:1,},
			limit			: limit,
			skip			: skip,
			sort			: sort,
		}
		console.log("list:", query, context);
		//----------------------------------------------------------------
		const result = await mongodb.find(mongoCFG.Breaststroke.teams, context)
		//----------------------------------------------------------------
		console.log("result.data=", result.data.length);
		
    result.data = result.data.map(data => Customizing.field(data));
		console.log("result.data=", result.data.length);
		return result;
	}

	// find teams
	static async getNames(body) {
		console.log("getNames.body:", body);
		// query.competitionCount = { $gt: 0}
		const query = { indexes: new RegExp(body.name.trim(), "gi") };
		const context = {
			query			: query,
			projection: { _id:0, teamID:1, name:1, competitionCount:1, members:1, points:1, medals:1 },
			limit			: body.limit ? Number(body.limit) : MAX_LIMIT,
			skip			: body.skip ? Number(body.skip) : 0,
			sort			: { points:-1 },
		}
		//----------------------------------------------------------------
		const result = await mongodb.find(mongoCFG.Breaststroke.teams, context)
		//----------------------------------------------------------------
		console.log("teams.names=====>", result.data);
		return result;
	}

  

	//####################################################################
	//######### Confirm ##################################################
	//####################################################################

  
	// view
	static async viewOLD(teamID) {
		//----------------------------------------------------------------
		const aggregate = [
			{ $match: { teamID: Number(teamID)} },
			// { $lookup:{
			// 		from				: mongoCFG.Breaststroke.teamStatics,
			// 		localField	: "teamID",
			// 		foreignField: "teamID",
			// 		as					: "statistics"
			// 	}
			// },
			{ $lookup: {
					from: mongoCFG.Breaststroke.teamStatics,
					let: { teamID: "$teamID" },
					pipeline: [
						{ $match: { $expr: { $eq: ["$teamID", "$$teamID"] } } },
						{ $project: { _id: 0, } } // 필요한 필드만 선택
					],
					as: "statisticsArr"
				}
			},
			{ $addFields: {
					statisticsCount: { $size: "$statisticsArr" }
				}
			},
			{ $addFields: {
					statistics: { $arrayElemAt: ["$statisticsArr", 0] } // statistics 배열의 첫 번째 요소
				}
			},
			{ $project: { _id:0, names:0, indexes:0, statisticsArr:0, statisticsCount:0 }},
		];
		const result = await mongodb.aggregate(mongoCFG.Breaststroke.teams, aggregate );
		if (result.data.length == 0) return { message: "", data: {} };
		result.data = result.data[0];
// console.log("result.data.statistics=", result.data);
		if (result.data.statistics && result.data.statistics.competitions) {
			result.data.statistics.competitions = result.data.statistics.competitions.reduce((arr, competition) => {
																															const comp = memoryDB.getCompetition(competition.competitionID);
																															const value = {
																																competitionID		: competition.competitionID,
																																fullname				: comp.fullname,
																																sido						: comp.sido,
																																dateStart				: comp.dateStart,
																																isMasters				: comp.isMasters ?? true,
																																isAdult					: comp.isAdult ?? true,
																																timeCount				: competition.timeCount ?? 0,
																																athleteCount		: competition.athleteCount ?? 0,
																																medals					: competition.medals ?? {},
																															}
																															arr.push(value);
																															return arr;
																														}, []);
		}
		console.log("teams.view:", result.data);
		if (result.data.statistics && result.data.statistics.bestTimes) {
		result.data.statistics.bestTimes = result.data.statistics.bestTimes.reduce((arr, time) => {
																															const value = { ...time, ...time.times[0],}
																															delete value.times;
																															arr.push(value);
																															return arr;
																														}, []);
		}
		return { message: "", data: result.data };

		const team = extend(true, {}, result.data);
	
		const query = {
			teamID		: teamID,
			masters		: true,
			adult			: true,
			// individual: true,
			poolID		:{ $exists: true },
			$or: [ {status: ""}, { status: { $exists: false }} ],
			time			: { $gt: 0 },
		}
	
		const context = {
			query			: query,
			projection: {_id:0, timeID:1, teamID:1, athleteID:1, poolID:1, competitionID:1, gender:1, style:1, distance:1, team:1, name:1, names:1, nameHide:1, rank:1, time:1, times:1, datetime:1, },		
			limit			: 100000,
			skip			: 0,
			sort			: { competitionID:1 },
		}  
		//----------------------------------------
		const times = await mongodb.find(mongoCFG.Breaststroke.times, context)
		//----------------------------------------
	
		const teamStatics = await utilDatabase.teamStatics(times.data, teamID);
		team.extraInfo = {
			// styles : teamStatics.styles,
			// majorStyle: teamStatics.majorStyle,
			// majorTimes : teamStatics.majorTimes,
			// latestTimes : teamStatics.latestTimes,
		};
	
		team.bestTimes = utilDatabase.getBestTimes(times.data).bestTimes;
		team.competitionsStatics = teamStatics.competitionsStatics;
		team.athletesStatics = teamStatics.athletesStatics;
		//----------------------------------------------------------------

		return { message: '', data: team };
	} 

	static search = (async (body) => {
		let skip = (Number(body.page??1)-1)	* MAX_LIMIT; skip = skip < 0 ? 0 : skip;
		const query = {}; // { $and: [ {name: { $ne: ""} }, { name: {  $ne: "개인" } } ] };
		if (body.name) query.indexes = new RegExp(utilLibrary.normalizeString(body.name), "gi");
		// relative: relative, absolute
		// sort: asc, desc
		// field
		
		//----------------------------------------------------------------
		const aggregate = [
			{ $match: query },
			// { $lookup:{
			// 		from				: mongoCFG.Breaststroke.teamStatics,
			// 		localField	: "teamID",
			// 		foreignField: "teamID",
			// 		as					: "statistics"
			// 	}
			// },
			{
				$lookup: {
					from: mongoCFG.Breaststroke.teamStatics,
					let: { teamID: "$teamID" },
					pipeline: [
						{ $match: { $expr: { $eq: ["$teamID", "$$teamID"] } } },
						{ $project: { _id: 0, swimmersEvent:0, competitions:0, bestTimes:0, latest:0, first:0 } } // 필요한 필드만 선택
					],
					as: "statisticsArr"
				}
			},
			{ $addFields: {
					statisticsCount: { $size: "$statisticsArr" }
				}
			},
			{ $match: { statisticsCount: { $gt: 0 } }},
			{ $addFields: {
					statistics: { $arrayElemAt: ["$statisticsArr", 0] } // statistics 배열의 첫 번째 요소
				}
			},
			{ $limit: skip+(body.limit ? Number(body.limit) : MAX_LIMIT), },
			{ $skip			: skip },
			{ $project: { _id:0, names:0, indexes:0, statisticsArr:0, statisticsCount:0 }},
			{ $sort: { "statistics.points": -1 } },
		];
		//----------------------------------------------------------------
		const result = await mongodb.aggregate(mongoCFG.Breaststroke.teams, aggregate );
		console.log("query=", query, aggregate, result.data.length);
		//----------------------------------------------------------------
		if (result.data.length == 0) return { message: "", data: [] };
		// result.data = result.data.filter(team => {
		// 	if (team.timeCount > 0) {
		// 		team.statistics = team.statistics.length > 0 ? team.statistics[0] : {};
		// 		return team;
		// 	}
		// });
		console.log("search.query=", query, result.data[0].statistics, result.data.length);
		// console.log("search.query=", query, result.data[1]);
		return result;
	});	

	// merge
	static async merge(body) {
		let returnObj = { message: "", };
		console.log("teams.merge.value=", value);
		//----------------------------------------------------------------

  //--------------------------------------------------
  //  find team
  //--------------------------------------------------
	const teamID = Number(body.teamID);
  const projection = { _id:0, teamID:1, name:1, nameKor:1, nameEng:1, names:1, indexes:1 };
	const query = { teamID: teamID };
	const result = await mongodb.findOne(mongoCFG.Breaststroke.teams, query, projection);
  const teamSrc = result.data;

  //--------------------------------------------------
  //  find merged teams
  //--------------------------------------------------
  const teamIDs = body.mergedTeamIDs.split(',').reduce((arr, id) => {
																									// if (id > 0) arr.push(Number(id));
																									arr.push(Number(id));
																									return arr;
																								}, []);

  const mergedQuery = { teamID: { $in: teamIDs } };
  let context = {
    query : mergedQuery,
    projection: projection,
  }
  console.log("mergedQuery=", mergedQuery);
  const resultMerged = await mongodb.find(mongoCFG.Breaststroke.teams, context);

  //--------------------------------------------------
  //  merge names
  //--------------------------------------------------
  const names = extend(true, [], teamSrc.names);
  console.log("names=", names);
  for (const team of resultMerged.data) {
    for (const mergedName of team.names) {
      norm_merged = utilLibrary.normalizeString(mergedName);
      let exists = false;
      for (const name of teamSrc.names) {
        norm = utilLibrary.normalizeString(name);
        if (norm == norm_merged) {
          exists = true;
          break;
        }
      }  
      if (!exists) names.push(mergedName);
    }
  }
  
  //--------------------------------------------------
  //  update team
  //--------------------------------------------------
  teamSrc.names = names;
	const teamOBJ = indexDAO.indexing(teamSrc);
	returnObj = await mongodb.updateOne(mongoCFG.Breaststroke.teams, query, teamOBJ);

  //--------------------------------------------------
  //  update teamID teams
  //--------------------------------------------------
  const value = { teamID: teamID };
	returnObj = await mongodb.updateMany(mongoCFG.Breaststroke.teams, mergedQuery, value);
	returnObj = await mongodb.updateMany(mongoCFG.Breaststroke.leaderboard, mergedQuery, value);
	returnObj = await mongodb.updateMany(mongoCFG.Breaststroke.athletes, mergedQuery, value);

  //--------------------------------------------------
  //  remove teams
  //--------------------------------------------------
	returnObj = await mongodb.deleteMany(mongoCFG.Breaststroke.teams, mergedQuery);
  console.log("deleteMany=", returnObj);
  //--------------------------------------------------
  //  statics teams
  //--------------------------------------------------
  context = {
    query     : {
      teamID    : teamID,      
			masters		: true,
			adult			: true,
			individual: true,
			athleteID	: { $exists: true },
			poolID		: { $exists: true },
			$or				: [ {status: ""}, { status: { $exists: false }} ],
			team			: { $gt: 0 }
    },
    projection: projection,
    limit     : 10000,
    skip      : 0,
  }
	const teams = await mongodb.find(mongoCFG.Breaststroke.teams, context);
	const team = buildStaticsDAO.teamsStatics(teams.data, teamID);
	returnObj = await mongodb.updateOne(mongoCFG.Breaststroke.teams, { teamID    : teamID }, team);

		return returnObj;
	}
  
	// statistics
	static async buildStatistics(teamID) {
		console.log("teams.buildStatistics.value=", teamID);

		const context = {
			query			: {},
			projection: { _id:0, },
			limit			: 200000,
			skip			: 0,
			sort			: { rank:1 },
		}
		const result = await mongodb.find(mongoCFG.Breaststroke.teams, context);
		
		
	}
  
	// statistics
	static async statistics(teamID) {
		console.log("teams.statistics.value=", teamID);
		
		return this.view(teamID);
	}
  
	// setTimesTeamID
	static async setTimesTeamID() {
		const query = { $or:[ { team:"" }, { teamID:0 }, { teamID: {$exists:false } } ]};
		let times = await mongodb.distinct(mongoCFG.Breaststroke.times, "team", query)

		const context = {
			// query: { teamID: { $in: uploadedCompetitions } },
			projection: {_id:0, },
			limit: 100000,
			skip: 0,
			sort: { teamID:1 },
		}
		const teams = await mongodb.find(mongoCFG.Breaststroke.teams, context);
		console.log("teams=", teams.data.length);

		const notExists = [];
		for (const teamName of times.data) {
			const name = utilLibrary.normalizeString(teamName);
			if (name) {
				console.log("team=", name);
				const team = teams.data.find(tm => (tm.indexes||[]).includes(name));
				if (team) {
					const query = { $or:[ { teamID:0 }, { teamID: { $exists: false } } ], team: teamName };
					const value = { teamID: team.teamID };
					await mongodb.updateMany(mongoCFG.Breaststroke.times, query, value)
				} else {
					notExists.push(teamName);
				}
			}
		}
		console.log("team.not found: ", notExists);
		return notExists.join(',');
	}
  
	// resetTimesTeamID
	static async resetTimesTeamID() {
		const query = { team: {$exists:true }, team: { $ne: "" } };
		let times = await mongodb.distinct(mongoCFG.Breaststroke.times, "team", query)
	
		const context = {
			// query: { teamID: { $in: uploadedCompetitions } },
			projection: {_id:0, },
			limit: 100000,
			skip: 0,
			sort: { teamID:1 },
		}
		const teams = await mongodb.find(mongoCFG.Breaststroke.teams, context);
		console.log("teams=", teams.data.length);
	
		const notExists = [];
		for (const teamName of times.data) {
			const name = utilLibrary.normalizeString(teamName);
			if (name) {
				console.log("team=", name);
				const team = teams.data.find(tm => (tm.indexes||[]).includes(name));
				if (team) {
					const query = { team: teamName };
					const value = { teamID: team.teamID, team: team.name, teamName: teamName };
					await mongodb.updateMany(mongoCFG.Breaststroke.times, query, value)
					// console.log("----->", query, value);
				} else {
					notExists.push(teamName);
				}
			}
		}
		console.log("team.not found: ", notExists);
		return notExists.join(',');
	}
  
	// resetAthletesPersonalTeamID
	static async resetAthletesPersonalTeamID() {
		let context = {
			query: { team: { $in: ["", '개인'] } },
			projection: { _id:0, athleteID:1, name:1, team:1, teamID:1, },
			limit: 100000,
			skip: 0,
		};
		const athletes = await mongodb.find(mongoCFG.Breaststroke.athletes, context)
	
		for (const athlete of athletes.data) {
			let query = { athleteID: athlete.athleteID, team: { $nin: ["", '개인'] } };
			const projection = { _id:0, name:1, team:1, teamID:1 }; 
			const time = await mongodb.findOne(mongoCFG.Breaststroke.times, query, projection)
			if (time.data.team) {
				query = { athleteID: athlete.athleteID };
				const value = { teamID: time.data.teamID, team: time.data.team, note: `${time.data.name}-${time.data.team}` };
				await mongodb.updateOne(mongoCFG.Breaststroke.athletes, query, value)    
			}
		}
	}
  
	// setAthletesTeamID
	static async setAthletesTeamID() {
		const query = { teamID: { $exists:false } };
		let athletes = await mongodb.distinct(mongoCFG.Breaststroke.athletes, "team", query)
	
		const context = {
			// query: { teamID: { $in: uploadedCompetitions } },
			projection: {_id:0, },
			limit: 100000,
			skip: 0,
			sort: { teamID:1 },
		}
		const teams = await mongodb.find(mongoCFG.Breaststroke.teams, context);
		console.log("teams=", teams.data.length);
	
		const notExists = [];
		for (const teamName of athletes.data) {
			const name = utilLibrary.normalizeString(teamName);
			if (name) {
				const team = teams.data.find(tm => (tm.indexes||[]).includes(name));
				if (team) {
					const query = { teamID: { $exists:false }, team: teamName };
					const value = { teamID: team.teamID };
					await mongodb.updateMany(mongoCFG.Breaststroke.athletes, query, value)
				} else {
					notExists.push(teamName);
				}
			}
		}
		console.log("team.not found: ", notExists);
		return notExists.join(',');
	}
  
	// getTeamTimesNotExists
	static async getTeamTimesNotExists() {
		console.log("getTeamTimesNotExists");
	
		await this.setTimesTeamID();
	
		const query = { $or:[ { team:"" }, { teamID:0 }, { teamID: {$exists:false } } ]};
		let times = await mongodb.distinct(mongoCFG.Breaststroke.times, "team", query)
	console.log("+++++++++", times.data.join(', '));
	
	
		return times.data.join(', ');
	}
  
	// getTeamAthletesNotExists
	static async getTeamAthletesNotExists() {
		console.log("getTeamTimesNotExists");
	
		await this.setAthletesTeamID();
	
		const query = { $or:[ { team:"" }, { teamID:0 }, { teamID: {$exists:false } } ]};
		let times = await mongodb.distinct(mongoCFG.Breaststroke.times, "team", query)
	console.log("+++++++++", times.data.join(', '));
	
	
		return times.data.join(', ');
	}
  
	// setTimesTeamIDbyTeam
	static async setTimesTeamIDbyTeam() {
		console.log("setTimesTeamIDbyTeam");
		const query = { $or:[ { team:"" }, { teamID:0 }, { teamID: {$exists:false } } ]};
		let times = await mongodb.distinct(mongoCFG.Breaststroke.times, "team", query)
	console.log("+++++++++", times.data);
	
		// const query = { $or:[ { team:"" }, { teamID:0 }, { teamID: {$exists:false } } ]};
		const context = {
		  query: { teamID:{ $ne: 0 }, $and: [ { name: { $ne: '' } }, { name: { $ne: '개인' } } ], fin: { $exists: false } },
		  projection: { _id:0, indexes:1, },
		  limit: 1000,
		  skip: 0,
		}
		const result = await mongodb.find(mongoCFG.Breaststroke.times, context);
		const teams = [];
		for (const timeTeam of times.data) {
			const teamName = utilLibrary.normalizeString(timeTeam); // time.team.toUpperCase();
			const team = result.data.filter(el =>  el.indexes && el.indexes.includes(teamName));
			if (team.length > 0) {
				console.log("times.data=", time, teamName, team);
			} else {
				teams.push(timeTeam);
			}
		}
	
		console.log("teams = ", teams);
		return teams;	
	}

	static getByName = (async (body) => {
		let query = {
			indexes: RegExp(utilLibrary.normalizeString(body.name), "gi")
		};
		const result = await this.list(query, body);	
		const limit = body.limit ? Number(body.limit) : 64;		
		
		let seqno = 1;
		result.data = result.data.reduce((arr, team, seq) => {
																//-----------------------------------
																//	calculate ratios
																//-----------------------------------
																team.rankRatios= [ 0, 0, 0 ];
																if (team.rank && team.timeCount > 0) {
																	for (let no = 0; no < 3; no++) {
																		team.rankRatios[no] = parseInt(team.rank[no] / team.timeCount * 10000) / 100;
																	}
																}

																//-----------------------------------
																const value = {
																	teamID		: team.teamID,
																	name			: team.name,
																	names			: team.names,
																	latestDate: team.latestDate,
																	members		: team.members,
																	rank			: team.rank || [0,0,0],
																	rankRatios: team.rankRatios,
																	no				: seqno++
																}
																if (team.logo) value.logo = team.logo;
																if(seqno < limit) arr.push(value);
																return arr;
															}, [])
		return result;
	});

	static getList = (async (body) => {
		const query = { $and: [ {name: { $ne: ""} }, { name: {  $ne: "개인" } } ] };
		if (body.name) query.indexes = new RegExp(utilLibrary.normalizeString(body.name), "gi");
		// relative: relative, absolute
		// sort: asc, desc
		// field

		const result = await this.list(query, body);		
		const limit = body.limit ? Number(body.limit) : 64;		

		result.data = result.data.slice(0, limit+10).reduce((arr, team, seqno) => {
																									//-----------------------------------
																									//	calculate ratios
																									//-----------------------------------
																									team.rankRatios= [ 0, 0, 0 ];
																									if (team.rank && team.timeCount > 0) {
																										for (let no = 0; no < 3; no++) {
																											team.rankRatios[no] = parseInt(team.rank[no] / team.timeCount * 10000) / 100;
																										}
																									}

																									//-----------------------------------
																									const value = {
																										teamID		: team.teamID,
																										name			: team.name,
																										names			: team.names,
																										latestDate: team.latestDate,
																										members		: team.members,
																										rank			: team.rank,
																										rankRatios: team.rankRatios,
																										no				: seqno + 1
																									}
																									if (team.logo) value.logo = team.logo;
																									if(seqno < limit) arr.push(value);
																									return arr;
																								}, [])
		return result;
	});
	

	// rankCompetition
	static rankCompetition = (async (body) => {
		console.log("teams.rankCompetition.body=", body);
	});

		// rankTotal
		static async rankTotal(body) {
			console.log("teams.rankTotal.body=", body);
		//----------------------------------------------------------------
		const returnObj = { message: "", data: {} };
		
		//-----> get team points
		let result = await mongodb.findOne(mongoCFG.Breaststroke.config, { type: "teamPoints" }, { _id:0, type:0, } );
		const points = result.data;
	
		const competitionID = 2;
		const context = {
			query: { competitionID : competitionID, $or: [ { status: { $exists: false } },{ status: "" }, ] , time: { $gt: 0 }, fin: { $exists: false } },
			projection: {_id:0, name:1, style:1, gender:1, distance:1, course:1, rank:1, timeID:1, team:1, teamID:1, competitionID:1 },
			limit: 5000,
			skip: 0,
		}
		result = await mongodb.find(mongoCFG.Breaststroke.times, context);
		let times;
		const staticStruct = teamStatics.putStaticStruct(competitionID, result.data);
	
		const staticArr =[];
		Object.keys(staticStruct).forEach(teamID => {
			const value = {
				teamID        : teamID,
				competitionID : competitionID,
				team          : staticStruct[teamID]["team"],
				teams         : staticStruct[teamID],
				rank          : 0,
				points        : 0,
			}
			staticArr.push(value);
		})
		fs.writeFileSync("statics.txt", JSON.stringify(Object.values(staticArr), null, '\t')); // ["128"]
		// console.log(teams.slice(0, 10));
		// console.log(JSON.stringify(teams.slice(0, 10), null, '\t'));
	
		let csv = "";
		let no = 1;
		csv = "no\tname\tcompetitionID\tteamID\tstyle\tgender\tdistance\tcourse\trank\ttimeID\n"
		for (const {name, competitionID, teamID, style, gender, distance, course, rank, timeID } of result.data) {
			csv += `${no++}\t${name}\t${competitionID}\t${teamID}\t${style}\t${gender}\t${distance}\t${course}\t${rank}\t${timeID}\n`;
		}
		fs.writeFileSync("times.txt", csv);
	

		return returnObj;
	}

	// detail
	static async detail(body) {
		console.log("teams.detail.body=", body);
		//----------------------------------------------------------------
		const query = { teamID: Number(body.teamID) };
		const result = await mongodb.findOne(mongoCFG.Breaststroke.teams, query, { _id:0, teamID:1, logo:1, name:1, teamCode:1, sido:1, masters:1, featured:1, adult:1,});
		if (result.data.teamID == undefined) return utilError.errorMSG("Model","teams", "detail", "no data");
		// result.data = Customizing.field(result.data);
		//----------------------------------------------------------------
console.log("=====>", result);
		return result;
	}
	// insert
	static async insert(body) {
		const value = Customizing.field(body);
	
	//-----> check exists
	const norm = utilLibrary.normalizeString(value.name);
	const check = await mongodb.findOne(mongoCFG.Breaststroke.teams, {indexes: norm}, { _id:0, })
	if (check.data.name) {
		console.log("teams.insert.value.", value, "exists...");
		return check;
	}
	//----------------------------------------------------------------

	body.teamID = await mongodb.max(mongoCFG.Breaststroke.teams, "teamID", {});
	const teamOBJ = this.indexing(body);
	console.log("teams.insert.value=", teamOBJ);

	// console.log("teams.insert.teamOBJ.", teamOBJ);
	const returnObj = await mongodb.insertOne(mongoCFG.Breaststroke.teams, teamOBJ);
	returnObj.data = teamOBJ;
		//----------------------------------------------------------------
		return returnObj;
	}
	
	//===========================================
	static indexing(body) {	
		try {
			if (body.names) {
				let names = [];
				if (!body.names) body.names = body.name;
				if (!Array.isArray(body.names)) body.names = [body.names.toString()];
				for (let name of body.names) {
					if (name.includes(",")) {
						name = name.split(',').map(el => el.trim()).filter(el=>el);
						names = [...names, ...name];
					} else {
						names.push(name);
					}
				}
				body.names = names;
			}
		} catch (e) {
			console.log("indexing.error", e, body);
		}
		body.names = body.names || [];
		
		const teamOBJ = { teamID: Number(body.teamID), name: body.name, nameKor: body.nameKor || '', nameEng: body.nameEng || '', names: [], indexes: [], };
		teamOBJ.name = body.name ? body.name.toString().trim() : "";
		if (body.nameKor) teamOBJ.nameKor = body.nameKor.toString().trim();
		if (body.nameEng) teamOBJ.nameEng = body.nameEng.toString().trim();
		if (body.logo) teamOBJ.logo = body.logo;
		if (typeof body.names == 'string') body.names = (body.names || '').split('|');
	
		// names
		body.names.push(body.name);
		body.names.push(utilLibrary.normalizeMSKR(teamOBJ.name));
		if (body.nameKor) body.names.push(body.nameKor);
		if (body.nameEng) body.names.push(body.nameEng);
		teamOBJ.names = [...new Set(body.names)]
	
		const indexes = [];
		for (let name of teamOBJ.names) {
			const norm = utilLibrary.normalizeString(name);
			if (norm && !teamOBJ.indexes.includes(norm)) {
				indexes.push(norm);
			}
		}
		teamOBJ.indexes = [...new Set(indexes)];
	
		return teamOBJ;
	}

	// update
	static async update(body) {
		if (Object.keys(body).length < 2) return utilError.errorMSG("Model","teams", "update", "field not found");

		const value = Customizing.field(body);
		if (!value.teamID) value.teamID = await mongodb.max(mongoCFG.Breaststroke.teams, "teamID", {});
		const query = { teamID: value.teamID };
		// delete value.teamID;

		const result = await mongodb.findOne(mongoCFG.Breaststroke.teams, query);

		if (!body.nameKor && result.data.nameKor) value.nameKor = result.data.nameKor;
		if (!body.nameEng && result.data.nameEng) value.nameEng = result.data.nameEng;
		if (!body.names && result.data.names) value.names		= result.data.names;
		// const teamOBJ = this.indexing(value);	
		// console.log("teamOBJ=", teamOBJ);

		const { names, indexes } = utilLibrary.indexingNames(value);
		value.names = names;
		value.indexes = indexes;
	console.log("update=", query, value);
		//----------------------------------------------------------------
		return await mongodb.updateOne(mongoCFG.Breaststroke.teams, query, value);
		//----------------------------------------------------------------
	}

  // update status to delete
  static async updateDelete(teamID, userID) {
    const query = { teamID: Number(teamID), userID: Number(userID) };
		const value = {
      status  : 'deleted',
      deleted : new Date(),
    }
	
		//----------------------------------------------------------------
		returnObj = await mongodb.updateOne(mongoCFG.Breaststroke.teams, query, value);
		//----------------------------------------------------------------

    return returnObj;
  }

	// delete
	static async delete(teamID) {
		try {
			const query = { teamID: Number(teamID) };
			console.log("delete", query);
			//----------------------------------------------------------------
			return await mongodb.deleteOne(mongoCFG.Breaststroke.teams, query);
			//----------------------------------------------------------------
		} catch (e) {
			return utilError.errorMSG("Model","teams", "delete", "catch." + err);
		}
	}

	static async create() {
		const indexes = [
			{ query: { teamID:1 }, name: "teamID", option: { unique: true }	},
			{ query: { "teams.category":1 }, name: "category"	},
		];
		await mongodb.createCollectionNindex(mongoCFG.Breaststroke.teams, indexes);
	}

}

module.exports = TeamModel;

