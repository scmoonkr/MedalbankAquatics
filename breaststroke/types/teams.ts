// types/teams.ts

import { TimeModel } from '~/models/times';
// import { TeamModel } from '~/models/teams';
import type { Gender, SwimStyle, CompressionInfo } from '~/types/common';

// ============ 기본 정보 인터페이스 ============ //

/**
 * 선수 정렬 필드
 */
export enum TeamSortField {
    NAME = 'name',
    POOLID = 'teamID',
    COURSE = 'course',
    SIDO = 'sido',
    POINTS = 'points',
    POINTSRATIO = 'ratio',
}

export interface TeamFilter {
    name?: string;
    course?: string;
    sido?: string;
    mongo?: string;
    teamID?: number;

    page?: number;
    limit?: number;
    sortField: string
    sortDirection: string
}

// 대회 기본 정보 인터페이스
export interface TeamInfo {
    addressDRM?: string;
    phone?: string;
    website?: string;
    lengthUnit?: string;
    depthUnit?: string;
}

// 이미지 인터페이스
export interface TeamImage {
    [key: string]: string;
}

// ============ 풀 검색 관련 타입 ============ //

// 대회 이름 검색 결과 인터페이스
export interface TeamNameSearchResult {
    teamID: number;
    name: string;
    competitionCount: number;
    members: number;
    points: number;
    medals: number;
}

// 대회 이름 검색 결과 목록 타입
export type TeamNameSearchResults = TeamNameSearchResult[];


// ============ 풀 상세 보기 관련 타입 ============ //
export interface MedalCount {
    gold: number;
    silver: number;
    bronze: number;
}

export interface CompetitionSummary {
    competitionID: number;
    medals: MedalCount;
    timeCount: number;
    athleteCount: number;
    fullname: string;
    dateStart: string;
}

export interface StyleBreakdown {
    [key: string]: number | undefined;
    freestyle?: number;
    backstroke?: number;
    breaststroke?: number;
    butterfly?: number;
    individualMedley?: number;
    freestyleRelay?: number;
    medleyRelay?: number;
}

export interface MedalStyleBreakdown {
    style: string;
    gender: string;
    timeCount: number;
    gold: number;
    silver: number;
    bronze: number;
}

export interface StyleCount {
    style: string;
    count: number;
}

export interface SwimmerEventCount {
    athleteID: number;
    name: string;
    count: number;
}

export interface TimeSummary {
    timeID: number;
    time: string;
    style: string;
    distance: string;
    datetime: string;
    competitionID: number;
    rank: number;
    teamID: number;
}

export interface TeamTimeRecord {
    gender: string;
    style: string;
    course: string;
    distance: string;
    timeCount: number;
    athleteCount: number;
    timeID: number;
    name: string;
    time: string;
    rank: number;
    datetime: string;
    teamID: number;
    competitionID: number;
}

export interface TeamExtraInfo {
    teamID: number;
    timeCount: number;
    athleteCount: number;
    competitionCount: number;
    competitions: CompetitionSummary[];
    bestTimes: TimeModel[];
    teamTimes: TimeModel[];
    swimmersEvent: SwimmerEventCount[];
    medals: MedalStyleBreakdown[];
    major: StyleCount[];
    latest: TimeSummary;
    first: TimeSummary;
    points: number;
}

export interface TeamDetail {
    teamID: number;
    name: string;
    teamCode: string;
    nameKor: string;
    nameEng: string;
    names: string[];
    indexes: string[];
    logo: string;
    firstDate: string;
    latestDate: string;
    competitionCount: number;
    medals: number;
    members: number;
    points: number;
    rank: any[]; // This could be further defined based on actual rank structure
    style: StyleBreakdown;
    timeCount: number;
    isAdult: boolean;
    isMasters: boolean;
    sido: string;
    teamcode: string;
    updated: string;
    adult: string;
    masters: string;
    featured: string;
    extraInfo: TeamExtraInfo;
}


// ============ 팀팀 리스트 관련 타입 ============ //

/**
 * Medal counts by swimming style
 */
export interface Medals {
    /** Freestyle medals count */
    freestyle: number;
    /** Backstroke medals count */
    backstroke: number;
    /** Butterfly medals count */
    butterfly: number;
    /** Breaststroke medals count */
    breaststroke: number;
    /** Individual medley medals count */
    individualMedley: number;
    /** Team event medals count */
    team: number;
}

/**
 * Team data structure
 */
export interface Team {
    /** Unique team identifier */
    teamID: number;
    /** Team name */
    team: string;
    /** Total time count in seconds or minutes */
    timeCount: number;
    /** Total number of athletes in the team */
    athleteCount: number;
    /** Number of athletes participating in the current season */
    athleteCountSeason: number;
    /** Total points earned */
    points: number;
    /** Success or performance ratio (percentage) */
    ratio: number;
    /** Medal counts by swimming style */
    medals: Medals;
}

/**
 * Team list structure
 */
export type TeamList = Team[];