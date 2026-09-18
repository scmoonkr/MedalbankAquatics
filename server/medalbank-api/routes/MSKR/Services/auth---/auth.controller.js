const Services = require('./auth.service');
exports.AuthController = {

  login: async (req, res, next) => {
    try {
        const result = await Services.login(req.body);
        res.json(result);
    } catch (err) {
        console.log("controller.athletes.login.catch.", err);
        next(err);
    }
  },

  logout: async (req, res, next) => {
    try {
        const result = await Services.logout(req.body);
        res.json(result);
    } catch (err) {
        console.log("controller.athletes.logout.catch.", err);
        next(err);
    }
  },

  signup: async (req, res, next) => {
    try {
        const result = await Services.signup(req.body);
        res.json(result);
    } catch (err) {
        console.log("controller.athletes.signup.catch.", err);
        next(err);
    }
  },

  changePassword: async (req, res, next) => {
    try {
        const result = await Services.changePassword(req.body);
        res.json(result);
    } catch (err) {
        console.log("controller.athletes.changePassword.catch.", err);
        next(err);
    }
  },

  findPassword: async (req, res, next) => {
    try {
        const result = await Services.findPassword(req.body);
        res.json(result);
    } catch (err) {
        console.log("controller.athletes.findPassword.catch.", err);
        next(err);
    }
  },

  resetPassword: async (req, res, next) => {
    try {
        const result = await Services.resetPassword(req.body);
        res.json(result);
    } catch (err) {
        console.log("controller.athletes.resetPassword.catch.", err);
        next(err);
    }
  },

  refreshToken: async (req, res, next) => {
    try {
        const result = await Services.refreshToken(req.body);
        res.json(result);
    } catch (err) {
        console.log("controller.athletes.refreshToken.catch.", err);
        next(err);
    }
  },

  me: async (req, res, next) => {
    try {
        const result = await Services.me(req.body);
        res.json(result);
    } catch (err) {
        console.log("controller.athletes.me.catch.", err);
        next(err);
    }
  },
}