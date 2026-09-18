// utils/anaysisLibrary.js
import moment from 'moment';
import { disciplineEngKor, getDisciplineByEng, getEventName } from '~/utils/swimStyles'

const _disciplines = ["BR", "FR", "BK", "FL", "IM", "BROW", "BRZS", "BROS", "BRMS", "BRUW"];
const _distances = ["25M", "50M", "100M", "200M", "400M", "800M", "1500M", "M"];
const _courses = ["LCM", "SCM"];
const _genders = ["men", "women"];

export class UtilAnaysis {
  constructor(timeArr = [], today = new Date()) {
    this._times = this.sortDatetime(timeArr);
    this._disciplineTimes = {}; // this.getDisciplineTimes();
    this._statistics = {};
    this._today = new Date(today).toISOString().slice(0, 10);
  }
   //-----------------------------
   // getter
   //-----------------------------
   get times()            { return this._times; }
   get today()            { return this._today; }
   get disciplineTimes()	{ return this._statistics.times; }
   get disciplines()      { return _disciplines; }
   get statistics()       { return _statistics; }
   get distances()        { return _distances; }
   get courses()          { return _courses; }
   get first()            { return { time: this._times[0].time, datetime: this._times[0].datetime }; }   
   get latest()           { return { time: this._times[this._times.length-1].time, datetime: this._times[this._times.length-1].datetime }; }

   //-----------------------------
   set times(timeArr) {
      this._times = this.sortDatetime(timeArr).reduce((arr, data) => {
																								data.disciplineKor = getDisciplineByEng(data.discipline);
																								arr.push(data);
																								return arr;
																							}, []);

      this._statistics = {
         count: this._times.length,
         first: this.first,
         latest: this.latest,
      };
      this._statistics.times = this.getDisciplineTimes();

      this._statistics.bestAverage = this.setBestAverage(this._times);
      this._statistics.seasons = this.getSeasonBestAverage(this._today);
      this._statistics.entirePeriod = this.getEntirePeriodAverage(this._statistics.seasons);

      this._statistics.months = this.getTimesBestByMonth();
      this._statistics.quaters = {};
      this._statistics.quaters.quater3 = this.getQuaterBestAverage(this._today, 3);
      this._statistics.quaters.quater6 = this.getQuaterBestAverage(this._today, 6);
      this._statistics.quaters.quater9 = this.getQuaterBestAverage(this._today, 9);
      this._statistics.quaters.quater12 = this.getQuaterBestAverage(this._today, 12);
   }
   set today(dt) { this._today = dt; }

   sortDatetime(timeArr) {
      if (timeArr.length == 0) return timeArr;
      const existDatetime = timeArr.filter(el => el.datetime)      
      const notExistDatetime = timeArr.filter(el => !el.datetime)
      existDatetime.sort((a, b) => {
                                          if (!a.datetime && !b.datetime) return 0;
                                          if (!a.datetime) return 1;
                                          if (!b.datetime) return -1;
                                          return new Date(a.datetime) - new Date(b.datetime);
                                       })
      return existDatetime; // [...existDatetime, ...notExistDatetime];
   }
   // discipline, distance, cource로 그룹핑
   getDisciplineTimes() {  
		const times = this._times;
      const disciplineOBJ = {}; 
      for (const discipline of _disciplines) {
         for (const distance of _distances) {   
            for (const course of _courses) {  
              //  let timesOfDate = times.filter(el => el.discipline==discipline && 
							// 																			el.course==course && 
							// 																			el.distance==distance)
							// 												.sort((a,b) => a.timeStamp-b.timeStamp);
							let timesOfDate = times.filter(el => el.discipline==discipline && 
                                                         el.course==course && 
                                                         el.distance==distance)
                                             .map(item => ({...item}))  // ✅ 얕은 복사
                                             .sort((a,b) => a.timeStamp - b.timeStamp);
               if(timesOfDate.length == 0) continue;
               // sort by timeStamp
               disciplineOBJ[`${discipline}_${course}_${distance}`] = timesOfDate;
            }
         }
      }
      return disciplineOBJ;
   }

   setBestAverage(timesOfDate) {
      if (timesOfDate.length == 0) return { count: 0, besttime: '', datetime: '', average: '', };
      const selectedTimes = timesOfDate[0].discipline=='BRUW'
                              ? timesOfDate.sort((a,b) => b.meters - a.meters)
                              : timesOfDate.filter(el => el.timeStamp > 0).sort((a,b) => a.timeStamp - b.timeStamp);
      return {
				count      : selectedTimes.length,
				besttime: selectedTimes[0].time,
				datetime: selectedTimes[0].datetime,
				average   : this.getAverageTime(selectedTimes),
      };
   }

   // month: 3, 6, 9, 12개월
   getQuaterBestAverage(today, month) {
      const endDate = today ? new Date(today) : this._today;
      const startDate = today ? new Date(today) : this._today;
      startDate.setMonth(endDate.getMonth() - month);
      
      const quaters = {};
      return quaters;
   }

   setStrokesMeters(dest, time) {
      const destOBJ = { ...dest };
      if (time.strokes != undefined) destOBJ.time = `${time.time}<br />${time.strokes} STROKE(S)`;
      else if (time.meters != undefined) destOBJ.time = `${time.meters} METERS`;
      else destOBJ.time = time.time ?? '';
      return destOBJ;
   }

   getEntirePeriodAverage(season) {
      // first, latedt, best, seasonBest
      const entirePeriod = {};
      for (const key of Object.keys(this.disciplineTimes)) { 
				const thisTimes = this.disciplineTimes[key].filter(el => el.discipline=='BRUW' || el.timeStamp > 0)
																									.map(el => ({...el}));
				const period = { first: {}, latest: {} };
					
				const bestTimes = thisTimes.sort((a,b) => a.timeStamp - b.timeStamp);
				period.best = bestTimes.length > 0 ? bestTimes[0] ?? {} : { time: '', datetime: '' };
				period.best = this.setStrokesMeters(period.best, period.best);
				
				const dateTimes = this.sortDatetime(thisTimes);
				if (dateTimes.length > 0) {
					period.first = { time: dateTimes[0].time, datetime: dateTimes[0].datetime };
					period.first = this.setStrokesMeters(period.first, dateTimes[0]);
					period.latest = { time: dateTimes[dateTimes.length-1].time, datetime: dateTimes[dateTimes.length-1].datetime };
					period.latest = this.setStrokesMeters(period.latest, dateTimes[dateTimes.length-1]);
				}
				period.season = season[key] ?? { time: '', datetime: '' };
				entirePeriod[key] = period
      }
      return entirePeriod;
   }
   
   getSeasonBestAverage(date) {
      const today = (date ? new Date(date) : this._today).getFullYear().toString();

      const seasons = {};
      for (const key of Object.keys(this._statistics.times)) {
				const thisTimes = this._statistics.times[key].filter(el => el.discipline=='BRUW' || el.timeStamp > 0);
				const timesOfDate = thisTimes.filter(el => el.datetime.slice(0, 4) === today);
				if(timesOfDate.length == 0) continue;
				
				seasons[key] = this.setBestAverage(timesOfDate);
      }
      return seasons;
   }
   /**
    * timeStamp를 시간 문자열로 변환
    * @param {number} timestamp - 타임스탬프 (일 단위)
    * @returns {string} 포맷된 시간 문자열
    */
		formatTimeFromTimestamp(timestamp) {
			// timestamp는 일 단위이므로 초로 변환
			const totalSeconds = timestamp * 24 * 60 * 60;
			
			const minutes = Math.floor(totalSeconds / 60);
			const seconds = totalSeconds % 60;
			
			if (minutes > 0) {
				// MM:SS.ss 형식
				return `${minutes.toFixed(2)}:${seconds.toFixed(2).padStart(5, '0')}`;
			} else {
				// SS.ss 형식
				return seconds.toFixed(2);
			}
		}

		/**
		* 기록들의 평균 타임 계산
		* @param {Array} times - 기록 배열
		* @returns {Object} 평균 정보 객체
		*/
		getAverageTime(timeArr) {
      if (!timeArr || timeArr.length === 0) {
				return "00:00.00";
      }
      
      // timeStamp 합계 계산
      const totalTimestamp = timeArr.reduce((sum, record) => sum + record.timeStamp, 0);
      const timeStamp = totalTimestamp / timeArr.length;
      
      // timeStamp를 시간 문자열로 변환 (MM:SS.ss 또는 SS.ss)
      const time = this.formatTimeFromTimestamp(timeStamp);
      
      return time;
   }

   getTimesBestByMonth() {
      //=======================================================
      // 2025년부터 월별 최고기록 가져오기
      //=======================================================
      const uniqueDate = [...new Set(this._times.map(el => el.datetime.slice(0, 7)))].filter(el => Number(el.slice(0, 4)) >= 2025);
      const months = {};
      for (const date of uniqueDate) {
				for (const key of Object.keys(this._statistics.times)) {
					const thisTimes = this._statistics.times[key].filter(el => el.discipline=='BRUW' || el.timeStamp > 0);
					const timesOfDate = thisTimes.filter(el => el.datetime.slice(0, 7) === date);
					if(timesOfDate.length == 0) continue;
					
					months[`${key}_${date}`] = this.setBestAverage(timesOfDate);
				}
      }
      //=======================================================
      return months;
   }

	totalTimesTableMarkdown = () => {
		const records = [];
		for (const key of Object.keys(this._statistics.times)) {
			const [ discipline, course, distance ] = key.split('_');
			if (this._statistics.times[key].length > 0) {
				let time = {...this._statistics.times[key][0]};
				if (discipline.length == 4) {
					time.label = getEventName(discipline, course, distance, 'ko');
										time = this.setStrokesMeters(time, time);
				} else {
					time.label = getEventName(discipline, course, distance, 'ko');
				}
				records.push(time);
			}
		}
		return records;
	}
	 
	eventResultTableMarkdown = (type="event", disciplines) => {
    let records = [];
    
    for (const discipline of disciplines) {
			for (const distance of _distances) {
				for (const course of _courses) {
					const key = `${discipline}_${course}_${distance}`;
					if (this._statistics.times[key] && this._statistics.times[key].length > 0) {
						// ✅ filter 결과를 map으로 복사
						const filtered = this._statistics.times[key]
								.filter(el => el.type == type)
								.map(el => ({...el}));  // ✅ 각 요소 복사
						records = [ ...records, ...filtered ];
					}
				}
			}
    }
    
    records = records.reduce((arr, el) => {
											switch(el.type) {
													case "medalbank":
														el.type = "메달뱅크 평영 정기훈련<br />서울 압구정 · 유성스포츠센터";
														break;
													case "video":
														el.type = "비디오 인증";
														break;
													default:
														el.type = `${el.competitionName}<br />${el.sido} · ${el.pool}`;
														break;
											}
											el = this.setStrokesMeters(el, el);
											el.label = getEventName(el.discipline, el.course, el.distance, 'ko').replace(" M ", " ");
											arr.push(el);
											return arr;
										}, [])
										.sort((a,b) => new Date(b.datetime) - new Date(a.datetime));
    
    return records;
	}
   
   // 명예의전당
   customHallOfFame = (times) => {
      const hallOfFames = [];

      for (const discipline of _disciplines) {
         for (const distance of _distances) {
            for (const course of _courses) {
               let eventTimes = times.filter(el => el.discipline == discipline && el.course == course && el.distance == distance);
               if (eventTimes.length > 0) {
                  
                  eventTimes = eventTimes.sort((a, b) => a.timeStamp - b.timeStamp)
                                                             .map(el => {
                                                                        const arr = el.time.split('.');
                                                                        if (arr[0].includes(":")) arr[0] = arr[0].slice(0, -1) + '0';
                                                                        el.type = arr[0];
                                                                        if(el.type.slice(0,1) == '0') el.type = el.type.slice(1);
                                                                        delete el.discipline;
                                                                        delete el.course;
                                                                        delete el.distance;
                                                                        // delete el.timeStamp;
                                                                        return el;
                                                               });
                  // 25.00, 26.00, ... 1:01.23
                  const types = [...new Set(eventTimes.map((entry) => entry.type))];

                  for (const type of types) {
                              let fromTo = `${type}.00 - ${type}.99`;
                              if (type.includes(":")) { // 1:00 - 1:09
                                 fromTo = `${type}.00 - ${type.slice(0, -1)}9.99`;
                              }
                              const label = `${type.includes(":") ? type.replace(":", "분 ")+"초대" : type+"초"} 클럽`
                              const hallOfFame = {
                                 type,
                                 event: getEventName(discipline, course, distance, 'ko'), // `${disciplineKor} ${course} ${distance}`,
                                 fromTo: fromTo,
                                 // label: `${type.includes(":") ? type.replace(":", "분 ")+"초대" : type+"초"} 클럽[${disciplineKor} ${course} ${distance}]`,
                                 label: label,
                                 times: eventTimes.filter(el => el.type == type),
                              };
                              // 기준기록 이상 삭제
                              hallOfFame.times = hallOfFame.times.sort((a,b) => a.timeStamp-b.timeStamp)
                              if (hallOfFame.event.includes("제로스트로크")) {
                                 hallOfFame.fromTo = "";
                                 hallOfFame.label = "제로스트로크 클럽";
                                 const index = hallOfFames.findIndex(el => el.event.includes("제로스트로크"))
                                 if (index >= 0) {
                                    hallOfFames[index].times = hallOfFames[index].times.concat(hallOfFame.times);
                                 } else {
                                    hallOfFames.push(hallOfFame);
                                 }
                              } else if (hallOfFame.event.includes("원스트로크")) {hallOfFame.fromTo = "";
                                 hallOfFame.label = "원스트로크 클럽";
                                 const index = hallOfFames.findIndex(el => el.event.includes("원스트로크"))
                                 if (index >= 0) {
                                    hallOfFames[index].times = hallOfFames[index].times.concat(hallOfFame.times);
                                 } else {
                                    hallOfFames.push(hallOfFame);
                                 }
                              } else if (discipline=='BR' && distance == '200M' && type.slice(0,1) == '3' && type.slice(2,3) >= '4' || // "3:4"보다 큰것 삭제
                                    discipline=='BR' && distance == '100M' && type.slice(0,2) == "2:" ||
                                    discipline=='BR' && distance == '50M' && type.slice(0,2) == "1:" ||
                                    discipline=='BR' && distance == '50M' && type.slice(0,1) == "5"
                                 ) {
                              } else {
                              // 100M 1분 미만 클럽
                              if (discipline=='BR' && distance == '100M' && !type.includes(":")) { // 00.00
                                 hallOfFame.fromTo = "00:00.00 - 00:59.99";
                                 hallOfFame.label = "1분 미만 클럽";
                                 const index = hallOfFames.findIndex(el => el.label=='1분 미만 클럽')
                                 if (index >= 0) {
                                    hallOfFames[index].times = hallOfFames[index].times.concat(hallOfFame.times);
                                 } else {
                                    hallOfFames.push(hallOfFame);
                                 }
                              } else {
                                 hallOfFames.push(hallOfFame);
                              }
                              }
                  }
               }
            }
         }
      }


      return hallOfFames;
   }
   
   makeProfileTable = () => {

      const summaryTable = {};
      
      summaryTable.totalTimes= this.totalTimesTableMarkdown();

			// const tms = this._statistics.times.filter(el => el.discipline.length > 3);

      summaryTable.resultEvents = this.eventResultTableMarkdown("event", ["BR"])
      summaryTable.resultMedalbank = this.eventResultTableMarkdown("medalbank", ["BR"])
      summaryTable.resultOlympiad = this.eventResultTableMarkdown("medalbank", ["BROW", "BRZS", "BROS", "BRMS", "BRUW"]); 

      let no = 1;
			summaryTable.statistics = {};
      for (const discipline of _disciplines) {
         for (const course of _courses) {
            for (const distance of _distances) {
               const key = `${discipline}_${course}_${distance}`;
               if (!this._statistics.times[key] || this._statistics.times[key].length == 0) continue;
               //-----------------------------------------------
               // initialize
               //-----------------------------------------------
               if (!summaryTable.statistics[key]) summaryTable.statistics[key] = {};

               //-----------------------------------------------
               // title         
               //-----------------------------------------------
               summaryTable.statistics[key].title = getEventName(discipline, course, distance, 'ko').replace(" M ", " ");
               summaryTable.statistics[key].count = this._statistics.times[key].length;
               //-----------------------------------------------
               // 종합
               //-----------------------------------------------
               const statisticsKey = this._statistics.entirePeriod[key]
               statisticsKey.first = statisticsKey.first ?? {}
               statisticsKey.latest = statisticsKey.latest ?? {}
               statisticsKey.best = statisticsKey.best ?? {}
               statisticsKey.season = statisticsKey.season ?? {}
               const totals = [
                  { label: "최초기록", time: statisticsKey.first?.time??'', datetime: statisticsKey.first?.datetime??'' },
                  { label: "최근기록", time: statisticsKey.latest?.time??'', datetime: statisticsKey.latest?.datetime??'' },
                  { label: "최고기록", time: statisticsKey.best?.time??'', datetime: statisticsKey.best?.datetime??'' },
                  { label: "시즌기록", time: statisticsKey.season?.besttime??'', datetime: statisticsKey.season?.datetime??'' },
               ];
               
               summaryTable.statistics[key].totals = totals;
               //-----------------------------------------------
               // 최고 평균
               //-----------------------------------------------
               if (this._statistics.quaters) {
                     
                  const seasons = [];

                  seasons.push({ label: "전체기록", besttime: statisticsKey.best.time ??'', datetime: statisticsKey.best.datetime ??'', average: statisticsKey.best.average ??'' });

                  const season = this._statistics.seasons[key];
                  if (season) {
                     seasons.push({ label: "시즌기록", besttime: statisticsKey.best.time, datetime: statisticsKey.best.datetime, average: season.average });
                  }

                  const quaters3 = this._statistics.quaters?.quater3[key];
                  if (quaters3) {                  
                     seasons.push({ label: "최근3개월", besttime: quaters3.besttime, datetime: quaters3.datetime, average: quaters3.average });
                  }
                  const quaters6 = this._statistics.quaters?.quater3[key];
                  if (quaters6) {                  
                     seasons.push({ label: "최근6개월", besttime: quaters6.besttime, datetime: quaters6.datetime, average: quaters6.average });
                  }
                  const quaters12 = this._statistics.quaters?.quater3[key];
                  if (quaters12) {                  
                     seasons.push({ label: "최근12개월", besttime: quaters12.besttime, datetime: quaters12.datetime, average: quaters12.average });
                  }
                  summaryTable.statistics[key].seasons = seasons;
               }

               //-----------------------------------------------
               // times
               //-----------------------------------------------
               const times = this._statistics.times[key].map(item => ({...item}))
                                                         .reduce((arr,el) => {
                                                            el = this.setStrokesMeters(el, el);
                                                            arr.push(el);
                                                            return arr;
                                                         }, []);  // ✅ 얕은 복사
               summaryTable.statistics[key].times = times;
            }
         }
      }
 
      return summaryTable
   }
   /*
   {
      athletes: 175,
      graph: {
         course: [{ count, course }],
         heat: [{ count, discipline, course , distance }],
         isJunior: [{ count, isJunior }],
         type: [{ count, type }],
      },
      top3: [
         { gender, discipline, course , distance, top3: [{athleteID,name,competitionName,pool,ageGroup}] },
      ],
   }
   */
   makeStatisticsTable = (statistics) => {
    //   const medals = ['', '<span class="text-xs text-yellow-300">●</span>', '<span class="text-xs text-gray-500">●</span>', '<span class="text-xs text-amber-800">●</span>'];
	  const medals = ['', '<span class="text-yellow-300"> (金)</span>', '<span class="text-gray-500"> (銀)</span>', '<span class="text-amber-800"> (銅)</span>'];
      const statisticsOBJ = { total: [], top3: {}, top1: [], athletes: statistics.randomAthletes ?? [] };
      statisticsOBJ.athletes = statistics.randomAthletes.slice(0, 11)

      const timeCount = statistics.graph.type.reduce((sum, el) => sum + el.count, 0)
      const totals = [
         { label: "기록", count: `${timeCount}번의 시도 (선수당 ${(timeCount / statistics.athletes).toFixed(2)}번)` },
         { label: "선수", count: statistics.athletes },
         { label: "경기실적", count: statistics.graph.type.length > 0 ? `${statistics.graph.type[0].count}개 (선수당 ${(statistics.graph.type[0].count / statistics.athletes).toFixed(2)}번)` : 0 },
         { label: "측정기록", count: statistics.graph.type.length > 1 ? `${statistics.graph.type[1].count}개 (선수당 ${(statistics.graph.type[1].count / statistics.athletes).toFixed(2)}번)` : 0 },
         { label: "올림피아드", count: statistics.graph.type.length > 2 ? `${statistics.graph.type[2].count}개 (선수당 ${(statistics.graph.type[2].count / statistics.athletes).toFixed(2)}번)` : 0 },
         
         // { label: "선수(전체 선수수)", count: statistics.athletes },
         // { label: "경기실적(전체 time수)", count: statistics.graph.type[0].count },
         // { label: "측정기록", count: statistics.graph.type[1].count },
         // { label: "측정기록", count: statistics.graph.type[1].count },
      ];
      const average = [
         { label: "평영 50M LCM", count:statistics.averageTimes['50M-LCM-count']??'', all:statistics.averageTimes['50M-LCM']??'', men:statistics.averageTimes['50M-LCM-men']??'', women:statistics.averageTimes['50M-LCM-women']??'' },
         { label: "평영 50M SCM", count:statistics.averageTimes['50M-SCM-count']??'', all:statistics.averageTimes['50M-SCM']??'', men:statistics.averageTimes['50M-SCM-men']??'', women:statistics.averageTimes['50M-SCM-women']??'' },
         { label: "평영 100M LCM", count:statistics.averageTimes['100M-LCM-count']??'', all:statistics.averageTimes['100M-LCM']??'', men:statistics.averageTimes['100M-LCM-men']??'', women:statistics.averageTimes['100M-LCM-women']??'' },
         { label: "평영 100M SCM", count:statistics.averageTimes['100M-SCM-count']??'', all:statistics.averageTimes['100M-SCM']??'', men:statistics.averageTimes['100M-SCM-men']??'', women:statistics.averageTimes['100M-SCM-women']??'' },
      ];
      const percentage = [
         { label: "평영 50M LCM", percentage:"1위초", all:statistics.percentageTimes['50M-LCM-1-rank']??'', men:statistics.percentageTimes['50M-LCM-1-rank-men']??'', women:statistics.percentageTimes['50M-LCM-1-rank-women']??'' },
         { label: "평영 50M LCM", percentage:" 0.1%초", all:statistics.percentageTimes['50M-LCM-01']??'', men:statistics.percentageTimes['50M-LCM-01-men']??'', women:statistics.percentageTimes['50M-LCM-01-women']??'' },
         { label: "평영 50M LCM", percentage:" 1%초", all:statistics.percentageTimes['50M-LCM-1']??'', men:statistics.percentageTimes['50M-LCM-1-men']??'', women:statistics.percentageTimes['50M-LCM-1-women']??'' },
         { label: "평영 50M LCM", percentage:" 5%초", all:statistics.percentageTimes['50M-LCM-5']??'', men:statistics.percentageTimes['50M-LCM-5-men']??'', women:statistics.percentageTimes['50M-LCM-5-women']??'' },
         { label: "평영 50M LCM", percentage:" 10%초", all:statistics.percentageTimes['50M-LCM-10']??'', men:statistics.percentageTimes['50M-LCM-10-men']??'', women:statistics.percentageTimes['50M-LCM-10-women']??'' },
         { label: "평영 50M LCM", percentage:" 50%초", all:statistics.percentageTimes['50M-LCM-50']??'', men:statistics.percentageTimes['50M-LCM-50-men']??'', women:statistics.percentageTimes['50M-LCM-50-women']??'' },


         { label: "평영 50M SCM", percentage:" 0.1%초", all:statistics.percentageTimes['50M-SCM-01']??'', men:statistics.percentageTimes['50M-SCM-01-men']??'', women:statistics.percentageTimes['50M-SCM-01-women']??'' },
         { label: "평영 50M SCM", percentage:" 1%초", all:statistics.percentageTimes['50M-SCM-1']??'', men:statistics.percentageTimes['50M-SCM-1-men']??'', women:statistics.percentageTimes['50M-SCM-1-women']??'' },
         { label: "평영 50M SCM", percentage:" 5%초", all:statistics.percentageTimes['50M-SCM-5']??'', men:statistics.percentageTimes['50M-SCM-5-men']??'', women:statistics.percentageTimes['50M-SCM-5-women']??'' },
         { label: "평영 50M SCM", percentage:" 10%초", all:statistics.percentageTimes['50M-SCM-10']??'', men:statistics.percentageTimes['50M-SCM-10-men']??'', women:statistics.percentageTimes['50M-SCM-10-women']??'' },
         { label: "평영 50M SCM", percentage:" 50%초", all:statistics.percentageTimes['50M-SCM-50']??'', men:statistics.percentageTimes['50M-SCM-50-men']??'', women:statistics.percentageTimes['50M-SCM-50-women']??'' },

      ];
      statisticsOBJ.totals = totals;
      statisticsOBJ.average = average;
      statisticsOBJ.percentage = percentage;

      for (const discipline of _disciplines) {
      // const discipline = 'BR';
         // for (const gender of _genders) {
         for (const course of _courses) {
            for (const distance of _distances) {
               const statatics = statistics.top3.filter(el => el.discipline == discipline && el.course == course && el.distance == distance);
               if (statatics.length == 0) continue;

               const key = `${discipline}-${distance.replace('M', '')}-${course}`
               const label = getEventName(discipline, course, distance, 'ko');

               const top1 = {};
               top1.key = key;
               top1.label = discipline == "BRUW" ? label.replace(" M ", " ") : label;

               let top3 = statatics[0].top3[0];
               if (top3.meters != undefined) {
                  top3 = statatics[0].top3.sort((a,b) => b.meters-a.meters);
                  top3 = top3[0];
               }

               const tempTop3 = this.setStrokesMeters(top1, top3);
               top1.menTime = tempTop3.time ?? ''
               top1.menName = top3.name ?? ''
               top1.menAthleteID = top3.athleteID ?? ''
               top1.menDatetime = top3.datetime ?? ''
               top1.menThumbnail = getImageURL(top3.thumbnail ?? '')
               
               // women
               if (statatics.length > 1) {
                  statatics[0].top3 = statatics[0].top3.concat(statatics[1].top3);
                  
                  top3 = statatics[1].top3[0];
                  if (top3.meters != undefined) {
                     top3 = statatics[1].top3.sort((a,b) => b.meters-a.meters);
                     top3 = top3[0];
                  }

                  const tempTop3 = this.setStrokesMeters(top1, top3);
                  top1.womenTime = tempTop3.time ?? ''
                  top1.womenName = top3.name ?? ''
                  top1.womenAthleteID = top3.athleteID ?? ''
                  top1.womenDatetime = top3.datetime ?? ''
                  top1.womenThumbnail = getImageURL(top3.thumbnail ?? '')
               }
               
               statisticsOBJ.top1.push(top1);

               const statatic = statatics[0];

               if (! statisticsOBJ.top3) statisticsOBJ.top3 = {};
               if (! statisticsOBJ.top3[key]) statisticsOBJ.top3[key] = { men: { table: []}, women: { table: []} }

               statatic.top3 = statatic.top3.reduce((arr, data) => {
                  data.thumbnail = getImageURL(data.thumbnail);
                  data.medal = medals[data.rank];
                  data = this.setStrokesMeters(data, data);
                  arr.push(data);
                  return arr;
               }, [])
               statisticsOBJ.top3[key].label = label;
               statisticsOBJ.top3[key].top3 = statatic.top3
               statisticsOBJ.top3[key].top3Times = statatic.top3
            }
         }
      }
      // }
  
      statisticsOBJ.top1 = statisticsOBJ.top1;

      return statisticsOBJ;
   }
}

export default UtilAnaysis;
