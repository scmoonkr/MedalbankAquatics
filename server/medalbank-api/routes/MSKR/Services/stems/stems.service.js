const StemModel		= require("./stems.model");
const utilError		= require("../../Util/utilError");

const group_max_row = 5;
const post_before = 5;
const post_after = 5;

class StemServices {

	static async create() {
		//-----------------------------------------
		return await StemModel.create();
		//-----------------------------------------
	}

	static async detail(body) {
		console.log("stems.detail.body=", body);
		try{
			if (!body.stemID				) return utilError.errorMSG("Service","stems", "detail", "stemID not found");
			if (isNaN(body.stemID)	) return utilError.errorMSG("Service","stems", "detail", "stemID not numbers");
			//-----------------------------------------
			return await StemModel.detail(body);
			//-----------------------------------------			return result;
		} catch (err) {
			return utilError.errorMSG("Service","stems", "detail", "catch." + err.message);
		}
	}

	static async list(body) {
		console.log("stems.model.list.body", body);
		try{
			const result = await StemModel.list(body);
			console.log("===>", result.data.length);
			return result;
		} catch (err) {
			return utilError.errorMSG("Service","stems", "list", "catch." + err.message);
		}
	}

	static async update(body) {
		try{
			if (!body.stem				) return utilError.errorMSG("Service","stems", "update", "stem not found");
			//-----------------------------------------
			return await StemModel.update(body);
			//-----------------------------------------
		} catch (err) {
			return utilError.errorMSG("Service","stems", "update", "catch." + err.message);
		}
	}

	static async delete(body) {
		try{
			if (!body.stemID				) return utilError.errorMSG("Service","stems", "delete", "stemID not found");
			if (isNaN(body.stemID)	) return utilError.errorMSG("Service","stems", "delete", "stemID not numbers");
			//-----------------------------------------
			return await StemModel.delete(body.stemID);
			//-----------------------------------------
		} catch (err) {
			return utilError.errorMSG("Service","stems", "delete", "catch." + err.message);
		}
	}

	static async create(body) {
		try{
			//-----------------------------------------
			return await StemModel.create(body);
			//-----------------------------------------
		} catch (err) {
			return utilError.errorMSG("Service","stems", "create", "catch." + err.message);
		}
	}
}

module.exports = StemServices;