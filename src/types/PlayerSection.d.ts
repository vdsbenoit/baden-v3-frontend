import { Ref } from "vue"
import { VueFirestoreDocumentData } from "vuefire"
import { Section } from "./Section"

export interface PlayerSection extends Section {
  number: number
  sectionTypeId: string
  teams: string[]
  nbTeams: number
  nbPlayers: number
  nbLeaders: number
  playersPerTeam: number
  meanScore: number
  score: number
  isAttendant: false
  isStaff: false
}

export interface VueFirePlayerSection extends PlayerSection {
  readonly id: string
}
export type RefPlayerSection = Ref<VueFirestoreDocumentData<PlayerSection> | undefined>
