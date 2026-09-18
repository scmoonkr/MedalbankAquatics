<!-- components/Signup.vue -->
<template>
  <div class="signup-container">
    <div class="signup-form">
      <h2>회원가입</h2>

      <!-- 알림 메시지 -->
      <div v-if="message" :class="['alert', messageType === 'error' ? 'alert-error' : 'alert-success']">
        {{ message }}
      </div>

      <form @submit.prevent="submitSignup">
        <!-- 이름 입력 필드 -->
        <div class="form-group">
          <label for="name">이름</label>
          <input type="text" id="name" v-model="name" placeholder="이름을 입력하세요" required
            :class="{ 'input-error': errors.name }">
          <span v-if="errors.name" class="error-text">{{ errors.name }}</span>
        </div>

        <!-- 이메일 입력 필드 -->
        <div class="form-group">
          <label for="signup-email">이메일</label>
          <input type="email" id="signup-email" v-model="email" placeholder="이메일 주소를 입력하세요" required
            :class="{ 'input-error': errors.email }">
          <span v-if="errors.email" class="error-text">{{ errors.email }}</span>
        </div>

        <!-- 비밀번호 입력 필드 -->
        <div class="form-group">
          <label for="signup-password">비밀번호</label>
          <div class="password-input">
            <input :type="showPassword ? 'text' : 'password'" id="signup-password" v-model="password"
              placeholder="비밀번호를 입력하세요 (8자 이상)" required :class="{ 'input-error': errors.password }">
            <button type="button" class="toggle-password" @click="showPassword = !showPassword">
              {{ showPassword ? '숨기기' : '보기' }}
            </button>
          </div>
          <span v-if="errors.password" class="error-text">{{ errors.password }}</span>

          <!-- 비밀번호 강도 표시 -->
          <div v-if="password" class="password-strength">
            <div class="strength-bar">
              <div class="strength-level" :style="{ width: passwordStrength + '%' }" :class="getStrengthClass"></div>
            </div>
            <span class="strength-text" :class="getStrengthClass">
              {{ getStrengthText }}
            </span>
          </div>
        </div>

        <!-- 비밀번호 확인 필드 -->
        <div class="form-group">
          <label for="confirm-password">비밀번호 확인</label>
          <div class="password-input">
            <input :type="showConfirmPassword ? 'text' : 'password'" id="confirm-password" v-model="confirmPassword"
              placeholder="비밀번호를 다시 입력하세요" required :class="{ 'input-error': errors.confirmPassword }">
            <button type="button" class="toggle-password" @click="showConfirmPassword = !showConfirmPassword">
              {{ showConfirmPassword ? '숨기기' : '보기' }}
            </button>
          </div>
          <span v-if="errors.confirmPassword" class="error-text">{{ errors.confirmPassword }}</span>
        </div>

        <!-- 휴대폰 번호 입력 필드 -->
        <div class="form-group">
          <label for="phone">휴대폰 번호 (선택)</label>
          <input type="tel" id="phone" v-model="phone" placeholder="예: 010-1234-5678"
            :class="{ 'input-error': errors.phone }">
          <span v-if="errors.phone" class="error-text">{{ errors.phone }}</span>
        </div>

        <!-- 약관 동의 -->
        <div class="terms-agreement">
          <div class="agreement-item">
            <input type="checkbox" id="terms-all" v-model="agreeAll" @change="toggleAllAgreements">
            <label for="terms-all" class="bold-label">전체 동의</label>
          </div>

          <div class="agreement-item">
            <input type="checkbox" id="terms-service" v-model="agreeTerms" required>
            <label for="terms-service">
              <span class="required">(필수)</span> 서비스 이용약관에 동의합니다.
            </label>
            <button type="button" class="view-terms" @click="viewTerms('service')">보기</button>
          </div>

          <div class="agreement-item">
            <input type="checkbox" id="terms-privacy" v-model="agreePrivacy" required>
            <label for="terms-privacy">
              <span class="required">(필수)</span> 개인정보 처리방침에 동의합니다.
            </label>
            <button type="button" class="view-terms" @click="viewTerms('privacy')">보기</button>
          </div>

          <div class="agreement-item">
            <input type="checkbox" id="terms-marketing" v-model="agreeMarketing">
            <label for="terms-marketing">
              <span class="optional">(선택)</span> 마케팅 정보 수신에 동의합니다.
            </label>
          </div>

          <span v-if="errors.terms" class="error-text">{{ errors.terms }}</span>
        </div>

        <!-- 회원가입 버튼 -->
        <div class="form-actions">
          <button type="submit" class="signup-btn" :disabled="isLoading">
            <span v-if="isLoading">처리 중...</span>
            <span v-else>회원가입</span>
          </button>
        </div>
      </form>

      <!-- 소셜 회원가입 -->
      <div class="social-signup">
        <p>소셜 계정으로 회원가입</p>
        <div class="social-buttons">
          <button class="google-btn" @click="socialSignup('google')">
            Google 계정으로 가입
          </button>
          <button class="kakao-btn" @click="socialSignup('kakao')">
            카카오 계정으로 가입
          </button>
          <button class="naver-btn" @click="socialSignup('naver')">
            네이버 계정으로 가입
          </button>
        </div>
      </div>

      <!-- 로그인 링크 -->
      <div class="login-link">
        <p>이미 회원이신가요? <a href="#" @click.prevent="goToLogin">로그인</a></p>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      phone: '',

      showPassword: false,
      showConfirmPassword: false,

      agreeAll: false,
      agreeTerms: false,
      agreePrivacy: false,
      agreeMarketing: false,

      isLoading: false,
      message: '',
      messageType: 'error',

      errors: {
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        phone: '',
        terms: ''
      }
    }
  },
  computed: {
    passwordStrength() {
      if (!this.password) return 0;

      let strength = 0;

      // 길이 점수 (최대 25점)
      if (this.password.length >= 8) strength += 15;
      if (this.password.length >= 12) strength += 10;

      // 복잡성 점수 (각 10점)
      if (/[A-Z]/.test(this.password)) strength += 10; // 대문자
      if (/[a-z]/.test(this.password)) strength += 10; // 소문자
      if (/[0-9]/.test(this.password)) strength += 10; // 숫자
      if (/[^A-Za-z0-9]/.test(this.password)) strength += 15; // 특수문자

      // 다양성 점수 (최대 30점)
      const uniqueChars = new Set(this.password).size;
      strength += Math.min(30, uniqueChars * 2);

      return Math.min(100, strength);
    },
    getStrengthClass() {
      if (this.passwordStrength < 30) return 'very-weak';
      if (this.passwordStrength < 50) return 'weak';
      if (this.passwordStrength < 75) return 'medium';
      return 'strong';
    },
    getStrengthText() {
      if (this.passwordStrength < 30) return '매우 약함';
      if (this.passwordStrength < 50) return '약함';
      if (this.passwordStrength < 75) return '보통';
      return '강함';
    }
  },
  methods: {
    toggleAllAgreements() {
      this.agreeTerms = this.agreeAll;
      this.agreePrivacy = this.agreeAll;
      this.agreeMarketing = this.agreeAll;
    },
    viewTerms(type) {
      // 약관 보기 모달 표시
    },
    validateForm() {
      let isValid = true;

      // 모든 에러 초기화
      Object.keys(this.errors).forEach(key => {
        this.errors[key] = '';
      });

      // 이름 유효성 검사
      if (!this.name.trim()) {
        this.errors.name = '이름을 입력해주세요.';
        isValid = false;
      }

      // 이메일 유효성 검사
      if (!this.email.trim()) {
        this.errors.email = '이메일을 입력해주세요.';
        isValid = false;
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.email)) {
        this.errors.email = '유효한 이메일 주소를 입력해주세요.';
        isValid = false;
      }

      // 비밀번호 유효성 검사
      if (!this.password) {
        this.errors.password = '비밀번호를 입력해주세요.';
        isValid = false;
      } else if (this.password.length < 8) {
        this.errors.password = '비밀번호는 최소 8자 이상이어야 합니다.';
        isValid = false;
      } else if (this.passwordStrength < 50) {
        this.errors.password = '더 강력한 비밀번호를 사용해주세요.';
        isValid = false;
      }

      // 비밀번호 확인 유효성 검사
      if (!this.confirmPassword) {
        this.errors.confirmPassword = '비밀번호 확인을 입력해주세요.';
        isValid = false;
      } else if (this.password !== this.confirmPassword) {
        this.errors.confirmPassword = '비밀번호가 일치하지 않습니다.';
        isValid = false;
      }

      // 휴대폰 번호 유효성 검사 (입력된 경우에만)
      if (this.phone.trim() && !/^01([0|1|6|7|8|9])-?([0-9]{3,4})-?([0-9]{4})$/.test(this.phone.replace(/-/g, ''))) {
        this.errors.phone = '유효한 휴대폰 번호를 입력해주세요.';
        isValid = false;
      }

      // 필수 약관 동의 검사
      if (!this.agreeTerms || !this.agreePrivacy) {
        this.errors.terms = '필수 약관에 동의해주세요.';
        isValid = false;
      }

      return isValid;
    },
    async submitSignup() {
      if (!this.validateForm()) {
        return;
      }

      this.isLoading = true;
      this.message = '';

      try {
        // 실제 구현에서는 API 호출을 통해 회원가입 요청
        // const response = await this.$axios.$post('/auth/signup', {
        //   name: this.name,
        //   email: this.email,
        //   password: this.password,
        //   phone: this.phone,
        //   marketing: this.agreeMarketing
        // });

        // 시뮬레이션 목적으로 지연
        await new Promise(resolve => setTimeout(resolve, 1500));

        // 회원가입 성공 메시지
        this.messageType = 'success';
        this.message = '회원가입이 완료되었습니다. 로그인 페이지로 이동합니다.';

        // 로그인 페이지로 리다이렉트
        setTimeout(() => {
          // this.$router.push('/auth/signin');
          this.$emit('switch-to-login');
        }, 2000);

      } catch (error) {
        this.messageType = 'error';

        // 실제 구현에서는 서버 응답에 따라 메시지 처리
        // if (error.response && error.response.status === 409) {
        //   this.message = '이미 사용 중인 이메일 주소입니다.';
        // } else {
        //   this.message = '회원가입 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
        // }

        // 시뮬레이션 목적
        this.message = '이미 사용 중인 이메일 주소입니다.';

      } finally {
        this.isLoading = false;
      }
    },
    socialSignup(provider) {
      // 소셜 회원가입 처리
    },
    goToLogin() {
      // 로그인 페이지로 이동
      // this.$router.push('/auth/signin');
      this.$emit('switch-to-login');
    },
    checkAllAgreements() {
      this.agreeAll = this.agreeTerms && this.agreePrivacy && this.agreeMarketing;
    }
  },
  watch: {
    // 약관 동의 상태 감시
    agreeTerms() {
      this.checkAllAgreements();
    },
    agreePrivacy() {
      this.checkAllAgreements();
    },
    agreeMarketing() {
      this.checkAllAgreements();
    }
  }
}
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
.signup-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f8f9fa;
  padding: 20px;
}

.signup-form {
  background: white;
  width: 100%;
  max-width: 500px;
  padding: 30px;
  border-radius: 8px;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
}

h2 {
  text-align: center;
  margin-bottom: 25px;
  color: #333;
  font-size: 1.8rem;
}

.alert {
  padding: 12px;
  border-radius: 4px;
  margin-bottom: 20px;
  font-size: 0.95rem;
}

.alert-error {
  background-color: #ffe0e0;
  color: #d63031;
  border: 1px solid #ffb8b8;
}

.alert-success {
  background-color: #e0ffe0;
  color: #27ae60;
  border: 1px solid #b8ffb8;
}

.form-group {
  margin-bottom: 20px;
}

label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #444;
}

input[type="email"],
input[type="password"],
input[type="text"],
input[type="tel"] {
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  transition: border-color 0.3s;
}

input[type="email"]:focus,
input[type="password"]:focus,
input[type="text"]:focus,
input[type="tel"]:focus {
  border-color: #3498db;
  outline: none;
}

.input-error {
  border-color: #e74c3c !important;
}

.error-text {
  color: #e74c3c;
  font-size: 0.85rem;
  margin-top: 5px;
  display: block;
}

.password-input {
  position: relative;
}

.toggle-password {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #777;
  cursor: pointer;
  font-size: 0.85rem;
}

.password-strength {
  margin-top: 10px;
}

.strength-bar {
  height: 5px;
  background-color: #eee;
  border-radius: 3px;
  overflow: hidden;
  margin-bottom: 5px;
}

.strength-level {
  height: 100%;
  transition: width 0.3s ease;
}

.strength-level.very-weak {
  background-color: #e74c3c;
}

.strength-level.weak {
  background-color: #f39c12;
}

.strength-level.medium {
  background-color: #3498db;
}

.strength-level.strong {
  background-color: #27ae60;
}

.strength-text {
  font-size: 0.85rem;
}

.strength-text.very-weak {
  color: #e74c3c;
}

.strength-text.weak {
  color: #f39c12;
}

.strength-text.medium {
  color: #3498db;
}

.strength-text.strong {
  color: #27ae60;
}

.terms-agreement {
  margin-bottom: 25px;
  border: 1px solid #eee;
  padding: 15px;
  border-radius: 4px;
  background-color: #f9f9f9;
}

.agreement-item {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

.agreement-item:last-child {
  margin-bottom: 0;
}

.agreement-item input[type="checkbox"] {
  margin-right: 10px;
}

.bold-label {
  font-weight: bold;
}

.required {
  color: #e74c3c;
  font-weight: 500;
}

.optional {
  color: #7f8c8d;
}

.view-terms {
  margin-left: auto;
  background: none;
  border: none;
  color: #3498db;
  cursor: pointer;
  font-size: 0.85rem;
}

.view-terms:hover {
  text-decoration: underline;
}

.form-actions {
  margin-bottom: 25px;
}

.signup-btn {
  width: 100%;
  padding: 12px;
  background-color: #3498db;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.3s;
}

.signup-btn:hover {
  background-color: #2980b9;
}

.signup-btn:disabled {
  background-color: #95a5a6;
  cursor: not-allowed;
}

.social-signup {
  margin-top: 20px;
  border-top: 1px solid #eee;
  padding-top: 20px;
}

.social-signup p {
  text-align: center;
  margin-bottom: 15px;
  color: #777;
  font-size: 0.95rem;
}

.social-buttons {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.social-buttons button {
  padding: 10px;
  border: none;
  border-radius: 4px;
  font-size: 0.95rem;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
  font-weight: 500;
}

.google-btn {
  background-color: white;
  color: #444;
  border: 1px solid #ddd !important;
}

.kakao-btn {
  background-color: #FEE500;
  color: #000000;
}

.naver-btn {
  background-color: #03C75A;
  color: white;
}

.login-link {
  margin-top: 25px;
  text-align: center;
  font-size: 0.95rem;
}

.login-link a {
  color: #3498db;
  font-weight: 500;
  text-decoration: none;
}

.login-link a:hover {
  text-decoration: underline;
}

@media (max-width: 768px) {
  .signup-form {
    padding: 20px;
  }

  .social-buttons button {
    font-size: 0.9rem;
  }
}
</style>