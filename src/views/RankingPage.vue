<template>
  <ion-page>
    <header-template pageTitle="Classement">
      <ion-label v-if="canPrint">
        Printable
      </ion-label>
      <ion-toggle v-if="canPrint" @IonChange="togglePrintable" :checked="showPrintableScores"></ion-toggle>
      <ion-button @click="setLimit"><ion-icon slot="icon-only" :ios="settingsOutline" :md="settingsSharp"></ion-icon></ion-button>
    </header-template>
    <ion-content :fullscreen="true">
      <refresher-component></refresher-component>
      <div v-if="appConfig" >
        <ion-card v-for="(sectionType, sectionTypeId) in appConfig.sectionTypes" :key="sectionTypeId">
          <ion-card-header>
            <ion-card-title>{{ sectionType.name }}</ion-card-title>
          </ion-card-header>
          <ion-card-content class="ion-no-padding">
            <ion-grid class="ion-no-padding">
              <ion-row>
                <ion-col size="12" size-sm="6">
                  <ranking-section :sectionTypeId="String(sectionTypeId)" :limit="limit" :printable-scores="showPrintableScores"/>
                </ion-col>
                <ion-col size="12" size-sm="6">
                  <ranking-team :sectionTypeId="String(sectionTypeId)" :limit="limit" :printable-scores="showPrintableScores"/>
                </ion-col>
              </ion-row>
            </ion-grid>
          </ion-card-content>
        </ion-card>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
// prettier-ignore
import HeaderTemplate from "@/components/HeaderTemplate.vue";
import RankingSection from "@/components/RankingSection.vue";
import RankingTeam from "@/components/RankingTeam.vue";
import RefresherComponent from "@/components/RefresherComponent.vue";
import { useAppConfig } from "@/composables/app";
import { useCurrentUserProfile } from "@/composables/userProfile";
import { ROLES } from "@/constants";
import { alertController, AlertInput, IonButton, IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonCol, IonContent, IonGrid, IonIcon, IonLabel, IonPage, IonRow, IonToggle } from "@ionic/vue";
import { settingsOutline, settingsSharp } from "ionicons/icons";
import { computed, ref } from "vue";

// reactive data

const limit = ref(10);
const showPrintableScores = ref(false);

// Composables

const currentUserProfile = useCurrentUserProfile();
const appConfig = useAppConfig();

// Computed

const canPrint = computed(() => {
  return currentUserProfile.value && currentUserProfile.value.role >= ROLES.Organisateur
});

// Methods

const setLimit = async () => {
  const inputs = [] as AlertInput[];
  const options = [10, 25, 50, 100, 500];
  options.forEach((option: number) => {
    inputs.push({
      type: "radio",
      label: option.toString(),
      value: option,
      handler: () => {
        limit.value = option;
      },
      checked: option === limit.value,
    });
  });
  const alert = await alertController.create({
    header: "Afficher combien de scores ?",
    inputs: inputs,
    buttons: ["OK"],
  });
  await alert.present();
};
const togglePrintable = () => {
  showPrintableScores.value = !showPrintableScores.value;
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
