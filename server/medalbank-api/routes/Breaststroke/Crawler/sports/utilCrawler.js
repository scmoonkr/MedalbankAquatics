const { parseSwimEvent, getCompetitionByName }   = require('./util');

// boardTable02
exports.parsingCompetitionInfo = ($) => {
	const headerPtr = $("div.boardTable02 table tbody tr");
	const headers = [];
	const competition = {};

	headerPtr.each((index, elem) => {
		const trs = $(elem).find("td");
		const header = {};
		if (trs.length > 0) {
			header.column1 = trs.eq(0).text().trim(); 
		}
		if (trs.length > 1) {
			header.column2 = trs.eq(1).text().trim(); 
		}
		
		headers.push(header);
	});

	if (headers.length > 0) {
		competition.competitionName = headers[0].column1;
		
		const arr = headers[0].column2.split('~').map(date => date.trim());
		competition.dateStart = arr[0].replace(/\./gi, "-");
		if (arr.length > 1) competition.dateEnd = arr[1].replace(/\./gi, "-");;
	}
	if (headers.length > 1) {
		competition.pool = headers[1].column1;
		headers[1].column2 = headers[1].column2 || "";

		const arr1 = headers[1].column2.split('\n');
		const arr = (arr1.length>1?arr1[1]:arr1[0]).split('~').map(date => date.trim());
		competition.registStart = arr[0].replace(/\./gi, "-");;
		competition.registEnd = arr.length > 1 ? arr[1].replace(/\./gi, "-") : '';
	}
	if (headers.length > 2) {
		const disp = parseSwimEvent(headers[2].column1);
		competition.style = disp.style;
		competition.distance = disp.distance;

		// console.log("disp", disp, headers[2].column1);
		switch (headers[2].column2) {
			case "남자": competition.gender = "men"; break;
			case "여자": competition.gender = "women"; break;
			default: competition.gender = "mixed"; break;
		}
	}
	if (headers.length > 3) {
		competition.attribute = headers[3].column1;
		competition.masters = headers[3].column2;
	}

	const comp = getCompetitionByName(competition.competitionName);
	if (comp.toCd) {
		competition.competitionID = Number(comp.toCd);
		competition.eventCount = Number(comp.events);
	}

	return competition;
}