
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
	
	const aggregate = [
		{ $match: { nameUnique: { $exists: false }, $or: [ {status: ""}, { status: { $exists: false }} ], } },
		{ $group: {
				_id: { name: "$name", gender: "$gender" },
				count: { $sum: 1 },
				athleteID: { $first: "$athleteID" }
			}
		},
		{ $project: { name: "$_id.name", gender: "$_id.gender", count: 1, athleteID:1, _id:0}},
		{ $sort: { count:-1 }},
		{ $limit: 10000 },
	]
  result = await mongodb.aggregate(mongoCFG.Medalbank.athletes, aggregate);
	console.log(result.data);
})();
