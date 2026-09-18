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
const delay = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));

const names = [
  '강미현',
  '강민규',
  '강성철',
  '강소화',
  '강영준',
  '강윤숙',
  '강윤혜',
  '강의신',
  '강재욱',
  '강지환',
  '강태윤',
  '강형범',
  '경해선',
  '고관민',
  '고병석',
  '고연희',
  '고운희',
  '고은주',
  '고현태',
  '고희경',
  '곽광훈',
  '구기리',
  '구무완',
  '권가별',
  '권도현',
  '권영미',
  '권영민',
  '권영수',
  '권영주',
  '권준엽',
  '권혁주',
  '김건우',
  '김건희',
  '김경옥',
  '김경희',
  '김계순',
  '김광수',
  '김기곤',
  '김기동',
  '김기백',
  '김기욤',
  '김나영',
  '김남균',
  '김단',
  '김단비',
  '김대웅',
  '김대원',
  '김덕영',
  '김동열',
  '김동윤',
  '김동은',
  '김동현',
  '김두욱',
  '김문규',
  '김미경',
  '김민경',
  '김민석',
  '김민희',
  '김병수',
  '김병우',
  '김보순',
  '김봉순',
  '김부균',
  '김상균',
  '김상민',
  '김상용',
  '김상웅',
  '김선옥',
  '김선진',
  '김선희',
  '김성미',
  '김성수',
  '김성우',
  '김성현',
  '김세윤',
  '김승민',
  '김승범',
  '김신',
  '김신아',
  '김신호',
  '김애숙',
  '김여형',
  '김연수',
  '김연자',
  '김영국',
  '김영균',
  '김영미',
  '김영은',
  '김영자',
  '김영찬',
  '김옥주',
  '김왕태',
  '김용원',
  '김욱',
  '김유진',
  '김윤경',
  '김은경',
  '김은선',
  '김은애',
  '김은임',
  '김의진',
  '김이지',
  '김이탁',
  '김인애',
  '김재균',
  '김재봉',
  '김정규',
  '김정남',
  '김정아',
  '김정연',
  '김정한',
  '김정훈',
  '김조은',
  '김종길',
  '김종문',
  '김종민',
  '김종복',
  '김종산',
  '김종지',
  '김종훈',
  '김주강',
  '김준철',
  '김지윤',
  '김지훈',
  '김진수',
  '김진숙',
  '김창묵',
  '김창현',
  '김철민',
  '김춘희',
  '김태연',
  '김태이',
  '김태진',
  '김태현',
  '김하정',
  '김한울',
  '김헌국',
  '김현석',
  '김현아',
  '김현옥',
  '김현철',
  '김혜옥',
  '김혜진',
  '김호상',
  '김호준',
  '김홍수',
  '김희경',
  '김희용',
  '김희정',
  '나상인',
  '나승수',
  '나인애',
  '노기진',
  '도영성',
  '류문정',
  '류인규',
  '류현숙',
  '류환',
  '명태호',
  '문성중',
  '문성태',
  '문승욱',
  '문종구',
  '문지현',
  '박관수',
  '박규동',
  '박근영',
  '박기덕',
  '박기만',
  '박단비',
  '박래옥',
  '박래준',
  '박마리아',
  '박만호',
  '박민호',
  '박병섭',
  '박상우',
  '박서연',
  '박선용',
  '박선정',
  '박선화',
  '박송이',
  '박영배',
  '박영춘',
  '박영호',
  '박옥남',
  '박인기',
  '박임수',
  '박정은',
  '박정조',
  '박정호',
  '박정훈',
  '박종안',
  '박종율',
  '박종은',
  '박종현',
  '박주성',
  '박준홍',
  '박진흥',
  '박찬숙',
  '박찬욱',
  '박철한',
  '박태호',
  '박태희',
  '박혁진',
  '박현규',
  '박현수',
  '박현숙',
  '박현식',
  '박현실',
  '배보성',
  '배상직',
  '배윤정',
  '배진관',
  '백금석',
  '백찬미',
  '변관섭',
  '부정석',
  '블루마린',
  '사재학',
  '서금희',
  '서은정',
  '선경님',
  '설동헌',
  '성명',
  '소민수',
  '소윤주',
  '손맹',
  '손문곤',
  '손순목',
  '손용득',
  '손은정',
  '송명기',
  '송미형',
  '송민준',
  '송수인',
  '송승엽',
  '송중호',
  '송지혁',
  '송태숙',
  '신광일',
  '신길순',
  '신동민',
  '신민아',
  '신은빈',
  '신인호',
  '신준교',
  '심재윤',
  '심혁',
  '안미숙',
  '안범진',
  '안성호',
  '안손류김',
  '안정미',
  '안준성',
  '안준호',
  '안태준',
  '양경모',
  '양경은',
  '양귀열',
  '양영옥',
  '양옥순',
  '양종철',
  '양진환',
  '여덕임',
  '연창호',
  '오경인',
  '오금순',
  '오동국',
  '오범석',
  '오윤지',
  '오정일',
  '오혜진',
  '옥민석',
  '우경구',
  '우성희',
  '우정오',
  '웹스카일러',
  '위지연',
  '유기승',
  '유보선',
  '유은주',
  '유태민',
  '유태선',
  '유현종',
  '유형주',
  '유회만',
  '윤선영',
  '윤인웅',
  '윤재호',
  '은혜정',
  '이경분',
  '이광선',
  '이규병',
  '이금화',
  '이기열',
  '이나영',
  '이남철',
  '이다인',
  '이도은',
  '이동성',
  '이동혁',
  '이명화',
  '이묘연',
  '이미화',
  '이미희',
  '이민석',
  '이민수',
  '이범준',
  '이병주',
  '이병준',
  '이봉찬',
  '이상진',
  '이상훈',
  '이선호',
  '이성전',
  '이세원',
  '이소연',
  '이소영',
  '이수영',
  '이수정',
  '이수진',
  '이수현',
  '이순규',
  '이순영',
  '이승엽',
  '이승혁',
  '이승현',
  '이승훙',
  '이시형',
  '이옥자',
  '이용욱',
  '이운용',
  '이원규',
  '이유경',
  '이유진',
  '이윤경',
  '이윤이',
  '이윤홍',
  '이은민',
  '이재민',
  '이익준',
  '이정미',
  '이정찬',
  '이종덕',
  '이지윤',
  '이지혜',
  '이진',
  '이진호',
  '이창규',
  '이창하',
  '이춘섭',
  '이충현',
  '이해원',
  '이해창',
  '이형철',
  '이혜원',
  '이효근',
  '이후영',
  '인천',
  '임미경',
  '임석철',
  '임선우',
  '임성진',
  '임정숙',
  '임진용',
  '임진우',
  '임현식',
  '임형춘',
  '장성규',
  '장세열',
  '장소연',
  '장연상',
  '장유미',
  '장은유',
  '장재혁',
  '장주원',
  '장준명',
  '전성원',
  '전세계',
  '전소현',
  '전영주',
  '전용균',
  '전정애',
  '전지환',
  '전진안',
  '전화란',
  '전희성',
  '정관호',
  '정광철',
  '정광훈',
  '정근석',
  '정기근',
  '정기호',
  '정대교',
  '정동민',
  '정미옥',
  '정삼룡',
  '정상아',
  '정상태',
  '정상현',
  '정상훈',
  '정석규',
  '정석원',
  '정선기',
  '정성훈',
  '정승현',
  '정시원',
  '정애영',
  '정영장',
  '정우민',
  '정우성',
  '정우현',
  '정유라',
  '정윤경',
  '정윤영',
  '정은비',
  '정의민',
  '정재룡',
  '정재현',
  '정정례',
  '정준수',
  '정지문',
  '정진이',
  '정찬건',
  '정청기',
  '정현',
  '정현수',
  '정현주',
  '정효섭',
  '조경옥',
  '조남진',
  '조선미',
  '조성원',
  '조승목',
  '조영희',
  '조용란',
  '조원식',
  '조은경',
  '조은순',
  '조은심',
  '조은영',
  '조은정',
  '조은주',
  '조재홍',
  '조한영',
  '조휘영',
  '주미애',
  '주선정',
  '주승희',
  '주원초',
  '주정현',
  '주창환',
  '지현준',
  '지혜진',
  '차은희',
  '채성현',
  '천만철',
  '천효정',
  '첸앤드류',
  '최고다',
  '최규환',
  '최난희',
  '최미래',
  '최민정',
  '최범희',
  '최선미',
  '최선진',
  '최아영',
  '최영수',
  '최예진',
  '최유성',
  '최인선',
  '최재혁',
  '최정우',
  '최진수',
  '최청열',
  '최태철',
  '최하라',
  '최현우',
  '최현진',
  '최홍석',
  '최희복',
  '추맹수',
  '텐스베뜨라나',
  '피혜윤',
  '하수경',
  '하재관',
  '하지은',
  '하태경',
  '한구석',
  '한상미',
  '한상원',
  '한상현',
  '한승원',
  '한승훈',
  '한원상',
  '허수현',
  '허심숙',
  '허영훈',
  '허정현',
  '허종인',
  '홍미영',
  '홍성수',
  '홍성준',
  '황미진',
  '황은지',
  '황장원',
  '황정기',
  '황정숙',
  '황정현',
  '황희철',
];
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
	const browser = await utilCrawling.openPuppeteer("new"); // configList.headless);
	//-----------------------------------------------------
	let page = await browser.newPage();
	await page.setViewport({ width: 1000, height: 800 });
	const userAgent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36";
	page.setUserAgent(userAgent);
	const url = "http://myranking.co.kr";
	// await page.goto(url, {waitUntil: 'load', timeout: configCrawling.timeout || 30000})
	await page.goto(_home, {timeout: 30000})

  fs.writeFileSync("times.txt", `no\tname\tteam\ttimes\trank\tgender\tageGroup\tstyle\tdistance\tcompetitionName\tdatetime\n`);


  const timeArr = [];
  let timeStr = "";
  let seqno = 1;
  for (let cnt=0; cnt<names.length; cnt++) {
  // for (let cnt=0; cnt<5; cnt++) {

    const name = names[cnt]; // "강의신";

    try {
      await page.evaluate((name) => {
        document.querySelector('#search_name').value = name;
      }, name);
  
      await page.click('span.search_btn > label > img', {timeout: 500});
      await page.waitForSelector("div#search_sector > div.search_contents_compare > div.tab_menu > div.search_contents_indi");
  
      await delay(1000);
  
    } catch (e) {
      const value = {
        "name": name,
        "team": "",
        "times": "DNS",
        "rank": "",
        "gender": "",
        "ageGroup": "",
        "style": "",
        "distance": "",
        "competitionName": "",
        "datetime": ""
      }
      console.log("error ~~~~~~~~~~~", value);
      timeArr.push(value);
      timeStr += `${seqno++}\t${value.name}\t${value.team}\t${value.times}\t${value.rank}\t${value.gender}\t${value.ageGroup}\t${value.style}\t${value.distance}\t${value.competitionName}\t${value.pool}\t${value.dateStart}\t${value.datetime}\n`;
      continue;
    }

    const html = await page.content(); 
    const $ = cheerio.load(html);

    // const table = $("div#search_sector > div.search_contents_compare > div.tab_menu > div.search_contents_indi > dl.result_table > dd");
    const table = $("#search_sector > div.search_contents_compare > div.tab_menu > div > dl > dd");
    console.log(name, table.length);

    //------------------------------------
    //------------------------------------
    //------------------------------------
    table.each((index, elem) => {

      const span = $(elem).find("span")
      const value = {};
      if (span.length > 0) value.name = name + "-" + span.eq(0).text().trim();
      if (span.length > 1) value.team = span.eq(1).text().trim();
      if (span.length > 2) {
        const times = span.eq(2).find("img");
        value.times = "";
        for (let tno=0; tno < times.length; tno++) {
          const img = times.eq(tno).attr("src").replace("../img/record/WW", "").replace(".png", "").replace("ups", ":").replace("pnt", ".")
          value.times += img
        }
      }
      if (span.length > 3) {
        const times = span.eq(3).find("img");
        if (times.length > 0) {
          const img = times.eq(0).attr("src").replace("/img/medal_", "").replace(".png", "")
          switch (img) {
            case "gold": value.rank = 1; break;
            case "silver": value.rank = 2; break;
            case "bronze": value.rank = 3; break;
            default:
              value.rank = span.eq(3).text().trim();
              break;
            }
        } else {
          value.rank = span.eq(3).text().replace("위", "").trim();
          if (value.rank) value.rank = Number(value.rank)
          value.rank = value.rank || "DQ";
        }
      }
      if (span.length > 4) value.gender = span.eq(4).text().trim();
      if (span.length > 5) value.ageGroup = span.eq(5).text().trim();
      if (span.length > 6) {
        let style = span.eq(6).text().trim();
        style = (style+" ").split(" ");
        value.style = style[0]
        value.distance = style[1]
      }
      if (span.length > 7) {
        const comp = span.eq(7)
        value.competitionName = comp.find("label").text().replace("\n", "|").trim();
        const pool = comp.find("em").html().trim();
        const arr = (pool + "<br>").split("<br>")
        value.datetime = arr[0].replace(/개최일자|:/gi, "").trim();
        value.pool = arr[1].trim();
      }
      if (span.length > 8) value.dateStart = span.eq(8).text().trim();

      timeArr.push(value);
      timeStr += `${seqno++}\t${value.name}\t${value.team}\t${value.times}\t${value.rank}\t${value.gender}\t${value.ageGroup}\t${value.style}\t${value.distance}\t${value.competitionName}\t${value.pool}\t${value.dateStart}\t${value.datetime}\n`;
    });
    //------------------------------------
    //------------------------------------
    //------------------------------------
  } // for
  fs.writeFileSync("times.json", JSON.stringify(timeArr, null, '\t'));
  fs.writeFileSync("times.txt", timeStr);
  console.log(timeArr.length);

  await page.close();
  await browser.close();
})();