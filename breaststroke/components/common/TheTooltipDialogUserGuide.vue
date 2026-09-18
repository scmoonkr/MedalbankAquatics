<template>
  <Transition name="fade">
    <div v-if="show" class="tooltip-dialog-overlay" @click.self="close(false)">
      <div class="tooltip-dialog-box">
        <h1>메달뱅크닷컴 간편 메뉴얼</h1>
        <p>
          ■ 한명 이름만 검색하기<br/>
          <span>한 사람 이름만 검색하면 그 이름으로 검색되는 기록을 전부 보여줍니다.</span>
        </p>
        <p>
          ■ 여러명 이름 검색하기<br/>
          <span>여러 선수의 이름을 띄어쓰기로 구분해서 검색하면 각 선수들의 최고기록을 비교해줍니다.</span>
        </p>
        <p>
          ■ 내 프로필 사진 채우기<br/>
          <span>리더보드나 검색시 나의 프로필 사진을 함께 표시해줍니다.</span>
        </p>
        <p>
          ■ 내 경기실적 확인하기<br/>
          <span>처음에는 나와 이름이 같고 성별이 같은 기록이 전부 모여있지만, 내 기록이 아닌 것들은 삭제처리할 수 있어요. 내 기록만 모아둔 내 프로필을 관리할 수 있어요.</span>
        </p>
        <p>
          ■ 이것저것 눌러보기<br/>
          <span>많이 부족합니다. 재미삼아 이것저것 눌러보고 즐겨주세요.</span>
        </p>
        
        
        <button class="button-default button-confirm" @click="close(false)">확인</button>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">

const props = defineProps<{
  show: boolean;
}>();

const emit = defineEmits(['update:show']);

const close = (value: boolean) => {
  emit('update:show', value);
};
</script>

<style scoped>
</style>
