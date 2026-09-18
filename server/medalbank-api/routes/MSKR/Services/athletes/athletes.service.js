const AthleteModel= require("./athletes.model");
const Customizing	 		= require("./athletes.custom");
const utilError				= require("../../Util/utilError");

const group_max_row = 5;
const post_before = 5;
const post_after = 5;

class AthleteServices {



	static async list(body) {
		try{
			//-----------------------------------------
			return await AthleteModel.list(body);
			//-----------------------------------------
		} catch (err) {
			return utilError.errorMSG("Service","athletes", "list", "catch." + err.message);
		}
	}
	static async listBackend(body) {
		try{
			//-----------------------------------------
			return await AthleteModel.listBackend(body);
			//-----------------------------------------
		} catch (err) {
			return utilError.errorMSG("Service","athletes", "listBackend", "catch." + err.message);
		}
	}
	static async names(body) {
		try{
			if (!body.name				) return utilError.errorMSG("Service","athletes", "names", "name not found");
			//-----------------------------------------
			return await AthleteModel.names(body);
			//-----------------------------------------
		} catch (err) {
			return utilError.errorMSG("Service","athletes", "names", "catch." + err.message);
		}
	}

	static async viewWithTimes(body) {
		// try{
			if (!body.athleteID				) return utilError.errorMSG("Service","athletes", "viewWithTimes", "athleteID not found");
			if (isNaN(body.athleteID)	) return utilError.errorMSG("Service","athletes", "viewWithTimes", "athleteID not numbers");
			//-----------------------------------------
			return await AthleteModel.viewWithTimes(body);
			//-----------------------------------------
		// } catch (err) {
		// 	return utilError.errorMSG("Service","athletes", "viewWithTimes", "catch." + err.message);
		// }
	}

	static async view(body) {
		console.log("view=", body);
		try{
			if (!body.athleteID				) return utilError.errorMSG("Service","athletes", "view", "athleteID not found");
			if (isNaN(body.athleteID)	) return utilError.errorMSG("Service","athletes", "view", "athleteID not numbers");
			//-----------------------------------------
			return await AthleteModel.view(body);
			//-----------------------------------------
		} catch (err) {
			return utilError.errorMSG("Service","athletes", "view", "catch." + err.message);
		}
	}

	static async detail(body) {
		console.log("services.athletes.detail.body=", body);
		// try{
			if (!body.athleteID				) return utilError.errorMSG("Service","athletes", "detail", "athleteID not found");
			if (isNaN(body.athleteID)	) return utilError.errorMSG("Service","athletes", "detail", "athleteID not numbers");
			//-----------------------------------------
			return await AthleteModel.detail(body);
			//-----------------------------------------			return result;
		// } catch (err) {
		// 	return utilError.errorMSG("Service","athletes", "detail", "catch." + err.message);
		// }
	}
	static async saveAthleteWithImage(req) {
		// try{
			const body = req.body;
			if (req.file) {
				body.sourcePath = req.file.path; // multer가 저장한 파일의 경로
				// console.log("times.saveAthleteWithImage.req.file:", req.file.path);
			}

			if (!body.athleteID				) return utilError.errorMSG("Service","athletes", "saveAthleteWithImage", "athleteID not found");
			if (isNaN(body.athleteID)	) return utilError.errorMSG("Service","athletes", "saveAthleteWithImage", "athleteID not numbers");
			// if (!body.userID					) return utilError.errorMSG("Service","athletes", "saveAthleteWithImage", "userID not found");
			// if (isNaN(body.userID)		) return utilError.errorMSG("Service","athletes", "saveAthleteWithImage", "athleteID not numbers");
			// if (!body.registrationNo	) return utilError.errorMSG("Service","athletes", "saveAthleteWithImage", "registrationNo not found");
			//-----------------------------------------
			return await AthleteModel.saveAthleteWithImage(body);
			//-----------------------------------------
		// } catch (err) {
		// 	return utilError.errorMSG("Service","athletes", "saveAthleteWithImage", "catch." + err.message);
		// }
	}
	static async saveAthleteImage(req) {
		// try{
			const body = req.body;
			if (req.file) {
				body.sourcePath = req.file.path; // multer가 저장한 파일의 경로
				// console.log("times.saveAthleteImage.req.file:", req.file.path);
			}

			if (!body.athleteID				) return utilError.errorMSG("Service","athletes", "saveAthleteImage", "athleteID not found");
			if (isNaN(body.athleteID)	) return utilError.errorMSG("Service","athletes", "saveAthleteImage", "athleteID not numbers");
			//-----------------------------------------
			return await AthleteModel.saveAthleteImage(body);
			//-----------------------------------------
		// } catch (err) {
		// 	return utilError.errorMSG("Service","athletes", "saveAthleteImage", "catch." + err.message);
		// }
	}


	// static async times(body) {
	// 	console.log("times=", body);
	// 	// try{
	// 		if (!body.athleteID				) return utilError.errorMSG("Service","athletes", "times", "athleteID not found");
	// 		if (isNaN(body.athleteID)	) return utilError.errorMSG("Service","athletes", "times", "athleteID not numbers");
	// 		//-----------------------------------------
	// 		return await AthleteModel.times(body);
	// 		//-----------------------------------------
	// 	// } catch (err) {
	// 	// 	return utilError.errorMSG("Service","athletes", "times", "catch." + err.message);
	// 	// }
	// }
	
  //####################################################################
  //######### Confirm ##################################################
  //####################################################################

	static async merge(body) {
		console.log("merge=", body);
		try{
			if (!body.athlete		) return utilError.errorMSG("Service","athletes", "view", "athlete not found");
			if (!body.athlete.athleteID				) return utilError.errorMSG("Service","athletes", "view", "athleteID not found");
			if (isNaN(body.athlete.athleteID)	) return utilError.errorMSG("Service","athletes", "view", "athleteID not numbers");
			if (!body.athleteIDs) return utilError.errorMSG("Service","athletes", "view", "athleteIDs not found");
			//-----------------------------------------
			return await AthleteModel.merge(body);
			//-----------------------------------------
		} catch (err) {
			return utilError.errorMSG("Service","athletes", "merge", "catch." + err.message);
		}
	}

	static async athletesGroup(body) {
		console.log("athletesGroup=", body);
		try{
			// if (!body.group										) return utilError.errorMSG("Service","athletes", "view", "group not found");
			// if (!body.athlete.athleteID				) return utilError.errorMSG("Service","athletes", "view", "athleteID not found");
			// if (isNaN(body.athlete.athleteID)	) return utilError.errorMSG("Service","athletes", "view", "athleteID not numbers");
			// if (!body.athleteIDs) return utilError.errorMSG("Service","athletes", "view", "athleteIDs not found");
			//-----------------------------------------
			return await AthleteModel.athletesGroup(body);
			//-----------------------------------------
		} catch (err) {
			return utilError.errorMSG("Service","athletes", "athletesGroup", "catch." + err.message);
		}
	}

	static async athletesCompetition(body) {
		console.log("athletesCompetition=", body);
		try{
			if (!body.competitionID				) return utilError.errorMSG("Service","athletes", "view", "competitionID not found");
			if (isNaN(body.competitionID)	) return utilError.errorMSG("Service","athletes", "view", "competitionID not numbers");
			//-----------------------------------------
			return await AthleteModel.athletesCompetition(body.competitionID);
			//-----------------------------------------
		} catch (err) {
			return utilError.errorMSG("Service","athletes", "athletesCompetition", "catch." + err.message);
		}
	}

	static async importantAthletes(body) {
		console.log("importantAthletes=", body);
		try{
			//-----------------------------------------
			return await AthleteModel.importantAthletes(body);
			//-----------------------------------------
		} catch (err) {
			return utilError.errorMSG("Service","athletes", "importantAthletes", "catch." + err.message);
		}
	}

	static async noTimes(body) {
		console.log("noTimes=", body);
		try{
			//-----------------------------------------
			return await AthleteModel.noTimes(body);
			//-----------------------------------------
		} catch (err) {
			return utilError.errorMSG("Service","athletes", "noTimes", "catch." + err.message);
		}
	}

	static async top100Athletes(body) {
		console.log("top100Athletes=", body);
		try{
			//-----------------------------------------
			return await AthleteModel.top100Athletes(body);
			//-----------------------------------------
		} catch (err) {
			return utilError.errorMSG("Service","athletes", "top100Athletes", "catch." + err.message);
		}
	}

	static async selectedAthletes(body) {
		console.log("selectedAthletes=", body);
		try{
			if (!body.name		) return utilError.errorMSG("Service","selectedAthletes", "view", "name not found");
			//-----------------------------------------
			return await AthleteModel.selectedAthletes(body.name);
			//-----------------------------------------
		} catch (err) {
			return utilError.errorMSG("Service","athletes", "selectedAthletes", "catch." + err.message);
		}
	}

	static async sameNameGenderTeam(body) {
		console.log("sameNameGenderTeam=", body);
		try{
			//-----------------------------------------
			return await AthleteModel.sameNameGenderTeam(body);
			//-----------------------------------------
		} catch (err) {
			return utilError.errorMSG("Service","athletes", "sameNameGenderTeam", "catch." + err.message);
		}
	}

	static async mergeSameNameGenderTeam(body) {
		console.log("mergeSameNameGenderTeam=", body);
		try{
			//-----------------------------------------
			return await AthleteModel.mergeSameNameGenderTeam(body);
			//-----------------------------------------
		} catch (err) {
			return utilError.errorMSG("Service","athletes", "mergeSameNameGenderTeam", "catch." + err.message);
		}
	}


	static async splitAthletes(body) {
		console.log("splitAthletes=", body);
		try{
			//-----------------------------------------
			return await AthleteModel.splitAthletes(body);
			//-----------------------------------------
		} catch (err) {
			return utilError.errorMSG("Service","athletes", "splitAthletes", "catch." + err.message);
		}
	}

	//----------------------------------------
	//	동명이인 등록
	//----------------------------------------
	static async saveHomonym(body) {
		console.log("saveHomonym=", body);
		try{
			if (!body.name	) return utilError.errorMSG("Service","athletes", "saveHomonym", "name not found");
			if (!body.gender) return utilError.errorMSG("Service","athletes", "saveHomonym", "gender not found");
			if (!body.team	) return utilError.errorMSG("Service","athletes", "saveHomonym", "team not found");
			//-----------------------------------------
			return await AthleteModel.saveHomonym(body);
			//-----------------------------------------
		} catch (err) {
			return utilError.errorMSG("Service","athletes", "saveHomonym", "catch." + err.message);
		}
	}
  /*
  *	희귀이름 조회
  *
  */
	static async uniqueAthletes(body) {
		console.log("uniqueAthletes=", body);
		try{
			if (!body.athleteIDs	) return utilError.errorMSG("Service","athletes", "uniqueAthletes", "athleteIDs not found");
			//-----------------------------------------
			return await AthleteModel.uniqueAthletes();
			//-----------------------------------------
		} catch (err) {
			return utilError.errorMSG("Service","athletes", "uniqueAthletes", "catch." + err.message);
		}
	}

	static async insertUniqueAthlete(body) {
		console.log("insertUniqueAthlete=", body);
		try{
			if (!body.name	) return utilError.errorMSG("Service","athletes", "insertUniqueAthlete", "name not found");
			if (!body.gender) return utilError.errorMSG("Service","athletes", "insertUniqueAthlete", "gender not found");
			//-----------------------------------------
			return await AthleteModel.insertUniqueAthlete(body);
			//-----------------------------------------
		} catch (err) {
			return utilError.errorMSG("Service","athletes", "insertUniqueAthlete", "catch." + err.message);
		}
	}

	static async removeUniqueAthlete(body) {
		console.log("removeUniqueAthlete=", body);
		try{
			if (!body.name	) return utilError.errorMSG("Service","athletes", "removeUniqueAthlete", "name not found");
			if (!body.gender) return utilError.errorMSG("Service","athletes", "removeUniqueAthlete", "gender not found");
			//-----------------------------------------
			return await AthleteModel.removeUniqueAthlete(body);
			//-----------------------------------------
		} catch (err) {
			return utilError.errorMSG("Service","athletes", "removeUniqueAthlete", "catch." + err.message);
		}
	}

	static async unsetTimesAthleteID(body) {
		console.log("unsetTimesAthleteID=", body);
		try{
			if (!body.timeID				) return utilError.errorMSG("Service","athletes", "unsetTimesAthleteID", "timeID not found");
			if (isNaN(body.timeID)	) return utilError.errorMSG("Service","athletes", "unsetTimesAthleteID", "timeID not numbers");
			//-----------------------------------------
			return await AthleteModel.unsetTimesAthleteID(body.timeID);
			//-----------------------------------------
		} catch (err) {
			return utilError.errorMSG("Service","athletes", "unsetTimesAthleteID", "catch." + err.message);
		}
	}

	static async athleteTimes(body) {
		console.log("athleteTimes=", body);
		try{
			if (!body.athleteID				) return utilError.errorMSG("Service","athletes", "athleteTimes", "athleteID not found");
			if (isNaN(body.athleteID)	) return utilError.errorMSG("Service","athletes", "athleteTimes", "athleteID not numbers");
			if (!body.name						) return utilError.errorMSG("Service","athletes", "athleteTimes", "name not found");
			//-----------------------------------------
			return await AthleteModel.athleteTimes(body);
			//-----------------------------------------
		} catch (err) {
			return utilError.errorMSG("Service","athletes", "athleteTimes", "catch." + err.message);
		}
	}

	static async deleteAthleteTimes(body) {
		console.log("deleteAthleteTimes=", body);
		try{
			if (!body.athleteID				) return utilError.errorMSG("Service","athletes", "deleteAthleteTimes", "athleteID not found");
			if (isNaN(body.athleteID)	) return utilError.errorMSG("Service","athletes", "deleteAthleteTimes", "athleteID not numbers");
			//-----------------------------------------
			return await AthleteModel.deleteAthleteTimes(body);
			//-----------------------------------------
		} catch (err) {
			return utilError.errorMSG("Service","athletes", "deleteAthleteTimes", "catch." + err.message);
		}
	}

	static async medalList(body) {
		console.log("medalList=", body);
		try{
			//-----------------------------------------
			return await AthleteModel.medalList(body);
			//-----------------------------------------
		} catch (err) {
			return utilError.errorMSG("Service","athletes", "medalList", "catch." + err.message);
		}
	}

	static async viewMedalbank(body) {
		console.log("view=", body);
		try{
			if (!body.athleteID				) return utilError.errorMSG("Service","athletes", "viewMedalbank", "athleteID not found");
			if (isNaN(body.athleteID)	) return utilError.errorMSG("Service","athletes", "viewMedalbank", "athleteID not numbers");
			//-----------------------------------------
			return await AthleteModel.viewMedalbank(body.athleteID);
			//-----------------------------------------
		} catch (err) {
			return utilError.errorMSG("Service","athletes", "viewMedalbank", "catch." + err.message);
		}
	}

	static async searchName(body) {
		console.log("searchName=", body);
		try{
			//-----------------------------------------
			return await AthleteModel.searchName(body);
			//-----------------------------------------
		} catch (err) {
			return utilError.errorMSG("Service","athletes", "searchName", "catch." + err.message);
		}
	}

	static async insert(body) {
		try{
			if (!body.name	) return utilError.errorMSG("Service","athletes", "insert", "name not found");
			if (!body.gender) return utilError.errorMSG("Service","athletes", "insert", "gender not found");
			//-----------------------------------------
			return await AthleteModel.insert(body);
			//-----------------------------------------
		} catch (err) {
			return utilError.errorMSG("Service","athletes", "insert", "catch." + err.message);
		}
	}

	static async update(body) {
		// try{
			if (!body.athleteID				) return utilError.errorMSG("Service","athletes", "update", "athleteID not found");
			if (isNaN(body.athleteID)	) return utilError.errorMSG("Service","athletes", "update", "athleteID not numbers");
			// if (!body.userID					) return utilError.errorMSG("Service","athletes", "update", "userID not found");
			// if (isNaN(body.userID)		) return utilError.errorMSG("Service","athletes", "update", "athleteID not numbers");
			// if (!body.registrationNo	) return utilError.errorMSG("Service","athletes", "update", "registrationNo not found");
			//-----------------------------------------
			return await AthleteModel.update(body);
			//-----------------------------------------
		// } catch (err) {
		// 	return utilError.errorMSG("Service","athletes", "update", "catch." + err.message);
		// }
	}

	static async updateDelete(body) {
		try{
			//-----------------------------------------
			return await AthleteModel.updateDelete(body);
			//-----------------------------------------
		} catch (err) {
			return utilError.errorMSG("Service","athletes", "uodateDelete", "catch." + err.message);
		}
	}

	static async delete(body) {
		try{
			//-----------------------------------------
			return await AthleteModel.delete(body.athleteID);
			//-----------------------------------------
		} catch (err) {
			return utilError.errorMSG("Service","athletes", "delete", "catch." + err.message);
		}
	}

	//----------------------------------------
	static async create() {
		//-----------------------------------------
		return await AthleteModel.create();
		//-----------------------------------------
	}


}

module.exports = AthleteServices;