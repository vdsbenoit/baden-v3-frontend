<template>
  <ion-page>
    <header-component page-title="Classement">
      <ion-toggle v-if="canPrint" :checked="showPrintableScores" @ion-change="togglePrintable" />
      <ion-button @click="setLimit">
        <ion-icon slot="icon-only" :ios="settingsOutline" :md="settingsSharp" />
      </ion-button>
    </header-component>
    <ion-content :fullscreen="true">
      <refresher-component />
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
                    :group-category-id="String(groupCategoryId)"
                    :limit="limit"
                    :printable-scores="showPrintableScores"
                  />
                </ion-col>
                <ion-col size="12" size-sm="6">
                  <ranking-player-team
                    :group-category-id="String(groupCategoryId)"
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
import type { AlertInput } from '@ionic/vue'
import HeaderComponent from '@/components/HeaderComponent.vue'
import RankingPlayerGroup from '@/components/RankingPlayerGroup.vue'
import RankingPlayerTeam from '@/components/RankingPlayerTeam.vue'
import RefresherComponent from '@/components/RefresherComponent.vue'
import { useAppConfig } from '@/composables/app'
import { useCurrentUserProfile } from '@/composables/userProfile'
import { USER_ROLES } from '@/constants'
import {
  alertController,
  IonButton,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonCol,
  IonContent,
  IonGrid,
  IonIcon,
  IonPage,
  IonRow,
  IonToggle,
} from '@ionic/vue'
import { settingsOutline, settingsSharp } from 'ionicons/icons'
import { computed, ref } from 'vue'

// reactive data

const limit = ref(10)
const showPrintableScores = ref(false)

// Composables

const currentUserProfile = useCurrentUserProfile()
const appConfig = useAppConfig()

// Computed

const canPrint = computed(() => {
  return currentUserProfile.value && currentUserProfile.value.role >= USER_ROLES.Administrateur
})

// Methods

async function setLimit() {
  const inputs = [] as AlertInput[]
  const options = [10, 25, 50, 100, 500]
  options.forEach((option: number) => {
    inputs.push({
      type: 'radio',
      label: option.toString(),
      value: option,
      handler: () => {
        limit.value = option
      },
      checked: option === limit.value,
    })
  })
  const alert = await alertController.create({
    header: 'Afficher combien de scores ?',
    inputs,
    buttons: ['OK'],
  })
  await alert.present()
}
function togglePrintable() {
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
