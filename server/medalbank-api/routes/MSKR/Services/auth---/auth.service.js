const AuthModel= require("./auth.model");
const Customizing	 		= require("./auth.custom");
const utilError				= require("../../Util/utilError");

const group_max_row = 5;
const post_before = 5;
const post_after = 5;

class AuthServices {


	static async login(body){
		let returnObj = { message: "", }

		if (!body.email   ) return utilError.errorMSG("Service","login", "login", "이메일 없음 !!");
		if (!body.password) return utilError.errorMSG("Service","login", "login", "password 없음 !!");

		try{
			returnObj = await AuthModel.login(body);
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
    if (!body.email) return utilError.errorMSG("Service","login", "logout", "이메일, AuthID 없음 !!");
  
    // if (req.token) {
    //   try {
    //     let token = await utilJWT.verify(req.token);
    //   } catch(e) {
    //     return utilError.errorMSG("Service","login", "logout", "JWT 검증.catch !!" + e);
    //   }
    // }
  
    try {				
      const result = await AuthModel.logout(body.userID, token); // findOne이 projection이 안되어 find()사용 return 값은 array type
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
			return await AuthModel.insert(signup);
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
			const result = await AuthModel.getUserByEmail(body.email);
			if (result.message) return utilError.errorMSG("Service","login", "changePassword", "getUserByEmail error !!" + result.message);
      
			// Decrypt
			const validate = await utilJWT.validatePassword(body.password, result.data.password.trim());
			if (!validate) return utilError.errorMSG("Service","login", "changePassword", "validate 비밀번호 오류 !!");
      
      const newPassword = await utilJWT.encryptPassword(body.newPassword)		// replaceOne에서 치환할 값
      const result1  = await AuthModel.updatePassword(result.data.userID, newPassword);

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
			return await AuthModel.jwtPrivateKey(body);
		}catch(err){
			console.log(err);
		}
	}

	static async resetPassword(body){
		try{
			if (!body.password	) return utilError.errorMSG("Service","login", "resetPassword", "password 없음 !!");
			if (!body.email     ) return utilError.errorMSG("Service","login", "resetPassword", "email 없음 !!");

			return await AuthModel.resetPassword(body);
		}catch(err){
      return utilError.errorMSG("Service","login", "resetPassword", "delete.catch." + err);
		}
	}

	static async lostPasswordEmail(body){
		try{
			if (body.email) return await AuthModel.lostPasswordEmail(body.email);
			return utilError.errorMSG("Service","login", "lostPasswordEmail", "email 없음 !!");
		}catch(err){
      return utilError.errorMSG("Service","login", "lostPasswordEmail", "catch." + err);
		}
	}

	static async checkEmail(body){
		try{
			return await AuthModel.checkEmail(body.email);
		}catch(err){
      return utilError.errorMSG("Service","login", "checkEmail", "checkEmail.catch." + err);
		}
	}

	static async checkUserID(body){
		try{
			return await AuthModel.checkUserID(body.userID);
		}catch(err){
      return utilError.errorMSG("Service","login", "checkUserID", "checkUserID.catch." + err);
		}
	}

	static async checkNickname(body){
		try{
			return await AuthModel.checkNickname(body.nickname);
		}catch(err){
      return utilError.errorMSG("Service","login", "checkNickname", "checkNickname.catch." + err);
		}
	}

	static async lostPasswordEmail(body){
		try{
			return await AuthModel.lostPasswordEmail(body.nickname);
		}catch(err){
      return utilError.errorMSG("Service","login", "lostPasswordEmail", "checkNickname.catch." + err);
		}
	}

	static async loginLostPassword(body){
		try{
			return await AuthModel.loginLostPassword(body.nickname);
		}catch(err){
      return utilError.errorMSG("Service","login", "loginLostPassword", "checkNickname.catch." + err);
		}
	}

	static async lostPasswordChange(body){
		try{
			return await AuthModel.lostPasswordChange(body.nickname);
		}catch(err){
      return utilError.errorMSG("Service","login", "lostPasswordChange", "checkNickname.catch." + err);
		}
	}


}

module.exports = AuthServices;