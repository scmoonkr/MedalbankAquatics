// models/Stem.ts
import type { Gender, SwimCourse, SwimStyle, Sido } from '~/types/common';
import type { StemFilter,  } from '~/types/stems';

// Define the Sido type (assuming it's an enum or string)
// If this is defined elsewhere, you can remove this and import it

/**
 * Stem Model class
 */
export class StemModel {
	stemID: number;
	stem: string;
	competitions: [];

	/**
	 * Create a new StemModel instance
	 */
	constructor(
    stemID: number = 0,
    stem: string = '',
		competitions: [],
  ) {
    // 필수 속성들
    this.stemID = stemID;
    this.stem = stem;
		this.competitions = competitions;
  }

	/**
	 * Create a StemModel instance from JSON
	 * @param json The JSON object to convert
	 * @returns A new StemModel instance
	 */
	static fromJson(json: Record<string, any>): StemModel {
		// 새로운 constructor로 필수 속성 5개만 전달
		const stem = new StemModel(
			json.stemID ?? 0,
			json.stem ?? '',
			json.competitions ?? [],
		);

		return stem;
	}

	/**
	 * Convert this StemModel instance to a JSON object
	 * @returns A JSON representation of the model
	 */
	toJson(): Record<string, any> {
		return {
			stemID: this.stemID,
			stem: this.stem,
			competitions: this.competitions,
		};
	}
}

/**
 * StemListModel class to manage a list of StemModel instances
 */
export class StemListModel {
	items: StemModel[];

	/**
	 * Create a new StemListModel instance
	 * @param items Initial array of stem models (optional)
	 */
	constructor(items: StemModel[] = []) {
		this.items = items;
	}

	/**
	 * Create a StemListModel instance from JSON array
	 * @param jsonArray Array of JSON objects to convert
	 * @returns A new StemListModel instance
	 */
	static fromJson(jsonArray: Record<string, any>[]): StemListModel {
		const items = jsonArray.map(json => StemModel.fromJson(json));
		return new StemListModel(items);
	}

	/**
	 * Convert this StemListModel instance to a JSON array
	 * @returns A JSON array representation of the model
	 */
	toJson(): Record<string, any>[] {
		return this.items.map(item => item.toJson());
	}

	/**
	 * Add a stem to the list
	 * @param stem The stem to add
	 */
	add(stem: StemModel): void {
		this.items.push(stem);
	}

	/**
	 * Remove a stem from the list by ID
	 * @param stemID The ID of the stem to remove
	 * @returns true if the stem was found and removed, false otherwise
	 */
	remove(stemID: number): boolean {
		const initialLength = this.items.length;
		this.items = this.items.filter(stem => stem.stemID !== stemID);
		return initialLength !== this.items.length;
	}

	/**
	 * Find a stem by ID
	 * @param stemID The ID of the stem to find
	 * @returns The found stem or undefined if not found
	 */
	findById(stemID: number): StemModel | undefined {
		return this.items.find(stem => stem.stemID === stemID);
	}

	/**
	 * Update a stem in the list
	 * @param updatedStem The updated stem data
	 * @returns true if the stem was found and updated, false otherwise
	 */
	update(updatedStem: StemModel): boolean {
		const index = this.items.findIndex(stem => stem.stemID === updatedStem.stemID);
		if (index !== -1) {
			this.items[index] = updatedStem;
			return true;
		}
		return false;
	}

	/**
	 * Search stems by stem
	 * @param query The search query
	 * @returns A new array of stems that match the search
	 */
	search(query: string): StemModel[] {
		const lowercaseQuery = query.toLowerCase();
		return this.items.filter(stem =>
			stem.stem.toLowerCase().includes(lowercaseQuery)
		);
	}

	/**
	 * Get the number of stems in the list
	 */
	get length(): number {
		return this.items.length;
	}
}