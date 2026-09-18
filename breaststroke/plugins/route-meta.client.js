// plugins/route-meta.client.js
export default defineNuxtPlugin(() => {
  const router = useRouter()
  
  // console.log('🚀 route-Route Meta Plugin 초기화됨')
  
  // 기존 router/routes.js의 meta 정보를 여기로 이동
  const routeMetaConfig = {
    // Backend 관련 (관리자 전용)
    '/backend/capture': {
      login: true,
      level: 1,
      role: 'admin'
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
  
  // 동적 라우트 매칭 함수
  const matchRoute = (currentPath, configPath) => {
    // 정확한 매치
    if (currentPath === configPath) {
      return true
    }
    
    // 동적 라우트 매칭 (:param 형태)
    const configSegments = configPath.split('/').filter(Boolean)
    const currentSegments = currentPath.split('/').filter(Boolean)
    
    if (configSegments.length !== currentSegments.length) {
      return false
    }
    
    return configSegments.every((segment, index) => {
      return segment.startsWith(':') || segment === currentSegments[index]
    })
  }
  
  // 라우트 메타 찾기 함수
  const findRouteMeta = (path) => {
    // console.log(`🔍 메타 검색 중: ${path}`)
    
    // 1. 정확한 매치 우선
    if (routeMetaConfig[path]) {
      // console.log(`✅ 정확한 매치 발견: ${path}`)
      return routeMetaConfig[path]
    }
    
    // 2. 동적 라우트 매칭
    for (const [configPath, meta] of Object.entries(routeMetaConfig)) {
      if (matchRoute(path, configPath)) {
        // console.log(`✅ 동적 매치 발견: ${path} → ${configPath}`)
        return meta
      }
    }
    
    // console.log(`❌ 메타 없음: ${path}`)
    return null
  }
  
  // Router beforeEach 가드 등록
  router.beforeEach((to, from) => {
    // console.log(`🛣️  라우트 변경: ${from.path} → ${to.path}`)
    
    // 메타 찾기
    const meta = findRouteMeta(to.path)
    
    if (meta) {
      // 기존 메타와 병합 (덮어쓰기)
      Object.assign(to.meta, meta)
      // console.log(`📝 메타 적용됨 [${to.path}]:`, to.meta)
    } else {
      // console.log(`🔍 메타 없음 [${to.path}] - 기본값 사용`)
    }
    
    return true
  })
  
  // console.log('✅ Route Meta Plugin 설정 완료')
  // console.log('📋 등록된 라우트 수:', Object.keys(routeMetaConfig).length)
})