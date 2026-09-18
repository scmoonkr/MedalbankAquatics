const fs          = require('fs');
const mskCFG 		  = require('../../Config/mskCFG');
const mongoCFG 		= require('../../Config/mongoCFG');
const mongoDB			= require('../../Class/MongoDB');
const utilLibrary = require("../../Class/utilLibrary");
const UtilDate    = require("../../Class/utilDate");
const teamModel   = require("../teams/teams.model");

const utilDate	  = new UtilDate();
const mongodb 	  = new mongoDB(mongoCFG.Breaststroke.database);

const { Config }  = require('./importUTIL/config');
const Customizing = require('../times/times.custom');
const teamsDAO    = require('../teams/teams.model');


/*********************************************************************
 * 
 *	uploadTeams
 *
 *********************************************************************/
 exports.uploadTeams = async (body) => {

	// console.log(`database.importTime.uploadTeams.body=`, body);
	const returnObj = { message: "", data: {} };

	const teamNames = body.teams.replace(/teams:\n|\t/gi, '').split('\n');
	// console.log(`database.importTime.uploadTeams.teams=`, teamNames);
	//----------> read teams
	const context = {
		query			: {},
		projection: { _id:0, name:1, teamID:1, indexes:1 },
		limit			: 5000,
		skip			: 0,
	}
	//----------------------------------------------
	//	find teams
	//----------------------------------------------
	const result = await mongodb.find(mongoCFG.Breaststroke.teams, context);

	const teams = [];
	if (teamNames.length > 0) {
		// let teamID = await mongodb.max(mongoCFG.Breaststroke.teams, "teamID");
		//-----------------------------
		//-----------------------------
		//-----------------------------
		const indexes = result.data.reduce((arr, data) => {
																	arr = [...arr, data.indexes];
																	return arr;
																}, [])
		// console.log(mongoTeams);
		const newTeams = [];
		for (let name of teamNames) {
			console.log("newTeam", teamNames.length, "name", name);
			name = name.trim();
			const norm = utilLibrary.normalizeString(name);
			if (!indexes.includes(norm)) {
				const value = {
					// teamID: teamID++,
					name: name,
					names: [ name ],
					indexes: [ norm ],
				}
				const teamJSON = await teamModel.insert(value);
				console.log("teams.indert.team:", teamJSON.data);
				if (teamJSON.data.teamID > 0) {
					// newTeams.push(value);
					teams.push({ teamID: teamJSON.data.teamID, name: name });
				}
			}
			// console.log(newTeams.length, newTeams.slice(-1));
		}	
		//-----------------------------
		//-----------------------------
		//-----------------------------

		// if (newTeams.length > 0) {
		// 	await mongodb.insertMany(mongoCFG.Breaststroke.teams, newTeams);
		// }
		console.log("teamArr", newTeams.length);
	}

	returnObj.data.teams = teams;
	return returnObj;
}
