const TeamModel		= require("./teams.model");
const Customizing	= require("./teams.custom.js");
const utilError		= require("../../Util/utilError");

const group_max_row = 5;
const post_before = 5;
const post_after = 5;

class StemServices {

	static async saveTeamWithImage(req) {
		console.log("teams.insertWithImage.body=", );
		try{
			const body = req.body;
			if (req.file) {
				console.log("teams.insertWithImage.file=", req.file.path);
				body.sourcePath = req.file.path; // multer가 저장한 파일의 경로
				console.log("times.saveTeamWithImage.req.file:", req.file.path);
			}
			const name = body.name;
			const image = req.file;

			console.log("body:", body);

			//-----------------------------------------
			return await TeamModel.saveTeamWithImage(body);
			//-----------------------------------------			return result;
		} catch (err) {
			return utilError.errorMSG("Service","teams", "insertWithImage", "catch." + err.message);
		}
	}

	static async view(body) {
		try{
			if (!body.teamID				) return utilError.errorMSG("Service","teams", "view", "teamID not found");
			if (isNaN(body.teamID)	) return utilError.errorMSG("Service","teams", "view", "teamID not numbers");
			//-----------------------------------------
			return await TeamModel.view(body);
			// return await TeamModel.searchRealtime(body);
			//-----------------------------------------			return result;
		} catch (err) {
			return utilError.errorMSG("Service","teams", "view", "catch." + err.message);
		}
	}

	static async search(body) {
		console.log("teams.search.body=", body);
		try{
			// return await TeamModel.search(body);
			return await TeamModel.searchRealtime(body);
			
		} catch (err) {
			return utilError.errorMSG("Service","teams", "search", "catch." + err.message);
		}
	}

	static async listRealtime(body) {
		// console.log("teams.listRealtime.body=", body);
		try{
			return await TeamModel.listRealtime(body);
		} catch (err) {
			return utilError.errorMSG("Service","teams", "listRealtime", "catch." + err.message);
		}
	}

	static async merge(body) {
		console.log("new.teams.services.merge.body.name=", body.name);
		try{
			if (!body.teamID				) return utilError.errorMSG("Service","teams", "merge", "teamID not found");
			if (isNaN(body.teamID)	) return utilError.errorMSG("Service","teams", "merge", "teamID not numbers");
			if (!body.teamIDs				) return utilError.errorMSG("Service","teams", "merge", "teamIDs not found");
			return await TeamModel.merge(body);
		} catch (err) {
			return utilError.errorMSG("Service","teams", "merge", "catch." + err.message);
		}
	}

	static async list(body) {
		console.log("new.teams.services.list.body.name=", body);
		try{
			// if (body.name == undefined)	return utilError.errorMSG("Service","teams", "list", "name not found");
			return await TeamModel.list(body);
		} catch (err) {
			return utilError.errorMSG("Service","teams", "list", "catch." + err.message);
		}
	}

	static async names(body) {
		console.log("new.teams.services.names.body.name=", body.name);
		try{
			if (body.name == undefined)	return utilError.errorMSG("Service","teams", "names", "name not found");
			return await TeamModel.getNames(body);
		} catch (err) {
			return utilError.errorMSG("Service","teams", "list", "catch." + err.message);
		}
	}

	static async update(body) {
		try{
			// if (!body.teamID				) return utilError.errorMSG("Service","teams", "update", "teamID not found");
			// if (isNaN(body.teamID)	) return utilError.errorMSG("Service","teams", "update", "teamID not numbers");
			//-----------------------------------------
			return await TeamModel.update(body);
			//-----------------------------------------
		} catch (err) {
			return utilError.errorMSG("Service","teams", "update", "catch." + err.message);
		}
	}

	//####################################################################
	//######### Confirm ##################################################
	//####################################################################

	static async buildStatistics(body) {
		console.log("teams.buildStatistics.body=", body);
		try{
			//-----------------------------------------
			return await TeamModel.buildStatistics();
			//-----------------------------------------			return result;
		} catch (err) {
			return utilError.errorMSG("Service","teams", "buildStatistics", "catch." + err.message);
		}
	}

	static async statistics(body) {
		console.log("teams.statistics.body=", body);
		try{
			if (!body.teamID				) return utilError.errorMSG("Service","teams", "statistics", "teamID not found");
			if (isNaN(body.teamID)	) return utilError.errorMSG("Service","teams", "statistics", "teamID not numbers");
			//-----------------------------------------
			return await TeamModel.statistics(body.teamID);
			//-----------------------------------------			return result;
		} catch (err) {
			return utilError.errorMSG("Service","teams", "statistics", "catch." + err.message);
		}
	}

	static async setTimesStemID(body) {
		console.log("teams.setTimesStemID.body=", body);
		try{
			//-----------------------------------------
			return await TeamModel.setTimesStemID();
			//-----------------------------------------			return result;
		} catch (err) {
			return utilError.errorMSG("Service","teams", "setTimesStemID", "catch." + err.message);
		}
	}
	static async resetTimesStemID(body) {
		console.log("teams.resetTimesStemID.body=", body);
		try{
			//-----------------------------------------
			return await TeamModel.resetTimesStemID();
			//-----------------------------------------			return result;
		} catch (err) {
			return utilError.errorMSG("Service","teams", "resetTimesStemID", "catch." + err.message);
		}
	}
	static async setAthletesStemID(body) {
		console.log("teams.setAthletesStemID.body=", body);
		try{
			//-----------------------------------------
			return await TeamModel.setAthletesStemID();
			//-----------------------------------------			return result;
		} catch (err) {
			return utilError.errorMSG("Service","teams", "setAthletesStemID", "catch." + err.message);
		}
	}
	static async getStemTimesNotExists(body) {
		console.log("teams.getStemTimesNotExists.body=", body);
		try{
			//-----------------------------------------
			return await TeamModel.getStemTimesNotExists();
			//-----------------------------------------			return result;
		} catch (err) {
			return utilError.errorMSG("Service","teams", "getStemTimesNotExists", "catch." + err.message);
		}
	}
	static async getStemAthletesNotExists(body) {
		console.log("teams.getStemAthletesNotExists.body=", body);
		try{
			//-----------------------------------------
			return await TeamModel.getStemAthletesNotExists();
			//-----------------------------------------			return result;
		} catch (err) {
			return utilError.errorMSG("Service","teams", "getStemAthletesNotExists", "catch." + err.message);
		}
	}
	static async setTimesStemIDbyStem(body) {
		console.log("teams.setTimesStemIDbyStem.body=", body);
		try{
			//-----------------------------------------
			return await TeamModel.setTimesStemIDbyStem();
			//-----------------------------------------			return result;
		} catch (err) {
			return utilError.errorMSG("Service","teams", "setTimesStemIDbyStem", "catch." + err.message);
		}
	}
	static async summary(body) {
		console.log("teams.summary.body=", body);
		try{
			if (!body.teamID				) return utilError.errorMSG("Service","teams", "statistics", "teamID not found");
			if (isNaN(body.teamID)	) return utilError.errorMSG("Service","teams", "statistics", "teamID not numbers");
			//-----------------------------------------
			return await TeamModel.statics(body.teamID);
			//-----------------------------------------			return result;
		} catch (err) {
			return utilError.errorMSG("Service","teams", "summary", "catch." + err.message);
		}
	}

	static async detail(body) {
		console.log("teams.detail.body=", body);
		try{
			if (!body.teamID				) return utilError.errorMSG("Service","teams", "detail", "teamID not found");
			if (isNaN(body.teamID)	) return utilError.errorMSG("Service","teams", "detail", "teamID not numbers");
			//-----------------------------------------
			return await TeamModel.detail(body);
			//-----------------------------------------			return result;
		} catch (err) {
			return utilError.errorMSG("Service","teams", "detail", "catch." + err.message);
		}
	}

	static async rank(body) {
		console.log("teams.rank.body=", body);
		try{
			if (body.type != "total")	return await TeamModel.rankTotal(body);
			if (!body.competitionID				) return utilError.errorMSG("Service","teams", "rank", "competitionID not found");
			if (isNaN(body.competitionID)	) return utilError.errorMSG("Service","teams", "rank", "competitionID not numbers");
			return await TeamModel.rankCompetition(body);
			return utilError.errorMSG("Service","teams", "rank", "type error");
		} catch (err) {
			return utilError.errorMSG("Service","teams", "rank", "catch." + err.message);
		}
	}

	static async insert(body) {
		if (!body.name) return utilError.errorMSG("Service","teams", "insert", "name not found");
		try{
			//-----------------------------------------
			return await TeamModel.insert(body);
			//-----------------------------------------
		} catch (err) {
			return utilError.errorMSG("Service","teams", "insert", "catch." + err.message);
		}
	}

	static async updateDelete(body) {
		try{
			if (!body.teamID				) return utilError.errorMSG("Service","teams", "updateDelete", "teamID not found");
			if (isNaN(body.teamID)	) return utilError.errorMSG("Service","teams", "updateDelete", "teamID not numbers");
			if (!body.userID						) return utilError.errorMSG("Service","teams", "updateDelete", "userID not found");
			if (isNaN(body.userID)			) return utilError.errorMSG("Service","teams", "updateDelete", "userID not numbers");
			//-----------------------------------------
			return await TeamModel.updateDelete(body.teamID, body.userID);
			//-----------------------------------------
		} catch (err) {
			return utilError.errorMSG("Service","teams", "uodateDelete", "catch." + err.message);
		}
	}

	static async delete(body) {
		try{
			if (!body.teamID				) return utilError.errorMSG("Service","teams", "delete", "teamID not found");
			if (isNaN(body.teamID)	) return utilError.errorMSG("Service","teams", "delete", "teamID not numbers");
			//-----------------------------------------
			return await TeamModel.delete(body.teamID);
			//-----------------------------------------
		} catch (err) {
			return utilError.errorMSG("Service","teams", "delete", "catch." + err.message);
		}
	}

	static async create() {
		//-----------------------------------------
		return await TeamModel.create();
		//-----------------------------------------
	}

}

module.exports = StemServices;