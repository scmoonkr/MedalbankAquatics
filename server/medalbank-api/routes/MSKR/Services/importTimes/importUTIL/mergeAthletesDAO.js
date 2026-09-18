const fs          = require('fs');
const { Config }  = require('./config');


//=================================================
exports.mergeTimes2Athletes = (timeArr, athleteID) => {

	const athleteError = {};
	let timeCount = 0;
	let times =[];
	const athleteOBJ = {};
	for (const time of timeArr) {
		try {
			if (time.athleteID > 0) continue;
			
			const adult = time.adult == false ? "junior" : "masters";

			const discipline = `${adult}-${time.gender}-${time.ageGroup}-${time.name}-${time.team}`
			if (! athleteOBJ[discipline]) {
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
				if (time.athleteID)	json.athleteID = time.athleteID;
				if (time.teamID)		json.teamID = time.teamID;
				if (time.team)			json.note += "-" + time.team;
				if (time.dob)				json.dob = time.dob;
				if (time.sido)			json.sido = time.sido;
				if (json.individual) { // 개인
					json.names = [ json.name ];
				} else { // 단체
					json.names = json.name.split(',');
				}
				athleteOBJ[discipline] = json;
			}
			athleteOBJ[discipline].times.push({ style: time.style + "-" + time.distance, timeID: time.timeID, name: time.name });
			timeCount++;
		} catch (e) {
			console.log(time, "catch.", e);
			process.exit(0);
		}
	} // end for
	console.log("times=", timeCount, "athletes=", Object.keys(athleteOBJ).length);

	let times2 = 0, styles = 0;

	const athleteArr = [];
	timeCount = 0;
	Object.keys(athleteOBJ).forEach(key => {
		const athlete = athleteOBJ[key];

		let check = true;
		if (athlete.times.length > Config.max_same_time * (athlete.individual ? 3 : 6)) {
			// console.log(athlete.times.length, "--->", athlete.discipline, athlete.times, athlete.name);
			const timeIDs = athlete.times.map(el => el.timeID);
			const timeJSON = timeArr.filter(el => timeIDs.includes(el.timeID));
			// console.log("times.timeIDs= ", timeJSON);
			times2++;
			check = false;
			athleteError[athlete.athleteID] = athlete;
		}
		if (athlete.times.length >= Config.max_same_time * (athlete.individual ? 3 : 6)) {
			if (athlete.times[0].style == athlete.times[1].style) {
				// console.log("same style =====>", athlete.discipline, athlete.times, athlete.name );
				const timeIDs = athlete.times.map(el => el.timeID);
				// console.log("athletes.times.timeIDs= athleteID: { $in: ", timeIDs);
					styles++;
				check = false;
			}
		}
		athlete.times2 = times2;
		athlete.styles = styles;
		check = true;

		if (check) {
			if (!athlete.athleteID || athlete.athleteID == 0) {
        athlete.athleteID = athleteID++;
      }
			athleteArr.push(athlete);
			timeCount += athlete.times.length;
		}
	})

	// console.log(times2, styles, "times=", timeCount, "athletes=", Object.keys(athleteOBJ).length);

	const errors = Object.values(athleteError);
	if (errors.length > 0) {
		const filename = `${Config.times_data_path}/log${timeArr[0].competitionID}-mergeAthletes.log`;
		// fs.writeFileSync(filename, JSON.stringify(errors, null, '\t'));	
		// console.log(`\n\n\ncheck ${filename} !!!\n\n same athletes !!! ${athleteArr.length}`);
	}

	return athleteArr;
}
