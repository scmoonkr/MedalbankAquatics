const utilJWT = require('../../Class/JWThashLibrary');
const Model		= require("./login.model");
const utilError		= require("../../Util/utilError");

class LoginService {

	static async login(body){
		console.log("--------------------> login.body=", body);
		let returnObj = { message: "", }

		if (!body.email   ) return utilError.errorMSG("Service","login", "login", "이메일 없음 !!");
		if (!body.password) return utilError.errorMSG("Service","login", "login", "password 없음 !!");

		try{
			returnObj = await Model.login(body);
			if (returnObj.message) {
				console.log("login error --->", returnObj.message);
			}
			return returnObj;
    } catch(e){
      return utilError.errorMSG("Service","login", "login", "validatePassword.catch 오류 !!" + e);
		}      

	}

	static async logout(body, token){
		console.log("logout.body=", body, "token=", token);
    let returnObj = { message: "" }
    if (!body.email) return utilError.errorMSG("Service","login", "logout", "이메일, athleteID 없음 !!");
  
    // if (req.token) {
    //   try {
    //     let token = await utilJWT.verify(req.token);
    //   } catch(e) {
    //     return utilError.errorMSG("Service","login", "logout", "JWT 검증.catch !!" + e);
    //   }
    // }
  
    try {				
      const result = await Model.logout(body.userID, token); // findOne이 projection이 안되어 find()사용 return 값은 array type
      result.logoutDate = new Date().toISOString();
      return result; 
    } catch(e) {
      return utilError.errorMSG("Service","login", "logout", "logout.findOne.catch." + e);
    }
	}

	static async signup(body){
		try{
			if (!body.registrationNo	) return utilError.errorMSG("Service","login", "signup", "registrationNo is not found");
			// if (!body.email						) return utilError.errorMSG("Service","login", "signup", "email is not found");
			// if (!body.nickname				) return utilError.errorMSG("Service","login", "signup", "nickname is not found");
			if (!body.password				) return utilError.errorMSG("Service","login", "signup", "password is not found");
			return await Model.signup(signup);
		}catch(err){
			console.log(err);
		}
	}

	/**
	 * 
	 * @param {*} body  athleteID, email, password, newPassword
	 * @returns 
	 */
	static async changePassword(body){
		let returnObj = { message: "", }

		if (!body.athleteID && !body.email) return utilError.errorMSG("Service","login", "changePassword", "athleteID 없음 !!");
		if (!body.password    ) return utilError.errorMSG("Service","login", "changePassword", "password 없음 !!");
		if (!body.newPassword ) return utilError.errorMSG("Service","login", "changePassword", "newPassword 없음 !!");
    
		try{
			const result = await Model.getUserByEmail(body.email);
			if (result.message) return utilError.errorMSG("Service","login", "changePassword", "getUserByEmail error !!" + result.message);
      
			// Decrypt
			const validate = await utilJWT.validatePassword(body.password, result.data.password.trim());
			if (!validate) return utilError.errorMSG("Service","login", "changePassword", "validate 비밀번호 오류 !!");
      
      const newPassword = await utilJWT.encryptPassword(body.newPassword)		// replaceOne에서 치환할 값
      const result1  = await Model.updatePassword(result.data.userID, newPassword);

		}catch(err){
      return utilError.errorMSG("Service","login", "changePassword", "catch." + err);
			console.log(err);
		}
	}

	//####################################################################
	//######### Confirm ##################################################
	//####################################################################
	
	

	static async create(){
	}

	static async jwtPrivateKey(body){
		try{
			return await Model.jwtPrivateKey(body);
		}catch(err){
			console.log(err);
		}
	}

	static async setPasswordByRegistrationNo(body){
      console.log("login.service.login.setPasswordByRegistrationNo.body.", body);
		try{
			if (!body.registrationNo) return utilError.errorMSG("Service","login", "setPasswordByRegistrationNo", "registrationNo 없음 !!");
			if (!body.password   		) return utilError.errorMSG("Service","login", "setPasswordByRegistrationNo", "password 없음 !!");

			return await Model.setPasswordByRegistrationNo(body);
		}catch(err){
      return utilError.errorMSG("Service","login", "setPasswordByRegistrationNo", "delete.catch." + err);
		}
	}

	static async resetPassword(body){
		try{
			if (!body.password	) return utilError.errorMSG("Service","login", "resetPassword", "password 없음 !!");
			if (!body.email     ) return utilError.errorMSG("Service","login", "resetPassword", "email 없음 !!");

			return await Model.resetPassword(body);
		}catch(err){
      return utilError.errorMSG("Service","login", "resetPassword", "delete.catch." + err);
		}
	}

	static async lostPasswordEmail(body){
		try{
			if (body.email) return await Model.lostPasswordEmail(body.email);
			return utilError.errorMSG("Service","login", "lostPasswordEmail", "email 없음 !!");
		}catch(err){
      return utilError.errorMSG("Service","login", "lostPasswordEmail", "catch." + err);
		}
	}

	static async checkEmail(body){
		try{
			return await Model.checkEmail(body.email);
		}catch(err){
      return utilError.errorMSG("Service","login", "checkEmail", "checkEmail.catch." + err);
		}
	}

	static async checkUserID(body){
		try{
			return await Model.checkUserID(body.userID);
		}catch(err){
      return utilError.errorMSG("Service","login", "checkUserID", "checkUserID.catch." + err);
		}
	}

	static async checkNickname(body){
		try{
			return await Model.checkNickname(body.nickname);
		}catch(err){
      return utilError.errorMSG("Service","login", "checkNickname", "checkNickname.catch." + err);
		}
	}

	static async lostPasswordEmail(body){
		try{
			return await Model.lostPasswordEmail(body.nickname);
		}catch(err){
      return utilError.errorMSG("Service","login", "lostPasswordEmail", "checkNickname.catch." + err);
		}
	}

	static async loginLostPassword(body){
		try{
			return await Model.loginLostPassword(body.nickname);
		}catch(err){
      return utilError.errorMSG("Service","login", "loginLostPassword", "checkNickname.catch." + err);
		}
	}

	static async lostPasswordChange(body){
		try{
			return await Model.lostPasswordChange(body.nickname);
		}catch(err){
      return utilError.errorMSG("Service","login", "lostPasswordChange", "checkNickname.catch." + err);
		}
	}
}

module.exports = LoginService;