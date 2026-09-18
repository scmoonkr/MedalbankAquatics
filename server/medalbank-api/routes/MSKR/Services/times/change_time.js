const _ = require("lodash"); // lodash를 사용해 데이터를 그룹화 및 정렬
const fs          = require('fs');
const mskCFG 		  = require('../../Config/mskCFG');
const mongoCFG 		= require('../../Config/mongoCFG');
const mongoDB			= require('../../Class/MongoDB');
const mongodb 		= new mongoDB(mongoCFG.Medalbank.database);
const UtilDate		= require("../../Class/DateLibrary");
const utilDate		= new UtilDate();
const TimeLibrary		= require("../../Class/TimeLibrary");

const MemoryDB 		= require('../../Class/MemoryDB');
const { time } = require("console");
const memoryDB		= new MemoryDB();


(async () => {
  let result, query, value;

	query = {
		timeID: 74667,
	}
	value = {
		time: "45.01",
	}
	value.timeStamp = utilDate.convertString2Timestamp(value.time);

	//--------------------------------------------------------------------
	result = await mongodb.updateOne(mongoCFG.Medalbank.times, query, value);
	//--------------------------------------------------------------------
console.log(query, value, result);

})();

