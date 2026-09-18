const Services = require('./analysis.service');
exports.AnalysisController = {
  detail: async (req, res, next) => {
    try {
        console.log("controller.analysis.detail.params.", req.params);
        const result = await Services.detail(req.params);
        res.json(result);
    } catch (err) {
        console.log("controller.analysis.detail.catch.", err);
        next(err);
    }
  },
  



  //-------------------------------------------
  
  view: async (req, res, next) => {
    try {
        const result = await Services.view(req.body);
        res.json(result);
    } catch (err) {
        console.log("controller.analysis.view.catch.", err);
        next(err);
    }
  },

  list: async (req, res, next) => {
    try {
        const result = await Services.list(req.body);
        res.json(result);
    } catch (err) {
        console.log("controller.analysis.list.catch.", err);
        next(err);
    }
  },

  update: async (req, res, next) => {
    try {
        const result = await Services.update(req.body);
        res.json(result);
    } catch (err) {
        console.log("controller.analysis.update.catch.", err);
        next(err);
    }
  },

  delete: async (req, res, next) => {
    try {
        const result = await Services.delete(req.params);
        res.json(result);
    } catch (err) {
        console.log("controller.analysis.delete.catch.", err);
        next(err);
    }
  },

  saveAnalysisWithImage: async (req, res, next) => {
    try {
        const result = await Services.saveAnalysisWithImage(req);
        res.json(result);
    } catch (err) {
        console.log("controller.analysis.saveAnalysisWithImage.catch.", err);
        next(err);
    }
  },

  //####################################################################
  //######### Confirm ##################################################
  //####################################################################

}