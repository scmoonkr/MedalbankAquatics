// api/recordApi.ts
import axios from 'axios';
import type { ServerListResponse } from '~/types/common';

const _URL = "/BR/records";

export interface RecordFilter {
  gender?: string;
  course?: string;
  distance?: string;
  discipline?: string;
  type?: string;
  isMasters?: boolean;
  name?: string;
  maxRows?: number;
}

export interface RecordKey { type: string; gender: string; discipline: string; course: string; distance: string }
export interface ManualError { index: number | null; field: string | null; message: string }
export type ManualResult = ServerListResponse<any> & { errors?: ManualError[]; inserted?: number; updated?: number; unchanged?: number };

// Breaststroke.records 조회 및 갱신
export const createRecordApi = () => {
  const config = useRuntimeConfig();
  const apiBase = config.public.apiBase || 'https://api.medalbank.com';

  const apiClient = axios.create({
    baseURL: apiBase,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    timeout: 10000
  });

  return {
    async getRecordList(filter: RecordFilter = {}): Promise<ServerListResponse<any>> {
      try {
        const response = await apiClient.post(`${_URL}`, filter);
        return response.data as ServerListResponse<any>;
      } catch (error: any) {
        console.error('getRecordList 오류:', error);
        return {
          message: error.response?.data?.message || '기록(records) 목록을 불러오는데 실패했습니다.',
          count: 0,
          data: []
        };
      }
    },
    // 대한수영연맹 신기록 페이지를 읽어 DB 와 비교 (DB 는 변경하지 않음). 14페이지를 읽어 시간이 걸린다.
    async checkKorswim(): Promise<ServerListResponse<any> & { crawled?: number; failed?: any[] }> {
      try {
        const response = await apiClient.post(`${_URL}/korswim/check`, {}, { timeout: 120000 });
        return response.data;
      } catch (error: any) {
        console.error('checkKorswim 오류:', error);
        return {
          message: error.response?.data?.message || '수영연맹 신기록을 불러오는데 실패했습니다.',
          count: 0,
          data: []
        };
      }
    },

    // 선택한 기록(key)만 DB 에 반영
    async applyKorswim(keys: string[]): Promise<ServerListResponse<any>> {
      try {
        const response = await apiClient.post(`${_URL}/korswim/apply`, { keys }, { timeout: 120000 });
        return response.data;
      } catch (error: any) {
        console.error('applyKorswim 오류:', error);
        return {
          message: error.response?.data?.message || '신기록 업데이트에 실패했습니다.',
          count: 0,
          data: []
        };
      }
    },

    // World Aquatics 세계/올림픽/아시아 기록을 읽어 DB 와 비교 (DB 는 변경하지 않음)
    async checkWa(): Promise<ServerListResponse<any> & { crawled?: number; failed?: any[] }> {
      try {
        const response = await apiClient.post(`${_URL}/wa/check`, {}, { timeout: 120000 });
        return response.data;
      } catch (error: any) {
        console.error('checkWa 오류:', error);
        return {
          message: error.response?.data?.message || 'World Aquatics 기록을 불러오는데 실패했습니다.',
          count: 0,
          data: []
        };
      }
    },

    async applyWa(keys: string[]): Promise<ServerListResponse<any>> {
      try {
        const response = await apiClient.post(`${_URL}/wa/apply`, { keys }, { timeout: 120000 });
        return response.data;
      } catch (error: any) {
        console.error('applyWa 오류:', error);
        return {
          message: error.response?.data?.message || '신기록 업데이트에 실패했습니다.',
          count: 0,
          data: []
        };
      }
    },

    // 직접 입력한 기록의 형식을 검사하고 DB 와 비교해 갱신 여부(신규/갱신/정정/정보변경)를 받는다. DB 는 변경하지 않는다.
    async checkManual(records: any): Promise<ManualResult & { unchanged?: number }> {
      try {
        const response = await apiClient.post(`${_URL}/manual/check`, { records }, { timeout: 60000 });
        return response.data;
      } catch (error: any) {
        const data = error.response?.data;
        return {
          message: data?.message || '직접입력 기록을 확인하는데 실패했습니다.',
          count: 0,
          data: [],
          errors: data?.errors,
        };
      }
    },

    // 직접 입력한 JSON 기록: 서버가 형식을 검사해 오류가 있으면 errors 를 돌려주고, 이상이 없으면 바로 반영한다.
    //   original 을 주면 표의 행 수정: original(수정 전 key)의 기록을 records[0] 내용으로 바꾼다.
    //   keys 를 주면 비교 결과 중 그 key(종류|성별... 형식) 기록만 반영한다.
    async applyManual(records: any, original?: RecordKey, keys?: string[]): Promise<ManualResult> {
      try {
        const body: Record<string, any> = { records };
        if (original) body.original = original;
        if (keys) body.keys = keys;
        const response = await apiClient.post(`${_URL}/manual`, body, { timeout: 60000 });
        return response.data;
      } catch (error: any) {
        const data = error.response?.data;
        return {
          message: data?.message || '직접입력 기록을 반영하는데 실패했습니다.',
          count: 0,
          data: [],
          errors: data?.errors,
        };
      }
    },
  };
};

const recordApi = {
  getRecordList: async (filter: RecordFilter = {}): Promise<ServerListResponse<any>> => {
    return createRecordApi().getRecordList(filter);
  },
  checkKorswim: async () => createRecordApi().checkKorswim(),
  applyKorswim: async (keys: string[]) => createRecordApi().applyKorswim(keys),
  checkWa: async () => createRecordApi().checkWa(),
  applyWa: async (keys: string[]) => createRecordApi().applyWa(keys),
  checkManual: async (records: any) => createRecordApi().checkManual(records),
  applyManual: async (records: any, original?: RecordKey, keys?: string[]) => createRecordApi().applyManual(records, original, keys),
};

export default recordApi;
