<template>
  <ion-card>
    <ion-card-header>
      <ion-card-title>Section</ion-card-title>
    </ion-card-header>
    <ion-card-content v-if="!printableScores" class="ion-no-padding ion-padding-vertical">
      <div v-if="isLoading" class="ion-text-center ion-align-items-center">
        <ion-spinner></ion-spinner>
      </div>
      <div v-else-if="errorLoading" class="not-found">
          <h2 class="ion-text-center ion-align-items-center">Erreur lors du chargement</h2>
      </div>
      <ion-list v-else-if="groups.length > 0">
        <ion-item v-for="(group, index) in groups" :key="index" :routerLink="`/player-group/${group.id}`">
          <ion-badge slot="start" class="ion-no-margin ion-margin-end" color="medium">{{ index + 1 }}</ion-badge>
          <ion-label>
            <b>{{ group.id }}</b> {{ group.name }} <ion-text color="medium">({{ group.city }})</ion-text>
          </ion-label>
          <ion-badge slot="end" class="ion-no-margin" color="primary">{{ group.meanScore }}</ion-badge>
        </ion-item>
      </ion-list>
      <div v-else>
        <h2 class="ion-text-center ion-align-items-center">Pas de classement</h2>
      </div>
    </ion-card-content>
    <ion-card-content v-else>
      <div>
        <br><br>
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Section</th>
              <th>Ville</th>
              <th>Moyenne</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(group, index) in groups" :key="index">
              <td>{{ index + 1 }}</td>
              <td>{{ group.name }}</td>
              <td>{{ group.city }}</td>
              <td>{{ group.meanScore }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </ion-card-content>
  </ion-card>
</template>

<script setup lang="ts">
// prettier-ignore
import { useTopPlayerGroups as useTopPlayerGroups } from "@/composables/playerGroup";
import { IonBadge, IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonItem, IonLabel, IonList, IonSpinner, IonText } from "@ionic/vue";

import { defineProps } from "vue";
const props = defineProps<{
  groupCategoryId: string;
  limit: number
  printableScores: boolean;
}>();

// composable
const { data: groups, pending: isLoading, error: errorLoading } = useTopPlayerGroups(props.groupCategoryId, props.limit);

</script>
