const _    				= require('lodash');
const extend 			= require('node.extend');
const utilLibrary = require("../../Util/utilLibrary");
const utilError		= require("../../Util/utilError");

const mongoCFG 		= require('../../Config/mongoCFG');
const mongoDB			= require('../../Class/MongoDB');
const mongodb 		= new mongoDB(mongoCFG.Medalbank.database);

const MemoryDB 		= require('../../Class/MemoryDB');
const memoryDB		= new MemoryDB();

const UtilDate		= require("../../Class/DateLibrary");
const utilDate		= new UtilDate();

const TimeLibrary		= require("./times.library");

//-----------------------------------------------
//	build pools
//-----------------------------------------------
exports.buildPools = async (query) => {
	const context = {
		query			: query,
		projection: { _id:0, },
		limit			: 100000,
		skip			: 0,
		sort			: { _id: -1 },
	}
	result = await mongodb.find(mongoCFG.Medalbank.times, context);

	const utilTime = new TimeLibrary();
	const times = utilTime.setCompetitionTeamPool(result.data);
	
	const pools = await this.buildPoolStatistics(times);
}
//-----------------------------------------------
//	build pools
//-----------------------------------------------
exports.getCompetitionIDs4Pool = async (poolID) => {
	const context = {
		query			: { poolID: poolID },
		projection: { _id:0, competitionID:1 },
		limit			: 100000,
		skip			: 0,
		sort			: { _id: -1 },
	}
	result = await mongodb.find(mongoCFG.Medalbank.competitions, context);
	return result.data.map(competition => competition.competitionID);
}
/*
      List<Map<String, dynamic>> times = TimeConverter.setCompetitionPoolTeam(
          json['statistics']['bestTimes'], json['statistics']);
"삼위", "사랑", "믿음", "제자", "모범", "계명", "역사", "예언", "가족", "범죄", "악행", "구원"


1462780


pools
-----------------------
latest
first
"competitions" : [ 
        {
            "competitionID" : 1309,
            "fullname" : "제17회 이천시장배 겸 이천시수영연맹회장배 전국 마스터즈 수영대회",
            "order" : 17,
            "year" : 2023,
            "pool" : "",
            "poolID" : 1005,
            "sido" : "경기",
            "dateStart" : "2023-09-02",
            "count" : 1,
            "athleteCount" : 336,
            "timeCount" : 728,
            "golds" : 144,
            "silvers" : 126,
            "bronzes" : 97
        }, 
]
"athletes" : [ 
        {
            "athleteID" : 1,
            "name" : "문성태",
            "pool" : "인천수영연합회",
            "nameHide" : "문성㉫",
            "athleteCount" : 9,
            "timeCount" : 9
        }, 
]
"pools" : [ 
        {
            "timeID" : 128,
            "pool" : "스윔온",
            "count" : 2529
        }, 
]
athleteCount
timeCount

timeResult
{
	freestyle: { times, athletes },
}

bestTimeTimes

bestEventTimes

*/
//-----------------------------------------------
//	build pools statistics
//-----------------------------------------------
exports.buildPoolStatistics = async (timeArr) => {
	const grouped = _.groupBy(timeArr, (entry) => entry.poolID);
	
	const utilTime = new TimeLibrary();

	const poolsStatistics = [];
	for (const poolID of Object.keys(grouped)) {
		const times = grouped[poolID];
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
		value.competitions		= utilTime.getCompetitionsByCountOfTeam(value.poolID, times, 1000); // 처리 필요: athleteCount, medal, pbs
		value.competitionCount= value.competitions.length;
		value.latest					= utilTime.findLatestTime(times, 1);
		value.swimmersEvent 	= utilTime.getAthletesByCount(times, 10);
		value.timekeepers 		= utilTime.getTimekeepersByCount(times, 10);
		value.bestTimes				= utilTime.findBestTime(times, 3);
		
		/*
		// calculate points
		let points = 0;
		for (const medal of value.medals) {
			if (medal.style.includes("Relay")) {
				points += medal.gold * poolPoints.goldTeam+
									medal.silver * poolPoints.silverTeam +
									medal.bronze * poolPoints.bronzeTeam;
			} else {
				points += medal.gold * poolPoints.goldIndividual+
									medal.silver * poolPoints.silverIndividual +
									medal.bronze * poolPoints.bronzeIndividual;
			}	
		} // end for
		points += value.timeCount * poolPoints.start;
		points += value.athleteCount * poolPoints.athletes;
		points += value.competitionCount * poolPoints.events;
		// points 계산
		value.points = points;
		*/
		poolsStatistics.push(value);

	} // end for

	// console.log("poolPoints:", poolsStatistics.length);
	const poolIDs = [...new Set(timeArr.map((entry) => entry.poolID))];
	console.log("poolIDs=", poolIDs);
	let result = await mongodb.deleteMany(mongoCFG.Medalbank.poolsStatistics, { poolID: { $in: poolIDs } });
	console.log("delete=", result);
	result = await mongodb.insertMany(mongoCFG.Medalbank.poolsStatistics, poolsStatistics );
	console.log("insert=", poolsStatistics);

	
	//---------------------------------------------
	for (const pool of poolsStatistics) {
		const query = { poolID: pool.poolID };
		const value = { timeCount: pool.timeCount, athleteCount: pool.athleteCount };
		result = await mongodb.updateOne(mongoCFG.Medalbank.pools, query, value );
	}
	//---------------------------------------------

	return poolsStatistics;
}