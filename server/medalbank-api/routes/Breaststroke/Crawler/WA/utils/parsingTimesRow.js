
exports.parsingTimesRow = ($, competitionID, rows, heat) => {
  const times = [];
  rows.each((index, row) => {
    try {
      // 각 셀에서 데이터 추출
      const rank = $(row).find('.results-table__cell:nth-child(1)').text().trim().replace(/\s+/g, ' ');
      const lane = $(row).find('.results-table__cell:nth-child(2)').text().trim();
      const country = $(row).find('.results-table__country').first().text().trim().replace(/\s+/g, ' ');
      
      // 선수 이름 추출 (성과 이름이 분리되어 있을 수 있음)
      const firstName = $(row).find('.results-table__athlete-first').text().trim();
      const lastName = $(row).find('.results-table__athlete-last').text().trim();
      const athleteName = `${firstName} ${lastName}`.trim();
      
      // 나이 및 기타 정보 추출
      const age = $(row).find('.results-table__cell:nth-child(5)').text().trim();
      const reactionTime = $(row).find('.results-table__cell:nth-child(6)').text().trim();
      
      // 시간 정보 추출 (여러 클래스 중 하나에 있을 수 있음)
      let time = '';
      const timeCell = $(row).find('.results-table__cell--highlight');
      if (timeCell.length > 0) {
        time = timeCell.text().trim().replace(/\s+/g, ' ');
      } else {
        // 대체 방법으로 시간을 찾음
        time = $(row).find('.results-table__time').text().trim().replace(/\s+/g, ' ');
      }
      let qualified;
      if (time.includes("Qualified")) {
        qualified = true;
        time = time.replace("Qualified", "").trim();
      }
      
      const timeBehind = $(row).find('.results-table__cell:nth-child(8)').text().trim();
      const points = $(row).find('.results-table__cell:nth-child(9)').text().trim();
      
      // 선수 프로필 링크 추출
      const profileLink = $(row).find('.results-table__athlete-link').attr('href');
      
      // 선수의 기록을 나타내는 특수 표시 확인 (세계신기록, 올림픽 신기록 등)
      const recordLabels = [];
      $(row).find('.results-table__record').each((i, record) => {
        recordLabels.push($(record).text().trim());
      });
      
      // 결과 객체 생성
      const timeObj = {
        competitionID,
        rank,
        lane,
        country,
        athlete: athleteName,
        age,
        heat, // Finals | Heat 1
        reactionTime,
        time,
        timeBehind,
        points,
        profileLink: profileLink ? `https://www.worldaquatics.com${profileLink}` : '',
        records: recordLabels.join(', '),
        splitTimes: [] // 나중에 채워질 예정
      };
      if (qualified) timeObj.qualified = qualified;
      times.push(timeObj);
    } catch (err) {
      console.error(`crawlingRow.catch.${index}번 행 처리 중 오류:`, err);
    }
  });
  return times;
}
