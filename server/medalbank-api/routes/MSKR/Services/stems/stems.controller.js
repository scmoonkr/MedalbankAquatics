const Services = require('./stems.service');


exports.StemController = {
  create: async (req, res, next) => {
    try {
        const result = await Services.create();
        res.json(result);
    } catch (err) {
        console.log("controller.stems.create.catch.", err);
        next(err);
    }
  },
  list: async (req, res, next) => {
        console.log("controller.stems.list.body.", req.body);
    try {
        const result = await Services.list(req.body);
        res.json(result);
    } catch (err) {
        console.log("controller.stems.list.catch.", err);
        next(err);
    }
  },
  detail: async (req, res, next) => {
    try {
        const result = await Services.detail(req.body);
        res.json(result);
    } catch (err) {
        console.log("controller.stems.detail.catch.", err);
        next(err);
    }
  },
  
  update: async (req, res, next) => {
    try {
        const result = await Services.update(req.body);
        res.json(result);
    } catch (err) {
        console.log("controller.stems.update.catch.", err);
        next(err);
    }
  },
  delete: async (req, res, next) => {
    try {
        const result = await Services.delete(req.params);
        res.json(result);
    } catch (err) {
        console.log("controller.stems.delete.catch.", err);
        next(err);
    }
  },
}
