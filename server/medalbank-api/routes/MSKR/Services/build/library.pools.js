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

exports.buildPoolsStatistics = async (poolID, times) => {
  const value = {
    poolID		: Number(poolID),
    timeCount	: times.length, 
  };
  value.athleteCount		= Object.entries(_.countBy(times, "athleteID"))
                                .map(([data, count]) => ({
                                      athleteID: Number(data),
                                      count,
                                    }))
                                .filter(data => !isNaN(data.athleteID) && data.athleteID != 'undefined').length
  value.swimmersEvent 	= timeLibrary.getAthletesByCount(times, 10);
  value.competitions		= timeLibrary.getCompetitionsByCountOfTeam(value.poolID, times, 1000); // 처리 필요: athleteCount, medal, pbs
  // value.teamTimes				= times.filter(time => time.style.includes("Relay"));
  value.bestTimes				= timeLibrary.findBestTime(times, 1);
  value.latest					= timeLibrary.findLatestTime(times, 1);
  value.first						= timeLibrary.findFirstTime(times, 1);
  // value.medals					= timeLibrary.countByStyleAndGender(times);
  // value.major						= timeLibrary.getStylesByCount(times);

  value.competitionCount= value.competitions.length;

  return value;
}


exports.buildPoolsStatisticsAll = async (timeArr) => {
  if (timeArr.length == 0) return {};

  const grouped = _.groupBy(timeArr, (entry) => entry.poolID);
  

  const bulkStatistics = [];
  const bulkPools = [];
  //------------------------------
  for (const poolID of Object.keys(grouped)) {
    const statistics = await this.buildPoolsStatistics(poolID, grouped[poolID]);
    const query = { poolID : Number(poolID) };
    //---------------------------------	
  
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
    
    bulkPools.push({
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
  result = await mongodb.bulkWrite(mongoCFG.Medalbank.poolsStatistics, bulkStatistics);
  result = await mongodb.bulkWrite(mongoCFG.Medalbank.pools, bulkPools);
  //------------------------------
}
