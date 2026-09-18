// types/competitions.ts

import { TimeModel } from '~/models/times';
import { CompetitionModel } from '~/models/competitions';
import type { Gender, SwimStyle, CompressionInfo } from '~/types/common';

// ============ 기본 정보 인터페이스 ============ //

/**
 * 선수 정렬 필드
 */
export enum CompetitionSortField {
    FULLNAME = 'fullname',
    NAME = 'name',
    DATESTART = 'dateStart',
    POOLID = 'competitionID',
    COURSE = 'course',
    SIDO = 'sido',
}

export interface CompetitionFilter {
    fullname?: string;
    name?: string;
    masters?: string;
    course?: string;
    sido?: string;
    year?: string;
    competitionID?: number;

    currentPage?: number;
    rowsPerPage?: number;
    sortField: string
    sortDirection: string
}

// 대회 기본 정보 인터페이스
// export interface CompetitionInfo {
//     addressDRM?: string;
//     phone?: string;
//     website?: string;
//     lengthUnit?: string;
//     depthUnit?: string;
// }

// 이미지 인터페이스
export interface CompetitionImage {
    [key: string]: string;
}

// ============ 풀 리스트 관련 타입 ============ //

// 대회 리스트 인터페이스
export interface Competition {
    competitionID: number;
    fullname: string;
    stemID: number;
    stem: string;
    year: number;
    poolID: number;
    pool: string;
    sido: string;
    course: string;
    measured: boolean;
    masters: boolean;
    dateStart: string;
}

// 대회 목록 타입
export type CompetitionList = Competition[];

// ============ 풀 검색 관련 타입 ============ //

// 대회 이름 검색 결과 인터페이스
export interface CompetitionNameSearchResult {
    competitionID: number;
    fullname: string;
    sido: string;
    course: string;
    dateStart: string;
    pool: string;
    poolID: number;
    stemID: number;
    stem: string;
}

// 대회 이름 검색 결과 목록 타입
export type CompetitionNameSearchResults = CompetitionNameSearchResult[];


// ============ 풀 상세 보기 관련 타입 ============ //

// 대회 정보 인터페이스
export interface CompetitionCompetition {
    competitionID: number;
    fullname: string;
    dateStart: string;
}

// 최근 방문 선수 인터페이스
export interface LatestAthlete {
    athleteID: number;
    name: string;
    style: string;
    datetime: string;
}

/**
 * 영법 및 거리 가용 정보
 */
export interface StyleDistance {
    gender: Gender;
    style: SwimStyle;
    '25M': boolean;
    '50M': boolean;
    '100M': boolean;
    '200M': boolean;
    '400M': boolean;
    '800M': boolean;
    '1500M': boolean;
}

/**
 * 팀 세부 정보
 */
export interface TeamDetail {
    teamID: number;
    name: string;
    timeCount: number;
    athleteCount: number;
    men: number;
    women: number;
    mixed: number;
    individual: number;
    team: number;
    FR: number;
    BK: number;
    BR: number;
    BF: number;
    FL: number;
    IM: number;
    gold: number;
    silver: number;
    bronze: number;
    points: number;
    rank: number;
}

/**
 * 연령대 그룹 정보
 */
export interface AgeGroupInfo {
    ageGroup: string;
    ageGroupName: string;
    count: number;
}


// 추가 정보 인터페이스
export interface ExtraInfo {
    competitions: CompetitionCompetition[];
    styleDistances: StyleDistance[];
    teams: TeamDetail[];
    ageGroups: AgeGroupInfo;
    bestTimes: TimeModel[];
    bestStems: TimeModel[];
    competitionTimes: TimeModel[];
}

// 대회 상세 정보 인터페이스
export interface CompetitionDetail {
    competitionID: number;
    name: string;
    fullname: string;
    sido: string;
    addressDRM: string;
    competitionname: string;
    nickname: string;
    address: string;
    addressDetails: string;
    phone: string;
    email: string;
    website: string;
    lengths: number;
    lengthUnit: string;
    lanes: number;
    depthShallowEnd: number;
    depthDeepEnd: number;
    depthUnit: string;
    coordinateX: number;
    coordinateY: number;
    searchKeywords: string;
    notes: string;
    info: Record<string, any>;
    competitionCount: number;
    uploadTimes: number;
    course: string;
    featured: string;
    thumbnail: string;
    images: CompetitionImage[];

    extraInfo: ExtraInfo;
    compression: CompressionInfo;
}
