db.getCollection('times_MSKR').aggregate([
{ $match: { competitionID: 1709, athleteID: { $gt:0 }} },
  {
    $facet: {
      // athleteID별 카운트 (상위 3개)
      athleteCounts: [
        {
          $group: {
            _id: "$athleteID",
            athleteCount: { $sum: 1 }
          }
        },
        { $sort: { athleteCount: -1 } },
        { $limit: 3 },
        {
          $project: {
            _id: 0,
            athleteID: "$_id",
            athleteCount: 1
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
      athleteCounts: 1,
      timeCount: { $arrayElemAt: ["$totalTimes.timeCount", 0] }
    }
  }
])