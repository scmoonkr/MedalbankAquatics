const extend      = require('node.extend');
const mongoCFG    = require('../../../Config/mongoCFG');
const mongoDB     = require('../../../Class/MongoDB');
const UtilDate    = require("../../../Class/DateLibrary");
const utilLibrary = require("../../../Util/utilLibrary");
const utilError   = require("../../../Util/utilError");

const Query       = require("./comments.query");
const Customizing = require("./comments.custom");

const mongodb     = new mongoDB(mongoCFG.Medalbank.database);
const utilDate    = new UtilDate();

const collectionName = mongoCFG.Medalbank.comments;
const PK = "commentID";
const MAX_LIMIT = 100;

const _context = {
  query     : {},
  projection: { _id:0, },
  limit     : MAX_LIMIT,
  skip      : 0,
  sort      : { _id:-1, },
}

class CommentModel {
  static async create() {
      const indexes = [
         { query: { timeID:1 }, name: "timeID", option: { unique: true }  },
         { query: { year:1, gender:1, category:1, style:1, course:1, distance:1, rank:1 }, name: "personalBest"  },
      ];
    await mongodb.createCollectionNindex(mongoCFG.Medalbank.comments, indexes);
  }

  // findOne comments
  static async detail(commentID) {
    const query = { commentID: Number(commentID) };
    //----------------------------------------------------------------
      const result = await mongodb.findOne(collectionName, query, {_id:0, })
    //----------------------------------------------------------------
    result.data = Customizing.field(result.data);
    return result;
  }

  // find comments
  static async list(query) {
    
    const context = {
      query     : query,
      projection: { _id:0, },
      limit     : MAX_LIMIT,
      skip      : 0,
      sort      : { _id:-1, },
    }
    //----------------------------------------------------------------
      const result = await mongodb.find(collectionName, context)
    //----------------------------------------------------------------
    result.data = result.data.map(data => Customizing.field(data));
    return result;
  }

  /*
$graphLookup 는
동일한 컬렉션(from: "comments")의 문서에서
한 문서의 commentID가 다른 문서의 parentID인 경우를
재귀적으로 매칭하여,
댓글과 그 자식 댓글들의 계층 구조를 구축합니다.

db.getCollection('socialMedias').aggregate([
  { $match: { commentID: 1 } },
  { $graphLookup: {
    from: 'socialMedias', 
    startWith: '$commentID', 
    connectFromField: 'commentID', 
    connectToField: 'parentID', 
    as: 'replies'
    }
  }
])
  */
  static async getReplies(commentID){
    commentID = Number(commentID);
    const aggregate = [
      { $match: { commentID: commentID } },
      { $graphLookup: {
          from            : mongoCFG.Medalbank.socialMedias,
          startWith       : "$commentID",
          connectFromField: "commentID",
          connectToField  : "parentID",
          as: "replies"
        }
      }
    ];
    //----------------------------------
      const result = await mongodb.aggregate(mongoCFG.Medalbank.socialMedias, aggregate);
    //----------------------------------
    result.data = Customizing.field(result.data[0]);
    return result;
  }
  
  // 부모 ID를 기준으로 댓글을 분류하는 함수
  static organizeComments(comments) {
    let commentsMap = {};
  
    // 댓글을 ID를 키로 하여 맵에 저장
    comments.forEach(comment => {
      commentsMap[comment.commentID] = comment;
      comment.replies = [];
    });
  
    // 각 댓글에 대해 부모 댓글의 replies 배열에 추가
    comments.forEach(comment => {
      if (comment.commentID != comment.parentID && commentsMap[comment.parentID]) {
        commentsMap[comment.parentID].replies.push(comment);
      }
    });
  
    // 재귀적으로 깊이 설정
    function setDepth(comment, depth) {
      comment.depth = depth;
      comment.replies.forEach(reply => setDepth(reply, depth + 1));
    }
  
    // 최상위 댓글에 대해 깊이 설정
    comments.filter(comment => comment.commentID == comment.parentID)
            .forEach(comment => setDepth(comment, 0));
  
    // 최상위 댓글만 반환
    return comments.filter(comment => comment.commentID == comment.parentID);
  }

  
  static flattenComments(comments) {
    let commentsArr = [];
  
    function extractComments(comments) {
      comments.forEach(comment => {
        const { replies, ...commentWithoutReplies } = comment; // Destructure to exclude the replies property
        commentsArr.push(commentWithoutReplies);
        if (comment.replies && comment.replies.length) {
          extractComments(comment.replies); // Recursively extract replies
        }
      });
    }
  
    extractComments(comments);
    return commentsArr;
  }

  static async getViewByCommentID(body){
    console.log("++++++++++++++++++++++++++ getViewByCommentID");
    let returnObj = { message: '', data: {}, };
    
    //----------------------------------------------------------------
    body.dbType = "comment";
    body.dbID = Number(body.commentID);
    const query = { commentID: body.dbID };
      const result = await mongodb.findOne(collectionName, query, {_id:0, })

    const aggregate = Query.detailBySocialMediaID(body);
      returnObj = await mongodb.aggregate(collectionName, aggregate)
    // console.log(returnObj.data);
    //----------------------------------------------------------------
    returnObj.data = this.organizeComments(returnObj.data); //.map(data => Customizing.field(data));
    // returnObj.data = returnObj.data.map(data => Customizing.field(data));

    return returnObj;  
  }

  static async getViewByCommentIDold(body){
    let returnObj = { message: '', data: {}, };
    
    //----------------------------------------------------------------
    const query = { commentID: Number(body.commentID) };
      const result = await mongodb.findOne(collectionName, query, {_id:0, dbType:1, })
    body.dbType = esult.data.dbType;

    const aggregate = Query.detailByCommentID(query, body);
      returnObj = await mongodb.aggregate(collectionName, aggregate)
    //----------------------------------------------------------------
    returnObj.data = returnObj.data.map(data => Customizing.field(data));
    
    return returnObj;  
  }

  static async getViewByTypeID(body){
    let returnObj = { message: '', data: {}, };
    
    //----------------------------------------------------------------
    const aggregate = Query.detail(body);
      returnObj = await mongodb.aggregate(collectionName, aggregate)
    //----------------------------------------------------------------
    const comments = returnObj.data.map(data => Customizing.field(data));
    returnObj.data = this.organizeComments(comments);

    return returnObj;  
  }
  // static async getViewByTypeIDold(body){
  //   let returnObj = { message: '', data: {}, };
    
  //   //----------------------------------------------------------------
  //   const aggregate = Query.detail(body);
  //     returnObj = await mongodb.aggregate(collectionName, aggregate)
  //   //----------------------------------------------------------------
  //   returnObj.data = returnObj.data.map(data => Customizing.field(data));
    
  //   return returnObj;  
  // }

  static async getDbType(body) {
    let returnObj = { message: '', data: {}, };
    
    const query = { dbType: body.dbType, dbID: Number(body.dbID) };
    //----------------------------------------------------------------
    const aggregate = Query.list(body.dbType, query, body.userID);
      returnObj = await mongodb.aggregate(collectionName, aggregate)
    //----------------------------------------------------------------
    returnObj.data = returnObj.data.map(data => Customizing.field(data));

    return returnObj;  
  }
  static async getByTitle(body) {
    let returnObj = { message: '', data: {}, };
    
    const query = { title: new RegExp(body.title.trim(), "gi") };
    //----------------------------------------------------------------
    const aggregate = Query.list(body.dbType, query, body.userID);
      returnObj = await mongodb.aggregate(collectionName, aggregate)
    //----------------------------------------------------------------
    returnObj.data = returnObj.data.map(data => Customizing.field(data));

    return returnObj;  
  }
  static async getByCategory(body) {
    let returnObj = { message: '', data: {}, };
    
    const query = { category: body.category.trim() };
    //----------------------------------------------------------------
    const aggregate = Query.list(body.dbType, query, body.userID);
      returnObj = await mongodb.aggregate(collectionName, aggregate)
    //----------------------------------------------------------------
    returnObj.data = returnObj.data.map(data => Customizing.field(data));

    return returnObj;  
  }
  static async getByTag(body) {
    let returnObj = { message: '', data: {}, };
    
    const query = { tag: body.tag.trim() };
    //----------------------------------------------------------------
    const aggregate = Query.list(body.dbType, query, body.userID);
      returnObj = await mongodb.aggregate(collectionName, aggregate)
    //----------------------------------------------------------------
    returnObj.data = returnObj.data.map(data => Customizing.field(data));

    return returnObj;  
  }
  static async getByNickname(body) {
    let returnObj = { message: '', data: {}, };
    
    const query = { nickname: body.nickname.trim() };
    //----------------------------------------------------------------
    const aggregate = Query.list(body.dbType, query, body.userID);
      returnObj = await mongodb.aggregate(collectionName, aggregate)
    //----------------------------------------------------------------
    returnObj.data = returnObj.data.map(data => Customizing.field(data));

    return returnObj;  
  }
  static async getByUserID(body) {
    let returnObj = { message: '', data: {}, };
    const userID = body.userID;
    
    const query = { userID: userID };
    //----------------------------------------------------------------
    const aggregate = Query.list(body.dbType, query, userID);
      returnObj = await mongodb.aggregate(collectionName, aggregate)
    //----------------------------------------------------------------
    returnObj.data = returnObj.data.map(data => Customizing.field(data));

    return returnObj;  
  }
  static async getByDatetime(body) {
    let returnObj = { message: '', data: {}, };
    
    const query = { datetime: new Date(body.datetime.trim()) };
    //----------------------------------------------------------------
    const aggregate = Query.list(body.DbType, query, body.userID);
      returnObj = await mongodb.aggregate(collectionName, aggregate)
    //----------------------------------------------------------------
    returnObj.data = returnObj.data.map(data => Customizing.field(data));

    return returnObj;  
  }

  // insert
  static async insert(body) {
    let returnObj = { message: '', data: {}, };
    const value = Customizing.field(body);
      //----------------------------------------------------------------
    if (!body.commentID) {
      value.commentID = await mongodb.max(collectionName, PK);
    }
    value.parentID = body.parentID ? Number(body.parentID) : value.commentID;
    value.rootCID = body.rootCID ? Number(body.rootCID) : value.commentID;
      //----------------------------------------------------------------
      value.created =  new Date();
  //  console.log("comments.insert.value=", value);
      //-----> indexes
      // value.indexes = indexing(value);
      //----------------------------------------------------------------
      returnObj = await mongodb.insertOne(collectionName, value);
      //----------------------------------------------------------------
      returnObj.data.commentID = value.commentID;

    return returnObj;
  }

  // insert
  static async insertOLD(body) {
    let returnObj = { message: '', data: {}, };
    const value = Customizing.field(body);
      //----------------------------------------------------------------
    if (!body.commentID) {
      value.commentID = await mongodb.max(collectionName, PK);
    }
    value.parentID = body.parentID ? Number(body.parentID) : value.commentID;
    value.rootCID = body.rootCID ? Number(body.rootCID) : value.commentID;
      //----------------------------------------------------------------
      value.created =  new Date();
      //----------------------------------------------------------------
      returnObj = await mongodb.insertOne(collectionName, value);
      //----------------------------------------------------------------
      returnObj.data.commentID = value.commentID;

    return returnObj;
  }

  // update
  static async update(body) {
    let returnObj = { message: '', data: {}, };
    if (Object.keys(body).length < 2) return utilError.errorMSG("Model","comments", "update", "field not found");
    const value = Customizing.field(body);
    const query = { commentID: value.commentID };

    delete value.commentID;
      value.updated =  new Date();
   
      //----------------------------------------------------------------
      returnObj = await mongodb.updateOne(collectionName, query, value);
      //----------------------------------------------------------------
      returnObj.data.commentID = value.commentID;


    return returnObj;
  }

  // update status to delete
  static async updateDelete(commentID) {
    const query = { commentID: value.commentID };
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
  static async delete(commentID) {
    let returnObj = { message: '', data: {}, };
    try {
      const query = { commentID: Number(commentID) };
      //----------------------------------------------------------------
      returnObj = await mongodb.deleteOne(collectionName, query);
      //----------------------------------------------------------------
    } catch (e) {
      return utilError.errorMSG("Model","comments", "delete", "catch." + err);
    }
    return returnObj;  
  }
}

module.exports = CommentModel;
