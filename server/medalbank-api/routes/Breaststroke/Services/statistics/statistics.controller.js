const Services = require('./statistics.service');

exports.StatisticsController = {

  statistics: async (req, res, next) => {
    // console.log("controller.statistics.body.", req.body);
    try {
        const result = await Services.statistics(req.body);
        res.json(result);
    } catch (err) {
        console.log("controller.statics.statistics.catch.", err);
        next(err);
    }
  },
  buildStatistics: async (req, res, next) => {
    // console.log("controller.buildStatistics.body.", req.params);
    try {
        const result = await Services.buildStatistics(req.params);
        res.json(result);
    } catch (err) {
        console.log("controller.statics.buildStatistics.catch.", err);
        next(err);
    }
  },
  hallOfFame: async (req, res, next) => {
    // console.log("controller.hallOfFame.params.", req.params);
    try {
        const result = await Services.hallOfFame(req.params);
        res.json(result);
    } catch (err) {
        console.log("controller.statics.hallOfFame.catch.", err);
        next(err);
    }
  },
//####################################################################
//########## Confirm #################################################
//####################################################################
}
