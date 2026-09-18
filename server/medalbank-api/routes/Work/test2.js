const fs          = require('fs');
const mongoCFG 		= require('../Config/mongoCFG');
const mongoDB			= require('../Class/MongoDB');
const mongodb 		= new mongoDB(mongoCFG.Medalbank.database);
const UtilDate		= require("../Class/DateLibrary");
const utilDate		= new UtilDate();
const Times		    = require("../Models/Ranking/times.model");
const Reports	    = require("../Models/Ranking/reports.model");


// const Services = require('./team_points.service');
// const TaemStatics = require('../../Models/Ranking/team_points.class');
// const teamStatics	= new TaemStatics();

const competitionID = process.argv.length > 2 ? Number(process.argv[2]) : 1367;

(async () => {
  let result, body;

  let style = "fiN자유형핀Fin";
  const pattern = /핀|fin/gi;
  console.log(pattern.test(style));
  console.log(style.replace(pattern, ""));
  return;
  body = { name: '권희진', limit: 3 };
  // result = await Times.timelists(body);

  body= { rank: '8', competitionID: '1384' }
  reports = await Reports.personalTop(body);

  return;
})();
