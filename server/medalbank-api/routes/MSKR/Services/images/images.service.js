const ImageModel= require("./images.model");
const utilError				= require("../../Util/utilError");

const group_max_row = 5;
const post_before = 5;
const post_after = 5;

class ImageServices {


	static async list(body){
		let returnObj = { message: "", }

		// if (!body.db					) return utilError.errorMSG("Service","images", "list", "db not found");
		// if (!body.id					) return utilError.errorMSG("Service","images", "list", "id not found");
		// if (isNaN(body.id)		) return utilError.errorMSG("Service","images", "list", "id not numbers");
		// if (!body.userID			) return utilError.errorMSG("Service","images", "list", "userID not found");
		// if (isNaN(body.userID)) return utilError.errorMSG("Service","images", "list", "userID not numbers");
		// if (!body.tags				) return utilError.errorMSG("Service","images", "list", "tags not found");

		try{
			returnObj = await ImageModel.list(body);
			if (returnObj.message) {
				console.log("images error --->", returnObj.message);
			}
			return returnObj;
    } catch(e){
      return utilError.errorMSG("Service","images", "list", ".catch 오류 !!" + e);
		}      

	}
	static async detail(body){
		let returnObj = { message: "", }

		if (!body.imageID) return utilError.errorMSG("Service","images", "detail", "imageID not found");

		try{
			returnObj = await ImageModel.detail(body);
			if (returnObj.message) {
				console.log("images error --->", returnObj.message);
			}
			return returnObj;
    } catch(e){
      return utilError.errorMSG("Service","images", "detail", ".catch 오류 !!" + e);
		}      

	}

	static async updateImagesMeta(body){
		let returnObj = { message: "", }

		if (!body.db					) return utilError.errorMSG("Service","images", "updateImagesMeta", "db not found");
		if (!body.id					) return utilError.errorMSG("Service","images", "updateImagesMeta", "id not found");
		if (isNaN(body.id)		) return utilError.errorMSG("Service","images", "updateImagesMeta", "id not numbers");
		// if (!body.userID			) return utilError.errorMSG("Service","images", "updateImagesMeta", "userID not found");
		// if (isNaN(body.userID)) return utilError.errorMSG("Service","images", "updateImagesMeta", "userID not numbers");
		// if (!body.type				) return utilError.errorMSG("Service","images", "updateImagesMeta", "type not found");

		try{
			returnObj = await ImageModel.updateImagesMeta(body);
			// if (returnObj.message) {
			// 	console.log("images error --->", returnObj.message);
			// }
			return returnObj;
    } catch(e){
      return utilError.errorMSG("Service","images", "updateImagesMeta", ".catch 오류 !!" + e);
		}      

	}

	static async updateImgbbMeta(body){
		let returnObj = { message: "", }

		if (!body.db					) return utilError.errorMSG("Service","images", "updateImgbbMeta", "db not found");
		if (!body.id					) return utilError.errorMSG("Service","images", "updateImgbbMeta", "id not found");
		if (isNaN(body.id)		) return utilError.errorMSG("Service","images", "updateImgbbMeta", "id not numbers");
		if (!body.type				) return utilError.errorMSG("Service","images", "updateImgbbMeta", "type not found");

		// try{
			returnObj = await ImageModel.updateImgbbMeta(body);
			if (returnObj.message) {
				console.log("images error --->", returnObj.message);
			}
			return returnObj;
    // } catch(e){
    //   return utilError.errorMSG("Service","images", "updateImgbbMeta", ".catch 오류 !!" + e);
		// }      

	}

	static async listCompetition(body){
		let returnObj = { message: "", }
		try{
			returnObj = await ImageModel.listCompetition(body);
			if (returnObj.message) {
				console.log("images error --->", returnObj.message);
			}
			return returnObj;
    } catch(e){
      return utilError.errorMSG("Service","images", "listCompetition", ".catch 오류 !!" + e);
		}
	}

	static async listAidenImagesMeta(body){
		let returnObj = { message: "", }
		try{
			returnObj = await ImageModel.listAidenImagesMeta(body);
			if (returnObj.message) {
				console.log("images error --->", returnObj.message);
			}
			return returnObj;
    } catch(e){
      return utilError.errorMSG("Service","images", "listAidenImagesMeta", ".catch 오류 !!" + e);
		}
	}

	static async insertAidenImagesMeta(body){
		let returnObj = { message: "", }
		try{
			returnObj = await ImageModel.insertAidenImagesMeta(body);
			if (returnObj.message) {
				console.log("images error --->", returnObj.message);
			}
			return returnObj;
    } catch(e){
      return utilError.errorMSG("Service","images", "insertAidenImagesMeta", ".catch 오류 !!" + e);
		}
	}

	static async updateAidenImagesMeta(body){
		let returnObj = { message: "", }

		if (!body.imageID				) return utilError.errorMSG("Service","images", "updateAidenImagesMeta", "imageID not found");
		if (isNaN(body.imageID)	) return utilError.errorMSG("Service","images", "updateAidenImagesMeta", "imageID not numbers");

		try{
			returnObj = await ImageModel.updateAidenImagesMeta(body);
			if (returnObj.message) {
				console.log("images error --->", returnObj.message);
			}
			return returnObj;
    } catch(e){
      return utilError.errorMSG("Service","images", "updateAidenImagesMeta", ".catch 오류 !!" + e);
		}
	}

	static async deleteAidenImagesMeta(body){
		let returnObj = { message: "", }
		if (!body.imageID				) return utilError.errorMSG("Service","images", "deleteAidenImagesMeta", "imageID not found");
		if (isNaN(body.imageID)	) return utilError.errorMSG("Service","images", "deleteAidenImagesMeta", "imageID not numbers");
		try{
			returnObj = await ImageModel.deleteAidenImagesMeta(body);
			if (returnObj.message) {
				console.log("images error --->", returnObj.message);
			}
			return returnObj;
    } catch(e){
      return utilError.errorMSG("Service","images", "insertAidenImagesMeta", ".catch 오류 !!" + e);
		}
	}

	static async saveImage(req) {
		// try{
			const body = req.body;
			if (req.file) {
				body.sourcePath = req.file.path; // multer가 저장한 파일의 경로
				console.log("times.saveImage.req.file:", req.file.path);
			}
			console.log("saveImage ++++++++++++++++++++++++++++", body);

			if (!body.id				) return utilError.errorMSG("Service","images", "saveImage", "id not found");
			if (isNaN(body.id)	) return utilError.errorMSG("Service","images", "saveImage", "id not numbers");
			if (!body.db				) return utilError.errorMSG("Service","images", "saveImage", "db not found");
			if (!body.fileType	) return utilError.errorMSG("Service","images", "saveImage", "fileType not found");
			//-----------------------------------------
			return await ImageModel.saveImage(body);
			//-----------------------------------------
		// } catch (err) {
		// 	return utilError.errorMSG("Service","images", "saveImage", "catch." + err.message);
		// }
		}

		static async athleteImage(body){
		let returnObj = { message: "", }

		body.db = 'athletes';
		// if (!body.type			) return utilError.errorMSG("Service","images", "athlete", "type not found");
		if (!body.id				) return utilError.errorMSG("Service","images", "athlete", "id not found");
		if (isNaN(body.id)	) return utilError.errorMSG("Service","images", "athlete", "id not numbers");
		if (!body.no				) return utilError.errorMSG("Service","images", "athlete", "no not found");
		// if (isNaN(body.no)	) return utilError.errorMSG("Service","images", "athlete", "no not numbers");

		try{
			returnObj = await ImageModel.viewImage(body);
			if (returnObj.message) {
				console.log("images error --->", returnObj.message);
			}
			return returnObj;
    } catch(e){
      return utilError.errorMSG("Service","images", "athlete", "validatePassword.catch 오류 !!" + e);
		}      

	}
	
	static async athletesImage(body){
		let returnObj = { message: "", }

		body.db = 'athletes';
		// if (!body.type			) return utilError.errorMSG("Service","images", "athlete", "type not found");
		if (!body.id				) return utilError.errorMSG("Service","images", "athlete", "id not found");
		if (isNaN(body.id)	) return utilError.errorMSG("Service","images", "athlete", "id not numbers");
		if (!body.no				) return utilError.errorMSG("Service","images", "athlete", "no not found");
		// if (isNaN(body.no)	) return utilError.errorMSG("Service","images", "athlete", "no not numbers");

		try{
			returnObj = await ImageModel.viewImages(body);
			if (returnObj.message) {
				console.log("images error --->", returnObj.message);
			}
			return returnObj;
    } catch(e){
      return utilError.errorMSG("Service","images", "athlete", "validatePassword.catch 오류 !!" + e);
		}      

	}

	static async imageImage(body){
	let returnObj = { message: "", }

	if (!body.db				) return utilError.errorMSG("Service","images", "imageImage", "db not found");
	if (!body.id				) return utilError.errorMSG("Service","images", "imageImage", "id not found");
	if (isNaN(body.id)	) return utilError.errorMSG("Service","images", "imageImage", "id not numbers");
	if (!body.no				) return utilError.errorMSG("Service","images", "imageImage", "no not found");
	// if (isNaN(body.no)	) return utilError.errorMSG("Service","images", "imageImage", "no not numbers");

	// try{
		returnObj = await ImageModel.viewImageImage(body);
		if (returnObj.message) {
			console.log("imageImage error --->", returnObj.message);
		}
		return returnObj;
	// } catch(e){
	// 	return utilError.errorMSG("Service","images", "imageImage", "validatePassword.catch 오류 !!" + e);
	// }      

}

static async imagesImage(body){
	let returnObj = { message: "", }

	if (!body.db				) return utilError.errorMSG("Service","images", "imagesImage", "db not found");
	if (!body.id				) return utilError.errorMSG("Service","images", "imagesImage", "id not found");
	if (isNaN(body.id)	) return utilError.errorMSG("Service","images", "imagesImage", "id not numbers");
	if (!body.no				) return utilError.errorMSG("Service","images", "imagesImage", "no not found");
	// if (isNaN(body.no)	) return utilError.errorMSG("Service","images", "imagesImage", "no not numbers");

	try{
		returnObj = await ImageModel.viewImageImages(body);
		if (returnObj.message) {
			console.log("images error --->", returnObj.message);
		}
		return returnObj;
	} catch(e){
		return utilError.errorMSG("Service","images", "athlete", "validatePassword.catch 오류 !!" + e);
	}      

}

	static async timeImage(body){
	let returnObj = { message: "", }

	body.db = 'times';
	// if (!body.type			) return utilError.errorMSG("Service","images", "time", "type not found");
	if (!body.id				) return utilError.errorMSG("Service","images", "time", "id not found");
	if (isNaN(body.id)	) return utilError.errorMSG("Service","images", "time", "id not numbers");
	if (!body.no				) return utilError.errorMSG("Service","images", "time", "no not found");
	// if (isNaN(body.no)	) return utilError.errorMSG("Service","images", "time", "no not numbers");

	try{
		returnObj = await ImageModel.viewImage(body);
		if (returnObj.message) {
			console.log("images error --->", returnObj.message);
		}
		return returnObj;
	} catch(e){
		return utilError.errorMSG("Service","images", "time", "validatePassword.catch 오류 !!" + e);
	}      

}

static async timesImage(body){
	let returnObj = { message: "", }

	body.db = 'times';
	// if (!body.type			) return utilError.errorMSG("Service","images", "time", "type not found");
	if (!body.id				) return utilError.errorMSG("Service","images", "time", "id not found");
	if (isNaN(body.id)	) return utilError.errorMSG("Service","images", "time", "id not numbers");
	if (!body.no				) return utilError.errorMSG("Service","images", "time", "no not found");
	// if (isNaN(body.no)	) return utilError.errorMSG("Service","images", "time", "no not numbers");

	try{
		returnObj = await ImageModel.viewImages(body);
		if (returnObj.message) {
			console.log("images error --->", returnObj.message);
		}
		return returnObj;
	} catch(e){
		return utilError.errorMSG("Service","images", "time", "validatePassword.catch 오류 !!" + e);
	}      

}

}

module.exports = ImageServices;