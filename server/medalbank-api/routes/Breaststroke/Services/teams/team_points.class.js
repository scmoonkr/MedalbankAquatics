const mskCFG 			= require('../../Config/mskCFG');
const mongoCFG 		= require('../../Config/mongoCFG');
const mongoDB			= require('../../Class/MongoDB');
const mongodb 		= new mongoDB(mongoCFG.Breaststroke.database);

const MemoryDB 		= require('../../Class/MemoryDB');
const memoryDB		= new MemoryDB();

'use strict';

/*******************************************************
 * 
 * date library
 * 
 *******************************************************/
let _teamPoints = {
	"events": 0,
	"season": 0,
	"athletes": 0,
	"start": 0,
	"goldIndividual": 0,
	"silverIndividual": 0,
	"bronzeIndividual": 0,
	"goldTeam": 0,
	"silverTeam": 0,
	"bronzeTeam": 0
};

function mergeStaticArray(newPoints, points ) {
	newPoints = [ ...newPoints, ...points ];
	const pointArr = {};
	for (const team of newPoints) {
		const teamComp = `${team.teamID}-${team.competitionID}`;
		if (!pointArr[team.teamID]) { pointArr[teamComp] = team; continue; }

		pointArr[teamComp].season 	+= team.season;
		pointArr[teamComp].points 	+= team.points;
		pointArr[teamComp].events 	+= team.events;
		pointArr[teamComp].athletes+= team.athletes;
		pointArr[teamComp].start 	+= team.start;
		
		// teamPoints
		for (const style of mskCFG.styles) {
			if (!pointArr[teamComp][style]) pointArr[teamComp][style] = {};
			//-----------------
			for (const gender of mskCFG.genders) {
				if (!pointArr[teamComp][style][gender]) pointArr[teamComp][style][gender] = {};
				//-----------------
				for (const distance of mskCFG.distances) {
					if (!pointArr[teamComp][style][gender][distance]) pointArr[teamComp][style][gender][distance] = { athletes:0, start: 0, gold:0, silver:0, bronze:0, best: { time: 99 } };

					const teamPtr = pointArr[teamComp][style][gender][distance];
					teamPtr.athletes+= team.teamPoints[style][gender][distance].athletes;
					teamPtr.start 	+= team.teamPoints[style][gender][distance].start;
					teamPtr.gold 		+= team.teamPoints[style][gender][distance].gold;
					teamPtr.silver 	+= team.teamPoints[style][gender][distance].silver;
					teamPtr.bronze 	+= team.teamPoints[style][gender][distance].bronze;
					if (teamPtr.best.time > team.teamPoints[style][gender][distance].best.time) {
						teamPtr.best = team.teamPoints[style][gender][distance].best;
					}
				} // end distance
				//-----------------
			} // end gender
			//-----------------
		} // end style
	} // end teams
	return Object.values(pointArr);
}

function mergeStaticArrayNew(newPoints ) {
	// newPoints = [ ...newPoints, ...points ];
	const pointArr = {};
	for (const team of newPoints) {
		const teamComp = `${team.teamID}-${team.competitionID}`;
		if (!pointArr[team.teamID]) { pointArr[teamComp] = team; continue; }

		// pointArr[teamComp].season 	+= team.season;
		// pointArr[teamComp].points 	+= team.points;
		// pointArr[teamComp].events 	+= team.events;
		// pointArr[teamComp].athletes+= team.athletes;
		// pointArr[teamComp].start 	+= team.start;
		
		// teamPoints
		for (const style of mskCFG.styles) {
			if (!pointArr[teamComp][style]) pointArr[teamComp][style] = {};
			//-----------------
			for (const gender of mskCFG.genders) {
				if (!pointArr[teamComp][style][gender]) pointArr[teamComp][style][gender] = {};
				//-----------------
				for (const distance of mskCFG.distances) {
					if (!pointArr[teamComp][style][gender][distance]) pointArr[teamComp][style][gender][distance] = { athletes:0, start: 0, gold:0, silver:0, bronze:0, best: { time: 99 } };

					const teamPtr = pointArr[teamComp][style][gender][distance];
					teamPtr.athletes+= team.teamPoints[style][gender][distance].athletes;
					teamPtr.start 	+= team.teamPoints[style][gender][distance].start;
					teamPtr.gold 		+= team.teamPoints[style][gender][distance].gold;
					teamPtr.silver 	+= team.teamPoints[style][gender][distance].silver;
					teamPtr.bronze 	+= team.teamPoints[style][gender][distance].bronze;
					if (teamPtr.best.time > team.teamPoints[style][gender][distance].best.time) {
						teamPtr.best = team.teamPoints[style][gender][distance].best;
					}
				} // end distance
				//-----------------
			} // end gender
			//-----------------
		} // end style
	} // end teams
	return Object.values(pointArr);
}
async function getTotalRecords() {
	const aggregate = [
		{ $match: { time: { $gt: 0 } } },
		{
			// 먼저 teamID, gender, style, distance로 그룹화하고, 각 그룹에 대해 time을 기준으로 정렬
			$sort: { time: 1 }
		},
		{
			// teamID, gender, style, distance별로 그룹화하여 상위 10개 time을 선택
			$group: {
				"_id": {
					teamID: "$teamID",
					gender: "$gender",
					style: "$style",
					distance: "$distance"
				},
				topTimes: {
					$push: {
						timeID: "$timeID",
						gender: "$gender",
						style: "$style",
						distance: "$distance",
						name: "$name",
						times: "$times",
						rank: "$rank",
						datetime: "$datetime",
						teamID: "$teamID",
						team: "$team",
						competitionID: "$competitionID"
					}
				}
			}
		},
		{
			// 각 그룹에서 상위 10개의 항목을 자르기
			$project: {
				topTimes: { $slice: ["$topTimes", 10] }
			}
		},
		{
			// 결과 형식을 평평하게 펼치기
			$unwind: "$topTimes"
		},
		{
			$replaceRoot: { newRoot: "$topTimes" }
		}
	];
	const result = await mongodb.aggregate(mongoCFG.Breaststroke.times, aggregate);
	const teamOBJ = {}
	for (const time of result.data) {
		if (!teamOBJ[time.teamID]) teamOBJ[time.teamID] = {};
		if (!teamOBJ[time.teamID][time.style]) teamOBJ[time.teamID][time.style] = {};
		if (!teamOBJ[time.teamID][time.style][time.gender]) teamOBJ[time.teamID][time.style][time.gender] = {};
		if (!teamOBJ[time.teamID][time.style][time.gender][time.distance]) teamOBJ[time.teamID][time.style][time.gender][time.distance] = {
																																																					teamID	: time.teamID,
																																																					team		: time.team,
																																																					style		: time.style,
																																																					gender	: time.gender,
																																																					distance: time.distance,
																																																					competitionID: time.competitionID,
																																																					times: [],
																																																				};
		
		teamOBJ[time.teamID][time.style][time.gender][time.distance].times.push(time)
	}
	return teamOBJ;
}
async function getTotalAthletes() {
	const aggregate = [
		{ $match: { time: { $gt: 0 }, style: { $nin: ["freestyleRelay","medleyRelay"] } } },
		{
			// 각 팀과 이름으로 그룹화하고, 문서 수(count)를 셉니다.
			$group: {
				"_id": {
					teamID: "$teamID",
					name: "$name"
				},
				count: { $sum: 1 },
				details: { $first: "$$ROOT" }
			}
		},
		{
			// count를 기준으로 내림차순으로 정렬합니다.
			$sort: { count: -1 }
		},
		{
			// 팀 ID별로 그룹화하고, 상위 10개의 이름을 선택합니다.
			$group: {
				"_id": "$_id.teamID",
				topNames: {
					$push: {
						timeID: "$details.timeID",
						name: "$_id.name",
						teamID: "$_id.teamID",
						count: "$count"
					}
				}
			}
		},
		{
			// 각 그룹에서 상위 10개의 항목만 선택합니다.
			$project: {
				topNames: { $slice: ["$topNames", 10] }
			}
		},
		{
			// topNames 배열을 평탄화합니다.
			$unwind: "$topNames"
		},
		{
			// 최종 결과로 topNames의 내용을 루트로 설정합니다.
			$replaceRoot: { newRoot: "$topNames" }
		}
	];
	const result = await mongodb.aggregate(mongoCFG.Breaststroke.times, aggregate);
	const teamOBJ = {}
	for (const time of result.data) {
		if (!teamOBJ[time.teamID]) teamOBJ[time.teamID] = [];
		
		teamOBJ[time.teamID].push({ name: time.name, count: time.count })
	}
	return teamOBJ;
}
async function getTotalMedals() {
	const aggregate = [
		{ $match: { time: { $gt: 0 }, style: { $nin: ["freestyleRelay","medleyRelay"] }, rank: { $in: [1, 2, 3] } } },
		{
			$group: {
				"_id": {
					teamID: "$teamID",
					name: "$name"
				},
				rankCount: { "$sum": 1 },
				details: { "$first": "$$ROOT" }
			}
		},
		{ $sort: { "rankCount": -1 } },
		{
			$group: {
				"_id": "$_id.teamID",
				topRanks: {
					$push: {
						name: "$_id.name",
						teamID: "$_id.teamID",
						count: "$rankCount"
					}
				}
			}
		},
		{ $project: { topRanks: { $slice: ["$topRanks", 10] } } },
		{ $unwind: "$topRanks" },
		{ $replaceRoot: { newRoot: "$topRanks" } }
	];
	const result = await mongodb.aggregate(mongoCFG.Breaststroke.times, aggregate);
	const teamOBJ = {}
	for (const time of result.data) {
		if (!teamOBJ[time.teamID]) teamOBJ[time.teamID] = [];
		
		teamOBJ[time.teamID].push({ name: time.name, count: time.count })
	}
	return teamOBJ;
}
async function getTotalSeason() {
	const aggregate = [
		{ $match: { time: { $gt: 0 }, style: { $nin: ["freestyleRelay","medleyRelay"] } } },
		{
			// datetime 필드의 연도가 2024년인 문서만 선택
			$match: {
				time: { $gt: 0 }, style: { $nin: ["freestyleRelay","medleyRelay"] }, 
				$expr: {
					$eq: [{ "$year": { "$dateFromString": { "dateString": "$datetime" } } }, 2024]
				}
			}
		},
		{
			// teamID와 name으로 그룹화하고 각 그룹의 문서 수(count)를 셈
			$group: {
				"_id": {
					teamID: "$teamID",
					name: "$name"
				},
				count: { "$sum": 1 },
				details: { "$first": "$$ROOT" }
			}
		},
		{
			// count를 기준으로 내림차순으로 정렬
			$sort: { "count": -1 }
		},
		{
			// teamID별로 그룹화하여 상위 10개의 이름을 선택
			$group: {
				"_id": "$_id.teamID",
				topNames: {
					$push: {
						name: "$_id.name",
						teamID: "$_id.teamID",
						count: "$count"
					}
				}
			}
		},
		{
			// 각 그룹에서 상위 10개의 항목만 선택
			$project: {
				topNames: { $slice: ["$topNames", 10] }
			}
		},
		{
			// topNames 배열을 평탄화
			$unwind: "$topNames"
		},
		{
			// 최종 결과로 topNames의 내용을 루트로 설정
			$replaceRoot: { "newRoot": "$topNames" }
		}
	];
	const result = await mongodb.aggregate(mongoCFG.Breaststroke.times, aggregate);
	const teamOBJ = {}
	for (const time of result.data) {
		if (!teamOBJ[time.teamID]) teamOBJ[time.teamID] = [];
		
		teamOBJ[time.teamID].push({ name: time.name, count: time.count })
	}
	return teamOBJ;
}
async function getLatest() {
	const aggregate = [
		{ $match: { time: { $gt: 0 } } },
		{
			// teamID별로 그룹화하고 가장 최근 datetime을 찾습니다.
			$group: {
				"_id": "$teamID",
				latestDatetime: { $max: "$datetime" },
				details: { "$first": "$$ROOT" }
			}
		},
		{
			// 최신 datetime 기준으로 정렬합니다.
			$sort: { "latestDatetime": -1 }
		},
		{
			// 필요한 필드만 포함하도록 프로젝트 합니다.
			$project: {
				"_id": 0,
				teamID: "$_id",
				latestDatetime: 1
			}
		}
	];
	const result = await mongodb.aggregate(mongoCFG.Breaststroke.times, aggregate);
	const teamOBJ = {}
	for (const time of result.data) {
		teamOBJ[time.teamID] = time.latestDatetime;
	}
	return teamOBJ;
}
async function getRankings() {
	const context = {
		query			: { rank:1 },
		projection: { _id:0, timeID:1, masters:1, adult:1, teamID:1, name:1, style:1, gender:1, distance:1, times:1, competitionID:1, },
		limit			: 200, skip: 0
	};
	const result = await mongodb.find(mongoCFG.Breaststroke.leaderboard, context);
	const teamOBJ = result.data.reduce((obj, data) => {
																if (!obj[data.teamID]) obj[data.teamID] = []
																obj[data.teamID].push(data);
																return obj;
															}, {})
	return teamOBJ;
}

// const _staticStruct = {};
class TeamPointsClass {
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
		const result = await mongodb.findOne(mongoCFG.Breaststroke.config, { type: "teamPoints" }, { _id:0, type:0, } );
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
				year          : staticStruct[teamID]["year"],	// team name
				season        : staticStruct[teamID]["season"],	// team name
				competitionID : competitionID,
				teamPoints    : staticStruct[teamID],	// team points object
				// medals   			: staticStruct[teamID]["medals"],
				// best    			: staticStruct[teamID]["best"],
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

	async changeJson2ArrayNew(staticStruct, competitionID) {
		//-----> convert Object to array
		let staticArr =[];
		Object.keys(staticStruct).forEach(teamID => {
			const value = {
				teamID        : Number(teamID),
				team          : staticStruct[teamID]["team"],	// team name
				year          : staticStruct[teamID]["year"],	// team name
				season        : staticStruct[teamID]["season"],	// team name
				competitionID : competitionID,
				teamPoints    : staticStruct[teamID],	// team points object
				// medals   			: staticStruct[teamID]["medals"],
				// best    			: staticStruct[teamID]["best"],
				// rank          : 0,
				// points        : 0,
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

	

	async getTeamTotalPointOBJ() {		
		const result = {};
		// result.records = await getTotalRecords();
		result.athletes = await getTotalAthletes();
		result.medals = await getTotalMedals();
		result.season = await getTotalSeason();
		result.recently = await getLatest();
		result.rankings = await getRankings();

		return result;
	}

	//-------------------------------------------
	//	rank: gender-style-distance
	//-------------------------------------------
	assignRanks(times, field="time", sort=asc) {
		// First, let's sort the times array in ascending order of time
		times.sort((a, b) => sort == "asc" ? a[field] - b[field] : b[field] - a[field]);
	
		// Initialize variables to keep track of rank and previous time
		let rank = 1;
		let prevTime = times[0][field];
	
		// Loop through the times array and assign ranks
		let before = times[0][field];
		for (let i = 0; i < times.length; i++) {
			if (times[i][field] !== prevTime) {
				rank = i + 1;
				prevTime = times[i][field];
			}
			if (times[i].times) {
				times[i].rank = rank;
			}
			before = times[i][field];
	
			// times[i] = customizing(times[i]);
		}
	
		return times;
	}


	async calculateTeamTotalPoints111(staticStructArr) {
		const context = {
			query			: { competitionID: { $gt: 0 } },
			projection: { _id:0, },
			limit			: 50000,
			skip			: 0
		};
		const result = await mongodb.find(mongoCFG.Breaststroke.teamPoints, context);

		staticStructArr = mergeStaticArray(staticStructArr, result.data);

		const totalBestOBJ = await this.getTeamTotalPointOBJ();
		
		const teamTotalPointOBJ = {};
		//-----> team
		for (const team of staticStructArr) {
			if (!teamTotalPointOBJ[team.teamID]) {
				teamTotalPointOBJ[team.teamID] = {
					teamID				: team.teamID,
					team					: team.team,
					competitionID	: 0,
					events				: 0,
					season				: 0,
					points				: 0,
					rank					: 0,
					athletes			: 0,
					start					: 0,
					medals: {
							gold	:0,
							silver:0,
							bronze:0
					},
					best	: {
						recently: "0000-00-00", // 최근 시합 "0000-00-00"
						rankings: {},	// 기록 보유
						athletes: {}, // 주요 영법별 인물	1:{ "timeID":0, "name": "", "count": 0 }
						start		: {}, // 팀을 위해 가장 많이 뛴 선수 10명 1:{ "timeID":0, "name": "", "count": 0 }
						season	: {}, // 이번 시즌 팀을 위해 가장 많이 뛴 선수 10명 1:{ "timeID":0, "name": "", "count": 0 }
						medals	: {}, // 팀을 위해 메달을 획득한 선수 10명 1:{ "timeID":0, "name": "", "count": 0 }
					},
					teamPoints: {},
				};
			}

			teamTotalPointOBJ[team.teamID].events 	+= team.events 	|| 0;
			teamTotalPointOBJ[team.teamID].season 	+= team.season 	|| 0;
			teamTotalPointOBJ[team.teamID].athletes += team.athletes|| 0;
			teamTotalPointOBJ[team.teamID].start 		+= team.start 	|| 0;
			teamTotalPointOBJ[team.teamID].points		+= team.points 	|| 0;

			//-----> style
			for (const style of mskCFG.styles) {
				if (!team.teamPoints[style]) continue;
				teamTotalPointOBJ[team.teamID].teamPoints[style] = teamTotalPointOBJ[team.teamID].teamPoints[style] || {};
				teamTotalPointOBJ[team.teamID].best = teamTotalPointOBJ[team.teamID].best || {};
				//-----> gender
				for (const gender of mskCFG.genders) {
					if (!team.teamPoints[style][gender]) continue;
					teamTotalPointOBJ[team.teamID].teamPoints[style][gender] = teamTotalPointOBJ[team.teamID].teamPoints[style][gender] || {};
					//-----> distance
					for (const distance of mskCFG.distances) {						
						if (!team.teamPoints[style][gender][distance]) continue;
						if (!teamTotalPointOBJ[team.teamID].teamPoints[style][gender][distance]) {
							teamTotalPointOBJ[team.teamID].teamPoints[style][gender][distance] = { athletes:0, start:0, gold:0, silver:0, bronze:0, best: { time: 999  } };
						}
						const teamOBJ = team.teamPoints[style][gender][distance];
						
						teamTotalPointOBJ[team.teamID].medals.gold 		+= teamOBJ.gold;
						teamTotalPointOBJ[team.teamID].medals.silver 	+= teamOBJ.silver;
						teamTotalPointOBJ[team.teamID].medals.bronze 	+= teamOBJ.bronze;

						const totalOBJ = teamTotalPointOBJ[team.teamID].teamPoints[style][gender][distance];
						totalOBJ.athletes	+= teamOBJ.athletes;
						totalOBJ.start 		+= teamOBJ.start;
						totalOBJ.gold 		+= teamOBJ.gold;
						totalOBJ.silver 	+= teamOBJ.silver;
						totalOBJ.bronze 	+= teamOBJ.bronze;

						totalOBJ.best = totalOBJ.best || { time: 99 }
						teamOBJ.best = teamOBJ.best || { time: 99 }
						if (totalOBJ.best.time > teamOBJ.best.time) totalOBJ.best = teamOBJ.best;
					} // end for distance
				} // end for gender
			} // end for style
			if (totalBestOBJ.recently[team.teamID]) {
				teamTotalPointOBJ[team.teamID].best.rankings 	= totalBestOBJ.rankings[team.teamID] || [];
				teamTotalPointOBJ[team.teamID].best.recently 	= totalBestOBJ.recently[team.teamID] || [];
				// teamTotalPointOBJ[team.teamID].best.records		= totalBestOBJ.records[team.teamID] || [];
				teamTotalPointOBJ[team.teamID].best.athletes	= totalBestOBJ.athletes[team.teamID] || [];
				// teamTotalPointOBJ[team.teamID].best.start			= totalBestOBJ.start[team.teamID] || [];
				teamTotalPointOBJ[team.teamID].best.season		= totalBestOBJ.season[team.teamID] || [];
				teamTotalPointOBJ[team.teamID].best.medals		= totalBestOBJ.medals[team.teamID] || [];
			}
		}

		const teamTotalPointArr = Object.values(teamTotalPointOBJ);
		//-----> sort points desc
		teamTotalPointArr.sort((a, b) => b.points-a.points)

		// set teamTotalPointArr.rank
		let rank = 1;
		let oldPoints = teamTotalPointArr[0].points;
		teamTotalPointArr.forEach(team => {
			if (team.points < oldPoints) rank++;
			oldPoints = team.points;
			team.rank = rank;
		})

		return teamTotalPointArr;
	}

	async calculateTeamTotalPointsNew() {
		const context = {
			query			: { competitionID: { $gt: 0 } },
			projection: { _id:0, },
			limit			: 50000,
			skip			: 0
		};
		const result = await mongodb.find(mongoCFG.Breaststroke.teamPoints, context);

		const staticStructArr = mergeStaticArrayNew(result.data);

		const totalBestOBJ = await this.getTeamTotalPointOBJ();
		
		const teamTotalPointOBJ = {};
		//-----> team
		for (const team of staticStructArr) {
			if (!teamTotalPointOBJ[team.teamID]) {
				teamTotalPointOBJ[team.teamID] = {
					teamID				: team.teamID,
					team					: team.team,
					competitionID	: 0,
					// events				: 0,
					// season				: 0,
					// points				: 0,
					// rank					: 0,
					// athletes			: 0,
					// start					: 0,
					// medals: {
					// 		gold	:0,
					// 		silver:0,
					// 		bronze:0
					// },
					best	: {
						recently: "0000-00-00", // 최근 시합 "0000-00-00"
						rankings: {},	// 기록 보유
						athletes: {}, // 주요 영법별 인물	1:{ "timeID":0, "name": "", "count": 0 }
						start		: {}, // 팀을 위해 가장 많이 뛴 선수 10명 1:{ "timeID":0, "name": "", "count": 0 }
						season	: {}, // 이번 시즌 팀을 위해 가장 많이 뛴 선수 10명 1:{ "timeID":0, "name": "", "count": 0 }
						medals	: {}, // 팀을 위해 메달을 획득한 선수 10명 1:{ "timeID":0, "name": "", "count": 0 }
					},
					teamPoints: {},
				};
			}

			// teamTotalPointOBJ[team.teamID].events 	+= team.events 	|| 0;
			// teamTotalPointOBJ[team.teamID].season 	+= team.season 	|| 0;
			// teamTotalPointOBJ[team.teamID].athletes += team.athletes|| 0;
			// teamTotalPointOBJ[team.teamID].start 		+= team.start 	|| 0;
			// teamTotalPointOBJ[team.teamID].points		+= team.points 	|| 0;

			//-----> style
			for (const style of mskCFG.styles) {
				if (!team.teamPoints[style]) continue;
				teamTotalPointOBJ[team.teamID].teamPoints[style] = teamTotalPointOBJ[team.teamID].teamPoints[style] || {};
				teamTotalPointOBJ[team.teamID].best = teamTotalPointOBJ[team.teamID].best || {};
				//-----> gender
				for (const gender of mskCFG.genders) {
					if (!team.teamPoints[style][gender]) continue;
					teamTotalPointOBJ[team.teamID].teamPoints[style][gender] = teamTotalPointOBJ[team.teamID].teamPoints[style][gender] || {};
					//-----> distance
					for (const distance of mskCFG.distances) {						
						if (!team.teamPoints[style][gender][distance]) continue;
						if (!teamTotalPointOBJ[team.teamID].teamPoints[style][gender][distance]) {
							teamTotalPointOBJ[team.teamID].teamPoints[style][gender][distance] = { athletes:0, start:0, gold:0, silver:0, bronze:0, best: { time: 999  } };
						}
						const teamOBJ = team.teamPoints[style][gender][distance];
						
						// teamTotalPointOBJ[team.teamID].medals.gold 		+= teamOBJ.gold;
						// teamTotalPointOBJ[team.teamID].medals.silver 	+= teamOBJ.silver;
						// teamTotalPointOBJ[team.teamID].medals.bronze 	+= teamOBJ.bronze;

						const totalOBJ = teamTotalPointOBJ[team.teamID].teamPoints[style][gender][distance];
						totalOBJ.athletes	+= teamOBJ.athletes;
						totalOBJ.start 		+= teamOBJ.start;
						totalOBJ.gold 		+= teamOBJ.gold;
						totalOBJ.silver 	+= teamOBJ.silver;
						totalOBJ.bronze 	+= teamOBJ.bronze;

						totalOBJ.best = totalOBJ.best || { time: 99 }
						teamOBJ.best = teamOBJ.best || { time: 99 }
						if (totalOBJ.best.time > teamOBJ.best.time) totalOBJ.best = teamOBJ.best;
					} // end for distance
				} // end for gender
			} // end for style
			if (totalBestOBJ.recently[team.teamID]) {
				teamTotalPointOBJ[team.teamID].best.rankings 	= totalBestOBJ.rankings[team.teamID] || [];
				teamTotalPointOBJ[team.teamID].best.recently 	= totalBestOBJ.recently[team.teamID] || [];
				// teamTotalPointOBJ[team.teamID].best.records		= totalBestOBJ.records[team.teamID] || [];
				teamTotalPointOBJ[team.teamID].best.athletes	= totalBestOBJ.athletes[team.teamID] || [];
				// teamTotalPointOBJ[team.teamID].best.start			= totalBestOBJ.start[team.teamID] || [];
				teamTotalPointOBJ[team.teamID].best.season		= totalBestOBJ.season[team.teamID] || [];
				teamTotalPointOBJ[team.teamID].best.medals		= totalBestOBJ.medals[team.teamID] || [];
			}
		}

		const teamTotalPointArr = Object.values(teamTotalPointOBJ);

		await mongodb.deleteMany(mongoCFG.Breaststroke.teamPoints, { competitionID: 0 });
		await mongodb.insertMany(mongoCFG.Breaststroke.teamPoints, teamTotalPointArr);
	}


	async calculateTeamPointsNew(staticStructArr) {

		//-----> team
		for (const team of staticStructArr) {
			const staticStruct = team.teamPoints; // staticStructOBJ[teamID];
			
			// if (!team.events	) team.events = 0;
			// if (!team.season	) team.season = 0;
			// if (!team.athletes) team.athletes = 0;
			// if (!team.start		) team.start = 0;
			// team.events++;
			// if (team.season) team.season++;

			let teamPoints= 0;

			//-----> style
			for (const style of mskCFG.styles) {
				const checkStyle = staticStruct && staticStruct[style];
				//-----> gender
				for (const gender of mskCFG.genders) {
					const checkGender = checkStyle && staticStruct[style][gender];
					//-----> distance
					for (const distance of mskCFG.distances) {
						if (checkGender) {
							if (!staticStruct[style][gender][distance]) continue;
							if (!staticStruct[style][gender][distance].athletes) continue;

							teamPoints += _teamPoints.athletes * staticStruct[style][gender][distance].athletes +	// 선수 수 * 0
							_teamPoints.start * staticStruct[style][gender][distance].start;	// 경기 수 * 10
							// team.athletes += staticStruct[style][gender][distance].athletes;
							// team.start += staticStruct[style][gender][distance].start;

							if (style.includes("Relay")) {	// 단체전
							teamPoints += _teamPoints.goldTeam * staticStruct[style][gender][distance].gold +
									_teamPoints.silverTeam * staticStruct[style][gender][distance].silver +
									_teamPoints.bronzeTeam * staticStruct[style][gender][distance].bronze;
							} else {	// 개인전
							teamPoints += _teamPoints.goldIndividual * staticStruct[style][gender][distance].gold +
									_teamPoints.silverIndividual * staticStruct[style][gender][distance].silver +
									_teamPoints.bronzeIndividual * staticStruct[style][gender][distance].bronze;
							}

							if (staticStruct[style][gender][distance] &&
							staticStruct[style][gender][distance].start == 0) delete staticStruct[style][gender][distance];

							delete staticStruct[style][gender][distance].names;
							//-----> caculate points
						}
					} // end for distance
					if (checkGender && Object.keys(staticStruct[style][gender]).length == 0) delete staticStruct[style][gender];
				} // end for gender
				if (checkStyle && Object.keys(staticStruct[style]).length == 0) delete staticStruct[style];
			} // end for style

			delete teamPoints.points;

			//-----> calculate points
			// teamPoints += _teamPoints.events; // 대회수 * 10
			// teamPoints += team.season ? _teamPoints.season : 0;	// 시즌 수 * 10

			// team.points = teamPoints;

			// totalPointArr.push(totalOBJ)

			// if (team.season) team.season = 1;
			delete team.teamPoints.season;
			delete team.teamPoints.team;
			delete team.teamPoints.year;
		} // end for team
		
		// staticStructArr.sort((a, b) => b.points-a.points)

		// set staticStructArr.rank
		// let rank = 1;
		// let oldPoints = staticStructArr[0].points;
		// staticStructArr.forEach(team => {
		// 	if (team.points < oldPoints) rank++;
		// 	oldPoints = team.points;
		// 	team.rank = rank;
		// })
		// await mongodb.deleteMany(mongoCFG.Breaststroke.teamPoints, { teamID: 0})
		// await mongodb.insertMany(mongoCFG.Breaststroke.teamPoints, staticStructArr)

		return staticStructArr;
	}

	async calculateTeamPoints(staticStructArr, teamTotalPointOBJ) {

		//-----> team
		for (const team of staticStructArr) {
			const staticStruct = team.teamPoints; // staticStructOBJ[teamID];
			if (!team.events) team.events = 0;
			if (!team.season) team.season = 0;
			if (!team.athletes) team.athletes = 0;
			if (!team.start) team.start = 0;
			team.events++;
			// if (team.season) team.season++;

			let teamPoints= 0;
			let totalPoints = 0;
			teamTotalPointOBJ[team.teamID] = teamTotalPointOBJ[team.teamID] || { teamID: team.teamID, competitionID:0, team: team.team, points: 0, events:0, season:0, athletes: 0, start: 0, teamPoints: {} };
			if (!teamTotalPointOBJ[team.teamID].events) teamTotalPointOBJ[team.teamID].events = 0;
			if (!teamTotalPointOBJ[team.teamID].season) teamTotalPointOBJ[team.teamID].season = 0;
			if (!teamTotalPointOBJ[team.teamID].athletes) teamTotalPointOBJ[team.teamID].athletes = 0;
			if (!teamTotalPointOBJ[team.teamID].start) teamTotalPointOBJ[team.teamID].start = 0;
			teamTotalPointOBJ[team.teamID].events++;
			if (team.season) teamTotalPointOBJ[team.teamID].season++;

			const totalPointOBJ = teamTotalPointOBJ[team.teamID].teamPoints || {};
			//-----> style
			for (const style of mskCFG.styles) {
				const checkStyle = staticStruct && staticStruct[style];
				//-----> gender
				for (const gender of mskCFG.genders) {
					const checkGender = checkStyle && staticStruct[style][gender];
					//-----> distance
					for (const distance of mskCFG.distances) {
						if (checkGender) {
							if (!staticStruct[style][gender][distance]) continue;

							if (!totalPointOBJ[style]) totalPointOBJ[style] = {};
							if (!totalPointOBJ[style][gender]) totalPointOBJ[style][gender] = {};
							if (!totalPointOBJ[style][gender][distance]) totalPointOBJ[style][gender][distance] = { athletes:0, start: 0, gold:0, silver:0, bronze:0 };
							Object.keys(staticStruct[style][gender][distance]).forEach(key => {
								if (key != "names") {
									totalPointOBJ[style][gender][distance][key] += staticStruct[style][gender][distance][key] || 0;
								}
							})
							if (totalPointOBJ[style][gender][distance].times == 0) delete totalPointOBJ[style][gender][distance];

							//-----> caculate points
							teamPoints += _teamPoints.athletes * staticStruct[style][gender][distance].athletes +	// 선수 수 * 0
														_teamPoints.start * staticStruct[style][gender][distance].start;	// 경기 수 * 10
							teamTotalPointOBJ[team.teamID].athletes += staticStruct[style][gender][distance].athletes;
							teamTotalPointOBJ[team.teamID].start += staticStruct[style][gender][distance].start;
							team.athletes += staticStruct[style][gender][distance].athletes;
							team.start += staticStruct[style][gender][distance].start;
												
							if (style.includes("Relay")) {	// 단체전
								teamPoints += _teamPoints.goldTeam * staticStruct[style][gender][distance].gold +
															_teamPoints.silverTeam * staticStruct[style][gender][distance].silver +
															_teamPoints.bronzeTeam * staticStruct[style][gender][distance].bronze;
							} else {	// 개인전
								teamPoints += _teamPoints.goldIndividual * staticStruct[style][gender][distance].gold +
															_teamPoints.silverIndividual * staticStruct[style][gender][distance].silver +
															_teamPoints.bronzeIndividual * staticStruct[style][gender][distance].bronze;
							}
							
							if (staticStruct[style][gender][distance] &&
								staticStruct[style][gender][distance].start == 0) delete staticStruct[style][gender][distance];

							delete staticStruct[style][gender][distance].names;
						}
					} // end for distance
					if (checkGender && Object.keys(staticStruct[style][gender]).length == 0) delete staticStruct[style][gender];
					if (totalPointOBJ[style] && totalPointOBJ[style][gender] && Object.keys(totalPointOBJ[style][gender]).length == 0) delete totalPointOBJ[style][gender];
				} // end for gender
				if (checkStyle && Object.keys(staticStruct[style]).length == 0) delete staticStruct[style];
				if (totalPointOBJ[style] && Object.keys(totalPointOBJ[style]).length == 0) delete totalPointOBJ[style];
			} // end for style

			delete teamPoints.points;

			//-----> calculate points
			teamPoints += _teamPoints.events; // 대회수 * 10
			teamPoints += team.season ? _teamPoints.season : 0;	// 시즌 수 * 10

			team.points = teamPoints;
			teamTotalPointOBJ[team.teamID].points += teamPoints;
			teamTotalPointOBJ[team.teamID].teamPoints = totalPointOBJ;

			// totalPointArr.push(totalOBJ)

			if (team.season) team.season = 1;
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
		})
		
		// set totalPointArr.rank
		rank = 1;
		oldPoints = totalPointArr[0].points;
		totalPointArr.forEach(team => {
			if (team.points < oldPoints) rank++;
			oldPoints = team.points;
			team.rank = rank;
		})
		// await mongodb.deleteMany(mongoCFG.Breaststroke.teamPoints, { teamID: 0})
		// await mongodb.insertMany(mongoCFG.Breaststroke.teamPoints, staticStructArr)

		return [ ...totalPointArr, ...staticStructArr ];
	}

	//----------------------------------------------------
	// convert times to team statics struct
	//----------------------------------------------------
	convertTimes2TeamStruct(timeArr) {
		const competitionName = memoryDB.getCompetitionName(timeArr[0].competitionID);
		
		let staticStruct = {};
		const thisYear = new Date().getFullYear().toString();
		timeArr.forEach(({ teamID, style, gender, distance, name, team, rank, time, times, timeID, competitionID, datetime }) => {
			if (!staticStruct[teamID]) staticStruct[teamID] = {};
			if (!staticStruct[teamID][style]) staticStruct[teamID][style] = {};
			if (!staticStruct[teamID][style][gender]) staticStruct[teamID][style][gender] = {};
			if (!staticStruct[teamID][style][gender][distance]) staticStruct[teamID][style][gender][distance] = { athletes:0, start: 0, gold:0, silver:0, bronze:0, names: [], best: { time: 999.0} };
			if (staticStruct[teamID][style][gender][distance].best.time > time) {
				staticStruct[teamID][style][gender][distance].best = {
					timeID	: timeID,
					name		: name,
					time		: time,
					times		: times,
					datetime: datetime,
				}
			}
			const statics = staticStruct[teamID][style][gender][distance];
			staticStruct[teamID]["team"] = team || name;
			staticStruct[teamID]["season"] = datetime.slice(0, 4) == thisYear;
			staticStruct[teamID]["year"] = Number(datetime.slice(0, 4));
			// 고유한 이름 추가
			if (!statics.names.includes(name)) {
				statics.names.push(name);
				statics.athletes++;
			}
		
			statics.start++;
		
			switch (rank) {
				case 1: statics.gold++;   break;
				case 2: statics.silver++; break;
				case 3: statics.bronze++; break;
			}
		}); // end forEach

		return staticStruct;
	}

	//----------------------------------------------------
	// convert times to team statics struct
	//----------------------------------------------------
	convertTimes2TeamStructNew(timeArr) {
		if (timeArr.length == 0) return;
		console.log(timeArr[0]);
		const competitionName = memoryDB.getCompetitionName(timeArr[0].competitionID);
		
		let staticStruct = {};
		const thisYear = new Date().getFullYear().toString();
		timeArr.forEach(({ teamID, style, gender, distance, name, team, rank, time, times, timeID, competitionID, datetime }) => {
			if (!staticStruct[teamID]) staticStruct[teamID] = {};
			if (!staticStruct[teamID][style]) staticStruct[teamID][style] = {};
			if (!staticStruct[teamID][style][gender]) staticStruct[teamID][style][gender] = {};
			if (!staticStruct[teamID][style][gender][distance]) staticStruct[teamID][style][gender][distance] = { athletes:0, start: 0, gold:0, silver:0, bronze:0, names: [], best: { time: 999.0} };
			if (staticStruct[teamID][style][gender][distance].best.time > time) {
				staticStruct[teamID][style][gender][distance].best = {
					timeID	: timeID,
					name		: name,
					time		: time,
					times		: times,
					datetime: datetime,
				}
			}
			const statics = staticStruct[teamID][style][gender][distance];
			staticStruct[teamID]["team"] = team || name;
			staticStruct[teamID]["season"] = datetime.slice(0, 4) == thisYear;
			staticStruct[teamID]["year"] = Number(datetime.slice(0, 4));
			// 고유한 이름 추가
			if (!statics.names.includes(name)) {
				statics.names.push(name);
				statics.athletes++;
			}
		
			statics.start++;
		
			switch (rank) {
				case 1: statics.gold++;   break;
				case 2: statics.silver++; break;
				case 3: statics.bronze++; break;
			}
		}); // end forEach

		return staticStruct;
	}
	//--------------------------------------
	//  times -> team statics
	//--------------------------------------
	async buildTimes2TeamStatic(context, competitionID) {
		const result = await mongodb.find(mongoCFG.Breaststroke.times, context);
		// const teamIDs = new Set(result.data.map(item => item.teamID));

		//-----> convert times to team statics struct
		const staticStruct = this.convertTimes2TeamStruct(result.data);

		//-----> convert Object to Array
		const teams = await this.changeJson2Array(staticStruct, competitionID);
			
		//-----> calculate points, sort
		const teamArr = await this.calculateTeamPointsNew(teams);
		// staticStruct = await this.calculateTeamPoints(teamArr, teamTotalPointOBJ);

		//-----> calculate points, sort
		const totalArr = await this.calculateTeamTotalPoints111(teamArr);

		//-----> update teamPoints
		await mongodb.deleteMany(mongoCFG.Breaststroke.teamPoints, { competitionID: { $in: [ 0, competitionID ], } });

		//-----> insert teamPoints
		await mongodb.insertMany(mongoCFG.Breaststroke.teamPoints, [ ...totalArr, ...teamArr ] );
	}
	//--------------------------------------
	//  times -> team statics
	//--------------------------------------
	async buildTimes2TeamPointsNew(times, competitionID) {
		// const result = await mongodb.find(mongoCFG.Breaststroke.times, context);
		// const teamIDs = new Set(result.data.map(item => item.teamID));

		//-----> convert times to team statics struct
		const staticStruct = this.convertTimes2TeamStructNew(times);

		//-----> convert Object to Array
		const teams = await this.changeJson2ArrayNew(staticStruct, competitionID);
			
		//-----> calculate points, sort
		const teamArr = await this.calculateTeamPointsNew(teams);
		// staticStruct = await this.calculateTeamPoints(teamArr, teamTotalPointOBJ);

		// console.log(teamArr);
		//-----> update teamPoints
		await mongodb.deleteMany(mongoCFG.Breaststroke.teamPoints, { competitionID: { $in: [ 0, competitionID ], } });

		//-----> insert teamPoints
		await mongodb.insertMany(mongoCFG.Breaststroke.teamPoints, teamArr );

		return teamArr;
	}
	
	async buildTimes2TeamStaticStruct(competitionID) {
		const context = {
			query: { competitionID : competitionID, $or: [ { status: { $exists: false } },{ status: "" }, ] , time: { $gt: 0 } },
			projection: {_id:0, name:1, style:1, gender:1, distance:1, course:1, rank:1, timeID:1, team:1, teamID:1, competitionID:1, time:1, times:1,datetime:1 },
			limit: 5000,
			skip: 0,
		}
		return await this.buildTimes2TeamStaticNew(context, competitionID);
	}
	
	async buildTimes2TeamStaticStructAll() {
		const context = {
			query: { $or: [ { status: { $exists: false } },{ status: "" }, ] , time: { $gt: 0 } },
			projection: {_id:0, name:1, style:1, gender:1, distance:1, course:1, rank:1, timeID:1, team:1, teamID:1, competitionID:1, time:1, times:1,datetime:1 },
			limit: 5000,
			skip: 0,
		}
		return await this.buildTimes2TeamStatic(context);
	}
	
}

module.exports = TeamPointsClass;


(async () => {
	const teamPoints	= new TeamPointsClass();
	await teamPoints.loadTeamPoints();
})();