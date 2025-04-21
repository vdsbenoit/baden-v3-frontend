import type { Ref } from 'vue'
import type { VueFirestoreDocumentData } from 'vuefire'

export interface PlayerTeam {
  hash: string
  number: number // this is used by the distribution script
  groupCategoryId: string
  groupId: string
  groupNumber: number
  groupName: string
  groupCity: string
  nbPlayers: number
  matches: string[]
  ignoreScore: boolean
  score: number
}

export type VueFirePlayerTeam = PlayerTeam & { readonly id: string }
export type RefPlayerTeam = Ref<VueFirestoreDocumentData<PlayerTeam> | undefined>
