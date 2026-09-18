const _    			= require('lodash');
const extend = require('node.extend');
const MongoDB     = require('../../Class/MongoDB.js');
const mongoCFG    = require('../../Config/mongoCFG.js');
const mongodb     = new MongoDB(mongoCFG.Medalbank.database);
const TimeLibrary = require('../../Class/TimeLibrary.js');

const timeLibrary = new TimeLibrary();

// athletes.build.js
exports.buildAthletesStatistics = async (athleteID, times, limit=32) => {
	if (times.length == 0) return {};
console.log("times=", times);
	const eventTimes			= times.filter(time => time.competitionID > 0);
	const timeTimes				= times.filter(time => time.competitionID == undefined ||
																							 time.competitionID == 0);
	const statistics = {
		athleteID					: athleteID,
		timeCount					: times.length,						// time count
		// athleteCount			: allAthleteIDs.length,		// athlete count
		timeTimeCount			: timeTimes.length,				// event time count
		// timeAthleteCount	: timeAthleteIDs.length,	// event athlete count
		eventTimeCount		: eventTimes.length,			// event time count
		// eventAthleteCount	: eventAthleteIDs.length,	// event athlete count
	};

	statistics.majorStyles  		= timeLibrary.getStylesByCount(times);
	statistics.competitions 		= timeLibrary.getCompetitionsByCount(times);
	statistics.teams        		= timeLibrary.getTeamsByCount(times);
	statistics.pools        		= timeLibrary.getPoolsByCount(times);
	statistics.cities       		= timeLibrary.getSidosByCount(times);  
	// statistics.medals       		= timeLibrary.countMedalsByStyleAndGender(times);
	statistics.medals       		= timeLibrary.calculateMedals(times);

	statistics.firstEvent				= timeLibrary.findFirstTime(eventTimes);
	statistics.latestEvent			= timeLibrary.findLatestTime(eventTimes);
	const validTimes = eventTimes.filter(time => time.time != '' && time.timeStamp > 0 && time.course == "LCM" &&
																			 (
																				["freestyle", "backstroke", "breaststroke", "butterfly"].includes(time.style) && time.distance == "50M" ||
																			  time.style == "individualMedley" && time.distance == "200M"
																			 )
																			);
	// for (const time of validTimes) {
	// 	console.log(time.timeID, time.style,time.course, time.distance, time.time, time.timeStamp);
	// }
	statistics.bestEvent				= timeLibrary.calculateBestTimeWithSeason(validTimes);

	statistics.firstTime				= timeLibrary.findFirstTime(timeTimes);
	statistics.latestTime				= timeLibrary.findLatestTime(timeTimes);
	statistics.bestTime					= timeLibrary.calculateBestTimeWithSeason(timeTimes);
	statistics.timekeeper				= timeLibrary.getTimekeepersByCount(timeTimes);

	
	const styles = [];
	if (statistics.bestEvent && statistics.bestEvent.length > 0) {
			for (const best of statistics.bestEvent) {
				if (best.style.includes("Relay")) continue;
				let style = {};
				style.style = best.style;
				style.count = best.timeCount;
				if (best.style=="individualMedley") {
					if (best.distance=="200M") {
						style.timeID = best.best.timeID;
						style.time = best.best.time;
						style.datetime = best.best.datetime;
					}
				} else {
					if (best.distance=="50M") {
						style.timeID = best.best.timeID;
						style.time = best.best.time;
						style.datetime = best.best.datetime;
					}
				}
				styles.push(style);
			}
			styles.sort((a, b) => b.timeCount - a.timeCount);
	}

	const extraInfo = {
		// athleteID: statistics.athleteID,
		// count					: statistics.timeCount ?? 0,
		timeTimeCount	: statistics.timeTimeCount ?? 0,
		eventTimeCount: statistics.eventTimeCount ?? 0,
		medals				: statistics.medals ?? {},
		teams					: statistics.teams ?? [],
		pools					: statistics.pools ?? [],
		bestEvent			: styles,
		firstEvent:{
			timeID: statistics.firstEvent.timeID,
			time: statistics.firstEvent.time,
			datetime: statistics.firstEvent.datetime,
		},
		latestEvent: {
			timeID: statistics.latestEvent.timeID,
			time: statistics.latestEvent.time,
			datetime: statistics.latestEvent.datetime,
		},
	};
	console.log("extraInfo=", extraInfo);

	return extraInfo;
}

// athletes.build.js
exports.buildAthletesStatisticsAll = async (times, timeLimit=32) => {
	const timesAthleteID = _.groupBy(times, el => el.athleteID);
	
	const staticsArr = [];
	//---------------------------------------
	for (const athleteID of Object.keys(timesAthleteID)) {
		// console.log("athleteID=", athleteID, "times=", timesAthleteID[kathleteIDey].length, timesAthleteID[key][0]);
		// const statistics = await this.buildAthleteStatistics(timesAthleteID[key], 32);
		const statistics = await this.buildAthletesStatistics(Number(athleteID), timesAthleteID[athleteID], 32);
		//---------------------------------
		statistics.athleteID = Number(athleteID);
		staticsArr.push(statistics)
		// console.log(statistics);
	} // end for
	//---------------------------------------
	return staticsArr;
}
// athletes.build.js
exports.updateAthletesStatisticsAll = async (times, timeLimit=32) => {
	const timesAthleteID = _.groupBy(times, el => el.athleteID);
	
	const bulkStatistics = [];
	const bulkAthletes = [];
	//---------------------------------------
	for (const key of Object.keys(timesAthleteID)) {
		console.log("athleteID=", key, "times=", timesAthleteID[key].length, timesAthleteID[key][0]);
		// const statistics = await this.buildAthleteStatistics(timesAthleteID[key], 32);
		const statistics = await this.buildAthletesStatistics(Number(key), timesAthleteID[key], 32);
		//---------------------------------
		// console.log(statistics);
		const athleteID = Number(key);
		const query = { athleteID : athleteID };
		//---------------------------------

		bulkAthletes.push({
			updateOne: {
				filter: query,
				update: { 
					$set: {
						count			: extraInfo.timeTimeCount + extraInfo.eventTimeCount,
						extraInfo	: extraInfo,
					},
					// $unset: { times: 1 },
				},
				upsert: true,
			}
		});
	} // end for
	//---------------------------------------
	result = await mongodb.bulkWrite(mongoCFG.Medalbank.athletes, bulkAthletes);
	// result = await mongodb.bulkWrite(mongoCFG.Medalbank.athletes, bulkStatistics);
}

//============================================
