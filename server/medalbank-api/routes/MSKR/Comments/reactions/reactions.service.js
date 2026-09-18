const extend 				= require('node.extend');
const ReactionModel = require("./reactions.model");
const utilError		  = require("../../../Class/utilError");

class ReactionServices {

	static async update(body) {
		let returnObj = { message: '', data: {}, };

		if (body.userID == undefined	) return utilError.errorMSG("Service","reactions", "updateReaction", "userID not found");
		if (isNaN(body.userID)	    	) return utilError.errorMSG("Service","reactions", "updateReaction", "userID not numbers");

		if (body.dbType == undefined  ) return utilError.errorMSG("Service","reactions", "updateReaction", "dbType not found");

		if (body.dbID == undefined    ) return utilError.errorMSG("Service","reactions", "updateReaction", "dbID not found");
		if (isNaN(body.dbID)	      	) return utilError.errorMSG("Service","reactions", "updateReaction", "dbID not numbers");

		if (body.field == undefined   ) return utilError.errorMSG("Service","reactions", "updateReaction", "field not found");

		// if (body.value == undefined   ) return utilError.errorMSG("Service","reactions", "updateReaction", "value not found");
		// if (isNaN(body.value)	      	) return utilError.errorMSG("Service","reactions", "updateReaction", "value not numbers");

		try{
	// console.log("reactions.update.body=", body, "query=", query, "value=", value);
			//----------------------------------------------------------------
			body = await ReactionModel.update(body);
			return await ReactionModel.getReaction(body.dbType, Number(body.dbID), Number(body.userID));
			//----------------------------------------------------------------
		} catch(err) {
			return utilError.errorMSG("Service","reactions", "update", "catch." + err.message);
		}
	}

	static async getReaction(body) {
		let returnObj = { message: '', data: {}, };

		if (body.userID == undefined	) return utilError.errorMSG("Service","reactions", "updateReaction", "userID not found");
		if (isNaN(body.userID)	    	) return utilError.errorMSG("Service","reactions", "updateReaction", "userID not numbers");

		if (!body.dbType == undefined ) return utilError.errorMSG("Service","reactions", "updateReaction", "dbType not found");

		if (body.dbID == undefined    ) return utilError.errorMSG("Service","reactions", "updateReaction", "dbID not found");
		if (isNaN(body.dbID)	      	) return utilError.errorMSG("Service","reactions", "updateReaction", "dbID not numbers");

		try{
			return await ReactionModel.getReaction(body.dbType, Number(body.dbID), Number(body.userID));
			//----------------------------------------------------------------
		} catch(err) {
			return utilError.errorMSG("Service","reactions", "update", "catch." + err.message);
		}
	}
}

module.exports = ReactionServices;