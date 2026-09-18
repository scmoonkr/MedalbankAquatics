// models/youtube.ts

import { type IYoutubeData } from '~/types/youtube';

export class YoutubeModel implements IYoutubeData {
	youtubeID: number;
	title: string;
	name: string;
	gender: string;
	discipline: string;
	course: string;
	distance: string;
	time: string;
	timeStamp: number;
	datetime: string;
	thumbnail: string;
	href: string;
	duration: string;
	uploadedAt: string;
	classCode: string;
	round: string;
	views: number;

	constructor(data: IYoutubeData) {
		this.youtubeID = data.youtubeID ?? 0;
		this.title = data.title ?? '';
		this.name = data.name ?? '';
		this.gender = data.gender ?? '';
		this.discipline = data.discipline ?? '';
		this.course = data.course ?? '';
		this.distance = data.distance ?? '';
		this.time = data.time ?? '';
		this.timeStamp = data.timeStamp ?? 0;
		this.datetime = data.datetime ?? '';
		this.thumbnail = data.thumbnail ?? '';
		this.href = data.href ?? '';
		this.duration = data.duration ?? '';
		this.uploadedAt = data.uploadedAt ?? '';
		this.classCode = data.classCode ?? '';
		this.round = data.round ?? '';
		this.views = data.views ?? 0;
	}

	static fromJson(json: any): YoutubeModel {
		const youtubeID = json.youtubeID ?? 0;
		const title = json.title ?? '';
		const name = json.name ?? '';
		const gender = json.gender ?? '';
		const discipline = json.discipline ?? '';
		const course = json.course ?? '';
		const distance = json.distance ?? '';
		const time = json.time ?? '';
		const timeStamp = json.timeStamp ?? 0;
		const datetime = json.datetime ?? '';
		const thumbnail = json.thumbnail ?? '';
		const href = json.href ?? '';
		const duration = json.duration ?? '';
		const uploadedAt = json.uploadedAt ?? '';
		const classCode = json.classCode ?? '';
		const round = json.round ?? '';
		const views = json.views ?? 0;
		return new YoutubeModel({
			youtubeID,
			title,
			name,
			gender,
			discipline,
			course,
			distance,
			time,
			timeStamp,
			datetime,
			thumbnail,
			href,
			duration,
			uploadedAt,
			classCode,
			round,
			views,
		});
	}

	toJson(): IYoutubeData {
		return {
			youtubeID: this.youtubeID,
			title: this.title,
			name: this.name,
			gender: this.gender,
			discipline: this.discipline,
			course: this.course,
			distance: this.distance,
			time: this.time,
			timeStamp: this.timeStamp,
			datetime: this.datetime,
			thumbnail: this.thumbnail,
			href: this.href,
			duration: this.duration,
			uploadedAt: this.uploadedAt,
			classCode: this.classCode,
			round: this.round,
			views: this.views,
		}
	}

	static createEmpty(): YoutubeModel {
		return new YoutubeModel({
			youtubeID: 0,
			title: '',
			name: '',
			gender: '',
			discipline: '',
			course: '',
			distance: '',
			time: '',
			timeStamp: 0,
			datetime: '',
			thumbnail: '',
			href: '',
			duration: '',
			uploadedAt: '',
			classCode: '',
			round: '',
			views: 0,
		});
	}

}
