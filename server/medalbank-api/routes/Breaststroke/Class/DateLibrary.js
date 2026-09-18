const moment    	= require('moment');
const timezone		= require('moment-timezone');
const momentBD  	= require('moment-business-days');
const holidayKR 	= require('holiday-kr');

const utilLibrary	= require("../Class/utilLibrary");

'use strict';

moment.tz.setDefault("Asia/Seoul");

/*******************************************************
 * 
 * date library
 * 
 *******************************************************/
class UtilDate {
	constructor(libraryCode="", year=new Date().getFullYear()) {
		this._holidaysArr = [];
		this.initialize(libraryCode, year);
	}
	//-----------------------------
	// getter
	//-----------------------------
	get holidays() 				{ return this._holidaysArr; }

	//-----------------------------
	set holiday(holiday)   { this._holidays.push(holiday); }
	set holidays(holidays) { this._holidays = holidays; }
	//-----------------------------

	getThisWeek() {

		try {

			// Get the current date and calculate the start and end of the week
			const now = new Date();
			const start = new Date(now);
			start.setDate(now.getDate() - now.getDay() + 1); // Monday (adjust if week starts on Sunday)
			start.setHours(0, 0, 0, 0); // Start of day

			const end = new Date(start);
			end.setDate(start.getDate() + 6); // Sunday
			end.setHours(23, 59, 59, 999); // End of day

			console.log("Querying from:", start, "to:", end);

			// Query for this week's data
			console.log("This week's results:", result);
		} catch (error) {
			console.error("Error querying this week's data:", error);
		} finally {
		}
		return { start, end }
	}

	getLastWeek() {
		const client = new MongoClient("mongodb://localhost:27017");
	
		try {
			// Get the current date and calculate the start and end of last week
			const now = new Date();
			const startOfThisWeek = new Date(now);
			startOfThisWeek.setDate(now.getDate() - now.getDay() + 1); // This week's Monday
			startOfThisWeek.setHours(0, 0, 0, 0); // Start of day
	
			const start = new Date(startOfThisWeek);
			start.setDate(startOfThisWeek.getDate() - 7); // Last week's Monday
	
			const end = new Date(startOfThisWeek);
			end.setDate(startOfThisWeek.getDate() - 1); // Last week's Sunday
			end.setHours(23, 59, 59, 999); // End of day
	
			console.log("Querying from:", start, "to:", end);
	
			console.log("Last week's results:", result);
		} catch (error) {
			console.error("Error querying last week's data:", error);
		} finally {
		}
		return { start, end }
	}

	validateDate(dateStr) {
		const date = new Date(dateStr);
		return isNaN(date.getTime()) ? false : true;
	}
	// 몇번째 주인지 구하는 함수
	getWeekOfMonth(dateString) {
		// yyyy-MM-dd 형식의 날짜 문자열을 Date 객체로 변환
		const date = new Date(dateString);

		// 해당 날짜가 속한 월의 첫 번째 날을 구함
		const firstDayOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);

		// 첫 번째 날의 요일을 구함 (0: 일요일, 1: 월요일, ..., 6: 토요일)
		const firstDayOfWeek = firstDayOfMonth.getDay();

		// 해당 월의 첫 번째 주의 시작을 월요일로 설정 (월요일이 아니면, 그 주는 1주로 취급)
		const offset = (firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1);

		// 해당 날짜까지 며칠이 지났는지 계산
		const daysPassed = date.getDate() + offset;

		// 주차 계산 (7일을 기준으로 몇 번째 주인지 계산)
		const weekNumber = Math.ceil(daysPassed / 7);

		return weekNumber;
	}

	// 주의 시작일(월요일)을 구하는 코드
	getStartOfWeek(date = new Date()) {
		// 입력 날짜 기준의 요일 (0 = 일요일, 1 = 월요일, ..., 6 = 토요일)
		const dayOfWeek = date.getDay();
		
		// 일요일(0)을 기준으로 월요일의 날짜를 계산
		const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
		
		// Date 객체를 조정하여 이번 주 월요일의 날짜를 구함
		const startOfWeek = new Date(date);
		startOfWeek.setDate(date.getDate() + diff);

		// 결과를 YYYY-MM-DD 형식으로 반환
		return startOfWeek.toISOString().split('T')[0];
	}

	setTimezone(dt) {
		const date = new Date(dt);
		date.setHours(date.getHours() + 9);
		return date
	}
	
	checkDate(date) {
		return new Date(date) != "Invalid Date";
	}

	diffDate(today, diff) {
		return parseInt((new Date(today) - new Date(diff)) / (1000 * 60 * 60 * 24));
	}

	addHour(date, add) {
		let today = new Date(date);
		today = today.setHours(today.getHours()+add);
		return new Date(today);
	}

	addDate(date, add) {
		let ndate = new Date(date);
		ndate.setDate(ndate.getDate() + add);
		return ndate;
	}

	number2Date(num) {
		let start = new Date("1900-01-01");
		start.setDate(start.getDate() + num);
		//console.log("add="+start.toISOString());
	
		return moment(start).format("YYYY-MM-DD");
	}
	
	getNthWeekRangeOfMonth(year, month, week) {
		// 해당 연도의 해당 월의 1일을 구함
		const firstDayOfMonth = new Date(year, month - 1, 1); // month는 0부터 시작하므로 -1
	
		// 해당 월 1일이 무슨 요일인지 확인
		const dayOfWeek = firstDayOfMonth.getDay(); // 0: 일요일, 1: 월요일, ..., 6: 토요일
	
		// 첫 번째 주의 월요일을 계산
		const firstWeekStart = new Date(firstDayOfMonth);
		if (dayOfWeek !== 1) {
			const diff = (dayOfWeek === 0 ? -6 : 1 - dayOfWeek); // 일요일은 -6일, 그 외는 그 주의 월요일로 맞춤
			firstWeekStart.setDate(firstDayOfMonth.getDate() + diff);
		}
	
		// n번째 주의 시작일과 마지막일 계산
		const nthWeekStart = new Date(firstWeekStart);
		nthWeekStart.setDate(firstWeekStart.getDate() + (week - 1) * 7); // n번째 주의 월요일
	
		const nthWeekEnd = new Date(nthWeekStart);
		nthWeekEnd.setDate(nthWeekStart.getDate() + 6); // n번째 주의 일요일
		const formattedStart = nthWeekStart;
		const formattedEnd = nthWeekEnd;
	
		return { start: formattedStart, end: formattedEnd };
	}

	// "\/Date(1220054400000)\/" -> new Date(1220054400000)
	date2number(dt) {
		let start = new Date("1900-01-01");
		let end = new Date(dt);
		let num = (end.getTime() - start.getTime()) / 1000 / 60 / 60 / 24;
		
		return num;
	}
	
	//=================================================
	checkTimes = (time) => {
		time.times = time.times || "";
		if (! time.times) return time;
		time.timeORG = time.time;
		
		//-----> times == number -> string
		if (typeof time.times == "number") {
			if (time.times < 1) {
				// time.time = time.times;
				time.times = this.convertTimestamp2string(time.times);	
			} else {
				time.times = this.convertInt2Times(time.times);	
				// time.time = utilDate.convertString2Timestamp(time.times);
				// if (time.times.length <= 2) time.times = "0." + time.times;	
			}
		// } else {
		// 	time.times = time.times.replace("분", ':').replace("초", '.')
		}
		const times = this.customTimes(time.times);
		if (!times && !time.status) time.status = 'DNS';
		time.times = times;
		// if (time.times == "") { console.log(time); process.exit(); }
		//--------------------------------------------------------------------
		if (time.times) time.time = this.convertString2Timestamp(time.times);
		//--------------------------------------------------------------------

		return time;
	}

	//====================================================
	customTimesArray = (times) => {
		return times.reduce((arr, el) => {
			const tms = el.time.split(':')
			if (tms.length > 1 && tms[0].length == 1) {
				tms[0] = "0" + tms[0]
				el.time = tms.join(':')
			}
			arr.push(el);
			return arr;
		}, [])
	}

	//====================================================
	customTimes = (timeORG) => {
		let numbers = timeORG ? timeORG.toString().trim() : "";
		if (!numbers) return "";
		// if (numbers.length <= 5) {
		// 	const arr = numbers.split('.');
		// 	if (arr.length > 1) {
		// 		arr[1] = (arr[1]+"00").slice(0, 2);
		// 		numbers = arr.join('.');
		// 	}
		// }
		const arr = numbers.split('.');
		if (arr.length > 1) {
			arr[1] = (arr[1]+"00").slice(0, 2);
			numbers = arr.join('.');
		}
	
		const numberRegex = /\d/g; // /(\d+(\.\d+)?)/;
		// Extract numbers from the input string
		// console.log("1 numbers=>", numbers, numbers.match(numberRegex));
		numbers = numbers.match(numberRegex);
		if (!numbers) return "";	// 숫자 아닐경우
		numbers = numbers.join('');
		if (numbers.length < 4) numbers = (numbers+"0000").slice(0, 4);
	
		const str = "000000" + numbers;
		const mm = str.slice(-6,-4);
		const ss = str.slice(-4,-2);
		const tt = str.slice(-2);
		let newTimes = `${mm}:${ss}.${tt}`.replace("00:", "");
		// if (newTimes.length > 1 && newTimes.slice(0, 1) == "0") newTimes = newTimes.slice(1);
	
		return newTimes;
	}

	//=================================================
	convertInt2Times = (int) => {
		if (!int) return "";
		if (typeof int == 'number' && int < 60 && int.toString().length <= 2) {
			int = `${int}.00`;
		}
		if (typeof int == "string") int = utilLibrary.deleteEndSpecialChar(int).trim();
		if (isNaN(int)) {
			const arr = int.trim().split(' ');
			int = arr[0];					
		}

		let str = "", digits = "";
		if (typeof int == 'number') {
			if (int < 100) return utilLibrary.leadingZeros(int, 2)
			str = int.toString();
			if (str.includes('.')) {
				const arr = str.split('.');
				digits = `${("00"+arr[0]).slice(-2)}.${(arr[1]+"00").slice(0, 2)}`;
				str = arr[0].length > 2 ? arr[0].slice(0, -2) : "";
			} else {
				digits = `.${str.slice(-2)}`;
				str = str.slice(0, -2);
				digits = `${str.slice(-2)}${digits}`;	
				str = str.slice(0, -2);
			}
			if (int >= 10000) {
				digits = `${str.slice(-2)}:${digits}`;
			}
		} else {
			digits = int.replace(/‘|'/g, ":").replace(/\"|“/g, ".");
		}
		if (digits.slice(0, 2) == "0:") digits = digits.slice(2);

		return digits;
	}

	//-----------------------------------------
	convertTimenum2stringBreast(timenum) {
		const timeStr = utilLibrary.leadingZeros(timenum.toString(), 6) // 00:00.00
		const str = timeStr.replace(/(\d{2})(\d{2})(\d{2})/, "$1:$2:$3")
		return str;
	}
	
	convertString2TimenumBreast(input) {
		if (!input) return null;

		let totalSeconds = 0;

		// 1️⃣ "1:30" 형식
		if (input.includes(":")) {
			const [minPart, secPart] = input.split(":");

			const minutes = parseInt(minPart, 10);

			let seconds = 0;
			let hundredths = 0;

			if (secPart.includes(".")) {
				const [sec, decimal] = secPart.split(".");
				seconds = parseInt(sec, 10);
				hundredths = parseInt(decimal.padEnd(2, "0").slice(0, 2), 10);
			} else {
				seconds = parseInt(secPart, 10);
			}

			totalSeconds = minutes * 60 + seconds + hundredths / 100;

		} else {
			// 2️⃣ "30" 또는 "30.1" 형식
			totalSeconds = parseFloat(input);
		}

		// 3️⃣ 분/초 계산
		const minutes = Math.floor(totalSeconds / 60);
		const seconds = totalSeconds % 60;

		const secInt = Math.floor(seconds);
		const hundredths = Math.round((seconds - secInt) * 100);

		const newTime = String(minutes).padStart(2, "0") +
										":" +
										String(secInt).padStart(2, "0") +
										"." +
										String(hundredths).padStart(2, "0")
		// 4️⃣ 포맷팅
		return { time:newTime, timenum: minutes*10000 + secInt*100 + hundredths };
	}
	convertTimestamp2string(time) {
		let hh = ''
		let mm = ''
		let ss = ''
		let sss = ''
		if (time >= 1) {
			const arr = (time.toString() + '.').split('.')
			hh = '00'
			mm = '00'
			ss = utilLibrary.leadingZeros(arr[0])
			sss = (arr[1] + '000').slice(0, 2)
		} else {
			const hour = time * 86400000 // 24*60*60*1000 : hh:mm:ss.000
			hh = hour < 1 ? "00" : utilLibrary.leadingZeros(parseInt(hour / 3600000), 2) // 60*60*1000
			// hh = utilLibrary.leadingZeros(parseInt(hour / 3600000), 2) // 60*60*1000
			mm = utilLibrary.leadingZeros(parseInt(hour / 60000) % 60, 2) // 60*60*1000
			ss = utilLibrary.leadingZeros(parseInt(hour / 1000) % 60, 2) // 60*60*1000
			sss = utilLibrary.leadingZeros(Math.round(hour % 1000), 3) // 반올림: 소수 3자리에서
			sss = sss.toString().slice(0, 2)
			// console.log(time, hh, mm, ss, sss);
		}

		let str = `${hh}:${mm}:${ss}.${sss}`;
		if (str.slice(0, 3) == "00:") str = str.slice(3);
		if (str.slice(0, 3) == "00:") str = str.slice(3);
		if (str.slice(0, 1) == "0") str = str.slice(1);
		// if (str.slice(0, 1) == "0") str = str.slice(1);
		return str;
	}
	convertString2Timestamp = (ostr) => {
		if (ostr == undefined) return "";
		ostr = ostr.toString();
		let str = ostr.trim()
		let arr = (str + '.').split('.')
		const sss = parseInt((arr[1] + '000').substr(0, 3))
		str = arr[0] // hh:mm:ss
		arr = ('0:0:' + str).split(':')
	
		const no = arr.length - 3
		const hh = parseInt(arr[no + 0])
		const mm = parseInt(arr[no + 1])
		const ss = parseInt(arr[no + 2])
	
		let time = hh * 60 * 60 * 1000 + mm * 60 * 1000 + ss * 1000 + sss
		time = time / 86400000 // 24*60*60*1000 : hh:mm:ss.000
	
		return time
	}

	// 04h03'05", 
	customizingTime(str) {
		str = str.replace(/ /gi, '').trim();
		if (str.indexOf('h') >= 0 || str.indexOf("'") >= 0 || str.indexOf('"') >= 0) {
			// 4h45'21", 01", 01'41"
			let time = "";
			let arr = str.split("h");
			if (arr.length > 1) {
				time = ("00"+arr[0]).slice(-2); str = arr[1];
			} else {
				time = "00";
			}

			arr = str.split("'");
			if (arr.length > 1) {
				time += ":" + ("00"+arr[0]).slice(-2); str = arr[1];
			} else {
				time += ".00";
			}

			arr = (str+'"').split('"');
			time += ":" + (arr[0] == "" ? "00" : ("00"+arr[0]).slice(-2));
			str = time + ".000";
		}
		return str;
	}
	
	// hh:mm:ss.000
	string2timestamp(str) {
		str = str.replace(/ /gi, '').trim();
		if (str == "") return str;

		let org = str;
		str = str.replace(/:/, ".").replace(/;/, ".").replace(/,/, ".").replace(/-/, ".");
		str = "0.0.0.0." + str;
		str.replace(/:/, ".");
		let arr = (str).split(".");
		let newarr = arr.slice(-4);
		return (parseInt(newarr[0])*3600000 + parseInt(newarr[1])*60000 + parseInt(newarr[2])*1000 + parseInt(newarr[3])) / 86400000; // 24*3600000 : hh:mm:ss.000
	}

	//-----> human datre format
	humanDateFormat (date) {
		// moment.tz.setDefault("Asia/Seoul");
		// let dt = moment();
		let curr = new Date();
		curr.setHours(curr.getHours()+9);	/// set timezone

		const delta = Math.round((curr - new Date(date)) / 1000)
    const minute = 60
    const hour = minute * 60
    const day = hour * 24
    const week = day * 7
    const month = week * 4
    const year = month * 12

    let human
    // console.log('>>>>>>>>>>>>>>>>>>>>today=', curr, ', date=', new Date(date), 'delta=', delta, ", year=", year)
    if (delta > year) {
      human = new Date(date).toISOString().substr(0, 10)
    } else if (delta >= month) {
      human = Math.floor(delta / month) + '개월 전'
    } else if (delta >= week) {
      human = Math.floor(delta / week) + '주 전'
    } else if (delta >= day) {
      human = Math.floor(delta / day) + '일 전'
    } else if (delta >= hour) {
      human = Math.floor(delta / hour) + '시간 전'
    } else if (delta >= minute) {
      human = Math.floor(delta / minute) + '분 전'
    } else {
      human = delta + '초 전'
    }

    // console.log(date, 'human=' + human)
    return human
  }
// const moment    	= require('moment');

// function formatDateTime(date, format="YYYY-MM-DD hh:mm:ss", timezone="Asia/Seoul") {
// 	const tz = moment.tz(date, timezone);

// 	return tz.format(format);
// }
	//-----> convert date to string
	dateString(date, format="YYYY-MM-DD", timezone="Asia/Seoul") {
		if (date === undefined || date == null || date == "" || ! Date.parse(date)) return ""; // date = new Date();
		if (typeof date === "string") date = new Date(date);
		const tz = moment.tz(date, timezone);
		const str = tz.format(format);
		// console.log("date=", date, "format=", format, "string=", str);
		return str;
	}

	//-----> convert time to string
	timeString(time) {
		time     = time.toString().trim();
		let times    = "";
		if (time != "") {
			if (typeof time == "string") {
				time = this.string2timestamp(time);
			} else if (time > 0) {
				time = time.toString();
				time = this.string2timestamp(time);
			}
		
			if (time != "") {
				times    = this.convertTimestamp2string(time); // "times" : "00:31.24",
				if (times.substr(0,5) == "00:00") times = times.substr(3); // "00:00:99.99" -> "00:99.99"
				if (times.length > 8 && times.substr(0,3) == "00:") times = times.substr(3); // "00:00:99.99" -> "00:99.99"
			}
		}
		return times;
	}

	//-----> convert string date to date
	dateString2Date(datestr, format="yyyy-MM-dd") {
		datestr = datestr.toString();
		let ds = datestr || "";
		if (ds.length) ds += "000000000000000000000000";
		let pos, year="", month="", date="", hour="", minute="", second="", ms="", timezone="";

		pos = format.indexOf("yyyy"); if (pos >= 0) year    = ds.substr(pos, 4);
		pos = format.indexOf("MM");   if (pos >= 0) month   = ds.substr(pos, 2);
		pos = format.indexOf("dd");   if (pos >= 0) date    = ds.substr(pos, 2);
		pos = format.indexOf("hh");   if (pos >= 0) hour    = ds.substr(pos, 2);
		pos = format.indexOf("mm");   if (pos >= 0) minute  = ds.substr(pos, 2);
		pos = format.indexOf("ss");   if (pos >= 0) second  = ds.substr(pos, 2);
		pos = format.indexOf("ZZZ");  if (pos >= 0) ms      = ds.substr(pos, 3);
		pos = format.indexOf("T");    if (pos >= 0) timezone= ds.substr(pos, 1);

		return new Date(year, month, date, hour, minute, second, ms);
	}	

	ExcelDateToJSDate(serial) {
		if (typeof serial == "string") return new Date(serial);
		var utc_days  = Math.floor(serial - 25569);
		var utc_value = utc_days * 86400;                                        
		var date_info = new Date(utc_value * 1000);
	
		var fractional_day = serial - Math.floor(serial) + 0.0000001;
	
		var total_seconds = Math.floor(86400 * fractional_day);
	
		var seconds = total_seconds % 60;
	
		total_seconds -= seconds;
	
		var hours = Math.floor(total_seconds / (60 * 60)) + 9;
		var minutes = Math.floor(total_seconds / 60) % 60;
	
		return new Date(date_info.getFullYear(), date_info.getMonth(), date_info.getDate(), hours, minutes, seconds);
	}

	//---------------------------------
	getHolidays(year) {
		const holidays = [
			{ label: '새해', 			 date: [`${year}-01-01`], },
			{ label: '설날', 			 date: [this.getSolar(year-1, 12, 30), this.getSolar(year, 1, 1), this.getSolar(year, 1, 2)], },
			{ label: '3·1절',			 date: [`${year}-03-01`], },
			{ label: '석가탄신일',	date: [this.getSolar(year, 4, 8)], },
			{ label: '어린이날',		date: [`${year}-05-05`], },
			{ label: '현충일', 			date: [`${year}-06-06`], },
			{ label: '광복절', 			date: [`${year}-08-15`], },
			{ label: '추석', 			 	date: [this.getSolar(year, 8, 14), this.getSolar(year, 8, 15), this.getSolar(year, 8, 16)], },
			{ label: '개천절', 			date: [`${year}-10-03`], },
			{ label: '한글날', 			date: [`${year}-10-09`], },
			{ label: '성탄절',			date: [`${year}-12-25`], },
		];

		return holidays;
	}

	//---------------------------------
	initializeHolidays(yearstr) {
		const holidays = this.getHolidays(Number(yearstr));
		holidays.forEach(holiday => {
			this.holidays.push(holiday);
		})
		// for (let no = 0; no < holidays.length; no++) {
		// 	this.holidays.push(holidays[no]);
		// }
	}

	updateMyHolidays(myHolidays) {
		myHolidays.forEach(holiday => {
			const newHol = { label: holiday.label || "", date: [] };
			holiday.date.forEach(dt => {
				const hol = this._holidaysArr.find(holiday => holiday.date.indexOf(dt) >= 0);
				if (hol == undefined) {
					if (holiday.exclude == undefined || ! holiday.exclude) {
						newHol.date.push(dt);
					}
				} else {
					if (holiday.exclude != undefined && holiday.exclude) {
						const include = hol.date.filter(dat => dt != dat);
						if (include != undefined) {
							hol.date = include;
						}
					}
				}
			})
			if (newHol.date != undefined && newHol.date.length > 0) {
				this._holidaysArr.push(newHol);
			}
		})
	
		this._holidaysArr = this._holidaysArr.filter(hol => hol.date.length > 0)
	}

	//---------------------------------
	initialize(libraryCode, year) {
		//-----> before year
		this.initializeHolidays(year - 1);
		//-----> this year
		this.initializeHolidays(year);
		//-----> after year
		this.initializeHolidays(year + 1);
		
		let holidayArr = [];
		this._holidaysArr.forEach(function(holiday) {
			holiday.date.forEach(function(date) {
				holidayArr.push(date);
			})
		})
		//-----> 대체 공휴일: 현출일
		let dt =  new Date(year-1, 4, 5).getDay();	// month: 0 ~ 11, 0: sun, 1~6: mon-sat
		if (dt == 6) holidayArr.push(`${year-1}-05-07`);	// 토
		if (dt == 0) holidayArr.push(`${year-1}-05-06`);	// 일

		dt =  new Date(year, 4, 5).getDay();	// month: 0 ~ 11, 0: sun, 1~6: mon-sat
		if (dt == 6) holidayArr.push(`${year}-05-07`);
		if (dt == 0) holidayArr.push(`${year}-05-06`);

		dt =  new Date(year+1, 4, 5).getDay();	// month: 0 ~ 11, 0: sun, 1~6: mon-sat
		if (dt == 6) holidayArr.push(`${year+1}-05-07`);
		if (dt == 0) holidayArr.push(`${year+1}-05-06`);

		//-----> 대체 공휴일: 설날
		dt = holidayKR.getSolar(year-1, 1, 1);
		if ("금토일".indexOf(dt.dayOfWeek) >= 0) holidayArr.push(this.getSolar(year-1, 1, 3));
		// check 3/1
		if (dt.month == 3 && (dt.day == 1 || dt.day == 2)) holidayArr.push(this.getSolar(year-1, 1, 3));
		dt = holidayKR.getSolar(year-1, 1, 2);
		if (dt.month == 3 && dt.day == 1) holidayArr.push(this.getSolar(year-1, 1, 3));

		dt = holidayKR.getSolar(year, 1, 1);
		if ("금토일".indexOf(dt.dayOfWeek) >= 0) holidayArr.push(this.getSolar(year, 1, 3));
		// check 3/1
		if (dt.month == 3 && (dt.day == 1 || dt.day == 2)) holidayArr.push(this.getSolar(year, 1, 3));
		dt = holidayKR.getSolar(year, 1, 2);
		if (dt.month == 3 && dt.day == 1) holidayArr.push(this.getSolar(year, 1, 3));

		dt = holidayKR.getSolar(year+1, 1, 1);
		if ("금토일".indexOf(dt.dayOfWeek) >= 0) holidayArr.push(this.getSolar(year+1, 1, 3));
		// check 3/1
		if (dt.month == 3 && (dt.day == 1 || dt.day == 2)) holidayArr.push(this.getSolar(year+1, 1, 3));
		dt = holidayKR.getSolar(year+1, 1, 2);
		if (dt.month == 3 && dt.day == 1) holidayArr.push(this.getSolar(year+1, 1, 3));

		//-----> 대체 공휴일: 추석
		dt = holidayKR.getSolar(year-1, 8, 15);
		if ("금토일".indexOf(dt.dayOfWeek) >= 0) holidayArr.push(this.getSolar(year-1, 8, 17));
		// check 10/3
		if (dt.month == 10 && (dt.day == 2 || dt.day == 3 || dt.day == 4)) holidayArr.push(this.getSolar(year-1, 8, 17));
		// check 10/9
		if (dt.month == 10 && (dt.day == 8 || dt.day == 9 || dt.day == 10)) holidayArr.push(this.getSolar(year-1, 8, 17));

		dt = holidayKR.getSolar(year, 8, 15);
		if ("금토일".indexOf(dt.dayOfWeek) >= 0) holidayArr.push(this.getSolar(year, 8, 17));
		// check 10/3
		if (dt.month == 10 && (dt.day == 2 || dt.day == 3 || dt.day == 4)) holidayArr.push(this.getSolar(year, 8, 17));
		// check 10/9
		if (dt.month == 10 && (dt.day == 8 || dt.day == 9 || dt.day == 10)) holidayArr.push(this.getSolar(year, 8, 17));

		dt = holidayKR.getSolar(year+1, 8, 15);
		if ("금토일".indexOf(dt.dayOfWeek) >= 0) holidayArr.push(this.getSolar(year+1, 8, 17));
		// check 10/3
		if (dt.month == 10 && (dt.day == 2 || dt.day == 3 || dt.day == 4)) holidayArr.push(this.getSolar(year+1, 8, 17));
		// check 10/9
		if (dt.month == 10 && (dt.day == 8 || dt.day == 9 || dt.day == 10)) holidayArr.push(this.getSolar(year+1, 8, 17));
// console.log("initialize.updateLocale=", holidayArr);
		momentBD.updateLocale('kr', {
			holidays: holidayArr,
			holidayFormat: 'YYYY-MM-DD'
		})
	}

	//---------------------------------
	getLunar(year, month, day) {
		let dt =  holidayKR.getLunar(year, month, day);
		return moment(new Date(dt.year, dt.month-1, dt.day)).format("YYYY-MM-DD")
	}

	//---------------------------------
	getSolar(year, month, day) {
		let dt;
		try {
			dt =  holidayKR.getSolar(year, month, day);
		} catch (e) {
			dt =  holidayKR.getSolar(year, month, day-1);
		}
		return moment(new Date(dt.year, dt.month-1, dt.day)).format("YYYY-MM-DD")
	}

	//---------------------------------
	addSolarHoliday(label, date) {
console.log("this.holidays=", this.holidays);		
		const ccc = this.holidays.filter(function(day) { 
			return day.date.includes(date); 
		});
		if (ccc.length === 0) {
			this._holidaysArr.push({ label: label, date: date });
		}
	}

	//---------------------------------
	addLunarHoliday(year, month, day) {
		return holidayKR.isLunarHoliday(year, month, day);
	}

	//---------------------------------
	isSolarHoliday(year, month, day) {
		return holidayKR.isSolarHoliday(year, month, day);
	}

	//---------------------------------
	isLunarHoliday(year, month, day) {
		return holidayKR.isLunarHoliday(year, month, day);
	}

	//=================================
	calculateFromDays(days, from=new Date()) {
		if (typeof from === 'string') from = new Date(from);
		const dt = momentBD(from).businessAdd(days);
		return moment(dt).format("YYYY-MM-DD");
	}

	//=================================
	calculateFromToDays(from, to) {
		if (typeof from !== 'string') from = this.dateString(from, "YYYY-MM-DD");
		if (typeof to !== 'string') to = this.dateString(to, "YYYY-MM-DD");
		const diff = momentBD(from, "YYYY-MM-DD").businessDiff(momentBD(to, "YYYY-MM-DD"));
		return diff;
	}

	//=================================
	workedDate(data, userNo, format="YYYY-MM-DD") {
		userNo = userNo == undefined || isNaN(userNo) ? 0 : userNo;
		let value = {};
		if (data.created != undefined) {
			value.humanDate	= data.created.datetime == "" ? "" : this.humanDateFormat(data.created.datetime);
			value.created 	= { userNo: Number(userNo), datetime: this.dateString(data.created.datetime, format) };
		}
		if (data.updated != undefined) value.updated = { userNo: Number(userNo), datetime: this.dateString(data.updated.datetime, format) };
		if (data.deleted != undefined) value.deleted = { userNo: Number(userNo), datetime: this.dateString(data.deleted.datetime, format) };

		return value;
	}
	
	async sleep(delay=500) { // mili sec.
		return new Promise((resolve) => setTimeout(resolve, delay));	
		
		// return new Promise(resolve => {
    //     setTimeout(resolve, ms)				
    // })
	}

}

module.exports = UtilDate;
