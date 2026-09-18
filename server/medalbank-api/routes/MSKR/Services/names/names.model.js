const mongoCFG 		= require('../../Config/mongoCFG');
const mongoDB			= require('../../Class/MongoDB');
const UtilDate    = require("../../Class/DateLibrary");
const utilLibrary = require("../../Class/utilLibrary");
const utilError		= require("../../Class/utilError");

const mongodb 	  = new mongoDB(mongoCFG.Medalbank.database);
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
function customizingField(data) {
	const value = {
		type  : data.type || "name",
		name  : data.name.replace(/ {2}/gi, ' ').trim(),
		names : data.names || [],
		norm  : utilLibrary.normalizeMSKR(data.name),
		norms : data.norms || [],
	}
	value.names.push(value.name);
	const names = [];
	value.norms = value.names.reduce((arr, name) => {
															const norm = utilLibrary.normalizeMSKR(name)
															if (!arr.includes(norm)) {
																arr.push(norm);
																names.push(name.replace(/ {2}/gi,'').trim());
															}
															return arr;
														}, []);
	// value.norms = [...new Set(value.norms)] // remove duplicate values
	// value.names = [...new Set(value.names)] // remove duplicate values
	value.names = names;

	return value;
}

class NameModel {

	//============================================
	//  find
	//============================================
	static async find(query, body) {
		console.log("query:", query, "body:", body);
		const context = {
			query			: query,
			projection: { _id:0, },
			limit			: body.limit ? Number(body.limit) : MAX_LIMIT,
			skip			: body.skip ? Number(body.skip) : 0,
			sort			: { name:1, },
		}
		//----------------------------------------------------------------
			const result = await mongodb.find(mongoCFG.Medalbank.names, context)
		//----------------------------------------------------------------
		result.data = result.data.reduce((arr, data) =>{
																arr.push({ name: data.name, norm: data.norm, names: data.names, norms: data.norms });
																return arr;
															}, []);
		return result;
	}
	static async list(body) {
		const query = {};
		if (body.type) query.type = body.type.trim();

		body.name = body.name.trim();
		if (body.name) {
			if (body.name.includes("~")) {
				const pre = body.name.slice(0, 1) == "~" ? "" : "^";
				const post = body.name.slice(-1) == "~" ? "" : "$";
				const name = utilLibrary.normalizeMSKR(body.name.replace(/~/gi, ''))
				query.norms = !pre && !post ? name : new RegExp(pre + name + post, "gi");
			} else {
				query.norms = utilLibrary.normalizeMSKR(body.name);
			}
		}

		console.log("query:", query, "body:", body);
		
		return await this.find(query, body);;
	}
	
	static async getNames(body) {
		const name = body.name.replace("%", "");
		const namesNorm = utilLibrary.normalizeMSKR(body.name);

		const query = {
			type  : body.type.trim(),
			norms : namesNorm,
		};
		
		const result = await this.find(query, body);
		if (result.data.length == 0) return { name: name, norm: name, names:[name], norms:[name]}
		result.data = result.data[0];

		result.data.names = [...new Set([result.data.name, ...result.data.names])] // remove duplicate values

		return result.data;
	}
	static async getNamesOld(body) {
		const names = body.name.split(",").map(name => name.trim());
		const namesNorm = names.reduce((arr, data) => {
															const name = utilLibrary.normalizeMSKR(data);
															arr.push(name);
															return arr;
														},[]);

		const query = {
			type  : body.type.trim(),
			norms : { $in: namesNorm }
		};
		console.log("query:", query, "body:", body);
		
		const result = await this.find(query, body);

		// Initialize an empty result array
		let nameList = [];

		namesNorm.forEach(norm => {
			let found = false;

			// Iterate through each object in the arr array
			result.data.forEach(row => {
				// Check if the name exists in the row.names array
				if (row.norms.includes(norm)) {
					nameList.push({ name: row.name, names: row.names });
					found = true;
				}
			});

			// If the name was not found in any row.names array, add it to the result
			if (!found) {
				nameList.push({ name: norm, names: [norm] });
			}
		});

		console.log("nameList=", nameList);
		return nameList;
	}

	static async isExistsName(body) {
		const query = {};
		if (body.type) query.type = body.type.trim();
		if (body.name) query.norms = utilLibrary.normalizeMSKR(body.name);
		console.log(query, body);
		//----------------------------------------------------------------
			const result = await mongodb.findOne(mongoCFG.Medalbank.names, query, { _id:0, name:1 })
		//----------------------------------------------------------------
		returnObj.data = customizingField(returnObj.data);
		return result;
	}
	static async detail(query) {
		console.log("query=", query);
		//----------------------------------------------------------------
			const result = await mongodb.findOne(mongoCFG.Medalbank.names, query, { _id:0, })
			if (!result.data.name) return result;
		//----------------------------------------------------------------
		result.data = customizingField(result.data);
		return result;
	}
	static async getByTypeName(type, name) {
		return await this.detail({ type: type.trim(), norm: utilLibrary.normalizeMSKR(name) });
	}
	static async getByTypeNames(type, name) {
		return await this.detail({ type: type.trim(), norms: utilLibrary.normalizeMSKR(name) });
	}


	// insert
	static async insert(body) {
		const value = customizingField(body);
		console.log(value);
		//----------------------------------------------------------------
		return await mongodb.insertOne(mongoCFG.Medalbank.names, value);
		//----------------------------------------------------------------
	}

	// update
	// replace: true : replace names
	//          fasle: merge names
	static async update(body) {
		console.log("names.model.update.body:", body);
		let custom = customizingField(body);
		if (!body.replace) {
			const names = await this.getByTypeName(body.type, body.name);
			custom.names = [...new Set([...custom.names, ...names.data.names])] // remove duplicate values
			custom = customizingField(custom);
		}
		const value = { names: custom.names, norms: custom.norms };
		if (custom.name) {
			value.name = custom.name;
			value.norm = custom.norm;
		}
		const query = { type: custom.type, norm: custom.norm  };
		console.log("query: ", query, "value:", value);
		//----------------------------------------------------------------
		return await mongodb.updateOne(mongoCFG.Medalbank.names, query, value);
		//----------------------------------------------------------------
	}

	// delete
	static async delete(type, name) {
		try {
			const query = { type: type.trim(), norm: utilLibrary.normalizeMSKR(name)  };
			//----------------------------------------------------------------
			return await mongodb.deleteOne(mongoCFG.Medalbank.names, query);
			//----------------------------------------------------------------
		} catch (e) {
			return utilError.errorMSG("Model","names", "delete", "deleteOne.catch." + e);
		}
	}
	//============================================
	//  create
	//============================================
	static async create() {
		const indexes = [
			{ query: { type :1, norm: 1 }, name: "typeNorm", option: { unique: true }  },
			{ query: { norms:1 }, name: "norms"  },
		];
		await mongodb.createCollectionNindex(mongoCFG.Medalbank.names, indexes);
	}
}

module.exports = NameModel;
