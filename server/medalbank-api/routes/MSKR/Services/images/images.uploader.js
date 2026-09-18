// imageProcessor.js - 이미지 처리를 위한 자식 프로세스
const sharp = require('sharp');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const FormData = require('form-data');

// imgBB API 키 설정 (실제 사용시 환경 변수로 관리하는 것이 좋습니다)
const IMGBB_API_KEY = 'YOUR_IMGBB_API_KEY';

// 메인 프로세스로부터 메시지 수신
process.on('message', async (data) => {
  try {
    const { filePath, width, height } = data;
    
    console.log("imageProcessor...", filePath, width, height);
    // 리사이징된 이미지를 저장할 경로
    const fileInfo = path.parse(filePath);
    const resizedFilePath = path.join(
      fileInfo.dir,
      `${fileInfo.name}-resized${fileInfo.ext}`
    );

    // Sharp를 사용하여 이미지 리사이징
    await sharp(filePath)
      .resize({
        width: parseInt(width),
        height: parseInt(height),
        fit: 'inside',  // 비율 유지
        withoutEnlargement: true  // 원본보다 크게 확대하지 않음
      })
      .toFile(resizedFilePath);

    console.log(`이미지 리사이징 완료: ${resizedFilePath}`);

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

    // 원본 및 리사이징된 임시 파일 삭제 (선택 사항)
    fs.unlinkSync(filePath);
    fs.unlinkSync(resizedFilePath);

    // 메인 프로세스에 성공 결과 전송
    process.send({
      success: true,
      imgbbUrl: response.data.data.url,
      displayUrl: response.data.data.display_url,
      deleteUrl: response.data.data.delete_url
    });

  } catch (error) {
    console.error('이미지 처리 오류:', error);
    
    // 메인 프로세스에 오류 결과 전송
    process.send({
      success: false,
      error: error.message
    });
  } finally {
    // 작업이 완료되면 프로세스 종료
    setTimeout(() => {
      process.exit(0);
    }, 1000);
  }
});