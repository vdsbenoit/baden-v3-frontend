<template>
  <ion-page>
    <header-component page-title="A propos" />
    <ion-content :fullscreen="true" class="ion-padding background-image">
      <div class="about-info">
        <ion-list lines="none" class="ion-padding-vertical" style="border-radius: 5px">
          <ion-item>
            <ion-icon slot="start" :icon="pin" />
            <ion-label style="white-space: pre-wrap">
              Collège St Vincent<br>
              Chaussée de Braine, 22<br>
              7060 Soignies
            </ion-label>
          </ion-item>

          <ion-item>
            <ion-icon slot="start" :icon="trophyOutline" />
            <ion-label>Scores</ion-label>
          </ion-item>

          <p class="ion-padding-start ion-padding-end">
            Chaque section est divisée en plusieurs équipes d'entre 5 et 10 joueurs. Les équipes s'affrontent à travers
            des duels durant toute la journée. Chaque victoire fait gagner 2 points à l'équipe gagnante. Chaque égalité
            fait gagner un point aux deux équipes. Les défaites n'affectent pas le score. A la fin de la journée, les 3
            équipes qui ont remporté le plus de points sont invitées à monter sur le podium. Il y a un podium par
            catégorie de section (par ex. un podium louveteaux, un podium Lutins, etc). Les champions de chaque podium
            remportent des prix.
          </p>

          <ion-item>
            <ion-icon slot="start" :icon="informationCircleOutline" />
            <ion-label>À propos de la Baden Battle</ion-label>
          </ion-item>

          <p class="ion-padding-start ion-padding-end">
            Il sʼagit dʼun grand rassemblement scout, guide et patro à destination des baladins, nutons, étincelles,
            lutins, louvettes, louveteaux et chevaliers (donc de 5 à 12 ans, filles et garçons). Celui-ci est organisé
            par le poste pionnier Peter Pan de Soignies. Durant toute la journée, les participants passent à travers de
            nombreuses activités opposant les sections entre elles sous forme de petites équipes. Le but ultime étant,
            évidemment, de gagner des défis ainsi que de nombreux prix. Les animations sont variées afin que tout le
            monde s'y retrouve: certaines sont physiques, d'autres intellectuelles ou même culturelles. La coopération
            sera de mise pour atteindre le podium! <br><br>

            Pour toute information complémentaire, n'hésitez pas à nous joindre sur notre
            <a href="https://www.facebook.com/badenbattle/">page Facebook</a> ou via notre
            <a href="mailto:infobadenbattle@gmail.com">adresse email</a>.
          </p>
          <div class="version-info">
            <span>{{ buildInfo.buildVersion }} - {{ buildDate }}</span>
          </div>
        </ion-list>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { buildInfo } from '@/app/buildinfo'
import HeaderComponent from '@/components/HeaderComponent.vue'
import { IonContent, IonIcon, IonItem, IonLabel, IonList, IonPage } from '@ionic/vue'
import { informationCircleOutline, pin, trophyOutline } from 'ionicons/icons'

const buildDate = new Date(buildInfo.buildDate).toLocaleString('fr-BE')
</script>

<style scoped>
.background-image {
  --background: url(@/assets/img/logo-bb.png) 50% 11%/80% no-repeat;
  background-color: var(--ion-background-color);
}
.logo img {
  max-width: 100%;
  max-height: 100%;
}
.about-info {
  margin-top: 43%;
}
.about-info p {
  color: var(--ion-color-dark);
  text-align: justify;
}
.about-info ion-icon {
  margin-left: 15px;
  margin-inline-end: 20px;
}
.version-info {
  color: var(--ion-color-medium);
  font-size: 12px;
  text-align: center;
}
</style>
