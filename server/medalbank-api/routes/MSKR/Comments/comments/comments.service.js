const CommentModel= require("./comments.model");
const utilError		= require("../../../Util/utilError");

const max_limit = 2;
class CommentServices {

	static async create() {
		//-----------------------------------------
		return await CommentModel.create();
		//-----------------------------------------
	}

  // view: commentID or (dbType, dbID)
  //  comments, reactions, myReactions, replyCount, replies [ reply, reactions, myReactions ]
	static async view(body) {
		try{
      if (!body.sort) body.sort = { commentID: -1 };
      if (!body.skip) body.skip = 0;
      if (!body.limit) body.limit = max_limit;
			if (body.commentID && ! isNaN(body.commentID)	) return await CommentModel.getViewByCommentID(body);

      if (! body.dbID || isNaN(body.dbID)) return utilError.errorMSG("Service","comments", "summary", "dbID not number");
      if (! body.dbType) return utilError.errorMSG("Service","comments", "summary", "dbType not found");

			//-----------------------------------------
			return await CommentModel.getViewByTypeID(body);
			//-----------------------------------------
		} catch(err) {
			return utilError.errorMSG("Service","comments", "summary", "catch." + err.message);
		}
	}

	static async viewList(body) {
		try{
			     if (body.dbType && body.dbID) return await CommentModel.getDbType(body);
			else if (body.title		  ) return await CommentModel.getByTitle 	  (body);
			else if (body.category	) return await CommentModel.getByCategory (body);
			else if (body.tag			  ) return await CommentModel.getByTag      (body);
			else if (body.nickname	) return await CommentModel.getByNickname (body);
			else if (body.datetime	) return await CommentModel.getByDatetime (body);
			else if (body.userID		) return await CommentModel.getByUserID	  (body);

			return await CommentModel.getDbType(body);
		} catch(err) {
			return utilError.errorMSG("Service","comments", "list", "catch." + err.message);
		}
	}

	static async list(body) {
		try{
           if (body.dbType && body.dbID) return await CommentModel.list({ dbType: body.dbType, dbID: Number(body.dbID) });
			else if (body.title		  ) return await CommentModel.list({ title: new RegExp(body.title.trim(), "gi") });
			else if (body.category	) return await CommentModel.list({ category: body.category.trim() });
			else if (body.tag			  ) return await CommentModel.list({ tag: body.tag.trim() });
			else if (body.nickname	) return await CommentModel.list({ nickname: body.nickname.trim() });
			else if (body.datetime	) return await CommentModel.list({ datetime: new Date(body.datetime.trim()) });
			else if (body.userID		) return await CommentModel.list({ userID: Number(body.userID) });
			//-----------------------------------------
			return utilError.errorMSG("Service","comments", "list", "body error." + JSON.stringify(body));
			//-----------------------------------------			return result;
		} catch(err) {
			return utilError.errorMSG("Service","comments", "detail", "catch." + err.message);
		}
	}

	static async detail(body) {
		try{
			if (!body.commentID				) return utilError.errorMSG("Service","comments", "detail", "commentID not found");
			if (isNaN(body.commentID)	) return utilError.errorMSG("Service","comments", "detail", "commentID not numbers");
			//-----------------------------------------
			return await CommentModel.detail(body.commentID);
			//-----------------------------------------			return result;
		} catch(err) {
			return utilError.errorMSG("Service","comments", "detail", "catch." + err.message);
		}
	}

	static async insert(body) {
		try{
			if (!body.userID				) return utilError.errorMSG("Service","comments", "insert", "userID not found");
			if (isNaN(body.userID)	) return utilError.errorMSG("Service","comments", "insert", "userID not numbers");
			if (!body.nickname			) return utilError.errorMSG("Service","comments", "insert", "nickname not found");
			//-----------------------------------------
			await CommentModel.insert(body);
			//-----------------------------------------
      // const viewBody = { dbID: body.dbID, userID: body.userID };
			const result = await CommentModel.getViewByTypeID(body);
      console.log("1++++++++++++++++++", result.data);
      // console.log("2++++++++++++++++++", result.data);
      // console.log("3++++++++++++++++++", result.data[0].replies);
      // console.log("4++++++++++++++++++", result.data[0].replies[0]);
      return result;
		} catch(err) {
			return utilError.errorMSG("Service","comments", "insert", "catch." + err.message);
		}
	}

	static async insertOLD(body) {
		try{
			//-----------------------------------------
			return await CommentModel.insertOLD(body);
			//-----------------------------------------
		} catch(err) {
			return utilError.errorMSG("Service","comments", "insertOLD", "catch." + err.message);
		}
	}

	static async update(body) {
		try{
			if (!body.commentID				) return utilError.errorMSG("Service","comments", "update", "commentID not found");
			if (isNaN(body.commentID)	) return utilError.errorMSG("Service","comments", "update", "commentID not numbers");
			//-----------------------------------------
			return await CommentModel.update(body);
			//-----------------------------------------
		} catch(err) {
			return utilError.errorMSG("Service","comments", "update", "catch." + err.message);
		}
	}

	static async updateDelete(body) {
		try{
			if (!body.commentID				) return utilError.errorMSG("Service","comments", "update", "commentID not found");
			if (isNaN(body.commentID)	) return utilError.errorMSG("Service","comments", "update", "commentID not numbers");
			//-----------------------------------------
			return await CommentModel.updateDelete(body);
			//-----------------------------------------
		} catch(err) {
			return utilError.errorMSG("Service","comments", "update", "catch." + err.message);
		}
	}

	static async delete(body) {
		try{
			if (!body.commentID				) return utilError.errorMSG("Service","comments", "delete", "commentID not found");
			if (isNaN(body.commentID)	) return utilError.errorMSG("Service","comments", "delete", "commentID not numbers");
			//-----------------------------------------
			return await CommentModel.delete(body.commentID);
			//-----------------------------------------
		}catch(err){
			return utilError.errorMSG("Service","comments", "delete", "catch." + err.message);
		}
	}
}

module.exports = CommentServices;