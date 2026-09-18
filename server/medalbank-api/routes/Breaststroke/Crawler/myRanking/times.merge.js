
const fs 					= require('fs');
const mongoDB     = require('../../MSKR/Class/MongoDB');
const mongoCFG    = require('../../MSKR/Config/mongoCFG');
const mongodb 		= new mongoDB(mongoCFG.Medalbank.database);
/**
 * 00:12.34 -> 12.34
 * 01:23.45 -> 1:23.45
 * @param {*} time 
 */
function normalizeTime(time) {
	if (time.slice(0,3) == "00:") time = time.slice(3);
	if (time.slice(0,1) == "0") time = time.slice(1);
	return time
}
/**
 * 새로운 타임 레코드를 가져와 기존 레코드와 비교하여 중복되지 않은 레코드만 반환하는 함수 (최적화 버전)
 * @param {Array} medalbankTimes - 기존 시간 레코드 배열 - medalbank.times
 * @param {Array} myRankingTimes - 새로 가져온 시간 레코드 배열 - myRanking times
 * @returns {Array} - 중복되지 않는 새 레코드 배열
 */
function checkExistsTimes(medalbankTimes, myRankingTimes) {
	// 결과를 저장할 배열
	const uniqueNewTimes = [];
	
	// 기존 레코드의 키 값을 저장할 Map (중복 확인용)
	// Object 대신 Map을 사용하면 키 충돌 위험 없이 빠르게 조회 가능
	const medalbankKeysMap = new Map();
	
	// 기존 레코드에서 키 생성 및 Map에 추가
	for (const record of medalbankTimes) {
		record.time = normalizeTime(record.time);
		const key = `${record.competitionID}|${record.name}|${record.gender}|${record.style}|${record.distance}|${record.isAdult||''}|${record.isMasters||''}|${record.time}`;
		medalbankKeysMap.set(key, true);
	}
	
	// 새 레코드를 확인하며 중복되지 않은 레코드만 추가
	for (const newRecord of myRankingTimes) {
		newRecord.time = normalizeTime(newRecord.time);
		const key = `${newRecord.competitionID}|${newRecord.name}|${newRecord.gender}|${newRecord.style}|${newRecord.distance}|${newRecord.isAdult||''}|${newRecord.isMasters||''}|${newRecord.time}`;
		
		if (medalbankKeysMap.size == 0 || !medalbankKeysMap.has(key)) {
			newRecord.source = 'MR'; // myRAnking
			newRecord.id = newRecord.dataID;
			const time = medalbankTimes.find(tm => tm.name == newRecord.name);
			if (time) {
				newRecord.athleteID = time.athleteID;
			}
			delete newRecord.dataID;
			delete newRecord.nameHide;
			delete newRecord.nameORG;
			delete newRecord.age;
			delete newRecord.styleORG;
			uniqueNewTimes.push(newRecord);
			// 바로 Map에 추가하여 이후 중복 체크도 방지
			medalbankKeysMap.set(key, true);
		}
	}

	//---------------------------------------------------
	// let str = "time\n";
	// for (const time of medalbankTimes) {
	// 	str += `${time.name}\t${time.timeID}\t${time.style}\t${time.distance}\t'${time.time}\t${time.competitionID}\tmedalbank\n`
	// }
	// str += "mytimes\n"
	// for (const time of myRankingTimes) {
	// 	str += `${time.name}\t${time.dataID}\t${time.style}\t${time.distance}\t'${time.time}\t${time.competitionID}\tmyRanking\n`
	// }
	// str += "inserted\n";
	// for (const time of uniqueNewTimes) {
	// 	str += `${time.name}\t${time.timeID}\t${time.style}\t${time.distance}\t'${time.time}\t${time.competitionID}\tinserted\n`
	// }
	// fs.writeFileSync("inserted.csv", str)
	//---------------------------------------------------
	
	return uniqueNewTimes;
}

exports.mergetimesFromMyRanking = async (myRankingTimes) => {

	//-----> get unique names
	const names = [...new Set(myRankingTimes.map(el => el.name))]
	console.log("names=", names.length)

	//---------------------------------------------------
	// read medalbank times by names
	//---------------------------------------------------
	const context = {
		query		: { name: { $in: names } },
		projection	: { _id:0 },
		limit		: 100000,
		// sort		: { cid: 1 },
	}
	const medalbankTimes = await mongodb.find(mongoCFG.Medalbank.times, context);
	// console.log("times=", medalbankTimes.data.length);

	//---------------------------------------------------
	// check duplicate(name, gender, style, distance, time, competitionID)
	//---------------------------------------------------
	const insertTimes = checkExistsTimes(medalbankTimes.data, myRankingTimes);
	if (!insertTimes || insertTimes.length == 0) return insertTimes;
	//---------------------------------------------------
	// insert medalbankTimes
	//---------------------------------------------------
	let timeID = await mongodb.max(mongoCFG.Medalbank.times, "timeID");
	insertTimes.forEach(time => time.timeID = timeID++);
	console.log("inserted=", insertTimes[0], "inserted=", insertTimes.length, "medalbankTimes=", medalbankTimes.data.length, "mytimes=", myRankingTimes.length)

	await mongodb.insertMany(mongoCFG.Medalbank.times, insertTimes)

	// console.log(insertTimes.slice(0, 5));
	
	
	//---------------------------------------------------
	// mark inported
	//---------------------------------------------------
	const dataIDs = medalbankTimes.data.map(el => el.dataID)
	await mongodb.updateMany("myTimes", { name: { $in: names } }, { imported: new Date() })
	
	return insertTimes;
}
