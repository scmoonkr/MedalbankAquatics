const cheerio = require('cheerio');
const { parsingTimesRow } = require("./parsingTimesRow");
const { processSplitTimeClick} = require("./processSplitTimeClick");

exports.crawlingHeatClick = async (page, eventButtons, competitionID) => {
  let eventName = "";
  let eventTimes = [];
  // console.log("processClick.eventButton.length=", eventButtons.length);
        
  await new Promise(resolve => setTimeout(resolve, 1000));
  for (let buttonIndex = 0; buttonIndex < eventButtons.length; buttonIndex++) {
    try {
      // 현재 페이지에서 이벤트 버튼 다시 가져오기
      let currentEventButtons = await page.$$('.unit-selector__unit-select');
      // console.log("----->", buttonIndex, currentEventButtons.length);
      if (buttonIndex >= currentEventButtons.length) {
        console.log(`이벤트 버튼 인덱스 ${buttonIndex}가 범위를 벗어났습니다. 다음 종목으로 넘어갑니다.`);
        eventTimes = null;
        // await new Promise(resolve => setTimeout(resolve, 1000));
        // currentEventButtons = await page.$$('.unit-selector__unit-select');
        break;
      }
      
      // 이벤트 이름 가져오기
      eventName = await page.evaluate(el => {
        const nameElement = el.querySelector('.unit-selector__unit-name');
        return nameElement ? nameElement.textContent.trim() : '';
      }, currentEventButtons[buttonIndex]);
      // console.log(">", eventName);
      //------------------------------------------
      if (eventName.includes("Summary")) {
        console.log(`${buttonIndex+1} / ${eventButtons.length} : skip - [${eventName}]`);
        continue;
      }
      //------------------------------------------
      // console.log(`\n처리 중인 이벤트: ${eventName}`);
      
      // 이벤트 버튼 클릭
      await currentEventButtons[buttonIndex].click();
      // console.log(`이벤트 버튼 클릭 완료: ${eventName}`);


      // 결과 테이블 로드 대기
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // 결과 테이블 분석
      // console.log(`${eventName} 결과 테이블 분석 중...`);
      let rows = [];
      let $;
      
      // 현재 페이지 콘텐츠 추출
      try {
        const content = await page.content();
        $ = cheerio.load(content);
                    
        // 테이블 행 추출
        rows = $('.results-table__row');  
      } catch (e) {
        console.log("sleep...........................");
        await new Promise(resolve => setTimeout(resolve, 1000));
        const content = await page.content();
        $ = cheerio.load(content);
                    
        // 테이블 행 추출
        rows = $('.results-table__row');  
      }
      
      // console.log(`${rows.length}개의 결과 행 발견`);
      //---------------------------------
      const results = parsingTimesRow($, competitionID, rows, eventName);
      //---------------------------------

      // 선수별 상세 결과 (랩타임) 추출
      // console.log('선수별 랩타임 추출 중...');
      //=====================================================
      // 각 행의 확장 버튼(구간 time) 클릭하여 상세 정보 보기
      //=====================================================
      const expandButtons = await page.$$('.results-table__expand-btn');
      const custResults = await processSplitTimeClick(page, expandButtons, results);
      eventTimes = [ ...eventTimes, ...custResults ];
      //=====================================================
      // console.log("eventTimes=", eventTimes.length);
      
      console.log(`${buttonIndex+1} / ${eventButtons.length} : ${results.length}(${eventTimes.length}) - [${eventName}]`);

      // 이벤트 결과 저장
      
      // 이벤트별 JSON 파일 저장 (선택 사항)
      // const sanitizedEventText = eventText.replace(/[^a-zA-Z0-9가-힣]/g, '_');
      // const sanitizedEventName = eventName.replace(/[^a-zA-Z0-9가-힣]/g, '_');
      // const eventFileName = `${sanitizedEventText}_${sanitizedEventName}_results.json`;
      // fs.writeFileSync(eventFileName, JSON.stringify(results, null, 2));
      // console.log(`결과가 ${eventFileName}에 저장되었습니다.`);
      // console.log("\t\t", eventName, eventTimes.length);
    } catch (eventErr) {
      console.error(`이벤트 처리 중 오류 발생:`, eventErr);
      // fs.writeFileSync("latestEvent.json", JSON.stringify({ competitionID: competitionID, event: ">"+eventText }));
      // // eventTimes = null;
      // browser.close();
      // process.exit();
      eventTimes = null;
      break;
    }
  }
  return eventTimes;
}