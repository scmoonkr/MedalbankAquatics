// types/times.ts
import type { Gender, SwimCourse, SwimStyle, Sido } from '~/types/common';


export interface UItimesFilters {
    // athlete: 'all' | 'specific'
    // pool: 'all' | 'specific'
    gender: 'all' | 'men' | 'women' | 'mixed'
    style: 'all' | 'freestyle'
    | 'backstroke'
    | 'breaststroke'
    | 'butterfly'
    | 'individualMedley'
    | 'freestyleRelay'
    | 'medleyRelay'
    distance: 'all' | '25M' | '50M' | '100M' | '200M' | '400M' | '800M' | '1500M'
    course: 'all' | 'LCM' | 'SCM'
    typeTime: 'all' | 'timeResult' | 'eventResult'
    // sort: 'recent' | 'record'
}
/**
 * 시간 필터 타입
 */
export interface TimeFilter {
    typeTime?: string; // 'timeResult' | 'eventResult'
    // individual?: string; // 'individual' | 'team'
    name?: string;
    time?: string;
    ageGroup?: string;
    gender?: Gender;
    style?: SwimStyle;
    discipline: string;
    course?: SwimCourse;
    distance?: string;
    masters?: string;
    timeID?: number;
    poolID?: number;
    competitionID?: number;

    isMasters?: boolean;
    isAdult?: boolean;
    type?: string;
    sido?: Sido;
    startDate?: string;
    endDate?: string;
    teamID?: number;
    searchQuery?: string;
    sort?: string;
}
/**
 * 시간 정렬 필드
 */
// export type TimeSortField = 'time' | 'name' | 'datetime' | 'ageGroup' | 'distance' | 'rank';
export enum TimeSortField {
    TIMESTAMP = 'timeStamp',
    NAME = 'name',
    TEAM = 'team',
    DATE = 'datetime',
    AGEGROUP = 'ageGroup',
    DISTANCE = 'distance',
    RANK = 'rank'
}

/**
 * 수영 기록 타입
 */
export interface Time {
    athleteID: number;
    timeID: number;
    name: string;
    ageGroup: string;
    gender: Gender;
    discipline: string;
    course: SwimCourse;
    distance: string;
    rank: number;
    timeStamp: number;
    time: string;
    isMasters: boolean;
    isAdult: boolean;
    type: string;
    sido: Sido;
    datetime: string;
    teamID: number;
    team: string;
    pool: string;
    poolID: number;
    stemID: number;
    competitionID: number;
    competitionName: string;
}
