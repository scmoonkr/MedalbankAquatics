const puppeteer = require('puppeteer');
const cheerio     = require('cheerio');
const fs = require('fs');

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

(async () => {
  const url = 'https://kabc.dongguk.edu/viewer/view?dataId=ABC_IT_K0994_T_001';
  // const browser = await puppeteer.launch({ headless: true });
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();

  await page.setViewport({ width: 1920, height: 1080, deviceScaleFactor: 3 });
  await page.goto(url, { waitUntil: 'networkidle2', timeout: 0 });

  let index = 1;
  let hasNext = true;


	const html = await page.content(); 
	const $ = cheerio.load(html);
	const noOfImage = $("#navi_img_count").text();
	console.log("noOfImage=", noOfImage);

  for (let no=0; no<noOfImage; no++) {
    await page.waitForSelector('canvas');
    await delay(300); // 렌더링 대기

    const imageData = await page.evaluate(() => {
      const canvas = document.querySelector('canvas');
      if (!canvas) return null;

      const scale = 4;
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
    fs.writeFileSync(`canvas_page_${no}.png`, base64Data, 'base64');
    console.log(`✅ canvas_page_${no}.png 저장 완료`);

    // 다음 버튼 클릭
		// a.btn__tree--toggle--more
    // const nextButton = await page.$('button[aria-label="Next"], .btn-next, .navigation-next');
    const nextButton = await page.$('nav.viewer__wrap__img__nav a.next_move');
		await nextButton.click();
		// const nextButton = await page.$('nav.viewer__wrap__img__nav div a.next_move');
		

		await delay(700); // 페이지 전환 대기
		console.log("click.next");

    // if (nextButton) {
    //   await nextButton.click();
    //   index++;
    //   await delay(1200); // 페이지 전환 대기
    // } else {
    //   hasNext = false;
    // }
  } // end for

  await browser.close();
})();
