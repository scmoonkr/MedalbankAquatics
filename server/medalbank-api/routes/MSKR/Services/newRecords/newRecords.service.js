const NewRecordsModel		= require("./newRecords.model");
const utilError		= require("../../Util/utilError");

const group_max_row = 5;
const post_before = 5;
const post_after = 5;

class NewRecordsServices {

	static async create() {
		//-----------------------------------------
		return await NewRecordsModel.create();
		//-----------------------------------------
	}

	static async list(body) {
		console.log("newRecords.list.body=", body);
		try{
			const result = await NewRecordsModel.list(body);
			console.log("===>", result.data.length, result.data[0])
			return result;
		} catch (err) {
			return utilError.errorMSG("Service",mongoCFG.Medalbank.newRecords, "list", "catch." + err.message);
		}
	}
	
  //####################################################################
  //##########Confirm###################################################
  //####################################################################


	static async insert(body) {
		try{
			//-----------------------------------------
			return await NewRecordsModel.insert(body);
			//-----------------------------------------
		} catch (err) {
			return utilError.errorMSG("Service",mongoCFG.Medalbank.newRecords, "insert", "catch." + err.message);
		}
	}

	static async update(body) {
		try{
			if (!body.newRecordsID				) return utilError.errorMSG("Service",mongoCFG.Medalbank.newRecords, "update", "newRecordsID not found");
			if (isNaN(body.newRecordsID)	) return utilError.errorMSG("Service",mongoCFG.Medalbank.newRecords, "update", "newRecordsID not numbers");
			//-----------------------------------------
			return await NewRecordsModel.update(body);
			//-----------------------------------------
		} catch (err) {
			return utilError.errorMSG("Service",mongoCFG.Medalbank.newRecords, "update", "catch." + err.message);
		}
	}

	static async delete(body) {
		try{
			if (!body.newRecordsID				) return utilError.errorMSG("Service",mongoCFG.Medalbank.newRecords, "delete", "newRecordsID not found");
			if (isNaN(body.newRecordsID)	) return utilError.errorMSG("Service",mongoCFG.Medalbank.newRecords, "delete", "newRecordsID not numbers");
			//-----------------------------------------
			return await NewRecordsModel.delete(body.newRecordsID);
			//-----------------------------------------
		} catch (err) {
			return utilError.errorMSG("Service",mongoCFG.Medalbank.newRecords, "delete", "catch." + err.message);
		}
	}
}

module.exports = NewRecordsServices;