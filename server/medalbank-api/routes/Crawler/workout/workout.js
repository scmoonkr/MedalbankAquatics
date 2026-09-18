
const puppeteer = require('puppeteer');
// var readline = require('readline-sync');
// var Excel = require('exceljs');

const mongoCFG 		= require('../../Config/mongoCFG');
const mongoDB			= require('../../medalbank/Class/MongoDB');
const UtilDate    = require("../../medalbank/Class/DateLibrary");

const utilDate	  = new UtilDate();
const mongodb 	  = new mongoDB(mongoCFG.Medalbank.database);

var parsing = require('./parsing-detail');

const collectionName = "work";
const PK = "workoutID";


const puppeteerState = { browser: null, page: null, search_page: null, headless: 'new' }
console.log("start.");



(async () => {
	// let workoutArr = await searchAll();
	// return workoutArr;

	console.time("workout");
	const workoutArr = await search(2, 6604);; // 6604);
	console.log(workoutArr.length);
	console.timeEnd("workout")

	return;

})();
//-------------------------------------------------------------------
//-------------------------------------------------------------------
//-------------------------------------------------------------------
//-------------------------------------------------------------------
//-------------------------------------------------------------------
//-------------------------------------------------------------------
async function searchAll() {
	return new Promise(function(resolve, reject) {
		
		let workoutArr = search(2, 6604);
		console.log("end....", workoutArr)
		resolve(workoutArr);
	})
}

//puppeteerState.browser.close();

/**********************************************
 * 
 * start
 * 
***********************************************/

async function search (start, end) {
console.log("search...");
	try {
		console.log("searching page...");
		puppeteerState.search_page = await puppeteerState.browser.newPage();
	
	} catch (e) {
		console.log("initialize...");
		//-----------------------------
		puppeteerState.browser = await puppeteer.launch({
			headless: puppeteerState.headless,
		});
		// puppeteerState.page = await puppeteerState.browser.newPage();
		// puppeteerState.page.setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/73.0.3683.103 Safari/537.36");
	
		puppeteerState.search_page = await puppeteerState.browser.newPage();
		puppeteerState.search_page.setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/73.0.3683.103 Safari/537.36");
		//-----------------------------

		console.log("searching page...");
	}

	const workoutArr = [];
	//------------------------------------------
	for (let no = start; no <= end; no++) {
		let url = `https://www.swimworkouts.net/workouts/${no}`;
		console.log("page...", no);
		try {
			await puppeteerState.search_page.goto(url);
			const html = await puppeteerState.search_page.content(); 
		
			// console.log("parsingTable...");
			const workout = parsing.parsingTable(html);
			if (workout.title != '') {
				workout.workoutID = no;
				// console.log(">>>>>>>>>>>>>>>>>>>>>contents=", workout);
				workoutArr.push(workout);
			}						
		} catch (e) {
			console.log("catch." + e)
		}
	} // end for
	//------------------------------------------
	const result = await mongodb.insertMany(mongoCFG.Medalbank.workouts, workoutArr);
	//------------------------------------------

	await puppeteerState.browser.close();
	return workoutArr;
}

function parsingTable(html) {

}