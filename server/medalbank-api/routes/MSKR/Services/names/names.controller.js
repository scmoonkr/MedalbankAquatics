const Services = require('./names.service.js');


exports.detail = async (req, res, next) => {
  try {
      console.log("controller.names.detail.params.", req.params);
      const result = await Services.detail(req.params);
      res.json(result);
  } catch (err) {
      console.log("controller.names.detail.catch.", err);
      next(err);
  }
}

exports.list = async (req, res, next) => {
  try {
      console.log("controller.names.list.body.", req.body);
      const result = await Services.list(req.body);
      res.json(result);
  } catch (err) {
      console.log("controller.names.list.catch.", err);
      next(err);
  }
}

exports.getNames = async (req, res, next) => {
  try {
      console.log("controller.names.getNames.body.", req.body);
      const result = await Services.getNames(req.body);
      res.json(result);
  } catch (err) {
      console.log("controller.names.getNames.catch.", err);
      next(err);
  }
}

exports.check = async (req, res, next) => {
  try {
      console.log("controller.names.check.body.", req.body);
      const result = await Services.check(req.body);
      res.json(result);
  } catch (err) {
      console.log("controller.names.check.catch.", err);
      next(err);
  }
}

exports.insert = async (req, res, next) => {
  try {
      console.log("controller.names.insert.body.", req.body);
      const result = await Services.insert(req.body);
      res.json(result);
  } catch (err) {
      console.log("controller.names.insert.catch.", err);
      next(err);
  }
}

exports.update = async (req, res, next) => {
  try {
      console.log("controller.names.update.body.", req.body);
      const result = await Services.update(req.body);
      res.json(result);
  } catch (err) {
      console.log("controller.names.update.catch.", err);
      next(err);
  }
}

exports.delete = async (req, res, next) => {
  try {
      console.log("controller.names.delete.params.", req.body);
      const result = await Services.delete(req.body);
      res.json(result);
  } catch (err) {
      console.log("controller.names.delete.catch.", err);
      next(err);
  }
}

exports.create = async (req, res, next) => {
  try {
      const result = await Services.create();
      res.json(result);
  } catch (err) {
      console.log("controller.names.create.catch.", err);
      next(err);
  }
}