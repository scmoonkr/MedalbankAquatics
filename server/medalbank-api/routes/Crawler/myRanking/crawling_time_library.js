const extend 			= require('node.extend');
const fs 					= require('fs');
const mongoDB     = require('../../MSKR/Class/MongoDB');
const mongoCFG    = require('../../MSKR/Config/mongoCFG.js');
const mongodb 	  = new mongoDB(mongoCFG.Medalbank.database);

const UtilDate    = require("../../MSKR/Util/utilDate");
// const { competitionsTable }    = require("./competitions.table");
const { competitionTable } = require('../../Work/MergeDB/competitionTable');
const utilDate	  = new UtilDate();

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

//==============================================
//	load competitions
//==============================================
exports.loadCompetitions = async () => {
	//-----> mongoDB의 같은 이름 times가져오기
	// const context = {
	// 	query 		: {},
	// 	projection: { _id:0, },
	// 	skip 			: 0,
	// 	limit 		: 10000,
	// }
	// const result = await mongodb.find(mongoCFG.Medalbank.myRankingCompetitions, context)
	// _competitions = extend(true, result.data);
	return competitionTable;
}

//==============================================
//	check junior / adult
//==============================================
exports.checkJunior = (ageGroup) => {
	const arr = ageGroup.replace(/   /gi, ' ').replace(/  /gi, ' ').replace(/  /gi, ' ').split(' ');
	for (const group of arr) {
		const isJunior = juniorGroup.some(junior => group.includes(junior));
		if (isJunior) return true;
	}
	return false;
}
//==============================================
//	get crawling names: names.txt
//==============================================
exports.getNames4Crawling = async () => {
	let names = [];
	let namesText = fs.readFileSync("./names.txt", "utf8")
		
	// const resultTimes = await mongodb.distinct("times", "norm")
	// const result = await mongodb.distinct("myRankingNames_20240809", "name")
	const skipNames = await mongodb.distinct(mongoCFG.Medalbank.myRankingTimes, "name")

	console.log("skipNames=", skipNames.data.length, skipNames.data.slice(0, 10));
	// name 배열에서 newName 배열에 있는 이름을 제거
	namesText = namesText.split("\r\n");
	console.log("namesText=", namesText.length);
  const filteredNames = namesText.filter(item =>
																		!skipNames.data.some(newItem => newItem === item)
																	);
	console.log("filteredNames=", filteredNames.length, filteredNames.slice(0, 10));

	let norm;
	for (const name of filteredNames) {
		if (name.includes("(")) {
			const arr = name.split("(");
			names.push(arr[0]);
			continue;
		}
		norm = name.replace(/ /gi, '');
		if (norm.length <= 4) {
			names.push(norm);
		} else {
			norm = name.replace(/  /gi, " ").replace(/  /gi, " ").replace("  ", " ");
			names.push(norm);
			const arr = norm.split(' ');
			arr.forEach(nm => {
				if (nm.length > 2) names.push(nm);
			});
		}
	}

	console.log("bf skip source names: ", names.length);
	names = names.filter(name =>! skipNames.data.find(skip=>skip==name));

	console.log("af skip source names: ", names.length);

	const uniqueNames = [...new Set(names)];

	return uniqueNames;
}

//==============================================
//	gdelete 같은 선수 기록
//==============================================
exports.deleteSameTime = async (crawlingTimes) => {

		//-----> mongoDB의 같은 이름 times가져오기
		const context = {
			query 		: { name: data },
			projection: { _id:0, },
			skip 			: 0,
			limit 		: 10000,
		}
		const mongoTimes = await mongodb.find(mongoCFG.Medalbank.myRankingTimes, context)
		// console.log(mongoTimes.data);
		
		const filteredTimes = mongoTimes.data.filter(timeEntry => {
			return !crawlingTimes.some(newTimeEntry => 
															// newTimeEntry.name === timeEntry.name && // name: 윤OO
															newTimeEntry.team === timeEntry.team &&
															newTimeEntry.ageGroup === timeEntry.ageGroup &&
															newTimeEntry.gender === timeEntry.gender &&
															newTimeEntry.style === timeEntry.style &&
															newTimeEntry.distance === timeEntry.distance &&
															newTimeEntry.rank === timeEntry.rank &&
															newTimeEntry.times === timeEntry.times
														);
													});
	console.log("filteredTimes:", filteredTimes.length);
	return filteredTimes;
}

//==============================================
//	time을 customizing하고 insert
//==============================================
exports.customTime = (time) => {
  if (time.slice(0,3) == "00:") time = time.slice(3);
  if (time.slice(0,3) == "00:") time = time.slice(3);
  if (time.slice(0,1) == "0") time = time.slice(1);
  if (time.slice(0,1) == ":") time = time.slice(1);
  if (time == "0.00") time = '';
  return time;
}
exports.customAndInsertTimesNew = async (crawlingTimes, name) => {
	// check no data
	if (crawlingTimes.length == 0) return 0;

	// check 1st char
	let check = false;
	const firstChar = name.slice(0, 1)
	for (const time of crawlingTimes) {
		// check 단체가 아니고 이름 첫자가 다르면 다른 선수로 간주
		if (time.name.split(',').length < 3 && firstChar != time.name.slice(0, 1)) {
			console.log("다른이름 검색: name:", name, "searched:", time.name);
			check = true;
			break;
		}
		//-------------------------------------------
	//-----> check junior / adult
	//-------------------------------------------
		time.isAdult = ! this.checkJunior(time.ageGroup);
		//-------------------------------------------
	}

	let filteredTimes = crawlingTimes;

	//-------------------------------------------
	//-----> customizing times
	//-------------------------------------------
	const times = await this.customizingTimes(crawlingTimes, name);	

	const context = {
		query			: { name: name },
		projection: { _id:0, },
		limit			: 10000,
		skip			: 0,
	};
	const mongoTimes = await mongodb.find("myRankingTimes", context, "Crawling");
	
	//-------------------------------------------
	//-----> check duplicate times
	//-------------------------------------------
		let exists = 0;
		const timeArr = times.reduce((arr, data) => {
																	const time = this.customTime(data.time);
																	const isExists = mongoTimes.data.find(tm => tm.name  == data.name
																																				&& tm.gender   == data.gender
																																				&& tm.style    == data.style
																																				&& tm.distance == data.distance
																																				&& tm.isAdult  == data.isAdult
																																				&& tm.isMasters == data.isMasters
																																				// && tm.timeStamp== data.timeStamp
																																				&& this.customTime(tm.time)== time
																																		);
																	// 같은 time이 없으면 추가
																	if (!isExists) {
																		// data.timeID = timeID++;
																		data.time = this.customTime(data.time);
																		if (data.time) data.timeStamp = utilDate.convertString2Timestamp(data.time);
																		data.source = "MR"
																		if (!isNaN(time.rank)) data.rank = Number(time.rank);
																		delete time.individual;
																		// data.round = getRoundKor2Eng(data.round);
																		// console.log("inserted...", data.athleteID, data.name, data.gender, data.style, data.distance, data.time);
																		arr.push(data);
																	} else {
																		exists++;
																		// console.log("data...", data.name, data.gender, data.style, data.distance, data.time);
																		// console.log("exists...", isExists.name, isExists.gender, isExists.style, isExists.distance, isExists.time);
																	}
																	return arr;
																}, []);
		console.log("inserted...", timeArr.length, "exists:", exists);

		if (timeArr.length > 0) {
			const result = await mongodb.insertMany("myRankingTimes", timeArr, "Crawling");
			// console.log("result.insertMany=", result);
		}

	return timeArr;
}

exports.customAndInsertTimes = async (crawlingTimes, name) => {
console.log("customAndInsertTimes=", name, crawlingTimes.length);
	// check no data
	if (crawlingTimes.length == 0) return 0;

	// check 1st char
	let check = false;
	const firstChar = name.slice(0, 1)
	for (const time of crawlingTimes) {
		// check 단체가 아니고 이름 첫자가 다르면 다른 선수로 간주
		if (time.name.split(',').length < 3 && firstChar != time.name.slice(0, 1)) {
			console.log("다른이름 검색: name:", name, "searched:", time.name);
			check = true;
			break;
		}
		//-------------------------------------------
	//-----> check junior / adult
	//-------------------------------------------
		time.isAdult = ! this.checkJunior(time.ageGroup);
		//-------------------------------------------
	}

	let filteredTimes = crawlingTimes;

	//-------------------------------------------
	//-----> customizing times
	//-------------------------------------------
	times = await this.customizingTimes(crawlingTimes, name);	

// console.log("customAndInsertTimes.customizingTimes=", times.length);	
	if (times.length == 0) return 0;

	let crawling = true;
	if (times.length == 0) {
		crawling = false;
	} else {
		const dataIDs = [...new Set(times.map(el => el.dataID))];
// console.log("customAndInsertTimes.dataIDs=", dataIDs.length);	
		const result = await mongodb.distinct("timesMR", "dataID", { dataID: { $in: dataIDs }});
		const insertTimes = times.filter(el => !result.data.includes(el.dataID))
		console.log("times=", times.length, "insert", insertTimes.length, (insertTimes.length > 0 ? "....." : ""));
		if (insertTimes.length > 0) {
			await mongodb.insertMany("timesMR", times);
		}
	}

	return times.length;
}

//==============================================
//	customizing times
//==============================================
exports.customizingTimes = async (timeArr, name) => {
	const times = [];

	//---> get max tid
	// let tid = await mongodb.max(mongoCFG.Medalbank.myRankingTimes, "tid");

	for (const data of timeArr) {
		// check 단체 -> skip
		const value = this.customizingCrawlingTime(data);

    	const comp = competitionTable.find(el => el.cidMR == data.cid);
		if (comp) {			
			value.competitionID = comp.competitionID
			value.myRankingName = value.competitionName
			value.competitionName = comp.fullname
			value.poolID        = comp.poolID
			value.stemID        = comp.stemID
			value.stem          = comp.stem
			value.sido          = comp.sido
			value.course        = comp.course
			value.datetime      = comp.dateStart
		}


		// times, time
		// if (value.times.length >= 4) {
		// 	value.time = utilDate.convertString2Timestamp(value.times);
		// }

		// const arr = value.name.split(",");
		// if (arr.length > 1) {
		// 	value.names = value.name;
		// }
		value.team = value.team || "없음";
		value.team = value.team.replace(/\n/gi, "").replace(/\"/gi, "").replace(/\"/gi, "").replace(/ /gi, "");
		// value.nameORG = value.name; // save myRanking name
		// value.name = name;
		// if (value.nameORG.split(',').length > 3) {
		// 	value.name = value.team;
		// }
		value.individual = value.style.includes("Relay") ? false : true;
		
		//-----> check adult/junior
		value.isAdult = !this.checkJunior(value.ageGroup);
		
		if (value.age.length > 0 && value.ageGroup.length == 0) {
			value.ageGroup = value.age;
			delete value.age;
		}

		// check competitionID
		// const competition = competitionsTable.find(comp => comp.name.includes(value.competitionName));
		// if (competition) {
		// 	value.cid = Number(competition.cid);
		// 	value.competitionName = competition.name;
		// 	value.sido = competition.sido;
		// 	value.pool = competition.pool;
		// 	value.datetime = competition.datetime;
		// } else {
		// 	value.competitionName = value.competitionName;
		// 	value.datetime = value.datetime;
		// 	console.log("cid X:", value.name, value.competitionName);
		// }

		times.push(value);
	}

	return times;
}
//==============================================
//	customizing time
//==============================================
exports.customizingCrawlingTime = (value) => {
	let arr = (value.name+"|").split('OO')
	if (arr.length > 1) {
		value.name = value.name.replace(/OO/gi, "OO,").slice(0, -1)
	}
	value.rank = value.rank.replace("위", '');
	if (!isNaN(value.rank)) {
		value.rank = Number(value.rank);
	} else {
		value.status = value.rank;
		value.rank = "";
	}

	// gender, ageGroup
	// arr = value.ageGroup.split(' ')
	// value.gender = arr[0];
	// value.ageGroup = arr.slice(1).join(' ').trim();

	// gender
	// switch (value.gender) {
	// 	case "남자": value.gender = "men"; break;
	// 	case "여자": value.gender = "women"; break;
	// 	default: value.gender = "mixed"; break;
	// }

	// style, distance
	// arr = value.style.split(' ')
	// value.style = arr[0];
	// value.distance = arr.slice(1).join(' ');	

	// arr = value.distance.trim().split("M");
	// if (arr.length > 1) {
	// 	value.distance = arr[0] + 'M';
	// 	value.round = arr[1];
	// }

	// style
	if (value.style.includes("혼성")) {
		value.gender = "mixed";
		value.style = "계영"
	}

	// value.styleORG = value.style;
	if (value.style.includes("핀")) {
		value.fin = true;
		value.style = value.style.replace("핀", "");
	}
	switch (value.style) {
		case "자유형"		: value.style = "freestyle"; 				break;
		case "배영"			: value.style = "backstroke"; 			break;
		case "평영"			: value.style = "breaststroke"; 		break;
		case "접영"			: value.style = "butterfly"; 				break;
		case "개인혼영"	: value.style = "individualMedley"; break;
		case "계영"			: value.style = "freestyleRelay"; 	break;
		case "혼계영"		: value.style = "medleyRelay"; 			break;
	}
	// console.log(value.ageGroup, value.gender, value.style, value.distance, value.round);

	// times - times: '/img/icon_freejpg35.59',
	// arr = value.times.split("jpg");
	// if (arr.length > 1) {
	// 	value.times = arr[1]
	// }

	// competitionName, datetime
	// if (value.competitionName.length > 10) {
	// 	value.datetime = value.competitionName.slice(-10);

	// 	if (isNaN(value.datetime.slice(0,4))) {
	// 		value.datetime = "";
	// 	} else {
	// 		value.competitionName = value.competitionName.slice(0, -10).replace('\n', '').trim();
	// 	}
	// }
	return value;
}