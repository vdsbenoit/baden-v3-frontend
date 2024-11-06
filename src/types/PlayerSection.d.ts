import { Ref } from "vue"
import { VueFirestoreDocumentData } from "vuefire"
import { Section } from "./Section"

export interface PlayerSection extends Section {
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

export interface VueFireSection extends PlayerSection {
  readonly id: string
}
export type RefSection = Ref<VueFirestoreDocumentData<PlayerSection> | undefined>
