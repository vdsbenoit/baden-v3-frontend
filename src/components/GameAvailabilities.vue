<template>
  <div>
    <div v-for="(availability, i) in availabilities" :key="i">
      <ion-badge slot="end" class="ion-no-margin" :color="availability.color">
        {{ availability.nbAttendants }}
      </ion-badge>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useAppConfig, useAppSettings } from "@/composables/app"
import { Game } from "@/types"
import { computed, defineProps } from "vue"

// Props

const props = defineProps<{
  game: Game
}>()

// Composables

const appSettings = useAppSettings()
const appConfig = useAppConfig()

// Computed data

const maxGameAttendants = computed(() => {
  if (!appSettings.value) return 2
  return appSettings.value?.maxGameAttendants
})
const attendantSchedule = computed(() => appConfig.value?.attendantSchedule ?? [])

const availabilities = computed(() => {
  const data = []
  for (const timeSlot of attendantSchedule.value) {
    const nbAttendants = props.game.attendants[timeSlot.id].length
    let color = "success"
    if (nbAttendants === 0) color = "danger"
    if (nbAttendants < maxGameAttendants.value) color = "warning"
    data.push({ nbAttendants, color })
  }
  return data
})
</script>

<style scoped></style>
