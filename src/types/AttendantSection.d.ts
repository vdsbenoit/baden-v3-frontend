import { Ref } from "vue"
import { VueFirestoreDocumentData } from "vuefire"
import { Section } from "./Section"

export interface AttendantSection extends Section {
  isAttendant: true
  isStaff: boolean
}

export interface VueFireAttendantSection extends AttendantSection {
  readonly id: string
}
export type RefAttendantSection = Ref<VueFirestoreDocumentData<AttendantSection> | undefined>
