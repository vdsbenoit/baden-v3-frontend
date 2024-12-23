<template>
  <ion-app class="dark">
    <ion-split-pane content-id="main-content">
      <ion-menu content-id="main-content" type="overlay">
        <ion-content style="height: 100%">
          <ion-list id="menu-list">
            <ion-list-header>Baden Battle</ion-list-header>
            <ion-note class="ion-text-uppercase">score app</ion-note>

            <ion-menu-toggle :auto-hide="false" v-for="(p, i) in appPages" :key="i">
              <ion-item router-direction="root" :router-link="p.url" lines="none" :detail="false" class="hydrated" :class="{ selected: isSelected(p.url) }">
                <ion-icon slot="start" :ios="p.iosIcon" :md="p.mdIcon"></ion-icon>
                <ion-label>{{ p.title }}</ion-label>
              </ion-item>
            </ion-menu-toggle>
              <ion-item lines="none" class="no-pointer ion-margin-bottom hydrated" :detail="false">
                <ion-icon slot="start" :ios="moonOutline" :md="moonSharp" ></ion-icon>
                <ion-label>
                  Dark Mode
                </ion-label>
                <ion-toggle :checked="isDarkModeEnabled"></ion-toggle>
              </ion-item>
          </ion-list>
        </ion-content>
        <ion-menu-toggle :auto-hide="false">
          <ion-footer collapse="fade" class="ion-padding" @click="router.replace('/profile')">
            <div v-if="userProfile">
              <ion-text>Connecté en tant que {{ name }}</ion-text>
            </div>
            <div v-else>
              <ion-text>Pas authentifié</ion-text>
            </div>
          </ion-footer>
        </ion-menu-toggle>
      </ion-menu>
      <ion-router-outlet id="main-content"></ion-router-outlet>
    </ion-split-pane>
  </ion-app>
</template>

<script setup lang="ts">
// prettier-ignore
import { IonApp, IonContent, IonFooter, IonIcon, IonItem, IonLabel, IonList, IonListHeader, IonMenu, IonMenuToggle, IonNote, IonRouterOutlet, IonSplitPane, IonText, IonToggle } from "@ionic/vue";
import { useLocalStorage } from "@vueuse/core";
import { checkmarkCircleOutline, checkmarkCircleSharp, footballOutline, footballSharp, homeOutline, homeSharp, informationCircleOutline, informationCircleSharp, moonOutline, moonSharp, optionsOutline, optionsSharp, peopleCircleOutline, peopleCircleSharp, peopleOutline, peopleSharp, personAddOutline, personAddSharp, personCircleOutline, personCircleSharp, trophyOutline, trophySharp, } from "ionicons/icons";
import { computed, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useAppConfig, useAppSettings } from "./composables/app";
import { useCurrentUserProfile } from "./composables/userProfile";
import { ROLES } from "./constants";

const router = useRouter();
const route = useRoute();
const appSettings = useAppSettings()
const appConfig = useAppConfig()
const userProfile = useCurrentUserProfile()

// reactive data

const isDarkModeEnabled = useLocalStorage("darkMode", false)

// Watchers
watch(isDarkModeEnabled, (shouldEnable: boolean) => {
  if (shouldEnable) document.body.classList.add('dark');
  else document.body.classList.remove('dark');
})

// Computed

const name = computed(() => {
  if (!userProfile.value) return "undefined";
  return userProfile.value.name
});
const appPages = computed(() => {
  if (!userProfile.value) return [guestHomePage, loginPage, aboutPage];
  let pages = [homePage];
  if (userProfile.value.team) pages = [...pages,  {
      title: "Mon Equipe",
      url: `/team/${userProfile.value.team}`,
      iosIcon: peopleCircleOutline,
      mdIcon: peopleCircleSharp,
  }]
  if (userProfile.value.role >= ROLES.Animateur) {
    if (userProfile.value.games && appConfig.value) {
      for (const timeSlot of appConfig.value.attendantSchedule) {
        pages = [...pages, {
          title: `Mon épreuve (${timeSlot.name})`,
          url: `/game/${userProfile.value.games[timeSlot.id]}`,
          iosIcon: footballOutline,
          mdIcon: footballSharp,
        }]
      }
    }
    if (userProfile.value.sectionId) pages = [...pages, {
      title: "Ma section",
      url: `/attendant/${userProfile.value.sectionId}`,
      iosIcon: peopleSharp,
      mdIcon: peopleSharp,
    }]
    if (userProfile.value.role >= ROLES.Chef) pages = [...pages, applicantsPage];
    pages = [...pages, attendantsPage];
  }
  if (userProfile.value.role == ROLES.Participant) pages = [...pages, {
    title: "Ma section",
    url: `/section/${userProfile.value.sectionId}`,
    iosIcon: peopleSharp,
    mdIcon: peopleSharp,
  }];
  if (userProfile.value.role > ROLES.Newbie) pages = [...pages, sectionsPage, gamesPage];
  if (userProfile.value.role >= ROLES.Organisateur) pages = [...pages, checkScoresPage];
  if (appSettings.value?.isRankingPublic || userProfile.value.role >= ROLES.Organisateur) pages = [...pages, rankingPage];
  if (userProfile.value.role >= ROLES.Administrateur) pages = [...pages, settingsPage];
  // bottom pages
  pages = [...pages, profilePage,  aboutPage];
  return pages;
});

// Methods

const isSelected = (url: string) => url === route.path;

// Data

const checkScoresPage = {
  title: "Check Scores",
  url: "/check-scores",
  iosIcon: checkmarkCircleOutline,
  mdIcon: checkmarkCircleSharp,
}
const rankingPage = {
  title: "Classement",
  url: "/ranking",
  iosIcon: trophyOutline,
  mdIcon: trophySharp,
}
const settingsPage = {
  title: "Paramètres",
  url: "/settings",
  iosIcon: optionsOutline,
  mdIcon: optionsSharp,
}
const homePage =   {
  title: "Accueil",
  url: "/home",
  iosIcon: homeOutline,
  mdIcon: homeSharp,
}
const guestHomePage =   {
  title: "Accueil",
  url: "/guest", 
  iosIcon: homeOutline,
  mdIcon: homeSharp,
}
const loginPage =   {
  title: "Connexion",
  url: "/login",
  iosIcon: personCircleOutline,
  mdIcon: personCircleSharp,
}
const profilePage = {
  title: "Profil",
  url: "/profile",
  iosIcon: personCircleOutline,
  mdIcon: personCircleSharp,
}
const aboutPage = {
  title: "A propos",
  url: "/about",
  iosIcon: informationCircleOutline,
  mdIcon: informationCircleSharp,
}
const sectionsPage = {
  title: "Sections",
  url: "/sections",
  iosIcon: peopleOutline,
  mdIcon: peopleOutline,
}
const attendantsPage = {
  title: "Animateurs",
  url: "/attendants",
  iosIcon: peopleOutline,
  mdIcon: peopleOutline,
}
const gamesPage = {
  title: "Épreuves",
  url: "/games",
  iosIcon: footballOutline,
  mdIcon: footballSharp,
}
const applicantsPage = {
  title: "Demandes d'accès",
  url: "/applicants",
  iosIcon: personAddOutline,
  mdIcon: personAddSharp,
}

</script>

<style>
ion-menu ion-content {
  --background: var(--ion-item-background, var(--ion-background-color, #fff));
}

ion-menu.md ion-content {
  --padding-start: 8px;
  --padding-end: 8px;
  --padding-top: 20px;
  --padding-bottom: 20px;
}

ion-menu.md ion-list {
  padding: 20px 0;
}

ion-menu.md ion-note {
  margin-bottom: 30px;
}

ion-menu.md ion-list-header,
ion-menu.md ion-note {
  padding-left: 10px;
}

ion-menu.md ion-list#menu-list ion-list-header {
  font-size: 22px;
  font-weight: 600;

  min-height: 20px;
}

ion-item {
  cursor: pointer;
}
.no-pointer ion-item {
  cursor: auto;
}

ion-menu.md ion-item {
  --padding-start: 10px;
  --padding-end: 10px;
  border-radius: 4px;
}

ion-menu.md ion-item.selected {
  --background: rgba(var(--ion-color-primary-rgb), 0.14);
}

ion-menu.md ion-item.selected ion-icon {
  color: var(--ion-color-primary);
}

ion-menu.md ion-item ion-icon {
  color: #616e7e;
}

ion-menu.md ion-item ion-label {
  font-weight: 500;
}

ion-menu.ios ion-content {
  --padding-bottom: 20px;
}

ion-menu.ios ion-list {
  padding: 20px 0 0 0;
}

ion-menu.ios ion-note {
  line-height: 24px;
  margin-bottom: 20px;
}

ion-menu.ios ion-item {
  --padding-start: 16px;
  --padding-end: 16px;
  --min-height: 50px;
}

ion-menu.ios ion-item.selected ion-icon {
  color: var(--ion-color-primary);
}

ion-menu.ios ion-item ion-icon {
  font-size: 24px;
  color: #73849a;
}

ion-menu.ios ion-list-header,
ion-menu.ios ion-note {
  padding-left: 16px;
  padding-right: 16px;
}

ion-menu.ios ion-note {
  margin-bottom: 8px;
}

ion-note {
  display: inline-block;
  font-size: 14px;
  font-weight: bold;
  
}

ion-item.selected {
  --color: var(--ion-color-primary);
}

.not-found {
  text-align: center;
  position: absolute;
  left: 0;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
}

.not-found strong {
  font-size: 20px;
  line-height: 26px;
}

.not-found p {
  font-size: 16px;
  line-height: 22px;
  color: #8c8c8c;
}

.not-found a {
  text-decoration: none;
  cursor: pointer;
}
ion-label p {
  color: var(--ion-color-medium) !important;
}
.numberCircle {
  border-radius: 50%;
  width: 60px;
  height: 60px;
  padding: 15px;
  display: inline-flex;
  flex-grow: 0;
  background: var(--ion-color-primary);
}
.numberCircle span {
  text-align: center;
  width: 35px;
  display: inline-block;
  margin: auto;
  color: #ffffff;
  font-size: 16px;
  font-weight: bold;
}
.can-go-back ion-menu-button {
    display: none;
}
.md .score-choice-popup .alert-wrapper {
  max-width: 300px;
}
.md .score-choice-popup .alert-button{
  font-size: 18px;
}
ion-card-title {
  font-size: 24px;
}
ion-select {
  max-width: 100%;
}
</style>
