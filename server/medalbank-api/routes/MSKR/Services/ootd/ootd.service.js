const OOTDModel		= require("./ootd.model");
const utilError		= require("../../Util/utilError");

const group_max_row = 5;
const post_before = 5;
const post_after = 5;

class OOTDServices {

	static async create() {
		//-----------------------------------------
		return await OOTDModel.create();
		//-----------------------------------------
	}

	static async saveOOTDWithImage(req) {
		try{
			const body = req.body;
			if (req.file) {
				body.sourcePath = req.file.path; // multer가 저장한 파일의 경로
				console.log("times.saveOOTDWithImage.req.file:", req.file.path);
			}
			// if (!body.ootdID				) return utilError.errorMSG("Service","ootd", "saveOOTDWithImage", "ootdID not found");
			// if (isNaN(body.ootdID)	) return utilError.errorMSG("Service","ootd", "saveOOTDWithImage", "ootdID not numbers");
			//-----------------------------------------
			return await OOTDModel.saveOOTDWithImage(body);
			//-----------------------------------------
		} catch (err) {
			return utilError.errorMSG("Service","ootd", "saveOOTDWithImage", "catch." + err.message);
		}
	}

	static async detail(body) {
		console.log("ootd.detail.body=", body);
		try{
			if (!body.ootdID				) return utilError.errorMSG("Service","ootd", "detail", "ootdID not found");
			if (isNaN(body.ootdID)	) return utilError.errorMSG("Service","ootd", "detail", "ootdID not numbers");
			//-----------------------------------------
			return await OOTDModel.detail(body);
			//-----------------------------------------			return result;
		} catch (err) {
			return utilError.errorMSG("Service","ootd", "detail", "catch." + err.message);
		}
	}

	static async list(body) {
		console.log("ootd.list.body=", body);
		try{
			// if 			(body.name			)	return await OOTDModel.getByName(body);
			// else if (body.sido			)	return await OOTDModel.getBySido(body);
			// else if (body.data			)	return await OOTDModel.getByData(body);
			// else if (body.province	)	return await OOTDModel.getByProvince(body);
			const query = {};
			// if (body.title			)	query.title = new RegExp("^" + body.title.trim(), "gi");
			if (body.brands			)	query.brands = { $all: body.brands };
			const result = await OOTDModel.list(query, body);
			console.log(query, "===>", result.data.length)
			return result;
		} catch (err) {
			return utilError.errorMSG("Service","ootd", "list", "catch." + err.message);
		}
	}
	static async view(body) {
		console.log("ootd.view.body=", body);
		try{
			if (!body.ootdID				) return utilError.errorMSG("Service","ootd", "view", "ootdID not found");
			if (isNaN(body.ootdID)	) return utilError.errorMSG("Service","ootd", "view", "ootdID not numbers");
			//-----------------------------------------
			return await OOTDModel.viewRealtime(body);
			//-----------------------------------------			return result;
		} catch (err) {
			return utilError.errorMSG("Service","ootd", "view", "catch." + err.message);
		}
	}
	
  //####################################################################
  //##########Confirm###################################################
  //####################################################################


	static async insert(body) {
		try{
			//-----------------------------------------
			return await OOTDModel.insert(body);
			//-----------------------------------------
		} catch (err) {
			return utilError.errorMSG("Service","ootd", "insert", "catch." + err.message);
		}
	}

	static async update(body) {
		try{
			if (!body.ootdID				) return utilError.errorMSG("Service","ootd", "update", "ootdID not found");
			if (isNaN(body.ootdID)	) return utilError.errorMSG("Service","ootd", "update", "ootdID not numbers");
			//-----------------------------------------
			return await OOTDModel.update(body);
			//-----------------------------------------
		} catch (err) {
			return utilError.errorMSG("Service","ootd", "update", "catch." + err.message);
		}
	}

	static async delete(body) {
		try{
			if (!body.ootdID				) return utilError.errorMSG("Service","ootd", "delete", "ootdID not found");
			if (isNaN(body.ootdID)	) return utilError.errorMSG("Service","ootd", "delete", "ootdID not numbers");
			//-----------------------------------------
			return await OOTDModel.delete(body.ootdID);
			//-----------------------------------------
		} catch (err) {
			return utilError.errorMSG("Service","ootd", "delete", "catch." + err.message);
		}
	}
}

module.exports = OOTDServices;