<template>
  <ion-card>
    <ion-card-header>
      <ion-card-title>Team</ion-card-title>
    </ion-card-header>
    <ion-card-content v-if="!printableScores" class="ion-no-padding ion-padding-vertical">
      <div v-if="isLoading" class="ion-text-center ion-align-items-center">
        <ion-spinner></ion-spinner>
      </div>
      <div v-else-if="errorLoading" class="not-found">
        <h2 class="ion-text-center ion-align-items-center">Erreur lors du chargement</h2>
      </div>
      <ion-list v-else-if="teams.length > 0">
        <ion-item v-for="(team, index) in teams" :key="index" :router-link="`/team/${team.id}`" router-direction="forward">
          <ion-badge slot="start" class="ion-no-margin ion-margin-end" color="medium">{{ index + 1 }}</ion-badge>
          <ion-label>
            <b>{{ team.id }}</b> {{ team.groupName }} <ion-text color="medium">({{ team.groupCity }})</ion-text>
          </ion-label>
          <ion-badge slot="end" class="ion-no-margin" color="primary">{{ team.score }}</ion-badge>
        </ion-item>
      </ion-list>
      <div v-else>
        <h2 class="ion-text-center ion-align-items-center">Pas de classement</h2>
      </div>
    </ion-card-content>
    <ion-card-content v-else>
      <div>
        <br /><br />
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Équipe</th>
              <th>Section</th>
              <th>Score</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(team, index) in teams" :key="index">
              <td>{{ index + 1 }}</td>
              <td>{{ team.id }}</td>
              <td>{{ team.groupName }} ({{ team.groupCity }})</td>
              <td>{{ team.score }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </ion-card-content>
  </ion-card>
</template>

<script setup lang="ts">
import { useTopTeams } from "@/composables/team"
import { errorPopup } from "@/utils/popup"
// prettier-ignore
import { IonBadge, IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonItem, IonLabel, IonList, IonSpinner, IonText } from "@ionic/vue";
import { defineProps, watch } from "vue"
const props = defineProps<{
  groupCategoryId: string
  limit: number
  printableScores: boolean
}>()

// composable
const { data: teams, pending: isLoading, error: errorLoading } = useTopTeams(props.groupCategoryId, props.limit)
watch(errorLoading, error => {
  if (error) {
    errorPopup("Erreur lors du chargement des équipes")
    console.error("Error loading teams:", error)
  }
})
</script>
