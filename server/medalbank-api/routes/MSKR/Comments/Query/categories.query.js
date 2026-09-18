const mongoCFG 		= require('../Config/mongoCFG');
const mongoDB			= require('../Class/MongoDB');
const UtilDate    = require("../Class/DateLibrary");
const utilLibrary = require("../Util/utilLibrary");

const Query       = require("./Query/collections.query");
const Customizing = require("./Customizing/posts.custom");
const errorHandler= require('errorhandler');

const mongodb 	  = new mongoDB(mongoCFG.Medalbank.database);
const utilDate	  = new UtilDate();

const collectionName = mongoCFG.Medalbank.posts;
const PK = "postID";
const MAX_LIMIT = 100;

const _context = {
  query     : {},
  projection: { _id:0, },
  limit     : MAX_LIMIT,
  skip      : 0,
  sort      : { _id: -1, },
}

class PostModel {
  //============================================
  //  create
  //============================================
  static async createPost(indexes) {
    let returnObj = { message: "", };
  
    try {
      let result = await mongodb.find(collectionName, { query:{}, projection: { _id:1 }, limit: 1 });
      if (result.data.length == 0) {
        returnObj = await mongodb.createCollection(collectionName);
      }
      returnObj = await mongodb.dropIndexes(collectionName);
  
      for (let no=0; no<indexes.length; no++) {
        returnObj = await mongodb.createIndex(collectionName, indexes[no].query, indexes[no].option);
      }
  
    } catch (err) {
      returnObj.message = "posts.create.catch." + err.message;
      console.log(returnObj.message);
    }
    return returnObj;  
  }

  //============================================
  //  find
  //============================================
  static async find(context = _context) {
    let returnObj = { message: '', data: {}, };
    //----------------------------------------------------------------
		returnObj = await mongodb.find(collectionName, context)
    //----------------------------------------------------------------
    returnObj.data = returnObj.data.map(data => Customizing.field(data));
    return returnObj;  
  }

  //============================================
  //  aggregate
  //============================================
  static async aggregate(userID, query={}) {
    let returnObj = { message: '', data: {}, };
    
    const aggregate = Query.collectionsDetail(query, userID);
    //----------------------------------------------------------------
		returnObj = await mongodb.aggregate(collectionName, aggregate)
    //----------------------------------------------------------------
    returnObj.data = returnObj.data.map(data => Customizing.field(data));
    return returnObj;  
  }

  //============================================
  //  get category groupping - body: { postID, categories: 'board,issue,...}
  //============================================
  static async getPostGroupping(query, userID){
    let returnObj = { message: '', data: {}, };
    
    const aggregate = Query.collectionsList(query, userID);
    //----------------------------------------------------------------
		returnObj = await mongodb.aggregate(collectionName, aggregate)
    //----------------------------------------------------------------
    returnObj.data = returnObj.data.map(data => Customizing.field(data));
    return returnObj;  
  }

  static async getPostViewByID(userID, postID) {
    let returnObj = { message: '', data: {}, };
    
    const query = { postID: Number(postID) };
    const aggregate = Query.collectionsDetail(query, userID);
    // console.log(JSON.stringify(aggregate));
    //----------------------------------------------------------------
		const result = await mongodb.aggregate(collectionName, aggregate)
    //----------------------------------------------------------------
    result.data = result.data.map(data => Customizing.field(data));
    returnObj.data = result.data[0];

    //----------------------------------------------------------------
    //----------------------------------------------------------------
    //  get comments by dbType: "post", dbID: postID
		// const result = await mongodb.aggregate(collectionName, aggregate)
    //----------------------------------------------------------------
    
    return returnObj;  
  }

  static async getPostByID(postID){
    let returnObj = { message: '', data: {}, };
    try {
      const query = { postID: Number(postID) };
      //----------------------------------------------------------------
      returnObj = await mongodb.findOne(collectionName, query, { _id:0, });
      //----------------------------------------------------------------
      returnObj.data = Customizing.field(returnObj.data);
      console.log("2>", returnObj.data);
    } catch (e) {
      returnObj.message = "posts.find.catch." + e.message;
    }
    return returnObj;  
  }

  static async getPostBestIDs(limit=5) {
    let returnObj = { message: '', data: {}, };
    const context = {
      query     : { best: true },
      projection: { _id:0, postID:1, },
      limit     : limit,
      skip      : 0,
      sort      : { created: -1, },
    };
    
		return await this.find(context);  
  }

  static async getPostIssues(limit=5) {
    let returnObj = { message: '', data: {}, };
    const context = {
      query     : { issue: true },
      projection: { _id:0, },
      limit     : limit,
      skip      : 0,
      sort      : { created: -1, },
    };
    
    return await this.find(context);  
  }

  static async getPostBests(limit=5) {
    let returnObj = { message: '', data: {}, };
    const context = {
      query     : { best: true },
      projection: { _id:0, },
      limit     : limit,
      skip      : 0,
      sort      : { created: -1, },
    };
    
		return await this.find(context);  
  }

  static async getPostIssueIDs(limit=5) {
    let returnObj = { message: '', data: {}, };
    const context = {
      query     : { issue: true },
      projection: { _id:0, postID:1, },
      limit     : limit,
      skip      : 0,
      sort      : { created: -1, },
    };
    
    return await this.find(context);  
  }

  static async getPostGrouppingIDs(categories, limit=5) {
    let returnObj = { message: '', data: {}, };
    const aggregate = [
      { $match: { category: { $in: categories } } },
			{ $sort: { category:1, datetime:-1 }
			},
			{ $group: {
					_id: "$category",
					rows: { $push: "$$ROOT" }
				}
			},
			{ $project: {
					_id: 0,
					category: "$_id",
					rows: { $slice: ["$rows", limit] }
				}
			},
			{ $unwind: "$rows" },
			{ $replaceRoot: { newRoot: "$rows" } },
      { $project: { _id:0, postID:1 } }
		]
    
		return await mongodb.aggregate(collectionName, aggregate)
  }

  static async getPostList(dbType, userID, match={}) {
    let returnObj = { message: '', data: {}, };
    
    //----------------------------------------------------------------
		returnObj = await this.getPostGroupping( userID, match)
    //----------------------------------------------------------------
    return returnObj;  
  }

  static async getPostByTitle(title, userID) {
    let returnObj = { message: '', data: {}, };
    
    const match = { title: new RegExp(title.trim(), "gi") };
    //----------------------------------------------------------------
		returnObj = await this.getPostGroupping( userID, match)
    //----------------------------------------------------------------
    return returnObj;  
  }
  static async getPostByCategory(category, userID) {
    let returnObj = { message: '', data: {}, };
    
    const match = { category: category.trim() };
    //----------------------------------------------------------------
		returnObj = await this.getPostGroupping( userID, match)
    //----------------------------------------------------------------
    return returnObj;  
  }
  static async getPostByTags(tag, userID) {
    let returnObj = { message: '', data: {}, };
    
    const tags = Array.isArray(tag) ? tag : tag.split(',').map(tag=>tag.trim());
    const query = { tag: { $in: tags } };
    //----------------------------------------------------------------
		returnObj = await this.getPostGroupping( userID, query)
    //----------------------------------------------------------------
    return returnObj;  
  }
  static async getPostByName(name, userID) {
    let returnObj = { message: '', data: {}, };
    
    const query = { name: name.trim() };
    //----------------------------------------------------------------
		returnObj = await this.getPostGroupping( userID, query)
    //----------------------------------------------------------------
    return returnObj;  
  }
  static async getPostByNickname(nickname, userID) {
    let returnObj = { message: '', data: {}, };
    
    const query = { nickname: nickname.trim() };
    //----------------------------------------------------------------
		returnObj = await this.getPostGroupping( userID, query)
    //----------------------------------------------------------------
    return returnObj;  
  }
  static async getPostByUserID(userID) {
    let returnObj = { message: '', data: {}, };
    
    const match = { userID: Number(userID.trim()) };
    //----------------------------------------------------------------
		returnObj = await this.getGroupping( userID, match)
    //----------------------------------------------------------------
    return returnObj;  
  }
  static async getPostByDatetime(datetime, userID) {
    let returnObj = { message: '', data: {}, };
    
    const match = { datetime: new Date(datetime.trim()) };
    //----------------------------------------------------------------
		returnObj = await this.getGroupping( userID, match)
    //----------------------------------------------------------------
    return returnObj;  
  }

  // insert
  static async insertPost(body) {
    let returnObj = { message: '', data: {}, };

    const value = Customizing.field(body);
		//----------------------------------------------------------------
    if (!value.postID) {
      value.postID = await mongodb.max(collectionName, PK);
    }
		//----------------------------------------------------------------
		value.created =  new Date();
	
		//-----> indexes
		// value.indexes = indexing(value);
		//----------------------------------------------------------------
		returnObj = await mongodb.insertOne(collectionName, value);
		//----------------------------------------------------------------
		returnObj.data.postID = value.postID;

    return returnObj;
  }

  // update
  static async updatePost(body) {
    let returnObj = { message: '', data: {}, };
    if (Object.keys(body).length < 2) {
      returnObj.message = "posts.model.update.field not found...";
      return returnObj;
    }
    const value = Customizing.field(body);
    const query = { postID: value.postID };

    delete value.postID;
		value.updated =  new Date();
	
		//----------------------------------------------------------------
		returnObj = await mongodb.updateOne(collectionName, query, value);
		//----------------------------------------------------------------

    return returnObj;
  }

  // update status to delete
  static async updateDeletePost(postID) {
    const query = { postID: value.postID };
		const value = {
      status  : 'deleted',
      deleted : new Date(),
    }
	
		//----------------------------------------------------------------
		returnObj = await mongodb.updateOne(collectionName, query, value);
		//----------------------------------------------------------------

    return returnObj;
  }

  // delete
  static async deletePost(postID) {
    let returnObj = { message: '', data: {}, };
    try {
      const query = { postID: Number(postID) };
      //----------------------------------------------------------------
      returnObj = await mongodb.deleteOne(collectionName, query);
      //----------------------------------------------------------------
    } catch (e) {
      returnObj.message = "posts.delete.catch." + e.message;
    }
    return returnObj;  
  }
}

module.exports = PostModel;
