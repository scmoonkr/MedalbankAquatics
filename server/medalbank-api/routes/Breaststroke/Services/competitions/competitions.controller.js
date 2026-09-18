const Services = require('./competitions.service');


exports.CompetitionController = {

  list: async (req, res, next) => {
    try {
        const result = await Services.list(req.body);
        res.json(result);
    } catch (err) {
        console.log("controller.competitions.list.catch.", err);
        next(err);
    }
  },

  viewNew: async (req, res, next) => {
    // try {
        const result = await Services.viewNew(req.body);
        res.json(result);
    // } catch (err) {
    //     console.log("controller.competitions.view.catch.", err);
    //     next(err);
    // }
  },

  detail: async (req, res, next) => {
    try {
        const result = await Services.detail(req.params);
        res.json(result);
    } catch (err) {
        console.log("controller.competitions.detail.catch.", err);
        next(err);
    }
  },  

  brief: async (req, res, next) => {
		console.log("competitions.controller.brief.body=", req.body);
    try {
        const result = await Services.brief(req.body);
        res.json(result);
    } catch (err) {
        console.log("controller.competitions.brief.catch.", err);
        next(err);
    }
  },
  
  saveWithImage: async (req, res, next) => {
    try {
        const result = await Services.saveWithImage(req);
        res.json(result);
    } catch (err) {
        console.log("controller.competitions.saveWithImage.catch.", err);
        next(err);
    }
  },

  searchNames: async (req, res, next) => {
    try {
        const result = await Services.searchNames(req.body);
        res.json(result);
    } catch (err) {
        console.log("controller.competitions.searchNames.catch.", err);
        next(err);
    }
  },

  stemNames: async (req, res, next) => {
    try {
        const result = await Services.stemNames(req.body);
        res.json(result);
    } catch (err) {
        console.log("controller.competitions.stemNames.catch.", err);
        next(err);
    }
  },

  saveStem: async (req, res, next) => {
    try {
        const result = await Services.saveStem(req.body);
        res.json(result);
    } catch (err) {
        console.log("controller.competitions.saveStem.catch.", err);
        next(err);
    }
  },

  //####################################################################
  //######### Confirm ##################################################
  //####################################################################
  
  view: async (req, res, next) => {
    // try {
        const result = await Services.view(req.body);
        res.json(result);
    // } catch (err) {
    //     console.log("controller.competitions.view.catch.", err);
    //     next(err);
    // }
  },
  insert: async (req, res, next) => {
    try {
        const result = await Services.insert(req.body);
        res.json(result);
    } catch (err) {
        console.log("controller.competitions.insert.catch.", err);
        next(err);
    }
  },
  update: async (req, res, next) => {
    try {
        const result = await Services.update(req.body);
        res.json(result);
    } catch (err) {
        console.log("controller.competitions.update.catch.", err);
        next(err);
    }
  },
  //####################################################################
  //######### Confirm ##################################################
  //####################################################################
  updateDelete: async (req, res, next) => {
    try {
        const result = await Services.updateDelete(req.body);
        res.json(result);
    } catch (err) {
        console.log("controller.competitions.updateDelete.catch.", err);
        next(err);
    }
  },
  delete: async (req, res, next) => {
    try {
        const result = await Services.delete(req.params);
        res.json(result);
    } catch (err) {
        console.log("controller.competitions.delete.catch.", err);
        next(err);
    }
  },
  create: async (req, res, next) => {
    try {
        const result = await Services.create();
        res.json(result);
    } catch (err) {
        console.log("controller.competitions.create.catch.", err);
        next(err);
    }
  },

  upcomings: async (req, res, next) => {
    try {
        const result = await Services.upcomings(req.body);
        res.json(result);
    } catch (err) {
        console.log("controller.competitions.upcomings.catch.", err);
        next(err);
    }
  },

  names: async (req, res, next) => {
    try {
        const result = await Services.names(req.body);
        res.json(result);
    } catch (err) {
        console.log("controller.competitions.names.catch.", err);
        next(err);
    }
  },
  years: async (req, res, next) => {
    try {
        const result = await Services.years(req.body);
        res.json(result);
    } catch (err) {
        console.log("controller.competitions.years.catch.", err);
        next(err);
    }
  },
  monthGroup: async (req, res, next) => {
    try {
        const result = await Services.monthGroup(req.body);
        res.json(result);
    } catch (err) {
        console.log("controller.competitions.monthGroup.catch.", err);
        next(err);
    }
  },
  ageGroup: async (req, res, next) => {
    try {
        const result = await Services.ageGroup(req.params);
        res.json(result);
    } catch (err) {
        console.log("controller.competitions.ageGroup.catch.", err);
        next(err);
    }
  },
  backendList: async (req, res, next) => {
    try {
        const result = await Services.backendList(req.body);
        res.json(result);
    } catch (err) {
        console.log("controller.competitions.backendList.catch.", err);
        next(err);
    }
  },
  upcomming: async (req, res, next) => {
    try {
        const result = await Services.upcomming(req.body);
        res.json(result);
    } catch (err) {
        console.log("controller.competitions.upcomming.catch.", err);
        next(err);
    }
  },
  medals: async (req, res, next) => {
    try {
        const result = await Services.medals(req.body);
        res.json(result);
    } catch (err) {
        console.log("controller.competitions.medals.catch.", err);
        next(err);
    }
  },
  getMedals: async (req, res, next) => {
    try {
        const result = await Services.getMedals(req.body);
        res.json(result);
    } catch (err) {
        console.log("controller.competitions.getMedals.catch.", err);
        next(err);
    }
  },
  times: async (req, res, next) => {
    try {
        const result = await Services.times(req.body);
        res.json(result);
    } catch (err) {
        console.log("controller.competitions.times.catch.", err);
        next(err);
    }
  },
  competitionTimes: async (req, res, next) => {
    try {
        const result = await Services.competitionTimes(req.body);
        res.json(result);
    } catch (err) {
        console.log("controller.competitions.competitionTimes.catch.", err);
        next(err);
    }
  },
  disciplineTimes: async (req, res, next) => {
    try {
        const result = await Services.statics(req.body);
        res.json(result);
    } catch (err) {
        console.log("controller.competitions.disciplineTimes.catch.", err);
        next(err);
    }
  },
}
