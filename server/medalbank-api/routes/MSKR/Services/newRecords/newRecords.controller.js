const Services = require('./newRecords.service');


exports.NewRecordsController = {
  create: async (req, res, next) => {
    try {
        const result = await Services.create();
        res.json(result);
    } catch (err) {
        console.log("controller.newRecords.create.catch.", err);
        next(err);
    }
  },
  list: async (req, res, next) => {
    try {
        console.log("controller.newRecords.list.body.", req.body);
        const result = await Services.list(req.body);
        res.json(result);
    } catch (err) {
        console.log("controller.newRecords.list.catch.", err);
        next(err);
    }
  },
  
  //####################################################################
  //######### Confirm ##################################################
  //####################################################################
  insert: async (req, res, next) => {
    try {
        console.log("controller.newRecords.insert.body.", req.body);
        const result = await Services.insert(req.body);
        res.json(result);
    } catch (err) {
        console.log("controller.newRecords.insert.catch.", err);
        next(err);
    }
  },
  update: async (req, res, next) => {
    try {
        console.log("controller.newRecords.update.body.", req.body);
        const result = await Services.update(req.body);
        res.json(result);
    } catch (err) {
        console.log("controller.newRecords.update.catch.", err);
        next(err);
    }
  },
  delete: async (req, res, next) => {
    try {
        console.log("controller.newRecords.delete.params.", req.params);
        const result = await Services.delete(req.params);
        res.json(result);
    } catch (err) {
        console.log("controller.newRecords.delete.catch.", err);
        next(err);
    }
  },
}
