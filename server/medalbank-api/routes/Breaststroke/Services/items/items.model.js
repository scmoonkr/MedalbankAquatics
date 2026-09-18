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
const utilImgBB = require('../../Class/utilImgBB.js');


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
		console.log("Model.items.saveItemWithImage.body=", body);
		// 저장할 데이터를 담을 객체 초기화
		const value = Customizing.field(body);
		console.log("Model.items.saveItemWithImage.value=", value);

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
				value.thumb = `/cms/images/items/${value.itemID}/t`;
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

		// await historyLibrary.saveHistory(
		// 											"items", 
		// 											"saveWithImage", 
		// 											"itemID", 
		// 											value,
		// 										); // db, cmd, id, body
		// --------------------------------------------------------------
		// 결과 반환
		// --------------------------------------------------------------
		return { message: "", data: { itemID: value.itemID } };
	}

	// view
	static async detail(body) {
		console.log("model.items.detail.body=", body);
		//----------------------------------------------------------------
		const query = { itemID: Number(body.itemID) };
		const aggregate = [
			{ $match: query },
			{ $lookup: {
					from: mongoCFG.Medalbank.images,
					let: { itemID: "$itemID" },
					pipeline: [
						{ $match: { 
								$expr: { 
									$and: [
										{ $eq: ["$db", "items"] },
										{ $eq: ["$id", "$$itemID"] }
									] 
								} 
							} 
						}
					],
					as: "images"
				} 
			}
		];
		const returnObj = await mongodb.aggregate(mongoCFG.Medalbank.items, aggregate);
		if (returnObj.data.length == 0) return { message: "no data", data: {} }

		returnObj.data = Customizing.field(returnObj.data[0]);
		const images = [];
		for (const image of returnObj.data.images) {
			const url = utilImgBB.makeMetaImgBBURL(image);
			images.push(url.medium);
		}
		returnObj.data.images = images;
		console.log("items.detail.returnObj=", returnObj.data);
		//----------------------------------------------------------------
		// await StaticLibrary.updateViewReactions("items", body.timeID, returnObj.data.name, body.userID??0); // db, id, name, userID

		return returnObj;
	}

	// portfolio
	static async portfolio(body) {
		console.log("model.items.portfolio.body=", body);
		const query = {};
		if (body.portfolio) query.slug = body.portfolio.trim();
		//----------------------------------------------------------------
		const aggregate = [
			{ $match: query },

			// 1) portfolio → items join
			{
				$lookup: {
					from: mongoCFG.Medalbank.items,
					localField: "itemID",
					foreignField: "itemID",
					as: "items"
				}
			},

			// 2) items를 개별적으로 펼치기
			{ $unwind: "$items" },

			// 3) 각 item에 대해 images join
			{
				$lookup: {
					from: mongoCFG.Medalbank.images,
					let: { itemID: "$items.itemID" },
					pipeline: [
						{
							$match: {
								$expr: {
									$and: [
										{ $eq: ["$db", "items"] },
										{ $eq: ["$id", "$$itemID"] }
									]
								}
							}
						},
						// { $project: { _id:0, fullname:1, dateStart:1, competitionID:1, athleteCount:1 } }
					],
					as: "items.images"
				}
			},

			// 4) 다시 collections로 묶어주기
			{
				$group: {
					_id: "$_id",
					title: { $first: "$title" },
					subtitle: { $first: "$subtitle" },
					slug: { $first: "$slug" },
					items: { $push: "$items" }
				}
			},

			{ $project: { _id: 0, slug: 1, title:1, subtitle:1,items: 1 } }
		];
		const returnObj = await mongodb.aggregate(mongoCFG.Medalbank.collections, aggregate);
		if (returnObj.data.length == 0) return { message: "no data", data: {} }
		console.log("----->", returnObj.data);

		returnObj.data = returnObj.data[0].items.reduce((arr,item) => {
			item = Customizing.field(item)
			item.images = item.images.map(image => utilImgBB.makeMetaImgBBURL(image).thumb);
			arr.push(item);
			return arr;
		},[]);
		console.log("----->", returnObj.data);
		// console.log("----->", portfolio);
		return returnObj;
	}

	// collections
	static async collections(body) {
		//----------------------------------------------------------------
		const query = {};
		if (body.collection) query.slug = body.collection.trim()
		console.log("model.items.collections.body=", body, query);
		const aggregate = [
			{ $match: query },

			// 1) collections → items join
			{
				$lookup: {
					from: mongoCFG.Medalbank.items,
					localField: "itemID",
					foreignField: "itemID",
					as: "items"
				}
			},

			// 2) items를 개별적으로 펼치기
			{ $unwind: "$items" },

			// 3) 각 item에 대해 images join
			// {
			// 	$lookup: {
			// 		from: mongoCFG.Medalbank.images,
			// 		let: { itemID: "$items.itemID" },
			// 		pipeline: [
			// 			{
			// 				$match: {
			// 					$expr: {
			// 						$and: [
			// 							{ $eq: ["$db", "items"] },
			// 							{ $eq: ["$id", "$$itemID"] }
			// 						]
			// 					}
			// 				}
			// 			},
			// 			// { $project: { _id:0, fullname:1, dateStart:1, competitionID:1, athleteCount:1 } }
			// 		],
			// 		as: "items.images"
			// 	}
			// },

			// 4) 다시 collections 묶어주기
			{
				$group: {
					_id: "$_id",
					title: { $first: "$title" },
					itemID: { $first: "$itemID" },
					subtitle: { $first: "$subtitle" },
					cid: { $first: "$cid" },
					priority: { $first: "$priority" },
					description: { $first: "$description" },
					slug: { $first: "$slug" },
					items: { $push: "$items" }
				}
			},
			{ $sort: { priority:1 } },

			{ $project: { _id: 0, slug: 1, itemID:1, title:1, subtitle:1, priority:1, cid:1, description:1, items: 1 } }
		];
		const returnObj = await mongodb.aggregate(mongoCFG.Medalbank.collections, aggregate);
		if (returnObj.data.length == 0) return { message: "no data", data: {} }

		// console.log("collections.list.returnObj=", returnObj.data);
		const portfolio = {};
		for (const data of returnObj.data) {
			const items = [];
			for (const itemID of data.itemID) {
				let item = data.items.find(el => el.itemID == itemID);
				if (item) {
					// item = Customizing.field(item)
					// item.images = item.images.map(image => utilImgBB.makeMetaImgBBURL(image).thumb);
					items.push(item);
				}
			}
			data.items = items;
			// data.items = data.items.reduce((arr,item) => {
			// 	item = Customizing.field(item)
			// 	// item.images = item.images.map(image => utilImgBB.makeMetaImgBBURL(image).thumb);
			// 	arr.push(item);
			// 	return arr;
			// },[]);
		}
		// returnObj.data = portfolio;
		// console.log("----->", returnObj.data);
		return returnObj;
	}

  //####################################################################
  //######### Confirm ##################################################
  //####################################################################


	// find items
	static async list(query, body) {
		const limit = body.limit ? Number(body.limit) : MAX_LIMIT;
		let skip = (Number(body.page??1)-1)	* limit;
		skip = skip < 0 ? 0 : skip;
		// query.competitionCount = { $gt: 0}
		const context = {
			query			: query,
			projection: { _id:0, itemID:1, title:1, subtitle:1, type:1, category:1, brand:1, url:1, thumb:1},
			limit			: limit,
			skip			: skip,
			sort			: { name:1, gender:1, item:1, ageGroup:1, style:1, distance:1, items:1 },
		}
		//----------------------------------------------------------------
		const result = await mongodb.find(mongoCFG.Medalbank.items, context)
		//----------------------------------------------------------------
		result.data = result.data.map(data => Customizing.field(data));
		return result;
	}
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

