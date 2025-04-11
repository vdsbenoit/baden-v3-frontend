<template>
  <ion-page>
    <header-component :pageTitle="pageTitle">
      <ion-button v-if="canEditGames" @click="toggleEditMode">
        <ion-label v-if="isPlatform('ios')" color="primary">{{ editMode ? "done" : "edit" }}</ion-label>
        <ion-icon v-else slot="icon-only" :icon="editMode ? closeSharp : pencilSharp"></ion-icon>
      </ion-button>
    </header-component>
    <ion-content :fullscreen="true">
      <refresher-component></refresher-component>
      <ion-item color="primary">
        <ion-spinner v-if="isLoadingAppConfig"></ion-spinner>
        <ion-select v-else-if="circuits" v-model="selectedCircuit" interface="popover" placeholder="Sélectionne un circuit">
          <ion-select-option v-for="letter in Object.keys(circuits).sort()" :value="letter" :key="letter">
            {{ letter }} - {{ getGroupCategoryName(letter) }}</ion-select-option
          >
        </ion-select>
        <div v-else-if="errorLoadingConfig">Erreur</div>
        <div v-else>Pas de circuit</div>
      </ion-item>
      <div v-if="!selectedCircuit" class="not-found">
        <h2 class="ion-text-center ion-align-items-center">
          Sélectionne un circuit <ion-icon :ios="arrowUpOutline" :md="arrowUpSharp"></ion-icon>
        </h2>
      </div>
      <div v-else>
        <div v-if="isLoadingGames" class="ion-text-center" style="background: transparent">
          <ion-spinner></ion-spinner>
        </div>
        <div v-else-if="errorLoadingGames" class="not-found">
          <strong class="capitalize">Erreur</strong>
          <ion-text color="error">Impossible de charger les jeux</ion-text>
        </div>
        <ion-list v-else-if="games && games.length > 0" lines="full">
          <div v-for="game in games" :key="game.id">
            <div v-if="editMode">
              <div v-if="game.id === editedGameId && !isUpdating">
                <ion-item>
                  <ion-badge slot="start" class="ion-no-margin ion-margin-end" color="medium">{{ game.id }}</ion-badge>
                  <ion-input type="text" v-model="newGameName" v-on:keyup.enter="updateGameName()"></ion-input>
                  <ion-button @click="updateGameName()" color="success"
                    ><ion-icon slot="icon-only" :ios="checkmarkOutline" :md="checkmarkSharp"></ion-icon
                  ></ion-button>
                  <ion-button @click="clearEdition()" color="danger"
                    ><ion-icon slot="icon-only" :ios="closeOutline" :md="closeSharp"></ion-icon
                  ></ion-button>
                </ion-item>
              </div>
              <div v-else>
                <ion-item>
                  <ion-badge slot="start" class="ion-no-margin ion-margin-end" color="medium">{{ game.id }}</ion-badge>
                  <ion-input type="text" :readonly="true">{{ game.name }}</ion-input>
                  <ion-spinner v-if="isUpdating && game.id === editedGameId" slot="end"></ion-spinner>
                  <ion-icon v-else @click="editGame(game)" slot="end" :ios="pencilOutline" :md="pencilSharp"></ion-icon>
                </ion-item>
              </div>
            </div>
            <div v-else>
              <ion-item @click="goToGamePage(game.id)">
                <ion-badge slot="start" class="ion-no-margin ion-margin-end" color="medium">{{ game.id }}</ion-badge>
                <ion-label>
                  <ion-text>{{ game.name }}</ion-text>
                </ion-label>
                <game-availabilities v-if="showGameAvailabilities" :game="game" />
              </ion-item>
            </div>
          </div>
        </ion-list>
        <div v-else class="not-found">
          <h2 class="ion-text-center ion-align-items-center">Pas d'épreuves</h2>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import GameAvailabilities from "@/components/GameAvailabilities.vue"
import HeaderComponent from "@/components/HeaderComponent.vue"
import RefresherComponent from "@/components/RefresherComponent.vue"
import { useAppConfig, useAppSettings } from "@/composables/app"
import { useCircuitGames } from "@/composables/game"
import { useCanEditGames } from "@/composables/rights"
import { DEFAULT_CIRCUIT_VALUE, DEFAULT_GAME_ID } from "@/constants"
import { VueFireGame } from "@/types"
import { setGameName } from "@/utils/game"
import { toastPopup } from "@/utils/popup"
// prettier-ignore
import { IonBadge, IonButton, IonContent, IonIcon, IonInput, IonItem, IonLabel, IonList, IonPage, IonSelect, IonSelectOption, IonSpinner, IonText, isPlatform, useIonRouter } from "@ionic/vue";
import { computed, ref } from "@vue/reactivity"
// prettier-ignore
import { arrowUpOutline, arrowUpSharp, checkmarkOutline, checkmarkSharp, closeOutline, closeSharp, pencilOutline, pencilSharp } from "ionicons/icons";
import { watch } from "vue"

// reactive data
const editMode = ref(false)
const selectedCircuit = ref(DEFAULT_CIRCUIT_VALUE)
const editedGameId = ref(DEFAULT_GAME_ID)
const newGameName = ref("")
const isUpdating = ref(false)

// composables

const router = useIonRouter()
const { data: games, pending: isLoadingGames, error: errorLoadingGames } = useCircuitGames(selectedCircuit)
const { data: appConfig, pending: isLoadingAppConfig, error: errorLoadingConfig } = useAppConfig()
const appSettings = useAppSettings()
const canEditGames = useCanEditGames()

watch([errorLoadingGames, errorLoadingConfig], errors => {
  if (errors[0]) {
    console.error("Error loading games:", errors[0])
  }
  if (errors[1]) {
    console.error("Error loading app config:", errors[1])
  }
})

// Computed
const circuits = computed(() => {
  if (!appConfig.value) return undefined
  return appConfig.value.circuits
})
const getGroupCategoryName = (circuitLetter: string) => {
  if (!appConfig.value) return undefined
  if (!circuitLetter || circuitLetter == DEFAULT_CIRCUIT_VALUE) return undefined
  const groupCategoryId = appConfig.value.circuits[circuitLetter]
  return appConfig.value.groupCategories[groupCategoryId].name
}

const pageTitle = computed(() => {
  if (editMode.value) return `Modification des épreuves`
  return "Épreuves"
})
const showGameAvailabilities = computed(() => {
  if (!appSettings.value) return false
  return appSettings.value.isGameAvailabilitiesDisplayed
})

// Methods

const toggleEditMode = () => {
  editMode.value = !editMode.value
}
const goToGamePage = (gameId: string) => {
  if (!editMode.value) router.push(`/game/${gameId}`)
}
const editGame = (game: VueFireGame) => {
  newGameName.value = game.name
  editedGameId.value = game.id
}
const clearEdition = () => {
  newGameName.value = ""
  editedGameId.value = DEFAULT_GAME_ID
}
const updateGameName = async () => {
  isUpdating.value = true
  await setGameName(editedGameId.value, newGameName.value)
  toastPopup("Le nom du jeu a bien été mis à jour")
  isUpdating.value = false
  clearEdition()
}
</script>
<style scoped>
.item-no-padding {
  --padding-start: 0px;
  --padding-end: 0px;
  --inner-padding-start: 0px;
  --inner-padding-end: 0px;
}
ion-select {
  margin-left: auto;
  margin-right: auto;
  text-align: center;
  --placeholder-opacity: 1;
}
</style>
