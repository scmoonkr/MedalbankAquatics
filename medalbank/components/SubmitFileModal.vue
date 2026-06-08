<template>
  <Teleport to="body">
    <div v-if="open" class="sfm-overlay" @click.self="close">
      <div class="sfm-modal" role="dialog" aria-modal="true">
        <button class="sfm-close" type="button" aria-label="닫기" @click="close">×</button>

        <!-- 로그인 필요 -->
        <template v-if="!loggedIn">
          <div class="sfm-head">
            <div class="sfm-eyebrow">파일 업로드 · FILE UPLOAD</div>
            <h2>로그인이 필요합니다.</h2>
            <p class="sfm-desc">
              사고 방지를 위해 본인확인을 위해 네이버 로그인이 필요합니다.
            </p>
          </div>
          <div class="sfm-login-cta">
            <a href="/auth/naver" class="sfm-btn-naver">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M16.273 12.845L7.376 0H0v24h7.727V11.155L16.624 24H24V0h-7.727z"/></svg>
              네이버로 로그인
            </a>
          </div>
        </template>

        <!-- 업로드 폼 -->
        <template v-else-if="!done">
          <div class="sfm-head">
            <div class="sfm-eyebrow">파일 업로드 · FILE UPLOAD</div>
            <h2>기록지 파일 업로드</h2>
          </div>

          <div class="sfm-body">

            <div class="sfm-fields">
              <!-- 대회명 -->
              <div class="sfm-field">
                <label>대회명 <span class="req">*</span></label>
                <input v-model="competitionName" type="text" placeholder="2024 전국체육대회" required />
              </div>

              <!-- 대회일자 -->
              <div class="sfm-field">
                <label>대회일자</label>
                <div class="sfm-row">
                  <input
                    v-model="datetime"
                    type="text"
                    placeholder="YYYY-MM-DD"
                    inputmode="numeric"
                    maxlength="10"
                    :disabled="dateUnknown"
                    @input="onDateInput"
                    @focus="dateUnknown = false"
                  />
                  <button
                    type="button"
                    class="sfm-unknown"
                    :class="{ active: dateUnknown }"
                    @click="dateUnknown = !dateUnknown; if (dateUnknown) datetime = ''"
                  >모름</button>
                </div>
              </div>
            </div>

            <label class="sfm-upload-btn" :class="{ uploading }">
              <span v-if="uploading" class="sfm-upload-spinner">업로드 중…</span>
              <template v-else>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                  <polyline points="17 8 12 3 7 8"/>
                  <line x1="12" y1="3" x2="12" y2="15"/>
                </svg>
                파일 업로드
              </template>
              <input
                type="file"
                accept=".xlsx,.pdf"
                hidden
                :disabled="uploading"
                @change="onFileChange"
              />
            </label>

            <p v-if="uploadError" class="sfm-error">{{ uploadError }}</p>

            <p class="sfm-guide">
              위 버튼을 누르고 기록지 파일(.xlsx, .pdf)을 선택하면 바로 업로드 되고,
              올려주신 내용은 검증 후 자동 반영됩니다.<br>
              사고 방지를 위해 본인확인을 위해 네이버 로그인이 필요합니다.
            </p>
          </div>
        </template>

        <!-- 완료 -->
        <div v-if="done" class="sfm-done">
          <div class="sfm-done-icon">✓</div>
          <h3>기록지 파일 업로드가 완료되었습니다.</h3>
          <p>소중한 제보 감사합니다.<br>기록지 내용 검토 후 일괄 반영하겠습니다. 감사합니다.</p>
        </div>

      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
const props = defineProps<{ open: boolean }>()
const emit  = defineEmits<{ (e: 'close'): void }>()

const { loggedIn } = useUserSession()

const uploading       = ref(false)
const uploadError     = ref('')
const done            = ref(false)
const competitionName = ref('')
const datetime        = ref('')
const dateUnknown     = ref(false)

function close() {
  emit('close')
}

// SubmitModal과 동일한 날짜 자동 포맷 (YYYY-MM-DD)
function onDateInput(e: Event) {
  const digits = (e.target as HTMLInputElement).value.replace(/\D/g, '').slice(0, 8)
  let fmt = digits
  if (digits.length > 6) fmt = `${digits.slice(0,4)}-${digits.slice(4,6)}-${digits.slice(6)}`
  else if (digits.length > 4) fmt = `${digits.slice(0,4)}-${digits.slice(4)}`
  datetime.value = fmt
}

watch(() => props.open, (v) => {
  if (v) {
    uploading.value       = false
    uploadError.value     = ''
    done.value            = false
    competitionName.value = ''
    datetime.value        = ''
    dateUnknown.value     = false
  }
})

async function onFileChange(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return

  // 대회명은 필수
  if (!competitionName.value.trim()) {
    uploadError.value = '대회명을 입력해 주세요.'
    ;(e.target as HTMLInputElement).value = ''
    return
  }

  uploading.value   = true
  uploadError.value = ''

  try {
    const fd = new FormData()
    fd.append('file', file)
    fd.append('competitionName', competitionName.value.trim())
    fd.append('datetime', dateUnknown.value ? '' : datetime.value.trim())
    await $fetch('/api/upload-sheet', { method: 'POST', body: fd })

    // 즉시 완료 상태 + 자동 닫기
    done.value = true
    setTimeout(() => close(), 3000)
  } catch (err: any) {
    uploadError.value = err?.data?.statusMessage || '업로드에 실패했습니다. 다시 시도해 주세요.'
  } finally {
    uploading.value = false
    // input 초기화 (같은 파일 재선택 가능하도록)
    ;(e.target as HTMLInputElement).value = ''
  }
}
</script>

<style scoped>
.sfm-overlay {
  position: fixed; inset: 0; z-index: 900;
  background: rgba(0,0,0,0.55);
  display: flex; align-items: flex-start; justify-content: center;
  padding: 24px 16px; overflow-y: auto;
}
.sfm-modal {
  position: relative; width: 100%; max-width: 480px;
  background: var(--bg); border: 1px solid var(--line);
  padding: 48px 40px 44px;
  animation: sfmIn 0.18s ease;
  margin: auto;
}
@keyframes sfmIn {
  from { opacity: 0; transform: translateY(-10px); }
  to   { opacity: 1; transform: translateY(0); }
}
.sfm-close {
  position: absolute; top: 16px; right: 20px;
  background: none; border: none; cursor: pointer;
  font-size: 22px; line-height: 1; color: var(--fg-mute);
  padding: 4px 8px;
}
.sfm-close:hover { color: var(--fg); }

.sfm-eyebrow {
  font-family: var(--sans); font-size: 10px; font-weight: 500;
  letter-spacing: 0.22em; text-transform: uppercase; color: var(--fg-faint);
  margin-bottom: 10px;
}
.sfm-head h2 {
  font-family: var(--serif-ko); font-size: 24px; font-weight: 400;
  margin: 0 0 8px;
}
.sfm-desc {
  font-family: var(--sans); font-size: 13px; color: var(--fg-mute);
  line-height: 1.7; margin: 0 0 28px;
}

/* Login CTA */
.sfm-login-cta { display: flex; justify-content: center; padding: 8px 0; }
.sfm-btn-naver {
  display: inline-flex; align-items: center; gap: 10px;
  background: #03C75A; color: #fff;
  font-family: var(--sans); font-size: 14px; font-weight: 600;
  padding: 13px 28px; border: none; cursor: pointer;
  text-decoration: none;
}
.sfm-btn-naver:hover { background: #02b350; }

/* Upload area */
.sfm-body {
  display: flex; flex-direction: column; align-items: center;
  gap: 24px; padding-top: 8px;
}

/* 입력 폼 (SubmitModal과 동일한 스타일) */
.sfm-fields {
  display: flex; flex-direction: column; gap: 16px; width: 100%;
}
.sfm-field { display: flex; flex-direction: column; gap: 6px; }
.sfm-field label {
  font-family: var(--sans); font-size: 10px; font-weight: 500;
  letter-spacing: 0.14em; text-transform: uppercase; color: var(--fg-mute);
}
.req { color: var(--accent, #c00); margin-left: 2px; }
.sfm-field input {
  background: var(--bg-soft, #f8f8f8); border: 1px solid var(--line);
  color: var(--fg); font-family: var(--sans); font-size: 13px;
  padding: 0 11px; height: 38px; width: 100%;
  box-sizing: border-box; outline: none;
  transition: border-color 0.15s;
}
.sfm-field input:focus { border-color: var(--fg-mute); }
.sfm-field input:disabled {
  opacity: 0.4; cursor: not-allowed; background: var(--bg-soft);
}
.sfm-row { display: flex; }
.sfm-row input { flex: 1; border-right: none; }
.sfm-unknown {
  height: 38px; padding: 0 13px; flex-shrink: 0;
  border: 1px solid var(--line); background: var(--bg-soft);
  font-family: var(--sans); font-size: 12px; font-weight: 500;
  color: var(--fg-mute); cursor: pointer; white-space: nowrap;
  transition: background 0.15s, color 0.15s, border-color 0.15s;
}
.sfm-unknown:hover { color: var(--fg); border-color: var(--fg-mute); }
.sfm-unknown.active {
  background: var(--fg); color: var(--bg); border-color: var(--fg);
}
.sfm-upload-btn {
  display: inline-flex; align-items: center; justify-content: center;
  gap: 10px; cursor: pointer;
  width: 100%; height: 72px;
  border: 1.5px dashed var(--line);
  background: var(--bg-soft);
  font-family: var(--sans); font-size: 15px; font-weight: 500;
  letter-spacing: 0.04em; color: var(--fg-dim);
  transition: border-color 0.15s, color 0.15s, background 0.15s;
}
.sfm-upload-btn:not(.uploading):hover {
  border-color: var(--fg-mute);
  color: var(--fg);
  background: var(--bg);
}
.sfm-upload-btn.uploading {
  cursor: default; opacity: 0.6;
}
.sfm-upload-spinner {
  font-size: 13px; letter-spacing: 0.06em; color: var(--fg-mute);
}

.sfm-error {
  font-family: var(--sans); font-size: 12.5px; color: #c00;
  padding: 8px 12px; border: 1px solid #c00;
  width: 100%; text-align: center;
}

.sfm-guide {
  font-family: var(--serif-ko); font-size: 13px;
  color: var(--fg-faint); line-height: 1.85;
  text-align: center; margin: 0;
  max-width: 360px;
}

/* Done state */
.sfm-done {
  display: flex; flex-direction: column;
  align-items: center; gap: 14px;
  text-align: center; padding: 16px 0 8px;
}
.sfm-done-icon { font-size: 40px; color: #03C75A; }
.sfm-done h3 {
  font-family: var(--serif-ko); font-size: 19px; font-weight: 400;
  margin: 0; line-height: 1.5;
}
.sfm-done p {
  font-family: var(--serif-ko); font-size: 14px; line-height: 1.85;
  color: var(--fg-dim); margin: 0;
}

@media (max-width: 760px) {
  .sfm-overlay { align-items: flex-start; padding: 0; }
  .sfm-modal {
    border: 0; padding: 36px 22px 40px;
    min-height: 100vh; min-height: 100dvh;
    max-width: none;
  }
}
</style>
