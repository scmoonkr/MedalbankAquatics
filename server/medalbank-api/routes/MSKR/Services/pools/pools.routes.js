const router        = require("express").Router();
const Controller    = require('./pools.controller');
const imageLibrary  = require("../library/images.library.js");

// router.post("/saveWithImage", imageLibrary.upload.single('image'),
//                                 Controller.PoolController.savePoolWithImage);
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
                                Controller.PoolController.savePoolWithImage
                              );     

router.get("/:poolID",				Controller.PoolController.detail);
router.post("/",							Controller.PoolController.list);
router.post("/view",					Controller.PoolController.view);
// 수영장이름 검색색
router.post("/names",					Controller.PoolController.names);

//####################################################################
//######### Confirm ##################################################
//####################################################################
// router.post("/view",					Controller.view);
// router.post("/viewList",			Controller.viewList);



router.put("/",							 	Controller.PoolController.insert);

router.patch("/",						 	Controller.PoolController.update);

router.delete("/update/:poolID",	Controller.PoolController.updateDelete);

router.delete("/:poolID",			Controller.PoolController.delete);

router.post("/create",				Controller.PoolController.create);


module.exports = router;