const mskCFG 			= require('../Config/mskCFG');
const mongoCFG 		= require('../Config/mongoCFG');
const mongoDB			= require('../Class/MongoDB');
const mongodb 		= new mongoDB(mongoCFG.Medalbank.database);

'use strict';

/*******************************************************
 * 
 * date library
 * 
 *******************************************************/
let _teamPoints = {
	"events" : 0,
	"season" : 0,
	"athletes" : 0,
	"start" : 0,
	"goldIndividual" : 0,
	"silverIndividual" : 0,
	"bronzeIndividual" : 0,
	"goldTeam" : 0,
	"silverTeam" : 0,
	"bronzeTeam" : 0
	// "events" : 10,
	// "season" : 10,
	// "athletes" : 0,
	// "start" : 10,
	// "goldIndividual" : 10,
	// "silverIndividual" : 5,
	// "bronzeIndividual" : 3,
	// "goldTeam" : 30,
	// "silverTeam" : 20,
	// "bronzeTeam" : 10
};


// const _staticStruct = {};
class TaemStatics {
	constructor() {
		this._staticStruct = {};
	}
	//-----------------------------
	// getter
	//-----------------------------
	get statics() 				{ return this._staticStruct; }

	//-----------------------------
	// set holiday(holiday)   { this._holidays.push(holiday); }
	//-----------------------------

	//--------------------------------------
	//  load team points: config
	//--------------------------------------
	async loadTeamPoints() {
		const result = await mongodb.findOne(mongoCFG.Medalbank.config, { type: "teamPoints" }, { _id:0, type:0, } );
		_teamPoints = result.data;
	}	
	
	clearStaticStruct() {
		//-----------------
		const statics = {};
		for (const style of mskCFG.styles) {
			statics[style] = {};
			//-----------------
			for (const gender of mskCFG.genders) {
				statics[style][gender] = {};
				//-----------------
				for (const distance of mskCFG.distances) {
					statics[style][gender][distance] = { athletes:0, start: 0, gold:0, silver:0, bronze:0, names: [] };
				}
				//-----------------
			}
			//-----------------
		}
		//-----------------
		this._staticStruct = statics;
		// return statics;
	}

	changeArray2Json(times) {
		const staticStruct = {};
		times.forEach((time) => {
			if (!staticStruct[time.teamID])                                         staticStruct[time.teamID] = {};
			if (!staticStruct[time.teamID][time.style])                            	staticStruct[time.teamID][time.style] = {};
			if (!staticStruct[time.teamID][time.style][time.gender])                staticStruct[time.teamID][time.style][time.gender] = {};
			if (!staticStruct[time.teamID][time.style][time.gender][time.distance]) staticStruct[time.teamID][time.style][time.gender][time.distance] = { athletes:0, start: 0, gold:0, silver:0, bronze:0, names: [] };
			staticStruct[time.teamID][time.style][time.gender][time.distance] = {
				athletes: time.athletes,
				start   : time.start,
				gold    : time.gold,
				silver  : time.silver,
				bronze  : time.bronze,
			};
		});
		return staticStruct;
	}

	async changeJson2Array(staticStruct, competitionID) {
		//-----> convert Object to array
		let staticArr =[];
		Object.keys(staticStruct).forEach(teamID => {
			const value = {
				teamID        : Number(teamID),
				team          : staticStruct[teamID]["team"],	// team name
				competitionID : competitionID,
				season        : staticStruct[teamID]["season"],	// team name
				teamPoints    : staticStruct[teamID].teamPoints,	// team points object
				rank          : 0,
				points        : 0,
			}
			staticArr.push(value);
		})
		return staticArr;

		// const teams = [];
		// Object.keys(staticStruct).forEach(teamID => {
		// 	Object.keys(staticStruct[teamID]).forEach(style => { 
		// 		Object.keys(staticStruct[teamID][style]).forEach(gender => {
		// 			Object.keys(staticStruct[teamID][style][gender]).forEach(distance => {
		// 				const statistic = staticStruct[teamID][style][gender][distance];
		// 				teams.push({
		// 					teamID        : Number(teamID),
		// 					competitionID : competitionID,
		// 					gender        : gender,
		// 					style         : style,
		// 					distance      : distance,
		// 					...statistic,
		// 				});
		// 			})     
		// 		})    
		// 	})  
		// })
		// return teams;
	}

	deleteNullTeamPoints(staticStruct) {		
		// delete names
		//-----> teamID
		for (const teamID of Object.keys(staticStruct)) {
			//-----> style
			for (const style of mskCFG.styles) {
				const checkStyle = staticStruct[teamID] && staticStruct[teamID][style];
				//-----> gender
				for (const gender of mskCFG.genders) {
					const checkGender = checkStyle && staticStruct[teamID][style][gender];
					//-----> distance
					for (const distance of mskCFG.distances) {
						if (checkGender && staticStruct[teamID][style][gender][distance]) {
							// delete names
							if (staticStruct[teamID][style][gender][distance].names) delete staticStruct[teamID][style][gender][distance].names;
							// delete null obj
							let ckeckNull = 0;
							Object.keys(staticStruct[teamID][style][gender][distance]).forEach(key => ckeckNull += staticStruct[teamID][style][gender][distance][key]);
							if (ckeckNull == 0) delete staticStruct[teamID][style][gender][distance];     
						}       
					}
					//-----
					if (checkGender && Object.keys(staticStruct[teamID][style][gender]).length == 0) delete staticStruct[teamID][style][gender];
				}
				//-----
				if (checkStyle && Object.keys(staticStruct[teamID][style]).length == 0) delete staticStruct[teamID][style];
			}
			//-----
			if (Object.keys(staticStruct[teamID]).length == 0) delete staticStruct[teamID];
		}
		//-----
		return staticStruct;
	}	

	async calculateTeamTotalPoints(staticStructArr, teamTotalPointOBJ) {

		//-----> team
		for (const team of staticStructArr) {
			if (team.teamPoints == undefined) continue;

			const teamPoints = team.teamPoints; // staticStructOBJ[teamID];
			let points= 0;
			let totalPoints = 0;
			if (!teamTotalPointOBJ[team.teamID]) {
				teamTotalPointOBJ[team.teamID] = {
					teamID: team.teamID,
					team: team.team,
					competitionID:0,
					events: 0,
					season: 0,
					points: 0,
					athletes: 0,
					start: 0,
					medals: { gold:0, silver:0, bronze:0 },
					teamPoints: {}
				};	
			}
			if (!teamTotalPointOBJ[team.teamID].start) {
				teamTotalPointOBJ[team.teamID].start = 0;
				teamTotalPointOBJ[team.teamID].events = 0;
				teamTotalPointOBJ[team.teamID].season = 0;
				teamTotalPointOBJ[team.teamID].points = 0;
				teamTotalPointOBJ[team.teamID].start = 0;
			}
			if (!teamTotalPointOBJ[team.teamID].medals) {
				teamTotalPointOBJ[team.teamID].medals = { gold:0, silver:0, bronze:0 };
			}
			if (!teamTotalPointOBJ[team.teamID].teamPoints) {
				teamTotalPointOBJ[team.teamID].teamPoints = {};
			}
			if (!teamTotalPointOBJ[team.teamID].best) {
				teamTotalPointOBJ[team.teamID].best = {};
			}
			teamTotalPointOBJ[team.teamID].points += team.points;
			teamTotalPointOBJ[team.teamID].athletes += team.athletes;
			teamTotalPointOBJ[team.teamID].events++;
			teamTotalPointOBJ[team.teamID].season += team.season || 0;
			teamTotalPointOBJ[team.teamID].start += team.start;
			teamTotalPointOBJ[team.teamID].medals.gold += team.medals.gold || 0;
			teamTotalPointOBJ[team.teamID].medals.silver += team.medals.silver || 0;
			teamTotalPointOBJ[team.teamID].medals.bronze += team.medals.bronze || 0;

			const totalPointOBJ = teamTotalPointOBJ[team.teamID].teamPoints;
			//-----> style
			for (const style of mskCFG.styles) {
				const checkStyle = teamPoints[style] != undefined;
				//-----> gender
				for (const gender of mskCFG.genders) {
					const checkGender = checkStyle && teamPoints[style][gender] != undefined;
					//-----> distance
					for (const distance of mskCFG.distances) {
						if (checkGender && teamPoints[style][gender][distance] != undefined) {
							if (!totalPointOBJ[style]) totalPointOBJ[style] = {};
							if (!totalPointOBJ[style][gender]) totalPointOBJ[style][gender] = {};
							if (!totalPointOBJ[style][gender][distance]) totalPointOBJ[style][gender][distance] = { best: { time: 999, }, athletes:0, season:0, start: 0, gold:0, silver:0, bronze:0 };
	
							Object.keys(teamPoints[style][gender][distance]).forEach(key => {
								if (key != "best") {
									totalPointOBJ[style][gender][distance][key] += teamPoints[style][gender][distance][key] || 0;
								}
							})
							if (totalPointOBJ[style][gender][distance].best.time > teamPoints[style][gender][distance].best.time) {
								totalPointOBJ[style][gender][distance].best = teamPoints[style][gender][distance].best;
							}
							delete teamPoints[style][gender][distance].best.time;
							
							if (teamPoints[style][gender][distance] &&
								teamPoints[style][gender][distance].start == 0) delete teamPoints[style][gender][distance];
							if (totalPointOBJ[style][gender][distance].start == 0) delete totalPointOBJ[style][gender][distance];
						}
					} // end for distance
					if (checkGender && Object.keys(teamPoints[style][gender]).length == 0) delete teamPoints[style][gender];
					if (totalPointOBJ[style] && totalPointOBJ[style][gender] && Object.keys(totalPointOBJ[style][gender]).length == 0) delete totalPointOBJ[style][gender];
				} // end for gender
				if (checkStyle && Object.keys(teamPoints[style]).length == 0) delete teamPoints[style];
				if (totalPointOBJ[style] && Object.keys(totalPointOBJ[style]).length == 0) delete totalPointOBJ[style];
			} // end for style

			delete teamPoints.points;

			teamTotalPointOBJ[team.teamID].teamPoints = totalPointOBJ;

			delete team.season;
			delete team.teamPoints.season;
			delete team.teamPoints.team;
		} // end for team
		
		const totalPointArr = Object.values(teamTotalPointOBJ);
		//-----> sort points desc
		totalPointArr.sort((a, b) => b.points-a.points)
		staticStructArr.sort((a, b) => b.points-a.points)

		// set staticStructArr.rank
		let rank = 1;
		let oldPoints = staticStructArr[0].points;
		staticStructArr.forEach(team => {
			if (team.points < oldPoints) rank++;
			oldPoints = team.points;
			team.rank = rank;
			team.pointsRelative = team.points / team.athletes;
		})
		
		// set totalPointArr.rank
		rank = 1;
		oldPoints = totalPointArr[0].points;
		totalPointArr.forEach(team => {
			if (team.points < oldPoints) rank++;
			oldPoints = team.points;
			team.rank = rank;
		})
		// await mongodb.deleteMany(mongoCFG.Medalbank.teamPoints, { teamID: 0})
		// await mongodb.insertMany(mongoCFG.Medalbank.teamPoints, staticStructArr)

		return [ ...totalPointArr, ...staticStructArr ];
	}

	
	async getTeamTotalPointOBJ(staticStruct) {
			
		const context = {
			query			: { competitionID:0 },
			// query			: { teamID: 0 },
			projection: { _id: 0 },
			limit			: 10000,
			skip			: 0,
		}
		const result = await mongodb.find(mongoCFG.Medalbank.teamPoints, context)
		// console.log("-----> ", result.data);
		const teamTotalPointOBJ = result.data.reduce((arr, item) => {
																					arr[item.teamID] = item;
																					return arr;
																				}, {});
		// console.log(teamTotalPointOBJ);

		return teamTotalPointOBJ;
	}

	//----------------------------------------------------
	// convert times to team statics struct
	//----------------------------------------------------
	async convertTimes2TeamStruct(context, competitionID) {
		const result = await mongodb.find(mongoCFG.Medalbank.times, context);
		if (result.data.length == 0) {
			console.log("competitionID=", competitionID, "times no data...");
			return;
		}

		let staticStruct = {};
		const bestPoints = {};
		const thisYear = new Date().getFullYear().toString();
		result.data.forEach((time) => { // { timeID, teamID, style, gender, distance, name, time, times, team, rank, datetime }
			if (!staticStruct[time.teamID]) {
				staticStruct[time.teamID] = {
					teamID: time.teamID,
					team: {
						teamID: time.teamID,
						team: time.team || time.name,
						competitionID: competitionID,
						names: [],
						season: time.datetime.slice(0, 4) == thisYear ? 1 : 0,
						points: 0,
						events: 1,
						athletes: 0,
						start: 0,
						medals: {
							gold: 0,
							silver: 0,
							bronze: 0
						}
					},
					// best: {},
				};
			}
			if (!staticStruct[time.teamID][time.style]) staticStruct[time.teamID][time.style] = {};
			if (!staticStruct[time.teamID][time.style][time.gender]) staticStruct[time.teamID][time.style][time.gender] = {};
			if (!staticStruct[time.teamID][time.style][time.gender][time.distance]) {
				staticStruct[time.teamID][time.style][time.gender][time.distance] = {
					names: [],
					athletes:0,
					start:0,
					season:0,
					gold:0,
					silver:0,
					bronze:0,
					best: { timeID: time.timeID, name:time.name, time:time.time, times:time.times, datetime:time.datetime }
				};
			}
			
			if (!staticStruct[time.teamID].team.names.includes(time.norm)) {
				staticStruct[time.teamID].team.names.push(time.norm);
				staticStruct[time.teamID].team.athletes++;
			}
			staticStruct[time.teamID].team.start++;

			const statics = staticStruct[time.teamID][time.style][time.gender][time.distance];
			if (statics.best.time > time.time) statics.best = { timeID: time.timeID, name:time.name, time:time.time, times:time.times, datetime:time.datetime };

			// 고유한 이름 추가
			if (!statics.names.includes(time.norm)) {
				statics.names.push(time.norm);
				statics.athletes++;
			}
			statics.start++;
		
			switch (time.rank) {
				case 1: statics.gold++;   staticStruct[time.teamID].team.medals.gold++; break;
				case 2: statics.silver++; staticStruct[time.teamID].team.medals.silver++; break;
				case 3: statics.bronze++; staticStruct[time.teamID].team.medals.bronze++; break;
			}

			//-----> caculate points
			staticStruct[time.teamID].team.points +=	_teamPoints.athletes * statics.athletes +	// 선수 수 * 0
																								_teamPoints.start * statics.start;	// 경기 수 * 10
					 
			if (time.style.includes("Relay")) {	// 단체전
				staticStruct[time.teamID].team.points +=	_teamPoints.goldTeam * statics.gold +
																									_teamPoints.silverTeam * statics.silver +
																									_teamPoints.bronzeTeam * statics.bronze;
			} else {	// 개인전
				staticStruct[time.teamID].team.points +=	_teamPoints.goldIndividual * statics.gold +
																									_teamPoints.silverIndividual * statics.silver +
																									_teamPoints.bronzeIndividual * statics.bronze;
			}
		});

		Object.keys(staticStruct).forEach(teamID => {
			delete staticStruct[teamID].team.names;
			const struct = staticStruct[teamID].team;
			struct.teamPoints = {};
			//-----------------------------
			for (const style of mskCFG.styles) {
				if (!staticStruct[teamID][style]) continue;
				//-----> gender
				for (const gender of mskCFG.genders) {
					if (!staticStruct[teamID][style][gender]) continue;
					//-----> distance
					for (const distance of mskCFG.distances) {
						if (!staticStruct[teamID][style][gender][distance]) continue;
						delete staticStruct[teamID][style][gender][distance].names;
						// delete staticStruct[teamID][style][gender][distance].best.time;						
					}
				}
				struct.teamPoints[style] = staticStruct[teamID][style];
			}
			staticStruct[teamID] = struct;
			//-----------------------------
			//---------------------
			// const bestPoints = {};
			// const best = Object.values(staticStruct[teamID].best);
			// // best athletes
			// best.sort((a,b) => b.athletes-a.athletes)
			// bestPoints.athletes = best.slice(0, 10).reduce((arr,data) => {
			// 																					arr.push({ name: data.name, count: data.athletes});
			// 																					return arr;
			// 																				}, []);
			// // best athletes
			// best.sort((a,b) => b.medals-a.medals)
			// bestPoints.medals = best.slice(0, 10).reduce((arr,data) => {
			// 																				arr.push({ name: data.name, count: data.medals});
			// 																				return arr;
			// 																			}, []);


			// staticStruct[teamID].best = bestPoints;
		});
		const struct = staticStruct.team;
		// struct.teamPoints = staticStruct;
		// delete struct.teamID;
		// delete struct.team;
		return { times: result.data, statics: staticStruct };
	}

	// best: { recently, athletes, rankings, medals }
	async buildTeamsBestMongo(teamID) {
		const best = { recently: "", athletes: [], rankings: [], medals: [] };
		const match = {
			style: { $nin: ["freestyleRelay", "medleyRelay"]},
			time: { $gt: 0 },
			teamID: { $ne: 185 }, // 개인 제외
			$or: [ {status: ""}, { status: { $exists: false }} ],
			fin: { $exists: false },
		};
		if (teamID) match.teamID = Number(teamID)

		// medals
		const aggregateMedals = [
			{ $match: match },
			// 팀 ID와 선수 이름으로 그룹화하여 각 선수의 메달 횟수 계산
			{ $group: {
					_id: { teamID: "$teamID", name: "$name" },
					count: {
						$sum: {
							$cond: [
								{ $in: ["$rank", [1, 2, 3]] },
								1,
								0
							]
						}
					}
				}
			},
			// 팀별로 그룹화하여 모든 선수 정보를 배열로 수집
			{ $group: {
					_id: "$_id.teamID",
					medals: {
						$push: {
							name: "$_id.name",
							count: "$count"
						}
					}
				}
			},
			// 각 팀의 메달리스트 배열을 펼치고 정렬
			{ $unwind: "$medals" },
			{ $sort: { "medals.count": -1 } },
			// 팀별로 상위 10명의 메달리스트 유지
			{ $group: {
					_id: "$_id",
					medals: {
						$push: "$medals"
					}
				}
			},
			{ $project: { medals: { $slice: ["$medals", 20] } } },
			// 최종 결과 형식을 지정
			{ $project: { _id: 0, teamID: "$_id", medals: 1 } }
		];
		let result = await mongodb.aggregate(mongoCFG.Medalbank.times, aggregateMedals);
		for (const medal of result.data) {
			const medals = [];
			for (let no=0; no<medal.medals.length; no++) {
				if (medal.medals[no].count == 0 || medals.length >= 10) break;
				medals.push(medal.medals[no]);
			}
			best[medal.teamID] = { recently: "", athletes: [], rankings: [], medals: medals };
		}	

		// athletes
		const aggregateAthletes = [
			{ $match: match },
			// 팀 ID와 선수 이름으로 그룹화하여 각 선수의 등장 횟수(count)를 계산
			{ $group: {
					_id: {
						teamID: "$teamID",
						name: "$name"
					},
					count: { $sum: 1 }
				}
			},
			// 팀별로 그룹화하여 모든 선수 정보를 배열로 수집
			{ $group: {
					_id: "$_id.teamID",
					athletes: {
						$push: {
							name: "$_id.name",
							count: "$count"
						}
					}
				}
			},
			// 각 팀의 선수 배열을 펼치고 정렬
			{ $unwind: "$athletes" },
			{ $sort: { "athletes.count": -1 } },
			// 팀별로 상위 10명의 선수만 유지
			{ $group: {
					_id: "$_id",
					athletes: {
						$push: "$athletes"
					}
				}
			},
			{ $project: {
					athletes: { $slice: ["$athletes", 10] }
				}
			},
			// 최종 결과 형식을 지정
			{ $project: {
					_id: 0,
					teamID: "$_id",
					athletes: 1
				}
			}
		];
		result = await mongodb.aggregate(mongoCFG.Medalbank.times, aggregateAthletes);
		for (const athlete of result.data) {
			const athletes = [];
			for (let no=0; no<athlete.athletes.length; no++) {
				if (athlete.athletes[no].count == 0 || athletes.length >= 10) break;
				athletes.push(athlete.athletes[no]);
			}
			best[athlete.teamID].athletes = athletes;
		}	

		// rankings
		const aggregateRankings = [
			{ $match: match },
			// 각 문서를 teamID, gender, style, distance로 그룹화하여 time이 작은 순서대로 정렬
			{ $sort: { time: 1 } },
			{ $group: {
					_id: { teamID: "$teamID", gender: "$gender", style: "$style", distance: "$distance" },
					rankings: {
						$push: {
							timeID: "$timeID",
							name: "$name",
							competitionID: "$competitionID",
							times: "$times",
							datetime: "$datetime"
						}
					}
				}
			},
			// 각 그룹별로 상위 20명만 유지
			{ $project: {
					_id: 0,
					teamID: "$_id.teamID",
					gender: "$_id.gender",
					style: "$_id.style",
					distance: "$_id.distance",
					rankings: { $slice: ["$rankings", 10] }
				}
			},
			// 팀별로 데이터를 그룹화하여 각 팀의 데이터를 배열로 수집
			{ $group: {
					_id: "$teamID",
					data: {
						$push: {
							gender: "$gender",
							style: "$style",
							distance: "$distance",
							rankings: "$rankings"
						}
					}
				}
			},
			// 최종 결과 형식을 지정
			{ $project: { _id: 0, teamID: "$_id", data: 1 } }
		];
		result = await mongodb.aggregate(mongoCFG.Medalbank.times, aggregateRankings);
		for (const ranking of result.data) {
			const rankings = [];
			for (let no=0; no<ranking.data.length; no++) {
				if (rankings.length >= 10) break;
				rankings.push(ranking.data[no]);
			}
			best[ranking.teamID].rankings = rankings;
		}

		// recently
		const aggregateRecently = [
			{ $match: match },
			// 팀별로 그룹화하여 가장 최근 datetime을 찾음
			{ $group: {
					_id: "$teamID",
					mostRecentDatetime: { $max: "$datetime" }
				}
			},
			// 결과 형식을 지정
			{ $project: {
					_id: 0,
					teamID: "$_id",
					datetime: "$mostRecentDatetime"
				}
			}
		];
		result = await mongodb.aggregate(mongoCFG.Medalbank.times, aggregateRecently);
		for (const recently of result.data) {
			best[recently.teamID].recently = recently.datetime;
		}	
		return best;
	}
	//------------------------------------
	async buildTeamsBest(times) {

		const best = {};
		const records = {};
		for (const time of times) {
			if (!best[time.teamID]) best[time.teamID] = { oldDate: "0000-00-00", recently: "", athletes: {}, top3: {}, };
			// recently
			if (best[time.teamID].oldDate < time.datetime) {
				best[time.teamID].oldDate = time.datetime;
				best[time.teamID].recently = time.datetime
			}

			// athletes
			if (!best[time.teamID].athletes[time.norm]) best[time.teamID].athletes[time.norm] = { name: time.name, athletes: 0, medals: 0 };
			best[time.teamID].athletes[time.norm].athletes++;

			// medals
			if (time.rank <= 3) {
				// if (!best[time.timeID].medals[time.norm]) best[time.timeID].medals[time.norm] = { name: time.norm, count: 0 };
				best[time.teamID].athletes[time.norm].medals++;
			}

			// top3
			const discipline = `${time.gender}-${time.style}-${time.distance}`
			if (!records[discipline]) records[discipline] = { time: 999 };
			if (records[discipline].time > time.time) records[discipline] = { teamID: time.teamID, time: time.time };
			if (!best[time.teamID].top3[discipline]) best[time.teamID].top3[discipline] = [];
			best[time.teamID].top3[discipline].push({
																							timeID				: time.timeID,
																							name					: time.name,
																							time					: time.time,
																							times					: time.times,
																							datetime			: time.datetime,
																							competitionID	: time.competitionID,
																						});
		} // end for

		const recordOBJ = {};
		Object.keys(records).forEach(discipline => {
			const arr = (discipline+"--").split("-");
			if (!recordOBJ[records[discipline].teamID]) recordOBJ[records[discipline].teamID] = [];
			recordOBJ[records[discipline].teamID].push({ gender: arr[0], style: arr[1], distance: arr[2], });
		})
		// console.log("---", recordOBJ);

		// get medals
		const struct = {};
		const top3 = {};
		for (const teamID of Object.keys(best)) {
			struct[teamID] = { recently: best[teamID].recently, athletes: [], medals: [], rankings: [], top3: [] };
			// rankings
			if (recordOBJ[teamID]) struct[teamID].rankings = recordOBJ[teamID];

			// top3
			for (const discipline of Object.keys(best[teamID].top3)) {
				const arr = (discipline+"--").split("-");
				const ranking = {
					gender: arr[0],
					style: arr[1],
					distance: arr[2],
					times: best[teamID].top3[discipline].map(el => el).sort((a,b)=>a.time-b.time).slice(0, 3),
				}
				if (!top3[teamID]) top3[teamID] = [];
				top3[teamID].push(ranking);
			}
			best[teamID].top3 = mskCFG.sortGenderStyleDistance(top3[teamID]);
			for (const data of best[teamID].top3) {
				let tm = data.times[0].time;
				let rank = 1;
				for (const time of data.times) {
					if (tm < time.time) { rank++; tm = time.time; }
					time.rank = rank;
					delete time.time;
				}
			}

			best[teamID].athletes = Object.values(best[teamID].athletes);

			best[teamID].athletes.sort((a,b) => b.athletes-a.athletes)
			let athleteArr = [];
			for (const athlete of best[teamID].athletes) athleteArr.push( { name:athlete.name, count: athlete.athletes } );
			athleteArr = athleteArr.slice(0, 10);

			best[teamID].athletes.sort((a,b) => b.medals-a.medals)
			let medalArr = [];
			for (const athlete of best[teamID].athletes) medalArr.push( { name:athlete.name, count: athlete.medals } );
			medalArr = medalArr.slice(0, 10);

			best[teamID].athletes = athleteArr
			best[teamID].medals = medalArr
			best[teamID].rankings = struct[teamID].rankings 
		}

		console.log("+++++", best["128"]);
		return best;
	}
	//--------------------------------------
	//  times -> team statics
	//--------------------------------------
	async buildTimes2TeamStatic(context, competitionID) {		
		//-----> convert times to team statics struct
		const result = await this.convertTimes2TeamStruct(context, competitionID);
		if (!result.statics) return;
		 let staticStruct = result.statics;

		if (staticStruct == undefined) {
			console.log(`competitionID:${competitionID}: no data!!`);
			return;
		}
		console.log(`competitionID:${competitionID}: teams.`, Object.keys(staticStruct).length);
		//-----> get team total points: teamPoints.competitionID: 0
		const teamTotalPointOBJ = await this.getTeamTotalPointOBJ(staticStruct);

		//-----> convert Object to Array
		const teamArr = Object.values(staticStruct); //await this.changeJson2Array(staticStruct, competitionID);
			
		//-----> calculate points, sort
		staticStruct = await this.calculateTeamTotalPoints(teamArr, teamTotalPointOBJ);

		// best: { recently, athletes, rankings, medals }
		// const best = await this.buildTeamsBestMongo();
		const best = await this.buildTeamsBest(result.times);
		for (let no=0; no< staticStruct.length; no++) {
			if (staticStruct[no].competitionID > 0) continue;
			const teamID = staticStruct[no].teamID;
			staticStruct[no].pointsRelative = staticStruct[no].points / staticStruct[no].athletes;
			if (best[teamID]) {
				delete best[teamID].oldDate;
				staticStruct[no].best = best[teamID];
			}
			else {
				// console.log("----->", teamID);
			}
		}
		
		//-----> update teamPoints
		await mongodb.deleteMany(mongoCFG.Medalbank.teamPoints, { competitionID: { $in: [ 0, competitionID ], } });

		//-----> insert teamPoints
		await mongodb.insertMany(mongoCFG.Medalbank.teamPoints, staticStruct );

		return staticStruct;
	}
	
	async buildTimes2TeamStaticStruct(competitionID) {
		const context = {
			query: {
				// style: { $nin: ["freestyleRelay", "medleyRelay"] },
				competitionID : competitionID,
				teamID: { $ne: 185 }, // 개인 제외
				$or: [ { status: { $exists: false } },{ status: "" }, ] ,
				time: { $gt: 0 },
				fin: { $exists: false },
			},
			projection: {_id:0, name:1, norm:1, style:1, gender:1, distance:1, course:1, time:1, times:1, rank:1, timeID:1, team:1, teamID:1, competitionID:1, datetime:1 },
			limit: 5000,
			skip: 0,
		}
		const staticStruct = await this.buildTimes2TeamStatic(context, competitionID);

		return staticStruct;
	}
	
	async buildTimes2TeamStaticStructAll() {
		const query = {
			$or: [ { status: { $exists: false } },{ status: "" }, ] ,
			time: { $gt: 0 },
			teamID: { $ne: 185 } // 개인 제외
		};
		query.competitionID = { $nin: [1,2,3,4,5,6,7] };
		const context = {
			query: query,
			projection: {_id:0, name:1, style:1, gender:1, distance:1, course:1, rank:1, timeID:1, team:1, teamID:1, competitionID:1, datetime:1 },
			limit: 5000,
			skip: 0,
		}
		const staticStruct = await this.buildTimes2TeamStatic(context);

		return staticStruct;
	}
	
}

module.exports = TaemStatics;


(async () => {
	const teamStatics	= new TaemStatics();
	await teamStatics.loadTeamPoints();
})();