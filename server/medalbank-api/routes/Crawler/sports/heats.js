
const excelLibrary= require('../../Util/excelLibrary');
const utilLibrary = require('../../Util/utilLibrary');
const excel	      = new excelLibrary();
const { isDecimal } = require('geolib');
const cheerio     = require('cheerio');
const puppeteer   = require('puppeteer');
const mskCFG 		= require('../../Config/mskCFG');

const mongoDB			= require('../../Class/MongoDB');
const mongoCFG 		= require('../../Config/mongoCFG');
const mongodb 		= new mongoDB(mongoCFG.Medalbank.database);

const UtilDate    = require("../../Util/utilDate");
const utilDate	  = new UtilDate();

let _browser = "", _page = "";
let global = {};
global.KSF = "/backup/KSF";

const _homeSports = "https://result.sports.or.kr/sw/";

let _count = process.argv.length < 3 ? 1 : Number(process.argv[2]);

(async () => {

	let result;

	// result = await create(); return;

	// ----->	
	const context = {
		query 		: { type: "경영", crawling: false },
		projection: { _id: 0 },
		sort 			: { competitionID: -1 },
		limit			: _count,
	}
	result = await mongodb.find(mongoCFG.Medalbank.sportsCompetitions, context);
	if (result.data.length == 0) return;

	const competitionIDs = result.data.map(el => el.competitionID);
console.log("competitionIDs=", competitionIDs);

	// ----->	
	let recordArr = await crawling(result.data);
	// console.log("recordArr=", recordArr);

	// ----->	
	let heatID =  await mongodb.max("sportsHeats", "heatID");
	console.log("heatID: ", heatID);
	for (let no=0; no<recordArr.length; no++) {
		recordArr[no].heatID = heatID++;
	}
	// console.log("recordArr=", recordArr);

	// ----->	
	if (recordArr.length > 0) {
		result = await mongodb.insertMany("sportsHeats", recordArr);
	}	

	result = await mongodb.updateMany(mongoCFG.Medalbank.sportsCompetitions, { competitionID: { $in: competitionIDs } }, { crawling: true } );

	console.log(recordArr.length);

})();
/**********************************************
 * 
 * crawling detail
 * 
 ***********************************************/
async function crawling(competitions) {
  console.log("competitions=", competitions.length);
  let returnObj = { message: '', };
  let result, query, projection;

  let newRecordURL = "";
  await initializePupper();
  /***********************************
   *    search page
   ***********************************/
  let recordArr = [];
  for (let no = 0; no < competitions.length; no++) {
		const competition = competitions[no];
		if (competition.link == undefined || competition.link == "") continue;
		const url = competition.link.replace("E02", "S01");

    await _page.goto(url);
		let records = await getHeats(_page, competition);
		recordArr = [ ...recordArr, ...records ];
		console.log(`url: ${url}, ${records.length} / ${recordArr.length}`);
	}

  close();

// console.log(records.length, records[0]);
  return recordArr;
}

//==========================================================
async function getHeats(search_page, competition) {

  const html = await search_page.content();        
  
  let $ = cheerio.load(html);

  const tablePtr = $("div#scheduleListDiv table.sub_board_list.m03_1_tb tbody tr.board_base");

  const recordArr = [];
  if (tablePtr.length == 0) return recordArr;

  // =============================================
  // =============================================
  // =============================================
  const records = [];
  let old = {};
  tablePtr.each((index, elem) => {

    const trs = $(elem).find("td");
    if (trs.length != 6) return;
    const record = {
			heatID		: 0,
			competitionID : competition.competitionID,
			gender		: '',
			style			: '',
			distance	: '',
      ageGroup	: trs.eq(2).text().trim(),
      round			: trs.eq(3).text().trim(),
      datetime	: trs.eq(0).text().trim(),
			crawling	: false,
			player	: false,
      styles		: trs.eq(1).text().trim(),
      startLink	: _homeSports + trs.eq(4).find("a").attr("href"),
      resultLink: _homeSports + trs.eq(5).find("a").attr("href"),
    }
    if (record.styles == undefined || record.styles == "") record.styles = old.styles;
    if (record.datetime == undefined || record.datetime == "") record.datetime = old.datetime;
    let pos = 0;
    for (; pos<record.styles.length; pos++) {
      if (isDecimal(record.styles[pos])) break;
    }
    if (pos > 0) {
      record.distance = record.styles.slice(pos).toUpperCase();
      record.style = record.styles.slice(0, pos);
    }

    if (record.ageGroup.indexOf("남자") == 0) { record.gender = "men"; record.ageGroup = record.ageGroup.slice(2); }
    if (record.ageGroup.indexOf("여자") == 0) { record.gender = "women"; record.ageGroup = record.ageGroup.slice(2); }
    if (record.ageGroup.indexOf("혼성") == 0) { record.gender = "mixed"; record.ageGroup = record.ageGroup.slice(2); }
    const rec = mskCFG.getHeatName2Code(record);
    record.style = rec.style || "";
    record.round = rec.round;

    old = JSON.parse(JSON.stringify(record));

    const arr = record.datetime.split(".");
    record.datetime = new Date(arr[0], parseInt(arr[1])-1, parseInt(arr[2])+1); // .toISOString().substr(0, 10);

    records.push(record);
		// console.log(`${index}, ${record.ageGroup}, ${record.gender}, ${record.styles}, ${record.distance}, ${record.round}, ${record.datetime}`);
  })
  // =============================================
  // =============================================
  // =============================================
  return records;
}

/**********************************************
 * 
 * crawling site open
 * 
 ***********************************************/

async function close(body) {
	await _page.close();
	await _browser.close();
}
//============================================
async function initializePupper() {
	_browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'], headless:  });

	//-----> open new page
	_page = await _browser.newPage();
	await _page.setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/73.0.3683.103 Safari/537.36");
	//await _page.waitForTimeout(1000);

	console.log("start initializePupper...");
  _isLogin = false;

  return _page;
}

//=================================================
async function writeNewRecordExcel(recordArr, life) {
  const excelHeader = [
    // { label: "#", column: "no", type: "n", width: 30, },
    { label: "gender", column: "gender", type: "s", width: 50, },
    { label: "category", column: "category", type: "s", width: 50, },
    { label: "style", column: "style", type: "s", width: 50, },
    { label: "distance", column: "distance", type: "s", width: 50, },
    { label: "record", column: "record", type: "s", width: 50, },
    { label: "name", column: "name", type: "s", width: 100, },
    { label: "time", column: "time", type: "s", width: 50, },
    { label: "belongTo", column: "belongTo", type: "s", width: 80, },
    { label: "date", column: "date", type: "s", width: 60, },
    { label: "competition", column: "competition", type: "s", width: 200, },
    { label: "pool", column: "pool", type: "s", width: 50, },
  ];

  const filename = `${global.KSF}/record${life?"Masters":""}.xlsx`;
  await excel.write_excel(filename, recordArr, excelHeader);
}

//=============================================================
async function create(dbname=mongoCFG.Medalbank.database) {
  let index = [
    { query: { heatID:1 }, name: "heatID", option: { unique: true }  },
    // { query: { competitionName:1 }, name: "competitionName",  },
    // { query: { "indexes.index":1, "indexes.type":1 }, name: "index",  },
  ];
  let returnObj = { message: "", };

	const collection = "sportsHeats";
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
