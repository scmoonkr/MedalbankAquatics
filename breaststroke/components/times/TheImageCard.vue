<!-- components/times/TheImageCard.vue -->
<template>
  <div class="image-picker-container">
    <!-- Image picker input -->
    <div class="input-container">
      <input type="file" accept="image/*" @change="handleImageChange" ref="fileInput" class="file-input" />
      <button @click="triggerFileInput" class="picker-button">
        이미지 선택
      </button>
    </div>

    <!-- Toggle for text color -->
    <div class="toggle-container">
      <span :class="{ active: !isDarkText }">흰색</span>
      <label class="switch">
        <input type="checkbox" v-model="isDarkText" />
        <span class="slider"></span>
      </label>
      <span :class="{ active: isDarkText }">검정색</span>
    </div>

    <!-- Card templates -->
    <div class="cards-container">
      <!-- Template 1 -->
      <div class="card template-1" :style="cardStyle">
        <div class="medalbank-logo">MEDALBANK</div>
        <div class="card-content">
          <div class="header">
            <div class="title" :class="textColorClass">문성태#1</div>
            <div class="subtitle" :class="textColorClass">마스터즈 수영선수</div>
            <div class="stats" :class="textColorClass">
              <span class="gold"><img :src="goldMedalSrc" alt="Gold" /> 0</span>
              <span class="silver"><img :src="silverMedalSrc" alt="Silver" /> 1</span>
              <span class="bronze"><img :src="bronzeMedalSrc" alt="Bronze" /> 1</span>
            </div>
            <div class="date" :class="textColorClass">2025년 03월 23일 필승하기로...</div>
          </div>
        </div>
      </div>

      <!-- Template 2 (Similar layout) -->
      <div class="card template-2" :style="cardStyle">
        <div class="medalbank-logo">MEDALBANK</div>
        <div class="card-content">
          <div class="header">
            <div class="title" :class="textColorClass">문성태#1</div>
            <div class="subtitle" :class="textColorClass">마스터즈 수영선수</div>
            <div class="stats" :class="textColorClass">
              <span class="gold"><img :src="goldMedalSrc" alt="Gold" /> 0</span>
              <span class="silver"><img :src="silverMedalSrc" alt="Silver" /> 1</span>
              <span class="bronze"><img :src="bronzeMedalSrc" alt="Bronze" /> 1</span>
            </div>
            <div class="date" :class="textColorClass">2025년 03월 23일 필승하기로...</div>
          </div>
        </div>
      </div>

      <!-- Template 3 (With logo in a different position) -->
      <div class="card template-3" :style="cardStyle">
        <div class="medalbank-logo">MEDALBANK</div>
        <div class="card-content">
          <div class="header full-width">
            <div class="title" :class="textColorClass">문성태#1</div>
            <div class="subtitle" :class="textColorClass">마스터즈 수영선수</div>
            <div class="stats" :class="textColorClass">
              <span class="gold"><img :src="goldMedalSrc" alt="Gold" /> 0</span>
              <span class="silver"><img :src="silverMedalSrc" alt="Silver" /> 0</span>
              <span class="bronze"><img :src="bronzeMedalSrc" alt="Bronze" /> 0</span>
            </div>
            <div class="date" :class="textColorClass">2025년 03월 23일 필승하기로...</div>
          </div>
        </div>
      </div>

      <!-- Template 4 (Different layout) -->
      <div class="card template-4" :style="cardStyle">
        <div class="medalbank-logo">MEDALBANK</div>
        <div class="card-content">
          <div class="header">
            <div class="title" :class="textColorClass">문성태#1</div>
            <div class="subtitle" :class="textColorClass">마스터즈 수영선수</div>
          </div>
          <div class="footer" :class="textColorClass">
            <div>자유형 50M, 접영 50M</div>
          </div>
        </div>
      </div>

      <!-- Template 5 (Mini version) -->
      <div class="card template-5 mini-card" :style="cardStyle">
        <div class="medalbank-logo mini-logo">MEDALBANK</div>
        <div class="card-content">
          <div class="header">
            <div class="title" :class="textColorClass">문성태#1</div>
            <div class="subtitle small" :class="textColorClass">마스터즈 수영선수</div>
            <div class="stats small" :class="textColorClass">
              <span><img :src="goldMedalSrc" alt="Gold" class="small-medal" /> 0</span>
              <span><img :src="silverMedalSrc" alt="Silver" class="small-medal" /> 1</span>
              <span><img :src="bronzeMedalSrc" alt="Bronze" class="small-medal" /> 1</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'TheImageCard',
  data() {
    return {
      selectedImage: null,
      isDarkText: false,
      // 이미지 경로를 data로 설정합니다
      goldMedalSrc: '/icons/medal_filled_gold.png',
      silverMedalSrc: '/icons/medal_filled_silver.png',
      bronzeMedalSrc: '/icons/medal_filled_bronze.png',
      logoBankSrc: '/images/brststrk_logo_meta.png'
    }
  },
  computed: {
    cardStyle() {
      return this.selectedImage ? {
        backgroundImage: `url(${this.selectedImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      } : {
        backgroundColor: '#f0f0f0'
      }
    },
    textColorClass() {
      return this.isDarkText ? 'dark-text' : 'light-text'
    }
  },
  methods: {
    triggerFileInput() {
      this.$refs.fileInput.click()
    },
    handleImageChange(event) {
      const file = event.target.files[0]
      if (file && file.type.match('image.*')) {
        const reader = new FileReader()
        reader.onload = (e) => {
          this.selectedImage = e.target.result
        }
        reader.readAsDataURL(file)
      }
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
.image-picker-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.input-container {
  width: 100%;
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
}

.file-input {
  display: none;
}

.picker-button {
  padding: 10px 20px;
  background-color: #333;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
}

.picker-button:hover {
  background-color: #555;
}

.toggle-container {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 20px;
}

.toggle-container span {
  font-size: 14px;
  color: #666;
}

.toggle-container span.active {
  color: #000;
  font-weight: bold;
}

.switch {
  position: relative;
  display: inline-block;
  width: 60px;
  height: 30px;
}

.switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ccc;
  transition: .4s;
  border-radius: 30px;
}

.slider:before {
  position: absolute;
  content: "";
  height: 22px;
  width: 22px;
  left: 4px;
  bottom: 4px;
  background-color: white;
  transition: .4s;
  border-radius: 50%;
}

input:checked+.slider {
  background-color: #333;
}

input:checked+.slider:before {
  transform: translateX(30px);
}

.cards-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
  width: 100%;
}

.card {
  position: relative;
  height: 400px;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
}

.mini-card {
  height: 200px;
}

.card-content {
  padding: 20px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 100%;
  position: relative;
  z-index: 1;
}

.header {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.title {
  font-size: 22px;
  font-weight: bold;
}

.subtitle {
  font-size: 16px;
}

.stats {
  display: flex;
  gap: 15px;
  margin-top: 5px;
}

.stats span {
  display: flex;
  align-items: center;
  gap: 5px;
}

.stats img {
  width: 20px;
  height: 20px;
}

.small-medal {
  width: 16px !important;
  height: 16px !important;
}

.date {
  margin-top: 10px;
  font-size: 14px;
}

/* MEDALBANK 로고 스타일 */
.medalbank-logo {
  position: absolute;
  top: 0;
  right: 0;
  width: 50px;
  height: 180px;
  background-color: #000;
  color: #fff;
  display: flex;
  justify-content: center;
  align-items: center;
  writing-mode: vertical-rl;
  text-orientation: mixed;
  font-weight: bold;
  font-size: 16px;
  letter-spacing: 2px;
  z-index: 10;
}

/* 미니 카드용 작은 로고 */
.mini-logo {
  height: 120px;
  font-size: 12px;
}

/* 기존 로고 스타일 - 사용하지 않음 */
.logo-container,
.bottom-logo-container,
.side-logo-container,
.mini-logo-container {
  display: none;
}

.logo {
  width: 40px;
  height: 120px;
  transform: rotate(270deg);
  transform-origin: center;
}

.mini-card .logo {
  width: 30px;
  height: 90px;
}

.footer {
  margin-top: auto;
}

.light-text {
  color: white;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.8);
}

.dark-text {
  color: black;
  text-shadow: 0 1px 2px rgba(255, 255, 255, 0.8);
}

.small {
  font-size: 12px;
}

.full-width {
  width: 100%;
}

/* Template-specific customizations */
.template-1 {
  /* Default styles */
}

.template-2 {
  /* Custom styles for template 2 */
}

.template-3 {
  /* Custom styles for template 3 */
}

.template-4 {
  /* Custom styles for template 4 */
}

.template-5 {
  /* Custom styles for template 5 */
}
</style>