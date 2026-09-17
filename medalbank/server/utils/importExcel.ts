// 기록지 엑셀 파서 — c:/Develop/node/medalbank 의 이식.
//   ExcelLibrary.read_excel_org  → readExcelOrg
//   excelDAO.formatTimes         → formatTimes
//   excelDAO.customizingTimesORG → customizingTimesORG
//   importUTIL/utilTimes 의 check*/split* 헬퍼
//   utilImport.customTime, times.custom.js 의 customizing
// 원본 동작을 그대로 옮기는 것이 목적이라 구조와 판정 순서를 바꾸지 않았다.
// 빠진 것: 파일 로그(Config.times_data_path), nameHide/namesHide (customizing 이 어차피 버린다).
import * as XLSX from 'xlsx'

// 자동 임포트 충돌을 피하려고 외부로는 parseTimesExcel / checkDuplicate / customizing 만 내보낸다.
// (splitDiscipline 등은 기존 server/utils/importTimes.ts 에도 같은 이름이 있다)

// ── 상수 (원본 excelDAO / utilTimes) ──────────────────────────────
const DISTANCES   = ['25M', '50M', '100M', '200M', '400M', '800M', '1500M']
const HEADER_TIME = 'Times,TIMES,times,기록,M. LAP'
const HEADER_NAME = 'Name,NAME,name,이름,성명,선수명'
const HEADER_TEAM = 'Team,TEAM,team,팀명,소속,소속팀,클럽명'

const GENDERS_KO      = ['남자/여자', '남자,여자', '여자', '남자', '남·여', '남여', '남', '여', '혼성']
const DISCIPLINES_KO  = ['접영', '배영', '평영', '자유형', '개인혼영', '혼계영', '혼성계영', '혼성혼계영', '계영']
const ROUNDS_KO       = ['준결승', '결승', '예선', '기록회', '타임레이스']
const JUNIORS         = [
  '유아', '유치', '유년', '초등', '남초', '여초', '저학년', '고학년', '어린이',
  '중등', '중학', '중고등', '고등', '학생',
]

const DISCIPLINE_TABLE = [
  { label: '자유형',     discipline: 'FR'  },
  { label: '배영',       discipline: 'BA'  },
  { label: '평영',       discipline: 'BR'  },
  { label: '접영',       discipline: 'FL'  },
  { label: '개인혼영',   discipline: 'IM'  },
  { label: '혼성계영',   discipline: 'FRR' },
  { label: '혼성혼계영', discipline: 'MR'  },
  { label: '혼계영',     discipline: 'MR'  },
  { label: '계영',       discipline: 'FRR' },
]

const ROUNDS_ENG_KOR = [
  { eng: 'preliminaries', kor: '예선'       },
  { eng: 'round2',        kor: '예선2'      },
  { eng: 'quaterFinals',  kor: '준준결승'   },
  { eng: 'semiFinals',    kor: '준결승'     },
  { eng: 'finals',        kor: '결승'       },
  { eng: 'record',        kor: '기록회'     },
  { eng: 'timeRace',      kor: '타임레이스' },
]

const STATUS_WORDS = ['DQ', 'DSQ', 'DNS', 'NT', '불참', '실격', '포기', '번외']

export interface ImportCompetition {
  competitionID:    number
  competitionName?: string
  fullname?:        string
  stemID?:          number
  course?:          string
  sido?:            string
  type?:            string
  pool?:            string
  poolID?:          number
  dateStart?:       string
  datetime?:        string
}

type Row = Record<string, any>

// ── 문자열/시간 헬퍼 (utilLibrary / utilDate) ─────────────────────
function deleteEndSpecialChar(str = ''): string {
  if (str === undefined || str === null) return ''
  let s = String(str)
  s = s.replace(/[~!@#$%^&*()_+\-.,{}|\\:;/?<>"' ]+$/g, '')
  s = s.replace(/=+$/g, '')
  return s
}

// 원본 utilLibrary.leadingZeros — 자리수가 모자랄 때만 0을 채우고, 넘쳐도 자르지 않는다.
// (27.74 를 "74" 로 자르면 기록이 통째로 틀어진다)
function leadingZeros(n: any, digits?: number): string {
  const s = String(n)
  if (digits !== undefined && s.length < digits) return '0'.repeat(digits - s.length) + s
  return s
}

// 엑셀 날짜 일련번호 → YYYY-MM-DD
function number2Date(num: number): string {
  const start = new Date('1900-01-01')
  start.setDate(start.getDate() + num)
  return `${start.getFullYear()}-${leadingZeros(start.getMonth() + 1)}-${leadingZeros(start.getDate())}`
}

// "01:43.52" → 0.001198148148148148 (하루를 1로 보는 비율)
function convertString2Timestamp(ostr: any): number | '' {
  if (ostr === undefined || ostr === null) return ''
  let str = String(ostr).trim()
  let arr = (str + '.').split('.')
  const sss = parseInt(((arr[1] ?? '') + '000').substring(0, 3), 10)
  str = arr[0]
  arr = ('0:0:' + str).split(':')

  const no = arr.length - 3
  const hh = parseInt(arr[no + 0], 10)
  const mm = parseInt(arr[no + 1], 10)
  const ss = parseInt(arr[no + 2], 10)
  if ([hh, mm, ss, sss].some(v => Number.isNaN(v))) return ''

  return (hh * 3600000 + mm * 60000 + ss * 1000 + sss) / 86400000
}

// 0.0011981... → "00:01:43.52"
function convertTimestamp2string(time: number): string {
  let hh = '', mm = '', ss = '', sss = ''
  if (time >= 1) {
    const arr = (time.toString() + '.').split('.')
    hh = '00'; mm = '00'
    ss  = leadingZeros(arr[0])
    sss = ((arr[1] ?? '') + '000').slice(0, 2)
  } else {
    const hour = time * 86400000
    hh  = hour < 1 ? '00' : leadingZeros(Math.floor(hour / 3600000), 2)
    mm  = leadingZeros(Math.floor(hour / 60000) % 60, 2)
    ss  = leadingZeros(Math.floor(hour / 1000) % 60, 2)
    sss = leadingZeros(Math.round(hour % 1000), 3).slice(0, 2)
  }
  return `${hh}:${mm}:${ss}.${sss}`
}

// 엑셀이 숫자로 준 기록을 "mm:ss.tt" 로
function convertInt2Times(int: any): string {
  if (!int) return ''
  if (typeof int === 'number' && int < 60 && int.toString().length <= 2) int = `${int}.00`
  if (typeof int === 'string') int = deleteEndSpecialChar(int).trim()
  if (isNaN(int as any)) int = String(int).trim().split(' ')[0]

  let str = '', digits = ''
  if (typeof int === 'number') {
    if (int < 100) return leadingZeros(int, 2)
    str = int.toString()
    if (str.includes('.')) {
      const arr = str.split('.')
      digits = `${('00' + arr[0]).slice(-2)}.${(arr[1] + '00').slice(0, 2)}`
      str = arr[0].length > 2 ? arr[0].slice(0, -2) : ''
    } else {
      digits = `.${str.slice(-2)}`
      str = str.slice(0, -2)
      digits = `${str.slice(-2)}${digits}`
      str = str.slice(0, -2)
    }
    if (int >= 10000) digits = `${str.slice(-2)}:${digits}`
  } else {
    digits = String(int).replace(/‘|'/g, ':').replace(/"|“/g, '.')
  }
  if (digits.slice(0, 2) === '0:') digits = digits.slice(2)
  return digits
}

// 임의 표기 → "mm:ss.tt" 정규화 (utilTimes.customTimes)
function customTimes(timeORG: any): string {
  let numbers = timeORG ? String(timeORG).trim() : ''
  if (!numbers) return ''

  const arr = numbers.split('.')
  if (arr.length > 1) {
    arr[1] = (arr[1] + '00').slice(0, 2)
    numbers = arr.join('.')
  }

  const matched = numbers.match(/\d/g)
  if (!matched) return ''          // 숫자가 아예 없으면 기록 아님
  numbers = matched.join('')
  if (numbers.length < 4) numbers = (numbers + '0000').slice(0, 4)

  const str = '000000' + numbers
  const mm = str.slice(-6, -4)
  const ss = str.slice(-4, -2)
  const tt = str.slice(-2)
  return `${mm}:${ss}.${tt}`.replace('00:', '')
}

function getDiscipline(label: string): string {
  const key = String(label ?? '').replace(/ /g, '')
  const ck = DISCIPLINE_TABLE.find(d => d.label === key)
  return ck ? ck.discipline : key
}

function getRoundKor2Eng(round: string): string {
  const hit = ROUNDS_ENG_KOR.find(el => el.kor === round)
  return hit ? hit.eng : round
}

// ── 판정 헬퍼 (utilTimes) ─────────────────────────────────────────
function checkStatus(time: Row): Row {
  if (time.times && typeof time.times === 'string' && STATUS_WORDS.includes(time.times.toUpperCase())) {
    time.note = time.times
    time.times = ''
  } else if (time.rank && STATUS_WORDS.includes(String(time.rank).toUpperCase())) {
    time.note = time.rank
    time.rank = ''
  } else if (time.rank && isNaN(time.rank)) {
    time.note = time.rank
    time.rank = ''
  }

  if (time.remarks && !time.note) {
    time.note = time.remarks
    delete time.remarks
  }

  if (time.note) {
    time.note = String(time.note)
    if (time.note.includes('DNS') || time.note.includes('불참') || time.note.includes('포기')) time.status = 'DNS'
    else if (time.note.includes('DSQ')) time.status = 'DQ'
    else if (time.note.includes('DQ'))  time.status = 'DQ'
    else if (time.note.includes('NT'))  time.status = 'NT'
    else if (time.note.includes('번외')) time.status = '번외'
    else if (time.note.includes('실격')) time.status = '실격'
    time.note = time.note.replace(/DNS|DQ|DSQ|NT|번외|포기|실격|불참/gi, '').trim()
  }
  return time
}

function checkTimes(time: Row): Row {
  time.time = time.times ? time.times : time.time || ''
  delete time.times
  if (!time.time) return time
  if (!time.timeORG) time.timeORG = time.time

  if (typeof time.time === 'number') {
    time.time = time.time < 1
      ? convertTimestamp2string(time.time)
      : convertInt2Times(time.time)
  } else {
    time.time = String(time.time).replace("'", ':').replace('"', '.')
  }

  const t = customTimes(time.time)
  if (!t && !time.status) time.status = 'DNS'
  time.time = t
  if (time.time) time.timeStamp = convertString2Timestamp(time.time)

  return time
}

function checkGender(time: Row): string {
  const g = time.gender
  if (g && ['women', 'men', 'mixed'].includes(String(g).toLowerCase())) return String(g).toLowerCase()
  if (!g) return ''
  if ('남자,남성'.includes(g)) return 'men'
  if ('여자,여성'.includes(g)) return 'women'
  if ('혼성'.includes(g))      return 'mixed'
  return g
}

function checkAdult(time: Row): boolean {
  if (time.category === 'junior') return false
  const ageGroup = String(time.ageGroup ?? '').replace(/ /gi, '')
  return !JUNIORS.find(el => ageGroup.includes(el))
}

// "여자 평영 50M 결승" 같은 제목 행을 쪼갠다.
function splitDiscipline(ageGroupRaw: string): Row {
  const discipline: Row = {}
  discipline.discipline = String(ageGroupRaw).replace(/\s{2,}/g, ' ').trim()

  let ageGroup = String(ageGroupRaw)
    .replace('혼성', ' 혼성 ')
    .replace(/ \/ | \/|\/ /, '/')
    .replace(/\s{2,}/g, ' ')
    .toUpperCase()

  const arr = ageGroup.trim().split(' ')

  if (!isNaN(Number(arr[0].replace(/-|,|\./g, '')))) discipline.heat = arr[0]

  for (let key of arr) {
    if (!key) return discipline

    if (/핀|fin/gi.test(key)) {
      discipline.fin = true
      key = key.replace(/fin|핀/gi, '')
    }

    const find = DISCIPLINES_KO.find(el => key.includes(el))
    if (find) {
      discipline.discipline = find
      key = key.replace(find, '').trim()
      if (key) arr.push(key)
    } else if (key.includes('핀')) {
      discipline.fin = '핀'
      key = key.replace('핀', '').trim()
      if (key) arr.push(key)
    }
    else if (GENDERS_KO.find(el   => key.includes(el))) discipline.gender   = key
    else if (DISTANCES.find(el    => key.includes(el))) discipline.distance = key
    else if (ROUNDS_KO.find(el    => key.includes(el))) discipline.round    = key
  }

  for (const el of Object.keys(discipline)) {
    if (el !== 'discipline') {
      if (el === 'round' && ['기록회', '타임레이스'].includes(discipline[el])) {
        // 기록회/타임레이스는 연령대 문자열에 남겨둔다
      } else {
        ageGroup = ageGroup.replace(discipline[el], '')
      }
    } else {
      if (String(discipline[el]).includes('기록회')) discipline.masters = false
      ageGroup = ageGroup.replace(discipline[el], '')
    }
  }

  if (ageGroup.includes('전문') || ageGroup.includes('생활')) {
    if (ageGroup.includes('전문')) discipline.isMastrers = true
    ageGroup = ageGroup.replace('전문', '').replace('생활', '').replace(/\(|\)|\[|\]/gi, '').trim()
  }

  if (ageGroup) discipline.ageGroup = ageGroup.replace(/\s{2,}/g, ' ').trim()

  if (['혼성계영', '혼성혼계영'].includes(discipline.discipline) && !discipline.distance) discipline.distance = '200M'
  if (!discipline.gender && discipline.discipline && String(discipline.discipline).includes('혼성')) discipline.gender = 'mixed'

  discipline.heat = deleteEndSpecialChar(discipline.heat)
  return discipline
}

function checkHeatDiscipline(time: Row): Row {
  const empty: Row = {}
  if (!time.heat) return empty
  time.heat = time.heat ? String(time.heat) : ''
  if (time.heat.length < 5) return empty

  let ageGroup = ''
  if (time.discipline && String(time.discipline).length > 6) ageGroup = String(time.discipline)
  else if (time.heat && time.heat.length > 5)                ageGroup = time.heat
  else return empty

  return splitDiscipline(ageGroup)
}

function checkLaneDiscipline(time: Row): Row {
  const empty: Row = {}
  if (!time.lane) return empty
  time.lane = time.lane ? String(time.lane) : ''
  if (time.lane.length < 5) return empty

  let ageGroup = ''
  if (time.discipline && String(time.discipline).length > 6) ageGroup = String(time.discipline)
  else if (time.lane && time.lane.length > 5)                ageGroup = time.lane
  else return empty

  const dsp = splitDiscipline(ageGroup)
  if (time.lane && !time.heat) {
    if (!dsp.ageGroup) dsp.ageGroup = dsp.heat
    delete dsp.heat
  }
  return dsp
}

// ── times.custom.js 의 customizing — 저장 필드를 여기서 확정한다 ──
export function customizing(data: Row): Row {
  const value: Row = {
    timeID:     data.timeID || 0,
    name:       data.name   || '',
    gender:     data.gender || '',
    discipline: data.discipline || '',
    course:     data.course || '',
    distance:   data.distance || '',
    time:       data.time || '',
    timeStamp:  data.timeStamp || 0,
  }
  if (data.athleteID       ) value.athleteID       = Number(data.athleteID)
  if (data.competitionID   ) value.competitionID   = Number(data.competitionID)
  if (data.competitionName ) value.competitionName = data.competitionName
  if (data.stem            ) value.stem            = data.stem
  if (data.stemID          ) value.stemID          = Number(data.stemID)
  if (data.team            ) value.team            = data.team
  if (data.teamID          ) value.teamID          = Number(data.teamID)
  if (data.lane            ) value.lane            = data.lane
  if (data.heat            ) value.heat            = data.heat
  if (data.pool            ) value.pool            = data.pool
  if (data.poolID          ) value.poolID          = Number(data.poolID)
  if (data.source          ) value.source          = data.source
  if (data.timeORG         ) value.timeORG         = data.timeORG
  if (data.featured        ) value.featured        = data.featured
  if (data.isMasters !== undefined) value.isMasters = data.isMasters
  if (data.isAdult   !== undefined) value.isAdult   = data.isAdult
  if (data.isIndividual    ) value.isIndividual    = data.isIndividual
  if (data.isOfficial      ) value.isOfficial      = data.isOfficial
  if (data.type            ) value.type            = data.type
  if (data.ageGroup        ) value.ageGroup        = data.ageGroup
  if (data.ageGroupCode    ) value.ageGroupCode    = data.ageGroupCode
  if (data.round           ) value.round           = data.round
  if (data.rank            ) value.rank            = Number(data.rank)
  if (data.sido            ) value.sido            = data.sido
  if (data.names           ) value.names           = data.names
  if (data.datetime        ) value.datetime        = typeof data.datetime === 'string'
                                                       ? data.datetime
                                                       : new Date(data.datetime).toISOString().slice(0, 10)
  if (data.note            ) value.note            = data.note
  if (data.status          ) value.status          = data.status
  if (data.isPrivate !== undefined) value.isPrivate = data.isPrivate
  return value
}

// ── utilImport.customTime — 한글/약어 표기 정규화 ─────────────────
function customTime(time: Row): Row {
  if (time.masters) {
    const masters = String(time.masters).toLowerCase()
    time.isMasters = true
    if (masters === 'elite' || masters === 'n') time.isMasters = false
    else if (masters === 'masters' || masters === 'y') time.isMasters = true
  }
  if (time.adult) {
    const adult = String(time.adult).toLowerCase()
    time.isAdult = true
    if (adult === 'adult' || adult === 'y') time.isAdult = true
    else if (adult === 'junior' || adult === 'n') time.isAdult = false
  }
  if (time.gender) {
    const gender = String(time.gender).toLowerCase()
    if (gender === 'men'   || gender === '남' || gender === '남자') time.gender = 'men'
    if (gender === 'women' || gender === '여' || gender === '여자') time.gender = 'women'
  }
  if (time.discipline) {
    switch (String(time.discipline).toLowerCase()) {
      case 'fr': case '자유형': case '자유': case 'freestyle':          time.discipline = 'FR'; break
      case 'ba': case '배영':   case 'backstroke':                      time.discipline = 'BA'; break
      case 'br': case '평영':   case 'breaststroke':                    time.discipline = 'BR'; break
      case 'fl': case '접영':   case 'butterfly':                       time.discipline = 'FL'; break
      case 'im': case '혼영':   case 'individual medley':               time.discipline = 'IM'; break
      case '계영': case '혼계영': case 'freestyle relay':                time.discipline = 'FR'; break
    }
  }
  if (time.distance) {
    const distance = String(time.distance).toUpperCase()
    if ('25M,50M,100M,200M,400M,800M,1500M'.includes(distance)) time.distance = distance
  }
  if (time.course) {
    const course = String(time.course).toUpperCase()
    if ('SCM,LCM'.includes(course)) time.course = course
  }
  return time
}

// ── 엑셀 읽기 ─────────────────────────────────────────────────────
function readExcelOrg(buf: Buffer): Row[] {
  const workbook = XLSX.read(buf, { type: 'buffer' })
  const rowArr: Row[] = []
  for (const sheet of Object.keys(workbook.Sheets)) {
    const rows = XLSX.utils.sheet_to_json<Row>(workbook.Sheets[sheet])
    for (const row of rows) {
      row.sheet = sheet
      rowArr.push(row)
    }
  }
  return rowArr
}

// 한 행에 1~8위가 가로로 늘어선 형식을 행 단위로 편다.
function formatTimes(times: Row[]): Row[] {
  const timeArr: Row[] = []
  for (const elem of times) {
    const time: Row = JSON.parse(JSON.stringify(elem))
    if (typeof time.datetime === 'number') time.datetime = number2Date(time.datetime)
    const sheet = time.sheet
    delete time.sheet

    if (time.name1) {
      if ('1위,성명,이름'.indexOf(String(time.name1).replace(/ /gi, '')) >= 0) continue

      for (let no = 1; no <= 8; no++) {
        if (time[`name${no}`]) {
          const tm: Row = {
            name: time[`name${no}`],
            team: time[`team${no}`],
            time: time[`times${no}`],
            rank: no,
            sheet,
          }
          if (time.discipline) tm.discipline = time.discipline
          if (time.distance)   tm.distance   = time.distance
          if (time.gender)     tm.gender     = time.gender
          if (time.ageGroup)   tm.ageGroup   = time.ageGroup
          if (time.round)      tm.round      = time.round
          if (time.lane)       tm.lane       = time.lane
          if (time.heat)       tm.heat       = time.heat
          if (time.heatCode)   tm.heatCode   = time.heatCode
          if (time.status)     tm.status     = time.status
          if (time.sido)       tm.sido       = time.sido
          if (time.elite)      tm.elite      = time.elite
          timeArr.push(tm)
        }
      }
    } else {
      time.sheet = sheet
      timeArr.push(time)
    }
  }
  return timeArr
}

// ── 본체 ──────────────────────────────────────────────────────────
function customizingTimesORG(timeArr: Row[], competition: ImportCompetition): Row[] {
  const times: Row[] = []
  let discipline: Row = {}
  let timeID = 1

  for (const row of timeArr) {
    let time: Row = JSON.parse(JSON.stringify(row))

    if (time.discipline) {
      const dsp = splitDiscipline(String(time.discipline))
      if (dsp.gender)     time.gender     = dsp.gender
      if (dsp.discipline) time.discipline = dsp.discipline
      if (dsp.distance)   time.distance   = dsp.distance
      if (dsp.ageGroup)   time.ageGroup   = dsp.ageGroup
    }

    // 제목 행이면 현재 종목 컨텍스트로 삼고 넘어간다
    const dsp = time.heat ? checkHeatDiscipline(time) : time.lane ? checkLaneDiscipline(time) : {}
    if (Object.keys(dsp).length > 2) {
      discipline = JSON.parse(JSON.stringify(dsp))
      continue
    }

    // 계영인데 선수명이 없으면 팀명을 이름으로
    if (time.discipline && String(time.discipline).includes('계영') && !time.name && time.team) time.name = time.team

    // 헤더 행 건너뛰기
    if (HEADER_TIME.includes(time.time) || (time.name && HEADER_NAME.includes(String(time.name).replace(/ /gi, '')))) continue

    if (discipline?.discipline && String(discipline.discipline).includes('계영') && !time.name && time.team) {
      time.name = time.team
    }
    const ckName = time.name && !HEADER_NAME.includes(String(time.name).replace(/ {2}/gi, ' ').replace(/ {2}/gi, ' '))
    const ckTeam = time.team && HEADER_TEAM.includes(String(time.team).replace(/ /gi, ''))
    if (!time.nameEng && !ckName && !ckTeam) continue
    if (!time.name && !time.nameEng && !time.team && !time.time) continue
    if (!time.name && time.nameEng) time.name = time.nameEng

    time.timeORG = time.times

    // 대회 정보 주입
    time.competitionID   = competition.competitionID
    time.competitionName = competition.fullname ?? competition.competitionName ?? ''
    time.stemID          = competition.stemID
    time.course          = competition.course
    time.sido            = competition.sido
    time.type            = competition.type || 'event'
    time.pool            = competition.pool
    time.poolID          = competition.poolID
    time.datetime        = time.datetime || competition.dateStart || competition.datetime || ''

    time.isMasters = time.isMasters || time.masters || true
    if (time.isMasters === '비등록' || time.isMasters === 'masters' || time.isMasters === 'y') time.isMasters = true
    else if (time.isMasters === '등록' || time.isMasters === 'elite' || time.isMasters === 'n') time.isMasters = false
    delete time.masters

    if (time.sheet) {
      if (String(time.sheet).includes('학생')) time.isAdult = false
      else if (String(time.sheet).includes('성인')) time.isAdult = true
    }

    time.distance = time.distance ? String(time.distance).trim() : ''
    if (!time.discipline) time.discipline = discipline.discipline || ''
    if (!time.distance)   time.distance   = discipline.distance   || ''
    if (!time.gender)     time.gender     = discipline.gender     || ''
    if (!time.ageGroup)   time.ageGroup   = discipline.ageGroup   || ''

    if (time.discipline && !DISCIPLINE_TABLE.find(d => time.discipline === d.discipline)) {
      const ck = DISCIPLINE_TABLE.find(d => String(time.discipline).includes(d.label))
      if (ck) {
        if (!time.distance) {
          const distance = String(time.discipline).replace(ck.label, '').replace('m', 'M').trim()
          if (DISTANCES.includes(distance)) time.distance = distance
        }
        time.discipline = ck.discipline
      }
    }
    if (time.elite) { time.masters = false; delete time.elite }

    if (!time.heat)       time.heat       = discipline.heat       || ''
    if (!time.gender)     time.gender     = discipline.gender     || ''
    if (!time.ageGroup)   time.ageGroup   = discipline.ageGroup   || ''
    if (!time.discipline) time.discipline = discipline.discipline || ''
    if (!time.distance)   time.distance   = discipline.distance   || ''
    if (!time.category)   time.category   = discipline.category   || ''
    if (!time.round)      time.round      = discipline.round      || ''

    time.name     = time.name ? String(time.name).trim() : ''
    time.names    = time.names || []
    time.team     = time.team ? String(time.team).trim() : ''
    time.ageGroup = time.ageGroup ? String(time.ageGroup).trim() : ''
    time.round    = time.round ? String(time.round).trim() : ''
    time.status   = time.status ? String(time.status).trim() : ''
    time.note     = time.note ? String(time.note).trim() : ''

    if (time.birth) {
      if (typeof time.birth === 'number') time.birth = time.birth.toString()
      time.birth = time.birth.replace(/\.|,|-|_|:|~/gi, '')
      time.birth = time.birth.length > 8
        ? time.birth.slice(0, 8)
        : (time.birth.slice(0, 1) < '4' ? '20' : '19') + time.birth
      time.birth = `${time.birth.slice(0, 4)}-${time.birth.slice(4, 6)}-${time.birth.slice(6, 8)}`
    }

    time = checkStatus(time)
    time = checkTimes(time)

    // "자유형 50M" 처럼 붙어 있으면 분리
    if (!time.distance) {
      const arr = String(time.discipline).split(' ')
      if (arr.length > 1) {
        arr[0] = arr[0].trim()
        if (DISTANCES.includes(arr[0])) { time.distance = arr[0]; time.discipline = arr[1].trim() }
        arr[1] = arr[1].trim()
        if (DISTANCES.includes(arr[1])) { time.distance = arr[1]; time.discipline = arr[0].trim() }
      }
    }
    time.discipline = getDiscipline(time.discipline)
    if (String(time.discipline).includes('혼성')) {
      time.gender = 'mixed'
      time.discipline = String(time.discipline).replace('혼성', '')
    }

    time.gender = checkGender(time)
    time.round  = getRoundKor2Eng(time.round)
    time.rank   = time.rank ? Number(time.rank) : 0

    if (typeof time.distance === 'number') time.distance = `${time.distance}M`
    if (time.distance && !isNaN(time.distance as any)) time.distance += 'M'

    const str = String(time.team).replace(/ /g, '')
    if (str.length <= 4) time.team = str

    time.name = String(time.name).replace(/\n|\r|\t/gi, ',').replace(/,{2,}/g, ',')
    if (!time.team) time.team = time.province ? time.province : ''
    if (time.team && !time.name) time.name = time.team
    time.names = String(time.name).replace(/ , |, | ,/gi, ',').split(',')

    if (time.individual && time.names.length >= 4) time.individual = false
    time.individual = !String(time.discipline).includes('Relay')
    if (!time.individual && !time.name && time.team) time.name = time.team

    if (String(time.ageGroup).includes('기록회')
        || (!String(time.ageGroup).includes('비등록선수') && String(time.ageGroup).includes('등록선수'))) {
      time.masters = false
    }

    const sheet = time.sheet
    time = customizing(time)
    time.sheet = sheet

    if (!time.name && !time.team) continue

    time.timeID = timeID++
    delete time.sheet
    if (discipline.fin) time.fin = true

    if (row.adult) {
      time.isAdult = '학생,junior'.indexOf(String(row.adult).toLowerCase()) < 0
    } else {
      time.isAdult = checkAdult({ ...time, category: row.category })
    }

    times.push(time)
  }

  return times
}

// 같은 대회 안에서 완전히 겹치는 기록을 찾아 메시지로 (excelDAO.checkDuplicate)
export function checkDuplicate(times: Row[]): string {
  const timeOBJ: Record<string, string[]> = {}
  for (const time of times) {
    const key = `${time.competitionID}-${time.gender}-${time.discipline}-${time.distance}-${time.round || ''}-${time.name}-${time.team}-${time.time}`
    if (!timeOBJ[key]) timeOBJ[key] = []
    timeOBJ[key].push(`${time.name}, ${time.team}, ${time.time}, ${time.ageGroup}, ${time.gender}, ${time.discipline}, ${time.distance}-${time.round || ''}`)
  }

  let timeArr: string[] = []
  for (const key of Object.keys(timeOBJ)) {
    if (timeOBJ[key].length > 1) timeArr = timeArr.concat(timeOBJ[key])
  }
  return 'check duplicate:\n' + timeArr.join('\n')
}

// ── 공개 진입점 ───────────────────────────────────────────────────
// 원본 readDAO.read 와 같은 순서: 엑셀 읽기 → 행 전개 → 정규화 → seqno/customTime
export function parseTimesExcel(buf: Buffer, competition: ImportCompetition): Row[] {
  const excelTimes = readExcelOrg(buf)
  const formatted  = formatTimes(excelTimes)
  const times      = customizingTimesORG(formatted, competition)

  return times.map((time, seqno) => {
    time.seqno = seqno
    return customTime(time)
  })
}
