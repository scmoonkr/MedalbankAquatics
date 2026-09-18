const puppeteer = require('puppeteer');
const fs = require('fs');

const delay = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));

(async () => {
  const url = 'https://kabc.dongguk.edu/viewer/view?dataId=ABC_IT_K1027_T_001';
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  await page.setViewport({ width: 1920, height: 1080, deviceScaleFactor: 3 });
  await page.goto(url, { waitUntil: 'networkidle2', timeout: 0 });
  await page.waitForSelector('canvas');

  let index = 1;
  let hasNext = true;

  while (hasNext) {
    // wait a moment to make sure canvas is fully rendered
    // await page.waitForTimeout(500);		
		await delay(500);

    const imageData = await page.evaluate(() => {
      const canvas = document.querySelector('canvas');
      if (!canvas) return null;

      const scale = 3;
      const tmpCanvas = document.createElement('canvas');
      tmpCanvas.width = canvas.width * scale;
      tmpCanvas.height = canvas.height * scale;

      const ctx = tmpCanvas.getContext('2d');
      ctx.scale(scale, scale);
      ctx.drawImage(canvas, 0, 0);

      return tmpCanvas.toDataURL('image/png');
    });

    if (!imageData) break;

    const base64Data = imageData.replace(/^data:image\/png;base64,/, '');
    fs.writeFileSync(`canvas_page_${index}.png`, base64Data, 'base64');
    console.log(`✅ canvas_page_${index}.png 저장 완료`);

    // 다음 페이지로 이동 시도
    const nextButton = await page.$('button[aria-label="Next"]');
    if (nextButton) {
      await nextButton.click();
      index++;
      // await page.waitForTimeout(1000); // 페이지 렌더링 대기	
			await delay(1000);
    } else {
      hasNext = false;
    }
  }

  await browser.close();
})();
