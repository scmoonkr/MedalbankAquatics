// types/youtube.ts


export enum IYoutubeSortField {
	YOUTUBEID = 'youtubeID',
	NAME = 'name',
	GENDER = 'gender',
	DISCIPLINE = 'discipline',
	COURSE = 'course',
}

export interface IYoutubeFilter {
	title: string;
	name: string;
	gender: string;
	discipline: string;
	course: string;
	distance: string;
	isRegistered: string;
	classCode: string;
	time: string;
	datetime: string;

	keyword: string;
	sortField: string;
	sortDirection: string;
}

export interface IYoutubeData {
	youtubeID: number;
	title: string;
	name?: string;
	gender?: string;
	discipline?: string;
	course?: string;
	distance?: string;
	time?: string;
	timeStamp?: number;
	datetime?: string;
	thumbnail: string;
	href: string;
	duration: string;
	classCode: string;
	round: string;
	uploadedAt: string;
	views: number;
}
