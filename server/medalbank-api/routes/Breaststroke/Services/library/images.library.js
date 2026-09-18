// images.library.js

const fs = require('fs');
const fsPromises = fs.promises;
const sharp = require('sharp');
const path = require('path');
const multer = require('multer');
const { promisify } = require('util');
const { glob } = require('glob');
const globAsync = promisify(glob);
const mongoCFG = require('../../Config/mongoCFG.js');
const mongoDB = require('../../Class/MongoDB.js');
const mongodb = new mongoDB(mongoCFG.Medalbank.database);


const global = {};
global.WebSocketPort =  process.env.WebSocketPort;

global.avatarPath			= "/backup/ImageMedalBank/avatar";
global.thumbnailPath	= "/backup/ImageMedalBank/thumbnail";
global.imagePath			= "/backup/ImageMedalBank";
global.uploadPath			= "/backup/ImageMedalBank";
global.originalPath		= "/backup/ImageMedalBank/original";
global.bikesPath			= "/backup/Bikes";
global.loanConfig			= {};
global.access_token		= ""; // naver smartstore
global.rootPath				= "C:\\Develop\\Node\\Medalbank";


/**
 * 디렉토리 존재 여부 확인 후 없으면 생성 (Promise 기반)
 * @param {string} dirPath 
 */
async function ensureDir(dirPath) {
  try {
    await fsPromises.mkdir(dirPath, { recursive: true });
    // console.log(`[ensureDir] Directory ensured: ${dirPath}`);
  } catch (error) {
    if (error.code !== 'EEXIST') {
      // console.error(`[ensureDir] Error ensuring directory ${dirPath}:`, error);
      throw error;
    }
  }
}

/* ===============================
   Multer Storage 설정
   =============================== */
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    // console.log("storage...");
    const uploadPath = path.join(global.rootPath, 'uploads');
    // console.log(`[Multer Storage] Upload path: ${uploadPath}`);
    try {
      await ensureDir(uploadPath);
      cb(null, uploadPath);
    } catch (error) {
      console.error('[Multer Storage] Error in destination:', error);
      cb(error);
    }
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const fileName = `${Date.now()}-${Math.round(Math.random() * 1E9)}${ext}`;
    // console.log(`[Multer Storage] Generated filename: ${fileName}`);
    cb(null, fileName);
  }
});

exports.upload = multer({
  storage: storage,
  limits: { fileSize: 100 * 1024 * 1024 }
});

/* ===============================
   파일 삭제 함수 (강제 삭제 및 rename fallback 포함)
   =============================== */
/**
 * 특정 패턴에 맞는 파일을 삭제하는 함수 (Promise 기반)
 * @param {string} pattern - 삭제할 파일 경로 패턴
 */
exports.deleteFilesByPattern = async (pattern) => {
  // console.log(`[deleteFilesByPattern] Pattern: ${pattern}`);
  try {
    const normalizedPattern = pattern.replace(/\\/g, '/');
    const filesRaw = await globAsync(normalizedPattern);
    const files = Array.from(new Set(filesRaw)); // 중복 제거
    // console.log(`[deleteFilesByPattern] Found files: ${JSON.stringify(files)}`);
    if (!files || files.length === 0) {
      // console.log("[deleteFilesByPattern] No files found matching the pattern.");
      return;
    }
    for (const file of files) {
      try {
        // console.log(`[deleteFilesByPattern] Attempting to delete file: ${file}`);
        await fsPromises.unlink(file);
        // console.log(`[deleteFilesByPattern] Deleted file: ${file}`);
      } catch (err) {
        if (err.code === 'EPERM') {
          // console.warn(`[deleteFilesByPattern] EPERM error when deleting ${file}. Attempting chmod and force removal.`);
          try {
            await fsPromises.chmod(file, 0o666);
            // force removal (Node 14 이상 지원)
            await fsPromises.rm(file, { force: true });
            // console.log(`[deleteFilesByPattern] Deleted file after force removal: ${file}`);
          } catch (err2) {
            // console.warn(`[deleteFilesByPattern] Force removal failed for ${file}. Attempting rename fallback.`);
            // rename fallback: 파일을 임시 이름으로 변경 후 삭제
            const tempName = file + ".tmp";
            try {
              await fsPromises.rename(file, tempName);
              // console.log(`[deleteFilesByPattern] Renamed file to temporary name: ${tempName}`);
              await fsPromises.unlink(tempName);
              // console.log(`[deleteFilesByPattern] Deleted temporary file: ${tempName}`);
            } catch (renameErr) {
              // console.error(`[deleteFilesByPattern] Failed to rename and delete ${file}:`, renameErr);
            }
          }
        } else {
          console.error(`[deleteFilesByPattern] Error deleting file ${file}:`, err);
        }
      }
      // 삭제 후 파일 존재 여부 확인
      try {
        await fsPromises.access(file);
        // console.warn(`[deleteFilesByPattern] File still exists after deletion attempt: ${file}`);
      } catch (_) {
        // console.log(`[deleteFilesByPattern] Confirmed file no longer exists: ${file}`);
      }
    }
  } catch (err) {
    // console.error(`[deleteFilesByPattern] Overall error:`, err);
  }
  // console.log("[deleteFilesByPattern] Finished processing pattern.");
};

/* ===============================
   이미지 리사이즈 함수
   =============================== */
/**
 * 비율 유지하면서 리사이즈하는 함수
 * @param {string} inputPath - 원본 파일 경로
 * @param {string} outputPath - 출력 파일 경로
 * @param {number|null} width - 너비 (null이면 자동)
 * @param {number|null} height - 높이 (null이면 자동)
 */
exports.resizeImageMaintainAspect = async (inputPath, outputPath, width, height) => {
  // console.log(`[resizeImageMaintainAspect] Input: ${inputPath}`);
  // console.log(`[resizeImageMaintainAspect] Output: ${outputPath}`);
  // console.log(`[resizeImageMaintainAspect] Width: ${width}, Height: ${height}`);
  try {
    await ensureDir(path.dirname(outputPath));
    // console.log(`[resizeImageMaintainAspect] Waiting 1000ms before resizing...`);
    // await new Promise(resolve => setTimeout(resolve, 100));
    await sharp(inputPath)
      .rotate() // 자동 회전
      .resize(width, height, {
        withoutEnlargement: true,
        fit: 'inside'
      })
      .jpeg({ quality: 100 })
      .toFile(outputPath);
    // console.log(`[resizeImageMaintainAspect] Image resized successfully: ${outputPath}`);
  } catch (error) {
    console.error(`[resizeImageMaintainAspect] Error processing image: ${outputPath}`, error);
    throw error;
  }
};

/* ===============================
   파일 저장 및 메타 업데이트 함수
   =============================== */
/**
 * 파일을 저장하고 원본 파일을 삭제한 후 MongoDB 메타데이터를 업데이트하는 함수
 * @param {string} sourceFile - 원본 파일 경로
 * @param {string} category - 파일을 저장할 카테고리 (예: "images")
 * @param {string} db - 하위 폴더명 (예: "athletes" 또는 "times")
 * @param {number} imageID - 이미지 ID (폴더 및 파일명 생성에 사용)
 * @param {string} [type='f'] - 파일 타입 ('f': featured, 't': thumbnail, 기타)
 * @returns {Object} 저장된 파일의 경로와 파일명
 */
exports.saveFile = async (sourceFile, category, db, imageID, type = 'f') => {
  // console.log(`[saveFile] Source File: ${sourceFile}`);
  // console.log(`[saveFile] Category: ${category}, DB: ${db}, ImageID: ${imageID}, Type: ${type}`);
  
  // imageID를 13자리 문자열로 변환 (예: "0000000000001")
  const fullID = imageID.toString().padStart(13, '0');
  // global.imagePath는 반드시 절대 경로(예: "C:\\backup\\ImageMedalBank")여야 함
  // console.log(`[saveFile] global.imagePath: ${global.imagePath}`);
  const rootPath = path.join(global.imagePath, category);
  // console.log(`[saveFile] Root Path: ${rootPath}`);
  let destPath = '';
  
  try {
    // 1. 최상위 폴더 생성
    await ensureDir(path.join(rootPath, destPath));
    // 2. 카테고리 하위 폴더 생성 (db)
    destPath = path.join(destPath, db);
    await ensureDir(path.join(rootPath, destPath));
    // 3. 계층적 폴더 생성 (예: "0000/000/000")
    destPath = path.join(destPath, fullID.slice(0, 4));
    await ensureDir(path.join(rootPath, destPath));
    destPath = path.join(destPath, fullID.slice(4, 7));
    await ensureDir(path.join(rootPath, destPath));
    destPath = path.join(destPath, fullID.slice(7, 10));
    await ensureDir(path.join(rootPath, destPath));
    
    // 4. 파일명 설정 (원본 확장자 jfif는 jpg로 변경)
    const ext = path.extname(sourceFile).replace(/jfif/i, 'jpg');
    const file = `${imageID}-${type}`; // 예: "1-f"
    const filename = `${file}${ext}`;
    const destinationPath = path.join(rootPath, destPath, filename);
    // console.log(`[saveFile] Destination Path: ${destinationPath}`);
    
    // 5. 기존 동일 파일 삭제
    const deletePattern = path.join(rootPath, destPath, `${file}.*`);
    // console.log(`[saveFile] Deleting files matching: ${deletePattern}`);
    await exports.deleteFilesByPattern(deletePattern);
    
    // 6. 파일 리사이즈 및 저장 (출력 경로는 JPEG 확장자로 변경)
    let outputPath = destinationPath.replace(/\.(jpg|jpeg|png|gif|webp|svg|tiff|tif|raw|bmp|heif|heic|psd|ai|eps|ico|jfif|jp2|jpx|j2k|j2c|fpx|pcd)$/i, '.jpg');
    // console.log(`[saveFile] Resizing image from ${sourceFile} to ${outputPath}`);
    await exports.resizeImageMaintainAspect(sourceFile, outputPath, type === "f" ? 1080 : 640,null);
    
    // 7. MongoDB 메타데이터 업데이트
    const value = {
      category: category,
      db: db,
      id: imageID.toString(),
      type: type,
      ext: "jpg",
      group: type,
      mtime: new Date(),
      name: filename.replace(/\.(jpg|jpeg|png|gif|webp|svg|tiff|tif|raw|bmp|heif|heic|psd|ai|eps|ico|jfif|jp2|jpx|j2k|j2c|fpx|pcd)$/i, '.jpg'),
      filename: sourceFile.replace(/uploads/gi, "").replace(/\\|\//gi, ""),
      path: destPath.replace(/\\/g, "/"),
      url: `/cms/${category}/${db}/${imageID}/${type}`
    };
    const query = {
      category: value.category,
      db: value.db,
      id: value.id,
      type: value.type,
    };
    // console.log(`[saveFile] MongoDB update query:`, query);
    // console.log(`[saveFile] MongoDB update data:`, value);
    await mongodb.updateOne(mongoCFG.Medalbank.mediaServer, query, value);
    
    // 8. featured 이미지인 경우 썸네일 생성
    if (type === "f") {
      const thumbnail = outputPath.replace("-f.jpg", "-t.jpg");
      // console.log(`[saveFile] Creating thumbnail: ${thumbnail}`);
      await exports.resizeImageMaintainAspect(outputPath, thumbnail, null, 96);
    }
    
    // 9. 파일 삭제 전 대기 (1000ms)
    // console.log(`[saveFile] Waiting 1000ms before deleting source file...`);
    await new Promise(resolve => setTimeout(resolve, 100));
    try {
      if (fs.existsSync(sourceFile)) {
        // console.log(`[saveFile] Source file exists before deletion: ${sourceFile}`);
      } else {
        // console.warn(`[saveFile] Source file does not exist before deletion: ${sourceFile}`);
      }
      await fsPromises.unlink(sourceFile);
      // console.log(`[saveFile] Source file deleted: ${sourceFile}`);
    } catch (e) {
      // console.error(`[saveFile] Error deleting source file ${sourceFile}:`);
    }
    
    return { path: destPath.replace(/\\/g, "/"), filename };
  } catch (error) {
    // console.error(`[saveFile] Error in saveFile:`, error);
    throw error;
  }
};

// saveImageURL
exports.saveImageURL = async (sourceURL, category, db, imageID, type = 'f') => {
}

/* ===============================
   파일 삭제 및 메타 삭제 함수
   =============================== */
/**
 * 저장된 파일을 삭제하고 MongoDB 메타데이터도 삭제하는 함수
 * @param {string} category - 파일 저장 카테고리 (예: "images")
 * @param {string} db - 하위 폴더명 (예: "athletes")
 * @param {number} imageID - 이미지 ID
 * @param {string} [type='f'] - 파일 타입 ('f', 't', 기타)
 */
exports.deleteFile = async (category, db, imageID, type = 'f') => {
  // console.log(`[deleteFile] Category: ${category}, DB: ${db}, ImageID: ${imageID}, Type: ${type}`);
  const fullID = imageID.toString().padStart(13, '0');
  const rootPath = path.join(global.imagePath, category);
  let destPath = '';
  try {
    await ensureDir(path.join(rootPath, destPath));
    destPath = path.join(destPath, db);
    await ensureDir(path.join(rootPath, destPath));
    destPath = path.join(destPath, `${fullID.slice(0, 4)}/${fullID.slice(4, 7)}/${fullID.slice(7, 10)}`);
    const file = `${imageID}-${type}`;
    const deletePattern = path.join(rootPath, destPath, `${file}.*`);
    // console.log(`[deleteFile] Deleting files matching: ${deletePattern}`);
    await exports.deleteFilesByPattern(deletePattern);
    const query = {
      category: category,
      db: db,
      id: imageID.toString(),
      type: type,
    };
    // console.log(`[deleteFile] MongoDB delete query:`, query);
    await mongodb.deleteOne(mongoCFG.Medalbank.mediaServer, query);
  } catch (error) {
    console.error(`[deleteFile] Error in deleteFile:`, error);
    throw error;
  }
};
