import { Ref } from "vue"
import { VueFirestoreDocumentData } from "vuefire"
import { Section } from "./Section"

export interface LeaderSection extends Section {
  isAttendant: true
  isStaff: boolean
}

export interface VueFireLeaderSection extends LeaderSection {
  readonly id: string
}
export type RefLeaderSection = Ref<VueFirestoreDocumentData<LeaderSection> | undefined>
