const extend 			= require('node.extend');
const mskCFG 			= require('../../Config/mskCFG');
const mongoCFG 		= require('../../Config/mongoCFG');
const mongoDB			= require('../../Class/MongoDB');
const utilLibrary	= require('../../Class/utilLibrary');
const UtilDate		= require("../../Class/DateLibrary");
const TimeLibrary = require('../../Class/TimeLibrary.js');

const timeLibrary = new TimeLibrary();

const MemoryDB		= require('../../Class/MemoryDB');
const memoryDB		= new MemoryDB();

const mongodb 		= new mongoDB(mongoCFG.Breaststroke.database);
const utilDate		= new UtilDate();

const PK = "LID";
const MAX_BUILD_COUNT = 10000;
const MAX_LIMIT = 2000;
const RANK = 10000;

class LeaderboardModel {
	static async listRealtime(query, limit=8, skip=0) {
		query.athleteID	= { $gt: 0 };
		query['$or'] = [ {status: ""}, { status: { $exists: false }} ];
		delete query.group;
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
								// thumbnail				: "$bestRecord.thumbnail",
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

		console.log("mergedTimes-------------------");
		const result = await mongodb.aggregate("mergedTimes", aggregate);
		// const result = await mongodb.aggregate(mongoCFG.Breaststroke.times, aggregate);

		const athleteIDs = [...new Set(result.data[0].data.filter(el => el.athleteID).map(entry => entry.athleteID))];
		// console.log("athleteIDs=", athleteIDs);
		const context = {
			query			: { athleteID: { $in: athleteIDs } },
			projection: { _id:0, athleteID:1, thumbnail:1, featured:1, },
			limit			: 1000,
			sort			: { athleteID:1, },	
		};
		const athletes = await mongodb.find(mongoCFG.Breaststroke.athletes, context);
		// console.log("athletes=", athletes.data);
		result.data[0].data.forEach((time) => {
			if (time.athleteID) {
				const athlete = athletes.data.find(athlete => athlete.athleteID == time.athleteID);
				time.thumbnail = athlete?.thumbnail ?? athlete?.featured ?? '';
				// time.nameHide = utilLibrary.nameHideAllNotCircle(time.name);

				// console.log("---->", time.thumbnail);
			}
			if (time.datetime) time.datetime = new Date(time.datetime).toISOString().slice(0, 10)
		})
		// {
		// 	"data": [ 
		// 		{
		// 			"timeID" : 65892,
		// 			"name" : "권용우",
		// 			"time" : "20.50",
		// 			"timeStamp" : 0.000237268518518519,
		// 			"rank" : 1,
		// 			"datetime" : "2024-06-23",
		// 			"sido" : "대구",
		// 			"ageGroup" : "성인부1그룹",
		// 			"competitionID" : 1372,
		// 			"competitionName" : "제44회 대구광역시장배 수영대회 겸 제14회 대구광역시장배 전국마스터즈 수영대회",
		// 			"poolID" : 353,
		// 			"pool" : "두류수영장",
		// 			"teamID" : 3134,
		// 			"team" : "S앤S"
		// 		}, 
		// 	],
		// 	"count" : 11014
		// }
		// console.log("++++++++++++", result.data[0].data.slice(0, 10));
		if (result.data.length == 0) return { message: "no data", times: [], count: 0 };
		// rank 부여
		const assignTimes = timeLibrary.assignRanksMedalbank(result.data[0].data);
		// console.log("assignTimes=", assignTimes.slice(0, 10));

		// eoghlaud, tndudwkdaud, xlaaud qnsfl
		const { times, compression } = timeLibrary.getCompetitionsTeamsPools(assignTimes);

		const returnObj = {
			count	: result.data[0].count,
			data	: {
				times				: assignTimes,
				compression	: compression,
			},
		};
		console.log("----------++++++------", returnObj.data.times.length);

		return returnObj;

	}
	
	static async listRealtimeElite(query, limit=8, skip=0) {
		query.timeStamp = { $gt: 0 };
		delete query.group;
		// console.log("1>query=", query);

		// query.group = "all";
		query.isMasters = false;
		query['$or'] = [ {status: ""}, { status: { $exists: false }} ];
		
		delete query['$or'];
		delete query.isAdult;
		delete query.type;
		delete query.fin;
		delete query.course;
		// query = { 
		// 	discipline: 'breaststroke', 
		// 	gender: 'women', 
		// 	course:"LCM", 
		// 	distance: '50M', 
		// 	timeStamp: { '$gt': 0 },
		// 	isMasters : true , 
		// 	isAdult : true,
		// 	$or: [ {status: ""}, { status: { $exists: false }} ]
		// };
// console.log("leaderboards.list.query:", query, "limit:", limit, "skip:", skip);
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
								// thumbnail				: "$bestRecord.thumbnail",
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

		const result = await mongodb.aggregate(mongoCFG.Breaststroke.eliteTimes, aggregate);
// console.log("query=", query, "eliteTimes------>", result.data[0].data);
		const athleteIDs = [...new Set(result.data[0].data.filter(el => el.athleteID).map(entry => entry.athleteID))];
		// console.log("athleteIDs=", athleteIDs);
		const context = {
			query			: { athleteID: { $in: athleteIDs } },
			projection: { _id:0, athleteID:1, thumbnail:1, },
			limit			: 1000,
			sort			: { athleteID:1, },	
		};
		const athletes = await mongodb.find(mongoCFG.Breaststroke.eliteAthletes, context);
		// console.log("eliteAthletes------>", athletes.data);
		// console.log("athletes=", athletes.data);
		result.data[0].data.forEach((time) => {
			if (time.athleteID) {
				const athlete = athletes.data.find(athlete => athlete.athleteID == time.athleteID);
				time.thumbnail = athlete.thumbnail ?? '';
				time.nameHide = utilLibrary.nameHideAllNotCircle(time.name);
				// console.log("---->", time.thumbnail);
			}
			if (time.datetime) time.datetime = new Date(time.datetime).toISOString().slice(0, 10)
		})
		if (result.data.length == 0) return { message: "no data", times: [], count: 0 };
		// rank 부여
		const assignTimes = timeLibrary.assignRanksMedalbank(result.data[0].data, skip);

		const returnObj = {
			count	: result.data[0].count,
			data	: {
				times				: assignTimes,
				// compression	: { competitions: [], teams: [], pools: [] },
			},
		};
		// console.log(returnObj.data);

		return returnObj;

	}

}

module.exports = LeaderboardModel;

