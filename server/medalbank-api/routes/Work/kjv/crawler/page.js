const extend		  = require('node.extend');
const mongoCFG 		= require('../../../Config/mongoCFG');
const mongoDB			= require('../../../Class/MongoDB');
const utilLibrary = require("../../../Util/utilLibrary");

const dbName 		  = mongoCFG.dbMastersSwimmingKorea;
const mongodb 	  = new mongoDB(dbName);
const collKSFcompetitions    = "ksfCompetitions"; // mongoCFG.collMSK.athletes;
const collKSFheats    = "ksfHeats"; // mongoCFG.collMSK.athletes;
const collKSFathletes    = "ksfAthletes"; // mongoCFG.collMSK.athletes;
const collKSFtimes    = "ksfTimes"; // mongoCFG.collMSK.athletes;
const collKSFrecords    = "ksfRecords"; // mongoCFG.collMSK.athletes;

const puppeteer   = require('puppeteer');
const cheerio     = require('cheerio');
const parsing     = require('./parsing_table');

//=====================================
exports.getListPage = async function(page, url, config_list) {
  await page.goto(url);

  const html = await page.content();        
  let $ = cheerio.load(html);
  let pagePtr = $("table#tblMainSxScroll tr");
  console.log(pagePtr.length);

  //
  // click detail
  //
  await page.evaluate((pno) => {
    document.querySelector(`.trContenutiToggleCalendar`).click();
  }, );
  console.log("click row");
  // await page.waitFor(500);

  //
  // click summary, list
  //
  // const summary = false;
  // await page.evaluate((summary) => {
  //   if (summary) {
  //     document.querySelector(`div#divSummary`).click();
  //   } else {
  //     document.querySelector(`div#divStartlist`).click();
  //   }
  // }, summary);
  // console.log("click divStartlist");

  //---------------------------------------------------
  //---------------------------------------------------
  //---------------------------------------------------
  let pno = 0;
  while (1) {
    await page.waitFor(500);

    console.log("load content");
    const html = await page.content();        
    let $ = cheerio.load(html);
    console.log("get content");
    await page.waitFor(100);

    const anchor = $("#tblMainDiv div#main");



    let row = 0;
    
    let style = $("td#tdGaraRound");
    let date = $("td#DataOra").text();
    
    console.log("====== style=", style.text(), ", date=", date, "---");
    // $("td.headerContenuti").text();
    // $("td.headerContenuti").text();
  



    //-----> click next
    let divNext = $("div#divNext").text();
    console.log("next----->", divNext);
    if (divNext == undefined) break;
    await page.evaluate((pno) => {
      document.querySelector(`div#divNext`).click();
    }, pno);
    console.log("click next .", pno);

    pno++;
    
    break;
  }
  //---------------------------------------------------
  //---------------------------------------------------
  //---------------------------------------------------


return;



  


  let records = [];
  for (let row=0; row<pagePtr.length; row++) {
    console.log("getPage.1>page#.", row);

    // select page

    // get table
    const html = await page.content();        
    console.log("get content");

    // const result = await parsing.parsingTable(html, config_list);   // { total: 1, rows: [] }
    // records = [...records, ...result];

    // if (row > 0) break;
  } // isbn for

  // if (records.length == 0) return;

  return records;












  let lastPage = pagePtr.eq(pagePtr.length-1).find("a").attr("href").replace("javascript:moveGameList(", "").replace(")", "");
  console.log("------------->", lastPage);

  records = [];
  for (let pageno=1; pageno<=lastPage; pageno++) {
    console.log("getPage.1>page#.", pageno);

    // select page
    await page.evaluate((pno) => {
      document.querySelector(`#pagingDiv ul.board_pagination li a[href="javascript:moveGameList(${pno})"]`).click();
    }, pageno);
    await page.waitFor(100);

    // get table
    const html = await page.content();        

    const result = await parsing.parsingTable(html, config_list);   // { total: 1, rows: [] }
    records = [...records, ...result];

    // if (pageno > 0) break;
  } // isbn for

  // if (records.length == 0) return;

  return records;
}
