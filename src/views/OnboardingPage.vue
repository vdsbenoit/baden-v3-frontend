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
              <ion-select-option v-for="(value, roleName) in roles" :key="value" :value="value">{{ roleName }}</ion-select-option>
            </ion-select>
          </ion-item>
  
          <ion-item v-if="isParticipant">
            <ion-label position="floating" color="primary">Type de section</ion-label>
            <ion-select v-model="selectedSectionTypeId" interface="popover" required>
              <ion-select-option v-for="(sectionType, id) in appConfig?.sectionTypes" :key="id" :value="id">{{ sectionType.name }}</ion-select-option>
            </ion-select>
          </ion-item>
          <ion-item v-if="isParticipant && selectedSectionTypeId">
            <ion-label position="floating" color="primary">Section</ion-label>
            <ion-spinner v-if="isLoadingSections"></ion-spinner>
            <div v-else-if="errorLoadingSections">Erreur : {{ errorLoadingSections.message }}</div>
            <ion-select v-else v-model="selectedSectionId" interface="popover" required>
              <ion-select-option v-for="section in sections" :key="section.id" :value="section.id"> {{ section.name }} ({{ section.city }}) </ion-select-option>
            </ion-select>
          </ion-item>

          <ion-item v-if="isAttendant">
            <ion-label position="floating" color="primary">Section</ion-label>
            <ion-spinner v-if="isLoadingAttendantSections"></ion-spinner>
            <div v-else-if="errorLoadingAttendantSections">Erreur : {{ errorLoadingAttendantSections.message }}</div>
            <ion-select v-else v-model="selectedAttendantSectionId" interface="popover" required>
              <ion-select-option v-for="attendantSection in attendantSections" :key="attendantSection.id" :value="attendantSection.id"> {{ attendantSection.name }} ({{ attendantSection.city }}) </ion-select-option>
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
import { useAttendantSections } from "@/composables/attendantSection";
import { usePlayerSections } from "@/composables/playerSection";
import { useCurrentUserProfile } from "@/composables/userProfile";
import { DEFAULT_ATTENDANT_SECTION_ID, DEFAULT_ROLE_VALUE, DEFAULT_PLAYER_SECTION_ID, DEFAULT_SECTION_TYPE_ID, ROLES } from "@/constants";
import { confirmPopup, errorPopup, toastPopup } from "@/utils/popup";
import { Section } from "@/types/Section";
import { getAttendantSection, getStaffSection } from "@/utils/attendantSection";
import { sanitizeInput } from "@/utils/form";
import { getPlayerSection } from "@/utils/playerSection";
import { updateUserProfile } from "@/utils/userProfile";
import { IonButton, IonCard, IonCardHeader, IonCardTitle, IonContent, IonInput, IonItem, IonLabel, IonList, IonNote, IonPage, IonSelect, IonSelectOption } from "@ionic/vue";
import { computed, ref } from "vue";
import { useRouter } from 'vue-router';

const router = useRouter();

// Strip Anonyme & Newbie from ROLES
const roles = Object.fromEntries(Object.entries(ROLES).filter(([, value]) => value !== ROLES.Anonyme && value !== ROLES.Newbie));

// reactive data

const name = ref('');
const selectedRole = ref(DEFAULT_ROLE_VALUE);
const selectedSectionTypeId = ref(DEFAULT_SECTION_TYPE_ID);
const selectedSectionId = ref(DEFAULT_PLAYER_SECTION_ID);
const selectedAttendantSectionId = ref(DEFAULT_ATTENDANT_SECTION_ID);
const nameError = ref(false);
const isUpdatingProfile = ref(false);

// composables & computed data

const currentUser = useCurrentUserProfile();
const appConfig = useAppConfig();
const { data: sections, pending: isLoadingSections, error: errorLoadingSections } = usePlayerSections(selectedSectionTypeId);

const isParticipant = computed(() => selectedRole.value === ROLES.Participant && name.value != "");
const isAttendant = computed(() => (selectedRole.value === ROLES.Animateur || selectedRole.value === ROLES.Chef) && name.value != "");
const { data: attendantSections, pending: isLoadingAttendantSections, error: errorLoadingAttendantSections } = useAttendantSections(false, isAttendant);

const canSubmit = computed(() => {
  if (!name.value) return false;
  if (isParticipant.value && selectedSectionTypeId.value != DEFAULT_SECTION_TYPE_ID && selectedSectionId.value != DEFAULT_PLAYER_SECTION_ID) return true
  if (isAttendant.value && selectedAttendantSectionId.value != DEFAULT_ATTENDANT_SECTION_ID) return true
  if (selectedRole.value >= ROLES.Organisateur) return true
  return false;
});

// methods

const handleRoleChange = () => {
    // Reset section and leaderSection values when changing the role
    selectedSectionTypeId.value = DEFAULT_SECTION_TYPE_ID
    selectedSectionId.value = DEFAULT_PLAYER_SECTION_ID
    selectedAttendantSectionId.value = DEFAULT_ATTENDANT_SECTION_ID
    if (!name.value) nameError.value = true;
}
const handleNameChange = () => {
    nameError.value = name.value ? false : true;
}

const processForm = (sectionData: Section) => {
  isUpdatingProfile.value = true;
  let newProfile = {};
  if (selectedRole.value === ROLES.Participant) {
    newProfile = {
      name: sanitizeInput(name.value),
      role: ROLES.Participant,
      sectionId: selectedSectionId.value,
      sectionName: sectionData.name,
      hasDoneOnboarding: true,
    };
  } else {
    newProfile = {
      name: sanitizeInput(name.value),
      requestedRole: selectedRole.value,
      requestedSectionId: selectedAttendantSectionId.value,
      requestedSectionName: sectionData.name,
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
  let sectionData: Section;

  // Check if all required fields are filled
  if (!name.value) return errorPopup('Mentionne au minium ton totem ou ton nom');
  if (selectedRole.value < ROLES.Participant) return errorPopup('Choisis un role');
  if (!selectedAttendantSectionId.value) return errorPopup('Choisis une section');

  try{
    // If the user is a participant
    if (selectedRole.value === ROLES.Participant){
      sectionData = await getPlayerSection(selectedSectionId.value);
      if (selectedSectionId.value) return processForm(sectionData);
      else return errorPopup('Choisis une section');
    }
  
    // If the user is an attendant
    if (selectedRole.value === ROLES.Animateur) {
        sectionData = await getAttendantSection(selectedAttendantSectionId.value);
        message = `Tu as choisi le role d'animateur. 
        Cela signifie qu'un•e des chefs de la section ${sectionData.name} ou un•e organisateur/organisatrice de la Baden Battle devra
        <b>valider ta demande</b> avant que tu ne puisses utiliser l'app.`;
    }
    if (selectedRole.value === ROLES.Chef) {
        sectionData = await getAttendantSection(selectedAttendantSectionId.value);
        message = `Tu as choisi le role de chef. 
        Cela signifie qu'un•e des chefs de la section ${sectionData.name} ou un•e organisateur/organisatrice de la Baden Battle devra
        <b>valider ta demande</b> avant que tu ne puisses utiliser l'app.`;
    }

    // If the user is from the staff
    if (selectedRole.value === ROLES.Organisateur) {
      [sectionData, selectedAttendantSectionId.value] = await getStaffSection()
      message = `Tu as choisi le role d'organisateur de la Baden Battle. 
      Cela signifie qu'une autre personne avec le rôle d'organisateur de la Baden Battle devra <b>valider ta demande</b> avant que tu ne puisses utiliser l'app.`;
    }
    if (selectedRole.value === ROLES.Administrateur) {
      [sectionData, selectedAttendantSectionId.value] = await getStaffSection()
      message = `Tu as choisi le role d'administrateur de l'application. 
      Cela signifie qu'une autre personne avec le rôle d'administrateur devra <b>valider ta demande</b> avant que tu ne puisses utiliser l'app.`;
    }
  } catch (error: any) {
    return errorPopup(`Une erreur est survenue : ${error.message}`);
  }
  message += ` Veux-tu continuer ?`
  const handler = () => processForm(sectionData);
  return confirmPopup(message, handler, null, 'Attention');
  // Handle form submission

  }

</script>

<style scoped>
</style>