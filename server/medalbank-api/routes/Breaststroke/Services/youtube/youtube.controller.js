const Services = require('./youtube.service');


exports.YoutubeController = {
  create: async (req, res, next) => {
    try {
        const result = await Services.create();
        res.json(result);
    } catch (err) {
        console.log("controller.youtubes.create.catch.", err);
        next(err);
    }
  },
  detail: async (req, res, next) => {
    try {
        console.log("controller.youtubes.detail.params.", req.params);
        const result = await Services.detail(req.params);
        res.json(result);
    } catch (err) {
        console.log("controller.youtubes.detail.catch.", err);
        next(err);
    }
  },
  list: async (req, res, next) => {
    try {
        console.log("controller.youtubes.list.body.", req.body);
        const result = await Services.list(req.body);
        res.json(result);
    } catch (err) {
        console.log("controller.youtubes.list.catch.", err);
        next(err);
    }
  },
  
  //####################################################################
  //######### Confirm ##################################################
  //####################################################################
  insert: async (req, res, next) => {
    try {
        console.log("controller.youtubes.insert.body.", req.body);
        const result = await Services.insert(req.body);
        res.json(result);
    } catch (err) {
        console.log("controller.youtubes.insert.catch.", err);
        next(err);
    }
  },
  update: async (req, res, next) => {
    try {
        console.log("controller.youtubes.update.body.", req.body);
        const result = await Services.update(req.body);
        res.json(result);
    } catch (err) {
        console.log("controller.youtubes.update.catch.", err);
        next(err);
    }
  },
  delete: async (req, res, next) => {
    try {
        console.log("controller.youtubes.delete.params.", req.params);
        const result = await Services.delete(req.params);
        res.json(result);
    } catch (err) {
        console.log("controller.youtubes.delete.catch.", err);
        next(err);
    }
  },
}
