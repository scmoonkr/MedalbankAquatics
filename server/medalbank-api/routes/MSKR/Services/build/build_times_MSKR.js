const _    			= require('lodash');
const fs   			= require('fs');

const utilLibrary = require('../../Util/utilLibrary.js');
const MongoDB     = require('../../Class/MongoDB.js');
const mongoCFG    = require('../../Config/mongoCFG.js');
const mongodb     = new MongoDB(mongoCFG.Medalbank.database);

const MemoryDB		= require("../../Class/MemoryDB.js");
const memoryDB		= new MemoryDB();

let timeID = 100000;

function printFunc(label, times) {
	if (times.length == 0) return "";
	let str = "";
	for (const time of times) {
		str += `${label}\t${time.timeID}\t${time.tid??''}\t${time.athleteID??''}\t${time.type??''}\t${time.name}\t${time.style}\t${time.course}\t${time.distance}\t${time.time}\t${time.comprtitionID??''}\t${time.poolID??0}\t${time.check??''}\n`;
	}
	return str;
}


//============================================
//============================================
exports.checkSameTime = (times, timesMB) => {
	// 🔹 type 값에 따라 그룹화 (event -> myTimesEvent, time, club -> myTimesTimeClub)
	let { myTimesEvent, myTimesTimeClub } = _.groupBy(times, record => record.type === "event" ? "myTimesEvent" : "myTimesTimeClub");
	myTimesEvent = myTimesEvent ?? [];
	myTimesTimeClub = myTimesTimeClub ?? [];
console.log("myTimesEvent", myTimesEvent.length, "myTimesTimeClub", myTimesTimeClub.length);

	// 🔹 lodash를 사용하여 name-gender 기준으로 유일한 값 추출
	const uniqueRecords = _.uniqBy(myTimesEvent, record => `${record.name}-${record.gender}-${record.athleteID}`);

	// 🔹 필요한 필드만 선택 (name, gender)
	const names = uniqueRecords.map(({ name, gender, athleteID }) => ({ name, gender, athleteID }));
	// console.log(names);

	let importedTimes = [];
	let timesAthleteNotExists = [];
	//--------------------------------------
	for (const name of names) {
		// times에서 이름과 성별이 같은 time 가져오기
		const timesNames = times.filter(time => time.name == name.name && time.gender == name.gender);
		// timesMB에서 이름과 성별이 같은 time 가져오기
		let timesMedalbankNames = myTimesEvent.filter(time => time.name == name.name && time.gender == name.gender);
		// console.log(name);

		if (timesMedalbankNames.length > 0) {
			// athleteID 주가하기
			timesMedalbankNames = timesMedalbankNames.map(record => ({
																								...record,
																								athleteID	: Number(name.athleteID),
																								check			: 'medalbank'
																							}));
			importedTimes = [ ...importedTimes, ...timesMedalbankNames, ];
		}

		// timesMB의 competitionID, style, course, distance, timeStamp가 times에 존재하는 time
		const timesAthleteExists = timesMedalbankNames.filter(item => _.some(timesNames, { competitionID: item.competitionID, style: item.style, course: item.course, distance: item.distance, timeStamp: item.timeStamp }));
		
		// timesMB의 competitionID, style, course, distance, timeStamp가 times에 존재하지 않는 time
		timesAthleteNotExists = timesMedalbankNames.filter(item => !_.some(timesNames, { competitionID: item.competitionID, style: item.style, course: item.course, distance: item.distance, timeStamp: item.timeStamp  }));
		if (timesAthleteNotExists.length > 0) {
			// timeID 새로 부여하기
			timesAthleteNotExists = timesAthleteNotExists.map(record => ({
																											...record,
																											check	: 'notExists'
																										}));
		}

		// times에서 timeMB에 없는 time 가져오기
		let timesExists = timesNames.filter(item => !_.some(timesMedalbankNames, { competitionID: item.competitionID, style: item.style, course: item.course, distance: item.distance, timeStamp: item.timeStamp }));

		if (timesExists.length > 0) {
			// athleteID 주가하기
			timesExists = timesExists.map(record => ({
																								...record,
																								athleteID	: Number(name.athleteID),
																								type			: 'event',
																								check			: 'times'
																							}));
			importedTimes = [ ...importedTimes??[], ...timesExists??[], ];
		}
	} // end for
	// medalbank에서 추가한 time, club, event 기록은 timeID 새로 부여
	myTimesTimeClub = [ ...myTimesTimeClub??[], ...timesAthleteNotExists??[], ];
	if (myTimesTimeClub.length > 0) {		
		// let timeID = 100000;
		console.log("myTimesTimeClub.timeID=", timeID);
		myTimesTimeClub = myTimesTimeClub.reduce((arr,record) => {
																				const value = {
																					...record,
																					tid 	: record.timeID,
																					timeID: timeID++,
																					check	: record.check ? record.check.my :'my',
																				}	
																				arr.push(value);
																				return arr;
																			}, []);
	}

	//--------------------------------------
	return [ ...importedTimes, ...myTimesTimeClub ];
}
//============================================

//============================================
// body: { name, gender, athleteID, ageGroupCode }
//============================================
exports.importTimes = async (body) => {
	console.log("importTimes.body=", body);
	try {
		const athleteID = Number(body.athleteID ?? 0);
		if (!body.name || !body.ageGroupCode) return;
		const query = { name : body.name.trim(), gender: body.gender, type: 'event', };
		// const query = { name : body.name.trim(), gender: body.gender, time: { $gt: 0}, status: { $exists: false } };
		console.log("query=", query);
		//----------------------------------------------------------------
		const context = {
			query     : query,
			projection: { _id:0, },
			limit     : 10000,
			skip			: 0,
			sort      : { name:1, gender:1, style:1, team:1 },
		}
		//----------------------------------------------------------------
		const result = await mongodb.find(mongoCFG.Medalbank.timesOLD, context);
		// const result = { data: _timesMSKR.filter(el => el.name == body.name && el.gender == body.gender && el.type == 'event') };
		console.log("---->", query, result.data.length);
		//----------------------------------------------------------------
		const timeIDs = [];
		console.log("importTimes.body=", body, "timeID=", timeID);
		const times = result.data.reduce((arr, time) => {
																	if (time.athleteID && time.athleteID != athleteID) {
																		time.athleteID= athleteID;
																		time.tid 			= time.timeID;
																		time.timeID 	= timeID++;
																		arr.push(time);
																	}
																	return arr;
																}, []);
		console.log("times=", times.length);
		await mongodb.deleteMany(mongoCFG.Medalbank.times, { timeID: { $in: timeIDs}});
		await mongodb.insertMany(mongoCFG.Medalbank.times, times);
		return times; 
	} catch (e) {
		return utilError.errorMSG("Model","times", "delete", "catch." + e);
	}
}
//============================================


//============================================
(async () => {
	let result, body, query, value, context;

	timeID = await mongodb.max("times_MSKR", "timeID", {});
	if (timeID <= 100000) timeID = 100000;
	console.log("timeID=", timeID);
	

	context = {
		// query: { name: { $in: [ '문성중', '문성태'] } },
		projection: {
			_id:0,
			timeID: 1,
			athleteID: 1,
			masters: 1,
			adult: 1,
			isAdult : 1,
			isMasters : 1,
			isOfficial : 1,
			individual: 1,
			type: 1,

			name: 1,
			ageGroup: 1,
			gender: 1,
			style: 1,
			course: 1,
			distance: 1,
			timeStamp: 1,
			time: 1,			
			times: 1,			
			rank: 1,
			teamID: 1,
			team: 1,

			competitionID: 1,
			competitionName: 1,
			stemID: 1,
			sido: 1,
			pool: 1,
			poolID: 1,
			datetime: 1,
			status: 1,
		},
		limit: 100000,
	};
	
	// context.query = { name: "문성중"};
	const times = await mongodb.find("times_MSKR", context, "MSKR");
	console.log("timesMB=", times.data.length); //, times.data[0]);

	const timesMB = await mongodb.find("times_medalbank", context, "MSKR");
	console.log("timesMB=", timesMB.data.length); //, timesMB.data[0]);

	// fs.writeFileSync("times.json", JSON.stringify(convertedTimes, null, '  '));
	// fs.appendFileSync("times.json", JSON.stringify(timesMB.data, null, '  '));

	const timeArr = exports.checkSameTime(times.data, timesMB.data)
console.log("timeArr=", timeArr.length);
fs.writeFileSync("result.txt", printFunc("", timeArr));

	// 1. bulkWrite 방식
	const bulkOperations = [];
	const insertTimes = [];

	//--------------------------------
	// bulk update
	//--------------------------------
	timeArr.forEach(time => {
		if (time.check != 'my') {
			// 각 사용자별 새로운 분석 점수 계산 로직
			const setValue = { athleteID: time.athleteID, };
			if (time.tid) setValue.tid = time.tid;
			//-----
			bulkOperations.push({
				updateOne: {
					filter: { timeID: time.timeID },
					update: { 
						$set: setValue,
						// $unset: { times: 1 },
					},
					upsert: true,
				}
			});
			//-----
		} else {
			delete time.check;
			insertTimes.push(time);
		}
		// if (time.timeID == 10000) console.log(time);
	});
	//--------------------------------
	console.log("timeArr=", timeArr.length, "bulkOperations=", bulkOperations.length, "insertTimes=", insertTimes.slice(0,10), insertTimes.length);
	// return;

	const _limit = 10000;
	if (bulkOperations.length > 0) {
		for (let no = 0; no < bulkOperations.length; no += _limit) {
			const arr = bulkOperations.slice(no, no + _limit)
		console.log("bulkOperations=", arr.length, "/", bulkOperations.length);
			result = await mongodb.bulkWrite("times_MSKR", arr, "MSKR");
			// console.log(result);
			result = await mongodb.count("times_MSKR", {athleteID: {$exists:true}}, "MSKR");
			console.log(no, "bulkOperations end...", result);
		}
	}

	if (insertTimes.length > 0) {
		for (let no = 0; no < insertTimes.length; no += _limit) {
			const arr = insertTimes.slice(no, no + _limit)
		console.log("insertMany=", arr.length, "/", insertTimes.length);
		result = await mongodb.insertMany("times_MSKR", arr, "MSKR");
		}
	}
	result = await mongodb.count("times_MSKR", {athleteID: {$exists:true}}, "MSKR");
	console.log("end...", result);
	await mongodb.close();

	// fs.writeFileSync("result.txt", printFunc("", timeArr));
	// console.log("timeArr=", timeArr.length);
	// await mongodb.close();
	//---------------------------------------------
	//---------------------------------------------
	// for (let no = 0; no < convertedTimes.length; no += _limit) {
	// 	const arr = convertedTimes.slice(no, no+_limit)
	// 	await mongodb.insertMany("times_MSKR", arr, "MSKR");
	// 	console.log(no, arr.length);
	// }
	//---------------------------------------------
	//---------------------------------------------


	// result = await this.importTimes({ name:"문성태", athleteID:1, gender:"men", ageGroupCode: "15"});
	// console.log(printFunc("", result));


})();
