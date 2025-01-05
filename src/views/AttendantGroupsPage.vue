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
                  <ion-select v-if="groups" v-model="selectedGroupId" placeholder="Section" interface="popover">
                    <ion-select-option color="dark" v-for="group in groups.values()" :value="group.id" :key="group.id"> {{ group.name }} ({{ group.city }}) </ion-select-option>
                  </ion-select>
                  <ion-spinner v-else-if="isLoadingGroups"></ion-spinner>
                  <div v-else-if="errorLoadingGroups"> Erreur au chargement des sections : {{ errorLoadingGroups.message }} </div>
                  <div v-else>Pas de section configurée</div>
              </ion-col>
            </ion-row>
          </ion-grid>
        </ion-card-content>
      </ion-card>
      <ion-grid class="ion-no-padding" v-if="selectedGroupId">
        <ion-row>
          <ion-col size="12" size-sm="6">
            <ion-card>
              <ion-card-header>
                <ion-card-title>
                  <span>Détails </span>
                  <ion-badge v-if="selectedGroup && selectedGroup.role >= GROUP_ROLES.Staff" color="danger">Staff</ion-badge>
                </ion-card-title>
              </ion-card-header>
              <ion-card-content>
                <ion-list v-if="selectedGroup">
                  <ion-item> <ion-label>Nom</ion-label>{{ selectedGroup.name }} </ion-item>
                  <ion-item> <ion-label>Ville</ion-label>{{ selectedGroup.city }} </ion-item>
                  <ion-item> <ion-label>Unité</ion-label>{{ selectedGroup.unit }} </ion-item>
                </ion-list>
                <div v-else-if="isLoadingGroup" class="ion-text-center ion-align-items-center">
                  <ion-spinner></ion-spinner>
                </div>
                <div v-else-if="errorLoadingGroup" class="not-found">
                  <strong class="capitalize">Erreur</strong>
                  <ion-text color="error">{{ errorLoadingGroup.message }}</ion-text>
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
                <ion-item v-if="nbApplicants" routerLink="/applicants">
                  <ion-label>Membres en attente de validation</ion-label>
                  <ion-badge slot="end" color="warning">{{ nbApplicants }}</ion-badge>
                </ion-item>
                <div v-if="isLoadingAttendants" class="ion-text-center ion-align-items-center">
                  <ion-spinner></ion-spinner>
                </div>
                <div v-else-if="errorLoadingAttendants" class="not-found">
                  <strong class="capitalize">Erreur</strong>
                  <ion-text color="error">{{ errorLoadingAttendants.message }}</ion-text>
                </div>
                <ion-list v-else-if="groupMembers && groupMembers.length > 0">
                  <ion-item v-for="user in groupMembers" :key="user.id" :routerLink="`/profile/${user.id}`">
                    <ion-label>{{ user.name }}</ion-label>
                    <div v-if="user.role <= USER_ROLES.Chef">
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
                <ion-card-title v-if="selectedGroup && selectedGroup.role >= GROUP_ROLES.Staff">Administrateur</ion-card-title>
                <ion-card-title v-else>Chefs</ion-card-title>
              </ion-card-header>
              <ion-card-content>
                <div v-if="isLoadingAttendants" class="ion-text-center ion-align-items-center">
                  <ion-spinner></ion-spinner>
                </div>
                <div v-else-if="errorLoadingAttendants" class="not-found">
                  <strong class="capitalize">Erreur</strong>
                  <ion-text color="error">{{ errorLoadingAttendants.message }}</ion-text>
                </div>
                <ion-list v-else-if="groupLeaders && groupLeaders.length > 0">
                  <ion-item v-for="user in groupLeaders" :key="user.id" :routerLink="`/profile/${user.id}`">
                    <ion-label>{{ user.name }}</ion-label>
                    <div v-if="user.role <= USER_ROLES.Chef">
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
import { useAttendantGroup, useAttendantGroups } from "@/composables/attendantGroup";
import { useMembersOfGroup, useGroupApplicants } from "@/composables/userProfile";
import { DEFAULT_GROUP_ID, GROUP_ROLES, USER_ROLES } from "@/constants";
import { UserProfile } from "@/types";
import { IonBadge, IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonCol, IonContent, IonGrid, IonIcon, IonItem, IonLabel, IonList, IonListHeader, IonPage, IonRow, IonSelect, IonSelectOption, IonSpinner } from "@ionic/vue";
import { computed } from "@vue/reactivity";
import { useRouteParams } from "@vueuse/router";
import { arrowUpOutline, arrowUpSharp } from "ionicons/icons";

// composables

const appConfig = useAppConfig()
const selectedGroupId = useRouteParams('groupId', DEFAULT_GROUP_ID)
const { data: selectedGroup, pending: isLoadingGroup, error: errorLoadingGroup } = useAttendantGroup(selectedGroupId);
const { data: attendants, pending: isLoadingAttendants, error: errorLoadingAttendants } = useMembersOfGroup(selectedGroupId);
const { data: groups, pending: isLoadingGroups, error: errorLoadingGroups } = useAttendantGroups(true, "include", true);
const applicants = useGroupApplicants(50, selectedGroupId.value);

// Computed data

const groupMembers = computed(() => {
  if(!attendants.value) return [];
  return Array.from(attendants.value.values()).filter((user) => user.role !== USER_ROLES.Chef && user.role !== USER_ROLES.Administrateur);
});
const groupLeaders = computed(() => {
  if(!attendants.value) return [];
  return Array.from(attendants.value.values()).filter((user) => user.role === USER_ROLES.Chef || user.role === USER_ROLES.Administrateur);
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
