<template>
  <ion-page>
    <header-component page-title="Onboarding" />
    <ion-content :fullscreen="true" class="ion-padding">
      <refresher-component />
      <ion-card>
        <ion-card-header v-if="currentUser && currentUser.rejectionReason">
          <ion-card-title>Outch !</ion-card-title>
          <p style="color: var(--ion-color-dark)">
            Ta demande d'accès a été refusée.
            <br><br>
            {{ currentUser.rejectionReason }}
            <br><br>
            Tu peux réessayer ci-dessous.
          </p>
        </ion-card-header>
        <ion-card-header v-else>
          <ion-card-title>Bienvenue !</ion-card-title>
          <p>Avant d'aller plus loin, faisons connaissance.</p>
        </ion-card-header>
        <form @submit.prevent="submitForm" @keydown.enter="submitForm">
          <ion-list class="ion-no-padding">
            <ion-item>
              <ion-label position="floating" color="primary"> Totem / Nom </ion-label>
              <ion-input
                v-model="name"
                name="name"
                type="text"
                autocorrect="off"
                required
                @ion-change="handleNameChange"
              />
              <ion-note v-if="nameError" slot="error">
                Mentionne ton totem ou ton nom
              </ion-note>
            </ion-item>
            <ion-item>
              <ion-label position="floating" color="primary"> Quel sera ton role durant la Baden Battle ? </ion-label>
              <ion-select v-model="selectedRole" required interface="popover" @ion-change="handleRoleChange">
                <ion-select-option v-for="(value, roleName) in selectableRoles" :key="value" :value="value">
                  {{ roleName }}
                </ion-select-option>
              </ion-select>
            </ion-item>

            <ion-item v-if="isParticipant">
              <ion-label position="floating" color="primary"> Type de section </ion-label>
              <ion-select v-model="selectedgroupCategoryId" interface="popover" required>
                <ion-select-option v-for="(groupCategory, id) in appConfig?.groupCategories" :key="id" :value="id">
                  {{ groupCategory.name }}
                </ion-select-option>
              </ion-select>
            </ion-item>
            <ion-item v-if="isParticipant && selectedgroupCategoryId">
              <ion-label position="floating" color="primary"> Section </ion-label>
              <ion-spinner v-if="isLoadingPlayerGroups" />
              <div v-else-if="errorLoadingGroups">
                Erreur
              </div>
              <ion-select v-else v-model="selectedGroupId" interface="popover" required>
                <ion-select-option v-for="playerGroup in playerGroups" :key="playerGroup.id" :value="playerGroup.id">
                  {{ playerGroup.name }} ({{ playerGroup.city }})
                </ion-select-option>
              </ion-select>
            </ion-item>

            <ion-item v-if="isAttendant">
              <ion-label position="floating" color="primary"> Section </ion-label>
              <ion-spinner v-if="isLoadingAttendantGroups" />
              <div v-else-if="errorLoadingAttendantGroups">
                Erreur
              </div>
              <ion-select v-else v-model="selectedGroupId" interface="popover" required>
                <ion-select-option
                  v-for="attendantgroup in attendantGroups"
                  :key="attendantgroup.id"
                  :value="attendantgroup.id"
                >
                  {{ attendantgroup.name }} ({{ attendantgroup.city }})
                </ion-select-option>
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
import type { UserProfile } from '@/types'
import type { Group } from '@/types/Group'
import HeaderComponent from '@/components/HeaderComponent.vue'
import RefresherComponent from '@/components/RefresherComponent.vue'
import { useAppConfig } from '@/composables/app'
import { useAttendantGroups } from '@/composables/attendantGroup'
import { usePlayerGroups } from '@/composables/playerGroup'
import { useCurrentUserProfile } from '@/composables/userProfile'
import { DEFAULT_GROUP_CATEGORY_ID, DEFAULT_GROUP_ID, DEFAULT_USER_ROLE_VALUE, USER_ROLES } from '@/constants'
import { getGroup } from '@/utils/playerGroup'
import { confirmPopup, errorPopup, toastPopup } from '@/utils/popup'
import { updateUserProfile } from '@/utils/userProfile'
import {
  IonButton,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonContent,
  IonInput,
  IonItem,
  IonLabel,
  IonList,
  IonNote,
  IonPage,
  IonSelect,
  IonSelectOption,
  IonSpinner,
} from '@ionic/vue'
import DOMPurify from 'dompurify'
import { computed, ref, watch } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// Strip Erreur, Anonyme & Newbie from ROLES
const selectableRoles = Object.fromEntries(
  Object.entries(USER_ROLES).filter(
    ([, value]) => ![USER_ROLES.Erreur, USER_ROLES.Anonyme, USER_ROLES.Newbie].includes(value),
  ),
)

// reactive data

const name = ref('')
const selectedRole = ref(DEFAULT_USER_ROLE_VALUE)
const selectedgroupCategoryId = ref(DEFAULT_GROUP_CATEGORY_ID)
const selectedGroupId = ref(DEFAULT_GROUP_ID)
const nameError = ref(false)
const isUpdatingProfile = ref(false)

// composables & computed data

const currentUser = useCurrentUserProfile()
const appConfig = useAppConfig()
const {
  data: playerGroups,
  pending: isLoadingPlayerGroups,
  error: errorLoadingGroups,
} = usePlayerGroups(selectedgroupCategoryId)

const isParticipant = computed(() => selectedRole.value === USER_ROLES.Participant)
const isAttendant = computed(() => selectedRole.value >= USER_ROLES.Animateur)
const loadStaffGroups = computed(() => (selectedRole.value >= USER_ROLES.Organisateur ? 'only' : 'exclude'))
const {
  data: attendantGroups,
  pending: isLoadingAttendantGroups,
  error: errorLoadingAttendantGroups,
} = useAttendantGroups(isAttendant, loadStaffGroups, true, currentUser)

watch([errorLoadingGroups, errorLoadingAttendantGroups], (errors) => {
  if (errors[0]) {
    console.error('Error loading player groups:', errors[0])
  }
  if (errors[1]) {
    console.error('Error loading attendant groups:', errors[1])
  }
})

const canSubmit = computed(() => {
  if (!name.value) return false
  if (
    isParticipant.value
    && selectedgroupCategoryId.value !== DEFAULT_GROUP_CATEGORY_ID
    && selectedGroupId.value !== DEFAULT_GROUP_ID
  ) {
    return true
  }
  if (isAttendant.value && selectedGroupId.value !== DEFAULT_GROUP_ID) return true
  if (selectedRole.value >= USER_ROLES.Organisateur) return true
  return false
})

// methods

function handleRoleChange() {
  // Reset category, player group and attendant group values when changing the role
  selectedgroupCategoryId.value = DEFAULT_GROUP_CATEGORY_ID
  selectedGroupId.value = DEFAULT_GROUP_ID
  if (!name.value) nameError.value = true
}
function handleNameChange() {
  nameError.value = !name.value
}

function processForm(groupData: Group) {
  isUpdatingProfile.value = true
  let newProfile: Partial<UserProfile>
  if (selectedRole.value === USER_ROLES.Participant) {
    newProfile = {
      name: DOMPurify.sanitize(name.value),
      role: selectedRole.value,
      groupId: selectedGroupId.value,
      groupName: groupData.name,
      hasDoneOnboarding: true,
    }
  } else {
    newProfile = {
      name: DOMPurify.sanitize(name.value),
      requestedRole: selectedRole.value,
      requestedGroupId: selectedGroupId.value,
      requestedGroupName: groupData.name,
      hasDoneOnboarding: true,
    }
  }
  if (!currentUser.value) return errorPopup('currentUser not found', 'Impossible de mettre à jour le profil')
  updateUserProfile(currentUser.value.id, newProfile)
    .then(() => {
      toastPopup('Ton profil a été mis à jour')
      isUpdatingProfile.value = false
    })
    .catch((error: any) => {
      errorPopup(error.message, `Le profile n'a pas pu être mis à jour`)
      isUpdatingProfile.value = false
    })
    .finally(() => {
      router.replace({ name: 'home' })
    })
  console.log('Profile udpated', newProfile)
}

async function submitForm() {
  let message = ''
  let groupData: Group

  // Check if all required fields are filled
  if (!name.value) return errorPopup('Mentionne ton totem ou ton nom')
  if (selectedRole.value < USER_ROLES.Participant) return errorPopup('Choisis un role')
  if (!selectedGroupId.value) return errorPopup('Choisis une section')

  try {
    groupData = await getGroup(selectedGroupId.value)
  } catch (error: any) {
    return errorPopup(error.message, `Une erreur est survenue`)
  }
  switch (selectedRole.value) {
    case USER_ROLES.Participant:
      message = `Tu as choisi le role de participant.<br /><br />
      Cela signifie que tu participeras à la Baden Battle avec la section ${groupData.name}.`
      break
    case USER_ROLES.Animateur:
      message = `Tu as choisi le role d'animateur.<br /><br />
      Cela signifie qu'un•e des chefs de la section ${groupData.name} ou un•e organisateur/organisatrice de la Baden Battle devra
      <b>valider ta demande</b> avant que tu ne puisses utiliser l'app.`
      break
    case USER_ROLES.Chef:
      message = `Tu as choisi le role de chef.<br /><br />
      Cela signifie qu'un•e des chefs de la section ${groupData.name} ou un•e organisateur/organisatrice de la Baden Battle devra
      <b>valider ta demande</b> avant que tu ne puisses utiliser l'app.`
      break
    case USER_ROLES.Organisateur:
      message = `Tu as choisi le role d'organisateur de la Baden Battle.<br /><br />
      Cela signifie qu'une autre personne avec le rôle d'organisateur de la Baden Battle devra <b>valider ta demande</b> avant que tu ne puisses utiliser l'app.`
      break
    case USER_ROLES.Administrateur:
      message = `Tu as choisi le role d'administrateur de l'application.<br /><br />
      Cela signifie qu'une autre personne avec le rôle d'administrateur devra <b>valider ta demande</b> avant que tu ne puisses utiliser l'app.`
      break
  }
  const handler = () => processForm(groupData)
  return confirmPopup(message, handler, null, 'Continuer ?')
}
</script>

<style scoped></style>
