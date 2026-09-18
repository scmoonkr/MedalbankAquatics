const {swimmingCFG} = require('../Config/swimmingCFG');


module.exports = {
	
	eliteAgeGroup: (body) => {
		let ageGroup;
		switch (body.gender) {
			case 'men':
				if (body.ageGroup == 'A') { // 유년부
					ageGroup = "남자유년부";
				} else {
					switch (body.ageGroup) {
						case "Y":
							ageGroup = { $in: ["남자초등부", "초등부"] };
							break;
							case "Z":
								ageGroup = { $in: ["남자중학부", "중학부"] };
								break;
						case "7":
							ageGroup = { $in: ["남자고등부", "고등부"] };
							break;
						case "8":
							ageGroup = { $in: ["남자대학부", "대학부"] };
							break;
						case "9":
							ageGroup = { $in: ["남자일반부", "일반부"] };
							break;
					}
				}
				break;
			case 'women':
				if (body.ageGroup == 'A') { // 유년부
					ageGroup = "여자유년부";
				} else {
					switch (body.ageGroup) {
						case "Y":
							ageGroup = { $in: ["여자초등부", "초등부"] };
							break;
							case "Z":
								ageGroup = { $in: ["여자중학부", "중학부"] };
								break;
						case "7":
							ageGroup = { $in: ["여자고등부", "고등부"] };
							break;
						case "8":
							ageGroup = { $in: ["여자대학부", "대학부"] };
							break;
						case "9":
							ageGroup = { $in: ["여자일반부", "일반부"] };
							break;
					}
				}
				break;
			case 'mixed':
				break;
		} 
		return ageGroup;
	},

	getStylesKorEng: (style) => {
		const str = swimmingCFG.stylesEngKor.find(el => el.kor == style);
		return str ? str.eng : style;
	},

	getStylesEngKor: (style) => {
		const str = swimmingCFG.stylesEngKor.find(el => el.eng == style);
		return str ? str.kor : style;
	},

	getGendersEngKor: (gender) => {
		const str = swimmingCFG.gendersEngKor.find(el => el.eng == gender);
		return str ? str.kor : gender;
	},

	getGendersEngKor: (gender) => {
		const str = swimmingCFG.gendersEngKor.find(el => el.eng == gender);
		return str ? str.kor : gender;
	},

	getRoundKor2Eng: (round) => {
		const str = swimmingCFG.roundsEngKor.find(el => el.kor == round);
		return str ? str.eng : round;
	},

	getRoundEng2Kor: (round) => {
		const str = swimmingCFG.roundsEngKor.find(el => el.eng == round.toLowerCase());
		return str ? str.kor : round;	return str.kor || round;
	},

	// 자유형, 배영, 평영, 접영, 개인혼영, 계영, 혼계영
	// 남자, 여자, 혼성
	// 25M, 50M, 100M, 200M
	sortTimes: (times, distances=this.distances) => {
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
	},
}
