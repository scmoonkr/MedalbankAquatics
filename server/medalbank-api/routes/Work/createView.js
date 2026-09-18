const mongoCFG 		= require('../Config/mongoCFG');
const mongoDB			= require('../Class/MongoDB');
const mongodb 	  = new mongoDB(mongoCFG.Medalbank.database);

const UtilDate    = require("../Class/DateLibrary");
const utilDate	  = new UtilDate();

const utilLibrary = require("../Util/utilLibrary");
const { VIEW	}  	= require('./viewRepository');

const fs = require('fs');

const userNo = 1;



(async() => {
  console.log("mongo events start...");
  let body = {}, result;

	result = await mongodb.createView(mongoCFG.Medalbank.activitiesView, mongoCFG.Medalbank.activities, VIEW.activitiesView());

	// result = await mongodb.createView(mongoCFG.Medalbank.personalBestView, mongoCFG.Medalbank.personalBest, VIEW.personalBestView());

	// result = await mongodb.createView(mongoCFG.Medalbank.repliesView, mongoCFG.Medalbank.replies, VIEW.repliesView());

	// result = await mongodb.createView(mongoCFG.Medalbank.communitiesView, mongoCFG.Medalbank.communities, VIEW.communitiesView());
	// result = await mongodb.createView(mongoCFG.Medalbank.communitiesListView, mongoCFG.Medalbank.communities, VIEW.communitiesListView());

	// result = await mongodb.createView(mongoCFG.Medalbank.athletesView, mongoCFG.Medalbank.athletes, VIEW.athletesView());
	// result = await mongodb.createView(mongoCFG.Medalbank.athletesListView, mongoCFG.Medalbank.athletes, VIEW.athletesListView());
	// result = await mongodb.createView(mongoCFG.Medalbank.competitionsView, mongoCFG.Medalbank.competitions, VIEW.competitionsView());
	// result = await mongodb.createView(mongoCFG.Medalbank.poolsView, mongoCFG.Medalbank.pools, VIEW.poolsView());
	// result = await mongodb.createView(mongoCFG.Medalbank.teamsView, mongoCFG.Medalbank.teams, VIEW.teamsView());
	// result = await mongodb.createView(mongoCFG.Medalbank.teamsView, mongoCFG.Medalbank.teams, VIEW.teamsView());
	

})();

