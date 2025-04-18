import { Ref } from "vue"
import { VueFirestoreDocumentData } from "vuefire"
import { VueFireUserProfile } from "./UserProfile"

export type Game = {
  hash: string
  number: number
  name: string
  circuit: string
  groupCategoryId: string
  attendants: { [timingId: string]: VueFireUserProfile[] }
  matches: string[]
  noScores: boolean
}

export type VueFireGame = Game & { readonly id: string }
export type RefGame = Ref<VueFirestoreDocumentData<Game> | undefined>
