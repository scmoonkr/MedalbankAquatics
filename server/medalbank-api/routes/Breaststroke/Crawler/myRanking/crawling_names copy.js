const puppeteer   = require('puppeteer');
const cheerio     = require('cheerio');
const UtilDate    = require('../../Class/DateLibrary.js');
const utilLibrary = require('../../Class/utilLibrary');
const { load } = require('../../Class/JWThashLibrary.js');
const {parseDiscipline, roundsEngKor}    = require('../../Class/customDispline.js');
const CrawlingTimeLibrary	= require("./crawling_time_library.js");
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
			await new Promise(resolve => setTimeout(resolve, 500));
			const html = await page.content(); 
			const $ = cheerio.load(html);
			
			const tableSelector = $("dl.result_table dd.swimmer_record");
			if (tableSelector.length == 0) {
				// console.log("skip...");
				// await new Promise(resolve => setTimeout(resolve, 100));
				continue; // return [];
			}
			
			const loadMore = $("button#loadMoreBtn");
			if (!loadMore || loadMore.length == 0) break;
			// console.log("more...", more);
			more++
			await page.evaluate(() => {
				const button = document.querySelector("button#loadMoreBtn");
				if (button) {
					button.click();
				}
			});
		} catch (e) {
			console.log("catch.", e);
			process.exit()
		}
		// console.log("clicked loadMore...");
	} // end for
	// console.log("click more...");
	//====================================================================
		
	await new Promise(resolve => setTimeout(resolve, 1000));
	// await page.waitForSelector("dl.result_table");

	const html = await page.content(); 
	const $ = cheerio.load(html);

	if (more > 0) {
		await new Promise(resolve => setTimeout(resolve, 1000));
		await page.waitForSelector("dd.swimmer_record");
	// console.log("click more...wait");
	}
	const tableSelector = $("dl.result_table dd.swimmer_record");
	// console.log("--------------> tableSelector=",tableSelector.length);

	const times = [];

	try {
		tableSelector.each((index, elem) => {
			let time = {};
			const $el = $(elem);
			
			// dataID
			time.dataID = Number($el.attr("data-id").trim());
			// time.dataIndex = $el.attr("data-index").trim().split("/");

			// name
			time.name = name;
			// time.nameHide = nameHide;

			time.nameORG = $el.find('.swimmerName').text().replace(/"|\n/gi, '').trim();
			if (time.nameORG.includes('등록') && time.nameORG.length > 4) {
				time.nameORG = time.nameORG.replace('(등록)', '').trim();
				time.isMasters = false;
			} else {
				time.isMasters = true;
			}
			// if (!time.isMasters) console.log("등록----->", name, time.isMasters, time.nameORG);
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
				time.team = teamPtr.attr("title").replace(/"|\n/gi, '')
			} else {
				time.team = $el.find('.clubName').text().replace(/"|\n/gi, '').trim();
			}

			// ages
			const ages = [];
			$el.find('.ageGroup span').each((i, ag) => {
				ages.push($(ag).text().trim())
			})
			if (ages.length > 0) time.group = ages[0].replace(/"|\n/gi, '');
			if (ages.length > 1) time.age = ages[1].replace(/"|\n/gi, '');

			// group
			const group = time.group.split(' ').map(el => el);
			time.group = group.slice(1).join(' ');
			switch (group[0]) {
				case "남성":
				case "남초":
				case "남자": time.gender = 'men'; break;
				case "여성":
				case "여초":
				case "여자": time.gender = 'women'; break;
				case "혼성": time.gender = 'mixed'; break;
				default: time.group = group.join(' '); break;
			}
			time.isJunior = CrawlingTimeLibrary.checkJunior(time.group);
			
			// swimStyle: '평영 100M',
			const discipline = $el.find('.swimStyle').text() ?? '';
			const disciplineObj = parseDiscipline(discipline);
			// console.log("disciplineObj=>", discipline, disciplineObj);
			time = { ...time, ...disciplineObj}
			// const disciplines = discipline.split(' ').map(el => el.trim());
			// const style = getStyles(disciplines[0]);
			// time.discipline = style.code
			// time.style = style.eng
			// time.distance = disciplines[1];
			// for (const distance of roundsEngKor) {
			// 	if (time.distance.includes(distance.kor)) {
			// 		time.distance = time.distance.replace(distance.kor, '').trim();
			// 		time.round = distance.eng;
			// 		break;
			// 	}
			// }

			// if (style.fin) time.fin = style.fin;
			// time.disciplineORG = discipline;
			// console.log("----->", discipline, disciplines);

			
			const recordImages = [];
			$el.find('.record img').each((_, img) => {
				let src = $(img).attr('src');
				src = src.replace("../img/record/BB", "").replace(".png", "").replace("cln", ":").replace("pnt", ".");
				recordImages.push(src);
			});
			time.time = recordImages.join('');
			time.timeStamp = new UtilDate().convertString2Timestamp(time.time);

			time.newRecord = $el.find('.record .new_record').text().replace(/"|\n/gi, '').trim();
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
			time.competitionName = $el.find('.comp_name .text').text().replace(/"|\n/gi, '').trim();
			time.cid = Number($el.find('.comp_detail ul li.narrow span.slide  dl.comp2dong').attr('data-id'));
			time.sido = $el.find('.comp_detail dd').eq(3).text().replace(/"|\n/gi, '').trim();
			time.pool = $el.find('.comp_detail dd').eq(4).text().replace(/"|\n/gi, '').trim();
			time.course = $el.find('.comp_detail dd').eq(5).text().replace(/"|\n/gi, '').trim();
			time.course = time.course == "50M" ? "LCM" : "SCM"
			time.measured = $el.find('.comp_detail dd').eq(6).text().replace(/"|\n/gi, '').trim();
			// const wide = $el.find('.comp_detail ul li.narrow span.slide  dl.comp2dong')
			// time.cid = Number(wide.attr('data-id'));
			// const wideDD = wide.find("dd")
			// time.sido = wideDD.eq(0).text().replace(/"|\n/gi, '').trim();
			// time.sido = wideDD.eq(1).text().replace(/"|\n/gi, '').trim();
			// time.sido = wideDD.eq(2).text().replace(/"|\n/gi, '').trim();
			// time.sido = wideDD.eq(3).text().replace(/"|\n/gi, '').trim();
			// time.sido = wideDD.eq(4).text().replace(/"|\n/gi, '').trim();

			// time.cid = $el.find('.comp2dong').attr("data-id");
			const datetime = $el.find('.comp_detail dd').eq(2).text().replace(/"|\n/gi, '').trim().split('~');
			time.datetime = datetime[0];
			if (datetime.length > 1) time.dateEnd = datetime[1];


			//-----------------------------------------------
			//-----------------------------------------------
			time.hide = true;
			if (disciplineObj.fin || disciplineObj.kick) {
				time.error = ("["+discipline + "] ====>" + (disciplineObj.fin ? "fin" : '') + (disciplineObj.kick ? ", kick" : ''));
				delete time.discipline;
				delete time.style;
			} else if (!disciplineObj.style) {
				time.error = ("["+discipline + "] .....> style이 없음");
				delete time.discipline;
				delete time.style;
			} else if (! "25M,50M,100M,200M,400M,800M,1500M,1,500M".includes(disciplineObj.distance)) {
				time.error = ("["+discipline + "] .....> distance error: "+ disciplineObj.distance);
				time.check = true;
			} else if (disciplineObj.etc && isNaN(disciplineObj.etc)) {
				time.error = ("["+discipline + "] .....> etc:" + disciplineObj.etc ?? '');
				time.check = true;
			} else {
				time.hide = false;
				// result.ok.push("["+discipline + "] ---> "+ disciplineObj.discipline + ", "+ disciplineObj.distance + (disciplineObj.round ? ", "+ disciplineObj.round : ''));
				// time.error = "";
			}
			//-----------------------------------------------
			//-----------------------------------------------
			if (time.etc && time.etc == time.rank) {
				delete time.etc;
			}
			if (time.rank) {
				if (isNaN(time.rank)) {
					// check rank -> round
					const round = roundsEngKor.find(el => el.kor == time.rank);
					if (round) {
						time.round = round.eng;
					} else {
						time.status = time.rank;
					}
					delete time.rank;
				} else {
					time.rank = Number(time.rank);
				}
			}



			times.push(time);
		});

	} catch (e) {
		// console.log("catch.", e);
	} // try

	// timeArr = timeArr.concat(times);

	return times;
}

