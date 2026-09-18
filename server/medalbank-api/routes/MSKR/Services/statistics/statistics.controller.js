const Services = require('./statistics.service');

exports.StaticController = {


  mainNew: async (req, res, next) => {
    try {
        const result = await Services.mainNew(req.body);
        res.json(result);
    } catch (err) {
        console.log("controller.statics.mainNew.catch.", err);
        next(err);
    }
  },
  main: async (req, res, next) => {
    try {
        const result = await Services.main(req.body);
        res.json(result);
    } catch (err) {
        console.log("controller.statics.main.catch.", err);
        next(err);
    }
  },
//####################################################################
//########## Confirm #################################################
//####################################################################

  rankings: async (req, res, next) => {
    try {
        const result = await Services.rankings(req.body);
        res.json(result);
    } catch (err) {
        console.log("controller.statics.rankings.catch.", err);
        next(err);
    }
  },

  clearMemory: (req, res, next) => {
    try {
        const result = Services.clearMemory(req.body);
        res.json(result);
    } catch (err) {
        console.log("controller.statics.loadMemory.catch.", err);
        next(err);
    }
  },

  loadMemory: async (req, res, next) => {
    try {
        const result = await Services.loadMemory(req.body);
        res.json(result);
    } catch (err) {
        console.log("controller.statics.loadMemory.catch.", err);
        next(err);
    }
  },
  getStatistics: async (req, res, next) => {
    try {
        const result = await Services.getStatistics(req.body);
        res.json(result);
    } catch (err) {
        console.log("controller.statics.getStatistics.catch.", err);
        next(err);
    }
  },

  getAthletesMemory: async (req, res, next) => {
    try {
        const result = await Services.getAthletesMemory(req.body);
        res.json(result);
    } catch (err) {
        console.log("controller.statics.getAthletesMemory.catch.", err);
        next(err);
    }
  },

  getTimesMemory: (req, res, next) => {
    try {
        const result = Services.getTimesMemory(req.body);
        res.json(result);
    } catch (err) {
        console.log("controller.statics.getTimesMemory.catch.", err);
        next(err);
    }
  },

  getTeamsMemory: (req, res, next) => {
    try {
        const result = Services.getTeamsMemory(req.body);
        res.json(result);
    } catch (err) {
        console.log("controller.statics.getTeamsMemory.catch.", err);
        next(err);
    }
  },

  getPoolsMemory: async (req, res, next) => {
    try {
        const result = await Services.getPoolsMemory(req.body);
        res.json(result);
    } catch (err) {
        console.log("controller.statics.getPoolsMemory.catch.", err);
        next(err);
    }
  },

  getCompetitionsMemory: (req, res, next) => {
    try {
        const result = Services.getCompetitionsMemory(req.body);
        res.json(result);
    } catch (err) {
        console.log("controller.statics.getCompetitionsMemory.catch.", err);
        next(err);
    }
  },

  getMeasuredRecent: async (req, res, next) => {
    try {
        const result = await Services.getMeasuredRecent(req.body);
        res.json(result);
    } catch (err) {
        console.log("controller.statics.getMeasuredRecent.catch.", err);
        next(err);
    }
  },

  getMeasuredMost: (req, res, next) => {
    try {
        const result = Services.getMeasuredMost(req.body);
        res.json(result);
    } catch (err) {
        console.log("controller.statics.getMeasuredMost.catch.", err);
        next(err);
    }
  },

  getSearchCount: async (req, res, next) => {
    try {
        const result = await Services.getSearchCount(req.body);
        res.json(result);
    } catch (err) {
        console.log("controller.statics.getSearchCount.catch.", err);
        next(err);
    }
  },

  getSearchRecent: (req, res, next) => {
    try {
        const result = Services.getSearchRecent(req.body);
        res.json(result);
    } catch (err) {
        console.log("controller.statics.getSearchRecent.catch.", err);
        next(err);
    }
  },

  getJoined: async (req, res, next) => {
    try {
        const result = await Services.getJoined(req.body);
        res.json(result);
    } catch (err) {
        console.log("controller.statics.getJoined.catch.", err);
        next(err);
    }
  },
}
