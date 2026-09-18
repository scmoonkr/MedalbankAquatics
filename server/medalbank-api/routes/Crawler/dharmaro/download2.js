const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
  const url = 'https://kabc.dongguk.edu/viewer/view?dataId=ABC_IT_K1027_T_001';
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  // ✅ 고해상도 캡처를 위한 설정
  await page.setViewport({
    width: 1920,
    height: 1080,
    deviceScaleFactor: 3  // 3배 고해상도 (예: Retina 디스플레이 수준)
  });

  await page.goto(url, { waitUntil: 'networkidle2', timeout: 0 });
  await page.waitForSelector('canvas');

  const imageData = await page.evaluate(() => {
    const canvas = document.querySelector('canvas');

    // 고해상도 출력을 위한 가상 canvas 생성
    const scale = 3;
    const tmpCanvas = document.createElement('canvas');
    tmpCanvas.width = canvas.width * scale;
    tmpCanvas.height = canvas.height * scale;

    const ctx = tmpCanvas.getContext('2d');
    ctx.scale(scale, scale);
    ctx.drawImage(canvas, 0, 0);

    return tmpCanvas.toDataURL('image/png');
  });

  if (!imageData) {
    console.error('❌ canvas 태그를 찾을 수 없습니다.');
  } else {
    const base64Data = imageData.replace(/^data:image\/png;base64,/, '');
    fs.writeFileSync('canvas-highres.png', base64Data, 'base64');
    console.log('✅ 고해상도 canvas-highres.png 저장 완료');
  }

  await browser.close();
})();
