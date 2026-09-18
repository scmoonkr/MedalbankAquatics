const AthleteModel= require("./athletes.model");
const Customizing	 		= require("./athletes.custom");
const utilError				= require("../../Class/utilError");

const group_max_row = 5;
const post_before = 5;
const post_after = 5;

class AthleteServices {

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

	static async list(body) {
		try{
			//-----------------------------------------
			return await AthleteModel.list(body);
			//-----------------------------------------
		} catch (err) {
			return utilError.errorMSG("Service","athletes", "list", "catch." + err.message);
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

	static async delete(body) {
		try{
			//-----------------------------------------
			return await AthleteModel.delete(body.athleteID);
			//-----------------------------------------
		} catch (err) {
			return utilError.errorMSG("Service","athletes", "delete", "catch." + err.message);
		}
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

	
  //####################################################################
  //######### Confirm ##################################################
  //####################################################################

}

module.exports = AthleteServices;