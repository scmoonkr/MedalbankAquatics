/* 메달뱅크 · Scoring engine
 *
 * World Aquatics Points 계산 + 연령 보정 + 종목 환산 데이터 / 공식.
 *
 * Points = floor( 1000 × (basetime / time)^3 )
 *  - basetime: 각 종목의 기준 시간(초). 본 모듈에서는 LCM 세계기록을 기준으로 사용.
 *  - time:     사용자/측정 기록(초)
 *
 * 연령 보정:
 *  - 본 모듈은 단일 계수 모델(Rowson-style)을 사용한다.
 *  - 각 5세 연령부의 마스터즈 세계기록을 25-29(오픈) 마스터즈 세계기록과 비교한
 *    근사 비율을 단일 상수로 적용. 종목·거리에 따라 실제 비율이 다소 변동하므로
 *    어디까지나 "큰 그림" 환산임을 모달의 (i) 안내 문구로 명시한다.
 */
(() => {
  'use strict';

  // ── Base times (LCM, seconds) ─────────────────────────────
  // 각 종목의 1000점 기준 시간. 운영 시 World Aquatics 공식 베이스타임 표로 교체.
  const BASE_TIMES_LCM = {
    M: {
      FR: {  50: 20.91, 100: 46.40, 200: 102.00, 400: 219.96, 800: 452.12, 1500: 870.67 },
      BK: {  50: 23.55, 100: 51.60, 200: 111.92 },
      BR: {  50: 25.95, 100: 56.88, 200: 125.48 },
      FL: {  50: 22.27, 100: 49.45, 200: 110.34 },
      IM: { 200: 114.00, 400: 243.84 }
    },
    W: {
      FR: {  50: 23.61, 100: 51.71, 200: 112.23, 400: 235.38, 800: 484.79, 1500: 920.48 },
      BK: {  50: 26.86, 100: 57.13, 200: 123.14 },
      BR: {  50: 28.56, 100: 64.13, 200: 137.55 },
      FL: {  50: 24.43, 100: 55.48, 200: 121.81 },
      IM: { 200: 126.12, 400: 265.87 }
    }
  };

  // ── Age group factors (25-29 base = 1.0000) ───────────────
  // 본인 연령 그룹의 마스터즈 WR ÷ 25-29 오픈 마스터즈 WR 의 평균적 비율.
  // 예: 35-39 그룹의 경우 0.9777 ≈ (25-29 WR / 35-39 WR).
  // 사용자 기록 × factor = "25-29 오픈 등가" 시간.
  const AGE_GROUP_FACTORS = {
    "25-29": 1.0000,
    "30-34": 0.9900,
    "35-39": 0.9777,
    "40-44": 0.9560,
    "45-49": 0.9280,
    "50-54": 0.8940,
    "55-59": 0.8510,
    "60-64": 0.8040,
    "65-69": 0.7490,
    "70-74": 0.6860,
    "75-79": 0.6170,
    "80-84": 0.5430,
    "85-89": 0.4670
  };

  // ── 보조 비교 기록 (Compare records overlay) ───────────────
  // canon-data.js 의 records.WR 외에 OR/AR/KR/WMR/KMR 을 모달 비교 블록에서 노출.
  // key 형식: `${gender}-${stroke}-${distance}-${course}`.
  // 운영자가 사이트 운영 중 점진적으로 채워 넣는 데이터.
  const COMPARE_OVERLAY = {

    "M-IM-200-LCM": {
      WR:  { time: 114.00, holder: "Ryan Lochte",     nation: "USA", year: 2011, venue: "Shanghai" },
      OR:  { time: 114.93, holder: "Ryan Lochte",     nation: "USA", year: 2012, venue: "London"   },
      AR:  { time: 115.86, holder: "Hagino Kosuke",   nation: "JPN", year: 2014 },
      KR:  { time: 120.97, holder: "Park Sang-woo",   nation: "KOR", year: 2023 },
      WMR: { time: 127.20, holder: "Jamie Falconer",  nation: "GBR", year: 2019, ageGroup: "25-29" },
      KMR: { time: 138.50, holder: "Lee Dong-min",    nation: "KOR", year: 2024, ageGroup: "25-29" }
    },

    "M-BR-100-LCM": {
      WR:  { time:  56.88, holder: "Adam Peaty",     nation: "GBR", year: 2019, venue: "Gwangju"  },
      OR:  { time:  57.13, holder: "Adam Peaty",     nation: "GBR", year: 2016, venue: "Rio"      },
      AR:  { time:  58.49, holder: "Yan Zibei",      nation: "CHN", year: 2018 },
      KR:  { time:  59.18, holder: "Kim Min-ho",     nation: "KOR", year: 2026, venue: "Gimcheon" },
      WMR: { time:  60.20, holder: "Sergey Geybel",  nation: "RUS", year: 2018, ageGroup: "25-29" },
      KMR: { time:  63.50, holder: "Kim Jeong-soo",  nation: "KOR", year: 2023, ageGroup: "25-29" }
    },

    "M-FR-50-LCM": {
      WR:  { time:  20.91, holder: "César Cielo",       nation: "BRA", year: 2009, venue: "São Paulo" },
      OR:  { time:  21.25, holder: "Cameron McEvoy",    nation: "AUS", year: 2024, venue: "Paris"     },
      AR:  { time:  21.32, holder: "Ning Zetao",        nation: "CHN", year: 2014 },
      KR:  { time:  21.72, holder: "Ji Yu-chan",        nation: "KOR", year: 2023, venue: "Hangzhou"  },
      WMR: { time:  22.85, holder: "Andre van Maljaars", nation: "NED", year: 2020, ageGroup: "25-29" },
      KMR: { time:  23.75, holder: "Choi Hong-jun",     nation: "KOR", year: 2025, ageGroup: "25-29" }
    },

    "M-FR-100-LCM": {
      WR:  { time:  46.40, holder: "David Popovici",  nation: "ROU", year: 2022, venue: "Rome"     },
      OR:  { time:  46.94, holder: "Eamon Sullivan",  nation: "AUS", year: 2008, venue: "Beijing"  },
      AR:  { time:  47.65, holder: "Ning Zetao",      nation: "CHN", year: 2015 },
      KR:  { time:  47.56, holder: "Hwang Sun-woo",   nation: "KOR", year: 2023 },
      WMR: { time:  50.30, holder: "Robert Margalis", nation: "USA", year: 2018, ageGroup: "25-29" },
      KMR: { time:  52.10, holder: "—",               nation: "KOR", year: null, ageGroup: "25-29" }
    },

    "M-FR-200-LCM": {
      WR:  { time: 102.00, holder: "Paul Biedermann", nation: "GER", year: 2009, venue: "Rome"     },
      OR:  { time: 102.96, holder: "Michael Phelps",  nation: "USA", year: 2008, venue: "Beijing"  },
      AR:  { time: 104.40, holder: "Hwang Sun-woo",   nation: "KOR", year: 2022 },
      KR:  { time: 104.40, holder: "Hwang Sun-woo",   nation: "KOR", year: 2022, venue: "Budapest" },
      WMR: { time: 111.80, holder: "Robert Margalis", nation: "USA", year: 2018, ageGroup: "25-29" },
      KMR: { time: 115.50, holder: "—",               nation: "KOR", year: null, ageGroup: "25-29" }
    }

  };

  // ── Helpers ───────────────────────────────────────────────
  function parseTime(input) {
    if (input == null) return null;
    if (typeof input === 'number') return input;
    let str = String(input).trim();
    if (!str) return null;
    // formats: "20.91" · "00:20.91" · "1:42.00" · "14:30.67"
    if (str.includes(':')) {
      const parts = str.split(':');
      let min = 0, sec = 0;
      if (parts.length === 2) {
        min = parseFloat(parts[0]) || 0;
        sec = parseFloat(parts[1]) || 0;
      } else if (parts.length === 3) {
        // h:mm:ss.SS — rare
        const h = parseFloat(parts[0]) || 0;
        min = parseFloat(parts[1]) || 0;
        sec = parseFloat(parts[2]) || 0;
        min += h * 60;
      }
      return min * 60 + sec;
    }
    const n = parseFloat(str);
    return isFinite(n) ? n : null;
  }

  function formatTime(seconds) {
    if (seconds == null || !isFinite(seconds) || seconds < 0) return '—';
    const min = Math.floor(seconds / 60);
    const sec = seconds - min * 60;
    if (min > 0) {
      // m:ss.SS — pad seconds to 5 chars (e.g. 1:42.00, not 1:42)
      const secStr = sec.toFixed(2);
      const padded = sec < 10 ? '0' + secStr : secStr;
      return min + ':' + padded;
    }
    return sec.toFixed(2);
  }

  function basetime(gender, stroke, distance) {
    const g = BASE_TIMES_LCM[gender];
    if (!g) return null;
    const s = g[stroke];
    if (!s) return null;
    return s[Number(distance)] || null;
  }

  function calcPoints(gender, stroke, distance, timeSec) {
    const base = basetime(gender, stroke, distance);
    if (!base || !timeSec || timeSec <= 0) return null;
    return Math.floor(1000 * Math.pow(base / timeSec, 3));
  }

  function timeForPoints(gender, stroke, distance, points) {
    const base = basetime(gender, stroke, distance);
    if (!base || !points || points <= 0) return null;
    return base / Math.cbrt(points / 1000);
  }

  /** Sign+absolute formatted diff between `time` and `reference`.
   *  Positive sign (+) when `time` is slower than the reference. */
  function diffString(timeSec, referenceSec) {
    if (timeSec == null || referenceSec == null) return '';
    const diff = timeSec - referenceSec;
    const sign = diff > 0 ? '+' : (diff < 0 ? '−' : '±');
    const abs  = Math.abs(diff);
    const txt  = abs < 60 ? abs.toFixed(2) + '초' : formatTime(abs);
    return sign + txt;
  }

  function ageGroupFromDob(dobStr, refDate) {
    if (!dobStr) return null;
    const dob = new Date(dobStr);
    if (isNaN(dob.getTime())) return null;
    const now = refDate ? new Date(refDate) : new Date();
    let age = now.getFullYear() - dob.getFullYear();
    const m = now.getMonth() - dob.getMonth();
    if (m < 0 || (m === 0 && now.getDate() < dob.getDate())) age--;
    if (age < 25) return null;            // Masters 등급은 만 25세부터
    if (age >= 90) return '85-89';        // 표 상한선
    const groupStart = Math.floor(age / 5) * 5;
    return groupStart + '-' + (groupStart + 4);
  }

  function compareRecords(gender, stroke, distance, course) {
    const key = [gender, stroke, distance, course].join('-');
    if (COMPARE_OVERLAY[key]) return COMPARE_OVERLAY[key];

    // Fallback: basetime을 기준으로 그럴듯한 가상 비교 기록을 생성한다.
    // 운영자가 실제 권위 기록을 COMPARE_OVERLAY에 채워 넣기 전까지의 placeholder.
    const base = basetime(gender, stroke, distance);
    if (!base) return null;
    const seed = (stroke.charCodeAt(0) * 31 + Number(distance) + gender.charCodeAt(0) * 7) % 1000;
    const pickName   = (offset) => _NAMES[(seed + offset) % _NAMES.length];
    const NATIONS_FX = ['USA','AUS','GBR','GER','JPN','CHN','BRA','HUN','FRA','ITA'];
    const pickNation = (offset) => NATIONS_FX[(seed + offset) % NATIONS_FX.length];
    return {
      WR:  { time: base,           holder: pickName(0),  nation: pickNation(0), year: 2024 - (seed % 6) },
      OR:  { time: base * 1.018,   holder: pickName(3),  nation: pickNation(3), year: 2024 - (seed % 4), venue: 'Paris' },
      AR:  { time: base * 1.038,   holder: pickName(6),  nation: 'JPN',         year: 2023 - (seed % 3) },
      KR:  { time: base * 1.085,   holder: pickName(9),  nation: 'KOR',         year: 2023 },
      WMR: { time: base * 1.125,   holder: pickName(12), nation: pickNation(6), year: 2022, ageGroup: '25-29' },
      KMR: { time: base * 1.210,   holder: pickName(15), nation: 'KOR',         year: 2024, ageGroup: '25-29' }
    };
  }

  function availableDistances(gender, stroke) {
    const g = BASE_TIMES_LCM[gender];
    if (!g) return [];
    const s = g[stroke];
    if (!s) return [];
    return Object.keys(s).map(Number).sort((a, b) => a - b);
  }

  // ── Sample records pool — "유사한 기록" 섹션의 가상 데이터 ───
  // 운영 시 실제 DB 쿼리로 교체할 placeholder. 각 종목에 대해 10개 포인트
  // 레벨의 시간을 자동 생성하여 ~340건의 풀을 구성한다.
  const _NAMES = [
    '홍길동','김민준','이서준','박지호','최도현','정성훈','강민수','윤지원',
    '한주영','오시현','서민재','안재현','조하늘','신현우','권다인','임채영',
    '배준서','류현민','문재일','구은서','노성진','임지원','전우진','황도윤'
  ];
  const _MEETS = [
    '24 코리아오픈','24 KB금융 챔피언십','105회 전국체전','25 대통령배',
    '24 동아수영대회','시·도민체전','회장배 전국수영대회','24 국가대표 선발전',
    '시민체전','100회 전국소년체전'
  ];
  const _VENUES = [
    '김천 실내수영장','인천 문학수영장','광주 남부대수영장','대전 한밭수영장',
    '부산 강서아쿠아틱센터','대구 두류수영장','수원 청소년수영장'
  ];

  const SAMPLE_RECORDS = (() => {
    const POOL = [];
    const POINT_LEVELS = [990, 920, 850, 760, 680, 600, 520, 450, 380, 320];

    Object.entries(BASE_TIMES_LCM).forEach(([g, strokes]) => {
      Object.entries(strokes).forEach(([s, dists]) => {
        Object.entries(dists).forEach(([d, base]) => {
          POINT_LEVELS.forEach((p, i) => {
            const time = base / Math.cbrt(p / 1000);
            const seed = (s.charCodeAt(0) + Number(d) + i * 7 + g.charCodeAt(0)) % 1000;
            POOL.push({
              gender: g,
              stroke: s,
              distance: Number(d),
              course: 'LCM',
              time: Math.round(time * 100) / 100,
              athlete: _NAMES[seed % _NAMES.length],
              meet:    _MEETS[(seed * 3) % _MEETS.length],
              venue:   _VENUES[(seed * 5) % _VENUES.length],
              date:    `${2021 + (seed % 5)}-${String(1 + (seed % 12)).padStart(2, '0')}-${String(1 + (seed % 28)).padStart(2, '0')}`
            });
          });
        });
      });
    });
    return POOL;
  })();

  /** 현재 점수와 가장 가까운 기록을 같은 영법 / 다른 영법 그룹으로 나눠 반환. */
  function similarRecords(gender, stroke, distance, course, points, n) {
    n = n || 10;
    if (!points) return { same: [], other: [] };
    const pool = SAMPLE_RECORDS.map(r => {
      const p = calcPoints(r.gender, r.stroke, r.distance, r.time);
      return Object.assign({}, r, {
        points: p,
        diff:   p == null ? Infinity : Math.abs(p - points)
      });
    }).filter(r => r.points != null);

    const same  = pool.filter(r => r.stroke === stroke)
                      .sort((a, b) => a.diff - b.diff).slice(0, n);
    const other = pool.filter(r => r.stroke !== stroke)
                      .sort((a, b) => a.diff - b.diff).slice(0, n);
    return { same, other };
  }

  // ── Equivalence grid (for "같은 점수의 다른 종목" table) ──
  // 사용자 명세 그대로:
  //   row 1 — 자유형 50 · 배영 50 · 평영 50 · 접영 50 · 개인혼영 200
  //   row 2 — 자유형 100 · 배영 100 · 평영 100 · 접영 100 · 개인혼영 400
  const EQUIV_GRID = [
    [['FR',  50], ['BK',  50], ['BR',  50], ['FL',  50], ['IM', 200]],
    [['FR', 100], ['BK', 100], ['BR', 100], ['FL', 100], ['IM', 400]]
  ];

  window.KSR_SCORING = {
    BASE_TIMES_LCM,
    AGE_GROUP_FACTORS,
    COMPARE_OVERLAY,
    EQUIV_GRID,
    SAMPLE_RECORDS,
    parseTime,
    formatTime,
    basetime,
    calcPoints,
    timeForPoints,
    diffString,
    ageGroupFromDob,
    compareRecords,
    availableDistances,
    similarRecords
  };
})();
