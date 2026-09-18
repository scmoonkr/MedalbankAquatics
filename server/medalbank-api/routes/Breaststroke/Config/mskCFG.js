
const _leaderboards = [];
["men","women","mixed"].forEach(gender => {
	[true, false].forEach(adult => {
		["freestyle","backstroke", "breaststroke","butterfly","individualMedley","freestyleRelay","medleyRelay"].forEach(style => {
			["men","women","mixed"].forEach(gender => {
				["50M","100M","200M"].forEach(distance => {
					_leaderboards.push({ gender: gender, adult: adult, style: style, distance: distance });
				});		
			});		
		});
	});
});

exports.leaderboards = _leaderboards;

exports.PIZZA_COUNT = 8;
exports.majorTeams = 64;
exports.countOfComments = 2;
exports.courses = [ "LCM", "SCM" ];
exports.genders = ["men", "women", "mixed"];
exports.distances = [ "25M", "50M", "100M", "200M", "400M", "800M", "1500M" ];
exports.styles = ["freestyle", "backstroke", "breaststroke", "butterfly", "individualMedley", "freestyleRelay", "medleyRelay"],
exports.ageGroupTable = [

	{	'ageFrom': 10,	'ageTo': 13,	'group':  "01", 'groupName': '학생1그룹(10-13)',	},
	{	'ageFrom': 14,	'ageTo': 16,	'group':  "03", 'groupName': '학생2그룹(14-16)',	},
	{	'ageFrom': 17,	'ageTo': 19,	'group':  "05", 'groupName': '학생3그룹(17-19)',	},

	{	'ageFrom':  0,	'ageTo': 19,	'group':  "09", 'groupName': '학생 전체',	},
	{	'ageFrom': 20,	'ageTo': 200,	'group':  "10", 'groupName': '성인 전체',	},

	{	'ageFrom': 20,	'ageTo': 24,	'group':  "11", 'groupName': '1그룹(20-24)',	},
	{	'ageFrom': 25,	'ageTo': 29,	'group':  "13", 'groupName': '2그룹(25-29)',	},
	{	'ageFrom': 30,	'ageTo': 34,	'group':  "15", 'groupName': '3그룹(30-34)',	},
	{	'ageFrom': 35,	'ageTo': 39,	'group':  "17", 'groupName': '4그룹(35-39)',	},
	{	'ageFrom': 40,	'ageTo': 44,	'group':  "19", 'groupName': '5그룹(40-44)',	},
	{	'ageFrom': 45,	'ageTo': 49,	'group':  "21", 'groupName': '6그룹(45-49)',	},
	{	'ageFrom': 50,	'ageTo': 54,	'group':  "23", 'groupName': '7그룹(50-54)',	},
	{	'ageFrom': 55,	'ageTo': 59,	'group':  "25", 'groupName': '8그룹(55-59)',	},
	{	'ageFrom': 60,	'ageTo': 64,	'group':  "27", 'groupName': '9그룹(60-64)',	},
	{	'ageFrom': 65,	'ageTo': 69,	'group':  "29", 'groupName': '10그룹(65-69)',	},
	{	'ageFrom': 70,	'ageTo': 74,	'group':  "31", 'groupName': '11그룹(70-74)',	},
	{	'ageFrom': 75,	'ageTo': 79,	'group':  "33", 'groupName': '12그룹(75-79)',	},
	{	'ageFrom': 80,	'ageTo': 84,	'group':  "35", 'groupName': '13그룹(80-84)',	},
	{	'ageFrom': 85,	'ageTo': 89,	'group':  "37", 'groupName': '14그룹(85-89)',	},
	{	'ageFrom': 90,	'ageTo': 94,	'group':  "39", 'groupName': '15그룹(90-94)',	},
	{	'ageFrom': 95,	'ageTo': 99,	'group':  "41", 'groupName': '16그룹(95-99)',	},
	{	'ageFrom': 100,	'ageTo': 200,	'group':  "43", 'groupName': '17그룹(100+)',	},
];
exports.calculateDob2Age = (dob) => {
  const today = new Date();
	if (typeof dob == "string") {
		const arr = dob.split("-");
		dob = new Date(arr[0], Number(arr[1])-1, Number(arr[2]));
	}
	dob = new Date(dob);
  let age = today.getFullYear() - dob.getFullYear();
  const monthDiff = today.getMonth() - dob.getMonth();
  
  // 생일이 지났는지 여부를 확인하여 나이를 조정
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
    age--;
  }

  return age;
}

// 나이에 맞는 그룹 찾기
exports.findAgeGroup = (dob)  => {
  const age = this.calculateDob2Age(dob);
  
  // 나이에 맞는 그룹을 찾기
  for (const group of this.ageGroupTable) {
		// check 학생, 성인 제외
		if (group.ageFrom == 0 || group.ageTo == 200)	continue;
    if (group.ageFrom <= age && group.ageTo >= age) {
      return group;
    }
  }
  
  // 나이에 맞는 그룹이 없을 경우 기본 그룹 반환 (학생 or 성인)
  if (age < 20) {
    return this.ageGroupTable.find(g => g.group === '09');
  } else {
    return this.ageGroupTable.find(g => g.group === '10');
  }
}
exports.getAgeGroupCode = (dob) => {
	const age = this.calculateDob2Age(dob);
  
  // 나이에 맞는 그룹을 찾기
  for (const group of this.ageGroupTable) {
		// check 학생, 성인 제외
		if ("09,10".includes(group.group))	continue;
    if (group.ageFrom <= age && group.ageTo >= age) {
      return group.groupName;
    }
  }
	return age < 20 ? "학생" : "성인"; // group - 학생: 성인
}
exports.getAgeGroupNameByDob = (dob) => {
	const age = this.calculateDob2Age(dob);
  
  // 나이에 맞는 그룹을 찾기
  for (const group of this.ageGroupTable) {
		// check 학생, 성인 제외
		if ("09,10".includes(group.group))	continue;
    if (group.ageFrom <= age && group.ageTo >= age) {
      return group.groupName;
    }
  }
	return age < 20 ? "학생" : "성인"; // group - 학생: 성인
}
exports.calculateAgeGroup2Range = (group) => {
	const table = this.ageGroupTable.find(el => el.group == group);
	console.log(table);
	if (!table) return null;
  const currentDate = new Date();

	// 현재 날짜로부터 age 만큼의 년도를 뺀 날짜 범위 계산
	const endDate = new Date(currentDate.getFullYear() - table.ageFrom, currentDate.getMonth(), currentDate.getDate());
	const startDate = new Date(currentDate.getFullYear() - table.ageTo - 1, currentDate.getMonth(), currentDate.getDate());
	return {
    endDate,
    startDate
  };
}
exports.getAgeGroup2Age = (group) => {
	const table = this.ageGroupTable.find(el => el.group == group);
	console.log(group, table);
	const query = {};
	if (!table) return query;
	return {};
}
exports.getAgeGroupNameByAgeGroupCode = (code) => {
	const group = this.ageGroupTable.find(el => el.group == code);
	return group ? group.groupName : code;
}
exports.styleGenderDistance = [
	{ style: "freestyle",
		gender: ["men", "women"],
		distance: ["25M", "50M", "100M", "200M", "400M", "800M", "1500M"],
	},
	{ style: "backstroke",
		gender: ["men", "women"],
		distance: ["25M", "50M", "100M", "200M", "400M", "800M", "1500M"],
	},
	{ style: "breaststroke",
		gender: ["men", "women"],
		distance: ["25M", "50M", "100M", "200M", "400M", "800M", "1500M"],
	},
	{ style: "butterfly",
		gender: ["men", "women"],
		distance: ["25M", "50M", "100M", "200M", "400M", "800M", "1500M"],
	},
	{ style: "individualMedley",
		gender: ["men", "women"],
		distance: ["100M", "200M", "400M", "800M", "1500M"],
	},
	{ style: "freestyleRelay",
		gender: ["men", "women", "mixed"],
		distance: ["100M", "200M", "400M", "800M", "1500M"],
	},
	{ style: "medleyRelay",
		gender: ["men", "women", "mixed"],
		distance: ["100M", "200M", "400M", "800M", "1500M"],
	},
]

exports.stylesEngKor = 	[
	{ eng: "freestyle",       code: "FR", 	fina: "FREE", 					kor: "자유형",   	 },
	{ eng: "backstroke",      code: "BK", 	fina: "BACK", 					kor: "배영",     	 },
	{ eng: "breaststroke",    code: "BR", 	fina: "BREAST", 				kor: "평영",     	 },
	{ eng: "butterfly",       code: "FL", 	fina: "FLY", 						kor: "접영",     	 },
	{ eng: "individualMedley",code: "IM", 	fina: "IM", 						kor: "개인혼영",   	 },
	{ eng: "individualMedley",code: "IM", 	fina: "IM", 						kor: "혼계",   	 },
	{ eng: "freestyleRelay",  code: "FRR", 	fina: "FREE RELAY", 		kor: "자유형계영",  },
	{ eng: "medleyRelay",     code: "MR", 	fina: "MEDLEY RELAY", 	kor: "혼계영",   	 },
	
	{ eng: "BRZS",      			code: "BRZS", fina: "ZERO STROKE",		kor: "제로스트로크",   },
	{ eng: "BROS",      			code: "BROS", fina: "ONE STROKE",			kor: "원스트로크",   	 },
	{ eng: "BRMS",      			code: "BRMS", fina: "MINIMUM STROKE", kor: "최소스트로크",   },
	{ eng: "BROW",      			code: "BROW", fina: "OFF WALL",				kor: "오프월드",   	 },
	{ eng: "BRUW",      			code: "BRUW", fina: "UNDERWATER", 		kor: "잠영최대거리",   },
];


exports.getStyles = (styleKor) => {
	let fin;
	try {
		let style = styleKor.replace("혼성", "");
		if (style.includes("핀")) { fin = true; style = style.replace("핀", ""); }
		if (style.includes(/Fins/gi)) { fin = true; style = style.replace(/Fins/gi, ""); }
		const table = this.stylesEngKor.find(el => el.kor == style);
		if (table) {
			if (fin) table.fin = fin;
			return table; 
		} else {
			console.log("1> styleKor=", styleKor);
			return { eng: styleKor, code: styleKor, fin };
		}		
	} catch (e) {
		console.log("2> styleKor=", styleKor);
		return { eng: styleKor, code: styleKor, fin };
	}
}

exports.getDiscipline = (style) => {
	const str = this.stylesEngKor.find(el => el.eng == style);
	return str ? str.code : style;
}

exports.getDisciplineKor = (style) => {
	const str = this.stylesEngKor.find(el => el.code == style);
	return str ? str.kor : style;
}

exports.getStylesKorEng = (style) => {
	const str = this.stylesEngKor.find(el => el.kor == style);
	return str ? str.code : style;
}
exports.getStylesEngKor = (style) => {
	const str = this.stylesEngKor.find(el => el.eng == style);
	return str ? str.kor : style;
}// 자유형, 배영, 평영, 접영, 개인혼영, 계영, 혼계영
// 남자, 여자, 혼성
// 25M, 50M, 100M, 200M
exports.sortTimes = (times, distances=this.distances) => {
	const records = [];
	for (const style of this.styles) {
		for (const gender of this.genders) {
			for (const distance of distances) {
				const record = times.find(el => el.style==style&&el.gender==gender&&el.distance==distance);
				if (record) {
					records.push(record);
				}
			}				
		}	
	}
	return records;
}

exports.sortStyleGenderDistance = (times) => {
	return times.sort((a, b) => {
			const styleDiff = this.styles.indexOf(a.style) - this.styles.indexOf(b.style);
			if (styleDiff !== 0) return styleDiff;

			const genderDiff = this.genders.indexOf(a.gender) - this.genders.indexOf(b.gender);
			if (genderDiff !== 0) return genderDiff;

			return this.distances.indexOf(a.distance) - this.distances.indexOf(b.distance);
	});
};

exports.sortGenderStyleDistance = (times) => {
	return times.sort((a, b) => {
			const genderDiff = this.genders.indexOf(a.gender) - this.genders.indexOf(b.gender);
			if (genderDiff !== 0) return genderDiff;

			const styleDiff = this.styles.indexOf(a.style) - this.styles.indexOf(b.style);
			if (styleDiff !== 0) return styleDiff;

			return this.distances.indexOf(a.distance) - this.distances.indexOf(b.distance);
	});
};

exports.sortGenderStyleCourseDistance = (times) => {
	return times.sort((a, b) => {
			const genderDiff = this.genders.indexOf(a.gender) - this.genders.indexOf(b.gender);
			if (genderDiff !== 0) return genderDiff;

			const styleDiff = this.styles.indexOf(a.style) - this.styles.indexOf(b.style);
			if (styleDiff !== 0) return styleDiff;

			const courseDiff = this.courses.indexOf(a.course) - this.styles.indexOf(b.course);
			if (courseDiff !== 0) return courseDiff;

			return this.distances.indexOf(a.distance) - this.distances.indexOf(b.distance);
	});
};


exports.gendersEngKor = [
	{ eng: "men", 	kor: "남자" },
	{ eng: "women", kor: "여자" },
	{ eng: "mixed", kor: "혼성" },
];
exports.getGendersEngKor = (gender) => {
	const str = this.gendersEngKor.find(el => el.eng == gender);
	return str ? str.kor : gender;
}

exports.roundsEngKor = [
	{ eng: "preliminaries", kor: "예선" },
	{ eng: "round2",        kor: "예선2" },
	{ eng: "quaterFinals",  kor: "준준결승" },
	{ eng: "semiFinals",    kor: "준결승" },
	{ eng: "finals",        kor: "결승"  },
	{ eng: "record",        kor: "기록회" },
	{ eng: "timeRace",      kor: "타임레이스" },
];

exports.getRoundKor2Eng = (round) => {
	const str = this.roundsEngKor.find(el => el.kor == round);
	return str ? str.eng : round;
}
exports.getRoundEng2Kor = (round) => {
	const str = this.roundsEngKor.find(el => el.eng == round.toLowerCase());
	return str ? str.kor : round;	return str.kor || round;
}

exports.getHeatCode2Name = (heat) => {
	heat.round = heat.round || "";
  let code = { gender: heat.gender, style: heat.style, round: heat.round, };
	let str;

	str = this.gendersEngKor.find(el => el.eng == heat.gender.toLowerCase());
	if (str) code.gender = str.kor;

	code.adult = heat.adult ? "마스터즈" : "주니어";

	str = this.stylesEngKor.find(el => el.eng == heat.style);
	if (str) code.style = str.kor;

	str = this.roundsEngKor.find(el => el.eng == heat.round.toLowerCase());
	if (str) code.round = str.kor;

  return code;
}

exports.getHeatName2Code = (heat) => {
  let code = { gender: heat.gender, style: heat.style, round: heat.round, };
	let str;

	str = this.gendersEngKor.find(el => el.kor == heat.gender.toLowerCase());
	if (str) code.gender = str.eng;

	code.adult = heat.adult ? "masters" : "junior";

	str = this.stylesEngKor.find(el => el.kor == heat.style.toLowerCase());
	if (str) code.style = str.eng;

	str = this.roundsEngKor.find(el => el.kor == heat.round.toLowerCase());
	if (str) code.round = str.eng;
// console.log("----->", heat.style, code.style);
  return code;
}

exports.customizingLeaderboard = (event, times) => {
  if (times.length == 0) return { title: "", name: "", times: [] };
  // const event = (times.length == undefined ? times : times[0]);

	let category = { title: "", name: "", category: "", style: "", gender: "", distance: "", course: "", times: times };
// console.log(times);

	category.title = (event.adult ? "성인" : "학생") + " ";
	category.name = event.adult ? "Masters" : "Junior";
	
	// category.adult = event.adult;
	category.style = event.style;
	category.gender = event.gender;
	category.distance = event.distance;
	category.course = event.course || "LCM";
	
	category.title += event.distance + " ";
	category.name += event.distance.replace("M", "").replace("m", "");

	switch (event.style) {
		case "breaststroke":  category.title += "평영 ";   break;
		case "butterfly":    	category.title += "접영 ";	 break;
		case "freestyle":  		category.title += "자유형 "; break;
		case "backstroke":    category.title += "배영 ";   break;
		case "medley":    		category.title += "혼영 ";   break;
	}
	category.name += event.style.substr(0, 1).toUpperCase() + event.style.substr(1);

	switch (event.gender) {
		case "men":   category.title += "남자 ";    break;
		case "women": category.title += "여자 ";    break;
		case "mixed": category.title += "혼성 ";    break;
	}
	category.name += event.gender.substr(0, 1).toUpperCase() + event.gender.substr(1);

	category.title += category.course;
	category.name += category.course;

	return category;
}
