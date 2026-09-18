const _    			= require('lodash');
const fs   			= require('fs');

const utilLibrary = require('../../Util/utilLibrary.js');
const MongoDB     = require('../../Class/MongoDB.js');
const mongoCFG    = require('../../Config/mongoCFG.js');
const mongodb     = new MongoDB(mongoCFG.Medalbank.database);

const MemoryDB		= require("../../Class/MemoryDB.js");
const memoryDB		= new MemoryDB();


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
//============================================
exports.convertTimesMSKR = async () => {
	let result, body, query, value, context;
	// const timeIDs = [
	// 	65467,  66990,  66993,  67188,
	// 	67388,  67393,  75764,  76259,
	// 	78480,  78658,  81987,  81988,
	// 	81992,  81993,  83269,  83270,
	// 	84152,  84153,  84154,  84155,
	// 	86910,  87003, 100000, 100001,
	// 	100002, 100003, 100004, 100007,
	// 	100008
	//  ];
	context = {
		query: {},
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
	// context.query = { timeID: { $in: timeIDs } };
	const times = await mongodb.find("times", context, "MSKR");
	console.log("times=", times.data.length); // , times.data[0]);
	// const times = { data: []};

	// times -> time, timeStamp, -> times_MSKR
	let convertedTimes = times.data.map(record => {
																		const { time, times, athleteID, masters, adult, ...rest } = record;
																		return {
																				...rest,
																				timeStamp	: time == undefined || time == "" || time == null ? 0.0 : time,  // time -> timeStamp
																				time			: times ?? '',      // times -> time
																				isMasters	: masters,
																				isAdult		: adult,
																				type 			: 'event',
																				// athleteIDs: [],
																		};
																	});
	console.log("convertedTimes=", convertedTimes.length); // , convertedTimes[0]);

// console.log(printFunc("", convertedTimes));

	// fs.writeFileSync("times.json", JSON.stringify(convertedTimes, null, '  '));
	// fs.appendFileSync("times.json", JSON.stringify(timesMB.data, null, '  '));
	//---------------------------------------------
	//---------------------------------------------
	const _limit = 5000;
	for (let no = 0; no < convertedTimes.length; no += _limit) {
		const arr = convertedTimes.slice(no, no+_limit)
		await mongodb.insertMany("times_MSKR", arr, "MSKR");
		console.log(no, arr.length);
	}
	console.log("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~");
	console.log("inserted convertedTimes.length=", convertedTimes.length);
	console.log("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~");


	result = await mongodb.count("times_MSKR", {}, "MSKR");
	console.log("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~");
	console.log("times_MSKR.length=", result);
	console.log("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~");
	//---------------------------------------------
	//---------------------------------------------
  return convertedTimes;
}
//============================================
//============================================

let timeID = 100000;
//============================================
(async () => {
	
	context = {
		query: {},
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
	// context.query = { timeID: { $in: timeIDs } };
	const times = await mongodb.find("times", context, "MSKR");
	const timeIDs = times.data.map(el => el.timeID);

	console.log(timeIDs);
	result = await mongodb.updateMany("times_MSKR", { timeID: {$in: timeIDs} }, { fin: true }, "MSKR");
console.log(result);

	return;



	const timeArr = await this.convertTimesMSKR()
  console.log("timeArr=", timeArr.length);
})();
