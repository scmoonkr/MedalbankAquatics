// models/UserModel.ts
import type { Gender, UserStatus } from '~/types/common';

/**
 * 사용자 모델
 */
export class UserModel {
    userID: number;
    level: number;
    dob: Date;
    email: string;
    gender: Gender;
    name: string;
    role: string;
    nationalCode: string;
    nickname: string;
    phone: string;
    status: UserStatus;
    featured: string;
    thumbnail: string;
    ageGroupCode: string;
    athleteID: number;
    joined: Date;
    updated: Date;

    constructor(data: Partial<UserModel> | any = {}) {
        this.userID = data.userID || 0;
        this.level = data.level || 0;
        this.dob = data.dob ? new Date(data.dob) : new Date();
        this.email = data.email || '';
        this.gender = data.gender || 'men';
        this.name = data.name || '';
        this.role = data.role || '';
        this.nationalCode = data.nationalCode || 'korean';
        this.nickname = data.nickname || '';
        this.phone = data.phone || '';
        this.status = data.status || 'exists';
        this.featured = data.featured || '';
        this.thumbnail = data.thumbnail || '';
        this.ageGroupCode = data.ageGroupCode || '';
        this.athleteID = data.athleteID || 0;
        this.joined = data.joined ? new Date(data.joined) : new Date();
        this.updated = data.updated ? new Date(data.updated) : new Date();
    }

    /**
     * JSON 객체를 UserModel 인스턴스로 변환
     */
    static fromJson(json: any): UserModel {
        return new UserModel({
            userID: json.userID,
            level: json.level,
            dob: json.dob,
            email: json.email,
            gender: json.gender,
            name: json.name,
            role: json.role,
            nationalCode: json.nationalCode,
            nickname: json.nickname,
            phone: json.phone,
            status: json.status,
            featured: json.featured,
            thumbnail: json.thumbnail,
            ageGroupCode: json.ageGroupCode,
            athleteID: json.athleteID,
            joined: json.joined,
            updated: json.updated
        });
    }

    /**
     * UserModel을 JSON 객체로 변환
     */
    toJson(): object {
        return {
            userID: this.userID,
            level: this.level,
            dob: this.dob,
            email: this.email,
            gender: this.gender,
            name: this.name,
            role: this.role,
            nationalCode: this.nationalCode,
            nickname: this.nickname,
            phone: this.phone,
            status: this.status,
            featured: this.featured,
            thumbnail: this.thumbnail,
            ageGroupCode: this.ageGroupCode,
            athleteID: this.athleteID,
            joined: this.joined,
            updated: this.updated
        };
    }

    /**
     * 사용자 풀네임 반환
     */
    getFullName(): string {
        return this.name;
    }

    /**
     * 사용자 나이 계산
     */
    getAge(): number {
        const today = new Date();
        const birthDate = new Date(this.dob);
        let age = today.getFullYear() - birthDate.getFullYear();
        const month = today.getMonth() - birthDate.getMonth();

        if (month < 0 || (month === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }

        return age;
    }

    /**
     * 사용자 생년월일 포맷팅
     */
    getFormattedDob(): string {
        if (!this.dob) return '';

        try {
            return this.dob.toLocaleDateString('ko-KR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        } catch (error) {
            return '';
        }
    }

    /**
     * 사용자 가입일 포맷팅
     */
    getFormattedJoinDate(): string {
        if (!this.joined) return '';

        try {
            return this.joined.toLocaleDateString('ko-KR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        } catch (error) {
            return '';
        }
    }

    /**
     * 사용자 프로필 이미지 URL 반환
     */
    getProfileImageUrl(): string {
        // 썸네일이 있으면 해당 이미지 반환
        if (this.thumbnail) {
            return this.thumbnail;
        }

        // 없으면 기본 이미지 반환
        return `/images/default-profile-${this.gender}.png`;
    }

    /**
     * 사용자 상태에 따른 표시 텍스트
     */
    getStatusDisplayText(): string {
        const statusMap: Record<UserStatus, string> = {
            'exists': '정상',
            'deleted': '탈퇴',
            'suspended': '정지',
            'pending': '대기'
        };

        return statusMap[this.status] || '알 수 없음';
    }

    /**
     * 사용자 성별에 따른 표시 텍스트
     */
    getGenderDisplayText(): string {
        const genderMap: Record<Gender, string> = {
            'men': '남성',
            'women': '여성',
            'mixed': '혼성'
        };

        return genderMap[this.gender] || '알 수 없음';
    }
}