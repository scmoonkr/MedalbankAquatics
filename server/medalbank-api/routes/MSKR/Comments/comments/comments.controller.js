const Services = require('./comments.service.js');

exports.create = async (req, res, next) => {
	try {
			const result = await Services.create();

			res.json(result);

	} catch (err) {
			console.log("controller.comments.create.catch.", err);
			next(err);
	}
}


exports.view = async (req, res, next) => {
	try {
			console.log("controller.comments.view.body.", req.params);

			const { commentsID } = req.params;
			const result = await Services.view(commentsID);

			res.json(result);

	} catch (err) {
			console.log("controller.comments.view.catch.", err);
			next(err);
	}
}
exports.viewList = async (req, res, next) => {
	try {
			console.log("controller.comments.viewList.body.", req.params);

			const { commentsID } = req.params;
			const result = await Services.viewList(commentsID);

			res.json(result);

	} catch (err) {
			console.log("controller.comments.viewList.catch.", err);
			next(err);
	}
}


exports.list = async (req, res, next) => {
	try {
			console.log("controller.comments.list.body.", req.body);

			const result = await Services.list(req.body);

			res.json(result);

	} catch (err) {
			console.log("controller.comments.list.catch.", err);
			next(err);
	}
}

exports.detail = async (req, res, next) => {
	try {
			console.log("controller.comments.detail.body.", req.params);

			const { commentsID } = req.params;
			const result = await Services.detail(commentsID);

			res.json(result);

	} catch (err) {
			console.log("controller.comments.detail.catch.", err);
			next(err);
	}
}

exports.insert = async (req, res, next) => {
	try {
			console.log("controller.comments.insert.body.", req.body);

			const result = await Services.insert(req.body);

			res.json(result);

	} catch (err) {
			console.log("controller.comments.insert.catch.", err);
			next(err);
	}
}

exports.insertOLD = async (req, res, next) => {
	try {
			console.log("controller.comments.insertOLD.body.", req.body);

			const result = await Services.insertOLD(req.body);

			res.json(result);

	} catch (err) {
			console.log("controller.comments.insertOLD.catch.", err);
			next(err);
	}
}

exports.update = async (req, res, next) => {
	try {
			console.log("controller.comments.update.body.", req.body);

			const result = await Services.update(req.body);

			res.json(result);

	} catch (err) {
			console.log("controller.comments.update.catch.", err);
			next(err);
	}
}

exports.updateDelete = async (req, res, next) => {
	try {
			console.log("controller.comments.updateDelete.body.", req.body);

			const result = await Services.updateDelete(req.body.commentID);

			res.json(result);

	} catch (err) {
			console.log("controller.comments.updateDelete.catch.", err);
			next(err);
	}
}

exports.delete = async (req, res, next) => {
	try {
			console.log("controller.comments.delete.body.", req.params);

			const { commentID } = req.params;
			const result = await Services.delete(commentID);

			res.json(result);

	} catch (err) {
			console.log("controller.comments.delete.catch.", err);
			next(err);
	}
}