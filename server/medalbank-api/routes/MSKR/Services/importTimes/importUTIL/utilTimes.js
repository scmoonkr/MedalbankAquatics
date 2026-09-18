const utilLibrary 	= require('../../../Util/utilLibrary');
const excelLibrary	= require('../../../Util/excelLibrary');
const XlsxPopulate	= require('xlsx-populate');
const excel	      	= new excelLibrary();

const mongoDB				= require('../../../Class/MongoDB');
const mongoCFG 			= require('../../../Config/mongoCFG');
const mongodb 			= new mongoDB(mongoCFG.Medalbank.database);

const UtilDate    	= require("../../../Util/utilDate");
const utilDate	  	= new UtilDate();
const fs 						= require("fs");

// 접영핀,배영핀,평영핀,자유형핀,개인혼영,혼성계영,계영,혼성혼계영,핀계영
exports.styleTable = [
	{ label: "자유형", style: "freestyle", },
	{ label: "배영", style: "backstroke", },
	{ label: "평영", style: "breaststroke", },
	{ label: "접영", style: "butterfly", },
	{ label: "개인혼영", style: "individualMedley", },
	{ label: "혼성계영", style: "freestyleRelay", },
	{ label: "혼성혼계영", style: "medleyRelay", },
	{ label: "혼계영", style: "medleyRelay", },
	{ label: "계영", style: "freestyleRelay", },
];
const _genders 	= [ "남자/여자", "남자,여자", "여자", "남자", "남·여", "남여", "남", "여", "혼성" ];
const _styles 	= [ "접영", "배영", "평영", "자유형", "개인혼영", "혼계영", "혼성계영", "혼성혼계영", "계영",];
const _distances= [ "25M", "50M", "100M", "200M", "400M", "800M", "100M", "1500M" ];
const _rounds 	= [ "준결승", "결승", "예선", "기록회", "타임레이스" ];
const _juniors = [
	"유아","유치","유년","초등","남초","여초","저학년","고학년","어린이",
	"중등","중학","중고등","고등","학생",	
];

const _color = {
	White: "FFFFFF",
	Black: "000000",
	Grey: "ECECEC",
	greyLight: "F8F8F8",
	GreyDark: "969696",

	// Red 
	red: "FF0000",
	IndianRed: "CD5C5C",
	LightCoral: "F08080",

	// Pink 
	Pink: "FFC0CB",
	LightPink: "FFB6C1",
	HotPink: "FF69B4",
	DeepPink: "FF1493",
	
	// orange
	Orange: "FFA500",
	LightSalmon: "FFA07A",
	Coral: "FF7F50",
	Tomato: "FF6347",
	OrangeRed: "FF4500",
	DarkOrange: "FF8C00",

	// Yellow 
	Yellow: "FFFF00",
	Gold: "FA07A",
	LightYellow: "FFFFE0",

	// Purple
	Purple: "800080",
	Lavender: "E6E6FA",
	Magenta: "FF00FF",
	Indigo: "4B0082",

	// Green 
	Green: "00FF00",
	LightGreen: "90EE90",

	// Blue 
	Blue: "0000FF",
	Cyan: "00FFFF",
	MediumBlue: "0000CD",	
	DarkBlue: "00008B",

	// Brown 
	Brown: "A52A2A",
	
}
const defaultHeight = 15;
const defaultWidth = 10;
const customFields = [
	{ field: "masters", mongoField: "mongoMasters", },
	{ field: "adult", mongoField: "mongoAdult", },
	{ field: "gender", mongoField: "mongoGender", },
	{ field: "ageGroup", mongoField: "mongoAgeGroup", },
	{ field: "style", mongoField: "mongoStyle", },
	{ field: "distance", mongoField: "mongoDistance", },
	{ field: "round", mongoField: "mongoRound", },
	{ field: "name", mongoField: "mongoName", },
	{ field: "team", mongoField: "mongoTeam", },
	{ field: "rank", mongoField: "mongoRank", },
	{ field: "times", mongoField: "mongoTimes", },
	{ field: "status", mongoField: "mongoStatus", },
];

exports.getStyle = (label => {
	label = label.replace(/ /g, '');
	const ck = this.styleTable.find(style => style.label==label);
	return !ck ? label : ck.style;
})
exports.getStyle1 = (label) => {
	return this.styleTable.find(style => style.label==label).style;
}
const competitionList = [
	{	competitionID: 1,	competitionName: '2019 광주FINA세계마스터즈수영선수권대회',	complete: false, upload: '',	datetime: '2019-08-05',	datetimeEnd: '2019-08-18',	course: 'LCM',	pool: '광주남부대시립국제수영장',	hosts: '',	management: '광주광역시수영연맹',	partners: '문화체육관광부, 광주광역시, 여수시, 대한수영연맹',	sponser: '',	link: '',	},
	{	competitionID: 2,	competitionName: '2019 제9회 오산시 독산성배 전국 마스터즈 수영대회',	complete: false, upload: '',	datetime: '2019-07-06',	datetimeEnd: '2019-07-07',	course: 'LCM',	pool: '오산스포츠센터',	hosts: '오산시수영연맹',	management: '오산시체육회',	partners: '',	sponser: '',	link: '',	},
	{	competitionID: 3,	competitionName: '아레나 전국 마스터즈 수영대회 2018',	complete: true, upload: '',	datetime: '2018-09-15',	datetimeEnd: '2018-09-16',	course: 'LCM',	pool: '고양체육관 내 실내 수영장',	hosts: '',	management: '',	partners: '',	sponser: '',	link: '',	},
	{	competitionID: 4,	competitionName: '아레나 전국 마스터즈 수영대회 2019',	complete: true, upload: '',	datetime: '2019-12-21',	datetimeEnd: '2019-12-22',	course: 'LCM',	pool: '인천 문학 박태환 수영장',	hosts: '',	management: '',	partners: '',	sponser: '',	link: '',	},
	{	competitionID: 5,	competitionName: '전국생활체육대축전 2017',	complete: true, upload: '',	datetime: '2017-07-12',	datetimeEnd: '2017-07-28',	course: 'LCM',	pool: '광주남부대시립국제수영장',	hosts: '광주광역시수영연맹',	management: '광주광역시수영연맹',	partners: '문화체육관광부, 광주광역시, 여수시, 대한수영연맹',	sponser: '',	link: '',	},
	{	competitionID: 6,	competitionName: '아레나 전국 마스터즈 수영대회 2017',	complete: true, upload: '',	datetime: '2017-10-27',	datetimeEnd: '2017-10-28',	course: 'LCM',	pool: '인천 문학 박태환 수영장',	hosts: '',	management: '',	partners: '',	sponser: '',	link: '',	},
	{	competitionID: 7,	competitionName: "It's Daejeon 전국 마스터즈 수영대회 2017 제22회",	complete: true, upload: '',	datetime: '2017-12-09',	datetimeEnd: '2017-12-10',	course: 'LCM',	pool: '용운국제수영장',	hosts: '대전광역시수영연맹',	management: '대전광역시수영연맹',	partners: '대전광역시체육회',	sponser: '',	link: '',	},
	{	competitionID: 8,	competitionName: '전국생활체육대축전 2018',	complete: true, upload: '',	datetime: '2018-05-10',	datetimeEnd: '2018-05-13',	course: 'LCM',	pool: '충남 아산 배미수영장',	hosts: '',	management: '',	partners: '',	sponser: '',	link: '',	},
	{	competitionID: 9,	competitionName: "It's Daejeon 전국 마스터즈 수영대회 2018 제23회",	complete: true, upload: '',	datetime: '2018-12-08',	datetimeEnd: '2018-12-09',	course: 'LCM',	pool: '용운국제수영장',	hosts: '대전광역시수영연맹',	management: '대전광역시수영연맹',	partners: '대전광역시체육회',	sponser: '',	link: '',	},
	{	competitionID: 10,	competitionName: '배럴 스프린트 챔피언십 2019',	complete: true, upload: '',	datetime: '2019-02-24',	datetimeEnd: '',	course: 'LCM',	pool: '인천 문학 박태환 수영장',	hosts: '',	management: '',	partners: '',	sponser: '',	link: '',	},
	{	competitionID: 11,	competitionName: '전국생활체육대축전 2019',	complete: true, upload: '',	datetime: '2019-04-27',	datetimeEnd: '2019-04-28',	course: 'LCM',	pool: '충청북도 청주 실내 수영장',	hosts: '',	management: '',	partners: '',	sponser: '',	link: '',	},
	{	competitionID: 12,	competitionName: '2019 한국외대 아마추어 수영대회 (작업중)',	complete: false, upload: '',	datetime: '2019-05-12',	datetimeEnd: '',	course: 'LCM',	pool: '인천 문학 박태환 수영장',	hosts: '',	management: '',	partners: '',	sponser: '',	link: '',	},
	{	competitionID: 13,	competitionName: "It's Daejeon 전국 마스터즈 수영대회 2019 제24회",	complete: true, upload: '',	datetime: '2019-12-07',	datetimeEnd: '2019-12-08',	course: 'LCM',	pool: '용운국제수영장',	hosts: '대전광역시수영연맹',	management: '대전광역시수영연맹',	partners: '대전광역시체육회',	sponser: '(주)대전아레나',	link: '',	},
	{	competitionID: 14,	competitionName: 'KOREA MASTERS 2019',	complete: true, upload: '',	datetime: '2019-12-28',	datetimeEnd: '',	course: 'LCM',	pool: '광주남부대시립국제수영장',	hosts: '',	management: '',	partners: '',	sponser: '',	link: '',	},
	{	competitionID: 15,	competitionName: 'KOREA MASTERS 2020',	complete: true, upload: '',	datetime: '2021-04-03',	datetimeEnd: '2021-04-04',	course: 'LCM',	pool: '김천실내수영장',	hosts: '경상북도수영연맹',	management: '(사)대한수영연맹',	partners: '김천시, 김천시체육회',	sponser: '(주)아레나코리아',	link: 'https://www.korswim.co.kr/schedule/detail/120',	},
	{	competitionID: 16,	competitionName: '제6회 울산MBC 마스터즈 수영대회',	complete: false, upload: '',	datetime: '2005-09-25',	datetimeEnd: '',	course: 'LCM',	pool: '울산문수 실내수영장',	hosts: '',	management: '',	partners: '',	sponser: '',	link: '',	},

	{	competitionID: 17,	competitionName: '제7회 연맹회장배 수영대회',	complete: false, upload: 'NO',	datetime: '2005-12-03',	datetimeEnd: '',	course: 'LCM',	pool: '울산문수 실내수영장',	hosts: '',	management: '',	partners: '',	sponser: '',	link: '',	},
	{	competitionID: 18,	competitionName: '제7회 울산 MBC 전국 마스터즈 수영대회',	complete: false, upload: '',	datetime: '2006-11-05',	datetimeEnd: '',	course: 'LCM',	pool: '울산문수 실내수영장',	hosts: '',	management: '',	partners: '',	sponser: '',	link: '',	},
	{	competitionID: 19,	competitionName: '제8회 회장배 마스터즈 수영대회',	complete: false, upload: '',	datetime: '2007-12-09',	datetimeEnd: '',	course: 'LCM',	pool: '울산문수 실내수영장',	hosts: '',	management: '',	partners: '',	sponser: '',	link: '',	},
	// {	competitionID: 20,	competitionName: '2008 울산 전국마스터즈 수영대회',	complete: false, upload: '',	datetime: '2008-02-17',	datetimeEnd: '',	course: 'LCM',	pool: '울산문수 실내수영장',	hosts: '',	management: '',	partners: '',	sponser: '',	link: '',	},
	{	competitionID: 21,	competitionName: '제9회 울산광역시교육감기 수영대회',	complete: false, upload: '',	datetime: '2009-04-11',	datetimeEnd: '',	course: 'LCM',	pool: '울산문수 실내수영장',	hosts: '',	management: '',	partners: '',	sponser: '',	link: '',	},
	{	competitionID: 22,	competitionName: '제10회 교육감배 수영대회',	complete: false, upload: '',	datetime: '2010-03-14',	datetimeEnd: '',	course: 'LCM',	pool: '울산문수 실내수영장',	hosts: '',	management: '',	partners: '',	sponser: '',	link: '',	},
	{	competitionID: 23,	competitionName: '제11회 교육감배 수영대회',	complete: false, upload: '',	datetime: '2011-03-13',	datetimeEnd: '',	course: 'LCM',	pool: '울산문수 실내수영장',	hosts: '',	management: '',	partners: '',	sponser: '',	link: '',	},
	{	competitionID: 24,	competitionName: '제12회 울산광역시교육감배 수영대회',	complete: false, upload: '',	datetime: '2012-03-25',	datetimeEnd: '',	course: 'LCM',	pool: '울산문수 실내수영장',	hosts: '',	management: '',	partners: '',	sponser: '',	link: '',	},
	{	competitionID: 25,	competitionName: '제13회 교육감배 수영대회',	complete: false, upload: '',	datetime: '2013-03-24',	datetimeEnd: '',	course: 'LCM',	pool: '울산문수 실내수영장',	hosts: '',	management: '',	partners: '',	sponser: '',	link: '',	},
	{	competitionID: 26,	competitionName: '제14회 교육감배 수영대회',	complete: false, upload: '',	datetime: '2014-04-06',	datetimeEnd: '',	course: 'LCM',	pool: '울산문수 실내수영장',	hosts: '',	management: '',	partners: '',	sponser: '',	link: '',	},
	{	competitionID: 27,	competitionName: '제15회 울산광역시교육감배 수영대회',	complete: false, upload: '',	datetime: '2015-04-12',	datetimeEnd: '',	course: 'LCM',	pool: '울산문수 실내수영장',	hosts: '',	management: '',	partners: '',	sponser: '',	link: '',	},
	{	competitionID: 28,	competitionName: '제16회 울산광역시교육감배 수영대회',	complete: false, upload: '',	datetime: '2016-03-27',	datetimeEnd: '',	course: 'LCM',	pool: '울산문수 실내수영장',	hosts: '',	management: '',	partners: '',	sponser: '',	link: '',	},
	{	competitionID: 29,	competitionName: '제2회 강동구연맹회장배 수영대회',	complete: false, upload: '',	datetime: '2017-03-05',	datetimeEnd: '',	course: 'LCM',	pool: '서울체육고등학교 수영장',	hosts: '',	management: '',	partners: '',	sponser: '',	link: '',	},
	{	competitionID: 30,	competitionName: '제17회 울산광역시교육감배 수영대회',	complete: false, upload: '',	datetime: '2017-04-02',	datetimeEnd: '',	course: 'LCM',	pool: '울산문수 실내수영장',	hosts: '',	management: '',	partners: '',	sponser: '',	link: '',	},
	{	competitionID: 31,	competitionName: '제6회 서울특별시장기 수영대회',	complete: false, upload: '',	datetime: '2017-04-22',	datetimeEnd: '2017-04-23',	course: 'LCM',	pool: '잠실 종합운동장 내 제1실내 수영장',	hosts: '',	management: '',	partners: '',	sponser: '',	link: '',	},
	{	competitionID: 32,	competitionName: '제1회 서대문구연맹회장배 수영대회',	complete: false, upload: 'NO',	datetime: '2017-05-28',	datetimeEnd: '',	course: 'SCM',	pool: '서대문문화체육회관 수영장',	hosts: '',	management: '',	partners: '',	sponser: '',	link: '',	},
	{	competitionID: 33,	competitionName: '제1회 은평구연맹회장배 수영대회',	complete: false, upload: 'NO',	datetime: '2017-07-16',	datetimeEnd: '',	course: 'SCM',	pool: '은평구민체육센터 수영장',	hosts: '은평구수영연맹',	management: '은평구체육회',	partners: '은평구청, 서울시체육회, 서울시수영연맹',	sponser: '',	link: '',	},
	{	competitionID: 34,	competitionName: '제3회 서울특별시연맹회장배 수영대회',	complete: false, upload: '',	datetime: '2017-11-25',	datetimeEnd: '',	course: 'LCM',	pool: '서울체육고등학교 수영장',	hosts: '',	management: '',	partners: '',	sponser: '',	link: '',	},
	{	competitionID: 35,	competitionName: '제18회 울산광역시교육감배 수영대회',	complete: false, upload: '',	datetime: '2018-04-01',	datetimeEnd: '',	course: 'LCM',	pool: '울산문수 실내수영장',	hosts: '',	management: '',	partners: '',	sponser: '',	link: '',	},
	{	competitionID: 36,	competitionName: '제3회 강동구연맹회장배 수영대회',	complete: false, upload: '',	datetime: '2018-07-01',	datetimeEnd: '',	course: 'LCM',	pool: '한국체육대학교 수영장',	hosts: '',	management: '',	partners: '',	sponser: '',	link: '',	},
	{	competitionID: 37,	competitionName: '제1회 양천구청장배 수영대회',	complete: false, upload: 'NO',	datetime: '2018-10-07',	datetimeEnd: '',	course: 'SCM',	pool: '양천구민체육센터',	hosts: '',	management: '',	partners: '',	sponser: '',	link: '',	},
	{	competitionID: 38,	competitionName: '제1회 성동구청장배 수영대회',	complete: false, upload: 'NO',	datetime: '2018-11-04',	datetimeEnd: '',	course: 'SCM',	pool: '성동구민체육센터',	hosts: '',	management: '',	partners: '',	sponser: '',	link: '',	},
	{	competitionID: 39,	competitionName: '제2회 성북구연맹회장기 수영대회',	complete: false, upload: 'NO',	datetime: '2018-11-04',	datetimeEnd: '',	course: 'SCM',	pool: '성북레포츠 센터',	hosts: '',	management: '',	partners: '',	sponser: '',	link: '',	},
	{	competitionID: 40,	competitionName: '제9회 랠리배 클럽대항 3차 수영대회 대회',	complete: false, upload: '',	datetime: '2018-12-01',	datetimeEnd: '',	course: 'LCM',	pool: '서울체육고등학교 수영장',	hosts: '',	management: '',	partners: '',	sponser: '',	link: '',	},
	{	competitionID: 41,	competitionName: '제3회 서대문구연맹회장배 수영대회',	complete: false, upload: 'NO',	datetime: '2019-04-07',	datetimeEnd: '',	course: 'SCM',	pool: '서대문문화체육회관 수영장',	hosts: '',	management: '',	partners: '',	sponser: '',	link: '',	},
	{	competitionID: 42,	competitionName: '2019 제1회 춘천 소양강배 전국 마스터즈 수영대회',	complete: false, upload: '',	datetime: '2019-05-18',	datetimeEnd: '2019-05-19',	course: 'LCM',	pool: '춘천국민체육센터 수영장',	hosts: '춘천시수영연맹',	management: '춘천시, 춘천시수영연맹',	partners: '춘천시, 춘천도시공사',	sponser: '',	link: '',	},
	{	competitionID: 43,	competitionName: '제2회 영등포구청장배 수영대회',	complete: false, upload: 'NO',	datetime: '2019-05-19',	datetimeEnd: '',	course: 'SCM',	pool: '영등포 제1스포츠센터',	hosts: '',	management: '',	partners: '',	sponser: '',	link: '',	},
	{	competitionID: 44,	competitionName: '제7회 송파구연맹회장기 수영대회',	complete: false, upload: '',	datetime: '2019-05-19',	datetimeEnd: '',	course: 'LCM',	pool: '한국체육대학교 수영장',	hosts: '',	management: '',	partners: '',	sponser: '',	link: '',	},
	{	competitionID: 46,	competitionName: '제2회 용산구연맹회장배 수영대회',	complete: false, upload: 'NO',	datetime: '2019-06-09',	datetimeEnd: '',	course: 'SCM',	pool: '용산구문화체육센터',	hosts: '',	management: '',	partners: '',	sponser: '',	link: '',	},
	{	competitionID: 47,	competitionName: '제2회 양천구청장배 수영대회',	complete: false, upload: 'NO',	datetime: '2019-06-23',	datetimeEnd: '',	course: 'SCM',	pool: '양천구민체육센터',	hosts: '',	management: '',	partners: '',	sponser: '',	link: '',	},
	{	competitionID: 48,	competitionName: '제8회 강서구연맹회장배 수영대회',	complete: false, upload: 'NO',	datetime: '2019-06-30',	datetimeEnd: '',	course: 'SCM',	pool: '강서구 마곡레포츠센터',	hosts: '',	management: '',	partners: '',	sponser: '',	link: '',	},
	{	competitionID: 49,	competitionName: '제9회 광진구연맹회장배 수영대회',	complete: false, upload: 'NO',	datetime: '2019-07-14',	datetimeEnd: '',	course: 'SCM',	pool: '광진문화예술회관(수영장)',	hosts: '',	management: '',	partners: '',	sponser: '',	link: '',	},
	{	competitionID: 50,	competitionName: '제40회 서울특별시장기 수영대회',	complete: false, upload: '',	datetime: '2019-08-10',	datetimeEnd: '2019-08-11',	course: 'LCM',	pool: '서울체육고등학교 수영장',	hosts: '',	management: '',	partners: '',	sponser: '',	link: '',	},
	{	competitionID: 51,	competitionName: '제12회 영등포구연맹회장배 수영대회',	complete: false, upload: 'NO',	datetime: '2019-09-29',	datetimeEnd: '',	course: 'SCM',	pool: '문래청소년수련관 수영장',	hosts: '영등포구 수영연맹',	management: '영등포구 수영연맹',	partners: '',	sponser: '',	link: '',	},
	{	competitionID: 52,	competitionName: '제19회 서대문구청장배 수영대회',	complete: false, upload: 'NO',	datetime: '2019-09-29',	datetimeEnd: '',	course: 'SCM',	pool: '서대문문화체육회관 수영장',	hosts: '',	management: '',	partners: '',	sponser: '',	link: '',	},
	{	competitionID: 53,	competitionName: '제2회 양천구연맹회장배 수영대회',	complete: false, upload: 'NO',	datetime: '2019-10-20',	datetimeEnd: '',	course: 'SCM',	pool: '양천구민체육센터',	hosts: '',	management: '',	partners: '',	sponser: '',	link: '',	},
	{	competitionID: 54,	competitionName: '2019 안산시장배 전국마스터즈',	complete: false, upload: '',	datetime: '2019-10-26',	datetimeEnd: '2019-10-27',	course: 'LCM',	pool: '안산시 올림픽수영장',	hosts: '안산시수영연맹',	management: '안산시체육회',	partners: '안산시.(주)랠리스포츠',	sponser: '',	link: '',	},
	{	competitionID: 55,	competitionName: '제4회 송파구청장기 수영대회',	complete: false, upload: '',	datetime: '2019-11-03',	datetimeEnd: '',	course: 'LCM',	pool: '한국체육대학교 수영장',	hosts: '',	management: '',	partners: '',	sponser: '',	link: '',	},
	{	competitionID: 56,	competitionName: '제2회 성동구청장기 수영대회',	complete: false, upload: 'NO',	datetime: '2019-11-03',	datetimeEnd: '',	course: 'SCM',	pool: '서울시 성동구민체육센터',	hosts: '',	management: '',	partners: '',	sponser: '',	link: '',	},
	{	competitionID: 57,	competitionName: '제1회 성북구청장기 수영대회',	complete: false, upload: 'NO',	datetime: '2019-11-03',	datetimeEnd: '',	course: 'SCM',	pool: '서울시 성북레포츠타운 수영장',	hosts: '',	management: '',	partners: '',	sponser: '',	link: '',	},
	{	competitionID: 58,	competitionName: '제1회 동작구연맹회장배 수영대회',	complete: false, upload: 'NO',	datetime: '2019-11-10',	datetimeEnd: '',	course: 'SCM',	pool: '서울시 동작구 여성플라자 스포츠센터 수영장',	hosts: '',	management: '',	partners: '',	sponser: '',	link: '',	},
	{	competitionID: 59,	competitionName: '제1회 강서구청장배 수영대회',	complete: false, upload: 'NO',	datetime: '2019-11-17',	datetimeEnd: '',	course: 'SCM',	pool: '서울시 강서구 마곡 레포츠 센터',	hosts: '',	management: '',	partners: '',	sponser: '',	link: '',	},
	{	competitionID: 60,	competitionName: '제4회 강동구연맹회장배 수영대회',	complete: false, upload: 'NO',	datetime: '2019-11-24',	datetimeEnd: '',	course: 'SCM',	pool: '서울시 강동구 온조대왕 수영장',	hosts: '',	management: '',	partners: '',	sponser: '',	link: '',	},
	{	competitionID: 61,	competitionName: '스포츠한마당 수영대회',	complete: false, upload: '',	datetime: '2019-11-24',	datetimeEnd: '',	course: 'LCM',	pool: '오산스포츠클럽 수영장',	hosts: '경기도수영연맹',	management: '경기도수영연맹',	partners: '',	sponser: '',	link: '',	},
	{	competitionID: 62,	competitionName: '제1회 전북수영연맹 회장배 유소년 마스터즈 수영대회',	complete: false, upload: '',	datetime: '2019-11-24',	datetimeEnd: '',	course: 'LCM',	pool: '전주완산수영장',	hosts: '전라북도수영연맹',	management: '전라북도청',	partners: '전주시체육회',	sponser: '',	link: '',	},
	{	competitionID: 63,	competitionName: '제1회 도봉구청장배 겸 제2회 도봉구연맹회장배 수영대회',	complete: false, upload: 'NO',	datetime: '2019-12-01',	datetimeEnd: '',	course: 'SCM',	pool: '창동문화 체육센터',	hosts: '',	management: '',	partners: '',	sponser: '',	link: '',	},
	{	competitionID: 64,	competitionName: '제5회 서울특별시연맹회장배 수영대회',	complete: false, upload: '',	datetime: '2019-12-07',	datetimeEnd: '',	course: 'LCM',	pool: '서울체육고등학교 수영장',	hosts: '',	management: '',	partners: '',	sponser: '',	link: '',	},
	{	competitionID: 65,	competitionName: '제4회 성동구연맹회장기 수영대회',	complete: false, upload: 'NO',	datetime: '2022-05-22',	datetimeEnd: '',	course: 'SCM',	pool: '성동구민종합체육센터(서울숲)수영장',	hosts: '성동구수영연맹',	management: '성동구수영연맹',	partners: '성동구청, 성동구수영연맹,성동구도시관리공단,서울특별시수영연맹',	sponser: '',	link: '',	},
	{	competitionID: 66,	competitionName: '2022 대전광역시장기 마스터즈 수영대회',	complete: false, upload: '',	datetime: '2022-06-25',	datetimeEnd: '2022-06-26',	course: 'LCM',	pool: '용운국제수영장',	hosts: '대전광역시체육회',	management: '대전광역시수영연맹',	partners: '',	sponser: '',	link: '',	},
	{	competitionID: 67,	competitionName: '제45회 부산수영연맹 회장배 수영대회',	complete: false, upload: '',	datetime: '2022-07-02',	datetimeEnd: '',	course: 'LCM',	pool: '사직실내수영장',	hosts: '부산광역시수영연맹',	management: '부산광역시수영연맹',	partners: '부산광역시체육회',	sponser: '',	link: '',	},
	{	competitionID: 68,	competitionName: '제1회 광주 전국 마스터즈 수영대회',	complete: false, upload: '',	datetime: '2022-07-23',	datetimeEnd: '2022-07-24',	course: 'LCM',	pool: '광주남부대시립국제수영장',	hosts: '광주광역시수영연맹',	management: '(사)대한수영연맹, 광주광역시',	partners: '문화체육관광부, 국민체육진흥공단, 대한체육회',	sponser: 'KB금융그룹, (주)배럴',	link: 'https://www.korswim.co.kr/schedule/detail/156',	},
	{	competitionID: 69,	competitionName: '2022 전국생활체육대축전 수영대회',	complete: false, upload: '',	datetime: '2022-09-03',	datetimeEnd: '2022-09-04',	course: 'LCM',	pool: '경기도 안산시 대부동 복지체육센터',	hosts: '',	management: '',	partners: '',	sponser: '',	link: '',	},
	{	competitionID: 70,	competitionName: '제42회 대구광역시장배 및 제12회 대구광역시장배 전국마스터즈 수영대회',	complete: false, upload: '',	datetime: '2022-09-17',	datetimeEnd: '2022-09-18',	course: 'LCM',	pool: '대구두류실내수영장',	hosts: '',	management: '대구광역시수영연맹',	partners: '',	sponser: '',	link: '',	},
	{	competitionID: 71,	competitionName: '2022 경기도지사배 수영대회',	complete: false, upload: '',	datetime: '2022-10-03',	datetimeEnd: '',	course: 'LCM',	pool: '안산 대부동 복지체육센터 수영장',	hosts: '경기도수영연맹',	management: '경기도수영연맹',	partners: '경기도, 경기도의회, 경기도체육회, 안산도시공사',	sponser: '',	link: '',	},
	{	competitionID: 72,	competitionName: '코리아 마스터즈 2022 대회',	complete: false, upload: '',	datetime: '2022-11-26',	datetimeEnd: '2022-11-27',	course: 'LCM',	pool: '김천실내수영장',	hosts: '경상북도수영연맹',	management: '대한수영연맹',	partners: '문화체육관광부, 국민체육진흥공단, 대한체육회, 김천시',	sponser: '',	link: '',	},

	{	competitionID: 110,	competitionName: '제20회 서대문구청장배 수영대회',	complete: false, upload: 'NO',	datetime: '2022-09-25',	datetimeEnd: '',	course: 'SCM',	pool: '서대문문화체육회관 수영장',	hosts: '',	management: '',	partners: '',	sponser: '',	link: '',	},
	{	competitionID: 111,	competitionName: '2022 안산시장배 전국마스터즈',	complete: false, upload: 'NO',	datetime: '2022-10-07',	datetimeEnd: '',	course: 'SCM',	pool: '',	hosts: '',	management: '',	partners: '',	sponser: '',	link: '',	},
	{	competitionID: 112,	competitionName: '2008 울산 전국마스터즈 수영대회',	complete: false, upload: '',	datetime: '2008-02-17',	datetimeEnd: '',	course: 'LCM',	pool: '',	hosts: '',	management: '',	partners: '',	sponser: '',	link: '',	},
	{	competitionID: 113,	competitionName: "제27회 Daejeon is U 전국마스터즈수영대회(경영) 및 제32회 대전광역시수영연맹회장기 수영대회",	complete: false, upload: '',	datetime: '2012-12-10',	datetimeEnd: '2012-12-11',	course: 'LCM',	pool: '용운국제수영장',	hosts: '대전광역시수영연맹',	management: '대전광역시수영연맹',	partners: '대전광역시체육회',	sponser: '',	link: '',	},
]

exports.CompetitionList = () => {
	return competitionList;
}
const timesHeader = [
	{ label: "#", column: "timeID", type: "n", width: 50, align: "right", },
	{ label: "조", column: "heatCode", type: "s", width: 50, },
	{ label: "heat", column: "heat", type: "s", width: 50, },
	{ label: "masters", column: "masters", type: "s", width: 50, },
	{ label: "adult", column: "adult", type: "s", width: 50, },
	{ label: "연령대", column: "ageGroup", type: "s", width: 80, },
	{ label: "성별", column: "gender", type: "s", width: 50, },
	{ label: "영법", column: "style", type: "s", width: 50, },
	{ label: "course", column: "course", type: "s", width: 50, },
	{ label: "거리", column: "distance", type: "s", width: 50, },
	{ label: "라운드", column: "round", type: "s", width: 50, },
	{ label: "레인", column: "lane", type: "s", width: 50, align: "right", },
	{ label: "선수", column: "name", type: "s", width: 100, },
	{ label: "나이", column: "age", type: "s", width: 50, },
	{ label: "출생연도", column: "birth", type: "s", width: 50, },
	{ label: "시도", column: "province", type: "s", width: 50, },
	{ label: "소속", column: "team", type: "s", width: 100, },
	{ label: "학교", column: "school", type: "s", width: 60, },
	{ label: "순위", column: "rank", type: "s", width: 50, align: "right", },
	{ label: "기록", column: "times", type: "s", width: 50, align: "right", },
	{ label: "기록org", column: "timeORG", type: "s", width: 50, },
	{ label: "비고", column: "remarks", type: "s", width: 50, },
	{ label: "상태", column: "status", type: "s", width: 50, },
	{ label: "날짜", column: "datetime", type: "s", width: 70, },
	{ label: "c#", column: "competitionID", type: "n", width: 50, },
	// { label: "대회명", column: "competitionName", type: "s", width: 200, },
	// { label: "dicipline", column: "dicipline", type: "s", width: 150, },

	// cid	masters	adult	gender	ageGroup	style	distance	round	name	team	rank	times
	{ label: "tid", column: "tid", type: "n", width: 50, align: "right", },
	{ label: "masters", column: "mongoMasters", type: "s", width: 50, align: "right", },
	{ label: "adult", column: "mongoAdult", type: "s", width: 50, },
	{ label: "연령대", column: "mongoAgeGroup", type: "s", width: 80, },
	{ label: "성별", column: "mongoGender", type: "s", width: 50, },
	{ label: "영법", column: "mongoStyle", type: "s", width: 50, },
	{ label: "course", column: "mongoCourse", type: "s", width: 50, },
	{ label: "라운드", column: "mongoRound", type: "s", width: 50, },
	{ label: "선수", column: "mongoName", type: "s", width: 100, },
	{ label: "소속", column: "mongoTeam", type: "s", width: 100, },
	{ label: "순위", column: "mongoRank", type: "s", width: 50, align: "right", },
	{ label: "기록", column: "mongoTimes", type: "s", width: 50, align: "right", },
	{ label: "상태", column: "mongoStatus", type: "s", width: 50, },
];

const timesMasterHeader = [
	// { label: "#", column: "no", type: "n", width: 30, },
	{ label: "timeID", column: "timeID", type: "s", width: 50, },
	{ label: "cid", column: "competitionID", type: "s", width: 50, },
	{ label: "competitionName", column: "competitionName", type: "s", width: 50, },
	{ label: "datetime", column: "datetime", type: "s", width: 40, },
	{ label: "course", column: "course", type: "s", width: 40, },
	{ label: "dir", column: "dir", type: "s", width: 150, },
	{ label: "pool", column: "pool", type: "s", width: 100, },
	{ label: "upload", column: "upload", type: "s", width: 50, },

	{ label: "category", column: "category", type: "s", width: 50, },
	{ label: "filename", column: "filename", type: "s", width: 100, },
	{ label: "ext", column: "ext", type: "s", width: 40, },
];

const competitionsHeader = [
	{ label: "c#", column: "competitionID", type: "n", width: 40, },
	{ label: "대회명", column: "competitionName", type: "s", width: 200, },
	{ label: "course", column: "course", type: "s", width: 40, },
	{ label: "날짜", column: "datetime", type: "s", width: 70, },
	{ label: "날짜", column: "datetimeEnd", type: "s", width: 70, },
	{ label: "pool", column: "pool", type: "s", width: 50, },

	{ label: "hosts", column: "hosts", type: "s", width: 50, },
	{ label: "management", column: "management", type: "s", width: 50, },
	{ label: "partners", column: "partners", type: "s", width: 50, },
	{ label: "sponser", column: "sponser", type: "s", width: 50, },
	{ label: "upload", column: "upload", type: "s", width: 50, },
];

exports.headers = [
	{ label:"No,NO,no,번호,순서,#", name: 'no' },
	{ label:"Name,NAME,name,이름,성명,선수명", name: 'name' },
	{ label:"Lane,LANE,lane,레인,게임", name: 'lane' },
	{ label:"age,나이,연령대,종별", name: 'age' },
	{ label:"school,School,SCHOOL,학교명", name: 'school' },
	{ label:"시도,시군구,시·도,장소,학교명", name: 'province' },
	{ label:"Team,TEAM,team,팀명,소속,소속팀,클럽명", name: 'team' },
	{ label:"Rank,RANK,rank,순위,등위", name: 'rank' },
	{ label:"Times,TIMES,times,기록,M. LAP", name: 'times' },
	{ label:"Remarks,REMARKS,remarks,비고,사유", name: 'remarks' },
	{ label:"competitionName,대회명", name: 'competitionName' },
	{ label:"학년", name: 'grade' },
	{ label:"라운드", name: 'round' },
	{ label:"구분", name: 'category' },
	{ label:"종목", name: 'style' },
	{ label:"그룹", name: 'ageGroup' },
	{ label:"성별", name: 'gender' },
	{ label:"경기번호", name: 'heat' },
	{ label:"mode,모드", name: 'mode' },
];

//=================================================
exports.getCompetition = async (competitionID) => {
	if (competitionID < 0) return competitionList;

	const query = {competitionID: competitionID };
	let result = await mongodb.findOne(mongoCFG.Medalbank.competitions, query, {_id:0}, { _id:1 }, mongoCFG.Medalbank.database);
	if (result.data.upload == "times") {
		console.log(`\n\ncompetitionID=${competitionID} exists !!!\n\n`);
		return null;
	}

	return competitionList.find(el => el.competitionID == competitionID);
}
//=================================================
exports.checkCompetition = (competitionID) => {
	if (competitionID < 0) return competitionList;

	return competitionList.find(el => el.competitionID == competitionID);
}

//=================================================
exports.updateCompetition = async (competition) => {
	const query = { competitionID: competition.competitionID };
	const result = await mongodb.updateOne(mongoCFG.Medalbank.competitions, query, competition, mongoCFG.Medalbank.database);
	// console.log(result, mongoCFG.Medalbank.competitions, query, competition, mongoCFG.Medalbank.database);
}

//=================================================
exports.insertTimes = async (times, competitionID) => {
	// console.log("0>insertTimes:", times[0], times.length);
	const query = {competitionID: competitionID };
	let result = await mongodb.findOne(mongoCFG.Medalbank.times, query, {_id:0}, { _id:1 });
// console.log("1>insertTimes:", result);
	if (!result.data.competitionID) {
		if (!times[0].timeID) {
			let timeID = await mongodb.max(mongoCFG.Medalbank.times, "timeID", {});
			times.forEach(time => time.timeID = timeID++);
		}

		result = await mongodb.insertMany(mongoCFG.Medalbank.times, times);
		console.log("2>insertTimes:", result.data.length);
	} else {
		console.log("times exists !!", result);
	}
}

//====================================================
exports.customTimes = (timeORG) => {
	let numbers = timeORG ? timeORG.toString().trim() : "";
	if (!numbers) return "";
	// if (numbers.length <= 5) {
	// 	const arr = numbers.split('.');
	// 	if (arr.length > 1) {
	// 		arr[1] = (arr[1]+"00").slice(0, 2);
	// 		numbers = arr.join('.');
	// 	}
	// }
	const arr = numbers.split('.');
	if (arr.length > 1) {
		arr[1] = (arr[1]+"00").slice(0, 2);
		numbers = arr.join('.');
	}

	const numberRegex = /\d/g; // /(\d+(\.\d+)?)/;
	// Extract numbers from the input string
	// console.log("1 numbers=>", numbers, numbers.match(numberRegex));
	numbers = numbers.match(numberRegex);
	if (!numbers) return "";	// 숫자 아닐경우
	numbers = numbers.join('');
	if (numbers.length < 4) numbers = (numbers+"0000").slice(0, 4);

	const str = "000000" + numbers;
	const mm = str.slice(-6,-4);
	const ss = str.slice(-4,-2);
	const tt = str.slice(-2);
	let newTimes = `${mm}:${ss}.${tt}`.replace("00:", "");
	// if (newTimes.length > 1 && newTimes.slice(0, 1) == "0") newTimes = newTimes.slice(1);

	return newTimes;
}
//====================================================
function customTimesOld(times) {
	times = times.replace(/\s|,|′|″/g, '').replace(/‘|'/g, ":").replace(/\"|“/g, ".");
	for (let no=0; no<times.length; no++) {
		if (!"0123456789.:".includes(times[no])) {
			times = times.slice(0, no);
			break;
		}
	}
	times = utilLibrary.deleteEndSpecialChar(times).trim();
	if (".:".includes(times.slice(0, 1))) times = times.slice(1);
	if (".:".includes(times.slice(0, 1))) times = times.slice(1);

	let min = "", sec = "", ttt = "";

	let arr = times.split('.');
	if (arr.length > 2) {	// mm.ss.ttt
		arr[0] = arr[0] + ":" + arr[1];
		ttt = arr[2];
	} else if (arr.length > 1) {	// mm:ss.ttt
		ttt = arr[1];
	}

	arr = arr[0].split(':');
	if (arr.length > 2) {	// mm:ss:ttt
		mm = arr[0];
		ss = arr[1];
		ttt = arr[2];
	} else if (arr.length > 1) {	// mm:ss
		mm = arr[0];
		ss = arr[1];
	} else {	// mmmm
		if (ttt) {
			mm = arr[0].slice(0, -2);
			ss = arr[0].slice(-2);
		} else {
			const str = "000000" + arr[0].slice(0, 6);
			mm  = str.slice(-6, -4);
			ss  = str.slice(-4, -2);
			ttt = str.slice(-2);
		}
	}
	if (!mm && ttt.length > 2) {	// mm:'', ss'11', ttt: '3456'
		mm = ss;
		ttt = "000" + ttt;
		ss  = ttt.slice(-4, -2);
		ttt = ttt.slice(-2);
	}
	if (ss.length > 2 && ttt == "") {
		ttt = (ss+"0").slice(2, 4);
		ss = ss.slice(0, 2);
	}

	if (isNaN(mm)) {
		console.log(`checkTimes.1> times=${times}, mm=${mm} error`);
		return "";
	} else {
		mm = Number(mm);
		if (mm > 59) {
			console.log(`checkTimes.1> times=${times}, mm=${mm} error`);
			return "";
		}
	}
	if (isNaN(ss)) {
		console.log(`checkTimes.2> times=${times}, ss=${ss} error`);
		return "";
	} else { // 34:82
		console.log(`checkTimes.2> times=${times}, s=${ss} error`);
		return "";
	}
	if (isNaN(ttt)) {
		console.log(`checkTimes.3> times=${times}, ttt=${ttt} error`);
		return "";
	} else {
		ttt = Number(ttt.slice(0, 2));
	}

	// const newTimes = mm + (mm ? ":" : "") + ss + (ss ? "." : "") + ttt;
	let newTimes = "";
	newTimes  = mm  > 0 ? utilLibrary.leadingZeros(mm,  2) + ":" : "";
	newTimes += utilLibrary.leadingZeros(ss,  2) + ".";
	if (newTimes) newTimes += utilLibrary.leadingZeros(ttt, 2);
	if (newTimes == "00:00.00" || newTimes == "00.00") newTimes = "";

	// if (newTimes == "00:00.00" || newTimes == "00.00") newTimes = "";
	// if (newTimes.slice(0, 3) == "00:") newTimes = newTimes.slice(3);	// 00:23.45 -> 23.45
	// if (newTimes.slice(0, 1) == ":") newTimes = newTimes.slice(1);	// ':25.34' -> '25.34'
	// if (newTimes.slice(1, 2) == ":") newTimes = "0" + newTimes;	// 1:23.45 -> 01:23.45
	// if (newTimes.length <= 2) newTimes = "0." + newTimes;

	// console.log("times=", times, "mm:", mm, "ss:", ss, "ttt:", ttt, "newTimes=", newTimes);
	// console.log("times=", times, "->", newTimes);

	return newTimes;
}

//=================================================
exports.checkTimes = (time) => {
	time.time = time.times ? time.times : time.time || '';
	delete time.times;
	if (! time.time) return time;
	if (!time.timeORG) time.timeORG = time.time;
	// console.log(time,time.time.toString());
	time.time = time.time.toString().replace("'", ":").replace('"', ".");
	
	//-----> times == number -> string
	if (typeof time.time == "number") {
		if (time.time < 1) {
			// time.time = time.times;
			time.time = utilDate.convertTimestamp2string(time.time);	
		} else {
			time.time = this.convertInt2Times(time.time);	
			// time.time = utilDate.convertString2Timestamp(time.times);
			// if (time.times.length <= 2) time.times = "0." + time.times;	
		}
	// } else {
	// 	time.times = time.times.replace("분", ':').replace("초", '.')
	}
	const times = this.customTimes(time.time);
	if (!times && !time.status) time.status = 'DNS';
	time.time = times;
	// if (time.times == "") { console.log(time); process.exit(); }
	//--------------------------------------------------------------------
	if (time.time) time.timeStamp = utilDate.convertString2Timestamp(time.time);
	//--------------------------------------------------------------------

	return time;
}

//=================================================
exports.convertInt2Times = (int) => {
	if (!int) return "";
	if (typeof int == 'number' && int < 60 && int.toString().length <= 2) {
		int = `${int}.00`;
	}
	if (typeof int == "string") int = utilLibrary.deleteEndSpecialChar(int).trim();
	if (isNaN(int)) {
		const arr = int.trim().split(' ');
		int = arr[0];					
	}

  let str = "", digits = "";
	if (typeof int == 'number') {
		if (int < 100) return utilLibrary.leadingZeros(int, 2)
		str = int.toString();
		if (str.includes('.')) {
			const arr = str.split('.');
			digits = `${("00"+arr[0]).slice(-2)}.${(arr[1]+"00").slice(0, 2)}`;
			str = arr[0].length > 2 ? arr[0].slice(0, -2) : "";
		} else {
			digits = `.${str.slice(-2)}`;
			str = str.slice(0, -2);
			digits = `${str.slice(-2)}${digits}`;	
			str = str.slice(0, -2);
		}
		if (int >= 10000) {
			digits = `${str.slice(-2)}:${digits}`;
		}
	} else {
		digits = int.replace(/‘|'/g, ":").replace(/\"|“/g, ".");
	}
	if (digits.slice(0, 2) == "0:") digits = digits.slice(2);

  return digits;
}
//=================================================
exports.checkGender = (time) => {
	if (time.gender && ["women","men", "mixed"].includes(time.gender.toLowerCase())) return time.gender.toLowerCase();

	if ("남자".includes(time.gender) && "여자".includes(time.gender)) {
		console.log(`1:gender> 남,여 모두 있음 !! ${time.name}, ${time.times}, ${time.gender}, ${time.ageGroup}`);
		// console.log(`1:gender> 남,여 모두 있음 !! `, time); process.exit();
	}
	else if ("남자,남성".includes(time.gender)) 	time.gender = "men";
	else if ("여자,여성".includes(time.gender)) time.gender = "women";
	else if ("혼성".includes(time.gender)) time.gender = "mixed";
	else console.log(`2:gender 남,여 없음 !! > ${time.name}, ${time.times}, ${time.gender}, ${time.ageGroup}`);
	return time.gender;
}
//=================================================
exports.checkAdult = (time) => {
	if (time.category == "junior") return false;
	const ageGroup = (time.ageGroup||'').replace(/ /gi, '');
	const ck = _juniors.find(el => ageGroup.includes(el));
	const adult = ck == undefined ? true : false;
	
	return adult
}

//=================================================
exports.customizingTimes = (times) => {
	let time = times;
	return time
}

//=================================================
exports.getHeaders = (type="times") => {
	return (type == "competitions" ? competitionsHeader : (type == "times" ? timesHeader : timesMasterHeader));
}
//=================================================
exports.writeNewRecordExcel = async (filename, recordArr, type="times") => {
	header = (type == "competitions" ? competitionsHeader : (type == "times" ? timesHeader : timesMasterHeader));
  console.log("++++++++", filename);
  // filename = "times.xlsx";

  // await excel.write_excel(filename, recordArr, header);
  await write_excel_sheet_new(filename, recordArr, header);
}

//=================================================
exports.writeNewRecordExcelSheet = async (filename, recordArr, type="times") => {
	header = (type == "competitions" ? competitionsHeader : (type == "times" ? timesHeader : timesMasterHeader));
  console.log("++++++++", filename);
  // filename = "times.xlsx";

  await excel.write_excel_sheet(filename, recordArr, header);
}

//=================================================
exports.readTimesExcel = async (filename) => {
	const result = await excel.read_excel_org(filename, this.headers);

	const timeArr = [];
	result.forEach((elem) => {
		const time = JSON.parse(JSON.stringify(elem));

		if (typeof time.datetime == 'number') time.datetime = utilDate.number2Date(time.datetime);
		delete time.sheet;

		if (time.name1) {
			if ("1위,성명,이름".indexOf(time.name1.replace(/ /gi, '')) >= 0) return;
	
			for (let no=1; no<=8; no++) {
				// const tm = JSON.parse(JSON.stringify(time));
				if (time[`name${no}`]) {
					const tm = {
						name	: time[`name${no}`],
						team	: time[`team${no}`],
						times	: time[`times${no}`], // .replace(/대회신|대회타이|한국신|세계신/g, "").trim(),
						rank	: no,
					};
					if (time.style		) tm.style 		= time.style;
					if (time.distance	) tm.distance = time.distance;
					if (time.gender		) tm.gender 	= time.gender;
					if (time.ageGroup	) tm.ageGroup = time.ageGroup;
					if (time.round		) tm.round 		= time.round;
					if (time.heat			) tm.heat 		= time.heat;
					if (time.heatCode	) tm.heatCode	= time.heatCode;
					if (time.status		) tm.status 	= time.status;
					if (time.sido			) tm.sido 		= time.sido;

					// console.log("2####", tm.name, tm.times, time);
					timeArr.push(tm);
				}	
			}

			for (let no=1; no<=8; no++) {
				delete time[`name${no}`];
				delete time[`team${no}`];
				delete time[`times${no}`];
			}
		} else {
			// if ("Lane,LANE,lane,레인,게임".indexOf(time.lane) < 0) {
			// 	timeArr.push(time);
			// }
			timeArr.push(time);
		}
	})
	// console.log(result.slice(-25), timeArr.length);
	return timeArr;
}

//=================================================
exports.checkStatus = (time) => {

	if (time.times && typeof time.times == "string" && ["DQ","DSQ","DNS","NT","불참","실격","포기","번외"].includes(time.times.toUpperCase()) ) {
		time.note = time.times; // ["DNS","포기","불참"].includes(time.times.toUpperCase()) ? "DNS" : "DQ";
		time.times = "";
	} else if (time.rank && ["DQ","DSQ","DNS","NT","불참","실격","포기","번외"].includes(time.rank.toString().toUpperCase())) {
		time.note = time.rank; // ["DNS,포기,불참"].includes(time.rank.toString().toUpperCase()) ? "DNS" : "DQ";
		time.rank = "";
	} else if (time.rank && isNaN(time.rank)) {
		time.note = time.rank;
		time.rank = "";
	}

	if (time.remarks && !time.note) {
		time.note = time.remarks;
		delete time.remarks;
	}

	if (time.note) {
		time.note = time.note.toString();
		if (time.note.includes("DNS") || time.note.includes("불참") || time.note.includes("포기"))	time.status = "DNS";
		else if (time.note.includes("DQ"))    time.status = "DQ";
		else if (time.note.includes("DSQ"))   time.status = "DQ";
		else if (time.note.includes("NT"))	  time.status = "NT";
		else if (time.note.includes("번외"))	 time.status = "번외";
		else if (time.note.includes("실격"))	 time.status = "실격";
		time.note = time.note.replace(/DNS|DQ|DSQ|NT|번외|포기|실격|불참/gi, "").trim();
	}
	return time;
}

exports.splitDiscipline = (ageGroup) => {
	console.log("splitDiscipline.ageGroup:", ageGroup);
	const discipline = {};
	discipline.discipline = ageGroup.replace(/\s{2,}/g, ' ').trim();

	ageGroup = ageGroup.replace("혼성", " 혼성 ").replace(/ \/ | \/|\/ /, '/').replace(/\s{2,}/g, ' ').toUpperCase();

	const arr = ageGroup.trim().split(' ');
	// 1. gender: "여자,남자,남·여,남여,남,여"
	// 2. style: "접영핀,배영핀,평영핀,자유형핀,개인혼영,혼성계영,혼계영,계영,혼성혼계영,핀계영"
	// 3. distance: "25M,50M,100M,200M,400M,800M,100M,1500M"
	// 4. round: "준결승,결승,예선,기록회"

	let no = 0;
	if (!isNaN(arr[0].replace(/-|,|./g, ""))) {		
		discipline.heat = arr[0];
		no++;
	}

	for (let key of arr) {
		if (!key) return;
		
		const pattern = /핀|fin/gi;
		if (pattern.test(key)) {
			discipline.fin = true;
			key = key.replace(/fin|핀/gi, "");
		}

		let find = _styles.find(el => key.includes(el));
		if (find) {
			discipline.style = find;
			key = key.replace(find, "").trim();
			if (key) arr.push(key)
		}
		else if (key.includes('핀')) {
			discipline.fin 		= '핀';
			key = key.replace('핀', "").trim();
			if (key) arr.push(key)
		}
		else if (_genders.find(el 	=> key.includes(el))) discipline.gender 	= key;
		else if (_distances.find(el=> key.includes(el))) discipline.distance = key;
		else if (_rounds.find(el 	=> key.includes(el))) discipline.round 		= key;
	}

	Object.keys(discipline).forEach(el => {
		if (el != "discipline") {
			if (el == 'round' && ["기록회", "타임레이스"].includes(discipline[el])) {
				//
			} else {
				ageGroup = ageGroup.replace(discipline[el], '');
			}
		} else {
			if (discipline[el].includes("기록회")) {
				discipline.masters = false;
			}
		}
	})
	// ageGroup에 "남자/여자"
	if ((ageGroup.includes("남") || ageGroup.includes("여")) && !discipline.gender) {
		console.log("\n\n\n남자/여자 ------------------->", time, "\n\n");
		// process.exit();
	}

	if (ageGroup) discipline.ageGroup = ageGroup.replace(/\s{2,}/g, ' ').trim();

	// discipline.ageGroup = discipline.ageGroup || "";
	if (["혼성계영","혼성혼계영"].includes(discipline.style) && !discipline.distance) discipline.distance = "200M";
	if (!discipline.gender && discipline.style && discipline.style.includes("혼성")) discipline.gender = "mixed";
	
	discipline.heat = utilLibrary.deleteEndSpecialChar(discipline.heat);
	// if (!discipline.adult) {
	// 	const ck = _juniors.find(el => discipline.discipline.includes(el));
	// 	discipline.adult = ck == undefined ? true : false;		
	// }

	return discipline;
}
//=================================================
exports.checkDiscipline = (time) => {
	const discipline = {};

	if (!time.lane) return discipline;

	if (!time.lane && time.style && time.style.length > 6) time.lane = time.style;
	time.lane = time.lane ? time.lane.toString() : "";
	if (time.lane.length < 5) return discipline;

	let ageGroup = "";

	if (time.style && time.style.length > 6) {
		ageGroup = time.style;	
	} else if (time.lane && time.lane.length > 5) {
		ageGroup = time.lane;
	} else return discipline;

	return this.splitDiscipline(ageGroup);
}


//=================================================
exports.buildIndex = (time) => {
	const indexes = [];
	// const name = !time.name ? "" : time.name.replace(/\r|\n/g, ",").replace(/,{2,}/g, ',');
	if (time.name != '') {
		const arr = time.name.split(',');
		arr.forEach(el => {
			str = el.replace(/ /gi, '');
			if (str.length <= 4) {
				str = utilLibrary.normalizeString(str);
			}
			if (!indexes.find(el => el==str)) indexes.push(str);
		})
	}
	if (time.team) {
		str = utilLibrary.normalizeString(time.team);
		if (!indexes.find(el => el==str)) indexes.push(str);
		if (time.individual && time.name && time.name != time.team) {
			str = utilLibrary.normalizeString(time.name + time.team);
			if (!indexes.find(el => el==str)) indexes.push(str);
		}
	}

	return indexes;

}

//=================================================
exports.mergeTimes2Athletes = (timeArr, athleteID) => {
	fs.writeFileSync("mergeLOG.txt", "");

	let times =[];
	const athletes = {};
	for (const time of timeArr) {
		try {
			const category = time.adult == false ? "junior" : "masters";

			const discipline = `${category}-${time.gender}-${time.ageGroup}-${time.name}-${time.team}`
			if (! athletes[discipline]) {
				const json = {
					discipline: discipline,
					masters		: time.masters,
					individual: time.individual,
					adult			: time.adult,
					gender		: time.gender,
					ageGroup	: time.ageGroup,
					name			: time.name,
					names			: time.names,
					nameHide	: time.nameHide,
					team			: time.team,
					// teamID		: time.teamID,
					nameComp	: `${time.name}-${time.competitionID}`,
					// competitionIDs: [ time.competitionID ],
					times			: [],
					note			: time.name,
				}
				if (time.teamID)		json.teamID = time.teamID;
				if (time.team)			json.note += "-" + time.team;
				if (time.dob)				json.dob = time.dob;
				if (time.sido)			json.sido = time.sido;
				if (json.individual) { // 개인
					json.names = [ json.name ];
				} else { // 단체
					json.names = json.name.split(',');
				}
				athletes[discipline] = json;
			}
			athletes[discipline].times.push({ style: time.style + "-" + time.distance, timeID: time.timeID });
		} catch (e) {
			console.log(time, "catch.", e);
			process.exit(0);
		}
	} // end for
	// console.log(athletes);

	let times2 = 0, styles = 0;

	const athleteArr = [];

	Object.keys(athletes).forEach(key => {
		const athlete = athletes[key];

		let check = true;
		if (athlete.times.length > 2) {
			// console.log(athlete.times.length, "--->", athlete);
			times2++;
			check = false;
		}
		if (athlete.times.length == 2) {
			if (athlete.times[0].style == athlete.times[1].style) {
				// console.log("same style =====>", athlete);
				styles++;
				check = false;
			}
		}

		if (check) {
			athlete.athleteID = athleteID++;
			athleteArr.push(athlete);
		}

	})

	return { athletes: athleteArr, times2, styles, athleteID };
}


//=================================================
//	customizing 대회 완성 times
exports.customCompleteTimes = (times, _competition) => {

	let oldTime = {
		no				: "",
		ageGroup	: "",
		gender		: "",
		style			: "",
		distance	: "",
		round			: "",
		datetime	: "",
		heat			: "",
	};

	times.forEach(time => {

		try {
			time.no 			= time.no 			|| oldTime.no;
			time.ageGroup = time.ageGroup || oldTime.ageGroup;
			time.gender 	= time.gender 	|| oldTime.gender;
			time.style 		= time.style 		|| oldTime.style;
			time.distance = time.distance || oldTime.distance;
			time.round 		= time.round 		|| oldTime.round;
			time.datetime = time.datetime || oldTime.datetime;
			time.heat 		= time.heat 		|| oldTime.heat;
			time.team 		= time.team 		|| "";
			//----------------------------
			time.course 	= _competition.course;

			const names = [];
			time.name = time.name || "";

			if (time.name) names.push(time.name);
			if (time.name1) { names.push(time.name1); delete time.name1; }
			if (time.name2) { names.push(time.name2); delete time.name2; }
			if (time.name3) { names.push(time.name3); delete time.name3; }
			time.name = names.join(",");
			// customizing name
			time.name = utilLibrary.deleteEndSpecialChar(time.name);
			// time.name = time.name.replace(/\n|\r|\t/gi, ',').replace(/,{2,}/g, ',');

			const arr = time.name.split(',');
			if (arr.length < 4) {
				time.name = time.name.replace(/,/g, ' ').replace(/\s{2,}/g, ' ');
			}
			// if (time.names && time.names.length == 0 && time.name) time.names =  time.name.split(',');

			if (time.mode) { // mode: pro -> masters: false
				time.masters = false;
				delete time.mode;
			}

			if (time.times == undefined) {
				time.time == "";
			} else {
				if (typeof time.time == 'number') {
					time.time 		= utilDate.convertTimestamp2string(time.time);
				} else {
						time.time 		= utilDate.convertString2Timestamp(time.time);
				}
			}
			// console.log("+++++++", time.times, typeof time.times, time.time);
			if (isNaN(time.rank) && !time.status) {
				time.status = time.rank;
				time.rank= '';
			}
	
			// time.category = time.sheet.includes("학생") ? "junior" : "masters";
			// time.type = time.sheet.includes("단체") ? "team" : "individual";
			time.adult = time.sheet.includes("학생") ? false : true;
			time.individual = time.sheet.includes("단체") ? false : true;
			delete time.sheet;

			// time.dicipline = round;
			time.competitionID 	= _competition.competitionID;
			// time.competitionName= _competition.competitionName;
			time.pool 					= _competition.pool;
			if (typeof time.datetime == 'number') time.datetime = utilDate.number2Date(time.datetime);
	
			//----------------------------
			oldTime = {
				no				: time.no 			|| "",
				ageGroup	: time.ageGroup || "",
				gender		: time.gender 	|| "",
				style			: time.style 		|| "",
				distance	: time.distance || "",
				round			: time.round 		|| "",
				datetime	: time.datetime || "",
				heat			: time.heat 		|| "",
			}	
		} catch (e) {
			console.log("time=", time);
			console.log(e);
			process.exit(0);
		}
	}) // forEach

	return times;
}

//============================================
async function write_excel_sheet_new(filename, rows, header=timesHeader) {
	const alpha = ["A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R","S","T","U","V","W","X","Y","Z","AA","AB","AC","AD","AE","AF","AG","AH","AI","AJ","AK","AL","AM","AN","AO","AP","AQ","AR","AS","AT","AU","AV","AW","AX","AY","AZ"];

	console.log("=====================>",  filename, rows.length);
	XlsxPopulate.fromBlankAsync().then(async (workbook) => {
		// Get the first sheet
		const sheet = workbook.sheet(0);

		let rowno = 1;
		//{ label: "#", column: "timeID", type: "n", width: 30, },
		for (let col=0; col < header.length; col++) {
			const style = {
				fontSize						: header[col].fontSize	? header[col].fontSize 	: 10,
				fontColor						: header[col].fontColor ? header[col].fontColor : _color.Black,
				fill								: header[col].backColor ? header[col].backColor : _color.greyLight,
				bold								: header[col].bold 	 != undefined ? header[col].bold 			: false,
				italic							: header[col].italic != undefined ? header[col].italic 		: false,
				horizontalAlignment	: "center",
				verticalAlignment		: "center",
			};

			if (col >= 24) style.fill = _color.Cyan;
			sheet.cell(`${alpha[col]}${rowno}`).value(header[col].label).style(style);
			// sheet.cell(`${alpha[col]}1`).style({ fontSize: 10, fontColor: _color.Black, fill: _color.greyLight, bold: true, italic: true, horizontalAlignment: "center", verticalAlignment: "center", });
			
			// Set cell width (column A)
			sheet.column(alpha[col]).width(header[col].width ? header[col].width / 8 : defaultWidth);

			// Set cell height (column A)
			sheet.row(rowno).height(header[col].height ? header[col].height : defaultHeight);

		}

		
		//{ label: "#", column: "timeID", type: "n", width: 30, align: "left|center|right", valign: "top|center|bottom", fontSize, fontColor, fill, bold, italic },
		//------------------------------
		for (let row=0; row < rows.length; row++) {
			rowno++;
			//------------------------------
			for (let col=0; col < header.length; col++) {
				const style = {
					fontSize						: header[col].fontSize	? header[col].fontSize 	: 10,
					fontColor						: header[col].fontColor ? header[col].fontColor : _color.Black,
					fill								: header[col].backColor ? header[col].backColor : _color.White,
					bold			: header[col].bold != undefined 	? header[col].bold 			: false,
					italic		: header[col].italic != undefined ? header[col].italic 		: false,
					horizontalAlignment	: header[col].align 		? header[col].align 		: header[col].type == 'n' ? "right" : "left",
					verticalAlignment		: header[col].valign 		? header[col].valign 		: "center",
				};
				if (col == 24) style.fill = _color.GreyDark;

				sheet.cell(`${alpha[col]}${rowno}`).value(rows[row][header[col].column]);

				const field = customFields.find(fld => fld.mongoField == header[col].column || fld.field == header[col].column);
				if (field) {
					// if (rows[row][field.field] == "DNS") {
					// 	console.log("status.DNS");
					// }

					const match = setcolumnStyle(rows[row], field.field, field.mongoField);
					if (match) {
						style.fill = _color.Yellow;
					}
				}
				sheet.cell(`${alpha[col]}${rowno}`).style(style);
				// sheet.cell(`${alpha[no]}1`).style({ fontSize: 10, fontColor: _color.Black, fill: _color.greyLight, bold: true, italic: true, horizontalAlignment: "center", verticalAlignment: "center", });
			} // end for col
			//------------------------------ 

			// Set cell height (column A)
			sheet.row(rowno).height(header[0].height ? header[0].height : defaultHeight);

			// Set cell border style
			const cellRange = sheet.range(`A${rowno}:${alpha[header.length-1]}${rowno}`);
			cellRange.style({ border: true });
		
		} // end for row
		//------------------------------

		console.log("bf toFileAsync...");

		writeExcel(workbook, filename);
		// return workbook.toFileAsync(filename).then(() => {
		// 	console.log("toFileAsync...OK");
		// }).catch(err => {
		// 	console.log("toFileAsync...catch", err);
		// });


		console.log("af toFileAsync...");
	}).then(() => {
		console.log("File saved successfully!");
	}).catch(error => {
		console.error("Error occurred:", error);
	});

}

async function writeExcel(workbook, filename) {
	await new Promise((resolve, reject) => {
		// Save the workbook as a file
		workbook.toFileAsync(filename);
		resolve();
	});		
}


function setcolumnStyle(row, field, mongoField) {
	return (row[mongoField]	!= row[field]	);
}
