const extend 			= require('node.extend');
const mongoCFG 		= require('../../Config/mongoCFG');
const mongoDB			= require('../../Class/MongoDB');
const mongodb 		= new mongoDB(mongoCFG.Medalbank.database);

/**
 * 저장 이력 및 조회수 업데이트 함수
 * @param {string} db - DB (예: "times", "athletes", 등)
 * @param {string} cmd - 명령어 (예: "detail", "view", 등)
 * @param {string} id - id (예: "timeID", "athleteID", 등)
 * @param {object} body - 클라이언트로부터 전달받은 데이터 객체
 * @returns {object} value - 최종적으로 MongoDB에 저장된 데이터 객체
 */
exports.saveHistory = async (db, cmd, id, body) => {
	// 입력 데이터와 기본값을 병합하여 최종 저장할 객체 생성
	const value = extend(true, body, {
															db				: db,                				// DB 유형 설정 (고정값: "times")
															cmd				: cmd,  
															id				: id,                  		// 처리 명령어
															userID		: Number(body.userID ?? 0), // athleteID (값이 없으면 비회원 처리)
															body			: body,                 		// 입력된 원본 데이터를 body 필드에 포함
															datetime	: new Date(),       				// 현재 시간 추가
														});
	value[id] = Number(body[id]); // save DB ID
	
	// 디버깅을 위한 로그 출력
	// console.log("times.saveHistory.db, cmd, id, body, ", db, cmd, id, body, ", value=", value);

	// MongoDB의 timesMB 컬렉션에 데이터 저장
	await mongodb.insertOne(mongoCFG.Medalbank.history, value);

	// 조회수 증가 처리를 위한 조건 쿼리 생성
	const query = {
		dbType: db,            // DB 유형 (고정값: "times")
		dbID	: Number(value[id] ?? 0),     // 저장된 데이터의 timeID
		userID: value.userID,  // 저장된 데이터의 athleteID
		// $expr: {
		// 	$ne: [
		// 		{ $dateToString: { format: "%Y-%m-%d", date: "$datetime" } }, // 기존 datetime의 날짜 부분
		// 		{ $dateToString: { format: "%Y-%m-%d", date: value.datetime } }, // 새 datetime의 날짜 부분
		// 	],
		// },
	};

	// 특정 명령어("detail", "view")일 경우 reactions.views 처리
	if ("detail,view".includes(cmd)) {
		// userID=0: guest의 경우 무조건 count 증가시키기
		// userID=자신의 경우 1로 설정
		const views = value.userID == 0 ? { $inc: { views: 1 } } : { $set: { views: 1 } };
		await mongodb.updateOneOp(
										mongoCFG.Medalbank.reactions,  // reactionsMB 컬렉션에 접근
										query,                      // 조건에 맞는 문서 찾기
										views
									);
}

	// 최종적으로 저장된 데이터를 반환
	return value;
}
