const mongoCFG 		= require('../Config/mongoCFG');
const mongoDB			= require('../Class/MongoDB');
const mongodb 	  = new mongoDB(mongoCFG.Medalbank.database);

// const {Customizing, Comments,}	= require("../Customizing/comments");
// const {Communities}	= require("../Customizing/communities");
const Customizing	= require("../Customizing/communities");
const {List}      = require("./comments");
const {ListQuery} = require("./query");

(async () => {
	let result;
	let body = {};

	body = { dbType: "community", dbID: 1, userID: 1 };
	body = { userID: 1 };
	// const aggregate = List.comments(body);
	// result = await mongodb.aggregate(mongoCFG.Medalbank.comments, aggregate)

	body = { userID: 1 };
	const aggregate = ListQuery.communities(body);
	// console.log(JSON.stringify(aggregate, null, '  '));
	result = await mongodb.aggregate(mongoCFG.Medalbank.communities, aggregate)
	result = Customizing.Communities(result.data);
	console.log(result[1]);
	console.log("comments=", result[1].comments[0]);

})();
