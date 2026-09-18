const puppeteer   = require('puppeteer');
const cheerio     = require('cheerio');
const {getStylesKorEng}      = require('../../MSKR/Config/mskCFG.js');
const UtilDate    = require('../../MSKR/Class/DateLibrary.js');
const utilLibrary = require('../../MSKR/Class/utilLibrary');
const { load } = require('../../MSKR/Class/JWThashLibrary.js');
//============================================

/*

dl.result_table dd.swimmer_record
*/
//=============================================
//=============================================
//=============================================
exports.crawlingNames = async (page, name) => {
	// const nameHide = utilLibrary.nameHideAll(name);

	const inputSelector = "input#search_input";
	await page.type(inputSelector, name);

	await page.waitForSelector("#search_btn");

	// Enter 키 누르기
	await page.keyboard.press('Enter');

	// 페이지가 완전히 로드될 때까지 기다림
	await page.waitForNavigation();

	//====================================================================
	//	more button
	//====================================================================
	let more = 0;
	for (let no=0; no<50; no++) {		
		try {
			const html = await page.content(); 
			const $ = cheerio.load(html);
			
			const tableSelector = $("dl.result_table dd.swimmer_record");
			if (tableSelector.length == 0) return [];
			
			const loadMore = $("button#loadMoreBtn");
			if (!loadMore || loadMore.length == 0) break;
			console.log("more...", more++);
			await page.evaluate(() => {
				const button = document.querySelector("button#loadMoreBtn");
				if (button) {
					button.click();
				}
			});
		} catch (e) {
			// console.log("catch.");
		}
		// console.log("clicked loadMore...");
		await new Promise(resolve => setTimeout(resolve, 500));
	} // end for
	//====================================================================
		
	await new Promise(resolve => setTimeout(resolve, 500));
	await page.waitForSelector("dl.result_table");

	const html = await page.content(); 
	const $ = cheerio.load(html);

	const tableSelector = $("dl.result_table dd.swimmer_record");
	// console.log("tableSelector=",tableSelector.length);

	const times = [];

	try {
		tableSelector.each((index, elem) => {
			const time = {};
			const $el = $(elem);
			
			// dataID
			time.dataID = Number($el.attr("data-id").trim());
			// time.dataIndex = $el.attr("data-index").trim().split("/");

			// name
			time.name = name;
			// time.nameHide = nameHide;

			time.nameORG = $el.find('.swimmerName').text().trim();
			if (time.nameORG.includes('등록') && time.nameORG.length > 4) {
				time.nameORG = time.nameORG.replace('(등록)', '').trim();
				time.isMasters = false;
			} else {
				time.isMasters = true;
			}
			if (!time.isMasters) console.log("등록----->", name, time.isMasters, time.nameORG);
			// 'O'가 없으면 nickname
			if (!time.nameORG.includes('O')) {
				time.nickname = time.nameORG;
			} else {
				// '이준' -> '이준%'로 검색됨
				if (name.length != time.nameORG.length) return;
			}
			// console.log("=====>", time.nameORG, !time.nameORG.includes('O'), name.length == time.nameORG.length, time.name);

			// team
			const teamPtr = $el.find('.clubName img.club_logo');
			if (teamPtr && teamPtr.length > 0) {
				time.team = teamPtr.attr("title")
			} else {
				time.team = $el.find('.clubName').text().trim();
			}

			// ages
			const ages = [];
			$el.find('.ageGroup span').each((i, ag) => {
				ages.push($(ag).text().trim())
			})
			if (ages.length > 0) time.ageGroup = ages[0];
			if (ages.length > 1) time.age = ages[1];

			// ageGroup
			const ageGroup = time.ageGroup.split(' ').map(el => el);
			time.ageGroup = ageGroup.slice(1).join(' ');
			switch (ageGroup[0]) {
				case "남성":
				case "남초":
				case "남자": time.gender = 'men'; break;
				case "여성":
				case "여초":
				case "여자": time.gender = 'women'; break;
				case "혼성": time.gender = 'mixed'; break;
				default: time.ageGroup = ageGroup.join(' '); break;
			}
			
			// swimStyle: '평영 100M',
			const style = $el.find('.swimStyle').text();
			const styles = style.replace(/   /g, " ").replace(/  /g, " ").split(' ').map(el => el.trim());
			time.style = getStylesKorEng(styles[0]);
			time.distance = styles[1];
			time.styleORG = style;
			// console.log("----->", style, styles);

			
			const recordImages = [];
			$el.find('.record img').each((_, img) => {
				let src = $(img).attr('src');
				src = src.replace("../img/record/BB", "").replace(".png", "").replace("cln", ":").replace("pnt", ".");
				recordImages.push(src);
			});
			time.time = recordImages.join('');
			time.timeStamp = new UtilDate().convertString2Timestamp(time.time);

			time.newRecord = $el.find('.record .new_record').text().trim();
			if (!time.newRecord) delete time.newRecord;

			// <span class="ranking">4위</span>
			const medalImg = $el.find('.ranking img.medal').attr('src') || '';
			time.rank =
				medalImg.includes('gold') ? "1" :
				medalImg.includes('silver') ? "2" :
				medalImg.includes('bronze') ? "3" :
				'';
				if (!time.rank) {
					time.rank = $el.find('.ranking').text().replace('위', '').trim();
				}

	// .comp_detail ul li.narrow span.slide  dl.comp2dong
			time.competitionName = $el.find('.comp_name .text').text().trim();
			time.cid = Number($el.find('.comp_detail ul li.narrow span.slide  dl.comp2dong').attr('data-id'));
			time.sido = $el.find('.comp_detail dd').eq(3).text().trim();
			time.pool = $el.find('.comp_detail dd').eq(4).text().trim();
			// time.cid = $el.find('.comp2dong').attr("data-id");
			const datetime = $el.find('.comp_detail dd').eq(2).text().trim().split('~');
			time.datetime = datetime[0];
			if (datetime.length > 1) time.dateEnd = datetime[1];
			times.push(time);
		});

	} catch (e) {
		console.log("catch.", e);
	} // try

	// timeArr = timeArr.concat(times);

	return times;
}

