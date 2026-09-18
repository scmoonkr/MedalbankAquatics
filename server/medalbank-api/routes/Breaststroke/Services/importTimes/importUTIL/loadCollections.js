
const multiSort   = require('multisort');
const mskCFG 			= require('../../../Config/mskCFG');
const mongoCFG 		= require('../../../Config/mongoCFG');
const mongoDB			= require('../../../Class/MongoDB');
const mongodb 	  = new mongoDB(mongoCFG.Medalbank.database);
const { Config }	= require('./config');

const uploadedCompetitions = [
	2, 3, 4, 5, 6, 7, 8, 9,
	10, 11, 13, 14, 15, 16, 18, 19,
	21, 29,
	31, 34, 36,
	40, 42, 44,
	50, 54, 55,
	64, 66, 67, 68, 69,
	70, 71,
	110, 112,113,
	1049, 1063, 1099,
	1146,	1148,	1164,	1165,
	1220,	1239,	1248,	1292
];

//-------------------------------
//-------------------------------
exports.competitions = [];
exports.teams = [];
exports.pools = [];
exports.athletes = [];
exports.times = [];
exports.collections = {
	competitions: [],
	teams: [],
	pools: [],
	athletes: [],
	times: [],
}
//-------------------------------
//-------------------------------

//=======================================================
exports.loadCompetitions1 = async () => {
	const context = {
		// query: { competitionID: { $in: uploadedCompetitions } },
		projection: {_id:0, competitionID:1, fullname:1, order:1, sido:1, stem:1, stemID:1, poolID:1, pool:1, year:1, dateStart:1, },
		limit: 100000,
		skip: 0,
		sort: { competitionID:1 },
	}
	const result = await mongodb.find(mongoCFG.Medalbank.competitions, context);
	return result.data;
}

//=======================================================
exports.loadTeams1 = async () => {
	const teamArr = [
		{
			"teamID": 1,
			"name": "2PM",
			"nameKor": "",
			"nameEng": "2PM",
			"names": [
				"2PM"
			]
		},
		{
			"teamID": 2,
			"name": "2X",
			"nameKor": "",
			"nameEng": "2X",
			"names": [
				"2X"
			]
		},
		{
			"teamID": 3,
			"name": "45YOUNG",
			"nameKor": "",
			"nameEng": "45Young",
			"names": [
				"45YOUNG",
				"45Young",
				"45young"
			]
		},
		{
			"teamID": 4,
			"name": "6AM",
			"nameKor": "",
			"nameEng": "6AM",
			"names": [
				"06.A.M",
				"6A",
				"6AM"
			]
		},
		{
			"teamID": 5,
			"name": "A+SWIM",
			"nameKor": "",
			"nameEng": "A+SWIM",
			"names": [
				"A+SWIM"
			]
		},
		{
			"teamID": 6,
			"name": "에이블",
			"nameKor": "에이블",
			"nameEng": "ABLE",
			"names": [
				"ABLE"
			]
		},
		{
			"teamID": 7,
			"name": "아가미",
			"nameKor": "아가미",
			"nameEng": "Agami",
			"names": [
				"Agami",
				"아가미"
			]
		},
		{
			"teamID": 8,
			"name": "AHA",
			"nameKor": "",
			"nameEng": "AHA",
			"names": [
				"AHA"
			]
		},
		{
			"teamID": 9,
			"name": "AKAMIS",
			"nameKor": "",
			"nameEng": "AKAMIS",
			"names": [
				"AKAMIS"
			]
		},
		{
			"teamID": 10,
			"name": "AOST",
			"nameKor": "",
			"nameEng": "AOST",
			"names": [
				"AOST",
				"AOSTA",
				"AOSTB",
				"aost"
			]
		},
		{
			"teamID": 11,
			"name": "ARONPS",
			"nameKor": "",
			"nameEng": "ARONPS",
			"names": [
				"ARONPS"
			]
		},
		{
			"teamID": 12,
			"name": "어벤져스",
			"nameKor": "어벤져스",
			"nameEng": "AVENGERS",
			"names": [
				"AVENGERS",
				"AVENGERS1",
				"AVENGERS2",
				"AVENGERS3",
				"AVENGERS4"
			]
		},
		{
			"teamID": 13,
			"name": "보스",
			"nameKor": "보스",
			"nameEng": "Boss",
			"names": [
				"Boss"
			]
		},
		{
			"teamID": 14,
			"name": "BTS",
			"nameKor": "",
			"nameEng": "BTS",
			"names": [
				"BTS"
			]
		},
		{
			"teamID": 15,
			"name": "부천",
			"nameKor": "부천",
			"nameEng": "BUCHEON",
			"names": [
				"BUCHEON"
			]
		},
		{
			"teamID": 16,
			"name": "C.A.T.C.H.",
			"nameKor": "",
			"nameEng": "C.A.T.C.H.",
			"names": [
				"C.A.T.C.H",
				"C.A.T.C.H."
			]
		},
		{
			"teamID": 17,
			"name": "C.SWIM",
			"nameKor": "",
			"nameEng": "C.SWIM",
			"names": [
				"C.SWIM"
			]
		},
		{
			"teamID": 18,
			"name": "CC",
			"nameKor": "",
			"nameEng": "CC",
			"names": [
				"CC"
			]
		},
		{
			"teamID": 19,
			"name": "CH",
			"nameKor": "",
			"nameEng": "CH",
			"names": [
				"CH"
			]
		},
		{
			"teamID": 20,
			"name": "CHANGWONTEAMF.O.S",
			"nameKor": "",
			"nameEng": "ChangwonTeamf.o.s",
			"names": [
				"Changwonteamf.o.s"
			]
		},
		{
			"teamID": 21,
			"name": "CHO",
			"nameKor": "",
			"nameEng": "CHO",
			"names": [
				"CHO"
			]
		},
		{
			"teamID": 22,
			"name": "CHOS",
			"nameKor": "",
			"nameEng": "CHOS",
			"names": [
				"CHOS"
			]
		},
		{
			"teamID": 23,
			"name": "CRS",
			"nameKor": "",
			"nameEng": "CRS",
			"names": [
				"CRS"
			]
		},
		{
			"teamID": 24,
			"name": "CST",
			"nameKor": "",
			"nameEng": "CST",
			"names": [
				"CST"
			]
		},
		{
			"teamID": 25,
			"name": "D,JLOVESWIM",
			"nameKor": "",
			"nameEng": "D,JLOVESWIM",
			"names": [
				"D,JLOVESWIM"
			]
		},
		{
			"teamID": 26,
			"name": "데일리스윔",
			"nameKor": "데일리스윔",
			"nameEng": "DailySwim",
			"names": [
				"DailySwim"
			]
		},
		{
			"teamID": 27,
			"name": "DASC",
			"nameKor": "",
			"nameEng": "DASC",
			"names": [
				"DASC"
			]
		},
		{
			"teamID": 28,
			"name": "DC",
			"nameKor": "",
			"nameEng": "DC",
			"names": [
				"DC"
			]
		},
		{
			"teamID": 29,
			"name": "DC수경갤",
			"nameKor": "",
			"nameEng": "DC수경갤",
			"names": [
				"DC수경갤",
				"DC수경갤"
			]
		},
		{
			"teamID": 30,
			"name": "DC수상스포츠갤러리",
			"nameKor": "",
			"nameEng": "DC수상스포츠갤러리",
			"names": [
				"DC수상스포츠갤러리",
				"DC수스갤",
				"DC수스겔"
			]
		},
		{
			"teamID": 31,
			"name": "DENS",
			"nameKor": "",
			"nameEng": "DENS",
			"names": [
				"DENS"
			]
		},
		{
			"teamID": 32,
			"name": "DND",
			"nameKor": "",
			"nameEng": "DND",
			"names": [
				"DND"
			]
		},
		{
			"teamID": 33,
			"name": "DPS",
			"nameKor": "",
			"nameEng": "DPS",
			"names": [
				"DPS"
			]
		},
		{
			"teamID": 34,
			"name": "드림",
			"nameKor": "드림",
			"nameEng": "Dream",
			"names": [
				"Dream"
			]
		},
		{
			"teamID": 35,
			"name": "DSC",
			"nameKor": "",
			"nameEng": "DSC",
			"names": [
				"D-S-C",
				"DSC"
			]
		},
		{
			"teamID": 36,
			"name": "DSS",
			"nameKor": "",
			"nameEng": "DSS",
			"names": [
				"DSS"
			]
		},
		{
			"teamID": 37,
			"name": "이지스윔",
			"nameKor": "이지스윔",
			"nameEng": "EZSwim",
			"names": [
				"EZSWIM",
				"EZSwim",
				"이지스윔"
			]
		},
		{
			"teamID": 38,
			"name": "G.Y마스터즈",
			"nameKor": "",
			"nameEng": "G.Y마스터즈",
			"names": [
				"G.Y마스터즈"
			]
		},
		{
			"teamID": 39,
			"name": "GMSC",
			"nameKor": "",
			"nameEng": "GMSC",
			"names": [
				"GMSC"
			]
		},
		{
			"teamID": 40,
			"name": "광주마스터즈수영클럽",
			"nameKor": "광주마스터즈수영클럽",
			"nameEng": "GM수영클럽",
			"names": [
				"GM수영클럽",
				"GM수영클럽NBU",
				"GM수영클럽NBUA",
				"GM수영클럽NBUB",
				"GM수영클럽NBUC"
			]
		},
		{
			"teamID": 41,
			"name": "지피지",
			"nameKor": "지피지",
			"nameEng": "GPG",
			"names": [
				"GPG",
				"GPGA",
				"GPGB",
				"gpg"
			]
		},
		{
			"teamID": 42,
			"name": "GSC",
			"nameKor": "",
			"nameEng": "GSC",
			"names": [
				"GSC"
			]
		},
		{
			"teamID": 43,
			"name": "지스윔",
			"nameKor": "지스윔",
			"nameEng": "GSWIM",
			"names": [
				"GSWIM",
				"GSWIMA",
				"GSWIMB"
			]
		},
		{
			"teamID": 44,
			"name": "GTS",
			"nameKor": "",
			"nameEng": "GTS",
			"names": [
				"GTS"
			]
		},
		{
			"teamID": 45,
			"name": "HGD",
			"nameKor": "",
			"nameEng": "HGD",
			"names": [
				"HGD"
			]
		},
		{
			"teamID": 46,
			"name": "HOF",
			"nameKor": "",
			"nameEng": "HOF",
			"names": [
				"HOF"
			]
		},
		{
			"teamID": 47,
			"name": "HOWTOSWIM",
			"nameKor": "",
			"nameEng": "howtoswim",
			"names": [
				"howtoswim"
			]
		},
		{
			"teamID": 48,
			"name": "HT샤무",
			"nameKor": "",
			"nameEng": "HT샤무",
			"names": [
				"HT샤무"
			]
		},
		{
			"teamID": 49,
			"name": "HWDSWIM",
			"nameKor": "",
			"nameEng": "HWDSWIM",
			"names": [
				"HWDSWIM"
			]
		},
		{
			"teamID": 50,
			"name": "HWS",
			"nameKor": "",
			"nameEng": "HWS",
			"names": [
				"HWS"
			]
		},
		{
			"teamID": 51,
			"name": "I.S.C",
			"nameKor": "",
			"nameEng": "I.S.C",
			"names": [
				"I.S.C"
			]
		},
		{
			"teamID": 52,
			"name": "IGC",
			"nameKor": "",
			"nameEng": "IGC",
			"names": [
				"IGC",
				"IGC67"
			]
		},
		{
			"teamID": 53,
			"name": "IM2000",
			"nameKor": "",
			"nameEng": "IM2000",
			"names": [
				"IM2000"
			]
		},
		{
			"teamID": 54,
			"name": "IMS",
			"nameKor": "",
			"nameEng": "IMS",
			"names": [
				"IMS"
			]
		},
		{
			"teamID": 55,
			"name": "IYC",
			"nameKor": "",
			"nameEng": "IYC",
			"names": [
				"IYC",
				"IYCA",
				"IYCB"
			]
		},
		{
			"teamID": 56,
			"name": "J.S.C",
			"nameKor": "",
			"nameEng": "J.S.C",
			"names": [
				"J.S.C"
			]
		},
		{
			"teamID": 57,
			"name": "제이비스윔",
			"nameKor": "제이비스윔",
			"nameEng": "JBSWIM",
			"names": [
				"JBSWIM"
			]
		},
		{
			"teamID": 58,
			"name": "JDH&GST",
			"nameKor": "",
			"nameEng": "JDH&GST",
			"names": [
				"JDH&GST"
			]
		},
		{
			"teamID": 59,
			"name": "JGSC",
			"nameKor": "",
			"nameEng": "JGSC",
			"names": [
				"JGSC"
			]
		},
		{
			"teamID": 60,
			"name": "JM",
			"nameKor": "",
			"nameEng": "JM",
			"names": [
				"JM"
			]
		},
		{
			"teamID": 61,
			"name": "JSC",
			"nameKor": "",
			"nameEng": "JSC",
			"names": [
				"JSC"
			]
		},
		{
			"teamID": 62,
			"name": "J-SPEED",
			"nameKor": "",
			"nameEng": "J-SPEED",
			"names": [
				"J-SPEED"
			]
		},
		{
			"teamID": 63,
			"name": "JSSC",
			"nameKor": "",
			"nameEng": "JSSC",
			"names": [
				"JSSC"
			]
		},
		{
			"teamID": 64,
			"name": "JYC",
			"nameKor": "",
			"nameEng": "JYC",
			"names": [
				"JYC"
			]
		},
		{
			"teamID": 65,
			"name": "K&D스포츠클럽",
			"nameKor": "",
			"nameEng": "K&D스포츠클럽",
			"names": [
				"K&D스포츠클럽"
			]
		},
		{
			"teamID": 66,
			"name": "K.M.H",
			"nameKor": "",
			"nameEng": "K.M.H",
			"names": [
				"K.M.H"
			]
		},
		{
			"teamID": 67,
			"name": "K2J-KIMBOSS",
			"nameKor": "",
			"nameEng": "K2J-KIMBOSS",
			"names": [
				"K2J-KIMBOSS"
			]
		},
		{
			"teamID": 68,
			"name": "KAIST",
			"nameKor": "",
			"nameEng": "KAIST",
			"names": [
				"KAIST"
			]
		},
		{
			"teamID": 69,
			"name": "KAIST수영장",
			"nameKor": "",
			"nameEng": "KAIST수영장",
			"names": [
				"KAIST수영장"
			]
		},
		{
			"teamID": 70,
			"name": "KILL",
			"nameKor": "",
			"nameEng": "Kill",
			"names": [
				"Kill"
			]
		},
		{
			"teamID": 71,
			"name": "KINGS.J",
			"nameKor": "",
			"nameEng": "Kings.J",
			"names": [
				"Kings.J"
			]
		},
		{
			"teamID": 72,
			"name": "KT",
			"nameKor": "",
			"nameEng": "KT",
			"names": [
				"KT"
			]
		},
		{
			"teamID": 73,
			"name": "KWJ",
			"nameKor": "",
			"nameEng": "KWJ",
			"names": [
				"KWJ"
			]
		},
		{
			"teamID": 74,
			"name": "로",
			"nameKor": "로",
			"nameEng": "L'eau",
			"names": [
				"로",
				"로스쿨"
			]
		},
		{
			"teamID": 75,
			"name": "LENIA",
			"nameKor": "",
			"nameEng": "LENIA",
			"names": [
				"LENIA"
			]
		},
		{
			"teamID": 76,
			"name": "러블리스위머스",
			"nameKor": "러블리스위머스",
			"nameEng": "LovelySwimmers",
			"names": [
				"Lovelyswimmers",
				"러블리스워머즈"
			]
		},
		{
			"teamID": 77,
			"name": "럭셔리",
			"nameKor": "럭셔리",
			"nameEng": "LUXURY",
			"names": [
				"LUXURY"
			]
		},
		{
			"teamID": 78,
			"name": "매드88",
			"nameKor": "매드88",
			"nameEng": "MAD88",
			"names": [
				"MAD88",
				"MAD88A",
				"MAD88B",
				"MAD88C"
			]
		},
		{
			"teamID": 79,
			"name": "매드덕",
			"nameKor": "매드덕",
			"nameEng": "MADDUCK",
			"names": [
				"MADDUCK"
			]
		},
		{
			"teamID": 80,
			"name": "마핀",
			"nameKor": "마핀",
			"nameEng": "MARFIN",
			"names": [
				"MARFIN",
				"MARFINA",
				"MARFINB",
				"Marfin",
				"MARFINSWIMMER"
			]
		},
		{
			"teamID": 81,
			"name": "MC미친수영",
			"nameKor": "",
			"nameEng": "MC미친수영",
			"names": [
				"MC미친수영"
			]
		},
		{
			"teamID": 82,
			"name": "MC패밀리",
			"nameKor": "",
			"nameEng": "MC패밀리",
			"names": [
				"MC패밀리"
			]
		},
		{
			"teamID": 83,
			"name": "엠디클럽",
			"nameKor": "엠디클럽",
			"nameEng": "MDClub",
			"names": [
				"MDClub",
				"MDclub"
			]
		},
		{
			"teamID": 84,
			"name": "MH수영클럽팀",
			"nameKor": "",
			"nameEng": "MH수영클럽팀",
			"names": [
				"MH수영클럽팀"
			]
		},
		{
			"teamID": 85,
			"name": "엠제이스윔",
			"nameKor": "엠제이스윔",
			"nameEng": "MJSWIM",
			"names": [
				"MJSWIM"
			]
		},
		{
			"teamID": 86,
			"name": "몬스터",
			"nameKor": "몬스터",
			"nameEng": "Monster",
			"names": [
				"Monster"
			]
		},
		{
			"teamID": 87,
			"name": "몬스터클럽",
			"nameKor": "몬스터클럽",
			"nameEng": "MONSTERCLUB",
			"names": [
				"MONSTERCLUB"
			]
		},
		{
			"teamID": 88,
			"name": "엠지",
			"nameKor": "엠지",
			"nameEng": "MZ",
			"names": [
				"MZ",
				"mzswiming",
				"MZSWIMMING",
				"MZswimming",
				"mzswimming"
			]
		},
		{
			"teamID": 89,
			"name": "N1000",
			"nameKor": "",
			"nameEng": "n1000",
			"names": [
				"n1000"
			]
		},
		{
			"teamID": 90,
			"name": "NADO",
			"nameKor": "",
			"nameEng": "NADO",
			"names": [
				"NADO"
			]
		},
		{
			"teamID": 91,
			"name": "NSS",
			"nameKor": "",
			"nameEng": "NSS",
			"names": [
				"NSS"
			]
		},
		{
			"teamID": 92,
			"name": "OKEY-DUCKEY",
			"nameKor": "",
			"nameEng": "okey-duckey",
			"names": [
				"okey-duckey"
			]
		},
		{
			"teamID": 93,
			"name": "OKSWIMTEAM",
			"nameKor": "",
			"nameEng": "OKSWIMTeam",
			"names": [
				"OKSWIMTEAM"
			]
		},
		{
			"teamID": 94,
			"name": "OSC-PHOENIX",
			"nameKor": "",
			"nameEng": "OSC-Phoenix",
			"names": [
				"OSC-Phoenix"
			]
		},
		{
			"teamID": 95,
			"name": "아웃사이드",
			"nameKor": "아웃사이드",
			"nameEng": "Outside",
			"names": [
				"OUTSIDE",
				"Outside",
				"Outside",
				"outside"
			]
		},
		{
			"teamID": 96,
			"name": "P2Y",
			"nameKor": "",
			"nameEng": "P2Y",
			"names": [
				"P2Y"
			]
		},
		{
			"teamID": 97,
			"name": "펠프스",
			"nameKor": "펠프스",
			"nameEng": "Phelps",
			"names": [
				"Phelps"
			]
		},
		{
			"teamID": 98,
			"name": "RC191",
			"nameKor": "",
			"nameEng": "RC191",
			"names": [
				"RC191"
			]
		},
		{
			"teamID": 99,
			"name": "RED14.9",
			"nameKor": "",
			"nameEng": "RED14.9",
			"names": [
				"RED14.9"
			]
		},
		{
			"teamID": 100,
			"name": "S&S두류",
			"nameKor": "",
			"nameEng": "s&s두류",
			"names": [
				"s&s두류"
			]
		},
		{
			"teamID": 101,
			"name": "S.D.T",
			"nameKor": "",
			"nameEng": "S.D.T",
			"names": [
				"S.D.T"
			]
		},
		{
			"teamID": 102,
			"name": "S.I.L",
			"nameKor": "",
			"nameEng": "S.I.L",
			"names": [
				"S.I.L"
			]
		},
		{
			"teamID": 103,
			"name": "S.M패미리",
			"nameKor": "",
			"nameEng": "S.M패미리",
			"names": [
				"S.M패미리"
			]
		},
		{
			"teamID": 104,
			"name": "S.TEAM",
			"nameKor": "",
			"nameEng": "S.Team",
			"names": [
				"S.team"
			]
		},
		{
			"teamID": 105,
			"name": "SAM7",
			"nameKor": "",
			"nameEng": "SAM7",
			"names": [
				"SAM7"
			]
		},
		{
			"teamID": 106,
			"name": "SDT",
			"nameKor": "",
			"nameEng": "SDT",
			"names": [
				"SDT"
			]
		},
		{
			"teamID": 107,
			"name": "SES",
			"nameKor": "",
			"nameEng": "SES",
			"names": [
				"SES"
			]
		},
		{
			"teamID": 108,
			"name": "SIS",
			"nameKor": "",
			"nameEng": "SIS",
			"names": [
				"SIS"
			]
		},
		{
			"teamID": 109,
			"name": "SK",
			"nameKor": "",
			"nameEng": "SK",
			"names": [
				"SK"
			]
		},
		{
			"teamID": 110,
			"name": "에스케이스포츠센터",
			"nameKor": "에스케이스포츠센터",
			"nameEng": "SK스포츠센터",
			"names": [
				"SK스포츠센터",
				"sk스포츠센터"
			]
		},
		{
			"teamID": 111,
			"name": "SLB",
			"nameKor": "",
			"nameEng": "SLB",
			"names": [
				"SLB"
			]
		},
		{
			"teamID": 112,
			"name": "에스엘스윔",
			"nameKor": "에스엘스윔",
			"nameEng": "SLswim",
			"names": [
				"SLswim",
				"SLswim"
			]
		},
		{
			"teamID": 113,
			"name": "SMF",
			"nameKor": "",
			"nameEng": "SMF",
			"names": [
				"SMF"
			]
		},
		{
			"teamID": 114,
			"name": "SMSWIM",
			"nameKor": "",
			"nameEng": "smswim",
			"names": [
				"smswim"
			]
		},
		{
			"teamID": 115,
			"name": "SOIL",
			"nameKor": "",
			"nameEng": "SOIL",
			"names": [
				"SOIL"
			]
		},
		{
			"teamID": 116,
			"name": "SOKY",
			"nameKor": "",
			"nameEng": "SOKY",
			"names": [
				"SOKY"
			]
		},
		{
			"teamID": 117,
			"name": "SOLPLAY",
			"nameKor": "",
			"nameEng": "solplay",
			"names": [
				"solplay"
			]
		},
		{
			"teamID": 118,
			"name": "스프린터",
			"nameKor": "스프린터",
			"nameEng": "sprinter",
			"names": [
				"sprinter",
				"스프린터"
			]
		},
		{
			"teamID": 119,
			"name": "신사스포츠",
			"nameKor": "신사스포츠",
			"nameEng": "SSC",
			"names": [
				"SSC(신사스포츠)"
			]
		},
		{
			"teamID": 120,
			"name": "SST",
			"nameKor": "",
			"nameEng": "SST",
			"names": [
				"SST"
			]
		},
		{
			"teamID": 121,
			"name": "SS클럽",
			"nameKor": "",
			"nameEng": "SS클럽",
			"names": [
				"SS클럽"
			]
		},
		{
			"teamID": 122,
			"name": "스트로커",
			"nameKor": "스트로커",
			"nameEng": "STROKER",
			"names": [
				"STROKER"
			]
		},
		{
			"teamID": 123,
			"name": "스트롱맨",
			"nameKor": "스트롱맨",
			"nameEng": "STRONGMAN",
			"names": [
				"STRONGMAN"
			]
		},
		{
			"teamID": 124,
			"name": "써니텐",
			"nameKor": "써니텐",
			"nameEng": "Sunny10",
			"names": [
				"Sunny10"
			]
		},
		{
			"teamID": 125,
			"name": "스윔포유",
			"nameKor": "스윔포유",
			"nameEng": "SWIM4U",
			"names": [
				"SWIM4U",
				"Swim4U"
			]
		},
		{
			"teamID": 126,
			"name": "스윔몬스터",
			"nameKor": "스윔몬스터",
			"nameEng": "swimmonster",
			"names": [
				"swimmonster",
				"스윔몬스터"
			]
		},
		{
			"teamID": 127,
			"name": "스윔온",
			"nameKor": "스윔온",
			"nameEng": "SWIMON",
			"names": [
				"SWIMON",
				"SWIMZOA",
				"스윔온",
				"스윔온1",
				"스윔온2",
				"스윔온A",
				"스윔온B",
				"스윔온C",
				"스윔온D"
			]
		},
		{
			"teamID": 128,
			"name": "스윔스웩",
			"nameKor": "스윔스웩",
			"nameEng": "SWIMSWAG",
			"names": [
				"SWIMSWAG"
			]
		},
		{
			"teamID": 129,
			"name": "SWM",
			"nameKor": "",
			"nameEng": "SWM",
			"names": [
				"SWM"
			]
		},
		{
			"teamID": 130,
			"name": "TEAM101",
			"nameKor": "",
			"nameEng": "Team101",
			"names": [
				"TEAM101"
			]
		},
		{
			"teamID": 131,
			"name": "TEAM9",
			"nameKor": "",
			"nameEng": "Team9",
			"names": [
				"Team9"
			]
		},
		{
			"teamID": 132,
			"name": "TEAMBOLT",
			"nameKor": "",
			"nameEng": "TeamBolt",
			"names": [
				"TeamBolt"
			]
		},
		{
			"teamID": 133,
			"name": "TEAMBRINGIT",
			"nameKor": "",
			"nameEng": "TeamBringIt",
			"names": [
				"TeamBringIt"
			]
		},
		{
			"teamID": 134,
			"name": "TEAMCBNU",
			"nameKor": "",
			"nameEng": "TeamCBNU",
			"names": [
				"TEAMCBNU",
				"TeamCBNU",
				"TeamCBNu",
				"teamCBNU"
			]
		},
		{
			"teamID": 135,
			"name": "TEAMCHANEL7",
			"nameKor": "",
			"nameEng": "TeamChanel7",
			"names": [
				"TeamChanel7"
			]
		},
		{
			"teamID": 136,
			"name": "TEAMDEW",
			"nameKor": "",
			"nameEng": "TeamDew",
			"names": [
				"TeamDew"
			]
		},
		{
			"teamID": 137,
			"name": "TEAMFOA",
			"nameKor": "",
			"nameEng": "TeamFOA",
			"names": [
				"TeamFOA"
			]
		},
		{
			"teamID": 138,
			"name": "TEAMH",
			"nameKor": "",
			"nameEng": "TeamH",
			"names": [
				"TeamH"
			]
		},
		{
			"teamID": 139,
			"name": "TEAMJOY",
			"nameKor": "",
			"nameEng": "TeamJOY",
			"names": [
				"TEAMJOY",
				"TeamJOY"
			]
		},
		{
			"teamID": 140,
			"name": "TEAMLUS",
			"nameKor": "",
			"nameEng": "TeamLUS",
			"names": [
				"TEAMLUS",
				"TeamLUS"
			]
		},
		{
			"teamID": 141,
			"name": "TEAMPYH",
			"nameKor": "",
			"nameEng": "TeamPYH",
			"names": [
				"TEAMPYH",
				"TeamPYH"
			]
		},
		{
			"teamID": 142,
			"name": "TEAMTHEPOS",
			"nameKor": "",
			"nameEng": "TeamTHEPOS",
			"names": [
				"TEAMTHEPOS"
			]
		},
		{
			"teamID": 143,
			"name": "팀YG",
			"nameKor": "팀와이지",
			"nameEng": "TeamYG",
			"names": [
				"TEAMY.G",
				"TEAMYG",
				"팀와이지"
			]
		},
		{
			"teamID": 144,
			"name": "팀꾹",
			"nameKor": "팀꾹",
			"nameEng": "Team꾹",
			"names": [
				"TEAM꾹",
				"TEAM꾹",
				"팀꾹"
			]
		},
		{
			"teamID": 145,
			"name": "TEAM수반",
			"nameKor": "",
			"nameEng": "Team수반",
			"names": [
				"TEAM수반"
			]
		},
		{
			"teamID": 146,
			"name": "더드림",
			"nameKor": "더드림",
			"nameEng": "TheDream",
			"names": [
				"TheDream"
			]
		},
		{
			"teamID": 147,
			"name": "씽크스윔",
			"nameKor": "씽크스윔",
			"nameEng": "ThinkSwim",
			"names": [
				"ThinkSwim"
			]
		},
		{
			"teamID": 148,
			"name": "팀코",
			"nameKor": "팀코",
			"nameEng": "TIMCO",
			"names": [
				"TIMCO"
			]
		},
		{
			"teamID": 149,
			"name": "TK.SDC",
			"nameKor": "",
			"nameEng": "TK.SDC",
			"names": [
				"TK.SDC"
			]
		},
		{
			"teamID": 150,
			"name": "탑스윔",
			"nameKor": "탑스윔",
			"nameEng": "TOPSWIM",
			"names": [
				"TOPSWIM",
				"top수영클럽"
			]
		},
		{
			"teamID": 151,
			"name": "T-SHARKS",
			"nameKor": "",
			"nameEng": "T-Sharks",
			"names": [
				"T-Sharks"
			]
		},
		{
			"teamID": 152,
			"name": "TW",
			"nameKor": "",
			"nameEng": "TW",
			"names": [
				"TW"
			]
		},
		{
			"teamID": 153,
			"name": "TYMS",
			"nameKor": "",
			"nameEng": "TYMS",
			"names": [
				"TYMS"
			]
		},
		{
			"teamID": 154,
			"name": "U.S.T",
			"nameKor": "",
			"nameEng": "U.S.T",
			"names": [
				"U.S.T"
			]
		},
		{
			"teamID": 155,
			"name": "유캔스윔",
			"nameKor": "유캔스윔",
			"nameEng": "UCANSWIM",
			"names": [
				"UCANSWIM",
				"ucanswim"
			]
		},
		{
			"teamID": 156,
			"name": "UCB",
			"nameKor": "",
			"nameEng": "UCB",
			"names": [
				"UCB"
			]
		},
		{
			"teamID": 157,
			"name": "UCSWIMCLUB",
			"nameKor": "",
			"nameEng": "Ucswimclub",
			"names": [
				"Ucswimclub"
			]
		},
		{
			"teamID": 158,
			"name": "ULSUT",
			"nameKor": "",
			"nameEng": "ULSUT",
			"names": [
				"ULSUT"
			]
		},
		{
			"teamID": 159,
			"name": "UPS",
			"nameKor": "",
			"nameEng": "UPS",
			"names": [
				"UPS"
			]
		},
		{
			"teamID": 160,
			"name": "업스트림",
			"nameKor": "업스트림",
			"nameEng": "Upstream",
			"names": [
				"UPstream",
				"Upstream",
				"upstream"
			]
		},
		{
			"teamID": 161,
			"name": "UST",
			"nameKor": "",
			"nameEng": "UST",
			"names": [
				"UST"
			]
		},
		{
			"teamID": 162,
			"name": "V",
			"nameKor": "",
			"nameEng": "V",
			"names": [
				"V"
			]
		},
		{
			"teamID": 163,
			"name": "VERTEX",
			"nameKor": "",
			"nameEng": "VERTEX",
			"names": [
				"VERTEX"
			]
		},
		{
			"teamID": 164,
			"name": "W",
			"nameKor": "",
			"nameEng": "W",
			"names": [
				"W"
			]
		},
		{
			"teamID": 165,
			"name": "W.R.",
			"nameKor": "",
			"nameEng": "W.R.",
			"names": [
				"W.R."
			]
		},
		{
			"teamID": 166,
			"name": "WAL",
			"nameKor": "",
			"nameEng": "WAL",
			"names": [
				"WAL"
			]
		},
		{
			"teamID": 167,
			"name": "WAOS",
			"nameKor": "",
			"nameEng": "WAOS",
			"names": [
				"WAOS"
			]
		},
		{
			"teamID": 168,
			"name": "워터락",
			"nameKor": "워터락",
			"nameEng": "WaterRock",
			"names": [
				"WaterRock",
				"waterrock"
			]
		},
		{
			"teamID": 169,
			"name": "WHITEPOND",
			"nameKor": "",
			"nameEng": "WhitePond",
			"names": [
				"WhitePond"
			]
		},
		{
			"teamID": 170,
			"name": "WIZ",
			"nameKor": "",
			"nameEng": "WIZ",
			"names": [
				"WIZ"
			]
		},
		{
			"teamID": 171,
			"name": "(주)월드스포츠컨설팅",
			"nameKor": "(주)월드스포츠컨설팅",
			"nameEng": "",
			"names": [
				"(주)월드스포츠컨설팅",
				"㈜월드스포츠컨설팅"
			]
		},
		{
			"teamID": 172,
			"name": "1등하고싶다",
			"nameKor": "1등하고싶다",
			"nameEng": "",
			"names": [
				"1등하고싶다"
			]
		},
		{
			"teamID": 173,
			"name": "3등만쫌",
			"nameKor": "3등만쫌",
			"nameEng": "",
			"names": [
				"3등만쫌"
			]
		},
		{
			"teamID": 174,
			"name": "AH기비버",
			"nameKor": "AH기비버",
			"nameEng": "",
			"names": [
				"AH기비버"
			]
		},
		{
			"teamID": 175,
			"name": "D.C백화점",
			"nameKor": "D.C백화점",
			"nameEng": "",
			"names": [
				"D.C백화점"
			]
		},
		{
			"teamID": 176,
			"name": "YMCA부천",
			"nameKor": "YMCA부천",
			"nameEng": "",
			"names": [
				"YMCA부천",
				"YMCA부천"
			]
		},
		{
			"teamID": 177,
			"name": "Y사랑",
			"nameKor": "y사랑",
			"nameEng": "",
			"names": [
				"y사랑"
			]
		},
		{
			"teamID": 178,
			"name": "가천대학교",
			"nameKor": "가천대학교",
			"nameEng": "",
			"names": [
				"가천대학교"
			]
		},
		{
			"teamID": 179,
			"name": "감동",
			"nameKor": "감동",
			"nameEng": "",
			"names": [
				"감동"
			]
		},
		{
			"teamID": 180,
			"name": "강남대치스",
			"nameKor": "강남대치스",
			"nameEng": "",
			"names": [
				"강남대치스"
			]
		},
		{
			"teamID": 181,
			"name": "강동수영사랑",
			"nameKor": "강동수영사랑",
			"nameEng": "",
			"names": [
				"강동수영사랑"
			]
		},
		{
			"teamID": 182,
			"name": "강동스윔온",
			"nameKor": "강동스윔온",
			"nameEng": "",
			"names": [
				"강동스윔온"
			]
		},
		{
			"teamID": 183,
			"name": "강동유소년스포츠센터",
			"nameKor": "강동유소년스포츠센터",
			"nameEng": "",
			"names": [
				"강동유소년스포츠센터"
			]
		},
		{
			"teamID": 184,
			"name": "강동청소년회관",
			"nameKor": "강동청소년회관",
			"nameEng": "",
			"names": [
				"강동청소년회관"
			]
		},
		{
			"teamID": 185,
			"name": "강원",
			"nameKor": "강원",
			"nameEng": "",
			"names": [
				"강원"
			]
		},
		{
			"teamID": 186,
			"name": "강원강원도청",
			"nameKor": "강원강원도청",
			"nameEng": "",
			"names": [
				"강원강원도청"
			]
		},
		{
			"teamID": 187,
			"name": "강챙이",
			"nameKor": "강챙이",
			"nameEng": "",
			"names": [
				"강챙이"
			]
		},
		{
			"teamID": 188,
			"name": "강화수영",
			"nameKor": "강화수영",
			"nameEng": "",
			"names": [
				"강화수영"
			]
		},
		{
			"teamID": 189,
			"name": "개인",
			"nameKor": "개인",
			"nameEng": "",
			"names": [
				"강범구",
				"강슬아",
				"개인",
				"개인참가",
				"개인팀",
				"공영호",
				"곽민신",
				"곽민영",
				"곽해성",
				"권오복",
				"김재현",
				"김준경",
				"김희주",
				"남지영",
				"도원미",
				"류영동",
				"박수영",
				"박정모",
				"소속팀",
				"송창호",
				"없음",
				"이관호",
				"이광은",
				"조중근",
				"조한민",
				"최문정",
				"태홍쓰",
				"태훈외3",
				"한상훈",
				"한재민",
				"홍지은",
				"황충원",
				"서혜정",
				"한인물",
				"호기철과기타등등"
			]
		},
		{
			"teamID": 190,
			"name": "갤러리아",
			"nameKor": "갤러리아",
			"nameEng": "",
			"names": [
				"갤러리아",
				"갤러리아팰리스"
			]
		},
		{
			"teamID": 191,
			"name": "거북이",
			"nameKor": "거북이",
			"nameEng": "",
			"names": [
				"거북이"
			]
		},
		{
			"teamID": 192,
			"name": "거창GST",
			"nameKor": "거창GST",
			"nameEng": "",
			"names": [
				"거창GST"
			]
		},
		{
			"teamID": 193,
			"name": "거창국민체육센터",
			"nameKor": "거창국민체육센터",
			"nameEng": "",
			"names": [
				"거창국민체육센터"
			]
		},
		{
			"teamID": 194,
			"name": "거창수영연맹",
			"nameKor": "거창수영연맹",
			"nameEng": "",
			"names": [
				"거창수영연맹"
			]
		},
		{
			"teamID": 195,
			"name": "건수모",
			"nameKor": "건수모",
			"nameEng": "",
			"names": [
				"건수모"
			]
		},
		{
			"teamID": 196,
			"name": "건양대학교",
			"nameKor": "건양대학교",
			"nameEng": "",
			"names": [
				"충남건양1",
				"충남건양2"
			]
		},
		{
			"teamID": 197,
			"name": "게이터즈",
			"nameKor": "게이터즈",
			"nameEng": "",
			"names": [
				"게이터즈"
			]
		},
		{
			"teamID": 198,
			"name": "경기",
			"nameKor": "경기",
			"nameEng": "",
			"names": [
				"경기"
			]
		},
		{
			"teamID": 199,
			"name": "경기고양시청",
			"nameKor": "경기고양시청",
			"nameEng": "",
			"names": [
				"경기고양시청"
			]
		},
		{
			"teamID": 200,
			"name": "경기도당학생체육관",
			"nameKor": "경기도당학생체육관",
			"nameEng": "",
			"names": [
				"경기도당학생체육관"
			]
		},
		{
			"teamID": 201,
			"name": "경기부천시청",
			"nameKor": "경기부천시청",
			"nameEng": "",
			"names": [
				"경기부천시청"
			]
		},
		{
			"teamID": 202,
			"name": "경기성남시청",
			"nameKor": "경기성남시청",
			"nameEng": "",
			"names": [
				"경기성남시청"
			]
		},
		{
			"teamID": 203,
			"name": "경기수원시청",
			"nameKor": "경기수원시청",
			"nameEng": "",
			"names": [
				"경기수원시청"
			]
		},
		{
			"teamID": 204,
			"name": "경기안양시청",
			"nameKor": "경기안양시청",
			"nameEng": "",
			"names": [
				"경기안양시청"
			]
		},
		{
			"teamID": 205,
			"name": "경기오산시청",
			"nameKor": "경기오산시청",
			"nameEng": "",
			"names": [
				"경기오산시청"
			]
		},
		{
			"teamID": 206,
			"name": "경기용인시청",
			"nameKor": "경기용인시청",
			"nameEng": "",
			"names": [
				"경기용인시청"
			]
		},
		{
			"teamID": 207,
			"name": "경기이천체육회",
			"nameKor": "경기이천체육회",
			"nameEng": "",
			"names": [
				"경기이천체육회"
			]
		},
		{
			"teamID": 208,
			"name": "경기체고",
			"nameKor": "경기체고",
			"nameEng": "",
			"names": [
				"경기체고"
			]
		},
		{
			"teamID": 209,
			"name": "경기체육부대",
			"nameKor": "경기체육부대",
			"nameEng": "",
			"names": [
				"경기체육부대"
			]
		},
		{
			"teamID": 210,
			"name": "경기화성시청",
			"nameKor": "경기화성시청",
			"nameEng": "",
			"names": [
				"경기화성시청"
			]
		},
		{
			"teamID": 211,
			"name": "경남",
			"nameKor": "경남",
			"nameEng": "",
			"names": [
				"경남"
			]
		},
		{
			"teamID": 212,
			"name": "경남체육회",
			"nameKor": "경남체육회",
			"nameEng": "",
			"names": [
				"경남체육회"
			]
		},
		{
			"teamID": 213,
			"name": "경북경북도청",
			"nameKor": "경북경북도청",
			"nameEng": "",
			"names": [
				"경북경북도청"
			]
		},
		{
			"teamID": 214,
			"name": "경북육군3사관",
			"nameKor": "경북육군3사관",
			"nameEng": "",
			"names": [
				"경북육군3사관"
			]
		},
		{
			"teamID": 215,
			"name": "경성대학교",
			"nameKor": "경성대학교",
			"nameEng": "",
			"names": [
				"경성대학교",
				"부산경성1",
				"부산경성2",
				"부산경성3",
				"부산경성4",
				"부산경성"
			]
		},
		{
			"teamID": 216,
			"name": "경주수영연합",
			"nameKor": "경주수영연합",
			"nameEng": "",
			"names": [
				"경주수영연합"
			]
		},
		{
			"teamID": 217,
			"name": "경축PB=",
			"nameKor": "경축PB=",
			"nameEng": "",
			"names": [
				"경축PB=",
				"경축PB="
			]
		},
		{
			"teamID": 218,
			"name": "경희대학교",
			"nameKor": "경희대학교",
			"nameEng": "",
			"names": [
				"경기경희1",
				"경기경희3"
			]
		},
		{
			"teamID": 219,
			"name": "계룡스포츠센터",
			"nameKor": "계룡스포츠센터",
			"nameEng": "",
			"names": [
				"계룡스포츠센터"
			]
		},
		{
			"teamID": 220,
			"name": "계명대",
			"nameKor": "계명대",
			"nameEng": "",
			"names": [
				"계명대"
			]
		},
		{
			"teamID": 221,
			"name": "계명대학교",
			"nameKor": "계명대학교",
			"nameEng": "",
			"names": [
				"대구계명1",
				"대구계명2",
				"대구계명4"
			]
		},
		{
			"teamID": 222,
			"name": "고래고래",
			"nameKor": "고래고래",
			"nameEng": "",
			"names": [
				"고래고래"
			]
		},
		{
			"teamID": 223,
			"name": "고래사냥",
			"nameKor": "고래사냥",
			"nameEng": "",
			"names": [
				"고래사냥"
			]
		},
		{
			"teamID": 224,
			"name": "고래시수영연맹",
			"nameKor": "고래시수영연맹",
			"nameEng": "",
			"names": [
				"고래시수영연맹"
			]
		},
		{
			"teamID": 225,
			"name": "고양시청",
			"nameKor": "고양시청",
			"nameEng": "",
			"names": [
				"고양시청"
			]
		},
		{
			"teamID": 226,
			"name": "고양신일스포츠센터",
			"nameKor": "고양신일스포츠센터",
			"nameEng": "",
			"names": [
				"고양신일스포츠센터"
			]
		},
		{
			"teamID": 227,
			"name": "고양어울림누리",
			"nameKor": "고양어울림누리",
			"nameEng": "",
			"names": [
				"고양어울림누리"
			]
		},
		{
			"teamID": 228,
			"name": "공주교육대학교",
			"nameKor": "공주교육대학교",
			"nameEng": "",
			"names": [
				"공주교육대학교"
			]
		},
		{
			"teamID": 229,
			"name": "공주대학교",
			"nameKor": "공주대학교",
			"nameEng": "",
			"names": [
				"충남공주1",
				"충남공주3"
			]
		},
		{
			"teamID": 230,
			"name": "관악스윔클럽",
			"nameKor": "관악스윔클럽",
			"nameEng": "",
			"names": [
				"관악수영",
				"관악스윔",
				"관악스윔클럽"
			]
		},
		{
			"teamID": 231,
			"name": "광주",
			"nameKor": "광주",
			"nameEng": "",
			"names": [
				"광주"
			]
		},
		{
			"teamID": 232,
			"name": "광주HD클럽",
			"nameKor": "광주HD클럽",
			"nameEng": "",
			"names": [
				"광주HD클럽"
			]
		},
		{
			"teamID": 233,
			"name": "광주물새",
			"nameKor": "광주물새",
			"nameEng": "",
			"names": [
				"광주물새"
			]
		},
		{
			"teamID": 234,
			"name": "광주빛고을수영클럽",
			"nameKor": "광주빛고을수영클럽",
			"nameEng": "",
			"names": [
				"광주빛고을수영클럽"
			]
		},
		{
			"teamID": 235,
			"name": "구리시수영연맹",
			"nameKor": "구리시수영연맹",
			"nameEng": "",
			"names": [
				"구리시수영연맹"
			]
		},
		{
			"teamID": 236,
			"name": "구미수영사랑",
			"nameKor": "구미수영사랑",
			"nameEng": "",
			"names": [
				"구미수영사랑"
			]
		},
		{
			"teamID": 237,
			"name": "구즉수영장",
			"nameKor": "구즉수영장",
			"nameEng": "",
			"names": [
				"구즉수영장"
			]
		},
		{
			"teamID": 238,
			"name": "국군체육부대",
			"nameKor": "국군체육부대",
			"nameEng": "",
			"names": [
				"국군체육부대"
			]
		},
		{
			"teamID": 239,
			"name": "그랑블루",
			"nameKor": "그랑블루",
			"nameEng": "",
			"names": [
				"그랑블루"
			]
		},
		{
			"teamID": 240,
			"name": "근로",
			"nameKor": "근로",
			"nameEng": "",
			"names": [
				"근로"
			]
		},
		{
			"teamID": 241,
			"name": "금산군",
			"nameKor": "금산군",
			"nameEng": "",
			"names": [
				"금산군"
			]
		},
		{
			"teamID": 242,
			"name": "기흥연합수영동호회",
			"nameKor": "기흥연합수영동호회",
			"nameEng": "",
			"names": [
				"기흥연합수영동호회"
			]
		},
		{
			"teamID": 243,
			"name": "길드림",
			"nameKor": "길드림",
			"nameEng": "",
			"names": [
				"길드림"
			]
		},
		{
			"teamID": 244,
			"name": "김해수영클럽",
			"nameKor": "김해수영클럽",
			"nameEng": "",
			"names": [
				"김해수영클럽"
			]
		},
		{
			"teamID": 245,
			"name": "꼬부기",
			"nameKor": "꼬부기",
			"nameEng": "",
			"names": [
				"꼬부기"
			]
		},
		{
			"teamID": 246,
			"name": "꿀꿀",
			"nameKor": "꿀꿀",
			"nameEng": "",
			"names": [
				"꿀꿀"
			]
		},
		{
			"teamID": 247,
			"name": "나래스포츠",
			"nameKor": "나래스포츠",
			"nameEng": "",
			"names": [
				"나래스포츠"
			]
		},
		{
			"teamID": 248,
			"name": "나무늘보",
			"nameKor": "나무늘보",
			"nameEng": "",
			"names": [
				"나무늘보"
			]
		},
		{
			"teamID": 249,
			"name": "나이머스",
			"nameKor": "나이머스",
			"nameEng": "",
			"names": [
				"나이머스"
			]
		},
		{
			"teamID": 250,
			"name": "날아라",
			"nameKor": "날아라",
			"nameEng": "",
			"names": [
				"날아라"
			]
		},
		{
			"teamID": 251,
			"name": "남원스포츠클럽",
			"nameKor": "남원스포츠클럽",
			"nameEng": "",
			"names": [
				"남원스포츠클럽",
				"남원스포츠클럽"
			]
		},
		{
			"teamID": 252,
			"name": "노브레싱",
			"nameKor": "노브레싱",
			"nameEng": "",
			"names": [
				"노브레싱"
			]
		},
		{
			"teamID": 253,
			"name": "놀계",
			"nameKor": "놀계",
			"nameEng": "",
			"names": [
				"놀계"
			]
		},
		{
			"teamID": 254,
			"name": "늘푸른",
			"nameKor": "늘푸른",
			"nameEng": "",
			"names": [
				"늘푸른"
			]
		},
		{
			"teamID": 255,
			"name": "니케",
			"nameKor": "니케",
			"nameEng": "",
			"names": [
				"니케"
			]
		},
		{
			"teamID": 256,
			"name": "당진수영사랑",
			"nameKor": "당진수영사랑",
			"nameEng": "",
			"names": [
				"당진수영사랑"
			]
		},
		{
			"teamID": 257,
			"name": "대공원",
			"nameKor": "대공원",
			"nameEng": "",
			"names": [
				"대공원"
			]
		},
		{
			"teamID": 258,
			"name": "대구",
			"nameKor": "대구",
			"nameEng": "",
			"names": [
				"대구"
			]
		},
		{
			"teamID": 259,
			"name": "대구성서스포츠클럽",
			"nameKor": "대구성서스포츠클럽",
			"nameEng": "",
			"names": [
				"대구성서스포츠클럽"
			]
		},
		{
			"teamID": 260,
			"name": "대구시설관리",
			"nameKor": "대구시설관리",
			"nameEng": "",
			"names": [
				"대구시설관리"
			]
		},
		{
			"teamID": 261,
			"name": "대구체육회",
			"nameKor": "대구체육회",
			"nameEng": "",
			"names": [
				"대구체육회"
			]
		},
		{
			"teamID": 262,
			"name": "대덕구청소년어울림센터",
			"nameKor": "대덕구청소년어울림센터",
			"nameEng": "",
			"names": [
				"대덕구청소년어울림센터"
			]
		},
		{
			"teamID": 263,
			"name": "대덕국민체육센터",
			"nameKor": "대덕국민체육센터",
			"nameEng": "",
			"names": [
				"대덕국민체육센터"
			]
		},
		{
			"teamID": 264,
			"name": "대림대학교",
			"nameKor": "대림대학교",
			"nameEng": "",
			"names": [
				"경기대림1"
			]
		},
		{
			"teamID": 265,
			"name": "대우스포츠",
			"nameKor": "대우스포츠",
			"nameEng": "",
			"names": [
				"대우스포츠"
			]
		},
		{
			"teamID": 266,
			"name": "대전",
			"nameKor": "대전",
			"nameEng": "",
			"names": [
				"대전"
			]
		},
		{
			"teamID": 267,
			"name": "대전동구청",
			"nameKor": "대전동구청",
			"nameEng": "",
			"names": [
				"대전동구청"
			]
		},
		{
			"teamID": 268,
			"name": "대전마스터즈다이빙",
			"nameKor": "대전마스터즈다이빙",
			"nameEng": "",
			"names": [
				"대전마스터즈다이빙"
			]
		},
		{
			"teamID": 269,
			"name": "대전소방수영동호회",
			"nameKor": "대전소방수영동호회",
			"nameEng": "",
			"names": [
				"대전소방수영동호회",
				"대전수영소방동호회"
			]
		},
		{
			"teamID": 270,
			"name": "대전체육회",
			"nameKor": "대전체육회",
			"nameEng": "",
			"names": [
				"대전체육회"
			]
		},
		{
			"teamID": 271,
			"name": "대치돌핀세븐",
			"nameKor": "대치돌핀세븐",
			"nameEng": "",
			"names": [
				"대치돌핀세븐",
				"대치돌핀세븐"
			]
		},
		{
			"teamID": 272,
			"name": "대한",
			"nameKor": "대한",
			"nameEng": "",
			"names": [
				"대한"
			]
		},
		{
			"teamID": 273,
			"name": "대한수중협회",
			"nameKor": "대한수중협회",
			"nameEng": "",
			"names": [
				"대한수중협회"
			]
		},
		{
			"teamID": 274,
			"name": "대한유화",
			"nameKor": "대한유화",
			"nameEng": "",
			"names": [
				"대한유화"
			]
		},
		{
			"teamID": 275,
			"name": "더레인",
			"nameKor": "더레인",
			"nameEng": "",
			"names": [
				"더레인"
			]
		},
		{
			"teamID": 276,
			"name": "더스윔클럽",
			"nameKor": "더스윔클럽",
			"nameEng": "",
			"names": [
				"더스윔클럽"
			]
		},
		{
			"teamID": 277,
			"name": "더원",
			"nameKor": "더원",
			"nameEng": "",
			"names": [
				"더원"
			]
		},
		{
			"teamID": 278,
			"name": "덴스",
			"nameKor": "덴스",
			"nameEng": "",
			"names": [
				"덴스"
			]
		},
		{
			"teamID": 279,
			"name": "도마실국민체육센터",
			"nameKor": "도마실국민체육센터",
			"nameEng": "",
			"names": [
				"도마실국민체육센터"
			]
		},
		{
			"teamID": 280,
			"name": "독수리육남매",
			"nameKor": "독수리육남매",
			"nameEng": "",
			"names": [
				"독수리육남매"
			]
		},
		{
			"teamID": 281,
			"name": "돌핀스",
			"nameKor": "돌핀스",
			"nameEng": "",
			"names": [
				"돌핀스"
			]
		},
		{
			"teamID": 282,
			"name": "돌핀클럽",
			"nameKor": "돌핀클럽",
			"nameEng": "",
			"names": [
				"돌핀클럽"
			]
		},
		{
			"teamID": 283,
			"name": "동구국민체육센터",
			"nameKor": "동구국민체육센터",
			"nameEng": "",
			"names": [
				"동구국민센터",
				"동구국민체육"
			]
		},
		{
			"teamID": 284,
			"name": "동부회관",
			"nameKor": "동부회관",
			"nameEng": "",
			"names": [
				"동부회관"
			]
		},
		{
			"teamID": 285,
			"name": "동아대학교",
			"nameKor": "동아대학교",
			"nameEng": "",
			"names": [
				"동아대학교",
				"부산동아1",
				"부산동아2",
				"부산동아3",
				"부산동아4",
				"부산동아"
			]
		},
		{
			"teamID": 286,
			"name": "동의대학교",
			"nameKor": "동의대학교",
			"nameEng": "",
			"names": [
				"동의대학교"
			]
		},
		{
			"teamID": 287,
			"name": "동천",
			"nameKor": "동천",
			"nameEng": "",
			"names": [
				"동천"
			]
		},
		{
			"teamID": 288,
			"name": "동천피쉬",
			"nameKor": "동천피쉬",
			"nameEng": "",
			"names": [
				"동천피쉬"
			]
		},
		{
			"teamID": 289,
			"name": "동탄무한질주",
			"nameKor": "동탄무한질주",
			"nameEng": "",
			"names": [
				"동탄무한질주"
			]
		},
		{
			"teamID": 290,
			"name": "드림",
			"nameKor": "드림",
			"nameEng": "",
			"names": [
				"드림"
			]
		},
		{
			"teamID": 291,
			"name": "땡쓰윔",
			"nameKor": "땡쓰윔",
			"nameEng": "",
			"names": [
				"땡쓰윔"
			]
		},
		{
			"teamID": 292,
			"name": "라온",
			"nameKor": "라온",
			"nameEng": "",
			"names": [
				"라온"
			]
		},
		{
			"teamID": 293,
			"name": "러브포션NO.9",
			"nameKor": "러브포션No.9",
			"nameEng": "",
			"names": [
				"러브포션No.9"
			]
		},
		{
			"teamID": 294,
			"name": "러시안블루",
			"nameKor": "러시안블루",
			"nameEng": "",
			"names": [
				"러시안블루"
			]
		},
		{
			"teamID": 295,
			"name": "레드14.9",
			"nameKor": "레드14.9",
			"nameEng": "",
			"names": [
				"레드14.9"
			]
		},
		{
			"teamID": 296,
			"name": "레이",
			"nameKor": "레이",
			"nameEng": "",
			"names": [
				"레이"
			]
		},
		{
			"teamID": 297,
			"name": "레인걸",
			"nameKor": "레인걸",
			"nameEng": "",
			"names": [
				"레인걸"
			]
		},
		{
			"teamID": 298,
			"name": "로얄스포츠센터",
			"nameKor": "로얄스포츠센터",
			"nameEng": "",
			"names": [
				"로얄스포츠센터"
			]
		},
		{
			"teamID": 299,
			"name": "로제우스",
			"nameKor": "로제우스",
			"nameEng": "",
			"names": [
				"로제우스"
			]
		},
		{
			"teamID": 300,
			"name": "리미티드",
			"nameKor": "리미티드",
			"nameEng": "",
			"names": [
				"리미티드"
			]
		},
		{
			"teamID": 301,
			"name": "리틀스윔",
			"nameKor": "리틀스윔",
			"nameEng": "",
			"names": [
				"리틀",
				"리틀스윔"
			]
		},
		{
			"teamID": 302,
			"name": "마린스",
			"nameKor": "마린스",
			"nameEng": "",
			"names": [
				"마린스"
			]
		},
		{
			"teamID": 303,
			"name": "마츨리",
			"nameKor": "마츨리",
			"nameEng": "",
			"names": [
				"마츨리"
			]
		},
		{
			"teamID": 304,
			"name": "마핀",
			"nameKor": "마핀",
			"nameEng": "",
			"names": [
				"마핀"
			]
		},
		{
			"teamID": 305,
			"name": "머치배럴",
			"nameKor": "머치배럴",
			"nameEng": "",
			"names": [
				"머치배럴"
			]
		},
		{
			"teamID": 306,
			"name": "명지대학교",
			"nameKor": "명지대학교",
			"nameEng": "",
			"names": [
				"경기명지2"
			]
		},
		{
			"teamID": 307,
			"name": "무대뽀",
			"nameKor": "무대뽀",
			"nameEng": "",
			"names": [
				"무대뽀의수영이야기",
				"클럽무대뽀",
				"클럽무대뽀"
			]
		},
		{
			"teamID": 308,
			"name": "무리조아",
			"nameKor": "무리조아",
			"nameEng": "",
			"names": [
				"무리조아"
			]
		},
		{
			"teamID": 309,
			"name": "무사GO",
			"nameKor": "무사GO",
			"nameEng": "",
			"names": [
				"무사GO",
				"무사고"
			]
		},
		{
			"teamID": 310,
			"name": "무자비스위밍",
			"nameKor": "무자비스위밍",
			"nameEng": "",
			"names": [
				"무자비스위밍"
			]
		},
		{
			"teamID": 311,
			"name": "문수",
			"nameKor": "문수",
			"nameEng": "",
			"names": [
				"문수"
			]
		},
		{
			"teamID": 312,
			"name": "문수꼬레",
			"nameKor": "문수꼬레",
			"nameEng": "",
			"names": [
				"문수꼬레"
			]
		},
		{
			"teamID": 313,
			"name": "문수수영장",
			"nameKor": "문수수영장",
			"nameEng": "",
			"names": [
				"문수수영장"
			]
		},
		{
			"teamID": 314,
			"name": "문정",
			"nameKor": "문정",
			"nameEng": "",
			"names": [
				"문정"
			]
		},
		{
			"teamID": 315,
			"name": "문학에이스원",
			"nameKor": "문학에이스원",
			"nameEng": "",
			"names": [
				"문학에이스원"
			]
		},
		{
			"teamID": 316,
			"name": "문화체육관",
			"nameKor": "문화체육관",
			"nameEng": "",
			"names": [
				"문화체육관"
			]
		},
		{
			"teamID": 317,
			"name": "물개지욱",
			"nameKor": "물개지욱",
			"nameEng": "",
			"names": [
				"물개지욱"
			]
		},
		{
			"teamID": 318,
			"name": "물바위",
			"nameKor": "물바위",
			"nameEng": "",
			"names": [
				"물바위"
			]
		},
		{
			"teamID": 319,
			"name": "물찬들",
			"nameKor": "물찬들",
			"nameEng": "",
			"names": [
				"물찬들"
			]
		},
		{
			"teamID": 320,
			"name": "물피그",
			"nameKor": "물피그",
			"nameEng": "",
			"names": [
				"물피그"
			]
		},
		{
			"teamID": 321,
			"name": "믈루",
			"nameKor": "믈루",
			"nameEng": "",
			"names": [
				"믈루"
			]
		},
		{
			"teamID": 322,
			"name": "미꾸리",
			"nameKor": "미꾸리",
			"nameEng": "",
			"names": [
				"미꾸리"
			]
		},
		{
			"teamID": 323,
			"name": "미남미녀반",
			"nameKor": "미남미녀반",
			"nameEng": "",
			"names": [
				"미남미녀반"
			]
		},
		{
			"teamID": 324,
			"name": "미스터덕",
			"nameKor": "미스터덕",
			"nameEng": "",
			"names": [
				"미스터덕",
				"미스터덕A",
				"미스터덕B",
				"미스터덕B"
			]
		},
		{
			"teamID": 325,
			"name": "미장초",
			"nameKor": "미장초",
			"nameEng": "",
			"names": [
				"미장초"
			]
		},
		{
			"teamID": 326,
			"name": "미친범고래",
			"nameKor": "미친범고래",
			"nameEng": "",
			"names": [
				"미친범고래"
			]
		},
		{
			"teamID": 327,
			"name": "밀양스윔닥터",
			"nameKor": "밀양스윔닥터",
			"nameEng": "",
			"names": [
				"밀양스윔닥터"
			]
		},
		{
			"teamID": 328,
			"name": "바닐라라떼",
			"nameKor": "바닐라라떼",
			"nameEng": "",
			"names": [
				"바닐라라떼"
			]
		},
		{
			"teamID": 329,
			"name": "바수동",
			"nameKor": "바수동",
			"nameEng": "",
			"names": [
				"바수동"
			]
		},
		{
			"teamID": 330,
			"name": "박카스",
			"nameKor": "박카스",
			"nameEng": "",
			"names": [
				"박카스"
			]
		},
		{
			"teamID": 331,
			"name": "방구석수영연맹",
			"nameKor": "방구석수영연맹",
			"nameEng": "",
			"names": [
				"방구석수영연맹",
				"방구석수영연맹"
			]
		},
		{
			"teamID": 332,
			"name": "방탄수영모",
			"nameKor": "방탄수영모",
			"nameEng": "",
			"names": [
				"방탄수영모"
			]
		},
		{
			"teamID": 333,
			"name": "번외",
			"nameKor": "번외",
			"nameEng": "",
			"names": [
				"번외"
			]
		},
		{
			"teamID": 334,
			"name": "범서수달",
			"nameKor": "범서수달",
			"nameEng": "",
			"names": [
				"범서수달"
			]
		},
		{
			"teamID": 335,
			"name": "별하스위밍",
			"nameKor": "별하스위밍",
			"nameEng": "",
			"names": [
				"별하스위밍"
			]
		},
		{
			"teamID": 336,
			"name": "복담",
			"nameKor": "복담",
			"nameEng": "",
			"names": [
				"복담"
			]
		},
		{
			"teamID": 337,
			"name": "부산",
			"nameKor": "부산",
			"nameEng": "",
			"names": [
				"부산"
			]
		},
		{
			"teamID": 338,
			"name": "부산광역시중구청",
			"nameKor": "부산광역시중구청",
			"nameEng": "",
			"names": [
				"부산광역시중구청"
			]
		},
		{
			"teamID": 339,
			"name": "부산외국어대학교",
			"nameKor": "부산외국어대학교",
			"nameEng": "",
			"names": [
				"부산부산외1",
				"부산부산외2"
			]
		},
		{
			"teamID": 340,
			"name": "부산중구청",
			"nameKor": "부산중구청",
			"nameEng": "",
			"names": [
				"부산중구청"
			]
		},
		{
			"teamID": 341,
			"name": "부산체육회",
			"nameKor": "부산체육회",
			"nameEng": "",
			"names": [
				"부산체육회"
			]
		},
		{
			"teamID": 342,
			"name": "부천시청",
			"nameKor": "부천시청",
			"nameEng": "",
			"names": [
				"부천시청"
			]
		},
		{
			"teamID": 343,
			"name": "북구생활체육",
			"nameKor": "북구생활체육",
			"nameEng": "",
			"names": [
				"북구생활체육"
			]
		},
		{
			"teamID": 344,
			"name": "블랙샤크",
			"nameKor": "블랙샤크",
			"nameEng": "",
			"names": [
				"블랙샤크"
			]
		},
		{
			"teamID": 345,
			"name": "블루",
			"nameKor": "블루",
			"nameEng": "",
			"names": [
				"블루"
			]
		},
		{
			"teamID": 346,
			"name": "블루마린630",
			"nameKor": "블루마린630",
			"nameEng": "",
			"names": [
				"블루마린630"
			]
		},
		{
			"teamID": 347,
			"name": "블루워터",
			"nameKor": "블루워터",
			"nameEng": "",
			"names": [
				"블루워터"
			]
		},
		{
			"teamID": 348,
			"name": "블루피시시티",
			"nameKor": "블루피시시티",
			"nameEng": "",
			"names": [
				"블루피시시티"
			]
		},
		{
			"teamID": 349,
			"name": "블루피시홀",
			"nameKor": "블루피시홀",
			"nameEng": "",
			"names": [
				"블루피시홀"
			]
		},
		{
			"teamID": 350,
			"name": "빛고을수영클럽",
			"nameKor": "빛고을수영클럽",
			"nameEng": "",
			"names": [
				"빛고을수영클럽",
				"빛고을수영클럽"
			]
		},
		{
			"teamID": 351,
			"name": "사오영",
			"nameKor": "사오영",
			"nameEng": "",
			"names": [
				"사오영"
			]
		},
		{
			"teamID": 352,
			"name": "사이언스도룡",
			"nameKor": "사이언스도룡",
			"nameEng": "",
			"names": [
				"사이언스도룡",
				"사이언스도룡"
			]
		},
		{
			"teamID": 353,
			"name": "사이언스전민",
			"nameKor": "사이언스전민",
			"nameEng": "",
			"names": [
				"사이언스전민",
				"사이언스전민"
			]
		},
		{
			"teamID": 354,
			"name": "사직수영장",
			"nameKor": "사직수영장",
			"nameEng": "",
			"names": [
				"사직수영장"
			]
		},
		{
			"teamID": 355,
			"name": "삼각산동호회",
			"nameKor": "삼각산동호회",
			"nameEng": "",
			"names": [
				"삼각산동호회"
			]
		},
		{
			"teamID": 356,
			"name": "삼모스포렉스",
			"nameKor": "삼모스포렉스",
			"nameEng": "",
			"names": [
				"삼모스포렉스"
			]
		},
		{
			"teamID": 357,
			"name": "삼부스포렉스",
			"nameKor": "삼부스포렉스",
			"nameEng": "",
			"names": [
				"삼부수영장",
				"삼부스포렉스"
			]
		},
		{
			"teamID": 358,
			"name": "삼성골드스포츠클럽",
			"nameKor": "삼성골드스포츠클럽",
			"nameEng": "",
			"names": [
				"삼성골드스포츠클럽",
				"삼성골드스포츠클럽"
			]
		},
		{
			"teamID": 359,
			"name": "삼성전자X스누풀",
			"nameKor": "삼성전자X스누풀",
			"nameEng": "",
			"names": [
				"삼성전자X스누풀"
			]
		},
		{
			"teamID": 360,
			"name": "삼성전자돌핀스",
			"nameKor": "삼성전자돌핀스",
			"nameEng": "",
			"names": [
				"삼성전자돌핀스",
				"삼성전자돌핀스"
			]
		},
		{
			"teamID": 361,
			"name": "삼실수",
			"nameKor": "삼실수",
			"nameEng": "",
			"names": [
				"삼실수"
			]
		},
		{
			"teamID": 362,
			"name": "삼척시",
			"nameKor": "삼척시",
			"nameEng": "",
			"names": [
				"삼척시"
			]
		},
		{
			"teamID": 363,
			"name": "삼화전기",
			"nameKor": "삼화전기",
			"nameEng": "",
			"names": [
				"삼화전기"
			]
		},
		{
			"teamID": 364,
			"name": "상식충",
			"nameKor": "상식충",
			"nameEng": "",
			"names": [
				"상식충"
			]
		},
		{
			"teamID": 365,
			"name": "서구국민체육센터",
			"nameKor": "서구국민체육센터",
			"nameEng": "",
			"names": [
				"서구국민체육센터"
			]
		},
		{
			"teamID": 366,
			"name": "서대문문화체육회관",
			"nameKor": "서대문문화체육회관",
			"nameEng": "",
			"names": [
				"서대문문화체육",
				"서대문문화체육회관",
				"서대문문회체육",
				"서대문체육회관"
			]
		},
		{
			"teamID": 367,
			"name": "서람이도마실국민체육센터",
			"nameKor": "서람이도마실국민체육센터",
			"nameEng": "",
			"names": [
				"서람이도마실국민체육센터"
			]
		},
		{
			"teamID": 368,
			"name": "서람이스포츠클럽",
			"nameKor": "서람이스포츠클럽",
			"nameEng": "",
			"names": [
				"서람이스포츠클럽"
			]
		},
		{
			"teamID": 369,
			"name": "서부",
			"nameKor": "서부",
			"nameEng": "",
			"names": [
				"서부"
			]
		},
		{
			"teamID": 370,
			"name": "서부회관",
			"nameKor": "서부회관",
			"nameEng": "",
			"names": [
				"서부회관"
			]
		},
		{
			"teamID": 371,
			"name": "서산수영스포츠클럽",
			"nameKor": "서산수영스포츠클럽",
			"nameEng": "",
			"names": [
				"서산수영스포츠클럽"
			]
		},
		{
			"teamID": 372,
			"name": "서수연",
			"nameKor": "서수연",
			"nameEng": "",
			"names": [
				"서수연"
			]
		},
		{
			"teamID": 373,
			"name": "서울",
			"nameKor": "서울",
			"nameEng": "",
			"names": [
				"서울"
			]
		},
		{
			"teamID": 374,
			"name": "서울구로션준빈",
			"nameKor": "서울구로션준빈",
			"nameEng": "",
			"names": [
				"서울구로션준빈"
			]
		},
		{
			"teamID": 375,
			"name": "서울대수영부",
			"nameKor": "서울대수영부",
			"nameEng": "",
			"names": [
				"서울대수영부",
				"서울대수영부"
			]
		},
		{
			"teamID": 376,
			"name": "서울대학교",
			"nameKor": "서울대학교",
			"nameEng": "",
			"names": [
				"서울서울1",
				"서울서울3",
				"서울서울"
			]
		},
		{
			"teamID": 377,
			"name": "서울서울시청",
			"nameKor": "서울서울시청",
			"nameEng": "",
			"names": [
				"서울서울시청"
			]
		},
		{
			"teamID": 378,
			"name": "서울수영연맹",
			"nameKor": "서울수영연맹",
			"nameEng": "",
			"names": [
				"서울수영연맹"
			]
		},
		{
			"teamID": 379,
			"name": "서울수영팀",
			"nameKor": "서울수영팀",
			"nameEng": "",
			"names": [
				"서울수영팀"
			]
		},
		{
			"teamID": 380,
			"name": "서울스포렉스",
			"nameKor": "서울스포렉스",
			"nameEng": "",
			"names": [
				"서울스포렉스"
			]
		},
		{
			"teamID": 381,
			"name": "서울예술대학교",
			"nameKor": "서울예술대학교",
			"nameEng": "",
			"names": [
				"서울예술대학교"
			]
		},
		{
			"teamID": 382,
			"name": "서프린터",
			"nameKor": "서프린터",
			"nameEng": "",
			"names": [
				"서프린터"
			]
		},
		{
			"teamID": 383,
			"name": "서현고등학교",
			"nameKor": "서현고등학교",
			"nameEng": "",
			"names": [
				"서현고등학교"
			]
		},
		{
			"teamID": 384,
			"name": "서호스포츠센타",
			"nameKor": "서호스포츠센타",
			"nameEng": "",
			"names": [
				"서호스포츠센타"
			]
		},
		{
			"teamID": 385,
			"name": "성결대학교",
			"nameKor": "성결대학교",
			"nameEng": "",
			"names": [
				"성결대학교",
				"경기성결2",
				"경기성결3"
			]
		},
		{
			"teamID": 386,
			"name": "성동구수영연맹",
			"nameKor": "성동구수영연맹",
			"nameEng": "",
			"names": [
				"성동구수영연맹",
				"성동구수영연맹-뚝섬19"
			]
		},
		{
			"teamID": 387,
			"name": "성동구수영연합",
			"nameKor": "성동구수영연합",
			"nameEng": "",
			"names": [
				"성동구수영연합",
				"성동구수영연합회"
			]
		},
		{
			"teamID": 388,
			"name": "성북구연합회",
			"nameKor": "성북구연합회",
			"nameEng": "",
			"names": [
				"성북구연합회"
			]
		},
		{
			"teamID": 389,
			"name": "세반수",
			"nameKor": "세반수",
			"nameEng": "",
			"names": [
				"세반수"
			]
		},
		{
			"teamID": 390,
			"name": "세븐스포츠",
			"nameKor": "세븐스포츠",
			"nameEng": "",
			"names": [
				"세븐스포츠",
				"세븐스포츠",
				"세븐스포츠센터"
			]
		},
		{
			"teamID": 391,
			"name": "세이브",
			"nameKor": "세이브",
			"nameEng": "",
			"names": [
				"세이브"
			]
		},
		{
			"teamID": 392,
			"name": "소을",
			"nameKor": "소을",
			"nameEng": "",
			"names": [
				"소을"
			]
		},
		{
			"teamID": 393,
			"name": "송강-TS",
			"nameKor": "송강-TS",
			"nameEng": "",
			"names": [
				"송강-TS"
			]
		},
		{
			"teamID": 394,
			"name": "송강클럽",
			"nameKor": "송강클럽",
			"nameEng": "",
			"names": [
				"송강클럽"
			]
		},
		{
			"teamID": 395,
			"name": "송파AM6",
			"nameKor": "송파AM6",
			"nameEng": "",
			"names": [
				"송파AM6"
			]
		},
		{
			"teamID": 396,
			"name": "송파체육문화회관",
			"nameKor": "송파체육문화회관",
			"nameEng": "",
			"names": [
				"송파체육문화회관"
			]
		},
		{
			"teamID": 397,
			"name": "수길사",
			"nameKor": "수길사",
			"nameEng": "",
			"names": [
				"수길사"
			]
		},
		{
			"teamID": 398,
			"name": "수랄라",
			"nameKor": "수랄라",
			"nameEng": "",
			"names": [
				"수랄라"
			]
		},
		{
			"teamID": 399,
			"name": "수력발전소",
			"nameKor": "수력발전소",
			"nameEng": "",
			"names": [
				"수력발전소"
			]
		},
		{
			"teamID": 400,
			"name": "수린이",
			"nameKor": "수린이",
			"nameEng": "",
			"names": [
				"수린이(SURINI)"
			]
		},
		{
			"teamID": 401,
			"name": "수마일",
			"nameKor": "수마일",
			"nameEng": "",
			"names": [
				"수마일"
			]
		},
		{
			"teamID": 402,
			"name": "수모리",
			"nameKor": "수모리",
			"nameEng": "",
			"names": [
				"수모리"
			]
		},
		{
			"teamID": 403,
			"name": "수미사",
			"nameKor": "수미사",
			"nameEng": "",
			"names": [
				"수미사"
			]
		},
		{
			"teamID": 404,
			"name": "수반",
			"nameKor": "수반",
			"nameEng": "",
			"names": [
				"수반"
			]
		},
		{
			"teamID": 405,
			"name": "수수깡",
			"nameKor": "수수깡",
			"nameEng": "",
			"names": [
				"수수깡"
			]
		},
		{
			"teamID": 406,
			"name": "수술방",
			"nameKor": "수술방",
			"nameEng": "",
			"names": [
				"수술방"
			]
		},
		{
			"teamID": 407,
			"name": "수영가자",
			"nameKor": "수영가자",
			"nameEng": "",
			"names": [
				"수영가자"
			]
		},
		{
			"teamID": 408,
			"name": "수영꿈나무",
			"nameKor": "수영꿈나무",
			"nameEng": "",
			"names": [
				"수영꿈나무"
			]
		},
		{
			"teamID": 409,
			"name": "수영사랑",
			"nameKor": "수영사랑",
			"nameEng": "",
			"names": [
				"수영사랑"
			]
		},
		{
			"teamID": 410,
			"name": "수영사랑구미",
			"nameKor": "수영사랑구미",
			"nameEng": "",
			"names": [
				"수영사랑구미"
			]
		},
		{
			"teamID": 411,
			"name": "수영에반하다",
			"nameKor": "수영에반하다",
			"nameEng": "",
			"names": [
				"수영에반하다"
			]
		},
		{
			"teamID": 412,
			"name": "수영왕",
			"nameKor": "수영왕",
			"nameEng": "",
			"names": [
				"수영왕"
			]
		},
		{
			"teamID": 413,
			"name": "수영인",
			"nameKor": "수영인",
			"nameEng": "",
			"names": [
				"수영인"
			]
		},
		{
			"teamID": 414,
			"name": "수영좀한양",
			"nameKor": "수영좀한양",
			"nameEng": "",
			"names": [
				"수영좀한양"
			]
		},
		{
			"teamID": 415,
			"name": "수원과학대",
			"nameKor": "수원과학대",
			"nameEng": "",
			"names": [
				"수원과학대"
			]
		},
		{
			"teamID": 416,
			"name": "수인부",
			"nameKor": "수인부",
			"nameEng": "",
			"names": [
				"수인부"
			]
		},
		{
			"teamID": 417,
			"name": "수찾사",
			"nameKor": "수찾사",
			"nameEng": "",
			"names": [
				"수찾사"
			]
		},
		{
			"teamID": 418,
			"name": "수퍼캐치",
			"nameKor": "수퍼캐치",
			"nameEng": "",
			"names": [
				"수퍼캐치"
			]
		},
		{
			"teamID": 419,
			"name": "슈퍼발차기",
			"nameKor": "슈퍼발차기",
			"nameEng": "",
			"names": [
				"슈퍼발차기"
			]
		},
		{
			"teamID": 420,
			"name": "스위머",
			"nameKor": "스위머",
			"nameEng": "",
			"names": [
				"스위머"
			]
		},
		{
			"teamID": 421,
			"name": "스위밍차일드",
			"nameKor": "스위밍차일드",
			"nameEng": "",
			"names": [
				"스위밍차일드"
			]
		},
		{
			"teamID": 422,
			"name": "스윈스타",
			"nameKor": "스윈스타",
			"nameEng": "",
			"names": [
				"스윈스타"
			]
		},
		{
			"teamID": 423,
			"name": "스윔",
			"nameKor": "스윔",
			"nameEng": "",
			"names": [
				"스윔"
			]
		},
		{
			"teamID": 424,
			"name": "스윔18",
			"nameKor": "스윔18",
			"nameEng": "",
			"names": [
				"스윔18"
			]
		},
		{
			"teamID": 425,
			"name": "스윔닥터",
			"nameKor": "스윔닥터",
			"nameEng": "",
			"names": [
				"스윔닥터"
			]
		},
		{
			"teamID": 426,
			"name": "스윔라인",
			"nameKor": "스윔라인",
			"nameEng": "",
			"names": [
				"스윔라인"
			]
		},
		{
			"teamID": 427,
			"name": "스윔마루",
			"nameKor": "스윔마루",
			"nameEng": "",
			"names": [
				"스윔마루"
			]
		},
		{
			"teamID": 428,
			"name": "스윔브로",
			"nameKor": "스윔브로",
			"nameEng": "",
			"names": [
				"스윔브로"
			]
		},
		{
			"teamID": 429,
			"name": "스윔스타",
			"nameKor": "스윔스타",
			"nameEng": "",
			"names": [
				"스윔스타"
			]
		},
		{
			"teamID": 430,
			"name": "스윔크루",
			"nameKor": "스윔크루",
			"nameEng": "",
			"names": [
				"스윔크루"
			]
		},
		{
			"teamID": 431,
			"name": "스윔포유",
			"nameKor": "스윔포유",
			"nameEng": "",
			"names": [
				"스윔포유"
			]
		},
		{
			"teamID": 432,
			"name": "스윔플림",
			"nameKor": "스윔플림",
			"nameEng": "",
			"names": [
				"스윔플림"
			]
		},
		{
			"teamID": 433,
			"name": "스윔홀릭",
			"nameKor": "스윔홀릭",
			"nameEng": "",
			"names": [
				"스윔홀릭"
			]
		},
		{
			"teamID": 434,
			"name": "승산핀",
			"nameKor": "승산핀",
			"nameEng": "",
			"names": [
				"승산핀"
			]
		},
		{
			"teamID": 435,
			"name": "식스웨이브",
			"nameKor": "식스웨이브",
			"nameEng": "",
			"names": [
				"식스웨이브",
				"식스웨이브A",
				"식스웨이브B",
				"식스웨이브C"
			]
		},
		{
			"teamID": 436,
			"name": "신동교육문화회관",
			"nameKor": "신동교육문화회관",
			"nameEng": "",
			"names": [
				"신동교육문화회관"
			]
		},
		{
			"teamID": 437,
			"name": "신동스포츠",
			"nameKor": "신동스포츠",
			"nameEng": "",
			"names": [
				"신동스포츠"
			]
		},
		{
			"teamID": 438,
			"name": "신촌물메기",
			"nameKor": "신촌물메기",
			"nameEng": "",
			"names": [
				"신촌물메기"
			]
		},
		{
			"teamID": 439,
			"name": "쌍용차&평택수영연맹",
			"nameKor": "쌍용차&평택수영연맹",
			"nameEng": "",
			"names": [
				"쌍용차&평택수영연맹"
			]
		},
		{
			"teamID": 440,
			"name": "아대다",
			"nameKor": "아대다",
			"nameEng": "",
			"names": [
				"아대다"
			]
		},
		{
			"teamID": 441,
			"name": "아띠랑스도곡대치클럽",
			"nameKor": "아띠랑스도곡대치클럽",
			"nameEng": "",
			"names": [
				"아띠랑스도곡대치클럽"
			]
		},
		{
			"teamID": 442,
			"name": "아론피에스",
			"nameKor": "아론피에스",
			"nameEng": "",
			"names": [
				"아론피에스"
			]
		},
		{
			"teamID": 443,
			"name": "아마존수영",
			"nameKor": "아마존수영",
			"nameEng": "",
			"names": [
				"아마존수영"
			]
		},
		{
			"teamID": 444,
			"name": "아산배미마스터즈",
			"nameKor": "아산배미마스터즈",
			"nameEng": "",
			"names": [
				"아산배미마스터즈"
			]
		},
		{
			"teamID": 445,
			"name": "아산웨이브",
			"nameKor": "아산웨이브",
			"nameEng": "",
			"names": [
				"아산웨이브"
			]
		},
		{
			"teamID": 446,
			"name": "아산인주",
			"nameKor": "아산인주",
			"nameEng": "",
			"names": [
				"아산인주"
			]
		},
		{
			"teamID": 447,
			"name": "아일랜드튜튜",
			"nameKor": "아일랜드튜튜",
			"nameEng": "",
			"names": [
				"아일랜드튜튜"
			]
		},
		{
			"teamID": 448,
			"name": "아죽겠다",
			"nameKor": "아죽겠다",
			"nameEng": "",
			"names": [
				"아죽겠다"
			]
		},
		{
			"teamID": 449,
			"name": "아트스위밍",
			"nameKor": "아트스위밍",
			"nameEng": "",
			"names": [
				"아트스위밍"
			]
		},
		{
			"teamID": 450,
			"name": "안동수영사랑",
			"nameKor": "안동수영사랑",
			"nameEng": "",
			"names": [
				"안동수영사랑"
			]
		},
		{
			"teamID": 451,
			"name": "안동수영의달인",
			"nameKor": "안동수영의달인",
			"nameEng": "",
			"names": [
				"안동수영의달인"
			]
		},
		{
			"teamID": 452,
			"name": "안산선부체육관",
			"nameKor": "안산선부체육관",
			"nameEng": "",
			"names": [
				"안산선부체육관"
			]
		},
		{
			"teamID": 453,
			"name": "안산신길",
			"nameKor": "안산신길",
			"nameEng": "",
			"names": [
				"안산신길"
			]
		},
		{
			"teamID": 454,
			"name": "야생연어",
			"nameKor": "야생연어",
			"nameEng": "",
			"names": [
				"야생연어"
			]
		},
		{
			"teamID": 455,
			"name": "양정양오",
			"nameKor": "양정양오",
			"nameEng": "",
			"names": [
				"양정양오"
			]
		},
		{
			"teamID": 456,
			"name": "양환팸",
			"nameKor": "양환팸",
			"nameEng": "",
			"names": [
				"양환팸"
			]
		},
		{
			"teamID": 457,
			"name": "어깨",
			"nameKor": "어깨",
			"nameEng": "",
			"names": [
				"어깨"
			]
		},
		{
			"teamID": 458,
			"name": "어쩌다수영",
			"nameKor": "어쩌다수영",
			"nameEng": "",
			"names": [
				"어쩌다수영"
			]
		},
		{
			"teamID": 459,
			"name": "어푸어푸",
			"nameKor": "어푸어푸",
			"nameEng": "",
			"names": [
				"어푸어푸",
				"어푸어푸1",
				"어푸어푸I",
				"어푸어푸II",
				"어푸어푸III"
			]
		},
		{
			"teamID": 460,
			"name": "에프엠",
			"nameKor": "에프엠",
			"nameEng": "",
			"names": [
				"에프엠"
			]
		},
		{
			"teamID": 461,
			"name": "엔돌핀",
			"nameKor": "엔돌핀",
			"nameEng": "",
			"names": [
				"엔돌핀"
			]
		},
		{
			"teamID": 462,
			"name": "엘엔피파트너스",
			"nameKor": "엘엔피파트너스",
			"nameEng": "",
			"names": [
				"엘엔피파트너스"
			]
		},
		{
			"teamID": 463,
			"name": "여섯시사십분",
			"nameKor": "여섯시사십분",
			"nameEng": "",
			"names": [
				"여섯시사십분"
			]
		},
		{
			"teamID": 464,
			"name": "연세대물사랑",
			"nameKor": "연세대물사랑",
			"nameEng": "",
			"names": [
				"연세대물사랑"
			]
		},
		{
			"teamID": 465,
			"name": "연세대학교",
			"nameKor": "연세대학교",
			"nameEng": "",
			"names": [
				"서울연세1"
			]
		},
		{
			"teamID": 466,
			"name": "영남대학교",
			"nameKor": "영남대학교",
			"nameEng": "",
			"names": [
				"경북영남4"
			]
		},
		{
			"teamID": 467,
			"name": "영스포츠",
			"nameKor": "영스포츠",
			"nameEng": "",
			"names": [
				"영스포츠"
			]
		},
		{
			"teamID": 468,
			"name": "영월군수영연맹",
			"nameKor": "영월군수영연맹",
			"nameEng": "",
			"names": [
				"영월군수영연맹",
				"영월수영연맹"
			]
		},
		{
			"teamID": 469,
			"name": "영월아리랑래프팅",
			"nameKor": "영월아리랑래프팅",
			"nameEng": "",
			"names": [
				"영월아리랑래프팅"
			]
		},
		{
			"teamID": 470,
			"name": "영환팸",
			"nameKor": "영환팸",
			"nameEng": "",
			"names": [
				"영환팸"
			]
		},
		{
			"teamID": 471,
			"name": "예체능",
			"nameKor": "예체능",
			"nameEng": "",
			"names": [
				"예체능"
			]
		},
		{
			"teamID": 472,
			"name": "오돌핀클럽",
			"nameKor": "오돌핀클럽",
			"nameEng": "",
			"names": [
				"오돌핀클럽"
			]
		},
		{
			"teamID": 473,
			"name": "오로나민",
			"nameKor": "오로나민",
			"nameEng": "",
			"names": [
				"오로나민"
			]
		},
		{
			"teamID": 474,
			"name": "오르카",
			"nameKor": "오르카",
			"nameEng": "",
			"names": [
				"오르카"
			]
		},
		{
			"teamID": 475,
			"name": "오빠국수",
			"nameKor": "오빠국수",
			"nameEng": "",
			"names": [
				"오빠국수"
			]
		},
		{
			"teamID": 476,
			"name": "오산스포츠클럽",
			"nameKor": "오산스포츠클럽",
			"nameEng": "",
			"names": [
				"오산스포츠클럽"
			]
		},
		{
			"teamID": 477,
			"name": "오산시수영연맹",
			"nameKor": "오산시수영연맹",
			"nameEng": "",
			"names": [
				"오산시수영연맹",
				"오산시수영연맹A",
				"오산시수영연맹B"
			]
		},
		{
			"teamID": 478,
			"name": "오산시청",
			"nameKor": "오산시청",
			"nameEng": "",
			"names": [
				"오산시청"
			]
		},
		{
			"teamID": 479,
			"name": "오션차일드",
			"nameKor": "오션차일드",
			"nameEng": "",
			"names": [
				"오션차일드"
			]
		},
		{
			"teamID": 480,
			"name": "오션키즈강동",
			"nameKor": "오션키즈강동",
			"nameEng": "",
			"names": [
				"오션키즈강동"
			]
		},
		{
			"teamID": 481,
			"name": "오픈케어",
			"nameKor": "오픈케어",
			"nameEng": "",
			"names": [
				"오픈케어"
			]
		},
		{
			"teamID": 482,
			"name": "온니수",
			"nameKor": "온니수",
			"nameEng": "",
			"names": [
				"온니수"
			]
		},
		{
			"teamID": 483,
			"name": "온조대왕체육센터",
			"nameKor": "온조대왕체육센터",
			"nameEng": "",
			"names": [
				"온조대왕체육센터"
			]
		},
		{
			"teamID": 484,
			"name": "올가미",
			"nameKor": "올가미",
			"nameEng": "",
			"names": [
				"올가미"
			]
		},
		{
			"teamID": 485,
			"name": "올포디움",
			"nameKor": "올포디움",
			"nameEng": "",
			"names": [
				"올포디움"
			]
		},
		{
			"teamID": 486,
			"name": "왈이의마음단련장",
			"nameKor": "왈이의마음단련장",
			"nameEng": "",
			"names": [
				"왈이의마음단련장"
			]
		},
		{
			"teamID": 487,
			"name": "용곡CNC",
			"nameKor": "용곡CNC",
			"nameEng": "",
			"names": [
				"용곡CNC"
			]
		},
		{
			"teamID": 488,
			"name": "용답체육센터",
			"nameKor": "용답체육센터",
			"nameEng": "",
			"names": [
				"용답체육센터"
			]
		},
		{
			"teamID": 489,
			"name": "용운국제수영장",
			"nameKor": "용운국제수영장",
			"nameEng": "",
			"names": [
				"용운국제수영장"
			]
		},
		{
			"teamID": 490,
			"name": "용운키즈",
			"nameKor": "용운키즈",
			"nameEng": "",
			"names": [
				"용운키즈"
			]
		},
		{
			"teamID": 491,
			"name": "용인시수영연맹",
			"nameKor": "용인시수영연맹",
			"nameEng": "",
			"names": [
				"용인시수영연맹"
			]
		},
		{
			"teamID": 492,
			"name": "우송대학교",
			"nameKor": "우송대학교",
			"nameEng": "",
			"names": [
				"우송대학교"
			]
		},
		{
			"teamID": 493,
			"name": "우수랑",
			"nameKor": "우수랑",
			"nameEng": "",
			"names": [
				"우수랑"
			]
		},
		{
			"teamID": 494,
			"name": "우파루파",
			"nameKor": "우파루파",
			"nameEng": "",
			"names": [
				"우파루파"
			]
		},
		{
			"teamID": 495,
			"name": "울산",
			"nameKor": "울산",
			"nameEng": "",
			"names": [
				"울산"
			]
		},
		{
			"teamID": 496,
			"name": "울산대학교",
			"nameKor": "울산대학교",
			"nameEng": "",
			"names": [
				"울산울산1"
			]
		},
		{
			"teamID": 497,
			"name": "울산수영",
			"nameKor": "울산수영",
			"nameEng": "",
			"names": [
				"울산수영"
			]
		},
		{
			"teamID": 498,
			"name": "울산수영사랑",
			"nameKor": "울산수영사랑",
			"nameEng": "",
			"names": [
				"울산수영사랑"
			]
		},
		{
			"teamID": 499,
			"name": "울산울산시청",
			"nameKor": "울산울산시청",
			"nameEng": "",
			"names": [
				"울산울산시청"
			]
		},
		{
			"teamID": 500,
			"name": "울산핀수영",
			"nameKor": "울산핀수영",
			"nameEng": "",
			"names": [
				"울산핀수영",
				"울산핀수영"
			]
		},
		{
			"teamID": 501,
			"name": "울산훤",
			"nameKor": "울산훤",
			"nameEng": "",
			"names": [
				"울산훤"
			]
		},
		{
			"teamID": 502,
			"name": "울산휜",
			"nameKor": "울산휜",
			"nameEng": "",
			"names": [
				"울산휜"
			]
		},
		{
			"teamID": 503,
			"name": "울수사",
			"nameKor": "울수사",
			"nameEng": "",
			"names": [
				"울수사"
			]
		},
		{
			"teamID": 504,
			"name": "웃음바다",
			"nameKor": "웃음바다",
			"nameEng": "",
			"names": [
				"웃음바다"
			]
		},
		{
			"teamID": 505,
			"name": "워터걸스",
			"nameKor": "워터걸스",
			"nameEng": "",
			"names": [
				"워터걸스"
			]
		},
		{
			"teamID": 506,
			"name": "워터고스트",
			"nameKor": "워터고스트",
			"nameEng": "",
			"names": [
				"워터고스트"
			]
		},
		{
			"teamID": 507,
			"name": "워터엔젤",
			"nameKor": "워터엔젤",
			"nameEng": "",
			"names": [
				"워터엔젤"
			]
		},
		{
			"teamID": 508,
			"name": "월계체육센터",
			"nameKor": "월계체육센터",
			"nameEng": "",
			"names": [
				"월계체육센터"
			]
		},
		{
			"teamID": 509,
			"name": "월드BTS송강",
			"nameKor": "월드BTS송강",
			"nameEng": "",
			"names": [
				"월드BTS송강"
			]
		},
		{
			"teamID": 510,
			"name": "월드스포츠센터",
			"nameKor": "월드스포츠센터",
			"nameEng": "",
			"names": [
				"월드스포츠센터"
			]
		},
		{
			"teamID": 511,
			"name": "월드스포츠컨설팅",
			"nameKor": "월드스포츠컨설팅",
			"nameEng": "",
			"names": [
				"월드스포츠컨설팅"
			]
		},
		{
			"teamID": 512,
			"name": "월드컵스포츠센터",
			"nameKor": "월드컵스포츠센터",
			"nameEng": "",
			"names": [
				"월드컵스포츠센터"
			]
		},
		{
			"teamID": 513,
			"name": "웜업",
			"nameKor": "웜업",
			"nameEng": "",
			"names": [
				"웜업"
			]
		},
		{
			"teamID": 514,
			"name": "웜풀",
			"nameKor": "웜풀",
			"nameEng": "",
			"names": [
				"웜풀"
			]
		},
		{
			"teamID": 515,
			"name": "유니버시아드레포츠센터",
			"nameKor": "유니버시아드레포츠센터",
			"nameEng": "",
			"names": [
				"유니버시아드레포츠센터"
			]
		},
		{
			"teamID": 516,
			"name": "유니스팸",
			"nameKor": "유니스팸",
			"nameEng": "",
			"names": [
				"유니스팸"
			]
		},
		{
			"teamID": 517,
			"name": "유달마스터즈",
			"nameKor": "유달마스터즈",
			"nameEng": "",
			"names": [
				"유달마스터즈",
				"유달마스터즈"
			]
		},
		{
			"teamID": 518,
			"name": "육군사관학교",
			"nameKor": "육군사관학교",
			"nameEng": "",
			"names": [
				"육군사관학교"
			]
		},
		{
			"teamID": 519,
			"name": "음파음파",
			"nameKor": "음파음파",
			"nameEng": "",
			"names": [
				"음파음파"
			]
		},
		{
			"teamID": 520,
			"name": "이원",
			"nameKor": "이원",
			"nameEng": "",
			"names": [
				"이원"
			]
		},
		{
			"teamID": 521,
			"name": "이화여자대학교",
			"nameKor": "이화여자대학교",
			"nameEng": "",
			"names": [
				"서울이화여4"
			]
		},
		{
			"teamID": 522,
			"name": "익산솜사탕",
			"nameKor": "익산솜사탕",
			"nameEng": "",
			"names": [
				"익산솜사탕"
			]
		},
		{
			"teamID": 523,
			"name": "인스윔",
			"nameKor": "인스윔",
			"nameEng": "",
			"names": [
				"인스윔"
			]
		},
		{
			"teamID": 524,
			"name": "인싸",
			"nameKor": "인싸",
			"nameEng": "",
			"names": [
				"인싸"
			]
		},
		{
			"teamID": 525,
			"name": "인천",
			"nameKor": "인천",
			"nameEng": "",
			"names": [
				"인천"
			]
		},
		{
			"teamID": 526,
			"name": "인천광역시수영연맹",
			"nameKor": "인천광역시수영연맹",
			"nameEng": "",
			"names": [
				"인천광역시수영연맹"
			]
		},
		{
			"teamID": 527,
			"name": "인천수영연합회",
			"nameKor": "인천수영연합회",
			"nameEng": "",
			"names": [
				"인천수영연합회",
				"인천수영연합회A",
				"인천수영연합회B"
			]
		},
		{
			"teamID": 528,
			"name": "인천인천시청",
			"nameKor": "인천인천시청",
			"nameEng": "",
			"names": [
				"인천인천시청"
			]
		},
		{
			"teamID": 529,
			"name": "인천인천전문",
			"nameKor": "인천인천전문",
			"nameEng": "",
			"names": [
				"인천인천전문1",
				"인천인천전문2"
			]
		},
		{
			"teamID": 530,
			"name": "인하대학교",
			"nameKor": "인하대학교",
			"nameEng": "",
			"names": [
				"인천인하3"
			]
		},
		{
			"teamID": 531,
			"name": "일반",
			"nameKor": "일반",
			"nameEng": "",
			"names": [
				"일반"
			]
		},
		{
			"teamID": 532,
			"name": "자유영차",
			"nameKor": "자유영차",
			"nameEng": "",
			"names": [
				"자유영차"
			]
		},
		{
			"teamID": 533,
			"name": "자유형냐",
			"nameKor": "자유형냐",
			"nameEng": "",
			"names": [
				"자유형냐"
			]
		},
		{
			"teamID": 534,
			"name": "장위연스포츠",
			"nameKor": "장위연스포츠",
			"nameEng": "",
			"names": [
				"장위연스포츠"
			]
		},
		{
			"teamID": 535,
			"name": "재미삼아",
			"nameKor": "재미삼아",
			"nameEng": "",
			"names": [
				"재미삼아"
			]
		},
		{
			"teamID": 536,
			"name": "저속주행",
			"nameKor": "저속주행",
			"nameEng": "",
			"names": [
				"저속주행"
			]
		},
		{
			"teamID": 537,
			"name": "저스라GO",
			"nameKor": "저스라go",
			"nameEng": "",
			"names": [
				"저스라go"
			]
		},
		{
			"teamID": 538,
			"name": "전곡SC",
			"nameKor": "전곡SC",
			"nameEng": "",
			"names": [
				"전곡SC"
			]
		},
		{
			"teamID": 539,
			"name": "전남",
			"nameKor": "전남",
			"nameEng": "",
			"names": [
				"전남"
			]
		},
		{
			"teamID": 540,
			"name": "전남대불",
			"nameKor": "전남대불",
			"nameEng": "",
			"names": [
				"전남대불2",
				"전남대불3"
			]
		},
		{
			"teamID": 541,
			"name": "전남수영연맹",
			"nameKor": "전남수영연맹",
			"nameEng": "",
			"names": [
				"전남수영연맹"
			]
		},
		{
			"teamID": 542,
			"name": "전북",
			"nameKor": "전북",
			"nameEng": "",
			"names": [
				"전북"
			]
		},
		{
			"teamID": 543,
			"name": "전북수영연맹",
			"nameKor": "전북수영연맹",
			"nameEng": "",
			"names": [
				"전북수영연맹"
			]
		},
		{
			"teamID": 544,
			"name": "전북전주시청",
			"nameKor": "전북전주시청",
			"nameEng": "",
			"names": [
				"전북전주시청"
			]
		},
		{
			"teamID": 545,
			"name": "전북체육회",
			"nameKor": "전북체육회",
			"nameEng": "",
			"names": [
				"전북체육회"
			]
		},
		{
			"teamID": 546,
			"name": "전주마린스",
			"nameKor": "전주마린스",
			"nameEng": "",
			"names": [
				"전주마린스"
			]
		},
		{
			"teamID": 547,
			"name": "접영꿈나무",
			"nameKor": "접영꿈나무",
			"nameEng": "",
			"names": [
				"접영꿈나무"
			]
		},
		{
			"teamID": 548,
			"name": "젓어브러",
			"nameKor": "젓어브러",
			"nameEng": "",
			"names": [
				"젓어브러"
			]
		},
		{
			"teamID": 549,
			"name": "정통파",
			"nameKor": "정통파",
			"nameEng": "",
			"names": [
				"정통파"
			]
		},
		{
			"teamID": 550,
			"name": "제이팀",
			"nameKor": "제이팀",
			"nameEng": "",
			"names": [
				"제이팀"
			]
		},
		{
			"teamID": 551,
			"name": "제주",
			"nameKor": "제주",
			"nameEng": "",
			"names": [
				"제주"
			]
		},
		{
			"teamID": 552,
			"name": "제주제주시청",
			"nameKor": "제주제주시청",
			"nameEng": "",
			"names": [
				"제주제주시청"
			]
		},
		{
			"teamID": 553,
			"name": "조손강정",
			"nameKor": "조손강정",
			"nameEng": "",
			"names": [
				"조손강정"
			]
		},
		{
			"teamID": 554,
			"name": "종로휘트니스",
			"nameKor": "종로휘트니스",
			"nameEng": "",
			"names": [
				"종로휘트니스"
			]
		},
		{
			"teamID": 555,
			"name": "중랑구민체육센터",
			"nameKor": "중랑구민체육센터",
			"nameEng": "",
			"names": [
				"중랑구민체육센터"
			]
		},
		{
			"teamID": 556,
			"name": "중랑구수영연맹",
			"nameKor": "중랑구수영연맹",
			"nameEng": "",
			"names": [
				"중랑구수영연맹"
			]
		},
		{
			"teamID": 557,
			"name": "중앙대학교",
			"nameKor": "중앙대학교",
			"nameEng": "",
			"names": [
				"경기중앙2",
				"서울중앙1"
			]
		},
		{
			"teamID": 558,
			"name": "지느러미",
			"nameKor": "지느러미",
			"nameEng": "",
			"names": [
				"지느러미"
			]
		},
		{
			"teamID": 559,
			"name": "진명",
			"nameKor": "진명",
			"nameEng": "",
			"names": [
				"진명"
			]
		},
		{
			"teamID": 560,
			"name": "진잠수영장",
			"nameKor": "진잠수영장",
			"nameEng": "",
			"names": [
				"진잠수영장"
			]
		},
		{
			"teamID": 561,
			"name": "진주스포츠클럽",
			"nameKor": "진주스포츠클럽",
			"nameEng": "",
			"names": [
				"진주스포츠클럽"
			]
		},
		{
			"teamID": 562,
			"name": "진해수영연합",
			"nameKor": "진해수영연합",
			"nameEng": "",
			"names": [
				"진해수영연합"
			]
		},
		{
			"teamID": 563,
			"name": "차차차",
			"nameKor": "차차차",
			"nameEng": "",
			"names": [
				"차차차"
			]
		},
		{
			"teamID": 564,
			"name": "참돌",
			"nameKor": "참돌",
			"nameEng": "",
			"names": [
				"참돌"
			]
		},
		{
			"teamID": 565,
			"name": "창수연",
			"nameKor": "창수연",
			"nameEng": "",
			"names": [
				"창수연"
			]
		},
		{
			"teamID": 566,
			"name": "창원시",
			"nameKor": "창원시",
			"nameEng": "",
			"names": [
				"창원시"
			]
		},
		{
			"teamID": 567,
			"name": "처음처럼",
			"nameKor": "처음처럼",
			"nameEng": "",
			"names": [
				"처음처럼"
			]
		},
		{
			"teamID": 568,
			"name": "천마스포츠",
			"nameKor": "천마스포츠",
			"nameEng": "",
			"names": [
				"천마스포츠"
			]
		},
		{
			"teamID": 569,
			"name": "천마하이파이브",
			"nameKor": "천마하이파이브",
			"nameEng": "",
			"names": [
				"천마하이파이브"
			]
		},
		{
			"teamID": 570,
			"name": "천사팀",
			"nameKor": "천사팀",
			"nameEng": "",
			"names": [
				"천사팀"
			]
		},
		{
			"teamID": 571,
			"name": "천안종합운동장",
			"nameKor": "천안종합운동장",
			"nameEng": "",
			"names": [
				"천안종합운동장"
			]
		},
		{
			"teamID": 572,
			"name": "철인28호",
			"nameKor": "철인28호",
			"nameEng": "",
			"names": [
				"철인28호"
			]
		},
		{
			"teamID": 573,
			"name": "청어람",
			"nameKor": "청어람",
			"nameEng": "",
			"names": [
				"청아람1",
				"청아람2",
				"청어람",
				"청어람1",
				"청어람2",
				"청어람A",
				"청어람B",
				"청어람C",
				"청어람D"
			]
		},
		{
			"teamID": 574,
			"name": "청운",
			"nameKor": "청운",
			"nameEng": "",
			"names": [
				"청운"
			]
		},
		{
			"teamID": 575,
			"name": "초당",
			"nameKor": "초당",
			"nameEng": "",
			"names": [
				"초당"
			]
		},
		{
			"teamID": 576,
			"name": "초삼",
			"nameKor": "초삼",
			"nameEng": "",
			"names": [
				"초삼"
			]
		},
		{
			"teamID": 577,
			"name": "최강모녀",
			"nameKor": "최강모녀",
			"nameEng": "",
			"names": [
				"최강모녀"
			]
		},
		{
			"teamID": 578,
			"name": "춘천수영사랑",
			"nameKor": "춘천수영사랑",
			"nameEng": "",
			"names": [
				"춘천수영사랑"
			]
		},
		{
			"teamID": 579,
			"name": "충남",
			"nameKor": "충남",
			"nameEng": "",
			"names": [
				"충남"
			]
		},
		{
			"teamID": 580,
			"name": "충남대수영장",
			"nameKor": "충남대수영장",
			"nameEng": "",
			"names": [
				"충남대수영장"
			]
		},
		{
			"teamID": 581,
			"name": "충남대학교",
			"nameKor": "충남대학교",
			"nameEng": "",
			"names": [
				"대전충남1",
				"대전충남2",
				"대전충남4"
			]
		},
		{
			"teamID": 582,
			"name": "충남아산시청",
			"nameKor": "충남아산시청",
			"nameEng": "",
			"names": [
				"충남아산시청"
			]
		},
		{
			"teamID": 583,
			"name": "충북",
			"nameKor": "충북",
			"nameEng": "",
			"names": [
				"충북"
			]
		},
		{
			"teamID": 584,
			"name": "충북수영연맹",
			"nameKor": "충북수영연맹",
			"nameEng": "",
			"names": [
				"충북수영연맹"
			]
		},
		{
			"teamID": 585,
			"name": "충북신한은행",
			"nameKor": "충북신한은행",
			"nameEng": "",
			"names": [
				"충북신한은행"
			]
		},
		{
			"teamID": 586,
			"name": "칠새기K",
			"nameKor": "칠새기K",
			"nameEng": "",
			"names": [
				"칠새기K"
			]
		},
		{
			"teamID": 587,
			"name": "코어",
			"nameKor": "코어",
			"nameEng": "",
			"names": [
				"코어"
			]
		},
		{
			"teamID": 588,
			"name": "클래스윔",
			"nameKor": "클래스윔",
			"nameEng": "",
			"names": [
				"클래스윔"
			]
		},
		{
			"teamID": 589,
			"name": "킵스위밍",
			"nameKor": "킵스위밍",
			"nameEng": "",
			"names": [
				"킵스위밍"
			]
		},
		{
			"teamID": 590,
			"name": "트리플썬",
			"nameKor": "트리플썬",
			"nameEng": "",
			"names": [
				"트리플썬"
			]
		},
		{
			"teamID": 591,
			"name": "팀9",
			"nameKor": "팀9",
			"nameEng": "",
			"names": [
				"팀9"
			]
		},
		{
			"teamID": 592,
			"name": "팀DC",
			"nameKor": "팀DC",
			"nameEng": "",
			"names": [
				"팀DC"
			]
		},
		{
			"teamID": 593,
			"name": "팀K",
			"nameKor": "팀K",
			"nameEng": "",
			"names": [
				"팀K"
			]
		},
		{
			"teamID": 594,
			"name": "팀경구",
			"nameKor": "팀경구",
			"nameEng": "",
			"names": [
				"팀경구"
			]
		},
		{
			"teamID": 595,
			"name": "팀구",
			"nameKor": "팀구",
			"nameEng": "",
			"names": [
				"팀구"
			]
		},
		{
			"teamID": 596,
			"name": "팀균",
			"nameKor": "팀균",
			"nameEng": "",
			"names": [
				"팀균"
			]
		},
		{
			"teamID": 597,
			"name": "팀동네형님",
			"nameKor": "팀동네형님",
			"nameEng": "",
			"names": [
				"팀동네형님"
			]
		},
		{
			"teamID": 598,
			"name": "팀사직",
			"nameKor": "팀사직",
			"nameEng": "",
			"names": [
				"팀사직"
			]
		},
		{
			"teamID": 599,
			"name": "팀샤크스윔",
			"nameKor": "팀샤크스윔",
			"nameEng": "",
			"names": [
				"팀샤크스윔"
			]
		},
		{
			"teamID": 600,
			"name": "팀아산",
			"nameKor": "팀아산",
			"nameEng": "",
			"names": [
				"팀아산"
			]
		},
		{
			"teamID": 601,
			"name": "팀전주",
			"nameKor": "팀전주",
			"nameEng": "",
			"names": [
				"팀전주"
			]
		},
		{
			"teamID": 602,
			"name": "팀진주",
			"nameKor": "팀진주",
			"nameEng": "",
			"names": [
				"팀진주"
			]
		},
		{
			"teamID": 603,
			"name": "팀창원",
			"nameKor": "팀창원",
			"nameEng": "",
			"names": [
				"팀창원"
			]
		},
		{
			"teamID": 604,
			"name": "팀퐈",
			"nameKor": "팀퐈",
			"nameEng": "",
			"names": [
				"팀퐈"
			]
		},
		{
			"teamID": 605,
			"name": "팀피닉스",
			"nameKor": "팀피닉스",
			"nameEng": "",
			"names": [
				"팀피닉스"
			]
		},
		{
			"teamID": 606,
			"name": "팀후그",
			"nameKor": "팀후그",
			"nameEng": "",
			"names": [
				"팀후그"
			]
		},
		{
			"teamID": 607,
			"name": "파랑새스포츠센터",
			"nameKor": "파랑새스포츠센터",
			"nameEng": "",
			"names": [
				"파랑새스포츠센터",
				"파랑새스포츠센터A",
				"파랑새스포츠센터B",
				"파랑새스포츠클럽B"
			]
		},
		{
			"teamID": 608,
			"name": "파랑새유소년스포츠클럽",
			"nameKor": "파랑새유소년스포츠클럽",
			"nameEng": "",
			"names": [
				"파랑새유소년스포츠클럽"
			]
		},
		{
			"teamID": 609,
			"name": "파이시스",
			"nameKor": "파이시스",
			"nameEng": "",
			"names": [
				"파이시스"
			]
		},
		{
			"teamID": 610,
			"name": "파주운정육수",
			"nameKor": "파주운정육수",
			"nameEng": "",
			"names": [
				"파주운정육수"
			]
		},
		{
			"teamID": 611,
			"name": "평송수영장",
			"nameKor": "평송수영장",
			"nameEng": "",
			"names": [
				"평송수영장"
			]
		},
		{
			"teamID": 612,
			"name": "평창수영",
			"nameKor": "평창수영",
			"nameEng": "",
			"names": [
				"평창수영"
			]
		},
		{
			"teamID": 613,
			"name": "평택",
			"nameKor": "평택",
			"nameEng": "",
			"names": [
				"평택"
			]
		},
		{
			"teamID": 614,
			"name": "포항시수영연맹",
			"nameKor": "포항시수영연맹",
			"nameEng": "",
			"names": [
				"포수연",
				"포항시수영연맹"
			]
		},
		{
			"teamID": 615,
			"name": "폭주기관차",
			"nameKor": "폭주기관차",
			"nameEng": "",
			"names": [
				"폭주기관차",
				"폭주기관차A",
				"폭주기관차B",
				"폭주기관차C",
				"폭주기관차D",
				"폭주기관차E",
				"폭주기관차F",
				"폭주기관차A",
				"폭주기관차B",
				"폭주기관차C"
			]
		},
		{
			"teamID": 616,
			"name": "푸른수영BY제제",
			"nameKor": "푸른수영by제제",
			"nameEng": "",
			"names": [
				"푸른수영by제제"
			]
		},
		{
			"teamID": 617,
			"name": "프리",
			"nameKor": "프리",
			"nameEng": "",
			"names": [
				"프리"
			]
		},
		{
			"teamID": 618,
			"name": "프리스위밍",
			"nameKor": "프리스위밍",
			"nameEng": "",
			"names": [
				"프리스위밍",
				"프리수위밍",
				"프리스위밍"
			]
		},
		{
			"teamID": 619,
			"name": "프리스타일",
			"nameKor": "프리스타일",
			"nameEng": "",
			"names": [
				"프리스타일",
				"프리스타일"
			]
		},
		{
			"teamID": 620,
			"name": "플레이보이",
			"nameKor": "플레이보이",
			"nameEng": "",
			"names": [
				"플레이보이"
			]
		},
		{
			"teamID": 621,
			"name": "피스윔",
			"nameKor": "피스윔",
			"nameEng": "",
			"names": [
				"피스윔"
			]
		},
		{
			"teamID": 622,
			"name": "하니하니",
			"nameKor": "하니하니",
			"nameEng": "",
			"names": [
				"하니하니"
			]
		},
		{
			"teamID": 623,
			"name": "학생수영장",
			"nameKor": "학생수영장",
			"nameEng": "",
			"names": [
				"학생수영장"
			]
		},
		{
			"teamID": 624,
			"name": "한국체육대학교",
			"nameKor": "한국체육대학교",
			"nameEng": "",
			"names": [
				"한국체육대학교",
				"서울한체1",
				"서울한체2",
				"서울한체3",
				"서울한체4",
				"서울한체"
			]
		},
		{
			"teamID": 625,
			"name": "한밭수영장",
			"nameKor": "한밭수영장",
			"nameEng": "",
			"names": [
				"한밭수영장"
			]
		},
		{
			"teamID": 626,
			"name": "한샘레포츠타운",
			"nameKor": "한샘레포츠타운",
			"nameEng": "",
			"names": [
				"한샘레포츠타운"
			]
		},
		{
			"teamID": 627,
			"name": "한양대학교",
			"nameKor": "한양대학교",
			"nameEng": "",
			"names": [
				"한양대학교",
				"경기한양2",
				"경기한양4"
			]
		},
		{
			"teamID": 628,
			"name": "한어수",
			"nameKor": "한어수",
			"nameEng": "",
			"names": [
				"한어수"
			]
		},
		{
			"teamID": 629,
			"name": "한우클럽",
			"nameKor": "한우클럽",
			"nameEng": "",
			"names": [
				"한우클럽"
			]
		},
		{
			"teamID": 630,
			"name": "해운대그랜드호텔",
			"nameKor": "해운대그랜드호텔",
			"nameEng": "",
			"names": [
				"해운대그랜드호텔"
			]
		},
		{
			"teamID": 631,
			"name": "행복수영",
			"nameKor": "행복수영",
			"nameEng": "",
			"names": [
				"행복수영"
			]
		},
		{
			"teamID": 632,
			"name": "헤엄이",
			"nameKor": "헤엄이",
			"nameEng": "",
			"names": [
				"헤엄이"
			]
		},
		{
			"teamID": 633,
			"name": "현대",
			"nameKor": "현대",
			"nameEng": "",
			"names": [
				"현대"
			]
		},
		{
			"teamID": 634,
			"name": "현대자동차",
			"nameKor": "현대자동차",
			"nameEng": "",
			"names": [
				"현대자동차"
			]
		},
		{
			"teamID": 635,
			"name": "현이씨25",
			"nameKor": "현이씨25",
			"nameEng": "",
			"names": [
				"현이씨25"
			]
		},
		{
			"teamID": 636,
			"name": "형손이지",
			"nameKor": "형손이지",
			"nameEng": "",
			"names": [
				"형손이지"
			]
		},
		{
			"teamID": 637,
			"name": "호반수영장(6시상급반)",
			"nameKor": "호반수영장(6시상급반)",
			"nameEng": "",
			"names": [
				"호반수영장(6시상급반)"
			]
		},
		{
			"teamID": 638,
			"name": "호반연합",
			"nameKor": "호반연합",
			"nameEng": "",
			"names": [
				"호반연합"
			]
		},
		{
			"teamID": 639,
			"name": "호수마린스",
			"nameKor": "호수마린스",
			"nameEng": "",
			"names": [
				"호수마린스"
			]
		},
		{
			"teamID": 640,
			"name": "호원대학교",
			"nameKor": "호원대학교",
			"nameEng": "",
			"names": [
				"전북호원3"
			]
		},
		{
			"teamID": 641,
			"name": "호흡곤란",
			"nameKor": "호흡곤란",
			"nameEng": "",
			"names": [
				"호홉곤란",
				"호흡곤란"
			]
		},
		{
			"teamID": 642,
			"name": "홍TEAM",
			"nameKor": "홍Team",
			"nameEng": "",
			"names": [
				"홍team"
			]
		},
		{
			"teamID": 643,
			"name": "홍익대",
			"nameKor": "홍익대",
			"nameEng": "",
			"names": [
				"홍익대"
			]
		},
		{
			"teamID": 644,
			"name": "화계수영동호회",
			"nameKor": "화계수영동호회",
			"nameEng": "",
			"names": [
				"화계수영동호회"
			]
		},
		{
			"teamID": 645,
			"name": "화난개구리",
			"nameKor": "화난개구리",
			"nameEng": "",
			"names": [
				"화난개구리"
			]
		},
		{
			"teamID": 646,
			"name": "화도체육센터",
			"nameKor": "화도체육센터",
			"nameEng": "",
			"names": [
				"화도체육센터",
				"화도체육센터-혼성계영"
			]
		},
		{
			"teamID": 647,
			"name": "황학물개",
			"nameKor": "황학물개",
			"nameEng": "",
			"names": [
				"황학물개"
			]
		},
		{
			"teamID": 648,
			"name": "회오리",
			"nameKor": "회오리",
			"nameEng": "",
			"names": [
				"회오리"
			]
		},
		{
			"teamID": 649,
			"name": "훼미리",
			"nameKor": "훼미리",
			"nameEng": "",
			"names": [
				"훼미리",
				"훼미리스파"
			]
		},
		{
			"teamID": 650,
			"name": "휘몰이",
			"nameKor": "휘몰이",
			"nameEng": "",
			"names": [
				"휘몰이"
			]
		},
		{
			"teamID": 651,
			"name": "흐즈므르",
			"nameKor": "흐즈므르",
			"nameEng": "",
			"names": [
				"흐즈므르"
			]
		}
	];
	return teamArr;
	
	const context = {
		query: { },
		projection: {_id:0, },
		limit: 100000,
		skip: 0,
		sort: { teamID:1 },
	}
	const result = await mongodb.find(mongoCFG.Medalbank.teams, context);
	return result.data;
}

//=======================================================
exports.loadPools1 = async () => {
	const context = {
		query: {},
		projection: {_id:0, poolID:1, name:1, fullname:1, sido:1, },
		limit: 100000,
		skip: 0,
		sort: { poolID:1 },
	}
	const result = await mongodb.find(mongoCFG.Medalbank.pools, context);
	return result.data;
}

//=======================================================
exports.loadAthletes = async () => {
	const context = {
		query: { $or: [ {status: ""}, { status: { $exists: false }} ], },
		projection: {_id:0, athleteID:1, masters:1, individual:1, adult:1, gender:1, name:1, nameHide:1, teamID:1 },
		limit: 100000,
		skip: 0,
		sort: { athleteID:1 },
	}
	const result = await mongodb.find(mongoCFG.Medalbank.athletes, context);
	return result.data;
}

//=======================================================
exports.loadTimes = async (projection) => {
	const context = {
		query: {
			// competitionID: { $in: uploadedCompetitions },
			masters		: true,
			adult			: true,
			individual: true,
			athleteID	:{ $exists: true },
			poolID		:{ $exists: true },
			teamID		:{ $exists: true },
			$or: [ {status: ""}, { status: { $exists: false }} ],
			time			: { $gt: 0 }, fin: { $exists: false }
		},
		projection: {_id:0, timeID:1, teamID:1, athleteID:1, poolID:1, competitionID:1, gender:1, style:1, distance:1, team:1, name:1, nameHide:1, rank:1, time:1, times:1, datetime:1, },		
		limit: 500000,
		skip: 0,
		sort: { gender:1, style:1, distance:1, time:1 },
	}
	if (projection) context.projection = projection;
	
	const result = await mongodb.find(mongoCFG.Medalbank.times, context);
	return result.data;
}
//=======================================================

//=======================================================
//=======================================================
exports.loadCollections = async () => {
	console.time("loadCollection");

	//-----> loading
	this.competitions = await this.loadCompetitions();

	this.teams = await this.loadTeams();

	this.pools = await this.loadPools();

	this.athletes = await this.loadAthletes();

	this.times = await this.loadTimes();

	this.collections = {
		competitions: this.competitions,
		teams: this.teams,
		pools: this.pools,
		athletes: this.athletes,
		times: this.times,
	}

	console.log(`loaded ... competitions: ${this.competitions.length}, athletes: ${this.athletes.length}, teams: ${this.teams.length}, pools: ${this.pools.length}, times: ${this.times.length}`);

	console.timeEnd("loadCollection");

	return this.collections;
}
//=======================================================
//=======================================================
//=======================================================
