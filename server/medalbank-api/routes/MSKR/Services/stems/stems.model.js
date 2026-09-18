const mongoCFG 		= require('../../Config/mongoCFG.js');
const mongoDB			= require('../../Class/MongoDB.js');
const UtilDate		= require("../../Class/DateLibrary.js");
const utilLibrary = require("../../Util/utilLibrary.js");
const utilError		= require("../../Util/utilError.js");
// const utilDatabase= require('../utilDatabase');

const mongodb 		= new mongoDB(mongoCFG.Medalbank.database);
const utilDate		= new UtilDate();

const PK = "stemID";
const MAX_LIMIT = 100;


class StemModel {
	static async create() {
		const indexes = [
			{ query: { stemID:1 }, name: "stemID", option: { unique: true }	},
			{ query: { name:1 }, name: "name"	},
		];
		await mongodb.createCollectionNindex(mongoCFG.Medalbank.stems, indexes);
	}

	// view
	static async detail(stemID) {
		console.log("1>stems.view.stemID=", stemID);
		//----------------------------------------------------------------
		 const aggregate = [
				{ $match: query },
				{ $lookup: {
						from				: mongoCFG.Medalbank.competitions,
						localField	: "stemID",
						foreignField: "stemID",
						as					: "competitions"
					}
				},
				{ $project: { _id:0, } }
			];
			//-----> select comment
			const result = await mongodb.aggregate(mongoCFG.Medalbank.stems, aggregate);
			if (result.data.length == 0) return { message: "no data", data: {} };

			const competitions = result.data[0].competitions.map(el => ({ competitionID: el.competitionID, competitionName: el.fullname }));
			result.data[0].competitions = competitions
	
			return { message: '', data: result.data[0] };
	}

	// find stems
	static async list( body) {
		console.log("stems.model.list.body.", body);
		const query = {};
		if (body.stem)	query.stem = new RegExp(body.stem.trim(), "gi");
		const aggregate = [
				{ $match: query },
				{ $lookup: {
						from				: mongoCFG.Medalbank.competitions,
						localField	: "stemID",
						foreignField: "stemID",
						as					: "competitions"
					}
				},
				{ $project: { _id:0, } }
			];
			console.log("stems.list.query=", query, body);
			//-----> select comment
			const result = await mongodb.aggregate(mongoCFG.Medalbank.stems, aggregate);
			result.data.forEach(stem => {
				stem.competitions = stem.competitions.map(el => el.fullname);
			})

			console.log(result.data.slice(0,2), result.data.length);
		// query.competitionCount = { $gt: 0}
		// const context = {
		// 	query			: query,
		// 	projection: { _id:0, stemID:1, stem:1, },
		// 	limit			: 1000,
		// 	skip			: 0,
		// 	sort			: { stem:1 },
		// }
		// //----------------------------------------------------------------
		// const result = await mongodb.find(mongoCFG.Medalbank.stems, context)
		//----------------------------------------------------------------
		return result;
	}

	// update
	static async update(body) {
		const value = {};
		if (!body.stemID) {
			value.stemID = await mongodb.max(mongoCFG.Medalbank.stems, "stemID", {});
		} else {
			value.stemID = Number(body.stemID);
		}
		value.stem = body.stem.trim();
		const query = { stemID: value. stemID};
	
		console.log("update.", query, value);
		//----------------------------------------------------------------
		await mongodb.updateOne(mongoCFG.Medalbank.stems, query, value);
		//----------------------------------------------------------------
		return { message: '', data: value };
	}

	// delete
	static async delete(stemID) {
		try {
			const query = { stemID: Number(stemID) };
			console.log("delete.", query);
			//----------------------------------------------------------------
			return await mongodb.deleteOne(mongoCFG.Medalbank.stems, query);
			//----------------------------------------------------------------
		} catch (e) {
			return utilError.errorMSG("Model","stems", "delete", "catch." + err);
		}
	}

}

module.exports = StemModel;

