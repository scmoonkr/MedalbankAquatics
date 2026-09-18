const puppeteer   = require('puppeteer');
const cheerio     = require('cheerio');
const fs          = require("fs");
const utilLibrary = require('../../Util/utilLibrary');

const excelLibrary= require('../../Util/excelLibrary');
const excel	      = new excelLibrary();

const mongoDB     = require('../../Class/MongoDB');
const mongoCFG    = require('../../Config/mongoCFG');
const mongodb     = new mongoDB("MedalBank");

const UtilDate    = require("../../Util/utilDate");
const utilDate	  = new UtilDate();

const utilCrawling= require("../utilCrawling");
const {_competitions}= require("./competitionsJSON");
//============================================

const collectionName = mongoCFG.Medalbank.myRankingTimes;

const _home = "http://www.myranking.co.kr/";
let _limit = process.argv.length < 3 ? 10 : Number(process.argv[2]);
let _skip = process.argv.length < 4 ? 0 : Number(process.argv[3]);

let pageno = 1;
//============================================
(async () => {

	const context = {
		query				: { name: { $gte: "가" }, crawling: { $exists: false }  },
		projection	: { _id:0 },
		limit				: _limit,
		skip				: _skip,
		sort				: { name: 1 },
	}
	const result = await mongodb.find("myRankingNames", context);
	if (result.data.length == 0) return;
	_limit = result.data.length;

	// let result = { data: [{ name:"문성중" }] };
	//-----------------------------------------------------
	const browser = await utilCrawling.openPuppeteer("new"); // configList.headless);
	//-----------------------------------------------------
	let page = await browser.newPage();
	await page.setViewport({ width: 1000, height: 800 });
	const userAgent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36";
	page.setUserAgent(userAgent);

	await page.goto(_home, {timeout: 30000})

	console.log("\n\n\nlimit=", _limit, ", skip=", _skip, "\n\n");

	let cno = 0;
	for (const data of result.data) {

		console.log(`${data.name}: ${cno++}/${_limit}`);
		console.time(`timestamp`);
		const times = await searchName(page, data.name);

		// check name
		let tid = await mongodb.max(mongoCFG.Medalbank.myRankingTimes, "tid");
		const first = data.name.slice(0, 1);
		
		for (const time of times) {
			const arr = time.name.split(",");
			if (arr.length > 1) {
				time.names = time.name;
			}
			time.tid = tid++;
			time.name = data.name;
		}

		let crawling = true;
		if (times.length == 0) {
			crawling = false;
		} else {
			await mongodb.insertMany(mongoCFG.Medalbank.myRankingTimes, times);
		}
		await mongodb.updateOne("myRankingNames", { name: data.name }, { crawling: crawling } );


		console.timeEnd(`timestamp`);
		console.log(".................\n");
	}

	await page.close();
	//-----------------------------------------------
	utilCrawling.closePuppeteer(browser);

})();

//=============================================
//=============================================
//=============================================
async function searchName(page, name) {
	const inputSelector = "div.text_search > input[name='search_name']";
	await page.type(inputSelector, name);

	await page.waitForSelector("#mag_btn");
	
  // Enter 키 누르기
  await page.keyboard.press('Enter');

  // 페이지가 완전히 로드될 때까지 기다림
  await page.waitForNavigation();

	const html = await page.content(); 
	const $ = cheerio.load(html);

	const competitions = [];
	const tableSelector = $("#result_list > dd.resultList");
	try {
		tableSelector.each((index, elem) => {
			let value = {};
			// check times, rank, imageStyle			
			const imgSelector = $(elem).find("span img");
			const times = [];
			imgSelector.each((no, el) => {
				const attr = $(el).attr("src");
				if (attr.includes("record")) {
					times.push(attr);
				} else if (attr.includes("medal")) {
					value.rank = attr;
				}
			})
			// times
			if (times.length > 4) {
				const images = [];
				times.forEach(src => {
					if (src) {
						src = src.replace("../img/record/WW", '').replace("ups", ":").replace(/\./gi, "").replace(/pnt|png/gi, ".");
						images.push(src.replace(".", ""));
					}
				})
				value.times = images.join('');
			}
			
			const span = $(elem).find("span");

			value.name = $(span).eq(0).text().trim();
			value.team = $(span).eq(1).text().trim();
			value.ageGroup = $(span).eq(2).text().trim();
			value.style = $(span).eq(3).text().trim();

			if (value.rank) {
				value.rank = value.rank.replace(/\/img\/medal_|.png/gi, "").replace("gold", 1).replace("silver", 2).replace("bronze", 3);
			} else {
				value.rank = $(span).eq(span.length-2).text().trim();
			}
			value.competitionName = $(span).eq(span.length-1).text().trim();
			const values = [];

			// team
			if (!value.team) {
				const team = $(span).eq(1).find("img.clubLogo");
				if (team) {
					value.team = team.attr("title");
				}
			}

			value = customizing(value);
			competitions.push(value);

		});
	} catch (e) {
		console.log("catch.", e);
	} // try

	console.log("times: ", competitions.length);
	return competitions;
}

function customizing(value) {
	let arr = (value.name+"|").split('OO')
	if (arr.length > 1) {
		value.name = value.name.replace(/OO/gi, "OO,").slice(0, -1)
	}

	value.rank = value.rank.replace("위", '');
	if (!isNaN(value.rank)) {
		value.rank = Number(value.rank);
	} else {
		value.status = value.rank;
		value.rank = "";
	}

	// gender, ageGroup
	arr = value.ageGroup.split(' ')
	value.gender = arr[0];
	value.ageGroup = arr.slice(1).join(' ').trim();

	// gender
	switch (value.gender) {
		case "남자": value.gender = "men"; break;
		case "여자": value.gender = "women"; break;
		default: value.gender = "mixed"; break;
	}

	// style, distance
	arr = value.style.split(' ')
	value.style = arr[0];
	value.distance = arr.slice(1).join(' ');	

	arr = value.distance.split("M");
	if (arr.length > 1) {
		value.distance = arr[0] + 'M';
		value.round = arr[1];
	}

	if (value.style.includes("혼성")) {
		value.gender = "mixed";
		value.style = "계영"
	}
	// style
	switch (value.style) {
		case "자유형"		: value.style = "freestyle"; 				break;
		case "배영"			: value.style = "backstroke"; 			break;
		case "평영"			: value.style = "breaststroke"; 		break;
		case "접영"			: value.style = "butterfly"; 				break;
		case "개인혼영"	: value.style = "individualMedley"; break;
		case "계영"			: value.style = "freestyleRelay"; 	break;
		case "혼계영"		: value.style = "medleyRelay"; 			break;
	}

	// times - times: '/img/icon_freejpg35.59',
	arr = value.times.split("jpg");
	if (arr.length > 1) {
		value.times = arr[1]
	}

	// times, time
	if (value.times.length >= 4) {
		value.time = utilDate.convertString2Timestamp(value.times);
	}

	// competitionName, datetime
	if (value.competitionName.length > 10) {
		value.datetime = value.competitionName.slice(-10);

		if (isNaN(value.datetime.slice(0,4))) {
			value.datetime = "";
		} else {
			value.competitionName = value.competitionName.slice(0, -10).replace('\n', '').trim();
		}
	}

	// check competitionID
	const competition = _competitions.find(comp => comp.name == value.competitionName);
	if (competition) {
		value.cid = Number(competition.cid);
	}

	return value;
}