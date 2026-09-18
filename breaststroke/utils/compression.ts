// utils/compression.ts

/**
 * Interface for compression info
 */
interface CompressionInfo {
  competitions: Array<{ competitionID: number; name: string;[key: string]: any }>;
  teams: Array<{ teamID: number; name: string;[key: string]: any }>;
  pools: Array<{ poolID: number; name: string;[key: string]: any }>;
  [key: string]: any;
}

// Store compression data for reuse
let storedCompression: CompressionInfo | null = null;

/**
 * Set compression data for later use
 * @param compression Compression info
 */
export function setCompression(compression: CompressionInfo): void {
  storedCompression = compression ?? { competitions: [], teams: [], pools: [] };
  if (!storedCompression.competitions) storedCompression.competitions = [];
  if (!storedCompression.pools) storedCompression.pools = [];
  if (!storedCompression.teams) storedCompression.teams = [];
}

/**
 * Get the stored compression data
 * @returns Stored compression data or null if not set
 */
export function getCompression(): CompressionInfo | null {
  return storedCompression;
}

/**
 * Creates a lookup map from an array of objects
 * @param arr Array of objects
 * @param key The key to use for lookup
 * @returns Object with keys mapped to their corresponding objects
 */
function createLookupMap<T extends Record<K, any>, K extends keyof T>(
  arr: T[],
  key: K
): Record<string, T> {
  return arr.reduce((map, item) => {
    map[item[key]] = item;
    return map;
  }, {} as Record<string, T>);
}

/**
 * Format date to YYYY-MM-DD
 * @param dateString Date string
 * @returns Formatted date string
 */
function formatDateToYYYYMMDD(dateString: string): string {
  const date = dateString ? new Date(dateString) : new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Get competition name by competitionID using stored compression
 * @param competitionID Competition ID
 * @returns Competition name or empty string if not found
 */
export function getCompetition(competitionID: number): string {
  if (!storedCompression) {
    console.warn('Compression data not set. Call setCompression first.');
    return '';
  }

  const competition = storedCompression.competitions.find(c => c.competitionID === competitionID);
  return competition?.name || '';
}

/**
 * Get team name by teamID using stored compression
 * @param teamID Team ID
 * @returns Team name or empty string if not found
 */
export function getTeam(teamID: number): string {
  if (!storedCompression) {
    console.warn('Compression data not set. Call setCompression first.');
    return '';
  }

  const team = storedCompression.teams.find(t => t.teamID === teamID);
  return team?.name || '';
}

/**
 * Get pool name by poolID using stored compression
 * @param poolID Pool ID
 * @returns Pool name or empty string if not found
 */
export function getPool(poolID: number): string {
  if (!storedCompression) {
    console.warn('Compression data not set. Call setCompression first.');
    return '';
  }

  const pool = storedCompression.pools.find(p => p.poolID === poolID);
  return pool?.name || '';
}

/**
 * Decompress time data with names from stored compression
 * @param times Array of time records
 * @returns Enhanced time records with names
 */
export function decompression(times: any[]): any[] {
  if (!storedCompression || storedCompression.competitions.length == 0) {
    console.warn('Compression data not set. Call setCompression first.');
    return times;
  }

  // Create lookup maps for faster access
  const competitionMap = createLookupMap(storedCompression.competitions, 'competitionID');
  const teamMap = createLookupMap(storedCompression.teams, 'teamID');
  const poolMap = createLookupMap(storedCompression.pools, 'poolID');

  // Map the data with names from compression
  const timeArr = times.map(time => {
    if (time.datetime) {
      time.datetime = formatDateToYYYYMMDD(time.datetime);
    }
    const enhancedRecord = {
      ...time,
      competitionName: competitionMap[time.competitionID]?.name || '',
      team: teamMap[time.teamID]?.name || '',
      pool: poolMap[time.poolID]?.name || ''
    };
    return enhancedRecord;
  });

  return timeArr;
}