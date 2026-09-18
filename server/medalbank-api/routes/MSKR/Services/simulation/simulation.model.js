const _    				= require('lodash');
const extend 			= require('node.extend');
const mongoCFG 		= require('../../Config/mongoCFG.js');
const mongoDB			= require('../../Class/MongoDB.js');
const UtilDate		= require("../../Class/DateLibrary.js");
const utilLibrary = require("../../Util/utilLibrary.js");
const utilError		= require("../../Util/utilError.js");
// const utilDatabase= require('../utilDatabase');
const imageLibrary= require("../library/images.library.js");
const TimeLibrary = require('../../Class/TimeLibrary.js');


const Customizing = require("./simulation.custom.js");
const MemoryDB 		= require('../../Class/MemoryDB.js');
const readDAO			=	 require("../importTimes/readDAO");
const memoryDB = new MemoryDB();

const mongodb 		= new mongoDB(mongoCFG.Medalbank.database);
const utilDate		= new UtilDate();

const PK = "competitionID";
const MAX_LIMIT = 100;

const _context = {
	query		 	: {},
	projection: { _id:0, },
	limit		 	: MAX_LIMIT,
	skip			: 0,
	sort			: { _id:-1 },
}

class SimulationModel {
	static async create() {
		const indexes = [
			{ query: { competitionID:1, timeID:1 }, name: "competitionIDtimeID", option: { unique: true }	},
		];
		await mongodb.createCollectionNindex(mongoCFG.Medalbank.timesSimulation, indexes);
	}

	// find simulation
	static async competitions(body) {
		let result;
		// const today = new Date().toISOString().slice(0, 10);
		result = await mongodb.distinct(mongoCFG.Medalbank.timesSimulation, "competitionID")
		console.log("competitionIDs=", result.data);

		
		let context = {
			query			: { competitionID: { $in: result.data } },
			// query			: { dateStart: { $gt: new Date() }, competitionID: { $in: result.data } },
			projection: { _id:0, competitionID:1, fullname:1, dateStart:1, },
			limit			: 100,
			skip			: 0,
			// sort			: { _id:1 },
		}
		//----------------------------------------------------------------
		result = await mongodb.find(mongoCFG.Medalbank.competitions, context)
		//----------------------------------------------------------------
		
		console.log("competitions=", result.data);
		return result;
	}

	// delete
	static async build(competitionID) {
		try {
			const query = { competitionID: Number(competitionID) };
			//----------------------------------------------------------------
			return await mongodb.deleteMany(mongoCFG.Medalbank.timesSimulation, query);
			//----------------------------------------------------------------
		} catch (e) {
			return utilError.errorMSG("Model","simulation", "delete", "catch." + err);
		}
	}

	// find simulation
	static async listTest(body) {
		
		const newBody = { category: 'times', type: 'times', id: body.competitionID.toString() }
		console.log("simulation.list.", body, newBody);
		const excelTimes = await readDAO.read(newBody);
		console.log("simulation.excelTimes=", excelTimes.data.slice(0,3));

		//-----> get unique names
		const names = excelTimes.data.map(time => time.name);
		let uniqueNames = [...new Set(names)]
		console.log("names=", names.length, uniqueNames.length);

		const competitionID = Number(body.competitionID);
			const aggregate = [
				{ $match: { name: { $in : uniqueNames } } },
				{ $sort: { timeStamp: 1 } }, // 낮은 기록이 먼저 오도록 정렬
				{ $group: {
						_id: {
							name    : "$name",
							gender  : "$gender",
							style   : "$style",
							distance: "$distance",
							isAdult : "$isAdult",
						},
						best: { $first: "$$ROOT" } // 그룹별 가장 첫 번째 기록 = 최소값
					}
				},
				{ $replaceRoot: { newRoot: "$best" } },// best 필드를 최상위로 평탄화
				{ $project: { _id:0, } },
			]
		
		//----------------------------------------------------------------
		const result = await mongodb.aggregate(mongoCFG.Medalbank.times, aggregate);
		//----------------------------------------------------------------
		result.data = result.data.map(data => Customizing.field(data));
		result.competition = memoryDB.getCompetition(competitionID)
		console.log("simulation.list=", result.data.length);
		return result;
	}

	// find simulation
	static async list(body) {
		const competitionID = Number(body.competitionID);
		const context = {
			query			: { competitionID: competitionID},
			projection: { _id:0, },
			limit			: 5000,
			skip			: 0,
			// sort			: { _id:1 },
		}
		//----------------------------------------------------------------
		const result = await mongodb.find(mongoCFG.Medalbank.timesSimulation, context)
		//----------------------------------------------------------------
		result.data = result.data.map(data => Customizing.field(data));
		result.competition = memoryDB.getCompetition(competitionID)
		console.log("simulation.list=", result.data.length);
		return result;
	}

	// delete
	static async delete(competitionID) {
		try {
			const query = { competitionID: Number(competitionID) };
			//----------------------------------------------------------------
			return await mongodb.deleteMany(mongoCFG.Medalbank.timesSimulation, query);
			//----------------------------------------------------------------
		} catch (e) {
			return utilError.errorMSG("Model","simulation", "delete", "catch." + err);
		}
	}

}

module.exports = SimulationModel;

