const {swimmingCFG} 		= require('../../Config/swimmingCFG');
const UtilDate		= require("../../Class/DateLibrary");
const utilError		= require("../../Class/utilError");
const TimeModel		= require("./times.model");
const Customizing	= require("./times.custom");
const utilDate		= new UtilDate();

const group_max_row = 5;
const post_before = 5;
const post_after = 5;

class timeServices {


	static async detail(body) {
		console.log("times.detail.body=", body);
		try{
			if (!body.timeID				) return utilError.errorMSG("Service","times", "detail", "timeID not found");
			if (isNaN(body.timeID)	) return utilError.errorMSG("Service","times", "detail", "timeID not numbers");
			// if (!body.athleteID			) return utilError.errorMSG("Service","times", "detail", "athleteID not found");
			// if (isNaN(body.athleteID))return utilError.errorMSG("Service","times", "detail", "athleteID not numbers");
			//-----------------------------------------
			return await TimeModel.detail(body);
			//-----------------------------------------			return result;
		} catch (err) {
			return utilError.errorMSG("Service","times", "detail", "catch." + err.message);
		}
	}

	static async view(body) {
		// try{
			if (!body.timeID				) return utilError.errorMSG("Service","times", "view", "timeID not found");
			if (isNaN(body.timeID)	) return utilError.errorMSG("Service","times", "view", "timeID not numbers");
			if (!body.userID			) return utilError.errorMSG("Service","times", "view", "userID not found");
			if (isNaN(body.userID))return utilError.errorMSG("Service","times", "view", "userID not numbers");
			//-----------------------------------------
			return await TimeModel.view(body);
			//-----------------------------------------			return result;
		// } catch (err) {
		// 	return utilError.errorMSG("Service","times", "detail", "catch." + err.message);
		// }
	}

	static async list(body) {
		try{
			let query = {
				$or: [ {status: ""}, { status: { $exists: false }}],
				timeStamp	: { $gt: 0 }, 
				// isMasters : true,
				// isAdult 	: true,
				fin				: { $exists: false }
			};

			if (body.gender		  )	query.gender    = body.gender;
			if (body.name		    )	{
				query.name      = new RegExp("^" + body.name.trim());
			} else if (body.time		  )	{
					query.timeStamp     = utilDate.convertString2Timestamp(body.time);
			} else {
				if (!body.athleteID && body.completed == true) {
					query = { $or: [
							{ athleteID: { $exists: false } },
							{ athleteID: { $eq: 0 } },
						],
					};
				}
				if (body.poolID			)	query.poolID = Number(body.poolID);
				if (body.athleteID  )	query.athleteID = Number(body.athleteID);
				if (body.competitionID) {
					query = {
						$or: [ {status: ""}, { status: { $exists: false }}],
						discipline: { $in: ["FR", "BA", "BR", "FL", "IM"]},
						timeStamp	: { $gt: 0 }, 
					};
					if (Array.isArray(body.competitionID)) {
						if (body.competitionID.indexOf(0) < 0) {
							query.competitionID = { $in: body.competitionID };
						}
					} else {
						if (body.competitionID != '0') {
							query.competitionID = Number(body.competitionID);
						}
					}
				}
				
				if (body.discipline		  )	{
					query.discipline     = body.discipline;
				} else {
					query.discipline = { $in: ["FR", "BA", "BR", "FL", "IM"] };
				}
				if (body.category	  )	query.isMasters = body.category == "masters";
				if (body.typeTime 	)	query.type 			= body.typeTime.replace("Result", "");
				if (body.ageGroup	  )	query.ageGroup  = body.ageGroup;
				if (body.course		  )	query.course    = body.course;
				if (body.distance	  )	query.distance  = body.distance;
				if (body.round		  )	query.round     = body.round;
				if (body.adult  		)	query.isAdult 	= body.adult == "성인";
				// if (body.isAdult  	)	query.isAdult 	= body.isAdult;
				if (body.masters	  )	query.isMasters = body.masters !== "등록";
				if (body.isMasters  )	query.isMasters = body.isMasters;
				if (body.sido	  		)	query.sido  		= body.sido;
				if (body.eventCode  )  query.heatCode = body.heatCode;
				if (body.data       )	query.name      = new RegExp("^" + body.data.trim());
				if (body.ageGroup	  )	query.ageGroup  = body.ageGroup;
			}
			if (body.timeID		  )	{
				query = { timeID: Number(body.timeID) };
			}

			return TimeModel.list(query, body);
			return body.ageGroup == undefined || body.ageGroup == ''
									? TimeModel.list(query, body)
									: TimeModel.listElite(query, body);
		} catch (err) {
			return utilError.errorMSG("Service","times", "list", "catch." + err.message);
		}
	}

	static async delete(body) {
		try{
			if (!body.timeID				) return utilError.errorMSG("Service","times", "delete", "timeID not found");
			if (isNaN(body.timeID)	) return utilError.errorMSG("Service","times", "delete", "timeID not numbers");
			//-----------------------------------------
			return await TimeModel.delete(body.timeID);
			//-----------------------------------------
		} catch (err) {
			return utilError.errorMSG("Service","times", "delete", "catch." + err.message);
		}
	}

	static async saveTimeWithImage(req) {
		console.log("times.services.saveTimeWithImage.body=", req.body);
		// try{
			const body = req.body;
			if (req.file) {
				body.sourcePath = req.file.path; // multer가 저장한 파일의 경로
				console.log("times.saveTimeWithImage.req.file:", req.file.path);
			}

			const time = body.time;

			if (!body.timeID				) return utilError.errorMSG("Service","times", "saveTimeWithImage", "timeID not found");
			if (isNaN(body.timeID)	) return utilError.errorMSG("Service","times", "saveTimeWithImage", "timeID not numbers");

			console.log("~~~~~~~~~~> saveTimeWithImage.", body);
			//-----------------------------------------
			return await TimeModel.saveTimeWithImage(body);
			//-----------------------------------------			return result;
		// } catch (err) {
		// 	return utilError.errorMSG("Service","times", "saveTimeWithImage", "catch." + err.message);
		// }
	}

	static async updateTimesMSKR(body) {
		try{
			if (!body.timeID				) return utilError.errorMSG("Service","times", "updateTimesMSKR", "timeID not found");
			if (isNaN(body.timeID)	) return utilError.errorMSG("Service","times", "updateTimesMSKR", "timeID not numbers");
			// if (!body.times					) return utilError.errorMSG("Service","times", "updateTimesMSKR", "times not found");
			//-----------------------------------------
			return await TimeModel.updateTimesMSKR(body);
			//-----------------------------------------
		} catch (err) {
			return utilError.errorMSG("Service","times", "updateTimes", "catch." + err.message);
		}
	}

	//####################################################################
	//######### Confirm ##################################################
	//####################################################################
}

module.exports = timeServices;