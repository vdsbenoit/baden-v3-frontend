import { Ref } from "vue"
import { VueFirestoreDocumentData } from "vuefire"

interface TimeSlot {
  start: string
  stop: string
}
// check the backend before changing this interface (especially generate_game_roadmaps)
export interface AttendantTimeSlot extends TimeSlot {
  id: string
  name: string
}
export type GroupCategory = {
  name: string
  minPlayersPerTeam: number
  maxPlayersPerTeam: number
  breaks: { [time: number]: string } // time is the index of the break in the playerSchedule. the string is the name of the break
}
export type AppConfig = {
  groupCategories: { [id: string]: GroupCategory }
  circuits: { [id: string]: string } // for instance { "A": groupCategoryId }
  playerSchedule: TimeSlot[]
  attendantSchedule: AttendantTimeSlot[]
}
export type RefAppConfig = Ref<VueFirestoreDocumentData<AppConfig> | undefined>
