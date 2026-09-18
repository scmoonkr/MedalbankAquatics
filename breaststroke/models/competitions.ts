// models/CompetitionModel.ts
import { TimeModel } from '~/models/times';
import type { SwimCourse, Sido } from '~/types/common';
import { setCompression, decompression, getTeam, getPool, getCompetition } from '~/utils/compression';

/**
 * 팀 랭킹 정보
 */
export interface TeamRank {
    teamID: number;
    name: string;
    count: number;
}

/**
 * 대회 정보 모델
 */
export class CompetitionModel {
    competitionID: number;
    fullname: string;
    dateStart: string;
    poolID: number;
    pool: string;
    stemID: number;
    stem: string;

    dateEnd?: string;
    sido?: Sido;
    course?: SwimCourse;
    year?: number;
    featured?: string;
    competitionType?: string;
    teamRank?: TeamRank[];
    isMasters?: boolean;
    athleteCount?: number;
    timeCount?: number;
    extraInfo?: CompetitionExtraInfo;
    compression?: CompetitionCompression;
    constructor(
        competitionID: number = 0,
        fullname: string = '',
        dateStart: string = '',
        poolID: number = 0,
        pool: string = '',
        stemID: number = 0,
        stem: string = '',
    ) {
        // 필수 속성들
        this.competitionID = competitionID;
        this.fullname = fullname;
        this.dateStart = dateStart.slice(0, 10);
        this.poolID = poolID;
        this.pool = pool;
        this.stemID = stemID;
        this.stem = stem;
        
        // Optional 속성들은 undefined로 초기화
        this.sido = undefined;
        this.dateEnd = undefined;
        this.course = undefined;
        this.year = undefined;
        this.competitionType = undefined;
        this.featured = undefined;
        this.teamRank = undefined;
        this.isMasters = undefined;
        this.athleteCount = undefined;
        this.timeCount = undefined;
        this.extraInfo = undefined;
        this.compression = undefined;
    }

    /**
     * JSON 객체를 CompetitionModel 인스턴스로 변환
     */
    static fromJson(json: any): CompetitionModel {
        const extraInfo: CompetitionExtraInfo = {
            competitions: json.extraInfo?.competitions || [],
            styleDistances: json.extraInfo?.styleDistances || [],
            teams: json.extraInfo?.teams || [],
            ageGroups: json.extraInfo?.ageGroups || [],
            bestTimes: (json.extraInfo?.bestTimes || []).map((time: any) => TimeModel.fromJson(time)),
            bestStems: (json.extraInfo?.bestStems || []).map((time: any) => TimeModel.fromJson(time)),
            competitionTimes: (json.extraInfo?.competitionTimes || []).map((time: any) => TimeModel.fromJson(time))
        };

        if (json.compression) {
            setCompression(json.compression);
            extraInfo.bestTimes = decompression(extraInfo.bestTimes);
            extraInfo.bestStems = decompression(extraInfo.bestStems);
            extraInfo.competitionTimes = decompression(extraInfo.competitionTimes);
        }
        const competition = new CompetitionModel(
			json.competitionID ?? 0,
			json.fullname ?? '',
			json.dateStart ?? '',
			json.poolID ?? 0,
			json.pool ?? '',
			json.stemID ?? 0,
			json.stem ?? '',
		);

		// competition.competitionID = json.competitionID;
		competition.sido = json.sido;
		competition.dateEnd = json.dateEnd;
		competition.course = json.course;
		// competition.poolID = json.poolID;
		competition.year = json.year;
		// competition.stemID = json.stemID;
		competition.competitionType = json.competitionType;
		competition.featured = json.featured;
		competition.teamRank = json.teamRank;
		competition.isMasters = json.isMasters;
		competition.athleteCount = json.athleteCount;
		competition.timeCount = json.timeCount;
		competition.compression = json.compression;
		competition.extraInfo = extraInfo;

        return competition;
    }
    static initialize(): CompetitionModel {
        return new CompetitionModel(
            0,
            '', 
            '', 
            0,
            '', 
            0,
            '',
        );
    }
    /**
     * CompetitionModel을 JSON 객체로 변환
     */
    toJson(): object {
        return {
            competitionID: this.competitionID,
            fullname: this.fullname,
            sido: this.sido,
            dateStart: this.dateStart,
            dateEnd: this.dateEnd,
            pool: this.pool,
            course: this.course,
            poolID: this.poolID,
            year: this.year,
            stemID: this.stemID,
            competitionType: this.competitionType,
            featured: this.featured,
            teamRank: this.teamRank,
            stem: this.stem,
            isMasters: this.isMasters,
            athleteCount: this.athleteCount,
            timeCount: this.timeCount,
            extraInfo: {
                competitions: this.extraInfo!.competitions,
                styleDistances: this.extraInfo!.styleDistances,
                teams: this.extraInfo!.teams,
                ageGroups: this.extraInfo!.ageGroups,
                bestTimes: this.extraInfo!.bestTimes.map(time => time.toJson()),
                bestStems: this.extraInfo!.bestStems.map(time => time.toJson()),
                competitionTimes: this.extraInfo!.competitionTimes.map(time => time.toJson())
            },
            compression: this.compression
        };
    }
}

/**
 * 과거 대회 정보
 */
export interface PreviousCompetition {
    competitionID: number;
    fullname: string;
    dateStart: string;
}

/**
 * 영법 및 거리 가용 정보
 */
export interface StyleDistance {
    gender: string;
    style: string;
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

export interface CompetitionExtraInfo {
    competitions: PreviousCompetition[];
    styleDistances: StyleDistance[];
    teams: TeamDetail[];
    ageGroups: AgeGroupInfo[];
    bestTimes: TimeModel[];
    bestStems: TimeModel[];
    competitionTimes: TimeModel[];
}

/**
 * 압축 정보 (ID-이름 매핑)
 */
export interface CompressionItem {
    [key: string]: number | string;
}

/**
 * 대회 압축 정보
 */
export interface CompetitionCompression {
    teams: CompressionItem[];
    pools: CompressionItem[];
    competitions: CompressionItem[];
}

/**
 * 대회 목록용 간소화 모델
 */
export class CompetitionListModel {
    competitionID: number;
    fullname: string;
    dateStart: string;
    sido: Sido;
    pool: string;
    course: SwimCourse;
    athleteCount: number;
    timeCount: number;

    constructor(data: Partial<CompetitionListModel> = {}) {
        this.competitionID = data.competitionID || 0;
        this.fullname = data.fullname || '';
        this.dateStart = data.dateStart || '';
        this.sido = data.sido || '서울';
        this.pool = data.pool || '';
        this.course = data.course || 'LCM';
        this.athleteCount = data.athleteCount || 0;
        this.timeCount = data.timeCount || 0;
    }

    /**
     * CompetitionModel을 CompetitionListModel로 변환
     */
    static fromCompetitionModel(competition: CompetitionModel): CompetitionListModel {
        return new CompetitionListModel({
            competitionID: competition.competitionID,
            fullname: competition.fullname,
            dateStart: competition.dateStart,
            sido: competition.sido,
            pool: competition.pool,
            course: competition.course,
            athleteCount: competition.athleteCount,
            timeCount: competition.timeCount
        });
    }

    /**
     * 대회 날짜 포맷팅
     */
    getFormattedDate(): string {
        if (!this.dateStart) return '';

        try {
            const date = new Date(this.dateStart);
            return date.toLocaleDateString('ko-KR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        } catch (error) {
            return this.dateStart;
        }
    }

    /**
     * 코스 타입 한글명
     */
    getCourseTypeName(): string {
        return this.course === 'LCM' ? '장수영장(50m)' : '단수영장(25m)';
    }
}

