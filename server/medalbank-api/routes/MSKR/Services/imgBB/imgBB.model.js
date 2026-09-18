const fs 			= require('fs');
const extend 			= require('node.extend');
const axios 		= require('axios');
const FormData 	= require('form-data');

const utilError		= require("../../Util/utilError.js");
const mongoCFG 		= require('../../Config/mongoCFG.js');
const mongoDB			= require('../../Class/MongoDB.js');
const expand = require('brace-expansion');
const mongodb	= new mongoDB(mongoCFG.Medalbank.database);


makeMeta = (result) => {
	result = result.data;
		const urlParts  = result.delete_url.split('/');
		const url = result.display_url || result.url;
		return {
			imgbbID			: result.id,
			hash				: urlParts[urlParts.length - 1],

			// title				: result.title,
			url					: result.url || result.display_url,	
			medium			: result.medium.url || url,	
			thumb				: result.thumb.url || url,  // 180 * 180

			width				: result.width,
			height			: result.height,
			size				: result.size,
			// timeStamp		: result.time,
		};
}

class ImgBBModel {

	static uploadToImgBBforURL = async (imageUrl, imageTitle) => {
		console.log("title=", imageTitle, "imageUrl=", imageUrl);
		// try {
	
			// 이미지 URL로부터 이미지 데이터를 arraybuffer로 가져옵니다.
			const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
			
			// 이미지 데이터를 Base64 문자열로 변환
			const base64Image = Buffer.from(response.data, 'binary').toString('base64');
			
			// FormData 객체 생성 후 이미지 데이터와 기타 파라미터 추가
			const form = new FormData();
			form.append('image', base64Image);
			// 필요 시 추가 파라미터(title, name 등)도 추가할 수 있습니다.
			form.append('name', imageTitle);
	
			const albumId = "medalbank";
			// 앨범 ID를 지정 (문서에서 album 파라미터 사용 가능 여부 확인 필요)
			// form.append('album', albumId);
			console.log("~~~~~~~~~1");
	
			// imgbb 업로드 API 엔드포인트
			const imgbbUrl = `https://api.imgbb.com/1/upload?key=${process.env.ImgBBKey}`;
	console.log("imgbbUrl=", imgbbUrl);
			// POST 요청으로 이미지 업로드
			const uploadResponse = await axios.post(imgbbUrl, form, {
				headers: form.getHeaders(),
			});
	
			// console.log('1>Upload successful:', uploadResponse.data);
			return makeMeta(uploadResponse.data);
		// } catch (error) {
		// 	console.error('Error uploading image:', response.data);
		// }
	}		
		
	static uploadToImgBBforFile = async (imagePath, imageTitle) => {
		const form = new FormData();
	
		/*
Upload successful: {
  data: {
    id: 'Pv60ntSm',
    title: 'athletes-1-1-featured',
    url_viewer: 'https://ibb.co/Pv60ntSm',
    url: 'https://i.ibb.co/KprSkm10/athletes-1-1-featured.jpg',
    display_url: 'https://i.ibb.co/B5CFxw1z/athletes-1-1-featured.jpg',
    width: 1080,
    height: 974,
    size: 625641,
    time: 1741756424,
    expiration: 0,
    image: {
      filename: 'athletes-1-1-featured.jpg',
      name: 'athletes-1-1-featured',
      mime: 'image/jpeg',
      extension: 'jpg',
      url: 'https://i.ibb.co/KprSkm10/athletes-1-1-featured.jpg'
    },
    thumb: {
      filename: 'athletes-1-1-featured.jpg',
      name: 'athletes-1-1-featured',
      mime: 'image/jpeg',
      extension: 'jpg',
      url: 'https://i.ibb.co/Pv60ntSm/athletes-1-1-featured.jpg'
    },
    medium: {
      filename: 'athletes-1-1-featured.jpg',
      name: 'athletes-1-1-featured',
      mime: 'image/jpeg',
      extension: 'jpg',
      url: 'https://i.ibb.co/B5CFxw1z/athletes-1-1-featured.jpg'
    },
    delete_url: 'https://ibb.co/Pv60ntSm/8e40be87c9ba99f870fd5a24954b2b96'
  },
  success: true,
  status: 200
}		
		*/
	
		try {		
			
			// FormData 객체 생성 후 이미지 데이터와 기타 파라미터 추가
			const form = new FormData();
	
			// 이미지 파일 추가
			form.append('image', fs.createReadStream(imagePath));
			
			// 필요 시 추가 파라미터(title, name 등)도 추가할 수 있습니다.
			form.append('name', imageTitle);
	
			// imgbb 업로드 API 엔드포인트
			const imgbbUrl = `https://api.imgbb.com/1/upload?key=${process.env.ImgBBKey}`;
	
			// POST 요청으로 이미지 업로드
			const uploadResponse = await axios.post(imgbbUrl, form, {
				headers: form.getHeaders(),
			});
	
			// console.log('Upload successful:', uploadResponse.data);
			return makeMeta(uploadResponse.data);
		} catch (error) {
			console.error('Error uploading image:', error.response.data);
		}
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

		// let value = extend(true, {}, body);
		// value.id = Number(value.id);
		// value.userID = Number(value.userID);
		// value.created = new Date(value.created * 1000);

		value = {
			db					: body.db.trim(),
			id					: Number(body.id),
			type				: body.type.trim(),
			userID			: Number(body.userID),
			created			: new Date(body.created * 1000),
	
			imageID			: !body.imageID 	? "" : body.imageID.trim(),
			title				: !body.title 		? "" : body.title.trim(),
			height			: !body.type 			? 0  : Number(body.height),
			width				: !body.type 			? 0  : Number(body.width),
			size				: !body.type 			? 0  : Number(body.size),
			thumb				: !body.thumb 		? "" : body.thumb.trim(),
			url					: !body.url 			? "" : body.url.trim(),
			medium			: !body.medium 		? "" : body.medium.trim(),
			deleteURL		: !body.deleteURL ? "" : body.deleteURL.trim(),
		};

		console.log("updateImagesMeta.value=", value);
		//-----------------
		// result = await mongodb.insertOne(mongoCFG.Medalbank.images, value);
		//-----------------

		const query = {};
		query[mongoCFG.collectionTable[value.db].id] = value.id; // athleteID, timeID, ...

		const collection = mongoCFG.collectionTable[body.db].collection;
		//-----------------
		const result = await mongodb.findOne(
																					collection,
																					query,
																					{ _id					: 0,
																						thumbnail		: 1,
																						featuredBB	: 1,
																						imagesBB		: 1,
																						images			: 1
																					}
																				);
		console.log("------>", collection, result.data);
		//-----------------
		switch (value.type) {
			case 'f':
			case 'featured':
				value = {
					type			: value.type,			
					featuredBB: value.url,
					thumbnail	: value.thumb,
					imageID		: value.imageID,	
				};
				//-----------------
				result = await mongodb.updateOne( // athletes, times, pools, ...
																						collection, 
																						query, 
																						value
																					);
				//-----------------
				break;
			case 'k': // kakao, SNS image
				value = {
					type		: value.type,
					snsImage: value.url,
					imageID	: value.imageID,
				};
				//-----------------
				result = await mongodb.updateOne( // athletes, times, pools, ...
																						collection, 
																						query, 
																						value
																					);
				//-----------------
				break;
			// cards: '0'~'9'
			default:
				value = {
					type		: value.type,
					url			: value.url,
					imageID	: value.imageID,
				};
				//-----------------
				result = await mongodb.updateOne( // athletes, times, pools, ...
																						collection, 
																						query, 
																						value
																					);
				//-----------------
				break;
		}
		// console.log("query=", query, body.db);
		// console.log("collectionTable=", mongoCFG.collectionTable[body.db]);
		console.log("collection.", mongoCFG.collectionTable[body.db].collection, "query.", query, "value.", value);
	}	

	static deleteImgBBimage = async (body) => {
		console.log("deleteImgBBimage.body=", body);
		try {
	
			// 이미지 URL로부터 이미지 데이터를 arraybuffer로 가져옵니다.
			
			// FormData 객체 생성 후 이미지 데이터와 기타 파라미터 추가
			const form = new FormData();
			form.append('pathname', `/${body.imgbbID}/${body.hash}`);
			// 필요 시 추가 파라미터(title, name 등)도 추가할 수 있습니다.
			form.append('action', 'delete');
	
	
			// imgbb 업로드 API 엔드포인트
			const imgbbUrl = "https://ibb.co/json";
	console.log("imgbbUrl=", imgbbUrl);
			// POST 요청으로 이미지 업로드
			const uploadResponse = await axios.post(imgbbUrl, form, {
				headers: form.getHeaders(),
			});
	
			console.log('1>deleteImgBBimage response:', uploadResponse);
			return uploadResponse;
		} catch (error) {
			console.error('Error deleteImgBBimage image:', uploadResponse);
		// }
	}			

	//####################################################################
	//####################################################################
	//####################################################################

	}
}

module.exports = ImgBBModel;

