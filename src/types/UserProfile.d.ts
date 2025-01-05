import { Ref } from "vue"
import { VueFirestoreDocumentData } from "vuefire"

export type UserProfile = {
  creationDate: Timestamp
  email: string
  name: string
  role: number
  hasDoneOnboarding: boolean
  requestedRole?: number
  requestedSectionId?: string
  requestedSectionName?: string
  rejectionReason?: string
  sectionId?: string
  sectionName?: string
  teamId?: string // if it's a player
  games?: { [timingId: string]: string }  // if it's an attendant
  settings?: any
}

export type VueFireUserProfile = UserProfile & { readonly id: string }
export type RefUserProfile = Ref<VueFirestoreDocumentData<UserProfile> | undefined>
