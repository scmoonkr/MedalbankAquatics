var fs						= require('fs');
const multiSort   = require('multisort');
const xlsx        = require('xlsx');
const mongoCFG 		= require('../../Config/mongoCFG');
const mongoDB			= require('../../Class/MongoDB');
const utilLibrary = require("../../Util/utilLibrary");

const dbName 		  = mongoCFG.dbMastersSwimmingKorea;
const mongodb 	  = new mongoDB(dbName);
const collKSFcompetitions    = "ksfCompetitions"; // mongoCFG.collMSK.athletes;
const collKSFheats    = "ksfHeats"; // mongoCFG.collMSK.athletes;
const collKSFathletes    = "ksfAthletes"; // mongoCFG.collMSK.athletes;
const collKSFtimes    = "ksfTimes"; // mongoCFG.collMSK.athletes;
const collKSFrecords    = "ksfRecords"; // mongoCFG.collMSK.athletes;

const filename = './isbn.xlsx';
const filesave = "./result.xlsx";
const competitions = [
  {
    "competitionID" : 253,
    "competitionName" : "제15회 꿈나무 전국수영대회(비등록)"
  },
  {
    "competitionID" : 224,
    "competitionName" : "KOREA MASTERS 2019"
  },
  {
    "competitionID" : 222,
    "competitionName" : "제14회꿈나무전국수영대회(비등록)"
  },
  {
    "competitionID" : 211,
    "competitionName" : "제8회광양만배유소년전국수영대회(비등록)"
  },
  {
    "competitionID" : 198,
    "competitionName" : "제13회꿈나무전국수영대회(비등록)"
  },
  {
    "competitionID" : 196,
    "competitionName" : "제7회광양만배유소년전국수영대회(비등록)"
  },
  {
    "competitionID" : 171,
    "competitionName" : "제12회꿈나무전국수영대회(비등록)"
  },
  {
    "competitionID" : 160,
    "competitionName" : "제6회광양만배유소년전국수영대회(비등록)"
  },
  {
    "competitionID" : 144,
    "competitionName" : "제11회꿈나무전국수영대회(비등록)"
  },
];

let context = {
  query     : {},
  projection: { _id:0, },
  sort      : { _id: -1 },
  limit     : 1000000,
  skip      : 0,
};


(async () => {
  const cids = competitions.map((comp) => comp.competitionID);
  console.log(cids);

  exportAthletes(cids);

})();

//============================================
async function exportRecords(cids) {
  let str = "";
  context.query = { competitionID : { $in: cids } };
  let result = await mongodb.find(collKSFrecords, context);
  
  str = "#\tname\tstyle\tageGroup\tteam\ttimes\trank\tdate\taid\tcid\n"
  result.data.forEach((data) => {
    str += data.recordID==undefined?"":data.recordID + "\t";
    str += data.name==undefined?"":data.name + "\t";
    str += data.style==undefined?"":data.style + "\t";
    str += data.ageGroup==undefined?"":data.ageGroup + "\t";
    str += data.team==undefined?"":data.team + "\t";
    str += data.times==undefined?"":data.times + "\t";
    str += data.rank==undefined?"":data.rank + "\t";
    str += data.date==undefined?"":data.date + "\t";
    str += data.athleteID==undefined?"":data.athleteID + "\t";
    str += data.competitionID==undefined?"":data.competitionID + "\t";
    str += "\n";
    // console.log(str);
  })
  fs.writeFileSync("./records.txt", str);
}

//============================================
async function exportTimes(cids) {
  let str = "";
  context.query = { competitionID : { $in: cids } };
  let result = await mongodb.find(collKSFtimes, context);
  
  str = "#\thid\tname\tsido\tteam\tgrade\tpreliminary\trank\ttimes\tresult\tstyle\tage\tround\tdate\tcid\tclass\n";
  result.data.forEach((data) => {
    str += data.timeID==undefined?"":data.timeID + "\t";
    str += data.heatID==undefined?"":data.heatID + "\t";
    str += data.tname==undefined?"":data.tname + "\t";
    str += data.name==undefined?"":data.name + "\t";
    str += data.sido==undefined?"":data.sido + "\t";
    str += data.team==undefined?"":data.team + "\t";
    str += data.grade==undefined?"":data.grade + "\t";
    str += data.preliminary==undefined?"":data.preliminary + "\t";
    str += data.rank==undefined?"":data.rank + "\t";
    str += data.times==undefined?"":data.times + "\t";
    str += data.result==undefined?"":data.result + "\t";
    str += data.style==undefined?"":data.style + "\t";
    str += data.ageGroup==undefined?"":data.ageGroup + "\t";
    str += data.round==undefined?"":data.round + "\t";
    str += data.date==undefined?"":data.date + "\t";
    str += data.competitionID==undefined?"":data.competitionID + "\t";
    str += data.class==undefined?"":data.class + "\t";
    str += "\n";
    // console.log(str);
  })
  fs.writeFileSync("./times.txt", str);
}

//============================================
async function exportAthletes(cids) {
  let str = "";
//   context.query = { competitionID : { $in: cids } };
//   context.projection = { _id:0, athleteID: 1 };
//   let result = await mongodb.find(collKSFrecords, context);
// console.log(result.data.length, result.data[0]);

//   const aids = result.data.map((comp) => comp.athleteID);
//   console.log(aids.length, aids[0]);

//   context.query = { athleteID : { $in: aids } };
  context.query = { };
  context.projection = { _id:0, };
  result = await mongodb.find(collKSFathletes, context);
  console.log(result.data.length, result.data[0]);

  str = "#\tname\tgender\tgroup\tename\tteam\tpid\tbirth\tclass\n";
  result.data.forEach((data) => {
    str += data.athleteID==undefined?"":data.athleteID + "\t";
    str += data.name==undefined?"":data.name + "\t";
    str += data.gender==undefined?"":data.gender + "\t";
    str += data.group==undefined?"":data.group + "\t";
    str += data.nameEng==undefined?"":data.nameEng + "\t";
    str += data.team==undefined?"":data.team + "\t";
    str += data.playerID==undefined?"":data.playerID + "\t";
    str += data.birth==undefined?"":data.birth + "\t";
    str += data.class==undefined?"":data.class + "\t";
    str += "\n";
    // console.log(str);
  })
  fs.writeFileSync("./athletes.txt", str);
}
