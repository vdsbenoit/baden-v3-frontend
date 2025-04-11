<template>
  <ion-page>
    <header-component :pageTitle="pageTitle" />
    <ion-content :fullscreen="true">
      <refresher-component></refresher-component>
      <div v-if="isLoadingGame" class="ion-text-center">
        <ion-spinner></ion-spinner>
      </div>
      <div v-else-if="errorLoadingGame" class="not-found">
        <strong class="capitalize">Erreur</strong>
        <ion-text color="error">Impossible de charger le jeu</ion-text>
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
            <ion-list
              v-for="timeSlot in attendantSchedule"
              :key="timeSlot.id"
              lines="none"
              class="ion-no-margin ion-no-padding"
            >
              <ion-text color="primary"
                ><h2>{{ timeSlot.name }}</h2></ion-text
              >
              <span
                v-if="!game.attendants[timeSlot.id] || game.attendants[timeSlot.id].length < 1"
                class="ion-padding-start"
                >Pas encore de responsable inscrit</span
              >
              <ion-item v-else v-for="attendant in game.attendants[timeSlot.id]" :key="attendant.id">
                <ion-label class="ion-text-wrap" @click="goToProfile(attendant.id)">
                  <ion-text style="font-weight: bold">{{ attendant.name }}</ion-text>
                  <ion-text color="medium">&nbsp;({{ attendant.groupName ?? "" }})</ion-text>
                </ion-label>
                <ion-icon
                  v-if="edit.isOn"
                  :ios="closeOutline"
                  :md="closeSharp"
                  @click="removeAttendant(gameId, attendant.id, timeSlot.id)"
                ></ion-icon>
              </ion-item>
            </ion-list>
            <ion-grid class="ion-margin-top">
              <ion-row>
                <ion-col size="12" size-sm="6" class="ion-no-padding ion-padding-horizontal" v-if="canRegister.itself">
                  <my-action-sheet-button
                    expand="block"
                    color="primary"
                    action-sheet-header="Quand ?"
                    :buttons="attendantSchedule.map(timeSlot => ({ text: timeSlot.name, data: timeSlot }))"
                    :callback="register"
                    :payload="{ targetUser: currentUser }"
                  >
                    M'inscrire
                  </my-action-sheet-button>
                </ion-col>
                <ion-col
                  size="12"
                  size-sm="6"
                  class="ion-no-padding ion-padding-horizontal"
                  v-if="canRegister.itself && isUserRegisteredHere"
                >
                  <ion-button @click="unregister" expand="block" color="danger"> Se désinscrire </ion-button>
                </ion-col>
                <ion-col
                  size="12"
                  size-sm="6"
                  class="ion-no-padding ion-padding-horizontal"
                  v-if="canRegister.group || canRegister.anyone"
                >
                  <ion-button @click="toggleEditMode" expand="block" :color="edit.isOn ? 'medium' : 'tertiary'">
                    {{ edit.isOn ? "Arrêter la modification" : "Modifier les animateurs" }}
                  </ion-button>
                </ion-col>
                <ion-col size="12" size-sm="6" class="ion-no-padding ion-padding-horizontal" v-if="canEditGameSettings">
                  <ion-button v-if="isTogglingNoScores" expand="block" color="medium"
                    ><ion-spinner></ion-spinner
                  ></ion-button>
                  <ion-button v-else-if="game.noScores" @click="toggleNoScores" expand="block" color="success">
                    Réactiver les scores
                  </ion-button>
                  <ion-button v-else @click="toggleNoScores" expand="block" color="danger">
                    Désactiver les scores
                  </ion-button>
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
                  <ion-spinner v-if="isLoadingAttendantGroups"></ion-spinner>
                  <div v-if="errorLoadingAttendantGroups" class="ion-text-center">
                    <strong class="capitalize ion-text-center">Erreur</strong>
                    <ion-text color="error">Impossible de charger les groupes d'animateurs</ion-text>
                  </div>
                  <ion-select
                    v-else-if="attendantGroups && attendantGroups.length > 0"
                    v-model="edit.selectedAttendantGroupId"
                    placeholder="Choisir section"
                    interface="action-sheet"
                  >
                    <ion-select-option v-for="group in attendantGroups" :value="group.id" :key="group.id">
                      {{ group.name }} ({{ group.city }})
                    </ion-select-option>
                  </ion-select>
                  <div v-else class="ion-text-center ion-padding-top">Aucune section trouvée</div>
                </ion-col>
                <ion-col size="12" size-sm="6" v-if="edit.selectedAttendantGroupId != DEFAULT_GROUP_ID">
                  <ion-spinner v-if="isLoadingAttendants"></ion-spinner>
                  <div v-if="errorLoadingAttendants" class="ion-text-center">
                    <strong class="capitalize ion-text-center">Erreur</strong>
                    <ion-text color="error">Impossible de charger les animateurs</ion-text>
                  </div>
                  <ion-select
                    v-else-if="attendants && attendants.length > 0"
                    v-model="edit.selectedAttendantId"
                    placeholder="Choisir animateur"
                    interface="action-sheet"
                  >
                    <ion-select-option
                      color="dark"
                      v-for="attendant in attendants"
                      :value="attendant"
                      :key="attendant.id"
                    >
                      {{ getUserName(attendant) }}
                    </ion-select-option>
                  </ion-select>
                  <p v-else class="ion-text-center ion-padding-top">Aucun animateur trouvé</p>
                </ion-col>
              </ion-row>
              <ion-row>
                <ion-col
                  size="12"
                  size-sm="6"
                  class="ion-no-padding ion-padding-horizontal"
                  v-if="edit.selectedAttendantId"
                >
                  <my-action-sheet-button
                    expand="block"
                    color="primary"
                    action-sheet-header="Quand ?"
                    :buttons="attendantSchedule.map(timeSlot => ({ text: timeSlot.name, data: timeSlot }))"
                    :callback="register"
                    :payload="{ targetUser: edit.selectedAttendantId }"
                  >
                    Inscrire {{ getUserName(edit.selectedAttendantId) }}
                  </my-action-sheet-button>
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
              <strong class="capitalize">Erreur</strong>
              <ion-text color="error">Impossible de charger les duels</ion-text>
            </div>
            <ion-list-header v-else-if="matches && matches.length == 0"><h2>Aucun duel trouvé</h2></ion-list-header>
            <ion-list v-else>
              <div v-for="[i, timeSlot] in playerSchedule.entries()" :key="i">
                <ion-item v-if="Object.keys(breaks).includes(i.toString())" class="item-no-padding">
                  <ion-label>
                    <ion-icon
                      :ios="pauseCircleOutline"
                      :md="pauseCircleSharp"
                      style="vertical-align: middle"
                      class="schedule-icon ion-margin-end"
                    />
                    <ion-text class="time-slot ion-margin-end">{{ timeSlot.start }} - {{ timeSlot.stop }} </ion-text>
                    <ion-text color="primary" style="font-weight: bold">Pause {{ breaks[i] }}</ion-text>
                  </ion-label>
                </ion-item>
                <ion-item v-else :routerLink="`/match/${getMatch(i)?.id}`" class="item-no-padding">
                  <ion-label>
                    <ion-icon
                      :ios="peopleOutline"
                      :md="peopleSharp"
                      style="vertical-align: middle"
                      class="schedule-icon ion-margin-end"
                    />
                    <ion-text class="time-slot ion-margin-end">{{ timeSlot.start }} - {{ timeSlot.stop }} </ion-text>
                    <ion-text color="primary" style="font-weight: bold">{{ getMatch(i)?.playerTeamIds[0] }}</ion-text>
                    <ion-text> vs </ion-text>
                    <ion-text color="primary" style="font-weight: bold">{{ getMatch(i)?.playerTeamIds[1] }}</ion-text>
                  </ion-label>
                  <ion-badge
                    slot="end"
                    class="ion-no-margin"
                    :color="getMatch(i)?.draw ? 'warning' : 'success'"
                    v-if="getWinner(i)"
                    >{{ getWinner(i) }}</ion-badge
                  >
                </ion-item>
              </div>
            </ion-list>
          </ion-card-content>
        </ion-card>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
// prettier-ignore
import HeaderComponent from "@/components/HeaderComponent.vue";
import MyActionSheetButton from "@/components/MyActionSheetButton.vue"
import RefresherComponent from "@/components/RefresherComponent.vue"
import { useAppConfig, useAppSettings } from "@/composables/app"
import { useAttendantGroups } from "@/composables/attendantGroup"
import { useGame } from "@/composables/game"
import { useGameMatches } from "@/composables/match"
import { useCanEditGames, useCanRegister, useCanSeeModerationStuff } from "@/composables/rights"
import { useCurrentUserProfile, useMembersOfGroup } from "@/composables/userProfile"
import { DEFAULT_GAME_ID, DEFAULT_GROUP_ID, USER_ROLES } from "@/constants"
import { AttendantTimeSlot, VueFireUserProfile } from "@/types"
import { addAttendant, removeAttendant, setGameNoScores } from "@/utils/game"
import { setMatchNoScores } from "@/utils/match"
import { confirmPopup, errorPopup, toastPopup } from "@/utils/popup"
import { canBeRegistered } from "@/utils/rights"
import { getRoleByValue, getUserName } from "@/utils/userProfile"
// prettier-ignore
import { IonBadge, IonButton, IonCard, IonCardContent, IonCardHeader, IonCardSubtitle, IonCardTitle, IonCol, IonContent, IonGrid, IonIcon, IonItem, IonLabel, IonList, IonListHeader, IonPage, IonRow, IonSelect, IonSelectOption, IonSpinner, IonText, useIonRouter } from "@ionic/vue";
import { computed, reactive, ref, toRef } from "@vue/reactivity"
import { useRouteParams } from "@vueuse/router"
import {
  closeOutline,
  closeSharp,
  pauseCircleOutline,
  pauseCircleSharp,
  peopleOutline,
  peopleSharp
} from "ionicons/icons"
import { onMounted, toValue, watch } from "vue"

// reactive data

const isTogglingNoScores = ref(false)
const edit = reactive({
  isOn: false,
  selectedAttendantGroupId: DEFAULT_GROUP_ID,
  selectedAttendantId: undefined
})

// composables

const router = useIonRouter()
const gameId = useRouteParams("gameId", DEFAULT_GAME_ID)
const currentUser = useCurrentUserProfile()
const appSettings = useAppSettings()
const appConfig = useAppConfig()
const { data: game, pending: isLoadingGame, error: errorLoadingGame } = useGame(gameId)
const { data: matches, pending: isLoadingMatches, error: errorLoadingMatches } = useGameMatches(gameId)
const canRegister = useCanRegister()
const canEditGameSettings = useCanEditGames()
const canSeeModerationStuff = useCanSeeModerationStuff()

const breaks = computed(() => {
  if (!appConfig.value || !game.value) return []
  return appConfig.value.groupCategories[game.value.groupCategoryId].breaks
})
const getMatch = (time: number) => {
  if (!matches.value) return null
  return matches.value.find(match => match.time === time)
}

const {
  data: attendantGroups,
  pending: isLoadingAttendantGroups,
  error: errorLoadingAttendantGroups
} = useAttendantGroups(toRef(edit, "isOn"), "exclude", canSeeModerationStuff)
const {
  data: attendants,
  pending: isLoadingAttendants,
  error: errorLoadingAttendants
} = useMembersOfGroup(toRef(edit, "selectedAttendantGroupId"))

watch([errorLoadingGame, errorLoadingMatches, errorLoadingAttendantGroups, errorLoadingAttendants], errors => {
  if (errors[0]) {
    console.error("Error loading game:", errors[0])
  }
  if (errors[1]) {
    console.error("Error loading matches:", errors[1])
  }
  if (errors[2]) {
    console.error("Error loading attendant groups:", errors[2])
  }
  if (errors[3]) {
    console.error("Error loading attendants:", errors[3])
  }
})

// lifecycle hooks

onMounted(() => {
  if (gameId.value === DEFAULT_GAME_ID) {
    const msg = "Game ID missing from the url"
    toastPopup(msg)
    console.error(msg)
  }
})

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
const attendantSchedule = computed(() => appConfig.value?.attendantSchedule ?? [])
const isUserRegisteredHere = computed(() => {
  if (!currentUser.value) return false
  if (!currentUser.value.games) return false
  return Object.values(currentUser.value.games)
    .map(game => game.id)
    .includes(gameId.value)
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
  let currentAttendantsIds: string[] = []
  if (_game.attendants[_timeSlot.id]) {
    currentAttendantsIds = _game.attendants[_timeSlot.id].map(attendant => attendant.id)
  }

  try {
    // applicability checks
    if (!isCurrentUser && !canRegister.group)
      throw new Error(`
      Tu n'as pas le droit d'inscrire quelqu'un d'autre à une épreuve.
      Le rôle minimum pour inscrire quelqu'un est ${getRoleByValue(USER_ROLES.Chef)}
    `)
    if (_targetUser.groupId != _currentUser.groupId && !canRegister.anyone)
      throw new Error(`
      L'utilisateur ${getUserName(_targetUser)} ne fait pas partie de ta section.
      Seuls les organisateurs peuvent assigner n'importe qui à une épreuve
    `)
    // if target user is not an attendant
    if (!canBeRegistered(_targetUser))
      throw new Error(`
      Le rôle de ${getUserName(_targetUser)} est ${getRoleByValue(_targetUser.role)}.
      Seuls les ${getRoleByValue(USER_ROLES.Animateur)} et les ${getRoleByValue(
        USER_ROLES.Chef
      )} peuvent être inscrit à une épreuve
    `)
    // if target user is already registered in another game
    if (currentAttendantsIds.includes(_targetUser.id))
      throw Error(
        isCurrentUser
          ? `Tu es déjà inscrit.e à l'épreuve ${_game.id} au timing ${_timeSlot.name}`
          : `${getUserName(_targetUser)} est déjà inscrit.e au timing ${_timeSlot.name} de l'épreuve ${_game.id}`
      )
    // if max attendants reached
    if (currentAttendantsIds.length >= maxGameAttendants)
      throw new Error(`
      Le nombre maximum d'animateurs a été atteint au timing ${_timeSlot.name} de l'épreuve ${_game.id}
    `)
    // if target user is busy at target timing
    if (_targetUser.games && _timeSlot.id in _targetUser.games && _targetUser.games[_timeSlot.id]) {
      const currentGameId = _targetUser.games[_timeSlot.id].id
      const message = isCurrentUser
        ? `Tu es déjà inscrit.e à l'épreuve ${currentGameId} au timing ${_timeSlot.name}. Veux-tu te désincrire ?`
        : `${getUserName(_targetUser)} est déjà inscrit.e à l'épreuve ${currentGameId} au timing ${
            _timeSlot.name
          }. Le/la désincrire ?`
      confirmPopup(
        message,
        async () => {
          await removeAttendant(currentGameId, _targetUser.id, _timeSlot.id).then(() => {
            toastPopup(`Désinscription à l'épreuve ${currentGameId} effectuée`)
          })
          await addAttendant(_game.id, _targetUser.id, _timeSlot.id).then(() => {
            toastPopup("Responsables mis à jour")
          })
        },
        () => toastPopup("Enregistrement annulé")
      )
    } else {
      await addAttendant(_game.id, _targetUser.id, _timeSlot.id).then(() => {
        toastPopup("Responsables mis à jour")
      })
    }
  } catch (e: any) {
    toastPopup(e.message)
    console.error(e)
  }
}

/**
 * Unregister the current user from all games
 */
const unregister = async () => {
  // arguments checks
  if (!currentUser.value) return errorPopup("Current user data not found")

  for (const timeSlot of attendantSchedule.value) {
    await removeAttendant(gameId.value, currentUser.value.id, timeSlot.id).then(() => {
      toastPopup(`Désinscription à l'épreuve ${gameId.value} effectuée`)
    })
  }
}

const getWinner = (time: number) => {
  const match = getMatch(time)
  if (!match) return ""
  if (match.winnerTeamId) return match.winnerTeamId
  if (match.draw === true) return "="
  return ""
}

const toggleEditMode = () => {
  edit.isOn = !edit.isOn
}

const goToProfile = (uid: string) => {
  if (!edit.isOn) router.push(`/profile/${uid}`)
}

const toggleNoScores = async () => {
  if (!game.value) {
    toastPopup("Game is undefined")
    console.error("Cannot toggle no scores, game is undefined", game)
    return
  }
  isTogglingNoScores.value = true
  const newValue = !!game.value.noScores
  const promises = []
  promises.push(
    setGameNoScores(gameId.value, newValue).then(() => {
      toastPopup(`Les scores de l'épreuve ${gameId} ont été ${newValue ? "activés" : "désactivés"}`)
    })
  )
  game.value.matches.forEach(matchId => promises.push(setMatchNoScores(matchId, newValue)))
  await Promise.all(promises).then(() =>
    console.log(`Les scores des matchs de l'épreuve ${gameId} ont été ${newValue ? "activés" : "désactivés"}`)
  )
  isTogglingNoScores.value = false
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
  width: 100%;
  text-align: center;
  justify-content: center;
  color: var(--ion-color-dark);
  --placeholder-color: var(--ion-color-dark);
  /* Set full opacity on the placeholder */
  --placeholder-opacity: 1;
}
</style>
