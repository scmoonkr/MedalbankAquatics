const PoolModel		= require("./pools.model");
const Customizing	= require("./pools.custom");
const utilLibrary = require("../../Class/utilLibrary");

const {swimmingCFG} = require('../../Config/swimmingCFG.js');
const utilError		= require("../../Util/utilError");

const group_max_row = 5;
const post_before = 5;
const post_after = 5;

class PoolServices {

	static async create() {
		//-----------------------------------------
		return await PoolModel.create();
		//-----------------------------------------
	}

	static async savePoolWithImage(req) {
		try{
			const body = req.body;
			if (req.file) {
				body.sourcePath = req.file.path; // multer가 저장한 파일의 경로
				console.log("times.savePoolWithImage.req.file:", req.file.path);
			}
			// if (!body.poolID				) return utilError.errorMSG("Service","pools", "savePoolWithImage", "poolID not found");
			// if (isNaN(body.poolID)	) return utilError.errorMSG("Service","pools", "savePoolWithImage", "poolID not numbers");
			//-----------------------------------------
			return await PoolModel.savePoolWithImage(body);
			//-----------------------------------------
		} catch (err) {
			return utilError.errorMSG("Service","pools", "savePoolWithImage", "catch." + err.message);
		}
	}

	static async detail(body) {
		// console.log("pools.detail.body=", body);
		try{
			if (!body.poolID				) return utilError.errorMSG("Service","pools", "detail", "poolID not found");
			if (isNaN(body.poolID)	) return utilError.errorMSG("Service","pools", "detail", "poolID not numbers");
			//-----------------------------------------
			return await PoolModel.detail(body.poolID);
			//-----------------------------------------			return result;
		} catch (err) {
			return utilError.errorMSG("Service","pools", "detail", "catch." + err.message);
		}
	}

	static async list(body) {
		// console.log("pools.list.body=", body);
		try{
			// if 			(body.name			)	return await PoolModel.getByName(body);
			// else if (body.sido			)	return await PoolModel.getBySido(body);
			// else if (body.data			)	return await PoolModel.getByData(body);
			// else if (body.province	)	return await PoolModel.getByProvince(body);
			const query = {};
			if (body.name) {
					console.log("1----->", body.name.slice(-1));
				if (body.name.slice(-1) == "%") {
					console.log("2----->", body.name);
					const table = swimmingCFG.charTable.find(el => el.gte == body.name.slice(0, -1).trim());
					query.name = {
						$gte: table.gte,
						$lt: table.lt,
					};
					console.log("3----->", query.name);
				} else {
					const norm = utilLibrary.normalizeString(body.name);
					query.indexes = new RegExp(norm, "gi");
				}
			}
			if (body.sido && body.sido != '전국')	query.sido = body.sido.trim();
			if (body.course && body.course != '전체')	query.course = body.course.trim();
			const result = await PoolModel.list(query, body);
			console.log(query, "===>", result.data.length);
			return result;
		} catch (err) {
			return utilError.errorMSG("Service","pools", "list", "catch." + err.message);
		}
	}
	static async view(body) {
		// console.log("pools.view.body=", body);
		try{
			if (!body.poolID				) return utilError.errorMSG("Service","pools", "view", "poolID not found");
			if (isNaN(body.poolID)	) return utilError.errorMSG("Service","pools", "view", "poolID not numbers");
			//-----------------------------------------
			return await PoolModel.viewRealtime(body);
			//-----------------------------------------			return result;
		} catch (err) {
			return utilError.errorMSG("Service","pools", "view", "catch." + err.message);
		}
	}

	static async names(body) {
		// console.log("pools.names.body=", body);
		try{
			if 			(!body.name			)	return utilError.errorMSG("Service","pools", "names", "name not found");
			return await PoolModel.names(body);
			return result;
		} catch (err) {
			return utilError.errorMSG("Service","pools", "names", "catch." + err.message);
		}
	}
	
  //####################################################################
  //##########Confirm###################################################
  //####################################################################


	static async viewOLD(body) {
		// console.log("pools.view.body=", body);
		// try{
			if (!body.poolID				) return utilError.errorMSG("Service","pools", "view", "poolID not found");
			if (isNaN(body.poolID)	) return utilError.errorMSG("Service","pools", "view", "poolID not numbers");
			//-----------------------------------------
			return await PoolModel.view(body.poolID);
			//-----------------------------------------			return result;
		// } catch (err) {
		// 	return utilError.errorMSG("Service","pools", "view", "catch." + err.message);
		// }
	}

	static async insert(body) {
		try{
			//-----------------------------------------
			return await PoolModel.insert(body);
			//-----------------------------------------
		} catch (err) {
			return utilError.errorMSG("Service","pools", "insert", "catch." + err.message);
		}
	}

	static async update(body) {
		try{
			// if (!body.poolID				) return utilError.errorMSG("Service","pools", "update", "poolID not found");
			// if (isNaN(body.poolID)	) return utilError.errorMSG("Service","pools", "update", "poolID not numbers");
			//-----------------------------------------
			return await PoolModel.update(body);
			//-----------------------------------------
		} catch (err) {
			return utilError.errorMSG("Service","pools", "update", "catch." + err.message);
		}
	}

	static async updateDelete(body) {
		try{
			if (!body.poolID				) return utilError.errorMSG("Service","pools", "updateDelete", "poolID not found");
			if (isNaN(body.poolID)	) return utilError.errorMSG("Service","pools", "updateDelete", "poolID not numbers");
			if (!body.userID				) return utilError.errorMSG("Service","pools", "updateDelete", "userID not found");
			if (isNaN(body.userID)	) return utilError.errorMSG("Service","pools", "updateDelete", "userID not numbers");
			//-----------------------------------------
			return await PoolModel.updateDelete(body.poolID, body.userID);
			//-----------------------------------------
		} catch (err) {
			return utilError.errorMSG("Service","pools", "uodateDelete", "catch." + err.message);
		}
	}

	static async delete(body) {
		try{
			if (!body.poolID				) return utilError.errorMSG("Service","pools", "delete", "poolID not found");
			if (isNaN(body.poolID)	) return utilError.errorMSG("Service","pools", "delete", "poolID not numbers");
			//-----------------------------------------
			return await PoolModel.delete(body.poolID);
			//-----------------------------------------
		} catch (err) {
			return utilError.errorMSG("Service","pools", "delete", "catch." + err.message);
		}
	}
}

module.exports = PoolServices;