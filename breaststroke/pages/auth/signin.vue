<template>
  <TheSection title="메달뱅크닷컴 로그인" :narrow="true">
    <div class="aiden-signin">
      <!-- 에러 메시지 표시 -->
      <div v-if="authStore.error" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
        {{ authStore.error }}
      </div>

      <form @submit.prevent="handleLogin">
        <!-- 선수번호 입력 필드 -->
        <div class="mb-4">
          <label for="athleteID" class="block text-gray-700 text-sm font-bold mb-2">선수번호</label>
          <input id="athleteID" v-model="email" type="athleteID" class=" appearance-none border  w-full py-2 px-3 text-gray-700 leading-tight " placeholder="선수번호를 입력하세요" required />
        </div>

        <!-- 이메일 입력 필드 -->
        <!-- <div class="mb-4">
          <label for="email" class="block text-gray-700 text-sm font-bold mb-2">이메일</label>
          <input id="email" v-model="email" type="email"
            class=" appearance-none border  w-full py-2 px-3 text-gray-700 leading-tight " placeholder="이메일 주소를 입력하세요"
            required />
        </div> -->

        <!-- 비밀번호 입력 필드 -->
        <div class="mb-6">
          <label for="password" class="block text-gray-700 text-sm font-bold mb-2">비밀번호</label>
          <input id="password" v-model="password" type="password" class=" appearance-none border  w-full py-2 px-3 text-gray-700 leading-tight " placeholder="비밀번호를 입력하세요" required />
        </div>

        <!-- 자동 로그인 체크박스 -->
        <div class="mb-6">
          <label class="flex items-center">
            <input type="checkbox" v-model="rememberMe" class="mr-2" />
            <span class="text-sm">자동 로그인</span>
          </label>
        </div>

        <!-- 로그인 버튼 -->
        <div class="button-group-filters">
          <div class="flex items-center justify-between">
            <button type="submit" class="button-group-filters-selected  " :disabled="authStore.isLoading">
              {{ authStore.isLoading ? '로그인 하는 중' : '로그인' }}
            </button>
          </div>
        </div>
      </form>

      <div class="mt-6">
        <button type="button" @click="clickForgetPassword" class="appearance-none bg-transparent border-none p-0 m-0 text-blue-500 hover:text-blue-800 hover:underline cursor-pointer">
          비밀번호를 잊으셨나요?
        </button>
      </div>

      <div class="mt-2">
        <button type="button" @click="() => $router.push('/auth/signup')" class="appearance-none bg-transparent border-none p-0 m-0 text-blue-500 hover:text-blue-800 hover:underline cursor-pointer">
          아직 계정이 없으신가요?
        </button>
      </div>
    </div>
  </TheSection>
  
  <TheTooltipDialog :show="showTooltip" :message="errorMessage" @update:show="showTooltip = false" />
</template>
<!-- ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ -->
<!-- ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ -->
<!-- ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ -->
<!-- ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ -->
<!-- ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ -->
<!-- ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ -->
<!-- ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ -->
<!-- ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ -->
<!-- ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ -->
<!-- ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ -->

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '~/stores/useAuthStore';

import TheSection from '~/components/common/TheSection.vue';
import SectionLoading from '~/components/common/TheSectionLoading.vue';
import TheSpacer from '~/components/common/TheSpacer.vue';

import TheTooltipDialog from '~/components/common/TheTooltipDialog.vue';
const showTooltip = ref(false);

// 상태 및 스토어 설정
const authStore = useAuthStore();
const router = useRouter();
const route = useRoute();

// 폼 데이터
const email = ref('');
const password = ref('');
const rememberMe = ref(false);
const errorMessage = ref('');
const isLoading = ref(false);

// 리디렉션 경로 가져오기
const redirectPath = computed(() => route.query.redirect || '/');

// 로그인 핸들러
async function handleLogin() {
  if (isLoading.value) return;

  isLoading.value = true;
  errorMessage.value = '';

  try {
    // const success = await authStore.login({
    //   email: email.value,
    //   password: password.value
    // });
    // 로그인 시도
    const success = await authStore.login({
      email: email.value,
      password: password.value,
      rememberMe: rememberMe.value
    });

    if (success) {
       // 로그인이 성공적으로 완료되었습니다. 로그아웃 버튼을 누를 때까지 로그인 상태가 유지됩니다.
      // 로그인 성공 - 원래 가려던 페이지로 리디렉션
      const redirectTarget = typeof redirectPath.value === 'string'
        ? redirectPath.value
        : '/';

      router.push(redirectTarget);
    } else {
      errorMessage.value = '이메일 또는 비밀번호가 올바르지 않습니다.';
      showTooltip.value = true;
    }
  } catch (err: unknown) {
    if (err instanceof Error) {
      errorMessage.value = err.message;
    } else {
      errorMessage.value = '로그인 중 오류가 발생했습니다.';
    }
  } finally {
    isLoading.value = false;
  }
  // 로그인 시도
  // const success = await authStore.login({
  //   email: email.value,
  //   password: password.value,
  //   rememberMe: rememberMe.value
  // });

  // if (success) {
  //   // 리다이렉트 처리: 이전에 접근하려던 페이지 또는 대시보드로 이동
  //   const redirectPath = route.query.redirect as string || '/';
  //   router.push(redirectPath);
  // }
}

function clickForgetPassword() {
  showTooltip.value = true;
  errorMessage.value = "다시 회원가입을 진행하시면 원래의 계정으로 연결되며 비밀번호를 변경하실 수 있습니다.";
}
// 비밀번호 재설정 페이지로 이동
function navigateToPasswordReset() {
  router.push('/password-reset');
}

// 이미 로그인된 상태라면 대시보드로 리다이렉트
onMounted(() => {
  if (authStore.isAuthenticated) {
    router.push('/');
  }
});
</script>

<!-- ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ -->
<!-- ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ -->
<!-- ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ -->
<!-- ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ -->
<!-- ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ -->
<!-- ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ -->
<!-- ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ -->
<!-- ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ -->
<!-- ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ -->
<!-- ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ -->
<style scoped>
/* 추가 스타일링이 필요한 경우 여기에 작성 */
</style>