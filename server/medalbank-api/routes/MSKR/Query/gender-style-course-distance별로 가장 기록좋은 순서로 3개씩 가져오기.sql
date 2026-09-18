db.getCollection('times_MSKR').aggregate([
  // 0. query
  { $match: { competitionID:{ $gt: 0 }, course:"LCM", distance:"50M", style: {$ne: "" }, timeStamp: { $gt: 0 }, isAdult: true, isMasters: true, timeStamp: { $gt: 0 }, fin: { $exists: false } } },
  
  // Step 1: Sort the entire collection by timeStamp in ascending order.
  { 
    $sort: { timeStamp: 1 } 
  },
  // Step 2: Group documents.
  {
    $group: {
      _id: {
        gender: "$gender",
        style: "$style",
        course: "$course",
        distance: "$distance"
      },
      athleteCount: { $addToSet: "$name" },  // unique athletes
      timeCount: { $sum: 1 },                   // total record count
      times: {
        $push: {
          timeID: "$timeID",
          name: "$name",
          time: "$time",
          ageGroup: "$ageGroup",
          athleteID: "$athleteID",
          competitionID: "$competitionID",
          poolID: "$poolID",
          teamID: "$teamID",
          datetime: "$datetime",
          rank: "$rank"
          // No need to include timeStamp since the documents are pre-sorted
        }
      }
    }
  },
  // Step 3: Project and slice the first three records from the sorted times array.
  {
    $project: {
      gender: "$_id.gender",
      style: "$_id.style",
      course: "$_id.course",
      distance: "$_id.distance",
      timeCount: 1,
      athleteCount: { $size: "$athleteCount" },
      times: { $slice: [ "$times", 1 ] },
      _id: 0
    }
  },
  { $sort: { gender:1, style:1, course:1, distance:1 } }
])



// -----> mongodb v5.3이상
db.getCollection('times_MSKR').aggregate([
  {
    $group: {
      _id: {
        gender: "$gender",
        style: "$style",
        course: "$course",
        distance: "$distance"
      },
      athleteCount: { $addToSet: "$athleteID" },  // 중복없는 선수 수
      timeCount: { $sum: 1 },  // 전체 기록 수
      times: {
        $push: {
          timeID: "$timeID",
          name: "$name",
          time: "$time",
          datetime: "$datetime",
          rank: "$rank",
          timeStamp: "$timeStamp"  // 정렬용
        }
      }
    }
  },
  // times 배열 정렬 및 상위 3개 선택
  {
    $project: {
      gender: "$_id.gender",
      style: "$_id.style",
      course: "$_id.course",
      distance: "$_id.distance",
      athleteCount: { $size: "$athleteCount" },
      timeCount: 1,
      times: {
        $slice: [
          {
            $sortArray: {
              input: "$times",
              sortBy: { timeStamp: 1 }
            }
          },
          3
        ]
      },
      _id: 0
    }
  },
  // times 배열에서 timeStamp 필드 제거
  {
    $project: {
      gender: 1,
      style: 1,
      course: 1,
      distance: 1,
      athleteCount: 1,
      timeCount: 1,
      times: {
        $map: {
          input: "$times",
          as: "time",
          in: {
            timeID: "$$time.timeID",
            name: "$$time.name",
            time: "$$time.time",
            datetime: "$$time.datetime",
            rank: "$$time.rank"
          }
        }
      }
    }
  }
])