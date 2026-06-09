// WA Points utility — shared between migration, recalc, and similar query.
// BASE_TIMES: World Aquatics world records used as the base for point calculation.
// Update values here when a WR is broken, then run /api/backend/recalc/wapoints.

export const BASE_TIMES: Record<string, Record<string, Record<string, Record<number, number>>>> = {
  LCM: {
    M: {
      FR: {   50: 20.91, 100:  46.40, 200: 102.00, 400: 219.96,  800: 452.12, 1500:  870.67 },
      BA: {   50: 23.55, 100:  51.60, 200: 111.92 },
      BR: {   50: 25.95, 100:  56.88, 200: 125.48 },
      FL: {   50: 22.27, 100:  49.45, 200: 110.34 },
      IM: {              200: 114.00, 400: 243.84 },
    },
    W: {
      FR: {   50: 23.61, 100:  51.71, 200: 112.23, 400: 235.38,  800: 484.79, 1500:  920.48 },
      BA: {   50: 26.86, 100:  57.13, 200: 123.14 },
      BR: {   50: 28.56, 100:  64.13, 200: 137.55 },
      FL: {   50: 24.43, 100:  55.48, 200: 121.81 },
      IM: {              200: 126.12, 400: 265.87 },
    },
  },
  SCM: {
    M: {
      FR: {   50: 20.16, 100:  44.84, 200:  99.69, 400: 215.34,  800: 445.06, 1500:  856.17 },
      BA: {   50: 22.22, 100:  48.58, 200: 106.38 },
      BR: {   50: 24.95, 100:  55.34, 200: 122.37 },
      FL: {   50: 21.75, 100:  47.78, 200: 108.49 },
      IM: {   100: 50.70, 200: 111.40, 400: 237.68 },
    },
    W: {
      FR: {   50: 22.93, 100:  50.25, 200: 108.52, 400: 229.29,  800: 472.93, 1500:  910.89 },
      BA: {   50: 25.67, 100:  55.03, 200: 118.94 },
      BR: {   50: 28.37, 100:  62.36, 200: 133.08 },
      FL: {   50: 24.38, 100:  54.61, 200: 118.02 },
      IM: {   100: 56.51, 200: 121.22, 400: 260.34 },
    },
  },
}

/**
 * Returns the WA base time (seconds) for a given event, or null if not defined.
 * Accepts mergedTimes field format:
 *   gender:   'men' | 'women'
 *   distanceStr: '50M' | '100M' | ...
 */
export function getBasetime(
  course:      string,   // 'LCM' | 'SCM'
  gender:      string,   // 'men' | 'women'
  discipline:  string,   // 'FR' | 'BA' | 'BR' | 'FL' | 'IM'
  distanceStr: string,   // '50M' | '100M' | ...
): number | null {
  const g    = (gender === 'men' || gender === 'M') ? 'M' : 'W'
  const dist = parseInt(distanceStr)
  return BASE_TIMES[course]?.[g]?.[discipline]?.[dist] ?? null
}

/**
 * Calculates WA points.
 *   basetime:  WR in seconds
 *   timeStamp: fractional day (mergedTimes.timeStamp = seconds / 86400)
 */
export function calcWAPoints(basetime: number, timeStamp: number): number {
  const timeSec = timeStamp * 86400
  if (!timeSec || !basetime) return 0
  return Math.floor(1000 * Math.pow(basetime / timeSec, 3))
}
