

export const weekdays = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'];
const date = new Date(2025, 3, 1) // 2025년 4월 1일

export function getDateFormat(datestr, format) {
  const date = new Date(datestr);
  const formattedDate = `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일 ${weekdays[date.getDay()]}`
  return formattedDate;
}

export function formatyyyyMMdd(date) {
  try {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  } catch (e) {
    return date ?? ""
  }
}
export const displayFormattedTime = (rawInputTime) => {
  const value = rawInputTime.replace(/\D/g, '').padStart(6, '0').slice(-6);
  const mm = value.slice(0, 2);
  const ss = value.slice(2, 4);
  const hs = value.slice(4, 6);
  return `${mm}분 ${ss}초 ${hs}`;
  // return mm == '00' ? `${ss}초 ${hs}` : `${mm}분 ${ss}초 ${hs}`;
}

export function convertTimeStampToString(timeStamp) {
  const totalSeconds = timeStamp * 24 * 60 * 60;

  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  const paddedMinutes = String(minutes).padStart(2, '0');
  const paddedSeconds = seconds.toFixed(2).padStart(5, '0'); // e.g., "32.61"

  return paddedMinutes == "00" ? `${paddedSeconds}` : `${paddedMinutes}:${paddedSeconds}`;
}

export function convertStringToTimeStamp(time) {
  if (!time.includes(':')) {
    time = "00:" + time;
  }
  const [minStr, secStr] = time.split(':');
  const minutes = parseInt(minStr, 10);
  const seconds = parseFloat(secStr);

  const totalSeconds = minutes * 60 + seconds;
  return totalSeconds / (24 * 60 * 60); // 일(day) 단위 소수
}
export function timeStringToSeconds(time) {
  const [minStr, secStr] = time.split(':');
  const minutes = parseInt(minStr, 10);
  const seconds = parseFloat(secStr);
  return minutes * 60 + seconds;
}
export function customTimes(time) {
  if (time.slice(0, 3) == "00:") time = time.slice(3);
  if (time.slice(0, 3) == "00:") time = time.slice(3);
  const tms = time.split(':')
  if (tms.length > 1 && tms[0].length == 1) {
    tms[0] = "0" + tms[0]
    time = tms.join(':')
  }
  // if (time.slice(0, 1) == "0") time = time.slice(1);
  return time;
}