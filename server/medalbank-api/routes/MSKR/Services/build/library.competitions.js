const _    			= require('lodash');
const extend = require('node.extend');
const MongoDB     = require('../../Class/MongoDB.js');
const mongoCFG    = require('../../Config/mongoCFG.js');
const mongodb     = new MongoDB(mongoCFG.Medalbank.database);
const TimeLibrary = require('../../Class/TimeLibrary.js');

const timeLibrary = new TimeLibrary();

//-----------------------------------------------
//	build competitions statistics
//-----------------------------------------------

// athletes.build.js
exports.buildCompetitionStatisticsAll = async (timeArr, timeLimit=32) => {
  const grouped = _.groupBy(timeArr, (entry) => entry.competitionID);
  

  const bulkCompetitions = [];
  const competitionsStatistics = [];
  const competitionIDs = [];
  for (let competitionID of Object.keys(grouped)) {
    competitionID = Number(competitionID);
    const times = grouped[competitionID];
    competitionIDs.push(competitionID);

    const value = await this.buildCompetitionStatistics(competitionID, times);

    competitionsStatistics.push(value);

    bulkCompetitions.push({
      updateOne: {
        filter: { competitionID: value.competitionID },
        update: { 
          $set: {
            timeCount			: value.timeCount ?? 0,
            athleteCount	: value.athleteCount ?? 0,
            teamRank			: value.teamRank ?? [],
          },
          // $unset: { times: 1 },
        },
        upsert: true,
      }
    });
  } // end for
  console.log("competitionsStatistics=", competitionsStatistics);
  //---------------------------------------
  if (competitionsStatistics.length == 0) competitionsStatistics;
  result = await mongodb.bulkWrite(mongoCFG.Medalbank.competitions, bulkCompetitions);
  result = await mongodb.deleteMany(mongoCFG.Medalbank.competitionsStatistics, { competitionID: { $in: competitionIDs } });
  result = await mongodb.insertMany(mongoCFG.Medalbank.competitionsStatistics, competitionsStatistics);


  return competitionsStatistics;
}

exports.buildCompetitionStatistics = async (competitionID, times) => {
console.log("times=", times.length);
  const value = {
    competitionID	: Number(competitionID),
    timeCount			: times.length,
  };
  value.athleteCount		= [...new Set(times.map((item) => item.name))].length;
  value.bestTimes				= timeLibrary.findBestTime(times, 3);
  // value.medals					= timeLibrary.countByStyleAndGender(times);
  value.styleDistances	= timeLibrary.getDistance4GenderStyle(times); // gender-style, 50M, 100M, 200M, ...
  value.ageGroups				= timeLibrary.getAgeGroupByCount(times);
  value.teamRank        = timeLibrary.getTeamsByCount(times);
  value.teams 					= timeLibrary.getTeamsMedalsPoints(times);			

  return value;
}

