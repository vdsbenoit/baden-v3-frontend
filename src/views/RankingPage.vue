<template>
  <ion-page>
    <header-component pageTitle="Classement">
      <ion-toggle v-if="canPrint" @IonChange="togglePrintable" :checked="showPrintableScores"></ion-toggle>
      <ion-button @click="setLimit"
        ><ion-icon slot="icon-only" :ios="settingsOutline" :md="settingsSharp"></ion-icon
      ></ion-button>
    </header-component>
    <ion-content :fullscreen="true">
      <refresher-component></refresher-component>
      <div v-if="appConfig">
        <ion-card v-for="(groupCategory, groupCategoryId) in appConfig.groupCategories" :key="groupCategoryId">
          <ion-card-header>
            <ion-card-title>{{ groupCategory.name }}</ion-card-title>
          </ion-card-header>
          <ion-card-content class="ion-no-padding">
            <ion-grid class="ion-no-padding">
              <ion-row>
                <ion-col size="12" size-sm="6">
                  <ranking-player-group
                    :groupCategoryId="String(groupCategoryId)"
                    :limit="limit"
                    :printable-scores="showPrintableScores"
                  />
                </ion-col>
                <ion-col size="12" size-sm="6">
                  <ranking-player-team
                    :groupCategoryId="String(groupCategoryId)"
                    :limit="limit"
                    :printable-scores="showPrintableScores"
                  />
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
import HeaderComponent from "@/components/HeaderComponent.vue";
import RankingPlayerGroup from "@/components/RankingPlayerGroup.vue"
import RankingPlayerTeam from "@/components/RankingPlayerTeam.vue"
import RefresherComponent from "@/components/RefresherComponent.vue"
import { useAppConfig } from "@/composables/app"
import { useCurrentUserProfile } from "@/composables/userProfile"
import { USER_ROLES } from "@/constants"
// prettier-ignore
import { alertController, AlertInput, IonButton, IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonCol, IonContent, IonGrid, IonIcon, IonPage, IonRow, IonToggle } from "@ionic/vue";
import { settingsOutline, settingsSharp } from "ionicons/icons"
import { computed, ref } from "vue"

// reactive data

const limit = ref(10)
const showPrintableScores = ref(false)

// Composables

const currentUserProfile = useCurrentUserProfile()
const appConfig = useAppConfig()

// Computed

const canPrint = computed(() => {
  return currentUserProfile.value && currentUserProfile.value.role >= USER_ROLES.Organisateur
})

// Methods

const setLimit = async () => {
  const inputs = [] as AlertInput[]
  const options = [10, 25, 50, 100, 500]
  options.forEach((option: number) => {
    inputs.push({
      type: "radio",
      label: option.toString(),
      value: option,
      handler: () => {
        limit.value = option
      },
      checked: option === limit.value
    })
  })
  const alert = await alertController.create({
    header: "Afficher combien de scores ?",
    inputs: inputs,
    buttons: ["OK"]
  })
  await alert.present()
}
const togglePrintable = () => {
  showPrintableScores.value = !showPrintableScores.value
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
