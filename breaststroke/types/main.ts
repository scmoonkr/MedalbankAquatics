
// Realtime Data Types

import type { Gender, SwimStyle, CompressionInfo } from '~/types/common';
// import type { TimeModel } from '@/models/times';
import type { LeaderboardModel } from '~/models/leaderboard';

export enum MainSortField {
  NAME = 'name',
  POOLID = 'poolID',
  COURSE = 'course',
  SIDO = 'sido',
}

export interface MainFilter {
  name?: string;
  course?: string;
  sido?: string;
  poolID?: number;

  page?: number;
  limit?: number;
  sortField: string
  sortDirection: string
}

export interface RealtimeCountItem {
  dbID: number | null;
  count: number;
  name: string;
}

export interface MeasuredRecentItem {
  name: string;
  datetime: string;
  athleteID: number;
}

export interface MeasuredMostItem {
  count: number;
  athleteID: number;
  name: string;
  datetime: string;
}

export interface SearchCountItem {
  datetime: string;
  keyword: string;
  count: number;
}

export interface JoinedItem {
  athleteID: number;
  name: string;
  count: string;
  datetime: string;
}

export interface SearchRecentData {
  pool: SearchCountItem[];
  team: SearchCountItem[];
  athlete: SearchCountItem[];
}

export interface SearchCountData {
  athlete: SearchCountItem[];
  team: SearchCountItem[];
  pool: SearchCountItem[];
}

export interface RealtimeData {
  times: RealtimeCountItem[];
  athletes: RealtimeCountItem[];
  teams: RealtimeCountItem[];
  pools: RealtimeCountItem[];
  competitions: RealtimeCountItem[];
  measuredRecent: MeasuredRecentItem[];
  measuredMost: MeasuredMostItem[];
  searchMost: SearchCountData;
  searchRecent: SearchRecentData;
  joined: JoinedItem[];
}

// Time Record Types
export interface BaseTimeRecord {
  timeID: number;
  name: string;
  time: string;
  timeStamp: number;
  rank: number;
  datetime: string;
  athleteID?: number;
  gender?: string;
  poolID: number;
  rankGroup?: number;
  diffs: string;
  competitionName?: string;
  pool?: string;
  team?: string;
  thumbnail?: string;
}

export interface EnhancedTimeRecord extends BaseTimeRecord {
  competitionName?: string;
  pool?: string;
  team?: string;
}

export interface TimeModel extends BaseTimeRecord {
  isAdult: boolean;
  gender: string;
  style: string;
  course: string;
  distance: string;
  sido: string;
  ageGroup: string;
  teamID: number;
  competitionID: number;
  lid: number;
}

export interface EnhancedTop1TimeRecord extends TimeModel {
  competitionName: string;
  pool: string;
  team: string;
}

export interface LeaderboardTimeRecord {
  rank: number;
  athleteID: number;
  name: string;
  time: string;
  sido: string;
  datetime: string;
}

export interface Top3TimeItem {
  timeID: number;
  name: string;
  time: string;
  timeStamp: number;
  rank: number;
  datetime: string;
  athleteID: number;
  gender: string;
  poolID: number;
  rankGroup: number;
  diffs: string;
}

export interface Top3Category {
  gender: string;
  style: string;
  course: string;
  distance: string;
  timeCount: number;
  athleteCount: number;
  times: Top3TimeItem[];
}

// MVP and Record Types
export interface MVPItem {
  athleteID: number;
  name: string;
  count: number;
}

export interface NewMeasureItem {
  athleteID: number;
  name: string;
  datetime: string;
}

export interface RecordItem {
  athleteID: number;
  name: string;
  timeStamp: number;
  time: string;
  style: string;
  poolID: number;
  distance: string;
  datetime: string;
}

export interface NewRecordTime {
  name: string;
  time: string;
  datetime: string;
  team: string;
  location: string;
  ageGroup: string;
}

export interface NewRecordItem {
  gender: string;
  style: string;
  distance: string;
  course: string;
  KMR: NewRecordTime;
  KMJR: NewRecordTime;
  KR: NewRecordTime;
  AR: NewRecordTime;
  OR: NewRecordTime;
  WR: NewRecordTime;
}

export interface EnhancedRecordItem extends RecordItem {
  pool: string;
}

export interface UpcomingCompetition {
  competitionID: number;
  dateStart: string;
  sido: string;
  poolID: number;
  fullname: string;
  pool: string;
  target: boolean;
  masters: boolean;
}

// Main Main Interface
export interface Main {
  times: number;
  athletes: number;
  reports: number;
  teams: number;
  competitions: number;
  stems: number;
  pools: number;
  rankings: number;
  users: number;
  years: string[];
  realtime: RealtimeData;
  upcomings: UpcomingCompetition[];
  athleteID: number;
  top1: TimeModel[];
  top3: Top3Category[];
  leaderboardsToday: LeaderboardModel[];
  leaderboardsMonth: LeaderboardModel[];
  newMeasure: NewMeasureItem[];
  thisWeekMVP: MVPItem[];
  thisMonthMVP: MVPItem[];
  seasonMVP: MVPItem[];
  newRecords: NewRecordItem[];
  bestRecord: RecordItem[];
  compression: CompressionInfo;
}

// Utility function to enhance time records with compression data
export function enhanceTimeRecord<T extends BaseTimeRecord & { competitionID?: number; teamID?: number }>(
  record: T,
  compression: CompressionInfo
): T & { competitionName?: string; pool?: string; team?: string } {
  const enhanced = { ...record };

  // Add pool name
  if (record.poolID) {
    const pool = compression.pools.find(p => p.poolID === record.poolID);
    enhanced.pool = pool?.name || '';
  }

  // Add team name if teamID exists
  if ('teamID' in record && record.teamID) {
    const team = compression.teams.find(t => t.teamID === record.teamID);
    enhanced.team = team?.name || '';
  }

  // Add competition name if competitionID exists
  if ('competitionID' in record && record.competitionID) {
    const competition = compression.competitions.find(c => c.competitionID === record.competitionID);
    enhanced.competitionName = competition?.name || '';
  }

  return enhanced;
}

// Utility function to enhance all records in an array
export function enhanceTimeRecords<T extends BaseTimeRecord & { competitionID?: number; teamID?: number }>(
  records: T[],
  compression: CompressionInfo
): (T & { competitionName?: string; pool?: string; team?: string })[] {
  return records.map(record => enhanceTimeRecord(record, compression));
}