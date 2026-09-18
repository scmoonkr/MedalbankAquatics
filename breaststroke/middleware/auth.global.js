// middleware/auth.global.js 수정
import { useAuthStore } from '~/stores/useAuthStore'

export default defineNuxtRouteMiddleware(async (to) => {
  console.log("++++++++++++++++++auth.global.js+++++++++++++++++++++");
  // 서버 사이드에서는 실행하지 않음
  if (process.server) return

  const authStore = useAuthStore()
  if ('/auth/signin' === to.path) return;

  console.log('auth.global === Auth Middleware 실행 === +++')
  console.log('이동할 페이지:', to.path)
  console.log('라우트 메타 (원본):', to.meta)
  
  // Plugin과 동일한 설정을 Middleware에서 직접 가져오기
  const routeMeta = getRouteMetaFromConfig(to.path)
  // console.log('설정에서 가져온 메타:', routeMeta)
  
  // 설정 메타가 있으면 우선 사용, 없으면 라우트 메타 사용
  const { login: requiresLogin, level: requiredLevel, role: requiredRole } = routeMeta || to.meta
  
  
  // 1. 로그인이 필요하지 않은 페이지는 바로 통과
  if (!requiresLogin) {
    console.log('✅ 로그인 불필요 - 통과')
    return
  }

  console.log('최종 권한 요구사항:', { requiresLogin, requiredLevel, requiredRole })

  console.log('isAuthenticated, role, level:', authStore.isAuthenticated, authStore.userRole, authStore.userLevel, )
  // 2. 사용자 인증 상태 확인
  if (!authStore.isAuthenticated || !authStore.userRole || !authStore.userLevel) {
    console.log('🔄 인증되지 않음 - 사용자 정보 복원 시도')
    await authStore.ensureCurrentUser()
    console.log('af.ensureCurrentUser', authStore.currentUser)
    
    authStore.userLevel = authStore.currentUser?.level || 0;
    authStore.userRole = authStore.currentUser?.role || 'guest';
    // authStore.isAuthenticated = authStore.currentUser?.userID > 0;
    console.log(authStore.currentUser?.level, 'af.af.isAuthenticated, role, level:', authStore.isAuthenticated, authStore.userRole, authStore.userLevel, )


    if (!authStore.isAuthenticated) {
      console.log('❌ 인증 실패 - 로그인 페이지로 이동---')
      return navigateTo({
        path: '/auth/signin',
        query: { redirect: to.fullPath }
      })
    }
  }

  const user = authStore.currentUser
  console.log('현재 사용자:', {
    id: user?.userID,
    name: user?.name,
    level: user?.level,
    role: user?.role
  })
  
  // 3. Level 권한 체크
  if (requiredLevel !== undefined && requiredLevel > 0) {
    console.log(`🔒 레벨 체크: 필요(${requiredLevel}) vs 사용자(${authStore.userLevel})`)
    
    if (authStore.userLevel < requiredLevel) {
      console.warn(`❌ 권한 부족: 필요 레벨 ${requiredLevel}, 현재 레벨 ${authStore.userLevel}`)
      return navigateTo({
        path: '/403',
        query: { 
          reason: 'level',
          required: requiredLevel,
          current: authStore.userLevel
        }
      })
    }
    console.log('✅ 레벨 권한 통과')
  }

  // 4. Role 권한 체크
  if (requiredRole) {
    const userRole = user?.role || ''
    // console.log(`👤 역할 체크: 필요(${requiredRole}) vs 사용자(${userRole})`)
    
    if (userRole !== requiredRole) {
      // console.warn(`❌ 역할 불일치: 필요 역할 ${requiredRole}, 현재 역할 ${userRole}`)
      return navigateTo({
        path: '/auth/signin',
        query: { 
          reason: 'role',
          required: requiredRole,
          current: userRole
        }
      })
    }
    // console.log('✅ 역할 권한 통과')
  }

  // console.log('🎉 모든 권한 체크 통과 - 페이지 이동 허용')
})

// Plugin과 동일한 설정 및 로직 (middleware 내부에 포함)
function getRouteMetaFromConfig(path) {
  const routeMetaConfig = {
    // Backend 관련 (관리자 전용)
    '/backend/capture': {
      login: true,
      // level: 1,
      role: 'admin'
    },
    
    // 시스템 페이지들 (로그인 불필요)
    '/403': {
      login: false,
      level: 0
    },
    '/auth/signin': {
      login: false,
      level: 0
    },
    '/': {
      login: false,
      level: 0
    },
    
    // Times 관련
    '/times/competitions': {
      login: false,
      level: 0
    },
    '/times/results': {
      login: false,
      level: 0
    },
    '/times/simulations': {
      login: false,
      level: 0
    },
    
    // 동적 라우트들 - Times
    '/time/:timeID': {
      login: false,
      level: 0
    },
    '/time/edit/:timeID': {
      login: true,
      level: 0
    },
    
    // Athletes 관련
    '/athletes': {
      login: false,
      level: 0
    },
    '/athlete/:athleteID': {
      login: false,
      level: 0
    },
    '/a/:athleteID': {
      login: false,
      level: 0
    },
    
    // Competitions 관련
    '/competitions': {
      login: false,
      level: 0
    },
    '/competition/:competitionID': {
      login: false,
      level: 0
    },
    '/competition/edit/:competitionID': {
      login: true,
      level: 0
    },
    
    // Pools 관련
    '/pools': {
      login: false,
      level: 0
    },
    '/pool/:poolID': {
      login: false,
      level: 0
    },
    '/pool/edit/:poolID': {
      login: true,
      level: 0
    },
    
    // Teams 관련
    '/team/:teamID': {
      login: false,
      level: 0
    },
    '/team/edit/:teamID': {
      login: true,
      level: 0
    },
    
    // Pages 관련 (모두 로그인 필요)
    // '/medalbank': {
    //   login: true,
    //   level: 0
    // },
    // '/privacy': {
    //   login: true,
    //   level: 0
    // },
    // '/terms': {
    //   login: true,
    //   level: 0
    // },
    // '/guidelines': {
    //   login: true,
    //   level: 0
    // },
    // '/laws': {
    //   login: true,
    //   level: 0
    // },
    // '/dotcom': {
    //   login: true,
    //   level: 0
    // },
    // '/cafe': {
    //   login: true,
    //   level: 0
    // },
    // '/studio': {
    //   login: true,
    //   level: 0
    // },
    // '/lab': {
    //   login: true,
    //   level: 0
    // },
    // '/magazine': {
    //   login: true,
    //   level: 0
    // },
    // '/breaststroke': {
    //   login: true,
    //   level: 0
    // },
    // '/instagram': {
    //   login: true,
    //   level: 0
    // },
    // '/store': {
    //   login: true,
    //   level: 0
    // }
  }
  
  // 정확한 매치
  if (routeMetaConfig[path]) {
    return routeMetaConfig[path]
  }
  
  // 동적 라우트 매칭
  for (const [configPath, meta] of Object.entries(routeMetaConfig)) {
    if (matchRoute(path, configPath)) {
      return meta
    }
  }
  
  return null
}

// 동적 라우트 매칭 함수
function matchRoute(currentPath, configPath) {
  if (currentPath === configPath) return true
  
  const configSegments = configPath.split('/').filter(Boolean)
  const currentSegments = currentPath.split('/').filter(Boolean)
  
  if (configSegments.length !== currentSegments.length) return false
  
  return configSegments.every((segment, index) => {
    return segment.startsWith(':') || segment === currentSegments[index]
  })
}