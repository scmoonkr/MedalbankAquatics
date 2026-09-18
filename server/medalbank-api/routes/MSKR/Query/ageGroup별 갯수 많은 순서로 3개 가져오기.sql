db.getCollection('times_MSKR').aggregate([
{ $match: { competitionID: 1709, ageGroup: { $exists: true }} },
  {
    $facet: {
      // athleteID별 카운트 (상위 3개)
      ageGroups: [
        {
          $group: {
            _id: "$ageGroup",
            count: { $sum: 1 }
          }
        },
        { $sort: { count: -1 } },
        { $limit: 3 },
        {
          $project: {
            _id: 0,
            ageGroup: "$_id",
            count: 1
          }
        }
      ],
      // 전체 timeID 카운트
      totalTimes: [
        { 
          $count: "timeCount"
        }
      ]
    }
  },
  // 결과 포맷 정리
  {
    $project: {
      ageGroups: 1,
      timeCount: { $arrayElemAt: ["$totalTimes.timeCount", 0] }
    }
  }
])