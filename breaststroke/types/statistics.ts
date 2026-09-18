// types/statistics.ts
import type { Gender, SwimCourse, Distance } from '~/types/common';

export interface GraphData {
	label: string;
	count: number;
	time: number;
	course?: string;
	distance?: string;
	gender?: string;
	isJunior?: boolean;
	isMasters?: boolean;
	type?: string;
}

export interface Graph {
	course: GraphData[];
	distance: GraphData[];
	eventMen: GraphData[];
	eventWomen: GraphData[];
	gender: GraphData[];
	heat: GraphData[];
	isJunior: GraphData[];
	isMasters: GraphData[];
	type: GraphData[];
}

/**
 * 수영 기록 타입
 */
export interface Statistics {
	athletes: number; // 선수 수
	averageTimes: []; // 평균 times
	graph: Graph; // graph data
	percentageTimes: []; // percentage times
	randomAthletes: [];
	top3: {}; // top3 data
}

export type AverageTimesKey = 
    | `${Distance}-${SwimCourse}`           // '50M-LCM'
    | `${Distance}-${SwimCourse}-${Gender}` // '50M-LCM-men'

export interface AverageTimes {
    [key: string]: string;
}

