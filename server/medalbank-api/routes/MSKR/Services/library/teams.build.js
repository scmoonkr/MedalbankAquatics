const _    				= require('lodash');
const extend 			= require('node.extend');
const utilLibrary = require("../../Util/utilLibrary");
const utilError		= require("../../Util/utilError");

const mongoCFG 		= require('../../Config/mongoCFG');
const mongoDB			= require('../../Class/MongoDB');
const mongodb	= new mongoDB(mongoCFG.Medalbank.database);

const MemoryDB 		= require('../../Class/MemoryDB');
const memoryDB		= new MemoryDB();

const UtilDate		= require("../../Class/DateLibrary");
const utilDate		= new UtilDate();

const TimeLibrary		= require("./times.library");
const TeamPointsClass = require('../teams/team_points.class');
const teamPointsClass	= new TeamPointsClass();

//-----------------------------------------------
//	build teams
//-----------------------------------------------
exports.buildTeamsStatistics = async (query) => {
	const context = {
		query			: query,
		projection: { _id:0, },
		limit			: 100000,
		skip			: 0,
		sort			: { _id: -1 },
	}
	let result = await mongodb.find(mongoCFG.Medalbank.times, context);

	const utilTime = new TimeLibrary();
	const times = utilTime.setCompetitionTeamPool(result.data);
	
	const { teamIDs, teams } =  await this.calculateTeamStatistics(times);

	console.log("teamIDs=", teamIDs);
	result = await mongodb.deleteMany(mongoCFG.Medalbank.teamStatics, { teamID: { $in: teamIDs } });
	console.log("delete=", result);
	result = await mongodb.insertMany(mongoCFG.Medalbank.teamStatics, teams );
	console.log("insert=", teams);
}

//-----------------------------------------------
//	build teams statistics
//-----------------------------------------------
exports.calculateTeamStatistics = async (timeArr) => {
	console.log("calculateTeamStatistics.times=", timeArr.length);
	// team point 계산용 배점 정보
	// const config = await mongodb.findOne(mongoCFG.Medalbank.config, { type: "teamPoints" }, { _id:0, type:0, } );
	// const teamPoints = config.data; // team point 계산용 배점 정보
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

	const grouped = _.groupBy(timeArr, (entry) => entry.teamID);
	
	const utilTime = new TimeLibrary();

	const teamsStatistics = [];
	for (const teamID of Object.keys(grouped)) {
		const times = grouped[teamID];
		const value = {
			teamID		: Number(teamID),
			timeCount	: times.length, 
		};
		value.athleteCount		= Object.entries(_.countBy(times, "athleteID"))
																	.map(([data, count]) => ({
																				athleteID: Number(data),
																				count,
																			}))
																	.filter(data => !isNaN(data.athleteID) && data.athleteID != 'undefined').length
		value.swimmersEvent 	= utilTime.getAthletesByCount(times, 60);
		value.competitions		= utilTime.getCompetitionsByCountOfTeam(value.teamID, times, 1000); // 처리 필요: athleteCount, medal, pbs
		// value.teamTimes				= times.filter(time => time.style.includes("Relay"));
		value.bestTimes				= utilTime.findBestTime(times, 1);
		value.latest					= utilTime.findLatestTime(times, 1);
		value.first						= utilTime.findFirstTime(times, 1);
		value.medals					= utilTime.countMedalsByStyleAndGender(times);
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
		teamsStatistics.push(value);
;
	} // end for
	const teamIDs = [...new Set(timeArr.map((entry) => entry.teamID))];
console.log("teamIDs=", teamIDs, );
	return { teamIDs: teamIDs, teams: teamsStatistics };
}