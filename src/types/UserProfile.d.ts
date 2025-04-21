import type { Ref } from 'vue'
import type { VueFirestoreDocumentData } from 'vuefire'
import type { VueFireGame } from './Game'

export interface UserProfile {
  creationDate: Timestamp
  lastLogin: Timestamp
  email: string
  name: string
  role: number
  hasDoneOnboarding: boolean
  requestedRole?: number
  requestedGroupId?: string
  requestedGroupName?: string
  rejectionReason?: string
  groupId?: string
  groupName?: string
  teamId?: string // if it's a player
  games?: { [timingId: string]: VueFireGame } // if it's an attendant
  settings?: any
}

export type VueFireUserProfile = UserProfile & { readonly id: string }
export type RefUserProfile = Ref<VueFirestoreDocumentData<UserProfile> | undefined>
