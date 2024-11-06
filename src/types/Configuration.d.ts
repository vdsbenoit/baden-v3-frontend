import { Ref } from "vue"
import { VueFirestoreDocumentData} from "vuefire"

interface TimeSlot {
  start: string;
  stop: string;
}
interface Break extends TimeSlot {
  name: string;
}
// check the backend before changing this interface (especially generate_game_roadmaps)
interface AttendantTimeSlot extends TimeSlot  {
  id: string;
  name: string;
}
export type SectionType = {
  name: string
  minPlayersPerTeam: number
  maxPlayersPerTeam: number
}

export type AppConfig = {
  sectionTypes: { [id: string]: SectionType } 
  circuits: { [id: string]: string } // for instance { "A": sectionTypeId }
  nbGamesPerCircuit: number
  playerSchedule: TimeSlot[]
  breaks: { [position: number]: Break[] }
  attendantSchedule: AttendantTimeSlot[];
}
export type RefAppConfig = Ref<VueFirestoreDocumentData<AppConfig> | undefined>
