const router = require("express").Router();
const Controller = require('./times.controller.js');
const imageLibrary = require("../library/images.library.js");

router.get("/:timeID/:athleteID",   Controller.detail);
router.post("/",					Controller.list);
router.get("/view/:timeID/:userID", Controller.view);
router.delete("/:timeID",			Controller.delete);
router.patch("/times",				Controller.updateTimesMSKR);

  router.post("/saveTimeWithImage", (req, res, next) => {
                                    console.log("===== times.Before upload.single middleware =====");
                                    next();
                                },
                                imageLibrary.upload.single('image'),
                                (req, res, next) => {
                                    console.log("===== After upload.single, Before saveTimeWithImage =====");
                                    console.log("File info:", req.file);
                                    next();
                                },
                                Controller.saveTimeWithImage,
                                (req, res, next) => {
                                    console.log("===== After saveTimeWithImage completed =====");
                                    next();
                                }
                              );                            


//####################################################################
//######### Confirm ##################################################
//####################################################################

module.exports = router;