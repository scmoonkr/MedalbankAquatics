const Services = require('./leaderboard.service');

exports.LeaderboardController = {
  listRealtime: async (req, res, next) => {
    try {
        const result = await Services.listRealtime(req.body);
        res.json(result);
    } catch (err) {
        console.log("controller.leaderboard.list.catch.", err);
        next(err);
    }
  },
}
