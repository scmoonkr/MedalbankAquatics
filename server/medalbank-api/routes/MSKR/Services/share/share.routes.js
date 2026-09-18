const router        = require("express").Router();
const Controller    = require('./share.controller.js');



router.get('/athlete/:id',		Controller.athlete);
router.get('/time/:id',			  Controller.time);

router.get('/athlete/:name/:id', (req, res) => {
    console.log("share.athlete.", req.params);
    const id = req.params.id || "1068";
    const name = req.params.name || "고희경";
    const metaTitle = `${name}#${id}`;

    res.send(`
        <!DOCTYPE html>
        <html lang="ko">
        <head>
            <meta http-equiv='refresh' content='0; URL=${global.medalbankHomeURL}/a/${id}'>
            <meta charset="UTF-8">
            <meta property="og:title" content="${metaTitle}">
            <meta property="og:description" content="${name}#${id} 선수 경기실적">
            <meta property="og:image" content="${global.nodeServerURL}/cms/images/athletes/${id}/3">
        </head>
        <body>
            <!--<h1>-----${metaTitle}-----</h1>-->
            <!--<p>OG Title: ${metaTitle}</p>-->
        </body>
        </html>
    `);
});

module.exports = router;