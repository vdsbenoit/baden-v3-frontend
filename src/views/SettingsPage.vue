<template>
  <ion-page>
    <header-template pageTitle="Paramètres"></header-template>
    <ion-content :fullscreen="true" class="ion-padding">
      <refresher-component></refresher-component>
      <ion-card>
        <ion-card-header>
          <ion-card-title>Utilisateurs</ion-card-title>
        </ion-card-header>
        <ion-card-content class="ion-no-padding">
          <ion-list>
            <ion-item routerLink="/users/withoutSection">
              <ion-label>Utilisateurs sans section</ion-label>
              <ion-icon slot="end" :ios="chevronForwardOutline" :md="chevronForwardSharp"></ion-icon>
            </ion-item>
            <ion-item routerLink="/users">
              <ion-label>Nouveaux utilisateurs</ion-label>
              <ion-icon slot="end" :ios="chevronForwardOutline" :md="chevronForwardSharp"></ion-icon>
            </ion-item>
          </ion-list>
        </ion-card-content>
      </ion-card>
      <ion-card>
        <ion-card-header>
          <ion-card-title>Paramètres généraux</ion-card-title>
        </ion-card-header>
        <ion-card-content class="ion-no-padding">
          <div v-if="isLoadingAppSettings" class="ion-text-center" style="background: transparent">
            <ion-spinner></ion-spinner>
          </div>
          <div v-else-if="errorLoadingAppSettings" class="not-found">
            <strong class="capitalize">Erreur</strong>
            <ion-text color="error">{{ errorLoadingAppSettings.message }}</ion-text>
            <p>Retour à <a @click="router.back()">la page précédente</a></p>
          </div>
          <div v-else-if="!appSettings" class="not-found">
            <strong class="capitalize">Erreur</strong>
            <ion-text color="error">The app settings document is empty</ion-text>
            <p>Retour à <a @click="router.back()">la page précédente</a></p>
          </div>
          <ion-list v-else>
            <ion-item v-if="formData.maxGameAttendants.isEditting">
              <!-- todo add keyup event handler -->
              <ion-input v-model="formData.maxGameAttendants.value" name="maxGameAttendants" type="number" autocorrect="off"  slot="start"></ion-input>
              <ion-button @click="setMaxAttendants" color="success" slot="end"><ion-icon slot="icon-only" :ios="checkmarkOutline" :md="checkmarkSharp"></ion-icon></ion-button>
            </ion-item>
            <ion-item v-else @click="formData.maxGameAttendants.isEditting = true" >
              <ion-label class="ion-text-wrap fixedLabel" slot="start">Max animateurs par épreuve</ion-label>
              <ion-input name="maxGameAttendants" type="number" :readonly="true" inputmode="none" slot="end">{{ appSettings.maxGameAttendants }}</ion-input>
            </ion-item>
            <ion-item>
              <ion-label>Geler les scores</ion-label>
              <ion-toggle @IonChange="freezeScores" :checked="!appSettings.canSetScores"></ion-toggle>
            </ion-item>
            <ion-item>
              <ion-label class="ion-text-wrap">Rendre les classements publiques</ion-label>
              <ion-toggle @IonChange="showRanking" :checked="appSettings.isRankingPublic"></ion-toggle>
            </ion-item>
            <ion-item>
              <ion-label>Inscriptions aux épreuves</ion-label>
              <ion-toggle @IonChange="setAttendantRegistration" :checked="appSettings.isAttendantRegistrationOpen"></ion-toggle>
            </ion-item>
            <ion-item>
              <ion-label>Afficher la disponibilités des épreuves</ion-label>
              <ion-toggle @IonChange="setGameAvailabilites" :checked="appSettings.isGameAvailabilitiesDiplayed"></ion-toggle>
            </ion-item>
            <ion-item>
              <ion-label class="ion-text-wrap">
                <h2>Autoriser l'enregistrement de scores dans n'importe quelle épreuve</h2>
                <p>Ne pas tenir compte des inscriptions aux épreuves</p>
              </ion-label>
              <ion-toggle @IonChange="setCanSetAnyScores" :checked="appSettings.canSetAnyScores"></ion-toggle>
            </ion-item>
          </ion-list>
        </ion-card-content>
      </ion-card>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
// prettier-ignore
import HeaderTemplate from "@/components/HeaderTemplate.vue";
import RefresherComponent from "@/components/RefresherComponent.vue";
import { useAppSettings } from "@/composables/app";
import { loadingPopup } from "@/services/popup";
import { updateAppSettings } from "@/utils/app";
import { IonButton, IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonContent, IonIcon, IonInput, IonItem, IonLabel, IonList, IonPage, IonToggle, useIonRouter } from "@ionic/vue";
import { checkmarkOutline, checkmarkSharp, chevronForwardOutline, chevronForwardSharp } from "ionicons/icons";
import { reactive, watch } from "vue";

// reactive data

const formData = reactive({
  maxGameAttendants: {
    isEditting: false,
    value: 2
  }
})

// Composables

const router = useIonRouter()
const {data: appSettings, pending: isLoadingAppSettings, error: errorLoadingAppSettings } = useAppSettings()


/**
 * Update formData with the current appSettings values
 * Does not update the form data if the user is editting the field
*/ 
const resetFormData = () => {
  if (!appSettings.value) return;
  if (!formData.maxGameAttendants.isEditting) formData.maxGameAttendants.value = appSettings.value.maxGameAttendants

}
// Update the form data when the appSettings object is updated
watch(appSettings, (newAppSettings) => {
  if (newAppSettings) {
    resetFormData()
  }
});

// Methods

const setMaxAttendants = async () => {
  const loading = await loadingPopup()
  await updateAppSettings({ maxGameAttendants: formData.maxGameAttendants.value });
  formData.maxGameAttendants.isEditting = false;
  loading.dismiss()
};
const freezeScores = async (event: any) => {
  const loading = await loadingPopup()
  await updateAppSettings({ canSetScores: !event.detail.checked });
  loading.dismiss()
};
const showRanking = async (event: any) => {
  const loading = await loadingPopup()
  await updateAppSettings({ isRankingPublic: event.detail.checked });
  loading.dismiss()
};
const setAttendantRegistration = async (event: any) => {
  const loading = await loadingPopup()
  await updateAppSettings({ isAttendantRegistrationOpen: event.detail.checked });
  loading.dismiss()
};
const setGameAvailabilites = async (event: any) => {
  const loading = await loadingPopup()
  await updateAppSettings({ isGameAvailabilitiesDiplayed: event.detail.checked });
  loading.dismiss()
};
const setCanSetAnyScores = async (event: any) => {
  const loading = await loadingPopup()
  await updateAppSettings({ canSetAnyScores: event.detail.checked });
  loading.dismiss()
};
</script>
<style scoped>
 .fixedLabel {
    /* width: 100%; */
    min-width: 30% !important;
}
</style>
