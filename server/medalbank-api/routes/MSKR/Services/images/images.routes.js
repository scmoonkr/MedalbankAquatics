const router        = require("express").Router();
const Controller    = require('./images.controller.js');

const imageLibrary  = require("../library/images.library.js");

// console.log("Controller 객체:", Controller);

router.post("/",		Controller.ImageController.list);
// router.post("/", (req, res, next) => {
//         console.log("===== images.list =====");
//         next();
//     },
//     Controller.ImageController.list, (req, res, next) => {
//         console.log("===== After images.list =====");
//         next();
//     }
// ); 

router.get("/:imageID", Controller.ImageController.detail);


// const upload
router.post("/saveImage", (req, res, next) => {
      console.log("===== imagesBefore upload.single middleware =====");
      next();
  },
  imageLibrary.upload.single('image'), (req, res, next) => {
      console.log("===== After upload.single, Before saveImage =====");
      console.log("File info:", req.file);
      next();
  },
  Controller.ImageController.saveImage, (req, res, next) => {
      console.log("===== After saveImage completed =====");
      next();
  }
); 

//####################################################################
//####################################################################
//####################################################################
router.post("/upload", (req, res, next) => {
                                    console.log("===== times.Before upload.single middleware =====");
                                    next();
                                },
                                imageLibrary.upload.single('image'),
                                (req, res, next) => {
                                    console.log("===== After upload.single, Before saveTimeWithImage =====");
                                    console.log("File info:", req.file);
                                    next();
                                },
                                // Controller.saveTimeWithImage,
                                // (req, res, next) => {
                                //     console.log("===== After saveTimeWithImage completed =====");
                                //     next();
                                // }
                              );   

router.get('/image/:db/:id/:no',		Controller.ImageController.imageImage);
router.get('/images/:db/:id/:no',		Controller.ImageController.imagesImage);

router.get('/athlete/:id/:no',			Controller.ImageController.athleteImage);
router.get('/athletes/:id/:no',			Controller.ImageController.athletesImage);
      
// router.get('/image/:db/:id/:no', (req, res) => {
//         console.log("===== imagesBefore image. =====", req.params);
//         next();
//     },
//     (req, res, next) => {
//         console.log("===== After upload.single, Before saveTimeWithImage =====");
//         Controller.ImageController.athleteImage(req, res, next),
//         console.log("File info:", req.file);
//         next();
//     },
//     // Controller.saveTimeWithImage,
//     // (req, res, next) => {
//     //     console.log("===== After saveTimeWithImage completed =====");
//     //     next();
//     // }
//     // next();
// );

router.get('/time/:id/:no',			    Controller.ImageController.timeImage);
// router.get('/times/:id/:no',			Controller.ImageController.timesImage);

router.get('/view', (req, res) => {
    console.log("images.view.");
    const id = req.query.id || "기본값";
    const name = req.query.name || "기본값";
    const metaTitle = `${name}#${id}`;

    res.send(`
        <!DOCTYPE html>
        <html lang="ko">
        <head>
            <meta http-equiv='refresh' content='0; URL=${global.medalbankHomeURL}/a/${id}'>
            <meta charset="UTF-8">
            <meta property="og:title" content="${metaTitle}">
            <meta property="og:description" content="대한민국 마스터즈 수영의 오늘">
            <meta property="og:image" content="${global.nodeServerURL}/cms/images/athletes/${id}/f">
        </head>
        <body>
            <h1>-----${metaTitle}-----</h1>
            <p>OG Title: ${metaTitle}</p>
        </body>
        </html>
    `);
});

router.post("/updateImagesMeta", Controller.ImageController.updateImagesMeta);
router.post("/updateImgbbMeta", Controller.ImageController.updateImgbbMeta);

router.post("/listCompetition", Controller.ImageController.listCompetition);
router.post("/listAidenImagesMeta", Controller.ImageController.listAidenImagesMeta);
router.post("/insertAidenImagesMeta", Controller.ImageController.insertAidenImagesMeta);
router.post("/updateAidenImagesMeta", Controller.ImageController.updateAidenImagesMeta);
router.post("/deleteAidenImagesMeta", Controller.ImageController.deleteAidenImagesMeta);

module.exports = router;