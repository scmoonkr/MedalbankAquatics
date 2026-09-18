const ItemModel		= require("./items.model");
const utilError		= require("../../Util/utilError");

const group_max_row = 5;
const post_before = 5;
const post_after = 5;

class ItemServices {

	static async create() {
		//-----------------------------------------
		return await ItemModel.create();
		//-----------------------------------------
	}

	static async saveItemWithImage(req) {
		try{
			const body = req.body;
			if (req.file) {
				body.sourcePath = req.file.path; // multer가 저장한 파일의 경로
				console.log("times.saveItemWithImage.req.file:", req.file.path);
			}
			// if (!body.itemID				) return utilError.errorMSG("Service","items", "saveItemWithImage", "itemID not found");
			// if (isNaN(body.itemID)	) return utilError.errorMSG("Service","items", "saveItemWithImage", "itemID not numbers");
			//-----------------------------------------
			return await ItemModel.saveItemWithImage(body);
			//-----------------------------------------
		} catch (err) {
			return utilError.errorMSG("Service","items", "saveItemWithImage", "catch." + err.message);
		}
	}

	static async detail(body) {
		console.log("items.detail.body=", body);
		try{
			if (!body.itemID				) return utilError.errorMSG("Service","items", "detail", "itemID not found");
			if (isNaN(body.itemID)	) return utilError.errorMSG("Service","items", "detail", "itemID not numbers");
			//-----------------------------------------
			return await ItemModel.detail(body);
			//-----------------------------------------			return result;
		} catch (err) {
			return utilError.errorMSG("Service","items", "detail", "catch." + err.message);
		}
	}

	static async portfolio(body) {
		console.log("items.portfolio.body=", body);
		try{
			if (!body.portfolio				) return utilError.errorMSG("Service","items", "portfolio", "portfolio not found");
			//-----------------------------------------
			return await ItemModel.portfolio(body);
			//-----------------------------------------			return result;
		} catch (err) {
			return utilError.errorMSG("Service","items", "portfolio", "catch." + err.message);
		}
	}

	static async collections(body) {
		console.log("items.collections.body=", body);
		try{
			//-----------------------------------------
			return await ItemModel.collections(body);
			//-----------------------------------------			return result;
		} catch (err) {
			return utilError.errorMSG("Service","items", "collections", "catch." + err.message);
		}
	}

	static async list(body) {
		console.log("items.list.body=", body);
		try{
			
			if (body.itemID				)	{
				return await ItemModel.detail(body);
			}
			const query = {};
			if (body.title			)	query.title 			= new RegExp("^" + body.title.trim(), "gi");
			if (body.type				)	query.type 				= body.type;
			// if (body.size				)	query.size 				= body.size;
			if (body.itemID		)	{
				query.itemID 			= { $in: body.itemID.split(',').map(el => Number(el.trim()))};
			}
			if (body.brand			)	query.brand 			= body.brand;
			if (body.category		)	query.category 		= body.category;
			if (body.manufacture)	query.manufacture = body.manufacture;
			const result = await ItemModel.list(query, body);
			console.log(query, "===>", result.data.length);
			return result;
		} catch (err) {
			return utilError.errorMSG("Service","items", "list", "catch." + err.message);
		}
	}
	static async view(body) {
		console.log("items.view.body=", body);
		try{
			if (!body.itemID				) return utilError.errorMSG("Service","items", "view", "itemID not found");
			if (isNaN(body.itemID)	) return utilError.errorMSG("Service","items", "view", "itemID not numbers");
			//-----------------------------------------
			return await ItemModel.viewRealtime(body);
			//-----------------------------------------			return result;
		} catch (err) {
			return utilError.errorMSG("Service","items", "view", "catch." + err.message);
		}
	}
	
  //####################################################################
  //##########Confirm###################################################
  //####################################################################


	static async insert(body) {
		try{
			//-----------------------------------------
			return await ItemModel.insert(body);
			//-----------------------------------------
		} catch (err) {
			return utilError.errorMSG("Service","items", "insert", "catch." + err.message);
		}
	}

	static async update(body) {
		try{
			if (!body.itemID				) return utilError.errorMSG("Service","items", "update", "itemID not found");
			if (isNaN(body.itemID)	) return utilError.errorMSG("Service","items", "update", "itemID not numbers");
			//-----------------------------------------
			return await ItemModel.update(body);
			//-----------------------------------------
		} catch (err) {
			return utilError.errorMSG("Service","items", "update", "catch." + err.message);
		}
	}

	static async delete(body) {
		try{
			if (!body.itemID				) return utilError.errorMSG("Service","items", "delete", "itemID not found");
			if (isNaN(body.itemID)	) return utilError.errorMSG("Service","items", "delete", "itemID not numbers");
			//-----------------------------------------
			return await ItemModel.delete(body.itemID);
			//-----------------------------------------
		} catch (err) {
			return utilError.errorMSG("Service","items", "delete", "catch." + err.message);
		}
	}
}

module.exports = ItemServices;