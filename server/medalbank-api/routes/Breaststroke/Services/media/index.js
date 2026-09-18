/*
 * err() 는 JSON.stringify(err)대신  err.toString()을 사용
*/
const express 	  = require('express');
const router 		  = express.Router();
const formidable  = require('formidable');
const indexDAO 	   = require('./indexDAO');

var uploadDAO 	= require('./uploadDAO');
// var downloadDAO = require('./downloadDAO');

//***************************************************************************
//	"/cms/getMeta"
//	{ category, id }
//***************************************************************************
router.post('/getMeta', async function(req, res, next) {
  try {
    const result = await indexDAO.getMeta( req.body );
    res.header = result;
    res.status(200).send(result);	
  } catch (e) {
    console.log("media getMeta.catch.", e);
    res.status(200).send("media getMeta.catch." + e);
  }
});

//***************************************************************************
//	"/cms/uploadMeta"
//	{ category, id }
//***************************************************************************
router.post('/uploadMeta', async function(req, res, next) {
  try {
    const result = await indexDAO.uploadMeta( req.body );
    res.header = result;
    res.status(200).send(result);	
  } catch (e) {
    console.log("media getMeta.catch.", e);
    res.status(200).send("media getMeta.catch." + e);
  }
});

//***************************************************************************
//	"/cms/download/{category}/{id}"
// type: t:thumbnail, f:feratured, 0~9:images
//  type은 option: 안들어오면 't'
//***************************************************************************
router.post('/getImages', async function(req, res, next) { 
  // console.log("cms.", req.body);
  req.body.type = req.body.type ?? 't';
  try {
    const result = await indexDAO.getImages( req.body );
    res.header = result;
    res.status(200).send(result);	
} catch (e) {
    console.log(e);
    res.status(500).send(e);
  }
});

//***************************************************************************
//	"/cms/download/{category}/{id}"
// type: t:thumbnail, f:feratured, 0~9:images
//  type은 option: 안들어오면 't'
//***************************************************************************
router.get('/:category/:db/:id/:type?', async function(req, res, next) { 
  // console.log("cms.", req.params);
  req.params.type = req.params.type ?? 't';
  try {
    if (req.params.category == "getImages") {
      const result = await indexDAO.getImages( req.params );
      res.header = result;
      res.status(200).send(result);	
      return;
    }
    //---------------------------------
    const file = await indexDAO.download( req.params );
    if (file.file !== "") {
      let options = {};
      // filename을 주면 download
      if ("gif,png,jpg,jpeg,bmp,txt".indexOf(file.ext) < 0) {
        options['Content-Type'] = file.ext;
        options["Content-Disposition"] = "attachment;filename=" + encodeURI(file.name);
      }

      // console.log("++++++++++++++++++++++++++++++++++++++");
      // console.log("download.name: ", file.name);
      // console.log("download.type: ", file.type);
      // console.log("download.ext: ", file.ext);
      // console.log("download.options: ", options);
      // console.log("++++++++++++++++++++++++++++++++++++++");
    
      res.writeHead(200, options);
      res.end(file.file, 'binary');
    }
    else {
      res.status(200).send("file not found 4");
    }
  } catch (e){
    // console.log("CMS.media download.catch.", e);
    res.status(200).send("CMS.media download.catch." + e);
  }
})

//***************************************************************************
//	"/cms/download/{category}/{id}"
//***************************************************************************
router.get('/download/:filename', async function(req, res, next) { 
  try {
    const file = await indexDAO.downloadByFilename(req.params );
    if (file.file !== "") {
      let options = {};
      // filename을 주면 download
      if ("gif,png,jpg,jpeg,bmp,txt,tar,zip".indexOf(file.ext) < 0) {
        options['Content-Type'] = "zip";
        options["Content-Disposition"] = "attachment;filename=" + encodeURI(file.name);
      }
      res.writeHead(200, options);
      res.end(file.file, 'binary');
    }
    else {
      res.status(200).send("file not found 4");
    }
  } catch (e){
    // console.log("CMS.media download.catch.", e);
    res.status(200).send("CMS.media download.catch." + e);
  }
}
)

//***************************************************************************
// upload FILE
//***************************************************************************
router.post('/upload', async function(req, res, next) {
	try {
		var form = new formidable.IncomingForm();
		// specify that we want to allow the user to upload multiple files in a single request
		form.multiples = true;
		//-----> parse
		form.parse(req, async (err, fields, files) => {
			console.log("upload> upload.fields=", fields);
			//----->
			const result = await uploadDAO.upload(fields, files);
			res.header = result;
			res.status(200).send(result);	
		});
	} catch (e) {
		console.log("media.upload.catch.", e);
		res.status(503).send(e); 
	}
})

//***************************************************************************
// upload URL
//***************************************************************************
router.post('/uploadURL', async function(req, res, next) {
    try {
      //----->
      const result = await uploadDAO.upload(req, req.body.url);
      res.header = result;
      res.status(200).send(result);	
    } catch (e) {
      console.log("media.uploadURL.catch.", e);
			res.status(503).send(e); 
    }
	})

module.exports = router;
