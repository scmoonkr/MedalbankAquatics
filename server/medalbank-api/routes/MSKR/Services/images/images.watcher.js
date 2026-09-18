// imageProcessor.js - 이미지 처리 워커 프로세스
const extend 			= require('node.extend');
const sharp       = require('sharp');
const axios       = require('axios');
const fs          = require('fs');
const path        = require('path');
const FormData    = require('form-data');
const mskCFG 			= require('../../Config/mskCFG.js');
const mongoCFG 		= require('../../Config/mongoCFG.js');
const mongoDB			= require('../../Class/MongoDB.js');
const UtilDate		= require("../../Class/DateLibrary.js");
const {uploadToImgBBforFile}  = require('../imgBB/imgBB.model.js');

const mongodb	    = new mongoDB(mongoCFG.Medalbank.database);
const utilDate		= new UtilDate();


if (global == undefined || global.imagePath == undefined) {
	global.imagePath 		= "/backup/ImageMedalBank";
}

/**
 * 
 * @param {*} image 
 * @param {*} category 
 * @returns 
 */
function getImagesDirectory(image, category="images") {
  const type = image.type ?? "f";
  const imageID = image.id.toString().padStart(13, '0');
  let destPath = path.join(global.imagePath, category);
  
  destPath = path.join(destPath, image.db);
  destPath = path.join(destPath, imageID.slice(0, 4));
  destPath = path.join(destPath, imageID.slice(4, 7));
  destPath = path.join(destPath, imageID.slice(7, 10));
  destPath = `${destPath}/${image.id}-${type.slice(0, 1)}.${image.ext ?? "jpg"}`;

  return destPath.replace(/\\/gi, '/');
}

//---------------------------------
// upload to imgBB
//---------------------------------
async function upload2imgBB(image) {

  const title = `${image.db}-${image.id}-user-${image.userID}-${image.type}`;
  const featured = getImagesDirectory(image);
  console.log("-----------------------------> image.id.", image.id, featured, "title", title);

  const imageBB = await uploadToImgBBforFile(featured, title);
  console.log("-----------------------------> imageBB.", imageBB);

  return imageBB;
}

//---------------------------------
// 처리 대기 중인 이미지 조회
//---------------------------------
const processPendingImages = async () => {
  try {
    const context = {
      query: { pending: true },
      projection: { _id:0, id:1, db:1, type:1, ext:1, userID:1, },
      limit: 5,
      skip: 0,
    };
    console.log("\nwatching images for upload to imgBB");
    const images = await mongodb.find(mongoCFG.Medalbank.images, context);
    console.log("upload images.length=", images.data.length);

    //-----------------------------------
    //-----------------------------------
    for (const image of images.data) {
      //-----------------------------------
      const pathDir = getImagesDirectory(image); 
      //----------------------------------- 

      const collection = mongoCFG.collectionTable[image.db];
      console.log("collection=", collection);
      console.log("image=", image, "pathDir=", pathDir);
      console.log();

    //-----------------------------------
      const imgBB = await upload2imgBB(image);
      //-----------------------------------
      query = { db: image.db, id: image.id, type: image.type };
      let value = extend(true, {}, query);
      value.pending = false;
      value = extend(true, value, imgBB);
      //--------------------------------------
      let result = await mongodb.updateOne(mongoCFG.Medalbank.images, query, value);    
      //--------------------------------------
      console.log("update.images.query=", query, "value=", value);
      console.log();

      query = {};
      query[collection.id] = image.id; // athleteID: image.id
      value = {
        imageID   : imgBB.imageID,
      };
      if (image.type == 'f') {
        value.featuredBB  = imgBB.url;
        value.thumbnail   = imgBB.thumb;
      } else {
        value[`imagesBB.${image.type}`] = imgBB.url;
      }
      //--------------------------------------
      result = await mongodb.updateOne(collection.collection, query, value);
      //--------------------------------------
    
      console.log("update.DB", collection.collection, "query=", query, "value=", value);
      console.log();
process.exit();
      console.log("update, query, value");
    }
    //-----------------------------------

    return;
    const pendingImages = await Image.find({ status: 'pending' })
      .sort({ createdAt: 1 })
      .limit(5); // 한 번에 5개씩 처리
    
    if (pendingImages.length > 0) {
      console.log(`워커: ${pendingImages.length}개의 대기 중인 이미지 발견`);
      
      for (const image of pendingImages) {
        // 이미지 상태를 처리 중으로 업데이트
        image.status = 'processing';
        await image.save();
        
        try {
          await processImage(image);
        } catch (error) {
          console.error(`워커: 이미지 처리 오류 (ID: ${image._id}):`, error);
          
          // 이미지 상태를 실패로 업데이트
          image.status = 'failed';
          image.error = error.message;
          await image.save();
        }
      }
    }
  } catch (error) {
    console.error('워커: 대기 중인 이미지 조회 오류:', error);
  }
};
  
// MongoDB 변경 스트림 감시 함수
const watchPendingImages = async () => {
  console.log('워커: 대기 중인 이미지 감시 시작');
  while (1) {
    // 초기 실행
    await processPendingImages();
    await utilDate.sleep(2000);
    
    /*
    // 변경 스트림 설정 (MongoDB 4.0 이상 필요)
    const changeStream = Image.watch([
      { $match: { 'operationType': 'insert' } }
    ]);
    
    changeStream.on('change', async (change) => {
      console.log('워커: 새 이미지 감지됨');
      await processPendingImages();
    });
    */
    
    // 주기적으로 대기 중인 이미지 확인 (안전장치)
    // setInterval(processPendingImages, 30000);
  }
};

// 이미지 처리 및 imgBB 업로드 함수
const processImage = async (image) => {
  console.log(`워커: 이미지 처리 시작 (ID: ${image._id})`);
  
  // 파일 경로 확인
  if (!fs.existsSync(image.path)) {
    throw new Error('이미지 파일을 찾을 수 없습니다.');
  }
  
  // 이미지 리사이징 경로
  const fileInfo = path.parse(image.path);
  const resizedFilePath = path.join(
    fileInfo.dir,
    `${fileInfo.name}-resized${fileInfo.ext}`
  );
  
  try {
    // Sharp를 사용하여 이미지 리사이징
    await sharp(image.path)
      .resize({
        width: parseInt(image.width),
        height: parseInt(image.height),
        fit: 'inside',
        withoutEnlargement: true
      })
      .toFile(resizedFilePath);
    
    console.log(`워커: 이미지 리사이징 완료 (ID: ${image._id})`);
    
    // imgBB에 업로드하기 위한 FormData 생성
    const formData = new FormData();
    formData.append('key', IMGBB_API_KEY);
    formData.append('image', fs.createReadStream(resizedFilePath));
    
    // imgBB API로 이미지 업로드
    const response = await axios.post('https://api.imgbb.com/1/upload', formData, {
      headers: {
        ...formData.getHeaders()
      }
    });
    
    console.log(`워커: 이미지 imgBB 업로드 완료 (ID: ${image._id})`);
    
    // 이미지 상태 업데이트
    image.status = 'completed';
    image.imgbbUrl = response.data.data.url;
    image.deleteUrl = response.data.data.delete_url;
    await image.save();
    
    // 원본 및 리사이징된 임시 파일 삭제 (선택 사항)
    // 원본을 보관하려면 아래 코드를 주석 처리하세요
    fs.unlinkSync(image.path);
    fs.unlinkSync(resizedFilePath);
    
  } catch (error) {
    console.error(`워커: 이미지 처리/업로드 중 오류 (ID: ${image._id}):`, error);
    throw error;
  }
};

// 워커 프로세스 시작
(async () => {
  try {
    await watchPendingImages();
  } catch (error) {
    console.error('워커: 초기화 중 오류:', error);
    process.exit(1);
  }
})();

// 프로세스 종료 처리
process.on('SIGTERM', async () => {
  console.log('워커: 종료 신호 받음 (SIGTERM)');
  // await mongoose.connection.close();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('워커: 종료 신호 받음 (SIGINT)');
  // await mongoose.connection.close();
  process.exit(0);
});

// 처리되지 않은 오류 처리
process.on('uncaughtException', (error) => {
  console.error('워커: 처리되지 않은 예외:', error);
  // 심각한 오류의 경우 프로세스를 종료하고 메인 프로세스가 재시작하도록 함
  process.exit(1);
});