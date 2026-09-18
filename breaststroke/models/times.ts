// models/TimeModel.ts
import type { Gender, SwimCourse, SwimStyle, Sido } from '~/types/common';

/**
* 수영 기록(타임) 모델 클래스
*/
export class TimeModel {
    timeID: number;
    name: string;
    gender: Gender;
    discipline: string;
    course: SwimCourse;
    distance: string;
    time: string; // 포맷된 시간 (예: "37.37")
    datetime: string; // ISO 문자열로 저장 가능
    type: string;

    status?: string;
    source?: string;
    team?: string;
    pool?: string;
    athleteID?: number;
    nameHide?: string;
    ageGroup?: string;
    rank?: number;
    timeStamp?: number; // 초 단위 시간
    isMasters?: boolean;
    isAdult?: boolean;
    sido?: Sido;
    timeORG?: string;
    round?: string;
    teamID?: number;
    poolID?: number;
    stemID?: number;
    stem?: string;
    competitionID?: number;
    competitionName?: string;
    thumbnail?: string;
    featured?: string;
    extraInfo?: {};

	constructor(
        timeID: number = 0,
        name: string = '',
        gender: string = '',
        style: string = '',
        discipline: string = '',
        course: string = '',
        distance: string = '',
        time: string = '',
        datetime: string = '',
        type: string = '',
    ) {
        // 필수 속성들
        this.timeID = timeID;
        this.name = name;
        this.gender = gender as Gender;
        this.discipline = discipline;
        this.course = course as SwimCourse;
        this.distance = distance;
        this.time = time;
        this.datetime = datetime;
        this.type = type;

        // Optional 속성들은 undefined로 초기화
        this.status = undefined;
        this.source = undefined;
        this.team = undefined;
        this.team = undefined;
        this.athleteID = undefined;
        this.nameHide = undefined;
        this.ageGroup = undefined;
        this.rank = undefined;
        this.timeStamp = undefined;
        this.isMasters = undefined;
        this.isAdult = undefined;
        this.sido = undefined;
        this.timeORG = undefined;
        this.round = undefined;
        this.teamID = undefined;
        this.pool = undefined;
        this.poolID = undefined;
        this.stemID = undefined;
        this.stem = undefined;
        this.competitionID = undefined;
        this.competitionName = undefined;
        this.thumbnail = undefined;
        this.featured = undefined;
        this.extraInfo = undefined;
    }

    /**
     * JSON 객체를 TimeModel 인스턴스로 변환
     */
    static fromJson(json: any): TimeModel {
        // style 필드가 있을 때만 style로부터 discipline을 재계산한다.
        // 서버가 discipline(예: 'FL')을 직접 보낸 경우(업로드 파일 read 등)는 덮어쓰지 않는다.
        if (json.style) {
            json.discipline = getDisciplineByStyleEng(json.style);
        }
        // console.log("timeJSON.", json);
        const time = new TimeModel(
            // json.timeID ?? 0,
            // json.name ?? '',
            // json.gender ?? '',
            // json.discipline ?? '',
            // json.course ?? '',
            // json.distance ?? '',
            // json.time ?? '',
            // json.datetime ?? '',
            // json.type ?? '',
        );
        time.timeID = json.timeID ?? 0;
        time.name = json.name ?? '';
        time.gender = json.gender ?? '';
        time.discipline = json.discipline ?? '';
        time.course = json.course ?? '';
        time.distance = json.distance ?? '';
        time.time = json.time ?? '';
        time.datetime = json.datetime ?? '';
        time.type = json.type ?? '';

        time.time = customTimes(time.time);

        time.source = json.source;
        time.team = json.team;
        time.athleteID = json.athleteID;
        time.nameHide = json.nameHide;
        time.ageGroup = json.ageGroup;
        time.rank = json.rank;
        time.timeStamp = json.timeStamp;
        time.isMasters = json.isMasters;
        time.isAdult = json.isAdult;
        time.sido = json.sido;
        time.status = json.status;
        time.timeORG = json.timeORG;
        time.round = json.round;
        time.teamID = json.teamID;
        time.pool = json.pool;
        time.poolID = json.poolID;
        time.stemID = json.stemID;
        time.stem = json.stem;
        time.timeID = json.timeID;
        time.competitionID = json.competitionID;
        time.competitionName = json.competitionName;
        time.thumbnail = json.thumbnail;
        time.featured = json.featured;
        time.extraInfo = json.extraInfo;
        // console.log("json----------------->", time);

        return time;
    }

    static initialize(): TimeModel {
        return new TimeModel(
            0,
            '', 
            '', 
            '',
            '', 
            '', 
            '',
            '', 
            '', 
        );
    }

    /**
     * TimeModel을 JSON 객체로 변환
     */
    toJson(): object {
        return {
            timeID: this.timeID,
            athleteID: this.athleteID,
            name: this.name,
            nameHide: this.nameHide,
            ageGroup: this.ageGroup,
            gender: this.gender,
            discipline: this.discipline,
            course: this.course,
            distance: this.distance,
            rank: this.rank,
            timeStamp: this.timeStamp,
            time: this.time,
            isMasters: this.isMasters,
            isAdult: this.isAdult,
            source: this.source,
            type: this.type,
            sido: this.sido,
            round: this.round,
            datetime: this.datetime,
            teamID: this.teamID,
            team: this.team,
            pool: this.pool,
            status: this.status,
            poolID: this.poolID,
            stemID: this.stemID,
            stem: this.stem,
            competitionID: this.competitionID,
            competitionName: this.competitionName,
            thumbnail: this.thumbnail,
            featured: this.featured,
            extraInfo: this.extraInfo,
        };
    }
}
