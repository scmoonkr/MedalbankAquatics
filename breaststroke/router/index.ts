// router/index.ts
import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '~/stores/useAuthStore';
import routes from './routes';

// 라우트 정의
// const routes = [
//   {
//     path: '/',
//     name: 'Home',
//     component: () => import('~/pages/HomePage.vue'),
//     meta: { requiresAuth: false }
//   },
//   {
//     path: '/auth/signin',
//     name: 'Login',
//     component: () => import('~/pages/LoginPage.vue'),
//     meta: { requiresAuth: false }
//   },
//   {
//     path: '/auth/signup',
//     name: 'Register',
//     component: () => import('~/pages/signup.vue'),
//     meta: { requiresAuth: false }
//   },
//   {
//     path: '/dashboard',
//     name: 'Dashboard',
//     component: () => import('~/pages/DashboardPage.vue'),
//     meta: { requiresAuth: true }
//   },
//   {
//     path: '/profile',
//     name: 'Profile',
//     component: () => import('~/pages/ProfilePage.vue'),
//     meta: { requiresAuth: true }
//   },
//   {
//     path: '/pages',
//     name: 'Pages',
//     component: () => import('~/pages/PagesListPage.vue'),
//     meta: { requiresAuth: true }
//   },
//   {
//     path: '/pages/create',
//     name: 'CreatePage',
//     component: () => import('~/pages/CreateEditPage.vue'),
//     meta: { requiresAuth: true }
//   },
//   {
//     path: '/pages/:id',
//     name: 'PageDetail',
//     component: () => import('~/pages/PageDetailPage.vue'),
//     meta: { requiresAuth: true }
//   },
//   {
//     path: '/pages/:id/edit',
//     name: 'EditPage',
//     component: () => import('~/pages/CreateEditPage.vue'),
//     meta: {
//       requiresAuth: true,
//       requiresOwnership: true  // 소유권이 필요한 페이지
//     },
//     beforeEnter: async (to, from, next) => {
//       const authStore = useAuthStore();
//       const pageId = parseInt(to.params.id as string);

//       // 페이지 소유권 확인
//       if (authStore.canUserEdit(pageId, 'page')) {
//         next();
//       } else {
//         // 권한이 없으면 에러 페이지로 리다이렉트
//         next({ name: 'Forbidden' });
//       }
//     }
//   },
//   {
//     path: '/admin',
//     name: 'Admin',
//     component: () => import('~/pages/AdminPage.vue'),
//     meta: {
//       requiresAuth: true,
//       requiresAdmin: true  // 관리자 권한이 필요한 페이지
//     }
//   },
//   {
//     path: '/forbidden',
//     name: 'Forbidden',
//     component: () => import('~/pages/ForbiddenPage.vue'),
//     meta: { requiresAuth: false }
//   },
//   {
//     path: '/:pathMatch(.*)*',
//     name: 'NotFound',
//     component: () => import('~/pages/NotFoundPage.vue'),
//     meta: { requiresAuth: false }
//   }
// ];

// 라우터 생성
const router = createRouter({
  history: createWebHistory(),
  routes
});

// router/index.ts 또는 라우터 가드 함수
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore();

  // 페이지의 권한 요구사항 확인
  const requiresLogin = to.meta.login === true;

  if (!requiresLogin) {
    return next(); // 로그인이 필요 없는 페이지는 바로 통과
  }

  // 로그인 필요한 페이지에 대한 처리
  // 스토리지에서 사용자 상태 복원 시도
  if (!authStore.isAuthenticated) {
    await authStore.ensureCurrentUser();
  }

  // 로그인 여부 최종 확인
  if (!authStore.isAuthenticated) {

    // 절대적인 경로 사용
    return next({
      path: '/auth/signin',
      // 쿼리 문자열에 현재 경로 추가
      query: { redirect: to.fullPath }
    });
  }

  // 인증됨 - 원래 페이지로 진행
  return next();
});

// router/index.js
// beforeEach는 유지 (다른 목적으로 사용 가능)

// beforeResolve는 컴포넌트 해석 후, 렌더링 전에 실행됨
router.beforeResolve(async (to, from, next) => {
  const requiresAuth = to.meta.login === true;

  if (!requiresAuth) {
    return next();
  }

  const authStore = useAuthStore();

  // 이미 인증된 경우 진행
  if (authStore.isAuthenticated) {
    return next();
  }

  try {
    // 로컬 스토리지에서 복원 시도
    await authStore.ensureCurrentUser();

    if (authStore.isAuthenticated) {
      return next();
    } else {
      return next({
        path: '/auth/signin',
        query: { redirect: to.fullPath }
      });
    }
  } catch (error) {
    console.error('인증 확인 중 오류:', error);
    return next({
      path: '/auth/signin',
      query: { redirect: to.fullPath }
    });
  }
});

export default router;