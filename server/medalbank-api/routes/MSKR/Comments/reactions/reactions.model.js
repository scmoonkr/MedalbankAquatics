const extend 				= require('node.extend');
const mongoCFG 		  = require('../../Config/mongoCFG');
const mongoDB			  = require('../../Class/MongoDB');
const UtilDate      = require("../../Class/DateLibrary");
const utilError		  = require("../../Class/utilError");
const utilHTTP		  = require("../../Class/utilHTTP");
const CustomReaction= require("./reactions.custom");
const QueryReaction = require("./reactions.query");

const mongodb 	  = new mongoDB(mongoCFG.Medalbank.database);
const utilDate	  = new UtilDate();

const collectionName = mongoCFG.Medalbank.reactions;

class ReactionModel {
	static async create() {
		const indexes = [
			{ query: { dbType:1, dbID:1, userID:1 }, name: "pk", option: { unique: true }	},
		];
		await mongodb.createCollectionNindex(collectionName, indexes);
	}
  // update
  static async update(body) {
    // query
    const query = {
      userID: Number(body.userID), 
      dbType: body.dbType, 
      dbID  : Number(body.dbID), 
    };

    const fieldValue = Number(body.value ?? 1);
    const value = extend(true, { datetime: new Date() }, query);

    switch (body.field) {
      case "pizzas":
      case "ratings":
        value[body.field] = parseFloat(body.value);
        break;
      case "likes":
        value.likes = fieldValue == 0 ? 1 : 0;
        if (value.likes == 1) value.dislikes = 0;
        break;
      case "dislikes":
        value.dislikes = fieldValue == 0 ? 1 : 0;
        if (value.dislikes == 1) value.likes = 0;
        break;
      case "blinds":
      case "pins":
      case "followers":
      case "followedBys":
        value[body.field] = fieldValue == 0 ? 1 : 0;
        break;
      case "views":
        if (query.userID == 0) {
          let ip = "123.456.789.012";
          ip = await utilHTTP.getIPaddr();
          let ips = ip.split('.');
          query.userID = Number(ips[0])*1000000000+	Number(ips[1])*1000000 + Number(ips[2])*1000 + Number(ips[3]);
          value.userID = query.userID;
          // console.log("IPaddr----------?", ip, ips, value.userID);	
        }
        value[body.field] = 1;
        break;
      default:
        value[body.field] = fieldValue || 0;
        break;
    }

    
  console.log("reactions.update.query=", query, "value=", value);
    //----------------------------------------------------------------
    await mongodb.updateOne(collectionName, query, value);
    // const result = await mongodb.findOne(collectionName, query, { _id:0, } );
    // return CustomReaction.field(result.data);
    //----------------------------------------------------------------
    return { message: '', data: value };
  }

  // get reactions, myReactions
  // query: { dbType, dbID, userID}
  static async getReaction(dbType, dbID, userID) {
    const returnObj = { message: '', data: {} };
    //----------------------------------------------------------------
    // const aggregate = QueryReaction.reactionQuery(dbType, dbID, userID);
    const query = {};
    if (body.dbType) query.dbType = body.dbType.trim();
    const aggregate = [
      { $match: query },
      { $group: {
          _id: {
            dbType: "$dbType",
            dbID  : "$dbID"
          },
          views: { $sum: "$views" },
        }
      },
      { $project: {
          _id   : 0,
          dbType: "$_id.dbType",
          dbID  : "$_id.dbID",
          views : 1,
        }
      },
      { $sort: { views: -1, dbType: 1, dbID: 1 } },
    ];
    const result = await mongodb.aggregate(collectionName, aggregate );
    if (result.data.length == 0) return utilError.errorMSG("Model","reactions", "getReaction", "data not found");
    result.data = result.data[0];
    returnObj.data.reactions = CustomReaction.field(result.data.reactions);
    returnObj.data.myReactions = CustomReaction.field(result.data.myReactions);
    return returnObj;
    //----------------------------------------------------------------
  }
}

module.exports = ReactionModel;

