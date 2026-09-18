const _    			= require('lodash');
const mongoCFG 		= require('../../Config/mongoCFG.js');
const mongoDB			= require('../../Class/MongoDB.js');
const TimeLibrary	= require("../../Class/TimeLibrary");
const timeLibrary = new TimeLibrary();

// const mongodb 		= new mongoDB(mongoCFG.Breaststroke.database);
const mongodb 		= new mongoDB(mongoCFG.Breaststroke.database);

const collectionName = mongoCFG.Breaststroke.leaderboard;


exports.buildLeaderboardForTimes = async (times, timeLimit) => {
	if (times.length == 0) return [];
	
	const leaderboards = await new TimeLibrary().findBestTime(times, timeLimit);
  
	let lid = await mongodb.max(collectionName, "lid");
	console.log("lid=", lid);
	result = await mongodb.deleteMany(collectionName, {});
// 	result = await mongodb.insertMany(collectionName, leaderboards);
// return;
	//---------------------------------
	//---------------------------------
	const timeArr = [];
	for (const leaderboard of leaderboards) {
		if (leaderboard.discipline.includes("Relay")) continue;
		const value = {
			group		: "all",
			gender	: leaderboard.gender,
			discipline		: leaderboard.discipline,
			course	: leaderboard.course,
			distance: leaderboard.distance,
		};
		//---------------------------------
		for (const time of leaderboard.times) {
			const newTime = { ...value, ...time };
			newTime.lid = lid++;
			timeArr.push(newTime);
			// console.log(newTime.lid, newTime.timeID, timeArr.length);
		}
		console.log(lid, timeArr.length);
		//---------------------------------
		//---------------------------------
		//---------------------------------
	}
	result = await mongodb.insertMany(collectionName, timeArr);

	return timeArr;
}

//####################################################################
//######### Confirm ##################################################
//####################################################################

//------------------------------------------
//  leaderboard_medalbank
//     group: 'year|month|week|day'
//     datetime:
//       year  - year: '2024'
//       month - year: '2024', month:'01'
//       week  - year: '2024', month:'01', week: '1'
//       day   - year: '2024', month:'01', day: '1'
//------------------------------------------
function buildDatetimeQuery(body) {
  let startDate, endDate, today;
  switch (body.group) {
    case "year":
      //----------------------------------
      //  year
      //----------------------------------
      startDate = new Date(`${body.year}-01-01T00:00:00.000Z`);
      endDate   = new Date(`${body.year}-12-31T23:59:59.999Z`);
      break;
    case "month":
      //----------------------------------
      //  year-month
      //----------------------------------
      startDate = new Date(`${body.year}-${String(body.month).padStart(2, '0')}-01T00:00:00.000Z`);
      endDate   = new Date(new Date(`${body.year}-${String(body.month).padStart(2, '0')}-01T00:00:00.000Z`).setMonth(startDate.getMonth() + 1) - 1);  // 해당 월의 마지막 날
      break;
    case "week":
      //----------------------------------
      //  year-month-week
      //----------------------------------
      startDate = new Date(`${body.year}-${String(body.month).padStart(2, '0')}-01T00:00:00.000Z`);
      const weekStart = new Date(startDate.setDate((body.week - 1) * 7 + 1)); // week번째 주 시작
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6); // 주의 끝 날짜
      startDate = weekStart;
      endDate = new Date(weekEnd.setHours(23, 59, 59, 999)); // 주의 마지막 날의 끝
      break;
    case "day":
      //----------------------------------
      //  year-month-day
      //----------------------------------
      startDate = new Date(`${body.year}-${String(body.month).padStart(2, '0')}-${String(body.day).padStart(2, '0')}T00:00:00.000Z`);
      endDate   = new Date(`${body.year}-${String(body.month).padStart(2, '0')}-${String(body.day).padStart(2, '0')}T23:59:59.999Z`);
      break;
    case "thisMonth":
      //----------------------------------
      //  year-month
      //----------------------------------
      today = new Date().toISOString().slice(0, 10).split("-");
      startDate = new Date(`${today[0]}-${String(today[1]).padStart(2, '0')}-01T00:00:00.000Z`);
      endDate   = new Date(new Date(`${today[0]}-${String(today[1]).padStart(2, '0')}-01T00:00:00.000Z`).setMonth(startDate.getMonth() + 1) - 1);  // 해당 월의 마지막 날
      break;
    case "today":
      //----------------------------------
      //  year-month-day
      //----------------------------------
      today = new Date().toISOString().slice(0, 10).split("-");
      startDate = new Date(`${today[0]}-${String(today[1]).padStart(2, '0')}-${String(today[2]).padStart(2, '0')}T00:00:00.000Z`);
      endDate   = new Date(`${today[0]}-${String(today[1]).padStart(2, '0')}-${String(today[2]).padStart(2, '0')}T23:59:59.999Z`);
      break;
  }
  const query = { datetime: { $gte: startDate, $lt:  endDate }, group: body.group };
  if (body.year ) query.year   = body.year;
  if (body.month) query.month  = body.month;
  if (body.day  ) query.day    = body.day;
  if (body.week ) query.week   = body.week;

  return query;
}
//===========================================
//  find times_medalbank
//===========================================
async function getTimes4Leaderboard(dateQuery, body) {

  const query = {
    ...dateQuery,
    timeStamp	: { $gt: 0 },
    $or 			: [{ status: "" }, { status: { $exists: false } }],
  }
  if (body.gender     ) query.gender    = body.gender;
  if (body.discipline      ) query.discipline     = body.discipline;
  if (body.course     ) query.course    = body.course;
  if (body.distance   ) query.distance  = body.distance;
  if (body.isOfficial ) query.isOfficial= body.isOfficial;
  if (body.isAdult    ) query.isAdult   = body.isAdult;
  if (body.isMasters  ) query.isMasters = body.isMasters;
  // const context = {
  //   query			: query,
  //   projection: { _id:0, },
  //   limit			: RANK * 2,
  //   skip			: 0,
  //   sort			: { time: 1 },
  // }
  // const result = await mongodb.find(mongoCFG.Breaststroke.times, context)
  console.log("=", query);
// process.exit();

  const aggregate = [
    { $match: query },
    // 각 userID별로 가장 좋은 기록 선택
    { $sort: { timeStamp: 1 } }, // 시간(time) 기준으로 오름차순 정렬
    { $group: {
        _id: {
          userID	: "$userID",
          gender	: "$gender",
          discipline		: "$discipline",
          course	: "$course",
          distance: "$distance"
        },
        bestRecord: { $first: "$$ROOT" }  // 각 그룹에서 첫 번째(가장 좋은) 기록 선택
      }
    },
    // bestRecord 필드를 다시 최상위 레벨로 펼치기
    { $replaceRoot: { newRoot: "$bestRecord" } },
    // gender, discipline, course, distance별로 그룹화하고 상위 8개 선택
    { $group: {
        _id: {
          gender	: "$gender",
          discipline		: "$discipline",
          course	: "$course",
          distance: "$distance"
        },
        records: { $push: "$$ROOT" }  // 모든 기록을 배열로 저장
      }
    },
    { $project: {
        records: { $slice: ["$records", 8] }  // 시간 기준 상위 8개만 선택
      }
    },
    { $unwind: "$records" }, // 배열에서 다시 문서 형태로 풀어냄
    { $replaceRoot: { newRoot: "$records" } }, // records 필드를 최상위 레벨로 변환
    { $project: { _id:0, userID:1, teamID:1, poolID:1, competitionID:1, name:1, gender:1, discipline:1, distance:1, course:1, time:1, timeStamp:1, rank:1, isOfficial:1, isAdult:1 } },
    { $sort: { isMasters:1, isOfficial:1, isAdult:1, gender:1, discipline:1, course:1, distance:1, timeStamp:1 } }
  ];
  //----------------------------------------------------------------
  const result = await mongodb.aggregate(mongoCFG.Breaststroke.times, aggregate)
  console.log(result.data);
  //----------------------------------------------------------------
  return result;
}
//-----------------------------------------------
//	build teams
//-----------------------------------------------
exports.buildLeaderboard = async (body) => {
	const dateQuery = buildDatetimeQuery(body);
  const context = {
    query: dateQuery,
    projection: { _id:0, },
    limit: 10000,
    skip: 0,
  }
	result = await mongodb.find(mongoCFG.Breaststroke.times, context);

	
	let times = await getTimes4Leaderboard({ datetime: dateQuery.datetime }, body);
  console.log("=====>", times);
  if (times.data.length == 0) {
    console.log("buildLeaderboard.body:", body, "query=", dateQuery, "no data...");
    return;
  }
  times = this.calculateLeaderboardStatistics(times.data);

  
	console.log("teamIDs=", teamIDs);
	let result = await mongodb.deleteMany(mongoCFG.Breaststroke.teamStatics, { teamID: { $in: teamIDs } });
	console.log("delete=", result);
	result = await mongodb.insertMany(mongoCFG.Breaststroke.teamStatics, leaderboard );
	console.log("insert=", result);
}

//-----------------------------------------------
//	build teams statistics
//-----------------------------------------------
exports.calculateLeaderboardStatistics = async (times) => {
  const timeLibrary = new TimeLibrary();
	times = timeLibrary.setCompetitionTeamPool(times);

  // `gender`, `discipline`, `course`, `distance`별로 그룹화
  const grouped = _.groupBy(times, (entry) => `${entry.isAdult??true}-${entry.gender}-${entry.discipline}-${entry.course}-${entry.distance}`);
	
	let leaderboards = [];
	for (const key of Object.keys(grouped)) {
    const [adult, gender, discipline, course, distance] = key.split("-"); // 키에서 discipline과 distance 추출

    const sortTimes = timeLibrary.assignRanksMedalbank(grouped[key]);
    leaderboards = leaderboards.concat(sortTimes);

console.log(grouped[key]);
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
		value.swimmersEvent 	= timeLibrary.getAthletesByCount(times, 10);
		value.competitions		= timeLibrary.getCompetitionsByCountOfTeam(value.teamID, times, 1000); // 처리 필요: athleteCount, medal, pbs
		value.bestTimes				= timeLibrary.findBestTime(times, 1);
		value.latest					= timeLibrary.findLatestTime(times, 1);
		value.first						= timeLibrary.findFirstTime(times, 1);
		value.medals					= timeLibrary.countByStyleAndGender(times);

		value.competitionCount= value.competitions.length;

		// calculate points
		let points = 0;
		for (const medal of value.medals) {
			if (medal.discipline.includes("Relay")) {
				points += medal.gold * teamPoints.goldTeam+
									medal.silver * teamPoints.silverTeam +
									medal.bronze * teamPoints.bronzeTeam;
			} else {
				points += medal.gold * teamPoints.goldIndividual+
									medal.silver * teamPoints.silverIndividual +
									medal.bronze * teamPoints.bronzeIndividual;
			}	
		} // end for
		points += value.timeCount * teamPoints.start;
		points += value.athleteCount * teamPoints.athletes;
		points += value.competitionCount * teamPoints.events;
		// points 계산
		value.points = points;
		leaderboard.push(value);

		// console.log("----->", teamID);
	} // end for

	// console.log("teamPoints:", leaderboard.length);
	const teamIDs = [...new Set(timeArr.map((entry) => entry.teamID))];

	return leaderboard;
}

//===========================================
//  insert leaderboard  
//===========================================
async function insertLeaderboard(query, times) {
  if (times.length == 0) return;
  //-------------------------------
  // const query = {
  //   gender		: body.gender,
  //   discipline			: body.discipline,
  //   course		: body.course, // "LCM",
  //   distance	: body.distance,
  //   isOfficial: body.official,
  //   isAdult		: body.adult,
  // };
  //-------------------------------
  await mongodb.deleteMany(mongoCFG.Breaststroke.leaderboard, query);
  //-------------------------------

  //-------------------------------
  await mongodb.insertMany(mongoCFG.Breaststroke.leaderboard, times);
  //-------------------------------
}
//===========================================
//  build leaderboard
//===========================================
// async function buildLeaderboard(body) {
exports.buildLeaderboard = async (body) => {
  if (!body.year)       return "year not found";
  if (isNaN(body.year)) return "year not number";

  // let group = "month";
  // if      (!body.month) group = "year";
  // else if (body.week)   group = "week";
  // else if (body.day)    group = "day";

  //-------------------------------
  const dateQuery = buildDatetimeQuery(body);
  //-------------------------------
  if (typeof dateQuery == "string") return { message: dateQuery, data: [] };
  
  //-------------------------------
  const query = { group: body.group };
  if (body.year ) query.year   = body.year;
  if (body.month) query.month  = body.month;
  if (body.day  ) query.day    = body.day;
  if (body.week ) query.week   = body.week;

  const times = await getTimes4Leaderboard(dateQuery, body);

  let LID = await mongodb.max(mongoCFG.Breaststroke.leaderboard, "LID", {});
  // const timeArr = times.data.reduce((arr, time) => {
  //   time = {
  //     LID: LID++,
  //     ...query,
  //     ...time
  //   };
  //   const data = time;
  //   // const data = Customizing.encode(time);
  //   arr.push(data);
  //   return arr;
  // },[]);
  // console.log(timeArr, query);
  // await insertLeaderboard(query, timeArr);
  // return;
  //-------------------------------

  let timeArr = [];
  //-------------------------------
  // for (const official of [true, false]) {
    //-------------------------------
    for (const adult of [true, false]) {
      //-------------------------------
      for (const gender of ["men", "women"]) {
        //-------------------------------
        for (const discipline of [ "BR", "FR", "BK", "FL","IM"]) {
          //-------------------------------
          for (const course of ["LCM", "SCM"]) {
            //-------------------------------
            for (const distance of ["25M", "50M", "100M", "200M", "400M", "800M"]) {
              //-------------------------------
              const leaderboardTimes = times.data.filter(time => time.isAdult == adult
                                                                && time.gender == gender
                                                                && time.course == course
                                                                && time.discipline == discipline
                                                                && time.distance == distance)
                                                // .sort((a, b) => a.timeStamp - b.timeStamp)
                                                .reduce((arr, time) => {
                                                  // time.rankGroup = time.rank || 0;
                                                  time = {
                                                    LID: LID++,
                                                    ...query,
                                                    ...time
                                                  };
                                                  const data = time;
                                                  // const data = Customizing.encode(time);
                                                  arr.push(data);
                                                  return arr;
                                                },[]);
                                                if (leaderboardTimes.length == 0) continue;
              const sortTimes = timeLibrary.assignRanksMedalbank(leaderboardTimes);
              timeArr = timeArr.concat(sortTimes);
              console.log("sortTimes=", sortTimes.length);
            }					
          }
        }	
      }
    }

  // }
  await insertLeaderboard(query, timeArr);
}
