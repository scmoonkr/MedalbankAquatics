<template>
  <div v-if="!props.isAuthority" class="relative w-full aspect-[4/5] sm:h-[100px] sm:aspect-auto overflow-hidden bg-slate-100">
    <img v-if="imageUrl" :src="imageUrl" class="absolute inset-0 w-full h-full object-cover" onerror="this.onerror=null;this.src='data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2280%22 height=%22100%22><rect width=%2280%22 height=%22100%22 fill=%22%23e5e7eb%22/></svg>';" />
    <div v-else class="absolute inset-0 w-full h-full object-cover">
      <span class="opacity-10"></span>
    </div>
  </div>

  <div v-else class="relative w-[200px] h-[200px] group">

    <!-- 숨겨진 파일 업로더 -->
    <input id="profile-upload" ref="fileInput" type="file" accept="image/*" class="hidden" @change="onFileChange" />

    <!-- 이미지 표시 또는 기본 안내 -->
    <label for="profile-upload" class="block overflow-hidden bg-gray-100 flex items-center justify-center cursor-pointer w-[200px] h-[200px]">
      <img v-if="imageUrl" :src="imageUrl" class="object-cover transition-opacity duration-300" />
      <div v-else class="bg-gray-200 bg-gray-200 flex items-center justify-center"><span class="opacity-10">프로필 사진 없음</span></div>
    </label>

  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps({
  isAuthority: {
    type: Boolean,
    default: false,
  },
  featured: {
    type: String,
    default: "/cms/images/athletes/23/f",
  },
});

const emit = defineEmits([
  'change-image',
  'remove-image',
]);
const imageUrl = ref('')

imageUrl.value = props.featured;
// modelValue 변경 감지
watch(() => props.featured, (newValue) => {
  imageUrl.value = newValue;
}, { deep: true });

const fileInput = ref<HTMLInputElement | null>(null)
const isHoveringDelete = ref(false)

function onFileChange(event: Event) {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (file) {
    const reader = new FileReader()
    reader.onload = () => {
      imageUrl.value = reader.result as string
      emit('change-image', imageUrl.value, file);
    }
    reader.readAsDataURL(file)
  }
}

function removeImage() {
  imageUrl.value = ''
  isHoveringDelete.value = false // 텍스트 원복
  if (fileInput.value) {
    fileInput.value.value = '' // 업로더 초기화
    emit('remove-image');
  }
}
</script>

<style scoped></style>