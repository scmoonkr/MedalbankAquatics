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

const mongodb 		= new mongoDB(mongoCFG.Medalbank.database);
const utilDate		= new UtilDate();

const PK = "LID";
const MAX_BUILD_COUNT = 10000;
const MAX_LIMIT = 2000;
const RANK = 10000;

const _context = {
	query		 	: {},
	projection: { _id:0, },
	limit		 	: MAX_LIMIT,
	skip			: 0,
	sort			: { _id:-1 },
}


function getBestTimesByUserID(times) {
  return Object.values(
    times.reduce((acc, current) => {
						const { athleteID, timeStamp } = current;

						// 해당 athleteID가 이미 acc에 있으면 더 작은 timeStamp로 대체
						if (!acc[athleteID] || current.timeStamp < acc[athleteID].timeStamp) {
							acc[athleteID] = current;
						}

						return acc;
					}, {})
  );
}


class LeaderboardModel {
	static async create() {
		const indexes = [
			{ query: { LID:1 }, name: "LID", option: { unique: true }	},
			{ query: { gender:1 }, name: "gender"	},
			{ query: { style:1 }, name: "style"	},
			{ query: { distance:1 }, name: "distance"	},
			{ query: { course:1 }, name: "course"	},
		];
		await mongodb.createCollectionNindex(mongoCFG.Medalbank.leaderboard, indexes);
	}


	//===========================================
	// list
	// get leaderboard for statics
	// 	type: [today | this week | this month]
	//	limit: number
	//===========================================
	static async list(query, limit=8, skip=0) {
		query.timeStamp = { $gt: 0 };
		delete query.group;
		// console.log("1>query=", query);

		query.group = "all";
		query.isAdult = true;
		const context = {
			query			: query,
			projection: { _id:0, group:0, year:0, month:0, week:0, day:0, },
			limit			: limit,
			skip			: skip,
			sort			: { timeStamp: 1 },
		}
		const result = await mongodb.find(mongoCFG.Medalbank.leaderboard, context);		
console.log("leaderboard.list.query.", query);
		result.data = result.data.reduce((arr,time) => {
			time.datetime = new Date(time.datetime).toISOString().slice(0, 10);
			arr.push(time);
			return arr;
		},[]);
		// console.log("----->", result.data);
		// leaderboard: {"dicipline" : {gender, style, course, distance, times: [ { rank, name, time, timeID, athleteID, poolID, competitionID } ] },

		let timeArr = [];
		const assignTimes = timeLibrary.assignRanksMedalbank(result.data);
		// const comp = LeaderboardLibrary.getCompetitionsTeamsPools(times);
		const { times, compression } = new TimeLibrary().getCompetitionsTeamsPools(assignTimes);

		const returnObj = { data: {} };
		returnObj.count = await mongodb.count(mongoCFG.Medalbank.leaderboard, query);;
		returnObj.data.times = times;
		returnObj.data.compression = compression;
// console.log("+++++-----> length: ", returnObj.data.times.length, "times", returnObj.data.times.slice(0, 2));
console.log("+++++-----> ", returnObj.data.length, returnObj.data.times[0]);
// console.log("compression=", compression);
		return returnObj;
	}

	static async list4Capture(body) {
		const query = {
			style					: { $nin: ["freestyleRelay", "medleyRelay"] },
			timeStamp			: { $gt: 0 },
			$or						: [ { status: { $exists: false } },{ status: "" }, ],
			// type					: "event",	// time | event | club
		}
		if (body.competitionID) query.competitionID = Number(body.competitionID);
		if (body.masters 			) query.isMasters			= body.masters == "비등록";
		if (body.gender	 			) query.gender 				= body.gender;
		if (body.course	 			) query.course 				= body.course;
		if (body.adult && body.adult != '전체') query.isAdult				= body.adult == "성인";
		if (body.typeTime 		)	query.type 					= body.typeTime.replace("Result", "");
console.log("query=", query);
		const aggregate = [
			{ $match: query }, // 선수별 최고 기록 추출	
  
			// 1단계: gender, style, course, distance별로 직접 그룹화 (이름 중복 허용)
			{
				$group: {
					_id: {
						gender: "$gender",
						style: "$style",
						course: "$course",
						distance: "$distance"
					},
					records: { $push: "$$ROOT" }
				}
			},

			// 2단계: 각 그룹 내에서 timeStamp 기준으로 정렬하여 상위 10개 선택
			{
				$unwind: "$records"
			},

			{
				$sort: {
						"records.timeStamp": 1
				}
			},

			// 3단계: 다시 그룹화하여 상위 10개만 선택
			{
				$group: {
					_id: {
						gender: "$_id.gender",
						style: "$_id.style",
						course: "$_id.course",
						distance: "$_id.distance"
					},
					topRecords: { $push: "$records" }
				}
			},

			// 4단계: 결과 정리
			{
				$project: {
				gender: "$_id.gender",
				style: "$_id.style",
				course: "$_id.course",
				distance: "$_id.distance",
				times: { $slice: ["$topRecords", 500] },
				_id: 0
			}
		},

		// 5단계: 필요한 필드만 선택
		{
			$project: {
					gender: 1,
					style: 1,
					course: 1,
					distance: 1,
					"times.name": 1,
					"times.time": 1,
					"times.timeStamp": 1,
					"times.datetime": 1,
					// "times.thumbnail": 1,
					"times.rank": 1,
					"times.sido": 1,
					"times.isMasters": 1,
					"times.isAdult": 1,
					"times.timeID": 1,
					"times.athleteID": 1,
					"times.ageGroup": 1,
					"times.teamID": 1,
					"times.competitionID": 1,
					"times.poolID": 1,
					"times.pool": 1,
					"times.team": 1,
					"times.competitionName": 1,
					type: "event",
				}
			},

			// 6단계: 결과 정렬
			{
				$sort: {
					gender: 1,
					style: 1,
					course: 1,
					distance: 1
				}
			}
		];

		const result = await mongodb.aggregate(mongoCFG.Medalbank.times, aggregate);

		let timesAll = [];
		for (const leaderboard of result.data) {
			const times = [];
			for (const time of leaderboard.times) {
				if (times.length >= 10 || times.find(tm => tm.name == time.name)) continue;
				time.gender = leaderboard.gender;
				time.style = leaderboard.style;
				time.course = leaderboard.course;
				time.distance = leaderboard.distance;
				time.type = "event";
				times.push(time);
			}
			timesAll = [ ...timesAll, ...times ];
		}
		result.data = timesAll;
		// result.data= result.data.reduce((arr, leaderboard) => {
		// 													const times = [];
		// 													for (const time of leaderboard.times) {
		// 														if (times.length >= 10 || times.find(tm => tm.name == time.name)) continue;
		// 														times.push(time);
		// 													}
		// 													leaderboard.times = times;
		// 													arr.push(leaderboard);
		// 													return arr;
		// 												},[]);

		const athleteIDs = [...new Set(result.data.filter(el => el.athleteID).map(entry => entry.athleteID))];
		// console.log("athleteIDs=", athleteIDs, query);
		const context = {
			query			: { athleteID: { $in: athleteIDs } },
			projection: { _id:0, athleteID:1, thumbnail:1, },
			limit			: 1000,
			sort			: { athleteID:1, },	
		};
		const athletes = await mongodb.find(mongoCFG.Medalbank.athletes, context);
		console.log("athletes=", athletes.data.length);
		result.data.forEach((time) => {
			if (time.competitionID == 3391) {
				time.athleteID = time.athleteID || 1234567;
			} else {
				time.nameHide = utilLibrary.nameHideAllNotCircle(time.name);
			}
			if (time.athleteID) {
				const athlete = athletes.data.find(athlete => athlete.athleteID == time.athleteID);

				time.thumbnail = athlete?.thumbnail ?? '';
				// console.log("---->", time.thumbnail);
			}
		})
		console.log("result.data=", result.data.length);
		if (result.data.length == 0) return { message: "no data", times: [], compression: {}, count: 0 };
		// rank 부여
		let timeArr = [];
		if (body.adult == "전체") {
			for (const masters of [true, false]) {
				for (const gender of ["men", "women"]) {
					for (const style of ["freestyle", "backstroke", "breaststroke", "butterfly", "individualMedley"]) {
						for (const course of ["LCM", "SCM"]) {
							for (const distance of ["25M", "50M", "100M", "200M", "400M", "800M", "1500M"]) {
								const times = result.data.filter(el => el.isMasters == masters
																										&& el.gender == gender
																										&& el.style == style
																										&& el.course == course
																										&& el.distance == distance);
								if (times.length > 0) {
									const assignTimes = timeLibrary.assignRanksMedalbank(times);
									timeArr = [ ...timeArr, ...assignTimes ];
								}
							}
						}
					}
				}
			}
		} else {
			for (const masters of [true, false]) {
				for (const adult of [true, false]) {
					for (const gender of ["men", "women"]) {
						for (const style of ["freestyle", "backstroke", "breaststroke", "butterfly", "individualMedley"]) {
							for (const course of ["LCM", "SCM"]) {
								for (const distance of ["25M", "50M", "100M", "200M", "400M", "800M", "1500M"]) {
									const times = result.data.filter(el => el.isMasters == masters
																											&& el.isAdult == adult
																											&& el.gender == gender
																											&& el.style == style
																											&& el.course == course
																											&& el.distance == distance);
									if (times.length > 0) {
										const assignTimes = timeLibrary.assignRanksMedalbank(times);
										timeArr = [ ...timeArr, ...assignTimes ];
									}
								}
							}
						}
					}
				}
			}
		}
		// console.log("assignTimes=", assignTimes.slice(0, 10));
// console.log("timeArr=", timeArr.length, timeArr[0]);

		// eoghlaud, tndudwkdaud, xlaaud qnsfl
		const { times, compression } = timeLibrary.getCompetitionsTeamsPools(timeArr);
// console.log("teams=", compression.teams);
console.log("times=", times.length, );

		const returnObj = {
			count	: result.data[0].count,
			data	: {
				times				: times,
				compression	: compression || {},
			},
		};
		// console.log(returnObj.data);

		return returnObj;

	}	

	static async list4CaptureOld(body) {
		const query = {
			style					: { $nin: ["freestyleRelay", "medleyRelay"] },
			timeStamp			: { $gt: 0 },
			$or						: [ { status: { $exists: false } },{ status: "" }, ],
			// type					: "event",	// time | event | club
		}
		if (body.competitionID) query.competitionID = Number(body.competitionID);
		if (body.masters 			) query.isMasters			= body.masters == "비등록";
		if (body.gender	 			) query.gender 				= body.gender;
		if (body.course	 			) query.course 				= body.course;
		if (body.adult && body.adult != '전체') query.isAdult				= body.adult == "성인";
		if (body.typeTime 		)	query.type 					= body.typeTime.replace("Result", "");
console.log(query);
		const aggregate = [
			{ $match: query }, // 선수별 최고 기록 추출	
  
			// 2. 실제 수영 시간(timeStamp) 기준으로 정렬
			{ $sort: { timeStamp: 1 } },
			
			// 3. 선수별 최고 기록 추출 (style-distance별로)
			{ 
				$group: { 
					_id: {
						name: "$name",
						style: "$style",
						distance: "$distance",
						course: "$course" // 필요시 포함
					}, 
					bestRecord: { $first: "$$ROOT" } 
				} 
			},
			
			// 4. 각 style-distance 조합별로 그룹핑하고 상위 10개 선택
			{
				$group: {
					_id: {
						style: "$_id.style",
						distance: "$_id.distance",
						course: "$_id.course"
					},
					topRecords: {
						$push: "$bestRecord"
					}
				}
			},
			
			// 5. 각 그룹 내에서 timeStamp 기준으로 정렬하고 상위 10개만 선택
			{
				$project: {
					_id: 1,
					topRecords: {
						$slice: [
							{
								$sortArray: {
									input: "$topRecords",
									sortBy: { timeStamp: 1 }
								}
							},
							10
						]
					}
				}
			},
			
			// 6. 배열을 개별 문서로 변환
			{ $unwind: "$topRecords" },
			
			// 7. 결과 구조 변경
			{ $replaceRoot: { newRoot: "$topRecords" } },
			
			// 8. 최종 정렬 (style, distance, timeStamp 순)
			{ 
				$sort: { 
					style: 1, 
					distance: 1, 
					timeStamp: 1 
				} 
			},
			
			// 9. 필요한 필드만 선택
			{ 
				$project: { 
					_id: 0,
					isMasters: 1,
					isAdult: 1,
					athleteID: 1,
					name: 1,
					gender: 1,
					style: 1,
					course: 1,
					distance: 1,
					time: 1,
					timeStamp: 1,
					team: 1,
					teamID: 1,
					datetime: 1,
					competitionID: 1,
					competitionName: 1,
					type: 1
				} 
			}
		];

		const result = await mongodb.aggregate(mongoCFG.Medalbank.times, aggregate);

		const athleteIDs = [...new Set(result.data.filter(el => el.athleteID).map(entry => entry.athleteID))];
		console.log("athleteIDs=", athleteIDs, query);
		const context = {
			query			: { athleteID: { $in: athleteIDs } },
			projection: { _id:0, athleteID:1, thumbnail:1, },
			limit			: 1000,
			sort			: { athleteID:1, },	
		};
		const athletes = await mongodb.find(mongoCFG.Medalbank.athletes, context);
		console.log("athletes=", athletes.data.length);
		result.data.forEach((time) => {
			time.nameHide = utilLibrary.nameHideAllNotCircle(time.name);
			if (time.athleteID) {
				const athlete = athletes.data.find(athlete => athlete.athleteID == time.athleteID);

				time.thumbnail = athlete?.thumbnail ?? '';
				// console.log("---->", time.thumbnail);
			}
		})
		if (result.data.length == 0) return { message: "no data", times: [], count: 0 };
		// rank 부여
		let timeArr = [];
		for (const masters of [true, false]) {
			for (const adult of [true, false]) {
				for (const gender of ["men", "women"]) {
					for (const type of ["event", "time"]) {
						for (const style of ["freestyle", "backstroke", "breaststroke", "butterfly", "individualMedley"]) {
							for (const course of ["LCM", "SCM"]) {
								for (const distance of ["25M", "50M", "100M", "200M", "400M", "800M", "1500M"]) {
									const times = result.data.filter(el => el.isMasters == masters
																											&& el.isAdult == adult
																											&& el.gender == gender
																											&& el.type == type
																											&& el.style == style
																											&& el.course == course
																											&& el.distance == distance);
									if (times.length > 0) {
										// console.log("1>", times[0].name, times[0].nameHide);
										const assignTimes = timeLibrary.assignRanksMedalbank(times);
										// console.log("2>", assignTimes[0].name, assignTimes[0].nameHide);
										timeArr = [ ...timeArr, ...assignTimes ];
									}
								}
							}
						}
					}
				}
			}
		}
		// console.log("assignTimes=", assignTimes.slice(0, 10));
// console.log("timeArr=", timeArr.length, timeArr[0]);

		// eoghlaud, tndudwkdaud, xlaaud qnsfl
		const { times, compression } = timeLibrary.getCompetitionsTeamsPools(timeArr);

		const returnObj = {
			count	: result.data[0].count,
			data	: {
				times				: times,
				compression	: compression,
			},
		};
		// console.log(returnObj.data);

		return returnObj;

	}		
	static async listRealtime(query, limit=8, skip=0) {
		query.timeStamp = { $gt: 0 };
		delete query.group;
		// console.log("1>query=", query);

		// query.group = "all";
		// query.isMasters = true;
		query['$or'] = [ {status: ""}, { status: { $exists: false }} ];
		
		// if (!query.isMasters) {
		// 	delete query.isAdult;
		// 	delete query.ageGroup;
		// }
		// query = { 
		// 	style: 'breaststroke', 
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

		const result = await mongodb.aggregate(mongoCFG.Medalbank.times, aggregate);

		const athleteIDs = [...new Set(result.data[0].data.filter(el => el.athleteID).map(entry => entry.athleteID))];
		// console.log("athleteIDs=", athleteIDs);
		const context = {
			query			: { athleteID: { $in: athleteIDs } },
			projection: { _id:0, athleteID:1, thumbnail:1, },
			limit			: 1000,
			sort			: { athleteID:1, },	
		};
		const athletes = await mongodb.find(mongoCFG.Medalbank.athletes, context);
		// console.log("athletes=", athletes.data);
		result.data[0].data.forEach((time) => {
			if (time.athleteID) {
				const athlete = athletes.data.find(athlete => athlete.athleteID == time.athleteID);
				time.thumbnail = athlete?.thumbnail ?? '';
				time.nameHide = utilLibrary.nameHideAllNotCircle(time.name);

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
				times				: times,
				compression	: compression,
			},
		};
		// console.log(returnObj.data);

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
		// 	style: 'breaststroke', 
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

		const result = await mongodb.aggregate(mongoCFG.Medalbank.eliteTimes, aggregate);
// console.log("query=", query, "eliteTimes------>", result.data[0].data);
		const athleteIDs = [...new Set(result.data[0].data.filter(el => el.athleteID).map(entry => entry.athleteID))];
		// console.log("athleteIDs=", athleteIDs);
		const context = {
			query			: { athleteID: { $in: athleteIDs } },
			projection: { _id:0, athleteID:1, thumbnail:1, },
			limit			: 1000,
			sort			: { athleteID:1, },	
		};
		const athletes = await mongodb.find(mongoCFG.Medalbank.eliteAthletes, context);
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
		console.log("eliteTimes------>", result.data[0].data[0]);
		if (result.data.length == 0) return { message: "no data", times: [], count: 0 };
		// rank 부여
		const assignTimes = timeLibrary.assignRanksMedalbank(result.data[0].data, skip);
		console.log("assignTimes------>", assignTimes[0]);
		// console.log("assignTimes=", assignTimes.slice(0, 10));

		// eoghlaud, tndudwkdaud, xlaaud qnsfl
		// const { times, compression } = timeLibrary.getCompetitionsTeamsPools(assignTimes);

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


	/*************************************************************
	 * 
	 * @param {*} type : all, year, month, week, day, period
	 * @param {*} limit 
	 * @param {*} date 
	 * @returns: [ { gender, style, distance, times: [] } ]
	 *************************************************************/
	static async getLeaderboardRealtimeTopN(qry, limit=8) {
		console.log("getLeaderboardRealtimeTopN.query=", qry, "limit=", limit);
		limit = Number(limit);
		const query = {
			// ...qry,
			competitionID	: { $gt: 0 },
			timeStamp			: { $gt: 0 },
			$and					: [
				{ $or				: [
						{ style	: "individualMedley", distance: "200M" }, 
						{ style	: { $in: ["freestyle", "backstroke", "breaststroke", "butterfly"]}, distance: "50M" }
					],
				},
				{ $or 			: [{ status: "" }, { status: { $exists: false } }], }
			],
			
			
		};
		console.log("query=", query);
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
						gender  : "$bestRecord.gender",
						style   : "$bestRecord.style",
						course  : "$bestRecord.course",
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
						gender  : "$_id.gender",
						style   : "$_id.style",
						course  : "$_id.course",
						distance: "$_id.distance"
					},               // total record count
					topRecords: { $push: "$records" }
				}
			},
			{ $project: {
					times: { $slice: ["$topRecords", limit] }
				}
			},
			// 5. 필요한 필드만 선택
			{ $project: {
					gender            			: "$_id.gender",
					style            				: "$_id.style",
					course            			: "$_id.course",
					distance            		: "$_id.distance",
					_id                   	: 0,
					"times.timeID"        	: 1,
					"times.athleteID"     	: 1,
					"times.name"          	: 1,
					"times.time"          	: 1,
					"times.timeStamp"     	: 1,
					"times.rank"          	: 1,
					"times.thumbnail"      	: 1,
					"times.datetime"      	: 1,
					"times.sido"          	: 1,
					"times.competitionID" 	: 1,
					"times.poolID"        	: 1,
					"times.teamID"        	: 1,
					"times.competitionName" : 1,
					"times.pool"        		: 1,
					"times.team"        		: 1,
				}
			},

			{ $sort: { gender:1, style:1, course:1, distance:1 } },
		];
		//----------------------------------------------------------------
		const result = await mongodb.aggregate(mongoCFG.Medalbank.times, aggregate)
		//----------------------------------------------------------------
		const assignTimes = result.data.reduce((arr, lead) => {
																			lead.times = timeLibrary.assignRanksMedalbank(lead.times);
																			arr.push(lead);
																			return arr;
																		},[]);
		// const comp = LeaderboardLibrary.getCompetitionsTeamsPools(times);
		return result;
	}
	//===========================================
	// get leaderboard top n
	// 	type: [all | today | this week | this month]
	//	limit: number
	//	date: start date
	//===========================================
	static async getLeaderboardTopN(type, limit=8, date=new Date()) {
		limit = Number(limit);
		const query = {
			// datetime	: { $gte: startDate, $lt: endOfDate },
			datetime	: mongodb.makeDateQuery(type, date),
			$and					: [
				{ $or				: [
						{ style	: "individualMedley", distance: "200M" }, 
						{ style	: { $in: ["freestyle", "backstroke", "breaststroke", "butterfly"]}, distance: "50M" }
					],
				},
				{ $or 			: [{ status: "" }, { status: { $exists: false } }], }
			],
			timeStamp	: { $gt: 0 },
		};

		//------------------------
		const aggregate1 = [
			{ $match: query },
			// 1. athleteID별로 그룹화하고, 각 athleteID에서 가장 좋은 기록(timeStamp가 작은) 선택
			{ $sort: { timeStamp: 1 } },
			{ $group: {
					_id: "$athleteID",
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
					athleteCount: { $addToSet: "$name" },  // unique athletes
					timeCount: { $sum: 1 },                   // total record count
					topRecords: { $push: "$records" }
				}
			},
			{ $project: {
					times: { $slice: ["$topRecords", limit] }
				}
			},
			// 5. 필요한 필드만 선택
			{ $project: {
					discipline						: "$_id",
					_id										: 0,
					"times.name"					: 1,
					"times.time"					: 1,
					"times.timeStamp"			: 1,
					"times.datetime"			: 1,
					"times.thumbnail"      	: 1,
					"times.rank"					: 1,
					"times.sido"					: 1,
					"times.timeID"				: 1,
					"times.athleteID"			: 1,
					"times.competitionID"	: 1,
					"times.poolID"				: 1
				}
			}
		];
		const aggregate = [
			// 0. query
			{ $match: { competitionID:{ $gt: 0 }, course:"LCM", distance:"50M", style: {$ne: "" }, timeStamp: { $gt: 0 }, isAdult: true, isMasters: true, timeStamp: { $gt: 0 }, } },
			
			// Step 1: Sort the entire collection by timeStamp in ascending order.
			{ 
				$sort: { timeStamp: 1 } 
			},
			// Step 2: Group documents.
			{
				$group: {
					_id: {
						gender: "$gender",
						style: "$style",
						course: "$course",
						distance: "$distance"
					},
					athleteCount: { $addToSet: "$name" },  // unique athletes
					timeCount: { $sum: 1 },                   // total record count
					times: {
						$push: {
							timeID: "$timeID",
							name: "$name",
							time: "$time",
							ageGroup: "$ageGroup",
							athleteID: "$athleteID",
							competitionID: "$competitionID",
							poolID: "$poolID",
							teamID: "$teamID",
							thumbnail: "$thumbnail",
							datetime: "$datetime",
							rank: "$rank"
							// No need to include timeStamp since the documents are pre-sorted
						}
					}
				}
			},
			// Step 3: Project and slice the first three records from the sorted times array.
			{
				$project: {
					gender: "$_id.gender",
					style: "$_id.style",
					course: "$_id.course",
					distance: "$_id.distance",
					timeCount: 1,
					athleteCount: { $size: "$athleteCount" },
					times: { $slice: [ "$times", 1 ] },
					_id: 0
				}
			},
			{ $sort: { gender:1, style:1, course:1, distance:1 } }
		];
		//----------------------------------------------------------------
		const result = await mongodb.aggregate(mongoCFG.Medalbank.times, aggregate)
		//----------------------------------------------------------------
		return result;
	}
	// statistics
	static async getLeaderboardRealtimeAAA(body, limit=8) {
		console.log("getLeaderboardRealtime=", body, limit);
		//----------
		// console.log("startDate=", startDate, "endOfDate=", endOfDate, mongodb.makeDateQuery(body.type));

		limit = Number(limit);
		const query = {
			// datetime	: { $gte: startDate, $lt: endOfDate },
			// datetime	: mongodb.makeDateQuery(body.type, "2025-01-01"),
			$and					: [
				{ $or				: [
						{ style	: "individualMedley", distance: "200M" }, 
						{ style	: { $in: ["freestyle", "backstroke", "breaststroke", "butterfly"]}, distance: "50M" }
					],
				},
				{ $or 			: [{ status: "" }, { status: { $exists: false } }], }
			],
			timeStamp			: { $gt: 0 },
			competitionID	: { $gt: 0 },
			isMasters			: true,	
			isAdult				: true,	
		};
console.log("----->", body);
		const dateQuery = mongodb.makeDateQuery(body.type, "2025-01-01");
		if (Object.keys(dateQuery).length > 0) query.datetime = dateQuery;
// console.log("query=", query);
		//------------------------
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
					discipline						: "$_id",
					_id										: 0,
					"times.name"					: 1,
					"times.time"					: 1,
					"times.timeStamp"			: 1,
					"times.datetime"			: 1,
					"times.thumbnail"			: 1,
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
		//----------------------------------------------------------------
		// console.log(JSON.stringify(result.data, null, '  '));

		// leaderboard: {"dicipline" : {gender, style, course, distance, times: [ { rank, name, time, timeID, athleteID, poolID, competitionID } ] },
		const leaderboard = result.data.reduce((arr, leaderboard) => {
																			const timeArr = leaderboard.times.reduce((arr, time) => {
																																					const value = {
																																						athleteID			: time.athleteID,
																																						name					: time.name,
																																						time					: time.time,
																																						ageGroup			: time.ageGroup,
																																						timeStamp			: time.timeStamp,
																																						competitionID	: time.competitionID,
																																						poolID				: time.poolID,
																																						timeID				: time.timeID,
																																						teamID				: time.teamID,
																																						rank					: time.rank ?? 0,
																																						sido					: time.sido || "",
																																						thumbnail			: time.thumbnail ?? '',
																																						datetime			: time.datetime,
																																						competitionName	: time.competitionName,
																																						pool					: time.pool,
																																						team					: time.team,
																																					}
																																					arr.push(value);
																																					return arr;
																																				}, []);
																			const times = timeLibrary.assignRanksMedalbank(timeArr);
																			if (times.length > 0) {
																				const discipline = {
																					gender				: leaderboard.discipline.gender,
																					style					: leaderboard.discipline.style,
																					course				: leaderboard.discipline.course,
																					distance			: leaderboard.discipline.distance,
																					timeID				: times[0].timeID,
																					ageGroup			: times[0].ageGroup,
																					athleteID			: times[0].athleteID ?? 0,
																					name					: times[0].name,
																					time					: times[0].time,
																					timeStamp			: times[0].timeStamp,
																					rank					: times[0].rank,
																					competitionID	: times[0].competitionID,
																					poolID				: times[0].poolID,
																					teamID				: times[0].teamID,
																					sido					: times[0].sido || "",
																					thumbnail			: times[0].thumbnail ?? '',
																					datetime			: times[0].datetime ? new Date(times[0].datetime).toISOString().slice(0, 10) : "",
																					competitionName	: times[0].competitionName ?? '',
																					pool					: times[0].pool ?? '',
																					team					: times[0].team ?? '',
																				}
																				arr.push(discipline);
																			}
																			return arr;
																		},[]);
		console.log("getLeaderboardRealtime-----> leaderboard: ", leaderboard[0]);
		return leaderboard;
	}
	static async getLeaderboardRealtimeXXX(body) {
		let startDate = new Date(body.startDate ?? new Date());
		let endOfDate = body.endDate ? new Date(body.endDate) : new Date();
		// const startDate = new Date();
		// const endOfDate = new Date();
		startDate.setHours(9, 0, 0, 0);  // 하루의 시작 시간으로 설정

		//?????????????????????????????????????????????????????????????????????????
		//?????????????????????????????????????????????????????????????????????????
		//?????????????????????????????????????????????????????????????????????????
		startDate.setMonth(0);  // 임시로 1월로 설정
		startDate.setDate(1);  // 임시로 1일로 설정
		//?????????????????????????????????????????????????????????????????????????
		//?????????????????????????????????????????????????????????????????????????
		//?????????????????????????????????????????????????????????????????????????

		endOfDate.setDate(endOfDate.getDate() + 1);  // 내일로 설정
		endOfDate.setHours(9, 0, 0, 0);  // 하루의 시작 시간으로 설정
		const limit = body.limit ? Number(body.limit) : 8;
		//----------
		switch (body.type) {
			case "day":
				break;
			case "week":
				const dayOfWeek = startDate.getDay();  // 현재 요일을 가져옴 (0 = 일요일, 6 = 토요일)

				// 이번 주의 월요일로 설정
				startDate.setDate(startDate.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1));
				break;
			case "month":
				startDate.setDate(1);
				break;
			case "year":
				startDate.setDate(1);
				startDate.setMonth(0);
				endOfDate = new Date();
				endOfDate.setDate(endOfDate.getDate() + 1);  // 내일로 설정
				break;
		}
		query.datetime = { $gte: startDate, $lt: endOfDate };

		// const leaderboard = await this.getLeaderboardFromTimes(startDate, endOfDate);
		//----------
		const query = {
			datetime	: { $gte: startDate, $lt: endOfDate },
			$and					: [
				{ $or				: [
						{ style	: "individualMedley", distance: "200M" }, 
						{ style	: { $in: ["freestyle", "backstroke", "breaststroke", "butterfly"]}, distance: "50M" }
					],
				},
				{ $or 			: [{ status: "" }, { status: { $exists: false } }], }
			],
			timeStamp	: { $gt: 0 },
			isAdult		: true,
			isMasters	: true,
		};
		if (body.type != 'all') query.datetime = mongodb.makeDateQuery(body.type);

		// const limit = body.limit ? Number(body.limit) : 1;
		//------------------------
		const aggregate1 = [
			{ $match: query },
			// 1. athleteID별로 그룹화하고, 각 athleteID에서 가장 좋은 기록(timeStamp가 작은) 선택
			{ $sort: { timeStamp: 1 } },
			{ $group: {
					_id: "$athleteID",
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
					discipline						: "$_id",
					_id										: 0,
					"times.name"					: 1,
					"times.time"					: 1,
					"times.timeStamp"			: 1,
					"times.thumbnail"			: 1,
					"times.datetime"			: 1,
					"times.rank"					: 1,
					"times.sido"					: 1,
					"times.timeID"				: 1,
					"times.athleteID"			: 1,
					"times.competitionID"	: 1,
					"times.poolID"				: 1
				}
			}
		];
		const aggregate = [
			// 0. query
			{ $match: query },
			
			// Step 1: Sort the entire collection by timeStamp in ascending order.
			{ 
				$sort: { timeStamp: 1 } 
			},
			// Step 2: Group documents.
			{
				$group: {
					_id: {
						gender: "$gender",
						style: "$style",
						course: "$course",
						distance: "$distance"
					},
					athleteSet: { $addToSet: "$athleteID" },  // unique athletes
					timeCount: { $sum: 1 },                   // total record count
					times: {
						$push: {
							timeID: "$timeID",
							name: "$name",
							time: "$time",
							datetime: "$datetime",
							thumbnail: "$thumbnail",
							rank: "$rank"
							// No need to include timeStamp since the documents are pre-sorted
						}
					}
				}
			},
			// Step 3: Project and slice the first three records from the sorted times array.
			{
				$project: {
					gender: "$_id.gender",
					style: "$_id.style",
					course: "$_id.course",
					distance: "$_id.distance",
					timeCount: 1,
					times: { $slice: [ "$times", limit ] },
					_id: 0
				}
			},
			// { $sort: { gender:1, style:1, course:1, distance:1 } }
		];
		//----------------------------------------------------------------
		const result = await mongodb.aggregate(mongoCFG.Medalbank.times, aggregate)
		//----------------------------------------------------------------

		// leaderboard: {"dicipline" : {gender, style, course, distance, times: [ { rank, name, time, timeID, athleteID, poolID, competitionID } ] },
		const leaderboard = result.data.reduce((arr, leaderboard) => {
																			const timeArr = leaderboard.times.reduce((arr, time) => {
																																					const value = {
																																						athleteID: time.athleteID,
																																						name: time.name,
																																						time: time.time,
																																						timeStamp: time.timeStamp,
																																						rank: time.rank ?? 0,
																																						sido: time.sido || "",
																																						thumbnail: time.thumbnail || "",
																																						datetime: time.datetime,
																																					}
																																					arr.push(value);
																																					return arr;
																																				}, []);
																			const times = timeLibrary.assignRanksMedalbank(timeArr);
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
																											// timeStamp: time.timeStamp,
																											rank: time.rank,
																											sido: time.sido || "",
																											thumbnail: time.thumbnail || "",
																											datetime: time.datetime.toISOString().slice(0, 10),
																										}
																										arr.push(value);
																										return arr;
																									}, []),
																			}
																			arr.push(discipline);
																			return arr;
																		},[]);
		result.data = leaderboard;
		console.log("xxx ", result.data[0]);
		return result;
	}
//######################################################################
//############################ Confirm #################################
//######################################################################
	//===========================================
	// list
	// get leaderboard for statics
	// 	type: [today | this week | this month]
	//	limit: number
	//===========================================
	static async getLeaderboardFromLeaderboard(query, limit=8, skip=0) {
		query.timeStamp = { $gt: 0 };
		delete query.group;
		// console.log("1>query=", query);

		query.group = "all";
		query.isAdult = true;
		const context = {
			query			: query,
			projection: { _id:0, group:0, year:0, month:0, week:0, day:0, },
			limit			: limit,
			skip			: skip,
			sort			: { timeStamp: 1 },
		}
		const result = await mongodb.find(mongoCFG.Medalbank.leaderboard, context);		
console.log("leaderboard.list.query.", query);
		result.data = result.data.reduce((arr,time) => {
			time.datetime = new Date(time.datetime).toISOString().slice(0, 10);
			arr.push(time);
			return arr;
		},[]);
		// console.log("----->", result.data);
		// leaderboard: {"dicipline" : {gender, style, course, distance, times: [ { rank, name, time, timeID, athleteID, poolID, competitionID } ] },

		let timeArr = [];
		const assignTimes = timeLibrary.assignRanksMedalbank(result.data);
		// const comp = LeaderboardLibrary.getCompetitionsTeamsPools(times);
		const { times, compression } = new TimeLibrary().getCompetitionsTeamsPools(assignTimes);

		const returnObj = { data: {} };
		returnObj.count = await mongodb.count(mongoCFG.Medalbank.leaderboard, query);;
		returnObj.data.times = times;
		returnObj.data.compression = compression;
// console.log("+++++-----> length: ", returnObj.data.times.length, "times", returnObj.data.times.slice(0, 2));
console.log("+++++-----> ", returnObj.data.times.length);
// console.log("compression=", compression);
		return returnObj;
	}


}

module.exports = LeaderboardModel;

