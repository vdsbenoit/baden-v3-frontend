<template>
  <ion-page>
    <header-template pageTitle="Derniers utilisateurs">
      <ion-button @click="setLimit"><ion-icon slot="icon-only" :ios="settingsOutline" :md="settingsSharp"></ion-icon></ion-button>
    </header-template>
    <ion-content :fullscreen="true" class="ion-padding">
      <refresher-component></refresher-component>
      <div v-if="isLoadingUsers" class="ion-text-center" style="background: transparent">
        <ion-spinner></ion-spinner>
      </div>
      <div v-if="!latestUsers || latestUsers.length < 1" class="not-found">
        <h2 class="ion-text-center ion-align-items-center">Pas d'utilisateurs</h2>
      </div>
      <ion-list v-else>
        <div v-for="user in latestUsers" :key="user.id">
          <div v-if="user.id === editedUid">
            <ion-item>
              <ion-label :routerLink="`/profile/${user.id}`">
                <ion-text style="font-weight: bold">{{ getUserName(user) }}</ion-text>
              </ion-label>
              <ion-select v-model="editedRole" cancel-text="Annuler" interface="popover">
                <ion-select-option v-for="(value, role) in roles" :key="value" :value="value">{{ role }}</ion-select-option>
              </ion-select> 
              <ion-button @click="setRole(user.id)" color="success"><ion-icon slot="icon-only" :ios="checkmarkOutline" :md="checkmarkSharp"></ion-icon></ion-button>
              <ion-icon @click="toggleEditRole(null)" slot="end" :ios="pencilOutline" :md="pencilSharp"></ion-icon>
            </ion-item>
          </div>
          <div v-else>
            <ion-item>
              <ion-label :routerLink="`/profile/${user.id}`">
                <ion-text style="font-size: small;">{{ parseDate(user.creationDate) }}</ion-text>
                <ion-text style="font-weight: bold"  class="ion-padding-start">{{ getUserName(user) }} </ion-text>
              </ion-label>
              <ion-input slot="end" type="text" readonly="true">{{ getRoleByValue(user.role) }}</ion-input>
              <ion-icon @click="toggleEditRole(user)" slot="end" :ios="pencilOutline" :md="pencilSharp"></ion-icon>
            </ion-item>
          </div>
        </div>
      </ion-list>

    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { IonContent, IonPage, IonIcon, IonText, IonSelect, IonSelectOption, IonSpinner, IonItem, IonList, IonLabel, IonButton, alertController, AlertInput} from "@ionic/vue";
import { pencilOutline, pencilSharp, checkmarkOutline, checkmarkSharp, settingsOutline, settingsSharp} from "ionicons/icons";
import HeaderTemplate from "@/components/HeaderTemplate.vue";
import RefresherComponent from "@/components/RefresherComponent.vue";
import { useLatestUsers } from "@/composables/userProfile";
import { USER_ROLES } from "@/constants";
import { ref, watch } from "vue";
import { FirestoreError } from "firebase/firestore";
import { toastPopup } from "@/utils/popup";
import { VueFireUserProfile } from "@/types";
import { getRoleByValue, getUserName, updateUserProfile } from "@/utils/userProfile";

// Strip Erreur, Anonyme & Newbie from ROLES
const roles = Object.fromEntries(Object.entries(USER_ROLES).filter(([, value]) => ![USER_ROLES.Erreur, USER_ROLES.Anonyme, USER_ROLES.Newbie].includes(value)))

// reactive data
const limit = ref(15);
const editedUid = ref("");
const editedRole = ref(0);

// Composables

const {data: latestUsers, pending: isLoadingUsers, error: errorLoadingUsers} = useLatestUsers(limit);

// Watchers

watch(errorLoadingUsers, (error) => {
  if (error) {
    console.error(error);
  }
});
watch(errorLoadingUsers, (error: FirestoreError | undefined) => {
  if (error) {
    toastPopup("Erreur lors du chargement des utilisateurs");
    console.error(`Error loading users: ${error.message}`);
  }
});

// Methods

const parseDate = (timestamp: any) => {
  const date = timestamp.toDate();
  return date.toLocaleString("fr-BE");
}
const toggleEditRole = (user: VueFireUserProfile | null) => {
  if (user) {
    editedUid.value = user.id;
    editedRole.value = user.role;
  } else {
    editedUid.value = "";
    editedRole.value = 0;
  }
};
/**
 * @description Set the role of the user
 * @param uid The user id
 */
const setRole = (uid: string) => {
  updateUserProfile(uid, { role: editedRole.value });
  toggleEditRole(null);
};
/**
 * @description Set the number of users to display
 */
const setLimit = async () => {
  const inputs = [] as AlertInput[];
  const options = [15, 50, 100, 500]
  options.forEach((option: number) => {
    inputs.push({
      type: 'radio',
      label: option.toString(),
      value: option,
      handler: () => {
        limit.value = option;
      },
      checked: option === limit.value,
    }) 
  })
  const alert = await alertController.create({
    header: "Afficher combien d'utilisateurs ?",
    inputs: inputs,
    buttons: ["OK"],
  });
  await alert.present();
}
</script>
<style scoped></style>
