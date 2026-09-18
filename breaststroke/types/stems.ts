// types/stem.ts

/**
 * 선수 정렬 필드
 */
export enum StemSortField {
    STEM = 'stem',
    STEMLID = 'stemID',
}

export interface StemFilter {
    stem?: string;
    stemID?: number;

    page?: number;
    limit?: number;
    sortField: string
    sortDirection: string
}

// ============ 풀 리스트 관련 타입 ============ //

// 수영장 리스트 인터페이스

export interface Stem {
    stemID: number;
    stem: string;
    competitions: string[];
}

// 수영장 목록 타입
export type StemList = Stem[];

// ============ 풀 검색 관련 타입 ============ //

// 수영장 이름 검색 결과 인터페이스
export interface StemNameSearchResult {
    stemID: number;
    stem: string;
    competitions: string[];
}

// 수영장 이름 검색 결과 목록 타입
export type StemNameSearchResults = StemNameSearchResult[];


// ============ 풀 상세 보기 관련 타입 ============ //
