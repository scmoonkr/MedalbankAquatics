const cheerio = require('cheerio');

/**
 * 구간별 time처리: 50M, 100M, 150M, 200M, 250M, 300M, 350M, 400M, 
 * @param {*} page 
 * @param {*} $ 
 * @param {*} times 
 * @returns 
 */
exports.processSplitTimeClick = async (page, expandButtons, times) => {
  for (let i = 0; i < times.length; i++) {
    try {
      // 확장 버튼
      if (i < expandButtons.length) {
        // 확장 버튼 클릭
        await expandButtons[i].click();
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // 업데이트된 콘텐츠 가져오기
        const updatedContent = await page.content();
        const $ = cheerio.load(updatedContent);
        
        // 랩타임 데이터 추출
        const subTable = $(`.results-table__row:eq(${i})`).next('.results-table__expandable');
        
        if (subTable.length > 0) {
          const splitTimes = [];
          const subRows = subTable.find('.results-table__sub-row');
          
          subRows.each((idx, subRow) => {
            const distanceText = $(subRow).find('.results-table__split').text().trim();
            const splitTime = $(subRow).find('.results-table__sub-cell:nth-child(2)').text().trim();
            const cumTime = $(subRow).find('.results-table__sub-cell:nth-child(3)').text().trim();
            
            splitTimes.push({
              distance: distanceText,
              splitTime,
              cumulativeTime: cumTime
            });
          });
          
          // 결과 객체에 랩타임 추가
          times[i].splitTimes = splitTimes;
        }
        
        // 확장 버튼 다시 클릭하여 닫기 (UI 정리)
        await expandButtons[i].click();
        await new Promise(resolve => setTimeout(resolve, 50));
      }
    } catch (err) {
      console.error(`${i+1}번 선수의 랩타임 추출 중 오류:`, err);
    }
  }
  return times;  
}