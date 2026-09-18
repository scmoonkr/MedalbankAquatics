const extend 			= require('node.extend');
const mskCFG 			= require('../../Config/mskCFG');
const mongoCFG 		= require('../../Config/mongoCFG');
const mongoDB			= require('../../Class/MongoDB');
const UtilDate		= require("../../Class/DateLibrary");
const TimeLibrary	= require("../../Class/TimeLibrary");
const timeLibrary = new TimeLibrary();


const MemoryDB		= require('../../Class/MemoryDB');
const memoryDB		= new MemoryDB();

const mongodb 		= new mongoDB(mongoCFG.Medalbank.database);
const utilDate		= new UtilDate();

const PK = "LID";
const MAX_BUILD_COUNT = 10000;
const MAX_LIMIT = 2000;
const RANK = 10000;

const _context = {
	query		 	: {},
	projection: { _id:0, },
	limit		 	: MAX_LIMIT,
	skip			: 0,
	sort			: { _id:-1 },
}



//------------------------------------------
// find leaderboard
//------------------------------------------
exports.getLeaderboardFromTimes = async (qry, limit=10000) => { // startDate, endDate, body) {
  console.log("leaderboard.getLeaderboardFromTimes.startDate,endDate=", startDate, endDate);
  
  const query = {
    ...qry,
    // datetime	: { $gte: startDate, $lt: endDate },
    $or				: [ 
      { style: "individualMedley", distance: "200M" }, 
      { style: { $in: ["freestyle", "backstroke", "breaststroke", "butterfly"]}, distance: "50M" }
    ],
    timeStamp	: { $gt: 0 },
    $or 			: [{ status: "" }, { status: { $exists: false } }],
  };

  // if (body.ageGroup) query.ageGroup = body.ageGroup;
  // if (body.sido		 ) query.sido		= body.sido;
console.log("query=", query);
  // const limit = body.limit ? Number(body.limit) : 10000;
  const aggregate = 
  [
    { $match: query },
    // 1. athleteID별로 그룹화하고, 각 athleteID에서 가장 좋은 기록(timeStamp가 작은) 선택
    { $sort: { timeStamp: 1 } },
    { $group: {
        _id: "$athleteID",
        bestRecord: { $first: "$$ROOT" }  // timeStamp가 작은 기록을 선택하기 위해 먼저 정렬
      }
    },
    // 2. gender, style, course, distance 별로 그룹화
    { $group: {
        _id: {
          gender	: "$bestRecord.gender",
          style		: "$bestRecord.style",
          course	: "$bestRecord.course",
          distance: "$bestRecord.distance"
        },
        records: { $push: "$bestRecord" }  // 각 그룹의 레코드를 배열로 저장
      }
    },
    // 3. timeStamp 기준으로 정렬
    { $unwind: "$records" },
    { $sort: { "records.timeStamp": 1 } },
    // 4. 각 그룹에서 상위 10개만 가져옴
    { $group: {
        _id: {
          gender	: "$_id.gender",
          style		: "$_id.style",
          course	: "$_id.course",
          distance: "$_id.distance"
        },
        times: { $push: "$records" }
      }
    },
    { $project: {
      times: { $slice: ["$times", limit] }
      }
    },
    // 5. 필요한 필드만 선택
    { $project: {
        discipline						: "$_id",
        _id										: 0,
        "times.name"					: 1,
        "times.time"					: 1,
        "times.timeStamp"			: 1,
        "times.datetime"			: 1,
        "times.rank"					: 1,
        "times.sido"					: 1,
        "times.timeID"				: 1,
        "times.athleteID"			: 1,
        "times.competitionID"	: 1,
        "times.poolID"				: 1
      }
    }
  ];
  //----------------------------------------------------------------
  const result = await mongodb.aggregate(mongoCFG.Medalbank.times, aggregate)
  //----------------------------------------------------------------
  // console.log("+++++++++++++++++>", result.competitions.slice(0, 2), result.teams.slice(0, 2), result.data.length);

  // leaderboard: {"dicipline" : {gender, style, course, distance, times: [ { rank, name, time, timeID, athleteID, poolID, competitionID } ] },
  const leaderboard = result.data.reduce((arr, leaderboard) => {
                                    const timeArr = leaderboard.times.reduce((arr, time) => {
                                                                        const value = {
                                                                          athleteID: time.athleteID,
                                                                          name: time.name,
                                                                          time: time.time,
                                                                          timeStamp: time.timeStamp,
                                                                          rank: time.rank,
                                                                          sido: time.sido || "",
                                                                          datetime: time.datetime,
                                                                        }
                                                                        arr.push(value);
                                                                        return arr;
                                                                      }, []);
                                    //-----------------------
                                    const times = timeLibrary.assignRanksMedalbank(timeArr);
                                    //-----------------------
                                    const discipline = {
                                      gender	: leaderboard.discipline.gender,
                                      style		: leaderboard.discipline.style,
                                      course	: leaderboard.discipline.course,
                                      distance: leaderboard.discipline.distance,
                                      times		: times.reduce((arr, time) => {
                                                        const value = {
                                                          rank: time.rank,
                                                          athleteID: time.athleteID,
                                                          name: time.name,
                                                          time: time.time,
                                                          // timeStamp: time.timeStamp,
                                                          rank: time.rank,
                                                          sido: time.sido || "",
                                                          datetime: time.datetime.toISOString().slice(0, 10),
                                                        }
                                                        arr.push(value);
                                                        return arr;
                                                      }, []),
                                    }
                                    arr.push(discipline);
                                    return arr;
                                  },[]);
  return leaderboard;
}
