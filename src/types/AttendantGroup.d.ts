import { Ref } from "vue"
import { VueFirestoreDocumentData } from "vuefire"
import { Group } from "./Group"
import { GROUP_ROLES } from "@/constants"

export interface AttendantGroup extends Group {
  isAttendant: true
  role: GROUP_ROLES.Attendant
}

export interface VueFireAttendantGroup extends AttendantGroup {
  readonly id: string
}
export type RefAttendantGroup = Ref<VueFirestoreDocumentData<AttendantGroup> | undefined>
