const mongoDB			= require('../../MSKR/Class/MongoDB');
const mongoCFG 		= require('../../MSKR/Config/mongoCFG');
const mongodb 		= new mongoDB(mongoCFG.Medalbank.database);
const { crawlingHeatClick } = require("./crawlingHeatClick");

const { updateTimeResult, updateTimesMongo } = require("./updateMongo");/**
 * 
 * Women 50m Freestyle
 * @param {*} page : cheerio
 * @param {*} competition : { competitionID, name, ...}
 * @param {*} round: "Finals", "Semifinals", "Quarterfinals", "Heat 1"
 * @returns OK: "", error: eventText - "Women 50m Freestyle"
 */
exports.crawlingEvents = async (page, eventIndex, competitionID, eventUrl, _event, _skip) => {

  let eventText = ""; // Women 50m Freestyle
  console.time("worldaquaticsEvent");
  try {
    await new Promise(resolve => setTimeout(resolve, 500));
    // 현재 페이지에서 종목 요소 다시 가져오기 (페이지 새로고침 후)
    const currentEventElements = await page.$$('.schedule__item-title');
    if (eventIndex >= currentEventElements.length) {
      console.log(`종목 인덱스 ${eventIndex}가 범위를 벗어났습니다.retry`);
      // fs.writeFileSync("latestEvent.json", JSON.stringify({ competitionID, event: ">"+eventText }));
      return;
    }
    
    // 종목 텍스트 가져오기: eventText: "Women 50m Freestyle"
    eventText = await page.evaluate(el => el.textContent.trim(), currentEventElements[eventIndex]);

    const eventarr = eventText.split(" ");
    if (eventarr.length > 1) {
      // eventText = eventarr[0];
      if (!"freestyle,backstroke,breaststroke,butterfly,medley,relay".includes(eventarr[eventarr.length - 1].toLowerCase())) {
        console.log("xxxxxxxxxxxxxxxxxxxxxxxx swimming");
        return eventText;
      }
    }

    console.log("eventText=", eventText);
    //------------------------------------------
    if (eventText.includes("Relay")) return "";

    if (_skip && eventText !== _event) return "";
    if (_skip) _event = ""; 
    _skip = false;
    // if (_event.length > 0 && eventText !== _event) continue;
    if (_event.length > 0 && eventText !== _event) return "";
    // console.log("~~~~~~~~~ skip:", skip, "eventText=", eventText, "_event=", _event);
    //------------------------------------------
    console.log(`\n처리 중인 종목 ${eventIndex + 1}: ${eventText}`);
    

    await new Promise(resolve => setTimeout(resolve, 500));
    // 종목 클릭하여 세부 이벤트 보기
    await currentEventElements[eventIndex].click();
    console.log(`\n[${competitionID}] - ${eventIndex + 1}/${currentEventElements.length}: [${eventText}]`);
    console.log(`종목 클릭 완료: ${eventText}`);



    // 클릭 후 DOM 업데이트 대기
    await new Promise(resolve => setTimeout(resolve, 3000));
    console.log("delayed...1000");
    
    // 모든 이벤트 버튼 찾기unit-selector__unit-select
    const eventButtons = await page.$$('.unit-selector__unit-select');
    console.log(`${eventButtons.length}개의 이벤트 발견`);
    // 모든 이벤트 버튼의 텍스트 출력 (디버깅용)
    for (let i = 0; i < eventButtons.length; i++) {
      //-----
      const buttonText = await page.evaluate(el => {
        const nameElement = el.querySelector('.unit-selector__unit-name');
        return nameElement ? nameElement.textContent.trim() : '';
      }, eventButtons[i]);
      //-----
      console.log(`- 이벤트 ${i+1}: ${buttonText}`);
    }
    
    //=====================================================
    // 각 이벤트 순회: Finals
    //=====================================================
    // 종목별 모든 이벤트 결과 저장
    const eventTimes = await crawlingHeatClick(page, eventButtons, competitionID);
    // check error
    if (eventTimes == null) {
      console.log("processClick.error");
      return eventText;
    }
    //=====================================================
    //=====================================================
    
    // 다시 종목 목록으로 돌아가는 방법이 필요할 수 있음
    // 이전에 있던 페이지로 돌아가기
    // await page.goBack();
    console.log('종목 목록으로 돌아가기 완료');
    

    //=====================================================
    // 각 이벤트 순회
    //=====================================================
    //-----------------------------------------------
    console.log("crawled times.", eventTimes.length);


    
    let inserted = 0;
    if (eventTimes.length > 0) {
      const times = updateTimeResult(eventText, eventTimes);
      if (times.length > 0) {
        inserted = await updateTimesMongo(competitionID, times);
        global.insertedCount += inserted.length;
      }
      if (inserted.length > 0) console.log("...............................................");
      console.log(`[${eventText}] : ${global.insertedCount} - ${inserted.length} / ${eventTimes.length}`);
      if (inserted.length > 0) console.log("...............................................");
    }
    // 페이지 로드 대기
    await new Promise(resolve => setTimeout(resolve, 500));
    //-----------------------------------------------
  } catch (err) {
    console.error(`종목 ${eventIndex + 1} 처리 중 오류 발생:`, err);
    // fs.writeFileSync("latestEvent.json", JSON.stringify({ competitionID: competitionID, event: ">"+eventText }));

    // 오류 발생 시 메인 페이지로 돌아가서 계속 진행
    await page.goto(eventUrl, { waitUntil: 'networkidle2' });
    await new Promise(resolve => setTimeout(resolve, 1000));
    return eventText;
  }
  console.timeEnd("-----> worldaquaticsEvent");

  return "";
}