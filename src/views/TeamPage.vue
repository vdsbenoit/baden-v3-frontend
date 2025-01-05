<template>
  <ion-page>
    <header-template :pageTitle="pageTitle">
      <ion-button v-if="isCurrentUserTeam" @click="unRegisterPlayer"><ion-icon slot="icon-only" :icon="star"></ion-icon></ion-button>
      <ion-button v-if="showRegisterButton" @click="registerPlayer"><ion-icon slot="icon-only" :icon="starOutline"></ion-icon></ion-button>
    </header-template>
    <ion-content :fullscreen="true">
      <refresher-component></refresher-component>
      <div v-if="isLoadingTeam" class="ion-text-center">
        <ion-spinner></ion-spinner>
      </div>
      <div v-else-if="errorLoadingTeam" class="not-found">
        <strong class="capitalize">Erreur</strong>
        <ion-text color="error">{{ errorLoadingTeam.message }}</ion-text>
        <p>Retour à <a @click="router.back()">la page précédente</a></p>
      </div>
      <div v-else-if="!team" class="not-found">
        <strong class="capitalize">Nous n'avons pas trouvé cette équipe...</strong>
        <p>Retour à <a @click="router.back()">la page précédente</a></p>
      </div>
      <div v-else>
        <ion-grid class="ion-padding-horizontal ion-padding-top">
          <ion-row class="ion-align-items-center">
            <ion-col class="ion-padding-start" :router-link="`/section/${section?.id}`">
              <ion-card-subtitle v-if="team.section.city">{{ team.section.city }}</ion-card-subtitle>
              <h1 v-if="team.section.name" class="ion-no-margin" style="font-weight: bold">{{ team.section.name }}</h1>
              <ion-spinner v-else></ion-spinner>
            </ion-col>
            <ion-col class="numberCircle ion-padding-end">
              <span>
                {{ teamId }}
              </span>
            </ion-col>
          </ion-row>
        </ion-grid>

        <ion-card v-if="showRanking">
          <ion-card-header>
            <ion-card-title>Score</ion-card-title>
          </ion-card-header>
          <ion-card-content>
            <ion-list class="no-pointer">
              <ion-item class="ion-no-padding">
                <ion-label>Score de l'équipe</ion-label><ion-note slot="end">{{ team.score }}</ion-note></ion-item
              >
              <ion-item class="ion-no-padding">
                <ion-label>Score de la section</ion-label>
                <ion-badge v-if="errorLoadingSection" slot="end" class="ion-no-margin" color="danger">error</ion-badge>
                <ion-note v-else slot="end">
                  <ion-spinner v-if="isLoadingSection"></ion-spinner>
                  <span v-else>{{ section?.score }}</span>
                </ion-note>
              </ion-item>
              <ion-item class="ion-no-padding">
                <ion-label>Moyenne de la section</ion-label>
                <ion-badge v-if="errorLoadingSection" slot="end" class="ion-no-margin" color="danger">error</ion-badge>
                <ion-note v-else slot="end">
                  <ion-spinner v-if="isLoadingSection"></ion-spinner>
                  <span v-else>{{ sectionMean }}</span>
                </ion-note>
              </ion-item>
            </ion-list>
            <ion-button expand="block" color="medium" :router-link="`/section/${section?.id}`" router-direction="back">
              Voir section
            </ion-button>
          </ion-card-content>
        </ion-card>
        <ion-button v-if="showRegisterButton" :disabled="isRegistering" expand="block" color="primary" @click="registerPlayer" class="ion-margin">
          <ion-spinner v-if="isRegistering"></ion-spinner>
          <span v-else>C'est mon équipe </span>
        </ion-button>
        <ion-card>
          <ion-card-header>
            <ion-card-title>Programme</ion-card-title>
          </ion-card-header>
          <ion-card-content>
            <div v-if="isLoadingMatches" class="ion-text-center">
              <ion-spinner></ion-spinner>
            </div>
            <ion-list-header v-else-if="errorLoadingMatches">
              <strong class="capitalize">Erreur</strong>
              <ion-text color="error">{{ errorLoadingMatches.message }}</ion-text>
            </ion-list-header>
            <ion-list v-else-if="matches && matches.length > 0">
              <ion-item v-for="[i, match] in matches.entries()" :key="match.id" :routerLink="`/match/${match.id}`" class="ion-no-padding">
                <ion-label>
                  <span>{{ match.gameName }}</span>
                  <p>
                    <ion-icon :ios="locationOutline" :md="locationSharp" style="vertical-align: middle;"></ion-icon><span>{{ playerSchedule[i].start }} - {{ playerSchedule[i].stop }}</span>
                    <span> | </span>
                    <ion-icon :ios="timeOutline" :md="timeSharp" style="vertical-align: middle;"></ion-icon><span>&nbsp;Jeu n° {{ match.gameId }}</span>
                  </p>
                </ion-label>
                <ion-icon :ios="statusIcon(match).ios" :md="statusIcon(match).md" :color="statusIcon(match).color" slot="end"></ion-icon>
              </ion-item>
            </ion-list>
            <ion-list-header v-else><h2>Aucun jeu trouvé</h2></ion-list-header>
          </ion-card-content>
        </ion-card>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
// prettier-ignore
import HeaderTemplate from "@/components/HeaderTemplate.vue";
import RefresherComponent from "@/components/RefresherComponent.vue";
import { useAppConfig, useAppSettings } from "@/composables/app";
import { useTeamMatches } from "@/composables/match";
import { usePlayerSection } from "@/composables/playerSection";
import { useTeam } from "@/composables/team";
import { useCurrentUserProfile } from "@/composables/userProfile";
import { DEFAULT_PLAYER_SECTION_ID, DEFAULT_TEAM_ID, ROLES } from "@/constants";
import { errorPopup, toastPopup } from "@/utils/popup";
import { updateUserProfile } from "@/utils/userProfile";
import { IonButton, IonCard, IonCardContent, IonCardHeader, IonCardSubtitle, IonCardTitle, IonCol, IonContent, IonGrid, IonIcon, IonItem, IonLabel, IonList, IonListHeader, IonNote, IonPage, IonRow, IonSpinner, useIonRouter } from "@ionic/vue";
import { computed, ref } from "@vue/reactivity";
import { useRouteParams } from "@vueuse/router";
import { closeOutline, closeSharp, locationOutline, locationSharp, reorderTwoOutline, reorderTwoSharp, star, starOutline, timeOutline, timeSharp, trophyOutline, trophySharp } from "ionicons/icons";
import { onMounted } from "vue";

// reactive data

const isRegistering = ref(false);

// composables

const router = useIonRouter()
const user = useCurrentUserProfile()
const appConfig = useAppConfig()
const settings = useAppSettings()
const teamId = useRouteParams('teamId', DEFAULT_TEAM_ID)
const { data: team, pending: isLoadingTeam, error: errorLoadingTeam } = useTeam(teamId)
const { data: section, pending: isLoadingSection, error: errorLoadingSection } = usePlayerSection(team.value?.sectionId ?? DEFAULT_PLAYER_SECTION_ID)
const { data: matches, pending: isLoadingMatches, error: errorLoadingMatches } = useTeamMatches(teamId)

// lifecycle hooks

onMounted(() => {
if (teamId.value === DEFAULT_TEAM_ID) {
    const msg = "Team ID missing from the url"
    toastPopup(msg)
    console.error(msg)
  }
});

// Computed

const pageTitle = computed(() => {
  if (team.value) return `Equipe ${team.value.id}`;
  if (isLoadingTeam.value) return "Chargement";
  return "Équipe inconnue";
});
const playerSchedule = computed(() => {
  if (!appConfig.value) return []
  return appConfig.value.playerSchedule
})
const showRanking = computed(() => {
  if (settings.value?.isRankingPublic) return true
  if (!user.value) return false
  return (user.value.role >= ROLES.Organisateur)
});
const isCurrentUserTeam = computed(() => {
  if (!user.value?.teamId) return false;
  return (user.value.teamId === teamId.value)
})
const showRegisterButton = computed(() => {
  if (!user.value) return false
  if (isCurrentUserTeam.value) return false;
  return (user.value.role == ROLES.Participant)
});
const sectionMean = computed(() => {
  if (!section.value) return 0
  const nbTeams = section.value.nbTeams;
  if (nbTeams == undefined || nbTeams === 0) return 0;
  return (section.value.score / nbTeams).toFixed(2); 
})

// Methods

const statusIcon = (match: any) => {
  if (match.draw) return { ios: reorderTwoOutline, md: reorderTwoSharp, color: "warning" };
  if (match.winner === teamId.value) return { ios: trophyOutline, md: trophySharp, color: "success" };
  if (match.loser === teamId.value) return { ios: closeOutline, md: closeSharp, color: "danger" };
  return { md: undefined, ios: undefined, color: ""};
};
const registerPlayer = async () => {
  if (!team.value) {
    const message = "Impossible de s'inscrire. Aucune équipe n'est chargée"
    toastPopup(message)
    console.error(message)
    return
  }
  if (!user.value) {
    const message = "Impossible de s'inscrire. Aucun utilisateur n'est connecté"
    toastPopup(message)
    console.error(message)
    return
  }

  try {
    await updateUserProfile(user.value.id, { teamId: team.value.id })
    toastPopup(`L'équipe ${team.value.id} a été enregistrée comme ton équipe`)
  } catch(e) {
    errorPopup(`Une erreur s'est produite lors de la modification de ton profil`)
    console.error(e)
  }
}
const unRegisterPlayer = async () => {
  if (!team.value) {
    const message = "Impossible de s'inscrire. Aucune équipe n'est chargée"
    toastPopup(message)
    console.error(message)
    return
  }
  if (!user.value) {
    const message = "Impossible de s'inscrire. Aucun utilisateur n'est connecté"
    toastPopup(message)
    console.error(message)
    return
  }
  try {
    updateUserProfile(user.value.id, {teamId: DEFAULT_TEAM_ID})
    toastPopup(`Tu es désincrit.e de cette équipe`);
  } catch(e) {
    errorPopup(`Une erreur s'est produite lors de la modification de ton profil`); 
    console.error(e);
  }
}
</script>
<style scoped></style>
