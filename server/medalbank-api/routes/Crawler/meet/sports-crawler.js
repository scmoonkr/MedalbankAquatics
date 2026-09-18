const puppeteer = require('puppeteer');
const cheerio = require('cheerio');

const _url = "https://meet.sports.or.kr/history/schedule/class.do";

class SportsCrawler {
  constructor() {
    this.browser = null;
    this.page = null;
  }

  async init() {
    this.browser = await puppeteer.launch({
      headless: false, // 디버깅용 - true로 변경하면 백그라운드 실행
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-web-security',
        '--disable-features=VizDisplayCompositor'
      ]
    });
    
    this.page = await this.browser.newPage();
    
    // User Agent 설정
    await this.page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');
    
    // 뷰포트 설정
    await this.page.setViewport({ width: 1920, height: 1080 });
    
    // 요청 차단 (이미지, CSS 등 불필요한 리소스)
    await this.page.setRequestInterception(true);
    this.page.on('request', (req) => {
      const resourceType = req.resourceType();
      if (['stylesheet', 'image', 'font'].includes(resourceType)) {
        req.abort();
      } else {
        req.continue();
      }
    });
  }

  async crawlScheduleDetail(baseUrl, params) {
    try {
      const { rhCd, myType, gmOrd, detailClassCd, kindCd, formData } = params;
      
      // 먼저 메인 페이지 로드
      await this.page.goto(baseUrl, { 
        waitUntil: 'networkidle2',
        timeout: 30000 
      });

      // jQuery가 로드될 때까지 대기
      await this.page.waitForFunction(() => typeof $ !== 'undefined', { timeout: 10000 });

      // 폼 데이터 설정 (ScheduleVO 폼이 있다면)
      if (formData) {
        await this.page.evaluate((data) => {
          if (document.ScheduleVO) {
            Object.keys(data).forEach(key => {
              if (document.ScheduleVO[key]) {
                document.ScheduleVO[key].value = data[key];
              }
            });
          }
        }, formData);
      }

      // openKeySide 함수 실행
      const result = await this.page.evaluate((rhCd, myType, gmOrd, detailClassCd, kindCd) => {
        return new Promise((resolve, reject) => {
          try {
            // URL 구성 로직 복제
            let hostIndex = location.href.indexOf(location.host) + location.host.length;
            let url = location.protocol + "//" + location.host + 
                     location.href.substring(hostIndex, location.href.indexOf('/', hostIndex + 1));
            let str = "";

            // 폼 데이터 가져오기
            var frm = document.ScheduleVO;
            if (frm) {
              str = "?searchClassCd=" + (frm.searchClassCd?.value || '') + 
                    "&searchGubun=" + (frm.searchGubun?.value || '') + 
                    "&searchGameno=" + (window.searchGameno?.value || '');
              str += "&searchKindCd=" + kindCd + "&searchDetailClassCd=" + detailClassCd;
              str += "&searchRhCd=" + rhCd + "&searchGmOrd=" + gmOrd;
            }

            // URL 결정
            if (myType == "T" || myType == "L") {
              if (myType == "L") str += "&searchGroupCd=" + rhCd.substring(2, 3);
              url = url + "/schedule/scheduleDetailT.do";
            } else {
              url = url + "/schedule/scheduleDetailR.do";
            }

            const finalUrl = url + str;
            console.log('Loading URL:', finalUrl);

            // AJAX 로드 실행
            $('#recordWrap').load(finalUrl, function(response, status, xhr) {
              if (status === "success") {
                // 로드 완료 후 잠시 대기
                setTimeout(() => {
                  resolve({
                    success: true,
                    url: finalUrl,
                    content: $('#recordWrap').html()
                  });
                }, 1000);
              } else {
                reject(new Error(`Load failed: ${status}`));
              }
            });

          } catch (error) {
            reject(error);
          }
        });
      }, rhCd, myType, gmOrd, detailClassCd, kindCd);

      if (result.success) {
        // Cheerio로 파싱
        const $ = cheerio.load(result.content);
        
        return {
          url: result.url,
          content: result.content,
          parsedData: this.parseScheduleData($)
        };
      }

    } catch (error) {
      console.error('Crawling error:', error);
      throw error;
    }
  }

  // 크롤링된 데이터 파싱
  parseScheduleData($) {
    const data = {
      teams: [],
      scores: [],
      gameInfo: {},
      records: []
    };

    // 팀 정보 추출
    $('.team-name').each((i, el) => {
      data.teams.push($(el).text().trim());
    });

    // 점수 정보 추출
    $('.score').each((i, el) => {
      data.scores.push($(el).text().trim());
    });

    // 경기 정보 추출
    $('.game-info tr').each((i, el) => {
      const key = $(el).find('th').text().trim();
      const value = $(el).find('td').text().trim();
      if (key && value) {
        data.gameInfo[key] = value;
      }
    });

    // 기록 정보 추출
    $('.record-table tr').each((i, el) => {
      if (i === 0) return; // 헤더 스킵
      
      const record = {};
      $(el).find('td').each((j, cell) => {
        const cellText = $(cell).text().trim();
        record[`col${j}`] = cellText;
      });
      
      if (Object.keys(record).length > 0) {
        data.records.push(record);
      }
    });

    return data;
  }

  // 여러 경기 크롤링
  async crawlMultipleGames(baseUrl, gamesList) {
    const results = [];
    
    for (const gameParams of gamesList) {
      try {
        console.log(`Crawling game: ${gameParams.rhCd}`);
        
        const result = await this.crawlScheduleDetail(baseUrl, gameParams);
        results.push({
          ...gameParams,
          ...result,
          timestamp: new Date().toISOString()
        });
        
        // 요청 간 딜레이
        await this.delay(2000);
        
      } catch (error) {
        console.error(`Failed to crawl game ${gameParams.rhCd}:`, error);
        results.push({
          ...gameParams,
          error: error.message,
          timestamp: new Date().toISOString()
        });
      }
    }
    
    return results;
  }

  // 딜레이 유틸리티
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async close() {
    if (this.browser) {
      await this.browser.close();
    }
  }
}

// 사용 예제
async function main() {
  const crawler = new SportsCrawler();
  
  try {
    await crawler.init();
    
    // 단일 경기 크롤링
    const singleResult = await crawler.crawlScheduleDetail(_url, {
      rhCd: 'KBO202412010',
      myType: 'T',
      gmOrd: '1',
      detailClassCd: '001',
      kindCd: 'KBO',
      formData: {
        searchClassCd: '001',
        searchGubun: 'all',
        searchGameno: '20241201'
      }
    });
    
    console.log('Single game result:', singleResult);
    
    // 여러 경기 크롤링
    const gamesList = [
      {
        rhCd: 'KBO202412010',
        myType: 'T',
        gmOrd: '1',
        detailClassCd: '001',
        kindCd: 'KBO'
      },
      {
        rhCd: 'KBO202412020',
        myType: 'R',
        gmOrd: '2',
        detailClassCd: '001',
        kindCd: 'KBO'
      }
    ];
    
    const multipleResults = await crawler.crawlMultipleGames(_url, gamesList);
    console.log('Multiple games results:', multipleResults);
    
    // 결과를 JSON 파일로 저장
    const fs = require('fs');
    fs.writeFileSync('./crawl_results.json', JSON.stringify(multipleResults, null, 2));
    
  } catch (error) {
    console.error('Main error:', error);
  } finally {
    await crawler.close();
  }
}

// 실행
if (require.main === module) {
  main();
}

module.exports = SportsCrawler;