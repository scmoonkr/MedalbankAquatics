


function getTimesBestByMonth(times) {
   //=======================================================
   // 2025년부터 월별 최고기록 가져오기
   //=======================================================
   const sortedTimes = times.sort((a, b) => new Date(a.datetime) - new Date(b.datetime));
   const uniqueDate = [...new Set(sortedTimes.map(el => el.datetime.slice(0, 7)))].filter(el => Number(el.slice(0, 4)) >= 2025);
   console.log("uniqueDate=", uniqueDate);

   const months = {};
   for (const date of uniqueDate) {
      for (const disp of ["BR", "FR", "BK", "FL", "IM"]) {
         for (const distance of ["25M", "50M", "100M", "200M", "400M", "800M", "1500M"]) {
            for (const course of ["SCM", "LCM"]) {            
               const timesOfDate = sortedTimes.filter(el => el.discipline==disp && el.course==course && el.distance==distance && el.datetime.slice(0, 7) === date);
               if(timesOfDate.length == 0) continue;
               const best = timesOfDate.sort((a,b) => a.timeStamp - b.timeStamp);
               months[`${disp}_${course}_${distance}_${date}`] = { time: best[0].time, datetime: best[0].datetime }
            }
         }
      }
   }
   //=======================================================
   return months;
}  

/**
 * timeStamp를 시간 문자열로 변환
 * @param {number} timestamp - 타임스탬프 (일 단위)
 * @returns {string} 포맷된 시간 문자열
 */
function formatTimeFromTimestamp(timestamp) {
   // timestamp는 일 단위이므로 초로 변환
   const totalSeconds = timestamp * 24 * 60 * 60;
   
   const minutes = Math.floor(totalSeconds / 60);
   const seconds = totalSeconds % 60;
   
   if (minutes > 0) {
      // MM:SS.ss 형식
      return `${minutes}:${seconds.toFixed(2).padStart(5, '0')}`;
   } else {
      // SS.ss 형식
      return seconds.toFixed(2);
   }
}

/**
 * 기록들의 평균 타임 계산
 * @param {Array} times - 기록 배열
 * @returns {Object} 평균 정보 객체
 */
function getAverageTime(times) {
   if (!times || times.length === 0) {
      return {
         count: 0,
         timeStamp: null,
         time: null
      };
   }
   
   // timeStamp 합계 계산
   const totalTimestamp = times.reduce((sum, record) => sum + record.timeStamp, 0);
   const timeStamp = totalTimestamp / times.length;
   
   // timeStamp를 시간 문자열로 변환 (MM:SS.ss 또는 SS.ss)
   const time = formatTimeFromTimestamp(timeStamp);
   
   return {
      count	: times.length,
      time	: time,
      // timeStamp	: timeStamp,
   };
}

/**
 * 최고 기록(가장 빠른 기록) 찾기
 * @param {Array} times - 기록 배열
 * @returns {Object} 최고 기록 객체
 */
function getBestTime(times) {
   if (!times || times.length === 0) {
      return null;
   }
   
   // timeStamp가 가장 작은 것이 가장 빠른 기록
   const bestRecord = times.reduce((best, current) => {
      return current.timeStamp < best.timeStamp ? current : best;
   });
   
   return {
		dataID	: bestRecord.dataID,
		name		: bestRecord.name,
		time		: bestRecord.time,
		datetime: bestRecord.datetime,
	 };
}

/**
 * 특정 기간 동안의 기록을 discipline, distance, course별로 필터링하여 반환
 * @param {Array} times - 전체 기록 배열
 * @param {string} discipline - 종목 (예: 'BR', 'FR', 'BK', 'FL')
 * @param {string} distance - 거리 (예: '50M', '100M', '200M')
 * @param {string} course - 코스 (예: 'SCM', 'LCM') - 선택사항
 * @param {Object} period - 기간 설정 객체
 * @returns {Array} 필터링된 기록 배열
 */
function getTimesByPeriodOld(times, discipline, distance, course = null, period) {
   const today = new Date();
   let startDate, endDate;
   
   // 기간 타입에 따라 startDate, endDate 설정
   if (period.type === 'months') {
      // 최근 N개월
      startDate = new Date(today);
      startDate.setMonth(today.getMonth() - period.value);
      endDate = today;
   } else if (period.type === 'month') {
      // 특정 월 (예: 2025년 1월)
      const [year, month] = period.value.split('-').map(Number);
      startDate = new Date(year, month - 1, 1);
      endDate = new Date(year, month, 0); // 해당 월의 마지막 날
   } else if (period.type === 'quarter') {
      // 특정 분기 (예: 2025-Q1)
      const [year, quarter] = period.value.match(/(\d{4})-Q(\d)/).slice(1).map(Number);
      const quarterStartMonth = (quarter - 1) * 3;
      startDate = new Date(year, quarterStartMonth, 1);
      endDate = new Date(year, quarterStartMonth + 3, 0);
   } else if (period.type === 'season') {
      // 시즌 (예: 2023-2025 또는 2025)
      const seasonMatch = period.value.match(/(\d{4})(?:-(\d{4}))?/);
      const year1 = parseInt(seasonMatch[1]);
      const year2 = seasonMatch[2] ? parseInt(seasonMatch[2]) : year1;
      
      // 시즌: 9월 1일 ~ 다음해 8월 31일
      startDate = new Date(year1, 8, 1); // 9월 1일
      endDate = new Date(year2, 7, 31); // 8월 31일
   }
   
   return times.filter(record => {
      const recordDate = new Date(record.datetime);
      
      // 기본 필터: discipline, distance, 날짜 범위
      const matchesDiscipline = record.discipline === discipline;
      const matchesDistance = record.distance === distance;
      const withinDateRange = recordDate >= startDate && recordDate <= endDate;
      
      // course가 지정된 경우 추가 필터링
      const matchesCourse = course ? record.course === course : true;
      
      return matchesDiscipline && matchesDistance && matchesCourse && withinDateRange;
   });
}

function calculatePeriod() {

}
/**
 * 특정 기간 동안의 기록을 discipline, distance, course별로 필터링하여 반환
 * @param {Array} times - 전체 기록 배열
 * @param {string} discipline - 종목 (예: 'BR', 'FR', 'BK', 'FL')
 * @param {string} distance - 거리 (예: '50M', '100M', '200M')
 * @param {string} course - 코스 (예: 'SCM', 'LCM') - 선택사항
 * @param {Object} period - 기간 설정 객체
 * @returns {Array} 필터링된 기록 배열
 */
function getTimesByPeriod(times, discipline, distance, course = null, startDate, endDate) {
   const today = new Date();
   startDate = new Date(startDate);
	 endDate = new Date(endDate);
   
   return times.filter(record => {
      const recordDate = new Date(record.datetime);
      
      // 기본 필터: discipline, distance, 날짜 범위
      const matchesDiscipline = record.discipline === discipline;
      const matchesDistance = record.distance === distance;
      const withinDateRange = recordDate >= startDate && recordDate <= endDate;
      
      // course가 지정된 경우 추가 필터링
      const matchesCourse = course ? record.course === course : true;
      
      return matchesDiscipline && matchesDistance && matchesCourse && withinDateRange;
   });
}

/**
 * 특정 분기의 기록 조회
 * @param {Array} times - 전체 기록 배열
 * @param {string} discipline - 종목
 * @param {string} distance - 거리
 * @param {string} quarter - 'YYYY-Q1' 형식 (Q1: 1-3월, Q2: 4-6월, Q3: 7-9월, Q4: 10-12월)
 * @param {string} course - 코스 (선택사항)
 * @returns {Array} 필터링된 기록 배열
 */
function getTimesByQuarter(times, discipline, distance, quarter, course = null) {
   return getTimesByPeriod(times, discipline, distance, course, { 
      type: 'quarter', 
      value: quarter 
   });
}

/**
 * 특정 시즌의 기록 조회
 * @param {Array} times - 전체 기록 배열
 * @param {string} discipline - 종목
 * @param {string} distance - 거리
 * @param {string} season - '2023-2025' 또는 '2025' 형식 (9월~다음해 8월)
 * @param {string} course - 코스 (선택사항)
 * @returns {Array} 필터링된 기록 배열
 */
function getTimesBySeason(times, discipline, distance, season, course = null) {
   return getTimesByPeriod(times, discipline, distance, course, { 
      type: 'season', 
      value: season 
   });
}
module.exports = {
   getAverageTime,
   getBestTime,
   getTimesBestByMonth,
	 getTimesByQuarter,
	 calculatePeriod,
};