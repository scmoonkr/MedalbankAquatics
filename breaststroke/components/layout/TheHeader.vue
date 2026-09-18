<!-- components/layout/TheHeader.vue -->
<template>
  <header>
    <!-- ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ -->
    <!-- ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ -->
    <!-- ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ -->
    <!-- 상단 네비게이션 바 - 스크롤 시 숨김 -->
    <div class="transition-transform transition-unified will-change-transform hidden lg:block" :class="{ 'transform -translate-y-full': isScrolled }">
      <div class="max-w-screen-xl container mx-auto px-4 py-2 flex justify-between items-center">
        <div class="flex space-x-2">
          <a href="https://instagram.com/medalbankaquatics/" target="_new" aria-label="Instagram" class="text-black hover:text-blue-800">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
              <path
                d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 0 1 1.772 1.153 4.902 4.902 0 0 1 1.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.214c0 2.717-.012 3.056-.06 4.122-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 0 1-1.153 1.772 4.902 4.902 0 0 1-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.214c-2.717 0-3.056-.012-4.122-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 0 1-1.772-1.153 4.902 4.902 0 0 1-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 0 1 1.153-1.772A4.902 4.902 0 0 1 5.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z">
              </path>
            </svg>
          </a>
          <a href="https://cafe.naver.com/medalbank/" target="_new" aria-label="Cafe" class="text-black hover:text-green-700">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M 12.315 2 c 2.43 0 2.784 0.013 3.808 0.06 c 1.064 0.049 1.791 0.218 2.427 0.465 a 4.902 4.902 0 0 1 1.772 1.153 a 4.902 4.902 0 0 1 1.153 1.772 c 0.247 0.636 0.416 1.363 0.465 2.427 c 0.048 1.067 0.06 1.407 0.06 4.123 v 0.214 c 0 2.717 -0.012 3.056 -0.06 4.122 c -0.049 1.064 -0.218 1.791 -0.465 2.427 a 4.902 4.902 0 0 1 -1.153 1.772 a 4.902 4.902 0 0 1 -1.772 1.153 c -0.636 0.247 -1.363 0.416 -2.427 0.465 c -1.067 0.048 -1.407 0.06 -4.123 0.06 h -0.214 c -2.717 0 -3.056 -0.012 -4.122 -0.06 c -1.064 -0.049 -1.791 -0.218 -2.427 -0.465 a 4.902 4.902 0 0 1 -1.772 -1.153 a 4.902 4.902 0 0 1 -1.153 -1.772 c -0.247 -0.636 -0.416 -1.363 -0.465 -2.427 c -0.047 -1.024 -0.06 -1.379 -0.06 -3.808 v -0.63 c 0 -2.43 0.013 -2.784 0.06 -3.808 c 0.049 -1.064 0.218 -1.791 0.465 -2.427 a 4.902 4.902 0 0 1 1.153 -1.772 A 4.902 4.902 0 0 1 5.45 2.525 c 0.636 -0.247 1.363 -0.416 2.427 -0.465 C 8.901 2.013 9.256 2 11.685 2 h 0.63 z z z z z">
              </path>
            </svg>
          </a>
          <a href="https://www.youtube.com/@medalbankaquatics" target="_new" aria-label="Smartstore" class="text-black hover:text-black/50">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M 12.315 2 c 2.43 0 2.784 0.013 3.808 0.06 c 1.064 0.049 1.791 0.218 2.427 0.465 a 4.902 4.902 0 0 1 1.772 1.153 a 4.902 4.902 0 0 1 1.153 1.772 c 0.247 0.636 0.416 1.363 0.465 2.427 c 0.048 1.067 0.06 1.407 0.06 4.123 v 0.214 c 0 2.717 -0.012 3.056 -0.06 4.122 c -0.049 1.064 -0.218 1.791 -0.465 2.427 a 4.902 4.902 0 0 1 -1.153 1.772 a 4.902 4.902 0 0 1 -1.772 1.153 c -0.636 0.247 -1.363 0.416 -2.427 0.465 c -1.067 0.048 -1.407 0.06 -4.123 0.06 h -0.214 c -2.717 0 -3.056 -0.012 -4.122 -0.06 c -1.064 -0.049 -1.791 -0.218 -2.427 -0.465 a 4.902 4.902 0 0 1 -1.772 -1.153 a 4.902 4.902 0 0 1 -1.153 -1.772 c -0.247 -0.636 -0.416 -1.363 -0.465 -2.427 c -0.047 -1.024 -0.06 -1.379 -0.06 -3.808 v -0.63 c 0 -2.43 0.013 -2.784 0.06 -3.808 c 0.049 -1.064 0.218 -1.791 0.465 -2.427 a 4.902 4.902 0 0 1 1.153 -1.772 A 4.902 4.902 0 0 1 5.45 2.525 c 0.636 -0.247 1.363 -0.416 2.427 -0.465 C 8.901 2.013 9.256 2 11.685 2 h 0.63 z z z z z">
              </path>
            </svg>
          </a>
          <a href="https://smartstore.naver.com/medalbank" target="_new" aria-label="Smartstore" class="text-black hover:text-black/50">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M 12.315 2 c 2.43 0 2.784 0.013 3.808 0.06 c 1.064 0.049 1.791 0.218 2.427 0.465 a 4.902 4.902 0 0 1 1.772 1.153 a 4.902 4.902 0 0 1 1.153 1.772 c 0.247 0.636 0.416 1.363 0.465 2.427 c 0.048 1.067 0.06 1.407 0.06 4.123 v 0.214 c 0 2.717 -0.012 3.056 -0.06 4.122 c -0.049 1.064 -0.218 1.791 -0.465 2.427 a 4.902 4.902 0 0 1 -1.153 1.772 a 4.902 4.902 0 0 1 -1.772 1.153 c -0.636 0.247 -1.363 0.416 -2.427 0.465 c -1.067 0.048 -1.407 0.06 -4.123 0.06 h -0.214 c -2.717 0 -3.056 -0.012 -4.122 -0.06 c -1.064 -0.049 -1.791 -0.218 -2.427 -0.465 a 4.902 4.902 0 0 1 -1.772 -1.153 a 4.902 4.902 0 0 1 -1.153 -1.772 c -0.247 -0.636 -0.416 -1.363 -0.465 -2.427 c -0.047 -1.024 -0.06 -1.379 -0.06 -3.808 v -0.63 c 0 -2.43 0.013 -2.784 0.06 -3.808 c 0.049 -1.064 0.218 -1.791 0.465 -2.427 a 4.902 4.902 0 0 1 1.153 -1.772 A 4.902 4.902 0 0 1 5.45 2.525 c 0.636 -0.247 1.363 -0.416 2.427 -0.465 C 8.901 2.013 9.256 2 11.685 2 h 0.63 z z z z z">
              </path>
            </svg>
          </a>
        </div>
        <div class="flex space-x-4 items-center">
          <!-- 로그인된 경우: 이름 + 로그아웃 -->
          <template v-if="isHydrated && authStore.isAuthenticated">
            <!-- <!-- <button @click="showTooltip = true" class="font-apple-m font-medium hover:font-bold text-sm">
              {{ authStore.currentUser?.name }}
            </button> -->
            <a :href="`/a/${authStore.currentUser?.userID}`" class="font-apple-m font-medium hover:font-bold text-sm">
              {{ authStore.currentUser?.name }}
            </a>
            <a href="#" @click.prevent="handleLogout" class="font-apple-m font-medium hover:font-bold text-sm">
              로그아웃
            </a> -->
          </template>

          <!-- 로그인 안 된 경우: 로그인 + 회원가입 -->
          <template v-else>
            <!-- <a href="/auth/signup" class="font-apple-m font-medium hover:font-bold text-sm">회원가입</a>
            <a href="/auth/signin" class="font-apple-m font-medium hover:font-bold text-sm">로그인</a> -->
            <a href="/athletes" class="font-apple-m font-medium hover:font-bold text-sm">선수명단</a>
            <a href="https://naver.me/5wN68EEZ" target="_new" class="font-apple-m font-medium hover:font-bold text-sm">사진변경</a>
          </template>

          <!-- 로그인 여부와 무관하게 항상 표시 -->
          <!--<button @click="showTooltip = true" class="font-apple-m font-medium hover:font-bold text-sm">
            사이트맵
          </button>-->
        </div>


      </div>
    </div>

    <!-- ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ -->
    <!-- ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ -->
    <!-- ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ -->
    <!-- 메인 로고 및 메뉴 바 - 스크롤 시 상단에 고정 -->
    <div class="transition-all transition-unified w-full z-50" :class="{
      'fixed top-0 left-0 bg-black text-white': isScrolled,
      'bg-white text-black': !isScrolled
    }"><!--#0d4fad-->
      <div class="max-w-screen-xl container mx-auto px-4 flex justify-between items-center">
        <div class="flex items-center">
          <a href="/" class="flex items-center space-x-2">
            <!-- 스크롤 안 되었을 때는 이미지 로고 -->
            <template v-if="!isScrolled">
              <img src="/images/brststrk_logo_meta_cropped_black.png" alt="평영" class="h-14 lg:h-24 transition-all duration-300" />
            </template>
            <!-- 스크롤 되었을 때는 흰 배경용 텍스트 로고 -->
            <template v-else>
              <img src="/images/brststrk_logo_meta_cropped_white.png" alt="평영" class="h-14 lg:h-24 transition-all duration-300" />
            </template>
          </a>
          <button @click="showTooltipCBT = true" class="text-xs text-gray-500 hover:text-black font-semibold align-super translate-y-[-0.4rem] px-1">CBT</button>
        </div>

        <!-- ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ -->
        <!-- ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ -->
        <!-- ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ -->
        <!-- 메인 네비게이션 -->
        <nav class="hidden lg:block py-2">
          <ul class="flex">




            <li class="group relative py-2" @mouseenter="openDropdown('leaderboard')" @mouseleave="startCloseTimer('leaderboard')">
              <a href="/leaderboards">
                <button class="flex items-center font-apple-m font-medium hover:font-bold">
                  리더보드
                </button>
              </a>
            </li>

            <li class="group relative ml-4 py-2" @mouseenter="openDropdown('leaderboard')" @mouseleave="startCloseTimer('leaderboard')">
              <a href="/olympiad">
                <button class="flex items-center font-apple-m font-medium hover:font-bold">
                  올림피아드
                </button>
              </a>
            </li>

            <li class="group relative ml-4 py-2" @mouseenter="openDropdown('records')" @mouseleave="startCloseTimer('records')">
              <a href="/hallOfFame">
                <button class="flex items-center font-apple-m font-medium hover:font-bold">
                  명예의전당

                </button>
              </a>
            </li>

          </ul>
        </nav>

        <!-- 모바일 메뉴 버튼 -->
        <button class="lg:hidden" @click="toggleMobileMenu">
          <svg xmlns="http://www.w3.org/2000/svg" style="height: 21px; width: 21px" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>
    </div>

    <!-- 스크롤 시 메인 메뉴가 고정될 때 생기는 공간 확보 -->
    <div v-if="isScrolled" :style="{ height: headerHeight + 'px' }"></div>

    <!-- ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ -->
    <!-- ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ -->
    <!-- ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ -->
    <!-- 모바일 메뉴 -->
    <div v-if="isMobileMenuOpen" class="lg:hidden fixed inset-0 bg-gray-800 bg-opacity-75 z-50" @click.self="toggleMobileMenu">
      <div class="bg-white h-full w-4/5 max-w-sm py-4 px-6 overflow-y-auto">
        <div class="flex justify-between items-center mb-6">
          <a href="/" class="flex items-center">
            <img src="/images/brststrk_logo_meta.png" alt="평영" class="h-14">
          </a>
          <button @click="toggleMobileMenu" class="text-gray-600">
            <svg xmlns="http://www.w3.org/2000/svg" style="height: 21px; width: 21px" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ -->
        <!-- ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ -->
        <!-- ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ -->
        <!-- 모바일 메뉴 항목 -->
        <nav class="space-y-1">
          <div class="py-2 border-b border-gray-200">
            <a href="/athletes" class="block py-2 font-medium">전체 선수</a>
          </div>
          <div class="py-2 border-b border-gray-200">
            <a href="/leaderboards" class="block py-2 font-medium">리더보드</a>
          </div>
          <div class="py-2 border-b border-gray-200">
            <a href="/olympiad" class="block py-2 font-medium">올림피아드</a>
          </div>
          <div class="py-2 border-b">
            <a href="/hallOfFame" class="block py-2 font-medium">명예의 전당</a>
          </div>
          <div class="py-2 border-b border-gray-200">
            <a href="https://naver.me/5wN68EEZ" target="_new" class="block py-2 font-medium">사진 변경</a>
          </div>
          <div class="py-2">
            <a href="https://cafe.naver.com/f-e/cafes/31327271/menus/131" target="_new" class="block py-2 font-medium">평영 정기훈련</a>
          </div>

        </nav>
      </div>
    </div>

    <TheSpacer size="xs" />
  </header>
  <TheTooltipDialog :show="showTooltip" message="아직 준비중인 기능입니다." @update:show="showTooltip = false" />
  <TheTooltipDialog :show="showTooltipCBT" message="안녕하세요, 현재도 대부분의 기능은 작동중이고, 여전히 조금씩 바꿔가고, 정리하고 있습니다. 감사합니다. 평영 화이팅." @update:show="showTooltipCBT = false" />
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
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue';
import { useAuthStore } from '~/stores/useAuthStore';
import { useRouter } from 'vue-router';
import TheSection from '~/components/common/TheSection.vue';
import TheSpacer from '~/components/common/TheSpacer.vue';
import TheTooltipDialog from '~/components/common/TheTooltipDialog.vue';

// 라우터 추가
const router = useRouter();

const showTooltip = ref(false);
const showTooltipCBT = ref(false);
const isScrolled = ref(false);
const headerHeight = ref(0);
const thumbnail = ref('');
const scrollThreshold = 50;
const isDropdownOpen = ref(false);
const isMobileMenuOpen = ref(false);
const openSubmenu = ref(null);
let closeTimer = null;
const isHydrated = ref(false);

// 드롭다운 메뉴 관련 상태
const activeDropdown = ref(null);
let dropdownTimer = null;

// 프로필 드롭다운 관련 상태
const profileDropdownOpen = ref(false);
let profileDropdownTimer = null;

// 스토어 초기화
const authStore = useAuthStore();

// ⭐ authStore의 상태 변화를 감시
watch(() => authStore.isAuthenticated, (newValue) => {
  // console.log('🔄 인증 상태 변경됨:', newValue);
  // 필요시 추가 로직 수행
}, { immediate: true });

watch(() => authStore.currentUser, (newUser) => {
  // console.log('👤 사용자 정보 변경됨:', newUser);
  if (newUser?.thumbnail) {
    thumbnail.value = newUser.thumbnail;
  }
}, { deep: true, immediate: true });

// 로그아웃 처리 함수 수정
async function handleLogout() {
  // console.log("🔄 로그아웃 시작...");

  try {
    // 로그아웃 실행
    await authStore.logout();

    // ⭐ 다음 틱에서 UI 업데이트 확인
    await nextTick();
    // console.log("✅ 로그아웃 완료, 인증상태:", authStore.isAuthenticated);

    // 모바일 메뉴 닫기
    isMobileMenuOpen.value = false;

    // 홈으로 리다이렉트
    await router.push('/');

  } catch (error) {
    console.error("❌ 로그아웃 중 오류:", error);
  }
}

// 드롭다운 메뉴 함수들
function openDropdown(menuName) {
  if (dropdownTimer) {
    clearTimeout(dropdownTimer);
    dropdownTimer = null;
  }
  activeDropdown.value = menuName;
}

function startCloseTimer(menuName) {
  if (activeDropdown.value !== menuName) return;
  dropdownTimer = setTimeout(() => {
    closeDropdown();
  }, 300);
}

function cancelCloseTimer() {
  if (dropdownTimer) {
    clearTimeout(dropdownTimer);
    dropdownTimer = null;
  }
}

function closeDropdown() {
  dropdownTimer = setTimeout(() => {
    activeDropdown.value = null;
  }, 200);
}

// 프로필 드롭다운 함수들
function openProfileDropdown() {
  if (profileDropdownTimer) {
    clearTimeout(profileDropdownTimer);
    profileDropdownTimer = null;
  }
  profileDropdownOpen.value = true;
}

function startCloseProfileTimer() {
  profileDropdownTimer = setTimeout(() => {
    closeProfileDropdown();
  }, 300);
}

function cancelProfileCloseTimer() {
  if (profileDropdownTimer) {
    clearTimeout(profileDropdownTimer);
    profileDropdownTimer = null;
  }
}

function closeProfileDropdown() {
  profileDropdownTimer = setTimeout(() => {
    profileDropdownOpen.value = false;
  }, 200);
}

// 스크롤 이벤트 핸들러
const handleScroll = () => {
  isScrolled.value = window.scrollY > scrollThreshold;
};

// 모바일 메뉴 토글
function toggleMobileMenu() {
  isMobileMenuOpen.value = !isMobileMenuOpen.value;

  if (!isMobileMenuOpen.value) {
    openSubmenu.value = null;
  }

  if (isMobileMenuOpen.value) {
    document.body.style.overflow = 'hidden';
  } else {
    document.body.style.overflow = '';
  }
}

function toggleSubmenu(menuName) {
  if (openSubmenu.value === menuName) {
    openSubmenu.value = null;
  } else {
    openSubmenu.value = menuName;
  }
}

// ⭐ 모바일 메뉴 watch 수정
watch(isMobileMenuOpen, (opened) => {
  if (opened) {
    openSubmenu.value = 'new';
  }
});

onMounted(async () => {
  // console.log("🚀 Header 컴포넌트 마운트됨");

  try {
    // 사용자 정보 복원
    await authStore.ensureCurrentUser();

    // Hydration 완료 표시
    await nextTick();
    isHydrated.value = true;

    // console.log("✅ Header 초기화 완료, 인증상태:", authStore.isAuthenticated);

    // 썸네일 설정
    if (authStore.currentUser?.thumbnail) {
      thumbnail.value = authStore.currentUser.thumbnail;
    }

    // 메인 메뉴 높이 저장
    const mainMenuEl = document.querySelector('.bg-white.shadow-md');
    if (mainMenuEl) {
      headerHeight.value = mainMenuEl.offsetHeight;
    }

    // 스크롤 이벤트 리스너 등록
    window.addEventListener('scroll', handleScroll);
    handleScroll();

  } catch (error) {
    console.error("❌ Header 초기화 중 오류:", error);
  }
});

onUnmounted(() => {
  // 이벤트 리스너 제거
  window.removeEventListener('scroll', handleScroll);
  document.body.style.overflow = '';

  // 타이머 정리
  if (dropdownTimer) {
    clearTimeout(dropdownTimer);
  }
  if (profileDropdownTimer) {
    clearTimeout(profileDropdownTimer);
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
/* 모바일 메뉴 스타일 */
.mobile-menu {
  transition: transform 0.3s ease-in-out;
}

/* 드롭다운 애니메이션 */
.absolute {
  transition: opacity 0.2s, visibility 0.2s;
}

/* 메뉴 호버 효과 */
.hover\:bg-gray-100:hover {
  background-color: #f7fafc;
}


/* 헤더 전환 애니메이션 */
.transition-all {
  transition-property: all;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
}


/* 미디어 쿼리 - 작은 화면에서 메뉴 스타일 조정 */
@media (max-width: 1023px) {
  .container {
    padding-left: 1rem;
    padding-right: 1rem;
  }
}

/* 부드러운 스크롤 애니메이션 */
.transform {
  transition-duration: 300ms;
}
</style>