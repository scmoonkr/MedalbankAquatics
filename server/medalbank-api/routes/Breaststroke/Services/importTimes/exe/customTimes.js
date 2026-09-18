
const fs        = require('fs');
const excelLibrary= require('../../util/excelLibrary');
const excel	      = new excelLibrary();
const UtilDate    = require("../../util/utilDate");
const utilDate	  = new UtilDate();

const mongoDB			= require('../../class/MongoDB');
const mongoCFG 		= require('../../config/mongoCFG');
const mongodb 		= new mongoDB(mongoCFG.Medalbank.database);

const excelDAO = require('../../importUTIL/excelDAO');
const rankingsDAO = require('../rankingsDAO');

// let str = "0.45", tm = "";
// tm = utilDate.convertString2Timestamp(str);
// str = utilDate.convertTimestamp2string(tm);
// console.log(str, tm);
// let tt = utilDate.convertString2Timestamp(str);
// console.log(str, tt);
// return;

(async () => {
	let result, body

	const context = {
		// query: { competitionID:1347, gender:"men", style:"breaststroke", distance: "50M","ageGroup" : "성인부 4그룹", },
		query: {},
		projection: {_id:0, competitionName:0, pool:0 },
		limit: 100000,
		skip: 0,
		sort: { competitionID:1, ageGroup:1, gender:1, style:1, distance:1, rank:1 },
	}
	result = await mongodb.find("times_20230823", context);
// console.log(result.data, result.data.length);


	const timeOBJ = {};
	for (const time of result.data) {
		const discipline = `${time.competitionID}-${time.ageGroup}-${time.gender}-${time.style}-${time.distance}`
		if (!timeOBJ[discipline]) timeOBJ[discipline] = [];
		time.rank = 0;
		timeOBJ[discipline].push(time);
	}

	let timeArr = [];
	Object.keys(timeOBJ).forEach(async (key) => {
		const tms = customizingTimes(timeOBJ[key]);
		timeArr = timeArr.concat(tms);
	})
	console.log("insertMany...", timeArr.length);

	result = await mongodb.insertMany(mongoCFG.Medalbank.times, timeArr);
	

	console.log("insert ok...", timeArr.length);
	
})();

function customizingTimes(times) {
	const timeArr = [];
	times = rankingsDAO.assignRanks(times);
	const first = times[0].time;
	for (const time of times) {
		if (time.times && time.time) {
			time.times = utilDate.convertTimestamp2string(time.time);
			time.diffs = utilDate.convertTimestamp2string(time.time - first);
		} else {
			time.times = "";
			time.time = 0;
			time.diffs = "";
		}
		// update { timeID }, { times, diffs, rank, }
		timeArr.push(time);
	}
	return timeArr;
}