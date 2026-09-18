// types/user.ts
import type { Gender, UserStatus } from '~/types/common';

/**
 * 기본 사용자 정보 인터페이스
 */
export interface UserBase {
    userID: number;
    name: string;
    email: string;
    nickname?: string;
    status: UserStatus;
}

export enum UserSortField {
    NAME = 'name',
    AGE = 'dob',
    TIMES = 'userID',
    BEST_TIME = 'timeStamp',
}
/**
 * 사용자 상세 정보 인터페이스
 */
export interface UserDetail extends UserBase {
    dob: Date | string;
    gender: Gender;
    nationalCode: string;
    phone: string;
    featured: string;
    thumbnail: string;
    ageGroupCode: string;
    athleteID: number;
    joined: Date | string;
    updated: Date | string;
}

/**
 * 사용자 생성을 위한 인터페이스
 */
export interface UserCreate {
    name: string;
    email: string;
    password: string;
    nickname?: string;
    dob: Date | string;
    gender: Gender;
    nationalCode?: string;
    phone?: string;
    ageGroupCode?: string;
}

/**
 * 사용자 업데이트를 위한 인터페이스
 */
export interface UserUpdate {
    name?: string;
    email?: string;
    nickname?: string;
    dob?: Date | string;
    gender?: Gender;
    nationalCode?: string;
    phone?: string;
    thumbnail?: string;
    featured?: string;
    ageGroupCode?: string;
    status?: UserStatus;
}

/**
 * 로그인 요청 인터페이스
 */
export interface LoginRequest {
    email: string;
    password: string;
    rememberMe?: boolean;
}

/**
 * 회원가입 요청 인터페이스
 */
export interface RegisterRequest extends UserCreate {
    passwordConfirm: string;
    agreeTerms: boolean;
}

/**
 * 인증 응답 인터페이스
 */
export interface AuthResponse {
    data: UserDetail;
    token: string;
    refreshToken: string;
    expiresIn: number;
}

/**
 * 비밀번호 변경 요청 인터페이스
 */
export interface PasswordChangeRequest {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
}

/**
 * 비밀번호 재설정 요청 인터페이스
 */
export interface PasswordResetRequest {
    email: string;
    resetToken?: string;
    newPassword?: string;
    confirmPassword?: string;
}

/**
 * 사용자 검색 필터 인터페이스
 */
export interface UserFilter {
    term?: string;
    gender?: Gender;
    status?: UserStatus;
    ageGroupCode?: string;
    nationalCode?: string;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortDir?: 'asc' | 'desc';
}

/**
 * 성별 맵핑을 위한 타입
 */
export const GenderDisplayMap: Record<Gender, string> = {
    'men': '남성',
    'women': '여성',
    'mixed': '혼성'
};

/**
 * 사용자 상태 맵핑을 위한 타입
 */
export const UserStatusDisplayMap: Record<UserStatus, string> = {
    'exists': '정상',
    'deleted': '탈퇴',
    'suspended': '정지',
    'pending': '대기'
};

/**
 * 연령 그룹 옵션 타입
 */
export interface AgeGroupOption {
    code: string;
    name: string;
    ageRange: string;
}

/**
 * 연령 그룹 옵션 목록
 */
export const AgeGroupOptions: AgeGroupOption[] = [
    { code: '1그룹(19-24)', name: '1그룹', ageRange: '19-24세' },
    { code: '2그룹(25-29)', name: '2그룹', ageRange: '25-29세' },
    { code: '3그룹(30-34)', name: '3그룹', ageRange: '30-34세' },
    { code: '4그룹(35-39)', name: '4그룹', ageRange: '35-39세' },
    { code: '5그룹(40-44)', name: '5그룹', ageRange: '40-44세' },
    { code: '6그룹(45-49)', name: '6그룹', ageRange: '45-49세' },
    { code: '7그룹(50-54)', name: '7그룹', ageRange: '50-54세' },
    { code: '8그룹(55-59)', name: '8그룹', ageRange: '55-59세' },
    { code: '9그룹(60-64)', name: '9그룹', ageRange: '60-64세' },
    { code: '10그룹(65-69)', name: '10그룹', ageRange: '65-69세' },
    { code: '11그룹(70-74)', name: '11그룹', ageRange: '70-74세' },
    { code: '12그룹(75-79)', name: '12그룹', ageRange: '75-79세' },
    { code: '13그룹(80-84)', name: '13그룹', ageRange: '80-84세' },
    { code: '14그룹(85-89)', name: '14그룹', ageRange: '85-89세' },
    { code: '15그룹(90-94)', name: '15그룹', ageRange: '90-94세' },
    { code: '16그룹(95-99)', name: '16그룹', ageRange: '95-99세' }
];