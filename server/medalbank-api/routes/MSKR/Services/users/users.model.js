const mskCFG 			= require('../../Config/mskCFG');
const mongoCFG 		= require('../../Config/mongoCFG');
const mongoDB			= require('../../Class/MongoDB');
const UtilDate    = require("../../Class/DateLibrary");
const utilLibrary = require("../../Util/utilLibrary");
const utilError		= require("../../Util/utilError");
const secret 			= require('../../Config/secret');
const utilJWT 		= require('../../Class/JWThashLibrary');
const historyLibrary = require("../library/history.library.js");

const Query       = require("./collections.query");
const Customizing = require("./users.custom");
const TimeLibrary = require('../../Class/TimeLibrary.js');
const TimeModel		= require('../times/times.model.js');
const { ObjectId } = require("mongodb");

const mongodb 		= new mongoDB(mongoCFG.Medalbank.database);
const utilDate	  = new UtilDate();

const PK = "userID";
const MAX_LIMIT = 100;

const _context = {
  query     : {},
  projection: { _id:0, },
  limit     : MAX_LIMIT,
  skip      : 0,
  sort      : { _id: -1, },
}

class UserModel {
  static async getStatistics(body) {
    const statics = {};
    statics.userInfo = 90.0;  // 회원정보
    statics.statics = 89.55; // 통계/완성도
    statics.disclosure = 76.31;  // 정보공개
    statics.competitions = 1122;  // 경기실적
    statics.times = 1133;  // 측정기록
    statics.workout = 1144;  // 워크아웃
    statics.lesson = 2211;  // 훈련/레슨
    statics.dining = 2222;  // 식사/회식
    statics.buying = 2233;  // 공동구매
    statics.player = 2244;  // 선수모집
    statics.opinion = 2255;  // 의견/종합
    statics.imageComp = 3311;  // 대회사진
    statics.imageUser = 3322;  // 본인사진
    statics.imageDressing = 3333;  // 착장사진
    statics.imageReport = 3344;  // 제보사진
    statics.swimmingCap = 4411;  // 수모
    statics.swimmingGlasses = 4422;  // 수경
    statics.swimmingSuit = 4433;  // 수영복
    statics.swimmingSupplies = 4444;  // 수영용품
    statics.comments = 5511;  // 게시글
    statics.replies = 5522;  // 댓글
    statics.point = 6611;  // 포인트

    return statics;
  }


  // update
  static async updateByRegistrationNo(body) {
    let result = { message: '', data: {}, };
    if (Object.keys(body).length < 2) return utilError.errorMSG("Model","users", "updateByRegistrationNo", "field not found");
    const value = Customizing.field(body);
    if (body.password) value.password = await utilJWT.encryptPassword(body.password)		// replaceOne에서 치환할 값
    value.updated = new Date();
    delete value.registrationNo;

		// let query = { registrationNo: body.registrationNo };	
		let query = { _id: new ObjectId(body.registrationNo) };	
    result = await mongodb.findOne(mongoCFG.Medalbank.users, query, { _id:0, });
    if (!result.data.userID) {
      await historyLibrary.saveHistory(
        "users", 
        "setUser", 
        "userID", 
        { message: "userID not found", ...body, }

      ); // db, cmd, id, body
      // await mongodb.updateOne("logs", {api: "setUser", userID: result.data.userID }, { api: "setUser", ...body, userID: result.data.userID, name: result.data.name, });
      console.log("userID not found");
      return { message: "userID not found", };
    }
    query = { userID: result.data.userID };	
    value.athleteID = result.data.userID;
    value.name = result.data.name;
    //-----------------------------------------
    // 임시 비번 확인용 저장
    //-----------------------------------------
    value.passwordORG = body.password;
    //-----------------------------------------
    value.ageGroupCode = mskCFG.getAgeGroupCode(result.data.dob);
    // console.log("update.users.value:", value, "query:", query);
		//----------------------------------------------------------------
		const res = await mongodb.updateOne(mongoCFG.Medalbank.users, query, value);

    const athlete = {
      athleteID : value.athleteID,
      name      : value.name,
      // nickname  : value.nickname ?? "",
      // email     : value.email,
      gender    : result.data.gender,
      dob       : result.data.dob,
      ageGroup  : value.ageGroupCode,
      joined    : value.updated,
    }
    query = { athleteID: value.athleteID };
    result = await mongodb.updateOne(mongoCFG.Medalbank.athletes, query, athlete);
		//----------------------------------------------------------------
    // console.log("updateByRegistrationNo.result=", result);
    // console.log("updateByRegistrationNo.query=", query);
    // //-----> event times가 import되었는지 확인
    // const checkTimes = await mongodb.findOne(mongoCFG.Medalbank.times,
    //   { athleteID: value.athleteID, type: 'event' },
    //   { _id:0, athleteID:1 },
    // );
    // if (checkTimes.data.athleteID) return { message: "", data: {}};
    //----------------------------------------------
    // athlete name과 같은 times 시간 추가
    //-----> import from times to times_medalbank
    //----------------------------------------------
    // console.log("++++++++++++++++ importTimes");
    const times = await TimeModel.importTimes({ name: value.name, athleteID: value.athleteID, gender: athlete.gender, ageGroupCode: value.ageGroupCode, dob: athlete.dob });
    console.log("++++++++++++++++ importTimes", times.length);

    //----------------------------------------------
    // bestTimes 계산
    //----------------------------------------------
    const bestEvent = new TimeLibrary().makeAthletesStatistics(times, 1);
    // 최근 pools, teams, competitions 추가
    // major styles 추가
    const qry = { athleteID: value.athleteID };
    const statistics = { athleteID: value.athleteID, bestEvent: bestEvent };
    // console.log("statistics:", statistics);
    const res1 = await mongodb.updateOne(mongoCFG.Medalbank.athletesStatistics, qry, statistics);

    // console.log("athletesStatisticsMB.update:", res1);
    //----------------------------------------------
    console.log("updateByRegistrationNo.value=", value);
    // console.log("updateByRegistrationNo.athlete=", athlete);
    await historyLibrary.saveHistory(
                          "users", 
                          "setUser", 
                          "athleteID", 
                          { ...value, times:times.length}
                        ); // db, cmd, id, body
  //----------------------------------------------

    return result;
  }

  //##################################################################
  //########################## confirm ###############################
  //##################################################################



  //============================================
  //  find
  //============================================
	static async list(query, body) {
		console.log(query, body);
		const context = {
			query			: query,
			projection: { _id:0, },
			limit			: body.limit ? Number(body.limit) : MAX_LIMIT,
			skip			: body.skip ? Number(body.skip) : 0,
			sort			: { name:1, },
		}
    //----------------------------------------------------------------
      const result = await mongodb.find(mongoCFG.Medalbank.users, context)
    //----------------------------------------------------------------
    result.data = result.data.map(data => Customizing.field(data));
    // result.data = result.data.reduce((arr, data) =>{
    //                     arr.push(Customizing.field(data));
    //                     return arr;
    //                   }, []);
    return result;
  }

	static async search(body) {
		console.log("users.model.search.body=", body);
    const query = {};
    if (body.name		) query.name = new RegExp("^" + body.name.trim(), "gi");
    const sort = {};
    switch (body.sort) {
      case "가입순":
        break;
      case "레벨순":
        break;
      case "게시글수":
        break;
      case "댓글수":
        break;
      case "받은댓글순":
        break;
      case "받은좋아요순":
        break;
      default:
        sort._id = -1;
        break;
    }
    const context = {
			query			: query,
			projection: { _id:0, },
			limit			: body.limit ? Number(body.limit) : MAX_LIMIT,
			skip			: body.skip ? Number(body.skip) : 0,
			sort			: sort,
		}
    //----------------------------------------------------------------
      const result = await mongodb.find(mongoCFG.Medalbank.users, context)
    //----------------------------------------------------------------
    result.data = result.data.map(data => Customizing.field(data));
    // result.data = result.data.reduce((arr, data) =>{
    //                     arr.push(Customizing.field(data));
    //                     return arr;
    //                   }, []);
    console.log("-----> result->", result.data.length);
    return result;
  }

  //============================================
  //  aggregate
  //============================================
  static async aggregate(userID, query={}) {
    let result = { message: '', data: {}, };
    
    const aggregate = Query.collectionsDetail(query, userID);
    //----------------------------------------------------------------
		result = await mongodb.aggregate(mongoCFG.Medalbank.users, aggregate)
    //----------------------------------------------------------------
    result.data = result.data.map(data => Customizing.field(data));
    return result;  
  }

  static async checkEmail(body){
		console.log("models.users.checkEmail.body", body);
    const result = { message: "", data: {}};
    try {
      const query = { email: body.email.trim(), _id: { $ne: new ObjectId(body.id) } };
      const projection = { _id:0, email:1, };
      //----------------------------------------------------------------
      const result = await mongodb.findOne(mongoCFG.Medalbank.users, query, projection);
      //----------------------------------------------------------------		if (result.data.email) {   // object null check ECMA 5+:
			if (result.data.email) {   // object null check ECMA 5+:
        result.message = email + ".이메일 사용중!!";
      }
      console.log("result:", result);
      return result;	
    } catch (e) {
      return utilError.errorMSG("Model","users", "checkEmail", "findOne.catch." + e);
    } 
  }

  static async checkNickname(body){
		console.log("models.users.checkNickname.body", body);
    const result = { message: "", data: {}};
    try {
      const query = { nickname: body.nickname.trim(), _id: { $ne: new ObjectId(body.id) } };
      const projection = { _id:0, nickname:1, };
      //----------------------------------------------------------------
      const result = await mongodb.findOne(mongoCFG.Medalbank.users, query, projection);
      //----------------------------------------------------------------		if (result.data.email) {   // object null check ECMA 5+:
			if (result.data.nickname) {   // object null check ECMA 5+:
        result.message = nickname + ".nickname 사용중!!";
      }
      console.log("result:", result);
      return result;	
    } catch (e) {
      return utilError.errorMSG("Model","users", "checkNickname", "findOne.catch." + e);
    } 
  }

  static async getByName(body){
    let result = { message: '', data: {}, };
    try {
      const query = { name: body.name.trim() };
      //----------------------------------------------------------------
      return this.list(query, body);
    } catch (e) {
      return utilError.errorMSG("Model","users", "getByName", "findOne.catch." + e);
    }
    return result;  
  }

  static async getByGender(body){
    let result = { message: '', data: {}, };
    try {
      const query = { gender: body.gender.trim() };
      //----------------------------------------------------------------
      return this.list(query, body);
    } catch (e) {
      return utilError.errorMSG("Model","users", "getByGender", "findOne.catch." + e);
    }
    return result;  
  }

  static async getByRegistNo(regist){
    let result = { message: '', data: {}, };
    try {
      const query = { registrationNo: regist.trim() };
      //----------------------------------------------------------------
      result = await mongodb.findOne(mongoCFG.Medalbank.users, query, { _id:0, });
      //----------------------------------------------------------------
      result.data = Customizing.field(result.data);
      return result;  
    } catch (e) {
      return utilError.errorMSG("Model","users", "getByRegistNo", "findOne.catch." + e);
    }
  }

  static async getByUserID(userID){
		console.log("new.services.users.getByUserID.userID.", userID);
    try {
      //----------------------------------------------------------------
      const match = {};
      if (userID.length > 10) {
        match.registrationNo = userID;
      } else {
        match.userID = Number(userID);
      }
      console.log("query=", match);

      const aggregate = [
        { $match : match },
        { $lookup: {
            from: mongoCFG.Medalbank.reactions,
            let: { "userID": "$userID" },
            pipeline: [
              { $match: {
                $expr: { $and: [
                      { $eq: ["$dbType", "user"] },
                      { $eq: ["$dbID", "$$userID"] }
                    ]
                  }
                }
              }
            ],
            as: "action"
          }
        },
        { $group: { 
            _id: { 
              dbType					: "$dbType",
              dbID						: "$dbID",
              users						: { $ifNull: [{ $avg: "$action.users" 	  }, 0] },
              showerLockerRoom: { $ifNull: [{ $avg: "$action.showerLockerRoom" 	  }, 0] },
              facility				: { $ifNull: [{ $avg: "$action.facility" 	  }, 0] },
              service					: { $ifNull: [{ $avg: "$action.service" 	  	}, 0] },
              accessibility		: { $ifNull: [{ $avg: "$action.accessibility" 	}, 0] },
              pizza						: { $ifNull: [{ $avg: "$action.pizza" 	  }, 0] },
              rating					: { $ifNull: [{ $avg: "$action.rating" 	  }, 0] },
              follow					: { $ifNull: [{ $sum: "$action.follow" 	  }, 0] },
              followedBy			: { $ifNull: [{ $sum: "$action.followedBy"}, 0] },
              like						: { $ifNull: [{ $sum: "$action.like" 	  	}, 0] },
              dislike					: { $ifNull: [{ $sum: "$action.dislike" 	}, 0] },
              blind						: { $ifNull: [{ $sum: "$action.blind" 	  }, 0] },
              share						: { $ifNull: [{ $sum: "$action.share" 	  }, 0] },
              pin							: { $ifNull: [{ $sum: "$action.pin" 	  	}, 0] },
              view						: { $ifNull: [{ $sum: "$action.view" 	  	}, 0] },
            }, 
            userID: { $first: '$userID' },
            athleteID: { $first: '$athleteID' },
            name: { $first: '$name' },
            nameEng: { $first: '$nameEng' },
            nickname: { $first: '$nickname' },
            password: { $first: '$password' },
            registrationNo: { $first: '$registrationNo' },
            nationalCode: { $first: '$nationalCode' },
            gender: { $first: '$gender' },
            dob: { $first: '$dob' },
            phone: { $first: '$phone' },
            instagram: { $first: '$instagram' },
            email: { $first: '$email' },
            avatar: { $first: '$avatar' },
            featuredImage: { $first: '$featuredImage' },
            sido: { $first: '$sido' },
            gugun: { $first: '$gugun' },
            authority: { $first: '$authority' },
            team: { $first: '$team' },
            teamID: { $first: '$teamID' },
            teams: { $first: '$teams' },
            poolID: { $first: '$poolID' },
            pool: { $first: '$pool' },
            isPublic: { $first: '$isPublic' },
            joined: { $first: '$joined' },
            note: { $first: '$note' },

          }
        },
        { $project: {
          userID:1,
          athleteID:1,
          name:1,
          nameEng:1,
          nickname:1,
          password:1,
          registrationNo:1,
          nationalCode:1,
          gender:1,
          dob:1,
          phone:1,
          instagram:1,
          email:1,
          avatar:1,
          featuredImage:1,
          sido:1,
          gugun:1,
          authority:1,
          team:1,
          teamID:1,
          pool:1,
          poolID:1,
          teams:1,
          isPublic:1,
          joined:1,
          note:1,
          reactions: "$_id", _id:0
        }},
        {
          $lookup: {
            from: mongoCFG.Medalbank.reactions,
            let: { "userID": "$userID" },
            pipeline: [
              { $match: {
                $expr: { $and: [
                      { $eq: ["$dbType", "user"] },
                      { $eq: ["$dbID", "$$userID"] },
                      { $eq: ["$userID", userID] }
                    ]
                  }
                }
              }
            ],
            as: "myReactions"
          }
        },
      ]
      const result = await mongodb.aggregate(mongoCFG.Medalbank.users, aggregate);
      result.data = Customizing.field(result.data[0]);
      // const query = { userID: Number(userID) };
      // result = await mongodb.findOne(mongoCFG.Medalbank.users, query, { _id:0, });
      // result.data = Customizing.field(result.data[0]);
      //----------------------------------------------------------------
      return result;  
    } catch (e) {
      return utilError.errorMSG("Model","users", "getByUserID", "findOne.catch." + e);
    }
  }

  static async getBriefByUserID(userID){
    let result = { message: '', data: {}, };
    try {
      const query = {};
      if (userID.length > 10) {
        query._id = new ObjectId(userID);
      } else {
        query.userID = Number(userID);
      }
      console.log("query=", query);
      //----------------------------------------------------------------
      result = await mongodb.findOne(mongoCFG.Medalbank.users, query, { _id:0, userID:1, gender:1, name:1, nickname:1, email:1, phone:1, });
      //----------------------------------------------------------------
      result.data = Customizing.field(result.data);
      
      const value = {};
      value.passwordORG = utilLibrary.getRandomInteger(1000, 9999).toString();
      value.password = await utilJWT.encryptPassword(value.passwordORG)	;
      result.data.password = value.passwordORG;

      query.userID = result.data.userID;
      // console.log("query=", query, "value: ", value);
      const res = await mongodb.updateOne(mongoCFG.Medalbank.users, query, value);
      // console.log("user.", result.data);
      return result;  
    } catch (e) {
      return utilError.errorMSG("Model","users", "getBriefByUserID", "findOne.catch." + e);
    }
  }

  // insert
  static async insert(body) {
    let result = { message: '', data: {}, };

    const value = Customizing.field(body);
		//----------------------------------------------------------------
    if (!value.userID) {
      value.userID = await mongodb.max(mongoCFG.Medalbank.users, PK);
    }
		//----------------------------------------------------------------
		value.created =  new Date();
	
		//-----> indexes
		// value.indexes = indexing(value);
		//----------------------------------------------------------------
		result = await mongodb.insertOne(mongoCFG.Medalbank.users, value);
		//----------------------------------------------------------------
		result.data.userID = value.userID;

    return result;
  }

  // update
  static async update(body) {
    let result = { message: '', data: {}, };
    if (Object.keys(body).length < 2) return utilError.errorMSG("Model","users", "update", "field not found");
    const value = Customizing.field(body);
    delete value.userID;
		value.updated =  new Date();

		const query = { userID: Number(body.userID) };
	
		//----------------------------------------------------------------
		result = await mongodb.updateOne(mongoCFG.Medalbank.users, query, value);
		//----------------------------------------------------------------

    return result;
  }

  // update
  static async updatePublic(body) {
    let result = { message: '', data: {}, };

		const query = { userID: Number(body.userID) };	
		//----------------------------------------------------------------
    const value = {};
    value[`isPublic.${body.field}`] = body.value;
		//----------------------------------------------------------------
		result = await mongodb.updateOneOp(mongoCFG.Medalbank.users, query, { $set: value });
		//----------------------------------------------------------------

    return result;
  }

  // update status to delete
  static async updateDelete(userID) {
		const value = {
      userID  : userID,
      status  : 'deleted',
      deleted : new Date(),
    }	
		//----------------------------------------------------------------
		//----------------------------------------------------------------

    return this.update(value);
  }

  // delete
  static async delete(userID) {
    let result = { message: '', data: {}, };
    try {
      const query = { userID: Number(userID) };
      //----------------------------------------------------------------
      result = await mongodb.deleteOne(mongoCFG.Medalbank.users, query);
      //----------------------------------------------------------------
    } catch (e) {
      return utilError.errorMSG("Model","users", "delete", "deleteOne.catch." + e);
    }
    return result;  
  }
  //============================================
  //  create
  //============================================
  static async create() {
		const indexes = [
			{ query: { userID:1 }, name: "userID", option: { unique: true }  },
			{ query: { name:1 }, name: "name"  },
		];
    await mongodb.createCollectionNindex(mongoCFG.Medalbank.users, indexes);
  }
}

module.exports = UserModel;
