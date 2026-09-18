const _    				= require('lodash');
const extend 			= require('node.extend');
const mongoCFG 		= require('../../Config/mongoCFG.js');
const mongoDB			= require('../../Class/MongoDB.js');
const UtilDate		= require("../../Class/DateLibrary.js");
const utilLibrary = require("../../Class/utilLibrary.js");
const utilError		= require("../../Class/utilError.js");
// const utilDatabase= require('../utilDatabase');
const imageLibrary= require("../library/images.library.js");
const TimeLibrary = require('../../Class/TimeLibrary.js');
const utilImgBB = require('../../Class/utilImgBB.js');


const Customizing = require("./youtube.custom.js");

const mongodb 		= new mongoDB(mongoCFG.Breaststroke.database);
const utilDate		= new UtilDate();

const PK = "youtubeID";
const MAX_LIMIT = 100;

const _context = {
	query		 	: {},
	projection: { _id:0, },
	limit		 	: MAX_LIMIT,
	skip			: 0,
	sort			: { _id:-1 },
}

class YoutubeModel {
	static async create() {
		const indexes = [
			{ query: { youtubeID:1 }, name: "youtubeID", option: { unique: true }	},
			{ query: { "youtubes.category":1 }, name: "category"	},
		];
		await mongodb.createCollectionNindex(mongoCFG.Breaststroke.youtube, indexes);
	}

	// view
	static async detail(body) {
		console.log("model.youtubes.detail.body=", body);
		//----------------------------------------------------------------
		const query = { youtubeID: Number(body.youtubeID) };
		const returnObj = await mongodb.findOne(mongoCFG.Breaststroke.youtube, query, { _id:0 });
		if (returnObj.data.length == 0) return { message: "no data", data: {} }

		returnObj.data = Customizing.field(returnObj.data);
		console.log("youtubes.detail.returnObj=", returnObj.data);
		//----------------------------------------------------------------

		return returnObj;
	}

  //####################################################################
  //######### Confirm ##################################################
  //####################################################################


	// find youtubes
	static async list(query, body) {
		const limit = body.limit ? Number(body.limit) : MAX_LIMIT;
		let skip = (Number(body.page??1)-1)	* limit;
		skip = skip < 0 ? 0 : skip;
		// query.competitionCount = { $gt: 0}
		const context = {
			query			: query,
			projection: { _id:0, },
			limit			: limit,
			skip			: skip,
			sort			: { gender:1, discipline:1, distance:1, time: 1, datetime: -1 },
		}
		//----------------------------------------------------------------
		const result = await mongodb.find(mongoCFG.Breaststroke.youtube, context)
		console.log(query, "youtube.list.", result.data.slice(0,2));
		//----------------------------------------------------------------
		result.data = result.data.map(data => Customizing.field(data));
		console.log(query, "youtube.list.", result.data.slice(0,2));
		
		const datetime = await mongodb.distinct(mongoCFG.Breaststroke.youtube, "datetime")
		console.log("datetime=", datetime, datetime.data.map(el => el.slice(0, 7)));
		result.months = [ ...new Set(datetime.data.map(el => el.slice(0, 7)))].sort((a,b) => b-a);
		console.log("months=", result.months);
		return result;
	}
	// insert
	static async insert(body) {
		const value = Customizing.field(body);
		value.youtubeID = await mongodb.max(mongoCFG.Breaststroke.youtube, "youtubeID", {});
	console.log("youtubes.insert.value=", value);
		//----------------------------------------------------------------
		return await mongodb.insertOne(mongoCFG.Breaststroke.youtube, value);
		//----------------------------------------------------------------
	}

	// update
	static async update(body) {
		if (Object.keys(body).length < 2) return utilError.errorMSG("Model","youtubes", "update", "field not found");
		const value = Customizing.field(body);
		const query = { youtubeID: value.youtubeID };

		delete value.youtubeID;
	
		//----------------------------------------------------------------
		return await mongodb.updateOne(mongoCFG.Breaststroke.youtube, query, value);
		//----------------------------------------------------------------
	}

	// delete
	static async delete(youtubeID) {
		try {
			const query = { youtubeID: Number(youtubeID) };
			//----------------------------------------------------------------
			return await mongodb.deleteOne(mongoCFG.Breaststroke.youtube, query);
			//----------------------------------------------------------------
		} catch (e) {
			return utilError.errorMSG("Model","youtubes", "delete", "catch." + err);
		}
	}

}

module.exports = YoutubeModel;

