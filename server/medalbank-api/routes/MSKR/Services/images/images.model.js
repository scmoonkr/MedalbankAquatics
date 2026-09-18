const fs 			= require('fs');
const extend 			= require('node.extend');
const utilError		= require("../../Util/utilError.js");
const imageLibrary= require("../library/images.library.js");
const historyLibrary = require("../library/history.library.js");
const mskCFG 			= require('../../Config/mskCFG.js');
const mongoCFG 		= require('../../Config/mongoCFG.js');
const mongoDB			= require('../../Class/MongoDB.js');
const mongodb	= new mongoDB(mongoCFG.Medalbank.database);

const UtilDate		= require("../../Class/DateLibrary.js");
const imgBB				= require("../imgBB/imgBB.model.js");
const utilDate		= new UtilDate();


class ImageModel {

	


	static async detail(body){
		let returnObj = { message: "", data: {}};
		try {
		const query = { imageID: body.imageID.trim() };

		//----------------------------------------------------------------
		returnObj = await mongodb.findOne(mongoCFG.Medalbank.images, query, { _id: 0, });
		//----------------------------------------------------------------
		} catch (e) {
			console.log("images.detail.catch.", e);
			returnObj.message = "images.detail.catch." + e;
		}
		return returnObj;
	}
	static async list(body){
		let returnObj = { message: "", data: {}};
		try {
		const query = {};
		if (body.db) query.db = body.db.trim();
		if (body.tags) query.tags = body.tags.trim();

		const context = {
			query: query,
			projection: { _id:0, },
			limit: 50,
			skip: 0,
			sort: { _id: -1}
		}

		console.log("query=", query);
		//----------------------------------------------------------------
		returnObj = await mongodb.find(mongoCFG.Medalbank.images, context);
		returnObj.data = returnObj.data.reduce((acc, cur) => {
																		cur.created = cur.created.toISOString().slice(0, 10);
																		acc.push(cur);
																		return acc;
																	}, []);
		console.log("returnObj=", returnObj.count, returnObj.data.length, returnObj.data[0]);
		//----------------------------------------------------------------
		} catch (e) {
			console.log("images.detail.catch.", e);
			returnObj.message = "images.detail.catch." + e;
		}
		return returnObj;
	}

	/**
	 * 
	 * @param {*} body 
	 *              db: "athletes|times|pools|teams|competitions|items"
	 *              id: athleteID, timeID, ...
	 *              type: "f"eatured, "0"~'9'
	 * @returns
	 */
	static updateImagesMeta = async (body) => {

		body.db = body.db.trim();
		
		const query = { db: body.db, id: body.id };
		if (body.filename) query.no = body.filename;
		console.log("models.updateImagesMeta.body=", query, body);
		let result = await mongodb.updateOne(
																				mongoCFG.Medalbank.images, 
																				query, 
																				body
																			);
		return { message: "", data: body };
	}		
	static updateImgbbMeta = async (body) => {
		console.log("updateImgbbMeta.body=", body);
		//-----------------
		if (!body.imageID) {
			body.imageID = await mongodb.max(mongoCFG.Medalbank.images, "imageID")
		}
		const query = { imageID: Number(body.imageID) };

		const result = await mongodb.updateOne(mongoCFG.Medalbank.images, query, body);
		return { message: "", data: body };
	}		
	static listAidenImagesMeta = async (body) => {
		console.log("listAidenImagesMeta.body=", body);
		//-----------------
		const query = {};
		if (body.competitionID				) query.competitionID = Number(body.competitionID);
		// if (body.gender							) query.gender = body.gender;
		if (body.style								) query.style = body.style;
		// if (body.distance						) query.distance = body.competitionID;
		if (body.name								) query.name = new RegExp(body.name.trim(), "gi");
		
		const context = {
			query			: query,
			projection: { _id: 0, style: 1, imageID:1, name:1, thumb:1, medium:1, url:1 },
			limit			: 5000,
			skip			: 0,
		};
		if (body.type) context.projection[body.type] = 1;

		const result = await mongodb.find(mongoCFG.Medalbank.imagesAiden, context);

		// result.data.forEach(el => {
		// 	el.medium = el.medium || el.display_url;
		// })
		console.log("listAidenImagesMeta.result=", result.data);
		//-----------------
		return result;
	}			
	static listCompetition = async (body) => {
		console.log("listCompetition.body=", body);
		//-----------------
		const query = {};
		
		const aggregate = [
			{ $group: {
					_id: { competitionID: "$competitionID", competitionName: "$competitionName" }
				}
			},
			{ $project: { competitionID: "$_id.competitionID", competitionName: "$_id.competitionName",_id:0 }},
			{ $limit: 100 },
			{ $skip: 0 },
		];
		const result = await mongodb.aggregate(mongoCFG.Medalbank.imagesAiden, aggregate);
		console.log("listCompetition.result=", result.data);
		// const context = {
		// 	query			: {},
		// 	projection: { _id: 0, competitionID:1, competitionName:1, },
		// 	limit			: 100,
		// 	skip			: 0,
		// };

		// const result = await mongodb.find(mongoCFG.Medalbank.imagesAiden, context);
		//-----------------
		return result;
	}				
	static insertAidenImagesMeta = async (body) => {
		console.log("insertAidenImagesMeta.body=", body);
		//-----------------
		body.imageID = await mongodb.max(mongoCFG.Medalbank.imagesAiden, "imageID");
		body.created = new Date();
		const result = await mongodb.insertOne(mongoCFG.Medalbank.imagesAiden, body);
		//-----------------
		return { message: "", data: { imageID: body.imageID } };
	}
	static updateAidenImagesMeta = async (body) => {
		console.log("updateAidenImagesMeta.body=", body);
		//-----------------
		body.imageID = Number(body.imageID);
		const query = { imageID: body.imageID };
		const result = await mongodb.updateOne(mongoCFG.Medalbank.imagesAiden, query, body);
		//-----------------
		return { message: "", data: "ok" };
	}			
	static deleteAidenImagesMeta = async (body) => {
		console.log("deleteAidenImagesMeta.body=", body);
		//-----------------
		const query = { imageID: Number(body.imageID) };
		const image = await mongodb.findOne(mongoCFG.Medalbank.imagesAiden, query, { _id:0, imageID:1, imgbbID:1, hash:1, });
		if (!image.data.imageID) {
			console.log("image meta not found.imageID=", body.imageID);
			return { message: "image meta not found", data: "" };
		}
console.log("image meta:", image.data);

		//-----> delete imgBB image
		await imgBB.deleteImgBBimage({ imgbbID: image.data.imgbbID, hash: image.data.hash, });

		//-----> delete image meta
		const result = await mongodb.deleteOne(mongoCFG.Medalbank.imagesAiden, query);
		//-----------------
		return { message: "", data: "ok" };
	}		
	//####################################################################
	//####################################################################
	//####################################################################

	/**
	 * static saveAthleteWithImage 함수
	 * 
	 * 이 함수는 선수 데이터를 데이터베이스에 저장하거나 업데이트합니다.
	 * 관련된 대표 이미지를 처리하며, 필요 시 시간 데이터를 업데이트합니다.
	 *
	 * @param {Object} body - 선수 데이터를 포함하는 객체
	 *    db: 'athletes|times|competitions|pools|teams|items'
	 *    id: athleteID, timeID, ...
	 *    type: 'f'eatured, '0'~'9'
	 * @param {string} [body.sourcePath] - 저장할 이미지 파일의 경로
	 * @returns {Promise<Object>} 저장된 선수 ID와 메시지를 포함하는 객체
	 */
	static async saveImage(body) {
		console.log("images.model.saveImage.body=", body);

		// 'f'eatured, 't'humbnail, '0'~'9'
		if (body.fileType=="featured") body.fileType = 'f';
		body.id 			= Number(body.id);
		body.userID		= body.userID ? Number(body.userID) : 0;
		body.db 			= body.db ?? 'athletes';
		// --------------------------------------------------------------
		// 대표 이미지 처리
		// --------------------------------------------------------------
		if (body.sourcePath) {
			// 이미지 저장 및 경로 설정
			const result = await imageLibrary.saveFile(
																					body.sourcePath, 
																					"images", 
																					body.db, 
																					body.id, 
																					body.fileType,	// 'f'eatured, 't'humbnail, '0'~'9'
																				);
		}

		// --------------------------------------------------------------
		// update images
		// --------------------------------------------------------------
		const queryImage = {
			db			: body.db,
			id			: body.id,
			type		: body.fileType,
		};
		const updateImages = {
			...queryImage,
			pending	: true,
		}
		if (body.userID) {
			queryImage.userID 	= body.userID;
			updateImages.userID = body.userID;
		}
		//-----------------
		// update images
		//-----------------
		await mongodb.updateOne(
															mongoCFG.Medalbank.images, 
															queryImage, 
															updateImages,
														);
		//-----------------
console.log("-----------> queryImage=", queryImage, "updateImages=", updateImages);
		// --------------------------------------------------------------

		// --------------------------------------------------------------
		// update DB
		// --------------------------------------------------------------
		if (body.db == "images") {
			return { message: 'images save ok', };
		}
		const collectionTable = mongoCFG.collectionTable[body.db];
		console.log("images.model.saveImage.collection=", body.db, "id=", body.id, collectionTable,);
		
		const queryDB = {};
		queryDB[collectionTable.id] = body.id;

		let updateDB = {};
		const featured = `/cms/images/${body.db}/${body.id}/${body.fileType.slice(0, 1)}`;
		if (body.fileType == 'f') {
			updateDB =  {
										fileType: 'f',
										featured: featured, // '/cms/images/athletes/1/f'
										thumbnail: `/cms/images/${body.db}/${body.id}/t`,
									}
		} else {
			// update: { '0': '/cms/images/athletes/1/0' }
			updateDB[body.fileType] = featured;
		}
		updateDB.imgBB = false;
		updateDB.featuredBB = null;

		//-----------------
		// update athletes, times, 
		//-----------------
	console.log("4---> updateDB.db=", updateDB, "ctcollectionTableable=", collectionTable);
		await mongodb.updateOne(
			collectionTable.collection, 
			queryDB, 
			updateDB,
		);
		console.log("----------> db",
			collectionTable.collection, 
			"query=", queryDB, 
			"update=", updateDB,
		);
		const result = { message: "", data: { imageUrl: updateDB.featured } };
console.log("saveImage.result==", result);
		return result;
	}
	


	static async viewImage(body){
	
			const returnObj = { message: "", data: {}};
		let result ={}				
		try {
		const query = {};
		const dbID = mongoCFG.collectionTable[body.db].id; // athleteID, timeID, ...
		query[dbID] = Number(body.id);
		

		//----------------------------------------------------------------
		result = await mongodb.findOne(mongoCFG.collectionTable[body.db].collection, query, { _id: 0, });
		//----------------------------------------------------------------		if (result.data.email) {   // object null check ECMA 5+:
		if (!result.data[dbID]) return utilError.errorMSG("Model","images", "athlete", "athleteID not found");

		const metaTitle = `${result.data.name}#${body.id}`;
		const html = 
`
<!DOCTYPE html>
<html lang="ko">
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<title>${metaTitle}</title>

	<meta name="apple-mobile-web-app-capable" content="yes">
	<meta name="apple-mobile-web-app-status-bar-style" content="black">
	<meta name="apple-mobile-web-app-title" content="${metaTitle}">

	<meta property="og:url" content="${global.medalbankHomeURL}/">
	<meta property="og:title" content="${metaTitle}">
	<meta property="og:type" content="website">
	<meta property="og:image" content="${global.medalbankHomeURL}/images/logo_with.png">
	<meta property="og:description" content="대한민국 마스터즈 수영의 오늘">

	<style>
		* {
			margin: 0;
			padding: 0;
			box-sizing: border-box;
		}

		body {
			background-color: #f0f0f0;
			font-family: Arial, sans-serif;
			padding: 20px;
		}

		.viewmore {
			text-decoration:none;
		}


		.viewmore div {
			position: relative;
			max-width: 640px;
			margin: 0 auto;
			padding: 20px;
			background-color:#e5e5e5;
			transition: transform 0.3s ease;
			cursor: pointer;
		}

		.viewmore div span {
			font-size: 16px;
			color: #000;
		}

		.viewmore div:hover {
			background-color:#000;
			transform: translateY(-5px);
		}

		.viewmore div:hover span {
			font-size: 16px;
			color: #fff;
		}

		.gallery-container {
			max-width: 640px;
			margin: 0 auto;
		}

		.gallery-grid {
			display: grid;
			grid-template-columns: repeat(auto-fill, minmax(100%, 1fr));
			gap: 20px;
		}

		.gallery-item {
			position: relative;
			overflow: hidden;
			background-color: white;
			transition: transform 0.3s ease;
		}

		.gallery-item:hover {
			transform: translateY(-5px);
		}

		.gallery-item img {
			width: 100%;
			object-fit: cover;
			display: block;
		}
	</style>
</head>
<body>
<div class="gallery-container">
	<div class="gallery-grid" id="galleryGrid">
		<!-- Images will be inserted here -->
	</div>
</div>
<div style="height:20px;"></div>
<a class="viewmore" href="${global.medalbankHomeURL}/${mongoCFG.collectionTable[body.db].url}/${body.id}" target="_new">
	<div>
		<span>자세히 보기</span>
	</div>
</a>


<script>
	function getUrlParameter(name) {
		const urlParams = new URLSearchParams(window.location.search);
		return urlParams.get(name);
	}

	function loadImages() {
		// 새로운 og:title 설정
		document.querySelector('meta[property="og:title"]').setAttribute("content", '테스트테스트테스트111');
		document.title = '테스트테스트테스트'; // 브라우저 탭 제목도 변경

		const galleryGrid = document.getElementById('galleryGrid');

		const imageUrl = '${global.nodeServerURL}/cms/images/${body.db}/${body.id}/${body.no}' ;
		console.log("imageUrl=", imageUrl);
		const galleryItem = document.createElement('div');
		galleryItem.className = 'gallery-item';

		const img = document.createElement('img');
		img.src = imageUrl;
		img.alt = '${metaTitle} Image';

		galleryItem.appendChild(img);
		galleryGrid.appendChild(galleryItem);
	}


	// Load images when page loads
	window.onload = loadImages;
</script>
</body>
</html>
`;      
		return html;
		} catch (e) {
			return utilError.errorMSG("Model","login", "login", "findOne.catch." + e);
		} 
		
		}
	
		static async viewImages(body){
			const returnObj = { message: "", data: {}};
			let result ={}				
			try {
				const query = {};
				const dbID = mongoCFG.collectionTable[body.db].id; // athleteID, timeID, ...
				query[dbID] = Number(body.id);				
		
				//----------------------------------------------------------------
				result = await mongodb.findOne(mongoCFG.collectionTable[body.db].collection, query, { _id: 0, });
				//----------------------------------------------------------------		if (result.data.email) {   // object null check ECMA 5+:
				if (!result.data[dbID]) return utilError.errorMSG("Model","images", "athlete", "id not found");

			const athlete = result.data;
			const metaTitle = `${result.data.name}#${dbID}`;
			const html = 
`
<!DOCTYPE html>
<html lang="ko">
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<title>${metaTitle}</title>

	<meta name="apple-mobile-web-app-capable" content="yes">
	<meta name="apple-mobile-web-app-status-bar-style" content="black">
	<meta name="apple-mobile-web-app-title" content="${metaTitle}">

	<meta property="og:url" content="${global.medalbankHomeURL}/">
	<meta property="og:title" content="${metaTitle}">
	<meta property="og:type" content="website">
	<meta property="og:image" content="${global.medalbankHomeURL}/images/logo_with.png">
	<meta property="og:description" content="대한민국 마스터즈 수영의 오늘">

	<style>
		* {
			margin: 0;
			padding: 0;
			box-sizing: border-box;
		}

		body {
			background-color: #f0f0f0;
			font-family: Arial, sans-serif;
			padding: 20px;
		}

		.viewmore {
			text-decoration:none;
		}


		.viewmore div {
			position: relative;
			max-width: 640px;
			margin: 0 auto;
			padding: 20px;
			background-color:#e5e5e5;
			transition: transform 0.3s ease;
			cursor: pointer;
		}

		.viewmore div span {
			font-size: 16px;
			color: #000;
		}

		.viewmore div:hover {
			background-color:#000;
			transform: translateY(-5px);
		}

		.viewmore div:hover span {
			font-size: 16px;
			color: #fff;
		}

		.gallery-container {
			max-width: 640px;
			margin: 0 auto;
		}

		.gallery-grid {
			display: grid;
			grid-template-columns: repeat(auto-fill, minmax(100%, 1fr));
			gap: 20px;
		}

		.gallery-item {
			position: relative;
			overflow: hidden;
			background-color: white;
			transition: transform 0.3s ease;
		}

		.gallery-item:hover {
			transform: translateY(-5px);
		}

		.gallery-item img {
			width: 100%;
			object-fit: cover;
			display: block;
		}
	</style>
</head>
<body>
<div class="gallery-container">
	<div class="gallery-grid" id="galleryGrid">
		<!-- Images will be inserted here -->
	</div>
</div>
<div style="height:20px;"></div>
<a class="viewmore" href="${global.medalbankHomeURL}/${mongoCFG.collectionTable[body.db].url}/${body.id}" target="_new">
	<div>
		<span>자세히 보기</span>
	</div>
</a>


<script>
	function getUrlParameter(name) {
		const urlParams = new URLSearchParams(window.location.search);
		return urlParams.get(name);
	}

const url  = "${global.nodeServerURL}/cms/images/";
	function loadImages() {
// 새로운 og:title 설정
		document.querySelector('meta[property="og:title"]').setAttribute("content", '테스트테스트테스트111');
		document.title = '테스트테스트테스트'; // 브라우저 탭 제목도 변경

		const galleryGrid = document.getElementById('galleryGrid');

		for (let index=0; index<=${body.no}; index++) {
			const imageUrl = '${global.nodeServerURL}/cms/images/${body.db}/${body.id}/' + index ;
			const galleryItem = document.createElement('div');
			galleryItem.className = 'gallery-item';

			const img = document.createElement('img');
			img.src = imageUrl;
			img.alt = '${metaTitle} Image';

			galleryItem.appendChild(img);
			galleryGrid.appendChild(galleryItem);
		}
	}


	// Load images when page loads
	window.onload = loadImages;
</script>
</body>
</html>
`;      
		return html;
		} catch (e) {
			return utilError.errorMSG("Model","login", "login", "findOne.catch." + e);
		} 
		
		}
	

		static async viewImageImage(body){
	
			const returnObj = { message: "", data: {}};
		let result ={}				
		try {
		const query = {};
		const dbID = mongoCFG.collectionTable[body.db].id; // athleteID, timeID, ...
		query[dbID] = Number(body.id);
		

		//----------------------------------------------------------------
		result = await mongodb.findOne(mongoCFG.collectionTable[body.db].collection, query, { _id: 0, });
		//----------------------------------------------------------------		if (result.data.email) {   // object null check ECMA 5+:
		if (!result.data[dbID]) return utilError.errorMSG("Model","images", "viewImageImage", "id not found");

		let nameField = "name";
		switch (body.db) {
			case "competitions":
			case "pools":
				nameField = "fullname";
				break;
			default:
			// case "users":
			// case "users":
			// case "teams":
			// case "times":
			// case "athletes":
				nameField = "name";
				break;
		}
	const athlete = result.data;
	const metaTitle = `${result.data[nameField]}#${dbID}`;
console.log("metaTitle=", metaTitle);

		const url  = `${global.nodeServerURL}/cms/images/`;
		
		const html = 
`
<!DOCTYPE html>
<html lang="ko">
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<title>${metaTitle}</title>

	<meta name="apple-mobile-web-app-capable" content="yes">
	<meta name="apple-mobile-web-app-status-bar-style" content="black">
	<meta name="apple-mobile-web-app-title" content="${metaTitle}">

	<meta property="og:url" content="${global.medalbankHomeURL}/">
	<meta property="og:title" content="${metaTitle}">
	<meta property="og:type" content="website">
	<meta property="og:image" content="${global.medalbankHomeURL}/images/logo_with.png">
	<meta property="og:description" content="대한민국 마스터즈 수영의 오늘">

	<style>
		* {
			margin: 0;
			padding: 0;
			box-sizing: border-box;
		}

		body {
			background-color: #f0f0f0;
			font-family: Arial, sans-serif;
			padding: 20px;
		}

		.viewmore {
			text-decoration:none;
		}


		.viewmore div {
			position: relative;
			max-width: 640px;
			margin: 0 auto;
			padding: 20px;
			background-color:#e5e5e5;
			transition: transform 0.3s ease;
			cursor: pointer;
		}

		.viewmore div span {
			font-size: 16px;
			color: #000;
		}

		.viewmore div:hover {
			background-color:#000;
			transform: translateY(-5px);
		}

		.viewmore div:hover span {
			font-size: 16px;
			color: #fff;
		}

		.gallery-container {
			max-width: 640px;
			margin: 0 auto;
		}

		.gallery-grid {
			display: grid;
			grid-template-columns: repeat(auto-fill, minmax(100%, 1fr));
			gap: 20px;
		}

		.gallery-item {
			position: relative;
			overflow: hidden;
			background-color: white;
			transition: transform 0.3s ease;
		}

		.gallery-item:hover {
			transform: translateY(-5px);
		}

		.gallery-item img {
			width: 100%;
			object-fit: cover;
			display: block;
		}
	</style>
</head>
<body>
<div class="gallery-container">
	<div class="gallery-grid" id="galleryGrid">
		<!-- Images will be inserted here -->
	</div>
</div>
<div style="height:20px;"></div>
<a class="viewmore" href="${global.medalbankHomeURL}/${mongoCFG.collectionTable[body.db].url}/${body.id}" target="_new">
	<div>
		<span>자세히 보기</span>
	</div>
</a>


<script>
	function getUrlParameter(name) {
		const urlParams = new URLSearchParams(window.location.search);
		return urlParams.get(name);
	}

	function loadImages() {
		// 새로운 og:title 설정
		document.querySelector('meta[property="og:title"]').setAttribute("content", '테스트테스트테스트111');
		document.title = '테스트테스트테스트'; // 브라우저 탭 제목도 변경

		const galleryGrid = document.getElementById('galleryGrid');

		const imageUrl = '${global.nodeServerURL}/cms/images/${body.db}/${body.id}/${body.no}' ;
		console.log("imageUrl=", imageUrl);
		const galleryItem = document.createElement('div');
		galleryItem.className = 'gallery-item';

		const img = document.createElement('img');
		img.src = imageUrl;
		img.alt = '${metaTitle} Image';

		galleryItem.appendChild(img);
		galleryGrid.appendChild(galleryItem);
	}


	// Load images when page loads
	window.onload = loadImages;
</script>
</body>
</html>
`;      
		return html;
		} catch (e) {
			return utilError.errorMSG("Model","login", "login", "findOne.catch." + e);
		} 
		
		}
	
		static async viewImageImages(body){
			const returnObj = { message: "", data: {}};
			let result ={}				
			try {
				const query = {};
				const dbID = mongoCFG.collectionTable[body.db].id; // athleteID, timeID, ...
				query[dbID] = Number(body.id);				
		
				//----------------------------------------------------------------
				result = await mongodb.findOne(mongoCFG.collectionTable[body.db].collection, query, { _id: 0, });
				//----------------------------------------------------------------		if (result.data.email) {   // object null check ECMA 5+:
				if (!result.data[dbID]) return utilError.errorMSG("Model","images", "athlete", "id not found");

				let nameField = "name";
				switch (body.db) {
					case "competitions":
					case "pools":
						nameField = "fullname";
						break;
					default:
					// case "users":
					// case "users":
					// case "teams":
					// case "times":
					// case "athletes":
						nameField = "name";
						break;
				}
			const athlete = result.data;
			const metaTitle = `${result.data[nameField]}#${dbID}`;
console.log("metaTitle=", metaTitle);

			const html = 
`
<!DOCTYPE html>
<html lang="ko">
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<title>${metaTitle}</title>

	<meta name="apple-mobile-web-app-capable" content="yes">
	<meta name="apple-mobile-web-app-status-bar-style" content="black">
	<meta name="apple-mobile-web-app-title" content="${metaTitle}">

	<meta property="og:url" content="${global.medalbankHomeURL}/">
	<meta property="og:title" content="${metaTitle}">
	<meta property="og:type" content="website">
	<meta property="og:image" content="${global.medalbankHomeURL}/images/logo_with.png">
	<meta property="og:description" content="대한민국 마스터즈 수영의 오늘">

	<style>
		* {
			margin: 0;
			padding: 0;
			box-sizing: border-box;
		}

		body {
			background-color: #f0f0f0;
			font-family: Arial, sans-serif;
			padding: 20px;
		}

		.viewmore {
			text-decoration:none;
		}


		.viewmore div {
			position: relative;
			max-width: 640px;
			margin: 0 auto;
			padding: 20px;
			background-color:#e5e5e5;
			transition: transform 0.3s ease;
			cursor: pointer;
		}

		.viewmore div span {
			font-size: 16px;
			color: #000;
		}

		.viewmore div:hover {
			background-color:#000;
			transform: translateY(-5px);
		}

		.viewmore div:hover span {
			font-size: 16px;
			color: #fff;
		}

		.gallery-container {
			max-width: 640px;
			margin: 0 auto;
		}

		.gallery-grid {
			display: grid;
			grid-template-columns: repeat(auto-fill, minmax(100%, 1fr));
			gap: 20px;
		}

		.gallery-item {
			position: relative;
			overflow: hidden;
			background-color: white;
			transition: transform 0.3s ease;
		}

		.gallery-item:hover {
			transform: translateY(-5px);
		}

		.gallery-item img {
			width: 100%;
			object-fit: cover;
			display: block;
		}
	</style>
</head>
<body>
<div class="gallery-container">
	<div class="gallery-grid" id="galleryGrid">
		<!-- Images will be inserted here -->
	</div>
</div>
<div style="height:20px;"></div>
<a class="viewmore" href="${global.medalbankHomeURL}/${mongoCFG.collectionTable[body.db].url}/${body.id}" target="_new">
	<div>
		<span>자세히 보기</span>
	</div>
</a>


<script>
	function getUrlParameter(name) {
		const urlParams = new URLSearchParams(window.location.search);
		return urlParams.get(name);
	}

const url  = "${global.nodeServerURL}/cms/images/";
<!--const url  = "http://localhost:6600/cms/images/";-->
	function loadImages() {
// 새로운 og:title 설정
		document.querySelector('meta[property="og:title"]').setAttribute("content", '테스트테스트테스트111');
		document.title = '테스트테스트테스트'; // 브라우저 탭 제목도 변경

		const galleryGrid = document.getElementById('galleryGrid');

		for (let index=0; index<=${body.no}; index++) {
			const imageUrl = '${global.nodeServerURL}/cms/images/${body.db}/${body.id}/' + index ;
			const galleryItem = document.createElement('div');
			galleryItem.className = 'gallery-item';

			const img = document.createElement('img');
			img.src = imageUrl;
			img.alt = '${metaTitle} Image';

			galleryItem.appendChild(img);
			galleryGrid.appendChild(galleryItem);
		}
	}


	// Load images when page loads
	window.onload = loadImages;
</script>
</body>
</html>
`;      
		return html;
		} catch (e) {
			return utilError.errorMSG("Model","login", "login", "findOne.catch." + e);
		} 
		
		}
	
}

module.exports = ImageModel;

