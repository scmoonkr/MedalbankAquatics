const moment = require('moment'); // npm install moment

const _disciplines = ["BR", "FR", "BK", "FL", "IM"];
const _distances = ["25M", "50M", "100M", "200M", "400M", "800M", "1500M"];
const _courses = ["SCM", "LCM"];

/*******************************************************
 * 
 * date library
 * 
 *******************************************************/
class UtilAnaysis {
	constructor(timeArr=[], today=new Date()) {
		this._times = timeArr.sort((a, b) => new Date(a.datetime) - new Date(b.datetime));
		this._disciplineTimes = this.getDisciplineTimes();
		this._today = new Date(today);
	}
	//-----------------------------
	// getter
	//-----------------------------
	get times() 				{ return this._times; }
	get today() 				{ return this._today; }
	get disciplineTimes() 	{ return this._disciplineTimes; }
	get disciplines() 	{ return _disciplines; }
	get distances() 		{ return _distances; }
	get courses() 			{ return _courses; }
	get first() 				{ return { time: this.times[0].time, datetime: this.times[0].datetime }; }	
	get latest() 				{ return { time: this.times[this.times.length-1].time, datetime: this.times[this.times.length-1].datetime }; }

	//-----------------------------
	set times(timeArr) { this._times = timeArr; }
	set today(dt) { this._today = dt; }

	// discipline, distance, cource로 그룹핑
	getDisciplineTimes() {		
		const disciplines = {};
		for (const discipline of _disciplines) {
			for (const distance of _distances) {
				for (const course of _courses) {      
					const timesOfDate = this.times.filter(el => el.discipline==discipline && 
																											el.course==course && 
																											el.distance==distance)
																				.sort((a,b) => a.timeStamp-b.timeStamp);
					if(timesOfDate.length == 0) continue;
					// sort by timeStamp
					disciplines[`${discipline}_${course}_${distance}`] = timesOfDate;
				}
			}
		}
		return disciplines;
	}

	setBestAverage(timesOfDate, key) {
		const selectedTimes = timesOfDate.sort((a,b) => a.timeStamp - b.timeStamp);
		return {
			count		: selectedTimes.length,
			besttime: selectedTimes[0].time,
			datetime: selectedTimes[0].datetime,
			average	: this.getAverageTime(selectedTimes),
		};
	}

	// month: 3, 6, 9, 12개월
	getQuaterBestAverage(today, month) {
		const endDate = today ? new Date(today) : this.today;
		const startDate = today ? new Date(today) : this.today;
		startDate.setMonth(endDate.getMonth() - month);
		
		const quaters = {};
		
		for (const key of Object.keys(this.disciplineTimes)) { // `${discipline}_${course}_${distance}`
			const thisTimes = this.disciplineTimes[key];
			const timesOfDate = thisTimes.filter(el => new Date(el.datetime) >= startDate && new Date(el.datetime) <= endDate);
			if(timesOfDate.length == 0) continue;
			
			quaters[key] = this.setBestAverage(timesOfDate);
		}
		return quaters;
	}

	getSeasonBestAverage(date) {
		const today = (date ? new Date(date) : this.today).getFullYear().toString();

		const seasons = {};
		for (const key of Object.keys(this.disciplineTimes)) { // `${discipline}_${course}_${distance}`
			const thisTimes = this.disciplineTimes[key];
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
				return `${minutes}:${seconds.toFixed(2).padStart(5, '0')}`;
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
		const uniqueDate = [...new Set(this.times.map(el => el.datetime.slice(0, 7)))].filter(el => Number(el.slice(0, 4)) >= 2025);
		// console.log("uniqueDate=", uniqueDate);
//???????????????????????
		const months = {};
		for (const date of uniqueDate) {

			for (const key of Object.keys(this.disciplineTimes)) { // `${discipline}_${course}_${distance}`
				const thisTimes = this.disciplineTimes[key];
				const timesOfDate = thisTimes.filter(el => el.datetime.slice(0, 7) === date);
				if(timesOfDate.length == 0) continue;
				
				months[`${key}_${date}`] = this.setBestAverage(timesOfDate);
			}
		}
		//=======================================================
		return months;
	}
}

module.exports = UtilAnaysis;
