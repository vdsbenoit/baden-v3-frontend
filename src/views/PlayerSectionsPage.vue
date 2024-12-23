<template>
  <ion-page>
    <header-template pageTitle="Sections"></header-template>
    <ion-content :fullscreen="true" class="ion-padding">
      <refresher-component></refresher-component>
      <ion-card>
        <ion-card-content class="ion-no-padding">
          <ion-grid class="">
            <ion-row>
              <ion-col size="12" size-sm="6">
                <ion-spinner v-if="isLoadingAppConfig"></ion-spinner>
                <div v-else-if="errorLoadingAppConfig"> Erreur au chargement des types de sections : {{ errorLoadingAppConfig.message }} </div>
                <ion-select v-else-if="appConfig && appConfig.sectionTypes" v-model="selectedSectionTypeId" interface="popover" placeholder="Type de section">
                  <ion-select-option v-for="sectionType, sectionTypeId in appConfig.sectionTypes" :value="sectionTypeId" :key="sectionTypeId">{{ sectionType.name }}</ion-select-option>
                </ion-select>
                <div v-else  class="ion-text-center">Pas de type de section configuré</div>
              </ion-col>
              <ion-col size="12" size-sm="6" v-if="selectedSectionTypeId">
                <ion-spinner v-if="isLoadingSections"></ion-spinner>
                <div v-else-if="errorLoadingSections"> Erreur au chargement des sections : {{ errorLoadingSections.message }} </div>
                <ion-select v-else-if="sections && sections.length > 0" v-model="selectedSectionId" placeholder="Section" interface="popover">
                  <ion-select-option color="dark" v-for="section in sections.values()" :value="section.id" :key="section.id">
                    {{ section.id }} - 
                    {{ section.name }} ({{ section.city }})
                  </ion-select-option>
                </ion-select>
                <div v-else class="ion-text-center">Pas de section configurée</div>
              </ion-col>
            </ion-row>
          </ion-grid>
        </ion-card-content>
      </ion-card>
      <ion-grid class="ion-no-padding" v-if="selectedSectionId">
        <ion-row>
          <ion-col size="12" size-sm="6">
            <ion-card>
              <ion-card-header>
                <ion-card-title>Détails</ion-card-title>
              </ion-card-header>
              <ion-card-content>
                <div v-if="isLoadingSection" class="ion-text-center ion-align-items-center">
                  <ion-spinner></ion-spinner>
                </div>
                <ion-list-header v-else-if="errorLoadingSection" class="ion-text-center ion-align-items-center">
                  <p>Erreur lors du chargement de la section : {{ errorLoadingSection.message }}</p>
                </ion-list-header>
                <ion-list v-else-if="selectedSection">
                  <ion-item> <ion-label>Numéro</ion-label>{{ selectedSection.id }} </ion-item>
                  <ion-item> <ion-label>Nom</ion-label>{{ selectedSection.name }} </ion-item>
                  <ion-item> <ion-label>Ville</ion-label>{{ selectedSection.city }} </ion-item>
                  <ion-item> <ion-label>Unité</ion-label>{{ selectedSection.unit }} </ion-item>
                  <ion-item> <ion-label>Nombre d'animés inscrits</ion-label>{{ selectedSection.nbPlayers }} </ion-item>
                  <ion-item> <ion-label>Nombre d'animateurs inscrits</ion-label>{{ selectedSection.nbLeaders }} </ion-item>
                  <ion-item> <ion-label>Nombre d'équipes</ion-label>{{ selectedSection.nbTeams }} </ion-item>
                </ion-list>
                <ion-list-header v-else>
                  <h2>Nous n'avons pas trouvé cette section</h2>
                </ion-list-header>
              </ion-card-content>
            </ion-card>
            <ion-card v-if="canSeeRanking">
              <ion-card-header>
                <ion-card-title> Classement </ion-card-title>
              </ion-card-header>
              <ion-card-content>
                <div v-if="isLoadingSection" class="ion-text-center ion-align-items-center">
                  <ion-spinner></ion-spinner>
                </div>
                <div v-else-if="selectedSection" >
                  <ion-list class="no-pointer">
                    <ion-item>
                      <ion-label>Score accumulé</ion-label><ion-note slot="end">{{ selectedSection.score }}</ion-note></ion-item>
                    <ion-item>
                      <ion-label>Score moyen</ion-label><ion-note slot="end">{{ selectedSection.meanScore }}</ion-note>
                    </ion-item>
                  </ion-list>
                </div>
                <ion-list-header v-else>
                  <h2>Nous n'avons pas trouvé cette section</h2>
                </ion-list-header>
                <ion-button v-if="canSeeModerationStuff" expand="block" color="primary" @click="computeMeanScore" class="ion-margin-horizontal ion-margin-top">
                  Recalculer le score moyen
                </ion-button>
              </ion-card-content>
            </ion-card>
          </ion-col>
          <ion-col size="12" size-sm="6">
            <ion-card>
              <ion-card-header>
                <ion-card-title>Équipes</ion-card-title>
              </ion-card-header>
                <info-card-component v-if="canSelectTeam">
                  Tu peux sélectionner une équipe ci-dessous et la marquer comme ton équipe
                </info-card-component>
              <ion-card-content>
                <div v-if="isLoadingSection" class="ion-text-center ion-align-items-center">
                  <ion-spinner></ion-spinner>
                </div>
                <div v-else-if="selectedSection">
                  <ion-list v-if="selectedSection.teams.length > 0">
                    <ion-item v-for="teamId in selectedSection.teams" :key="teamId" :routerLink="`/team/${teamId}`">
                      <ion-label>{{ teamId }}</ion-label>
                      <ion-badge v-if="currentUserProfile && teamId === currentUserProfile.team" slot="end" color="primary" class="ion-padding-horizontal">Ton équipe</ion-badge>
                    </ion-item>
                  </ion-list>
                  <ion-list-header v-else><h2> Aucune équipe trouvée </h2></ion-list-header>
                </div>
                <ion-list-header v-else>
                  <h2>Nous n'avons pas trouvé cette section</h2>
                </ion-list-header>
              </ion-card-content>
            </ion-card>
          </ion-col>
          <ion-col  size="12" size-sm="6" v-if="canSeeModerationStuff">
             <ion-button v-if="!shouldLoadMembers && selectedSectionId" expand="block" color="primary" @click="shouldLoadMembers = true" class="ion-margin-horizontal">
              Charger les membres
            </ion-button>
            <ion-card v-if="shouldLoadMembers">
              <ion-card-header>
                <ion-card-title>Membres</ion-card-title>
              </ion-card-header>
              <ion-card-content>
                <div v-if="isLoadingMembers" class="ion-text-center ion-align-items-center">
                  <ion-spinner></ion-spinner>
                </div>
                <div v-else-if="errorLoadingMembers" class="ion-text-center ion-align-items-center">
                  <p>Erreur lors du chargement des membres : {{ errorLoadingMembers.message }}</p>
                </div>
                <ion-list v-else-if="sectionMembers && sectionMembers.length > 0">
                  <ion-item v-for="member in sectionMembers" :key="member.id" :routerLink="`/profile/${member.id}`">
                    <ion-label>{{ member.name }}</ion-label>
                    <ion-badge v-if="member.role === ROLES.Chef" slot="end" color="warning" class="ion-padding-horizontal">Chef</ion-badge>
                  </ion-item>
                </ion-list>
                <ion-list-header v-else>
                  <h2>Aucun membre trouvé</h2>
                </ion-list-header>
              </ion-card-content>
            </ion-card>
          </ion-col>
        </ion-row>
      </ion-grid>
      <div v-else class="not-found">
        <h2 v-if="!selectedSectionTypeId" class="ion-text-center ion-align-items-center" >Sélectionne un type de section<ion-icon :ios="arrowUpOutline" :md="arrowUpSharp"></ion-icon></h2>
        <h2 v-else class="ion-text-center ion-align-items-center" >Sélectionne une section <ion-icon :ios="arrowUpOutline" :md="arrowUpSharp"></ion-icon></h2>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
// prettier-ignore
import HeaderTemplate from "@/components/HeaderTemplate.vue";
import InfoCardComponent from "@/components/InfoCardComponent.vue";
import RefresherComponent from "@/components/RefresherComponent.vue";
import { useAppConfig } from "@/composables/app";
import { usePlayerSection, usePlayerSections } from "@/composables/playerSection";
import { useCanSeeModerationStuff, useCanSeeRanking } from "@/composables/rights";
import { useCurrentUserProfile, useMembersOfSection } from "@/composables/userProfile";
import { DEFAULT_PLAYER_SECTION_ID, DEFAULT_SECTION_TYPE_ID, ROLES } from "@/constants";
import { errorPopup, loadingPopup } from "@/utils/popup";
import { updateSectionMeanScore } from "@/utils/playerSection";
import { IonBadge, IonButton, IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonCol, IonContent, IonGrid, IonIcon, IonItem, IonLabel, IonList, IonListHeader, IonNote, IonPage, IonRow, IonSelect, IonSelectOption, IonSpinner } from "@ionic/vue";
import { computed, ref } from "@vue/reactivity";
import { useRouteParams } from "@vueuse/router";
import { arrowUpOutline, arrowUpSharp } from "ionicons/icons";
import { watch, watchEffect } from "vue";

// reactive data

const selectedSectionTypeId = ref(DEFAULT_SECTION_TYPE_ID);
const shouldLoadMembers = ref(false); // true after clicking on the show button

// Composables

const currentUserProfile = useCurrentUserProfile();
const selectedSectionId = useRouteParams("sectionId", DEFAULT_PLAYER_SECTION_ID)
const { data: selectedSection, pending: isLoadingSection, error: errorLoadingSection } = usePlayerSection(selectedSectionId.value);
const { data: appConfig, pending: isLoadingAppConfig, error: errorLoadingAppConfig } = useAppConfig();
const { data: sections, pending: isLoadingSections, error: errorLoadingSections } = usePlayerSections(selectedSectionTypeId);
const {data: sectionMembers, pending: isLoadingMembers, error: errorLoadingMembers} = useMembersOfSection(selectedSectionId, shouldLoadMembers)
const canSeeRanking = useCanSeeRanking()
const canSeeModerationStuff = useCanSeeModerationStuff()


// Watchers

// If the sectionId is provided in the URL, this watcher sets the selectedSectionTypeId
watchEffect(() => {
    if(
      selectedSectionId.value &&
      selectedSection.value && 
      selectedSection.value.sectionTypeId && 
      selectedSectionTypeId.value === DEFAULT_SECTION_TYPE_ID
      ){
      selectedSectionTypeId.value = selectedSection.value.sectionTypeId;
    }
  }
);
// If selectedSectionId changes, reset the shouldLoadMembers switch
watch(selectedSectionId, () => {
  shouldLoadMembers.value = false;
});

// Computed

const canSelectTeam = computed(() => {
  if (!selectedSectionId.value) return false
  if (!currentUserProfile.value) return false
  return currentUserProfile.value.role === ROLES.Participant && !currentUserProfile.value.team
});

// Methods

const computeMeanScore = async () => {
  if (! selectedSection.value) return
  const loading = await loadingPopup("Calcul du score moyen en cours...")
  try { 
    await updateSectionMeanScore(selectedSection.value)
  } catch (error: any) {
    console.error(error)
    errorPopup("Erreur lors du calcul du score moyen", error.message)
  }
  loading.dismiss();
}
</script>
<style scoped>
ion-select {
  width: 100%;
  text-align: center;
  justify-content: center;
  color: var(--ion-color-dark);
  --placeholder-color: var(--ion-color-dark);
  /* Set full opacity on the placeholder */
  --placeholder-opacity: 1;
}
</style>
