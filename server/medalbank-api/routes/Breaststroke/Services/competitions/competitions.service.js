const CompetitionModel= require("./competitions.model");
const Customizing	 		= require("./competitions.custom");
const utilError				= require("../../Class/utilError");
const { result } = require("lodash");

const group_max_row = 5;
const post_before = 5;
const post_after = 5;

class CompetitionServices {
  

	static async list(body) {
		console.log("BR.services.competitions.list.body=", body);
		try{
			// if (body.year == "다가오는 대회")	return await CompetitionModel.getUpcommingCompetitions();
			// if (body.sido != "전체" && body.sido)	return await CompetitionModel.getBySido(body);
			// if (body.poolID		)	return await CompetitionModel.getByPoolID(body);
			// if (body.stemID		)	return await CompetitionModel.getByStemID(body);
			// // if (body.course		)	return await CompetitionModel.getByCourse(body);
			// // if (body.measured	)	return await CompetitionModel.getByMeasured(body);
			// if (body.year			)	return await CompetitionModel.getByYear(body);
			// if (body.name			)	return await CompetitionModel.getByName(body);

			let query = {};
			if (body.year == "다가오는 대회")	return await CompetitionModel.getUpcommingCompetitions();
			if (body.year && body.year != "전체")	query.year = Number(body.year);
			if (body.sido != "전체" && body.sido)	query.sido = body.sido;
			if (body.competitionID		)	query.competitionID = Number(body.competitionID);
			if (body.poolID		)	query.poolID = Number(body.poolID);
			if (body.stemID		)	query.stemID = Number(body.stemID);
			if (body.course		)	query.course = body.course;
			if (body.masters	)	query.isMasters = body.masters == "비등록";
			if (body.measured	)	query.measured = body.measured;
			if (body.name			)	query.fullname = new RegExp(body.name.trim(), 'gi');
			const result = await CompetitionModel.list(query, body);
			console.log(query, "--->", result.data.slice(0,10), result.data.length);
			return result;
			return utilError.errorMSG("Service","competitions", "list", "body not found");
			return result;
		} catch (err) {
			return utilError.errorMSG("Service","competitions", "list", "catch." + err.message);
		}
	}
	

	static async viewNew(body) {
		// try{
			if (!body.competitionID				) return utilError.errorMSG("Service","competitions", "view", "competitionID not found");
			if (isNaN(body.competitionID)	) return utilError.errorMSG("Service","competitions", "view", "competitionID not numbers");
			//-----------------------------------------
			return await CompetitionModel.viewNew(body);
			//-----------------------------------------
		// } catch (err) {
		// 	return utilError.errorMSG("Service","competitions", "years", "catch." + err.message);
		// }
	}

	static async detail(body) {
		console.log("competitions.detail.body=", body);
		try{
			if (!body.competitionID				) return utilError.errorMSG("Service","competitions", "detail", "competitionID not found");
			if (isNaN(body.competitionID)	) return utilError.errorMSG("Service","competitions", "detail", "competitionID not numbers");
			//-----------------------------------------
			return await CompetitionModel.detail(body);
			//-----------------------------------------			return result;
		} catch (err) {
			return utilError.errorMSG("Service","competitions", "detail", "catch." + err.message);
		}
	}

	static async brief(body) {
		console.log("competitions.brief.body=", body);
		// try{
			if (!body.competitionID				) return utilError.errorMSG("Service","competitions", "brief", "competitionID not found");
			if (isNaN(body.competitionID)	) return utilError.errorMSG("Service","competitions", "brief", "competitionID not numbers");
			//-----------------------------------------
			return await CompetitionModel.brief(body);
			//-----------------------------------------			return result;
		// } catch (err) {
		// 	return utilError.errorMSG("Service","competitions", "brief", "catch." + err.message);
		// }
	}

	static async saveWithImage(req) {
		try{
			const body = req.body;
			if (req.file) {
				body.sourcePath = req.file.path; // multer가 저장한 파일의 경로
				console.log("times.saveWithImage.req.file:", req.file.path);
			}
			// if (!body.competitionID					) return utilError.errorMSG("Service","competitions", "saveWithImage", "competitionID not found");
			// if (isNaN(body.competitionID)		) return utilError.errorMSG("Service","competitions", "saveWithImage", "competitionID not numbers");
			if (Object.keys(body).length < 2) return utilError.errorMSG("Service","competitions", "saveWithImage", "field not found");
			//-----------------------------------------
			return await CompetitionModel.saveWithImage(body);
			//-----------------------------------------
		} catch (err) {
			return utilError.errorMSG("Service","competitions", "saveWithImage", "catch." + err.message);
		}
	}

	static async searchNames(body) {
		console.log(body);
		try{
			if (!body.name				) return utilError.errorMSG("Service","competitions", "searchNames", "name not found");
			//-----------------------------------------
			return await CompetitionModel.searchNames(body);
			//-----------------------------------------
		} catch (err) {
			return utilError.errorMSG("Service","competitions", "names", "catch." + err.message);
		}
	}

	static async stemNames(body) {
		try{
			if (!body.name				) return utilError.errorMSG("Service","competitions", "stemNames", "name not found");
			//-----------------------------------------
			return await CompetitionModel.stemNames(body);
			//-----------------------------------------
		} catch (err) {
			return utilError.errorMSG("Service","competitions", "stemNames", "catch." + err.message);
		}
	}

	static async saveStem(body) {
		try{
			if (!body.name				) return utilError.errorMSG("Service","competitions", "saveStem", "name not found");
			//-----------------------------------------
			return await CompetitionModel.saveStem(body);
			//-----------------------------------------
		} catch (err) {
			return utilError.errorMSG("Service","competitions", "saveStem", "catch." + err.message);
		}
	}


  //####################################################################
  //######### Confirm ##################################################
  //####################################################################
  
	static async view(body) {
		// try{
			if (!body.competitionID				) return utilError.errorMSG("Service","competitions", "view", "competitionID not found");
			if (isNaN(body.competitionID)	) return utilError.errorMSG("Service","competitions", "view", "competitionID not numbers");
			//-----------------------------------------
			return await CompetitionModel.viewNew(body);
			//-----------------------------------------
		// } catch (err) {
		// 	return utilError.errorMSG("Service","competitions", "years", "catch." + err.message);
		// }
	}
  //####################################################################
  //######### Confirm ##################################################
  //####################################################################

	static async upcomings(body) {
		try{
			//-----------------------------------------
			return await CompetitionModel.upcomings(body);
			//-----------------------------------------
		} catch (err) {
			return utilError.errorMSG("Service","competitions", "upcomings", "catch." + err.message);
		}
	}

	static async names(body) {
		try{
			//-----------------------------------------
			return await CompetitionModel.names(body);
			//-----------------------------------------
		} catch (err) {
			return utilError.errorMSG("Service","competitions", "names", "catch." + err.message);
		}
	}

	static async years(body) {
		try{
			//-----------------------------------------
			return await CompetitionModel.years(body);
			//-----------------------------------------
		} catch (err) {
			return utilError.errorMSG("Service","competitions", "years", "catch." + err.message);
		}
	}

	static async monthGroup(body) {
		try{
			//-----------------------------------------
			return await CompetitionModel.monthGroup();
			//-----------------------------------------
		} catch (err) {
			return utilError.errorMSG("Service","competitions", "monthGroup", "catch." + err.message);
		}
	}

	static async ageGroup(body) {
		try{
			if (!body.cid) return utilError.errorMSG("Service","competitions", "ageGroup", "cid not found");
			//-----------------------------------------
			return await CompetitionModel.ageGroup(body);
			//-----------------------------------------
		} catch (err) {
			return utilError.errorMSG("Service","competitions", "ageGroup", "catch." + err.message);
		}
	}

	static async backendList(body) {
		try{
			if (body.name) return await CompetitionModel.backendListName(body);
			if (body.year) return await CompetitionModel.backendListYear(body);
			//-----------------------------------------
			return await CompetitionModel.backendList({}, body);
			//-----------------------------------------
		} catch (err) {
			return utilError.errorMSG("Service","competitions", "backendList", "catch." + err.message);
		}
	}

	static async upcomming(body) {
		try{
			//-----------------------------------------
			body.limit = 8;
			return await CompetitionModel.getUpcommingCompetitions(body);
			//-----------------------------------------
		} catch (err) {
			return utilError.errorMSG("Service","competitions", "upcomming", "catch." + err.message);
		}
	}

	// ???????????????????????????
	static async medals(body) {
		try{
			if (!body.competitionID				) return utilError.errorMSG("Service","competitions", "detail", "competitionID not found");
			if (isNaN(body.competitionID)	) return utilError.errorMSG("Service","competitions", "detail", "competitionID not numbers");
			//-----------------------------------------
			return await CompetitionModel.medals();
			//-----------------------------------------
		} catch (err) {
			return utilError.errorMSG("Service","competitions", "medals", "catch." + err.message);
		}
	}
	
	// ???????????????????????????
	static async getMedals(body) {
		try{
			//-----------------------------------------
			return await CompetitionModel.getMedals();
			//-----------------------------------------
		} catch (err) {
			return utilError.errorMSG("Service","competitions", "getMedals", "catch." + err.message);
		}
	}

	static async times(body) {
		try{
			//-----------------------------------------
			return await CompetitionModel.times(body);
			//-----------------------------------------
		} catch (err) {
			return utilError.errorMSG("Service","competitions", "times", "catch." + err.message);
		}
	}

	static async competitionTimes(body) {
		try{
			//-----------------------------------------
			return await CompetitionModel.competitionTimes();
			//-----------------------------------------
		} catch (err) {
			return utilError.errorMSG("Service","competitions", "competitionTimes", "catch." + err.message);
		}
	}

	static async disciplineTimes(body) {
		try{
			//-----------------------------------------
			return await CompetitionModel.disciplineTimes();
			//-----------------------------------------
		} catch (err) {
			return utilError.errorMSG("Service","competitions", "disciplineTimes", "catch." + err.message);
		}
	}

	static async create() {
		//-----------------------------------------
		return await CompetitionModel.create();
		//-----------------------------------------
	}

	static async insert(body) {
		// console.log("service.competitions.insert.body.", req.body);
		// try{
			if (!body.fullname) return utilError.errorMSG("Service","competitions", "insert", "fullname not found");
			if (!body.poolID	) return utilError.errorMSG("Service","competitions", "update", "poolID not found");
			if (isNaN(body.poolID)		) return utilError.errorMSG("Service","competitions", "update", "poolID not numbers");
			//-----------------------------------------
			return await CompetitionModel.insert(body);
			//-----------------------------------------
		// } catch (err) {
		// 	return utilError.errorMSG("Service","competitions", "insert", "catch." + err.message);
		// }
	}

	static async update(body) {
		console.log("======> competitions.services.update.body.", body);
		try{
			// if (!body.competitionID					) return utilError.errorMSG("Service","competitions", "update", "competitionID not found");
			// if (isNaN(body.competitionID)		) return utilError.errorMSG("Service","competitions", "update", "competitionID not numbers");
			if (Object.keys(body).length < 2) return utilError.errorMSG("Service","competitions", "update", "field not found");
			//-----------------------------------------
			return await CompetitionModel.update(body);
			//-----------------------------------------
		} catch (err) {
			return utilError.errorMSG("Service","competitions", "update", "catch." + err.message);
		}
	}

	static async updateDelete(body) {
		try{
			if (!body.competitionID				) return utilError.errorMSG("Service","competitions", "updateDelete", "competitionID not found");
			if (isNaN(body.competitionID)	) return utilError.errorMSG("Service","competitions", "updateDelete", "competitionID not numbers");
			if (!body.userID							) return utilError.errorMSG("Service","competitions", "updateDelete", "userID not found");
			if (isNaN(body.userID)				) return utilError.errorMSG("Service","competitions", "updateDelete", "userID not numbers");
			//-----------------------------------------
			return await CompetitionModel.updateDelete(body.competitionID, body.userID);
			//-----------------------------------------
		} catch (err) {
			return utilError.errorMSG("Service","competitions", "uodateDelete", "catch." + err.message);
		}
	}

	static async delete(body) {
		try{
			if (!body.competitionID				) return utilError.errorMSG("Service","competitions", "delete", "competitionID not found");
			if (isNaN(body.competitionID)	) return utilError.errorMSG("Service","competitions", "delete", "competitionID not numbers");
			//-----------------------------------------
			return await CompetitionModel.delete(body.competitionID);
			//-----------------------------------------
		} catch (err) {
			return utilError.errorMSG("Service","competitions", "delete", "catch." + err.message);
		}
	}


}

module.exports = CompetitionServices;