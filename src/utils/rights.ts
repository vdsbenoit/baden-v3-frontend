import { USER_ROLES } from "@/constants"
import { VueFireUserProfile } from "@/types"

export function canBeRegistered(targetUser: VueFireUserProfile) {
  if (targetUser.role === USER_ROLES.Animateur || targetUser.role === USER_ROLES.Chef) return true
  console.log("The target user does not have the right role to be an attendant")
  return false
}
