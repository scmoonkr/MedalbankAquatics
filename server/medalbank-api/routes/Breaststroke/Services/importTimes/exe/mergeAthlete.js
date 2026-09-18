
const fs        = require('fs');
const utilLibrary = require("../../util/utilLibrary");
const excelLibrary= require('../../util/excelLibrary');
const excel	      = new excelLibrary();
const UtilDate    = require("../../util/utilDate");
const utilDate	  = new UtilDate();

const mskCFG 		  = require('../../config/mskCFG');
const mongoDB			= require('../../class/MongoDB');
const mongoCFG 		= require('../../config/mongoCFG');
const mongodb 		= new mongoDB(mongoCFG.Medalbank.database);

const athleteDAO	= require('../../database/athletes/customDAO');

(async () => {
	let result, body
	
	//------------------------------------------------------------
	//	get merge athletes
	//------------------------------------------------------------
	const context = {
		query: { type: "rare" },
		projection: { _id:0, },
		limit: 10000,
	}
	result = await mongodb.find(mongoCFG.Medalbank.athletesMerge, context);
	//------------------------------------------------------------
console.log(result.data.length);

	let no = 0;
	for (const athlete of result.data) {
		const query = { name: athlete.name, gender: athlete.gender, $or: [ {status: ""}, { status: { $exists: false }} ], };
		const athleteContext = {
			query: query,
			projection: { _id:0, },
			limit: 10000,
			sort: { athleteID:1, }
		}
		const athletes = await mongodb.find(mongoCFG.Medalbank.athletes, athleteContext);
		if (athletes.data.length > 1) {
			console.log(no++, query, athletes.data);
			await this.checkMergeAthletes(athletes.data);
			// return;
		}
	}

})();


exports.checkMergeAthletes = async (athletes) => {
	const athleteOBJ = { athleteIDs: [] };
	for (const athlete of athletes) {
		if (!athleteOBJ.athlete) { //  && athlete.bestTimes
			athleteOBJ.athlete = {
				athleteID	: athlete.athleteID,
				name			: athlete.name,
				nameHide	: athlete.nameHide,
				nameComp	: athlete.nameComp,
				gender		: athlete.gender,
				masters		: athlete.masters,
				individual: athlete.individual,
				adult			: athlete.adult,
				team			: athlete.team,
				teamID		: athlete.teamID,
				ageGroup	: athlete.ageGroup,
			}
		} else {
			athleteOBJ.athleteIDs.push(athlete.athleteID);
		}
		// console.log(athleteOBJ.athlete);
		if (!athleteOBJ.athlete.nameComp) athleteOBJ.athlete.nameComp = athlete.nameComp;

		const styles = [];
		if (athlete.bestTimes) {
			for (const best of athlete.bestTimes) {
				styles.push(`${best.style}-${best.distance}-[${best.times[0].times}]`);
			}
		}
		console.log(`${athlete.name}\t${athlete.team}\t${athlete.gender}\t${athlete.ageGroup}\t${styles.join(', ')}`);
	}
	if (!athleteOBJ.athlete.athleteID || athleteOBJ.athlete.athleteID.length == 0) {
		athleteOBJ.athlete = {
			athleteID	: athletes[0].athleteID,
			name			: athletes[0].name,
			nameHide	: athletes[0].nameHide,
			gender		: athletes[0].gender,
			masters		: athletes[0].masters,
			individual: athletes[0].individual,
			adult			: athletes[0].adult,
			team			: athletes[0].team,
			teamID		: athletes[0].teamID,
			ageGroup	: athletes[0].ageGroup,
		}
		athleteOBJ.athleteIDs = athleteOBJ.athleteIDs.map(el => el.athleteID != athletes[0].athleteID);
	}
	if (athleteOBJ.athleteIDs.length > 0) {
		athleteOBJ.athleteIDs = athleteOBJ.athleteIDs.join(',');

		const result = await athleteDAO.merge({}, athleteOBJ);
	}

	console.log(athleteOBJ)
}