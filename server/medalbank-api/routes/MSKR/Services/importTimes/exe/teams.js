
const fs        = require('fs');
const excelLibrary= require('../../util/excelLibrary');
const excel	      = new excelLibrary();
const UtilDate    = require("../../util/utilDate");
const utilDate	  = new UtilDate();

const mongoDB			= require('../../class/MongoDB');
const mongoCFG 		= require('../../config/mongoCFG');
const mongodb 		= new mongoDB(mongoCFG.Medalbank.database);

const uploadTeamsDAO = require('../uploadTeamsDAO');


console.log("node read (competitionID)",);
if (process.argv.length < 3) return;

const competitionID = Number(process.argv[2]);

(async () => {
	let result, body


	body = { teams: `teams:
	동화나라수영교실
	스위머스탄
	팀풉풉
	백상아리
	서브마린진수
	등떠밀려
	손오공
	88물사랑
	HSC
	7STROKE
	팀통일로
	SOS
	스위
	MOOK과천
	나자신과의싸움
	뽕스
	CBMAX
	돌핀스유닛` };
	// body = {rank: "8" };
	result = await uploadTeamsDAO.uploadTeams(body);
	console.log("result.data=", result.data.slice(0, 10));
	console.log("length=", result.data.slice(0, 10));
	console.log("message=", result.message);
	
})();
