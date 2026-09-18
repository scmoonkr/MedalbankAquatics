const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const mongoDB			= require('../../MSKR/Class/MongoDB');
const mongoCFG 		= require('../../MSKR/Config/mongoCFG');
const mongodb 		= new mongoDB(mongoCFG.Medalbank.database);

/**
 * World Aquatics 웹사이트에서 수영 선수 정보를 크롤링하는 함수
 * @param {string} url - 크롤링할 선수 목록 페이지 URL
 */
async function crawlAthletesHTML(html) {
  console.log('선수 정보 크롤링 시작...');
  
  try {
    // HTTP 요청으로 페이지 가져오기
    // Cheerio로 HTML 파싱
    const $ = cheerio.load(html);
    
    // 선수 정보를 저장할 배열
    const athletes = [];
    
    // 선수 행 선택
    const athleteRows = $('.athlete-table__row');
    
    console.log(`${athleteRows.length}명의 선수 정보 발견`);
    
    // 각 선수 행에서 정보 추출
    athleteRows.each((index, element) => {
      try {
        // 국가 정보
        const country = $(element).find('.athlete-table__country').text().trim().replace(/\s+/g, ' ');
        const countryCode = $(element).find('.flag__img').attr('alt') || '';
        // if (countryCode=='KOR') countryCode = "대한민국";
        
        // 선수 이름
        const firstName = $(element).find('.athlete-table__person-fname').text().trim();
        const lastName = $(element).find('.athlete-table__name strong').text().trim();
        const fullName = `${firstName} ${lastName}`.trim();
        
        // 성별, 생년월일, 종목
        let gender = $(element).find('.athlete-table__cell:nth-child(3)').text().trim();
        switch (gender) {
          case "Male": gender = "men"; break;
          case "Female": gender = "women"; break;
        }
        let dob = $(element).find('.athlete-table__cell:nth-child(4)').text().trim(); // "31/07/1991"
        if (dob) {
          dob = dob.split("/");
          dob = dob.length > 2 ? `${dob[2]}-${dob[1]}-${dob[0]}` : '';
        }
        let discipline = $(element).find('.athlete-table__discipline').text().trim();
        discipline = discipline.split('\n')
                            .map(el => el.trim())
                            .filter(el => el != "");

        
        // 선수 프로필 URL
        const profileLink = $(element).data('link') || $(element).find('.athlete-table__cta-link').attr('href');
        // "//www.worldaquatics.com/athletes/1010747/kyuwoong-choi"
        arr = profileLink.split('/');
        const athleteID = arr.length > 4 ? Number(arr[4]) : 0;
        console.log(arr, athleteID);
        
        // 프로필 이미지 URL
        let profileImageUrl = '';
        const imgElement = $(element).find('.object-fit-cover-picture__img');
        if (imgElement.length > 0) {
          profileImageUrl = imgElement.attr('src') || '';
        }
        
        // 선수 정보 객체 생성
        const athlete = {
          athleteID,
          name: fullName,
          // firstName,
          // lastName,
          // country,
          countryCode,
          gender,
          dateOfBirth: dob,
          discipline,
          profileUrl: profileLink ? `https://www.worldaquatics.com${profileLink.replace(/^\/\/www\.worldaquatics\.com/, '')}` : '',
          profileImageUrl
        };
        
        // 선수 정보 배열에 추가
        athletes.push(athlete);
        
        // 진행 상황 로깅 (10명마다)
        if ((index + 1) % 10 === 0) {
          console.log(`${index + 1}명의 선수 정보 처리 완료`);
        }
      } catch (err) {
        console.error(`${index + 1}번 선수 정보 처리 중 오류:`, err);
      }
    });
    
    console.log(`총 ${athletes.length}명의 선수 정보 추출 완료`);

    // await mongodb.insertMany(mongoCFG.Medalbank.worldaquaticsAthletes, athletes);
    // return;
    
    // JSON 파일로 저장
    // const fileName = 'world_aquatics_athletes.json';
    // fs.writeFileSync(fileName, JSON.stringify(athletes, null, 2));
    // console.log(`선수 정보가 ${fileName}에 저장되었습니다.`);
    
    // CSV 파일로도 저장
    const csvHeader = 'athleteID\tName\tCountry\tGender\tDate of Birth\tDiscipline\n';
    const csvContent = athletes.map(athlete => 
      `${athlete.athleteID}\t${athlete.name}\t${athlete.countryCode}\t${athlete.gender}\t${athlete.dateOfBirth}\t${athlete.discipline.join(',')}`
    ).join('\n');
    
    const csvFileName = 'world_aquatics_athletes.csv';
    fs.writeFileSync(csvFileName, csvHeader + csvContent);
    console.log(`선수 정보가 ${csvFileName}에 저장되었습니다.`);
    
    return athletes;
  } catch (error) {
    console.error('크롤링 중 오류 발생:', error);
    throw error;
  }
}

/**
 * 메인 실행 함수
 */
async function main() {
  try {

    crawlAthletesHTML(fs.readFileSync('athletes.html', 'utf-8'));
    
    console.log('크롤링 완료!');
  } catch (error) {
    console.error('프로그램 실행 중 오류:', error);
  }
}

// 프로그램 실행
if (require.main === module) {
  main();
}
