// types/prayer.ts

import { type IPrayerData } from '~/types/prayer';

export enum IPrayerSortField {
	USERNO = 'userNo',
	PRAYERID = 'prayerID',
	PRAYID = 'prayID',
	NAME = 'name',
	PRAYCODE = 'prayCode',
}

export interface IPrayerFilter {
	userNo: number;
	prayerID: number;
	prayID: number;
	title: string;
	name: string;
	prayCode: string;
	startDate: string;

	keyword: string;
	sortField: string;
	sortDirection: string;
}

export interface IPrayerData {
	userNo: number;
	prayerID: number;	// prayer ID
	prayID: number;	// pray ID
	title: string;	// 기도제목
	relation: string;	// 관계
	name: string;	// 이름
	gender: string;	// 성별
	birth: string;	// 생년월일
	lunar: boolean;	// 음력
	death: boolean;	// 기일
	prayCode: string;	// 기도코드
	pray: string;	// 기도내용
	startDate?: string;	// 기도시작일자
	endDate?: string;	// 기도종료일자
	offering?: string;	// 헌금 내용
	offeringCode?: string;	// 헌금 코드
	families?: IPrayerData[];	// 가족
}
