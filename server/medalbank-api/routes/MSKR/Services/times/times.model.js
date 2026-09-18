const extend 			= require('node.extend');
const mskCFG 			= require('../../Config/mskCFG');
const mongoCFG 		= require('../../Config/mongoCFG');
const mongoDB			= require('../../Class/MongoDB');
const UtilDate		= require("../../Class/DateLibrary");
const {customTimes, checkTimes} = require("../../Util/utilTimes");
const {eliteAgeGroup} = require("../../Util/swimmingLibrary");
const utilLibrary = require("../../Util/utilLibrary");
const utilError		= require("../../Util/utilError");
const {swimmingCFG}	= require('../../Config/swimmingCFG');
const imageLibrary = require("../library/images.library.js");
const historyLibrary = require("../library/history.library.js");
const StaticLibrary	= require("../library/statistics.library");

const TimeLibrary	= require("../../Class/TimeLibrary");
const timeLibrary = new TimeLibrary();
// const MemoryUTIL	= require("../memoryUTIL");

const MemoryDB 		= require('../../Class/MemoryDB');
const memoryDB		= new MemoryDB();


const Customizing = require("./times.custom");
const Names				= require("../names/names.model");
const { ageGroup } = require('../competitions/competitions.model');
const { SchoolTable }	= require("../../../Crawler/sports/util");

const mongodb 		= new mongoDB(mongoCFG.Medalbank.database);
const utilDate		= new UtilDate();

const PK = "timeID";
const MAX_TIMESTAMP = 0.013888888888888888; // '20:00.00'

const project1 = {
	_id:0,
	timeID:1,
	athleteID:1,
	ageGroup:1,
	gender:1,
	course:1,
	distance:1,
	status:1,
	style:1,
	name:1,
	nameHide:1,
	featured:1,
	team:1,
	rank:1,
	time:1,
	timeStamp:1,
	ageGroup:1,
	datetime:1,
	masters:1,
	adult:1,
	individual:1,
	competitionID:1,
	competitions:{ $arrayElemAt: [ "$competitions", 0 ] }
}
const project2 = {
	_id:0,
	timeID:1,
	athleteID:1,
	ageGroup:1,
	gender:1,
	course:1,
	distance:1,
	status:1,
	style:1,
	type:1,
	name:1,
	nameHide:1,
	featured:1,
	team:1,
	time:1,
	timeStamp:1,
	rank:1,
	datetime:1,
	masters:1,
	adult:1,
	individual:1,
	competitionID:1,
	competitionName:"$competitions.fullname",
	pool:"$competitions.pool"
}
const sort = { name:1,gender:1, team:1, ageGroup:1,style:1,distance:1,times:1 };
const timsLimit = 5000;

const _context = {
	query		 	: {},
	projection: { _id:0, },
	limit		 	: timsLimit,
	skip			: 0,
	sort			: { _id:-1 },
}

function checkHeatLatestBest(timeArr) {
  // 선수별로 최근date: seqno=1, best time: seqno=2
  let prevName = timeArr[0].name;
  let latest = "1970-01-01";
  let best = 0.99;
  let latestNo = -1;
  let bestNo = -1;

  for (let no=0; no<timeArr.length; no++) {
    const time = timeArr[no];
    if (prevName != time.name) {
      timeArr[latestNo].status = "latest"; // latest datetime
      timeArr[bestNo].check = true; // best time
      latest = "1970-01-01";
      best = 0.99;
    }
    if (timeArr[no].datetime != "" && timeArr[no].datetime > latest) {
      latest = timeArr[no].datetime;
      latestNo = no;
    }
    if (timeArr[no].time < best) {
      best = timeArr[no].time;
      bestNo = no;
    }

    prevName = timeArr[no].name;
  }
  timeArr[latestNo].status = "latest"; // latest datetime
  timeArr[bestNo].check = true; // best time

  return timeArr;
}

function checkLatestBest(timeArr) {
  // 선수별로 최근date: seqno=1, best time: seqno=2
  let prevStyle = timeArr[0].style;
  let prevDistance = timeArr[0].distance;
  let latest = "1970-01-01";
  let best = 0.99;
  let latestNo = -1;
  let bestNo = -1;

  for (let no=0; no<timeArr.length; no++) {
    const time = timeArr[no];
		// console.log("bestNo:", bestNo, "latestNo:", latestNo);
		// console.log("timeArr[latestNo]=", timeArr[latestNo]);
		// console.log("timeArr[bestNo]=", timeArr[bestNo]);
    if (prevStyle != time.style || prevDistance != time.distance) {
      timeArr[latestNo].status = "latest"; // latest datetime
      timeArr[bestNo].check = true; // best time
      latest = "1970-01-01";
      best = 0.99;
    }
    if (timeArr[no].datetime != "" && timeArr[no].datetime > latest) {
      latest = timeArr[no].datetime;
      latestNo = no;
    }
    if (timeArr[no].time < best) {
      best = timeArr[no].time;
      bestNo = no;
    }

    prevStyle = timeArr[no].style;
    prevDistance = timeArr[no].distance;
  } // end for
  timeArr[latestNo].status = "latest"; // latest datetime
  timeArr[bestNo].check = true; // best time

  return timeArr;
}
// 앞에 '0' 붙이는것
function formatTimeLeading(timeStr) {
  // 입력값에서 숫자와 점, 콜론만 추출
  const cleanStr = timeStr.replace(/[^0-9:\.]/g, '');
	if (cleanStr.length >= 6) return timeStr;
  
  let minutes = 0;
  let seconds = 0;
  let milliseconds = 0;

  // ':' 포함 여부에 따라 파싱
  if (cleanStr.includes(':')) {
    const [mins, rest] = cleanStr.split(':');
    minutes = parseInt(mins);
    if (rest.includes('.')) {
      const [secs, ms] = rest.split('.');
      seconds = parseInt(secs);
      milliseconds = parseInt(ms);
    } else {
      seconds = parseInt(rest);
    }
  } else if (cleanStr.includes('.')) {
    const [secs, ms] = cleanStr.split('.');
    seconds = parseInt(secs);
    milliseconds = parseInt(ms);
  } else {
    milliseconds = parseInt(cleanStr);
  }

  // 분, 초, 밀리초를 두 자리 수로 패딩
  const paddedMinutes = minutes.toString().padStart(2, '0');
  const paddedSeconds = seconds.toString().padStart(2, '0');
  const paddedMilliseconds = milliseconds.toString().padStart(2, '0');

  return `${paddedMinutes}:${paddedSeconds}.${paddedMilliseconds}`;
}
// 뒤에 '0' 붙이는것
function formatTimeTrailing(timeStr) {
  // 숫자만 추출
  const numbers = timeStr.replace(/[^0-9]/g, '');
	// if (numbers.length > 6) return timeStr;

  // 6자리로 패딩 (000000 형식)
  const paddedNum = ("000000"+numbers).slice(-6);
  
  // 뒤에서부터 2자리씩 자르기
  const ms = paddedNum.slice(-2);        // 밀리초
  const ss = paddedNum.slice(-4, -2);    // 초
  const mm = paddedNum.slice(-6, -4);    // 분
	let time = `${mm}:${ss}.${ms}`;
	if (time.slice(0,3) == "00:") time = time.slice(3);
	if (time.slice(0,2) == "0:") time = time.slice(2);
	if (time.slice(0,1) == "0") time = time.slice(1);

  return time;
}

class TimeModel {

	//####################################################################
	//####################################################################
	//####################################################################
	

	/*
		*	timelists: search names
		* '홍길동 박문수 평형 자유형'
		*
		* 선수 이름으로 검색하여 경기 기록과 선수 통계를 조회하는 함수
		* @param {Object} body - 검색 조건
		* @param {string} body.name - 검색할 선수 이름
		* @param {string} [body.style] - 수영 종목 (freestyle, backstroke, breaststroke, butterfly, individualMedley)
		* @param {string} [body.distance] - 경기 거리
		* @returns {Promise<Object>} 검색된 기록과 선수 통계 정보
		*/
	static async searchNames(body) {
		console.log("times.searchNames.body=", body);
		// let name = decodeURIComponent(body.name.trim());
		// const names = name.replace(/,|-|_|\|/gi, " ")		// delimeter: [' '|',']
		// 									.replace(/\s{2,}/g, ' ')
		// 									.trim()
		// 									.split(' ')
		// 									.map(name => name) // utilLibrary.normalizeMSKR(name))
		// 									.filter(name => name.length > 1);	// 이름은 한자 이상
		
		// 검색할 이름 전처리

		// 기본 검색 조건 설정
		//#####################################
		//	names가 1명인 경우: 전종목, 전time 보여주기
		//#####################################
		let result;
		
		const query = {
			name: { $in: body.name },
			$or: [ {status: ""}, { status: { $exists: false }}],
			timeStamp	: { $gt: 0 }, 
			fin				: { $exists: false }
		};
		if (body.style) query.style = body.style;
		if (body.distance) query.distance = body.distance;
		
		if (body.name.length == 1) {
			// result = await mongodb.find(mongoCFG.Medalbank.times, context);
			const aggregate = [
				{ $match: query
				},
				{ $lookup: {
						from: mongoCFG.Medalbank.athletes,
						let: { athleteID: "$athleteID" },
						pipeline: [
							{ $match: {
									$expr: { $eq: ["$athleteID", "$$athleteID"] }
								}
							},
							{ $project: {
									_id: 0,    
									featured: 1,
									thumbnail: 1
								}
							}
						],
						as: "athlete"
					}
				}
			];
			//----------------------------------------------------------------
			result = await mongodb.aggregate(mongoCFG.Medalbank.times, aggregate);
			//----------------------------------------------------------------

		} else {
		//#####################################
		//	names가 1명 이상인 경우: 가장 좋은 기록 보여주기
		//#####################################
			const aggregate = [
				{ $match: query },
				// 1단계: style, course, distance, name으로 그룹화하고 최소 timeStamp 찾기
				{
					$group: {
						_id: {
							style: "$style",
							course: "$course",
							distance: "$distance",
							name: "$name"
						},
						// Find the document with minimum timeStamp in each group
						minTimeDoc: { $min: { timeStamp: "$timeStamp", document: "$$ROOT" } }
					}
				},
				// Project to return the entire document
				{
					$replaceRoot: { newRoot: "$minTimeDoc.document" }
				},
				{ $sort: { style:1, course:1, distance:1, name:1, gender:1 } },
				{ $lookup: {
						from: mongoCFG.Medalbank.athletes,
						let: { athleteID: "$athleteID" },
						pipeline: [
							{ $match: {
									$expr: { $eq: ["$athleteID", "$$athleteID"] }
								}
							},
							{ $project: {
									_id: 0,    
									featured: 1,
									thumbnail: 1
								}
							}
						],
						as: "athlete"
					}
				}
			];
			
			console.log("times.searchNames.body=", query);
			//----------------------------------------------------------------
			result = await mongodb.aggregate(mongoCFG.Medalbank.times, aggregate);
			//----------------------------------------------------------------
		}
		// const athleteIDs = [ ...new Set(result.data.map(time => time.athleteID).filter(athleteID => athleteID != undefined && athleteID > 0))];
		// console.log("athleteIDs=", athleteIDs);

		//-----> customizing
		// result.data = result.data.map(data => (Customizing.customizing(data)));
		result.data = result.data.reduce((arr, time) => {
																const value = Customizing.customizing(time);
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
																if (time.athlete && time.athlete.length > 0) {
																	value.thumbnail = time.athlete[0].thumbnail || time.athlete[0].featured || '';
																}
																if (value.datetime) value.datetime = new Date(value.datetime).toISOString().slice(0, 10)
																arr.push(value);
																return arr;
															}, []);
		// console.log("result=", result);
		console.log("times.searchNames.count=", result.count, "length=", result.data.length, result.data);
		return result;
	}
	static async notMyTime(body) {
		console.log("times.notMyTime.body=", body);
		//----------------------------------------------------------------
		const query = { timeID: Number(body.timeID) };
		// const value = { athleteID: 0 };
		// result = await mongodb.updateOne(mongoCFG.Medalbank.times, query, value);
		const value = { $unset: { athleteID: 0} };
		const result = await mongodb.updateOneOp(mongoCFG.Medalbank.times, query, value);
		//----------------------------------------------------------------

		console.log("times.notMyTime.result=", query, value, result);
		return result;
	}
		


	static async searchNameStyle(body) {
		console.log("searchNameStyle.body=", body);
		// let name = decodeURIComponent(body.name.trim());
		// 선수 이름 정규화 데이터 조회
		const norms = await Names.getNames({ type: "name", name: body.name.join(",") });
		
		// 검색할 이름 전처리
		// let name = body.name.trim();
		// name = name.includes("*") ? new RegExp(name.replace("*", ""), "gi") : name;

		// 기본 검색 조건 설정
		const query = {
			style: {
				$in: [
					"freestyle",
					"backstroke",
					"breaststroke",
					"butterfly",
					"individualMedley",
				]
			},
			$or: [{ name: { $in: body.name } }, { norm: { $in: norms.norms } }],
			status: { $nin: ["DNS", "DQ", "NT", "실격"] },
			timeStamp: { $gt: 0 },
			fin: { $exists: false },
		};

		// 추가 검색 조건 적용
		if (body.style) query.style = body.style;
		if (body.distance) query.distance = body.distance;

		// 경기 기록 조회
		let context = {
			query: query,
			projection: {
				_id: 0,
				timeID: 1,
				athleteID: 1,
				name: 1,
				gender: 1,
				style: 1,
				distance: 1,
				course: 1,
				time: 1,
				times: 1,
				timeStamp: 1,
				rank: 1,
				ageGroup: 1,
				team: 1,
				teamID: 1,
				pool: 1,
				poolID: 1,
				datetime: 1,
				competitionID: 1,
				competitionName: 1
			},
			limit: 1000,
			sort: { style: 1, distance: 1, time: 1 },
		}
		let result = await mongodb.find(mongoCFG.Medalbank.times, context);
		// 가입한 times기록이 없으면 times old 검색
		if (result.data.length == 0) {
			delete query.timeStamp;
			query.time = { $gt: 0 };context.query = query;
			console.log("search old times=", query);
			result = await mongodb.find(mongoCFG.Medalbank.timesOLD, context);
			result.data = result.data.reduce((arr, time) => {
																	time.timeStamp = time.time;
																	time.time = time.times;
																	time.athleteID = 0;
																	delete time.times;
																	arr.push(time);
																	return arr;
																},[])
			console.log("times.model.searchNames.result.data=", result.data.length);
		}

		const athletes = [];
		if (result.data.length > 0) {
			// 성별, 종목, 거리별 정렬
			result.data = mskCFG.sortGenderStyleDistance(result.data);
			
			// 중복 제거된 선수 ID 목록 생성
			const athleteIDs = [...new Set(result.data.map(entry => entry.athleteID))];

			// 선수 통계 정보 조회
			context = {
				query: { athleteID: { $in: athleteIDs } },
				projection: { _id: 0, athleteID: 1, medals: 1, bestEvent: 1 },
				limit: 1000,
				sort: { name: 1 },
			}
			const athleteArr = await mongodb.find(mongoCFG.Medalbank.athletesStatistics, context);

			if (athleteArr.data) {
				for (const stat of athleteArr.data) {
					// 선수 기본 정보 설정
					const athlete = {
						athleteID: stat.athleteID,
						name: name,
					};

					// 메달 정보 설정
					if (stat.medals) {
						athlete.gold = stat.medals.gold ?? 0;
						athlete.silver = stat.medals.silver ?? 0;
						athlete.bronze = stat.medals.bronze ?? 0;
					}
try {
					// 종목별 최고 기록 설정
					if (stat.bestEvent) {
						// 자유형 50M LCM
						let time = stat.bestEvent.find(el => el.style == "freestyle"
																				&& el.course == "LCM"
																				&& el.distance == "50M");
// console.log("=====>", time);
						if (time) athlete.freestyle = time.best.time ?? '';

						// 배영 50M LCM
						time = stat.bestEvent.find(el => el.style == "backstroke"
																		&& el.course == "LCM"
																		&& el.distance == "50M");
						if (time) athlete.backstroke = time.best.time ?? '';

						// 평영 50M LCM
						time = stat.bestEvent.find(el => el.style == "breaststroke"
																		&& el.course == "LCM"
																		&& el.distance == "50M");
						if (time) athlete.breaststroke = time.best.time ?? '';

						// 접영 50M LCM
						time = stat.bestEvent.find(el => el.style == "butterfly"
																		&& el.course == "LCM"
																		&& el.distance == "50M");
						if (time) athlete.butterfly = time.best.time ?? '';

						// 개인혼영 200M LCM
						time = stat.bestEvent.find(el => el.style == "individualMedley"
																		&& el.course == "LCM"
																		&& el.distance == "200M");
						if (time) athlete.individualMedley = time.best.time ?? '';
					}
				} catch (e) {}
					athletes.push(athlete);
				}
			}
		}

		// 고희경이 참가한 대회
// 		const times = await mongodb.distinct(mongoCFG.Medalbank.times, "competitionID", { name: body.name })
// 		const competitionIDs = [...new Set(times.data.map((item) => item["competitionID"]))]
// console.log("competitionIDs=", competitionIDs);
// 		console.log("times=", times.data);
		// 고희경이 들어가는 대회
		context = {
			query: { fullname: new RegExp(name, "gi") },
			projection: { _id: 0, competitionID: 1, fullname:1 },
			limit: 1000,
			sort: { name: 1 },
		}
		const times = await mongodb.find(mongoCFG.Medalbank.competitions, context)
		result.competitions = times.data ?? [];

		// 검색 결과 반환
		result.athletes = athletes;
		result.names = norms.names.length > 0 ? norms.names : [body.name];
		console.log("result.competitions=", result.competitions.length);
		// console.log("result.data=", result.data);
		// console.log("result.athletes=", result.athletes.length);
		return result;
	}
	static async searchNames1(body) {
		// try {
			//------------------------
			const norms = await Names.getNames({ type: "name", name: body.name });
			//------------------------
			let name = body.name.trim();
			name = name.includes("%") ? new RegExp(name.replace("%", ""), "gi") : name;

			//----------------------------------------------------------------
			const query = {
				style			: { $in: [
												"freestyle",
												"backstroke",
												"breaststroke",
												"butterfly",
												"individualMedley",
											]
										},
				$or				: [ { name: name }, { norm: { $in: norms.norms } } ],
				status 		: { $nin: [ "DNS", "DQ", "NT", "실격" ]},
				timeStamp	: { $gt: 0 }, fin: { $exists: false },
			};
			if (body.style		) query.style 	= body.style;
			if (body.distance	) query.distance= body.distance;

			//---------------------------
			//	find times
			//---------------------------
			let context = {
				query     : query,
				projection: { _id:0, timeID:1, athleteID:1, name:1, gender:1, style:1, distance:1, course:1, time:1, timeStamp:1, rank:1, ageGroup:1, team:1, teamID:1, pool:1, poolID:1, datetime:1, competitionID:1, competitionName:1  },
				limit     : 1000,
				sort      : { style:1, distance:1, time:1 },
			}
			const result = await mongodb.find(mongoCFG.Medalbank.times, context);
			//----------------------------------------------------------------

			const athletes = [];
			if (result.data.length > 0) {
				//---------------------------
				result.data = mskCFG.sortGenderStyleDistance(result.data);
				//---------------------------
				const athleteIDs = [...new Set(result.data.map(entry => entry.athleteID))];	

				//---------------------------
				//	find athlete statistics
				//---------------------------
				context = {
					query     : { athleteID: { $in: athleteIDs }},
					projection: { _id:0, athleteID:1, medals:1, bestEvent:1, },
					limit     : 1000,
					sort      : { name:1, },
				}
				const athleteArr = await mongodb.find(mongoCFG.Medalbank.athletesStatistics, context);
				//---------------------------
				if (athleteArr.data) {
					for (const stat of athleteArr.data) {
						const athlete = {
							athleteID	: stat.athleteID,
							name			: name,
							// gender		: stat.gender,
							// ageGroup	: stat.ageGroup,
						};
						//---------------------------
						//	set medals
						//---------------------------
						if (stat.medals) {
							athlete.gold 		= stat.medals.gold ?? 0;
							athlete.silver	= stat.medals.silver ?? 0;
							athlete.bronze	= stat.medals.bronze ?? 0;
						}
						//---------------------------
						//	set athlete best style
						//---------------------------
						if (stat.bestEvent) {
							let time = stat.bestEvent.find(el => el.style=="freestyle"
																					&& el.course=="LCM"
																					&& el.distance=="50M");
							if (time) athlete.freestyle = time.best.time ?? '';

							time = stat.bestEvent.find(el => el.style=="backstroke"
																			&& el.course=="LCM"
																			&& el.distance=="50M");
							if (time) athlete.backstroke = time.best.time ?? '';

							time = stat.bestEvent.find(el => el.style=="breaststroke"
																			&& el.course=="LCM"
																			&& el.distance=="50M");
							if (time) athlete.breaststroke = time.best.time ?? '';

							time = stat.bestEvent.find(el => el.style=="butterfly"
																			&& el.course=="LCM"
																			&& el.distance=="50M");
							if (time) athlete.butterfly = time.best.time ?? '';

							time = stat.bestEvent.find(el => el.style=="individualMedley"
																			&& el.course=="LCM"
																			&& el.distance=="200M");
							if (time) athlete.individualMedley = time.best.time ?? '';
						}
						//---------------------------
						athletes.push(athlete);
					}
				}
			}
			result.athletes = athletes;
			result.names = norms.names.length > 0 ? norms.names : [body.name];
			// console.log("result=", result.athletes);
			return result; 
		// } catch (e) {
		// 	return utilError.errorMSG("Model","time", "timelists", "catch." + e);
		// }
	}
	// view
	static async view(body) {
		//----------------------------------------------------------------
		let query = { timeID: Number(body.timeID), athleteID: { $gt: 0 } };
		let aggregate = [
			{ $match: query },
			{ $lookup:{
					from				: mongoCFG.Medalbank.athletes,
					// from				: mongoCFG.Medalbank.athletesView,
					localField	: "athleteID",
					foreignField: "athleteID",
					as					: "athlete"
				}
			},
			{ $lookup:{
					from				: mongoCFG.Medalbank.athletes,
					localField	: "timekeeper",
					foreignField: "athleteID",
					as					: "keeper"
				}
			},
			{ $lookup:{
					from				: mongoCFG.Medalbank.times,
					localField	: "athleteID",
					foreignField: "athleteID",
					as					: "times"
				}
			},
			// { $sort: sort },
			// { $project: project1 },
			// { $project: project2 }
			{ $project: {
					_id:0, timeID:1, athleteID:1,name:1, time:1, gender:1,ageGroup:1,rank:1, style:1, course:1, distance:1,
					teamID:1, poolID:1, competitionID:1, datetime:1, keeper:1, featured:1, isDark:1,
					type:1, athlete: 1, times:1, timekeeper:1, extraInfo:1,
				}
			}
		];
		//----------------------------------------------------------
		const result = await mongodb.aggregate(mongoCFG.Medalbank.times, aggregate);
		//----------------------------------------------------------
		if(result.data.length == 0 ) return { message: "no data", data: { extraInfo: { athlete: {} } } }; // utilError.errorMSG("Model","times", "detail", "no data");
		result.data = result.data[0];

		query = {
			athleteID	: result.data.athleteID,
			style			: result.data.style,
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
		const resultBest = await mongodb.aggregate(mongoCFG.Medalbank.times, aggregate);
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
		const resultSeason = await mongodb.aggregate(mongoCFG.Medalbank.times, aggregate);
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
		// bestTimes = bestTimes.filter(item => item.style == result.data.style && item.course == result.data.course && item.distance == result.data.distance);	
		result.data.extraInfo.athlete = athlete;
		result.data.extraInfo.athlete.bestTimes = 
																				athlete.bestTimes == undefined || athlete.bestTimes.length == 0
																				? []
																				: athlete.bestTimes.filter(item => 
																					item.style == result.data.style && 
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
																												style: cur.style,
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
		await historyLibrary.saveHistory("times", "view", "timeID", body); // db, cmd, id, body
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
			sort      : sort, // { gender:1,  style:1, course:1, distance:1, timeStamp:1, },
		}

		//----------------------------------------------------------------
		const result = await mongodb.find(mongoCFG.Medalbank.times, context);
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
		const athletes = await mongodb.find(mongoCFG.Medalbank.athletes, context1);

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
		console.log("------>", body, query, result.data[0], result.data.length);
		return result;
	}

	// find times
	static async listElite(query, body) {
		query.isMasters = false;
		// const group = SchoolTable.find(el => el.code == body.ageGroup);
		// console.log("SchoolTable=", group);
		// switch (body.gender) {
		// 	case 'men':
		// 		if (body.ageGroup == 'A') { // 유년부
		// 			query.ageGroup = "남자유년부";
		// 		} else {
		// 			switch (body.ageGroup) {
		// 				case "7":
		// 					query.ageGroup = { $in: ["남자고등부", "고등부"] };
		// 					break;
		// 				case "8":
		// 					query.ageGroup = { $in: ["남자대학부", "대학부"] };
		// 					break;
		// 				case "9":
		// 					query.ageGroup = { $in: ["남자일반부", "일반부"] };
		// 					break;
		// 				case "Y":
		// 					query.ageGroup = { $in: ["남자초등부", "초등부"] };
		// 					break;
		// 				case "Z":
		// 					query.ageGroup = { $in: ["남자중학부", "중학부"] };
		// 					break;
		// 			}
		// 		}
		// 		break;
		// 	case 'women':
		// 		if (body.ageGroup == 'A') { // 유년부
		// 			query.ageGroup = "여자유년부";
		// 		} else {
		// 			switch (body.ageGroup) {
		// 				case "7":
		// 					query.ageGroup = { $in: ["여자고등부", "고등부"] };
		// 					break;
		// 				case "8":
		// 					query.ageGroup = { $in: ["여자대학부", "대학부"] };
		// 					break;
		// 				case "9":
		// 					query.ageGroup = { $in: ["여자일반부", "일반부"] };
		// 					break;
		// 				case "Y":
		// 					query.ageGroup = { $in: ["여자초등부", "초등부"] };
		// 					break;
		// 				case "Z":
		// 					query.ageGroup = { $in: ["여자중학부", "중학부"] };
		// 					break;
		// 			}
		// 		}
		// 		break;
		// 	case 'mixed':
		// 		break;
		// } 
		query.ageGroup = eliteAgeGroup(body);
		// if (group) query.ageGroup = group.label;
		// delete body.ageGroup;
		delete query['$or'];
		delete query.isAdult;
		delete query.type;
		delete query.fin;
		delete query.course;
		
		const limit = body.limit ? Number(body.limit) : timsLimit;
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
			sort      : sort, // { gender:1,  style:1, course:1, distance:1, timeStamp:1, },
		}
		console.log("times.listElite.body=", body, "query=", query, "context=", context);
		//----------------------------------------------------------------
		const result = await mongodb.find(mongoCFG.Medalbank.eliteTimes, context);
		//----------------------------------------------------------------
		//-----> customizing
		// result.data = result.data.map(data => (Customizing.customizing(data)));
		result.data = result.data.reduce((arr, time) => {
																const value = Customizing.customizing(time);
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
																arr.push(value);
																return arr;
															}, []);
		// console.log("result=", result);
		console.log("times.listElite.count=", result.count, "length=", result.data.length, result.data[0]);
		return result;
	}
	/***************************************************************
	 * 
	 *	save time result

	 ***************************************************************/
	 static async saveTimeResult(body) {
		let result;
		try {
			let value = await this.setTimeField(body);
			// console.log("saveTimeResult.value=", value);
			//--------------------------------------------------------------------
			// 1. check & update athlete's personal best: athletes, competitions, pools
			//--------------------------------------------------------------------
			// const time = await this.checkAthletePersonalBestNew(athlete, value);
			// if (isPB)	time.isPB = isPB;

			//--------------------------------------------
			// 2. insert times_medalbank
			//--------------------------------------------

			// Check for NaN and delete keys
			if (isNaN(value.competitionID)) {
				delete value.competitionID;
			}

			if (isNaN(value.teamID)) {
				delete value.teamID;
			}
			if (value.nickname == "") {
				delete value.nickname;
			}
			console.log("saveTimeResult.body=", body, value);

			if (!body.timeID) {
				// 같은기록 반복 추가 방지
				const query = {
					athleteID	: value.athleteID,
					type			: value.type,
					style			: value.style,
					course		: value.course,
					distance	: value.distance,
					timeStamp	: value.timeStamp,	
					poolID		: value.poolID,
					datetime	: value.datetime,
				};
				// value.isAdult = !mskCFG.getAgeGroupNameByDob(athlete.dob).includes("학생");
				value.isAdult = !value.ageGroup.includes('학생')
				console.log("query, ", query, value.isAdult, value.ageGroup);
				result = await mongodb.findOne(mongoCFG.Medalbank.times, query, { _id:0, timeID:1, });
				if (result.data.timeID) {
					console.log("time 중복 체크 필요", result.data.timeID);
					return { message: "", data: { timeID:  result.data.timeID } };
				}
			}

			
			// competitionID가 있으묜 event, else time
			// value.type = value.competitionID && value.competitionID > 0 ? "event" : "time";
			value = Customizing.customizing(value);
			result = await mongodb.updateOne(mongoCFG.Medalbank.times, { timeID: value.timeID }, value);
			//--------------------------------------------
			return { message: "", data: { timeID: value.timeID } };
			//--------------------------------------------
		} catch (e) {
			return utilError.errorMSG("Model","times", "saveTimeResult", "catch." + e);
		return { message: "", date: { teamID: 0 } };
		}
	}
	 static async saveTimeResultNew(body) {
		console.log("Model.times.saveTimeResult.body=", body);
		let result;
		// try {
			const value = await this.setTimeFieldNew(body);
			// console.log("saveTimeResultNew.value=", value);
			//--------------------------------------------------------------------
			// 1. check & update athlete's personal best: athletes, competitions, pools
			//--------------------------------------------------------------------
			// const time = await this.checkAthletePersonalBestNew(athlete, value);
			// if (isPB)	time.isPB = isPB;

			//--------------------------------------------
			// 2. insert times_medalbank
			//--------------------------------------------

			// Check for NaN and delete keys
			if (isNaN(value.competitionID)) {
				delete value.competitionID;
			}

			if (isNaN(value.teamID)) {
				delete value.teamID;
			}
			if (value.nickname == "") {
				delete value.nickname;
			}
			console.log("saveTimeResultNew.body=", body, value);

			if (!body.timeID) {
				// 같은기록 반복 추가 방지
				const query = {
					// athleteID	: value.athleteID,
					gender		: value.gender,
					type			: value.type,
					style			: value.style,
					course		: value.course,
					distance	: value.distance,
					timeStamp	: value.timeStamp,	
					poolID		: value.poolID,
					datetime	: value.datetime,
				};
				// value.isAdult = !mskCFG.getAgeGroupNameByDob(athlete.dob).includes("학생");
				if (value.isAdult == undefined && value.ageGroup != undefined) value.isAdult = !value.ageGroup.includes('학생')
				console.log("query, ", query, value.isAdult, value.ageGroup);
				result = await mongodb.findOne(mongoCFG.Medalbank.times, query, { _id:0, timeID:1, });
				if (result.data.timeID) {
					console.log("time 중복 체크 필요", result.data.timeID);
					return { message: "", data: { timeID:  result.data.timeID } };
				}
			}

			console.log("saveTimeResultNew=", { timeID: value.timeID }, value);
			
			// competitionID가 있으면 event, else time
			// value.type = value.competitionID && value.competitionID > 0 ? "event" : "time";
			result = await mongodb.updateOne(mongoCFG.Medalbank.times, { timeID: value.timeID }, value);
			//--------------------------------------------
			return { message: "", data: value };
			//--------------------------------------------
		// } catch (e) {
		// 	return utilError.errorMSG("Model","times", "saveTimeResult", "catch." + e);
		// return { message: "", date: { teamID: 0 } };
		// }
	}
	/***************************************************************
	 * 
	 *	save time result
body: {
  type: 'timeResult',
  style: 'breaststroke',
  course: 'LCM',
  distance: '50M',
  competition: { name: '' },
  timekeeper: { athleteID: 23, name: '문성중', datetime: '2024-09-30' },
  time: '34:56.78',
  pool: {
    poolID: 433,
    course: 'LCM',
    sido: '인천',
    name: '문학박태환수영장',
    datetime: '2024-09-30'
  },
  sido: '',
  caps: '',
  swimwears: '',
  starts: '',
  depths: '',
  temperatures: '',
  memo: '',
  athleteID: 5,
  limit: 3
}
	 ***************************************************************/	
static async insertTimeResultMSKR(body) {
	console.log("insertTimeResultMSKR=", body);
	let result;
	// try {
	
			const value = await this.setTimeField(body);
			const query = { athleteID: value.athleteID };
			const projection = {
				_id					: 0,
				name				: 1,
				nickname		: 1,
				gender			: 1,
				dob					: 1,
				sido				: 1,
				isMasters		: 1,
				isAdult			: 1,
				bestTime		: "$statistics.bestTime",
				bestEvent		: "$statistics.bestEvent",
				timekeepers	: "$statistics.timekeepers",
				competitions: "$statistics.competitions",
				pools				: "$statistics.pools",
				timeCount		: "$statistics.timeCount",
				eventCount	: "$statistics.eventCount",
			};
			result = await mongodb.findOne(mongoCFG.Medalbank.athletesView, 
																			query,
																			projection
																		); 
			const athlete = extend(true, result.data, {});
			// console.log("athlete=", athlete);
			//--------------------------------------------

			// get timeID
			value.timeID = await mongodb.max(mongoCFG.Medalbank.times, "timeID", {}); 

			value.gender				= athlete.gender;
			value.name					= athlete.name;
			value.nickname			= athlete.nickname || "";
			if (value.dob) value.ageGroup			= mskCFG.getAgeGroupCode(athlete.dob);

			value.type					= value.type ?? "time";// query, db
			value.timeStamp 		= utilDate.convertString2Timestamp(value.time);
			value.datetime			= body.datetime ? body.datetime : new Date().toISOString().slice(0, 10);
			value.year					= value.datetime.getFullYear();
			value.isMasters			= athlete.isMasters || true;
			value.isOfficial		= value.type == 'event';
			value.isAdult				= value.ageGroup >= "10";

			// statistics
			athlete.bestTime 		= athlete.bestTime && athlete.bestTime.length > 0 ? athlete.bestTime[0] : {};
			athlete.bestEvent 	= athlete.bestEvent && athlete.bestEvent.length > 0 ? athlete.bestEvent[0] : {};
			athlete.competitions= athlete.competitions && athlete.competitions.length > 0 ? athlete.competitions[0] : [];
			athlete.pools 			= athlete.pools && athlete.pools.length > 0 ? athlete.pools[0] : [];
			athlete.timekeepers = athlete.timekeepers && athlete.timekeepers.length > 0 ? athlete.timekeepers[0] : [];
			athlete.timeCount 	= athlete.timeCount && athlete.timeCount.length > 0 ? athlete.timeCount[0] : 0;
			athlete.eventCount 	= athlete.eventCount && athlete.eventCount.length > 0 ? athlete.eventCount[0] : 0;

			//--------------------------------------------------------------------
			// 1. check & update athlete's personal best: athletes, competitions, pools
			//--------------------------------------------------------------------
			const time = await this.checkAthletePersonalBest(athlete, value);
			// if (isPB)	time.isPB = isPB;

			console.log("insertTimeResultMSKR.time=", time, "value=", value);

			//--------------------------------------------
			// 2. insert times_medalbank
			//--------------------------------------------
			result = await mongodb.insertOne(mongoCFG.Medalbank.times, time);
			//--------------------------------------------
			console.log("times=", value, result);

			//--------------------------------------------
			// 3. check & update leaderboard_medalbank
			//--------------------------------------------
			// const leaderboard = await this.checkLeaderboard(PBs, time);
			// console.log("leaderboard=", leaderboard);

			//--------------------------------------------
		// } catch (e) {
		// 	return utilError.errorMSG("Model","times", "insertTimeResultMSKR", "catch." + e);
		// }
	}
	static async insertTimeResultMSKRathleteIDs(body) {
		console.log("insertTimeResultMSKR=", body);
		let result;
		// try {
		
			const value = await this.setTimeField(body);
			const query = { athleteID: value.athleteID };
			const projection = {
				_id					: 0,
				name				: 1,
				nickname		: 1,
				gender			: 1,
				dob					: 1,
				sido				: 1,
				isMasters		: 1,
				isAdult			: 1,
				bestTime		: "$statistics.bestTime",
				bestEvent		: "$statistics.bestEvent",
				timekeepers	: "$statistics.timekeepers",
				competitions: "$statistics.competitions",
				pools				: "$statistics.pools",
				timeCount		: "$statistics.timeCount",
				eventCount	: "$statistics.eventCount",
			};
			result = await mongodb.findOne(mongoCFG.Medalbank.athletesView, 
																			query,
																			projection
																		); 
			const athlete = extend(true, result.data, {});
			// console.log("athlete=", athlete);
			//--------------------------------------------

			// get timeID
			value.timeID = await mongodb.max(mongoCFG.Medalbank.times, "timeID", {}); 
			// value.athleteIDs		= [ value.athleteID ];
			value.athleteID		= value.athleteID ?? 0;

			value.gender				= athlete.gender;
			value.name					= athlete.name;
			value.nickname			= athlete.nickname || "";
			if (value.dob) value.ageGroup			= mskCFG.getAgeGroupCode(athlete.dob);

			value.type					= value.type ?? "time";// query, db
			value.timeStamp 		= utilDate.convertString2Timestamp(value.time);
			value.datetime			= value.datetime ? new Date(value.datetime) : new Date();
			value.year					= value.datetime.getFullYear();
			value.isMasters			= athlete.isMasters || true;
			value.isOfficial		= value.type == 'event';
			value.isAdult				= value.ageGroup >= "10";

			// statistics
			athlete.bestTime 		= athlete.bestTime && athlete.bestTime.length > 0 ? athlete.bestTime[0] : {};
			athlete.bestEvent 	= athlete.bestEvent && athlete.bestEvent.length > 0 ? athlete.bestEvent[0] : {};
			athlete.competitions= athlete.competitions && athlete.competitions.length > 0 ? athlete.competitions[0] : [];
			athlete.pools 			= athlete.pools && athlete.pools.length > 0 ? athlete.pools[0] : [];
			athlete.timekeepers = athlete.timekeepers && athlete.timekeepers.length > 0 ? athlete.timekeepers[0] : [];
			athlete.timeCount 	= athlete.timeCount && athlete.timeCount.length > 0 ? athlete.timeCount[0] : 0;
			athlete.eventCount 	= athlete.eventCount && athlete.eventCount.length > 0 ? athlete.eventCount[0] : 0;

			//--------------------------------------------------------------------
			// 1. check & update athlete's personal best: athletes, competitions, pools
			//--------------------------------------------------------------------
			const time = await this.checkAthletePersonalBest(athlete, value);
			// if (isPB)	time.isPB = isPB;

			// console.log("insertTimeResultMSKR.time=", time, "value=", value);

			//--------------------------------------------
			// 2. insert times_medalbank
			//--------------------------------------------
			result = await mongodb.insertOne(mongoCFG.Medalbank.times, time);
			//--------------------------------------------
			// console.log("times=", value, result);

			//--------------------------------------------
			// 3. check & update leaderboard_medalbank
			//--------------------------------------------
			// const leaderboard = await this.checkLeaderboard(PBs, time);
			// console.log("leaderboard=", leaderboard);

			//--------------------------------------------
		// } catch (e) {
		// 	return utilError.errorMSG("Model","times", "insertTimeResultMSKR", "catch." + e);
		// }
	}
	static async setTimeField(body) {
		// 저장할 데이터를 담을 객체 초기화
		const value = {};

		// timeID 확인 및 생성
		if (!body.timeID || body.timeID == 0) {
			// timeID가 0이거나 제공되지 않은 경우, 새로운 ID를 생성
			value.timeID = await mongodb.max(mongoCFG.Medalbank.times, "timeID", {});
		} else {
			// 제공된 timeID를 사용
			value.timeID = Number(body.timeID);
		}
		// console.log("----->", body.timeID, value.timeID);

		// --------------------------------------------------------------
		// 입력받은 필드 업데이트
		// --------------------------------------------------------------
		value.athleteID	= Number(body.athleteID); // athleteID
		//------------------------
		const athlete = await mongodb.findOne(
																		mongoCFG.Medalbank.athletes,
																		{ athleteID: value.athleteID },
																		{
																			_id				:0,
																			athleteID	:1,
																			name			:1,
																			dob				:1,
																			gender		:1,
																			ageGroup	:1,
																		}
																	);
		//------------------------
		// 시간 측정자 정보
		if (body["timekeeper.athleteID"]){
			value.timekeeper 	= Number(body["timekeeper.athleteID"]);
		} else if (body.timekeeper && body.timekeeper.athleteID) {
			value.timekeeper = Number(body.timekeeper.athleteID);
		}

		// 대회 정보
		if (body["competition.competitionID"]) {
			value.competitionID = Number(body["competition.competitionID"]);
			if (body["competition.poolID"]				) value.poolID 				= Number(body["competition.poolID"]);
			if (body["competition.sido"]					) value.sido 					= body["competition.sido"].trim();
			if (body["competition.course"]				) value.course 				= body["competition.course"].trim();
		} else if (body.competition) {
			if (body.competition.competitionID	) value.competitionID 	= Number(body.competition.competitionID);
			if (body.competition.fullname				) value.competitionName = body.competition.fullname;
			if (body.competition.poolID					) value.poolID 					= Number(body.competition.poolID);
			if (body.competition.sido						) value.sido 						= body.competition.sido.trim();
			if (body.competition.stemID					) value.stemID 					= Number(body.competition.stemID);
			if (body.competition.course					) value.course 					= body.competition.course.trim();
		}

		// 풀 정보
		if (body["pool.poolID"]) {
			value.poolID 	= Number(body["pool.poolID"]);
			if (body["pool.sido"]	 ) value.sido			= body["pool.sido"].trim();
			if (body["pool.course"]) value.course 	= body["pool.course"].trim();
		} else if (body.pool) {
			if (body.pool.poolID) value.poolID 	= Number(body.pool.poolID);
			if (body.pool.name	) value.pool 		= body.pool.name;
			if (body.pool.sido	) value.sido		= body.pool.sido.trim();
			if (body.pool.course) value.course 	= body.pool.course.trim();
		}

		// 팀 정보
		if (body["team.teamID"] && body["team.team"]) {
			value.teamID 	= Number(body["team.teamID"]);
			value.team 	= body["team.team"];
		}
		if (body.team && body.team.teamID) {
			value.teamID = Number(body.team.teamID);
			value.team = body.team.team;
		}

		// console.log("athlete=", athlete.data);
		// value.athleteIDs = athlete.data.athleteIDs ?? [];
		// if (!value.athleteIDs.includes(value.athleteID)) value.athleteIDs.push(value.athleteID);
		value.athleteID = athlete.data.athleteID ?? 0;

		value.name 					= athlete.data.name ?? ''; // 선수 이름
		value.gender				= athlete.data.gender ?? ''; // 선수 이름
		value.ageGroup			= mskCFG.getAgeGroupNameByDob(athlete.data.dob);
		value.type 					= body.type ? body.type.replace("Result", "") : "event"; // 타입에서 'Result' 제거
		value.style 				= body.style.trim(); // 스타일 정보
		value.course 				= body.course.trim(); // 코스 정보
		value.distance			= body.distance.trim(); // 거리 정보

		value.time 					= formatTimeTrailing(body.time.trim()); // 시간 값
		value.timeStamp 		= utilDate.convertString2Timestamp(value.time); // 시간 값을 타임스탬프로 변환

		// 날짜 및 시간 정보
		value.datetime = body.datetime ? body.datetime.trim() : new Date().toISOString().slice(0, 10);

		// --------------------------------------------------------------
		// 추가 정보 (extraInfo) 처리
		// --------------------------------------------------------------
		value.extraInfo = {};
		if (body.caps					) value.extraInfo.caps 				= body.caps.trim();
		if (body.swimwears		) value.extraInfo.swimwears 	= body.swimwears.trim();
		if (body.starts				) value.extraInfo.starts 			= body.starts.trim();
		if (body.depths				) value.extraInfo.depths 			= body.depths.trim();
		if (body.temperatures	) value.extraInfo.temperatures= body.temperatures.trim();
		if (body.memo					) value.extraInfo.memo 				= body.memo.trim();
		if (body.timeRT				) value.extraInfo.timeRT 			= body.timeRT.trim();
		if (body.time15M			) value.extraInfo.time15M 		= body.time15M.trim();
		if (body.time25M			) value.extraInfo.time25M 		= body.time25M.trim();
		if (body.time35M			) value.extraInfo.time35M 		= body.time35M.trim();
		if (body.time45M			) value.extraInfo.time45M 		= body.time45M.trim();
		if (body.time50M			) value.extraInfo.time50M 		= body.time50M.trim();
		if (body.strokes			) value.extraInfo.strokes 		= Number(body.strokes.trim());
		if (body.breaths			) value.extraInfo.breaths 		= Number(body.breaths.trim());
		if (body.dolphins			) value.extraInfo.dolphins 		= Number(body.dolphins.trim());
		if (Object.keys(value.extraInfo).length == 0) delete value.extraInfo;
		//-----> validate time
		// if (value.timeStamp > )
		return value;
	}	
	static async setTimeFieldNew(body) {
		// 저장할 데이터를 담을 객체 초기화
		const value = {};

		// timeID 확인 및 생성
		if (!body.timeID || body.timeID == 0) {
			// timeID가 0이거나 제공되지 않은 경우, 새로운 ID를 생성
			value.timeID = await mongodb.max(mongoCFG.Medalbank.times, "timeID", {});
		} else {
			// 제공된 timeID를 사용
			value.timeID = Number(body.timeID);
		}
		// console.log("----->", body.timeID, value.timeID);

		// --------------------------------------------------------------
		// 입력받은 필드 업데이트
		// --------------------------------------------------------------
		if (body.athleteID) {
			value.athleteID	= Number(body.athleteID); // athleteID
			//------------------------
			const athlete = await mongodb.findOne(
																			mongoCFG.Medalbank.athletes,
																			{ athleteID: value.athleteID },
																			{
																				_id				:0,
																				athleteID	:1,
																				name			:1,
																				dob				:1,
																				gender		:1,
																				ageGroup	:1,
																			}
																		);
			//------------------------
			console.log("athlete--------->, ", athlete.data);
			// 시간 측정자 정보
			if (body["timekeeper.athleteID"]){
				value.timekeeper 	= Number(body["timekeeper.athleteID"]);
			} else if (body.timekeeper && body.timekeeper.athleteID) {
				value.timekeeper = Number(body.timekeeper.athleteID);
			}
			// console.log("athlete=", athlete.data);
			// value.athleteIDs = athlete.data.athleteIDs ?? [];
			// if (!value.athleteIDs.includes(value.athleteID)) value.athleteIDs.push(value.athleteID);
			value.athleteID = athlete.data.athleteID ?? 0;

			value.name 					= athlete.data.name ?? ''; // 선수 이름
			value.gender				= athlete.data.gender ?? ''; // 선수 이름
			value.ageGroup			= mskCFG.getAgeGroupNameByDob(athlete.data.dob);
		} else {
			value.name 					= body.name.trim(); // 선수 이름
			value.gender				= body.gender ?? ''; // 선수 이름
			if (body.ageGroup) value.ageGroup = body.ageGroup.trim();
		}

		if (body.team						) value.team 						= body.team.trim();
		if (body.team && body.teamID) value.teamID 			= Number(body.teamID);

		if (body.type) value.type 					= body.type ? body.type.replace("Result", "") : "event"; // 타입에서 'Result' 제거
		if (body.style) value.style 				= body.style.trim(); // 스타일 정보
		if (body.course) value.course 				= body.course.trim(); // 코스 정보
		if (body.distance) value.distance			= body.distance.trim(); // 거리 정보

		value.time 					= formatTimeTrailing(body.time.trim()); // 시간 값
		value.timeStamp 		= utilDate.convertString2Timestamp(value.time); // 시간 값을 타임스탬프로 변환

		// 날짜 및 시간 정보
		value.datetime = body.datetime ? body.datetime.trim() : new Date().toISOString().slice(0, 10);

		
		// 대회 정보
		if (body.competitionID	) {
			value.competitionID 	= Number(body.competitionID);
			const competition = memoryDB.getCompetition(value.competitionID);
			if (competition.competitionID) {
				value.competitionName = competition.fullname;
				value.stemID = competition.stemID;
				value.stem = competition.stem;
				value.sido = competition.sido;
				value.poolID = competition.poolID;
				value.pool= competition.pool
				value.course = competition.course;
				value.datetime = new Date(competition.dateStart).toISOString().slice(0, 10);
				// console.log("competition=", competition);
			}
		} else {
			if (body.competitionName) value.competitionName = body.competitionName;
			if (body.poolID					) value.poolID 					= Number(body.poolID);
			if (body.pool						) value.pool 						= body.pool.trim();
			if (body.sido						) value.sido 						= body.sido.trim();
			if (body.stemID					) value.stemID 					= Number(body.stemID);
			if (body.course					) value.course 					= body.course.trim();
		}

		// --------------------------------------------------------------
		// 추가 정보 (extraInfo) 처리
		// --------------------------------------------------------------
		value.extraInfo = {};
		if (body.caps					) value.extraInfo.caps 				= body.caps.trim();
		if (body.swimwears		) value.extraInfo.swimwears 	= body.swimwears.trim();
		if (body.starts				) value.extraInfo.starts 			= body.starts.trim();
		if (body.depths				) value.extraInfo.depths 			= body.depths.trim();
		if (body.temperatures	) value.extraInfo.temperatures= body.temperatures.trim();
		if (body.memo					) value.extraInfo.memo 				= body.memo.trim();
		if (body.timeRT				) value.extraInfo.timeRT 			= body.timeRT.trim();
		if (body.time15M			) value.extraInfo.time15M 		= body.time15M.trim();
		if (body.time25M			) value.extraInfo.time25M 		= body.time25M.trim();
		if (body.time35M			) value.extraInfo.time35M 		= body.time35M.trim();
		if (body.time45M			) value.extraInfo.time45M 		= body.time45M.trim();
		if (body.time50M			) value.extraInfo.time50M 		= body.time50M.trim();
		if (body.strokes			) value.extraInfo.strokes 		= Number(body.strokes.trim());
		if (body.breaths			) value.extraInfo.breaths 		= Number(body.breaths.trim());
		if (body.dolphins			) value.extraInfo.dolphins 		= Number(body.dolphins.trim());
		if (Object.keys(value.extraInfo).length == 0) delete value.extraInfo;
		//-----> validate time
		// if (value.timeStamp > )
		return value;
	}	
	/**
	 * static saveTimeWithImage 함수
	 *
	 * 이 함수는 시간(Time) 데이터를 데이터베이스에 저장하거나 업데이트합니다.
	 * 시간 데이터에 관련된 대표 이미지를 처리하고, 입력된 데이터를 기반으로 필드를 업데이트합니다.
	 *
	 * @param {Object} body - 시간 데이터를 포함하는 객체
	 * @param {number|string} [body.timeID] - 시간 데이터의 고유 ID. 0이거나 제공되지 않은 경우 새로운 ID가 생성됩니다.
	 * @param {string} [body.sourcePath] - 저장할 이미지 파일의 경로
	 * @param {string} [body.type] - 시간 데이터의 유형
	 * @param {string} [body.style] - 스타일 정보
	 * @param {string} [body.course] - 코스 정보
	 * @param {string} [body.distance] - 거리 정보
	 * @param {string} [body.time] - 시간 값
	 * @param {Object} [body.timekeeper] - 시간 측정자 정보: { athleteID }
	 * @param {Object} [body.competition] - 대회 정보: { competitionID, poolID, sido, course }
	 * @param {Object} [body.pool] - 풀 정보: { poolID, sido, course }
	 * @param {Object} [body.team] - 팀 정보: { teamID }
	 * @param {Object} [body.extraInfo] - extraInfo: { caps, swimwears, starts, depths, temperatures, memo, strokes, breaths, dolphins, timeRT, 15M, 25M, 35M, 45M, 50M }
	 * @param {Object} [body.extraInfo] - 추가적인 상세 정보
	 * @returns {Promise<Object>} 저장된 시간 데이터 ID와 메시지를 포함하는 객체
	 */
	static async saveTimeWithImageURL(body) {
		// console.log("time.model.saveTimeWithImageURL.body=", body);

		const value = {};
		// console.log("----->", body.timeID, value.timeID);
		value.timeID	= Number(body.timeID); // athleteID
		//------------------------
		const result = await mongodb.findOne(
																		mongoCFG.Medalbank.times,
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
		await mongodb.updateOne(mongoCFG.Medalbank.times, { timeID: value.timeID }, value);

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
	static async saveTimeWithImage(body) {
		// console.log("time.model.saveTimeWithImage.body=", body);

		const value = {};
		// console.log("----->", body.timeID, value.timeID);
		value.timeID	= Number(body.timeID); // athleteID
		//------------------------
		const result = await mongodb.findOne(
																		mongoCFG.Medalbank.times,
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
		await mongodb.updateOne(mongoCFG.Medalbank.times, { timeID: value.timeID }, value);

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

	// delete
	static async delete(timeID) {
		try {
			console.log("times.delete.timeID=", timeID);
			//----------------------------------------------------------------
			const today = new Date().toISOString().slice(0, 10);
			const result = await mongodb.updateOneOp(
																				mongoCFG.Medalbank.times,
																				{ timeID: Number(timeID) },
																				{
																					$set: { deleted: today, status: "deleted" },
																					$unset: { athleteID: 0 }
																				},
																			);
			// const result = await mongodb.deleteOne(
			// 																	mongoCFG.Medalbank.times,
			// 																	{ timeID: Number(timeID) },
			// 																);
		//----------------------------------------------------------------
		} catch (err) {
			return utilError.errorMSG("Model","times", "delete", "catch." + err);
		}
	}

	// delete
	static async deleteUpdate(timeID) {
		console.log("times.model.deleteUpdate.timeID=", timeID);
		try {
			//----------------------------------------------------------------
			const result = await mongodb.updateOneOp(
																				mongoCFG.Medalbank.times,
																				{ timeID: Number(timeID) },
																				{ $unset: { athleteID: "" } },
																			);
		//----------------------------------------------------------------
		} catch (e) {
			return utilError.errorMSG("Model","times", "deleteUpdate", "catch." + e);
		}
	}

	// delete
	static async deleteMSKR(timeID) {
		try {
			//----------------------------------------------------------------
			const result = await mongodb.deleteOne(
																				mongoCFG.Medalbank.times,
																				{ timeID: Number(timeID) },
																			);
			//----------------------------------------------------------------
		} catch (e) {
			return utilError.errorMSG("Model","times", "deleteMSKR", "catch." + err);
		}
	}

	// delete
	static async deleteMSKRathleteIDs(timeID) {
		try {
			//----------------------------------------------------------------
			result = await mongodb.updateOne(
																				mongoCFG.Medalbank.times,
																				{ timeID: Number(timeID) },
																				{ $pull: { athleteIDs: timeID } }
																			);
			//----------------------------------------------------------------
		} catch (e) {
			return utilError.errorMSG("Model","times", "deleteMSKR", "catch." + err);
		}
	}

	//####################################################################
	//######### Confirm ##################################################
	//####################################################################


	/**
		 * static saveTime 함수
		 *
		 * 이 함수는 시간(Time) 데이터를 데이터베이스에 저장하거나 업데이트합니다.
		 *
		 * @param {Object} body - 시간 데이터를 포함하는 객체
		 * @param {number|string} [body.timeID] - 시간 데이터의 고유 ID. 0이거나 제공되지 않은 경우 새로운 ID가 생성됩니다.
		 * @param {string} [body.type] - 시간 데이터의 유형
		 * @param {string} [body.style] - 스타일 정보
		 * @param {string} [body.course] - 코스 정보
		 * @param {string} [body.distance] - 거리 정보
		 * @param {string} [body.time] - 시간 값
		 * @param {Object} [body.timekeeper] - 시간 측정자 정보: { athleteID }
		 * @param {Object} [body.competition] - 대회 정보: { competitionID, poolID, sido, course }
		 * @param {Object} [body.pool] - 풀 정보: { poolID, sido, course }
		 * @param {Object} [body.team] - 팀 정보: { teamID }
		 * @param {Object} [body.extraInfo] - extraInfo: { caps, swimwears, starts, depths, temperatures, memo, strokes, breaths, dolphins, timeRT, 15M, 25M, 35M, 45M, 50M }
		 * @param {Object} [body.extraInfo] - 추가적인 상세 정보
		 * @returns {Promise<Object>} 저장된 시간 데이터 ID와 메시지를 포함하는 객체
		 */
	static async saveTime(body) {
		console.log("time.model.saveTime.body=", body);

		//-----
		const value = await this.setTimeField(body);

		// --------------------------------------------------------------
		// 데이터베이스에 업데이트
		// --------------------------------------------------------------
		await mongodb.updateOne(mongoCFG.Medalbank.times, { timeID: value.timeID }, value);

		await new TimeLibrary().updateAthleteStatistics(value);

		await StaticLibrary.updateViewReactions("times", value.timeID, value.name, body.userID??0); // db, id, name, userID

		// console.log("value=", value);

		// --------------------------------------------------------------
		// 결과 반환
		// --------------------------------------------------------------
		return { message: "", data: { timeID: value.timeID } };
	}
	/**
	 * saveImage 함수
	 *
	 * @param {Object} body - 시간 데이터를 포함하는 객체
	 * @param {number|string} [body.timeID] - 시간 데이터의 고유 ID. 0이거나 제공되지 않은 경우 새로운 ID가 생성됩니다.
	 * @param {string} [body.sourcePath] - 저장할 이미지 파일의 경로
	 * @returns {Promise<Object>} 저장된 시간 데이터 ID와 메시지를 포함하는 객체
	 */
	static async saveImage(body) {
		console.log("time.model.saveImage.body=", body);

		// timeID 확인 및 생성
		if (!body.timeID || body.timeID == 0) {
			console.log("timeID not found");
			return { message: "timeID not found", data: { timeID: 0 } }
		}

		// 저장할 데이터를 담을 객체 초기화
		const value = {};

		value.timeID = Number(body.timeID);
		// console.log("----->", body.timeID, value.timeID);

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
		// --------------------------------------------------------------
		// 데이터베이스에 업데이트
		// --------------------------------------------------------------
		await mongodb.updateOne(mongoCFG.Medalbank.times, { timeID: value.timeID }, value);

		// console.log("value=", value);

		// --------------------------------------------------------------
		// 결과 반환
		// --------------------------------------------------------------
		return { message: "", data: { timeID: value.timeID } };
	}

	// detail
	static async detail(body) {
		console.log("times.detail.value=", body);
		//----------------------------------------------------------------
		const query = { timeID: Number(body.timeID) };
		//----------------------------------------------------------
		const result = await mongodb.findOne(mongoCFG.Medalbank.times, query, {_id:0});
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
		await historyLibrary.saveHistory("times", "detail", "timeID", body); // db, cmd, id, body
		//------------------------------------
		// await StaticLibrary.updateViewReactions("times", result.data.timeID, result.data.name, body.userID??0); // db, id, name, userID
// console.log("time.detail.", result.data);
		return result;
	}
	static async createNew() {
		let indexes = [
			{ query: { timeID:1 }, name: "timeID", option: { unique: true }	},
			{ query: { norm:1 }, name: "norm"	},
			{ query: { "times.category":1 }, name: "category"	},
		];
		await mongodb.createCollectionNindex(mongoCFG.Medalbank.times, indexes);
	}
	/**
	*	import times to times_medalbank
		* @param {*} body: athleteID, name, gender, ageGroupCode, times
		* @returns 
		*/
	static async importTimesMSKR(body) {
		console.log("importTimes.body=", body);
		// try {
			const athleteID = Number(body.athleteID ?? 0);
			if (!body.name || !body.ageGroupCode) return;
			const query = {
				name 			: body.name.trim(),
				gender		: body.gender,
				timeStamp	: { $gt: 0},
				$or				: [ { status: "" }, { status: { $exists: false }} ],	
			};
			console.log("query=", query);
			//----------------------------------------------------------------
			const context = {
				query     : query,
				projection: { _id:0, timeID:1, athleteID:1, athleteIDs:1, ageGroup:1, },
				// projection: { _id:0, timeID:1, athleteID:1, ageGroup:1, },
				limit     : 10000,
				skip			: 0,
				sort      : { name:1, gender:1, style:1, team:1 },
			}
			const result = await mongodb.find(mongoCFG.Medalbank.times, context, "Test");
// console.log("times.length=", result.data.length);
			const bulkOperations = [];

			const timeIDs = [];
			const copied = [];
			let timeID = await mongodb.max(mongoCFG.Medalbank.times, "timeID");
			for (const time of result.data) {
				// type == event && athleteID > 0: 대회기록중 동명이인 처리
				if (time.type == 'event' && time.athleteID != undefined && time.athleteID > 0) {
					//	time copy, copied: timeID, timeID부여,
					time.copied = time.timeID;
					time.timeID = timeID++;
					copied.push(time);
					console.log("동명이인 insert", time.timeID);
					continue;
				} else {
					timeIDs.push(time.timeID);
				}
console.log("update ---> timeID:", time.timeID, "athleteID:", time.athleteID);
			} // end for
			if (timeIDs.length > 0) {
				await mongodb.updateMany(
																	mongoCFG.Medalbank.times,
																	{ timeID: { $in: timeIDs } },
																	{ athleteID: athleteID }
																);
			}
			if (copied.length > 0) {
				await mongodb.insertMany(mongoCFG.Medalbank.times, copied);
			}

			console.log("importTimesMSKR.timeIDs=", timeIDs.length, "copied=", copied.length);
			//----------------------------------------------------------------
			return result.data; 
		// } catch (e) {
		// 	return utilError.errorMSG("Model","times", "delete", "catch." + e);
		// }
	}
	static async importTimesMSKRathleteIDs(body) {
		console.log("importTimes.body=", body);
		// try {
			const athleteID = Number(body.athleteID ?? 0);
			if (!body.name || !body.ageGroupCode) return;
			const query = {
				name 			: body.name.trim(),
				gender		: body.gender,
				timeStamp	: { $gt: 0},
				$or				: [ { status: "" }, { status: { $exists: false }} ],	
			};
			console.log("query=", query);
			//----------------------------------------------------------------
			const context = {
				query     : query,
				projection: { _id:0, timeID:1, athleteID:1, athleteIDs:1, ageGroup:1, },
				// projection: { _id:0, timeID:1, athleteID:1, ageGroup:1, },
				limit     : 10000,
				skip			: 0,
				sort      : { name:1, gender:1, style:1, team:1 },
			}
			const result = await mongodb.find(mongoCFG.Medalbank.times, context, "Test");
console.log("times.length=", result.data.length);
			const bulkOperations = [];
			for (const time of result.data) {
				// $addToSet: time에 athleteID가 있는데 athleteID가 아닌 경우 skip
				if (time.athleteID != undefined && time.athleteID != athleteID) {
					console.log("skip", time.timeID);
					continue;
				}
console.log("update ---> timeID:", time.timeID, "athleteID:", time.athleteID);
// athleteID가 없으면 추가, 있으면 update
				bulkOperations.push({
					updateOne: {
						filter: { timeID: time.timeID },
						update: { 
							$addToSet: { 
								athleteIDs	: athleteID,
							},
						},
						upsert: true,
					}
				});
			};
			console.log("bulkOperations=", bulkOperations.length, bulkOperations[0]);

			const res = await mongodb.bulkWrite(mongoCFG.Medalbank.times, bulkOperations, "Test");
	// console.log("res=", res);
	

			console.log("---->", query, result.data.length);
			//----------------------------------------------------------------
			return result.data; 
		// } catch (e) {
		// 	return utilError.errorMSG("Model","times", "delete", "catch." + e);
		// }
	}
	static async importTimes(body) {
		console.log("importTimes.body=", body);
		try {
			const age = body.dob ? mskCFG.calculateDob2Age(body.dob) : 19; // default 19(성인)
			const athleteID = Number(body.athleteID ?? 0);
			if (!body.name || !body.ageGroup) return;
			const query = {
				name 			: body.name.trim(),
				gender		: body.gender,
				style			: { $in: ["freestyle", "backstroke", "breaststroke", "butterfly", "individualMedley"]},
				isAdult		: age > 18,
				isMasters	: true,
				fin				: { $exists: false },
			};
			console.log("query=", query);
			//----------------------------------------------------------------
			const context = {
				query     : query,
				projection: { _id:0, },
				limit     : 10000,
				skip			: 0,
				// sort      : { name:1, gender:1, style:1, team:1 },
			}
			const result = await mongodb.find(mongoCFG.Medalbank.times, context);
			let timeID = await mongodb.max(mongoCFG.Medalbank.times, "timeID");
			console.log("---->", query, result.data.length);
			//----------------------------------------------------------------
			const timeIDs = [];
			const copiedTimes = []; // times중 다른선수에 등록된 경우(athleteID가 있음), 복제
			const times = result.data.reduce((arr, time) => {
																const competition = memoryDB.getCompetition(time.competitionID);
																const value = {
																	athleteID				: athleteID,
																	timeID					: time.timeID || 0,
																	name						: time.name || "",
																	gender					: time.gender || "",
																	ageGroup				: time.ageGroup,
																	ageGroupCode		: body.ageGroup ?? "",
																	style						: time.style || "",
																	course					: time.course || competition.course,
																	distance				: time.distance || "",
																	time						: time.time || "",
																	timeStamp				: time.timeStamp || 0,
																	rank						: time.rank,
																	isAdult					: time.adult || true,
																	isOfficial			: time.competitionID ? true : false,
																	// diffs						: time.diffs || "",
																	
																	teamID					: time.teamID || 0,
																	poolID					: time.poolID || 0,
																	competitionID		: time.competitionID || 0,

																	team						: time.team || "",
																	competitionName	: time.competitionName,
																	pool						: time.pool || "",
																	datetime				: new Date(time.datetime),

																	type						: "event",
																}
																if (time.athleteID && time.athleteID != athleteID) {
																	time.timeID = timeID++;
																	value.athleteIDcopy = time.athleteID;
																	copiedTimes.push(value);
																} else {
																	timeIDs.push(time.timeID);
																}
																arr.push(value);
																return arr;
															}, []);
			console.log("times=", times.length, "copiedTimes=", copiedTimes.length, "timeIDs=", timeIDs.length);
			if (copiedTimes.length > 0) {
				await mongodb.insertMany(mongoCFG.Medalbank.times, copiedTimes);
			}
			if (timeIDs.length > 0) {
				const query = { timeID: { $in: timeIDs }, athleteID: { $exists: false } };
				const value = { athleteID: athleteID };
				await mongodb.updateMany(mongoCFG.Medalbank.times, query, value);				
			}
			return times; 
		} catch (e) {
			return utilError.errorMSG("Model","times", "delete", "catch." + e);
		}
	}
	



	static async create() {
		const indexes = [
			{ query: { timeID:1 }, name: "timeID", option: { unique: true }	},
			{ query: { norm:1 }, name: "norm"	},
			{ query: { "times.category":1 }, name: "category"	},
		];
		await mongodb.createCollectionNindex(mongoCFG.Medalbank.times, indexes);
	}
	//--------------------------------------------
	//	update athletes: PB, competitions, pools, timekeepers
	//--------------------------------------------
	static async checkAthletePersonalBest(athlete, time) {
		// console.log("checkAthletePersonalBest.body=", time);
		// try {
			athlete.timekeepers = athlete.timekeepers || [];
			athlete.competitions= athlete.competitions || [];
			athlete.pools 			= athlete.pools || [];
			// console.log("athlete=", time);

			//--------------------------------------------
			// timekeeper 추가
			//--------------------------------------------
			if (time.timekeeper && time.timekeeper.athleteID) {
				const timekeeperID = Number(time.timekeeper.athleteID);
				// 같은 athleteID를 가진 객체가 있으면 제거
				athlete.timekeepers = athlete.timekeepers.filter(item => item.athleteID != timekeeperID);
				// athlete 객체를 배열의 0번째에 추가
				athlete.timekeepers.unshift({
					athleteID	: timekeeperID,
					name			: time.timekeeper.name,
				 });
			}

			//--------------------------------------------
			// competition 추가
			//--------------------------------------------
			if (time.competitionID) {
				const competitionID = Number(time.competitionID);
				// 같은 competitionID 가진 객체가 있으면 제거
				athlete.competitions = athlete.competitions.filter(item => item.competitionID != competitionID);
				const competition = memoryDB.getCompetition(competitionID)
				// athlete 객체를 배열의 0번째에 추가
				time.course 	= time.course 	? time.course 	: competition.course;
				time.distance = time.distance ? time.distance : competition.distance;
				athlete.competitions.unshift({
					competitionID	: competitionID,
					course				: time.course,
					distance			: time.distance,
					sido					: competition.sido,
					name					: competition.fullname,
					poolID				: competition.poolID,
				});
			}

			//--------------------------------------------
			// pool 추가
			//--------------------------------------------
			if (time.poolID) {
				const poolID = Number(time.poolID);
				const pool = memoryDB.getPool(poolID);
				// 같은 athleteID를 가진 객체가 있으면 제거
				athlete.pools = athlete.pools.filter(item => item.poolID != poolID);
				time.course 	= time.course 	? time.course 	: pool.course;
				time.distance = time.distance ? time.distance : pool.distance;
				// athlete 객체를 배열의 0번째에 추가
				athlete.pools.unshift({
					poolID	: poolID,
					course	: time.course,
					distance: time.distance,
					sido		: pool.sido,
					name		: pool.fullname
				});
			}

			const pb = {
				style 		: time.style,
				course 		: time.course,
				distance 	: time.distance,
				timeStamp : time.timeStamp,
				time 			: time.time,
				datetime 	: time.datetime,
				poolID 		: time.poolID,
				ageGroup 	: time.ageGroup,
				isOfficial: time.isOfficial,
    		isAdult		: time.isAdult,
			};

			const value = {
				competitions: athlete.competitions,
				pools				: athlete.pools,
				timekeepers	: athlete.timekeepers,
			};
			//--------------------------------------------
			// 2. check & update athletes_medalbank PB.
			//--------------------------------------------
			if (time.type == 'time') {
				const { best, isPB } = this.updateOrInsertRecord(athlete.bestTime ?? [], pb);
				time.isTimePB = isPB;	
				if (isPB) value.bestTime = best;
				value.timeCount = (athlete.timeCount ?? 0) + 1;
			} else {
				const { best, isPB } = this.updateOrInsertRecord(athlete.eventTime ?? [], pb);
				time.isEventPB = isPB;	
				if (isPB) value.eventTime = best;
				value.EventCount = (athlete.EventCount ?? 0) + 1;
			}
			// update athlete
			//--------------------------------------------

			const query = { athleteID: time.athleteID };
			// console.log("query=", query, "value=", value);
			//--------------------------------------------
			const res = await mongodb.updateOne(mongoCFG.Medalbank.athletesStatistics, query, value);
			// console.log("===========================", res);
			//--------------------------------------------

			/*
			if (body.timekeeper || body.competition || body.pool) {
				query = { athleteID: athlete.athleteID };
				const pull = {};
				const push = {};
				// timekeeper: { no: 0, name: '문성경' }
				if (body.timekeeper && body.timekeeper.athleteID) {
					const timekeeperID = Number(body.timekeeper.athleteID);
					pull.timekeepers = { timeID: timekeeperID };
					push.timekeepers = {
						$each: [{ timeID: timekeeperID, name: body.timekeeper.name }],
						$position: 0, // 배열 맨 앞에 추가
						$slice: 3     // 최신 3개만 유지
					};
				}
				if (body.competition && body.competition.competitionID) {
					const competitionID = Number(body.competition.competitionID);
					pull.competitions = { competitionID: competitionID };
					push.competitions = {
						$each: [{ competitionID: competitionID, course: body.competition.course, sido: body.competition.sido, name: body.competition.competitionName }],
						$position: 0, // 배열 맨 앞에 추가
						$slice: 3     // 최신 3개만 유지
					};
				}
				if (body.pool && body.pool.poolID) {
					const poolID = Number(body.pool.poolID);
					pull.pools = { poolID: poolID };
					push.pools = {
						$each: [{ poolID: poolID, course: body.pool.course, sido: body.pool.sido, name: poolID.name }],
						$position: 0, // 배열 맨 앞에 추가
						$slice: 3     // 최신 3개만 유지
					};
				}
				const update = {
					$pull: pull,
					$push: push,
				};
				result = await mongodb.updateOneOp(mongoCFG.Medalbank.athletes, query, update);
				*/
			return time;
			/*
				// `cid` 및 `tid` 중복 항목을 제거한 후 새 항목을 추가하여 최신 3개만 유지
				await athletes.updateOne(
					{ athleteID: athleteID },
					{
						$pull: {
							competitions: { cid: newCompetition.cid },
							timekeepers: { tid: newTimekeeper.tid }
						},
						$push: {
							competitions: {
								$each: [newCompetition],
								$position: 0, // 배열 맨 앞에 추가
								$slice: 3     // 최신 3개만 유지
							},
							timekeepers: {
								$each: [newTimekeeper],
								$position: 0, // 배열 맨 앞에 추가
								$slice: 3     // 최신 3개만 유지
							}
						}
					}
				);
			*/
		// } catch (e) {
		// 	return utilError.errorMSG("Model","times", "updateAthlete", "catch." + e);
		// }	
	}

	// update
	static async updateTimes(body) {
		body.timeID = Number(body.timeID);
		const query = { timeID: body.timeID };
		const result = await mongodb.findOne(mongoCFG.Medalbank.times, query, { _id:0, });
		if (!result.data.timeID) {
			console.log("timeID not found!!!. times.updateTimesbody: ", body);
			return { message: "timeID not found !!!" }
		}

		const times = body.time.trim();
		const time = utilDate.convertString2Timestamp(times);

		let value = {
			timeStamp	: timeStamp,
			time	: time,
		}
		console.log("times.model.updateTimes.query:", query, value);
	
		//----------------------------------------------------------------
		await mongodb.updateOne(mongoCFG.Medalbank.times, query, value);
		//----------------------------------------------------------------

		value = {
			collection: mongoCFG.Medalbank.times,
			id				: body.timeID,
			cmd				: "updateTimes",
			datetime 	: new Date(),
			json 			: {
				timeID				: result.data.timeID,
				gender				: result.data.gender,
				style					: result.data.style,
				distance			: result.data.distance,
				ageGroup			: result.data.ageGroup,
				team					: result.data.team,
				rank					: result.data.rank,
				time					: result.data.time,
				competitionID	: result.data.competitionID,
				status				: result.data.status,
			}
		};
		//----------------------------------------------------------------
		return await mongodb.updateOne(mongoCFG.Medalbank.updateLogs, query, value);
		//----------------------------------------------------------------
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
		await mongodb.updateOne(mongoCFG.Medalbank.times, query, body);
		//----------------------------------------------------------------

		value = {
			collection: mongoCFG.Medalbank.times,
			id				: body.timeID,
			cmd				: "updateTimes",
			datetime 	: new Date(),
			json 			: body
		};
		//----------------------------------------------------------------
		return await mongodb.updateOne(mongoCFG.Medalbank.updateLogs, query, value);
		//----------------------------------------------------------------
	}

//####################################################################
//####################################################################
//####################################################################

	//--------------------------------------------
	//	update athletes: PB, competitions, pools, timekeepers
	//--------------------------------------------
	static async checkAthletePersonalBestOLD(athlete, time) {
		// console.log("checkAthletePersonalBest.body=", time);
		// try {
			athlete.timekeepers = athlete.timekeepers || [];
			athlete.competitions= athlete.competitions || [];
			athlete.pools 			= athlete.pools || [];
			// console.log("athlete=", time);

			//--------------------------------------------
			// timekeeper 추가
			//--------------------------------------------
			if (time.timekeeper && time.timekeeper.athleteID) {
				const timekeeperID = Number(time.timekeeper.athleteID);
				// 같은 athleteID를 가진 객체가 있으면 제거
				athlete.timekeepers = athlete.timekeepers.filter(item => item.athleteID != timekeeperID);
				// athlete 객체를 배열의 0번째에 추가
				athlete.timekeepers.unshift({
					athleteID	: timekeeperID,
					name			: time.timekeeper.name,
				 });
			}

			//--------------------------------------------
			// competition 추가
			//--------------------------------------------
			if (time.competitionID) {
				const competitionID = Number(time.competitionID);
				// 같은 competitionID 가진 객체가 있으면 제거
				athlete.competitions = athlete.competitions.filter(item => item.competitionID != competitionID);
				const competition = memoryDB.getCompetition(competitionID)
				// athlete 객체를 배열의 0번째에 추가
				time.course 	= time.course 	? time.course 	: competition.course;
				time.distance = time.distance ? time.distance : competition.distance;
				athlete.competitions.unshift({
					competitionID	: competitionID,
					course				: time.course,
					distance			: time.distance,
					sido					: competition.sido,
					name					: competition.fullname,
					poolID				: competition.poolID,
				});
			}

			//--------------------------------------------
			// pool 추가
			//--------------------------------------------
			if (time.poolID) {
				const poolID = Number(time.poolID);
				const pool = memoryDB.getPool(poolID);
				// 같은 athleteID를 가진 객체가 있으면 제거
				athlete.pools = athlete.pools.filter(item => item.poolID != poolID);
				time.course 	= time.course 	? time.course 	: pool.course;
				time.distance = time.distance ? time.distance : pool.distance;
				// athlete 객체를 배열의 0번째에 추가
				athlete.pools.unshift({
					poolID	: poolID,
					course	: time.course,
					distance: time.distance,
					sido		: pool.sido,
					name		: pool.fullname
				});
			}

			const pb = {
				style 		: time.style,
				course 		: time.course,
				distance 	: time.distance,
				timeStamp : time.timeStamp,
				time 			: time.time,
				datetime 	: time.datetime,
				poolID 		: time.poolID,
				ageGroup 	: time.ageGroup,
				isOfficial: time.isOfficial,
    		isAdult		: time.isAdult,
			};

			const value = {
				competitions: athlete.competitions,
				pools				: athlete.pools,
				timekeepers	: athlete.timekeepers,
			};
			//--------------------------------------------
			// 2. check & update athletes_medalbank PB.
			//--------------------------------------------
			if (time.type == 'time') {
				const { best, isPB } = this.updateOrInsertRecord(athlete.bestTime ?? [], pb);
				time.isTimePB = isPB;	
				if (isPB) value.bestTime = best;
				value.timeCount = (athlete.timeCount ?? 0) + 1;
			} else {
				const { best, isPB } = this.updateOrInsertRecord(athlete.eventTime ?? [], pb);
				time.isEventPB = isPB;	
				if (isPB) value.eventTime = best;
				value.EventCount = (athlete.EventCount ?? 0) + 1;
			}
			// update athlete
			//--------------------------------------------

			const query = { athleteID: time.athleteID };
			console.log("query=", query, "value=", value);
			//--------------------------------------------
			await mongodb.updateOne(mongoCFG.Medalbank.athletesStatistics, query, value);
			//--------------------------------------------

			return time;
			/*
				// `cid` 및 `tid` 중복 항목을 제거한 후 새 항목을 추가하여 최신 3개만 유지
				await athletes.updateOne(
					{ athleteID: athleteID },
					{
						$pull: {
							competitions: { cid: newCompetition.cid },
							timekeepers: { tid: newTimekeeper.tid }
						},
						$push: {
							competitions: {
								$each: [newCompetition],
								$position: 0, // 배열 맨 앞에 추가
								$slice: 3     // 최신 3개만 유지
							},
							timekeepers: {
								$each: [newTimekeeper],
								$position: 0, // 배열 맨 앞에 추가
								$slice: 3     // 최신 3개만 유지
							}
						}
					}
				);
			*/
		// } catch (e) {
		// 	return utilError.errorMSG("Model","times", "updateAthlete", "catch." + e);
		// }	
	}
//####################################################################
//####################################################################
//####################################################################


	
	/********************************************************************
		*	search names, style
		* '홍길동 박문수 평형 자유형'
		********************************************************************/
	static async searchNamesStyles(body) {
		try {
			// { data: '   문성중      자유형   문성태  평영   ' }
			// normalize data
			let namesStyles = body.data.replace(/\s{2,}/g, ' ').trim().split(' ');
			// namesStyles= [ '문성중', '자유형', '문성태', '평영' ]
			// console.log("searchNamesStyles.body=", body, "namesStyles=", namesStyles);

			// check style
			const queryStyle = [];
			for (const style of swimmingCFG.stylesEngKor) {
				if (namesStyles.includes(style.kor)) {
					queryStyle.push(style.eng);
					namesStyles = namesStyles.filter(element => element !== style.kor);
				}
			}
			// queryStyle= [ 'freestyle', 'breaststroke' ] namesStyles= [ '문성중', '문성태' ]

			const query = {};
			if (queryStyle.length > 0) query.style = { $or: queryStyle };
			if (namesStyles.length > 0) query.name = { $or: namesStyles };
			// query= { style: { '$or': [ 'freestyle', 'breaststroke' ] }, name: { '$or': [ '문성중', '문성태' ] } }
			// console.log("queryStyle=", queryStyle, "namesStyles=", namesStyles, "query=", query);
			console.log("query=", query);
			//----------------------------------------------------------------
			const context = {
				query     : query,
				projection: { _id:0, timeID:1, name:1, gender:1, style:1, distance:1, athleteID:1, competitionID:1, competitionName:1, time:1, times:1, diffs:1, rank:1, ageGroup:1, team:1, poolID:1, pool:1 },
				limit     : 10000,
				sort      : { name:1, gender:1, style:1, team:1 },
			}
			const result = await mongodb.find(mongoCFG.Medalbank.times, query);
			//----------------------------------------------------------------
			result.data = result.data.reduce((arr, time) => {
																const value = {
																	athleteID				: time.athleteID || 0,
																	timeID					: time.timeID || 0,
																	name						: time.name || "",
																	gender					: time.gender || "",
																	ageGroup				: time.ageGroup,
																	style						: time.style || "",
																	distance				: time.distance || "",
																	time						: time.time || "",
																	timeStamp				: time.timeStamp || 0,
																	// diffs						: time.diffs || "",
																	rank						: time.rank,
																	team						: time.team || "",
																	competitionID		: time.competitionID || 0,
																	competitionName	: time.competitionName,
																	pool						: time.pool || "",
																	poolID					: time.poolID || 0,
																}
																arr.push(value);
																return arr;
															}, []);
			return result; 
		} catch (e) {
			return utilError.errorMSG("Model","times", "delete", "catch." + e);
		}
	}
	static async timelistsOld(body) {
		try {
			const norms = await Names.getNames({ type: "name", name: body.name });
			//----------------------------------------------------------------
			const query = {
				// name 		: body.name.trim(),
				// norm 		: { $in: norms.norm },
				norm 		: norms.norm,
				status 	: { $nin: [ "DNS", "DQ", "NT", "실격" ]},
				// status 	: { $nin: [ "DNS", "DQ", "NT", "번외", "실격" ]},
				time 		: { $gt: 0 }, fin: { $exists: false },
				// style		: { $in: ["backstroke", "breaststroke", "butterfly", "freestyle", "individualMedley",] }
			};
			if (body.style		) query.style 	= body.style;
			if (body.distance	) query.distance= body.distance;

			const context = {
				query     : query,
				projection: { _id:0, timeID:1, name:1, gender:1, style:1, distance:1, course:1, time:1, times:1, rank:1, ageGroup:1, pool:1, datetime:1, competitionName:1  },
				limit     : 1000,
				sort      : { style:1, distance:1, time:1 },
			}
			const result = await mongodb.find(mongoCFG.Medalbank.times, context);
			//----------------------------------------------------------------
			if (result.data.length > 0) {

				const times = result.data.filter(time => ["freestyle", "backstroke", "breaststroke", "butterfly", "individualMedley",].includes(time.style));
				result.data = times.reduce((arr, time) => {
														const value = {
															timeID					: time.timeID,
															name						: time.name || "",
															gender					: time.gender || "",
															ageGroup				: time.ageGroup,
															style						: time.style || "",
															distance				: time.distance || "",
															times						: time.times || "",
															course					: time.course == "SCM" ? time.course : "",
															time						: time.time == undefined || time.time == "" || time.time == 0 ? 0.00099 : time.time,
															rank						: time.rank || 0,
															pool						: time.pool || "",
															datetime				: time.datetime || "",
															competitionName	: time.competitionName || "",
														}
														arr.push(value);
														return arr;
													}, []);

				// result.data = sortStyleDistanceTime(result.data);
				result.data = mskCFG.sortGenderStyleDistance(result.data);

				result.data = checkLatestBest(result.data);				
			}
			result.names = norms.names.length > 0 ? norms.names : [body.name];
// console.log("result=", result);
			return result; 
		} catch (e) {
			return utilError.errorMSG("Model","time", "timelists", "catch." + e);
		}
	}
	
	//--------------------------------------------
	// 3. check & update leaderboard_medalbank
	//--------------------------------------------
	static async checkLeaderboard(athlete, PBs) {
		const today = new Date();
		// 3.1 check this year
		const leaderboard = extend(true, PBs.PB, {
			group			: 'year',
			year			: athlete.year,
			athleteID	: athlete.athleteID,
			name			: athlete.name,
			gender		: athlete.gender,
			style			: athlete.style,
			distance	: athlete.distance,
			timeStamp	: athlete.timeStamp,
			time			: athlete.time,
			sido			: athlete.sido,
		});
		const query = {
			group			: 'year',
			year			: today.getFullYear(),
			athleteID	: athlete.athleteID,
			gender		: athlete.gender,
			style			: athlete.style,
			distance	: athlete.distance,
			timeStamp	: { $gt: athlete.timeStamp},
		};
		result = await mongodb.findOne(mongoCFG.Medalbank.leaderboard, query, { _id:0, timeStamp:1,});
		if (result.data.timeStamp < athlete.timeStamp) {
			// await mongodb.insertOne(mongoCFG.Medalbank.leaderboard, athlete);
		}
		console.log("leaderboard.year=", leaderboard);
		// 3.2 check this month
		//--------------------------------------------
		query.group = 'month';
		query.month = today.getMonth() + 1;
		result = await mongodb.findOne(mongoCFG.Medalbank.leaderboard, query, { _id:0, timeStamp:1,});
		if (result.data.timeStamp < athlete.timeStamp) {
			leaderboard.group = 'month';
			leaderboard.month = today.getMonth() + 1;
			// await mongodb.insertOne(mongoCFG.Medalbank.leaderboard, athlete);
		}
		leaderboard.group = 'month';
		leaderboard.month = today.getMonth() + 1;
		console.log("leaderboard.month=", leaderboard);

		//--------------------------------------------
		// 4. check & update times Memory
		//--------------------------------------------
	}
	/*
	*	search names, style, distance, gender
	* names: '홍길동 박문수'
	*/
	static async heatSheets(body) {
		try {
			// { data: '   문성중      자유형   문성태  평영   ' }
			// normalize data
			let namesStyles = body.names.replace(/\s{2,}/g, ' ').trim().split(' ');

			const style = swimmingCFG.stylesEngKor.find(el => el.kor == body.style.trim());
			// const query = {
			// 	course 	: "LCM",
			// 	status 	: { $nin: [ "DNS", "DQ" ]},
			// 	name 		: { $in: namesStyles },
			// 	style		: style ? style.eng : "freestyle",
			// 	distance: body.distance.trim(),
			// };
			const query = {
				// $or: [
				// 	{
				// 		course	: "SCM",
				// 		distance: "25M"
				// 	},
				// 	{						
				// 		course 	: "LCM",
				// 		distance: body.distance.trim(),
				// 	}
				// ],
				course 	: "LCM",
				distance: body.distance.trim(),
				status 	: { $nin: [ "DNS", "DQ" ]},
				name 		: { $in: namesStyles },
				style		: style ? style.eng : "freestyle", fin: { $exists: false },
			};
			if (body.gender) query.gender = body.gender.trim();
			console.log("namesStyles=", namesStyles, "query=", query);

			//----------------------------------------------------------------
			const context = {
				query     : query,
				projection: { _id:0, name:1, gender:1, style:1, distance:1, time:1, times:1, ageGroup:1, pool:1, poolID:1, team:1, datetime:1  },
				// projection: { _id:0, timeID:1, name:1, gender:1, style:1, distance:1, athleteID:1, competitionID:1, competitionName:1, time:1, times:1, diffs:1, rank:1, ageGroup:1, team:1, poolID:1, pool:1 },
				limit     : 1000,
				sort      : { name:1, time:1, ageGroup:1 },
			}
			const result = await mongodb.find(mongoCFG.Medalbank.times, context);
			//----------------------------------------------------------------
			if (result.data.length > 0) {
// console.log("1>result.", result.data);
				result.data = result.data.reduce((arr, time) => {
																	const value = {
																		// athleteID				: time.athleteID || 0,
																		// timeID					: time.timeID || 0,
																		name						: time.name || "",
																		gender					: time.gender || "",
																		ageGroup				: time.ageGroup,
																		style						: time.style || "",
																		distance				: time.distance || "",
																		times						: time.times || "",
																		time						: time.time == undefined || time.time == "" || time.time == 0 ? 0.00099 : time.time,
																		// diffs						: time.diffs || "",
																		// rank						: time.rank,
																		team						: time.team || "",
																		// competitionID		: time.competitionID || 0,
																		// competitionName	: time.competitionName,
																		// pool						: time.pool || "",
																		pool						: memoryDB.getPoolName(time.poolID),
																		// poolID					: time.poolID || 0,
																		datetime				: time.datetime || "",
																	}
																	console.log("--->", time.poolID, memoryDB.getTeamName(time.poolID));
																	arr.push(value);
																	return arr;
																}, []);

				result.data.sort((a, b) => {
					// If last names are the same, compare by firstName
					if (a.name < b.name) return -1;
					if (a.name > b.name) return 1;
					return a.time - b.time;
				})
				console.log("2>result.", result.data);

				result.data = checkHeatLatestBest(result.data);		
				console.log("3>result.", result.data);		
			}

			return result; 
		} catch (e) {
			return utilError.errorMSG("Model","heatsheets", "heatsheets", "catch." + e);
		}
	}
	// 기존 기록 업데이트 또는 새로운 기록 삽입
	static updateOrInsertRecord(pbs, pb) {
		const discipline = `${pb.style}-${pb.distance}`;
		// style, course, distance가 같은 기록을 찾음
		const existingRecord = pbs[discipline];
		let isPB = true;
		if (existingRecord) {
			// 기존 기록이 있고, 새로운 기록이 더 빠른 경우 (timeStamp가 더 작은 경우)
			if (pb.timeStamp < existingRecord.timeStamp) {
				// 기록을 업데이트
				existingRecord.timeStamp = pb.timeStamp;
				existingRecord.time = pb.time;
				existingRecord.datetime = pb.datetime;
				existingRecord.poolID = pb.poolID;
				console.log('Record updated:', existingRecord);
			} else {
				isPB = false;
				console.log('Record exists but no update needed.');
			}
		} else {
			// 기록이 존재하지 않으면 새로운 기록을 삽입
			pbs[discipline] = pb;
			console.log('Record inserted:', pb);
		}
		return { best: pbs, isPB: isPB };
	}
	static updateOrInsertRecordArr(pbs, pb) {
		// style, course, distance가 같은 기록을 찾음
		const existingRecord = pbs.find(record =>
																		record.style 		=== pb.style &&
																		record.course 	=== pb.course &&
																		record.distance === pb.distance
																	);
		let isPB = false;
		if (existingRecord) {
			// 기존 기록이 있고, 새로운 기록이 더 빠른 경우 (timeStamp가 더 작은 경우)
			if (pb.timeStamp < existingRecord.timeStamp) {
				// 기록을 업데이트
				existingRecord.timeStamp = pb.timeStamp;
				existingRecord.time = pb.time;
				existingRecord.datetime = pb.datetime;
				existingRecord.poolID = pb.poolID;
				isPB = true;
				console.log('Record updated:', existingRecord);
			} else {
				console.log('Record exists but no update needed.');
			}
		} else {
			// 기록이 존재하지 않으면 새로운 기록을 삽입
			pbs.push(pb);
			console.log('Record inserted:', pb);
		}
		return { PB: pbs, isPB: isPB };
	}

	// reportTop ????????????????????????????
	static async reportTop(body) {
		try {
			const query = { timeID: Number(timeID) };
			//----------------------------------------------------------------
			return await mongodb.deleteOne(mongoCFG.Medalbank.times, query);
			//----------------------------------------------------------------
		} catch (e) {
			return utilError.errorMSG("Model","times", "delete", "catch." + err);
		}
	}

	static async backendList(body) {
		try {
			const query = { adult: true, masters: true, individual: true, fin: { $exists: false } };
			if (body.completed		) query.athleteID = { $exists: false };
			if (body.name					) query.name = body.name;
			if (body.competitionID) query.competitionID = Number(body.competitionID);
			console.log("query=", query);
			const context = {
				query     : query,
				projection: { _id:0 },
				limit     : 10000,
				sort      : { name:1, gender:1, team:1, style:1 },
			}
			//---------------------------------------------
			const result = await mongodb.find(mongoCFG.Medalbank.times, context);
			//---------------------------------------------
		
			//-----> customizing
			result.data = result.data.map(data => (Customizing.field(data)));
		
			console.log("database.times.backendList.result", result.data.length);
			return result;
			//----------------------------------------------------------------
		} catch (e) {
			return utilError.errorMSG("Model","times", "delete", "catch." + err);
		}
	}

	static async ranking(body) {
		console.log("ranking=", body);
		const page = body.page ? Number(body.page) : 0;
		let skip = (Number(body.page??1)-1)	* limit;

		const start = page <= 1 ? 1 : (page - 1) * limit + 1;
		const query = {
				gender	: body.gender,
				style		: body.style,
				distance: body.distance,
				rank		: { $gte: start },
				rank		: { $lte: start+limit },
			};
		console.log("query=", query, page, limit, start);
		let context = {
			query			: query,
			projection: { _id:0, },
			limit			: body.limit ? Number(body.limit) + 10 : timsLimit + 10,
			skip			: 0,
			// limit			: body.limit ? Number(body.limit) + 10 : timsLimit + 10,
			// skip			: body.skip ? Number(body.skip) : 0,
			sort			: { gender:1, style:1, distance:1, time:1 },
		}
		//----------------------------------------------------------------
		const result = await mongodb.find(mongoCFG.Medalbank.leaderboard, context)
		//----------------------------------------------------------------console.log("rankings=", result.data.length);
		const competitionIDs = [...new Set(result.data.map((item) => item["competitionID"]).map(entry => entry))]
	
		context = {
			query			: { competitionID: { $in: competitionIDs }},
			projection: { _id:0, competitionID:1, fullname:1, pool:1, },
			limit			: 100,
			skip			: 0,
		}
		const competitions = await mongodb.find(mongoCFG.Medalbank.competitions, context )
		//----------------------------------------------------------------

		result.data = result.data.filter(time => time.rank <= context.limit)
															.reduce((arr, time) => {
																const comp = competitions.data.filter(comp => comp.competitionID == time.competitionID);
																const value = {
																	athleteID				: time.athleteID,
																	name						: time.name || "",
																	competitionName	: comp[0].fullname,
																	time						: time.time || "",
																	diffs						: time.diffs || "",
																	rank						: time.rank,
																	rankGroup				: time.rankGroup,
																	team						: time.team || "",
																	pool						: comp[0].pool || "",
																}
																arr.push(value);
																return arr;
															}, []);  
		return result;													
	}

	static async rankingTopN(body) {
		let context = {
			query			: { rank: { $lte: body.limit } },
			projection: { _id:0, },
			limit			: 5000,
			skip			: 0,
			sort			: { gender:1, style:1, distance:1, time:1 },
		}
		console.log( "query=", context.query);
		//----------------------------------------------------------------
		const result = await mongodb.find(mongoCFG.Medalbank.leaderboard, context)
		//----------------------------------------------------------------console.log("rankings=", result.data.length);
		const competitionIDs = [...new Set(result.data.map((item) => item["competitionID"]).map(entry => entry))]
	
		context = {
			query			: { competitionID: { $in: competitionIDs }},
			projection: { _id:0, competitionID:1, fullname:1, pool:1, },
			limit			: 100,
			skip			: 0,
		}
		const competitions = await mongodb.find(mongoCFG.Medalbank.competitions, context )
		//----------------------------------------------------------------

		const _rankingOBJ = result.data.filter(time => time.rank <= context.limit)
																		.reduce((obj, time) => {
																			const comp = competitions.data.filter(comp => comp.competitionID == time.competitionID);
																			const value = {
																				athleteID				: time.athleteID,
																				name						: time.name || "",
																				competitionName	: comp[0].fullname,
																				time						: time.time || "",
																				gender					: time.gender,
																				rank						: time.rank,
																				style						: time.style,
																				distance				: time.distance,
																				team						: time.team || "",
																			}
																			const discipline = `${time.gender}-${time.style}-${time.distance}`;
																			if (!obj[discipline]) obj[discipline] = [];
																			obj[discipline].push(value);
																			return obj;
																		}, {});
																
		let _rankings = [];
		for (const style of swimmingCFG.styles) {
			for (const gender of swimmingCFG.genders) {
				for (const distance of swimmingCFG.distances) {
					const discipline = `${gender}-${style}-${distance}`;
					if (_rankingOBJ[discipline]) {
						_rankings = [ ..._rankings, ..._rankingOBJ[discipline].slice(0, 8) ]; 
					}
				}    
			}  
		}
		return { message:'', data: _rankings };													
	}

	static async medalists(rank=3) {
		console.log("medalists.rank=", rank);
		const query = {
			competitionID: { $exists:true },
			rank: { $lte: rank },
			deleted: { $exists: false },
			$or: [
				{ style: { $in: ["freestyle", "backstroke", "breaststroke", "butterfly"] }, distance: { $in: ["50M", "100M"] }},
				{ style: "individualMedley", distance: "200M" },
			]
		}

		const aggregate = [
			{$match: query },
			{ $sort: { timeStamp: 1 }// 기록이 좋은 순서로 정렬
			},
			{ $group: { // gender, style, distance, name 조합에서 가장 좋은 기록을 선택
					_id: {
						gender	: "$gender",
						style		: "$style",
						// course	: "$course",
						distance: "$distance",
						name		: "$name"
					},
					bestRecord: {
						$first: {
							athleteID	: "$athleteID",
							name			: "$name",
							rank			: "$rank",	
							time			: "$time",
							datetime	: "$datetime",
							// competitionID: "$competitionID"
						}
					}
				}
			},
			{ $group: { // gender, style, distance별로 그룹화하여 각 조합의 모든 최상위 기록
					_id: {
						gender	: "$_id.gender",
						style		: "$_id.style",
						// course	: "$_id.course",
						distance: "$_id.distance"
					},
					topTimes: {
						$push: "$bestRecord"
					}
				}
			},
			{ $project: { // 그룹의 topTimes 배열에서 상위 3개의 기록만 반환
					style		: "$_id.style",
					gender	: "$_id.gender",
					// course	: "$_id.course",
					distance: "$_id.distance",
					_id			: 0,
					times		: { $slice: ["$topTimes", 3] } // 각 그룹에서 상위 3개만 가져옴
				}
			}
		];

		//----------------------------------------------------------------
		const result = await mongodb.aggregate(mongoCFG.Medalbank.leaderboard, aggregate)
		//----------------------------------------------------------------
// console.log("medallist.result.", result.data);
		return { message: '', data: mskCFG.sortGenderStyleDistance(result.data) };
	}
	// static sortGenderStyleDistance(times) {
	// 	// 정렬 우선순위 정의
	// 	const genderOrder = ["men", "women", "mixed"];
	// 	const styleOrder = ["freestyle", "backstroke", "breaststroke", "butterfly", "individualMedley"];
	// 	// const courseOrder = []; // "SCM", "SCM"];
	// 	const distanceOrder = ["25M", "50M", "100M"];

	// 	// 정렬 함수 적용
	// 	times.sort((a, b) => {
	// 		const genderComparison = genderOrder.indexOf(a.gender) - genderOrder.indexOf(b.gender);
	// 		if (genderComparison !== 0) return genderComparison;

	// 		const styleComparison = styleOrder.indexOf(a.style) - styleOrder.indexOf(b.style);
	// 		if (styleComparison !== 0) return styleComparison;

	// 		// const courseComparison = courseOrder.indexOf(a.course) - styleOrder.indexOf(b.course);
	// 		// if (courseComparison !== 0) return courseComparison;

	// 		return distanceOrder.indexOf(a.distance) - distanceOrder.indexOf(b.distance);
	// 	});
	// 	return { message: "", data: times };
	// }
	// static sortGenderStyleCourseDistance(times) {
	// 	// 정렬 우선순위 정의
	// 	const genderOrder = ["men", "women", "mixed"];
	// 	const styleOrder = ["freestyle", "backstroke", "breaststroke", "butterfly", "individualMedley"];
	// 	const courseOrder = []; // "SCM", "SCM"];
	// 	const distanceOrder = ["25M", "50M", "100M"];

	// 	// 정렬 함수 적용
	// 	times.sort((a, b) => {
	// 		const genderComparison = genderOrder.indexOf(a.gender) - genderOrder.indexOf(b.gender);
	// 		if (genderComparison !== 0) return genderComparison;

	// 		const styleComparison = styleOrder.indexOf(a.style) - styleOrder.indexOf(b.style);
	// 		if (styleComparison !== 0) return styleComparison;

	// 		const courseComparison = courseOrder.indexOf(a.course) - styleOrder.indexOf(b.course);
	// 		if (courseComparison !== 0) return courseComparison;

	// 		return distanceOrder.indexOf(a.distance) - distanceOrder.indexOf(b.distance);
	// 	});
	// 	return { message: "", data: times };
	// }

	static async records() {
		let context = {
			query			: {},
			projection: { _id:0, style:1, distance:1, gender:1, times:1, rank:1, datetime:1, name:1, team:1 },
			limit			: 5000,
			skip			: 0,
			sort			: { gender:1, style:1, distance:1, time:1 },
		}
		console.log( "query=", context.query);
		//----------------------------------------------------------------
		const records = await mongodb.find(mongoCFG.Medalbank.records, context)
		
		const query = {
			rank: { $lte: 1 },
			$or: [
				{ style: "freestyle", distance: { $ne: "25M" }},
				{ style: { $in: ["backstroke", "breaststroke", "butterfly"] }, distance: { $in: ["50M", "100M", "200M", "400M", "800M", "1500M"] }},
				{ style: "individualMedley", distance: { $in: ["200M", "400M"] }},
				{ style: { $in: ["freestyleRelay", "medleyRelay"] }, distance: { $in: ["200M", "400M", "800M", "1500M"] }},
			]
		}
		context = {
			query			: query,
			projection: { _id:0, style:1, distance:1, gender:1, time:1, rank:1, datetime:1, name:1, team:1 },
			limit			: 5000,
			skip			: 0,
			sort			: { gender:1, style:1, distance:1, time:1 },
		}
		console.log( "query=", context.query);
		//----------------------------------------------------------------
		let result = await mongodb.find(mongoCFG.Medalbank.leaderboard, context)
		// const result = await this.medalists(1);		

		result = this.customSort(result.data);

		const rankingOBJ = {};
		for (const ranking of result.data) {
			const styleDistance = `${ranking.style}-${ranking.distance}`;
			if (!rankingOBJ[styleDistance]) rankingOBJ[styleDistance] = { style: ranking.style, distance: ranking.distance, };
			if (!ranking.men) ranking.men = [{ name:"", time:"", rank:0, datetime:"" }];
			if (!ranking.women) ranking.women = [{ name:"", time:"", rank:0, datetime:"" }];
			console.log("====>", ranking);
			rankingOBJ[styleDistance].masters = { men: ranking.men[0], women: ranking.women[0] }
		}

		const type = ["", "KR", "AR", "OR", "WR"];
		for (const ranking of records.data) {
			const styleDistance = `${ranking.style}-${ranking.distance}`;
			if (!rankingOBJ[styleDistance]) continue;
			if (!rankingOBJ[styleDistance][type[ranking.rank]]) rankingOBJ[styleDistance][type[ranking.rank]]  = { men: {}, women: {} };
			rankingOBJ[styleDistance][type[ranking.rank]][ranking.gender] = {
				name		: ranking.style.includes("Relay") ? ranking.team : ranking.name,
				time		: ranking.time,
				rank		: ranking.rank,
				datetime: typeof ranking.datetime == "string" ? ranking.datetime : ranking.datetime.toISOString().slice(0, 10),
			};
		}
		return { message: "", data: Object.values(rankingOBJ) };
	}

	static loadStatics	 = (async (body) => MemoryUTIL.loadStatics());

	static loadTeams		 = (async (body) => MemoryUTIL.loadTeams(body));

	static leaderboards	 = (async (body) => MemoryUTIL.getLeaderboard(body.limit));

	/*
	*
	*/
	backendList = async (body) => {
		console.log("---> database.times.backendList.body", body);
		let returnObj = { message: "", data: [] };

		const query = { adult: true, masters: true, individual: true };
		if (body.completed) query.athleteID = { $exists: false };
		if (body.name) query.name = body.name;
		if (body.competitionID) query.competitionID = Number(body.competitionID);
		console.log("query=", query);
		const context = {
			query     : query,
			projection: { _id:0 },
			limit     : 10000,
			sort      : { name:1, gender:1, team:1, style:1 },
		}
		//---------------------------------------------
		let result = await this.list(context);
		//---------------------------------------------

		returnObj.count = result.count;
		//-----> customizing
		returnObj.data = result.data.map(data => (Customizing.customizing(data)));

		console.log("database.times.backendList.result", returnObj.data.length);
		return returnObj;
	}

	//
	//  { gender, style, distance, name }
	//
	static searchRanking = async (body) => {
		console.log("times.searchRanking.body=", body);
		let returnObj = { message: "", data: [] };
		const limit = body.limit ? Number(body.limit) : 100;
		let times = {};
		let rank = 0;
		let checkRank = -1;
		
		if (body.athlete) {
			const context = {
				query			: { name: body.athlete.trim(), style: body.style, gender: body.gender, distance:body.distance },
				projection: {_id:0, athleteID:1, name:1, times:1,diffs:1, rank:1, rankGroup:1, team:1, },
				skip			: 0,
				limit			: limit,
			}
			times = await mongodb.find(mongoCFG.Medalbank.leaderboard,context);
		} else {
			if (/^\d+$/.test(body.ranking)) {
				console.log(`${body.ranking} is an integer`);
				// ranking 538 -> -50 ~
				checkRank = Number(body.ranking);
				rank = checkRank - parseInt(limit / 2);
				if (rank < 0) rank = 1;
				const context = {
					query			: { rank:{ $gte: rank }, style: body.style, gender: body.gender, distance:body.distance },
					projection: {_id:0, athleteID:1, name:1, times:1,diffs:1, rank:1, rankGroup:1, team:1, },
					skip			: 0,
					limit			: limit,
				}
				times = await mongodb.find(mongoCFG.Medalbank.leaderboard,context);

			} else {
				const timeStr = customTimes(body.ranking);
				const time = utilDate.convertString2Timestamp(timeStr);
				const context = {
					query			: { time:{ $gte: time }, style: body.style, gender: body.gender, distance:body.distance },
					projection: {_id:0, athleteID:1, name:1, times:1,diffs:1, rank:1, rankGroup:1, team:1, },
					skip			: 0,
					limit			: 20,
				}
				const timesAfter = await mongodb.find(mongoCFG.Medalbank.leaderboard,context);
				checkRank = timesAfter.data[0].rank;
				context.query.timeStamp = { $lt: time };
				context.sort = { rank:-1 };
				const timesBefore = await mongodb.find(mongoCFG.Medalbank.leaderboard,context);
				times.data = [ ...timesBefore.data, ...timesAfter.data].sort((a,b)=> a.timeStamp-b.timeStamp);
			}
		}

		const timeArr = [];
		for (const tm of times.data) {
			const value = {
				athleteID				: tm.athleteID,
				name						: tm.name || "",
				// competitionName	: tm.competitionName || "",
				time						: tm.time || "",
				diffs						: tm.diffs || "",
				rank						: tm.rank,
				rankGroup				: tm.rankGroup,
				team						: tm.team || "",
				// pool						: this.getPool(tm.poolID).fullname,
			}
			if (checkRank >= 0 && tm.rank == checkRank) {
				value.check = true;
			}
			timeArr.push(value);
		}
// console.log(timeArr);
		return { data: timeArr };
	}






	static async listOld(query, body) {
		const skip = body.skip ? Number(body.skip)*timsLimit : 0;
		const aggregate = [
			{ $match: query },
			{ $lookup:{
					from				: mongoCFG.Medalbank.competitions,
					localField	: "competitionID",
					foreignField: "competitionID",
					as					: "competitions"
				}
			},
			{ $sort: sort },
			{ $limit: timsLimit },
			{ $skip: skip },
			{ $project: project1
			},
			{ $project: project2
			}
		];
		//----------------------------------------------------------------
		const result = await mongodb.aggregate(mongoCFG.Medalbank.times, aggregate);
		//----------------------------------------------------------------
		// console.log("query=", query, "result=", result.data.length);
		result.count = result.count;
		//-----> customizing
		result.data = result.data.map(data => (Customizing.customizing(data)));
		return result;
	}
	// insert
	static async insert(body) {
		const value = Customizing.field(body);
	console.log("times.insert.value=", value);
		//----------------------------------------------------------------
		if (value.name) {
			value.nameHide = utilLibrary.nameHide(value.name);

			value.names = value.name.split(',');
			value.namesHide = [];
			for (const name of value.names) {
				value.namesHide.push(utilLibrary.nameHide(name));
			}
		}
		body.timeID = await mongodb.max(mongoCFG.Medalbank.times, "timeID", {}); // query, db
		return await mongodb.insertOne(mongoCFG.Medalbank.times, value);
		//----------------------------------------------------------------
	}
	// update
	static async update(body) {
		if (Object.keys(body).length < 2) return utilError.errorMSG("Model","times", "update", "field not found");
		const value = Customizing.field(body);
		const query = { timeID: value.timeID };

		delete value.timeID;
		
		if (value.name) {
			value.nameHide = utilLibrary.nameHide(value.name);

			value.names = value.name.split(',');
			value.namesHide = [];
			for (const name of value.names) {
				value.namesHide.push(utilLibrary.nameHide(name));
			}
		}
	
		//----------------------------------------------------------------
		return await mongodb.updateOne(mongoCFG.Medalbank.times, query, value);
		//----------------------------------------------------------------
	}

  // update status to delete
  static async updateDelete(timeID, athleteID) {
    const query = { timeID: Number(timeID), athleteID: Number(athleteID) };
		const value = {
      status  : 'deleted',
      deleted : new Date(),
    }
	
		//----------------------------------------------------------------
		returnObj = await mongodb.updateOne(mongoCFG.Medalbank.times, query, value);
		//----------------------------------------------------------------

    return returnObj;
  }

}

module.exports = TimeModel;

