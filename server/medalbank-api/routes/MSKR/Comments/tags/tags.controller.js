const Services = require('./tags.service.js');

exports.create = async (req, res, next) => {
	try {
			const result = await Services.create();

			res.json(result);

	} catch (err) {
			console.log("controller.tags.create.catch.", err);
			next(err);
	}
}

exports.list = async (req, res, next) => {
	try {
			console.log("controller.tags.list.body.", req.body);

			const result = await Services.list(req.body);

			res.json(result);

	} catch (err) {
			console.log("controller.tags.list.catch.", err);
			next(err);
	}
}

exports.insert = async (req, res, next) => {
	try {
			console.log("controller.tags.insert.body.", req.body);

			const result = await Services.insert(req.body);

			res.json(result);

	} catch (err) {
			console.log("controller.tags.insert.catch.", err);
			next(err);
	}
}

exports.delete = async (req, res, next) => {
	try {
			console.log("controller.tags.delete.body.", req.params);

			const { commentID } = req.params;
			const result = await Services.delete(commentID);

			res.json(result);

	} catch (err) {
			console.log("controller.tags.delete.catch.", err);
			next(err);
	}
}