// models/Team.ts
import type { Gender, SwimCourse, SwimStyle, Sido } from '~/types/common';
import type { TeamFilter } from '~/types/teams';

// Define the Sido type (assuming it's an enum or string)
// If this is defined elsewhere, you can remove this and import it

/**
 * Team Model class
 */
import { TimeModel } from '~/models/times';

export interface MedalCount {
	gold: number;
	silver: number;
	bronze: number;
}

export interface CompetitionSummary {
	competitionID: number;
	medals: MedalCount;
	timeCount: number;
	athleteCount: number;
	fullname: string;
	dateStart: string;
}

export interface StyleBreakdown {
	[key: string]: number | undefined;
	freestyle?: number;
	backstroke?: number;
	breaststroke?: number;
	butterfly?: number;
	individualMedley?: number;
	freestyleRelay?: number;
	medleyRelay?: number;
}

export interface MedalStyleBreakdown {
	style: string;
	gender: string;
	timeCount: number;
	gold: number;
	silver: number;
	bronze: number;
}

export interface StyleCount {
	style: string;
	count: number;
}

export interface SwimmerEventCount {
	athleteID: number;
	name: string;
	count: number;
}

export interface TimeSummary {
	timeID: number;
	time: string;
	style: string;
	distance: string;
	datetime: string;
	competitionID: number;
	rank: number;
	teamID: number;
}

export interface TeamTimeRecord {
	gender: string;
	style: string;
	course: string;
	distance: string;
	timeCount: number;
	athleteCount: number;
	timeID: number;
	name: string;
	time: string;
	rank: number;
	datetime: string;
	teamID: number;
	competitionID: number;
}

export interface TeamExtraInfo {
	teamID: number;
	timeCount: number;
	athleteCount: number;
	competitionCount: number;
	competitions: CompetitionSummary[];
	bestTimes: TimeModel[];
	teamTimes: TimeModel[];
	swimmersEvent: SwimmerEventCount[];
	medals: MedalStyleBreakdown[];
	major: StyleCount[];
	latest: TimeSummary;
	first: TimeSummary;
	points: number;
}

export class TeamModel {
	teamID: number;
	name: string;
	teamCode: string;
	names: string[];
	nameKor?: string;
	nameEng?: string;
	indexes?: string[];
	logo?: string;
	firstDate?: string;
	latestDate?: string;
	competitionCount?: number;
	medals?: number;
	members?: number;
	points?: number;
	rank?: any[]; // This could be further defined based on actual rank structure
	style?: StyleBreakdown;
	timeCount?: number;
	isAdult?: boolean;
	isMasters?: boolean;
	sido?: string;
	updated?: string;
	adult?: string;
	masters?: string;
	featured?: string;
	extraInfo?: TeamExtraInfo;

	constructor(
    teamID: number = 0,
    name: string = '',
    names: string[] = [],
    teamCode: string = '',
  ) {
	
		this.teamID = teamID ?? 0;
		this.name = name ?? '';
		this.teamCode = teamCode ?? '';
		this.names = names ?? [];

		this.nameKor = undefined;
		this.nameEng = undefined;
		this.indexes = undefined;
		this.logo = undefined;
		this.firstDate = undefined;
		this.latestDate = undefined;
		this.competitionCount = undefined;
		this.medals = undefined;
		this.members = undefined;
		this.points = undefined;
		this.rank = undefined;
		this.style = undefined;
		this.timeCount = undefined;
		this.isAdult = undefined;
		this.isMasters = undefined;
		this.sido = undefined;
		this.updated = undefined;
		this.adult = undefined;
		this.masters = undefined;
		this.featured = undefined;
		this.extraInfo = undefined;
	}

	static fromJson(json: Record<string, any>): TeamModel {
		const extra = json.statistics ?? {};
		const extraInfo: TeamExtraInfo = {
			teamID: extra.teamID ?? 0,
			timeCount: extra.timeCount ?? 0,
			athleteCount: extra.athleteCount ?? 0,
			competitionCount: extra.competitionCount ?? 0,
			competitions: extra.competitions ?? [],
			swimmersEvent: extra.swimmersEvent ?? [],
			medals: extra.medals ?? [],
			major: extra.major ?? [],
			latest: extra.latest ?? {},
			first: extra.first ?? {},
			points: extra.points ?? 0,
			bestTimes: (extra.extraInfo?.bestTimes || []).map((time: any) => TimeModel.fromJson(time)),
			teamTimes: (extra.extraInfo?.teamTimes || []).map((time: any) => TimeModel.fromJson(time)),
		};

		if (json.compression != undefined) {
			setCompression(json.compression);
			extraInfo.bestTimes = decompression(extraInfo.bestTimes);
			extraInfo.teamTimes = decompression(extraInfo.teamTimes);
		}

		const team = new TeamModel(
			json.teamID ?? 0,
			json.name ?? '',
			json.names ?? [],
			json.teamCode ?? '',
		);

		// Optional 속성들 개별 설정
		team.nameKor = json.nameKor;
		team.nameEng = json.nameEng;
		team.indexes = json.indexes;
		team.logo = json.logo;
		team.firstDate = json.firstDate;
		team.latestDate = json.latestDate;
		team.competitionCount = json.competitionCount;
		team.medals = json.namedalsmeKor;
		team.members = json.members;
		team.points = json.points;
		team.rank = json.rank;
		team.style = json.style;
		team.timeCount = json.timeCount;
		team.isAdult = json.isAdult;
		team.isMasters = json.isMasters;
		team.sido = json.sido;
		team.updated = json.updated;
		team.adult = json.adult;
		team.masters = json.masters;
		team.featured = json.featured;
		team.updated = json.updated;
		team.updated = json.updated;
		team.updated = json.updated;
		team.extraInfo = extraInfo;

		return team;
	}


	toJson(): Record<string, any> {
		return {
			teamID: this.teamID,
			name: this.name,
			names: this.names,
			teamCode: this.teamCode,

			nameKor: this.nameKor,
			nameEng: this.nameEng,
			indexes: this.indexes,
			logo: this.logo,
			firstDate: this.firstDate,
			latestDate: this.latestDate,
			competitionCount: this.competitionCount,
			medals: this.medals,
			members: this.members,
			points: this.points,
			rank: this.rank,
			style: this.style,
			timeCount: this.timeCount,
			isAdult: this.isAdult,
			isMasters: this.isMasters,
			sido: this.sido,
			updated: this.updated,
			adult: this.adult,
			masters: this.masters,
			featured: this.featured,
			extraInfo: this.extraInfo
		};
	}

	private initExtraInfo(): TeamExtraInfo {
		return {
			teamID: this.teamID,
			timeCount: 0,
			athleteCount: 0,
			competitionCount: 0,
			competitions: [],
			bestTimes: [],
			teamTimes: [],
			swimmersEvent: [],
			medals: [],
			major: [],
			latest: {
				timeID: 0,
				time: '',
				style: '',
				distance: '',
				datetime: '',
				competitionID: 0,
				rank: 0,
				teamID: this.teamID
			},
			first: {
				timeID: 0,
				time: '',
				style: '',
				distance: '',
				datetime: '',
				competitionID: 0,
				rank: 0,
				teamID: this.teamID
			},
			points: 0
		};
	}

	// Helper method to get total medal count
	getTotalMedals(): number {
		return this.medals!;
	}

	// Helper method to get dominant style
	getDominantStyle(): string {
		let maxStyle = '';
		let maxCount = 0;

		Object.entries(this.style!).forEach(([style, count]) => {
			if (count !== undefined && count > maxCount) {
				maxCount = count;
				maxStyle = style;
			}
		});

		return maxStyle;
	}

	// Helper method to format date
	formatDate(dateString: string): string {
		if (!dateString) return '';

		const date = new Date(dateString);
		return date.toLocaleDateString();
	}

}