
const fs        = require('fs');
const excelLibrary= require('../../util/excelLibrary');
const excel	      = new excelLibrary();
const UtilDate    = require("../../util/utilDate");
const utilDate	  = new UtilDate();
const utilLibrary = require("../../util/utilLibrary");

const mongoDB			= require('../../class/MongoDB');
const mongoCFG 		= require('../../config/mongoCFG');
const mongodb 		= new mongoDB(mongoCFG.Medalbank.database);
const mergeDAO    = require('../../database/teams/mergeDAO');

// const uploadTeamsDAO = require('../uploadTeamsDAO');


//================================================
//	set teamID to times
//================================================
exports.setTimesTeamID = async () => {
	const query = { $or:[ { team:"" }, { teamID:0 }, { teamID: {$exists:false } } ]};
	let times = await mongodb.distinct(mongoCFG.Medalbank.times, "team", query)
	console.log("times=", times.data.length);

	const context = {
		// query: { teamID: { $in: uploadedCompetitions } },
		projection: {_id:0, },
		limit: 100000,
		skip: 0,
		sort: { teamID:1 },
	}
	const teams = await mongodb.find(mongoCFG.Medalbank.teams, context);
	console.log("teams=", teams.data.length);

	const notExists = [];
	for (const teamName of times.data) {
		const name = utilLibrary.normalizeString(teamName);
		if (name) {
			console.log("team=", name);
			const team = teams.data.find(tm => tm.indexes.includes(name));
			if (team) {
				const query = {team: teamName };
				const value = { teamID: team.teamID };
				await mongodb.updateMany(mongoCFG.Medalbank.times, query, value)
				console.log("----->", query, value);
			} else {
				notExists.push(teamName);
			}
		}
	}
	console.log("team.not found: ", notExists);
	return notExists.join(',');
}


(async () => {
	
	await this.setTimesTeamID();
	return;
	let context = {
		query: {},
		projection: { _id:0,teamID:1, name:1, names:1, indexes:1},
		limit: 10000,
		sort: { teamID:1 }
	}
	let result = await mongodb.find(mongoCFG.Medalbank.teams, context)
	console.log(result.data.length);

	const teams = await this.checkSameName(result.data);
})();

//================================================
//	check same team name exists
//================================================
exports.checkSameName = async (teams) => {

	for (let no=0; no<teams.length-1; no++) {
		const team = teams[no];
		console.log("id=", team.teamID, "name=", team.name);
		for (let no1=0; no1<teams.length; no1++) {
			if (team.teamID == teams[no1].teamID) continue;
			
			const name = utilLibrary.normalizeString(team.name)
			if (teams[no1].indexes.includes(name)) {
				console.log(`-----> teamID=${team.teamID}, name=${team.name} == teamID=${teams[no1].teamID} `)
				const body = {
					teamID: team.teamID,
					name: team.name,
					teamIDs: [ teams[no1].teamID ],
				}
				let result = await mergeDAO.merge( body );
			}
		}
	}

}