<template>
  <ion-page>
    <header-template :pageTitle="pageTitle"/>
    <ion-content :fullscreen="true">
      <refresher-component></refresher-component>
      <div v-if="isLoadingGame" class="ion-text-center">
        <ion-spinner></ion-spinner>
      </div>
      <div v-else-if="errorLoadingGame" class="not-found">
        <strong class="capitalize">Houston, nous avons une erreur</strong>
        <ion-text color="error">{{ errorLoadingGame.message }}</ion-text>
        <p>Retour à <a @click="router.back()">la page précédente</a></p>
      </div>
      <div v-else-if="!game" class="not-found">
        <strong class="capitalize">Nous n'avons pas trouvé cette épreuve...</strong>
        <p>Retour à <a @click="router.back()">la page précédente</a></p>
      </div>
      <div v-else>
        <ion-grid class="ion-padding-horizontal ion-padding-top">
          <ion-row class="ion-align-items-center">
            <ion-col class="ion-padding-start">
              <ion-card-subtitle>Circuit {{ game.circuit }}</ion-card-subtitle>
              <h1 class="ion-no-margin" style="font-weight: bold">{{ game.name }}</h1>
            </ion-col>
            <ion-col class="numberCircle ion-padding-end">
              <span>
                {{ gameId }}
              </span>
            </ion-col>
          </ion-row>
        </ion-grid>
        <ion-card>
          <ion-card-header>
            <ion-card-title>Responsables</ion-card-title>
          </ion-card-header>
          <ion-card-content>
            <ion-list v-for="timeSlot in attendantSchedule" :key="timeSlot.id" lines="none" class="ion-no-margin ion-no-padding">
              <ion-text color="primary"><h2>{{ timeSlot.name }}</h2></ion-text>
              <span v-if="game.attendants[timeSlot.id].length < 1" class="ion-padding-start">Pas encore de responsable inscrit</span>
              <ion-item v-else v-for="attendant in game.attendants[timeSlot.id]" :key="attendant.id">
                <ion-label class="ion-text-wrap" @click="goToProfile(attendant.id)">
                  <ion-text style="font-weight: bold">{{ attendant.name }}</ion-text>
                  <ion-text color="medium">&nbsp;({{ attendant.sectionName ?? "" }})</ion-text>
                </ion-label>
                <ion-icon v-if="edit.isOn" :ios="closeOutline" :md="closeSharp" @click="removeAttendant(gameId, attendant.id, timeSlot)"></ion-icon>
              </ion-item>
            </ion-list>
            <ion-grid class="ion-margin-top">
              <ion-row>
                <ion-col size="12" size-sm="6" class="ion-no-padding ion-padding-horizontal" v-if="canRegister">
                  <MyActionSheetButton expand="block" color="primary" action-sheet-header="M'inscrire" 
                  :buttons="attendantSchedule.map(timeSlot => ({ text: timeSlot.name, data: timeSlot}))" :callback="register" :payload="{ targetUser: currentUser}">
                    M'inscrire
                  </MyActionSheetButton>
                </ion-col>
                <ion-col size="12" size-sm="6" class="ion-no-padding ion-padding-horizontal" v-if="canRegister && isUserRegisteredHere">
                  <ion-button @click="unregister" expand="block" color="danger" action-sheet-header="Se désinscrire">
                    Se désinscrire
                  </ion-button>
                </ion-col>
                <ion-col size="12" size-sm="6" class="ion-no-padding ion-padding-horizontal" v-if="canRegister.section || canRegister.anyone">
                  <ion-button @click="toggleEditMode" expand="block" :color="edit.isOn ? 'medium' :  'tertiary'" >
                    {{ edit.isOn ? "Arrêter la modification" : "Modifier les animateurs" }}
                  </ion-button>
                </ion-col>
                <ion-col size="12" size-sm="6" class="ion-no-padding ion-padding-horizontal" v-if="canEditGameSettings">
                  <ion-button v-if="isTogglingNoScores" expand="block" color="medium" ><ion-spinner></ion-spinner></ion-button>
                  <ion-button v-else-if="game.noScores" @click="toggleNoScores" expand="block" color="success" > Réactiver les scores </ion-button>
                  <ion-button v-else @click="toggleNoScores" expand="block" color="danger" > Désactiver les scores </ion-button>
                </ion-col>
              </ion-row>
            </ion-grid>
          </ion-card-content>
        </ion-card>
         <ion-card v-if="edit.isOn">
          <ion-card-header>
            <ion-card-title>Enregistrer un animateur</ion-card-title>
          </ion-card-header>
          <ion-card-content>
            <ion-grid class="">
              <ion-row>
                <ion-col size="12" size-sm="6">
                  <ion-spinner v-if="isLoadingAttendantSections"></ion-spinner>
                  <ion-select v-else v-model="edit.selectedSectionId" placeholder="Choisir section" interface="alert">
                    <ion-select-option v-for="section in attendantSections" :value="section.id" :key="section.id"> {{ section.name }} ({{ section.city }}) </ion-select-option>
                  </ion-select>
                </ion-col>
                <ion-col size="12" size-sm="6" v-if="edit.selectedSectionId != DEFAULT_ATTENDANT_SECTION_ID">
                    <ion-spinner v-if="isLoadingAttendants"></ion-spinner>
                    <ion-select v-else v-model="edit.selectedAttendant" placeholder="Choisir animateur" interface="alert">
                      <ion-select-option color="dark" v-for="attendant in sectionAttendants" :value="attendant" :key="attendant.id"> {{ getUserName(attendant) }} </ion-select-option>
                    </ion-select>
                </ion-col>
              </ion-row>
              <ion-row>
                <ion-col size="12" size-sm="6" class="ion-no-padding ion-padding-horizontal" v-if="edit.selectedAttendant">
                  <MyActionSheetButton expand="block" color="primary" action-sheet-header="Inscrire" 
                  :buttons="attendantSchedule.map(timeSlot => ({ text: timeSlot.name, data: timeSlot}))" :callback="register" :payload="{ targetUser: edit.selectedAttendant }">
                    Inscrire {{ getUserName(edit.selectedAttendant) }}
                  </MyActionSheetButton>
                </ion-col>
              </ion-row>
            </ion-grid>
          </ion-card-content>
        </ion-card>
        <ion-card>
          <ion-card-header>
            <ion-card-title>Programme</ion-card-title>
          </ion-card-header>
          <ion-card-content>
            <div v-if="isLoadingMatches" class="ion-text-center">
              <ion-spinner></ion-spinner>
            </div>
            <div v-else-if="errorLoadingMatches" class="ion-text-center">
              <strong class="capitalize">Houston, nous avons une erreur</strong>
              <ion-text color="error">{{ errorLoadingMatches.message }}</ion-text>
            </div>
            <ion-list v-else-if="matches && matches.length > 0">
              <ion-item v-for="[i, match] in matches.entries()" :key="match.id" :routerLink="`/match/${match.id}`" class="item-no-padding">
                <ion-label>
                  <ion-text>⌚ {{ playerSchedule[i].start }} - {{ playerSchedule[i].stop }} : </ion-text>
                  <ion-text color="primary" style="font-weight: bold">{{ match.playerIds[0] }}</ion-text>
                  <ion-text> vs </ion-text>
                  <ion-text color="primary" style="font-weight: bold">{{ match.playerIds[1] }}</ion-text>
                </ion-label>
                <ion-badge slot="end" class="ion-no-margin" :color="match.draw ? 'warning' : 'success'" v-if="getWinner(match)">{{ getWinner(match) }}</ion-badge>
              </ion-item>
            </ion-list>
            <ion-list-header v-else><h2>Aucun duel trouvé</h2></ion-list-header>
          </ion-card-content>
        </ion-card>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import HeaderTemplate from "@/components/HeaderTemplate.vue";
import MyActionSheetButton from "@/components/MyActionSheetButton.vue";
import RefresherComponent from "@/components/RefresherComponent.vue";
import { useGame } from "@/composables/game";
import { useAttendantSections } from "@/composables/attendantSection";
import { useGameMatches } from "@/composables/match";
import { useCanEditGames, useCanRegister } from "@/composables/rights";
import { useAppConfig, useAppSettings } from "@/composables/app";
import { useCurrentUserProfile, useMembersOfSection } from "@/composables/userProfile";
import { DEFAULT_GAME_ID, DEFAULT_ATTENDANT_SECTION_ID, ROLES } from "@/constants";
import { confirmPopup, toastPopup } from "@/services/popup";
import { AttendantTimeSlot, VueFireUserProfile } from "@/types";
import { addAttendant, removeAttendant, setGameNoScores } from "@/utils/game";
import { setMatchNoScores } from "@/utils/match";
import { canBeRegistered } from "@/utils/rights";
import { getRoleByValue, getUserName } from "@/utils/userProfile";
import {
  IonBadge,
  IonButton,
  IonCard, IonCardContent, IonCardHeader,
  IonCardSubtitle,
  IonCardTitle,
  IonCol,
  IonContent,
  IonGrid,
  IonIcon,
  IonItem, IonLabel,
  IonList,
  IonListHeader,
  IonPage,
  IonRow,
  IonSelect, IonSelectOption,
  IonSpinner,
  IonText,
  useIonRouter
} from "@ionic/vue";
import { computed, reactive, ref, toRef } from "@vue/reactivity";
import { useRouteParams } from "@vueuse/router";
import { closeOutline, closeSharp } from "ionicons/icons";
import { onMounted, toValue } from "vue";

// reactive data

const isTogglingNoScores = ref(false);
const edit = reactive({
  isOn: false,
  selectedSectionId: DEFAULT_ATTENDANT_SECTION_ID,
  selectedAttendant: undefined
})

// composables

const router = useIonRouter();
const gameId = useRouteParams('gameId', DEFAULT_GAME_ID)
const currentUser = useCurrentUserProfile()
const appSettings = useAppSettings()
const appConfig = useAppConfig()
const { data: game, pending: isLoadingGame, error: errorLoadingGame } = useGame(gameId);
const { data: matches, pending: isLoadingMatches, error: errorLoadingMatches } = useGameMatches(gameId)
const canRegister = useCanRegister()
const canEditGameSettings = useCanEditGames()


const { data: attendantSections, pending: isLoadingAttendantSections } = useAttendantSections(true, toRef(edit, 'isOn'))
const { data: sectionAttendants, pending: isLoadingAttendants } = useMembersOfSection(edit.selectedSectionId)

// lifecycle hooks

onMounted(() => {
if (gameId.value === DEFAULT_GAME_ID) {
    const msg = "Game ID missing from the url"
    toastPopup(msg)
    console.error(msg)
  }
});

// Computed
const pageTitle = computed(() => {
  if (game.value) return `Épreuve ${gameId.value}`
  if (isLoadingGame.value) return "Chargement"
  return "Épreuve inconnue"
})
const playerSchedule = computed(() => {
  if (!appConfig.value) return []
  return appConfig.value.playerSchedule
})
const attendantSchedule = computed(() => (appConfig.value?.attendantSchedule ?? []))
const isUserRegisteredHere = computed(() => {
  if (!currentUser.value) return false
  if (!currentUser.value.games) return false
  return Object.values(currentUser.value.games).map(game => game.id).includes(gameId.value)
})

// Methods

/**
 * This function is passed as a callback func of the action sheet button
 * @param result Action sheet result. The selection the action sheet is stored in result.data
 * @param payload Payload passed to the action sheet 
 */
const register = async (result: any, payload: any) => {
  const _timeSlot = result.data as AttendantTimeSlot
  const _targetUser = toValue(payload.targetUser) as VueFireUserProfile
  const _currentUser = toValue(currentUser)
  const _game = toValue(game)

  // arguments checks
  if (!_game) throw Error("Undefined game")
  if (!_currentUser) throw Error("User is not connected")
  if (!_targetUser) throw Error("Undefined target user")
  if (!appSettings.value) throw Error("Undefined appSettings")
  if (!appConfig.value) throw Error("Undefined appConfig")

  const maxGameAttendants = appSettings.value.maxGameAttendants
  const isCurrentUser = _targetUser.id === _currentUser.id
  const currentAttendants = _game.attendants[_timeSlot.id].map(attendant => attendant.id)

  try {
    // applicability checks
    if (
      !isCurrentUser &&
      !canRegister.section
    ) throw new Error(`
      Tu n'as pas le droit d'inscrire quelqu'un d'autre à une épreuve. 
      Le rôle minimum pour inscrire quelqu'un est ${getRoleByValue(ROLES.Chef)}
    `)
    if (
      _targetUser.sectionId != _currentUser.sectionId &&
      !canRegister.anyone
    ) throw new Error(`
      L'utilisateur ${getUserName(_targetUser)} ne fait pas partie de ta section. 
      Seuls les organisateurs peuvent assigner n'importe qui à une épreuve
    `)
    if (!canBeRegistered(_targetUser)) throw new Error(`
      Le rôle de ${getUserName(_targetUser)} est ${getRoleByValue(_targetUser.role)}. 
      Seuls les ${getRoleByValue(ROLES.Animateur)} et les ${getRoleByValue(ROLES.Chef)} peuvent être inscrit à une épreuve
    `)
    if (currentAttendants.includes(_targetUser.id)) throw Error(
      isCurrentUser
        ? `Tu es déjà inscrit.e à l'épreuve ${_game.id} au timing ${_timeSlot.name}`
        : `${getUserName(_targetUser)} est déjà inscrit.e au timing ${_timeSlot.name} de l'épreuve ${_game.id}`
    )
    if (currentAttendants.length >= maxGameAttendants) throw new Error(`
      Le nombre maximum d'animateurs a été atteint au timing ${_timeSlot.name} de l'épreuve ${_game.id}
    `)
    // if target user is busy at target timing
    if (_targetUser.games && _timeSlot.id in _targetUser.games && _targetUser.games[_timeSlot.id].id != DEFAULT_GAME_ID) {
      const currentGameId = _targetUser.games[_timeSlot.id].id
      const message =
        isCurrentUser
          ? `Tu es déjà inscrit.e à l'épreuve ${currentGameId} au timing ${_timeSlot.name}. Veux-tu te désincrire ?`
          : `${getUserName(_targetUser)} est déjà inscrit.e à l'épreuve ${currentGameId} au timing ${_timeSlot.name}. Le/la désincrire ?`
      confirmPopup(
        message,
        async () => {
          await removeAttendant(currentGameId, _targetUser.id, _timeSlot).then(() => {
            toastPopup(`Désinscription à l'épreuve ${currentGameId} effectuée`)
          })
          await addAttendant(_game.id, _targetUser.id, _timeSlot).then(() => {
            toastPopup("Responsables mis à jour")
          })
        },
        () => toastPopup("Enregistrement annulé")
      )
    } else {
      await addAttendant(_game.id, _targetUser.id, _timeSlot).then(() => {
        toastPopup("Responsables mis à jour")
      })
    }
  } catch(e: any){
    toastPopup(e.message)
    console.error(e)
  }
}

/**
 * This function is passed as a callback func of the action sheet button
 * @param result Action sheet result. The selection the action sheet is stored in result.data
 * @param payload Payload passed to the action sheet 
 */
const unregister = async (result: any, payload: any) => {
  const _timing = result.data as AttendantTimeSlot
  const _targetUser = toValue(payload.targetUser) as VueFireUserProfile
  const _game = toValue(game)

  // arguments checks
  if (!_game) throw Error("Undefined game")
  if (!_targetUser) throw Error("Undefined target user")

  await removeAttendant(_game.id, _targetUser.id, _timing).then(() => {
    toastPopup(`Désinscription à l'épreuve ${_game.id} effectuée`)
  })
}

const getWinner = (match: any) => {
  if (match.winner) return match.winner;
  if (match.draw === true) return "Égalité";
  return "";
};

const toggleEditMode = () => {
  edit.isOn = !edit.isOn
}

const goToProfile = (uid: string) => {
  if (!edit.isOn) router.push(`/profile/${uid}`);
}

const toggleNoScores = async () => {
  if (!game.value) {
    toastPopup("Game is undefined")
    console.error("Cannot toggle no scores, game is undefined", game)
    return
  }
  isTogglingNoScores.value = true;
  const newValue = !!game.value.noScores
  const promises = [];
  promises.push(setGameNoScores(gameId.value, newValue).then(() => {
    toastPopup(`Les scores de l'épreuve ${gameId} ont été ${newValue ? "activés" : "désactivés"}`)
  }))
  game.value.matches.forEach(matchId => promises.push(setMatchNoScores(matchId, newValue)))
  await Promise.all(promises).then(() =>
    console.debug(`Les scores des matchs de l'épreuve ${gameId} ont été ${newValue ? "activés" : "désactivés"}`)
  )
  isTogglingNoScores.value = false;
};
</script>
<style scoped>
.item-no-padding {
  --padding-start: 0px;
  --padding-end: 0px;
  --inner-padding-start: 0px;
  --inner-padding-end: 0px;
}
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
