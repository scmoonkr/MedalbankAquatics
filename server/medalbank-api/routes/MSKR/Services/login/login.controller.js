// const Services = require('../Services/login.service');
const Services = require('./login.service.js');


exports.login = async (req, res, next) => {
  console.log("controller.login.", req.body);
  try {
      const result = await Services.login(req.body);
      if (result.message == "") {
        res.setHeader('Authorization', `Bearer ${result.token}`);
        // delete result.token;
      }
      res.json(result);
  } catch (err) {
      console.log("controller.login.login.catch.", err);
      next(err);
  }
}

exports.logout = async (req, res, next) => {
  console.log("logout...");
  try {
      const result = await Services.logout(req.body, req.token);
      res.json(result);
  } catch (err) {
      console.log("controller.login.logout.catch.", err);
      next(err);
  }
}

exports.signup = async (req, res, next) => {
  try {
      const result = await Services.signup(req.body);
      res.json(result);
  } catch (err) {
      console.log("controller.login.signup.catch.", err);
      next(err);
  }
}

exports.changePassword = async (req, res, next) => {
  try {
      const result = await Services.changePassword(req.body);
      res.json(result);
  } catch (err) {
      console.log("controller.login.changePassword.catch.", err);
      next(err);
  }
}

//####################################################################
//######### Confirm ##################################################
//####################################################################


exports.jwtPrivateKey = async (req, res, next) => {
  try {
      console.log("controller.login.jwtPrivateKey.body.", req.body);

      const { loginID } = req.body;
      const result = await Services.jwtPrivateKey(loginID);

      res.json(result);

  } catch (err) {
      console.log("controller.login.jwtPrivateKey.catch.", err);
      next(err);
  }
}

exports.setPasswordByRegistrationNo = async (req, res, next) => {
  try {
      console.log("login.controller.login.setPasswordByRegistrationNo.body.", req.body);

      const result = await Services.setPasswordByRegistrationNo(req.body);

      res.json(result);

  } catch (err) {
      console.log("controller.login.setPasswordByRegistrationNo.catch.", err);
      next(err);
  }
}

exports.resetPassword = async (req, res, next) => {
  try {
      console.log("controller.login.resetPassword.body.", req.body);

      const result = await Services.resetPassword(req.body);

      res.json(result);

  } catch (err) {
      console.log("controller.login.resetPassword.catch.", err);
      next(err);
  }
}

exports.lostPasswordEmail = async (req, res, next) => {
  try {
      console.log("controller.login.lostPasswordEmail.body.", req.body);

      const result = await Services.lostPasswordEmail(req.body);

      res.json(result);

  } catch (err) {
      console.log("controller.login.lostPasswordEmail.catch.", err);
      next(err);
  }
}

exports.checkEmail = async (req, res, next) => {
  try {
      console.log("controller.login.checkEmail.body.", req.body);

      const result = await Services.checkEmail(req.body);

      res.json(result);

  } catch (err) {
      console.log("controller.login.checkEmail.catch.", err);
      next(err);
  }
}

exports.checkUserID = async (req, res, next) => {
  try {
      console.log("controller.login.checkUserID.body.", req.body);

      const result = await Services.checkUserID(req.body);

      res.json(result);

  } catch (err) {
      console.log("controller.login.checkUserID.catch.", err);
      next(err);
  }
}

exports.checkNickname = async (req, res, next) => {
  try {
      console.log("controller.login.checkNickname.body.", req.body);

      const result = await Services.checkNickname(req.body);

      res.json(result);

  } catch (err) {
      console.log("controller.login.checkNickname.catch.", err);
      next(err);
  }
}

exports.lostPasswordEmail = async (req, res, next) => {
  try {
      console.log("controller.login.lostPasswordEmail.body.", req.body);

      const result = await Services.lostPasswordEmail(req.body);

      res.json(result);

  } catch (err) {
      console.log("controller.login.lostPasswordEmail.catch.", err);
      next(err);
  }
}

exports.loginLostPassword = async (req, res, next) => {
  try {
      console.log("controller.login.loginLostPassword.body.", req.body);

      const result = await Services.loginLostPassword(req.body);

      res.json(result);

  } catch (err) {
      console.log("controller.login.loginLostPassword.catch.", err);
      next(err);
  }
}

exports.lostPasswordChange = async (req, res, next) => {
  try {
      console.log("controller.login.lostPasswordChange.body.", req.body);

      const result = await Services.lostPasswordChange(req.body);

      res.json(result);

  } catch (err) {
      console.log("controller.login.lostPasswordChange.catch.", err);
      next(err);
  }
}