const fs 			= require('fs');
const extend 			= require('node.extend');
const utilLibrary = require("../../Class/utilLibrary.js");
const utilError		= require("../../Class/utilError.js");
const imageLibrary= require("../library/images.library.js");
// const utilDatabase= require('../utilDatabase');
const historyLibrary = require("../library/history.library.js");

// const Customizing = require("./analysis.custom.js");

const mskCFG 			= require('../../Config/mskCFG.js');
const mongoCFG 		= require('../../Config/mongoCFG.js');
const mongoDB			= require('../../Class/MongoDB.js');
const StaticLibrary	= require("../library/statistics.library.js");
const mongodb	= new mongoDB(mongoCFG.Breaststroke.database);

const MemoryDB		= require("../../Class/MemoryDB.js");
const memoryDB		= new MemoryDB();


const UtilDate		= require("../../Class/DateLibrary.js");
const utilDate		= new UtilDate();

const TimeLibrary = require('../../Class/TimeLibrary.js');
const TimeModel		= require("../times/times.model.js");

const analysisAnalysisIDstart = 500000;


const analysisLimit =5000;

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

/*
 *	LIST
 *  count=0: 동명이인 관계없이 모두
 *  count=1: 동명이인 있는 경우
 */
 async function searchAnalysiss(query, count=1) {
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
    const result = await mongodb.find(mongoCFG.Breaststroke.analysis, context);

    // Count the total number of results
    returnObj.count = result.count;

    // Group and customize the data
    const analysisOBJ = {};

    for (const data of result.data) {
      const value = data; // Customizing.customizing(data);

      // Store the customized data in an object, grouped by name
      if (!analysisOBJ[value.name]) analysisOBJ[value.name] = [];
      if (value.name && value.team && value.name != value.team) {
        analysisOBJ[value.name].push(value);
      }
    }

    // Flatten the customized data and store it in the return object
    returnObj.data = Object.values(analysisOBJ).flatMap((items) =>
      items.length > count ? items : []
    );

    return returnObj;
  } catch (error) {
    // Handle errors gracefully
    console.error("Error in searchAnalysiss:", error);
    return { message: "An error occurred", data: [] };
  }
}

class AnalysisModel {

	// detail
	static async detail(body) {
		console.log("models.analysis.detail=", body);
		let returnObj = { message: '', data: {} };
		
		try{
			// -----> get query
			// const aggregate = Query.detail(body);
			const query = { analysisID: Number(body.analysisID) };
			const projection = { _id:0, status:0, crawling: 0, };
			// console.log("~~~~~~~~~~~~", JSON.stringify(aggregate, null, "  "));
			//----------------------------------------------------------
			const result = await mongodb.findOne(mongoCFG.Breaststroke.analysis, query, projection );

			//----------------------------------------------------------
			if (!result.data.analysisID) {
				result.message = "analysis.detail.analysisID no data";
				console.log(result.message)
				return result;
			}
			
			const context = {
				query			: query,
				projection: { _id:0, nameORG:0, disciplineORG:0, crawled:0, dateEnd:0, style:0,  },
				limit			: analysisLimit,
			}
			const resultTimes = await mongodb.find(mongoCFG.Breaststroke.times, context );
			result.data.times = resultTimes.data;

			// await StaticLibrary.updateViewReactions("analysis", result.data.analysisID, result.data.name, body.userID??0); // db, id, name, userID
			return result;
	
			// -----> customizing
			returnObj.data = result.data[0]; // Customizing.customizing(result.data[0]);
			console.log(returnObj.data);
	
			// await historyDAO.insert(trOBJ, {type:"analysis", name: returnObj.data.name, analysisID: returnObj.data.analysisID });
			//------------------------------------------------------------------
			// returnObj.data = await Common.database("analysis", Number(body.analysisID), returnObj.data);
			//------------------------------------------------------------------
			return returnObj;
		} catch (e) {
			console.log("analysis.detail.catch: ", e);
		}
		return returnObj;
	}



	  
	// view
	/**
	 * 
	 * @param {*} body 
	 * @returns 
	 */
	static async view(body) {
		// 선수 ID를 숫자로 변환합니다.
		const analysisID = Number(body.analysisID);
		// let result = await mongodb.findOne(mongoCFG.Breaststroke.users, { analysisID: analysisID }, { _id:0, analysisID:1, } );
		// 선수 정보가 없는 경우 에러 메시지를 반환합니다.
		// if (!result.data.analysisID) return utilError.errorMSG("Model","analysis", "view", "no data");
		
		// MongoDB에서 선수 정보를 조회합니다.
		const aggregate = [
			{ $match: { analysisID: analysisID } },
			{
				$lookup: {
					from: mongoCFG.Breaststroke.analysisStatistics,
					localField: "analysisID",
					foreignField: "analysisID",
					as: "statistics",
				},
			},
			{
				$project: {
					_id: 1,
					analysisID: 1,
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

		const result = await mongodb.aggregate(mongoCFG.Breaststroke.analysis, aggregate);
		if (result.data.length == 0) return { message: '', data: { analysisID: analysisID } };
		let analysis = extend(true, {}, result.data[0]);

		if (analysis.statistics.length == 0) {
			analysis.statistics = {};
		} else {
			analysis.statistics = analysis.statistics[0];
		}
		delete analysis.statistics._id;
		// analysis.compression = timeLibrary.getCompetitionsTeamsPools(analysis.times);
		const { times, compression } = timeLibrary.getCompetitionsTeamsPools(analysis.times);
		analysis.compression = compression;
		analysis.times = times;

		await StaticLibrary.updateViewReactions("analysis", analysis.analysisID, analysis.name, body.userID); // db, id, name, userID
		console.log("--------------->", analysis);
		return { message: '', data: analysis };
	}

	static async list(body) {
		console.log("~~~~~~~~~~~~~~~~~~analysis.model.list=", body);
		const limit = body.limit ? Number(body.limit) : analysisLimit;
		let skip = (Number(body.page??1)-1)	* limit;
		skip = skip < 0 ? 0 : skip;
console.log("limit=", limit, "skip=", skip);
		const query = { analysisID: { $lt: 100000 }, delete: { $exists: false } };
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
				analysisID: 1,
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
		const result = await mongodb.find(mongoCFG.Breaststroke.analysis, context);
		//----------------------------------------------------------------


    return result;
	}

	// update
	static async update(body) {
		console.log("analysis.model.update.body=", body);
		let returnObj = { message: "", };
		let query = {};
		if (body.analysisID) {
			body.analysisID = Number(body.analysisID)
			query = { analysisID: body.analysisID }
			//------------------.-------------------------------------------
			// update times.analysisID
			//--------------------------------------------------------------
			if (body.timeIDs) {
				await TimeModel.updateTimes(body.analysisID, body.timeIDs);
				delete body.timeIDs;
			}
		} else if (body.userID) {
			query = { userID: Number(body.userID) }
		} else if (body.registrationNo) {
			query = { registrationNo: body.registrationNo }
		} else {
			returnObj.message = "analysis.update.analysisID, userID, registrationNo not found!!";
			console.log(returnObj.message);
			return returnObj;
		}
	
		//------------------.-------------------------------------------
		// update analysis
		//-------------------------------------------------------------
		if (body.password) {
	
		}
	
		if (body.name) body.nameHide = utilLibrary.nameHide(body.name);
		console.log("analysis.model.update.body=", body);
		returnObj = await mongodb.updateOne(mongoCFG.Breaststroke.analysis, query, body);
	
		return returnObj;
	}
	// delete
	static async delete(analysisID) {
		console.log("DATABASE.analysis.delete.body=", body);
		//-----> validation
		let returnObj = { message: "", };
	
		if (! body.analysisID && ! body.analysisIDs) {
			returnObj.message = `${mongoCFG.Breaststroke.analysis}.delete.analysisID not found`;
			return returnObj;
		}
	
		const analysisIDs = [];
		if (body.analysisIDs) {
			body.analysisIDs.split(',').forEach(ath => {
				analysisIDs.push(Number(ath.trim()));
			})
		} else {
			body.analysisID.toString().split(',').forEach((aid) => {
				analysisIDs.push(Number(aid));
			})
		}
	
		const query = { analysisID: { $in: analysisIDs } };  
		// returnObj = await mongodb.deleteMany(mongoCFG.Breaststroke.analysis, query);
		returnObj = await mongodb.updateMany(mongoCFG.Breaststroke.analysis, query, { status: "deleted" });
	
		//--------------------------
		//-----> $unset analysisID in times 
		//--------------------------
		const value = { $unset: { analysisID: 0 } };
		const result = await mongodb.updateManyOP(mongoCFG.Breaststroke.times, query, value);
	}
	
	/**
	 * static saveAnalysisWithImage 함수
	 * 
	 * 이 함수는 선수 데이터를 데이터베이스에 저장하거나 업데이트합니다.
	 * 관련된 대표 이미지를 처리하며, 필요 시 시간 데이터를 업데이트합니다.
	 *
	 * @param {Object} body - 선수 데이터를 포함하는 객체
	 * @param {number|string} [body.analysisID] - 선수의 고유 ID. 0이거나 제공되지 않은 경우 새로운 ID가 생성됩니다.
	 * @param {string} [body.sourcePath] - 저장할 이미지 파일의 경로
	 * @param {string} [body.name] - 선수 이름
	 * @param {string} [body.nickname] - 선수의 닉네임
	 * @param {string} [body.styles] - 선수의 스타일(콤마로 구분된 문자열)
	 * @param {string} [body.instagram] - 선수의 인스타그램 계정
	 * @param {string} [body.memo] - 추가적인 메모 정보
	 * @param {Array<number>} [body.timeIDs] - 업데이트할 시간 ID 배열
	 * @returns {Promise<Object>} 저장된 선수 ID와 메시지를 포함하는 객체
	 */
	static async saveAnalysisWithImage(body) {
		console.log("22analysis.model.saveAnalysisWithImage.body=", body);

		// body 데이터를 깊은 복사하여 처리 객체로 변환
		const value = {}; // extend(true, body, {});

		// analysisID 확인 및 생성
		if (!body.analysisID || body.analysisID == 0) {
			// analysisID가 0이거나 제공되지 않은 경우, 새로운 ID를 생성
			value.analysisID = await mongodb.max(mongoCFG.Breaststroke.analysis, "analysisID", { analysisID : { $lt: analysisAnalysisIDstart } });
			value.joined = new Date(); // 최초 가입 시간 설정
			// --------------------------------------------------------------
			// 시간 데이터 업데이트
			// --------------------------------------------------------------
			const result = await TimeModel.updateTimes(value.analysisID); // 시간 데이터 업데이트 함수 호출
		} else {
			// 제공된 analysisID를 사용
			value.analysisID = Number(body.analysisID);
		}

		// --------------------------------------------------------------
		// 대표 이미지 처리
		// --------------------------------------------------------------
		if (body.sourcePath) {
			// 이미지 저장 및 경로 설정
			const result = await imageLibrary.saveFile(
																					body.sourcePath, 
																					"images", 
																					"analysis", 
																					value.analysisID, 
																					'f'	// 'f'eatured, 't'humbnail, '0'~'9'
																				);
			// 대표 이미지 경로를 value에 추가
			value.featured = `/cms/images/analysis/${value.analysisID}/f`;
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

		console.log("analysis.model.saveAnalysisWithImage.value=", value);

		// --------------------------------------------------------------
		// 선수 데이터 업데이트
		// --------------------------------------------------------------
		const query = { analysisID: value.analysisID };
		await mongodb.updateOne(mongoCFG.Breaststroke.analysis, query, value);

		await historyLibrary.saveHistory(
													"analysis", 
													"saveWithImage", 
													"analysisID", 
													value,
												); // db, cmd, id, body
		// --------------------------------------------------------------
		// 결과 반환
		// --------------------------------------------------------------
		return { message: "", data: { analysisID: value.analysisID } };
	}
	
  
//####################################################################
//####################################################################
//####################################################################
}

module.exports = AnalysisModel;

