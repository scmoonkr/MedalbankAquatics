// types/AthleteTypes.ts
import type { Gender } from './common';
import { TimeModel } from '~/models/times';


/**
 * 선수 기본 타입
 */
export interface Athlete {
    athleteID: number;
    userID: number;
    ageGroup: string;
    dob: Date;
    gender: Gender;
    name: string;
    imageID?: string;
    featured?: string;
    thumbnail?: string;
    images?: Record<string, string>;
    timesCount: number;
    extraInfo?: AthleteExtraInfo;
    joined: Date;
    updated: Date;
}

/**
 * 선수 목록용 간소화된 타입
 */
export interface AthleteList {
    athleteID: number;
    name: string;
    gender: Gender;
    ageGroup: string;
    thumbnail?: string;
    timesCount: number;
    bestTime?: string;
    bestTimeDate?: string;
    bestTimeStyle?: string;
}

/**
 * 대회 기록 정보 타입
 */
export interface EventInfo {
    timeID: number;
    time: string;
    datetime: string;
}

/**
 * 최고 기록 정보 타입
 */
export interface BestEventInfo {
    style: string;
    count: number;
    time: string;
    datetime: string;
}

/**
 * 선수 엑스트라 정보 타입
 */
export interface AthleteExtraInfo {
    ageGroups?: [];
    bestTime?: [];
    eventBestTime?: [];
    eventLeaderboard?: [];
    eventTimeCount?: 0;
    eventTimes?: [];
    leaderboards?: [];
    majorStyles?: [];
    medals?: {};
    pools?: [];
    teams?: [];
    timeBestTime?: [];
    timeTimes?: [];
    times?: [];
    timesCount?: 0;
}

export interface AthleteListRequest {
    name?: string;
    gender?: string;
    ageGroup?: string;
    dob?: string;
    page?: number;
    limit?: number;
    sortField?: string;
    sortDirection?: string;
}
/**
 * 선수 필터 타입
 */
export interface AthleteFilter {
    name?: string;
    typeTime?: string;
    gender?: Gender;
    ageGroup?: string;
    minAge?: number;
    maxAge?: number;
    style?: string;
    searchQuery?: string;

    page?: number;
    limit?: number;
    sortField: string;
    sortDirection: string;
}

/**
 * 선수 정렬 필드
 */
export enum AthleteSortField {
    NAME = 'name',
    ATHLETEID = 'athleteID',
    AGE = 'age',
    TIMES = 'timesCount',
    BEST_TIME = 'timeStamp',
    JOINED = 'joined'
}

/**
 * 선수 통계 정보
 */
export interface AthleteStats {
    totalAthletes: number;
    maleCount: number;
    femaleCount: number;
    mixedCount: number;
    byAgeGroup: Record<string, number>;
    mostActiveAthletes: AthleteList[];
    mostImprovedAthletes: AthleteList[];
}