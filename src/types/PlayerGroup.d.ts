import { GROUP_ROLES } from '@/constants';
import { Ref } from "vue"
import { VueFirestoreDocumentData } from "vuefire"
import { Group } from "./Group"

export interface PlayerGroup extends Group {
  number: number
  groupCategoryId: string
  teams: string[]
  nbTeams: number
  nbPlayers: number
  nbLeaders: number
  playersPerTeam: number
  meanScore: number
  score: number
  role: GROUP_ROLES.Player
}

export interface VueFirePlayerGroup extends PlayerGroup {
  readonly id: string
}
export type RefPlayerGroup = Ref<VueFirestoreDocumentData<PlayerGroup> | undefined>
