// composables/useTimes.js
import { ref } from 'vue'

const _disciplines = ["BR", "FR", "BK", "FL", "IM"];
const _distances = ["25M", "50M", "100M", "200M", "400M", "800M", "1500M"];
const _courses = ["LCM", "SCM"];

export const useTimes = () => {
	

	const totalTimesTable = (times: any[]) => {

	let str = '';

	str += `| 종합성적 | 시도 | 최고기록 |\n`;
	for (const time of times) {
		str += `|${time.discipline} ${time.distance} ${time.course}|${time.sido}(${time.datetime})|\n`;
	}
	return str
	}


	// ================================
	// 반환 객체
	// ================================
	return {
		// 상태
		// toasts,

		// 기본 함수들
		totalTimesTable,
	}
}

export default useTimes
