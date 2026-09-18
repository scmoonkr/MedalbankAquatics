// stem별 대회목록 가져오기.sql
db.getCollection('stems_medalbank').aggregate([
{ $match: { stemID:23 } },
{ $lookup: {
        from				: "competitions_medalbank",
        localField	: 'stemID',
        foreignField: 'stemID',
        as					: 'competitions'
    }
},
{ $project: { _id:0, stemID:1, stem:1, "competitions.competitionID":1, "competitions.fullname":1, "competitions.dateStart":1 } }
])

// stem별 top3 가져오기.sql
db.getCollection('times_MSKR').aggregate([
  { 
    $match: {
      timeStamp: { $exists: true, $gt: 0 },
      stemID: 23
    }
  },
  { $sort: { timeStamp: 1 } },
  {
    $group: {
      _id: {
        athleteID: "$athleteID",
        gender: "$gender",
        style: "$style",
        course: "$course",
        distance: "$distance"
      },
      bestRecord: { $first: "$$ROOT" }
    }
  },
  { $replaceRoot: { newRoot: "$bestRecord" } },
  {
    $group: {
      _id: {
        gender: "$gender",
        style: "$style",
        course: "$course",
        distance: "$distance"
      },
      times: { $push: "$$ROOT" }
    }
  },
  { $unwind: "$times" },
  { $sort: { "times.timeStamp": 1 } },
  {
    $group: {
      _id: {
        gender: "$_id.gender",
        style: "$_id.style",
        course: "$_id.course",
        distance: "$_id.distance"
      },      
      times: {
        $push: {
          timeID: "$times.timeID",
          athleteID: "$times.athleteID",
          ageGroup: "$times.ageGroup",
          name: "$times.name",
          timeStamp: "$times.timeStamp",
          time: "$times.time",
          ranking: "$times.rank",
          datetime: "$times.rank",
          competitionID: "$times.competitionID",
          poolID: "$times.poolID",
          teamID: "$times.teamID"
        } 
      }
    }
  },
  {
    $project: {
      times: { $slice: ["$times", 1] }
    }
  },
  {
    $project: {
      gender: "$_id.gender",
      style: "$_id.style",
      course: "$_id.course",
      distance: "$_id.distance",
      _id: 0,
      times: 1
    }
  }
])