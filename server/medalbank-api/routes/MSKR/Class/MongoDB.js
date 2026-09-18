
var stream 			= require('stream');
var Duplex 			= require('stream').Duplex;  //== buffer to stream에서 사용  
var mongodb 		= require('mongodb');
var extend 			= require('node.extend');
var mongoCFG  	= require('../Config/mongoCFG');
// const { constants } = require('crypto');
var MongoClient = mongodb.MongoClient;

'use strict';

let _schemas = {};

/*******************************************************
 * 
 * mongoDB\
 * 
 *******************************************************/
const initContext = {
	query		: {},
	projection	: { _id: 0 },
	skip		: 0,
	limit		: 20,
	sort		: { _id: -1 },
}

class MongoDB {
	constructor(dbname=mongoCFG.Medalbank.database, dbURL=mongoCFG.mongo_url) {
		// console.log("dbname=", dbname, "dbURL=", dbURL);
		this.mongoOption	= {}; // { useUnifiedTopology: true }
		// this.mongoOption = this.mongoOption;
		this._dbURL			= dbURL;
		this._dbname		= dbname;
		this._context 		= initContext;
	}
	//-----------------------------
	// getter
	//-----------------------------
	get dbURL() 			{ return this._dbURL; }
	get mongoOption() { return this._mongoOption; }
	get dbname() 			{ return this._dbname; }
	get context() 		{ return this._context; }

	//-----------------------------
	set dbURL(dbn)   			{ this._dbURL				= dbURL; }
	set mongoOption(opt)  { this._mongoOption	= opt; }
	set dbname(dbn)   		{ this._dbname			= dbn; }
	set context(ctx)			{ 
		this._query				= ctx.query; 
		this._limit				= ctx.limit; 
		this._sort				= ctx.sort; 
		this._projection	= ctx.projection; 
	}
	//-----------------------------

	//-----------------------------
	// table options
	//		page			: 1 ~
	//		page_size	: 20
	//		sort			: '_id'
	//		limit			: 25
	//		skip			: 0
	//		projection: { _id:0, }
	//-----------------------------
	optionsNew(body) {
		const PAGE_SIZE = 25;
		const context = {
			query 			: body.query ? body.query : {},
			projection	: body.projection ? body.projection : { _id: 0, },
			limit 			: body.limit ? Number(body.limit) : 20,
			skip 				: body.skip  ? Number(body.skip) : 0,
			sort 				: body.sort  ? body.sort : { _id: 1, },		
		}
		if (body.page) {
			const page = body.page_size ? Number(body.page_size) : PAGE_SIZE;
			context.skip = (Number(body.page) - 1) * page;
			if (context.skip < 0) context.skip = 0;
		}
		return context;
	}
	
	makeDateQuery(type, date = new Date(), dateTo = new Date()) {
		console.log("type=", type);
		type = type.toLowerCase();
		if (type == 'all') return {};
		
		const today = new Date(date);
		const year  = today.getFullYear();
		const month = today.getMonth();
		let startDate, endDate;
	
		switch (type.toLowerCase()) {
			case 'year':
				startDate = new Date(year, 0, 1);
				endDate   = new Date(year + 1, 0, 1);
				break;
	
			case 'month':
				startDate = new Date(year, month, 1);
				endDate   = new Date(year, month + 1, 1);
				break;
	
			case 'week':
				const day = today.getDay();
				const diff= today.getDate() - day + (day === 0 ? -6 : 1);
				startDate = new Date(year, month, diff);
				endDate   = new Date(year, month, diff + 7);
				break;
	
			case 'day':
				startDate = new Date(year, month, today.getDate());
				endDate   = new Date(year, month, today.getDate() + 1);
				break;
	
			case 'period':
				startDate = new Date(date);
				endDate   = new Date(dateTo);
				break;
	
			default:
				console.log("Invalid type. Use: year, month, week, or day.type=", type, "date:", date);
				return {};
		}
		startDate.setHours(9, 0, 0, 0);  // 하루의 시작 시간으로 설정
		endDate.setHours(9, 0, 0, 0); 
		endDate.setDate(endDate.getDate() + 1); // 하루의 시작 시간으로 설정
	
		return {
			$gte: startDate,
			$lt: endDate
		};
	}
	//-----------------------------
	// table options
	//		page					: 1 ~
	//		itemsPerPage	: 20
	//		sortBy				: '_id'
	//		sortDesc			: 'asc|desc'
	//		projection		: { _id:0, }
	//-----------------------------
	options(body={}) {
		const context = { query: {}, }; // extend(true, initContext, body); //deep copy 
		//-----> sort
		if (body.sort != undefined) {
			context.sort = body.sort;
		} else {
			context.sort = {};
			const sortBy = body.sortBy == undefined ? "_id" : body.sortBy;
			context.sort[sortBy]	= (body.sortDesc	=== 'asc' ? 1 : -1);
		}

		//-----> projection
		context.projection	= (body.projection === undefined ? { _id: 0 } : body.projection);

		//-----> pagination
		context.limit				= (body.itemsPerPage === undefined ? 20 : Number(body.itemsPerPage));
		context.skip				= (body.page === undefined ? 0 : Number(body.page) - 1);
		context.skip				= (context.skip < 0 ? 0 : context.skip) * context.limit;
		return context;
	}

	//-----------------------------
	// createCollection
	//-----------------------------
	indexing(value, fields) {
		let indexes = [];

		let arr = fields.split(",");
		arr.forEach((el) => {
			const res = utilLibrary.normalizeString(value[el]);
			if (res) indexes.push(res);
		})
	
		return indexes;
	}
  
	async close() {
		const client = new MongoClient(this.dbURL, this.mongoOption);
		if (client) {
			await client.close();
		}
	}
	//-----------------------------
	// createCollection
	//-----------------------------
	async createCollection(collname, dbname=this.dbname) {
		let returnObj = { message: '' };
		const client = new MongoClient(this.dbURL, this.mongoOption);
		try {
			await client.connect();
			const db 				= client.db(dbname);
			let result 			= await db.createCollection(collname)
			returnObj.data 	= result;
		} catch(e) {
			returnObj.message = `${collname} createCollection.catch.error=${e}`;
			console.log(dbname, collname, returnObj.message);
		}
		client.close();
		return returnObj; 
	}
	
	//-----------------------------
	// createView
	//-----------------------------
	async createView(viewName, viewOn, pipeline, dbname=this.dbname) {
		let returnObj = { message: '' };
		const client = new MongoClient(this.dbURL, this.mongoOption);
		try {
			const res = await this.dropCollection(viewName);
			await client.connect();
			const db 				= client.db(dbname);
			const result 		= await db.createCollection(
				viewName,
												{
													viewOn		: viewOn,
													pipeline	: pipeline,
												}
											);
			returnObj.data 	= result;
		} catch(e) {
			returnObj.message = `${viewName} createCollection.catch.error=${e}`;
			console.log(dbname, viewName, viewOn, pipeline, returnObj.message);
		}
		client.close();
		return returnObj; 
	}
	
	async removeNinsert(collname, query, value, dbname=this.dbname) {
		let returnObj = { message: '' };
		const client = new MongoClient(this.dbURL);
		try {
			await client.connect();
			const db = client.db(dbname);
			let result = await db.collection(collname).deleteMany(query);
			result = await db.collection(collname).insertMany(value)
			returnObj.data = result.ops;
		} catch(e) {
			returnObj.message = `${collname} replace.catch.error=${e}`;
			console.log(returnObj.message);
		}

		client.close();	
		return returnObj;
	}

	//-----------------------------
	// createIndex
	// 	query: { testID: 1 },
	// 	option: { unique: true }
	//-----------------------------
	async createIndex(collname, query, options={}, dbname=this.dbname) {
		let returnObj = { message: '' };
		const client = new MongoClient(this.dbURL, this.mongoOption);
		try {
			await client.connect();
			const db 				= client.db(dbname);
			// let result1			= await db.createCollection(collname);
			let collection	= await db.collection(collname);
			let result			= await collection.createIndex( query, options );
			returnObj.data	= result;
		} catch(e) {
			returnObj.message = `${collname} createIndex.catch.error=${e}`;
			console.log(returnObj.message);
		}
		client.close();
		return returnObj; 
	}
	async createCollectionNindex(collectionName,indexes) {
    let returnObj = { message: "", };
  
    try {
      // const result = await this.find(collectionName, { query:{}, projection: { _id:1 }, limit: 1 });
      // if (result.data.length == 0) {
      //   returnObj = await this.createCollection(collectionName);
      // }
			returnObj = await this.createCollection(collectionName);
      returnObj = await this.dropIndexes(collectionName);
  
      for (let no=0; no<indexes.length; no++) {
        returnObj = await this.createIndex(collectionName, indexes[no].query, indexes[no].option);
      }
			console.log(collectionName + " create & index ok");
    } catch (err) {
      return `${collectionName} createCollectionNindex.catch.` + err;
    }
    return returnObj;  
  }

	//-----------------------------
	// dropIndexes
	//-----------------------------
	async dropIndexes(collname, dbname=this.dbname) {
		let returnObj = { message: '' };
		const client = new MongoClient(this.dbURL, this.mongoOption);
		try {
			await client.connect();
			const db 				= client.db(dbname);
			let collection	= await db.collection(collname);
			let result			= await collection.dropIndexes();
			returnObj.data = result;
		} catch(e) {
			returnObj.message = `${collname} dropIndexes.catch.error=${e}`;
			console.log(returnObj.message);
		}
		client.close();
		return returnObj; 
	}

	//-----------------------------
	// dropIndexes
	//-----------------------------
	async dropCollection(collname, dbname=this.dbname) {
		let returnObj = { message: '' };
		const client = new MongoClient(this.dbURL, this.mongoOption);
		try {
			await client.connect();
			const db 				= client.db(dbname);
			let collection	= await db.collection(collname);
			let result			= await collection.drop();
			returnObj.data = result;
		} catch(e) {
			returnObj.message = `${collname} dropCollection.catch.error=${e}`;
			console.log(returnObj.message);
		}
		client.close();
		return returnObj; 
	}

	//-----------------------------
	async createNindex(collname, index, dbname=this.dbname) {
		let returnObj = { message: "", };

		try {
			returnObj = await this.createCollection(collname, dbname);

			console.log("...create index");
			returnObj = await this.dropIndexes(collname, dbname);

			for (let no=0; no<index.length; no++) {
				returnObj = await this.createIndex(collname, index[no].query, index[no].option, dbname);
			}

		} catch (e) {
			console.log("---> createNindex.catch." + e);
		}

		return returnObj;
	}
	
	//-----------------------------
	// count
	//		result = await mdb.count("test", { cat: 'TEST' });
	//-----------------------------
	async count(collname, query={}, dbname=this.dbname) {
		let returnObj = { message: '' };
		const client = new MongoClient(this.dbURL);
		try {
			await client.connect();
			const db 				= client.db(dbname);
			// let collection	= await db.collection(collname);
			returnObj 			= await db.collection(collname).countDocuments(query);
			// returnObj: 2
		}	catch(e) {
			client.close();	
			console.log(`${collname} count.catch.error=${e}`);
			returnObj = -1;
		}
		client.close();
		return returnObj;
	}

	//-----------------------------
	// MAX
	//		field: 'testID'
	//-----------------------------
	async max(collname, field, query={}, dbname=this.dbname) {
		let returnObj;
		let projection = { _id: 0 };
		projection[field] = 1;
		let sort = {};
		sort[field] = -1;
		const client = new MongoClient(this.dbURL);
		try {
			await client.connect();
			const db 		= client.db(dbname);
			let result 	= await db.collection(collname)
															.find(query)
															.sort(sort)
															.project(projection)
															.skip(0)
															.limit(1)
															.toArray();
			// result: [ { testID: 3 } ]
			// console.log("max=", dbname, collname, "field=", field, "sort=", sort, projection, result)
			returnObj = (result.length == 0 || result[0][field] === undefined ? 1 : Number(result[0][field]) + 1);
		} catch(e) {
			console.log(`${collname} max.catch.error=${e}`);
			returnObj = 1;
		}
		client.close();
		return returnObj;
	}
	

	//-----------------------------
	// MIN
	//		field: 'testID'
	//-----------------------------
	async min(collname, field, dbname=this.dbname) {
		let returnObj;
		let projection = { _id: 0 };
		projection[field] = 1;
		let sort = {};
		sort[field] = 1;
		const client = new MongoClient(this.dbURL);
		try {
			await client.connect();
			const db 		= client.db(dbname);
			let result 	= await db.collection(collname)
															.find({})
															.sort(sort)
															.project(projection)
															.skip(0)
															.limit(1)
															.toArray();
			// result: [ { testID: 3 } ]
			// console.log("max=", dbname, collname, "field=", field, "sort=", sort, projection, result)
			returnObj = (result.length == 0 || result[0][field] === undefined ? 1 : Number(result[0][field]) - 1);
		} catch(e) {
			console.log(`${collname} max.catch.error=${e}`);
			returnObj = 1;
		}
		client.close();
		return returnObj;
	}
	
	async maxQuery(collname, field, query, dbname=this.dbname) {
		let returnObj;
		let projection = { _id: 0 };
		projection[field] = 1;
		let sort = {};
		sort[field] = -1;
		const client = new MongoClient(this.dbURL);
		try {
			await client.connect();
			const db 		= client.db(dbname);
			let result 	= await db.collection(collname)
															.find(query)
															.sort(sort)
															.project(projection)
															.skip(0)
															.limit(1)
															.toArray();
			// result: [ { testID: 3 } ]
			// console.log("max=", dbname, collname, "field=", field, "sort=", sort, projection, result)
			returnObj = (result.length == 0 || result[0][field] === undefined ? 1 : Number(result[0][field]) + 1);
		} catch(e) {
			console.log(`${collname} max.catch.error=${e}`);
			returnObj = 1;
		}
		client.close();
		return returnObj;
	}

	//-----------------------------
	// MAX subElement
	//		result = await mdb.maxElement("test", { cat: 'max' }, 'subElement', 'seqno');
	//-----------------------------
	async maxElement(collname, query, subElement, field, dbname=this.dbname) {
		const sort = {};
		sort[`${subElement}.${field}`] = -1;
		let returnObj = { message: '' };
		let aggregate = [
			{ $match: query },
			{ $unwind: `$${subElement}` },
			{ $sort: sort },
			{ $limit: 1 },
			{ $group: { _id: `$${subElement}.${field}` } }
		];

		const client = new MongoClient(this.dbURL);
		try {
			await client.connect();
			const db = client.db(dbname);
			let result = await db.collection(collname).aggregate(aggregate).toArray();
			returnObj = (result.length === 0 ? 1 : result[0]["_id"] + 1);
		} catch(e) {
			returnObj.message = `${collname} max.catch.error=${e}`;
			console.log(returnObj.message);
			returnObj = 1;
		}
		client.close();
		return returnObj;
	}

	//-----------------------------
	// insertOne
	//		result = await mdb.insertOne("test", { testID: 1, title:"title1..."});
	// 		{
	// 			result: { n: 1, ok: 1 },
	// 			connection: Connection {},
	// 			message: BinMsg {},
	// 			ops: [ { testID: 1, title: 'title1...', _id: 5f66c0ac078cea5e84d50270 } ],
	// 			insertedCount: 1,
	// 			insertedId: 5f66c0ac078cea5e84d50270
	//		}
	//-----------------------------
	async insertOne(collname, value, dbname=this.dbname) {
		let returnObj = { message: '' };
		const client = new MongoClient(this.dbURL);
		try {
			await client.connect();
			const db 				= client.db(dbname);
			let result 			= await db.collection(collname).insertOne(value) 
			returnObj.data 	= result.insertedId.toString();
		} catch(error) {
			if (error.code === 11000) {
        // console.log('Duplicate key error: ', value);
				returnObj.message = `${collname} insertOne Duplicate key error`;
      } else {
        // console.log('An error occurred: ', error.message);
				returnObj.message = `${collname} insertOne.catch.error=${error.message}`;
      }	
		}
		client.close();
		return returnObj; 
}

	//-----------------------------
	// insertMany
	//	result = await mdb.insertMany("test", [{ testID:2, cat:"test", title:"title2..."},{ testID:3, cat:"test", title:"title3..."}]);
	// {
	// 	result: { ok: 1, n: 2 },
	// 	ops: [
	// 		{ testID: 2, cat: 'test', title: 'title2...', _id: 5f66c3d4b9e7df26985054bd },
	// 		{ testID: 3, cat: 'test', title: 'title3...', _id: 5f66c3d4b9e7df26985054be },
	// 	],
	// 	insertedCount: 2,
	// 	insertedIds: { '0': 5f66c3d4b9e7df26985054bd, '1': 5f66c3d4b9e7df26985054be }
	// }
	//-----------------------------
	async insertMany(collname, value, dbname=this.dbname) {
		let returnObj = { message: '' };
		const client = new MongoClient(this.dbURL);
		try {
			await client.connect();
			const db = client.db(dbname);

			const cleanedData = value.map(doc => {
				const { _id, ...rest } = doc; // _id 필드 제거
				return rest;
			});

			let result = await db.collection(collname).insertMany(cleanedData)

			// // bulkWrite operation 준비
			// const operations = value.map(doc => ({
			// 	// updateOne: {
			// 	// 	filter: { timeID: doc.timeID }, // timeID를 unique key로 사용
			// 	// 	update: { $set: doc },
			// 	// 	upsert: true // 없으면 insert, 있으면 update
			// 	// }
			// 	insertOne: { document: doc }
			// }));

			// let result = await db.collection(collname).bulkWrite(operations);
			returnObj.data = result;


			returnObj.data = result.ops;
		} catch(e) {
			returnObj.message = `${collname} insertMany.catch.error=${e}`;
			console.log(returnObj.message);
		}

		client.close();	
		return returnObj;
	}

	bulkWrite = async (collname, bulkOperations, dbname=this.dbname) => {
		// console.log("bulkWrite.dbname=", dbname, "collname=", collname);
		let returnObj = { message: '' };
		if (bulkOperations.length == 0) return { message: "no data", data: {} };

		const client = new MongoClient(this.dbURL);
		try {
			await client.connect();
			const db = client.db(dbname);

			// 청크 단위로 나누어 실행
			const CHUNK_SIZE = 1000;
			for (let i = 0; i < bulkOperations.length; i += CHUNK_SIZE) {
				const chunkRecords = bulkOperations.slice(i, i + CHUNK_SIZE);
				returnObj = await db.collection(collname).bulkWrite(chunkRecords);
				console.log(`Processed ${i + chunkRecords.length} of ${bulkOperations.length} documents`);
				console.log("returnObj=", returnObj, collname, dbname);
			}
		} catch (e) {
			returnObj = { message: `bulkWrite.catch.${e}`, data: {} };
			console.log(returnObj.message);
		}
		return returnObj;
	}

//-----------------------------
	// distinct
	//		result = await mdb.distinct("test", "cat");
	//-----------------------------
	async distinct(collname, field, query={}, dbname=this.dbname) {
		let returnObj = { message: '' };
		const client = new MongoClient(this.dbURL);
		try {
			await client.connect();
			const db 				= client.db(dbname);
			returnObj.data 	= await db.collection(collname).distinct( field, query );
			/*
				[ 'test' ]
			*/
		}	catch(e) {
			returnObj.message = `${collname} distinct.catch.error=${e}`;
			console.log(returnObj.message);
		}
		client.close();	
		return returnObj;
	}

	//-----------------------------
	// findOne
	//		result = await mdb.findOne("test", { testID: 1 });
	//		[ { testID: 1, title: 'TITLE1---' } ]
	//-----------------------------
	async findOne(collname, query={}, projection={ _id:0 }, sort={ _id:1 }, dbname=this.dbname) {
		let returnObj = { message: '' };
		// console.log("~~~~~~~~~~~~~~~", collname, query, projection, dbname);
		const client = new MongoClient(this.dbURL);
		try {
			await client.connect();
			const db = client.db(dbname);
			let result = await db.collection(collname)
															.find(query)
															.project(projection)
															.sort(sort)
															.skip(0)
															.limit(1)
												.toArray();
			returnObj.data = (result.length == 0 ? {} : result[0]);
		} catch(e) {
			returnObj.message = `${collname} findOne.catch.error=${e}`;
			console.log(returnObj.message);
		}

		client.close();	
		return returnObj;
	}

	//-----------------------------
	// find
	//		result = await mdb.find("test", {});
	// 		[
	// 			{ testID: 1, title: 'TITLE1---' },
	// 			{ testID: 2, cat: 'test', title: 'title2...' },
	// 			{ testID: 3, cat: 'test', title: 'title3...' }
	// 		]
	//-----------------------------
	async find(collname, context=this.context, dbname=this.dbname) {
		let returnObj = { count: 0, message: '' };
		if ( context.query 			=== undefined ) context.query				= {};
		if ( context.projection	=== undefined ) context.projection	= { _id:0, };
		if ( context.skip 			=== undefined ) context.skip				= 0;
		if ( context.limit 			=== undefined ) context.limit				= 100;
		if ( context.sort 			=== undefined ) context.sort				= {};
		// context.projection = {  _id:0, ...context.projection };

		const client = new MongoClient(this.dbURL);
		// const client = new MongoClient(this.dbURL, {
		// 	serverApi: {
		// 			version: '1',
		// 			strict: true,
		// 			deprecationErrors: true
		// 	}
		// });
		// console.log("context.query=", context.query, collname);
		try {
			await client.connect();
			const db = client.db(dbname);
			// console.log("dbname=", dbname);

			returnObj.count	= await db.collection(collname).countDocuments( context.query);
			
			let result = await db.collection(collname)
																.find(context.query)
																		.project(	context.projection)
																		.sort(		context.sort)
																		.skip(		context.skip)
																		.limit(		context.limit)
																		.toArray();
			returnObj.data = result;
		} catch(e) {
			returnObj.message = `${collname} find.catch.error=${e}`;
			console.log(returnObj.message);
		}

		client.close();	
		return returnObj;
	}

	//-----------------------------
	// deleteOne
	//		result = await mdb.deleteOne("test", { testID:1 });
	// 		{
	// 			result: { n: 1, ok: 1 },
	// 			connection: Connection {},
	// 			message: BinMsg {},
	// 			deletedCount: 1
	// 		}	
	//-----------------------------
	async deleteOne(collname, query, dbname=this.dbname) {
		let returnObj = { message: '' };
		const client = new MongoClient(this.dbURL);
		try {
			await client.connect();
			const db = client.db(dbname);
			let result = await db.collection(collname).deleteOne(query);
			// console.log(result)																		
			returnObj.data = result.deletedCount;
		} catch(e) {
			returnObj.message = `${collname} deleteOne.catch.error=${e}`;
			console.log(returnObj.message);
		}

		client.close();	
		return returnObj;
	}

	//-----------------------------
	// deleteMany
	//		result = await mdb.deleteMany("test", { cat:"test" });
	// 		{
	// 			result: { n: 2, ok: 1 },
	// 			connection: Connection {},
	// 			message: BinMsg {},
	// 			deletedCount: 2
	// 		}	
	//-----------------------------
	async deleteMany(collname, query, dbname=this.dbname) {
		let returnObj = { message: '' };
		const client = new MongoClient(this.dbURL);
		try {
			await client.connect();
			const db = client.db(dbname);
			let result = await db.collection(collname).deleteMany(query);
			returnObj.data = result.deletedCount;
		} catch(e) {
			returnObj.message = `${collname} deleteMany.catch.error=${e}`;
			console.log(returnObj.message);
		}

		client.close();	
		return returnObj;
	};

	//-----------------------------
	// replaceOne: replaces the entire document
	//-----------------------------
	async replaceOne(collname, query, value, dbname=this.dbname) {
		let returnObj = { message: '' };
		const client = new MongoClient(this.dbURL);
		try {
			await client.connect();
			const db = client.db(dbname);
			let result = await db.collection(collname).replaceOne(query, value);
			// console.log(result)			
			returnObj.data = result.modifiedCount;
		} catch(e) {
			returnObj.message = `${collname} replaceOne.catch.error=${e}`;
			console.log(returnObj.message);
		}

		client.close();	
		return returnObj;
	}

	//-----------------------------
	// updateOne
	//		result = await mdb.updateOne("test", { testID:1}, { testID:1, title:"TITLE1---"});
	// 		{
	// 			result: { n: 1, nModified: 1, ok: 1 },
	// 			connection: Connection {},
	// 			message: BinMsg {},
	// 			modifiedCount: 1,
	// 			upsertedId: null,
	// 			upsertedCount: 0,
	// 			matchedCount: 1
	// 		}
	//-----------------------------
	async updateOne(collname, query, value, dbname=this.dbname) {
		let returnObj = { message: '' };
		const client = new MongoClient(this.dbURL);
		try {
			await client.connect();
			const db = client.db(dbname);

			let result = await db.collection(collname).updateOne(query, { $set: value }, { upsert: true });
			/*
			*/
			returnObj.data = {
				modifiedCount: result.modifiedCount,
				upsertedCount: result.upsertedCount,
				matchedCount: result.matchedCount,
			}
			// console.log("collection=", collname, "updateOne.result=", result, "query=", query, "\nvalue=", value );
		} catch(e) {
			returnObj.message = `${collname}, updateOne.catch.error=${e}`;
			// console.log(query, value );
			console.log(returnObj.message);
		}

		client.close();	
		return returnObj;
	}

	//-----------------------------
	// updateOneOp: query = { $unset: { cat: "" } }
	//		result = await mdb.updateOneOp("test", { testID:1}, { $unset: { cat: "" } });
	//-----------------------------
	async updateOneOp(collname, query, value, options={upsert: true}, dbname=this.dbname) {
		let returnObj = { message: '' };
		const client = new MongoClient(this.dbURL);
		try {
			await client.connect();
			const db = client.db(dbname);

			let result = await db.collection(collname).updateOne(query, value, options);
			// console.log(
			// 	"updateOne.modifiedCount", result.modifiedCount,
			// 	"updateOne.upsertedCount", result.upsertedCount,
			// 	"updateOne.matchedCount", result.matchedCount,
			// );
			returnObj.data = {
				modifiedCount: result.modifiedCount,
				upsertedCount: result.upsertedCount,
				matchedCount: result.matchedCount,
			}
		} catch(e) {
			returnObj.message = `${collname} updateOne.catch.error=${e}`;
			console.log(returnObj.message, query, value);
		}

		client.close();	
		return returnObj;
	}

	//-----------------------------
	// updateMany
	//-----------------------------
	async updateMany(collname, query, value, dbname=this.dbname) {
		let returnObj = { message: '' };
		const client = new MongoClient(this.dbURL);
		try {
			await client.connect();
			const db = client.db(dbname);
			let result = await db.collection(collname).updateMany(query, { $set: value }, { upsert: false } );
			// console.log(result)
			returnObj.data = result.modifiedCount;
		} catch(e) {
			returnObj.message = `${collname} updateMany.catch.error=${e}`;
			console.log(returnObj.message);
		}

		client.close();	
		return returnObj;
	}
	async updateManyOP(collname, query, value, dbname=this.dbname) {
		let returnObj = { message: '' };
		const client = new MongoClient(this.dbURL);
		try {
			await client.connect();
			const db = client.db(dbname);
			let result = await db.collection(collname).updateMany(query, value, { upsert: true } );
			// console.log(result)
			returnObj.data = result.modifiedCount;
		} catch(e) {
			returnObj.message = `${collname} updateManyOP.catch.error=${e}`;
			console.log(returnObj.message);
		}

		client.close();	
		return returnObj;
	}

	//-----------------------------
	// find & update: return the document with the modifications made on the update
	//-----------------------------
	async findOneAndUpdate(collname, query, value, options={upsert: true}, dbname=this.dbname) {
		let returnObj = { message: '' };
		const client = new MongoClient(this.dbURL);
		try {
			await client.connect();
			const db = client.db(dbname);
			let result = await db.collection(collname).findOneAndUpdate(query, value, options );		

			returnObj.data = value; // result.value // modify되기 전 record
		} catch(e) {
			returnObj.message = `${collname} modifyOne.catch.error=${e}`;
			console.log(returnObj.message);
		}

		client.close();	
		return returnObj;
	}

/*--------------------------------------
{
	"code" : 1,
	"title" : "title1",
	"author" : "author1",
	"publisher" : "publisher1",
	"pub_code" : 1001,
	"distributor" : [ 
			{
					"name" : "distributor1",
					"pub_code" : 2001,
					"sell_rate" : 60
			}, 
			{
					"name" : "distributor2",
					"pub_code" : 2002,
					"sell_rate" : 61
			}
	]
}

// find
db.test.find(
  { 
		"pub_code":1001,
		"distributor.pub_code": 2002 
  }
)

// insery sub document
db.test.update(
	{ "pub_code":1001 },
	{
		$push : { "distributor": { "name":"distributor3", "pub_code":203,"sell_rate":60 } } 
	}
)

// remove sub document
db.test.update(
	{ "pub_code":1001 },
	{
		$pull : { "distributor": { "pub_code": 2001 } } 
	}
)

// update sub document
db.pub.update(
	{ pub_code:1001, "distributor.pub_code":2002 }, 
	{
		$set: {"distributor.$": {"name":"distributor22","pub_code":20002,"rate":62.5}}
	}
)
--------------------------------------*/

	/******************************************************
		db.test.find(
			{ 
				"pub_code":1001,
				"distributor.pub_code": 2002 
			}
		)
	******************************************************/
	async findSub(collname, query, dbname=this.dbname) {
		let returnObj = { message: '' };
		const client = new MongoClient(this.dbURL);
		try {
			await client.connect();
			const db = client.db(dbname);
			let result = await db.collection(collname).find(query, { $set: value }, { upsert: true } );		

			returnObj.data = value; // result.value // modify되기 전 record
		} catch(e) {
			returnObj.message = `${collname} modifyOne.catch.error=${e}`;
			console.log(returnObj.message);
		}

		client.close();	
		return returnObj;
	}

	/******************************************************
		db.test.update(
			{ "pub_code":1001 },
			{
				$push : { "distributor": { "name":"distributor3", "pub_code":203,"sell_rate":60 } } 
			}
		)
	******************************************************/
	async insertSub(collname, query, value, dbname=this.dbname) {
		let returnObj = { message: '' };
		const client = new MongoClient(this.dbURL);
		try {
			await client.connect();
			const db = client.db(dbname);

			let result = await db.collection(collname).updateOne(query, { $push: value });
			/*
			*/
			returnObj.data = {
				modifiedCount: result.modifiedCount,
				upsertedCount: result.upsertedCount,
				matchedCount: result.matchedCount,
			}
			//console.log("updateOne.returnObj=", returnObj);
		} catch(e) {
			returnObj.message = `${collname} updateOne.catch.error=${e}`;
			console.log(returnObj.message);
		}

		client.close();	
		return returnObj;
	}


	/******************************************************
		db.pub.update(
			{ pub_code:1001, "distributor.pub_code":2002 }, 
			{
				$set: {"distributor.$": {"name":"distributor22","pub_code":20002,"rate":62.5}}
			}
		)
	******************************************************/
	async updateSub(collname, query, value, dbname=this.dbname) {
		let returnObj = { message: '' };
		const client = new MongoClient(this.dbURL);
		try {
			await client.connect();
			const db = client.db(dbname);

			// let svalue = {}
			// svalue[`${field}.$`] = value;
			console.log(query, value);
			let result = await db.collection(collname).updateOne(query, { $set: value }, { upsert: true });
			/*
			*/
			returnObj.data = {
				modifiedCount: result.modifiedCount,
				upsertedCount: result.upsertedCount,
				matchedCount: result.matchedCount,
			}
			//console.log("updateOne.returnObj=", returnObj);
		} catch(e) {
			returnObj.message = `${collname} updateOne.catch.error=${e}`;
			console.log(returnObj.message);
		}

		client.close();	
		return returnObj;
	}

	
	/******************************************************
		db.test.update(
			{ "pub_code":1001 },
			{
				$pull : { "distributor": { "pub_code": 2001 } } 
			}
		)
	******************************************************/
	async deleteSub(collname, query, subQuery, dbname=this.dbname) {
		let returnObj = { message: '' };
		const client = new MongoClient(this.dbURL);
		try {
			await client.connect();
			const db = client.db(dbname);

			let result = await db.collection(collname).updateOne(query, { $pull: subQuery }, { upsert: true });
			/*
			*/
			returnObj.data = {
				modifiedCount: result.modifiedCount,
				upsertedCount: result.upsertedCount,
				matchedCount: result.matchedCount,
			}
			//console.log("updateOne.returnObj=", returnObj);
		} catch(e) {
			returnObj.message = `${collname} updateOne.catch.error=${e}`;
			console.log(returnObj.message);
		}

		client.close();	
		return returnObj;
	}

	//-----------------------------
	async aggregate(collname, aggregate, dbname=this.dbname) {
		let returnObj = { message: '' };
	//console.log(JSON.stringify(context.aggregate));								
		const client = new MongoClient(this.dbURL);
		try {
			await client.connect();
			const db = client.db(dbname);

			let result = await db.collection(collname).aggregate(aggregate, { allowDiskUse: true }).toArray();
			// console.log(result)
	//console.log("result="+JSON.stringify(result));	
			returnObj.data = result;	
			returnObj.count = result.length;	
		} catch(e) {
			returnObj.message = `${collname} aggregate.catch.error=${e}`;
			console.log(returnObj.message);
		}

		client.close();	
		return returnObj;
	}

	//-----------------------------
	bufferToStream(buffer) {  
		let stream = new Duplex();
		stream.push(buffer);
		stream.push(null);
		return stream;
	}
	//-----------------------------
	// upload gridfs
	//-----------------------------
	async gridfsUpload(context=this.context, dbname=this.dbname) {
		let returnObj = { message: '' };
		const client = new MongoClient(this.dbURL);
		try {
			await client.connect();
			const db = client.db(dbname);

			const bucket = new mongodb.GridFSBucket(db);
			const reqFile = context.reqFile;  //multipart로 넘어와 	upload.any()로 filter하면 files[]array type,
																				//single('img')는, image file 단일 json으로 넘겨줌
			if (reqFile) {
				//const fileName = reqFile.originalname;      //reqFile.originalname은 은 유일하지 않아서
				const fileName = context.fileName;			//req.body.photoName사용
				const fileData = context.reqFile.buffer;
				const rStream  = await this.bufferToStream(fileData);
				await rStream.pipe(bucket.openUploadStream(fileName))
											.on('finish', function() {
													console.log("upload OK"); 
												})
											.on('error', function(error) {
													returnObj.message = `${fileName} openUploadStream.error=${error}`;
													console.log(returnObj.message);
												});
			}
		} catch(e) {
			returnObj.message = `${collname} findOne.catch.error=${e}`;
			console.log(returnObj.message);
		}

		client.close();	
		return returnObj;
	}

	//-----------------------------
	// download gridfs
	//-----------------------------
	async gridfsDownload(context=this.context, dbname=this.dbname) {
		let returnObj = { message: '' };
		const client = new MongoClient(this.dbURL);
		try {
			await client.connect();
			const db = client.db(dbname);

			let base64Chunks = '';
			const fileName = context.fileName;			//req.body.photoName사용
			let bucket   = new mongodb.GridFSBucket(db);           // bucket은 stream type
			bucket.openDownloadStreamByName(fileName)
					.on('data', function(data) {
						base64Chunks +=  data.toString('base64');
						console.log("upload OK");
					})
					.on('error', function(error) {
						returnObj.message = `${fileName} openDownloadStreamByName.error=${error}`;
						console.log(returnObj.message);
					})
					.on('end', function() {
						let binaryChunks = new Buffer(base64Chunks, 'base64').toString('binary');
						console.log("upload OK binaryChunks.", binaryChunks);
						returnObj.data = binaryChunks; 
					});
		} catch(e) {
			returnObj.message = `${collname} findOne.catch.error=${e}`;
			console.log(returnObj.message);
		}

		client.close();	
		return returnObj;
	}

		//-----------------------------
	// method
	//-----------------------------
	//----->
	projection(collection, contents) {
		console.log("projection.collection=", collection);
	}

	///////////////////////////////////////////////////////////////////////////////////
	async filtering(collection, record, project = {}) {
		if (_schemas[collection] === undefined) {
			await this.initializeFiltering();
		}

		const schemaArr = getSchemaProject(_schemas[collection], project); // project에 의해 schema 가져오기

		let returnObj = {};
		schemaArr.forEach( schema => {
			let field = record[schema.name];
			if (field === undefined) return;

			let ret;
			switch (schema.type) {
				case "array":
					if (returnObj[schema.name] === undefined) returnObj[schema.name] = [];
					ret = filteringArray(schema, field);
					returnObj[schema.name] = ret[schema.name];
					break;
				case "object":
					ret = filteringObject(schema, field)
					returnObj[schema.name] = ret[schema.name];
					break;
				default:
					ret = getValue(schema, field);
					if (ret[schema.name] !== undefined) returnObj[schema.name] = ret[schema.name];
					break;
			}
			// console.log(".............name=", schema.name, " value=", ret[schema.name]);
		})
		// console.log("-----end...", schemaArr);
		return returnObj;
	}  

	//-----> import scema
	async importSchema() {
		console.log("initialize.schemas...");
		const context = {
			query: {},
			limit: 100,
			skip: 0,
			projection: { _id:0, collection:1, schema:1 },
		}
		let returnObj = await this.find("mongoSchema", context);
		if (returnObj.message) return returnObj;

		_schemas = {};
		returnObj.data.forEach(function(sc) {
			_schemas[sc.collection] = sc.schema;
		})
	}

	async initializeFiltering() {
		console.log("initializeFiltering...");
		const context = {
			query: {},
			limit: 100,
			skip: 0,
			projection: { _id:0, collection:1, schema:1 },
		}
	
		let returnObj = await this.find("mongoSchema", context)
		if (returnObj.message) {
			console.log("schema.initializeFiltering.error.", returnObj.message);
			return;
		}
		_schemas = {};
		returnObj.data.forEach(function(sc) {
			_schemas[sc.collection] = sc.schema;
		})
	}

	

	//================================================
	//-----> transaction
	//================================================
	async execTransaction(callback) {
		console.log("1>start execTransaction...");
		let connection;
		try {
			console.log("9> bf getConnection");
			connection = await this.getConnection();
			console.log("9> bf beginTransaction");
			const result = await connection.beginTransaction();
console.log("9> bf callback");
			//--------------------------------------------
			await callback(connection);
			// if (await callback(connection)) {
			// 	await connection.commit();
			// } else {
			// 	await connection.rollback();
			// }
			//--------------------------------------------
			console.log("..............end execTransaction");
			return;
		} catch (e) {
			console.log("execTransaction.catch=", e);
			return;
			// connection.rollback();
		}
		// await connection.release();
	
	}
		
}

module.exports = MongoDB;

//----->
function filteringArray(schema, field) {
	let returnObj = {};
	returnObj[schema.name] = [];
	//-----> field array
	if (field === undefined || field === null) return returnObj;
// console.log(schema.name, "filteringArray=", field);	
	field.forEach(fld => {
		//-----> schema
		let retObj = {};
		schema.children.children.forEach(child => {
			// console.log("array.name=", child.name, ", type=", child.type, ", fld=", fld);
			switch (child.type) {
				case "object":
					let retobj = {};
					if (fld[child.name] === undefined) {
						const retobj = getValue(child, fld[child.name]);
						ret = retobj[child.name];
					} else {
						ret = fld[child.name];
					}
					break;
				case "array":
					console.log("<<<<<array.array.field=", fld[child.name], ", children=", child.children);
					break;
				default:
					ret = getValue(child, fld[child.name]);
					ret = (ret[child.name] === undefined ? "" : ret[child.name]);
					// console.log(child.type, ", array.schema.name=", schema.name, ", child.name=", child.name, ", ret=", ret);		
					break;
			}
			retObj[child.name] = ret;
		})
		returnObj[schema.name].push(retObj);
	})
	// console.log("@@@@@@@@@@@@@@@@@ {", schema.name + ":", returnObj[schema.name], "}");
	return returnObj;
}
//----->
function filteringObject(schema, field) {
	let returnObj = {};
	returnObj[schema.name] = {};

	schema.children.forEach(child => {
		let ret;
		switch (child.type) {
			case "object":
				let retobj = {};
				if (field[child.name] === undefined) {
					const retobj = getValue(child, field[child.name]);
					ret = retobj[child.name];
				} else {
					ret = field[child.name];
				}
				break;
			case "array":
				console.log("object.array.field=", field[child.name], ", children=", child.children);
				// ret = filteringArray(child.children, field[child.name]);
				break;
			default:
				ret = getValue(child, field[child.name]);
				ret = ret[child.name];
				break;
		}
		returnObj[schema.name][child.name] = ret;
	})
	return returnObj;
}

//----->
function getValue(schema, field) {
	let ret = {};
	if (schema.type === "object") {
		if (field === undefined || field === null) {
			let retobj = {}
			retobj[schema.name] = {};
			schema.children.forEach(sc => {
				// console.log("schema.name", schema.name, ", sc.name=", sc.name, ", sc.type=", sc.type)
				retobj[schema.name][sc.name] = (sc.type === "date" ? new Date() : sc.type === "integer" ? 0 : "");
			})
			// ret[schema.name] = retobj[schema.name];
			ret = retobj;
		} else {
			ret[schema.name] = field;
		}
	} else {
		if (field === undefined || field === null) {
			switch (schema.type) {
				case "date":
					field = new Date();
					break;
				case "integer":
					field = 0;
					break;
				default:
					field = "";
					break;
			}
		}
		ret[schema.name] = field;
	}
	return ret;
}
// project에
//	':0' 이 있으면 -> ':0' 이 없는 field 전체
//	':0' 이 없으면 -> ':1' 이 있는 field 만
function getSchemaProject(schemas, project) {
	let projExclude = [];
	let projInclude = [];
	let schemaArr = [];
	for (let no=0; no<Object.keys(project).length; no++) {
		const key = Object.keys(project)[no];
		if (key === "_id") continue;
		if (project[key] === 0) projExclude.push(key); else projInclude.push(key);
	}
	// console.log("......................1", projExclude, projInclude);
	if (projExclude.length > 0 || projInclude.length == 0) {
		schemaArr = schemas.filter(sc => { return ! projExclude.includes(sc.name); });
	} else {
		schemaArr = schemas.filter(sc => { return projInclude.includes(sc.name); });
	}

	return schemaArr;
}
