<template>
  <div class="cards-container">
    <!-- 카드 1: 내 프로필 -->
    <div class="card profile-card border-radius-apple">
      <div class="card-icon">
        <i class="user-icon"></i>
      </div>
      <div class="card-content">
        <h3>내 프로필 관리</h3>
        <p>선수 프로필에서 직접 내용을 추가하고, 수정하고, 삭제해 주세요. 실제 경기에서 작성한 "대회기록"뿐 아니라 명소에 추정하는 "훈련기록" 데이터들을 찾아 분석할 수 있습니다. 이 모든 정보는
          기록회원과 디테일하게 서둘 반영됩니다.</p>
      </div>
    </div>

    <!-- 카드 2: 자유형 기록 -->
    <div class="card time-card">
      <div class="card-content">
        <h3 class="time-display">00:00.00</h3>
        <p>자유형 50M LCM</p>
      </div>
      <div class="card-action">
        <div class="medal-badge">MEDALBANK</div>
      </div>
    </div>

    <!-- 카드 3: 대회 기록 -->
    <div class="card time-card">
      <div class="card-content">
        <h3 class="time-display">00:00.00</h3>
        <p>누락된 대회기록 올리기</p>
      </div>
      <div class="card-action">
        <div class="medal-badge">MEDALBANK</div>
      </div>
    </div>

    <!-- 카드 4: 훈련 기록 -->
    <div class="card action-card">
      <div class="card-content">
        <h3>새로운 훈련기록 올리기</h3>
      </div>
    </div>

    <!-- 카드 5: 누락된 대회기록 안내 -->
    <div class="card info-card">
      <div class="card-content">
        <h3>누락된 대회기록을 올리고 싶어요</h3>
        <p>누락된 대회기록을 직접 올릴 수 있습니다. 본인이 디녀온 대회가 검색되지 않는다면, 인스타그램 @medalbankaquatics DM 주시면 조치하겠습니다. 대회가 검색이 되어야 그 대회에
          기록을 올릴 수 있습니다.</p>
      </div>
    </div>

    <!-- 카드 6: 리더보드 -->
    <div class="card info-card">
      <div class="card-icon">
        <i class="leaderboard-icon"></i>
      </div>
      <div class="card-content">
        <h3>리더보드</h3>
        <p>우리나라 수영의 오늘을 실시간으로 전합합니다. 지금까지 이용해오신 선수 및 기록 정보 서비스의 연장입니다. 새로 업력하는 결과 또한 손쉽게 바로 반영됩니다. 대한민국 수영 선수 및 기록 정보
          서비스의 새로운 시작입니다. 공식적으로 제공되는 기록치 또는 선관적 기록을 통해 정리한 순위표 등을 복합한 메달뱅크의 관리부서에서 관리하고, 선수 본인이 간편하게 최종 승인합니다.</p>
      </div>
    </div>

    <!-- 카드 7: 기록지 -->
    <div class="card info-card">
      <div class="card-icon">
        <i class="archive-icon"></i>
      </div>
      <div class="card-content">
        <h3>기록지</h3>
        <p>실시간으로 업데이트는 정보를 정리보관합니다. 결과(기록)뿐만 아니라, 선수, 단체(팀/클럽), 대회, 수영장에 관련된 정보와 더불어 각각 데이터에 얽맞는 추산정보를 살펴보실 수 있습니다. 각
          대회의 대회신기록을 살펴볼 수 있고, 각 수영장의 수영장신기록 또한 메달뱅크가 저동정리합니다.</p>
      </div>
    </div>

    <!-- 카드 8: 시뮬레이터 -->
    <div class="card info-card">
      <div class="card-icon">
        <i class="simulator-icon"></i>
      </div>
      <div class="card-content">
        <h3>시뮬레이터(공식중)</h3>
        <p>시합 전 자신의 결과를 예상해볼 수 있는 대전예상 서비스입니다. 그동안 많은 분들께서 이용해주신 '히트시트'에서 더 개선된 방법을 제시하기 위해 잠시만 운영을 중단합니다. 빠른 시일 내에
          재개하도록 하겠습니다.</p>
      </div>
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
// 스크립트 코드가 필요하다면 여기에 추가
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
.cards-container {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
}

.card {
  background-color: #f5f5f5;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  height: 100%;
  position: relative;
}

.profile-card,
.info-card {
  padding: 20px;
}

.time-card {
  display: flex;
  justify-content: space-between;
  padding: 20px;
}

.action-card {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100px;
  background-color: #fff;
  cursor: pointer;
  transition: background-color 0.3s;
}

.action-card:hover {
  background-color: #eaeaea;
}

.card-icon {
  width: 40px;
  height: 40px;
  margin-bottom: 15px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.card-content {
  flex: 1;
}

.card-content h3 {
  font-size: 18px;
  margin-bottom: 10px;
  color: #333;
}

.card-content p {
  font-size: 14px;
  line-height: 1.5;
  color: #666;
}

.time-display {
  font-size: 26px;
  font-weight: bold;
  margin-bottom: 5px;
}

.medal-badge {
  background-color: #000;
  color: white;
  padding: 5px 10px;
  font-size: 12px;
  font-weight: bold;
  white-space: nowrap;
}

/* 아이콘 스타일 */
.user-icon,
.leaderboard-icon,
.archive-icon,
.simulator-icon {
  width: 24px;
  height: 24px;
  background-color: #333;
  border-radius: 50%;
}

/* 반응형 디자인 */
@media (max-width: 768px) {
  .cards-container {
    grid-template-columns: 1fr;
  }
}
</style>