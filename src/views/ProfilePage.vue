<template>
  <ion-page>
    <header-template :pageTitle="pageTitle">
    </header-template>
    <ion-content :fullscreen="true" class="ion-padding">
      <refresher-component></refresher-component>
      <div v-if="!isProfile" class="not-found ion-padding">
        <strong class="capitalize">Nous n'avons pas trouvé ce profil...</strong>
        <p>Retour à <a @click="router.go(-1)">la page précédente</a></p>
      </div>
      <ion-card v-else class="ion-no-margin ion-margin-bottom ion-padding-bottom">
        <ion-list>
          <!-- Name (edit mode) -->
          <ion-item lines="full" v-if="formData.name.isEditting">
            <ion-label position="stacked" color="primary">Nom</ion-label>
            <ion-input v-model="formData.name.value" name="name" type="text" @keydown.enter="setName"></ion-input>
            <ion-icon slot="end" :ios="checkmarkOutline" :md="checkmarkSharp" @click="setName"></ion-icon>
            <ion-icon slot="end" :ios="closeOutline" :md="closeSharp" @click="formData.name.isEditting = false; resetFormData()"></ion-icon>
          </ion-item>
          <!-- Name (read mode) -->
          <ion-item lines="full" v-else>
            <ion-label position="stacked" color="primary">Nom</ion-label>
            <ion-input name="name" type="text" :readonly="true" inputmode="none">{{ formData.name.value }}</ion-input>
            <ion-spinner v-if="formData.name.isUpdating"></ion-spinner>
            <ion-icon v-else-if="canEditProfile" slot="end" :ios="pencilOutline" :md="pencilSharp" @click="formData.name.isEditting = true"></ion-icon>
          </ion-item>
          <!-- Role (edit mode) -->
          <ion-item lines="full" v-if="formData.role.isEditting">
            <ion-label position="stacked" color="primary">Role</ion-label>
            <ion-select 
              v-model="formData.role.value" 
              @ion-change="setRole"
              @ion-cancel="formData.role.isEditting = false; resetFormData()"
              cancel-text="Annuler" interface="action-sheet"
            >
              <ion-select-option v-for="(value, role) in ROLES" :key="value" :value="value">{{ role }}</ion-select-option>
            </ion-select>
            <ion-icon slot="end" :ios="closeOutline" :md="closeSharp" @click="formData.role.isEditting = false; resetFormData()"></ion-icon>
          </ion-item>
          <!-- Role (read mode) -->
          <ion-item lines="full" v-else>
            <ion-label position="stacked" color="primary">Role</ion-label>
            <ion-input type="text" :readonly="true" inputmode="none">{{ getRoleByValue(formData.role.value) }}</ion-input>
            <ion-spinner v-if="formData.role.isUpdating"></ion-spinner>
            <ion-icon v-else-if="canEditRole" slot="end" :ios="pencilOutline" :md="pencilSharp" @click="formData.role.isEditting = true"></ion-icon>
          </ion-item>
          <!-- PLAYER FIELDS -->
          <div v-if="isPlayer">
            <!-- Player Section Type (edit mode) -->
            <ion-item lines="full" v-if="formData.playerSection.isEditting">
              <ion-label position="stacked" color="primary">Type de section</ion-label>
              <ion-input v-if="!appConfig" type="text" readonly>Error: cannot load section types (i.e. appConfig)</ion-input>
              <ion-select 
                v-else 
                v-model="formData.playerSection.typeId"
                @ion-change="formData.playerSection.id = DEFAULT_PLAYER_SECTION_ID; formData.playerSection.name = ''"
                @ion-cancel="formData.playerSection.isEditting = false; resetFormData()"
                cancel-text="Annuler" 
                interface="action-sheet"
              >
                <ion-select-option v-for="sectionType, sectionTypeId in appConfig.sectionTypes" :key="sectionTypeId" :value="sectionTypeId">{{ sectionType.name }}</ion-select-option>
              </ion-select>
              <ion-icon slot="end" :ios="closeOutline" :md="closeSharp" @click="formData.playerSection.isEditting = false; resetFormData()"></ion-icon>
            </ion-item>
            <!-- Player Section Type (read mode) -->
            <ion-item lines="full" v-else>
              <ion-label position="stacked" color="primary">Type de section</ion-label>
              <p v-if="!appConfig" class="field-error">Error: cannot load section types (i.e. appConfig)</p>
              <ion-input v-else type="text" readonly>{{ appConfig?.sectionTypes[formData.playerSection.typeId] }}</ion-input>
              <ion-spinner v-if="formData.playerSection.isUpdating"></ion-spinner>
              <ion-icon v-else-if="canEditProfile" slot="end" :ios="pencilOutline" :md="pencilSharp" @click="formData.playerSection.isEditting = true"></ion-icon>
            </ion-item>
            <!-- Player Section (edit mode) -->
            <ion-item lines="full" v-if="formData.playerSection.isEditting">
              <ion-label position="stacked" color="primary">Section</ion-label>
              <p v-if="formData.playerSection.typeId === DEFAULT_SECTION_TYPE_ID" class="field-error">Selectionne d'abord un type de section</p>
              <ion-select 
                v-else-if="playerSections.length > 0" 
                v-model="formData.playerSection.id"
                @ion-change="setPlayerSection"
                @ion-cancel="formData.playerSection.isEditting = false; resetFormData()"
                cancel-text="Annuler" interface="action-sheet"
              >
                <ion-select-option v-for="section in playerSections" :key="section.id" :value="section.id">{{ section.name }}</ion-select-option>
              </ion-select>
              <p v-else class="field-error">Pas de section pour ce type de section</p>
              <ion-icon slot="end" :ios="closeOutline" :md="closeSharp" @click="formData.playerSection.isEditting = false; resetFormData()"></ion-icon>
            </ion-item>
            <!-- Player Section (read mode) -->
            <ion-item lines="full" v-else>
              <ion-label position="stacked" color="primary">Section</ion-label>
              <ion-input name="section" type="text" :readonly="true" inputmode="none" @click="goToPlayerSectionPage(formData.playerSection.id)">{{ formData.playerSection.name }}</ion-input>
              <ion-spinner v-if="formData.playerSection.isUpdating"></ion-spinner>
              <ion-icon v-else-if="canEditProfile" slot="end" :ios="pencilOutline" :md="pencilSharp" @click="formData.playerSection.isEditting = true"></ion-icon>
            </ion-item>
              <!-- Team (edit mode)-->
            <ion-item lines="full" v-if="formData.playerSection.isEditting">
              <ion-label position="stacked" color="primary">Équipe</ion-label>
              <ion-select 
                v-if="selectedPlayerSection && selectedPlayerSection.teams.length > 0" 
                v-model="formData.team.value" 
                @ion-change="setTeam"
                @ion-cancel="formData.team.isEditting = false; resetFormData()"
                cancel-text="Annuler" interface="action-sheet"
              >
                <ion-select-option v-for="team in selectedPlayerSection.teams" :key="team" :value="team">{{ team }}</ion-select-option>
              </ion-select>
              <p v-else class="field-error">Pas de team pour cette section</p>
              <ion-icon slot="end" :ios="closeOutline" :md="closeSharp" @click="formData.team.isEditting = false; resetFormData()"></ion-icon>
            </ion-item>
            <!-- Team (read mode)-->
            <ion-item lines="full" v-else>
              <ion-label position="stacked" color="primary">Équipe</ion-label>
              <ion-input type="text" :readonly="true" inputmode="none" @click="goToTeamPage(formData.team.value)">{{ formData.team.value }}</ion-input>
              <ion-spinner v-if="formData.team.isUpdating"></ion-spinner>
              <ion-icon v-else-if="canEditProfile" slot="end" :ios="pencilOutline" :md="pencilSharp" @click="formData.team.isEditting = true"></ion-icon>
            </ion-item>
          </div>
          <div v-if="isAttendant || isStaff">
            <!-- Attendant Section (edit mode) -->
            <ion-item lines="full" v-if="formData.attendantSection.isEditting">
              <ion-label position="stacked" color="primary">Section</ion-label>
              <ion-select 
                v-if="attendantSections.length > 0" 
                v-model="formData.attendantSection.id"
                @ion-change="setAttendantSection"
                @ion-cancel="formData.attendantSection.isEditting = false; resetFormData()"
                cancel-text="Annuler" interface="action-sheet"
              >
                <ion-select-option v-for="section in attendantSections" :key="section.id" :value="section.id">{{ section.name }}</ion-select-option>
              </ion-select>
              <p v-else class="field-error">Pas de section</p>
              <ion-icon slot="end" :ios="closeOutline" :md="closeSharp" @click="formData.attendantSection.isEditting = false; resetFormData()"></ion-icon>
            </ion-item>
            <!-- Attendant Section (read mode) -->
            <ion-item lines="full" v-else>
              <ion-label position="stacked" color="primary">Section</ion-label>
              <ion-input name="section" type="text" :readonly="true" inputmode="none" @click="goToAttendantSectionPage(formData.attendantSection.id)">{{ formData.attendantSection.name }}</ion-input>
              <ion-spinner v-if="formData.attendantSection.isUpdating"></ion-spinner>
              <ion-icon v-else-if="canEditAttendantSection" slot="end" :ios="pencilOutline" :md="pencilSharp" @click="shouldLoadAttendantSections = true; formData.attendantSection.isEditting = true"></ion-icon>
            </ion-item>
          </div>
          <div v-if="isAttendant">
            <div v-for="timeSlot in attendantSchedule" :key="timeSlot.id">
              <!-- Attendant Game (edit mode) -->
              <ion-item lines="full" v-if="formData.attendantGames.isEditting">
                <ion-label position="stacked" color="primary">Épreuve {{ timeSlot.name }}</ion-label>
                <ion-select 
                  v-model="formData.attendantGames.value[timeSlot.id]" 
                  @ion-change="setGame(timeSlot.id)"
                  @ion-cancel="formData.attendantGames.isEditting = false; resetFormData()"
                  cancel-text="Annuler" interface="action-sheet"
                >
                  <ion-select-option v-for="game in games" :key="game.id" :value="game.id">{{ game.id }}{{ isTimeSlotFull(game, timeSlot.id) ? " [COMPLET] " : " " }}{{ game.name }}</ion-select-option>
                </ion-select>
                <ion-icon slot="end" :ios="closeOutline" :md="closeSharp" @click="formData.attendantGames.isEditting = false; resetFormData()"></ion-icon>
              </ion-item>
              <!-- Attendant Game (read mode) -->
              <ion-item lines="full" v-else>
                <ion-label position="stacked" color="primary">Épreuve {{ timeSlot.name }}</ion-label>
                <ion-input v-if="timeSlot.id in formData.attendantGames.value" type="text" :readonly="true" inputmode="none" @click="goToGamePage(formData.attendantGames.value[timeSlot.id])">
                  <span>{{ formData.attendantGames.value[timeSlot.id] }}</span>
                </ion-input>
                <ion-input v-else type="text" :readonly="true" inputmode="none">Pas d'épreuve sélectionnée</ion-input>
                <ion-spinner v-if="formData.attendantGames.isUpdating"></ion-spinner>
                <ion-icon v-else-if="canEditGames" slot="end" :ios="pencilOutline" :md="pencilSharp" @click="shouldLoadGames = true; formData.attendantGames.isEditting = true"></ion-icon>
              </ion-item>
            </div>
          </div>
          
          <!-- email -->
          <ion-item lines="full" v-if="canSeeEmail">
            <ion-label position="stacked" color="primary">Adresse email</ion-label>
            <ion-input v-if="userProfile" type="text" :readonly="true" inputmode="none">{{ userProfile.email }}</ion-input>
            <p v-else class="field-error">Erreur: impossible de charger l'adresse email</p>
          </ion-item>
        </ion-list>
        <ion-grid class="ion-no-padding">
          <ion-row>
            <ion-col v-if="isOwnProfile" size="12" size-sm="6" class="ion-no-padding ion-padding-horizontal">
              <ion-button expand="block" class="" color="warning" @click="logOut"> Se déconnecter </ion-button>
            </ion-col>
            <ion-col v-if="canDeleteProfile" size="12" size-sm="6" class="ion-no-padding ion-padding-horizontal">
              <ion-button expand="block" class="" color="danger" @click="removeAccount"> Supprimer le compte </ion-button>
            </ion-col>
            <ion-col v-if="canResetOnboarding" size="12" size-sm="6" class="ion-no-padding ion-padding-horizontal">
              <ion-button expand="block" class="" color="medium" @click="resetOnboarding"> Reset onboarding </ion-button>
            </ion-col>
          </ion-row>
        </ion-grid>
      </ion-card>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
// prettier-ignore
import HeaderTemplate from "@/components/HeaderTemplate.vue";
import RefresherComponent from "@/components/RefresherComponent.vue";
import { useAppConfig, useAppSettings } from "@/composables/app";
import { useAttendantSections } from "@/composables/attendantSection";
import { useGames } from "@/composables/game";
import { usePlayerSection, usePlayerSections } from "@/composables/playerSection";
import { useEditProfileRights } from "@/composables/rights";
import { useCurrentUserProfile, useUserProfile } from "@/composables/userProfile";
import { DEFAULT_ATTENDANT_SECTION_ID, DEFAULT_GAME_ID, DEFAULT_ROLE_VALUE, DEFAULT_PLAYER_SECTION_ID, DEFAULT_SECTION_TYPE_ID, DEFAULT_TEAM_ID, DEFAULT_USER_ID, ROLES } from "@/constants";
import { confirmPopup, errorPopup, loadingPopup, toastPopup } from "@/services/popup";
import { VueFireGame } from "@/types";
import { sanitizeInput } from "@/utils/form";
import { addAttendant, removeAttendant } from "@/utils/game";
import { getRoleByValue, removeFirebaseAccount, signOut, updateUserProfile } from "@/utils/userProfile";
import { IonButton, IonCard, IonCol, IonContent, IonGrid, IonIcon, IonInput, IonItem, IonLabel, IonList, IonPage, IonRow, IonSelect, IonSelectOption, IonSpinner } from "@ionic/vue";
import { useRouteParams } from "@vueuse/router";
import { checkmarkOutline, checkmarkSharp, closeOutline, closeSharp, pencilOutline, pencilSharp } from "ionicons/icons";
import { computed, reactive, ref, watch } from "vue";
import { useRouter } from "vue-router";


// reactive form data
const formData = reactive({
  name: {
    isEditting: false,
    isUpdating: false,
    value: ""
  },
  role: {
    isEditting: false,
    isUpdating: false,
    value: DEFAULT_ROLE_VALUE
  },
  playerSection: {
    isEditting: false,
    isUpdating: false,
    typeId: DEFAULT_SECTION_TYPE_ID,
    id: DEFAULT_PLAYER_SECTION_ID,
    name: ""
  },
  team: {
    isEditting: false,
    isUpdating: false,
    value: DEFAULT_TEAM_ID
  },
  attendantSection: {
    isEditting: false,
    isUpdating: false,
    id: DEFAULT_ATTENDANT_SECTION_ID,
    name: ""
  },
  attendantGames:{
    isEditting: false,
    isUpdating: false,
    value: {} as { [timingId: string]: string }
  },
})

// Composables & computed variables

const router = useRouter();
const appConfig = useAppConfig()
const appSettings = useAppSettings()
const attendantSchedule = computed(() => (appConfig.value?.attendantSchedule ?? []))
const currentUserProfile = useCurrentUserProfile()
const queryUserId = useRouteParams("userId", DEFAULT_USER_ID)
const userId = computed(() => {
  if (!currentUserProfile.value) return DEFAULT_USER_ID
  return queryUserId.value === DEFAULT_USER_ID ? currentUserProfile.value.id : queryUserId.value 
})
const userProfile = useUserProfile(userId)

// Checks & rights
const isProfile = computed(() => {
  return userProfile.value?.email ? true : false;
});
const isPlayer = computed(() => {
  if (!userProfile.value) return false;
  return userProfile.value.role == ROLES.Participant;
});
const isAttendant = computed(() => {
  if (!userProfile.value) return false;
  return userProfile.value.role === ROLES.Animateur || userProfile.value.role === ROLES.Chef; 
});
const isStaff = computed(() => {
  if (!userProfile.value) return false;
  return userProfile.value.role >= ROLES.Organisateur;
});
const { isOwnProfile, canEditProfile, canSeeEmail, canEditGames, canEditAttendantSection, canEditRole, canResetOnboarding, canDeleteProfile } = useEditProfileRights(userProfile)

const isTimeSlotFull = (game: VueFireGame, timeSlotId: string) => {
  if (!appSettings.value) return true;
  return game.attendants[timeSlotId].length >= appSettings.value.maxGameAttendants 
}

const pageTitle = computed(() => {
  if (isOwnProfile.value) return "Ton profil";
  if (!userProfile.value || !userProfile.value.email) return "Profil inconnu";
  if (userProfile.value.name) return `Profil de ${userProfile.value.name}`;
  return `Profil de ${userProfile.value.email}`;
  
});

// Lazy loading of all player sections
// They are only loaded after the user starts editting the player section
const selectedPlayerSectionTypeId = computed(() => {
  return formData.playerSection.isEditting ? formData.playerSection.typeId : DEFAULT_SECTION_TYPE_ID
})
const playerSections = usePlayerSections(selectedPlayerSectionTypeId)

// This computed variable is necessary in order to keep the reactivity
const selectedPlayerSectionId = computed(() => {
  return formData.playerSection.id
})
const selectedPlayerSection = usePlayerSection(selectedPlayerSectionId)

// Lazy loading of games
// They are only loaded after the user starts editting the attendantGames
const shouldLoadGames = ref(false)
const games = useGames(shouldLoadGames)

// Lazy loading of attendant sections
// They are only loaded after the user starts editting the field
const shouldLoadAttendantSections = ref(false)
const attendantSections = useAttendantSections(false, shouldLoadAttendantSections)


/**
 * Update formData with selected user profile data
 * Does not update the form data if the user is editting the field
*/ 
const resetFormData = () => {
  if (!userProfile.value) return;

  // common fields
  if  (!formData.name.isEditting) formData.name.value = userProfile.value.name;    
  if  (!formData.role.isEditting) formData.role.value = userProfile.value.role ?? DEFAULT_ROLE_VALUE;
  
  // players
  if (userProfile.value.role == ROLES.Participant){
    if (!formData.team.isEditting) formData.team.value = userProfile.value.team ?? DEFAULT_TEAM_ID;
    if (!formData.playerSection.isEditting) {
      formData.playerSection.id = userProfile.value.sectionId ?? DEFAULT_PLAYER_SECTION_ID;
      formData.playerSection.typeId = selectedPlayerSection.value?.sectionTypeId ?? DEFAULT_SECTION_TYPE_ID;
    }
  }
  
  // attendants & staff
  if (userProfile.value.role >= ROLES.Animateur && !formData.attendantSection.isEditting){
    formData.attendantSection.id = userProfile.value.sectionId ?? DEFAULT_ATTENDANT_SECTION_ID
    formData.attendantSection.name = userProfile.value.sectionName ?? ""
  } 

  // attendants
  if ((userProfile.value.role == ROLES.Animateur || userProfile.value.role == ROLES.Chef) && !formData.attendantGames.isEditting){
    formData.attendantGames.value = {} as { [timingId: string]: string }
    if (userProfile.value.games) {
      for (const [timeSlotId, game] of Object.entries(userProfile.value.games)){
        formData.attendantGames.value[timeSlotId] = game
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
});

// Go to pages

const goToPlayerSectionPage = (sectionId: string) => {
  if (sectionId != DEFAULT_PLAYER_SECTION_ID) router.push(`/section/${sectionId}`);
};
const goToAttendantSectionPage = (sectionId: string) => {
  if (sectionId != DEFAULT_ATTENDANT_SECTION_ID) router.push(`/leader/${sectionId}`);
};
const goToTeamPage = (teamId: string) => {
  if (teamId != DEFAULT_TEAM_ID) router.push(`/team/${teamId}`);
};
const goToGamePage = (gameId: string) => {
  if (gameId != DEFAULT_GAME_ID) router.push(`/game/${gameId}`);
};


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
const setName = async () => {
  if (!formData.name.value) {
    toastPopup("Erreur : aucun nom n'a été entré");
    formData.name.isEditting = false
    resetFormData()
    return 
  }
  formData.name.isEditting = false
  formData.name.isUpdating = true
  await updateUserProfile(userId.value, { name: sanitizeInput(formData.name.value) }).catch((error) => {
    errorPopup(`Le n'a pas pu être mis à jour : ${error.message}`);
  });
  formData.name.isUpdating = false;
  resetFormData()
};


/**
 * Set a new role for the user
 * If the user was registered to games & that the new roles is not an attendant, remove the games
 * Throw an error if trying to upgrade a participant to an higher role
 * Throw an error if trying to downgrade an attendant (or higher) to a participant
 */
const setRole = async () => {
  if (!formData.role.value || formData.role.value === DEFAULT_ROLE_VALUE) {
    toastPopup("Erreur : aucun rôle n'a été sélectionné");
    formData.role.isEditting = false
    resetFormData()
    return 
  }
  if (!userProfile.value) {
    errorPopup("Le profil de l'utilisateur n'a pas été chargé")
    formData.role.isEditting = false
    resetFormData()
    return
  }
  if (userProfile.value.role < ROLES.Animateur) {
    errorPopup("Il n'est pas possible de changer le rôle d'un participant. Pour cela, il faut supprimer et recréer l'utilisateur.")
    formData.role.isEditting = false
    resetFormData()
    return
  }
  if (userProfile.value.role >= ROLES.Animateur && formData.role.value < ROLES.Animateur){
    errorPopup("Il n'est pas possible de rétrograder un utilisateur au role de participant. Pour cela, il faut supprimer et recréer l'utilisateur.")
    formData.role.isEditting = false
    resetFormData()
    return
  }
  formData.role.isEditting = false
  formData.role.isUpdating = true
  // if the user was registered to games & that the new roles is not an attendant, remove the games
  if (userProfile.value.games && Object.values(userProfile.value.games).length > 0 && formData.role.value > ROLES.Chef) {
    for (const [timeSlotId, game] of Object.entries(userProfile.value.games)){
      try {
        await removeAttendant(game, userProfile.value.id, timeSlotId)
      } catch (error: any){
        errorPopup(`Erreur lors du désenregistrement de l'utilisateur à l'épreuve ${game} : ${error.message}`);
        formData.role.isUpdating = false
        resetFormData()
        throw error
      }
      toastPopup("L'utilisateur a été désinscrit de ses épreuves car son nouveau rôles n'est plus dans l'animation")
    }
  }
  try {
    await updateUserProfile(userProfile.value.id, { role: formData.role.value })
  } catch(error: any){
    errorPopup(`Le rôle n'a pas pu être mis à jour : ${error.message}`);
    formData.role.isUpdating = false
    resetFormData()
    throw error
  }
  formData.role.isUpdating = false
  resetFormData()
};

/**
 * Set a new player section
 * Side effect: it resets the team value
 */
const setPlayerSection = async () => {
  if (formData.playerSection.id === DEFAULT_PLAYER_SECTION_ID) {
    formData.team.isEditting = false
    resetFormData()
    return
  }
  formData.playerSection.isEditting = false
  formData.playerSection.isUpdating = true
  const selectedSection = playerSections.value.find(section => section.id === formData.playerSection.id)
  if (!selectedSection){
    errorPopup("La section n'a pas été trouvée")
    formData.playerSection.isUpdating = false
    resetFormData()
    return
  }
  try {
    await updateUserProfile(userId.value, { 
      sectionId: formData.playerSection.id,
      sectionName: selectedSection.name,
      team: DEFAULT_TEAM_ID,
    })
  } catch (error: any) {
    errorPopup(`La section n'a pas pu être mise à jour : ${error.message}`)
    formData.playerSection.isUpdating = false
    resetFormData()
    throw error
  }
  toastPopup("Vu que la section a changé, l'équipe a été effacée du profil")
  formData.playerSection.isUpdating = false
  resetFormData()
};

/**
 * Set a new team
 */
const setTeam = async () => {
  if (formData.team.value === DEFAULT_TEAM_ID) {
    toastPopup("Erreur : aucune équipe n'a été sélectionnée");
    formData.team.isEditting = false
    resetFormData()
    return
  }
  formData.team.isEditting = false
  formData.team.isUpdating = true
  try {
    await updateUserProfile(userId.value, { team: formData.team.value })
  } catch (error: any) {
    errorPopup(`L'équipe n'a pas pu être mise à jour : ${error.message}`)
    formData.team.isUpdating = false
    resetFormData()
    throw error
  }
  formData.team.isUpdating = false
  resetFormData()
};

/**
 * Set a new attendant section
 */
const setAttendantSection = async () => {
  if (formData.attendantSection.id === DEFAULT_ATTENDANT_SECTION_ID) {
    toastPopup("Erreur : aucune section n'a été sélectionnée");
    formData.attendantSection.isEditting = false
    resetFormData()
    return
  }
  formData.attendantSection.isEditting = false
  formData.attendantSection.isUpdating = true
  const selectedSection = attendantSections.value.find(section => section.id === formData.attendantSection.id)
  if (!selectedSection){
    errorPopup("La section n'a pas été trouvée")
    formData.attendantSection.isUpdating = false
    resetFormData()
    return
  }
  try {
    await updateUserProfile(userId.value, { 
      sectionId: formData.attendantSection.id,
      sectionName: selectedSection.name,
    })
  } catch (error: any) {
    errorPopup(`La section n'a pas pu être mise à jour : ${error.message}`);
    formData.attendantSection.isUpdating = false
    resetFormData()
    throw error
  }
  formData.attendantSection.isUpdating = false
  resetFormData()
};

/**
 * Set a new game for the user
 * If the user was already registered to a game, remove the user from the previous game
 */
const setGame = async (timeSlotId: string) => {
  if (!formData.attendantGames.value[timeSlotId]) {
    toastPopup("Erreur : aucun match n'a été sélectionné");
    formData.attendantGames.isEditting = false
    resetFormData()
    return
  }
  if (!userProfile.value) {
    errorPopup("Le profil de l'utilisateur n'a pas été chargé")
    formData.attendantGames.isEditting = false
    resetFormData()
    return
  }
  formData.attendantGames.isEditting = false
  formData.attendantGames.isUpdating = true

  // if the user was already registered to a game
  if (userProfile.value.games && userProfile.value.games[timeSlotId]){
    // if the user is already registered to this game, cancel the operation and notify the user
    if (userProfile.value.games[timeSlotId] === formData.attendantGames.value[timeSlotId]){
      toastPopup("L'utilisateur est déjà inscrit à cette épreuve")
      formData.attendantGames.isUpdating = false
      resetFormData()
      return
    }
    // else, remove the user from the previous game
    try {
      await removeAttendant(userProfile.value.games[timeSlotId], userProfile.value.id, timeSlotId)
    } catch (error: any){
      errorPopup(`Erreur lors du désenregistrement de l'utilisateur à l'épreuve ${userProfile.value.games[timeSlotId]} : ${error.message}`);
      formData.attendantGames.isUpdating = false
      resetFormData()
      throw error
    }
  }
  try {
    await addAttendant(formData.attendantGames.value[timeSlotId], userProfile.value.id, timeSlotId)
  }
  catch (error: any){
    errorPopup(`Erreur lors de l'enregistrement de l'utilisateur à l'épreuve ${formData.attendantGames.value[timeSlotId]} : ${error.message}`);
    formData.attendantGames.isUpdating = false
    resetFormData()
    throw error
  }
  formData.attendantGames.isUpdating = false
  resetFormData()
};

// Actions

/**
 * Reset the onboarding process
 */
const resetOnboarding = async () => {
  const loading = await loadingPopup("Réinitialisation de l'onboarding");
  try {
    await updateUserProfile(userId.value, { hasDoneOnboarding: false });
  } catch (error: any) {
    errorPopup(`L'onboarding n'a pas pu être réinitialisée : ${error.message}`);
  }
  loading.dismiss();
}

/**
 * Log out the user
 */
const logOut = () => {
  confirmPopup("Es-tu certain.e de vouloir te déconnecter ?", async () => {
    const loading = await loadingPopup("Déconnexion");
    try {
      await signOut();
      router.replace("/home");
    } catch (error: any) {
      errorPopup(`Une erreur est survenue durant la déconnexion: ${error.message}`);
    }
    loading.dismiss();
  });
};

const removeAccount = async () => {
  const confirmTitle = "Es-tu sûr.e ?";
  const confirmMessage = "Cette opération supprimera toutes les données liées au profil";
  const removeAccountHandler = async () => {
    if (!userProfile.value) {
      errorPopup("Le profil de l'utilisateur n'a pas été chargé")
      return
    }
    const wasOwnProfile = isOwnProfile.value;
    const loading = await loadingPopup("Suppression du profil");
    if (userProfile.value.games){
      for (const [timeSlotId, game] of Object.entries(userProfile.value.games)){
        try {
          await removeAttendant(game, userProfile.value.id, timeSlotId)
        } catch (error: any){
          errorPopup(`Erreur lors du désenregistrement de l'utilisateur ${userProfile.value.id} à l'épreuve ${game} : ${error.message}`);
        }
      } 
    }
    try {
      await removeFirebaseAccount(userProfile.value.id)
    } catch (error: any) {
      errorPopup(`Erreur Lors de la suppression de l'utilisateur ${userProfile.value.id} : ${error.message}`);
    }
    if (wasOwnProfile) {
      await signOut();
      router.replace("/home");
    }
    loading.dismiss();
  };
  confirmPopup(confirmMessage, removeAccountHandler, null, confirmTitle);
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
ion-item ion-spinner{
  align-self: center;
}
</style>
