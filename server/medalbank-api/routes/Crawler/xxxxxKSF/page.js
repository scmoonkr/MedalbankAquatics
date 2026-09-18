const extend		  = require('node.extend');
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

const puppeteer   = require('puppeteer');
const cheerio     = require('cheerio');
const parsing     = require('./parsing-table');

const homeURL = "http://result.sports.or.kr/sw/";

const config_list = {
  lineSelector:"div#tourDiv table.board_list tr.board_base",
  fieldSelector: "td",
  body: [
      { no: 0,    name:"competitionID",   type:"text",    },
      { no: 1,    name:"competitionName", type:"text",    },
      { no: 1,    name:"link",            type:"a",  attr: "href"  },
      { no: 2,    name:"date",            type:"text",    },
      { no: 3,    name:"pool",           	type:"text",    },
  ],
};

const config_detail = {
  lineSelector:"div#tourDetailDiv table.sub_board_list tr.board_base",
  fieldSelector: "td",
  body: [
      { no: 0,    name:"group",     type:"text",    },
      { no: 1,    name:"title",     type:"text",    },
      { no: 2,    name:"team",      type:"text",  },
      { no: 3,    name:"type",      type:"text",    },
      { no: 4,    name:"players",   type:"text",    },
      { no: 5,    name:"teams",     type:"text",    },
  ],
};

const config_heat = {
  lineSelector:"div#scheduleListDiv table.sub_board_list tr.board_base",
  fieldSelector: "td",
  body: [
      { no: 0,    name:"date",      type:"text",    },
      { no: 1,    name:"style",     type:"text",    },
      { no: 2,    name:"ageGroup",  type:"text",  },
      { no: 3,    name:"round",     type:"text",    },
      { no: 4,    name:"players",   type:"a", attr:"href"    },
      { no: 5,    name:"times",     type:"a", attr:"href"   },
  ],
};

const config_time = {
  lineSelector:"div#resultDiv table.sub_board_list tr.board_base",
  fieldSelector: "td",
  body: [
      { no: 0,    name:"rane",   type:"text",    },
      { no: 1,    name:"name",    type:"text",    },
      { no: 2,    name:"province",    type:"text",  },
      { no: 3,    name:"team",    type:"text",    },
      { no: 4,    name:"grade",    type:"text",    },
      { no: 5,    name:"preliminary",   type:"text",    },
      { no: 6,    name:"rank",   type:"text",    },
      { no: 7,    name:"times",    type:"text",    },
      { no: 8,    name:"result",   type:"text",    },
    ],
  body1: [
    { no: 0,    name:"rank",   type:"text",    },
    { no: 1,    name:"name",    type:"text",    },
    { no: 2,    name:"province",    type:"text",  },
    { no: 3,    name:"team",    type:"text",    },
    { no: 4,    name:"grade",    type:"text",    },
    { no: 5,    name:"times",    type:"text",    },
  ],
};

const config_player = {
  lineSelector:"div#tab3 div.tabs_baseline div.tabs_title_line table.sub_board_list tr.board_base",
  fieldSelector: "td",
  body: [
      { no: 0,    name:"no",   type:"text",    },
      { no: 1,    name:"gender",    type:"text",    },
      { no: 2,    name:"group",    type:"text",  },
      { no: 3,    name:"name",    type:"text",    },
      { no: 3,    name:"link",    type:"a", attr:"href",   },
      { no: 4,    name:"nameEng",  type:"text",    },
      { no: 5,    name:"team",    type:"text",    },
  ],
};

const config_player_detail = {
  lineSelector:"table#playerDetailListDiv tbody tr",
  fieldSelector: "td",
  body: [
      { no: 0,    name:"date",   type:"text",    },
      { no: 1,    name:"style",    type:"text",    },
      { no: 2,    name:"round",    type:"text",  },
      { no: 3,    name:"ageGroup",    type:"text",    },
      { no: 4,    name:"team",  type:"text",    },
      { no: 5,    name:"time",    type:"text",    },
      { no: 6,    name:"rank",    type:"text",    },
  ],
};

/*********************************************************************
 * 
 *	PUT(insert)
 *
 *********************************************************************/
exports.create = async (dbname=dbName, collection, index) => {
  let returnObj = { message: "", };

  try {
    let result = await mongodb.find(collection, { query:{}, projection: { _id:1 }, limit: 1 });
    if (result.data.length == 0) {
      returnObj = await mongodb.createCollection(collection, dbname);
    }
    returnObj = await mongodb.dropIndexes(collection, dbname);

    for (let no=0; no<index.length; no++) {
      returnObj = await mongodb.createIndex(collection, index[no].query, index[no].option, dbname);
    }

  } catch (e) {
    console.log("createIndex.catch." + e);
  }

	return returnObj;
}

exports.createAll = async (dbname=dbName) => {
  let index;
  // KSF competitions create & index
  index = [
    { query: { competitionID:1 }, name: "competitionID", option: { unique: true }  },
    { query: { competitionName:1 }, name: "competitionName",  },
  ];
  await this.create(dbName, collKSFcompetitions, index);

  // KSF KSF heats create & index
  index = [
    { query: { heatID:1 }, name: "heatID", option: { unique: true }  },
    { query: { name:1 }, name: "name",  },
  ];
  await this.create(dbName, collKSFheats, index);

  // KSF athletes create & index
  index = [
    { query: { athleteID:1 }, name: "athleteID", option: { unique: true }  },
    { query: { name:1 }, name: "name",  },
  ];
  await this.create(dbName, collKSFathletes, index);

  // KSF times create & index
  index = [
    { query: { timeID:1 }, name: "timeID", option: { unique: true }  },
    { query: { timeName:1 }, name: "timeName",  },
  ];
  await this.create(dbName, collKSFtimes, index);

  // KSF records create & index
  index = [
    { query: { recordID:1 }, name: "recordID", option: { unique: true }  },
    { query: { athleteID:1 }, name: "athleteID",  },
  ];
  await this.create(dbName, collKSFrecords, index);
}

//=====================================
exports.getPlayerDetail = async function(page, skip=0, limit=10000) {

  let result;

  // fetch FSK competitions
  const context = {
    query 			: { recordUpdated: { $exists: false } },
    projection	: { _id:0, },
    sort 				: {}, // { "medals.gold":-1, "medals.silver":-1, "medals.bronze":-1 },
    limit 			: limit,
    skip 				: skip,
  }
  let returnObj = await mongodb.find(collKSFathletes, context );
  let recordID = await mongodb.max(collKSFrecords, "recordID", {}, dbName); // query, db
  // recordID = 1000000 + skip * 200; 

  // let athleteArr = [];

  for (const athlete of returnObj.data) {

    try {
      await page.goto(homeURL + athlete.link);
      const html = await page.content();        
  
      let $ = cheerio.load(html);
  
      const name    = $("td#playerDetailName").text();
      const gender  = $("td#playerSexName").text();
      const birth   = $("td#playerDetailBirth").text();
    
      result = await parsing.parsingTable(html, config_player_detail);   // { total: 1, rows: [] }
      let competitionName = "";
      let recordArr = [];
      let date = "";
      for (const time of result) {
        if (time.date != "" && time.style == "" && time.time == "") {
          record = {}; //deep copy
          competitionName = time.date;
        } else if (time.style != "" && time.time != "" && time.team != "") {
          if (time.date != "") date = time.date; else time.date = date;
          const record = {
            competitionName : competitionName,
            recordID        : recordID++,
            athleteID       : athlete.athleteID,
            name            : athlete.name,
            date            : time.date.replace(/\./gi, "-"),
            style           : time.style,
            round           : time.round,
            ageGroup        : time.ageGroup,
            team            : time.team,
            times           : time.time,
            rank            : Number(time.rank),
          }
  
          recordArr.push(record);
          // console.log("----->", record);
        }
      } // for
  
      if (recordArr.length > 0) {
        console.log(athlete.athleteID, competitionName, "#", recordArr.length);
        result = await mongodb.insertMany(collKSFrecords, recordArr);  
      }
  
      let arr = (athlete.link+"classCd=").split("classCd=");
      arr = arr[1].split("&");
      let value = {
        class         : arr[0],
        gender        : gender,
        birth         : birth.replace("년", ""),
        recordUpdated : new Date(),
      } 
      result = await mongodb.updateOne(collKSFathletes, {athleteID: athlete.athleteID}, value );
    } catch (e) {}
  }

  return result;
}

//=====================================
exports.getPlayer = async function(page) {
  let result;

  // fetch FSK competitions
  const context = {
    query 			: { athleteUpdated: { $exists: false } },
    projection	: { _id:0, },
    sort 				: {}, // { "medals.gold":-1, "medals.silver":-1, "medals.bronze":-1 },
    limit 			: 100000,
    skip 				: 0,
  }
  let returnObj = await mongodb.find(collKSFcompetitions, context );
  let athleteID = await mongodb.max(collKSFathletes, "athleteID", {}, dbName); // query, db

  // let athleteArr = [];

  for (const comp of returnObj.data) {

    const link = `P01.jsp?classCd=${comp.class}&toCd=${comp.to}&page=4&ppage=&sexCd=&kindCd=`;
    await page.goto(homeURL + link);
    const html = await page.content();        
    let $ = cheerio.load(html);
    let pagePtr = $("div#pagingDiv ul.board_pagination li");
    let lastPage = pagePtr.eq(pagePtr.length-1).find("a").attr("href").replace("javascript:movePlayerList(", "").replace(")", "");
    console.log(comp.competitionID, comp.competitionName, ">>", lastPage);

    let athletes = [];
    try {
      for (let pageno=1; pageno<=lastPage; pageno++) {
        console.log("getPage.1>page#.", pageno);

        // select page
        await page.evaluate((pno) => {
          document.querySelector(`#pagingDiv ul.board_pagination li a[href="javascript:movePlayerList(${pno})"]`).click();
        }, pageno);
        await page.waitFor(100);

        // get table
        const html = await page.content();        

        result = await parsing.parsingTable(html, config_player);   // { total: 1, rows: [] }

        for (const player of result) {
          delete player.no;
          let arr = (player.link+"idNo=").split("idNo=");
          arr = arr[1].split("&");
          player.playerID = arr[0];

          arr = (player.link+"classCd=").split("classCd=");
          arr = arr[1].split("&");
          player.class = arr[0]; 

          player.athleteID = athleteID++;
          athletes.push(player);
          // athleteArr.push(player);

          // let dup = athleteArr.find((e) => e.playerID == player.playerID);
          // if (dup == undefined) {
          //   player.athleteID = athleteID++;
          //   athletes.push(player);
          //   athleteArr.push(player);
          // }
        }
      } // for player
    } catch (e) {}
    if (athletes.length > 0) {
      result = await mongodb.insertMany(collKSFathletes, athletes );
      result = await mongodb.updateOne(collKSFcompetitions, { competitionID: comp.competitionID }, { athleteUpdated: new Date() } );
      console.log(comp.competitionID, "athletes=", athletes.length);
    }
    // if (athletes.length > 20) break;
  } // for competitions

  return result;
}

//=====================================
exports.getTime = async function(page) {
  let result;

  // fetch FSK competitions
  const context = {
    query 			: { timeUpdated: { $exists: false } }, // { to:"202105906" }, // {to:"202105906"}, // { heats: { $exists: false } },
    projection	: { _id:0, },
    sort 				: {}, // { "medals.gold":-1, "medals.silver":-1, "medals.bronze":-1 },
    limit 			: 100000,
    skip 				: 0,
  }
  let returnObj = await mongodb.find(collKSFheats, context );
  let timeID = await mongodb.max(collKSFtimes, "timeID", {}, dbName); // query, db
  console.log("returnObj=", returnObj.data.length);
  console.log("timeID=", timeID);

  for (const heat of returnObj.data) {
    // const link = `S01.jsp?classCd=${comp.class}&toCd=${comp.to}`;
    await page.goto(homeURL + heat.times);
    await page.waitFor(100);

    const html = await page.content();        
    result = await parsing.parsingTable(html, config_time);   // { total: 1, rows: [] }

    let timeArr = [];
    for (const time of result) {
      time.timeID         = timeID++;
      time.rank           = Number(time.rank);
      time.heatID         = heat.heatID;
      time.style          = heat.style;
      time.ageGroup       = heat.ageGroup;
      time.round          = heat.round;
      time.date           = heat.date;
      time.class          = heat.class;
      time.competitionID  = heat.competitionID;
      // console.log(time, );
      timeArr.push(time);
    }
    if (timeArr.length > 0) {
      result = await mongodb.insertMany(collKSFtimes, timeArr);  
    }
    result = await mongodb.updateOne(collKSFheats, { heatID: heat.heatID }, { timeUpdated: new Date() } );  
    console.log(heat);
    break;
  }

  return result;
}

//=====================================
exports.getHeat = async function(page, link) {

  // S01.jsp?classCd=D2&toCd=202105906
  await page.goto(homeURL + link);
  const html = await page.content();        
  const result = await parsing.parsingTable(html, config_heat);   // { total: 1, rows: [] }

  let old = result[0].date;
  result.forEach((heat) => {
    if (heat.date == "") heat.date = old; else old = heat.date;
  })
console.log(result );
  return result;
}
//=====================================
exports.getHeatInfo = async function(page, link) {

  let result;

  // fetch FSK competitions
  const context = {
    query 			: {}, // { heatsAll: { $exists: false } }, // {to:"202105906"}, // { heats: { $exists: false } },
    projection	: { _id:0, },
    sort 				: {}, // { "medals.gold":-1, "medals.silver":-1, "medals.bronze":-1 },
    limit 			: 100000,
    skip 				: 0,
  }
  let returnObj = await mongodb.find(collKSFcompetitions, context );
console.log("competitions.length=", returnObj.data.length);

let heatID = await mongodb.max(collKSFheats, "heatID", {}, dbName); // query, db

  let heatArr = [];
  for (const comp of returnObj.data) {

    if (comp.competitionID == undefined || comp.competitionID == null) break;
    console.log(comp.competitionID, comp.competitionName);

    // comp.link = "S01.jsp?classCd=D2&toCd=202105906";
    const link = `S01.jsp?classCd=${comp.class}&toCd=${comp.to}`;
    await page.goto(homeURL + link);
    await page.waitFor(100);

    const html = await page.content();  
    
    let competition = comp;
    let $ = cheerio.load(html);
  
    // 대회명
    // let str = $("div#toName").text();
    // competition.competitionName = str == "" ? comp.competitionName : str;
  
    // 경기장
    // str = $("div#toPlace").text();
    // competition.pool = str == "" ? comp.pool : str;
  
    // 대회기간
    // str = $("div#toPeriod").text();
    // if (str != "") {
    //   let arr = (str + "~").split("~");
    //   competition.datetime    = arr[0].replace(/\./gi,"-").trim();
    //   competition.datetimeEnd = arr[1].replace(/\./gi,"-").trim();
    // }
  
    result = await parsing.parsingTable(html, config_heat);   // { total: 1, rows: [] }
  // console.log(result);

    if (result.length > 0) {
      let date = result[0].group;
      let style = result[0].style;
      for (const evt of result) {
        if (evt.date == "") evt.date = date; else date = evt.date;
        if (evt.style == "") evt.style = style; else style = evt.style;
    
        let heat = {
          heatID          : heatID++,
          players         : evt.players,
          date            : evt.date.replace(/\./gi, "-"),
          style           : evt.style,
          ageGroup        : evt.ageGroup,
          round           : evt.round,
          players         : evt.players,
          times           : evt.times,
          class           : competition.class,
          competitionID   : competition.competitionID,
          competitionName : competition.competitionName,
        };
        heatArr.push(heat);
      }    

      // update FSK competitionss
      // result = await mongodb.updateOne(collKSFcompetitions, {competitionID: competition.competitionID }, competition);
      // console.log("competition=", competition);
    }
  }
  result = await mongodb.insertMany(collKSFheats, heatArr);  
  console.log(heatArr.length, "+++++++++");


  // return result;
}

//=====================================
exports.getDetail = async function(page, link) {

  let result;

  // fetch FSK competitions
  const context = {
    query 			: { heats: { $exists: false } },
    projection	: { _id:0, },
    sort 				: {}, // { "medals.gold":-1, "medals.silver":-1, "medals.bronze":-1 },
    limit 			: 100000,
    skip 				: 0,
  }
  let returnObj = await mongodb.find(collKSFcompetitions, context );
console.log("competitions.length=", returnObj.data.length);

  // let heatArr = [];
  for (const comp of returnObj.data) {

    console.log(comp.competitionID, comp.competitionName);
    await page.goto(homeURL + comp.link);
    await page.waitFor(100);

    const html = await page.content();  
    
    let competition = comp;
    let $ = cheerio.load(html);
  
    // 대회명
    let str = $("div#toName").text();
    competition.competitionName = str == "" ? comp.competitionName : str;
  
    // url
    str = $("div#toURL").text();
    competition.url = str == "" ? comp.purllace : str;
  
    // 경기장
    str = $("div#toPlace").text();
    competition.pool = str == "" ? comp.pool : str;
  
    // 대회기간
    str = $("div#toPeriod").text();
    if (str != "") {
      let arr = (str + "~").split("~");
      competition.datetime    = arr[0].replace(/\./gi,"-").trim();
      competition.datetimeEnd = arr[1].replace(/\./gi,"-").trim();
    }
  
    // 승인대회구분
    str = $("div#toApproval").text();
    competition.approval = str.trim();
  
    // 대회속성
    str = $("div#toEntryGb").text();
    competition.entry = str.trim();
  
    // 대회명칭구분
    str = $("div#toNmGb").text();
    competition.nameType = str.trim();
  
    // 참가규모
    str = $("div#toScale").text();
    competition.scale = str.trim();

    result = await parsing.parsingTable(html, config_detail);   // { total: 1, rows: [] }
  
    if (result.length > 0) {
      competition.heats = [];
      let old = result[0].group;
      for (const evt of result) {
        if (evt.group == "") evt.group = old; else old = evt.group;
    
        let heat = {
          // competitionID : competition.competitionID,
          // heatID       : heatID++,
          group         : evt.group,
          title         : evt.title,
          team          : evt.team,
          type          : evt.type,
          players       : Number(evt.players == "" ? 0 : evt.players),
          teams         : Number(evt.teams == "" ? 0 : evt.teams),
        };
        competition.heats.push(heat);
      }    

      // update FSK competitionss
      result = await mongodb.updateOne(collKSFcompetitions, {competitionID: competition.competitionID }, competition);
      // console.log("competition=", competition);
    }
  }
  // result = await mongodb.insertMany(collKSFheats, heatArr);  
  // console.log(heatArr, "+++++++++");


  // return result;
}

//=====================================
exports.getList = async function(page) {
  await page.goto(homeURL);

  const html = await page.content();        
  let $ = cheerio.load(html);
  let pagePtr = $("div#pagingDiv ul.board_pagination li");
  let lastPage = pagePtr.eq(pagePtr.length-1).find("a").attr("href").replace("javascript:moveGameList(", "").replace(")", "");
  console.log("------------->", lastPage);

  let competitions = [];
  for (let pageno=1; pageno<=lastPage; pageno++) {
    console.log("getPage.1>page#.", pageno);

    // select page
    await page.evaluate((pno) => {
      document.querySelector(`#pagingDiv ul.board_pagination li a[href="javascript:moveGameList(${pno})"]`).click();
    }, pageno);
    await page.waitFor(100);

    // get table
    const html = await page.content();        

    const result = await parsing.parsingTable(html, config_list);   // { total: 1, rows: [] }
    competitions = [...competitions, ...result];

    // if (pageno > 0) break;
  } // isbn for

  if (competitions.length == 0) return;

  console.log("-------------------->", competitions.length);
  let competitionArr = [];
  competitions.forEach(async (evt) => {
    if (evt.competitionID != undefined && evt.competitionName != undefined) {
      let dup = competitionArr.find((e) => e.competitionID == Number(evt.competitionID));
      if (dup == undefined) {
        let arr = (evt.date + "~").split("~");
        let arr1 = (evt.link.replace(/&/gi, "=") + "======").split("=");
        let competition = {
          competitionID     : Number(evt.competitionID),
          competitionName   : evt.competitionName.trim(),
          datetime    : arr[0].replace(/\./gi,"-").trim(),
          datetimeEnd : arr[1].replace(/\./gi,"-").trim(),
          pool       	: evt.pool,
          link        : evt.link,
          class       : arr1[1].trim(),
          to          : arr1[3].trim(),
        };
        //E02.jsp?classCd=D2&toCd=202106172&page=1
        competitionArr.push(competition);
      }
    }
  })
console.log("-------------------->", competitionArr[0]);
  const returnObj = await mongodb.insertMany(collKSFcompetitions, competitionArr);

  // return competitionArr;
}

//=====================================
exports.customizing = async function() {
  // fetch FSK competitions
  const context = {
    query 			: {events: { $exists: true }}, // { heatsAll: { $exists: false } }, // {to:"202105906"}, // { heats: { $exists: false } },
    projection	: { _id:0, },
    sort 				: {}, // { "medals.gold":-1, "medals.silver":-1, "medals.bronze":-1 },
    limit 			: 100000,
    skip 				: 0,
  }
  let returnObj = await mongodb.find(collKSFcompetitions, context );
console.log("competitions.length=", returnObj.data.length);

  let result;

  for (const comp of returnObj.data) {
    const query = { competitionID: comp.competitionID };
    const value = { class: comp.class };
    result = await mongodb.findOne(collKSFheats, query );
    if (result.data.heatID != undefined) {
      result = await mongodb.updateMany(collKSFheats, query, value);
      console.log("heat>", query, value);
    }
    result = await mongodb.findOne(collKSFtimes, query );
    if (result.data.heatID != undefined) {
      result = await mongodb.updateMany(collKSFtimes, query, value);
      console.log("time>", query, value);
    }
  }

  // return competitionArr;
}

//=====================================
exports.customizingRecord = async function() {
  let result;

  // KSF records create & index
  // index = [
  //   { query: { recordID:1 }, name: "recordID", option: { unique: true }  },
  //   { query: { athleteID:1 }, name: "athleteID",  },
  // ];
  // await this.create(dbName, collKSFrecords, index);

  let recordID = await mongodb.max(collKSFrecords, "recordID", {}, dbName); // query, db
  console.log("recordID=", recordID);

  let skip = await mongodb.count(collKSFrecords);
console.log(skip);


  const limit = 200000;
  // for (let skip=0; skip<1000000; skip += limit) {
    // fetch FSK competitions
    const context = {
      query 			: {},
      projection	: {},
      sort 				: {},
      limit 			: limit,
      skip 				: skip,
    }
    console.log("skip=", skip, "limit=", limit);

    result = await mongodb.find("ksfRec", context);
    if (result.data.length == 0) return;
  console.log("ksfRec.length=", result.data.length);

    let records = [];
    for (const record of result.data) {
      
      record.recordID = recordID;
      const rec = {
        recordID  : recordID,
        name      : record.name,
        date      : record.date,
        style     : record.style,
        round     : record.round,
        ageGroup  : record.ageGroup,
        team      : record.team,
        times     : record.times,
        rank      : record.rank,
        athleteID : record.athleteID,
        competitionName : record.competitionName,
      }
      records.push(rec);
  // console.log("-----", record);

      // const res = await mongodb.updateOne("ksfRec", {_id: record._id}, {recordID: recordID} );
  // console.log("-----", res);
      recordID++;
    }

    if (records.length > 0) {
      console.log("insert", records.length);
      result = await mongodb.insertMany(collKSFrecords, records);
      console.log("insert ok", records.length);
    }    
  // }
}
