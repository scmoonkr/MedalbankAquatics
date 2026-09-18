const _    				= require('lodash');
const extend 			= require('node.extend');
const mskCFG 			= require('../../Config/mskCFG');
const mongoCFG 		= require('../../Config/mongoCFG.js');
const mongoDB			= require('../../Class/MongoDB.js');
const UtilDate		= require("../../Class/DateLibrary.js");
const utilLibrary = require("../../Util/utilLibrary.js");
const utilError		= require("../../Util/utilError.js");
// const utilDatabase= require('../utilDatabase');
const imageLibrary= require("../library/images.library.js");
const TimeLibrary = require('../../Class/TimeLibrary.js');


// const Customizing = require("./newRecords.custom.js");

const mongodb 		= new mongoDB(mongoCFG.Medalbank.database);
const utilDate		= new UtilDate();

const PK = "newRecordsID";
const MAX_LIMIT = 100;

const _context = {
	query		 	: {},
	projection: { _id:0, },
	limit		 	: MAX_LIMIT,
	skip			: 0,
	sort			: { _id:-1 },
}

class NewRecordsModel {
	static async create() {
		const indexes = [
			{ query: { newRecordsID:1 }, name: "newRecordsID", option: { unique: true }	},
			{ query: { "newRecords.category":1 }, name: "category"	},
		];
		await mongodb.createCollectionNindex(mongoCFG.Medalbank.newRecords, indexes);
	}

	static async newRecordsNew(body) {
		const context = {
			query: { style: { $in: ["freestyle", "backstroke", "breaststroke", "butterfly", "individualMedley"] } },
			// query			: { isMasters: false, type: { $in: ["Asian", "Korean", "Olympic", "World",] } },
			projection: {},
			limit			: 10000,
			skip			: 0 
		};
		const result = await mongodb.find(mongoCFG.Medalbank.newRecordsNew, context);
	
		let newRecordOBJ = {};
		for (const record of result.data) {
			const key = `${record.gender}-${record.style}-${record.course}-${record.distance}`;
			if (!newRecordOBJ[key]) newRecordOBJ[key] = {};
			if (!newRecordOBJ[key][record.type]) newRecordOBJ[key][record.type] = {};
			newRecordOBJ[key][record.type] = {
				name: record.name,
				time: record.time,
				team: record.team || '',
				ageGroup: record.ageGroup || '',
				datetime: record.datetime || '',
				location: record.location || '',
			};
		}
		
		let newRecords = [];
		for (const key of Object.keys(newRecordOBJ)) {
			const [gender, style, course, distance] = key.split('-'); // men-freestyle-LCM-50M
			newRecords.push({
				gender, style, course, distance,
				...newRecordOBJ[key]
			});
		}
	
		newRecordOBJ = {};
		for (const record of newRecords) {
			const genderNo 		= mskCFG.genders.findIndex(el => el == record.gender);
			const styleNo 		= mskCFG.styles.findIndex(el => el == record.style);
			const courseNo 		= mskCFG.courses.findIndex(el => el == record.course);
			const distanceNo	= mskCFG.distances.findIndex(el => el == record.distance);
	
			const index 			= `${genderNo}${styleNo}${distanceNo}${courseNo}`;
			if (!newRecordOBJ[index]) newRecordOBJ[index] = { gender: record.gender, style: record.style, course: record.course, distance: record.distance, index: index, };
			if (!newRecordOBJ[index][record.type]) newRecordOBJ[index][record.type] = {};
			newRecordOBJ[index].record = record;
		} // end for
	
		newRecords = Object.values(newRecordOBJ);
		// console.log(newRecords);
		newRecords.sort((a,b) => a.index-b.index);
		newRecords = newRecords.map(el => el.record);
	
		return { message: '', data: newRecords };
	}
	static async newRecords(body) {
		const query = { isMasters: false, type: { $in: ["Asian", "Korean", "Olympic", "World",] } };
		if (body.style		)	query.style = body.style;
		if (body.course		)	query.course = body.course;
		if (body.gender		)	query.course = body.gender;
		if (body.distance	)	query.distance = body.distance;
		
		const context = {
			query			: query,
			projection: {},
			limit			: 1000,
			skip			: 0 
		};
		const result = await mongodb.find(mongoCFG.Medalbank.newRecords, context);
		
		let newRecords = {};
		for (const record of result.data) {
			// console.log(record, mskCFG.genders);
			const genderNo 		= mskCFG.genders.findIndex(el => el == record.gender);
			const styleNo 		= mskCFG.styles.findIndex(el => el == record.style);
			const courseNo 		= mskCFG.courses.findIndex(el => el == record.course);
			const distanceNo	= mskCFG.distances.findIndex(el => el == record.distance);
			const index 			= `${genderNo}${styleNo}${distanceNo}${courseNo}`;
			// const discipline 	= `${record.gender}-${record.style}-${record.distance}-${record.course}`;
			if (!newRecords[index]) newRecords[index] = { gender: record.gender, style: record.style, course: record.course, distance: record.distance, index: index, };
			if (!newRecords[index][record.type]) newRecords[index][record.type] = {};
			newRecords[index][record.type] = {
				name						: record.name,
				time						: record.time,
				team						: record.team,
				pool						: record.location,
				datetime				: record.datetime,
				// gender					: record.gender,
				// style					: record.style,
				// course					: record.course,
				// distance				: record.distance,
				// competitionName: record.competitionName,
			}
		} // end for
		newRecords = Object.values(newRecords);
		// console.log(newRecords);
		newRecords.sort((a,b) => a.index-b.index);
		return { message: '', data: newRecords };
	}
	// find newRecords
	static async list(body) {
		const query = {};
		if (body.isMasters != undefined	)	query.isMasters = body.isMasters == "masters";
		if (body.style			)	query.style = body.style;
		if (body.course		)	query.course = body.course;

		const limit = body.limit ? Number(body.limit) : MAX_LIMIT;
		let skip = (Number(body.page??1)-1)	* limit;
		skip = skip < 0 ? 0 : skip;
		// query.competitionCount = { $gt: 0}
		const context = {
			query			: query,
			projection: { _id:0, },
			limit			: limit,
			skip			: skip,
			sort			: { isMasters:1, isAdult:1, gender:1, distance:1, type:1,  },
		}
		console.log("body=", body, "query=", query);
		//----------------------------------------------------------------
		const result = await mongodb.find(mongoCFG.Medalbank.newRecords, context)
		//----------------------------------------------------------------result.data
		return result;
	}
	
	// insert
	static async insert(body) {
		const value = Customizing.field(body);
		value.newRecordsID = await mongodb.max(mongoCFG.Medalbank.newRecords, "newRecordsID", {});
	console.log("newRecords.insert.value=", value);
		//----------------------------------------------------------------
		return await mongodb.insertOne(mongoCFG.Medalbank.newRecords, value);
		//----------------------------------------------------------------
	}

	// update
	static async update(body) {
		if (Object.keys(body).length < 2) return utilError.errorMSG("Model",mongoCFG.Medalbank.newRecords, "update", "field not found");
		const value = Customizing.field(body);
		const query = { newRecordsID: value.newRecordsID };

		delete value.newRecordsID;
	
		//----------------------------------------------------------------
		return await mongodb.updateOne(mongoCFG.Medalbank.newRecords, query, value);
		//----------------------------------------------------------------
	}

	// delete
	static async delete(newRecordsID) {
		try {
			const query = { newRecordsID: Number(newRecordsID) };
			//----------------------------------------------------------------
			return await mongodb.deleteOne(mongoCFG.Medalbank.newRecords, query);
			//----------------------------------------------------------------
		} catch (e) {
			return utilError.errorMSG("Model",mongoCFG.Medalbank.newRecords, "delete", "catch." + err);
		}
	}

}

module.exports = NewRecordsModel;

