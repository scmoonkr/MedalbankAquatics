
const multiSort   = require('multisort');
const mskCFG 			= require('../../../Config/mskCFG');
const mongoCFG 		= require('../../../Config/mongoCFG');
const mongoDB			= require('../../../Class/MongoDB');
const mongodb 	  = new mongoDB(mongoCFG.Medalbank.database);

const utilLibrary = require("../../../Util/utilLibrary");

const LoadCollections = require('./loadCollections');

const MemoryDB 		= require('../../../Class/MemoryDB');
const memoryDB		= new MemoryDB();

const MAX_RANK = 3;

// get min, max date & object
exports.getMinMaxDate = (objArray, field) => {
	if (objArray.length == 0) {
		return { min:'', max: '', minOBJ: {}, maxOBJ: {} }
	}
	let minOBJ, maxOBJ;
	let { minDatetime, maxDatetime } = objArray.reduce((result, current) => {
                                                  const datetime = typeof current[field] == 'string' ? new Date(current[field]) : current[field];
                                                  if (!result.minDatetime || datetime < result.minDatetime) {
                                                    result.minDatetime = datetime;
                                                    minOBJ = current;
                                                  }
                                                  if (!result.maxDatetime || datetime > result.maxDatetime) {
                                                    result.maxDatetime = datetime;
                                                    maxOBJ = current;
                                                  }
                                                  return result;
                                                },
                                                { minDatetime: null, maxDatetime: null }
                                              );
  minDatetime = minDatetime || "";
  maxDatetime = maxDatetime || ""; 
	// console.log(minOBJ, minDatetime, maxDatetime);
	const result = {
		min: typeof minDatetime == 'string' ? minDatetime.slice(0, 10) : minDatetime.toISOString().slice(0, 10),
		max: typeof maxDatetime == 'string' ? maxDatetime.slice(0, 10) : maxDatetime.toISOString().slice(0, 10),
		minOBJ: minOBJ,
		maxOBJ, maxOBJ,
	}
	return result;
}

// get min, max number & object
exports.getMinMaxNumber = (objArray, field) => {
	let minOBJ, maxOBJ;
	const { min, max } = objArray.reduce((result, current) => {
			if (!result.min || current[field] < result.min) {
				result.min = current[field];
				minOBJ = current;
			}
			if (!result.max || current[field] > result.max) {
				result.max = current[field];
				maxOBJ = current;
			}
			return result;
		},
		{ min: null, max: null }
	)
	const result = {
		min: min, max: max,
		minOBJ: minOBJ, maxOBJ, maxOBJ,
	}
	return result;
}

exports.distinctCount = (objArray, field) => {
	return [...new Set(objArray.map((item) => item[field]).map(entry => entry))]


	// result = objArray.filter((item) => item.style === 'breaststroke');
	const arr = objArray.map((item) => item[field]);

	// result= [ 1, 2, 3, 4, 5,3,4,2,7 ];
	// Convert the array to a Set to remove duplicates
	const distinctNumbersSet = new Set(arr);	// Set(6) { 1, 2, 3, 4, 5, 7 }
	// Convert the Set back to an array using Array.from() or the spread operator
	const distinctNumbersArray = Array.from(distinctNumbersSet);	// [ 1, 2, 3, 4, 5, 7 ]
	return distinctNumbersArray;
}



exports.buildPersonalBestsInfo = (teamTimes, gender, style) => {
	const bestTimes = teamTimes.filter(dist =>
																		dist.gender == gender &&
																		dist.style == style
																	)

	const personalBest = {
		gender: gender,
		style: style,
		// distance: distance,
		timeCount: 0,
		athleteCount: 0,
	}
//-----> personal bests
	if (bestTimes.length > 0) {
		for (const distance of mskCFG.distances) {
			let distanceTimes = bestTimes.filter(time => time.distance == distance);
			if (distanceTimes.length == 0) continue;
			// distanceTimes = distanceTimes.sort((a,b) => a.time - b.time);
			const times = [];
			for (let no=0; no < MAX_RANK && no < distanceTimes.length; no++) {

				times.push({
					rank			: no+1,
					timeID		: distanceTimes[no].timeID,
					athleteID	: distanceTimes[no].athleteID,
					teamID		: distanceTimes[no].teamID,
					competitionID: distanceTimes[no].competitionID,
					name			: distanceTimes[no].name,
					nameHide	: distanceTimes[no].nameHide,
					team			: distanceTimes[no].team,
					times			: distanceTimes[no].times,
					time			: distanceTimes[no].time,
					datetime	: distanceTimes[no].datetime,
				});	
			} // end for
			personalBest[distance] = times;
			personalBest.timeCount += distanceTimes.length;
			personalBest.athleteCount += this.distinctCount(distanceTimes, "athleteID").length;
		} // end for
	} // end if

	return personalBest
}

//
exports.buildPersonalBestsStylesInfo = (times) => {
	
	//-----> personal best
	// const extraInfo = {
	// 	PBs						: [],
	// 	personalBests	: [],
	// 	styles				: [],
	// };
	const PBs = [];
	const personalBests = [];
	const styles = [];
	const majorStyles = {}

	for (const gender of mskCFG.genders) {
		for (const style of mskCFG.styles) {
			const stylesOBJ = { gender: gender, style: style };
			// const countOBJ = {};
			for (const distance of mskCFG.distances) {
				let bestTimes = times.filter(dist =>	dist.gender		== gender &&
																								dist.style		== style &&
																								dist.distance	== distance
																							);
				//-----> bestTimes
				if (bestTimes.length > 0) {
					// bestTimes = bestTimes.sort((a,b) => a.time - b.time);
					const pb = {
						gender			: gender,
						style				: style,
						distance		: distance,
						timeCount		: 0,
						athleteCount: 0,
						times				: [],
					}
					for (let no=0; no < MAX_RANK && no < bestTimes.length; no++) {
						pb.times.push({
							rank					: no+1,
							timeID				: bestTimes[no].timeID,
							athleteID			: bestTimes[no].athleteID,
							teamID				: bestTimes[no].teamID,
							competitionID	: bestTimes[no].competitionID,
							name					: bestTimes[no].name,
							nameHide			: bestTimes[no].nameHide,
							team					: bestTimes[no].team,
							times					: bestTimes[no].times,
							time					: bestTimes[no].time,
							datetime			: bestTimes[no].datetime,
						});
					} // end for
					pb.timeCount = bestTimes.length;
					pb.athleteCount = this.distinctCount(bestTimes, "athleteID").length;

					// if (pb.timeCount > 0 && pb.athleteCount > 0) {
					// 	if (!countOBJ[distance]) countOBJ[distance] = {};
					// 	countOBJ[distance].timeCount = pb.timeCount;
					// 	countOBJ[distance].athleteCount = pb.athleteCount;
					// }

					// pb.times = pb.times.sort((a,b) => a.time - b.time);
					PBs.push(pb);
			
					stylesOBJ[distance] = { timeCount: pb.timeCount, athleteCount: pb.athleteCount, }
					majorStyles[style] = majorStyles[style] || 0;
					majorStyles[style] += pb.timeCount
				} // if bestTimes.isNotEmpty
			} // for distance

			//-----------------------------------
			const pbest = this.buildPersonalBestsInfo(times, gender, style);
			// pbest.count = countOBJ;
			if (pbest.timeCount > 0) personalBests.push(pbest);
			//-----------------------------------

			// distance가 있는 경우
			if (Object.keys(stylesOBJ).length > 2) styles.push(stylesOBJ);				
		}	
	}
	
	const majorStyle = { style: '', count: 0 };
	Object.keys(majorStyles).forEach(style => {
		if (majorStyle.count < majorStyles[style]) {
			majorStyle.count = majorStyles[style]
			majorStyle.style = style
		}
	})

	return { PBs, personalBests, styles, majorStyle: majorStyle.style };
}

exports.buildCompetitionsInfo = async (timeArr) => {
	const competitionIDs = this.distinctCount(timeArr, "competitionID")

	const competition = {
		count				: competitionIDs.length,
		timeCount		: timeArr.length,
		athleteCount: 0,
		golds				: 0,
		silvers			: 0,
		bronzes			: 0,
		total				: 0
	}
	const competitionArr = [];
	for (const cid of competitionIDs) {
		const ctimes = timeArr.filter(tm => tm.competitionID == cid)
		const cp = memoryDB.getCompetition(cid);
		const comp = {
			competitionID	: cid,
			fullname			: cp.fullname,
			order					: cp.order,
			year					: cp.year,
			pool					: cp.pool,
			poolID				: cp.poolID,
			sido					: cp.sido,
			dateStart			: cp.dateStart,
			count					: 1,	// conpetition 수
			athleteCount	: this.distinctCount(ctimes, "athleteID").length,
			timeCount			: ctimes.length,
			golds					: ctimes.filter(tm => tm.rank == 1).length,
			silvers				: ctimes.filter(tm => tm.rank == 2).length,
			bronzes				: ctimes.filter(tm => tm.rank == 3).length,
			// total			: 1,	
		}
		competitionArr.push(comp);
		competition.athleteCount 	+= comp.athleteCount;
		competition.golds 	+= comp.golds;
		competition.silvers += comp.silvers;
		competition.bronzes += comp.bronzes;
		competition.total 	+= comp.golds + comp.silvers + comp.bronzes;
	}
	const competitions = utilLibrary.sortArray(competitionArr, "dateStart", -1).slice(0, 10);
	return { competition, competitions };
}

exports.buildTeamsInfo = (timeArr, extraInfo) => {
	//-----> teams
	const teams = timeArr.reduce((teamCounts, time) => {
		if (teamCounts[time.teamID]) {
			teamCounts[time.teamID].count += 1;
		} else {
			teamCounts[time.teamID] = { timeID: time.teamID, team: time.team, count: 1 };
		}
		return teamCounts;
	}, {});

	const teamArr = utilLibrary.sortArray(Object.values(teams), "count", -1).slice(0, 10);
	
	return teamArr;
}

exports.buildAthletesInfo = (timeArr) => {
	//-----> athletes
	const athletes = timeArr.reduce((obj, time) => {
                            if (obj[time.athleteID]) {
                              obj[time.athleteID].athleteCount++;
                            } else {
                              obj[time.athleteID] = { athleteID: time.athleteID, name: time.name, team: time.team, time: time.time, times: time.times, athleteCount: 1, timeCount: 0 };
                            }
                            obj[time.athleteID].timeCount++;
                            return obj;
                          }, {});

  athleteArr = Object.values(athletes)
                      .sort((a, b) => b.time - a.time)
                      .slice(0, 10);
	return athleteArr;
}
