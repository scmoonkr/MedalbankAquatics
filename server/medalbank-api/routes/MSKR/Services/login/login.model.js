const mskCFG 		= require('../../Config/mskCFG');
const mongoCFG 		= require('../../Config/mongoCFG');
const { ObjectId } = require("mongodb");
const mongoDB			= require('../../Class/MongoDB');
const UtilDate    = require("../../Class/DateLibrary");
const utilLibrary = require("../../Util/utilLibrary");
const utilError		= require("../../Util/utilError");
const utilJWT 		= require('../../Class/JWThashLibrary');

const mongodb 	  = new mongoDB(mongoCFG.Medalbank.database);
const utilDate	  = new UtilDate();


class LoginModel {

  static async login(body){
    console.log("login.", body);
    const returnObj = { message: "", data: {}};
    let result ={}				
    try {
      const query = {};
      if (isNaN(body.email)) { // email
        query.email = body.email.trim();
      } else {
        query.userID = Number(body.email.trim());
      }
      const projection = { _id:0, email:1, name:1, nickname:1, password:1, userID:1, dob:1, gender:1, ageGroupCode:1, athleteID:1, role:1, level:1, };
      //----------------------------------------------------------------
      result = await mongodb.findOne(mongoCFG.Medalbank.users, query, projection);
      //----------------------------------------------------------------		if (result.data.email) {   // object null check ECMA 5+:
			if (!result.data.userID) return utilError.errorMSG("Model","login", "login", "userID not found");
    } catch (e) {
      return utilError.errorMSG("Model","login", "login", "findOne.catch." + e);
    } 
    
    try {
      // const pwd = await utilJWT.saltAndHash(password);
      // Decrypt
      const validate = await utilJWT.validatePassword(body.password, result.data.password.trim());
      if (!validate) return utilError.errorMSG("Model","login", "login", "비밀번호 오류 !!");
    }	catch(e) {
      return utilError.errorMSG("Model","login", "login", "catch."+ e);
    }
    result.data.ageGroup = mskCFG.getAgeGroupNameByAgeGroupCode(result.data.ageGroupCode)
    delete result.data.ageGroupCode;
    result.data.athleteID = result.data.athleteID ? result.data.athleteID : result.data.userID;
    console.log("login.result.data=", result.data);
    delete result.data.password;
    returnObj.data = result.data;

    //-----> get default menu
    // let menus = await MenuService.detailByUserID({userID: 0});
    // returnObj.menus = menus.data.menus;

    // const menus = await MenuService.detailByUserID({userID:result.data.userID});
    // returnObj.myMenus = menus.data && menus.data.length > 0 ? menus.data: [];
    returnObj.myMenus = [];

    try {
      returnObj.token = await utilJWT.sign({userID: result.data.userID, nickname: result.data.nickname, email: result.data.email, });	 //body Json web token으로 변환
    } catch(e) {
      return utilError.errorMSG("Model","login", "login", "JWT 토큰 오류."+e);
    }

    return returnObj;
  }

  /**
   * 
   * @param {*} email : email or userID(숫자)
   * @param {*} token 
   * @returns 
   */
  static async logout(email, token){
    console.log("logout.email=", email, "token=", token);
    let returnObj = { message: "", data: {}};
    try {
      const query = {};
      if (isNaN(email)) { // email
        query.email = email;
      } else {
        query.userID = Number(email);
      }

      const projection = { _id:0, athleteID:1, email:1, };
      //----------------------------------------------------------------
      returnObj = await mongodb.findOne(mongoCFG.Medalbank.users, query, projection);
      console.log("logout.find=", returnObj.data);
      //---------------------------------------------------------------- // findOne이 projection이 안되어 find()사용 return 값은 array type
      returnObj.logoutDate = new Date().toISOString();
      if (token) {
        try {
          returnObj.token = await utilJWT.remove(token);
        } catch(e) {
          return utilError.errorMSG("Model","login", "logout", "JWT 토큰 오류."+e);
        }
      }
      return returnObj; 
    } catch (e) {
      return utilError.errorMSG("Model","users", "logout", "findOne.catch." + e);
    } 
  }

  // signup
  static async signup(body) {
    let returnObj = { message: '', data: {}, };
    if (Object.keys(body).length < 2) return utilError.errorMSG("Model","login", "signup", "field not found");
    const value = Customizing.field(body);
    delete value.registrationNo;
		value.updated =  new Date();

    value.password = await utilJWT.encryptPassword(body.password)		// replaceOne에서 치환할 값
		const query = { registrationNo: body.registrationNo };	
		//----------------------------------------------------------------
		returnObj = await mongodb.updateOne(mongoCFG.Medalbank.users, query, value);
		//----------------------------------------------------------------

    return returnObj;
  }

  /**
   * 
   * @param {*} body: athleteID, email, password, newPassword
   * @returns 
   */
  static async changePassword(body){
    const returnObj = { message: "", data: {}};
    try {
      const query = {};
      if (isNaN(body.email)) { // email
        query.email = body.email.trim();
      } else {
        query.userID = Number(body.email);
      }
      const projection 	= { _id:0, };
      //----------------------------------------------------------------
      const userinfo  = await mongodb.findOne(mongoCFG.Medalbank.users, query, projection);         // mongodb에서 가져온 userinfo를 newpassword로 update
      //----------------------------------------------------------------
      if (!userinfo.data.email) return utilError.errorMSG("Model","users", "changePassword", "userinfo 없음");
  
      //----------------------------------------------------------------
      const validate = await utilJWT.validatePassword(body.password.trim(), userinfo.data.password);
      //----------------------------------------------------------------
      if (!validate) return utilError.errorMSG("Model","users", "changePassword", "비밀번호 오류 !!");

      //----------------------------------------------------------------
      const hashedPassword = await utilJWT.encryptPassword(body.newPassword.trim())
      //----------------------------------------------------------------

      //----------------------------------------------------------------
      const value  	= { password: hashedPassword };
      const result  = await mongodb.updateOne(mongoCFG.Medalbank.users, query, value);
      //----------------------------------------------------------------
      return returnObj;	
    } catch (e) {
      return utilError.errorMSG("Model","users", "changePassword", "findOne.catch." + e);
    } 
  }


//####################################################################
//######### Confirm ##################################################
//####################################################################


  static async jwtPrivateKey(email){
    try {
      return utilJWT.jwtPrivateKey();	
    } catch (e) {
      return utilError.errorMSG("Model","login", "jwtPrivateKey", "catch." + e);
    } 
  }

  static async setPasswordByRegistrationNo(body){
      console.log("login.model.login.setPasswordByRegistrationNo.body.", body);
    const returnObj = { message: "", data: {}};
    const query 	  =	{ _id: new ObjectId(body.registrationNo) }
    try {
      const projection 	= { _id:0, userID:1 }
      const result  = await mongodb.findOne(mongoCFG.Medalbank.users, query, projection);         // mongodb에서 가져온 userinfo를 newpassword로 update
      console.log("login.setPasswordByRegistrationNo.find.", result.data, "query=", query);
      if (!result.data.userID) return utilError.errorMSG("Model","users", "setPasswordByRegistrationNo", "userID 없음");
    } catch(e) {
      return utilError.errorMSG("Model","users", "setPasswordByRegistrationNo", "findOne.catch." + e);
    }
    	
    //-----> password
    const value = {};
    try {
      // Encrypt
      value.password = await utilJWT.encryptPassword(body.password);
    }
    catch (e) {
      return utilError.errorMSG("Model","users", "setPassword", "encryptPassword.catch." + e);
    }

    try {
      return await mongodb.updateOne(mongoCFG.Medalbank.users, query, value);
    } catch(e) {
      return utilError.errorMSG("Model","users", "setPassword", "update.catch." + e);
    }
  }

  static async resetPassword(body){
    const returnObj = { message: "", data: {}};
    const query 	  =	{ userID: Number(body.userID) }
    try {
      const projection 	= { _id:0, userID:1 }
      const result  = await mongodb.findOne(mongoCFG.Medalbank.users, query, projection);         // mongodb에서 가져온 userinfo를 newpassword로 update
      if (!result.data.userID) return utilError.errorMSG("Model","users", "resetPassword", "email없음");
    } catch(e) {
      return utilError.errorMSG("Model","users", "resetPassword", "findOne.catch." + e);
    }
    	
    //-----> password
    const value = {};
    try {
      // Encrypt
      value.password = await utilJWT.encryptPassword(body.password);
    }
    catch (e) {
      return utilError.errorMSG("Model","users", "resetPassword", "encryptPassword.catch." + e);
    }

    try {
      return await mongodb.updateOne(mongoCFG.Medalbank.users, query, value);
    } catch(e) {
      return utilError.errorMSG("Model","users", "resetPassword", "update.catch." + e);
    }
  }

  static async lostPasswordEmail(nickname){
    const returnObj = { message: "", data: {}};
    try {
      const query = { email: email.trim() };
      const projection = { _id:1, email: 1 }
      let result = await mongodb.findOne(mongoCFG.Medalbank.users, query, projection);
      console.log("lostPasswordEmail.result=", result);	
      if (Object.keys(result).length == 0 ) return utilError.errorMSG("Model","users", "lostPasswordEmail", "이메일 없음!!");
      if (newData.email != result.email) return utilError.errorMSG("Model","users", "lostPasswordEmail", "이메일 상이!!");
      return result;
    } catch (e) {
      return utilError.errorMSG("Model","users", "lostPasswordEmail", "findOne.catch." + e);
    } 

    // 나중에 처리
    let subject = "마스코 비밀번호 초기화"; // 문서24 계정 이메일 주소 인증
    let message = mongoCFG.mskServer + "/users/resetPassword?token=" + userInfo._id ;
    message = _EmailMessage.lostPasswordEmail.replace(/_lostPasswordEmail_/gi, message);
    let emailAddr = userInfo.email; //'ubifine@gmail.com' ; //req.email; 'ubifine@gmail.com', scmoonkr@naver.com jini1013@korea.com

    try {
      let result = await utilEmail.send(emailAddr, subject, message);
      res.status(200).send(result);
    }catch (e){
      console.log(e);
      res.status(503).send(e); 
    }
    
  }

  static async checkEmail(body){
    const returnObj = { message: "", data: {}};
    try {
      const query = { email: body.email.trim() };
      if (body.id) {
        body.id = body.id.toString();
        if (isNaN(body.id) || body.id.length > 7) { 
          query._id = new ObjectId(body.id);
        } else {
          query.userID = Number(body.id);
        }
      }
      console.log("checkEmail.body=", body, query);
      const projection = { _id:0, email:1, };
      //----------------------------------------------------------------
      const result = await mongodb.findOne(mongoCFG.Medalbank.users, query, projection);
      //----------------------------------------------------------------		if (result.data.email) {   // object null check ECMA 5+:
			if (result.data.email) {   // object null check ECMA 5+:
        returnObj.message = email + ".이메일 사용중!!";
      }
      return returnObj;	
    } catch (e) {
      return utilError.errorMSG("Model","users", "checkEmail", "findOne.catch." + e);
    } 
  }

  static async checkNickname(body){
    const returnObj = { message: "", data: {}};
    try {
      const query = { nickname: body.nickname.trim() };
      if (body.id) {
        body.id = body.id.toString();
        if (isNaN(body.id) || body.id.length > 7) { 
          query._id = new ObjectId(body.id);
        } else {
          query.userID = Number(body.id);
        }
      }
      console.log("checkNickname.body=", body, query);
      const projection = { _id:0, nickname:1, };
      //----------------------------------------------------------------
      const result = await mongodb.findOne(mongoCFG.Medalbank.users, query, projection);
      //----------------------------------------------------------------		if (result.data.email) {   // object null check ECMA 5+:
			if (result.data.nickname) {   // object null check ECMA 5+:
        returnObj.message = nickname + ".nickname 사용중!!";
      }
      return returnObj;	
    } catch (e) {
      return utilError.errorMSG("Model","users", "checkNickname", "findOne.catch." + e);
    } 
  }

  static async checkUserID(userID){
    const returnObj = { message: "", data: {}};
    try {
      const query = { userID: userID.trim() };
      const projection = { _id:0, userID:1, };
      //----------------------------------------------------------------
      const result = await mongodb.findOne(mongoCFG.Medalbank.users, query, projection);
      //----------------------------------------------------------------		if (result.data.email) {   // object null check ECMA 5+:
			if (result.data.userID) {   // object null check ECMA 5+:
        returnObj.message = nickname + ".userID 사용중!!";
      }
      return returnObj;	
    } catch (e) {
      return utilError.errorMSG("Model","users", "checkUserID", "findOne.catch." + e);
    } 
  }

  static async lostPasswordEmail(nickname){
    const returnObj = { message: "", data: {}};
    try {
      const query = { nickname: nickname.trim() };
      const projection = { _id:0, nickname:1, };
      //----------------------------------------------------------------
      const result = await mongodb.findOne(mongoCFG.Medalbank.users, query, projection);
      //----------------------------------------------------------------		if (result.data.email) {   // object null check ECMA 5+:
			if (result.data.nickname) {   // object null check ECMA 5+:
        returnObj.message = nickname + ".nickname 사용중!!";
      }
      return returnObj;	
    } catch (e) {
      return utilError.errorMSG("Model","users", "lostPasswordEmail", "findOne.catch." + e);
    } 
  }

  static async loginLostPassword(nickname){
    const returnObj = { message: "", data: {}};
    try {
      const query = { nickname: nickname.trim() };
      const projection = { _id:0, nickname:1, };
      //----------------------------------------------------------------
      const result = await mongodb.findOne(mongoCFG.Medalbank.users, query, projection);
      //----------------------------------------------------------------		if (result.data.email) {   // object null check ECMA 5+:
			if (result.data.nickname) {   // object null check ECMA 5+:
        returnObj.message = nickname + ".nickname 사용중!!";
      }
      return returnObj;	
    } catch (e) {
      return utilError.errorMSG("Model","users", "loginLostPassword", "findOne.catch." + e);
    } 
  }

  static async lostPasswordChange(nickname){
    const returnObj = { message: "", data: {}};
    try {
      const query = { nickname: nickname.trim() };
      const projection = { _id:0, nickname:1, };
      //----------------------------------------------------------------
      const result = await mongodb.findOne(mongoCFG.Medalbank.users, query, projection);
      //----------------------------------------------------------------		if (result.data.email) {   // object null check ECMA 5+:
			if (result.data.nickname) {   // object null check ECMA 5+:
        returnObj.message = nickname + ".nickname 사용중!!";
      }
      return returnObj;	
    } catch (e) {
      return utilError.errorMSG("Model","users", "lostPasswordChange", "findOne.catch." + e);
    } 
  }

}
module.exports = LoginModel;