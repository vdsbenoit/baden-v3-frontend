<template>
  <ion-page>
    <header-component page-title="Accueil" />
    <ion-content :fullscreen="true">
      <refresher-component />
      <div class="homepage-logo">
        <img src="@/assets/img/logo-bb.png" alt="Logo Baden Battle">
      </div>
      <div class="container ion-padding">
        <p>Pour accéder à l'app, il faut d'abord</p>
        <ion-button class="ion-text-lowercase" color="primary" @click="router.push('/login')">
          te connecter
        </ion-button>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import HeaderComponent from '@/components/HeaderComponent.vue'
import RefresherComponent from '@/components/RefresherComponent.vue'
import { IonButton, IonContent, IonPage } from '@ionic/vue'
import { useRouter } from 'vue-router'

const router = useRouter()
</script>

<style scoped>
.container {
  text-align: center;
}
h1 {
  color: var(--ion-color-primary);
  font-size: 40px;
}
p {
  line-height: 30px;
}
</style>
