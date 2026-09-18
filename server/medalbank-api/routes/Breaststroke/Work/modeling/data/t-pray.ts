// types/pray.ts


export enum IPraySortField {
	PRAYID = 'prayID',
	SLUG = 'slug',
	PRAYCODE = 'prayCode',
}

export interface IPrayFilter {
	title: string;
	prayCode: string;
	temple: string;
	registStart: string;
	startDate: string;
	category: string;
	tags: string[];

	keyword: string;
	sortField: string;
	sortDirection: string;
}

export interface IPrayData {
	prayID: number;	// pray ID
	title: string;	// 기도제목
	slug: string;	// slug
	prayCode: string;	// 기도코드
	monk: string;	// 담당 스님
	temple: string;	// 절
	registStart: string;	// 접수시작일자
	registEnd?: string;	// 접수종료일자
	startDate: string;	// 기도시작일자
	endDate?: string;	// 기도종료일자
	offering?: string;	// 헌금
	offeringCode?: string;	// 헌금 코드
	excerpt?: string;
	contrents: string;
	category: string;
	featured?: string;
	youtube?: string;
	tags?: string[];
	imageGrid?: string[];
	count?: number;
}
