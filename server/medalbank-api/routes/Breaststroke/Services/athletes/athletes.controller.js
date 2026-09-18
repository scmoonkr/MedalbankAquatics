const Services = require('./athletes.service');
exports.AthleteController = {
  detail: async (req, res, next) => {
    try {
        console.log("controller.athletes.detail.params.", req.params);
        const result = await Services.detail(req.params);
        res.json(result);
    } catch (err) {
        console.log("controller.athletes.detail.catch.", err);
        next(err);
    }
  },
  



  //-------------------------------------------
  
  view: async (req, res, next) => {
    try {
        const result = await Services.view(req.body);
        res.json(result);
    } catch (err) {
        console.log("controller.athletes.view.catch.", err);
        next(err);
    }
  },

  list: async (req, res, next) => {
    try {
        const result = await Services.list(req.body);
        res.json(result);
    } catch (err) {
        console.log("controller.athletes.list.catch.", err);
        next(err);
    }
  },

  update: async (req, res, next) => {
    try {
        const result = await Services.update(req.body);
        res.json(result);
    } catch (err) {
        console.log("controller.athletes.update.catch.", err);
        next(err);
    }
  },

  delete: async (req, res, next) => {
    try {
        const result = await Services.delete(req.params);
        res.json(result);
    } catch (err) {
        console.log("controller.athletes.delete.catch.", err);
        next(err);
    }
  },

  saveAthleteWithImage: async (req, res, next) => {
    try {
        const result = await Services.saveAthleteWithImage(req);
        res.json(result);
    } catch (err) {
        console.log("controller.athletes.saveAthleteWithImage.catch.", err);
        next(err);
    }
  },

  //####################################################################
  //######### Confirm ##################################################
  //####################################################################

}