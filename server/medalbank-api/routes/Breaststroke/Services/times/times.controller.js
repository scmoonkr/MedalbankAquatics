const Services = require('./times.service');



exports.detail = async (req, res, next) => {
  try {
      const result = await Services.detail(req.params);
      res.json(result);
  } catch (err) {
      console.log("controller.times.detail.catch.", err);
      next(err);
  }
}

exports.view = async (req, res, next) => {
  try {
      const result = await Services.view(req.params);
      res.json(result);
  } catch (err) {
      console.log("controller.times.view.catch.", err);
      next(err);
  }
}

exports.list = async (req, res, next) => {
  try {
      const result = await Services.list(req.body);
      res.json(result);
  } catch (err) {
      console.log("controller.times.list.catch.", err);
      next(err);
  }
}

exports.delete = async (req, res, next) => {
  try {
      const result = await Services.delete(req.params);
      res.json(result);
  } catch (err) {
      console.log("controller.times.delete.catch.", err);
      next(err);
  }
}
exports.saveTimeWithImage = async (req, res, next) => {
  try {
      const result = await Services.saveTimeWithImage(req);
      res.json(result);
  } catch (err) {
      console.log("controller.times.saveTimeWithImage.catch.", err);
      next(err);
  }
}


exports.updateTimesMSKR = async (req, res, next) => {
  try {
      console.log("controller.times.updateTimesMSKR.body.", req.body);
      const result = await Services.updateTimesMSKR(req.body);
      res.json(result);
  } catch (err) {
      console.log("controller.times.updateTimesMSKR.catch.", err);
      next(err);
  }
}


//####################################################################
//######### Confirm ##################################################
//####################################################################
