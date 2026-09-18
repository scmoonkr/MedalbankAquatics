const _    				= require('lodash');
const extend 			= require('node.extend');
const mongoCFG 		= require('../../Config/mongoCFG.js');
const mongoDB			= require('../../Class/MongoDB.js');
const UtilDate		= require("../../Class/DateLibrary.js");
const utilLibrary = require("../../Util/utilLibrary.js");
const utilError		= require("../../Util/utilError.js");
// const utilDatabase= require('../utilDatabase');
const imageLibrary= require("../library/images.library.js");
const TimeLibrary = require('../../Class/TimeLibrary.js');


const Customizing = require("./ootd.custom.js");

const mongodb 		= new mongoDB(mongoCFG.Medalbank.database);
const utilDate		= new UtilDate();

const PK = "ootdID";
const MAX_LIMIT = 100;

const _context = {
	query		 	: {},
	projection: { _id:0, },
	limit		 	: MAX_LIMIT,
	skip			: 0,
	sort			: { _id:-1 },
}

class OOTDModel {
	static async create() {
		const indexes = [
			{ query: { ootdID:1 }, name: "ootdID", option: { unique: true }	},
			{ query: { "ootd.category":1 }, name: "category"	},
		];
		await mongodb.createCollectionNindex(mongoCFG.Medalbank.ootd, indexes);
	}

	/**
	 * static saveOOTDWithImage 함수
	 * 
	 * 이 함수는 풀(item) 데이터를 데이터베이스에 저장하거나 업데이트합니다.
	 * 또한, 관련된 대표 이미지를 처리하여 저장 경로를 설정합니다.
	 *
	 * @param {Object} body - 풀 데이터를 포함하는 객체
	 * @param {number|string} [body.ootdID] - 풀의 고유 ID. 0이거나 제공되지 않은 경우 새로운 ID가 생성됩니다.
	 * @param {string} [body.sourcePath] - 저장할 이미지 파일의 경로
	 * @param {string} [body.name] - 풀 이름
	 * @param {string} [body.sido] - 행정 구역 정보
	 * @param {string} [body.course] - 코스 정보
	 * @param {number|string} [body.athleteID] - 데이터를 업데이트한 사람의 ID
	 * @param {string} [body.memo] - 추가적인 메모 정보
	 * @returns {Promise<Object>} 저장된 풀의 ID와 메시지를 포함하는 객체
	 */
	static async saveOOTDWithImage(body) {
		// 저장할 데이터를 담을 객체 초기화
		const value = {}; // extend(true, body, {});

		// ootdID 확인 및 생성
		if (!body.ootdID || body.ootdID == 0) {
				// ootdID가 0이거나 제공되지 않은 경우, 새로운 ID를 생성
				value.ootdID = await mongodb.max(mongoCFG.Medalbank.ootd, "ootdID", {});
		} else {
				// 제공된 ootdID 사용
				value.ootdID = Number(body.ootdID);
		}

		// --------------------------------------------------------------
		// 대표 이미지 처리
		// --------------------------------------------------------------
		if (body.sourcePath) {
				// 이미지 저장 및 경로 설정
				const result = await imageLibrary.saveFile(
																						body.sourcePath, 
																						"images", 
																						"ootd", 
																						value.ootdID, 
																						'f'	// 'f'eatured, 't'humbnail, '0'~'9'
																					);
				// 대표 이미지 경로를 value에 추가
				value.featured = `/cms/images/ootd/${value.ootdID}/f`;
		}

		// --------------------------------------------------------------
		// 입력받은 필드 업데이트
		// --------------------------------------------------------------
		if (body.title		) value.title 		= body.title.trim(); // 이름 설정
		value.updated = new Date(); // 마지막 업데이트 시간 설정

		// 데이터베이스에서 업데이트할 쿼리 정의
		const query = { ootdID: value.ootdID };

		// --------------------------------------------------------------
		// 데이터베이스 업데이트
		// --------------------------------------------------------------
		await mongodb.updateOne(mongoCFG.Medalbank.ootd, query, value);

		await historyLibrary.saveHistory(
													"ootd", 
													"saveWithImage", 
													"ootdID", 
													value,
												); // db, cmd, id, body
		// --------------------------------------------------------------
		// 결과 반환
		// --------------------------------------------------------------
		return { message: "", data: { ootdID: value.ootdID } };
	}

	// detail
	static async detail(body) {
		console.log("model.ootd.detail.body=", body);
		//----------------------------------------------------------------
		const query = { ootdID: Number(body.ootdID) };
		const returnObj = await mongodb.findOne(mongoCFG.Medalbank.ootd, query, { _id:0,});
		returnObj.data = Customizing.field(returnObj.data);
		console.log("ootd.detail.returnObj=", returnObj.data);
		//----------------------------------------------------------------
		// await StaticLibrary.updateViewReactions("ootd", body.timeID, returnObj.data.name, body.userID??0); // db, id, name, userID

		return returnObj;
	}

  //####################################################################
  //######### Confirm ##################################################
  //####################################################################


	// find ootd
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
			// sort			: { _id:1 },
		}
		//----------------------------------------------------------------
		const result = await mongodb.find(mongoCFG.Medalbank.ootd, context)
		//----------------------------------------------------------------
		result.data = result.data.map(data => Customizing.field(data));
		const ootd = [];
		const noTimes = [];
		result.data.map(data => {
			if (data.competitionCount > 0) ootd.push(data); else noTimes.push(data);
		});
		result.data = [...ootd, ...noTimes];
		return result;
	}
	
	// insert
	static async insert(body) {
		const value = Customizing.field(body);
		value.ootdID = await mongodb.max(mongoCFG.Medalbank.ootd, "ootdID", {});
	console.log("ootd.insert.value=", value);
		//----------------------------------------------------------------
		return await mongodb.insertOne(mongoCFG.Medalbank.ootd, value);
		//----------------------------------------------------------------
	}

	// update
	static async update(body) {
		if (Object.keys(body).length < 2) return utilError.errorMSG("Model","ootd", "update", "field not found");
		const value = Customizing.field(body);
		const query = { ootdID: value.ootdID };

		delete value.ootdID;
	
		//----------------------------------------------------------------
		return await mongodb.updateOne(mongoCFG.Medalbank.ootd, query, value);
		//----------------------------------------------------------------
	}

	// delete
	static async delete(ootdID) {
		try {
			const query = { ootdID: Number(ootdID) };
			//----------------------------------------------------------------
			return await mongodb.deleteOne(mongoCFG.Medalbank.ootd, query);
			//----------------------------------------------------------------
		} catch (e) {
			return utilError.errorMSG("Model","ootd", "delete", "catch." + err);
		}
	}

}

module.exports = OOTDModel;

