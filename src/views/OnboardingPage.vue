<template>
  <ion-page>
    <header-template pageTitle="Onboarding"></header-template>
    <ion-content :fullscreen="true" class="ion-padding">
      <refresher-component></refresher-component>
      <ion-card>
        <ion-card-header v-if="currentUser && currentUser.rejectionReason">
          <ion-card-title>Aille !</ion-card-title>
          <p>
            Il semblerait que ta demande d'accès ait été refusée.
            <br><br>
            {{ currentUser.rejectionReason }}
            <br><br>
            Est-ce que tu peux recommencer stp ?
          </p>
        </ion-card-header>
        <ion-card-header v-else>
          <ion-card-title>Bienvenue !</ion-card-title>
          <p>Avant d'aller plus loin, faisons connaissance.</p>
        </ion-card-header>
        <form @submit.prevent="submitForm"  @keydown.enter="submitForm">
          <ion-list class="ion-no-padding">
          <ion-item>
            <ion-label position="floating" color="primary">Totem / Nom</ion-label>
            <ion-input v-model="name" name="name" type="text" autocorrect="off" @ionChange="handleNameChange" required></ion-input>
            <ion-note v-if="nameError" slot="error">Mentionne ton totem ou ton nom</ion-note>
          </ion-item>
          <ion-item>
            <ion-label position="floating" color="primary">Quel sera ton role durant la BB ?</ion-label>
            <ion-select v-model="selectedRole" required interface="popover" @ionChange="handleRoleChange">
              <ion-select-option v-for="(value, roleName) in selectableRoles" :key="value" :value="value">{{ roleName }}</ion-select-option>
            </ion-select>
          </ion-item>
  
          <ion-item v-if="isParticipant">
            <ion-label position="floating" color="primary">Type de section</ion-label>
            <ion-select v-model="selectedgroupCategoryId" interface="popover" required>
              <ion-select-option v-for="(groupCategory, id) in appConfig?.groupCategories" :key="id" :value="id">{{ groupCategory.name }}</ion-select-option>
            </ion-select>
          </ion-item>
          <ion-item v-if="isParticipant && selectedgroupCategoryId">
            <ion-label position="floating" color="primary">Section</ion-label>
            <ion-spinner v-if="isLoadingPlayerGroups"></ion-spinner>
            <div v-else-if="errorLoadingGroups">Erreur : {{ errorLoadingGroups.message }}</div>
            <ion-select v-else v-model="selectedPlayerGroupId" interface="popover" required>
              <ion-select-option v-for="playerGroup in playerGroups" :key="playerGroup.id" :value="playerGroup.id"> {{ playerGroup.name }} ({{ playerGroup.city }}) </ion-select-option>
            </ion-select>
          </ion-item>

          <ion-item v-if="isAttendant">
            <ion-label position="floating" color="primary">Section</ion-label>
            <ion-spinner v-if="isLoadingAttendantGroups"></ion-spinner>
            <div v-else-if="errorLoadingAttendantGroups">Erreur : {{ errorLoadingAttendantGroups.message }}</div>
            <ion-select v-else v-model="selectedAttendantGroupId" interface="popover" required>
              <ion-select-option v-for="attendantgroup in attendantGroups" :key="attendantgroup.id" :value="attendantgroup.id"> {{ attendantgroup.name }} ({{ attendantgroup.city }}) </ion-select-option>
            </ion-select>
          </ion-item>

        </ion-list>
          <ion-button type="submit" expand="block" class="ion-margin" :disabled="!canSubmit">
            Continuer
          </ion-button>
        </form>

      </ion-card>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
// prettier-ignore
import HeaderTemplate from "@/components/HeaderTemplate.vue";
import RefresherComponent from "@/components/RefresherComponent.vue";
import { useAppConfig } from "@/composables/app";
import { useAttendantGroups } from "@/composables/attendantGroup";
import { usePlayerGroups } from "@/composables/playerGroup";
import { useCurrentUserProfile } from "@/composables/userProfile";
import { DEFAULT_GROUP_CATEGORY_ID, DEFAULT_GROUP_ID, DEFAULT_USER_ROLE_VALUE, USER_ROLES } from "@/constants";
import { UserProfile } from "@/types";
import { Group } from "@/types/Group";
import { getAttendantSection, getStaffSection } from "@/utils/attendantSection";
import { sanitizeInput } from "@/utils/form";
import { getPlayerGroup } from "@/utils/playerGroup";
import { confirmPopup, errorPopup, toastPopup } from "@/utils/popup";
import { updateUserProfile } from "@/utils/userProfile";
import { IonButton, IonCard, IonCardHeader, IonCardTitle, IonContent, IonInput, IonItem, IonLabel, IonList, IonNote, IonPage, IonSelect, IonSelectOption, IonSpinner } from "@ionic/vue";
import { computed, ref } from "vue";
import { useRouter } from 'vue-router';

const router = useRouter();

// Strip Erreur, Anonyme & Newbie from ROLES
const selectableRoles = Object.fromEntries(Object.entries(USER_ROLES).filter(([, value]) => ![USER_ROLES.Erreur, USER_ROLES.Anonyme, USER_ROLES.Newbie].includes(value)))

// reactive data

const name = ref('');
const selectedRole = ref(DEFAULT_USER_ROLE_VALUE);
const selectedgroupCategoryId = ref(DEFAULT_GROUP_CATEGORY_ID);
const selectedPlayerGroupId = ref(DEFAULT_GROUP_ID);
const selectedAttendantGroupId = ref(DEFAULT_GROUP_ID);
const nameError = ref(false);
const isUpdatingProfile = ref(false);

// composables & computed data

const currentUser = useCurrentUserProfile();
const appConfig = useAppConfig();
const { data: playerGroups, pending: isLoadingPlayerGroups, error: errorLoadingGroups } = usePlayerGroups(selectedgroupCategoryId);

const isParticipant = computed(() => selectedRole.value === USER_ROLES.Participant);
const isAttendant = computed(() => (selectedRole.value >= USER_ROLES.Animateur))
const loadStaffGroups = computed(() => selectedRole.value >= USER_ROLES.Organisateur ? "only" : "exclude");
const { data: attendantGroups, pending: isLoadingAttendantGroups, error: errorLoadingAttendantGroups } = useAttendantGroups(isAttendant, loadStaffGroups, true);

const canSubmit = computed(() => {
  if (!name.value) return false;
  if (isParticipant.value && selectedgroupCategoryId.value != DEFAULT_GROUP_CATEGORY_ID && selectedPlayerGroupId.value != DEFAULT_GROUP_ID) return true
  if (isAttendant.value && selectedAttendantGroupId.value != DEFAULT_GROUP_ID) return true
  if (selectedRole.value >= USER_ROLES.Organisateur) return true
  return false;
});

// methods

const handleRoleChange = () => {
    // Reset category, player group and attendant group values when changing the role
    selectedgroupCategoryId.value = DEFAULT_GROUP_CATEGORY_ID
    selectedPlayerGroupId.value = DEFAULT_GROUP_ID
    selectedAttendantGroupId.value = DEFAULT_GROUP_ID
    if (!name.value) nameError.value = true;
}
const handleNameChange = () => {
    nameError.value = name.value ? false : true;
}

const processForm = (groupData: Group) => {
  isUpdatingProfile.value = true;
  let newProfile: Partial<UserProfile>;
  if (selectedRole.value === USER_ROLES.Participant) {
    newProfile = {
      name: sanitizeInput(name.value),
      role: USER_ROLES.Participant,
      groupId: selectedPlayerGroupId.value,
      groupName: groupData.name,
      hasDoneOnboarding: true,
    };
  } else {
    newProfile = {
      name: sanitizeInput(name.value),
      requestedRole: selectedRole.value,
      requestedGroupId: selectedAttendantGroupId.value,
      requestedGroupName: groupData.name,
      hasDoneOnboarding: true,
    }
  }
  if (!currentUser.value) return errorPopup("currentUser not found", "Impossible de mettre à jour le profil");
  updateUserProfile(currentUser.value.id, newProfile)
    .then(() => {
      toastPopup("Ton profil a été mis à jour");
      isUpdatingProfile.value = false;
    })
    .catch((error: any) => {
      errorPopup(`Le profile n'a pas pu être mis à jour : ${error.message}`);
      isUpdatingProfile.value = false;
    })
    .finally(() => {
      router.replace({ name: "home" });
    });
  console.log("Profile udpated", newProfile);
}

const submitForm = async () => {
  let message="";
  let groupData: Group;

  // Check if all required fields are filled
  if (!name.value) return errorPopup('Mentionne ton totem ou ton nom');
  if (selectedRole.value < USER_ROLES.Participant) return errorPopup('Choisis un role');
  if (!selectedAttendantGroupId.value && selectedRole.value < USER_ROLES.Organisateur) return errorPopup('Choisis une section');

  try{
    // If the user is a participant
    if (selectedRole.value === USER_ROLES.Participant){
      groupData = await getPlayerGroup(selectedPlayerGroupId.value);
      if (selectedPlayerGroupId.value) return processForm(groupData);
      else return errorPopup('Choisis une section');
    }
  
    // If the user is an attendant
    if (selectedRole.value === USER_ROLES.Animateur) {
        groupData = await getAttendantSection(selectedAttendantGroupId.value);
        message = `Tu as choisi le role d'animateur. 
        Cela signifie qu'un•e des chefs de la section ${groupData.name} ou un•e organisateur/organisatrice de la Baden Battle devra
        <b>valider ta demande</b> avant que tu ne puisses utiliser l'app.`;
    }
    if (selectedRole.value === USER_ROLES.Chef) {
        groupData = await getAttendantSection(selectedAttendantGroupId.value);
        message = `Tu as choisi le role de chef. 
        Cela signifie qu'un•e des chefs de la section ${groupData.name} ou un•e organisateur/organisatrice de la Baden Battle devra
        <b>valider ta demande</b> avant que tu ne puisses utiliser l'app.`;
    }

    // If the user is from the staff
    if (selectedRole.value === USER_ROLES.Organisateur) {
      [groupData, selectedAttendantGroupId.value] = await getStaffSection()
      message = `Tu as choisi le role d'organisateur de la Baden Battle. 
      Cela signifie qu'une autre personne avec le rôle d'organisateur de la Baden Battle devra <b>valider ta demande</b> avant que tu ne puisses utiliser l'app.`;
    }
    if (selectedRole.value === USER_ROLES.Administrateur) {
      [groupData, selectedAttendantGroupId.value] = await getStaffSection()
      message = `Tu as choisi le role d'administrateur de l'application. 
      Cela signifie qu'une autre personne avec le rôle d'administrateur devra <b>valider ta demande</b> avant que tu ne puisses utiliser l'app.`;
    }
  } catch (error: any) {
    return errorPopup(`Une erreur est survenue : ${error.message}`);
  }
  message += ` Veux-tu continuer ?`
  const handler = () => processForm(groupData);
  return confirmPopup(message, handler, null, 'Attention');
  // Handle form submission

  }

</script>

<style scoped>
</style>