const Model		= require("./share.model");
const utilError		= require("../../Util/utilError");

class ShareService {

	static async athlete(body){
		let returnObj = { message: "", }

		if (!body.id				) return utilError.errorMSG("Service","share", "athlete", "id not found");
		if (isNaN(body.id)	) return utilError.errorMSG("Service","share", "athlete", "id not numbers");

		try{
			returnObj = await Model.athlete(body);
			if (returnObj.message) {
				console.log("share error --->", returnObj.message);
			}
			return returnObj;
    } catch(e){
      return utilError.errorMSG("Service","share", "athlete", "athlete.catch 오류 !!" + e);
		}      

	}
	static async time(body){
		let returnObj = { message: "", }

		if (!body.id				) return utilError.errorMSG("Service","share", "times", "id not found");
		if (isNaN(body.id)	) return utilError.errorMSG("Service","share", "times", "id not numbers");

		try{
			returnObj = await Model.time(body);
			if (returnObj.message) {
				console.log("share error --->", returnObj.message);
			}
			return returnObj;
    } catch(e){
      return utilError.errorMSG("Service","share", "times", "times.catch 오류 !!" + e);
		}      

	}

}

module.exports = ShareService;