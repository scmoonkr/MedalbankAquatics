// types/leaderboard.ts

import { TimeModel } from '~/models/times';
import type { CompressionInfo } from '~/types/common';

// ============ 기본 정보 인터페이스 ============ //

/**
 * 선수 정렬 필드
 */
export enum LeaderboardSortField {
    TIME = 'timeStamp',
    NAME = 'name',
    TEAM = 'team',
    DATE = 'datetime',
    AGEGROUP = 'ageGroup',
    DISTANCE = 'distance',
    RANK = 'rank'
}

export interface LeaderboardFilter {
    db?: string;    // Breaststroke | Medalbank
    adult?: string;
    masters?: string;
    typeTime?: string;
    ageGroup?: string;
    gender?: string;
    style?: string;
    course?: string;
    distance?: string;
    sido?: string;

    page?: number;
    limit?: number;
    sortField: string
    sortDirection: string;
    [key: string]: string | number| undefined;
}

// Time record interface
export interface TimeRecord {
    isMasters: boolean;
    isAdult: boolean;
    type: string;
    gender: string;
    style: string;
    course: string;
    distance: string;
    timeID: number;
    athleteID: number;
    name: string;
    time: string;
    timeStamp: number;
    rank: number;
    datetime: string;
    sido: string;
    ageGroup: string;
    competitionID: number;
    poolID: number;
    teamID: number;
    rankGroup: number;
    diffs: string;
    competitionName: string;
    pool: string;
    team: string;
}

export interface LeaderboardStruct {
  isMasters?: Boolean;
  isAdult?: Boolean;
  gender: String;
  type: String;

  style: String;
  course: String;
  distance: String;
  times: TimeRecord[];
}
// Main leaderboard interface
export interface LeaderboardData {
    times: TimeRecord[];
    compression: CompressionInfo;
}