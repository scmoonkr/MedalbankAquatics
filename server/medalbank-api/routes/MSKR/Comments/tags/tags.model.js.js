const extend 			= require('node.extend');
const mongoCFG 		= require('../../../Config/mongoCFG');
const mongoDB			= require('../../../Class/MongoDB');
const UtilDate    = require("../../../Class/DateLibrary");
const utilLibrary = require("../../../Util/utilLibrary");
const utilError		= require("../../../Util/utilError");

const mongodb 	  = new mongoDB(mongoCFG.Medalbank.database);
const utilDate	  = new UtilDate();

const PK = "tagID";
const MAX_LIMIT = 100;

const _context = {
  query     : {},
  projection: { _id:0, },
  limit     : MAX_LIMIT,
  skip      : 0,
  sort      : { _id:-1, },
}

class Model {
  static async create() {
		const indexes = [
			{ query: { tag:1, dbType:1, dbID:1 }, name: "tag_dbID", option: { unique: true }  },
			{ query: { tagNorm:1 }, name: "tagNorm",  },
			{ query: { userID:1 }, name: "userID",  },
		];
    await mongodb.createCollectionNindex(mongoCFG.Medalbank.tags, indexes);
  }

  // find tags
  static async list(body) {
    const query = {};
    console.log(query);
    if (body.tag    ) query.tagNorm = new RegExp(utilLibrary.normalizeString(body.tag), "gi");
    if (body.userID ) query.userID  = Number(body.userID);
    if (body.dbID   ) query.dbID    = Number(body.dbID);
    if (body.dbType ) query.dbType  = body.dbType.trim();

		const context ={
      query     : query,
      projection: { _id:0, },
      limit     : 1000,
      skip      : 0,
      sort      : { tag:1 },
    }
    //----------------------------------------------------------------
		return await mongodb.find(mongoCFG.Medalbank.tags, context)
    //----------------------------------------------------------------
  }  

  // insert
  static async insert(body) {
    let returnObj = { message: '', data: {}, };

    body.tags = typeof body.tags === "string" ? body.tags.split(',') : body.tags;
		//----------------------------------------------------------------
      const query = {
        tag     : tag,
        dbType  : body.dbType,
        dbID    : Number(body.dbID),
        userID  : Number(body.userID),
      }
    for (const tag of body.tags) {
      const norm = utilLibrary.normalizeString(tag);
      if (!norm) continue;
      query.tag = tag;
      const value = extend(true, query, { tagNorm: norm });
      returnObj = await mongodb.updateOne(mongoCFG.Medalbank.tags, query, value);
    }
		//----------------------------------------------------------------

    return returnObj;
  }

  // delete
  static async delete(body) {
    try {
      const query = {};
      if (body.userID ) query.userID  = Number(body.userID);
      if (body.dbID   ) query.dbID    = Number(body.dbID);
      if (body.dbType ) query.dbType  = body.dbType.trim();
    
      body.tags = [];
      if (body.tags   ) body.tags = typeof body.tags === "string" ? body.tags.split(',') : body.tags;
      if (body.tag    ) {
        body.tags.push(body.tag);
      }
      const tags = [];
      for (const tag of body.tags) {
        const norm = utilLibrary.normalizeString(tag);
        if (norm) tags.push(tag);
      }
      if (tags.length > 0) query.tags = tags;

      //----------------------------------------------------------------
      return await mongodb.deleteOne(mongoCFG.Medalbank.tags, query);
      //----------------------------------------------------------------
    } catch (e) {
      return utilError.errorMSG("TagModel","tags", "delete", "catch." + err);
    } 
  }
}

module.exports = Model;

