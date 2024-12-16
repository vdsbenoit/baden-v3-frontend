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
              <ion-icon slot="end" :ios="closeOutline" :md="closeSharp" @click="formData.name.isEditting = false; updateFormData()"></ion-icon>
            </ion-item>
            <!-- Name (read mode) -->
            <ion-item lines="full" v-else>
              <ion-label position="stacked" color="primary">Nom</ion-label>
              <ion-input name="name" type="text" :readonly="true" inputmode="none">{{ formData.name.value }}</ion-input>
              <ion-spinner v-if="formData.name.isUpdating"></ion-spinner>
              <ion-icon v-else-if="canEditProfile" slot="end" :ios="pencilOutline" :md="pencilSharp" @click="formData.name.isEditting = true"></ion-icon>
            </ion-item>
            <!-- PLAYER FIELDS -->
            <div v-if="isPlayer">
              <!-- Player Section Type (edit mode) -->
              <ion-item lines="full" v-if="formData.playerSection.isEditting">
                <ion-label position="stacked" color="primary">Type de section</ion-label>
                <ion-input v-if="!appConfig" type="text" readonly>Error: cannot load section types (i.e. appConfig)</ion-input>
                <ion-select v-else v-model="formData.playerSection.typeId" cancel-text="Annuler" interface="action-sheet">
                  <ion-select-option v-for="sectionType, sectionTypeId in appConfig.sectionTypes" :key="sectionTypeId" :value="sectionTypeId">{{ sectionType.name }}</ion-select-option>
                </ion-select>
                <ion-icon slot="end" :ios="closeOutline" :md="closeSharp" @click="formData.playerSection.isEditting = false; updateFormData()"></ion-icon>
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
                  v-else-if="playerSections.length > 0" v-model="formData.playerSection.typeId"
                  @ion-change="setSection"
                  @ion-cancel="formData.playerSection.isEditting = false; updateFormData()"
                  cancel-text="Annuler" interface="action-sheet"
                >
                  <ion-select-option v-for="section in playerSections" :key="section.id" :value="section.id">{{ section.name }}</ion-select-option>
                </ion-select>
                <p v-else class="field-error">Pas de section pour ce type de section</p>
                <ion-icon slot="end" :ios="closeOutline" :md="closeSharp" @click="formData.playerSection.isEditting = false; updateFormData()"></ion-icon>
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
                <ion-select v-if="selectedPlayerSection && selectedPlayerSection.teams.length > 0" v-model="formData.team.value" 
                @ion-change="setTeam"
                @ion-cancel="formData.team.isEditting = false; updateFormData()"
                cancel-text="Annuler" interface="action-sheet">
                  <ion-select-option v-for="team in selectedPlayerSection.teams" :key="team" :value="team">{{ team }}</ion-select-option>
                </ion-select>
                <p v-else class="field-error">Pas de team pour cette section</p>
                <ion-icon slot="end" :ios="closeOutline" :md="closeSharp" @click="formData.team.isEditting = false; updateFormData()"></ion-icon>
              </ion-item>
              <!-- Team (read mode)-->
              <ion-item lines="full" v-else>
                <ion-label position="stacked" color="primary">Équipe</ion-label>
                <ion-input type="text" :readonly="true" inputmode="none" @click="goToTeamPage(formData.team.value)">{{ formData.team.value }}</ion-input>
                <ion-spinner v-if="formData.team.isUpdating"></ion-spinner>
                <ion-icon v-else-if="canEditProfile" slot="end" :ios="pencilOutline" :md="pencilSharp" @click="formData.team.isEditting = true"></ion-icon>
              </ion-item>
            </div>
            <div v-if="isLeader || isStaff">
              <!-- Attendant Section (edit mode) -->
              <ion-item lines="full" v-if="formData.attendantSection.isEditting">
                <ion-label position="stacked" color="primary">Section</ion-label>
                <ion-select v-if="attendantSections.length > 0" v-model="formData.attendantSection.id"
                @ion-change="setAttendantSection"
                @ion-cancel="formData.attendantSection.isEditting = false; updateFormData()"
                cancel-text="Annuler" interface="action-sheet">
                  <ion-select-option v-for="section in attendantSections" :key="section.id" :value="section.id">{{ section.name }}</ion-select-option>
                </ion-select>
                <p v-else class="field-error">Pas de section</p>
                <ion-icon slot="end" :ios="closeOutline" :md="closeSharp" @click="formData.attendantSection.isEditting = false; updateFormData()"></ion-icon>
              </ion-item>
              <!-- Attendant Section (read mode) -->
              <ion-item lines="full" v-else>
                <ion-label position="stacked" color="primary">Section</ion-label>
                <ion-input name="section" type="text" :readonly="true" inputmode="none" @click="goToAttendantSectionPage(formData.attendantSection.id)">{{ formData.attendantSection.name }}</ion-input>
                <ion-spinner v-if="formData.attendantSection.isUpdating"></ion-spinner>
                <ion-icon v-else-if="canEditAttendantSection" slot="end" :ios="pencilOutline" :md="pencilSharp" @click="shouldLoadAttendantSections = true; formData.attendantSection.isEditting = true"></ion-icon>
              </ion-item>
            </div>
              <div v-if="isLeader">
                <ion-item lines="full">
                  <!-- morningGame -->
                  <ion-label position="stacked" color="primary">Épreuve du matin</ion-label>
                  <ion-select v-if="isEditting.morningGame" v-model="formData.morningGame" 
                  @ion-change="setMorningGame" 
                  cancel-text="Annuler" interface="action-sheet">
                    <ion-select-option v-for="game in games.values()" :key="game.id" :value="game.id">{{ game.id }}{{ isGameFull(game.morningLeaders) ? " [COMPLET] " : " " }}{{ game.name }}</ion-select-option>
                  </ion-select>
                  <ion-input v-else type="text" :readonly="true" inputmode="none" @click="goToGamePage(userProfile.morningGame)">
                    <span v-if="userProfile.morningGame">{{ userProfile.morningGame }}: {{ morningGame?.name }}</span>
                  </ion-input>
                  <ion-icon v-if="isEditting.morningGame" slot="end" :ios="closeOutline" :md="closeSharp" @click="toggleEdit('morningGame')"></ion-icon>
                  <ion-spinner v-else-if="isUpdating.morningGame"></ion-spinner>
                  <ion-icon v-else-if="canEditGames" slot="end" :ios="pencilOutline" :md="pencilSharp" @click="toggleEdit('morningGame')"></ion-icon>
                </ion-item>
                <!-- afternoonGame -->
                <ion-item lines="full">
                  <ion-label position="stacked" color="primary">Épreuve de l'après-midi</ion-label>
                  <ion-select v-if="isEditting.afternoonGame" v-model="formData.afternoonGame" 
                  @ion-change="setAfternoonGame" 
                  cancel-text="Annuler" interface="action-sheet">
                    <ion-select-option v-for="game in games.values()" :key="game.id" :value="game.id">{{ game.id }}{{ isGameFull(game.afternoonLeaders) ? " [COMPLET] " : " " }}{{ game.name }}</ion-select-option>
                  </ion-select>
                  <ion-input v-else type="text" :readonly="true" inputmode="none" @click="goToGamePage(userProfile.afternoonGame)">
                    <span v-if="userProfile.afternoonGame">{{ userProfile.afternoonGame }}: {{ afternoonGame?.name }}</span>
                  </ion-input>
                  <ion-icon v-if="isEditting.afternoonGame" slot="end" :ios="closeOutline" :md="closeSharp" @click="toggleEdit('afternoonGame')"></ion-icon>
                  <ion-spinner v-else-if="isUpdating.afternoonGame"></ion-spinner>
                  <ion-icon v-else-if="canEditGames" slot="end" :ios="pencilOutline" :md="pencilSharp" @click="toggleEdit('afternoonGame')"></ion-icon>
                </ion-item>
              </div>
              <!-- Role (edit mode) -->
              <ion-item lines="full" v-if="formData.role.isEditting">
                <ion-label position="stacked" color="primary">Role</ion-label>
                <ion-select v-model="formData.role.value" 
                  @ion-change="setRole"
                  @ion-cancel="formData.role.isEditting = false; updateFormData()"
                  cancel-text="Annuler" interface="action-sheet"
                >
                  <ion-select-option v-for="(value, role) in ROLES" :key="value" :value="value">{{ role }}</ion-select-option>
                </ion-select>
                <ion-icon slot="end" :ios="closeOutline" :md="closeSharp" @click="formData.role.isEditting = false; updateFormData()"></ion-icon>
              </ion-item>
              <!-- Role (read mode) -->
              <ion-item lines="full" v-else>
                <ion-label position="stacked" color="primary">Role</ion-label>
                <ion-input type="text" :readonly="true" inputmode="none">{{ getRoleByValue(formData.role.value) }}</ion-input>
                <ion-spinner v-if="formData.role.isUpdating"></ion-spinner>
                <ion-icon v-else-if="canEditRole" slot="end" :ios="pencilOutline" :md="pencilSharp" @click="formData.role.isEditting = true"></ion-icon>
              </ion-item>
            
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
                <ion-button expand="block" class="" color="danger" @click="deleteAccount"> Supprimer le compte </ion-button>
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
import { useAppConfig } from "@/composables/app";
import { useAttendantSections } from "@/composables/attendantSection";
import { useSection, useSectionTypeSections } from "@/composables/playerSection";
import { useEditProfileRights } from "@/composables/rights";
import { useCurrentUserProfile, useUserProfile } from "@/composables/userProfile";
import { DEFAULT_ATTENDANT_SECTION_ID, DEFAULT_GAME_ID, DEFAULT_ROLE_VALUE, DEFAULT_SECTION_ID, DEFAULT_SECTION_TYPE_ID, DEFAULT_TEAM_ID, DEFAULT_USER_ID, ROLES } from "@/constants";
import { confirmPopup, errorPopup, loadingPopup, toastPopup } from "@/services/popup";
import { getRoleByValue } from "@/utils/userProfile";
import { IonButton, IonCard, IonCol, IonContent, IonGrid, IonIcon, IonInput, IonItem, IonLabel, IonList, IonPage, IonRow, IonSelect, IonSelectOption, IonSpinner } from "@ionic/vue";
import { useRouteParams } from "@vueuse/router";
import { checkmarkOutline, checkmarkSharp, closeOutline, closeSharp, pencilOutline, pencilSharp } from "ionicons/icons";
import { computed, reactive, ref, watch } from "vue";
import { useRouter } from "vue-router";


// reactive data
const formData = reactive({
  name: {
    isEditting: false,
    isUpdating: false,
    value: ""
  },
  playerSection: {
    isEditting: false,
    isUpdating: false,
    typeId: DEFAULT_SECTION_TYPE_ID,
    id: DEFAULT_SECTION_ID,
    name: ""
  },
  attendantSection: {
    isEditting: false,
    isUpdating: false,
    id: DEFAULT_ATTENDANT_SECTION_ID,
    name: ""
  },
  team: {
    isEditting: false,
    isUpdating: false,
    value: DEFAULT_TEAM_ID
  },
  role: {
    isEditting: false,
    isUpdating: false,
    value: DEFAULT_ROLE_VALUE
  },
  games:{
    isEditting: false,
    isUpdating: false,
    value: {}
  },
})

// Composables & computed variables

const router = useRouter();
const appConfig = useAppConfig()
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
const isLeader = computed(() => {
  if (!userProfile.value) return false;
  return userProfile.value.role === ROLES.Animateur || userProfile.value.role === ROLES.Chef; 
});
const isStaff = computed(() => {
  if (!userProfile.value) return false;
  return userProfile.value.role >= ROLES.Organisateur;
});
const { isOwnProfile, canEditProfile, canSeeEmail, canEditGames, canEditAttendantSection, canEditRole, canResetOnboarding, canDeleteProfile } = useEditProfileRights(userProfile)

const pageTitle = computed(() => {
  if (isOwnProfile.value) return "Ton profil";
  if (!userProfile.value || !userProfile.value.email) return "Profil inconnu";
  if (userProfile.value.name) return `Profil de ${userProfile.value.name}`;
  return `Profil de ${userProfile.value.email}`;
  
});

const selectedSectionTypeId = computed(() => {
  if (!formData.playerSection.isEditting) return DEFAULT_SECTION_TYPE_ID // prevents loading the sections before going into edit mode
  return formData.playerSection.typeId
})
const playerSections = useSectionTypeSections(selectedSectionTypeId)

// This computed variable is necessary in order to keep the reactivity
const selectedPlayerSectionId = computed(() => {
  return formData.playerSection.id
})
const selectedPlayerSection = useSection(selectedPlayerSectionId)


// Lazy loading of attendant sections
// They are only loaded after the user has started editting the field
const shouldLoadAttendantSections = ref(false)
const attendantSections = useAttendantSections(false, shouldLoadAttendantSections)


const targetSection = computed((): Section | LeaderSection | undefined => {
  if (formData.playerSection.id == DEFAULT_SECTION_ID) return undefined;
  if (isPlayer.value) return streamSection(formData.sectionId);
  if (isLeader.value || isStaff.value) return streamLeaderSection(formData.sectionId);
  return undefined;
});


/**
 * Update formData with selected user profile data
 * Does not update the form data if the user is editting the field
*/ 
const updateFormData = () => {
  if (!userProfile.value) return;

  // common fields
  if  (!formData.name.isEditting) formData.name.value = userProfile.value.name;    
  if  (!formData.role.isEditting) formData.role.value = userProfile.value.role ?? DEFAULT_ROLE_VALUE;
  
  // players
  if (userProfile.value.role == ROLES.Participant){
    if (!formData.team.isEditting) formData.team.value = userProfile.value.team ?? DEFAULT_TEAM_ID;
    if (!formData.games.isEditting) formData.games.value = userProfile.value.games ?? {};
    if (!formData.playerSection.isEditting) {
      formData.playerSection.id = userProfile.value.sectionId ?? DEFAULT_SECTION_ID;
      formData.playerSection.typeId = selectedPlayerSection.value?.sectionTypeId ?? DEFAULT_SECTION_TYPE_ID;
    }
  }
  
  // attendants & staff
  if (userProfile.value.role >= ROLES.Animateur && !formData.attendantSection.isEditting){
    formData.attendantSection.id = userProfile.value.sectionId ?? DEFAULT_ATTENDANT_SECTION_ID
    formData.attendantSection.name = userProfile.value.sectionName ?? ""
  } 
}

// Watchers

// Update the form data when the user profile changes
watch(userProfile, (newProfileValue) => {
  if (newProfileValue) {
    updateFormData()
  }
});


// Reset the section id when the section type changes
watch(
  () => formData.playerSection.typeId,
  (newValue, oldValue) => {
    if(newValue && oldValue && newValue != oldValue) {
      formData.playerSection.id = DEFAULT_SECTION_ID;
    }
  }
);

// Methods

const goToPlayerSectionPage = (sectionId: string) => {
  if (sectionId != DEFAULT_SECTION_ID) router.push(`/section/${sectionId}`);
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
const setName = async () => {
  if (!formData.name) {
    toastPopup("Erreur : aucun nom n'a été entré");
    return toggleEdit("name");
  }
  toggleEdit("name");
  isUpdating.name = true;
  await userStore.updateProfile(userId.value, { name: formData.name }).catch((error) => {
    errorPopup(`Le n'a pas pu être mis à jour : ${error.message}`);
  });
  isUpdating.name = false;
  formData.name = "";
};
const setSection = async () => {
  if (!formData.sectionId) {
    toastPopup("Erreur : aucune section n'a été sélectionnée");
    return toggleEdit("section");
  }
  toggleEdit("section");
  isUpdating.section = true;
  await userStore.updateProfile(userId.value, { 
    sectionId: formData.sectionId,
    sectionName: targetSection.value?.name,
    team: "",
  }).catch((error) => {
    errorPopup(`La section n'a pas pu être mise à jour : ${error.message}`);
  });
  isUpdating.section = false;
  formData.sectionId = -1;
};
const setAttendantSection = async () => {
  if (!formData.sectionId) {
    toastPopup("Erreur : aucune section n'a été sélectionnée");
    return toggleEdit("leaderSection");
  }
  toggleEdit("leaderSection");
  isUpdating.leaderSection = true;
  await userStore.updateProfile(userId.value, { 
    sectionId: formData.sectionId,
    sectionName: targetSection.value?.name,
  }).catch((error) => {
    errorPopup(`La section n'a pas pu être mise à jour : ${error.message}`);
  });
  isUpdating.leaderSection = false;
  formData.sectionId = -1;
};
const setTeam = async () => {
  if (!formData.team) {
    toastPopup("Erreur : aucune équipe n'a été sélectionnée");
    return toggleEdit("team");
  }
  toggleEdit("team");
  isUpdating.team = true;
  await userStore.updateProfile(userId.value, { team: formData.team }).catch((error) => {
    errorPopup(`L'équipe n'a pas pu être mise à jour : ${error.message}`);
  });
  isUpdating.team = false;
  formData.team = "";
};
const setRole = async () => {
  if (!formData.role) {
    toastPopup("Erreur : aucun rôle n'a été sélectionné");
    return toggleEdit("role");
  }
  toggleEdit("role");
  isUpdating.role = true;
  if (userProfile.value.morningGame) await removeMorningLeader(userProfile.value.morningGame, userId.value)
  if (userProfile.value.morningGame) {
    await removeMorningLeader(userProfile.value.morningGame, userId.value).catch((error) => {
      errorPopup(`Erreur lors de la suppression de l'utilisateur de l'épreuve du matin précédente : ${error.message}`);
      isUpdating.role = false;
      formData.role = -1;
      return;
    });
  }
  if (userProfile.value.afternoonGame) {
    await removeAfternoonLeader(userProfile.value.afternoonGame, userId.value).catch((error) => {
      errorPopup(`Erreur lors de la suppression de l'utilisateur de l'épreuve de l'après-midi précédente : ${error.message}`);
      isUpdating.role = false;
      formData.role = -1;
      return;
    });
  }
  await userStore.updateProfile(userId.value, { 
    role: formData.role, 
    sectionId: -1, 
    sectionName: "", 
    team: "",
    morningGame: 0,
    afternoonGame: 0
  }).catch((error) => {
    errorPopup(`Le rôle n'a pas pu être mis à jour : ${error.message}`);
  });
  isUpdating.role = false;
  formData.role = -1;
  formData.sectionId = -1;
};

const targetMorningGame = useGame(formData.morningGame)
const targetAfternoonGame = useGame(formData.afternoonGame)
const setMorningGame = async () => {
  if (!formData.morningGame) {
    toastPopup("Erreur : aucun match n'a été sélectionné");
    return toggleEdit("morningGame");
  }
  toggleEdit("morningGame");
  isUpdating.morningGame = true;
  if (formData.morningGame != userProfile.value.morningGame){
    if (userProfile.value.morningGame) {
      await removeMorningLeader(userProfile.value.morningGame, userId.value).catch((error) => {
        errorPopup(`Erreur lors de la suppression de l'utilisateur de l'épreuve du matin précédente : ${error.message}`);
        isUpdating.morningGame = false;
        formData.morningGame = 0;
        return;
      });
    }
    const promises = [];
    promises.push(setMorningLeader(targetMorningGame, userId.value).catch((error) => {
      errorPopup(`Le jeu du matin n'a pas pu être mis à jour : ${error.message}`);
    }));
    promises.push(userStore.updateProfile(userId.value, { morningGame: formData.morningGame }).catch((error) => {
      errorPopup(`Le profil n'a pas pu être mis à jour : ${error.message}`);
    }));
    await Promise.all(promises);
  }
  isUpdating.morningGame = false;
  formData.morningGame = 0;
};
const setAfternoonGame = async () => {
  if (!formData.afternoonGame) {
    toastPopup("Erreur : aucun match n'a été sélectionné");
    return toggleEdit("afternoonGame");
  }
  toggleEdit("afternoonGame");
  isUpdating.afternoonGame = true;
  if (formData.afternoonGame != userProfile.value.afternoonGame){
    if (userProfile.value.afternoonGame) {
      await removeAfternoonLeader(userProfile.value.afternoonGame, userId.value).catch((error) => {
        errorPopup(`Erreur lors de la suppression de l'utilisateur de l'épreuve du matin précédente : ${error.message}`);
        isUpdating.afternoonGame = false;
        formData.afternoonGame = 0;
        return;
      });
    }
    const promises = [];
    promises.push(setAfternoonLeader(targetAfternoonGame, userId.value).catch((error) => {
      errorPopup(`Le jeu de l'après-midi n'a pas pu être mis à jour : ${error.message}`);
    }));
    promises.push(userStore.updateProfile(userId.value, { afternoonGame: formData.afternoonGame }).catch((error) => {
      errorPopup(`Le profil n'a pas pu être mis à jour : ${error.message}`);
    }));
    await Promise.all(promises);
  }
  isUpdating.afternoonGame = false;
  formData.afternoonGame = 0;
};
const resetOnboarding = async () => {
  const loading = await loadingPopup("Réinitialisation de l'onboarding");
  await userStore.updateProfile(userId.value, { hasDoneOnboarding: false }).catch((error) => {
    errorPopup(`L'onboarding n'a pas pu être réinitialisée : ${error.message}`);
  });
  loading.dismiss();
};
const logOut = () => {
  confirmPopup("Es-tu certain.e de vouloir te déconnecter ?", async () => {
    const loading = await loadingPopup("Déconnexion");
    await stopMagnetar();
    const result = await userStore.logout();
    if (result) router.replace("/home");
    loading.dismiss();
  });
};
const deleteAccount = async () => {
  const confirmTitle = "Es-tu sûr.e ?";
  const confirmMessage = "Cette opération supprimera toute les données liées à ton profil";
  const removeAccountHandler = async () => {
    const wasOwnProfile = isOwnProfile.value;
    const loading = await loadingPopup("Suppression du profil");
    let removeMorningGamePromise = null;
    let removeAfternoonGamePromise = null;
    try {
      if (userProfile.value.morningGame) removeMorningGamePromise = removeMorningLeader(userProfile.value.morningGame, userId.value);
      if (userProfile.value.afternoonGame) removeAfternoonGamePromise = removeAfternoonLeader(userProfile.value.afternoonGame, userId.value);
      const removeAccountPromise = userStore.removeAccount(userId.value);
      await Promise.all([removeMorningGamePromise, removeAfternoonGamePromise, removeAccountPromise]);
    } catch (error: any) {
      errorPopup(`Une erreur est survenue durant la suppression du profil: ${error.message}`);
    }
    loading.dismiss();
    if (wasOwnProfile) await logOut();
  };
  confirmPopup(confirmMessage, removeAccountHandler, null, confirmTitle);
};
const isGameFull = (leaders: string[]): boolean => {
  return (leaders.length >= getMaxGameLeaders());
};
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
