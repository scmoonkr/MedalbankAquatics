// router/routes.js
const routes = [    
    {
        name: "backendCapture",
        path: "/backend/capture",
        component: () =>
            import ("/pages/backend/capture/index.vue"),
        meta: { login: true, level: 1, role: 'admin' }
    },
    {
        // ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
        // ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
        // ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
        name: "timesCompetitionsList",
        path: "/times/competitions",
        component: () =>
            import ("/pages/times/competitions/index.vue"),
        meta: { login: false, level: 0 }
    },
    {
        name: "timesResultsList",
        path: "/times/results",
        component: () =>
            import ("/pages/times/results/index.vue"),
        meta: { login: false, level: 0 }
    },
    {
        name: "timesSimulationsList",
        path: "/times/simulations",
        component: () =>
            import ("/pages/times/simulations/index.vue"),
        meta: { login: false, level: 0 }
    },
    {
        name: "timesView",
        path: "/time/:timeID",
        component: () =>
            import ("/pages/times/view/[timeID].vue"),
        meta: { login: false, level: 0 }
    },
    {
        name: "timesEdit",
        path: "/time/edit/:timeID",
        component: () =>
            import ("/pages/times/edit/[timeID].vue"),
        meta: { login: true, level: 0 }
    },
    // ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
    // ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
    // ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
    {
        name: "athletesList",
        path: "/athletes",
        component: () =>
            import ("/pages/athletes/list/index.vue"),
        meta: { login: false, level: 0 }
    },
    {
        name: "athletesView",
        path: "/athlete/:athleteID",
        component: () =>
            import ("/pages/athlete/[athleteID].vue"),
        meta: { login: false, level: 0 }
    },
    {
        name: "athletesView",
        path: "/a/:athleteID",
        component: () =>
            import ("/pages/athlete/[athleteID].vue"),
        meta: { login: false, level: 0 }
    },
    // {
    //     name: "athletesEdit",
    //     path: "/athlete/edit/:athleteID",
    //     component: () =>
    //         import ("/pages/athlete/edit/[athleteID].vue"),
    //     meta: { login: true, level: 0 }
    // },
    // ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
    // ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
    // ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
    {
        name: "competitionsList",
        path: "/competitions",
        component: () =>
            import ("/pages/competitions/list/index.vue"),
        meta: { login: false, level: 0 }
    },
    {
        name: "competitionsView",
        path: "/competition/:competitionID",
        component: () =>
            import ("/pages/competitions/view/[competitionID].vue"),
        meta: { login: false, level: 0 }
    },
    {
        name: "competitionsEdit",
        path: "/competition/edit/:competitionID",
        component: () =>
            import ("/pages/competitions/edit/[competitionID].vue"),
        meta: { login: true, level: 0 }
    },
    // ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
    // ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
    // ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
    {
        name: "poolsList",
        path: "/pools",
        component: () =>
            import ("/pages/pools/list/index.vue"),
        meta: { login: false, level: 0 }
    },
    {
        name: "poolsView",
        path: "/pool/:poolID",
        component: () =>
            import ("/pages/pools/view/[poolID].vue"),
        meta: { login: false, level: 0 }
    },
    {
        name: "poolsEdit",
        path: "/pool/edit/:poolID",
        component: () =>
            import ("/pages/pools/edit/[poolID].vue"),
        meta: { login: true, level: 0 }
    },
    // ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
    // ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
    // ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
    // { name: "teamsList", path: "/teams", component: () => import("/pages/teams/list/index.vue"), meta: { login: false, level: 0 } },
    {
        name: "teamsView",
        path: "/team/:teamID",
        component: () =>
            import ("/pages/teams/view/[teamID].vue"),
        meta: { login: false, level: 0 }
    },
    {
        name: "teamsEdit",
        path: "/team/edit/:teamID",
        component: () =>
            import ("/pages/teams/edit/[teamID].vue"),
        meta: { login: true, level: 0 }
    },
    // ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
    // ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
    // ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
    // { name: "itemsList", path: "/items/list", component: () => import("/pages/items/list/index.vue"), meta: { login: false, level: 0 } },
    // { name: "itemsView", path: "/items/view/:itemID", component: () => import("/pages/items/view/[itemID].vue"), meta: { login: false, level: 0 } },
    // { name: "itemsEdit", path: "/items/edit/:itemID", component: () => import("/pages/items/edit/[itemID].vue"), meta: { login: true, level: 0 } },

    // ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
    // ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
    // ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
    // { name: "ootdList", path: "/ootd/list", component: () => import("/pages/ootd/list/index.vue"), meta: { login: false, level: 0 } },
    // { name: "ootdView", path: "/ootd/view/:ootdID", component: () => import("/pages/ootd/view/[ootdID].vue"), meta: { login: false, level: 0 } },
    // { name: "ootdEdit", path: "/ootd/edit/:ootdID", component: () => import("/pages/ootd/edit/[ootdID].vue"), meta: { login: true, level: 0 } },

    // ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
    // ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
    // ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
    // { name: "backendTimes", path: "/backend/times", component: () => import("/pages/backend/times/index.vue"), meta: { login: true, level: 7 } },
    // { name: "backendManage", path: "/backend/manage", component: () => import("/pages/backend/manage/index.vue"), meta: { login: true, level: 9 } },

    // ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
    // ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
    // ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
    {
        name: "pagesMedalbank",
        path: "/medalbank",
        component: () =>
            import ("/pages/pages/medalbank.vue"),
        meta: { login: true, level: 0 }
    },
    {
        name: "pagesPrivacy",
        path: "/privacy",
        component: () =>
            import ("/pages/pages/privacy.vue"),
        meta: { login: true, level: 0 }
    },
    {
        name: "pagesTerms",
        path: "/terms",
        component: () =>
            import ("/pages/pages/terms.vue"),
        meta: { login: true, level: 0 }
    },
    {
        name: "pagesGuidelines",
        path: "/guidelines",
        component: () =>
            import ("/pages/pages/guidelines.vue"),
        meta: { login: true, level: 0 }
    },
    {
        name: "pagesLaws",
        path: "/laws",
        component: () =>
            import ("/pages/pages/laws.vue"),
        meta: { login: true, level: 0 }
    },
    {
        name: "pagesDotcom",
        path: "/dotcom",
        component: () =>
            import ("/pages/pages/dotcom.vue"),
        meta: { login: true, level: 0 }
    },
    {
        name: "pagesCafe",
        path: "/cafe",
        component: () =>
            import ("/pages/pages/cafe.vue"),
        meta: { login: true, level: 0 }
    },
    {
        name: "pagesStudio",
        path: "/studio",
        component: () =>
            import ("/pages/pages/studio.vue"),
        meta: { login: true, level: 0 }
    },
    {
        name: "pagesLab",
        path: "/lab",
        component: () =>
            import ("/pages/pages/lab.vue"),
        meta: { login: true, level: 0 }
    },
    {
        name: "pagesMegazine",
        path: "/magazine",
        component: () =>
            import ("/pages/pages/magazine.vue"),
        meta: { login: true, level: 0 }
    },
    {
        name: "pagesBreaststroke",
        path: "/breaststroke",
        component: () =>
            import ("/pages/pages/breaststroke.vue"),
        meta: { login: true, level: 0 }
    },
    {
        name: "pagesInstagram",
        path: "/instagram",
        component: () =>
            import ("/pages/pages/instagram.vue"),
        meta: { login: true, level: 0 }
    },
    {
        name: "pagesStore",
        path: "/store",
        component: () =>
            import ("/pages/pages/store.vue"),
        meta: { login: true, level: 0 }
    },
    {
        name: "pagesCollection",
        path: "/collection",
        component: () =>
            import ("/pages/pages/collection.vue"),
        meta: { login: true, level: 0 }
    },
];

export default routes;