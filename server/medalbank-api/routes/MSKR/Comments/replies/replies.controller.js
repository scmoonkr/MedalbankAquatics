const Services = require('../Services/replies.service');

exports.create = async (req, res, next) => {
  try {
      const result = await Services.create();

      res.json(result);

  } catch (err) {
      console.log("controller.replies.create.catch.", err);
      next(err);
  }
}


exports.summary = async (req, res, next) => {
  try {
      console.log("controller.replies.summary.body.", req.params);

      const { workoutID } = req.params;
      const result = await Services.summary(workoutID);

      res.json(result);

  } catch (err) {
      console.log("controller.replies.summary.catch.", err);
      next(err);
  }
}


exports.list = async (req, res, next) => {
  try {
      console.log("controller.replies.list.body.", req.body);

      const result = await Services.list(req.body);

      res.json(result);

  } catch (err) {
      console.log("controller.replies.list.catch.", err);
      next(err);
  }
}

exports.detail = async (req, res, next) => {
  try {
      console.log("controller.replies.detail.body.", req.params);

      const { workoutID } = req.params;
      const result = await Services.detail(workoutID);

      res.json(result);

  } catch (err) {
      console.log("controller.replies.detail.catch.", err);
      next(err);
  }
}

exports.insert = async (req, res, next) => {
  try {
      console.log("controller.replies.insert.body.", req.body);

      const result = await Services.insert(req.body);

      res.json(result);

  } catch (err) {
      console.log("controller.replies.insert.catch.", err);
      next(err);
  }
}

exports.update = async (req, res, next) => {
  try {
      console.log("controller.replies.update.body.", req.body);

      const result = await Services.update(req.body);

      res.json(result);

  } catch (err) {
      console.log("controller.replies.update.catch.", err);
      next(err);
  }
}

exports.delete = async (req, res, next) => {
  try {
      console.log("controller.replies.delete.body.", req.params);

      const { workoutID } = req.params;
      const result = await Services.delete(workoutID);

      res.json(result);

  } catch (err) {
      console.log("controller.replies.delete.catch.", err);
      next(err);
  }
}