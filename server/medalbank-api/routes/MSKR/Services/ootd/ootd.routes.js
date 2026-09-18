const router        = require("express").Router();
const Controller    = require('./ootd.controller.js');
const imageLibrary  = require("../library/images.library.js");

// router.post("/saveWithImage", imageLibrary.upload.single('image'),
//                                 Controller.OOTDController.saveItemWithImage);
// 라우터에서 에러 핸들링 추가
  router.post("/saveWithImage", (req, res, next) => {
                                  console.log("saveWithImage.11111");
                                  imageLibrary.upload(req, res, (err) => {
                                    console.log("saveWithImage.22222");
                                    if (err) {
                                        console.error("Multer error:", err);
                                        return res.status(500).json({ error: err.message });
                                    }
                                    console.log("saveWithImage.33333");
                                    next();
                                  });
                                },
                                Controller.OOTDController.saveOOTDWithImage
                              );     

router.get("/:ootdID",				Controller.OOTDController.detail);
router.post("/",							Controller.OOTDController.list);
router.post("/view",					Controller.OOTDController.view);
router.put("/",							 	Controller.OOTDController.insert);

router.patch("/",						 	Controller.OOTDController.update);
router.delete("/:ootdID",			Controller.OOTDController.delete);

router.post("/create",				Controller.OOTDController.create);

//####################################################################
//######### Confirm ##################################################
//####################################################################


module.exports = router;