const Services = require('./pools.service');


exports.PoolController = {
  create: async (req, res, next) => {
    try {
        const result = await Services.create();
        res.json(result);
    } catch (err) {
        console.log("controller.pools.create.catch.", err);
        next(err);
    }
  },
  savePoolWithImage: async (req, res, next) => {
    try {
        // console.log("controller.pools.savePoolWithImage.body.", req.body);
        const result = await Services.savePoolWithImage(req);
        res.json(result);
    } catch (err) {
        console.log("controller.pools.savePoolWithImage.catch.", err);
        next(err);
    }
  },
  detail: async (req, res, next) => {
    try {
        // console.log("controller.pools.detail.params.", req.params);
        const result = await Services.detail(req.params);
        res.json(result);
    } catch (err) {
        console.log("controller.pools.detail.catch.", err);
        next(err);
    }
  },
  list: async (req, res, next) => {
    try {
        // console.log("controller.pools.list.body.", req.body);
        const result = await Services.list(req.body);
        res.json(result);
    } catch (err) {
        console.log("controller.pools.list.catch.", err);
        next(err);
    }
  },
  view: async (req, res, next) => {
    try {
        // console.log("controller.pools.view..body.", req.body);
        const result = await Services.view(req.body);
        res.json(result);
    } catch (err) {
        console.log("controller.pools.view.catch.", err);
        next(err);
    }
  },
  names: async (req, res, next) => {
    try {
        // console.log("controller.pools.names.body.", req.body);
        const result = await Services.names(req.body);
        res.json(result);
    } catch (err) {
        console.log("controller.pools.names.catch.", err);
        next(err);
    }
  },
  
  //####################################################################
  //######### Confirm ##################################################
  //####################################################################
  insert: async (req, res, next) => {
    try {
        // console.log("controller.pools.insert.body.", req.body);
        const result = await Services.insert(req.body);
        res.json(result);
    } catch (err) {
        console.log("controller.pools.insert.catch.", err);
        next(err);
    }
  },
  update: async (req, res, next) => {
    try {
        // console.log("controller.pools.update.body.", req.body);
        const result = await Services.update(req.body);
        res.json(result);
    } catch (err) {
        console.log("controller.pools.update.catch.", err);
        next(err);
    }
  },
  updateDelete: async (req, res, next) => {
    try {
        // console.log("controller.pools.updateDelete.body.", req.body);
        const result = await Services.updateDelete(req.body);
        res.json(result);
    } catch (err) {
        console.log("controller.pools.updateDelete.catch.", err);
        next(err);
    }
  },
  delete: async (req, res, next) => {
    try {
        // console.log("controller.pools.delete.params.", req.params);
        const result = await Services.delete(req.params);
        res.json(result);
    } catch (err) {
        console.log("controller.pools.delete.catch.", err);
        next(err);
    }
  },
}
