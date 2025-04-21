import type { VueFireUserProfile } from '@/types'
import { USER_ROLES } from '@/constants'

export function canBeRegistered(targetUser: VueFireUserProfile) {
  if (targetUser.role === USER_ROLES.Animateur || targetUser.role === USER_ROLES.Chef) return true
  console.debug('The target user does not have the right role to be an attendant')
  return false
}
