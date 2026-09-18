const Services = require('./images.service');
exports.ImageController = {
  
  list: async (req, res, next) => {
    console.log("images.list");
    try {
        const result = await Services.list(req.body);
        res.json(result);
    } catch (err) {
        console.log("controller.images.list.catch.", err);
        next(err);
    }
  },
  
  detail: async (req, res, next) => {
    try {
        const result = await Services.detail(req.params);
        res.json(result);
    } catch (err) {
        console.log("controller.images.detail.catch.", err);
        next(err);
    }
  },
  
  saveImage: async (req, res, next) => {
    try {
        const result = await Services.saveImage(req);
        res.json(result);
    } catch (err) {
        console.log("controller.images.saveImage.catch.", err);
        next(err);
    }
  },
  
  athleteImage: async (req, res, next) => {
    console.log("images.athlete.", req.params);
    try {
        const result = await Services.athleteImage(req.params);
        res.send(result);
    } catch (err) {
        console.log("controller.images.athlete.catch.", err);
        next(err);
    }
  },
  
  athletesImage: async (req, res, next) => {
    console.log("images.athlete.", req.params);
    try {
        const result = await Services.athletesImage(req.params);
        res.send(result);
    } catch (err) {
        console.log("controller.images.athletesImage.catch.", err);
        next(err);
    }
  },
  
  imageImage: async (req, res, next) => {
    console.log("images.imageImage.", req.params);
    try {
        const result = await Services.imageImage(req.params);
        res.send(result);
    } catch (err) {
        console.log("controller.images.imageImage.catch.", err);
        next(err);
    }
  },
  
  imagesImage: async (req, res, next) => {
    console.log("images.imagesImage.", req.params);
    try {
        const result = await Services.imagesImage(req.params);
        res.send(result);
    } catch (err) {
        console.log("controller.images.imagesImage.catch.", err);
        next(err);
    }
  },
  
  timeImage: async (req, res, next) => {
    console.log("images.timeImage.", req.params);
    try {
        const result = await Services.timeImage(req.params);
        res.send(result);
    } catch (err) {
        console.log("controller.images.timeImage.catch.", err);
        next(err);
    }
  },
  
  timesImage: async (req, res, next) => {
    console.log("images.timesImage.", req.params);
    try {
        const result = await Services.timesImage(req.params);
        res.send(result);
    } catch (err) {
        console.log("controller.images.timesImage.catch.", err);
        next(err);
    }
  },
  
  updateImagesMeta: async (req, res, next) => {
    console.log("images.updateImagesMeta.", req.body);
    try {
        const result = await Services.updateImagesMeta(req.body);
        res.send(result);
    } catch (err) {
        console.log("controller.images.updateImagesMeta.catch.", err);
        next(err);
    }
  },
  
  updateImgbbMeta: async (req, res, next) => {
    console.log("images.updateImgbbMeta.", req.body);
    try {
        const result = await Services.updateImgbbMeta(req.body);
        res.send(result);
    } catch (err) {
        console.log("controller.images.updateImgbbMeta.catch.", err);
        next(err);
    }
  },
  
  listCompetition: async (req, res, next) => {
    console.log("images.controller.listCompetition.", req.body);
    try {
        const result = await Services.listCompetition(req.body);
        res.send(result);
    } catch (err) {
        console.log("controller.images.listCompetition.catch.", err);
        next(err);
    }
  },
  
  listAidenImagesMeta: async (req, res, next) => {
    console.log("images.controller.listAidenImagesMeta.", req.body);
    try {
        const result = await Services.listAidenImagesMeta(req.body);
        res.send(result);
    } catch (err) {
        console.log("controller.images.listAidenImagesMeta.catch.", err);
        next(err);
    }
  },
  
  insertAidenImagesMeta: async (req, res, next) => {
  console.log("=== 요청 디버깅 ===", req);
  console.log("Content-Type:", req.headers['content-type']);
  console.log("req.body:", req.body);
  console.log("req.body type:", typeof req.body);
  console.log("req.body keys:", Object.keys(req.body));
  console.log("==================");
    console.log("images.controller.insertAidenImagesMeta.", req.body);
    try {
        const result = await Services.insertAidenImagesMeta(req.body);
        res.send(result);
    } catch (err) {
        console.log("controller.images.insertAidenImagesMeta.catch.", err);
        next(err);
    }
  },
  
  updateAidenImagesMeta: async (req, res, next) => {
    console.log("images.controller.updateAidenImagesMeta.", req.body);
    try {
        const result = await Services.updateAidenImagesMeta(req.body);
        res.send(result);
    } catch (err) {
        console.log("controller.images.updateAidenImagesMeta.catch.", err);
        next(err);
    }
  },
  
  deleteAidenImagesMeta: async (req, res, next) => {
    console.log("images.controller.deleteAidenImagesMeta.", req.body);
    try {
        const result = await Services.deleteAidenImagesMeta(req.body);
        res.send(result);
    } catch (err) {
        console.log("controller.images.deleteAidenImagesMeta.catch.", err);
        next(err);
    }
  },
}