
const cheerio     = require('cheerio');
const puppeteer   = require('puppeteer');
const fs   = require('fs');

const excelLibrary= require('../../MSKR/Util/excelLibrary');
const excel	      = new excelLibrary();
const utilLibrary = require('../../MSKR/Util/utilLibrary');
const mskCFG 		= require('../../MSKR/Config/mskCFG');
const mongoDB			= require('../../MSKR/Class/MongoDB');
const mongoCFG 		= require('../../MSKR/Config/mongoCFG');
const mongodb 		= new mongoDB(mongoCFG.Medalbank.database);

const UtilDate    = require("../../MSKR/Util/utilDate");
const utilDate	  = new UtilDate();

const Util    = require("./util");

let _browser = "", _page = "";
let global = {};
global.KSF = "/backup/KSF";

const _homeSports = "https://result.sports.or.kr/SW/INF201.do";




//=======================================================
(async () => {
	let result;
  
  const context = {
    query: {},
    projection: { _id:0, },
    limit: 1000,
    skip: 0,
    // sort: { competitionID:-1 },
  }

  const records = await mongodb.find(mongoCFG.Medalbank.sportsCompetitions, context);

  let str = "";
  str += `cid\tcompetitionName\tdateStart\tdateEnd\tregistStart\tregistEnd\tclassCd\ttoCd\tpool\tattribute\tmasters\tnameGubun\tevents\n`;
  for (const comp of records.data) {
    str += `${comp.competitionID}\t${comp.competitionName}\t${comp.dateStart}\t${comp.dateEnd}\t${comp.registStart}\t${comp.registEnd}\t${comp.classCd}\t${comp.toCd}\t${comp.pool}\t${comp.attribute}\t${comp.masters}\t${comp.nameGubun}\t${comp.events.length}\n`;
  }
  fs.writeFileSync("competitions.csv", str, 'utf8');


  const competition = {
    "competitionID" : 370,
    "competitionName" : "제20회 제주 한라배 전국수영대회(다이빙)",
    "dateStart" : "2025-04-12",
    "dateEnd" : "2025-04-16",
    "registStart" : "2025-03-20",
    "registEnd" : "2025-04-03",
    "classCd" : "E2",
    "toCd" : "202512395",
    "pool" : "제주실내수영장",
    "attribute" : "전문체육",
    "events" : [],
    "masters" : "미등록",
    "nameGubun" : "미등록"
  }
})();
