
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
	
  const context = {
    query     : {},
    projection: { _id:0, athleteID:1, times:1, },
    limit     : 100000,
  }
  result = await mongodb.find(mongoCFG.Medalbank.athletes, context);
	console.log(result.data.length);

	const athleteIDs = [];
	for (const athlete of result.data) {
		if (athlete.times && athlete.times[0].style.includes("Relay")) {
			athleteIDs.push(athlete.athleteID);
		}
	}
	console.log("athleteIDs=", athleteIDs);
  result = await mongodb.deleteMany(mongoCFG.Medalbank.athletes, { athleteID: { $in: athleteIDs } });
})();
