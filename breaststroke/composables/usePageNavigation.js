// composables/usePageNavigation.js
import { onMounted, watch } from 'vue';
import { useRoute } from 'vue-router';

export function usePageNavigation(loadDataFunction) {
  const route = useRoute();

  // 초기 마운트 시 데이터 로드
  onMounted(() => {
    loadDataFunction();
  });

  // 라우트 변경 감지 시 데이터 다시 로드
  watch(
    () => route.fullPath,
    (newPath, oldPath) => {
      if (newPath !== oldPath) {
        loadDataFunction();
      }
    }
  );
}