const Services = require('./imgBB.service');

exports.ImgBBController = {
  
  saveImage: async (req, res, next) => {
    try {
        const result = await Services.saveImage(req);
        res.json(result);
    } catch (err) {
        console.log("controller.images.saveImage.catch.", err);
        next(err);
    }
  },
}