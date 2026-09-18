const fs 			= require('fs');
const extend 			= require('node.extend');
const utilLibrary = require("../../Util/utilLibrary.js");
const utilError		= require("../../Util/utilError.js");
const imageLibrary= require("../library/images.library.js");
// const utilDatabase= require('../utilDatabase');
const historyLibrary = require("../library/history.library.js");

const Customizing = require("./athletes.custom.js");

const mskCFG 			= require('../../Config/mskCFG.js');
const mongoCFG 		= require('../../Config/mongoCFG.js');
const mongoDB			= require('../../Class/MongoDB.js');
const ImageModel	= require('../../CMS/media/indexDAO.js');
const StaticLibrary	= require("../library/statistics.library.js");
const mongodb	= new mongoDB(mongoCFG.Medalbank.database);

const MemoryDB		= require("../../Class/MemoryDB.js");
const memoryDB		= new MemoryDB();


const UtilDate		= require("../../Class/DateLibrary.js");
const utilDate		= new UtilDate();

const TimeLibrary = require('../../Class/TimeLibrary.js');
const TimeModel		= require("../times/times.model.js");
const buiuldAthlete = require("../build/library.athletes.js");
const buildLibrary	= require('../build/build.library.js');
const libraryAthlete	= require('../build/library.athletes.js');
const timeLibrary = new TimeLibrary();

const collectionName = mongoCFG.Medalbank.athletes;
const PK = "athleteID";
const athleteLimit = 200;
const athleteAthleteIDstart = 500000;

const _context = {
	query		 	: {},
	projection: { _id:0, },
	limit		 	: athleteLimit,
	skip			: 0,
	sort			: { _id:-1 },
}

const charTable = [
	{ char: "ㄱ", gte: "가", lt: "나"},
	{ char: "ㄴ", gte: "나", lt: "다"},
	{ char: "ㄷ", gte: "다", lt: "라"},
	{ char: "ㄹ", gte: "라", lt: "마"},
	{ char: "ㅁ", gte: "마", lt: "바"},
	{ char: "ㅂ", gte: "바", lt: "사"},
	{ char: "ㅅ", gte: "사", lt: "아"},
	{ char: "ㅇ", gte: "아", lt: "자"},
	{ char: "ㅈ", gte: "자", lt: "차"},
	{ char: "ㅊ", gte: "차", lt: "카"},
	{ char: "ㅋ", gte: "카", lt: "타"},
	{ char: "ㅌ", gte: "타", lt: "파"},
	{ char: "ㅍ", gte: "파", lt: "하"},
	{ char: "ㅎ", gte: "하", lt: "힣"},
];

async function listQuery(body) {
	console.log(body);
	const context = mongodb.optionsNew(body);
	context.sort = { athleteID: 1 };

	//-----> query
	if (body.competitionID) {
		const query = { competitionID: Number(body.competitionID), };
		const result = await mongodb.distinct(mongoCFG.Medalbank.times, "athleteID", query);
		context.query = { athleteID: { $in: result.data } };
	} else  if (body.query) {
		context.query = body.query;
	} else {

		let query = {};
		if (body.merged)			query.status = 'merged'; else query = { $or: [ {status: ""}, { status: { $exists: false }} ] }; // { $nin: ["deleted", "merged"] };
		
		
		if (body.nameChar)	{
			if (body.nameChar == '1') {
				query.name = { $gte: '0', $lte: '9' };	
			} else if (body.nameChar == 'A') {
				query.name = { $gte: 'A', $lte: 'z' };	
			} else {
				const char = charTable.find(ch => ch.char == body.nameChar);
				query.name = { $gte: char.gte, $lt: char.lt };	
			}
		}
		if (body.masters)			query.masters = body.masters;
		if (body.adult)				query.adult = body.adult;
		if (body.individual)	query.individual = body.individual;
		if (body.gender)			query.gender = body.gender;
		if (body.sido)				query.sido = body.sido;
		if (body.name)				query.name = new RegExp("^" + body.name.trim());
		if (body.data)				query.index = new RegExp("^" + utilLibrary.normalizeString(body.data));
		context.query = query;
	}

	context.projection = { _id:0, };
	context.sort = { name: 1, };
	// console.log("name=", body.name, "-------------> body=", body, " query=", JSON.stringify(context.query, null, '\t'));
	return context;
}

/*
 *	LIST
 *  count=0: 동명이인 관계없이 모두
 *  count=1: 동명이인 있는 경우
 */
 async function searchAthletes(query, count=1) {
  try {
    // Initialize the return object with default values
    const returnObj = { message: "", data: [], count: 0 };

    // Modify the query object with specific filters
    query.adult = true;
    query.confirm = { $ne: true };
		// query.status = { $or: [ {status: ""}, { status: { $exists: false }}] };
    // Define the context for the MongoDB query
    const context = {
      query: query,
      projection: { _id: 0, time: 0, confirm: 0 },
      limit: 5000,
    };

    // Perform the MongoDB query
    const result = await mongodb.find(mongoCFG.Medalbank.athletes, context);

    // Count the total number of results
    returnObj.count = result.count;

    // Group and customize the data
    const athleteOBJ = {};

    for (const data of result.data) {
      const value = Customizing.customizing(data);

      // Store the customized data in an object, grouped by name
      if (!athleteOBJ[value.name]) athleteOBJ[value.name] = [];
      if (value.name && value.team && value.name != value.team) {
        athleteOBJ[value.name].push(value);
      }
    }

    // Flatten the customized data and store it in the return object
    returnObj.data = Object.values(athleteOBJ).flatMap((items) =>
      items.length > count ? items : []
    );

    return returnObj;
  } catch (error) {
    // Handle errors gracefully
    console.error("Error in searchAthletes:", error);
    return { message: "An error occurred", data: [] };
  }
}

class AthleteModel {
  
//####################################################################
//####################################################################
//####################################################################

	static async names(body) {
		console.log("~~~~~~~~~~~~~~~~~~athletes.model.names=", body);
		const query = { name: new RegExp(body.name.trim(), "gi")};
		const context = {
			query     : query,
			projection: { _id:0, athleteID:1, name:1, gender:1, },
			limit     : 100,
			sort      : { athleteID:1, },
		}
		const result = await mongodb.find(mongoCFG.Medalbank.athletes, context);
		console.log("~~~~~~~~~~~~~~~~~~athletes.model.names.result=", result.data);
		return result;
	}
	// athlete statistics를 realtime으로 계산
	/*
	{
		category: 'masters',
		type: 'adult',
		gender: 'men',
		ageGroup: '10',
		page: 1
	}
	*/
	static async list(body) {
		console.log("~~~~~~~~~~~~~~~~~~athletes.model.list=", body);
		const limit = body.limit ? Number(body.limit) : athleteLimit;
		let skip = (Number(body.page??1)-1)	* limit;
		skip = skip < 0 ? 0 : skip;
console.log("limit=", limit, "skip=", skip);
		const query = { athleteID: { $lt: 100000 }, delete: { $exists: false } };
		if (body.name			) query.name 			= new RegExp(body.name.trim(), "gi");
		if (body.category	) query.isMasters	= body.category == "masters";	// elite, masters
		if (body.type			) query.isAdult 	= body.type == "adult";			// junior, adult
		if (body.gender		) query.gender 		= body.gender;		// men, women, mixed
		//-----> check ageGroup
		if (body.ageGroup	!= undefined && body.ageGroup != '' && body.ageGroup != '00') {
			const ageStartEnd = mskCFG.calculateAgeGroup2Range(body.ageGroup);
			switch (body.ageGroup) {
				case "09":	// check 성인
					query.dob = {
						$gte: ageStartEnd.startDate
					};
					break;
				case "10":	// check 성인
					query.dob = {
						$lt: ageStartEnd.endDate,
					};
					break;
				default:
					query.dob	= { $gte: ageStartEnd.startDate, $lt: ageStartEnd.endDate };
					break;
			}
		}
		console.log("query=", query);
		// query.competitionCount = { $gt: 0}

		const sort = {};
		if (body.sortField) {
			sort[body.sortField] = body.sortDirection == 'asc' ? 1 : -1;
		} else sort.name = 1;

		const context = {
			query: query,
			projection: {
				_id: 0,
				athleteID: 1,
				name: 1,
				gender: 1,
				sido: 1,
				ageGroup: 1,
				thumbnail: 1,
				featuredBB: 1,
				extraInfo:1,
			},
			limit: limit,
			skip: skip,
			sort: sort,
		};
		// console.log("limit=", (skip+limit), "skip=", skip);
		// console.log(JSON.stringify(aggregate, null, '  '));
		//----------------------------------------------------------------
		const result = await mongodb.find(mongoCFG.Medalbank.athletes, context);
		//----------------------------------------------------------------


		const athleteIDs = result.data.map(el => el.athleteID)
		console.log(athleteIDs);

		const queryTimes = {
			athleteID : { $in: athleteIDs },
			timeStamp : { $gt: 0 },
			// isMasters	: true,
			// isAdult		: true,
			$or       : [ {status: ""}, { status: { $exists: false }} ],
			fin       : { $exists: false }
		}
		const times = await buildLibrary.getTimes(queryTimes);

		//---------------------------------------
		// 4. build athletes
		//---------------------------------------
		const statistics = await libraryAthlete.buildAthletesStatisticsAll(times, 32);

		result.data = result.data.reduce((arr, data) => {
																if (data.featuredBB) data.featured = data.featuredBB;
																delete data.featuredBB;
																data.ageGroup = mskCFG.getAgeGroupNameByAgeGroupCode(data.ageGroup);
																data.extraInfo = statistics.find(el => el.athleteID == data.athleteID);
																arr.push(data);
																return arr;
															}, []);
console.log("athletes.list.length:", result.data.length, "count:", result.count);

    return result;
	}
	static async listBackend(body) {
		console.log("~~~~~~~~~~~~~~~~~~athletes.model.listBackend=", body);
		const limit = body.limit ? Number(body.limit) : athleteLimit;
		let skip = (Number(body.page??1)-1)	* limit;
		skip = skip < 0 ? 0 : skip;
console.log("limit=", limit, "skip=", skip);
		const query = { athleteID: { $lt: 100000 } };
		if (body.name			) query.name 			= new RegExp(body.name.trim(), "gi");
		if (body.category	) query.isMasters	= body.category == "masters";	// elite, masters
		if (body.type			) query.isAdult 	= body.type == "adult";			// junior, adult
		if (body.gender		) query.gender 		= body.gender;		// men, women, mixed
		//-----> check ageGroup
		if (body.ageGroup	!= undefined && body.ageGroup != '' && body.ageGroup != '00') {
			const ageStartEnd = mskCFG.calculateAgeGroup2Range(body.ageGroup);
			switch (body.ageGroup) {
				case "09":	// check 성인
					query.dob = {
						$gte: ageStartEnd.startDate
					};
					break;
				case "10":	// check 성인
					query.dob = {
						$lt: ageStartEnd.endDate,
					};
					break;
				default:
					query.dob	= { $gte: ageStartEnd.startDate, $lt: ageStartEnd.endDate };
					break;
			}
		}
		console.log("query=", query);
		// query.competitionCount = { $gt: 0}

		const sort = {};
		if (body.sortField) {
			sort[body.sortField] = body.sortDirection == 'asc' ? 1 : -1;
		} else sort.athleteID = 1;

		// const context = {
		// 	query: query,
		// 	projection: {
		// 		_id: 0,
		// 		athleteID: 1,
		// 		name: 1,
		// 		gender: 1,
		// 		sido: 1,
		// 		ageGroup: 1,
		// 		thumbnail: 1,
		// 		featured: 1,
		// 		featuredBB: 1,
		// 		squares: 1,
		// 		joined:1,
		// 	},
		// 	limit: 300,
		// 	skip: skip,
		// 	sort: sort,
		// };
		// const result = await mongodb.find(mongoCFG.Medalbank.athletes, context);
		const aggregate = [
			{ $match: query },
			{ $lookup: {
					from: mongoCFG.Medalbank.users,
					localField: "athleteID",
					foreignField: "userID",
					as: "users"
      	},
			},
			{ $project: {
					_id: 0,
					athleteID: 1,
					name: 1,
					dob: 1,
					gender: 1,
					sido: 1,
					ageGroup: 1,
					thumbnail: 1,
					featured: 1,
					featuredBB: 1,
					squares: 1,
					joined:1,   
					phone: { $arrayElemAt: ["$users.phone", 0] },
				}
			},
			{ $sort: sort }
		];
		// console.log("limit=", (skip+limit), "skip=", skip);
		// console.log(JSON.stringify(aggregate, null, '  '));
		//----------------------------------------------------------------
		const result = await mongodb.aggregate(mongoCFG.Medalbank.athletes, aggregate);
		//----------------------------------------------------------------
console.log("athletes.list.length:", result.data.slice(0, 2), "count:", result.count);

    return result;
	}
	static async listStatistics(body) {
		// console.log("athletes.model.list=", body);
		const limit = body.limit ? Number(body.limit) : athleteLimit;
		let skip = (Number(body.page??1)-1)	* limit;
		skip = skip < 0 ? 0 : skip;
// console.log("limit=", limit, "skip=", skip);
		const query = {};
		if (body.name			) query.name 			= new RegExp(body.name.trim(), "gi");
		if (body.category	) query.isMasters	= body.category == "masters";	// elite, masters
		if (body.type			) query.isAdult 	= body.type == "adult";			// junior, adult
		if (body.gender		) query.gender 		= body.gender;		// men, women, mixed
		//-----> check ageGroup
		if (body.ageGroup	!= undefined && body.ageGroup != '' && body.ageGroup != '00') {
			const ageStartEnd = mskCFG.calculateAgeGroup2Range(body.ageGroup);
			switch (body.ageGroup) {
				case "09":	// check 성인
					query.dob = {
						$gte: ageStartEnd.startDate
					};
					break;
				case "10":	// check 성인
					query.dob = {
						$lt: ageStartEnd.endDate,
					};
					break;
				default:
					query.dob	= { $gte: ageStartEnd.startDate, $lt: ageStartEnd.endDate };
					break;
			}
		}
		// console.log("query=", query);
		// query.competitionCount = { $gt: 0}

		const sort = {};
		if (body.sortField) {
			sort[body.sortField] = body.sortDirection == 'asc' ? 1 : -1;
		} else sort.name = 1;

		const aggregate = [
			{ $match: query },
			{
				$lookup: {
					from				: mongoCFG.Medalbank.athletesStatistics,
					localField	: "athleteID",
					foreignField: "athleteID",
					as					: "statistics"
				}
			},
			{ $project: {
					_id: 0,
					athleteID: 1,
					name: 1,
					gender: 1,
					sido: 1,
					ageGroup: 1,
					"statistics.firstEvent": 1,
					"statistics.latestEvent": 1,
					"statistics.bestEvent": 1,
				}
			},
			{ $sort			: sort },
			{ $limit		: limit, },
			{ $skip			: skip },
		];
		const context = {
			query: query,
			projection: {
				_id: 0,
				athleteID: 1,
				name: 1,
				gender: 1,
				sido: 1,
				ageGroup: 1,
				thumbnail: 1,
				featuredBB: 1,
				extraInfo:1,
			},
			limit: limit,
			skip: skip,
			sort: sort,
		};
		// console.log("limit=", (skip+limit), "skip=", skip);
		// console.log(JSON.stringify(aggregate, null, '  '));
		//----------------------------------------------------------------
		const result = await mongodb.find(mongoCFG.Medalbank.athletes, context);
		//----------------------------------------------------------------
		result.data = result.data.reduce((arr, data) => {
																if (data.featuredBB) data.featured = data.featuredBB;
																delete data.featuredBB;
																data.ageGroup = mskCFG.getAgeGroupNameByAgeGroupCode(data.ageGroup);
																arr.push(data);
																return arr;
															}, []);
// console.log("athletes.list.----->", result.data[0], result.count);
    return result;
	}
	  
	// view
	/**
	 * 
	 * @param {*} body 
	 * @returns 
	 */
	static async viewWithTimes(body) {
		console.log("viewWithTimes.body=", body);
		// 선수 ID를 숫자로 변환합니다.
		const athleteID = Number(body.athleteID);
		// let result = await mongodb.findOne(mongoCFG.Medalbank.users, { athleteID: athleteID }, { _id:0, athleteID:1, } );
		// 선수 정보가 없는 경우 에러 메시지를 반환합니다.
		// if (!result.data.athleteID) return utilError.errorMSG("Model","athletes", "view", "no data");
		
		// MongoDB에서 선수 정보를 조회합니다.
		const aggregate = [
			{ $match: { athleteID: athleteID } },
			// {
			// 	$lookup: {
			// 		from: mongoCFG.Medalbank.times,
			// 		localField: "athleteID",
			// 		foreignField: "athleteID",
			// 		as: "times",
			// 	},
			// },
			{
				$lookup: {
					from: mongoCFG.Medalbank.times,
					let: { athleteId: "$athleteID" },
					pipeline: [
						{
							$match: {
								$expr: {
									$and: [
										{ $eq: ["$athleteID", "$$athleteId"] },
										{
											$or: [
												{ $eq: ["$status", ""] },
												{ $eq: [{ $ifNull: ["$status", null] }, null] }
											]
										}
									]
								}
							}
						}
					],
					as: "times"
				}
			},			
			{
				$project: {
					_id: 1,
					athleteID: 1,
					name: 1,
					gender: 1,
					sido: 1,
					ageGroup: 1,
					isMasters: 1,
					teams: 1,
					team: 1,
					pools: 1,
					pool: 1,
					thumbnail: 1,
					thumbnailBB: 1,
					featured: 1,
					featuredBB: 1,
					squares: 1,
					stories: 1,
					posts: 1,
					nickname: 1,
					dob: 1,
					isAdult: 1,
					"times.timeID": 1,
					"times.name": 1,
					"times.rank": 1,
					"times.gender": 1,
					"times.style": 1,
					"times.course": 1,
					"times.distance": 1,
					"times.time": 1,
					"times.timeStamp": 1,
					"times.teamID": 1,
					"times.team": 1,
					"times.competitionID": 1,
					"times.competitionName": 1,
					"times.poolID": 1,
					"times.pool": 1,
					"times.ageGroup": 1,
					"times.ageGroupORG": 1,
					"times.athleteID": 1,
					"times.isMasters": 1,
					"times.isAdult": 1,
					"times.isOfficial": 1,
					"times.datetime": 1,
					"times.type": 1,
					"times.extraInfo": 1,
				}
			},			
		];
		const result = await mongodb.aggregate(mongoCFG.Medalbank.athletes, aggregate);
		if (result.data.length == 0) return { message: '', data: { athleteID: athleteID } };
		let athlete = extend(true, {}, result.data[0]);

		let teams = timeLibrary.getTeamsByCount(athlete.times, 4);
		athlete.statistics = { teams: [] };
		if (teams.length > 0) {
			teams = teams.reduce((arr, time) => {
										const teamName = memoryDB.getTeamName(time.teamID);
										time.team = teamName;
										if (time.teamID != 185) arr.push(time); // skip 개인
										return arr;
										}, []);
			athlete.statistics.teams = teams.slice(0, 3);
		}

		athlete.compression = { competitions: [], pools: [], teams: [] };
		// 선수의 경기 기록이 없는 경우 결과를 반환합니다.
		if (athlete.times && athlete.times.length > 0) {
			athlete.times = athlete.times.sort((a, b) => new Date(b.datetime) - new Date(a.datetime));
			const { times, compression } = timeLibrary.getCompetitionsTeamsPools(athlete.times);
			athlete.compression = compression;
			athlete.times = times;
		}

		// if (athlete.featuredBB) {
		// 	athlete.featured = athlete.featuredBB;
		// 	delete athlete.featuredBB;
		// }
		// console.log("athlete=", athlete.featured, athlete.featuredBB);
		await StaticLibrary.updateViewReactions("athletes", athlete.athleteID, athlete.name, body.userID); // db, id, name, userID
		if (athlete.thumbnail) {
			const arr = athlete.thumbnail.split("?");
			athlete.thumbnail = arr[0] + "?width=640"
		}
		// console.log("=====>", athlete);
		return { message: '', data: athlete };
	}
	static async viewWithTimesOLD(body) {
		console.log("viewWithTimesOLD.body=", body);
		// 선수 ID를 숫자로 변환합니다.
		const athleteID = Number(body.athleteID);
		// let result = await mongodb.findOne(mongoCFG.Medalbank.users, { athleteID: athleteID }, { _id:0, athleteID:1, } );
		// 선수 정보가 없는 경우 에러 메시지를 반환합니다.
		// if (!result.data.athleteID) return utilError.errorMSG("Model","athletes", "view", "no data");
		
		// MongoDB에서 선수 정보를 조회합니다.
		const aggregate = [
			{ $match: { athleteID: athleteID } },
			// {
			// 	$lookup: {
			// 		from: mongoCFG.Medalbank.times,
			// 		localField: "athleteID",
			// 		foreignField: "athleteID",
			// 		as: "times",
			// 	},
			// },
			{
				$lookup: {
					from: mongoCFG.Medalbank.athletesStatistics,
					localField: "athleteID",
					foreignField: "athleteID",
					as: "statistics",
				},
			},
			{
				$project: {
					_id: 1,
					athleteID: 1,
					name: 1,
					gender: 1,
					sido: 1,
					ageGroup: 1,
					isMasters: 1,
					teams: 1,
					team: 1,
					pools: 1,
					pool: 1,
					featured: 1,
					nickname: 1,
					dob: 1,
					isAdult: 1,
					extraInfo: 1,
					"statistics.teams": 1,
					// "times.timeID": 1,
					// "times.name": 1,
					// "times.rank": 1,
					// "times.gender": 1,
					// "times.style": 1,
					// "times.course": 1,
					// "times.distance": 1,
					// "times.time": 1,
					// "times.timeStamp": 1,
					// "times.teamID": 1,
					// "times.team": 1,
					// "times.competitionID": 1,
					// "times.competitionName": 1,
					// "times.poolID": 1,
					// "times.pool": 1,
					// "times.ageGroup": 1,
					// "times.ageGroupORG": 1,
					// "times.athleteID": 1,
					// "times.isMasters": 1,
					// "times.isAdult": 1,
					// "times.isOfficial": 1,
					// "times.datetime": 1,
					// "times.extraInfo": 1,
				}
			},			
		];
// console.log(JSON.stringify(aggregate, null, '  '));
		const result = await mongodb.aggregate(mongoCFG.Medalbank.athletes, aggregate);
		if (result.data.length == 0) return { message: '', data: { athleteID: athleteID } };
		let athlete = extend(true, {}, result.data[0]);
		// 선수가 속한 팀의 이름을 설정합니다.
		athlete.extraInfo = athlete.extraInfo ?? {};
		athlete.extraInfo.teams = [];
		if (!athlete.statistics || athlete.statistics.length == 0) {
			athlete.extraInfo.teams = [{
				teamID: athlete.teamID,
				team	: athlete.team || athlete.teamName,
				count	: 1,
			}]
		} else {
			if (athlete.statistics[0].teams) {
				athlete.extraInfo.teams = athlete.statistics[0].teams.reduce((teams, team) => {
					if (team.teamID > 0) {
						const teamDB = memoryDB.getTeam(team.teamID);
						team.team = teamDB.name || "";
						teams.push(team);
					}
					return teams;
				}, [])
			}
		}
		// athlete.extraInfo = { ...athlete.extraInfo, ...athlete.statistics};
		// delete athlete.statistics;
		const context = {
			query: { athleteID: athlete.athleteID },
			projection: {
				timeID: 1,
				name: 1,
				rank: 1,
				gender: 1,
				style: 1,
				course: 1,
				distance: 1,
				time: 1,
				timeStamp: 1,
				teamID: 1,
				team: 1,
				competitionID: 1,
				competitionName: 1,
				poolID: 1,
				pool: 1,
				ageGroup: 1,
				ageGroupORG: 1,
				athleteID: 1,
				isMasters: 1,
				isAdult: 1,
				isOfficial: 1,
				datetime: 1,
				// extraInfo: 1,				
			},
			limit: 1000,
			skip: 0,
		};
		const times = await mongodb.find(mongoCFG.Medalbank.times, context);
		athlete.times = times.data;


		if (athlete.statistics.length > 0) {
			let teams = timeLibrary.getTeamsByCount(times.data, 6);
			teams = teams.slice(0, 4).reduce((arr, time) => {
																const teamName = memoryDB.getTeamName(time.teamID);
																time.team = teamName;
																if (time.teamID != 185) arr.push(time); // skip 개인
																return arr;
																}, []);
			console.log("statistics.teams=",athlete.statistics[0].teams, teams.slice(0, 3));
		}

		athlete.compression = { competitions: [], pools: [], teams: [] };
		// 선수의 경기 기록이 없는 경우 결과를 반환합니다.
		if (athlete.times && athlete.times.length > 0) {
			athlete.times = athlete.times.sort((a, b) => new Date(b.datetime) - new Date(a.datetime));
			// athlete.compression = timeLibrary.getCompetitionsTeamsPools(athlete.times);
			const { times, compression } = timeLibrary.getCompetitionsTeamsPools(athlete.times);
			athlete.compression = compression;
			athlete.times = times;
		}

		await StaticLibrary.updateViewReactions("athletes", athlete.athleteID, athlete.name, body.userID); // db, id, name, userID
		return { message: '', data: athlete };
	}

	  
	// view
	/**
	 * 
	 * @param {*} body 
	 * @returns 
	 */
	static async view(body) {
		// 선수 ID를 숫자로 변환합니다.
		const athleteID = Number(body.athleteID);
		// let result = await mongodb.findOne(mongoCFG.Medalbank.users, { athleteID: athleteID }, { _id:0, athleteID:1, } );
		// 선수 정보가 없는 경우 에러 메시지를 반환합니다.
		// if (!result.data.athleteID) return utilError.errorMSG("Model","athletes", "view", "no data");
		
		// MongoDB에서 선수 정보를 조회합니다.
		const aggregate = [
			{ $match: { athleteID: athleteID } },
			{
				$lookup: {
					from: mongoCFG.Medalbank.athletesStatistics,
					localField: "athleteID",
					foreignField: "athleteID",
					as: "statistics",
				},
			},
			{
				$project: {
					_id: 1,
					athleteID: 1,
					name: 1,
					gender: 1,
					sido: 1,
					ageGroup: 1,
					thumbnail: 1,
					thumbnailBB: 1,
					isMasters: 1,
					teams: 1,
					team: 1,
					pools: 1,
					pool: 1,
					featured: 1,
					featuredBB: 1,
					nickname: 1,
					dob: 1,
					isAdult: 1,
					extraInfo: 1,
					statistics: 1,
				}
			},			
		];

		const result = await mongodb.aggregate(mongoCFG.Medalbank.athletes, aggregate);
		if (result.data.length == 0) return { message: '', data: { athleteID: athleteID } };
		let athlete = extend(true, {}, result.data[0]);

		if (athlete.statistics.length == 0) {
			athlete.statistics = {};
		} else {
			athlete.statistics = athlete.statistics[0];
		}
		delete athlete.statistics._id;
		// athlete.compression = timeLibrary.getCompetitionsTeamsPools(athlete.times);
		const { times, compression } = timeLibrary.getCompetitionsTeamsPools(athlete.times);
		athlete.compression = compression;
		athlete.times = times;

		await StaticLibrary.updateViewReactions("athletes", athlete.athleteID, athlete.name, body.userID); // db, id, name, userID
		console.log("--------------->", athlete);
		return { message: '', data: athlete };
	}

	// detail
	static async detail(body) {
		console.log("models.athletes.detail.athleteID=", body.athleteID);
		let returnObj = { message: '', data: {} };
		
		try{
			// -----> get query
			// const aggregate = Query.detail(body);
			const query = { athleteID: Number(body.athleteID) };
			const context = {
				query: query,
				projection: { _id:0, },
				limit: athleteLimit,
			}
			// console.log("~~~~~~~~~~~~", JSON.stringify(aggregate, null, "  "));
			//----------------------------------------------------------
			const result = await mongodb.findOne(mongoCFG.Medalbank.athletes, query );
			console.log(result);
			//----------------------------------------------------------
			if (!result.data.athleteID) {
				result.message = "athletes.detail.athleteID no data";
				console.log(result.message)
				return result;
			}
			await StaticLibrary.updateViewReactions("athletes", result.data.athleteID, result.data.name, body.userID??0); // db, id, name, userID
			return result;
	
			// -----> customizing
			returnObj.data = Customizing.customizing(result.data[0]);
			console.log(returnObj.data);
	
			// await historyDAO.insert(trOBJ, {type:"athlete", name: returnObj.data.name, athleteID: returnObj.data.athleteID });
			//------------------------------------------------------------------
			// returnObj.data = await Common.database("athlete", Number(body.athleteID), returnObj.data);
			//------------------------------------------------------------------
			return returnObj;
		} catch (e) {
			console.log("athletes.detail.catch: ", e);
		}
		return returnObj;
	}
	
	/**
	 * static saveAthleteWithImage 함수
	 * 
	 * 이 함수는 선수 데이터를 데이터베이스에 저장하거나 업데이트합니다.
	 * 관련된 대표 이미지를 처리하며, 필요 시 시간 데이터를 업데이트합니다.
	 *
	 * @param {Object} body - 선수 데이터를 포함하는 객체
	 * @param {number|string} [body.athleteID] - 선수의 고유 ID. 0이거나 제공되지 않은 경우 새로운 ID가 생성됩니다.
	 * @param {string} [body.sourcePath] - 저장할 이미지 파일의 경로
	 * @param {string} [body.name] - 선수 이름
	 * @param {string} [body.nickname] - 선수의 닉네임
	 * @param {string} [body.styles] - 선수의 스타일(콤마로 구분된 문자열)
	 * @param {string} [body.instagram] - 선수의 인스타그램 계정
	 * @param {string} [body.memo] - 추가적인 메모 정보
	 * @param {Array<number>} [body.timeIDs] - 업데이트할 시간 ID 배열
	 * @returns {Promise<Object>} 저장된 선수 ID와 메시지를 포함하는 객체
	 */
	static async saveAthleteWithImage(body) {
		console.log("22athletes.model.saveAthleteWithImage.body=", body);

		// body 데이터를 깊은 복사하여 처리 객체로 변환
		const value = {}; // extend(true, body, {});

		// athleteID 확인 및 생성
		if (!body.athleteID || body.athleteID == 0) {
			// athleteID가 0이거나 제공되지 않은 경우, 새로운 ID를 생성
			value.athleteID = await mongodb.max(mongoCFG.Medalbank.athletes, "athleteID", { athleteID : { $lt: athleteAthleteIDstart } });
			value.joined = new Date(); // 최초 가입 시간 설정
			// --------------------------------------------------------------
			// 시간 데이터 업데이트
			// --------------------------------------------------------------
			const result = await TimeModel.updateTimes(value.athleteID); // 시간 데이터 업데이트 함수 호출
		} else {
			// 제공된 athleteID를 사용
			value.athleteID = Number(body.athleteID);
		}

		// --------------------------------------------------------------
		// 대표 이미지 처리
		// --------------------------------------------------------------
		if (body.sourcePath) {
			// 이미지 저장 및 경로 설정
			const result = await imageLibrary.saveFile(
																					body.sourcePath, 
																					"images", 
																					"athletes", 
																					value.athleteID, 
																					'f'	// 'f'eatured, 't'humbnail, '0'~'9'
																				);
			// 대표 이미지 경로를 value에 추가
			value.featured = `/cms/images/athletes/${value.athleteID}/f`;
			value.featuredBB = "";
		}

		// --------------------------------------------------------------
		// 입력받은 필드 업데이트
		// --------------------------------------------------------------
		if (body.name			) value.name 			= body.name.trim();	// 선수 이름 설정
		if (body.nickname	) value.nickname 	= body.nickname.trim(); // 닉네임 설정
		if (body.styles		) value.styles 		= body.styles.trim().split(','); // 스타일 설정 (콤마로 구분된 배열로 변환)
		if (body.instagram) value.instagram = body.instagram.trim(); // 인스타그램 계정 설정
		value.extraInfo = {};
		if (body.height		) value.extraInfo.height 	= body.height.trim(); // 메모 설정
		if (body.weight		) value.extraInfo.weight 	= body.weight.trim(); // 메모 설정
		if (body.feet			) value.extraInfo.feet 		= body.feet.trim(); // 메모 설정
		if (body.armspan	) value.extraInfo.armspan	= body.armspan.trim(); // 메모 설정
		if (body.memo			) value.memo 			= body.memo.trim(); // 메모 설정
		value.updated = new Date(); // 마지막 업데이트 시간 설정

		console.log("athletes.model.saveAthleteWithImage.value=", value);

		// --------------------------------------------------------------
		// 선수 데이터 업데이트
		// --------------------------------------------------------------
		const query = { athleteID: value.athleteID };
		await mongodb.updateOne(mongoCFG.Medalbank.athletes, query, value);

		await historyLibrary.saveHistory(
													"athletes", 
													"saveWithImage", 
													"athleteID", 
													value,
												); // db, cmd, id, body
		// --------------------------------------------------------------
		// 결과 반환
		// --------------------------------------------------------------
		return { message: "", data: { athleteID: value.athleteID } };
	}
	
	/**
	 * static saveAthleteWithImage 함수
	 * 
	 * 이 함수는 선수 데이터를 데이터베이스에 저장하거나 업데이트합니다.
	 * 관련된 대표 이미지를 처리하며, 필요 시 시간 데이터를 업데이트합니다.
	 *
	 * @param {Object} body - 선수 데이터를 포함하는 객체
	 * @param {number|string} [body.athleteID] - 선수의 고유 ID. 0이거나 제공되지 않은 경우 새로운 ID가 생성됩니다.
	 * @param {string} [body.sourcePath] - 저장할 이미지 파일의 경로
	 * @returns {Promise<Object>} 저장된 선수 ID와 메시지를 포함하는 객체
	 */
	static async saveAthleteImage(body) {
		console.log("22athletes.model.saveAthleteImage.body=", body);

		// body 데이터를 깊은 복사하여 처리 객체로 변환
		const value = {}; // extend(true, body, {});

		// athleteID 확인 및 생성
		value.athleteID = Number(body.athleteID);
		value.fileType = body.fileType ?? 'f'; // 'f'eatured, 't'humbnail, '0'~'9'
		// --------------------------------------------------------------
		// 대표 이미지 처리
		// --------------------------------------------------------------
		if (body.sourcePath) {
			// 이미지 저장 및 경로 설정
			const result = await imageLibrary.saveFile(
																					body.sourcePath, 
																					"images", 
																					"athletes", 
																					value.athleteID, 
																					value.fileType,	// 'f'eatured, 't'humbnail, '0'~'9'
																				);
			// 대표 이미지 경로를 value에 추가
			value.featured = `/cms/images/athletes/${value.athleteID}/${value.fileType}`;
			value.featuredBB = `${global.nodeServerURL}/cms/images/athletes/${value.athleteID}/${value.fileType}`;
		}

		// --------------------------------------------------------------
		// 입력받은 필드 업데이트
		// --------------------------------------------------------------
		console.log("athletes.model.saveAthleteWithImage.value=", value);

		// --------------------------------------------------------------
		// 선수 데이터 업데이트
		// --------------------------------------------------------------
		const query = { athleteID: value.athleteID };
		await mongodb.updateOne(mongoCFG.Medalbank.athletes, query, value);
		console.log("saveImage.", query, value);

		await historyLibrary.saveHistory(
													"athletes", 
													"saveWithImage", 
													"athleteID", 
													value,
												); // db, cmd, id, body
		// --------------------------------------------------------------
		// 결과 반환
		// --------------------------------------------------------------
		return { message: "", data: { athleteID: value.athleteID } };
	}
  
  //####################################################################
  //######### Confirm ##################################################
  //####################################################################


	/**
	 * signupcomplete에서 athlete 신규 작성
	 * @param {*} body 
	 * @param {*} body.athleteID 
	 * @param {*} body.sourcePath 
	 * @param {*} body.name 
	 * @param {*} body.nickname 
	 * @param {*} body.gender 
	 * @param {*} body.dob
	 * @returns 
	 */
	static async insertNew(body) {
		let returnObj = { message: '', data: {}};
		//----------------------------------------------------------------
		try {
			let res;
			if (!body.athleteID) {
				body.athleteID = await mongodb.max(mongoCFG.Medalbank.athletes, "athleteID", { athleteID : { $lt: athleteAthleteIDstart } }); // query, db
			} else {
				const query = { athleteID: Number(body.athleteID) };
				res = await mongodb.findOne(mongoCFG.Medalbank.athletes, query, { _id:0, athleteID:1, dob:1, gender:1}); // query, db
				if (res.data.athleteID) {
					console.log("athleteID already exists!!", body.athleteID);
					// return;
				}
			}
			
			body.dob = res.data.dob;	
			body.gender = res.data.gender;	
			
			console.log("1>max.athleteID=", body.athleteID);
			let value = Customizing.customizing(body);
			console.log("2>max.athleteID.value=", value);
			value.joined = new Date();

			//------------------.-------------------------------------------
			// update times.athleteID
			//--------------------------------------------------------------
			// if (body.timeIDs) {
			// 	TimeModel.updateTimes(body.athleteID, body.timeIDs);
			// }

			// value.index = [];
			// value.index.push(utilLibrary.normalizeString(value.name));
			// value.index.push(utilLibrary.normalizeString(value.nickname));
			// value.index.push(utilLibrary.normalizeString(value.note));

			if (value.name) value.nameHide = utilLibrary.nameHide(value.name);

			// 이름 색인
			value.names = value.names ?? "";
			value.names += "|" + value.name;
			if (value.nickname) value.names += "|" + value.nickname;
			const names = value.names.split('|');
			value.names = [];
			for (const name of names) {
				const norm = utilLibrary.normalizeString(name);
				if (norm == "" || value.names.includes(norm)) continue;
				value.names.push(norm);
			}
			if (value.dob) {
				value.ageGroup = mskCFG.getAgeGroupCode(value.dob);
			}

			//-----> event times가 import되었는지 확인
			const checkTimes = await mongodb.findOne(mongoCFG.Medalbank.times,
																									{ athleteID: value.athleteID, type: 'event' },
																									{ _id:0, athleteID:1 },
																								);
			console.log("checkTimes=", checkTimes);
			if (checkTimes.data.athleteID) return returnObj;
			//----------------------------------------------
			// athlete name과 같은 times 시간 추가
			//-----> import from times to times_medalbank
			//----------------------------------------------
			console.log("++++++++++++++++ importTimes");
			const times = await TimeModel.importTimes({ name: value.name, gender: value.gender, athleteID: value.athleteID, ageGroup: value.ageGroup, dob: value.dob });
			console.log("++++++++++++++++ importTimes", times.length);

			//----------------------------------------------
			// bestTimes 계산
			//----------------------------------------------
			/**
				statistics

			 */
			value.extraInfo = buiuldAthlete.buildAthletesStatistics(value.athleteID, times, 32);
			value.extraInfo.count = extraInfo.timeTimeCount ?? 0 + extraInfo.eventTimeCount ?? 0;			

			// console.log("1------> database.athletes.insert.value=", value);
			returnObj = await mongodb.insertOne(mongoCFG.Medalbank.athletes, value);
		console.log("2------> database.athletes.insert.returnObj=", returnObj);
			returnObj.data = value.athleteID.toString();

			// const bestEvent = TimeLibrary.makeAthletesStatistics(times, 1);
			// 최근 pools, teams, competitions 추가
			// major styles 추가
			// const query = { athleteID: value.athleteID };
			// const statistics = { athleteID: value.athleteID, bestEvent: bestEvent };
			// console.log("statistics:", statistics);
			// const res = await mongodb.updateOne(mongoCFG.Medalbank.athletesStatistics, query, statistics);
			
console.log("athletesStatistics.update:", res);
			//----------------------------------------------
			//----------------------------------------------

		} catch (e) {
			returnObj.message = "athletes.insert.catch." + e
			console.log(returnObj.message)
		}
		return returnObj;
		//----------------------------------------------------------------
	}

	// 매년 1월 1일 seasonBest clear
	static async clearSeasonBest(body) {
		console.log("new.services.athletes.clearSeasonBest.body=", body);
		try {
			// 모든 style-course-distance 조합에 대해 한 번에 업데이트
			const updateObj = {};
			const styles = ["backstroke", "breaststroke", "butterfly", "freestyle", "individualMedley"];
			const courses = ["LCM", "SCM"];
			const distances = ["25M","50M", "100M", "200M", "400M", "800M", "1500M"];

			styles.forEach(style => {
				courses.forEach(course => {
					distances.forEach(distance => {
						updateObj[`bestEvent.${style}-${course}-${distance}.bestSeason`] = {};
						updateObj[`bestTime.${style}-${course}-${distance}.bestSeason`] = {};
					});
				});
			});

			await mongodb.updateMany(mongoCFG.Medalbank.athletesStatistics,
				{ "seasonBest": { $exists: true } },
				{ $unset: updateObj }
			);
		} catch (e) {
			return utilError.errorMSG("Service","athletes", "clearSeasonBest", "catch." + e);
		}
	}




	// update
	static async updateNew(body) {
		
		let query = {};
		if (body.athleteID) {
			body.athleteID = Number(body.athleteID)
			query = { athleteID: body.athleteID }
			//------------------.-------------------------------------------
			// update times.athleteID
			//--------------------------------------------------------------
			if (body.timeIDs) {
				await TimeModel.updateTimes(body.athleteID, body.timeIDs);
				delete body.timeIDs;
			}
		} else if (body.userID) {
			query = { userID: Number(body.userID) }
		} else if (body.registrationNo) {
			query = { registrationNo: body.registrationNo }
		} else {
			returnObj.message = "athletes.update.athleteID, userID, registrationNo not found!!";
			console.log(returnObj.message);
			return returnObj;
		}
	
		//------------------.-------------------------------------------
		// update athletes
		//-------------------------------------------------------------
		if (body.password) {
	
		}
	
		if (body.name) body.nameHide = utilLibrary.nameHide(body.name);
		returnObj = await mongodb.updateOne(mongoCFG.Medalbank.athletes, query, body);
	
		return returnObj;
	}

  // update status to delete
  static async updateDeleteNew(body) {
		console.log("DATABASE.athletes.delete.body=", body);
		//-----> validation
		let returnObj = { message: "", };
	
		if (! body.athleteID && ! body.athleteIDs) {
			returnObj.message = `${mongoCFG.Medalbank.athletes}.delete.athleteID not found`;
			return returnObj;
		}
	
		const athleteIDs = [];
		if (body.athleteIDs) {
			body.athleteIDs.split(',').forEach(ath => {
				athleteIDs.push(Number(ath.trim()));
			})
		} else {
			body.athleteID.toString().split(',').forEach((aid) => {
				athleteIDs.push(Number(aid));
			})
		}
	
		const query = { athleteID: { $in: athleteIDs } };  
	
		//--------------------------
		//-----> $unset athleteID in times 
		//--------------------------
		const value = { $unset: { athleteID: 0 } };
		const result = await mongodb.updateManyOP(mongoCFG.Medalbank.times, query, value);
	
		//--------------------------
		//-----> delete athletes.athleteID
		//--------------------------
		// returnObj = await mongodb.deleteMany(mongoCFG.Medalbank.athletes, query);	// returnObj.total: delete count
		returnObj = await mongodb.updateMany(mongoCFG.Medalbank.athletes, query, { status: "deleted" });
	
		return returnObj;
  }

	// delete
	static async deleteNew(athleteID) {
		console.log("DATABASE.athletes.delete.body=", body);
		//-----> validation
		let returnObj = { message: "", };
	
		if (! body.athleteID && ! body.athleteIDs) {
			returnObj.message = `${mongoCFG.Medalbank.athletes}.delete.athleteID not found`;
			return returnObj;
		}
	
		const athleteIDs = [];
		if (body.athleteIDs) {
			body.athleteIDs.split(',').forEach(ath => {
				athleteIDs.push(Number(ath.trim()));
			})
		} else {
			body.athleteID.toString().split(',').forEach((aid) => {
				athleteIDs.push(Number(aid));
			})
		}
	
		const query = { athleteID: { $in: athleteIDs } };  
		// returnObj = await mongodb.deleteMany(mongoCFG.Medalbank.athletes, query);
		returnObj = await mongodb.updateMany(mongoCFG.Medalbank.athletes, query, { status: "deleted", deleted: new Date()});
	
		//--------------------------
		//-----> $unset athleteID in times 
		//--------------------------
		const value = { $unset: { athleteID: 0 } };
		const result = await mongodb.updateManyOP(mongoCFG.Medalbank.times, query, value);
	}

	static async createNew() {
		let indexes = [
			{ query: { athleteID:1 }, name: "athleteID", option: { unique: true }	},
			{ query: { "name":1 }, name: "name"	},
		];
		await mongodb.createCollectionNindex(mongoCFG.Medalbank.athletes, indexes);
		
		indexes = [
			{ query: { athleteID:1 }, name: "athleteID", option: { unique: true }	},
		];
		await mongodb.createCollectionNindex(mongoCFG.Medalbank.athletesStatistics, indexes);

		try {
			const pipeline = [
				{ $lookup: {
						from: mongoCFG.Medalbank.athletesStatistics,
						localField: "athleteID",
						foreignField: "athleteID",
						as: "statistics",
					}
				}
			];
			await mongodb.dropCollection(mongoCFG.Medalbank.athletesView);
			await mongodb.createView(mongoCFG.Medalbank.athletesView, mongoCFG.Medalbank.athletes, pipeline);
		} catch (e) {
			// returnObj = { message: `${trOBJ.trcode}: ${trOBJ.func} catch. ${e}`, data: {} };
			console.log("athletes.createView.catch.", e);
		}
	}

//####################################################################
//####################################################################
//####################################################################


	static async insertAthleteAndImportTimes  (user) {
		user.athleteID = user.userID;
		const ageGroupCode = mskCFG.findAgeGroup(user.dob);
		// const ageGroup = mskCFG.getAgeGroupNameByAgeGroupCode(user.ageGroupCode);

		const value = {
			athleteID		: user.athleteID,
			name				: user.name,
			gender			: user.gender,
			dob					: user.dob,
			ageGroup		: ageGroupCode.groupName,
			ageGroupCode: ageGroupCode.group,
			joined			: new Date(),
		};
		await mongodb.updateOne(mongoCFG.Medalbank.athletes, { athleteID: user.athleteID }, value);

		console.log("++++++++++++++++ importTimes");
		const times = await TimeModel.importTimes({ name: value.name, gender: value.gender, athleteID: value.athleteID, ageGroup: value.ageGroup, dob: value.dob });
		console.log("++++++++++++++++ importTimes", times.length);
	}
	// insert
	static async insert(body) {
		//----------------------------------------------------------------
		try {
			// elite athlete athleteID는 500001부터 시작
			body.athleteID = await mongodb.max(mongoCFG.Medalbank.athletes, "athleteID", { athleteID : { $lt: athleteAthleteIDstart } }); // query, db
			console.log("1>max.athleteID=", body.athleteID);
			let value = Customizing.customizing(body);
			console.log("2>max.athleteID=", value.athleteID);
			value.datetime = new Date();

			//------------------.-------------------------------------------
			// update times.athleteID
			//--------------------------------------------------------------
			if (body.timeIDs) {
				TimeModel.updateTimes(body.athleteID, body.timeIDs);
			}

			// value.index = [];
			// value.index.push(utilLibrary.normalizeString(value.name));
			// value.index.push(utilLibrary.normalizeString(value.nickname));
			// value.index.push(utilLibrary.normalizeString(value.note));

			if (value.name) value.nameHide = utilLibrary.nameHide(value.name);
		console.log("1------> database.athletes.insert.value=", value);
			returnObj = await mongodb.insertOne(mongoCFG.Medalbank.athletes, value);
		// console.log("2------> database.athletes.insert.returnObj=", returnObj);
			returnObj.data = value.athleteID.toString();
		} catch (e) {
			returnObj.message = "athletes.insert.catch." + e
			console.log(returnObj.message)
		}
			return returnObj;
		//----------------------------------------------------------------
	}

	// update
	static async update(body) {
		console.log("athletes.model.update.body=", body);
		let returnObj = { message: "", };
		let query = {};
		if (body.athleteID) {
			body.athleteID = Number(body.athleteID)
			query = { athleteID: body.athleteID }
			//------------------.-------------------------------------------
			// update times.athleteID
			//--------------------------------------------------------------
			if (body.timeIDs) {
				await TimeModel.updateTimes(body.athleteID, body.timeIDs);
				delete body.timeIDs;
			}
		} else if (body.userID) {
			query = { userID: Number(body.userID) }
		} else if (body.registrationNo) {
			query = { registrationNo: body.registrationNo }
		} else {
			returnObj.message = "athletes.update.athleteID, userID, registrationNo not found!!";
			console.log(returnObj.message);
			return returnObj;
		}
	
		//------------------.-------------------------------------------
		// update athletes
		//-------------------------------------------------------------
		if (body.password) {
	
		}
	
		if (body.name) body.nameHide = utilLibrary.nameHide(body.name);
		console.log("athletes.model.update.body=", body);
		returnObj = await mongodb.updateOne(mongoCFG.Medalbank.athletes, query, body);
	
		return returnObj;
	}

  // update status to delete
  static async updateDelete(body) {
		console.log("DATABASE.athletes.delete.body=", body);
		//-----> validation
		let returnObj = { message: "", };
	
		if (! body.athleteID && ! body.athleteIDs) {
			returnObj.message = `${mongoCFG.Medalbank.athletes}.delete.athleteID not found`;
			return returnObj;
		}
	
		const athleteIDs = [];
		if (body.athleteIDs) {
			body.athleteIDs.split(',').forEach(ath => {
				athleteIDs.push(Number(ath.trim()));
			})
		} else {
			body.athleteID.toString().split(',').forEach((aid) => {
				athleteIDs.push(Number(aid));
			})
		}
	
		const query = { athleteID: { $in: athleteIDs } };  
	
		//--------------------------
		//-----> $unset athleteID in times 
		//--------------------------
		const value = { $unset: { athleteID: 0 } };
		const result = await mongodb.updateManyOP(mongoCFG.Medalbank.times, query, value);
	
		//--------------------------
		//-----> delete athletes.athleteID
		//--------------------------
		// returnObj = await mongodb.deleteMany(mongoCFG.Medalbank.athletes, query);	// returnObj.total: delete count
		returnObj = await mongodb.updateMany(mongoCFG.Medalbank.athletes, query, { status: "deleted" });
	
		return returnObj;
  }

	// delete
	static async delete(athleteID) {
		console.log("DATABASE.athletes.delete.body=", body);
		//-----> validation
		let returnObj = { message: "", };
	
		if (! body.athleteID && ! body.athleteIDs) {
			returnObj.message = `${mongoCFG.Medalbank.athletes}.delete.athleteID not found`;
			return returnObj;
		}
	
		const athleteIDs = [];
		if (body.athleteIDs) {
			body.athleteIDs.split(',').forEach(ath => {
				athleteIDs.push(Number(ath.trim()));
			})
		} else {
			body.athleteID.toString().split(',').forEach((aid) => {
				athleteIDs.push(Number(aid));
			})
		}
	
		const query = { athleteID: { $in: athleteIDs } };  
		// returnObj = await mongodb.deleteMany(mongoCFG.Medalbank.athletes, query);
		returnObj = await mongodb.updateMany(mongoCFG.Medalbank.athletes, query, { status: "deleted" });
	
		//--------------------------
		//-----> $unset athleteID in times 
		//--------------------------
		const value = { $unset: { athleteID: 0 } };
		const result = await mongodb.updateManyOP(mongoCFG.Medalbank.times, query, value);
	}

	static async create() {
		const indexes = [
			{ query: { athleteID:1 }, name: "athleteID", option: { unique: true }	},
			{ query: { "athletes.category":1 }, name: "category"	},
		];
		console.log("create.indexes=", indexes);
		// await mongodb.createCollectionNindex(mongoCFG.Medalbank.athletes, indexes);
	}

	static createView = async () => {
		let result, returnObj = { message: "", };
		try {
			const pipeline = [
				{ $lookup: {
						from: mongoCFG.Medalbank.athletesStatistics,
						localField: "athleteID",
						foreignField: "athleteID",
						as: "statistics",
					}
				}
			];
			result = await mongodb.dropCollection(mongoCFG.Medalbank.athletesView);
			result = await mongodb.createView(mongoCFG.Medalbank.athletesView, mongoCFG.Medalbank.athletes, pipeline);
		} catch (e) {
			// returnObj = { message: `${trOBJ.trcode}: ${trOBJ.func} catch. ${e}`, data: {} };
			console.log("athletes.createView.catch.", e);
		}
	
		return returnObj;
	}

//####################################################################
//####################################################################
//####################################################################







	// merge
	static async merge(body) {
		let returnObj = { message: "", };
		console.log("athletes.merge.value=", value);
		//----------------------------------------------------------------

		//--------------------------------------------------
		let athleteID = Number(body.athlete.athleteID);
		const athleteIDall = body.athleteIDs.split(',').map(athleteID => Number(athleteID));
		athleteIDall.push(athleteID);

		const contextUser = {
			query			: { $in: athleteIDall },
			projection: {_id:0, athleteID:1, },
			limit			: 1,
			skip			: 0,
			sort      : { athleteID: -1 },
		}
		returnObj = await mongodb.find(mongoCFG.Medalbank.users, contextUser);
		if (returnObj.count > 1) {
			returnObj.message = "users.athleteID: ["+returnObj.data.map(el => el.athleteID).join(",") + "] 확인 !!";
			console.log(returnObj.message);
			return returnObj;
		}
		if (returnObj.data && returnObj.data.length > 0) athleteID = returnObj.data[0].athleteID;	
	
		// 1. normalize athleteID, athleteIDs
		const athleteIDs = body.athleteIDs.split(',').map(athleteID => Number(athleteID));
	console.log("athleteID=", athleteID, "athleteIDs=", athleteIDs);
	
		// 2. change athleteIDs to times.athleteID
		const queryMerged = { athleteID: { $in : athleteIDs } }
		const timeValue = { athleteID: athleteID };
		console.log("timeValue=", timeValue);
		returnObj = await mongodb.updateMany(mongoCFG.Medalbank.times, queryMerged, timeValue);
	
		// 3. build staticsAthlete
		const query = { athleteID: athleteID, fin: { $exists: false } }
		const context = {
			query			: query,
			projection: {_id:0, timeID:1, name:1, nameHide:1, gender:1, style:1, distance:1, teamID:1, athleteID:1, competitionID:1, poolID:1, teamID:1, time:1, times:1, diffs:1, rank:1, rankGroup:1 },
			limit			: 5000,
		}
		const times = await mongodb.find(mongoCFG.Medalbank.times, context);
		const athlete = utilDatabase.athleteStatics(times.data, athleteID);
	
		if (body.athlete.dob	) athlete.dob		= body.athlete.dob;
		if (body.athlete.dobTo) athlete.dobTo	= body.athlete.dobTo;
		if (body.athlete.note	) athlete.note	= body.athlete.note;
		if (body.athlete.name	) athlete.name	= body.athlete.name;
		athlete.status = "";
		// 4. update athletes
		console.log("query=", query, athlete);
		await mongodb.updateOne(mongoCFG.Medalbank.athletes, query, athlete);
	
		// 5. change athletes.athleteIDs to status='merged'
		value = { status: "merged" };
		console.log("queryMerged=", queryMerged, value);
		returnObj = await mongodb.updateMany(mongoCFG.Medalbank.athletes, queryMerged, value);
	
		// 6. detail athletes(athleteID)
		returnObj = await this.detail(athleteID);		
		
		return returnObj;
	}

	// athletesGroup
	static async athletesGroup(body) {
		//----------------------------------------------------------------
		const query = {
			$or: [ {status: ""}, { status: { $exists: false }} ]
		}

		switch (body.group)	{
			case "김":
			case "이":
			case "박":
				query.name = new RegExp("^" + body.group);	
				break;
			case "minor":	// 정조최윤강장
				query.name = new RegExp("^(정|조|최|윤|강|장)");	
				break;
			case "etc":
			default:
				query.name = { $not: new RegExp("^(김|이|박|정|조|최|윤|강|장)") };	
				break;
		}

		const context = {
			query			: query,
			projection: { _id:0, time:0, confirm:0, },
			limit			: 5000,
		}

		return await searchAthletes(query);
	}

	// athletesCompetition
	static async athletesCompetition(competitionID) {
		const query = { competitionID: Number(competitionID) };

		const result = await mongodb.distinct(mongoCFG.Medalbank.times, "athleteID", query);

		query = { athleteID: { $in: result.data }};

		return await searchAthletes(query, 0); // count=0: 동명이인 모두 search

	}

	// importantAthletes
	static async importantAthletes(competitionID) {
		let returnObj = { message: "", data: [] };
		//-----> 
		const important = await mongodb.findOne(mongoCFG.Medalbank.config, { type: "important" });
	
	// console.log(important.data);
		const query = {
			$or: [ {status: ""}, { status: { $exists: false }} ],
			adult			: true,
			confirm		: { $ne: true },
			// status		: { $ne: "", $exists: false },
			// $or: [ {status: ""}, { status: { $exists: false }} ],
			name: new RegExp(important.data.data)
		};
	
		return await searchAthletes(query, 0); // count=0: 동명이인 모두 search
	}

	// noTimes
	static async noTimes(competitionID) {
		const result = await mongodb.distinct(mongoCFG.Medalbank.times, "athleteID");
	
		const query = { athleteID: { $nin: result.data } }
	
		return await searchAthletes(query, 1); // count=0: 동명이인이 있는 경우 search
	}

	// top100Athletes
	static async top100Athletes(competitionID) {
		let returnObj = { message: "", data: [] };
	
		const query = {		
			// adult			: true,
			rank			: { $lte: 120 },
			style     : { $in: ["freestyle","butterfly","backstroke","breaststroke","individualMedley",] }, 	
			confirm		: { $ne: true },
			$or       : [ {status: ""}, { status: { $exists: false }} ],
		}
		const athleteIDs = await mongodb.distinct(mongoCFG.Medalbank.leaderboard, "athleteID", query);
	
		const context = {
			query			: {		
				athleteID: { $in: athleteIDs.data },
			},
			projection: { _id:0, medals:0, firstDate:0, latestDate:0, latestTimes:0, majorStyle:0, majorTimes:0, timeCount:0, discipline:0, },
			limit			: 5000,
			sort      : { name:1, },
		}
	
	// console.log("query=", context.query, context);
		const result = await mongodb.find(mongoCFG.Medalbank.athletes, context);
	console.log("+++++", result.data.length);
		//-----> customizing
	
		// let nameOld = "";
		// for (const data of result.data) {
		//   const value = Customizing.customizing(data);
		//   const name = utilLibrary.normalizeString(value.name);
		//   if (name == nameOld) continue;
		//   if (returnObj.data.length < 10) console.log(value.name, name, nameOld);
		//   nameOld = name;
		//   returnObj.data.push(value);
		// }
	
		const athleteOBJ = {};
		for (const data of result.data) {
			const value = Customizing.customizing(data);
			const name = utilLibrary.normalizeString(value.name);
			// console.log(value.name, name);
			if (!athleteOBJ[name]) athleteOBJ[name] = [];
			athleteOBJ[name].push(value);
		}
		
		
		returnObj.data = [];
		// let athletes = [];
		Object.keys(athleteOBJ).forEach(name => {
			if (athleteOBJ[name].length > 1) {
				// athletes.push(athleteOBJ[name][0]);
				returnObj.data.push(athleteOBJ[name][0]);
			}
		})
	
		console.log("result.data=", result.data.length);
		console.log("returnObj.data=", returnObj.data.length);
	
		return returnObj;

	}

	// selectedAthletes
	static async selectedAthletes(name) {
		let returnObj = { message: "", data: [] };
		
		const query = {
			adult			: true,
			name			: new RegExp(name, "gi"),
			$or: [ {status: ""}, { status: { $exists: false }} ],
		}
		const context = {
			query			: query,
			projection: { _id:0, time:0, confirm:0, },
			limit			: athleteLimit,
			sort      : { name:1, gender:1, team:1},
		}
		// context.limit = 8;
	console.log("query=", context.query, context);
		//-----> select comment
		// const result = await mongodb.find(mongoCFG.Medalbank.athletesListView, context);
		const result = await mongodb.find(mongoCFG.Medalbank.athletes, context);
	console.log("+++++", result.data.length);
		//-----> customizing
		returnObj.count = result.count;
		for (const data of result.data) {
			returnObj.data.push(Customizing.customizing(data));
		}
		console.log("+++++", returnObj.data);
	
		// console.log("2> result ======================", returnObj.data);
		return returnObj;
	}

	// sameNameGenderTeam
	static async sameNameGenderTeam(body) {
		console.log("~~~~~~~~~~~~~~~~ sameNameGenderTeam ~~~~~~~~~~~~~~");
			const aggregate = [
				{ $match: { $or: [ {status: ""}, { status: { $exists: false }}] } },
				{ $group    : { _id: { name: "$name", gender: "$gender", teamID: "$teamID" },
					count     : { $sum:1 },
					athleteID : { $first: "$athleteID" },
					name      : { $first: "$name" },
					gender    : { $first: "$gender" },
					teamID		: { $first: "$teamID" },
					team			: { $first: "$team" },
				}
				},
				{ $match: { count: { $gt: 1 } } },
				{ $sort	: { count: -1 } },
				{ $limit: 5000 },
			]
			let result = await mongodb.aggregate(mongoCFG.Medalbank.athletes, aggregate);
			console.log("~~~~~~~~~~~~~~~~ sameNameGenderTeam.", result.data.length);
		
			return result;
	}

	// mergeSameNameGenderTeam
	static async mergeSameNameGenderTeam(competitionID) {
		const returnObj = { message: "", data: {} };
		return returnObj;
	
		//-----------------------------------------------------
		const result = await this.sameNameGenderTeam({});
		//-----------------------------------------------------
		const athletes = result.data.reduce((arr, athlete) => {
																	if (athlete.team != athlete.name) arr.push(athlete["_id"]);
																	return arr;
																}, [])
		//-----------------------------------------------------
	
		//-----------------------------------------------------
		// 동명이인
		//-----------------------------------------------------
		let context = {
			query     : { type: 'homonym' },
			projection: { _id:0, },
			limit     : 10000,
			skip      : 0,
		}
		const homonyms = await mongodb.find(mongoCFG.Medalbank.athletesMerge, context);
	
		//-----------------------------------------------------
		context = {
			projection: { _id:0, athleteID:1, name:1, gender:1, team:1, teamID:1, },
			limit     : 1000,
			skip      : 0,
		}
		for (const athlete of athletes) {
			// check 동명이인
			const check = homonyms.data.find(homonym => homonym.name==athlete.name && homonym.gender==athlete.gender && homonym.team==athlete.team)
			if (check) continue;
	
			context.query = athlete;
			const athleteArr = await mongodb.find(mongoCFG.Medalbank.athletes, context);
			const athleteIDs = athleteArr.data.slice(1).map(el => el.athleteID)
			const query = { athleteID: { $in: athleteIDs } };
			const value = { athleteID: athleteArr.data[0].athleteID };
			await mongodb.updateMany(mongoCFG.Medalbank.times, query, value);
			console.log(query, value);
		}
		//-----------------------------------------------------
		// fs.writeFileSync("athlete.txt", JSON.stringify(athletes, null, '  '));
		return result;
	}

	// splitAthletes
	static async splitAthletes(competitionID) {
		const returnObj = { message: "", data: {} };
		console.log("splitAthletes.body=", body);
		if (!body.timeIDs && !body.athleteID) {
			returnObj.message = "splitAthletes.timeIDs,athleteID not found...";
			console.log(returnObj.message);
			return returnObj
		}
		const athleteID = Number(body.athleteID);
		let query = { athleteID: athleteID }
		const projection = { _id:0, name:1, nameHide:1, team:1, teamID:1, adult:1, individual:1, masters:1, ageGroup:1, gender:1 };
		let result = await mongodb.findOne(mongoCFG.Medalbank.athletes, query, projection)
		if (!result.data.name) {
			returnObj.message = ` athleteID: (${body.athleteID}) not found...`;
			console.log(returnObj.message);
			return returnObj
		}
		const athlete = {
			name      : result.data.name,
			nameHide  : result.data.nameHide || '',
			team      : result.data.team || '',
			teamID    : result.data.teamID,
			masters   : result.data.masters || true,
			adult     : result.data.adult,
			individual: result.data.individual,
			ageGroup  : result.data.ageGroup || '',
			gender    : result.data.gender,
			nameComp  : `${result.data.name}-${body.timeIDs[0]}`,
			note      : `${result.data.name}-${result.data.team}`,
			datetime    : result.data.datetime,
		}
	
	 result = await indexDAO.insert({}, athlete);
	 const newAthleteID = Number(result.data);
	
		// 1. insert athlete
		// 2. times.timeIDs -> update athleteID
		query = { timeID: { $in: body.timeIDs } }
		const value = { athleteID: newAthleteID }
		console.log("splitAthletes.query:", query, "value=", value);
		result = await mongodb.updateMany(mongoCFG.Medalbank.times, query, value)
		// 3. search athletes
		return returnObj;
	}

	//----------------------------------------
	//	동명이인 등록
	//----------------------------------------
	static async saveHomonym(competitionID) {
		const returnObj = { message: "", data: {} };
	
		let team = memoryDB.getTeamByName(utilLibrary.normalizeString(body.team));
		if (team.length > 0) {
			team = team[0];
		} else {
			team = {
				team: body.team,
				teamId: 0,
			}
		}
		const value = { type: "homonym", name: body.name, gender: body.gender, team: team.name, teamID: team.teamID };
		console.log("importTime.saveHomonym.value=", value);
		const result = await mongodb.updateOne(mongoCFG.Medalbank.athletesMerge, value, value);
		return returnObj;
	}

	// confirmAthletes
	static async confirmAthletes(athleteIDs) {
		let returnObj = { message: "", };
		athleteIDs = body.athleteIDs.toString().split(',').map(id => Number(id));
	
		//------------------.-------------------------------------------
		// update times.athleteID
		//--------------------------------------------------------------
		const query = { athleteID: { $in: athleteIDs } };
		const value = { confirm: true };
		returnObj = await mongodb.updateMany(mongoCFG.Medalbank.athletes, query, value);
		returnObj.data = "";
	
		return returnObj;
	}
  /*
  *	희귀이름 조회
  *
  */
	static async uniqueAthletes() {
		let result = { data: [] };
		const returnObj = { message: "", athletes: [], uniqueAthletes: [] };
	
		let context = {
			query		: { type: "rare" },
			projection	: { _id:0, name:1, gender:1, },
			limit		: 10000,
			skip		: 0,
		}
		result = await mongodb.find(mongoCFG.Medalbank.athletesMerge, context);
		returnObj.uniqueAthletes = result.data;
		const athleteOBJ = result.data.reduce((obj, athlete) => {
			const key = `${athlete.name}-${athlete.gender}`;
			if (!obj[key]) obj[key] = athlete;
			return obj;
		}, {})
	
		context = {
			query		: {},
			projection	: { _id:0, name:1, gender:1, athleteID:1},
			limit		: 10000,
			skip		: 0,
		}
		result = await mongodb.find(mongoCFG.Medalbank.athletes, context);
		returnObj.athletes = [];
		for (const athlete of result.data) {
			const key = `${athlete.name}-${athlete.gender}`;
			if (!athleteOBJ[key]) {
				returnObj.athletes.push(athlete);
			}
		}
		console.log("unique=", returnObj.uniqueAthletes.length, "athletes=", returnObj.athletes.length);
	
		return returnObj;
	}

	// insertUniqueAthlete
	static async insertUniqueAthlete(body) {
		const returnObj = { message: "", data: {} };
	
		const value = { type: "rare", name: body.name, gender: body.gender, athleteID: Number(body.athleteID) };
		console.log("importTime.insertUniqueAthletes.value=", value);
		let result = await mongodb.insertOne(mongoCFG.Medalbank.athletesMerge, value);
		return returnObj;
	}

	// removeUniqueAthlete
	static async removeUniqueAthlete(body) {
		const returnObj = { message: "", data: {} };
	
		const query = { type: "rare",name: body.name, gender: body.gender };
		console.log("importTime.removeUniqueAthlete.query=", query);
		let result = await mongodb.deleteOne(mongoCFG.Medalbank.athletesMerge, query);
		return returnObj;
	}

	// unsetTimesAthleteID
	static async unsetTimesAthleteID(timeID) {
		var returnObj = { message: "", };
	
		try {
			const query = { "timeID": Number(timeID) };
			const value = { $unset: { athleteID: "" } };
	
			//-----> update
			const result = await mongodb.updateManyOP(mongoCFG.Medalbank.times, query, value);
	
			returnObj.data = timeID;
			return returnObj;
		}
		catch(e) {
			returnObj.message = "database.athletes.unsetTimesAthleteID.catch error=" + e;
			console.log(returnObj.message);
			return returnObj;
		}
	}

	// deleteAthleteTimes
	static async athleteTimes(body) {
		let returnObj = { message: '', athlete: {}, times: [] };
	
		const query = {fin: { $exists: false }};
		let athlete = {}
		let result;
		if (body.athleteID) {
			query.athleteID = Number(body.athleteID);
		} else {
			query.name = { name: body.name };
		}
		result = await mongodb.findOne(mongoCFG.Medalbank.athletes, query);
		if (!result.data.athleteID) {
			returnObj = { message: "athleteID not found !!" };
			console.log(returnObj.message);
			return returnObj;
		}
		athlete = Customizing.customizing(result.data);
		
		const context = {
			query 			: query,
			projection 	: { _id:0, },
		};
		result = await mongodb.find(mongoCFG.Medalbank.times, context);
	
		const times = [];
		result.data.forEach(time => {
			times.push(CustomTimes.customizing(time));
		})
	
		// console.log(athlete, times);
		return { user: athlete, times: times };
	}

	// deleteAthleteTimes
	static async deleteAthleteTimes(body) {
		let returnObj = { message: '', athlete: {}, times: [] };
	
		let value = {
			$unset: {
				competitionCount: 0,
				medals: 0,
				firstDate: 0,
				latestDate: 0,
				latestTimes: 0,
				majorStyle: 0,
				majorTimes: 0,
				timeCount: 0,
			}
		};
		const query = { athleteID: Number(body.athleteID) };
		// returnObj = await mongodb.updateOneOp(mongoCFG.Medalbank.athletes, query, value);
		returnObj = await mongodb.deleteOne(mongoCFG.Medalbank.athletes, query);
	
		value = { $unset: { athleteID: 0 } };
		returnObj = await mongodb.updateManyOP(mongoCFG.Medalbank.times, query, value);
	
		// console.log(athlete, times);
		return returnObj;
	}

	// medalList
	static async medalList(body) {
		console.log("athlete.medalList.body=", body);
		let returnObj = { message: '', data: [] };
	
		try{
	
			//db.getCollection('athletes').find({medals:{$exists:true}},{_id:0,timeID:1,name:1,medals:1}).sort({"medals.gold":-1,"medals.silver":-1,"medals.bronze":-1})
			const context = {
				query 			: { medals: { $exists:true } },
				projection	: { _id:0, athleteID:1, name:1, medals:1 },
				sort 				: {}, // { "medals.gold":-1, "medals.silver":-1, "medals.bronze":-1 },
				limit 			: 100000,
				skip 				: 0,
			}
			//----------------------------------------------------------
			const result = await mongodb.find(mongoCFG.Medalbank.athletes, context);
			//----------------------------------------------------------
			// console.log("~~~~~~~~~~~~", JSON.stringify(aggregate));
			if (result.data.length == 0) {
				returnObj.message = "athletes.medalList.athleteID no data";
				console.log(returnObj.message)
				return returnObj;
			}
			result.data = multiSort(result.data, ["~medals.gold", "~medals.silver", "~medals.bronze", ]); // DESC -> "~ageGroup", ASC: "ageGroup"
			let medals = [];
	
			let old = { gold: 9999, silver: 9999, bronze: 9999 };
			let rank = 0;
			result.data.forEach((medal) => {
				medal.medals.total = medal.medals.gold + medal.medals.silver + medal.medals.bronze;
				if (medal.medals.total > 0) {
					if (medal.medals.gold < old.gold || medal.medals.silver < old.silver || medal.medals.bronze < old.bronze) rank++;
					old = medal.medals;
					medal.rank = rank;
					medals.push(medal);
				}
			})
			returnObj.data = medals;
			
		} catch (e) {
			console.log("athlertes.medalList.catch." + e);
		}
		return returnObj;
	}
  
	// view
	static async viewMedalbank(athleteID) {

	}

	// searchName
	static async searchName(competitionID) {
		let returnObj = { message: "", data: [] };
	
		let query = { competitionCount : { $gt: 0 }};
		if (body.name) {
			query = {
				competitionCount : { $gt: 0 },
				adult	: true, 
				$or		: [ {status: ""}, { status: { $exists: false }} ], 
				name 	: new RegExp(body.name, "gi")
			};
			// query = { name : body.name};
		} else if (body.team) {
			query = { team : new RegExp(body.team, "gi")};
			// query = { team : body.team};
		} else {
			returnObj.messsage = "name, team not found !!";
			console.log(returnObj.message);
			return returnObj;
		}
	
		// ----> get sql
		const context = {
			query				:  query,
			projection	: { _id:0, athleteIDS:0, competitionIDs:0, status:0, dob:0, dobTo:0, index:0, bestTimes:0, competition:0, competitions:0, teams:0, names:0, },
			skip				: 0,
			limit				: 1000,
			sort				: { name: 1 },
		};
	
	// console.log("athlete.searchName.context=", query);
		
		const result = await mongodb.find(mongoCFG.Medalbank.athletes, context);
	// console.log("++++++++++++++++++++", result.data[0]);
	
		returnObj.data = result.data.reduce((arr, athlete) => {
			const value = {
				athleteID		: athlete.athleteID,
				name				: athlete.name || "",
				majorTimes	: athlete.majorTimes || {},
				latestTimes	: athlete.latestTimes || {},
				medals			: athlete.medals || {},
			}
			value.majorTimes = {
				style		: value.majorTimes.style || "",
				distance: value.majorTimes.distance || "",
				times		: value.majorTimes.times || "",
			}
			value.latestTimes = {
				style						: value.latestTimes.style || "",
				distance				: value.latestTimes.distance || "",
				times						: value.latestTimes.times || "",
				rank						: value.latestTimes.rank || 0,
				competitionName	: value.latestTimes.competitionID ? memoryDB.getCompetitionName(value.latestTimes.competitionID) : "",
			}
			value.medals = {
				timeCount	: value.medals.timeCount || 0,
				gold			: value.medals.gold || 0,
				silver		: value.medals.silver || 0,
				bronze		: value.medals.bronze || 0,
				total			: value.medals.total || 0,
			}
			arr.push(value);
			return arr;
		}, []);
		// console.log("======================", returnObj.data);
		return returnObj;
	}

}

module.exports = AthleteModel;

