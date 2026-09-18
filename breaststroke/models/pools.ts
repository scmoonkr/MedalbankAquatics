// models/Pool.ts
import type { Gender, SwimCourse, SwimStyle, Sido } from '~/types/common';
import { TimeModel } from '~/models/times';
import { CompetitionModel } from '~/models/competitions';
import type { PoolFilter } from '~/types/pools';

// Define the Sido type (assuming it's an enum or string)
// If this is defined elsewhere, you can remove this and import it

/**
 * 대회 추가 정보
 */
export interface PoolExtraInfo {
	competitions: CompetitionModel[];
	timeTimes: TimeModel[];
	bestTime: TimeModel[];
	bestEvent: TimeModel[];
	latest: TimeModel[];
}

/**
 * 압축 정보 (ID-이름 매핑)
 */
export interface CompressionItem {
	[key: string]: number | string;
}

/**
 * 대회 압축 정보
 */
export interface PoolCompression {
	teams: CompressionItem[];
	pools: CompressionItem[];
	competitions: CompressionItem[];
}
/**
 * Pool Model class
 */
export class PoolModel {
	poolID: number;
	name: string;
	names: string[];
	sido: string;
	course: string;
	fullname?: string;
	addressDRM?: string;
	featured?: string;
	address?: string;
	addressDetails?: string;
	phone?: string;
	email?: string;
	website?: string;
	extraInfo?: PoolExtraInfo;
	compression?: PoolCompression;

	/**
	 * Create a new PoolModel instance
	 */
	constructor(
    poolID: number = 0,
    name: string = '',
    names: string[] = [],
    sido: string = '인천',
    course: string = 'LCM'
  ) {
    // 필수 속성들
    this.poolID = poolID;
    this.name = name;
    this.names = names;
    this.sido = sido;
    this.course = course;
    
    // Optional 속성들은 undefined로 초기화
    this.fullname = undefined;
    this.addressDRM = undefined;
    this.featured = undefined;
    this.address = undefined;
    this.addressDetails = undefined;
    this.phone = undefined;
    this.email = undefined;
    this.website = undefined;
    this.extraInfo = undefined;
    this.compression = undefined;
  }

	/**
	 * Create a PoolModel instance from JSON
	 * @param json The JSON object to convert
	 * @returns A new PoolModel instance
	 */
	static fromJson(json: Record<string, any>): PoolModel {
		const extraInfo: PoolExtraInfo = {
			competitions: json.extraInfo?.competitions || [],
			latest: json.extraInfo?.latest || [],
			timeTimes: (json.extraInfo?.timeTimes || []).map((time: any) => TimeModel.fromJson(time)),
			bestEvent: (json.extraInfo?.bestEvent || []).map((time: any) => TimeModel.fromJson(time)),
			bestTime: (json.extraInfo?.bestTime || []).map((time: any) => TimeModel.fromJson(time))
		};

		if (json.compression != undefined) {
			setCompression(json.compression);
			extraInfo.latest = decompression(extraInfo.latest);
			extraInfo.timeTimes = decompression(extraInfo.timeTimes);
			extraInfo.bestEvent = decompression(extraInfo.bestEvent);
			extraInfo.bestTime = decompression(extraInfo.bestTime);
		}
		json.extraInfo = extraInfo;

		// 새로운 constructor로 필수 속성 5개만 전달
		const pool = new PoolModel(
			json.poolID ?? 0,
			json.name ?? '',
			json.names ?? [],
			json.sido ?? '인천',
			json.course ?? 'LCM'
		);

		// Optional 속성들 개별 설정
		pool.fullname = json.fullname;
		pool.addressDRM = json.addressDRM;
		pool.featured = json.featured;
		pool.address = json.address;
		pool.addressDetails = json.addressDetails;
		pool.phone = json.phone;
		pool.email = json.email;
		pool.website = json.website;
		pool.extraInfo = extraInfo;
		pool.compression = json.compression;

		return pool;
	}

	/**
	 * Convert this PoolModel instance to a JSON object
	 * @returns A JSON representation of the model
	 */
	toJson(): Record<string, any> {
		return {
			poolID: this.poolID,
			name: this.name,
			names: this.names,
			fullname: this.fullname,
			sido: this.sido,
			course: this.course,
			addressDRM: this.addressDRM,
			featured: this.featured,
			address: this.address,
			addressDetails: this.addressDetails,
			phone: this.phone,
			email: this.email,
			website: this.website,
			extraInfo: this.extraInfo,
			compression: this.compression,
		};
	}
}

/**
 * PoolListModel class to manage a list of PoolModel instances
 */
export class PoolListModel {
	items: PoolModel[];

	/**
	 * Create a new PoolListModel instance
	 * @param items Initial array of pool models (optional)
	 */
	constructor(items: PoolModel[] = []) {
		this.items = items;
	}

	/**
	 * Create a PoolListModel instance from JSON array
	 * @param jsonArray Array of JSON objects to convert
	 * @returns A new PoolListModel instance
	 */
	static fromJson(jsonArray: Record<string, any>[]): PoolListModel {
		const items = jsonArray.map(json => PoolModel.fromJson(json));
		return new PoolListModel(items);
	}

	/**
	 * Convert this PoolListModel instance to a JSON array
	 * @returns A JSON array representation of the model
	 */
	toJson(): Record<string, any>[] {
		return this.items.map(item => item.toJson());
	}

	/**
	 * Add a pool to the list
	 * @param pool The pool to add
	 */
	add(pool: PoolModel): void {
		this.items.push(pool);
	}

	/**
	 * Remove a pool from the list by ID
	 * @param poolID The ID of the pool to remove
	 * @returns true if the pool was found and removed, false otherwise
	 */
	remove(poolID: number): boolean {
		const initialLength = this.items.length;
		this.items = this.items.filter(pool => pool.poolID !== poolID);
		return initialLength !== this.items.length;
	}

	/**
	 * Find a pool by ID
	 * @param poolID The ID of the pool to find
	 * @returns The found pool or undefined if not found
	 */
	findById(poolID: number): PoolModel | undefined {
		return this.items.find(pool => pool.poolID === poolID);
	}

	/**
	 * Update a pool in the list
	 * @param updatedPool The updated pool data
	 * @returns true if the pool was found and updated, false otherwise
	 */
	update(updatedPool: PoolModel): boolean {
		const index = this.items.findIndex(pool => pool.poolID === updatedPool.poolID);
		if (index !== -1) {
			this.items[index] = updatedPool;
			return true;
		}
		return false;
	}

	/**
	 * Filter pools by sido
	 * @param sido The sido to filter by
	 * @returns A new array of pools that match the sido
	 */
	filterBySido(sido: string): PoolModel[] {
		return this.items.filter(pool => pool.sido === sido);
	}

	/**
	 * Search pools by name
	 * @param query The search query
	 * @returns A new array of pools that match the search
	 */
	search(query: string): PoolModel[] {
		const lowercaseQuery = query.toLowerCase();
		return this.items.filter(pool =>
			pool.name.toLowerCase().includes(lowercaseQuery) ||
			// pool.fullname.toLowerCase().includes(lowercaseQuery) ||
			pool.name.toLowerCase().includes(lowercaseQuery)
		);
	}

	/**
	 * Get the number of pools in the list
	 */
	get length(): number {
		return this.items.length;
	}
}