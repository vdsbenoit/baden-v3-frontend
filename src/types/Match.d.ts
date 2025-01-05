import { Ref } from "vue"
import { VueFirestoreDocumentData} from "vuefire"

export type Match = {
  gameId: string
  gameNumber: number
  gameName: string
  time: number
  playerIds: string[]
  playerNumbers: number[]
  winner: string
  loser: string
  draw: boolean
  reporter: string
  lastModified: string
  noScores: boolean
}

export type VueFireMatch = Match & { readonly id: string }
export type RefMatch = Ref<VueFirestoreDocumentData<Match> | undefined>
