// models/pray.ts

import { type IPrayData } from '~/types/pray';

export class PrayModel implements IPrayData {
	prayID: number;
	title: string;
	slug: string;
	prayCode: string;
	monk: string;
	temple: string;
	registStart: string;
	registEnd: string;
	startDate: string;
	endDate: string;
	offering: string;
	offeringCode: string;
	excerpt: string;
	contrents: string;
	category: string;
	featured: string;
	youtube: string;
	tags: string[];
	imageGrid: string[];
	count: number;

	constructor(data: IPrayData) {
		this.prayID = data.prayID ?? 0;
		this.title = data.title ?? '';
		this.slug = data.slug ?? '';
		this.prayCode = data.prayCode ?? '';
		this.monk = data.monk ?? '';
		this.temple = data.temple ?? '';
		this.registStart = data.registStart ?? '';
		this.registEnd = data.registEnd ?? '';
		this.startDate = data.startDate ?? '';
		this.endDate = data.endDate ?? '';
		this.offering = data.offering ?? '';
		this.offeringCode = data.offeringCode ?? '';
		this.excerpt = data.excerpt ?? '';
		this.contrents = data.contrents ?? '';
		this.category = data.category ?? '';
		this.featured = data.featured ?? '';
		this.youtube = data.youtube ?? '';
		this.tags = data.tags ?? [];
		this.imageGrid = data.imageGrid ?? [];
		this.count = data.count ?? 0;
	}

	static fromJson(json: any): PrayModel {
		const prayID = json.prayID ?? 0;
		const title = json.title ?? '';
		const slug = json.slug ?? '';
		const prayCode = json.prayCode ?? '';
		const monk = json.monk ?? '';
		const temple = json.temple ?? '';
		const registStart = json.registStart ?? '';
		const registEnd = json.registEnd ?? '';
		const startDate = json.startDate ?? '';
		const endDate = json.endDate ?? '';
		const offering = json.offering ?? '';
		const offeringCode = json.offeringCode ?? '';
		const excerpt = json.excerpt ?? '';
		const contrents = json.contrents ?? '';
		const category = json.category ?? '';
		const featured = json.featured ?? '';
		const youtube = json.youtube ?? '';

		json.tags = json.tags || [];
		const tags = Array.isArray(json.tags) ? json.tags : [];


		json.imageGrid = json.imageGrid || [];
		const imageGrid = Array.isArray(json.imageGrid) ? json.imageGrid : [];

		const count = json.count ?? 0;
		return new PrayModel({
			prayID,
			title,
			slug,
			prayCode,
			monk,
			temple,
			registStart,
			registEnd,
			startDate,
			endDate,
			offering,
			offeringCode,
			excerpt,
			contrents,
			category,
			featured,
			youtube,
			tags,
			imageGrid,
			count,
		});
	}

	toJson(): IPrayData {
		return {
			prayID: this.prayID,
			title: this.title,
			slug: this.slug,
			prayCode: this.prayCode,
			monk: this.monk,
			temple: this.temple,
			registStart: this.registStart,
			registEnd: this.registEnd,
			startDate: this.startDate,
			endDate: this.endDate,
			offering: this.offering,
			offeringCode: this.offeringCode,
			excerpt: this.excerpt,
			contrents: this.contrents,
			category: this.category,
			featured: this.featured,
			youtube: this.youtube,
			tags: this.tags,
			imageGrid: this.imageGrid,
			count: this.count,
		}
	}

	static createEmpty(): PrayModel {
		return new PrayModel({
			prayID: 0,
			title: '',
			slug: '',
			prayCode: '',
			monk: '',
			temple: '',
			registStart: '',
			registEnd: '',
			startDate: '',
			endDate: '',
			offering: '',
			offeringCode: '',
			excerpt: '',
			contrents: '',
			category: '',
			featured: '',
			youtube: '',
			tags: [],
			imageGrid: [],
			count: 0,
		});
	}

}
