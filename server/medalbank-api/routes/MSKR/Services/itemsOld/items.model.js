const _    				= require('lodash');
const extend 			= require('node.extend');
const mongoCFG 		= require('../../Config/mongoCFG');
const mongoDB			= require('../../Class/MongoDB');
const UtilDate		= require("../../Class/DateLibrary");
const utilLibrary = require("../../Util/utilLibrary");
const utilError		= require("../../Util/utilError");
// const utilDatabase= require('../utilDatabase');
const imageLibrary= require("../library/images.library.js");
const TimeLibrary = require('../../Class/TimeLibrary.js');


const Customizing = require("./items.custom");

const mongodb 		= new mongoDB(mongoCFG.Medalbank.database);
const utilDate		= new UtilDate();

const PK = "itemID";
const MAX_LIMIT = 100;

const _context = {
	query		 	: {},
	projection: { _id:0, },
	limit		 	: MAX_LIMIT,
	skip			: 0,
	sort			: { _id:-1 },
}

class ItemModel {
	static async create() {
		const indexes = [
			{ query: { itemID:1 }, name: "itemID", option: { unique: true }	},
			{ query: { "items.category":1 }, name: "category"	},
		];
		await mongodb.createCollectionNindex(mongoCFG.Medalbank.items, indexes);
	}

	/**
	 * static saveItemWithImage 함수
	 * 
	 * 이 함수는 풀(item) 데이터를 데이터베이스에 저장하거나 업데이트합니다.
	 * 또한, 관련된 대표 이미지를 처리하여 저장 경로를 설정합니다.
	 *
	 * @param {Object} body - 풀 데이터를 포함하는 객체
	 * @param {number|string} [body.itemID] - 풀의 고유 ID. 0이거나 제공되지 않은 경우 새로운 ID가 생성됩니다.
	 * @param {string} [body.sourcePath] - 저장할 이미지 파일의 경로
	 * @param {string} [body.name] - 풀 이름
	 * @param {string} [body.sido] - 행정 구역 정보
	 * @param {string} [body.course] - 코스 정보
	 * @param {number|string} [body.athleteID] - 데이터를 업데이트한 사람의 ID
	 * @param {string} [body.memo] - 추가적인 메모 정보
	 * @returns {Promise<Object>} 저장된 풀의 ID와 메시지를 포함하는 객체
	 */
	static async saveItemWithImage(body) {
		// 저장할 데이터를 담을 객체 초기화
		const value = {}; // extend(true, body, {});

		// itemID 확인 및 생성
		if (!body.itemID || body.itemID == 0) {
				// itemID가 0이거나 제공되지 않은 경우, 새로운 ID를 생성
				value.itemID = await mongodb.max(mongoCFG.Medalbank.items, "itemID", {});
		} else {
				// 제공된 itemID 사용
				value.itemID = Number(body.itemID);
		}

		// --------------------------------------------------------------
		// 대표 이미지 처리
		// --------------------------------------------------------------
		if (body.sourcePath) {
				// 이미지 저장 및 경로 설정
				const result = await imageLibrary.saveFile(
																						body.sourcePath, 
																						"images", 
																						"items", 
																						value.itemID, 
																						'f'	// 'f'eatured, 't'humbnail, '0'~'9'
																					);
				// 대표 이미지 경로를 value에 추가
				value.featured = `/cms/images/items/${value.itemID}/f`;
		}

		// --------------------------------------------------------------
		// 입력받은 필드 업데이트
		// --------------------------------------------------------------
		if (body.title		) value.title 		= body.title.trim(); // 이름 설정
		value.updated = new Date(); // 마지막 업데이트 시간 설정

		// 데이터베이스에서 업데이트할 쿼리 정의
		const query = { itemID: value.itemID };

		// --------------------------------------------------------------
		// 데이터베이스 업데이트
		// --------------------------------------------------------------
		await mongodb.updateOne(mongoCFG.Medalbank.items, query, value);

		await historyLibrary.saveHistory(
													"items", 
													"saveWithImage", 
													"itemID", 
													value,
												); // db, cmd, id, body
		// --------------------------------------------------------------
		// 결과 반환
		// --------------------------------------------------------------
		return { message: "", data: { itemID: value.itemID } };
	}

	// detail
	static async detail(body) {
		console.log("model.items.detail.body=", body);
		//----------------------------------------------------------------
		const query = { itemID: Number(body.itemID) };
		const returnObj = await mongodb.findOne(mongoCFG.Medalbank.items, query, { _id:0,});
		returnObj.data = Customizing.field(returnObj.data);
		console.log("items.detail.returnObj=", returnObj.data);
		//----------------------------------------------------------------
		// await StaticLibrary.updateViewReactions("items", body.timeID, returnObj.data.name, body.userID??0); // db, id, name, userID

		return returnObj;
	}
	// view
	static async viewRealtime(body) {
		console.log("1>items.viewRealtime.itemID=", body.itemID);
		const itemID = Number(body.itemID);
		//----------------------------------------------------------------
		let query = { itemID: itemID };
		const aggregate = [
			{ $match: query },
			// 대회이력
			{ $lookup: {
					from		: mongoCFG.Medalbank.competitions,
					let			: { "itemID": "$itemID" },
					pipeline: [
						{ $match: {
							$expr: { $and: [															
										{ $eq: ["$itemID", "$$itemID"] }
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
			// 		from: mongoCFG.Medalbank.timesMSKR,
			// 		let: { "itemID": "$itemID" },
			// 		pipeline: [
			// 			{ $match: {
			// 				$expr: { $and: [
			// 							// { $eq: [ "$datetime", ISODate('2025-01-01T00:00:00.000Z') ] },
			// 							{ $eq: [ "$type", "time" ] }, // 훈련기록
			// 							{ $eq: ["$itemID", "$$itemID"] }
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
		let result = await mongodb.aggregate(mongoCFG.Medalbank.items, aggregate);
		if (result.data.length == 0) return { message: "no data", data: {} };
		const { competitions: _competitions, ..._item} = result.data[0];
		// _competitions: 대회이력
		_item.extraInfo = {};
		_item.extraInfo.competitions = _competitions.reduce((arr, data) => {
																									data.dateStart = data.dateStart ? new Date(data.dateStart).toISOString().slice(0, 10) : "";
																									arr.push(data);
																									return arr;
																								}, []); // memoryDB.getCompetitions({ itemID: itemID });
		//------------------------------------------
		// find eventTime
		//------------------------------------------
		query = {
			itemID		: itemID,
			timeStamp	: { $gt: 0 },
			isMasters	: true,
			isAdult		: true,
			$or				: [ { status: "" }, { status: { $exists: false } } ],
			fin 			: { $exists: false },
		};
		const context = {
			query			: query,
			projection: { _id:0, timeID:1, type:1, athleteID:1, name:1, gender:1, style:1, course:1, distance:1, time:1, timeStamp:1, item:1, itemID:1, competitionID:1, competitionName:1, itemID:1, item:1, ageGroup:1, thumbnail:1, datetime:1, },
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

		// itemTimes: 함께수영한 친구들
		let timeTimes  = result.data.filter(tm => tm.type == 'time')
																.reduce((arr, data) => {
																	data.datetime = new Date(data.datetime).toISOString().slice(0, 10);
																	arr.push(data);
																	return arr;
																}, []);
		// _item.statistics.itemTimes = itemTimes.reduce((arr, data) => {
		// 																				data.datetime = new Date(data.datetime).toISOString().slice(0, 10);
		// 																				arr.push(data);
		// 																				return arr;
		// 																			}, []);

		// const stat = await ItemLibrary.buildItemsStatistics(Number(itemID), bestEvent);

		const timeLibrary = new TimeLibrary();
		// item.statistics.latest = timeLibrary.findLatestTime(bestEvent);
		
		_item.extraInfo.latest = getMostRecentTimes(timeTimes);
		_item.extraInfo.timeTimes = timeTimes;
		console.log("timeTimes=", timeTimes.length);
		// best event
		_item.extraInfo.bestEvent = timeLibrary.findBestTime(eventTimes
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
		_item.extraInfo.bestTime = timeLibrary.findBestTime(timeTimes
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

		const { times:bestEventsComp, compression:bestEventcomp } = timeLibrary.getCompetitionsTeamsItems(_item.extraInfo.bestEvent);
		const { times:bestTimesComp, compression:bestTimeComp } 	= timeLibrary.getCompetitionsTeamsItems(_item.extraInfo.bestTime);
		const { times:timeTimesComp, compression:timesComp } 			= timeLibrary.getCompetitionsTeamsItems(_item.extraInfo.timeTimes);
		
		_item.extraInfo.bestEvent 	= bestEventsComp;
		_item.extraInfo.bestTime 	= bestTimesComp;
		_item.extraInfo.timeTimes = timeTimesComp.sort((a,b) => b.datetime - a.datetime);
		// console.log("stemTimes=", stemTimes.length, stemTimes[0]);
		
		// competition, item, item name 분리하고 통합합
		_item.compression = {
			items: [...new Map([
														...bestEventcomp.items,
														...bestTimeComp.items,
														...timesComp.items,
													].map(item => [item.itemID, item])
												).values()
							],
			items: [...new Map([
														...bestEventcomp.items,
														...bestTimeComp.items,
														...timesComp.items,
													].map(item => [item.itemID, item])
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





		// await StaticLibrary.updateViewReactions("items", _item.timeID, _item.name, body.userID??0); // db, id, name, userID

		// console.log("item=", _item.statistics);
		return { message: '', data: _item };
	}

	// find items
	static async names(body) {
		console.log("items.names:", body, new Date());
		// query.competitionCount = { $gt: 0}
		const name = new RegExp(body.name.trim(), "gi");
		const query = { $or: [{ indexes: name }, { name: name }] };
		const context = {
			query			: query,
			projection: { _id:0, itemID:1, name:1, sido:1, course:1, },
			limit			: body.limit ? Number(body.limit) : MAX_LIMIT,
			skip			: body.skip ? Number(body.skip) : 0,
			sort			: { name:1 },
		}
		//----------------------------------------------------------------
		const result = await mongodb.find(mongoCFG.Medalbank.items, context)
		//----------------------------------------------------------------
		console.log("items.names=====>", result.data.length, result.data.length>0?result.data[0]:[]);
		return result;
	}

  //####################################################################
  //######### Confirm ##################################################
  //####################################################################



	// view
	static async view(itemID) {
		console.log("1>items.view.itemID=", itemID);
		//----------------------------------------------------------------
		const query = { itemID: Number(itemID) };
		const aggregate = [
			{ $match: query },
			{ $lookup: {
					from				: mongoCFG.Medalbank.itemsStatistics,
					localField	: "itemID",
					foreignField: "itemID",
					as					: "statistics"
				}
			},
			{ $lookup: {
					from: mongoCFG.Medalbank.times,
					let: { "itemID": "$itemID" },
					pipeline: [
						{ $match: {
							$expr: { $and: [
										{ $eq: ["$type", "time"] },
										{ $eq: ["$itemID", "$$itemID"] }
									]
								}
							}
						},
						{ $project: { _id:0, itemID:1, style:1, datetime:1 } }
					],
					as: "times"
				}
			},
			{ $project: { _id:0, } }
		];
console.log("query:", query);
		//-----> select comment
		const result = await mongodb.aggregate(mongoCFG.Medalbank.items, aggregate);
		if (result.data.length == 0) return { message: "no data", data: {} };
		const item = result.data[0];

	/*
	statistics: [
    {
      _id: new ObjectId('674c8591f9940a21bd4dffba'),
      itemID: 433,
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
    { style: 'butterfly', itemID: 433 },
    { style: 'freestyle', itemID: 433 },
	]
	*/
// console.log(item.statistics);
		const competitions = item.statistics[0].competitions.filter(el => el.competitionID != undefined)
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
		// itemStatistics가 없으면 만들어 줌
		const utilTimes = new TimeLibrary();
		const timeByDate = utilTimes.filterByDate(item.times, "2024-09-01");
		const bestEventTimes = [];
		const bestTimeTimes = [];

		// item.statistics[0].bestTimes.forEach(el => {
		// 	console.log(`${el.gender}-${el.style}-${el.distance}: cid:${el.competitionID}`);
		// })
		for (const time of item.statistics[0].bestTimes) {
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
		item.statistics = {
      athleteCount	: item.statistics[0].athleteCount,
      latest				: item.statistics[0].latest,
			swimmersEvent	: item.statistics[0].swimmersEvent,
			bestTimes			: bestEventTimes,
			bestTimeTimes	: bestTimeTimes,
			competitions	: competitions,
			timeByDate		: timeByDate,
		}
		console.log("item.bestTimes=", item.statistics.bestTimes.length);
		console.log("item.bestTimeTimes=", item.statistics.bestTimeTimes.length);
		delete item.times;
		// console.log("item=", item.statistics.bestTimes[0]);
		
		return { message: '', data: item};
	}

	// find items
	static async list(query, body) {
		const limit = body.limit ? Number(body.limit) : MAX_LIMIT;
		let skip = (Number(body.page??1)-1)	* limit;
		skip = skip < 0 ? 0 : skip;
		// query.competitionCount = { $gt: 0}
		const context = {
			query			: query,
			projection: { _id:0, },
			limit			: limit,
			skip			: skip,
			sort			: { name:1, gender:1, item:1, ageGroup:1, style:1, distance:1, items:1 },
		}
		//----------------------------------------------------------------
		const result = await mongodb.find(mongoCFG.Medalbank.items, context)
		//----------------------------------------------------------------
		result.data = result.data.map(data => Customizing.field(data));
		const items = [];
		const noTimes = [];
		result.data.map(data => {
			if (data.competitionCount > 0) items.push(data); else noTimes.push(data);
		});
		result.data = [...items, ...noTimes];
		return result;
	}
	static getByData = (async (body) => {
		const data = new RegExp(body.data.trim(), "gi");
		const query = { $or: [
			{ name: data },   
			{ itemname: data },   
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
		value.itemID = await mongodb.max(mongoCFG.Medalbank.items, "itemID", {});
	console.log("items.insert.value=", value);
		//----------------------------------------------------------------
		return await mongodb.insertOne(mongoCFG.Medalbank.items, value);
		//----------------------------------------------------------------
	}

	// update
	static async update(body) {
		if (Object.keys(body).length < 2) return utilError.errorMSG("Model","items", "update", "field not found");
		const value = Customizing.field(body);
		const query = { itemID: value.itemID };

		delete value.itemID;
	
		//----------------------------------------------------------------
		return await mongodb.updateOne(mongoCFG.Medalbank.items, query, value);
		//----------------------------------------------------------------
	}

	// delete
	static async delete(itemID) {
		try {
			const query = { itemID: Number(itemID) };
			//----------------------------------------------------------------
			return await mongodb.deleteOne(mongoCFG.Medalbank.items, query);
			//----------------------------------------------------------------
		} catch (e) {
			return utilError.errorMSG("Model","items", "delete", "catch." + err);
		}
	}

}

module.exports = ItemModel;

