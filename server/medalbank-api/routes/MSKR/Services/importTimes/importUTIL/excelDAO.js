const fs          = require('fs');
const utilLibrary = require('../../../Util/utilLibrary');
const excelLibrary= require('../../../Util/excelLibrary');
const excel	      = new excelLibrary();
const XlsxPopulate= require('xlsx-populate');
const UtilDate    = require("../../../Util/utilDate");
const utilDate	  = new UtilDate();

const utilTimes    = require("../../../Util/utilTimes");
const mongoDB			= require('../../../Class/MongoDB');
const mongoCFG 		= require('../../../Config/mongoCFG');
const mskCFG 			= require('../../../Config/mskCFG');
const mongodb 		= new mongoDB(mongoCFG.Medalbank.database);

const TimesDAO 		= require('../../times/times.custom');

const Util        = require('./utilTimes');
const { Config }  = require('./config');


const cellAlpha = ["A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R","S","T","U","V","W","X","Y","Z","AA","AB","AC","AD","AE","AF","AG","AH","AI","AJ","AK","AL","AM","AN","AO","AP","AQ","AR","AS","AT","AU","AV","AW","AX","AY","AZ"];
const _distances= [ "25M", "50M", "100M", "200M", "400M", "800M", "100M", "1500M", ];
const _headerTime = "Times,TIMES,times,기록,M. LAP";
const _headerName = "Name,NAME,name,이름,성명,선수명";
const _headerTeam = "Team,TEAM,team,팀명,소속,소속팀,클럽명";

const competitionsHeader = [
	{ label: "cid", 			column: "competitionID", 		type: "n", width: 50, align: "right", },
	{ label: "order", 		column: "order", 						type: "n", width: 50, align: "right", },
	{ label: "대회명", 		column: "fullname",					type: "s", width: 250, },
	{ label: "stemID", 		column: "stemID", 					type: "n", width: 50, align: "right", },
	{ label: "poolID", 		column: "poolID", 					type: "n", width: 50, align: "right", },
	{ label: "pool", 			column: "pool", 						type: "s", width: 180, },
	{ label: "날짜start", column: "dateStart", 				type: "s", width: 80, },
	{ label: "날짜end", 	column: "dateEnd", 					type: "s", width: 80, },
	{ label: "hosts",			column: "hosts", 						type: "s", width: 50, },
	{ label: "managers", 	column: "managers", 				type: "s", width: 50, },
	{ label: "supporters",column: "supporters", 			type: "s", width: 50, },
	{ label: "sponsers", 	column: "sponsers", 				type: "s", width: 50, },
	{ label: "course", 		column: "course", 					type: "s", width: 50, },
	{ label: "measured", 	column: "measured", 				type: "s", width: 50, },

];

const timesHeader = [
	{ label: "timeID", 		column: "timeID", 					type: "n", width: 50, align: "right", },
	{ label: "heat",		column: "heat", 						type: "s", width: 50, },
	{ label: "masters", column: "masters", 					type: "s", width: 50, },
	{ label: "adult", 	column: "adult", 						type: "s", width: 50, },
	{ label: "individual", 		column: "individual", 			type: "s", width: 50, },
	{ label: "ageGroup", 	column: "ageGroup", 				type: "s", width: 130, },
	{ label: "gender", 		column: "gender", 					type: "s", width: 50, },
	{ label: "style", 		column: "style", 						type: "s", width: 110, },
	{ label: "course", 	column: "course", 					type: "s", width: 50, },
	{ label: "distance", 		column: "distance", 				type: "s", width: 50, },
	{ label: "round", 	column: "round", 						type: "s", width: 50, },
	{ label: "lane", 		column: "lane", 						type: "s", width: 50, align: "right", },
	{ label: "name", 		column: "name", 						type: "s", width: 180, },
	{ label: "age", 		column: "age", 							type: "s", width: 50, },
	{ label: "birth",		column: "birth", 						type: "s", width: 50, },
	{ label: "sido", 		column: "sido", 						type: "s", width: 50, },
	{ label: "team", 		column: "team", 						type: "s", width: 120, },
	{ label: "teamID", 	column: "teamID", 					type: "n", width: 50, },
	{ label: "names", 	column: "names", 						type: "s", width: 120, },
	{ label: "rank", 		column: "rank", 						type: "s", width: 50, align: "right", },
	{ label: "times", 		column: "times", 						type: "s", width: 70, align: "right", },
	{ label: "timeORG", column: "timeORG", 				type: "s", width: 70, align: "right", },
	{ label: "athleteID", 		column: "athleteID", 				type: "n", width: 50, align: "right", },
	{ label: "status", 		column: "status", 					type: "s", width: 50, },
	{ label: "datetime", 		column: "datetime", 				type: "s", width: 80, },
	{ label: "competitionID", 		column: "competitionID", 		type: "n", width: 50, align: "right", },
	{ label: "competitionName", 	column: "competitionName",	type: "s", width: 250, },
	{ label: "stemID", 	column: "stemID", 					type: "n", width: 50, align: "right", },
	{ label: "poolID", 	column: "poolID", 					type: "n", width: 50, align: "right", },
	{ label: "pool", 		column: "pool", 						type: "s", width: 180, },
	{ label: "sheet", 	column: "sheet", 						type: "s", width: 100, },
];

const _completeTimesHeaders = [
	{ label: '순서', name: 'no' },
	{ label: 'heatCode', name: 'heatCode' },
	{ label: 'category', name: 'category' },
	{ label: 'school', name: 'school' },
	{ label: '연령대', name: 'ageGroup' },
	{ label: '성별', name: 'gender' },
	{ label: '영법', name: 'style' },
	{ label: '거리', name: 'distance' },
	{ label: '라운드', name: 'round' },
	{ label: '날짜', name: 'datetime' },
	{ label: '조', name: 'heat' },
	{ label: '레인', name: 'lane' },
	{ label: '선수', name: 'name' },
	{ label: '나이', name: 'age' },
	{ label: '출생연도', name: 'dob' },
	{ label: '시도', name: 'province' },
	{ label: '소속', name: 'team' },
	{ label: '순위', name: 'rank' },
	{ label: '기록', name: 'times' },
	{ label: '비고', name: 'remarks' },
	{ label: '단체', name: 'team' },
	{	label: '선수_1', name: 'name1' },
	{	label: '나이_1', name: 'age1' },
	{	label: '선수_2', name: 'name2' },
	{	label: '나이_2', name: 'age2' },
	{	label: '선수_3', name: 'name3' },
	{	label: '나이_3', name: 'age3' },
	{	label: 'sheet', name: 'sheet' },
];

const teamsHeader = [
	{ label: "teamID",		column: "teamID", 	type: "n", width: 50, align: "right", },
	{ label: "name",			column: "name", 		type: "s", width: 200, },
	{ label: "nameKor", 	column: "nameKor", 	type: "s", width: 200, },
	{ label: "names", 		column: "names", 		type: "s", width: 500, },
	{ label: "indexes", 	column: "indexes", 		type: "s", width: 500, },
];

const athletesHeader = [
	{ label: "athleteID",		column: "teamID", 	type: "n", width: 50, align: "right", },
	{ label: "masters", column: "masters", 					type: "s", width: 50, },
	{ label: "adult", 	column: "adult", 						type: "s", width: 50, },
	{ label: "individual", 		column: "individual", 			type: "s", width: 50, },
	{ label: "ageGroup", 	column: "ageGroup", 				type: "s", width: 130, },
	{ label: "gender", 		column: "gender", 					type: "s", width: 50, },
	{ label: "name", 		column: "name", 						type: "s", width: 180, },
	{ label: "nameHide", 		column: "nameHide", 							type: "s", width: 150, },
	{ label: "nameComp",		column: "nameComp", 						type: "s", width: 150, },
	{ label: "team", 		column: "team", 						type: "s", width: 120, },
	{ label: "teamID", 		column: "teteamIDam", 						type: "s", width: 50, },
	{ label: "sido", 	column: "sido", 						type: "s", width: 60, },
	{ label: "note", 	column: "note", 						type: "s", width: 120, },
	{ label: "discipline", 		column: "discipline", 				type: "s", width: 180, },
	{ label: "times", 		column: "times", 				type: "s", width: 280, },
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

// 표준화한 대회 기록파일 읽기
exports.readTimesFromExcelTimes = async (competition, filename, timeID) => {
	const headers = timesHeader;
	for (const header of headers) {
		header.label = header.column;
	}
	const times = await excel.read_excel_org(filename, headers);

	const timeArr = [];
	for (const time of times) {
		time.timeID = timeID++;
		time.individual = time.individual == '단체' ? false : true;
		time.masters = time.masters == '' ? true : false;
		time.adult = time.adult == '학생' ? false : true;
		time.ageGroup = time.ageGroup ? time.ageGroup.toString() : '';
		if (!time.time) {
			time.time = '';
			time.timeStamp = 0;
		} else {
			if (typeof time.time != "string") {
				time.timeStamp = utilDate.convertTimestamp2string(time.time);
			}
			time.timeStamp = utilDate.convertString2Timestamp(time.time);
		}

		time.nameHide = utilLibrary.nameHide(time.name);
		if (time.names) {
			time.names = time.names.split(',');
			time.namesHide = [];
			time.names.forEach(name => {
				time.namesHide.push(utilLibrary.nameHide(name));
			})
		} else {
			time.names = [ time.name ];
			time.namesHide = [ time.nameHide ];
		}
		// time.team = time.team || "";
		// time.teamID = time.teamID || 0;
		// if (time.team) {
		// 	const includeNames = teams.find(el => el.names.includes(time.team));
		// 	if (includeNames) {
		// 		time.team = includeNames.name;
		// 		time.teamID = includeNames.teamID;		
		// 	}
		// }

		time.competitionName = competition.fullname;
		time.course = competition.course || "LCM";
		time.sido = competition.sido || "";
		time.pool = competition.pool || "";
		time.poolID = competition.poolID;
		time.year = competition.year;
		time.datetime = competition.dateStart || "";
		delete time.sheet;
		timeArr.push(time);
	}

	return timeArr;
}


exports.checkDuplicate = (times) => {
	console.log("times=", times.length);
	const timeOBJ = {};
	for (const time of times) {
		// const key = `${time.competitionID}-${time.gender}-${time.ageGroup}-${time.style}-${time.distance}-${time.name}-${time.team}-${time.time}`;
		const key = `${time.competitionID}-${time.gender}-${time.style}-${time.distance}-${time.round||''}-${time.name}-${time.team}-${time.time}`;
		if (!timeOBJ[key]) timeOBJ[key] = [];
		timeOBJ[key].push(`${time.name}, ${time.team}, ${time.time}, ${time.ageGroup}, ${time.gender}, ${time.style}, ${time.distance}-${time.round||''}`);
	}

	console.log("timeOBJ=", Object.keys(timeOBJ).length);

	let timeArr = [];
	Object.keys(timeOBJ).forEach(key => {
		if (timeOBJ[key].length > 1) {
			timeArr = timeArr.concat(timeOBJ[key]);
		}
	})
	console.log("timeArr=", timeArr.length);

	if (timeArr.length > 0) {
		console.log("\n\n-----> duplicate");
		console.log(timeArr);
	} else {
		console.log("1-----> check duplicate...OK");
	}
	const message = "check duplicate:\n" + timeArr.join('\n');
	console.log("message:", message);
	return message;
}
/*

	{
		'조': 1,
		'레인': 3,
		'선수': '김지영',
		'소속': '강화수영',
		'순위': 'DNS',
		sheet: '성인부 개인전'
	},

	{
		lane: 1,
		name: '김민준',
		team: 'GDR',
		rank: 13,
		times: 4919,
		category: 'junior',
		sheet: '학생부'
	}

*/
// 대회 기록 원본파일 읽기
exports.readTimesFromExcelORG = async (competition, path, filename, timeID) => {
	console.log("readTimesFromExcelORG.path=", path, "filename=", filename);
	if (!filename) filename = competition.timesExcel;
console.log("filename=", filename);
	const timeObj = await excel.read_excel_org(`${path}/${filename}`);
console.log("timeArr.", Object.keys(timeObj), );
let timeArr = [];
	for ( const sheet of Object.keys(timeObj) ) {
		let times = [];
		console.log("sheet[0]++++++++++++++++++++++++++++++", timeObj[sheet][0]);
		if (timeObj[sheet][0]["선수"]) { // complete: 성태가 작업한것
			// console.log("111~~~~~~~~~");
			console.log("customCompleteTimes", timeObj[sheet].length);
			times = formatCompleteTimes(timeObj[sheet], competition);
		} else {
			times = formatTimes(timeObj[sheet]);
		}
		timeArr = [ ...timeArr, ...times ];
	}

	times = customizingTimesORG(timeArr, competition);
	console.log("-----> readTimesExcel", times.slice(0, 10));
	return times;
}

//=================================================
function customizingTimesORG(timeArr, competition) {
	
	const times = [];
    //---------------------------------------------
    let discipline = {};
    let disciplineArr = [];
  
    const message = {
      discipline: [],
      ageGroup: [],
      style: [],
      round: [],
      times: [],
      distance: [],
      status: [],
      note: [],
      gender: [],
    }
  
    //------------------------------------------
    //------------------------------------------
    //------------------------------------------
		// console.log("customizingTimes", timeArr.length);
		let timeID = 1;
// console.log("1>", timeArr);		
    for (const row of timeArr) {
      let time = JSON.parse(JSON.stringify(row));	// deep copy
			if (time.discipline) {
	      const dsp = Util.splitDiscipline(time.discipline);
				if (dsp.gender) time.gender = dsp.gender;
				if (dsp.style) time.style = dsp.style;
				if (dsp.distance) time.distance = dsp.distance;
				if (dsp.ageGroup) time.ageGroup = dsp.ageGroup;
			}
      
      //-----> check discipline
      const dsp = Util.checkDiscipline(time);
			// console.log("1> time.", time.name, dsp);
      if (Object.keys(dsp).length > 2) {
        discipline = JSON.parse(JSON.stringify(dsp));	// deep copy
        continue;
      }
  
			//혼영 & 선수명 없으면 팀명으로 setting
			if (time.style && time.style.includes("계영") && !time.name && time.team) time.name = time.team;

			//-----> check timesHeader row
      if (_headerTime.includes(time.time) || time.name && _headerName.includes(time.name.replace(/ /gi, ''))) continue;
  
      //-----> 선수명, 팀명이 없으면
			if (discipline && discipline.style && discipline.style.includes("계영") && !time.name && time.team) {
				time.name = time.team
			}
      const ckName = time.name && ! _headerName.includes(time.name.replace(/ {2}/gi, ' ').replace(/ {2}/gi, ' '));
			const ckTeam = time.team && _headerTeam.includes(time.team.toString().replace(/ /gi, ''));
      if (! time.nameEng && ! ckName && !ckTeam) continue;
			if (!time.name && !time.nameEng && !time.team && !time.time) continue;
      if (!time.name && time.nameEng) time.name = time.nameEng;

			time.timeORG = time.times;
      //-----> set competition to times
      time.competitionID	= competition.competitionID;
      time.competitionName= competition.fullname;
      time.stemID					= competition.stemID;
      time.course					= competition.course;
      time.sido						= competition.sido;
      time.type						= competition.type || 'event';
      time.pool						= competition.pool;
      time.poolID					= competition.poolID;
      time.datetime				= ! time.datetime ? competition.dateStart : time.datetime;

      time.isMasters			= time.isMasters || time.masters || true;
			if (time.isMasters == "비등록") time.isMasters = true;
			else if (time.isMasters == "등록") time.isMasters = false;
			delete time.masters;

			if (time.sheet) {
				if (time.sheet.includes("학생")) time.isAdult = false;
				else if (time.sheet.includes("성인")) time.isAdult = true;
			}
		// console.log("time=", time);

			time.distance = time.distance ? time.distance.toString().trim() : "";
			// style => 자유형 50M
			if (time.style && !Util.styleTable.find(style => time.style == style.style)) {
				const ck = Util.styleTable.find(style => time.style.includes(style.label));
				if (ck) {
					if (!time.distance) {
						const distance = time.style.replace(ck.label, '').replace('m', 'M').trim();
						if (_distances.includes(distance)) time.distance = distance;
					}
					time.style = ck.style;
				}
			}
			if (time.elite) { // elite: elite -> masters: false
				time.masters = false;
				delete time.elite;
			}

      //----->set discipline to time
      if (!time.heat 			) time.heat 		= discipline.heat			|| '';
      if (!time.gender		) time.gender 	= discipline.gender		|| '';
      if (!time.ageGroup	) time.ageGroup	= discipline.ageGroup	|| '';
      if (!time.style 		) time.style 		= discipline.style		|| '';
      if (!time.distance	) time.distance	= discipline.distance	|| '';
      if (!time.category	) time.category	= discipline.category	|| '';
      if (!time.round 		) time.round 		= discipline.round		|| '';
  
      
      //-----> null check
      time.name			= time.name ? time.name.trim() : "";
      time.names		= time.names || [];
      time.team			= time.team ? time.team.toString().trim() : "";
      time.ageGroup	= time.ageGroup ? time.ageGroup.trim() : "";
      time.round		= time.round ? time.round.trim() : "";
      time.status		= time.status ? time.status.trim() : "";
      time.note			= time.note ? time.note.toString().trim() : "";
      if (time.age) {
				time.age			= time.age;
			}
      if (time.birth) {
        if (typeof time.birth == 'number') time.birth = time.birth.toString();
        time.birth = time.birth.replace(/\.|,|-|_|:|~/gi, '');
        time.birth = time.birth.length > 8 ? time.birth.slice(0, 8) : (time.birth.slice(0, 1) < '4' ? "20" : "19") + time.birth;
        time.birth = time.birth.slice(0, 4)+"-"+time.birth.slice(4,6)+"-"+time.birth.slice(6, 8);
      }
  
      //-----> check status
      time = Util.checkStatus(time);
      //-----> check times
      time = Util.checkTimes(time);
  
			// if (time.distance) time.distance = time.distance;
      //-----> get style
			if (!time.distance) {
				const arr = time.style.split(' ');
				if (arr.length > 1) {
					arr[0] = arr[0].trim();
					if (_distances.includes(arr[0])) { time.distance = arr[0]; time.style = arr[1].trim(); }
					arr[1] = arr[1].trim();
					if (_distances.includes(arr[1])) { time.distance = arr[1]; time.style = arr[0].trim(); }
				}
			}
      time.style = Util.getStyle(time.style);
      if (time.style.includes("혼성")) {
        time.gender = "mixed";
        time.style = time.style.replace("혼성", "");
      }
  
      //-----> check gender
      time.gender = Util.checkGender(time);
  
      //------> check round
      time.round = mskCFG.getRoundKor2Eng(time.round);
			
      //-----> check rank
      time.rank = time.rank ? Number(time.rank) : 0;
  
      //-----> distance
      if (typeof time.distance == "number") time.distance = `${time.distance}M`;
      if (time.distance && !isNaN(time.distance)) time.distance += "M";
  
      
      //-----> check name & team
      const str = time.team.replace(/ /g, '');
      if (str.length <= 4) {
        time.team = str;
      }
      // console.log(`1>name=[${time.name}], team=[${time.team}], names=[${time.names.join(',')}]`);

      time.name = time.name.replace(/\n|\r|\t/gi, ',').replace(/,{2,}/g, ',');
			if (!time.team) time.team = time.province ? time.province : '';
      if (time.team && !time.name) time.name = time.team;
      time.names = time.name.replace(/ , |, | ,/gi, ',').split(',');
  
      //-----> 선수가 4명이면 team으로 변경
      if (time.individual && time.names.length >= 4) {
        time.individual = false;
      }
  
      //-----> check 단체전
      time.individual = !time.style.includes("Relay");
			if (!time.individual && !time.name && time.team) time.name = time.team;

			//-----> check masters / elite
			if (time.ageGroup.includes("기록회") || ! time.ageGroup.includes("비등록선수") && time.ageGroup.includes("등록선수")) {
				time.masters = false;
			}
  
      //----------------------------------
      //----------------------------------
			// const timeORG = time.timeORG;
			const sheet = time.sheet;

      time.nameHide = utilLibrary.nameHide(time.name);
			if (time.names.length > 0) {
				time.namesHide = [];
				time.names.forEach(name => {
					time.namesHide.push(utilLibrary.nameHide(name));
				})
			}
			time = TimesDAO.customizing(time);

			// time.timeORG = timeORG;
			time.sheet = sheet;
      //----------------------------------
      //----------------------------------
			// console.log("8> ----->", time.name);
      if (!time.name && !time.team) {
        console.log("name, team --> null");
        continue;
      }
      time.timeID = timeID++;
			delete time.sheet;
			//---------------------------------
			if (discipline.fin) time.fin = true;
			//---------------------------------
			
			//-----> check adult
			if (time.adult) {
				time.isAdult = "학생,junior".indexOf(time.adult.toLowerCase()) < 0 ? true : false;
			} else {
				time.isAdult = Util.checkAdult(time);
			}
			delete time.adult;

      times.push(time);
			// console.log("9>----->", time.time, times.length);

      if (!message.discipline.includes(discipline.discipline) ) message.discipline.push(discipline.discipline);
      if (!message.ageGroup.includes(time.ageGroup) ) 					message.ageGroup.push(time.ageGroup);
      if (!message.style.includes(time.style) ) 								message.style.push(time.style);
      if (!message.round.includes(time.round) ) 								message.round.push(time.round);
      if (!message.times.includes(time.time) ) 									message.times.push(time.time);
      if (!message.distance.includes(time.distance) ) 					message.distance.push(time.distance);
      if (!message.status.includes(time.status) ) 							message.status.push(time.status);
      if (!message.note.includes(time.note) ) 									message.note.push(time.note);
      if (!message.gender.includes(time.gender) ) 							message.gender.push(time.gender);
      // if (time.time == "01.00") { console.log("~~~~~~~", time); process.exit(); }
    } // end for
  
    if (times.length == 0) {
      console.log("++++++++++++++++++++++++++++ times no data", disciplineArr.length);
      return times;
    }
		try {
			fs.appendFileSync(`${Config.times_data_path}/log/${times[0].competitionID}-times.log`, "---------------------------------------------\n");
			fs.appendFileSync(`${Config.times_data_path}/log/${times[0].competitionID}-times.log`, "competitionID=" + competition.competitionID.toString() + "\n");
			fs.appendFileSync(`${Config.times_data_path}/log/${times[0].competitionID}-times.log`, "---------------------------------------------\n");
			fs.appendFileSync(`${Config.times_data_path}/log/${times[0].competitionID}-times.log`, "\ndisciplineMessage: " 	+ JSON.stringify(message.discipline, null, '  '));
			fs.appendFileSync(`${Config.times_data_path}/log/${times[0].competitionID}-times.log`, "\nageGroupMessage: " 		+ JSON.stringify(message.ageGroup, null, '  '));
			fs.appendFileSync(`${Config.times_data_path}/log/${times[0].competitionID}-times.log`, "\nstyleMessage: " 			+ JSON.stringify(message.style, null, '  '));
			fs.appendFileSync(`${Config.times_data_path}/log/${times[0].competitionID}-times.log`, "\nroundMessage: " 			+ JSON.stringify(message.round, null, '  '));
			fs.appendFileSync(`${Config.times_data_path}/log/${times[0].competitionID}-times.log`, "\ndistanceMessage: " 		+ JSON.stringify(message.distance, null, '  '));
			fs.appendFileSync(`${Config.times_data_path}/log/${times[0].competitionID}-times.log`, "\nstatusMessage: " 			+ JSON.stringify(message.status, null, '  '));
			fs.appendFileSync(`${Config.times_data_path}/log/${times[0].competitionID}-times.log`, "\ngenderMessage: " 			+ JSON.stringify(message.gender, null, '  '));
			fs.appendFileSync(`${Config.times_data_path}/log/${times[0].competitionID}-times.log`, "\nnoteMessage: " 				+ JSON.stringify(message.note, null, '  '));
			fs.appendFileSync(`${Config.times_data_path}/log/${times[0].competitionID}-times.log`, "\ntimes: " 							+ JSON.stringify(message.times.sort(), null, '  '));
		} catch (e) {}
    //------------------------------------------
    //------------------------------------------
    //------------------------------------------
    
    return times;
}


//=================================================
function formatTimes (times) {
	const timeArr = [];
	times.forEach((elem) => {
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
						time	: time[`times${no}`], // .replace(/대회신|대회타이|한국신|세계신/g, "").trim(),
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
					if (time.elite		) tm.elite 		= time.elite;

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
	return timeArr;
}

//=================================================
//	customizing 대회 완성 times
function formatCompleteTimes(timeArr, _competition) {

	const times = [];
	//------------
	timeArr.forEach(row => {
		const time = {};
		//------------
		Object.keys(row).forEach(key => {
			try {
				const ck = _completeTimesHeaders.find(hdr => hdr.label==key);
				time[ck.name] = row[key];
			} catch (e) {
				console.log("catch.", e);
			}
		})
		//------------
		
		//----------------------------
		times.push(time);
		//----------------------------
	})

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
			time.competitionID 	= _competition.competitionID;

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

			if (time.time == undefined) {
				time.time == "";
				time.timeStamp = 0;
			} else {
				if (typeof time.time == 'number') {
					time.timeStamp 		= utilDate.convertTimestamp2string(time.time);
				} else {
					time.timeStamp 		= utilDate.convertString2Timestamp(time.time);
				}
			}
			// console.log("+++++++", time.time, typeof time.time, time.time);
			if (isNaN(time.rank) && !time.status) {
				time.status = time.rank;
				time.rank= '';
			}
	
			// time.category = time.sheet.includes("학생") ? "junior" : "masters";
			// time.type = time.sheet.includes("단체") ? "team" : "individual";
			time.individual = time.sheet.includes("단체") ? false : true;
			// delete time.sheet;

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

//=================================================
exports.writeTimesExcel = async (filename, rows, headers=timesHeader) => {
  console.log("++++++++", filename);

	console.log("=====================>",  filename, rows.length);
	XlsxPopulate.fromBlankAsync().then(async (workbook) => {
		// Get the first sheet
		const sheet = workbook.sheet(0);

		let rowno = 1;
		//{ label: "#", column: "timeID", type: "n", width: 30, },
		//-------------------------------------------
		//	headers
		//-------------------------------------------
		for (let col=0; col < headers.length; col++) {
			const style = setCellStyle(headers[col], _color.greyLight, "center");
			// if (col >= 24) style.fill = _color.Cyan;
			sheet.cell(`${cellAlpha[col]}${rowno}`).value(headers[col].label).style(style);
			
			// Set cell width (column A)
			sheet.column(cellAlpha[col]).width(headers[col].width ? headers[col].width / 8 : defaultWidth);

			// Set cell height (column A)
			sheet.row(rowno).height(headers[col].height ? headers[col].height : defaultHeight);
		}
		//-------------------------------------------

		
		//{ label: "#", column: "timeID", type: "n", width: 30, align: "left|center|right", valign: "top|center|bottom", fontSize, fontColor, fill, bold, italic },
		//------------------------------
		for (let row=0; row < rows.length; row++) {
			rowno++;
			//------------------------------
			for (let col=0; col < headers.length; col++) {
				const style = setCellStyle(headers[col]);
				// if (col == 24) style.fill = _color.GreyDark;

				if (headers[col].column == 'names') {
					rows[row][headers[col].column] = (rows[row][headers[col].column]||[]).join(',');
				}
				if (headers[col].column == "masters") {
					if (!rows[row][headers[col].column]) {
						rows[row][headers[col].column] = "elite";
						style.fill = _color.DeepPink;
					} else {
						rows[row][headers[col].column] = "";
					}
				}
				if (headers[col].column == "adult") {
					if (!rows[row][headers[col].column]) {
						rows[row][headers[col].column] = "학생";
						style.fill = _color.Cyan;
					} else {
						rows[row][headers[col].column] = "";
					}
				}
				if (headers[col].column == "individual") {
					if (!rows[row][headers[col].column]) {
						rows[row][headers[col].column] = "단체";
						style.fill = _color.DarkOrange;
					} else {
						rows[row][headers[col].column] = "";
					}
				}
				if ("times,timeORG,name,team,style,distance,gender,teamID".includes(headers[col].column) || headers[col].column == "ageGroup") {
					if (!rows[row][headers[col].column]) {
						style.fill = _color.OrangeRed;
					}
				}
				sheet.cell(`${cellAlpha[col]}${rowno}`).value(rows[row][headers[col].column]);

				if (headers[col].column == "status" && rows[row][headers[col].column]) {
						style.fill = _color.Yellow;
				}

				// const field = customFields.find(fld => fld.mongoField == headers[col].column || fld.field == headers[col].column);
				// if (field) {
				// 	const match = setcolumnStyle(rows[row], field.field, field.mongoField);
				// 	if (match) {
				// 		style.fill = _color.Yellow;
				// 	}
				// }
				sheet.cell(`${cellAlpha[col]}${rowno}`).style(style);
				// sheet.cell(`${cellAlpha[no]}1`).style({ fontSize: 10, fontColor: _color.Black, fill: _color.greyLight, bold: true, italic: true, horizontalAlignment: "center", verticalAlignment: "center", });
			} // end for col
			//------------------------------ 

			// Set cell height (column A)
			sheet.row(rowno).height(headers[0].height ? headers[0].height : defaultHeight);

		} // end for row
		//------------------------------

		// Set cell border style
		const cellRange = sheet.range(`A1:${cellAlpha[headers.length-1]}${rowno}`);
		cellRange.style({ border: true });
		
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

//=================================================
exports.writeAthletesExcel = async (filename, rows, headers=athletesHeader) => {

	XlsxPopulate.fromBlankAsync().then(async (workbook) => {
		// Get the first sheet
		const sheet = workbook.sheet(0);

		let rowno = 1;
		//{ label: "#", column: "timeID", type: "n", width: 30, },
		//-------------------------------------------
		//	headers
		//-------------------------------------------
		for (let col=0; col < headers.length; col++) {
			const style = setCellStyle(headers[col], _color.greyLight, "center");

			// if (col >= 24) style.fill = _color.Cyan;
			sheet.cell(`${cellAlpha[col]}${rowno}`).value(headers[col].label).style(style);
			
			// Set cell width (column A)
			sheet.column(cellAlpha[col]).width(headers[col].width ? headers[col].width / 8 : defaultWidth);

			// Set cell height (column A)
			sheet.row(rowno).height(headers[col].height ? headers[col].height : defaultHeight);
		}
		//-------------------------------------------

		
		//{ label: "#", column: "timeID", type: "n", width: 30, align: "left|center|right", valign: "top|center|bottom", fontSize, fontColor, fill, bold, italic },
		//------------------------------
		for (let row=0; row < rows.length; row++) {
			rowno++;
			//------------------------------
			for (let col=0; col < headers.length; col++) {
				const style = setCellStyle(headers[col]);
				// if (col == 24) style.fill = _color.GreyDark;

				if (headers[col].column == 'times') {
					rows[row][headers[col].column] = JSON.stringify(rows[row][headers[col].column]);
				}
				if (headers[col].column == "masters") {
					if (!rows[row][headers[col].column]) {
						rows[row][headers[col].column] = "선수";
						style.fill = _color.DeepPink;
					} else {
						rows[row][headers[col].column] = "";
					}
				}
				if (headers[col].column == "adult") {
					if (!rows[row][headers[col].column]) {
						rows[row][headers[col].column] = "학생";
						style.fill = _color.Cyan;
					} else {
						rows[row][headers[col].column] = "";
					}
				}
				if (headers[col].column == "individual") {
					if (!rows[row][headers[col].column]) {
						rows[row][headers[col].column] = "단체";
						style.fill = _color.DarkOrange;
					} else {
						rows[row][headers[col].column] = "";
					}
				}
				sheet.cell(`${cellAlpha[col]}${rowno}`).value(rows[row][headers[col].column]);

				sheet.cell(`${cellAlpha[col]}${rowno}`).style(style);
			} // end for col
			//------------------------------ 

			// Set cell height (column A)
			sheet.row(rowno).height(headers[0].height ? headers[0].height : defaultHeight);

		} // end for row
		//------------------------------

		// Set cell border style
		const cellRange = sheet.range(`A1:${cellAlpha[headers.length-1]}${rowno}`);
		cellRange.style({ border: true });
		
		writeExcel(workbook, filename);
		// return workbook.toFileAsync(filename).then(() => {
		// 	console.log("toFileAsync...OK");
		// }).catch(err => {
		// 	console.log("toFileAsync...catch", err);
		// });


		console.log("save toFileAsync...");
	}).then(() => {
		console.log("File saved successfully!");
	}).catch(error => {
		console.error("Error occurred:", error);
	});

}

function setCellStyle(header, backColor=_color.White, align="left") {
	const style = {
		fontSize						: header.fontSize						? header.fontSize 	: 10,
		fontColor						: header.fontColor 					? header.fontColor : _color.Black,
		fill								: header.backColor 					? header.backColor : backColor,
		bold								: header.bold								? header.bold 			: false,
		italic							: header.italic							? header.italic 		: false,
		horizontalAlignment	: header.horizontalAlignment? header.horizontalAlignment : align,
		verticalAlignment		: "center",
	}
	return style;
}

function setHeaderLineStyle(sheet, header) {
	const rowno = 1;
	//-------------------------------------------
	//	header
	//-------------------------------------------
	for (let col=0; col < header.length; col++) {
		const style = setCellStyle(header[col], _color.greyLight, "center");
		// if (col >= 24) style.fill = _color.Cyan;
		sheet.cell(`${cellAlpha[col]}${rowno}`).value(header[col].label).style(style);
		
		// Set cell width (column A)
		sheet.column(cellAlpha[col]).width(header[col].width ? header[col].width / 8 : defaultWidth);

		// Set cell height (column A)
		sheet.row(rowno).height(header[col].height ? header[col].height : defaultHeight);
	}
	//-------------------------------------------
}
//=================================================
exports.writeTeamsExcel = async (filename, rows, customCells, header=teamsHeader) => {

	console.log("=====================>",  filename, rows.length);
	XlsxPopulate.fromBlankAsync().then(async (workbook) => {
		// Get the first sheet
		const sheet = workbook.sheet(0);

		let rowno = 1;
		//{ label: "#", column: "timeID", type: "n", width: 30, },
		//-------------------------------------------
		//	header
		//-------------------------------------------
		setHeaderLineStyle(sheet, header);
		//-------------------------------------------
		
		//{ label: "#", column: "timeID", type: "n", width: 30, align: "left|center|right", valign: "top|center|bottom", fontSize, fontColor, fill, bold, italic },
		//------------------------------
		for (let row=0; row < rows.length; row++) {
			rowno++;
			//------------------------------
			for (let col=0; col < header.length; col++) {
				const style = setCellStyle(header[col]);
				// if (col == 24) style.fill = _color.GreyDark;

				const value = customCells ? customCells(header[col].column, rows[row]) : rows[row][header[col].column];

				// const value = header[col].column == 'names' ? rows[row][header[col].column].join('|') : rows[row][header[col].column];
				sheet.cell(`${cellAlpha[col]}${rowno}`).value(value);
				sheet.cell(`${cellAlpha[col]}${rowno}`).style(style);
			} // end for col
			//------------------------------ 

			// Set cell height (column A)
			sheet.row(rowno).height(header[0].height ? header[0].height : defaultHeight);

		} // end for row
		//------------------------------

		// Set cell border style
		const cellRange = sheet.range(`A1:${cellAlpha[header.length-1]}${rowno}`);
		cellRange.style({ border: true });
		
		console.log("bf toFileAsync...");

		writeExcel(workbook, filename);
		console.log("af toFileAsync...");
	}).then(() => {
		console.log("File saved successfully!");
	}).catch(error => {
		console.error("Error occurred:", error);
	});

}

//=================================================
exports.writeCompetitionsExcel = async (filename, rows) => {
  console.log("++++++++", filename);

	console.log("=====================>",  filename, rows.length);
	XlsxPopulate.fromBlankAsync().then(async (workbook) => {
		// Get the first sheet
		const sheet = workbook.sheet(0);

		let rowno = 1;
		//{ label: "#", column: "timeID", type: "n", width: 30, },
		//-------------------------------------------
		//	competitionsHeader
		//-------------------------------------------
		for (let col=0; col < competitionsHeader.length; col++) {
			const style = setCellStyle(competitionsHeader[col], _color.greyLight, "center");
			// if (col >= 24) style.fill = _color.Cyan;
			sheet.cell(`${cellAlpha[col]}${rowno}`).value(competitionsHeader[col].label).style(style);
			
			// Set cell width (column A)
			sheet.column(cellAlpha[col]).width(competitionsHeader[col].width ? competitionsHeader[col].width / 8 : defaultWidth);

			// Set cell height (column A)
			sheet.row(rowno).height(competitionsHeader[col].height ? competitionsHeader[col].height : defaultHeight);
		}
		//-------------------------------------------

		
		//{ label: "#", column: "timeID", type: "n", width: 30, align: "left|center|right", valign: "top|center|bottom", fontSize, fontColor, fill, bold, italic },
		//------------------------------
		for (let row=0; row < rows.length; row++) {
			rowno++;
			//------------------------------
			for (let col=0; col < competitionsHeader.length; col++) {
				const style = setCellStyle(competitionsHeader[col]);
				// if (col == 24) style.fill = _color.GreyDark;

				const value = competitionsHeader[col].column == 'names' ? rows[row][competitionsHeader[col].column].join('|') : rows[row][competitionsHeader[col].column];
				sheet.cell(`${cellAlpha[col]}${rowno}`).value(value);
				sheet.cell(`${cellAlpha[col]}${rowno}`).style(style);
			} // end for col
			//------------------------------ 

			// Set cell height (column A)
			sheet.row(rowno).height(competitionsHeader[0].height ? competitionsHeader[0].height : defaultHeight);

		} // end for row
		//------------------------------

		// Set cell border style
		const cellRange = sheet.range(`A1:${cellAlpha[competitionsHeader.length-1]}${rowno}`);
		cellRange.style({ border: true });
		
		console.log("bf toFileAsync...");

		writeExcel(workbook, filename);
		console.log("af toFileAsync...");
	}).then(() => {
		console.log("File saved successfully!");
	}).catch(error => {
		console.error("Error occurred:", error);
	});

}

//=================================================
exports.writeExcel = async (filename, rows, headers, customCells) => {


	console.log("=====================>",  filename, rows.length);
	XlsxPopulate.fromBlankAsync().then(async (workbook) => {
		// Get the first sheet
		const sheet = workbook.sheet(0);

		let rowno = 1;
		//{ label: "#", column: "timeID", type: "n", width: 30, },
		//-------------------------------------------
		//	headers
		//-------------------------------------------
		for (let col=0; col < headers.length; col++) {
			const style = setCellStyle(headers[col], _color.greyLight, "center");

			// if (col >= 24) style.fill = _color.Cyan;
			sheet.cell(`${cellAlpha[col]}${rowno}`).value(headers[col].label).style(style);			
			// Set cell width (column A)
			sheet.column(cellAlpha[col]).width(headers[col].width ? headers[col].width / 8 : defaultWidth);

			// Set cell height (column A)
			sheet.row(rowno).height(headers[col].height ? headers[col].height : defaultHeight);
		}
		//-------------------------------------------

		
		//{ label: "#", column: "timeID", type: "n", width: 30, align: "left|center|right", valign: "top|center|bottom", fontSize, fontColor, fill, bold, italic },
		//------------------------------
		for (let row=0; row < rows.length; row++) {
			rowno++;
			//------------------------------
			for (let col=0; col < headers.length; col++) {
				const style = setCellStyle(headers[col]);
				// if (col == 24) style.fill = _color.GreyDark;

				const value = customCells ? customCells(headers[col].column, rows[row]) : rows[row][headers[col].column];
				sheet.cell(`${cellAlpha[col]}${rowno}`).value(value);
				sheet.cell(`${cellAlpha[col]}${rowno}`).style(style);
			} // end for col
			//------------------------------ 

			// Set cell height (column A)
			sheet.row(rowno).height(headers[0].height ? headers[0].height : defaultHeight);

		} // end for row
		//------------------------------

		// Set cell border style
		const cellRange = sheet.range(`A1:${cellAlpha[headers.length-1]}${rowno}`);
		cellRange.style({ border: true });
		
		console.log("bf toFileAsync...");

		writeExcel(workbook, filename);
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
//====================================
//====================================
//====================================
  
