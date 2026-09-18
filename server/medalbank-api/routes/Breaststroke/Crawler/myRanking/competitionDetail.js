const puppeteer   = require('puppeteer');
const cheerio     = require('cheerio');
const fs          = require("fs");
const excelLibrary= require('../../Class/ExcelLibrary');
const excel	      = new excelLibrary();
const utilLibrary = require('../../Class/utilLibrary');
const mongoDB     = require('../../Class/MongoDB');
const mongoCFG    = require('../../Config/mongoCFG');
const mongodb     = new mongoDB(mongoCFG.Medalbank.database);
const utilCrawling= require("../utilCrawling");
//============================================

const _home = "http://www.myranking.co.kr/";
let _year = process.argv.length < 3 ? 2024 : process.argv[2];

let pageno = 1;
//============================================
(async () => {

	console.log("start...");

	//-----------------------------------------------------
	const browser = await utilCrawling.openPuppeteer(false); // configList.headless);
	//-----------------------------------------------------
	let page = await browser.newPage();
	await page.setViewport({ width: 1000, height: 800 });
	const userAgent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36";
	page.setUserAgent(userAgent);

	await page.goto(_home, {timeout: 30000})

	// await page.click("#history_btn");

// 	const no = 0;
// const yearAnchor = $("#history_show > ul > li.sub1_tab > span");
// console.log("yearAnchor=", yearAnchor.length);

// const years = [2024,2023,2022,2021,2020,2019,2018,2017,2016,2015, 2014, 2013, 2012, 2011, 2010, 2009,2007, 2005, 2003];
const years = [_year.toString().replace(/ /gi, '').split(',')];
	let competitions = [];
	for (const year of years) {
		const yearid = `#btn_${year}`;
		console.log(yearid);

		await page.click(yearid);
		console.log("click");

	
		const anchor = "#sub_menu0 div.comp_list dl.year_li dd";

		// 셀렉터가 로드될 때까지 대기
		await page.waitForSelector(anchor);
		console.log("wait");

		// Cheerio를 사용하여 HTML 로드
		let content = await page.content();
		let $ = cheerio.load(content);

		// 모든 <tr> 요소 찾기
		const trSelectors = $(anchor)
													.toArray()
													.map((el, index) => ({
														selector: `${anchor}:nth-of-type(${index + 1})`,
														index: index + 1
													}));
	console.log($(anchor).length, "trSelectors.", trSelectors.length);


  // Wait for the selector to load
  await page.waitForSelector('dl.year_li');


		for (const tr of trSelectors) {
			const yearid = `#btn_${year}`;
			console.log(yearid);
	
			await page.click(yearid);
			console.log("click");
	
			const anchorCompetition = "#sub_menu0 div.comp_list dl.year_li dd";

			// 셀렉터가 로드될 때까지 대기
			await page.waitForSelector(anchorCompetition);
			console.log("wait");
	
			// Cheerio를 사용하여 HTML 로드
			let content = await page.content();
			let $ = cheerio.load(content);
	
			// 모든 <tr> 요소 찾기
			const trSelectors = $(anchor)
														.toArray()
														.map((el, index) => ({
															selector: `${anchor}:nth-of-type(${index + 1})`,
															index: index + 1
														}));
		console.log($(anchor).length, "trSelectors.", trSelectors.length);
	
	
		// Wait for the selector to load
		await page.waitForSelector('dl.year_li');
	


			console.log("----->", tr.selector);

			const elementExists = await page.$(tr.selector) !== null;

			if (!elementExists) {
				console.error('No element found for selector:', tr.selector);
			}
			console.log("click.", tr.selector);
			
			// <tr> 요소 클릭
			await page.click(tr.selector);

			
			// 새로운 페이지가 열리기를 대기
			await page.waitForNavigation({ waitUntil: 'networkidle2' });
			console.log("22");
	
			// 새로운 페이지의 내용 가져오기
			content = await page.content();
			$ = cheerio.load(content);
	
			// 예제: 페이지의 제목을 가져오기
			const pageTitle = $('#search_sector > div.stickBox > span > span').text();
			console.log(`Clicked <tr> ${tr.index}: Page title is "${pageTitle}"`);
	
			const poster = $("div.comp_poster img").attr("src");
			const value = {
				name: pageTitle.replace("\n", "").trim(),
				poster: poster.trim() || "",
				rows: [],
			}
// div.comp_poster img src
// comp_detail
// 개최일자, 개최지역, 주 최, 주 관, 후 원, 협 찬, 개최장소, 대회요강, 대회 키워드
			const loop = $("div.comp_detail dl dd");
			loop.each((index, elem) => {
				const text = $(elem).text().trim();
				value.rows.push(text);
				if 			(text.includes("개최일자")) value.startDate 	= text.replace("개최일자", '').trim();
				else if (text.includes("개최지역")) value.sido 				= text.replace("개최지역", '').trim();
				else if (text.includes("주 최")		) value.host 				= text.replace("주 최", ''	).trim();
				else if (text.includes("주 관")		) value.organizer 	= text.replace("주 관", ''	).trim();
				else if (text.includes("후 원")		) value.support 		= text.replace("후 원", ''	).trim();
				else if (text.includes("협 찬")		) value.sponsorship = text.replace("협 찬", ''	).trim();
				else if (text.includes("개최장소")) value.place 			= text.replace("개최장소", '').trim();
				else if (text.includes("대회요강")) value.outline 		= text.replace("대회요강", '').trim();
				else if (text.includes("키워드")	) value.startDate 	= text.replace("대회 키워드", '').trim();
			})
			console.log(value);

			// 필요한 크롤링 작업 수행
			// 예제: 특정 요소의 텍스트 추출
			const specificText = $('#specific-element').text();
			console.log(`Specific text from the new page: "${specificText}"`);
	

			// 원래 페이지로 돌아가기
			await page.goBack({ waitUntil: 'networkidle2' });
		}
	} // end for
return;


	let compStr = "";
	competitions.forEach(comp => {
		compStr += comp.cid + "\t";
		compStr += comp.name + "\t";
		compStr += comp.datetime + "\t";
		compStr += comp.sido + "\t";
		compStr += comp.pool + "\n";
	})

	// console.log(compStr.slice(0, 100));
	fs.writeFileSync("competitions.csv", compStr)

	compStr = "exports.competitions = " + JSON.stringify(competitions, null, "\t")
	fs.writeFileSync("competitions.js", compStr)
	

	//-------------------------------------------
	//-------------------------------------------
	console.log(".......end");

	await page.close();
	// //-----------------------------------------------
	utilCrawling.closePuppeteer(browser);

	const cids = competitions.map(comp => Number(comp.cid));
	console.log(cids.length);
	await mongodb.deleteMany(mongoCFG.Medalbank.myRankingCompetitions, { cid: { $in: cids } })
	
	console.log(competitions.length);
	await mongodb.insertMany(mongoCFG.Medalbank.myRankingCompetitions, competitions)

})();

//=============================================
//=============================================
//=============================================
async function crawlingList($, table) {
	const competitions = [];

	try {
		table.each((index, elem) => {

			const span = $(elem).find("span")
			const value = {
				cid: $(span).eq(0).text(),
				name: $(span).eq(1).text().replace(/\n|\t/gi, '').trim(),
				sido: $(span).eq(2).text(),
				pool: $(span).eq(3).text(),
				datetime: $(span).eq(4).text(),
			}
			value.cid = Number(value.cid);
			competitions.push(value);

		});
	} catch (e) {
		console.log("catch.", e);
	} // try

	console.log("competitions.length: ", competitions.length);
	return competitions;
}