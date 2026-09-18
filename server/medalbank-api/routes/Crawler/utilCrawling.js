const { resolve } 	= require('promise');
const puppeteer 		= require('puppeteer');
const CrawlingClass = require("../MSKR/Class/crawling");

const UtilDate    = require("../MSKR/Util/utilDate");
const utilDate	  = new UtilDate();

//=================================================
// scroll bottom
//=================================================
exports.infinityScroll = async (page, configScroll) => {
	if (!configScroll || !configScroll.scroll) return;

	// console.log("scroll start...", new Date());
  await page.evaluate(async (configScroll) => {
      await new Promise((resolve, reject) => {
				let totalHeight = 0;
        const timer = setInterval(() => {
					const scrollHeight = document.body.scrollHeight;
					//-----
					window.scrollBy(0, configScroll.height);
					//-----
					totalHeight += configScroll.height;
					if(totalHeight >= scrollHeight - window.innerHeight){
							clearInterval(timer);
							resolve();
					}
        }, configScroll.delay);
      });
  }, configScroll);
	// console.log("scroll end...", new Date());
}

//=================================================
exports.openPuppeteer = async (headless=true) => {
	// console.log("open openPuppeteer...", headless);
  const browser = await puppeteer.launch({
		headless: headless,
		// defaultViewport : { 'width' : 1200, 'height' : 800 },
		args: [
			'chromium-browser',
			'--disable-features=IsolateOrigins',
			'--disable-site-isolation-trials',
			'--disable-web-security',
			'--disable-features=site-per-process'
		]

	});
	return browser;
}

//=================================================
exports.closePuppeteer = async (browser) => {
	browser.close();
}

/*
{
	id: "scmoonkr@naver.com",
	pwd: "~Msc192837",
	selector: {
		path: "",
		click: "#mi_cuenta_hover > .micuenta > a",
		id: "#email_login",
		pwd: "#contrasena_superior",
		login: "#boton_login_header",
	}
}
*/
//============================================
exports.login = async (browser, login) => {
	const page = await browser.newPage();
	if (login.url) {
		await page.goto(login.url);	
	} 
	await page.waitForSelector(login.selector.click);

	if (login.selector.click) {
		await page.click(login.selector.click);
	}
  // await useProxy(_page, url);
	await page.waitForSelector(login.selector.id);

  await page.evaluate((login) => {
    document.querySelector(login.selector.id).value = login.id;
    document.querySelector(login.selector.pwd).value = login.pwd;
  }, login);

  await page.click(login.selector.login);
	await page.close();
  console.log("....................login ok");
}

/**********************************************
 * 
 * parsing Page
 * 
 ***********************************************/


 exports.crawlingPage = async (browser, configCrawling, fetchCrawling, customParsing, update) => {
  let product = [];
	let crawledTotal = 0;
	//-----------------------------------------------
	if (configCrawling.login) {
		await this.login(browser, configCrawling.login);
	}

	const crawlingDate = new Date(); // utilDate.dateString(new Date());
	let total = 10000;
	while (total) {
	// for (let no=0; no<categoryArr.length; no += configCrawling.noOfPage) {
		// const categories = categoryArr.slice(no, no + configCrawling.noOfPage);
		const categories = await fetchCrawling();
		if (categories.length == 0) break;
		total -= categories.length;
		console.time("Promise");

		let crawledCount = 1;

		console.log(`\n\ncrawling... ${categories.length} / ${configCrawling.noOfPage}`);
		//--------------------------------------------------
		await Promise.all(categories.map(async (category, cnt) => {

			const page = await browser.newPage();
			// await page.setViewport({ width: 1366, height: 768});
			await page.setViewport({ width: 1000, height: 800 });
			try {
				//-----------------------------------------------
				// page.setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/73.0.3683.103 Safari/537.36");
				// chrome.inspector console "navigator.userAgent"
				const userAgent = configCrawling.userAgent || "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36";
				page.setUserAgent(userAgent);
				//-----------------------------------------------
				//-----------------------------------------------
				//	image, css, fonts not loading
				//-----------------------------------------------
				if (!configCrawling.imageLoading) {
					await page.setRequestInterception(true);
					page.on('request', (req) => {
						if(req.resourceType() == 'stylesheet' || req.resourceType() == 'font' || req.resourceType() == 'image'){
							req.abort();
						}
						else {
							req.continue();
						}
					});
				}

				//-----------------------------------------------
				const url = `${configCrawling.homeURL}${category.path}`;
				// await page.goto(url, {waitUntil: 'load', timeout: configCrawling.timeout || 30000})
				await page.goto(url, {timeout: configCrawling.timeout || 50000})
				// await page.goto(url)
				//-----------------------------------------------
				await this.infinityScroll(page, configCrawling.infinityScroll);

				//-----------------------------------------------
				if (configCrawling.waitSelector) {
					try {
						await page.waitForSelector(configCrawling.waitSelector, { timeout: 3000 });
					} catch (e) {
						console.log(cnt, ".....> waitForSelector.waitSelector... timeout\n");
					}
				}

				//-----------------------------------------------
				if (configCrawling.waitTimeout) {
					// await page.waitTimeout(configCrawling.waitTimeout);
					await utilDate.sleep(configCrawling.waitTimeout);
				}

				//------------------------------------------------------
				//  parsing
				//------------------------------------------------------
				const html = await page.content(); 
				page.close();

				//------------------------------------------------------
				try {
					const Crawling = new CrawlingClass(html, configCrawling.baseSelector);
					product = await Crawling.parsingPage(configCrawling.parsing);	
				} catch (e) {
					console.log(cnt, "-----> Crawling.parsingPage... catch", e);
				}
				//------------------------------------------------------

				const cust = customParsing(html);

				product.site 			= configCrawling.site;
				product.category1 = product.category1 ? product.category1 : category.category1;
				product.category2 = product.category2 ? product.category2 : category.category2;
				product.category3 = product.category3 ? product.category3 : category.category3;
				product.link 			= category.path;
				product.id 				= category.id;
				product.retry 		= category.retry || 0;

				//-----------------------------
				await update(product);
				//-----------------------------

				crawledCount++;
			} catch (e) {
				console.log("-------------------------------------->");
				console.log("------> catch.detail.", e);
				console.log("-------------------------------------->");
				page.close();
			}
		}));
		//--------------------------------------------------
		crawledTotal += crawledCount;
		console.log(`\n${categories.length} : ${crawledCount} / ${crawledTotal}`)
		console.timeEnd("Promise");
	}

	return product;
}

/**********************************************
 * 
 * parsing Page
 * 
 ***********************************************/
exports.crawlingPageNew = async (browser, categoryArr, configCrawling, update) => {
  let product;
	let crawledTotal = 0;
	//-----------------------------------------------
	if (configCrawling.login) {
		await this.login(browser, configCrawling.login);
	}

	const crawlingDate = new Date(); // utilDate.dateString(new Date());
	for (let no=0; no<categoryArr.length; no += configCrawling.noOfPage) {
		
		console.time("Promise");

		const categories = categoryArr.slice(no, no + configCrawling.noOfPage);
		let crawledCount = 1;

		console.log("no=", no, "/", categoryArr.length, categories.length, configCrawling.noOfPage);
		//--------------------------------------------------
		await Promise.all(categories.map(async (category, cnt) => {
			const page = await browser.newPage();
			// await page.setViewport({ width: 1366, height: 768});
			await page.setViewport({ width: 1000, height: 800 });
			try {
				//-----------------------------------------------
				// page.setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/73.0.3683.103 Safari/537.36");
				// chrome.inspector console "navigator.userAgent"
				const userAgent = configCrawling.userAgent || "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36";
				page.setUserAgent(userAgent);
				//-----------------------------------------------
				//-----------------------------------------------
				//	image, css, fonts not loading
				//-----------------------------------------------
				if (!configCrawling.imageLoading) {
					await page.setRequestInterception(true);
					page.on('request', (req) => {
						if(req.resourceType() == 'stylesheet' || req.resourceType() == 'font' || req.resourceType() == 'image'){
							req.abort();
						}
						else {
							req.continue();
						}
					});
				}

				//-----------------------------------------------
				const url = `${configCrawling.homeURL}${category.path || category}`;
				// await page.goto(url, {waitUntil: 'load', timeout: configCrawling.timeout || 30000})
				await page.goto(url, {timeout: configCrawling.timeout || 50000})
				// await page.goto(url)
				//-----------------------------------------------
				await this.infinityScroll(page, configCrawling.infinityScroll);

				//-----------------------------------------------
				if (configCrawling.waitSelector) {
					try {
						await page.waitForSelector(configCrawling.waitSelector, { timeout: 3000 });
					} catch (e) {
						console.log(cnt, ".....> waitForSelector.waitSelector... timeout");
					}
				}

				//-----------------------------------------------
				if (configCrawling.waitTimeout) {
					// await page.waitTimeout(configCrawling.waitTimeout);
					await utilDate.sleep(configCrawling.waitTimeout);
				}

				//------------------------------------------------------
				//  parsing
				//------------------------------------------------------
				const html = await page.content(); 
				page.close();

				//------------------------------------------------------
				try {
					const Crawling = new CrawlingClass(html, configCrawling.baseSelector);
					product = await Crawling.parsingPage(configCrawling.parsing);	
				} catch (e) {
					console.log(cnt, "-----> Crawling.parsingPage... catch", e);
				}
				//------------------------------------------------------

				product.site = configCrawling.site;
				product.category1 = product.category1 ? product.category1 : category.category1;
				product.category2 = product.category2 ? product.category2 : category.category2;
				product.category3 = product.category3 ? product.category3 : category.category3;
				product.link = category.path;

				//-----------------------------
				await update(product);
				//-----------------------------

				crawledCount++;
			} catch (e) {
				console.log("-------------------------------------->");
				console.log("------> catch.detail.", e);
				console.log("-------------------------------------->");
				page.close();
			}
		}));
		//--------------------------------------------------
		crawledTotal += crawledCount;
		console.log(`\n\n#${no} / ${categoryArr.length} : ${crawledCount} / ${crawledTotal}`)
		console.timeEnd("Promise");
	}

	return product;
}
