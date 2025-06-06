<template>
  <ion-page>
    <header-component :page-title="pageTitle" />
    <ion-content :fullscreen="true" class="ion-padding">
      <refresher-component />
      <div v-if="!isProfile" class="not-found ion-padding">
        <strong class="capitalize">Nous n'avons pas trouvé ce profil...</strong>
        <p>Retour à <a @click="router.go(-1)">la page précédente</a></p>
      </div>
      <ion-card v-else class="ion-no-margin ion-margin-bottom ion-padding-bottom">
        <ion-list>
          <!-- Name (edit mode) -->
          <ion-item v-if="formData.name.isEditting" lines="full">
            <ion-label position="stacked" color="primary"> Nom </ion-label>
            <ion-input v-model="formData.name.value" name="name" type="text" @keydown.enter="setName" />
            <ion-icon slot="end" :ios="checkmarkOutline" :md="checkmarkSharp" @click="setName" />
            <ion-icon
              slot="end"
              :ios="closeOutline"
              :md="closeSharp"
              @click="
                formData.name.isEditting = false
                resetFormData()
              "
            />
          </ion-item>
          <!-- Name (read mode) -->
          <ion-item v-else lines="full">
            <ion-label position="stacked" color="primary"> Nom </ion-label>
            <ion-input name="name" type="text" :readonly="true" inputmode="none">
              {{ formData.name.value }}
            </ion-input>
            <ion-spinner v-if="formData.name.isUpdating" />
            <ion-icon
              v-else-if="canEditProfile"
              slot="end"
              :ios="pencilOutline"
              :md="pencilSharp"
              @click="formData.name.isEditting = true"
            />
          </ion-item>
          <!-- Role (edit mode) -->
          <ion-item v-if="formData.role.isEditting" lines="full">
            <ion-label position="stacked" color="primary"> Role </ion-label>
            <ion-select
              v-model="formData.role.value"
              cancel-text="Annuler"
              interface="action-sheet"
              @ion-change="setRole"
              @ion-cancel="
                formData.role.isEditting = false
                resetFormData()
              "
            >
              <ion-select-option v-for="(value, role) in selectableRoles" :key="value" :value="value">
                {{ role }}
              </ion-select-option>
            </ion-select>
            <ion-icon
              slot="end"
              :ios="closeOutline"
              :md="closeSharp"
              @click="
                formData.role.isEditting = false
                resetFormData()
              "
            />
          </ion-item>
          <!-- Role (read mode) -->
          <ion-item v-else lines="full">
            <ion-label position="stacked" color="primary"> Role </ion-label>
            <ion-input type="text" :readonly="true" inputmode="none">
              {{ getRoleByValue(formData.role.value) }}
            </ion-input>
            <ion-spinner v-if="formData.role.isUpdating" />
            <ion-icon
              v-else-if="canEditRole"
              slot="end"
              :ios="pencilOutline"
              :md="pencilSharp"
              @click="formData.role.isEditting = true"
            />
          </ion-item>
          <!-- PLAYER FIELDS -->
          <div v-if="isPlayer">
            <!-- Player Group Category (edit mode) -->
            <ion-item v-if="formData.playerGroup.isEditting" lines="full">
              <ion-label position="stacked" color="primary"> Catégorie de section </ion-label>
              <ion-input v-if="!appConfig" type="text" readonly>
                Error: cannot load group categories (i.e. appConfig)
              </ion-input>
              <ion-select
                v-else
                v-model="formData.playerGroup.categoryId"
                cancel-text="Annuler"
                interface="action-sheet"
                @ion-change="
                  formData.playerGroup.id = DEFAULT_GROUP_ID
                  formData.playerGroup.name = ''
                "
                @ion-cancel="
                  formData.playerGroup.isEditting = false
                  resetFormData()
                "
              >
                <ion-select-option
                  v-for="(groupCategory, groupCategoryId) in appConfig.groupCategories"
                  :key="groupCategoryId"
                  :value="groupCategoryId"
                >
                  {{ groupCategory.name }}
                </ion-select-option>
              </ion-select>
              <ion-icon
                slot="end"
                :ios="closeOutline"
                :md="closeSharp"
                @click="
                  formData.playerGroup.isEditting = false
                  resetFormData()
                "
              />
            </ion-item>
            <!-- Player Group Category (read mode) -->
            <ion-item v-else lines="full">
              <ion-label position="stacked" color="primary"> Catégorie de section </ion-label>
              <p v-if="!appConfig" class="field-error">
                Error: cannot load group categories (i.e. appConfig)
              </p>
              <ion-input v-else-if="appConfig" type="text" readonly>
                {{ appConfig.groupCategories[formData.playerGroup.categoryId]?.name }}
              </ion-input>
              <ion-spinner v-else />
              <ion-spinner v-if="formData.playerGroup.isUpdating" />
              <ion-icon
                v-else-if="canEditProfile"
                slot="end"
                :ios="pencilOutline"
                :md="pencilSharp"
                @click="formData.playerGroup.isEditting = true"
              />
            </ion-item>
            <!-- Player Group (edit mode) -->
            <ion-item v-if="formData.playerGroup.isEditting" lines="full">
              <ion-label position="stacked" color="primary"> Section </ion-label>
              <p v-if="formData.playerGroup.categoryId === DEFAULT_GROUP_CATEGORY_ID" class="field-error">
                Selectionne d'abord un type de section
              </p>
              <ion-select
                v-else-if="playerGroups.length > 0"
                v-model="formData.playerGroup.id"
                cancel-text="Annuler"
                interface="action-sheet"
                @ion-dismiss="setPlayerGroup"
                @ion-cancel="
                  formData.playerGroup.isEditting = false
                  resetFormData()
                "
              >
                <ion-select-option v-for="playerGroup in playerGroups" :key="playerGroup.id" :value="playerGroup.id">
                  {{ playerGroup.name }}
                </ion-select-option>
              </ion-select>
              <p v-else class="field-error">
                Pas de section pour ce type de section
              </p>
              <ion-icon
                slot="end"
                :ios="closeOutline"
                :md="closeSharp"
                @click="
                  formData.playerGroup.isEditting = false
                  resetFormData()
                "
              />
            </ion-item>
            <!-- Player Group (read mode) -->
            <ion-item v-else lines="full">
              <ion-label position="stacked" color="primary" @click="goToPlayerGroupPage(formData.playerGroup.id)">
                Section
              </ion-label>
              <ion-input
                name="playerGroup"
                type="text"
                :readonly="true"
                inputmode="none"
                @click="goToPlayerGroupPage(formData.playerGroup.id)"
              >
                {{ formData.playerGroup.name }}
              </ion-input>
              <ion-spinner v-if="formData.playerGroup.isUpdating" />
              <ion-icon
                v-else-if="canEditProfile"
                slot="end"
                :ios="pencilOutline"
                :md="pencilSharp"
                @click="formData.playerGroup.isEditting = true"
              />
            </ion-item>
            <!-- Team (edit mode) -->
            <ion-item v-if="formData.team.isEditting" lines="full">
              <ion-label position="stacked" color="primary"> Équipe </ion-label>
              <ion-select
                v-if="selectedPlayerGroup && selectedPlayerGroup.teams.length > 0"
                v-model="formData.team.value"
                cancel-text="Annuler"
                interface="action-sheet"
                @ion-change="setTeam"
                @ion-cancel="
                  formData.team.isEditting = false
                  resetFormData()
                "
              >
                <ion-select-option v-for="team in selectedPlayerGroup.teams" :key="team" :value="team">
                  {{ team }}
                </ion-select-option>
              </ion-select>
              <p v-else class="field-error">
                Pas de team pour cette section
              </p>
              <ion-icon
                slot="end"
                :ios="closeOutline"
                :md="closeSharp"
                @click="
                  formData.team.isEditting = false
                  resetFormData()
                "
              />
            </ion-item>
            <!-- Team (read mode) -->
            <ion-item v-else lines="full">
              <ion-label position="stacked" color="primary" @click="goToTeamPage(formData.team.value)">
                Équipe
              </ion-label>
              <ion-input type="text" :readonly="true" inputmode="none" @click="goToTeamPage(formData.team.value)">
                {{ formData.team.value }}
              </ion-input>
              <ion-spinner v-if="formData.team.isUpdating" />
              <ion-icon
                v-else-if="canEditProfile"
                slot="end"
                :ios="pencilOutline"
                :md="pencilSharp"
                @click="formData.team.isEditting = true"
              />
            </ion-item>
          </div>
          <div v-if="isAttendant || isStaff">
            <!-- Attendant Group (edit mode) -->
            <ion-item v-if="formData.attendantGroup.isEditting" lines="full">
              <ion-label position="stacked" color="primary"> Section </ion-label>
              <ion-select
                v-if="attendantGroups.length > 0"
                v-model="formData.attendantGroup.id"
                cancel-text="Annuler"
                interface="action-sheet"
                @ion-change="setAttendantGroup"
                @ion-cancel="
                  formData.attendantGroup.isEditting = false
                  resetFormData()
                "
              >
                <ion-select-option
                  v-for="attenantGroup in attendantGroups"
                  :key="attenantGroup.id"
                  :value="attenantGroup.id"
                >
                  {{ attenantGroup.name }}
                </ion-select-option>
              </ion-select>
              <p v-else class="field-error">
                Pas de section
              </p>
              <ion-icon
                slot="end"
                :ios="closeOutline"
                :md="closeSharp"
                @click="
                  formData.attendantGroup.isEditting = false
                  resetFormData()
                "
              />
            </ion-item>
            <!-- Attendant Group (read mode) -->
            <ion-item v-else lines="full">
              <ion-label position="stacked" color="primary" @click="goToAttendantGroupPage(formData.attendantGroup.id)">
                Section
              </ion-label>
              <ion-input
                name="attendantGroup"
                type="text"
                :readonly="true"
                inputmode="none"
                @click="goToAttendantGroupPage(formData.attendantGroup.id)"
              >
                {{ formData.attendantGroup.name }}
              </ion-input>
              <ion-spinner v-if="formData.attendantGroup.isUpdating" />
              <ion-icon
                v-else-if="canEditAttendantGroup"
                slot="end"
                :ios="pencilOutline"
                :md="pencilSharp"
                @click="
                  shouldLoadAttendantGroups = true
                  formData.attendantGroup.isEditting = true
                "
              />
            </ion-item>
          </div>
          <div v-if="isAttendant">
            <div v-for="timeSlot in attendantSchedule" :key="timeSlot.id">
              <!-- Attendant Game (edit mode) -->
              <ion-item v-if="formData.attendantGames.isEditting" lines="full">
                <ion-label position="stacked" color="primary"> Épreuve {{ timeSlot.name }} </ion-label>
                <ion-select
                  v-model="formData.attendantGames.ids[timeSlot.id]"
                  cancel-text="Annuler"
                  interface="action-sheet"
                  @ion-change="setGame(timeSlot.id)"
                  @ion-cancel="
                    formData.attendantGames.isEditting = false
                    resetFormData()
                  "
                >
                  <ion-select-option v-for="game in games" :key="game.id" :value="game.id">
                    {{ game.id }}{{ isTimeSlotFull(game, timeSlot.id) ? ' [COMPLET] ' : ' ' }}{{ game.name }}
                  </ion-select-option>
                </ion-select>
                <ion-icon
                  slot="end"
                  :ios="closeOutline"
                  :md="closeSharp"
                  @click="
                    formData.attendantGames.isEditting = false
                    resetFormData()
                  "
                />
              </ion-item>
              <!-- Attendant Game (read mode) -->
              <ion-item v-else lines="full">
                <ion-label
                  position="stacked"
                  color="primary"
                  @click="goToGamePage(formData.attendantGames.ids[timeSlot.id])"
                >
                  Épreuve {{ timeSlot.name }}
                </ion-label>
                <ion-input
                  v-if="timeSlot.id in formData.attendantGames.names"
                  type="text"
                  :readonly="true"
                  inputmode="none"
                  @click="goToGamePage(formData.attendantGames.ids[timeSlot.id])"
                >
                  <span>
                    {{ formData.attendantGames.ids[timeSlot.id] }}
                    {{ formData.attendantGames.names[timeSlot.id] }}
                  </span>
                </ion-input>
                <ion-input v-else type="text" :readonly="true" inputmode="none">
                  Pas d'épreuve sélectionnée
                </ion-input>
                <ion-spinner v-if="formData.attendantGames.isUpdating" />
                <ion-icon
                  v-else-if="canEditGames"
                  slot="end"
                  :ios="pencilOutline"
                  :md="pencilSharp"
                  @click="
                    shouldLoadGames = true
                    formData.attendantGames.isEditting = true
                  "
                />
              </ion-item>
            </div>
          </div>

          <!-- email -->
          <ion-item v-if="canSeeEmail" lines="full">
            <ion-label position="stacked" color="primary"> Adresse email </ion-label>
            <ion-input v-if="userProfile" type="text" :readonly="true" inputmode="none">
              {{ userProfile.email }}
            </ion-input>
            <p v-else class="field-error">
              Erreur: impossible de charger l'adresse email
            </p>
          </ion-item>
        </ion-list>
        <ion-grid class="ion-no-padding ion-margin-top">
          <ion-row>
            <ion-col v-if="isOwnProfile" size="12" size-sm="6" class="ion-no-padding ion-padding-horizontal">
              <ion-button expand="block" class="" color="warning" @click="logOut">
                Se déconnecter
              </ion-button>
            </ion-col>
            <ion-col v-if="canDeleteProfile" size="12" size-sm="6" class="ion-no-padding ion-padding-horizontal">
              <ion-button expand="block" class="" color="danger" @click="removeAccount">
                Supprimer le compte
              </ion-button>
            </ion-col>
            <ion-col v-if="canResetOnboarding" size="12" size-sm="6" class="ion-no-padding ion-padding-horizontal">
              <ion-button expand="block" class="" color="medium" @click="resetOnboarding">
                Reset onboarding
              </ion-button>
            </ion-col>
          </ion-row>
        </ion-grid>
      </ion-card>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import type { VueFireGame } from '@/types'
import HeaderComponent from '@/components/HeaderComponent.vue'
import RefresherComponent from '@/components/RefresherComponent.vue'
import { useAppConfig, useAppSettings } from '@/composables/app'
import { useAttendantGroups } from '@/composables/attendantGroup'
import { useGames } from '@/composables/game'
import { usePlayerGroup, usePlayerGroups } from '@/composables/playerGroup'
import { useEditProfileRights } from '@/composables/rights'
import { useCurrentUserProfile, useUserProfile } from '@/composables/userProfile'
import {
  DEFAULT_GAME_ID,
  DEFAULT_GROUP_CATEGORY_ID,
  DEFAULT_GROUP_ID,
  DEFAULT_TEAM_ID,
  DEFAULT_USER_ID,
  DEFAULT_USER_ROLE_VALUE,
  USER_ROLES,
} from '@/constants'
import { addAttendant, removeAttendant } from '@/utils/game'
import { confirmPopup, errorPopup, loadingPopup, toastPopup } from '@/utils/popup'
import { getRoleByValue, removeFirebaseAccount, signOut, updateUserProfile } from '@/utils/userProfile'
import {
  IonButton,
  IonCard,
  IonCol,
  IonContent,
  IonGrid,
  IonIcon,
  IonInput,
  IonItem,
  IonLabel,
  IonList,
  IonPage,
  IonRow,
  IonSelect,
  IonSelectOption,
  IonSpinner,
} from '@ionic/vue'
import { useRouteParams } from '@vueuse/router'
import DOMPurify from 'dompurify'
import { checkmarkOutline, checkmarkSharp, closeOutline, closeSharp, pencilOutline, pencilSharp } from 'ionicons/icons'
import { computed, reactive, ref, watch, watchEffect } from 'vue'
import { useRouter } from 'vue-router'

// Strip Erreur, Anonyme & Newbie from ROLES
const selectableRoles = Object.fromEntries(
  Object.entries(USER_ROLES).filter(
    ([, value]) => ![USER_ROLES.Erreur, USER_ROLES.Anonyme, USER_ROLES.Newbie].includes(value),
  ),
)

// reactive form data
const formData = reactive({
  name: {
    isEditting: false,
    isUpdating: false,
    value: '',
  },
  role: {
    isEditting: false,
    isUpdating: false,
    value: DEFAULT_USER_ROLE_VALUE,
  },
  playerGroup: {
    isEditting: false,
    isUpdating: false,
    categoryId: DEFAULT_GROUP_CATEGORY_ID,
    id: DEFAULT_GROUP_ID,
    name: '',
  },
  team: {
    isEditting: false,
    isUpdating: false,
    value: DEFAULT_TEAM_ID,
  },
  attendantGroup: {
    isEditting: false,
    isUpdating: false,
    id: DEFAULT_GROUP_ID,
    name: '',
  },
  attendantGames: {
    isEditting: false,
    isUpdating: false,
    ids: {} as { [timingId: string]: string },
    names: {} as { [timingId: string]: string },
  },
})

// Composables & computed variables

const router = useRouter()
const appConfig = useAppConfig()
const appSettings = useAppSettings()
const attendantSchedule = computed(() => appConfig.value?.attendantSchedule ?? [])
const currentUserProfile = useCurrentUserProfile()
const queryUserId = useRouteParams<string>('userId', DEFAULT_USER_ID)
const userId = computed(() => {
  if (!currentUserProfile.value) return DEFAULT_USER_ID
  return queryUserId.value === DEFAULT_USER_ID ? currentUserProfile.value.id : queryUserId.value
})
const userProfile = useUserProfile(userId)

// Checks & rights
const isProfile = computed(() => {
  return !!userProfile.value?.email
})
const isPlayer = computed(() => {
  if (!userProfile.value) return false
  return userProfile.value.role === USER_ROLES.Participant
})
const isAttendant = computed(() => {
  if (!userProfile.value) return false
  return userProfile.value.role === USER_ROLES.Animateur || userProfile.value.role === USER_ROLES.Chef
})
const isStaff = computed(() => {
  if (!userProfile.value) return false
  return userProfile.value.role >= USER_ROLES.Organisateur
})
const {
  isOwnProfile,
  canEditProfile,
  canSeeEmail,
  canEditGames,
  canEditAttendantGroup,
  canEditRole,
  canResetOnboarding,
  canDeleteProfile,
} = useEditProfileRights(userProfile)

function isTimeSlotFull(game: VueFireGame, timeSlotId: string) {
  if (!appSettings.value) return false
  if (!game.attendants || !game.attendants[timeSlotId]) return false
  return game.attendants[timeSlotId].length >= appSettings.value.maxGameAttendants
}

const pageTitle = computed(() => {
  if (isOwnProfile.value) return 'Ton profil'
  if (!userProfile.value || !userProfile.value.email) return 'Profil inconnu'
  if (userProfile.value.name) return `Profil de ${userProfile.value.name}`
  return `Profil de ${userProfile.value.email}`
})

// Lazy loading of all player groups
// They are only loaded after the user starts editting the player group
const selectedPlayergroupCategoryId = computed(() => {
  return formData.playerGroup.isEditting ? formData.playerGroup.categoryId : DEFAULT_GROUP_CATEGORY_ID
})
const playerGroups = usePlayerGroups(selectedPlayergroupCategoryId)

// This computed variable is necessary in order to keep the reactivity
const selectedPlayerGroupId = computed(() => {
  return formData.playerGroup.id
})
const selectedPlayerGroup = usePlayerGroup(selectedPlayerGroupId)

// Lazy loading of games
// They are only loaded after the user starts editting the attendantGames
const shouldLoadGames = ref(true)
const games = useGames(shouldLoadGames)

// Lazy loading of attendant groups
// They are only loaded after the user starts editting the field
const shouldLoadAttendantGroups = ref(false)
const loadStaffGroups = computed(() => (formData.role.value >= USER_ROLES.Organisateur ? 'only' : 'exclude'))
const attendantGroups = useAttendantGroups(shouldLoadAttendantGroups, loadStaffGroups, true, currentUserProfile)

/**
 * Update formData with selected user profile data
 * Does not update the form data if the user is editting the field
 */
function resetFormData() {
  if (!userProfile.value) return

  // common fields
  if (!formData.name.isEditting && !formData.name.isUpdating) formData.name.value = userProfile.value.name
  if (!formData.role.isEditting && !formData.role.isUpdating)
    formData.role.value = userProfile.value.role ?? DEFAULT_USER_ROLE_VALUE

  // players
  if (userProfile.value.role === USER_ROLES.Participant) {
    if (!formData.team.isEditting && !formData.team.isUpdating)
      formData.team.value = userProfile.value.teamId ?? DEFAULT_TEAM_ID
    if (!formData.playerGroup.isEditting && !formData.playerGroup.isUpdating) {
      formData.playerGroup.id = userProfile.value.groupId ?? DEFAULT_GROUP_ID
      formData.playerGroup.name = userProfile.value.groupName ?? ''
      formData.playerGroup.categoryId = selectedPlayerGroup.value?.groupCategoryId ?? DEFAULT_GROUP_CATEGORY_ID
    }
  }

  // attendants & staff
  if (
    userProfile.value.role >= USER_ROLES.Animateur
    && !formData.attendantGroup.isEditting
    && !formData.attendantGroup.isUpdating
  ) {
    formData.attendantGroup.id = userProfile.value.groupId ?? DEFAULT_GROUP_ID
    formData.attendantGroup.name = userProfile.value.groupName ?? ''
  }

  // attendants
  if (
    (userProfile.value.role === USER_ROLES.Animateur || userProfile.value.role === USER_ROLES.Chef)
    && !formData.attendantGames.isEditting
    && !formData.attendantGames.isUpdating
  ) {
    formData.attendantGames.ids = {} as { [timingId: string]: string }
    formData.attendantGames.names = {} as { [timingId: string]: string }
    if (userProfile.value.games) {
      for (const [timeSlotId, game] of Object.entries(userProfile.value.games)) {
        formData.attendantGames.ids[timeSlotId] = game.id
        formData.attendantGames.names[timeSlotId] = game.name
      }
    }
  }
}

// Watchers

// Update the form data when the user profile changes
watch(userProfile, (newProfileValue) => {
  if (newProfileValue) {
    resetFormData()
  }
})
watch(selectedPlayerGroup, (newGroupValue) => {
  if (newGroupValue) {
    resetFormData()
  }
})
// this is necessary to keep userProfile.games reactive
watchEffect(() => {
  if (!userProfile.value) return
  if (userProfile.value.games) resetFormData()
})

// Go to pages

function goToPlayerGroupPage(groupId: string) {
  if (groupId !== DEFAULT_GROUP_ID) router.push(`/player-group/${groupId}`)
}
function goToAttendantGroupPage(groupId: string) {
  if (groupId !== DEFAULT_GROUP_ID) router.push(`/attendant-group/${groupId}`)
}
function goToTeamPage(teamId: string) {
  if (teamId !== DEFAULT_TEAM_ID) router.push(`/team/${teamId}`)
}
function goToGamePage(gameId: string) {
  if (gameId !== DEFAULT_GAME_ID) router.push(`/game/${gameId}`)
}

// Setters

/**
 * Setters
 *
 * Each setter is responsible for updating the user profile with the new data
 * It also handles the loading and error states
 *
 * The resetFormData function is called at the end of each setter to reset the form data
 *
 * If an error occurs, the function throws an error and the form data is not reset
 */

/**
 * Set a new name for the user
 * Sanitize the input before updating the user profile
 */
async function setName() {
  if (!formData.name.value) {
    toastPopup('Erreur : aucun nom n\'a été entré')
    formData.name.isEditting = false
    resetFormData()
    return
  }
  formData.name.isEditting = false
  formData.name.isUpdating = true
  await updateUserProfile(userId.value, { name: DOMPurify.sanitize(formData.name.value) }).catch((error) => {
    errorPopup(error.message, `Le n'a pas pu être mis à jour`)
  })
  formData.name.isUpdating = false
  resetFormData()
}

/**
 * Set a new role for the user
 * If the user was registered to games & that the new roles is not an attendant, remove the games
 * Throw an error if trying to upgrade a participant to an higher role
 * Throw an error if trying to downgrade an attendant (or higher) to a participant
 */
async function setRole() {
  if (!formData.role.value || formData.role.value === DEFAULT_USER_ROLE_VALUE) {
    toastPopup('Erreur : aucun rôle n\'a été sélectionné')
    formData.role.isEditting = false
    resetFormData()
    return
  }
  if (!userProfile.value) {
    errorPopup('Le profil de l\'utilisateur n\'a pas été chargé')
    formData.role.isEditting = false
    resetFormData()
    return
  }
  if (userProfile.value.role === USER_ROLES.Participant && formData.role.value > USER_ROLES.Participant) {
    errorPopup(
      'Pour cela, il faut supprimer et recréer l\'utilisateur',
      'Il n\'est pas possible de changer le rôle d\'un participant',
    )
    formData.role.isEditting = false
    resetFormData()
    return
  }
  if (userProfile.value.role >= USER_ROLES.Animateur && formData.role.value < USER_ROLES.Animateur) {
    errorPopup(
      'Pour cela, il faut supprimer et recréer l\'utilisateur',
      'Il n\'est pas possible de rétrograder un utilisateur au role de participant',
    )
    formData.role.isEditting = false
    resetFormData()
    return
  }
  formData.role.isEditting = false
  formData.role.isUpdating = true
  console.log('ROLE 1', formData.role.value)
  // if the user was registered to games & that the new roles is not an attendant, remove the games
  if (
    userProfile.value.games
    && Object.values(userProfile.value.games).length > 0
    && formData.role.value > USER_ROLES.Chef
  ) {
    for (const [timeSlotId, game] of Object.entries(userProfile.value.games)) {
      try {
        await removeAttendant(game.id, userProfile.value.id, timeSlotId)
      } catch (error: any) {
        errorPopup(error.message, `Erreur lors du désenregistrement de l'utilisateur à l'épreuve ${game}`)
        formData.role.isUpdating = false
        resetFormData()
        throw error
      }
      toastPopup('L\'utilisateur a été désinscrit de ses épreuves car son nouveau rôles n\'est plus dans l\'animation')
    }
  }
  console.log('ROLE 2', formData.role.value)
  try {
    await updateUserProfile(userProfile.value.id, {
      role: formData.role.value,
      groupId: DEFAULT_GROUP_ID,
      groupName: '',
    })
  } catch (error: any) {
    errorPopup(error.message, `Le rôle n'a pas pu être mis à jour`)
    formData.role.isUpdating = false
    resetFormData()
    throw error
  }
  formData.role.isUpdating = false
  resetFormData()
  console.log('ROLE 3', formData.role.value)
}

/**
 * Set a new player group
 * Side effect: it resets the team value
 */
async function setPlayerGroup() {
  if (formData.playerGroup.id === DEFAULT_GROUP_ID) {
    formData.team.isEditting = false
    resetFormData()
    return
  }
  formData.playerGroup.isEditting = false
  formData.playerGroup.isUpdating = true
  const selectedGroup = playerGroups.value.find(group => group.id === formData.playerGroup.id)
  if (!selectedGroup) {
    formData.playerGroup.isUpdating = false
    resetFormData()
    return
  }
  try {
    await updateUserProfile(userId.value, {
      groupId: formData.playerGroup.id,
      groupName: selectedGroup.name,
      teamId: DEFAULT_TEAM_ID,
    })
  } catch (error: any) {
    errorPopup(error.message, `La section n'a pas pu être mise à jour`)
    formData.playerGroup.isUpdating = false
    resetFormData()
    throw error
  }
  toastPopup('Vu que la section a changé, l\'équipe a été effacée du profil')
  formData.playerGroup.isUpdating = false
  resetFormData()
}

/**
 * Set a new team
 */
async function setTeam() {
  if (formData.team.value === DEFAULT_TEAM_ID) {
    toastPopup('Erreur : aucune équipe n\'a été sélectionnée')
    formData.team.isEditting = false
    resetFormData()
    return
  }
  formData.team.isEditting = false
  formData.team.isUpdating = true
  try {
    await updateUserProfile(userId.value, { teamId: formData.team.value })
  } catch (error: any) {
    errorPopup(error.message, `L'équipe n'a pas pu être mise à jour`)
    formData.team.isUpdating = false
    resetFormData()
    throw error
  }
  formData.team.isUpdating = false
  resetFormData()
}

/**
 * Set a new attendant group
 */
async function setAttendantGroup() {
  if (formData.attendantGroup.id === DEFAULT_GROUP_ID) {
    toastPopup('Erreur : aucune section n\'a été sélectionnée')
    formData.attendantGroup.isEditting = false
    resetFormData()
    return
  }
  formData.attendantGroup.isEditting = false
  formData.attendantGroup.isUpdating = true
  const selectedGroup = attendantGroups.value.find(group => group.id === formData.attendantGroup.id)
  if (!selectedGroup) {
    errorPopup('La section n\'a pas été trouvée')
    formData.attendantGroup.isUpdating = false
    resetFormData()
    return
  }
  try {
    await updateUserProfile(userId.value, {
      groupId: formData.attendantGroup.id,
      groupName: selectedGroup.name,
    })
  } catch (error: any) {
    errorPopup(error.message, `La section n'a pas pu être mise à jour`)
    formData.attendantGroup.isUpdating = false
    resetFormData()
    throw error
  }
  formData.attendantGroup.isUpdating = false
  resetFormData()
}

/**
 * Set a new game for the user
 * If the user was already registered to a game, remove the user from the previous game
 */
async function setGame(timeSlotId: string) {
  if (!formData.attendantGames.ids[timeSlotId]) {
    toastPopup('Erreur : aucun jeu n\'a été sélectionné')
    formData.attendantGames.isEditting = false
    resetFormData()
    return
  }
  if (!userProfile.value) {
    errorPopup('Le profil de l\'utilisateur n\'a pas été chargé')
    formData.attendantGames.isEditting = false
    resetFormData()
    return
  }
  formData.attendantGames.isEditting = false
  formData.attendantGames.isUpdating = true

  // if the user was already registered to a game
  if (userProfile.value.games && userProfile.value.games[timeSlotId]) {
    // if the user is already registered to this game, cancel the operation and notify the user
    if (userProfile.value.games[timeSlotId].id === formData.attendantGames.ids[timeSlotId]) {
      toastPopup('L\'utilisateur est déjà inscrit à cette épreuve')
      formData.attendantGames.isUpdating = false
      resetFormData()
      return
    }
    // else, remove the user from the previous game
    try {
      await removeAttendant(userProfile.value.games[timeSlotId].id, userProfile.value.id, timeSlotId)
    } catch (error: any) {
      errorPopup(
        error.message,
        `Erreur lors du désenregistrement de l'utilisateur à l'épreuve ${userProfile.value.games[timeSlotId]}`,
      )
      formData.attendantGames.isUpdating = false
      resetFormData()
      throw error
    }
  }
  try {
    await addAttendant(formData.attendantGames.ids[timeSlotId], userProfile.value.id, timeSlotId)
  } catch (error: any) {
    errorPopup(
      error.message,
      `Erreur lors de l'enregistrement de l'utilisateur à l'épreuve ${formData.attendantGames.ids[timeSlotId]}`,
    )
    formData.attendantGames.isUpdating = false
    resetFormData()
    throw error
  }
  formData.attendantGames.isUpdating = false
  resetFormData()
}

// Actions

/**
 * Reset the onboarding process
 */
async function resetOnboarding() {
  const loading = await loadingPopup('Réinitialisation de l\'onboarding')
  try {
    await updateUserProfile(userId.value, {
      role: USER_ROLES.Newbie,
      groupId: DEFAULT_GROUP_ID,
      groupName: '',
      hasDoneOnboarding: false,
    })
  } catch (error: any) {
    errorPopup(error.message, `L'onboarding n'a pas pu être réinitialisée`)
  }
  loading.dismiss()
}

/**
 * Log out the user
 */
function logOut() {
  confirmPopup('Es-tu certain.e de vouloir te déconnecter ?', async () => {
    const loading = await loadingPopup('Déconnexion')
    try {
      await signOut()
      router.replace('/home')
    } catch (error: any) {
      errorPopup(error.message, `Une erreur est survenue durant la déconnexion`)
    }
    loading.dismiss()
  })
}

async function removeAccount() {
  const confirmTitle = 'Es-tu sûr.e ?'
  const confirmMessage = 'Cette opération supprimera toutes les données liées au profil'
  const removeAccountHandler = async () => {
    if (!userProfile.value) {
      errorPopup('Le profil de l\'utilisateur n\'a pas été chargé')
      return
    }
    const wasOwnProfile = isOwnProfile.value
    const loading = await loadingPopup('Suppression du profil')
    if (userProfile.value.games) {
      for (const [timeSlotId, game] of Object.entries(userProfile.value.games)) {
        try {
          await removeAttendant(game.id, userProfile.value.id, timeSlotId)
        } catch (error: any) {
          errorPopup(
            error.message,
            `Erreur lors du désenregistrement de l'utilisateur ${userProfile.value.id} à l'épreuve ${game}`,
          )
        }
      }
    }
    try {
      await removeFirebaseAccount(userProfile.value.id)
    } catch (error: any) {
      errorPopup(error.message, `Erreur Lors de la suppression de l'utilisateur ${userProfile.value.email}`)
    }
    if (wasOwnProfile) {
      await signOut()
      router.replace('/home')
    }
    loading.dismiss()
  }
  confirmPopup(confirmMessage, removeAccountHandler, null, confirmTitle)
}
</script>

<style scoped>
ion-select {
  width: 100%;
  max-width: 100%;
}
.field-error {
  color: var(--ion-color-danger);
  font-size: small;
  text-align: center;
  margin: auto auto;
}
ion-item ion-icon {
  align-self: center;
}
ion-item ion-spinner {
  align-self: center;
}
</style>
