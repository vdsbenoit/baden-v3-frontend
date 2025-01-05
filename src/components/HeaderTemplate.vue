<template>
  <ion-header :translucent="true">
    <ion-toolbar>
      <ion-buttons slot="start">
        <ion-back-button></ion-back-button>
        <slot></slot>
      </ion-buttons>
      <ion-title>{{ props.pageTitle }}</ion-title>
      <ion-buttons slot="end">
        <ion-button class="ion-no-margin" href="/home" router-direction="root">
          <ion-icon color="primary" :icon="homeOutline" :md="homeSharp" slot="icon-only"></ion-icon>
        </ion-button>
        <ion-menu-button color="primary" :auto-hide="false"></ion-menu-button>
      </ion-buttons>
    </ion-toolbar>
  </ion-header>
</template>

<script setup lang="ts">
import { IonButtons, IonHeader, IonMenuButton, IonTitle, IonToolbar, IonBackButton } from "@ionic/vue";
import { homeOutline, homeSharp } from "ionicons/icons";
import { defineProps } from "vue";
const props = defineProps(["pageTitle"]);
</script>
<style scoped>
.can-go-back ion-menu-button {
  display: none;
}
</style>
