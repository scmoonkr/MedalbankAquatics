
export const youtubeFilters = {
  isRegistered: [{label:'등록+비등록', value: '' }, {label:'등록', value: '등록' }, {label:'비등록', value: '비등록' },],
  gender: [{label:'남녀전체', value: '' }, {label:'남자', value: 'men' }, {label:'여자', value: 'women' },],
  discipline: [{label:'평영', value: 'BK' }, {label:'자유형', value: 'FR'}, {label:'배영', value: 'BK' }, {label:'접영', value: '' }, {label:'개인혼영', value: '' }],
  distance: [{label:'25M', value: '25M' }, {label:'50M', value: '50M' }, {label:'100M', value: '100M' }, {label:'200M', value: '200M' }, {label:'400M', value: '400M' }, {label:'800M', value: '800M' }, {label:'1500M', value: '1500M' },],
  course: [{label:'LCM', value: 'LCM' }, {label:'SCM', value: 'SCM' },],
  classCode: [{label:'그룹전체', value: '' }, {label:'유년부', value: '유년부' }, {label:'초등부', value: '초등부' }, {label:'중등부', value: '중등부' }, {label:'고등부', value: '고등부' }, {label:'대학부', value: '대학부' }, {label:'일반부', value: '일반부' }, {label:'성인부', value: '성인부' },],
}

export function getYoutubeFilters(field, label) {
  if (!youtubeFilters[field]) return '';
  const item = youtubeFilters[field].find(el => el.label === label);
	return item.value;
}

export const disciplineEngKor =    [
   { eng: "freestyle",       code: "FR",    fina: "FREE",                kor: "자유형",       },
   { eng: "backstroke",      code: "BK",    fina: "BACK",                kor: "배영",         },
   { eng: "breaststroke",    code: "BR",    fina: "BREAST",             kor: "평영",         },
   { eng: "butterfly",       code: "FL",    fina: "FLY",                   kor: "접영",         },
   { eng: "individualMedley",code: "IM",    fina: "IM",                   kor: "혼계",       },
   { eng: "individualMedley",code: "IM",    fina: "IM",                   kor: "개인혼영",       },
   { eng: "freestyleRelay",  code: "FRR",   fina: "FREE RELAY",       kor: "자유형계영",  },
   { eng: "medleyRelay",     code: "MR",    fina: "MEDLEY RELAY",    kor: "혼계영",       },
   { eng: "olympid",         code: "olympid",    fina: "OLYMPIAD",        kor: "올림피아드",   },
   
   { eng: "BROW",               code: "BROW", fina: "OFF WALL",            kor: "평영 벽차고출발",       },
   { eng: "BRZS",               code: "BRZS", fina: "ZERO STROKE",      kor: "평영 제로스트로크",   },
   { eng: "BROS",               code: "BROS", fina: "ONE STROKE",         kor: "평영 원스트로크",       },
   { eng: "BRMS",               code: "BRMS", fina: "MINIMUM STROKE", kor: "평영 최소스트로크",   },
   { eng: "BRUW",               code: "BRUW", fina: "UNDERWATER",       kor: "평영 잠영최대거리",   },
];
export function getEventName(discipline, course, distance, lang='ko') {
	const dist = lang == 'ko' ? distance : distance.replace("M", "");
	const displn = lang == 'ko' ? getDisciplineByEng(discipline) : `(${discipline.slice(2)})`;
	let name = "";
	if (discipline.length <= 3) { // BR, FRR
		name = `${displn} ${dist} ${course}`
	} else { // BROS
		// name = `${lang=='ko' ? '평영' : "BR"} ${dist} ${course} ${displn}`
		name = `${lang=='ko' ? displn : "BR"} ${dist} ${course}`
	}
	return name;
}
export function getDisciplineByEng(discipline = '') {
  const disp = disciplineEngKor.find(el => el.code === discipline) || '';
  return disp ? disp.kor : discipline;
}
export function getDisciplineByStyleEng(style = '') {
  const disp = disciplineEngKor.find(el => el.eng === style) || '';
  return disp ? disp.code : style;
}
export function getDisciplineKorByEng(style = '') {
  const disp = disciplineEngKor.find(el => el.code === style) || '';
  return disp ? disp.kor : style;
}
export function getDisciplineByKor(discipline = '') {
  const disp = disciplineEngKor.find(el => {
    const arr = el.kor.split(' ');
    return arr[arr.length-1] == discipline
  }) || '';
  return disp ? disp.code : discipline;
}

export const distanceTable = [
  { value: '25M', label: '25M' },
  { value: '50M', label: '50M' },
  { value: '100M', label: '100M' },
  { value: '200M', label: '200M' },
  { value: '400M', label: '400M' },
  { value: '800M', label: '800M' },
  { value: '1500M', label: '1500M' },
];

export const courseTable = [
  { value: 'LCM', label: 'LCM' },
  { value: 'SCM', label: 'SCM' },
];

export const roundsEngKor = [
   { eng: "preliminaries", kor: "예선" },
   { eng: "round2",        kor: "예선2" },
   { eng: "quaterFinals",  kor: "준준결승" },
   { eng: "semiFinals",    kor: "준결승" },
   { eng: "finals",        kor: "결승"  },
   { eng: "record",        kor: "기록회" },
   { eng: "timeRace",      kor: "타임레이스" },
];

export const styleTable = [
  { value: 'FR', label: '자유형' },
  { value: 'BK', label: '배영' },
  { value: 'BR', label: '평영' },
  { value: 'FL', label: '접영' },
  { value: 'IM', label: '개인혼영' },
  // { value: 'freestyle', label: '자유형' },
  // { value: 'backstroke', label: '배영' },
  // { value: 'breaststroke', label: '평영' },
  // { value: 'butterfly', label: '접영' },
  // { value: 'individualMedley', label: '개인혼영' },
];

export const sidoTable = [
  { value: '서울', label: '서울' },
  { value: '경기', label: '경기' },
  { value: '인천', label: '인천' },
  { value: '강원', label: '강원' },
  { value: '충북', label: '충북' },
  { value: '충남', label: '충남' },
  { value: '대전', label: '대전' },
  { value: '경북', label: '경북' },
  { value: '대구', label: '대구' },
  { value: '울산', label: '울산' },
  { value: '부산', label: '부산' },
  { value: '경남', label: '경남' },
  { value: '전북', label: '전북' },
  { value: '전남', label: '전남' },
  { value: '광주', label: '광주' },
  { value: '제주', label: '제주' },
  { value: '세종', label: '세종' },
  { value: '해외', label: '해외' },
];

export const AgeGroupTable = [
  { value: '', label: '마스터즈', },
  { value: 'A', label: '유년부', },
  { value: 'Y', label: '초등부', },
  { value: 'Z', label: '중학부', },
  { value: '7', label: '고등부', },
  { value: '8', label: '대학부', },
  { value: '9', label: '일반부', },
  // { value: '1', label: '남자고등부', },
  // { value: '4', label: '여자고등부', },
  // { value: '2', label: '남자대학부', },
  // { value: '5', label: '여자대학부', },
  // { value: '3', label: '남자일반부', },
  // { value: '6', label: '여자일반부', },

  // { value: 'S', label: '남자유년부', },
  // { value: 'T', label: '여자유년부', },
  // { value: 'U', label: '남자초등부', },
  // { value: 'W', label: '여자초등부', },
  // { value: 'V', label: '남자중학부', },
  // { value: 'X', label: '여자중학부', },
];// utils/swimStyles.js
export function makeTimesTitle(filter) {
  const parts = [];


  // gender 체크
  if (filter.gender && filter.gender != '성별무관') {
    parts.push(getGenderByEng(filter.gender) || filter.gender);
  }

  // ageGroup 체크
  if (filter.ageGroup) {
    const group = AgeGroupTable.find(x => x.value === filter.ageGroup);
    if (group) {
      parts.push("등록");
      parts.push(group.label);

    } else {
      parts.push(filter.ageGroup);
    }
  // } else {
  //   parts.push("비등록");
  }

  // style 체크
  if (filter.discipline) {
    // 스타일명 한글 변환 (선택 사항)
    parts.push(getDisciplineByEng(filter.discipline) || filter.discipline);
  }


  // distance 체크
  if (filter.distance) {
    parts.push(filter.distance);
  }

  // course 체크
  if (filter.course) {
    parts.push(filter.course);
  }

  // sido 체크
  if (filter.sido) {
    parts.push(filter.sido);
  }

  // typeTime 체크
  if (filter.typeTime) {
    if (filter.typeTime.includes('event')) {
      parts.push('대회기록');
    } else if (filter.typeTime.includes('time')) {
      parts.push('훈련기록');
    } else {
      parts.push(filter.typeTime);
    }
  }

  // sido 체크
  if (filter.round) {
    const round = getRoundKorByEng(filter.round);
    parts.push(round);
  }

  // 최종 타이틀 반환
  return parts.length > 0 ? parts.join(' ') : '리더보드';
}

export const typeTimes = [
  { value: 'timeResult', label: '훈련기록' },
  { value: 'eventResult', label: '대회기록' },
];

export function getTypeTimes(type = '') {
  const times = typeTimes.find(el => el.label === type);
  return times ? times.value : '';
}

export function getTypeTimesKor(type = '') {
  if (!type.includes("Result")) type += "Result";
  const times = typeTimes.find(el => el.value === type);
  return times ? times.label : '';
}
// filters : [ { field: 'discipline', selected: '자유형', options: ['자유형', '배영', '평영', '접영', '개인혼영'] } ]
// options: { discipline: '자유형', gender: '남자' }
export function setFiltersSelected(filters, options) {
  for (const filter of filters) {
    if (options[filter.field]) {
      switch (filter.field) {
        case "discipline":
          filter.selected = getDisciplineByEng(options[filter.field]);
          break;
        case "gender":
          filter.selected = getGenderByKor(options[filter.field]);
          break;
        case "typeTime":
          filter.selected = getTypeTimesKor(options[filter.field]);
          break;
        default:
          filter.selected = options[filter.field];
      }
    }
  }
  return filters;
}

// 영법 테이블 정의
export const disciplinesTable = [
  {
    "short": "FR",
    "eng": "freestyle",
    "kor": "자유형",
    "distances": ["25M", "50M", "100M", "200M", "400M", "800M", "1500M"],
  },
  {
    "short": "BK",
    "eng": "backstroke",
    "kor": "배영",
    "distances": ["25M", "50M", "100M", "200M"]
  },
  {
    "short": "BR",
    "eng": "breaststroke",
    "kor": "평영",
    "distances": ["25M", "50M", "100M", "200M"]
  },
  {
    "short": "FL",
    "eng": "butterfly",
    "kor": "접영",
    "distances": ["25M", "50M", "100M", "200M"]
  },
  {
    "short": "IM",
    "eng": "individualMedley",
    "kor": "개인혼영",
    "distances": ["100M", "200M", "400M"]
  },
  {
    "short": "FR",
    "eng": "freestyleRelay",
    "kor": "계영",
    "distances": ["100M", "200M", "400M", "800M"]
  },
  {
    "short": "MR",
    "eng": "medleyRelay",
    "kor": "혼계영",
    "distances": ["100M", "200M", "400M"]
  },
  {
    "short": "HL",
    "eng": "highlight",
    "kor": "하이라이트",
    "distances": ["100M", "200M", "400M"]
  },
  {
    "short": "ET",
    "eng": "ETC",
    "kor": "기타",
    "distances": ["100M", "200M", "400M"]
  },
  // { "eng": "total", "kor": "합계" },
];

export function parsingNameStyleDistance(name) {
  // body.name = arr[0];
  let arr = name.replace(/\s{2,}/g, ' ')
                    .replace(/ /gi, ",")
                    .split(',')
                    .filter(el => el);
  // body.name = arr[0];
  const query = {};
  for (let field of arr) {
    if (!field) continue;
    const check = disciplinesTable.find(el => el.kor==field);
    if (check) {
      query.discipline = check.eng;
      arr = arr.filter(el => el != field);
    } else {
      field = field.replace("M", "");
      if (!isNaN(field)) {
        query.distance = `${field}M`;
        arr = arr.filter(el => el != field);
      } else {
        // body.name = field;
      }
    }
  }
  query.name = arr.map(el => decodeURIComponent(el));
  return query;
}

/**
 * 영문 코드(eng)로 영법 정보 객체 가져오기
 * @param {string} eng - 영문 코드 (예: freestyle)
 * @returns {object|null} 영법 정보 객체 또는 null
 */
export function getStyleByEng(discipline = '') {
  return disciplinesTable.find(el => el.eng === discipline) || '';
}

/**
 * 축약 코드(short)로 영법 정보 객체 가져오기
 * @param {string} short - 축약 코드 (예: FR)
 * @param {string} [distinguisher] - 구분자 (freestyleRelay와 freestyle 구분용)
 * @returns {object|null} 영법 정보 객체 또는 null
 */
export function getStyleByShort(short, distinguisher = null) {
  // 구분자가 있는 경우 (예: 'relay'가 포함된 경우 릴레이로 간주)
  if (distinguisher === 'relay' || distinguisher === 'Relay') {
    if (short === 'FRR') {
      return disciplinesTable.find(el => el.eng === 'FRR') || '';
    } else if (short === 'MR') {
      return disciplineEngKor.find(el => el.eng === 'MR') || '';
    }
  }

  // 일반적인 경우 (구분자 없음)
  return disciplinesTable.find(el => el.short === short && el.eng !== 'FRR' && el.eng !== 'MR') || '';
}

/**
 * 영문 코드(eng)로 한글 이름 가져오기
 * @param {string} eng - 영문 코드 (예: freestyle)
 * @returns {string} 한글 이름 또는 빈 문자열
 */
export function getStyleKorByEng(eng = '') {
  const discipline = getStyleByEng(eng);
  return discipline ? discipline.kor : eng;
}

/**
 * 한글 이름으로 영문 코드(eng) 가져오기
 * @param {string} kor - 한글 이름 (예: 자유형)
 * @returns {string} 영문 코드 또는 빈 문자열
 */
export function getStyleEngByKor(kor = '') {
  const discipline = disciplinesTable.find(el => el.kor === kor);
  return discipline ? discipline.eng : kor;
}

/**
 * 영문 코드(eng)로 한글 이름 가져오기
 * @param {string} eng - 영문 코드 (예: freestyle)
 * @returns {string} 한글 이름 또는 빈 문자열
 */
export function getRoundKorByEng(eng = '') {
  const discipline = roundsEngKor.find(el => el.eng === eng);
  return discipline ? discipline.kor : eng;
}

/**
 * 한글 이름으로 영문 코드(eng) 가져오기
 * @param {string} kor - 한글 이름 (예: 자유형)
 * @returns {string} 영문 코드 또는 빈 문자열
 */
export function getRoundEngByKor(kor = '') {
  const discipline = roundsEngKor.find(el => el.kor === kor);
  return discipline ? discipline.eng : kor;
}

/**
 * 축약 코드(short)로 한글 이름 가져오기
 * @param {string} short - 축약 코드 (예: FR)
 * @param {string} [distinguisher] - 구분자 (freestyleRelay와 freestyle 구분용)
 * @returns {string} 한글 이름 또는 빈 문자열
 */
export function getKorByShort(short, distinguisher = null) {
  const discipline = getStyleByShort(short, distinguisher);
  return discipline ? discipline.kor : '';
}

/**
 * 영법에 유효한 거리 목록 가져오기
 * @param {string} eng - 영문 코드 (예: freestyle)
 * @returns {string[]} 거리 목록 또는 빈 배열
 */
export function getDistancesByEng(eng = '') {
  const discipline = getStyleByEng(eng);
  return discipline && discipline.distances ? discipline.distances : [];
}

export const gendersTable = [
  { "label": "남자", "value": "men" },
  { "label": "여자", "value": "women" },
  { "label": "혼성", "value": "mixed" },
];
export function getGenderByKor(kor = '') {
  const discipline = gendersTable.find(el => el.label === kor);
  return discipline ? discipline.value : kor;
}
export function getGenderByEng(eng = '') {
  const discipline = gendersTable.find(el => el.value === eng);
  return discipline ? discipline.label : eng;
}


export function getLeaderboardTitle(leaderboard = {}) {
  let title = "";
  title += getGenderByEng(leaderboard.gender ?? '') + " ";
  title += getDisciplineByEng(leaderboard.discipline ?? '') + " ";
  title += (leaderboard.distance ?? '') + " ";
  title += leaderboard.course ?? '';
  return title ?? "";
}