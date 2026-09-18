const { resolve } = require('promise');
const puppeteer   = require('puppeteer');
const cheerio     = require('cheerio');
const fs          = require("fs");
const excelLibrary= require('../../MSKR/Util/excelLibrary');
const excel	      = new excelLibrary();
const utilLibrary = require('../../MSKR/Util/utilLibrary');
const mongoDB     = require('../../MSKR/Class/MongoDB');
const mongoCFG    = require('../../MSKR/Config/mongoCFG');
const mongodb     = new mongoDB(mongoCFG.Medalbank.database);
const utilCrawling= require("../utilCrawling");
//============================================

const _home = "http://www.myranking.co.kr/";
let _page = process.argv.length < 3 ? 1 : Number(process.argv[2]);
let _limit = process.argv.length < 4 ? 10 : Number(process.argv[3]);

let pageno = 1;
//============================================
(async () => {
	const context = {
		query				: { page: { $gte: _page, $lt: (_page + _limit) } },
		projection	: { _id:0 },
		limit				: 1,
		sort				: { page: -1 },
	}
	pageno = await mongodb.max("working", "page", context.query);
	if (pageno > 1) pageno--;


	//-----------------------------------------------------
	const browser = await utilCrawling.openPuppeteer(false); // configList.headless);
	//-----------------------------------------------------
	const page = await browser.newPage();
	await page.setViewport({ width: 1000, height: 800 });
	const userAgent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36";
	page.setUserAgent(userAgent);
	const url = "https://librarian.nl.go.kr/LI/contents/L20101000000.do?browsingYn=Y&searchType=detail&acType=0&browsingDetailActivity=&browsingDetailJob=&browsingDetailOrgType=&browsingDetailRegion=";
	// await page.goto(url, {waitUntil: 'load', timeout: configCrawling.timeout || 30000})
	await page.goto(_home, {timeout: 30000})

	await page.click("#history_btn");

	let competitionArr = [];
	for (year = 2023; year >= 2009; year--) {
		const yearid = `#btn_${year}`;
		console.log(yearid);
		await page.click(yearid);
		// ----------------------------
		page.on('console', async (msg) => {
			const msgArgs = msg.args();
			for (let i = 0; i < msgArgs.length; ++i) {
				console.log(await msgArgs[i].jsonValue());
			}
		});
		// ----------------------------

		console.log("year------->", year);
		const result = await page.evaluate((yr) => {
			const usersTable = Array.from(document.querySelectorAll(`#y_${yr} > dl > dd`));

			const competitions = [];
			usersTable.forEach(elem => {
				elem.querySelector('span > form > label').click();
				const value = {
					cid					: elem.querySelector("span.s1 > form > label").getAttribute("for"),
					name				: elem.querySelector("span.s1 > form > label").textContent.replace(/\n|\t/gi, ""),
					date				: elem.querySelector("span.s5").textContent.replace(/\n|\t/gi, ""),
					sido				: "",
					pool				: elem.querySelector("span.s4").textContent,
					host				: elem.querySelector("span.s2").textContent,	// 주최
					management	: elem.querySelector("span.s3").textContent,	// 주관
					sponsor			: "",	// 협찬
					support			: "",	// 후원
					guidelines	: "",	// 대회요강
					link				: "",
				}
				competitions.push(value);
			});
			return competitions;
		}, year);
		competitionArr = competitionArr.concat(result);
		console.log(year, competitionArr.length);
	} // end for

	let compStr = "";
	competitionArr.forEach(comp => {
		compStr += comp.cid + "\t";
		compStr += comp.name + "\t";
		compStr += comp.date + "\t";
		compStr += comp.sido + "\t";
		compStr += comp.pool + "\t";
		compStr += comp.host + "\t";
		compStr += comp.management + "\t";
		compStr += comp.sponsor + "\t";
		compStr += comp.support + "\t";
		compStr += comp.guidelines + "\t";
		compStr += comp.link + "\n";

	})

	console.log(compStr.slice(0, 100));
	fs.writeFileSync("competitions1.csv", compStr)
	

	//-------------------------------------------
	//-------------------------------------------
	console.log(".......end");

	await page.close();
	//-----------------------------------------------
	utilCrawling.closePuppeteer(browser);

})();

//=============================================
//=============================================
//=============================================
async function crawlingList(pageno, page) {
	try {

		//----->
		await page.evaluate((page) => {
			 document.querySelector("#print > div.content_wrap > div > div.paginate > div > input").value = page;
		}, pageno.toString());

		await page.click('#print > div.content_wrap > div > div.paginate > div > a.btn_page_go');
	 //  console.log("click page#=", pageno);

		await page.waitForSelector("#print > div.content_wrap > div > div.paginate > div > span.total_num");
		html = await page.content(); 
		$ = cheerio.load(html);

		// if (total < 0) {
		// 	 total = $("#print > div.content_wrap > div > div.paginate > div > span.total_num");
		// 	 console.log("total=", total.text());         
		// }
		const anchor = $("div#personSearchList div.table_bd");
		const records = [];
		anchor.each((index, elem) => {
			 const children = $(elem).children();
			 const value = {
					no             : children.eq(1).find("span.cont").text(),
					image         : children.eq(2).find("img").attr("src"),
					authorID   : children.eq(3).find("span.cont").text(),
					name          : children.eq(4).find("span.cont").text(),
					link          : children.eq(4).find("span.cont > a.link").attr("href"),
					birth       : children.eq(5).find("span.cont").text(),
					job          : children.eq(6).find("span.cont").text(),
					activity   : children.eq(7).find("span.cont").text(),
					writes       : children.eq(8).find("span.cont").text(),
					latest       : children.eq(9).find("span.cont").text(),
			 }
			 records.push(value);
		});
	 //  console.log("\npageno=", pageno, "len=", records.length, );
		let inserted = 0, updated = 0;
		for (const value of records) {
			 if (value.authorID) {
					const query = { authorID: value.authorID };
					const res = await mongodb.findOne("authority", query, { _id:0, authorID:1, });
					if (res.data.authorID == undefined) {
						 await mongodb.insertOne("authority", value);
						 inserted++;
					} else {
						 // console.log("--- not inserted.", value.authorID, value.name);
						 updated++;
					}
			 } else {
					console.log("...", value.name);
			 }
		} // end for
		console.log(`---> pageno=${pageno},\tinserted: [ ${inserted} ],\tupdated: ( ${updated} )`);

 } catch (e) {
		await mongodb.updateOne("working", { page: pageno }, { page: pageno });
		console.log("~~~~~~", e);
		process.exit();
		// await page.close();
		// page = await browser.newPage();
		// await page.goto(url, {timeout: 30000})
 
		// html = await page.content(); 
		// $ = cheerio.load(html);
 } // try
}