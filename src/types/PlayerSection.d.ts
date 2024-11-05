import { Ref } from "vue"
import { VueFirestoreDocumentData } from "vuefire"
import { Section } from "./Section"

export interface AttendantSection extends Section {
  sectionTypeId: number
  scores: number[]
  score: number
  teams: string[]
  nbPlayers: number
  nbLeaders: number
  nbTeams: number
  playersPerTeam: number
  meanScore: number
}

export interface VueFireSection extends AttendantSection {
  readonly id: string
}
export type RefSection = Ref<VueFirestoreDocumentData<AttendantSection> | undefined>
