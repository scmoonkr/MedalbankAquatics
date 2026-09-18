const cheerio     = require('cheerio');
const puppeteer = require('puppeteer');
const mongoCFG 	= require('../../../Config/mongoCFG.js');
const mongoDB		= require("../../../Class/MongoDB.js");
const mongodb		= new mongoDB("Contents");

const homeURL = "http://wmc2019.microplustiming.com/swimming/index_web.php";

const config_list = {
  lineSelector:"table#tblMainSxScroll tbody tr",
  fieldSelector: "td",
  body: [
      { no: 0,    name:"date",   type:"text",    },
      { no: 4,    name:"style",  type:"text",    },
  ],
};

const bibleName = [
  "",
  'Genesis',
  'Exodus',
  'Leviticus',
  'Numbers',
  'Deuteronomy',
  'Joshua',
  'Judges',
  'Ruth',
  '1 Samuel',
  '2 Samuel',
  '1 Kings',
  '2 Kings',
  '1 Chronicles',
  '2 Chronicles',
  'Ezra',
  'Nehemiah',
  'Esther',
  'Job',
  'Psalms',
  'Proverbs',
  'Ecclesiastes',
  'Song of Solomon',
  'Isaiah',
  'Jeremiah',
  'Lamentations',
  'Ezekiel',
  'Daniel',
  'Hosea',
  'Joel',
  'Amos',
  'Obadiah',
  'Jonah',
  'Micah',
  'Nahum',
  'Habakkuk',
  'Zephaniah',
  'Haggai',
  'Zechariah',
  'Malachi',
  // 신약
  'Matthew',
  'Mark',
  'Luke',
  'John',
  'Acts',
  'Romans',
  '1 Corinthians',
  '2 Corinthians',
  'Galatians',
  'Ephesians',
  'Philippians',
  'Colossians',
  '1 Thessalonians',
  '2 Thessalonians',
  '1 Timothy',
  '2 Timothy',
  'Titus',
  'Philemon',
  'Hebrews',
  'James',
  '1 Peter',
  '2 Peter',
  '1 John',
  '2 John',
  '3 John',
  'Jude',
  'Revelation',
];


let bible = process.argv.length > 2 ? Number(process.argv[2]) : 1;
console.log("bibleNo:", bible, ", ", bibleName[bible]);

(async () => {

  const browser = await puppeteer.launch({ headless: 'new', 'defaultViewport' : { 'width' : 1200, 'height' : 800 } });
  const page = await browser.newPage();
  page.setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/73.0.3683.103 Safari/537.36");

  console.log("wakeup...");

  /***********************************
   *    search page
   ***********************************/
  let result;

  result = await crawling_table(page);
  console.log(result.length);

await browser.close();
})();

//=====================================
//=====================================
//=====================================
async function crawling_table(page) {
  console.log("initialize...");
  //-----------------------------
  //-----------------------------

  console.log("searching page...");

  let endPhrase = 1;
  //------------------------------------------
  // for (let chapter = 1; chapter <= bibleName.length; chapter++) {
  const records = [];
  //------------------------------------------
  for (let chapter = 1; chapter <= endPhrase; chapter++) {
    let url = `https://thekingsbible.com/Bible/${bible}/${chapter}`;
    await page.goto(url);
    // await page.waitFor(100);

    const html = await page.content(); 
    let $ = cheerio.load(html);

    //-------------------
    if (chapter == 1) {
      let phraseAnchor = $("div.chapterref > a");
      console.log("phraseAnchor=", phraseAnchor.length);
      endPhrase = phraseAnchor.length; // phraseAnchor.eq(phraseAnchor.length-1).attr("href");
      console.log("href=", endPhrase);
    }
    console.log("page...", bible, bibleName[bible], chapter, "~", endPhrase);

    //-----
    try {

      // table.bibletable > tbody > tr
      //  td.ref
      //  td
      const tablePtr = $("table.bibletable > tbody > tr");
      console.log("tablePtr=", tablePtr.length);

      // =============================================
      // =============================================
      // =============================================
      let pno = 1;
      tablePtr.each((index, elem) => {
    
        const trs = $(elem).find("td");

        const record = {
          bookENG : bibleName[bible],
          index   : trs.eq(0).text().trim(),
          chapter : chapter,
          phrase  : pno++,
          content : trs.eq(1).text().trim(),
        }
        records.push(record);
      })
    } catch (e) {
      console.log("catch.", e);        
    }
  } // end for phrase
  console.log(records.length, records[0], records[records.length-1]);
  if (records.length > 0) {
    await mongodb.insertMany("bible_KJV", records);
  }
  //-----
  
  return records
}