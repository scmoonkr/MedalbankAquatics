
const alphaNumeric = /^[A-Za-z0-9]+$/;

/*******************************************************
 * 
 * String library
 * 
 *******************************************************/
class StringLibrary {
	// 알파벳인지 확인 (영문 대소문자)
	static isAlpha(str) {
		const alphaRegex = /^[A-Za-z]+$/;
		return alphaRegex.test(str);
	}

	// 숫자인지 확인
	static isNumeric(str) {
		const numericRegex = /^[0-9]+$/;
		return numericRegex.test(str);
	}	

		// 부동 소수점 숫자인지 확인
		static isFloat(str) {
		const floatRegex = /^[+-]?\d+(\.\d+)?$/;
		return floatRegex.test(str);
	}

	// 알파벳 또는 숫자인지 확인
	static isAlphaNumeric(str) {
		const alphaNumericRegex = /^[A-Za-z0-9]+$/;
		return alphaNumericRegex.test(str);
	}

	// 한글인지 확인
	static isHangul(str) {
		const hangulRegex = /^[가-힣]+$/;
		return hangulRegex.test(str);
	}
	
	// 문자열에 한글이 포함되어 있는지 확인
	static includesHangul(str) {
		const hangulRegex = /[가-힣]/;
		return hangulRegex.test(str);
	}

	static isAlphaNumerics = (str) => {
		for (const check of str.split('')) {
			if (!alphaNumeric.test(check)) return false;
		}
		return true;
	}
	static toCamelCase(str) {
		return str
			.toLowerCase()                // 먼저 모든 문자를 소문자로 변환
			.split('_')                   // 언더스코어(_)를 기준으로 단어를 분리
			.map((word, index) => {
				if (index === 0) {
					return word;              // 첫 번째 단어는 소문자로 유지
				}
				return word.charAt(0).toUpperCase() + word.slice(1);  // 나머지 단어는 첫 글자를 대문자로 변환
			})
			.join('');                    // 다시 단어들을 결합하여 camelCase 형식으로 만듦
	}
}

module.exports = StringLibrary;
