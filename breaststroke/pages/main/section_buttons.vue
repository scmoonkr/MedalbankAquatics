<template>
<TheSection title="선수정보" subtitle="리더보드 및 각종 랭킹차트에서 활용되는 선수정보입니다. 선수정보를 개인화할 수 있습니다. 선수등록(회원가입) 후 이용 가능합니다." tooltip="여기에서 업로드 하는 사진은 리더보드와 각종 랭킹차트에서 활용될 수 있으며 다른 선수들이 관람할 수 있습니다. 개인 경기실적 페이지의 프로필 사진과도 연동됩니다. 등록되지 않은 선수는 각종 랭킹에서 '미등록'으로 표시되고, 이곳에서 선수등록을 하거나 선수사진을 등록하는 것은 필수사항이 아닙니다.">
	<div class="flex gap-[20px]">
      <button
        class="button-main-page"
        :style="authStore.isAuthenticated && featured ? `background-image: url('${featured}'); background-size: cover; background-position: center;` : ''"
        @click="authStore.isAuthenticated ? triggerFileSelect() : showTooltipSigninNeeded = true"
      >
        <div class="button-main-page-text">
          프로필 사진<br />선택/변경
        </div>
        <input
          ref="fileInput"
          type="file"
          accept="image/*"
          class="hidden"
          @change="handleImageChange"
        />
      </button>

      <!-- <button v-if="authStore.isAuthenticated" class="button-main-page">내 경기실적 보기</button> -->

      <button class="button-main-page" @click="showTooltipUserGuide = true">
        <div class="button-main-page-text">
          메달뱅크닷컴<br />간편 매뉴얼
        </div>
      </button>

    </div>
    </TheSection>
  <TheTooltipDialogSigninNeeded :show="showTooltipSigninNeeded" message="로그인이 필요합니다." @update:show="showTooltipSigninNeeded = false" />
  <TheTooltipDialogUserGuide :show="showTooltipUserGuide" @update:show="showTooltipUserGuide = false" />

  <TheTooltipDialog :show="showTooltip" :message="errorMessage" @update:show="showTooltip = false" />
</template>



<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '~/stores/useAuthStore';
import { useAthleteStore } from '~/stores/athletes';
import TheTooltipDialogSigninNeeded from '~/components/common/TheTooltipDialog.vue';
import TheTooltipDialogUserGuide from '~/components/common/TheTooltipDialogUserGuide.vue';
import TheTooltipDialog from '~/components/common/TheTooltipDialog.vue';

import TheSection from '~/components/common/TheSection.vue';

const router = useRouter();
const config = useRuntimeConfig()
const authStore = useAuthStore();
const athleteStore = useAthleteStore()

const showTooltipSigninNeeded = ref(false);
const showTooltipUserGuide = ref(false);
const showTooltip = ref(false);
const errorMessage = ref('')

const isAuthority = ref(false)
const featured = ref('')


const fileInput = ref(null)

// getImageURL
watch(() => authStore.currentUser, (user) => {
	isAuthority.value = user?.userID! > 0
	featured.value = isAuthority.value ? `${config.public.apiBase}/cms/images/athletes/${user?.userID}/f` : '';
}, { deep: true, immediate: true }); // deep과 immediate 옵션 추가


function triggerFileSelect() {
  if (fileInput.value) {
    fileInput.value.click()
  }
}
// ===== 이벤트 핸들러들 (기존 로직 유지) =====
async function handleImageChange(event: Event) {
  if (!authStore.currentUser || authStore.currentUser.userID == 0) {
		// router.push('/auth/signin');
    return
  }
  
	const target = event.target as HTMLInputElement
	const selectedFile = target.files?.[0]
	if (selectedFile) {
		const reader = new FileReader()
		reader.onload = () => {
			featured.value = reader.result as string
		}
		reader.readAsDataURL(selectedFile)
	}

  try {
    const imageUrl = await athleteStore.uploadAthleteImage(
      authStore.currentUser?.userID,
      selectedFile!,
      "featured",
      authStore.currentUser.userID,
    )

    if (imageUrl) {
      featured.value = getImageURL(imageUrl);
      showTooltip.value = true;
      errorMessage.value = "이미지 저장에 성공했습니다.";
    } else {
    }
  } catch (error: any) {
    console.error('이미지 저장 오류:', error)
  }
}

</script>