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
      <ion-list v-else-if="sections.length > 0">
        <ion-item v-for="(section, index) in sections" :key="index" :routerLink="`/section/${section.id}`">
          <ion-badge slot="start" class="ion-no-margin ion-margin-end" color="medium">{{ index + 1 }}</ion-badge>
          <ion-label>
            <b>{{ section.id }}</b> {{ section.name }} <ion-text color="medium">({{ section.city }})</ion-text>
          </ion-label>
          <ion-badge slot="end" class="ion-no-margin" color="primary">{{ section.meanScore }}</ion-badge>
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
            <tr v-for="(section, index) in sections" :key="index">
              <td>{{ index + 1 }}</td>
              <td>{{ section.name }}</td>
              <td>{{ section.city }}</td>
              <td>{{ section.meanScore }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </ion-card-content>
  </ion-card>
</template>

<script setup lang="ts">
// prettier-ignore
import { useTopSections } from "@/composables/playerSection";
import { IonBadge, IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonItem, IonLabel, IonList, IonSpinner, IonText } from "@ionic/vue";

import { defineProps } from "vue";
const props = defineProps<{
  groupCategoryId: string;
  limit: number
  printableScores: boolean;
}>();

// composable
const { data: sections, pending: isLoading, error: errorLoading } = useTopSections(props.groupCategoryId, props.limit);

</script>
