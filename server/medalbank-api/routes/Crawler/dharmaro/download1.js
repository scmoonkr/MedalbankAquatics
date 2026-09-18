const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
  const url = 'https://kabc.dongguk.edu/viewer/view?dataId=ABC_IT_K1027_T_001';
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  // 페이지 접속
  await page.goto(url, { waitUntil: 'networkidle2', timeout: 0 });

  // canvas 로딩 대기
  await page.waitForSelector('canvas');

  // 캔버스를 이미지로 추출
  const imageData = await page.evaluate(() => {
    const canvas = document.querySelector('canvas');
    return canvas ? canvas.toDataURL('image/png') : null;
  });

  if (!imageData) {
    console.error('canvas 태그를 찾을 수 없습니다.');
  } else {
    const base64Data = imageData.replace(/^data:image\/png;base64,/, '');
    fs.writeFileSync('canvas.png', base64Data, 'base64');
    console.log('✅ canvas.png 저장 완료');
  }

  await browser.close();
})();
