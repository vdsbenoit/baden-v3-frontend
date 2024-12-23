<template>
  <ion-page>
    <header-template pageTitle="Animateurs"></header-template>
    <ion-content :fullscreen="true" class="ion-padding">
      <refresher-component></refresher-component>
      <ion-card>
        <ion-card-content class="ion-no-padding">
          <ion-grid class="">
            <ion-row>
              <ion-col size="12" size-sm="6">
                  <ion-select v-if="sections" v-model="sectionId" placeholder="Section" interface="popover">
                    <ion-select-option color="dark" v-for="section in sections.values()" :value="section.id" :key="section.id"> {{ section.name }} ({{ section.city }}) </ion-select-option>
                  </ion-select>
                  <ion-spinner v-else-if="isLoadingSections"></ion-spinner>
                  <div v-else-if="errorLoadingSections"> Erreur au chargement des sections : {{ errorLoadingSections.message }} </div>
                  <div v-else>Pas de section configurée</div>
              </ion-col>
            </ion-row>
          </ion-grid>
        </ion-card-content>
      </ion-card>
      <ion-grid class="ion-no-padding" v-if="sectionId">
        <ion-row>
          <ion-col size="12" size-sm="6">
            <ion-card>
              <ion-card-header>
                <ion-card-title>Détails</ion-card-title>
                <ion-badge v-if="section?.isStaff" color="danger">Staff</ion-badge>
              </ion-card-header>
              <ion-card-content>
                <ion-list v-if="section">
                  <ion-item> <ion-label>Nom</ion-label>{{ section.name }} </ion-item>
                  <ion-item> <ion-label>Ville</ion-label>{{ section.city }} </ion-item>
                  <ion-item> <ion-label>Unité</ion-label>{{ section.unit }} </ion-item>
                </ion-list>
                <div v-else-if="isLoadingSection" class="ion-text-center ion-align-items-center">
                  <ion-spinner></ion-spinner>
                </div>
                <div v-else-if="errorLoadingSection" class="not-found">
                  <strong class="capitalize">Houston, nous avons une erreur</strong>
                  <ion-text color="error">{{ errorLoadingSection.message }}</ion-text>
                </div>
                <ion-list-header v-else>
                  <h2>Aucune section trouvée</h2>
                </ion-list-header>
              </ion-card-content>
            </ion-card>
          </ion-col>
          <ion-col  size="12" size-sm="6">
            <ion-card>
              <ion-card-header>
                <ion-card-title>Membres</ion-card-title>
              </ion-card-header>
              <ion-card-content>
                <ion-item v-if="nbApplicants" routerLink="/requests">
                  <ion-label>Membres en attente de validation</ion-label>
                  <ion-badge slot="end" color="warning">{{ nbApplicants }}</ion-badge>
                </ion-item>
                <div v-if="isLoadingAttendants" class="ion-text-center ion-align-items-center">
                  <ion-spinner></ion-spinner>
                </div>
                <div v-else-if="errorLoadingAttendants" class="not-found">
                  <strong class="capitalize">Houston, nous avons une erreur</strong>
                  <ion-text color="error">{{ errorLoadingAttendants.message }}</ion-text>
                </div>
                <ion-list v-else-if="sectionMembers && sectionMembers.length > 0">
                  <ion-item v-for="user in sectionMembers" :key="user.id" :routerLink="`/profile/${user.id}`">
                    <ion-label>{{ user.name }}</ion-label>
                    <div v-if="user.role <= ROLES.Chef">
                      <ion-badge v-if="countGames(user) === 0" slot="end" color="danger">Pas inscrit</ion-badge>
                      <ion-badge v-else slot="end" :color="countGames(user) < maxGames ? 'warning' : 'success'">
                        {{ countGames(user) }}
                      </ion-badge>
                    </div>
                  </ion-item>
                </ion-list> 
                <ion-list-header v-else>
                  <h2>Aucun membre trouvé</h2>
                </ion-list-header>
              </ion-card-content>
            </ion-card>
          </ion-col>
          <ion-col  size="12" size-sm="6">
            <ion-card>
              <ion-card-header>
                <ion-card-title v-if="section?.isStaff">Administrateur</ion-card-title>
                <ion-card-title v-else>Chefs</ion-card-title>
              </ion-card-header>
              <ion-card-content>
                <div v-if="isLoadingAttendants" class="ion-text-center ion-align-items-center">
                  <ion-spinner></ion-spinner>
                </div>
                <div v-else-if="errorLoadingAttendants" class="not-found">
                  <strong class="capitalize">Houston, nous avons une erreur</strong>
                  <ion-text color="error">{{ errorLoadingAttendants.message }}</ion-text>
                </div>
                <ion-list v-else-if="sectionLeaders && sectionLeaders.length > 0">
                  <ion-item v-for="user in sectionLeaders" :key="user.id" :routerLink="`/profile/${user.id}`">
                    <ion-label>{{ user.name }}</ion-label>
                    <div v-if="user.role <= ROLES.Chef">
                      <ion-badge v-if="countGames(user) === 0" slot="end" color="danger">Pas inscrit</ion-badge>
                      <ion-badge v-else slot="end" :color="countGames(user) < maxGames ? 'warning' : 'success'">
                        {{ countGames(user) }}
                      </ion-badge>
                    </div>
                  </ion-item>
                </ion-list>
                <ion-list-header v-else>
                  <h2>Aucun chef trouvé</h2>
                </ion-list-header>
              </ion-card-content>
            </ion-card>
          </ion-col>
        </ion-row>
      </ion-grid>
      <div v-else class="not-found">
        <h2 class="ion-text-center ion-align-items-center" >Sélectionne une catégorie et une section <ion-icon :ios="arrowUpOutline" :md="arrowUpSharp"></ion-icon></h2>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import HeaderTemplate from "@/components/HeaderTemplate.vue";
import RefresherComponent from "@/components/RefresherComponent.vue";
import { useAppConfig } from "@/composables/app";
import { useAttendantSection, useAttendantSections } from "@/composables/attendantSection";
import { useMembersOfSection, useSectionApplicants } from "@/composables/userProfile";
import { DEFAULT_ATTENDANT_SECTION_ID, ROLES } from "@/constants";
import { UserProfile } from "@/types";
import { IonBadge, IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonCol, IonContent, IonGrid, IonIcon, IonItem, IonLabel, IonList, IonListHeader, IonPage, IonRow, IonSelect, IonSelectOption, IonSpinner } from "@ionic/vue";
import { computed } from "@vue/reactivity";
import { useRouteParams } from "@vueuse/router";
import { arrowUpOutline, arrowUpSharp } from "ionicons/icons";

// composables

const appConfig = useAppConfig()
const sectionId = useRouteParams('sectionId', DEFAULT_ATTENDANT_SECTION_ID)
const { data: sections, pending: isLoadingSections, error: errorLoadingSections } = useAttendantSections(true, true);
const { data: section, pending: isLoadingSection, error: errorLoadingSection } = useAttendantSection(sectionId.value);
const { data: attendants, pending: isLoadingAttendants, error: errorLoadingAttendants } = useMembersOfSection(sectionId.value);
const applicants = useSectionApplicants(50, sectionId.value);

// Computed data

const sectionMembers = computed(() => {
  if(!attendants.value) return [];
  return Array.from(attendants.value.values()).filter((user) => user.role !== ROLES.Chef && user.role !== ROLES.Administrateur);
});
const sectionLeaders = computed(() => {
  if(!attendants.value) return [];
  return Array.from(attendants.value.values()).filter((user) => user.role === ROLES.Chef || user.role === ROLES.Administrateur);
});

const nbApplicants = computed(():string => {
  if(!applicants.value) return "";
  if(applicants.value.length <= 50) return applicants.value.length.toString();
  return "50+";
});
const maxGames = computed(() => appConfig.value?.attendantSchedule?.length ?? 0);

// Methods

const countGames = (user: UserProfile) => {
  if (!user.games) return 0;
  return Object.keys(user.games).length;
};

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
