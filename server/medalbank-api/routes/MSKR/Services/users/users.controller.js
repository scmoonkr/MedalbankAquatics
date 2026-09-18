const Services = require('./users.service');



exports.setUser = async (req, res, next) => {
  try {
      console.log("controller.users.setUser.body.", req.body);
      const result = await Services.setUser(req.body);
      res.json(result);
  } catch (err) {
      console.log("controller.users.setUser.catch.", err);
      next(err);
  }
}

//##################################################################
//########################## confirm ###############################
//##################################################################




exports.searchNames = async (req, res, next) => {
  try {
      console.log("controller.users.searchNames.body.", req.body);
      const result = await Services.searchNames(req.body);
      res.json(result);
  } catch (err) {
      console.log("controller.users.searchNames.catch.", err);
      next(err);
  }
}

exports.checkEmail = async (req, res, next) => {
  try {
      console.log("controller.users.checkEmail.body.", req.body);
      const result = await Services.checkEmail(req.body);
      res.json(result);
  } catch (err) {
      console.log("controller.users.checkEmail.catch.", err);
      next(err);
  }
}

exports.checkNickname = async (req, res, next) => {
  try {
      console.log("controller.users.checkNickname.body.", req.body);
      const result = await Services.checkNickname(req.body);
      res.json(result);
  } catch (err) {
      console.log("controller.users.checkNickname.catch.", err);
      next(err);
  }
}

exports.settings = async (req, res, next) => {
  try {
      console.log("controller.users.settings.body.", req.body);
      const result = await Services.settings(req.body);
      res.json(result);
  } catch (err) {
      console.log("controller.users.settings.catch.", err);
      next(err);
  }
}

exports.summary = async (req, res, next) => {
  try {
      console.log("controller.users.summary.params.", req.params);
      const result = await Services.summary(req.params);
      res.json(result);
  } catch (err) {
      console.log("controller.users.summary.catch.", err);
      next(err);
  }
}

exports.questions = async (req, res, next) => {
  try {
      console.log("controller.users.questions.params.", req.params);
      const result = await Services.questions(req.params);
      res.json(result);
  } catch (err) {
      console.log("controller.users.questions.catch.", err);
      next(err);
  }
}

exports.updatePublic = async (req, res, next) => {
  try {
      console.log("controller.users.updatePublic.body.", req.body);
      const result = await Services.updatePublic(req.body);
      res.json(result);
  } catch (err) {
      console.log("controller.users.updatePublic.catch.", err);
      next(err);
  }
}

exports.detail = async (req, res, next) => {
  // try {
      console.log("new.controller.users.detail.params.", req.params);
      const result = await Services.detail(req.params);
      res.json(result);
  // } catch (err) {
  //     console.log("controller.users.detail.catch.", err);
  //     next(err);
  // }
}

exports.brief = async (req, res, next) => {
  try {
      console.log("controller.users.brief.params.", req.params);
      const result = await Services.brief(req.params);
      res.json(result);
  } catch (err) {
      console.log("controller.users.brief.catch.", err);
      next(err);
  }
}

exports.list = async (req, res, next) => {
  try {
      console.log("controller.users.list.body.", req.body);
      const result = await Services.list(req.body);
      res.json(result);
  } catch (err) {
      console.log("controller.users.list.catch.", err);
      next(err);
  }
}

exports.insert = async (req, res, next) => {
  try {
      console.log("controller.users.insert.body.", req.body);
      const result = await Services.insert(req.body);
      res.json(result);
  } catch (err) {
      console.log("controller.users.insert.catch.", err);
      next(err);
  }
}

exports.update = async (req, res, next) => {
  try {
      console.log("controller.users.update.body.", req.body);
      const result = await Services.update(req.body);
      res.json(result);
  } catch (err) {
      console.log("controller.users.update.catch.", err);
      next(err);
  }
}

exports.setPassword = async (req, res, next) => {
  try {
      console.log("controller.users.setPassword.body.", req.body);
      const result = await Services.setPassword(req.body);
      res.json(result);
  } catch (err) {
      console.log("controller.users.setPassword.catch.", err);
      next(err);
  }
}

exports.updateDelete = async (req, res, next) => {
  try {
      console.log("controller.users.updateDelete.params.", req.params);
      const result = await Services.updateDelete(req.params);
      res.json(result);
  } catch (err) {
      console.log("controller.users.updateDelete.catch.", err);
      next(err);
  }
}

exports.delete = async (req, res, next) => {
  try {
      console.log("controller.users.delete.params.", req.params);
      const result = await Services.delete(req.params);
      res.json(result);
  } catch (err) {
      console.log("controller.users.delete.catch.", err);
      next(err);
  }
}

exports.create = async (req, res, next) => {
  try {
      const result = await Services.create();
      res.json(result);
  } catch (err) {
      console.log("controller.users.create.catch.", err);
      next(err);
  }
}