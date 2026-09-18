const { resolve } = require('promise');
const fs          = require("fs");
const excelLibrary= require('../../Util/excelLibrary');
const excel	      = new excelLibrary();
const utilLibrary = require('../../Util/utilLibrary');
const UtilDate    = require("../../Util/utilDate");
const utilDate	  = new UtilDate();
const mongoDB     = require('../../Class/MongoDB');
const mongoCFG    = require('../../Config/mongoCFG');
const mongodb     = new mongoDB("MSKR");
//============================================


let competitionID = process.argv.length < 3 ? "100" : Number(process.argv[2]);

const competitionIDs =
[
    "100",
    "101",
    "108",
    "109",
    "110",
    "111",
    "116",
    "117",
    "118",
    "119",
    "120",
    "121",
    "122",
    "124",
    "125",
    "127",
    "129",
    "131",
    "132",
    "133",
    "134",
    "137",
    "138",
    "139",
    "143",
    "146",
    "147",
    "148",
    "149",
    "150",
    "152",
    "153",
    "154",
    "155",
    "156",
    "157",
    "159",
    "160",
    "161",
    "162",
    "163",
    "164",
    "165",
    "167",
    "168",
    "169",
    "170",
    "171",
    "173",
    "174",
    "175",
    "178",
    "179",
    "180",
    "181",
    "182",
    "183",
    "185",
    "188",
    "189",
    "190",
    "191",
    "192",
    "194",
    "195",
    "196",
    "197",
    "199",
    "205",
    "206",
    "207",
    "208",
    "209",
    "211",
    "212",
    "213",
    "214",
    "216",
    "217",
    "218",
    "220",
    "221",
    "222",
    "223",
    "224",
    "225",
    "227",
    "228",
    "229",
    "230",
    "231",
    "232",
    "236",
    "238",
    "239",
    "240",
    "241",
    "243",
    "249",
    "250",
    "251",
    "255",
    "256",
    "257",
    "258",
    "259",
    "260",
    "261",
    "262",
    "263",
    "264",
    "266",
    "267",
    "269",
    "271",
    "275",
    "279",
    "288",
    "289",
    "290",
    "291",
    "292",
    "293",
    "294",
    "295",
    "296",
    "298",
    "299",
    "3",
    "303",
    "310",
    "313",
    "334",
    "336",
    "337",
    "339",
    "342",
    "343",
    "344",
    "345",
    "346",
    "347",
    "348",
    "349",
    "350",
    "351",
    "358",
    "5",
    "54",
    "58",
    "59",
    "60",
    "62",
    "63",
    "67",
    "68",
    "69",
    "70",
    "71",
    "72",
    "73",
    "76",
    "78",
    "79",
    "80",
    "82",
    "83",
    "84",
    "90",
    "91",
    "92",
    "93",
    "94",
    "95",
    "98",
    "99"
];
//============================================
(async () => {
	let result, no;

  while(true) {
    // result = await mongodb.findOne("myCompetitions", { cid: Number(competitionID), crawling:true, custom: { $exists: false } } );
    result = await mongodb.findOne("myCompetitions", { crawling:true, custom: { $exists: false } } );
    if (result.data.cid == undefined) return;
    const cid = result.data.cid;
    // console.log("cid=", result.data);

    let query = { competitionID: result.data.cid.toString() };
    const context = {
      query				: query,
      projection	: { _id:0, },
      limit				: 50000,
      skip				: 0,
      // sort				: { ageGroup:1,category:1,gender:1,style:1,name:1,times:1 },
    }

    result = await mongodb.find("myRankings", context );
    if (result.data.length == 0) return;
    console.log("myRankings", query, result.data.length);


    const timeArr = [];
    let skip = 0;
    let no = 0;
    for (const time of result.data) {
      time.rank = time.rank.trim();
      time.times = time.times.trim();
      time.name = time.name.trim();
      time.team = time.team.trim();
      time.ageGroup = time.ageGroup.trim();

      time.times = time.times.replace("ups", ":");
      const arr = (time.style+" ").split(" ");
      time.style = arr[0].trim();
      time.distance = arr[1] ? arr[1].trim() + "M" : "";
      time.status = "";
      if (isNaN(time.rank)) {
        time.status = time.rank.trim();
        time.rank = "";
      }

      const ck = timeArr.find(el => {
        return (el.ageGroup == time.ageGroup &&
        el.gender == time.gender &&
        el.category == time.category &&
        el.style == time.style &&
        el.name == time.name &&
        el.team == time.team &&
        el.competitionID == time.competitionID &&
        el.rank == time.rank &&
        el.times == time.times)
      });

      if (ck == undefined) {
        timeArr.push(time);
      } else {
        skip++;
      }

    }
    console.log("cid=", cid, "length=", timeArr.length, "skip=", skip);

    result = await mongodb.updateOne("myCompetitions", { cid: cid }, { custom: true } );
    result = await mongodb.insertMany("rankings", timeArr );
    break;
  }
})();
