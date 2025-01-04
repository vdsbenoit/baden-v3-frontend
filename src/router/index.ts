import { ROLES } from '@/constants';
import { isRankingPublic } from '@/utils/app';
import { getRoleByValue, getUserProfile } from '@/utils/userProfile';
import OnboardingPage from '@/views/OnboardingPage.vue';
import { createRouter, createWebHistory } from '@ionic/vue-router';
import { RouteRecordRaw } from 'vue-router';
import { getCurrentUser } from 'vuefire';
import HomePageVue from '../views/HomePage.vue';
import { toastPopup } from '../utils/popup';

const routes: Array<RouteRecordRaw> = [
  { 
    path: '', 
    redirect: '/guest',
  },
  {
    name: 'guest',
    path: '/guest',
    component: () => import ('../views/GuestHomePage.vue'),
    meta: { notAuthenticated: true }
  },
  {
    name: 'login',
    path: '/login',
    component: () => import ('../views/LoginPage.vue'),
    meta: { notAuthenticated: true }
  },
  {
    name: 'home',
    path: '/home',
    component: HomePageVue,
    meta: { minimumRole: ROLES.Newbie }
  },
  {
    name: 'onboarding',
    path: '/onboarding',
    component: OnboardingPage,
    meta: { minimumRole: ROLES.Newbie }
  },
  {
    name: 'myProfile',
    path: '/profile',
    component: () => import ('../views/ProfilePage.vue'),
    meta: { minimumRole: ROLES.Newbie }
  },
  {
    name: 'profile',
    path: '/profile/:userId',
    component: () => import ('../views/ProfilePage.vue'),
    meta: { minimumRole: ROLES.Participant }
  },
  {
    name: 'teams',
    path: '/team/:teamId',
    component: () => import ('../views/TeamPage.vue'),
    meta: { minimumRole: ROLES.Participant }
  },
  {
    name: 'game',
    path: '/game/:gameId',
    component: () => import ('../views/GamePage.vue'),
    meta: { minimumRole: ROLES.Participant }
  },
  {
    name: 'games',
    path: '/games',
    component: () => import ('../views/GamesPage.vue'),
    meta: { minimumRole: ROLES.Participant }
  },
  {
    name: 'match',
    path: '/match/:matchId',
    component: () => import ('../views/MatchPage.vue'),
    meta: { minimumRole: ROLES.Participant }
  },
  {
    name: 'section',
    path: '/section/:sectionId?',
    component: () => import ('../views/PlayerSectionsPage.vue'),
    meta: { minimumRole: ROLES.Participant }
  },
  {
    name: 'attendant',
    path: '/attendant/:sectionId?',
    component: () => import ('../views/AttendantSectionsPage.vue'),
    meta: { minimumRole: ROLES.Animateur }
  },
  {
    name: 'applicants',
    path: '/applicants',
    props: true,
    component: () => import ('../views/ApplicantsPage.vue'),
    meta: { minimumRole: ROLES.Chef }
  },
  {
    name: 'checkScores',
    path: '/check-scores',
    component: () => import ('../views/CheckScoresPage.vue'),
    meta: { minimumRole: ROLES.Organisateur }
  },
  {
    name: 'ranking',
    path: '/ranking',
    component: () => import ('../views/RankingPage.vue'),
    meta: { minimumRole: ROLES.Organisateur }
  },
  {
    name: 'settings',
    path: '/settings',
    component: () => import ('../views/SettingsPage.vue'),
    meta: { minimumRole: ROLES.Administrateur }
  },
  {
    name: 'users',
    path: '/users',
    props: true,
    component: () => import ('../views/LatestUsersPage.vue'),
    meta: { minimumRole: ROLES.Administrateur }
  },
  {
    name: 'about',
    path: '/about',
    component: () => import ('../views/AboutPage.vue'),
    meta: { minimumRole: ROLES.Anonyme }
  },
  { 
    path: "/:catchAll(.*)",
    component: () => import ('../views/NotFoundPage.vue'),
    meta: { minimumRole: ROLES.Anonyme }
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

router.beforeEach(async (to) => {
  if (to.meta.minimumRole && to.meta.minimumRole === ROLES.Anonyme) return true
  const currentUser = await getCurrentUser()
  // if the user is not connected
  if(!currentUser) {
    // if the pages does not require authentication, let the user access it
    if (to.meta.notAuthenticated) return true
    // else, redirect to login
    console.log("User is not connected, redirecting to login");
    toastPopup("Tu dois être connecté pour accéder à cette page");
    return {
      path: '/login',
      query: {
        // we keep the current path in the query so we can
        // redirect to it after login with `router.push(route.query.redirect || '/')`
        redirect: to.fullPath
      },
    }
  }
  // if the user is connected and try to open the guest page, redirect to home
  if (to.name === "guest") return '/home'
  // if the user is connected and try to open the login page, redirect to home
  if (to.name === "login"){
    toastPopup("Tu es déjà connecté");
    return '/home'
  }
  if (to.name === "ranking") {
    const _isRankingPublic = await isRankingPublic()
    if (_isRankingPublic) return true
  }
  const userProfile = await getUserProfile(currentUser.uid)  // fixme : limit the number of calls to the db
  if (!userProfile) {
    toastPopup("Nous n'avons pas retrouvé ton profil dans la base de données")
    console.error("Could not find user profile in the db")
    return false
  }
  if (to.name === "onboarding"){
    if (userProfile.hasDoneOnboarding) {
      toastPopup("Tu as déjà fait l'onboarding");
      return '/home';
    }
  }
  if (!userProfile.hasDoneOnboarding && to.name !== "onboarding") {
    console.log("User is newbie, redirecting to onboarding instead of ", to.name);
    return '/onboarding'
  }
  if (!to.meta.minimumRole) return true
  if (userProfile.role >= +to.meta.minimumRole) return true
  toastPopup(`Tu n'as pas le droit d'accéder à la page ${to.name?.toString()} avec ton role (${getRoleByValue(userProfile.role)})`);
  console.error(
    `The user ${userProfile.email} with the role ${userProfile.role} tried to access ${to.name?.toString()} which requires the role ${getRoleByValue(+to.meta?.minimumRole)}`
  )
  return false  
})

export default router
