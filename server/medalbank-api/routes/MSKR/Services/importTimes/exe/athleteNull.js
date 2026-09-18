
const fs        = require('fs');
const excelLibrary= require('../../util/excelLibrary');
const excel	      = new excelLibrary();
const UtilDate    = require("../../util/utilDate");
const utilDate	  = new UtilDate();

const mskCFG 		  = require('../../config/mskCFG');
const mongoDB			= require('../../class/MongoDB');
const mongoCFG 		= require('../../config/mongoCFG');
const mongodb 		= new mongoDB(mongoCFG.Medalbank.database);

(async () => {
	let result, body
	
	let context = {
		query: { $or: [ { name: "" }, { name: { $exists: false } } ], fin: { $exists: false }},
		projection: { _id:0, athleteID:1, },
		limit: 10000,
	}
	result = await mongodb.find(mongoCFG.Medalbank.athletes, context);
	
	const athleteIDs = result.data.map(el => el.athleteID );
	console.log(athleteIDs.length);

	context = {
		query: { athleteID: { $in: athleteIDs }, fin: { $exists: false }},
		projection: { _id:0, athleteID:1, name:1, gender:1, team:1, teamID:1, adult:1, ageGroup:1, nameHide:1  },
		limit: 10000,
	}
	result = await mongodb.find(mongoCFG.Medalbank.times, context);
console.log(result.data.length);

	const athleteOBJ = result.data.reduce((obj, time) => {
		if (!obj[time.athleteID]) obj[time.athleteID] = time;
		return obj;
	}, {})
	const athletes = Object.values(athleteOBJ);
	console.log(athletes.length);
	for (const athlete of athletes) {
		const query = { athleteID: athlete.athleteID }
		console.log(query, athlete)
		result = await mongodb.updateOne(mongoCFG.Medalbank.athletes, query, athlete);

	}

})();
