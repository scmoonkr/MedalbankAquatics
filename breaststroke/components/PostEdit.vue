<!-- components/PostEdit.vue -->
<template>
  <div class="post-edit">
    <!-- 로딩 상태 표시 -->
    <div v-if="loading" class="loading-overlay">
      <div class="loading-spinner"></div>
      <p>{{ loadingMessage }}</p>
    </div>

    <!-- 에러 메시지 -->
    <div v-if="error" class="error-message">
      <p>{{ error }}</p>
      <button @click="error = null" class="close-btn">닫기</button>
    </div>

    <!-- 성공 메시지 -->
    <div v-if="successMessage" class="success-message">
      <p>{{ successMessage }}</p>
      <button @click="successMessage = null" class="close-btn">닫기</button>
    </div>

    <form @submit.prevent="submitPost" class="post-form">
      <h2 class="form-title">{{ isEditMode ? '게시물 수정' : '새 게시물 작성' }}</h2>

      <!-- 카테고리 선택 -->
      <div class="form-group">
        <label for="category">카테고리</label>
        <select id="category" v-model="post.category" required class="form-input">
          <option value="" disabled>카테고리를 선택하세요</option>
          <option v-for="category in categories" :key="category.id" :value="category.id">
            {{ category.name }}
          </option>
        </select>
      </div>

      <!-- 제목 입력 -->
      <div class="form-group">
        <label for="title">제목</label>
        <input type="text" id="title" v-model="post.title" required placeholder="제목을 입력하세요" class="form-input"
          maxlength="100" />
        <span class="char-count">{{ post.title.length }}/100</span>
      </div>

      <!-- 내용 입력 -->
      <div class="form-group">
        <label for="content">내용</label>
        <div class="editor-toolbar">
          <button type="button" @click="formatText('bold')" class="toolbar-btn" title="굵게">
            <strong>B</strong>
          </button>
          <button type="button" @click="formatText('italic')" class="toolbar-btn" title="기울임">
            <em>I</em>
          </button>
          <button type="button" @click="formatText('heading')" class="toolbar-btn" title="제목">
            H
          </button>
          <button type="button" @click="formatText('link')" class="toolbar-btn" title="링크">
            🔗
          </button>
          <button type="button" @click="formatText('image')" class="toolbar-btn" title="이미지">
            🖼️
          </button>
          <button type="button" @click="formatText('list')" class="toolbar-btn" title="목록">
            •
          </button>
        </div>
        <textarea id="content" v-model="post.content" required placeholder="내용을 입력하세요" class="form-textarea" rows="10"
          ref="contentEditor"></textarea>
        <span class="char-count">{{ post.content.length }}/5000</span>
      </div>

      <!-- 이미지 업로드 -->
      <div class="form-group">
        <label for="image">이미지 업로드 (선택)</label>
        <div class="file-upload">
          <input type="file" id="image" @change="handleImageUpload" accept="image/*" multiple class="file-input"
            ref="fileInput" />
          <button type="button" @click="triggerFileInput" class="browse-btn">파일 선택</button>
          <span class="file-info">{{ fileInfo }}</span>
        </div>

        <!-- 업로드된 이미지 미리보기 -->
        <div v-if="imagePreviewUrls.length > 0" class="image-previews">
          <div v-for="(url, index) in imagePreviewUrls" :key="index" class="image-preview-item">
            <img :src="url" alt="미리보기" class="preview-image" />
            <button type="button" @click="removeImage(index)" class="remove-image-btn">
              &times;
            </button>
          </div>
        </div>
      </div>

      <!-- 태그 입력 -->
      <div class="form-group">
        <label for="tags">태그 (쉼표로 구분)</label>
        <input type="text" id="tags" v-model="tagsInput" placeholder="예: 태그1, 태그2, 태그3" class="form-input" />
        <div v-if="tags.length > 0" class="tags-list">
          <span v-for="(tag, index) in tags" :key="index" class="tag-item">
            {{ tag }}
            <button type="button" @click="removeTag(index)" class="remove-tag-btn">
              &times;
            </button>
          </span>
        </div>
      </div>

      <!-- 공개 설정 -->
      <div class="form-group">
        <label class="visibility-label">공개 설정</label>
        <div class="radio-group">
          <label class="radio-label">
            <input type="radio" v-model="post.visibility" value="public" name="visibility" />
            <span>전체 공개</span>
          </label>
          <label class="radio-label">
            <input type="radio" v-model="post.visibility" value="private" name="visibility" />
            <span>비공개</span>
          </label>
        </div>
      </div>

      <!-- 옵션 설정 -->
      <div class="form-group">
        <label class="options-label">추가 옵션</label>
        <div class="checkbox-group">
          <label class="checkbox-label">
            <input type="checkbox" v-model="post.allowComments" name="allowComments" />
            <span>댓글 허용</span>
          </label>
          <label class="checkbox-label">
            <input type="checkbox" v-model="post.isNotice" name="isNotice" />
            <span>공지사항으로 등록</span>
          </label>
        </div>
      </div>

      <!-- 작성 완료 버튼 -->
      <div class="form-actions">
        <button type="button" @click="cancel" class="cancel-btn">취소</button>
        <button type="submit" class="submit-btn" :disabled="isSubmitting">
          {{ isSubmitting ? '처리 중...' : (isEditMode ? '수정하기' : '등록하기') }}
        </button>
      </div>
    </form>
  </div>
</template>

<script>
export default {
  props: {
    postId: {
      type: [Number, String],
      default: null
    }
  },
  data() {
    return {
      isEditMode: false,
      loading: false,
      loadingMessage: '',
      error: null,
      successMessage: null,
      isSubmitting: false,
      post: {
        id: null,
        category: '',
        title: '',
        content: '',
        visibility: 'public',
        allowComments: true,
        isNotice: false,
        images: []
      },
      categories: [
        { id: 1, name: '공지사항' },
        { id: 2, name: '자유게시판' },
        { id: 3, name: '질문과답변' },
        { id: 4, name: '갤러리' },
        { id: 5, name: '자료실' }
      ],
      tagsInput: '',
      tags: [],
      imageFiles: [],
      imagePreviewUrls: [],
      fileInfo: '최대 5개 파일, 파일당 5MB 이하'
    }
  },
  created() {
    // 편집 모드인 경우 게시물 데이터 로드
    this.isEditMode = !!this.postId
    if (this.isEditMode) {
      this.loadPost()
    }
  },
  methods: {
    async loadPost() {
      this.loading = true
      this.loadingMessage = '게시물을 불러오는 중입니다...'

      try {
        // 실제 구현에서는 API 호출로 데이터 로드
        // const response = await this.$axios.$get(`/posts/${this.postId}`)

        // 데모 목적의 가상 데이터
        await new Promise(resolve => setTimeout(resolve, 800))

        // 서버에서 받은 데이터로 post 객체 업데이트
        this.post = {
          id: this.postId,
          category: 2,
          title: '수정할 게시물 제목',
          content: '수정할 게시물 내용입니다. 여기에 본문이 들어갑니다.',
          visibility: 'public',
          allowComments: true,
          isNotice: false,
          images: []
        }

        // 태그 설정
        this.tagsInput = '예시태그1, 예시태그2, 개발'
        this.updateTags()

        // 이미지 미리보기 설정
        this.imagePreviewUrls = [
          'https://via.placeholder.com/300x200?text=Image1'
        ]

      } catch (error) {
        this.error = '게시물을 불러오는 데 실패했습니다. 다시 시도해주세요.'
        console.error('게시물 로드 오류:', error)
      } finally {
        this.loading = false
      }
    },

    updateTags() {
      if (this.tagsInput) {
        this.tags = this.tagsInput.split(',')
          .map(tag => tag.trim())
          .filter(tag => tag !== '')
      } else {
        this.tags = []
      }
    },

    removeTag(index) {
      this.tags.splice(index, 1)
      this.tagsInput = this.tags.join(', ')
    },

    triggerFileInput() {
      this.$refs.fileInput.click()
    },

    handleImageUpload(event) {
      const files = event.target.files

      if (files.length > 0) {
        // 최대 5개 파일로 제한
        const totalFiles = this.imageFiles.length + files.length
        if (totalFiles > 5) {
          this.error = '이미지는 최대 5개까지 업로드할 수 있습니다.'
          return
        }

        // 파일 크기 검사 및 미리보기 생성
        for (let i = 0; i < files.length; i++) {
          const file = files[i]

          // 파일 크기 제한 (5MB)
          if (file.size > 5 * 1024 * 1024) {
            this.error = '파일 크기는 5MB 이하여야 합니다.'
            continue
          }

          // 미리보기 URL 생성
          const reader = new FileReader()
          reader.onload = (e) => {
            this.imagePreviewUrls.push(e.target.result)
          }
          reader.readAsDataURL(file)

          // 파일 목록에 추가
          this.imageFiles.push(file)
        }
      }
    },

    removeImage(index) {
      this.imagePreviewUrls.splice(index, 1)
      this.imageFiles.splice(index, 1)
    },

    formatText(type) {
      const textarea = this.$refs.contentEditor
      const start = textarea.selectionStart
      const end = textarea.selectionEnd
      const selectedText = this.post.content.substring(start, end)
      let formattedText = ''

      switch (type) {
        case 'bold':
          formattedText = `**${selectedText}**`
          break
        case 'italic':
          formattedText = `*${selectedText}*`
          break
        case 'heading':
          formattedText = `\n# ${selectedText}\n`
          break
        case 'link':
          formattedText = `[${selectedText}](url)`
          break
        case 'image':
          formattedText = `![${selectedText || '이미지 설명'}](이미지URL)`
          break
        case 'list':
          formattedText = `\n- ${selectedText.split('\n').join('\n- ')}`
          break
      }

      // 텍스트 교체
      this.post.content =
        this.post.content.substring(0, start) +
        formattedText +
        this.post.content.substring(end)

      // 커서 위치 조정
      this.$nextTick(() => {
        textarea.focus()
        const newPosition = start + formattedText.length
        textarea.setSelectionRange(newPosition, newPosition)
      })
    },

    async submitPost() {
      if (this.isSubmitting) return

      // 태그 업데이트
      this.updateTags()

      // 유효성 검사
      if (!this.validateForm()) {
        return
      }

      this.isSubmitting = true
      this.loading = true
      this.loadingMessage = this.isEditMode ? '게시물을 수정 중입니다...' : '게시물을 등록 중입니다...'

      try {
        // API 요청 데이터 준비
        const formData = new FormData()
        formData.append('category', this.post.category)
        formData.append('title', this.post.title)
        formData.append('content', this.post.content)
        formData.append('visibility', this.post.visibility)
        formData.append('allowComments', this.post.allowComments)
        formData.append('isNotice', this.post.isNotice)
        formData.append('tags', JSON.stringify(this.tags))

        // 이미지 파일 추가
        this.imageFiles.forEach((file, index) => {
          formData.append(`image${index}`, file)
        })

        // 실제 구현에서는 API 호출
        // let response
        // if (this.isEditMode) {
        //   response = await this.$axios.$put(`/posts/${this.postId}`, formData)
        // } else {
        //   response = await this.$axios.$post('/posts', formData)
        // }

        // 데모 목적의 지연
        await new Promise(resolve => setTimeout(resolve, 1200))

        // 성공 메시지 표시
        this.successMessage = this.isEditMode ?
          '게시물이 성공적으로 수정되었습니다.' :
          '게시물이 성공적으로 등록되었습니다.'

        // 잠시 후 목록 또는 상세 페이지로 이동
        setTimeout(() => {
          if (this.isEditMode) {
            // 상세 페이지로 이동
            // this.$router.push(`/posts/${this.postId}`)
            this.$emit('post-updated', this.postId)
          } else {
            // 목록 페이지로 이동
            // this.$router.push('/posts')
            this.$emit('post-created')
          }
        }, 1500)

      } catch (error) {
        this.error = this.isEditMode ?
          '게시물 수정 중 오류가 발생했습니다. 다시 시도해주세요.' :
          '게시물 등록 중 오류가 발생했습니다. 다시 시도해주세요.'
        console.error('게시물 저장 오류:', error)
      } finally {
        this.isSubmitting = false
        this.loading = false
      }
    },

    validateForm() {
      // 기본 필드 검사
      if (!this.post.category) {
        this.error = '카테고리를 선택해주세요.'
        return false
      }

      if (!this.post.title.trim()) {
        this.error = '제목을 입력해주세요.'
        return false
      }

      if (this.post.title.length > 100) {
        this.error = '제목은 100자 이내로 입력해주세요.'
        return false
      }

      if (!this.post.content.trim()) {
        this.error = '내용을 입력해주세요.'
        return false
      }

      if (this.post.content.length > 5000) {
        this.error = '내용은 5000자 이내로 입력해주세요.'
        return false
      }

      return true
    },

    cancel() {
      if (this.isEditMode) {
        // 상세 페이지로 돌아가기
        // this.$router.push(`/posts/${this.postId}`)
        this.$emit('cancel-edit')
      } else {
        // 목록 페이지로 돌아가기
        // this.$router.push('/posts')
        this.$emit('cancel-create')
      }
    }
  },
  watch: {
    tagsInput() {
      this.updateTags()
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
.post-edit {
  position: relative;
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(255, 255, 255, 0.8);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: 10;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid rgba(0, 0, 0, 0.1);
  border-left-color: #3498db;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 10px;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}

.error-message,
.success-message {
  padding: 15px;
  border-radius: 5px;
  margin-bottom: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.error-message {
  background-color: #ffebee;
  color: #d32f2f;
  border: 1px solid #ef9a9a;
}

.success-message {
  background-color: #e8f5e9;
  color: #2e7d32;
  border: 1px solid #a5d6a7;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1rem;
  color: inherit;
  cursor: pointer;
}

.post-form {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  padding: 25px;
}

.form-title {
  font-size: 1.5rem;
  font-weight: bold;
  margin-bottom: 25px;
  color: #333;
  text-align: center;
}

.form-group {
  margin-bottom: 20px;
}

label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #333;
}

.form-input,
.form-textarea {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  transition: border-color 0.2s;
}

.form-input:focus,
.form-textarea:focus {
  border-color: #3498db;
  outline: none;
}

.form-textarea {
  resize: vertical;
  min-height: 200px;
}

.char-count {
  display: block;
  text-align: right;
  font-size: 0.8rem;
  color: #777;
  margin-top: 5px;
}

.editor-toolbar {
  display: flex;
  border: 1px solid #ddd;
  border-bottom: none;
  border-top-left-radius: 4px;
  border-top-right-radius: 4px;
  overflow: hidden;
}

.toolbar-btn {
  padding: 8px 12px;
  background: #f5f5f5;
  border: none;
  border-right: 1px solid #ddd;
  cursor: pointer;
  font-size: 1rem;
}

.toolbar-btn:hover {
  background: #e0e0e0;
}

.toolbar-btn:last-child {
  border-right: none;
}

.file-upload {
  display: flex;
  align-items: center;
}

.file-input {
  display: none;
}

.browse-btn {
  padding: 8px 15px;
  background-color: #f5f5f5;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  margin-right: 10px;
}

.browse-btn:hover {
  background-color: #e0e0e0;
}

.file-info {
  font-size: 0.9rem;
  color: #777;
}

.image-previews {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 15px;
}

.image-preview-item {
  position: relative;
  width: 100px;
  height: 100px;
  border: 1px solid #ddd;
  border-radius: 4px;
  overflow: hidden;
}

.preview-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.remove-image-btn {
  position: absolute;
  top: 5px;
  right: 5px;
  width: 20px;
  height: 20px;
  background-color: rgba(0, 0, 0, 0.5);
  color: white;
  border: none;
  border-radius: 50%;
  font-size: 1rem;
  line-height: 1;
  padding: 0;
  cursor: pointer;
}

.remove-image-btn:hover {
  background-color: rgba(0, 0, 0, 0.7);
}

.tags-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 10px;
}

.tag-item {
  background-color: #e0f7fa;
  color: #00838f;
  padding: 5px 10px;
  border-radius: 16px;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
}

.remove-tag-btn {
  background: none;
  border: none;
  color: #00838f;
  margin-left: 5px;
  cursor: pointer;
  font-size: 1rem;
  line-height: 1;
  padding: 0 0 0 5px;
}

.visibility-label,
.options-label {
  margin-bottom: 10px;
}

.radio-group,
.checkbox-group {
  display: flex;
  gap: 20px;
}

.radio-label,
.checkbox-label {
  display: flex;
  align-items: center;
  cursor: pointer;
}

.radio-label input,
.checkbox-label input {
  margin-right: 8px;
}

.form-actions {
  display: flex;
  justify-content: center;
  gap: 15px;
  margin-top: 30px;
}

.cancel-btn,
.submit-btn {
  padding: 10px 20px;
  border-radius: 4px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
}

.cancel-btn {
  background-color: #f5f5f5;
  border: 1px solid #ddd;
  color: #555;
}

.cancel-btn:hover {
  background-color: #e0e0e0;
}

.submit-btn {
  background-color: #3498db;
  border: none;
  color: white;
}

.submit-btn:hover {
  background-color: #2980b9;
}

.submit-btn:disabled {
  background-color: #95a5a6;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .post-edit {
    padding: 15px;
  }

  .post-form {
    padding: 20px;
  }

  .radio-group,
  .checkbox-group {
    flex-direction: column;
    gap: 10px;
  }

  .image-preview-item {
    width: 80px;
    height: 80px;
  }
}
</style>