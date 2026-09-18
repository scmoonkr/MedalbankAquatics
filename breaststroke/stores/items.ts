// stores/itemStore.ts
import { defineStore } from 'pinia';
import { ItemModel, CollectionModel } from '~/models/items';
import itemApi from '~/api/itemsApi';
import { type ItemFilter, type Item, type Collection, type ItemList, type ItemSortField, ItemSort } from '~/types/items';
import { SortDirection } from '~/types/common';
import UI_CONFIG from '~/config/ui';
import type { PaginationOptions } from '~/types/common';

interface ItemsState {
  items: ItemModel[];
  selectedItem: ItemModel | null;
  isLoading: boolean;
  error: string | null;
  filters: ItemFilter;
}

export const useItemStore = defineStore('item', () => {
  // State
  const currentItem = ref<ItemModel | null>(null);
  const itemList = ref<ItemModel[]>([]);
  const collection = ref<{ [key: string]: ItemModel[] }>({});
  const collections = ref<CollectionModel[]>([]);
  const searchNames = ref<ItemList>([]);
  const isLoading = ref(false);
  const error = ref<string | null>(null);
  const rowsPerPage = ref<number | null>(5);
  const filter = ref<ItemFilter>({
    title: '',
    type: '',
    brand: '',
    itemID: 0,
    sortField: 'type',
    sortDirection: 'asc',
  });
  const sortField = ref<ItemSortField>(ItemSort.TITLE);
  const sortDirection = ref<SortDirection>(SortDirection.ASC);
  const pagination = ref<PaginationOptions>({
    currentPage: 1,
    rowsPerPage: UI_CONFIG.rowsPerPage,
    totalItems: 0,
    totalPages: 0
  });

  // Getters
  const filteredItemList = computed(() => {
    let filtered = [...itemList.value];

    // 제목 필터
    if (filter.value.title) {
      const searchTitle = filter.value.title.toLowerCase();
      filtered = filtered.filter(item =>
        item.title.toLowerCase().includes(searchTitle)
      );
    }

    // 브랜드 필터
    if (filter.value.brand) {
      filtered = filtered.filter(item => item.brand === filter.value.brand);
    }

    // 유형 필터
    if (filter.value.type) {
      filtered = filtered.filter(item => item.type === filter.value.type);
    }

    // 성별 필터
    // if (filter.value.gender) {
    //   filtered = filtered.filter(item => item.gender === filter.value.gender);
    // }

    // 가격 필터 (최소)
    if (filter.value.minPrice !== undefined) {
      filtered = filtered.filter(item => item.price >= filter.value.minPrice!);
    }

    // 가격 필터 (최대)
    if (filter.value.maxPrice !== undefined) {
      filtered = filtered.filter(item => item.price <= filter.value.maxPrice!);
    }

    // 상품 ID 필터
    if (filter.value.itemID !== undefined && filter.value.itemID > 0) {
      filtered = filtered.filter(item => item.itemID === filter.value.itemID);
    }

    // 검색어 필터
    if (filter.value.search) {
      const query = filter.value.search.toLowerCase();
      filtered = filtered.filter(item =>
        item.title.toLowerCase().includes(query) ||
        item.brand.toLowerCase().includes(query) ||
        item.type.toLowerCase().includes(query) ||
        item.category.toLowerCase().includes(query)
      );
    }

    return filtered;
  });

  const paginatedItemList = computed(() => {
    const start = (pagination.value.currentPage - 1) * pagination.value.rowsPerPage;
    const end = start + pagination.value.rowsPerPage;
    return filteredItemList.value.slice(start, end);
  });

  // Actions
  // 1. 단일 아이템 조회
  async function fetchItemById(id: number): Promise<void> {
    try {
      isLoading.value = true;
      error.value = null;

      const response = await itemApi.fetchItemApi(id);

      if (response.data && typeof response.data === 'object') {
        currentItem.value = ItemModel.fromJSON(response.data);
      } else {
        error.value = response.message || '상품 정보를 불러오는데 실패했습니다.';
      }
    } catch (err: any) {
      error.value = err.message || '상품 정보를 불러오는데 실패했습니다.';
    } finally {
      isLoading.value = false;
    }
  }

  async function saveWithImage(item: Item, imageFile: File): Promise<number> {
    try {

      const response = await itemApi.saveWithImageApi(item, imageFile);

      return response.data.itemID;
    } catch (error: any) {
      return 0;
    }
  }

  // 3. 아이템 목록 조회
  async function fetchItemList(page = 1, limit = 20): Promise<void> {
    try {
      isLoading.value = true;
      error.value = null;

      const response = await itemApi.fetchItemListApi({
        page,
        limit: rowsPerPage.value ?? 5,
        ...filter.value,
        sortField: sortField.value,
        sortDirection: sortDirection.value
      });

      if (response.data && Array.isArray(response.data)) {
        itemList.value = response.data.map((item: any) => ItemModel.fromJSON(item));
        // 페이지네이션 정보 업데이트
        pagination.value = {
          currentPage: page,
          rowsPerPage: limit,
          totalItems: response.count || 0,
          totalPages: Math.ceil((response.count || 0) / limit)
        };
      } else {
        error.value = response.message || '상품 목록을 불러오는데 실패했습니다.';
      }
    } catch (err: any) {
      error.value = err.message || '상품 목록을 불러오는데 실패했습니다.';
    } finally {
      isLoading.value = false;
    }
  }

  // 3. 아이템 목록 조회
  async function fetchCollection(slug: string): Promise<void> {
    try {
      isLoading.value = true;
      error.value = null;

      const response = await itemApi.fetchCollectionApi(slug);

      if (response.data && Array.isArray(response.data)) {
        itemList.value = response.data.map((item: any) => ItemModel.fromJSON(item));
      } else {
        error.value = response.message || '상품 목록을 불러오는데 실패했습니다.';
      }
    } catch (err: any) {
      error.value = err.message || '상품 목록을 불러오는데 실패했습니다.';
    } finally {
      isLoading.value = false;
    }
  }

  // 3. 아이템 목록 조회
  async function fetchCollectionList(collection: string): Promise<void> {
    console.log("fetchCollectionList");
    try {
      isLoading.value = true;
      error.value = null;

      const response = await itemApi.fetchCollectionListApi(collection);
console.log("response.data=", response.data);
      if (response.data && Array.isArray(response.data)) {
        collections.value = response.data.map((item: any) => CollectionModel.fromJSON(item));
      } else {
        error.value = response.message || '상품 목록을 불러오는데 실패했습니다.';
      }
    } catch (err: any) {
      error.value = err.message || '상품 목록을 불러오는데 실패했습니다.';
    } finally {
      isLoading.value = false;
    }
  }

  // 6. 아이템 삭제
  async function deleteItem(itemID: number): Promise<boolean> {
    try {
      isLoading.value = true;
      error.value = null;

      const response = await itemApi.deleteItemApi(itemID);

      if (response.data || response.message?.includes('성공')) {
        // 목록에서 해당 아이템 제거
        itemList.value = itemList.value.filter(item => item.itemID !== itemID);

        // 현재 아이템이 삭제된 아이템인 경우 null로 설정
        if (currentItem.value && currentItem.value.itemID === itemID) {
          currentItem.value = null;
        }

        return true;
      } else {
        error.value = response.message || '상품 삭제에 실패했습니다.';
        return false;
      }
    } catch (err: any) {
      error.value = err.message || '상품 삭제에 실패했습니다.';
      return false;
    } finally {
      isLoading.value = false;
    }
  }

  // 반환 객체에 모든 상태와 함수를 포함
  return {
    currentItem,
    itemList,
    collection,
    collections,
    searchNames,
    isLoading,
    pagination,
    filter,
    error,
    filteredItemList,
    paginatedItemList,

    // 함수들 명시적으로 반환
    saveWithImage,
    fetchItemList,
    fetchCollection,
    fetchCollectionList,
    fetchItemById,
    deleteItem
  };
});