// types/pool.ts

import { TimeModel } from '~/models/times';
import { CompetitionModel } from '~/models/competitions';
import type { CompressionInfo } from '~/types/common';

// ============ 기본 정보 인터페이스 ============ //

/**
 * 선수 정렬 필드
 */
export enum PoolSortField {
    NAME = 'name',
    POOLID = 'poolID',
    COURSE = 'course',
    SIDO = 'sido',
}

export interface PoolFilter {
    name?: string;
    course?: string;
    sido?: string;
    poolID?: number;

    page?: number;
    limit?: number;
    sortField: string
    sortDirection: string
}

// 수영장 기본 정보 인터페이스
export interface PoolInfo {
    addressDRM?: string;
    phone?: string;
    website?: string;
    lengthUnit?: string;
    depthUnit?: string;
}

// 이미지 인터페이스
export interface PoolImage {
    [key: string]: string;
}

// ============ 풀 리스트 관련 타입 ============ //

// 수영장 리스트 인터페이스
export interface Pool {
    poolID: number;
    name: string;
    fullname: string;
    sido: string;
    course: string;
    info: PoolInfo;
    bestTimes: TimeModel[];
    competitions: CompetitionModel[];
    competitionCount: number;
    uploadTimes: number;
}

// 수영장 목록 타입
export type PoolList = Pool[];

// ============ 풀 검색 관련 타입 ============ //

// 수영장 이름 검색 결과 인터페이스
export interface PoolNameSearchResult {
    poolID: number;
    name: string;
    sido: string;
    course: string;
}

// 수영장 이름 검색 결과 목록 타입
export type PoolNameSearchResults = PoolNameSearchResult[];


// ============ 풀 상세 보기 관련 타입 ============ //

// 대회 정보 인터페이스
export interface PoolCompetition {
    competitionID: number;
    fullname: string;
    dateStart: string;
    athleteCount: number;
}

// 최근 방문 선수 인터페이스
export interface LatestAthlete {
    athleteID: number;
    name: string;
    style: string;
    datetime: string;
}

// 추가 정보 인터페이스
export interface ExtraInfo {
    competitions: PoolCompetition[];
    latest: LatestAthlete[];
    timeTimes: TimeModel[];
    bestEvent: TimeModel[];
    bestTime: TimeModel[];
}

// 수영장 상세 정보 인터페이스
export interface PoolDetail {
    poolID: number;
    name: string;
    fullname: string;
    sido: string;
    addressDRM: string;
    poolname: string;
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
    images: PoolImage[];
    extraInfo: ExtraInfo;
    compression: CompressionInfo;
}

// 풀 상세 보기 API 응답 인터페이스
export interface PoolViewResponse {
    message: string;
    data: PoolDetail;
}
