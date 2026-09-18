const _    				= require('lodash');
const extend 			= require('node.extend');
const mskCFG 			= require('../../Config/mskCFG');
const mongoCFG 		= require('../../Config/mongoCFG');
const mongoDB			= require('../../Class/MongoDB');
const UtilDate		= require("../../Class/DateLibrary");
const utilLibrary = require("../../Util/utilLibrary");
const utilError		= require("../../Util/utilError");
// const utilDatabase= require('./utilDatabase');
const MemoryDB		= require("../../Class/MemoryDB");
const memoryDB		= new MemoryDB();

// const mongodb 		= new mongoDB(mongoCFG.Medalbank.database);
const mongodb 		= new mongoDB(mongoCFG.Medalbank.database);
const utilDate		= new UtilDate();
const StatisticsUtil		= require("./statistics.util");
const LeaderboardModel	= require("../leaderboards/leaderboard.model");
const TimeLibrary	= require("../../Class/TimeLibrary");
const utilDatabase= require('../utilDatabase.js');

class StatisticsLibrary {
	/**
	 * 
	 */
	static makeTeamStatistics(teamID, times, view=false) {
		let teamPoints = memoryDB.getCofig("teamPoints");
		if (!teamPoints.goldTeam) {
			teamPoints = {
				type: 'teamPoints',
				events: 10,
				season: 10,
				athletes: 10,
				start: 10,
				goldIndividual: 10,
				silverIndividual: 5,
				bronzeIndividual: 3,
				goldTeam: 30,
				silverTeam: 20,
				bronzeTeam: 10
			}
		}
		const value = {
			teamID		: Number(teamID),
			timeCount	: times.length, 
			athleteCount: 0,
			competitionCount: 0,
			points: "",
			first: {
				timeID: 0,
				style: "",
				course: "",
				distance: "",
				time: "",
				rank: 0,
				datetime: "",
			},
			latest: {
				timeID: 0,
				style: "",
				course: "",
				distance: "",
				time: "",
				rank: 0,
				datetime: "",
			},
			medals: [
				{
					style: "",
					gender: "",
					timeCount: 0,
					gold: 0,
					silver: 0,
					bronze: 0,
				},
			],
				swimmersEvent: [ 
						{
							athleteID: 0,
							name: "",
							count: 0,
						},
				],
				competitions: [ 
						{
								competitionID: 0,
								timeCount: 0,
								athleteCount: 0,
								medals: {
									gold: 0,
									silver: 0,
									bronze: 0,
								},
						}, 
			],
			bestTimes: [
				{
					gender: "",
					style: "",
					course: "",
					distance: "",
					timeCount: 0,
					athleteCount: 0,
					times: [
						{
							timeID: 0,
							name: "",
							time: "",
							rank: 0,
							competitionID: 0,
							poolID: 0,
							datetime: 0,
						},
					]
				},
			],
		};
		const utilTime = new TimeLibrary();
		console.log("---->2: ", teamID);
		value.athleteCount		= Object.entries(_.countBy(times, "athleteID"))
																	.map(([data, count]) => ({
																				athleteID: Number(data),
																				count,
																			}))
																	.filter(data => !isNaN(data.athleteID) && data.athleteID != 'undefined').length
		value.swimmersEvent 	= utilTime.getAthletesByCount(times, 10);
		value.competitions		= utilTime.getCompetitionsByCountOfTeam(value.teamID, times, 1000); // 처리 필요: athleteCount, medal, pbs
		// value.teamTimes				= times.filter(time => time.style.includes("Relay"));
		value.bestTimes				= utilTime.findBestTime(times, 1);
		value.latest					= utilTime.findLatestTime(times, 1);
		value.first						= utilTime.findFirstTime(times, 1);
		value.medals					= utilTime.countByStyleAndGender(times);
		value.major						= utilTime.getStylesByCount(times);

		value.competitionCount= value.competitions.length;

		// calculate points
		let points = 0;
		for (const medal of value.medals) {
			if (medal.style.includes("Relay")) {
				points += medal.gold * teamPoints.goldTeam +
									medal.silver * teamPoints.silverTeam +
									medal.bronze * teamPoints.bronzeTeam;
			} else {
				points += medal.gold * teamPoints.goldIndividual +
									medal.silver * teamPoints.silverIndividual +
									medal.bronze * teamPoints.bronzeIndividual;
			}	
		} // end for
		points += value.timeCount * teamPoints.start;
		points += value.athleteCount * teamPoints.athletes;
		points += value.competitionCount * teamPoints.events;
		// points 계산
		value.points = points;

		return value;
	}
	
	/**
	 * 
	 */
	static async teamViewStatistics(teamID) {

		const context = {
			query     : { teamID: teamID },
			projection: { _id:0, timeID:1, name:1, gender:1, ageGroup:1, style:1, distance:1, time:1, timeStamp:1, rank:1, datetime:1, teamID:1, poolID:1, athleteID:1, competitionID:1,  },
			limit     : 100000,
			skip      : 0,
		}
		//----------------------------------------------------------------
		const result = await mongodb.find(mongoCFG.Medalbank.times, context );

		const team = this.makeTeamStatistics(teamID, result.data, true); // view: true
		return team;
	}

	/**
	 * 
	 */
	static async teamStatistics(teamID) {

		const context = {
			query     : { teamID: teamID },
			projection: { _id:0, timeID:1, name:1, gender:1, style:1, distance:1, teamID:1, time:1, times:1, names:1, athleteID:1, datetime:1, competitionName:1, competitionID:1, rank:1,  },
			limit     : 100000,
			skip      : 0,
		}
		//----------------------------------------------------------------
		const result = await mongodb.find(mongoCFG.Medalbank.times, context );

		// get teamIDs
		const teamIDs = [...new Set(result.data.map((entry) => entry.teamID))];
		
		// group by teamID
		const grouped = _.groupBy(result.data, (entry) => entry.teamID);
		console.log("---->0");
		

		console.log("---->1");
		const teamsStatistics = [];
		for (const teamID of Object.keys(grouped)) {
			const team = this.makeTeamStatistics(teamID, grouped[teamID], false); // view: false
			teamsStatistics.push(team);
		} // end for
		console.log("+++++");
console.log("teamIDs=", teamIDs, "=", teamsStatistics);
	}
	
	static async makeAthleteStatistics(athleteID, times, view=false) {
		const athlete = {
				athleteID: athleteID,
				name: times[0].name,
			};
			//-------------------------------------------------------------------------
			//-----> teams
			//-------------------------------------------------------------------------
			const teams = [...new Set(times.map((item) => item["teamID"]).map(entry => entry))]
			const teamOBJ = teams.reduce((obj, teamID) => {
															if (!obj[teamID]) obj[teamID] = { teamID: teamID, };
															obj[teamID].count = [...new Set(times.filter(time => time.teamID==teamID))].length;
															return obj;
														}, {})
			athlete.teams = Object.values(teamOBJ);
		
			//-------------------------------------------------------------------------
			//-----> competitions
			//-------------------------------------------------------------------------
			const competitionIDs = [...new Set(times.map((item) => item["competitionID"]).map(entry => entry))]
			athlete.competition = {
				count				: competitionIDs.length,
				timeCount   : 0,
				gold				: 0,
				silver			: 0,
				bronze			: 0,
			}
			
			const context = {
				query			: { competitionID: { $in: competitionIDs } },
				projection: {_id:0, competitionID:1, fullname:1, sido:1, dateStart:1, year:1 },		
				limit			: 100000,
				skip			: 0,
				sort			: { competitionID:1 },
			}
			const competitions = await mongodb.find(mongoCFG.Medalbank.competitions, context)
			_competitions = extend(true, competitions.data, []);
			_competitionOBJ = _competitions.reduce((obj, comp) => {
																				obj[comp.competitionID] = comp;
																				return obj;
																			}, {});
			//-------------------------------------------------------------------------
			
			const competitionsStatics = competitionIDs.reduce((obj, competitionID) => {
																							if (!obj[competitionID]) obj[competitionID] = { competitionID: competitionID, timeCount:0, gold:0, silver:0, bronze: 0, total: 0 };
																							const compTimes = times.filter(time => time.competitionID==competitionID);
																							const comp = _competitions.filter(data => data.competitionID==competitionID);
																							obj[competitionID].fullname		= comp ? comp.fullname : "";
																							obj[competitionID].timeCount	= compTimes.length;
																							obj[competitionID].gold				= compTimes.filter(item => item.rank == 1).length;
																							obj[competitionID].silver			= compTimes.filter(item => item.rank == 2).length;
																							obj[competitionID].bronze			= compTimes.filter(item => item.rank == 3).length;
																							obj[competitionID].total 		  = obj[competitionID].gold + obj[competitionID].silver + obj[competitionID].bronze;
																							athlete.competition.timeCount += obj[competitionID].timeCount;
																							athlete.competition.gold    	+= obj[competitionID].gold;
																							athlete.competition.silver  	+= obj[competitionID].silver;
																							athlete.competition.bronze  	+= obj[competitionID].bronze;
																							return obj;
																						}, {})
			// athlete.competitions        = Object.values(competitionsStatics);
			athlete.competitionsStatics = Object.values(competitionsStatics);
			athlete.timeCount					  = times.length;
			athlete.competition.total   = athlete.competition.gold + 
																		athlete.competition.silver +
																		athlete.competition.bronze;

			let newStyleOBJ = times.reduce((obj, time) => {
																const styleDistance = `${time.style}-${time.distance}`;
																if (!obj[styleDistance]) obj[styleDistance] = { style: time.style, distance: time.distance, count: 0, times: []};
																obj[styleDistance].times = times.filter(tm => time.style==tm.style && time.distance==tm.distance);
																obj[styleDistance].count = obj[styleDistance].times.length;
																return obj;
															}, {})
			const newStyles = Object.values(newStyleOBJ).sort((a, b) => b.count - a.count);
		
			athlete.majorStyle = [];
			athlete.majorStyle = newStyles[0].style;
			athlete.majorTimes = newStyles[0].times.reduce((times, time) => {
																								times.push({
																									name					: time.name,
																									time					: time.time,
																									timeStamp			: time.timeStamp,
																									rank					: time.rank,
																									style					: time.style,
																									distance			: time.distance,
																									teamID				: time.teamID,
																									athleteID			: time.athleteID,
																									datetime			: time.datetime,
																								});
																								return times;
																							}, []).sort((a, b) => a.time - b.time);
			athlete.majorTimes = athlete.majorTimes[0];
		
			if (newStyles.length > 1) {
				athlete.majorTimes1 = newStyles[1].times.reduce((times, time) => {
																									times.push({
																										name					: time.name,
																										time					: time.time,
																										timeStamp			: time.timeStamp,
																										rank					: time.rank,
																										style					: time.style,
																										distance			: time.distance,
																										teamID				: time.teamID,
																										athleteID			: time.athleteID,
																										datetime			: time.datetime,
																									});
																									return times;
																								}, []).sort((a, b) => a.time - b.time);
				athlete.majorTimes1 = {
					style			: athlete.majorTimes1[0].style,
					distance	: athlete.majorTimes1[0].distance,
					timeStamp	: athlete.majorTimes1[0].timeStamp,
					time			: athlete.majorTimes1[0].time,
					rank			: athlete.majorTimes1[0].rank,
				}
			}

			const sortDatetime = times.sort((a, b) => new Date(a.datetime) - new Date(b.datetime));
			athlete.firstDate = sortDatetime[0].datetime;
			athlete.latestDate = sortDatetime[sortDatetime.length-1].datetime;
			for (let no=sortDatetime.length-1; no >= 0; no--) {
				if (sortDatetime[no].style==athlete.majorStyle && sortDatetime[no].timeStamp < 1) {
					athlete.latestEventTimes = {
						name					: sortDatetime[no].name,
						time					: sortDatetime[no].time,
						timeStamp			: sortDatetime[no].timeStamp,
						style					: sortDatetime[no].style,
						distance			: sortDatetime[no].distance,
						teamID				: sortDatetime[no].teamID,
						athleteID			: sortDatetime[no].athleteID,
						datetime			: sortDatetime[no].datetime,
					};
					break;
				}
			}
		
			//-------------------------------------------------------------------------
			//-----> { timeCount, athleteCount, times: [] ]
			//-------------------------------------------------------------------------
		
			// ------------------------------------------------------
			// groupping [gender-style-distance]
			// ------------------------------------------------------
			const best = this.getBestTimes(times, 1000); // MAX_RANK
			athlete.bestTimeTimes = best.bestTimes
			athlete.styles = best.styles
			//-------------------------------------------------------------------------
		
			//-------------------------------------------------------------------------
			const query = { athleteID: Number(athleteID) };		
			// console.log(`athleteID: ${athleteID}, count: ${athlete.timeCount}`);
			// await mongodb.updateOne(mongoCFG.Medalbank.athletes, query, athlete);
			return athlete;
	}
	/**
	 * 
	 */
	static async athleteViewStatistics(athleteID) {
		let athlete = {
			athleteID: 5,
			eventCount: 1,
			timeCount: 1,
			competitions: [ // 최근 대회
				{
					competitionID: 0,
					course: "",
					distance: "",
					sido: "",
					name: "",
					poolID: 0,
				},
			],
			pools: [ // 최근 수영장
				{
					poolID: 0,
					course: "",
					distance: "",
					sido: "",
					name: ""
				}
			],
			timekeepers: [ // 최근 타임 측정해 준 사람
				{
					athleteID: 0,
					name: "",
				},
			],
			bestTime: { // 가장 좋은 측정 기록
				"breaststroke-50M": {
					course: "",
					timeStamp: 0.09,
					time: "",
					datetime: new Date("2024-12-18T15:41:53.950Z"),
					poolID: 0,
					ageGroup: "",
					isAdult: false
				}
			},
			eventTime: { // 가장 좋은 경기 기록
				"breaststroke-50M": {
					course: "",
					timeStamp: 0.09,
					time: "",
					datetime: new Date("2024-12-18T15:41:53.950Z"),
					competitionID: 0,
					poolID: 0,
					ageGroup: "",
					isOfficial: false,
					isAdult: false
				}
			},
		}

		// 선수의 모든 경기 기록을 조회합니다.
		const context = {
			query: {
				athleteID : athleteID,
				// isMasters		: true,
				// isAdult			: true,
				timeStamp   : { $gt:0 },
				$or       	: [ {status: ""}, { status: { $exists: false }} ], fin: { $exists: false },
			},
			projection: { _id:0, timeID:1, athleteID:1, name:1, gender:1, style:1, course:1, distance:1, time:1, timeStamp:1, rank:1, competitionID:1, poolID:1, teamID:1, },
			limit: 10000,
		}
		const times = await mongodb.find(mongoCFG.Medalbank.times, context);
		// console.log(query, "3===?", times.data);
		// 선수의 경기 기록이 없는 경우 결과를 반환합니다.
		if (times.data.length == 0) return { message: "no data", data: {} };

		// 계영('Relay')이 아닌 경기만 분석 대상으로 합니다.
		athlete.times = times.data.reduce((arr, time) => {
																if (!time.style.includes("Relay")) {
																	const competition = memoryDB.getCompetition(time.competitionID);
																	time.competitionName = competition.fullname;
																	time.datetime = competition.dateStart;
																	time.pool = competition.pool;
																	time.poolID = competition.poolID;
																	arr.push(time);
																}
																return arr;
															}, []);
		//--------------------------------------------------------
		// 선수의 경기 기록을 분석합니다.
		const athleteStatics = await this.makeAthleteStatistics(athleteID, athlete.times, true);
		// console.log("athleteStatics=", athleteStatics);
		athlete = extend(true, athlete, athleteStatics);
		// 선수의 경기 기록을 시간 순으로 정렬합니다.
		const timeArr = athlete.times.reduce((tms, time) => {
																		const tm = {
																			timeID				: time.timeID || 0,
																			name					: time.name || "",
																			// nameHide			: time.nameHide || "",
																			gender				: time.gender || "",
																			ageGroup			: time.ageGroup || "",
																			style					: time.style || "",
																			course				: time.course || "",
																			distance			: time.distance || "",
																			time					: time.time || "",
																			timeStamp			: time.timeStamp || "",
																			rank					: time.rank || 0,
																			teamID        : time.teamID || 0,
																			team          : memoryDB.getTeam(time.teamID).name || '',
																			athleteID			: time.athleteID || 0,
																			poolID        : time.poolID || 0,
																			competitionID	: time.competitionID || 0,
																			// extraInfo			: time.extraInfo || {},
																		};
																		if (utilDatabase.checkPB(time, athlete.bestTimeTimes)) tm.check = true;
																		tms.push(tm);
																		return tms;
																	}, [])
		athlete.times = timeArr.sort((a, b) => new Date(a.datetime) - new Date(b.datetime));
	
		// 선수가 속한 팀의 이름을 설정합니다.
		if (!athlete.teams && athlete.teams.length == 0) {
			athlete.teams = [{
				teamID: athlete.teamID,
				team	: athlete.team || athlete.teamName,
				count	: 1,
			}]
		} else {
			athlete.teams = athlete.teams.reduce((teams, team) => {
				if (team.teamID > 0) {
					const teamDB = memoryDB.getTeam(team.teamID);
					team.team = teamDB.name || "";
					teams.push(team);
				}
				return teams;
			}, [])
		}
	
		delete athlete._id;
		delete athlete.styles;
		return athlete;
	}
	
	/**
	 * 
	 */
	static async poolStatistics(body) {
		const statistics = {
			poolID: 5,
			eventCount: 1,
			timeCount: 1,
			competitions: [ // 최근 대회
				{
					competitionID: 0,
					course: "",
					distance: "",
					sido: "",
					name: "",
					poolID: 0,
				},
			],
			bestTime: { // 가장 좋은 측정 기록
				"breaststroke-50M": {
					course: "",
					timeStamp: 0.09,
					time: "",
					datetime: new Date("2024-12-18T15:41:53.950Z"),
					poolID: 0,
					ageGroup: "",
					isAdult: false
				}
			},
			eventTime: { // 가장 좋은 경기 기록
				"breaststroke-50M": {
					course: "",
					timeStamp: 0.09,
					time: "",
					datetime: new Date("2024-12-18T15:41:53.950Z"),
					competitionID: 0,
					poolID: 0,
					ageGroup: "",
					isOfficial: false,
					isAdult: false
				}
			},
			latest: {
				timeID: 0,
				style: "",
				course: "",
				distance: "",
				time: "",
				rank: 0,
				datetime: "",
			},
			swimmersEvent: [ 
				{
					athleteID: 0,
					name: "",
					count: 0,
				},
			],
			timeByDate: [
				{
					style			: "",
					today			: 0,
					yesterday	: 0,
					lastWeek	: 0,
					lastMonth	: 0,
					lastYear	: 0,
					week			: {
						mon: 0,
						tue: 0,
						wed: 0,
						thu: 0,
						fri: 0,
						sat: 0,
						sun: 0,
					}
				}
			],
		}
	}
	
	/**
	 * 
	 */
	static async competitionStatistics(body) {
		const statistics = {
			competitionID: 0,
			athleteCount: 0,
			timeCount: 0,
			ageGroups: [
				{
					ageGroup: "",
					ageGroupName: "",
					count: 0,
				},
			],
			bestTimes: [
				{
					gender: "",
					style: "",
					course: "",
					distance: "",
					timeCount: 0,
					athleteCount: 0,
					times: [
						{
							timeID: 0,
							name: "",
							time: "",
							rank: 0,
							teamID: 0,
							competitionID: 0,
							poolID: 0,
							datetime: 0,
						},
					]
				},
			],
			styleDistances: [
				{
					gender: "",
					style: "",
					distance: "",
					"25M": "",
					"50M": "",
					"100M": "",
					"200M": "",
					"400M": "",
					"800M": "",
					"1500M": "",
				},
			],
		}
	}
}

module.exports = StatisticsLibrary;

