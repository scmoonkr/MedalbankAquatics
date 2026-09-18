const extend 			= require('node.extend');
const mskCFG 			= require('../../Config/mskCFG.js');
const mongoCFG 		= require('../../Config/mongoCFG.js');
const mongoDB			= require('../../Class/MongoDB.js');
const UtilDate		= require("../../Class/DateLibrary.js");
const utilError		= require("../../Class/utilError");
const imageLibrary = require("../library/images.library.js");
// const historyLibrary = require("../library/history.library.js");

const TimeLibrary	= require("../../Class/TimeLibrary.js");
const timeLibrary = new TimeLibrary();
// const MemoryUTIL	= require("../memoryUTIL");

const MemoryDB 		= require('../../Class/MemoryDB');
const memoryDB		= new MemoryDB();


const Customizing = require("./times.custom.js");
const { ageGroup } = require('../competitions/competitions.model');

const mongodb 		= new mongoDB(mongoCFG.Breaststroke.database);
const utilDate		= new UtilDate();

const PK = "timeID";
const MAX_TIMESTAMP = 0.013888888888888888; // '20:00.00'

const sort = { name:1,gender:1, team:1, ageGroup:1,discipline:1,distance:1,times:1 };
const timsLimit = 5000;

class TimeModel {

	// detail
	static async detail(body) {
		console.log("times.detail.value=", body);
		//----------------------------------------------------------------
		const query = { timeID: Number(body.timeID) };
		//----------------------------------------------------------
		const result = await mongodb.findOne(mongoCFG.Breaststroke.times, query, {_id:0});
		//----------------------------------------------------------
		if(!result.data.timeID ) return utilError.errorMSG("Model","times", "detail", "no data");
		result.data = Customizing.customizing(result.data);
		const competition = memoryDB.getCompetition(result.data.competitionID);
		// console.log("competition=",competition);
		if (competition.competitionID) {
			result.data.competitionName = competition.fullname ?? "";
			result.data.stemID = competition.stemID;
			result.data.sido = competition.sido ?? "";
			result.data.pool = competition.pool ?? "";
			result.data.poolID = competition.poolID;
			result.data.datetime = competition.dateStart ?? "";
			if (!result.data.course) result.data.course = competition.course ?? "";
		}
		if (!result.data.pool) {
			const pool = memoryDB.getPool(result.data.poolID);
			if (pool.poolID) {
				result.data.pool = pool.fullname ?? "";
				if (!result.data.course) result.data.course = pool.course;
			}
		}
		result.data.datetime = new Date(result.data.datetime).toISOString().slice(0, 10);

		//------------------------------------
		// await historyLibrary.saveHistory("times", "detail", "timeID", body); // db, cmd, id, body
		//------------------------------------
		// await StaticLibrary.updateViewReactions("times", result.data.timeID, result.data.name, body.userID??0); // db, id, name, userID
// console.log("time.detail.", result.data);
		return result;
	}
	// view
	static async view(body) {
		//----------------------------------------------------------------
		let query = { timeID: Number(body.timeID), athleteID: { $gt: 0 } };
		let aggregate = [
			{ $match: query },
			{ $lookup:{
					from				: mongoCFG.Breaststroke.athletes,
					// from				: mongoCFG.Breaststroke.athletesView,
					localField	: "athleteID",
					foreignField: "athleteID",
					as					: "athlete"
				}
			},
			{ $lookup:{
					from				: mongoCFG.Breaststroke.athletes,
					localField	: "timekeeper",
					foreignField: "athleteID",
					as					: "keeper"
				}
			},
			{ $lookup:{
					from				: mongoCFG.Breaststroke.times,
					localField	: "athleteID",
					foreignField: "athleteID",
					as					: "times"
				}
			},
			// { $sort: sort },
			// { $project: project1 },
			// { $project: project2 }
			{ $project: {
					_id:0, timeID:1, athleteID:1,name:1, time:1, gender:1,ageGroup:1,rank:1, discipline:1, course:1, distance:1,
					teamID:1, poolID:1, competitionID:1, datetime:1, keeper:1, featured:1, isDark:1,
					type:1, athlete: 1, times:1, timekeeper:1, extraInfo:1,
				}
			}
		];
		//----------------------------------------------------------
		const result = await mongodb.aggregate(mongoCFG.Breaststroke.times, aggregate);
		//----------------------------------------------------------
		if(result.data.length == 0 ) return { message: "no data", data: { extraInfo: { athlete: {} } } }; // utilError.errorMSG("Model","times", "detail", "no data");
		result.data = result.data[0];

		query = {
			athleteID	: result.data.athleteID,
			discipline: result.data.discipline,
			distance	: result.data.distance,
			$or				: [ { status: "" }, { status: { $exists: false } } ],
			timeStamp	: { $gt: 0 },
			fin				: { $exists: false }
		};
		aggregate = [
			{ $match: query },
			{ $group: {
					_id: null,
					bestTime: { $min: "$timeStamp" },
					avgTime: { $avg: "$timeStamp" },
				}
			},
			{ $project: {
					_id: 0,
					bestTime: 1,
					avgTime: 1,
				}
			}
		];
		const resultBest = await mongodb.aggregate(mongoCFG.Breaststroke.times, aggregate);
// console.log("resultBest=", resultBest.data);
		const best = {};
		if (resultBest.data.length > 0) {
			best.bestTime = utilDate.convertTimestamp2string(resultBest.data[0].bestTime);
			best.avgTime = utilDate.convertTimestamp2string(resultBest.data[0].avgTime);
		}

		const year = new Date().getFullYear();
		query = {
			...query,
			$or: [
				{ datetime: { $type: "string", $regex: `^${year}` } },		
				{ $and: [
						{ datetime: { $type: "date" } },
						{ $expr: {
								$eq: [{ $year: "$datetime" }, year]
							}
						}
					]
				}
			]
		};
		aggregate = [
			{ $match: query },
			{ $group: {
					_id: null,
					bestTime: { $min: "$timeStamp" },
					avgTime: { $avg: "$timeStamp" },
				}
			},
			{ $project: {
					_id: 0,
					bestTime: 1,
					avgTime: 1,
				}
			}
		];
		const resultSeason = await mongodb.aggregate(mongoCFG.Breaststroke.times, aggregate);
		// console.log("resultSeason=", resultSeason.data);
		if (resultSeason.data.length > 0) {
			// utilDate.convertString2Timestamp(resultBest.data[0].bestTime);
			best.seasonBestTime = utilDate.convertTimestamp2string(resultSeason.data[0].bestTime);
			best.seasonAvgTime = utilDate.convertTimestamp2string(resultSeason.data[0].avgTime);
		}

		// console.log("best=", best);

		result.data.pool = memoryDB.getPoolName(result.data.poolID);
		if (result.data.competitionID) {
			result.data.competitionName = memoryDB.getCompetitionName(result.data.competitionID);
		}
		// result.data = Customizing.customizing(result.data[0]);
		result.data.extraInfo = {
			...result.data.extraInfo ?? {},
			...best,
		};
		const athletes = result.data.athlete ?? [];
		// if (result.data.athlete.length > 0) {
		// 	result.data.athlete = result.data.athlete[0];
		// 	result.data.athlete.extraInfo = result.data.athlete.extraInfo ?? {};
		// 	result.data.athlete.bestTimes = result.data.athlete.bestTimes ?? [];
		// }
		const athlete = athletes.length == 0
												? {}
												: {
														name			: athletes[0].name,
														sido			: athletes[0].sido,
														teamID		: athletes[0].teamID,
														team			: memoryDB.getTeamName(athletes[0].teamID) ?? '',
														poolID		: athletes[0].poolID ?? 0,
														pool			: memoryDB.getPoolName(athletes[0].poolID) ?? '',
														dob				: athletes[0].dob,
														athleteID	: athletes[0].athleteID,
														// info: athletes[0].info.length > 0 ? athletes[0].info[0] :  {},
														extraInfo	: athletes[0].extraInfo ?? {},
														bestTimes	: athletes[0].bestTimes ?? [],
													};
		// bestTimes = bestTimes.filter(item => item.discipline == result.data.discipline && item.course == result.data.course && item.distance == result.data.distance);	
		result.data.extraInfo.athlete = athlete;
		result.data.extraInfo.athlete.bestTimes = 
																				athlete.bestTimes == undefined || athlete.bestTimes.length == 0
																				? []
																				: athlete.bestTimes.filter(item => 
																					item.discipline == result.data.discipline && 
																					item.course == result.data.course && 
																					item.distance == result.data.distance
																				);	
		result.data.extraInfo.athlete.bestTimes = result.data.extraInfo.athlete.bestTimes.length > 0 ? result.data.extraInfo.athlete.bestTimes[0] : {};
		delete result.data.athlete;
		result.data.times = result.data.times ?? [];
		const times = result.data.times.reduce((arr, cur) => {
																											const value = {
																												timeID: cur.timeID,
																												time: cur.time,
																												timeStamp: cur.timeStamp,
																												discipline: cur.discipline,
																												course: cur.course,
																												distance: cur.distance,
																												rank: cur.rank,
																											};
																											if (cur.extraInfo) value.extraInfo = cur.extraInfo;
																											arr.push(value);
																											return arr;
																										},[]);

		// times -> 시즌 평균, 평균, 최고, 시즌최고기록 계산
		//----------------------------------------------------------------
		if (result.data.keeper.length > 0) {
			result.data.extraInfo.timekeeper = result.data.keeper[0].name;
		}
		delete result.data.keeper;

		delete result.data.times;
		// console.log("result.data.extraInfo.athlete.bestTimes=", result.data.extraInfo.athlete.bestTimes);
		// console.log("result.data=", result.data);

		//------------------------------------
		// await historyLibrary.saveHistory("times", "view", "timeID", body); // db, cmd, id, body
		//------------------------------------
		// await StaticLibrary.updateViewReactions("times", result.data.timeID, result.data.name, body.userID??0); // db, id, name, userID
		return result;
	}

	// find times
	static async list(query, body) {
		const limit = timsLimit; // body.limit ? Number(body.limit) : timsLimit;
		let skip = (Number(body.page??1)-1)	* limit;
		skip = skip < 0 ? 0 : skip;
		const sort = {};
		if (body.sortField) {
			sort[body.sortField] = body.sortDirection == 'asc' ? 1 : -1;
		} else sort.timeStamp = 1;
		const context = {
			query     : query,
			projection: { _id:0, },
			limit     : limit,
			skip      : skip,
			sort      : sort, // { gender:1,  discipline:1, course:1, distance:1, timeStamp:1, },
		}

		//----------------------------------------------------------------
		const result = await mongodb.find(mongoCFG.Breaststroke.times, context);
		console.log(query, "times.list.result=", result.data.slice(0,1));
		//----------------------------------------------------------------
		//-----> customizing
		// result.data = result.data.map(data => (Customizing.customizing(data)));

		const athleteIDs = [...new Set(result.data.filter(el => el.athleteID).map(entry => entry.athleteID))];
		// console.log("athleteIDs=", athleteIDs);
		const context1 = {
			query			: { athleteID: { $in: athleteIDs } },
			projection: { _id:0, athleteID:1, thumbnail:1, },
			limit			: 1000,
			sort			: { athleteID:1, },	
		};
		const athletes = await mongodb.find(mongoCFG.Breaststroke.athletes, context1);

		result.data = result.data.reduce((arr, time) => {
																const value = Customizing.customizing(time);
																// console.log("masters=", time.isMasters, value.isMasters);
																// competitionName이 없으면 competitionID로 이름 가져오기
																if (!value.competitionName && value.competitionID) {
																	const competition = memoryDB.getCompetition(value.competitionID);
																	value.competitionName = competition ? competition.fullname : "";
																	if (!value.datetime) value.datetime = competition ? competition.dateStart : "";
																	if (!value.poolID) value.pool = competition.poolID;	
																}
																if (!time.ageGroup && time.ageGroupCode) {
																	value.ageGroup = mskCFG.getAgeGroupNameByAgeGroupCode(time.ageGroupCode);
																}
																// pool이 없으면 poolID로 수영장명 가져오기
																if (!value.pool && value.poolID) {
																	const pool = memoryDB.getPool(value.poolID);
																	value.pool = pool.fullname ?? "";	
																	if (!value.sido) value.sido = pool.sido ?? "";	
																}
																if (value.athleteID) {
																	const athlete=athletes.data.find(el => el.athleteID == value.athleteID);
																	if (athlete) {
																		value.thumbnail = athlete.thumbnail || '';
																	}
																}
																arr.push(value);
																return arr;
															}, []);
		// console.log("result=", result);
		// console.log("times.list.count=", result.count, "length=", result.data.length, result.data[0]);
		// console.log("------>", body, query, result.data[0], result.data.length);
		return result;
	}

	// delete
	static async delete(timeID) {
		try {
			console.log("times.delete.timeID=", timeID);
			//----------------------------------------------------------------
			const today = new Date().toISOString().slice(0, 10);
			const result = await mongodb.updateOneOp(
																				mongoCFG.Breaststroke.times,
																				{ timeID: Number(timeID) },
																				{
																					$set: { deleted: today, status: "deleted" },
																					$unset: { athleteID: 0 }
																				},
																			);
			// const result = await mongodb.deleteOne(
			// 																	mongoCFG.Breaststroke.times,
			// 																	{ timeID: Number(timeID) },
			// 																);
		//----------------------------------------------------------------
		} catch (err) {
			return utilError.errorMSG("Model","times", "delete", "catch." + err);
		}
	}

	static async saveTimeWithImage(body) {
		// console.log("time.model.saveTimeWithImage.body=", body);

		const value = {};
		// console.log("----->", body.timeID, value.timeID);
		value.timeID	= Number(body.timeID); // athleteID
		//------------------------
		const result = await mongodb.findOne(
																		mongoCFG.Breaststroke.times,
																		{ timeID: value.timeID },
																		{ _id:0, timeID:1 }
																	);
		//------------------------
		if (!result.data.timeID) {
			console.log("timeID not found!!!");
			return { message: "", data: { timeID: 0 } };
		}

		// --------------------------------------------------------------
		// 대표 이미지 처리
		// --------------------------------------------------------------
		if (body.sourcePath) {
			// 이미지 저장 및 경로 설정
			const result = await imageLibrary.saveFile(
																					body.sourcePath,
																					"images",
																					"times",
																					value.timeID,
																					'f'	// 'f'eatured, 't'humbnail, '0'~'9'
																				);
			// 대표 이미지 경로를 value에 추가
			value.featured = `/cms/images/times/${value.timeID}/f`;
		}
		if (body.isDark) value.isDark = body.isDark == true || body.isDark == "true";

		// --------------------------------------------------------------
		// 데이터베이스에 업데이트
		// --------------------------------------------------------------
		// console.log("save times image:", value);
		await mongodb.updateOne(mongoCFG.Breaststroke.times, { timeID: value.timeID }, value);

		// await historyLibrary.saveHistory(
		// 									"times", 
		// 									"saveWithImage", 
		// 									"timeID", 
		// 									value,
		// 								); // db, cmd, id, body
		// await StaticLibrary.updateViewReactions("times", value.timeID, value.name, body.userID??0); // db, id, name, userID

		// --------------------------------------------------------------
		// 결과 반환
		// --------------------------------------------------------------
		return { message: "", data: { timeID: value.timeID } };
	}

	// update
	static async updateTimesMSKR(body) {
		body.timeID = Number(body.timeID);
		const query = { timeID: body.timeID };

		if (body.time) {
			time.time = body.time.trim();
			time.timeStamp = utilDate.convertString2Timestamp(time.time);
		}

		// console.log("times.model.updateTimes.query:", query, value);
	
		//----------------------------------------------------------------
		await mongodb.updateOne(mongoCFG.Breaststroke.times, query, body);
		//----------------------------------------------------------------

		value = {
			collection: mongoCFG.Breaststroke.times,
			id				: body.timeID,
			cmd				: "updateTimes",
			datetime 	: new Date(),
			json 			: body
		};
		//----------------------------------------------------------------
		return await mongodb.updateOne(mongoCFG.Breaststroke.updateLogs, query, value);
		//----------------------------------------------------------------
	}

	//####################################################################
	//####################################################################
	//####################################################################
	}

module.exports = TimeModel;

