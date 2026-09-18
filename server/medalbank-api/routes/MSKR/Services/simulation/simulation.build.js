const fs          = require('fs');
const mskCFG 		  = require('../../Config/mskCFG');
const mongoCFG 		= require('../../Config/mongoCFG');
const mongoDB			= require('../../Class/MongoDB');
const utilLibrary = require("../../Class/utilLibrary");
const UtilDate    = require("../../Util/utilDate");
const readDAO					= require("../importTimes/readDAO");
const checkDAO				= require("../importTimes/checkDAO");

const utilDate	  = new UtilDate();
const mongodb 	  = new mongoDB(mongoCFG.Medalbank.database);

// const { grouppingRanking } = require('../import/extraInfo/buildRankingsDAO');
const { grouppingRanking } = require('../importTimes/importUTIL/buildImportDAO');
const { getCompetition } = require('../competitions/competitions.routes');
const excelDAO		= require("../importTimes/importUTIL/excelDAO");
const { Config }  = require('../importTimes/importUTIL/config');
const Customizing = require('../times/times.custom');

const MemoryDB 		= require('../../Class/MemoryDB');
const memoryDB		= new MemoryDB();
const TimeModel    = require("../times/times.model");


class SimulationModel {
	// build simulation
	static async build(body) {
		body.id = body.id.toString();
		const competitionID = Number(body.id);

		console.log(`database.importTime.simulation.body=`, body);
		const returnObj = { message: "", data: [] };

		//-----> read excel file
		const excelTimes = await readDAO.read(body);
		console.log("simulation.excelTimes=", excelTimes.data.slice(0,3));

		//-----> get unique names
		const names = excelTimes.data.map(time => time.name);
		let uniqueNames = [...new Set(names)]
		console.log("names=", names.length, uniqueNames.length);

		//-----> get times by names
		// const medalbankTimes1 = await TimeModel.searchNames({ name: uniqueNames.join(',') });
		// console.log("times for names=", medalbankTimes1.data.slice(0,2), medalbankTimes1.data.length);

		const query = {
			name			: { $in: uniqueNames },
			$or				: [ {status: ""}, { status: { $exists: false }}],
			timeStamp	: { $gt: 0 }, 
			fin				: { $exists: false }
		};
		const aggregate = [
			{ $match: query },
			{ $sort: { timeStamp: 1 } }, // 낮은 기록이 먼저 오도록 정렬
			{ $group: {
					_id: {
						name    : "$name",
						gender  : "$gender",
						style   : "$style",
						distance: "$distance",
						isAdult : "$isAdult",
					},
					best: { $first: "$$ROOT" } // 그룹별 가장 첫 번째 기록 = 최소값
				}
			},
			{ $replaceRoot: { newRoot: "$best" } },// best 필드를 최상위로 평탄화
			{ $project: { _id:0, } },
		]
	
		//----------------------------------------------------------------
		const medalbankTimes = await mongodb.aggregate(mongoCFG.Medalbank.times, aggregate);
	//----------------------------------------------------------------
		console.log("times for names=", medalbankTimes.data.slice(0,2), medalbankTimes.data.length);
		


		//-----> 대진표에 개인별 기혹 merge
		const uniqueTimes = await mergeTimes(competitionID, excelTimes.data, medalbankTimes.data);

		//-----> sort
		const sortedTimes = sortAndRankTimes(uniqueTimes);
		console.log("------>", sortedTimes.length, uniqueTimes.length);

		// let str = "medalbankTimes\n";
		// const index = medalbankTimes.data.filter(time => time.name == "주미애");
		// if (index) {
		// 	console.log("~~~~~~~~2:", index);
		// 	for (const tm of index) {
		// 		str += `${tm.name}\t${tm.isAdult}\t${tm.ageGroup}\t${tm.gender}\t${tm.style}\t${tm.course}\t${tm.distance}\t${tm.time}\n`;
		// 	}
		// }
		// const index0 = uniqueTimes.filter(time => time.name == "주미애");
		// if (index0) {
		// 	str += "uniqueTimes\n";
		// 	console.log("~~~~~~~~2:", index0);
		// 	for (const tm of index0) {
		// 		str += `${tm.name}\t${tm.isAdult}\t${tm.ageGroup}\t${tm.gender}\t${tm.style}\t${tm.course}\t${tm.distance}\t${tm.time}\n`;
		// 	}
		// }
		// const index1 = sortedTimes.filter(time => time.name == "주미애");
		// if (index1) {
		// 	str += "sortedTimes\n";
		// 	console.log("~~~~~~~~2:", index1);
		// 	for (const tm of index1) {
		// 		str += `${tm.name}\t${tm.isAdult}\t${tm.ageGroup}\t${tm.gender}\t${tm.style}\t${tm.course}\t${tm.distance}\t${tm.time}\n`;
		// 	}
		// }
		// console.log(str)
		// fs.writeFileSync("./times.log", str);




		//-----> delete simulations DB
		let result = await mongodb.deleteMany(mongoCFG.Medalbank.timesSimulation, { competitionID: competitionID });
		console.log("delete=", result);

		//-----> insert sortedTimes to simulations DB
		if (sortedTimes.length > 0) {
			result = await mongodb.insertMany(mongoCFG.Medalbank.timesSimulation, sortedTimes);
			console.log("insertMany=", result);
		}

		return { message:'', data: sortedTimes }
	}
	// build simulation
	static async buildOLD(body) {
		body.id = body.id.toString();
		const competitionID = Number(body.id);

		console.log(`database.importTime.simulation.body=`, body);
		const returnObj = { message: "", data: [] };

		//-----> read excel file
		const excelTimes = await readDAO.read(body);
		console.log("simulation.excelTimes=", excelTimes.data.slice(0,3));

		//-----> get unique names
		const names = excelTimes.data.map(time => time.name);
		let uniqueNames = [...new Set(names)]
		console.log("names=", names.length, uniqueNames.length);

		//-----> get times by names
		const medalbankTimes = await TimeModel.searchNames({ name: uniqueNames.join(',') });
		console.log("times for names=", medalbankTimes.data.slice(0,2), medalbankTimes.data.length);
		const index = medalbankTimes.find(time => time.name == "김지은");
		if (index) {
			console.log("~~~~~~~~1:", index);
		}

		//-----> 대진표에 개인별 기혹 merge
		const uniqueTimes = await mergeTimes(competitionID, excelTimes.data, medalbankTimes.data);
		const index0 = uniqueTimes.find(time => time.name == "김지은");
		if (index0) {
			console.log("~~~~~~~~2:", index0);
		}

		//-----> sort
		const sortedTimes = sortAndRankTimes(uniqueTimes);
		console.log("------>", sortedTimes.length, uniqueTimes.length);
		const index1 = sortedTimes.find(time => time.name == "김지은");
		if (index1) {
			console.log("~~~~~~~~3:", index1);
		}

		//-----> delete simulations DB
		let result = await mongodb.deleteMany(mongoCFG.Medalbank.timesSimulation, { competitionID: competitionID });
		// console.log("delete=", result);

		//-----> insert sortedTimes to simulations DB
		if (sortedTimes.length > 0) {
			result = await mongodb.insertMany(mongoCFG.Medalbank.timesSimulation, sortedTimes);
			// console.log("delete=", result);
		}

		return { message:'', data: sortedTimes }
	}
}
function isAdult(ageGroup) {
	const juniorGroup = [
		"유년",
		"유아",
		"유치",
		"초등",
		"중학",
		"중등",
		"고등",
		"중고등",
		"학생",
	];
	const arr = ageGroup.replace(/   /gi, ' ').replace(/  /gi, ' ').replace(/  /gi, ' ').split(' ');
	for (const group of arr) {
		const isJunior = juniorGroup.some(junior => group.includes(junior));
		if (isJunior) return false;
	}
	return true;
}
//---------------------------------------------
//-----> 대진표에 개인별 기혹 merge
//---------------------------------------------
async function mergeTimes(competitionID, excelTimes, medalbankTimes) {
	excelTimes.forEach(time => {
		const check = isAdult(time.ageGroup)
		time.isAdult = check;
	});
	const junior = excelTimes.filter(time => !time.isAdult);
	// console.log(junior);

	let timeID = await mongodb.max(mongoCFG.Medalbank.timesSimulation, "timeID");
	//-----> 조별 excelTimes에 기록 추가
	const uniqueTimes = [];
	for (const time of excelTimes) {
		if (time.name == "신시우") {
			console.log(time);
		}
		// const tm = medalbankTimes.find(tm => tm.name 		== time.name && 
		// 														tm.gender 	== time.gender && 
		// 														tm.style 		== time.style && 
		// 														tm.distance	== time.distance
		// 											);
		const tm = medalbankTimes.find(tm => tm.name 		== time.name && 
																tm.gender 	== time.gender && 
																tm.style 		== time.style && 
																tm.distance	== time.distance && 
																tm.isAdult 	== time.isAdult
													);
		const value = {
			competitionID	: competitionID,
			name					: time.name,
			nameHide			: utilLibrary.nameHideAll(time.name),
			ageGroup			: time.ageGroup,
			gender				: time.gender,
			style					: time.style,
			course				: time.course,
			distance			: time.distance,
			isMasters			: time.isMasters || true,
			isAdult 			: time.isAdult || true,
			time					: time.time,
		}
		value.timeID = timeID.timeID ? time.timeID : timeID++;
		if (tm) {
			const competition = memoryDB.getCompetition(tm.competitionID)
			value.time 						= tm.time || '';
			value.timeStamp 			= tm.timeStamp || 0.0;
			// value.ageGroup 		= tm.ageGroup || '';
			value.athleteID 			= tm.athleteID || 0;	
			// value.competitionID		= tm.competitionID ?? 0;	
			// value.competitionName	= tm.competitionName ?? '';	
			value.team 						= competition.team ?? '';	
			value.rank 						= tm.rank;
			value.type 						= tm.type || '';
			value.datetime 				= tm.datetime || '';
			value.status 					= tm.status || '';

			// value.stemID 				= competition.stemID ?? 0;	
			// value.stem 					= competition.stem ?? '';	
			value.poolID 				= competition.poolID ?? 0;	
			value.pool 					= competition.pool ?? '';	
		}
		uniqueTimes.push(value);
	}

	// console.log(uniqueTimes.slice(0, 10));
	// console.log(uniqueTimes.slice(0, 10));
	
	return uniqueTimes;
}

/**
 * 시간 데이터를 분류하고 정렬하여 랭킹을 부여하는 함수
 * @param {Array} times - 시간 데이터 배열 ({timeID, name, ageGroup, gender, style, course, distance, timeStamp} 형식)
 * @returns {Array} - 랭킹이 부여된 시간 데이터
 */
function sortAndRankTimes(times) {
  if (!Array.isArray(times) || times.length === 0) {
    return [];
  }

  // 결과를 저장할 객체
  const result = [];
  
  // 카테고리별로 그룹화
  const categories = {};
  
  // 시간 데이터를 카테고리별로 분류
  times.forEach(time => {
    // 필수 필드 확인
    // if (!time.ageGroup || !time.gender || !time.style || !time.course || !time.distance) {
    if (!time.ageGroup || !time.gender || !time.style || !time.distance || !time.isAdult) {
      console.warn('Missing required fields:', time);
      return;
    }
    
    // 카테고리 키 생성 (ageGroup-gender-style-course-distance)
    const categoryKey = `${time.ageGroup}-${time.gender}-${time.style}-${time.distance}-${time.isAdult}`;
    
    if (!categories[categoryKey]) {
      categories[categoryKey] = [];
    }
    
    categories[categoryKey].push({
      ...time,
      categoryKey // 나중에 결과 식별용
    });
  });
  
  // 각 카테고리별로 정렬 및 랭킹 부여
  Object.keys(categories).forEach(categoryKey => {
    const categoryTimes = categories[categoryKey];
    
    // timeStamp = 0인 항목과 그렇지 않은 항목 분리
    const validTimes = categoryTimes.filter(time => time.timeStamp && time.timeStamp > 0);
    const zeroTimes = categoryTimes.filter(time => !time.timeStamp || time.timeStamp === 0);
    
    // timeStamp로 정렬 (오름차순)
    validTimes.sort((a, b) => a.timeStamp - b.timeStamp);
    
    // 랭킹 부여
    let currentRank = 1;
    let previousTimeStamp = -1;
    
    validTimes.forEach((time, index) => {
      // 이전 timeStamp와 같으면 같은 랭킹 부여
      if (index > 0 && time.timeStamp === previousTimeStamp) {
        time.rank = validTimes[index - 1].rank;
      } else {
        time.rank = currentRank;
      }
      
      currentRank++;
      previousTimeStamp = time.timeStamp;
			delete time.categoryKey;
      
      result.push(time);
    });
    
    // timeStamp = 0인 항목은 랭킹 없이 결과에 추가
    zeroTimes.forEach(time => {
      time.rank = ''; // 랭킹 없음
      result.push(time);
    });
  });
  
  return result;
}

module.exports = SimulationModel;

