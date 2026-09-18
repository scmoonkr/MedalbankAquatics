const lodash    = require('lodash');
const MemoryDB		= require("../../Class/MemoryDB");
const memoryDB		= new MemoryDB();

'use strict';

/*

	// '/athlete/view/:athleteID': athletes_medalbank_view + times;

	// '/athlete/list'


	// '/athlete/library/:athleteID'


	// '/times/insert'
			- 


*/
const info = {
	info: {
		medals: {}, // { gold, silver, bronze }, 
		majorStyles: {},  // [{ style, count  }],
		competitions: {}, // [{ competitionID, count }],
		pools: {},  // [{ poolID, count }],
		teams: {},  // [{ teamID, count }],
		cities: {},  // [{ sido, count }],

		firstTime: {},  //  { timeID, time, rank, poolID, sido, datetime },
		latestTime: {}, // { time, timeStamp, rank, poolID, pool, sido, datetime, diff },
		bestTime: {}, // { time, timeStamp, rank, poolID, pool, sido, datetime },
		seasonAverage: 0.0, // start / 
	},
};

const statistics = {
	"athleteID" : 100001,
	"majorStyles" : [
		{ "style": "freestyle", "count": 5 },
		{ "style": "backstroke", "count": 3 },
		{ "style": "butterfly", "count": 1 },
	],
	"competitions" : [ 
		{ "competitionID" : 4, "golds" : 0, "silvers" : 2, "bronzes" : 1, },
		{ "competitionID" : 68, "golds" : 1, "silvers" : 1, "bronzes" : 0, },
		{ "competitionID" : 111, "golds" : 3, "silvers" : 1, "bronzes" : 0, },
	],
	"teams" : [ 
		{ "teamID" : 128, "count" : 9 },
		{ "teamID" : 653, "count" : 6 },
		{ "teamID" : 1299, "count" : 1 },
	],
	"pools" : [ 
		{ "poolID" : 433, "count" : 6 },
		{ "poolID" : 258, "count" : 4 },
		{ "poolID" : 433, "count" : 2 },
	],
	//-----> event result
	"eventCount" : 2,
	"firstEvent" : {
		"timeID" : 21520,
		"times" : "01:55.38",
		"timeStamp" : 0.00133541666666667,
		"rank" : 2,
		"style" : "freestyleRelay",
		"distance" : "200M",
		"datetime" : "2022-12-10"
	},
	"latestEvent" : {
		"timeID" : 21520,
		"times" : "01:55.38",
		"timeStamp" : 0.00133541666666667,
		"rank" : 2,
		"style" : "freestyleRelay",
		"distance" : "200M",
		"datetime" : "2022-12-10"
	},
	"bestEvent" : { 
		"freestyle-50M": { "timeID":1, "times" : "01:55.38","timeStamp" : 0.00133541666666667, "rank": 1, "datetime": "2022-12-10",},
	},
	//-----> time result
	"timeCount" : 2,
	"firstTime" : {
		"timeID" : 21520,
		"times" : "01:55.38",
		"timeStamp" : 0.00133541666666667,
		"rank" : 2,
		"style" : "freestyleRelay",
		"distance" : "200M",
		"datetime" : "2022-12-10"
	},
	"latestTime" : {
		"timeID" : 21520,
		"times" : "01:55.38",
		"timeStamp" : 0.00133541666666667,
		"rank" : 2,
		"style" : "freestyleRelay",
		"distance" : "200M",
		"datetime" : "2022-12-10"
	},
	"bestTime" : { 
		"freestyle-50M": { "timeID":1, "times" : "01:55.38", "timeStamp" : 0.00133541666666667, "rank": 1, "datetime": "2022-12-10",},
	},
};
/*******************************************************
 * 
 * leaderboard library
 * 
 *******************************************************/
class UtilLeaderboard {
	constructor(times=[]) {
		this._timeArr = times;
		this._leaderboard = {};
		this._leaderboardArr= [];
	}
	//-----------------------------
	// getter
	//-----------------------------
	get times() 				{ return this._timeArr; }
	get leaderboards() 	{ return this._leaderboardOBJ; }

	//-----------------------------
	set times(times)   { this._timeArr = times; }
	//-----------------------------

	getCompetitionsTeamsPools = (times) => {
		let result = { competitions: [], pools: [], teams: [] };
		try {
			// get competition info
			const competitionIDs = [...new Set(times.map(time => time.competitionID))];
			if (competitionIDs && competitionIDs[0] != undefined) {
				result.competitions = competitionIDs.map(id => {
																							const competition = memoryDB.competitionOBJ[id];
																							if (competition) {
																								const pool = memoryDB.poolOBJ[competition.poolID];
																								return {
																									competitionID	: competition.competitionID,
																									sido					: competition.sido,
																									fullname			: competition.fullname,
																									pool					: pool ? pool.fullname || "" : "",
																									poolID				: pool ? pool.poolID || 0 : 0,
																									dateStart			: competition.dateStart,
																								};
																							}
																						});
			}																		
			// get team info
			const teamIDs = [...new Set(times.map(time => time.teamID))];
			if (teamIDs && teamIDs[0] != undefined)
				result.teams = teamIDs.map(id => {
															const team = memoryDB.teamOBJ[id];
															if (team) {
																return {
																	teamID: team.teamID,
																	name	: team.name,
																	// course	: team.course || "",
																};
															}
														});
	
			// get pool info
			const poolIDs = [...new Set(times.map(time => time.poolID))];
			if (poolIDs && poolIDs[0] != undefined)
				result.pools = poolIDs.map(id => {
															const pool = memoryDB.poolOBJ[id];
															if (pool) {
																return {
																	poolID: pool.poolID,
																	name	: pool.fullname,
																	sido	: pool.sido,
																};
															}
														});                          
		} catch (err) {
			console.log("getCompetitionsTeamsPools.catch.", err);;
		}
		return result;
	}

	setCompetitionTeamPool(times) {
		const timeArr = [];
		for (const time of times) {
			if (time.competitionID != undefined) {
				const competition = memoryDB.getCompetition(time.competitionID);
				if (competition) {
					time.competitionName = competition.fullname;
					time.sido			      = competition.sido;
					time.datetime       = competition.dateStart;
					if (competition.sido) time.sido = competition.sido;
				}
			}
			if (time.poolID != undefined) {
				const pool = memoryDB.getPool(time.poolID);
				if (pool) {
					time.pool     = pool.fullname;
					time.sido			= pool.sido;
					if (pool.sido) time.sido = pool.sido;
				}
			}
			if (time.teamID != undefined) {
				const team = memoryDB.getTeam(time.teamID);
				if (team) {
					time.team     = team.name;
				}
			}
			timeArr.push(time);
		}
		return timeArr;
	}

	makeAthletesStatistics(times) {
		const statistics = {};

		times = this.setCompetitionTeamPool(times);

		statistics.majorStyles  = this.getStylesByCount(times);
		statistics.competitions = this.getCompetitionsByCount(times);
		statistics.cities       = this.getSidosByCount(times);  
		statistics.pools        = this.getPoolsByCount(times);

		const eventTimes = times.filter(time => time.competitionID > 0);
		statistics.eventCount    = eventTimes.length;
		statistics.medals        = this.calculateMedals(eventTimes);
		statistics.firstEvent    = this.findFirstTime(eventTimes);
		statistics.latestEvent   = this.findLatestTime(eventTimes);
		statistics.bestEvent     = this.findBestTime(eventTimes);

		const timeTimes = times.filter(time => !time.competitionID);
		statistics.timeCount    	= timeTimes.length;
		statistics.firstTime     = this.findFirstTime(timeTimes);
		statistics.latestTime    = this.findLatestTime(timeTimes);
		statistics.bestTime      = this.findBestTime(timeTimes);
		// statistics.seasonAverage = this.calculateSeasonAverage(times);

		return statistics;
	}
	/**********************************************************************************
	 * times를 gender, ageGroup, style, course, distance별로 groupping
	 * 
	 * leaderboard: {
	 *  gender, ageGroup, style, course, distance,
	 *   times: [
	 *     { timeID, athleteID, name, timeStamp, rank, datetime, competitionID, teamID, poolID, }
	 *   ]
	 * }
	***********************************************************************************/
	makeLeaderboardAgeGroup(timeArr) {
		const obj = lodash.groupBy(timeArr, (t) => {
			const ageGroup = t.ageGroup ? t.ageGroup : t.ageGroupORG || 'none';
			return `${t.gender || ''}_${ageGroup}_${t.style || ''}_${t.course || ''}_${t.distance || ''}`;
		});


		const ageGroups = [...new Set(
			[
				...timeArr.filter(entry => entry.ageGroup!= undefined).map((item) => item["ageGroup"]).map(entry => entry),
				...timeArr.filter(entry => entry.ageGroupORG!= undefined).map((item) => item["ageGroupORG"]).map(entry => entry),
			]
		)];
	
		const leaderboards = [];
		//----------------------------------
		for (const gender of ["men", "women", "mixed"]) {
			for (const ageGroup of ageGroups) {
				for (const style of ["freestyle", "backstroke", "breaststroke", "butterfly", "individualMedley", "freestyleRelay", "medleyRelay"]) {
					for (const course of ["SCM", "LCM"]) {
						for (const distance of ["25M", "50M", "100M", "200M", "400M", "800M", "1500M"]) {
							const key = `${gender}_${ageGroup}_${style}_${course}_${distance}`;
							if (!obj[key]) continue;
							const timeArr = obj[key].map(({timeID, athleteID, name, time, timeStamp, rank, datetime, competitionID, teamID, poolID}) => ({ timeID, athleteID, name, time, timeStamp, rank, datetime, competitionID, teamID, poolID, }));
							const times = timeArr.map(({timeID, athleteID, name, time, timeStamp, rank, datetime, competitionID, teamID, poolID}) => ({ timeID, athleteID, name, time, timeStamp, rank, datetime, competitionID, teamID, poolID, }));

							const lb = {
								gender        : gender,
								// ageGroup      : ageGroup,
								style         : style,
								course        : course,
								distance      : distance,
								// round         : arr[5],
								medals        : this.calculateMedals(times),
								firstTime     : this.findFirstTime(times),
								latestTime    : this.findLatestTime(times),
								bestTime      : this.findBestTime(times),
								seasonAverage : this.calculateSeasonAverage(times),
								teams         : this.getTeamsByCount(times).sort((a, b) => b.count-a.count),
								// times         : times,
							}
							leaderboards.push(lb);

						} // distance
					} // course
				} // style
			} // ageGroup
		} // gender
		//----------------------------------
		// console.log("----->", leaderboards, leaderboards.length);
		return leaderboards;
	}
	makeLeaderboard(timeArr) {
		const obj = lodash.groupBy(timeArr, (t) => {
			return `${t.gender || ''}_${t.style || ''}_${t.course || ''}_${t.distance || ''}`;
		});
	
		const leaderboards = [];
		//----------------------------------
		for (const gender of ["men", "women", "mixed"]) {
			for (const style of ["freestyle", "backstroke", "breaststroke", "butterfly", "individualMedley", "freestyleRelay", "medleyRelay"]) {
				for (const course of ["SCM", "LCM"]) {
					for (const distance of ["25M", "50M", "100M", "200M", "400M", "800M", "1500M"]) {
						const key = `${gender}_${style}_${course}_${distance}`;
						if (!obj[key]) continue;
						const timeArr = obj[key].map(({timeID, athleteID, name, time, timeStamp, rank, datetime, competitionID, teamID, poolID}) => ({ timeID, athleteID, name, time, timeStamp, rank, datetime, competitionID, teamID, poolID, }));
						const times = timeArr.map(({timeID, athleteID, name, time, timeStamp, rank, datetime, competitionID, teamID, poolID}) => ({ timeID, athleteID, name, time, timeStamp, rank, datetime, competitionID, teamID, poolID, }));

						const lb = {
							gender        : gender,
							style         : style,
							course        : course,
							distance      : distance,
							// round         : arr[5],
							medals        : this.calculateMedals(times),
							firstTime     : this.findFirstTime(times),
							latestTime    : this.findLatestTime(times),
							bestTime      : this.findBestTime(times),
							seasonAverage : this.calculateSeasonAverage(times),
							teams         : this.getTeamsByCount(times).sort((a, b) => b.count-a.count),
							// times         : times,
						}
						leaderboards.push(lb);

					} // distance
				} // course
			} // style
		} // gender
		//----------------------------------
		return leaderboards;
	}
	makeLeaderboardNotSort(timeArr) {
		const obj = lodash.groupBy(timeArr, (t) => {
			const ageGroup = t.ageGroup ? t.ageGroup : t.ageGroupORG || '';
			return `${t.gender || ''}_${ageGroup}_${t.style || ''}_${t.course || ''}_${t.distance || ''}_${t.round || ''}`;
		});

		Object.keys(obj).forEach(key => {
			const times = obj[key].map(({timeID, athleteID, name, time, timeStamp, rank, datetime, competitionID, teamID, poolID}) => ({ timeID, athleteID, name, time, timeStamp, rank, datetime, competitionID, teamID, poolID, }));

			const arr = key.split('_');
			const lb = {
				gender        : arr[0],
				ageGroup      : arr[1],
				style         : arr[2],
				course        : arr[3],
				distance      : arr[4],
				round         : arr[5],
				medals        : this.calculateMedals(times),
				firstTime     : this.findFirstTime(times),
				latestTime    : this.findLatestTime(times),
				bestTime      : this.findBestTime(times),
				seasonAverage : this.calculateSeasonAverage(times),
				teams         : this.getTeamsByCount(times).sort((a, b) => b.count-a.count),
				times         : times,
			}
			// if (lb.teams.length > 1) console.log("lb->", lb.teams);
			// lb.times = obj[key].filter(tm => {tm.timeID, tm.athleteID, tm.name, tm.timeStamp, tm.rank, tm.datetime, tm.competitionID, tm.teamID, tm.poolID,});
		});
		return this._leaderboardOBJ;
	}

	// 획득 메달 계산(rank : 1,2,3)
	calculateMedals(times) {
		const medals = {
			'gold': 0,
			'silver': 0,
			'bronze': 0,
		};
		if (times.length == 0) return medals;

		for (const time of times) {
			switch (time.rank) {
				case 1:
					medals['gold']++;
					break;
				case 2:
					medals['silver']++;
					break;
				case 3:
					medals['bronze']++;
					break;
			}
		}

		return medals;
	}

	//--------------------------------------
	// team별 count 계산
	//--------------------------------------
	getTeamsByCount(times) {
		if (times.length == 0) return [];
		// teamID의 빈도를 계산
		const countMap = times.reduce((acc, t) => {
				if (t.teamID) acc[t.teamID] = (acc[t.teamID] || 0) + 1;
				return acc;
		}, {});

		// 객체를 배열로 변환하고 정렬
		const teams = Object.keys(countMap).map(teamID => ({
				teamID,
				count: countMap[teamID]
		}));

		teams.sort((a, b) => b.count - a.count); // 개수가 많은 순서로 정렬
		return teams.slice(0, 3);
	}

	//--------------------------------------
	// style별 count 계산
	//--------------------------------------
	getStylesByCount(times) {
		if (times.length == 0) return [];
		// styleID의 빈도를 계산
		const countMap = times.reduce((acc, t) => {
																if (t.style) acc[t.style] = (acc[t.style] || 0) + 1;
																return acc;
															}, {});

		// 객체를 배열로 변환하고 정렬
		const arr = Object.keys(countMap).map(data => ({
				style: data,
				count: countMap[data]
		}));

		arr.sort((a, b) => b.count - a.count); // 개수가 많은 순서로 정렬
		return arr.slice(0, 3);
	}

	//--------------------------------------
	// sido별 count 계산
	//--------------------------------------
	getSidosByCount(times) {
		if (times.length == 0) return [];
		// styleID의 빈도를 계산
		const countMap = times.reduce((acc, t) => {
																if (t.sido) acc[t.sido] = (acc[t.sido] || 0) + 1;
																return acc;
															}, {});

		// 객체를 배열로 변환하고 정렬
		const arr = Object.keys(countMap).map(data => ({
				style: data,
				count: countMap[data]
		}));

		arr.sort((a, b) => b.count - a.count); // 개수가 많은 순서로 정렬
		return arr.slice(0, 3);
	}

	//--------------------------------------
	// pool별 count 계산
	//--------------------------------------
	getPoolsByCount(times) {
		if (times.length == 0) return [];
		// styleID의 빈도를 계산
		const countMap = times.reduce((acc, t) => {
																if (t.poolID) acc[t.poolID] = (acc[t.poolID] || 0) + 1;
																return acc;
															}, {});

		// 객체를 배열로 변환하고 정렬
		const arr = Object.keys(countMap).map(data => ({
			poolID: data,
				count: countMap[data]
		}));

		arr.sort((a, b) => b.count - a.count); // 개수가 많은 순서로 정렬
		return arr.slice(0, 3);
	}

	//--------------------------------------
	// competition별 count 계산
	//--------------------------------------
	getCompetitionsByCount(times) {
		if (times.length == 0) return [];
		// styleID의 빈도를 계산
		const countMap = times.reduce((acc, t) => {
																if (t.competitionID) acc[t.competitionID] = (acc[t.competitionID] || 0) + 1;
																return acc;
															}, {});

		// 객체를 배열로 변환하고 정렬
		const arr = Object.keys(countMap).map(data => ({
			poolID: data,
				count: countMap[data]
		}));

		arr.sort((a, b) => b.count - a.count); // 개수가 많은 순서로 정렬
		return arr.slice(0, 3);
	}

	//--------------------------------------
	// style, distance별로 가장 좋은 기록 가져오기
	//--------------------------------------
	findBestTime(times) {
		if (times.length == 0) return {};
		// 그룹화 객체 생성
		let bestTimesMap = {};

		// 정렬 우선순위 정의
		const styleOrder = ["freestyle", "backstroke", "breaststroke", "butterfly", "individualMedley"];
		const distanceOrder = ["25M", "50M", "100M"];

		// 각 항목을 style-distance별로 그룹화하고 가장 좋은 기록을 저장
		times.forEach((t) => {
			if (styleOrder.indexOf(t.style) >= 0 && distanceOrder.indexOf(t.distance) >= 0) {
				const key = `${t.style}-${t.distance}`;
				
				// 그룹화된 키가 없다면 현재 항목을 추가
				if (!bestTimesMap[key] || t.timeStamp < bestTimesMap[key].timeStamp) {
						bestTimesMap[key] = t;
				}
			}
		});

		// 객체를 배열로 변환하여 반환
		const bestTimes = Object.values(bestTimesMap);

		// 정렬 함수 적용
		bestTimes.sort((a, b) => {
				const styleComparison = styleOrder.indexOf(a.style) - styleOrder.indexOf(b.style);
				if (styleComparison !== 0) return styleComparison;

				return distanceOrder.indexOf(a.distance) - distanceOrder.indexOf(b.distance);
		});
		// return bestTimes;

		bestTimesMap = {};
		// 각 항목을 style-distance별로 그룹화하고 가장 좋은 기록을 저장
		bestTimes.forEach((t) => {
				const key = `${t.style}-${t.distance}`;
				
				bestTimesMap[key] = {
					timeID        : t.timeID,
					time          : t.time,
					timeStamp     : t.timeStamp,
					rank          : t.rank,
					datetime      : new Date(t.datetime).toISOString().slice(0, 10),
					competitionID : t.competitionID || 0,
					poolID        : t.poolID || 0,
					teamID        : t.teamID || 0,
				}
			});

		return bestTimesMap;
	}

	//--------------------------------------
	// 첫번째 가록 가져오기
	//--------------------------------------
	findFirstTime(times) {
		if (times.length == 0) return {};
		const firstRecord = times.reduce((a, b) => {
				const dateA = new Date(a.datetime);
				const dateB = new Date(b.datetime);
				return dateA < dateB ? a : b;
		});

		const time = {
			timeID    : firstRecord.timeID,
			time      : firstRecord.time,
			timeStamp : firstRecord.timeStamp,
			rank      : firstRecord.rank,
			style     : firstRecord.style,
			distance  : firstRecord.distance,
			datetime  : new Date(firstRecord.datetime).toISOString().slice(0, 10),
		};
		if (firstRecord.competitionID) {
			time.competitionID = firstRecord.competitionID;
		} else if (firstRecord.poolID) {
			time.poolID = firstRecord.poolID;
		}

		return time;
	}

	//--------------------------------------
	// 최근 기록 가져오기
	//--------------------------------------
	findLatestTime(times) {
		if (times.length == 0) return {};
		const firstRecord = times.reduce((a, b) => {
				const dateA = new Date(a.datetime);
				const dateB = new Date(b.datetime);
				return dateA > dateB ? a : b;
		});

		const time = {
			timeID    : firstRecord.timeID,
			time      : firstRecord.time,
			timeStamp : firstRecord.timeStamp,
			rank      : firstRecord.rank,
			style     : firstRecord.style,
			distance  : firstRecord.distance,
			datetime  : new Date(firstRecord.datetime).toISOString().slice(0, 10),
		};
		if (firstRecord.competitionID) {
			time.competitionID = firstRecord.competitionID;
		} else if (firstRecord.poolID) {
			time.poolID = firstRecord.poolID;
		}

		return time;
	}

	//--------------------------------------
	// season 평균 기록 계산
	//--------------------------------------
	calculateSeasonAverage(times) {
		const currentYear = 2019; // new Date().getFullYear();
		// 현재 연도의 기록만 필터링
		const seasonTimes = times.filter(t => {
				const recordYear = new Date(t.datetime).getFullYear();
				return recordYear === currentYear && t.timeStamp > 0;
		});
	
		if (seasonTimes.length === 0) {
				return 0.0;
		}
		// 평균 계산
		const total = seasonTimes.reduce((sum, t) => sum + t.timeStamp, 0);
		return total / seasonTimes.length;
	}

}
module.exports = UtilLeaderboard;