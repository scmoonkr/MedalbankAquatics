
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

let _competitions = [];

(async () => {

	let result;

	// result = await create(); return;

	// ----->	
	let timeID =  await mongodb.max(mongoCFG.Medalbank.sportsTimes, "timeID");

	// ----->	
	let context = {
		query 		: { crawling: false },
		projection: { _id: 0 },
		// sort 			: { competitionID: -1 },
		limit			: _limit,
		skip			: _skip,
	}
	result = await mongodb.find("sportsPlayers", context);
	console.log("playerIDs", result.data);
	if (result.data.length == 0) return;
	const playerArr = result.data;
	const playerIDs = playerArr.map(el => el.playerID);
console.log("playerIDs=", playerIDs);	


	context = {
		query 		: { playerID: { $in: playerIDs } },
		projection: { _id: 0, playerID:1 },
		limit			: 10000,
	}
	result = await mongodb.find(mongoCFG.Medalbank.sportsTimes, context);
	// console.log("sportsTimes ~~~~~~", result.data);
	let players = [];
	playerArr.forEach(player => {
		if (result.data.find(pid => pid.playerID == player.playerID) == undefined) players.push(player);
	})
	console.log("players=", players.length);
	if (players.length > 0) {
		context = {
			query 		: { type: "경영"},
			projection: { _id: 0, competitionID:1, competitionName: 1 },
			limit			: 10000,
		}
		result = await mongodb.find(mongoCFG.Medalbank.sportsCompetitions, context);
		_competitions = result.data;
	console.log("_competitions", _competitions.length);
	// console.log(playerArr);

		// 대회정보: sports.or.kr
		// ----->	
		let recordArr = await crawling(players);
	console.log("times.length=", recordArr.length);

		for (let no=0; no<recordArr.length; no++) {
			if (no%10 == 0) console.log(no, recordArr.length, timeID);
			recordArr[no].timeID = timeID++;
			// const res1 = await mongodb.updateOne(mongoCFG.Medalbank.sportsTimes, { timeID: recordArr[no].timeID }, recordArr[no]);
		}
		const res1 = await mongodb.insertMany(mongoCFG.Medalbank.sportsTimes, recordArr);
		console.log("recordArr.length=", recordArr.length);
	}
	const res2 = await mongodb.updateMany("sportsPlayers", { playerID: { $in: playerIDs } }, { crawling: true } );

})();
/**********************************************
 * 
 * crawling detail
 * 
 ***********************************************/
async function crawling(players) {

  await initializePupper();
  /***********************************
   *    search page
   ***********************************/
	let recordArr = [];
	for (let no=0; no<players.length; no++) {
		const player = players[no];

		const url = player.link.replace("R02", "P01");
		await _page.goto(url);

		let records = await getPlayers(_page, player);

		recordArr = [ ...recordArr, ...records ];
		console.log(`#${no}:\tc#${player.competitionID}, h#${player.heatID}, ${records.length} / ${recordArr.length},\t${url}`);
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

  const userPtr = $("div.tabs_title_line table.user_info tbody tr");
  // const tablePtr = $("div.tabs_title_line table.sub_board_list tbody tr");
  let tablePtr = $("div.tabs_title_line table.sub_board_list");

	let player = {
		playerID: heat.playerID,
		name: $('td#playerDetailName').text(),
		gender: $('td#playerSexName').text(),
		birth: $('td#playerDetailBirth').text().replace("년", "").trim(),
	};
console.log("player=", player);

	tablePtr = tablePtr.eq(1).find("tbody tr");
	// console.log("tablePtr=", tablePtr.length);

  const recordArr = [];
  if (tablePtr.length == 0) return recordArr;

  // =============================================
  // =============================================
  // =============================================
  const records = [];
  let old = {};
	player.gender = player.gender == '남' ? 'men' : 'women';
	let record = {};
	let competition = {};
  tablePtr.each((index, elem) => {

    const trs = $(elem).find("td");

		if (trs.length < 7) {
			const competitionName = trs.eq(0).text().trim();
			const id = _competitions.find((el) => el.competitionName == competitionName);
			if (id != undefined) {
				competition = id;
			}
			// console.log("competitionName=", competitionName, competition);
		} else {
			record = {
				playerID			: heat.playerID,
				name					: player.name,
				gender				: player.gender,
				birth					: player.birth,
				style					: '',
				distance			: '',
				datetime			: trs.eq(0).text().trim(),
				round					: trs.eq(2).text().trim(),
				ageGroup			: trs.eq(3).text().trim(),
				team					: trs.eq(4).text().trim(),
				times					: trs.eq(5).text().trim(),
				time					: 0,
				rank					: trs.eq(6).text().trim(),
				competitionName: competition.competitionName,
				competitionID	: competition.competitionID,
				styles				: trs.eq(1).text().trim(),
				// crawling			: false,
			}
			if (record.rank != '') record.rank = Number(record.rank); else record.rank = 0;
			// record.round = record.round.replace("예선경기", "preliminary ").replace("준결승", "semiFinal ").replace("결승", "final ").trim();
			record.round = record.round.indexOf("예선") == 0 ? "preliminary" : record.round.indexOf("준결승") == 0 ? "semiFinal" : record.round.indexOf("결승") == 0 ?  "final" : "";
			let pos = 0;
			for (; pos<record.styles.length; pos++) {
				if (isDecimal(record.styles[pos])) break;
			}
			if (pos > 0) {
				record.distance = record.styles.slice(pos).toUpperCase();
				record.style = record.styles.slice(0, pos);
				const rec = mskCFG.getHeatName2Code(record);
				record.style = rec.style || "";
			}
				
			if (record.datetime == "") record.datetime = old;
			old = record.datetime;

			// console.log("~~~~~", record.datetime);
			if (typeof record.datetime == "string" && record.datetime != undefined && record.datetime != "" && record.datetime != "0000.00.00") {
				const arr = record.datetime.split('.');
				if (arr.length >= 3) {
					record.datetime = new Date(arr[0], parseInt(arr[1])-1, parseInt(arr[2])+1).toISOString().substr(0, 10);
				}
			}

			record.time = utilDate.string2timestamp(record.times);
			// console.log(">", record); // .name, record.styles, record.times, record.competitionName);
    	records.push(record);
		}
  })

	// player.records = records;
	// console.log(player.records);
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
    { query: { timeID:1 }, name: "timeID", option: { unique: true }  },
    { query: { playerID:1, }, name: "playerID",  },
    { query: { name:1, }, name: "name",  },
    { query: { competitionID:1, gender:1, style:1, distance:1, round:1, name:1 }, name: "timeName",  },
  ];
  let returnObj = { message: "", };

	const collection = mongoCFG.Medalbank.sportsTimes;
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
