// const Services = require('../Services/login.service');
const Services = require('./share.service.js');


exports.athlete = async (req, res, next) => {
  try {
      const result = await Services.athlete(req.params);
      res.send(result);
  } catch (err) {
      console.log("controller.share.athlete.catch.", err);
      next(err);
  }
}

exports.time = async (req, res, next) => {
  try {
      const result = await Services.time(req.params);
      res.send(result);
  } catch (err) {
      console.log("controller.share.times.catch.", err);
      next(err);
  }
}
