const Services = require('./leaderboard.service');

exports.LeaderboardController = {
  create: async (req, res, next) => {
    try {
        const result = await Services.create();
        res.json(result);
    } catch (err) {
        console.log("controller.leaderboard.create.catch.", err);
        next(err);
    }
  },
  listRealtime: async (req, res, next) => {
    try {
        const result = await Services.listRealtime(req.body);
        res.json(result);
    } catch (err) {
        console.log("controller.leaderboard.list.catch.", err);
        next(err);
    }
  },
  list4Capture: async (req, res, next) => {
    try {
        const result = await Services.list4Capture(req.body);
        res.json(result);
    } catch (err) {
        console.log("controller.leaderboard.list4Capture.catch.", err);
        next(err);
    }
  },
  list: async (req, res, next) => {
    try {
      // const result = await Services.listRealtime(req.body);
      const result = await Services.list(req.body);
      
        res.json(result);
    } catch (err) {
        console.log("controller.leaderboard.listRealtime.catch.", err);
        next(err);
    }
  },

//######################################################################
//############################ Confirm #################################
//######################################################################

  detail: async (req, res, next) => {
    try {
        // console.log("controller.leaderboard.detail.params.", req.params);
        const result = await Services.detail(req.params);
        res.json(result);
    } catch (err) {
        console.log("controller.leaderboard.detail.catch.", err);
        next(err);
    }
  },
  listBrief: async (req, res, next) => {
    try {
        const result = await Services.listBrief(req.body);
        res.json(result);
    } catch (err) {
        console.log("controller.leaderboard.list.catch.", err);
        next(err);
    }
  },
  listToday: async (req, res, next) => {
    try {
        const result = await Services.listToday(req.body);
        res.json(result);
    } catch (err) {
        console.log("controller.leaderboard.listToday.catch.", err);
        next(err);
    }
  },
  listNow: async (req, res, next) => {
    try {
        const result = await Services.listNow(req.body);
        res.json(result);
    } catch (err) {
        console.log("controller.leaderboard.listNow.catch.", err);
        next(err);
    }
  },
  build: async (req, res, next) => {
    try {
        // console.log("controller.leaderboard.build.body.", req.body);
        const result = await Services.build(req.body);
        res.json(result);
    } catch (err) {
        console.log("controller.leaderboard.build.catch.", err);
        next(err);
    }
  },
  insert: async (req, res, next) => {
    try {
        // console.log("controller.leaderboard.insert.body.", req.body);
        const result = await Services.insert(req.body);
        res.json(result);
    } catch (err) {
        console.log("controller.leaderboard.insert.catch.", err);
        next(err);
    }
  },
  update: async (req, res, next) => {
    try {
        // console.log("controller.leaderboard.update.body.", req.body);
        const result = await Services.update(req.body);
        res.json(result);
    } catch (err) {
        console.log("controller.leaderboard.update.catch.", err);
        next(err);
    }
  },
  delete: async (req, res, next) => {
    try {
        // console.log("controller.leaderboard.delete.params.", req.params);
        const result = await Services.delete(req.params);
        res.json(result);
    } catch (err) {
        console.log("controller.leaderboard.delete.catch.", err);
        next(err);
    }
  },
  deletePermanent: async (req, res, next) => {
    try {
        // console.log("controller.leaderboard.deletePermanent.body.", req.body);
        const result = await Services.deletePermanent(req.body);
        res.json(result);
    } catch (err) {
        console.log("controller.leaderboard.deletePermanent.catch.", err);
        next(err);
    }
  },
  restore: async (req, res, next) => {
    try {
        // console.log("controller.leaderboard.restore.body.", req.body);
        const result = await Services.restore(req.body);
        res.json(result);
    } catch (err) {
        console.log("controller.leaderboard.restore.catch.", err);
        next(err);
    }
  },
}
