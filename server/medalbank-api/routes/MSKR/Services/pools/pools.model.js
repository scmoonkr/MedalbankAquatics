const _    				= require('lodash');
const extend 			= require('node.extend');
const mongoCFG 		= require('../../Config/mongoCFG');
const mongoDB			= require('../../Class/MongoDB');
const UtilDate		= require("../../Class/DateLibrary");
const utilLibrary = require("../../Class/utilLibrary");
const utilError		= require("../../Class/utilError");
// const utilDatabase= require('../utilDatabase');
const imageLibrary= require("../library/images.library.js");
const TimeLibrary = require('../../Class/TimeLibrary.js');
const PoolLibrary		= require("../build/library.pools.js");
const StaticLibrary	= require("../library/statistics.library");
const PoolStatistics		= require("../library/pools.statistics.js");

const MemoryDB	= require("../../Class/MemoryDB.js");
const memoryDB	= new MemoryDB();

const Customizing = require("./pools.custom");

const mongodb 		= new mongoDB(mongoCFG.Medalbank.database);
const utilDate		= new UtilDate();

const PK = "poolID";
const MAX_LIMIT = 100;

const _context = {
	query		 	: {},
	projection: { _id:0, },
	limit		 	: MAX_LIMIT,
	skip			: 0,
	sort			: { _id:-1 },
}



async function teamStatics(times, poolID) {
  
	const { bestTimes, styles } = utilDatabase.getBestTimes(times);

	const context = {
		query			: { poolID: poolID },
		projection: { _id:0, competitionID:1, fullname:1, pool:1, sido:1, dateStart:1 },
		limit			: MAX_LIMIT,
		skip			: 0,
	}
	//----------------------------------------------------------------
	const result = await mongodb.find(mongoCFG.Medalbank.competitions, context)
	//----------------------------------------------------------------console.log("rankings=", result.data.length);
	const competitionIDs = [...new Set(result.data.map((item) => item["competitionID"]).map(entry => entry))]

	const competitions = result.data.reduce((arr, comp) => {
																		const competition = {
																			competitionID : comp.competitionID,
																			fullname      : comp.fullname || "",
																			pool          : comp.pool || "",
																			sido          : comp.sido || "",
																			dateStart     : new Date(comp.dateStart).toISOString().slice(0, 10),
																		}
																		arr.push(competition);
																		return arr;
																	}, []);
	return { bestTimes, competitions, styles }
}

function getMostRecentTimes(times, limit=8) {
	// Group records by athleteID
	const grouped = _.groupBy(times, "athleteID");

	// Extract the most recent record for each athleteID
	let result = Object.values(grouped).map(group => {
		// Sort each group by datetime (descending) and return the first record
		return _.maxBy(group, record => new Date(record.datetime));
	});
	result = result.sort((a,b) => b.datetime-a.datetime)
							 .reduce((arr, record) => {
									const value = {
										athleteID	: record.athleteID,
										name			: record.name,
										style			: record.style,
										datetime	: new Date(record.datetime).toISOString().slice(0, 10),
									};
									arr.push(value);
									return arr;
								}, [])
							 .slice(0, limit);
	// console.log("++++++++", result);
	return result;
}


class PoolModel {
	static async create() {
		const indexes = [
			{ query: { poolID:1 }, name: "poolID", option: { unique: true }	},
			{ query: { "pools.category":1 }, name: "category"	},
		];
		await mongodb.createCollectionNindex(mongoCFG.Medalbank.pools, indexes);
	}

	/**
	 * static savePoolWithImage 함수
	 * 
	 * 이 함수는 풀(pool) 데이터를 데이터베이스에 저장하거나 업데이트합니다.
	 * 또한, 관련된 대표 이미지를 처리하여 저장 경로를 설정합니다.
	 *
	 * @param {Object} body - 풀 데이터를 포함하는 객체
	 * @param {number|string} [body.poolID] - 풀의 고유 ID. 0이거나 제공되지 않은 경우 새로운 ID가 생성됩니다.
	 * @param {string} [body.sourcePath] - 저장할 이미지 파일의 경로
	 * @param {string} [body.name] - 풀 이름
	 * @param {string} [body.sido] - 행정 구역 정보
	 * @param {string} [body.course] - 코스 정보
	 * @param {number|string} [body.athleteID] - 데이터를 업데이트한 사람의 ID
	 * @param {string} [body.memo] - 추가적인 메모 정보
	 * @returns {Promise<Object>} 저장된 풀의 ID와 메시지를 포함하는 객체
	 */
	static async savePoolWithImage(body) {
		// 저장할 데이터를 담을 객체 초기화
		const value = {}; // extend(true, body, {});

		// poolID 확인 및 생성
		if (!body.poolID || body.poolID == 0) {
				// poolID가 0이거나 제공되지 않은 경우, 새로운 ID를 생성
				value.poolID = await mongodb.max(mongoCFG.Medalbank.teams, "poolID", {});
		} else {
				// 제공된 poolID 사용
				value.poolID = Number(body.poolID);
		}

		// --------------------------------------------------------------
		// 대표 이미지 처리
		// --------------------------------------------------------------
		if (body.sourcePath) {
				// 이미지 저장 및 경로 설정
				const result = await imageLibrary.saveFile(
																						body.sourcePath, 
																						"images", 
																						"pools", 
																						value.poolID, 
																						'f'	// 'f'eatured, 't'humbnail, '0'~'9'
																					);
				// 대표 이미지 경로를 value에 추가
				value.featured = `/cms/images/pools/${value.poolID}/f`;
		}

		// --------------------------------------------------------------
		// 입력받은 필드 업데이트
		// --------------------------------------------------------------
		if (body.name			) value.fullname 	= body.name.trim(); // 이름 설정
		if (body.sido			) value.sido 			= body.sido.trim(); // 행정 구역 설정
		if (body.course		) value.course 		= body.course.trim(); // 코스 정보 설정
		if (body.athleteID) value.athleteID = Number(body.athleteID); // 업데이트한 사람 ID 설정
		if (body.memo			) value.memo 			= body.memo.trim(); // 메모 설정
		value.updated = new Date(); // 마지막 업데이트 시간 설정

		// 데이터베이스에서 업데이트할 쿼리 정의
		const query = { poolID: value.poolID };

		// --------------------------------------------------------------
		// 데이터베이스 업데이트
		// --------------------------------------------------------------
		await mongodb.updateOne(mongoCFG.Medalbank.pools, query, value);

		await historyLibrary.saveHistory(
													"pools", 
													"saveWithImage", 
													"poolID", 
													value,
												); // db, cmd, id, body
		// --------------------------------------------------------------
		// 결과 반환
		// --------------------------------------------------------------
		return { message: "", data: { poolID: value.poolID } };
	}
	// detail
	static async detail(body) {
		console.log("pools.detail.value=", body.poolID);
		//----------------------------------------------------------------
		const returnObj = await mongodb.findOne(mongoCFG.Medalbank.pools, { poolID: Number(body.poolID) }, { _id:0,});
		console.log("--->",returnObj.data);
		returnObj.data = Customizing.field(returnObj.data);
		//----------------------------------------------------------------
		await StaticLibrary.updateViewReactions("pools", body.timeID, returnObj.data.name, body.userID??0); // db, id, name, userID

		return returnObj;
	}
	// view
	static async viewRealtime(body) {
		console.log("1>pools.viewRealtime.poolID=", body.poolID);
		const poolID = Number(body.poolID);
		//----------------------------------------------------------------
		let query = { poolID: poolID };
		const aggregate = [
			{ $match: query },
			// 대회이력
			{ $lookup: {
					from		: mongoCFG.Medalbank.competitions,
					let			: { "poolID": "$poolID" },
					pipeline: [
						{ $match: {
							$expr: { $and: [															
										{ $eq: ["$poolID", "$$poolID"] }
									]
								}
							}
						},
						{ $project: { _id:0, fullname:1, dateStart:1, competitionID:1, athleteCount:1 } }
					],
					as: "competitions"
				}
			},			
			// 함께한 수영선수
			// { $lookup: {
			// 		from: mongoCFG.Medalbank.times,
			// 		let: { "poolID": "$poolID" },
			// 		pipeline: [
			// 			{ $match: {
			// 				$expr: { $and: [
			// 							// { $eq: [ "$datetime", ISODate('2025-01-01T00:00:00.000Z') ] },
			// 							{ $eq: [ "$type", "time" ] }, // 훈련기록
			// 							{ $eq: ["$poolID", "$$poolID"] }
			// 						]
			// 					}
			// 				}
			// 			},
			// 			{ $project: { _id:0, timeID:1, gender:1, name:1, time:1, athleteID:1, datetime:1 } },
      //       { $sort		: { datetime: -1 } },
      //       { $limit	: 100 }
			// 		],
			// 		as: "times"
			// 	}
			// },
		];
		let result = await mongodb.aggregate(mongoCFG.Medalbank.pools, aggregate);
		if (result.data.length == 0) return { message: "no data", data: {} };
		const { competitions: _competitions, ..._pool} = result.data[0];
		// _competitions: 대회이력
		_pool.extraInfo = {};
		_pool.extraInfo.competitions = _competitions.reduce((arr, data) => {
																									data.dateStart = data.dateStart ? new Date(data.dateStart).toISOString().slice(0, 10) : "";
																									arr.push(data);
																									return arr;
																								}, []); // memoryDB.getCompetitions({ poolID: poolID });
		//------------------------------------------
		// find eventTime
		//------------------------------------------
		query = {
			poolID		: poolID,
			timeStamp	: { $gt: 0 },
			isMasters	: true,
			isAdult		: true,
			$or				: [ { status: "" }, { status: { $exists: false } } ],
		};
		const context = {
			query			: query,
			projection: { _id:0, timeID:1, type:1, athleteID:1, name:1, gender:1, style:1, course:1, distance:1, time:1, timeStamp:1, pool:1, poolID:1, competitionID:1, competitionName:1, teamID:1, team:1, ageGroup:1, thumbnail:1, datetime:1, },
			limit			: 10000,
			skip			: 0,
		};
		//------------------------------------------
		result = await mongodb.find(mongoCFG.Medalbank.times, context);
		//------------------------------------------
		let eventTimes = result.data.filter(tm => tm.type == 'event')
																	.reduce((arr, data) => {
																		data.datetime = new Date(data.datetime).toISOString().slice(0, 10);
																		arr.push(data);
																		return arr;
																	}, []);

		// poolTimes: 함께수영한 친구들
		let timeTimes  = result.data.filter(tm => tm.type == 'time')
																.reduce((arr, data) => {
																	data.datetime = new Date(data.datetime).toISOString().slice(0, 10);
																	arr.push(data);
																	return arr;
																}, []);
		// _pool.statistics.poolTimes = poolTimes.reduce((arr, data) => {
		// 																				data.datetime = new Date(data.datetime).toISOString().slice(0, 10);
		// 																				arr.push(data);
		// 																				return arr;
		// 																			}, []);

		// const stat = await PoolLibrary.buildPoolsStatistics(Number(poolID), bestEvent);

		const timeLibrary = new TimeLibrary();
		// pool.statistics.latest = timeLibrary.findLatestTime(bestEvent);
		
		_pool.extraInfo.latest = getMostRecentTimes(timeTimes);
		_pool.extraInfo.timeTimes = timeTimes;
		console.log("timeTimes=", timeTimes.length);
		// best event
		_pool.extraInfo.bestEvent = timeLibrary.findBestTime(eventTimes
														.filter(el => el.type == 'event'), 1)
														.reduce((arr, time) => {
															const times = time.times.length > 0 ? time.times[0] : {};
															const value = {
																gender				: time.gender,
																style						: time.style,
																course						: time.course,
																distance				: time.distance,
																...times,
															}
															arr.push(value);
															return arr;
														},[]);
		// best time
		_pool.extraInfo.bestTime = timeLibrary.findBestTime(timeTimes
														.filter(el => el.type == 'time'), 1)
														.reduce((arr, time) => {
															const times = time.times.length > 0 ? time.times[0] : {};
															const value = {
																gender				: time.gender,
																style						: time.style,
																course						: time.course,
																distance				: time.distance,
																...times,
															}
															arr.push(value);
															return arr;
														},[]);

		const { times:bestEventsComp, compression:bestEventcomp } = timeLibrary.getCompetitionsTeamsPools(_pool.extraInfo.bestEvent);
		const { times:bestTimesComp, compression:bestTimeComp } 	= timeLibrary.getCompetitionsTeamsPools(_pool.extraInfo.bestTime);
		const { times:timeTimesComp, compression:timesComp } 			= timeLibrary.getCompetitionsTeamsPools(_pool.extraInfo.timeTimes);
		
		_pool.extraInfo.bestEvent 	= bestEventsComp;
		_pool.extraInfo.bestTime 	= bestTimesComp;
		_pool.extraInfo.timeTimes = timeTimesComp.sort((a,b) => b.datetime - a.datetime);
		// console.log("stemTimes=", stemTimes.length, stemTimes[0]);
		
		// competition, pool, team name 분리하고 통합합
		_pool.compression = {
			teams: [...new Map([
														...bestEventcomp.teams,
														...bestTimeComp.teams,
														...timesComp.teams,
													].map(item => [item.teamID, item])
												).values()
							],
			pools: [...new Map([
														...bestEventcomp.pools,
														...bestTimeComp.pools,
														...timesComp.pools,
													].map(item => [item.poolID, item])
												).values()
							],
			competitions: [...new Map([
														...bestEventcomp.competitions,
														...bestTimeComp.competitions,
														...timesComp.competitions,
													].map(item => [item.competitionID, item])
												).values()
										],
		};

console.log("view=", _pool.extraInfo.competitions);



		// await StaticLibrary.updateViewReactions("pools", _pool.timeID, _pool.name, body.userID??0); // db, id, name, userID

		// console.log("pool=", _pool.statistics);
		return { message: '', data: _pool };
	}

	// find pools
	static async names(body) {
		console.log("pools.names:", body, new Date());
		// query.competitionCount = { $gt: 0}
		const name = new RegExp(body.name.trim(), "gi");
		const query = { $or: [{ indexes: name }, { name: name }] };
		const context = {
			query			: query,
			projection: { _id:0, poolID:1, name:1, sido:1, course:1, },
			limit			: body.limit ? Number(body.limit) : MAX_LIMIT,
			skip			: body.skip ? Number(body.skip) : 0,
			sort			: { name:1 },
		}
		//----------------------------------------------------------------
		const result = await mongodb.find(mongoCFG.Medalbank.pools, context)
		//----------------------------------------------------------------
		console.log("pools.names=====>", result.data.length, result.data.length>0?result.data[0]:[]);
		return result;
	}

  //####################################################################
  //######### Confirm ##################################################
  //####################################################################



	// view
	static async view(poolID) {
		console.log("1>pools.view.poolID=", poolID);
		//----------------------------------------------------------------
		const query = { poolID: Number(poolID) };
		const aggregate = [
			{ $match: query },
			{ $lookup: {
					from				: mongoCFG.Medalbank.poolsStatistics,
					localField	: "poolID",
					foreignField: "poolID",
					as					: "statistics"
				}
			},
			{ $lookup: {
					from: mongoCFG.Medalbank.times,
					let: { "poolID": "$poolID" },
					pipeline: [
						{ $match: {
							$expr: { $and: [
										{ $eq: ["$type", "time"] },
										{ $eq: ["$poolID", "$$poolID"] }
									]
								}
							}
						},
						{ $project: { _id:0, poolID:1, style:1, datetime:1 } }
					],
					as: "times"
				}
			},
			{ $project: { _id:0, } }
		];
console.log("query:", query);
		//-----> select comment
		const result = await mongodb.aggregate(mongoCFG.Medalbank.pools, aggregate);
		if (result.data.length == 0) return { message: "no data", data: {} };
		const pool = result.data[0];

	/*
	statistics: [
    {
      _id: new ObjectId('674c8591f9940a21bd4dffba'),
      poolID: 433,
      timeCount: 12273,
      athleteCount: 9275,
      competitions: [Array],
      competitionCount: 5,
      latest: [Object],
      swimmersEvent: [Array],
      timekeepers: [],
      bestTimes: [Array]
    }
  ],
  times: [
    { style: 'butterfly', poolID: 433 },
    { style: 'freestyle', poolID: 433 },
	]
	*/
// console.log(pool.statistics);
		const competitions = pool.statistics[0].competitions.filter(el => el.competitionID != undefined)
																												.reduce((acc, cur) => {
																													const comp = memoryDB.getCompetition(cur.competitionID);
																													const value = {
																														dateStart	: new Date(comp.dateStart).toISOString().slice(0, 10),
																														sido			: comp.sido ?? '',
																														course		: comp.course ?? '',
																														name			: comp.fullname ?? '',
																														target		: comp.target || '',
																														masters		: comp.masters || true,
																														athleteCount	: cur.athleteCount || 0,
																														competitionID	: cur.competitionID,
																													};
																													if (cur.dateStart) value.dateStart = new Date(comp.dateStart).toISOString().slice(0, 10);	
																													acc.push(value);
																													return acc;
																												}, []);
		// poolStatistics가 없으면 만들어 줌
		const utilTimes = new TimeLibrary();
		const timeByDate = utilTimes.filterByDate(pool.times, "2024-09-01");
		const bestEventTimes = [];
		const bestTimeTimes = [];

		// pool.statistics[0].bestTimes.forEach(el => {
		// 	console.log(`${el.gender}-${el.style}-${el.distance}: cid:${el.competitionID}`);
		// })
		for (const time of pool.statistics[0].bestTimes) {
			const times = time.times.length > 0 ? time.times[0] : {};
			time.name = times.name ?? '';
			time.rank = times.rank ?? '';
			time.time = times.time ?? '';
			time.thumbnail = times.thumbnail ?? '';
			time.datetime = times.datetime ? new Date(times.datetime ?? '').toISOString().slice(0, 10) : '';
			delete time.times;
			// console.log("competitionID=", time, times.competitionID);
			if (times.competitionID) {
				time.competitionID = times.competitionID ?? 0;
				const competition = memoryDB.getCompetition(time.competitionID);
				time.competitionName = competition.fullname ?? '';
				time.datetime = competition.dateStart ?? '';
				bestEventTimes.push(time);
			} else {
				bestTimeTimes.push(time);
			}
		}
		pool.statistics = {
      athleteCount	: pool.statistics[0].athleteCount,
      latest				: pool.statistics[0].latest,
			swimmersEvent	: pool.statistics[0].swimmersEvent,
			bestTimes			: bestEventTimes,
			bestTimeTimes	: bestTimeTimes,
			competitions	: competitions,
			timeByDate		: timeByDate,
		}
		console.log("pool.bestTimes=", pool.statistics.bestTimes.length);
		console.log("pool.bestTimeTimes=", pool.statistics.bestTimeTimes.length);
		delete pool.times;
		// console.log("pool=", pool.statistics.bestTimes[0]);
		
		return { message: '', data: pool};
	}

	// find pools
	static async list(query, body) {
		const limit = body.limit ? Number(body.limit) : MAX_LIMIT;
		let skip = (Number(body.page??1)-1)	* limit;
		skip = skip < 0 ? 0 : skip;
		const sort = {};
		if (body.sortField) {
			sort[body.sortField] = body.sortDirection == 'asc' ? 1 : -1;
		} else sort.name = 1;
		// query.competitionCount = { $gt: 0}
		const context = {
			query			: query,
			projection: { _id:0, },
			limit			: limit,
			skip			: skip,
			sort			: sort,
		}
		//----------------------------------------------------------------
		const result = await mongodb.find(mongoCFG.Medalbank.pools, context)
		console.log("~~~~~~~~~~~~~~~~~~", result.data.length, result.data[0]);
		//----------------------------------------------------------------
		result.data = result.data.map(data => Customizing.field(data));
		const pools = [];
		const noTimes = [];
		result.data.map(data => {
			if (data.competitionCount > 0) pools.push(data); else noTimes.push(data);
		});
		result.data = [...pools, ...noTimes];
		console.log("~~~~~~~~~~~~~~~~~~", result.data.length, result.data[0]);
		return result;
	}
	static getByData = (async (body) => {
		const data = new RegExp(body.data.trim(), "gi");
		const query = { $or: [
			{ name: data },   
			{ poolname: data },   
			{ fullname: data },      
			{ phone: data },
		]}
		return await this.list(query, body);
	});
	static getBySido				= (async (body) => await this.list({ sido			: body.sido.trim()			}, body));
	static getByProvince		= (async (body) => await this.list({ province	: body.province.trim() }, body));
	static getByName				= (async (body) => await this.list({ name			: new RegExp("^" + body.name.trim(), "gi") }, body));

	// insert
	static async insert(body) {
		const value = Customizing.field(body);
		value.poolID = await mongodb.max(mongoCFG.Medalbank.pools, "poolID", {});
	console.log("pools.insert.value=", value);
		//----------------------------------------------------------------
		return await mongodb.insertOne(mongoCFG.Medalbank.pools, value);
		//----------------------------------------------------------------
	}

	// update
	static async update(body) {
		if (Object.keys(body).length < 2) return utilError.errorMSG("Model","pools", "update", "field not found");
		const value = Customizing.field(body);
		if (!body.poolID) {
			value.poolID = await mongodb.max(mongoCFG.Medalbank.pools, "poolID", {});
		}
		const query = { poolID: value.poolID };

		delete value.poolID;
		//-------- build names
		const { names, indexes } = utilLibrary.indexingNames(body);
		value.indexes = indexes;
		value.names = names;

		console.log("pools.update.value=", value);
	
		//----------------------------------------------------------------
		return await mongodb.updateOne(mongoCFG.Medalbank.pools, query, value);
		//----------------------------------------------------------------
	}

	// delete
	static async delete(poolID) {
		try {
			const query = { poolID: Number(poolID) };
		console.log("pools.delete.value=", poolID);
			//----------------------------------------------------------------
			return await mongodb.deleteOne(mongoCFG.Medalbank.pools, query);
			//----------------------------------------------------------------
		} catch (e) {
			return utilError.errorMSG("Model","pools", "delete", "catch." + err);
		}
	}

}

module.exports = PoolModel;

