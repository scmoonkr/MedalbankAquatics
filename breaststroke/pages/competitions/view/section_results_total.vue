<template>
  <div class="team-ranking-container">

    <div class="ranking-visualization">
      <!-- 2위 팀 (왼쪽) -->
      <div class="team-block second-place" v-if="teams.length > 1">
        <div class="rank-number">2</div>
        <div class="team-name">{{ teams[1].name }} ({{ teams[1].points }}점)</div>
        <div class="team-score">
          금:{{ getGoldCount(teams[1]) }}, 은:{{ getSilverCount(teams[1]) }}, 동:{{ getBronzeCount(teams[1]) }}
        </div>
      </div>

      <!-- 1위 팀 (중앙, 더 높은 블록) -->
      <div class="team-block first-place" v-if="teams.length > 0">
        <div class="rank-number">1</div>
        <div class="team-name">{{ teams[0].name }} ({{ teams[0].points }}점)</div>
        <div class="team-score">
          금:{{ getGoldCount(teams[0]) }}, 은:{{ getSilverCount(teams[0]) }}, 동:{{ getBronzeCount(teams[0]) }}
        </div>
      </div>

      <!-- 3위 팀 (오른쪽) -->
      <div class="team-block third-place" v-if="teams.length > 2">
        <div class="rank-number">3</div>
        <div class="team-name">{{ teams[2].name }} ({{ teams[2].points }}점)</div>
        <div class="team-score">
          <!-- <span class="medals"><img :src="goldMedalSrc" alt="Gold" /></span> -->
          금:{{ getGoldCount(teams[2]) }}, 은:{{ getSilverCount(teams[2]) }}, 동:{{ getBronzeCount(teams[2]) }}
        </div>

      </div>
    </div>

    <!-- 추가 순위 리스트 (4위부터) -->
    <!-- <div class="additional-rankings" v-if="teams.length > 3">
      <div v-for="(team, index) in teams.slice(3)" :key="team.teamID" class="team-row">
        <div class="rank-number">{{ index + 4 }}</div>
        <div class="team-name">{{ team.name }}</div>
        <div class="team-count">{{ team.count }}점</div>
      </div>
    </div> -->
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

<script setup lang="ts">
import { computed } from 'vue';
import type { CompetitionExtraInfo, TeamDetail } from '~/models/competitions';

const goldMedalSrc = '/icons/medal_filled_gold.png';
const silverMedalSrc = '/icons/medal_filled_silver.png';
const bronzeMedalSrc = '/icons/medal_filled_bronze.png';

interface CompetitionProps {
  competition: {
    extraInfo: CompetitionExtraInfo;
  } | null;
}

const props = defineProps<CompetitionProps>();

const teams = computed(() => {
  if (!props.competition || props.competition.extraInfo == undefined || !props.competition.extraInfo.teams) {
    return [];
  }
  return props.competition.extraInfo.teams;
});

// 메달 수를 추출하는 함수들 (데이터에 medals 객체가 없으면 0을 반환)
const getGoldCount = (team: TeamDetail): number => {
  return team?.gold || 0;
};

const getSilverCount = (team: TeamDetail): number => {
  return team?.silver || 0;
};

const getBronzeCount = (team: TeamDetail): number => {
  return team?.bronze || 0;
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
.team-ranking-container {
  font-family: 'Noto Sans KR', sans-serif;
  margin: 40px 0;
}

.ranking-title {
  font-size: 24px;
  font-weight: 700;
  margin-bottom: 30px;
}

.ranking-visualization {
  display: flex;
  justify-content: center;
  align-items: flex-end;
  gap: 20px;
  margin-bottom: 40px;
  height: 300px;
}

.team-block {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-end;
  border-radius: 8px 8px 0 0;
  padding: 15px;
  width: 30%;
  position: relative;
  color: #333;
}

.first-place {
  background-color: #FFD966;
  /* 금색 계열 */
  height: 250px;
  z-index: 2;
}

.second-place {
  background-color: #E9E9E9;
  /* 은색 계열 */
  height: 190px;
}

.third-place {
  background-color: #ECBA8C;
  /* 동색 계열 */
  height: 140px;
}

.rank-number {
  font-size: 28px;
  font-weight: 800;
  margin-bottom: 15px;
}

.team-name {
  font-size: 20px;
  font-weight: 700;
  text-align: center;
  margin-bottom: 8px;
}

.team-score {
  font-size: 14px;
  margin-bottom: 8px;
}

.team-count {
  font-size: 16px;
  font-weight: 600;
}

.additional-rankings {
  margin-top: 20px;
}

.team-row {
  display: flex;
  padding: 12px 15px;
  border-bottom: 1px solid #eee;
  align-items: center;
}

.team-row .rank-number {
  font-size: 18px;
  margin-right: 15px;
  margin-bottom: 0;
  width: 30px;
}

.team-row .team-name {
  flex: 1;
  text-align: left;
  margin-bottom: 0;
}

.team-row .team-count {
  margin-left: 15px;
}

/* 추가적인 시각적 요소 - 메달 아이콘 */
.first-place::before {
  content: '🏆';
  position: absolute;
  top: -30px;
  font-size: 28px;
}

.second-place::before,
.third-place::before {
  content: '🏅';
  position: absolute;
  top: -25px;
  font-size: 24px;
}

.medals {
  width: 20px;
  height: 20px;
  font-size: 16px;
}
</style>