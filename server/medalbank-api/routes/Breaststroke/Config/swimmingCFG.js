exports.swimmingCFG = {
  times_data_path: "c:/MedalBank",
	max_same_time: 2,	// times를 athletes로 통합할때 이름-팀-ageGroup이 같은 사람 허용 숫자
	max_ranking: 10000,
  timezone: 9,

	max_pbs			: 3,
	max_styles	: 23,
	points : {
		gold		: 10, 	// gold
		silver	: 7, 	// silver
		bronze	: 4, 	// bronze
		members	: 2,		// members

	},
  charTable: [
    { char: "9", gte: "0", lt: ":"},
    { char: "a", gte: "A", lt: "{"},
    { char: "ㄱ", gte: "가", lt: "나"},
    { char: "ㄴ", gte: "나", lt: "다"},
    { char: "ㄷ", gte: "다", lt: "라"},
    { char: "ㄹ", gte: "라", lt: "마"},
    { char: "ㅁ", gte: "마", lt: "바"},
    { char: "ㅂ", gte: "바", lt: "사"},
    { char: "ㅅ", gte: "사", lt: "아"},
    { char: "ㅇ", gte: "아", lt: "자"},
    { char: "ㅈ", gte: "자", lt: "차"},
    { char: "ㅊ", gte: "차", lt: "카"},
    { char: "ㅋ", gte: "카", lt: "타"},
    { char: "ㅌ", gte: "타", lt: "파"},
    { char: "ㅍ", gte: "파", lt: "하"},
    { char: "ㅎ", gte: "하", lt: "힣"},
  ],
  
  PIZZA_COUNT: 8,
  majorTeams: 64,
  countOfComments: 2,

  stylesEngKor: [
    { eng: "freestyle", 				kor: "자유형" },
    { eng: "backstroke", 				kor: "배영" },
    { eng: "breaststroke", 			kor: "평영" },
    { eng: "butterfly", 				kor: "접영" },
    { eng: "individualMedley",	kor: "개인혼영" },
    { eng: "freestyleRelay",		kor: "계영" },
    { eng: "medleyRelay", 			kor: "혼계영" },
  ],
  styles: ["freestyle", "backstroke", "breaststroke", "butterfly", "individualMedley", "freestyleRelay", "medleyRelay"],
  gendersEngKor: [
    { eng: "men", 	kor: "남자" },
    { eng: "women", kor: "여자" },
    { eng: "mixed", kor: "혼성" },
  ],
  genders: ["men", "women", "mixed"],
  courses: [ "LCM", "SCM" ],
  distances: [ "25M", "50M", "100M", "200M", "400M", "800M", "1500M" ],
  roundsEngKor: [
    { eng: "preliminaries", kor: "예선" },
    { eng: "round2",        kor: "예선2" },
    { eng: "quaterFinals",  kor: "준준결승" },
    { eng: "semiFinals",    kor: "준결승" },
    { eng: "finals",        kor: "결승"  },
    { eng: "record",        kor: "기록회" },
    { eng: "timeRace",      kor: "타임레이스" },
  ],
};
