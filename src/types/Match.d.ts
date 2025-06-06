import type { Ref } from 'vue'
import type { VueFirestoreDocumentData } from 'vuefire'

export interface Match {
  gameId: string
  gameNumber: number
  gameName: string
  time: number
  GroupCategoryId: string
  playerTeamIds: string[]
  playerNumbers: number[]
  winnerTeamId: string
  loserTeamId: string
  draw: boolean
  reporter: string
  lastModified: string
  noScores: boolean
}

export type VueFireMatch = Match & { readonly id: string }
export type RefMatch = Ref<VueFirestoreDocumentData<Match> | undefined>
