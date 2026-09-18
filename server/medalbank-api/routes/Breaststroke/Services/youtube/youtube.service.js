const YoutubeModel		= require("./youtube.model");
const utilError		= require("../../Class/utilError");

const group_max_row = 5;
const post_before = 5;
const post_after = 5;

class YoutubeServices {

	static async create() {
		//-----------------------------------------
		return await YoutubeModel.create();
		//-----------------------------------------
	}

	static async detail(body) {
		console.log("youtubes.detail.body=", body);
		try{
			if (!body.youtubeID				) return utilError.errorMSG("Service","youtubes", "detail", "youtubeID not found");
			if (isNaN(body.youtubeID)	) return utilError.errorMSG("Service","youtubes", "detail", "youtubeID not numbers");
			//-----------------------------------------
			return await YoutubeModel.detail(body);
			//-----------------------------------------			return result;
		} catch (err) {
			return utilError.errorMSG("Service","youtubes", "detail", "catch." + err.message);
		}
	}

	static async list(body) {
		console.log("youtubes.list.body=", body);
		try{
			
			if (body.youtubeID				)	{
				return await YoutubeModel.detail(body);
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
			const result = await YoutubeModel.list(query, body);
			console.log(query, "===>", result.data.length);
			return result;
		} catch (err) {
			return utilError.errorMSG("Service","youtubes", "list", "catch." + err.message);
		}
	}
	static async view(body) {
		console.log("youtubes.view.body=", body);
		try{
			if (!body.youtubeID				) return utilError.errorMSG("Service","youtubes", "view", "youtubeID not found");
			if (isNaN(body.youtubeID)	) return utilError.errorMSG("Service","youtubes", "view", "youtubeID not numbers");
			//-----------------------------------------
			return await YoutubeModel.viewRealtime(body);
			//-----------------------------------------			return result;
		} catch (err) {
			return utilError.errorMSG("Service","youtubes", "view", "catch." + err.message);
		}
	}
	
  //####################################################################
  //##########Confirm###################################################
  //####################################################################


	static async insert(body) {
		try{
			//-----------------------------------------
			return await YoutubeModel.insert(body);
			//-----------------------------------------
		} catch (err) {
			return utilError.errorMSG("Service","youtubes", "insert", "catch." + err.message);
		}
	}

	static async update(body) {
		try{
			if (!body.youtubeID				) return utilError.errorMSG("Service","youtubes", "update", "youtubeID not found");
			if (isNaN(body.youtubeID)	) return utilError.errorMSG("Service","youtubes", "update", "youtubeID not numbers");
			//-----------------------------------------
			return await YoutubeModel.update(body);
			//-----------------------------------------
		} catch (err) {
			return utilError.errorMSG("Service","youtubes", "update", "catch." + err.message);
		}
	}

	static async delete(body) {
		try{
			if (!body.youtubeID				) return utilError.errorMSG("Service","youtubes", "delete", "youtubeID not found");
			if (isNaN(body.youtubeID)	) return utilError.errorMSG("Service","youtubes", "delete", "youtubeID not numbers");
			//-----------------------------------------
			return await YoutubeModel.delete(body.youtubeID);
			//-----------------------------------------
		} catch (err) {
			return utilError.errorMSG("Service","youtubes", "delete", "catch." + err.message);
		}
	}
}

module.exports = YoutubeServices;