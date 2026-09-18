const Services = require('./simulation.service');


exports.SimulationController = {
  create: async (req, res, next) => {
    try {
        const result = await Services.create();
        res.json(result);
    } catch (err) {
        console.log("controller.simulation.create.catch.", err);
        next(err);
    }
  },
  competitions: async (req, res, next) => {
    try {
        console.log("controller.simulation.competitions.body.", req.body);
        const result = await Services.competitions(req.body);
        res.json(result);
    } catch (err) {
        console.log("controller.simulation.bucompetitionsild.catch.", err);
        next(err);
    }
  },
  build: async (req, res, next) => {
    try {
        console.log("controller.simulation.build.body.", req.body);
        const result = await Services.build(req.body);
        res.json(result);
    } catch (err) {
        console.log("controller.simulation.build.catch.", err);
        next(err);
    }
  },
  list: async (req, res, next) => {
    try {
        console.log("controller.simulation.list.body.", req.params);
        const result = await Services.list(req.params);
        res.json(result);
    } catch (err) {
        console.log("controller.simulation.list.catch.", err);
        next(err);
    }
  },
  delete: async (req, res, next) => {
    try {
        console.log("controller.simulation.delete.params.", req.params);
        const result = await Services.delete(req.params);
        res.json(result);
    } catch (err) {
        console.log("controller.simulation.delete.catch.", err);
        next(err);
    }
  },
}
