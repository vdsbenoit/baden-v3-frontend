import { Ref } from "vue"
import { VueFirestoreDocumentData} from "vuefire"

export type Team = {
  hash: string
  number: number // this is used by the distribution script
  sectionTypeId: string
  sectionId: string
  section: VueFirePlayerSection
  nbPlayers: number
  matches: string[]
  ignoreScore: boolean
  score: number
}

export type VueFireTeam = Team & { readonly id: string }
export type RefTeam = Ref<VueFirestoreDocumentData<Team> | undefined>
