const _             = require('lodash');
const extend        = require('node.extend');
const mskCFG        = require('../../Config/mskCFG');
const mongoCFG      = require('../../Config/mongoCFG');
const mongoDB       = require('../../Class/MongoDB');
const MemoryDB      = require("../../Class/MemoryDB");
const utilHTTP			= require("../../Class/utilHTTP");

const TimeLibrary   = require("./times.library");
// const utilDatabase	= require('../utilDatabase.js');

const Reactions   	= require("../../Comments/reactions/reactions.model");
const memoryDB      = new MemoryDB();
const mongodb       = new mongoDB(mongoCFG.Medalbank.database);


/*
	statistics
	최근 합류한 선수: joined: [{ athleteID, name, joined }]
	최다 검색된 선수: athletes: [{ athleteID, name, count }]
	최다 측정한 사람: measured: [{ athleteID, name, count }]
	최근 검색된 기록: times: [{ athleteID, name, datetime }]
	최다 검색된 팀: teams: [{ teamID, name, count }]
	최다 검색된 수영장: pools: [{ poolID, name, count }]
	최다 검색된 대회: competitions: [{ competitionID, name, count }]
*/	
let _statistics = {
	loaded: new Date("2000-01-01"),
			// {
			//    athleteID: 5,
			//    name: '고희경',
			//    count: 15,
			//    datetime: new Date("2025-01-08T06:05:15.421Z")
			//  },
			//  {
			//    athleteID: 4122,
			//    name: '김건우',
			//    count: 4,
			//    datetime: new Date("2025-01-08T06:03:43.209Z")
			//  },
			//  {
			//    athleteID: 23,
			//    name: '문성중',
			//    count: 4,
			//    datetime: new Date("2025-01-08T05:12:29.485Z")
			//  },
			//  {
			//    athleteID: 1,
			//    name: '문성태',
			//    count: 2,
			//    datetime: new Date("2025-01-08T04:02:53.559Z")
			//  }
	measuredRecent: [],		// 최근 측정한 선수: [{ athleteID, name, datetime }]
	measuredMost: [],			// 최다 측정한 선수: [{ athleteID, name, datetime }]
			// {
			//    athleteID: 5,
			//    name: '고희경',
			//    count: 15,
			//    datetime: new Date("2025-01-08T06:05:15.421Z")
			//  },
			//  {
			//    athleteID: 23,
			//    name: '문성중',
			//    count: 4,
			//    datetime: new Date("2025-01-08T05:12:29.485Z")
			//  },
			//  {
			//    athleteID: 1,
			//    name: '문성태',
			//    count: 2,
			//    datetime: new Date("2025-01-08T04:02:53.559Z")
			//  }
	athletes: [],					// 최다 검색된 선수: [{ athleteID, name, datetime }]
	times: [],			      // 최근 검색된 기록: [{ timeID, name, datetime }]
	teams: [],			      // 최다 검색된 팀: [{ teamID, name, count }]
	pools: [],			      // 최다 검색된 수영장: [{ poolID, name, count }]
	competitions: [],			// 최다 검색된 대회: [{ competitionID, name, count }]
	searchCount: {},			// 최다 검색어
	searchRecent: {},			// 최근 검색어
	joined: [],     			// 최근 합류한 선수
	// recentlyMeasured: [],   // 최근 측정한 사람
};

class StatisticsLibrary {

	static clearMemory = () => {
			_statistics = {
				loaded: new Date("2000-01-01"),
				times: [],		         // 최근 검색된 선수: [{ athleteID, name, datetime }]
				athletes: [],					// 최근 검색된 선수: [{ athleteID, name, datetime }]
				measuredRecent: [],   // 최근 검색된 선수: [{ athleteID, name, datetime }]
				measuredMost: [],			// 최다 측정한 선수: [{ athleteID, name, datetime }]
				teams: [],			      // 최다 검색된 팀: [{ teamID, name, count }]
				pools: [],			      // 최다 검색된 수영장: [{ poolID, name, count }]
				competitions: [],			// 최다 검색된 대회: [{ competitionID, name, count }]
				searchCount: {},			// 최다 검색어
				searchRecent: {},			// 최근 검색어
				joined: [],     			// 최근 합류한 선수
				// recentlyMeasured: [],   // 최근 측정한 사람
			
				// recentlyJoinedAthletes: [],			// 최근 합류한 선수: [{ athleteID, name, joined }]
				// recentlySearchedAthletes: [],			// 최근 검색된 선수: [{ athleteID, name, datetime }]
				// mostSearchedAthletes: [], 				// 최다 검색된 선수: [{ athleteID, name, count }]
				// mostMeasuredAthletes: [], 				// 최다 측정한 사람: [{ athleteID, name, count }]
				// recentlySearchedTeams: [],				// 최다 검색된 팀: [{ teamID, name, count }]
				// recentlySearchedPools: [],				// 최다 검색된 수영장: [{ poolID, name, count }]
				// recentlySearchedCompetitions: [],	// 최다 검색된 대회: [{ competitionID, name, count }]
			};
	}
	/**
	 * loading 검색어 from 'search' 
	 * @param {*} query  : 오늘? 어제? 이번주? 이번월? 이번달?
	 * @param {*} limit 
	 * @returns 
	 */
	static loadSearchStatistics = async (query, limit=100) => {
		/**
		 * type keyword별로 count가 많은 순서로 limit만큼 가져옴
		 */
		let aggregate = [
			{ $match: query },
			{ $group: {
					_id: {
						db			: "$db",
						keyword	: "$keyword" // 그룹화 기준: keyword
					},
					datetime	: { $first: "$datetime" },
					totalCount: { $sum: "$count" } // count 합산
				}
			},
			{ $sort: { "totalCount": -1 } },// 합산된 count를 기준으로 내림차순 정렬
			{ $group: {
					_id: "$_id.db", // type별로 그룹화
					topKeywords: {
						$push: { // 각 type에서 keyword와 count를 배열로 저장
							datetime: "$datetime",
							keyword	: "$_id.keyword",
							count		: "$totalCount"
						}
					}
				}
			},
			{ $project: {
				db				: "$_id",
					datetime: 1,
					_id			: 0,
					search	: { $slice: ["$topKeywords", limit] } // 상위 2개만 선택
				}
			}
		];
		let result = await mongodb.aggregate(mongoCFG.Medalbank.search, aggregate);

		_statistics.searchCount = {};
		for (const search of result.data) {
			_statistics.searchCount[search.db] = search.search;
		}
		// console.log(_statistics.searchCount);

		/**
		 * type keyword별로 datetime이 최근인 순서로 limit만큼 가져옴
		 */
		aggregate = [
			{ $match: query },
			{ $sort: { datetime: -1 } }, // datetime 기준 내림차순 정렬 (최근 검색 우선)
			{ $group: {
					_id: {
						db			: "$db",
						keyword	: "$keyword"
					},
					latestEntry	: { $first: "$$ROOT" }, // 각 type-keyword 조합의 최신 검색
					totalCount	: { $sum: "$count" } // 각 type-keyword의 count 합산
				}
			},
			{ $group: {
					_id: "$_id.db", // type별로 그룹화
					recentKeywords: {
						$push: {
							keyword	: "$_id.keyword",
							datetime: "$latestEntry.datetime",
							count		: "$totalCount"
						}
					}
				}
			},
			{ $project: {
					db			: "$_id",
					_id			: 0,
					search	: { $slice: ["$recentKeywords", limit] } // 상위 2개의 검색어만 포함
				}
			}
		]
		result = await mongodb.aggregate(mongoCFG.Medalbank.search, aggregate);
		_statistics.searchRecent = {};
		for (const search of result.data) {
			_statistics.searchRecent[search.db] = search.search;
		}
		// console.log("_statistics.searchRecent=", _statistics.searchRecent);

		return _statistics;
	}
	/**
	 * loading views from reactions
	 * @param {*} query  : 오늘? 어제? 이번주? 이번월? 이번달?
	 * @param {*} limit 
	 */
	static loadViewsReactions = async (query, limit=100) => {
		const aggregate = [
			{ $match: query },
			{ $group: {
					_id: { dbType: "$dbType", dbID: "$dbID" }, // dbType과 dbID별로 그룹화
					count: { $sum: 1 }, // 각 그룹의 문서 수 계산
					name: { $first: "$name" },
				}
			},
			{ $sort: {
					"_id.dbType": 1, // dbType별 정렬
					count: -1        // count 기준 내림차순 정렬
				}
			},
			{ $group: {
					_id: "$_id.dbType", // dbType별로 그룹화
					reactions: {
						$push: {
							dbID: "$_id.dbID",
							count: "$count",
							name: "$name"
						}
					}
				}
			},
			{ $project: {
						type: "$_id",
					_id: 0,
					reactions: { $slice: ["$reactions", limit] } // 상위 10개의 dbID만 포함
				}
			}
		];
		const result = await mongodb.aggregate(mongoCFG.Medalbank.reactions, aggregate);
		for (const search of result.data) {
			_statistics[search.type] = search.reactions;
		}
		// console.log("_statistics: ", _statistics);

	}
	/**
	 * load 측정기록 from times
	 * @param {*} query : 오늘? 어제? 이번주? 이번월? 이번달?
	 * @param {*} limit 
	 */
	static loadMeasuredAthletes = async (query, limit=100) => {
		let aggregate = [
			{ $match: {
					...query,
					type: 'time',
					style: { $nin: ["freestyleRelay", "medleyRelay"] }
				}
			},
			{ $group: {
					_id: { athleteID: "$athleteID", name: "$name" }, // athleteID와 name으로 그룹화
					count: { $sum: 1 } // 각 그룹의 문서 수 계산
				}
			},
			{ $sort: { count: -1 } // count 기준 내림차순 정렬
			},
			{ $limit: 10 // 상위 10개만 반환
			},
			{ $project: {
					_id: 0, // _id 필드 제외
					athleteID: "$_id.athleteID", // athleteID 포함
					name: "$_id.name", // name 포함
					count: 1 // count 포함
				}
			}
		];

    let result = await mongodb.aggregate(mongoCFG.Medalbank.times, aggregate);

		//
		_statistics.measuredMost = result.data;
		// console.log("_statistics.measuredMost=", _statistics.measuredMost);

		aggregate = [
			{ $match: {
					...query,
					type: 'time',				
				}
			},
			{ $sort: { datetime: -1 } }, // datetime 기준으로 내림차순 정렬			
			{ $group: {
					_id: "$athleteID", // athleteID 기준으로 그룹화
					name: { $first: "$name" }, // 가장 최근 기록의 name 가져오기
					datetime: { $first: "$datetime" }, // 가장 최근 datetime 가져오기
					timeID: { $first: "$timeID" } // 가장 최근 timeID 가져오기 (필요 시)
				}
			},
			{ $sort: { datetime: -1 } }, // 그룹화 후, 최근 측정 순으로 정렬
			{ $limit: limit },// 상위 10명만 가져오기
			{ $project: {
					_id				: 0, // _id 필드 제외
					athleteID	: "$_id", // athleteID 포함
					name			: 1, // name 포함
					datetime	: 1 // datetime 포함
				}
			}
		];

    result = await mongodb.aggregate(mongoCFG.Medalbank.times, aggregate);
		//
		_statistics.measuredRecent = result.data;
		// console.log("_statistics.measuredRecent=", _statistics.measuredRecent);
	}
	/**
	 * 최근 합류한 선수 from 'athletes'
	 * @param {*} query 
	 * @param {*} limit 
	 */
	static loadAthleteJoined = async (query, limit=100) => {
		const context = {
			query			: query,
			projection: { _id:0, name:1, athleteID:1, joined:1 },
			limit			: limit,
			skip			: 0,
			sort			: { joined: -1 },
		};
		const result = await mongodb.find(mongoCFG.Medalbank.athletes, context);
		_statistics.joined = result.data;
	}
	static loadMemoryFromDB = async (limit=100) => {
			// const today = new Date();
			const today = new Date("2024-01-01");
			today.setHours(0, 0, 0, 0);  // 하루의 시작 시간으로 설정
			const tomorrow = new Date();
			tomorrow.setHours(0, 0, 0, 0);  // 하루의 시작 시간으로 설정
			tomorrow.setDate(tomorrow.getDate() + 1);
			const betweenDate = { $gte: today, $lt: tomorrow };
			const query = { datetime: betweenDate };

			await this.loadSearchStatistics	({ datetime: betweenDate }, limit);
			await this.loadMeasuredAthletes	({ datetime: betweenDate }, limit);
			await this.loadViewsReactions		({ datetime: betweenDate }, limit);
			await this.loadAthleteJoined		({ joined: betweenDate }, limit);

			_statistics.loaded = new Date();
			return _statistics;
	}
	/**
	 * update 검색어 from 'search' 
	 * @param {*} db : 'athletes', 'teams', 'pools', 'competitions', "times"
	 * @param {*} id : athleteID, teamID
	 * @param {*} userID 
	 * @param {*} keyword 
	 */
	static 	updateSearchStatistics = async (db, userID, keyword) => {
		const query = {
			db  		: db.trim(),
			userID 	: await utilHTTP.getUserID(userID),
			keyword	: keyword.trim(),
		};
		const value = {
			$set: {
				...query, // db, userID, keyword
				count		: 1,
				datetime: new Date(),
			},
			// $inc: { count: 1 }
		};
	
		const result = await mongodb.updateOneOp(mongoCFG.Medalbank.search, query, value);

		// this.updateMemoryAthletes(id, keyword);
	}

	/**
	 * update views to reactions
	 * @param {*} db : athlete, pool, team, time, competition
	 * @param {*} id : athleteID, poolID, teamID, timeID, competitionID
	 * @param {*} name : name
	 * @param {*} userID 
	 */
	static 	updateViewReactions = async (db, id, name, userID) => {
		const query = {
			dbType  : db.trim(),
			dbID	  : Number(id),
			userID	: await utilHTTP.getUserID(userID),
			keyword	: name.trim(),
		};
		const value = {
			$set: {
				...query, // db, id, keyword
				name		: name,
				views		: 1,
				datetime: new Date(),
			},
			// $inc: 1
		};

    await mongodb.updateOneOp(mongoCFG.Medalbank.reactions, query, value);

		this.updateViewsMemory(db, id, name);
	}
	static updateViewsAthletes		= ((id, name)=> this.updateViewReactions("athletes", id, name, userID));
	static updateViewsTimes				= ((id, name)=> this.updateViewReactions("times", id, name, userID));
	static updateViewsPools				= ((id, name)=> this.updateViewReactions("pools", id, name, userID));
	static updateViewsTeams				= ((id, name)=> this.updateViewReactions("times", id, name, userID));
	static updateViewsCompetitions= ((id, name)=> this.updateViewReactions("competitions", id, name, userID));
	/**
	 * update views to memory
	 * @param {*} db : athlete, pool, team, time, competition
	 * @param {*} id : athleteID, poolID, teamID, timeID, competitionID
	 * @param {*} name : name
	 * @returns 
	 */
	static updateViewsMemory = (db, id, name) => {
		// athleteID로 선수 찾기
		let index = _statistics[db].findIndex(a => a.id === id);
		
		if (index > 0) {
			// 선수가 존재하면 datetime 업데이트하고 count 증가
			_statistics[db][index].datetime = new Date(); //.toISOString().slice(0, 10);
			_statistics[db][index].count++;
			_statistics[db].sort((a, b) =>b.count-a.count);
		} else {
			// 선수가 존재하지 않으면 datetime 업데이트하고 count = 1
			const value = {
				id				: id,
				name			: name,
				count			: 1,
				datetime	: new Date(), //.toISOString().slice(0, 10),
			};
			_statistics[db].push(value);
		}
		return _statistics[db];
	}
	static updateAthletesMemory			= ((id, name)=> this.updateViewsMemory("athletes", id, name));
	static updateTimesMemory				= ((id, name)=> this.updateViewsMemory("times", id, name));
	static updateTeamsMemory				= ((id, name)=> this.updateViewsMemory("teams", id, name));
	static updatePoolsMemory				= ((id, name)=> this.updateViewsMemory("pools", id, name));
	static updateCompetitionsMemory	= ((id, name)=> this.updateViewsMemory("competitions", id, name));
	/**
	 * 
	 * @param {*} db : athlete, pool, team, time, competition
	 * @param {*} limit
	 * @returns 
	 */
	static getViewsMemory				= ((db, limit=8)=> _statistics[db].slice(0, limit));
	static getAthletesMemory		= ((limit=8) 		=> _statistics.athletes.slice(0, limit));
	static getTeamsMemory	 			= ((limit=8) 		=> _statistics.teams.slice(0, limit));
	static getPoolsMemory	 			= ((limit=8) 		=> _statistics.pools.slice(0, limit));
	static getTimesMemory	 			= ((limit=8) 		=> _statistics.times.slice(0, limit));
	static getCompetitionsMemory= ((limit=8) 		=> _statistics.competitions.slice(0, limit));

	static getMeasuredRecent = (limit=8) => {
		return _statistics.measuredRecent.slice(0, limit)
																			.reduce((arr, data)=>{
																				data.datetime = !data.datetime ? "" : new Date(data.datetime).toISOString().slice(0, 10);
																				arr.push(data);
																				return arr;
																			},[]);
	}
	static getMeasuredMost = (limit=8) => {
		return _statistics.measuredMost.slice(0, limit)
																		.reduce((arr, data)=>{
																			data.datetime = !data.datetime ? "" : new Date(data.datetime).toISOString().slice(0, 10);
																			arr.push(data);
																			return arr;
																		},[]);
	}
	static getSearchCount = (limit=8) => {
		const search = {};
		Object.keys(_statistics.searchCount).forEach(db => {
			search[db] = _statistics.searchCount[db].slice(0, limit)
																		.reduce((arr, data)=>{
																			data.datetime = !data.datetime ? "" : new Date(data.datetime).toISOString().slice(0, 10);
																			arr.push(data);
																			return arr;
																		},[]);
		});
		return search;
	}
	static getSearchRecent = (limit=8) => {
		const search = {};
		Object.keys(_statistics.searchRecent).forEach(db => {
			search[db] = _statistics.searchRecent[db].slice(0, limit)
																		.reduce((arr, data)=>{
																			data.datetime = !data.datetime ? "" : new Date(data.datetime).toISOString().slice(0, 10);
																			arr.push(data);
																			return arr;
																		},[]);
		});
		return search;
	}
	static getJoined = (limit=8) => {
			return _statistics.joined.slice(0, limit)
															.reduce((arr, data)=>{
																	data.count = data.joined ? new Date(data.joined).toISOString().slice(0, 10) : "";
																	data.datetime = data.joined ? new Date(data.joined).toISOString().slice(0, 10) : "";
																	delete data.joined;
																	arr.push(data);
																	return arr;
															},[]);
	}
	static getStatistics = async (limit=8) => {
			const today = new Date();
			if (_statistics.loaded.getFullYear() !== today.getFullYear() ||
					_statistics.loaded.getMonth()    !== today.getMonth() ||
					_statistics.loaded.getDate()     !== today.getDate()
			) {
				await this.loadMemoryFromDB();
			}

			const stat = {
				times         : this.getTimesMemory(limit),	    	// 최다 검색된 시간: [{ timeID, name, count }]
				athletes      : this.getAthletesMemory(limit),	  // 최근 검색된 선수: [{ athleteID, name, datetime }]
				teams         : this.getTeamsMemory(limit),	    	// 최다 검색된 팀: [{ teamID, name, count }]
				pools         : this.getPoolsMemory(limit),	    	// 최다 검색된 수영장: [{ poolID, name, count }]
				competitions  : this.getCompetitionsMemory(limit),// 최다 검색된 대회: [{ competitionID, name, count }]

				measuredRecent: this.getMeasuredRecent(limit),		// 최근 측정한 선수: [{ athleteID, name, datetime }]
				measuredMost	: this.getMeasuredMost(limit),			// 최다 측정한 선수: [{ athleteID, name, datetime }]
				searchCount   : this.getSearchCount(limit),				// 최다 검색어
				searchRecent  : this.getSearchRecent(limit),			// 최근 검색어
				joined    		: this.getJoined(limit),     				// 최근 합류한 선수
			};
			return stat;
	}
	//####################################################################
	//####################################################################
	//####################################################################
	//####################################################################
}

module.exports = StatisticsLibrary;

(async () => {
	if (_statistics.joined.length == 0) {
		await StatisticsLibrary.loadMemoryFromDB();
		console.log("statistics loaded...", _statistics.loaded);
	}
})();
