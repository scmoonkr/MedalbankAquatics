// stores/useAuthStore.ts
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { UserModel } from '~/models/users';
import type { LoginRequest, AuthResponse, RegisterRequest } from '~/types/users';
import authApi from '~/api/authApi';
import userApi from '~/api/userAPI';

export const useAuthStore = defineStore('auth', () => {
  // 상태(State)
  const currentUser = ref<UserModel | null>(null);
  const token = ref<string | null>(null);
  const refreshToken = ref<string | null>(null);
  const isLoading = ref<boolean>(false);
  const error = ref<string | null>(null);
  const userLevel = ref<number>(0);
  const userRole = ref<string>('guest');
  const isInitialized = ref(false);
  const userInfo = ref({
    name: '',
    registrationNo: '',
    athleteID: 1,
    featured: '',
    password: ''
  });

  // ⭐ isAuthenticated를 computed로 변경 (핵심 수정사항)
  const isAuthenticated = computed(() => {
    return !!currentUser.value && !!token.value && currentUser.value.userID > 0;
  });

  // 사용자 정보 복원 함수
  async function ensureCurrentUser() {
    if (isInitialized.value || (currentUser.value?.userID && currentUser.value?.userID > 0)) {
      return;
    }

    try {
      const storedUser = localStorage.getItem('user');
      const storedToken = localStorage.getItem('token');
      
      if (storedUser && storedToken) {
        const user = JSON.parse(storedUser);
        
        // ⭐ 순서대로 상태 업데이트
        currentUser.value = user;
        token.value = storedToken;
        userLevel.value = user.level || 0;
        userRole.value = user.role || 'guest';
        
        // console.log('✅ 사용자 정보 복원 성공:', user);
      }
    } catch (error) {
      console.error('❌ 사용자 정보 복원 실패:', error);
      clearUserData();
    } finally {
      isInitialized.value = true;
    }
  }

  // 로그인 함수 수정
  async function login(credentials: LoginRequest) {
    isLoading.value = true;
    error.value = null;

    try {
      const response = await authApi.login(credentials);

      if (response.data?.userID && response.data?.userID > 0) {
        setUserData(response);
        // console.log('✅ 로그인 성공, isAuthenticated:', isAuthenticated.value);
        return true;
      } else {
        throw new Error('로그인에 실패했습니다.');
      }
    } catch (err) {
      console.error("로그인 오류:", err);
      error.value = err instanceof Error ? err.message : '로그인 중 오류가 발생했습니다.';
      return false;
    } finally {
      isLoading.value = false;
    }
  }

  // 로그아웃 함수 수정
  async function logout() {
    try {
      await authApi.logout();
    } catch (error) {
      console.error('로그아웃 API 호출 중 오류:', error);
    } finally {
      // ⭐ 로컬 상태 즉시 초기화
      clearUserData();
      // console.log('✅ 로그아웃 완료, isAuthenticated:', isAuthenticated.value);
    }
  }

  // 사용자 정보 초기화 함수 수정
  function clearUserData() {
    // ⭐ 순서대로 상태 초기화
    currentUser.value = null;
    token.value = null;
    refreshToken.value = null;
    userLevel.value = 0;
    userRole.value = 'guest';

    // localStorage에서도 제거
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    
    // console.log('🧹 사용자 데이터 초기화 완료');
  }

  // 사용자 데이터 설정 함수 수정
  function setUserData(authData: AuthResponse) {
    const userModel = new UserModel(authData.data);
    
    // ⭐ 순서대로 상태 설정
    currentUser.value = userModel;
    token.value = authData.token;
    refreshToken.value = authData.refreshToken;
    userLevel.value = userModel.level || 0;
    userRole.value = userModel.role || 'user';

    // localStorage에 저장
    localStorage.setItem('token', authData.token);
    localStorage.setItem('refreshToken', authData.refreshToken || '');
    localStorage.setItem('user', JSON.stringify(userModel));
    
    // console.log('💾 사용자 데이터 설정 완료:', userModel);
  }

  // 나머지 함수들...
  async function getUserByRegistrationNo(registrationNo: string) {
    isLoading.value = true;
    error.value = null;

    try {
      const response = await userApi.getUserByRegistrationNo(registrationNo);
      if (response.data?.userID && response.data?.userID > 0) {
        userInfo.value.name = response.data.name;
        userInfo.value.athleteID = response.data.userID;
        userInfo.value.registrationNo = response.data.registrationNo;
        userInfo.value.password = response.data.password;
        return true;
      } else {
        throw new Error('회원가입에 실패했습니다.');
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : '회원가입 중 오류가 발생했습니다.';
      return false;
    } finally {
      isLoading.value = false;
    }
  }

  async function setPasswordByRegistrationNo(params: any) {
    isLoading.value = true;
    error.value = null;
    try {
      const response = await authApi.setPasswordByRegistrationNo(params);
      return true;
    } catch (err) {
      error.value = err instanceof Error ? err.message : '회원가입 중 오류가 발생했습니다.';
      return false;
    } finally {
      isLoading.value = false;
    }
  }

  function initializeFromStorage() {
    try {
      const storedUser = localStorage.getItem('user');
      const storedToken = localStorage.getItem('token');
      const storedRefreshToken = localStorage.getItem('refreshToken');

      if (storedUser && storedToken) {
        const userData = JSON.parse(storedUser);
        currentUser.value = new UserModel(userData);
        token.value = storedToken;
        refreshToken.value = storedRefreshToken || '';
        userLevel.value = userData.level || 0;
        userRole.value = userData.role || 'user';
        return true;
      }
    } catch (error) {
      console.error("스토리지에서 상태 초기화 중 오류:", error);
    }
    return false;
  }

  async function refreshAuthToken() {
    if (!refreshToken.value) {
      clearUserData();
      return false;
    }

    try {
      const response = await authApi.refreshToken(refreshToken.value);

      if (response.token) {
        token.value = response.token;
        localStorage.setItem('token', response.token);
        return true;
      } else {
        throw new Error('토큰 갱신에 실패했습니다.');
      }
    } catch (err) {
      console.error('토큰 갱신 중 오류:', err);
      clearUserData();
      return false;
    }
  }

  function canUserEdit(resourceId: number, resourceType: string): boolean {
    if (!currentUser.value) return false;
    if (currentUser.value?.role === 'admin') return true;
    if (resourceType === 'page') {
      return true;
    }
    return false;
  }

  return {
    // 상태
    currentUser,
    userInfo,
    token,
    isLoading,
    error,
    userLevel,
    userRole,
    isInitialized,

    // ⭐ computed 게터
    isAuthenticated,

    // 액션
    login,
    logout,
    clearUserData,
    refreshAuthToken,
    getUserByRegistrationNo,
    setPasswordByRegistrationNo,
    canUserEdit,
    initializeFromStorage,
    ensureCurrentUser,
  };
});