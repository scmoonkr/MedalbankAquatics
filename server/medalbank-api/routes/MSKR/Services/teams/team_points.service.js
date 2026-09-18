const TeamWorkModel= require("../../Models/Ranking/team_points.model");
const utilError		= require("../../Util/utilError");

const group_max_row = 5;
const post_before = 5;
const post_after = 5;
const _limit = 100;

class TeamPointsServices {

	static async list(body) {
		console.log("Services.teamPoints.list.body=", body);
		try{
			if (!body.competitionID				) return utilError.errorMSG("Service",".teamPoints", "list", "competitionID not found");
			if (isNaN(body.competitionID)	) return utilError.errorMSG("Service",".teamPoints", "list", "competitionID not numbers");
			return await TeamWorkModel.getList(body.competitionID);
		} catch (err) {
			return utilError.errorMSG("Service",".teamPoints", "list", "catch." + err.message);
		}
	}
	static async listTotal(body) {
		console.log(">Services.teamPoints.listTotal.body=", body);
		try{
			return await TeamWorkModel.getListTotal(body);
		} catch (err) {
			return utilError.errorMSG("Service",".teamPoints", "listTotal", "catch." + err.message);
		}
	}
	static async listTotalNew(body) {
		console.log(">Services.teamPoints.listTotalNew.body=", body);
		try{
			return await TeamWorkModel.getListTotalNew(body);
		} catch (err) {
			return utilError.errorMSG("Service",".teamPoints", "listTotalNew", "catch." + err.message);
		}
	}

	static async listTeam(body) {
		console.log("Services.teamPoints.listTeam.body=", body);
		try{
			if (!body.teamID				) return utilError.errorMSG("Service",".teamPoints", "listTeam", "teamID not found");
			if (isNaN(body.teamID)	) return utilError.errorMSG("Service",".teamPoints", "listTeam", "teamID not numbers");
			return await TeamWorkModel.getListTeam(body.teamID);
		} catch (err) {
			return utilError.errorMSG("Service",".teamPoints", "listTeam", "catch." + err.message);
		}
	}
	
	static async listTeamLeader(body) {
		console.log("Services.teamPoints.listTeamLeader.body=", body);
		try{
			return await TeamWorkModel.listTeamLeader();
		} catch (err) {
			return utilError.errorMSG("Service","teamPoints", "listTeamLeader", "catch." + err.message);
		}
	}

	static async listTeamWork(body) {
		console.log("Services.teamPoints.listTeamWork.body=", body);
		// try{
			if (!body.teamID				) return utilError.errorMSG("Service",".teamPoints", "listTeamWork", "teamID not found");
			if (isNaN(body.teamID)	) return utilError.errorMSG("Service",".teamPoints", "listTeamWork", "teamID not numbers");
			return await TeamWorkModel.getListTeamWork(body.teamID);
		// } catch (err) {
		// 	return utilError.errorMSG("Service","teamPoints", "listTeamWork", "catch." + err.message);
		// }
	}

	static async build(body) {
		console.log("Services.build.build.body=", body);
		// try{
			if (!body.competitionID && !body.competitionIDs) return utilError.errorMSG("Service",".teamPoints", "build", "competitionID not found");
			return await TeamWorkModel.build(body);
		// } catch (err) {
		// 	return utilError.errorMSG("Service",".teamPoints", "build", "catch." + err.message);
		// }
	}

	static async buildPoints(body) {
		console.log("Services.teamPoints.build.body=", body);
		// try{
			if (!body.competitionID && !body.competitionIDs) return utilError.errorMSG("Service",".teamPoints", "buildPoints", "competitionID not found");
			// if (!body.competitionID				) return utilError.errorMSG("Service",".teamPoints", "buildPoints", "competitionID not found");
			// if (isNaN(body.competitionID)	) return utilError.errorMSG("Service",".teamPoints", "buildPoints", "competitionID not numbers");
			return await TeamWorkModel.buildPoints(body);
		// } catch (err) {
		// 	return utilError.errorMSG("Service",".teamPoints", "build", "catch." + err.message);
		// }
	}

	static async buildStatics(body) {
		console.log("Services.teamPoints.buildStatics.body=", body);
		// try{
			if (!body.competitionID && !body.competitionIDs) return utilError.errorMSG("Service",".teamPoints", "buildStatics", "competitionID not found");
			// if (isNaN(body.competitionID)	) return utilError.errorMSG("Service",".teamPoints", "buildStatics", "competitionID not numbers");
			return await TeamWorkModel.buildStatics(body);
		// } catch (err) {
		// 	return utilError.errorMSG("Service",".teamPoints", "buildStatics", "catch." + err.message);
		// }
	}

	static async buildAll(body) {
		console.log("Services.teamPoints.buildAll.body=", body);
		try{
			return await TeamWorkModel.buildAll(body);
		} catch (err) {
			return utilError.errorMSG("Service",".teamPoints", "buildAll", "catch." + err.message);
		}
	}

	static async delete(body) {
		try{
			if (!body.competitionID				) return utilError.errorMSG("Service","teams", "delete", "competitionID not found");
			if (isNaN(body.competitionID)	) return utilError.errorMSG("Service","teams", "delete", "competitionID not numbers");
			//-----------------------------------------
			return await TeamWorkModel.delete(body.competitionID);
			//-----------------------------------------
		} catch (err) {
			return utilError.errorMSG("Service","teams", "delete", "catch." + err.message);
		}
	}

	static async deleteAll(body) {
		try{
			//-----------------------------------------
			return await TeamWorkModel.deleteAll(body.teamID);
			//-----------------------------------------
		} catch (err) {
			return utilError.errorMSG("Service","teams", "deleteAll", "catch." + err.message);
		}
	}

	static async loadConfig(body) {
		try{
			//-----------------------------------------
			return await TeamWorkModel.loadConfig(body);
			//-----------------------------------------
		} catch (err) {
			return utilError.errorMSG("Service","teams", "loadConfig", "catch." + err.message);
		}
	}

	static async saveConfig(body) {
		try{
			if (Object.keys(body).length < 1) return utilError.errorMSG("Service","teams", "saveConfig", "body not found");
			//-----------------------------------------
			return await TeamWorkModel.saveConfig(body);
			//-----------------------------------------
		} catch (err) {
			return utilError.errorMSG("Service","teams", "saveConfig", "catch." + err.message);
		}
	}

	static async create() {
		//-----------------------------------------
		return await TeamWorkModel.create();
		//-----------------------------------------
	}

}

module.exports = TeamPointsServices;