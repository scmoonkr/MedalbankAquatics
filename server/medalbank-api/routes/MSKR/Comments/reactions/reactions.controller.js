const Services = require('./reactions.service');

exports.create = async (req, res, next) => {
  try {
      const result = await Services.create();

      res.json(result);

  } catch (err) {
      console.log("controller.reactions.insert.catch.", err);
      next(err);
  }
}

exports.update = async (req, res, next) => {
  try {
      console.log("controller.reactions.update.body.", req.body);

      const result = await Services.update(req.body);

      res.json(result);

  } catch (err) {
      console.log("controller.reactions.update.catch.", err);
      next(err);
  }
}
