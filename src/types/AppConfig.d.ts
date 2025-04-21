import type { Ref } from 'vue'
import type { VueFirestoreDocumentData } from 'vuefire'

interface TimeSlot {
  start: string
  stop: string
}
// check the backend before changing this interface (especially generate_game_roadmaps)
export interface AttendantTimeSlot extends TimeSlot {
  id: string
  name: string
}
export interface GroupCategory {
  name: string
  minPlayersPerTeam: number
  maxPlayersPerTeam: number
  breaks: { [time: number]: string } // time is the index of the break in the playerSchedule. the string is the name of the break
}
export interface AppConfig {
  groupCategories: { [id: string]: GroupCategory }
  circuits: { [id: string]: string } // for instance { "A": groupCategoryId }
  playerSchedule: TimeSlot[]
  attendantSchedule: AttendantTimeSlot[]
}
export type RefAppConfig = Ref<VueFirestoreDocumentData<AppConfig> | undefined>
