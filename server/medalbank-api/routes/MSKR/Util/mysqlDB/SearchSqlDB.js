// var extend 		= require('node.extend');
var utilLibrary = require("../util/utilLibrary");
var mysqlCFG    = require('../Config/mysqlCFG');
var mysqlDB     = require('./MySqlDB');

const mysqldb		= new mysqlDB();

'use strict';

class SearchSqlDB {
	constructor(dbname=mysqlCFG.dbDongnebook, dbURL=mysqlCFG.host) {
		this._dbname			= dbname;
		this._context 		= {
					query				: {},
					projection	: { _id: 0 },
					skip				: 0,
					limit				: 20,
					sort				: { sqlNo: -1 },
		};
	}

	//-----------------------------
	// getter
	//-----------------------------
	get dbname() 				{ return this._dbname; }
	get context() 			{ return this._context; }

	//-----------------------------
	set dbname(dbn)   		{ this._dbname			= dbn; }
	set context(ctx)			{ 
		this._context.query				= ctx.query; 
		this._context.limit				= ctx.limit; 
		this._context.skip				= ctx.skip; 
		this._context.sort				= ctx.sort; 
		this._context.projection	= ctx.projection; 
	}

	//-----> options
	options(body={}) {
		let context = {
			sort	: {},
			limit	: 100,
			skip	: 0,
		}

		//-----> sort
		if (body.sortBy				!== undefined && body.sortBy			!== "" && body.sortBy.length > 0) {
			context.sort[body.sortBy]	= (body.sortDesc	=== 'asc' ? 1 : -1);
		}
		if (body.sort   			!== undefined) context.sort 			= body.sort;

		//-----> projection
		if (body.projection		!== undefined) {
			context.projection	= body.projection;
		} else {
			context.projection	= { _id: 0 };
		}
	
		//-----> pagination
		if (body.itemsPerPage !== undefined) context.limit			= Number(body.itemsPerPage);
		if (body.page 				!== undefined) context.skip 			= Number(body.page) - 1;
		context.skip					= (context.skip < 0 ? 0 : context.skip) * context.limit;
	
		return context;
	}

	/*************************************************
	find contents join indexes
	{
		type          : "titl",
		data          : "사람%",
		projection    : { cid:1, title:1, isbn:1 },
		sort          : { pubDate:-1 },
		itemsPerPage  : 10,
		page          : 1,
	}
	*************************************************/
	async findContents(body){

		const query = this.buildContentsQuery(body);
		let returnObj = { count: 0, data: [] };

		const result = await mysqldb.query(query.select);
		const resultCount = await mysqldb.query(query.selectCount);

		returnObj.data = result;
		returnObj.count = resultCount[0].count;

		return returnObj;
	}

	/*************************************************
	find contents join indexes
	{
		type          : "titl",
		data          : "사람%",
		projection    : { cid:1, title:1, isbn:1 },
		sort          : { pubDate:-1 },
		itemsPerPage  : 10,
		page          : 1,
	}
	*************************************************/
	async findHolding(body){

		const query = this.buildHoldingQuery(body);
		let returnObj = { count: 0, data: [] };

		const result = await mysqldb.query(query.select);
		const resultCount = await mysqldb.query(query.selectCount);

		returnObj.data = result;
		returnObj.count = resultCount[0].count;

		return returnObj;
	}

	/*************************************************
	build contents query
	{
		type          : "titl",
		data          : "사람%",
		projection    : { cid:1, title:1, isbn:1 },
		sort          : { pubDate:-1 },
		itemsPerPage  : 10,
		page          : 1,
	}

		SELECT *
		FROM contents, indexes
		WHERE contents.cid = indexes.c
					AND indexes.t = 'titl'
					AND indexes.r LIKE '학리심%'
		ORDER BY pubDate DESC
		LIMIT 0, 10
	*************************************************/
	buildContentsQuery(body) {
		// console.log(body);
	
		const context = this.options(body);
		console.log(context);
	
		let data   = body.data || "";
		let datato = body.datato || "";
		
		let where = "";
		let sort = "";
		let projection = "";
		// -----> projection
		Object.keys(context.projection).forEach((key) => {
			projection += `, c.${key}`;
		})
		projection = projection.length > 2 ? projection.substr(2) : "*";
	
		// -----> sort
		Object.keys(context.sort).forEach((key) => {
			sort += `, ${key} ${(context.sort[key] == -1 ? "DESC" : "ASC")}`;
		})
		if (sort.length > 2) sort = `ORDER BY ${sort.substr(2)}`;
	
		const limit 	= `LIMIT ${context.skip}, ${context.limit}`;
	
		// 1. data == "" -> newbook
		let cmd = body.type == undefined || body.type == "" ? "" : body.type;
	
		// -----> query
		let type = (cmd == "" ? "" : `AND i.t = '${cmd}'`);
		let reverse = `AND i.d`;
		let meta = "=";
		let search = data.trim();
		if (search.substr(0 ,1) == "%") {
			reverse = `AND i.r`;
			meta = "LIKE";
			search = search.split("").reverse().join("");
		} else if (search.slice(-1) == "%") {
			meta = "LIKE";
		}
	
		let selectCount = `
					SELECT COUNT(*) count
					FROM ${mysqlCFG.tableDongnebook.contents} c`;
	
		let select = `
					SELECT ${projection}
					FROM ${mysqlCFG.tableDongnebook.contents} c`;
	
		switch (cmd) {
			// -----> CID
			case "cid": // data, datato, data array
				//-----> check cid: 123,234,345,456,...
				let cids = data.split(",");
				console.log(cids, cids.length);
				if (cids.length > 1) {
						where = `WHERE cid IN (${cids})`;
				} else {
					if (datato != "") {
						where = `WHERE cid BETWEEN ${data} AND ${datato}`;
					} else {
						where = `WHERE cid = ${data}`;
					}
				}
				sort = "";
				limit = "";
				break;
			// -----> 출간일
			case "pubdate": // data, datato
				if (datato != "") {
					where = `WHERE pubDate BETWEEN '${data}' AND '${datato}'`;
				} else {
					where = `WHERE pubDate = '${data}'`;
				}
				break;
			// -----> 작업일자
			case "workdate": // data, datato
				if (datato != "") {
					where = `WHERE revised BETWEEN '${data}' AND '${datato}'`;
				} else {
					where = `WHERE updated = '${data}'`;
				}
				break;
			// -----> 작업자
			case "worker": //
				where = `WHERE reviser = '${data}'`;
				break;
	
			// -----> 신간도서
			case "newbook": // datato: from 기간
				let toDate = new Date();
				let fromDate = new Date();
				toDate.setDate(toDate.getDate() + 1);
				toDate.setMinutes(0);
				toDate.setHours(0);
				toDate.setSeconds(0);
						
				fromDate.setDate(toDate.getDate() - mysqlCFG.NEWBOOK_TERM);
				fromDate.setMinutes(0);
				fromDate.setHours(0);
				fromDate.setSeconds(0);
	
				where = `WHERE pubDate BETWEEN '${fromDate.toISOString().substr(0, 10)}' AND '${toDate.toISOString().substr(0, 10)}'`;
				break;
			// -----> index
			default:
			case "titl":
			case "auth":
			case "publ":
			case "subj":
				data = data.replace("%", "★");
				data = utilLibrary.normalizeString(data);
				data = data.replace("★", "%");
			case "isbn":
			case "cate":
				selectCount = `
								SELECT COUNT(*) AS count 
								FROM ${mysqlCFG.tableDongnebook.contents} c, ${mysqlCFG.tableDongnebook.index} i 
								WHERE c.cid = i.c 
											${type}
											${reverse} ${meta} '${search}'
								`;
				select = `
								SELECT ${projection} 
								FROM ${mysqlCFG.tableDongnebook.contents} c, ${mysqlCFG.tableDongnebook.index} i
								WHERE c.cid = i.c 
											${type}
											${reverse} ${meta} '${search}'
								`;
				where = "";
				break;
		}
		// 2. cid -> select contents
		// 3. isbn, kdc, ddc, pubdate
		// 4. title, author, publisher
		// newbook, isbn, cid, title, author, publisher, pubdate, kdc, subject
		let query = {
			select      : `${select}\n${where}\n${sort}\n${limit}`,
			selectCount : `${selectCount}\n${where}`
		}
	console.log(query.select);
		return query;
	}

	/*************************************************
	build holding contents query
	{
		type          : "titl",
		data          : "사람%",
		projection    : { cid:1, title:1, isbn:1 },
		sort          : { pubDate:-1 },
		itemsPerPage  : 10,
		page          : 1,
	}

	SELECT contents.cid, contents.isbn, contents.title, holding.*
	FROM contents, indexes, holding
	WHERE contents.cid = indexes.c AND indexes.c = holding.cid
				AND indexes.t = 'titl'
				AND indexes.r LIKE '학리심%'
	ORDER BY pubDate DESC
	LIMIT 0, 10

	SELECT COUNT(*) AS count
	FROM contents, indexes, holding
	WHERE contents.cid = indexes.c AND indexes.c = holding.cid
				AND indexes.t = 'titl'
				AND indexes.r LIKE '학리심%'
	ORDER BY pubDate DESC
	LIMIT 0, 10
	*************************************************/
	buildHoldingQuery(body) {
		const CONTENTS_FIELD = ["author","authors","blind","categories","cid","confirmed","confirmer","created","creator","deleted","deleter","editions","images","isbn","kdc","leader","price","pubCode","pubDate","publisher","recordState","revised","reviser","series","setisbn","status","subjects","subTitle","tags","thumbnail","title","titles","type","user"];
		const HOLDING_FIELD = ["acquisitionType","anotherName","authorSymbol","bookshelf","copy","donor","donorDate","donorID","edition","myKdc","library","libraryCode","loanStatus","ownLibraryCode","myPrice","registDate","registNo","volume"];
		// console.log(body);
	
		const context = this.options(body);
		console.log(context);
	
		let data   = body.data || "";
		let datato = body.datato || "";
		
		let where = "";
		let sort = "";
		let projection = "";
		// -----> projection
		Object.keys(context.projection).forEach((key) => {
			const coll = HOLDING_FIELD.find((e) => e == key) == undefined ? "c" : "h";
			projection += `, ${coll}.${key}`;
		})
		projection = projection.length > 2 ? projection.substr(2) : "*";
	
		// -----> sort
		Object.keys(context.sort).forEach((key) => {
			const coll = HOLDING_FIELD.find((e) => e == key) == undefined ? "c" : "h";
			sort += `, ${coll}.${key} ${(context.sort[key] == -1 ? "DESC" : "ASC")}`;
		})
		if (sort.length > 2) sort = `ORDER BY ${sort.substr(2)}`;
	
		const limit 	= `LIMIT ${context.skip}, ${context.limit}`;
	
		// 1. data == "" -> newbook
		let cmd = body.type == undefined || body.type == "" ? "all" : body.type;
	
		// -----> query
		let type = (cmd == "" ? "" : `AND i.t = '${cmd}'`);
		let reverse = `AND i.d`;
		let meta = "=";
		let search = data.trim();
		if (search.substr(0 ,1) == "%") {
			reverse = `AND i.r`;
			meta = "LIKE";
			search = search.split("").reverse().join("");
		} else if (search.slice(-1) == "%") {
			meta = "LIKE";
		}
	
		let selectCount = `
					SELECT COUNT(*) count
					FROM ${mysqlCFG.tableDongnebook.contents} c, ${mysqlCFG.tableDongnebook.holding} h`;
	
		let select = `
					SELECT ${projection}
					FROM ${mysqlCFG.tableDongnebook.contents} c, ${mysqlCFG.tableDongnebook.holding} h`;
	
		switch (cmd) {
			// -----> CID
			case "cid": // data, datato, data array
				//-----> check cid: 123,234,345,456,...
				let cids = data.split(",");
				console.log(cids, cids.length);
				if (cids.length > 1) {
						where = `WHERE cid IN (${cids}) AND c.cid = h.cid`;
				} else {
					if (datato != "") {
						where = `WHERE cid BETWEEN ${data} AND ${datato} AND c.cid = h.cid`;
					} else {
						where = `WHERE cid = ${data} AND c.cid = h.cid`;
					}
				}
				sort = "";
				limit = "";
				break;
			// -----> 출간일
			case "pubdate": // data, datato
				if (datato != "") {
					where = `WHERE pubDate BETWEEN '${data}' AND '${datato}' AND c.cid = h.cid`;
				} else {
					where = `WHERE pubDate = '${data}' AND c.cid = h.cid`;
				}
				break;
			// -----> 작업일자
			case "workdate": // data, datato
				if (datato != "") {
					where = `WHERE revised BETWEEN '${data}' AND '${datato}' AND c.cid = h.cid`;
				} else {
					where = `WHERE updated = '${data}' AND c.cid = h.cid`;
				}
				break;
			// -----> registNo
			case "registNo": // data, datato
				if (datato != "") {
					where = `WHERE h.registNo BETWEEN '${data}' AND '${datato}' AND c.cid = h.cid`;
				} else {
					where = `WHERE h.registNo = '${data}' AND c.cid = h.cid`;
				}
				break;
			// -----> 작업자
			case "worker": //
				where = `WHERE reviser = '${data}' AND c.cid = h.cid`;
				break;
	
			// -----> 신간도서
			case "newbook": // datato: from 기간
				let toDate = new Date();
				let fromDate = new Date();
				toDate.setDate(toDate.getDate() + 1);
				toDate.setMinutes(0);
				toDate.setHours(0);
				toDate.setSeconds(0);
						
				fromDate.setDate(toDate.getDate() - mysqlCFG.NEWBOOK_TERM);
				fromDate.setMinutes(0);
				fromDate.setHours(0);
				fromDate.setSeconds(0);
	
				where = `WHERE pubDate BETWEEN '${fromDate.toISOString().substr(0, 10)}' AND '${toDate.toISOString().substr(0, 10)}' AND c.cid = h.cid`;
				break;
			// -----> index
			case "titl":
			case "auth":
			case "publ":
			case "subj":
				data = data.replace("%", "★");
				data = utilLibrary.normalizeString(data);
				data = data.replace("★", "%");
			case "isbn":
			case "cate":
				selectCount = `
								SELECT COUNT(*) AS count 
								FROM ${mysqlCFG.tableDongnebook.contents} c, ${mysqlCFG.tableDongnebook.index} i, ${mysqlCFG.tableDongnebook.holding} h
								WHERE c.cid = i.c AND c.cid = h.cid
											${type}
											${reverse} ${meta} '${search}'
								`;
				select = `
								SELECT ${projection} 
								FROM ${mysqlCFG.tableDongnebook.contents} c, ${mysqlCFG.tableDongnebook.index} i, ${mysqlCFG.tableDongnebook.holding} h
								WHERE c.cid = i.c AND c.cid = h.cid
											${type}
											${reverse} ${meta} '${search}'
								`;
				where = "";
				break;
			default:
				where = `WHERE c.cid = h.cid`;
				break;
		}
		// 2. cid -> select contents
		// 3. isbn, kdc, ddc, pubdate
		// 4. title, author, publisher
		// newbook, isbn, cid, title, author, publisher, pubdate, kdc, subject
		let query = {
			select      : `${select}\n${where}\n${sort}\n${limit}`,
			selectCount : `${selectCount}\n${where}`
		}
	console.log(query.select);
		return query;
	}

}

module.exports = SearchSqlDB;

