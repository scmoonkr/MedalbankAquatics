const Model = require("./tags.model.js");
const utilError		= require("../../../Util/utilError.js");

const max_limit = 2;
class Services {

	static async create() {
		//-----------------------------------------
		return await Model.create();
		//-----------------------------------------
	}

	static async list(body) {
		console.log("tags.list.service.body=", body);
		try{
			//-----------------------------------------
			return await Model.list(body);
			//-----------------------------------------			return result;
		} catch(err) {
			return utilError.errorMSG("Service","tags", "list", "catch." + err.message);
		}
	}

	static async insert(body) {
		try{
			if (!body.tags				) return utilError.errorMSG("Service","tags", "insert", "tags not found");
			if (!body.userID			) return utilError.errorMSG("Service","tags", "insert", "userID not found");
			if (isNaN(body.userID)) return utilError.errorMSG("Service","tags", "insert", "userID not numbers");
			if (!body.dbType			) return utilError.errorMSG("Service","tags", "insert", "dbType not found");
			if (!body.dbID				) return utilError.errorMSG("Service","tags", "insert", "dbID not found");
			if (isNaN(body.dbID)	) return utilError.errorMSG("Service","tags", "insert", "dbID not numbers");
			//-----------------------------------------
			return await Model.insert(body);
			//-----------------------------------------
		} catch(err) {
			return utilError.errorMSG("Service","tags", "insert", "catch." + err.message);
		}
	}

	static async delete(body) {
		try{
			//-----------------------------------------
			return await Model.delete(body);
			//-----------------------------------------
		}catch(err){
			return utilError.errorMSG("Service","tags", "delete", "catch." + err.message);
		}
	}
}

module.exports = Services;