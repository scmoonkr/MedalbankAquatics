// types/common.ts
export type TimeType = 'time' | 'event';
export type Individual = 'individual' | 'team';
export type Gender = 'men' | 'women' | 'mixed';
export type SwimCourse = 'SCM' | 'LCM';
export type UserStatus = 'exists' | 'deleted' | 'suspended' | 'pending';
export type Sido = '서울' | '경기' | '인천' | '강원' | '충북' | '충남' | '대전' | '경북' | '대구' | '울산' | '부산' | '경남' | '전북' | '전남' | '광주' | '제주' | '세종' | '해외';
export type Distance = '25M' | '50M' | '100M' | '200M' | '400M' | '800M' | '1500M';
export type SwimStyle =
    | 'freestyle'
    | 'backstroke'
    | 'breaststroke'
    | 'butterfly'
    | 'individualMedley'
    | 'freestyleRelay'
    | 'medleyRelay';

export const SwimStyles: SwimStyle[] = [
    'freestyle',
    'backstroke',
    'breaststroke',
    'butterfly',
    'individualMedley',
    'freestyleRelay',
    'medleyRelay'
];
export const Distances: Distance[] = [
    '25M',
    '50M',
    '100M',
    '200M',
    '400M',
    '800M',
    '1500M'
];
export const Sidos: Sido[] = [
    '서울',
    '부산',
    '인천',
    '경기',
    '대구',
    '광주',
    '울산',
    '대전',
    '세종',
    '제주',
    '강원',
    '충남',
    '충북',
    '경남',
    '경북',
    '전남',
    '전북',
    '해외'
];

export interface JsonOptions {
    [key: string]: string;
}

export interface FilterItem {
    field: string;  // String 대신 string (소문자)를 사용합니다
    selected: string;
    options: string[];  // 일반 문자열 배열
}

// 타입 가드 함수
export const isValidStyle = (style: string): style is SwimStyle => {
    return SwimStyles.includes(style as SwimStyle);
};

/**
 * 정렬 방향
 */
export enum SortDirection {
    ASC = 'asc',
    DESC = 'desc'
}// 다른 공통 타입들도 여기에 추가할 수 있습니다


/**
 * 페이지네이션 옵션
 */
export interface ImageParams {
    db: string;
    id: number;
    userID: number;
    fileType: string;
}
/**
 * 페이지네이션 옵션
 */
export interface PaginationOptions {
    currentPage: number;
    rowsPerPage: number;
    totalItems: number;
    totalPages: number;
}

// 서버 응답 타입 정의
export interface ServerResponse<T> {
    message: string;
    data: T;
    [key: string]: any;
}

export interface ServerListResponse<T> {
    message: string;
    count: number;
    data: T[];
    [key: string]: any;
}

//#############################################################
// compression 정보 인터페이스
// 팀 정보 인터페이스
//#############################################################
export interface TeamInfo {
    teamID: number;
    name: string;
}

// 풀 간략 정보 인터페이스
export interface PoolInfo {
    poolID: number;
    name: string;
}

// 대회 압축 정보 인터페이스
export interface CompetitionInfo {
    competitionID: number;
    name: string;
}

// 압축 정보 인터페이스
export interface CompressionInfo {
    teams: TeamInfo[];
    pools: PoolInfo[];
    competitions: CompetitionInfo[];
}