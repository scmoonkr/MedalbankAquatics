const Services = require('../../Services/Ranking/team_points.service');

exports.TeamPointsController = {
  list: async (req, res, next) => {
    try {
        console.log("controller.teams.list.body.", req.body);
        const result = await Services.list(req.body);
        res.json(result);
    } catch (err) {
        console.log("controller.teams.list.catch.", err);
        next(err);
    }
  },
  listTotal: async (req, res, next) => {
    try {
        console.log(">controller.teams.listTotal.body.", req.body);
        const result = await Services.listTotal(req.body);
        res.json(result);
    } catch (err) {
        console.log("controller.teams.listTotal.catch.", err);
        next(err);
    }
  },
  listTotalNew: async (req, res, next) => {
    try {
        console.log(">controller.teams.listTotalNew.body.", req.body);
        const result = await Services.listTotalNew(req.body);
        res.json(result);
    } catch (err) {
        console.log("controller.teams.listTotalNew.catch.", err);
        next(err);
    }
  },
  listTeam: async (req, res, next) => {
    try {
        console.log("controller.teams.listTeam.params.", req.params);
        const result = await Services.listTeam(req.params);
        res.json(result);
    } catch (err) {
        console.log("controller.teams.listTeam.catch.", err);
        next(err);
    }
  },
  listTeamWSwimmers: async (req, res, next) => {
    try {
        console.log("controller.teams.listTeamWork.body.", req.body);
        const result = await Services.listTeamLeader(req.body);
        res.json(result);
    } catch (err) {
        console.log("controller.teams.listTeamWork.catch.", err);
        next(err);
    }
  },
  listTeamWork: async (req, res, next) => {
    // try {
        console.log("controller.teams.listTeamWork.body.", req.body);
        const result = await Services.listTeamWork(req.body);
        res.json(result);
    // } catch (err) {
    //     console.log("controller.teams.listTeamWork.catch.", err);
    //     next(err);
    // }
  },
  build: async (req, res, next) => {
    try {
        console.log("controller.teams.build.body.", req.body);
        const result = await Services.build(req.body);
        res.json(result);
    } catch (err) {
        console.log("controller.teams.build.catch.", err);
        next(err);
    }
  },
  buildPoints: async (req, res, next) => {
    try {
        console.log("controller.teams.buildPoints.body.", req.body);
        const result = await Services.buildPoints(req.body);
        res.json(result);
    } catch (err) {
        console.log("controller.teams.buildPoints.catch.", err);
        next(err);
    }
  },
  buildStatics: async (req, res, next) => {
    try {
        console.log("controller.teams.buildStatics.body.", req.body);
        const result = await Services.buildStatics(req.body);
        res.json(result);
    } catch (err) {
        console.log("controller.teams.buildStatics.catch.", err);
        next(err);
    }
  },
  buildAll: async (req, res, next) => {
    try {
        console.log("controller.teams.buildAll.body.", req.body);
        const result = await Services.buildAll(req.body);
        res.json(result);
    } catch (err) {
        console.log("controller.teams.buildAll.catch.", err);
        next(err);
    }
  },
  delete: async (req, res, next) => {
    try {
        console.log("controller.teams.delete.params.", req.params);
        const result = await Services.delete(req.params);
        res.json(result);
    } catch (err) {
        console.log("controller.teams.delete.catch.", err);
        next(err);
    }
  },
  deleteAll: async (req, res, next) => {
    try {
        console.log("controller.teams.deleteAll.body.", req.body);
        const result = await Services.deleteAll(req.body);
        res.json(result);
    } catch (err) {
        console.log("controller.teams.deleteAll.catch.", err);
        next(err);
    }
  },
  loadConfig: async (req, res, next) => {
    try {
        console.log("controller.teams.loadConfig.body.", req.body);
        const result = await Services.loadConfig(req.body);
        res.json(result);
    } catch (err) {
        console.log("controller.teams.loadConfig.catch.", err);
        next(err);
    }
  },
  saveConfig: async (req, res, next) => {
    try {
        console.log("controller.teams.saveConfig.body.", req.body);
        const result = await Services.saveConfig(req.body);
        res.json(result);
    } catch (err) {
        console.log("controller.teams.saveConfig.catch.", err);
        next(err);
    }
  },
  
  create: async (req, res, next) => {
    try {
        const result = await Services.create();
        res.json(result);
    } catch (err) {
        console.log("controller.teams.create.catch.", err);
        next(err);
    }
  },
}
