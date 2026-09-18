
exports.SITE = {
	tradeInn: {
		continent: "북아메리카(북미)",
		nation: "미국",
	},
	REI: {

	},
}
//===================================
exports.SmartStore = {
	profit 	: 0.6,	//  / (price + deliveryFee) / 0.6
	notAllowedTags: "speedo,seatosummit,oceanic,swim,wave,bike,dress,snow,dive,runner,train,dress,overboard,ion,jobe,tyr,cressi,ras,salvimar",
	notAllowedKeywords: "aspirin,",
	noOptions: "네. 확인했습니다.",
	exchangeRate: {
		USD: 1300,	// 미국
		EUR: 1400,	// 유럽연합
		JPY: 960,		// 일본
		GBP: 1600,	// 영국
		CNY: 190,		// 중국
		AUD: 870,		// 호주
		CAD: 950,	// 캐나다
		NZD: 810,		// 뉴질랜드
	},	

	statusType						: "SALE",
	channelNo							: 100906099,
	originAreaCode				: '04',	// 원산지 상세 지역 코드04: 직접입력, 0204000:북아메리카(북미)>미국
	baseFee								: 0,	// 기본 배송비
	freeConditionalAmount	: 0,	// 무료 조건 금액: 배송비 유형이 '조건부 무료'일 경우 입력
	deliveryCompany				: 'CJGLS',	// 택배사: DELIVERY(택배, 소포, 등기)일 때 필수 입력
	// leafCategoryId				: product.leafCategoryId || "",	// 상품 등록 시에는 필수입니다.
	returnDeliveryFee			: 30000,	// 반품 배송비
	exchangeDeliveryFee		: 60000,	// 교환 배송비
	// deliveryBundleGroupId	: "",
	deliveryBundleGroupId	: 53618241, // medalbank
	// deliveryBundleGroupId	: 50460694,	// libraryschool

	afterServiceTelephoneNumber: '010-4509-7846',	// A/S 전화번호
	optionGroupName1 				: "해외직구입니다. 약 2주 가량 소요됩니다.", // "사이즈/컬러 - 해외직구(약 2주 가량 소요)"
	afterServiceGuideContent: '문제 발생시 편히 연락주세요. 최대한 신속하게, 성심껏 도와드리겠습니다.',	// A/S 안내

	pageTitle							: '투윅스노티스',	// 페이지 타이틀) <= 100 characters
	metaDescription				: '투윅스노티스 판매상품',	// 메타 정보) <= 160 characters
}

exports.SmartStore_medalbank = {
	channelNo							: 100906099,
	originAreaCode				: '04',	// 원산지 상세 지역 코드04: 직접입력, 0204000:북아메리카(북미)>미국
	baseFee								: 0,	// 기본 배송비
	freeConditionalAmount	: 0,	// 무료 조건 금액: 배송비 유형이 '조건부 무료'일 경우 입력
	deliveryCompany				: 'CJGLS',	// 택배사: DELIVERY(택배, 소포, 등기)일 때 필수 입력
	// leafCategoryId				: product.leafCategoryId || "",	// 상품 등록 시에는 필수입니다.
	returnDeliveryFee			: 30000,	// 반품 배송비
	exchangeDeliveryFee		: 60000,	// 교환 배송비
	deliveryBundleGroupId	: 53618241,

	afterServiceTelephoneNumber: '010-4509-7846',	// A/S 전화번호
	afterServiceGuideContent: '투윅스노티스에서 A/S',	// A/S 안내

	pageTitle							: '투윅스노티스',	// 페이지 타이틀) <= 100 characters
	metaDescription				: '투윅스노티스 판매상품',	// 메타 정보) <= 160 characters
}

exports.SmartStore_libraryschool = {
	channelNo							: 100906099,
	originAreaCode				: '04',	// 원산지 상세 지역 코드04: 직접입력, 0204000:북아메리카(북미)>미국
	baseFee								: 0,	// 기본 배송비
	freeConditionalAmount	: 0,	// 무료 조건 금액: 배송비 유형이 '조건부 무료'일 경우 입력
	deliveryCompany				: 'CJGLS',	// 택배사: DELIVERY(택배, 소포, 등기)일 때 필수 입력
	// leafCategoryId				: product.leafCategoryId || "",	// 상품 등록 시에는 필수입니다.
	returnDeliveryFee			: 30000,	// 반품 배송비
	exchangeDeliveryFee		: 60000,	// 교환 배송비
	deliveryBundleGroupId	: 50460694,

	afterServiceTelephoneNumber: '010-8507-6539',	// A/S 전화번호
	afterServiceGuideContent: '문제 발생시 편히 연락주세요. 최대한 신속하게, 성심껏 도와드리겠습니다.',	// A/S 안내

	pageTitle							: '투윅스노티스',	// 페이지 타이틀) <= 100 characters
	metaDescription				: '투윅스노티스 판매상품',	// 메타 정보) <= 160 characters
}


exports.Account = {
	libraryschool: { // _libraryschool
		application_id 			: "73Pt1cnotulZKrCaeobCOq",
		application_secret 	: "$2a$04$izIQdauduvjs8opClBDtPe",
		application_account	: "libraryschool",
		store_name 					: "smartbooks",
		client_id						: "73Pt1cnotulZKrCaeobCOq", // application_id
		seller_id 					: "ncp_1o1ed0_01",
		API_id							: "vSSVz8kF",
	},
	twoWeeksNotice: { // _medalbank
		application_id 			: "6MwUMoFnbcbvbPtkjCADHo",
		application_secret 	: "$2a$04$oBbhJ2N6f3sBCEXVp0A0LO",
		application_account	: "medalbank",
		store_name 					: "투윅스노티스",
		application_name 		: "two weeks notice",
		client_id						: "6MwUMoFnbcbvbPtkjCADHo", // application_id
		// seller_id 					: "ncp_1o1ed0_01",
		// API_id							: "vSSVz8kF",
	},
	newzealandAustrailia: { // _new
		application_id 			: "6mpPGRBx5nJK65awAR182j",
		application_secret 	: "$2a$04$9RjvzKR5XxlAWHuFFOx5eO",
		application_account	: "newzealandAustrailia",
		store_name 					: "뉴질랜드호주수영복",
		application_name 		: "newzealandAustrailia",
		client_id						: "6mpPGRBx5nJK65awAR182j", // application_id
		// seller_id 					: "ncp_1o1ed0_01",
		// API_id							: "vSSVz8kF",
	},
}

exports.Config = {
	//--------------------------------------------
	SmartStore: this.Account.twoWeeksNotice,
	//--------------------------------------------
	homeURL: (site) => {
		let url = "";
		switch (site) {
			case "tradeInn":
				url = "https://www.tradeinn.com";
				break;
		}
		return url;
	},

}
