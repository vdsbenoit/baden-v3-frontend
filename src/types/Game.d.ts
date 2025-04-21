import type { Ref } from 'vue'
import type { VueFirestoreDocumentData } from 'vuefire'
import type { VueFireUserProfile } from './UserProfile'

export interface Game {
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
