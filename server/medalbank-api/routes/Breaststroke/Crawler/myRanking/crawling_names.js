const puppeteer   = require('puppeteer');
const cheerio     = require('cheerio');
const UtilDate    = require('../../Class/DateLibrary.js');
const utilLibrary = require('../../Class/utilLibrary');
const { load } = require('../../Class/JWThashLibrary.js');
const {parseDiscipline, roundsEngKor}    = require('../../Class/customDispline.js');
const CrawlingTimeLibrary   = require("./crawling_time_library.js");
//============================================

/*

dl.result_table dd.swimmer_record
*/
//=============================================
//=============================================
//=============================================
exports.crawlingNames = async (page, name) => {
    const inputSelector = "input#search_input";
    await page.type(inputSelector, name);
    await page.waitForSelector("#search_btn");
    await page.keyboard.press('Enter');

    // 페이지가 완전히 로드될 때까지 기다림
    await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 15000 }).catch(() => {});

    //====================================================================
    //  more button
    //====================================================================
    let more = 0;
    for (let no = 0; no < 50; no++) {
        try {
            await new Promise(resolve => setTimeout(resolve, 500));

            // ✅ page.$() 사용으로 context 파괴 위험 감소
            const tableExists = await page.$("dl.result_table dd.swimmer_record").catch(() => null);
            if (!tableExists) continue;

            const loadMoreBtn = await page.$("button#loadMoreBtn").catch(() => null);
            if (!loadMoreBtn) break;

            more++;

            // ✅ 클릭 + 안정화 대기
            await page.evaluate(() => {
                const button = document.querySelector("button#loadMoreBtn");
                if (button) button.click();
            });

            // Ajax 로드 or navigation 둘 다 대응
            await Promise.race([
                page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 3000 }).catch(() => {}),
                new Promise(resolve => setTimeout(resolve, 1500))
            ]);

        } catch (e) {
            if (e.message && e.message.includes('Execution context was destroyed')) {
                console.log("context destroyed, waiting for page to stabilize...");
                await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 10000 }).catch(() => {});
                await new Promise(resolve => setTimeout(resolve, 1000));
                continue;
            }
            console.log("catch.", e);
            process.exit();
        }
    } // end for

    //====================================================================

    await new Promise(resolve => setTimeout(resolve, 1000));

    // ✅ content() 호출 전 페이지 완전 안정화
    await page.waitForFunction(() => document.readyState === 'complete', { timeout: 10000 }).catch(() => {});

    if (more > 0) {
        await page.waitForSelector("dd.swimmer_record", { timeout: 10000 }).catch(() => {});
    }

    const html = await page.content();
    const $ = cheerio.load(html);

    const tableSelector = $("dl.result_table dd.swimmer_record");

    const times = [];

    try {
        tableSelector.each((index, elem) => {
            let time = {};
            const $el = $(elem);

            // dataID
            time.dataID = Number($el.attr("data-id").trim());

            // name
            time.name = name;

            time.nameORG = $el.find('.swimmerName').text().replace(/"|\n/gi, '').trim();
            if (time.nameORG.includes('등록') && time.nameORG.length > 4) {
                time.nameORG = time.nameORG.replace('(등록)', '').trim();
                time.isMasters = false;
            } else {
                time.isMasters = true;
            }

            // 'O'가 없으면 nickname
            if (!time.nameORG.includes('O')) {
                time.nickname = time.nameORG;
            } else {
                // '이준' -> '이준%'로 검색됨
                if (name.length != time.nameORG.length) return;
            }

            // team
            const teamPtr = $el.find('.clubName img.club_logo');
            if (teamPtr && teamPtr.length > 0) {
                time.team = teamPtr.attr("title").replace(/"|\n/gi, '');
            } else {
                time.team = $el.find('.clubName').text().replace(/"|\n/gi, '').trim();
            }

            // ages
            const ages = [];
            $el.find('.ageGroup span').each((i, ag) => {
                ages.push($(ag).text().trim());
            });
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

            // swimStyle
            const discipline = $el.find('.swimStyle').text() ?? '';
            const disciplineObj = parseDiscipline(discipline);
            time = { ...time, ...disciplineObj };

            // record images → time string
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

            // ranking
            const medalImg = $el.find('.ranking img.medal').attr('src') || '';
            time.rank =
                medalImg.includes('gold')   ? "1" :
                medalImg.includes('silver') ? "2" :
                medalImg.includes('bronze') ? "3" :
                '';
            if (!time.rank) {
                time.rank = $el.find('.ranking').text().replace('위', '').trim();
            }

            // competition info
            time.competitionName = $el.find('.comp_name .text').text().replace(/"|\n/gi, '').trim();
            time.cid = Number($el.find('.comp_detail ul li.narrow span.slide dl.comp2dong').attr('data-id'));
            time.sido     = $el.find('.comp_detail dd').eq(3).text().replace(/"|\n/gi, '').trim();
            time.pool     = $el.find('.comp_detail dd').eq(4).text().replace(/"|\n/gi, '').trim();
            time.course   = $el.find('.comp_detail dd').eq(5).text().replace(/"|\n/gi, '').trim();
            time.course   = time.course == "50M" ? "LCM" : "SCM";
            time.measured = $el.find('.comp_detail dd').eq(6).text().replace(/"|\n/gi, '').trim();

            const datetime = $el.find('.comp_detail dd').eq(2).text().replace(/"|\n/gi, '').trim().split('~');
            time.datetime = datetime[0];
            if (datetime.length > 1) time.dateEnd = datetime[1];

            //-----------------------------------------------
            // hide / error 처리
            //-----------------------------------------------
            time.hide = true;
            if (disciplineObj.fin || disciplineObj.kick) {
                time.error = ("[" + discipline + "] ====>" + (disciplineObj.fin ? "fin" : '') + (disciplineObj.kick ? ", kick" : ''));
                delete time.discipline;
                delete time.style;
            } else if (!disciplineObj.style) {
                time.error = ("[" + discipline + "] .....> style이 없음");
                delete time.discipline;
                delete time.style;
            } else if (!"25M,50M,100M,200M,400M,800M,1500M,1,500M".includes(disciplineObj.distance)) {
                time.error = ("[" + discipline + "] .....> distance error: " + disciplineObj.distance);
                time.check = true;
            } else if (disciplineObj.etc && isNaN(disciplineObj.etc)) {
                time.error = ("[" + discipline + "] .....> etc:" + disciplineObj.etc ?? '');
                time.check = true;
            } else {
                time.hide = false;
            }

            //-----------------------------------------------
            // rank / round / status 처리
            //-----------------------------------------------
            if (time.etc && time.etc == time.rank) {
                delete time.etc;
            }
            if (time.rank) {
                if (isNaN(time.rank)) {
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
        console.log("parse catch.", e);
    }

    return times;
};

