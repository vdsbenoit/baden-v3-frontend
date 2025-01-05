<template>
  <ion-page>
    <header-template pageTitle="Accueil"></header-template>
    <ion-content :fullscreen="true">
      <refresher-component></refresher-component>
      <div class="logo">
        <img src="@/assets/img/logo-bb.png" alt="Logo Baden Battle" />
      </div>
      <info-card-component v-if="showPendingRequestInfo" class="ion-margin-horizontal">
          Ton inscription est en attente de validation par un•e {{ requestValidator }}. 
          N'hésite pas à les contacter pour accélérer ta demande.
      </info-card-component>
      <ion-grid v-if="userProfile" class="home-grid">
        <!-- animateur -->
        <ion-row v-if="userProfile.role === ROLES.Animateur || userProfile.role === ROLES.Chef">
          <ion-col size="6" size-sm="4" size-lg="2" v-for="timeSlot in attendantSchedule" :key="timeSlot.id">
            <tile-col size="12" v-if="userProfile.games && userProfile.games[timeSlot.id]" :target="`/game/${userProfile.games[timeSlot.id]}`">Mon épreuve ({{ timeSlot.name }})</tile-col>
            <tile-col size="12" v-else-if="appSettings && appSettings.isAttendantRegistrationOpen" target="/games">Inscris-toi à une épreuve ({{ timeSlot.name }})</tile-col>
          </ion-col>
        </ion-row>
        <ion-row>
          <!-- participant -->
          <tile-col v-if="showSelectTeam" :target="`/section/${userProfile.sectionId}`">Choisis une équipe</tile-col>
          <tile-col v-if="showSectionButton" :target="`/section/${userProfile.sectionId}`">Ma section</tile-col>
          <tile-col v-if="userProfile.teamId" :target="`/team/${userProfile.teamId}`">Mon équipe</tile-col>

          <!-- >= chef -->
          <tile-col v-if="nbApplicants" target="/applicants">
            {{ nbApplicants }} demande{{ typeof nbApplicants == 'string' || nbApplicants > 1  ? "s" : "" }} d'accès
          </tile-col>

          <!-- chef -->
          <tile-col v-if="showRegisterAttendants" :target="`/attendant/${userProfile.sectionId}`">Inscris tes animés à des épreuves</tile-col>

          <!-- animateur -->
          <tile-col v-if="userProfile.role >= ROLES.Animateur && userProfile.sectionId" :target="`/attendant/${userProfile.sectionId}`">Ma section</tile-col>
          <!-- organisateur -->
          <tile-col v-if="userProfile.role >= ROLES.Organisateur" target="/attendant">Animateurs</tile-col>
        </ion-row>
      </ion-grid>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import HeaderTemplate from "@/components/HeaderTemplate.vue";
import InfoCardComponent from "@/components/InfoCardComponent.vue";
import RefresherComponent from "@/components/RefresherComponent.vue";
import TileCol from "@/components/TileCol.vue";
import { useAppConfig, useAppSettings } from "@/composables/app";
import { useApplicants, useCurrentUserProfile } from "@/composables/userProfile";
import { ROLES } from "@/constants";
import { IonContent, IonGrid, IonPage, IonRow } from "@ionic/vue";
import { computed } from "vue";

// Composables

const userProfile = useCurrentUserProfile()
const appSettings = useAppSettings()
const appConfig = useAppConfig()
const applicants = useApplicants(15)

// Computed vars
const attendantSchedule = computed(() => (appConfig.value?.attendantSchedule ?? []))
const showPendingRequestInfo = computed(() => {
  if (!userProfile.value) return false;
  return (userProfile.value.role === ROLES.Newbie && userProfile.value.hasDoneOnboarding);
});
const showSelectTeam = computed(() => {
  if (!userProfile.value) return false;
  return (userProfile.value.role === ROLES.Participant && !userProfile.value.teamId);
});
const showSectionButton = computed(() => {
  if (!userProfile.value) return false;
  return (userProfile.value.role === ROLES.Participant && userProfile.value.sectionId);
});
const showRegisterAttendants = computed(() => {
  if (!userProfile.value) return false;
  if (!appSettings.value || !appSettings.value.isAttendantRegistrationOpen) return false;
  return (userProfile.value.role === ROLES.Chef);
});
const nbApplicants = computed(() => {
  if(!applicants.value) return 0
  return applicants.value.length <= 15 ? applicants.value.length : "15+";
});
const requestValidator = computed(() => {
  if (!userProfile.value) return "";
  switch (userProfile.value.requestedRole) {
    case ROLES.Animateur:
    case ROLES.Chef:
      return "chef•fe de ta section";
    case ROLES.Organisateur:
      return "orga de la Baden Battle";
    case ROLES.Administrateur:
      return "admin de l'app";
    default:
      return "";
  }
});
</script>

<style scoped>
.logo {
  background-color: var(--ion-background-color);
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
  padding: min(1%, 20px);
  width: 100%;
  height: 30%;
  margin-bottom: 20px;
  margin-top: 10px;
}
.logo img {
  max-width: 100%;
  max-height: 100%;
}
body.dark .logo img{
  filter: invert(1);
}
.container{
  text-align: center;
}
h1 {
  color: var(--ion-color-primary);
  font-size: 40px;
}
p {
  line-height: 30px;
}
</style>
