const extend 			= require('node.extend');
const mskCFG 			= require('../../Config/mskCFG');
const mongoCFG 		= require('../../Config/mongoCFG');
const mongoDB			= require('../../Class/MongoDB');
const UtilDate		= require("../../Class/DateLibrary");
const MemoryDB		= require("../../Class/MemoryDB");
const memoryDB		= new MemoryDB();
const TimeLibrary		= require("../../Class/TimeLibrary");
const timeLibrary = new TimeLibrary();
const Leaderboard		= require("../leaderboards/leaderboard.model");

const mongodb 		= new mongoDB(mongoCFG.Medalbank.database);
const utilDate		= new UtilDate();

const ATHLETE_LIMIT = 32;

//----------------------------------------------------------------
// get upcoming events
//----------------------------------------------------------------
exports.upcommings = async () => {
  const today = new Date();
  // today.setDate(today.getDate() - 61);
  const context = {
    query: {
      dateStart: { $gte: today }, // { $gt: new Date()},
    },
    projection: {_id:0, competitionID:1, dateStart:1, sido:1, fullname:1, pool:1, target:1, masters:1, },
    limit: 5,
    skip: 0,
    sort: { dateStart: -1 }
  }
  // console.log("-------> query:", context.query);
  const competitions = await mongodb.find(mongoCFG.Medalbank.competitions, context);
  // console.log("competitions:", competitions.data);
  const upcomings = competitions.data.reduce((arr, data) => {
                                        const value = {
                                          competitionID	: data.competitionID,
                                          dateStart			: new Date(data.dateStart).toISOString().slice(0, 10),
                                          sido					: data.sido ?? '',
                                          poolID			  : data.poolID ?? 0,
                                          fullname			: data.fullname ?? '',
                                          pool			    : data.pool ?? '',
                                          target				: data.target ? data.target : true, // adult, junior, all
                                          masters				: data.masters ? data.masters : false, // true: masters, false:
                                        }
                                        arr.push(value);
                                        return arr;
                                      }, [])
  return upcomings;
}

exports.getRealtimeLeaderboardThisMonth = async (body={}) => {
  const limit = 1000;


  const startDate = body.start ? new Date(body.start) : new Date();
  const dayOfWeek = startDate.getDay();  // 현재 요일을 가져옴 (0 = 일요일, 6 = 토요일)
  startDate.setHours(9, 0, 0, 0); 
  startDate.setDate(1);  // 하루의 시작 시간으로 설정

  // 이번 주의 월요일로 설정
  // startDate.setDate(startDate.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1));
	// startDate.setHours(9, 0, 0, 0);  // 하루의 시작 시간으로 설정
  // startDate.setHours(startDate.getHours()-15);

  const dateQuery = { $gte: startDate }
  const endDate = body.start ? new Date(body.end) : new Date();
  endDate.setDate(endDate.getDate() + 1);  // 하루의 시작 시간으로 설정
  endDate.setHours(9, 0, 0, 0);  // 하루의 시작 시간으로 설정
  dateQuery.$lt = endDate;
  // console.log("getRealtimeLeaderboard.dateQuery.", dateQuery);
  // if (body.end) {
  //   dateQuery.$lt = endDate;
  // }
  // console.log("getRealtimeLeaderboard.body=", body, ", dateQuery=", dateQuery);
  const query = {
    datetime	: dateQuery,
    $or				: [ 
      {
        style		: "individualMedley",
        distance: "200M"

      }, 
      {
        style		: { $in: ["freestyle", "backstroke", "breaststroke", "butterfly"]},
        distance: "50M"
      }
    ],
    timeStamp	: { $gt: 0 },
    status    : { $exists: false },
    type 			: body.timeEvent ? body.timeEvent.replace("Result", '') : 'time',
  };
  
  // console.log(">query=", JSON.stringify(query));
  
  const aggregate = [
    { $match: query },
    // 1. athleteID별로 그룹화하고, 각 athleteID에서 가장 좋은 기록(timeStamp가 작은) 선택
    {
      $sort: { gender: 1, style: 1, course: 1, distance: 1, timeStamp: 1 } // 그룹화 전 정렬
    },
    {
      $group: {
        _id: { gender: "$gender", style: "$style", course: "$course", distance: "$distance" }, // 그룹화 조건
        topRecords: {
          $push: { // 그룹 내 모든 문서를 배열로 저장
            athleteID     : "$athleteID",
            name          : "$name",
            gender        : "$gender",
            style         : "$style",
            course        : "$course",
            distance      : "$distance",
            time          : "$time",
            timeStamp     : "$timeStamp",
            timeID        : "$timeID",
            poolID        : "$poolID",
            rank          : "$rank",
            athleteID     : "$athleteID",
            teamID        : "$teamID",
            competitionID : "$competitionID",
            datetime      : "$datetime",
            pool          : "$pool"
          }
        }
      }
    },
    {
      $project: {
        _id           : 0, // _id 제외
        gender        : "$_id.gender",
        style         : "$_id.style",
        course        : "$_id.course",
        distance      : "$_id.distance",
        timeID        : "$_id.timeID",
        poolID        : "$_id.poolID",
        teamID        : "$_id.teamID",
        competitionID : "$_id.competitionID",
        athleteID     : "$_id.athleteID",
        datetime      : "$_id.datetime",
        rank          : "$_id.rank",
        topRecords    : { $slice: ["$topRecords", body.rank ?? 3] } // 상위 3개 문서만 포함
      }
    },
    {
      $unwind: "$topRecords" // topRecords 배열을 개별 문서로 변환
    },
    {
      $replaceRoot: { newRoot: "$topRecords" } // 문서 구조를 평평하게 만듦
    }
  ];
  //----------------------------------------------------------------
  const times = await mongodb.aggregate(mongoCFG.Medalbank.times, aggregate)
  // console.log("result=", times.data);
  let leaderboards = mskCFG.sortGenderStyleDistance(times.data);

  leaderboards = timeLibrary.findBestTime(leaderboards, 3);

  return leaderboards;
}
//----------------------------------------------------------------
// top1: 월별 훈련기록 실시간 순위
//----------------------------------------------------------------
/*
top1= {
  data: {
    times: [
      {
        isAdult: true,
        gender: 'men',
        style: 'freestyle',
        course: 'SCM',
        distance: '25M',
        timeID: 60286,
        name: '최홍준',
        time: '10.94',
        timeStamp: 0.00012662037037037036,
        rank: 1,
        datetime: '2024-03-17',
        sido: '안양',
        ageGroup: 'TOP8',
        poolID: 793,
        teamID: 486,
        competitionID: 1363,
        rankGroup: 1,
        diffs: '0.00',
        lid: 9729
      }
    ],
    compression: { pools: [Array], teams: [Array], competitions: [Array] }
  },
  count: 57
}
*/
exports.top1LeaderboardRealtime = async (body={}) => {
  const query ={
    type: 'all',
    group: 'all',
    limit: 1,
  }
  const result = await Leaderboard.getLeaderboardRealtime(query); // limit=1000, skip=0
  // console.log("~~~~~~~~~~~~~~~~~~", times.data.times)
  const assignTimes = timeLibrary.assignRanksMedalbank(result.data);
  // const comp = LeaderboardUTIL.getCompetitionsTeamsPools(times);
  const { times, compression } = timeLibrary.getCompetitionsTeamsPools(assignTimes);

  return { times, compression };
}
exports.top1Leaderboard = async (body={}) => {
  // let times = await this.getRealtimeLeaderboardThisMonth({timeEvent:"event", rank: 1});
  // const body = {
  //   name: '',
  //   typeTime: 'eventResult',
  //   gender: 'women',
  //   style: 'breaststroke',
  //   distance: '50M',
  //   course: 'LCM',
  //   ageGroup: '00',
  //   sido: '전국',
  //   dateType: 'all',
  //   skip: 0,
  //   limit: 100
  // }
  const query ={
    group: 'all',
    rank: 1,
  }
  const times = await Leaderboard.getLeaderboardFromLeaderboard(query, 1000, 0); // limit=1000, skip=0
  console.log("~~~~~~~~~~~~~~~~~~", times)
  return times;
  // let top1 = mskCFG.sortGenderStyleDistance(times);
  times = times.data.times.reduce((arr, data) => {
                const competition = memoryDB.getCompetition(data.times[0].competitionID);
                const team = memoryDB.getTeamName(data.times[0].teamID);
                const value = {
                  gender	        : data.gender,
                  style		        : data.style,
                  course          : data.course,
                  distance        : data.distance,
                  time		        : data.times[0].time,
                  datetime        : data.times[0].datetime ? data.times[0].datetime : competition.dateStart,
                  name		        : data.times[0].name,
                  competitionName : competition.fullname ?? '',
                  pool            : competition.pool ?? '',
                  team            : team ?? '',
                  athleteID	      : data.times[0].athleteID ?? 0,
                  timeID	        : data.times[0].timeID ?? 0,
                }
                // console.log("value=", value);
                value.datetime = value.datetime ? new Date(value.datetime).toISOString().slice(0, 10): "";
                arr.push(value);
                return arr;
              }, [])
  return times;
}
exports.top1 = async (body={}) => {
  let times = await Leaderboard.getLeaderboardRealtime("event", 1);
  // let top1 = mskCFG.sortGenderStyleDistance(times);
  if (times.length > 0) {
    times = times.reduce((arr, data) => {
                  if (data.times && data.times.length > 0) {
                    const competition = memoryDB.getCompetition(data.times[0].competitionID);
                    const team = memoryDB.getTeamName(data.times[0].teamID);
                    const value = {
                      gender	        : data.gender,
                      style		        : data.style,
                      course          : data.course,
                      distance        : data.distance,
                      time		        : data.times[0].time,
                      datetime        : data.times[0].datetime ? data.times[0].datetime : competition.dateStart,
                      name		        : data.times[0].name,
                      competitionName : competition.fullname ?? '',
                      pool            : competition.pool ?? '',
                      team            : team ?? '',
                      athleteID	      : data.times[0].athleteID ?? 0,
                      timeID	        : data.times[0].timeID ?? 0,
                    }
                    // console.log("value=", value);
                    value.datetime = value.datetime ? new Date(value.datetime).toISOString().slice(0, 10): "";
                    arr.push(value);
                  }
                  return arr;
                }, [])
  }
  return times;
}
//----------------------------------------------------------------
// top3
// 월별 훈련기록 실시간 순위
//----------------------------------------------------------------
exports.topN = async (body={}, rank=3) => {
  // let times = await this.getRealtimeLeaderboardThisMonth({timeEvent:"time", rank: 3});
  const startDate = body.start ? new Date(body.start) : new Date();
  const dayOfWeek = startDate.getDay();  // 현재 요일을 가져옴 (0 = 일요일, 6 = 토요일)
  startDate.setHours(9, 0, 0, 0); 
  startDate.setDate(1);  // 하루의 시작 시간으로 설정
  //?????????????????????????????????????????????????????????????????????????
  //?????????????????????????????????????????????????????????????????????????
  //?????????????????????????????????????????????????????????????????????????
  //?????????????????????????????????????????????????????????????????????????
  startDate.setMonth(0);  // 강제로 1월부터
  //?????????????????????????????????????????????????????????????????????????
  //?????????????????????????????????????????????????????????????????????????
  //?????????????????????????????????????????????????????????????????????????
  //?????????????????????????????????????????????????????????????????????????
  //?????????????????????????????????????????????????????????????????????????

  // 이번 주의 월요일로 설정
  // startDate.setDate(startDate.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1));
	// startDate.setHours(9, 0, 0, 0);  // 하루의 시작 시간으로 설정
  // startDate.setHours(startDate.getHours()-15);

  const dateQuery = { $gte: startDate }
  const endDate = body.start ? new Date(body.end) : new Date();
  endDate.setDate(endDate.getDate() + 1);  // 하루의 시작 시간으로 설정
  endDate.setHours(9, 0, 0, 0);  // 하루의 시작 시간으로 설정
  dateQuery.$lt = endDate;
  // console.log("getRealtimeLeaderboard.dateQuery.", dateQuery);
  
  const query = {
    datetime	: dateQuery,
    $or				: [ 
      {
        style		: "individualMedley",
        distance: "200M"

      }, 
      {
        style		: { $in: ["freestyle", "backstroke", "breaststroke", "butterfly"]},
        distance: "50M"
      }
    ],
    timeStamp	: { $gt: 0 },
    status    : { $exists: false },
    type 			: body.timeEvent ? body.timeEvent.replace("Result", '') : 'time',
  };

  const aggregate = [
    { $match: query },
    // { $match: {
    //     datetime: {
    //       $gte: ISODate("2025-01-01T00:00:00.000Z"),
    //       $lt: ISODate("2025-01-24T00:00:00.000Z")
    //     },
    //     $or: [ 
    //       {
    //         style: "individualMedley",
    //         distance: "200M"
    //       }, 
    //       {
    //         style: { $in: ["freestyle", "backstroke", "breaststroke", "butterfly"]},
    //         distance: "50M"
    //       }
    //     ],
    //     fin: { $exists: false },
    //     timeStamp: { $gt: 0 },
    //     status: { $exists: false },
    //     type: 'time',
    //   }
    // },
    // 먼저 athleteID별로 가장 좋은 기록 선택
    {
      $sort: { gender: 1, style: 1, course: 1, distance: 1, timeStamp: 1 }
    },
    {
      $group: {
        _id: {
          gender: "$gender",
          style: "$style",
          course: "$course",
          distance: "$distance",
          athleteID: "$athleteID"  // athleteID 추가
        },
        bestRecord: { $first: "$$ROOT" }  // 각 선수의 가장 좋은 기록
      }
    },
    // 그 다음 gender-style-course-distance별로 상위 3명 선택
    {
      $group: {
        _id: {
          gender: "$_id.gender",
          style: "$_id.style",
          course: "$_id.course",
          distance: "$_id.distance"
        },
        times: {
          $push: "$bestRecord"
        }
      }
    },
    {
      $project: {
        _id: 0,
        gender: "$_id.gender",
        style: "$_id.style",
        course: "$_id.course",
        distance: "$_id.distance",
        times: { $slice: ["$times", rank] }  // 상위 3개 기록
      }
    },
    {
      $unwind: "$times"
    },
    {
      $replaceRoot: { newRoot: "$times" }
    }
  ];
  const times = await mongodb.aggregate(mongoCFG.Medalbank.times, aggregate)
  console.log("top3=", times.data, query);
  let top3 = mskCFG.sortGenderStyleDistance(times.data);

  top3 = timeLibrary.findBestTime(top3, 3);

// console.log("=====> top3:", top3[0]); 
  return top3;
}
exports.top3OLD = async (body={}, rank=3) => {
  const limit = 1000;

  const startDate = new Date();
  startDate.setHours(9, 0, 0, 0); 
  startDate.setDate(1);  // 하루의 시작 시간으로 설정
  const endDate = new Date();
  endDate.setDate(endDate.getDate() + 1);  // 하루의 시작 시간으로 설정
  endDate.setHours(9, 0, 0, 0);  // 하루의 시작 시간으로 설정

  // const dayOfWeek = startDate.getDay();  // 현재 요일을 가져옴 (0 = 일요일, 6 = 토요일)

  // // 이번 주의 월요일로 설정
  // startDate.setDate(startDate.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1));
	// startDate.setHours(0, 0, 0, 0);  // 하루의 시작 시간으로 설정
  // startDate.setHours(startDate.getHours()-15);

  query = {
    datetime	: { $gte: startDate, $lt: endDate },
    $or				: [ 
      {
        style		: "individualMedley",
        distance: "200M"

      }, 
      {
        style		: { $in: ["freestyle", "backstroke", "breaststroke", "butterfly"]},
        distance: "50M"
      }
    ],
    timeStamp	: { $gt: 0 },
    status: { $exists: false },
    type 			: body.timeEvent ?? 'time',
  };
  
  // console.log(">query=", query);
  
  const aggregate = [
    { $match: query },
    // 1. athleteID별로 그룹화하고, 각 athleteID에서 가장 좋은 기록(timeStamp가 작은) 선택
    {
      $sort: { gender: 1, style: 1, course: 1, distance: 1, timeStamp: 1 } // 그룹화 전 정렬
    },
    {
      $group: {
        _id: { gender: "$gender", style: "$style", course: "$course", distance: "$distance" }, // 그룹화 조건
        topRecords: {
          $push: { // 그룹 내 모든 문서를 배열로 저장
            athleteID: "$athleteID",
            name: "$name",
            gender: "$gender",
            style: "$style",
            course: "$course",
            distance: "$distance",
            time: "$time",
            timeStamp: "$timeStamp",
            timeID: "$timeID",
            poolID: "$poolID",
            rank: "$rank",
            athleteID: "$athleteID",
            datetime: "$datetime",
            pool: "$pool"
          }
        }
      }
    },
    {
      $project: {
        _id: 0, // _id 제외
        gender: "$_id.gender",
        style: "$_id.style",
        course: "$_id.course",
        distance: "$_id.distance",
        timeID: "$_id.timeID",
        poolID: "$_id.poolID",
        athleteID: "$_id.athleteID",
        rank: "$_id.rank",
        topRecords: { $slice: ["$topRecords", rank] } // 상위 3개 문서만 포함
      }
    },
    {
      $unwind: "$topRecords" // topRecords 배열을 개별 문서로 변환
    },
    {
      $replaceRoot: { newRoot: "$topRecords" } // 문서 구조를 평평하게 만듦
    }
  ];
  //----------------------------------------------------------------
  const times = await mongodb.aggregate(mongoCFG.Medalbank.times, aggregate)
  // console.log("result=", times.data.length);
  let top3 = mskCFG.sortGenderStyleDistance(times.data);

  top3 = timeLibrary.findBestTime(top3, 3);

  return top3;
}
//----------------------------------------------------------------
// newMeasure: 새로 측정한 선수
//----------------------------------------------------------------
exports.newMeasure = async (limit=8) => {
  const aggregate = [
    { $sort: { athleteID: 1, datetime: 1 }  },// athleteID 오름차순, datetime 내림차순 정렬   
    { $group: {
        _id       : "$athleteID", // athleteID 별로 그룹화
        athleteID : { $first: "$athleteID" }, // 그룹의 첫 번째 athleteID
        name      : { $first: "$name" }, // 가장 최근 name
        datetime  : { $first: "$datetime" }, // 가장 최근 datetime
        otherField: { $first: "$otherField" } // 필요 시 다른 필드도 추가 가능
      }
    },
    { $sort: { datetime: -1 }  },// 전체 결과를 datetime 내림차순으로 정렬   
    { $limit: limit }, // 상위 32개의 결과만 가져오기
    { $project: {
        _id       : 0, // _id 필드 제외
        athleteID : 1,
        name      : 1,
        datetime  : 1
      }
    }
  ];

  //-------
  const result = await mongodb.aggregate(mongoCFG.Medalbank.times, aggregate);
  //-------
  const athletes = result.data.reduce((arr, time) => {
                                time.datetime = new Date(time.datetime).toISOString().slice(0, 10);
                                arr.push(time);
                                return arr;
                              },[]);
  return athletes;
}
//----------------------------------------------------------------
// 최근 합류한 선수
//----------------------------------------------------------------
exports.joinedRecently = async (limit=8) => {
  const context = {
    query       : {},
    projection  : { _id:0, athleteID:1, name:1, joined:1, },
    limit       : limit,
    skip        : 0,
    sort        : { athleteID: -1 },
  };

  //-------
  const result = await mongodb.find(mongoCFG.Medalbank.athletes, context);
  //-------
  const athletes = result.data.reduce((arr, athlete) => {
                                athlete.datetime = athlete.joined ? new Date(athlete.joined).toISOString().slice(0, 10) : '';
                                delete athlete.joined;
                                arr.push(athlete);
                                return arr;
                              },[]);
  return athletes;
}
//----------------------------------------------------------------
// thisWeekMVP: dlqjswn ㅡ폐폐
//----------------------------------------------------------------
exports.thisWeekMVP = async (body) => {
  const today = new Date();
  today.setDate(today.getDate() + 1);
  today.setHours(9, 0, 0, 0);  // 하루의 시작 시간으로 설정
  
  const startDate = new Date();
  const dayOfWeek = startDate.getDay();  // 현재 요일을 가져옴 (0 = 일요일, 6 = 토요일)
  
  // 이번 주의 월요일로 설정
  startDate.setDate(startDate.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1));
  startDate.setHours(9, 0, 0, 0);  // 하루의 시작 시간으로 설정

  const aggregate = [
    { $match: { datetime: { $gte: startDate, $lt: today } } },
    {
      $group: {
        _id   : "$athleteID", // athleteID로 그룹화
        count : { $sum: 1 }, // 각 athleteID의 문서 수 계산
        name  : { $first: "$name" } // 이름도 포함 (optional)
      }
    },
    {
      $sort : { count: -1 } // 문서 수 기준 내림차순 정렬
    },
    {
      $limit  : 100 // 상위 100개의 결과만 가져오기
    },
    {
      $project: {
        _id       : 0, // _id 필드 제외
        athleteID : "$_id", // athleteID 포함
        name      : 1, // 이름 포함
        count     : 1 // 문서 수 포함
      }
    }
  ];

  const result = await mongodb.aggregate(mongoCFG.Medalbank.times, aggregate);
  return result.data.slice(0, 32);
}
//----------------------------------------------------------------
// thisWeekMVP
//----------------------------------------------------------------
exports.getCountAthletePeriod = async (start, end) => {
  const today = new Date(end);
  today.setDate(today.getDate() + 1);
  today.setHours(9, 0, 0, 0);  // 하루의 시작 시간으로 설정
  
  const startDate = new Date(start);
  startDate.setHours(9, 0, 0, 0);  // 하루의 시작 시간으로 설정

  // console.log("1>start:", startDate, "today:", today);
  const aggregate = [
    { $match: { datetime: {$gte: startDate, $lt: today }} },
    {
      $group: {
        _id   : "$athleteID", // athleteID로 그룹화
        count : { $sum: 1 }, // 각 athleteID의 문서 수 계산
        name  : { $first: "$name" } // 이름도 포함 (optional)
      }
    },
    {
      $sort : { count: -1 } // 문서 수 기준 내림차순 정렬
    },
    {
      $limit  : 32 // 상위 100개의 결과만 가져오기
    },
    {
      $project: {
        _id       : 0, // _id 필드 제외
        athleteID : "$_id", // athleteID 포함
        name      : 1, // 이름 포함
        count     : 1 // 문서 수 포함
      }
    }
  ];

  const result = await mongodb.aggregate(mongoCFG.Medalbank.times, aggregate);
  return result.data.slice(0, 32);
}
//----------------------------------------------------------------
// todayMVP
//----------------------------------------------------------------
exports.todayMVP = async (body) => {
  const today = new Date();
  today.setDate(today.getDate() + 1);
  today.setHours(9, 0, 0, 0);  // 하루의 시작 시간으로 설정
  
  const startDate = new Date();

  return await this.getCountAthletePeriod(startDate, today);
}
//----------------------------------------------------------------
// thisMonthMVP
//----------------------------------------------------------------
exports.thisMonthMVP = async (body) => {
  const today = new Date();
  today.setDate(today.getDate() + 1);
  today.setHours(9, 0, 0, 0);  // 하루의 시작 시간으로 설정
  
  const startDate = new Date();
  const dayOfWeek = startDate.getDay();  // 현재 요일을 가져옴 (0 = 일요일, 6 = 토요일)
  
  // 이번 주의 월요일로 설정
  startDate.setDate(1);

  return await this.getCountAthletePeriod(startDate, today);
}
//----------------------------------------------------------------
// seasonMVP
//----------------------------------------------------------------
exports.seasonMVP = async (body) => {
  const today = new Date();
  today.setDate(today.getDate() + 1);
  today.setHours(9, 0, 0, 0);  // 하루의 시작 시간으로 설정
  
  const startDate = new Date();
  const dayOfWeek = startDate.getDay();  // 현재 요일을 가져옴 (0 = 일요일, 6 = 토요일)
  
  // 이번 주의 월요일로 설정
  startDate.setDate(1);
  startDate.setMonth(0);

  return await this.getCountAthletePeriod(startDate, today);
}
//----------------------------------------------------------------
// newRecord: 가장 기록 좋은 선수
//----------------------------------------------------------------
exports.newRecord = async (body) => {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 7);
  startDate.setHours(9, 0, 0, 0);  // 하루의 시작 시간으로 설정

  const aggregate =[
    { $match: { datetime: { $gt: startDate }, type: 'time' } },
      {
        $sort: { athleteID: 1, timeStamp: 1 } // athleteID 오름차순, timeStamp 오름차순
      },
      {
        $group: {
          _id: "$athleteID", // athleteID 별로 그룹화
          bestRecord: { $first: "$$ROOT" } // 가장 작은 timeStamp의 문서 선택
        }
      },
      {
        $replaceRoot: { newRoot: "$bestRecord" } // 결과를 bestRecord 문서로 대체
      },
      { $sort: { datetime:1 } },
      {
        $project: {
          _id: 0, // _id 제외
          athleteID: 1,
          name: 1,
          timeStamp: 1,
          time: 1,
          style: 1,
          poolID: 1,
          distance: 1,
          datetime: 1
        }
      }
    ];
    
  const result = await mongodb.aggregate(mongoCFG.Medalbank.times, aggregate);
  return result.data.slice(0, 32);
}
//----------------------------------------------------------------
// bestRecord 가장 기록 좋은 선수
//----------------------------------------------------------------
exports.bestRecord = async (body) => {
  const startDate = new Date();
  startDate.setDate(1);
  startDate.setMonth(0);
  startDate.setHours(9, 0, 0, 0);  // 하루의 시작 시간으로 설정

  const aggregate =[
    { $match: { datetime: { $gt: startDate }, type: 'event' } },
      {
        $sort: { athleteID: 1, timeStamp: 1 } // athleteID 오름차순, timeStamp 오름차순
      },
      {
        $group: {
          _id: "$athleteID", // athleteID 별로 그룹화
          bestRecord: { $first: "$$ROOT" } // 가장 작은 timeStamp의 문서 선택
        }
      },
      {
        $replaceRoot: { newRoot: "$bestRecord" } // 결과를 bestRecord 문서로 대체
      },
      { $sort: { datetime:1 } },
      {
        $project: {
          _id: 0, // _id 제외
          athleteID: 1,
          name: 1,
          timeStamp: 1,
          time: 1,
          style: 1,
          distance: 1,
          competitionID: 1,
          datetime: 1
        }
      }
    ];
    
  const result = await mongodb.aggregate(mongoCFG.Medalbank.times, aggregate);
  return result.data.slice(0, 32);
}



