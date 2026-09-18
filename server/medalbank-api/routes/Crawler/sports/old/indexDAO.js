const cheerio     = require('cheerio');
const { isDecimal } = require('geolib');
const puppeteer   = require('puppeteer');
const mskCFG 		= require('../../Config/mskCFG');

const utilLibrary = require('../../Util/utilLibrary');


let _browser = "", _page = "", _isLogin = false;

const _home = "https://www.korswim.co.kr";

exports.close = async (body) => {
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

/**********************************************
 * 
 * 대회일정:rts.or.kr
 * 
 ***********************************************/
 exports.competitionSportsRecord = async (body) => {

  let newRecordURL = "";
  // const life = body.life != undefined && body.life ? "life/" : "";
  // const style = body.style != undefined ? body.style : "freestyle";
  // newRecordURL = `${_home}/newRecord/${life}${style}/list`;

  await initializePupper();
  /***********************************
   *    search page
   ***********************************/
  let recordArr = [];
  for (let page=1; page<=32; page++) {

    let url = `${home}?page=${page}`;
    console.log("search page." + url);
  
    await _page.goto(url);
		let records = await getCompetitionSportsRecord(_page);
		recordArr = [ ...recordArr, ...records ];
    // break;
	}

  this.close();

console.log(recordArr.length, recordArr[0]);
  return recordArr;
}

async function getCompetitionSportsRecord(search_page) {

  const html = await search_page.content();        
  
  let $ = cheerio.load(html);

  const tablePtr = $("div#tourDiv table.board_list tbody tr.board_base");

  const recordArr = [];
  // =============================================
  // =============================================
  // =============================================
  const records = [];
  tablePtr.each((index, elem) => {

    const trs = $(elem).find("td");
    const record = {
      no: trs.eq(0).text().trim(),
      name: trs.eq(1).text().trim(),
      link: home + trs.eq(1).find("a").attr("href"),
      date: trs.eq(2).text().trim(),
      place: trs.eq(3).text().trim(),
    };
    if (record.date == '~') record.date = '';
// console.log(record);
    records.push(record);
  })
  // =============================================
  // =============================================
  // =============================================
console.log("records=", records.length);
  return records;
}

/**********************************************
 * 
 * crawling detail
 * 
 ***********************************************/
const home = "https://result.sports.or.kr/sw/";
exports.competitionSportsDetail = async (body) => {
  console.log(body);
  let returnObj = { message: '', };
  let result, query, projection;

  let newRecordURL = "";
  // const life = body.life != undefined && body.life ? "life/" : "";
  // const style = body.style != undefined ? body.style : "freestyle";
  // newRecordURL = `${_home}/newRecord/${life}${style}/list`;

  await initializePupper();
  /***********************************
   *    search page
   ***********************************/
  let recordArr = [];
  // for (let page=1; page<=32; page++) {
let page = 1;
    let url = `${home}?page=${page}`;
    console.log("competitionSportsDetail.url." + url);
    url = "https://result.sports.or.kr/sw/S01.jsp?classCd=D2&toCd=202208143&kindCd=&gameDate=&page=1";
    // url = "https://result.sports.or.kr/sw/S01.jsp?classCd=D2&toCd=202208283&kindCd=&gameDate=&page=1";

    url = "https://result.sports.or.kr/sw/S01.jsp?classCd=D2&toCd=202208143&page=1";

    await _page.goto(url);
		let records = await getCompetitionSportsDetail(_page);
		// recordArr = [ ...recordArr, ...records ];
    // break;
	// }

  this.close();

console.log(records.length, records[0]);
  return records;
}

async function getCompetitionSportsDetail(search_page) {

  const html = await search_page.content();        
  
  let $ = cheerio.load(html);

  const tablePtr = $("div#scheduleListDiv table.sub_board_list tbody tr.board_base");
console.log("+++++++", tablePtr.length);

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
      datetime: trs.eq(0).text().trim(),
      styles: trs.eq(1).text().trim(),
      ageGroup: trs.eq(2).text().trim(),
      round: trs.eq(3).text().trim(),
      startLink: home + trs.eq(4).find("a").attr("href"),
      resultLink: home + trs.eq(5).find("a").attr("href"),
    };
    if (record.date == "") record.date = old.date;
    if (record.styles == "") record.styles = old.styles;
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


    const arr = record.datetime.split(".");
    record.datetime = new Date(arr[0], parseInt(arr[1])-1, parseInt(arr[2])+1); // .toISOString().substr(0, 10);

    records.push(record);
    old = JSON.parse(JSON.stringify(record));
  })
  // =============================================
  // =============================================
  // =============================================
  return records;
}

/**********************************************
 * 
 * 대회일정:rts.or.kr
 * 
 ***********************************************/
exports.competitionSportsList = async (body) => {
  console.log(body);
  let returnObj = { message: '', };
  let result, query, projection;

  let newRecordURL = "";
  // const life = body.life != undefined && body.life ? "life/" : "";
  // const style = body.style != undefined ? body.style : "freestyle";
  // newRecordURL = `${_home}/newRecord/${life}${style}/list`;

  await initializePupper();
  /***********************************
   *    search page
   ***********************************/
  let recordArr = [];
  for (let page=1; page<=32; page++) {

    let url = `${home}?page=${page}`;
    console.log("search page." + url);
  
    await _page.goto(url);
		let records = await getCompetitionSports(_page);
		recordArr = [ ...recordArr, ...records ];
    // break;
	}

  this.close();

console.log(recordArr.length, recordArr[0]);
  return recordArr;
}

async function getCompetitionSports(search_page) {

  const html = await search_page.content();        
  
  let $ = cheerio.load(html);

  const tablePtr = $("div#tourDiv table.board_list tbody tr.board_base");

  const recordArr = [];
  // =============================================
  // =============================================
  // =============================================
  const records = [];
  tablePtr.each((index, elem) => {

    const trs = $(elem).find("td");
    const record = {
      no: trs.eq(0).text().trim(),
      name: trs.eq(1).text().trim(),
      link: home + trs.eq(1).find("a").attr("href"),
      date: trs.eq(2).text().trim(),
      place: trs.eq(3).text().trim(),
    };
    if (record.date == '~') record.date = '';
// console.log(record);
    records.push(record);
  })
  // =============================================
  // =============================================
  // =============================================
console.log("records=", records.length);
  return records;
}
