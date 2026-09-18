
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

const _homeSports = "https://www.korswim.co.kr/schedule/detail";

let _limit = process.argv.length < 3 ? 1 : Number(process.argv[2]);
let _skip = process.argv.length < 4 ? 0 : Number(process.argv[3]);

//=======================================================
(async () => {

	let result;

// ----->	
let context = {
  query 		: { crawling: false },
  projection: { _id: 0, competitionID: 1, },
  // // sort 			: { competitionID: -1 },
  // skip			: _skip,
  limit			: 10000,
}
result = await mongodb.find("ksfCompetitions", context);
console.log("ksfCompetitions", result.data);

	// 대회정보: sports.or.kr

  let recordArr = await crawling(result.data);
	for (let no=0; no<recordArr.length; no++) {
		console.log(`${no}: ${recordArr[no].competitionID}`);
    result = await mongodb.updateOne("ksfCompetitions", { competitionID: recordArr[no].competitionID }, recordArr[no]);
	}

	console.log(result);

})();

/**********************************************
 * 
 * 대회일정:rts.or.kr
 * 
 ***********************************************/
async function crawling(competitions) {

  await initializePupper();
  /***********************************
   *    search page
   ***********************************/

  let competitionArr = [];
  for (let no=0; no < competitions.length; no++) {
  const url = `${_homeSports}/${competitions[no].competitionID}`
   await _page.goto(url);
console.log("url=", url);
   let result = await getCompetition(_page, competitions[no].competitionID);
   competitionArr.push(result);
  }

  close();

  return competitionArr;
}

//=====================================================
async function getCompetition(search_page, competitionID) {

  const html = await search_page.content();        
  
  let $ = cheerio.load(html);

  const competition = {
    competitionID: competitionID,
    info: '',
    files: [],
    crawling: true,
  };

  const tablePtr = $("form#submitForm table.bbs-view.mgt80");
  let title = $(tablePtr).find("thead tr th p.title");
  let datetime = $(tablePtr).find("thead tr th p.date");
  let filePtr = $(tablePtr).find("thead tr th p.icon-file a");
  filePtr.each((index, elem) => {
    const file = {
      link: "https://www.korswim.co.kr" + $(elem).attr("href"),
      filename: $(elem).text(),
    }
    competition.files.push(file);
  })

  let bodyPtr = $(tablePtr).find("tbody tr td div.detail p");
  let records = [];
  bodyPtr.each((index, elem) => {
    records.push($(elem).text());
  })

  competition.info = records.join('\n');
  // console.log(records);
  return competition;
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
    { query: { competitionID:1 }, name: "competitionID", option: { unique: true }  },
    { query: { competitionName:1 }, name: "competitionName",  },
    { query: { "indexes.index":1, "indexes.type":1 }, name: "index",  },
  ];
  let returnObj = { message: "", };

	const collection = "ksfCompetitions";
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
