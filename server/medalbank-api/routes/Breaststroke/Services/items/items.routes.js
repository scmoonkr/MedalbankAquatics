const router        = require("express").Router();
const Controller    = require('./items.controller');
const imageLibrary  = require("../library/images.library.js");

// router.post("/saveWithImage", imageLibrary.upload.single('image'),
//                                 Controller.ItemController.saveItemWithImage);
// 라우터에서 에러 핸들링 추가
  // router.post("/saveWithImage", (req, res, next) => {
  //                                 console.log("saveWithImage.11111");
  //                                 imageLibrary.upload(req, res, (err) => {
  //                                   console.log("saveWithImage.22222");
  //                                   if (err) {
  //                                       console.error("Multer error:", err);
  //                                       return res.status(500).json({ error: err.message });
  //                                   }
  //                                   console.log("saveWithImage.33333");
  //                                   next();
  //                                 });
  //                               },
  //                               Controller.ItemController.saveItemWithImage
  //                             );  
  router.post("/saveWithImage",       
    (req, res, next) => {
        console.log("===== items.1.Before upload.single middleware =====", req.body);
        next();
    },
    imageLibrary.upload.single('image'),
    (req, res, next) => {
        console.log("===== After upload.single, Before saveWithImage =====");
        console.log("File info:", req.file);
        next();
    },
    Controller.ItemController.saveItemWithImage,
    (req, res, next) => {
        console.log("===== After saveWithImage completed =====");
        next();
    }
  ); 
  
  

router.get("/:itemID",				Controller.ItemController.detail);
router.post("/",							Controller.ItemController.list);
router.put("/",							 	Controller.ItemController.insert);
router.post("/collections",		Controller.ItemController.collections);
// router.get("/collection/:collection",			Controller.ItemController.collection);
// router.get("/images/:collection",			Controller.ItemController.imageCcollection);
// router.post("/images",		    Controller.ItemController.images);

router.patch("/",						 	Controller.ItemController.update);
router.delete("/:itemID",			Controller.ItemController.delete);

router.post("/create",				Controller.ItemController.create);

//####################################################################
//######### Confirm ##################################################
//####################################################################


module.exports = router;