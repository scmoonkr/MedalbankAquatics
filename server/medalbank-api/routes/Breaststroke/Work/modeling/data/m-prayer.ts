// models/prayer.ts

import { type IPrayerData } from '~/types/prayer';
import { type IPrayerData } from '~/types/prayer';
import { PrayerModel } from '~/models/prayer';

export class PrayerModel implements IPrayerData {
	userNo: number;
	prayerID: number;
	prayID: number;
	title: string;
	relation: string;
	name: string;
	gender: string;
	birth: string;
	lunar: boolean;
	death: boolean;
	prayCode: string;
	pray: string;
	startDate: string;
	endDate: string;
	offering: string;
	offeringCode: string;
	families: IPrayerData[];

	constructor(data: IPrayerData) {
		this.userNo = data.userNo ?? 0;
		this.prayerID = data.prayerID ?? 0;
		this.prayID = data.prayID ?? 0;
		this.title = data.title ?? '';
		this.relation = data.relation ?? '';
		this.name = data.name ?? '';
		this.gender = data.gender ?? '';
		this.birth = data.birth ?? '';
		this.lunar = data.lunar ?? false;
		this.death = data.death ?? false;
		this.prayCode = data.prayCode ?? '';
		this.pray = data.pray ?? '';
		this.startDate = data.startDate ?? '';
		this.endDate = data.endDate ?? '';
		this.offering = data.offering ?? '';
		this.offeringCode = data.offeringCode ?? '';
		this.families = data.families ?? [];
	}

	static fromJson(json: any): PrayerModel {
		const userNo = json.userNo ?? 0;
		const prayerID = json.prayerID ?? 0;
		const prayID = json.prayID ?? 0;
		const title = json.title ?? '';
		const relation = json.relation ?? '';
		const name = json.name ?? '';
		const gender = json.gender ?? '';
		const birth = json.birth ?? '';
		const lunar = json.lunar ?? false;
		const death = json.death ?? false;
		const prayCode = json.prayCode ?? '';
		const pray = json.pray ?? '';
		const startDate = json.startDate ?? '';
		const endDate = json.endDate ?? '';
		const offering = json.offering ?? '';
		const offeringCode = json.offeringCode ?? '';

		json.families = json.families || [];
		const families = Array.isArray(json.families) ? json.families : [];

		return new PrayerModel({
			userNo,
			prayerID,
			prayID,
			title,
			relation,
			name,
			gender,
			birth,
			lunar,
			death,
			prayCode,
			pray,
			startDate,
			endDate,
			offering,
			offeringCode,
			families,
		});
	}

	toJson(): IPrayerData {
		return {
			userNo: this.userNo,
			prayerID: this.prayerID,
			prayID: this.prayID,
			title: this.title,
			relation: this.relation,
			name: this.name,
			gender: this.gender,
			birth: this.birth,
			lunar: this.lunar,
			death: this.death,
			prayCode: this.prayCode,
			pray: this.pray,
			startDate: this.startDate,
			endDate: this.endDate,
			offering: this.offering,
			offeringCode: this.offeringCode,
			families: this.families,
		}
	}

	static createEmpty(): PrayerModel {
		return new PrayerModel({
			userNo: 0,
			prayerID: 0,
			prayID: 0,
			title: '',
			relation: '',
			name: '',
			gender: '',
			birth: '',
			lunar: false,
			death: false,
			prayCode: '',
			pray: '',
			startDate: '',
			endDate: '',
			offering: '',
			offeringCode: '',
			families: [],
		});
	}

}
