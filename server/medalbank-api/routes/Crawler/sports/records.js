
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

// 신기록
// https://www.korswim.co.kr/page/14_2

// const _homeSports = "https://result.sports.or.kr/sw/";
const _homeSwim = "https://www.korswim.co.kr";

let _count = process.argv.length < 3 ? 50 : Number(process.argv[2]);

(async () => {

	let result;
	let recordID =  await mongodb.max(mongoCFG.Medalbank.records, "recordID");
	console.log("recordID=", recordID);

	let life = true;
  recordArr = await crawling({ life: life, });
	for (let no=0; no<recordArr.length; no++) {
		recordArr[no].recordID = recordID++;
		console.log(recordArr[no].distance);
		if (recordArr[no].distance != undefined) recordArr[no].distance = Number(recordArr[no].distance.replace("m", ""));
		switch (recordArr[no].record) {
			case "world":
				recordArr[no].rank = 1;
				break;
			case "olympic":
				recordArr[no].rank = 2;
				break;
			case "asia":
				recordArr[no].rank = 3;
				break;
			case "korea":
				recordArr[no].rank = 4;
				break;
		}
	}
	// result = await mongodb.insertMany(mongoCFG.Medalbank.records, recordArr);
	// await writeNewRecordExcel(recordArr, life);
	console.log(recordArr[0], recordArr.length);

	life = false;
  recordArr = await crawling({ life: life, });
	for (let no=0; no<recordArr.length; no++) {
		recordArr[no].recordID = recordID++;
		if (recordArr[no].distance != undefined) recordArr[no].distance = Number(recordArr[no].distance.replace("m", ""));
	}
	// result = await mongodb.insertMany(mongoCFG.Medalbank.records, recordArr);
	// await writeNewRecordExcel(recordArr, life);
	const context = {
		query 		: { category: { $ne: "pro" } },
		projection: { _id: 0 },
		sort 			: { category: 1, gender: 1, style: 1, distance: 1, time: 1 },
		limit			: _count,
	}

	result = await mongodb.find(mongoCFG.Medalbank.records, context);
	let o = result.data[0];
	let rank = 5 + (o.category=='junior' ? 1 : 0);
	for (let no=0; no<result.data.length; no++) {
		const t = result.data[no];
		if (t.category != o.category || t.gender != o.gender || t.style != o.style || t.distance != o.distance) {
			rank = 5 + (t.category=='junior' ? 1 : 0);
			o.category	= t.category;
			o.gender 		= t.gender;
			o.style 		= t.style;
			o.distance 	= t.distance;
			console.log(`---${t.category}, ${t.gender}, ${t.style}, ${t.distance}, ${t.times}, ${rank} `);
			const query = { recordID: t.recordID };
			const value = { rank: rank++ };
			const res = await mongodb.updateOne(mongoCFG.Medalbank.records, query, value);
		}
	}
	console.log(recordArr[0], recordArr.length);

})();
/**********************************************
 * 
 * crawling detail
 * 
 **************************************stylesEngKor**skCFG.stylesEngKor*******/
async function crawling(body) {
  console.log(body);
  let returnObj = { message: '', };
  let result, query, projection;

  let newRecordURL = "";
  // const life = body.life != undefined && body.life ? "life/" : "";
  // const style = body.style != undefined ? body.style : "freestyle";
  // newRecordURL = `${_homeSwim}/newRecord/${life}${style}/list`;

  await initializePupper();
  /***********************************
   *    search page
   ***********************************/
  let recordArr = [];
   for (let no=0; no<mskCFG.stylesEngKor.length; no++) {
    const style = mskCFG.stylesEngKor[no].eng;

    const life = body.life != undefined && body.life ? "life/" : "";
console.log("style=", style, "life=", life)    
    // const style = body.style != undefined ? body.style : "freestyle";
    newRecordURL = `${_homeSwim}/newRecord/${life}${style}/list`;
    console.log("search page." + newRecordURL);
  
    await _page.goto(newRecordURL);
		let records;
    if (body.life == true) {
      records = await getMasters(_page, style);
    } else {
      records = await getPro(_page, style);
    }
		recordArr = [ ...recordArr, ...records ];
	}

  close();

// console.log(recordArr);
  return recordArr;
}

/**********************************************
 * 
 * crawling site open
 * 
 ***********************************************/
async function getMasters(search_page, style) {
  // await search_page.waitForTimeout(500);

  // await search_page.click(".button_search", {delay: 100});
	// await infinityScroll(_page);
  // await search_page.waitForTimeout(1000);

  const html = await search_page.content();        
  
  let $ = cheerio.load(html);

  const _record = ["world", "olympic", "asia", "korea", ];
  const _contents = $("div.contents");
  const genderPtr = _contents.find("h4");
  tablePtr = _contents.find("div.records");
console.log(tablePtr.length);

  const recordArr = [];
  let _distance = [];
  // =============================================
  // =============================================
  // =============================================
  tablePtr.each((index, elem) => {
    const records = [];

    let str = genderPtr.eq(index).text().replace("*성인부의 경우 만나이로 함", "").trim();
		let arr = (str+">").split('>');
		let gender = arr[0].trim();
		gender = (gender == "남자" ? "men" : (gender == "여자" ? "women" : "mixed"));
		let category = arr[1].trim();
		category = (category.indexOf("학생")  < 0 ? "masters" : "junior"); 
    console.log("gender=", gender, "category=", category);

    const trs = $(elem).find("div");
    // console.log("trs.div", trs.length);

    //-----> distance
    const thPtr = $(elem).find("div.unit p");
    thPtr.each((index, th) => {
      const txt = $(th).text();
      if (txt != "/") {
        _distance.push(txt);
        // record.distance = txt;
        // records.push(record);
      }
    })

    const tds = $(elem).find("ul.records-slide li");
    // console.log("_distance", _distance, "tds", tds.length, "tablePtr", tablePtr.length);

    tds.each((idx, el) => {
  
      const title = $(el).find("p.records-slide-tit").text();
      
      const divPtr = $(el).find("div.records-slide-desc div.desc-center");
      divPtr.each((index, el) => {
				const record = { gender: gender, category: category, style:style, distance:_distance[index], record:title, name:"", time:"", belongTo:"", date:"", competition:"", place:"", };
        const pptr = $(el).find("p");
        let per = {};
        record.times = pptr.eq(0).text();
				if (record.times != '') {
					record.time = utilDate.string2timestamp(record.times);
					str = pptr.eq(1).text();
					arr = (str+"(").split("(");
					record.name = arr[0].trim();
					record.belongTo = arr[1].replace(")", "").trim();
					str = pptr.eq(2).text();
					arr = str.split(".");
					record.date = new Date(arr[0], arr[1], parseInt(arr[2])+1).toISOString().substr(0, 10);
					// console.log(str, arr, record.date);

					record.competition = pptr.eq(3).text();

          const ck = recordArr.find(rec => rec.gender==record.gender && rec.category==record.category && rec.style==record.style && rec.distance==record.distance && rec.record==record.record && rec.time==record.time && rec.name==record.name)
          if (ck == undefined) {
            console.log("-----------------", record);
					  recordArr.push(record);
          } else {
            console.log("~~~~~~~~~~~~~~~~~~~~", ck);
          }
				}
      })
      // console.log("----->", recordArr.length);
      // recordArr = [ ...recordArr, ...records ];
      // recordArr.push(JSON.parse(JSON.stringify(record)));
    })
    // return;
  })
  // =============================================
  // =============================================
  // =============================================
console.log("parsing-table=", recordArr.length);
  return recordArr;
}

async function getPro(search_page, style) {
  // await search_page.waitForTimeout(500);

  // await search_page.click(".button_search", {delay: 100});
	// await infinityScroll(_page);
  // await search_page.waitForTimeout(1000);

  const html = await search_page.content();        
  
  let $ = cheerio.load(html);

  const _record = ["world", "olympic", "asia", "korea", ];
  const _contents = $("div.contents");
  const genderPtr = _contents.find("h4");
  tablePtr = _contents.find("div.records");
console.log(tablePtr.length);

  const recordArr = [];
  let _distance = [];
  tablePtr.each((index, elem) => {

    let gender = genderPtr.eq(index).text();
		gender = (gender == "남자" ? "men" : (gender == "여자" ? "women" : "mixed"));
    // console.log("gender=", gender);

    const trs = $(elem).find("tbody tr");
    // console.log("trs", trs.length);

    //-----> distance
    const thPtr = trs.find("th");
    thPtr.each((index, th) => {
      // _distance[index] = $(th).text();
      _distance.push($(th).text());
    })
    // console.log("_distance", _distance);
  
    const tds = trs.find("td");
    tds.each((idx, el) => {
      const record = { gender: gender, category: 'pro', style:style, distance:"", record:"", name:"", time:"", belongTo:"", date:"", competition:"", place:"", };
      record.distance = _distance[parseInt(idx/4)];
      record.record = _record[idx % 4];
      
      const td = $(el).find("p");
      record.times = td.eq(0).text().trim();
      if (record.times == "") return;
			record.time = utilDate.string2timestamp(record.times);
      // console.log("++++++", td.length, record.time);
      let str = td.eq(1).text().trim();

      let arr = (str+'\n').split('\n');
      record.name = arr[0].trim();
      record.belongTo = arr[1].replace("(", "").replace(")", "").trim();
// console.log(record, arr, str);
// return1;
      str = td.eq(2).text().trim();
      // console.log(Buffer.from(str.substr(11,2)));
      arr = str.split('\xa0');

			const arr1 = arr[0].split(".");
			record.date = new Date(arr1[0], parseInt(arr1[1])-1, parseInt(arr1[2])+1).toISOString().substr(0, 10);
// console.log(arr[0], arr1, record.date);

      str = arr[1].trim();
      arr = (str+',').split(',');
      record.competition = arr[0].trim();
      record.place = arr[1].trim();
      if (record.place == '') record.place = 'KOR';

      recordArr.push(JSON.parse(JSON.stringify(record)));
      // console.log(idx, records[records.length-1], record);
    })
  })
// console.log("parsing-table=", records);
  return recordArr;
}
async function close(body) {
	await _page.close();
	await _browser.close();
}
//============================================
async function initializePupper() {
	_browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'], headless: 'new' });

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
    { label: "place", column: "place", type: "s", width: 50, },
  ];

  const filename = `${global.KSF}/record${life?"Masters":""}.xlsx`;
  await excel.write_excel(filename, recordArr, excelHeader);
}
