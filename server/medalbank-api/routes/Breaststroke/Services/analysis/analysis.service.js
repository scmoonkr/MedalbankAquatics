const AnalysisModel= require("./analysis.model");
// const Customizing	 		= require("./analysis.custom");
const utilError				= require("../../Class/utilError");

const group_max_row = 5;
const post_before = 5;
const post_after = 5;

class AnalysisServices {

	static async detail(body) {
		console.log("services.analysis.detail.body=", body);
		// try{
			if (!body.analysisID				) return utilError.errorMSG("Service","analysis", "detail", "analysisID not found");
			if (isNaN(body.analysisID)	) return utilError.errorMSG("Service","analysis", "detail", "analysisID not numbers");
			//-----------------------------------------
			return await AnalysisModel.detail(body);
			//-----------------------------------------			return result;
		// } catch (err) {
		// 	return utilError.errorMSG("Service","analysis", "detail", "catch." + err.message);
		// }
	}
	


	static async view(body) {
		console.log("view=", body);
		try{
			if (!body.analysisID				) return utilError.errorMSG("Service","analysis", "view", "analysisID not found");
			if (isNaN(body.analysisID)	) return utilError.errorMSG("Service","analysis", "view", "analysisID not numbers");
			//-----------------------------------------
			return await AnalysisModel.view(body);
			//-----------------------------------------
		} catch (err) {
			return utilError.errorMSG("Service","analysis", "view", "catch." + err.message);
		}
	}

	static async list(body) {
		try{
			//-----------------------------------------
			return await AnalysisModel.list(body);
			//-----------------------------------------
		} catch (err) {
			return utilError.errorMSG("Service","analysis", "list", "catch." + err.message);
		}
	}

	static async update(body) {
		// try{
			if (!body.analysisID				) return utilError.errorMSG("Service","analysis", "update", "analysisID not found");
			if (isNaN(body.analysisID)	) return utilError.errorMSG("Service","analysis", "update", "analysisID not numbers");
			// if (!body.userID					) return utilError.errorMSG("Service","analysis", "update", "userID not found");
			// if (isNaN(body.userID)		) return utilError.errorMSG("Service","analysis", "update", "analysisID not numbers");
			// if (!body.registrationNo	) return utilError.errorMSG("Service","analysis", "update", "registrationNo not found");
			//-----------------------------------------
			return await AnalysisModel.update(body);
			//-----------------------------------------
		// } catch (err) {
		// 	return utilError.errorMSG("Service","analysis", "update", "catch." + err.message);
		// }
	}

	static async delete(body) {
		try{
			//-----------------------------------------
			return await AnalysisModel.delete(body.analysisID);
			//-----------------------------------------
		} catch (err) {
			return utilError.errorMSG("Service","analysis", "delete", "catch." + err.message);
		}
	}
	
	static async saveAnalysisWithImage(req) {
		// try{
			const body = req.body;
			if (req.file) {
				body.sourcePath = req.file.path; // multer가 저장한 파일의 경로
				// console.log("times.saveAnalysisWithImage.req.file:", req.file.path);
			}

			if (!body.analysisID				) return utilError.errorMSG("Service","analysis", "saveAnalysisWithImage", "analysisID not found");
			if (isNaN(body.analysisID)	) return utilError.errorMSG("Service","analysis", "saveAnalysisWithImage", "analysisID not numbers");
			// if (!body.userID					) return utilError.errorMSG("Service","analysis", "saveAnalysisWithImage", "userID not found");
			// if (isNaN(body.userID)		) return utilError.errorMSG("Service","analysis", "saveAnalysisWithImage", "analysisID not numbers");
			// if (!body.registrationNo	) return utilError.errorMSG("Service","analysis", "saveAnalysisWithImage", "registrationNo not found");
			//-----------------------------------------
			return await AnalysisModel.saveAnalysisWithImage(body);
			//-----------------------------------------
		// } catch (err) {
		// 	return utilError.errorMSG("Service","analysis", "saveAnalysisWithImage", "catch." + err.message);
		// }
	}

	
  //####################################################################
  //######### Confirm ##################################################
  //####################################################################

}

module.exports = AnalysisServices;