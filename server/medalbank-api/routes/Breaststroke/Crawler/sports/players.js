
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

let _limit = process.argv.length < 3 ? 1 : Number(process.argv[2]);
let _skip = process.argv.length < 4 ? 0 : Number(process.argv[3]);



(async () => {

	let result;
	// result = await create(); return;

	// ----->	
	let context = {
		query 		: { player: false },
		projection: { _id: 0 },
		sort 			: { competitionID: -1 },
		skip			: _skip,
		limit			: _limit,
	}
	result = await mongodb.find("sportsHeats", context);
// console.log("heats", result.data.length);

	if (result.data.length == 0) return;

	const heatIDs = result.data.map(el => el.heatID);
console.log("heatIDs=", heatIDs);

	// ----->	
	let playerID =  await mongodb.max("sportsPlayers", "playerID");
console.log("max.playerID=", playerID);

	// 대회정보: sports.or.kr
	// ----------------------------------------------------
	// ----------------------------------------------------
	let crawlingArr = await crawling(result.data);
	// ----------------------------------------------------
	// ----------------------------------------------------
	console.log("crawlingArr=", crawlingArr.length);
// crawlingArr.forEach(el => {
// 	console.log(el);
// })
// return;

	let pIDs = crawlingArr.map(el => el.playerID);
	console.log("+++++ crawling pIDs.length: ", pIDs.length);

	context = {
		query 		: { playerID: { $in: pIDs } },
		projection: { _id: 0, playerID:1 },
		sort 			: { competitionID: -1 },
		limit			: 10000,
	}
	result = await mongodb.find("sportsPlayers", context);
	// console.log("sportsPlayers ~~~~~~", result.data.length);
	let playerIDs = result.data.map(el => el.playerID);
	console.log("+++++ exists playerIDs: ", JSON.stringify(playerIDs));

	const records = [];
	for (let no=0; no<crawlingArr.length; no++) {
		if (playerIDs.find((el) => el == crawlingArr[no].playerID) == undefined) {
			records.push(crawlingArr[no]);
		}
	}
	console.log("crawlingArr=", crawlingArr.length, "records=", records.length);

	for (let no=0; no<records.length; no++) {
		try {
			const res1 = await mongodb.insertOne("sportsPlayers", records[no]);
			console.log(`${no}: ${records[no].playerID}, ${records[no].name}, ${records[no].ageGroup}, ${records[no].heatID}, `);
		} catch (e) {
			console.log("catch:playerID=", records[no].playerID, e);
		}
	}

	// if (records.length > 0) {
	// 	const res1 = await mongodb.insertMany("sportsPlayers", records);
	// }

	// console.log(records.length, "heatIDs: ", heatIDs);
	const res2 = await mongodb.updateMany("sportsHeats", { heatID: { $in: heatIDs } }, { player: true } );

})();
/**********************************************
 * 
 * crawling detail
 * 
 ***********************************************/
async function crawling(heats) {
  // console.log(heat);

  await initializePupper();
  /***********************************
   *    search page
   ***********************************/
	let recordArr = [];
	for (let no=0; no<heats.length; no++) {
		const heat = heats[no];
		// https://result.sports.or.kr/sw/P01.jsp?classCd=E2&toCd=D2Y037&page=32&ppage=114&sexCd=&kindCd=
		// https://result.sports.or.kr/sw/S01.jsp?classCd=E2&toCd=D2Y037&kindCd=&gameDate=&page=32&ppage=114

		// await _page.goto(heat.resultLink);
		// const url = "https://result.sports.or.kr/sw/P01.jsp?classCd=E2&toCd=D2Y037&kindCd=&gameDate=&page=32";

		let records = [];
		let url = "";
		for (let page=1; page < 100; page++) {
			url = heat.resultLink.replace("R02", "P01") + `&ppage=${page}`;
			
			await _page.goto(url);
			records = await getPlayers(_page, heat);
			// if (page%10 == 0) console.log(`#${no}:\tc#${heat.competitionID}, h#${heat.heatID}, ${records.length} / ${recordArr.length},\t${url}`);
			if (records.length == 0) break;
	
			recordArr = [ ...recordArr, ...records ];
		}
		console.log(`#${no}:\tc#${heat.competitionID}, h#${heat.heatID}, ${records.length} / ${recordArr.length},\t${url}`);
	}

  close();

  return recordArr;
}

//==================================
//==================================
//==================================
async function getPlayers(search_page, heat) {

  const html = await search_page.content();        
  
  let $ = cheerio.load(html);

  const tablePtr = $("div#playerListDiv table.sub_board_list tbody tr.board_base");

  const recordArr = [];
  if (tablePtr.length == 0) return recordArr;

  // =============================================
  // =============================================
  // =============================================
  const records = [];
  let old = {};
  tablePtr.each((index, elem) => {

    const trs = $(elem).find("td");
    // if (trs.length != 6) return;
    const record = {
			playerID			: 0,
			// no						: Number(trs.eq(0).text().trim()),
			heatID				: heat.heatID,
			competitionID	: heat.competitionID,
      gender				: trs.eq(1).text().trim(),
      ageGroup			: trs.eq(2).text().replace("남자", "").replace("여자", "").trim(),
      name					: trs.eq(3).text().trim(),
      link					: _homeSports + trs.eq(3).find("a").attr("href"),
      nameEng				: trs.eq(4).text().trim(),
      team					: trs.eq(5).text().trim(),
			crawling			: false,
    }
		let arr = record.link.split('idNo=');
		if (arr.length > 1) {
			arr = arr[1].split('&');
			record.playerID = Number(arr[0]);
		}
		
		if (record.gender != "") {
			record.gender = record.gender=="남" ? "men" : record.gender == "여" ? "women" : "mixed"; 
		}
		// console.log(record);
    records.push(record);
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
    { query: { playerID:1 }, name: "playerID", option: { unique: true }  },
    { query: { "name":1, }, name: "name",  },
  ];
  let returnObj = { message: "", };

	const collection = "sportsPlayers";
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
