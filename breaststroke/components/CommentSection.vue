<!-- components/CommentSection.vue -->
<template>
  <div class="comment-section">
    <h2>댓글 {{ comments.length }}개</h2>

    <!-- 댓글 작성 폼 -->
    <div class="comment-form">
      <textarea v-model="newComment" placeholder="댓글을 입력하세요..." class="comment-input"
        :class="{ 'error': validationError }"></textarea>
      <div v-if="validationError" class="error-message">
        {{ validationError }}
      </div>
      <div class="form-actions">
        <button @click="submitComment" class="submit-btn">댓글 작성</button>
      </div>
    </div>

    <!-- 댓글 정렬 옵션 -->
    <div class="comment-sort">
      <span>정렬: </span>
      <button @click="sortComments('newest')" :class="{ 'active': sortOption === 'newest' }">
        최신순
      </button>
      <button @click="sortComments('oldest')" :class="{ 'active': sortOption === 'oldest' }">
        오래된순
      </button>
      <button @click="sortComments('popular')" :class="{ 'active': sortOption === 'popular' }">
        인기순
      </button>
    </div>

    <!-- 댓글 목록 -->
    <div class="comments-list" v-if="comments.length > 0">
      <div v-for="(comment, index) in sortedComments" :key="comment.id" class="comment-item">
        <div class="comment-header">
          <div class="user-info">
            <img :src="comment.userAvatar" alt="프로필 이미지" class="avatar" />
            <span class="username">{{ comment.username }}</span>
          </div>
          <span class="comment-date">{{ formatDate(comment.date) }}</span>
        </div>

        <div class="comment-content">
          {{ comment.content }}
        </div>

        <div class="comment-actions">
          <div class="rating-buttons">
            <button @click="rateComment(comment.id, 'like')"
              :class="['like-btn', { 'active': comment.userRating === 'like' }]">
              <span class="icon">👍</span>
              <span class="count">{{ comment.likes }}</span>
            </button>
            <button @click="rateComment(comment.id, 'dislike')"
              :class="['dislike-btn', { 'active': comment.userRating === 'dislike' }]">
              <span class="icon">👎</span>
              <span class="count">{{ comment.dislikes }}</span>
            </button>
          </div>

          <div class="comment-buttons">
            <button @click="toggleReplyForm(comment.id)" class="reply-btn">
              답글
            </button>
            <!-- 본인이 작성한 댓글인 경우에만 표시 -->
            <div v-if="comment.isAuthor" class="author-actions">
              <button @click="editComment(comment.id)" class="edit-btn">
                수정
              </button>
              <button @click="deleteComment(comment.id)" class="delete-btn">
                삭제
              </button>
            </div>
          </div>
        </div>

        <!-- 답글 작성 폼 -->
        <div v-if="activeReplyId === comment.id" class="reply-form">
          <textarea v-model="replyText" placeholder="답글을 입력하세요..." class="reply-input"></textarea>
          <div class="form-actions">
            <button @click="submitReply(comment.id)" class="submit-btn">
              답글 작성
            </button>
            <button @click="cancelReply" class="cancel-btn">
              취소
            </button>
          </div>
        </div>

        <!-- 대댓글 목록 -->
        <div v-if="comment.replies && comment.replies.length > 0" class="replies">
          <div v-for="reply in comment.replies" :key="reply.id" class="reply-item">
            <div class="comment-header">
              <div class="user-info">
                <img :src="reply.userAvatar" alt="프로필 이미지" class="avatar" />
                <span class="username">{{ reply.username }}</span>
              </div>
              <span class="comment-date">{{ formatDate(reply.date) }}</span>
            </div>

            <div class="comment-content">
              {{ reply.content }}
            </div>

            <div class="comment-actions">
              <div class="rating-buttons">
                <button @click="rateReply(comment.id, reply.id, 'like')"
                  :class="['like-btn', { 'active': reply.userRating === 'like' }]">
                  <span class="icon">👍</span>
                  <span class="count">{{ reply.likes }}</span>
                </button>
                <button @click="rateReply(comment.id, reply.id, 'dislike')"
                  :class="['dislike-btn', { 'active': reply.userRating === 'dislike' }]">
                  <span class="icon">👎</span>
                  <span class="count">{{ reply.dislikes }}</span>
                </button>
              </div>

              <!-- 본인이 작성한 답글인 경우에만 표시 -->
              <div v-if="reply.isAuthor" class="author-actions">
                <button @click="editReply(comment.id, reply.id)" class="edit-btn">
                  수정
                </button>
                <button @click="deleteReply(comment.id, reply.id)" class="delete-btn">
                  삭제
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 댓글이 없는 경우 -->
    <div v-else class="no-comments">
      아직 댓글이 없습니다. 첫 번째 댓글을 작성해보세요!
    </div>

    <!-- 더 많은 댓글 로드 버튼 -->
    <div v-if="hasMoreComments" class="load-more">
      <button @click="loadMoreComments" class="load-more-btn">
        댓글 더 보기
      </button>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    postId: {
      type: [String, Number],
      required: true
    }
  },
  data() {
    return {
      comments: [
        {
          id: 1,
          username: '김철수',
          userAvatar: 'https://via.placeholder.com/40',
          date: new Date('2025-03-05T14:30:00'),
          content: '정말 유익한 글이네요! 많은 도움이 되었습니다.',
          likes: 15,
          dislikes: 2,
          userRating: null, // 현재 사용자가 평가한 상태
          isAuthor: false, // 현재 사용자가 작성자인지 여부
          replies: [
            {
              id: 101,
              username: '이영희',
              userAvatar: 'https://via.placeholder.com/40',
              date: new Date('2025-03-05T15:20:00'),
              content: '저도 동의합니다. 특히 세 번째 문단이 인상적이었어요.',
              likes: 7,
              dislikes: 0,
              userRating: null,
              isAuthor: false
            }
          ]
        },
        {
          id: 2,
          username: '박민수',
          userAvatar: 'https://via.placeholder.com/40',
          date: new Date('2025-03-06T09:15:00'),
          content: '좋은 정보 감사합니다. 다음 글도 기대할게요!',
          likes: 8,
          dislikes: 1,
          userRating: null,
          isAuthor: true,
          replies: []
        },
        {
          id: 3,
          username: '최지은',
          userAvatar: 'https://via.placeholder.com/40',
          date: new Date('2025-03-06T17:45:00'),
          content: '이 주제에 대해 더 알고 싶은데 추천할 만한 자료가 있을까요?',
          likes: 4,
          dislikes: 0,
          userRating: 'like', // 이미 좋아요를 누른 상태
          isAuthor: false,
          replies: []
        }
      ],
      newComment: '',
      replyText: '',
      activeReplyId: null,
      sortOption: 'newest', // 정렬 옵션 (newest, oldest, popular)
      page: 1,
      limit: 10,
      hasMoreComments: true,
      validationError: ''
    }
  },
  computed: {
    sortedComments() {
      // 댓글 정렬 로직
      const sorted = [...this.comments];

      if (this.sortOption === 'newest') {
        return sorted.sort((a, b) => new Date(b.date) - new Date(a.date));
      } else if (this.sortOption === 'oldest') {
        return sorted.sort((a, b) => new Date(a.date) - new Date(b.date));
      } else if (this.sortOption === 'popular') {
        return sorted.sort((a, b) => (b.likes - b.dislikes) - (a.likes - a.dislikes));
      }

      return sorted;
    }
  },
  methods: {
    formatDate(date) {
      const now = new Date();
      const commentDate = new Date(date);
      const diffInSeconds = Math.floor((now - commentDate) / 1000);

      // 1분 이내
      if (diffInSeconds < 60) {
        return '방금 전';
      }

      // 1시간 이내
      if (diffInSeconds < 3600) {
        const minutes = Math.floor(diffInSeconds / 60);
        return `${minutes}분 전`;
      }

      // 24시간 이내
      if (diffInSeconds < 86400) {
        const hours = Math.floor(diffInSeconds / 3600);
        return `${hours}시간 전`;
      }

      // 7일 이내
      if (diffInSeconds < 604800) {
        const days = Math.floor(diffInSeconds / 86400);
        return `${days}일 전`;
      }

      // 그 외의 경우 전체 날짜 표시
      return commentDate.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    },
    submitComment() {
      // 유효성 검사
      if (!this.newComment.trim()) {
        this.validationError = '댓글 내용을 입력해주세요.';
        return;
      }

      // 새 댓글 객체 생성
      const newComment = {
        id: Date.now(), // 임시 ID
        username: '현재 사용자', // 실제로는 로그인한 사용자 정보를 사용
        userAvatar: 'https://via.placeholder.com/40',
        date: new Date(),
        content: this.newComment.trim(),
        likes: 0,
        dislikes: 0,
        userRating: null,
        isAuthor: true, // 현재 사용자가 작성자
        replies: []
      };

      // 댓글 목록에 추가
      this.comments.unshift(newComment);

      // 폼 초기화
      this.newComment = '';
      this.validationError = '';

      // 실제 구현에서는 여기서 API 호출을 통해 서버에 댓글을 저장합니다
      this.saveCommentToServer(newComment);
    },
    saveCommentToServer(comment) {
      // API 호출 로직
    },
    toggleReplyForm(commentId) {
      if (this.activeReplyId === commentId) {
        this.activeReplyId = null;
        this.replyText = '';
      } else {
        this.activeReplyId = commentId;
        this.replyText = '';
      }
    },
    submitReply(commentId) {
      // 유효성 검사
      if (!this.replyText.trim()) {
        return;
      }

      // 댓글 찾기
      const commentIndex = this.comments.findIndex(c => c.id === commentId);
      if (commentIndex === -1) return;

      // 새 답글 객체 생성
      const newReply = {
        id: Date.now(), // 임시 ID
        username: '현재 사용자', // 실제로는 로그인한 사용자 정보를 사용
        userAvatar: 'https://via.placeholder.com/40',
        date: new Date(),
        content: this.replyText.trim(),
        likes: 0,
        dislikes: 0,
        userRating: null,
        isAuthor: true // 현재 사용자가 작성자
      };

      // 답글 목록에 추가
      if (!this.comments[commentIndex].replies) {
        this.comments[commentIndex].replies = [];
      }
      this.comments[commentIndex].replies.push(newReply);

      // 폼 초기화
      this.replyText = '';
      this.activeReplyId = null;

      // 실제 구현에서는 여기서 API 호출을 통해 서버에 답글을 저장합니다
      this.saveReplyToServer(commentId, newReply);
    },
    saveReplyToServer(commentId, reply) {
      // API 호출 로직
    },
    cancelReply() {
      this.activeReplyId = null;
      this.replyText = '';
    },
    rateComment(commentId, type) {
      const commentIndex = this.comments.findIndex(c => c.id === commentId);
      if (commentIndex === -1) return;

      const comment = this.comments[commentIndex];

      // 평가 상태 변경 로직
      if (comment.userRating === type) {
        // 이미 같은 평가를 한 경우 취소
        comment.userRating = null;
        if (type === 'like') {
          comment.likes--;
        } else {
          comment.dislikes--;
        }
      } else if (comment.userRating === null) {
        // 평가하지 않은 상태에서 평가
        comment.userRating = type;
        if (type === 'like') {
          comment.likes++;
        } else {
          comment.dislikes++;
        }
      } else {
        // 다른 평가로 변경
        if (type === 'like') {
          comment.likes++;
          comment.dislikes--;
        } else {
          comment.dislikes++;
          comment.likes--;
        }
        comment.userRating = type;
      }

      // 서버에 평가 저장
      this.saveRatingToServer(commentId, type);
    },
    rateReply(commentId, replyId, type) {
      const commentIndex = this.comments.findIndex(c => c.id === commentId);
      if (commentIndex === -1) return;

      const replyIndex = this.comments[commentIndex].replies.findIndex(r => r.id === replyId);
      if (replyIndex === -1) return;

      const reply = this.comments[commentIndex].replies[replyIndex];

      // 평가 상태 변경 로직 (댓글 평가와 동일)
      if (reply.userRating === type) {
        reply.userRating = null;
        if (type === 'like') {
          reply.likes--;
        } else {
          reply.dislikes--;
        }
      } else if (reply.userRating === null) {
        reply.userRating = type;
        if (type === 'like') {
          reply.likes++;
        } else {
          reply.dislikes++;
        }
      } else {
        if (type === 'like') {
          reply.likes++;
          reply.dislikes--;
        } else {
          reply.dislikes++;
          reply.likes--;
        }
        reply.userRating = type;
      }

      // 서버에 평가 저장
      this.saveReplyRatingToServer(commentId, replyId, type);
    },
    saveRatingToServer(commentId, type) {
      // API 호출 로직
    },
    saveReplyRatingToServer(commentId, replyId, type) {
      // API 호출 로직
    },
    editComment(commentId) {
      // 댓글 수정 로직
    },
    deleteComment(commentId) {
      // 확인 다이얼로그
      if (!confirm('정말로 이 댓글을 삭제하시겠습니까?')) {
        return;
      }

      // 댓글 목록에서 삭제
      this.comments = this.comments.filter(c => c.id !== commentId);

      // 서버에서 삭제
    },
    editReply(commentId, replyId) {
    },
    deleteReply(commentId, replyId) {
      // 확인 다이얼로그
      if (!confirm('정말로 이 답글을 삭제하시겠습니까?')) {
        return;
      }

      // 답글 목록에서 삭제
      const commentIndex = this.comments.findIndex(c => c.id === commentId);
      if (commentIndex !== -1) {
        this.comments[commentIndex].replies = this.comments[commentIndex].replies.filter(
          r => r.id !== replyId
        );
      }

      // 서버에서 삭제
      // 예: this.$axios.$delete(`/comments/${commentId}/replies/${replyId}`);
    },
    sortComments(option) {
      this.sortOption = option;
    },
    loadMoreComments() {
      this.page++;
      this.fetchComments();
    },
    async fetchComments() {
      // 실제 구현에서는 API 호출을 통해 댓글을 가져옵니다
      // 예: const response = await this.$axios.$get(`/posts/${this.postId}/comments`, {
      //   params: { page: this.page, limit: this.limit, sort: this.sortOption }
      // });

      // 더 이상 댓글이 없는 경우 버튼 숨김
      // if (response.comments.length < this.limit) {
      //   this.hasMoreComments = false;
      // }

      // 댓글 목록에 추가
      // this.comments = [...this.comments, ...response.comments];

      // 여기서는 더 이상 댓글이 없다고 가정
      this.hasMoreComments = false;
    }
  },
  mounted() {
    // 컴포넌트가 마운트될 때 댓글을 가져옵니다
    // this.fetchComments();
  },
  watch: {
    // postId가 변경되면 댓글을 다시 가져옵니다
    postId() {
      this.comments = [];
      this.page = 1;
      this.hasMoreComments = true;
      // this.fetchComments();
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
.comment-section {
  margin-top: 40px;
}

h2 {
  font-size: 1.5rem;
  margin-bottom: 20px;
}

.comment-form {
  background: #f9f9f9;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 30px;
}

.comment-input {
  width: 100%;
  min-height: 100px;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  resize: vertical;
  font-family: inherit;
  font-size: 1rem;
}

.comment-input.error {
  border-color: #e74c3c;
}

.error-message {
  color: #e74c3c;
  margin-top: 5px;
  font-size: 0.9rem;
}

.form-actions {
  margin-top: 10px;
  display: flex;
  justify-content: flex-end;
}

.submit-btn {
  background: #3498db;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  font-weight: bold;
  cursor: pointer;
}

.submit-btn:hover {
  background: #2980b9;
}

.comment-sort {
  display: flex;
  gap: 10px;
  align-items: center;
  margin-bottom: 20px;
  font-size: 0.9rem;
}

.comment-sort button {
  background: none;
  border: none;
  color: #777;
  cursor: pointer;
  padding: 5px;
}

.comment-sort button.active {
  font-weight: bold;
  color: #3498db;
  border-bottom: 2px solid #3498db;
}

.comments-list {
  margin-bottom: 20px;
}

.comment-item {
  background: white;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 15px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.comment-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
}

.username {
  font-weight: bold;
}

.comment-date {
  color: #777;
  font-size: 0.9rem;
}

.comment-content {
  margin-bottom: 15px;
  line-height: 1.5;
}

.comment-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.rating-buttons {
  display: flex;
  gap: 10px;
}

.like-btn,
.dislike-btn {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 6px 10px;
  border: 1px solid #eee;
  border-radius: 20px;
  background: white;
  cursor: pointer;
  font-size: 0.9rem;
}

.like-btn:hover {
  background: #f0f8ff;
}

.dislike-btn:hover {
  background: #fff0f0;
}

.like-btn.active {
  background: #3498db;
  color: white;
  border-color: #3498db;
}

.dislike-btn.active {
  background: #e74c3c;
  color: white;
  border-color: #e74c3c;
}

.comment-buttons {
  display: flex;
  gap: 10px;
}

.reply-btn,
.edit-btn,
.delete-btn {
  background: none;
  border: none;
  cursor: pointer;
  color: #777;
  font-size: 0.9rem;
}

.reply-btn:hover,
.edit-btn:hover {
  color: #3498db;
}

.delete-btn:hover {
  color: #e74c3c;
}

.author-actions {
  display: flex;
  gap: 10px;
}

.reply-form {
  margin-top: 15px;
  background: #f5f5f5;
  padding: 15px;
  border-radius: 8px;
}

.reply-input {
  width: 100%;
  min-height: 80px;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  resize: vertical;
  font-family: inherit;
  font-size: 0.95rem;
}

.cancel-btn {
  background: white;
  border: 1px solid #ddd;
  padding: 8px 15px;
  border-radius: 4px;
  cursor: pointer;
  margin-left: 10px;
}

.replies {
  margin-top: 15px;
  margin-left: 20px;
  border-left: 2px solid #eee;
  padding-left: 20px;
}

.reply-item {
  background: #f9f9f9;
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 10px;
}

.no-comments {
  text-align: center;
  padding: 30px;
  color: #777;
  background: #f9f9f9;
  border-radius: 8px;
}

.load-more {
  text-align: center;
  margin-top: 20px;
}

.load-more-btn {
  background: white;
  border: 1px solid #ddd;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
  color: #555;
}

.load-more-btn:hover {
  background: #f5f5f5;
}

/* 모바일 반응형 */
@media (max-width: 768px) {
  .comment-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 5px;
  }

  .comment-date {
    margin-left: 50px;
  }

  .comment-actions {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }

  .comment-buttons {
    margin-left: 5px;
  }
}
</style>