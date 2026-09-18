const MagazineModel		= require("./magazine.model");
const utilError		= require("../../Class/utilError");

const group_max_row = 5;
const post_before = 5;
const post_after = 5;

class MagazineServices {

	static async create() {
		//-----------------------------------------
		return await MagazineModel.create();
		//-----------------------------------------
	}

	static async detail(body) {
		console.log("magazines.detail.body=", body);
		try{
			if (!body.magazineID				) return utilError.errorMSG("Service","magazines", "detail", "magazineID not found");
			if (isNaN(body.magazineID)	) return utilError.errorMSG("Service","magazines", "detail", "magazineID not numbers");
			//-----------------------------------------
			return await MagazineModel.detail(body);
			//-----------------------------------------			return result;
		} catch (err) {
			return utilError.errorMSG("Service","magazines", "detail", "catch." + err.message);
		}
	}

	static async list(body) {
		console.log("magazines.list.body=", body);
		try{
			
			if (body.magazineID				)	{
				return await MagazineModel.detail(body);
			}
			const query = {};
			if (body.title			)	query.title 			= new RegExp("^" + body.title.trim(), "gi");
			if (body.datetime != '전체' && body.datetime					)	query.datetime 	= new RegExp("^" + body.datetime.trim(), "gi");
			if (body.gender != '전체' && body.gender							)	query.gender 		= body.gender;
			if (body.discipline != '전체' && body.discipline			)	query.discipline= body.discipline;
			if (body.course != '전체' && body.course							)	query.course 		= body.course;
			if (body.distance != '전체' && body.distance					)	query.distance 	= body.distance;
			if (body.classCode != '전체' && body.classCode				)	query.classCode = body.classCode;
			// if (body.isRegistered != '전체' && body.isRegistered	)	query.isRegistered = body.isRegistered == '등록';
			const result = await MagazineModel.list(query, body);
			console.log(query, "===>", result.data.length);
			return result;
		} catch (err) {
			return utilError.errorMSG("Service","magazines", "list", "catch." + err.message);
		}
	}
	

	static async downloadRanking(body) {
		console.log("magazines.list.body=", body);
		try{
			const query = {};
			if (body.competitionID) query.competitionID = Number(body.competitionID);
			if (body.gender				) query.gender 				= body.gender;
			if (body.classCode		) query.classCode 		= body.classCode;
			if (body.discipline		) query.discipline 		= body.discipline;
			if (body.course				) query.course 				= body.course;
			if (body.distance			) query.distance 			= body.distance;
			// if (body.isMasters		) query.isMasters 		= body.isMasters;
			// if (body.isAdult			) query.isAdult 			= body.isAdult;
			// if (body.isJunior			) query.isJunior 			= body.isJunior;
			const result = await MagazineModel.downloadRanking(query);
			console.log("===>", result);
			return result;
		} catch (err) {
			return utilError.errorMSG("Service","magazines", "downloadRanking", "catch." + err.message);
		}
	}

	static async view(body) {
		console.log("magazines.view.body=", body);
		try{
			if (!body.magazineID				) return utilError.errorMSG("Service","magazines", "view", "magazineID not found");
			if (isNaN(body.magazineID)	) return utilError.errorMSG("Service","magazines", "view", "magazineID not numbers");
			//-----------------------------------------
			return await MagazineModel.viewRealtime(body);
			//-----------------------------------------			return result;
		} catch (err) {
			return utilError.errorMSG("Service","magazines", "view", "catch." + err.message);
		}
	}
	
  //####################################################################
  //##########Confirm###################################################
  //####################################################################


	static async insert(body) {
		try{
			//-----------------------------------------
			return await MagazineModel.insert(body);
			//-----------------------------------------
		} catch (err) {
			return utilError.errorMSG("Service","magazines", "insert", "catch." + err.message);
		}
	}

	static async update(body) {
		try{
			if (!body.magazineID				) return utilError.errorMSG("Service","magazines", "update", "magazineID not found");
			if (isNaN(body.magazineID)	) return utilError.errorMSG("Service","magazines", "update", "magazineID not numbers");
			//-----------------------------------------
			return await MagazineModel.update(body);
			//-----------------------------------------
		} catch (err) {
			return utilError.errorMSG("Service","magazines", "update", "catch." + err.message);
		}
	}

	static async delete(body) {
		try{
			if (!body.magazineID				) return utilError.errorMSG("Service","magazines", "delete", "magazineID not found");
			if (isNaN(body.magazineID)	) return utilError.errorMSG("Service","magazines", "delete", "magazineID not numbers");
			//-----------------------------------------
			return await MagazineModel.delete(body.magazineID);
			//-----------------------------------------
		} catch (err) {
			return utilError.errorMSG("Service","magazines", "delete", "catch." + err.message);
		}
	}
}

module.exports = MagazineServices;