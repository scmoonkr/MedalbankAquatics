db.getCollection('times_MSKR').aggregate(
[
  { $match: {
			timeStamp	: { $exists: true }, timeStamp: { $gt: 0 },
			// datetime	: { $gte: "2023-01-01", $lt: "3024-01-01" },
			competitionID:1709
		}
	},
  // 각 athleteID별로 가장 좋은 기록 선택
  { $sort: { timeStamp: 1 } }, // 시간(time) 기준으로 오름차순 정렬
  { $group: {
	  _id: {
		athleteID	: "$athleteID",
		gender  	: "$gender",
		style   	: "$style",
		course  	: "$course",
		distance	: "$distance"
	  },
	  bestRecord: { $first: "$$ROOT" }  // 각 그룹에서 첫 번째(가장 좋은) 기록 선택
	}
  },
  // bestRecord 필드를 다시 최상위 레벨로 펼치기
  { $replaceRoot: { newRoot: "$bestRecord" } },
  // gender, style, course, distance별로 그룹화하고 상위 8개 선택
  { $group: {
	  _id: {
		gender  : "$gender",
		style   : "$style",
		course  : "$course",
		distance: "$distance"
	  },
	  times: { $push: "$$ROOT" }  // 모든 기록을 배열로 저장
	}
  },
  // MongoDB 5.2 이하
	{ $unwind: "$times" }, // 배열(records)을 펼침
	{ $sort: { "times.timeStamp": 1 } }, // 기록(time)을 기준으로 정렬
	{
		$group: {
			_id: {
				gender	: "$_id.gender",
				style		: "$_id.style",
				course	: "$_id.course",
				distance: "$_id.distance"
			},      
			times: {
				$push: {
					timeID				: "$times.timeID",
					athleteID			: "$times.athleteID",
					ageGroup			: "$times.ageGroup",
					name					: "$times.name",
					timeStamp			: "$times.timeStamp",
					time					: "$times.time",
					ranking				: "$times.rank",
					datetime			: "$times.rank",
					competitionID	: "$times.competitionID",
					poolID				: "$times.poolID",
					teamID				: "$times.teamID"
				} 
			}
			//times: { $push: "$times" } // 정렬된 기록을 다시 배열로 묶음
		}
	},
	{
		$project: {
			times: { $slice: ["$times", 1] } // 상위 10개의 기록만 포함
		}
	},
	// MongoDB 5.2 이상
	//   {
	//     $project: {
	//       _id: 1,
	//       times: {
	//         $slice: [
	//           { $sortArray: { input: "$times", sortBy: { time: 1 } } }, // 기록을 오름차순으로 정렬한 후
	//           10 // 상위 10개만 가져옴
	//         ]
	//       }
	//     }
	//   },
	{ $project: {
			gender	: "$_id.gender",
			style		: "$_id.style",
			course	: "$_id.course",
			distance: "$_id.distance",
			_id			: 0,
			times		:1,
		}
	}
]
)