// utils/athleteProcessor.ts

import type { TimeModel } from '~/models/times';
import type { LeaderboardModel } from '~/models/leaderboard';
// import type { MedalCount, EventKey, StatsEvent, SwimmingStats } from '~/types/athletes';
import { setCompression, decompression, getTeam, getPool, getCompetition } from '~/utils/compression';

export interface MedalCount {
  gold: number;
  silver: number;
  bronze: number;
}

export interface EventKey {
  style: string;
  course: string;
  distance: string;
}

export interface StatsEvent extends TimeModel {
  competitionCount?: number;
}

export interface SwimmingStats {
  eventBestTime?: Record<string, StatsEvent>;
  eventFirstTime?: Record<string, StatsEvent>;
  eventLatestTime?: Record<string, StatsEvent>;
  timeBestTime?: Record<string, StatsEvent>;
  timeFirstTime?: Record<string, StatsEvent>;
  timeLatestTime?: Record<string, StatsEvent>;
  medals?: Record<string, StatsEvent>;
}

/**
 * 수영 기록 및 통계를 처리하는 클래스
 */
export class SwimmingStatsProcessor {
  /**
   * 주요 스타일 모델 생성
   */
  static majorStylesModel(times: TimeModel[]) {
    // style의 빈도를 계산 및 세부 데이터 저장
    const countMap: Record<string, any> = {};

    for (const t of times) {
      if (t.style && t.style.length > 0) {
        if (!countMap[t.style]) {
          countMap[t.style] = {
            style: t.style,
            distance: t.distance,
            time: t.time,
            rank: t.rank,
            count: 0
          };
        }
        countMap[t.style].count++;
      }
    }

    // 객체를 배열로 변환하고 정렬
    const styles = Object.values(countMap);
    styles.sort((a, b) => b.count - a.count); // 개수가 많은 순서로 정렬

    return styles;
  }

  /**
   * 팀별 카운트 모델 생성
   */
  static getTeamsByCountModel(times: TimeModel[]) {
    if (!times || times.length === 0) return [];

    // teamID의 빈도를 계산
    const countMap: Record<number, any> = {};

    for (const t of times) {
      if (t.teamID) {
        if (countMap[t.teamID]) {
          countMap[t.teamID].count++;
        } else {
          countMap[t.teamID] = {
            teamID: t.teamID,
            name: t.team,
            count: 1
          };
        }
      }
    }

    // 객체를 배열로 변환하고 정렬
    const teams = Object.values(countMap);
    teams.sort((a, b) => b.count - a.count); // 개수가 많은 순서로 정렬

    return teams.length > 10 ? teams.slice(0, 10) : teams;
  }

  /**
   * 수영장별 카운트 모델 생성
   */
  static getPoolsByCountModel(times: TimeModel[]) {
    if (!times || times.length === 0) return [];

    // poolID의 빈도를 계산
    const countMap: Record<number, any> = {};

    for (const t of times) {
      if (t.poolID) {
        if (countMap[t.poolID]) {
          countMap[t.poolID].count++;
        } else {
          countMap[t.poolID] = {
            poolID: t.poolID,
            name: t.pool,
            count: 1
          };
        }
      }
    }

    // 객체를 배열로 변환하고 정렬
    const pools = Object.values(countMap);
    if (pools.length === 0) return [];

    pools.sort((a, b) => b.count - a.count); // 개수가 많은 순서로 정렬

    return pools.length > 3 ? pools.slice(0, 3) : pools;
  }

  /**
   * 연령대별 카운트 모델 생성
   */
  static getAgeGroupByCountModel(times: TimeModel[]) {
    if (!times || times.length === 0) return [];

    // ageGroup의 빈도를 계산
    const countMap: Record<string, any> = {};

    for (const t of times) {
      if (t.ageGroup && t.ageGroup !== "") {
        if (countMap[t.ageGroup]) {
          countMap[t.ageGroup].count++;
        } else {
          countMap[t.ageGroup] = {
            ageGroup: t.ageGroup,
            count: 1
          };
        }
      }
    }

    // 객체를 배열로 변환하고 정렬
    const ageGroups = Object.values(countMap);
    if (ageGroups.length === 0) return [];

    ageGroups.sort((a, b) => b.count - a.count); // 개수가 많은 순서로 정렬

    return ageGroups.length > 10 ? ageGroups.slice(0, 10) : ageGroups;
  }

  /**
   * 메달 개수 계산 모델 생성
   */
  static calculateMedalsModel(times: TimeModel[]) {
    const medals = { gold: 0, silver: 0, bronze: 0 };

    for (const time of times) {
      if (time.rank === 1) {
        medals.gold++;
      } else if (time.rank === 2) {
        medals.silver++;
      } else if (time.rank === 3) {
        medals.bronze++;
      }
    }

    return medals;
  }

  /**
   * 리더보드 모델 생성 (타입별 그룹화)
   */
  static groupedLeaderboardModel(timeArr: TimeModel[]) {
    if (!timeArr || timeArr.length === 0) return [];

    // 그룹화 로직
    const grouped: Record<string, TimeModel[]> = {};

    for (const t of timeArr) {
      const key = `${t.gender}_${t.style}_${t.course}_${t.distance}`;
      if (!grouped[key]) {
        grouped[key] = [];
      }
      grouped[key].push(t);
    }

    const leaderboards: any[] = [];
    const genders = ['men', 'women', 'mixed'];
    const styles = [
      'freestyle', 'backstroke', 'breaststroke', 'butterfly',
      'individualMedley', 'freestyleRelay', 'medleyRelay'
    ];
    const courses = ['SCM', 'LCM'];
    const distances = ['25M', '50M', '100M', '200M', '400M', '800M', '1500M'];

    for (const gender of genders) {
      for (const style of styles) {
        for (const course of courses) {
          for (const distance of distances) {
            const key = `${gender}_${style}_${course}_${distance}`;
            if (grouped[key]) {
              const lbm: any = {
                gender,
                style,
                course,
                distance,
                times: grouped[key]
              };
              leaderboards.push(lbm);
            }
          }
        }
      }
    }

    return leaderboards;
  }

  /**
   * 리더보드 생성 (세부 정보 포함)
   */
  static makeLeaderboard(timeArr: TimeModel[]) {
    if (!timeArr || timeArr.length === 0) return [];

    // 그룹화
    const grouped: Record<string, TimeModel[]> = {};

    for (const t of timeArr) {
      const key = `${t.gender}_${t.style}_${t.course}_${t.distance}`;
      if (!grouped[key]) {
        grouped[key] = [];
      }
      grouped[key].push(t);
    }

    const leaderboards: any[] = [];
    const genders = ['men', 'women', 'mixed'];
    const styles = [
      'freestyle', 'backstroke', 'breaststroke', 'butterfly',
      'individualMedley', 'freestyleRelay', 'medleyRelay'
    ];
    const courses = ['SCM', 'LCM'];
    const distances = ['25M', '50M', '100M', '200M', '400M', '800M', '1500M'];

    for (const gender of genders) {
      for (const style of styles) {
        for (const course of courses) {
          for (const distance of distances) {
            const key = `${gender}_${style}_${course}_${distance}`;
            if (grouped[key]) {
              const times = grouped[key];

              // 메달 및 통계 계산
              leaderboards.push({
                gender,
                style,
                course,
                distance,
                medals: this.calculateMedalsModel(times),
                // majorStyle: this.majorStylesModel(times),
                // 추가적인 통계 처리는 필요시 구현
                times
              });
            }
          }
        }
      }
    }

    return leaderboards;
  }
  static makeLeaderboardObj(timeArr: TimeModel[]) {
    if (!timeArr || timeArr.length === 0) return [];

    // 그룹화
    const grouped: Record<string, TimeModel[]> = {};

    for (const t of timeArr) {
      const key = `${t.gender}_${t.style}_${t.course}_${t.distance}`;
      if (!grouped[key]) {
        grouped[key] = [];
      }
      grouped[key].push(t);
    }

    return grouped;
  }


  /**
   * 수영 기록에서 통계 데이터를 생성합니다
   * @param times 수영 기록 배열
   * @returns 통계 데이터
   */
  static processStatistics(eventTimes: TimeModel[], timeTimes: TimeModel[]): SwimmingStats {
    // 빈 데이터 초기화
    const extraInfo = {};
    const eventBestTime = {};
    const eventFirstTime = {};
    const eventLatestTime = {};
    const medals = {}; // { gold: 0, silver: 0, bronze: 0 };
    const timeBestTime = {};
    const timeFirstTime = {};
    const timeLatestTime = {};

    // 종목별 그룹화
    const eventGroups: Record<string, TimeModel[]> = {};

    // 1. 메달 집계
    eventTimes.forEach(time => {

      // 종목 키 생성 (style-course-distance)
      const eventKey = `${time.style}-${time.course}-${time.distance}`;

      // 종목별 그룹화
      if (!eventGroups[eventKey]) {
        eventGroups[eventKey] = [];
      }
      eventGroups[eventKey].push(time);
    });

    // 2. 각 종목별 best, first, latest 계산
    Object.entries(eventGroups).forEach(([eventKey, times]) => {
      times.forEach(time => {
        if (!(medals as any)[eventKey]) (medals as any)[eventKey] = { gold: 0, silver: 0, bronze: 0 };
        // 메달 집계
        if (time.rank === 1) (medals as any)[eventKey].gold++;
        else if (time.rank === 2) (medals as any)[eventKey].silver++;
        else if (time.rank === 3) (medals as any)[eventKey].bronze++;
      });
      // 타임스탬프로 정렬하여 최고 기록 찾기
      const sortedByTime = [...times].sort((a, b) => a.timeStamp - b.timeStamp);
      if (sortedByTime.length > 0) {
        // best[eventKey] = {
        //   ...bestTime,
        //   competitionCount: times.filter(
        //     t => t.competitionID && t.competitionID > 0
        //   ).length
        // };
        // 데이터를 처리할 때 TimeModel 인스턴스를 생성하는 방식
        (eventBestTime as any)[eventKey] = {
          ...sortedByTime[0],
          competitionCount: times.filter(t => t.competitionID && t.competitionID > 0).length
        };
      }

      // 날짜로 정렬하여 첫 기록과 최근 기록 찾기
      const sortedByDate = [...times].sort((a, b) => {
        const dateA = new Date(a.datetime).getTime();
        const dateB = new Date(b.datetime).getTime();
        return dateA - dateB;
      });

      if (sortedByDate.length > 0) {
        // 첫 기록
        (eventFirstTime as any)[eventKey] = { ...sortedByDate[0] };

        // 최근 기록
        (eventLatestTime as any)[eventKey] = { ...sortedByDate[sortedByDate.length - 1] };
      }
    });

    /**
     * time Result
     */
    const timeGroups: Record<string, TimeModel[]> = {};

    // 1. 메달 집계
    timeTimes.forEach(time => {
      // 종목 키 생성 (style-course-distance)
      const eventKey = `${time.style}-${time.course}-${time.distance}`;

      // 종목별 그룹화
      if (!timeGroups[eventKey]) {
        timeGroups[eventKey] = [];
      }
      timeGroups[eventKey].push(time);
    });

    // 2. 각 종목별 best, first, latest 계산
    Object.entries(timeGroups).forEach(([eventKey, times]) => {
      // 타임스탬프로 정렬하여 최고 기록 찾기
      const sortedByTime = [...times].sort((a, b) => a.timeStamp - b.timeStamp);
      if (sortedByTime.length > 0) {
        // best[eventKey] = {
        //   ...bestTime,
        //   competitionCount: times.filter(
        //     t => t.competitionID && t.competitionID > 0
        //   ).length
        // };
        // 데이터를 처리할 때 TimeModel 인스턴스를 생성하는 방식
        (timeBestTime as any)[eventKey] = {
          ...sortedByTime[0],
          competitionCount: times.filter(t => t.competitionID && t.competitionID > 0).length
        };
      }

      // 날짜로 정렬하여 첫 기록과 최근 기록 찾기
      const sortedByDate = [...times].sort((a, b) => {
        const dateA = new Date(a.datetime).getTime();
        const dateB = new Date(b.datetime).getTime();
        return dateA - dateB;
      });

      if (sortedByDate.length > 0) {
        // 첫 기록
        (timeFirstTime as any)[eventKey] = { ...sortedByDate[0] };

        // 최근 기록
        (timeLatestTime as any)[eventKey] = { ...sortedByDate[sortedByDate.length - 1] };
      }
    });

    return {
      eventBestTime,
      eventFirstTime,
      eventLatestTime,
      medals,
      timeBestTime,
      timeFirstTime,
      timeLatestTime,
    };
  }

  /**
   * 수영 기록에서 통계 데이터를 생성합니다
   * @param times 수영 기록 배열
   * @returns 통계 데이터
   */
  static processStatisticsObject(eventTimes: TimeModel[]): [] {
    // 종목별 그룹화
    const eventGroups: Record<string, TimeModel[]> = {};

    // 1. 메달 집계
    eventTimes.forEach(time => {

      // 종목 키 생성 (style-course-distance)
      const eventKey = `${time.style}-${time.course}-${time.distance}`;

      // 종목별 그룹화
      if (!eventGroups[eventKey]) {
        eventGroups[eventKey] = [];
      }
      eventGroups[eventKey].push(time);
    });

    const statistics = {};
    // 2. 각 종목별 best, first, latest 계산
    Object.entries(eventGroups).forEach(([eventKey, times]) => {
      if (!(statistics as any)[eventKey]) {
        (statistics as any)[eventKey] = {
          bestTime: {},
          firstTime: {},
          latestTime: {},
          medals: { gold: 0, silver: 0, bronze: 0, },
        };
      }

      times.forEach(time => {
        // 메달 집계
        if (time.rank === 1) (statistics as any)[eventKey].medals.gold++;
        else if (time.rank === 2) (statistics as any)[eventKey].medals.silver++;
        else if (time.rank === 3) (statistics as any)[eventKey].medals.bronze++;
      });
      // 타임스탬프로 정렬하여 최고 기록 찾기
      const sortedByTime = [...times].sort((a, b) => a.timeStamp - b.timeStamp);
      if (sortedByTime.length > 0) {
        // 데이터를 처리할 때 TimeModel 인스턴스를 생성하는 방식
        (statistics as any)[eventKey].bestTime = {
          ...sortedByTime[0],
        };
        (statistics as any)[eventKey].count = sortedByTime.length; // times.filter(t => !t.competitionID || t.competitionID == 0).length;
      }

      // 날짜로 정렬하여 첫 기록과 최근 기록 찾기
      const sortedByDate = [...times].sort((a, b) => {
        const dateA = new Date(a.datetime).getTime();
        const dateB = new Date(b.datetime).getTime();
        return dateA - dateB;
      });

      if (sortedByDate.length > 0) {
        // 첫 기록
        (statistics as any)[eventKey].firstTime = { ...sortedByDate[0] };

        // 최근 기록
        (statistics as any)[eventKey].latestTime = { ...sortedByDate[sortedByDate.length - 1] };
      }
    });
    const statisticArr = [] as any;
    Object.entries(statistics).forEach(([eventKey, stat]) => {
      const [style, course, distance] = eventKey.split('-');
      statisticArr.push({
        style,
        course,
        distance,
        ...(stat as any),
      });
    });
    return statisticArr;
  }
}

/**
 * 선수 정보와 기록으로부터 확장된 정보를 생성하는 함수
 */
export function makeAthleteExtraInfoView(compression: any, times: TimeModel[]) {
  setCompression(compression);
  times = decompression(times);
  // 대회 기록과 훈련 기록 분류
  const eventTimes = times
    .filter(t => t.competitionID && t.competitionID > 0)
    .sort((a, b) => a.datetime.localeCompare(b.datetime));

  const timeTimes = times
    .filter(t => !t.competitionID || t.competitionID === 0)
    .sort((a, b) => a.datetime.localeCompare(b.datetime));

  // 확장 정보 구성
  const extraInfo: Record<string, any> = {
    times, // 전체 times
    eventTimeCount: eventTimes.length, // 대회기록 수
    timeTimeCount: timeTimes.length, // 훈련기록 수
    timeTimes, // 훈련기록
    eventTimes, // 대회기록
    leaderboards: [], // 그래프용 데이터
    eventLeaderboard: SwimmingStatsProcessor.groupedLeaderboardModel(eventTimes),
    eventBestTime: SwimmingStatsProcessor.makeLeaderboard(eventTimes),
    timeBestTime: SwimmingStatsProcessor.makeLeaderboard(timeTimes),
    bestTime: SwimmingStatsProcessor.groupedLeaderboardModel(times),
    majorStyles: SwimmingStatsProcessor.majorStylesModel(times),
    teams: SwimmingStatsProcessor.getTeamsByCountModel(times),
    ageGroups: SwimmingStatsProcessor.getAgeGroupByCountModel(times),
    medals: SwimmingStatsProcessor.calculateMedalsModel(times),
    pools: SwimmingStatsProcessor.getPoolsByCountModel(times),
  };

  return extraInfo;
}
