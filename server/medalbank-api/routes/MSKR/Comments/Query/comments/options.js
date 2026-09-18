const extend 			= require('node.extend');
const mongoCFG  	= require('../../Config/mongoCFG');
const utilLibrary	= require("../../Util/utilLibrary");

const _itemsPerPage = 20;

exports.Options = {
	//---------------------------
	options(body={}) {
		const skip 		= body.page ? Number(body.page) - 1 : 0;
		const limit 	= body.itemsPerPage ? Number(body.itemsPerPage) : _itemsPerPage;
		const context = { 
			query 			: {}, 
			projection	: body.projection ? body.projection : { _id: 0 },
			limit				: limit,
			skip				: (skip < 0 ? 0 : skip) * limit,
			sort				: { _id: -1 },
		}

		//-----> sort
		if (body.sort) {
			context.sort = body.sort;
		} else if (body.sortBy) {
			context.sort = {};
			const sortBy = body.sortBy ? body.sortBy : "_id";
			context.sort[sortBy]	= (body.sortDesc	=== 'asc' ? 1 : -1);
		}
	
		return context;
	},
}
