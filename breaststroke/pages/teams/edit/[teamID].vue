<template>
  <div class="pool-record-container">
    <h1 class="page-title">새로운 수영장 정보 입력하기</h1>
    <p class="page-description">기존에 입력된 정보와 중복되는 내용은 입력되지 않거나, 추후 검수 과정에서 자동 삭제될 수 있습니다.</p>

    <div class="search-container">
      <input type="text" class="search-input" placeholder="수영장명 입력하기" v-model="poolName" />
      <button class="search-button">+1</button>
    </div>
    <p class="search-hint">수영장명을 정확하게 입력 후에 적어주세요.</p>

    <div class="location-tabs">
      <div v-for="region in regions" :key="region" class="tab-item" :class="{ active: selectedRegion === region }"
        @click="selectedRegion = region">
        {{ region }}
      </div>
    </div>

    <p class="select-instruction">지역을 선택해주세요.</p>

    <div class="course-selection">
      <div class="course-option" :class="{ active: selectedCourse === 'LCM' }" @click="selectedCourse = 'LCM'">
        LCM
      </div>
      <div class="course-option" :class="{ active: selectedCourse === 'SCM' }" @click="selectedCourse = 'SCM'">
        SCM
      </div>
    </div>

    <p class="course-instruction">코스를 선택해주세요. 25M 수영장일 경우 SCM, 50M 수영장일 경우 LCM. 중요한 정보이므로 미입력시 수영장 정보 입력이 불가능합니다.</p>

    <!-- 기록 입력 섹션 (크게 표시) -->
    <div class="record-input-section">
      <h2 class="record-title">수영 기록 입력</h2>

      <div class="record-form">
        <div class="form-group">
          <label>날짜</label>
          <input type="date" v-model="recordDate" class="record-input" />
        </div>

        <div class="form-group">
          <label>종목</label>
          <select v-model="eventType" class="record-input">
            <option value="freestyle">자유형</option>
            <option value="backstroke">배영</option>
            <option value="breaststroke">평영</option>
            <option value="butterfly">접영</option>
            <option value="medley">개인혼영</option>
          </select>
        </div>

        <div class="form-group">
          <label>거리</label>
          <select v-model="distance" class="record-input">
            <option value="50">50m</option>
            <option value="100">100m</option>
            <option value="200">200m</option>
            <option value="400">400m</option>
            <option value="800">800m</option>
            <option value="1500">1500m</option>
          </select>
        </div>

        <div class="form-group time-input">
          <label>기록</label>
          <div class="time-inputs">
            <input type="number" v-model="minutes" min="0" placeholder="분" class="time-unit" />
            <span>:</span>
            <input type="number" v-model="seconds" min="0" max="59" placeholder="초" class="time-unit" />
            <span>.</span>
            <input type="number" v-model="milliseconds" min="0" max="99" placeholder="00" class="time-unit" />
          </div>
        </div>

        <div class="form-group">
          <label>비고</label>
          <textarea v-model="notes" class="record-input notes" placeholder="추가 정보를 입력하세요"></textarea>
        </div>
      </div>
    </div>

    <button class="submit-button">이대로 수영장 정보 올리기</button>

    <div class="notes-section">
      <p class="note">※ 입력 해주시는 내용이 기존에 등록된 내용이거나 오탈자가 있거나 형식에서 어긋날 경우 입력료 수정될 수 있습니다.</p>
      <p class="note">※ 기존에 입력된 정보와 중복되는 내용은 입력되지 않거나, 추후 검수 과정에서 자동 삭제될 수 있습니다.</p>
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
const authStore = useAuthStore();

// 상태 관리
const poolName = ref('');
const regions = ['서울', '부산', '인천', '경기', '대구', '광주', '울산', '대전', '세종', '제주', '강원', '충남', '충북', '경남', '경북', '전남', '전북', '해외'];
const selectedRegion = ref('');
const selectedCourse = ref('SCM');

// 기록 입력 데이터
const recordDate = ref('');
const eventType = ref('freestyle');
const distance = ref('100');
const minutes = ref(null);
const seconds = ref(null);
const milliseconds = ref(null);
const notes = ref('');

// 폼 제출 함수
const submitForm = () => {
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
.pool-record-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  font-family: 'Noto Sans KR', sans-serif;
}

.page-title {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 10px;
}

.page-description {
  color: #666;
  margin-bottom: 20px;
  font-size: 14px;
}

.search-container {
  display: flex;
  margin-bottom: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
  overflow: hidden;
}

.search-input {
  flex: 1;
  padding: 12px 15px;
  border: none;
  font-size: 16px;
}

.search-button {
  background: white;
  border: none;
  border-left: 1px solid #ccc;
  padding: 0 15px;
  cursor: pointer;
}

.search-hint {
  font-size: 13px;
  color: #777;
  margin-bottom: 25px;
}

.location-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 20px;
}

.tab-item {
  padding: 8px 16px;
  background-color: #f0f0f0;
  border-radius: 20px;
  cursor: pointer;
  font-size: 14px;
}

.tab-item.active {
  background-color: #333;
  color: white;
}

.select-instruction {
  margin: 15px 0;
  font-size: 14px;
  color: #666;
}

.course-selection {
  display: flex;
  gap: 15px;
  margin-bottom: 15px;
}

.course-option {
  width: 80px;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: white;
  border: 1px solid #ddd;
  border-radius: 8px;
  cursor: pointer;
  font-weight: bold;
}

.course-option.active {
  background-color: #000044;
  color: white;
}

.course-instruction {
  font-size: 14px;
  color: #666;
  margin-bottom: 30px;
}

/* 기록 입력 섹션 - 더 크게 표시 */
.record-input-section {
  background-color: #f8f8f8;
  padding: 25px;
  border-radius: 10px;
  margin-bottom: 30px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.record-title {
  font-size: 22px;
  margin-bottom: 20px;
  color: #333;
}

.record-form {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

@media (max-width: 768px) {
  .record-form {
    grid-template-columns: 1fr;
  }
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: bold;
  font-size: 16px;
}

.record-input {
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 16px;
}

.time-input {
  grid-column: span 2;
}

@media (max-width: 768px) {
  .time-input {
    grid-column: span 1;
  }
}

.time-inputs {
  display: flex;
  align-items: center;
  gap: 8px;
}

.time-unit {
  width: 80px;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  text-align: center;
  font-size: 16px;
}

.notes {
  height: 100px;
  resize: vertical;
}

.submit-button {
  display: block;
  width: 100%;
  padding: 15px;
  background-color: #f7931e;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  margin-bottom: 25px;
}

.notes-section {
  margin-top: 30px;
}

.note {
  font-size: 13px;
  color: #888;
  margin-bottom: 8px;
}
</style>