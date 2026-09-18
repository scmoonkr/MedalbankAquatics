const ImgBBModel= require("./imgBB.model");
const utilError				= require("../../Util/utilError");

const group_max_row = 5;
const post_before = 5;
const post_after = 5;

class ImgBBService {


	static async saveImage(req) {
		try{
			const body = req.body;
			if (req.file) {
				body.sourcePath = req.file.path; // multer가 저장한 파일의 경로
				console.log("times.saveImage.req.file:", req.file.path);
			}
			console.log("saveImage ++++++++++++++++++++++++++++", body);

			if (!body.id				) return utilError.errorMSG("Service","imgBB", "saveImage", "id not found");
			if (isNaN(body.id)	) return utilError.errorMSG("Service","imgBB", "saveImage", "id not numbers");
			if (!body.db				) return utilError.errorMSG("Service","imgBB", "saveImage", "db not found");
			if (!body.fileType	) return utilError.errorMSG("Service","imgBB", "saveImage", "fileType not found");
			//-----------------------------------------
			return await ImgBBModel.saveImage(body);
			//-----------------------------------------
		} catch (err) {
			return utilError.errorMSG("Service","imgBB", "saveImage", "catch." + err.message);
		}
	}

	static async updateImagesMeta(body){
		let returnObj = { message: "", }

		if (!body.db					) return utilError.errorMSG("Service","imgBB", "updateImagesMeta", "db not found");
		if (!body.id					) return utilError.errorMSG("Service","imgBB", "updateImagesMeta", "id not found");
		if (isNaN(body.id)		) return utilError.errorMSG("Service","imgBB", "updateImagesMeta", "id not numbers");
		if (!body.userID			) return utilError.errorMSG("Service","imgBB", "updateImagesMeta", "userID not found");
		if (isNaN(body.userID)) return utilError.errorMSG("Service","imgBB", "updateImagesMeta", "userID not numbers");
		if (!body.type				) return utilError.errorMSG("Service","images", "athlete", "type not found");

		try{
			returnObj = await ImgBBModel.updateImagesMeta(body);
			if (returnObj.message) {
				console.log("images error --->", returnObj.message);
			}
			return returnObj;
    } catch(e){
      return utilError.errorMSG("Service","imgBB", "updateImagesMeta", "validatePassword.catch 오류 !!" + e);
		}      

	}
}

module.exports = ImgBBService;