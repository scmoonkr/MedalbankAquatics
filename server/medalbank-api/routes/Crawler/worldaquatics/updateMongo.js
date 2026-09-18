
const mongoDB			= require('../../MSKR/Class/MongoDB');
const mongoCFG 		= require('../../MSKR/Config/mongoCFG');
const mongodb 		= new mongoDB(mongoCFG.Medalbank.database);

const UtilDate    	= require("../../MSKR/Class/DateLibrary");
const utilDate	  	= new UtilDate();

//=============================================
exports.updateTimesMongo = async (competitionID, times) => {
  const query = { competitionID: competitionID, };
  query.style     = times[0].style;
  query.distance  = times[0].distance;
  query.gender    = times[0].gender;

  const context = {
    query     : query,
    projection: { _id:0, competitionID:1, gender:1, style:1, distance:1, round:1, time:1 },
    limit     : 10000,
    skip      : 0,
  }
  const tms = await mongodb.find(mongoCFG.Medalbank.worldaquaticsTimes, context, "Crawling");
  const inserted = times.reduce((arr, tm) => {
                          if (!tms.data.find(t =>
                                              t.competitionID === tm.competitionID &&
                                              t.gender   === tm.gender &&
                                              t.style    === tm.style &&
                                              t.distance === tm.distance &&
                                              t.round    === tm.round &&
                                              t.time     === tm.time
                                        )) {
                            arr.push(tm);
                          }
                          return arr;
                        },[]);
  if (inserted.length > 0) {
    // const result = await mongodb.deleteMany(mongoCFG.Medalbank.worldaquaticsTimes, query, "Crawling");
    // console.log("\n\ndelete.query=", query, result);
    await mongodb.insertMany(mongoCFG.Medalbank.worldaquaticsTimes, inserted, "Crawling");
  }
  console.log("times=", times.length, "inserted=", inserted.length, times.length > inserted.length) ? ">>>>" : "<<<<";
  return inserted;
}

//=============================================
//=============================================
exports.updateTimeResult = (discipline, timeArr) => {
  let [ gender, distance, style, style1 ] = (discipline+' ').split(' '); 
  // console.log("updateTimeResult=", gender, distance, style, style1);
  gender = (gender ?? "").toLocaleLowerCase();
  distance = (distance ?? "").toLocaleUpperCase();
  style = style ?? "";
  if (style == "Medley") {
    style = "individualMedley";
  } else {
    style = style.toLocaleLowerCase();
  }
  if (style1) {
    style = style + style1;
  }

  // console.log("timeOBJ=", gender, style, distance, Object.keys(timeOBJ));
  const times = [];
  // for (const event of Object.keys(timeOBJ)) {
    // console.log("event=", event);
    for (const heat of timeArr) {
      const record = heat.time.split(" ");
      if (record.length > 1) { // time : "01:23.45 WR"
        heat.time = record[0];
        heat.records = record[1];
      }
      // heat.heat = event;
      heat.gender = gender;
      heat.style = style;
      heat.distance = distance;
      if (heat.time) heat.timeStamp = utilDate.convertString2Timestamp(heat.time);
      for (const heatKey of Object.keys(heat)) {
        if (heat[heatKey] == "-") heat[heatKey] = '';
      }
      // console.log("event=", heat);
      const arr = heat.profileLink.split('/');
      // console.log(arr);
      if (arr.length > 6) heat.athleteID = Number(arr[6]);
      if (heat.points) heat.points = Number(heat.points); else delete heat.points;
      if (heat.age) heat.age = Number(heat.age); else delete heat.age;
      if (heat.rank) heat.rank = Number(heat.rank); else delete heat.rank;
      if (heat.lane) heat.lane = Number(heat.lane); else delete heat.lane;

      times.push(heat);
    }
  // }
  // console.log(`crawled times: [${discipline}], timeArr: ${times.length}`);
  // process.exit();

  return times;
} 