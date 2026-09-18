<!-- components/Login.vue -->
<template>
  <div class="login-container">
    <div class="login-form">
      <h2>로그인</h2>

      <!-- 알림 메시지 -->
      <div v-if="message" :class="['alert', messageType === 'error' ? 'alert-error' : 'alert-success']">
        {{ message }}
      </div>

      <form @submit.prevent="submitLogin">
        <div class="form-group">
          <label for="email">이메일</label>
          <input type="email" id="email" v-model="email" placeholder="이메일 주소를 입력하세요" required
            :class="{ 'input-error': errors.email }">
          <span v-if="errors.email" class="error-text">{{ errors.email }}</span>
        </div>

        <div class="form-group">
          <label for="password">비밀번호</label>
          <div class="password-input">
            <input :type="showPassword ? 'text' : 'password'" id="password" v-model="password" placeholder="비밀번호를 입력하세요"
              required :class="{ 'input-error': errors.password }">
            <button type="button" class="toggle-password" @click="showPassword = !showPassword">
              {{ showPassword ? '숨기기' : '보기' }}
            </button>
          </div>
          <span v-if="errors.password" class="error-text">{{ errors.password }}</span>
        </div>

        <div class="form-options">
          <div class="remember-me">
            <input type="checkbox" id="remember" v-model="rememberMe">
            <label for="remember">로그인 상태 유지</label>
          </div>
          <a href="#" class="forgot-password" @click.prevent="forgotPassword">비밀번호 찾기</a>
        </div>

        <div class="form-actions">
          <button type="submit" class="login-btn" :disabled="isLoading">
            <span v-if="isLoading">로그인 중...</span>
            <span v-else>로그인</span>
          </button>
        </div>
      </form>

      <div class="social-login">
        <p>소셜 계정으로 로그인</p>
        <div class="social-buttons">
          <button class="google-btn" @click="socialLogin('google')">
            Google 계정으로 로그인
          </button>
          <button class="kakao-btn" @click="socialLogin('kakao')">
            카카오 계정으로 로그인
          </button>
          <button class="naver-btn" @click="socialLogin('naver')">
            네이버 계정으로 로그인
          </button>
        </div>
      </div>

      <div class="signup-link">
        <p>아직 회원이 아니신가요? <a href="#" @click.prevent="goToSignup">회원가입</a></p>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      email: '',
      password: '',
      rememberMe: false,
      showPassword: false,
      isLoading: false,
      message: '',
      messageType: 'error', // 'error' 또는 'success'
      errors: {
        email: '',
        password: ''
      }
    }
  },
  methods: {
    validateForm() {
      let isValid = true;
      this.errors.email = '';
      this.errors.password = '';

      if (isNaN(this.email)) { // 숫자이면 athleteID
        // 이메일 유효성 검사
        if (!this.email) {
          this.errors.email = '이메일을 입력해주세요.';
          isValid = false;
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.email)) {
          this.errors.email = '유효한 이메일 주소를 입력해주세요.';
          isValid = false;
        }
      }

      // 비밀번호 유효성 검사
      if (!this.password) {
        this.errors.password = '비밀번호를 입력해주세요.';
        isValid = false;
      } else if (this.password.length < 6) {
        this.errors.password = '비밀번호는 최소 6자 이상이어야 합니다.';
        isValid = false;
      }

      return isValid;
    },
    async submitLogin() {
      if (!this.validateForm()) {
        return;
      }

      this.isLoading = true;
      this.message = '';

      try {
        // 실제 구현에서는 API 호출을 통해 로그인 요청
        // const response = await this.$axios.$post('/auth/signin', {
        //   email: this.email,
        //   password: this.password,
        //   remember: this.rememberMe
        // });

        // 여기서는 로그인 성공을 가정
        // 로그인 후 사용자 정보 저장 및 리다이렉트 처리

        // 시뮬레이션 목적으로 지연
        await new Promise(resolve => setTimeout(resolve, 1000));

        this.messageType = 'success';
        this.message = '로그인에 성공했습니다.';

        // 로그인 성공 후 리다이렉트
        setTimeout(() => {
          // this.$router.push('/');
        }, 1500);

      } catch (error) {
        this.messageType = 'error';

        // 실제 구현에서는 서버 응답에 따라 메시지 처리
        // if (error.response && error.response.status === 401) {
        //   this.message = '이메일 또는 비밀번호가 일치하지 않습니다.';
        // } else {
        //   this.message = '로그인 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
        // }

        // 시뮬레이션 목적
        this.message = '이메일 또는 비밀번호가 일치하지 않습니다.';

      } finally {
        this.isLoading = false;
      }
    },
    forgotPassword() {
      // 비밀번호 찾기 페이지로 이동 또는 모달 표시
      // this.$router.push('/forgot-password');
    },
    socialLogin(provider) {
      // 소셜 로그인 처리
    },
    goToSignup() {
      // 회원가입 페이지로 이동
      // this.$router.push('/signup');
      this.$emit('switch-to-signup');
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
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f8f9fa;
  padding: 20px;
}

.login-form {
  background: white;
  width: 100%;
  max-width: 450px;
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
input[type="text"] {
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  transition: border-color 0.3s;
}

input[type="email"]:focus,
input[type="password"]:focus,
input[type="text"]:focus {
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

.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  font-size: 0.9rem;
}

.remember-me {
  display: flex;
  align-items: center;
}

.remember-me input {
  margin-right: 5px;
}

.forgot-password {
  color: #3498db;
  text-decoration: none;
}

.forgot-password:hover {
  text-decoration: underline;
}

.form-actions {
  margin-bottom: 25px;
}

.login-btn {
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

.login-btn:hover {
  background-color: #2980b9;
}

.login-btn:disabled {
  background-color: #95a5a6;
  cursor: not-allowed;
}

.social-login {
  margin-top: 20px;
  border-top: 1px solid #eee;
  padding-top: 20px;
}

.social-login p {
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

.signup-link {
  margin-top: 25px;
  text-align: center;
  font-size: 0.95rem;
}

.signup-link a {
  color: #3498db;
  font-weight: 500;
  text-decoration: none;
}

.signup-link a:hover {
  text-decoration: underline;
}

@media (max-width: 768px) {
  .login-form {
    padding: 20px;
  }

  .form-options {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
}
</style>