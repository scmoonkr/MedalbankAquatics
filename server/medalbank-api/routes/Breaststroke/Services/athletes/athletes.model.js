const fs 			= require('fs');
const extend 			= require('node.extend');
const utilLibrary = require("../../Class/utilLibrary.js");
const utilError		= require("../../Class/utilError.js");
const imageLibrary= require("../library/images.library.js");
// const utilDatabase= require('../utilDatabase');
const historyLibrary = require("../library/history.library.js");

const Customizing = require("./athletes.custom.js");

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

const athleteAthleteIDstart = 500000;


const athleteLimit =5000;

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
    const result = await mongodb.find(mongoCFG.Breaststroke.athletes, context);

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


	static async list(body) {
		console.log("~~~~~~~~~~~~~~~~~~ BR.athletes.model.list=", body);
		const limit = body.limit ? Number(body.limit) : athleteLimit;
		let skip = (Number(body.page??1)-1)	* limit;
		skip = skip < 0 ? 0 : skip;
console.log("limit=", limit, "skip=", skip);
		const query = { athleteID: { $gt: 0, $lt: 100000 }, delete: { $exists: false } };
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
		if (body.sort) {
			sort[body.sort] = 1;
		} else sort.athleteID = 1;

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
				featured: 1,
				featuredBB: 1,
				// extraInfo:1,
			},
			limit: limit,
			skip: skip,
			sort: sort,
		};
		// console.log("limit=", (skip+limit), "skip=", skip);
		// console.log(JSON.stringify(aggregate, null, '  '));
		//----------------------------------------------------------------
		const result = await mongodb.find(mongoCFG.Breaststroke.athletes, context);
		//----------------------------------------------------------------
		result.data = result.data.reduce((acc, el) => {
			if (!el.thumbnail && el.featured) el.thumbnail = el.featured.slice(0, -1) + "t";
			acc.push(el);
			return acc;
		}, [])

		// console.log("sort=", sort, "=====>", result.data);

    return result;
	}

	// detail
	static async detail(body) {
		console.log("models.athletes.detail=", body);
		let returnObj = { message: '', data: {} };
		
		try{
			// -----> get query
			// const aggregate = Query.detail(body);
			const queryAthlete = { athleteID: Number(body.athleteID) };
			const projection = { _id:0, status:0, crawling: 0, };
			// console.log("~~~~~~~~~~~~", JSON.stringify(aggregate, null, "  "));
			//----------------------------------------------------------
			const result = await mongodb.findOne(mongoCFG.Breaststroke.athletes, queryAthlete, projection );

			//----------------------------------------------------------
			if (!result.data.athleteID) {
				result.message = "athletes.detail.athleteID no data";
				console.log(result.message)
				return result;
			}
			
			// if (body.discipline) query.discipline = body.discipline;
			const query = {
				athleteID	: Number(body.athleteID),
				discipline: { $in: ["BR", "BRZS", "BROS", "BRMS", "BROW", "BRUW"] },
				// timeStamp	: { '$gt': 0 },
				$or				: [ { status: ""}, { status: { $exists: false }} ],
			};
			const context = {
				query			: query,
				projection: { _id:0, nameORG:0, disciplineORG:0, crawled:0, dateEnd:0, style:0,  },
				limit			: athleteLimit,
				sort: { discipline: -1 },
			}
			const resultTimes = await mongodb.find(mongoCFG.Breaststroke.times, context );
			result.data.times = resultTimes.data.reduce((arr, el) => {
				const tms = el.time.split(':')
				if (tms.length > 1 && tms[0].length == 1) {
					tms[0] = "0" + tms[0]
					el.time = tms.join(':')
				}
				if (el. time || el.discipline=='BRUW') arr.push(el);
				return arr;
			}, []);

			console.log("BRZS---->", result.data.times.filter(el => el.discipline=="BRZS"));
			console.log("BRUW---->", result.data.times.filter(el => el.discipline=="BRUW"));
			// await StaticLibrary.updateViewReactions("athletes", result.data.athleteID, result.data.name, body.userID??0); // db, id, name, userID
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



	  
	// view
	/**
	 * 
	 * @param {*} body 
	 * @returns 
	 */
	static async view(body) {
		// 선수 ID를 숫자로 변환합니다.
		const athleteID = Number(body.athleteID);
		// let result = await mongodb.findOne(mongoCFG.Breaststroke.users, { athleteID: athleteID }, { _id:0, athleteID:1, } );
		// 선수 정보가 없는 경우 에러 메시지를 반환합니다.
		// if (!result.data.athleteID) return utilError.errorMSG("Model","athletes", "view", "no data");
		
		// MongoDB에서 선수 정보를 조회합니다.
		const aggregate = [
			{ $match: { athleteID: athleteID } },
			{
				$lookup: {
					from: mongoCFG.Breaststroke.athletesStatistics,
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

		const result = await mongodb.aggregate(mongoCFG.Breaststroke.athletes, aggregate);
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
		returnObj = await mongodb.updateOne(mongoCFG.Breaststroke.athletes, query, body);
	
		return returnObj;
	}
	// delete
	static async delete(athleteID) {
		console.log("DATABASE.athletes.delete.body=", body);
		//-----> validation
		let returnObj = { message: "", };
	
		if (! body.athleteID && ! body.athleteIDs) {
			returnObj.message = `${mongoCFG.Breaststroke.athletes}.delete.athleteID not found`;
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
		// returnObj = await mongodb.deleteMany(mongoCFG.Breaststroke.athletes, query);
		returnObj = await mongodb.updateMany(mongoCFG.Breaststroke.athletes, query, { status: "deleted" });
	
		//--------------------------
		//-----> $unset athleteID in times 
		//--------------------------
		const value = { $unset: { athleteID: 0 } };
		const result = await mongodb.updateManyOP(mongoCFG.Breaststroke.times, query, value);
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
			value.athleteID = await mongodb.max(mongoCFG.Breaststroke.athletes, "athleteID", { athleteID : { $lt: athleteAthleteIDstart } });
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
		await mongodb.updateOne(mongoCFG.Breaststroke.athletes, query, value);

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
//####################################################################
//####################################################################
}

module.exports = AthleteModel;

