const Services = require('./items.service');


exports.ItemController = {
  create: async (req, res, next) => {
    try {
        const result = await Services.create();
        res.json(result);
    } catch (err) {
        console.log("controller.items.create.catch.", err);
        next(err);
    }
  },
  saveItemWithImage: async (req, res, next) => {
    try {
        console.log("controller.items.saveItemWithImage.body.", req.body);
        const result = await Services.saveItemWithImage(req);
        res.json(result);
    } catch (err) {
        console.log("controller.items.saveItemWithImage.catch.", err);
        next(err);
    }
  },
  detail: async (req, res, next) => {
    try {
        console.log("controller.items.detail.params.", req.params);
        const result = await Services.detail(req.params);
        res.json(result);
    } catch (err) {
        console.log("controller.items.detail.catch.", err);
        next(err);
    }
  },
  list: async (req, res, next) => {
    try {
        console.log("controller.items.list.body.", req.body);
        const result = await Services.list(req.body);
        res.json(result);
    } catch (err) {
        console.log("controller.items.list.catch.", err);
        next(err);
    }
  },
  view: async (req, res, next) => {
    try {
        console.log("controller.items.view..body.", req.body);
        const result = await Services.view(req.body);
        res.json(result);
    } catch (err) {
        console.log("controller.items.view.catch.", err);
        next(err);
    }
  },
  
  //####################################################################
  //######### Confirm ##################################################
  //####################################################################
  insert: async (req, res, next) => {
    try {
        console.log("controller.items.insert.body.", req.body);
        const result = await Services.insert(req.body);
        res.json(result);
    } catch (err) {
        console.log("controller.items.insert.catch.", err);
        next(err);
    }
  },
  update: async (req, res, next) => {
    try {
        console.log("controller.items.update.body.", req.body);
        const result = await Services.update(req.body);
        res.json(result);
    } catch (err) {
        console.log("controller.items.update.catch.", err);
        next(err);
    }
  },
  delete: async (req, res, next) => {
    try {
        console.log("controller.items.delete.params.", req.params);
        const result = await Services.delete(req.params);
        res.json(result);
    } catch (err) {
        console.log("controller.items.delete.catch.", err);
        next(err);
    }
  },
}
