const puppeteer = require('puppeteer');
const getPage = require('./page');

if (process.argv.length < 3) {
  console.log("node record limit skip");
  return;
}
let limit = process.argv[2]
console.log("limit = ", limit);
let skip = process.argv[3] == undefined ? 1000 : process.argv[3]
console.log("skip = ", skip);


(async () => {

  let result, link;

  // await getPage.createAll();
  // return;

  await getPage.customizingRecord();
  return;

  const browser = await puppeteer.launch({ headless: 'new', 'defaultViewport' : { 'width' : 1200, 'height' : 800 } });
  const page = await browser.newPage();
  page.setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/73.0.3683.103 Safari/537.36");

  console.log("wakeup...");

  /***********************************
   *    search page
   ***********************************/
  
  link = "P02.jsp?classCd=D2&toCd=201903355&kindName=남자고등부&ppage=&idNo=200908001327&sexCd=&kindCd=&page=4";
  result = await getPage.getPlayerDetail(page, Number(skip), Number(limit));
  console.log(result);

// await browser.close();
})();
