

const axios     = require('axios');
const utilTimes	= require('../../MSKR/Class/utilTimes');
const { competitionTable } = require('../../Work/MergeDB/competitionTable1');


const styles = ["자유형", "배영", "평영", "접영", "개인혼영", "혼성혼계영", "혼계영"];

exports.SchoolTable = [
  {	code:'7',	label: '고등부',		  gender:"mixed",	school: 'highschool',	},
  {	code:'8',	label: '대학부',		  gender:"mixed",	school: 'college',	},
  {	code:'9',	label: '일반부',		  gender:"mixed",	school: 'adult',	},
  {	code:'Y',	label: '초등부',		  gender:"mixed",	school: 'primary',	},
  {	code:'Z',	label: '중학부',		  gender:"mixed",	school: 'middleshool',	},  

  {	code:'B',	label: '남자부',	gender:"men",	school: 'adult',	},
  {	code:'C',	label: '여자부',	gender:"women",	school: 'adult',	},

  {	code:'1',	label: '남자고등부',	gender:"men",	school: 'highschool',	},
  {	code:'4',	label: '여자고등부',	gender:"women",	school: 'highschool',	},
  {	code:'2',	label: '남자대학부',	gender:"men",	school: 'college',	},
  {	code:'5',	label: '여자대학부',	gender:"women",	school: 'college',	},
  {	code:'3',	label: '남자일반부',	gender:"men",	school: 'adult',	},
  {	code:'6',	label: '여자일반부',	gender:"women",	school: 'adult',	},

  {	code:'S',	label: '남자유년부',	gender:"men",	school: 'primary',	},
  {	code:'T',	label: '여자유년부',	gender:"women",	school: 'primary',	},
  {	code:'U',	label: '남자초등부',	gender:"men",	school: 'primary',	},
  {	code:'W',	label: '여자초등부',	gender:"women",	school: 'primary',	},
  {	code:'V',	label: '남자중학부',	gender:"men",	school: 'middleshool',	},
  {	code:'X',	label: '여자중학부',	gender:"women",	school: 'middleshool',	},
];

exports.StyleDistanceTable = [
  {	code: '01',	style: 'freestyle',	styleKor: '자유형',	distance: '50M',	},
  {	code: '02',	style: 'freestyle',	styleKor: '자유형',	distance: '100M',	},
  {	code: '03',	style: 'freestyle',	styleKor: '자유형',	distance: '200M',	},
  {	code: '04',	style: 'freestyle',	styleKor: '자유형',	distance: '400M',	},
  {	code: '05',	style: 'freestyle',	styleKor: '자유형',	distance: '800M',	},
  {	code: '06',	style: 'freestyle',	styleKor: '자유형',	distance: '1500M',	},
  {	code: '07',	style: 'backstroke',	styleKor: '배영',	distance: '100M',	},
  {	code: '08',	style: 'backstroke',	styleKor: '배영',	distance: '200M',	},
  {	code: '09',	style: 'breaststroke',	styleKor: '평영',	distance: '100M',	},
  {	code: '10',	style: 'breaststroke',	styleKor: '평영',	distance: '200M',	},
  {	code: '11',	style: 'butterfly',	styleKor: '접영',	distance: '100M',	},
  {	code: '12',	style: 'butterfly',	styleKor: '접영',	distance: '200M',	},
  {	code: '13',	style: 'individualMedley',	styleKor: '개인혼영',	distance: '200M',	},
  {	code: '14',	style: 'individualMedley',	styleKor: '개인혼영',	distance: '400M',	},
  {	code: '15',	style: 'medleyRelay',	styleKor: '혼계영',	distance: '400M',	},
  {	code: '16',	style: 'freestyleRelay',	styleKor: '계영',	distance: '400M',	},
  {	code: '17',	style: 'freestyleRelay',	styleKor: '계영',	distance: '800M',	},
  {	code: '18',	style: 'backstroke',	styleKor: '배영',	distance: '50M',	},
  {	code: '19',	style: 'breaststroke',	styleKor: '평영',	distance: '50M',	},
  {	code: '20',	style: 'butterfly',	styleKor: '접영',	distance: '50M',	},

  {	code: '61',	style: 'backstroke',	styleKor: '배영',	distance: '50M',	},
  {	code: '62',	style: 'breaststroke',	styleKor: '평영',	distance: '50M',	},
  {	code: '63',	style: 'butterfly',	styleKor: '접영',	distance: '50M',	},

  {	code: '64',	style: 'medleyRelay',	styleKor: '혼계영',	distance: '200M',	},
  {	code: '65',	style: 'medleyRelay',	styleKor: '계영',	distance: '200M',	},
  {	code: '66',	style: 'medleyRelay',	styleKor: '계영',	distance: '200M',	},
  {	code: '67',	style: 'backstroke',	styleKor: '배영',	distance: '50M',	}, // 배영50M[4학년이하부]
  {	code: '68',	style: 'breaststroke',	styleKor: '평영',	distance: '50M',	}, // 평영50M[4학년이하부]
  {	code: '69',	style: 'butterfly',	styleKor: '접영',	distance: '50M',	}, // 접영50M[4학년이하부]
  
  {	code: '91',	style: 'freestyle',	styleKor: '배영',	distance: '100M',	}, // 자유형100M[4학년이하부]
  {	code: '92',	style: 'backstroke',	styleKor: '배영',	distance: '100M',	}, // 배영100M[4학년이하부]
  {	code: '93',	style: 'breaststroke',	styleKor: '평영',	distance: '100M',	}, // 평영100M[4학년이하부]
  {	code: '94',	style: 'butterfly',	styleKor: '접영',	distance: '100M',	}, // 접영100M[4학년이하부]

  {	code: '99',	style: 'medleyRelay',	styleKor: '혼계영',	distance: '400M',	}, // 일반부 혼성혼계영400m


];

/**
 * 
 * @param {*} code D2701
 *                 D2     : 경영
 *                   7    : 고등부
 *                     01 : freestyle
 * @returns 
 */
exports.getDisplineByEvent = (classCd, event) => {
  if (!code || code.length < 4) return {};
  let school = this.SchoolTable.find(el => el.code == code.slice(2, 3)) ?? {};
  if (!school) {
    const sch = this.SchoolTable.find(el => el.label == event.ageGroup);
    if (sch) {
      school = sch;
    }
  }

  const styleDistance = this.StyleDistanceTable.find(el => el.code == code.slice(3, 5)) ?? {};
  // if (!styleDistance) console.log("getDisplineAll.code=", code, "styleDistance=", styleDistance);
  try {
    const discipline = {
      // code: code,
      ageGroup: school.label ?? '',
      gender: school.gender ?? '',
      isAdult: ["adult","college"].includes(school.school),
      style: styleDistance.style ?? '',
      distance: styleDistance.distance ?? '',
    };
    // console.log("getDispline=", code, discipline);
    return discipline ?? {};
  } catch (e) {
    console.log("code=", code, "school=", school, "styleDistance=", styleDistance ?? {});
  }
}

/**
 * 
 * @param {*} code D2701
 *                 D2     : 경영
 *                   7    : 고등부
 *                     01 : freestyle
 * @returns 
 */
exports.getDisplineAll = (code) => {
  if (!code || code.length < 4) return {};
  const school = this.SchoolTable.find(el => el.code == code.slice(2, 3)) ?? {};
  // if (!school) console.log("getDisplineAll.code=", code, "school=", school);

  const styleDistance = this.StyleDistanceTable.find(el => el.code == code.slice(3, 5)) ?? {};
  // if (!styleDistance) console.log("getDisplineAll.code=", code, "styleDistance=", styleDistance);
  try {
    const discipline = {
      // code: code,
      ageGroup: school.label ?? '',
      gender: school.gender ?? '',
      isAdult: ["adult","college"].includes(school.school),
      style: styleDistance.style ?? '',
      distance: styleDistance.distance ?? '',
    };
    // console.log("getDispline=", code, discipline);
    return discipline ?? {};
  } catch (e) {
    console.log("code=", code, "school=", school, "styleDistance=", styleDistance ?? {});
  }
}

exports.DisciplineTable = [
  {	code:'D2113',	style:"individualMedley",	distance: '200M',	},
  {	code:'D2114',	style:"individualMedley",	distance: '400M',	},
  {	code:'D2107',	style:"backstroke",	distance: '100M',	},
  {	code:'D2108',	style:"backstroke",	distance: '200M',	},
  {	code:'D2118',	style:"backstroke",	distance: '50M',	},
  {	code:'D2102',	style:"freestyle",	distance: '100M',	},
  {	code:'D2106',	style:"freestyle",	distance: '1500M',	},
  {	code:'D2103',	style:"freestyle",	distance: '200M',	},
  {	code:'D2104',	style:"freestyle",	distance: '400M',	},
  {	code:'D2101',	style:"freestyle",	distance: '50M',	},
  {	code:'D2105',	style:"freestyle",	distance: '800M',	},
  {	code:'D2111',	style:"butterfly",	distance: '100M',	},
  {	code:'D2112',	style:"butterfly",	distance: '200M',	},
  {	code:'D2120',	style:"butterfly",	distance: '50M',	},
  {	code:'D2109',	style:"breaststroke",	distance: '100M',	},
  {	code:'D2110',	style:"breaststroke",	distance: '200M',	},
  {	code:'D2119',	style:"breaststroke",	distance: '50M',	},

  {	code:'D2115',	style:"medleyRelay",	distance: '400M',		gender: 'mixed', },
  {	code:'D2116',	style:"freestyleRelay",	distance: '400M',	},
  {	code:'D2117',	style:"freestyleRelay",	distance: '800M',	},
  
  {	code:'D2715',	style:"medleyRelay",	distance: '400M',	gender: 'mixed', label: '혼성혼계영400m'},
];
exports.getDispline = (code) => {
  const discipline = this.DisciplineTable.find(el => el.code == code);
  // console.log("getDispline=", code, discipline);
  return discipline ?? {};
}
exports.getDisplineName = (code) => {
  const discipline = this.DisciplineTable.find(el => el.code == code);
  return discipline?.style ?? '';
}
exports.getDisplineCode = (style) => {
  const discipline = this.DisciplineTable.find(el => el.style == style);
  // console.log("getDisplineCode.style=", style, "discipline=", discipline);
  return discipline?.code ?? '';
}
exports.getSchool = (code) => {
  const school = this.SchoolTable.find(el => el.code == code);
  return school ?? {};
}
exports.getSchoolByName = (label) => {
  const school = this.SchoolTable.find(el => el.label == label);
  return school ?? {};
}
exports.getSchoolName = (code) => {
  const school = this.SchoolTable.find(el => el.code == code);
  return school?.label ?? '';
}
exports.getSchoolCode = (label) => {
  const school = this.SchoolTable.find(el => el.label == label);
  console.log("getSchoolCode.label=", label, "school=", school);
  return school?.code ?? '';
}

exports.CompetitionTable = [
  {	cid:371,	competitionName:'제20회 제주 한라배 전국수영대회(경영)',	dateStart:'45759',	dateEnd:'45763',	registStart:'45736',	registEnd:'45750',	classCd:'D2',	toCd:'202512394',	pool:'제주실내수영장',	attribute:'전문체육',	masters:'700명이하',	nameGubun:'기타',	events:'213',	},
  {	cid:369,	competitionName:'KB금융 코리아 스위밍 챔피언십(2025 경영 국가대표 선발대회)',	dateStart:'45739',	dateEnd:'45744',	registStart:'45680',	registEnd:'45734',	classCd:'D2',	toCd:'202512133',	pool:'김천실내수영장',	attribute:'전문체육',	masters:'300명이하',	nameGubun:'기타',	events:'34',	},
  {	cid:367,	competitionName:'제15회 김천 전국수영대회(경영)',	dateStart:'45729',	dateEnd:'45733',	registStart:'45707',	registEnd:'45724',	classCd:'D2',	toCd:'202512178',	pool:'김천실내수영장',	attribute:'전문체육',	masters:'1000명이상',	nameGubun:'기타',	events:'213',	},
  {	cid:365,	competitionName:'제9회 광양만배 유소년 전국수영대회',	dateStart:'45632',	dateEnd:'45634',	registStart:'45604',	registEnd:'45618',	classCd:'D2',	toCd:'202412050',	pool:'광양수영장',	attribute:'전문체육',	masters:'700명이하',	nameGubun:'기타',	events:'66',	},
  {	cid:362,	competitionName:'2024 MBC배 수영대회(경영)',	dateStart:'45612',	dateEnd:'45616',	registStart:'45586',	registEnd:'45602',	classCd:'D2',	toCd:'202411904',	pool:'대전',	attribute:'전문체육',	masters:'1000명이상',	nameGubun:'기타',	events:'213',	},
  {	cid:360,	competitionName:'제105회 전국체육대회(경영)',	dateStart:'45577',	dateEnd:'45582',	registStart:'',	registEnd:'',	classCd:'D2',	toCd:'202411742',	pool:'창원실내수영장',	attribute:'전문체육',	masters:'700명이하',	nameGubun:'기타',	events:'99',	},
  {	cid:357,	competitionName:'제73회 회장배 전국수영대회(제105회 전국체육대회 프레대회)(경영)',	dateStart:'45542',	dateEnd:'45546',	registStart:'45518',	registEnd:'45531',	classCd:'D2',	toCd:'202411388',	pool:'창원실내수영장',	attribute:'전문체육',	masters:'700명이하',	nameGubun:'기타',	events:'213',	},
  {	cid:355,	competitionName:'제43회 대통령배 전국수영대회(경영)',	dateStart:'45513',	dateEnd:'45518',	registStart:'45483',	registEnd:'45499',	classCd:'D2',	toCd:'202411128',	pool:'전주',	attribute:'전문체육',	masters:'1000명이상',	nameGubun:'대통령배',	events:'208',	},
  {	cid:353,	competitionName:'2024 교보생명컵 꿈나무 체육대회(수영경기)',	dateStart:'45502',	dateEnd:'45504',	registStart:'45469',	registEnd:'45488',	classCd:'D2',	toCd:'202406484',	pool:'김천',	attribute:'전문체육',	masters:'700명이하',	nameGubun:'기타',	events:'66',	},
  {	cid:351,	competitionName:'제20회 꿈나무 전국수영대회',	dateStart:'45468',	dateEnd:'45470',	registStart:'45443',	registEnd:'45460',	classCd:'D2',	toCd:'202406260',	pool:'김천',	attribute:'전문체육',	masters:'700명이하',	nameGubun:'기타',	events:'72',	},
  {	cid:350,	competitionName:'제3회 광주 전국 수영 선수권대회(경영)',	dateStart:'45455',	dateEnd:'45459',	registStart:'45421',	registEnd:'45443',	classCd:'D2',	toCd:'202406109',	pool:'광주광역시',	attribute:'전문체육',	masters:'1000명이상',	nameGubun:'기타',	events:'208',	},
  {	cid:347,	competitionName:'제53회 전국소년체육대회(경영)',	dateStart:'45437',	dateEnd:'45440',	registStart:'',	registEnd:'',	classCd:'D2',	toCd:'202406162',	pool:'목포',	attribute:'전문체육',	masters:'1000명이상',	nameGubun:'기타',	events:'74',	},
  {	cid:344,	competitionName:'제96회 동아수영대회(경영)',	dateStart:'45421',	dateEnd:'45425',	registStart:'45394',	registEnd:'45411',	classCd:'D2',	toCd:'202403096',	pool:'김천',	attribute:'전문체육',	masters:'1000명이상',	nameGubun:'기타',	events:'208',	},
  {	cid:342,	competitionName:'2024 호주 오픈 선수권 대회',	dateStart:'45399',	dateEnd:'45402',	registStart:'',	registEnd:'',	classCd:'D2',	toCd:'202403156',	pool:'호주, 브리즈번',	attribute:'전문체육',	masters:'미등록',	nameGubun:'미등록',	events:'9',	},
  {	cid:340,	competitionName:'제19회 제주 한라배 전국수영대회(경영)',	dateStart:'45394',	dateEnd:'45398',	registStart:'45366',	registEnd:'45383',	classCd:'D2',	toCd:'202402973',	pool:'제주',	attribute:'전문체육',	masters:'700명이하',	nameGubun:'기타',	events:'208',	},
  {	cid:339,	competitionName:'제38회 전국체육고등학교 체육대회(수영)',	dateStart:'45386',	dateEnd:'45388',	registStart:'',	registEnd:'',	classCd:'D2',	toCd:'202403014',	pool:'울산',	attribute:'전문체육',	masters:'300명이하',	nameGubun:'기타',	events:'40',	},
  {	cid:338,	competitionName:'KB금융 코리아 스위밍 챔피언십(2024 경영 국가대표 선발대회)',	dateStart:'45373',	dateEnd:'45378',	registStart:'45316',	registEnd:'45369',	classCd:'D2',	toCd:'202400082',	pool:'김천',	attribute:'전문체육',	masters:'300명이하',	nameGubun:'기타',	events:'34',	},
  {	cid:336,	competitionName:'제14회 김천 전국수영대회(경영)',	dateStart:'45364',	dateEnd:'45368',	registStart:'45336',	registEnd:'45357',	classCd:'D2',	toCd:'202400121',	pool:'김천',	attribute:'전문체육',	masters:'미등록',	nameGubun:'미등록',	events:'209',	},
  {	cid:334,	competitionName:'2024 Victorian Open LC Championships',	dateStart:'45345',	dateEnd:'45347',	registStart:'',	registEnd:'',	classCd:'D2',	toCd:'202402989',	pool:'호주, 멜버른',	attribute:'전문체육',	masters:'미등록',	nameGubun:'미등록',	events:'8',	},
  {	cid:333,	competitionName:'2023 제4회 지바현 주니어 수영대회',	dateStart:'45270',	dateEnd:'45270',	registStart:'',	registEnd:'',	classCd:'D2',	toCd:'202310924',	pool:'일본,도쿄',	attribute:'전문체육',	masters:'미등록',	nameGubun:'미등록',	events:'38',	},
  {	cid:332,	competitionName:'제19회 꿈나무 전국수영대회',	dateStart:'45269',	dateEnd:'45271',	registStart:'',	registEnd:'',	classCd:'D2',	toCd:'202310842',	pool:'김천',	attribute:'전문체육',	masters:'700명이하',	nameGubun:'기타',	events:'72',	},
  {	cid:331,	competitionName:'2023 재팬 오픈(50m)',	dateStart:'45260',	dateEnd:'45263',	registStart:'',	registEnd:'',	classCd:'D2',	toCd:'202310889',	pool:'일본,도쿄',	attribute:'전문체육',	masters:'미등록',	nameGubun:'미등록',	events:'2',	},
  {	cid:329,	competitionName:'2024년 수영(경영,다이빙,아티스틱스위밍) 국가대표 선발대회',	dateStart:'45253',	dateEnd:'45260',	registStart:'',	registEnd:'',	classCd:'D2',	toCd:'202310643',	pool:'김천',	attribute:'전문체육',	masters:'300명이하',	nameGubun:'기타',	events:'34',	},
  {	cid:328,	competitionName:'2023 MBC배 전국수영대회(경영)',	dateStart:'45227',	dateEnd:'45231',	registStart:'',	registEnd:'',	classCd:'D2',	toCd:'202310383',	pool:'대전',	attribute:'전문체육',	masters:'1000명이상',	nameGubun:'기타',	events:'213',	},
  {	cid:325,	competitionName:'제104회 전국체육대회(경영)',	dateStart:'45211',	dateEnd:'45218',	registStart:'',	registEnd:'',	classCd:'D2',	toCd:'202310191',	pool:'목포 실내수영장',	attribute:'전문체육',	masters:'미등록',	nameGubun:'미등록',	events:'99',	},
  {	cid:323,	competitionName:'제72회 회장배 전국수영대회',	dateStart:'45178',	dateEnd:'45183',	registStart:'',	registEnd:'',	classCd:'D2',	toCd:'202310028',	pool:'목포',	attribute:'전문체육',	masters:'1000명이상',	nameGubun:'기타',	events:'213',	},
  {	cid:321,	competitionName:'제42회 대통령배 전국수영대회(경영)',	dateStart:'45150',	dateEnd:'45155',	registStart:'',	registEnd:'',	classCd:'D2',	toCd:'202309860',	pool:'전주',	attribute:'전문체육',	masters:'1000명이상',	nameGubun:'기타',	events:'213',	},
  {	cid:319,	competitionName:'2023 교보생명컵 꿈나무 체육대회(수영경기)',	dateStart:'45138',	dateEnd:'45140',	registStart:'',	registEnd:'',	classCd:'D2',	toCd:'202309684',	pool:'김천',	attribute:'전문체육',	masters:'700명이하',	nameGubun:'기타',	events:'66',	},
  {	cid:316,	competitionName:'제2회광주전국수영선수권대회',	dateStart:'45087',	dateEnd:'45092',	registStart:'',	registEnd:'',	classCd:'D2',	toCd:'202309493',	pool:'광주',	attribute:'전문체육',	masters:'1000명이상',	nameGubun:'기타',	events:'213',	},
  {	cid:314,	competitionName:'제52회 전국소년체육대회',	dateStart:'45073',	dateEnd:'45076',	registStart:'',	registEnd:'',	classCd:'D2',	toCd:'202309360',	pool:'울산',	attribute:'전문체육',	masters:'700명이하',	nameGubun:'미등록',	events:'74',	},
  {	cid:312,	competitionName:'제95회 동아수영대회(경영)',	dateStart:'45047',	dateEnd:'45051',	registStart:'',	registEnd:'',	classCd:'D2',	toCd:'202309193',	pool:'김천',	attribute:'전문체육',	masters:'700명이하',	nameGubun:'기타',	events:'208',	},
  {	cid:308,	competitionName:'제18회 제주 한라배 전국수영대회',	dateStart:'45030',	dateEnd:'45034',	registStart:'',	registEnd:'',	classCd:'D2',	toCd:'202309098',	pool:'제주',	attribute:'전문체육',	masters:'1000명이상',	nameGubun:'기타',	events:'208',	},
  {	cid:307,	competitionName:'제37회 전국체육고등학교 체육대회(수영)',	dateStart:'45017',	dateEnd:'45018',	registStart:'',	registEnd:'',	classCd:'D2',	toCd:'202309048',	pool:'김천',	attribute:'전문체육',	masters:'미등록',	nameGubun:'미등록',	events:'40',	},
  {	cid:306,	competitionName:'KB금융 코리아 스위밍 챔피언십(2023 경영 국가대표 선발대회)',	dateStart:'45010',	dateEnd:'45015',	registStart:'',	registEnd:'',	classCd:'D2',	toCd:'202308981',	pool:'김천',	attribute:'전문체육',	masters:'300명이하',	nameGubun:'기타',	events:'34',	},
  {	cid:304,	competitionName:'제13회 김천 전국수영대회(경영)',	dateStart:'44996',	dateEnd:'45000',	registStart:'',	registEnd:'',	classCd:'D2',	toCd:'202308910',	pool:'김천',	attribute:'전문체육',	masters:'1000명이상',	nameGubun:'기타',	events:'208',	},
  {	cid:301,	competitionName:'제94회 동아수영대회(경영)',	dateStart:'44911',	dateEnd:'44916',	registStart:'',	registEnd:'',	classCd:'D2',	toCd:'202208720',	pool:'김천',	attribute:'전문체육',	masters:'1000명이상',	nameGubun:'기타',	events:'208',	},
  {	cid:298,	competitionName:'2023년 수영(경영, 다이빙, 아티스틱스위밍) 국가대표 선발대회',	dateStart:'44868',	dateEnd:'44872',	registStart:'',	registEnd:'',	classCd:'D2',	toCd:'202208471',	pool:'김천',	attribute:'전문체육',	masters:'300명이하',	nameGubun:'기타',	events:'34',	},
  {	cid:296,	competitionName:'2022  MBC배 전국수영대회(경영)',	dateStart:'44856',	dateEnd:'44858',	registStart:'44826',	registEnd:'44841',	classCd:'D2',	toCd:'202208331',	pool:'대전',	attribute:'전문체육',	masters:'1000명이상',	nameGubun:'기타',	events:'88',	},
  {	cid:294,	competitionName:'제103회 전국체육대회(경영)',	dateStart:'44842',	dateEnd:'44847',	registStart:'',	registEnd:'',	classCd:'D2',	toCd:'202208283',	pool:'울산',	attribute:'전문체육',	masters:'700명이하',	nameGubun:'기타',	events:'76',	},
  {	cid:291,	competitionName:'제71회 회장배 전국수영대회(경영)',	dateStart:'44821',	dateEnd:'44826',	registStart:'',	registEnd:'',	classCd:'D2',	toCd:'202208143',	pool:'울산',	attribute:'전문체육',	masters:'1000명이상',	nameGubun:'기타',	events:'192',	},
  {	cid:287,	competitionName:'제41회 대통령배 전국수영대회(경영)',	dateStart:'44785',	dateEnd:'44790',	registStart:'',	registEnd:'',	classCd:'D2',	toCd:'202207849',	pool:'전주',	attribute:'전문체육',	masters:'1000명이상',	nameGubun:'기타',	events:'208',	},
  {	cid:285,	competitionName:'2022 교보생명컵 꿈나무 체육대회(수영경기)',	dateStart:'44773',	dateEnd:'44775',	registStart:'',	registEnd:'',	classCd:'D2',	toCd:'202207813',	pool:'김천',	attribute:'전문체육',	masters:'700명이하',	nameGubun:'기타',	events:'66',	},
  {	cid:282,	competitionName:'제1회 광주 전국수영선수권대회(경영)',	dateStart:'44758',	dateEnd:'44766',	registStart:'',	registEnd:'',	classCd:'D2',	toCd:'202207702',	pool:'광주',	attribute:'전문체육',	masters:'1000명이상',	nameGubun:'기타',	events:'208',	},
  {	cid:280,	competitionName:'제51회 전국소년체육대회(경영)',	dateStart:'44709',	dateEnd:'44712',	registStart:'',	registEnd:'',	classCd:'D2',	toCd:'202207413',	pool:'김천',	attribute:'전문체육',	masters:'1000명이상',	nameGubun:'기타',	events:'74',	},
  {	cid:279,	competitionName:'제18회 꿈나무 전국수영대회',	dateStart:'44694',	dateEnd:'44696',	registStart:'',	registEnd:'',	classCd:'D2',	toCd:'202207300',	pool:'김천',	attribute:'전문체육',	masters:'1000명이상',	nameGubun:'기타',	events:'72',	},
  {	cid:278,	competitionName:'제17회 제주 한라배 전국수영대회(경영)',	dateStart:'44663',	dateEnd:'44668',	registStart:'44643',	registEnd:'44652',	classCd:'D2',	toCd:'202207170',	pool:'제주',	attribute:'전문체육',	masters:'1000명이상',	nameGubun:'기타',	events:'208',	},
  {	cid:277,	competitionName:'제36회 문화체육관광부 전국체육고등학교 체육대회 (경영)',	dateStart:'44660',	dateEnd:'44661',	registStart:'',	registEnd:'',	classCd:'D2',	toCd:'202207194',	pool:'제주',	attribute:'전문체육',	masters:'300명이하',	nameGubun:'기타',	events:'40',	},
  {	cid:273,	competitionName:'KB금융그룹 Korea Swimming Championships 2022 (2022 경영, 다이빙 국가대표 선발대회)',	dateStart:'44644',	dateEnd:'44648',	registStart:'',	registEnd:'',	classCd:'D2',	toCd:'202207102',	pool:'김천',	attribute:'전문체육',	masters:'300명이하',	nameGubun:'기타',	events:'34',	},
  {	cid:270,	competitionName:'제12회김천전국수영대회(경영)',	dateStart:'44632',	dateEnd:'44640',	registStart:'44610',	registEnd:'44625',	classCd:'D2',	toCd:'202207051',	pool:'김천',	attribute:'전문체육',	masters:'1000명이상',	nameGubun:'기타',	events:'192',	},
  {	cid:269,	competitionName:'2022 Victorian Age LC Champs. (빅토리아 에이지 LC 선수권)',	dateStart:'44630',	dateEnd:'44634',	registStart:'',	registEnd:'',	classCd:'D2',	toCd:'202207259',	pool:'호주,멜버른',	attribute:'전문체육',	masters:'300명이하',	nameGubun:'미등록',	events:'1',	},
  {	cid:266,	competitionName:'제16회 제주 한라배 전국수영대회(경영)',	dateStart:'44521',	dateEnd:'44526',	registStart:'',	registEnd:'',	classCd:'D2',	toCd:'202106706',	pool:'제주',	attribute:'전문체육',	masters:'700명이하',	nameGubun:'기타',	events:'120',	},
  {	cid:263,	competitionName:'2021 MBC배전국수영대회 겸 제50회전국소년체육대회(경영)',	dateStart:'44502',	dateEnd:'44513',	registStart:'',	registEnd:'',	classCd:'D2',	toCd:'202106577',	pool:'대전',	attribute:'전문체육',	masters:'1000명이상',	nameGubun:'기타',	events:'74',	},
  {	cid:262,	competitionName:'제102회전국체육대회(경영)',	dateStart:'44478',	dateEnd:'44483',	registStart:'',	registEnd:'',	classCd:'D2',	toCd:'202106484',	pool:'김천',	attribute:'전문체육',	masters:'700명이하',	nameGubun:'기타',	events:'38',	},
  {	cid:258,	competitionName:'제40회 대통령배전국수영대회(경영)',	dateStart:'44389',	dateEnd:'44399',	registStart:'',	registEnd:'',	classCd:'D2',	toCd:'202106172',	pool:'전주',	attribute:'전문체육',	masters:'2000명이상',	nameGubun:'대통령배',	events:'120',	},
  {	cid:257,	competitionName:'2021년 경영 국가대표 선발대회',	dateStart:'44329',	dateEnd:'44333',	registStart:'',	registEnd:'',	classCd:'D2',	toCd:'202105957',	pool:'제주',	attribute:'전문체육',	masters:'300명이하',	nameGubun:'기타',	events:'38',	},
  {	cid:256,	competitionName:'제17회 꿈나무 전국수영대회',	dateStart:'44308',	dateEnd:'44312',	registStart:'44286',	registEnd:'44299',	classCd:'D2',	toCd:'202105906',	pool:'김천',	attribute:'전문체육',	masters:'1000명이상',	nameGubun:'기타',	events:'50',	},
  {	cid:253,	competitionName:'제11회 김천 전국수영대회(경영)',	dateStart:'44278',	dateEnd:'44288',	registStart:'44259',	registEnd:'44271',	classCd:'D2',	toCd:'202105824',	pool:'김천',	attribute:'전문체육',	masters:'1000명이상',	nameGubun:'기타',	events:'160',	},
  {	cid:251,	competitionName:'2020 경영 국가대표 선발대회',	dateStart:'44152',	dateEnd:'44155',	registStart:'44074',	registEnd:'44141',	classCd:'D2',	toCd:'202005406',	pool:'김천',	attribute:'전문체육',	masters:'300명이하',	nameGubun:'기타',	events:'28',	},
  {	cid:248,	competitionName:'제16회 꿈나무 전국수영대회',	dateStart:'44131',	dateEnd:'44134',	registStart:'44117',	registEnd:'44125',	classCd:'D2',	toCd:'202005551',	pool:'김천',	attribute:'전문체육',	masters:'700명이하',	nameGubun:'기타',	events:'40',	},
  {	cid:245,	competitionName:'제10회김천전국수영대회(경영)',	dateStart:'44117',	dateEnd:'44124',	registStart:'44096',	registEnd:'44111',	classCd:'D2',	toCd:'202005506',	pool:'김천',	attribute:'전문체육',	masters:'700명이하',	nameGubun:'기타',	events:'120',	},
  {	cid:242,	competitionName:'제15회 꿈나무 전국수영대회(등록)',	dateStart:'43798',	dateEnd:'43800',	registStart:'43760',	registEnd:'43787',	classCd:'D2',	toCd:'201904586',	pool:'김천',	attribute:'전문체육',	masters:'700명이하',	nameGubun:'기타',	events:'72',	},
  {	cid:241,	competitionName:'제15회 꿈나무 전국수영대회(비등록)',	dateStart:'43798',	dateEnd:'43800',	registStart:'',	registEnd:'',	classCd:'D2',	toCd:'201904821',	pool:'김천',	attribute:'생활체육',	masters:'700명이하',	nameGubun:'기타',	events:'62',	},
  {	cid:239,	competitionName:'제100회 전국체육대회(경영)',	dateStart:'43743',	dateEnd:'43747',	registStart:'',	registEnd:'',	classCd:'D2',	toCd:'201904395',	pool:'김천',	attribute:'전문체육',	masters:'700명이하',	nameGubun:'기타',	events:'76',	},
  {	cid:237,	competitionName:'2019 MBC배 전국수영대회(경영)',	dateStart:'43727',	dateEnd:'43731',	registStart:'43691',	registEnd:'43713',	classCd:'D2',	toCd:'201904113',	pool:'김천',	attribute:'전문체육',	masters:'1000명이상',	nameGubun:'기타',	events:'208',	},
  {	cid:234,	competitionName:'제38회 대통령배 전국수영대회(경영)',	dateStart:'43699',	dateEnd:'43703',	registStart:'43663',	registEnd:'43689',	classCd:'D2',	toCd:'201903839',	pool:'전주',	attribute:'전문체육',	masters:'1000명이상',	nameGubun:'대통령배',	events:'192',	},
  {	cid:232,	competitionName:'2019교보생명컵 꿈나무 체육대회',	dateStart:'43645',	dateEnd:'43647',	registStart:'43619',	registEnd:'43633',	classCd:'D2',	toCd:'201903559',	pool:'김천',	attribute:'전문체육',	masters:'700명이하',	nameGubun:'기타',	events:'66',	},
  {	cid:230,	competitionName:'제91회 동아수영대회(경영)',	dateStart:'43621',	dateEnd:'43625',	registStart:'43589',	registEnd:'43608',	classCd:'D2',	toCd:'201903355',	pool:'광주',	attribute:'전문체육',	masters:'1000명이상',	nameGubun:'기타',	events:'208',	},
  {	cid:228,	competitionName:'제48회 전국소년체육대회',	dateStart:'43610',	dateEnd:'43613',	registStart:'',	registEnd:'',	classCd:'D2',	toCd:'201903365',	pool:'전주',	attribute:'전문체육',	masters:'미등록',	nameGubun:'미등록',	events:'74',	},
  {	cid:226,	competitionName:'2019 수영(경영) 국가대표 2차 선발대회',	dateStart:'43603',	dateEnd:'43606',	registStart:'43577',	registEnd:'43592',	classCd:'D2',	toCd:'201903307',	pool:'김천',	attribute:'전문체육',	masters:'700명이하',	nameGubun:'기타',	events:'34',	},
  {	cid:224,	competitionName:'제68회 회장배 전국수영대회(경영)',	dateStart:'43594',	dateEnd:'43598',	registStart:'43564',	registEnd:'43585',	classCd:'D2',	toCd:'201903245',	pool:'김천',	attribute:'전문체육',	masters:'1000명이상',	nameGubun:'기타',	events:'208',	},
  {	cid:222,	competitionName:'제33회 문화체육관광부장관기 전국체육고등학교 체육대회',	dateStart:'43571',	dateEnd:'43572',	registStart:'',	registEnd:'',	classCd:'D2',	toCd:'201903446',	pool:'사직실내수영장',	attribute:'전문체육',	masters:'700명이하',	nameGubun:'기타',	events:'38',	},
  {	cid:221,	competitionName:'제9회김천전국수영대회(경영)',	dateStart:'43565',	dateEnd:'43569',	registStart:'43543',	registEnd:'43557',	classCd:'D2',	toCd:'KG2019',	pool:'김천',	attribute:'전문체육',	masters:'1000명이상',	nameGubun:'기타',	events:'208',	},
  {	cid:216,	competitionName:'제14회 제주한라배전국수영대회(경영)',	dateStart:'43546',	dateEnd:'43550',	registStart:'43518',	registEnd:'43532',	classCd:'D2',	toCd:'JH2019',	pool:'제주',	attribute:'전문체육',	masters:'700명이하',	nameGubun:'기타',	events:'208',	},
  {	cid:214,	competitionName:'2019 수영(경영)국가대표 1차 선발대회',	dateStart:'43525',	dateEnd:'43528',	registStart:'43504',	registEnd:'43518',	classCd:'D2',	toCd:'TI1901',	pool:'김천',	attribute:'전문체육',	masters:'700명이하',	nameGubun:'기타',	events:'34',	},
  {	cid:213,	competitionName:'KOREA MASTERS 2019',	dateStart:'43512',	dateEnd:'43513',	registStart:'',	registEnd:'',	classCd:'D2',	toCd:'KM1901',	pool:'전주',	attribute:'전문체육',	masters:'미등록',	nameGubun:'미등록',	events:'218',	isMasters: true,},
  {	cid:211,	competitionName:'제14회꿈나무전국수영대회(비등록)',	dateStart:'43413',	dateEnd:'43415',	registStart:'',	registEnd:'',	classCd:'D2',	toCd:'GTB018',	pool:'김천',	attribute:'전문체육',	masters:'미등록',	nameGubun:'미등록',	events:'58',	},
  {	cid:210,	competitionName:'제14회꿈나무전국수영대회',	dateStart:'43413',	dateEnd:'43415',	registStart:'43384',	registEnd:'43402',	classCd:'D2',	toCd:'GT2018',	pool:'김천',	attribute:'전문체육',	masters:'700명이하',	nameGubun:'기타',	events:'72',	},
  {	cid:208,	competitionName:'제99회전국체육대회(경영)',	dateStart:'43386',	dateEnd:'43391',	registStart:'',	registEnd:'',	classCd:'D2',	toCd:'D2G099',	pool:'전주',	attribute:'전문체육',	masters:'1000명이상',	nameGubun:'기타',	events:'76',	},
  {	cid:206,	competitionName:'제37회대통령배전국수영대회(경영)',	dateStart:'43321',	dateEnd:'43325',	registStart:'43293',	registEnd:'43307',	classCd:'D2',	toCd:'PR2018',	pool:'광주',	attribute:'전문체육',	masters:'1000명이상',	nameGubun:'대통령배',	events:'192',	},
  {	cid:204,	competitionName:'2018교보생명컵꿈나무체육대회수영경기',	dateStart:'43310',	dateEnd:'43312',	registStart:'43278',	registEnd:'43293',	classCd:'D2',	toCd:'kb2018',	pool:'김천',	attribute:'전문체육',	masters:'700명이하',	nameGubun:'기타',	events:'66',	},
  {	cid:202,	competitionName:'2018MBC배전국수영대회(경영)',	dateStart:'43300',	dateEnd:'43304',	registStart:'43276',	registEnd:'43287',	classCd:'D2',	toCd:'MBC018',	pool:'김천',	attribute:'전문체육',	masters:'1000명이상',	nameGubun:'기타',	events:'208',	},
  {	cid:200,	competitionName:'제8회광양만배유소년전국수영대회(비등록)',	dateStart:'43267',	dateEnd:'43269',	registStart:'',	registEnd:'',	classCd:'D2',	toCd:'ELB018',	pool:'광양',	attribute:'전문체육',	masters:'미등록',	nameGubun:'미등록',	events:'66',	},
  {	cid:199,	competitionName:'제8회광양만배유소년전국수영대회',	dateStart:'43267',	dateEnd:'43269',	registStart:'43243',	registEnd:'43255',	classCd:'D2',	toCd:'EL2018',	pool:'광양',	attribute:'전문체육',	masters:'700명이하',	nameGubun:'기타',	events:'66',	},
  {	cid:197,	competitionName:'제47회전국소년체육대회',	dateStart:'43246',	dateEnd:'43249',	registStart:'',	registEnd:'',	classCd:'D2',	toCd:'D2Y047',	pool:'충북',	attribute:'전문체육',	masters:'1000명이상',	nameGubun:'기타',	events:'74',	},
  {	cid:195,	competitionName:'제90회동아수영대회(경영)',	dateStart:'43222',	dateEnd:'43226',	registStart:'43188',	registEnd:'43202',	classCd:'D2',	toCd:'DA2018',	pool:'광주',	attribute:'전문체육',	masters:'1000명이상',	nameGubun:'기타',	events:'208',	},
  {	cid:192,	competitionName:'2018국제대회수영국가대표선발대회(경영)',	dateStart:'43217',	dateEnd:'43220',	registStart:'43189',	registEnd:'43200',	classCd:'D2',	toCd:'S1801',	pool:'광주',	attribute:'전문체육',	masters:'300명이하',	nameGubun:'기타',	events:'34',	},
  {	cid:191,	competitionName:'제32회문화체육관광부장관기전국체육고등학교체육대회',	dateStart:'43204',	dateEnd:'43205',	registStart:'43204',	registEnd:'43205',	classCd:'D2',	toCd:'AH2018',	pool:'광주',	attribute:'전문체육',	masters:'300명이하',	nameGubun:'기타',	events:'38',	},
  {	cid:189,	competitionName:'제8회김천전국수영대회(경영)',	dateStart:'43181',	dateEnd:'43185',	registStart:'43152',	registEnd:'43167',	classCd:'D2',	toCd:'KG2018',	pool:'김천',	attribute:'전문체육',	masters:'1000명이상',	nameGubun:'미등록',	events:'208',	},
  {	cid:187,	competitionName:'',	dateStart:'',	dateEnd:'',	registStart:'',	registEnd:'',	classCd:'D2',	toCd:'GT2017',	pool:'',	attribute:'',	masters:'미등록',	nameGubun:'미등록',	events:'0',	},
  {	cid:186,	competitionName:'제13회꿈나무전국수영대회(비등록)',	dateStart:'43096',	dateEnd:'43098',	registStart:'',	registEnd:'',	classCd:'D2',	toCd:'GTB017',	pool:'김천',	attribute:'전문체육',	masters:'미등록',	nameGubun:'미등록',	events:'66',	},
  {	cid:185,	competitionName:'',	dateStart:'',	dateEnd:'',	registStart:'',	registEnd:'',	classCd:'D2',	toCd:'EL2017',	pool:'',	attribute:'',	masters:'미등록',	nameGubun:'미등록',	events:'0',	},
  {	cid:184,	competitionName:'제7회광양만배유소년전국수영대회(비등록)',	dateStart:'43050',	dateEnd:'43052',	registStart:'',	registEnd:'',	classCd:'D2',	toCd:'ELB017',	pool:'광양',	attribute:'전문체육',	masters:'미등록',	nameGubun:'미등록',	events:'66',	},
  {	cid:182,	competitionName:'제98회전국체육대회(경영)',	dateStart:'43029',	dateEnd:'43034',	registStart:'',	registEnd:'',	classCd:'D2',	toCd:'D2G098',	pool:'충북',	attribute:'전문체육',	masters:'1000명이상',	nameGubun:'기타',	events:'76',	},
  {	cid:179,	competitionName:'',	dateStart:'',	dateEnd:'',	registStart:'',	registEnd:'',	classCd:'D2',	toCd:'MBC017',	pool:'',	attribute:'',	masters:'미등록',	nameGubun:'미등록',	events:'0',	},
  {	cid:176,	competitionName:'',	dateStart:'',	dateEnd:'',	registStart:'',	registEnd:'',	classCd:'D2',	toCd:'PR2017',	pool:'',	attribute:'',	masters:'미등록',	nameGubun:'미등록',	events:'0',	},
  {	cid:174,	competitionName:'',	dateStart:'',	dateEnd:'',	registStart:'',	registEnd:'',	classCd:'D2',	toCd:'kb2017',	pool:'',	attribute:'',	masters:'미등록',	nameGubun:'미등록',	events:'0',	},
  {	cid:171,	competitionName:'',	dateStart:'',	dateEnd:'',	registStart:'',	registEnd:'',	classCd:'D2',	toCd:'DA2017',	pool:'',	attribute:'',	masters:'미등록',	nameGubun:'미등록',	events:'0',	},
  {	cid:169,	competitionName:'제46회전국소년체육대회',	dateStart:'42882',	dateEnd:'42885',	registStart:'',	registEnd:'',	classCd:'D2',	toCd:'D2Y046',	pool:'충남',	attribute:'전문체육',	masters:'미등록',	nameGubun:'미등록',	events:'74',	},
  {	cid:167,	competitionName:'',	dateStart:'',	dateEnd:'',	registStart:'',	registEnd:'',	classCd:'D2',	toCd:'S1701',	pool:'',	attribute:'',	masters:'미등록',	nameGubun:'미등록',	events:'0',	},
  {	cid:163,	competitionName:'',	dateStart:'',	dateEnd:'',	registStart:'',	registEnd:'',	classCd:'D2',	toCd:'KG2017',	pool:'',	attribute:'',	masters:'미등록',	nameGubun:'미등록',	events:'0',	},
  {	cid:162,	competitionName:'',	dateStart:'',	dateEnd:'',	registStart:'',	registEnd:'',	classCd:'D2',	toCd:'AH2017',	pool:'',	attribute:'',	masters:'미등록',	nameGubun:'미등록',	events:'0',	},
  {	cid:161,	competitionName:'제12회꿈나무전국수영대회(비등록)',	dateStart:'42686',	dateEnd:'42688',	registStart:'',	registEnd:'',	classCd:'D2',	toCd:'GTB016',	pool:'영천',	attribute:'전문체육',	masters:'미등록',	nameGubun:'미등록',	events:'66',	},
  {	cid:160,	competitionName:'',	dateStart:'',	dateEnd:'',	registStart:'',	registEnd:'',	classCd:'D2',	toCd:'GT2016',	pool:'',	attribute:'',	masters:'미등록',	nameGubun:'미등록',	events:'0',	},
  {	cid:157,	competitionName:'제97회전국체육대회(경영)',	dateStart:'42651',	dateEnd:'42656',	registStart:'',	registEnd:'',	classCd:'D2',	toCd:'D2G097',	pool:'충남',	attribute:'전문체육',	masters:'미등록',	nameGubun:'미등록',	events:'76',	},
  {	cid:155,	competitionName:'',	dateStart:'',	dateEnd:'',	registStart:'',	registEnd:'',	classCd:'D2',	toCd:'PR2016',	pool:'',	attribute:'',	masters:'미등록',	nameGubun:'미등록',	events:'0',	},
  {	cid:153,	competitionName:'',	dateStart:'',	dateEnd:'',	registStart:'',	registEnd:'',	classCd:'D2',	toCd:'kb2016',	pool:'',	attribute:'',	masters:'미등록',	nameGubun:'미등록',	events:'0',	},
  {	cid:151,	competitionName:'',	dateStart:'',	dateEnd:'',	registStart:'',	registEnd:'',	classCd:'D2',	toCd:'MBC016',	pool:'',	attribute:'',	masters:'미등록',	nameGubun:'미등록',	events:'0',	},
  {	cid:149,	competitionName:'제6회광양만배유소년전국수영대회(비등록)',	dateStart:'42538',	dateEnd:'42540',	registStart:'',	registEnd:'',	classCd:'D2',	toCd:'ELB016',	pool:'광양',	attribute:'전문체육',	masters:'미등록',	nameGubun:'미등록',	events:'66',	},
  {	cid:148,	competitionName:'',	dateStart:'',	dateEnd:'',	registStart:'',	registEnd:'',	classCd:'D2',	toCd:'EL2016',	pool:'',	attribute:'',	masters:'미등록',	nameGubun:'미등록',	events:'0',	},
  {	cid:146,	competitionName:'제45회전국소년체육대회',	dateStart:'42518',	dateEnd:'42521',	registStart:'',	registEnd:'',	classCd:'D2',	toCd:'D2Y045',	pool:'김천',	attribute:'전문체육',	masters:'미등록',	nameGubun:'미등록',	events:'66',	},
  {	cid:143,	competitionName:'',	dateStart:'',	dateEnd:'',	registStart:'',	registEnd:'',	classCd:'D2',	toCd:'DA2016',	pool:'',	attribute:'',	masters:'미등록',	nameGubun:'미등록',	events:'0',	},
  {	cid:142,	competitionName:'',	dateStart:'',	dateEnd:'',	registStart:'',	registEnd:'',	classCd:'D2',	toCd:'AH2016',	pool:'',	attribute:'',	masters:'미등록',	nameGubun:'미등록',	events:'0',	},
  {	cid:139,	competitionName:'',	dateStart:'',	dateEnd:'',	registStart:'',	registEnd:'',	classCd:'D2',	toCd:'JH2016',	pool:'',	attribute:'',	masters:'미등록',	nameGubun:'미등록',	events:'0',	},
  {	cid:137,	competitionName:'',	dateStart:'',	dateEnd:'',	registStart:'',	registEnd:'',	classCd:'D2',	toCd:'KG2016',	pool:'',	attribute:'',	masters:'미등록',	nameGubun:'미등록',	events:'0',	},
  {	cid:134,	competitionName:'제11회꿈나무전국수영대회(비등록)',	dateStart:'42329',	dateEnd:'42331',	registStart:'',	registEnd:'',	classCd:'D2',	toCd:'GTB015',	pool:'영천',	attribute:'전문체육',	masters:'미등록',	nameGubun:'미등록',	events:'58',	},
  {	cid:133,	competitionName:'',	dateStart:'',	dateEnd:'',	registStart:'',	registEnd:'',	classCd:'D2',	toCd:'GT2015',	pool:'',	attribute:'',	masters:'미등록',	nameGubun:'미등록',	events:'0',	},
  {	cid:131,	competitionName:'제96회전국체육대회(경영)',	dateStart:'42294',	dateEnd:'42299',	registStart:'',	registEnd:'',	classCd:'D2',	toCd:'D2G096',	pool:'김천',	attribute:'전문체육',	masters:'미등록',	nameGubun:'미등록',	events:'76',	},
  {	cid:128,	competitionName:'',	dateStart:'',	dateEnd:'',	registStart:'',	registEnd:'',	classCd:'D2',	toCd:'MBC015',	pool:'',	attribute:'',	masters:'미등록',	nameGubun:'미등록',	events:'0',	},
  {	cid:126,	competitionName:'',	dateStart:'',	dateEnd:'',	registStart:'',	registEnd:'',	classCd:'D2',	toCd:'kb2015',	pool:'',	attribute:'',	masters:'미등록',	nameGubun:'미등록',	events:'0',	},
  {	cid:125,	competitionName:'제16회세계선수권대회',	dateStart:'42218',	dateEnd:'42225',	registStart:'',	registEnd:'',	classCd:'D2',	toCd:'IS1502',	pool:'러시아',	attribute:'전문체육',	masters:'미등록',	nameGubun:'미등록',	events:'17',	},
  {	cid:123,	competitionName:'',	dateStart:'',	dateEnd:'',	registStart:'',	registEnd:'',	classCd:'D2',	toCd:'PR2015',	pool:'',	attribute:'',	masters:'미등록',	nameGubun:'미등록',	events:'0',	},
  {	cid:120,	competitionName:'제44회전국소년체육대회',	dateStart:'42154',	dateEnd:'42157',	registStart:'',	registEnd:'',	classCd:'D2',	toCd:'D2Y044',	pool:'제주',	attribute:'전문체육',	masters:'미등록',	nameGubun:'미등록',	events:'66',	},
  {	cid:117,	competitionName:'',	dateStart:'',	dateEnd:'',	registStart:'',	registEnd:'',	classCd:'D2',	toCd:'PD2015',	pool:'',	attribute:'',	masters:'미등록',	nameGubun:'미등록',	events:'0',	},
  {	cid:116,	competitionName:'',	dateStart:'',	dateEnd:'',	registStart:'',	registEnd:'',	classCd:'D2',	toCd:'AH2015',	pool:'',	attribute:'',	masters:'미등록',	nameGubun:'미등록',	events:'0',	},
  {	cid:113,	competitionName:'',	dateStart:'',	dateEnd:'',	registStart:'',	registEnd:'',	classCd:'D2',	toCd:'DA2015',	pool:'',	attribute:'',	masters:'미등록',	nameGubun:'미등록',	events:'0',	},
  {	cid:109,	competitionName:'',	dateStart:'',	dateEnd:'',	registStart:'',	registEnd:'',	classCd:'D2',	toCd:'JH2015',	pool:'',	attribute:'',	masters:'미등록',	nameGubun:'미등록',	events:'0',	},
  {	cid:106,	competitionName:'',	dateStart:'',	dateEnd:'',	registStart:'',	registEnd:'',	classCd:'D2',	toCd:'KG2015',	pool:'',	attribute:'',	masters:'미등록',	nameGubun:'미등록',	events:'0',	},
  {	cid:104,	competitionName:'',	dateStart:'',	dateEnd:'',	registStart:'',	registEnd:'',	classCd:'D2',	toCd:'GT2014',	pool:'',	attribute:'',	masters:'미등록',	nameGubun:'미등록',	events:'0',	},
  {	cid:103,	competitionName:'',	dateStart:'',	dateEnd:'',	registStart:'',	registEnd:'',	classCd:'D2',	toCd:'EL2014',	pool:'',	attribute:'',	masters:'미등록',	nameGubun:'미등록',	events:'0',	},
  {	cid:100,	competitionName:'제95회전국체육대회(경영)',	dateStart:'41941',	dateEnd:'41946',	registStart:'',	registEnd:'',	classCd:'D2',	toCd:'D2G095',	pool:'제주',	attribute:'전문체육',	masters:'미등록',	nameGubun:'미등록',	events:'76',	},
  {	cid:98,	competitionName:'',	dateStart:'',	dateEnd:'',	registStart:'',	registEnd:'',	classCd:'D2',	toCd:'PR2014',	pool:'',	attribute:'',	masters:'미등록',	nameGubun:'미등록',	events:'0',	},
  {	cid:96,	competitionName:'',	dateStart:'',	dateEnd:'',	registStart:'',	registEnd:'',	classCd:'D2',	toCd:'kb2014',	pool:'',	attribute:'',	masters:'미등록',	nameGubun:'미등록',	events:'0',	},
  {	cid:93,	competitionName:'',	dateStart:'',	dateEnd:'',	registStart:'',	registEnd:'',	classCd:'D2',	toCd:'MBC014',	pool:'',	attribute:'',	masters:'미등록',	nameGubun:'미등록',	events:'0',	},
  {	cid:89,	competitionName:'',	dateStart:'',	dateEnd:'',	registStart:'',	registEnd:'',	classCd:'D2',	toCd:'PD2014',	pool:'',	attribute:'',	masters:'미등록',	nameGubun:'미등록',	events:'0',	},
  {	cid:86,	competitionName:'제43회전국소년체육대회(경영)',	dateStart:'41783',	dateEnd:'41786',	registStart:'',	registEnd:'',	classCd:'D2',	toCd:'D2Y043',	pool:'인천',	attribute:'전문체육',	masters:'미등록',	nameGubun:'미등록',	events:'66',	},
  {	cid:83,	competitionName:'',	dateStart:'',	dateEnd:'',	registStart:'',	registEnd:'',	classCd:'D2',	toCd:'DA2014',	pool:'',	attribute:'',	masters:'미등록',	nameGubun:'미등록',	events:'0',	},
  {	cid:81,	competitionName:'',	dateStart:'',	dateEnd:'',	registStart:'',	registEnd:'',	classCd:'D2',	toCd:'AH2014',	pool:'',	attribute:'',	masters:'미등록',	nameGubun:'미등록',	events:'0',	},
  {	cid:79,	competitionName:'',	dateStart:'',	dateEnd:'',	registStart:'',	registEnd:'',	classCd:'D2',	toCd:'JH2014',	pool:'',	attribute:'',	masters:'미등록',	nameGubun:'미등록',	events:'0',	},
  {	cid:76,	competitionName:'',	dateStart:'',	dateEnd:'',	registStart:'',	registEnd:'',	classCd:'D2',	toCd:'KG2014',	pool:'',	attribute:'',	masters:'미등록',	nameGubun:'미등록',	events:'0',	},
  {	cid:74,	competitionName:'제9회꿈나무전국수영대회',	dateStart:'41615',	dateEnd:'41617',	registStart:'',	registEnd:'',	classCd:'D2',	toCd:'GT2013',	pool:'영천',	attribute:'전문체육',	masters:'미등록',	nameGubun:'미등록',	events:'66',	},
  {	cid:73,	competitionName:'제3회초등학교전국수영대회',	dateStart:'41580',	dateEnd:'41581',	registStart:'',	registEnd:'',	classCd:'D2',	toCd:'EL2013',	pool:'광양',	attribute:'전문체육',	masters:'미등록',	nameGubun:'미등록',	events:'42',	},
  {	cid:71,	competitionName:'제94회전국체육대회(경영)',	dateStart:'41566',	dateEnd:'41571',	registStart:'',	registEnd:'',	classCd:'D2',	toCd:'D2G094',	pool:'인천',	attribute:'전문체육',	masters:'미등록',	nameGubun:'미등록',	events:'98',	},
  {	cid:68,	competitionName:'',	dateStart:'',	dateEnd:'',	registStart:'',	registEnd:'',	classCd:'D2',	toCd:'PD2013',	pool:'',	attribute:'',	masters:'미등록',	nameGubun:'미등록',	events:'0',	},
  {	cid:65,	competitionName:'2013MBC배전국수영대회(경영)',	dateStart:'41508',	dateEnd:'41512',	registStart:'',	registEnd:'',	classCd:'D2',	toCd:'MBC013',	pool:'김천',	attribute:'전문체육',	masters:'미등록',	nameGubun:'미등록',	events:'200',	},
  {	cid:62,	competitionName:'제32회대통령배전국수영대회(경영)',	dateStart:'41488',	dateEnd:'41491',	registStart:'',	registEnd:'',	classCd:'D2',	toCd:'PR2013',	pool:'전주',	attribute:'전문체육',	masters:'미등록',	nameGubun:'미등록',	events:'184',	},
  {	cid:60,	competitionName:'2013교보생명컵꿈나무체육대회수영경기',	dateStart:'41477',	dateEnd:'41478',	registStart:'',	registEnd:'',	classCd:'D2',	toCd:'kb2013',	pool:'김천',	attribute:'전문체육',	masters:'미등록',	nameGubun:'미등록',	events:'66',	},
  {	cid:58,	competitionName:'제42회전국소년체육대회',	dateStart:'41419',	dateEnd:'41422',	registStart:'',	registEnd:'',	classCd:'D2',	toCd:'D2Y042',	pool:'대구',	attribute:'전문체육',	masters:'미등록',	nameGubun:'미등록',	events:'66',	},
  {	cid:54,	competitionName:'제85회동아수영대회(경영)',	dateStart:'41393',	dateEnd:'41398',	registStart:'',	registEnd:'',	classCd:'D2',	toCd:'DA2013',	pool:'광주',	attribute:'전문체육',	masters:'미등록',	nameGubun:'미등록',	events:'208',	},
  {	cid:53,	competitionName:'제27회문화체육관광부전국체육고등학교체육대회',	dateStart:'41382',	dateEnd:'41383',	registStart:'',	registEnd:'',	classCd:'D2',	toCd:'AH2013',	pool:'강원',	attribute:'전문체육',	masters:'미등록',	nameGubun:'미등록',	events:'38',	},
  {	cid:51,	competitionName:'',	dateStart:'',	dateEnd:'',	registStart:'',	registEnd:'',	classCd:'D2',	toCd:'JH2013',	pool:'',	attribute:'',	masters:'미등록',	nameGubun:'미등록',	events:'0',	},
  {	cid:48,	competitionName:'제3회김천전국수영대회(경영)',	dateStart:'41326',	dateEnd:'41330',	registStart:'',	registEnd:'',	classCd:'D2',	toCd:'KG2013',	pool:'김천',	attribute:'전문체육',	masters:'미등록',	nameGubun:'미등록',	events:'200',	},
  {	cid:46,	competitionName:'제8회꿈나무전국수영대회',	dateStart:'41251',	dateEnd:'41253',	registStart:'',	registEnd:'',	classCd:'D2',	toCd:'GT2012',	pool:'영천',	attribute:'전문체육',	masters:'미등록',	nameGubun:'미등록',	events:'66',	},
  {	cid:45,	competitionName:'2012전국학교스포츠클럽수영대회',	dateStart:'41237',	dateEnd:'41238',	registStart:'',	registEnd:'',	classCd:'D2',	toCd:'SC2012',	pool:'오산',	attribute:'전문체육',	masters:'미등록',	nameGubun:'미등록',	events:'90',	},
  {	cid:44,	competitionName:'제2회초등학교전국수영대회',	dateStart:'41203',	dateEnd:'41204',	registStart:'',	registEnd:'',	classCd:'D2',	toCd:'EL2012',	pool:'광양',	attribute:'전문체육',	masters:'미등록',	nameGubun:'미등록',	events:'42',	},
  {	cid:43,	competitionName:'제93회전국체육대회(경영)',	dateStart:'41194',	dateEnd:'41199',	registStart:'',	registEnd:'',	classCd:'D2',	toCd:'D2G093',	pool:'대구',	attribute:'전문체육',	masters:'미등록',	nameGubun:'미등록',	events:'98',	},
  {	cid:42,	competitionName:'제61회회장배겸KBS배전국수영대회',	dateStart:'41166',	dateEnd:'41169',	registStart:'',	registEnd:'',	classCd:'D2',	toCd:'PD2012',	pool:'대구',	attribute:'전문체육',	masters:'미등록',	nameGubun:'미등록',	events:'184',	},
  {	cid:41,	competitionName:'2012MBC배전국수영대회',	dateStart:'41144',	dateEnd:'41148',	registStart:'',	registEnd:'',	classCd:'D2',	toCd:'MBC012',	pool:'김천',	attribute:'전문체육',	masters:'미등록',	nameGubun:'미등록',	events:'200',	},
  {	cid:40,	competitionName:'',	dateStart:'',	dateEnd:'',	registStart:'',	registEnd:'',	classCd:'D2',	toCd:'KG2012',	pool:'',	attribute:'',	masters:'미등록',	nameGubun:'미등록',	events:'0',	},
  {	cid:39,	competitionName:'',	dateStart:'',	dateEnd:'',	registStart:'',	registEnd:'',	classCd:'D2',	toCd:'kb2012',	pool:'',	attribute:'',	masters:'미등록',	nameGubun:'미등록',	events:'0',	},
  {	cid:38,	competitionName:'',	dateStart:'',	dateEnd:'',	registStart:'',	registEnd:'',	classCd:'D2',	toCd:'PR2012',	pool:'',	attribute:'',	masters:'미등록',	nameGubun:'미등록',	events:'0',	},
  {	cid:37,	competitionName:'제41회전국소년체육대회',	dateStart:'41055',	dateEnd:'41058',	registStart:'',	registEnd:'',	classCd:'D2',	toCd:'D2Y041',	pool:'고양',	attribute:'전문체육',	masters:'미등록',	nameGubun:'미등록',	events:'66',	},
  {	cid:36,	competitionName:'',	dateStart:'',	dateEnd:'',	registStart:'',	registEnd:'',	classCd:'D2',	toCd:'AH2012',	pool:'',	attribute:'',	masters:'미등록',	nameGubun:'미등록',	events:'0',	},
  {	cid:33,	competitionName:'',	dateStart:'',	dateEnd:'',	registStart:'',	registEnd:'',	classCd:'D2',	toCd:'DA2012',	pool:'',	attribute:'',	masters:'미등록',	nameGubun:'미등록',	events:'0',	},
  {	cid:32,	competitionName:'',	dateStart:'',	dateEnd:'',	registStart:'',	registEnd:'',	classCd:'D2',	toCd:'JH2012',	pool:'',	attribute:'',	masters:'미등록',	nameGubun:'미등록',	events:'0',	},
  {	cid:31,	competitionName:'',	dateStart:'',	dateEnd:'',	registStart:'',	registEnd:'',	classCd:'D2',	toCd:'GT2011',	pool:'',	attribute:'',	masters:'미등록',	nameGubun:'미등록',	events:'0',	},
  {	cid:30,	competitionName:'',	dateStart:'',	dateEnd:'',	registStart:'',	registEnd:'',	classCd:'D2',	toCd:'EL2011',	pool:'',	attribute:'',	masters:'미등록',	nameGubun:'미등록',	events:'0',	},
  {	cid:29,	competitionName:'제92회전국체육대회(경영)',	dateStart:'40823',	dateEnd:'40828',	registStart:'',	registEnd:'',	classCd:'D2',	toCd:'D2G092',	pool:'고양',	attribute:'전문체육',	masters:'미등록',	nameGubun:'미등록',	events:'98',	},
  {	cid:28,	competitionName:'',	dateStart:'',	dateEnd:'',	registStart:'',	registEnd:'',	classCd:'D2',	toCd:'PD2011',	pool:'',	attribute:'',	masters:'미등록',	nameGubun:'미등록',	events:'0',	},
  {	cid:27,	competitionName:'',	dateStart:'',	dateEnd:'',	registStart:'',	registEnd:'',	classCd:'D2',	toCd:'MBC011',	pool:'',	attribute:'',	masters:'미등록',	nameGubun:'미등록',	events:'0',	},
  {	cid:26,	competitionName:'',	dateStart:'',	dateEnd:'',	registStart:'',	registEnd:'',	classCd:'D2',	toCd:'kb2011',	pool:'',	attribute:'',	masters:'미등록',	nameGubun:'미등록',	events:'0',	},
  {	cid:25,	competitionName:'',	dateStart:'',	dateEnd:'',	registStart:'',	registEnd:'',	classCd:'D2',	toCd:'PR2011',	pool:'',	attribute:'',	masters:'미등록',	nameGubun:'미등록',	events:'0',	},
  {	cid:24,	competitionName:'',	dateStart:'',	dateEnd:'',	registStart:'',	registEnd:'',	classCd:'D2',	toCd:'KG2011',	pool:'',	attribute:'',	masters:'미등록',	nameGubun:'미등록',	events:'0',	},
  {	cid:23,	competitionName:'제40회 전국소년체육대회',	dateStart:'40691',	dateEnd:'40694',	registStart:'',	registEnd:'',	classCd:'D2',	toCd:'D2Y040',	pool:'창원',	attribute:'전문체육',	masters:'미등록',	nameGubun:'미등록',	events:'66',	},
  {	cid:22,	competitionName:'제25회문화체육관광부전국체육고등학교체육대회',	dateStart:'40669',	dateEnd:'40670',	registStart:'',	registEnd:'',	classCd:'D2',	toCd:'AH2011',	pool:'목포',	attribute:'전문체육',	masters:'미등록',	nameGubun:'미등록',	events:'38',	},
  {	cid:21,	competitionName:'제83회동아수영대회(번외)',	dateStart:'40655',	dateEnd:'40659',	registStart:'',	registEnd:'',	classCd:'D2',	toCd:'DA0011',	pool:'울산',	attribute:'전문체육',	masters:'미등록',	nameGubun:'미등록',	events:'6',	},
  {	cid:20,	competitionName:'',	dateStart:'',	dateEnd:'',	registStart:'',	registEnd:'',	classCd:'D2',	toCd:'DA2011',	pool:'',	attribute:'',	masters:'미등록',	nameGubun:'미등록',	events:'0',	},
  {	cid:19,	competitionName:'',	dateStart:'',	dateEnd:'',	registStart:'',	registEnd:'',	classCd:'D2',	toCd:'JH2011',	pool:'',	attribute:'',	masters:'미등록',	nameGubun:'미등록',	events:'0',	},
  {	cid:18,	competitionName:'',	dateStart:'',	dateEnd:'',	registStart:'',	registEnd:'',	classCd:'D2',	toCd:'GT2010',	pool:'',	attribute:'',	masters:'미등록',	nameGubun:'미등록',	events:'0',	},
  {	cid:17,	competitionName:'제91회전국체육대회(경영)',	dateStart:'40458',	dateEnd:'40463',	registStart:'',	registEnd:'',	classCd:'D2',	toCd:'D2G091',	pool:'창원',	attribute:'전문체육',	masters:'미등록',	nameGubun:'미등록',	events:'78',	},
  {	cid:16,	competitionName:'',	dateStart:'',	dateEnd:'',	registStart:'',	registEnd:'',	classCd:'D2',	toCd:'PD2010',	pool:'',	attribute:'',	masters:'미등록',	nameGubun:'미등록',	events:'0',	},
  {	cid:15,	competitionName:'',	dateStart:'',	dateEnd:'',	registStart:'',	registEnd:'',	classCd:'D2',	toCd:'PR2010',	pool:'',	attribute:'',	masters:'미등록',	nameGubun:'미등록',	events:'0',	},
  {	cid:14,	competitionName:'제39회 전국소년체육대회',	dateStart:'40401',	dateEnd:'40404',	registStart:'',	registEnd:'',	classCd:'D2',	toCd:'D2Y039',	pool:'대전',	attribute:'전문체육',	masters:'미등록',	nameGubun:'미등록',	events:'66',	},
  {	cid:13,	competitionName:'',	dateStart:'',	dateEnd:'',	registStart:'',	registEnd:'',	classCd:'D2',	toCd:'kb2010',	pool:'',	attribute:'',	masters:'미등록',	nameGubun:'미등록',	events:'0',	},
  {	cid:12,	competitionName:'',	dateStart:'',	dateEnd:'',	registStart:'',	registEnd:'',	classCd:'D2',	toCd:'MBC010',	pool:'',	attribute:'',	masters:'미등록',	nameGubun:'미등록',	events:'0',	},
  {	cid:11,	competitionName:'',	dateStart:'',	dateEnd:'',	registStart:'',	registEnd:'',	classCd:'D2',	toCd:'DA2010',	pool:'',	attribute:'',	masters:'미등록',	nameGubun:'미등록',	events:'0',	},
  {	cid:10,	competitionName:'',	dateStart:'',	dateEnd:'',	registStart:'',	registEnd:'',	classCd:'D2',	toCd:'JH2010',	pool:'',	attribute:'',	masters:'미등록',	nameGubun:'미등록',	events:'0',	},
  {	cid:9,	competitionName:'제90회전국체육대회(경영)',	dateStart:'40107',	dateEnd:'40112',	registStart:'',	registEnd:'',	classCd:'D2',	toCd:'D2G090',	pool:'용운국제수영장',	attribute:'전문체육',	masters:'미등록',	nameGubun:'미등록',	events:'78',	},
  {	cid:8,	competitionName:'',	dateStart:'',	dateEnd:'',	registStart:'',	registEnd:'',	classCd:'D2',	toCd:'MBC09',	pool:'',	attribute:'',	masters:'미등록',	nameGubun:'미등록',	events:'0',	},
  {	cid:7,	competitionName:'',	dateStart:'',	dateEnd:'',	registStart:'',	registEnd:'',	classCd:'D2',	toCd:'kb2009',	pool:'',	attribute:'',	masters:'미등록',	nameGubun:'미등록',	events:'0',	},
  {	cid:6,	competitionName:'제38회 전국소년체육대회',	dateStart:'39962',	dateEnd:'39965',	registStart:'',	registEnd:'',	classCd:'D2',	toCd:'D2Y038',	pool:'목포',	attribute:'전문체육',	masters:'미등록',	nameGubun:'미등록',	events:'66',	},
  {	cid:5,	competitionName:'제89회 전국체육대회(경영)',	dateStart:'39731',	dateEnd:'39737',	registStart:'',	registEnd:'',	classCd:'D2',	toCd:'D2G089',	pool:'목포실내수영장',	attribute:'전문체육',	masters:'미등록',	nameGubun:'미등록',	events:'78',	},
  {	cid:4,	competitionName:'제37회 전국소년체육대회',	dateStart:'39599',	dateEnd:'39602',	registStart:'',	registEnd:'',	classCd:'D2',	toCd:'D2Y037',	pool:'광주',	attribute:'전문체육',	masters:'미등록',	nameGubun:'미등록',	events:'67',	},
  {	cid:2,	competitionName:'제88회 전국체육대회(경영)',	dateStart:'39363',	dateEnd:'39369',	registStart:'',	registEnd:'',	classCd:'D2',	toCd:'D2G088',	pool:'염주수영장',	attribute:'전문체육',	masters:'미등록',	nameGubun:'미등록',	events:'66',	},
  {	cid:370,	competitionName:'제20회 제주 한라배 전국수영대회(다이빙)',	dateStart:'45759',	dateEnd:'45763',	registStart:'45736',	registEnd:'45750',	classCd:'E2',	toCd:'202512395',	pool:'제주실내수영장',	attribute:'전문체육',	masters:'미등록',	nameGubun:'미등록',	events:'60',	},
  {	cid:366,	competitionName:'제15회 김천 전국수영대회(다이빙, 수구)',	dateStart:'45729',	dateEnd:'45723',	registStart:'45707',	registEnd:'45724',	classCd:'E2',	toCd:'202512225',	pool:'김천실내수영장',	attribute:'전문체육',	masters:'700명이하',	nameGubun:'기타',	events:'64',	},
  {	cid:364,	competitionName:'2025 수영(다이빙) 국가대표 선발대회',	dateStart:'45630',	dateEnd:'45632',	registStart:'45600',	registEnd:'45617',	classCd:'E2',	toCd:'202412023',	pool:'김천실내수영장',	attribute:'전문체육',	masters:'300명이하',	nameGubun:'기타',	events:'6',	},
  {	cid:363,	competitionName:'2024 MBC배 전국수영대회(다이빙, 수구)',	dateStart:'45614',	dateEnd:'45616',	registStart:'45586',	registEnd:'45602',	classCd:'E2',	toCd:'202411905',	pool:'대전',	attribute:'전문체육',	masters:'300명이하',	nameGubun:'기타',	events:'56',	},
  {	cid:358,	competitionName:'제73회 회장배 전국수영대회(제105회 전국체육대회 프레대회)(다이빙, 수구)',	dateStart:'45542',	dateEnd:'45546',	registStart:'45518',	registEnd:'45531',	classCd:'E2',	toCd:'202411391',	pool:'창원실내수영장',	attribute:'전문체육',	masters:'300명이하',	nameGubun:'기타',	events:'56',	},
  {	cid:356,	competitionName:'제43회 대통령배 전국수영대회(다이빙, 수구)',	dateStart:'45513',	dateEnd:'45518',	registStart:'45483',	registEnd:'45499',	classCd:'E2',	toCd:'202411129',	pool:'전주',	attribute:'전문체육',	masters:'700명이하',	nameGubun:'대통령배',	events:'56',	},
  {	cid:352,	competitionName:'제12회 회장배 전국 종별 수구 선수권대회',	dateStart:'45490',	dateEnd:'45494',	registStart:'45471',	registEnd:'45481',	classCd:'E2',	toCd:'202406492',	pool:'김천',	attribute:'전문체육',	masters:'300명이하',	nameGubun:'기타',	events:'2',	},
  {	cid:349,	competitionName:'제3회 광주 전국 수영선수권대회(다이빙, 수구)',	dateStart:'45455',	dateEnd:'45459',	registStart:'45421',	registEnd:'45443',	classCd:'E2',	toCd:'202406111',	pool:'광주광역시',	attribute:'전문체육',	masters:'1000명이상',	nameGubun:'기타',	events:'54',	},
  {	cid:346,	competitionName:'제53회 전국소년체육대회(다이빙)',	dateStart:'45437',	dateEnd:'45439',	registStart:'',	registEnd:'',	classCd:'E2',	toCd:'202406230',	pool:'목포',	attribute:'전문체육',	masters:'300명이하',	nameGubun:'기타',	events:'16',	},
  {	cid:343,	competitionName:'제96회 동아수영대회(다이빙,수구)',	dateStart:'45421',	dateEnd:'45425',	registStart:'45394',	registEnd:'45411',	classCd:'E2',	toCd:'202403097',	pool:'김천',	attribute:'전문체육',	masters:'300명이하',	nameGubun:'기타',	events:'54',	},
  {	cid:341,	competitionName:'제19회 제주 한라배 전국수영대회(다이빙)',	dateStart:'45394',	dateEnd:'45398',	registStart:'45366',	registEnd:'45383',	classCd:'E2',	toCd:'202402974',	pool:'제주',	attribute:'전문체육',	masters:'700명이하',	nameGubun:'기타',	events:'54',	},
  {	cid:335,	competitionName:'제14회 김천 전국수영대회(다이빙, 수구)',	dateStart:'45364',	dateEnd:'45368',	registStart:'45336',	registEnd:'45357',	classCd:'E2',	toCd:'202400122',	pool:'김천',	attribute:'전문체육',	masters:'700명이하',	nameGubun:'기타',	events:'54',	},
  {	cid:330,	competitionName:'2024년 수영(경영,다이빙,아티스틱스위밍) 국가대표 선발대회(다이빙)',	dateStart:'45255',	dateEnd:'45257',	registStart:'',	registEnd:'',	classCd:'E2',	toCd:'202310709',	pool:'목포',	attribute:'전문체육',	masters:'미등록',	nameGubun:'미등록',	events:'6',	},
  {	cid:327,	competitionName:'2023 MBC배 전국수영대회(다이빙, 수구)',	dateStart:'45227',	dateEnd:'45231',	registStart:'',	registEnd:'',	classCd:'E2',	toCd:'202310514',	pool:'대전',	attribute:'전문체육',	masters:'미등록',	nameGubun:'미등록',	events:'23',	},
  {	cid:326,	competitionName:'제104회 전국체육대회(다이빙,수구)',	dateStart:'45211',	dateEnd:'45218',	registStart:'',	registEnd:'',	classCd:'E2',	toCd:'202310193',	pool:'목포',	attribute:'전문체육',	masters:'미등록',	nameGubun:'미등록',	events:'22',	},
  {	cid:324,	competitionName:'제72회회장배전국수영대회(다이빙,수구)',	dateStart:'45178',	dateEnd:'45183',	registStart:'',	registEnd:'',	classCd:'E2',	toCd:'202310074',	pool:'목포',	attribute:'전문체육',	masters:'미등록',	nameGubun:'미등록',	events:'54',	},
  {	cid:320,	competitionName:'제42회 대통령배 전국수영대회(다이빙,수구)',	dateStart:'45150',	dateEnd:'45153',	registStart:'',	registEnd:'',	classCd:'E2',	toCd:'202309926',	pool:'전주',	attribute:'전문체육',	masters:'미등록',	nameGubun:'미등록',	events:'54',	},
  {	cid:317,	competitionName:'제2회광주전국수영선수권대회(다이빙,수구)',	dateStart:'45087',	dateEnd:'45092',	registStart:'',	registEnd:'',	classCd:'E2',	toCd:'202309541',	pool:'광주',	attribute:'전문체육',	masters:'미등록',	nameGubun:'미등록',	events:'54',	},
  {	cid:315,	competitionName:'제52회 전국소년체육대회(다이빙)',	dateStart:'45073',	dateEnd:'45076',	registStart:'',	registEnd:'',	classCd:'E2',	toCd:'202309473',	pool:'울산',	attribute:'전문체육',	masters:'300명이하',	nameGubun:'기타',	events:'16',	},
  {	cid:313,	competitionName:'2023 AQUA 다이빙 월드컵 2차',	dateStart:'45051',	dateEnd:'45053',	registStart:'',	registEnd:'',	classCd:'E2',	toCd:'202309268',	pool:'캐나다, 몬트리울',	attribute:'전문체육',	masters:'미등록',	nameGubun:'미등록',	events:'2',	},
  {	cid:311,	competitionName:'제95회 동아수영대회(다이빙,수구)',	dateStart:'45047',	dateEnd:'45051',	registStart:'',	registEnd:'',	classCd:'E2',	toCd:'202309217',	pool:'김천',	attribute:'전문체육',	masters:'미등록',	nameGubun:'미등록',	events:'54',	},
  {	cid:309,	competitionName:'제18회 제주 한라배 전국수영대회(다이빙,수구)',	dateStart:'45030',	dateEnd:'45033',	registStart:'',	registEnd:'',	classCd:'E2',	toCd:'202309130',	pool:'제주',	attribute:'전문체육',	masters:'300명이하',	nameGubun:'기타',	events:'54',	},
  {	cid:305,	competitionName:'제13회 김천 전국수영대회(다이빙,수구)',	dateStart:'44996',	dateEnd:'45002',	registStart:'',	registEnd:'',	classCd:'E2',	toCd:'202308945',	pool:'김천',	attribute:'전문체육',	masters:'300명이하',	nameGubun:'기타',	events:'54',	},
  {	cid:302,	competitionName:'제94회 동아수영대회(다이빙,수구)',	dateStart:'44912',	dateEnd:'44913',	registStart:'',	registEnd:'',	classCd:'E2',	toCd:'202208784',	pool:'김천',	attribute:'전문체육',	masters:'미등록',	nameGubun:'미등록',	events:'24',	},
  {	cid:299,	competitionName:'2023년 수영(경영, 다이빙, 아티스틱스위밍) 국가대표 선발대회 (다이빙)',	dateStart:'44868',	dateEnd:'44870',	registStart:'',	registEnd:'',	classCd:'E2',	toCd:'202208523',	pool:'김천',	attribute:'전문체육',	masters:'300명이하',	nameGubun:'기타',	events:'6',	},
  {	cid:297,	competitionName:'2022 MBC배 전국수영대회(다이빙)',	dateStart:'44857',	dateEnd:'44857',	registStart:'',	registEnd:'',	classCd:'E2',	toCd:'202208542',	pool:'대전',	attribute:'전문체육',	masters:'300명이하',	nameGubun:'기타',	events:'18',	},
  {	cid:293,	competitionName:'제103회 전국체육대회(다이빙,수구)',	dateStart:'44842',	dateEnd:'44847',	registStart:'',	registEnd:'',	classCd:'E2',	toCd:'202208296',	pool:'울산',	attribute:'전문체육',	masters:'300명이하',	nameGubun:'기타',	events:'22',	},
  {	cid:290,	competitionName:'제71회 회장배 전국수영대회(다이빙,수구)',	dateStart:'44821',	dateEnd:'44826',	registStart:'',	registEnd:'',	classCd:'E2',	toCd:'202208232',	pool:'울산',	attribute:'전문체육',	masters:'300명이하',	nameGubun:'미등록',	events:'47',	},
  {	cid:289,	competitionName:'제41회 대통령배 전국수영대회(다이빙,수구)',	dateStart:'44786',	dateEnd:'44790',	registStart:'',	registEnd:'',	classCd:'E2',	toCd:'202208013',	pool:'전주',	attribute:'전문체육',	masters:'미등록',	nameGubun:'미등록',	events:'54',	},
  {	cid:284,	competitionName:'제1회 광주 전국수영선수권대회(다이빙,수구)',	dateStart:'44758',	dateEnd:'44764',	registStart:'',	registEnd:'',	classCd:'E2',	toCd:'202207781',	pool:'광주',	attribute:'전문체육',	masters:'미등록',	nameGubun:'미등록',	events:'54',	},
  {	cid:281,	competitionName:'제51회 전국소년체육대회(다이빙)',	dateStart:'44709',	dateEnd:'44711',	registStart:'',	registEnd:'',	classCd:'E2',	toCd:'202207520',	pool:'김천',	attribute:'전문체육',	masters:'300명이하',	nameGubun:'기타',	events:'16',	},
  {	cid:276,	competitionName:'제17회 제주 한라배 전국수영대회(다이빙,수구)',	dateStart:'44660',	dateEnd:'44668',	registStart:'',	registEnd:'',	classCd:'E2',	toCd:'202207216',	pool:'제주',	attribute:'전문체육',	masters:'300명이하',	nameGubun:'기타',	events:'54',	},
  {	cid:274,	competitionName:'KB금융그룹 Korea Swimming Championships 2022 (2022 경영, 다이빙 국가대표 선발대회)(다이빙)',	dateStart:'44644',	dateEnd:'44648',	registStart:'',	registEnd:'',	classCd:'E2',	toCd:'202207247',	pool:'김천',	attribute:'전문체육',	masters:'미등록',	nameGubun:'미등록',	events:'6',	},
  {	cid:271,	competitionName:'제12회김천전국수영대회(다이빙,수구)',	dateStart:'44632',	dateEnd:'44640',	registStart:'',	registEnd:'',	classCd:'E2',	toCd:'202207087',	pool:'김천',	attribute:'전문체육',	masters:'300명이하',	nameGubun:'기타',	events:'48',	},
  {	cid:267,	competitionName:'제16회 제주 한라배 전국수영대회(다이빙,수구)',	dateStart:'44521',	dateEnd:'44526',	registStart:'',	registEnd:'',	classCd:'E2',	toCd:'202106707',	pool:'제주',	attribute:'전문체육',	masters:'미등록',	nameGubun:'미등록',	events:'32',	},
  {	cid:264,	competitionName:'2021 MBC배전국수영대회 겸 제50회전국소년체육대회(다이빙)',	dateStart:'44503',	dateEnd:'44506',	registStart:'',	registEnd:'',	classCd:'E2',	toCd:'202106657',	pool:'대전',	attribute:'전문체육',	masters:'300명이하',	nameGubun:'기타',	events:'22',	},
  {	cid:261,	competitionName:'제102회전국체육대회(다이빙,수구)',	dateStart:'44478',	dateEnd:'44483',	registStart:'',	registEnd:'',	classCd:'E2',	toCd:'202106486',	pool:'김천',	attribute:'전문체육',	masters:'300명이하',	nameGubun:'기타',	events:'11',	},
  {	cid:260,	competitionName:'제40회 대통령배전국수영대회(다이빙,수구)',	dateStart:'44396',	dateEnd:'44399',	registStart:'',	registEnd:'',	classCd:'E2',	toCd:'202106226',	pool:'전주',	attribute:'전문체육',	masters:'300명이하',	nameGubun:'대통령배',	events:'32',	},
  {	cid:254,	competitionName:'제11회 김천 전국수영대회(다이빙,수구)',	dateStart:'44278',	dateEnd:'44281',	registStart:'',	registEnd:'',	classCd:'E2',	toCd:'202105825',	pool:'김천',	attribute:'전문체육',	masters:'700명이하',	nameGubun:'기타',	events:'54',	},
  {	cid:252,	competitionName:'수구 국가대표, 국가대표 후보선수 평가대회 겸 종별 수구 선수권대회',	dateStart:'44156',	dateEnd:'44159',	registStart:'44074',	registEnd:'44148',	classCd:'E2',	toCd:'202005408',	pool:'김천',	attribute:'전문체육',	masters:'300명이하',	nameGubun:'기타',	events:'2',	},
  {	cid:250,	competitionName:'2021 다이빙 국가대표 선발대회',	dateStart:'44148',	dateEnd:'44150',	registStart:'44074',	registEnd:'44134',	classCd:'E2',	toCd:'202005407',	pool:'인천',	attribute:'전문체육',	masters:'300명이하',	nameGubun:'기타',	events:'4',	},
  {	cid:246,	competitionName:'제10회김천전국수영대회(다이빙,수구)',	dateStart:'44117',	dateEnd:'44124',	registStart:'44096',	registEnd:'44111',	classCd:'E2',	toCd:'202005507',	pool:'김천',	attribute:'전문체육',	masters:'300명이하',	nameGubun:'기타',	events:'32',	},
  {	cid:243,	competitionName:'2020년 다이빙 국가대표 선발대회',	dateStart:'43827',	dateEnd:'43828',	registStart:'43756',	registEnd:'43815',	classCd:'E2',	toCd:'201904556',	pool:'인천',	attribute:'전문체육',	masters:'300명이하',	nameGubun:'기타',	events:'4',	},
  {	cid:240,	competitionName:'제100회 전국체육대회(다이빙,수구)',	dateStart:'43743',	dateEnd:'43747',	registStart:'',	registEnd:'',	classCd:'E2',	toCd:'201904393',	pool:'김천',	attribute:'전문체육',	masters:'700명이하',	nameGubun:'기타',	events:'22',	},
  {	cid:236,	competitionName:'2019 MBC배 전국수영대회(다이빙,수구)',	dateStart:'43726',	dateEnd:'43729',	registStart:'43691',	registEnd:'43713',	classCd:'E2',	toCd:'201904114',	pool:'김천',	attribute:'전문체육',	masters:'700명이하',	nameGubun:'기타',	events:'54',	},
  {	cid:233,	competitionName:'제38회 대통령배 전국수영대회(다이빙,수구)',	dateStart:'43698',	dateEnd:'43702',	registStart:'43663',	registEnd:'43689',	classCd:'E2',	toCd:'201903840',	pool:'전주',	attribute:'전문체육',	masters:'300명이하',	nameGubun:'대통령배',	events:'50',	},
  {	cid:229,	competitionName:'제91회 동아수영대회(다이빙,수구)',	dateStart:'43620',	dateEnd:'43624',	registStart:'43589',	registEnd:'43608',	classCd:'E2',	toCd:'201903356',	pool:'광주',	attribute:'전문체육',	masters:'1000명이상',	nameGubun:'기타',	events:'56',	},
  {	cid:227,	competitionName:'제48회 전국소년체육대회(다이빙)',	dateStart:'43609',	dateEnd:'43611',	registStart:'',	registEnd:'',	classCd:'E2',	toCd:'201903576',	pool:'전주',	attribute:'전문체육',	masters:'700명이하',	nameGubun:'기타',	events:'16',	},
  {	cid:223,	competitionName:'제68회 회장배 전국수영대회(다이빙,수구)',	dateStart:'43593',	dateEnd:'43596',	registStart:'43564',	registEnd:'43585',	classCd:'E2',	toCd:'201903246',	pool:'김천',	attribute:'전문체육',	masters:'300명이하',	nameGubun:'기타',	events:'56',	},
  {	cid:219,	competitionName:'제9회김천전국수영대회(다이빙,수구)',	dateStart:'43564',	dateEnd:'43567',	registStart:'43543',	registEnd:'43557',	classCd:'E2',	toCd:'KGD019',	pool:'김천',	attribute:'전문체육',	masters:'1000명이상',	nameGubun:'기타',	events:'56',	},
  {	cid:218,	competitionName:'2019다이빙국가대표2차선발대회',	dateStart:'43560',	dateEnd:'43562',	registStart:'43537',	registEnd:'43551',	classCd:'E2',	toCd:'D1901',	pool:'김천',	attribute:'전문체육',	masters:'300명이하',	nameGubun:'기타',	events:'6',	},
  {	cid:215,	competitionName:'제14회제주한라배전국수영대회(다이빙,수구)',	dateStart:'43545',	dateEnd:'43549',	registStart:'43518',	registEnd:'43532',	classCd:'E2',	toCd:'JHD019',	pool:'제주',	attribute:'전문체육',	masters:'700명이하',	nameGubun:'기타',	events:'54',	},
  {	cid:212,	competitionName:'2019다이빙국가대표선발대회',	dateStart:'43483',	dateEnd:'43485',	registStart:'43441',	registEnd:'43462',	classCd:'E2',	toCd:'D1803',	pool:'김천',	attribute:'전문체육',	masters:'300명이하',	nameGubun:'기타',	events:'6',	},
  {	cid:209,	competitionName:'제99회전국체육대회(다이빙,수구)',	dateStart:'43386',	dateEnd:'43391',	registStart:'',	registEnd:'',	classCd:'E2',	toCd:'E2G099',	pool:'전주',	attribute:'전문체육',	masters:'300명이하',	nameGubun:'기타',	events:'22',	},
  {	cid:205,	competitionName:'제37회대통령배전국수영대회(다이빙,수구)',	dateStart:'43320',	dateEnd:'43324',	registStart:'43293',	registEnd:'43307',	classCd:'E2',	toCd:'PRD018',	pool:'광주',	attribute:'전문체육',	masters:'300명이하',	nameGubun:'대통령배',	events:'49',	},
  {	cid:201,	competitionName:'2018MBC배전국수영대회(다이빙,수구)',	dateStart:'43299',	dateEnd:'43303',	registStart:'43276',	registEnd:'43287',	classCd:'E2',	toCd:'MBCD18',	pool:'김천',	attribute:'전문체육',	masters:'300명이하',	nameGubun:'기타',	events:'54',	},
  {	cid:198,	competitionName:'제47회전국소년체육대회(다이빙)',	dateStart:'43246',	dateEnd:'43247',	registStart:'',	registEnd:'',	classCd:'E2',	toCd:'E2Y047',	pool:'충북',	attribute:'전문체육',	masters:'300명이하',	nameGubun:'기타',	events:'16',	},
  {	cid:196,	competitionName:'제90회동아수영대회(다이빙,수구)',	dateStart:'43222',	dateEnd:'43226',	registStart:'43188',	registEnd:'43202',	classCd:'E2',	toCd:'DAD018',	pool:'광주',	attribute:'전문체육',	masters:'300명이하',	nameGubun:'기타',	events:'54',	},
  {	cid:193,	competitionName:'2018국제대회수영국가대표선발대회(다이빙)',	dateStart:'43217',	dateEnd:'43218',	registStart:'43189',	registEnd:'43200',	classCd:'E2',	toCd:'D1801',	pool:'광주',	attribute:'전문체육',	masters:'300명이하',	nameGubun:'기타',	events:'4',	},
  {	cid:188,	competitionName:'제8회김천전국수영대회(다이빙,수구)',	dateStart:'43180',	dateEnd:'43184',	registStart:'43152',	registEnd:'43167',	classCd:'E2',	toCd:'KGD018',	pool:'김천',	attribute:'전문체육',	masters:'300명이하',	nameGubun:'미등록',	events:'54',	},
  {	cid:181,	competitionName:'제98회전국체육대회(다이빙,수구)',	dateStart:'43029',	dateEnd:'43031',	registStart:'',	registEnd:'',	classCd:'E2',	toCd:'E2G098',	pool:'충북',	attribute:'전문체육',	masters:'미등록',	nameGubun:'미등록',	events:'22',	},
  {	cid:178,	competitionName:'',	dateStart:'',	dateEnd:'',	registStart:'',	registEnd:'',	classCd:'E2',	toCd:'MBCD17',	pool:'',	attribute:'',	masters:'미등록',	nameGubun:'미등록',	events:'0',	},
  {	cid:175,	competitionName:'',	dateStart:'',	dateEnd:'',	registStart:'',	registEnd:'',	classCd:'E2',	toCd:'PRD017',	pool:'',	attribute:'',	masters:'미등록',	nameGubun:'미등록',	events:'0',	},
  {	cid:172,	competitionName:'',	dateStart:'',	dateEnd:'',	registStart:'',	registEnd:'',	classCd:'E2',	toCd:'DAD017',	pool:'',	attribute:'',	masters:'미등록',	nameGubun:'미등록',	events:'0',	},
  {	cid:170,	competitionName:'제46회전국소년체육대회(다이빙)',	dateStart:'42882',	dateEnd:'42885',	registStart:'',	registEnd:'',	classCd:'E2',	toCd:'E2Y046',	pool:'충남',	attribute:'전문체육',	masters:'미등록',	nameGubun:'미등록',	events:'16',	},
  {	cid:166,	competitionName:'',	dateStart:'',	dateEnd:'',	registStart:'',	registEnd:'',	classCd:'E2',	toCd:'D1701',	pool:'',	attribute:'',	masters:'미등록',	nameGubun:'미등록',	events:'0',	},
  {	cid:164,	competitionName:'',	dateStart:'',	dateEnd:'',	registStart:'',	registEnd:'',	classCd:'E2',	toCd:'KGD017',	pool:'',	attribute:'',	masters:'미등록',	nameGubun:'미등록',	events:'0',	},
  {	cid:158,	competitionName:'제97회전국체육대회(다이빙,수구)',	dateStart:'42651',	dateEnd:'42656',	registStart:'',	registEnd:'',	classCd:'E2',	toCd:'E2G097',	pool:'충남',	attribute:'전문체육',	masters:'미등록',	nameGubun:'미등록',	events:'22',	},
  {	cid:154,	competitionName:'',	dateStart:'',	dateEnd:'',	registStart:'',	registEnd:'',	classCd:'E2',	toCd:'PRD016',	pool:'',	attribute:'',	masters:'미등록',	nameGubun:'미등록',	events:'0',	},
  {	cid:150,	competitionName:'',	dateStart:'',	dateEnd:'',	registStart:'',	registEnd:'',	classCd:'E2',	toCd:'MBCD16',	pool:'',	attribute:'',	masters:'미등록',	nameGubun:'미등록',	events:'0',	},
  {	cid:147,	competitionName:'제45회전국소년체육대회(다이빙)',	dateStart:'42518',	dateEnd:'42519',	registStart:'',	registEnd:'',	classCd:'E2',	toCd:'E2Y045',	pool:'김천',	attribute:'전문체육',	masters:'미등록',	nameGubun:'미등록',	events:'16',	},
  {	cid:144,	competitionName:'',	dateStart:'',	dateEnd:'',	registStart:'',	registEnd:'',	classCd:'E2',	toCd:'DAD016',	pool:'',	attribute:'',	masters:'미등록',	nameGubun:'미등록',	events:'0',	},
  {	cid:140,	competitionName:'',	dateStart:'',	dateEnd:'',	registStart:'',	registEnd:'',	classCd:'E2',	toCd:'JHD016',	pool:'',	attribute:'',	masters:'미등록',	nameGubun:'미등록',	events:'0',	},
  {	cid:136,	competitionName:'',	dateStart:'',	dateEnd:'',	registStart:'',	registEnd:'',	classCd:'E2',	toCd:'KGD016',	pool:'',	attribute:'',	masters:'미등록',	nameGubun:'미등록',	events:'0',	},
  {	cid:135,	competitionName:'2016년도다이빙국가대표선발대회',	dateStart:'42344',	dateEnd:'42344',	registStart:'',	registEnd:'',	classCd:'E2',	toCd:'D1502',	pool:'김천',	attribute:'전문체육',	masters:'미등록',	nameGubun:'미등록',	events:'4',	},
  {	cid:130,	competitionName:'제96회전국체육대회(다이빙,수구)',	dateStart:'42294',	dateEnd:'42299',	registStart:'',	registEnd:'',	classCd:'E2',	toCd:'E2G096',	pool:'김천',	attribute:'전문체육',	masters:'미등록',	nameGubun:'미등록',	events:'22',	},
  {	cid:127,	competitionName:'',	dateStart:'',	dateEnd:'',	registStart:'',	registEnd:'',	classCd:'E2',	toCd:'MBCD15',	pool:'',	attribute:'',	masters:'미등록',	nameGubun:'미등록',	events:'0',	},
  {	cid:122,	competitionName:'',	dateStart:'',	dateEnd:'',	registStart:'',	registEnd:'',	classCd:'E2',	toCd:'PRD015',	pool:'',	attribute:'',	masters:'미등록',	nameGubun:'미등록',	events:'0',	},
  {	cid:121,	competitionName:'제44회전국소년체육대회(다이빙)',	dateStart:'42154',	dateEnd:'42157',	registStart:'',	registEnd:'',	classCd:'E2',	toCd:'E2Y044',	pool:'제주',	attribute:'전문체육',	masters:'미등록',	nameGubun:'미등록',	events:'16',	},
  {	cid:118,	competitionName:'',	dateStart:'',	dateEnd:'',	registStart:'',	registEnd:'',	classCd:'E2',	toCd:'PDD015',	pool:'',	attribute:'',	masters:'미등록',	nameGubun:'미등록',	events:'0',	},
  {	cid:112,	competitionName:'',	dateStart:'',	dateEnd:'',	registStart:'',	registEnd:'',	classCd:'E2',	toCd:'DAD015',	pool:'',	attribute:'',	masters:'미등록',	nameGubun:'미등록',	events:'0',	},
  {	cid:111,	competitionName:'2015다이빙선발대회(U대회,세계선수권)',	dateStart:'42105',	dateEnd:'42106',	registStart:'',	registEnd:'',	classCd:'E2',	toCd:'D1501',	pool:'김천',	attribute:'전문체육',	masters:'미등록',	nameGubun:'미등록',	events:'6',	},
  {	cid:108,	competitionName:'',	dateStart:'',	dateEnd:'',	registStart:'',	registEnd:'',	classCd:'E2',	toCd:'JHD015',	pool:'',	attribute:'',	masters:'미등록',	nameGubun:'미등록',	events:'0',	},
  {	cid:105,	competitionName:'',	dateStart:'',	dateEnd:'',	registStart:'',	registEnd:'',	classCd:'E2',	toCd:'KGD015',	pool:'',	attribute:'',	masters:'미등록',	nameGubun:'미등록',	events:'0',	},
  {	cid:101,	competitionName:'제95회전국체육대회(다이빙,수구)',	dateStart:'41941',	dateEnd:'41946',	registStart:'',	registEnd:'',	classCd:'E2',	toCd:'E2G095',	pool:'제주',	attribute:'전문체육',	masters:'미등록',	nameGubun:'미등록',	events:'22',	},
  {	cid:97,	competitionName:'',	dateStart:'',	dateEnd:'',	registStart:'',	registEnd:'',	classCd:'E2',	toCd:'PRD014',	pool:'',	attribute:'',	masters:'미등록',	nameGubun:'미등록',	events:'0',	},
  {	cid:92,	competitionName:'',	dateStart:'',	dateEnd:'',	registStart:'',	registEnd:'',	classCd:'E2',	toCd:'MBCD14',	pool:'',	attribute:'',	masters:'미등록',	nameGubun:'미등록',	events:'0',	},
  {	cid:90,	competitionName:'',	dateStart:'',	dateEnd:'',	registStart:'',	registEnd:'',	classCd:'E2',	toCd:'PDD014',	pool:'',	attribute:'',	masters:'미등록',	nameGubun:'미등록',	events:'0',	},
  {	cid:88,	competitionName:'제17회인천아시아경기대회다이빙선발대회',	dateStart:'41815',	dateEnd:'41816',	registStart:'',	registEnd:'',	classCd:'E2',	toCd:'D1401',	pool:'김천',	attribute:'전문체육',	masters:'미등록',	nameGubun:'미등록',	events:'10',	},
  {	cid:87,	competitionName:'',	dateStart:'',	dateEnd:'',	registStart:'',	registEnd:'',	classCd:'E2',	toCd:'PW2014',	pool:'',	attribute:'',	masters:'미등록',	nameGubun:'미등록',	events:'0',	},
  {	cid:85,	competitionName:'제43회전국소년체육대회(다이빙)',	dateStart:'41783',	dateEnd:'41786',	registStart:'',	registEnd:'',	classCd:'E2',	toCd:'E2Y043',	pool:'인천',	attribute:'전문체육',	masters:'미등록',	nameGubun:'미등록',	events:'16',	},
  {	cid:82,	competitionName:'',	dateStart:'',	dateEnd:'',	registStart:'',	registEnd:'',	classCd:'E2',	toCd:'DAD014',	pool:'',	attribute:'',	masters:'미등록',	nameGubun:'미등록',	events:'0',	},
  {	cid:78,	competitionName:'',	dateStart:'',	dateEnd:'',	registStart:'',	registEnd:'',	classCd:'E2',	toCd:'JHD014',	pool:'',	attribute:'',	masters:'미등록',	nameGubun:'미등록',	events:'0',	},
  {	cid:75,	competitionName:'',	dateStart:'',	dateEnd:'',	registStart:'',	registEnd:'',	classCd:'E2',	toCd:'KGD014',	pool:'',	attribute:'',	masters:'미등록',	nameGubun:'미등록',	events:'0',	},
  {	cid:70,	competitionName:'제94회전국체육대회(다이빙,수구)',	dateStart:'41566',	dateEnd:'41571',	registStart:'',	registEnd:'',	classCd:'E2',	toCd:'E2G094',	pool:'인천',	attribute:'전문체육',	masters:'미등록',	nameGubun:'미등록',	events:'22',	},
  {	cid:67,	competitionName:'제62회회장배겸KBS배전국수영대회(다이빙,수구)',	dateStart:'41541',	dateEnd:'41544',	registStart:'',	registEnd:'',	classCd:'E2',	toCd:'PDD013',	pool:'김천',	attribute:'전문체육',	masters:'미등록',	nameGubun:'미등록',	events:'48',	},
  {	cid:66,	competitionName:'2013MBC배전국수영대회(다이빙,수구)',	dateStart:'41510',	dateEnd:'41512',	registStart:'',	registEnd:'',	classCd:'E2',	toCd:'MBCD13',	pool:'김천',	attribute:'전문체육',	masters:'미등록',	nameGubun:'미등록',	events:'54',	},
  {	cid:61,	competitionName:'제32회대통령배전국수영대회(다이빙,수구)',	dateStart:'41487',	dateEnd:'41490',	registStart:'',	registEnd:'',	classCd:'E2',	toCd:'PRD013',	pool:'전주',	attribute:'전문체육',	masters:'미등록',	nameGubun:'미등록',	events:'48',	},
  {	cid:59,	competitionName:'제9회회장배전국종별수구선수권대회',	dateStart:'41439',	dateEnd:'41442',	registStart:'',	registEnd:'',	classCd:'E2',	toCd:'PW2013',	pool:'광양',	attribute:'전문체육',	masters:'미등록',	nameGubun:'미등록',	events:'2',	},
  {	cid:57,	competitionName:'제42회전국소년체육대회(다이빙)',	dateStart:'41419',	dateEnd:'41422',	registStart:'',	registEnd:'',	classCd:'E2',	toCd:'E2Y042',	pool:'대구',	attribute:'전문체육',	masters:'미등록',	nameGubun:'미등록',	events:'16',	},
  {	cid:56,	competitionName:'제85회동아수영대회(다이빙,수구)',	dateStart:'41393',	dateEnd:'41396',	registStart:'',	registEnd:'',	classCd:'E2',	toCd:'DAD013',	pool:'광주',	attribute:'전문체육',	masters:'미등록',	nameGubun:'미등록',	events:'54',	},
  {	cid:50,	competitionName:'제8회제주한라배전국수영대회(다이빙,수구)',	dateStart:'41337',	dateEnd:'41340',	registStart:'',	registEnd:'',	classCd:'E2',	toCd:'JHD013',	pool:'제주',	attribute:'전문체육',	masters:'미등록',	nameGubun:'미등록',	events:'54',	},
  {	cid:47,	competitionName:'제3회김천전국수영대회(다이빙,수구)',	dateStart:'41326',	dateEnd:'41329',	registStart:'',	registEnd:'',	classCd:'E2',	toCd:'KGD013',	pool:'김천',	attribute:'전문체육',	masters:'미등록',	nameGubun:'미등록',	events:'54',	},
  {	cid:34,	competitionName:'',	dateStart:'',	dateEnd:'',	registStart:'',	registEnd:'',	classCd:'E2',	toCd:'DAD012',	pool:'',	attribute:'',	masters:'미등록',	nameGubun:'미등록',	events:'0',	},
  {	cid:3,	competitionName:'제37회 전국소년체육대회',	dateStart:'39599',	dateEnd:'39602',	registStart:'',	registEnd:'',	classCd:'E2',	toCd:'D2Y037',	pool:'광주',	attribute:'전문체육',	masters:'미등록',	nameGubun:'미등록',	events:'16',	},
  {	cid:1,	competitionName:'제88회 전국체육대회(수구,다이빙)',	dateStart:'39363',	dateEnd:'39369',	registStart:'',	registEnd:'',	classCd:'E2',	toCd:'E2G088',	pool:'염주수영장',	attribute:'전문체육',	masters:'미등록',	nameGubun:'미등록',	events:'22',	},
  {	cid:368,	competitionName:'제15회 김천 전국수영대회(아티스틱스위밍)',	dateStart:'45729',	dateEnd:'45733',	registStart:'45707',	registEnd:'45724',	classCd:'F2',	toCd:'202512226',	pool:'김천실내수영장',	attribute:'전문체육',	masters:'300명이하',	nameGubun:'기타',	events:'18',	},
  {	cid:361,	competitionName:'2024 MBC배 전국수영대회(아티스틱스위밍)',	dateStart:'45612',	dateEnd:'45613',	registStart:'45586',	registEnd:'45602',	classCd:'F2',	toCd:'202411907',	pool:'대전',	attribute:'전문체육',	masters:'300명이하',	nameGubun:'기타',	events:'18',	},
  {	cid:359,	competitionName:'제73회 회장배 전국수영대회(제105회 전국체육대회 프레대회)(아티스틱스위밍)',	dateStart:'45542',	dateEnd:'45546',	registStart:'45518',	registEnd:'45531',	classCd:'F2',	toCd:'202411392',	pool:'창원실내수영장',	attribute:'전문체육',	masters:'300명이하',	nameGubun:'기타',	events:'18',	},
  {	cid:354,	competitionName:'제43회 대통령배 전국수영대회(아티스틱스위밍)',	dateStart:'45513',	dateEnd:'45518',	registStart:'45483',	registEnd:'45499',	classCd:'F2',	toCd:'202411130',	pool:'전주',	attribute:'전문체육',	masters:'300명이하',	nameGubun:'대통령배',	events:'18',	},
  {	cid:348,	competitionName:'제3회 광주 전국 수영선수권대회(아티스틱스위밍)',	dateStart:'45455',	dateEnd:'45459',	registStart:'45421',	registEnd:'45443',	classCd:'F2',	toCd:'202406110',	pool:'광주광역시',	attribute:'전문체육',	masters:'300명이하',	nameGubun:'기타',	events:'15',	},
  {	cid:345,	competitionName:'제96회 동아수영대회(아티스틱스위밍)',	dateStart:'45424',	dateEnd:'45425',	registStart:'45394',	registEnd:'45411',	classCd:'F2',	toCd:'202403099',	pool:'김천',	attribute:'전문체육',	masters:'300명이하',	nameGubun:'기타',	events:'15',	},
  {	cid:337,	competitionName:'제14회 김천 전국수영대회(아티스틱스위밍)',	dateStart:'45364',	dateEnd:'45368',	registStart:'45336',	registEnd:'45357',	classCd:'F2',	toCd:'202400124',	pool:'김천',	attribute:'전문체육',	masters:'300명이하',	nameGubun:'기타',	events:'18',	},
  {	cid:322,	competitionName:'제42회 대통령배 전국수영대회(아티스틱스위밍)',	dateStart:'45150',	dateEnd:'45155',	registStart:'',	registEnd:'',	classCd:'F2',	toCd:'202309960',	pool:'전주',	attribute:'전문체육',	masters:'미등록',	nameGubun:'미등록',	events:'18',	},
  {	cid:318,	competitionName:'제2회 광주 전국 수영선수권대회(아티스틱스위밍)',	dateStart:'45087',	dateEnd:'45088',	registStart:'',	registEnd:'',	classCd:'F2',	toCd:'202309597',	pool:'광주',	attribute:'전문체육',	masters:'미등록',	nameGubun:'기타',	events:'18',	},
  {	cid:310,	competitionName:'제18회 제주 한라배 전국수영대회(아티스틱스위밍)',	dateStart:'45031',	dateEnd:'45032',	registStart:'',	registEnd:'',	classCd:'F2',	toCd:'202309131',	pool:'제주',	attribute:'전문체육',	masters:'300명이하',	nameGubun:'기타',	events:'18',	},
  {	cid:303,	competitionName:'2023년 수영(아티스틱스위밍) 국가대표 선발대회',	dateStart:'44953',	dateEnd:'44953',	registStart:'',	registEnd:'',	classCd:'F2',	toCd:'202300084',	pool:'김천',	attribute:'전문체육',	masters:'300명이하',	nameGubun:'미등록',	events:'1',	},
  {	cid:300,	competitionName:'2023년 수영(경영, 다이빙, 아티스틱스위밍) 국가대표 선발대회(아티스틱스위밍)',	dateStart:'44871',	dateEnd:'44871',	registStart:'',	registEnd:'',	classCd:'F2',	toCd:'202208526',	pool:'김천',	attribute:'전문체육',	masters:'300명이하',	nameGubun:'기타',	events:'2',	},
  {	cid:295,	competitionName:'2022 MBC배 전국수영대회(아티스틱스위밍)',	dateStart:'44856',	dateEnd:'44856',	registStart:'',	registEnd:'',	classCd:'F2',	toCd:'202208543',	pool:'대전',	attribute:'전문체육',	masters:'300명이하',	nameGubun:'기타',	events:'3',	},
  {	cid:292,	competitionName:'제71회 회장배 전국수영대회(아티스틱스위밍)',	dateStart:'44825',	dateEnd:'44826',	registStart:'',	registEnd:'',	classCd:'F2',	toCd:'202208250',	pool:'울산',	attribute:'전문체육',	masters:'미등록',	nameGubun:'미등록',	events:'11',	},
  {	cid:288,	competitionName:'제41회 대통령배 전국수영대회(아티스틱스위밍)',	dateStart:'44786',	dateEnd:'110529',	registStart:'',	registEnd:'',	classCd:'F2',	toCd:'202208010',	pool:'전주',	attribute:'전문체육',	masters:'미등록',	nameGubun:'미등록',	events:'18',	},
  {	cid:286,	competitionName:'2022 FINA 세계유스아티스틱스위밍선수권대회',	dateStart:'44783',	dateEnd:'44787',	registStart:'',	registEnd:'',	classCd:'F2',	toCd:'202309175',	pool:'미국,샬롯',	attribute:'전문체육',	masters:'300명이하',	nameGubun:'기타(국제)',	events:'2',	},
  {	cid:283,	competitionName:'제1회 광주 전국수영선수권대회(아티스틱스위밍)',	dateStart:'44758',	dateEnd:'44759',	registStart:'',	registEnd:'',	classCd:'F2',	toCd:'202207753',	pool:'광주',	attribute:'전문체육',	masters:'300명이하',	nameGubun:'기타',	events:'18',	},
  {	cid:275,	competitionName:'제17회 제주한라배전국수영대회(아티스틱스위밍)',	dateStart:'44654',	dateEnd:'44655',	registStart:'',	registEnd:'',	classCd:'F2',	toCd:'202207203',	pool:'제주',	attribute:'전문체육',	masters:'300명이하',	nameGubun:'기타',	events:'18',	},
  {	cid:272,	competitionName:'제12회 김천전국수영대회(아티스틱스위밍)',	dateStart:'44639',	dateEnd:'44640',	registStart:'',	registEnd:'',	classCd:'F2',	toCd:'202207145',	pool:'김천',	attribute:'전문체육',	masters:'300명이하',	nameGubun:'기타',	events:'5',	},
  {	cid:268,	competitionName:'제16회 제주 한라배 전국수영대회(아티스틱스위밍)',	dateStart:'44525',	dateEnd:'44525',	registStart:'',	registEnd:'',	classCd:'F2',	toCd:'202106829',	pool:'제주',	attribute:'전문체육',	masters:'300명이하',	nameGubun:'기타',	events:'1',	},
  {	cid:265,	competitionName:'2021 MBC배전국수영대회 겸 제50회전국소년체육대회(아티스틱스위밍)',	dateStart:'44507',	dateEnd:'44507',	registStart:'',	registEnd:'',	classCd:'F2',	toCd:'202106711',	pool:'대전',	attribute:'전문체육',	masters:'300명이하',	nameGubun:'기타',	events:'5',	},
  {	cid:259,	competitionName:'제40회 대통령배전국수영대회(아티스틱스위밍)',	dateStart:'44395',	dateEnd:'44395',	registStart:'',	registEnd:'',	classCd:'F2',	toCd:'202106227',	pool:'전주',	attribute:'전문체육',	masters:'300명이하',	nameGubun:'대통령배',	events:'3',	},
  {	cid:255,	competitionName:'제11회 김천 전국수영대회(아티스틱스위밍)',	dateStart:'44282',	dateEnd:'44283',	registStart:'',	registEnd:'',	classCd:'F2',	toCd:'202105826',	pool:'김천',	attribute:'전문체육',	masters:'300명이하',	nameGubun:'기타',	events:'16',	},
  {	cid:249,	competitionName:'2021년 아티스틱스위밍 국가대표 선발대회',	dateStart:'44135',	dateEnd:'44136',	registStart:'44124',	registEnd:'44132',	classCd:'F2',	toCd:'202005579',	pool:'김천',	attribute:'전문체육',	masters:'300명이하',	nameGubun:'기타',	events:'1',	},
  {	cid:247,	competitionName:'제10회김천전국수영대회(아티스틱스위밍)',	dateStart:'44124',	dateEnd:'44124',	registStart:'44096',	registEnd:'44111',	classCd:'F2',	toCd:'202005508',	pool:'김천',	attribute:'전문체육',	masters:'300명이하',	nameGubun:'기타',	events:'9',	},
  {	cid:244,	competitionName:'2020 아티스틱 스위밍 국가대표 선발대회',	dateStart:'43827',	dateEnd:'43828',	registStart:'43756',	registEnd:'43815',	classCd:'F2',	toCd:'201904559',	pool:'진천',	attribute:'전문체육',	masters:'300명이하',	nameGubun:'기타',	events:'1',	},
  {	cid:238,	competitionName:'2019 MBC배 전국수영대회(아티스틱스위밍)',	dateStart:'43730',	dateEnd:'43731',	registStart:'43691',	registEnd:'43713',	classCd:'F2',	toCd:'201904115',	pool:'김천',	attribute:'전문체육',	masters:'300명이하',	nameGubun:'기타',	events:'18',	},
  {	cid:235,	competitionName:'제38회 대통령배 전국수영대회(아티스틱스위밍)',	dateStart:'43702',	dateEnd:'43703',	registStart:'43663',	registEnd:'43689',	classCd:'F2',	toCd:'201903841',	pool:'전주',	attribute:'전문체육',	masters:'300명이하',	nameGubun:'대통령배',	events:'15',	},
  {	cid:231,	competitionName:'제91회 동아수영대회(아티스틱스위밍)',	dateStart:'43624',	dateEnd:'43625',	registStart:'43589',	registEnd:'43608',	classCd:'F2',	toCd:'201903357',	pool:'광주',	attribute:'전문체육',	masters:'1000명이상',	nameGubun:'기타',	events:'18',	},
  {	cid:225,	competitionName:'제68회 회장배 전국수영대회(아티스틱스위밍)',	dateStart:'43597',	dateEnd:'43598',	registStart:'43564',	registEnd:'43585',	classCd:'F2',	toCd:'201903247',	pool:'김천',	attribute:'전문체육',	masters:'300명이하',	nameGubun:'기타',	events:'18',	},
  {	cid:220,	competitionName:'제9회김천전국수영대회(아티스틱스위밍)',	dateStart:'43565',	dateEnd:'43569',	registStart:'43543',	registEnd:'43557',	classCd:'F2',	toCd:'KGS019',	pool:'김천',	attribute:'전문체육',	masters:'1000명이상',	nameGubun:'기타',	events:'18',	},
  {	cid:217,	competitionName:'제14회제주한라배전국수영대회(아티스틱스위밍)',	dateStart:'43549',	dateEnd:'43550',	registStart:'43518',	registEnd:'43532',	classCd:'F2',	toCd:'JHS019',	pool:'제주',	attribute:'전문체육',	masters:'300명이하',	nameGubun:'기타',	events:'18',	},
  {	cid:207,	competitionName:'제37회대통령배전국수영대회(아티스틱스위밍)',	dateStart:'43324',	dateEnd:'43325',	registStart:'43293',	registEnd:'43307',	classCd:'F2',	toCd:'PRS018',	pool:'광주',	attribute:'전문체육',	masters:'300명이하',	nameGubun:'대통령배',	events:'15',	},
  {	cid:203,	competitionName:'2018MBC배전국수영대회(아티스틱스위밍)',	dateStart:'43303',	dateEnd:'43304',	registStart:'43276',	registEnd:'43287',	classCd:'F2',	toCd:'MBCS18',	pool:'김천',	attribute:'전문체육',	masters:'300명이하',	nameGubun:'기타',	events:'18',	},
  {	cid:194,	competitionName:'제90회동아수영대회(아티스틱스위밍)',	dateStart:'43221',	dateEnd:'43222',	registStart:'43188',	registEnd:'43202',	classCd:'F2',	toCd:'DAS018',	pool:'광주',	attribute:'전문체육',	masters:'300명이하',	nameGubun:'기타',	events:'18',	},
  {	cid:190,	competitionName:'제8회김천전국수영대회(아티스틱스위밍)',	dateStart:'43183',	dateEnd:'43184',	registStart:'43152',	registEnd:'43167',	classCd:'F2',	toCd:'KGS018',	pool:'김천',	attribute:'전문체육',	masters:'300명이하',	nameGubun:'미등록',	events:'18',	},
  {	cid:183,	competitionName:'제98회전국체육대회(아티스틱스위밍 시범종목)',	dateStart:'43032',	dateEnd:'43032',	registStart:'',	registEnd:'',	classCd:'F2',	toCd:'F2G098',	pool:'충북',	attribute:'전문체육',	masters:'미등록',	nameGubun:'미등록',	events:'2',	},
  {	cid:180,	competitionName:'',	dateStart:'',	dateEnd:'',	registStart:'',	registEnd:'',	classCd:'F2',	toCd:'MBCS17',	pool:'',	attribute:'',	masters:'미등록',	nameGubun:'미등록',	events:'0',	},
  {	cid:177,	competitionName:'',	dateStart:'',	dateEnd:'',	registStart:'',	registEnd:'',	classCd:'F2',	toCd:'PRS017',	pool:'',	attribute:'',	masters:'미등록',	nameGubun:'미등록',	events:'0',	},
  {	cid:173,	competitionName:'',	dateStart:'',	dateEnd:'',	registStart:'',	registEnd:'',	classCd:'F2',	toCd:'DAS017',	pool:'',	attribute:'',	masters:'미등록',	nameGubun:'미등록',	events:'0',	},
  {	cid:168,	competitionName:'',	dateStart:'',	dateEnd:'',	registStart:'',	registEnd:'',	classCd:'F2',	toCd:'SC1701',	pool:'',	attribute:'',	masters:'미등록',	nameGubun:'미등록',	events:'0',	},
  {	cid:165,	competitionName:'',	dateStart:'',	dateEnd:'',	registStart:'',	registEnd:'',	classCd:'F2',	toCd:'KGS017',	pool:'',	attribute:'',	masters:'미등록',	nameGubun:'미등록',	events:'0',	},
  {	cid:159,	competitionName:'제97회전국체육대회(싱크로 시범종목)',	dateStart:'42654',	dateEnd:'42654',	registStart:'',	registEnd:'',	classCd:'F2',	toCd:'F2G097',	pool:'충남',	attribute:'전문체육',	masters:'미등록',	nameGubun:'미등록',	events:'2',	},
  {	cid:156,	competitionName:'',	dateStart:'',	dateEnd:'',	registStart:'',	registEnd:'',	classCd:'F2',	toCd:'PRS016',	pool:'',	attribute:'',	masters:'미등록',	nameGubun:'미등록',	events:'0',	},
  {	cid:152,	competitionName:'',	dateStart:'',	dateEnd:'',	registStart:'',	registEnd:'',	classCd:'F2',	toCd:'MBCS16',	pool:'',	attribute:'',	masters:'미등록',	nameGubun:'미등록',	events:'0',	},
  {	cid:145,	competitionName:'',	dateStart:'',	dateEnd:'',	registStart:'',	registEnd:'',	classCd:'F2',	toCd:'DAS016',	pool:'',	attribute:'',	masters:'미등록',	nameGubun:'미등록',	events:'0',	},
  {	cid:141,	competitionName:'',	dateStart:'',	dateEnd:'',	registStart:'',	registEnd:'',	classCd:'F2',	toCd:'JHS016',	pool:'',	attribute:'',	masters:'미등록',	nameGubun:'미등록',	events:'0',	},
  {	cid:138,	competitionName:'',	dateStart:'',	dateEnd:'',	registStart:'',	registEnd:'',	classCd:'F2',	toCd:'KGS016',	pool:'',	attribute:'',	masters:'미등록',	nameGubun:'미등록',	events:'0',	},
  {	cid:132,	competitionName:'2016년도싱크로나이즈드스위밍국가대표선발대회',	dateStart:'42297',	dateEnd:'42298',	registStart:'',	registEnd:'',	classCd:'F2',	toCd:'AS2015',	pool:'김천',	attribute:'전문체육',	masters:'미등록',	nameGubun:'미등록',	events:'1',	},
  {	cid:129,	competitionName:'',	dateStart:'',	dateEnd:'',	registStart:'',	registEnd:'',	classCd:'F2',	toCd:'MBCS15',	pool:'',	attribute:'',	masters:'미등록',	nameGubun:'미등록',	events:'0',	},
  {	cid:124,	competitionName:'',	dateStart:'',	dateEnd:'',	registStart:'',	registEnd:'',	classCd:'F2',	toCd:'PRS015',	pool:'',	attribute:'',	masters:'미등록',	nameGubun:'미등록',	events:'0',	},
  {	cid:119,	competitionName:'',	dateStart:'',	dateEnd:'',	registStart:'',	registEnd:'',	classCd:'F2',	toCd:'PDS015',	pool:'',	attribute:'',	masters:'미등록',	nameGubun:'미등록',	events:'0',	},
  {	cid:115,	competitionName:'제16회카잔세계수영선수권대회싱크로선발대회',	dateStart:'42113',	dateEnd:'42114',	registStart:'',	registEnd:'',	classCd:'F2',	toCd:'SR1501',	pool:'울산',	attribute:'전문체육',	masters:'미등록',	nameGubun:'미등록',	events:'2',	},
  {	cid:114,	competitionName:'',	dateStart:'',	dateEnd:'',	registStart:'',	registEnd:'',	classCd:'F2',	toCd:'DAS015',	pool:'',	attribute:'',	masters:'미등록',	nameGubun:'미등록',	events:'0',	},
  {	cid:110,	competitionName:'',	dateStart:'',	dateEnd:'',	registStart:'',	registEnd:'',	classCd:'F2',	toCd:'JHS015',	pool:'',	attribute:'',	masters:'미등록',	nameGubun:'미등록',	events:'0',	},
  {	cid:107,	competitionName:'',	dateStart:'',	dateEnd:'',	registStart:'',	registEnd:'',	classCd:'F2',	toCd:'KGS015',	pool:'',	attribute:'',	masters:'미등록',	nameGubun:'미등록',	events:'0',	},
  {	cid:102,	competitionName:'제95회전국체육대회(싱크로 시범종목)',	dateStart:'41944',	dateEnd:'41944',	registStart:'',	registEnd:'',	classCd:'F2',	toCd:'F2G095',	pool:'제주',	attribute:'전문체육',	masters:'미등록',	nameGubun:'미등록',	events:'2',	},
  {	cid:99,	competitionName:'',	dateStart:'',	dateEnd:'',	registStart:'',	registEnd:'',	classCd:'F2',	toCd:'PRS014',	pool:'',	attribute:'',	masters:'미등록',	nameGubun:'미등록',	events:'0',	},
  {	cid:95,	competitionName:'제17회인천아시아경기대회싱크로나이즈드스위밍선발대회',	dateStart:'41840',	dateEnd:'41841',	registStart:'',	registEnd:'',	classCd:'F2',	toCd:'AS2014',	pool:'김천',	attribute:'전문체육',	masters:'미등록',	nameGubun:'미등록',	events:'1',	},
  {	cid:94,	competitionName:'',	dateStart:'',	dateEnd:'',	registStart:'',	registEnd:'',	classCd:'F2',	toCd:'MBCS14',	pool:'',	attribute:'',	masters:'미등록',	nameGubun:'미등록',	events:'0',	},
  {	cid:91,	competitionName:'',	dateStart:'',	dateEnd:'',	registStart:'',	registEnd:'',	classCd:'F2',	toCd:'PDS014',	pool:'',	attribute:'',	masters:'미등록',	nameGubun:'미등록',	events:'0',	},
  {	cid:84,	competitionName:'',	dateStart:'',	dateEnd:'',	registStart:'',	registEnd:'',	classCd:'F2',	toCd:'DAS014',	pool:'',	attribute:'',	masters:'미등록',	nameGubun:'미등록',	events:'0',	},
  {	cid:80,	competitionName:'',	dateStart:'',	dateEnd:'',	registStart:'',	registEnd:'',	classCd:'F2',	toCd:'JHS014',	pool:'',	attribute:'',	masters:'미등록',	nameGubun:'미등록',	events:'0',	},
  {	cid:77,	competitionName:'',	dateStart:'',	dateEnd:'',	registStart:'',	registEnd:'',	classCd:'F2',	toCd:'KGS014',	pool:'',	attribute:'',	masters:'미등록',	nameGubun:'미등록',	events:'0',	},
  {	cid:72,	competitionName:'제94회전국체육대회(싱크로 시범종목)',	dateStart:'41569',	dateEnd:'41569',	registStart:'',	registEnd:'',	classCd:'F2',	toCd:'F2G094',	pool:'인천',	attribute:'전문체육',	masters:'미등록',	nameGubun:'미등록',	events:'2',	},
  {	cid:69,	competitionName:'',	dateStart:'',	dateEnd:'',	registStart:'',	registEnd:'',	classCd:'F2',	toCd:'PDS013',	pool:'',	attribute:'',	masters:'미등록',	nameGubun:'미등록',	events:'0',	},
  {	cid:64,	competitionName:'2013MBC배전국수영대회(싱크로)',	dateStart:'41508',	dateEnd:'41509',	registStart:'',	registEnd:'',	classCd:'F2',	toCd:'MBCS13',	pool:'김천',	attribute:'전문체육',	masters:'미등록',	nameGubun:'미등록',	events:'14',	},
  {	cid:63,	competitionName:'제32회대통령배전국수영대회(싱크로)',	dateStart:'41490',	dateEnd:'41491',	registStart:'',	registEnd:'',	classCd:'F2',	toCd:'PRS013',	pool:'전주',	attribute:'전문체육',	masters:'미등록',	nameGubun:'미등록',	events:'10',	},
  {	cid:55,	competitionName:'제85회동아수영대회(싱크로)',	dateStart:'41393',	dateEnd:'41394',	registStart:'',	registEnd:'',	classCd:'F2',	toCd:'DAS013',	pool:'광주',	attribute:'전문체육',	masters:'미등록',	nameGubun:'미등록',	events:'14',	},
  {	cid:52,	competitionName:'제8회제주한라배전국수영대회(싱크로)',	dateStart:'41340',	dateEnd:'41341',	registStart:'',	registEnd:'',	classCd:'F2',	toCd:'JHS013',	pool:'제주',	attribute:'전문체육',	masters:'미등록',	nameGubun:'미등록',	events:'14',	},
  {	cid:49,	competitionName:'제3회김천전국수영대회(싱크로)',	dateStart:'41329',	dateEnd:'41330',	registStart:'',	registEnd:'',	classCd:'F2',	toCd:'KGS013',	pool:'김천',	attribute:'전문체육',	masters:'미등록',	nameGubun:'미등록',	events:'14',	},
  {	cid:35,	competitionName:'',	dateStart:'',	dateEnd:'',	registStart:'',	registEnd:'',	classCd:'F2',	toCd:'DAS012',	pool:'',	attribute:'',	masters:'미등록',	nameGubun:'미등록',	events:'0',	},  
];
exports.getCompetition = (code) => {
  const competition = this.CompetitionTable.find(el => el.toCd == code);
  return competition ?? {};
}
exports.getCompetitionByNameNew = (name) => {
  name = name.replace("(경영)", '').replace(/ /gi,'');
  let competition = competitionTable.find(el => name==(el.ksfName||'').replace(/ /gi,''));
  if (!competition) competition = competitionTable.find(el => name==(el.competitionName||'').replace(/ /gi,''));
  if (!competition) competition = competitionTable.find(el => name==(el.myRankingName||'').replace(/ /gi,''));
  return competition ?? {};
}
exports.getCompetitionByName = (name) => {
  const competition = this.CompetitionTable.find(el => el.ksfName==name);
  return competition ?? {};
}
exports.getCompetitionName = (code) => {
  const competition = this.CompetitionTable.find(el => el.toCd == code);
  return competition?.competitionName ?? '';
}
exports.getCompetitionCode = (competitionName) => {
  const competition = this.CompetitionTable.find(el => el.ksfName == competitionName);
  console.log("getCompetitionCode.competitionName=", competitionName, "competition=", competition);
  return competition?.toCd ?? '';
}

exports.parseSwimEvent = (eventString) => {
  // 스타일과 거리 정보를 담을 객체 초기화
  let result = {
    style: '',
    distance: ''
  };
  
  // 입력된 문자열에서 스타일 찾기
  for (const style of styles) {
    if (eventString.includes(style)) {
      result.style = utilTimes.getStyle(style);
      // 스타일을 제외한 나머지 부분이 거리
      result.distance = eventString.replace(style, '').replace("m", "M");
      break;
    }
  }
  
  return result;
}

exports.postCompetitionSchedule = async (kindCd,detailClassCd) => {
  try {
    // POST 요청을 위한 데이터 준비
    const formData = new URLSearchParams();
    formData.append('kindCd', kindCd);
    formData.append('detailClassCd', detailClassCd);
    formData.append('searchKindCd', kindCd);
    formData.append('searchDetailClassCd', detailClassCd);
    
    // Axios를 사용한 POST 요청
    const response = await axios({
      method: 'post',
      url: 'https://example.com/SW/INF301.do', // 실제 URL로 변경하세요
      data: formData,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        // 필요한 경우 쿠키나 다른 헤더도 추가할 수 있습니다
      }
    });
    return response.data;
  } catch (e) {
    console.log("sendPost.catch.e", e);
    return "";
  }
}


// Home 일정/결과 대회상세정보 경기일정 경기결과
exports.postCompetitionResult = async (rhCd,gubun) => {
  try {
    // POST 요청을 위한 데이터 준비
    const formData = new URLSearchParams();
    formData.append('rhCd', rhCd);
    formData.append('gubun', gubun);
    
    // Axios를 사용한 POST 요청
    const response = await axios({
      method: 'post',
      url: 'https://result.sports.or.kr/SW/INF306.do', // 실제 URL로 변경하세요
      data: formData,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        // 필요한 경우 쿠키나 다른 헤더도 추가할 수 있습니다
      }
    });
    return response.data;
  } catch (e) {
    console.log("sendPost.catch.e", e);
    return "";
  }
}

exports.formatDateToYYYYMMDD = (dateString) => {
  // 다양한 입력 형식 처리
  // 예: "2019.2.16", "2019.02.16.", "2019.2.16 /"
  
  // 숫자가 아닌 문자(., /, 공백 등)로 분리
  const parts = dateString.split(/[^\d]+/);
  
  // 빈 문자열 제거
  const filteredParts = parts.filter(part => part !== '');
  
  // 날짜 구성요소가 3개(연, 월, 일)가 아니면 원래 문자열 반환
  if (filteredParts.length < 3) {
    return dateString;
  }
  
  const year = filteredParts[0];
  let month = filteredParts[1];
  let day = filteredParts[2];
  
  // 한 자리 월/일에 앞에 0 붙이기
  month = month.padStart(2, '0');
  day = day.padStart(2, '0');
  
  // yyyy-mm-dd 형식으로 반환
  return `${year}-${month}-${day}`;
}

exports.formatName = (name) => {
  // 이름 문자열이 없거나 유효하지 않은 경우
  if (!name || typeof name !== 'string') {
    return name;
  }
  
  // 이름 문자열 양쪽 공백 제거
  const trimmedName = name.trim();
  
  // 한글 패턴을 확인하는 정규식
  // 한글 유니코드 범위: AC00-D7A3 (가-힣), 1100-11FF (한글 자모)
  const koreanPattern = /[\uAC00-\uD7A3\u1100-\u11FF]/;
  
  // 이름에 한글이 포함되어 있는지 확인
  if (koreanPattern.test(trimmedName)) {
    // 한글 이름이면 모든 공백 제거
    return trimmedName.replace(/\s+/g, '');
  } else {
    // 영문 이름이면 그대로 반환
    return trimmedName;
  }
}
