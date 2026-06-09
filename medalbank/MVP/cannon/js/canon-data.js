/* 메달뱅크 · The Canon — record matrix data
 *
 * 7개 권위 기록 × 5개 영법 × 거리 × 성별(남/여) 매트릭스.
 * LCM 개인전만 수록. SCM·계영·혼계영·혼성종목은 다루지 않음.
 *
 * 빈 셀은 `null` — 렌더 시 "—"로 표시. WR 컬럼의 실제 기록은 시드 더미.
 * 운영자가 OR/AR/KR/WMR/KMR/ER 컬럼을 점진적으로 채워 넣는 구조.
 *
 * Strokes:  FR · BA · BR · FL · IM
 * Genders:  M · W
 * Course:   LCM (고정)
 * Distance: number (m)
 */

const _r = (time, athlete, nation, year, venue, ageGroup) => ({
  time, athlete, nation, year, venue,
  ageGroup: ageGroup || null
});

const _ev = (id, gender, stroke, distance, label, records) => ({
  id, gender, stroke, distance, course: "LCM", label,
  records: Object.assign(
    { WR: null, OR: null, AR: null, KR: null, WMR: null, KMR: null, ER: null },
    records || {}
  )
});

window.KSR_CANON = {

  recordTypes: [
    { code: "WR",  ko: "세계",         full: "세계기록"           },
    { code: "OR",  ko: "올림픽",       full: "올림픽기록"         },
    { code: "AR",  ko: "아시아",       full: "아시아기록"         },
    { code: "KR",  ko: "한국",         full: "한국기록"           },
    { code: "WMR", ko: "세계 마스터즈", full: "세계마스터즈기록"   },
    { code: "KMR", ko: "한국 마스터즈", full: "한국마스터즈기록"   },
    { code: "ER",  ko: "인핸스드",     full: "인핸스드게임스기록" }
  ],

  strokeLabels: {
    FR: { ko: "자유형",   en: "Freestyle",         short: "FR" },
    BA: { ko: "배영",     en: "Backstroke",        short: "BA" },
    BR: { ko: "평영",     en: "Breaststroke",      short: "BR" },
    FL: { ko: "접영",     en: "Butterfly",         short: "FL" },
    IM: { ko: "개인혼영", en: "Individual Medley", short: "IM" }
  },

  events: [

    // ════════════════════════════════════════════════════════
    // Freestyle · 자유형
    // ════════════════════════════════════════════════════════
    _ev("m-fr-50",   "M","FR",  50, "남자 자유형 50m",   { WR: _r("20.91",   "César Cielo",       "BRA", 2009, "São Paulo") }),
    _ev("w-fr-50",   "W","FR",  50, "여자 자유형 50m",   { WR: _r("23.61",   "Sarah Sjöström",    "SWE", 2023, "Fukuoka") }),
    _ev("m-fr-100",  "M","FR", 100, "남자 자유형 100m",  { WR: _r("46.40",   "David Popovici",    "ROU", 2022, "Rome") }),
    _ev("w-fr-100",  "W","FR", 100, "여자 자유형 100m",  { WR: _r("51.71",   "Sarah Sjöström",    "SWE", 2017, "Budapest") }),
    _ev("m-fr-200",  "M","FR", 200, "남자 자유형 200m",  { WR: _r("1:42.00", "Paul Biedermann",   "GER", 2009, "Rome") }),
    _ev("w-fr-200",  "W","FR", 200, "여자 자유형 200m",  { WR: _r("1:52.23", "Mollie O'Callaghan","AUS", 2023, "Fukuoka") }),
    _ev("m-fr-400",  "M","FR", 400, "남자 자유형 400m",  { WR: _r("3:39.96", "Lukas Märtens",     "GER", 2024, "Paris") }),
    _ev("w-fr-400",  "W","FR", 400, "여자 자유형 400m",  { WR: _r("3:55.38", "Ariarne Titmus",    "AUS", 2023, "Fukuoka") }),
    _ev("m-fr-800",  "M","FR", 800, "남자 자유형 800m",  { WR: _r("7:32.12", "Zhang Lin",         "CHN", 2009, "Rome") }),
    _ev("w-fr-800",  "W","FR", 800, "여자 자유형 800m",  { WR: _r("8:04.79", "Katie Ledecky",     "USA", 2016, "Rio") }),
    _ev("m-fr-1500", "M","FR",1500, "남자 자유형 1500m", { WR: _r("14:30.67","Sun Yang",          "CHN", 2012, "London") }),
    _ev("w-fr-1500", "W","FR",1500, "여자 자유형 1500m", { WR: _r("15:20.48","Katie Ledecky",     "USA", 2018, "Indianapolis") }),

    // ════════════════════════════════════════════════════════
    // Backstroke · 배영
    // ════════════════════════════════════════════════════════
    _ev("m-bk-50",  "M","BA", 50, "남자 배영 50m",  { WR: _r("23.55",   "Hunter Armstrong", "USA", 2022, "Greensboro") }),
    _ev("w-bk-50",  "W","BA", 50, "여자 배영 50m",  { WR: _r("26.86",   "Liu Xiang",        "CHN", 2018, "Jakarta") }),
    _ev("m-bk-100", "M","BA",100, "남자 배영 100m", { WR: _r("51.60",   "Thomas Ceccon",    "ITA", 2022, "Budapest") }),
    _ev("w-bk-100", "W","BA",100, "여자 배영 100m", { WR: _r("57.13",   "Kaylee McKeown",   "AUS", 2024, "Paris") }),
    _ev("m-bk-200", "M","BA",200, "남자 배영 200m", { WR: _r("1:51.92", "Aaron Peirsol",    "USA", 2009, "Rome") }),
    _ev("w-bk-200", "W","BA",200, "여자 배영 200m", { WR: _r("2:03.14", "Kaylee McKeown",   "AUS", 2023, "Sydney") }),

    // ════════════════════════════════════════════════════════
    // Breaststroke · 평영
    // ════════════════════════════════════════════════════════
    _ev("m-br-50",  "M","BR", 50, "남자 평영 50m",  { WR: _r("25.95",   "Adam Peaty",       "GBR", 2017, "Budapest") }),
    _ev("w-br-50",  "W","BR", 50, "여자 평영 50m",  { WR: _r("28.56",   "Rūta Meilutytė",   "LTU", 2023, "Fukuoka") }),
    _ev("m-br-100", "M","BR",100, "남자 평영 100m", { WR: _r("56.88",   "Adam Peaty",       "GBR", 2019, "Gwangju") }),
    _ev("w-br-100", "W","BR",100, "여자 평영 100m", { WR: _r("1:04.13", "Lilly King",       "USA", 2017, "Budapest") }),
    _ev("m-br-200", "M","BR",200, "남자 평영 200m", { WR: _r("2:05.48", "Anton Chupkov",    "RUS", 2019, "Gwangju") }),
    _ev("w-br-200", "W","BR",200, "여자 평영 200m", { WR: _r("2:17.55", "Tatjana Smith",    "RSA", 2024, "Paris") }),

    // ════════════════════════════════════════════════════════
    // Butterfly · 접영
    // ════════════════════════════════════════════════════════
    _ev("m-fl-50",  "M","FL", 50, "남자 접영 50m",  { WR: _r("22.27",   "Andriy Govorov",   "UKR", 2018, "Rome") }),
    _ev("w-fl-50",  "W","FL", 50, "여자 접영 50m",  { WR: _r("24.43",   "Sarah Sjöström",   "SWE", 2014, "Borås") }),
    _ev("m-fl-100", "M","FL",100, "남자 접영 100m", { WR: _r("49.45",   "Caeleb Dressel",   "USA", 2021, "Tokyo") }),
    _ev("w-fl-100", "W","FL",100, "여자 접영 100m", { WR: _r("55.48",   "Sarah Sjöström",   "SWE", 2016, "Rio") }),
    _ev("m-fl-200", "M","FL",200, "남자 접영 200m", { WR: _r("1:50.34", "Kristóf Milák",    "HUN", 2022, "Budapest") }),
    _ev("w-fl-200", "W","FL",200, "여자 접영 200m", { WR: _r("2:01.81", "Liu Zige",         "CHN", 2009, "Jinan") }),

    // ════════════════════════════════════════════════════════
    // Individual Medley · 개인혼영
    // ════════════════════════════════════════════════════════
    _ev("m-im-200", "M","IM",200, "남자 개인혼영 200m", { WR: _r("1:54.00", "Ryan Lochte",    "USA", 2011, "Shanghai") }),
    _ev("w-im-200", "W","IM",200, "여자 개인혼영 200m", { WR: _r("2:06.12", "Katinka Hosszú", "HUN", 2015, "Kazan") }),
    _ev("m-im-400", "M","IM",400, "남자 개인혼영 400m", { WR: _r("4:03.84", "Michael Phelps", "USA", 2008, "Beijing") }),
    _ev("w-im-400", "W","IM",400, "여자 개인혼영 400m", { WR: _r("4:25.87", "Summer McIntosh","CAN", 2024, "Toronto") })

  ]
};
