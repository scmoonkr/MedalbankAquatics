<template>
<!-- ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ -->
  <!-- ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ -->
  <!-- ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ -->
  <TheSection background="#ffffff,#ffffff" :narrow="true">
    <div class="aiden-signup-complete">
    <!-- 사용자 정보 상단 -->
    <!--<div class="max-w-md">
      <AthleteCard :athleteData="userInfo" />
    </div>-->

    <!-- 안내 메시지 -->
    <div class="text-[40px] font-bold pt-6 pb-2">
      <p>아직 완료되지 않았습니다.<br />로그인 아이디는 [ <span style="color:red;">{{ userInfo.athleteID }}</span> ] 입니다.<br />현재 설정된 (임시) 비밀번호는 [ <span style="color:red;">{{ userInfo.password }}</span> ] 입니다.<br />아래 비밀번호 설정 페이지를 통해 새로운 비밀번호를 설정할 수 있습니다.<br />원하는 비밀번호를 설정해주세요.</p>
    </div>

    <!-- 선수번호 정보 -->
    <div class=" py-4">
      <p class="text-gray-600 mb-2">선수번호</p>
      <h2 class="text-6xl font-bold">#{{ userInfo.athleteID }}</h2>
    </div>

    <!-- 비밀번호 입력 폼 -->
    <div class=" py-4 space-y-4">
      <!-- 비밀번호 입력 -->
      <div class="relative">
        <input
          :type="showPassword ? 'text' : 'password'"
          v-model="password"
          class="w-full p-4 border border-gray-300 rounded-lg pr-12"
          placeholder="비밀번호" />
        <!-- <button class="absolute right-4 top-4 text-gray-400">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </button> -->
        <button 
          type="button"
          class="absolute right-3 mt-0 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
          @click="showPassword = !showPassword">
          <!-- 보이는 눈 아이콘 (비밀번호가 보일 때) -->
          <svg v-if="showPassword" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <!-- <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /> -->
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
          <!-- 가려진 눈 아이콘 (비밀번호가 숨겨질 때) -->
          <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
          </svg>
        </button>
      </div>

      <!-- 비밀번호 확인 -->
      <div class="relative">
        <input v-model="confirmPassword" type="password" class="w-full p-4 border border-gray-300 rounded-lg pr-12"
          placeholder="비밀번호 확인" />
        <button class="absolute right-4 top-4 text-gray-400">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </button>
      </div>

      <!-- 비밀번호 규칙 안내 -->
      <div class="text-xs text-gray-500 mt-2 space-y-1">
        <p>※ 비밀번호는 영문, 숫자, 특수문자를 조합하여 10자리 이상으로 입력해주세요.</p>
        <p>※ 아이디와 같은 비밀번호나 주민등록번호, 생일, 전화번호 등 타인이 알기 쉬운 정보와 연관된 숫자, 연속된 숫자, 동일하게 반복된 숫자 등 다른 사람이 쉽게 알아낼 수 있는 비밀번호는 사용하지
          않도록 주의하여 주시기 바랍니다.</p>
      </div>

      <!-- 비밀번호 제출 버튼 -->
      <!-- <button @click="completeSignup"
        class="w-full bg-gray-200 text-gray-600 p-4 rounded-lg mt-4 hover:bg-gray-300 transition"
        :disabled="!isFormValid">
        <span class="font-medium">다음 단계로 가시려면 비밀번호 입력 후 여기를 눌러주세요</span>
      </button> -->
      <button @click="completeSignup"
        class="w-full bg-gray-200 text-gray-600 p-4 rounded-lg mt-4 hover:bg-gray-300 transition"
        >
        <span class="font-medium">회원가입을 완료하시려면 비밀번호 입력 후 여기를 눌러주세요.</span>
      </button>

      <!-- 안내 메시지 -->
      <div class="bg-gray-100 p-4 rounded-lg mt-8 text-sm text-gray-600 space-y-2">
        <p>※ 선수번호는 앞으로 메달뱅크닷컴 이용시 사용되는 고유번호 이며 변경이 불가합니다. 추후 아이디가 기억나지 않는다면, 메인화면에서 본인 이름을 검색해보세요.</p>
        <p>※ 비밀번호를 잊었거나, 수정을 희망한다면, 다시 선수등록(회원가입) 바로 들어 처음과 같이 반복해서 진행하시면 현재 사용중인 고유번호와 상태 그대로 다시 연결됩니다.</p>
        <p>※ 비밀번호를 타인에게 알려주지마세요. 로그인 상태는 로그아웃할 때까지 유지됩니다.</p>
      </div>
    </div>

  </div>

  <!-- 두 번째 이미지를 표현하는 컴포넌트 (Image 2) -->
  <!-- <div class="max-w-3xl mx-auto mt-8">
    <div class="relative w-full rounded-lg overflow-hidden">
      <img :src="profileBgImage" alt="수영장 배경" class="w-full aspect-square object-cover" />

      <div class="absolute top-8 left-8 text-black">
        <h2 class="text-3xl font-bold">문성중<span class="text-gray-600">#23</span></h2>
        <p class="mb-2">마스터즈 수영선수</p>

        <div class="flex space-x-2 mb-2">
          <div class="w-8 h-8 rounded-full bg-yellow-300 flex items-center justify-center">3</div>
          <div class="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">7</div>
          <div class="w-8 h-8 rounded-full bg-yellow-300 flex items-center justify-center">3</div>
        </div>

        <p>2025년 03월 15일 월요일 기준</p>
      </div>

      <div class="absolute top-8 right-0 bg-black text-white p-2 h-40 flex items-center">
        <span class="writing-vertical text-sm font-bold tracking-wider">MEDALBANK</span>
      </div>
    </div>
  </div> -->
  </TheSection>
  <TheTooltipDialog :show="showTooltip" :message="message" @update:show="showTooltip = false" />
  
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
<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '~/stores/useAuthStore';
import { usePageNavigation } from '~/composables/usePageNavigation';

import TheTooltipDialog from '~/components/common/TheTooltipDialog.vue';
import TheSection from '~/components/common/TheSection.vue';
import AthleteCard from '~/components/AthleteCard.vue';

// 상태 및 스토어 설정
const authStore = useAuthStore();

const route = useRoute()
const router = useRouter()
const registrationNo = route.params.registrationNo || '1'

// 상태 관리
const showPassword = ref(false);
const message = ref('');
const showTooltip = ref(false);
const userInfo = ref({
  name: '문성태',
  registrationNo: registrationNo,
  athleteID: 1,
  featured: 'https://i.ibb.co/4gtF7Cz1/athlete-23-featured.jpg'
})

// 두 번째 이미지용 배경 이미지
const profileBgImage = ref('https://images.unsplash.com/photo-1600965962101-232d23c2efcb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1280&h=1280&q=80')

const password = ref('')
const confirmPassword = ref('')
const isLoading = ref(false)
const error = ref(null)

// 비밀번호 유효성 검사 (10자 이상, 영문+숫자+특수문자)
const isPasswordValid = computed(() => {
  const regex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{10,}$/
  return regex.test(password.value)
})

// 비밀번호 일치 여부 확인
const passwordsMatch = computed(() =>
  password.value && confirmPassword.value && password.value === confirmPassword.value
)

// 폼 유효성 검사
const isFormValid = computed(() =>
  isPasswordValid.value && passwordsMatch.value
)

// 사용자 정보 조회
const fetchUserInfo = async () => {
  isLoading.value = true
  error.value = null

  try {
    // 실제 API 연동 전 테스트용 더미 데이터
    await authStore.getUserByRegistrationNo(registrationNo);
    userInfo.value = authStore.userInfo;
  } catch (err) {
    console.error('사용자 정보 조회 오류:', err)
    error.value = '사용자 정보를 불러오는 중 오류가 발생했습니다.'
    isLoading.value = false
  }
}

// 회원가입 완료 처리
const completeSignup = async () => {
  const regex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{10,}$/
  if (!regex.test(password.value)) {
    message.value = "비밀번호는 영문, 숫자, 특수문자를 조합하여 10자리 이상으로 입력해주세요.";
    showTooltip.value = true;
    return;
  }

  if (password.value !== confirmPassword.value) {
    message.value = "비밀번호가 다릅니다!!!";
    showTooltip.value = true;
    return;
  }
  // if (!isFormValid.value) return

  isLoading.value = true

  try {
    const params = {
      registrationNo: registrationNo,
      password: password.value,
    };
    await authStore.setPasswordByRegistrationNo(params);
    alert("비밀번호가 설정되었습니다");
    router.push('/auth/signin');
    // 테스트용 타임아웃
    // setTimeout(() => {
    //   // 회원가입 완료 후 로그인 페이지로 이동
    //   router.push({
    //     path: '/auth/signin',
    //     query: {
    //       registrationNo,
    //       signupComplete: 'true'
    //     }
    //   })
    //   isLoading.value = false
    // }, 1000)
  } catch (err) {
    console.error('회원가입 완료 오류:', err)
    error.value = '회원가입 완료 처리 중 오류가 발생했습니다.'
    isLoading.value = false
  }
}

// 컴포넌트 마운트 시 사용자 정보 조회
onMounted(() => {
  fetchUserInfo()
})
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
.writing-vertical {
  writing-mode: vertical-rl;
  text-orientation: mixed;
  letter-spacing: 2px;
}

/* 두 번째 이미지를 위한 스타일 */
.aspect-square {
  aspect-ratio: 1 / 1;
}
</style>