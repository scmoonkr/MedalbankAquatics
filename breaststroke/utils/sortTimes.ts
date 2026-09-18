
import type { SwimStyle, Gender, SwimCourse, Distance, JsonOptions } from '~/types/common';
import { TimeModel } from '~/models/times';

/**
 * 시간 데이터를 분류하고 정렬하여 랭킹을 부여하는 함수
 * @param {Array} times - 시간 데이터 배열 ({timeID, name, ageGroup, gender, style, course, distance, timeStamp} 형식)
 * @returns {Array} - 랭킹이 부여된 시간 데이터
 */
export const sortAndRankTimes = (times: TimeModel[]): TimeModel[] => {
  if (!Array.isArray(times) || times.length === 0) {
    return [];
  }

  // 결과를 저장할 배열
  const result: TimeModel[] = [];
  
  // 카테고리별로 그룹화
  const categories: { [key: string]: TimeModel[] } = {};
  
  // 시간 데이터를 카테고리별로 분류
  times.forEach(time => {
    // 필수 필드 확인
    // if (!time.ageGroup || !time.gender || !time.style || !time.course || !time.distance) {
    if (!time.gender || !time.style || !time.distance) {
      console.warn('Missing required fields:', time);
      return;
    }
    
    // 카테고리 키 생성 (ageGroup-gender-style-course-distance)
    const categoryKey = `${time.gender}-${time.style}-${time.distance}`;
    
    if (!categories[categoryKey]) {
      categories[categoryKey] = [];
    }
    
    // 확장된 타입의 항목 생성
    const timeWithCategory: TimeModel & { categoryKey?: string } = {
      ...time,
      categoryKey // 나중에 결과 식별용
    };
    
    categories[categoryKey].push(timeWithCategory);
  });
  
  // 각 카테고리별로 정렬 및 랭킹 부여
  Object.keys(categories).forEach(categoryKey => {
    const categoryTimes: (TimeModel & { categoryKey?: string })[] = categories[categoryKey];
    
    // timeStamp = 0인 항목과 그렇지 않은 항목 분리
    const validTimes = categoryTimes.filter(time => time.timeStamp && time.timeStamp > 0);
    const zeroTimes = categoryTimes.filter(time => !time.timeStamp || time.timeStamp === 0);
    
    // timeStamp로 정렬 (오름차순)
    validTimes.sort((a, b) => (a.timeStamp || 0) - (b.timeStamp || 0));
    
    // 랭킹 부여
    let currentRank = 1;
    let previousTimeStamp = -1;
    
    validTimes.forEach((time, index) => {
      // 이전 timeStamp와 같으면 같은 랭킹 부여
      if (index > 0 && time.timeStamp === previousTimeStamp) {
        time.rank = validTimes[index - 1].rank;
      } else {
        time.rank = currentRank;
      }
      
      currentRank++;
      previousTimeStamp = time.timeStamp || 0;
      delete time.categoryKey;
      
      result.push(time);
    });
    
    // timeStamp = 0인 항목은 랭킹 없이 결과에 추가
    zeroTimes.forEach(time => {
      time.rank = ''; // 랭킹 없음
      delete time.categoryKey;
      result.push(time);
    });
  });
  
  return result;
};
/**
 * 리더보드 데이터를 정렬하고 필요한 모든 조합을 생성하는 함수
 * @param times 원본 리더보드 데이터 배열
 * @param insertBlank 없으면 빈 times 배열을 가진 새 객체를 추가하는지 여부
 * @returns 정렬된 새 리더보드 데이터 배열
 */
export const sortTimes = (times: any[], insertBlank = false): any[] => {
  // 가능한 모든 값 정의
  const genders: Gender[] = ['men', 'women', 'mixed'];
  const styles: SwimStyle[] = ['freestyle', 'backstroke', 'breaststroke', 'butterfly', 'individualMedley', 'freestyleRelay', 'medleyRelay'];
  const courses: SwimCourse[] = ['LCM', 'SCM'];
  const distances: Distance[] = ['25M', '50M', '100M', '200M', '400M', '800M', '1500M'];

  // 결과 배열 초기화
  const newTimes: any[] = [];

  // 모든 가능한 조합 생성
  for (const gender of genders) {
    for (const style of styles) {
      for (const course of courses) {
        for (const distance of distances) {
          // 현재 조합이 원본 데이터에 있는지 확인
          const existingData = times.find(item =>
            (item as any).gender === gender &&
            (item as any).style === style &&
            (item as any).course === course &&
            (item as any).distance === distance
          );

          if (existingData) {
            // 기존 데이터가 있으면 그대로 추가
            newTimes.push(existingData);
          } else if (insertBlank) {
            // 없으면 빈 times 배열을 가진 새 객체 추가
            newTimes.push({
              gender,
              style,
              course,
              distance,
              times: []
            });
          }
        }
      }
    }
  }

  return newTimes;
};

export function extractUniqueAthletes(times: TimeModel[]) {
  // athleteID를 키로 사용하여 중복을 제거하는 Map
  const uniqueAthletesMap = new Map<number, {}>();

  // 각 기록을 순회하며 athleteID가 유효한 경우에만 Map에 추가
  times.forEach(record => {
    if (record.athleteID && record.athleteID > 0) {
      // 이미 Map에 없는 경우에만 추가
      if (!uniqueAthletesMap.has(record.athleteID)) {
        uniqueAthletesMap.set(record.athleteID, {
          athleteID: record.athleteID,
          name: record.name || ''
        });
      }
    }
  });

  // Map의 값들을 배열로 변환하여 반환
  return Array.from(uniqueAthletesMap.values()).sort((a, b) => (a as any).name - (b as any).name);
}