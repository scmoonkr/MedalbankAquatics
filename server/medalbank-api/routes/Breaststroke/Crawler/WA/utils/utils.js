const puppeteer = require('puppeteer');

exports.initialize = async () => {
	
	// 브라우저 실행
	const browser = await puppeteer.launch({
		headless: 'new', // 새 헤드리스 모드 사용
		defaultViewport: { width: 1366, height: 768 },
		args: ['--no-sandbox', '--disable-setuid-sandbox'] // 추가된 인자
	});
	
	try {
		const page = await browser.newPage();
		
		// 유저 에이전트 설정
		await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36');
		
		// 타임아웃 설정 연장
		page.setDefaultTimeout(60000); // 60초로 기본 타임아웃 연장
		return { browser, page } 
	} catch (error) {
		console.error('크롤링 초기화 중 오류 발생:', error);
		throw error;
	}   
}
