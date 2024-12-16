<template>
  <ion-page>
    <header-template pageTitle="Demandes d'accès">
      <ion-button @click="setLimit">
        <ion-icon slot="icon-only" :ios="settingsOutline" :md="settingsSharp"></ion-icon>
      </ion-button>
    </header-template>
    <ion-content :fullscreen="true">
      <refresher-component></refresher-component>
      <!-- Show applicants from all sections to moderators -->
      <div v-if="canSeeModerationStuff">
        <div v-if="isLoadingAttendantSections" class="not-found" style="background: transparent">
          <ion-spinner></ion-spinner>
        </div>
        <div v-else-if="errorLoadingAttendantSections" class="not-found">
          <strong class="capitalize">Houston, nous avons une erreur</strong>
          <ion-text color="error">{{ errorLoadingAttendantSections.message }}</ion-text>
        </div>
        <applicant-card
          v-else
          v-for="attendantSection in attendantSections"
          :key="attendantSection.id"
          :attendant-section-id="attendantSection.id"
          :attendant-section-name="attendantSection.name"
          :attendant-section-city="attendantSection.city"
          :limit="limit"
          @has-applicants="(hasApplicants: boolean) => countCardsWithApplicants += hasApplicants ? 1 : -1"
        />
      </div>
      <!-- Show applicants from the current user section to leaders -->
      <div v-else>
        <div v-if="isLoadingCurrentUserData" class="not-found" style="background: transparent">
          <ion-spinner></ion-spinner>
        </div>
        <div v-else-if="errorCurrentUserData" class="not-found">
          <strong class="capitalize">Houston, nous avons une erreur</strong>
          <ion-text color="error">{{ errorCurrentUserData.message }}</ion-text>
        </div>
        <applicant-card
          v-else-if="currentUserAttendantSection"
          :attendant-section-id="currentUserSectionId"
          :attendant-section-name="currentUserAttendantSection.name"
          :attendant-section-city="currentUserAttendantSection.city"
          :limit="limit"
          @has-applicants="(v:boolean) => hasApplicantsCurrentUserSection = v"
        />
        <div v-else class="not-found">
          <h2 class="ion-text-center ion-align-items-center">Erreur lors de chargement de ta section</h2>
        </div>
      </div>
      <div v-if="isNoApplicants" class="not-found">
        <h2 class="ion-text-center ion-align-items-center">Pas de demandes d'accès</h2>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import HeaderTemplate from "@/components/HeaderTemplate.vue"
import RefresherComponent from "@/components/RefresherComponent.vue"
import ApplicantCard from "@/components/ApplicantCard.vue"
import { useAttendantSection, useAttendantSections } from "@/composables/attendantSection"
import { useCanSeeModerationStuff } from "@/composables/rights"
import { useCurrentUserProfile } from "@/composables/userProfile"
import { DEFAULT_ATTENDANT_SECTION_ID } from "@/constants"
// prettier-ignore
import { alertController, AlertInput, IonButton, IonContent, IonIcon, IonPage, IonSpinner, IonText } from "@ionic/vue";
import { computed, ref } from "@vue/reactivity"
import { settingsOutline, settingsSharp } from "ionicons/icons"

// reactive data

const limit = ref(5)
const countCardsWithApplicants = ref(0)
const hasApplicantsCurrentUserSection = ref(true)
const isNoApplicants = computed(() => {
  return countCardsWithApplicants.value === 0 && !hasApplicantsCurrentUserSection.value
})

// composables

const canSeeModerationStuff = useCanSeeModerationStuff()
const {
  data: attendantSections,
  pending: isLoadingAttendantSections,
  error: errorLoadingAttendantSections
} = useAttendantSections(false, canSeeModerationStuff)
const { data: currentUser, pending: isLoadingCurrentUser, error: errorLoadingCurrentUser } = useCurrentUserProfile()
const currentUserSectionId = computed(() => {
  if (!currentUser.value || !currentUser.value.sectionId) return DEFAULT_ATTENDANT_SECTION_ID
  return currentUser.value.sectionId
})
const {
  data: currentUserAttendantSection,
  pending: isLoadingCurrentUserAttendantSection,
  error: errorLoadingCurrentUserAttendantSection
} = useAttendantSection(currentUserSectionId)

// Computed

const isLoadingCurrentUserData = computed(() => isLoadingCurrentUser || isLoadingCurrentUserAttendantSection)
const errorCurrentUserData = computed(
  () => errorLoadingCurrentUser.value ?? errorLoadingCurrentUserAttendantSection.value
)

// Methods

/**
 * @description Set the number of users to display
 */
const setLimit = async () => {
  const inputs = [] as AlertInput[]
  const options = [5, 10, 25]
  options.forEach((option: number) => {
    inputs.push({
      type: "radio",
      label: option.toString(),
      value: option,
      handler: () => {
        limit.value = option
      },
      checked: option === limit.value
    })
  })
  const alert = await alertController.create({
    header: "Afficher combien d'utilisateurs par section ?",
    inputs: inputs,
    buttons: ["OK"]
  })
  await alert.present()
}
</script>
<style scoped></style>
