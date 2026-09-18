const { resolve } = require('promise');
const puppeteer   = require('puppeteer');
const cheerio     = require('cheerio');
const fs          = require("fs");
const excelLibrary= require('../../Util/excelLibrary');
const excel	      = new excelLibrary();
const utilLibrary = require('../../Util/utilLibrary');
const UtilDate    = require("../../Util/utilDate");
const utilDate	  = new UtilDate();
const mongoDB     = require('../../Class/MongoDB');
const mongoCFG    = require('../../Config/mongoCFG');
const mongodb     = new mongoDB("MSKR");
const utilCrawling= require("../utilCrawling");
const { times } = require('../../database/athletes/customDAO');
//============================================

const _home = "http://www.myranking.co.kr/";
let _year = process.argv.length < 3 ? 0 : Number(process.argv[2]);

let pageno = 1;
//============================================
(async () => {
	let result;
	let query = {};

	// _year = _year == 0 ? { $lt: 2023 } : Number(_year);
	if (_year == 0) {
		query = { crawling: false }; // { crawling: { $exists: false } }; // year: { $lt: 2023 }, 
	} else {
		query = { year: Number(_year) };
	}
	const context = {
		query				: query,
		projection	: { _id:0, no:1, seq:1, year:1, cid:1, name:1},
		limit				: 1000,
		skip				: 0,
	}
	result = await mongodb.find("myCompetitions", context );
	const competitions = JSON.parse(JSON.stringify(result.data));
	console.log(competitions);

	//-----------------------------------------------------
	const browser = await utilCrawling.openPuppeteer(false); // configList.headless);
	//-----------------------------------------------------
	let page = await browser.newPage();
	await page.setViewport({ width: 1000, height: 800 });
	const userAgent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36";
	page.setUserAgent(userAgent);
	const url = "https://librarian.nl.go.kr/LI/contents/L20101000000.do?browsingYn=Y&searchType=detail&acType=0&browsingDetailActivity=&browsingDetailJob=&browsingDetailOrgType=&browsingDetailRegion=";
	// await page.goto(url, {waitUntil: 'load', timeout: configCrawling.timeout || 30000})

// 	const no = 0;
// const yearAnchor = $("#history_show > ul > li.sub1_tab > span");
// console.log("yearAnchor=", yearAnchor.length);
	
	for (let competition of competitions) {
		result = await competitionsPage(page, competition);
		result = await mongodb.updateOne("myCompetitions", { cid: competition.cid }, { crawling: result.length > 0 });
		// break;
	}



	//-------------------------------------------
	//-------------------------------------------
	console.log(".......end");

	//-----------------------------------------------
	await page.close();
	utilCrawling.closePuppeteer(browser);

})();

const delay = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));

const _categoryArr = ["adult_records_btn", "student_records_btn"];
const _genderArr = ["남자", "여자", "혼성"];

//============================================================
async function competitionsPage(page, competition) {
		let timeArr = [];

		let maxPage = 5;
		//for (let no=0; no<maxPage; no++) {
			
			await page.goto(_home, {timeout: 30000})

			console.log(competition.seq, "---------------->");

			await page.click("#history_btn");

			const yearid = `#btn_${competition.year}`;		
			console.log(yearid);
			await page.click(yearid);
	
			let html = await page.content(); 
			let $ = cheerio.load(html);	
	
			const table = $(`#y_${competition.year} > dl > dd`);
			const name = $(`#y_${competition.year} > dl > dd:nth-child(${competition.seq+2}) > span.s1 > form > label`);
			competitionName = name.text();
			const competitionID = name.attr("for").replace("name", "");
			console.log(competition.year, competition.seq, "+++++++++++++++++++++ year=", competition.year, "table=", table.length, "name=", competitionName, competitionID);
			maxPage = table.length;

			try {
				let anchor = `#y_${competition.year} > dl > dd:nth-child(${competition.seq+2}) > span.s1 > form > label`;

				// click 대회 페이지
				await page.click(anchor);

				// 대회 결과
				await page.waitForSelector("#detail_btn");
				await page.click("#detail_btn");
				await delay(2000);
				await page.click("#container > ul.tab_btn.tab_cate > li.active");
				await delay(1000);



				html = await page.content(); 
				$ = cheerio.load(html);	
		
				// 대회정보
				const competitionArr = {};
				let ptr = $("#search_sector > div.competition_info > div.page_half.comp_poster > img");	
				competitionArr.poster = ptr.attr("src");			

				ptr = $("#search_sector > div.competition_info > div.page_half.comp_detail > dl > dd:nth-child(2)");	
				competitionArr.competitionName = ptr.text();

				ptr = $("#search_sector > div.competition_info > div.page_half.comp_detail > dl > dd:nth-child(3)");	
				competitionArr.datetime = ptr.text();

				ptr = $("#search_sector > div.competition_info > div.page_half.comp_detail > dl > dd:nth-child(4)");	
				competitionArr.pool = ptr.text();

				ptr = $("#search_sector > div.competition_info > div.page_half.comp_detail > dl > dd:nth-child(5)");	
				competitionArr.pool = ptr.text();

				ptr = $("#search_sector > div.competition_info > div.page_half.comp_detail > dl > dd:nth-child(6)");	
				competitionArr.juchoi = ptr.text();

				ptr = $("#search_sector > div.competition_info > div.page_half.comp_detail > dl > dd:nth-child(7)");	
				competitionArr.jukwan = ptr.text();

				ptr = $("#search_sector > div.competition_info > div.page_half.comp_detail > dl > dd:nth-child(8)");	
				competitionArr.huwon = ptr.text();

				ptr = $("#search_sector > div.competition_info > div.page_half.comp_detail > dl > dd:nth-child(9)");	
				competitionArr.hyupchan = ptr.text();

				ptr = $("#search_sector > div.competition_info > div.page_half.comp_detail > dl > dd:nth-child(10)");	
				competitionArr.yogang = ptr.text();

				ptr = $("#search_sector > div.competition_info > div.page_half.comp_detail > dl > dd:nth-child(11)");	
				competitionArr.keyword = ptr.text();









				// 대회기록
				await page.waitForSelector("#container > ul.tab_btn.tab_cate > li[rel='tab1'");
				await page.click("#container > ul.tab_btn.tab_cate > li[rel='tab1'");
				await delay(2000);
				await page.click("#container > ul.tab_btn.tab_cate > li[rel='tab1'");
				await delay(1000);
			} catch (e) {}
			//-------------------------
			// adult_records_btn, student_records_btn
			// 남자, 여자, 혼성
			for (const category of _categoryArr) {
				for (const gender of _genderArr) {

					try {
						// anchor = `#${category}`;
						// await page.waitForSelector(anchor);	
						// await page.click(anchor);
		
						// anchor = `#btn_${gender}`;
						// await page.click(anchor);	

						// await page.waitForSelector("#tab1 > div.records_table");
						// html = await page.content(); 
			
						const times = await parsingDiscipline(page, category, gender, competitionName, competitionID);
						timeArr = timeArr.concat(times);
						console.log(category, gender, times[0], times.length, timeArr.length);
	
						if (times.length > 0) {
							await mongodb.insertMany("myRankings", times);
						}
					} catch (e) {
						console.log(category, gender, "~~~~~~ no data",);
						continue;
					}
	
				}
			}
			//-------------------------
			console.log(competition.seq, "+++++++++++++++++++", timeArr.length);
		//}

		return timeArr;
	}

//======================================
//======================================
//======================================
async function parsingDiscipline(page, category, gender, name, id) {

	const times = [];
	try {
		await delay(200);
		await page.click(`#${category}`);
		await delay(500);
		await page.click(`#btn_${gender}`);
		await delay(500);
		await page.waitForSelector("#tab1 > div.records_table");
	
	} catch(e) {
		return times;
	}
	
	const html = await page.content(); 
	const $ = cheerio.load(html);	
	// adults, students
	$("#tab1 > div.records_table").each((index, category1) => {
		// dl sex:남자, age:1그룹, style:자유형, distance:50M
		$(category1).find("dl.sex").each((index, gender1) => {
			// dl age 1그룹
			$(gender1).find("dl.age").each((index, ageGroup) => {
				// dl style
				$(ageGroup).find("dl.style").each((index, style) => {
					// dl distance
					$(style).find("dl.distance").each((index, distance) => {
						const discipline = $(distance).find("p").text();
						$(distance).find("dd").each((index, timePtr) => {
							const span = $(timePtr).find("span");
							let rank = $(span).eq(3).text() == "" ? $(span).eq(3).find("img").attr("src") || "" : $(span).eq(3).text().replace("위", "");
							if (rank.indexOf("gold") >= 0) rank = "1";
							if (rank.indexOf("silver") >= 0) rank = "2";
							if (rank.indexOf("bronze") >= 0) rank = "3";
							const time = {
								competitionName: name,
								competitionID: id,
								discipline: discipline || "",
								name: $(span).eq(0).text().trim(),
								team: $(span).eq(1).text().trim(),
								times: $(span).eq(2).text().trim(),
								rank: rank,
								category: category == "adult_records_btn" ? "masters" : "junior",
								category1: category,
								gender1: gender,
								gender: $(span).eq(4).text().trim(),
								ageGroup: $(span).eq(5).text().trim(),
								style: $(span).eq(6).text().trim(),
							}
							time.times = "";
							$(span).eq(2).find("img").each((index, elem) => {
								time.times += $(elem).attr("src").replace("../img/record/BB", '').replace(".png", "").replace("pnt", ".").replace("ups", ":");
							})

							const arr = (time.style+" ").split(" ");
							time.style = arr[0].trim();
							time.distance = arr[1] ? arr[1].trim() + "M" : "";
							time.status = "";
							if (isNaN(time.rank)) {
								time.status = time.rank.trim();
								time.rank = "";
							}

							if (time.name != '선수명') {
								times.push(time);
							}
						});
						// console.log(times[timeArr.length-1].discipline, times.length);
					})	// distance
				})	// dl style
			})	// dl age 1그룹
		})	// dl sex:남자, age:1그룹, style:자유형, distance:50M
	})	// // adults, students
	return times;
}