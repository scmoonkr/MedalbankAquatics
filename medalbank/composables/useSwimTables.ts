// Breaststroke 프로젝트의 utils/swimStyles.js 중 backend 이식 페이지가 쓰는 부분만 옮긴 것.
// 값(value)은 원본과 동일하게 유지해야 medalbank Express API가 같은 결과를 돌려준다.

export const gendersTable = [
  { value: 'men',   label: '남자' },
  { value: 'women', label: '여자' },
  { value: 'mixed', label: '혼성' },
] as const

export const courseTable = [
  { value: 'LCM', label: 'LCM' },
  { value: 'SCM', label: 'SCM' },
] as const

export const distanceTable = [
  { value: '25M',   label: '25M'   },
  { value: '50M',   label: '50M'   },
  { value: '100M',  label: '100M'  },
  { value: '200M',  label: '200M'  },
  { value: '400M',  label: '400M'  },
  { value: '800M',  label: '800M'  },
  { value: '1500M', label: '1500M' },
] as const

// 종목 코드(discipline). 이 DB(mergedTimes)와 server/utils/importTimes.ts 는 배영을 BA 로 쓴다.
// BK 는 구 Breaststroke 프로젝트 표기라 읽기 호환용으로만 남긴다.
export const styleTable = [
  { value: 'FR',  label: '자유형'     },
  { value: 'BA',  label: '배영'       },
  { value: 'BR',  label: '평영'       },
  { value: 'FL',  label: '접영'       },
  { value: 'IM',  label: '개인혼영'   },
  { value: 'FRR', label: '자유형계영' },
  { value: 'MR',  label: '혼계영'     },
] as const

const LEGACY_STYLE: Record<string, string> = { BK: '배영' }

// 영법(style) — capture 리더보드 그룹핑에서 사용
export const stylesTable = [
  { eng: 'freestyle',        kor: '자유형'   },
  { eng: 'backstroke',       kor: '배영'     },
  { eng: 'breaststroke',     kor: '평영'     },
  { eng: 'butterfly',        kor: '접영'     },
  { eng: 'individualMedley', kor: '개인혼영' },
] as const

export const sidoTable = [
  '서울', '경기', '인천', '강원', '충북', '충남', '대전', '경북', '대구',
  '울산', '부산', '경남', '전북', '전남', '광주', '제주', '세종', '해외',
] as const

export const typeTimes = [
  { value: 'timeResult',  label: '훈련기록' },
  { value: 'eventResult', label: '대회기록' },
] as const

export const roundsEngKor = [
  { eng: 'preliminaries', kor: '예선'       },
  { eng: 'round2',        kor: '예선2'      },
  { eng: 'quaterFinals',  kor: '준준결승'   },
  { eng: 'semiFinals',    kor: '준결승'     },
  { eng: 'finals',        kor: '결승'       },
  { eng: 'record',        kor: '기록회'     },
  { eng: 'timeRace',      kor: '타임레이스' },
] as const

export function getGenderByKor(kor = '') {
  return gendersTable.find(el => el.label === kor)?.value ?? kor
}
export function getGenderByEng(eng = '') {
  return gendersTable.find(el => el.value === eng)?.label ?? eng
}
export function getStyleEngByKor(kor = '') {
  return stylesTable.find(el => el.kor === kor)?.eng ?? kor
}
export function getStyleKorByEng(eng = '') {
  return stylesTable.find(el => el.eng === eng)?.kor ?? eng
}
export function getStyleLabel(code = '') {
  return styleTable.find(el => el.value === code)?.label ?? LEGACY_STYLE[code] ?? code
}
export function getRoundKorByEng(eng = '') {
  return roundsEngKor.find(el => el.eng === eng)?.kor ?? eng
}
export function getTypeTimes(label = '') {
  return typeTimes.find(el => el.label === label)?.value ?? ''
}
export function getTypeTimesKor(value = '') {
  const v = value.includes('Result') ? value : value + 'Result'
  return typeTimes.find(el => el.value === v)?.label ?? value
}
