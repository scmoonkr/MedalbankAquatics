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
  projection: { _id:0, athleteUpdated:0, link:0, events:0, },
  sort      : { _id: -1 },
  limit     : 1000000,
  skip      : 0,
};


(async () => {
  const excel_header = [
    { label: "#", column: "A",  type: "s", data: "", },
    { label: "#", column: "A",  type: "s", data: "isbn", },
    { label: "#", column: "A",  type: "s", data: "isbn", },
    { label: "#", column: "A",  type: "s", data: "isbn", },
    { label: "#", column: "A",  type: "s", data: "isbn", },
    { label: "#", column: "A",  type: "s", data: "isbn", },
    { label: "#", column: "A",  type: "s", data: "isbn", },
    { label: "#", column: "A",  type: "s", data: "isbn", },
    { label: "#", column: "A",  type: "s", data: "isbn", },
    { label: "#", column: "A",  type: "s", data: "isbn", },
    { label: "#", column: "A",  type: "s", data: "isbn", },
    { label: "#", column: "A",  type: "s", data: "isbn", },
    { label: "#", column: "A",  type: "s", data: "isbn", },
  ];

//   let index = [
//     { query: { recordID:1 }, name: "recordID", option: { unique: true }  },
//     { query: { name:1, competitionID :1, style:1, round:1, ageGroup:1, team:1, }, name: "name",  },
//   ];
//   // returnObj = await mongodb.dropIndexes(collKSFrecords, dbName);
//   for (let no=0; no<index.length; no++) {
//     returnObj = await mongodb.createIndex(collKSFrecords, index[no].query, index[no].option, dbName);
//   }
// return;

  // const isbns = await read_excel(filename);
  // await updateRecords(); return;

  // const cids = competitions.map((comp) => comp.competitionID);
  // console.log(cids);

  let result;
  let str = "";
  //-----> competitions
  /*
  await exportCompetitions();

  await exportHeats();

  await exportAthletes();

  await customizingAthletes();

  await customizingTimes();
  */

  await customizingRecords();

})();

//============================================
function write_excel(filename, filesave, bookArr) {

  try {
    const workbook = xlsx.readFile(filename);
    //console.log(Object.keys(workbook.Sheets)); // TODO: workbook.SheetNames
    const ws = workbook.Sheets.Sheet1;
    const records = xlsx.utils.sheet_to_json(ws); // TODO: 강좌에서 header 옵션 보여주기

    const hdr = ['no', 'isbn', 'copy', 'regNo', 'title', "subTitle", "author", "publisher", "pubYear", "authNo", "regDate", "status"];
    const alpha = ['A', 'B', 'C', 'D', "E", "F", "G", "H", "I", "J", "K", "L"];
    for (let no=0; no<hdr.length; no++) {
      add_to_sheet(ws, alpha[no]+"1", 's', hdr[no]);
    }

    for (let no=0; no<bookArr.length; no++) {
      const book = bookArr[no];
      const nos = (no+2).toString();

      add_to_sheet(ws, "A"+nos, 'N', (no+1));
      add_to_sheet(ws, "B"+nos, 's', book.isbn);
      add_to_sheet(ws, "C"+nos, 'n', book.copy);
      add_to_sheet(ws, "D"+nos, 's', book.regno);
      add_to_sheet(ws, "E"+nos, 's', book.title);
      add_to_sheet(ws, "F"+nos, 's', book.subTitle);
      add_to_sheet(ws, "G"+nos, 's', book.author);
      add_to_sheet(ws, "H"+nos, 's', book.publisher);
      add_to_sheet(ws, "I"+nos, 's', book.pubYear);
      add_to_sheet(ws, "J"+nos, 's', book.authNo);
      add_to_sheet(ws, "K"+nos, 's', book.regDate);
      add_to_sheet(ws, "L"+nos, 's', book.status);
    }

    xlsx.writeFile(workbook, filesave);
  } catch (e) {
    console.error(e);
  }
  
}
//============================================
async function read_excel(filename) {
  const workbook = xlsx.readFile(filename);
  //console.log(Object.keys(workbook.Sheets)); // TODO: workbook.SheetNames
  const ws = workbook.Sheets.Sheet1;
  const records = xlsx.utils.sheet_to_json(ws); // TODO: 강좌에서 header 옵션 보여주기
  
  let isbns = [];
  for (const [i, r] of records.entries()) {
    //console.log(i, r);
    isbns.push(r.isbn.toString());
  }
  //console.log(JSON.stringify(isbns));
  return isbns;
}

//============================================
function range_add_cell(range, cell) {
  var rng = xlsx.utils.decode_range(range);
  var c = typeof cell === 'string' ? xlsx.utils.decode_cell(cell) : cell;
  if (rng.s.r > c.r) rng.s.r = c.r;
  if (rng.s.c > c.c) rng.s.c = c.c;

  if (rng.e.r < c.r) rng.e.r = c.r;
  if (rng.e.c < c.c) rng.e.c = c.c;
  return xlsx.utils.encode_range(rng);
}

//============================================
function add_to_sheet(sheet, cell, type, raw) {
  sheet['!ref'] = range_add_cell(sheet['!ref'], cell);
  sheet[cell] = { t: type, v: raw };
};

//============================================
async function updateRecords() {
  context.query = {};
  let result = await mongodb.find(collKSFcompetitions, context);

  for (const comp of result.data) {
    const query = { competitionName: comp.competitionName };
    const value = { competitionID: comp.competitionID };
    console.log(query, value);
    let res = await mongodb.updateMany(collKSFrecords, query, value);
  }
}

//============================================
async function exportCompetitions() {
  let str = "";
  context.query = { competitionID: { $in: cids } };
  result = await mongodb.find(collKSFcompetitions, context);
  
  result.data.forEach((data) => {
    // console.log(data);
    // Object.keys(data).forEach((key) => {
    //   // str += key + ",";
    //   str += data[key] + "\t";
    // })
    str += data.competitionID==undefined?"":data.competitionID + "\t";
    str += data.competitionName==undefined?"":data.competitionName + "\t";
    str += data.pool==undefined?"":data.pool + "\t";
    str += data.datetime==undefined?"":data.datetime + "\t";
    str += data.datetimeEnd==undefined?"":data.datetimeEnd + "\t";
    str += data.class==undefined?"":data.class + "\t";
    str += data.to==undefined?"":data.to + "\t";
    str += data.approval==undefined?"":data.approval + "\t";
    str += data.entry==undefined?"":data.entry + "\t";
    str += data.nameType==undefined?"":data.nameType + "\t";
    str += data.scale==undefined?"":data.scale + "\t";
    str += data.link==undefined?"":data.link + "\t";
    str += "\n";
    // console.log(str);
  })
  fs.writeFileSync("./competitions.txt", str);
}

//============================================
async function exportHeats() {
  let str = "";
  context.projection = { _id:0, players:0, times:0, };
  result = await mongodb.find(collKSFheats, context);
  
  result.data.forEach((data) => {
    str += data.heatID==undefined?"":data.heatID + "\t";
    str += data.date==undefined?"":data.date + "\t";
    str += data.style==undefined?"":data.style + "\t";
    str += data.ageGroup==undefined?"":data.ageGroup + "\t";
    str += data.round==undefined?"":data.round + "\t";
    str += data.datetime==undefined?"":data.datetime + "\t";
    str += data.class==undefined?"":data.class + "\t";
    str += data.competitionID==undefined?"":data.competitionID + "\t";
    str += data.competitionName==undefined?"":data.competitionName + "\t";
    str += data.players==undefined?"":data.players + "\t";
    str += data.times==undefined?"":data.times + "\t";
    str += "\n";
    // console.log(str);
  })
  fs.writeFileSync("./heats.txt", str);
}

//============================================
async function customizingAthletes() {
  let str = "";
  const ctx = {
    query     : { dupID:{$exists:false} },
    projection: { _id:0, },
    sort      : {},
    limit     : 1000000,
    skip      : 0,
  };
  result = await mongodb.find(collKSFathletes, ctx);
  result.data = multiSort(result.data, ["name", "playerID", "birth", ]); // DESC -> "~ageGroup", ASC: "ageGroup"

  let records = [];
  let dups = [];
  let athleteID = 1;
  result.data.forEach(async (data) => {
    let res = records.find((r) => r.playerID==data.playerID && r.birth==data.birth && r.name==data.name)
    if (res == undefined)
      records.push({
        athleteID : athleteID++,
        name      : data.name == undefined ? "" : data.name,
        birth     : data.birth == undefined ? "" : data.birth,
        gender    : data.gender == undefined ? "" : data.gender,
        nameEng   : data.nameEng == undefined ? "" : data.nameEng,
        team      : data.team == undefined ? "" : data.team,
        group     : data.group == undefined ? "" : data.group,
        class     : data.class == undefined ? "" : data.class,
        playerID  : data.playerID == undefined ? "" : data.playerID,
        link      : data.link == undefined ? "" : data.link,
        dupID     : [data.athleteID],
      });
    else {
      // res.athleteID = res.athleteID == undefined ? (data.athleteID == undefined ? "" : data.athleteID) : res.athleteID;
      res.name      = res.name == undefined ? (data.name == undefined ? "" : data.name) : res.name;
      res.birth     = res.birth == undefined ? (data.birth == undefined ? "" : data.birth) : res.birth;
      res.gender    = res.gender == undefined ? (data.gender == undefined ? "" : data.gender) : res.gender;
      res.nameEng   = res.nameEng == undefined ? (data.nameEng == undefined ? "" : data.nameEng) : res.nameEng;
      res.team      = res.team == undefined ? (data.team == undefined ? "" : data.team) : res.team;
      res.group     = res.group == undefined ? (data.group == undefined ? "" : data.group) : res.group;
      res.class     = res.class == undefined ? (data.class == undefined ? "" : data.class) : res.class;
      res.playerID  = res.playerID == undefined ? (data.playerID == undefined ? "" : data.playerID) : res.playerID;
      res.link      = res.link == undefined ? (data.link == undefined ? "" : data.link) : res.link;
      res.dupID.push(data.athleteID);

      if (res.team != "" && res.team.indexOf(data.team) < 0) {
        res.team += "," + data.team;
      }
      if (res.class != "" && res.class.indexOf(data.class) < 0) {
        res.class += "," + data.class;
      }
      if (res.group != "" && res.group.indexOf(data.group) < 0) {
        res.group += "," + data.group;
      }
    }
  })
  console.log("records=", records);
  console.log(result.data.length);

  const ksfAthletes1 = "ksfAthletes1";
  try {
    result = await mongodb.find(ksfAthletes1, { query:{}, projection: { _id:1 }, limit: 1 });
    if (result.data.length == 0) {
      returnObj = await mongodb.createCollection(ksfAthletes1, dbName);
    }
    returnObj = await mongodb.dropIndexes(ksfAthletes1, dbName);

    let index = [
      { query: { athleteID:1 }, name: "athleteID", option: { unique: true }  },
      { query: { name:1 }, name: "name",  },
    ];
      for (let no=0; no<index.length; no++) {
      returnObj = await mongodb.createIndex(ksfAthletes1, index[no].query, index[no].option, dbName);
    }

  } catch (e) {
    console.log("createIndex.catch." + e);
  }

  let res = await mongodb.insertMany(ksfAthletes1, records);

  records.forEach((data) => {
    // console.log(data);
    // Object.keys(data).forEach((key) => {
    //   // str += key + ",";
    //   str += data[key] + "\t";
    // })
    str += data.playerID==undefined?"":data.playerID + "\t";
    str += data.name==undefined?"":data.name + "\t";
    str += data.nameEng==undefined?"":data.nameEng + "\t";
    str += data.team==undefined?"":data.team + "\t";
    str += data.group==undefined?"":data.group + "\t";
    str += data.gender==undefined?"":data.gender + "\t";
    str += data.birth==undefined?"":data.birth + "\t";
    str += data.class==undefined?"":data.class + "\t";
    str += data.athleteID==undefined?"":data.athleteID + "\t";

    str += "\n";
    // console.log(str);
  })
  fs.writeFileSync("./athletes.txt", str);
}

//============================================
async function customizingTimes() {
  let str = "";
  const ctx = {
    query     : { dupID:{$exists:false} },
    projection: { _id:0, },
    sort      : {},
    limit     : 1000000,
    skip      : 0,
  };
  result = await mongodb.find(collKSFtimes, ctx);
  result.data = multiSort(result.data, ["name", "competitionID", "heatID", "style", ]); // DESC -> "~ageGroup", ASC: "ageGroup"

  let records = [];
  let dups = [];
  let timeID = 1;
  result.data.forEach(async (data) => {
    let res = records.find((r) => r.name==data.name && r.competitionID==data.competitionID && r.heatID==data.heatID && r.style==data.style && r.times==data.times)
    if (res == undefined)
      records.push({
        timeID        : timeID++,
        name          : data.name == undefined ? "" : data.name,
        sido      		: data.sido == undefined ? "" : data.sido,
        team          : data.team == undefined ? "" : data.team,
        lane          : data.rane == undefined ? "" : data.rane,
        preliminary   : data.preliminary == undefined ? "" : data.preliminary,
        rank          : data.rank == undefined ? "" : data.rank,
        times         : data.times == undefined ? "" : data.times,
        result        : data.result == undefined ? "" : data.result,
        heatID        : data.heatID == undefined ? "" : data.heatID,
        style         : data.style == undefined ? "" : data.style,
        ageGroup      : data.ageGroup == undefined ? "" : data.ageGroup,
        round         : data.round == undefined ? "" : data.round,
        date          : data.date == undefined ? "" : data.date,
        competitionID : data.competitionID == undefined ? "" : data.competitionID,
        class         : data.class == undefined ? "" : data.class,
        dupID         : [data.timeID],
      });
    else {
      // res.timeID = res.timeID == undefined ? (data.timeID == undefined ? "" : data.timeID) : res.timeID;
      res.name          = res.name == undefined ? (data.name == undefined ? "" : data.name) : res.name;
      res.sido      		= res.sido == undefined ? (data.sido == undefined ? "" : data.sido) : res.sido;
      res.team          = res.team == undefined ? (data.team == undefined ? "" : data.team) : res.team;
      res.lane          = res.lane == undefined ? (data.lane == undefined ? "" : data.lane) : res.lane;
      res.preliminary   = res.preliminary == undefined ? (data.preliminary == undefined ? "" : data.preliminary) : res.preliminary;
      res.rank          = res.rank == undefined ? (data.rank == undefined ? "" : data.rank) : res.rank;
      res.times         = res.times == undefined ? (data.times == undefined ? "" : data.times) : res.times;
      res.result        = res.result == undefined ? (data.result == undefined ? "" : data.result) : res.result;
      res.heatID        = res.heatID == undefined ? (data.heatID == undefined ? "" : data.heatID) : res.heatID;
      res.style         = res.style == undefined ? (data.style == undefined ? "" : data.style) : res.style;
      res.ageGroup      = res.ageGroup == undefined ? (data.ageGroup == undefined ? "" : data.ageGroup) : res.ageGroup;
      res.round         = res.round == undefined ? (data.round == undefined ? "" : data.round) : res.round;
      res.date          = res.date == undefined ? (data.date == undefined ? "" : data.date) : res.date;
      res.competitionID = res.competitionID == undefined ? (data.competitionID == undefined ? "" : data.competitionID) : res.competitionID;
      res.class         = res.class == undefined ? (data.class == undefined ? "" : data.class) : res.class;
      res.dupID.push(res.timeID);
    }
    if (timeID%100 == 0) console.log("#", timeID, records.length, "/", result.data.length);
  })
  console.log("records=", records);
  console.log(result.data.length);

  const ksfTimes1 = "ksfTimes1";
  try {
    result = await mongodb.find(ksfTimes1, { query:{}, projection: { _id:1 }, limit: 1 });
    if (result.data.length == 0) {
      returnObj = await mongodb.createCollection(ksfTimes1, dbName);
    }
    returnObj = await mongodb.dropIndexes(ksfTimes1, dbName);

    let index = [
      { query: { timeID:1 }, name: "timeID", option: { unique: true }  },
      { query: { name:1 }, name: "name",  },
    ];
    for (let no=0; no<index.length; no++) {
      returnObj = await mongodb.createIndex(ksfTimes1, index[no].query, index[no].option, dbName);
    }

  } catch (e) {
    console.log("createIndex.catch." + e);
  }

  let res = await mongodb.insertMany(ksfTimes1, records);

  records.forEach((data) => {
    // console.log(data);
    // Object.keys(data).forEach((key) => {
    //   // str += key + ",";
    //   str += data[key] + "\t";
    // })
    str += data.playerID==undefined?"":data.playerID + "\t";
    str += data.name==undefined?"":data.name + "\t";
    str += data.nameEng==undefined?"":data.nameEng + "\t";
    str += data.team==undefined?"":data.team + "\t";
    str += data.group==undefined?"":data.group + "\t";
    str += data.gender==undefined?"":data.gender + "\t";
    str += data.birth==undefined?"":data.birth + "\t";
    str += data.class==undefined?"":data.class + "\t";
    str += data.timeID==undefined?"":data.timeID + "\t";

    str += "\n";
    // console.log(str);
  })
  fs.writeFileSync("./times.txt", str);
}


//============================================
async function customizingRecords() {
  let str = "";
  console.log("customizingRecords...", new Date().toISOString());
  const ctx = {
    query     : {},
    projection: { _id:0, },
    sort      : {},
    limit     : 1000000,
    skip      : 0,
  };
  result = await mongodb.find(collKSFrecords, ctx);
  console.log("find...", new Date().toISOString());
  let records = multiSort(result.data, ["name", "competitionID", "style", "round", "ageGroup", "team", ]); // DESC -> "~ageGroup", ASC: "ageGroup"
  console.log("sort...", new Date().toISOString());

  // ctx.projection = { _id:0, recordID:1, };
  // result = await mongodb.find("ksfRecords1", ctx );      

  let no = 1;

  for (const record of records) {
    const ctx1 = {
      query     : {
        name          : record.name,
        competitionID : record.competitionID,
        style         : record.style,
        round         : record.round,
        ageGroup      : record.ageGroup,
        team          : record.team,
      },
      projection: { _id:0, recordID:1 },
      sort      : {},
      limit     : 10000,
      skip      : 0,
    };
    let res = await mongodb.find(collKSFrecords, ctx1);
    if (res.data.length > 1) {
      let rids = res.data.map((dt) => dt.recordID);
      rids = rids.slice(1);
      console.log(new Date(), no++, ctx1.query, rids.length, );
      res = await mongodb.deleteMany(collKSFrecords, { recordID: { $in: rids } } );      
    } else {
      console.log(new Date(), no++, "...recordID", res.data[0].recordID, "/", records.length, );
    }
  }
return;

  let dups = [];
  let recordID = 1;
  result.data.forEach(async (data) => {
    let res = records.find((r) => r.name==data.name && r.competitionID==data.competitionID && r.style==data.style && r.round==data.round && r.ageGroup==data.ageGroup && r.team==data.team)
    if (res == undefined) {
      data.recordID = recordID++;
      records.push(data);
    }
    if (recordID%100 == 0) console.log("#", recordID, records.length, "/", result.data.length);
  })
  console.log("records=", records.length);
  console.log(result.data.length);

  const ksfRecords1 = "ksfRecords1";
  try {
    result = await mongodb.find(ksfRecords1, { query:{}, projection: { _id:1 }, limit: 1 });
    if (result.data.length == 0) {
      returnObj = await mongodb.createCollection(ksfRecords1, dbName);
    }
    returnObj = await mongodb.dropIndexes(ksfRecords1, dbName);

    let index = [
      { query: { recordID:1 }, name: "recordID", option: { unique: true }  },
      { query: { name:1 }, name: "name",  },
    ];
    for (let no=0; no<index.length; no++) {
      returnObj = await mongodb.createIndex(ksfRecords1, index[no].query, index[no].option, dbName);
    }

  } catch (e) {
    console.log("createIndex.catch." + e);
  }

  let res = await mongodb.insertMany(ksfRecords1, records);

  records.forEach((data) => {
    // console.log(data);
    // Object.keys(data).forEach((key) => {
    //   // str += key + ",";
    //   str += data[key] + "\t";
    // })
    str += data.playerID==undefined?"":data.playerID + "\t";
    str += data.name==undefined?"":data.name + "\t";
    str += data.nameEng==undefined?"":data.nameEng + "\t";
    str += data.team==undefined?"":data.team + "\t";
    str += data.group==undefined?"":data.group + "\t";
    str += data.gender==undefined?"":data.gender + "\t";
    str += data.birth==undefined?"":data.birth + "\t";
    str += data.class==undefined?"":data.class + "\t";
    str += data.recordID==undefined?"":data.recordID + "\t";

    str += "\n";
    // console.log(str);
  })
  fs.writeFileSync("./records.txt", str);
}
