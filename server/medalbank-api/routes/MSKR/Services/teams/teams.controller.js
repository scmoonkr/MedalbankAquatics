const Services = require('./teams.service');

exports.TeamController = {
  saveTeamWithImage: async (req, res, next) => {
    try {
        console.log("controller.teams.saveTeamWithImage..body.", );
        const result = await Services.saveTeamWithImage(req);
        res.json(result);
    } catch (err) {
        console.log("controller.teams.saveTeamWithImage.catch.", err);
        next(err);
    }
  },
  view: async (req, res, next) => {
    try {
        console.log("controller.teams.view.body.", req.body);
        const result = await Services.view(req.body);
        res.json(result);
    } catch (err) {
        console.log("controller.teams.view.catch.", err);
        next(err);
    }
  },
  search: async (req, res, next) => {
    try {
        console.log("controller.teams.search.body.", req.body);
        const result = await Services.search(req.body);
        res.json(result);
    } catch (err) {
        console.log("controller.teams.search.catch.", err);
        next(err);
    }
  },
  listRealtime: async (req, res, next) => {
    try {
        // console.log("controller.teams.listRealtime.body.", req.body);
        const result = await Services.listRealtime(req.body);
        res.json(result);
    } catch (err) {
        console.log("controller.teams.listRealtime.catch.", err);
        next(err);
    }
  },
  names: async (req, res, next) => {
    try {
        console.log("new.controller.teams.names.body.", req.body);
        const result = await Services.names(req.body);
        res.json(result);
    } catch (err) {
        console.log("controller.teams.names.catch.", err);
        next(err);
    }
  },
  list: async (req, res, next) => {
    try {
        console.log("new.controller.teams.list.body.", req.body);
        const result = await Services.list(req.body);
        res.json(result);
    } catch (err) {
        console.log("controller.teams.list.catch.", err);
        next(err);
    }
  },

  merge: async (req, res, next) => {
    try {
        console.log("new.controller.teams.merge.body.", req.body);
        const result = await Services.merge(req.body);
        res.json(result);
    } catch (err) {
        console.log("controller.teams.merge.catch.", err);
        next(err);
    }
  },


	//####################################################################
	//######### Confirm ##################################################
	//####################################################################
  buildStatistics: async (req, res, next) => {
    try {
        console.log("controller.teams.buildStatistics..body.", req.body);
        const result = await Services.buildStatistics(req.body);
        res.json(result);
    } catch (err) {
        console.log("controller.teams.buildStatistics.catch.", err);
        next(err);
    }
  },
  statistics: async (req, res, next) => {
    try {
        console.log("controller.teams.statistics..body.", req.body);
        const result = await Services.statistics(req.body);
        res.json(result);
    } catch (err) {
        console.log("controller.teams.statistics.catch.", err);
        next(err);
    }
  },
  setTimesTeamID: async (req, res, next) => {
    try {
        console.log("controller.teams.setTimesTeamID..body.", req.body);
        const result = await Services.setTimesTeamID(req.body);
        res.json(result);
    } catch (err) {
        console.log("controller.teams.setTimesTeamID.catch.", err);
        next(err);
    }
  },
  resetTimesTeamID: async (req, res, next) => {
    try {
        console.log("controller.teams.resetTimesTeamID..body.", req.body);
        const result = await Services.resetTimesTeamID(req.body);
        res.json(result);
    } catch (err) {
        console.log("controller.teams.resetTimesTeamID.catch.", err);
        next(err);
    }
  },
  setAthletesTeamID: async (req, res, next) => {
    try {
        console.log("controller.teams.setAthletesTeamID..body.", req.body);
        const result = await Services.setAthletesTeamID(req.body);
        res.json(result);
    } catch (err) {
        console.log("controller.teams.setAthletesTeamID.catch.", err);
        next(err);
    }
  },
  getTeamTimesNotExists: async (req, res, next) => {
    try {
        console.log("controller.teams.getTeamTimesNotExists..body.", req.body);
        const result = await Services.getTeamTimesNotExists(req.body);
        res.json(result);
    } catch (err) {
        console.log("controller.teams.getTeamTimesNotExists.catch.", err);
        next(err);
    }
  },
  getTeamAthletesNotExists: async (req, res, next) => {
    try {
        console.log("controller.teams.getTeamAthletesNotExists..body.", req.body);
        const result = await Services.getTeamAthletesNotExists(req.body);
        res.json(result);
    } catch (err) {
        console.log("controller.teams.getTeamAthletesNotExists.catch.", err);
        next(err);
    }
  },
  setTimesTeamIDbyTeam: async (req, res, next) => {
    try {
        console.log("controller.teams.setTimesTeamIDbyTeam..body.", req.body);
        const result = await Services.setTimesTeamIDbyTeam(req.body);
        res.json(result);
    } catch (err) {
        console.log("controller.teams.setTimesTeamIDbyTeam.catch.", err);
        next(err);
    }
  },
  summary: async (req, res, next) => {
    try {
        console.log("controller.teams.summary..body.", req.body);
        const result = await Services.summary(req.body);
        res.json(result);
    } catch (err) {
        console.log("controller.teams.summary.catch.", err);
        next(err);
    }
  },
  detail: async (req, res, next) => {
    try {
        console.log("controller.teams.detail.params.", req.params);
        const result = await Services.detail(req.params);
        res.json(result);
    } catch (err) {
        console.log("controller.teams.detail.catch.", err);
        next(err);
    }
  },
  rank: async (req, res, next) => {
    try {
        console.log("controller.teams.rank.body.", req.body);
        const result = await Services.rank(req.body);
        res.json(result);
    } catch (err) {
        console.log("controller.teams.rank.catch.", err);
        next(err);
    }
  },
  insert: async (req, res, next) => {
    try {
        console.log("controller.teams.insert.body.", req.body);
        const result = await Services.insert(req.body);
        res.json(result);
    } catch (err) {
        console.log("controller.teams.insert.catch.", err);
        next(err);
    }
  },
  update: async (req, res, next) => {
    try {
        // console.log("controller.teams.update.body.", req.body);
        const result = await Services.update(req.body);
        res.json(result);
    } catch (err) {
        console.log("controller.teams.update.catch.", err);
        next(err);
    }
  },
  updateDelete: async (req, res, next) => {
    try {
        console.log("controller.teams.updateDelete.body.", req.body);
        const result = await Services.updateDelete(req.body);
        res.json(result);
    } catch (err) {
        console.log("controller.teams.updateDelete.catch.", err);
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
