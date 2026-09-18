const puppeteer = require('puppeteer');
const getPage = require('./page');

(async () => {

  const browser = await puppeteer.launch({ headless: 'new', 'defaultViewport' : { 'width' : 1200, 'height' : 800 } });
  const page = await browser.newPage();
  page.setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/73.0.3683.103 Safari/537.36");

  console.log("wakeup...");

  /***********************************
   *    search page
   ***********************************/
  let result;

  result = await getPage.getList(page);
  console.log(result);
  return;
  let link = "E02.jsp?classCd=E2&toCd=201904114&page=3";
  
  // link = "E02.jsp?classCd=D2&toCd=201903365&page=4";
  // result = await getPage.getDetail(page, link);
  
  // link = "S01.jsp?classCd=D2&toCd=201903365&kindCd=&gameDate=&page=4";
  // result = await getPage.getRecord(page, link);
  
  // link = "R02.jsp?classCd=D2&toCd=201903365&baseClassCd=02&rhCd=1&kindCd=U&page=4&gameDate=";
  // result = await getPage.getTime(page, link);

  // link = "P01.jsp?classCd=D2&toCd=201903355&page=4&ppage=&sexCd=&kindCd=";
  // result = await getPage.getPlayer(page, link);

  link = "P02.jsp?classCd=D2&toCd=201903355&kindName=남자고등부&ppage=&idNo=200908001327&sexCd=&kindCd=&page=4";
  result = await getPage.getPlayerDetail(page, link);
  console.log(result);

// await browser.close();
})();
