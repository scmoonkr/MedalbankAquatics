const _    			= require('lodash');
const extend = require('node.extend');
const MongoDB     = require('../../Class/MongoDB.js');
const mongoCFG    = require('../../Config/mongoCFG.js');
const mongodb     = new MongoDB(mongoCFG.Medalbank.database);
const TimeLibrary = require('../../Class/TimeLibrary.js');

const timeLibrary = new TimeLibrary();

//-----------------------------------------------
//	build teams statistics
//-----------------------------------------------

// teams.build.js
exports.buildTeamsStatistics = async (teamID, times, teamPoints) => {
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
  value.swimmersEvent 	= timeLibrary.getAthletesByCount(times, 10);
  value.competitions		= timeLibrary.getCompetitionsByCountOfTeam(value.teamID, times, 1000); // 처리 필요: athleteCount, medal, pbs
  // value.teamTimes				= times.filter(time => time.style.includes("Relay"));
  value.bestTimes				= timeLibrary.findBestTime(times, 1);
  value.latest					= timeLibrary.findLatestTime(times, 1);
  value.first						= timeLibrary.findFirstTime(times, 1);
  value.medals					= timeLibrary.countByStyleAndGender(times);
  value.major						= timeLibrary.getStylesByCount(times);

  value.competitionCount= value.competitions.length;

  // calculate points
  let points = 0;
  for (const medal of value.medals) {
    if (medal.style.includes("Relay")) {
      points += medal.gold 	 * teamPoints.goldTeam +
                medal.silver * teamPoints.silverTeam +
                medal.bronze * teamPoints.bronzeTeam;
    } else {
      points += medal.gold 	 * teamPoints.goldIndividual +
                medal.silver * teamPoints.silverIndividual +
                medal.bronze * teamPoints.bronzeIndividual;
    }	
  } // end for
  points += value.timeCount 			 * teamPoints.start;
  points += value.athleteCount 		 * teamPoints.athletes;
  points += value.competitionCount * teamPoints.events;
  // points 계산
  value.points = points;
  teamsStatistics.push(value);

  return teamsStatistics;
}

// teams.build.js
exports.buildTeamsStatisticsAll = async (timeArr) => {
console.log("calculateTeamStatistics.times=", timeArr.length);
// team point 계산용 배점 정보
// const config = await mongodb.findOne(mongoCFG.Medalbank.config, { type: "teamPoints" }, { _id:0, type:0, } );
// const teamPoints = config.data; // team point 계산용 배점 정보
let teamPoints = memoryDB.getCofig("teamPoints");
if (!teamPoints.goldTeam) {
  teamPoints = {
    type: 'teamPoints',
    events: 1,
    season: 1,
    athletes: 1,
    start: 1,
    goldIndividual: 3,
    silverIndividual: 2,
    bronzeIndividual: 1,
    goldTeam: 12,
    silverTeam: 8,
    bronzeTeam: 4
  }
}

const grouped = _.groupBy(timeArr, (entry) => entry.teamID);


const bulkStatistics = [];
const bulkTeams = [];
//---------------------------------------
for (const teamID of Object.keys(grouped)) {
  const statics = await this.buildTeamsStatistics(teamID, grouped[timeID], teamPoints);

  bulkStatistics.push({
    updateOne: {
      filter: query,
      update: { 
        $set: {
          poolID: poolID,
          ...statistics,
        },
        // $unset: { times: 1 },
      }
    }
  });
  
  bulkTeams.push({
    updateOne: {
      filter: query,
      update: { 
        $set: {
          athleteCount: statistics.athleteCount,
          timeCount		: statistics.timeCount,
          points			: statistics.points,
        },
        // $unset: { times: 1 },
      },
      upsert: true,
    }
  });
} // end for
//---------------------------------------
result = await mongodb.bulkWrite(mongoCFG.Medalbank.teamsStatistics, bulkStatistics);
result = await mongodb.bulkWrite(mongoCFG.Medalbank.teams, bulkTeams);
//---------------------------------------
}