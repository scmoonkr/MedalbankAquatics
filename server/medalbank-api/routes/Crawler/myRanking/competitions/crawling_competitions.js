const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');

/**
 * 수영 대회 목록을 웹사이트에서 스크래핑하는 함수
 * @param {string} url - 대회 목록 페이지 URL
 * @returns {Promise<Array>} - 대회 정보 배열
 */
async function fetchCompetitions(url) {
  try {
    // 웹페이지 가져오기
    const response = await axios.get(url);
    const html = response.data;
    const $ = cheerio.load(html);
    
    // 대회 정보를 저장할 배열
    const competitions = [];
    
    // 대회 목록 요소 선택 (예시 선택자)
    // 실제 웹사이트 구조에 맞게 선택자 수정 필요
    $('.calendar_month').each((index, element) => {
      // data-index 속성에서 대회 정보 파싱
      const dataIndex = $(element).attr('data-index');
      if (dataIndex) {
        const [id, name, startDate, endDate, location, poolSize] = dataIndex.split('/');
        
        // 도시 정보 추출
        const cityElement = $(element).find('span').eq(2);
        const city = cityElement.text();
        
        // 대회 객체 생성
        const competition = {
          id: id,
          name: name,
          nameEn: getEnglishName(name), // 영문 이름 생성 함수 (필요시 구현)
          startDate: startDate,
          endDate: endDate,
          location: location,
          city: city,
          poolSize: poolSize
        };
        
        competitions.push(competition);
      }
    });
    
    return competitions;
  } catch (error) {
    console.error('대회 목록 가져오기 실패:', error);
    throw error;
  }
}

/**
 * 여러 해의 대회 데이터를 수집하는 함수
 * @param {string} baseUrl - 기본 URL
 * @param {Array<string>} years - 수집할 연도 배열
 * @returns {Promise<Object>} - 연도별 대회 정보
 */
async function fetchAllCompetitionsByYear(baseUrl, years) {
  const allCompetitions = {};
  
  for (const year of years) {
    const url = `${baseUrl}?year=${year}`;
    console.log(`${year}년 대회 데이터 수집 중...`);
    
    try {
      const competitions = await fetchCompetitions(url);
      allCompetitions[year] = competitions;
      console.log(`${year}년 대회 ${competitions.length}개 수집 완료`);
    } catch (error) {
      console.error(`${year}년 대회 데이터 수집 실패:`, error);
      allCompetitions[year] = [];
    }
  }
  
  return allCompetitions;
}

/**
 * 한글 대회명에서 영문 이름 추출 또는 생성하는 함수
 * 실제 구현은 사이트가 영문 이름을 제공하는지 여부에 따라 달라짐
 * @param {string} koreanName - 한글 대회명
 * @returns {string} - 영문 대회명
 */
function getEnglishName(koreanName) {
  // 간단한 예시 - 실제로는 더 복잡한 로직이나 외부 번역 API를 사용할 수 있음
  const translations = {
    '전국': 'National',
    '마스터즈': 'Masters',
    '수영대회': 'Swimming Competition',
    '생활체육': 'Sports',
    '청장배': 'Mayor\'s Cup',
    '회장배': 'President\'s Cup',
    '장거리': 'Long Distance'
    // 더 많은 번역 매핑 추가
  };
  
  let englishName = koreanName;
  Object.keys(translations).forEach(korean => {
    englishName = englishName.replace(new RegExp(korean, 'g'), translations[korean]);
  });
  
  return englishName;
}

/**
 * 수집한 대회 데이터를 JSON 파일로 저장하는 함수
 * @param {Object} data - 저장할 데이터
 * @param {string} filename - 저장할 파일명
 */
function saveToJson(data, filename) {
  fs.writeFileSync(filename, JSON.stringify(data, null, 2), 'utf8');
  console.log(`데이터 저장 완료: ${filename}`);
}

/**
 * 메인 실행 함수
 */
async function main() {
  const baseUrl = 'https://example.com/swimming/competitions'; // 실제 사이트 URL로 변경 필요
  const years = ['2023', '2024', '2025'];
  
  try {
    // 모든 연도의 대회 데이터 수집
    const allCompetitions = await fetchAllCompetitionsByYear(baseUrl, years);
    
    // JSON 파일로 저장
    saveToJson(allCompetitions, 'swimming_competitions.json');
    
    // 모든 대회를 하나의 배열로 합치기
    const flatCompetitions = Object.values(allCompetitions).flat();
    console.log(`총 ${flatCompetitions.length}개 대회 데이터 수집 완료`);
    
    // 날짜별 정렬
    flatCompetitions.sort((a, b) => a.startDate.localeCompare(b.startDate));
    saveToJson(flatCompetitions, 'all_competitions.json');
  } catch (error) {
    console.error('프로그램 실행 중 오류 발생:', error);
  }
}

// 프로그램 실행
main();