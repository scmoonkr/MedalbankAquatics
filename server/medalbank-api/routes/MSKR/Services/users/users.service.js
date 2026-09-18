const UserModel = require("./users.model");
// const QuestionModel = require("../questions/questions.model.js");
const utilError		= require("../../Util/utilError");

class UserServices{


	static async setUser(body){
		// try {
			if (!body.registrationNo) return utilError.errorMSG("Service","users", "setUser", "registrationNo is not found");
			// if (!body.email					) return utilError.errorMSG("Service","users", "setUser", "email is not found");
			// if (!body.nickname			) return utilError.errorMSG("Service","users", "setUser", "nickname is not found");
			if (!body.password			) return utilError.errorMSG("Service","users", "setUser", "password is not found");
			return await UserModel.updateByRegistrationNo(body);	
		// } catch (err){
		// 	return utilError.errorMSG("Service","users", "setUser", "catch." + err);
		// }
	}

  //##################################################################
  //########################## confirm ###############################
  //##################################################################





	static async searchNames(body){
		try {
			if (body.name		) return await UserModel.getByName(body.name);
			if (body.gender	) return await UserModel.getByGender(body.gender);
			return utilError.errorMSG("Service","users", "searchNames", "name, gender is not found");
		} catch (err){
			return utilError.errorMSG("Service","users", "searchNames", "catch." + err);
		}
	}

	static async checkEmail(body){
		console.log("services.users.checkEmail.body", body);
		try {
			if (body.email) return await UserModel.checkEmail(body);
			return utilError.errorMSG("Service","users", "checkEmail", "email is not found");
		} catch (err){
			return utilError.errorMSG("Service","users", "checkEmail", "catch." + err);
		}
	}

	static async checkNickname(body){
		try {
			if (body.nickname) return await UserModel.checkNickname(body);
			return utilError.errorMSG("Service","users", "checkNickname", "nickname is not found");
		} catch (err){
			return utilError.errorMSG("Service","users", "checkNickname", "catch." + err);
		}
	}

	static async settings(body){
		try {
			const result = { message: '', };
			result.data = {
				years: memoryDB.years,
				// statics: memoryDB.statistics,
				// history: memoryDB.history,
			}
			return result;
		} catch (err){
			return utilError.errorMSG("Service","users", "searchNames", "catch." + err);
		}
	}

	static async summary(body){
		try {
			if (!body.userID				) return utilError.errorMSG("Service","users", "summary", "userID is not found");
			if (isNaN(body.userID)	) return utilError.errorMSG("Service","users", "summary", "userID is not numbers");

			const result = await this.detail(body);
			result.data.extraInfo = await UserModel.getStatistics(body);

			// const questions = await QuestionModel.list(body);
			// result.data.questions = questions.data.sort((a,b) => b.category.localeCompare(a.category) && b.answer.localeCompare(a.answer) && b.question.localeCompare(a.question));
			result.data.questions = questions.data.sort((a,b) => a.category.localeCompare(b.category));

			return result;
		} catch (err){
			return utilError.errorMSG("Service","users", "summary", "catch." + err);
		}
	}

	static async questions(body){
		try {
			if (!body.userID				) return utilError.errorMSG("Service","users", "questions", "userID is not found");
			if (isNaN(body.userID)	) return utilError.errorMSG("Service","users", "questions", "userID is not numbers");

			const result = await this.detail(body.userID);
			result.data.questions = await Questions.list(body);

			return await UserModel.findOne(userID);
		} catch (err){
			return utilError.errorMSG("Service","users", "questions", "catch." + err);
		}
	}

	static async updatePublic(body){
		try {
			if (!body.userID				) return utilError.errorMSG("Service","users", "questions", "userID is not found");
			if (isNaN(body.userID)	) return utilError.errorMSG("Service","users", "questions", "userID is not numbers");
			if (body.field		) return utilError.errorMSG("Service","users", "questions", "field is not found");
			if (body.value		) return utilError.errorMSG("Service","users", "questions", "value is not found");
			return await UserModel.updatePublic(body.name);
		} catch (err){
			return utilError.errorMSG("Service","users", "updatePublic", "catch." + err);
		}
	}

	static async list(body){
		try {
			// if (body.name		) return await UserModel.getByName(body);
			// if (body.gender	) return await UserModel.getByGender(body);
			// if (body.regist	) return await UserModel.getByRegistNo(body.regist);
			return await UserModel.search(body);
		} catch (err){
			return utilError.errorMSG("Service","users", "list", "catch." + err);
		}
	}

	static async detail(body){
		console.log("new.services.users.detail.body.", body);
		try {
			// number: userID, else: registrationNo
			if (!body.userID				) return utilError.errorMSG("Service","users", "detail", "userID is not found");
			// if (isNaN(body.userID)	) return utilError.errorMSG("Service","users", "detail", "userID is not numbers");

			return await UserModel.getByUserID(body.userID);
		} catch (err){
			return utilError.errorMSG("Service","users", "detail", "catch." + err);
		}
	}

	static async brief(body){
		try {
			// number: userID, else: registrationNo
			if (!body.userID				) return utilError.errorMSG("Service","users", "brief", "userID is not found");
			// if (isNaN(body.userID)	) return utilError.errorMSG("Service","users", "brief", "userID is not numbers");

			return await UserModel.getBriefByUserID(body.userID);
		} catch (err){
			return utilError.errorMSG("Service","users", "brief", "catch." + err);
		}
	}

	static async insert(body){
		try {
			if (!body.email		) return utilError.errorMSG("Service","users", "detail", "email is not found");
			if (!body.nickname) return utilError.errorMSG("Service","users", "detail", "nickname is not found");
			return await UserModel.insert(body);
		} catch (err){
			return utilError.errorMSG("Service","users", "searchNames", "catch." + err);
		}
	}

	static async update(body){
		try {
			if (body.userID &&!isNaN(body.userID)) return await UserModel.update(body);
			if (body.registrationNo	) return await UserModel.updateByRegistrationNo(body);
			return utilError.errorMSG("Service","users", "update", "userID is not numbers");

			
		} catch (err){
			return utilError.errorMSG("Service","users", "searchNames", "catch." + err);
		}
	}

	static async setPassword(body){
		try {
			if (!body.registrationNo) return utilError.errorMSG("Service","users", "setPassword", "registrationNo is not found");
			if (!body.password			) return utilError.errorMSG("Service","users", "setPassword", "password is not found");
			return await UserModel.updateByRegistrationNo(body);	
		} catch (err){
			return utilError.errorMSG("Service","users", "setPassword", "catch." + err);
		}
	}

	static async updateDelete(body){
		try {
			if (!body.userID				) return utilError.errorMSG("Service","users", "updateDelete", "userID is not found");
			if (isNaN(body.userID)	) return utilError.errorMSG("Service","users", "updateDelete", "userID is not numbers");

			return await UserModel.updateDelete(userID);
		} catch (err){
			return utilError.errorMSG("Service","users", "searchNames", "catch." + err);
		}
	}

	static async delete(body){
		try {
			if (!body.userID				) return utilError.errorMSG("Service","users", "delete", "userID is not found");
			if (isNaN(body.userID)	) return utilError.errorMSG("Service","users", "delete", "userID is not numbers");

			return await UserModel.delete(userID);
		} catch (err){
			return utilError.errorMSG("Service","users", "delete", "catch." + err);
		}
	}

	static async create(){
	}
}

module.exports = UserServices;