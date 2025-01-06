<template>
  <ion-page>
    <header-component pageTitle="Accueil"></header-component>
    <ion-content :fullscreen="true">
      <refresher-component></refresher-component>
      <div class="logo">
        <img src="@/assets/img/logo-bb.png" alt="Logo Baden Battle" />
      </div>
      <div class="container ion-padding">
        <p>Pour accéder à l'app, il faut d'abord</p>
        <ion-button class="ion-text-lowercase" color="primary" @click="router.push('/login')">te connecter</ion-button>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { IonContent, IonPage, IonButton,} from "@ionic/vue";
import HeaderComponent from "@/components/HeaderComponent.vue";
import { useRouter } from "vue-router";
import RefresherComponent from "@/components/RefresherComponent.vue";

const router = useRouter();
</script>

<style scoped>
.logo {
  background-color: var(--ion-background-color);
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
  padding: min(1%, 20px);
  width: 100%;
  height: 30%;
  margin-bottom: 20px;
  margin-top: 10px;
}
.logo img {
  max-width: 100%;
  max-height: 100%;
}
.container{
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
