const stylesEngKor = [
	{ eng: "freestyle",        kor: "자유영",   	code: "FR", fina: "FREE" },
	{ eng: "freestyle",        kor: "자유형",   	code: "FR", fina: "FREE" },
	{ eng: "backstroke",       kor: "배영",   	code: "BK", fina: "BACK" },
	{ eng: "backstroke",       kor: "배형",   	code: "BK", fina: "BACK" },
	{ eng: "breaststroke",     kor: "평영",   		code: "BR", fina: "BREAST" },
	{ eng: "breaststroke",     kor: "평형",   		code: "BR", fina: "BREAST" },
	{ eng: "butterfly",        kor: "접영",   		code: "FL", fina: "FLY" },
	{ eng: "butterfly",        kor: "접형",   		code: "FL", fina: "FLY" },
	{ eng: "individualMedley", kor: "개인혼영",   code: "IM", fina: "IM" },
	{ eng: "individualMedley", kor: "개인혼형",   code: "IM", fina: "IM" },
	{ eng: "individualMedley", kor: "개인혼",   code: "IM", fina: "IM" },
	{ eng: "individualMedley", kor: "개혼",   code: "IM", fina: "IM" },
	{ eng: "medleyRelay",      kor: "혼계영",   	code: "MR", fina: "MEDLEY RELAY" },
	{ eng: "medleyRelay",      kor: "혼성계영",   	code: "MR", fina: "MEDLEY RELAY" },
	{ eng: "freestyleRelay",   kor: "자유형계영", code: "FRR", fina: "FREE RELAY" },
	{ eng: "freestyleRelay",   kor: "계영", code: "FRR", fina: "FREE RELAY" },
	{ eng: "freestyleRelay",   kor: "계형", code: "FRR", fina: "FREE RELAY" },

	// { eng: "Obstacle Swim",    kor: "Obstacle Swim", code: "OS", fina: "OS" },
	// { eng: "Manikin Carry with Fins", kor: "Manikin Carry with Fins", code: "MCF", fina: "MCF" },
	// { eng: "수상구조사 구조영법",      kor: "수상구조사 구조영법",   	code: "수상구조사 구조영법", fina: "수상구조사 구조영법" },
];

const roundsEngKor = [
	{ eng: "round2",        kor: "예선2" },
	{ eng: "preliminaries", kor: "예선" },
	{ eng: "quaterFinals",  kor: "준준결승" },
	{ eng: "semiFinals",    kor: "준결승" },
	{ eng: "finals",        kor: "결승"  },
	{ eng: "record",        kor: "기록회" },
	{ eng: "timeRace",      kor: "타임레이스" },
];

/**
 * 문자열 정규화 (공백 여러 개 → 1개, trim)
 */
function normalizeString(str) {
	if (!str) return '';
	return str.trim().replace(/\s+/g, ' ');
}

/**
 * 정규식 특수문자 이스케이프
 */
function escapeRegex(str) {
	return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * discipline 문자열 파싱 (대소문자 무시, 공백 여러개 처리)
 * @param {string} disciplineStr - "접영  100M  예선" 또는 "BUTTERFLY 100m Preliminaries"
 * @returns {Object} { discipline, distance, round, etc }
 */
function parseDiscipline(disciplineStr) {
	if (!disciplineStr) return null;

	const result = {
		discipline: null,
		style: null,
		distance: null,
		// round: null,
		// etc: null,
		disciplineORG: disciplineStr
	};
	// 혼성
	if (disciplineStr.includes("혼성")) {
		result.gender = "mixed";
		disciplineStr = disciplineStr.replace("혼성", "").trim();
	}

	//핀자유형 100M
	if (disciplineStr.includes("핀")) {
		result.fin = true;
		disciplineStr = disciplineStr.replace("핀", "");
	}
	if (disciplineStr.includes("킥") || disciplineStr.includes("발차기")) {
		result.kick = true;
		disciplineStr = disciplineStr.replace(/발차기|킥/gi, "");
	}

	// 1. 문자열 정규화 (공백 여러개 → 1개)
	let str = normalizeString(disciplineStr);
	let remaining = str;

	// 2. 영법 찾기 (긴 이름부터 매칭)
	// const sortedStyles = [...stylesEngKor].sort((a, b) => {
	// 	const aMaxLen = Math.max(a.eng.length, a.kor.length);
	// 	const bMaxLen = Math.max(b.eng.length, b.kor.length);
	// 	return bMaxLen - aMaxLen;
	// });

	let foundStyle = null;

	for (const style of stylesEngKor) { // sortedStyles
		// 영어 매칭 (대소문자 무시)
		const engPattern = new RegExp(`^${escapeRegex(style.eng)}\\s*`, 'i');
		if (engPattern.test(remaining)) {
			foundStyle = style;
			remaining = remaining.replace(engPattern, '').trim();
			break;
		}

		// 한글 매칭
		const korPattern = new RegExp(`^${escapeRegex(style.kor)}\\s*`);
		if (korPattern.test(remaining)) {
			foundStyle = style;
			remaining = remaining.replace(korPattern, '').trim();
			break;
		}

		// FINA 약자 매칭 (대소문자 무시)
		const finaPattern = new RegExp(`^${escapeRegex(style.fina)}\\s*`, 'i');
		if (finaPattern.test(remaining)) {
			foundStyle = style;
			remaining = remaining.replace(finaPattern, '').trim();
			break;
		}
		// if (style.search.includes()) {
	}

	if (foundStyle) {
		result.discipline = foundStyle.code;
		result.style = foundStyle.eng;
	}

	// 3. 거리 찾기 (50M, 100m, 4x100, 4X100M 등, 대소문자 무시)
	const distancePattern = /^(\d+\s*[xX×]\s*\d+\s*[Mm]?|\d+\s*[Mm])\s*/i;
	const distanceMatch = remaining.match(distancePattern);
	
	if (distanceMatch) {
		// 공백 제거하고 대문자로 통일
		let distance = distanceMatch[1].replace(/\s+/g, '').toUpperCase();
		
		// M이 없으면 추가
		if (!/M$/.test(distance) && !/X\d+$/.test(distance)) {
			distance += 'M';
		}
		
		// x 소문자를 X 대문자로
		distance = distance.replace(/x/i, 'X');
		
		result.distance = distance;
		if (! "25M,50M,100M,200M,400M,800M,1500M,1,500M".includes(distance)) result.status = "error";
		remaining = remaining.replace(distancePattern, '').trim();
	}

	// 4. 라운드 찾기
	let foundRound = null;

	for (const round of roundsEngKor) {
		// 한글 매칭
		const korPattern = new RegExp(`^${escapeRegex(round.kor)}\\s*`);
		if (korPattern.test(remaining)) {
			foundRound = round;
			remaining = remaining.replace(korPattern, '').trim();
			break;
		}

		// 영어 매칭 (대소문자 무시)
		const engPattern = new RegExp(`^${escapeRegex(round.eng)}\\s*`, 'i');
		if (engPattern.test(remaining)) {
			foundRound = round;
			remaining = remaining.replace(engPattern, '').trim();
			break;
		}
	}

	if (foundRound) {
		result.round = foundRound.eng;
	}

	// 5. 나머지는 etc로
	if (remaining.length > 0) {
		result.etc = remaining;
	}
	
	if (!result.style && result.kick	) {			
		result.discipline = "발차기";
		result.style = "발차기";
	}

	if (result.etc) {
		for (const dist of ["25M","50M","100M","200M","400M","800M","1500M","1,500M"]) {
			if (result.etc.includes(dist)) {
				result.distance = dist;
				result.etc = result.etc.replace(dist, '').trim();
				break;
			}
		}
	}

	return result;
}

/**
 * 코드로 영법/라운드 찾기 헬퍼 함수들
 */
function getStyleByCode(code) {
	return stylesEngKor.find(s => s.code === code);
}

function getRoundByCode(code) {
	return roundsEngKor.find(r => r.eng === code);
}

function getStyleName(code, lang = 'kor') {
	const style = getStyleByCode(code);
	return style ? (lang === 'eng' ? style.eng : style.kor) : null;
}

function getRoundName(code, lang = 'kor') {
	const round = getRoundByCode(code);
	return round ? (lang === 'eng' ? round.eng : round.kor) : null;
}

// 테스트
function test() {
	const testCases = [
		// "Manikin Carry with Fins 100M예선",
		// "MANIKIN CARRY WITH FINS  100M  예선",
		// "manikin carry with fins   100m   PRELIMINARIES",
		// "접영100M예선",
		// "접영  100M  예선",
		// "접영   100m   예선",
		// "접영100M예선1번영자",
		"BUTTERFLY  100M  FINALS",
		// "butterfly   100m   finals   Heat 2",
		// "자유형 50M 결승",
		// "자유형    50m    결승",
		// "FREESTYLE   50M   FINALS",
		// "배영 200m 준결승",
		// "BACKSTROKE  200M  SEMIFINALS",
		// "Individual Medley 200M Preliminaries",
		// "INDIVIDUAL  MEDLEY   200m   preliminaries",
		// "자유형계영 4x100M 예선",
		// "자유형계영   4 x 100 M   예선",
		// "FREE  RELAY   4X100M   PRELIMINARIES",
		// "혼계영4X200M결승",
		// "혼계영   4  X  200  M   결승",
		// "MEDLEY   RELAY   4x200m   finals",
		// "평영50M기록회",
		// "평영   50m   기록회",
		// "BREASTSTROKE  50M  RECORD",
		// "Butterfly 100m Semi-Finals Heat 2",
		// "BUTTERFLY   100M   SEMI-FINALS   HEAT   2",
		// "FREE 100M PRELIMINARIES",
		// "BREAST  200M  FINALS",
	];

	console.log('='.repeat(100));
	console.log('Discipline Parsing Test (Case Insensitive & Multiple Spaces)');
	console.log('='.repeat(100));

	testCases.forEach((testCase, index) => {
		console.log(`\n${index + 1}. "${testCase}"`);
		const result = parseDiscipline(testCase);
		console.log('   결과:', JSON.stringify(result, null, 2));
	});

	// 추가 테스트: 다양한 케이스
	console.log('\n' + '='.repeat(100));
	console.log('Edge Cases Test');
	console.log('='.repeat(100));

	const edgeCases = [
		"butterfly100mprelimaries", // 공백 없음
		"BUTTERFLY     100M     PRELIMINARIES", // 공백 많음
		"ButterFly 100m PreliMinAries", // 대소문자 섞임
		// "접영１００M예선", // 전각 숫자 (처리 안됨 - 정규식 수정 필요시)
	];

	edgeCases.forEach((testCase, index) => {
		console.log(`\n${index + 1}. "${testCase}"`);
		const result = parseDiscipline(testCase);
		console.log('   결과:', JSON.stringify(result, null, 2));
	});
}

// Export
module.exports = {
	parseDiscipline,
	getStyleByCode,
	getRoundByCode,
	getStyleName,
	getRoundName,
	stylesEngKor,
	roundsEngKor
};

// 실행
if (require.main === module) {
	// test();
}