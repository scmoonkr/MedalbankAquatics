var express 					= require('express');
var router 						= express.Router();
const formidable			= require('formidable');

const readDAO					= require("./readDAO");
const simulationDAO		= require("./simulationDAO");
const checkDAO				= require("./checkDAO");
const mergeDAO				= require("./mergeDAO");
const importDAO				= require("./importDAO");
const setAthleteDAO		= require("./setAthleteDAO");
const staticsDAO			= require("./staticsDAO");
const rankingsDAO			= require("./rankingsDAO");
const uploadTeamsDAO	= require("./uploadTeamsDAO");
const uploadTimesDAO	= require("./uploadTimesDAO");
const modifyDAO				= require("./modifyDAO");
const indexDAO				= require("./indexDAO");
const parsingPDFDAO		=  require("./parsingPDFDAO");
const downloadTimesExcelDAO = require("./downloadTimesExcelDAO");


//##################################################
//	REST API
//##################################################

/*
 *	times report
 */
router.post('/read', async (req, res, next) => {
	console.log("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~\n\n\nread\n\n\n~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~");
	try {
		const result = await readDAO.read( req.body );
		console.log("read.result=====================", result.data.slice(0,2));
		res.header = result;
		res.status(200).send(result);	
	} catch (e){
		console.log(e);
		res.status(503).send(e); 
	}
})

router.post('/check', async (req, res, next) => {
	console.log("------------------------------\n\n\ncheck\n\n\n-----------------------------");
	try {
		const result = await checkDAO.check( req.body );
		res.header = result;
		res.status(200).send(result);	
	} catch (e){
		console.log(e);
		res.status(503).send(e); 
	}
})

router.post('/deleteTime', async (req, res, next) => {
	try {
		const result = await indexDAO.deleteTime( req.body );
		res.header = result;
		res.status(200).send(result);	
	} catch (e){
		console.log(e);
		res.status(503).send(e); 
	}
})




router.post('/simulation', async (req, res, next) => {
	try {
		const result = await simulationDAO.simulation( req.body );
		res.header = result;
		res.status(200).send(result);	
	} catch (e){
		console.log(e);
		res.status(503).send(e); 
	}
})

router.post('/setAthleteID', async (req, res, next) => {
	try {
		const result = await setAthleteDAO.setAthleteID( req.body );
		res.header = result;
		res.status(200).send(result);	
	} catch (e){
		console.log(e);
		res.status(503).send(e); 
	}
})

router.post('/updateTime', async (req, res, next) => {
	try {
		const result = await indexDAO.updateTime( req.body );
		res.header = result;
		res.status(200).send(result);	
	} catch (e){
		console.log(e);
		res.status(503).send(e); 
	}
})

router.post('/readImportedTimes', async (req, res, next) => {
	try {
		const result = await readDAO.readImportedTimes( req.body );
		res.header = result;
		res.status(200).send(result);	
	} catch (e){
		console.log(e);
		res.status(503).send(e); 
	}
})

router.post('/modifyImportedTimes', async (req, res, next) => {
	try {
		const result = await modifyDAO.modifyImportedTimes( req.body );
		res.header = result;
		res.status(200).send(result);	
	} catch (e){
		console.log(e);
		res.status(503).send(e); 
	}
})

router.post('/readMongoTimes', async (req, res, next) => {
	try {
		const result = await checkDAO.readMongoTimes( req.body );
		res.header = result;
		res.status(200).send(result);	
	} catch (e){
		console.log(e);
		res.status(503).send(e); 
	}
})

router.post('/merge', async (req, res, next) => {
	try {
		const result = await mergeDAO.merge( req.body );
		res.header = result;
		res.status(200).send(result);	
	} catch (e){
		console.log(e);
		res.status(503).send(e); 
	}
})

// check된 times를 timesImport에서 읽어서 times에 import
router.post('/importTimes', async (req, res, next) => {
	try {
		const result = await importDAO.importTimes( req.body );
		res.header = result;
		res.status(200).send(result);	
	} catch (e){
		console.log(e);
		res.status(503).send(e); 
	}
})

router.post('/loadStatics', async (req, res, next) => {
	try {
		const result = await staticsDAO.loadStatics( req.body );
		res.header = result;
		res.status(200).send(result);	
	} catch (e){
		console.log(e);
		res.status(503).send(e); 
	}
})

router.post('/statisticsAll', async (req, res, next) => {
	try {
		const result = await staticsDAO.statisticsAll( req.body );
		res.header = result;
		res.status(200).send(result);	
	} catch (e){
		console.log(e);
		res.status(503).send(e); 
	}
})

router.post('/staticAthletes', async (req, res, next) => {
	try {
		const result = await staticsDAO.staticAthletes( req.body );
		res.header = result;
		res.status(200).send(result);	
	} catch (e){
		console.log(e);
		res.status(503).send(e); 
	}
})

router.post('/rankings', async (req, res, next) => {
	try {
		const result = await rankingsDAO.rankings( req.body );
		res.header = result;
		res.status(200).send(result);	
	} catch (e){
		console.log(e);
		res.status(503).send(e); 
	}
})

router.post('/uploadTeams', async (req, res, next) => {
	try {
		const result = await uploadTeamsDAO.uploadTeams( req.body );
		res.header = result;
		res.status(200).send(result);	
	} catch (e){
		console.log(e);
		res.status(503).send(e); 
	}
})

router.post('/downloadTimesExcel', async (req, res, next) => {
	try {
		const result = await downloadTimesExcelDAO.downloadTimesExcel( req.body );
		res.header = result;
		res.status(200).send(result);	
	} catch (e){
		console.log(e);
		res.status(503).send(e); 
	}
})

//***************************************************************************
// upload times FILE
//***************************************************************************
router.post('/uploadTimes', async (req, res, next) => {
	try {
		var form = new formidable.IncomingForm();
		// specify that we want to allow the user to upload multiple files in a single request
		form.multiples = true;
		//-----> parse
		form.parse(req, async (err, fields, files) => {
			//----->
			const result = await uploadTimesDAO.uploadTimes(fields, files);
			res.header = result;
			res.status(200).send(result);	
		});
	} catch (e) {
		console.log("media.uploadTimes.catch.", e);
		res.status(503).send(e); 
	}
})


//***************************************************************************
// upload FILE
//***************************************************************************
router.post('/parsingPDF', async function(req, res, next) {
	try {
		var form = new formidable.IncomingForm();
		// specify that we want to allow the user to upload multiple files in a single request
		form.multiples = true;
		//-----> parse
		form.parse(req, async (err, fields, files) => {
			console.log("2> upload.fields=", fields);
			//----->
			const result = await parsingPDFDAO.parsingPDF(fields, files);

			// let options = {};
			// // filename을 주면 download
			// options['Content-Type'] = "txt";
			// options["Content-Disposition"] = "attachment;filename=" + encodeURI("times.pdf");
			// res.writeHead(200, options);
			// res.end(result);



			res.header = result;
			res.status(200).send(result);	
		});
	} catch (e) {
		console.log("media.upload.catch.", e);
		res.status(503).send(e); 
	}
})

module.exports = router;
