<template>
  <div class="competition-edit-container">
    <h1 class="form-title">COMPETITION_EDIT</h1>

    <div class="form-container">
      <!-- Competition ID -->
      <div class="form-field">
        <input type="number" v-model="competition.competitionID" placeholder="0" class="id-input" />
      </div>

      <!-- Name field -->
      <div class="form-field">
        <input type="text" v-model="competition.fullname" placeholder="fullname" class="form-input" />
      </div>

      <!-- Stem field -->
      <div class="form-field stem-input">
        <input type="text" v-model="competition.stem" placeholder="Stem 검색" class="form-input" />
        <button class="add-button">+1</button>
      </div>

      <!-- Location field -->
      <div class="form-field">
        <input type="text" v-model="competition.pool" placeholder="메달뱅크 수영장 검색" class="form-input" />
      </div>

      <!-- Date field -->
      <div class="form-field">
        <input type="text" v-model="competition.dateStart" placeholder="0000-00-00" class="form-input date-input" />
      </div>

      <!-- Year buttons -->
      <div class="button-group year-buttons">
        <button class="primary-button active">전체</button>
        <button class="secondary-button">2025</button>
        <button class="secondary-button">2024</button>
        <button class="secondary-button">2023</button>
        <button class="secondary-button">2022</button>
        <button class="secondary-button">2021</button>
        <button class="secondary-button">2020</button>
        <button class="secondary-button">2019</button>
      </div>

      <!-- Region buttons -->
      <div class="button-group region-buttons">
        <button class="primary-button active">서울</button>
        <button class="secondary-button">부산</button>
        <button class="secondary-button">인천</button>
        <button class="secondary-button">경기</button>
        <button class="secondary-button">대구</button>
        <button class="secondary-button">광주</button>
        <button class="secondary-button">울산</button>
        <button class="secondary-button">대전</button>
        <button class="secondary-button">세종</button>
        <button class="secondary-button">제주</button>
        <button class="secondary-button">강원</button>
        <button class="secondary-button">충남</button>
        <button class="secondary-button">충북</button>
        <button class="secondary-button">경남</button>
        <button class="secondary-button">경북</button>
        <button class="secondary-button">전남</button>
        <button class="secondary-button">전북</button>
        <button class="secondary-button">해외</button>
      </div>

      <!-- Course type buttons -->
      <div class="button-group course-buttons">
        <button class="primary-button active">LCM</button>
        <button class="secondary-button">SCM</button>
      </div>

      <!-- Competition type buttons -->
      <div class="button-group type-buttons">
        <button class="primary-button active">전자측정</button>
        <button class="secondary-button">수기측정</button>
      </div>

      <!-- Submit button -->
      <div class="action-button-container">
        <button class="action-button">이대로 대회 정보 올리기</button>
      </div>

      <!-- Notice text -->
      <p class="notice-text">※ 입력 해주시는 내용이 기존에 등록된 내용이거나 오답자가 있다면 형식에서 어긋날 경우 입력로 수정될 수 있습니다.</p>
    </div>
  </div>
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
import { ref } from 'vue';
import { useAuthStore } from '~/stores/useAuthStore';
import { usePageNavigation } from '~/composables/usePageNavigation';
const authStore = useAuthStore();

// Initialize competition model with default values
const competition = ref({
  competitionID: 0,
  fullname: '',
  sido: '',
  dateStart: '',
  dateEnd: '',
  pool: '',
  course: 'LCM',
  poolID: 0,
  year: 2025,
  stemID: 0,
  competitionType: '전자측정',
  teamRank: [],
  stem: '',
  isMasters: false,
  athleteCount: 0,
  timeCount: 0,
  extraInfo: {},
  compression: {}
});

// Add your form submission logic here
const submitForm = () => {
  // Handle form submission
};
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
.competition-edit-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
}

.form-title {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 20px;
}

.form-container {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.form-field {
  width: 100%;
}

.form-input,
.id-input {
  width: 100%;
  padding: 15px;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
  background-color: #f5f5f5;
  font-size: 16px;
  box-sizing: border-box;
}

.id-input {
  background-color: #e0e0e0;
}

.stem-input {
  display: flex;
  gap: 10px;
}

.add-button {
  padding: 15px;
  border-radius: 8px;
  border: none;
  background-color: #e0e0e0;
  cursor: pointer;
  font-weight: bold;
}

.button-group {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
  margin: 5px 0;
}

.primary-button,
.secondary-button {
  padding: 10px 15px;
  border-radius: 20px;
  border: none;
  font-size: 14px;
  cursor: pointer;
}

.primary-button {
  background-color: #1a1a2e;
  color: white;
}

.primary-button.active {
  background-color: #1a1a2e;
  color: white;
}

.secondary-button {
  background-color: #f0f0f0;
  color: #333;
}

.secondary-button:hover {
  background-color: #e0e0e0;
}

.action-button-container {
  margin-top: 20px;
}

.action-button {
  background-color: #ffa500;
  color: white;
  border: none;
  padding: 15px 20px;
  border-radius: 25px;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  width: 100%;
}

.action-button:hover {
  background-color: #ff8c00;
}

.notice-text {
  margin-top: 20px;
  color: #888;
  font-size: 14px;
}

/* Responsive styling */
@media (max-width: 768px) {
  .button-group {
    justify-content: flex-start;
    overflow-x: auto;
    padding-bottom: 5px;
  }
}
</style>