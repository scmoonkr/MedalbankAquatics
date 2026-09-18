
const fs          = require("fs");
const mongoDB     = require('../../Class/MongoDB');
const mongoCFG    = require('../../Config/mongoCFG');
const mongodb     = new mongoDB("MedalBank");

(async () => {

  	const context = {
		query				: { },
		projection	: { _id:0 },
		limit				: 1000,
		sort				: { _id: 1 },
	}
  const result = await mongodb.find(mongoCFG.Medalbank.myRankingCompetitions, context);


	let compStr = "";
	result.data.forEach(comp => {
		compStr += comp.cid + "\t";
		compStr += comp.name + "\t";
		compStr += comp.datetime + "\t";
		compStr += comp.sido + "\t";
		compStr += comp.pool + "\n";
	})

	// console.log(compStr.slice(0, 100));
	fs.writeFileSync("competitions.csv", compStr)

	compStr = "exports.competitions = " + JSON.stringify(result.data, null, "\t")
	fs.writeFileSync("competitions.js", compStr)

})();