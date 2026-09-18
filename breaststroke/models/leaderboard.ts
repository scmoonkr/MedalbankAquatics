// models/leaderboard.ts

import type { TimeType, SwimStyle, Gender, SwimCourse, Distance } from '~/types/common';
import type { TimeModel } from '~/models/times';

/**
 * 리더보드 모델 인터페이스
 * 수영 리더보드의 카테고리와 관련 기록을 구조화하는 모델
 */
export interface LeaderboardModel {
  /** 기록 타입 (공식, 연습 등) */
  type?: TimeType;

  /** 성별 구분 (남성, 여성, 혼성) */
  gender: Gender;

  /** 수영 스타일 (자유형, 배영, 평영, 접영, 개인혼영 등) */
  style: SwimStyle;

  /** 코스 타입 (장수영장, 단수영장) */
  course: SwimCourse;

  /** 경기 거리 */
  distance: Distance;

  /** 해당 카테고리의 기록 목록 */
  times: TimeModel[];
}

/**
 * 리더보드 데이터를 정렬하고 필요한 모든 조합을 생성하는 함수
 * @param leaderboards 원본 리더보드 데이터 배열
 * @param insertBlank 없으면 빈 times 배열을 가진 새 객체를 추가하는지 여부
 * @returns 정렬된 새 리더보드 데이터 배열
 */
export const sortLeaderboards = (leaderboards: LeaderboardModel[], insertBlank = false): LeaderboardModel[] => {
  // 가능한 모든 값 정의
  const genders: Gender[] = ['men', 'women', 'mixed'];
  const styles: SwimStyle[] = ['freestyle', 'backstroke', 'breaststroke', 'butterfly', 'individualMedley', 'freestyleRelay', 'medleyRelay'];
  const courses: SwimCourse[] = ['SCM', 'LCM'];
  const distances: Distance[] = ['25M', '50M', '100M', '200M', '400M', '800M', '1500M'];

  // 결과 배열 초기화
  const newLeaderboards: LeaderboardModel[] = [];

  // 모든 가능한 조합 생성
  for (const style of styles) {
    for (const distance of distances) {
      for (const course of courses) {
        for (const gender of genders) {

          // 현재 조합이 원본 데이터에 있는지 확인
          const existingData = leaderboards.find(item =>
            item.gender === gender &&
            item.style === style &&
            item.course === course &&
            item.distance === distance
          );
          // 원본 데이터에서 type 속성이 있는 경우에만 type 속성 추가
          const typeValue = leaderboards.length > 0 && leaderboards[0].type !== undefined
            ? leaderboards[0].type
            : undefined;
          if (existingData) {
            if (typeValue) existingData.type = typeValue;
            // 기존 데이터가 있으면 그대로 추가
            newLeaderboards.push(existingData);
          } else if (insertBlank) {
            // 없으면 빈 times 배열을 가진 새 객체 추가
            newLeaderboards.push({
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

  return newLeaderboards;
};

// 사용 예시
// const originalLeaderboards: LeaderboardItem[] = [
//   { gender: 'men', style: 'freestyle', course: 'LCM', distance: '50M', times: [/* 데이터 */] },
//   { gender: 'women', style: 'butterfly', course: 'SCM', distance: '100M', times: [/* 데이터 */] },
//   // ... 기타 데이터
// ];
//
// const sortedLeaderboards = createNewLeaderboards(originalLeaderboards);