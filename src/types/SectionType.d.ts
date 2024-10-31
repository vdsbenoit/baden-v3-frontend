import { Ref } from "vue"
import { VueFirestoreDocumentData} from "vuefire"

export type SectionType = {
  name: string
  minPlayersPerTeam: number
  maxPlayersPerTeam: number
  nbGamesPerCircuit: number
}

export type VueFireSection = Section & { readonly id: string }
export type RefSection = Ref<VueFirestoreDocumentData<Section> | undefined>
