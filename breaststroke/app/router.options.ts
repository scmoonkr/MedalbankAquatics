// app/router.options.ts
import type { RouterConfig } from '@nuxt/schema'

export default <RouterConfig>{
  routes: (_routes) => {
    // 사용자 정의 라우트 
    const customRoutes = [
      
      // ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
      // ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
      // ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
      // {
      //   name: 'main',
      //   path: '/main',
      //   component: () => import('~/pages/main/index.vue'),
      //   alias: '/'  // 루트 경로를 /main의 앨리어스로 설정
      // },
      {
        name: 'statistics',
        path: '/statistics',
        component: () => import('~/pages/statistics/index.vue'),
        alias: '/'  // 루트 경로를 /main의 앨리어스로 설정
      },
      
      {
        name: 'signup',
        path: '/signup',
        component: () => import('~/pages/auth/signup.vue')
      },
      {
        name: 'signupcomplete',
        path: '/signupcomplete/:registrationNo',
        component: () => import('~/pages/auth/signupcomplete/[registrationNo].vue')
      },
      {
        name: 'signin',
        path: '/signin',
        component: () => import('~/pages/auth/signin.vue')
      },
      // {
      //   name: 'search',
      //   path: '/search',
      //   component: () => import('~/pages/search/index.vue')
      // },
      // {
      //   name: 'leaderboards',
      //   path: '/leaderboards',
      //   component: () => import('~/pages/leaderboards/index.vue')
      // },
      
      // ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
      // ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
      // ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
      {
        name: 'aView',
        path: '/a/:athleteID',
        component: () => import('~/pages/athletes/view/[athleteID].vue')
      },
      {
        name: 'athleteView',
        path: '/athlete/:athleteID',
        component: () => import('~/pages/athletes/view/[athleteID].vue')
      },
      {
        name: 'timeView',
        path: '/time/:timeID',  // 경로 변경
        component: () => import('~/pages/times/view/[timeID].vue')
      },
      {
        name: 'teamView',
        path: '/team/:teamID',  // 경로 변경
        component: () => import('~/pages/teams/view/[teamID].vue')
      },
      {
        name: 'competitionView',
        path: '/competition/:competitionID',  // 경로 변경
        component: () => import('~/pages/competitions/view/[competitionID].vue')
      },
      {
        name: 'poolView',
        path: '/pool/:poolID',  // 경로 변경
        component: () => import('~/pages/pools/view/[poolID].vue')
      },
      // {
      //   name: 'itemView',
      //   path: '/item/:itemID',  // 경로 변경
      //   component: () => import('~/pages/items/view/[itemID].vue')
      // },
      // {
      //   name: 'collectionView',
      //   path: '/collection/:slug',  // 경로 변경
      //   component: () => import('~/pages/collections/view/[slug].vue')
      // },
      // ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
      // ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
      // ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
      {
        name: 'timesList',
        path: '/times',
        component: () => import('~/pages/times/list/index.vue')
      },
      {
        name: 'timesCompetitions',
        path: '/times/competitions',
        component: () => import('~/pages/times/competitions/index.vue')
      },
      {
        name: 'timesSimulationsList',
        path: '/times/simulations',
        component: () => import('~/pages/times/simulations/[competitionID].vue')
      },
      {
        name: 'timesResults',
        path: '/times/results',
        component: () => import('~/pages/times/results/[competitionID].vue')
      },
      // {
      //   name: 'athletesList',
      //   path: '/athletes',
      //   component: () => import('~/pages/athletes/list/index.vue')
      // },
      // {
      //   name: 'teamsList',
      //   path: '/teams/list',
      //   component: () => import('~/pages/teams/list/index.vue')
      // },
      {
        name: 'competitionsList',
        path: '/competitions',
        component: () => import('~/pages/competitions/list/index.vue')
      },
      {
        name: 'poolsList',
        path: '/pools',
        component: () => import('~/pages/pools/list/index.vue')
      },
      // {
      //   name: 'itemsList',
      //   path: '/items',
      //   component: () => import('~/pages/items/list/index.vue')
      // },
      // {
      //   name: 'collectionsList',
      //   path: '/collections',
      //   component: () => import('~/pages/collections/list/index.vue')
      // },
      
      // ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
      // ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
      // ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
      // {
      //   name: 'aEdit',
      //   path: '/a/:athleteID/edit',
      //   component: () => import('~/pages/athletes/edit/[athleteID].vue')
      // },
      // {
      //   name: 'athleteEdit',
      //   path: '/athlete/:athleteID/edit',
      //   component: () => import('~/pages/athletes/edit/[athleteID].vue')
      // },
      {
        name: 'timeEdit',
        path: '/time/:timeID/edit',  // 경로 변경
        component: () => import('~/pages/times/edit/[timeID].vue')
      },
      {
        name: 'teamEdit',
        path: '/team/:teamID/edit',  // 경로 변경
        component: () => import('~/pages/teams/edit/[teamID].vue')
      },
      {
        name: 'competitionEdit',
        path: '/competition/:competitionID/edit',  // 경로 변경
        component: () => import('~/pages/competitions/edit/[competitionID].vue')
      },
      {
        name: 'poolEdit',
        path: '/pool/:poolID/edit',  // 경로 변경
        component: () => import('~/pages/pools/edit/[poolID].vue')
      },
      // ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
      // ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
      // ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
      {
        name: 'pagesMedalbank',
        path: '/medalbank',
        component: () => import('~/pages/pages/medalbank.vue')
      },
      {
        name: 'pagesPrivacy',
        path: '/privacy',
        component: () => import('~/pages/pages/privacy.vue')
      },
      {
        name: 'pagesTerms',
        path: '/terms',
        component: () => import('~/pages/pages/terms.vue')
      },
      {
        name: 'pagesGuidelines',
        path: '/guidelines',
        component: () => import('~/pages/pages/guidelines.vue')
      },
      {
        name: 'pagesLaws',
        path: '/laws',
        component: () => import('~/pages/pages/laws.vue')
      },
      // ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
      // ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
      // ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
      {
        name: 'pagesDotcom',
        path: '/dotcom',
        component: () => import('~/pages/pages/dotcom.vue')
      },
      {
        name: "pagesCafe",
        path: "/cafe",
        component: () => import ("~/pages/pages/cafe.vue")
      },
      {
        name: "pagesStudio",
        path: "/studio",
        component: () => import ("~/pages/pages/studio.vue")
      },
      {
        name: "pagesLab",
        path: "/lab",
        component: () => import ("~/pages/pages/lab.vue")
      },
      {
        name: "pagesMagazine",
        path: "/magazine",
        component: () => import ("~/pages/pages/magazine.vue")
      },
      // {
      //   name: "pagesBreaststroke",
      //   path: "/breaststroke",
      //   component: () => import ("~/pages/pages/breaststroke.vue")
      // },
      {
        name: "pagesInstagram",
        path: "/instagram",
        component: () => import ("~/pages/pages/instagram.vue")
      },
      {
        name: "pagesStore",
        path: "/store",
        component: () => import ("~/pages/pages/store.vue")
      },
      // {
      //   name: "pagesCollection",
      //   path: "/collection",
      //   component: () => import ("~/pages/pages/collections/index.vue")
      // },
      // ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
      // ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
      // ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
    ]

    // 기존 라우트에서 중복되는 경로 제거
    const filteredRoutes = _routes.filter(route =>
      route.path !== '/' && !customRoutes.some(customRoute => customRoute.path === route.path)
    );

    return [...customRoutes, ...filteredRoutes];
  }
}