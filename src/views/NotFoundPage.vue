<template>
  <ion-page>
    <header-component page-title="404" />
    <ion-content :fullscreen="true">
      <div class="not-found">
        <strong class="capitalize">C'est page n'existe pas ou plus</strong>
        <p>Retour à <a @click="router.go(-1)">la page précédente</a></p>
        <p>Retour à <a @click="router.replace('/home')">l'accueil</a></p>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import HeaderComponent from '@/components/HeaderComponent.vue'
import { IonContent, IonPage } from '@ionic/vue'
import { useRouter } from 'vue-router'

const router = useRouter()
</script>

<style scoped></style>
