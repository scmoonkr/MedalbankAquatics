<template>
  <!-- 검색 섹션 -->
  <TheSection :title="form.title" :subtitle="form.titleEng" background="#ffffff,#ffffff" :narrow="true">


    <img :src="form.featured" class="w-[400px] h-[400px]" />

    <TheSpacer />

    <div class="text-sm">{{ form.subtitle }}</div>
    <div class="text-sm mt-2">{{ form.description }}</div>

    <TheSpacer />


    <div class="button-group-filters">
      <div class="flex items-center justify-between">
        <a :href="form.url" class="button-group-filters-selected">
          더 둘러보기
        </a>
      </div>
    </div>


    <!--<div>{{ form.itemID }}</div>
    <div>{{ form.type }}</div>
    <div>{{ form.category }}</div>
    <div>{{ form.type }}</div>
    <div>{{ form.brand }}</div>
    <div>{{ form.title }}</div>
    <div>{{ form.titleEng }}</div>
    <div>{{ form.url }}</div>
    <div>{{ form.featured }}</div>-->

    <TheSpacer />

    <div class="grid grid-cols-1 gap-[20px]">
      <div v-for="(image, index) in form.images" :key="index">
        <img :src="image" :alt="image" class="w-full h-full object-cover" loading="lazy" />
      </div>
    </div>

    <TheSpacer />

    <div class="button-group-filters">
      <div class="flex items-center justify-between">
        <a :href="form.url" class="button-group-filters-selected">
          더 둘러보기
        </a>
      </div>
    </div>


  </TheSection>
</template>

<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router';
import { type Item } from '~/types/items';
import { useItemStore } from '~/stores/items';
import { ItemModel } from '~/models/items';
import type { JsonOptions, FilterItem } from '@/types/common';
import TheSection from '@/components/common/TheSection.vue';
import TheSpacer from '~/components/common/TheSpacer.vue';
import FiltersButtons from '@/components/common/TheFilters.vue';


definePageMeta({
  layout: 'simplified'
});

const route = useRoute();
const router = useRouter();
const config = useRuntimeConfig()

const itemStore = useItemStore();

// 클라이언트에서만 스토어 초기화
const isStoreReady = ref(false);

// 필터 관련 상태
const showTooltip = ref(false);

// DOM 참조
const fileInputFeatured = ref<HTMLInputElement>();
const selectedFile = ref<File | null>(null);

// 대회 관련 상태

// 필터 설정
const filters = ref<FilterItem[]>([
  { field: 'type', selected: 'Originals', options: ['Originals', 'Studio', "Lab", "Recommendations"] },
  { field: 'brand', selected: 'Medalbank', options: ['Medalbank', 'FrogSpit', 'SportCount', 'SAMMY', "Speedo", "Arena"] },
  { field: 'category', selected: 'Meshcaps', options: ['Meshcaps', 'Collections'] },
]);

const isLoading = ref(false);
const form = ref<Partial<ItemModel>>({
  itemID: 0,
  title: '',
  titleEng: '',
  subtitle: '',
  category: '',
  brand: '',
  type: '',
  url: '',
  description: '',
  featured: '',
  images: []
});

// ===== SSR에서 데이터 로딩 =====
const itemID = parseInt(route.params.itemID as string, 10)

// 서버에서 선수 데이터 가져오기 (기존 API 활용)
try {
  // 기존 API 엔드포인트 사용
  const response = await $fetch(`${config.public.apiBase}/items`, {
    method: 'POST',
    body: { itemID: itemID }
  })
console.log("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ response: ", response);
  if ((response as any).data && typeof (response as any).data === 'object') {
    form.value = ItemModel.fromJSON((response as any).data);
console.log("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~form.value: ", form.value);
  } else {
    throw new Error((response as any).message || 'item 정보를 찾을 수 없습니다.')
  }
} catch (error) {
  console.error('SSR Item 데이터 로딩 실패:', error)
  throw createError({
    statusCode: 404,
    statusMessage: 'Item not found'
  })
}


// ===== SSR 메타 태그 설정 =====
if (form.value.title) {
  // 절대 URL로 변환
  const absoluteImageUrl = form.value.featured;

  const pageTitle = `${form.value.title} | ${form.value.subtitle}`
  const pageDescription = `${form.value.description}`
  const pageUrl = `https://medalbank.com/item/${form.value.itemID}`
  console.log(`pageTitle=${pageTitle}, pageDescription=${pageDescription}, pageUrl=${pageUrl}`);

  // useSeoMeta 사용
  useSeoMeta({
    title: pageTitle,
    ogTitle: pageTitle,
    description: pageDescription,
    ogDescription: pageDescription,
    ogImage: absoluteImageUrl,
    ogImageWidth: 1200,
    ogImageHeight: 630,
    ogUrl: pageUrl,
    ogType: 'profile',
    ogSiteName: 'Medalbank',

    // Twitter Card
    twitterCard: 'summary_large_image',
    twitterTitle: pageTitle,
    twitterDescription: pageDescription,
    twitterImage: absoluteImageUrl,

    // 추가 메타 태그
    author: 'Medalbank',
    keywords: `${pageTitle}`,
    robots: 'index, follow',

    // 카카오톡을 위한 추가 태그
    ogImageAlt: `${pageTitle}`,
  })

  // useHead로 추가 설정
  useHead({
    title: pageTitle,
    meta: [
      // 기본 메타 태그
      { name: 'description', content: pageDescription },
      { name: 'keywords', content: `${pageTitle}` },
      { name: 'author', content: 'Medalbank' },

      // Open Graph
      { property: 'og:type', content: 'profile' },
      { property: 'og:title', content: pageTitle },
      { property: 'og:description', content: pageDescription },
      { property: 'og:image', content: absoluteImageUrl },
      { property: 'og:image:width', content: '1200' },
      { property: 'og:image:height', content: '630' },
      { property: 'og:url', content: pageUrl },
      { property: 'og:site_name', content: 'Medalbank' },

      // Twitter Card
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:title', content: pageTitle },
      { name: 'twitter:description', content: pageDescription },
      { name: 'twitter:image', content: absoluteImageUrl },

      // 모바일 최적화
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { name: 'theme-color', content: '#3B82F6' },

      // 검색 엔진 최적화
      { name: 'robots', content: 'index, follow' },
      { name: 'googlebot', content: 'index, follow' },
    ],

    // 구조화된 데이터 (JSON-LD)
    script: [
      {
        type: 'application/ld+json',
        children: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'Person',
          name: pageTitle,
          image: absoluteImageUrl,
          description: pageDescription,
          url: pageUrl,
          nationality: '대한민국',
          jobTitle: '수영선수',
          sport: '수영',
          worksFor: {
            '@type': 'Organization',
            name: '메달뱅크'
          },
          knowsAbout: ['수영', '경영', '스포츠'],
          sameAs: [pageUrl]
        })
      }
    ],

    // 추가 링크 태그
    link: [
      { rel: 'canonical', href: pageUrl },
      { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
      { rel: 'apple-touch-icon', href: '/apple-touch-icon.png' }
    ]
  })
}




// ============================
// 스토어 및 상태 관리 (반응성 수정)
// ============================
///########################################################
/// 컴포넌트 로딩 시 데이터 가져오기
///########################################################
async function loadServerData() {
  isLoading.value = true;
  try {
    isLoading.value = true;

    form.value.itemID = Number(route.params.itemID);

    await itemStore.fetchItemById(form.value.itemID);
    form.value = itemStore.currentItem as ItemModel;
    if (form.value.featured) {
      form.value.featured = getImageURL(form.value.featured);
    }
    if (form.value.thumb) {
      form.value.thumb = getImageURL(form.value.thumb);
    }
    console.log("items.loadData", form.value);
    filters.value[0].selected = form.value.type!;
    filters.value[1].selected = form.value.brand!;
    filters.value[2].selected = form.value.category!;
    isLoading.value = false;
  } catch (error) {
    console.error("데이터 로드 오류:", error);
  } finally {
    isLoading.value = false;
  }
}

// 컴포저블 함수 사용
// history back시 onMount 처리
// usePageNavigation(loadServerData);


onMounted(() => {
  // form.value = {
  //   itemID: 1,
  //   title: '수모 title...',
  //   subtitle: 'subtitle...',
  //   category: 'category3',
  //   brand: 'brand2',
  //   type: '수모',
  //   url: '11111111',
  //   description: 'description.....',
  //   featured: 'https://i.ibb.co/pBSNnPWS/aiden-1362-breaststroke-DSCF0814-jpg.jpg',
  //   images: [
  //     'https://i.ibb.co/bYDb3Hh/aiden-1362-breaststroke-DSCF0815-jpg.jpg',
  //     'https://i.ibb.co/bYDb3Hh/aiden-1362-breaststroke-DSCF0815-jpg.jpg',
  //     'https://i.ibb.co/1jnpmT3/aiden-1362-breaststroke-DSCF0818-jpg.jpg',
  //     'https://i.ibb.co/gZPr2jvs/aiden-1362-breaststroke-DSCF0826-jpg.jpg',
  //     'https://i.ibb.co/h1xkKmm5/aiden-1362-breaststroke-DSCF0827-jpg.jpg',
  //     'https://i.ibb.co/TqPvZKFN/aiden-1362-breaststroke-DSCF0829-jpg.jpg',
  //     'https://i.ibb.co/dwMWsWZZ/aiden-1362-breaststroke-DSCF0830-jpg.jpg',
  //     'https://i.ibb.co/7NNWhRHY/aiden-1362-breaststroke-DSCF0836-jpg.jpg',
  //     'https://i.ibb.co/hhYP7Kb/aiden-1362-breaststroke-DSCF0838-jpg.jpg',
  //     'https://i.ibb.co/JFdHYLKf/aiden-1362-breaststroke-DSCF0839-jpg.jpg',
  //   ]
  // };
  // filters.value[0].selected = form.value.type!;
  // filters.value[1].selected = form.value.brand!; 
  // filters.value[2].selected = form.value.category!; 

  // Nuxt 3에서는 onMounted가 클라이언트에서만 실행되므로 process.client 체크 불필요

  try {
    // imageBBStore = useImageBBStore();
    // competitionStore = useCompetitionStore();
  } catch (error) {
    console.error('스토어 초기화 실패:', error);
  }
});

// ============================
// 계산된 값들 (반응성 수정)
// ============================
const onFilterChange = (field: string, value: string) => {
  console.log("onFilterChange.", field, value);
  switch (field) {
    case "type": form.value.type = value; break;
    case "brand": form.value.brand = value; break;
    case "category": form.value.category = value; break;
  }
}
const clickClear = () => {
  form.value = {
    itemID: 0,
    title: '',
    titleEng: '',
    subtitle: '',
    category: '',
    brand: '',
    type: '',
    url: '',
    description: '',
    featured: '',
    images: []
  }
}
const clickSave = async () => {
  console.log("clickSave", form.value);
  try {
    const itemID = await itemStore.saveWithImage(form.value as Item, selectedFile.value as File);
    form.value.itemID = itemID;
  } catch (error) {
    console.error('이미지 저장 오류:', error)
  }

}

function triggerFileSelect() {
  if (fileInputFeatured.value) {
    fileInputFeatured.value.click()
  }
}
// ===== 이벤트 핸들러들 (기존 로직 유지) =====
async function handleImageChange(event: Event) {

  const target = event.target as HTMLInputElement
  selectedFile.value = target.files?.[0]!;
  if (selectedFile.value) {
    const reader = new FileReader()
    reader.onload = () => {
      form.value.featured = reader.result as string
    }
    reader.readAsDataURL(selectedFile.value)
    // form.featured = featured.value as string
  }

  try {
    // const imageUrl = await athleteStore.uploadAthleteImage(
    //   authStore.currentUser?.userID,
    //   selectedFile!,
    //   "featured",
    //   authStore.currentUser.userID,
    // )

    if (form.value.featured) {
      form.value.featured = getImageURL(form.value.featured);
      showTooltip.value = true;
    }
  } catch (error: any) {
    console.error('이미지 저장 오류:', error)
  }
}


</script>

<style scoped></style>