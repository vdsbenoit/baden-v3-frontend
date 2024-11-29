import { Ref } from "vue"
import { VueFirestoreDocumentData } from "vuefire"
import { Section } from "./Section"

export interface PlayerSection extends Section {
  isAttendant: false
  isStaff: false
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

export interface VueFirePlayerSection extends PlayerSection {
  readonly id: string
}
export type RefPlayerSection = Ref<VueFirestoreDocumentData<PlayerSection> | undefined>
