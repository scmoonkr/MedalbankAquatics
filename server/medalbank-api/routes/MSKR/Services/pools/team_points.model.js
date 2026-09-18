const extend 			= require('node.extend');
const mskCFG 			= require('../../Config/mskCFG');
const mongoCFG 		= require('../../Config/mongoCFG');
const mongoDB			= require('../../Class/MongoDB');
const UtilDate		= require("../../Class/DateLibrary");
const utilLibrary = require("../../Util/utilLibrary");
const utilError		= require("../../Util/utilError");
const utilDatabase= require('./utilDatabase');

const TeamPointsClass = require('./team_points.class');
const teamPointsClass	= new TeamPointsClass();

const mongodb 		= new mongoDB(mongoCFG.Medalbank.database);
const utilDate		= new UtilDate();

const MemoryDB 		= require('../../Class/MemoryDB');
const memoryDB		= new MemoryDB();

const PK = "teamID";
const MAX_LIMIT = 2000;
const _limit = 100;

const _context = {
	query		 	: {},
	projection: { _id:0, },
	limit		 	: MAX_LIMIT,
	skip			: 0,
	sort			: { _id:-1 },
}

function customList(data) {
	const value = {
		teamID				: data.teamID,
		competitionID	: data.competitionID,
		team					: data.team,
		rank					: data.rank,
		points				: data.points,
		pointsRelative: data.pointsRelative,
		events				: data.events,
		season				: data.season,
		athletes			: data.athletes,
		start					: data.start,
		// absolute			: {
		// 	events			: 0,
		// 	season			: 0,
		// 	athlete			: 0,
		// 	start				: 0,
		// 	medals			: 0,
		// },
		// relative			: {
		// 	events					: 0,
		// 	medalsIndividual: 0,
		// 	medalsTeam			: 0,
		// },
		individualStart		: {
			freestyle				: 0,
			backstroke			: 0,
			breaststroke		: 0,
			butterfly				: 0,
			individualMedley: 0,
		},
		teamStart: {
			freestyleRelay: {
				men		: 0, 
				women	: 0, 
				mixed	: 0
			},
			medleyRelay: {
				men		: 0, 
				women	: 0, 
				mixed	: 0
			}
		},
		individualMedals		: {
			gold						: 0,
			silver					: 0,
			bronze					: 0,
			freestyle				: 0,
			backstroke			: 0,
			breaststroke		: 0,
			butterfly				: 0,
			individualMedley: 0,
		},
		teamMedals: {
			gold					: 0,
			silver				: 0,
			bronze				: 0,
			freestyleRelay: {
				men		: 0, 
				women	: 0, 
				mixed	: 0
			},
			medleyRelay: {
				men		: 0, 
				women	: 0, 
				mixed	: 0
			}
		},

	}

	const teamPoints = data.teamPoints;
	for (const style of ["freestyle","backstroke","breaststroke","butterfly","individualMedley","medleyRelay","freestyleRelay"]) {
		for (const gender of ["men", "women", "mixed"]) {
			for (const distance of ["50M", "100M", "200M", "400M", "800M", "1500M"]) {
				
				if (teamPoints[style] &&
						teamPoints[style][gender] &&
						teamPoints[style][gender][distance]) {
							// {
							// 	"athletes": 111,
							// 	"start": 111,
							// 	"gold": 11,
							// 	"silver": 10,
							// 	"bronze": 7
							// }
							if (style.includes("Relay")) { // 단체전
								// medals
								value.teamMedals.gold += teamPoints[style][gender][distance].gold;
								value.teamMedals.silver += teamPoints[style][gender][distance].silver;
								value.teamMedals.bronze += teamPoints[style][gender][distance].bronze;
								value.teamMedals[style][gender] += value.teamMedals.gold + value.teamMedals.silver + value.teamMedals.bronze;

								// start
								value.teamStart[style][gender] += teamPoints[style][gender][distance].start;
							} else { // 개인전
								// medals
								value.individualMedals.gold += teamPoints[style][gender][distance].gold;
								value.individualMedals.silver += teamPoints[style][gender][distance].silver;
								value.individualMedals.bronze += teamPoints[style][gender][distance].bronze;
								value.individualMedals[style] += value.individualMedals.gold + value.individualMedals.silver + value.individualMedals.bronze;

								// start
								value.individualStart[style] += teamPoints[style][gender][distance].start;
							}
							value.medals = value.teamMedals.gold + 
														 value.teamMedals.silver + 
														 value.teamMedals.bronze +
														 value.individualMedals.gold + 
														 value.individualMedals.silver + 
														 value.individualMedals.bronze
														 ;
						}

			}
		}
	}


	return value;
}


class TeamPointsModel {

	// find teams
	static async getList(competitionID) {
		const context = {
			query			: { competitionID: Number(competitionID), teamID: { $ne: 185 } }, // 개인 제외
			projection: { _id:0, },
			limit			: MAX_LIMIT,
			skip			: 0,
			sort			: { rank:1,  },
		}
		console.log("getList.list:", context.query);
		//----------------------------------------------------------------
		const result = await mongodb.find(mongoCFG.Medalbank.teamPoints, context)
		//----------------------------------------------------------------

		result.data = result.data.map(data => customList(data))

		console.log("result.data=", result.data[0]);
		return result;
	}

	// find teams
	static async getListTotal(body) {
		const page = body.page ? Number(body.page) : 0;
		const limit = body.limit ? Number(body.limit) : _limit;
		const context = {
			query			: { competitionID: 0 },
			projection: { _id:0, },
			limit			: limit, // MAX_LIMIT,
			skip			: page * limit,
			sort			: { points: -1, },
		}
		// context.sort = body.sort ? body.sort : "points";
		if (body.sort) context.sort[body.sort] = -1;
		console.log("list:", context.query, context.sort);
		//----------------------------------------------------------------
		const result = await mongodb.find(mongoCFG.Medalbank.teamPoints, context)
		//----------------------------------------------------------------
		
		result.data = result.data.map(data => customList(data))

		console.log("getListTotal.result.data=", result.data[0], result.data.length, result.count);
		return result;
	}

	// find teams
	static async getListTotalNew(body={}) {
		const page = body.page ? Number(body.page) : 0;
		const limit = body.limit ? Number(body.limit) : _limit;
		const sort = body.sort ? body.sort : "points";
		console.log("getListTotalNew.body=", body, "page:", page, "limit:", limit, "sort:", sort);
		const context = {
			query			: { competitionID: 0 },
			projection: { _id:0, },
			limit			: limit, // MAX_LIMIT,
			skip			: page * limit,
			sort			: {},
		}
		context.sort[sort] = sort.includes("rank") ? 1 : -1;
		console.log("context:", context);
		//----------------------------------------------------------------
		const result = await mongodb.find(mongoCFG.Medalbank.teamStatics, context)
		//----------------------------------------------------------------
		console.log("+++++", result.data[0]);
		const teamPoints = [];
		for (const team of result.data) {
			// team.team = memoryDB.getTeamName(team.teamID);
			// team.pointsR = Number(team.pointsR.toFixed(3));
			// team.eventsR = Number(team.eventsR.toFixed(3));
			// team.startR = Number(team.startR.toFixed(3));
			// team.medals.total 			= convertMedal(team.medals.total);
			// team.medals.individual 	= convertMedal(team.medals.individual);
			// team.medals.team 				= convertMedal(team.medals.team);
			// team.medalsR.total 			= convertMedalRelative(team.medalsR.total);
			// team.medalsR.individual = convertMedalRelative(team.medalsR.individual);
			// team.medalsR.team 			= convertMedalRelative(team.medalsR.team);
			// team.styles 			= convertStyle(team.styles);
			// team.stylesR 			= convertStyleRelative(team.stylesR);
			// team.styleMedals	= convertStyle(team.styleMedals);
			// team.styleMedalsR = convertStyleRelative(team.styleMedalsR);

			const data = {
				teamID: team.teamID,
				team 		: memoryDB.getTeamName(team.teamID),
				competitionID: team.competitionID,
				rank		: team.rank,
				rankR		: team.rankR,
				season	: team.season,
				events	: team.events,
				athletes: team.athletes,
				start		: team.start,
				points	: team.points,
				pointsR : Number(team.pointsR.toFixed(3)),
				eventsR : Number(team.eventsR.toFixed(3)),
				seasonR : Number(team.seasonR.toFixed(3)),
				startR 	: Number(team.startR.toFixed(3)),
				medals: {
					tot : convertMedal(team.medals.total),
					ind : convertMedal(team.medals.individual),
					tm 	: convertMedal(team.medals.team),
				},
				medalsR: {
					tot : convertMedalRelative(team.medalsR.total),
					ind	: convertMedalRelative(team.medalsR.individual),
					tm 	: convertMedalRelative(team.medalsR.team),
				},
				styles 				: convertStyle(team.styles),
				stylesR 			: convertStyleRelative(team.stylesR),
				styleMedals		: convertStyle(team.styleMedals),
				styleMedalsR 	: convertStyleRelative(team.styleMedalsR),	
			}
			teamPoints.push(data);
		}

		result.data = teamPoints;

		console.log("getListTotalNew.result.data=", result.data.length, result.data[0]);
		return result;
	}

	// find teams
	static async getListTeam(teamID) {
		const context = {
			query			: { teamID: Number(teamID) },
			projection: { _id:0, },
			limit			: MAX_LIMIT,
			skip			: 0,
			sort			: { rank:1,  },
		}
		console.log("getList.list:", query);
		//----------------------------------------------------------------
		const result = await mongodb.find(mongoCFG.Medalbank.teamPoints, context)
		//----------------------------------------------------------------
		
		result.data = result.data.map(data => customList(data))

		console.log("getListTeam.result.data=", result.data[0]);
		return result;
	}

	// find teams
	static async getListTeamWorkOLD(teamID) {
		let result = await mongodb.findOne(mongoCFG.Medalbank.teamPoints, { teamID: Number(teamID), competitionID: 0 }, { _id:0, })
		const teamWork = {
			teamID: result.data.teamID,
			team	: result.data.team,
			rank		: result.data.rank,
			points	: result.data.points,
			count	: {
				medals	: result.data.medals,
				teamMedals	: { gold:0, silver: 0, bronze: 0 }, // result.data.medals,
				events 	: result.data.events,
				athletes: result.data.athletes,
				start 	: result.data.start,
				season 	: result.data.season,
			},
			best	: result.data.best,

			medals: [],
			history: [],
			major: [],
			competitions: [],
		};
		// if (teamWork.best.records) delete teamWork.best.records;
		// medals: [{ style, distance, total, gold, silver, bronze }]
			// history: [{ style, total, 25,50,100,200,400,800,1500}],
			// major: [{ style, gender, distance, times, datetime, name}],

			const medalOBJ = {};
			for (const style of mskCFG.styles) {
				if (!result.data.teamPoints || !result.data.teamPoints[style]) continue;
				if (!medalOBJ[style]) medalOBJ[style] = {};
				const history = { style: style, total: 0, "25M": 0, "50M":0, "100M": 0, "200M": 0, "400M": 0, "800M": 0, "1500M": 0, };
				for (const gender of mskCFG.genders) {
					if (!result.data.teamPoints[style][gender]) continue;
					if (!medalOBJ[style][gender]) medalOBJ[style][gender] = {};
					for (const distance of mskCFG.distances) {
						if (!result.data.teamPoints[style][gender][distance]) continue;
						if (!medalOBJ[style][gender][distance]) medalOBJ[style][gender][distance] = { style: style, gender: gender, distance: distance, total:0, gold:0, silver:0, bronze: 0 };
						medalOBJ[style][gender][distance].gold 	= result.data.teamPoints[style][gender][distance].gold;
						medalOBJ[style][gender][distance].silver= result.data.teamPoints[style][gender][distance].silver;
						medalOBJ[style][gender][distance].bronze= result.data.teamPoints[style][gender][distance].bronze;
						medalOBJ[style][gender][distance].total = medalOBJ[style][gender][distance].gold + medalOBJ[style][gender][distance].silver + medalOBJ[style][gender][distance].bronze;
						if (style.includes("Relay")) {
							teamWork.count.teamMedals.gold += medalOBJ[style][gender][distance].gold;
							teamWork.count.teamMedals.silver += medalOBJ[style][gender][distance].silver;
							teamWork.count.teamMedals.bronze += medalOBJ[style][gender][distance].bronze;							
						}
	
						history[distance] += result.data.teamPoints[style][gender][distance].athletes;

						const major = result.data.teamPoints[style][gender][distance].best;
						major.style = style;
						major.gender = gender;
						major.distance = distance;
						teamWork.major.push(major);
					}
				}
				for (const distance of ["25M", "50M", "100M", "200M", "400M", "800M", "1500M"]) {
					history.total += history[distance];
				}
				teamWork.history.push(history);
			}

		// medals
		const medals = [];
		for (const style of mskCFG.styles) {
			if (!medalOBJ[style]) continue;
			for (const distance of mskCFG.distances) {
				const medal = { style: style, distance: distance, total: 0, gold: 0, silver: 0, bronze: 0, }
				if (medalOBJ[style]["men"] && medalOBJ[style]["men"][distance]) 	 {
					medal.gold 		+= medalOBJ[style]["men"][distance].gold 	|| 0;
					medal.silver 	+= medalOBJ[style]["men"][distance].silver || 0;
					medal.bronze 	+= medalOBJ[style]["men"][distance].bronze || 0;
				}
				if (medalOBJ[style]["women"] && medalOBJ[style]["women"][distance]) {
					medal.gold 		+= medalOBJ[style]["women"][distance].gold 	|| 0;
					medal.silver 	+= medalOBJ[style]["women"][distance].silver || 0;
					medal.bronze 	+= medalOBJ[style]["women"][distance].bronze || 0;
				}
				medal.total = medal.gold + medal.silver + medal.bronze;
				if (medal.total > 0) medals.push(medal);
			}
		}
		teamWork.medals = medals;

		const context = {
			query			: { teamID: Number(teamID), competitionID: { $gt: 0 } },
			projection: { _id:0, },
			limit			: MAX_LIMIT,
			skip			: 0,
			sort			: { rank:1,  },
		}
		console.log("teamPoints.getListTeamWork:", context.query);
		//----------------------------------------------------------------
		result = await mongodb.find(mongoCFG.Medalbank.teamPoints, context)
		//----------------------------------------------------------------

		// competitions: [
		// 	{ dateStart, rank, points, medalAthletes, athletes, medals, individuals, relays, sido, competitionName, competitionID }
		//  ],

		for (const team of result.data) {
			const competition = memoryDB.getCompetition(team.competitionID);
			const value = {
				competitionID		: team.competitionID,
				competitionName	: competition.fullname,
				sido						: competition.sido,
				dateStart				: competition.dateStart,
				rank						: team.rank,
				points					: team.points,
				athletes				: team.athletes,
				start						: team.start,
				medals					: 0,
				individuals			: 0,
				relays					: 0,
			}

			for (const style of mskCFG.styles) {
				if (!team.teamPoints[style]) continue;
				for (const gender of mskCFG.genders) {
					if (!team.teamPoints[style][gender]) continue;
					for (const distance of mskCFG.distances) {
						if (!team.teamPoints[style][gender][distance]) continue;
						value.medals += team.teamPoints[style][gender][distance].gold + team.teamPoints[style][gender][distance].silver + team.teamPoints[style][gender][distance].bronze;
						if (style.includes("Relay")) {
							value.relays += team.teamPoints[style][gender][distance].athletes;
						} else {
							value.individuals += team.teamPoints[style][gender][distance].athletes;
						}
					}
				}	
			}
			teamWork.competitions.push(value);

		}
		
		// result.data = customList(result.data)
		result.data = teamWork;
		// console.log("getListTeamWork.result.data.rankings=", result.data.competitions);
		return result;
	}

	// find teams
	static async getListTeamWork(teamID) {
		let statics = await mongodb.findOne(mongoCFG.Medalbank.teamStatics, { teamID: Number(teamID), competitionID: 0 }, { _id:0, })
		let result = await mongodb.findOne(mongoCFG.Medalbank.teamPoints, { teamID: Number(teamID), competitionID: 0 }, { _id:0, })
		const teamWork = {
			teamID: result.data.teamID,
			team	: result.data.team,
			rank		: statics.data.rank,
			points	: statics.data.points,
			count	: {
				medals	: statics.data.medals.total,
				teamMedals	: statics.data.medals.team, // result.data.medals,
				events 	: statics.data.events,
				athletes: statics.data.athletes,
				start 	: statics.data.start,
				season 	: statics.data.season,
			},
			best	: result.data.best,

			medals: [],
			history: [],
			major: [],
			competitions: [],
		};
		// if (teamWork.best.records) delete teamWork.best.records;
		// medals: [{ style, distance, total, gold, silver, bronze }]
			// history: [{ style, total, 25,50,100,200,400,800,1500}],
			// major: [{ style, gender, distance, times, datetime, name}],

			const medalOBJ = {};
			for (const style of mskCFG.styles) {
				if (!result.data.teamPoints || !result.data.teamPoints[style]) continue;
				if (!medalOBJ[style]) medalOBJ[style] = {};
				const history = { style: style, total: 0, "25M": 0, "50M":0, "100M": 0, "200M": 0, "400M": 0, "800M": 0, "1500M": 0, };
				for (const gender of mskCFG.genders) {
					if (!result.data.teamPoints[style][gender]) continue;
					if (!medalOBJ[style][gender]) medalOBJ[style][gender] = {};
					for (const distance of mskCFG.distances) {
						if (!result.data.teamPoints[style][gender][distance]) continue;
						if (!medalOBJ[style][gender][distance]) medalOBJ[style][gender][distance] = { style: style, gender: gender, distance: distance, total:0, gold:0, silver:0, bronze: 0 };
						medalOBJ[style][gender][distance].gold 	= result.data.teamPoints[style][gender][distance].gold;
						medalOBJ[style][gender][distance].silver= result.data.teamPoints[style][gender][distance].silver;
						medalOBJ[style][gender][distance].bronze= result.data.teamPoints[style][gender][distance].bronze;
						medalOBJ[style][gender][distance].total = medalOBJ[style][gender][distance].gold + medalOBJ[style][gender][distance].silver + medalOBJ[style][gender][distance].bronze;
						if (style.includes("Relay")) {
							teamWork.count.teamMedals.gold += medalOBJ[style][gender][distance].gold;
							teamWork.count.teamMedals.silver += medalOBJ[style][gender][distance].silver;
							teamWork.count.teamMedals.bronze += medalOBJ[style][gender][distance].bronze;							
						}
	
						history[distance] += result.data.teamPoints[style][gender][distance].athletes;

						const major = result.data.teamPoints[style][gender][distance].best;
						major.style = style;
						major.gender = gender;
						major.distance = distance;
						teamWork.major.push(major);
					}
				}
				for (const distance of ["25M", "50M", "100M", "200M", "400M", "800M", "1500M"]) {
					history.total += history[distance];
				}
				teamWork.history.push(history);
			}

		// medals
		const medals = [];
		for (const style of mskCFG.styles) {
			if (!medalOBJ[style]) continue;
			for (const distance of mskCFG.distances) {
				const medal = { style: style, distance: distance, total: 0, gold: 0, silver: 0, bronze: 0, }
				if (medalOBJ[style]["men"] && medalOBJ[style]["men"][distance]) 	 {
					medal.gold 		+= medalOBJ[style]["men"][distance].gold 	|| 0;
					medal.silver 	+= medalOBJ[style]["men"][distance].silver || 0;
					medal.bronze 	+= medalOBJ[style]["men"][distance].bronze || 0;
				}
				if (medalOBJ[style]["women"] && medalOBJ[style]["women"][distance]) {
					medal.gold 		+= medalOBJ[style]["women"][distance].gold 	|| 0;
					medal.silver 	+= medalOBJ[style]["women"][distance].silver || 0;
					medal.bronze 	+= medalOBJ[style]["women"][distance].bronze || 0;
				}
				medal.total = medal.gold + medal.silver + medal.bronze;
				if (medal.total > 0) medals.push(medal);
			}
		}
		teamWork.medals = medals;

		const context = {
			query			: { teamID: Number(teamID), competitionID: { $gt: 0 } },
			projection: { _id:0, },
			limit			: MAX_LIMIT,
			skip			: 0,
			sort			: { rank:1,  },
		}
		console.log("teamPoints.getListTeamWork:", context.query);
		//----------------------------------------------------------------
		result = await mongodb.find(mongoCFG.Medalbank.teamPoints, context)
		statics = await mongodb.find(mongoCFG.Medalbank.teamStatics, context)
		//----------------------------------------------------------------

		// competitions: [
		// 	{ dateStart, rank, points, medalAthletes, athletes, medals, individuals, relays, sido, competitionName, competitionID }
		//  ],

		for (const team of result.data) {
			const competition = memoryDB.getCompetition(team.competitionID);
			const stat = statics.data.find(st => st.teamID==team.teamID);
			const value = {
				competitionID		: team.competitionID,
				competitionName	: competition.fullname,
				sido						: competition.sido,
				dateStart				: competition.dateStart,
				rank						: stat.rank,
				points					: stat.points,
				athletes				: stat.athletes,
				start						: stat.start,
				medals					: 0,
				individuals			: 0,
				relays					: 0,
			}

			for (const style of mskCFG.styles) {
				if (!team.teamPoints[style]) continue;
				for (const gender of mskCFG.genders) {
					if (!team.teamPoints[style][gender]) continue;
					for (const distance of mskCFG.distances) {
						if (!team.teamPoints[style][gender][distance]) continue;
						value.medals += team.teamPoints[style][gender][distance].gold + team.teamPoints[style][gender][distance].silver + team.teamPoints[style][gender][distance].bronze;
						if (style.includes("Relay")) {
							value.relays += team.teamPoints[style][gender][distance].athletes;
						} else {
							value.individuals += team.teamPoints[style][gender][distance].athletes;
						}
					}
				}	
			}
			teamWork.competitions.push(value);

		}
		
		// result.data = customList(result.data)
		result.data = teamWork;
		// console.log("getListTeamWork.result.data.rankings=", result.data.competitions);
		return result;
	}
	// find teams
	static async listTeamLeader() {
		const context = {
			query			: { competitionID: 0, teamID: { $ne: 185 } },
			projection: { _id:0, }, // team:1, teamID:1, rank:1, points:1, best:1 },
			limit			: MAX_LIMIT,
			skip			: 0,
			sort			: { rank: 1, },
		}
		console.log("teamPoints.listTeamLeader:", context.query);
		//----------------------------------------------------------------
		const result = await mongodb.find(mongoCFG.Medalbank.teamPoints, context)
		//----------------------------------------------------------------
		console.log("listTeamLeader.result.data.rankings=", result.data);

		// competitions: [
		// 	{ dateStart, rank, points, medalAthletes, athletes, medals, individuals, relays, sido, competitionName, competitionID }
		//  ],

		const teams = [];
		for (const team of result.data) {
			const value = {
				team			: team.team || "",
				teamID		: team.teamID || 0,
				rank			: team.rank || 0,
				points		: team.points || 0,
				athletes	: team.best.athletes || [],
				season		: team.best.season || [],
				medals		: team.best.medals || [],
			}
			teams.push(value);
		}
		result.data = teams;

		// console.log("listTeamLeader.result.data.rankings=", result.data.competitions);
		return result;
	}
	// find teams
	static async getListTeamWorkOld(teamID) {
		//----------------------------------------------------------------
		const result = await mongodb.findOne(mongoCFG.Medalbank.teamPoints, { teamID: Number(teamID), competitionID: 0 }, { _id:0 })
		//----------------------------------------------------------------
		
		// result.data = customList(result.data)
		delete result.data.best.records;

		console.log("getListTeamWork.result.data=", result.data);
		return result;
	}

	// build team works
	static async build(body) {
		let competitionIDs
		if (body.competitionID) {
			competitionIDs = [ Number(body.competitionID)];
		} else {
			competitionIDs = body.competitionIDs.toString().replace(/ /gi, '').split(',').map(id => Number(id));
		}
		console.log("competitionIDs=", competitionIDs);
		// get team posint 배점표
		const config = await mongodb.findOne(mongoCFG.Medalbank.config, { type: "teamPoints" }, { _id:0, type:0, } );

		for (const competitionID of competitionIDs) {
			console.log("competitionID=", competitionID);
			const context = {
				query: {
						competitionID : competitionID,
						$or						: [ { status: { $exists: false } }, { status: "" }, ],
						time					: { $gt: 0 },
						fin						: { $exists: false }
					},
				projection: {_id:0, name:1, norm:1, style:1, gender:1, distance:1, course:1, rank:1, timeID:1, team:1, teamID:1, competitionID:1, time:1, individual:1, times:1,datetime:1 },
				limit: 5000,
				skip: 0,
			}
			let result = await mongodb.find(mongoCFG.Medalbank.times, context);
			if (result.data.length == 0) continue;
			const times = extend(true, result.data);


			//----------------------------------------------------------------
			result = await teamPointsClass.buildTimes2TeamPointsNew(times, competitionID);
			result = await caculateTeamStaticsNew(times, competitionID, config);
			//----------------------------------------------------------------
		}

		//-----> calculate points, sort
		 await teamPointsClass.calculateTeamTotalPointsNew();

		//----------------------------------------------------------------
		await calculateTotalTeamsStatics();
		//----------------------------------------------------------------

		// console.log("build.result.data=", result.data[0]);
		// return result;
	}

	// build team works
	static async buildPoints(body) {
		let competitionIDs
		if (body.competitionID) {
			competitionIDs = [ Number(body.competitionID)];
		} else {
			competitionIDs = body.competitionIDs.toString().replace(/ /gi, '').split(',').map(id => Number(id));
		}
		console.log("competitionIDs=", competitionIDs);

		//----------------------------------------------------------------
		const result = await teamPointsClass.buildTimes2TeamStaticStruct(competitionID);
		//----------------------------------------------------------------
		
		// console.log("build.result.data=", result.data[0]);
		return result;
	}

	// build team works
	static async buildStatics(body) {
		let competitionIDs
		if (body.competitionID) {
			competitionIDs = [ Number(body.competitionID)];
		} else {
			competitionIDs = body.competitionIDs.toString().replace(/ /gi, '').split(',').map(id => Number(id));
		}
		console.log("competitionIDs=", competitionIDs);

		let result;
		//----------------------------------------------------------------
		for (const competitionID of competitionIDs) {
			console.log("competitionID=", competitionID);
			result = await caculateTeamPoints(competitionID);
		}
		//----------------------------------------------------------------

		//----------------------------------------------------------------
		result = await calculateTotalTeamsStatics();
		//----------------------------------------------------------------
	
		// console.log("build.result.data=", result.data[0]);
		return result;
	}

	// build team works all
	static async buildAll(teamID) {
		//----------------------------------------------------------------
		const result = await teamPointsClass.buildTimes2TeamStaticStruct();
		//----------------------------------------------------------------
		
		console.log("buildAll.result.data=", result.data[0]);
		return result;
	}

	// delete teamPoints
	static async delete(competitionID) {
		//----------------------------------------------------------------
		const result = await mongodb.deleteMany(mongoCFG.Medalbank.teamPoints, { competitionID: Number(competitionID) })
		//----------------------------------------------------------------
		
		console.log("delete.result.data=", result.data[0]);
		return result;
	}

	// delete teamPoints all
	static async deleteAll() {
		//----------------------------------------------------------------
		const result = await mongodb.deleteMany(mongoCFG.Medalbank.teamPoints, {})
		//----------------------------------------------------------------
		
		console.log("deleteAll.result.data=", result.data[0]);
		return result;
	}

	// load config
	static async loadConfig() {
		//----------------------------------------------------------------
		const result = await mongodb.findOne(mongoCFG.Medalbank.config, { type: "teamPoints" } )
		//----------------------------------------------------------------
		
		console.log("loadConfig.result.data=", result.data[0]);
		return result;
	}

	// save config
	static async saveConfig(config) {
		//----------------------------------------------------------------
		Object.keys(config).forEach(field => {
			if (field != "type") config[field] = Number(config[field]);
		})
		const result = await mongodb.updateOne(mongoCFG.Medalbank.config, { type: "teamPoints" }, config)
		//----------------------------------------------------------------
		
		console.log("saveConfig.result.data=", result.data[0]);
		return result;
	}

	// create
	static async create() {
		const indexes = [
			{ query: { teamID:1 }, name: "teamID", option: { unique: true }	},
			{ query: { "teams.category":1 }, name: "category"	},
		];
		await mongodb.createCollectionNindex(mongoCFG.Medalbank.teams, indexes);
	}

}

module.exports = TeamPointsModel;


function countMedal(pointsOBJ, time) {
	pointsOBJ.medals.total.total++;
	pointsOBJ.styleMedals.total.total++;
	pointsOBJ.styleMedals.total[time.style]++;
	if (time.individual) {
		pointsOBJ.medals.individual.total++;
		pointsOBJ.styleMedals.individual.total++;
		pointsOBJ.styleMedals.individual[time.style]++;
	} else {
		pointsOBJ.medals.team.total++;
		pointsOBJ.styleMedals.team[time.gender].total++;
		pointsOBJ.styleMedals.team[time.gender][time.style]++;
	}
	//-----
	switch (time.rank) {
		case 1:
			pointsOBJ.medals.total.gold++;
			if (time.individual) {
				pointsOBJ.medals.individual.gold++;
			} else {
				pointsOBJ.medals.team.gold++;
			}
			break;
		case 2:
			pointsOBJ.medals.total.silver++;
			if (time.individual) {
				pointsOBJ.medals.individual.silver++;
			} else {
				pointsOBJ.medals.team.silver++;
			}
			break;
		case 3:
			pointsOBJ.medals.total.bronze++;
			if (time.individual) {
				pointsOBJ.medals.individual.bronze++;
			} else {
				pointsOBJ.medals.team.bronze++;
			}
			break;
	}
	return pointsOBJ;
}
function addMedal(newMedal, medal) {
	if (!newMedal) return extend(true, medal);
	return {
		total: {
			total 	: newMedal.total.total + medal.total.total,
			gold 		: newMedal.total.gold + medal.total.gold,
			silver 	: newMedal.total.silver + medal.total.silver,
			bronze 	: newMedal.total.bronze + medal.total.bronze,	
		},
		individual: {
			total 	: newMedal.individual.total + medal.individual.total,
			gold 		: newMedal.individual.gold + medal.individual.gold,
			silver 	: newMedal.individual.silver + medal.individual.silver,
			bronze 	: newMedal.individual.bronze + medal.individual.bronze,	
		},
		team: {
			total 	: newMedal.team.total + medal.team.total,
			gold 		: newMedal.team.gold + medal.team.gold,
			silver 	: newMedal.team.silver + medal.team.silver,
			bronze 	: newMedal.team.bronze + medal.team.bronze,	
		},
	};
}
function addStyle(newStyle, styles) {
	if (!newStyle) return extend(true, {}, style);
	return {
		total: {
			total   				: styles.total.total								+ newStyle.total.total,
			freestyle  			: styles.total.freestyle						+ newStyle.total.freestyle,
			backstroke  		: styles.total.backstroke						+ newStyle.total.backstroke,
			breaststroke		: styles.total.breaststroke					+ newStyle.total.breaststroke,
			butterfly   		: styles.total.butterfly						+ newStyle.total.butterfly,
			individualMedley: styles.total.individualMedley			+ newStyle.total.individualMedley,
		},
		individual: {
			total   				: styles.individual.total						+ newStyle.individual.total,
			freestyle  			: styles.individual.freestyle				+ newStyle.individual.freestyle,
			backstroke  		: styles.individual.backstroke			+ newStyle.individual.backstroke,
			breaststroke		: styles.individual.breaststroke		+ newStyle.individual.breaststroke,
			butterfly   		: styles.individual.butterfly				+ newStyle.individual.butterfly,
			individualMedley: styles.individual.individualMedley+ newStyle.individual.individualMedley,
		},
		team: {
			men: {
				total   			: styles.team.men.total 						+ newStyle.team.men.total,
				freestyleRelay: styles.team.men.freestyleRelay 		+ newStyle.team.men.freestyleRelay,
				medleyRelay   : styles.team.men.medleyRelay 			+ newStyle.team.men.medleyRelay,
			},
			women: {
				total   			: styles.team.women.total 					+ newStyle.team.women.total,
				freestyleRelay: styles.team.women.freestyleRelay	+ newStyle.team.women.freestyleRelay,
				medleyRelay    : styles.team.women.medleyRelay 		+ styles.team.women.medleyRelay,
			},
			mixed: {
				total   			: styles.team.mixed.total 					+ newStyle.team.mixed.total,
				freestyleRelay: styles.team.mixed.freestyleRelay	+ newStyle.team.mixed.freestyleRelay,
				medleyRelay    : styles.team.mixed.medleyRelay 		+ newStyle.team.mixed.medleyRelay,
			},
		},
	};	
}
function setMedal(medal, athletes=1) {
	return {	
		total 	: medal.total / athletes,
		gold 		: medal.gold / athletes,
		silver 	: medal.silver / athletes,
		bronze 	: medal.bronze / athletes,
	};
}
function setStyle(styles, athletes=1) {
	const res = {
		total: {
			total   				: styles.total.total								/ athletes,
			freestyle  			: styles.total.freestyle						/ athletes,
			backstroke  		: styles.total.backstroke						/ athletes,
			breaststroke		: styles.total.breaststroke					/ athletes,
			butterfly   		: styles.total.butterfly						/ athletes,
			individualMedley: styles.total.individualMedley			/ athletes,
		},
		individual: {
			total   				: styles.individual.total						/ athletes,
			freestyle  			: styles.individual.freestyle				/ athletes,
			backstroke  		: styles.individual.backstroke			/ athletes,
			breaststroke		: styles.individual.breaststroke		/ athletes,
			butterfly   		: styles.individual.butterfly				/ athletes,
			individualMedley: styles.individual.individualMedley/ athletes,
		},
		team: {
			men: {
				total   			: styles.team.men.total 						/ athletes,
				freestyleRelay: styles.team.men.freestyleRelay 		/ athletes,
				medleyRelay  	: styles.team.men.medleyRelay 			/ athletes,
			},
			women: {
				total   			: styles.team.women.total 					/ athletes,
				freestyleRelay: styles.team.women.freestyleRelay	/ athletes,
				medleyRelay   : styles.team.women.medleyRelay 		/ athletes,
			},
			mixed: {
				total   			: styles.team.mixed.total 					/ athletes,
				freestyleRelay: styles.team.mixed.freestyleRelay	/ athletes,
				medleyRelay   : styles.team.mixed.medleyRelay 		/ athletes,
			},
		},	
	};
	return res;
}
function convertMedal(medal) {
	const data = {	
		// total 	: Number(medal.total.toFixed(3)),
		// gold 		: Number(medal.gold.toFixed(3)),
		// silver 	: Number(medal.silver.toFixed(3)),
		// bronze 	: Number(medal.bronze.toFixed(3)),
		t 	: medal.total,
		g 	: medal.gold,
		s 	: medal.silver,
		b 	: medal.bronze,
	};

	Object.keys(data).forEach(key => {
		if (!data[key] || data[key] == 0) delete data[key];
	})
	// console.log("convertMedal=", data);
	return data;
}
function convertMedalRelative(medal) {
	const data = {	
		// total 	: Number(medal.total.toFixed(3)),
		// gold 		: Number(medal.gold.toFixed(3)),
		// silver 	: Number(medal.silver.toFixed(3)),
		// bronze 	: Number(medal.bronze.toFixed(3)),
		t 	: Number(medal.total.toFixed(3)),
		g 	: Number(medal.gold.toFixed(3)),
		s 	: Number(medal.silver.toFixed(3)),
		b 	: Number(medal.bronze.toFixed(3)),
	};

	Object.keys(data).forEach(key => {
		if (!data[key] || data[key] == 0) delete data[key];
	})
	// console.log("convertMedalRelative=", data);
	return data;
}
function convertStyle(styles) {
	const style = {
		tot   	: styles.individual.total,
		free  	: styles.individual.freestyle,
		back  	: styles.individual.backstroke,
		breast	: styles.individual.breaststroke,
		fly   	: styles.individual.butterfly,
		im    	: styles.individual.individualMedley,

		totM   	: styles.team.men.total,
		frM    	: styles.team.men.freestyleRelay,
		mrM    	: styles.team.men.medleyRelay,
					
		totW   	: styles.team.women.total,
		frW    	: styles.team.women.freestyleRelay,
		mrW    	: styles.team.women.medleyRelay,
					
		totX   	: styles.team.mixed.total,
		frX    	: styles.team.mixed.freestyleRelay,
		mrX    	: styles.team.mixed.medleyRelay,
	};

	Object.keys(style).forEach(key => {
		if (!style[key] || style[key] == 0) delete style[key];
	})
	// console.log("convertStyle=", style);
	return style;
}
function convertStyleRelative(styles) {

	const style = {
		tot   	: Number(styles.individual.total.toFixed(3)),
		free  	: Number(styles.individual.freestyle.toFixed(3)),
		back  	: Number(styles.individual.backstroke.toFixed(3)),
		breast	: Number(styles.individual.breaststroke.toFixed(3)),
		fly   	: Number(styles.individual.butterfly.toFixed(3)),
		im    	: Number(styles.individual.individualMedley.toFixed(3)),

		totM   	: Number(styles.team.men.total.toFixed(3)),
		frM    	: Number(styles.team.men.freestyleRelay.toFixed(3)),
		mrM    	: Number(styles.team.men.medleyRelay.toFixed(3)),
					
		totW   	: Number(styles.team.women.total.toFixed(3)),
		frW    	: Number(styles.team.women.freestyleRelay.toFixed(3)),
		mrW    	: Number(styles.team.women.medleyRelay.toFixed(3)),
					
		totX   	: Number(styles.team.mixed.total.toFixed(3)),
		frX    	: Number(styles.team.mixed.freestyleRelay.toFixed(3)),
		mrX    	: Number(styles.team.mixed.medleyRelay.toFixed(3)),
	};

	Object.keys(style).forEach(key => {
		if (!style[key] || style[key] == 0) delete style[key];
	})
	// console.log("convertStyleRelative=", style);
	return style;
}
function caculatePoints(pointsOBJ, teamPoints) {
	const newPointsOBJ = {
		teamID: Number(pointsOBJ.teamID),
		team: pointsOBJ.team,
		competitionID: Number(pointsOBJ.competitionID),
	};
	const athletes = pointsOBJ.athletes.length;
	newPointsOBJ.athletes = athletes;
	newPointsOBJ.events 	= pointsOBJ.events.length;
	newPointsOBJ.start 		= pointsOBJ.start;
	newPointsOBJ.season 	= pointsOBJ.season;
	
	//-----> caculate points
	newPointsOBJ.points = 0;
	newPointsOBJ.points += teamPoints.events    * newPointsOBJ.events;    
	newPointsOBJ.points += teamPoints.athletes	* newPointsOBJ.athletes;;
	newPointsOBJ.points += teamPoints.start   	* pointsOBJ.start;

	newPointsOBJ.points += teamPoints.goldIndividual   * pointsOBJ.medals.individual.gold;
	newPointsOBJ.points += teamPoints.silverIndividual * pointsOBJ.medals.individual.silver;
	newPointsOBJ.points += teamPoints.bronzeIndividual * pointsOBJ.medals.individual.bronze;
	
	newPointsOBJ.points += teamPoints.goldTeam   * pointsOBJ.medals.team.gold;
	newPointsOBJ.points += teamPoints.silverTeam * pointsOBJ.medals.team.silver;
	newPointsOBJ.points += teamPoints.bronzeTeam * pointsOBJ.medals.team.bronze;

	// calculate Relative
	newPointsOBJ.pointsR = newPointsOBJ.points / athletes;
	newPointsOBJ.eventsR = newPointsOBJ.events / athletes;
	newPointsOBJ.seasonR = newPointsOBJ.season / athletes;
	newPointsOBJ.startR  = newPointsOBJ.start  / athletes;
	return newPointsOBJ;
}
//============================================
//	calculate relative
//============================================
function calculateRelative(pointsOBJ, teamPoints) {
	const newPointsOBJ = {};
	Object.keys(pointsOBJ).forEach(teamID => {
		newPointsOBJ[teamID] = caculatePoints(pointsOBJ[teamID], teamPoints);
		const athletes = pointsOBJ[teamID].athletes.length;

		//--------------------------
		// medals
		//--------------------------
		newPointsOBJ[teamID].medals = {};
		newPointsOBJ[teamID].medals.total 			= setMedal(pointsOBJ[teamID].medals.total, 1);
		newPointsOBJ[teamID].medals.individual	= setMedal(pointsOBJ[teamID].medals.individual, 1);
		newPointsOBJ[teamID].medals.team 				= setMedal(pointsOBJ[teamID].medals.team, 1);
		// medals: 상대점수
		newPointsOBJ[teamID].medalsR = {};
		newPointsOBJ[teamID].medalsR.total 			= setMedal(pointsOBJ[teamID].medals.total, athletes);
		newPointsOBJ[teamID].medalsR.individual = setMedal(pointsOBJ[teamID].medals.individual, athletes);
		newPointsOBJ[teamID].medalsR.team 			= setMedal(pointsOBJ[teamID].medals.team, athletes);
		
		// //--------------------------
		// // styles
		// //--------------------------
		newPointsOBJ[teamID].styles 	= setStyle(pointsOBJ[teamID].styles, 1);
		
		// styles: 상대점수
		newPointsOBJ[teamID].stylesR 	= setStyle(pointsOBJ[teamID].styles, athletes);
		
		//--------------------------
		// styleMedals
		//--------------------------
		newPointsOBJ[teamID].styleMedals 		= setStyle(pointsOBJ[teamID].styleMedals, 1);
		
		// styleMedals: 상대점수
		newPointsOBJ[teamID].styleMedalsR 	= setStyle(pointsOBJ[teamID].styleMedals, athletes);
	})

	return newPointsOBJ;
}
//=============================================
//	calculate team points
//=============================================
async function caculateTeamStaticsNew(times, competitionID, config) {
	if (times.length == 0) return;

	const pointsOBJ = {};
	//-----
	for (const time of times) {
		if (!pointsOBJ[time.teamID]) {
			// initialize
			pointsOBJ[time.teamID] = {
				teamID: Number(time.teamID),
				team: time.team,
				competitionID: competitionID,
				points: 0,
				rank: 0,
				events: [],
				season: 0,
				athletes: [],
				start: 0,
				medals: {
					total: { total:0, gold: 0, silver: 0, bronze: 0, },
					individual: { total:0, gold: 0, silver: 0, bronze: 0, },
					team: { total:0, gold: 0, silver: 0, bronze: 0, },
				},
				styles: { // start
					total: { total:0, freestyle: 0, backstroke: 0, breaststroke: 0, butterfly: 0, individualMedley: 0, freestyleRelay: 0, medleyRelay: 0, },
					individual: { total:0, freestyle: 0, backstroke: 0, breaststroke: 0, butterfly: 0, individualMedley: 0, },
					team: {
						men		: { total:0, freestyleRelay: 0, medleyRelay: 0, },
						women	: { total:0, freestyleRelay: 0, medleyRelay: 0, },
						mixed	: { total:0, freestyleRelay: 0, medleyRelay: 0, },
					},
				},
				styleMedals: { // style medals
					total: { total:0, freestyle: 0, backstroke: 0, breaststroke: 0, butterfly: 0, individualMedley: 0, freestyleRelay: 0, medleyRelay: 0, },
					individual: { total:0, freestyle: 0, backstroke: 0, breaststroke: 0, butterfly: 0, individualMedley: 0, },
					team: {
						men		: { total:0, freestyleRelay: 0, medleyRelay: 0, },
						women	: { total:0, freestyleRelay: 0, medleyRelay: 0, },
						mixed	: { total:0, freestyleRelay: 0, medleyRelay: 0, },
					},
				},
			};
		}
		if (!pointsOBJ[time.teamID].events.find(competitionID => competitionID==time.competitionID)) pointsOBJ[time.teamID].events.push(time.competitionID);
		if (!pointsOBJ[time.teamID].athletes.find(name => name==time.norm)) pointsOBJ[time.teamID].athletes.push(time.norm);
		pointsOBJ[time.teamID].start++;
		if(time.teamID == 588)
			console.log(time.name, pointsOBJ[time.teamID].athletes, pointsOBJ[time.teamID].start);

		//-------------------
		// count medals, styleMedals
		//-------------------
		if (time.rank <= 3) {
			pointsOBJ[time.teamID] = countMedal(pointsOBJ[time.teamID], time);
		}
		//-------------------

		//-------------------
		// start: style
		//-------------------
		pointsOBJ[time.teamID].styles.total.total++;
		pointsOBJ[time.teamID].styles.total[time.style]++;
		if (time.individual) {
			pointsOBJ[time.teamID].styles.individual.total++;
			pointsOBJ[time.teamID].styles.individual[time.style]++;
		} else {
			pointsOBJ[time.teamID].styles.team[time.gender].total++;
			pointsOBJ[time.teamID].styles.team[time.gender][time.style]++;
		}
		//-------------------
	} // end for
	//-----

	const newPointsOBJ = calculateRelative(pointsOBJ, config.data)

	const teamArr = Object.values(newPointsOBJ);
	
	// set 대회별 팀별 points
	teamArr.sort((a, b)=> b.points - a.points);
	// set staticStructArr.rank
	let rank = 1;
	let oldPoints = teamArr[0].points;
	teamArr.forEach(team => {
		if (team.points < oldPoints) rank++;
		oldPoints = team.points;
		team.rank = rank;
	})

	// set 대회별 팀별 상대 points
	teamArr.sort((a, b)=> b.pointsR - a.pointsR);
	rank = 1;
	oldPoints = teamArr[0].pointsR;
	teamArr.forEach(team => {
		if (team.pointsR < oldPoints) rank++;
		oldPoints = team.pointsR;
		team.rankR = rank;
	})

	//-----> update teamPoints
	await mongodb.deleteMany(mongoCFG.Medalbank.teamStatics, { competitionID: competitionID });

	//-----> insert teamPoints
	await mongodb.insertMany(mongoCFG.Medalbank.teamStatics, teamArr );

	return teamArr;
}
async function caculateTeamPoints(competitionID) {
	// get team posint 배점표
	const config = await mongodb.findOne(mongoCFG.Medalbank.config, { type: "teamPoints" }, { _id:0, type:0, } );

	// get team statics
	const context = {
		query: {
			competitionID	: competitionID,
			fin						: { $exists: false },
			status				: {$exists:false},
			masters 			: true,
    	adult 				: true,
		},
		limit: 10000,
	}
	const result = await mongodb.find(mongoCFG.Medalbank.times, context);
	if (result.data.length == 0) return result.data;

	const pointsOBJ = {};
	//-----
	for (const time of result.data) {
		if (!pointsOBJ[time.teamID]) {
			// initialize
			pointsOBJ[time.teamID] = {
				teamID: Number(time.teamID),
				team: time.team,
				competitionID: competitionID,
				points: 0,
				rank: 0,
				events: [],
				season: 0,
				athletes: [],
				start: 0,
				medals: {
					total: { total:0, gold: 0, silver: 0, bronze: 0, },
					individual: { total:0, gold: 0, silver: 0, bronze: 0, },
					team: { total:0, gold: 0, silver: 0, bronze: 0, },
				},
				styles: { // start
					total: { total:0, freestyle: 0, backstroke: 0, breaststroke: 0, butterfly: 0, individualMedley: 0, freestyleRelay: 0, medleyRelay: 0, },
					individual: { total:0, freestyle: 0, backstroke: 0, breaststroke: 0, butterfly: 0, individualMedley: 0, },
					team: {
						men		: { total:0, freestyleRelay: 0, medleyRelay: 0, },
						women	: { total:0, freestyleRelay: 0, medleyRelay: 0, },
						mixed	: { total:0, freestyleRelay: 0, medleyRelay: 0, },
					},
				},
				styleMedals: { // style medals
					total: { total:0, freestyle: 0, backstroke: 0, breaststroke: 0, butterfly: 0, individualMedley: 0, freestyleRelay: 0, medleyRelay: 0, },
					individual: { total:0, freestyle: 0, backstroke: 0, breaststroke: 0, butterfly: 0, individualMedley: 0, },
					team: {
						men		: { total:0, freestyleRelay: 0, medleyRelay: 0, },
						women	: { total:0, freestyleRelay: 0, medleyRelay: 0, },
						mixed	: { total:0, freestyleRelay: 0, medleyRelay: 0, },
					},
				},
			};
		}
		if (!pointsOBJ[time.teamID].events.find(competitionID => competitionID==time.competitionID)) pointsOBJ[time.teamID].events.push(time.competitionID);
		if (!pointsOBJ[time.teamID].athletes.find(name => name==time.norm)) pointsOBJ[time.teamID].athletes.push(time.norm);
		pointsOBJ[time.teamID].start++;

		//-------------------
		// count medals, styleMedals
		//-------------------
		if (time.rank <= 3) {
			pointsOBJ[time.teamID] = countMedal(pointsOBJ[time.teamID], time);
		}
		//-------------------

		//-------------------
		// start: style
		//-------------------
		pointsOBJ[time.teamID].styles.total.total++;
		pointsOBJ[time.teamID].styles.total[time.style]++;
		if (time.individual) {
			pointsOBJ[time.teamID].styles.individual.total++;
			pointsOBJ[time.teamID].styles.individual[time.style]++;
		} else {
			pointsOBJ[time.teamID].styles.team[time.gender].total++;
			pointsOBJ[time.teamID].styles.team[time.gender][time.style]++;
		}
		//-------------------
	} // end for
	//-----

	const newPointsOBJ = calculateRelative(pointsOBJ, config.data)

	const teamArr = Object.values(newPointsOBJ);
	
	// set 대회별 팀별 points
	teamArr.sort((a, b)=> b.points - a.points);
	// set staticStructArr.rank
	let rank = 1;
	let oldPoints = teamArr[0].points;
	teamArr.forEach(team => {
		if (team.points < oldPoints) rank++;
		oldPoints = team.points;
		team.rank = rank;
	})

	// set 대회별 팀별 상대 points
	teamArr.sort((a, b)=> b.pointsR - a.pointsR);
	rank = 1;
	oldPoints = teamArr[0].pointsR;
	teamArr.forEach(team => {
		if (team.pointsR < oldPoints) rank++;
		oldPoints = team.pointsR;
		team.rankR = rank;
	})

	//-----> update teamPoints
	await mongodb.deleteMany(mongoCFG.Medalbank.teamStatics, { competitionID: competitionID });

	//-----> insert teamPoints
	await mongodb.insertMany(mongoCFG.Medalbank.teamStatics, teamArr );

	return teamArr;
}

//===================================================
//	calculate total team points
//===================================================
async function calculateTotalTeamsStatics() {
// async function calculateTotalTeamsPoints() {
	
	const context = {
		query			: { competitionID: { $gt: 0 } },
		projection: { _id: 0 },
		limit			: 10000,
		skip			: 0,
	}
	const totals = await mongodb.find(mongoCFG.Medalbank.teamStatics, context)

	// initialize
	//------------------------------------------
	const totalPointOBJ = {};
	for (const newPoint of totals.data) {
		totalPointOBJ[newPoint.teamID] = {			
			teamID		: newPoint.teamID,	
			team			: '',
			competitionID	: 0,	
			athletes	: 0,	
			events		: 0,	
			start			: 0,	
			season		: 0,	
			points		: 0,	
			pointsR		: 0,	
			eventsR		: 0,	
			seasonR		: 0,	
			startR		: 0,	
			rank			: 0,	
			rankR			: 0,	
			medals: {	
				total: {	
					total	: 0,
					gold	: 0,
					silver: 0,
					bronze: 0,
				},	
				individual: {	
					total	: 0,
					gold	: 0,
					silver: 0,
					bronze: 0,
				},	
				team: {		
					total	: 0,
					gold	: 0,
					silver: 0,
					bronze: 0,
				}	
			},	
			medalsR: {	
				total: {		
					total	: 0,
					gold	: 0,
					silver: 0,
					bronze: 0,
				},	
				individual: {		
					total	: 0,
					gold	: 0,
					silver: 0,
					bronze: 0,
				},	
				team: {		
					total	: 0,
					gold	: 0,
					silver: 0,
					bronze: 0,
				}	
			},	
			styles: {				
				total: {	
					total   				: 0,
					freestyle  			: 0,
					backstroke  		: 0,
					breaststroke		: 0,
					butterfly   		: 0,
					individualMedley: 0,
				},	
				individual: {	
					total   				: 0,
					freestyle  			: 0,
					backstroke  		: 0,
					breaststroke		: 0,
					butterfly   		: 0,
					individualMedley: 0,
				},	
				team: {	
					men: {	
						total   			: 0,
						freestyleRelay: 0,
						medleyRelay   : 0,
					},	
					women: {	
						total   			: 0,
						freestyleRelay: 0,
						medleyRelay   : 0,
					},	
					mixed: {	
						total   			: 0,
						freestyleRelay: 0,
						medleyRelay   : 0,
					},	
				},		
			},	
			stylesR: {		
				total: {	
					total   				: 0,
					freestyle  			: 0,
					backstroke  		: 0,
					breaststroke		: 0,
					butterfly   		: 0,
					individualMedley: 0,
				},	
				individual: {	
					total   				: 0,
					freestyle  			: 0,
					backstroke  		: 0,
					breaststroke		: 0,
					butterfly   		: 0,
					individualMedley: 0,
				},	
				team: {	
					men: {	
						total   			: 0,
						freestyleRelay: 0,
						medleyRelay   : 0,
					},	
					women: {	
						total   			: 0,
						freestyleRelay: 0,
						medleyRelay   : 0,
					},	
					mixed: {	
						total   			: 0,
						freestyleRelay: 0,
						medleyRelay   : 0,
					},	
				},	
			},	
			styleMedals: {		
				total: {	
					total   				: 0,
					freestyle  			: 0,
					backstroke  		: 0,
					breaststroke		: 0,
					butterfly   		: 0,
					individualMedley: 0,
				},	
				individual: {	
					total   				: 0,
					freestyle  			: 0,
					backstroke  		: 0,
					breaststroke		: 0,
					butterfly   		: 0,
					individualMedley: 0,
				},	
				team: {	
					men: {	
						total   			: 0,
						freestyleRelay: 0,
						medleyRelay   : 0,
					},	
					women: {	
						total   			: 0,
						freestyleRelay: 0,
						medleyRelay   : 0,
					},	
					mixed: {	
						total   			: 0,
						freestyleRelay: 0,
						medleyRelay   : 0,
					},	
				},		
			},	
			styleMedalsR: {		
				total: {	
					total   				: 0,
					freestyle  			: 0,
					backstroke  		: 0,
					breaststroke		: 0,
					butterfly   		: 0,
					individualMedley: 0,
				},	
				individual: {	
					total   				: 0,
					freestyle  			: 0,
					backstroke  		: 0,
					breaststroke		: 0,
					butterfly   		: 0,
					individualMedley: 0,
				},	
				team: {	
					men: {	
						total   			: 0,
						freestyleRelay: 0,
						medleyRelay   : 0,
					},	
					women: {	
						total   			: 0,
						freestyleRelay: 0,
						medleyRelay   : 0,
					},	
					mixed: {	
						total   			: 0,
						freestyleRelay: 0,
						medleyRelay   : 0,
					},	
				},	
			},	
		};
	};
	//------------------------------------------

	//------------------------------------------
	for (const newPoint of totals.data) {
		const totalPoints = totalPointOBJ[newPoint.teamID];

		totalPoints.team		= newPoint.team;

		totalPoints.points	+= newPoint.points;
		totalPoints.events	+= newPoint.events;
		totalPoints.season	+= newPoint.season;
		totalPoints.athletes	+= newPoint.athletes;
		totalPoints.start		+= newPoint.start;				
			
		totalPoints.pointsR	+= newPoint.pointsR;
		totalPoints.eventsR	+= newPoint.eventsR;
		totalPoints.seasonR	+= newPoint.seasonR;
		totalPoints.startR	+= newPoint.startR;

		//--------------------------	
		// medals	
		//--------------------------	
		totalPoints.medals	= addMedal(totalPoints.medals, newPoint.medals);				
		//--------------------------	
		// medals 상대점수	
		//--------------------------	
		totalPoints.medalsR = addMedal(totalPoints.medalsR, newPoint.medalsR);

		//--------------------------	
		// styles	
		//--------------------------
		totalPoints.styles	= addStyle(totalPoints.styles, newPoint.styles);
		// styles 상대점수
		totalPoints.stylesR = addStyle(totalPoints.stylesR, newPoint.stylesR);

		//--------------------------	
		// style Medals	
		//--------------------------
		totalPoints.styleMedals		= addStyle(totalPoints.styleMedals, newPoint.styleMedals);
		// style Medals 상대점수
		totalPoints.styleMedalsR	= addStyle(totalPoints.styleMedalsR, newPoint.styleMedalsR);
	}; // end for
	//------------------------------------------
	
	const totalArr = Object.values(totalPointOBJ);
	// set 팀별 points
	totalArr.sort((a, b)=> b.points - a.points);
	rank = 1;
	oldPoints = totalArr.length == 0 ? 999999 : totalArr[0].points;
	totalArr.forEach(team => {
		delete team["_id"];
		if (team.points < oldPoints) rank++;
		oldPoints = team.points;
		team.rank = rank;
	})
	
	// set 팀별 상대 points
	totalArr.sort((a, b)=> b.pointsR - a.pointsR);
	rank = 1;
	oldPoints = totalArr.length == 0 ? 999999 : totalArr[0].pointsR;
	totalArr.forEach(team => {
		if (team.pointsR < oldPoints) rank++;
		oldPoints = team.pointsR;
		team.rankR = rank;
	})

	console.log("----------------------> totalArr=", totalArr.length);
	//-----> update teamPoints
	await mongodb.deleteMany(mongoCFG.Medalbank.teamStatics, { competitionID: 0 });
	//-----> insert teamPoints
	for (const team of totalArr) {
		console.log("competitionID=", team.competitionID, "teamID=", team.teamID, "team=", team.team);
		await mongodb.insertOne(mongoCFG.Medalbank.teamStatics, team );

	}
	// await mongodb.insertMany(mongoCFG.Medalbank.teamStatics, totalArr );

	return totalArr;

}
