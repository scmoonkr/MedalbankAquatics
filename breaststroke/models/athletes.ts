// models/AthleteModel.ts
import type { Gender } from '~/types/common';
import { TimeModel } from '~/models/times';
// import { UserModel } from '~/models/users';
import { SwimmingStatsProcessor } from '~/models/athleteExtraInfo';
import type { SwimmingStats } from '~/models/athleteExtraInfo';
import { setCompression, decompression, getTeam, getPool, getCompetition } from '~/utils/compression';

/**
 * 선수 엑스트라 정보 모델: 첫 대회, 최근 대회, 주요 종목에 대한 정보
 */
export interface EventInfo {
  timeID: number;
  time: string;
  datetime: string;
}

export interface BestEventInfo {
  timeID: number;
  style: string;
  count: number;
  time: string;
  datetime: string;
}

export interface AthleteExtraInfo {
  firstEvent?: EventInfo;
  latestEvent?: EventInfo;
  bestEvent?: BestEventInfo[];
}

/**
 * 선수 이미지 정보
 */
export interface AthleteImages {
  [key: string]: string;
}

/**
 * 단일 선수 모델
 */
export class AthleteModel {
  athleteID: number;
  userID: number;
  ageGroup: string;
  dob: string;
  gender: Gender;
  name: string;
  phone?: string;
  imageID?: string;
  featured?: string;
  featuredBB?: string;
  squares?: string;
  stories?: string;
  posts?: string;
  thumbnail?: string;
  images?: {};
  timesCount: number;
  times?: TimeModel[];
  eventTimes?: TimeModel[];
  timeTimes?: TimeModel[];
  leaderboards?: Object[];
  majorStyle?: Object[];
  extraInfo?: AthleteExtraInfo;
  // statistics?: SwimmingStats;
  eventStatistics?: [];
  timeStatistics?: [];
  joined: string;
  updated: Date;
  user: {};
  constructor(data: Partial<AthleteModel> = {}) {
    this.athleteID = data.athleteID || 0;
    this.userID = data.userID || 0;
    this.ageGroup = data.ageGroup || '';
    this.dob = data.dob || '';
    this.gender = data.gender || 'men';
    this.name = data.name || '';
    this.phone = data.phone;
    this.imageID = data.imageID;
    this.featured = data.featured;
    this.featuredBB = data.featuredBB;
    this.squares = data.squares;
    this.stories = data.stories;
    this.posts = data.posts;
    this.thumbnail = data.thumbnail;
    this.images = data.images || {};
    this.timesCount = data.timesCount || 0;
    this.times = data.times || [];
    this.eventTimes = this.eventTimes || [];
    this.timeTimes = this.timeTimes || [];
    this.leaderboards = data.leaderboards || [];
    this.majorStyle = data.majorStyle || [];
    this.extraInfo = data.extraInfo || {};
    // this.statistics = data.statistics || {};
    this.eventStatistics = data.eventStatistics || [];
    this.timeStatistics = data.timeStatistics || [];
    this.joined = data.joined || '';
    this.updated = data.updated ? new Date(data.updated) : new Date();
    this.user = data.user || {};
  }

  /**
   * JSON 객체를 AthleteModel 인스턴스로 변환
   */
  static fromJson(json: any): AthleteModel {
    const result = new AthleteModel({
      athleteID: json.athleteID,
      userID: json.userID,
      ageGroup: json.ageGroup,
      dob: json.dob,
      gender: json.gender,
      name: json.name,
      phone: json.phone,
      imageID: json.imageID,
      featured: json.featured || '',
      featuredBB: json.featuredBB || '',
      // squares: json.squares || '',
      // stories: json.stories || '',
      // posts: json.posts || '',
      thumbnail: json.thumbnail || '',
      images: json.images,
      timesCount: json.timesCount,
      times: [],
      eventTimes: [],
      timeTimes: [],
      leaderboards: [],
      majorStyle: [],
      extraInfo: json.extraInfo ?? {}, // makeAthleteExtraInfoView(json.compression, times),
      // statistics: {},
      eventStatistics: [],
      timeStatistics: [],
      joined: (json.joined || '').slice(0, 10),
      updated: json.updated,
      user: json.user
    });
    result.squares = json.squares || json.featuredBB || json.featured || '';
    result.stories = json.stories || json.featuredBB || json.featured || '';
    result.posts = json.posts || json.featuredBB || json.featured || '';

    if (json.times) {
      const times: TimeModel[] = json.times ? json.times.map((time: any) => TimeModel.fromJson(time)) : [];

      // 대회명, 수영장, 팀명 설정
      setCompression(json.compression);
      result.times = decompression(times);

      const eventTimes = result.times.filter(t => t.type === 'event' || t.competitionID > 0);
      const timeTimes = result.times.filter(t => t.type === 'time' || t.competitionID === 0);

      const leaderboards = SwimmingStatsProcessor.makeLeaderboard(result.times);

      const majorStyle = SwimmingStatsProcessor.majorStylesModel(times);
      // const statistics = SwimmingStatsProcessor.processStatistics(eventTimes, timeTimes);
      const eventStatistics = SwimmingStatsProcessor.processStatisticsObject(eventTimes);
      const timeStatistics = SwimmingStatsProcessor.processStatisticsObject(timeTimes);
      result.leaderboards = [...leaderboards];
      result.eventTimes = [...eventTimes];
      result.timeTimes = [...timeTimes];
      // result.statistics = { ...statistics };
      result.eventStatistics = [...eventStatistics];
      result.timeStatistics = [...timeStatistics];
      result.majorStyle = [...majorStyle];
    }
    
// console.log("fromJson=", result);
    return result;
  }

  /**
   * AthleteModel을 JSON 객체로 변환
   */
  toJson(): object {
    return {
      athleteID: this.athleteID,
      userID: this.userID,
      ageGroup: this.ageGroup,
      dob: this.dob,
      gender: this.gender,
      name: this.name,
      phone: this.phone,
      imageID: this.imageID,
      featured: this.featured,
      featuredBB: this.featuredBB,
      squares: this.squares,
      stories: this.stories,
      posts: this.posts,
      thumbnail: this.thumbnail,
      images: this.images,
      timesCount: this.timesCount,
      times: this.times ? this.times.map(time => time.toJson()) : [],
      eventTimes: this.eventTimes ? this.eventTimes.map(time => time.toJson()) : [],
      timeTimes: this.timeTimes ? this.timeTimes.map(time => time.toJson()) : [],
      leaderboards: this.leaderboards ? this.leaderboards.map(time => time.toString()) : [],
      extraInfo: this.extraInfo,
      // statistics: this.statistics,
      eventStatistics: this.eventStatistics,
      timeStatistics: this.timeStatistics,
      joined: this.joined,
      updated: this.updated.toISOString(),
      user: this.user,
    };
  }
}

/**
 * 선수 목록용 간소화 모델
 */
export class AthleteListModel {
  athleteID: number;
  name: string;
  gender: Gender;
  ageGroup: string;
  thumbnail: string;
  timesCount: number;
  bestTime?: string;
  bestTimeDate?: string;
  bestTimeStyle?: string;

  constructor(data: Partial<AthleteListModel> = {}) {
    this.athleteID = data.athleteID || 0;
    this.name = data.name || '';
    this.gender = data.gender || 'men';
    this.ageGroup = data.ageGroup || '';
    this.thumbnail = data.thumbnail || '';
    this.timesCount = data.timesCount || 0;
    this.bestTime = data.bestTime;
    this.bestTimeDate = data.bestTimeDate;
    this.bestTimeStyle = data.bestTimeStyle;
  }

  /**
   * AthleteModel을 AthleteListModel로 변환
   */
  static fromAthleteModel(athlete: AthleteModel): AthleteListModel {
    let bestTimeID = 0;
    let bestTime = '';
    let bestTimeDate = '';
    let bestTimeStyle = '';

    // 최고 기록 찾기
    if (athlete.extraInfo?.bestEvent && athlete.extraInfo.bestEvent.length > 0) {
      // 시간을 수치로 변환하여 비교하기 쉽게 함
      const bestEventWithTime = athlete.extraInfo.bestEvent.map(event => ({
        ...event,
        timeValue: parseFloat(event.time) || Infinity
      }));

      // 가장 빠른 기록 찾기
      const fastestEvent = bestEventWithTime.reduce((fastest, current) =>
        current.timeValue < fastest.timeValue ? current : fastest
        , bestEventWithTime[0]);

      bestTimeID = fastestEvent.timeID;
      bestTime = fastestEvent.time;
      bestTimeDate = fastestEvent.datetime;
      bestTimeStyle = fastestEvent.style;
    }

    return new AthleteListModel({
      athleteID: athlete.athleteID,
      name: athlete.name,
      gender: athlete.gender,
      ageGroup: athlete.ageGroup,
      thumbnail: athlete.thumbnail || athlete.featured || '',
      timesCount: athlete.timesCount,
      bestTime,
      bestTimeDate,
      bestTimeStyle
    });
  }

  /**
   * 성별 한글 이름 반환
   */
  getGenderName(): string {
    switch (this.gender) {
      case 'men':
        return '남자';
      case 'women':
        return '여자';
      case 'mixed':
        return '혼성';
      default:
        return this.gender;
    }
  }

  /**
   * 연령대 이름 가져오기 (utils/ageGroup.js 활용)
   */
  getAgeGroupName(): string {
    try {
      const { getGroupNameByGroup } = require('../utils/ageGroup');
      return getGroupNameByGroup(this.ageGroup);
    } catch (error) {
      return this.ageGroup;
    }
  }

  /**
   * 프로필 이미지 URL 가져오기
   */
  getProfileImageUrl(): string {
    return this.thumbnail || '/images/default-athlete.png';
  }
}