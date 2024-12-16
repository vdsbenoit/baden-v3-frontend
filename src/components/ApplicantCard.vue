<template>
    <ion-card v-if="isLoadingApplicants || errorLoadingApplicants || applicants.length > 0"> 
      <ion-card-header>
        <ion-card-title>{{ attendantSectionName }} ({{ attendantSectionCity }})</ion-card-title>
      </ion-card-header>
      <ion-card-content class="ion-no-padding ion-padding-vertical">
        <div v-if="isLoadingApplicants" class="not-found" style="background: transparent">
          <ion-spinner></ion-spinner>
        </div>
        <div v-else-if="errorLoadingApplicants" class="not-found">
          <strong class="capitalize">Houston, nous avons une erreur</strong>
          <ion-text color="error">{{ errorLoadingApplicants.message }}</ion-text>
        </div>
        <ion-list lines="full">
          <ion-item v-for="applicant in applicants" :key="applicant.id" @click="handleRequest(applicant)">
            <ion-label>
              <ion-text style="font-weight: bold">{{ applicant.name }} </ion-text>
              <ion-text> ({{ applicant.email }})</ion-text>
            </ion-label>
            <ion-badge slot="end" :color="badgeColor(applicant)"> {{ getRoleByValue(applicant.requestedRole ?? -1) }} </ion-badge>
          </ion-item>
        </ion-list>
      </ion-card-content>
    </ion-card>
</template>

<script lang="ts" setup>
import { useCurrentUserProfile, useSectionApplicants } from "@/composables/userProfile"
import { DEFAULT_ROLE_VALUE, ROLES } from "@/constants";
import { VueFireUserProfile } from "@/types"
import { defineProps, defineEmits, watch } from "vue"
import { getRoleByValue, updateUserProfile } from "@/utils/userProfile";
import { choicePopup, errorPopup, textInputPopup } from "@/services/popup";

const props = defineProps<{
  attendantSectionId: string
  attendantSectionName: string
  attendantSectionCity: string
  limit: number
}>()
const emit = defineEmits(["hasApplicants"])

// composables

const currentUser = useCurrentUserProfile();
const {
  data: applicants,
  pending: isLoadingApplicants,
  error: errorLoadingApplicants
} = useSectionApplicants(props.limit, props.attendantSectionId)

// watchers

watch(applicants, (newApplicants) => {
  if (newApplicants && newApplicants.length < 1 && !errorLoadingApplicants.value) {
    emit("hasApplicants", false)
  } else emit("hasApplicants", true)
})

// methods

/**
 * Returns the color of the badge based on the user's requested role.
 *
 * @param {VueFireUserProfile} user - The user object.
 * @returns {string} - The Ionic color of the badge.
 */
const badgeColor = (user: VueFireUserProfile) => {
  switch (user.requestedRole) {
    case ROLES.Animateur:
      return "success";
    case ROLES.Chef:
      return "primary";
    case ROLES.Organisateur:
      return "warning";
    case ROLES.Administrateur:
      return "danger";
    default:
      return "medium";
  }
}

/**
 * Handles the request for an applicant.
 *
 * @param {VueFireUserProfile} applicant - The applicant's profile.
 *
 * This function performs the following steps:
 * 1. Checks if the current user is available. If not, displays an error popup.
 * 2. Checks if the applicant's requested role is defined. If not, displays an error popup.
 * 3. Constructs a message based on the applicant's requested role.
 * 4. Displays an error popup if the role does not exist.
 * 5. Defines choices for the popup and a reason message for rejection.
 * 6. Defines handlers for accepting and rejecting the request.
 * 7. Displays a choice popup with the constructed message and handles the user's choice.
 *
 * @param applicant - The applicant object.
 */

const handleRequest = (applicant: VueFireUserProfile) => {
  if (!currentUser.value) {
    errorPopup("Impossible de récupérer les informations de l'utilisateur actuel");
    return;
  }
  if (!applicant.requestedRole) {
    errorPopup(`requestedRole n'est pas défini pour ${applicant.name}`);
    return;
  }
  let message = "";
  if (applicant.requestedRole === ROLES.Animateur || applicant.requestedRole === ROLES.Chef) {
    message = `Tu es sur le point d'ajouter ${applicant.name} (${applicant.email})
    comme <b>${getRoleByValue(applicant.requestedRole)}</b> de la section ${props.attendantSectionName}.`;
  }
  if (applicant.requestedRole >= ROLES.Organisateur){
    message = `Tu es sur le point d'ajouter ${applicant.name} (${applicant.email})
    comme <b>${getRoleByValue(applicant.requestedRole)}</b> de la Baden Battle.`;
  }
  if (!message) {
    errorPopup(`Ce rôle n'existe pas (${applicant.requestedRole})`);
    return;
  }
  const choices = ["Accepter", "Refuser", "Annuler"]
  const reasonMessage = `Pourquoi refuse-tu la demande de ${applicant.name} ?`;
  const acceptHandler = () => {
    updateUserProfile(applicant.id, { 
          role: applicant.requestedRole,
          sectionId: applicant.requestedSectionId,
          sectionName: applicant.requestedSectionName,
          requestedRole: DEFAULT_ROLE_VALUE,
          requestedSectionId: "",
          rejectionReason: "" 
    });
    
  }
  const rejectHandler = (reason: string) => {
    const fullReason = `${currentUser.value?.name} (${getRoleByValue(currentUser.value?.role ?? -1)}) : "${reason}"`;
    updateUserProfile(applicant.id, {  requestedRole: -1, requestedSectionId: "", rejectionReason: fullReason, hasDoneOnboarding: false });
  }
  const choicePopupHandler = (choice: string) => {
    switch (choice) {
      case "Accepter":
        acceptHandler();
        break;
      case "Refuser":
        textInputPopup(reasonMessage, rejectHandler, "Raison", "Brève explication");
        break;
      default:
        break;
    }
  }
  choicePopup("Continuer?", choices, choicePopupHandler, "", message);
}
</script>

<style scoped></style>
