<template>
  <ion-refresher slot="fixed" @ion-refresh="handleRefresh()">
    <ion-refresher-content />
  </ion-refresher>
</template>

<script setup lang="ts">
import { IonRefresher, IonRefresherContent } from '@ionic/vue'

function handleRefresh() {
  window.location.reload()
}
</script>

<style scoped></style>
