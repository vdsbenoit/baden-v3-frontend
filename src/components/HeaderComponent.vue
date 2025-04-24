<template>
  <ion-header :translucent="true">
    <ion-toolbar>
      <ion-buttons slot="start">
        <!-- back button -->
        <ion-back-button />
        <!-- menu button -->
        <ion-menu-button color="primary" />
      </ion-buttons>
      <ion-title>{{ props.pageTitle }}</ion-title>
      <ion-buttons slot="end">
        <slot />
        <!-- home button -->
        <ion-button class="ion-no-margin" href="/home" router-direction="root">
          <ion-icon slot="icon-only" color="primary" :icon="homeOutline" />
        </ion-button>
      </ion-buttons>
    </ion-toolbar>
  </ion-header>
</template>

<script setup lang="ts">
import {
  IonBackButton,
  IonButton,
  IonButtons,
  IonHeader,
  IonIcon,
  IonMenuButton,
  IonTitle,
  IonToolbar,
} from '@ionic/vue'
import { homeOutline } from 'ionicons/icons'
import { defineProps } from 'vue'

const props = defineProps(['pageTitle'])
</script>

<style scoped>
.can-go-back ion-menu-button {
  display: none;
}
</style>
