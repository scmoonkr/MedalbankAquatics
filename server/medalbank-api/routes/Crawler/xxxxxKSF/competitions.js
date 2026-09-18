
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

const _homeSports = "https://www.korswim.co.kr/schedule/list";

//=======================================================
(async () => {

	let result;

	// result = await create(); return;

	let competitionID =  await mongodb.max("ksfCompetitions", "competitionID");

	// 대회정보: sports.or.kr

  let recordArr = await crawling();
	// for (let no=0; no<recordArr.length; no++) {
	// 	console.log(`${no}: ${recordArr[no].competitionID}, ${recordArr[no].competitionName}`);
	// }
	result = await mongodb.insertMany("ksfCompetitions", recordArr);

	console.log(recordArr, recordArr.length);

})();

/**********************************************
 * 
 * 대회일정:rts.or.kr
 * 
 ***********************************************/
async function crawling(body) {
  let returnObj = { message: '', };
  let result, query, projection;

  let newRecordURL = "";

  await initializePupper();
  /***********************************
   *    search page
   ***********************************/
   await _page.goto(_homeSports);

   let recordArr = [];
  let lastPage = 1000;
  for (let page=1; page < lastPage; page++) {
    console.log("page# ", page);
    await _page.waitForSelector('form#searchForm');
  
		let result = await getCompetition(_page);
		recordArr = [ ...recordArr, ...result.records ];
    lastPage = result.lastPage;
    console.log("-----------------------", result.records.length, result.records[0].competitionName);
    // if (page >= 3) break;

    //
    // click detail
    //
    await _page.evaluate((page) => {
      document.querySelector(`div#container div.contents div.paging a.btn-paging.next`).click();
    }, );
	}

  close();

  return recordArr;
}

//=====================================================
async function getCompetition(search_page) {

  const html = await search_page.content();        
  
  let $ = cheerio.load(html);

  const tablePtr = $("form#searchForm ul.bbs-list.no-line li");
console.log(tablePtr.length);

let arr = $("a.btn-paging.last").attr("onclick").split(',');
arr = (arr[0]+"(").split('(');
const lastPage = Number(arr[1]);
console.log("lastPage=", lastPage);

  const recordArr = [];
  // =============================================
  // =============================================
  // =============================================
  const records = [];
  tablePtr.each((index, elem) => {

    const datetime = ($(elem).find("div.info").text()+'\n').split("\n");
    const name = $(elem).find("div.cont");
    arr = name.text().split('\n');
    const pool = $(elem).find("div.cont span").text();
    arr = (name.find("a").attr("onclick")+"(").split("(");
    const competitionID = Number(arr[1].replace(")", ""));

    arr = (datetime[2].trim()+"[").split("[");
    const domestic = arr[1].replace("]", "");
    const datetimeEnd = arr[0].replace("~ ", "").slice(0, 10);
// console.log(name.text(), arr, pool.text(), datetime, Number(arr[1].replace(")", "")));
    const record = {
      competitionID		: competitionID,
      competitionName	: name.text().split('\n')[3].trim().slice(0, pool.length * -1),
      datetime				: datetime[1].trim(),
      datetimeEnd			: datetimeEnd,
      pool						: pool,
      domestic				: domestic,
      // link						: _homeSports + trs.eq(1).find("a").attr("href"),
			crawling				: false,
    };
    
// console.log(record);
    records.push(record);
  })
  // =============================================
  // =============================================
  // =============================================
  return { lastPage: lastPage, records: records };
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
	_browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'], headless: true });

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
