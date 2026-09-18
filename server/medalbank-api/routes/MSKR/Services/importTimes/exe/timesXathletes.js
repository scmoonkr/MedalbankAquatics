
const fs        = require('fs');
const excelLibrary= require('../../util/excelLibrary');
const excel	      = new excelLibrary();
const UtilDate    = require("../../util/utilDate");
const utilDate	  = new UtilDate();

const mskCFG 		  = require('../../config/mskCFG');
const mongoDB			= require('../../class/MongoDB');
const mongoCFG 		= require('../../config/mongoCFG');
const mongodb 		= new mongoDB(mongoCFG.Medalbank.database);
const athleteDAO	= require('../../database/athletes/backendDAO');

// athletes에 있는 athleteID가 times에 athleteID가 없는 times 
(async () => {
	let result, body

  const athletes = await mongodb.distinct(mongoCFG.Medalbank.athletes, "athleteID", { $or: [ {status: ""}, { status: { $exists: false }} ], });	
console.log("athletes.athleteID=", athletes.data.length);

	const times = await mongodb.distinct(mongoCFG.Medalbank.times, "athleteID");	
	console.log("times.athleteID=", times.data.length);

	const athleteIDs = times.data.reduce((arr, athleteID) => {
		if (!athletes.data.includes(athleteID)) arr.push(athleteID);
		return arr;
	}, [])
	console.log(athleteIDs, athleteIDs.length);

	result = await mongodb.updateManyOP(mongoCFG.Medalbank.times, { athleteID: { $in: athleteIDs } }, { $unset: { athleteID:1}});	
return;
  const context = {
    query     : { athleteID: athleteIDs, fin: { $exists: false } },
    projection: { _id:0, },
    limit     : 100000,
  }
  result = await mongodb.find(mongoCFG.Medalbank.times, context);

	console.log(result.data.length);



})();