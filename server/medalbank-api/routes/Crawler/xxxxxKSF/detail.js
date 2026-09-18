const puppeteer = require('puppeteer');
const getPage = require('./page');

(async () => {

  let result, link;

  // await getPage.createAll();
  // return;

  const browser = await puppeteer.launch({ headless: 'new', 'defaultViewport' : { 'width' : 1200, 'height' : 800 } });
  const page = await browser.newPage();
  page.setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/73.0.3683.103 Safari/537.36");

  console.log("wakeup...");

  /***********************************
   *    search page
   ***********************************/
  
  link = "E02.jsp?classCd=D2&toCd=202105906&page=1";
  result = await getPage.getDetail(page, link);

// await browser.close();
})();
