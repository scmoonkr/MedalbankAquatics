// var extend 		= require('node.extend');
const { resolveInclude } = require('ejs');
var mysql2  	= require('mysql2/promise');
var mysqlCFG  = require('../Config/mysqlCFG');
var utilLibrary = require("../util/utilLibrary");

'use strict';

// var sqlPoolOption = {
// 		host				: "175.207.29.182", 
//     user				: 'webuser',
//     password 		: 'web1234',
// 		port 				: 3306, //port mysql 
//     database		: 'dongnebook',
// 		//connectionLimit		: 2000,
// 	    //waitForConnections	: false
// 	};

// var sqlPool = {};
// var sqlPool = null;

class MySqlDB {
	constructor(dbname=mysqlCFG.dbMSK, dbURL=mysqlCFG.host) {
		this._sqlPoolOption = {
			host				: dbURL, 
			user				: 'webuser',
			password 		: 'web1234',
			port 				: 3306, //port mysql 
			database		: dbname,
			//connectionLimit		: 2000,
			//waitForConnections	: false
		};

		this._sqlPool			= this.createPool(this._sqlPoolOption);
		this._dbURL				= dbURL;
		this._dbname			= dbname;
		this._context 		= {
					query				: {},
					projection	: {},
					skip				: 0,
					limit				: 20,
					sort				: {},
		};
	}

	//-----------------------------
	// getter
	//-----------------------------
	get sqlPoolOption() { return this._sqlPoolOption; }
	get sqlPool() 			{ return this._sqlPool; }
	get dbURL() 				{ return this._dbURL; }
	get dbname() 				{ return this._dbname; }
	get context() 			{ return this._context; }

	//-----------------------------
	set sqlPoolOption(opt){ this._sqlPoolOption	= opt; }
	set sqlPool(pool)			{ this._sqlPool			= pool; }
	set dbURL(dbn)   			{ this._dbURL				= dbURL; }
	set dbname(dbn)   		{ this._dbname			= dbn; }
	set context(ctx)			{ 
		this._context.query				= ctx.query; 
		this._context.limit				= ctx.limit; 
		this._context.skip				= ctx.skip; 
		this._context.sort				= ctx.sort; 
		this._context.projection	= ctx.projection; 
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

	//========================================================
	// code: book,post,comment,reply,event
	// idx: cid,postID,commentID,…
	// type: name, title, tag,
	// userNo
	//========================================================
	getKeywordLink(code, type, userNo, data) {
		const codeAnd		= (code == undefined   || code == ""   ? "" : `code = '${code.trim()}' AND`);
		const typeAnd		= (type == undefined   || type == ""   ? "" : `type = '${type.trim()}' AND`);
		const userNoAnd	= (userNo == undefined || userNo == "" ? "" : `userNo = '${Number(userNo)}' AND`);

		const value = (data||"").replace("%", "").replace("%", "");
		const norm = utilLibrary.normalizeString(value);

		let where = "1";
		if (norm != "") {
			if (data.substr(0, 1) == "%") {
				if (data.slice(-1) == "%") {
					//-----> '%한국%'
					where = `data LIKE '%${norm}%'`;
				} else {
					//-----> '%한국'
					where = `reverse LIKE '%${norm.substr(1).split("").reverse().join("")}'`;
				}
			} else if (data.slice(-1) == "%") {
					//-----> '한국%'
					where = `data LIKE '${norm}%'`;
			} else {
					//-----> '한국'
					where = `data = '${norm}'`;
			}
		}
		console.log(`code=${code}, type=${type}, userNo=${userNo}, data=${data}, where =${where}`);

		const sql = `
			IN (
				SELECT idx 
				FROM ${mysqlCFG.tableMSK.keywordLink} 
				WHERE ${codeAnd} ${typeAnd} ${userNoAnd}
					kid IN (
							SELECT kid 
							FROM ${mysqlCFG.tableMSK.keywords} 
							WHERE ${where}
						)
			)`;
console.log("=======================");
console.log(sql);
console.log("=======================");

		return sql;
	}

	//========================================================
	async setKeywordLinkTransaction(connection, kwd, clear=false) {
		console.log("setKeywordLink=", kwd, ", clear=", clear);

		if (kwd.data 	== undefined || kwd.data 	== "") return -1;
		if (kwd.code 	== undefined || kwd.code 	== "") return -1;
		if (kwd.type 	== undefined || kwd.type 	== "") return -1;
		if (kwd.idx 	== undefined || kwd.idx 	== "") return -1;
		if (kwd.userNo== undefined || kwd.userNo== "") kwd.userNo = 0;

		const normalize = utilLibrary.normalizeString(kwd.data);
		const norm = (normalize != "" ? normalize : kwd.data);
		if (norm == "") return -1;

		// let connection;
		let result;
		const link = {
			code		: kwd.code,
			type		: kwd.type,
			idx			: Number(kwd.idx),
			userNo	: Number(kwd.userNo),
			kid			: 0,
		};

		try {
			console.log("start index.transaction...");

			const keyword = {
				data		: norm,
				reverse	: (kwd.reverse ? norm.split("").reverse().join("") : ""),
			};

			let sql = "";

			//---------------------------------------------------------------
			//-----> 0. delete keywordLink
			//---------------------------------------------------------------
			if (clear) {
				sql = `DELETE FROM ${mysqlCFG.tableMSK.keywordLinkX} WHERE idx=${kwd.idx}`;
				result = await connection.query(sql);
				console.log("............clear ok", link.idx);
			}

			//---------------------------------------------------------------
			//-----> 1. find keyword.kid
			//---------------------------------------------------------------
			sql = `
					SELECT DISTINCT kid 
					FROM ${mysqlCFG.tableMSK.keywordsX} 
					WHERE data='${norm}'
				`;
			result = await connection.query(sql);
			console.log(">>>............select.kid ok");
			if (result[0].length > 0) {
				//---------------------------------------------------------------
				//-----> 2. get keyword.kid
				//---------------------------------------------------------------
				link.kid = result[0][0].kid;
				console.log("............select.kid exists", link.kid);
			} else {
				//---------------------------------------------------------------
				//-----> 3. insert keyword.kid
				//---------------------------------------------------------------
				sql = `
						INSERT INTO ${mysqlCFG.tableMSK.keywordsX}
							(data, reverse)
						VALUES 
							('${keyword.data}', '${keyword.reverse}');
					`;
					console.log("bf keywordX");
					result = await connection.query(sql);
				link.kid = result[0].insertId;
				console.log(">>>............insert.kid ok", link.kid);
			}

			//---------------------------------------------------------------
			//-----> 4. modify(insert of update) keywordLink
			//---------------------------------------------------------------
			sql = `
					INSERT INTO ${mysqlCFG.tableMSK.keywordLinkX} 
						(code, idx, type, userNo, kid)
					VALUES
						('${kwd.code}','${kwd.idx}','${kwd.type}','${kwd.userNo}','${link.kid}' )
					ON DUPLICATE KEY UPDATE
						code='${kwd.code}', idx='${kwd.idx}', type='${kwd.type}', userNo='${kwd.userNo}', kid='${link.kid}';
			`;
			console.log("bf keywordLinkX");
			result = await connection.query(sql);
			console.log(">>>............modify.kid ok", link.kid);

			//-----------------------------------------------------
			// await connection.commit();
			// console.log("............commit.kid ok", link.kid);
		} catch (e) {
			console.log("setKeywordLink.catch=", kwd, ", clear=", clear);
			// connection.rollback();
			link.kid = -1;
		}
		// await connection.release();
		// console.log("............release.kid ok", link.kid);
	
		console.log("end index.transaction...link.kid=", link.kid);

		return link.kid;
	}
	async setKeywordLink(kwd, clear=false) {
		// console.log("setKeywordLink=", kwd, ", clear=", clear);

		if (kwd.data 	== undefined || kwd.data 	== "") return -1;
		if (kwd.code 	== undefined || kwd.code 	== "") return -1;
		if (kwd.type 	== undefined || kwd.type 	== "") return -1;
		if (kwd.idx 	== undefined || kwd.idx 	== "") return -1;
		if (kwd.userNo== undefined || kwd.userNo== "") kwd.userNo = 0;

		const norm = (kwd.normalize ? utilLibrary.normalizeString(kwd.data) : kwd.data);
		if (norm == "") return -1;

		let connection;
		let result;
		const link = {
			code		: kwd.code,
			type		: kwd.type,
			idx			: Number(kwd.idx),
			userNo	: Number(kwd.userNo),
			kid			: 0,
		};

		try {
			console.log("start index.transaction...");

			connection = await this.getConnection();
			result = await connection.beginTransaction();

			const keyword = {
				data		: norm,
				reverse	: (kwd.reverse ? norm.split("").reverse().join("") : ""),
			};

			let sql = "";

			//---------------------------------------------------------------
			//-----> 0. delete keywordLink
			//---------------------------------------------------------------
			if (clear) {
				sql = `DELETE FROM ${mysqlCFG.tableMSK.keywordLinkX} WHERE idx=${kwd.idx}`;
				result = await connection.query(sql);
				// console.log("............clear ok", link.idx);
			}

			//---------------------------------------------------------------
			//-----> 1. find keyword.kid
			//---------------------------------------------------------------
			sql = `
					SELECT DISTINCT kid 
					FROM ${mysqlCFG.tableMSK.keywordsX} 
					WHERE data='${norm}'
				`;
			result = await connection.query(sql);
			// console.log("............select.kid ok");
			if (result[0].length > 0) {
				//---------------------------------------------------------------
				//-----> 2. get keyword.kid
				//---------------------------------------------------------------
				link.kid = result[0][0].kid;
				// console.log("............select.kid exists", link.kid);
			} else {
				//---------------------------------------------------------------
				//-----> 3. insert keyword.kid
				//---------------------------------------------------------------
				sql = `
						INSERT INTO ${mysqlCFG.tableMSK.keywordsX}
							(data, reverse)
						VALUES 
							('${keyword.data}', '${keyword.reverse}');
					`;
				result = await connection.query(sql);
				link.kid = result[0].insertId;
				// console.log("............insert.kid ok", link.kid);
			}

			//---------------------------------------------------------------
			//-----> 4. modify(insert of update) keywordLink
			//---------------------------------------------------------------
			sql = `
					INSERT INTO ${mysqlCFG.tableMSK.keywordLinkX} 
						(code, idx, type, userNo, kid)
					VALUES
						('${kwd.code}','${kwd.idx}','${kwd.type}','${kwd.userNo}','${link.kid}' )
					ON DUPLICATE KEY UPDATE
						code='${kwd.code}', idx='${kwd.idx}', type='${kwd.type}', userNo='${kwd.userNo}', kid='${link.kid}';
			`;
			result = await connection.query(sql);
			// console.log("............modify.kid ok", link.kid);

			//-----------------------------------------------------
			await connection.commit();
			// console.log("............commit.kid ok", link.kid);
		} catch (e) {
			console.log("setKeywordLink.catch=", kwd, ", clear=", clear);
			connection.rollback();
			link.kid = -1;
		}
		await connection.release();
		// console.log("............release.kid ok", link.kid);
	
		console.log("end index.transaction...link.kid=", link.kid);

		return link.kid;
	}

	//========================================================
	async clearKeywords() {
		try {
			console.log("start clearKeywords...");

			const sql = `
				DELETE 
				FROM ${mysqlCFG.tableMSK.keywords} 
				WHERE kid NOT IN 
					(
						SELECT kid 
						FROM ${mysqlCFG.tableMSK.keywordLink}
					)
			`;
			
			
			console.log("clearKeywords.sql----->", sql);
			result = await this.sqlPool.query(sql);
		} catch (e) {
			console.log("clearKeywords.catch=" + e);
		}
		console.log("end clearKeywords...");
	}

	//================================================
	//-----> transaction
	//================================================
	async getConnection() {
		const connection = await this.sqlPool.getConnection(async conn => conn);
		return connection;
	}

	//================================================
	//-----> options
	//================================================
	options(body={}) {
		body.sortBy 			= body.sortBy || "";
		body.sortDesc 		= body.sortDesc || "";
		body.projection 	= body.projection || "";
		body.itemsPerPage	= body.itemsPerPage || "";
		body.page 				= body.page || "";
		
		let context 			= body;
		context.sort 			= {};

		//-----> sort
		if (body.sortBy !== "") {
			context.sort[body.sortBy]	= (body.sortDesc	=== 'asc' ? 1 : -1);
		}

		//-----> projection
		if (body.projection		!== "") {
			context.projection	= body.projection;
		} else {
			context.projection	= {};
		}
	
		//-----> pagination
		context.limit	= (body.itemsPerPage !== "" ? Number(body.itemsPerPage) : mysqlCFG.defalut.limitTable);
		context.skip 	= (body.page 				 !== "" ? Number(body.page) - 1 : 0);
		context.skip	= (context.skip < 0 ? 0 : context.skip) * context.limit;

		return context;
	}

	//================================================
	//-----> create pool
	//================================================
	async createPool(poolOption) {
		if (this.sqlPool != null) return;
		this.sqlPool = await mysql2.createPool(poolOption);
		// console.log("mysql2>SQL.createPool started..."+JSON.stringify(poolOption));
	}
	
	//================================================
	//-----> update record
	//================================================
	modifyOneSQL(collection, value) {
		if (collection == undefined || collection == "") {
			console.log("modifyOneSQL collection not found !!");
			return "";
		}
		value	= (value == undefined ? {} : value);

		let sql = {
			sql: "",
			val: [],
		}

		let fields = "";
		let values = "";
		let duplicate = "";
		Object.keys(value).forEach(function(key) {
			fields += `, ${key}`;
			values += ", ?";
			duplicate += `, ${key} = ?`;
			sql.val.push(`${value[key]}`);
		})

		sql.sql = `
					INSERT INTO ${collection}
							( ${fields.substr(2)} )
					VALUES
							( ${values.substr(2)} )
					ON DUPLICATE KEY UPDATE
							${duplicate.substr(2)}`;
		//---------->
		sql.val = [...sql.val, ...sql.val];
// console.log("sql=", sql.sql);
		return sql;
	}
	//-----------------------------------------
	async modifyOne(collection, value) {
		let result = -1;
		try {
			const sql = this.modifyOneSQL(collection, value);
			if (sql != "") {
				result = await this.sqlPool.query(sql.sql, sql.val);
				// console.log("\n\n\n\n", result, "\n\n\n\n");
				return result[0].affectedRows;
			}
		} catch (e) {
			result.message = `mysql.updateOne.catch.${e}`;
			console.log(result.message);
		}
		
		return result;
	}
	
	//================================================
	//-----> update record
	//================================================
	updateSQL(collection, query, value) {
		if (collection == undefined || collection == "") {
			console.log("updateSQL collection not found !!");
			return "";
		}
		value	= (value == undefined ? {} : value);

		let sql = {
			sql: "",
			val: [],
		}

		let fields = "";
		let values = [];
		Object.keys(value).forEach(function(key) {
			fields += `, ${key}=?`;
			values += ", ?";
			sql.val.push(`${value[key]}`);
		})

		sql.sql = `UPDATE ${collection} SET ${fields.substr(2)}`;
		if (query != "") {
			sql.sql += " WHERE " + query;
		}
		
		return sql;
	}
	//-----------------------------------------
	async update(collection, query, value){
		let result = -1;
		try {
			const sql = this.updateSQL(collection, query, value);
			if (sql != "") {
				result = await this.sqlPool.query(sql.sql, sql.val);
				return result[0].affectedRows;
			}
		} catch (e) {
			console.log(`mysql.updateOne.catch.${e}`);
		}
		
		return result;
	};

	//================================================
	//-----> insert many records
	//================================================
	async upsert(collection, query, value){
		let result = -1;
		try {
			let res = await this.findOne(collection, query);
			if (res.count == 0) {
				//-----> insert
				const sql = this.insertOneSQL(collection, value);
				if (sql != "") {
					res = await this.sqlPool.query(sql.sql, sql.val);
					result = res[0].insertId;
				}
			} else {
				//-----> update
				const sql = this.updateSQL(collection, query, value);
				if (sql != "") {
					res = await this.sqlPool.query(sql.sql, sql.val);
					result = res[0].affectedRows;
				}
			}
		} catch (e) {
			console.log(`mysql.upsert.catch.${e}`);
		}

		return result;
	};

	//================================================
	//-----> insert many records
	//================================================
	insertManySQL(collection, values) {
		if (collection == undefined || collection == "") {
			console.log("insertManySQL collection not found !!");
			return "";
		}
		values = (values == undefined ? {} : values);

		let sql = {
			sql: "",
			val: [],
		}

		let fields = "";

		values.forEach(function(value) {
			if (fields == "") {
				Object.keys(value).forEach(function(key) {
					fields += `, '${key}'`;
					// valueField += ", ?";
				})
			}
			let record = [];
			Object.keys(value).forEach(function(key) {
				if (typeof value[key] == "string") {
					record.push(`${value[key]}`);
				} else {
					record.push(value[key]);
				}
			})
			sql.val.push(record);
		})

		sql.sql = `
				INSERT INTO 
					${collection}
					(${fields.substr(2)})
				VALUES ?;`;
		// console.log("\n\n\n\n", sql.val, "\n\n", sql.sql, "\n\n\n\n");
		
		return sql;
	}
	//-----------------------------------------
	async insertMany(collection, values){
		console.log(collection, values.length);
		let result = -1;
		try {
			const sql = this.insertManySQL(collection, values);
			console.log("+++++", sql.sql, sql.val);
			if (sql.sql != "") {
				result = await this.sqlPool.query(sql.sql, [sql.val]);
				console.log(result[0]);
				return result[0].affectedRows;
			}
		} catch (e) {
			console.log(`mysql.insertMany.catch.${e}`);
		}
		return result;		
	}

	//================================================
	// -----> insert one record
	//================================================
	insertOneSQL(collection, value) {
		if (collection == undefined || collection == "") {
			console.log("insertOneSQL collection not found !!");
			return "";
		}
		value = (value == undefined ? "" : value);

		let sql = {
			sql: "",
			val: [],
		}

		let fields = "";
		let valueStr = "";
		Object.keys(value).forEach(function(key) {
			// fields += ", '" + key + "'";
			fields += `, ${key}`;
			valueStr += ", ?";
			sql.val.push(`${value[key]}`);
		})
	
		//----------> sql
		sql.sql = `
			INSERT INTO 
				${collection}
				(${fields.substr(2)})
			VALUES 
				(${valueStr.substr(2)});`;
		//----------> sql

		return sql;
	}
	//-----------------------------------------
	async insertOne(collection, value){
		let result = -1;
		try {
			const sql = this.insertOneSQL(collection, value);
			if (sql != "") {
				result = await this.sqlPool.query(sql.sql, sql.val);
				return result[0].insertId;
				// console.log("\n\n\n\n", result[0], "\n\n\n\n");
			}
		} catch (e) {
			result.message = `mysql.insertOne.catch.${e}`;
			console.log(result.message);
		}
		return result;
	};

	//================================================
	// findOne
	//		result = await mdb.findOne("test", { testID: 1 });
	//		[ { testID: 1, title: 'TITLE1---' } ]
	//-----------------------------
	findOneSQL(collection, query, projection) {
		if (collection == undefined || collection == "") {
			console.log("findOneSQL collection not found !!");
			return "";
		}
		projection	= (projection == undefined ? "" : projection);

		let fields = "";
		Object.keys(projection).forEach((key) => {
			if (projection[key] == 1) fields += ", " + key;
		})
		fields = fields == "" ? "*" : fields.substr(2);
		query = (query == "" ? "1" : query);
		//---------->
		const sql 	= `
						SELECT
								${fields} 
						FROM
								${collection}
						WHERE ${query};`;
		//---------->

		// console.log(`findOneSQL-----------> ${sql};`);
		return sql;
	}
	//-----------------------------------------
	async findOne(collection, query="", projection={}){
		let returnObj = { count: 0, data: {} };

		try {
			const sql = this.findOneSQL(collection, query, projection);
			if (sql != "") {
				const result = await this.sqlPool.execute(sql);

				returnObj.data = result[0].length > 0 ? JSON.parse(JSON.stringify(result[0][0])) : {};
				returnObj.count = result[0].length;
			}
		} catch (e) {
			returnObj.message = `mysql.findOne.catch.${e}`;
			console.log(returnObj.message);
		}
		
		return returnObj;
	};

	/*************************************************
	context = {
		query: "",	// where
		value: "",
		projection: {},
		sort: {},
		skip: 0,
		limit: 100,
	}
	*************************************************/
	findSQL(collection, context) {
		let sql = {};
		if (collection == undefined || collection == "") {
			console.log("findSQL collection not found !!");
			return "";
		}
		context.projection	= (context.projection == undefined	? "" : context.projection);
		context.sort 				= (context.sort == undefined 				? "" : context.sort);
		context.skip 				= (context.skip == undefined 				? 0 : context.skip);
		context.limit 			= (context.limit == undefined 			? mysqlCFG.defalut.limitTable : context.limit);

		let fields = "";
		if (Object.keys(context.projection).length > 0) {
			Object.keys(context.projection).forEach((key) => {
				if (context.projection[key] == 1) fields += ", " + key;
			})
		}
		fields = fields == "" ? "*" : fields.substr(2);

		// -----> make sort
		sql.sort = "";
		Object.keys(context.sort).forEach((key) => {
			sql.sort += ", " + key + (context.sort[key] == -1 ? " DESC" : " ASC");
		})

		if (context.query == "") context.query = "1";

		sql.select 	= `SELECT ${fields} FROM ${collection}`;
		sql.where 	= `WHERE ${context.query}`;
		sql.sort 		= (sql.sort.length > 2 ? `ORDER BY ${sql.sort.substr(2)}` : "");
		sql.limit 	= `LIMIT ${context.skip}, ${context.limit}`;
		// console.log(`mysql2----------->find.\n${sql.select} ${sql.where} ${sql.sort} ${sql.limit}`);

		return sql;
	}
	//-----------------------------------------
	async find(collection, context={ query:"", skip: 0, limit: 20, sort: {} }){
		// LIMIT skip, limit
		// ORDER BY field1 ASC, field2 DESC, ...
		// projection = { cid:1, isbn:1, title: 1 } -> "cid, isbn, title"
		let result = { count: 0, data: [] };

		let sql = this.findSQL(collection, context);
		if (sql == "") {
			result.message = `findSQL.sql error: collection=${collection} context=${JSON.stringify(context)}`;
			console.log(result.message);
			return result;
		}

		try {
			sql = `${sql.select} ${sql.where} ${sql.sort} ${sql.limit}`;
			console.log(sql);
			const res = await this.sqlPool.query(sql);
			result.data = JSON.parse(JSON.stringify(res[0]));

			let resCount = await this.sqlPool.query(`SELECT COUNT(*) value FROM ${collection} ${sql.where}`);
			console.log("resCount===>", resCount[0]);
			result.count = resCount[0][0].value;

		} catch (e) {
			result.message = `mysql.find.catch.${e}`;
			console.log(`${result.message} sql=`, sql);
		}

		return result;
	};

	//================================================
	//-----> delete record
	//================================================
	deleteSQL(collection, query) {
		let sql = "";
		if (collection == undefined || collection == "") {
			console.log("findSQL collection not found !!");
			return sql;
		}
		if (query == undefined || query == "") {
			console.log("findSQL query not found !!");
			return sql;
		}

		sql = `DELETE FROM ${collection} WHERE ${query}`;

		return sql;
	}
	//-----------------------------------------
	async delete(collection, query){
		let result = { message: ""};
		try {
			const sql = this.deleteSQL(collection, query);
			if (sql != "") {
				result = await this.sqlPool.query(sql);
				// console.log("\n\n\n\n", result, "\n\n\n\n");
				return result[0];
			}
		} catch (e) {
			result.message = `mysql.delete.catch.${e}`;
			console.log(result.message);
		}
		return "";
		
	}

	//================================================
	//-----> DISTINCT
	//================================================
	distinctSQL(collection, field, query) {
		if (collection == undefined || collection == "") {
			console.log("distinctSQL collection not found !!");
			return "";
		}
		if (field == undefined || field == "") {
			console.log("distinctSQL field not found !!");
			return "";
		}
		query = (query == undefined ? "" : ` WHERE ${query}`);

		const sql = `SELECT DISTINCT ${field} FROM ${collection} ${query}`;

		return sql;
	}
	//-----------------------------------------
	async distinct(collection, field, query=""){
		let value = [];
		try {
			const sql = this.distinctSQL(collection, field, query);
			if (sql != "") {
				const result = await this.sqlPool.query(sql);
				result[0].forEach((data) => {
					value.push(data[field]);
				})
			}
		} catch (e) {
			value.message = `mysql.distinct.catch.${e}`;
			console.log(value.message);
		}
		return value;
	}

	//================================================
	//-----> COUNT
	//================================================
	countSQL(collection, query) {
		if (collection == undefined || collection == "") {
			console.log("countSQL collection not found !!");
			return "";
		}
		query = (query == undefined ? "1" : query);

		//-----------------------------------------------------------------
		let sql = `SELECT COUNT(*) AS value FROM ${collection} WHERE ${query}`;
		//-----------------------------------------------------------------
		return sql;
	}
	//-----------------------------------------
	async count(collection, query){
		let value = -1;
		try {
			const sql = this.countSQL(collection, query);
			if (sql != "") {
				const result = await this.sqlPool.query(sql);
				value = result[0][0].value;
			}
		} catch (e) {
			console.log("mysql.count.catch.", e);
		}

		return value;
	}

	//================================================
	//-----> MAX
	//================================================
	maxSQL(collection, field, query="") {
		if (collection == undefined || collection == "") {
			console.log("maxSQL collection not found !!");
			return "";
		}
		if (field == undefined || field == "") {
			console.log("maxSQL field not found !!");
			return "";
		}
		if (query == undefined) {
			console.log("maxSQL query not found !!");
			return "";
		}
		//-----------------------------------------------------------------
		let sql = `SELECT MAX(${field}) AS value FROM ${collection}`;
		//-----------------------------------------------------------------

		if (query != "") {
			sql += " WHERE " + query;
		}

		return sql;
	}
	//-----------------------------------------
	async max(collection, field, query=""){
		let max = 1;
		try {
			const sql = this.maxSQL(collection, field, query);
			if (sql != "") {
				const result = await this.sqlPool.query(sql);
				max = result[0][0].value + 1;
			}
		} catch (e) {
			console.log("mysql.max.catch.", e);
		}
		
		return max;
	}

	//================================================
	//-----> select
	//================================================
	async select(sql, value, countSql=""){
		let returnObj = { message: "", count: 0, data: [] };
		if (sql == undefined || sql == "") {
			returnObj.message = "select sql not found !!";
			console.log("select.ret=", returnObj.message);
			return returnObj;
		}

		try {
// console.log("~~~~~~~~~~~~~~~~~~~~~~~~~~~~", sql);			
			const result = await this.sqlPool.query(sql, value||"");
			returnObj.data = result[0];

			if (countSql != "") {
				let res = await this.sqlPool.query(countSql, value);
				if (res[0].length == 0 || res[0][0].count == undefined) {
					returnObj.count = res[0].length
				} else {
					returnObj.count = res[0][0].count;
				}
			}
		} catch (e) {
			returnObj.message = `mysql.select.catch.${e}`;
			console.log("seletc=", returnObj.message);
			returnObj.count = returnObj.data.length;
		}
		return JSON.parse(JSON.stringify(returnObj));
	};

	//================================================
	//-----> Query
	//================================================
	async query(queryStr, queryVal=""){
		if (queryStr == undefined || queryStr == "") {
			console.log("query collection not found !!");
			return [];
		}

		// console.log("mysql2>query...", queryStr, queryVal);
		const results = await this.sqlPool.query(queryStr, queryVal);
		var rows = JSON.parse(JSON.stringify(results[0]));
		return rows;
	}

	//================================================
	//-----> Excute
	//================================================
	async execute(queryStr, queryVal=""){
		if (queryStr == undefined || queryStr == "") {
			console.log("execute collection not found !!");
			return;
		}

		try {
			console.log("mysql2>execute...", queryStr, queryVal);
			const results = await this.sqlPool.execute(queryStr, queryVal);
			return results[0];
		} catch (e) {
			console.log("========", e);
		}
		return "";
	}
	//================================================
	// ----->
	async sleep(ms=500) {
		return new Promise(resolve => {
				setTimeout(resolve, ms)
		})
	}

}

module.exports = MySqlDB;
